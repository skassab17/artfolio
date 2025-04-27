// app/(tabs)/upload.tsx
import { useState } from 'react';
import { View, Button, Text, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { FirebaseError } from 'firebase/app';

export default function UploadScreen() {
  const [loading, setLoading] = useState(false);

  async function pickAndUpload() {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (res.canceled) return;

    try {
      setLoading(true);

      // 1) upload
      const asset   = res.assets[0];
      const blob    = await fetch(asset.uri).then(r => r.blob());
      const fileRef = ref(storage, `art/${Date.now()}.jpg`);
      await uploadBytes(fileRef, blob);

      // 2) public URL
      const url = await getDownloadURL(fileRef);

      // 3) Firestore doc
      await addDoc(collection(db, 'artworks'), {
        url,
        category: 'watercolor',
        ownerUid: 'anon',
        createdAt: serverTimestamp(),
      });

      Alert.alert('Success', 'Artwork uploaded!');
    } catch (err: unknown) {
      if (err instanceof FirebaseError) {
        console.log('🔥 Firebase error:', err.code, err.message);
        Alert.alert('Upload failed', `${err.code}\n${err.message}`);
      } else {
        console.log('❌ Unknown error', err);
        Alert.alert('Upload failed', 'Unknown error');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        title={loading ? 'Uploading…' : 'Pick image & upload'}
        onPress={pickAndUpload}
        disabled={loading}
      />
      {loading && (
        <>
          <View style={{ marginTop: 16 }} />
          <ActivityIndicator size="large" />
        </>
      )}
      <Text style={{ marginTop: 12, opacity: 0.6 }}>
        After success, switch to the Feed tab
      </Text>
    </View>
  );
}