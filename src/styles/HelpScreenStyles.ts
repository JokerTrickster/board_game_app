import { StyleSheet, Dimensions } from 'react-native';
import { responsive } from '../utils/responsive';

const { width } = Dimensions.get('window');

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: responsive.scale(20),
    paddingVertical: responsive.verticalScale(15),
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    backgroundColor: '#FAFAFA',
  },

  backButton: {
    width: responsive.scale(44),
    height: responsive.scale(44),
    borderRadius: responsive.scale(22),
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: responsive.scale(15),
  },

  backButtonText: {
    fontSize: responsive.font(24),
    color: '#333',
    fontWeight: 'bold',
  },

  title: {
    fontSize: responsive.font(20),
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: responsive.scale(20),
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: responsive.scale(12),
    paddingHorizontal: responsive.scale(16),
    marginVertical: responsive.verticalScale(16),
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },

  searchInput: {
    flex: 1,
    fontSize: responsive.font(16),
    color: '#333',
    paddingVertical: responsive.verticalScale(12),
  },

  searchIcon: {
    fontSize: responsive.font(16),
    color: '#666',
    marginLeft: responsive.scale(8),
  },

  // Sections
  sectionTitle: {
    fontSize: responsive.font(18),
    fontWeight: '600',
    color: '#333',
    marginBottom: responsive.verticalScale(12),
    marginTop: responsive.verticalScale(8),
  },

  // Categories
  categorySection: {
    marginBottom: responsive.verticalScale(20),
  },

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
    minHeight: responsive.scale(44), // 접근성
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

  // FAQ Section
  faqSection: {
    marginBottom: responsive.verticalScale(20),
  },

  faqItem: {
    backgroundColor: '#FAFAFA',
    borderRadius: responsive.scale(12),
    marginBottom: responsive.verticalScale(8),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    overflow: 'hidden',
  },

  faqQuestion: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: responsive.scale(16),
    minHeight: responsive.scale(48), // 접근성 터치 타겟
  },

  faqQuestionText: {
    fontSize: responsive.font(16),
    fontWeight: '500',
    color: '#333',
    flex: 1,
    marginRight: responsive.scale(12),
    lineHeight: responsive.font(22),
  },

  faqExpandIcon: {
    fontSize: responsive.font(14),
    color: '#666',
    fontWeight: 'bold',
  },

  faqAnswer: {
    paddingHorizontal: responsive.scale(16),
    paddingBottom: responsive.verticalScale(16),
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    backgroundColor: '#FFFFFF',
  },

  faqAnswerText: {
    fontSize: responsive.font(15),
    color: '#555',
    lineHeight: responsive.font(22),
    marginBottom: responsive.verticalScale(12),
  },

  faqTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: responsive.scale(6),
  },

  faqTag: {
    backgroundColor: '#E8F4FF',
    paddingHorizontal: responsive.scale(8),
    paddingVertical: responsive.verticalScale(4),
    borderRadius: responsive.scale(12),
    borderWidth: 1,
    borderColor: '#B3D9FF',
  },

  faqTagText: {
    fontSize: responsive.font(12),
    color: '#0066CC',
    fontWeight: '500',
  },

  // No Results
  noResultsContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: responsive.verticalScale(40),
  },

  noResultsText: {
    fontSize: responsive.font(16),
    fontWeight: '500',
    color: '#666',
    textAlign: 'center',
    marginBottom: responsive.verticalScale(8),
  },

  noResultsSubtext: {
    fontSize: responsive.font(14),
    color: '#999',
    textAlign: 'center',
    lineHeight: responsive.font(20),
  },

  // Support Section
  supportSection: {
    marginBottom: responsive.verticalScale(30),
  },

  supportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: responsive.scale(12),
    padding: responsive.scale(16),
    marginBottom: responsive.verticalScale(8),
    borderWidth: 1,
    borderColor: '#E0E0E0',
    minHeight: responsive.scale(60), // 접근성 터치 타겟
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },

  supportButtonIcon: {
    fontSize: responsive.font(24),
    marginRight: responsive.scale(16),
    width: responsive.scale(32),
    textAlign: 'center',
  },

  supportButtonContent: {
    flex: 1,
  },

  supportButtonTitle: {
    fontSize: responsive.font(16),
    fontWeight: '600',
    color: '#333',
    marginBottom: responsive.verticalScale(4),
  },

  supportButtonSubtitle: {
    fontSize: responsive.font(14),
    color: '#666',
    lineHeight: responsive.font(18),
  },

  supportButtonArrow: {
    fontSize: responsive.font(20),
    color: '#999',
    marginLeft: responsive.scale(12),
  },
});