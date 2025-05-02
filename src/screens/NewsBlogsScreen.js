import React, { useState, useEffect } from "react";
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
  Dimensions
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { getBlogPosts } from "../services/api";

const { width } = Dimensions.get("window");

const NewsBlogsScreen = () => {
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState("News");
  const [loading, setLoading] = useState(true);
  const [newsData, setNewsData] = useState([]);
  const [blogsData, setBlogsData] = useState([]);
  const [error, setError] = useState(null);
  const [featuredPost, setFeaturedPost] = useState(null);

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const fetchBlogPosts = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch news
      const newsResponse = await getBlogPosts({ type: "news", limit: 6 });
      
      // Fetch blogs (articles)
      const blogsResponse = await getBlogPosts({ type: "articles", limit: 6 });
      
      if (newsResponse.success && blogsResponse.success) {
        // Process and set news data
        setNewsData(newsResponse.data || []);
        
        // Process and set blogs data
        setBlogsData(blogsResponse.data || []);
        
        // Set featured post (first news item)
        if (newsResponse.data && newsResponse.data.length > 0) {
          setFeaturedPost(newsResponse.data[0]);
        }
      } else {
        setError("Failed to load content. Please try again later.");
      }
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      setError("Something went wrong. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handlePostPress = (post) => {
    // Navigate to post detail screen with the post data
    navigation.navigate("BlogPostDetailScreen", { post });
    console.log("Post pressed:", post.title);
  };

  const renderTabIndicator = () => (
    <View style={styles.tabsContainer}>
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "News" && styles.activeTabButton,
        ]}
        onPress={() => handleTabChange("News")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "News" && styles.activeTabText,
          ]}
        >
          News
        </Text>
        {activeTab === "News" && <View style={styles.activeTabIndicator} />}
      </TouchableOpacity>
      
      <TouchableOpacity
        style={[
          styles.tabButton,
          activeTab === "Blogs" && styles.activeTabButton,
        ]}
        onPress={() => handleTabChange("Blogs")}
      >
        <Text
          style={[
            styles.tabText,
            activeTab === "Blogs" && styles.activeTabText,
          ]}
        >
          Blogs
        </Text>
        {activeTab === "Blogs" && <View style={styles.activeTabIndicator} />}
      </TouchableOpacity>
    </View>
  );

  const renderNewsItem = ({ item, index }) => {
    // Construct image URL
    const imageUrl = item.coverImage 
      ? { uri: `https://cdn.legendmotorsglobal.com${item.coverImage.original}` }
      : require("../components/home/car_Image.png");
    
    return (
      <TouchableOpacity 
        style={styles.newsCard}
        onPress={() => handlePostPress(item)}
      >
        <View style={styles.newsImageContainer}>
          <Image
            source={imageUrl}
            style={styles.newsImage}
            resizeMode="cover"
          />
          <View style={styles.newsNumberContainer}>
            <Text style={styles.newsNumber}>{index + 1}</Text>
          </View>
          {item.tags && item.tags.length > 0 && (
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>{item.tags[0].name}</Text>
            </View>
          )}
        </View>
        <View style={styles.newsContent}>
          <Text style={styles.newsTitle} numberOfLines={2}>
            {item.title}
          </Text>
          <Text style={styles.newsExcerpt} numberOfLines={1}>
            {item.excerpt || "Click to read more"}
          </Text>
          
          <View style={styles.newsFooter}>
            <View style={styles.authorInfo}>
              <View style={styles.authorAvatar}>
                <Text style={styles.authorInitials}>
                  {item.author ? `${item.author.firstName.charAt(0)}${item.author.lastName.charAt(0)}` : ""}
                </Text>
              </View>
              <Text style={styles.authorName}>
                {item.author ? `${item.author.firstName} ${item.author.lastName}` : "Unknown"}
              </Text>
            </View>
            <View style={styles.timeInfo}>
              <Text style={styles.timeText}>30 Apr</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderFeaturedPost = () => {
    if (!featuredPost) return null;
    
    // Construct image URL
    const imageUrl = featuredPost.coverImage 
      ? { uri: `https://cdn.legendmotorsglobal.com${featuredPost.coverImage.original}` }
      : require("../components/home/car_Image.png");
    
    return (
      <View style={styles.featuredSection}>
        <Text style={styles.featuredTitle}>FEATURED</Text>
        <TouchableOpacity 
          style={styles.featuredCard}
          onPress={() => handlePostPress(featuredPost)}
        >
          <Image
            source={imageUrl}
            style={styles.featuredImage}
            resizeMode="cover"
          />
          <View style={styles.featuredContent}>
            <Text style={styles.featuredPostTitle}>{featuredPost.title}</Text>
            <Text style={styles.featuredPostExcerpt} numberOfLines={2}>
              {featuredPost.excerpt || "Click to read more"}
            </Text>
            
            <View style={styles.featuredFooter}>
              <Text style={styles.featuredTimeText}>30 Apr</Text>
              <Text style={styles.featuredReadTime}>2 min read</Text>
            </View>
          </View>
          
          <TouchableOpacity style={styles.arrowButton}>
            <Text style={styles.arrowText}>→</Text>
          </TouchableOpacity>
        </TouchableOpacity>
      </View>
    );
  };

  const renderBlogsContent = () => {
    if (blogsData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No blog posts available</Text>
        </View>
      );
    }

    return (
      <View style={styles.blogsContainer}>
        {renderFeaturedPost()}
        
        <FlatList
          data={blogsData.slice(1)} // Skip the first item as it's shown as featured
          renderItem={({ item }) => {
            // Construct image URL
            const imageUrl = item.coverImage 
              ? { uri: `https://cdn.legendmotorsglobal.com${item.coverImage.original}` }
              : require("../components/home/car_Image.png");
            
            return (
              <TouchableOpacity 
                style={styles.blogCard}
                onPress={() => handlePostPress(item)}
              >
                <Image
                  source={imageUrl}
                  style={styles.blogImage}
                  resizeMode="cover"
                />
                <View style={styles.blogContent}>
                  <Text style={styles.blogTitle}>{item.title}</Text>
                  <Text style={styles.blogExcerpt} numberOfLines={2}>
                    {item.excerpt || "Click to read more"}
                  </Text>
                  
                  <View style={styles.blogFooter}>
                    <Text style={styles.blogTimeText}>30 Apr</Text>
                    <Text style={styles.blogReadTime}>2 min read</Text>
                  </View>
                </View>
                
                <TouchableOpacity style={styles.arrowButton}>
                  <Text style={styles.arrowText}>→</Text>
                </TouchableOpacity>
              </TouchableOpacity>
            );
          }}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          scrollEnabled={false} // Disable scrolling as it's inside a ScrollView
        />
      </View>
    );
  };

  const renderNewsContent = () => {
    if (newsData.length === 0) {
      return (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No news available</Text>
        </View>
      );
    }

    return (
      <FlatList
        data={newsData}
        renderItem={renderNewsItem}
        keyExtractor={(item) => item.id.toString()}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false} // Disable scrolling as it's inside a ScrollView
      />
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Text style={styles.sectionTitle}>News & Blogs</Text>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#F47B20" />
          <Text style={styles.loadingText}>Loading content...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
        <Text style={styles.sectionTitle}>News & Blogs</Text>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity 
            style={styles.retryButton}
            onPress={fetchBlogPosts}
          >
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <Text style={styles.sectionTitle}>News & Blogs</Text>
      
      {renderTabIndicator()}
      
      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === "News" ? renderNewsContent() : renderBlogsContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 40,
  },
  errorText: {
    fontSize: 14,
    color: "#FF3B30",
    textAlign: "center",
    marginBottom: 16,
  },
  retryButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: "#F47B20",
    borderRadius: 8,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  tabsContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    position: "relative",
  },
  activeTabButton: {
    borderBottomWidth: 0,
  },
  tabText: {
    fontSize: 16,
    color: "#9E9E9E",
  },
  activeTabText: {
    color: "#7A40C6",
    fontWeight: "600",
  },
  activeTabIndicator: {
    position: "absolute",
    bottom: 0,
    left: 24,
    right: 24,
    height: 2,
    backgroundColor: "#7A40C6",
  },
  content: {
    flex: 1,
  },
  emptyContainer: {
    padding: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  // News tab styles
  newsCard: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  newsImageContainer: {
    width: 100,
    height: 100,
    position: "relative",
  },
  newsImage: {
    width: "100%",
    height: "100%",
  },
  newsNumberContainer: {
    position: "absolute",
    left: 0,
    bottom: 0,
    width: 30,
    height: 30,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    alignItems: "center",
    justifyContent: "center",
  },
  newsNumber: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 16,
  },
  tagContainer: {
    position: "absolute",
    right: 4,
    top: 4,
    backgroundColor: "#F47B20",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  tagText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "500",
  },
  newsContent: {
    flex: 1,
    padding: 10,
    justifyContent: "space-between",
  },
  newsTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  newsExcerpt: {
    fontSize: 12,
    color: "#666",
    marginBottom: 8,
  },
  newsFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  authorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  authorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#E0E0E0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 6,
  },
  authorInitials: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#666",
  },
  authorName: {
    fontSize: 10,
    color: "#666",
  },
  timeInfo: {},
  timeText: {
    fontSize: 10,
    color: "#F47B20",
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
    fontWeight: "600",
    color: "#7A40C6",
    marginBottom: 8,
  },
  featuredCard: {
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
    marginBottom: 16,
  },
  featuredImage: {
    width: "100%",
    height: 180,
  },
  featuredContent: {
    padding: 16,
  },
  featuredPostTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  featuredPostExcerpt: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  featuredFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  featuredTimeText: {
    fontSize: 12,
    color: "#F47B20",
    marginRight: 16,
  },
  featuredReadTime: {
    fontSize: 12,
    color: "#666",
  },
  blogCard: {
    marginHorizontal: 16,
    marginBottom: 16,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: "hidden",
  },
  blogImage: {
    width: "100%",
    height: 150,
  },
  blogContent: {
    padding: 16,
  },
  blogTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 8,
  },
  blogExcerpt: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  blogFooter: {
    flexDirection: "row",
    alignItems: "center",
  },
  blogTimeText: {
    fontSize: 12,
    color: "#F47B20",
    marginRight: 16,
  },
  blogReadTime: {
    fontSize: 12,
    color: "#666",
  },
  arrowButton: {
    position: "absolute",
    right: 16,
    bottom: 16,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#F47B20",
    alignItems: "center",
    justifyContent: "center",
  },
  arrowText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
});

export default NewsBlogsScreen; 