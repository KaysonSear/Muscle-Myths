import { Request, Response } from 'express';
import Event from '../models/Event.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// @desc    Get all events
// @route   GET /api/events
// @access  Public (or Private)
export const getEvents = async (req: Request, res: Response) => {
  const events = await Event.find({}).sort({ date: -1 });
  res.json(events);
};

// @desc    Get single event
// @route   GET /api/events/:id
// @access  Public
export const getEventById = async (req: Request, res: Response) => {
  const event = await Event.findById(req.params.id);

  if (event) {
    res.json(event);
  } else {
    res.status(404).json({ message: '未找到该赛事' });
  }
};

// @desc    Create an event
// @route   POST /api/events
// @access  Private
export const createEvent = async (req: AuthRequest, res: Response) => {
  const {
    name,
    type,
    date,
    location,
    cover_image,
    description,
    judges,
    base_fee,
    additional_fee,
  } = req.body;

  const event = new Event({
    name,
    type,
    date,
    location,
    cover_image,
    description,
    judges,
    base_fee,
    additional_fee,
  });

  try {
    const createdEvent = await event.save();
    res.status(201).json(createdEvent);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update event
// @route   PUT /api/events/:id
// @access  Private
export const updateEvent = async (req: AuthRequest, res: Response) => {
  const event = await Event.findById(req.params.id);

  if (event) {
    Object.assign(event, req.body);
    const updatedEvent = await event.save();
    res.json(updatedEvent);
  } else {
    res.status(404).json({ message: '未找到该赛事' });
  }
};

// @desc    Delete event
// @route   DELETE /api/events/:id
// @access  Private
export const deleteEvent = async (req: AuthRequest, res: Response) => {
  const event = await Event.findById(req.params.id);

  if (event) {
    await event.deleteOne();
    res.json({ message: '赛事已删除' });
  } else {
    res.status(404).json({ message: '未找到该赛事' });
  }
};
