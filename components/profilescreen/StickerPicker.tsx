import React from 'react';
import { ScrollView, Pressable, Image, StyleSheet } from 'react-native';

interface StickerPickerProps {
  options: any[];                     // array of require(...) sources
  onSelect: (src: any) => void;       // callback when tapped
}

export default function StickerPicker({ options, onSelect }: StickerPickerProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.picker}
      contentContainerStyle={styles.content}
    >
      {options.map((src, i) => (
        <Pressable
          key={i}
          onPress={() => onSelect(src)}
          style={styles.button}
        >
          <Image source={src} style={styles.icon} />
        </Pressable>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  picker: {
    height: 60,
    backgroundColor: '#f0f0f0',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 12,
  },
  button: {
    marginHorizontal: 8,
  },
  icon: {
    width: 40,
    height: 40,
    resizeMode: 'contain',
  },
});