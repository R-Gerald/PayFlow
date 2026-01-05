// src/utils.js

// Génère les URLs des pages à partir d'un nom logique
export function createPageUrl(pageName) {
  switch (pageName) {
    case "Home":
      return "/";
    case "Clients":
      return "/clients";
    case "ClientDetail":
      // utilisé avec un id ailleurs : createPageUrl("ClientDetail") + "/" + id
      return "/clients";
    case "Statistics":
      return "/statistics";
    default:
      return "/";
  }
}