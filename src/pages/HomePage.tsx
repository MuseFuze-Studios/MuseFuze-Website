import React from 'react';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import About from '../components/About';
import Shop from '../components/Shop';
import Team from '../components/Team';
import PublicFinances from '../components/PublicFinances';
import JoinUs from '../components/JoinUs';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="bg-black">
      <Navigation />
      <main>
        <Hero />
        <About />
        <Shop />
        <PublicFinances />
        <Team />
        <JoinUs />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;