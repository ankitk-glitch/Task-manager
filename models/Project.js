import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  clientSpecification: { type: String, required: true },
  stage: { 
    type: String, 
    enum: ['todo', 'production', 'checking'], 
    default: 'todo' 
  },
  assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);