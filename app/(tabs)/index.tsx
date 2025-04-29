// app/(tabs)/feed.tsx
import { View, Text, FlatList, Image, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useEffect, useState, useCallback } from 'react';
import { Picker } from '@react-native-picker/picker';

type Artwork = {
  id: string;
  url: string;
  category: string;
  ownerUid: string;
  createdAt?: any;
};

const CATEGORIES = ['All', 'Watercolor', 'Oil', 'Digital', 'Sketch', 'Other'];

export default function FeedScreen() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [filteredArtworks, setFilteredArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const q = query(
      collection(db, 'artworks'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Omit<Artwork, 'id'>),
      }));

      setArtworks(items);
      setLoading(false);
    }, (error) => {
      console.error('❌ Firestore error:', error);
      Alert.alert('Error', 'Could not load feed.');
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (selectedCategory === 'All') {
      setFilteredArtworks(artworks);
    } else {
      setFilteredArtworks(
        artworks.filter((item) => item.category === selectedCategory)
      );
    }
  }, [artworks, selectedCategory]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    // Normally you'd refetch here but onSnapshot keeps it live,
    // so we just timeout to simulate a refresh animation
    setTimeout(() => {
      setRefreshing(false);
    }, 800);
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (filteredArtworks.length === 0) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
        <Text style={{ fontSize: 16, color: '#666', textAlign: 'center' }}>
          No artworks found.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <Picker
        selectedValue={selectedCategory}
        onValueChange={(value) => setSelectedCategory(value)}
        style={{ margin: 12 }}
      >
        {CATEGORIES.map((cat) => (
          <Picker.Item key={cat} label={cat} value={cat} />
        ))}
      </Picker>

      <FlatList
        data={filteredArtworks}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={{ paddingVertical: 16 }}
        renderItem={({ item }) => (
          <View style={{ marginBottom: 24, paddingHorizontal: 16 }}>
            <Image
              source={{ uri: item.url }}
              style={{ width: '100%', aspectRatio: 1, borderRadius: 12, backgroundColor: '#eee' }}
              resizeMode="cover"
              onError={(error) => console.warn('Image failed to load:', error.nativeEvent.error)}
              defaultSource={require('@/assets/images/placeholder-image.png')} // you can add a simple placeholder in assets
            />
            <Text style={{ marginTop: 8, fontWeight: 'bold', fontSize: 16 }}>
              {item.category}
            </Text>
          </View>
        )}
      />
    </View>
  );
}