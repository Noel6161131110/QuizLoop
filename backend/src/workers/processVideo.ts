// worker.ts
import { parentPort, workerData } from 'worker_threads';
import ffmpeg from 'fluent-ffmpeg';
import fs from 'fs-extra';
import axios from 'axios';
import path from 'path';
import FormData from 'form-data';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { sendTestMessage } from '../controllers/sendMessage.ts';
import MCQs from '../models/MCQs.ts';
import ConnectDB from '../config/db.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const tempDir = path.resolve(__dirname, 'temp');

interface WorkerData {
  videoPath: string;
  fileId: string;
  noOfMCQs: string;
}
async function getVideoDuration(videoPath: string): Promise<number> {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(err);
      resolve(metadata.format.duration || 0);
    });
  });
}

async function extractSegmentWav(videoPath: string, outputPath: string, startTime: number): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .setStartTime(startTime)
      .setDuration(300) // 5 min segment
      .outputOptions('-ac', '1')
      .audioCodec('pcm_s16le')
      .format('wav')
      .on('end', () => resolve(outputPath))
      .on('error', reject)
      .save(outputPath);
  });
}

async function run(): Promise<void> {
  try {
    await ConnectDB();
    const { videoPath, fileId, noOfMCQs } = workerData as WorkerData;
    console.log('Worker started with data:', workerData);

    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const totalDuration = await getVideoDuration(videoPath);
    console.log('Total duration of video:', totalDuration);

    const segmentLength = 300;

    for (let start = 0, segIndex = 0; start < totalDuration; start += segmentLength, segIndex++) {
      const end = Math.min(start + segmentLength, totalDuration);
      const segmentPath = path.join(tempDir, `${fileId}_segment_${segIndex}.wav`);
      console.log(`Processing segment ${segIndex} from ${start}s to ${end}s`);

      await extractSegmentWav(videoPath, segmentPath, start);
      console.log(`Extracted WAV for segment ${segIndex}`);

      const formData = new FormData();
      formData.append('file', fs.createReadStream(segmentPath));

      console.log('Sending segment to STT API...');
      const sttRes = await axios.post('http://localhost:8000/api/v1/stt', formData, {
        headers: formData.getHeaders(),
      });

      const segmentTranscript = sttRes.data.transcription;
      console.log(`Transcript received for segment ${segIndex}`);

      // Send transcript for MCQ generation
      const mcqRes = await axios.post('http://localhost:8000/api/v1/mcq', {
        transcript: segmentTranscript,
        noOfMCQs: noOfMCQs,
      });

      const mcqs = mcqRes.data.result;

      // Save each MCQ to DB
      for (const mcq of mcqs) {
        const newMCQ = new MCQs({
          videoId: fileId,
          segmentIndex: segIndex,
          start: start,
          end: end,
          question: mcq.question,
          options: mcq.options,
          answer: mcq.answer,
        });

        await newMCQ.save();
      }

      parentPort?.postMessage(`MCQs generated and saved for segment ${segIndex}`);
      await sendTestMessage(`MCQs generated for segment ${segIndex}`);
      await fs.remove(segmentPath);
    }

    parentPort?.postMessage('All segments processed and MCQs stored');

  } catch (err: any) {
    console.error('Worker run() error:', err);
    parentPort?.postMessage(`Worker error: ${err.message}`);
  }
}

run();