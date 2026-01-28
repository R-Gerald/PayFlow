import React, { useState } from "react";
import { base44 } from "@/api/baseClientbyG";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import {
  Users,
  Plus,
  Search,
  ArrowUpDown,
  Loader2,
  ChevronLeft,
  AlertTriangle,
  BadgeCheck,
} from "lucide-react";

import { motion, AnimatePresence } from "framer-motion";

import ClientCard from "@/components/clients/ClientCard";
import AddClientDialog from "@/components/clients/AddClientDialog";

export default function Clients() {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("amount");
  const [filterDebt, setFilterDebt] = useState("all");
  const [showAddClient, setShowAddClient] = useState(false);

  const queryClient = useQueryClient();

  // ===== DATA =====
  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["clients"],
    queryFn: () => base44.entities.Client.list(),
  });

  const { data: overdueClientIds = [] } = useQuery({
    queryKey: ["customers-overdue"],
    queryFn: () => base44.entities.Client.listOverdue(),
  });

  const clientOverdueStatus = Object.fromEntries(
    overdueClientIds.map((id) => [id, true])
  );

  // ===== CREATE CLIENT =====
  const createClientMutation = useMutation({
    mutationFn: (data) => base44.entities.Client.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["clients"] });
    },
  });

  // ===== FILTER + SORT =====
  const filteredClients = clients
    .filter((c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .filter((c) => {
      if (filterDebt === "with_debt") return c.total_due > 0;
      if (filterDebt === "overdue") return clientOverdueStatus[c.id];
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "amount")
        return (b.total_due || 0) - (a.total_due || 0);
      return a.name.localeCompare(b.name);
    });

  // ===== COUNTERS =====
  const totalClients = clients.length;
  const clientsWithDebt = clients.filter((c) => c.total_due > 0).length;
  const overdueClients = overdueClientIds.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">
        {/* ================= HEADER ================= */}
        <div className="flex items-center gap-4 mb-6">
          <Link to={createPageUrl("Home")}>
            <Button variant="ghost" size="icon">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>

          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-800">
              Mes clients
            </h1>
            <p className="text-slate-500 text-sm">
              Gérez facilement vos crédits et paiements
            </p>
          </div>
        </div>

        {/* ================= OVERVIEW STATS ================= */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div className="rounded-xl bg-white shadow-sm border p-4 flex items-center gap-3">
            <Users className="h-5 w-5 text-slate-500" />
            <div>
              <p className="text-xs text-slate-500">Total clients</p>
              <p className="font-bold text-slate-800">{totalClients}</p>
            </div>
          </div>

          <div className="rounded-xl bg-white shadow-sm border p-4 flex items-center gap-3">
            <BadgeCheck className="h-5 w-5 text-amber-500" />
            <div>
              <p className="text-xs text-slate-500">Avec crédit actif</p>
              <p className="font-bold text-slate-800">{clientsWithDebt}</p>
            </div>
          </div>

          <div className="rounded-xl bg-white shadow-sm border p-4 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <p className="text-xs text-slate-500">En retard</p>
              <p className="font-bold text-slate-800">{overdueClients}</p>
            </div>
          </div>
        </div>

        {/* ================= SEARCH + FILTERS ================= */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Rechercher un client..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-white border-slate-200"
            />
          </div>

          {/* Filters Pills */}
          <div className="flex gap-2">
            {[
              { key: "all", label: "Tous" },
              { key: "with_debt", label: "Crédit actif" },
              { key: "overdue", label: "En retard" },
            ].map((f) => (
              <Button
                key={f.key}
                variant={filterDebt === f.key ? "default" : "outline"}
                onClick={() => setFilterDebt(f.key)}
                className="text-sm"
              >
                {f.label}
              </Button>
            ))}
          </div>

          {/* Sort */}
          <Button
            variant="outline"
            onClick={() =>
              setSortBy(sortBy === "amount" ? "name" : "amount")
            }
            className="flex gap-2"
          >
            <ArrowUpDown className="h-4 w-4" />
            Tri : {sortBy === "amount" ? "Montant dû" : "Nom"}
          </Button>
        </div>

        {/* ================= CLIENTS LIST ================= */}
        <div className="space-y-3">
          <AnimatePresence>
            {isLoading ? (
              <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : filteredClients.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16"
              >
                <Users className="h-12 w-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-500">
                  Aucun client trouvé.
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredClients.map((client, index) => (
                  <motion.div
                    key={client.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                  >
                    <ClientCard
                      client={client}
                      hasOverdue={clientOverdueStatus[client.id]}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </AnimatePresence>
        </div>

        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="fixed right-4 bottom-20 z-[60]"
        >
          <Button
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg bg-slate-900 hover:bg-slate-800"
            onClick={() => setShowAddClient(true)}
          >
            <Plus className="h-6 w-6" />
          </Button>
        </motion.div>

       
        <AddClientDialog
          open={showAddClient}
          onOpenChange={setShowAddClient}
          onSubmit={(data) => createClientMutation.mutateAsync(data)}
        />
      </div>
    </div>
  );
}
