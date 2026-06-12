import { motion } from 'framer-motion';

export function Scene3() {
  return (
    <motion.div className="absolute inset-0 flex flex-col items-center justify-center text-center px-12"
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.h2 className="text-5xl font-bold mb-8 text-[#7B2FBE]">Built for Scale</motion.h2>
      <div className="flex gap-8 items-center justify-center flex-wrap max-w-3xl">
        {['Expo', 'React Native', 'Express 5 API', 'PostgreSQL', 'Drizzle ORM'].map((tech, i) => (
          <motion.div 
            key={tech}
            className="text-2xl font-mono bg-black/50 px-6 py-3 rounded-full border border-[#7B2FBE]/50"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 + (i * 0.15), type: 'spring', stiffness: 300 }}
          >
            {tech}
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}