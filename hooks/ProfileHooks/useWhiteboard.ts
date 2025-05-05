import { useState } from 'react';
export function useWhiteboard() {
  const [drawingUri, setDrawingUri] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  return { drawingUri, modalVisible, setModalVisible, setDrawingUri };
}