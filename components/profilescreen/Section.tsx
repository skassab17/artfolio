// components/profilescreen/Section.tsx
import React from 'react';
import { View, Text, Pressable } from 'react-native';
import PaperHeader from './PaperHeader';
import Polaroid from './Polaroid';
import { StyleSheet } from 'react-native';
import type { Artwork } from '@/app/types/artwork';

interface SectionProps {
  title: string;
  data: Artwork[];
  expanded: boolean;
  onToggle: () => void;
  onItemPress: (item: Artwork) => void;
  onItemLongPress: (item: Artwork) => void;
  onEdit: () => void;
  idx: number;
  showAllDetails: boolean;
}

export default function Section({
  title,
  data,
  expanded,
  onToggle,
  onItemPress,
  onItemLongPress,
  idx,
  onEdit,
  showAllDetails,
}: SectionProps) {
  return (
    <View style={styles.sectionContainer}>
      <View style={styles.sectionHeaderRow}>
        <PaperHeader title={title} onEdit={onEdit} idx={idx} />
        <Pressable onPress={onToggle} style={styles.toggleButton}>
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
              showDetails={showAllDetails}
            />
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
    sectionContainer: {
      marginBottom: 0,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginHorizontal: 12,
    },
    toggleButton: {
      padding: 8,
      borderColor: '#fff',
      alignItems: 'center',
      justifyContent: 'center',
    },
    toggleButtonText: {
      fontSize: 24,
      fontWeight: '700',
      color: '#fff',
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      paddingHorizontal: 0,
    },
  });