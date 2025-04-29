// app/(tabs)/upload.tsx
import { useState } from 'react';
import { View, Button, Text, ActivityIndicator, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, db } from '@/lib/firebase';
import { FirebaseError } from 'firebase/app';

export default function UploadScreen() {
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  async function pickAndUpload() {
    try {
      setLoading(true);

      // Pick an image
      const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
      if (res.canceled) {
        setLoading(false);
        return;
      }

      const asset = res.assets[0];
      const blob = await fetch(asset.uri).then((r) => r.blob());

      // Simulated user and category (later replace "anon" and "watercolor" dynamically)
      const ownerUid = 'anon';          // TODO: Replace with real user UID
      const category = 'watercolor';     // TODO: Replace with dynamic category
      const timestamp = Date.now();

      // Organized upload path
      const path = `artworks/${ownerUid}/${category}/${timestamp}.jpg`;

      const fileRef = ref(storage, path);
      console.log('📤 Uploading to:', fileRef.fullPath);

      // Upload the blob
      await uploadBytes(fileRef, blob);

      // Get download URL
      const url = await getDownloadURL(fileRef);
      console.log('✅ File uploaded! URL:', url);

      setFileUrl(url);
      Alert.alert('Success!', 'Artwork uploaded!');
    } catch (err: any) {
      if (err instanceof FirebaseError) {
        console.error('🔥 FirebaseError:', err.code, err.message, err.customData);
      } else {
        console.error('❌ General upload error:', err);
      }
      Alert.alert('Upload failed!', err?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Button
        title={loading ? 'Uploading...' : 'Pick & Upload'}
        onPress={pickAndUpload}
        disabled={loading}
      />
      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
      {fileUrl && (
        <>
          <Text style={{ marginTop: 20 }}>✅ Uploaded File:</Text>
          <Text selectable style={{ marginTop: 8, fontSize: 12, color: '#555' }}>
            {fileUrl}
          </Text>
        </>
      )}
    </View>
  );
}