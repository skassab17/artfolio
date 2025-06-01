import { useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, StyleSheet } from 'react-native';
import { collection, getDocs, orderBy, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { Artwork } from '@/app/types/artwork';

export default function HobbyScreen() {
  const { hobby } = useLocalSearchParams<{ hobby: string }>();
  const [loading, setLoading] = useState(true);
  const [artworks, setArtworks] = useState<Artwork[]>([]);

  useEffect(() => {
    async function fetchArt() {
      try {
        setLoading(true);
        const snap = await getDocs(
          query(
            collection(db, 'artworks'),
            where('ownerUid', '==', 'anon'),
            where('category', '==', hobby),
            orderBy('createdAt', 'desc')
          )
        );
        const items = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) })) as Artwork[];
        setArtworks(items);
      } finally {
        setLoading(false);
      }
    }
    if (hobby) fetchArt();
  }, [hobby]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{hobby}</Text>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={artworks}
          keyExtractor={(a) => a.id}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <Image source={{ uri: item.url }} style={styles.image} />
              {item.title && <Text style={styles.caption}>{item.title}</Text>}
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 60 },
  title: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginBottom: 20 },
  card: { marginBottom: 16, alignItems: 'center' },
  image: { width: 300, height: 300, borderRadius: 12 },
  caption: { marginTop: 8, fontSize: 16 },
});
