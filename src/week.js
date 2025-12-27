export async function initWeek(app, user) {
    const token = localStorage.getItem('token');
    let weekData = null;

    // Fetch existing week submission data
    try {
        const res = await fetch('/api/idea/me', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            const idea = await res.json();
            weekData = idea.weekSubmissions || [];
        }
    } catch (err) {
        console.error("Failed to fetch week data", err);
    }

    // Initialize week data structure if empty
    if (!weekData || weekData.length === 0) {
        weekData = [
            { week: 1, title: 'Week 1: Foundation Setup', image: '', gitRepo: '', status: 'pending' },
            { week: 2, title: 'Week 2: Core Module Development', image: '', gitRepo: '', status: 'pending' },
            { week: 3, title: 'Week 3: Feature Integration', image: '', gitRepo: '', status: 'pending' },
            { week: 4, title: 'Week 4: Advanced Features', image: '', gitRepo: '', status: 'pending' },
            { week: 5, title: 'Week 5: Testing & Refinement', image: '', gitRepo: '', status: 'pending' },
            { week: 6, title: 'Week 6: Final Deployment', image: '', gitRepo: '', deployedLink: '', videoLink: '', status: 'pending' }
        ];
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
                            <button id="logout-btn" class="logout-btn">LOGOUT</button>
                        </div>
                    </div>
                </div>
            </nav>

            <!-- Weekly Execution Section -->
            <section class="content-section" id="weeks" style="padding: 60px 0 100px 0; background: transparent;">
                <div class="steps-wrapper glass" style="background: rgba(0, 0, 0, 0.85); margin: 0 4rem 4rem 4rem; padding: 4rem; border-radius: 40px; box-shadow: 0 20px 50px rgba(0,0,0,0.5); border: 1px solid rgba(255,255,255,0.05); position: relative;">
                    
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 3rem;">
                        <div>
                            <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 0.5rem;">
                                <span style="font-size: 0.75rem; letter-spacing: 4px; color: #2ecc71; font-weight: 900; text-transform: uppercase;">Step 05</span>
                                <span style="width: 40px; height: 1px; background: #2ecc71; opacity: 0.3;"></span>
                            </div>
                            <h2 class="section-title" style="margin: 0; text-align: left;">6-WEEK EXECUTION PIPELINE</h2>
                            <p style="color: #666; margin-top: 1rem; font-size: 0.9rem;">Track your weekly progress with structured submissions</p>
                        </div>
                        <a href="#" id="back-to-roadmap" style="color: #888; text-decoration: none; font-size: 0.7rem; letter-spacing: 3px; font-weight: 800; text-transform: uppercase; transition: 0.3s; padding: 12px 25px; border: 1px solid rgba(255,255,255,0.1); border-radius: 30px; background: rgba(0,0,0,0.3);">
                            ← EXIT EXECUTION
                        </a>
                    </div>

                    <div class="steps-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5rem; margin-bottom: 3rem;">
                        ${weekData.slice(0, 3).map((week, idx) => `
                            <div class="week-card ${week.status === 'submitted' ? 'completed' : ''}" id="week-${week.week}" style="cursor: pointer; position: relative;">
                                <div class="step-number" style="background: ${week.status === 'submitted' ? 'var(--accent)' : 'rgba(255,255,255,0.05)'};">
                                    ${week.status === 'submitted' ? '✓' : `W${week.week}`}
                                </div>
                                <div class="step-title">${week.title}</div>
                                <div class="step-desc" style="font-size: 0.75rem; color: ${week.status === 'submitted' ? '#2ecc71' : '#666'};">
                                    ${week.status === 'submitted' ? 'Submitted ✓' : 'Pending Submission'}
                                </div>
                            </div>
                        `).join('')}
                    </div>

                    <div class="steps-grid" style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 2.5rem;">
                        ${weekData.slice(3, 6).map((week, idx) => `
                            <div class="week-card ${week.status === 'submitted' ? 'completed' : ''}" id="week-${week.week}" style="cursor: pointer; position: relative;">
                                <div class="step-number" style="background: ${week.status === 'submitted' ? 'var(--accent)' : 'rgba(255,255,255,0.05)'};">
                                    ${week.status === 'submitted' ? '✓' : `W${week.week}`}
                                </div>
                                <div class="step-title">${week.title}</div>
                                <div class="step-desc" style="font-size: 0.75rem; color: ${week.status === 'submitted' ? '#2ecc71' : '#666'};">
                                    ${week.status === 'submitted' ? 'Submitted ✓' : week.week === 6 ? 'Final Submission' : 'Pending Submission'}
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            </section>
        </div>

        <!-- Submission Modal -->
        <div id="submission-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.95); backdrop-filter: blur(10px); z-index: 10000; align-items: center; justify-content: center; padding: 2rem; overflow-y: auto;">
            <div class="glass" style="width: 100%; max-width: 700px; background: rgba(0,0,0,0.95); border-radius: 30px; border: 1px solid rgba(255,255,255,0.1); padding: 3rem; position: relative;">
                <button id="close-modal" style="position: absolute; top: 20px; right: 20px; background: rgba(255,255,255,0.1); color: #fff; border: none; width: 40px; height: 40px; border-radius: 50%; cursor: pointer; font-size: 1.5rem;">×</button>
                <div id="modal-content"></div>
            </div>
        </div>
    `;

    // Profile Logic
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

    document.getElementById('back-to-roadmap').onclick = (e) => {
        e.preventDefault();
        window.location.reload();
    };

    // Week Card Click Handlers
    const modal = document.getElementById('submission-modal');
    const modalContent = document.getElementById('modal-content');
    const closeBtn = document.getElementById('close-modal');

    weekData.forEach((week, idx) => {
        const card = document.getElementById(`week-${week.week}`);
        card.onclick = () => openSubmissionModal(week);
    });

    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };

    modal.onclick = (e) => {
        if (e.target === modal) {
            modal.style.display = 'none';
        }
    };

    function openSubmissionModal(week) {
        const isWeek6 = week.week === 6;
        const isSubmitted = week.status === 'submitted';

        modalContent.innerHTML = `
            <div style="margin-bottom: 2rem;">
                <div style="display: flex; align-items: center; gap: 1rem; margin-bottom: 1rem;">
                    <div style="width: 50px; height: 50px; background: ${isSubmitted ? 'var(--accent)' : 'rgba(255,255,255,0.05)'}; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: ${isSubmitted ? '#000' : '#fff'}; font-size: 1.2rem;">
                        ${isSubmitted ? '✓' : `W${week.week}`}
                    </div>
                    <div>
                        <div style="font-size: 0.65rem; color: #666; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">WEEK ${week.week} SUBMISSION</div>
                        <h3 style="color: #fff; font-family: 'Playfair Display', serif; font-size: 1.8rem; margin: 0.3rem 0 0 0;">${week.title}</h3>
                    </div>
                </div>
            </div>

            <form id="submission-form" style="display: flex; flex-direction: column; gap: 1.5rem;">
                <!-- Screenshot Upload -->
                <div class="glass-input-group">
                    <label style="color: #666; font-size: 0.75rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 1rem; display: block;">
                        Project Screenshot / Progress Image
                    </label>
                    ${!isSubmitted ? `
                        <input type="file" id="image-upload" accept="image/*" style="display: none;">
                        <div id="upload-area" style="border: 2px dashed rgba(255,255,255,0.2); border-radius: 12px; padding: 2rem; text-align: center; cursor: pointer; transition: 0.3s; background: rgba(255,255,255,0.02);">
                            <div id="preview-container" style="display: ${week.image ? 'block' : 'none'};">
                                <img id="image-preview" src="${week.image || ''}" style="max-width: 100%; max-height: 300px; border-radius: 10px; margin-bottom: 1rem;">
                                <div style="color: #2ecc71; font-size: 0.85rem; font-weight: 700;">✓ Image Loaded</div>
                            </div>
                            <div id="upload-prompt" style="display: ${week.image ? 'none' : 'block'};">
                                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.3)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin: 0 auto 1rem;">
                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                    <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                    <polyline points="21 15 16 10 5 21"></polyline>
                                </svg>
                                <div style="color: #888; font-size: 0.9rem; margin-bottom: 0.5rem;">Click to upload image</div>
                                <div style="color: #555; font-size: 0.75rem;">PNG, JPG, JPEG (Max 50MB)</div>
                            </div>
                        </div>
                    ` : `
                        <div style="border: 2px solid rgba(255,255,255,0.1); border-radius: 12px; padding: 1rem; background: rgba(255,255,255,0.02);">
                            <img src="${week.image}" style="max-width: 100%; max-height: 300px; border-radius: 10px; display: block; margin: 0 auto;">
                        </div>
                    `}
                    <p style="color: #555; font-size: 0.7rem; margin-top: 0.5rem;">Upload a screenshot showing your weekly progress</p>
                </div>

                <!-- Git Repository -->
                <div class="glass-input-group">
                    <label style="color: #666; font-size: 0.75rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 1rem; display: block;">
                        GitHub Repository Link
                    </label>
                    <input type="url" id="git-repo" value="${week.gitRepo || ''}" placeholder="https://github.com/username/project" class="glass-input" style="background: rgba(255,255,255,0.02); color: #fff; border-color: rgba(255,255,255,0.08); padding: 1.2rem; font-size: 0.95rem; border-radius: 12px;" ${isSubmitted ? 'readonly' : ''}>
                    <p style="color: #555; font-size: 0.7rem; margin-top: 0.5rem;">Ensure your repository is public and pushed to GitHub</p>
                </div>

                ${isWeek6 ? `
                    <!-- Deployed Link (Week 6 Only) -->
                    <div class="glass-input-group">
                        <label style="color: #666; font-size: 0.75rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 1rem; display: block;">
                            Deployed / Hosted Project Link
                        </label>
                        <input type="url" id="deployed-link" value="${week.deployedLink || ''}" placeholder="https://your-project.vercel.app" class="glass-input" style="background: rgba(255,255,255,0.02); color: #fff; border-color: rgba(255,255,255,0.08); padding: 1.2rem; font-size: 0.95rem; border-radius: 12px;" ${isSubmitted ? 'readonly' : ''}>
                        <p style="color: #555; font-size: 0.7rem; margin-top: 0.5rem;">Deploy to Vercel, Netlify, Heroku, or any hosting platform</p>
                    </div>

                    <!-- Video Explanation (Week 6 Only) -->
                    <div class="glass-input-group">
                        <label style="color: #666; font-size: 0.75rem; font-weight: 800; letter-spacing: 2px; text-transform: uppercase; margin-bottom: 1rem; display: block;">
                            Video Explanation Link (Min 2 minutes)
                        </label>
                        <input type="url" id="video-link" value="${week.videoLink || ''}" placeholder="https://youtube.com/watch?v=..." class="glass-input" style="background: rgba(255,255,255,0.02); color: #fff; border-color: rgba(255,255,255,0.08); padding: 1.2rem; font-size: 0.95rem; border-radius: 12px;" ${isSubmitted ? 'readonly' : ''}>
                        <p style="color: #555; font-size: 0.7rem; margin-top: 0.5rem;">Upload to YouTube, Loom, or Google Drive and share the link</p>
                    </div>
                ` : ''}

                ${!isSubmitted ? `
                    <div style="display: flex; gap: 1rem; margin-top: 1rem;">
                        ${isWeek6 ? `
                            <button type="button" id="back-btn" style="flex: 1; background: rgba(255,255,255,0.05); color: #888; border: 1px solid rgba(255,255,255,0.1); padding: 1.5rem; border-radius: 18px; font-weight: 800; cursor: pointer; transition: 0.3s; letter-spacing: 1px; font-size: 0.85rem;">
                                ← BACK
                            </button>
                        ` : ''}
                        <button type="submit" class="submit-btn" style="flex: ${isWeek6 ? '2' : '1'}; background: #2ecc71; color: #fff; border: none; padding: 1.5rem; border-radius: 18px; font-weight: 900; cursor: pointer; transition: 0.3s; letter-spacing: 1.5px; font-size: 0.9rem;">
                            SUBMIT WEEK ${week.week}
                        </button>
                    </div>
                ` : `
                    <div style="background: rgba(46, 204, 113, 0.1); border: 1px solid #2ecc71; padding: 1.5rem; border-radius: 18px; text-align: center; color: #2ecc71; font-weight: 800; letter-spacing: 1px; margin-top: 1rem;">
                        ✓ WEEK ${week.week} SUBMITTED SUCCESSFULLY
                    </div>
                `}
            </form>
        `;

        modal.style.display = 'flex';

        // File Upload Handlers
        if (!isSubmitted) {
            const fileInput = document.getElementById('image-upload');
            const uploadArea = document.getElementById('upload-area');
            const previewContainer = document.getElementById('preview-container');
            const uploadPrompt = document.getElementById('upload-prompt');
            const imagePreview = document.getElementById('image-preview');
            let uploadedImageBase64 = week.image || '';

            // Click to upload
            uploadArea.onclick = () => {
                fileInput.click();
            };

            // File selection handler
            fileInput.onchange = (e) => {
                const file = e.target.files[0];
                if (file) {
                    handleImageUpload(file);
                }
            };

            // Drag and drop
            uploadArea.ondragover = (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'var(--accent)';
                uploadArea.style.background = 'rgba(201,176,55,0.05)';
            };

            uploadArea.ondragleave = () => {
                uploadArea.style.borderColor = 'rgba(255,255,255,0.2)';
                uploadArea.style.background = 'rgba(255,255,255,0.02)';
            };

            uploadArea.ondrop = (e) => {
                e.preventDefault();
                uploadArea.style.borderColor = 'rgba(255,255,255,0.2)';
                uploadArea.style.background = 'rgba(255,255,255,0.02)';

                const file = e.dataTransfer.files[0];
                if (file && file.type.startsWith('image/')) {
                    handleImageUpload(file);
                }
            };

            function handleImageUpload(file) {
                // Validate file size (50MB max for upload, will be compressed)
                if (file.size > 50 * 1024 * 1024) {
                    alert('Image size must be less than 50MB');
                    return;
                }

                // Validate file type
                if (!file.type.startsWith('image/')) {
                    alert('Please upload an image file (PNG, JPG, JPEG)');
                    return;
                }

                // Compress and convert to base64
                const reader = new FileReader();
                reader.onload = (e) => {
                    const img = new Image();
                    img.onload = () => {
                        // Create canvas for compression
                        const canvas = document.createElement('canvas');
                        const ctx = canvas.getContext('2d');

                        // Calculate new dimensions (max 1920x1080 for quality balance)
                        let width = img.width;
                        let height = img.height;
                        const maxWidth = 1920;
                        const maxHeight = 1080;

                        if (width > maxWidth || height > maxHeight) {
                            const ratio = Math.min(maxWidth / width, maxHeight / height);
                            width = width * ratio;
                            height = height * ratio;
                        }

                        canvas.width = width;
                        canvas.height = height;

                        // Draw and compress
                        ctx.drawImage(img, 0, 0, width, height);

                        // Convert to base64 with compression (0.7 quality for good balance)
                        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);

                        // Check if still too large (MongoDB has 16MB limit, leave buffer)
                        const sizeInMB = (compressedBase64.length * 3) / 4 / (1024 * 1024);
                        if (sizeInMB > 10) {
                            // Try higher compression
                            const moreCompressed = canvas.toDataURL('image/jpeg', 0.5);
                            uploadedImageBase64 = moreCompressed;
                        } else {
                            uploadedImageBase64 = compressedBase64;
                        }

                        imagePreview.src = uploadedImageBase64;
                        previewContainer.style.display = 'block';
                        uploadPrompt.style.display = 'none';

                        console.log(`Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${sizeInMB.toFixed(2)}MB`);
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }
        }

        // Back button handler for Week 6
        if (isWeek6 && !isSubmitted) {
            const backBtn = document.getElementById('back-btn');
            if (backBtn) {
                backBtn.onclick = () => {
                    modal.style.display = 'none';
                };
            }
        }

        if (!isSubmitted) {
            const form = document.getElementById('submission-form');
            form.onsubmit = async (e) => {
                e.preventDefault();
                await submitWeek(week.week, isWeek6);
            };
        }
    }

    async function submitWeek(weekNum, isWeek6) {
        // Get the uploaded image from the closure
        const imagePreview = document.getElementById('image-preview');
        const imageData = imagePreview?.src || '';

        const gitRepo = document.getElementById('git-repo').value.trim();
        const deployedLink = isWeek6 ? document.getElementById('deployed-link').value.trim() : '';
        const videoLink = isWeek6 ? document.getElementById('video-link').value.trim() : '';

        // Validation
        if (!imageData || !gitRepo) {
            alert('Please upload an image and provide a GitHub repository link.');
            return;
        }

        if (isWeek6 && (!deployedLink || !videoLink)) {
            alert('Week 6 requires deployed link and video explanation.');
            return;
        }

        const submitBtn = document.querySelector('#submission-form button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.innerText = 'SUBMITTING...';

        try {
            const res = await fetch('/api/idea/submit-week', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    week: weekNum,
                    image: imageData,
                    gitRepo,
                    deployedLink,
                    videoLink
                })
            });

            if (res.ok) {
                alert(`Week ${weekNum} submitted successfully!`);
                window.location.reload();
            } else {
                throw new Error('Submission failed');
            }
        } catch (err) {
            console.error(err);
            alert('Submission failed. Please try again.');
            submitBtn.disabled = false;
            submitBtn.innerText = `SUBMIT WEEK ${weekNum}`;
        }
    }
}
