import { useState, useCallback } from "react";

/**
 * Generic hook that wraps any async API function with loading / error state.
 *
 * Usage:
 *   const { execute, data, loading, error } = useApi(myService.fetchItems);
 *   await execute(arg1, arg2);
 */
const useApi = (apiFunc) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFunc(...args);
        setData(result);
        return result;
      } catch (err) {
        const message =
          err?.response?.data?.message || err.message || "An error occurred";
        setError(message);
        throw err; // re-throw so callers can catch if needed
      } finally {
        setLoading(false);
      }
    },
    [apiFunc]
  );

  const reset = useCallback(() => {
    setData(null);
    setError(null);
    setLoading(false);
  }, []);

  return { execute, data, loading, error, reset };
};

export default useApi;