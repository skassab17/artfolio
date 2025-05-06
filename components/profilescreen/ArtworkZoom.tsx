import React from 'react';
import { Modal, View, Pressable, Image, ActivityIndicator, StyleSheet, Text} from 'react-native';
import { Feather } from '@expo/vector-icons';
import type { Artwork } from '@/app/types/artwork';

interface ArtworkZoomProps {
  artwork: Artwork;
  loading: boolean;
  onEdit: () => void;
  onClose: () => void;
  onLoadStart?: () => void; 
  onLoadEnd?: () => void;    
}

export default function ArtworkZoom({
  artwork,
  loading,
  onEdit,
  onClose,
  onLoadStart,
  onLoadEnd, 
}: ArtworkZoomProps) {
  return (
    <Modal
      transparent
      animationType="fade"
      visible
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalBackground} onPress={onClose} />
      <View style={styles.modalOverlay}>
        {loading && (
          <ActivityIndicator
            size="large"
            color="#fff"
            style={styles.modalSpinner}
          />
        )}

        <Image
          source={{ uri: artwork.url }}
          style={styles.modalImage}
          resizeMode="contain"
          onLoadStart={() => { onLoadStart?.(); }}
          onLoadEnd={() => { onLoadEnd?.(); }}
        />

        <View style={styles.controlRow}>
          <Pressable style={styles.controlButton} onPress={onEdit}>
            <Feather name="edit" size={24} color="#fff" />
          </Pressable>
          <Pressable style={styles.controlButton} onPress={onClose}>
            <Text style={styles.controlText}>← Back</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '90%',
    height: '90%',
    borderRadius: 8,
  },
  modalSpinner: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -20,
    marginTop: -20,
    zIndex: 20,
  },
  controlRow: {
    position: 'absolute',
    bottom: '15%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  controlButton: {
    marginHorizontal: 20,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 30,
    padding: 12,
  },
  controlText: {
    color: '#fff',
    fontSize: 18,
  },
});