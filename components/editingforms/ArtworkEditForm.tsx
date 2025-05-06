// components/profilescreen/ArtworkEditForm.tsx
import React, { useState, useEffect } from 'react';
import {
  Modal,
  View,
  Pressable,
  Text,
  TextInput,
  Button,
  StyleSheet,
} from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import Polaroid from '@/components/profilescreen/Polaroid';
import type { Artwork } from '@/app/types/artwork';

const CRAFT_HOBBIES = [
  { label: 'Watercolor',     value: 'Watercolor'    },
  { label: 'Oil Painting',   value: 'Oil Painting'  },
  { label: 'Digital Art',    value: 'Digital Art'   },
  { label: 'Sketch',         value: 'Sketch'        },
  { label: 'Ceramics',       value: 'Ceramics'      },
  { label: 'Woodworking',    value: 'Woodworking'   },
  { label: 'Knitting',       value: 'Knitting'      },
  { label: 'Scrapbooking',   value: 'Scrapbooking'  },
  { label: 'Jewelry Making', value: 'Jewelry Making'},
  { label: 'Paper Crafts',   value: 'Paper Crafts'  },
];

interface ArtworkEditFormProps {
  artwork: Artwork;
  onSave: (updates: {
    category: string;
    project?: string;
    title?: string;
    description?: string;
  }) => void;
  onCancel: () => void;
}

export default function ArtworkEditForm({
  artwork,
  onSave,
  onCancel,
}: ArtworkEditFormProps) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const [category, setCategory] = useState(artwork.category);
  const [project, setProject] = useState(artwork.project || '');
  const [title, setTitle] = useState(artwork.title || '');
  const [description, setDescription] = useState(artwork.description || '');

  useEffect(() => {
    setCategory(artwork.category);
    setProject(artwork.project || '');
    setTitle(artwork.title || '');
    setDescription(artwork.description || '');
  }, [artwork]);

  const handleSave = () => {
    onSave({
      category,
      project: project.trim() ? project.trim() : undefined,
      title,
      description,
    });
  };

  return (
    <Modal transparent animationType="slide" visible onRequestClose={onCancel}>
      <Pressable style={styles.modalBackground} onPress={onCancel} />
      <View style={styles.modalOverlay}>
        <View style={[styles.editModal, { backgroundColor: 'white' }]}>
          <Polaroid
            uri={artwork.url}
            caption={artwork.title}
            date={artwork.createdAt.toDate().toLocaleDateString()}
            onPress={() => {}}
            onLongPress={() => {}}
            style={styles.miniPolaroid}
          />
          <Text style={styles.modalHeader}>
            Now editing: "{artwork.title}"
          </Text>

          <Text>Hobby:</Text>
          <DropDownPicker
            open={categoryOpen}
            value={category}
            items={CRAFT_HOBBIES}
            setOpen={setCategoryOpen}
            setValue={setCategory}
            setItems={() => {}}
            placeholder="Select or search hobby..."
            searchable
            searchPlaceholder="Search hobbies..."
            containerStyle={{ marginBottom: 12 }}
            dropDownContainerStyle={{ zIndex: 1000 }}
            listItemContainerStyle={{ zIndex: 1000 }}
            zIndex={1000}
            zIndexInverse={1000}
          />

          <Text>Project:</Text>
          <TextInput
            style={styles.input}
            value={project}
            onChangeText={setProject}
          />

          <Text>Title:</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />

          <Text>Description:</Text>
          <TextInput
            style={[styles.input, { height: 80 }]}
            value={description}
            onChangeText={setDescription}
            multiline
          />

          <View style={styles.modalButtons}>
            <Button title="Cancel" onPress={onCancel} />
            <Button title="Save" onPress={handleSave} />
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
    width: '80%',
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
  miniPolaroid: {
    backgroundColor: '#fff',
    padding: 8,
    paddingBottom: 5,
    borderRadius: 4,
    margin: 10,
    alignItems: 'center',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
});