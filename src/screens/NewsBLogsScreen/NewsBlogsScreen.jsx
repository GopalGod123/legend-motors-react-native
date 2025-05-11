import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
  SafeAreaView,
  StatusBar,
  Dimensions,
} from 'react-native';
import {useNavigation} from '@react-navigation/native';
import {getBlogPosts} from '../../services/api';
import {useTheme} from 'src/context/ThemeContext';
import {styles} from './newBlogsScreenStyles';

const {width} = Dimensions.get('window');

const NewsBlogsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('News');
  const [loading, setLoading] = useState(true);
  const [newsData, setNewsData] = useState([]);
  const [blogsData, setBlogsData] = useState([]);
  const [error, setError] = useState(null);
  const [featuredPost, setFeaturedPost] = useState(null);
  const {isDark, COLORS1} = useTheme();

  const [newsPage, setNewsPage] = useState(1);
  const [blogsPage, setBlogsPage] = useState(1);
  const [newsTotalPages, setNewsTotalPages] = useState(1);
  const [blogsTotalPages, setBlogsTotalPages] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Fetch function with pagination
  const fetchBlogPosts = async (type, page) => {
    try {
      const response = await getBlogPosts({type, limit: 10, page});

      if (response.success) {
        const data = response.data || [];

        if (type === 'news') {
          setNewsData(prev => (page === 1 ? data : [...prev, ...data]));
          setNewsTotalPages(response.pagination?.totalPages || 1);
          if (page === 1 && data.length > 0) setFeaturedPost(data[0]);
        } else {
          setBlogsData(prev => (page === 1 ? data : [...prev, ...data]));
          setBlogsTotalPages(response.pagination?.totalPages || 1);
        }
      } else {
        setError(response.msg);
      }
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  // Initial + paginated fetch on tab or page change
  useEffect(() => {
    setLoading(true);
    if (activeTab === 'News') {
      fetchBlogPosts('news', newsPage);
    } else {
      fetchBlogPosts('articles', blogsPage);
    }
  }, [activeTab, newsPage, blogsPage]);

  const handleTabChange = tab => {
    setActiveTab(tab);

    setError('');
    // Reset pagination when switching tabs
    if (tab === 'News') {
      if (newsData.length === 0) setNewsPage(1);
    } else {
      if (blogsData.length === 0) setBlogsPage(1);
    }
  };

  const handlePostPress = post => {
    navigation.navigate('BlogPostDetailScreen', {post});
  };

  const renderTabIndicator = () => (
    <View
      style={[styles.tabsContainer, {borderBottomColor: COLORS1.placeholder}]}>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => handleTabChange('News')}>
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === 'News' ? COLORS1.secondary : COLORS1.textLight,
            },
            activeTab === 'News' && styles.activeTabText,
          ]}>
          News
        </Text>
        {activeTab === 'News' && (
          <View
            style={[
              styles.activeTabIndicator,
              {backgroundColor: COLORS1.secondary},
            ]}
          />
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.tabButton}
        onPress={() => handleTabChange('Blogs')}>
        <Text
          style={[
            styles.tabText,
            {
              color:
                activeTab === 'Blogs' ? COLORS1.secondary : COLORS1.textLight,
            },
            activeTab === 'Blogs' && styles.activeTabText,
          ]}>
          Blogs
        </Text>
        {activeTab === 'Blogs' && (
          <View
            style={[
              styles.activeTabIndicator,
              {backgroundColor: COLORS1.secondary},
            ]}
          />
        )}
      </TouchableOpacity>
    </View>
  );

  const renderNewsItem = ({item, index}) => {
    const imageUrl = item.coverImage
      ? {uri: `https://cdn.legendmotorsglobal.com${item.coverImage.original}`}
      : require('../../components/home/car_Image.png');

    return (
      <TouchableOpacity
        style={[
          styles.newsCard,
          {
            backgroundColor: COLORS1.white,
            borderWidth: 0.6,
            borderColor: COLORS1?.textDark,
          },
        ]}
        onPress={() => handlePostPress(item)}>
        <View style={styles.newsImageContainer}>
          <Image
            source={imageUrl}
            style={styles.newsImage}
            resizeMode="cover"
          />
          <View style={styles.newsNumberContainer}>
            <Text style={styles.newsNumber}>{index + 1}</Text>
          </View>
          {item.tags?.length > 0 && (
            <View
              style={[styles.tagContainer, {backgroundColor: COLORS1.primary}]}>
              <Text style={[styles.tagText, {color: COLORS1.white}]}>
                {item.tags[0].name}
              </Text>
            </View>
          )}
        </View>
        <View style={styles.newsContent}>
          <Text
            style={[styles.newsTitle, {color: COLORS1.textDark}]}
            numberOfLines={2}>
            {item.title}
          </Text>
          <Text
            style={[styles.newsExcerpt, {color: COLORS1.textMedium}]}
            numberOfLines={1}>
            {item.excerpt || 'Click to read more'}
          </Text>

          <View style={styles.newsFooter}>
            <View style={styles.authorInfo}>
              <View
                style={[
                  styles.authorAvatar,
                  {backgroundColor: COLORS1.placeholder},
                ]}>
                <Text
                  style={[styles.authorInitials, {color: COLORS1.textMedium}]}>
                  {item.author
                    ? `${item.author.firstName.charAt(
                        0,
                      )}${item.author.lastName.charAt(0)}`
                    : ''}
                </Text>
              </View>
              <Text style={[styles.authorName, {color: COLORS1.textMedium}]}>
                {item.author
                  ? `${item.author.firstName} ${item.author.lastName}`
                  : 'Unknown'}
              </Text>
            </View>
            <View style={[styles.timeInfo]}>
              <Text
                style={[
                  styles.timeText,
                  {
                    color: COLORS1.textDark,
                    paddingHorizontal: 4,
                    backgroundColor: COLORS1?.footer,
                  },
                ]}>
                30 Apr
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFeaturedPost = () => {
    if (!featuredPost) return null;

    const imageUrl = featuredPost.coverImage
      ? {
          uri: `https://cdn.legendmotorsglobal.com${featuredPost.coverImage.original}`,
        }
      : require('../../components/home/car_Image.png');

    return (
      <View style={styles.featuredSection}>
        <Text
          style={[
            styles.featuredTitle,
            {
              color: '#6E3E7E',
              textAlign: 'center',
              marginVertical: 22,
              fontSize: 22,
            },
          ]}>
          FEATURED
        </Text>
        <TouchableOpacity
          style={[
            styles.featuredCard,
            {
              backgroundColor: COLORS1.white,
              marginTop: 22,
              borderColor: COLORS1?.heading,
            },
          ]}
          onPress={() => handlePostPress(featuredPost)}>
          <Image
            source={imageUrl}
            style={styles.featuredImage}
            resizeMode="cover"
          />
          <View style={styles.featuredContent}>
            <Text style={[styles.featuredPostTitle, {color: COLORS1.textDark}]}>
              {featuredPost.title}
            </Text>
            <Text
              style={[styles.featuredPostExcerpt, {color: COLORS1.textMedium}]}
              numberOfLines={2}>
              {featuredPost.excerpt || 'Click to read more'}
            </Text>

            <View style={[styles.featuredFooter, ,]}>
              <Text
                style={[
                  styles.featuredTimeText,
                  {
                    color: COLORS1.textDark,
                    padding: 10,

                    backgroundColor: COLORS1?.footer,
                    borderRadius: 6,
                  },
                ]}>
                30 Apr
              </Text>
              <Text
                style={[
                  styles.featuredReadTime,
                  {
                    color: COLORS1.textDark,
                    backgroundColor: COLORS1?.footer,
                    padding: 10,
                    borderRadius: 6,
                  },
                ]}>
                2 min read
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.arrowButton, {backgroundColor: '#6C3E7F'}]}>
            <Text style={[styles.arrowText, {color: COLORS1?.textDark}]}>
              &gt;
            </Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  };

  const renderBlogsContent = () => {
    if (blogsData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, {color: COLORS1.textMedium}]}>
            No blog posts available
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.blogsContainer}>
        <FlatList
          data={blogsData}
          renderItem={({item}) => {
            const imageUrl = item.coverImage
              ? {
                  uri: `https://cdn.legendmotorsglobal.com${item.coverImage.original}`,
                }
              : require('../../components/home/car_Image.png');
            console.log(imageUrl);
            return (
              <TouchableOpacity
                style={[styles.blogCard, {backgroundColor: COLORS1.white}]}
                onPress={() => handlePostPress(item)}>
                <Image
                  source={imageUrl}
                  style={styles.blogImage}
                  resizeMode="cover"
                />
                <View style={styles.blogContent}>
                  <Text style={[styles.blogTitle, {color: COLORS1.textDark}]}>
                    {item.title}
                  </Text>
                  <Text
                    style={[styles.blogExcerpt, {color: COLORS1.textMedium}]}
                    numberOfLines={2}>
                    {item.excerpt || 'Click to read more'}
                  </Text>
                  <View style={styles.blogFooter}>
                    <Text
                      style={[styles.blogTimeText, {color: COLORS1.primary}]}>
                      30 Apr
                    </Text>
                    <Text
                      style={[
                        styles.blogReadTime,
                        {color: COLORS1.textMedium},
                      ]}>
                      2 min read
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={[styles.arrowButton, {backgroundColor: '#6C3E7F'}]}>
                  <Text style={[styles.arrowText, {color: COLORS1?.textDark}]}>
                    &gt;
                  </Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false}
        />
      </View>
    );
  };

  const renderNewsContent = () => {
    if (newsData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={[styles.emptyText, {color: COLORS1.textMedium}]}>
            No news available
          </Text>
        </View>
      );
    }

    return (
      <FlatList
        data={newsData}
        renderItem={renderNewsItem}
        keyExtractor={item => item.id.toString()}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: COLORS1.background}]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={COLORS1.background}
        />
        <Text style={[styles.sectionTitle, {color: COLORS1.textDark}]}>
          News & Blogs
        </Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS1.primary} />
          <Text style={[styles.loadingText, {color: COLORS1.textMedium}]}>
            Loading content...
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView
        style={[styles.container, {backgroundColor: COLORS1.background}]}>
        <StatusBar
          barStyle={isDark ? 'light-content' : 'dark-content'}
          backgroundColor={COLORS1.background}
        />
        <Text style={[styles.sectionTitle, {color: COLORS1.textDark}]}>
          News & Blogs
        </Text>
        <View style={styles.errorContainer}>
          <Text style={[styles.errorText, {color: COLORS1.primary}]}>
            {error}
          </Text>
          <TouchableOpacity
            style={[styles.retryButton, {backgroundColor: COLORS1.primary}]}
            onPress={fetchBlogPosts}>
            <Text style={[styles.retryText, {color: COLORS1.white}]}>
              Retry
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  const handleLoadMore = () => {
    if (loadingMore) return;
    setLoadingMore(true);
    if (activeTab === 'News' && newsPage < newsTotalPages) {
      setNewsPage(prev => prev + 1);
    } else if (activeTab === 'Blogs' && blogsPage < blogsTotalPages) {
      setBlogsPage(prev => prev + 1);
    } else {
      setLoadingMore(false);
    }
  };
  // Loader at end of list
  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <ActivityIndicator
        size="small"
        color="#2e86de"
        style={{marginVertical: 10}}
      />
    );
  };
  const renderContent = () => {
    if (loading) return <Loader />;
    if (error)
      return (
        <Error
          message={error}
          onRetry={() => {
            setLoading(true);
            if (activeTab === 'News') fetchBlogPosts('news', 1);
            else fetchBlogPosts('articles', 1);
          }}
        />
      );

    if (activeTab === 'News') {
      return <>{featuredPost && renderFeaturedPost()}</>;
    } else {
      return (
        // <FlatList
        //   data={blogsData}
        //   renderItem={renderBlogsContent}
        //   keyExtractor={item => item.id.toString()}
        //   showsVerticalScrollIndicator={false}
        //   onEndReachedThreshold={0.5}
        //   onEndReached={handleLoadMore}
        //   ListFooterComponent={renderFooter}
        // />
        <FlatList
          data={blogsData}
          renderItem={renderNewsItem}
          keyExtractor={item => item.id.toString()}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.5}
          onEndReached={handleLoadMore}
          ListFooterComponent={renderFooter}
        />
      );
    }
  };
  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: COLORS1.background}]}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={COLORS1.white}
      />
      <Text style={[styles.sectionTitle, {color: COLORS1.textDark}]}>
        News & Blogs
      </Text>

      {renderTabIndicator()}
      {/* {renderTabs()} */}
      {renderContent()}

      {/* <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {activeTab === 'News' ? renderBlogsContent() : renderNewsContent()}
      </ScrollView> */}
    </SafeAreaView>
  );
};

export default NewsBlogsScreen;
