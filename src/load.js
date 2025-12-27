import { initHome2 } from './home2.js';

export async function initLoad(app, user) {
    const token = localStorage.getItem('token');

    // Fetch User's Projects
    let projects = [];
    try {
        const res = await fetch('/api/project/all', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            projects = await res.json();
        }
    } catch (e) {
        console.error('Failed to fetch projects', e);
    }

    app.innerHTML = `
        <style>
            .load-container {
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                height: 100vh;
                background: radial-gradient(circle at center, #1a1a1a 0%, #000 100%);
                color: #fff;
                font-family: 'Inter', sans-serif;
            }
            .glass-card {
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255,255,255,0.1);
                border-radius: 20px;
                padding: 3rem;
                width: 400px;
                text-align: center;
                box-shadow: 0 20px 50px rgba(0,0,0,0.5);
            }
            .title {
                font-family: 'Playfair Display', serif;
                font-size: 2rem;
                margin-bottom: 2rem;
                color: #fff;
            }
            .btn {
                width: 100%;
                padding: 1rem;
                margin-bottom: 1rem;
                border: none;
                border-radius: 10px;
                cursor: pointer;
                font-weight: 700;
                font-size: 1rem;
                transition: 0.3s;
            }
            .btn-primary {
                background: #2ecc71;
                color: #000;
            }
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(46, 204, 113, 0.3);
            }
            .btn-secondary {
                background: rgba(255,255,255,0.1);
                color: #fff;
                border: 1px solid rgba(255,255,255,0.1);
            }
            .btn-secondary:hover {
                background: rgba(255,255,255,0.2);
            }
            select {
                width: 100%;
                padding: 1rem;
                margin-bottom: 1rem;
                background: rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.2);
                border-radius: 10px;
                color: #fff;
                font-size: 1rem;
                outline: none;
            }
            .or-divider {
                display: flex;
                align-items: center;
                gap: 10px;
                margin: 1.5rem 0;
                color: #666;
                font-size: 0.8rem;
                text-transform: uppercase;
                letter-spacing: 1px;
            }
            .or-divider::before, .or-divider::after {
                content: '';
                flex: 1;
                height: 1px;
                background: rgba(255,255,255,0.1);
            }
        </style>
        <div class="load-container">
            <div class="glass-card">
                <div style="font-size:3rem; margin-bottom:1rem;">🚀</div>
                <h2 class="title">Select Your Mission</h2>
                
                <button id="btn-new-project" class="btn btn-primary">
                    + Create New Project
                </button>

                <div class="or-divider">OR CONTINUE</div>

                <div style="text-align:left; margin-bottom:0.5rem; color:#aaa; font-size:0.9rem;">Select Existing Project</div>
                <select id="project-select">
                    <option value="" disabled selected>-- Choose from Database --</option>
                    ${projects.map(p => `<option value="${p._id}">${p.displayTitle} (${p.branch})</option>`).join('')}
                </select>

                <button id="btn-load-project" class="btn btn-secondary" disabled>
                    Load Project
                </button>
            </div>
        </div>
    `;

    // Event Listeners
    const select = document.getElementById('project-select');
    const loadBtn = document.getElementById('btn-load-project');
    const newBtn = document.getElementById('btn-new-project');

    select.onchange = () => {
        loadBtn.disabled = !select.value;
        if (select.value) {
            loadBtn.classList.remove('btn-secondary');
            loadBtn.classList.add('btn-primary');
            loadBtn.style.background = '#3498db'; // distinct color
        }
    };

    const setActiveAndGo = async (projectId) => {
        try {
            await fetch('/api/project/set-active', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ projectId })
            });

            if (projectId === 'new') {
                localStorage.setItem('phase_creation_mode', 'true');
            } else {
                localStorage.removeItem('phase_creation_mode');
            }
            initHome2(app, user);
        } catch (e) {
            console.error('Error setting active project', e);
            alert('Failed to load project.');
        }
    };

    newBtn.onclick = () => {
        // 'new' tells backend to deactivate all. initInitial/initHome2 will handle the rest.
        // Actually, initHome2 calls /me. If no active, it returns null. UI shows empty state.
        // Then Step 1 (Initial) calls /initialize which will create new active project.
        setActiveAndGo('new');
    };

    loadBtn.onclick = () => {
        if (select.value) {
            setActiveAndGo(select.value);
        }
    };
}
