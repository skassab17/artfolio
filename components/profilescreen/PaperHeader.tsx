import React, { useState } from 'react';
import { View, Text, ImageBackground, StyleSheet, LayoutChangeEvent, Pressable} from 'react-native';
import { themecolors, typography } from '@/constants/Colors';

const HEADER_PATTERNS = [
  require('@/assets/images/pink-banner.png'),
  require('@/assets/images/green-banner.png'),
  require('@/assets/images/orange-banner.png'),
  require('@/assets/images/blue-banner.png'),
];

export default function PaperHeader({
  title,
  idx,
  onEdit,
}: {
  title: string;
  idx: number;
  onEdit?: () => void;
}) {
  const [textWidth, setTextWidth] = useState(0);
  const height = 50;              
  const leftPadding = 20;         
  const rightPadding = 40;        

  const [bg] = useState(
    () => HEADER_PATTERNS[
      Math.floor(Math.random() * HEADER_PATTERNS.length)
    ]
  );
  const totalWidth = textWidth
    ? textWidth + leftPadding + rightPadding * 3
    : 0;
  const [stretchFactor] = useState(() => 1.3 + Math.random() * 0.3);
  const stretchedWidth = totalWidth * stretchFactor;

  return (
    <View style={styles.secwrapper}>
      {totalWidth > 0 && (
        <ImageBackground
          source={bg}
          style={[styles.banner, { width: stretchedWidth, height }]}
          imageStyle={{ resizeMode: 'stretch' }}
        />
      )}
      <View
        style={[
          styles.sectextContainer,
          { paddingLeft: leftPadding, paddingRight: rightPadding, height },
        ]}
      >
        <Text
          style={styles.sectext}
          onLayout={(e: LayoutChangeEvent) =>
            setTextWidth(e.nativeEvent.layout.width)
          }
        >
          {title}
        </Text>
        {title !== 'Loose Ends' && onEdit && (
          <Pressable onPress={onEdit} style={styles.editButton}>
            <Text style={styles.editIcon}>✎</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  secwrapper: {
    alignSelf: 'flex-start',
    marginLeft: -10,
    zIndex: 10,
    elevation: 10,
  },
  banner: {
    shadowOpacity: 0.8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
  },
  sectextContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-start',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectext: {
    ...typography.header,
    fontSize: typography.header.fontSize ? typography.header.fontSize * 1.4 : 28,
    fontWeight: '700',
    paddingRight: 20,
    color: themecolors.textPrimary,
    overflow: 'visible',
  },
  editButton: {
    marginLeft: 6,
  },
  editIcon: {
    fontSize: 24,  // increased from 20 to 24
    paddingTop: 9,
  },
});