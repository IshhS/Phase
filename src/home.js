import { initHome2 } from './home2.js';
import { initLoad } from './load.js';

export function initHome(app) {
  app.innerHTML = `
    <div class="container">
      <nav class="navbar">
        <div id="nav-logo" class="nav-logo" style="display: none;">PHASE</div>
        <div class="nav-links">
          <a href="#" id="home-link">HOME</a>
          <a href="#about-us" id="about-link">ABOUT US</a>
          <a href="#" id="login-link">LOGIN</a>
          <a href="#" id="signup-link" class="sign-in">SIGN IN</a>
          
          <!-- Profile Icon (Hidden by default) -->
          <div id="user-profile" class="profile-container" style="display: none;">
            <div id="profile-icon" class="profile-icon"></div>
            <div id="profile-dropdown" class="profile-dropdown glass">
              <p id="profile-name" class="profile-info-name"></p>
              <p id="profile-email" class="profile-info-email"></p>
              <p id="profile-team" class="profile-info-team"></p>
              <hr class="profile-divider">
              <button id="switch-mission-btn" class="logout-btn" style="background: rgba(52, 152, 219, 0.2); color: #3498db; margin-bottom: 0.5rem; border: 1px solid rgba(52, 152, 219, 0.3);">SWITCH MISSION</button>
              <button id="logout-btn" class="logout-btn">LOGOUT</button>
            </div>
          </div>
        </div>
      </nav>

      <!-- Auth Modals -->
      <div id="auth-overlay" class="auth-overlay">
        <!-- Login Form -->
        <div id="login-modal" class="auth-modal">
          <div class="modal-content glass">
            <h2>LOGIN</h2>
            <form id="login-form">
              <div class="input-group">
                <input type="email" id="login-email" placeholder="Email" required>
              </div>
              <div class="input-group">
                <input type="password" id="login-password" placeholder="Password" required>
              </div>
              <button type="submit" class="auth-btn">LOGIN</button>
            </form>
            <p class="toggle-auth">Don't have an account? <span id="to-signup">Sign In</span></p>
            <button class="close-modal">&times;</button>
          </div>
        </div>

        <!-- Sign In (Register) Form -->
        <div id="signup-modal" class="auth-modal">
          <div class="modal-content glass">
            <h2>SIGN IN</h2>
            <form id="signup-form">
              <div class="input-group">
                <input type="text" id="signup-name" placeholder="Name" required>
              </div>
              <div class="input-group">
                <input type="email" id="signup-email" placeholder="Email" required>
              </div>
              <div class="input-group">
                <input type="text" id="signup-team" placeholder="Team Name" required>
              </div>
              <div class="input-group">
                <input type="password" id="signup-password" placeholder="Password" required>
              </div>
              <button type="submit" class="auth-btn">SIGN IN</button>
            </form>
            <p class="toggle-auth">Already have an account? <span id="to-login">Login</span></p>
            <button class="close-modal">&times;</button>
          </div>
        </div>
      </div>
      
      <main class="hero">
        <div class="glass-panel">
          <div class="content">
            <p class="subtitle">GUIDED TUNNEL SYSTEM</p>
            <div class="mountain-icon">
               <!-- Simple SVG shape for abstract structure -->
               <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="12" y1="8" x2="12" y2="16"></line><line x1="8" y1="12" x2="16" y2="12"></line></svg>
            </div>
            
            <p class="tour-label">PROJECT ARCHITECTURE</p>
            <h1 class="title">
              <span class="outline-text">PHA</span>SE
            </h1>
            
            <p class="description">
              From confusion to clarity. Navigate your project roadmap with our AI-driven phase execution system.
            </p>
            
            <button id="get-started-btn" class="get-started-btn">GET STARTED</button>
            <a href="#steps" class="learn-more">LEARN ABOUT THE PROCESS</a>
          </div>
        </div>

        <div class="scroll-arrow">
          <svg viewBox="0 0 24 24" width="30" height="30" stroke="currentColor" stroke-width="1.5" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7 13l5 5 5-5M7 6l5 5 5-5"></path>
          </svg>
        </div>

        <div class="right-panel">
          
          <!-- Card 1: AI Engine Status -->
          <div class="glass-card">
            <div class="card-header">
              <span class="card-icon">◈</span> 
              <span>SYSTEM ENGINE</span>
            </div>
            <div class="stat-row">
               <div class="stat">
                 <span class="stat-val" style="font-size: 1.5rem;">ONLINE</span>
                 <span class="stat-label">AI Status</span>
               </div>
               <div class="stat">
                 <span class="stat-val">v2.4</span>
                 <span class="stat-label">Version</span>
               </div>
            </div>
          </div>

          <!-- Card 2: Knowledge Base -->
          <div class="glass-card center-content">
            <div class="card-label">KNOWLEDGE BASE</div>
            <div class="circular-progress">
              <div class="inner-circle">
                <span>100%</span>
              </div>
            </div>
          </div>

          <!-- Card 3: Global Success -->
          <div class="glass-card">
            <div class="card-label">TOTAL PROJECTS GUIDED</div>
            <div class="big-stat">1,248</div>
            <div class="progress-bar-container">
               <div class="progress-bar-fill" style="width: 80%"></div>
            </div>
          </div>

        </div>
      </main>

      <!-- Steps Section -->
      <section class="content-section" id="steps">
        <h2 class="section-title">THE 7-STEP TUNNEL</h2>
        <div class="steps-grid">
           <div class="step-card">
              <div class="step-number">01</div>
              <div class="step-title">Initialization</div>
              <div class="step-desc">User entry and project setup phase.</div>
           </div>
           <div class="step-card">
              <div class="step-number">02</div>
              <div class="step-title">Identify</div>
              <div class="step-desc">AI-based problem definition and scoping.</div>
           </div>
           <div class="step-card">
              <div class="step-number">03</div>
              <div class="step-title">Validation</div>
              <div class="step-desc">Similarity check and scope lock-in.</div>
           </div>
           <div class="step-card">
              <div class="step-number">04</div>
              <div class="step-title">Roadmap</div>
              <div class="step-desc">Guided project module activation.</div>
           </div>
           <div class="step-card">
              <div class="step-number">05</div>
              <div class="step-title">Execution</div>
              <div class="step-desc">Learn, Apply, Submit loop.</div>
           </div>
           <div class="step-card">
              <div class="step-number">06</div>
              <div class="step-title">Sync</div>
              <div class="step-desc">Continuous documentation updates.</div>
           </div>
           <div class="step-card">
              <div class="step-number">07</div>
              <div class="step-title">Final Report</div>
              <div class="step-desc">Final review and success confidence.</div>
           </div>
        </div>
      </section>

      <!-- About Us Section -->
      <section class="content-section" id="about-us">
        <h2 class="section-title">ABOUT US</h2>
        <p>
          We are dedicated to solving the analysis paralysis faced by new developers. 
          The Guided Tunnel System provides a linear, blockage-free path from idea to implementation, 
          ensuring you never get lost in the complexity of modern software engineering.
        </p>
      </section>

    </div>
  `;

  // --- Auth & Profile Logic ---
  const loginLink = document.getElementById('login-link');
  const signupLink = document.getElementById('signup-link');
  const homeLink = document.getElementById('home-link');
  const aboutLink = document.getElementById('about-link');
  const navLogo = document.getElementById('nav-logo');
  const userProfile = document.getElementById('user-profile');
  const profileIcon = document.getElementById('profile-icon');
  const profileDropdown = document.getElementById('profile-dropdown');
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profileTeam = document.getElementById('profile-team');
  const navLinks = document.querySelector('.nav-links');
  const navbar = document.querySelector('.navbar');

  // Helper functions for profile display
  const updateProfileDisplay = (user = null) => {
    let userName, userEmail, userTeam;

    if (user) {
      // Use provided user object
      userName = user.username;
      userEmail = user.email;
      userTeam = user.teamName;
    } else {
      // Fallback to localStorage
      userName = localStorage.getItem('userName');
      userEmail = localStorage.getItem('userEmail');
      userTeam = localStorage.getItem('userTeam');
    }

    if (userName && userEmail && userTeam) {
      profileName.innerText = userName;
      profileEmail.innerText = userEmail;
      profileTeam.innerText = `Team: ${userTeam}`;

      const initials = userName.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
      profileIcon.innerText = initials;

      // Show profile, hide login/signup
      loginLink.style.display = 'none';
      signupLink.style.display = 'none';
      userProfile.style.display = 'flex';
      navLogo.style.display = 'block';
      navLinks.classList.add('is-logged-in');
      navbar.classList.add('logged-in');
    }
  };

  const closeAuthModals = () => {
    overlay.classList.remove('active');
    loginModal.classList.remove('active');
    signupModal.classList.remove('active');
  };

  async function updateAuthState() {
    const token = localStorage.getItem('token');
    const loginLink = document.getElementById('login-link');
    const signupLink = document.getElementById('signup-link');
    const homeLink = document.getElementById('home-link');
    const aboutLink = document.getElementById('about-link');
    const navLogo = document.getElementById('nav-logo');
    const userProfile = document.getElementById('user-profile');
    const navLinks = document.querySelector('.nav-links');
    const navbar = document.querySelector('.navbar');

    if (token) {
      try {
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (response.ok) {
          const user = await response.json();
          loginLink.style.display = 'none';
          signupLink.style.display = 'none';
          homeLink.style.display = 'none';
          aboutLink.style.display = 'none';
          navLogo.style.display = 'block';
          userProfile.style.display = 'flex';
          navLinks.classList.add('is-logged-in');
          navbar.classList.add('logged-in');
          updateProfileDisplay(user);
          return;
        }
      } catch (err) {
        console.error("Session verification failed", err);
      }
    }

    // Default logged out state
    loginLink.style.display = 'inline-block';
    signupLink.style.display = 'inline-block';
    homeLink.style.display = 'inline-block';
    aboutLink.style.display = 'inline-block';
    navLogo.style.display = 'none';
    userProfile.style.display = 'none';
    navLinks.classList.remove('is-logged-in');
    navbar.classList.remove('logged-in');
  }

  // Profile Dropdown Toggle
  profileIcon.addEventListener('click', (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('active');
  });

  document.addEventListener('click', () => {
    profileDropdown.classList.remove('active');
  });

  // Logout
  document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('phase_creation_mode');
    updateAuthState();
    window.location.reload(); // Refresh to clean state
  });

  document.getElementById('switch-mission-btn').addEventListener('click', () => {
    localStorage.removeItem('phase_creation_mode');
    initLoad(app, JSON.parse(localStorage.getItem('user') || '{}'));
  });

  // Modal Elements
  const overlay = document.getElementById('auth-overlay');
  const loginModal = document.getElementById('login-modal');
  const signupModal = document.getElementById('signup-modal');

  // Toggle Modals
  const openLogin = () => {
    overlay.classList.add('active');
    loginModal.classList.add('active');
    signupModal.classList.remove('active');
  };

  const openSignup = () => {
    overlay.classList.add('active');
    signupModal.classList.add('active');
    loginModal.classList.remove('active');
  };

  const closeAll = () => {
    overlay.classList.remove('active');
    loginModal.classList.remove('active');
    signupModal.classList.remove('active');
  };

  // Event Listeners
  document.getElementById('login-link').addEventListener('click', (e) => { e.preventDefault(); openLogin(); });
  document.getElementById('signup-link').addEventListener('click', (e) => { e.preventDefault(); openSignup(); });
  document.getElementById('to-signup').addEventListener('click', openSignup);
  document.getElementById('to-login').addEventListener('click', openLogin);

  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', closeAll);
  });

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeAll();
  });

  // Example Form Handling (Client-side)
  document.getElementById('signup-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const teamName = document.getElementById('signup-team').value;
    const password = document.getElementById('signup-password').value;

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, teamName, password })
      });

      const data = await response.json();
      if (response.ok) {
        alert('Registration successful! Please login.');
        openLogin();
      } else {
        alert('Error: ' + data.message);
      }
    } catch (err) {
      console.error('Registration failed:', err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        alert('Network error or server is unreachable. Please check your internet connection or try again later.');
      } else {
        alert('An unexpected error occurred during registration.');
      }
    }
  });

  document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('userName', data.user.username);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userTeam', data.user.teamName);
        updateProfileDisplay();
        closeAuthModals();
        // Redirect to load selection after successful login
        await initLoad(app, data.user);
      } else {
        alert('Login failed: ' + data.message);
      }
    } catch (err) {
      console.error('Login failed:', err);
      if (err instanceof TypeError && err.message === 'Failed to fetch') {
        alert('Network error or server is unreachable. Please check your internet connection or try again later.');
      } else {
        alert(`An unexpected error occurred during login: ${err.message}`);
      }
    }
  });

  // Check auth on load
  updateAuthState();

  // Add event listener to the button
  document.getElementById('get-started-btn').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await fetch('/api/auth/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const user = await response.json();
          // After login or verification on landing page, always go to Mission Selection
          initLoad(app, user);
        } else {
          openLogin();
        }
      } catch (err) {
        console.error("Session verification failed", err);
        openLogin();
      }
    } else {
      openLogin();
    }
  });
}
