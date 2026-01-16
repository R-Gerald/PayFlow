// src/Pages/Home.jsx
import React, { useState } from "react";
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
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import StatsCard from "@/components/dashboard/StatsCard";
import ClientCard from "@/components/clients/ClientCard";
import AddClientDialog from "@/components/clients/AddClientDialog";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("amount");
  const [showAddClient, setShowAddClient] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: clients = [],
    isLoading: loadingClients,
  } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: transactions = [] } = useQuery({
    queryKey: ["transactions"],
    queryFn: () => base44.entities.Transaction.list(),
  });
  const {
  data: stats,
  isLoading: loadingStats,
} = useQuery({
  queryKey: ["stats"],
  queryFn: () => base44.entities.Stats.get(),
});

  const createClientMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });


  const formatAmount = (amount) => {
    return new Intl.NumberFormat("fr-MG").format(amount || 0);
  };

  const totalDue = stats ? Number(stats.totalDue ?? 0) : 0;
const totalPayments = stats ? Number(stats.totalPayments ?? 0) : 0;
const clientsWithDebt = stats ? stats.clientsWithDebt ?? 0 : 0;
const clientsTotal = stats ? stats.clientsTotal ?? clients.length : clients.length;
const { data: overdueClientIds = [] } = useQuery({
  queryKey: ["customers-overdue"],
  queryFn: () => base44.entities.Client.listOverdue(),
});

const clientOverdueStatus = Object.fromEntries(
  overdueClientIds.map((id) => [id, true])
);


  const filteredClients = clients
    .filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((c) => c.total_due > 0 || searchQuery === "")
    .sort((a, b) => {
      if (sortBy === "amount")
        return (b.total_due || 0) - (a.total_due || 0);
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 pb-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-800">
            PayFlow
          </h1>
          <p className="text-sm sm:text-base text-slate-500 mt-1">
            Gérez vos crédits simplement
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          <StatsCard
            title="Total dû"
            value={`${formatAmount(totalDue)} Ar`}
            icon={TrendingUp}
            color="amber"
          />
          <StatsCard
            title="Récupéré"
            value={`${formatAmount(totalPayments)} Ar`}
            icon={Wallet}
            color="emerald"
          />
          <div className="sm:col-span-2 lg:col-span-1">
            <StatsCard
  title="Clients avec crédit"
  value={clientsWithDebt}
  subtitle={`sur ${clientsTotal} clients au total`}
  icon={Users}
  color="blue"
/>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher un client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white/80 border-slate-200"
            />
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={() =>
              setSortBy(sortBy === "amount" ? "name" : "amount")
            }
            className="bg-white/80"
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {/* Clients List */}
        <div className="space-y-2 sm:space-y-3">
          <AnimatePresence>
            {loadingClients ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : filteredClients.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  {searchQuery
                    ? "Aucun client trouvé"
                    : "Aucun client avec crédit"}
                </p>
                <Button
                  className="mt-4"
                  onClick={() => setShowAddClient(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un client
                </Button>
              </motion.div>
            ) : (
              filteredClients.map((client, index) => (
                <motion.div
                  key={client.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <ClientCard
                    client={client}
                    hasOverdue={clientOverdueStatus[client.id]}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Floating Add Button - harmonisé avec Clients.jsx */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed right-4 bottom-20 md:bottom-24 z-[60]"
        >
          <Button
            size="lg"
            className="rounded-full h-12 w-12 sm:h-14 sm:w-14 shadow-lg bg-slate-900 hover:bg-slate-800"
            onClick={() => setShowAddClient(true)}
          >
            <Plus className="h-5 w-5 sm:h-6 sm:w-6" />
          </Button>
        </motion.div>

        {/* Add Client Dialog */}
        <AddClientDialog
          open={showAddClient}
          onOpenChange={setShowAddClient}
          onSubmit={(data) => createClientMutation.mutateAsync(data)}
        />
      </div>
    </div>
  );
}