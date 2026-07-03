import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  role: { 
    type: String, 
    enum: ['Founder', 'Junior Under Officer', 'Member'], 
    default: 'Member' 
  },
  allowedStages: [{ 
    type: String, 
    enum: ['todo', 'production', 'checking'] 
  }]
}, { timestamps: true });

export default mongoose.models.User || mongoose.model('User', UserSchema);