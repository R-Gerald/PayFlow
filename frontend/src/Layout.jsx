import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Home, Users, BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Layout({ children }) {
  const location = useLocation();
  const currentPath = location.pathname;

  const navItems = [
    { name: 'Home', icon: Home, label: 'Accueil' },
    { name: 'Clients', icon: Users, label: 'Clients' },
    { name: 'Statistics', icon: BarChart3, label: 'Stats' }
  ];

  const isActive = (pageName) => {
    const pageUrl = createPageUrl(pageName);
    return currentPath === pageUrl || currentPath === pageUrl + '/';
  };

  // Don't show nav on ClientDetail page
  const hideNav = currentPath.includes('ClientDetail');

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {children}
      
      {!hideNav && (
        <motion.nav 
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-3 sm:px-6 py-2 sm:py-3 z-50 safe-area-inset-bottom"
        >
          <div className="max-w-md mx-auto flex justify-around items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.name);
              
              return (
                <Link
                  key={item.name}
                  to={createPageUrl(item.name)}
                  className={`flex flex-col items-center gap-0.5 sm:gap-1 px-2 sm:px-4 py-1.5 sm:py-2 rounded-xl transition-all flex-1 ${
                    active 
                      ? 'text-slate-900 bg-slate-100' 
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <Icon className={`h-5 w-5 sm:h-6 sm:w-6 ${active ? 'text-slate-900' : ''}`} />
                  <span className="text-[10px] sm:text-xs font-medium">{item.label}</span>
                </Link>
              );
            })}
          </div>
        </motion.nav>
      )}
    </div>
  );
}