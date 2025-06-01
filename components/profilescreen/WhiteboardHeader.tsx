import React, { ReactNode, useState } from 'react';
import {
  View,
  ImageBackground,
  Pressable,
  StyleSheet,
  Text,
  Dimensions,
  Image,
} from 'react-native';
import Modal from 'react-native-modal';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useWhiteboard } from '@/hooks/ProfileHooks/useWhiteboard';
import Signature from 'react-native-signature-canvas';
import { StatusBar } from 'expo-status-bar';
import VectorCanvas from '@/components/profilescreen/VectorCanvas';
import { Stroke } from '@/components/profilescreen/VectorCanvas';
import type { Sticker } from '@/components/profilescreen/VectorCanvas';

export default function WhiteboardHeader({
    children,
  }: {
    children?: ReactNode;
  }) {
  const {
    drawingUri,
    modalVisible,
    setModalVisible,
    setDrawingUri,
  } = useWhiteboard();

  const insets = useSafeAreaInsets();
  const calculatedHeaderHeight = SCREEN_HEIGHT * 0.4 + insets.top;
  const [vectorStrokes, setVectorStrokes] = useState<Stroke[]>([]);
  const [vectorStickers, setVectorStickers] = useState<Sticker[]>([]);
  console.log('Vector Sticker', vectorStickers);
  console.log('Vector Stroke', vectorStrokes);
  return (
    <>
     <StatusBar translucent backgroundColor="transparent" style="dark" />
      <ImageBackground
        source={
          drawingUri
            ? { uri: drawingUri }
            : require('@/assets/images/whiteboard-bg.png')
        }
        style={[
          styles.header,
          {
            height: SCREEN_HEIGHT * 0.4 + insets.top,
            paddingTop: insets.top + 12,
          },
        ]}
        imageStyle={{
            resizeMode: 'cover',
            position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
          }}
      >
        {children}
        {vectorStickers.map(st => (
          <Image
            key={st.id}
            source={st.src}
            style={{
              position: 'absolute',
              left: st.x,
              top: st.y,
              width: st.size,
              height: st.size,
              resizeMode: 'contain',
            }}
          />
        ))}
        <Pressable
          style={styles.drawButton}
          onPress={() => setModalVisible(true)}
        >
          <Image
            source={require('@/assets/images/expomarkers.png')}
            style={styles.markersIcon}
          />
        </Pressable>
      </ImageBackground>
      <Modal
        isVisible={modalVisible}
        animationIn="slideInDown"
        animationOut="slideOutUp"
        backdropOpacity={0.5}
        style={{ margin: 0 }}
      >
        <VectorCanvas
          initialStrokes={vectorStrokes}
          initialStickers={vectorStickers}
          onSave={(uri, updatedStrokes, updatedStickers) => {
            setDrawingUri(uri);
            setVectorStrokes(updatedStrokes);
            setVectorStickers(updatedStickers ? updatedStickers : []);
            setModalVisible(false);
          }}
          onCancel={() => setModalVisible(false)}
          headerHeight={calculatedHeaderHeight}
        />
      </Modal>
    </>
  );
}
const SCREEN_HEIGHT = Dimensions.get('window').height;
const styles = StyleSheet.create({
  header: {
    width: '100%',
    height: SCREEN_HEIGHT * .4,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingBottom: 12,
    borderBottomWidth: 0,
    borderColor:'black',
  },
  drawButton: {
    position: 'absolute',
    bottom: 12,
    right: 12,
    padding: 8,
    borderRadius: 4,
  },
  markersIcon: {
    width: 55,
    height: 55,
    resizeMode: 'contain',
  },
});