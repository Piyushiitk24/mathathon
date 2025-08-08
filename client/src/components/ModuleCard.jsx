import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function ModuleCard({ module }) {
  const navigate = useNavigate();

  const startRevision = () => {
    navigate(`/module/${module.id}/revision`);
  };

  return (
    <motion.div
      className="panel panel--accent card-lift p-6 relative overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={{ scale: 1.02 }}
    >
      <div className="absolute top-4 right-4 flex items-center space-x-2">
        <span className="led led-green" />
        <span className="font-mono text-xs text-charcoal bg-neon-green px-2 py-1 rounded shadow-bezel">ONLINE</span>
      </div>
      <div className="mb-4">
        <h3 className="font-heading text-2xl uppercase tracking-widest text-charcoal">{module.name}</h3>
        <p className="font-body text-text-subtle">Practice and revision set</p>
      </div>
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <span className="font-mono text-xs text-text-subtle">MODE</span>
          <span className="font-mono text-sm text-charcoal bg-yellow-bright px-2 py-1 rounded shadow-bezel">STUDY</span>
        </div>
        <motion.button
          onClick={startRevision}
          className="btn-retro btn-retro--orange flex items-center space-x-2"
          whileHover={{ x: 2 }}
        >
          <span>Enter</span>
          <ArrowRight className="w-4 h-4 text-charcoal" />
        </motion.button>
      </div>
    </motion.div>
  );
}

export default ModuleCard;
