// src/App.jsx
import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./Layout";
import Home from "./Pages/Home.jsx";
import Clients from "./Pages/Clients.jsx";
import ClientDetail from "./Pages/ClientDetail.jsx";
import Statistics from "./Pages/Statistics.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/clients" element={<Clients />} />
          <Route path="/clients/:id" element={<ClientDetail />} />
          <Route path="/statistics" element={<Statistics />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}