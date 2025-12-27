export async function initChatbot(app, user) {
    const token = localStorage.getItem('token');

    // Initial UI Setup
    app.innerHTML = `
        <style>
            #chat-messages::-webkit-scrollbar {
                width: 6px;
            }
            #chat-messages::-webkit-scrollbar-track {
                background: rgba(255, 255, 255, 0.01);
                border-radius: 10px;
            }
            #chat-messages::-webkit-scrollbar-thumb {
                background: rgba(201, 176, 55, 0.3);
                border-radius: 10px;
            }
            #chat-messages::-webkit-scrollbar-thumb:hover {
                background: var(--accent);
            }
        </style>
        <div class="chatbot-container glass" style="display: flex; flex-direction: column; height: 85vh; max-width: 1100px; margin: 30px auto; border-radius: 35px; overflow: hidden; border: 1px solid rgba(255,255,255,0.08); background: rgba(0,0,0,0.98); position: relative;">
            
            <!-- Sidebar: Project Context -->
            <div style="position: absolute; left: 0; top: 0; bottom: 0; width: 250px; background: rgba(255,255,255,0.01); border-right: 1px solid rgba(255,255,255,0.05); padding: 2rem; display: flex; flex-direction: column; gap: 2rem;">
                <h3 style="color: var(--accent); font-size: 0.8rem; letter-spacing: 2px; text-transform: uppercase;">Session Info</h3>
                <div style="font-size: 0.75rem; color: #888;">
                    <p style="margin-bottom: 0.5rem;">User: <strong>${user.username}</strong></p>
                    <p style="margin-bottom: 0.5rem;">Model: <strong>GPT-OSS 120B</strong></p>
                    <p style="margin-bottom: 0.5rem;">Phase: <strong>Identify</strong></p>
                </div>
                <div style="margin-top: auto;">
                   <button id="exit-chatbot" style="width: 100%; background: none; border: 1px solid rgba(255,255,255,0.1); color: #666; padding: 1rem; border-radius: 12px; cursor: pointer; font-size: 0.75rem; font-weight: bold; letter-spacing: 1px;">EXIT TUNNEL</button>
                </div>
            </div>

            <div style="flex: 1; margin-left: 250px; display: flex; flex-direction: column; height: 100%;">
                <!-- Header -->
                <div class="chatbot-header" style="background: rgba(201, 176, 55, 0.03); padding: 1.5rem 3rem; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div style="display: flex; align-items: center; gap: 1.2rem;">
                        <div style="width: 45px; height: 45px; background: var(--accent); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #000; font-size: 1.2rem; box-shadow: 0 0 20px rgba(201, 176, 55, 0.2);">A</div>
                        <div>
                            <h2 style="margin: 0; color: #fff; font-family: 'Playfair Display', serif; font-size: 1.3rem; letter-spacing: 1px;">PHASE ARCHITECT (120B)</h2>
                            <p style="margin: 0; font-size: 0.7rem; color: #2ecc71; letter-spacing: 1px;">SYSTEM STATUS: OPTIMIZED</p>
                        </div>
                    </div>
                    <div>
                        <button id="manual-lock-trigger" style="background: rgba(46, 204, 113, 0.1); color: #2ecc71; border: 1px solid #2ecc71; padding: 0.6rem 1.2rem; border-radius: 8px; font-size: 0.75rem; font-weight: 800; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: 0.3s;">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                            MANUAL LOCK
                        </button>
                    </div>
                </div>

                <!-- Manual Lock Modal -->
                <div id="manual-lock-modal" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(5px); z-index: 10000; align-items: center; justify-content: center;">
                    <div class="glass" style="width: 400px; padding: 2rem; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); text-align: center;">
                        <h3 style="color: var(--accent); font-family: 'Playfair Display', serif; margin-bottom: 1rem;">SECURE YOUR OBJECTIVE</h3>
                        <p style="color: #888; font-size: 0.85rem; margin-bottom: 1.5rem;">Enter the final project title you wish to lock into your Phase Roadmap.</p>
                        <input type="text" id="manual-title-input" placeholder="e.g. SMART INDUSTRIAL GRABBER" style="width: 100%; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.1); padding: 1rem; border-radius: 10px; color: #fff; margin-bottom: 1.5rem; outline: none; text-align: center; font-weight: 700;">
                        <div style="display: flex; gap: 10px;">
                            <button id="cancel-manual" style="flex: 1; background: rgba(255,255,255,0.05); color: #888; border: none; padding: 0.8rem; border-radius: 10px; font-weight: 800; cursor: pointer;">CANCEL</button>
                            <button id="confirm-manual" style="flex: 2; background: #2ecc71; color: #fff; border: none; padding: 0.8rem; border-radius: 10px; font-weight: 800; cursor: pointer;">CONFIRM & LOCK</button>
                        </div>
                    </div>
                </div>

                <!-- Chat Area -->
                <div id="chat-messages" style="flex: 1; overflow-y: auto; overflow-x: hidden; padding: 3rem; display: flex; flex-direction: column; gap: 2rem; scroll-behavior: smooth; max-height: calc(85vh - 200px);">
                    <!-- AI Hello -->
                    <div class="msg ai" style="align-self: flex-start; max-width: 80%; background: rgba(255,255,255,0.03); padding: 1.5rem; border-radius: 0 20px 20px 20px; border-left: 3px solid var(--accent); position: relative;">
                        <p style="margin: 0; font-size: 0.95rem; line-height: 1.7;">Welcome back, ${user.username}. I have initialized the GPT-OSS 120B reasoning engine.</p>
                        <p style="margin: 1rem 0 0 0; font-size: 0.95rem; line-height: 1.7;">The Identify phase is about defining your "Industrial North Star". What domain or technology stack are you currently exploring?</p>
                    </div>
                </div>

                <!-- Typing Bar -->
                <div style="padding: 2.5rem 3rem; background: rgba(255,255,255,0.01); display: flex; gap: 1rem; border-top: 1px solid rgba(255,255,255,0.05); align-items: flex-end;">
                    <div style="flex: 1; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 1.2rem; position: relative;">
                        <textarea id="chat-textarea" placeholder="Speak to the Architect..." style="width: 100%; background: none; border: none; color: #fff; outline: none; resize: none; min-height: 25px; max-height: 150px; font-family: inherit; font-size: 0.95rem; line-height: 1.5;"></textarea>
                    </div>
                    <button id="send-trigger" style="width: 60px; height: 60px; background: var(--accent); color: #000; border: none; border-radius: 20px; display: flex; align-items: center; justify-content: center; cursor: pointer; transition: 0.3s; transform: translateY(-5px);">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
            </div>
        </div>
    `;

    const messagesContainer = document.getElementById('chat-messages');
    const textarea = document.getElementById('chat-textarea');
    const sendBtn = document.getElementById('send-trigger');
    const exitBtn = document.getElementById('exit-chatbot');

    // Manual Lock Logic
    const manualTrigger = document.getElementById('manual-lock-trigger');
    const manualModal = document.getElementById('manual-lock-modal');
    const manualInput = document.getElementById('manual-title-input');
    const cancelManual = document.getElementById('cancel-manual');
    const confirmManual = document.getElementById('confirm-manual');

    manualTrigger.onclick = () => {
        manualModal.style.display = 'flex';
        manualInput.focus();
    };

    cancelManual.onclick = () => {
        manualModal.style.display = 'none';
        manualInput.value = '';
    };

    confirmManual.onclick = async () => {
        const title = manualInput.value.trim();
        if (!title) return alert("Please enter a project title.");

        confirmManual.disabled = true;
        confirmManual.innerText = "LOCKING...";

        try {
            const res = await fetch('/api/idea/save', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    idea: `Manual Project: ${title}`,
                    isCompleted: true,
                    branch: 'Custom Selection'
                })
            });

            if (res.ok) {
                manualModal.innerHTML = `
                    <div class="glass" style="padding: 2rem; border-radius: 20px; text-align: center;">
                        <div style="font-size: 3rem; margin-bottom: 1rem;">✅</div>
                        <h3 style="color: #2ecc71;">MISSION SECURED</h3>
                        <p style="color: #fff;">Roadmap updated with: ${title}</p>
                    </div>
                `;
                setTimeout(() => window.location.reload(), 1500);
            }
        } catch (err) {
            console.error(err);
            confirmManual.disabled = false;
            confirmManual.innerText = "CONFIRM & LOCK";
        }
    };

    // Chat Memory
    let messageHistory = [];
    let isThinking = false;

    const addMessage = (text, role = 'ai') => {
        const messageWrapper = document.createElement('div');
        messageWrapper.style.cssText = `
            display: flex;
            flex-direction: column;
            align-self: ${role === 'ai' ? 'flex-start' : 'flex-end'};
            width: fit-content;
            max-width: 95%;
            margin-bottom: 2rem;
            animation: fadeIn 0.4s ease-out;
        `;

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble glass';
        bubble.style.cssText = `
            background: ${role === 'ai' ? 'rgba(255,255,255,0.03)' : 'var(--accent)'};
            color: ${role === 'ai' ? '#fff' : '#000'};
            padding: 1.5rem 2.2rem;
            border-radius: ${role === 'ai' ? '0 30px 30px 30px' : '30px 30px 0 30px'};
            border-left: ${role === 'ai' ? '4px solid var(--accent)' : 'none'};
            font-size: 1.05rem;
            line-height: 1.8;
            position: relative;
            width: fit-content;
        `;

        // Improved Markdown-lite formatting - OpenAI Clean Style
        let contentHTML = '';
        const lines = text.replace(/\*/g, '').split('\n'); // Strict no-stars
        let hasProposal = false;

        lines.forEach((line) => {
            if (line.includes('PROPOSED PROJECT TITLE:')) {
                hasProposal = true;
                const title = line.replace(/PROPOSED PROJECT TITLE:/i, '').trim();
                const id = `lock-${Math.random().toString(36).substr(2, 9)}`;

                contentHTML += `
                    <div class="project-proposal-row" style="display: flex; align-items: flex-start; gap: 15px; margin: 1.5rem 0; padding: 1.5rem; background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); width: fit-content; min-width: 320px; transition: 0.3s; cursor: default;">
                        <button id="${id}" class="inline-lock-btn" title="Lock this choice" style="background: var(--accent); color: #000; border: none; width: 35px; height: 35px; border-radius: 8px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; margin-top: 2px; box-shadow: 0 4px 15px rgba(201,176,55,0.2);">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 0 0 1 10 0v4"></path></svg>
                        </button>
                        <div style="flex: 1;">
                            <span style="font-size: 0.7rem; color: #888; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;">RECOMMENDED PATH</span>
                            <h4 style="margin: 5px 0 0 0; color: #fff; font-size: 1.25rem; font-family: 'Outfit', sans-serif; font-weight: 700;">${title}</h4>
                            <div id="confirm-box-${id}" style="display: none; margin-top: 15px; align-items: center; gap: 15px; animation: slideIn 0.3s ease;">
                                <span style="font-size: 0.8rem; color: #2ecc71; font-weight: 800; letter-spacing: 0.5px;">SECURE THIS SELECTION?</span>
                                <button class="yes-btn" style="background: #2ecc71; color: #fff; border: none; padding: 6px 16px; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 900; transition: 0.2s;">CONFIRM</button>
                                <button class="no-btn" style="background: rgba(255,255,255,0.05); color: #aaa; border: none; padding: 6px 16px; border-radius: 6px; cursor: pointer; font-size: 0.75rem; font-weight: 900;">BACK</button>
                            </div>
                        </div>
                    </div>
                `;
            } else if (line.trim()) {
                // OpenAI Style Clean Typography
                contentHTML += `<p style="margin-bottom: 1.2rem; width: fit-content; font-size: 1.05rem; opacity: 0.95;">${line}</p>`;
            } else {
                contentHTML += `<div style="height: 0.8rem;"></div>`;
            }
        });

        bubble.innerHTML = contentHTML;

        if (role === 'ai' && hasProposal) {
            setTimeout(() => {
                const lockBtns = bubble.querySelectorAll('.inline-lock-btn');
                lockBtns.forEach(btn => {
                    const id = btn.id;
                    const confirmBox = bubble.querySelector(`#confirm-box-${id}`);
                    const titleEl = bubble.querySelector(`#${id} + div h4`);
                    const title = titleEl ? titleEl.innerText : "Project Idea";

                    btn.onclick = (e) => {
                        e.stopPropagation();
                        confirmBox.style.display = confirmBox.style.display === 'flex' ? 'none' : 'flex';
                    };

                    confirmBox.querySelector('.no-btn').onclick = (e) => {
                        e.stopPropagation();
                        confirmBox.style.display = 'none';
                    };

                    confirmBox.querySelector('.yes-btn').onclick = async (e) => {
                        e.stopPropagation();
                        const yesBtn = confirmBox.querySelector('.yes-btn');
                        yesBtn.disabled = true;
                        yesBtn.innerText = "PROCESSING...";

                        try {
                            const res = await fetch('/api/idea/save', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                    'Authorization': `Bearer ${token}`
                                },
                                body: JSON.stringify({
                                    idea: `Project: ${title}`,
                                    isCompleted: true,
                                    branch: 'Architect Selection'
                                })
                            });

                            if (res.ok) {
                                btn.style.background = '#2ecc71';
                                btn.innerHTML = '✓';
                                confirmBox.innerHTML = '<span style="color: #2ecc71; font-size: 0.85rem; font-weight: 900;">SECURED TO ROADMAP ✓</span>';
                                setTimeout(() => window.location.reload(), 1200);
                            }
                        } catch (err) {
                            console.error(err);
                            yesBtn.disabled = false;
                            yesBtn.innerText = "RETRY";
                        }
                    };
                });
            }, 0);
        }

        messageWrapper.appendChild(bubble);
        messagesContainer.appendChild(messageWrapper);

        // AUTO-SCROLL DISABLED: Let user read from top to bottom naturally
        // messagesContainer.scrollTop = messagesContainer.scrollHeight;

        // Add to history
        messageHistory.push({ role: role === 'ai' ? 'assistant' : 'user', content: text });
    };

    const handleChat = async () => {
        const text = textarea.value.trim();
        if (!text || isThinking) return;

        textarea.value = '';
        addMessage(text, 'user');

        isThinking = true;

        // Show thinking indicator
        const thinking = document.createElement('div');
        thinking.style.color = '#555';
        thinking.style.fontSize = '0.75rem';
        thinking.style.fontStyle = 'italic';
        thinking.style.marginLeft = '1rem';
        thinking.innerText = 'Phase Architect is computing Reasoning Tokens (120B)...';
        messagesContainer.appendChild(thinking);
        messagesContainer.scrollTop = messagesContainer.scrollHeight;

        try {
            const res = await fetch('/api/idea/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ messages: messageHistory })
            });

            const data = await res.json();
            messagesContainer.removeChild(thinking);

            if (res.ok) {
                addMessage(data.response, 'ai');
            } else {
                addMessage("I'm experiencing a high-latency response from the core servers. One moment...", 'ai');
            }
        } catch (err) {
            messagesContainer.removeChild(thinking);
            addMessage("Transmission error. Please check your uplink.", 'ai');
        } finally {
            isThinking = false;
        }
    };

    textarea.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleChat();
        }
    });

    sendBtn.onclick = handleChat;

    exitBtn.onclick = () => {
        import('./home2.js').then(m => m.initHome2(app, user));
    };
}

