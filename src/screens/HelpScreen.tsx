import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Linking,
  Share,
} from 'react-native';
import DeviceInfo from 'react-native-device-info';
import { useNavigation } from '@react-navigation/native';
import FeedbackModal from '../components/feedback/FeedbackModal';
import ErrorReportingService from '../services/ErrorReportingService';
import AnalyticsService from '../services/AnalyticsService';
import styles from '../styles/HelpScreenStyles';

interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: 'gameplay' | 'technical' | 'account' | 'general';
  tags: string[];
}

const FAQ_DATA: FAQItem[] = [
  {
    id: '1',
    category: 'gameplay',
    question: '틀린그림찾기 게임에서 힌트는 어떻게 사용하나요?',
    answer: '게임 하단의 힌트 아이템을 터치하면 정답 위치가 파란색 원으로 표시됩니다. 힌트는 제한된 개수만 사용할 수 있으니 신중하게 사용하세요.',
    tags: ['힌트', '틀린그림찾기', '게임방법'],
  },
  {
    id: '2',
    category: 'gameplay',
    question: '5초 멈춤 아이템은 언제 사용하나요?',
    answer: '시간이 부족할 때 타이머를 5초간 정지시킬 수 있습니다. 게임 하단의 타이머 아이콘을 터치하여 사용하세요.',
    tags: ['타이머', '아이템', '시간'],
  },
  {
    id: '3',
    category: 'technical',
    question: '게임이 느려지거나 멈춰요',
    answer: '1. 앱을 완전히 종료 후 재시작해보세요.\n2. 기기를 재부팅해보세요.\n3. 앱 스토어에서 최신 버전으로 업데이트하세요.\n4. 기기의 저장공간이 충분한지 확인하세요.',
    tags: ['성능', '느림', '멈춤', '업데이트'],
  },
  {
    id: '4',
    category: 'technical',
    question: '화면이 제대로 표시되지 않아요',
    answer: '1. 기기를 세로 방향으로 사용해주세요.\n2. 화면 밝기를 조절해보세요.\n3. 접근성 설정에서 고대비 테마를 활성화해보세요.\n4. 앱을 재시작해보세요.',
    tags: ['화면', '표시', '밝기', '접근성'],
  },
  {
    id: '5',
    category: 'account',
    question: '로그인이 안돼요',
    answer: '1. 이메일과 비밀번호를 다시 확인해주세요.\n2. 인터넷 연결을 확인해주세요.\n3. 구글 로그인을 시도해보세요.\n4. 비밀번호 찾기를 이용해보세요.',
    tags: ['로그인', '계정', '비밀번호', '구글'],
  },
  {
    id: '6',
    category: 'account',
    question: '회원가입은 어떻게 하나요?',
    answer: '1. 로그인 화면에서 "회원가입" 버튼을 터치합니다.\n2. 이메일, 비밀번호를 입력합니다.\n3. 약관에 동의합니다.\n4. 가입 완료 후 바로 게임을 즐길 수 있습니다.',
    tags: ['회원가입', '계정', '이메일'],
  },
  {
    id: '7',
    category: 'general',
    question: '접근성 기능을 어떻게 사용하나요?',
    answer: '1. 설정에서 고대비 테마를 활성화할 수 있습니다.\n2. 스크린 리더(TalkBack/VoiceOver)가 모든 버튼을 읽어줍니다.\n3. 키보드로 앱을 조작할 수 있습니다.\n4. 터치 타겟이 충분히 크게 설계되어 있습니다.',
    tags: ['접근성', '스크린리더', '키보드', '고대비'],
  },
  {
    id: '8',
    category: 'general',
    question: '피드백은 어떻게 보내나요?',
    answer: '이 화면 하단의 "피드백 보내기" 버튼을 터치하거나, 게임 중에 메뉴 버튼을 통해 피드백을 보낼 수 있습니다. 스크린샷도 함께 첨부 가능합니다.',
    tags: ['피드백', '의견', '버그', '개선'],
  },
];

const CATEGORY_LABELS = {
  gameplay: '🎮 게임플레이',
  technical: '🔧 기술 지원',
  account: '👤 계정 관리',
  general: '💬 일반',
};

const HelpScreen: React.FC = () => {
  const navigation = useNavigation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const analytics = AnalyticsService.getInstance();
  const errorReporting = ErrorReportingService.getInstance();

  // Filter FAQ based on search and category
  const filteredFAQ = useMemo(() => {
    let filtered = FAQ_DATA;

    if (selectedCategory) {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(item => 
        item.question.toLowerCase().includes(query) ||
        item.answer.toLowerCase().includes(query) ||
        item.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered;
  }, [searchQuery, selectedCategory]);

  const handleFAQPress = (faqId: string) => {
    const isExpanded = expandedFAQ === faqId;
    setExpandedFAQ(isExpanded ? null : faqId);
    
    analytics.track('faq_clicked', {
      faqId,
      question: FAQ_DATA.find(f => f.id === faqId)?.question,
      expanded: !isExpanded,
    });
  };

  const handleCategoryPress = (category: string) => {
    const newCategory = selectedCategory === category ? null : category;
    setSelectedCategory(newCategory);
    
    analytics.track('help_category_selected', {
      category: newCategory,
    });
  };

  const handleContactSupport = async () => {
    try {
      const appVersion = await DeviceInfo.getVersion();
      const deviceModel = await DeviceInfo.getModel();
      const systemVersion = await DeviceInfo.getSystemVersion();
      
      const subject = '보드게임 앱 문의';
      const body = `안녕하세요,

보드게임 앱 관련 문의드립니다.

[문의 내용을 여기에 작성해주세요]

---
앱 버전: ${appVersion}
기기: ${deviceModel}
OS: ${systemVersion}
      `;
      
      const url = `mailto:support@example.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
        analytics.track('contact_support_email', {
          method: 'email',
        });
      } else {
        Alert.alert(
          '이메일 앱 없음',
          '기기에 이메일 앱이 설치되어 있지 않습니다. support@example.com으로 직접 문의해주세요.',
          [{ text: '확인' }]
        );
      }
    } catch (error) {
      console.error('Failed to open email:', error);
      errorReporting.reportError(error as Error, {
        screen: 'HelpScreen',
        action: 'contact_support',
      });
      
      Alert.alert(
        '오류 발생',
        '이메일 앱을 여는 중 오류가 발생했습니다.',
        [{ text: '확인' }]
      );
    }
  };

  const handleShareApp = async () => {
    try {
      const appVersion = await DeviceInfo.getVersion();
      const message = `보드게임 앱을 추천합니다! 틀린그림찾기 등 다양한 게임을 즐겨보세요. (버전 ${appVersion})`;
      
      await Share.share({
        message,
        title: '보드게임 앱',
      });
      
      analytics.track('app_shared', {
        source: 'help_screen',
      });
    } catch (error) {
      console.error('Failed to share app:', error);
    }
  };

  const handleFeedbackSubmit = async (feedbackData: any) => {
    try {
      // In production, this would send to backend
      console.log('Feedback submitted:', feedbackData);
      
      analytics.track('feedback_submitted', {
        category: feedbackData.category,
        rating: feedbackData.rating,
        hasScreenshot: !!feedbackData.screenshot,
        source: 'help_screen',
      });
      
      setShowFeedbackModal(false);
    } catch (error) {
      console.error('Failed to submit feedback:', error);
      throw error;
    }
  };

  React.useEffect(() => {
    analytics.trackScreenView('HelpScreen');
    errorReporting.setCurrentScreen('HelpScreen');
  }, []);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          accessibilityRole="button"
          accessibilityLabel="뒤로가기"
        >
          <Text style={styles.backButtonText}>‹</Text>
        </TouchableOpacity>
        <Text style={styles.title}>도움말 및 지원</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="궁금한 내용을 검색해보세요..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
            accessibilityLabel="FAQ 검색"
            accessibilityHint="자주 묻는 질문을 검색할 수 있습니다"
          />
          <Text style={styles.searchIcon}>🔍</Text>
        </View>

        {/* Categories */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>카테고리</Text>
          <View style={styles.categoryContainer}>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <TouchableOpacity
                key={key}
                style={[
                  styles.categoryButton,
                  selectedCategory === key && styles.categoryButtonActive,
                ]}
                onPress={() => handleCategoryPress(key)}
                accessibilityRole="button"
                accessibilityLabel={`카테고리 ${label}`}
                accessibilityState={{ selected: selectedCategory === key }}
              >
                <Text
                  style={[
                    styles.categoryButtonText,
                    selectedCategory === key && styles.categoryButtonTextActive,
                  ]}
                >
                  {label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Results */}
        <View style={styles.faqSection}>
          <Text style={styles.sectionTitle}>
            자주 묻는 질문 ({filteredFAQ.length}개)
          </Text>
          
          {filteredFAQ.length === 0 ? (
            <View style={styles.noResultsContainer}>
              <Text style={styles.noResultsText}>
                검색 결과가 없습니다.
              </Text>
              <Text style={styles.noResultsSubtext}>
                다른 키워드로 검색하거나 피드백을 통해 문의해주세요.
              </Text>
            </View>
          ) : (
            filteredFAQ.map((faq) => (
              <TouchableOpacity
                key={faq.id}
                style={styles.faqItem}
                onPress={() => handleFAQPress(faq.id)}
                accessibilityRole="button"
                accessibilityLabel={`질문: ${faq.question}`}
                accessibilityHint={expandedFAQ === faq.id ? '답변 숨기기' : '답변 보기'}
                accessibilityState={{ expanded: expandedFAQ === faq.id }}
              >
                <View style={styles.faqQuestion}>
                  <Text style={styles.faqQuestionText}>{faq.question}</Text>
                  <Text style={styles.faqExpandIcon}>
                    {expandedFAQ === faq.id ? '▲' : '▼'}
                  </Text>
                </View>
                
                {expandedFAQ === faq.id && (
                  <View style={styles.faqAnswer}>
                    <Text style={styles.faqAnswerText}>{faq.answer}</Text>
                    <View style={styles.faqTags}>
                      {faq.tags.map((tag, index) => (
                        <View key={index} style={styles.faqTag}>
                          <Text style={styles.faqTagText}>#{tag}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}
              </TouchableOpacity>
            ))
          )}
        </View>

        {/* Support Actions */}
        <View style={styles.supportSection}>
          <Text style={styles.sectionTitle}>문의 및 지원</Text>
          
          <TouchableOpacity
            style={styles.supportButton}
            onPress={() => setShowFeedbackModal(true)}
            accessibilityRole="button"
            accessibilityLabel="피드백 보내기"
          >
            <Text style={styles.supportButtonIcon}>💬</Text>
            <View style={styles.supportButtonContent}>
              <Text style={styles.supportButtonTitle}>피드백 보내기</Text>
              <Text style={styles.supportButtonSubtitle}>
                의견이나 버그를 신고해주세요
              </Text>
            </View>
            <Text style={styles.supportButtonArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleContactSupport}
            accessibilityRole="button"
            accessibilityLabel="이메일로 문의하기"
          >
            <Text style={styles.supportButtonIcon}>📧</Text>
            <View style={styles.supportButtonContent}>
              <Text style={styles.supportButtonTitle}>이메일 문의</Text>
              <Text style={styles.supportButtonSubtitle}>
                직접 문의하고 싶으신가요?
              </Text>
            </View>
            <Text style={styles.supportButtonArrow}>›</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.supportButton}
            onPress={handleShareApp}
            accessibilityRole="button"
            accessibilityLabel="앱 공유하기"
          >
            <Text style={styles.supportButtonIcon}>📱</Text>
            <View style={styles.supportButtonContent}>
              <Text style={styles.supportButtonTitle}>앱 공유하기</Text>
              <Text style={styles.supportButtonSubtitle}>
                친구들에게 앱을 추천해보세요
              </Text>
            </View>
            <Text style={styles.supportButtonArrow}>›</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Feedback Modal */}
      <FeedbackModal
        visible={showFeedbackModal}
        onSubmit={handleFeedbackSubmit}
        onClose={() => setShowFeedbackModal(false)}
        allowScreenshot={true}
        categories={['bug', 'feature', 'ui_ux', 'general']}
      />
    </View>
  );
};

export default HelpScreen;