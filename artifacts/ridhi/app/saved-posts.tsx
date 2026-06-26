import React, { useState, useMemo } from "react";
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
  Dimensions,
  Alert,
  ScrollView,
} from "react-native";
import { router } from "expo-router";
import { Feather } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColors } from "@/hooks/useColors";
import { PrivateHead } from "@/components/PrivateHead";
import { useAuth } from "@/contexts/AuthContext";
import { INITIAL_POSTS, REGIONAL_POSTS } from "@/data/mockData";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");
const COLUMN_COUNT = 3;
const ITEM_SIZE = width / COLUMN_COUNT;

export default function SavedPostsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, unsavePost, addCollection } = useAuth();
  const [selectedCollectionId, setSelectedCollectionId] = useState<string | null>(null);

  const allPosts = useMemo(() => [...INITIAL_POSTS, ...REGIONAL_POSTS], []);
  
  const savedPosts = useMemo(() => {
    const savedIds = user?.savedPosts ?? [];
    let filtered = allPosts.filter((p) => savedIds.includes(p.id));
    
    if (selectedCollectionId) {
      const collection = user?.savedCollections?.find(c => c.id === selectedCollectionId);
      if (collection) {
        filtered = filtered.filter(p => collection.postIds.includes(p.id));
      }
    }
    
    return filtered;
  }, [user?.savedPosts, user?.savedCollections, selectedCollectionId, allPosts]);

  const handleCreateCollection = () => {
    Alert.prompt(
      "New Collection",
      "Enter a name for your collection",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Create", 
          onPress: (name: string | undefined) => {
            if (name) addCollection(name);
          } 
        },
      ],
      "plain-text"
    );
  };

  const renderPostItem = ({ item }: { item: any }) => (
    <Pressable 
      style={styles.postItem}
      onPress={() => {
        router.push({ pathname: "/post-detail", params: { id: item.id } });
      }}
    >
      {item.imageUri || (item.carouselImages && item.carouselImages[0]) ? (
        <Image 
          source={{ uri: item.imageUri || item.carouselImages[0] }} 
          style={styles.postImage} 
        />
      ) : (
        <View style={[styles.postPlaceholder, { backgroundColor: colors.muted }]}>
          <Feather name="type" size={24} color={colors.mutedForeground} />
        </View>
      )}
      <Pressable 
        style={styles.unsaveBtn}
        onPress={() => {
          Alert.alert(
            "Unsave Post",
            "Remove this post from your saved items?",
            [
              { text: "Cancel", style: "cancel" },
              { text: "Remove", style: "destructive", onPress: () => unsavePost(item.id) }
            ]
          );
        }}
      >
        <Feather name="bookmark" size={16} color="#fff" />
      </Pressable>
    </Pressable>
  );

  const selectedCollectionName = selectedCollectionId 
    ? user?.savedCollections?.find(c => c.id === selectedCollectionId)?.name 
    : "All Saved";

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <PrivateHead />
      
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 10, borderBottomColor: colors.border }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Feather name="chevron-left" size={28} color={colors.foreground} />
        </Pressable>
        <Text style={[styles.title, { color: colors.foreground }]}>Saved</Text>
        <Pressable onPress={handleCreateCollection} style={styles.addBtn}>
          <Feather name="plus" size={24} color={colors.primary} />
        </Pressable>
      </View>

      {/* Collections Row */}
      <View style={styles.collectionsWrap}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.collectionsScroll}
        >
          <Pressable 
            style={[
              styles.collectionTab, 
              !selectedCollectionId && { borderBottomColor: colors.primary }
            ]}
            onPress={() => setSelectedCollectionId(null)}
          >
            <Text style={[
              styles.collectionTabText, 
              { color: !selectedCollectionId ? colors.primary : colors.mutedForeground }
            ]}>All</Text>
          </Pressable>
          
          {user?.savedCollections?.map((col) => (
            <Pressable 
              key={col.id}
              style={[
                styles.collectionTab, 
                selectedCollectionId === col.id && { borderBottomColor: colors.primary }
              ]}
              onPress={() => setSelectedCollectionId(col.id)}
            >
              <Text style={[
                styles.collectionTabText, 
                { color: selectedCollectionId === col.id ? colors.primary : colors.mutedForeground }
              ]}>{col.name}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </View>

      {/* Grid */}
      <FlatList
        data={savedPosts}
        renderItem={renderPostItem}
        keyExtractor={(item) => item.id}
        numColumns={COLUMN_COUNT}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <View style={[styles.emptyIcon, { backgroundColor: colors.muted }]}>
              <Feather name="bookmark" size={40} color={colors.mutedForeground} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.foreground }]}>No saved posts yet</Text>
            <Text style={[styles.emptySub, { color: colors.mutedForeground }]}>
              {selectedCollectionId 
                ? `You haven't added any posts to "${selectedCollectionName}" yet.`
                : "Posts you save will appear here."}
            </Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
  },
  backBtn: { width: 40, height: 40, justifyContent: "center" },
  title: { fontSize: 18, fontFamily: "Inter_700Bold" },
  addBtn: { width: 40, height: 40, justifyContent: "center", alignItems: "flex-end" },
  
  collectionsWrap: { borderBottomWidth: 1, borderBottomColor: "transparent" },
  collectionsScroll: { paddingHorizontal: 16, gap: 20 },
  collectionTab: { paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: "transparent" },
  collectionTabText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  
  listContent: { paddingVertical: 1 },
  postItem: { width: ITEM_SIZE, height: ITEM_SIZE, padding: 1 },
  postImage: { width: "100%", height: "100%" },
  postPlaceholder: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  unsaveBtn: { 
    position: "absolute", 
    top: 8, 
    right: 8, 
    backgroundColor: "rgba(0,0,0,0.4)", 
    width: 28, 
    height: 28, 
    borderRadius: 14, 
    alignItems: "center", 
    justifyContent: "center" 
  },
  
  emptyState: { flex: 1, alignItems: "center", justifyContent: "center", paddingTop: 100, paddingHorizontal: 40 },
  emptyIcon: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 20 },
  emptyTitle: { fontSize: 18, fontFamily: "Inter_700Bold", marginBottom: 8 },
  emptySub: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center", lineHeight: 20 },
});
