
export async function initTester(app, user, backFunction = () => window.history.back()) {
  const token = localStorage.getItem('token');

  let ideaData = null;
  try {
    const res = await fetch('/api/idea/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      ideaData = await res.json();
    } else {
      alert('Failed to load project data.');
      return;
    }
  } catch (err) {
    console.error('Error fetching idea data:', err);
    alert('Error loading data.');
    return;
  }

  renderUI(app, user, ideaData, backFunction);
}

function renderUI(app, user, ideaData, backFunction) {
  const testerData = ideaData.testerData || { testCases: [], overallStatus: 'pending', testSummary: '' };

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

      <section class="content-section" style="padding: 60px 0 100px 0; background: transparent; color: white;">
        <div class="glass" style="margin: 0 4rem 4rem 4rem; padding: 4rem; border-radius: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.3);">
          <button id="back-btn" class="back-btn" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 20px; cursor: pointer; margin-bottom: 2rem;">← Back</button>
          
          <div style="text-align: center; margin-bottom: 3rem; background: linear-gradient(to right, rgba(52, 152, 219, 0.1), rgba(46, 204, 113, 0.1)); padding: 2.5rem; border-radius: 30px; border: 1px solid rgba(255,255,255,0.05);">
            <h4 style="color: var(--accent); letter-spacing: 4px; text-transform: uppercase; font-size: 0.8rem; margin-bottom: 1rem;">Quality Assurance Phase</h4>
            <h2 class="section-title" style="margin-bottom: 0.5rem; font-size: 3.5rem;">${(() => {
      const ideaText = ideaData.idea || "";
      if (ideaText.includes('PROPOSED PROJECT TITLE:')) return ideaText.split('PROPOSED PROJECT TITLE:')[1].split('\n')[0].trim();
      if (ideaText.includes('Project:')) return ideaText.split('Project:')[1].trim();
      return 'PROJECT TESTER';
    })()}</h2>
            <p style="color: rgba(255,255,255,0.6); max-width: 700px; margin: 0 auto; font-style: italic; font-size: 1.1rem;">"Quality is not an act, it is a habit." — Rigorous validation for ${user.teamName || 'your project'}.</p>
          </div>

          <!-- Stats Panel -->
          <div id="stats-panel" class="glass" style="display: flex; gap: 2rem; padding: 1.5rem 3rem; border-radius: 20px; background: rgba(255,255,255,0.05); margin-bottom: 2rem; justify-content: space-around; align-items: center;">
             <div style="text-align: center;">
                <div id="total-stats" style="font-size: 2rem; font-weight: bold; color: #fff;">0</div>
                <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5); text-transform: uppercase;">Total Tests</div>
             </div>
             <div style="text-align: center;">
                <div id="passed-stats" style="font-size: 2rem; font-weight: bold; color: #2ecc71;">0</div>
                <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5); text-transform: uppercase;">Passed</div>
             </div>
             <div style="text-align: center;">
                <div id="failed-stats" style="font-size: 2rem; font-weight: bold; color: #e74c3c;">0</div>
                <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5); text-transform: uppercase;">Failed</div>
             </div>
             <div style="text-align: center;">
                <div id="pending-stats" style="font-size: 2rem; font-weight: bold; color: #f1c40f;">0</div>
                <div style="font-size: 0.8rem; color: rgba(255,255,255,0.5); text-transform: uppercase;">Pending</div>
             </div>
          </div>

          <div class="tester-grid" style="display: grid; grid-template-columns: 1fr 1fr; gap: 2rem;">
            <!-- Left Side: Test Case Form -->
            <div class="glass" style="padding: 2rem; border-radius: 20px; background: rgba(255,255,255,0.05);">
              <h3 style="margin-top: 0; margin-bottom: 1.5rem; color: #3498db;">Add New Test Case</h3>
              <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">Test Case Name</label>
                <input type="text" id="test-name" placeholder="e.g., User Authentication" style="width: 100%; padding: 0.8rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white;">
              </div>
              <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">Description / Steps</label>
                <textarea id="test-desc" placeholder="Describe the steps to test this feature..." style="width: 100%; padding: 0.8rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; min-height: 100px;"></textarea>
              </div>
              <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">Expected Result</label>
                <input type="text" id="test-result" placeholder="What happens when the test passes?" style="width: 100%; padding: 0.8rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white;">
              </div>
              <div class="form-group" style="margin-bottom: 1.5rem;">
                <label style="display: block; margin-bottom: 0.5rem; color: rgba(255,255,255,0.8);">Status</label>
                <select id="test-status" style="width: 100%; padding: 0.8rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white;">
                  <option value="pending">Pending</option>
                  <option value="passed">Passed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>
              <button id="add-test-btn" class="cta-button" style="width: 100%; padding: 1rem; border-radius: 10px; font-weight: bold;">Add Test Case</button>
            </div>

            <!-- Right Side: Test Cases List -->
            <div class="glass" style="padding: 2rem; border-radius: 20px; background: rgba(255,255,255,0.05); max-height: 600px; overflow-y: auto;">
              <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h3 style="margin: 0; color: #2ecc71;">Active Test Suite</h3>
                <button id="ai-gen-btn" style="background: linear-gradient(135deg, #3498db, #2980b9); color: white; border: none; padding: 0.6rem 1.5rem; border-radius: 12px; cursor: pointer; font-size: 0.85rem; font-weight: bold; box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3); transition: all 0.3s ease;">✨ Generate via AI</button>
              </div>
              <div id="test-cases-list">
                <!-- Test cases will be injected here -->
              </div>
            </div>
          </div>

          <div class="glass" style="margin-top: 2rem; padding: 2.5rem; border-radius: 20px; background: rgba(255,255,255,0.05);">
            <h3 style="margin-top: 0; color: #f1c40f;">Final QA Summary</h3>
            <textarea id="test-summary" placeholder="Provide an overall summary of the testing phase and any critical bugs found..." style="width: 100%; padding: 1rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white; min-height: 120px; margin-bottom: 1.5rem;">${testerData.testSummary || ''}</textarea>
            
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>
                <label style="margin-right: 1rem; color: rgba(255,255,255,0.8);">Overall Project Status:</label>
                <select id="overall-status" style="padding: 0.5rem 1rem; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 10px; color: white;">
                  <option value="pending" ${testerData.overallStatus === 'pending' ? 'selected' : ''}>Under Testing</option>
                  <option value="ready" ${testerData.overallStatus === 'ready' ? 'selected' : ''}>Ready for Release</option>
                  <option value="critical" ${testerData.overallStatus === 'critical' ? 'selected' : ''}>Critical Issues Found</option>
                </select>
              </div>
              <button id="save-qa-btn" class="cta-button" style="padding: 1rem 3rem; border-radius: 10px; font-weight: bold; background: linear-gradient(135deg, #2ecc71, #27ae60);">Finalize Stage 08</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;

  // UI Setup & Logic
  setupProfile(user);
  const testCasesList = document.getElementById('test-cases-list');
  let currentTestCases = [...testerData.testCases];

  function renderTestCases() {
    if (currentTestCases.length === 0) {
      testCasesList.innerHTML = `<p style="text-align: center; color: rgba(255,255,255,0.5); padding: 2rem;">No test cases added yet.</p>`;
      updateStats();
      return;
    }

    testCasesList.innerHTML = currentTestCases.map((tc, index) => `
      <div class="test-item glass" style="padding: 1.2rem; margin-bottom: 1rem; border-radius: 15px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); transition: all 0.3s ease;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.8rem;">
          <div style="display: flex; align-items: center; gap: 0.8rem;">
            <div style="width: 10px; height: 10px; border-radius: 50%; background: ${getStatusColor(tc.status)}; box-shadow: 0 0 10px ${getStatusColor(tc.status)};"></div>
            <h4 style="margin: 0; color: #fff; font-size: 1.1rem;">${tc.name}</h4>
          </div>
          <span class="status-badge" style="padding: 0.3rem 0.8rem; border-radius: 20px; font-size: 0.75rem; background: ${getStatusColor(tc.status)}1a; color: ${getStatusColor(tc.status)}; border: 1px solid ${getStatusColor(tc.status)}33; text-transform: uppercase; font-weight: bold;">${tc.status}</span>
        </div>
        <p style="margin: 0; font-size: 0.9rem; color: rgba(255,255,255,0.7); line-height: 1.5;"><strong>Steps:</strong> ${tc.description}</p>
        ${tc.result ? `<div style="margin-top: 0.8rem; padding: 0.8rem; background: rgba(52, 152, 219, 0.05); border-radius: 10px; border-left: 3px solid #3498db;">
           <p style="margin: 0; font-size: 0.85rem; color: #3498db;"><strong>Expected Result:</strong> ${tc.result}</p>
        </div>` : ''}
        <div style="margin-top: 1.2rem; display: flex; gap: 0.8rem; align-items: center;">
           <button class="status-btn pass-btn" data-index="${index}" data-status="passed" style="background: rgba(46, 204, 113, 0.1); color: #2ecc71; border: 1px solid rgba(46, 204, 113, 0.3); padding: 0.4rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.8rem; transition: all 0.2s;">Mark Pass</button>
           <button class="status-btn fail-btn" data-index="${index}" data-status="failed" style="background: rgba(231, 76, 60, 0.1); color: #e74c3c; border: 1px solid rgba(231, 76, 60, 0.3); padding: 0.4rem 1rem; border-radius: 8px; cursor: pointer; font-size: 0.8rem; transition: all 0.2s;">Mark Fail</button>
           <button class="delete-test-btn" data-index="${index}" style="margin-left: auto; background: none; border: none; color: rgba(255,255,255,0.3); cursor: pointer; font-size: 0.8rem; transition: color 0.2s;">Remove Case</button>
        </div>
      </div>
    `).join('');

    // Attach events
    document.querySelectorAll('.status-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        const status = btn.getAttribute('data-status');
        currentTestCases[idx].status = status;
        renderTestCases();
      };
    });

    document.querySelectorAll('.delete-test-btn').forEach(btn => {
      btn.onclick = () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        currentTestCases.splice(idx, 1);
        renderTestCases();
      };
    });

    updateStats();
  }

  function updateStats() {
    const total = currentTestCases.length;
    const passed = currentTestCases.filter(t => t.status === 'passed').length;
    const failed = currentTestCases.filter(t => t.status === 'failed').length;
    const pending = currentTestCases.filter(t => t.status === 'pending').length;

    document.getElementById('total-stats').innerText = total;
    document.getElementById('passed-stats').innerText = passed;
    document.getElementById('failed-stats').innerText = failed;
    document.getElementById('pending-stats').innerText = pending;
  }

  function getStatusColor(status) {
    switch (status) {
      case 'passed': return '#2ecc71';
      case 'failed': return '#e74c3c';
      default: return '#f1c40f';
    }
  }

  renderTestCases();

  document.getElementById('ai-gen-btn').onclick = async () => {
    const btn = document.getElementById('ai-gen-btn');
    const originalContent = btn.innerHTML;
    btn.innerHTML = '🧪 Analyzing Architecture...';
    btn.disabled = true;
    btn.style.opacity = '0.7';

    try {
      const res = await fetch('/api/idea/generate-test-cases', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        currentTestCases = [...currentTestCases, ...data.testCases];
        renderTestCases();
        btn.innerHTML = '✅ Tests Generated';
        setTimeout(() => {
          btn.innerHTML = originalContent;
          btn.style.opacity = '1';
          btn.disabled = false;
        }, 2000);
      } else {
        alert('Failed to generate test cases.');
        btn.innerHTML = originalContent;
        btn.style.opacity = '1';
        btn.disabled = false;
      }
    } catch (err) {
      console.error(err);
      alert('Error generating test cases.');
      btn.innerHTML = originalContent;
      btn.style.opacity = '1';
      btn.disabled = false;
    }
  };

  document.getElementById('add-test-btn').onclick = () => {
    const name = document.getElementById('test-name').value;
    const desc = document.getElementById('test-desc').value;
    const result = document.getElementById('test-result').value;
    const status = document.getElementById('test-status').value;

    if (!name || !desc) {
      alert('Please fill in both name and description.');
      return;
    }

    currentTestCases.push({ name, description: desc, result, status });
    renderTestCases();

    // Clear inputs
    document.getElementById('test-name').value = '';
    document.getElementById('test-desc').value = '';
    document.getElementById('test-result').value = '';
    document.getElementById('test-status').value = 'pending';
  };

  document.getElementById('save-qa-btn').onclick = async () => {
    const summary = document.getElementById('test-summary').value;
    const overall = document.getElementById('overall-status').value;

    const dataToSave = {
      testerData: {
        testCases: currentTestCases,
        overallStatus: overall,
        testSummary: summary
      }
    };

    try {
      const res = await fetch('/api/idea/save-tester', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(dataToSave)
      });

      if (res.ok) {
        alert('Stage 08: Testing phase completed successfully!');
        backFunction();
      } else {
        const err = await res.json();
        alert('Failed to save testing data: ' + err.message);
      }
    } catch (err) {
      console.error('Save error:', err);
      alert('An error occurred while saving.');
    }
  };

  document.getElementById('back-btn').onclick = () => backFunction();
}

function setupProfile(user) {
  const profileIcon = document.getElementById('profile-icon');
  const profileDropdown = document.getElementById('profile-dropdown');
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profileTeam = document.getElementById('profile-team');

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

  document.getElementById('logout-btn').onclick = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('phase_creation_mode');
    window.location.reload();
  };

  document.getElementById('switch-mission-btn').onclick = () => {
    localStorage.removeItem('phase_creation_mode');
    import('./load.js').then(m => m.initLoad(document.getElementById('app'), user));
  };

  document.getElementById('nav-logo').onclick = () => {
    import('./home2.js').then(m => m.initHome2(document.getElementById('app'), user));
  };
}
