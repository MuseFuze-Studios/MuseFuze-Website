import React from 'react';
import { ArrowRight, Gamepad2, Crosshair, Play } from 'lucide-react';

const Hero = () => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden bg-black">
      {/* Subtle Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black opacity-50" />
      
      {/* Minimal Ambient Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-electric/3 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/4 w-80 h-80 bg-neon/3 rounded-full blur-3xl" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <div className="max-w-4xl mx-auto">
          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-orbitron font-black mb-8 leading-tight">
            <span className="text-white">MuseFuze</span>
            <br />
            <span className="bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
              Studios
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl lg:text-3xl font-rajdhani font-medium mb-6 text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Small team. Big ideas. No shortcuts.
          </p>
          
          <p className="text-lg md:text-xl font-rajdhani text-gray-400 mb-12 max-w-2xl mx-auto leading-relaxed">
            Independent game studio focused on building meaningful experiences with strong identity, character, and care.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-20">
            <button
              onClick={() => scrollTo('join-us')}
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-electric to-neon text-black font-rajdhani font-bold text-lg rounded-xl hover:shadow-2xl hover:shadow-electric/25 transition-all duration-300 hover:scale-105"
            >
              Join Our Team
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
            </button>
            
            <button
              onClick={() => scrollTo('about')}
              className="group inline-flex items-center px-8 py-4 bg-white/5 backdrop-blur-sm text-white font-rajdhani font-medium text-lg rounded-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
            >
              <Play className="mr-2 h-5 w-5" />
              Learn More
            </button>
          </div>

          {/* Projects Showcase */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* My Last Wish */}
            <div className="group">
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-electric/30 transition-all duration-500 hover:shadow-2xl hover:shadow-electric/10 hover:bg-white/10 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-electric/20 to-electric/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Gamepad2 className="h-8 w-8 text-electric" />
                </div>
                <h3 className="text-2xl font-orbitron font-bold mb-4 text-white">My Last Wish</h3>
                <p className="text-gray-300 font-rajdhani leading-relaxed">
                  A cinematic action experience rooted in grief and revenge. Built for those who crave depth, emotion, and impact with every choice.
                </p>
              </div>
            </div>

            {/* FRONTLINE */}
            <div className="group">
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl p-8 border border-white/10 hover:border-neon/30 transition-all duration-500 hover:shadow-2xl hover:shadow-neon/10 hover:bg-white/10 hover:-translate-y-2">
                <div className="w-16 h-16 bg-gradient-to-br from-neon/20 to-neon/10 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Crosshair className="h-8 w-8 text-neon" />
                </div>
                <h3 className="text-2xl font-orbitron font-bold mb-4 text-white">FRONTLINE</h3>
                <p className="text-gray-300 font-rajdhani leading-relaxed">
                  More information coming soon!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;