export async function initIdeaGenerator(app, user) {
    const token = localStorage.getItem('token');

    // Fetch existing project/idea data to pre-fill or context
    let projectDetails = null;
    try {
        const res = await fetch('/api/project/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) projectDetails = await res.json();
    } catch (err) { }

    app.innerHTML = `
        <div class="setup-container" style="padding: 120px 2rem 4rem 2rem; max-width: 900px; margin: 0 auto; animation: fadeIn 0.8s ease;">
            <div class="glass-panel" style="background: rgba(0,0,0,0.8); padding: 4rem; border-radius: 40px; border: 1px solid rgba(255,255,255,0.05); box-shadow: 0 25px 50px rgba(0,0,0,0.5);">
                <div style="text-align: center; margin-bottom: 4rem;">
                    <div style="display: flex; align-items: center; justify-content: center; gap: 1rem; margin-bottom: 1rem;">
                        <span style="width: 40px; height: 1px; background: var(--accent);"></span>
                        <span style="font-size: 0.8rem; letter-spacing: 4px; color: var(--accent); font-weight: 900; text-transform: uppercase;">Step 02</span>
                        <span style="width: 40px; height: 1px; background: var(--accent);"></span>
                    </div>
                    <h1 style="font-family: 'Playfair Display', serif; color: #fff; font-size: 3rem; margin: 0; letter-spacing: 2px;">IDEA ARCHITECT</h1>
                    <p style="color: var(--text-secondary); margin-top: 1rem; font-size: 1rem; max-width: 500px; margin-left: auto; margin-right: auto;">Input your technical DNA to generate a high-impact engineering objective.</p>
                </div>

                <form id="project-form" class="setup-form" style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 2.5rem;">
                    <div class="glass-input-group full-width">
                        <label for="branch">Select Branch</label>
                        <select id="branch" name="branch" class="glass-input">
                            <option value="CS" ${projectDetails?.branch === 'CS' ? 'selected' : ''}>Computer Science (CS)</option>
                            <option value="IT" ${projectDetails?.branch === 'IT' ? 'selected' : ''}>Information Technology (IT)</option>
                            <option value="AIML" ${projectDetails?.branch === 'AIML' ? 'selected' : ''}>AI & Machine Learning (AIML)</option>
                            <option value="Data Science" ${projectDetails?.branch === 'Data Science' ? 'selected' : ''}>Data Science</option>
                            <option value="Mechanical">Mechanical</option>
                            <option value="Electrical">Electrical</option>
                        </select>
                    </div>

                    <div class="glass-input-group">
                        <label for="skills">Technical Skills (Multi-select)</label>
                        <select id="skills" multiple name="skills[]" class="glass-input" style="height: 150px; padding: 10px;">
                            <option value="python">Python</option>
                            <option value="java">Java</option>
                            <option value="javascript">JavaScript</option>
                            <option value="cpp">C++</option>
                            <option value="react">React / Frontend</option>
                            <option value="nodejs">Node.js / Backend</option>
                            <option value="tensorflow">TensorFlow / AI</option>
                            <option value="solidity">Solidity / Web3</option>
                        </select>
                        <p style="font-size: 0.7rem; color: #555; margin-top: 5px;">Hold Ctrl (Cmd) to select multiple</p>
                    </div>

                    <div class="glass-input-group">
                        <label for="interests">Project Interests</label>
                        <select id="interests" multiple name="interests[]" class="glass-input" style="height: 150px; padding: 10px;">
                            <option value="robotics">Robotics</option>
                            <option value="ai">Artificial Intelligence</option>
                            <option value="web">Web Ecosystems</option>
                            <option value="blockchain">Blockchain / Crypto</option>
                            <option value="iot">Internet of Things</option>
                            <option value="cybersecurity">Cybersecurity</option>
                        </select>
                    </div>

                    <div class="glass-input-group full-width">
                        <label for="constraints">Operational Constraints</label>
                        <select id="constraints" multiple name="constraints[]" class="glass-input" style="height: 120px; padding: 10px;">
                            <option value="time">Limited Time</option>
                            <option value="budget">Resource/Budget Caps</option>
                            <option value="hardware">Hardware Dependency</option>
                            <option value="dataset">Large Dataset Requirements</option>
                        </select>
                    </div>

                    <div class="full-width" style="margin-top: 2rem;">
                        <button type="submit" class="submit-btn" style="width: 100%; padding: 1.5rem; background: var(--accent); color: #000; border: none; border-radius: 15px; font-weight: 900; letter-spacing: 2px; text-transform: uppercase; cursor: pointer; transition: all 0.3s; font-size: 1rem;">
                            Initialize Generation
                        </button>
                    </div>
                </form>

                <!-- Generation Result Modal-like area -->
                <div id="generation-result" style="display: none; margin-top: 4rem; padding-top: 4rem; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="background: rgba(201,176,55,0.05); border: 1px solid var(--accent); border-radius: 20px; padding: 2rem;">
                        <h3 style="color: var(--accent); margin-top: 0; font-family: 'Playfair Display', serif;">Phase Architect Result</h3>
                        <div id="ai-idea-text" style="color: #fff; line-height: 1.6; font-size: 1.1rem; margin-bottom: 2rem;"></div>
                        <button id="confirm-idea-btn" class="submit-btn" style="background: #2ecc71; color: #fff; border: none; padding: 1rem 2rem; border-radius: 10px; cursor: pointer; font-weight: bold; width: 100%;">CONFIRM & LOCK OBJECTIVE</button>
                    </div>
                </div>

                <div style="text-align: center; margin-top: 2rem;">
                    <a href="#" id="back-to-roadmap" style="color: #555; text-decoration: none; font-size: 0.8rem; letter-spacing: 2px; font-weight: 700;">EXIT ARCHITECT</a>
                </div>
            </div>
        </div>
    `;

    const form = document.getElementById('project-form');
    const resultDiv = document.getElementById('generation-result');
    const ideaText = document.getElementById('ai-idea-text');
    const confirmBtn = document.getElementById('confirm-idea-btn');
    const backBtn = document.getElementById('back-to-roadmap');

    let currentGeneration = null;

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const skills = Array.from(document.getElementById('skills').selectedOptions).map(o => o.value);
        const interests = Array.from(document.getElementById('interests').selectedOptions).map(o => o.value);
        const constraints = Array.from(document.getElementById('constraints').selectedOptions).map(o => o.value);
        const branch = document.getElementById('branch').value;

        const data = { branch, skills, interests, constraints };

        generateProjectIdea(data);
    });

    const generateProjectIdea = (data) => {
        // AI Logic Simulation
        const topInterest = data.interests[0] || 'Engineering';
        const topSkill = data.skills[0] || 'System Design';

        const ideas = [
            `Development of a ${topInterest}-driven framework using ${topSkill}, tailored for the ${data.branch} landscape while overcoming ${data.constraints[0] || 'standard'} limitations.`,
            `An autonomous ${topInterest} diagnostic engine built with ${topSkill} for large-scale ${data.branch} applications.`,
            `Innovative ${data.branch} middleware that integrates ${topInterest} protocols via ${topSkill} architecture.`
        ];

        const selectedIdea = ideas[Math.floor(Math.random() * ideas.length)];

        currentGeneration = {
            ...data,
            idea: selectedIdea
        };

        ideaText.innerHTML = `<strong>Final Proposal:</strong><br/><br/>"${selectedIdea}"`;
        resultDiv.style.display = 'block';
        resultDiv.scrollIntoView({ behavior: 'smooth' });
    };

    confirmBtn.onclick = async () => {
        if (!currentGeneration) return;

        try {
            const res = await fetch('/api/idea/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...currentGeneration,
                    isCompleted: true
                })
            });

            if (res.ok) {
                alert('Objective Secured. Milestone Updated.');
                window.location.reload();
            } else {
                alert('Error securing objective. Please check project initialization.');
            }
        } catch (err) {
            console.error(err);
        }
    };

    backBtn.onclick = (e) => {
        e.preventDefault();
        window.location.reload();
    };
}
