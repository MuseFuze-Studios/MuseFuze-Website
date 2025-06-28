import React, { useEffect, useState } from 'react';
import { Play, Star, Download, Eye, Palette, Users } from 'lucide-react';

interface GameInfo {
  title: string;
  tagline: string;
  description: string;
  features: string[];
  screenshots: string[];
  trailer: string;
}

const GamePage: React.FC = () => {
  const [gameInfo, setGameInfo] = useState<GameInfo | null>(null);
  const [activeScreenshot, setActiveScreenshot] = useState(0);

  useEffect(() => {
    fetchGameInfo();
  }, []);

  const fetchGameInfo = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/public/game-info');
      if (response.ok) {
        const data = await response.json();
        setGameInfo(data);
      }
    } catch (error) {
      console.error('Failed to fetch game info:', error);
    }
  };

  if (!gameInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-violet-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
            {gameInfo.title}
          </h1>
          <p className="text-2xl md:text-3xl text-violet-300 font-medium mb-8">
            {gameInfo.tagline}
          </p>
          <p className="text-xl text-gray-300 max-w-4xl mx-auto leading-relaxed mb-12">
            {gameInfo.description}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="group bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl transition-all duration-300 font-semibold text-lg flex items-center justify-center transform hover:scale-105">
              <Play className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Watch Trailer
            </button>
            <button className="group border-2 border-violet-400 text-violet-400 hover:bg-violet-400 hover:text-black px-8 py-4 rounded-xl transition-all duration-300 font-semibold text-lg flex items-center justify-center transform hover:scale-105">
              <Download className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
              Download Demo
            </button>
          </div>
        </div>

        {/* Screenshots Gallery */}
        <section className="mb-20">
          <h2 className="text-4xl font-bold text-center mb-12 text-white">
            Game <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Gallery</span>
          </h2>
          
          <div className="space-y-8">
            {/* Main Screenshot */}
            <div className="relative overflow-hidden rounded-2xl">
              <img
                src={gameInfo.screenshots[activeScreenshot]}
                alt={`${gameInfo.title} screenshot ${activeScreenshot + 1}`}
                className="w-full h-96 md:h-[500px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
            </div>

            {/* Screenshot Thumbnails */}
            <div className="grid grid-cols-3 gap-4">
              {gameInfo.screenshots.map((screenshot, index) => (
                <button
                  key={index}
                  onClick={() => setActiveScreenshot(index)}
                  className={`relative overflow-hidden rounded-xl transition-all duration-300 ${
                    activeScreenshot === index
                      ? 'ring-4 ring-violet-500 scale-105'
                      : 'hover:scale-105 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img
                    src={screenshot}
                    alt={`${gameInfo.title} thumbnail ${index + 1}`}
                    className="w-full h-24 md:h-32 object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
              Game <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Features</span>
            </h2>
            <p className="text-xl text-gray-400 max-w-3xl mx-auto">
              Discover the innovative mechanics and storytelling elements that make My Last Wish a unique experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {gameInfo.features.map((feature, index) => (
              <div
                key={index}
                className="p-8 bg-gray-800/30 rounded-2xl border border-gray-700 hover:border-violet-500/50 transition-all duration-300 group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {index === 0 && <Eye className="h-6 w-6 text-white" />}
                  {index === 1 && <Star className="h-6 w-6 text-white" />}
                  {index === 2 && <Users className="h-6 w-6 text-white" />}
                  {index === 3 && <Palette className="h-6 w-6 text-white" />}
                  {index === 4 && <Play className="h-6 w-6 text-white" />}
                  {index === 5 && <Download className="h-6 w-6 text-white" />}
                </div>
                <p className="text-gray-300 leading-relaxed text-lg">{feature}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Story Section */}
        <section className="mb-20">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-3xl p-8 md:p-12 border border-gray-700">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  The Story of <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Sophie</span>
                </h2>
                <div className="space-y-6 text-gray-300 text-lg leading-relaxed">
                  <p>
                    Enter the mind of Sophie, a contract killer whose perception of reality has been fractured by trauma. In her world, most people appear as greyed-out shadows, invisible until they pose a threat or hold significance to her mission.
                  </p>
                  <p>
                    This unique visual system isn't just a game mechanic—it's a window into Sophie's psychological state. As you progress through her story, the colors in her world shift and change, reflecting her emotional journey and mental state.
                  </p>
                  <p>
                    Navigate through a world where stealth and combat are just two paths toward the same goal: understanding what it means to be human when you've lost touch with your own humanity.
                  </p>
                </div>
              </div>
              
              <div className="relative">
                <div className="aspect-video bg-gradient-to-br from-violet-900/30 to-purple-900/30 rounded-2xl border border-violet-500/30 flex items-center justify-center">
                  <button className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/20 transition-all duration-300 group">
                    <Play className="h-8 w-8 text-white ml-1 group-hover:scale-110 transition-transform" />
                  </button>
                </div>
                <p className="text-center text-gray-400 mt-4">Click to watch the story trailer</p>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specs */}
        <section className="mb-20">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-6 text-white">
              Technical <span className="bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">Specifications</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="p-8 bg-gray-800/30 rounded-2xl border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6">Minimum Requirements</h3>
              <div className="space-y-4 text-gray-300">
                <div className="flex justify-between">
                  <span>OS:</span>
                  <span>Windows 10 64-bit</span>
                </div>
                <div className="flex justify-between">
                  <span>Processor:</span>
                  <span>Intel i5-8400 / AMD Ryzen 5 2600</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <span>8 GB RAM</span>
                </div>
                <div className="flex justify-between">
                  <span>Graphics:</span>
                  <span>GTX 1060 6GB / RX 580 8GB</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage:</span>
                  <span>25 GB available space</span>
                </div>
              </div>
            </div>

            <div className="p-8 bg-gray-800/30 rounded-2xl border border-gray-700">
              <h3 className="text-2xl font-bold text-white mb-6">Recommended Requirements</h3>
              <div className="space-y-4 text-gray-300">
                <div className="flex justify-between">
                  <span>OS:</span>
                  <span>Windows 11 64-bit</span>
                </div>
                <div className="flex justify-between">
                  <span>Processor:</span>
                  <span>Intel i7-10700K / AMD Ryzen 7 3700X</span>
                </div>
                <div className="flex justify-between">
                  <span>Memory:</span>
                  <span>16 GB RAM</span>
                </div>
                <div className="flex justify-between">
                  <span>Graphics:</span>
                  <span>RTX 3070 / RX 6700 XT</span>
                </div>
                <div className="flex justify-between">
                  <span>Storage:</span>
                  <span>25 GB SSD space</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-violet-900/30 via-purple-900/30 to-pink-900/30 rounded-3xl p-8 md:p-12 border border-violet-500/30">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Ready to Begin Sophie's Journey?
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Download the demo and experience the first chapter of My Last Wish. Your choices will shape Sophie's path to redemption.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white px-8 py-4 rounded-xl transition-all duration-300 font-semibold text-lg flex items-center justify-center transform hover:scale-105">
                <Download className="mr-2 h-5 w-5" />
                Download Demo
              </button>
              <button className="border-2 border-violet-400 text-violet-400 hover:bg-violet-400 hover:text-black px-8 py-4 rounded-xl transition-all duration-300 font-semibold text-lg flex items-center justify-center transform hover:scale-105">
                <Star className="mr-2 h-5 w-5" />
                Add to Wishlist
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default GamePage;