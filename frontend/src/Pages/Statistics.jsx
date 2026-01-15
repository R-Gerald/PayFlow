import React, { useState } from "react";
import { base44 } from "@/api/baseClientbyG";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ChevronLeft,
  TrendingUp,
  Wallet,
  Users,
  PieChart as PieChartIcon,
  Loader2,
  Calendar,
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
      </div>
    );
  }

  /* ===================== DATA ===================== */

  const formatAmount = (amount) =>
    new Intl.NumberFormat("fr-MG").format(amount || 0);

  const totalDue = Number(stats?.totalDue ?? 0);
  const totalPayments = Number(stats?.totalPayments ?? 0);
  const clientsWithDebt = stats?.clientsWithDebt ?? 0;
  const clientsTotal = stats?.clientsTotal ?? clients.length;
  const clientsPaid = clientsTotal - clientsWithDebt;

  const topDebtors = [...clients]
    .filter((c) => c.total_due > 0)
    .sort((a, b) => (b.total_due || 0) - (a.total_due || 0))
    .slice(0, 5);

  const pieData = [
    { name: "Récupéré", value: totalPayments, color: "#10B981" },
    { name: "En attente", value: totalDue, color: "#F59E0B" },
  ].filter((d) => d.value > 0);

  /* ===================== RENDER ===================== */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24">

        {/* ===================== HEADER ===================== */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <Link to={createPageUrl("Home")}>
              <Button variant="ghost" size="icon">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">
                Statistiques
              </h1>
              <p className="text-sm text-slate-500">
                Vue d&apos;ensemble de vos crédits
              </p>
            </div>
          </div>
        </div>

        {/* ===================== FILTRE PERIODE (DÉPLACÉ ICI) ===================== */}
        <Card className="mb-6 p-4 border-0 bg-white/80">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <span className="text-sm text-slate-500">
              {fromDate || toDate
                ? fromDate && toDate
                  ? `Période : du ${fromDate} au ${toDate}`
                  : fromDate
                  ? `Période : depuis le ${fromDate}`
                  : `Période : jusqu'au ${toDate}`
                : "Période : toutes les transactions"}
            </span>

            <Button
              variant="outline"
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setShowFilterDialog(true)}
            >
              <Calendar className="h-4 w-4" />
              Filtrer par période
            </Button>
          </div>
        </Card>

        {/* ===================== STATS ===================== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
          <Card className="p-5 border-0 bg-gradient-to-br from-amber-500 to-amber-600 text-white">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp />
              <span>Total dû</span>
            </div>
            <p className="text-2xl font-bold">{formatAmount(totalDue)} Ar</p>
          </Card>

          <Card className="p-5 border-0 bg-gradient-to-br from-emerald-500 to-emerald-600 text-white">
            <div className="flex items-center gap-3 mb-2">
              <Wallet />
              <span>Récupéré</span>
            </div>
            <p className="text-2xl font-bold">
              {formatAmount(totalPayments)} Ar
            </p>
          </Card>
        </div>

        {/* ===================== CLIENTS ===================== */}
        <Card className="p-5 mb-8 border-0 bg-white/80">
          <h3 className="font-semibold mb-4 flex items-center gap-2">
            <Users /> Répartition des clients
          </h3>
          <div className="grid grid-cols-3 text-center">
            <div>
              <p className="text-3xl font-bold">{clientsTotal}</p>
              <p className="text-sm text-slate-500">Total</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-amber-600">
                {clientsWithDebt}
              </p>
              <p className="text-sm text-slate-500">Avec crédit</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-emerald-600">
                {clientsPaid}
              </p>
              <p className="text-sm text-slate-500">À jour</p>
            </div>
          </div>
        </Card>

        {/* ===================== CHART ===================== */}
        {pieData.length > 0 && (
          <Card className="p-5 mb-8 border-0 bg-white/80">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <PieChartIcon /> Répartition des montants
            </h3>
            <div className="h-48">
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
          </Card>
        )}

        {/* ===================== TOP DEBTS ===================== */}
        {topDebtors.length > 0 && (
          <Card className="p-5 border-0 bg-white/80">
            <h3 className="font-semibold mb-4">
              Top 5 – Plus gros crédits
            </h3>
            {topDebtors.map((c, i) => (
              <Link key={c.id} to={`/clients/${c.id}`}>
                <div className="flex justify-between p-3 rounded-lg hover:bg-slate-50">
                  <span>{i + 1}. {c.name}</span>
                  <span className="font-semibold text-amber-600">
                    {formatAmount(c.total_due)} Ar
                  </span>
                </div>
              </Link>
            ))}
          </Card>
        )}

        {/* ===================== DIALOG FILTRE ===================== */}
        <AlertDialog open={showFilterDialog} onOpenChange={setShowFilterDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Filtrer par période</AlertDialogTitle>
              <AlertDialogDescription>
                Choisissez une plage de dates.
              </AlertDialogDescription>
            </AlertDialogHeader>

            <div className="space-y-3">
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              />
            </div>

            <AlertDialogFooter>
              <AlertDialogCancel>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={() => setShowFilterDialog(false)}>
                Appliquer
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

      </div>
    </div>
  );
}
