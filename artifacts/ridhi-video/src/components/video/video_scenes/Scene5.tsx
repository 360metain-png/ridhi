import { motion } from 'framer-motion';

export function Scene5() {
  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.img
        src={`${import.meta.env.BASE_URL}ridhi_logo.png`}
        alt="Ridhi Logo"
        className="w-48 h-48 mb-8"
        initial={{ scale: 0 }}
        animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 15 }}
      />
      <motion.h1 className="text-7xl font-bold mb-4 bg-gradient-to-r from-[#7B2FBE] to-[#E91E8C] text-transparent bg-clip-text"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        Ridhi
      </motion.h1>
      <motion.p className="text-3xl text-white/80"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
      >
        Find your vibe.
      </motion.p>
    </motion.div>
  );
}