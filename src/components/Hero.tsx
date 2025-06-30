import React from 'react';
import { ArrowRight, Gamepad2, Crosshair } from 'lucide-react';

const Hero = () => {
  const scrollTo = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section id="home" className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Background Layers */}
      <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-900 to-black" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,212,255,0.08)_0%,transparent_50%)]" />

      {/* Ambient Glow Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-20 w-96 h-96 bg-electric/5 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-neon/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-cyber/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '4s' }} />
      </div>

      <div className="container mx-auto px-6 text-center relative z-10">
        <div className="animate-slide-up">
          <h1 className="text-6xl md:text-8xl font-orbitron font-black mb-6 bg-gradient-to-r from-white via-electric to-neon bg-clip-text text-transparent">
            MuseFuze Studios
          </h1>

          <p className="text-2xl md:text-4xl font-rajdhani font-bold mb-8 text-gray-200">
            Small team. Big ideas. No shortcuts.
          </p>
          <p className="text-lg md:text-xl font-rajdhani text-gray-300 mb-12 max-w-2xl mx-auto">
            MuseFuze is an independent game studio focused on building meaningful experiences with strong identity, character, and care.
          </p>

          <button
          onClick={() => scrollTo('join-us')}
          className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-electric to-neon text-black font-rajdhani font-bold text-lg rounded-lg hover:shadow-xl hover:shadow-electric/25 transition-all duration-300 group"
        >
          Join Us
          <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-200" />
        </button>

        </div>

        {/* Projects */}
        <div className="mt-20 grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* My Last Wish */}
          <div className="group cursor-pointer">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-electric/30 transition-all duration-300 hover:shadow-2xl hover:shadow-electric/20 animate-float hover:bg-white/10">
              <Gamepad2 className="h-12 w-12 text-electric mb-4 group-hover:scale-110 transition-transform duration-200" />
              <h3 className="text-2xl font-orbitron font-bold mb-3 text-white">My Last Wish</h3>
              <p className="text-gray-300 font-rajdhani">
                A cinematic action experience rooted in grief and revenge. Built for those who crave depth, emotion, and impact with every choice.
              </p>
            </div>
          </div>

          {/* FRONTLINE */}
          <div className="group cursor-pointer">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-neon/30 transition-all duration-300 hover:shadow-2xl hover:shadow-neon/20 animate-float hover:bg-white/10" style={{ animationDelay: '1s' }}>
              <Crosshair className="h-12 w-12 text-neon mb-4 group-hover:scale-110 transition-transform duration-200" />
              <h3 className="text-2xl font-orbitron font-bold mb-3 text-white">FRONTLINE</h3>
              <p className="text-gray-300 font-rajdhani">
                More information coming soon!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
