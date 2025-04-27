import { View, Button, ActivityIndicator, Text } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import { useState } from 'react';

export default function UploadScreen() {
  const [loading, setLoading] = useState(false);

  async function pickAndUpload() {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
    if (res.canceled) return;

    try {
      setLoading(true);
      const asset = res.assets[0];
      const blob = await fetch(asset.uri).then(r => r.blob());
      const fileRef = ref(storage, `test/${Date.now()}.jpg`);
      await uploadBytes(fileRef, blob);
      const url = await getDownloadURL(fileRef);
      console.log('✅ Uploaded to:', url);
      alert('Success!');
    } catch (e) {
      console.error('Upload error', e);
      alert('Failed!');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Button title={loading ? 'Uploading...' : 'Pick & Upload'} onPress={pickAndUpload} disabled={loading} />
      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
    </View>
  );
}