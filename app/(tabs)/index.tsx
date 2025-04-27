// app/(tabs)/index.tsx  ← Home / Feed tab
import { useEffect, useState } from 'react';
import { FlatList, Image, Text, View } from 'react-native';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';         // <- the file you just made
import { doc } from 'firebase/firestore';

export function HomeScreen() {
  useEffect(() => {
    const unsub = onSnapshot(
      doc(db, '__ping__/live'),
      () => console.log('Firestore is reachable')
    );
    return unsub;
  }, []);

  return (
    <View>
      <Text>Home screen</Text>
    </View>
  );
}
export default function FeedScreen() {
  const [art, setArt] = useState<Artwork[]>([]);

  // 1.  Real-time listener: every DB change updates the feed instantly
  useEffect(() => {
    const q = query(
      collection(db, 'artworks'),            // collection name
      orderBy('createdAt', 'desc')           // newest first
    );

    // 2.  onSnapshot runs once (initial data) and
    //     again whenever a document changes
    return onSnapshot(q, snap => {
      const items = snap.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          url: data.url,
          category: data.category,
          createdAt: (data.createdAt as Timestamp).toDate(),
          ownerUid: data.ownerUid,
        } as Artwork;
      });
      setArt(items);
    });
  }, []);

  // 3.  Simple “mini card” renderer
  function renderItem({ item }: { item: Artwork }) {
    return (
      <View
        style={{
          margin: 8,
          borderRadius: 8,
          overflow: 'hidden',
          backgroundColor: '#fff',
          elevation: 2, // Android shadow
        }}
      >
        <Image
          source={{ uri: item.url }}
          style={{ width: '100%', aspectRatio: 1 }}
        />
        <View style={{ padding: 8 }}>
          <Text style={{ fontWeight: '600' }}>{item.category}</Text>
          <Text style={{ color: '#888', fontSize: 12 }}>
            {item.createdAt.toLocaleDateString()}
          </Text>
        </View>
      </View>
    );
  }

  return (
    <FlatList
      data={art}
      keyExtractor={item => item.id}
      renderItem={renderItem}
      contentContainerStyle={{ padding: 8 }}
    />
  );
}
type Artwork = {
  id: string;          // doc ID
  url: string;         // downloadURL from Storage
  category: string;    // 'watercolor', 'bead', etc.
  createdAt: Date;     // when it was posted
  ownerUid: string;    // who posted it (later)
};