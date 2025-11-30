import mongoose, { Document, Schema } from 'mongoose';

export interface IRegistration extends Document {
  event_id: mongoose.Types.ObjectId;
  athlete_id: mongoose.Types.ObjectId;
  categories: {
    level1: string;
    level2: string;
    level3: string;
    display_name: string;
    is_primary: boolean;
  }[];
  services: {
    service_type: string;
    category?: string;
    price: number;
  }[];
  total_fee: number;
  notes?: string;
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    event_id: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    athlete_id: { type: Schema.Types.ObjectId, ref: 'Athlete', required: true },
    categories: [
      {
        level1: { type: String, required: true },
        level2: { type: String, required: true },
        level3: { type: String, required: true },
        display_name: { type: String, required: true },
        is_primary: { type: Boolean, default: false },
      },
    ],
    services: [
      {
        service_type: { type: String, required: true },
        category: { type: String },
        price: { type: Number, required: true },
      },
    ],
    total_fee: { type: Number, required: true },
    notes: { type: String },
  },
  {
    timestamps: true,
  }
);

RegistrationSchema.index({ event_id: 1, athlete_id: 1 });
RegistrationSchema.index({ athlete_id: 1 });

const Registration = mongoose.model<IRegistration>(
  'Registration',
  RegistrationSchema
);
export default Registration;

