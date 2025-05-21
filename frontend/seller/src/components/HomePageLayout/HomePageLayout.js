import React from 'react';
import { Particles } from 'react-tsparticles';
import { loadFull } from 'tsparticles';
import Header from '../Header/Header';
import HeroSection from '../HeroSection/HeroSection';
import ProductSection from '../ProductSection/ProductSection';
import Footer from '../Footer/Footer';
import { particleOptions } from '../../config/particlesConfig';

export function HomePageLayout() {
  const particlesInit = async (main) => {
    await loadFull(main);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particleOptions}
        className="fixed inset-0 -z-10"
      />
      <Header />
      <main className="flex-grow">
        <HeroSection />
        <ProductSection />
      </main>
      <Footer />
    </div>
  );
}

export default HomePageLayout;