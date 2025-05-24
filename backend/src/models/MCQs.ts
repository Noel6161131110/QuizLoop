import mongoose from 'mongoose';

const MCQSchema = new mongoose.Schema({
  videoId: String,
  segmentIndex: Number,
  start: Number,
  end: Number,
  question: String,
  options: [String],
  answer: String,
});

export default mongoose.model('MCQs', MCQSchema);