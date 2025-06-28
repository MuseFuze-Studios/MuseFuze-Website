import React, { useEffect, useState } from 'react';
import { Users, Target, Heart, Zap, Award, Globe } from 'lucide-react';

interface CompanyInfo {
  name: string;
  mission: string;
  values: string[];
  team: {
    size: string;
    founded: string;
    location: string;
  };
}

const AboutPage: React.FC = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);

  useEffect(() => {
    fetchCompanyInfo();
  }, []);

  const fetchCompanyInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/public/company-info');
      if (response.ok) {
        const data = await response.json();
        setCompanyInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch company info:', error);
    }
  };

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            About MuseFuze Studios
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
            We are passionate storytellers, innovative developers, and creative visionaries united by a shared mission to redefine interactive entertainment
          </p>
        </div>

        {companyInfo && (
          <>
            {/* Mission Section */}
            <section className="mb-20">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 md:p-12 border border-gray-700">
                <div className="flex items-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mr-4">
                    <Target className="h-6 w-6 text-white" />
                  </div>
                  <h2 className="text-3xl md:text-4xl font-bold text-white">Our Mission</h2>
                </div>
                <p className="text-xl text-gray-300 leading-relaxed">
                  {companyInfo.mission}
                </p>
              </div>
            </section>

            {/* Values Section */}
            <section className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  Our <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Values</span>
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  These principles guide everything we do, from concept to creation to community engagement
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8">
                {companyInfo.values.map((value, index) => (
                  <div
                    key={index}
                    className="p-8 bg-gray-800/30 rounded-2xl border border-gray-700 hover:border-violet-500/50 transition-all duration-300 group"
                  >
                    <div className="flex items-start space-x-4">
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                        <Heart className="h-4 w-4 text-white" />
                      </div>
                      <p className="text-gray-300 leading-relaxed text-lg">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Team Section */}
            <section className="mb-20">
              <div className="text-center mb-12">
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  Meet Our <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Team</span>
                </h2>
                <p className="text-xl text-gray-400 max-w-3xl mx-auto">
                  A diverse group of creators from around the world, united by passion and dedication to craft
                </p>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center p-8 bg-gray-800/30 rounded-2xl border border-gray-700 hover:border-violet-500/50 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Users className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Team Size</h3>
                  <p className="text-gray-400 text-lg">{companyInfo.team.size}</p>
                </div>

                <div className="text-center p-8 bg-gray-800/30 rounded-2xl border border-gray-700 hover:border-violet-500/50 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Award className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Founded</h3>
                  <p className="text-gray-400 text-lg">{companyInfo.team.founded}</p>
                </div>

                <div className="text-center p-8 bg-gray-800/30 rounded-2xl border border-gray-700 hover:border-violet-500/50 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
                    <Globe className="h-8 w-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-4">Location</h3>
                  <p className="text-gray-400 text-lg">{companyInfo.team.location}</p>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Journey Section */}
        <section className="mb-20">
          <div className="bg-gradient-to-r from-violet-900/20 via-purple-900/20 to-pink-900/20 rounded-3xl p-8 md:p-12 border border-violet-500/20">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                Our <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Journey</span>
              </h2>
              <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                Founded with the vision of creating games that matter, MuseFuze Studios emerged from a shared belief that interactive media can be a powerful force for emotional connection and personal reflection. Our debut title, "My Last Wish," represents years of passionate development and innovative storytelling techniques.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Innovation First</h3>
                <p className="text-gray-300 leading-relaxed">
                  We constantly push boundaries, experimenting with new mechanics and narrative techniques to create truly unique experiences.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Emotional Depth</h3>
                <p className="text-gray-300 leading-relaxed">
                  Every game we create is designed to resonate on a deeper level, exploring themes that matter and stories that stick with you.
                </p>
              </div>

              <div className="text-center">
                <div className="w-20 h-20 bg-gradient-to-br from-violet-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white mb-4">Community Driven</h3>
                <p className="text-gray-300 leading-relaxed">
                  Our players are our partners. We listen, we learn, and we evolve based on the feedback and stories you share with us.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 md:p-12 border border-gray-700">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Experience Our Vision?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Discover "My Last Wish" and step into a world where every choice matters and every moment tells a story.
            </p>
            <a
              href="/game"
              className="inline-flex items-center bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl transition-all duration-300 font-semibold text-lg transform hover:scale-105"
            >
              Explore My Last Wish
              <Zap className="ml-2 h-5 w-5" />
            </a>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AboutPage;