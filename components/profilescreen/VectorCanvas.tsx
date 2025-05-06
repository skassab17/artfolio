import React, { useEffect, useState, useRef } from 'react';
import { View, PanResponder, StyleSheet, TouchableOpacity, Text, Image } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Svg, { Path } from 'react-native-svg';
import { captureRef } from 'react-native-view-shot';
import Slider from '@react-native-community/slider';
import StickerPicker from '@/components/profilescreen/StickerPicker';
import DraggableSticker from '@/components/profilescreen/DraggableSticker';
export type Stroke = { d: string; color: string; width: number };

interface VectorCanvasProps {
  onSave: (uri: string, strokes: Stroke[]) => void;
  onCancel: () => void;
  initialStrokes?: Stroke[];
  headerHeight?: number;      // new prop for maximum canvas height
}

export default function VectorCanvas({ onSave, onCancel, initialStrokes, headerHeight }: VectorCanvasProps) {
    const currentRef = useRef<string>('');
    const [strokes, setStrokes] = useState<Stroke[]>(initialStrokes ?? []);
    const [current, setCurrent] = useState<string>('');
    const [hue, setHue] = useState<number>(120);
    const [lightness, setLightness] = useState<number>(50);
    const lightnessRef = useRef<number>(lightness);
    useEffect(() => {
      lightnessRef.current = lightness;
    }, [lightness]);
    const hueRef = useRef<number>(hue);
    useEffect(() => {
      hueRef.current = hue;
    }, [hue]);
    const [brushWidth, setBrushWidth] = useState<number>(4);
    const brushWidthRef = useRef<number>(brushWidth);
    useEffect(() => {
      brushWidthRef.current = brushWidth;
    }, [brushWidth]);
    useEffect(() => {
      if (initialStrokes) {
        setStrokes(initialStrokes);
      }
    }, [initialStrokes]);
    const selectedColor = `hsl(${hueRef.current}, 100%, ${lightnessRef.current}%)`;
    const svgRef = React.useRef<any>(null);
    const pan = React.useRef(
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderGrant: ({ nativeEvent }) => {
          currentRef.current = `M ${nativeEvent.locationX} ${nativeEvent.locationY}`;
          setCurrent(currentRef.current);
        },
        onPanResponderMove: ({ nativeEvent }) => {
            currentRef.current += ` L ${nativeEvent.locationX} ${nativeEvent.locationY}`;
            setCurrent(currentRef.current);
        },
        onPanResponderRelease: () => {
            const path = currentRef.current;
            const colorToUse = `hsl(${hueRef.current}, 100%, ${lightnessRef.current}%)`;
            const widthToUse = brushWidthRef.current;
            setStrokes(prev => [...prev, { d: path, color: colorToUse, width: widthToUse }]);
            currentRef.current = '';
            setCurrent('');
        },
      })
    ).current;

  async function handleSave() {
    if (!svgRef.current) return;
    const uri = await captureRef(svgRef, {
      format: 'png',
      quality: 0.8,
    });
    onSave(uri, strokes);
    setStrokes([]);
    setCurrent('');
  }

  function handleCancel() {
    setStrokes([]);
    setCurrent('');
    onCancel();
  }

  // Remove the most recent stroke
  function handleUndo() {
    setStrokes(prev => prev.slice(0, -1));
  }

  // Clear all strokes and the current preview
  function handleClear() {
    setStrokes([]);
    setCurrent('');
    currentRef.current = '';
  }

  // Sticker picker state
  const stickerOptions = [
    require('@/assets/stickers/sun.png'),
  ];
  const [stickers, setStickers] = useState<{ id: string; src: any; x: number; y: number; size: number }[]>([]);
  function addSticker(src: any) {
    const defaultSize = 50;
    const x = (headerHeight ?? 0) / 2 - defaultSize / 2;
    const y = (headerHeight ?? 0) / 2 - defaultSize / 2;
    setStickers(prev => [
      ...prev,
      { id: Date.now().toString(), src, x, y, size: defaultSize },
    ]);
  }

  return (
    <View style={styles.container}>
      <View
        style={[
          styles.drawing,
          headerHeight != null && { height: headerHeight },  // limit drawing height
        ]}
        {...pan.panHandlers}
      >
        <Svg ref={svgRef} style={StyleSheet.absoluteFill}>
          {/* Completed strokes */}
          {strokes.map((stroke, index) => (
            <Path
              key={index}
              d={stroke.d}
              stroke={stroke.color}
              strokeWidth={stroke.width}
              fill="none"
            />
          ))}
          {/* Active stroke */}
          {current !== '' && (
            <Path d={current} stroke={selectedColor} strokeWidth={brushWidth} fill="none" />
          )}
        </Svg>
        {/* Placed stickers */}
        {stickers.map(st => (
          <DraggableSticker
            key={st.id}
            src={st.src}
            initialX={st.x}
            initialY={st.y}
            initialSize={st.size}
          />
        ))}
      </View>
      <View style={styles.brushContainer}>
        {[2, 4, 8, 12, 16].map(size => (
          <TouchableOpacity
            key={size}
            onPress={() => setBrushWidth(size)}
            style={[
              styles.brushButton,
              brushWidth === size && styles.brushButtonActive,
            ]}
          >
            <MaterialIcons
              name="brush"
              size={size * 1.5 + 8}
              color={brushWidth === size ? '#000' : '#333'}
            />
          </TouchableOpacity>
        ))}
      </View>
      <View style={styles.sliderContainer}>
        <Slider
          style={{ flex: 1, height: 40 }}
          minimumValue={0}
          maximumValue={360}
          value={hue}
          onValueChange={setHue}
          minimumTrackTintColor={selectedColor}
          maximumTrackTintColor="#ccc"
          thumbTintColor={selectedColor}
        />
      </View>
      <View style={styles.lightnessContainer}>
        <Slider
          style={{ flex: 1, height: 40 }}
          minimumValue={0}
          maximumValue={100}
          value={lightness}
          onValueChange={setLightness}
          minimumTrackTintColor="#000"
          maximumTrackTintColor="#fff"
          thumbImage={require('@/assets/icons/smallsun.png')}
        />
      </View>
      <View style={styles.toolbar}>
        <TouchableOpacity onPress={handleCancel} style={styles.toolbarButton}>
          <MaterialIcons name="close" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleUndo} style={styles.toolbarButton}>
          <MaterialIcons name="undo" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleClear} style={styles.toolbarButton}>
          <MaterialIcons name="delete" size={24} color="#333" />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleSave} style={styles.toolbarButton}>
          <MaterialIcons name="check" size={24} color="#333" />
        </TouchableOpacity>
      </View>
      {/* Sticker picker */}
      <View style={styles.stickerPickerContainer}>
        <StickerPicker options={stickerOptions} onSelect={addSticker} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  toolbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: 12,
    backgroundColor: '#eee',
  },
  toolbarButton: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  drawing: {
    backgroundColor: '#fff',   // no flex here so height prop applies
  },
  colorPalette: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: '#eee',
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    borderColor: '#ccc',
  },
  colorSwatchActive: {
    borderColor: '#000',
    borderWidth: 3,
  },
  sliderContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#eee',
  },
  lightnessContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: '#eee',
  },
  brushContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 8,
    backgroundColor: '#eee',
  },
  brushButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 0,
    borderColor: '#ccc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  brushButtonActive: {
    borderColor: '#000',
    borderWidth: 3,
  },
  stickerPickerContainer: {
    height: 80,
    backgroundColor: '#fafafa',
    borderTopWidth: 1,
    borderColor: '#ddd',
  },
});
