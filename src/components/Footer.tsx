'use client';

import { motion } from 'framer-motion';

export default function Footer() {
  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.4 }}
      className="bg-[#CCFF00] py-6 mt-16"
    >
      <div className="max-w-7xl mx-auto px-8">
        <div className="flex items-center justify-center">
          <div className="text-center">
            <p className="text-[#000000] font-karla-bold text-sm">
              © 2025 drelto. Tous droits réservés.
            </p>
            <p className="text-[#000000] font-karla-regular text-xs mt-1">
              Système de gestion des services de cybersécurité
            </p>
          </div>
        </div>
      </div>
    </motion.footer>
  );
} 