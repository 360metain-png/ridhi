import { motion, AnimatePresence } from 'framer-motion';
import { useVideoPlayer } from '@/lib/video/hooks';
import { Scene1 } from './video_scenes/Scene1';
import { Scene2 } from './video_scenes/Scene2';
import { Scene3 } from './video_scenes/Scene3';
import { Scene4 } from './video_scenes/Scene4';
import { Scene5 } from './video_scenes/Scene5';

const SCENE_DURATIONS = { open: 4000, demo: 5000, tech: 4000, feature: 4500, close: 4000 };

export default function VideoTemplate() {
  const { currentScene } = useVideoPlayer({ durations: SCENE_DURATIONS });

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#121212] flex items-center justify-center">
      <div className="absolute inset-0">
        <motion.div 
          className="absolute w-[800px] h-[800px] rounded-full opacity-30 blur-[100px]"
          style={{ background: 'radial-gradient(circle, #7B2FBE, transparent)' }}
          animate={{ x: ['-20%', '80%', '0%'], y: ['0%', '60%', '10%'], scale: [1, 1.2, 0.9] }}
          transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }} 
        />
        <motion.div 
          className="absolute w-[600px] h-[600px] rounded-full opacity-20 blur-[100px] right-0 bottom-0"
          style={{ background: 'radial-gradient(circle, #E91E8C, transparent)' }}
          animate={{ x: ['10%', '-50%', '5%'], y: ['-10%', '-60%', '-20%'] }}
          transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} 
        />
      </div>

      <AnimatePresence mode="popLayout">
        {currentScene === 0 && <Scene1 key="open" />}
        {currentScene === 1 && <Scene2 key="demo" />}
        {currentScene === 2 && <Scene3 key="tech" />}
        {currentScene === 3 && <Scene4 key="feature" />}
        {currentScene === 4 && <Scene5 key="close" />}
      </AnimatePresence>
    </div>
  );
}