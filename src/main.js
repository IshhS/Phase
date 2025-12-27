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
      // Validate token and get user data
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const user = await response.json();
        console.log('Session restored for:', user.username);
        // Check for active project to decide where to go
        try {
          const projRes = await fetch('/api/project/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const activeProj = projRes.ok ? await projRes.json() : null;

          if (activeProj) {
            // Active project exists (e.g. refresh on home2), go to dashboard
            await initHome2(app, user);
          } else {
            // No active project (e.g. first load or manual new), go to selection
            await initLoad(app, user);
          }
        } catch (e) {
          console.error("Project check failed", e);
          await initLoad(app, user);
        }
      } else {
        // Token invalid or expired
        console.warn('Session expired or invalid');
        localStorage.removeItem('token');
        initHome(app);
      }
    } catch (err) {
      console.error('Session check failed:', err);
      // On network error or other issues, fall back to home but maybe keep token? 
      // Safer to just show home for now if we can't verify.
      initHome(app);
    }
  } else {
    // No token, show landing page
    initHome(app);
  }
};

initApp();

// Listen for a custom event from home.js login
document.addEventListener('userLoggedIn', async (e) => {
  // If we pass user data in the event, use it, otherwise fetch
  const user = e.detail?.user;
  if (user) {
    initLoad(app, user);
  } else {
    // Fallback fetch if event didn't carry user data
    const token = localStorage.getItem('token');
    if (token) {
      const response = await fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const user = await response.json();
        initLoad(app, user);
      }
    }
  }
});

// Verify environment variables
console.log("Phase: Groq Key Detected:", import.meta.env.VITE_GROQ_API_KEY ? "YES" : "NO");
console.log("Phase Architect Ready.");
