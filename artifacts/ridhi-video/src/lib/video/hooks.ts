import { useEffect, useState } from 'react';

export function useVideoPlayer({ durations }: { durations: Record<string, number> }) {
  const [currentScene, setCurrentScene] = useState(0);
  const keys = Object.keys(durations);
  
  useEffect(() => {
    // Start recording on mount
    if (window.startRecording) {
      window.startRecording();
    }
    
    let isRecordingComplete = false;
    let timer: any;
    
    const advance = (index: number) => {
      if (index >= keys.length) {
        if (!isRecordingComplete && window.stopRecording) {
          window.stopRecording();
          isRecordingComplete = true;
        }
        setCurrentScene(0);
        timer = setTimeout(() => advance(1), durations[keys[0]]);
        return;
      }
      
      setCurrentScene(index);
      timer = setTimeout(() => advance(index + 1), durations[keys[index]]);
    };
    
    timer = setTimeout(() => advance(1), durations[keys[0]]);
    
    return () => clearTimeout(timer);
  }, []);
  
  return { currentScene };
}

declare global {
  interface Window {
    startRecording?: () => void;
    stopRecording?: () => void;
  }
}