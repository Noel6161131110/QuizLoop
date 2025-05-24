import mongoose from "mongoose";

const FileSchema = new mongoose.Schema({
  fileId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
  },
  title: {
    type: String,
    required: true, 
  },
  fileName: {
    type: String,
    required: true,
  },
  noOfMCQs: {
    type: Number,
    required: false,
    default: 0
  },
  fileType: {
    type: String,
    required: true,
  },
  filePath: {
    type: String,
    required: true,
  },
  mimeType: {
    type: String,
    required: true,
  },
  fileSizeInBytes: {
    type: Number,
    required: true,
  },
  durationInSeconds: {
    type: Number,
    default: null,
  },
  resolution: {
    width: { type: Number, default: null },
    height: { type: Number, default: null },
  },
  uploadedAt: {
    type: Date,
    default: Date.now,
  },
  description: {
    type: String,
  },
  isThumbnail: {
    type: Boolean,
    default: false
  },
  tags: [String],
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {},
  }
});

export default mongoose.model('FileDetails', FileSchema);