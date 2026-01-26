// src/pages/Home.jsx
import React, { useState, useMemo } from "react";
import { base44 } from "@/api/baseClientbyG";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users,
  TrendingUp,
  Wallet,
  Plus,
  Search,
  ArrowUpDown,
  Loader2,
  AlertTriangle,
  CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StatsCard from "@/components/dashboard/StatsCard";
import ClientCard from "@/components/clients/ClientCard";
import AddClientDialog from "@/components/clients/AddClientDialog";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("priority");
  const [showAddClient, setShowAddClient] = useState(false);
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

  

  const financialHealth = useMemo(() => {
    if (clientsWithDebt === 0) return "healthy";
    if (clientsWithDebt <= 3) return "warning";
    return "critical";
  }, [clientsWithDebt]);

 
  const filteredClients = useMemo(() => {
    return clients
      .filter((c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
      .filter((c) => c.total_due > 0 || searchQuery !== "")
      .sort((a, b) => {
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
  }, [clients, searchQuery, sortBy, clientOverdueMap]);



  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-28">

        {/* HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-800">PayFlow</h1>
            <p className="text-slate-500">
              Suivi simple et fiable de vos crédits clients
            </p>
          </div>
        </motion.div>

        {/* FINANCIAL HEALTH */}
        <div className="mb-6">
          {financialHealth === "healthy" && (
            <div className="flex items-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              <span>Situation saine — aucun client en retard </span>
            </div>
          )}
          {financialHealth === "warning" && (
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <span>Quelques crédits à surveiller</span>
            </div>
          )}
          {financialHealth === "critical" && (
            <div className="flex items-center gap-2 text-red-600 font-medium">
              <AlertTriangle className="h-5 w-5" />
              <span>Attention : plusieurs clients en retard</span>
            </div>
          )}
        </div>

        {/* STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <StatsCard
            title="Total dû"
            value={`${formatAmount(totalDue)} Ar`}
            subtitle="À récupérer"
            icon={TrendingUp}
            color="amber"
          />
          <StatsCard
            title="Récupéré"
            value={`${formatAmount(totalPayments)} Ar`}
            subtitle="Encaissements"
            icon={Wallet}
            color="emerald"
          />
          <StatsCard
            title="Clients avec crédit"
            value={clientsWithDebt}
            subtitle={`sur ${clientsTotal} clients`}
            icon={Users}
            color="blue"
          />
        </div>

        {/* SEARCH & SORT */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher un client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white"
            />
          </div>

          <Button
            variant="outline"
            onClick={() =>
              setSortBy(
                sortBy === "priority"
                  ? "amount"
                  : sortBy === "amount"
                  ? "name"
                  : "priority"
              )
            }
          >
            <ArrowUpDown className="h-4 w-4 mr-2" />
            Trier
          </Button>
        </div>

        {/* CLIENT LIST */}
        <AnimatePresence>
          {loadingClients ? (
            <div className="flex justify-center py-20">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : filteredClients.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 mb-4">
                {searchQuery
                  ? "Aucun client trouvé"
                  : "Aucun client avec crédit actif"}
              </p>
              <Button onClick={() => setShowAddClient(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Ajouter un client
              </Button>
            </motion.div>
          ) : (
            <div className="space-y-3">
              {filteredClients.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                >
                  <ClientCard
                    client={client}
                    hasOverdue={clientOverdueMap[client.id]}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </AnimatePresence>

        {/* ADD CLIENT DIALOG */}
        <AddClientDialog
          open={showAddClient}
          onOpenChange={setShowAddClient}
          onSubmit={(data) => createClientMutation.mutateAsync(data)}
        />
      </div>
    </div>
  );
}
