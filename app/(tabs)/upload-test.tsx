// app/(tabs)/upload-test.tsx
import { useState } from 'react';
import { View, Button, Text, ActivityIndicator, Alert } from 'react-native';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '@/lib/firebase'; // ✅ make sure storage is exported correctly

export default function UploadTestScreen() {
  const [loading, setLoading] = useState(false);
  const [fileUrl, setFileUrl] = useState<string | null>(null);

  async function uploadTestFile() {
    try {
      setLoading(true);

      // Create a small text blob
      const textBlob = new Blob(["Hello from Artfolio!"], { type: 'text/plain' });

      // Create a file reference
      const fileRef = ref(storage, `test-uploads/testfile-${Date.now()}.txt`);

      // Upload the file
      await uploadBytes(fileRef, textBlob);

      // Get the public URL
      const url = await getDownloadURL(fileRef);
      console.log('✅ File uploaded! URL:', url);

      setFileUrl(url);
      Alert.alert('Success', 'File uploaded!');
    } catch (err: any) {
      console.error('❌ Upload error:', err);
      Alert.alert('Failed!', err?.message ?? 'Unknown error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 }}>
      <Button
        title={loading ? 'Uploading...' : 'Upload Test File'}
        onPress={uploadTestFile}
        disabled={loading}
      />
      {loading && <ActivityIndicator size="large" style={{ marginTop: 16 }} />}
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