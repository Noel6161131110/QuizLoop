import express from 'express';
import MCQs from '../models/MCQs.ts';

const MCQController = {
    getAllMCQsGroupedBySegment: async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            const { videoId } = req.body;

            if (!videoId) {
                res.status(400).json({ error: 'videoId parameter is required' });
                return;
            }


            const mcqs = await MCQs.find({ videoId })
                .sort({ segmentIndex: 1 })
                .lean();

            if (!mcqs.length) {
                res.status(404).json({ error: 'No MCQs found for this videoId' });
                return;
            }

            const mcqsWithMinutes = mcqs.map((mcq) => ({
                _id: mcq._id,
                segmentIndex: mcq.segmentIndex,
                start: typeof mcq.start === 'number' ? mcq.start / 60 : 0,
                end: typeof mcq.end === 'number' ? mcq.end / 60 : 0,
                question: mcq.question,
                options: mcq.options,
                answer: mcq.answer,
            }));

            res.json({ result: mcqsWithMinutes });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },

    editMCQById: async (req: express.Request, res: express.Response): Promise<void> => {
        try {
            const { _id, question, options, answer } = req.body;

            if (!_id || !question || !options || !answer) {
                res.status(400).json({ error: 'Missing required fields (_id, question, options, answer)' });
                return;
            }

            const updatedMCQ = await MCQs.findByIdAndUpdate(
                _id,
                {
                    question,
                    options,
                    answer,
                },
                { new: true }
            ).lean();

            if (!updatedMCQ) {
                res.status(404).json({ error: 'MCQ not found' });
                return;
            }

            res.json({ result: updatedMCQ });
        } catch (error) {
            console.error('Error updating MCQ:', error);
            res.status(500).json({ error: 'Internal server error' });
        }
    },
};

export default MCQController;