import mongoose from 'mongoose';

const ideaSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    branch: { type: String, required: true },
    skills: [String],
    interests: [String],
    constraints: [String],
    idea: { type: String, required: true },
    abstract: { type: String },
    detailedDescription: { type: String },
    teamName: { type: String },
    leader: { type: String },
    teammates: [{
        username: String,
        email: String
    }],
    roadmapData: [{
        step: String,
        title: String,
        description: String,
        imagePrompt: String,
        imageUrl: String
    }],
    weekSubmissions: [{
        week: Number,
        title: String,
        image: String,
        gitRepo: String,
        deployedLink: String,
        videoLink: String,
        status: { type: String, default: 'pending' },
        submittedAt: Date
    }],
    documentData: {
        introduction: String,
        objectives: String,
        scope: String,
        technicalStack: String,
        features: String,
        architecture: String,
        flowchartUrl: String,
        impact: String,
        conclusion: String,
        architectureImage: String // URL or path to uploaded architecture image
    },
    isCompleted: { type: Boolean, default: false }, // Step 02
    step03Completed: { type: Boolean, default: false },
    step04Completed: { type: Boolean, default: false },
    step05Completed: { type: Boolean, default: false },
    step06Completed: { type: Boolean, default: false },
    step07Completed: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Idea', ideaSchema);
