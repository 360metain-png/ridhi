import { motion } from 'framer-motion';

export function Scene1() {
  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.1 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.img 
        src="/artifacts/ridhi/assets/images/ridhi_logo.png" 
        alt="Ridhi Logo"
        className="w-32 h-32 mb-8"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 300, damping: 20 }}
      />
      <motion.h1 className="text-6xl font-bold mb-4"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        Meet Ridhi
      </motion.h1>
      <motion.p className="text-2xl text-white/70"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        The India-based, globally first social universal app.
      </motion.p>
    </motion.div>
  );
}