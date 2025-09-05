import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  Animated as RNAnimated,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { observer } from 'mobx-react-lite';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { FindItViewModel } from '../viewModels/FindItViewModel';
import SoloHeader from '../../../components/SoloHeader';
import ItemBar from '../../../components/ItemBar';
import AnimatedCircle from '../AnimatedCircle';
import AnimatedX from '../AnimatedX';
import AnimatedHint from '../AnimatedHint';

interface SoloFindItViewProps {
  viewModel: FindItViewModel;
  onBack: () => void;
  onPause: () => void;
}

/**
 * Pure View component for Solo Find-It game
 * Handles only UI rendering and user interactions
 */
const SoloFindItView: React.FC<SoloFindItViewProps> = observer(({
  viewModel,
  onBack,
  onPause,
}) => {
  const imageRef = useRef<View>(null);
  const [imagePosition, setImagePosition] = useState({ x: 0, y: 0 });
  const timerWidth = useRef(new RNAnimated.Value(100)).current;
  const timerAnimation = useRef<RNAnimated.CompositeAnimation | null>(null);

  // Image dimensions
  const IMAGE_FRAME_WIDTH = 400;
  const IMAGE_FRAME_HEIGHT = 277;
  const MAX_SCALE = 2;
  const MIN_SCALE = 1;

  // Zoom and pan state
  const scale = useSharedValue(1);
  const offsetX = useSharedValue(0);
  const offsetY = useSharedValue(0);
  const lastScale = useSharedValue(1);
  const lastOffsetX = useSharedValue(0);
  const lastOffsetY = useSharedValue(0);

  // Timer animation
  useEffect(() => {
    startTimerAnimation();
    return () => {
      timerAnimation.current?.stop();
    };
  }, [viewModel.timer]);

  // Timer color effect
  useEffect(() => {
    if (viewModel.isTimerStopped) {
      timerAnimation.current?.stop();
    } else {
      startTimerAnimation();
    }
  }, [viewModel.isTimerStopped]);

  const startTimerAnimation = () => {
    timerAnimation.current?.stop();

    if (viewModel.timer > 0) {
      timerAnimation.current = RNAnimated.timing(timerWidth, {
        toValue: 0,
        duration: viewModel.timer * 1000,
        useNativeDriver: false,
      });
      timerAnimation.current.start();
    }
  };

  const handleImagePress = (event: any) => {
    if (!viewModel.isClickable) {return;}

    const { locationX, locationY } = event.nativeEvent;

    // Convert to image coordinates considering zoom and pan
    const imageX = (locationX - offsetX.value) / scale.value;
    const imageY = (locationY - offsetY.value) / scale.value;

    viewModel.handleClick(imageX, imageY, 1);
  };

  const handleZoomIn = () => {
    const newScale = Math.min(scale.value * 1.2, MAX_SCALE);
    scale.value = withTiming(newScale);
    lastScale.value = newScale;
  };

  const handleZoomOut = () => {
    const newScale = Math.max(scale.value / 1.2, MIN_SCALE);
    scale.value = withTiming(newScale);
    lastScale.value = newScale;

    if (newScale === MIN_SCALE) {
      offsetX.value = withTiming(0);
      offsetY.value = withTiming(0);
      lastOffsetX.value = 0;
      lastOffsetY.value = 0;
    }
  };

  // Pinch gesture
  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      const newScale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, lastScale.value * event.scale));
      scale.value = newScale;
    })
    .onEnd(() => {
      lastScale.value = scale.value;
    });

  // Pan gesture
  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value > 1) {
        const maxOffsetX = ((scale.value - 1) * IMAGE_FRAME_WIDTH) / 2;
        const maxOffsetY = ((scale.value - 1) * IMAGE_FRAME_HEIGHT) / 2;

        offsetX.value = Math.max(
          -maxOffsetX,
          Math.min(maxOffsetX, lastOffsetX.value + event.translationX)
        );
        offsetY.value = Math.max(
          -maxOffsetY,
          Math.min(maxOffsetY, lastOffsetY.value + event.translationY)
        );
      }
    })
    .onEnd(() => {
      lastOffsetX.value = offsetX.value;
      lastOffsetY.value = offsetY.value;
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: offsetX.value },
      { translateY: offsetY.value },
    ],
  }));

  const timerBarStyle = {
    width: timerWidth.interpolate({
      inputRange: [0, 100],
      outputRange: ['0%', '100%'],
    }),
    backgroundColor: viewModel.timerColor,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SoloHeader
        title={`Round ${viewModel.currentRound}`}
        onBackPress={onBack}
        showBackButton={true}
      />

      {/* Timer Bar */}
      <View style={styles.timerContainer}>
        <RNAnimated.View style={[styles.timerBar, timerBarStyle]} />
      </View>

      {/* Game Area */}
      <View style={styles.gameArea}>
        <View ref={imageRef} style={styles.imageFrame}>
          <GestureDetector gesture={composedGesture}>
            <TouchableWithoutFeedback onPress={handleImagePress}>
              <Animated.View style={[styles.imageContainer, animatedStyle]}>
                {/* Background Image */}
                {viewModel.currentImages.normal && (
                  <Image
                    source={{ uri: viewModel.currentImages.normal }}
                    style={styles.gameImage}
                    resizeMode="contain"
                  />
                )}

                {/* Overlay Image */}
                {viewModel.currentImages.abnormal && (
                  <Image
                    source={{ uri: viewModel.currentImages.abnormal }}
                    style={[styles.gameImage, styles.overlayImage]}
                    resizeMode="contain"
                  />
                )}

                {/* Correct Click Indicators */}
                {viewModel.correctClicks.map((click, index) => (
                  <AnimatedCircle
                    key={`correct-${index}`}
                    x={click.x}
                    y={click.y}
                    isUser1={click.userID === 1}
                  />
                ))}

                {/* Wrong Click Indicators */}
                {viewModel.wrongClicks.map((click, index) => (
                  <AnimatedX
                    key={`wrong-${index}`}
                    x={click.x}
                    y={click.y}
                    isUser1={click.userID === 1}
                  />
                ))}

                {/* Hint Indicator */}
                {viewModel.hintPosition && (
                  <AnimatedHint
                    x={viewModel.hintPosition.x}
                    y={viewModel.hintPosition.y}
                  />
                )}

                {/* Missed Positions (show after timeout) */}
                {viewModel.missedPositions.map((pos, index) => (
                  <View
                    key={`missed-${index}`}
                    style={[
                      styles.missedPosition,
                      {
                        left: pos.x - 15,
                        top: pos.y - 15,
                      },
                    ]}
                  >
                    <Text style={styles.missedPositionText}>?</Text>
                  </View>
                ))}
              </Animated.View>
            </TouchableWithoutFeedback>
          </GestureDetector>
        </View>
      </View>

      {/* Item Bar */}
      <ItemBar
        life={viewModel.lives}
        timerStopCount={viewModel.timerStops}
        hintCount={viewModel.hints}
        onZoomInPress={handleZoomIn}
        onZoomOutPress={handleZoomOut}
        onTimerStopPress={() => viewModel.useTimerStop()}
        onHintPress={() => viewModel.useHint()}
      />

      {/* Effect Overlays */}
      {viewModel.roundClearEffect && (
        <View style={styles.effectOverlay}>
          <Text style={styles.effectText}>CLEAR!</Text>
        </View>
      )}

      {viewModel.roundFailEffect && (
        <View style={styles.effectOverlay}>
          <Text style={[styles.effectText, styles.failText]}>FAILED!</Text>
        </View>
      )}

      {/* Loading Overlay */}
      {viewModel.isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      )}

      {/* Error Display */}
      {viewModel.error && (
        <View style={styles.errorOverlay}>
          <Text style={styles.errorText}>{viewModel.error}</Text>
        </View>
      )}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  timerContainer: {
    height: 20,
    backgroundColor: '#e0e0e0',
    marginHorizontal: 20,
    marginVertical: 10,
    borderRadius: 10,
    overflow: 'hidden',
  },
  timerBar: {
    height: '100%',
    borderRadius: 10,
  },
  gameArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  imageFrame: {
    width: 400,
    height: 277,
    borderWidth: 2,
    borderColor: '#333',
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#white',
  },
  imageContainer: {
    width: '100%',
    height: '100%',
    position: 'relative',
  },
  gameImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  overlayImage: {
    opacity: 0.8,
  },
  missedPosition: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: 'rgba(255, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  missedPositionText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  effectOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  effectText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#4CAF50',
    textAlign: 'center',
  },
  failText: {
    color: '#F44336',
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#333',
  },
  errorOverlay: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(244, 67, 54, 0.9)',
    padding: 15,
    borderRadius: 8,
  },
  errorText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
  },
});

export default SoloFindItView;
