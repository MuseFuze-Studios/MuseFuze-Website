import React from 'react';
import Navigation from '../components/Navigation';
import ModernHomePage from './ModernHomePage';
import Footer from '../components/Footer';

const HomePage: React.FC = () => {
  return (
    <div className="bg-black">
      <Navigation />
      <main className="pt-16">
        <ModernHomePage />
      </main>
      <Footer />
    </div>
  );
};

export default HomePage;