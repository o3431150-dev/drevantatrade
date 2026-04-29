import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Gavel, UserCheck, ShieldAlert, AlertTriangle, 
  Scale, ArrowLeft, Ban, CheckCircle2 
} from 'lucide-react';

const TermsAndConditions = () => {
  const navigate = useNavigate();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const userResponsibilities = [
    "Provide accurate and truthful account information.",
    "Maintain high-level confidentiality of login credentials.",
    "Report suspicious activity to support immediately.",
    "Adhere to local digital asset trading regulations.",
    "Acknowledge and accept market risks responsibly."
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-gray-200 selection:bg-green-500/30 selection:text-white font-sans">
      
      {/* --- BACK NAVIGATION --- */}
      <div className="fixed top-6 left-6 z-50">
        <motion.button
          onClick={() => navigate(-1)}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -5 }}
          className="flex items-center gap-2 px-4 py-2 bg-gray-900/80 backdrop-blur-md border border-gray-800 rounded-full text-gray-400 hover:text-green-500 hover:border-green-500/50 transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium uppercase tracking-tighter">Exit Legal</span>
        </motion.button>
      </div>

      {/* --- HERO SECTION --- */}
      <section className="relative pt-32 pb-16 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-[radial-gradient(circle_at_bottom,_var(--tw-gradient-stops))] from-green-500/5 via-transparent to-transparent -z-10" />
        
        <motion.div 
          className="max-w-4xl mx-auto text-center"
          initial="initial"
          animate="animate"
          variants={fadeIn}
        >
          <div className="inline-flex items-center justify-center p-3 rounded-full bg-gray-900 border border-gray-800 mb-6">
            <Scale className="w-8 h-8 text-green-500" />
          </div>
          <span className="text-green-500 font-mono tracking-[0.4em] uppercase text-[10px] mb-4 block">Regulatory Framework</span>
          <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 tracking-tight leading-tight">
            Terms & <span className="text-green-500">Conditions.</span>
          </h1>
          <p className="text-lg text-gray-400 leading-relaxed max-w-2xl mx-auto">
            These terms govern your use of the DrevantaTrade platform. By accessing our services, you agree to comply with all rules, laws, and guidelines described here.
          </p>
        </motion.div>
      </section>

      {/* --- AGREEMENT SECTION --- */}
      <section className="py-20 px-6 bg-gray-950/50 border-y border-gray-900">
        <div className="max-w-4xl mx-auto grid md:grid-cols-[1fr_2fr] gap-12">
          <div>
            <h2 className="text-green-500 font-mono text-xs uppercase tracking-widest mb-2">Your Obligations</h2>
            <h3 className="text-2xl font-bold text-white">Agreement to Terms</h3>
          </div>
          <div className="space-y-6">
            <p className="text-gray-400 leading-relaxed">
              Using DrevantaTrade means you accept these Terms & Conditions. If you do not agree, please discontinue use of the platform. We designed these rules to protect users, ensure compliance, and maintain a fair trading environment.
            </p>
            <div className="flex items-start gap-4 p-4 rounded-xl bg-green-500/5 border border-green-500/20">
               <AlertTriangle className="w-5 h-5 text-green-500 shrink-0 mt-1" />
               <p className="text-sm text-gray-300">
                 Trading carries inherent risk. By agreeing, you confirm you have the capacity to make independent financial decisions.
               </p>
            </div>
          </div>
        </div>
      </section>

      {/* --- USER RESPONSIBILITIES --- */}
      <section className="py-24 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
            <div className="max-w-xl">
              <h2 className="text-green-500 font-mono text-xs uppercase tracking-widest mb-2">Compliance</h2>
              <h3 className="text-3xl font-bold text-white">User Responsibilities</h3>
            </div>
            <div className="text-gray-500 font-mono text-[10px] uppercase tracking-[0.2em]">Section 01 // Conduct</div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {userResponsibilities.map((text, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-6 rounded-2xl bg-gray-900/40 border border-gray-800 flex gap-4"
              >
                <div className="text-green-500 font-mono text-sm font-bold">0{idx + 1}</div>
                <p className="text-sm text-gray-400 leading-relaxed">{text}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- PLATFORM COMMITMENT --- */}
      <section className="py-24 px-6 bg-gray-900/20 border-t border-gray-900">
        <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-green-500 font-mono text-xs uppercase tracking-widest mb-2">Commitment</h2>
            <h3 className="text-3xl font-bold text-white mb-8 tracking-tight">Our Platform Responsibilities</h3>
            <div className="space-y-4">
              {[
                "Secure and reliable access to the terminal.",
                "Real-time, accurate market information.",
                "Strict adherence to data protection standards.",
                "Continuous system updates for security."
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-green-500" />
                  <span className="text-gray-300">{item}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
             <div className="absolute -inset-10 bg-green-500/5 blur-3xl rounded-full" />
             <div className="relative p-10 rounded-3xl bg-gray-950 border border-gray-800">
                <Gavel className="w-12 h-12 text-gray-800 mb-6" />
                <h4 className="text-white font-bold mb-4">Legal Notice</h4>
                <p className="text-sm text-gray-500 leading-relaxed mb-6">
                  DrevantaTrade reserves the right to modify these terms as global market regulations evolve. Continued use of the platform after updates constitutes acceptance of the new terms.
                </p>
                <div className="h-1 w-20 bg-green-500/30 rounded" />
             </div>
          </div>
        </div>
      </section>

      {/* --- SUSPENSION --- */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-green-500 font-mono text-xs uppercase tracking-widest mb-2">Protocol</h2>
          <h3 className="text-3xl font-bold text-white tracking-tight">Account Suspension or Termination</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {["Fraudulent Behavior", "Illegal Activity", "Platform Abuse", "Term Violations"].map((reason, idx) => (
            <div key={idx} className="p-6 rounded-xl bg-red-500/5 border border-red-500/10 text-center group hover:bg-red-500/10 transition-all">
              <Ban className="w-6 h-6 text-red-500/50 mx-auto mb-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">{reason}</span>
            </div>
          ))}
        </div>

        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-16 p-8 rounded-2xl bg-gray-900/50 border border-gray-800 text-center"
        >
          <ShieldAlert className="w-6 h-6 text-green-500 mx-auto mb-4" />
          <p className="text-sm text-gray-500 leading-relaxed max-w-2xl mx-auto">
            DrevantaTrade may suspend or terminate access to protect users and the platform. We encourage users to review these terms regularly to stay informed on our operational standards.
          </p>
        </motion.div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="py-12 border-t border-gray-900 text-center">
        <p className="text-gray-600 text-[10px] font-mono tracking-[0.2em] uppercase">
          &copy; 2026 DrevantaTrade. Terms of Service Revision 1.0.4.
        </p>
      </footer>

    </div>
  );
};

export default TermsAndConditions;