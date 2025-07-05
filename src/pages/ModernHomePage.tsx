import React, { useRef } from 'react';
import { Gamepad2, Crosshair, Target, Rocket, Zap } from 'lucide-react';
import useInView from '../hooks/useInView';

const ModernHomePage: React.FC = () => {
  const heroRef = useRef<HTMLDivElement>(null);
  const project1Ref = useRef<HTMLDivElement>(null);
  const project2Ref = useRef<HTMLDivElement>(null);
  const value1Ref = useRef<HTMLDivElement>(null);
  const value2Ref = useRef<HTMLDivElement>(null);
  const value3Ref = useRef<HTMLDivElement>(null);

  const heroInView = useInView(heroRef);
  const project1InView = useInView(project1Ref);
  const project2InView = useInView(project2Ref);
  const value1InView = useInView(value1Ref);
  const value2InView = useInView(value2Ref);
  const value3InView = useInView(value3Ref);

  return (
    <div className="bg-black text-white font-inter">
      {/* Hero Section */}
      <section
        ref={heroRef}
        className="min-h-[calc(100vh-4rem)] flex items-center justify-center text-center bg-gradient-to-br from-gray-950 via-black to-gray-900 relative overflow-hidden"
      >
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-electric/10 rounded-full blur-3xl" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-neon/10 rounded-full blur-2xl" />
        </div>
        <div
          className={`relative z-10 px-4 transition-all duration-700 ${heroInView ? 'animate-slide-up' : 'opacity-0 translate-y-12'}`}
        >
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-orbitron font-black mb-6 bg-gradient-to-r from-electric to-neon text-transparent bg-clip-text">
            Creating Fearlessly. Innovating Boldly.
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl font-rajdhani text-gray-300 mb-10 max-w-3xl mx-auto">
            We build games and software that challenge, connect, and matter.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="px-8 py-4 rounded-xl font-rajdhani font-bold text-black bg-gradient-to-r from-electric to-neon hover:shadow-xl hover:shadow-electric/30 transition">
              Join Our Team
            </button>
            <button className="px-8 py-4 rounded-xl font-rajdhani text-white border border-white/20 hover:bg-white/10 transition">
              View Projects
            </button>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="py-24 bg-black text-white">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-orbitron font-bold text-center mb-12">
            Featured Projects
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div
              ref={project1Ref}
              className={`bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:bg-white/10 hover:shadow-xl hover:shadow-electric/20 transition-all duration-500 hover:-translate-y-2 ${project1InView ? 'animate-slide-up' : 'opacity-0 translate-y-12'}`}
            >
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl mb-4 bg-electric/10">
                <Gamepad2 className="h-8 w-8 text-electric" />
              </div>
              <h3 className="text-2xl font-orbitron font-bold mb-2">My Last Wish</h3>
              <p className="text-gray-300 font-rajdhani">
                A cinematic action experience rooted in grief and revenge.
              </p>
            </div>

            <div
              ref={project2Ref}
              className={`bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 hover:bg-white/10 hover:shadow-xl hover:shadow-neon/20 transition-all duration-500 hover:-translate-y-2 ${project2InView ? 'animate-slide-up' : 'opacity-0 translate-y-12'}`}
            >
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl mb-4 bg-neon/10">
                <Crosshair className="h-8 w-8 text-neon" />
              </div>
              <h3 className="text-2xl font-orbitron font-bold mb-2">FRONTLINE</h3>
              <p className="text-gray-300 font-rajdhani">Tactical FPS gameplay in development.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Company Values */}
      <section className="py-24 bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4">
          <h2 className="text-3xl sm:text-4xl font-orbitron font-bold text-center mb-12">
            Our Values
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div
              ref={value1Ref}
              className={`bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 transition-all duration-500 ${value1InView ? 'animate-slide-up' : 'opacity-0 translate-y-12'}`}
            >
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl mb-4 bg-electric/10">
                <Target className="h-8 w-8 text-electric" />
              </div>
              <h3 className="text-xl font-orbitron font-bold mb-2">Mission Driven</h3>
              <p className="text-gray-300 font-rajdhani">
                We pursue ideas that matter and craft experiences that last.
              </p>
            </div>
            <div
              ref={value2Ref}
              className={`bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 transition-all duration-500 ${value2InView ? 'animate-slide-up' : 'opacity-0 translate-y-12'}`}
            >
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl mb-4 bg-neon/10">
                <Rocket className="h-8 w-8 text-neon" />
              </div>
              <h3 className="text-xl font-orbitron font-bold mb-2">Innovation First</h3>
              <p className="text-gray-300 font-rajdhani">
                We invent solutions instead of following trends.
              </p>
            </div>
            <div
              ref={value3Ref}
              className={`bg-white/5 backdrop-blur-xl p-8 rounded-3xl border border-white/10 transition-all duration-500 ${value3InView ? 'animate-slide-up' : 'opacity-0 translate-y-12'}`}
            >
              <div className="w-14 h-14 flex items-center justify-center rounded-2xl mb-4 bg-cyber/10">
                <Zap className="h-8 w-8 text-cyber" />
              </div>
              <h3 className="text-xl font-orbitron font-bold mb-2">Dare to Differ</h3>
              <p className="text-gray-300 font-rajdhani">
                We embrace bold ideas that set us apart.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ModernHomePage;
