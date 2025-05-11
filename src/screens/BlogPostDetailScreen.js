import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Share,
  Dimensions,
} from 'react-native';
import {useNavigation, useRoute} from '@react-navigation/native';
import Svg, {Path} from 'react-native-svg';
import {useTheme} from '../context/ThemeContext'; // Adjust path as needed

const {width} = Dimensions.get('window');

// Dynamic Icons
const BackIcon = ({color}) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M15 18L9 12L15 6"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ShareIcon = ({color}) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M18 8C19.6569 8 21 6.65685 21 5C21 3.34315 19.6569 2 18 2C16.3431 2 15 3.34315 15 5C15 5.12548 15.0077 5.24917 15.0227 5.37061L8.08261 9.12566C7.54305 8.43452 6.8099 8 6 8C4.34315 8 3 9.34315 3 11C3 12.6569 4.34315 14 6 14C6.8099 14 7.54305 13.5655 8.08261 12.8743L15.0227 16.6294C15.0077 16.7508 15 16.8745 15 17C15 18.6569 16.3431 20 18 20C19.6569 20 21 18.6569 21 17C21 15.3431 19.6569 14 18 14C17.1901 14 16.457 14.4345 15.9174 15.1257L8.97733 11.3706C8.99229 11.2492 9 11.1255 9 11C9 10.8745 8.99229 10.7508 8.97733 10.6294L15.9174 6.87434C16.457 7.56548 17.1901 8 18 8Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const BookmarkIcon = ({color}) => (
  <Svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 7.8C5 6.11984 5 5.27976 5.32698 4.63803C5.6146 4.07354 6.07354 3.6146 6.63803 3.32698C7.27976 3 8.11984 3 9.8 3H14.2C15.8802 3 16.7202 3 17.362 3.32698C17.9265 3.6146 18.3854 4.07354 18.673 4.63803C19 5.27976 19 6.11984 19 7.8V21L12 17L5 21V7.8Z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

// Styles generator based on theme
const createStyles = (COLORS1, isDark) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS1.background,
    },
    errorContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
      backgroundColor: COLORS1.background,
    },
    errorText: {
      fontSize: 18,
      color: COLORS1.primary,
      marginBottom: 20,
    },
    errorButton: {
      backgroundColor: COLORS1.primary,
      paddingVertical: 10,
      paddingHorizontal: 20,
      borderRadius: 8,
    },
    errorButtonText: {
      color: COLORS1.white,
      fontWeight: '600',
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: COLORS1.filterBackground,
      backgroundColor: COLORS1.background,
    },
    headerButton: {
      padding: 8,
    },
    headerActions: {
      flexDirection: 'row',
    },
    scrollView: {
      flex: 1,
    },
    coverImage: {
      width: width,
      height: width * 0.6,
    },
    content: {
      padding: 16,
    },
    categoryContainer: {
      marginBottom: 12,
    },
    category: {
      color: COLORS1.primary,
      fontWeight: '600',
      fontSize: 14,
    },
    title: {
      fontSize: 24,
      fontWeight: '700',
      color: COLORS1.textDark,
      marginBottom: 16,
      lineHeight: 32,
    },
    metaInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    authorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    authorAvatar: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: COLORS1.filterBackground,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 8,
    },
    authorInitials: {
      fontSize: 14,
      fontWeight: '600',
      color: COLORS1.textMedium,
    },
    authorName: {
      fontSize: 14,
      color: COLORS1.textDark,
      fontWeight: '500',
    },
    date: {
      fontSize: 14,
      color: COLORS1.textMedium,
    },
    tagsContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginBottom: 16,
    },
    tag: {
      backgroundColor: COLORS1.filterBackground,
      paddingVertical: 4,
      paddingHorizontal: 10,
      borderRadius: 16,
      marginRight: 8,
      marginBottom: 8,
    },
    tagText: {
      color: COLORS1.textMedium,
      fontSize: 12,
    },
    excerpt: {
      fontSize: 16,
      color: COLORS1.textDark,
      fontWeight: '500',
      marginBottom: 20,
      lineHeight: 24,
    },
    mainContent: {
      marginBottom: 32,
    },
    paragraph: {
      fontSize: 16,
      color: COLORS1.textDark,
      lineHeight: 24,
      marginBottom: 16,
    },
    relatedSection: {
      marginTop: 20,
    },
    relatedTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: COLORS1.textDark,
      marginBottom: 16,
    },
    relatedCardContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
    },
    relatedCard: {
      width: (width - 48) / 2,
      borderRadius: 8,
      overflow: 'hidden',
      backgroundColor: isDark ? COLORS1.filterBackground : COLORS1.white,
      shadowColor: COLORS1.textDark,
      shadowOffset: {width: 0, height: 2},
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 2,
    },
    relatedImage: {
      width: '100%',
      height: 100,
    },
    relatedContent: {
      padding: 8,
    },
    relatedCardTitle: {
      fontSize: 14,
      fontWeight: '500',
      color: COLORS1.textDark,
      marginBottom: 4,
    },
    relatedDate: {
      fontSize: 12,
      color: COLORS1.textMedium,
    },
  });

const BlogPostDetailScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const {post} = route.params || {};
  const {isDark, COLORS1} = useTheme();
  const styles = createStyles(COLORS1, isDark);

  // Handle missing post
  if (!post) {
    return (
      <SafeAreaView style={styles.errorContainer}>
        <Text style={styles.errorText}>Post not found</Text>
        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}>
          <Text style={styles.errorButtonText}>Go Back</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  const formatDate = dateString => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleShare = async () => {
    try {
      await Share.share({message: `Check out this article: ${post.title}`});
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const imageUrl = post.coverImage
    ? {uri: `https://cdn.legendmotorsglobal.com${post.coverImage.original}`}
    : require('../components/home/car_Image.png'); // adjust fallback as needed

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar
        barStyle={isDark ? 'light-content' : 'dark-content'}
        backgroundColor={COLORS1.background}
      />

      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerButton}>
          <BackIcon color={COLORS1.textDark} />
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity onPress={handleShare} style={styles.headerButton}>
            <ShareIcon color={COLORS1.textDark} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <BookmarkIcon color={COLORS1.textDark} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        <Image source={imageUrl} style={styles.coverImage} resizeMode="cover" />

        <View style={styles.content}>
          {post.category && (
            <View style={styles.categoryContainer}>
              <Text style={[styles.category, {color: COLORS1?.textDark}]}>
                {post.category.name}
              </Text>
            </View>
          )}
          <Text style={[styles.title, {color: COLORS1?.textDark}]}>
            {post.title}
          </Text>

          <View style={styles.metaInfo}>
            {post.author && (
              <View style={styles.authorContainer}>
                <View style={styles.authorAvatar}>
                  <Text style={styles.authorInitials}>
                    {post.author.firstName.charAt(0)}
                    {post.author.lastName.charAt(0)}
                  </Text>
                </View>
                <Text style={styles.authorName}>
                  {post.author.firstName} {post.author.lastName}
                </Text>
              </View>
            )}
            <Text style={styles.date}>{formatDate(post.createdAt)}</Text>
          </View>

          {post.tags?.length > 0 && (
            <View style={styles.tagsContainer}>
              {post.tags.map(tag => (
                <View key={tag.id} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag.name}</Text>
                </View>
              ))}
            </View>
          )}

          {post.excerpt && <Text style={styles.excerpt}>{post.excerpt}</Text>}

          <View style={styles.mainContent}>
            <Text style={styles.paragraph}>
              This is the main content of the blog post. In a real
              implementation, this would be rendered HTML content from the API.
            </Text>
            <Text style={styles.paragraph}>
              The actual content of the blog post would be rendered here using a
              HTML renderer component or by parsing the HTML content from the
              API.
            </Text>
            <Text style={styles.paragraph}>
              For a complete implementation, you would need to fetch the full
              blog post content from an API endpoint like /blog-post/{post.id}{' '}
              or /blog-post/{post.slug}.
            </Text>
          </View>

          <View style={styles.relatedSection}>
            <Text style={styles.relatedTitle}>Related Posts</Text>
            <View style={styles.relatedCardContainer}>
              <View style={styles.relatedCard}>
                <Image
                  source={require('../components/home/car_Image.png')}
                  style={styles.relatedImage}
                  resizeMode="cover"
                />
                <View style={styles.relatedContent}>
                  <Text style={styles.relatedCardTitle} numberOfLines={2}>
                    Related article title would appear here
                  </Text>
                  <Text style={styles.relatedDate}>Apr 30, 2023</Text>
                </View>
              </View>

              <View style={styles.relatedCard}>
                <Image
                  source={require('../components/home/car_Image.png')}
                  style={styles.relatedImage}
                  resizeMode="cover"
                />
                <View style={styles.relatedContent}>
                  <Text style={styles.relatedCardTitle} numberOfLines={2}>
                    Another related article title
                  </Text>
                  <Text style={styles.relatedDate}>Apr 28, 2023</Text>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default BlogPostDetailScreen;
