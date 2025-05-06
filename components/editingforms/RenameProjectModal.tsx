import React from 'react';
import {
  Modal,
  View,
  Pressable,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from 'react-native';

interface RenameProjectModalProps {
  projectName: string;
  draftName: string;
  onChangeDraftName: (text: string) => void;
  onCancel: () => void;
  onSave: () => void;
}

export default function RenameProjectModal({
  projectName,
  draftName,
  onChangeDraftName,
  onCancel,
  onSave,
}: RenameProjectModalProps) {
  return (
    <Modal
      transparent
      animationType="slide"
      visible
      onRequestClose={onCancel}
    >
      <Pressable style={styles.modalBackground} onPress={onCancel} />
      <View style={styles.modalOverlay}>
        <View style={[styles.editModal, { width: 300 }]}>
          <Text style={styles.modalHeader}>
            Rename “{projectName}”
          </Text>
          <TextInput
            style={styles.input}
            value={draftName}
            onChangeText={onChangeDraftName}
          />
          <View style={styles.modalButtons}>
            <Button title="Cancel" onPress={onCancel} />
            <Button title="Save" onPress={onSave} />
          </View>
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
  editModal: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
  },
  modalHeader: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 8,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
});