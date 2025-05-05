import React from 'react';
import { Pressable, Text, Image, StyleSheet, ViewStyle, TextStyle, ImageStyle} from 'react-native';
import { themecolors, typography } from '@/constants/Colors';

export type TabKey = 'uploads' | 'badges' | 'todo';

const TAB_PIN_SOURCES: Record<TabKey, any> = {
  uploads: require('@/assets/images/flower-pin.png'),
  badges:  require('@/assets/images/ladybug.png'),
  todo:    require('@/assets/images/pear.png'),
};

const NOTE_COLORS: Record<TabKey, string> = {
  uploads: '#FFFB87',
  badges:  '#FDE2E4',
  todo:    '#E0F7FA',
};

interface TabNoteProps {
  tabKey: TabKey;
  active: boolean;
  onPress: () => void;
}

export default function TabNote({
  tabKey,
  active,
  onPress,
}: TabNoteProps) {
  const label =
    tabKey === 'uploads'
      ? 'Uploads'
      : tabKey === 'badges'
      ? 'Badges'
      : 'To-Do';

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.container,
        { backgroundColor: active ? NOTE_COLORS[tabKey] : themecolors.neutralLight },
        active && styles.active,
      ]}
    >
      <Image source={TAB_PIN_SOURCES[tabKey]} style={styles.pin} />
      <Text
        style={[
          styles.text,
          active && styles.textActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create<{
  container: ViewStyle;
  active: ViewStyle;
  pin: ImageStyle;
  text: TextStyle;
  textActive: TextStyle;
}>({
  container: {
    height: 50,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 3,
    marginHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 1,
    shadowRadius: 2,
    elevation: 2,
    transform: [{ rotate: '-10deg' }],
  },
  active: {
    shadowOpacity: 1,
    transform: [{ rotate: '0deg' }],
  },
  pin: {
    position: 'absolute',
    top: -8,
    width: 24,
    height: 24,
    resizeMode: 'contain',
    transform: [{ rotate: '-20deg' }],
  },
  text: {
    ...typography.body,
    fontSize: 18,
    fontWeight: '400',
    color: '#333',
  },
  textActive: {
    fontWeight: '700',
    color: '#000',
  },
});