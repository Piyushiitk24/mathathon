import React from 'react';
import { motion } from 'framer-motion';
import { Calculator, User, LogOut, Settings } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

function Header({ user, onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogoClick = () => {
    navigate('/');
  };

  const handleAdminClick = () => {
    navigate('/admin');
  };

  const isAdminPage = location.pathname === '/admin';

  return (
    <motion.header
      className="bg-charcoal text-white border-b-4 border-neon-green shadow-glow-green"
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div 
            className="flex items-center space-x-3 cursor-pointer"
            onClick={handleLogoClick}
          >
            <motion.div
              className="bg-neon-green p-2 rounded-lg shadow-glow-green"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Calculator className="w-6 h-6 text-charcoal" />
            </motion.div>
            <div className="flex items-center space-x-3">
              <span className="led led-green" />
              <h1 className="font-heading tracking-widest text-xl md:text-2xl font-extrabold uppercase">Mathathon</h1>
            </div>
          </div>

          {/* User Info and Actions */}
          <div className="flex items-center space-x-4">
            {/* User Info */}
            <div className="flex items-center space-x-2 bg-deep-green-700 px-3 py-2 rounded-lg border border-neon-green shadow-bezel">
              <User className="w-4 h-4 text-neon-green" />
              <span className="font-mono font-semibold text-neon-green uppercase tracking-wide text-xs md:text-sm">
                {user.username}
              </span>
            </div>

            {/* Admin Button */}
            {!isAdminPage && (
              <motion.button
                onClick={handleAdminClick}
                className="btn-retro btn-retro--orange flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Settings className="w-4 h-4 text-charcoal" />
                <span>Admin</span>
              </motion.button>
            )}

            {/* Logout Button */}
            <motion.button
              onClick={onLogout}
              className="btn-retro flex items-center space-x-2 bg-neon-green"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <LogOut className="w-4 h-4 text-charcoal" />
              <span>Logout</span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.header>
  );
}

export default Header;
