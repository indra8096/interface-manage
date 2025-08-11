'use client';

import { motion } from 'framer-motion';

export default function DropZoneDemo() {
  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-karla-bold text-white mb-8 text-center">
          Démonstration du Design "Déposer Ici"
        </h1>
        
        {/* Simulation de l'interface comme sur la photo */}
        <div className="bg-gray-900 p-8 rounded-2xl border border-gray-800">
          {/* Header avec "SERVICES ACTIFS" et "ONLINE" */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-left">
              <span className="text-sm font-karla-medium text-gray-300">
                SERVICES ACTIFS
              </span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full animate-pulse bg-green-400"></div>
              <span className="text-xs font-karla-medium text-gray-300">ONLINE</span>
            </div>
          </div>
          
          {/* Zone de dépôt avec design exact de la photo */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="w-full p-6 rounded-xl border-2 border-dashed flex items-center justify-center transition-all duration-300 cursor-pointer"
            style={{
              borderColor: '#CCFF00',
              background: '#556B2F'
            }}
          >
            <div className="text-center">
              {/* Icône avec deux flèches verticales (haut et bas) */}
              <svg 
                className="w-8 h-8 mx-auto mb-3 transition-colors duration-300" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
                style={{ color: '#CCFF00' }}
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" 
                />
              </svg>
              <p 
                className="font-karla-bold text-base transition-colors duration-300" 
                style={{ color: '#CCFF00' }}
              >
                DÉPOSER ICI
              </p>
            </div>
          </motion.div>
          
          {/* Informations sur le design */}
          <div className="mt-8 p-6 bg-gray-800 rounded-xl">
            <h3 className="text-lg font-karla-bold text-white mb-4">Caractéristiques du Design :</h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Fond vert olive foncé (#556B2F)</li>
              <li>• Bordure pointillée verte vive (#CCFF00)</li>
              <li>• Icône avec deux flèches verticales en vert vif</li>
              <li>• Texte "DÉPOSER ICI" en vert vif</li>
              <li>• Coins arrondis (rounded-xl)</li>
              <li>• Animation au survol avec scale</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
