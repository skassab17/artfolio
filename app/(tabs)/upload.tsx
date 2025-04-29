// app/(tabs)/upload.tsx
import { View, Button, ActivityIndicator, Text, Alert } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import { useState } from 'react';
import { Picker } from '@react-native-picker/picker';

export default function UploadScreen() {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('Watercolor');

  async function pickAndUpload() {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
    if (res.canceled) return;

    try {
      setLoading(true);
      const asset = res.assets[0];
      const blob = await fetch(asset.uri).then(r => r.blob());
      const fileRef = ref(storage, `uploads/${Date.now()}.jpg`);

      await uploadBytes(fileRef, blob);
      const url = await getDownloadURL(fileRef);

      // ✅ Write to Firestore
      await addDoc(collection(db, 'artworks'), {
        url,
        category,
        ownerUid: 'anon',
        createdAt: serverTimestamp(),
      });

      console.log('✅ Uploaded and saved!');
      Alert.alert('Success', 'Image uploaded and saved!');
    } catch (e) {
      console.error('❌ Upload error:', e);
      Alert.alert('Failed!', (e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Picker
        selectedValue={category}
        onValueChange={(value) => setCategory(value)}
        style={{ width: 200, marginBottom: 20 }}
      >
        <Picker.Item label="Watercolor" value="Watercolor" />
        <Picker.Item label="Oil" value="Oil" />
        <Picker.Item label="Digital" value="Digital" />
        <Picker.Item label="Sketch" value="Sketch" />
        <Picker.Item label="Other" value="Other" />
      </Picker>

      <Button title={loading ? 'Uploading...' : 'Pick & Upload'} onPress={pickAndUpload} disabled={loading} />
      {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
    </View>
  );
}