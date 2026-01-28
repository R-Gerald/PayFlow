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
  CreditCard,
  CheckCircle2,
  Sparkles,
  DollarSign,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { motion, AnimatePresence } from "framer-motion";

export default function AddDebtDialog({ open, onOpenChange, onSubmit, clientName }) {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: new Date(),
    due_date: null
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
      due_date: formData.due_date ? format(formData.due_date, 'yyyy-MM-dd') : null
    });
    setLoading(false);
    setFormData({ amount: '', description: '', date: new Date(), due_date: null });
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
              <div className="hidden sm:block">
                <span className="inline-flex items-center px-3 py-1 rounded-full bg-white/20 text-white text-sm font-medium">
                  <DollarSign className="h-3.5 w-3.5 mr-1" />
                  Dette
                </span>
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
                  className="text-xs text-amber-600 hover:text-amber-700 font-medium"
                >
                  {showAdvanced ? 'Masquer' : 'Options avancées'}
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
                    <div className="mt-4 p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                      <div className="flex items-start gap-2">
                        <AlertCircle className="h-4 w-4 text-slate-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-slate-700">Paramètres avancés</p>
                          <p className="text-xs text-slate-500 mt-1">
                            Définissez des conditions spécifiques pour cette dette
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-600">Intérêt (%)</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            className="h-9 text-sm"
                            min="0"
                            step="0.1"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs text-slate-600">Pénalité de retard</Label>
                          <Input
                            type="number"
                            placeholder="0"
                            className="h-9 text-sm"
                            min="0"
                          />
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Résumé */}
            {(formData.amount || formData.due_date) && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg border border-amber-200"
              >
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-amber-900">Récapitulatif</p>
                    <div className="flex items-center gap-4">
                      {formData.amount && (
                        <p className="text-xs text-amber-700">
                          <span className="font-medium">{formatAmount(formData.amount)} Ar</span>
                        </p>
                      )}
                      {formData.due_date && (
                        <p className="text-xs text-amber-700 flex items-center gap-1">
                          <CalendarIcon className="h-3 w-3" />
                          Échéance: {format(formData.due_date, 'dd/MM/yyyy', { locale: fr })}
                        </p>
                      )}
                    </div>
                  </div>
                  <Sparkles className="h-5 w-5 text-amber-400" />
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