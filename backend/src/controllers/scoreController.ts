import { Request, Response } from 'express';
import Score from '../models/Score.js';
import Lineup from '../models/Lineup.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// @desc    Get scores for an event
// @route   GET /api/scores/:event_id
// @access  Public
export const getScores = async (req: Request, res: Response) => {
  const scores = await Score.find({ event_id: req.params.event_id })
    .populate('athlete_id', 'name bib_number')
    .sort('rank');
  res.json(scores);
};

// @desc    Submit/Update score for an athlete in a category
// @route   POST /api/scores
// @access  Private
export const submitScore = async (req: AuthRequest, res: Response) => {
  const { event_id, athlete_id, category, judge_scores } = req.body;

  try {
    // Calculation Logic
    // SRS: Remove 1 high, 1 low (if 5 or 7 judges).
    // For MVP, let's assume 5 or 7 judges.
    let scores = [...judge_scores];
    scores.sort((a, b) => a - b); // Sort ascending

    let validScores = scores;
    if (scores.length >= 5) {
      // Remove lowest and highest
      validScores = scores.slice(1, -1);
    }

    const total_score = validScores.reduce((a, b) => a + b, 0);

    // Update or Create
    const score = await Score.findOneAndUpdate(
      { event_id, athlete_id, category },
      {
        event_id,
        athlete_id,
        category,
        judge_scores,
        total_score,
        is_retired: false, // Reset if submitting score
      },
      { new: true, upsert: true }
    );

    // Trigger re-ranking for this category
    await calculateRanks(event_id, category);

    res.json(score);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

const calculateRanks = async (event_id: string, category: string) => {
  const scores = await Score.find({ event_id, category }).sort('total_score');

  for (let i = 0; i < scores.length; i++) {
    scores[i].rank = i + 1;
    scores[i].is_champion = i === 0;
    await scores[i].save();
  }
};

