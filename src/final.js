
export async function initFinal(app, user, backFunction = () => window.history.back()) {
  const token = localStorage.getItem('token');

  let ideaData = null;
  try {
    const res = await fetch('/api/idea/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    if (res.ok) {
      ideaData = await res.json();
    } else {
      alert('Failed to load idea data.');
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
              <button id="logout-btn" class="logout-btn">LOGOUT</button>
            </div>
          </div>
        </div>
      </nav>

      <section class="content-section" style="padding: 60px 0 100px 0; background: transparent; color: white;">
        <div class="glass" style="margin: 0 4rem 4rem 4rem; padding: 4rem; border-radius: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.3); color: white;">
          <button id="back-btn" class="back-btn" style="background: rgba(255,255,255,0.1); color: white; border: 1px solid rgba(255,255,255,0.2); padding: 0.5rem 1rem; border-radius: 20px; cursor: pointer; margin-bottom: 2rem;">← Back</button>
          <h2 class="section-title" style="text-align: center; margin-bottom: 2rem; color: white;">Final Review & Success Confidence</h2>

          <!-- Project Overview Card -->
          <div class="glass" style="padding: 2rem; margin-bottom: 2rem; border-radius: 20px; background: rgba(0,0,0,0.3); color: white;">
            <h3 style="color: white;">Project Overview</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; color: white;">
              <div><strong>Title:</strong> ${ideaData.title || 'N/A'}</div>
              <div><strong>Description:</strong> ${ideaData.description || 'N/A'}</div>
              <div><strong>Team:</strong> ${user.teamName || 'N/A'}</div>
              <div><strong>User:</strong> ${user.username}</div>
              <div><strong>Email:</strong> ${user.email}</div>
              <div><strong>Total Weeks:</strong> ${ideaData.weekSubmissions?.length || 0}</div>
            </div>
          </div>

          <!-- Progress Dashboard -->
          <div style="display: flex; flex-wrap: wrap; gap: 2rem; justify-content: center; margin-bottom: 2rem;">
            <div class="glass" style="flex: 1; min-width: 300px; padding: 2rem; border-radius: 20px; background: rgba(0,0,0,0.3); color: white;">
              <h3 style="color: white;">Progress Tracking</h3>
              <canvas id="progressChart" width="400" height="300"></canvas>
            </div>
            <div class="glass" style="flex: 1; min-width: 300px; padding: 2rem; border-radius: 20px; background: rgba(0,0,0,0.3); color: white;">
              <h3 style="color: white;">Submission Analysis</h3>
              <canvas id="reviewsChart" width="400" height="300"></canvas>
            </div>
          </div>

          <!-- Success Metrics -->
          <div class="glass" style="padding: 2rem; margin-bottom: 2rem; border-radius: 20px; background: rgba(0,0,0,0.3); color: white;">
            <h3 style="color: white;">Success Metrics</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem; color: white;">
              <div id="completionRate" style="text-align: center;"><strong>Completion Rate:</strong> <span></span></div>
              <div id="averageScore" style="text-align: center;"><strong>Average Score:</strong> <span>N/A</span></div>
              <div id="totalSubmissions" style="text-align: center;"><strong>Total Submissions:</strong> <span></span></div>
              <div id="performanceGrade" style="text-align: center;"><strong>Performance Grade:</strong> <span></span></div>
            </div>
            <div>
              <h4 style="color: white;">Success Confidence</h4>
              <p id="successConfidence" style="text-align: center; font-size: 1.2rem; margin: 1rem 0; color: white;"></p>
              <div style="width: 100%; background: #333; height: 20px; border-radius: 10px; overflow: hidden;">
                <div id="confidenceBar" style="height: 100%; background: linear-gradient(to right, #ff4d4d, #ffa500, #ffff00, #9acd32, #32cd32); transition: width 1s;"></div>
              </div>
            </div>
          </div>

          <!-- Detailed Analysis -->
          <div class="glass" style="padding: 2rem; margin-bottom: 2rem; border-radius: 20px; background: rgba(0,0,0,0.3); color: white;">
            <h3 style="color: white;">Detailed Analysis</h3>
            <div id="detailedReview" style="margin: 1rem 0; color: white;"></div>
          </div>

          <!-- Key Achievements and Challenges -->
          <div style="display: flex; flex-wrap: wrap; gap: 2rem; margin-bottom: 2rem;">
            <div class="glass" style="flex: 1; min-width: 300px; padding: 2rem; border-radius: 20px; background: rgba(0,0,0,0.3); color: white;">
              <h3 style="color: white;">Key Achievements</h3>
              <ul id="achievements" style="color: white;"></ul>
            </div>
            <div class="glass" style="flex: 1; min-width: 300px; padding: 2rem; border-radius: 20px; background: rgba(0,0,0,0.3); color: white;">
              <h3 style="color: white;">Challenges Faced</h3>
              <ul id="challenges" style="color: white;"></ul>
            </div>
          </div>

          <!-- Recommendations and Next Steps -->
          <div class="glass" style="padding: 2rem; border-radius: 20px; background: rgba(0,0,0,0.3); color: white;">
            <h3 style="color: white;">Recommendations & Next Steps</h3>
            <div id="recommendations" style="color: white;"></div>
          </div>
        </div>
      </section>
    </div>
  `;

  // Profile Logic (similar to home2.js)
  const profileIcon = document.getElementById('profile-icon');
  const profileDropdown = document.getElementById('profile-dropdown');
  const profileName = document.getElementById('profile-name');
  const profileEmail = document.getElementById('profile-email');
  const profileTeam = document.getElementById('profile-team');

  const initials = user.username.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
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
    window.location.reload();
  };

  document.getElementById('back-btn').onclick = () => {
    backFunction();
  };

  // Render graphs
  renderProgressGraph(ideaData);
  renderReviewsGraph(ideaData);

  // Calculate metrics
  const completedWeeks = ideaData.weekSubmissions.filter(w => w.status === 'submitted').length;
  const totalWeeks = ideaData.weekSubmissions.length;
  const completionRate = totalWeeks > 0 ? (completedWeeks / totalWeeks) * 100 : 0;

  // Success Confidence
  let confidenceLevel = 'Low';
  let confidencePercent = completionRate;
  let performanceGrade = 'F';
  if (completionRate === 100) {
    confidenceLevel = 'Very High';
    confidencePercent = 100;
    performanceGrade = 'A+';
  } else if (completionRate >= 90) {
    confidenceLevel = 'High';
    confidencePercent = 95;
    performanceGrade = 'A';
  } else if (completionRate >= 80) {
    confidenceLevel = 'High';
    confidencePercent = 85;
    performanceGrade = 'B+';
  } else if (completionRate >= 70) {
    confidenceLevel = 'Medium';
    confidencePercent = 75;
    performanceGrade = 'B';
  } else if (completionRate >= 60) {
    confidenceLevel = 'Medium';
    confidencePercent = 65;
    performanceGrade = 'C+';
  } else if (completionRate >= 50) {
    confidenceLevel = 'Medium';
    confidencePercent = 55;
    performanceGrade = 'C';
  } else {
    confidenceLevel = 'Low';
    confidencePercent = 35;
    performanceGrade = 'D';
  }

  // Update metrics display
  document.getElementById('completionRate').querySelector('span').innerText = `${completionRate.toFixed(1)}%`;
  document.getElementById('totalSubmissions').querySelector('span').innerText = `${completedWeeks}/${totalWeeks}`;
  document.getElementById('performanceGrade').querySelector('span').innerText = performanceGrade;

  document.getElementById('successConfidence').innerText = `Success Confidence: ${confidenceLevel} (${confidencePercent.toFixed(1)}%)`;
  document.getElementById('confidenceBar').style.width = `${confidencePercent}%`;

  // Detailed Review
  const detailedReview = document.getElementById('detailedReview');
  const consistencyScore = calculateConsistency(ideaData.weekSubmissions);
  const earlySubmissions = ideaData.weekSubmissions.filter(w => w.status === 'submitted' && w.week <= 2).length;
  const lateSubmissions = ideaData.weekSubmissions.filter(w => w.status === 'submitted' && w.week > 4).length;

  detailedReview.innerHTML = `
    <p><strong>Overall Completion:</strong> ${completedWeeks}/${totalWeeks} weeks submitted (${completionRate.toFixed(1)}%).</p>
    <p><strong>Submission Pattern:</strong> ${earlySubmissions} early, ${completedWeeks - earlySubmissions - lateSubmissions} mid, ${lateSubmissions} late submissions.</p>
    <p><strong>Consistency Score:</strong> ${consistencyScore}/10 - ${getConsistencyDescription(consistencyScore)}</p>
    <p><strong>Performance Grade:</strong> ${performanceGrade} (${getGradeDescription(performanceGrade)})</p>
    <p><strong>Timeline Analysis:</strong> ${getTimelineAnalysis(ideaData.weekSubmissions)}</p>
  `;

  // Key Achievements
  const achievementsList = document.getElementById('achievements');
  achievementsList.innerHTML = generateAchievements(ideaData, completedWeeks, totalWeeks, completionRate, performanceGrade);

  // Challenges Faced
  const challengesList = document.getElementById('challenges');
  challengesList.innerHTML = generateChallenges(ideaData, completedWeeks, totalWeeks, completionRate);

  // Recommendations
  const recommendationsDiv = document.getElementById('recommendations');
  recommendationsDiv.innerHTML = generateRecommendations(ideaData, completedWeeks, totalWeeks, completionRate, performanceGrade);


}

function renderProgressGraph(ideaData) {
  const ctx = document.getElementById('progressChart').getContext('2d');
  const weekSubmissions = ideaData.weekSubmissions || [];

  const labels = weekSubmissions.map(w => `Week ${w.week}`);
  const submittedData = weekSubmissions.map(w => w.status === 'submitted' ? 1 : 0);
  const pendingData = weekSubmissions.map(w => w.status === 'submitted' ? 0 : 1);

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Submitted',
        data: submittedData,
        backgroundColor: 'rgba(34, 197, 94, 0.6)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 1
      }, {
        label: 'Pending',
        data: pendingData,
        backgroundColor: 'rgba(239, 68, 68, 0.6)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 1
      }]
    },
    options: {
      scales: {
        x: {
          stacked: true,
        },
        y: {
          stacked: true,
          beginAtZero: true,
          max: 1,
          ticks: {
            stepSize: 1
          }
        }
      },
      plugins: {
        legend: {
          position: 'top',
        }
      }
    }
  });
}

function renderReviewsGraph(ideaData) {
  const ctx = document.getElementById('reviewsChart').getContext('2d');
  const weekSubmissions = ideaData.weekSubmissions || [];

  const submitted = weekSubmissions.filter(w => w.status === 'submitted').length;
  const pending = weekSubmissions.length - submitted;

  // Calculate submission timeline
  const earlySubmissions = weekSubmissions.filter(w => w.status === 'submitted' && w.week <= 2).length;
  const midSubmissions = weekSubmissions.filter(w => w.status === 'submitted' && w.week > 2 && w.week <= 4).length;
  const lateSubmissions = weekSubmissions.filter(w => w.status === 'submitted' && w.week > 4).length;

  new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Early Submissions (Weeks 1-2)', 'Mid Submissions (Weeks 3-4)', 'Late Submissions (Weeks 5+)', 'Pending'],
      datasets: [{
        data: [earlySubmissions, midSubmissions, lateSubmissions, pending],
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ],
        borderColor: [
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)',
          'rgba(245, 158, 11, 1)',
          'rgba(239, 68, 68, 1)'
        ],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || '';
              const value = context.parsed;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
              return `${label}: ${value} (${percentage}%)`;
            }
          }
        }
      }
    }
  });
}

// Helper Functions
function calculateConsistency(weekSubmissions) {
  if (!weekSubmissions || weekSubmissions.length === 0) return 0;

  const submittedWeeks = weekSubmissions.filter(w => w.status === 'submitted');
  const totalWeeks = weekSubmissions.length;

  if (submittedWeeks.length === 0) return 0;

  // Calculate consistency based on submission distribution
  const earlySubmissions = submittedWeeks.filter(w => w.week <= Math.ceil(totalWeeks / 3)).length;
  const midSubmissions = submittedWeeks.filter(w => w.week > Math.ceil(totalWeeks / 3) && w.week <= Math.ceil(2 * totalWeeks / 3)).length;
  const lateSubmissions = submittedWeeks.filter(w => w.week > Math.ceil(2 * totalWeeks / 3)).length;

  const distributionScore = Math.abs(earlySubmissions - midSubmissions) + Math.abs(midSubmissions - lateSubmissions);
  const consistencyScore = Math.max(0, 10 - distributionScore);

  return Math.min(10, consistencyScore);
}

function getConsistencyDescription(score) {
  if (score >= 8) return 'Excellent consistency throughout the project';
  if (score >= 6) return 'Good overall consistency with minor variations';
  if (score >= 4) return 'Moderate consistency, room for improvement';
  if (score >= 2) return 'Inconsistent submission pattern';
  return 'Poor consistency, significant variations in submission timing';
}

function getGradeDescription(grade) {
  const descriptions = {
    'A+': 'Outstanding performance - exceptional completion and consistency',
    'A': 'Excellent performance - strong completion with good consistency',
    'B+': 'Very good performance - above average completion',
    'B': 'Good performance - solid completion rate',
    'C+': 'Fair performance - adequate completion',
    'C': 'Satisfactory performance - meets minimum requirements',
    'D': 'Below average performance - significant gaps in completion',
    'F': 'Unsatisfactory performance - major deficiencies'
  };
  return descriptions[grade] || 'Performance assessment pending';
}

function getTimelineAnalysis(weekSubmissions) {
  if (!weekSubmissions || weekSubmissions.length === 0) return 'No data available';

  const submitted = weekSubmissions.filter(w => w.status === 'submitted');
  const total = weekSubmissions.length;

  if (submitted.length === 0) return 'No submissions completed';

  const firstSubmission = Math.min(...submitted.map(w => w.week));
  const lastSubmission = Math.max(...submitted.map(w => w.week));
  const span = lastSubmission - firstSubmission + 1;

  if (span === submitted.length) return 'Consistent weekly submissions throughout the project';
  if (span > submitted.length) return `Submissions spread over ${span} weeks with some gaps`;
  return 'Submissions completed within a focused timeframe';
}

function generateAchievements(ideaData, completedWeeks, totalWeeks, completionRate, performanceGrade) {
  const achievements = [];

  if (completionRate === 100) {
    achievements.push('<li>🏆 <strong>Perfect Completion:</strong> Achieved 100% submission rate</li>');
  }

  if (performanceGrade.startsWith('A')) {
    achievements.push('<li>⭐ <strong>Excellence Award:</strong> Outstanding performance grade</li>');
  }

  if (completedWeeks >= totalWeeks * 0.8) {
    achievements.push('<li>🎯 <strong>High Achiever:</strong> Completed 80% or more of all weeks</li>');
  }

  const earlySubmissions = ideaData.weekSubmissions.filter(w => w.status === 'submitted' && w.week <= 2).length;
  if (earlySubmissions >= 2) {
    achievements.push('<li>🚀 <strong>Early Starter:</strong> Strong beginning with early submissions</li>');
  }

  const consistencyScore = calculateConsistency(ideaData.weekSubmissions);
  if (consistencyScore >= 7) {
    achievements.push('<li>📊 <strong>Consistent Performer:</strong> Maintained steady submission pattern</li>');
  }

  if (achievements.length === 0) {
    achievements.push('<li>📈 <strong>Progress Made:</strong> Successfully completed project phases</li>');
  }

  return achievements.join('');
}

function generateChallenges(ideaData, completedWeeks, totalWeeks, completionRate) {
  const challenges = [];

  const pendingWeeks = totalWeeks - completedWeeks;
  if (pendingWeeks > 0) {
    challenges.push(`<li>⏰ <strong>Missing Submissions:</strong> ${pendingWeeks} week${pendingWeeks > 1 ? 's' : ''} remain incomplete</li>`);
  }

  const lateSubmissions = ideaData.weekSubmissions.filter(w => w.status === 'submitted' && w.week > 4).length;
  if (lateSubmissions > completedWeeks * 0.5) {
    challenges.push('<li>🕐 <strong>Timing Issues:</strong> Majority of submissions completed late in the project</li>');
  }

  const consistencyScore = calculateConsistency(ideaData.weekSubmissions);
  if (consistencyScore < 5) {
    challenges.push('<li>📉 <strong>Inconsistent Pace:</strong> Irregular submission pattern affected project flow</li>');
  }

  if (completionRate < 50) {
    challenges.push('<li>⚠️ <strong>Completion Concerns:</strong> Low completion rate indicates significant challenges</li>');
  }

  if (challenges.length === 0) {
    challenges.push('<li>✅ <strong>Well Managed:</strong> Successfully navigated project challenges</li>');
  }

  return challenges.join('');
}

function generateRecommendations(ideaData, completedWeeks, totalWeeks, completionRate, performanceGrade) {
  const recommendations = [];

  if (completionRate < 100) {
    recommendations.push('<li>🎯 <strong>Complete Remaining Work:</strong> Focus on finishing all pending submissions to maximize project value</li>');
  }

  if (performanceGrade === 'D' || performanceGrade === 'F') {
    recommendations.push('<li>📚 <strong>Skill Development:</strong> Consider additional training or mentorship for future projects</li>');
  }

  const consistencyScore = calculateConsistency(ideaData.weekSubmissions);
  if (consistencyScore < 6) {
    recommendations.push('<li>📅 <strong>Time Management:</strong> Develop better planning strategies for consistent progress</li>');
  }

  const lateSubmissions = ideaData.weekSubmissions.filter(w => w.status === 'submitted' && w.week > 4).length;
  if (lateSubmissions > 0) {
    recommendations.push('<li>⚡ <strong>Early Planning:</strong> Start assignments earlier to avoid last-minute rushes</li>');
  }

  if (completionRate >= 80) {
    recommendations.push('<li>🚀 <strong>Build Momentum:</strong> Leverage your success to tackle more ambitious projects</li>');
  }

  recommendations.push('<li>🤝 <strong>Seek Feedback:</strong> Discuss your work with mentors or peers for continuous improvement</li>');
  recommendations.push('<li>📊 <strong>Track Progress:</strong> Use project management tools to monitor future project timelines</li>');

  return recommendations.map(rec => `<div style="margin-bottom: 0.5rem;">${rec}</div>`).join('');
}
