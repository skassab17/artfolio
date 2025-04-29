// app/(tabs)/feed.tsx
import { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, ActivityIndicator, RefreshControl } from 'react-native';
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
  
      let q = collection(db, 'artworks');  // 🔵 This is CollectionReference
  
      const constraints = [];
      if (category && category !== 'All') {
        constraints.push(where('category', '==', category));
      }
      constraints.push(orderBy('createdAt', 'desc'));
  
      const queryRef = constraints.length > 0 ? query(q, ...constraints) : q;
  
      const snapshot = await getDocs(queryRef);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
      console.log('🎨 Loaded artworks:', items.length);
      setArtworks(items as Artwork[]);
    } catch (error) {
      console.error('❌ Error loading artworks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = () => {
    setRefreshing(true);
    fetchArtworks();
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Picker for category filter */}
      <Picker
        selectedValue={category}
        onValueChange={(value) => setCategory(value)}
        style={{ marginHorizontal: 20, marginTop: 12 }}
      >
        <Picker.Item label="All" value="All" />
        <Picker.Item label="Watercolor" value="Watercolor" />
        <Picker.Item label="Oil Painting" value="Oil Painting" />
        <Picker.Item label="Digital Art" value="Digital Art" />
        {/* Add more categories as needed */}
      </Picker>

      {/* Loading spinner */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={artworks}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ fontSize: 16, color: '#888' }}>No artworks found.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={{ marginBottom: 20, alignItems: 'center' }}>
              <Image
                source={{ uri: item.url }}
                style={{ width: 300, height: 300, borderRadius: 16 }}
                resizeMode="cover"
              />
              <Text style={{ marginTop: 8, fontSize: 16 }}>{item.category}</Text>
            </View>
          )}
        />
      )}
    </View>
  );
}