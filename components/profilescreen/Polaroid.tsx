import React, { useEffect, useRef } from 'react';
import { Pressable, Image, Text, StyleSheet, StyleProp, ViewStyle, View, Animated} from 'react-native';
import { themecolors, typography } from '@/constants/Colors';

// Interfaces set the Variables that are possible to be used. PolaroidProps is for function Polaroid//
export interface PolaroidProps {
  uri: string;
  showDetails?: boolean;
  caption?: string;
  date?: string;
  onPress: () => void;
  onLongPress?: () => void;
  style?: StyleProp<ViewStyle>;
}

export default function Polaroid({
  uri,
  caption,
  date,
  showDetails = false,
  onPress,
  onLongPress,
  style,
}: PolaroidProps & { showDetails?: boolean }) {
    // e.g. an Animated.Value for translateY
    const slide = useRef(new Animated.Value(showDetails ? 0 : 50)).current;
  
    // trigger slide on prop change
    useEffect(() => {
      Animated.timing(slide, {
        toValue: showDetails ? 0 : 50,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }, [showDetails]);
  
    return (
      <Pressable onPress={onPress} onLongPress={onLongPress} style={[styles.container, style]}>
        <Image source={{ uri, cache: 'force-cache' }} style={styles.image} />
        <Animated.View 
            style={[
            styles.detailscontainer,
            { transform: [{ translateY: slide }]}]}>
          {showDetails && (
            <>
              {caption != null && <Text style={styles.caption}>{caption}</Text>}
              {date    != null && <Text style={styles.date}>{date}</Text>}
            </>
          )}
        </Animated.View>
      </Pressable>
    );
  }

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    flexBasis: '33.33%',
    marginHorizontal: 8,
    borderRadius: 8,
    backgroundColor: themecolors.neutralLight,
    overflow: 'hidden',
    elevation: 1,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    resizeMode: 'cover',
  },
  caption: {
    ...typography.body,
    color: themecolors.textPrimary,
    fontWeight: 'bold' ,
    marginTop: 4,
    marginHorizontal: 6,
  },
  date: {
    ...typography.body,
    color: themecolors.textSecondary,
    fontStyle: 'italic',
    fontSize: 12,
    marginHorizontal: 6,
    marginBottom: 6,
  },
  detailscontainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: themecolors.neutralLight,  // semi-opaque “paper” look
    paddingHorizontal: 6,
    paddingVertical: 4,
  }
});