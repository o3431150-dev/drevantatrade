import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, Lock, EyeOff, Database, 
  FileText, ArrowLeft, Fingerprint, Activity 
} from 'lucide-react';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const dataCategories = [
    { title: "Account Details", item: "Name, email, and contact number", icon: <Fingerprint className="w-5 h-5" /> },
    { title: "Tech Data", item: "Device and browser information", icon: <Database className="w-5 h-5" /> },
    { title: "Market Activity", item: "Trading activity and patterns", icon: <Activity className="w-5 h-5" /> },
    { title: "History", item: "Comprehensive transaction logs", icon: <FileText className="w-5 h-5" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 selection:bg-green-500/30 selection:text-white font-sans overflow-x-hidden">
      
      {/* --- BACK BUTTON --- (Responsive positioning) */}
      <div className="fixed top-4 left-4 md:top-6 md:left-6 z-50">
        <motion.button
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          className="flex items-center gap-2 px-3 py-2 md:px-4 md:py-2 bg-gray-900/90 backdrop-blur-md border border-gray-800 rounded-full text-gray-400 hover:text-green-500 hover:border-green-500/50 transition-all group"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-xs md:text-sm font-medium uppercase tracking-tighter">Back</span>
        </motion.button>
      </div>

      {/* --- HERO SECTION --- (Responsive text and padding) */}
      <section className="relative pt-24 pb-12 md:pt-32 md:pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-green-500/10 via-transparent to-transparent -z-10" />
        
        <motion.div 
          className="max-w-4xl mx-auto text-center relative z-10"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <div className="inline-flex items-center justify-center p-2 md:p-3 rounded-2xl bg-green-500/10 border border-green-500/20 mb-4 md:mb-6">
            <ShieldCheck className="w-6 h-6 md:w-8 md:h-8 text-green-500" />
          </div>
          <span className="text-green-500 font-mono tracking-[0.2em] md:tracking-[0.3em] uppercase text-[9px] md:text-[10px] mb-3 md:mb-4 block">Confidentiality Protocol</span>
          <h1 className="text-3xl md:text-6xl font-bold text-white mb-4 md:mb-6 tracking-tight leading-tight">
            Your Privacy, <br className="hidden md:block" />
            <span className="text-green-500 underline decoration-green-500/30 underline-offset-4 md:underline-offset-8">Encrypted.</span>
          </h1>
          <p className="text-sm md:text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto px-2">
            We protect your personal information using advanced security systems. DrevantaTrade does not sell or share user data with third parties without explicit consent.
          </p>
        </motion.div>
      </section>

      {/* --- DATA COMMITMENT --- (Stacking on mobile) */}
      <section className="py-12 md:py-20 px-6 bg-gray-950/50 border-y border-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-[1fr_2fr] gap-8 md:gap-12">
            <div>
              <h2 className="text-green-500 font-mono text-[10px] md:text-xs uppercase tracking-widest mb-2 text-center md:text-left">Data Protection</h2>
              <h3 className="text-xl md:text-2xl font-bold text-white text-center md:text-left">Our Privacy Commitment</h3>
            </div>
            <div className="space-y-4">
              <p className="text-sm md:text-base text-gray-400 leading-relaxed text-center md:text-left px-2">
                Your privacy is fundamental to how we operate. We collect only the data needed to secure accounts, deliver services, and comply with applicable financial regulations.
              </p>
              <div className="flex items-center justify-center md:justify-start gap-3 md:gap-4 text-xs md:text-sm text-gray-500 font-mono italic">
                <EyeOff className="w-3.5 h-3.5 md:w-4 md:h-4 text-green-500" />
                No 3rd-party data brokerage. Ever.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- INFORMATION WE COLLECT --- (Responsive Grid) */}
      <section className="py-16 md:py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10 md:mb-16">
            <h2 className="text-green-500 font-mono text-[10px] md:text-xs uppercase tracking-widest mb-2">Data Categories</h2>
            <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight">Information We Collect</h3>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {dataCategories.map((cat, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-5 md:p-6 rounded-2xl bg-gray-900/40 border border-gray-800 hover:border-green-500/40 transition-all flex flex-row sm:flex-col items-center sm:items-start gap-4 sm:gap-0"
              >
                <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-gray-950 border border-gray-800 flex items-center justify-center text-green-500 shrink-0 sm:mb-4">
                  {cat.icon}
                </div>
                <div>
                  <h4 className="text-white font-bold text-sm md:text-base mb-1 md:mb-2">{cat.title}</h4>
                  <p className="text-[10px] md:text-xs text-gray-500 leading-relaxed uppercase tracking-tighter">
                    {cat.item}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HOW WE USE INFORMATION --- (Mobile ordering) */}
      <section className="py-16 md:py-24 px-6 bg-gray-900/20">
        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center">
          {/* Order-2 on mobile so text comes first */}
          <div className="relative order-2 md:order-1 px-2">
             <div className="absolute -inset-6 md:-inset-10 bg-green-500/5 blur-3xl rounded-full" />
             <div className="relative space-y-3 md:space-y-4">
                {["Account Security", "Identity Verification", "Transaction Processing", "Performance Optimization", "Support Notices"].map((text, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-3 p-3 md:p-4 rounded-xl bg-gray-950 border border-gray-800"
                  >
                    <div className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full bg-green-500 shrink-0" />
                    <span className="text-[10px] md:text-sm font-medium text-gray-300 uppercase tracking-wide">{text}</span>
                  </motion.div>
                ))}
             </div>
          </div>
          <div className="order-1 md:order-2 text-center md:text-left">
            <h2 className="text-green-500 font-mono text-[10px] md:text-xs uppercase tracking-widest mb-2">Purpose</h2>
            <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6 tracking-tight leading-tight">How We Use Your Information</h3>
            <p className="text-sm md:text-base text-gray-400 leading-relaxed mb-6 px-2 md:px-0">
              Data usage is strictly restricted to operational necessity. We prioritize the integrity of our platform and the legal safety of our users.
            </p>
            <div className="p-4 rounded-lg bg-green-500/5 border-l-4 border-green-500 inline-block text-left">
               <p className="text-[10px] md:text-xs text-green-500/80 font-mono italic">
                 "DrevantaTrade operates under strict Zero-Knowledge principles where possible for sensitive documents."
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- SECURITY --- (Responsive Padding and text) */}
      <section className="py-16 md:py-24 px-6 max-w-4xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="relative overflow-hidden p-8 md:p-12 rounded-[1.5rem] md:rounded-[2.5rem] bg-gray-900 border border-gray-800 text-center"
        >
          <Lock className="w-10 h-10 md:w-12 md:h-12 text-green-500 mx-auto mb-4 md:mb-6" />
          <h2 className="text-green-500 font-mono text-[10px] md:text-xs uppercase tracking-widest mb-2">Security</h2>
          <h3 className="text-2xl md:text-3xl font-bold text-white mb-4 md:mb-6">How We Protect Data</h3>
          <p className="text-sm md:text-lg text-gray-400 leading-relaxed mb-8 px-2 md:px-0">
            All data is encrypted and stored under strict security protocols. Access to sensitive information is limited and audited.
          </p>
          <div className="flex flex-wrap justify-center gap-2 md:gap-4">
             {["AES-256", "SSL Certified", "SOC2 Compliant"].map((badge, i) => (
               <span key={i} className="px-2 py-1 md:px-3 md:py-1 border border-gray-800 rounded-full text-[8px] md:text-[10px] font-mono uppercase tracking-widest text-gray-600">
                 {badge}
               </span>
             ))}
          </div>
        </motion.div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-8 md:py-12 border-t border-gray-900 text-center">
        <p className="text-gray-600 text-[8px] md:text-[10px] font-mono tracking-[0.2em] uppercase px-4">
          &copy; 2026 DrevantaTrade. Privacy Infrastructure Unit.
        </p>
      </footer>

    </div>
  );
};

export default PrivacyPolicy;