import { themecolors } from '@/constants/Colors';
import React, { useRef, useState } from 'react';
import type { TextInput as RNTextInput } from 'react-native';
import { Feather } from '@expo/vector-icons';
import {
  View,
  TextInput,
  ScrollView,
  Pressable,
  Text,
  StyleSheet,
  PanResponder,
  Keyboard,
} from 'react-native';

interface HobbyFilterProps {
  filterText: string;
  onFocus: () => void;
  onChangeText: (text: string) => void;
  onSelectSuggestion: (hobby: string | null) => void;
  showSuggestions: boolean;
  suggestionItems: string[];
  onShowAllDetails: () => void;
  onBlur: () => void;
}

export default function HobbyFilter({
  filterText,
  onFocus,
  onChangeText,
  onSelectSuggestion,
  showSuggestions,
  suggestionItems,
  onShowAllDetails,
  onBlur,
}: HobbyFilterProps) {
  const inputRef = useRef<RNTextInput>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Height for suggestion box
  const [boxHeight, setBoxHeight] = useState(150);
  const MIN_HEIGHT = 100;
  const ITEM_HEIGHT = 40; // approximate height per suggestion row
  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderMove: (_, gesture) => {
        let newH = boxHeight + gesture.dy;
        if (newH < MIN_HEIGHT) newH = MIN_HEIGHT;
        const contentHeight = ITEM_HEIGHT * (suggestionItems.length + 2);
        if (newH > contentHeight) newH = contentHeight;
        setBoxHeight(newH);
      },
      onPanResponderRelease: () => {},
    })
  ).current;

  return (
    <View style={styles.filterContainer}>
      <View style={styles.filterPlank}>
        <Pressable onPress={onShowAllDetails} style={styles.iconButton}>
          <Feather name="eye" size={28} color="#fff" />
        </Pressable>
        <View style={styles.inputWrapper}>
          <TextInput
            ref={inputRef}
            style={styles.filterInput}
            placeholder="Hobby Filters"
            placeholderTextColor="#777"
            value={filterText}
            onFocus={() => { setIsFocused(true); onFocus(); }}
            onChangeText={onChangeText}
            onBlur={() => { setIsFocused(false); onBlur(); }}
          />
          <Pressable
            onPress={() => {
              if (showSuggestions) {
                inputRef.current?.blur();
              } else {
                inputRef.current?.focus();
              }
            }}
            style={styles.searchIcon}
          >
            <Feather name="search" size={24} color="#fff" />
          </Pressable>
          {(showSuggestions || isFocused) && (
            <View style={[styles.suggestionsContainer, { height: boxHeight }]}>
              <ScrollView
                style={styles.suggestionsList}
                nestedScrollEnabled={true}
                keyboardShouldPersistTaps="always"
              >
                <Pressable
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={[
                    styles.suggestionItem,
                    filterText === '' && styles.selectedItem
                  ]}
                  onPress={() => {
                    onSelectSuggestion(null);
                    onBlur();
                    inputRef.current?.blur();
                    Keyboard.dismiss();
                  }}
                >
                  <Text style={[styles.suggestionText, styles.allText]}>All</Text>
                </Pressable>
                {suggestionItems.map((h) => (
                  <Pressable
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    key={h}
                    style={[
                      styles.suggestionItem,
                      filterText === h && styles.selectedItem
                    ]}
                    onPress={() => {
                      onSelectSuggestion(h);
                      onBlur();
                      inputRef.current?.blur();
                      Keyboard.dismiss();
                    }}
                  >
                    <Text style={styles.suggestionText}>{h}</Text>
                  </Pressable>
                ))}
              </ScrollView>
              <View
                {...panResponder.panHandlers}
                style={styles.dragHandle}
              >
                <View style={styles.dragIndicator} />
              </View>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    alignItems: 'center',
    alignSelf: 'center',
    justifyContent: 'center',
    width: '100%',
    margin: 10,
    position: 'relative',
    zIndex: 1,
  },
  filterPlank: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '95%',
    alignSelf: 'center',
    paddingHorizontal: 14,
    height: 60,
  },
  filterInput: {
    flex: 1,
    height: 36,
    marginHorizontal: 0,
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    fontSize: 20,
    color: themecolors.neutralLight,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 40,
    backgroundColor: 'transparent',
    borderWidth: 2,
    borderColor: themecolors.neutralLight,
    borderRadius: 50,
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginLeft: 8,
  },
  iconButton: {
    padding: 10,
  },
  suggestionsList: {
    // no absolute positioning in this variant
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 4,
    zIndex: 3,
  },
  suggestionsContainer: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 3,
    backgroundColor: '#fff',
    borderRadius: 8,
    overflow: 'hidden',
  },
  dragHandle: {
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f0f0f0',
  },
  dragIndicator: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#aaa',
  },
  suggestionItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 40,
  },
  suggestionText: {
    fontSize: 18,
  },
  selectedItem: {
    backgroundColor: '#eee',
  },
  allText: {
    fontWeight: 'bold',
  },
});