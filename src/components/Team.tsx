import React from 'react';
import { Github, Linkedin, Twitter, User } from 'lucide-react';

interface TeamMember {
  name: string;
  role: string;
  personality: string;
  avatar?: string;
  social: {
    github?: string;
    linkedin?: string;
    twitter?: string;
  };
}

const Team = () => {
  const teamMembers: TeamMember[] = [
  {
    name: "Kai Ingram",
    role: "Founder / Developer",
    personality: "Driven by curiosity. Building one line at a time with purpose and chaos.",
    avatar: "",
    social: {
      github: "#",
      linkedin: "#",
      twitter: "#"
    }
  },
  {
    name: "Callum Rhind",
    role: "Co-founder, Development Tester",
    personality: "Analytical mind with a sharp eye for detail. Makes sure nothing breaks—unless it’s supposed to.",
    avatar: "",
    social: {}
  },
  {
    name: "CynicalCircuit",
    role: "Development Tester",
    personality: "Skeptic by nature, perfectionist by choice. Breaks things so you don't have to.",
    avatar: "",
    social: {}
  },
  {
    name: "Godin Denis",
    role: "Tester, Gameplay Advisor, 3D Modeler",
    personality: "Loves tweaking mechanics and shaping worlds—both visually and mechanically.",
    avatar: "",
    social: {}
  },
  {
    name: "MockRanger805",
    role: "Tester, Gameplay Advisor",
    personality: "Gameplay-focused and always down to stress test wild ideas until they feel just right.",
    avatar: "",
    social: {}
  },
  {
    name: "Fae Godstchalk-Hart",
    role: "Tester, Story Advisor",
    personality: "Keeps the emotional core alive. Always asking 'But why does it matter to the player?'",
    avatar: "",
    social: {}
  },
  {
    name: "PrincessEvigail",
    role: "Tester, Creative Partner",
    personality: "Thinks big, dreams bigger. Injects creative chaos into everything.",
    avatar: "",
    social: {}
  }
];


  return (
    <section id="team" className="py-20 bg-gradient-to-b from-black to-gray-900 relative">
      {/* Background glow effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-electric/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-neon/5 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-cyber/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-5xl md:text-6xl font-orbitron font-bold mb-6 bg-gradient-to-r from-electric to-neon bg-clip-text text-transparent">
            The MuseFuze Team
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-electric to-neon mx-auto mb-8"></div>
          <p className="text-xl font-rajdhani text-gray-300 max-w-2xl mx-auto">
            A bunch of crazy people...we know!
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {teamMembers.map((member) => (
            <div key={member.name} className="group text-center">
              <div className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 border border-white/10 hover:border-electric/30 transition-all duration-300 hover:shadow-2xl hover:shadow-electric/20 hover:bg-white/10">
                <div className="relative mb-6">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-24 h-24 rounded-full mx-auto object-cover border-2 border-white/20 group-hover:border-electric/50 transition-colors duration-300"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full mx-auto bg-gradient-to-br from-electric/20 to-neon/20 border-2 border-white/20 group-hover:border-electric/50 transition-colors duration-300 flex items-center justify-center">
                      <User className="h-12 w-12 text-white/60" />
                    </div>
                  )}
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-electric/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>

                <h3 className="text-xl font-orbitron font-bold mb-2 text-white">{member.name}</h3>
                <p className="text-electric font-rajdhani font-medium mb-3">{member.role}</p>
                <p className="text-gray-300 font-rajdhani text-sm mb-4 italic">
                  "{member.personality}"
                </p>

                <div className="flex justify-center space-x-3">
                  {member.social.github && (
                    <a
                      href={member.social.github}
                      className="text-gray-400 hover:text-electric transition-colors duration-200"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Github className="h-5 w-5" />
                    </a>
                  )}
                  {member.social.linkedin && (
                    <a
                      href={member.social.linkedin}
                      className="text-gray-400 hover:text-electric transition-colors duration-200"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Linkedin className="h-5 w-5" />
                    </a>
                  )}
                  {member.social.twitter && (
                    <a
                      href={member.social.twitter}
                      className="text-gray-400 hover:text-electric transition-colors duration-200"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Team;
