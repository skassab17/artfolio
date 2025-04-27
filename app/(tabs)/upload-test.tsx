// app/(tabs)/upload-test.tsx
import { useState } from 'react';
import { View, Button, Text, ActivityIndicator, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase'; // only storage!

export default function UploadTestScreen() {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  async function pickAndUpload() {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.7 });
    if (res.canceled) return;

    try {
      setLoading(true);

      const asset = res.assets[0];
      const blob = await fetch(asset.uri).then(r => r.blob());
      const fileRef = ref(storage, `test-uploads/${Date.now()}.jpg`);
      await uploadBytes(fileRef, blob);

      const url = await getDownloadURL(fileRef);
      setImageUrl(url);

      console.log('✅ Uploaded to:', url);
      Alert.alert('Success!', 'Image uploaded.');
    } catch (err) {
      console.error('❌ Upload error:', err);
      Alert.alert('Upload failed', (err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button
        title={loading ? 'Uploading...' : 'Pick and Upload'}
        onPress={pickAndUpload}
        disabled={loading}
      />
      {loading && <ActivityIndicator size="large" style={{ marginTop: 16 }} />}
      {imageUrl && (
        <>
          <Text style={{ marginTop: 20 }}>Uploaded Image:</Text>
          <Image
            source={{ uri: imageUrl }}
            style={{ width: 200, height: 200, marginTop: 12, borderRadius: 12 }}
          />
        </>
      )}
    </View>
  );
}