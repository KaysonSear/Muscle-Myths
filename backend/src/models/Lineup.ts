import mongoose, { Document, Schema } from 'mongoose';

export interface ILineup extends Document {
  event_id: mongoose.Types.ObjectId;
  lineup: {
    order: number;
    athlete_id: mongoose.Types.ObjectId;
    category: string;
    is_display: boolean;
    is_retired: boolean;
    group_id?: string;
  }[];
  merged_groups: {
    group_id: string;
    categories: string[];
  }[];
}

const LineupSchema = new Schema<ILineup>(
  {
    event_id: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    lineup: [
      {
        order: { type: Number, required: true },
        athlete_id: {
          type: Schema.Types.ObjectId,
          ref: 'Athlete',
          required: true,
        },
        category: { type: String, required: true },
        is_display: { type: Boolean, default: true },
        is_retired: { type: Boolean, default: false },
        group_id: { type: String },
      },
    ],
    merged_groups: [
      {
        group_id: { type: String },
        categories: [{ type: String }],
      },
    ],
  },
  {
    timestamps: true,
  }
);

const Lineup = mongoose.model<ILineup>('Lineup', LineupSchema);
export default Lineup;

