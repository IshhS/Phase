/* --------------------------------------------------------------
   Academic Project Document Bot (Interactive Generator)
   -------------------------------------------------------------- */

export async function initSync(app, user) {
    const token = localStorage.getItem('token');

    // --- 1. CONFIGURATION & STATE ---
    const PAGE_CONTAINER_ID = 'doc-page-container';

    // Sections the bot will guide the user through
    const SECTIONS_FLOW = [
        { key: 'architecture', label: 'System Architecture', type: 'image' },
        { key: 'introContent', label: 'Introduction', apiSection: 'introduction' },
        { key: 'objectivesContent', label: 'Objectives', apiSection: 'objectives' },
        { key: 'techStackContent', label: 'Technical Stack', apiSection: 'techStack' },
        { key: 'featuresContent', label: 'Features', apiSection: 'features' },
        { key: 'weeks', label: 'Weekly Progress', type: 'gallery' },
        { key: 'impactsContent', label: 'Impacts & Benefits', apiSection: 'impacts' },
        { key: 'conclusionContent', label: 'Conclusion', apiSection: 'conclusion' }
    ];

    const state = {
        mode: 'CHAT', // 'CHAT' or 'VIEWER'
        currentSectionIndex: 0,
        currentPage: 0,
        zoom: 0.8,
        architectureUploaded: false, // Flag for architecture upload

        // This object accumulates the approved data
        projectData: {
            projectTitle: '',
            teamName: '',
            teamMembers: [],
            institution: 'Department of Computer Engineering',
            academicYear: new Date().getFullYear() + '-' + (new Date().getFullYear() + 1),
            architecture: { diagramUrl: '' },
            weeks: {}
        },

        weekScreenshotsRaw: [], // Raw week data from API
        pagesHTML: [] // Final rendered pages
    };

    // --- 2. STYLES (Chat + Viewer) ---
    function injectStyles() {
        const styleId = 'bot-styles';
        if (document.getElementById(styleId)) return;

        const css = `
            /* --- Chat UI (Themed) --- */
            .message { display: flex; gap: 15px; animation: fadeIn 0.3s ease; max-width: 85%; margin-bottom: 2rem; }
            .message.bot { align-self: flex-start; }
            .message.user { align-self: flex-end; flex-direction: row-reverse; }

            .avatar { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800; flex-shrink: 0; font-family: 'Inter', sans-serif; font-size: 0.8rem; }
            .bot .avatar { background: #2ecc71; color: #000; box-shadow: 0 0 15px rgba(46, 204, 113, 0.3); }
            .user .avatar { background: #fff; color: #000; }

            .bubble { background: rgba(255,255,255,0.03); padding: 1.5rem; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); font-size: 0.95rem; line-height: 1.7; color: #e0e0e0; position: relative; backdrop-filter: blur(5px); }
            .bot .bubble { border-top-left-radius: 4px; border-left: 2px solid #2ecc71; }
            .user .bubble { border-top-right-radius: 4px; background: rgba(46, 204, 113, 0.1); border: 1px solid #2ecc71; color: #2ecc71; }

            /* Content Preview Box inside Chat */
            .content-preview { background: rgba(255,255,255,0.95); padding: 25px; margin-top: 15px; font-family: 'Times New Roman', serif; color: #000; font-size: 1rem; border-radius: 4px; box-shadow: 0 5px 20px rgba(0,0,0,0.3); }
            .content-preview h1, .content-preview h2, .content-preview h3 { margin-top: 0; color: #000; }

            .action-btn { background: #2ecc71; color: #000; border: none; padding: 10px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; margin-top: 15px; transition: 0.2s; display: inline-flex; align-items: center; gap: 8px; font-size: 0.85rem; letter-spacing: 0.5px; text-transform: uppercase; }
            .action-btn:hover { transform: translateY(-2px); box-shadow: 0 5px 15px rgba(46, 204, 113, 0.4); background: #27ae60; color: white; }
            .action-btn.secondary { background: rgba(255,255,255,0.1); color: #ccc; border: 1px solid rgba(255,255,255,0.2); }
            .action-btn.secondary:hover { background: rgba(255,255,255,0.2); color: white; }

            /* --- Viewer UI --- */
            .controls-bar { display: flex; gap: 10px; align-items: center; padding: 15px 25px; border-bottom: 1px solid rgba(255,255,255,0.1); background: rgba(0,0,0,0.2); }
            .controls-bar button { cursor: pointer; padding: 8px 16px; border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; background: rgba(255,255,255,0.05); color: white; font-weight: 600; font-size: 0.8rem; transition: 0.2s; }
            .controls-bar button:hover { background: rgba(255,255,255,0.1); }
            #doc-page-container { transition: transform 0.2s ease; box-shadow: 0 0 50px rgba(0,0,0,0.5); transform-origin: top center; background: white; margin-top: 30px; }

            /* A4 Page CSS - Adjusted margins for better centering */
            .a4-page { width: 210mm; height: 297mm; padding: 25.4mm; padding-left: 30mm; background: white; box-sizing: border-box; font-family: 'Times New Roman', serif; color: #000; position: relative; overflow: hidden; }
            .a4-page h1 { font-size: 24pt; color: #2ecc71; text-align: center; text-transform: uppercase; margin-bottom: 10mm; border-bottom: 2px solid #2ecc71; padding-bottom: 5mm; letter-spacing: 2px; }
            .a4-page h2 { font-size: 16pt; color: #27ae60; border-bottom: 1px solid #eee; margin-top: 8mm; padding-bottom: 2mm; text-transform: uppercase; }
            .a4-page h3 { font-size: 13pt; color: #333; margin-top: 6mm; font-weight: bold; }
            .a4-page p, .a4-page li { font-size: 11pt; line-height: 1.6; text-align: justify; margin-bottom: 4mm; color: #333; }
            
            .cover-page { display: flex; flex-direction: column; justify-content: center; align-items: center; text-align: center; border: 8px solid #2ecc71; }
            .cover-page h1 { border: none; font-size: 36pt; margin-bottom: 20mm; color: #000; font-weight: 900; }
            .cover-page .meta { margin-top: auto; margin-bottom: 20mm; width: 80%; border-top: 2px solid #2ecc71; border-bottom: 2px solid #2ecc71; padding: 15mm 0; background: transparent; }
            
            .diagram, .grid-item { margin: 10px 0; }
            .diagram img { max-width: 100%; max-height: 120mm; object-fit: contain; border: 1px solid #eee; }
            .caption { font-size: 9pt; color: #666; font-style: italic; margin-top: 3mm; text-align: center; }
            .grid-2x2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; margin-top: 10mm; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 8mm; margin-top: 10mm; }
            .grid-item { text-align: center; }
            .grid-item img { width: 100%; height: 60mm; object-fit: cover; border: 1px solid #eee; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }

            @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
            @keyframes blink { 0% { opacity: 0.2; } 50% { opacity: 1; } 100% { opacity: 0.2; } }
        `;
        const style = document.createElement('style');
        style.id = styleId;
        style.textContent = css;
        document.head.appendChild(style);
    }

    // --- 3. HELPER FUNCTIONS ---

    // Fetch specific section content from your backend
    async function fetchSectionContent(section, projectTitle, ideaText) {
        try {
            const res = await fetch('/api/idea/generate-content', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({ section, projectTitle, projectIdea: ideaText })
            });
            if (res.ok) {
                const data = await res.json();
                return data.content;
            }
        } catch (e) {
            console.error(e);
        }
        return "<p>Content unavailable. Please try regenerating.</p>";
    }

    async function loadMetaData() {
        // Fetch User Data
        const res = await fetch('/api/idea/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error("Failed to fetch project data");
        const ideaData = await res.json();
        state.ideaDataRaw = ideaData;

        // Extract Metadata
        const ideaText = ideaData.idea || "";
        let projectTitle = "Untitled Project";
        if (ideaText.includes('PROPOSED PROJECT TITLE:')) {
            projectTitle = ideaText.split('PROPOSED PROJECT TITLE:')[1].split('\n')[0].trim();
        } else if (ideaText.includes('Project:')) {
            projectTitle = ideaText.split('Project:')[1].trim();
        }

        const teammates = ideaData.teammates || [];
        const teamMembers = [ideaData.leader || 'Leader', ...teammates.map(t => t.username)];

        // Update State
        state.projectData.projectTitle = projectTitle;
        state.projectData.teamName = ideaData.teamName || 'Team Name';
        state.projectData.teamMembers = teamMembers;
        state.weekScreenshotsRaw = ideaData.weekSubmissions || [];

        // Handle Architecture Image
        if (ideaData.documentData && ideaData.documentData.architectureImage) {
            state.projectData.architecture.diagramUrl = ideaData.documentData.architectureImage;
        } else {
            console.log('Architecture image missing, will prompt in chat.');
        }

        return 'READY';
    }

    // --- 4. CHAT LOGIC ---

    function appendBotMessage(htmlContent) {
        const container = document.getElementById('chat-history');
        if (!container) return;
        const div = document.createElement('div');
        div.className = 'message bot';
        div.innerHTML = `
            <div class="avatar">AI</div>
            <div class="bubble">${htmlContent}</div>
        `;
        container.appendChild(div);
        window.scrollTo(0, document.body.scrollHeight);
    }

    function appendUserMessage(text) {
        const container = document.getElementById('chat-history');
        if (!container) return;
        const div = document.createElement('div');
        div.className = 'message user';
        div.innerHTML = `
            <div class="avatar">U</div>
            <div class="bubble">${text}</div>
        `;
        container.appendChild(div);
        window.scrollTo(0, document.body.scrollHeight);
    }

    async function processCurrentSection() {
        const sectionConfig = SECTIONS_FLOW[state.currentSectionIndex];

        // 1. Loading State
        const loadingId = 'loading-' + Date.now();
        appendBotMessage(`<div id="${loadingId}">Analyzing project requirements for <strong>${sectionConfig.label}</strong>... <span style="animation:blink 1s infinite">...</span></div>`);

        let content = '';

        // 2. Logic based on type
        if (sectionConfig.type === 'gallery') {
            // Weekly Screenshots
            const weeks = state.weekScreenshotsRaw;
            content = `
                <p>I found ${weeks.length} weekly submission screenshots. I will format them into a grid layout for pages 7 and 8.</p>
                <p>Ready to compile these?</p>
            `;
        } else if (sectionConfig.type === 'image') {
            // Architecture Image
            const archUrl = state.projectData.architecture.diagramUrl;

            // Common Upload UI Component
            const uploadUI = `
                <div style="margin-top: 15px; border-top: 1px dashed #ccc; padding-top: 15px;">
                    <p style="font-size: 0.9rem; margin-bottom: 5px;">${archUrl ? 'Upload a different diagram:' : 'Upload System Architecture Diagram:'}</p>
                    <input type="file" id="arch-upload-${state.currentSectionIndex}" accept="image/*" style="margin-bottom:10px; width: 100%;">
                    <button id="upload-arch-btn-${state.currentSectionIndex}" class="action-btn secondary" style="font-size: 0.8rem; padding: 5px 15px;">${archUrl ? 'Change Image' : 'Upload Image'}</button>
                    <div id="arch-preview-${state.currentSectionIndex}" style="text-align:center; margin-top:10px;"></div>
                </div>
            `;

            if (archUrl) {
                content = `
                    <div id="dynamic-content-${state.currentSectionIndex}">
                        <p>Here is your current system architecture diagram:</p>
                        <div style="text-align:center; margin:10px 0;">
                            <img src="${archUrl}" style="max-height:250px; border:1px solid #ccc; padding:5px; background: white;">
                        </div>
                        <p>Does this look correct for your document?</p>
                        ${uploadUI}
                    </div>
                `;
            } else {
                content = `
                    <div id="dynamic-content-${state.currentSectionIndex}">
                        <p>I need a System Architecture diagram to include in the report (Page 6).</p>
                        ${uploadUI}
                    </div>
                `;
            }
        } else {
            // Text Content (Fetch from API)
            const generatedHtml = await fetchSectionContent(
                sectionConfig.apiSection,
                state.projectData.projectTitle,
                state.ideaDataRaw.idea
            );

            // Contextual Image Trigger for certain text sections
            let imageTag = "";
            if (sectionConfig.apiSection === 'techStack') {
                imageTag = "<br><em></em><br>";
            }

            content = `
                <p>Here is the drafted content for <strong>${sectionConfig.label}</strong>:${imageTag}</p>
                <div class="content-preview" contenteditable="true" id="content-${state.currentSectionIndex}">${generatedHtml}<br><br></div>
                <p>Review and edit the content above as needed. You can also chat with me in the main chat to refine it.</p>
            `;

            // Store temporarily for the "Add" button to grab
            state.tempContent = generatedHtml;
        }

        // 3. Remove loading and show content with button
        const loadingEl = document.getElementById(loadingId);
        if (loadingEl) loadingEl.parentElement.parentElement.remove(); // Remove bubble

        const btnId = `btn-add-${state.currentSectionIndex}`;
        appendBotMessage(`
            ${content}
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button id="${btnId}" class="action-btn">
                    <span>➕</span> Add to Document
                </button>
            </div>
        `);

        // 4. Bind Button Clicks
        document.getElementById(btnId).onclick = function () {
            this.disabled = true;
            this.innerHTML = "✅ Added";
            this.classList.add('secondary');

            // Logic to save data
            if (sectionConfig.type === 'image') {
                // Already in state, just proceed
            } else if (sectionConfig.type === 'gallery') {
                // Map raw weeks to state structure
                const w = state.weekScreenshotsRaw;
                state.projectData.weeks = {
                    w1: { img: w[0]?.image || '', caption: w[0]?.title || 'Week 1' },
                    w2: { img: w[1]?.image || '', caption: w[1]?.title || 'Week 2' },
                    w3: { img: w[2]?.image || '', caption: w[2]?.title || 'Week 3' },
                    w4: { img: w[3]?.image || '', caption: w[3]?.title || 'Week 4' },
                    w5: { img: w[4]?.image || '', caption: w[4]?.title || 'Week 5' },
                    w6: { img: w[5]?.image || '', caption: w[5]?.title || 'Week 6' }
                };
            } else {
                // Save text content - get edited content from contenteditable div
                const editedContent = document.getElementById(`content-${state.currentSectionIndex}`).innerHTML;
                state.projectData[sectionConfig.key] = editedContent;
            }

            // Move to next
            state.currentSectionIndex++;
            if (state.currentSectionIndex < SECTIONS_FLOW.length) {
                setTimeout(processCurrentSection, 500);
            } else {
                finishChat();
            }
        };

        // Post-render logic: Disable "Add" button if image is missing
        if (sectionConfig.type === 'image' && !state.projectData.architecture.diagramUrl) {
            const addBtn = document.getElementById(btnId);
            if (addBtn) addBtn.disabled = true;
        }

        // 5. Bind Upload Button for Architecture Image (Always active if type is image)
        if (sectionConfig.type === 'image') {
            const uploadBtn = document.getElementById(`upload-arch-btn-${state.currentSectionIndex}`);
            const fileInput = document.getElementById(`arch-upload-${state.currentSectionIndex}`);
            const previewDiv = document.getElementById(`arch-preview-${state.currentSectionIndex}`);

            uploadBtn.onclick = async () => {
                const file = fileInput.files[0];
                if (!file) {
                    alert('Please select an image file first.');
                    return;
                }

                // Show loading state
                uploadBtn.disabled = true;
                uploadBtn.innerHTML = 'Uploading...';

                try {
                    const formData = new FormData();
                    formData.append('architectureImage', file);

                    const res = await fetch('/api/idea/upload-architecture', {
                        method: 'POST',
                        headers: { 'Authorization': `Bearer ${token}` },
                        body: formData
                    });

                    if (res.ok) {
                        const data = await res.json();
                        state.projectData.architecture.diagramUrl = data.filePath;

                        // Update preview - replaced by full content update below

                        // Update the content container to show the newly uploaded image
                        const dynamicContainer = document.getElementById(`dynamic-content-${state.currentSectionIndex}`);
                        if (dynamicContainer) {
                            dynamicContainer.innerHTML = `
                                <p>✅ I have uploaded your system architecture diagram.</p>
                                <div style="text-align:center; margin:10px 0;">
                                   <img src="${data.filePath}" style="max-height:200px; border:1px solid #ccc; padding:5px;">
                                </div>
                                <p>This will be added to Page 6.</p>
                            `;
                        }

                        // Enable the Add button
                        const addBtn = document.getElementById(btnId);
                        if (addBtn) {
                            addBtn.disabled = false;
                            addBtn.innerHTML = "<span>➕</span> Add to Document"; // Reset text just in case
                        }

                    } else {
                        throw new Error('Upload failed');
                    }
                } catch (e) {
                    console.error(e);
                    previewDiv.innerHTML = '<p style="color:#e74c3c;">❌ Upload failed. Please try again.</p>';
                }

                // Reset button
                uploadBtn.disabled = false;
                uploadBtn.innerHTML = 'Upload Image';
            };
        }


    }

    function finishChat() {
        appendBotMessage(`
            <h3>🎉 Documentation Complete!</h3>
            <p>I have gathered all the sections. Your 10-page academic report is ready to be compiled.</p>
            <button id="btn-generate-final" class="action-btn" style="background:#3498db;">
                📄 Generate & View PDF
            </button>
        `);
        document.getElementById('btn-generate-final').onclick = () => {
            buildPages();
            renderViewerUI();
        };
    }

    function renderChatUI() {
        injectStyles();
        app.innerHTML = `
            <nav class="navbar logged-in">
              <div id="nav-logo" class="nav-logo" style="cursor: pointer;">PHASE</div>
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
            <style>
                #chat-history::-webkit-scrollbar { width: 6px; }
                #chat-history::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.01); border-radius: 10px; }
                #chat-history::-webkit-scrollbar-thumb { background: rgba(46, 204, 113, 0.3); border-radius: 10px; }
                #chat-history::-webkit-scrollbar-thumb:hover { background: #2ecc71; }
            </style>
            <div class="chatbot-container glass" style="display: flex; flex-direction: column; height: 85vh; max-width: 1400px; margin: 30px auto; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.95); position: relative; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                
                <!-- Sidebar -->
                <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 280px; background: rgba(255,255,255,0.01); border-right: 1px solid rgba(255,255,255,0.05); padding: 2rem; display: flex; flex-direction: column; gap: 2rem;">
                    <h3 style="color: #2ecc71; font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase; font-family: 'Inter', sans-serif; font-weight: 700;">Documentation Hub</h3>
                    <div style="font-size: 0.75rem; color: #888;">
                        <p style="margin-bottom: 0.8rem; line-height: 1.5;">PROJECT<br><strong style="color:white; font-size:0.9rem;">${state.projectData.projectTitle}</strong></p>
                        <p style="margin-bottom: 0.8rem; line-height: 1.5;">TEAM<br><strong style="color:white; font-size:0.9rem;">${state.projectData.teamName}</strong></p>
                        <p style="margin-bottom: 0.8rem; line-height: 1.5;">PROGRESS<br><strong style="color:#2ecc71; font-size:0.9rem;">Section ${state.currentSectionIndex + 1} of ${SECTIONS_FLOW.length}</strong></p>
                    </div>
                    
                    <div style="margin-top:auto">
                         <button id="btn-exit" style="width: 100%; background: none; border: 1px solid rgba(255,255,255,0.1); color: #888; padding: 1rem; border-radius: 10px; cursor: pointer; font-size: 0.75rem; font-weight: 700; letter-spacing: 1px; transition:0.3s; text-transform: uppercase;">Exit & Save</button>
                    </div>
                </div>

                <!-- Main Content -->
                <div style="flex: 1; margin-left: 280px; display: flex; flex-direction: column; height: 100%;">
                    <!-- Header -->
                    <div style="padding: 1.5rem 3rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <div style="display: flex; align-items: center; gap: 1rem;">
                             <div style="width: 40px; height: 40px; background: #2ecc71; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #000; font-size: 1.2rem; box-shadow: 0 0 15px rgba(46, 204, 113, 0.3);">D</div>
                             <div>
                                <h2 style="margin: 0; color: #fff; font-family: 'Playfair Display', serif; font-size: 1.2rem; letter-spacing: 1px;">DOCUMENTATION WIZARD</h2>
                                <p style="margin: 0; font-size: 0.7rem; color: #2ecc71; letter-spacing: 1px; font-weight: 600;">TECHNICAL REPORT GENERATOR V1.0</p>
                             </div>
                        </div>
                    </div>

                    <!-- Chat History -->
                    <div id="chat-history" style="flex: 1; overflow-y: auto; padding: 3rem; display: flex; flex-direction: column; scroll-behavior: smooth;"></div>

                    <!-- Input Area -->
                    <div style="padding: 2rem 3rem; background: rgba(255,255,255,0.01); border-top: 1px solid rgba(255,255,255,0.05);">
                        <div style="display: flex; gap: 1rem; align-items: flex-end;">
                            <div style="flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 1rem; position: relative;">
                                <textarea id="chat-input" placeholder="Type instructions for the writer..." style="width: 100%; background: none; border: none; color: #fff; outline: none; resize: none; min-height: 24px; max-height: 120px; font-family: 'Inter', sans-serif; font-size: 0.95rem; line-height: 1.5;" rows="1"></textarea>
                            </div>
                            <button id="chat-send-btn" style="width: 50px; height: 50px; background: #2ecc71; color: #000; border: none; border-radius: 16px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; box-shadow: 0 4px 10px rgba(0,0,0,0.2);">
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Bind input events
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('chat-send-btn');

        input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendChatMessage();
            }
        });

        input.addEventListener('input', () => {
            input.style.height = 'auto';
            input.style.height = Math.min(input.scrollHeight, 120) + 'px';
        });

        sendBtn.onclick = sendChatMessage;

        // Generic UI
        const profileIcon = document.getElementById('profile-icon');
        const profileDropdown = document.getElementById('profile-dropdown');
        const profileName = document.getElementById('profile-name');
        const profileEmail = document.getElementById('profile-email');
        const profileTeam = document.getElementById('profile-team');

        const initials = (user.username || 'U').split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);
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
            import('./load.js').then(m => m.initLoad(app, user));
        };

        document.getElementById('nav-logo').onclick = () => {
            import('./home2.js').then(m => m.initHome2(app, user));
        };

        document.getElementById('btn-exit').onclick = () => {
            import('./home2.js').then(m => m.initHome2(app, user));
        };

        // Start Conversation
        appendBotMessage(`Hello! I am your Documentation Assistant. I see you are working on <strong>${state.projectData.projectTitle}</strong>.`);
        setTimeout(() => {
            appendBotMessage("I will generate the content for each section of your 10-page report. You can review and edit it, then click 'Add to Document' when ready.");
            setTimeout(processCurrentSection, 1000);
        }, 800);
    }

    function sendChatMessage() {
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('chat-send-btn');
        const message = input.value.trim();
        if (!message || input.disabled) return;

        // Disable input while processing
        input.disabled = true;
        sendBtn.disabled = true;

        // Add user message to chat
        appendUserMessage(message);
        input.value = '';
        input.style.height = 'auto';

        // Process the message
        processChatMessage(message);
    }

    async function processChatMessage(message) {
        const lowerMessage = message.toLowerCase();

        // Check if user wants to add to document
        if (lowerMessage.includes('add to document') || lowerMessage.includes('add it') || lowerMessage.includes('ready')) {
            // Find the current section's add button and trigger it
            const btnId = `btn-add-${state.currentSectionIndex}`;
            const addBtn = document.getElementById(btnId);
            if (addBtn && !addBtn.disabled) {
                addBtn.click();
            } else {
                appendBotMessage("There's no content ready to add right now. Please wait for the next section.");
            }
            // Re-enable input after processing
            const input = document.getElementById('chat-input');
            const sendBtn = document.getElementById('chat-send-btn');
            if (input) input.disabled = false;
            if (sendBtn) sendBtn.disabled = false;
            return;
        }

        // Check if there's current content to refine
        const contentDiv = document.getElementById(`content-${state.currentSectionIndex}`);
        if (!contentDiv) {
            appendBotMessage("I'm not currently working on any content to refine. Please wait for the next section.");
            // Re-enable input after processing
            const input = document.getElementById('chat-input');
            const sendBtn = document.getElementById('chat-send-btn');
            if (input) input.disabled = false;
            if (sendBtn) sendBtn.disabled = false;
            return;
        }

        // Show processing message
        appendBotMessage("⏳ Refining content...");

        try {
            const sectionConfig = SECTIONS_FLOW[state.currentSectionIndex];
            const currentContent = contentDiv.innerHTML;

            // Call API with refinement
            const res = await fetch('/api/idea/generate-content', {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    section: sectionConfig.apiSection,
                    projectTitle: state.projectData.projectTitle,
                    projectIdea: state.ideaDataRaw.idea,
                    userMessage: message,
                    existingContent: currentContent
                })
            });

            if (res.ok) {
                const data = await res.json();
                // Update the content preview
                contentDiv.innerHTML = data.content;
                appendBotMessage(`✅ Content refined! Review the updated content above. You can continue refining or say "add to document" when ready.`);
            } else {
                throw new Error('Failed to refine content');
            }
        } catch (e) {
            console.error(e);
            appendBotMessage(`❌ Sorry, there was an error refining the content. Please try again.`);
        }

        // Re-enable input after processing
        const input = document.getElementById('chat-input');
        const sendBtn = document.getElementById('chat-send-btn');
        if (input) input.disabled = false;
        if (sendBtn) sendBtn.disabled = false;
    }




    // --- 5. PAGE BUILDING (Final Step) ---
    function buildPages() {
        const d = state.projectData;

        // 1. Cover
        const p1 = `<div class="a4-page cover-page"><div style="margin-top:40mm"><div style="font-size:1.2rem; color:#888; letter-spacing:2px;">ACADEMIC PROJECT REPORT</div><h1>${d.projectTitle}</h1></div><div class="meta"><h2>${d.teamName}</h2><p><strong>Members:</strong><br/>${d.teamMembers.join('<br/>')}</p><p style="margin-top:10mm"><strong>${d.institution}</strong></p><p>Academic Year: ${d.academicYear}</p></div></div>`;
        // 2-5 Text Pages
        const p2 = `<div class="a4-page"><h1>Introduction</h1><div class="content">${d.introContent}</div><div style="position:absolute; bottom:10mm; right:10mm">Page 2</div></div>`;
        const p3 = `<div class="a4-page"><h1>Objectives</h1><div class="content">${d.objectivesContent}</div><div style="position:absolute; bottom:10mm; right:10mm">Page 3</div></div>`;
        const p4 = `<div class="a4-page"><h1>Technical Stack</h1><div class="content">${d.techStackContent}</div><div style="position:absolute; bottom:10mm; right:10mm">Page 4</div></div>`;
        const p5 = `<div class="a4-page"><h1>Features & Functionality</h1><div class="content">${d.featuresContent}</div><div style="position:absolute; bottom:10mm; right:10mm">Page 5</div></div>`;
        // 6. Architecture
        const p6 = `<div class="a4-page"><h1>System Architecture</h1><div class="content" style="justify-content:center; align-items:center;"><div class="diagram"><img src="${d.architecture.diagramUrl}" /><p class="caption">Figure: System Architecture Diagram</p></div></div><div style="position:absolute; bottom:10mm; right:10mm">Page 6</div></div>`;
        // 7-8 Weeks
        const p7 = `<div class="a4-page"><h1>Weekly Progress (1-4)</h1><div class="grid-2x2"><div class="grid-item"><img src="${d.weeks.w1.img}" /><p class="caption">${d.weeks.w1.caption}</p></div><div class="grid-item"><img src="${d.weeks.w2.img}" /><p class="caption">${d.weeks.w2.caption}</p></div><div class="grid-item"><img src="${d.weeks.w3.img}" /><p class="caption">${d.weeks.w3.caption}</p></div><div class="grid-item"><img src="${d.weeks.w4.img}" /><p class="caption">${d.weeks.w4.caption}</p></div></div><div style="position:absolute; bottom:10mm; right:10mm">Page 7</div></div>`;
        const p8 = `<div class="a4-page"><h1>Weekly Progress (5-6)</h1><div class="grid-2"><div class="grid-item"><img src="${d.weeks.w5.img}" /><p class="caption">${d.weeks.w5.caption}</p></div><div class="grid-item"><img src="${d.weeks.w6.img}" /><p class="caption">${d.weeks.w6.caption}</p></div></div><div style="position:absolute; bottom:10mm; right:10mm">Page 8</div></div>`;
        // 9-10 Text Pages
        const p9 = `<div class="a4-page"><h1>Impacts & Benefits</h1><div class="content">${d.impactsContent}</div><div style="position:absolute; bottom:10mm; right:10mm">Page 9</div></div>`;
        const p10 = `<div class="a4-page"><h1>Conclusion</h1><div class="content">${d.conclusionContent}</div><div style="position:absolute; bottom:10mm; right:10mm">Page 10</div></div>`;

        state.pagesHTML = [p1, p2, p3, p4, p5, p6, p7, p8, p9, p10];
    }

    // --- 6. VIEWER UI ---
    function renderViewerUI() {
        app.innerHTML = `
            <div class="chatbot-container glass" style="display: flex; flex-direction: column; height: 90vh; max-width: 1400px; margin: 30px auto; border-radius: 20px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.95); position: relative; box-shadow: 0 20px 50px rgba(0,0,0,0.5);">
                 <!-- Header / Controls -->
                 <div style="padding: 1rem 2rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05); background: rgba(0,0,0,0.2);">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <button id="btn-back-chat" style="background:none; border:none; color:white; font-size:1.2rem; cursor:pointer; opacity:0.8;">←</button>
                        <h3 style="margin:0; color:#fff; font-size:1rem; text-transform:uppercase; letter-spacing:1px;">PDF PREVIEW</h3>
                    </div>
                    
                    <div class="controls-bar" style="background:transparent; border:none; padding:0; margin:0;">
                         <button id="btn-prev">Previous</button>
                         <span id="page-info" style="color:white; font-size:0.9rem; min-width:80px; text-align:center;">Page 1 / 10</span>
                         <button id="btn-next">Next</button>
                         <div style="width:1px; height:20px; background:rgba(255,255,255,0.2); margin:0 10px;"></div>
                         <button id="btn-zoom-out">−</button>
                         <span id="zoom-info" style="color:white; font-size:0.9rem; min-width:50px; text-align:center;">${Math.round(state.zoom * 100)}%</span>
                         <button id="btn-zoom-in">+</button>
                    </div>

                    <div style="display:flex; gap:10px;">
                        <button id="btn-download-pdf" style="background:#e74c3c; color:white; border:none; padding:8px 20px; border-radius:8px; font-weight:700; cursor:pointer; transition:0.2s;">DOWNLOAD PDF</button>
                        <button id="btn-complete-stage" style="background:#2ecc71; color:white; border:none; padding:8px 20px; border-radius:8px; font-weight:700; cursor:pointer; transition:0.2s; box-shadow: 0 0 15px rgba(46, 204, 113, 0.4);">✓ COMPLETE STAGE</button>
                    </div>
                 </div>

                 <!-- Viewer Area -->
                 <div style="flex:1; overflow:hidden; position:relative; background: #333;">
                    <div style="overflow:auto; height:100%; width:100%; display:flex; justify-content:center; padding:50px;">
                        <div id="doc-page-container"></div>
                    </div>
                 </div>
            </div>
        `;

        document.getElementById('btn-back-chat').onclick = renderChatUI;
        document.getElementById('btn-prev').onclick = () => { if (state.currentPage > 0) { state.currentPage--; updatePage(); } };
        document.getElementById('btn-next').onclick = () => { if (state.currentPage < 9) { state.currentPage++; updatePage(); } };
        document.getElementById('btn-zoom-in').onclick = () => { state.zoom += 0.1; updatePage(); };
        document.getElementById('btn-zoom-out').onclick = () => { state.zoom -= 0.1; updatePage(); };
        document.getElementById('btn-download-pdf').onclick = exportAsPDF;
        document.getElementById('btn-complete-stage').onclick = async () => {
            const btn = document.getElementById('btn-complete-stage');
            btn.disabled = true;
            btn.innerHTML = 'SAVING...';

            try {
                // Construct documentData from state
                const d = state.projectData;
                const documentData = {
                    introduction: d.introContent,
                    objectives: d.objectivesContent,
                    scope: 'See Objectives', // Mapping mismatch potential, but keeping simple
                    technicalStack: d.techStackContent,
                    features: d.featuresContent,
                    architecture: d.architecture.diagramUrl, // Or full text if we had it
                    impact: d.impactsContent,
                    conclusion: d.conclusionContent,
                    architectureImage: d.architecture.diagramUrl
                };

                const res = await fetch('/api/idea/save-documentation', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                    body: JSON.stringify({ documentData })
                });

                if (res.ok) {
                    alert('Stage 6 Completed! Redirecting to Dashboard...');
                    import('./home2.js').then(m => m.initHome2(app, user));
                } else {
                    throw new Error('Save failed');
                }
            } catch (e) {
                console.error(e);
                alert('Failed to save completion status.');
                btn.disabled = false;
                btn.innerHTML = '✓ COMPLETE STAGE';
            }
        };

        updatePage();
    }

    function updatePage() {
        const container = document.getElementById(PAGE_CONTAINER_ID);
        if (container) {
            container.innerHTML = state.pagesHTML[state.currentPage];
            container.style.transform = `scale(${state.zoom})`;
            container.style.width = '210mm';
            container.style.height = '297mm';
            document.getElementById('page-info').textContent = `Page ${state.currentPage + 1} / 10`;
            document.getElementById('zoom-info').textContent = `${Math.round(state.zoom * 100)}%`;
        }
    }

    // --- 7. PDF EXPORT ---
    async function exportAsPDF() {
        const btn = document.getElementById('btn-download-pdf');
        btn.innerText = "Generating...";
        btn.disabled = true;

        try {
            const [{ jsPDF }, { default: html2canvas }] = await Promise.all([
                import('jspdf'),
                import('html2canvas')
            ]);

            const pdf = new jsPDF({ unit: 'mm', format: [210, 297] });

            for (let i = 0; i < state.pagesHTML.length; i++) {
                const tempDiv = document.createElement('div');
                tempDiv.style.position = 'fixed'; tempDiv.style.left = '-10000px';
                tempDiv.style.width = '210mm'; tempDiv.style.height = '297mm';
                tempDiv.className = 'a4-page';
                tempDiv.innerHTML = state.pagesHTML[i];
                document.body.appendChild(tempDiv);

                const canvas = await html2canvas(tempDiv, { scale: 2, useCORS: true });
                if (i > 0) pdf.addPage();
                pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, 210, 297);
                document.body.removeChild(tempDiv);
            }
            pdf.save(`${state.projectData.projectTitle}_Report.pdf`);
        } catch (error) {
            console.error('PDF Generation Error:', error);
            alert('Failed to generate PDF. Please try again or check console for details.');
        } finally {
            btn.innerText = "Download PDF";
            btn.disabled = false;
        }
    }

    // --- 8. INITIALIZATION ---
    async function init() {
        // Loading Screen - Consistent Glass Theme
        app.innerHTML = `
            <div style="height:100vh; display:flex; flex-direction:column; justify-content:center; align-items:center; color:white;">
                <div class="glass" style="padding:40px; border-radius:20px; text-align:center; border: 1px solid rgba(255,255,255,0.1);">
                    <div style="font-size:3rem; margin-bottom:20px; animation:bounce 2s infinite;">📄</div>
                    <h2 style="margin:0; font-family:'Playfair Display',serif;">INITIALIZING DOCUMENTATION</h2>
                    <p style="color:#888; margin-top:10px;">Connecting to Project Database...</p>
                </div>
            </div>
        `;

        try {
            const status = await loadMetaData();
            if (status === 'UPLOAD_REQUIRED') {
                // Simplified Upload UI for brevity
                app.innerHTML = `<div style="padding:50px; text-align:center; color:white;"><h2>Architecture Missing</h2><p>Please upload it in the dashboard first.</p></div>`;
            } else {
                renderChatUI();
            }
        } catch (e) {
            app.innerHTML = `
                <div style="height:100vh; display:flex; justify-content:center; align-items:center; color:white;">
                    <div class="glass" style="padding:40px; border-radius:20px; text-align:center; border: 1px solid rgba(255,50,50,0.3);">
                        <h2 style="color:#e74c3c;">Connection Error</h2>
                        <p>${e.message}</p>
                        <button onclick="window.location.reload()" style="margin-top:20px; padding:10px 20px; background:#fff; border:none; border-radius:5px; cursor:pointer;">Retry</button>
                    </div>
                </div>
            `;
        }
    }

    init();
}