import React, { useState } from 'react';
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import {
  Banknote,
  FileText,
  CalendarIcon,
  Loader2,
  AlertCircle,
  Clock,
  TrendingDown,
  CheckCircle2,
  Sparkles,
  DollarSign,
  Info,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

export default function AddDebtDialog({ open, onOpenChange, onSubmit, clientName }) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date(),
    due_date: null,
    interest_rate: '',
    late_penalty: ''
  });
  const [loading, setLoading] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.amount || parseFloat(formData.amount) <= 0) return;
    
    setLoading(true);
    await onSubmit({
      type: 'debt',
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: format(formData.date, 'yyyy-MM-dd'),
      due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : null,
      interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : null,
      late_penalty: formData.late_penalty ? parseFloat(formData.late_penalty) : null
    });
    setLoading(false);
    setFormData({ amount: '', description: '', date: new Date(), due_date: null, interest_rate: '', late_penalty: '' });
    onOpenChange(false);
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('fr-MG').format(amount || 0);
  };

  const getDaysUntilDue = () => {
    if (!formData.due_date) return null;
    const diffTime = Math.abs(formData.due_date - formData.date);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysUntilDue = getDaysUntilDue();

  const calculateEstimatedCost = () => {
    if (!formData.amount) return null;
    
    const principal = parseFloat(formData.amount);
    let total = principal;
    let breakdown = [];
    
    // Intérêt annuel (calcul proportionnel jusqu'à l'échéance)
    if (formData.interest_rate && parseFloat(formData.interest_rate) > 0) {
      // Taux d'intérêt annuel
      const annualInterestRate = parseFloat(formData.interest_rate);
      
      // Si une date d'échéance est définie, on calcule l'intérêt proportionnel
      let interestAmount = 0;
      if (formData.due_date && daysUntilDue) {
        // Intérêt proportionnel au nombre de jours (simple)
        interestAmount = (principal * annualInterestRate * daysUntilDue) / (100 * 365);
      } else {
        // Si pas de date d'échéance, on prend l'intérêt annuel complet
        interestAmount = (principal * annualInterestRate) / 100;
      }
      
      total += interestAmount;
      breakdown.push({
        label: `Intérêt (${formData.interest_rate}% annuel)`,
        amount: interestAmount,
        color: 'text-green-600',
        type: 'interest'
      });
    }
    
    // NOTE: Les pénalités ne sont PAS incluses dans le total estimé
    // car elles ne s'appliquent qu'en cas de retard après l'échéance
    if (formData.late_penalty && parseFloat(formData.late_penalty) > 0) {
      breakdown.push({
        label: `Pénalité de retard`,
        amount: parseFloat(formData.late_penalty),
        color: 'text-red-600',
        type: 'penalty',
        perDay: true
      });
    }
    
    return { total, breakdown };
  };

  const estimatedCost = calculateEstimatedCost();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-w-[calc(100vw-2rem)] p-0 overflow-hidden">
        {/* Header avec gradient */}
        <div className="bg-gradient-to-r from-amber-500 to-amber-600 px-6 py-4">
          <DialogHeader className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center">
                  <TrendingDown className="h-5 w-5 text-white" />
                </div>
                <div>
                  <DialogTitle className="text-xl font-semibold text-white">
                    Nouvelle dette
                  </DialogTitle>
                  {clientName && (
                    <DialogDescription className="text-amber-100">
                      Pour <span className="font-medium">{clientName}</span>
                    </DialogDescription>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="hidden sm:block">
                  <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
                    <DollarSign className="h-3.5 w-3.5 mr-1" />
                    Dette
                  </span>
                </div>
                {/* Badges d'alerte pour conditions spéciales */}
                {formData.interest_rate && parseFloat(formData.interest_rate) > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-green-100 text-green-800 text-xs font-medium">
                    <TrendingDown className="h-3 w-3 mr-1" />
                    {formData.interest_rate}% intérêt
                  </span>
                )}
                {formData.late_penalty && parseFloat(formData.late_penalty) > 0 && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full bg-red-100 text-red-800 text-xs font-medium">
                    <AlertCircle className="h-3 w-3 mr-1" />
                    {formatAmount(formData.late_penalty)} Ar/jour
                  </span>
                )}
              </div>
            </div>
          </DialogHeader>
        </div>

        {/* Contenu du formulaire */}
        <div className="px-6 py-5">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Montant - Section principale */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <Label htmlFor="amount" className="text-sm font-medium text-slate-700">
                  Montant de la dette
                </Label>
                {formData.amount && (
                  <span className="text-lg font-bold text-amber-600">
                    {formatAmount(formData.amount)} Ar
                  </span>
                )}
              </div>
              <div className="relative group">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 rounded-full bg-amber-100 flex items-center justify-center">
                  <Banknote className="h-3 w-3 text-amber-600" />
                </div>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className={cn(
                    "pl-10 text-lg font-semibold h-12",
                    "border-slate-200 focus:border-amber-400 focus:ring-amber-400",
                    "transition-all duration-200"
                  )}
                  required
                  min="1"
                  step="0.01"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <span className="text-slate-500 font-medium">Ar</span>
                </div>
              </div>
            </motion.div>

            {/* Description */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="space-y-3"
            >
              <Label htmlFor="description" className="text-sm font-medium text-slate-700">
                Description
                <span className="text-slate-400 font-normal ml-2">(Optionnel)</span>
              </Label>
              <div className="relative group">
                <div className="absolute left-3 top-3">
                  <FileText className="h-4 w-4 text-slate-400" />
                </div>
                <Textarea
                  id="description"
                  placeholder="Décrivez cette dette... (ex: courses du marché, matériel de construction, avance sur salaire)"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className={cn(
                    "pl-10 min-h-[80px]",
                    "border-slate-200 focus:border-amber-400 focus:ring-amber-400",
                    "transition-all duration-200"
                  )}
                  rows={2}
                />
              </div>
            </motion.div>

            {/* Dates */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4"
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-slate-700">Dates</h4>
                <button
                  type="button"
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium flex items-center gap-1"
                >
                  {showAdvanced ? (
                    <>
                      <span>Masquer les options</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Options avancées</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Date de création */}
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-slate-600">Date de création</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-10",
                          "border-slate-200 hover:border-amber-400 hover:bg-amber-50",
                          "transition-all duration-200"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-3.5 w-3.5 text-slate-500" />
                        <span className="text-sm">{format(formData.date, 'dd/MM/yyyy', { locale: fr })}</span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.date}
                        onSelect={(date) => date && setFormData({ ...formData, date })}
                        locale={fr}
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                {/* Date d'échéance */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-medium text-slate-600">Date d'échéance</Label>
                    {daysUntilDue && (
                      <span className="text-xs font-medium text-amber-600">
                        {daysUntilDue} jour{daysUntilDue > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn(
                          "w-full justify-start text-left font-normal h-10",
                          "border-slate-200 hover:border-amber-400 hover:bg-amber-50",
                          "transition-all duration-200"
                        )}
                      >
                        <Clock className="mr-2 h-3.5 w-3.5 text-slate-500" />
                        <span className="text-sm">
                          {formData.due_date 
                            ? format(formData.due_date, 'dd/MM/yyyy', { locale: fr })
                            : 'Définir une échéance'
                          }
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={formData.due_date}
                        onSelect={(date) => setFormData({ ...formData, due_date: date })}
                        locale={fr}
                        className="rounded-md border"
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              {/* Section avancée */}
              <AnimatePresence>
                {showAdvanced && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-4">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Conditions de crédit</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Définissez des conditions spécifiques pour cette dette
                          </p>
                        </div>
                      </div>

                      {/* Pré-configurations pour PME */}
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 bg-white"
                          onClick={() => setFormData({ ...formData, interest_rate: '5', late_penalty: '1000' })}
                        >
                          <TrendingDown className="h-3 w-3 mr-1" />
                          Crédit standard
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 bg-white"
                          onClick={() => setFormData({ ...formData, interest_rate: '10', late_penalty: '2000' })}
                        >
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Prêt à risque
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 bg-white"
                          onClick={() => setFormData({ ...formData, interest_rate: '', late_penalty: '' })}
                        >
                          ✕ Sans intérêt
                        </Button>
                      </div>
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {/* Intérêt */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-1">
                            <Label className="text-xs font-medium text-slate-600">Intérêt annuel (%)</Label>
                            <div className="group relative">
                              <span className="text-xs text-slate-400 cursor-help">
                                <Info className="h-3 w-3" />
                              </span>
                              <div className="absolute z-10 hidden group-hover:block w-48 p-2 text-xs bg-slate-800 text-white rounded shadow-lg -translate-x-1/2 left-1/2">
                                Pourcentage appliqué chaque année sur le montant restant
                              </div>
                            </div>
                          </div>
                          <Input
                            type="number"
                            placeholder="0"
                            className="h-9 text-sm"
                            min="0"
                            max="50"
                            step="0.1"
                            value={formData.interest_rate}
                            onChange={(e) => {
                              const value = e.target.value;
                              if (value === '' || (parseFloat(value) >= 0 && parseFloat(value) <= 50)) {
                                setFormData({ ...formData, interest_rate: value });
                              }
                            }}
                          />
                          {formData.interest_rate && formData.amount && (
                            <div className="space-y-1">
                              <p className="text-xs text-green-600 font-medium">
                                ≈ {formatAmount(((parseFloat(formData.amount) * parseFloat(formData.interest_rate) / 100) * (daysUntilDue || 365) / 365).toFixed(0))} Ar d'intérêt
                              </p>
                              {daysUntilDue && (
                                <p className="text-xs text-green-500">
                                  ({formatAmount((parseFloat(formData.amount) * parseFloat(formData.interest_rate) / 100).toFixed(0))} Ar/an)
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                        
                        {/* Pénalité */}
                        <div className="space-y-2">
                          <div className="flex items-center gap-1">
                            <Label className="text-xs font-medium text-slate-600">Pénalité/jour (Ar)</Label>
                            <div className="group relative">
                              <span className="text-xs text-slate-400 cursor-help">
                                <Info className="h-3 w-3" />
                              </span>
                              <div className="absolute z-10 hidden group-hover:block w-48 p-2 text-xs bg-slate-800 text-white rounded shadow-lg -translate-x-1/2 left-1/2">
                                Montant fixe ajouté pour chaque jour de retard après l'échéance
                              </div>
                            </div>
                          </div>
                          <Input
                            type="number"
                            placeholder="0"
                            className="h-9 text-sm"
                            min="0"
                            step="100"
                            value={formData.late_penalty}
                            onChange={(e) => setFormData({ ...formData, late_penalty: e.target.value })}
                          />
                          {formData.late_penalty && parseFloat(formData.late_penalty) > 0 && (
                            <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-700">
                              <AlertCircle className="h-3 w-3 inline mr-1" />
                              <span className="font-medium">Note :</span> La pénalité de {formatAmount(formData.late_penalty)} Ar 
                              s'applique uniquement pour chaque jour de retard <span className="font-medium">après</span> la date d'échéance.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Récapitulatif détaillé */}
            {(formData.amount || formData.due_date || formData.interest_rate || formData.late_penalty) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-semibold text-amber-900">Récapitulatif de la dette</p>
                      {estimatedCost && (
                        <span className="text-xs bg-amber-200 text-amber-900 px-2 py-1 rounded font-medium">
                          Estimation
                        </span>
                      )}
                    </div>
                    
                    <div className="space-y-2">
                      {/* Montant principal */}
                      {formData.amount && (
                        <div className="flex items-start gap-3">
                          <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <p className="text-sm font-medium text-amber-800">Montant principal</p>
                              <p className="text-sm font-bold text-amber-900">{formatAmount(formData.amount)} Ar</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Date d'échéance */}
                      {formData.due_date && (
                        <div className="flex items-start gap-3">
                          <div className="h-2 w-2 rounded-full bg-blue-500 mt-1.5 flex-shrink-0" />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3 text-blue-500" />
                                <p className="text-xs font-medium text-amber-700">Échéance</p>
                              </div>
                              <div className="text-right">
                                <p className="text-xs font-medium text-amber-900">
                                  {format(formData.due_date, 'dd/MM/yyyy', { locale: fr })}
                                </p>
                                {daysUntilDue && (
                                  <p className="text-xs text-amber-600 mt-0.5">
                                    ({daysUntilDue} jour{daysUntilDue > 1 ? 's' : ''})
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Détail des coûts additionnels */}
                      {estimatedCost && estimatedCost.breakdown.map((item, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className={`h-2 w-2 rounded-full ${item.type === 'interest' ? 'bg-green-500' : 'bg-red-500'} mt-1.5 flex-shrink-0`} />
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className={`text-xs font-medium ${item.color}`}>
                                  {item.label}
                                  {item.perDay && (
                                    <span className="text-xs text-slate-500 ml-1">(par jour de retard)</span>
                                  )}
                                </p>
                              </div>
                              <p className={`text-xs font-bold ${item.color}`}>
                                {item.type === 'interest' ? '+ ' : ''}
                                {formatAmount(item.amount.toFixed(0))} Ar
                                {item.perDay && <span className="text-xs font-normal ml-1">/jour</span>}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Total estimé */}
                    {estimatedCost && estimatedCost.total > parseFloat(formData.amount || 0) && (
                      <div className="pt-3 mt-3 border-t border-amber-200">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs font-semibold text-amber-900">Total estimé à l'échéance</p>
                            <p className="text-xs text-amber-600 mt-0.5">
                              {formData.due_date ? 'Principal + intérêts (sans pénalité)' : 'Principal + intérêts'}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-lg font-bold text-amber-900">
                              {formatAmount(estimatedCost.total.toFixed(0))} Ar
                            </p>
                            <p className="text-xs text-amber-600 mt-0.5">
                              (+ {formatAmount((estimatedCost.total - parseFloat(formData.amount || 0)).toFixed(0))} Ar de frais)
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Note sur les pénalités */}
                    {formData.late_penalty && parseFloat(formData.late_penalty) > 0 && (
                      <div className="pt-3 mt-2 border-t border-amber-200">
                        <p className="text-xs text-amber-700">
                          <span className="font-medium">ℹ️ Les pénalités</span> ({formatAmount(formData.late_penalty)} Ar/jour) 
                          s'ajouteront au total en cas de retard après l'échéance.
                        </p>
                      </div>
                    )}
                  </div>
                  <Sparkles className="h-5 w-5 text-amber-400 ml-4 flex-shrink-0" />
                </div>
              </motion.div>
            )}

            {/* Bouton d'action */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="pt-2"
            >
              <Button
                type="submit"
                className={cn(
                  "w-full h-12 text-base font-semibold",
                  "bg-gradient-to-r from-amber-500 to-amber-600",
                  "hover:from-amber-600 hover:to-amber-700",
                  "shadow-lg hover:shadow-xl",
                  "transition-all duration-200",
                  !formData.amount && "opacity-50 cursor-not-allowed"
                )}
                disabled={loading || !formData.amount}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    Enregistrement...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-5 w-5 mr-2" />
                    Créer cette dette
                  </>
                )}
              </Button>
              
              <div className="mt-3 flex items-center justify-center gap-2">
                <div className="h-px flex-1 bg-slate-200" />
                <span className="text-xs text-slate-400 px-2">ou</span>
                <div className="h-px flex-1 bg-slate-200" />
              </div>
              
              <Button
                type="button"
                variant="outline"
                className="w-full h-10 mt-3 text-sm"
                onClick={() => onOpenChange(false)}
                disabled={loading}
              >
                Annuler
              </Button>
            </motion.div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}