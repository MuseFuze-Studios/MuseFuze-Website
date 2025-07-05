import React from 'react';
import { Target, Rocket, Zap } from 'lucide-react';

const About = () => {
  return (
    <section id="about" className="py-24 bg-gray-50 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-orbitron font-bold mb-6 text-gray-900">
            About Us
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-electric to-neon mx-auto mb-8"></div>
          <div className="max-w-4xl mx-auto">
            <p className="text-xl md:text-2xl font-rajdhani text-gray-700 leading-relaxed mb-8">
              MuseFuze Studios creates products with intention, not compromise.
              Every detail is crafted for those who expect more, from design to performance.
              No shortcuts. No clutter. Just quality you can feel, and value you'll remember.
            </p>
            <p className="text-lg font-rajdhani text-gray-600 leading-relaxed">
              Every project we begin is designed to redefine the standard, to disrupt markets, challenge expectations, and leave customers wanting more.
            </p>
          </div>
        </div>

        {/* Values Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
          <div className="text-center group">
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-electric/10 to-electric/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Target className="h-10 w-10 text-electric" />
              </div>
              <h3 className="text-2xl font-orbitron font-bold mb-4 text-gray-900">Mission Driven</h3>
              <p className="text-gray-600 font-rajdhani leading-relaxed">
                Everything we build starts with purpose. We focus on what matters — impact, experience, and lasting value.
              </p>
            </div>
          </div>

          <div className="text-center group">
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-neon/10 to-neon/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Rocket className="h-10 w-10 text-neon" />
              </div>
              <h3 className="text-2xl font-orbitron font-bold mb-4 text-gray-900">Innovation First</h3>
              <p className="text-gray-600 font-rajdhani leading-relaxed">
                We don't chase trends — we build what others haven't imagined yet. Innovation isn't an option. It's our instinct.
              </p>
            </div>
          </div>

          <div className="text-center group">
            <div className="bg-white rounded-3xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
              <div className="w-20 h-20 bg-gradient-to-br from-cyber/10 to-cyber/5 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                <Zap className="h-10 w-10 text-cyber" />
              </div>
              <h3 className="text-2xl font-orbitron font-bold mb-4 text-gray-900">Dare to Differ</h3>
              <p className="text-gray-600 font-rajdhani leading-relaxed">
                Great ideas don't come from playing it safe. We question everything, break the mold, and deliver the unexpected.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;