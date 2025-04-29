// app/(tabs)/profile.tsx
import { useEffect, useState } from 'react';
import { View, FlatList, Text, Image, Button, Alert, ActivityIndicator, RefreshControl, StyleSheet } from 'react-native';
import { collection, deleteDoc, doc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface Artwork {
  id: string;
  url: string;
  title?: string;
  description?: string;
  category: string;
  ownerUid: string;
  createdAt: any;
}

export default function ProfileScreen() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyArtworks();
  }, []);

  async function fetchMyArtworks() {
    console.log('🔄 Fetching my artworks...');
    try {
      setLoading(true);

      const colRef = collection(db, 'artworks');
      const q = query(colRef, where('ownerUid', '==', 'anon'), orderBy('createdAt', 'desc'));

      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      console.log('👤 Loaded my artworks:', items.length);

      setArtworks(items as Artwork[]);
    } catch (error) {
      console.error('❌ Error loading my artworks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const onRefresh = () => {
    console.log('🔄 Pull-to-refresh triggered');
    setRefreshing(true);
    fetchMyArtworks();
  };

  async function handleDeleteArtwork(id: string) {
    Alert.alert(
      'Delete Artwork',
      'Are you sure you want to delete this artwork?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteDoc(doc(db, 'artworks', id));
              console.log('🗑️ Artwork deleted:', id);
              fetchMyArtworks(); // Refresh after delete
            } catch (error) {
              console.error('❌ Error deleting artwork:', error);
              Alert.alert('Error', 'Failed to delete artwork.');
            }
          }
        }
      ]
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={artworks}
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={{ paddingBottom: 120, paddingTop: 20 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ fontSize: 16, color: '#888' }}>No uploads found.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image
                source={{ uri: item.url }}
                style={styles.image}
                resizeMode="cover"
              />
              {item.title && (
                <Text style={styles.title}>{item.title}</Text>
              )}
              {item.description && (
                <Text style={styles.description}>{item.description}</Text>
              )}
              <Text style={styles.categoryLabel}>Category: {item.category}</Text>

              <View style={{ marginTop: 12 }}>
                <Button
                  title="Delete"
                  color="#d9534f"
                  onPress={() => handleDeleteArtwork(item.id)}
                />
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },
  card: {
    marginBottom: 20,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  image: {
    width: 300,
    height: 300,
    borderRadius: 16,
  },
  title: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: 'bold',
  },
  description: {
    marginTop: 4,
    fontSize: 14,
    color: '#555',
    textAlign: 'center',
    paddingHorizontal: 8,
  },
  categoryLabel: {
    marginTop: 8,
    fontSize: 12,
    color: '#888',
  },
});