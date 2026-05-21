import mongoose from 'mongoose';

export interface IPollutionReport {
  title: string;
  description: string;
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  pollutionType: 'traffic' | 'infrastructure' | 'road' | 'industrial_waste' | 'environment' | 'water_pollution' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected';
  reporterId: mongoose.Types.ObjectId;
  adminId?: mongoose.Types.ObjectId;
  adminNotes?: string;
  images?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const pollutionReportSchema = new mongoose.Schema<IPollutionReport>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: true
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  pollutionType: { 
    type: String, 
    enum: ['traffic', 'infrastructure', 'road', 'industrial_waste', 'environment', 'water_pollution', 'other'], 
    required: true 
  },
  severity: { 
    type: String, 
    enum: ['low', 'medium', 'high', 'critical'], 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'in_progress', 'resolved', 'rejected'], 
    default: 'pending' 
  },
  reporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminNotes: { type: String },
  images: [String]
}, {
  timestamps: true
});

pollutionReportSchema.index({ location: '2dsphere' });

export const PollutionReport = mongoose.model<IPollutionReport>('PollutionReport', pollutionReportSchema);
