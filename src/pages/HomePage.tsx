import React from 'react';
import Navigation from '../components/Navigation';
import Hero from '../components/Hero';
import About from '../components/About';
import Shop from '../components/Shop';
import Team from '../components/Team';
import JoinUs from '../components/JoinUs';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  return (
    <>
      <Navigation />
      <main>
        <Hero />
        <About />
        <Shop />
        <Team />
        <JoinUs />
      </main>
      <Footer />
    </>
  );
};

export default HomePage;