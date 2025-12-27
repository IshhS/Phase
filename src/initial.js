export async function initInitial(app, user) {
  // Fetch existing project if any
  let existingProject = null;
  try {
    const response = await fetch('/api/project/me', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (response.ok) {
      existingProject = await response.json();
    }
  } catch (err) {
    console.error("Failed to fetch project details", err);
  }

  const renderForm = (data = null) => {
    const isSubmitted = !!data;

    app.innerHTML = `
      <div class="container">
        <nav class="navbar logged-in">
          <div id="nav-logo" class="nav-logo">PHASE</div>
          <div class="nav-links">
            <div id="user-profile" class="profile-container">
              <div id="profile-icon" class="profile-icon"></div>
              <div id="profile-dropdown" class="profile-dropdown glass">
                <p id="profile-name" class="profile-info-name"></p>
                <button id="logout-btn" class="logout-btn">LOGOUT</button>
              </div>
            </div>
          </div>
        </nav>

        <section class="content-section" style="padding: 60px 0 10px 0; display: flex; justify-content: center; align-items: flex-start; min-height: calc(100vh - 60px);">
          <div id="main-panel" class="initial-panel glass ${isSubmitted ? 'submitted' : ''}" style="padding: 1.5rem 3rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); background: rgba(0, 0, 0, 0.9); box-sizing: border-box;">
            
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.2rem;">
              <div>
                <h1 style="font-family: 'Playfair Display', serif; color: ${isSubmitted ? '#2ecc71' : 'var(--accent)'}; margin: 0; letter-spacing: 2px; font-size: 1.5rem;">01. INITIALIZATION</h1>
                <p style="color: var(--text-secondary); margin: 0.2rem 0 0 0; font-size: 0.75rem; letter-spacing: 1px;">Step into the guided development tunnel.</p>
              </div>
              ${isSubmitted ? `<div id="edit-mode" class="edit-tag" style="margin-bottom: 0; padding: 0.3rem 0.8rem; font-size: 0.7rem;"><span>✓</span> SUBMITTED (EDIT)</div>` : ''}
            </div>

            <form id="init-form" class="professional-grid" style="grid-template-columns: repeat(3, 1fr); gap: 1rem;" ${isSubmitted ? 'disabled' : ''}>
              <div class="glass-input-group">
                <label style="font-size: 0.75rem;">Development Mode</label>
                <select id="proj-mode" class="glass-input" required style="width: 100%; padding: 0.8rem; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 0.85rem;">
                  <option value="Solo" ${data?.mode === 'Solo' ? 'selected' : ''}>Individual Project (Solo)</option>
                  <option value="Team" ${data?.mode === 'Team' ? 'selected' : ''}>Collaborative Effort (Team)</option>
                </select>
              </div>

              <div id="leader-group" class="glass-input-group" style="display: ${data?.mode === 'Team' ? 'flex' : 'none'};">
                <label style="font-size: 0.75rem;">Leadership Role</label>
                <select id="is-leader" class="glass-input" style="width: 100%; padding: 0.8rem; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 0.85rem;">
                  <option value="false" ${data?.isLeader === false ? 'selected' : ''}>Team Contributor</option>
                  <option value="true" ${data?.isLeader === true ? 'selected' : ''}>Team Leader (Admin)</option>
                </select>
              </div>

              <div id="team-details" class="full-width" style="display: ${data?.mode === 'Team' ? 'grid' : 'none'}; grid-column: span 3; grid-template-columns: 1fr 1fr; gap: 1.5rem; background: rgba(255,255,255,0.02); padding: 1rem; border-radius: 12px; border: 1px dashed rgba(255,255,255,0.1);">
                  <div class="glass-input-group">
                    <label style="font-size: 0.75rem;">Team Identity</label>
                    <input type="text" id="team-name-init" placeholder="e.g. CyberKnights" value="${data?.teamName || ''}" class="glass-input" style="width: 100%; padding: 0.8rem; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 0.85rem;">
                  </div>
                  <div class="glass-input-group">
                    <label style="font-size: 0.75rem;">Squad Size</label>
                    <input type="number" id="team-size-init" placeholder="Number of members" value="${data?.teamSize || ''}" class="glass-input" style="width: 100%; padding: 0.8rem; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 0.85rem;">
                  </div>
                  
                  <div id="leader-actions" class="full-width" style="display: ${data?.isLeader ? 'block' : 'none'}; grid-column: span 2;">
                    <label style="color: var(--accent); display: block; margin-bottom: 0.5rem; font-size: 0.7rem; letter-spacing: 1px; font-weight: 700;">INVITE TEAM MEMBERS</label>
                    <div id="emails-container" style="display: grid; grid-template-columns: 1fr 1fr; gap: 0.8rem;">
                      ${(data?.teamEmails?.length ? data.teamEmails : ['']).map((email, i) => `
                        <div class="email-row" style="display: flex; gap: 0.5rem;">
                          <input type="email" placeholder="student@university.edu" value="${email}" class="member-email" style="flex: 1; padding: 0.7rem; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 0.75rem;">
                          ${i === 0 ? '<button type="button" id="add-email-btn" style="background: var(--accent); border: none; width: 35px; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: bold;">+</button>' : '<button type="button" class="remove-email-btn" style="background: rgba(255,50,50,0.2); color: #ff5555; border: none; width: 35px; border-radius: 8px; cursor: pointer;">×</button>'}
                        </div>
                      `).join('')}
                    </div>
                  </div>
              </div>

              <div class="glass-input-group">
                <label style="font-size: 0.75rem;">Academic Branch</label>
                <select id="proj-branch" class="glass-input" required style="width: 100%; padding: 0.8rem; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 0.85rem;">
                  <option value="CS" ${data?.branch === 'CS' ? 'selected' : ''}>Computer Science</option>
                  <option value="IT" ${data?.branch === 'IT' ? 'selected' : ''}>Information Technology</option>
                  <option value="AIML" ${data?.branch === 'AIML' ? 'selected' : ''}>AI & Machine Learning</option>
                  <option value="Data Science" ${data?.branch === 'Data Science' ? 'selected' : ''}>Data Science</option>
                </select>
              </div>

              <div class="glass-input-group">
                <label style="font-size: 0.75rem;">Academic Year</label>
                <select id="proj-year" class="glass-input" required style="width: 100%; padding: 0.8rem; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 0.85rem;">
                  <option value="F.E" ${data?.year === 'F.E' ? 'selected' : ''}>First Year (F.E)</option>
                  <option value="S.E" ${data?.year === 'S.E' ? 'selected' : ''}>Second Year (S.E)</option>
                  <option value="T.E" ${data?.year === 'T.E' ? 'selected' : ''}>Third Year (T.E)</option>
                  <option value="B.E" ${data?.year === 'B.E' ? 'selected' : ''}>Final Year (B.E)</option>
                </select>
              </div>

              <div class="glass-input-group">
                <label style="font-size: 0.75rem;">Project Classification</label>
                <select id="proj-type" class="glass-input" required style="width: 100%; padding: 0.8rem; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; font-size: 0.85rem;">
                  <option value="Mini" ${data?.projectType === 'Mini' ? 'selected' : ''}>Minor Project</option>
                  <option value="Major" ${data?.projectType === 'Major' ? 'selected' : ''}>Major Project</option>
                </select>
              </div>

              <button type="submit" id="submit-btn" class="auth-btn" style="grid-column: span 2; margin-top: 0.2rem; padding: 1rem; font-size: 0.85rem;">
                ${isSubmitted ? 'UPDATE DETAILS' : 'SAVE & INITIALIZE'}
              </button>
              
              <button type="button" id="back-to-roadmap" style="background: none; border: 1px solid rgba(255,255,255,0.1); color: var(--text-secondary); padding: 0.8rem; border-radius: 8px; cursor: pointer; transition: all 0.3s; font-size: 0.75rem; margin-top: 0.2rem;">
                RETURN TO DASHBOARD
              </button>
            </form>
          </div>
        </section>
      </div>
    `;

    setupEvents(data);
  };

  const setupEvents = (data) => {
    const mainPanel = document.getElementById('main-panel');
    const modeSelect = document.getElementById('proj-mode');
    const leaderGroup = document.getElementById('leader-group');
    const teamDetails = document.getElementById('team-details');
    const isLeaderSelect = document.getElementById('is-leader');
    const leaderActions = document.getElementById('leader-actions');
    const emailsContainer = document.getElementById('emails-container');
    const addEmailBtn = document.getElementById('add-email-btn');
    const editTag = document.getElementById('edit-mode');
    const form = document.getElementById('init-form');

    // Handle Edit Mode Toggle
    if (editTag) {
      editTag.onclick = () => {
        mainPanel.classList.remove('submitted');
        editTag.style.display = 'none';
        document.querySelector('h1').style.color = 'var(--accent)';
      };
    }

    modeSelect.onchange = () => {
      const isTeam = modeSelect.value === 'Team';
      leaderGroup.style.display = isTeam ? 'flex' : 'none';
      teamDetails.style.display = isTeam ? 'grid' : 'none';
    };

    isLeaderSelect.onchange = () => {
      leaderActions.style.display = isLeaderSelect.value === 'true' ? 'block' : 'none';
    };

    if (addEmailBtn) {
      addEmailBtn.onclick = () => {
        const div = document.createElement('div');
        div.className = 'email-row';
        div.style.cssText = 'display: flex; gap: 1rem; margin-top: 1.2rem;';
        div.innerHTML = `
          <input type="email" placeholder="student@university.edu" class="member-email" style="flex: 1; padding: 1.2rem; background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px;">
          <button type="button" class="remove-email-btn" style="background: rgba(255,50,50,0.2); color: #ff5555; border: none; width: 55px; border-radius: 12px; cursor: pointer;">×</button>
        `;
        emailsContainer.appendChild(div);
        div.querySelector('.remove-email-btn').onclick = () => div.remove();
      };
    }

    document.querySelectorAll('.remove-email-btn').forEach(btn => {
      btn.onclick = (e) => e.target.closest('.email-row').remove();
    });

    form.onsubmit = async (e) => {
      e.preventDefault();

      const emails = Array.from(document.querySelectorAll('.member-email')).map(input => input.value).filter(v => v);

      const payload = {
        mode: modeSelect.value,
        isLeader: isLeaderSelect.value === 'true',
        teamName: document.getElementById('team-name-init').value,
        teamSize: document.getElementById('team-size-init').value,
        teamEmails: emails,
        branch: document.getElementById('proj-branch').value,
        year: document.getElementById('proj-year').value,
        projectType: document.getElementById('proj-type').value
      };

      try {
        const response = await fetch('/api/project/initialize', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify(payload)
        });

        if (response.ok) {
          const result = await response.json();
          renderForm(result.project); // Re-render with green state
          alert('Configuration Secured.');
        } else {
          const err = await response.json();
          alert('Error: ' + err.error);
        }
      } catch (err) {
        alert('Transmission Error.');
      }
    };

    // Generic UI
    const profileIcon = document.getElementById('profile-icon');
    const profileDropdown = document.getElementById('profile-dropdown');
    const profileName = document.getElementById('profile-name');
    const initials = user.username.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
    profileIcon.innerText = initials;
    profileName.innerText = user.username;

    profileIcon.onclick = (e) => {
      e.stopPropagation();
      profileDropdown.classList.toggle('active');
    };

    document.onclick = () => profileDropdown.classList.remove('active');

    document.getElementById('logout-btn').onclick = () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.reload();
    };

    document.getElementById('back-to-roadmap').onclick = () => window.location.reload();
  };

  renderForm(existingProject);
}
