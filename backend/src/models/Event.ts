import mongoose, { Document, Schema } from 'mongoose';

export interface IEvent extends Document {
  name: string;
  type: string;
  date: Date;
  location: string;
  cover_image?: string;
  description?: string;
  judges: {
    name: string;
    title: string;
    avatar?: string;
  }[];
  base_fee: number;
  additional_fee: number;
  status: 'upcoming' | 'ongoing' | 'finished';
}

const EventSchema = new Schema<IEvent>(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    date: { type: Date, required: true },
    location: { type: String, required: true },
    cover_image: { type: String },
    description: { type: String },
    judges: [
      {
        name: { type: String, required: true },
        title: { type: String },
        avatar: { type: String },
      },
    ],
    base_fee: { type: Number, required: true },
    additional_fee: { type: Number, required: true },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'finished'],
      default: 'upcoming',
    },
  },
  {
    timestamps: true,
  }
);

EventSchema.index({ date: -1 });
EventSchema.index({ type: 1 });

const Event = mongoose.model<IEvent>('Event', EventSchema);
export default Event;

