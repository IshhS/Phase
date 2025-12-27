import './style.css'
import { initHome } from './home.js'
import { initHome2 } from './home2.js'
import { initLoad } from './load.js'

const app = document.querySelector('#app');
const token = localStorage.getItem('token');

// Initialize based on auth state
const initApp = async () => {
  if (token) {
    try {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const user = await response.json();
        // Check for active project
        const projRes = await fetch('/api/project/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const activeProj = projRes.ok ? await projRes.json() : null;

        if (activeProj && activeProj._id) {
          initHome2(app, user);
        } else {
          initLoad(app, user);
        }
      } else {
        localStorage.removeItem('token');
        initHome(app);
      }
    } catch (err) {
      console.error('Session check failed:', err);
      initHome(app);
    }
  } else {
    initHome(app);
  }
};

initApp();

// Global handler for login success
document.addEventListener('userLoggedIn', async (e) => {
  const user = e.detail?.user;
  const token = localStorage.getItem('token');

  if (user && token) {
    // After login, we always go to Mission Selection
    initLoad(app, user);
  } else {
    window.location.reload(); // Fallback
  }
});

// Verify environment variables
console.log("Phase: Groq Key Detected:", import.meta.env.VITE_GROQ_API_KEY ? "YES" : "NO");
console.log("Phase Architect Ready.");
