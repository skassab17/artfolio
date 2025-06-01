import React, { useRef } from 'react';
import { Animated, Image, StyleSheet } from 'react-native';
import {
  PanGestureHandler,
  PinchGestureHandler,
  State,
  RotationGestureHandler,
} from 'react-native-gesture-handler';
import type { PinchGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import type { PinchGestureHandlerGestureEvent } from 'react-native-gesture-handler';
import type { PanGestureHandlerStateChangeEvent } from 'react-native-gesture-handler';
import type {
  RotationGestureHandlerGestureEvent,
  RotationGestureHandlerStateChangeEvent,
} from 'react-native-gesture-handler';

export default function DraggableSticker({
  id,
  src,
  initialX,
  initialY,
  initialSize,
  onDragBegin,
  onDragEnd,
}: {
  id: string;
  src: any;
  initialX: number;
  initialY: number;
  initialSize: number;
  onDragBegin: () => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}) {
  // Animated values for pan & scale
  const translateX = useRef(new Animated.Value(initialX)).current;
  const translateY = useRef(new Animated.Value(initialY)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const scaleValueRef = useRef(1);
  const rotation = useRef(new Animated.Value(0)).current;
  const rotationValueRef = useRef(0);
  const panRef = useRef(null);
  const pinchRef = useRef(null);
  const rotateRef = useRef(null);

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
    { useNativeDriver: false }
  );

  const onPanHandlerStateChange = (event: PanGestureHandlerStateChangeEvent) => {
    
    const { state, translationX, translationY } = event.nativeEvent;
    if (state === State.BEGAN) {
      onDragBegin?.();
      // start next drag from current position
      translateX.setOffset((translateX as any).__getValue());
      translateX.setValue(0);
      translateY.setOffset((translateY as any).__getValue());
      translateY.setValue(0);
    } else if (state === State.END || state === State.CANCELLED) {
      const { absoluteX, absoluteY } = event.nativeEvent;
      onDragEnd?.(id, absoluteX, absoluteY);
      // merge offset and value so pinch will continue properly
      translateX.flattenOffset();
      translateY.flattenOffset();
    }
  };

  // Pinch handler
  const onPinchGestureEvent = (event: PinchGestureHandlerGestureEvent) => {
    const gestureScale = event.nativeEvent.scale;
    const newScale = scaleValueRef.current * gestureScale;
    scale.setValue(newScale);
  };

  // Rotate handler
  const onRotateGestureEvent = (event: RotationGestureHandlerGestureEvent) => {
    // Apply current rotation plus gesture delta
    const newRot = rotationValueRef.current + event.nativeEvent.rotation;
    rotation.setValue(newRot);
  };

  const onRotateHandlerStateChange = (event: RotationGestureHandlerStateChangeEvent) => {
    if (event.nativeEvent.state === State.END) {
      // Store accumulated rotation
      rotationValueRef.current += event.nativeEvent.rotation;
      rotation.setOffset(rotationValueRef.current);
      rotation.setValue(0);
    }
  };

  // Interpolate rotation to degrees string
  const rotateStr = rotation.interpolate({
    inputRange: [-Math.PI, Math.PI],
    outputRange: ['-180deg', '180deg'],
  });

  return (
    <RotationGestureHandler
      ref={rotateRef}
      simultaneousHandlers={[panRef, pinchRef]}
      onGestureEvent={onRotateGestureEvent}
      onHandlerStateChange={onRotateHandlerStateChange}
    >
      <PinchGestureHandler
        ref={pinchRef}
        simultaneousHandlers={[panRef, rotateRef]}
        onGestureEvent={onPinchGestureEvent}
        onHandlerStateChange={(event: PinchGestureHandlerStateChangeEvent) => {
          if (event.nativeEvent.state === State.END) {
            // Commit the scale factor
            scaleValueRef.current *= event.nativeEvent.scale;
            scale.setValue(scaleValueRef.current);
          }
        }}
      >
        <PanGestureHandler
          ref={panRef}
          simultaneousHandlers={[pinchRef, rotateRef]}
          onGestureEvent={onPanGestureEvent}
          onHandlerStateChange={onPanHandlerStateChange}
        >
          <Animated.View
            style={{
              position: 'absolute',
              transform: [
                { translateX },
                { translateY },
                { scale },
                { rotate: rotateStr },
              ],
            }}
          >
            <Animated.Image
              source={src}
              style={[
                styles.sticker,
                { width: initialSize + 100, height: initialSize + 100 },
              ]}
              resizeMode="contain"
            />
          </Animated.View>
        </PanGestureHandler>
      </PinchGestureHandler>
    </RotationGestureHandler>
  );
}

const styles = StyleSheet.create({
  sticker: {
    // no positioning here—parent Animated.View handles it
  },
});