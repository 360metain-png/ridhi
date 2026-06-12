import { motion } from 'framer-motion';

export function Scene4() {
  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12"
      initial={{ opacity: 0, filter: 'blur(20px)' }}
      animate={{ opacity: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, filter: 'blur(20px)' }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div className="text-[120px] mb-4">🇮🇳</motion.div>
      <motion.h2 className="text-5xl font-bold mb-6"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        13 Indian Languages
      </motion.h2>
      <motion.p className="text-2xl text-white/70 max-w-2xl"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Connect with your community in the language you love. Seamless Dark & Light themes.
      </motion.p>
    </motion.div>
  );
}