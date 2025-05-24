import mongoose from 'mongoose';

const transcriptSchema = new mongoose.Schema({
    transcriptId: mongoose.Schema.Types.ObjectId,
    fileId: mongoose.Schema.Types.ObjectId,
    fileType: {
        type: String,
        required: true,
    },
    textSegments: [
        {
        start: Number,
        end: Number,
        text: String,
        },
    ],
});

export default mongoose.model('Transcript', transcriptSchema);