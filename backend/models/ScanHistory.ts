import mongoose, { Document, Model, Schema } from 'mongoose';

export interface IScanHistory extends Document {
  userId: mongoose.Types.ObjectId;
  url: string;
  scanType: 'single' | 'compare';
  result: mongoose.Schema.Types.Mixed;
  createdAt: Date;
}

const scanHistorySchema = new Schema<IScanHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    url: {
      type: String,
      required: true,
    },
    scanType: {
      type: String,
      enum: ['single', 'compare'],
      required: true,
    },
    result: {
      type: Schema.Types.Mixed,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

scanHistorySchema.index({ userId: 1, createdAt: -1 });

const ScanHistory: Model<IScanHistory> = mongoose.model<IScanHistory>('ScanHistory', scanHistorySchema);
export default ScanHistory;
