// app/(tabs)/upload.tsx
import { useState } from 'react';
import { View, Button, Text, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import {
  ref,
  uploadBytes,
  getDownloadURL,
} from 'firebase/storage';
import {
  collection,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';     // 1️⃣ make sure db is exported

export default function UploadScreen() {
  const [loading, setLoading] = useState(false);

  async function pickAndUpload() {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 });
    if (res.canceled) return;

    try {
      setLoading(true);

      /** 2️⃣ Upload blob to Storage */
      const asset   = res.assets[0];
      const blob    = await fetch(asset.uri).then(r => r.blob());
      const fileRef = ref(storage, `art/${Date.now()}.jpg`);
      await uploadBytes(fileRef, blob);

      /** 3️⃣ Get public URL */
      const url = await getDownloadURL(fileRef);

      /** 4️⃣ Write a Firestore doc */
      await addDoc(collection(db, 'artworks'), {
        url,                              // Storage URL
        category: 'watercolor',           // TODO: make dynamic later
        ownerUid: 'anon',                 // TODO: replace with auth.currentUser?.uid
        createdAt: serverTimestamp(),     // server time for proper sorting
      });

      setLoading(false);
      Alert.alert('Success', 'Artwork uploaded!');   // optional toast
    } catch (err: any) {
      console.error(err);
      setLoading(false);
      Alert.alert('Upload failed', err.message);
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