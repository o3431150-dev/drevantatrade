import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Shield, Globe, Target, Zap, TrendingUp, 
  Lock, Cpu, Headset, ArrowLeft 
} from 'lucide-react';

const About = () => {
  const navigate = useNavigate();

  // Animation variants
  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const values = [
    { title: "Transparency", desc: "Open operations and clear data feeds", icon: <TrendingUp className="w-6 h-6" /> },
    { title: "Safety", desc: "User protection and responsible trading", icon: <Lock className="w-6 h-6" /> },
    { title: "Innovation", desc: "Leading the way in Web3 technology", icon: <Cpu className="w-6 h-6" /> },
    { title: "Support", desc: "Expert assistance available 24/7", icon: <Headset className="w-6 h-6" /> },
  ];

  const highlights = [
    "Real-time market data for Forex, Gold, & Stocks",
    "Secure multi-signature wallet architecture",
    "Hybrid CEX + Web3 trading ecosystem",
    "Instant order execution with low latency",
    "Educational resources for new investors"
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 selection:bg-green-500/30 selection:text-white font-sans overflow-x-hidden">
      
      {/* --- NAVIGATION: BACK OPTION --- */}
      <div className="fixed top-6 left-6 z-50">
        <motion.button
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-full text-gray-400 hover:text-green-500 hover:border-green-500/50 transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium tracking-wide">Back</span>
        </motion.button>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent -z-10" />
        
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <span className="text-green-500 font-mono tracking-widest uppercase text-xs mb-4 block">Reliability First</span>
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 tracking-tight leading-tight">
            The Future of <span className="text-green-500">Global Trade.</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto">
            DrevantaTrade is built for traders who expect secure, transparent, and high-performance tools across every asset class.
          </p>
        </motion.div>
      </section>

      {/* --- WHO WE ARE --- */}
      <section className="py-20 px-6 border-y border-gray-900 bg-gray-950/50">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-green-500 font-mono text-sm mb-2 uppercase tracking-wider">Global Perspective</h2>
            <h3 className="text-3xl font-bold text-white mb-6 tracking-tight">Who We Are</h3>
            <p className="text-gray-400 mb-6 leading-relaxed">
              DrevantaTrade is a digital asset platform built to provide secure, transparent, and intuitive trading tools for users worldwide. Our team brings over a decade of combined experience across fintech, market analysis, and blockchain infrastructure.
            </p>
            <p className="text-gray-400 leading-relaxed italic border-l-2 border-green-500 pl-6 py-2 bg-green-500/5">
              "We focus on stability, accuracy, and user protection. Every feature we ship is designed to give traders fast performance backed by reliable data."
            </p>
          </motion.div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="h-44 bg-gray-900 rounded-2xl border border-gray-800 flex flex-col items-center justify-center group hover:border-green-500/30 transition-all">
               <Globe className="w-10 h-10 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest text-center">Worldwide<br/>Connectivity</span>
            </div>
            <div className="h-44 bg-gray-900 rounded-2xl border border-gray-800 flex flex-col items-center justify-center mt-8 group hover:border-green-500/30 transition-all">
               <Shield className="w-10 h-10 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
               <span className="text-[10px] font-mono text-gray-500 uppercase tracking-widest text-center">Institutional<br/>Security</span>
            </div>
          </div>
        </div>
      </section>

      {/* --- MISSION STATEMENT --- */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="p-10 md:p-16 rounded-[2rem] bg-gradient-to-b from-gray-900 to-gray-950 border border-gray-800 shadow-2xl"
        >
          <Target className="w-12 h-12 text-green-500 mx-auto mb-6" />
          <h2 className="text-green-500 font-mono text-xs mb-2 uppercase tracking-widest">The Goal</h2>
          <h3 className="text-3xl font-bold text-white mb-6">Our Mission</h3>
          <p className="text-xl text-gray-300 leading-relaxed">
            To make professional-grade trading accessible for everyone by providing simple tools, strong security standards, and high-quality customer support.
          </p>
        </motion.div>
      </section>

      {/* --- CORE VALUES --- */}
      <section className="py-20 px-6 bg-gray-900/20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-green-500 font-mono text-xs mb-2 uppercase tracking-widest">Foundations</h2>
            <h3 className="text-4xl font-bold text-white tracking-tight">Our Values</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((val, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 rounded-2xl bg-gray-950 border border-gray-800 hover:border-green-500/50 transition-all hover:-translate-y-1"
              >
                <div className="mb-5 text-green-500">{val.icon}</div>
                <h4 className="text-white font-bold mb-3 text-lg">{val.title}</h4>
                <p className="text-sm text-gray-400 leading-relaxed">{val.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PLATFORM HIGHLIGHTS --- */}
      <section className="py-24 px-6 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-green-500 font-mono text-xs mb-2 uppercase tracking-widest">Ecosystem</h2>
            <h3 className="text-4xl font-bold text-white mb-8 tracking-tight">Platform Highlights</h3>
            <ul className="space-y-6">
              {highlights.map((item, idx) => (
                <motion.li 
                  key={idx}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                  className="flex items-start space-x-4 text-gray-300"
                >
                  <Zap className="w-5 h-5 text-green-500 mt-1 shrink-0" />
                  <span className="text-lg">{item}</span>
                </motion.li>
              ))}
            </ul>
          </motion.div>
          
          {/* Mock UI Element */}
          <div className="relative group">
            <div className="absolute -inset-4 bg-green-500/10 blur-3xl rounded-full opacity-50 group-hover:opacity-100 transition-opacity" />
            <div className="relative bg-gray-900 border border-gray-800 p-8 rounded-3xl shadow-2xl transform group-hover:scale-[1.02] transition-transform">
              <div className="flex justify-between items-center mb-10">
                <div className="flex gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-800" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-800" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gray-800" />
                </div>
                <div className="px-3 py-1 bg-green-500/10 border border-green-500/20 rounded text-[9px] font-mono text-green-500 uppercase tracking-tighter">
                  System: Active
                </div>
              </div>
              <div className="space-y-6">
                <div className="h-2 w-full bg-gray-800/50 rounded" />
                <div className="h-2 w-2/3 bg-gray-800/50 rounded" />
                <div className="h-40 w-full bg-gray-950/50 border border-gray-800/50 rounded-xl flex flex-col items-center justify-center p-6 mt-6">
                  <div className="w-12 h-12 rounded-full border-2 border-green-500/20 border-t-green-500 animate-spin mb-4" />
                  <div className="text-green-500 font-mono text-[10px] tracking-[0.2em] animate-pulse uppercase">
                    Aggregating Market Feeds
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FOOTER CTA (Optional) --- */}
      <footer className="py-20 border-t border-gray-900 text-center">
        <p className="text-gray-500 text-sm font-mono tracking-widest uppercase">
          &copy; 2026 DrevantaTrade. Digital Assets & Brokerage.
        </p>
      </footer>

    </div>
  );
};

export default About;