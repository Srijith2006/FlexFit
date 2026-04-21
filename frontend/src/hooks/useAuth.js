import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

/**
 * Convenience hook — access auth context anywhere.
 *
 * Returns: { user, token, login, logout, signup, loading, isAuthenticated, hasRole }
 */
const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return context;
};

export default useAuth;