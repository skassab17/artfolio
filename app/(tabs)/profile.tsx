// app/(tabs)/profile.tsx
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, Button, Alert, ActivityIndicator, RefreshControl, SafeAreaView } from 'react-native';
import { collection, deleteDoc, doc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { deleteObject, ref } from 'firebase/storage';

interface Artwork {
  id: string;
  url: string;
  category: string;
  title?: string;
  description?: string;
  createdAt: any;
  ownerUid: string;
}

export default function ProfileScreen() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchMyArtworks();
  }, []);

  async function fetchMyArtworks() {
    try {
      setLoading(true);
      const colRef = collection(db, 'artworks');
      const q = query(colRef, where('ownerUid', '==', 'anon'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Artwork));

      console.log('👤 Loaded my artworks:', items.length);
      setArtworks(items);
    } catch (error) {
      console.error('❌ Error loading my artworks:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function deleteArtwork(item: Artwork) {
    Alert.alert('Delete?', 'Are you sure you want to delete this artwork?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            const docRef = doc(db, 'artworks', item.id);
            await deleteDoc(docRef);
            console.log('🗑️ Firestore document deleted.');

            // Also delete Storage file
            const decodedUrl = decodeURIComponent(item.url.split('?')[0]);
            const storagePath = decodedUrl.split('/o/')[1];
            const fileRef = ref(storage, storagePath);

            await deleteObject(fileRef);
            console.log('🗑️ Storage file deleted.');

            fetchMyArtworks();
          } catch (error) {
            console.error('❌ Error deleting artwork:', error);
            Alert.alert('Failed to delete artwork.');
          }
        },
      },
    ]);
  }

  const onRefresh = () => {
    setRefreshing(true);
    fetchMyArtworks();
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 20 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>@anon</Text>
        <Text style={{ fontSize: 16, color: '#666', marginTop: 4 }}>
          {artworks.length} {artworks.length === 1 ? 'upload' : 'uploads'}
        </Text>
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={artworks}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ fontSize: 16, color: '#888' }}>No uploads yet.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={{ marginBottom: 20, alignItems: 'center' }}>
              <Image
                source={{ uri: item.url }}
                style={{ width: 300, height: 300, borderRadius: 16 }}
                resizeMode="cover"
              />
              <Text style={{ marginTop: 8, fontSize: 16 }}>{item.title || 'Untitled'}</Text>
              <Text style={{ marginTop: 4, fontSize: 14, color: '#666' }}>{item.category}</Text>
              <Button
                title="Delete"
                onPress={() => deleteArtwork(item)}
                color="red"
              />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}