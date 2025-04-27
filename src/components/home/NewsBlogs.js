import React from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";

const NewsBlogs = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>News/Blogs</Text>

      <TouchableOpacity style={styles.card}>
        <Image
          source={require("./NewBlog.png")}
          style={styles.image}
          resizeMode="cover"
        />

        <View style={styles.contentContainer}>
          <Text style={styles.title}>
            2025 TOYOTA HILUX GLXS 2.7 - SUPER WHITE
          </Text>
          <Text style={styles.subtitle}>
            price increased in UAE - Details inside
          </Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 15,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 15,
  },
  card: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "white",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  image: {
    width: "100%",
    height: 200,
    backgroundColor: "#f0f0f0",
  },
  contentContainer: {
    padding: 15,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
  },
});

export default NewsBlogs;
