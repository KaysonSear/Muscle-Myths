import mongoose, { Document, Schema } from 'mongoose';

export interface IAthlete extends Document {
  name: string;
  gender: 'male' | 'female';
  bib_number: string;
  phone: string;
  nationality: string;
  id_type: string;
  id_number: string;
  birthdate?: Date;
  age?: number;
  height?: number;
  weight?: number;
  drug_test: boolean;
  registration_channel: string;
  notes?: string;
  email?: string;
  media?: string[];
}

const AthleteSchema = new Schema<IAthlete>(
  {
    name: { type: String, required: true },
    gender: { type: String, enum: ['male', 'female'], required: true },
    bib_number: { type: String }, // Not required initially
    phone: { type: String, required: true },
    nationality: { type: String, required: true },
    id_type: { type: String, required: true },
    id_number: { type: String, required: true },
    birthdate: { type: Date },
    age: { type: Number },
    height: { type: Number },
    weight: { type: Number },
    drug_test: { type: Boolean, default: false },
    registration_channel: { type: String, required: true },
    notes: { type: String },
    email: { type: String },
    media: [{ type: String }],
  },
  {
    timestamps: true,
    optimisticConcurrency: true,
  }
);

// Indexes
AthleteSchema.index({ phone: 1 }, { unique: true });
AthleteSchema.index({ bib_number: 1 }, { unique: true });
AthleteSchema.index({ name: 1 });

const Athlete = mongoose.model<IAthlete>('Athlete', AthleteSchema);
export default Athlete;

