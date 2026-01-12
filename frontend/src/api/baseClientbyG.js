// src/api/base44Client.js
import axios from "axios";

// Backend Spring Boot
const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Si tu as déjà un JWT côté front, tu pourras ajouter un interceptor ici
// pour mettre automatiquement Authorization: Bearer <token> sur chaque requête.
 api.interceptors.request.use((config) => {
   const token = localStorage.getItem("payflow_token");
   if (token) {
     config.headers.Authorization = `Bearer ${token}`;
   }
   return config;
 });

export const base44 = {
  entities: {
    Client: {
      // Liste des clients du merchant connecté
      async list() {
        const res = await api.get(`/me/customers`);
        // Backend: CustomerDto { id, name, phone, notes, totalDue }
        return res.data.map((c) => ({
          id: c.id,
          name: c.name,
          phone: c.phone,
          notes: c.notes,
          total_due: Number(c.totalDue ?? 0),
        }));
      },

      // Créer un client pour le merchant connecté
      async create(data) {
        // data vient du formulaire AddClientDialog : { name, phone, note }
        const payload = {
          name: data.name,
          phone: data.phone,
          notes: data.note ?? data.notes ?? "",
        };
        const res = await api.post(`/me/customers`, payload);
        return {
          id: res.data.id,
          name: res.data.name,
          phone: res.data.phone,
          notes: res.data.notes,
          total_due: 0,
        };
      },

      async update(id, data) {
        const payload = {
          name: data.name,
          phone: data.phone,
          notes: data.notes ?? data.note ?? "",
        };
        const res = await api.put(`/me/customers/${id}`, payload);
        return {
          id: res.data.id,
          name: res.data.name,
          phone: res.data.phone,
          notes: res.data.notes,
          total_due: Number(res.data.totalDue ?? 0),
        };
      },

      async delete(id) {
        await api.delete(`/me/customers/${id}`);
      },

    },

    Transaction: {
      // Récupérer toutes les transactions du merchant connecté
      async list() {
        const res = await api.get(`/me/transactions`);
        const mapped = res.data.map((t) => ({
          id: t.id,
          client_id: t.customerId,
          type: t.type === "PAYMENT" ? "payment" : "debt",
          amount: Number(t.amount ?? 0),
          description: t.description,
          date: t.transactionDate,
          due_date: t.dueDate,
          payment_method: t.paymentMethod,
        }));
        return mapped;
      },

      // Créer une nouvelle transaction pour le merchant connecté
      async create(data) {
        // data: { client_id, type: 'payment' | 'debt', amount, description, date, due_date, payment_method }
        const payload = {
          customerId: data.client_id,
          type: data.type === "payment" ? "PAYMENT" : "CREDIT",
          amount: data.amount,
          description: data.description,
          transactionDate: data.date,   // si null, le backend met LocalDate.now()
          dueDate: data.due_date,
          paymentMethod: data.payment_method,
        };

        const res = await api.post(`/me/transactions`, payload);
        const t = res.data;

        return {
          id: t.id,
          client_id: t.customerId,
          type: t.type === "PAYMENT" ? "payment" : "debt",
          amount: Number(t.amount ?? 0),
          description: t.description,
          date: t.transactionDate,
          due_date: t.dueDate,
          payment_method: t.paymentMethod,
        };
      },
    },
  },
};