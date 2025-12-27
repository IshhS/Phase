export async function initRoadmap(app, user) {
    const token = localStorage.getItem('token');
    let ideaData = null;
    let roadmapGenerated = false;

    // Fetch existing idea and roadmap data
    try {
        const ideaRes = await fetch('/api/idea/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (ideaRes.ok) {
            ideaData = await ideaRes.json();
            roadmapGenerated = ideaData?.roadmapData && ideaData.roadmapData.length > 0;
        }
    } catch (err) {
        console.error("Failed to fetch roadmap data", err);
    }

    if (!ideaData || !ideaData.step03Completed) {
        app.innerHTML = `
            <div class="setup-container" style="padding: 120px 2rem; max-width: 800px; margin: 0 auto; text-align: center;">
                <h1 style="color: #fff; font-family: 'Playfair Display', serif; font-size: 2.5rem;">ACCESS DENIED</h1>
                <p style="color: #888; margin-top: 1.5rem;">You must complete Step 03: Validation before accessing the Roadmap Generator.</p>
                <button id="back-to-roadmap" class="submit-btn" style="margin-top: 2rem; width: auto; padding: 1rem 3rem;">RETURN TO TUNNEL</button>
            </div>
        `;
        document.getElementById('back-to-roadmap').onclick = () => {
            import('./home2.js').then(m => m.initHome2(app, user));
        };
        return;
        return;
    }

    // Extract project title
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
        <div class="setup-container" style="padding: 40px 0 4rem 0; width: 95%; max-width: 1600px; margin: 0 auto; animation: fadeIn 0.8s ease;">
            
            <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 4rem; padding: 0 1rem;">
                <div>
                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                        <span style="font-size: 0.75rem; letter-spacing: 4px; color: #2ecc71; font-weight: 900; text-transform: uppercase;">Step 04</span>
                        <span style="width: 40px; height: 1px; background: #2ecc71; opacity: 0.3;"></span>
                    </div>
                    <h1 style="font-family: 'Playfair Display', serif; color: #fff; font-size: 3.8rem; margin: 0; letter-spacing: -1px; font-weight: 700;">Roadmap Generator</h1>
                    <p style="color: #666; margin-top: 1rem; font-size: 0.9rem; letter-spacing: 0.5px;">AI-Powered Visual Pipeline for: <span style="color: var(--accent); font-weight: 700;">${projectTitle}</span></p>
                </div>
                <div style="text-align: right;">
                    <a href="#" id="back-to-roadmap-link" style="color: #888; text-decoration: none; font-size: 0.7rem; letter-spacing: 3px; font-weight: 800; text-transform: uppercase; transition: 0.3s; padding: 12px 25px; border: 1px solid rgba(255,255,255,0.1); border-radius: 30px; background: rgba(0,0,0,0.3);">
                        ← Exit Protocol
                    </a>
                </div>
            </div>

            ${!roadmapGenerated ? `
                <!-- Generation Interface -->
                <div class="glass" style="background: rgba(0,0,0,0.85); padding: 5rem; border-radius: 40px; border: 1px solid rgba(255,255,255,0.05); text-align: center; box-shadow: 0 40px 100px rgba(0,0,0,0.6);">
                    <div style="max-width: 700px; margin: 0 auto;">
                        <div style="width: 80px; height: 80px; background: var(--accent); border-radius: 20px; display: flex; align-items: center; justify-content: center; margin: 0 auto 2rem; box-shadow: 0 20px 50px rgba(201,176,55,0.3);">
                            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#000" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
                            </svg>
                        </div>
                        <h2 style="color: #fff; font-family: 'Playfair Display', serif; font-size: 2.5rem; margin-bottom: 1.5rem;">Initialize Visual Pipeline</h2>
                        <p style="color: #888; font-size: 1rem; line-height: 1.8; margin-bottom: 3rem;">
                            The Phase Architect will analyze your validated project and generate a comprehensive, visual roadmap with AI-generated milestone imagery. This process leverages Stable Diffusion models to create unique visual representations for each development phase.
                        </p>
                        
                        <button id="generate-roadmap-btn" class="submit-btn" style="background: #2ecc71; color: #fff; border: none; padding: 1.8rem 3rem; border-radius: 22px; font-weight: 900; cursor: pointer; transition: 0.3s; letter-spacing: 1.5px; font-size: 0.95rem; box-shadow: 0 20px 50px rgba(46, 204, 113, 0.25);">
                            GENERATE ROADMAP
                        </button>
                        
                        <div id="generation-status" style="margin-top: 2rem; color: #666; font-size: 0.85rem; min-height: 30px;"></div>
                    </div>
                </div>
            ` : `
                <!-- Roadmap Display -->
                <div id="roadmap-display" style="display: flex; flex-direction: column; gap: 3rem;">
                    ${ideaData.roadmapData.map((milestone, idx) => `
                        <div class="roadmap-milestone glass" data-step="${idx}" style="background: rgba(0,0,0,0.85); border-radius: 30px; border: 1px solid rgba(255,255,255,0.05); overflow: hidden; cursor: pointer; transition: 0.3s; box-shadow: 0 20px 50px rgba(0,0,0,0.4);">
                            <div style="display: grid; grid-template-columns: 400px 1fr; min-height: 280px;">
                                <!-- Image Section -->
                                <div style="position: relative; background: rgba(255,255,255,0.02); display: flex; align-items: center; justify-content: center; overflow: hidden;">
                                    ${milestone.imageUrl ? `
                                        <img src="${milestone.imageUrl}" alt="${milestone.title}" style="width: 100%; height: 100%; object-fit: cover;" />
                                        <button class="save-image-btn" data-url="${milestone.imageUrl}" data-title="${milestone.title}" style="position: absolute; top: 15px; right: 15px; background: rgba(0,0,0,0.7); color: #fff; border: none; padding: 10px 15px; border-radius: 10px; cursor: pointer; font-size: 0.7rem; font-weight: 800; backdrop-filter: blur(10px);">
                                            SAVE IMAGE
                                        </button>
                                    ` : `
                                        <div style="color: #444; font-size: 0.8rem;">Generating...</div>
                                    `}
                                </div>
                                
                                <!-- Content Section -->
                                <div style="padding: 3rem; display: flex; flex-direction: column; justify-content: center;">
                                    <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1.5rem;">
                                        <div style="width: 50px; height: 50px; background: var(--accent); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #000; font-size: 1.2rem;">
                                            ${idx + 1}
                                        </div>
                                        <div>
                                            <div style="font-size: 0.65rem; color: #666; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">${milestone.step}</div>
                                            <h3 style="color: #fff; font-family: 'Playfair Display', serif; font-size: 1.8rem; margin: 0.3rem 0 0 0;">${milestone.title}</h3>
                                        </div>
                                    </div>
                                    <p style="color: #888; font-size: 0.95rem; line-height: 1.8; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                                        ${milestone.description}
                                    </p>
                                    <div style="margin-top: 1.5rem; color: var(--accent); font-size: 0.75rem; font-weight: 800; letter-spacing: 1px;">
                                        CLICK TO EXPAND DETAILS →
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>

                <!-- Expanded Detail Modal -->
                <div id="detail-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.95); backdrop-filter: blur(10px); z-index: 10000; align-items: center; justify-content: center; padding: 2rem; overflow-y: auto;">
                    <div class="glass" style="width: 100%; max-width: 900px; background: rgba(0,0,0,0.95); border-radius: 30px; border: 1px solid rgba(255,255,255,0.1); overflow: hidden; position: relative;">
                        <button id="close-detail" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.1); color: #fff; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.5rem; z-index: 10;">×</button>
                        <div id="detail-content"></div>
                    </div>
                </div>
            `}
        </div>
    `;

    document.getElementById('back-to-roadmap-link').onclick = (e) => {
        e.preventDefault();
        import('./home2.js').then(m => m.initHome2(app, user));
    };

    if (!roadmapGenerated) {
        // Generation Logic
        const generateBtn = document.getElementById('generate-roadmap-btn');
        const statusDiv = document.getElementById('generation-status');

        generateBtn.onclick = async () => {
            generateBtn.disabled = true;
            generateBtn.innerText = "INITIALIZING AI PIPELINE...";
            statusDiv.innerText = "Phase Architect is analyzing your project structure...";

            try {
                const res = await fetch('/api/idea/generate-roadmap', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        projectTitle,
                        abstract: ideaData.abstract,
                        description: ideaData.detailedDescription
                    })
                });

                if (res.ok) {
                    const data = await res.json();
                    statusDiv.innerHTML = '<span style="color: #2ecc71;">✓ Roadmap Generated Successfully</span>';
                    setTimeout(() => window.location.reload(), 1500);
                } else {
                    throw new Error('Generation failed');
                }
            } catch (err) {
                console.error(err);
                statusDiv.innerHTML = '<span style="color: #e74c3c;">Generation failed. Please try again.</span>';
                generateBtn.disabled = false;
                generateBtn.innerText = "RETRY GENERATION";
            }
        };
    } else {
        // Interactive Roadmap Logic
        const milestones = document.querySelectorAll('.roadmap-milestone');
        const detailModal = document.getElementById('detail-modal');
        const detailContent = document.getElementById('detail-content');
        const closeBtn = document.getElementById('close-detail');

        milestones.forEach((milestone, idx) => {
            milestone.onclick = () => {
                const data = ideaData.roadmapData[idx];
                detailContent.innerHTML = `
                    <div style="padding: 3rem;">
                        ${data.imageUrl ? `
                            <img src="${data.imageUrl}" alt="${data.title}" style="width: 100%; height: 400px; object-fit: cover; border-radius: 20px; margin-bottom: 2rem;" />
                        ` : ''}
                        <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem;">
                            <div style="width: 60px; height: 60px; background: var(--accent); border-radius: 15px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #000; font-size: 1.5rem;">
                                ${idx + 1}
                            </div>
                            <div>
                                <div style="font-size: 0.7rem; color: #666; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">${data.step}</div>
                                <h2 style="color: #fff; font-family: 'Playfair Display', serif; font-size: 2.5rem; margin: 0.5rem 0 0 0;">${data.title}</h2>
                            </div>
                        </div>
                        <div style="color: #ccc; font-size: 1.05rem; line-height: 1.9;">
                            ${data.description.split('\n').map(p => `<p style="margin-bottom: 1.5rem;">${p}</p>`).join('')}
                        </div>
                    </div>
                `;
                detailModal.style.display = 'flex';
            };
        });

        closeBtn.onclick = () => {
            detailModal.style.display = 'none';
        };

        detailModal.onclick = (e) => {
            if (e.target === detailModal) {
                detailModal.style.display = 'none';
            }
        };

        // Save Image Functionality
        document.querySelectorAll('.save-image-btn').forEach(btn => {
            btn.onclick = async (e) => {
                e.stopPropagation();
                const url = btn.dataset.url;
                const title = btn.dataset.title;

                try {
                    const response = await fetch(url);
                    const blob = await response.blob();
                    const blobUrl = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = blobUrl;
                    a.download = `${title.replace(/\s+/g, '_')}_Roadmap.png`;
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    window.URL.revokeObjectURL(blobUrl);

                    btn.innerText = 'SAVED ✓';
                    btn.style.background = 'rgba(46, 204, 113, 0.8)';
                    setTimeout(() => {
                        btn.innerText = 'SAVE IMAGE';
                        btn.style.background = 'rgba(0,0,0,0.7)';
                    }, 2000);
                } catch (err) {
                    console.error('Save failed:', err);
                    btn.innerText = 'FAILED';
                    setTimeout(() => {
                        btn.innerText = 'SAVE IMAGE';
                    }, 2000);
                }
            };
        });
    }
}
