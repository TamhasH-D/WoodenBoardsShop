import React from 'react';
import { motion } from 'framer-motion';

export function Footer() {
  return (
    <footer className="bg-brand-primary text-white py-8">
      <div className="container mx-auto px-6">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <h3 className="text-2xl font-bold font-heading mb-2">WoodPallet Co.</h3>
            <p className="font-sans">Качественные деревянные паллеты с 2010 года</p>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-8 space-y-4 md:space-y-0">
            <div>
              <h4 className="text-lg font-bold font-heading mb-2">Контакты</h4>
              <ul className="font-sans space-y-1">
                <li>+7 (123) 456-78-90</li>
                <li>info@woodpallet.com</li>
                <li>г. Москва, ул. Деревянная, 42</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-bold font-heading mb-2">Соцсети</h4>
              <div className="flex space-x-4">
                <motion.a 
                  href="#" 
                  whileHover={{ scale: 1.1 }}
                  className="block w-8 h-8 bg-brand-secondary rounded-full flex items-center justify-center"
                >
                  <span className="sr-only">Facebook</span>
                </motion.a>
                <motion.a 
                  href="#" 
                  whileHover={{ scale: 1.1 }}
                  className="block w-8 h-8 bg-brand-secondary rounded-full flex items-center justify-center"
                >
                  <span className="sr-only">Instagram</span>
                </motion.a>
                <motion.a 
                  href="#" 
                  whileHover={{ scale: 1.1 }}
                  className="block w-8 h-8 bg-brand-secondary rounded-full flex items-center justify-center"
                >
                  <span className="sr-only">Telegram</span>
                </motion.a>
              </div>
            </div>
          </div>
        </div>
        <div className="border-t border-brand-secondary mt-8 pt-6 text-center font-sans">
          <p>© 2023 WoodPallet Co. Все права защищены.</p>
        </div>
      </div>
    </footer>
  );
}

export default Footer;