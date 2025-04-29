import React, { useEffect } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';

export type SystemMessageProps = {
  message: string;
  onHide?: () => void;
};

const SystemMessage: React.FC<SystemMessageProps> = ({ message, onHide }) => {
  const fadeAnim = React.useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // Stay for 2 seconds then fade out
      setTimeout(() => {
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }).start(() => {
          if (onHide) {
            onHide();
          }
        });
      }, 2000);
    });
  }, [fadeAnim, onHide]);

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.messageBox}>
        <Text style={styles.messageText}>{message}</Text>
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: '50%',
    left: 0,
    right: 0,
    zIndex: 999,
    alignItems: 'center',
  },
  messageBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default SystemMessage; 