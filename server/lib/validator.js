import Idea from '../models/Idea.js';

/**
 * Validates the novelty of a project idea by checking the database.
 * @param {string} idea - The generated project idea string.
 * @returns {Promise<boolean>} - True if the idea is unique, false otherwise.
 */
export const isNovel = async (idea) => {
    try {
        console.log(`[Phase Validator] Scanning database for similarity: ${idea.substring(0, 40)}...`);

        // Count how many project ideas already match this exact text
        const existingCount = await Idea.countDocuments({ idea: idea });

        const novel = existingCount === 0;

        if (!novel) {
            console.warn(`[Phase Validator] Collision detected. Idea already exists in development tunnel.`);
        } else {
            console.log(`[Phase Validator] Idea confirmed as Novel.`);
        }

        return novel;
    } catch (err) {
        console.error("[Phase Validator] Error during novelty check:", err);
        // Fallback to true to avoid blocking user if DB check fails
        return true;
    }
};
