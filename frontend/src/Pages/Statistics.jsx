import React, { useState, useMemo } from "react";
import { base44 } from "@/api/baseClientbyG";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChevronLeft,
  TrendingUp,
  TrendingDown,
  Wallet,
  Users,
  Loader2,
  Calendar,
  Filter,
  DollarSign,
  CreditCard,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShoppingBag,
  Store,
  Receipt,
  RefreshCw,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function Statistics() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [showFilterDialog, setShowFilterDialog] = useState(false);

  /* ===================== QUERIES ===================== */
  const { data: stats, isLoading: loadingStats } = useQuery({
    queryKey: ["stats", fromDate, toDate],
    queryFn: () =>
      base44.entities.Stats.get({
        from: fromDate || undefined,
        to: toDate || undefined,
      }),
  });

  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: transactions = [], isLoading: loadingTransactions } = useQuery({
    queryKey: ["transactions", fromDate, toDate],
    queryFn: () =>
      base44.entities.Transaction.list({
        from: fromDate || undefined,
        to: toDate || undefined,
      }),
  });

  const isLoading = loadingStats || loadingClients || loadingTransactions;

  /* ===================== DATA CALCULATIONS ===================== */
  const formatAmount = (amount) =>
    new Intl.NumberFormat("fr-MG").format(amount || 0);

  const totalDue = Number(stats?.totalDue ?? 0);
  const totalPayments = Number(stats?.totalPayments ?? 0);
  const clientsWithDebt = stats?.clientsWithDebt ?? clients.filter(c => c.total_due > 0).length;
  const clientsTotal = stats?.clientsTotal ?? clients.length;
  const clientsPaid = clientsTotal - clientsWithDebt;
  
  // Recovery rate
  const totalDebt = totalDue + totalPayments;
  const recoveryRate = totalDebt > 0 ? (totalPayments / totalDebt * 100) : 100;

  const topDebtors = useMemo(() => {
    return [...clients]
      .filter((c) => c.total_due > 0)
      .sort((a, b) => (b.total_due || 0) - (a.total_due || 0))
      .slice(0, 5);
  }, [clients]);

  const recentPayments = useMemo(() => {
    return [...transactions]
      .filter(t => t.type === 'payment')
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 3);
  }, [transactions]);

  const pieData = [
    { name: "Argent récupéré", value: totalPayments, color: "#10B981" },
    { name: "En attente", value: totalDue, color: "#F59E0B" },
  ].filter((d) => d.value > 0);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400 mx-auto" />
          <p className="text-slate-600 text-sm">Chargement des données...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-20 sm:pb-24">
      {/* Header simple - Élargi */}
      <div className="bg-white border-b border-slate-200">
        <div className="px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link to={createPageUrl("Home")}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 hover:bg-slate-100"
                >
                  <ChevronLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-xl sm:text-2xl font-semibold text-slate-900">
                  Mon tableau de bord
                </h1>
                <p className="text-slate-600 text-sm sm:text-base">
                  Suivi de mes crédits clients
                </p>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterDialog(true)}
              className="gap-2"
            >
              <Filter className="h-4 w-4" />
              <span className="hidden sm:inline">Filtrer</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Contenu principal - ÉLARGI */}
      <div className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Grille principale avec sidebar virtuelle pour les grands écrans */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Colonne principale (70-80% de l'espace) */}
          <div className="lg:flex-1 lg:max-w-5xl">
            {/* Résumé principal - Layout amélioré */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <Card className="p-6 bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                      <ShoppingBag className="h-7 w-7" />
                    </div>
                    <TrendingDown className="h-6 w-6 text-amber-200" />
                  </div>
                  <div>
                    <p className="text-amber-100 text-base font-medium mb-2">Crédits à récupérer</p>
                    <p className="text-3xl lg:text-4xl font-bold">{formatAmount(totalDue)} Ar</p>
                    <p className="text-amber-200 text-sm mt-3">
                      {clientsWithDebt} client{clientsWithDebt > 1 ? 's' : ''} concerné{clientsWithDebt > 1 ? 's' : ''}
                    </p>
                  </div>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Card className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="h-14 w-14 rounded-full bg-white/20 flex items-center justify-center">
                      <Wallet className="h-7 w-7" />
                    </div>
                    <TrendingUp className="h-6 w-6 text-emerald-200" />
                  </div>
                  <div>
                    <p className="text-emerald-100 text-base font-medium mb-2">Déjà récupéré</p>
                    <p className="text-3xl lg:text-4xl font-bold">{formatAmount(totalPayments)} Ar</p>
                    <p className="text-emerald-200 text-sm mt-3">
                      {recoveryRate.toFixed(0)}% du total
                    </p>
                  </div>
                </Card>
              </motion.div>
            </div>

            {/* Clients et Graphique côte à côte sur desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Clients */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Card className="p-6 bg-white border border-slate-200 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <Users className="h-5 w-5 text-slate-700" />
                      Mes clients
                    </h3>
                    <Link to={createPageUrl("Clients")}>
                      <Button variant="ghost" size="sm" className="text-xs">
                        Voir tous
                      </Button>
                    </Link>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <p className="text-2xl lg:text-3xl font-bold text-slate-900">{clientsTotal}</p>
                      <p className="text-sm text-slate-600 mt-1">Total</p>
                    </div>
                    <div className="p-4 bg-amber-50 rounded-lg">
                      <p className="text-2xl lg:text-3xl font-bold text-amber-600">{clientsWithDebt}</p>
                      <p className="text-sm text-slate-600 mt-1">Avec crédit</p>
                    </div>
                    <div className="p-4 bg-emerald-50 rounded-lg">
                      <p className="text-2xl lg:text-3xl font-bold text-emerald-600">{clientsPaid}</p>
                      <p className="text-sm text-slate-600 mt-1">À jour</p>
                    </div>
                  </div>
                </Card>
              </motion.div>

              {/* Graphique simple */}
              {pieData.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                >
                  <Card className="p-6 bg-white border border-slate-200 h-full">
                    <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                      <CreditCard className="h-5 w-5 text-slate-700" />
                      Répartition de l'argent
                    </h3>
                    
                    <div className="h-48 lg:h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={pieData}
                            dataKey="value"
                            innerRadius={50}
                            outerRadius={70}
                          >
                            {pieData.map((d, i) => (
                              <Cell key={i} fill={d.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(v) => `${formatAmount(v)} Ar`}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mt-4">
                      {pieData.map((item, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <div 
                            className="h-3 w-3 rounded-full flex-shrink-0" 
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="text-sm">
                            <span className="font-medium text-slate-700">{item.name}</span>
                            <span className="text-slate-500 ml-1">{formatAmount(item.value)} Ar</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </motion.div>
              )}
            </div>

            {/* Deux colonnes en bas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Clients à relancer */}
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6 bg-white border border-slate-200 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-500" />
                      À relancer ({topDebtors.length})
                    </h3>
                    <Clock className="h-5 w-5 text-slate-400" />
                  </div>
                  
                  {topDebtors.length > 0 ? (
                    <div className="space-y-3">
                      {topDebtors.map((client, index) => (
                        <Link key={client.id} to={`/clients/${client.id}`}>
                          <div className="p-4 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all">
                            <div className="flex items-center justify-between">
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900 truncate">{client.name}</p>
                                <p className="text-sm text-slate-500 truncate">
                                  {client.phone || 'Pas de téléphone'}
                                </p>
                              </div>
                              <div className="text-right flex-shrink-0 ml-4">
                                <p className="font-semibold text-amber-600 text-lg">
                                  {formatAmount(client.total_due)} Ar
                                </p>
                              </div>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3" />
                      <p className="text-slate-500">Tout est à jour !</p>
                      <p className="text-slate-400 text-sm mt-1">Aucun crédit en attente</p>
                    </div>
                  )}
                </Card>
              </motion.div>

              {/* Derniers paiements */}
              <motion.div
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
              >
                <Card className="p-6 bg-white border border-slate-200 h-full">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                      <Receipt className="h-5 w-5 text-emerald-500" />
                      Derniers paiements
                    </h3>
                    <Store className="h-5 w-5 text-slate-400" />
                  </div>
                  
                  {recentPayments.length > 0 ? (
                    <div className="space-y-3">
                      {recentPayments.map((payment) => (
                        <div 
                          key={payment.id} 
                          className="p-4 rounded-lg border border-emerald-100 bg-emerald-50"
                        >
                          <div className="flex items-center justify-between">
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900 truncate">
                                {clients.find(c => c.id === payment.client_id)?.name || 'Client'}
                              </p>
                              <p className="text-sm text-slate-500">
                                {new Date(payment.date).toLocaleDateString('fr-FR')}
                                {payment.payment_method && ` • ${payment.payment_method}`}
                              </p>
                            </div>
                            <div className="text-right flex-shrink-0 ml-4">
                              <p className="font-semibold text-emerald-600 text-lg">
                                +{formatAmount(payment.amount)} Ar
                              </p>
                            </div>
                          </div>
                          {payment.description && (
                            <p className="text-sm text-slate-600 mt-2 truncate">
                              {payment.description}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <DollarSign className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                      <p className="text-slate-500">Aucun paiement récent</p>
                      <p className="text-slate-400 text-sm mt-1">Les paiements apparaîtront ici</p>
                    </div>
                  )}
                </Card>
              </motion.div>
            </div>

            {/* Conseil pour le commerçant */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
            >
              <Card className="p-6 bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200">
                <div className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base font-semibold text-blue-900">Conseil du jour</h4>
                    <p className="text-base text-blue-700 mt-2">
                      {clientsWithDebt > 0 ? (
                        `Pensez à relancer les ${clientsWithDebt} client${clientsWithDebt > 1 ? 's' : ''} qui vous doivent de l'argent. Un petit rappel téléphonique peut faire la différence !`
                      ) : (
                        "Tous vos clients sont à jour ! C'est le moment idéal pour proposer de nouveaux crédits à vos meilleurs clients."
                      )}
                    </p>
                    <div className="flex items-center gap-3 mt-4">
                      <Link to={createPageUrl("Clients")}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 px-4">
                          Voir mes clients
                        </Button>
                      </Link>
                      <Link to={createPageUrl("AddClient")}>
                        <Button size="sm" variant="outline" className="px-4">
                          Nouveau client
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          </div>

          {/* Colonne latérale pour les grands écrans (optionnel) */}
          <div className="lg:w-64 lg:flex-shrink-0">
            {/* Vous pouvez ajouter ici des éléments supplémentaires pour les grands écrans */}
            <div className="hidden lg:block">
              <Card className="p-4 bg-white border border-slate-200 mb-4">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Filtres actifs</h4>
                {(fromDate || toDate) ? (
                  <div className="space-y-2">
                    {fromDate && (
                      <p className="text-xs text-slate-600">
                        Du: {new Date(fromDate).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                    {toDate && (
                      <p className="text-xs text-slate-600">
                        Au: {new Date(toDate).toLocaleDateString('fr-FR')}
                      </p>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs"
                      onClick={() => {
                        setFromDate("");
                        setToDate("");
                      }}
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Effacer les filtres
                    </Button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500">Aucun filtre actif</p>
                )}
              </Card>
              
              <Card className="p-4 bg-white border border-slate-200">
                <h4 className="text-sm font-semibold text-slate-900 mb-2">Statut rapide</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Taux de recouvrement</span>
                    <span className="text-xs font-medium text-emerald-600">{recoveryRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Moyenne par client</span>
                    <span className="text-xs font-medium text-slate-900">
                      {clientsTotal > 0 ? formatAmount(totalDebt / clientsTotal) : 0} Ar
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-600">Dette moyenne</span>
                    <span className="text-xs font-medium text-amber-600">
                      {clientsWithDebt > 0 ? formatAmount(totalDue / clientsWithDebt) : 0} Ar
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>

      {/* Dialog filtre simple */}
      <Dialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Filtrer par période</DialogTitle>
            <DialogDescription>
              Affichez les statistiques pour une période spécifique.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Du
                </label>
                <input
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Au
                </label>
                <input
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-slate-800 focus:border-transparent"
                />
              </div>
            </div>
            
            {/* Boutons rapides */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const lastWeek = new Date(today.setDate(today.getDate() - 7));
                  setFromDate(lastWeek.toISOString().split('T')[0]);
                  setToDate(new Date().toISOString().split('T')[0]);
                }}
                className="justify-start h-8 text-xs"
              >
                <Calendar className="h-3 w-3 mr-1" />
                Cette semaine
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const today = new Date();
                  const lastMonth = new Date(today.setMonth(today.getMonth() - 1));
                  setFromDate(lastMonth.toISOString().split('T')[0]);
                  setToDate(new Date().toISOString().split('T')[0]);
                }}
                className="justify-start h-8 text-xs"
              >
                <Calendar className="h-3 w-3 mr-1" />
                Ce mois-ci
              </Button>
            </div>
            
            {(fromDate || toDate) && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setFromDate("");
                  setToDate("");
                }}
              >
                <RefreshCw className="h-3 w-3 mr-2" />
                Réinitialiser
              </Button>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFilterDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => setShowFilterDialog(false)}>
              Valider
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}