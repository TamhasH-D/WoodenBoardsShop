import React, { useCallback } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Particles from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import { motion } from 'framer-motion';

// Dynamic background with particles

const particleOptions = {
  background: {
    color: {
      value: '#F5F5F5', // Light Gray - brand-background
    },
  },
  fpsLimit: 60,
  interactivity: {
    events: {
      onClick: {
        enable: true,
        mode: 'push',
      },
      onHover: {
        enable: true,
        mode: 'repulse',
      },
      resize: true,
    },
    modes: {
      push: {
        quantity: 2,
      },
      repulse: {
        distance: 100,
        duration: 0.4,
      },
    },
  },
  particles: {
    color: {
      value: '#5D4037', // Deep Brown - brand-primary
    },
    links: {
      color: '#A1887F', // Light Brown - brand-secondary
      distance: 150,
      enable: true,
      opacity: 0.5,
      width: 1,
    },
    collisions: {
      enable: true,
    },
    move: {
      direction: 'none',
      enable: true,
      outModes: {
        default: 'bounce',
      },
      random: false,
      speed: 2,
      straight: false,
    },
    number: {
      density: {
        enable: true,
        area: 800,
      },
      value: 50,
    },
    opacity: {
      value: 0.5,
    },
    shape: {
      type: 'circle',
    },
    size: {
      value: { min: 1, max: 5 },
    },
  },
  detectRetina: true,
};

function Header() {
  return (
    <header className="bg-brand-primary shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <a href="#" className="text-white font-heading text-2xl font-bold">WoodPallet Co.</a>
        <div>
          <a href="#products" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium font-sans">Продукция</a>
          <a href="#about" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium font-sans">О нас</a>
          <a href="#contact" className="text-gray-300 hover:text-white px-3 py-2 rounded-md text-sm font-medium font-sans">Контакты</a>
        </div>
      </nav>
    </header>
  );
}

function HeroSection() {
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

function ProductSection() {
  // Placeholder for product listings
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

function Footer() {
  return (
    <footer className="bg-brand-primary text-gray-300 py-8">
      <div className="container mx-auto px-6 text-center">
        <p className="font-sans">&copy; {new Date().getFullYear()} WoodPallet Co. Все права защищены.</p>
        <p className="font-sans text-sm mt-2">Дизайн и разработка с ❤️</p>
      </div>
    </footer>
  );
}

function HomePageLayout() {
  const particlesInit = useCallback(async engine => {
    await loadFull(engine);
  }, []);

  const particlesLoaded = useCallback(async container => {
    // console.log(container);
  }, []);

  return (
    <div className="flex flex-col min-h-screen relative">
      <Particles
        id="tsparticles"
        init={particlesInit}
        loaded={particlesLoaded}
        options={particleOptions}
        className="absolute inset-0 z-0" // Ensure particles are in the background
      />
      <div className="relative z-10"> {/* Content wrapper */}
        <Header />
        <main className="flex-grow">
          <HeroSection />
          <ProductSection />
          {/* Add more sections like About Us, Contact, etc. here */}
        </main>
        <Footer />
      </div>
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePageLayout />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;