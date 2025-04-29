// app/(tabs)/feed.tsx
import { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Picker } from '@react-native-picker/picker';

interface Artwork {
  id: string;
  url: string;
  category: string;
  ownerUid: string;
  createdAt: any;
}

export default function FeedScreen() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [category, setCategory] = useState('All');

  useEffect(() => {
    fetchArtworks();
  }, [category]);

  async function fetchArtworks() {
    try {
      setLoading(true);

      const colRef = collection(db, 'artworks');

      let q = query(colRef, orderBy('createdAt', 'desc'));
      if (category !== 'All') {
        q = query(colRef, where('category', '==', category), orderBy('createdAt', 'desc'));
      }

      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log('🎨 Loaded artworks:', items.length);
      setArtworks(items as Artwork[]);
    } catch (error) {
      console.error('❌ Error loading artworks:', error);
      setArtworks([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchArtworks();
  };

  const renderArtwork = ({ item }: { item: Artwork }) => (
    <View style={styles.artworkContainer}>
      <Image
        source={{ uri: item.url }}
        style={styles.image}
        resizeMode="cover"
      />
      <Text style={styles.categoryText}>{item.category}</Text>
    </View>
  );

  return (
    <View style={{ flex: 1 }}>
      {/* Category Picker */}
      <Picker
        selectedValue={category}
        onValueChange={(value) => setCategory(value)}
        style={styles.picker}
      >
        <Picker.Item label="All" value="All" />
        <Picker.Item label="Watercolor" value="Watercolor" />
        <Picker.Item label="Oil Painting" value="Oil Painting" />
        <Picker.Item label="Digital Art" value="Digital Art" />
      </Picker>

      {/* Loading Spinner */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" />
        </View>
      ) : (
        <FlatList
          data={artworks}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={artworks.length === 0 ? styles.centered : { padding: 16 }}
          ListEmptyComponent={
            <Text style={styles.emptyText}>No artworks found in this category.</Text>
          }
          renderItem={renderArtwork}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  picker: {
    marginHorizontal: 20,
    marginTop: 12,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  artworkContainer: {
    marginBottom: 20,
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 16,
  },
  categoryText: {
    marginTop: 8,
    fontSize: 16,
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
});