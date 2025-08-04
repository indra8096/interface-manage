'use client';

import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="py-6 mt-16"
      style={{ background: '#9933FF' }}
    >
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="font-karla-bold text-sm" style={{ color: '#FFFFFF' }}>
              © 2024 drelto. Tous droits réservés.
            </p>
            <p className="font-karla-regular text-xs mt-1" style={{ color: '#FFFFFF' }}>
              Système de gestion des services de cybersécurité
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
} 