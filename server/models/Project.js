import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    mode: { type: String, enum: ['Solo', 'Team'], required: true },
    isLeader: { type: Boolean, default: false },
    teamName: { type: String },
    teamSize: { type: Number },
    teamEmails: [{ type: String }],
    branch: { type: String, enum: ['CS', 'IT', 'AIML', 'Data Science'], required: true },
    year: { type: String, enum: ['F.E', 'S.E', 'T.E', 'B.E'], required: true },
    projectType: { type: String, enum: ['Mini', 'Major'], required: true },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Project', projectSchema);
