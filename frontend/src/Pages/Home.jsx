// src/pages/Home.jsx
import React, { useState, useMemo } from "react";
import { base44 } from "@/api/baseClientbyG";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import {
  Users,
  TrendingUp,
  TrendingDown,
  Wallet,
  Plus,
  Search,
  ArrowUpDown,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Clock,
  Bell,
  ShoppingBag,
  Store,
  Receipt,
  UserPlus,
  BarChart3,
  Eye,
  Filter,
  ChevronRight,
  Sparkles,
  Shield,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import AddClientDialog from "@/components/clients/AddClientDialog";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("priority");
  const [showAddClient, setShowAddClient] = useState(false);
  const [viewMode, setViewMode] = useState("all"); // all, overdue, withDebt
  const queryClient = useQueryClient();

  const { data: clients = [], isLoading: loadingClients } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: stats } = useQuery({
    queryKey: ["stats"],
    queryFn: () => base44.entities.Stats.get(),
  });

  const { data: overdueClientIds = [] } = useQuery({
    queryKey: ["customers-overdue"],
    queryFn: () => base44.entities.Client.listOverdue(),
  });

  const createClientMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.create(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["clients"] }),
  });

  const formatAmount = (amount) =>
    new Intl.NumberFormat("fr-MG").format(amount || 0);

  const clientOverdueMap = useMemo(
    () => Object.fromEntries(overdueClientIds.map((id) => [id, true])),
    [overdueClientIds]
  );

  const totalDue = Number(stats?.totalDue ?? 0);
  const totalPayments = Number(stats?.totalPayments ?? 0);
  const clientsWithDebt = stats?.clientsWithDebt ?? 0;
  const clientsTotal = stats?.clientsTotal ?? clients.length;
  const overdueCount = overdueClientIds.length;

  const financialHealth = useMemo(() => {
    if (clientsWithDebt === 0) return "healthy";
    if (clientsWithDebt <= 3) return "warning";
    return "critical";
  }, [clientsWithDebt]);

  const filteredClients = useMemo(() => {
    let filtered = [...clients];
    
    // Filtre par recherche
    if (searchQuery) {
      filtered = filtered.filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Filtre par vue
    if (viewMode === "overdue") {
      filtered = filtered.filter((c) => clientOverdueMap[c.id]);
    } else if (viewMode === "withDebt") {
      filtered = filtered.filter((c) => c.total_due > 0);
    }
    
    // Tri
    return filtered.sort((a, b) => {
      if (sortBy === "priority") {
        const aOver = clientOverdueMap[a.id] ? 1 : 0;
        const bOver = clientOverdueMap[b.id] ? 1 : 0;
        if (aOver !== bOver) return bOver - aOver;
        return (b.total_due || 0) - (a.total_due || 0);
      }
      if (sortBy === "amount") {
        return (b.total_due || 0) - (a.total_due || 0);
      }
      return a.name.localeCompare(b.name);
    });
  }, [clients, searchQuery, sortBy, viewMode, clientOverdueMap]);

  const sortLabel =
    sortBy === "priority"
      ? "Priorité"
      : sortBy === "amount"
      ? "Montant"
      : "Nom";

  const topPriorityClients = useMemo(() => {
    return clients
      .filter((c) => clientOverdueMap[c.id] && c.total_due > 0)
      .sort((a, b) => (b.total_due || 0) - (a.total_due || 0))
      .slice(0, 3);
  }, [clients, clientOverdueMap]);

  const recentPayments = useMemo(() => {
    // Simulation de paiements récents - à remplacer par des vraies données
    const payments = clients
      .filter(c => c.total_due > 0)
      .slice(0, 3)
      .map(c => ({
        id: c.id,
        name: c.name,
        amount: Math.min(c.total_due * 0.3, 50000),
        date: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000),
      }))
      .sort((a, b) => b.date - a.date);
    
    return payments;
  }, [clients]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Alertes importantes */}
        {overdueCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6"
          >
            <Card className="border border-red-200 bg-gradient-to-r from-red-50 to-red-100 p-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                  <Bell className="h-4 w-4 text-red-600" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-red-900">
                      ⚠️ Attention : {overdueCount} client{overdueCount > 1 ? 's' : ''} en retard
                    </h3>
                    <Link to={createPageUrl("Clients")}>
                      <Button size="sm" variant="outline" className="h-7 text-xs border-red-300 text-red-700">
                        Voir tous
                      </Button>
                    </Link>
                  </div>
                  <p className="text-xs text-red-700 mt-1">
                    Pensez à relancer ces clients pour récupérer votre argent
                  </p>
                </div>
              </div>
            </Card>
          </motion.div>
        )}

        {/* Cartes principales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* Carte 1 : À récupérer */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Link to={createPageUrl("Clients")}>
              <Card className="p-6 bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                    <TrendingDown className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-amber-200 bg-white/20 px-2 py-1 rounded-full">
                      À suivre
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-amber-100 text-sm font-medium mb-1">À récupérer</p>
                  <p className="text-2xl sm:text-3xl font-bold">{formatAmount(totalDue)} Ar</p>
                  <div className="flex items-center justify-between mt-2">
                    <p className="text-amber-200 text-xs">
                      {clientsWithDebt} client{clientsWithDebt > 1 ? 's' : ''}
                    </p>
                    <Eye className="h-4 w-4 text-amber-200" />
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>

          {/* Carte 2 : Déjà récupéré */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card className="p-6 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                  <Wallet className="h-6 w-6" />
                </div>
                <div className="text-right">
                  <span className="text-xs text-emerald-200 bg-white/20 px-2 py-1 rounded-full">
                    Encaissé
                  </span>
                </div>
              </div>
              <div>
                <p className="text-emerald-100 text-sm font-medium mb-1">Déjà récupéré</p>
                <p className="text-2xl sm:text-3xl font-bold">{formatAmount(totalPayments)} Ar</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-emerald-200 text-xs">
                    Argent dans la caisse
                  </p>
                  <TrendingUp className="h-4 w-4 text-emerald-200" />
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Carte 3 : Mes clients */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Link to={createPageUrl("Clients")}>
              <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white border-0 shadow-lg hover:shadow-xl transition-shadow cursor-pointer">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-blue-200 bg-white/20 px-2 py-1 rounded-full">
                      Portefeuille
                    </span>
                  </div>
                </div>
                <div>
                  <p className="text-blue-100 text-sm font-medium mb-1">Mes clients</p>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl sm:text-3xl font-bold">{clientsTotal}</p>
                      <p className="text-blue-200 text-xs mt-1">
                        {clientsWithDebt} avec crédit
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 text-blue-200" />
                  </div>
                </div>
              </Card>
            </Link>
          </motion.div>
        </div>

        {/* Section recherche et filtres */}
        <div className="mb-6">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Rechercher un client par nom..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-white border-slate-200 focus:border-slate-800"
              />
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setSortBy(
                    sortBy === "priority"
                      ? "amount"
                      : sortBy === "amount"
                      ? "name"
                      : "priority"
                  )
                }
                className="gap-2 flex-1 sm:flex-none"
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortLabel}
              </Button>
            </div>
          </div>

          {/* Filtres rapides */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setViewMode("all")}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm transition-all",
                viewMode === "all"
                  ? "bg-slate-800 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              )}
            >
              Tous les clients
            </button>
            <button
              onClick={() => setViewMode("withDebt")}
              className={cn(
                "px-3 py-1.5 rounded-full text-sm transition-all",
                viewMode === "withDebt"
                  ? "bg-amber-100 text-amber-700 border border-amber-300"
                  : "text-slate-600 hover:bg-amber-50"
              )}
            >
              Avec crédit ({clientsWithDebt})
            </button>
            {overdueCount > 0 && (
              <button
                onClick={() => setViewMode("overdue")}
                className={cn(
                  "px-3 py-1.5 rounded-full text-sm transition-all",
                  viewMode === "overdue"
                    ? "bg-red-100 text-red-700 border border-red-300"
                    : "text-slate-600 hover:bg-red-50"
                )}
              >
                En retard ({overdueCount})
              </button>
            )}
          </div>
        </div>

        {/* Top 3 à relancer */}
        {topPriorityClients.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="mb-6"
          >
            <Card className="p-6 bg-gradient-to-r from-red-50 to-red-100 border border-red-200">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-red-100 flex items-center justify-center">
                    <Bell className="h-4 w-4 text-red-600" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-red-900">À relancer en priorité</h3>
                    <p className="text-xs text-red-700">Les plus importants en retard</p>
                  </div>
                </div>
                <Clock className="h-5 w-5 text-red-400" />
              </div>

              <div className="space-y-3">
                {topPriorityClients.map((client, index) => (
                  <Link key={client.id} to={`/clients/${client.id}`}>
                    <div className="group flex items-center justify-between p-3 bg-white rounded-lg border border-red-100 hover:border-red-300 hover:shadow-sm transition-all cursor-pointer">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center h-6 w-6 rounded-full bg-red-100 text-red-700 font-bold text-xs">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900 group-hover:text-slate-800">
                            {client.name}
                          </p>
                          <p className="text-xs text-slate-500">
                            {client.phone || 'Pas de téléphone'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="text-right">
                          <p className="font-semibold text-red-600">
                            {formatAmount(client.total_due)} Ar
                          </p>
                          <p className="text-xs text-slate-500">en retard</p>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-slate-600 transition-colors" />
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Liste des clients */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-900">
              {viewMode === "all" 
                ? "Tous mes clients" 
                : viewMode === "overdue" 
                ? "Clients en retard"
                : "Clients avec crédit"}
            </h2>
            <span className="text-sm text-slate-500">
              {filteredClients.length} client{filteredClients.length > 1 ? 's' : ''}
            </span>
          </div>

          <AnimatePresence>
            {loadingClients ? (
              <div className="flex justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : filteredClients.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <div className="h-16 w-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  {searchQuery ? (
                    <Search className="h-8 w-8 text-slate-400" />
                  ) : viewMode === "overdue" ? (
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  ) : (
                    <Users className="h-8 w-8 text-slate-400" />
                  )}
                </div>
                <p className="text-slate-500 mb-2">
                  {searchQuery
                    ? "Aucun client trouvé"
                    : viewMode === "overdue"
                    ? "Aucun client en retard"
                    : viewMode === "withDebt"
                    ? "Aucun client avec crédit"
                    : "Aucun client enregistré"}
                </p>
                {!searchQuery && (
                  <p className="text-slate-400 text-sm mb-4 max-w-sm mx-auto">
                    {viewMode === "all" && "Commencez par ajouter vos premiers clients"}
                    {viewMode === "withDebt" && "Tous vos clients sont à jour, c'est une bonne nouvelle !"}
                    {viewMode === "overdue" && "Tous vos clients sont à jour, excellent !"}
                  </p>
                )}
                {!searchQuery && viewMode === "all" && (
                  <Button 
                    onClick={() => setShowAddClient(true)}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter un client
                  </Button>
                )}
              </motion.div>
            ) : (
              <div className="space-y-3">
                {filteredClients.map((client, index) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <Link to={`/clients/${client.id}`}>
                      <Card className="p-4 border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all cursor-pointer">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "h-10 w-10 rounded-full flex items-center justify-center",
                              client.total_due > 0
                                ? "bg-amber-100 text-amber-600"
                                : "bg-emerald-100 text-emerald-600"
                            )}>
                              <UserPlus className="h-5 w-5" />
                            </div>
                            <div>
                              <p className="font-medium text-slate-900">{client.name}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {client.phone && (
                                  <p className="text-xs text-slate-500">{client.phone}</p>
                                )}
                                {clientOverdueMap[client.id] && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-800">
                                    En retard
                                  </span>
                                )}
                                {!clientOverdueMap[client.id] && client.total_due > 0 && (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-100 text-amber-800">
                                    Crédit en cours
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className={cn(
                              "font-semibold",
                              client.total_due > 0
                                ? "text-amber-600"
                                : "text-emerald-600"
                            )}>
                              {client.total_due > 0
                                ? `${formatAmount(client.total_due)} Ar`
                                : "À jour"}
                            </p>
                            <ChevronRight className="h-4 w-4 text-slate-400 mt-1 ml-auto" />
                          </div>
                        </div>
                      </Card>
                    </Link>
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        {/* Section conseils */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <Card className="p-6 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center flex-shrink-0">
                <Shield className="h-5 w-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-slate-900">Conseil de gestion</h4>
                <p className="text-sm text-slate-700 mt-1">
                  {clientsWithDebt === 0
                    ? "Tous vos clients sont à jour ! C'est le moment idéal pour proposer de nouveaux crédits à vos meilleurs clients."
                    : clientsWithDebt <= 2
                    ? `Vous avez seulement ${clientsWithDebt} client${clientsWithDebt > 1 ? 's' : ''} avec crédit. Continuez à suivre régulièrement leurs paiements.`
                    : `Vous avez ${clientsWithDebt} clients avec crédit. Pensez à relancer les retards et à fixer des échéances claires.`}
                </p>
                <div className="flex items-center gap-3 mt-3">
                  <Link to={createPageUrl("Statistics")}>
                    <Button size="sm" className="bg-slate-800 hover:bg-slate-900">
                      <BarChart3 className="h-3.5 w-3.5 mr-1" />
                      Voir les statistiques
                    </Button>
                  </Link>
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => setShowAddClient(true)}
                  >
                    <UserPlus className="h-3.5 w-3.5 mr-1" />
                    Nouveau client
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Bouton flottant pour mobile */}
      <div className="sm:hidden fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setShowAddClient(true)}
          className="h-14 w-14 rounded-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 shadow-lg"
          size="icon"
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Dialog ajout client */}
      <AddClientDialog
        open={showAddClient}
        onOpenChange={setShowAddClient}
        onSubmit={(data) => createClientMutation.mutateAsync(data)}
      />
    </div>
  );
}