import { StyleSheet, Dimensions } from 'react-native';
import { responsive } from '../../../utils/responsive';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: responsive.scale(20),
    paddingVertical: responsive.verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },

  closeButton: {
    width: responsive.scale(44), // 접근성 최소 터치 타겟
    height: responsive.scale(44),
    borderRadius: responsive.scale(22),
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },

  closeButtonText: {
    fontSize: responsive.font(18),
    color: '#666',
    fontWeight: 'bold',
  },

  title: {
    fontSize: responsive.font(20),
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },

  placeholder: {
    width: responsive.scale(44), // 헤더 정렬을 위한 placeholder
  },

  content: {
    flex: 1,
    paddingHorizontal: responsive.scale(20),
  },

  section: {
    marginVertical: responsive.verticalScale(15),
  },

  sectionTitle: {
    fontSize: responsive.font(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: responsive.verticalScale(10),
  },

  // Category Selection
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: responsive.scale(8),
  },

  categoryButton: {
    paddingHorizontal: responsive.scale(16),
    paddingVertical: responsive.verticalScale(10),
    borderRadius: responsive.scale(20),
    borderWidth: 2,
    borderColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
    minHeight: responsive.scale(44), // 접근성 터치 타겟
  },

  categoryButtonActive: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },

  categoryButtonText: {
    fontSize: responsive.font(14),
    color: '#666',
    fontWeight: '500',
    textAlign: 'center',
  },

  categoryButtonTextActive: {
    color: '#007AFF',
    fontWeight: '600',
  },

  // Rating
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: responsive.scale(8),
    marginBottom: responsive.verticalScale(8),
  },

  ratingButton: {
    width: responsive.scale(48), // 접근성 터치 타겟
    height: responsive.scale(48),
    borderRadius: responsive.scale(24),
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },

  ratingButtonActive: {
    backgroundColor: '#FFD700',
    transform: [{ scale: 1.1 }],
  },

  ratingText: {
    fontSize: responsive.font(24),
    color: '#FFA500',
  },

  ratingLabel: {
    fontSize: responsive.font(14),
    color: '#666',
    textAlign: 'center',
    fontWeight: '500',
  },

  // Message Input
  messageInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: responsive.scale(8),
    padding: responsive.scale(16),
    fontSize: responsive.font(16),
    color: '#333',
    backgroundColor: '#FAFAFA',
    minHeight: responsive.verticalScale(120),
    maxHeight: responsive.verticalScale(200),
    textAlignVertical: 'top',
  },

  characterCount: {
    fontSize: responsive.font(12),
    color: '#999',
    textAlign: 'right',
    marginTop: responsive.verticalScale(5),
  },

  // Screenshot
  screenshotContainer: {
    alignItems: 'center',
  },

  screenshotButton: {
    paddingHorizontal: responsive.scale(20),
    paddingVertical: responsive.verticalScale(12),
    borderRadius: responsive.scale(8),
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
    backgroundColor: '#F8F9FF',
    minHeight: responsive.scale(44), // 접근성
  },

  screenshotButtonText: {
    fontSize: responsive.font(14),
    color: '#007AFF',
    fontWeight: '500',
    textAlign: 'center',
  },

  screenshotAttached: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    paddingHorizontal: responsive.scale(16),
    paddingVertical: responsive.verticalScale(12),
    borderRadius: responsive.scale(8),
    backgroundColor: '#E8F5E8',
    borderWidth: 1,
    borderColor: '#4CAF50',
  },

  screenshotAttachedText: {
    fontSize: responsive.font(14),
    color: '#2E7D32',
    fontWeight: '500',
    flex: 1,
  },

  removeScreenshotButton: {
    paddingHorizontal: responsive.scale(12),
    paddingVertical: responsive.verticalScale(6),
    borderRadius: responsive.scale(6),
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#F44336',
    minHeight: responsive.scale(32),
  },

  removeScreenshotText: {
    fontSize: responsive.font(12),
    color: '#D32F2F',
    fontWeight: '500',
  },

  // Submit Button
  submitButton: {
    backgroundColor: '#007AFF',
    paddingVertical: responsive.verticalScale(16),
    borderRadius: responsive.scale(8),
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: responsive.verticalScale(20),
    minHeight: responsive.scale(48), // 접근성 터치 타겟
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },

  submitButtonDisabled: {
    backgroundColor: '#CCC',
    elevation: 0,
    shadowOpacity: 0,
  },

  submitButtonText: {
    fontSize: responsive.font(16),
    color: '#FFFFFF',
    fontWeight: '600',
  },
});
