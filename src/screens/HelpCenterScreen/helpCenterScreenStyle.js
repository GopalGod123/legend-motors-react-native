import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212121',
  },
  infoButton: {
    padding: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: 'center',
    position: 'relative',
  },
  activeTabButton: {
    borderBottomWidth: 0,
  },
  tabText: {
    fontSize: 16,
    color: '#9E9E9E',
  },
  activeTabText: {
    color: '#7A40C6',
    fontWeight: '600',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: 24,
    right: 24,
    height: 2,
    backgroundColor: '#7A40C6',
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  categoriesContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  categoryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F9D09A',
  },
  activeCategoryButton: {
    backgroundColor: '#F47B20',
  },
  categoryText: {
    color: '#F47B20',
    fontWeight: '500',
  },
  activeCategoryText: {
    color: '#FFFFFF',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 50,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
  },
  faqItemsContainer: {
    marginBottom: 16,
  },
  faqItem: {
    borderBottomWidth: 1,
    // borderBottomColor: '#F0F0F0',
    paddingVertical: 12,
  },
  faqQuestion: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  questionText: {
    fontSize: 14,
    color: '#212121',
    flex: 1,
    paddingRight: 8,
  },
  chevronUp: {
    transform: [{rotate: '180deg'}],
  },
  chevronDown: {
    // Default orientation, no transformation needed
  },
  answerContainer: {
    marginTop: 8,
    paddingHorizontal: 4,
  },
  answerText: {
    fontSize: 14,
    color: '#757575',
    lineHeight: 20,
    marginBottom: 8,
  },
  htmlParagraph: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 8,
    lineHeight: 20,
  },
  htmlStrong: {
    fontWeight: 'bold',
    color: '#424242',
  },
  htmlSpan: {
    fontSize: 14,
    lineHeight: 20,
  },
  htmlListItem: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
    lineHeight: 20,
  },
  htmlList: {
    marginTop: 4,
    marginBottom: 8,
    paddingLeft: 16,
  },
  contactItemsContainer: {
    marginTop: 8,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    // borderBottomWidth: 1,
    // borderBottomColor: '#F0F0F0',

    marginVertical: 10,
    borderRadius: 10,
  },
  contactIcon: {
    marginRight: 16,
  },
  contactName: {
    fontSize: 16,
    color: '#212121',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#212121',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    minHeight: 300,
  },
  errorText: {
    fontSize: 16,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#F47B20',
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  noResultsContainer: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 150,
  },
  noResultsText: {
    fontSize: 16,
    color: '#9E9E9E',
    textAlign: 'center',
  },
});
