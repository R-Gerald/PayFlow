// src/Layout.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Users, BarChart3, LogOut, User, Settings, ShoppingBag } from "lucide-react";
import { motion } from "framer-motion";
import { clearToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import NotificationBell from "@/components/reminders/NotificationBell";

export default function Layout({ children }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  const navItems = [
    { name: "Home", icon: Home, label: "Accueil" },
    { name: "Clients", icon: Users, label: "Clients" },
    { name: "Statistics", icon: BarChart3, label: "Stats" },
  ];

  const isActive = (pageName) => {
    const pageUrl = createPageUrl(pageName);
    return currentPath === pageUrl || currentPath === pageUrl + "/";
  };

  // Ne pas montrer la nav sur ClientDetail
  const hideNav = currentPath.includes("ClientDetail");

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("payflow_merchant_id");
    localStorage.removeItem("payflow_merchant_name");
    localStorage.removeItem("payflow_merchant_phone");
    navigate("/login", { replace: true });
  };

  const merchantName = localStorage.getItem("payflow_merchant_name") || "Mon commerce";
  const merchantInitial = merchantName.charAt(0).toUpperCase();

  const goToAccount = () => {
    navigate("/account");
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header global - Version améliorée */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-lg border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="h-14 sm:h-16 flex items-center justify-between">
            {/* Logo / Nom du commerce - Gauche */}
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 flex items-center justify-center">
                <ShoppingBag className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <h1 className="text-base font-semibold text-slate-900">Payflow</h1>
                <p className="text-xs text-slate-500">Gestion des crédits</p>
              </div>
            </div>

            {/* Actions utilisateur - Droite */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Cloche de notifications */}
              <div className="flex items-center">
                <NotificationBell />
              </div>

              {/* Séparateur visuel - Desktop seulement */}
              <div className="hidden sm:block h-5 w-px bg-slate-200 mx-1" />

              {/* Avatar utilisateur - Desktop */}
              <div className="hidden sm:flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={goToAccount}
                  className="h-8 px-3 gap-2 hover:bg-slate-100"
                >
                  <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                    <span className="text-xs font-medium text-slate-700">{merchantInitial}</span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">
                    {merchantName.split(' ')[0]}
                  </span>
                </Button>
              </div>

              {/* Bouton paramètres - Desktop */}
              <div className="hidden sm:block">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={goToAccount}
                  className="h-8 px-3 gap-1.5 hover:bg-slate-50"
                >
                  <Settings className="h-3.5 w-3.5" />
                  <span className="text-xs">Paramètres</span>
                </Button>
              </div>

              {/* Bouton déconnexion - Desktop */}
              <div className="hidden sm:block">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="h-8 px-3 gap-1.5 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="text-xs">Déconnexion</span>
                </Button>
              </div>

              {/* Version mobile - Menu compact */}
              <div className="flex sm:hidden items-center gap-1">
                {/* Avatar mobile */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={goToAccount}
                  className="h-8 w-8 relative"
                >
                  <div className="h-6 w-6 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200">
                    <span className="text-xs font-medium text-slate-700">{merchantInitial}</span>
                  </div>
                </Button>

                {/* Menu déroulant mobile avec déconnexion */}
                <div className="relative group">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Settings className="h-4 w-4 text-slate-600" />
                  </Button>
                  
                  {/* Menu overlay mobile */}
                  <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-sm font-medium text-slate-900">{merchantName}</p>
                      <p className="text-xs text-slate-500">Mon compte</p>
                    </div>
                    <button
                      onClick={goToAccount}
                      className="w-full text-left px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Settings className="h-3.5 w-3.5 inline mr-2" />
                      Paramètres
                    </button>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="h-3.5 w-3.5 inline mr-2" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Contenu des pages - Avec padding pour header */}
      <main className={cn(
        "pt-14 sm:pt-16",
        !hideNav && "pb-16 sm:pb-20"
      )}>
        {children}
      </main>

      {/* Navigation du bas */}
      {!hideNav && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 z-40 safe-area-inset-bottom shadow-lg"
        >
          <div className="max-w-md mx-auto px-2 py-2">
            <div className="flex justify-around items-center">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(item.name);

                return (
                  <Link
                    key={item.name}
                    to={createPageUrl(item.name)}
                    className={cn(
                      "flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-all flex-1 group",
                      active
                        ? "text-amber-600 bg-amber-50"
                        : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                    )}
                  >
                    <div className={cn(
                      "h-6 w-6 flex items-center justify-center relative",
                      active && "text-amber-600"
                    )}>
                      <Icon className="h-5 w-5 transition-transform group-hover:scale-110" />
                      {active && (
                        <motion.div
                          layoutId="activeTab"
                          className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-amber-500"
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        />
                      )}
                    </div>
                    <span className={cn(
                      "text-[10px] font-medium transition-colors",
                      active ? "text-amber-700" : "text-slate-500"
                    )}>
                      {item.label}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.nav>
      )}
    </div>
  );
}