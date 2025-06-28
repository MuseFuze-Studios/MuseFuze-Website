import React, { useState } from 'react';
import { ExternalLink, X, ShoppingBag } from 'lucide-react';
import { siteConfig } from '../config/settings';

interface Product {
  id: number;
  name: string;
  type: string;
  price: string;
  image: string;
  description: string;
  storeUrl: string;
}

const Shop = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const products: Product[] = [
    {
      id: 1,
      name: "MuseFuze Cyber Hoodie",
      type: "Hoodie",
      price: "$65",
      image: "https://images.pexels.com/photos/7679720/pexels-photo-7679720.jpeg?auto=compress&cs=tinysrgb&w=500",
      description: "Premium quality hoodie with electric blue MuseFuze logo and cyber-inspired design elements.",
      storeUrl: "#"
    },
    {
      id: 2,
      name: "Innovation Tee",
      type: "T-Shirt",
      price: "$35",
      image: "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg?auto=compress&cs=tinysrgb&w=500",
      description: "Soft cotton tee featuring our signature 'Innovating Boldly' slogan in neon print.",
      storeUrl: "#"
    },
    {
      id: 3,
      name: "Digital Rebel Cap",
      type: "Hat",
      price: "$28",
      image: "https://images.pexels.com/photos/1124465/pexels-photo-1124465.jpeg?auto=compress&cs=tinysrgb&w=500",
      description: "Structured cap with embroidered MuseFuze logo and adjustable strap for the perfect fit.",
      storeUrl: "#"
    },
    {
      id: 4,
      name: "FRONTLINE Tech Tee",
      type: "T-Shirt",
      price: "$40",
      image: "https://images.pexels.com/photos/8532664/pexels-photo-8532664.jpeg?auto=compress&cs=tinysrgb&w=500",
      description: "Limited edition shirt celebrating our FRONTLINE tactical FPS with sleek geometric patterns.",
      storeUrl: "#"
    },
    {
      id: 5,
      name: "Creator's Crewneck",
      type: "Sweatshirt",
      price: "$55",
      image: "https://images.pexels.com/photos/7679617/pexels-photo-7679617.jpeg?auto=compress&cs=tinysrgb&w=500",
      description: "Comfortable crewneck sweatshirt perfect for late-night coding sessions and creative sprints.",
      storeUrl: "#"
    },
    {
      id: 6,
      name: "Fearless Snapback",
      type: "Hat",
      price: "$32",
      image: "https://images.pexels.com/photos/1128685/pexels-photo-1128685.jpeg?auto=compress&cs=tinysrgb&w=500",
      description: "Bold snapback featuring 'Creating Fearlessly' embroidery with premium materials.",
      storeUrl: "#"
    }
  ];

  // If shop is disabled, show unavailable message
  if (!siteConfig.shop.enabled) {
    return (
      <section id="shop" className="py-20 bg-black relative">
        {/* Glassmorphism background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 left-10 w-72 h-72 bg-electric/5 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon/5 rounded-full blur-3xl"></div>
        </div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-orbitron font-bold mb-6 bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
              Shop
            </h2>
            <div className="w-24 h-1 bg-gradient-to-r from-electric to-neon mx-auto mb-8"></div>
          </div>

          <div className="max-w-2xl mx-auto text-center">
            <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-12 border border-white/10">
              <ShoppingBag className="h-16 w-16 text-gray-400 mx-auto mb-6" />
              <h3 className="text-2xl font-orbitron font-bold mb-4 text-white">Shop Currently Unavailable</h3>
              <p className="text-xl font-rajdhani text-gray-300 mb-6">
                Currently, the shop is unavailable :(
              </p>
              <p className="text-gray-400 font-rajdhani">
                We're working hard to bring you some amazing MuseFuze merchandise. Check back soon!
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="shop" className="py-20 bg-black relative">
      {/* Glassmorphism background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-electric/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-cyber/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-orbitron font-bold mb-6 bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
            Shop
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-electric to-neon mx-auto mb-8"></div>
          <p className="text-xl font-rajdhani text-gray-300 max-w-2xl mx-auto">
            Wear your creativity. Express your rebellion. Rep the MuseFuze movement.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {products.map((product) => (
            <div
              key={product.id}
              className="group cursor-pointer"
              onClick={() => setSelectedProduct(product)}
            >
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl overflow-hidden border border-white/10 hover:border-electric/30 transition-all duration-300 hover:shadow-2xl hover:shadow-electric/20 hover:bg-white/10">
                <div className="aspect-square overflow-hidden">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="p-6">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-orbitron font-bold text-white">{product.name}</h3>
                    <span className="text-electric font-rajdhani font-bold text-lg">{product.price}</span>
                  </div>
                  <p className="text-gray-300 font-rajdhani text-sm">{product.type}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Product Modal */}
        {selectedProduct && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-xl z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-auto border border-white/20">
              <div className="relative">
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-4 right-4 text-gray-300 hover:text-white z-10 bg-black/20 backdrop-blur-sm rounded-full p-2"
                >
                  <X className="h-6 w-6" />
                </button>
                
                <div className="md:flex">
                  <div className="md:w-1/2">
                    <img
                      src={selectedProduct.image}
                      alt={selectedProduct.name}
                      className="w-full aspect-square object-cover rounded-l-2xl"
                    />
                  </div>
                  <div className="md:w-1/2 p-8">
                    <h3 className="text-2xl font-orbitron font-bold mb-2 text-white">{selectedProduct.name}</h3>
                    <p className="text-electric font-rajdhani font-bold text-xl mb-4">{selectedProduct.price}</p>
                    <p className="text-gray-200 font-rajdhani mb-6">{selectedProduct.description}</p>
                    
                    <a
                      href={selectedProduct.storeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-electric to-neon text-black font-rajdhani font-bold rounded-lg hover:shadow-xl hover:shadow-electric/25 transition-all duration-300"
                    >
                      Buy on Store
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Shop;