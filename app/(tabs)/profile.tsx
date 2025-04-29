// app/(tabs)/profile.tsx
import { useEffect, useState } from 'react';
import { View, Text, FlatList, Image, Button, Alert, ActivityIndicator, RefreshControl, SafeAreaView, TouchableOpacity, StyleSheet } from 'react-native';
import { collection, deleteDoc, doc, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db, storage } from '@/lib/firebase';
import { deleteObject, ref } from 'firebase/storage';
import DropDownPicker from 'react-native-dropdown-picker';

interface Artwork {
  id: string;
  url: string;
  category: string;
  title?: string;
  description?: string;
  createdAt: any;
  ownerUid: string;
  project?: string;
}

type UploadGridItem =
  | { key: string; type: 'project'; project: string; thumbnail: string }
  | { key: string; type: 'artwork'; artwork: Artwork };

export default function ProfileScreen() {
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string | undefined>(undefined);
  const [filterOpen, setFilterOpen] = useState(false);

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

  const filtered = filter ? artworks.filter(a => a.category === filter) : artworks;

  const grouped = Object.values(
    filtered.reduce((acc, art) => {
      const key = art.project || `__${art.id}`;
      if (!acc[key]) {
        acc[key] = { key, type: art.project ? 'project' : 'artwork', project: art.project || '', thumbnail: art.url, artwork: art };
      }
      return acc;
    }, {} as Record<string, UploadGridItem>)
  );

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#fff' }}>
      <View style={{ alignItems: 'center', marginTop: 20, marginBottom: 10 }}>
        <Text style={{ fontSize: 24, fontWeight: 'bold' }}>@anon</Text>
        <Text style={{ fontSize: 16, color: '#666', marginTop: 4 }}>{artworks.length} uploads</Text>
      </View>

      <View style={{ paddingHorizontal: 20, marginBottom: 12 }}>
        <DropDownPicker
          placeholder="Filter by category..."
          open={filterOpen}
          setOpen={setFilterOpen}
          value={filter ?? null} 
          setValue={setFilter}
          items={[
            { label: 'All', value: undefined },
            { label: 'Watercolor', value: 'Watercolor' },
            { label: 'Oil Painting', value: 'Oil Painting' },
            { label: 'Digital Art', value: 'Digital Art' },
            { label: 'Sketch', value: 'Sketch' },
            { label: 'Other', value: 'Other' },
          ]}
          style={{ borderColor: '#ccc', marginBottom: 8 }}
          dropDownContainerStyle={{ borderColor: '#ccc' }}
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={grouped}
          keyExtractor={(item) => item.key}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={{ padding: 16 }}
          numColumns={3}
          ListEmptyComponent={
            <View style={{ alignItems: 'center', marginTop: 40 }}>
              <Text style={{ fontSize: 16, color: '#888' }}>No uploads yet.</Text>
            </View>
          }
          renderItem={({ item }) => {
            if (item.type === 'artwork') {
              return (
                <View style={styles.gridItem}>
                  <Image source={{ uri: item.artwork.url }} style={styles.thumbnail} />
                </View>
              );
            }
            return (
              <TouchableOpacity style={styles.gridItem}>
                <Image source={{ uri: item.thumbnail }} style={styles.thumbnail} />
                <Text style={{ fontSize: 12, marginTop: 4 }}>{item.project}</Text>
              </TouchableOpacity>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  gridItem: {
    flex: 1,
    margin: 4,
    alignItems: 'center',
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 8,
    backgroundColor: '#eee',
  },
});
