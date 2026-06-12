import { motion } from 'framer-motion';

export function Scene2() {
  return (
    <motion.div className="absolute inset-0 flex items-center justify-center text-center px-12"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="w-full max-w-4xl">
        <motion.h2 className="text-5xl font-bold mb-8 text-[#E91E8C]">Everything in one place</motion.h2>
        <div className="grid grid-cols-3 gap-6">
          {['Home Feed', 'Reels', 'Dating Match', 'Chat', 'Live Streams', 'Audio Rooms'].map((feature, i) => (
            <motion.div 
              key={feature}
              className="bg-white/10 p-6 rounded-2xl border border-white/20"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + (i * 0.1) }}
            >
              <h3 className="text-xl font-semibold">{feature}</h3>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}