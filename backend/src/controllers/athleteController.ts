import { Request, Response } from 'express';
import Athlete from '../models/Athlete.js';
import { AuthRequest } from '../middleware/authMiddleware.js';

// @desc    Get all athletes
// @route   GET /api/athletes
// @access  Private
export const getAthletes = async (req: Request, res: Response) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: 'i' } },
          { bib_number: { $regex: req.query.search, $options: 'i' } },
          { phone: { $regex: req.query.search, $options: 'i' } },
        ],
      }
    : {};

  const athletes = await Athlete.find({ ...keyword }).sort({ createdAt: -1 });
  res.json(athletes);
};

// @desc    Get single athlete
// @route   GET /api/athletes/:id
// @access  Private
export const getAthleteById = async (req: Request, res: Response) => {
  const athlete = await Athlete.findById(req.params.id);

  if (athlete) {
    res.json(athlete);
  } else {
    res.status(404).json({ message: '未找到该选手' });
  }
};

// @desc    Create an athlete
// @route   POST /api/athletes
// @access  Private
export const createAthlete = async (req: AuthRequest, res: Response) => {
  const {
    name,
    gender,
    bib_number,
    phone,
    nationality,
    id_type,
    id_number,
    birthdate,
    height,
    weight,
    drug_test,
    registration_channel,
    notes,
    media,
    email,
  } = req.body;

  // Calculate age if birthdate is provided
  let age;
  if (birthdate) {
    const today = new Date();
    const birthDate = new Date(birthdate);
    age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
  }

  const athlete = new Athlete({
    name,
    gender,
    bib_number,
    phone,
    nationality,
    id_type,
    id_number,
    birthdate,
    age,
    height,
    weight,
    drug_test,
    registration_channel,
    notes,
    media,
    email,
  });

  try {
    const createdAthlete = await athlete.save();
    res.status(201).json(createdAthlete);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update athlete
// @route   PUT /api/athletes/:id
// @access  Private
export const updateAthlete = async (req: AuthRequest, res: Response) => {
  const {
    name,
    gender,
    bib_number,
    phone,
    nationality,
    id_type,
    id_number,
    birthdate,
    height,
    weight,
    drug_test,
    registration_channel,
    notes,
  } = req.body;

  const athlete = await Athlete.findById(req.params.id);

  if (athlete) {
    athlete.name = name || athlete.name;
    athlete.gender = gender || athlete.gender;
    athlete.bib_number = bib_number || athlete.bib_number;
    athlete.phone = phone || athlete.phone;
    athlete.nationality = nationality || athlete.nationality;
    athlete.id_type = id_type || athlete.id_type;
    athlete.id_number = id_number || athlete.id_number;
    athlete.birthdate = birthdate || athlete.birthdate;
    athlete.height = height || athlete.height;
    athlete.weight = weight || athlete.weight;
    athlete.drug_test = drug_test !== undefined ? drug_test : athlete.drug_test;
    athlete.registration_channel =
      registration_channel || athlete.registration_channel;
    athlete.notes = notes || athlete.notes;

    if (athlete.birthdate) {
        const today = new Date();
        const birthDate = new Date(athlete.birthdate);
        let age = today.getFullYear() - birthDate.getFullYear();
        const m = today.getMonth() - birthDate.getMonth();
        if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
        athlete.age = age;
    }

    const updatedAthlete = await athlete.save();
    res.json(updatedAthlete);
  } else {
    res.status(404).json({ message: '未找到该选手' });
  }
};

// @desc    Delete athlete
// @route   DELETE /api/athletes/:id
// @access  Private
export const deleteAthlete = async (req: AuthRequest, res: Response) => {
  const athlete = await Athlete.findById(req.params.id);

  if (athlete) {
    await athlete.deleteOne();
    res.json({ message: '选手已删除' });
  } else {
    res.status(404).json({ message: '未找到该选手' });
  }
};
