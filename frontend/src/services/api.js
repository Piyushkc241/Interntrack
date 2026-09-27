import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5000",
  // The auth token now lives in an httpOnly cookie set by the backend, so
  // every request needs to carry cookies instead of an Authorization header.
  withCredentials: true,
});

// Reads a plain (non-httpOnly) cookie by name — used for the csrfToken
// cookie, which is deliberately readable by JS so we can echo it back in a
// header (see Backend/src/middleware/csrf.js for why that defeats CSRF).
function getCookie(name) {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

// Attach the CSRF token to every outgoing request. The backend only
// actually checks it on state-changing methods (POST/PUT/DELETE), so this
// is harmless to send on GET requests too.
api.interceptors.request.use((config) => {
  const csrfToken = getCookie("csrfToken");
  if (csrfToken) {
    config.headers["X-CSRF-Token"] = csrfToken;
  }
  return config;
});

// If the session cookie is missing/expired, boot back to login.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && window.location.pathname !== "/login") {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
