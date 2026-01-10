// src/Layout.jsx
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Home, Users, BarChart3, LogOut, User } from "lucide-react";
import { motion } from "framer-motion";
import { clearToken } from "@/lib/auth";
import { Button } from "@/components/ui/button";

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

  // Don't show nav on ClientDetail page
  const hideNav = currentPath.includes("ClientDetail");

  const handleLogout = () => {
    clearToken();
    localStorage.removeItem("payflow_merchant_id");
    localStorage.removeItem("payflow_merchant_name");
    navigate("/login", { replace: true });
  };

  const merchantName = localStorage.getItem("payflow_merchant_name") || "Mon compte";

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 relative">
      {/* Zone utilisateur + bouton de déconnexion en haut à droite */}
      <div className="fixed top-3 right-4 sm:top-4 sm:right-6 z-50 flex items-center gap-2 sm:gap-3 bg-white/70 backdrop-blur rounded-full px-2 sm:px-3 py-1 shadow-sm">
        <div className="flex items-center gap-1 sm:gap-2 max-w-[140px] sm:max-w-xs">
          <User className="h-4 w-4 text-slate-500" />
          <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">
            {merchantName}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-1 text-[11px] sm:text-xs h-7 sm:h-8 px-2 sm:px-3"
        >
          <LogOut className="h-3.5 w-3.5" />
          Déconnexion
        </Button>
      </div>

      {/* Contenu des pages */}
      {children}

      {/* Nav du bas */}
      {!hideNav && (
        <motion.nav
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-lg border-t border-slate-200 px-3 sm:px-6 py-2 sm:py-3 z-40 safe-area-inset-bottom"
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
                      ? "text-slate-900 bg-slate-100"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 sm:h-6 sm:w-6 ${
                      active ? "text-slate-900" : ""
                    }`}
                  />
                  <span className="text-[10px] sm:text-xs font-medium">
                    {item.label}
                  </span>
                </Link>
              );
            })}
          </div>
        </motion.nav>
      )}
    </div>
  );
}