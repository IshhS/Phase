import express from 'express';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import Idea from '../models/Idea.js';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { generateProjectIdea, chatWithArchitect } from '../lib/inputprocessor.js';

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/';
        // Create uploads directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir); // Save to uploads directory
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 100 * 1024 * 1024, // 100MB limit
    },
    fileFilter: (req, file, cb) => {
        // Check file type
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed!'), false);
        }
    }
});

// Middleware to verify JWT
const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Unauthorized' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
        req.userId = decoded.id;
        next();
    } catch (err) {
        res.status(401).json({ message: 'Invalid token' });
    }
};

// AI Chat Interaction
router.post('/chat', authenticate, async (req, res) => {
    try {
        const { messages } = req.body;
        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ message: 'Messages array is required' });
        }

        const response = await chatWithArchitect(messages);
        res.json({ response });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Helper to get active project ID
async function getActiveProject(userId) {
    const project = await Project.findOne({ user: userId, isActive: true });
    return project;
}

// Get Idea for current user's ACTIVE project
router.get('/me', authenticate, async (req, res) => {
    try {
        const activeProject = await getActiveProject(req.userId);
        if (!activeProject) return res.json(null); // No active project, active idea is null

        const idea = await Idea.findOne({ user: req.userId, project: activeProject._id });
        res.json(idea);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Save or Update Idea
router.post('/save', authenticate, async (req, res) => {
    try {
        const { branch, skills, interests, constraints, isCompleted, idea, abstract, detailedDescription, step03Completed, step04Completed, step05Completed, step06Completed, step07Completed, teamName, leader, teammates } = req.body;

        const activeProject = await getActiveProject(req.userId);
        if (!activeProject) return res.status(400).json({ message: 'No active project found. Please initialize a project first.' });

        let existingIdea = await Idea.findOne({ user: req.userId, project: activeProject._id });

        if (existingIdea) {
            if (branch) existingIdea.branch = branch;
            if (skills) existingIdea.skills = skills;
            if (interests) existingIdea.interests = interests;
            if (constraints) existingIdea.constraints = constraints;
            if (idea) existingIdea.idea = idea;
            if (abstract) existingIdea.abstract = abstract;
            if (detailedDescription) existingIdea.detailedDescription = detailedDescription;
            if (teamName) existingIdea.teamName = teamName;
            if (leader) existingIdea.leader = leader;
            if (teammates) existingIdea.teammates = teammates;

            if (isCompleted !== undefined) existingIdea.isCompleted = isCompleted;
            if (step03Completed !== undefined) existingIdea.step03Completed = step03Completed;
            if (step04Completed !== undefined) existingIdea.step04Completed = step04Completed;
            if (step05Completed !== undefined) existingIdea.step05Completed = step05Completed;
            if (step06Completed !== undefined) existingIdea.step06Completed = step06Completed;
            if (step07Completed !== undefined) existingIdea.step07Completed = step07Completed;

            await existingIdea.save();
            return res.json({ message: 'Idea updated', idea: existingIdea });
        }

        const newIdea = new Idea({
            user: req.userId,
            project: activeProject._id,
            branch: branch || 'N/A',
            skills: skills || [],
            interests: interests || [],
            constraints: constraints || [],
            idea: idea || 'N/A',
            abstract: abstract || '',
            detailedDescription: detailedDescription || '',
            teamName: teamName || '',
            leader: leader || '',
            teammates: teammates || [],
            isCompleted: isCompleted || false,
            step03Completed: step03Completed || false,
            step04Completed: step04Completed || false,
            step05Completed: step05Completed || false,
            step06Completed: step06Completed || false,
            step07Completed: step07Completed || false
        });

        await newIdea.save();
        res.status(201).json({ message: 'Idea saved successfully', idea: newIdea });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get teammates
router.get('/team', authenticate, async (req, res) => {
    try {
        const user = await User.findById(req.userId);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const teammates = await User.find({ teamName: user.teamName }, 'username email teamName');

        // Find leader from Project model
        const leaderProject = await Project.findOne({ teamName: user.teamName, isLeader: true }).populate('user', 'username');
        const leaderName = leaderProject ? leaderProject.user.username : teammates[0].username;

        res.json({ teammates, leader: leaderName, teamName: user.teamName });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Generate AI Roadmap with Image Prompts
router.post('/generate-roadmap', authenticate, async (req, res) => {
    try {
        const { projectTitle, abstract, description } = req.body;

        const activeProject = await getActiveProject(req.userId);
        if (!activeProject) return res.status(404).json({ message: 'No active project found' });

        const idea = await Idea.findOne({ user: req.userId, project: activeProject._id });
        if (!idea) return res.status(404).json({ message: 'Idea not found for active project' });

        // AI generates roadmap milestones
        const roadmapPrompt = `You are an expert Engineering Project Manager. Generate a detailed 5-milestone roadmap for this project:

PROJECT: ${projectTitle}
ABSTRACT: ${abstract}
DESCRIPTION: ${description}

For each milestone, provide:
1. A clear milestone name (e.g., "Requirements Analysis", "System Design", etc.)
2. A detailed 3-4 sentence description of what happens in this phase
3. A visual image prompt for Stable Diffusion (describe a technical, professional scene representing this milestone)

Format your response EXACTLY like this:
MILESTONE 1
NAME: [name]
DESCRIPTION: [description]
IMAGE_PROMPT: [stable diffusion prompt]

MILESTONE 2
NAME: [name]
DESCRIPTION: [description]
IMAGE_PROMPT: [prompt]

Continue for all 5 milestones.`;

        const aiResponse = await chatWithArchitect([
            { role: 'user', content: roadmapPrompt }
        ]);

        // Parse AI response
        const milestones = [];
        const blocks = aiResponse.split(/MILESTONE \d+/).filter(b => b.trim());

        blocks.forEach((block, idx) => {
            const nameMatch = block.match(/NAME:\s*(.+)/i);
            const descMatch = block.match(/DESCRIPTION:\s*([\s\S]+?)(?=IMAGE_PROMPT:|$)/i);
            const imageMatch = block.match(/IMAGE_PROMPT:\s*(.+)/i);

            if (nameMatch && descMatch && imageMatch) {
                milestones.push({
                    step: `MILESTONE ${idx + 1}`,
                    title: nameMatch[1].trim(),
                    description: descMatch[1].trim(),
                    imagePrompt: imageMatch[1].trim(),
                    imageUrl: `https://image.pollinations.ai/prompt/${encodeURIComponent(imageMatch[1].trim())}?width=800&height=600&nologo=true`
                });
            }
        });

        // Fallback if parsing fails
        if (milestones.length === 0) {
            milestones.push(
                {
                    step: 'MILESTONE 1',
                    title: 'Requirements Analysis',
                    description: 'Gather and document all functional and non-functional requirements. Conduct stakeholder interviews and create detailed specification documents.',
                    imagePrompt: 'professional engineers analyzing technical blueprints and requirements documents in modern office',
                    imageUrl: 'https://image.pollinations.ai/prompt/professional%20engineers%20analyzing%20technical%20blueprints?width=800&height=600&nologo=true'
                },
                {
                    step: 'MILESTONE 2',
                    title: 'System Architecture Design',
                    description: 'Design the overall system architecture, select appropriate technologies, and create detailed technical diagrams showing component interactions.',
                    imagePrompt: 'futuristic system architecture diagram with connected modules and data flow visualization',
                    imageUrl: 'https://image.pollinations.ai/prompt/futuristic%20system%20architecture%20diagram?width=800&height=600&nologo=true'
                },
                {
                    step: 'MILESTONE 3',
                    title: 'Core Development',
                    description: 'Implement the core functionality of the system. Build the primary modules, establish database connections, and create the foundational codebase.',
                    imagePrompt: 'software developer coding on multiple screens with clean modern code editor interface',
                    imageUrl: 'https://image.pollinations.ai/prompt/software%20developer%20coding%20modern%20interface?width=800&height=600&nologo=true'
                },
                {
                    step: 'MILESTONE 4',
                    title: 'Integration & Testing',
                    description: 'Integrate all system components, conduct comprehensive testing including unit tests, integration tests, and user acceptance testing.',
                    imagePrompt: 'quality assurance testing dashboard with green checkmarks and system integration visualization',
                    imageUrl: 'https://image.pollinations.ai/prompt/quality%20assurance%20testing%20dashboard?width=800&height=600&nologo=true'
                },
                {
                    step: 'MILESTONE 5',
                    title: 'Deployment & Documentation',
                    description: 'Deploy the system to production environment, create comprehensive documentation, and provide training materials for end users.',
                    imagePrompt: 'successful project deployment celebration with team looking at live production dashboard',
                    imageUrl: 'https://image.pollinations.ai/prompt/successful%20project%20deployment%20celebration?width=800&height=600&nologo=true'
                }
            );
        }

        // Save to database
        idea.roadmapData = milestones;
        idea.step04Completed = true;
        await idea.save();

        res.json({ message: 'Roadmap generated successfully', roadmap: milestones });
    } catch (err) {
        console.error('Roadmap generation error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Submit Weekly Progress
router.post('/submit-week', authenticate, async (req, res) => {
    try {
        const { week, image, gitRepo, deployedLink, videoLink } = req.body;

        const activeProject = await getActiveProject(req.userId);
        if (!activeProject) return res.status(404).json({ message: 'No active project found' });

        const idea = await Idea.findOne({ user: req.userId, project: activeProject._id });
        if (!idea) return res.status(404).json({ message: 'Idea not found for active project' });

        // Initialize weekSubmissions if empty
        if (!idea.weekSubmissions || idea.weekSubmissions.length === 0) {
            idea.weekSubmissions = [
                { week: 1, title: 'Week 1: Foundation Setup', status: 'pending' },
                { week: 2, title: 'Week 2: Core Module Development', status: 'pending' },
                { week: 3, title: 'Week 3: Feature Integration', status: 'pending' },
                { week: 4, title: 'Week 4: Advanced Features', status: 'pending' },
                { week: 5, title: 'Week 5: Testing & Refinement', status: 'pending' },
                { week: 6, title: 'Week 6: Final Deployment', status: 'pending' }
            ];
        }

        // Find and update the specific week
        const weekIndex = idea.weekSubmissions.findIndex(w => w.week === week);
        if (weekIndex === -1) {
            return res.status(400).json({ message: 'Invalid week number' });
        }

        idea.weekSubmissions[weekIndex].image = image;
        idea.weekSubmissions[weekIndex].gitRepo = gitRepo;
        idea.weekSubmissions[weekIndex].status = 'submitted';
        idea.weekSubmissions[weekIndex].submittedAt = new Date();

        if (week === 6) {
            idea.weekSubmissions[weekIndex].deployedLink = deployedLink;
            idea.weekSubmissions[weekIndex].videoLink = videoLink;
            idea.step05Completed = true; // Mark execution phase complete
        }

        await idea.save();
        res.json({ message: `Week ${week} submitted successfully`, weekData: idea.weekSubmissions });
    } catch (err) {
        console.error('Week submission error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Generate Project Documentation
router.post('/generate-documentation', authenticate, async (req, res) => {
    try {
        const activeProject = await getActiveProject(req.userId);
        if (!activeProject) return res.status(404).json({ message: 'No active project found' });

        const idea = await Idea.findOne({ user: req.userId, project: activeProject._id });
        if (!idea) return res.status(404).json({ message: 'Idea not found for active project' });

        // Extract project title
        const ideaText = idea.idea || "";
        let projectTitle = "Untitled Project";
        if (ideaText.includes('PROPOSED PROJECT TITLE:')) {
            projectTitle = ideaText.split('PROPOSED PROJECT TITLE:')[1].split('\n')[0].trim();
        } else if (ideaText.includes('Project:')) {
            projectTitle = ideaText.split('Project:')[1].trim();
        }

        // AI generates comprehensive documentation
        const docPrompt = `You are a senior technical documentation writer for engineering projects. Generate an EXTREMELY DETAILED, comprehensive project documentation.

PROJECT TITLE: ${projectTitle}
ABSTRACT: ${idea.abstract || 'N/A'}
DETAILED DESCRIPTION: ${idea.detailedDescription || 'N/A'}

CRITICAL INSTRUCTIONS:
- Write in professional, formal technical style for academic/industry review
- DO NOT use asterisks (*), bullet points, or markdown
- Use flowing paragraphs with technical terminology
- Each section MUST be 8-10 detailed paragraphs (minimum 500-700 words)
- Include specific technical details, algorithms, methodologies, standards
- Provide in-depth analysis and justifications
- Use transitional phrases for smooth flow

Generate these sections with MAXIMUM DETAIL:

1. INTRODUCTION (2-3 paragraphs, 100 words max): Background, problem domain, motivation, solution approach, significance

2. OBJECTIVES (8-10 paragraphs, 500+ words): Primary/secondary goals, technical milestones, functional/non-functional requirements, success criteria, industry standards alignment, learning objectives, innovation goals, future vision

3. SCOPE (4-5 paragraphs, 300+ words): Included features, specifications, boundaries, assumptions, constraints, target users, usage boundaries

4. TECHNICAL_STACK (4-5 paragraphs, 300+ words): Frontend technologies, backend technologies, database, APIs/libraries/tools, deployment environment, justification for each choice

5. FEATURES (8-10 paragraphs, 500+ words): Core features, user roles, functionality explanation, step-by-step workflows, backend processes, security, performance optimization

6. ARCHITECTURE (10-12 paragraphs, 700+ words): High-level system architecture, architectural pattern, component interactions, frontend-backend-database-API interaction, logical workflow, data flow, flowchart description

7. IMPACT (8-10 paragraphs, 500+ words): Technical impact, educational/social impact, user benefits, institutional benefits, industry benefits, performance metrics, future potential

8. CONCLUSION (8-10 paragraphs, 500+ words): Project summary, achievements, objectives met, challenges/solutions, learning outcomes, quality metrics, future enhancements, final reflections

Format (no asterisks, flowing paragraphs):
INTRODUCTION:
[8-10 paragraphs]

OBJECTIVES:
[8-10 paragraphs]

SCOPE:
[4-5 paragraphs]

TECHNICAL_STACK:
[4-5 paragraphs]

FEATURES:
[8-10 paragraphs]

ARCHITECTURE:
[10-12 paragraphs]

IMPACT:
[8-10 paragraphs]

CONCLUSION:
[8-10 paragraphs]`;

        const aiResponse = await chatWithArchitect([
            { role: 'user', content: docPrompt }
        ]);

        // Parse AI response
        const sections = {};
        const sectionNames = ['INTRODUCTION', 'OBJECTIVES', 'SCOPE', 'TECHNICAL_STACK', 'FEATURES', 'ARCHITECTURE', 'IMPACT', 'CONCLUSION'];

        sectionNames.forEach((section, idx) => {
            const nextSection = sectionNames[idx + 1];
            const regex = nextSection
                ? new RegExp(`${section}:\\s*([\\s\\S]*?)(?=${nextSection}:)`, 'i')
                : new RegExp(`${section}:\\s*([\\s\\S]*)`, 'i');

            const match = aiResponse.match(regex);
            if (match) {
                sections[section.toLowerCase()] = match[1].trim();
            }
        });

        // Generate system architecture diagram using Pollinations.ai
        const archPrompt = `detailed system architecture diagram for ${projectTitle}, showing frontend layer, backend layer, database layer, API gateway, authentication service, data flow arrows, component interactions, professional technical diagram with labels`;
        const flowchartUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(archPrompt)}?width=1200&height=800&nologo=true`;

        // Save documentation
        idea.documentData = {
            introduction: sections.introduction || 'This project represents a comprehensive engineering solution developed through the Phase Engineering Tunnel methodology.',
            objectives: sections.objectives || 'The primary objective is to deliver a functional, scalable solution that demonstrates technical proficiency.',
            scope: sections.scope || 'The project scope encompasses complete development lifecycle from requirements through deployment.',
            technicalStack: sections.technical_stack || 'The project utilizes modern web technologies including frontend frameworks, backend services, and database systems chosen for their reliability and performance.',
            features: sections.features || 'The system implements comprehensive features designed to meet user requirements and industry standards.',
            architecture: sections.architecture || 'The architecture follows modern design patterns with clear separation of concerns and modular structure.',
            flowchartUrl: flowchartUrl,
            impact: sections.impact || 'This project provides significant benefits in efficiency, scalability, and demonstrates professional engineering practices.',
            conclusion: sections.conclusion || 'The successful completion validates the Phase methodology and delivers a robust, production-ready solution.'
        };

        idea.step06Completed = true;
        await idea.save();

        res.json({ message: 'Documentation generated successfully', documentData: idea.documentData });
    } catch (err) {
        console.error('Documentation generation error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Generate Introduction for Project Title
router.post('/generate-introduction', authenticate, async (req, res) => {
    try {
        const activeProject = await getActiveProject(req.userId);
        if (!activeProject) return res.status(404).json({ message: 'No active project found' });

        const idea = await Idea.findOne({ user: req.userId, project: activeProject._id });
        if (!idea) return res.status(404).json({ message: 'Idea not found' });

        // Extract project title
        const ideaText = idea.idea || "";
        let projectTitle = "Untitled Project";
        if (ideaText.includes('PROPOSED PROJECT TITLE:')) {
            projectTitle = ideaText.split('PROPOSED PROJECT TITLE:')[1].split('\n')[0].trim();
        } else if (ideaText.includes('Project:')) {
            projectTitle = ideaText.split('Project:')[1].trim();
        }

        // AI generates a detailed introduction (approximately 100 words)
        const introPrompt = `You are a senior technical documentation writer. Generate a detailed introduction for the following engineering project in a cohesive paragraph format (approximately 100 words).

PROJECT TITLE: ${projectTitle}
ABSTRACT: ${idea.abstract || 'N/A'}
DETAILED DESCRIPTION: ${idea.detailedDescription || 'N/A'}

Generate the introduction as a single, flowing paragraph that covers:
- Background and context of the project
- Problem domain and its significance
- Solution approach and methodology employed
- Expected outcomes and benefits

Write in professional, formal technical style suitable for academic/industry review. Ensure the introduction is informative, engaging, and provides a clear overview of the project's purpose and approach. Aim for approximately 100 words.`;

        const aiResponse = await chatWithArchitect([
            { role: 'user', content: introPrompt }
        ]);

        // Initialize documentData if it doesn't exist
        if (!idea.documentData) {
            idea.documentData = {};
        }

        // Save the generated introduction
        idea.documentData.introduction = aiResponse.trim();

        await idea.save();

        res.json({ message: 'Introduction generated successfully', introduction: aiResponse.trim() });
    } catch (err) {
        console.error('Introduction generation error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Upload Architecture Image
router.post('/upload-architecture', authenticate, upload.single('architectureImage'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const activeProject = await getActiveProject(req.userId);
        if (!activeProject) return res.status(404).json({ message: 'No active project found' });

        const idea = await Idea.findOne({ user: req.userId, project: activeProject._id });
        if (!idea) return res.status(404).json({ message: 'Idea not found' });

        // Save the file path to the database
        if (!idea.documentData) {
            idea.documentData = {};
        }
        idea.documentData.architectureImage = req.file.path;

        await idea.save();

        res.json({
            message: 'Architecture image uploaded successfully',
            filePath: req.file.path.replace(/\\/g, '/'),
            fileName: req.file.filename
        });
    } catch (err) {
        console.error('Upload error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Generate Content for specific section
router.post('/generate-content', authenticate, async (req, res) => {
    try {
        const { section, projectTitle, projectIdea, userMessage, existingContent } = req.body;

        if (!section || !projectTitle || !projectIdea) {
            return res.status(400).json({ message: 'Section, projectTitle, and projectIdea are required' });
        }

        let contentPrompt;
        let defaultFormat = '';

        // Set default formatting for specific sections
        if (['objectives', 'features', 'impacts'].includes(section)) {
            defaultFormat = ' Present in pointwise format with clear, concise points.';
        }

        if (userMessage && existingContent) {
            // Refinement mode: user wants to modify existing content
            contentPrompt = `You are a senior technical documentation writer. The user wants to refine the existing content for the ${section} section of their engineering project.

PROJECT TITLE: ${projectTitle}
PROJECT IDEA: ${projectIdea}

EXISTING CONTENT:
${existingContent}

USER'S REFINEMENT REQUEST: ${userMessage}

Please modify the existing content based on the user's request. If the user specifies a word count, length, or level of detail (short, long, brief, detailed, etc.), follow those instructions precisely. If the user specifies formatting (e.g., in pointwise, in bullet points, in two paragraphs, in numbered list, etc.), structure the content accordingly while maintaining professional, formal technical style suitable for academic/industry review. Use flowing paragraphs with technical terminology unless specified otherwise.${defaultFormat} Provide in-depth analysis and justifications where appropriate.

Return only the refined content for the ${section.toUpperCase()} section:`;
        } else {
            // Initial generation mode
            contentPrompt = `You are a senior technical documentation writer. Generate detailed content for the ${section} section of the following engineering project.

PROJECT TITLE: ${projectTitle}
PROJECT IDEA: ${projectIdea}

Write in professional, formal technical style suitable for academic/industry review. Use flowing paragraphs with technical terminology. Provide in-depth analysis and justifications. Aim for 300-500 words for this section.${defaultFormat}

Generate the content for ${section.toUpperCase()}:`;
        }

        const aiResponse = await chatWithArchitect([
            { role: 'user', content: contentPrompt }
        ]);

        res.json({ content: aiResponse.trim() });
    } catch (err) {
        console.error('Content generation error:', err);
        res.status(500).json({ error: err.message });
    }
});

// Save Edited Documentation
router.post('/save-documentation', authenticate, async (req, res) => {
    try {
        const { documentData } = req.body;

        const activeProject = await getActiveProject(req.userId);
        if (!activeProject) return res.status(404).json({ message: 'No active project found' });

        const idea = await Idea.findOne({ user: req.userId, project: activeProject._id });
        if (!idea) return res.status(404).json({ message: 'Idea not found' });

        idea.documentData = documentData;
        idea.step06Completed = true;
        await idea.save();

        res.json({ message: 'Documentation saved successfully', documentData: idea.documentData });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
