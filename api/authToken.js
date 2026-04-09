// Module-level token store.
// Holds the JWT in memory so every API module can read it without
// going through React state or context.
//
// Usage:
//   import authToken from './authToken';
//   authToken.setToken(jwt);          // called by AuthContext after login
//   authToken.getAuthHeaders();       // called by pantryApi / basketApi

let _token = null;

const authToken = {
  setToken(token) {
    _token = token;
  },
  getToken() {
    return _token;
  },
  // Returns the headers object every protected API call needs
  getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'ngrok-skip-browser-warning': 'true',
      ..._token ? { Authorization: `Bearer ${_token}` } : {},
    };
  },
  clear() {
    _token = null;
  },
};

export default authToken;