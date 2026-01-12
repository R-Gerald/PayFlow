// src/lib/queryErrorNotifier.js
let _notify = null;

/**
 * Permet de fournir une fonction de notification globale (par ex. un toast).
 */
export function setQueryErrorNotifier(fn) {
  _notify = fn;
}

/**
 * À utiliser dans onError global de React Query.
 */
export function notifyQueryError(error, context) {
  if (_notify) {
    _notify(error, context);
  } else {
    // fallback : log console
    console.error("React Query error:", error);
  }
}