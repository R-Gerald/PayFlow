import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { base44 } from "@/api/baseClientbyG";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Banknote,
  FileText,
  CalendarIcon,
  Wallet,
  Loader2,
  CreditCard,
  TrendingUp,
  CheckCircle2,
  DollarSign,
  Receipt,
  Percent,
  Target,
  AlertCircle,
  ChevronDown,
  Sparkles,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

export default function AddPaymentDialog({
  open,
  onOpenChange,
  onSubmit,
  clientName,
  maxAmount,
  clientId,
}) {
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    date: new Date(),
    payment_method: "",
  });
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [distributionMode, setDistributionMode] = useState("auto"); // "auto" ou "manual"
  const { toast } = useToast();

  const [allocations, setAllocations] = useState({});

  const {
    data: credits = [],
    isLoading: loadingCredits,
  } = useQuery({
    queryKey: ["client-credits", clientId],
    queryFn: () => base44.entities.Transaction.listCreditsByClient(clientId),
    enabled: open && !!clientId,
  });

  useEffect(() => {
    if (!open) {
      setFormData({
        amount: "",
        description: "",
        date: new Date(),
        payment_method: "",
      });
      setAllocations({});
      setLoading(false);
      setShowAdvanced(false);
      setDistributionMode("auto");
    }
  }, [open]);

  const formatAmount = (amount) =>
    new Intl.NumberFormat("fr-MG").format(amount || 0);

  const formatAr = (value) => {
    if (value === null || value === undefined) return "0 Ar";
    return `${Number(value).toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ")} Ar`;
  };

  const handleChangeAllocation = (creditId, value) => {
    const num = Number(String(value).replace(/\s/g, "").replace(",", "."));
    const credit = credits.find((c) => c.id === creditId);
    const remaining = credit ? Number(credit.remaining_amount ?? 0) : 0;

    let finalValue = isNaN(num) ? 0 : num;

    if (credit && finalValue > remaining) {
      finalValue = remaining;
      toast({
        title: "Montant trop élevé",
        description: `Vous ne pouvez pas allouer plus que le reste dû sur ce crédit (${formatAmount(
          remaining
        )} Ar).`,
        variant: "destructive",
      });
    }

    setAllocations((prev) => ({
      ...prev,
      [creditId]: finalValue,
    }));
  };

  const totalAllocated = Object.values(allocations).reduce(
    (sum, v) => sum + (v || 0),
    0
  );

  const paymentAmount = parseFloat(formData.amount) || 0;
  const remainingBalance = maxAmount - paymentAmount;
  const isPaymentComplete = remainingBalance <= 0 && paymentAmount > 0;

  // Calcul de la répartition automatique
  useEffect(() => {
    if (distributionMode === "auto" && credits.length > 0 && paymentAmount > 0) {
      const openCredits = credits.filter(
        (c) => c.remaining_amount != null && c.remaining_amount > 0
      );
      
      let remainingPayment = paymentAmount;
      const newAllocations = {};
      
      // Priorité aux crédits en retard, puis par date d'échéance
      const sortedCredits = [...openCredits].sort((a, b) => {
        const aIsOverdue = a.due_date && new Date(a.due_date) < new Date();
        const bIsOverdue = b.due_date && new Date(b.due_date) < new Date();
        
        if (aIsOverdue && !bIsOverdue) return -1;
        if (!aIsOverdue && bIsOverdue) return 1;
        
        if (a.due_date && b.due_date) {
          return new Date(a.due_date) - new Date(b.due_date);
        }
        
        return a.id - b.id;
      });
      
      for (const credit of sortedCredits) {
        if (remainingPayment <= 0) break;
        
        const creditRemaining = Number(credit.remaining_amount);
        const amountToAllocate = Math.min(creditRemaining, remainingPayment);
        
        if (amountToAllocate > 0) {
          newAllocations[credit.id] = amountToAllocate;
          remainingPayment -= amountToAllocate;
        }
      }
      
      setAllocations(newAllocations);
    }
  }, [distributionMode, paymentAmount, credits]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) return;

    const paymentAmount = parseFloat(formData.amount);

    const allocationArray = Object.entries(allocations)
      .filter(([_, v]) => v && v > 0)
      .map(([creditId, v]) => ({
        creditId: Number(creditId),
        amount: v,
      }));

    if (totalAllocated > paymentAmount) {
      toast({
        title: "Répartition invalide",
        description:
          "Le total réparti sur les crédits dépasse le montant du paiement.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        type: "payment",
        amount: paymentAmount,
        description: formData.description,
        date: format(formData.date, "yyyy-MM-dd"),
        payment_method: formData.payment_method,
        allocations: allocationArray,
      });
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  const visibleCredits = credits.filter(
    (c) => c.remaining_amount != null && c.remaining_amount > 0
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-w-[calc(100vw-2rem)] p-0 overflow-hidden">
        {/* Header avec gradient emerald */}
        <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-4">
          <DialogHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-white">
                    Enregistrer un paiement
                  </DialogTitle>
                  {clientName && (
                    <DialogDescription className="text-emerald-100">
                      Pour <span className="font-medium">{clientName}</span>
                    </DialogDescription>
                  )}
                </div>
              </div>
              <div className="hidden sm:block">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
                  <CreditCard className="h-3.5 w-3.5 mr-1" />
                  Paiement
                </span>
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Contenu scrollable */}
        <div className="px-6 py-5 max-h-[70vh] overflow-y-auto">
          {/* Carte solde */}
          {maxAmount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6"
            >
              <div className="bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-4 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-300 text-sm font-medium">Solde à payer</p>
                    <p className="text-2xl font-bold mt-1">
                      {formatAmount(maxAmount)} Ar
                    </p>
                  </div>
                  <div className="h-12 w-12 rounded-full bg-emerald-500/20 flex items-center justify-center">
                    <DollarSign className="h-6 w-6 text-emerald-300" />
                  </div>
                </div>
                
                {paymentAmount > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="mt-4 pt-4 border-t border-slate-700"
                  >
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-slate-300 text-xs">Montant saisi</p>
                        <p className="text-lg font-semibold text-emerald-300">
                          {formatAmount(paymentAmount)} Ar
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-300 text-xs">Reste à payer</p>
                        <p className={`text-lg font-semibold ${
                          remainingBalance > 0 ? 'text-amber-300' : 'text-emerald-300'
                        }`}>
                          {formatAmount(Math.max(0, remainingBalance))} Ar
                        </p>
                      </div>
                    </div>
                    
                    {isPaymentComplete && (
                      <div className="mt-3 p-2 bg-emerald-900/30 rounded-lg">
                        <div className="flex items-center gap-2">
                          <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                          <p className="text-xs text-emerald-200 font-medium">
                            Ce paiement réglera la totalité du solde
                          </p>
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Montant payé */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <Label htmlFor="amount" className="text-sm font-medium text-slate-700">
                  Montant du paiement *
                </Label>
                {paymentAmount > 0 && (
                  <span className="text-lg font-bold text-emerald-600">
                    {formatAmount(paymentAmount)} Ar
                  </span>
                )}
              </div>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center">
                  <Banknote className="h-3 w-3 text-emerald-600" />
                </div>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className={cn(
                    "pl-10 text-lg font-semibold h-12",
                    "border-slate-200 focus:border-emerald-400 focus:ring-emerald-400",
                    "transition-all duration-200"
                  )}
                  required
                  min="1"
                  step="0.01"
                  max={maxAmount}
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-slate-500 font-medium">Ar</span>
                </div>
              </div>
              {maxAmount > 0 && (
                <p className="text-xs text-slate-500">
                  Maximum possible : <span className="font-medium">{formatAmount(maxAmount)} Ar</span>
                </p>
              )}
            </motion.div>

            {/* Mode de paiement */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="space-y-3"
            >
              <Label className="text-sm font-medium text-slate-700">Mode de paiement</Label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { value: "cash", label: "Espèces", icon: "💰" },
                  { value: "mobile_money", label: "Mobile Money", icon: "📱" },
                  { value: "virement", label: "Virement", icon: "🏦" },
                  { value: "autre", label: "Autre", icon: "📄" },
                ].map((method) => (
                  <button
                    key={method.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, payment_method: method.value })}
                    className={cn(
                      "p-3 rounded-lg border flex flex-col items-center justify-center gap-1 transition-all",
                      formData.payment_method === method.value
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                        : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    )}
                  >
                    <span className="text-xl">{method.icon}</span>
                    <span className="text-xs font-medium">{method.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>

            {/* Date */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-3"
            >
              <Label className="text-sm font-medium text-slate-700">Date du paiement</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal h-10",
                      "border-slate-200 hover:border-emerald-400 hover:bg-emerald-50",
                      "transition-all duration-200"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-500" />
                    <span className="text-sm">{format(formData.date, "dd/MM/yyyy", { locale: fr })}</span>
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.date}
                    onSelect={(date) =>
                      date && setFormData({ ...formData, date })
                    }
                    locale={fr}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </motion.div>

            {/* Note */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="space-y-3"
            >
              <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                Note ou référence
                <span className="text-slate-400 font-normal ml-2">(Optionnel)</span>
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-3">
                  <FileText className="h-4 w-4 text-slate-400" />
                </div>
                <Textarea
                  id="description"
                  placeholder="Référence de transaction, numéro de reçu, détail du paiement..."
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className={cn(
                    "pl-10 min-h-[80px]",
                    "border-slate-200 focus:border-emerald-400 focus:ring-emerald-400",
                    "transition-all duration-200"
                  )}
                  rows={2}
                />
              </div>
            </motion.div>

            {/* Répartition par crédit - Section avancée */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-700 flex items-center gap-2">
                  <Target className="h-4 w-4 text-slate-500" />
                  Répartition sur les crédits
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                >
                  {showAdvanced ? 'Réduire' : 'Configurer'}
                  <ChevronDown className={cn(
                    "h-3 w-3 transition-transform",
                    showAdvanced && "rotate-180"
                  )} />
                </button>
              </div>

              {!showAdvanced ? (
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                      <Percent className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-700">Répartition automatique</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Le paiement sera automatiquement réparti sur les crédits ouverts
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowAdvanced(true)}
                        className="text-xs text-emerald-600 hover:text-emerald-700 font-medium mt-2"
                      >
                        Configurer manuellement →
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="space-y-4">
                      {/* Mode de distribution */}
                      <div className="bg-white rounded-lg border border-slate-200 p-4">
                        <div className="flex items-center justify-between mb-3">
                          <p className="text-sm font-medium text-slate-700">Mode de distribution</p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setDistributionMode("auto")}
                              className={cn(
                                "px-3 py-1 text-xs rounded-full transition-all",
                                distributionMode === "auto"
                                  ? "bg-emerald-100 text-emerald-700 font-medium"
                                  : "text-slate-500 hover:text-slate-700"
                              )}
                            >
                              Automatique
                            </button>
                            <button
                              type="button"
                              onClick={() => setDistributionMode("manual")}
                              className={cn(
                                "px-3 py-1 text-xs rounded-full transition-all",
                                distributionMode === "manual"
                                  ? "bg-emerald-100 text-emerald-700 font-medium"
                                  : "text-slate-500 hover:text-slate-700"
                              )}
                            >
                              Manuel
                            </button>
                          </div>
                        </div>

                        {loadingCredits ? (
                          <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                          </div>
                        ) : visibleCredits.length === 0 ? (
                          <div className="text-center py-4">
                            <Receipt className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                            <p className="text-sm text-slate-500">Aucun crédit actif</p>
                            <p className="text-xs text-slate-400 mt-0.5">
                              Ce paiement ne sera pas affecté à un crédit spécifique
                            </p>
                          </div>
                        ) : (
                          <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {visibleCredits.map((credit) => {
                              const isOverdue = credit.due_date && new Date(credit.due_date) < new Date();
                              const allocated = allocations[credit.id] || 0;
                              const remaining = Number(credit.remaining_amount);
                              const percentage = remaining > 0 ? Math.min((allocated / remaining) * 100, 100) : 0;
                              
                              return (
                                <div
                                  key={credit.id}
                                  className="bg-white border border-slate-200 rounded-lg p-3"
                                >
                                  <div className="flex items-center justify-between mb-2">
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <p className="text-sm font-medium text-slate-900">
                                          Crédit #{credit.id}
                                        </p>
                                        {isOverdue && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-800">
                                            En retard
                                          </span>
                                        )}
                                        {credit.due_date && !isOverdue && (
                                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border border-amber-300 text-amber-600 bg-amber-50">
                                            {new Date(credit.due_date).toLocaleDateString("fr-FR")}
                                          </span>
                                        )}
                                      </div>
                                      <p className="text-xs text-slate-500 mt-0.5">
                                        Reste : <span className="font-medium">{formatAr(remaining)}</span>
                                      </p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-sm font-semibold text-emerald-600">
                                        {formatAr(allocated)}
                                      </p>
                                      <p className="text-[10px] text-slate-400">
                                        affecté
                                      </p>
                                    </div>
                                  </div>

                                  {distributionMode === "manual" && (
                                    <div className="space-y-2">
                                      <div className="flex items-center justify-between text-xs text-slate-500">
                                        <span>Allocation manuelle</span>
                                        <span>{percentage.toFixed(0)}% du crédit</span>
                                      </div>
                                      <div className="relative">
                                        <Input
                                          type="number"
                                          min="0"
                                          step="0.01"
                                          max={remaining}
                                          value={allocated || ""}
                                          onChange={(e) =>
                                            handleChangeAllocation(credit.id, e.target.value)
                                          }
                                          className="h-8 text-sm pr-16"
                                          placeholder="0"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2">
                                          <span className="text-xs text-slate-500">Ar</span>
                                        </div>
                                      </div>
                                      <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div 
                                          className="h-full bg-emerald-500 transition-all duration-300"
                                          style={{ width: `${percentage}%` }}
                                        />
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        )}

                        {/* Total réparti */}
                        {paymentAmount > 0 && (
                          <div className="mt-4 pt-4 border-t border-slate-200">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm font-medium text-slate-700">Total réparti</p>
                                <p className="text-xs text-slate-500">
                                  Sur {Object.keys(allocations).filter(k => allocations[k] > 0).length} crédit(s)
                                </p>
                              </div>
                              <div className="text-right">
                                <p className={`text-lg font-bold ${
                                  totalAllocated > paymentAmount 
                                    ? "text-red-600" 
                                    : totalAllocated === paymentAmount
                                    ? "text-emerald-600"
                                    : "text-amber-600"
                                }`}>
                                  {formatAmount(totalAllocated)} Ar
                                </p>
                                <p className="text-xs text-slate-500">
                                  {totalAllocated === paymentAmount 
                                    ? "Paiement entièrement réparti" 
                                    : totalAllocated > paymentAmount
                                    ? "Dépasse le montant du paiement"
                                    : `${formatAmount(paymentAmount - totalAllocated)} Ar non affectés`
                                  }
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}
            </motion.div>

            {/* Résumé final */}
            {paymentAmount > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg border border-emerald-200"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-emerald-900">Récapitulatif</p>
                    <div className="space-y-1">
                      <p className="text-xs text-emerald-700">
                        <span className="font-medium">{formatAmount(paymentAmount)} Ar</span> à régler
                      </p>
                      {Object.keys(allocations).filter(k => allocations[k] > 0).length > 0 && (
                        <p className="text-xs text-emerald-700">
                          <span className="font-medium">{formatAmount(totalAllocated)} Ar</span> répartis sur {Object.keys(allocations).filter(k => allocations[k] > 0).length} crédit(s)
                        </p>
                      )}
                      {isPaymentComplete && (
                        <div className="flex items-center gap-1 mt-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                          <span className="text-xs font-medium text-emerald-600">
                            Solde entièrement réglé
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <Sparkles className="h-5 w-5 text-emerald-400" />
                </div>
              </motion.div>
            )}
          </form>
        </div>

        {/* Boutons d'action */}
        <div className="px-6 py-4 border-t border-slate-200 bg-white">
          <div className="flex items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
            >
              Annuler
            </Button>
            <Button
              type="submit"
              className={cn(
                "flex-1 h-12 text-base font-semibold",
                "bg-gradient-to-r from-emerald-500 to-emerald-600",
                "hover:from-emerald-600 hover:to-emerald-700",
                "shadow-lg hover:shadow-xl",
                "transition-all duration-200",
                (!formData.amount || paymentAmount <= 0 || totalAllocated > paymentAmount) && 
                "opacity-50 cursor-not-allowed"
              )}
              disabled={
                loading ||
                !formData.amount ||
                paymentAmount <= 0 ||
                totalAllocated > paymentAmount
              }
              onClick={handleSubmit}
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Enregistrement...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 mr-2" />
                  Confirmer le paiement
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}