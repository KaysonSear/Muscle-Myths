import { Request, Response } from 'express';
import Registration from '../models/Registration.js';
import Event from '../models/Event.js';
import Athlete from '../models/Athlete.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// @desc    Create a registration
// @route   POST /api/registrations
// @access  Private
export const createRegistration = async (req: AuthRequest, res: Response) => {
  const { event_id, athlete_id, categories, services, total_fee, notes } =
    req.body;

  try {
    // Validate Event and Athlete exist
    const event = await Event.findById(event_id);
    if (!event) {
      res.status(404).json({ message: '未找到该赛事' });
      return;
    }

    const athlete = await Athlete.findById(athlete_id);
    if (!athlete) {
      res.status(404).json({ message: '未找到该选手' });
      return;
    }

    const registration = new Registration({
      event_id,
      athlete_id,
      categories,
      services,
      total_fee,
      notes,
    });

    const createdRegistration = await registration.save();
    res.status(201).json(createdRegistration);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Get registrations for an event
// @route   GET /api/registrations?event_id=...
// @access  Private
export const getRegistrations = async (req: Request, res: Response) => {
  const { event_id, athlete_id } = req.query;

  const query: any = {};
  if (event_id) query.event_id = event_id;
  if (athlete_id) query.athlete_id = athlete_id;

  try {
    const registrations = await Registration.find(query)
      .populate('athlete_id', 'name bib_number gender')
      .populate('event_id', 'name date');
    res.json(registrations);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
