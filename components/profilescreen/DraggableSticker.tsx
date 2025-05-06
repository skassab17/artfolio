import React, { useRef } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';
import {
  PanGestureHandler,
  PinchGestureHandler,
  State,
} from 'react-native-gesture-handler';
import type { PinchGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';

export default function DraggableSticker({
  src,
  initialX,
  initialY,
  initialSize,
}: {
  src: any;
  initialX: number;
  initialY: number;
  initialSize: number;
}) {
  // Animated values for pan & scale
  const translateX = useRef(new Animated.Value(initialX)).current;
  const translateY = useRef(new Animated.Value(initialY)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);

  // Pan handler
  const onPanGestureEvent = Animated.event(
    [
      {
        nativeEvent: {
          translationX: translateX,
          translationY: translateY,
        },
      },
    ],
    { useNativeDriver: true }
  );

  // Pinch handler
  const onPinchGestureEvent = Animated.event(
    [{ nativeEvent: { scale: scale } }],
    { useNativeDriver: true }
  );

  const onPinchHandlerStateChange = (event: PinchGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.END) {
      lastScale.current *= event.nativeEvent.scale;
      scale.setOffset(lastScale.current);
      scale.setValue(1);
    }
  };

  return (
    <PanGestureHandler onGestureEvent={onPanGestureEvent}>
      <Animated.View
        style={{
          position: 'absolute',
          transform: [
            { translateX },
            { translateY },
            { scale: Animated.multiply(scale, lastScale.current) },
          ],
        }}
      >
        <PinchGestureHandler
          onGestureEvent={onPinchGestureEvent}
          onHandlerStateChange={onPinchHandlerStateChange}
        >
          <Animated.Image
            source={src}
            style={[
              styles.sticker,
              { width: initialSize, height: initialSize },
            ]}
            resizeMode="contain"
          />
        </PinchGestureHandler>
      </Animated.View>
    </PanGestureHandler>
  );
}

const styles = StyleSheet.create({
  sticker: {
    // no positioning here—parent Animated.View handles it
  },
});