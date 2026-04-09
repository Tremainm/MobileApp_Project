// Global authentication state.
// - Persists the JWT in expo-secure-store so the user stays logged in
//   across app restarts.
// - Mirrors the token into the authToken module so all API calls
//   can include the Authorization header without going through React state.
//
// Exports:
//   AuthProvider - wrap the app root with this
//   useAuth() - { token, loading, login, logout }

import { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import authToken from '../api/authToken';

const TOKEN_KEY = 'auth_token';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setTokenState] = useState(null);
  // loading is true while we check SecureStore on first mount
  const [loading, setLoading] = useState(true);

  // On mount: restore any previously saved token
  useEffect(() => {
    async function restoreToken() {
      try {
        const saved = await SecureStore.getItemAsync(TOKEN_KEY);
        if (saved) {
          authToken.setToken(saved);   // make it available to API modules immediately
          setTokenState(saved);
        }
      } catch (err) {
        console.warn('[AuthContext] Failed to restore token:', err.message);
      } finally {
        setLoading(false);
      }
    }
    restoreToken();
  }, []);

  // Called by LoginScreen / RegisterScreen after a successful auth response
  async function login(jwt) {
    await SecureStore.setItemAsync(TOKEN_KEY, jwt);  // persist to device secure storage
    authToken.setToken(jwt);                          // update module-level store
    setTokenState(jwt);                               // update React state -> re-render
  }

  // Called by the Logout button in HomeScreen
  async function logout() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
    authToken.clear();
    setTokenState(null);
  }

  return (
    <AuthContext.Provider value={{ token, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}