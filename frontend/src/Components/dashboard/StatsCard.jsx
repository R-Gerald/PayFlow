import React from 'react';
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";

export default function StatsCard({ title, value, subtitle, icon: Icon, color = "slate" }) {
  const colorClasses = {
    slate: "from-slate-500 to-slate-700",
    amber: "from-amber-500 to-amber-700",
    emerald: "from-emerald-500 to-emerald-700",
    blue: "from-blue-500 to-blue-700"
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="relative overflow-hidden border-0 bg-white/80 backdrop-blur-sm">
        <div className={`absolute top-0 right-0 w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br ${colorClasses[color]} opacity-10 rounded-full -translate-y-8 translate-x-8`} />
        <div className="p-4 sm:p-5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm text-slate-500 font-medium truncate">{title}</p>
              <p className="text-xl sm:text-2xl font-bold text-slate-800 mt-1 break-words">{value}</p>
              {subtitle && (
                <p className="text-xs text-slate-400 mt-1 truncate">{subtitle}</p>
              )}
            </div>
            {Icon && (
              <div className={`p-2 sm:p-3 rounded-xl bg-gradient-to-br ${colorClasses[color]} bg-opacity-10 flex-shrink-0`}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              </div>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
}