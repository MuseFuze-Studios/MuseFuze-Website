import React from 'react';
import { Target, Rocket, Zap } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-20 bg-gradient-to-b from-black to-gray-900 relative">
      {/* Glassmorphism background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 right-10 w-80 h-80 bg-electric/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-10 w-96 h-96 bg-neon/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 right-1/4 w-64 h-64 bg-cyber/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-orbitron font-bold mb-6 bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
            About Us
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-electric to-neon mx-auto mb-8"></div>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xl md:text-2xl font-rajdhani text-gray-200 leading-relaxed mb-8">
              We're not just another studio. We're digital rebels who believe that great ideas deserve extraordinary execution. 
              Born from a passion for pushing creative boundaries, MuseFuze Studios exists to challenge conventions and create 
              experiences that matter.
            </p>
            <p className="text-lg font-rajdhani text-gray-300 leading-relaxed">
              Every project we touch becomes a statement. Every line of code carries our DNA of innovation. 
              We don't follow trends—we set them.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center group">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-electric/30 transition-all duration-300 hover:shadow-2xl hover:shadow-electric/20 hover:bg-white/10">
                <Target className="h-16 w-16 text-electric mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="text-xl font-orbitron font-bold mb-3 text-white">Mission Driven</h3>
                <p className="text-gray-300 font-rajdhani">
                  To create digital experiences that inspire, challenge, and transform how people interact with technology.
                </p>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-neon/30 transition-all duration-300 hover:shadow-2xl hover:shadow-neon/20 hover:bg-white/10">
                <Rocket className="h-16 w-16 text-neon mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="text-xl font-orbitron font-bold mb-3 text-white">Innovation First</h3>
                <p className="text-gray-300 font-rajdhani">
                  We embrace cutting-edge technologies and unconventional approaches to solve complex creative challenges.
                </p>
              </div>
            </div>

            <div className="text-center group">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-8 border border-white/10 hover:border-cyber/30 transition-all duration-300 hover:shadow-2xl hover:shadow-cyber/20 hover:bg-white/10">
                <Zap className="h-16 w-16 text-cyber mx-auto mb-4 group-hover:scale-110 transition-transform duration-200" />
                <h3 className="text-xl font-orbitron font-bold mb-3 text-white">Dare to Differ</h3>
                <p className="text-gray-300 font-rajdhani">
                  We reject the ordinary and champion bold ideas that others wouldn't dare to pursue. Different is our default.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;