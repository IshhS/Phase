import express from 'express';
import jwt from 'jsonwebtoken';
import Project from '../models/Project.js';
import User from '../models/User.js';
import { sendTeamInvite } from '../lib/mailer.js';

const router = express.Router();

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

// Get Current User's Active Project
router.get('/me', authenticate, async (req, res) => {
    try {
        const project = await Project.findOne({ user: req.userId, isActive: true });
        res.json(project);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get ALL User's Projects with Titles from Idea
router.get('/all', authenticate, async (req, res) => {
    try {
        const projects = await Project.find({ user: req.userId }).sort({ createdAt: -1 });

        // Enhance projects with titles from Idea model
        const projectList = await Promise.all(projects.map(async (p) => {
            const ideaDoc = await import('../models/Idea.js').then(m => m.default.findOne({ project: p._id }));

            let title = 'Untitled Project';
            if (ideaDoc && ideaDoc.idea) {
                const text = ideaDoc.idea;
                if (text.includes('PROPOSED PROJECT TITLE:')) {
                    title = text.split('PROPOSED PROJECT TITLE:')[1].split('\n')[0].trim();
                } else if (text.includes('Project:')) {
                    title = text.split('Project:')[1].trim();
                } else if (text.includes('Manual Project:')) {
                    title = text.split('Manual Project:')[1].trim();
                }
            }

            return {
                ...p.toObject(),
                displayTitle: title
            };
        }));

        res.json(projectList);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Set Active Project
router.post('/set-active', authenticate, async (req, res) => {
    try {
        const { projectId } = req.body;

        // Deactivate all
        await Project.updateMany({ user: req.userId }, { isActive: false });

        if (projectId && projectId !== 'new') {
            await Project.findByIdAndUpdate(projectId, { isActive: true });
        }

        res.json({ message: 'Active project updated' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Initialize or Update Project
router.post('/initialize', authenticate, async (req, res) => {
    try {
        console.log('[Phase Routes] Initialization Request Body:', req.body);
        // Find the LATEST ACTIVE project to update, or create new if none active
        let project = await Project.findOne({ user: req.userId, isActive: true });
        const leader = await User.findById(req.userId);

        if (!leader) {
            console.error('[Phase Routes] Leader not found for ID:', req.userId);
            return res.status(404).json({ message: 'Leader not found' });
        }

        const { teamEmails, teamName, mode } = req.body;

        if (project) {
            // Update existing active project
            const existingEmails = project.teamEmails || [];
            const newEmails = Array.isArray(teamEmails) ? teamEmails.filter(email => !existingEmails.includes(email)) : [];

            Object.assign(project, req.body);
            await project.save();

            // Send emails to only NEW members
            if (mode === 'Team' && newEmails.length > 0) {
                for (const email of newEmails) {
                    await sendTeamInvite({
                        userEmail: email,
                        teamName: teamName || 'Phase Project',
                        leaderName: leader.username
                    });
                }
            }

            return res.json({ message: 'Project updated successfully', project });
        }

        // Create new
        const newProject = new Project({
            ...req.body,
            user: req.userId,
            isActive: true
        });

        // Deactivate others
        await Project.updateMany({ user: req.userId }, { isActive: false });

        await newProject.save();
        project = newProject; // for response

        // Send email to Leader (Me)
        await sendTeamInvite({
            userEmail: leader.email,
            userName: leader.username,
            teamName: teamName || 'Phase Project',
            isLeader: true
        });

        // Send emails to all members on first creation
        if (mode === 'Team' && teamEmails && teamEmails.length > 0) {
            for (const email of teamEmails) {
                await sendTeamInvite({
                    userEmail: email,
                    teamName: teamName || 'Phase Project',
                    leaderName: leader.username
                });
            }
        }

        res.status(201).json({ message: 'Project initialized successfully', project });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
