import React from 'react';
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { ArrowUpRight, ArrowDownRight, Calendar, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function TransactionItem({ transaction }) {
  const isDebt = transaction.type === 'debt';
  const isOverdue = isDebt && transaction.due_date && new Date(transaction.due_date) < new Date();
  
  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-MG').format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return format(new Date(dateStr), 'dd MMM yyyy', { locale: fr });
  };

  const getPaymentMethodLabel = (method) => {
    const labels = {
      cash: 'Espèces',
      mobile_money: 'Mobile Money',
      virement: 'Virement',
      autre: 'Autre'
    };
    return labels[method] || method;
  };

  return (
    <div className={`p-3 sm:p-4 rounded-xl border transition-all ${
      isDebt 
        ? 'bg-amber-50/50 border-amber-100' 
        : 'bg-emerald-50/50 border-emerald-100'
    }`}>
      <div className="flex items-start justify-between gap-2 sm:gap-3">
        <div className="flex items-start gap-2 sm:gap-3 flex-1 min-w-0">
          <div className={`h-8 w-8 sm:h-10 sm:w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
            isDebt ? 'bg-amber-100' : 'bg-emerald-100'
          }`}>
            {isDebt ? (
              <ArrowUpRight className="h-4 w-4 sm:h-5 sm:w-5 text-amber-600" />
            ) : (
              <ArrowDownRight className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-600" />
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-medium text-sm sm:text-base text-slate-800 break-words">
              {transaction.description || (isDebt ? 'Dette' : 'Paiement')}
            </p>
            <div className="flex items-center gap-1.5 sm:gap-2 mt-1 flex-wrap">
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDate(transaction.date)}
              </span>
              {transaction.due_date && (
                <Badge variant={isOverdue ? "destructive" : "secondary"} className="text-xs px-1.5 py-0">
                  {isOverdue && <AlertCircle className="h-3 w-3 mr-1" />}
                  <span className="hidden sm:inline">Échéance: </span>{formatDate(transaction.due_date)}
                </Badge>
              )}
              {transaction.payment_method && (
                <Badge variant="outline" className="text-xs px-1.5 py-0">
                  {getPaymentMethodLabel(transaction.payment_method)}
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="text-right flex-shrink-0">
          <p className={`font-bold text-sm sm:text-lg ${isDebt ? 'text-amber-600' : 'text-emerald-600'}`}>
            {isDebt ? '+' : '-'}{formatAmount(transaction.amount)} Ar
          </p>
        </div>
      </div>
    </div>
  );
}