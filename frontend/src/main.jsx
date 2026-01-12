// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { notifyQueryError, setQueryErrorNotifier } from "@/lib/queryErrorNotifier";
import { useToast } from "@/hooks/use-toast";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      onError: (error, query) => {
        notifyQueryError(error, { type: "query", query });
      },
    },
    mutations: {
      retry: 0,
      onError: (error, variables, context) => {
        notifyQueryError(error, { type: "mutation", variables, context });
      },
    },
  },
});

// Composant qui enregistre le toast comme notificateur global
function QueryErrorToastBridge() {
  const { toast } = useToast();

  React.useEffect(() => {
    setQueryErrorNotifier((error, context) => {
      const message =
        error?.response?.data?.message ||
        error?.message ||
        "Une erreur est survenue.";

      // On peut adapter selon context.type === "query" / "mutation"
      toast({
        title: "Erreur",
        description: message,
        variant: "destructive",
      });
    });
  }, [toast]);

  return null;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
      <Toaster />
      <QueryErrorToastBridge />
    </QueryClientProvider>
  </React.StrictMode>
);