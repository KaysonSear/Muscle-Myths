import { Request, Response } from 'express';
import Registration from '../models/Registration.js';
import Lineup from '../models/Lineup.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// @desc    Generate lineup for an event
// @route   POST /api/lineups/:event_id/generate
// @access  Private
export const generateLineup = async (req: AuthRequest, res: Response) => {
  const { event_id } = req.params;

  try {
    // Check if lineup already exists
    const existingLineup = await Lineup.findOne({ event_id });
    if (existingLineup) {
      res
        .status(400)
        .json({ message: '秩序表已存在，请先删除旧表后再生成。' });
      return;
    }

    const registrations = await Registration.find({ event_id }).populate(
      'athlete_id'
    );

    if (registrations.length === 0) {
      res.status(400).json({ message: '该赛事暂无报名记录' });
      return;
    }

    // Logic: Group by category, sort by bib_number
    let flatEntries: any[] = [];

    registrations.forEach((reg: any) => {
      reg.categories.forEach((cat: any) => {
        flatEntries.push({
          athlete_id: reg.athlete_id._id,
          bib_number: reg.athlete_id.bib_number, // Helper for sorting
          category: cat.display_name,
          is_display: true, // Default
        });
      });
    });

    // Sort by Category then Bib Number
    flatEntries.sort((a, b) => {
      if (a.category < b.category) return -1;
      if (a.category > b.category) return 1;
      return parseInt(a.bib_number) - parseInt(b.bib_number);
    });

    // Create Lineup items with order
    const lineupItems = flatEntries.map((entry, index) => ({
      order: index + 1,
      athlete_id: entry.athlete_id,
      category: entry.category,
      is_display: entry.is_display,
    }));

    const lineup = new Lineup({
      event_id,
      lineup: lineupItems,
    });

    await lineup.save();
    res.status(201).json(lineup);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get lineup
// @route   GET /api/lineups/:event_id
// @access  Public
export const getLineup = async (req: Request, res: Response) => {
  const lineup = await Lineup.findOne({ event_id: req.params.event_id })
    .populate('lineup.athlete_id', 'name bib_number gender')
    .sort('lineup.order');

  if (lineup) {
    res.json(lineup);
  } else {
    res.status(404).json({ message: '未找到秩序表' });
  }
};
