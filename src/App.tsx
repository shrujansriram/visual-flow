import { useState } from 'react'
import { motion } from 'framer-motion'
import { Menu, X } from 'lucide-react'

export default function App() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-deep-space-black text-white overflow-x-hidden">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-neon-blue to-neon-purple rounded-lg flex items-center justify-center">
                <span className="neon-text text-sm font-bold">KG</span>
              </div>
              <span className="neon-text hidden sm:inline">KnowledgeGalaxy</span>
            </motion.div>

            {/* Desktop Menu */}
            <motion.div
              className="hidden md:flex items-center space-x-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              <a href="#explore" className="text-gray-300 hover:text-neon-blue transition-smooth">
                Explore
              </a>
              <a href="#features" className="text-gray-300 hover:text-neon-blue transition-smooth">
                Features
              </a>
              <a href="#about" className="text-gray-300 hover:text-neon-blue transition-smooth">
                About
              </a>
              <button className="px-6 py-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-semibold hover:shadow-glow transition-smooth">
                Get Started
              </button>
            </motion.div>

            {/* Mobile menu button */}
            <button
              className="md:hidden text-neon-blue"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {isMenuOpen && (
            <motion.div
              className="md:hidden pb-4 space-y-4"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <a href="#explore" className="block text-gray-300 hover:text-neon-blue">
                Explore
              </a>
              <a href="#features" className="block text-gray-300 hover:text-neon-blue">
                Features
              </a>
              <a href="#about" className="block text-gray-300 hover:text-neon-blue">
                About
              </a>
              <button className="w-full px-6 py-2 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-semibold">
                Get Started
              </button>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-16 px-4">
        {/* Background effects */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-neon-blue/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-neon-purple/10 rounded-full blur-3xl" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-neon-blue via-neon-purple to-neon-blue bg-clip-text text-transparent">
                KnowledgeGalaxy
              </span>
            </h1>
          </motion.div>

          <motion.p
            className="text-xl md:text-2xl text-gray-400 mb-8 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Explore a mesmerizing 3D knowledge graph visualization powered by advanced physics and cutting-edge web technologies.
          </motion.p>

          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <button className="px-8 py-4 bg-gradient-to-r from-neon-blue to-neon-purple rounded-lg font-bold text-deep-space-black hover:shadow-glow transition-smooth text-lg">
              Launch Explorer
            </button>
            <button className="px-8 py-4 border-2 border-neon-blue rounded-lg font-bold text-neon-blue hover:bg-neon-blue/10 transition-smooth text-lg">
              Learn More
            </button>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl font-bold text-center mb-16 neon-text"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            Key Features
          </motion.h2>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: '3D Visualization',
                description: 'Interactive 3D knowledge graph with physics-based layout',
              },
              {
                title: 'Real-time Interaction',
                description: 'Smooth animations and intuitive navigation controls',
              },
              {
                title: 'Modern Stack',
                description: 'Built with React, Vite, Three.js, and Tailwind CSS',
              },
            ].map((feature, index) => (
              <motion.div
                key={index}
                className="neon-card p-6 hover:shadow-neon-blue transition-smooth"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <h3 className="text-xl font-bold mb-3 text-neon-blue">{feature.title}</h3>
                <p className="text-gray-400">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-neon-blue/20 py-8 px-4 mt-20">
        <div className="max-w-6xl mx-auto text-center text-gray-400">
          <p>KnowledgeGalaxy © 2024 | Built for the Hackathon</p>
        </div>
      </footer>
    </div>
  )
}
