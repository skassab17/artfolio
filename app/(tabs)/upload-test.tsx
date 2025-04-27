// app/(tabs)/upload-test.tsx
import { useState } from 'react';
import { View, Button, Text, ActivityIndicator, Alert, Image } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase'; // only storage!
import { FirebaseError } from 'firebase/app';

export default function UploadTestScreen() {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  async function pickAndUpload() {
    try {
      setLoading(true);
  
      const textBlob = new Blob(["Hello from Artfolio!"], { type: 'text/plain' });
  
      const fileRef = ref(storage, `test-uploads/${Date.now()}.txt`);
      await uploadBytes(fileRef, textBlob);
  
      const url = await getDownloadURL(fileRef);
      setImageUrl(url);
  
      console.log('✅ Uploaded text file to:', url);
      Alert.alert('Success!', 'Text file uploaded.');
    } catch (err: any) {
      console.error('❌ Upload failed:', err);
    
      setLoading(false);
    
      if (err instanceof FirebaseError) {
        Alert.alert('Upload failed', `Code: ${err.code}\nMessage: ${err.message}`);
      } else {
        Alert.alert('Upload failed', 'Unknown error');
      }
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