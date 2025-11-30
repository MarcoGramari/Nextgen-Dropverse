// src/hooks/useFetch.js
import { useState, useEffect, useCallback } from "react";

export default function useFetch(url, options = {}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [flag, setFlag] = useState(0);

  const reload = useCallback(() => setFlag((f) => f + 1), []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError(null);

    fetch(url, { ...options, signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(setData)
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.message || e);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [url, flag]);

  return { data, loading, error, reload };
}
