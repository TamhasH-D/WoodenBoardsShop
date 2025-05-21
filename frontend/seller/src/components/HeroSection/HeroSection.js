import React from 'react';
import { motion } from 'framer-motion';

export function HeroSection() {
  return (
    <section 
      className="h-screen bg-cover bg-center flex items-center justify-center text-white relative"
      
    >
      <div className="absolute inset-0 bg-black opacity-50"></div> {/* Overlay for better text readability */}
      <div className="text-center z-10 p-4">
        <motion.h1 
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-5xl md:text-7xl font-bold font-heading mb-6"
        >
          Качественные Паллеты из Дерева
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
          className="text-xl md:text-2xl font-sans mb-8"
        >
          Надежные решения для вашего бизнеса. Оптом и в розницу.
        </motion.p>
        <motion.button
          onClick={() => {
            document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
          }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="mt-8 inline-block rounded-md bg-brand-primary px-6 py-3 text-lg font-medium text-white shadow-lg transition-colors hover:bg-brand-primary-dark"
        >
          Смотреть Каталог
        </motion.button>
      </div>
    </section>
  );
}

export default HeroSection;