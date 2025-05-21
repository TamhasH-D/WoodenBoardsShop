import React from 'react';
import { motion } from 'framer-motion';

export function ProductSection() {
  const products = [
    { id: 1, name: 'Стандартный паллет (1200x800)', price: '10 USD', image: 'https://via.placeholder.com/300x200/A1887F/FFFFFF?text=Pallet+1' },
    { id: 2, name: 'Европаллет (1200x1000)', price: '12 USD', image: 'https://via.placeholder.com/300x200/A1887F/FFFFFF?text=Pallet+2' },
    { id: 3, name: 'Нестандартный паллет (под заказ)', price: 'Договорная', image: 'https://via.placeholder.com/300x200/A1887F/FFFFFF?text=Pallet+3' },
  ];

  return (
    <section id="products" className="py-16 bg-brand-background">
      <div className="container mx-auto px-6">
        <h2 className="text-4xl font-bold text-center text-brand-primary mb-12 font-heading">Наша Продукция</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product, index) => (
            <motion.div 
              key={product.id} 
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1, ease: "easeOut" }}
              className="bg-white rounded-lg shadow-xl overflow-hidden transform hover:scale-105 transition-transform duration-300"
            >
              <img src={product.image} alt={product.name} className="w-full h-48 object-cover"/>
              <div className="p-6">
                <h3 className="text-xl font-bold text-brand-primary mb-2 font-heading">{product.name}</h3>
                <p className="text-brand-secondary font-sans mb-4">Цена: {product.price}</p>
                <motion.button 
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full bg-brand-primary hover:bg-opacity-80 text-white font-bold py-2 px-4 rounded-lg transition duration-300 font-sans"
                >
                  Подробнее
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProductSection;