// components/profilescreen/Section.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import PaperHeader from './PaperHeader';
import Polaroid from './Polaroid';
import { StyleSheet } from 'react-native';

interface SectionProps {
  title: string;
  data: Artwork[];
  expanded: boolean;
  onToggle: () => void;
  onItemPress: (item: Artwork) => void;
  onItemLongPress: (item: Artwork) => void;
}

export default function Section({
  title,
  data,
  expanded,
  onToggle,
  onItemPress,
  onItemLongPress,
}: SectionProps) {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <PaperHeader title={title} onEdit={() => { } } idx={0} />
        <Pressable onPress={onToggle}>
          <Text style={styles.toggleButtonText}>
            {expanded ? '–' : '+'}
          </Text>
        </Pressable>
      </View>
      {expanded && (
        <View style={styles.gridContainer}>
          {data.map(item => (
            <Polaroid
              key={item.id}
              uri={item.url}
              caption={item.title}
              date={item.createdAt.toDate().toLocaleDateString()}
              onPress={() => onItemPress(item)}
              onLongPress={() => onItemLongPress(item)}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    sectionContainer: {
      marginBottom: 24,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: 12,
    },
    toggleButtonText: {
      fontSize: 18,
      fontWeight: '600',
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 0,
    },
  });