// app/(tabs)/upload.tsx
import { useState } from 'react';
import { View, Text, Button, ActivityIndicator, Alert, StyleSheet } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';

const categories = [
  { label: 'Watercolor', value: 'Watercolor' },
  { label: 'Oil Painting', value: 'Oil Painting' },
  { label: 'Digital Art', value: 'Digital Art' },
  { label: 'Sketch', value: 'Sketch' },
  { label: 'Other', value: 'Other' },
];

export default function UploadScreen() {
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState<string>('Watercolor');
  const [uploading, setUploading] = useState(false);

  async function pickAndUpload() {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
    if (res.canceled) return;

    try {
      setUploading(true);

      const asset = res.assets[0];
      const blob = await fetch(asset.uri).then(r => r.blob());
      const fileRef = ref(storage, `uploads/${Date.now()}.jpg`);

      await uploadBytes(fileRef, blob);
      const url = await getDownloadURL(fileRef);

      await addDoc(collection(db, 'artworks'), {
        url,
        category,
        ownerUid: 'anon', // 🔥 Later replace with auth.currentUser.uid
        createdAt: serverTimestamp(),
      });

      console.log('✅ Uploaded successfully!');
      Alert.alert('Success', 'Your artwork was uploaded!');
    } catch (error) {
      console.error('❌ Upload failed:', error);
      Alert.alert('Failed to upload', (error as Error).message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Select a Category:</Text>

      <Picker
        selectedValue={category}
        onValueChange={(value) => setCategory(value)}
        style={styles.picker}
      >
        {categories.map((cat) => (
          <Picker.Item key={cat.value} label={cat.label} value={cat.value} />
        ))}
      </Picker>

      <Button
        title={uploading ? 'Uploading...' : 'Pick Image & Upload'}
        onPress={pickAndUpload}
        disabled={uploading}
      />

      {uploading && <ActivityIndicator style={{ marginTop: 16 }} />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: 'white',
  },
  label: {
    fontSize: 18,
    marginBottom: 8,
    textAlign: 'center',
  },
  picker: {
    marginBottom: 20,
  },
});