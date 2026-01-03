import React from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Phone, ChevronRight, AlertCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { motion } from "framer-motion";

export default function ClientCard({ client, hasOverdue }) {
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-MG').format(amount || 0) + ' Ar';
  };

  return (
    <Link to={createPageUrl(`ClientDetail?id=${client.id}`)}>
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        <Card className="p-3 sm:p-4 hover:shadow-lg transition-all duration-300 border-0 bg-white/80 backdrop-blur-sm">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2 sm:gap-4 flex-1 min-w-0">
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center flex-shrink-0">
                <User className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-semibold text-sm sm:text-base text-slate-800 truncate">{client.name}</h3>
                  {hasOverdue && (
                    <Badge variant="destructive" className="text-xs px-1.5 sm:px-2 py-0 flex-shrink-0">
                      <AlertCircle className="h-3 w-3 sm:mr-1" />
                      <span className="hidden sm:inline">Retard</span>
                    </Badge>
                  )}
                </div>
                {client.phone && (
                  <p className="text-xs sm:text-sm text-slate-500 flex items-center gap-1 truncate">
                    <Phone className="h-3 w-3 flex-shrink-0" />
                    <span className="truncate">{client.phone}</span>
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
              <div className="text-right">
                <p className="text-xs text-slate-500 uppercase tracking-wide hidden sm:block">Solde dû</p>
                <p className={`font-bold text-base sm:text-lg ${client.total_due > 0 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {formatAmount(client.total_due)}
                </p>
              </div>
              <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400" />
            </div>
          </div>
        </Card>
      </motion.div>
    </Link>
  );
}