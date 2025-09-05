import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Modal,
  Alert,
  ScrollView,
  Platform,
  Vibration,
} from 'react-native';
import { captureScreen } from 'react-native-view-shot';
import DeviceInfo from 'react-native-device-info';
import styles from './styles/FeedbackModalStyles';

export interface FeedbackData {
  userId?: string;
  category: 'bug' | 'feature' | 'ui_ux' | 'general';
  rating: number;
  message: string;
  screenshot?: string;
  deviceInfo: any;
  appVersion: string;
  timestamp: Date;
}

interface FeedbackModalProps {
  visible: boolean;
  onSubmit: (feedback: FeedbackData) => void;
  onClose: () => void;
  allowScreenshot?: boolean;
  categories?: Array<'bug' | 'feature' | 'ui_ux' | 'general'>;
  userId?: string;
}

const CATEGORY_LABELS = {
  bug: '🐛 버그 신고',
  feature: '💡 기능 요청',
  ui_ux: '🎨 UI/UX 개선',
  general: '💬 일반 피드백',
};

const RATING_LABELS = {
  1: '😞 매우 불만',
  2: '😐 불만',
  3: '🙂 보통',
  4: '😊 만족',
  5: '😍 매우 만족',
};

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  visible,
  onSubmit,
  onClose,
  allowScreenshot = true,
  categories = ['bug', 'feature', 'ui_ux', 'general'],
  userId,
}) => {
  const [category, setCategory] = useState<FeedbackData['category']>('general');
  const [rating, setRating] = useState<number>(3);
  const [message, setMessage] = useState<string>('');
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [screenshotTaken, setScreenshotTaken] = useState<boolean>(false);

  const messageInputRef = useRef<TextInput>(null);

  const handleClose = () => {
    // Reset form
    setCategory('general');
    setRating(3);
    setMessage('');
    setScreenshot(null);
    setScreenshotTaken(false);
    setIsSubmitting(false);
    onClose();
  };

  const takeScreenshot = async () => {
    if (!allowScreenshot) {return;}

    try {
      // Haptic feedback
      if (Platform.OS === 'ios') {
        Vibration.vibrate(100);
      }

      const uri = await captureScreen({
        format: 'png',
        quality: 0.8,
      });

      setScreenshot(uri);
      setScreenshotTaken(true);

      Alert.alert(
        '스크린샷 첨부됨',
        '피드백에 현재 화면이 첨부되었습니다.',
        [{ text: '확인' }]
      );
    } catch (error) {
      console.error('Screenshot failed:', error);
      Alert.alert(
        '스크린샷 실패',
        '화면을 캡처하는 중 오류가 발생했습니다.',
        [{ text: '확인' }]
      );
    }
  };

  const removeScreenshot = () => {
    setScreenshot(null);
    setScreenshotTaken(false);
  };

  const getDeviceInfo = async () => {
    try {
      const [
        brand,
        model,
        systemVersion,
        appVersion,
        buildNumber,
        deviceId,
        isTablet,
        carrier,
      ] = await Promise.all([
        DeviceInfo.getBrand(),
        DeviceInfo.getModel(),
        DeviceInfo.getSystemVersion(),
        DeviceInfo.getVersion(),
        DeviceInfo.getBuildNumber(),
        DeviceInfo.getDeviceId(),
        DeviceInfo.isTablet(),
        DeviceInfo.getCarrier(),
      ]);

      return {
        platform: Platform.OS,
        brand,
        model,
        systemVersion,
        appVersion,
        buildNumber,
        deviceId,
        isTablet,
        carrier,
        screenData: {
          width: Platform.OS === 'web' ? window.screen.width : 'N/A',
          height: Platform.OS === 'web' ? window.screen.height : 'N/A',
        },
      };
    } catch (error) {
      console.error('Failed to get device info:', error);
      return {
        platform: Platform.OS,
        error: 'Failed to collect device info',
      };
    }
  };

  const handleSubmit = async () => {
    if (message.trim().length < 5) {
      Alert.alert(
        '메시지 입력 필요',
        '피드백 내용을 최소 5자 이상 입력해주세요.',
        [{ text: '확인' }]
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const deviceInfo = await getDeviceInfo();
      const appVersion = await DeviceInfo.getVersion();

      const feedbackData: FeedbackData = {
        userId,
        category,
        rating,
        message: message.trim(),
        screenshot,
        deviceInfo,
        appVersion,
        timestamp: new Date(),
      };

      await onSubmit(feedbackData);

      Alert.alert(
        '피드백 전송 완료',
        '소중한 의견 감사합니다. 검토 후 반영하겠습니다.',
        [
          {
            text: '확인',
            onPress: handleClose,
          },
        ]
      );
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      Alert.alert(
        '전송 실패',
        '피드백 전송 중 오류가 발생했습니다. 다시 시도해주세요.',
        [{ text: '확인' }]
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={handleClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleClose}
            style={styles.closeButton}
            accessibilityRole="button"
            accessibilityLabel="피드백 모달 닫기"
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>
          <Text style={styles.title}>피드백 보내기</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Category Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>카테고리 선택</Text>
            <View style={styles.categoryContainer}>
              {categories.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.categoryButton,
                    category === cat && styles.categoryButtonActive,
                  ]}
                  onPress={() => setCategory(cat)}
                  accessibilityRole="button"
                  accessibilityLabel={`카테고리 ${CATEGORY_LABELS[cat]} 선택`}
                  accessibilityState={{ selected: category === cat }}
                >
                  <Text
                    style={[
                      styles.categoryButtonText,
                      category === cat && styles.categoryButtonTextActive,
                    ]}
                  >
                    {CATEGORY_LABELS[cat]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Rating */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>만족도 평가</Text>
            <View style={styles.ratingContainer}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  style={[
                    styles.ratingButton,
                    star <= rating && styles.ratingButtonActive,
                  ]}
                  onPress={() => setRating(star)}
                  accessibilityRole="button"
                  accessibilityLabel={`${star}점 ${RATING_LABELS[star as keyof typeof RATING_LABELS]} 선택`}
                  accessibilityState={{ selected: star === rating }}
                >
                  <Text style={styles.ratingText}>
                    {star <= rating ? '★' : '☆'}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            <Text style={styles.ratingLabel}>
              {RATING_LABELS[rating as keyof typeof RATING_LABELS]}
            </Text>
          </View>

          {/* Message */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>상세 내용</Text>
            <TextInput
              ref={messageInputRef}
              style={styles.messageInput}
              placeholder="자세한 피드백을 남겨주세요... (최소 5자)"
              placeholderTextColor="#999"
              value={message}
              onChangeText={setMessage}
              multiline
              numberOfLines={4}
              maxLength={1000}
              textAlignVertical="top"
              accessibilityLabel="피드백 상세 내용"
              accessibilityHint="자세한 피드백 내용을 입력하세요"
            />
            <Text style={styles.characterCount}>{message.length}/1000</Text>
          </View>

          {/* Screenshot */}
          {allowScreenshot && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>화면 첨부 (선택사항)</Text>
              <View style={styles.screenshotContainer}>
                {!screenshotTaken ? (
                  <TouchableOpacity
                    style={styles.screenshotButton}
                    onPress={takeScreenshot}
                    accessibilityRole="button"
                    accessibilityLabel="현재 화면 스크린샷 첨부"
                  >
                    <Text style={styles.screenshotButtonText}>
                      📱 현재 화면 첨부하기
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.screenshotAttached}>
                    <Text style={styles.screenshotAttachedText}>
                      ✅ 스크린샷이 첨부되었습니다
                    </Text>
                    <TouchableOpacity
                      style={styles.removeScreenshotButton}
                      onPress={removeScreenshot}
                      accessibilityRole="button"
                      accessibilityLabel="첨부된 스크린샷 제거"
                    >
                      <Text style={styles.removeScreenshotText}>제거</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          )}

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              (isSubmitting || message.trim().length < 5) &&
                styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting || message.trim().length < 5}
            accessibilityRole="button"
            accessibilityLabel="피드백 전송"
            accessibilityHint={
              message.trim().length < 5
                ? '메시지를 5자 이상 입력해주세요'
                : '피드백을 전송합니다'
            }
            accessibilityState={{
              disabled: isSubmitting || message.trim().length < 5,
            }}
          >
            <Text style={styles.submitButtonText}>
              {isSubmitting ? '전송 중...' : '피드백 전송하기'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>
    </Modal>
  );
};

export default FeedbackModal;
