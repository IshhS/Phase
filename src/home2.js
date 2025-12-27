import { initInitial } from './initial.js';
import { initChatbot } from './chatbot.js';
import { initValidation } from './validation.js';
import { initRoadmap } from './roadmap.js';
import { initWeek } from './week.js';
import { initSync } from './sync.js';
import { initFinal } from './final.js';

export async function initHome2(app, user) {
  const token = localStorage.getItem('token');
  let step01Completed = false;
  let step02Completed = false;
  let step03Completed = false;
  let step04Completed = false;
  let step05Completed = false;
  let step06Completed = false;
  let step07Completed = false;

  try {
    const [projRes, ideaRes] = await Promise.all([
      fetch('/api/project/me', { headers: { 'Authorization': `Bearer ${token}` } }),
      fetch('/api/idea/me', { headers: { 'Authorization': `Bearer ${token}` } })
    ]);

    if (projRes.ok) {
      const proj = await projRes.json();
      if (proj && proj._id) step01Completed = true;
    }
    if (ideaRes.ok) {
      const idea = await ideaRes.json();
      if (idea) {
        step02Completed = idea.isCompleted;
        step03Completed = idea.step03Completed;
        step04Completed = idea.step04Completed;
        step05Completed = idea.step05Completed;
        step06Completed = idea.step06Completed;
        step07Completed = idea.step07Completed;
      }
    }
  } catch (err) {
    console.error("Failed to check roadmap status", err);
  }

  app.innerHTML = `
    <div class="container" style="background: none; min-height: 100vh;">
      <nav class="navbar logged-in">
        <div id="nav-logo" class="nav-logo">PHASE</div>
        <div class="nav-links">
          <div id="user-profile" class="profile-container">
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

      <!-- Steps Section -->
      <section class="content-section" id="steps" style="padding: 60px 0 100px 0; background: transparent;">
        <div class="steps-wrapper glass" style="background: rgba(0, 0, 0, 0.85); margin: 0 4rem 4rem 4rem; padding: 4rem; border-radius: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05); position: relative;">
          <h2 class="section-title" style="margin-top: 0; text-align: center; margin-bottom: 4rem;">THE 7-STEP TUNNEL</h2>
          
          <div class="steps-grid">
             <div class="step-card ${step01Completed ? 'completed' : ''}" id="step-01" style="cursor: pointer;">
                <div class="step-number">01</div>
                <div class="step-title">Initialization</div>
                <div class="step-desc">Configure project mode, branch, and team settings.</div>
             </div>

             <div class="step-card ${step02Completed ? 'completed' : ''}" id="step-02" style="cursor: pointer;">
                <div class="step-number">02</div>
                <div class="step-title">Identify</div>
                <div class="step-desc">Problem definition and scoping phase.</div>
             </div>

             <div class="step-card ${step03Completed ? 'completed' : ''}" id="step-03" style="cursor: pointer;">
                <div class="step-number">03</div>
                <div class="step-title">Validation</div>
                <div class="step-desc">Similarity check and scope lock-in procedure.</div>
             </div>

             <div class="step-card ${step04Completed ? 'completed' : ''}" id="step-04" style="cursor: pointer;">
                <div class="step-number">04</div>
                <div class="step-title">Roadmap</div>
                <div class="step-desc">Guided project module activation phase.</div>
             </div>

             <!-- Row 2 -->
             <div class="step-card ${step05Completed ? 'completed' : ''}" id="step-05" style="grid-column: 1 / 2; cursor: pointer;">
                <div class="step-number">05</div>
                <div class="step-title">Execution</div>
                <div class="step-desc">Learn, Apply, Submit loop implementation.</div>
             </div>

             <div class="step-card ${step06Completed ? 'completed' : ''}" id="step-06" style="grid-column: 2 / 3; cursor: pointer;">
                <div class="step-number">06</div>
                <div class="step-title">Documentation</div>
                <div class="step-desc">Generate comprehensive project documentation.</div>
             </div>

             <div class="step-card ${step07Completed ? 'completed' : ''}" id="step-07" style="grid-column: 3 / 4; cursor: pointer;">
                <div class="step-number">07</div>
                <div class="step-title">Final Report</div>
                <div class="step-desc">Complete 10-page academic document.</div>
             </div>
          </div>
        </div>
      </section>

    </div>
  `;

  // Profile Logic
  const profileIcon = document.getElementById('profile-icon');
  const profileDropdown = document.getElementById('profile-dropdown');
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profileTeam = document.getElementById('profile-team');

  if (!user) {
    console.error("User object missing in initHome2");
    return;
  }
  const initials = (user.username || 'User').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
  profileIcon.innerText = initials;
  profileName.innerText = user.username;
  profileEmail.innerText = user.email;
  profileTeam.innerText = `Team: ${user.teamName || 'N/A'}`;

  profileIcon.onclick = (e) => {
    e.stopPropagation();
    profileDropdown.classList.toggle('active');
  };

  document.onclick = () => profileDropdown.classList.remove('active');

  // Step Navigation
  document.getElementById('step-01').onclick = () => initInitial(app, user);
  document.getElementById('step-02').onclick = () => initChatbot(app, user);
  document.getElementById('step-03').onclick = () => initValidation(app, user);
  document.getElementById('step-04').onclick = () => initRoadmap(app, user);
  document.getElementById('step-05').onclick = () => initWeek(app, user);
  document.getElementById('step-06').onclick = () => initSync(app, user);

  document.getElementById('step-07').onclick = () => {
    if (step01Completed && step02Completed && step03Completed && step04Completed && step05Completed && step06Completed) {
      initFinal(app, user, () => initHome2(app, user));
    } else {
      alert('All 6 stages must be completed to access Final Report.');
    }
  };
  document.getElementById('logout-btn').onclick = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('phase_creation_mode');
    window.location.reload();
  };

  document.getElementById('switch-mission-btn').onclick = () => {
    localStorage.removeItem('phase_creation_mode');
    import('./load.js').then(m => m.initLoad(app, user));
  };
}

