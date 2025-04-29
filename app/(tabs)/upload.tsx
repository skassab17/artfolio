// app/(tabs)/upload.tsx
import { useState } from 'react';
import { View, Text, TextInput, Button, Image, ActivityIndicator, Alert, StyleSheet, FlatList } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { storage, db } from '@/lib/firebase';
import DropDownPicker from 'react-native-dropdown-picker';

export default function UploadScreen() {
  const [loading, setLoading] = useState(false);
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const [categoryOpen, setCategoryOpen] = useState(false);
  const [category, setCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState([
    { label: 'Watercolor', value: 'Watercolor' },
    { label: 'Oil Painting', value: 'Oil Painting' },
    { label: 'Digital Art', value: 'Digital Art' },
    { label: 'Sketch', value: 'Sketch' },
    { label: 'Other', value: 'Other' },
  ]);

  async function pickImage() {
    const res = await ImagePicker.launchImageLibraryAsync({ quality: 0.5 });
    if (res.canceled) return;

    const asset = res.assets[0];
    setImageUri(asset.uri);
  }

  async function uploadArtwork() {
    if (!imageUri || !category || !title.trim()) {
      Alert.alert('Missing Information', 'Please fill out all fields.');
      return;
    }

    try {
      setLoading(true);

      const blob = await fetch(imageUri).then(r => r.blob());
      const fileRef = ref(storage, `uploads/${Date.now()}.jpg`);

      await uploadBytes(fileRef, blob);
      const url = await getDownloadURL(fileRef);

      await addDoc(collection(db, 'artworks'), {
        url,
        title,
        description,
        category,
        ownerUid: 'anon', // will replace with real user later
        createdAt: serverTimestamp(),
      });

      console.log('✅ Uploaded successfully!');
      Alert.alert('Success', 'Artwork uploaded!');

      // Reset form
      setImageUri(null);
      setTitle('');
      setDescription('');
      setCategory(null);
    } catch (error) {
      console.error('❌ Upload failed:', error);
      Alert.alert('Upload Failed', (error as Error).message);
    } finally {
      setLoading(false);
    }
  }

  const readyToUpload = imageUri && title.trim() && category && !loading;

  return (
    <FlatList
      data={[]} // Still empty (only using ListHeaderComponent)
      renderItem={null} // ✅ tell FlatList explicitly
      keyExtractor={() => 'dummy'} // no real items
      ListHeaderComponent={
        <View style={styles.container}>
          <Text style={styles.label}>Select Category:</Text>
          <DropDownPicker
            open={categoryOpen}
            value={category}
            items={categories}
            setOpen={setCategoryOpen}
            setValue={setCategory}
            setItems={setCategories}
            placeholder="Select a category..."
            searchable={true}
            style={styles.dropdown}
            dropDownContainerStyle={{ borderColor: '#ccc' }}
          />

          <Text style={styles.label}>Title:</Text>
          <TextInput
            placeholder="Enter a title..."
            value={title}
            onChangeText={setTitle}
            style={styles.input}
          />

          <Text style={styles.label}>Description:</Text>
          <TextInput
            placeholder="Enter a short description..."
            value={description}
            onChangeText={setDescription}
            style={[styles.input, { height: 80 }]}
            multiline
          />

          <Button
            title={imageUri ? 'Change Image' : 'Pick an Image'}
            onPress={pickImage}
          />

          {imageUri && (
            <Image
              source={{ uri: imageUri }}
              style={styles.preview}
              resizeMode="cover"
            />
          )}

          <View style={{ marginTop: 24 }}>
            <Button
              title={loading ? 'Uploading...' : 'Upload Artwork'}
              onPress={uploadArtwork}
              disabled={!readyToUpload}
            />
            {loading && <ActivityIndicator style={{ marginTop: 16 }} />}
          </View>
        </View>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    backgroundColor: 'white',
  },
  label: {
    fontSize: 16,
    marginBottom: 8,
    marginTop: 16,
  },
  dropdown: {
    marginBottom: 12,
    borderColor: '#ccc',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    backgroundColor: 'white',
  },
  preview: {
    width: '100%',
    height: 300,
    borderRadius: 16,
    marginTop: 16,
    backgroundColor: '#eee',
  },
});