import {StyleSheet} from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
  },
  errorText: {
    fontSize: 14,
    color: '#FF3B30',
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F47B20',
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabsContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
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
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  // News tab styles
  newsCard: {
    flexDirection: 'row',
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    padding:12,

  },
  newsImageContainer: {
    width: 100,
    height: 100,
    position: 'relative',
    borderRadius:8
  },
  newsImage: {
    width: '100%',
    height: '100%',
  },
  newsNumberContainer: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 30,
    height: 30,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  newsNumber: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 26,
  },
  tagContainer: {
    position: 'absolute',
    right: 4,
    top: 4,
    backgroundColor: '#F47B20',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '500',
  },
  newsContent: {
    flex: 1,
    padding: 10,
    justifyContent: 'space-between',
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  newsExcerpt: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  newsFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  authorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#E0E0E0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 6,
  },
  authorInitials: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#666',
  },
  authorName: {
    fontSize: 10,
    color: '#666',
  },
  timeInfo: {},
  timeText: {
    fontSize: 10,
    color: '#F47B20',
  },
  // Blogs tab styles
  blogsContainer: {
    paddingVertical: 8,
  },
  featuredSection: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  featuredTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#7A40C6',
    marginBottom: 8,
  },
  featuredCard: {
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
    marginBottom: 16,
    borderWidth:0.2
    
  },
  featuredImage: {
    width: '100%',
    height: 180,
  },
  featuredContent: {
    padding: 16,
  },
  featuredPostTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  featuredPostExcerpt: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  featuredFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featuredTimeText: {
    fontSize: 12,
    color: '#F47B20',
    marginRight: 16,
  },
  featuredReadTime: {
    fontSize: 12,
    color: '#666',
  },
  blogCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  blogImage: {
    width: '100%',
    height: 150,
  },
  blogContent: {
    padding: 16,
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  blogExcerpt: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  blogFooter: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  blogTimeText: {
    fontSize: 12,
    color: '#F47B20',
    marginRight: 16,
  },
  blogReadTime: {
    fontSize: 12,
    color: '#666',
  },
  arrowButton: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#F47B20',
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
