import mongoose, { Document, Schema } from 'mongoose';

export interface IScore extends Document {
  event_id: mongoose.Types.ObjectId;
  category: string;
  athlete_id: mongoose.Types.ObjectId;
  judge_scores: number[];
  total_score: number;
  rank: number;
  is_champion: boolean;
  is_retired: boolean;
}

const ScoreSchema = new Schema<IScore>(
  {
    event_id: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
    category: { type: String, required: true },
    athlete_id: { type: Schema.Types.ObjectId, ref: 'Athlete', required: true },
    judge_scores: [{ type: Number }],
    total_score: { type: Number, default: 0 },
    rank: { type: Number, default: 0 },
    is_champion: { type: Boolean, default: false },
    is_retired: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

ScoreSchema.index({ event_id: 1, category: 1, rank: 1 });

const Score = mongoose.model<IScore>('Score', ScoreSchema);
export default Score;

