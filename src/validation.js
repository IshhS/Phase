export async function initValidation(app, user) {
    const token = localStorage.getItem('token');

    // Fetch the idea and team data
    let ideaData = null;
    let teamData = null;
    try {
        const [ideaRes, teamRes] = await Promise.all([
            fetch('/api/idea/me', { headers: { 'Authorization': `Bearer ${token}` } }),
            fetch('/api/idea/team', { headers: { 'Authorization': `Bearer ${token}` } })
        ]);
        if (ideaRes.ok) ideaData = await ideaRes.json();
        if (teamRes.ok) teamData = await teamRes.json();
    } catch (err) {
        console.error("Failed to fetch data for validation", err);
    }

    if (!ideaData || !ideaData.isCompleted) {
        app.innerHTML = `
            <div class="setup-container" style="padding: 120px 2rem; max-width: 800px; margin: 0 auto; text-align: center;">
                <h1 style="color: #fff; font-family: 'Playfair Display', serif; font-size: 2.5rem;">ACCESS DENIED</h1>
                <p style="color: #888; margin-top: 1.5rem;">You must secure an Industrial Objective in Step 02 before entering the Validation Chamber.</p>
                <button id="back-to-roadmap" class="submit-btn" style="margin-top: 2rem; width: auto; padding: 1rem 3rem;">RETURN TO TUNNEL</button>
            </div>
        `;
        document.getElementById('back-to-roadmap').onclick = () => window.location.reload();
        return;
    }

    // Extract project title from the idea text
    const ideaText = ideaData.idea || "";
    let projectTitle = "Untitled Project";
    if (ideaText.includes('PROPOSED PROJECT TITLE:')) {
        projectTitle = ideaText.split('PROPOSED PROJECT TITLE:')[1].split('\n')[0].trim();
    } else if (ideaText.includes('Project:')) {
        projectTitle = ideaText.split('Project:')[1].trim();
    } else {
        projectTitle = ideaText.split('|')[0].trim();
    }

    app.innerHTML = `
        <div class="setup-container" style="padding: 40px 0 4rem 0; width: 92%; max-width: 1550px; margin: 0 auto; animation: fadeIn 0.8s ease;">
            
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4rem; padding: 0 1rem;">
                <div>
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                        <span style="font-size: 0.75rem; letter-spacing: 4px; color: #2ecc71; font-weight: 900; text-transform: uppercase;">Step 03</span>
                        <span style="width: 40px; height: 1px; background: #2ecc71; opacity: 0.3;"></span>
                    </div>
                    <h1 style="font-family: 'Playfair Display', serif; color: #fff; font-size: 3.8rem; margin: 0; letter-spacing: -1px; font-weight: 700;">Validation</h1>
                </div>
                <div style="text-align: right;">
                    <a href="#" id="back-to-roadmap-link" style="color: #888; text-decoration: none; font-size: 0.7rem; letter-spacing: 3px; font-weight: 800; text-transform: uppercase; transition: 0.3s; padding: 12px 25px; border: 1px solid rgba(255,255,255,0.1); border-radius: 30px; background: rgba(0,0,0,0.3);">
                        &larr; Exit Protocol
                    </a>
                </div>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 420px; gap: 3rem; align-items: stretch;">
                
                <!-- Left: Project Scope -->
                <div class="glass" style="background: rgba(0,0,0,0.8); padding: 4rem; border-radius: 40px; border: 1px solid rgba(255,255,255,0.05); display: flex; flex-direction: column; gap: 3rem; box-shadow: 0 40px 100px rgba(0,0,0,0.6);">
                    <div>
                        <div style="display: flex; align-items: center; gap: 1.2rem; margin-bottom: 2.5rem;">
                            <span style="width: 5px; height: 35px; background: var(--accent); border-radius: 3px;"></span>
                            <h2 style="color: #fff; font-family: 'Playfair Display', serif; font-size: 2.4rem; margin: 0;">Project Scope</h2>
                        </div>
                        
                        <div style="display: grid; grid-template-columns: 1fr; gap: 2.5rem;">
                            <div class="glass-input-group">
                                <label style="color: #666; font-size: 0.75rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 1.2rem; display: block;">Final Project Title</label>
                                <input type="text" id="project-title-final" value="${projectTitle}" class="glass-input" readonly style="background: rgba(255,255,255,0.02); color: #fff; border-color: rgba(255,255,255,0.08); font-weight: 700; padding: 1.6rem; font-size: 1.15rem; border-radius: 18px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);">
                            </div>

                            <div class="glass-input-group">
                                <label style="color: #666; font-size: 0.75rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 1.2rem; display: block;">Objective Abstract</label>
                                <textarea id="project-abstract" placeholder="Brief summary of your industrial solution..." class="glass-input" style="height: 160px; resize: none; line-height: 1.8; background: rgba(255,255,255,0.01); padding: 1.8rem; border-radius: 18px; font-size: 1.05rem; border-color: rgba(255,255,255,0.08);">${ideaData.abstract || ''}</textarea>
                            </div>

                            <div class="glass-input-group">
                                <label style="color: #666; font-size: 0.75rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 1.2rem; display: block;">Technical Breakdown</label>
                                <textarea id="project-description" placeholder="Specific modules and methodologies..." class="glass-input" style="height: 280px; resize: none; line-height: 1.8; background: rgba(255,255,255,0.01); padding: 1.8rem; border-radius: 18px; font-size: 1.05rem; border-color: rgba(255,255,255,0.08);">${ideaData.detailedDescription || ''}</textarea>
                            </div>
                        </div>
                    </div>

                    <button id="generate-doc-btn" class="submit-btn" style="background: #fff; color: #000; border: none; padding: 1.6rem; border-radius: 18px; font-weight: 900; cursor: pointer; display: flex; align-items: center; justify-content: center; gap: 15px; transition: 0.3s; letter-spacing: 1px; width: fit-content; min-width: 320px; box-shadow: 0 10px 40px rgba(255,255,255,0.1);">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                        GENERATE PROJECT BRIEF
                    </button>
                </div>

                <!-- Right: Team & Authorization -->
                <div style="display: flex; flex-direction: column; gap: 2.5rem;">
                    
                    <div class="glass" style="background: rgba(0,0,0,0.85); padding: 3.5rem; border-radius: 40px; border: 1px solid rgba(255,255,255,0.05); flex: 1; display: flex; flex-direction: column; box-shadow: 0 40px 100px rgba(0,0,0,0.6);">
                        <div style="margin-bottom: 3.5rem;">
                            <h2 style="color: #fff; font-family: 'Playfair Display', serif; margin: 0; font-size: 2rem;">Team Member</h2>
                            <div style="margin-top: 8px;">
                                <span style="font-size: 0.65rem; color: #555; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase;">UNIT:</span>
                                <span style="color: var(--accent); font-weight: 900; font-size: 0.85rem; letter-spacing: 1px; margin-left: 8px;">${teamData ? teamData.teamName : 'STANDALONE'}</span>
                            </div>
                        </div>

                        <div id="team-list" style="display: flex; flex-direction: column; gap: 1.2rem;">
                            ${teamData ? teamData.teammates.map((m, idx) => `
                                <div style="display: flex; align-items: center; gap: 1.4rem; padding: 1.4rem; background: rgba(255,255,255,0.02); border-radius: 22px; border: 1px solid rgba(255,255,255,0.02);" class="team-member-row">
                                    <div style="width: 42px; height: 42px; background: ${m.username === teamData.leader ? 'var(--accent)' : 'rgba(255,255,255,0.05)'}; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 0.9rem; font-weight: 900; color: #000;">
                                        ${idx + 1}
                                    </div>
                                    <div style="flex: 1;">
                                        <div style="display: flex; align-items: center; gap: 10px;">
                                            <span style="color: #fff; font-size: 1.05rem; font-weight: 700;">${m.username}</span>
                                            ${m.username === teamData.leader ? '<span style="color: var(--accent); font-size: 0.6rem; font-weight: 900; padding: 2px 8px; border: 1px solid var(--accent); border-radius: 6px; letter-spacing: 0.5px;">LEADER</span>' : ''}
                                        </div>
                                        <div style="color: #444; font-size: 0.8rem; margin-top: 3px;">${m.email}</div>
                                    </div>
                                </div>
                            `).join('') : '<p style="color: #555; text-align: center; padding: 2rem;">No operational data found.</p>'}
                        </div>

                        <div style="margin-top: auto; padding-top: 4rem; display: flex; flex-direction: column; gap: 1.2rem;">
                            <button id="final-confirm-btn" class="submit-btn" style="background: #2ecc71; color: #fff; border: none; padding: 1.8rem; border-radius: 22px; font-weight: 900; cursor: pointer; transition: 0.3s; width: 100%; letter-spacing: 1.5px; font-size: 0.95rem; box-shadow: 0 20px 50px rgba(46, 204, 113, 0.25);">
                                AUTHORIZE & SUBMIT
                            </button>
                            
                            <!-- Manual Exports Section -->
                            <div id="manual-exports" style="display: none; grid-template-columns: 1fr 1fr; gap: 1rem; animation: slideIn 0.4s ease;">
                                <button id="down-report-btn" style="background: rgba(255,255,255,0.05); color: #fff; border: 1px solid rgba(255,255,255,0.1); padding: 1.2rem; border-radius: 15px; font-size: 0.7rem; font-weight: 800; cursor: pointer; transition: 0.3s;">
                                    DOWNLOAD REPORT
                                </button>
                                <button id="down-excel-btn" style="background: rgba(201,176,55,0.1); color: var(--accent); border: 1px solid rgba(201,176,55,0.2); padding: 1.2rem; border-radius: 15px; font-size: 0.7rem; font-weight: 800; cursor: pointer; transition: 0.3s;">
                                    EXCEL SHEET
                                </button>
                            </div>

                            <p style="text-align: center; color: #444; font-size: 0.7rem; margin-top: 1rem; line-height: 1.8; max-width: 85%; margin-left: auto; margin-right: auto;">
                                Authorizing will secure Step 03 and enable manual manifest exports.
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    `;

    document.getElementById('back-to-roadmap-link').onclick = (e) => {
        e.preventDefault();
        window.location.reload();
    };

    // AI Generation Logic
    const genBtn = document.getElementById('generate-doc-btn');
    genBtn.onclick = async () => {
        genBtn.disabled = true;
        genBtn.innerHTML = `
            <span style="display: flex; align-items: center; gap: 10px;">
                <div class="spinner" style="width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.1); border-top-color: #000; border-radius: 50%; animation: rotate 1s linear infinite;"></div>
                SYNTHESIZING BRIEF...
            </span>
        `;

        try {
            const res = await fetch('/api/idea/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    messages: [
                        {
                            role: 'user', content: `Generate a professional, industrial-grade project ABSTRACT and a DETAILED TECHNICAL DESCRIPTION for this project title: "${projectTitle}". Keep it professional. Format your response exactly like this:
                        ABSTRACT: [The abstract text here]
                        DESCRIPTION: [The detailed description text here]` }
                    ]
                })
            });

            if (res.ok) {
                const data = await res.json();
                const text = data.response;

                const abstractMatch = text.match(/ABSTRACT:\s*([\s\S]*?)(?=DESCRIPTION:|$)/i);
                const descMatch = text.match(/DESCRIPTION:\s*([\s\S]*)/i);

                if (abstractMatch) document.getElementById('project-abstract').value = abstractMatch[1].trim();
                if (descMatch) document.getElementById('project-description').value = descMatch[1].trim();
            }
        } catch (err) {
            console.error(err);
        } finally {
            genBtn.disabled = false;
            genBtn.innerHTML = `
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                GENERATE PROJECT BRIEF
            `;
        }
    };

    // Final Confirmation and Manual Exports
    const confirmBtn = document.getElementById('final-confirm-btn');
    const exportDiv = document.getElementById('manual-exports');

    confirmBtn.onclick = async () => {
        const abstract = document.getElementById('project-abstract').value;
        const description = document.getElementById('project-description').value;

        if (!abstract || !description) return alert("Please generate the project brief before authorizing.");

        confirmBtn.disabled = true;
        confirmBtn.innerText = "SUBMITTING...";

        try {
            const saveRes = await fetch('/api/idea/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    abstract,
                    detailedDescription: description,
                    teamName: teamData.teamName,
                    leader: teamData.leader,
                    teammates: teamData.teammates,
                    step03Completed: true
                })
            });

            if (saveRes.ok) {
                confirmBtn.style.background = 'rgba(46, 204, 113, 0.1)';
                confirmBtn.style.color = '#2ecc71';
                confirmBtn.innerText = "PROTOCOL SUBMITTED ✓";
                exportDiv.style.display = 'grid';
            }
        } catch (err) {
            console.error(err);
            confirmBtn.disabled = false;
            confirmBtn.innerText = "AUTHORIZE & SUBMIT";
        }
    };

    document.getElementById('down-report-btn').onclick = () => {
        const abstract = document.getElementById('project-abstract').value;
        const description = document.getElementById('project-description').value;
        downloadReport(projectTitle, abstract, description);
    };

    document.getElementById('down-excel-btn').onclick = () => {
        downloadExcel(projectTitle, teamData);
    };

    function downloadReport(title, abst, desc) {
        let content = `PHASE: PROJECT TECHNICAL REPORT\n`;
        content += `===============================\n\n`;
        content += `PROJECT TITLE: ${title}\n\n`;
        content += `--- ABSTRACT ---\n${abst}\n\n`;
        content += `--- TECHNICAL DESCRIPTION ---\n${desc}\n`;

        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Project_Report_${title.replace(/\s+/g, '_')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }

    function downloadExcel(title, team) {
        if (!team) return;

        // Doubling padding (2x) to ensure massive screen-wide columns
        const teamPadding = " ".repeat(80);
        const memberPadding = " ".repeat(80);
        const titlePadding = " ".repeat(130);

        let csvContent = "data:text/csv;charset=utf-8,";
        // Uppercasing headers for a more formal "fixed" look
        csvContent += `TEAM NAME${teamPadding},TEAM MEMBER${memberPadding},PROJECT TITLE${titlePadding}\n`;

        team.teammates.forEach((m) => {
            const memberName = m.username === team.leader ? `${m.username} (LEADER)` : m.username;
            // Uppercasing project title for better visual impact
            csvContent += `"${team.teamName}","${memberName}","${title.toUpperCase()}"\n`;
        });

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `Project_Manifest_${team.teamName}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
