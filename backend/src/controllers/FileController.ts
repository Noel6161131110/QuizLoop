import express from 'express';
import FileDetails from '../models/FileDetails.ts';
import MCQs from '../models/MCQs.ts';
import mongoose from 'mongoose';
import fs from 'fs-extra';
import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';
import { sendTestMessage } from './sendMessage.ts';

interface MulterRequestVideo extends express.Request {
  file?: Express.Multer.File;
  body: {
    chunk: string;
    totalChunks: string;
    originalname: string;
    [key: string]: any;
  };
}

interface MulterRequestThumbnail extends express.Request {
  file?: Express.Multer.File;

}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadPath = path.join(process.cwd(), 'uploads/videos');
const uploadThumbnailPath = path.join(process.cwd(), 'uploads/thumbnails')
const uploadPathChunks = path.join(process.cwd(), 'chunks');

(async () => {
  await fs.mkdir(uploadPath, { recursive: true });
  await fs.mkdir(uploadPathChunks, { recursive: true });
  await fs.mkdir(uploadThumbnailPath, { recursive: true });
})();

const MAX_RETRIES = 5;
const RETRY_DELAY = 1000;

const delay = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

async function mergeChunks(fileName: string, totalChunks: number) {

  const finalPath = path.join(uploadPath, fileName);
  await fs.promises.writeFile(finalPath, '');

  for (let i = 0; i < totalChunks; i++) {
    const chunkPath = path.join(uploadPathChunks, `${fileName}.part_${i}`);
    let retries = 0;

    while (retries < MAX_RETRIES) {
      try {
        const chunkData = await fs.promises.readFile(chunkPath);
        await fs.promises.appendFile(finalPath, chunkData);
        await fs.promises.unlink(chunkPath);
        console.log(`Chunk ${i} merged and deleted successfully`);
        break;
      } catch (error) {
        if (
          typeof error === 'object' &&
          error !== null &&
          'code' in error &&
          typeof (error as any).code === 'string'
        ) {
          if ((error as any).code === 'EBUSY') {
            console.log(`Chunk ${i} is busy, retrying... (${retries + 1}/${MAX_RETRIES})`);
            await delay(RETRY_DELAY);
            retries++;
          } else {
            throw error;
          }
        }
      }
    }

    if (retries === MAX_RETRIES) {
      console.error(`Failed to merge chunk ${i} after ${MAX_RETRIES} retries`);

      throw new Error(`Failed to merge chunk ${i}`);
    }
  }


  console.log('Chunks merged successfully');
}

const FileController = {
  uploadVideo: async (req: MulterRequestVideo, res: express.Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'No video file uploaded.' });
      return;
    }

    try {
      const chunkNumber = Number(req.body.chunk);
      const totalChunks = Number(req.body.totalChunks);
      const thumbnailFileId = req.body.thumbnailFileId;
      const durationInSeconds = req.body.durationInSeconds;

      const fileName = req.file.originalname.replace(/\s+/g, '');

      if (chunkNumber === totalChunks - 1) {
        await mergeChunks(fileName, totalChunks);


        const mergedFilePath = path.join('uploads/videos/', fileName);


        const newFile = new FileDetails({
          fileId: new mongoose.Types.ObjectId(),
          title: req.body.title,
          filePath: `videos/${req.body.filename}`,
          fileName: req.body.filename,
          fileType: 'video',
          noOfMCQs: req.body.noOfMCQs,
          mimeType: req.file.mimetype,
          fileSizeInBytes: req.file.size,
          durationInSeconds: durationInSeconds || null,
          resolution: {
            width: null,
            height: null,
          },
          isThumbnail: false,
          tags: [],
          metadata: {
            thumbnailFileId: thumbnailFileId || null
          },
        });

        const savedFile = await newFile.save();

        res.status(200).json({
          message: 'Video uploaded and saved successfully',
          fileId: savedFile._id,
        });

        sendTestMessage(`Generating MCQs for ${req.body.title}`)

        console.log
        const videoPath = path.resolve(mergedFilePath);
        console.log(videoPath)

        const worker = new Worker(
          new URL('../workers/processVideo.ts', import.meta.url),
          {
            workerData: {
              videoPath,
              fileId: savedFile._id.toString(),
              noOfMCQs: savedFile.noOfMCQs?.toString()
            },
            execArgv: ['--loader', 'ts-node/esm'],
          }
        );


        console.log('created worker')

        worker.on('message', msg => {
          console.log('Worker Message:', msg);
        });

        worker.on('error', err => {
          console.error('Worker error:', err);
        });

        worker.on('exit', code => {
          if (code !== 0) console.error(`Worker stopped with exit code ${code}`);
        });
      } else {
        res.status(200).json({
          message: 'Chunk uploaded successfully',
        });
      }

    } catch (error) {
      console.error('Error during file upload:', error);
      res.status(500).json({ error: 'An error occurred while uploading the video.' });
    }
  },

  uploadThumbnail: async (req: MulterRequestThumbnail, res: express.Response): Promise<void> => {
    if (!req.file) {
      res.status(400).json({ error: 'No video file uploaded.' });
      return;
    }

    try {
      const newFile = new FileDetails({
        fileId: new mongoose.Types.ObjectId(),
        title: req.body.title || req.file.filename,
        filePath: `/thumbnails/${req.file.filename}`,
        fileName: req.file.filename,
        fileType: 'image',
        mimeType: req.file.mimetype,
        fileSizeInBytes: req.file.size,
        isThumbnail: true,
        resolution: {
          width: null,
          height: null,
        },
        tags: [],
        metadata: {},
      });

      const savedFile = await newFile.save();

      res.status(200).json({
        message: 'Thumbnail uploaded and saved successfully',
        fileId: savedFile._id,
        title: req.body.title,
        filename: req.file.filename,
        path: req.file.path,
      });
      return;
    } catch (error) {
      console.error('Error during file upload:', error);
      res.status(500).json({ error: 'An error occurred while uploading the video.' });
    }

  },

  getThumbnailImage: async (req: MulterRequestThumbnail, res: express.Response): Promise<void> => {

    const { filename } = req.params;
    const filePath = path.join(__dirname, '../../uploads/thumbnails/', filename);

    fs.access(filePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error('Thumbnail not found:', err);
        res.status(404).json({ error: 'Thumbnail not found' });
      } else {
        res.sendFile(filePath);
      }
    });
  },

  getAllVideos: async (req: express.Request, res: express.Response): Promise<void> => {
    try {

      const videos = await FileDetails.find({ fileType: 'video' });

      const response = await Promise.all(videos.map(async (video) => {
        const thumbnailId = video.metadata?.thumbnailFileId;

        let thumbnail = null;
        if (thumbnailId) {
          thumbnail = await FileDetails.findOne({
            _id: thumbnailId,
            isThumbnail: true
          });
        }

        console.log(thumbnail, thumbnailId)

        return {
          videoFileName: video.title,
          thumbnailUrl: thumbnail ? `/api/files/thumbnails/${thumbnail.fileName}` : null,
          fileId: video._id,
          videoUrl: video ? `/api/files/stream/${video._id}` : null,
          durationInSeconds: video.durationInSeconds,
          uploadedAt: video.uploadedAt
        };
      }));

      res.status(200).json({ 'result': response });
    } catch (error) {
      console.error('Failed to fetch videos with thumbnails:', error);
      res.status(500).json({ error: 'Failed to fetch videos with thumbnails' });
    }
  },

  deleteVideo: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { fileId } = req.body;

      if (!fileId) {
        res.status(400).json({ message: 'fileId is required' });
        return;
      }

      const videoFile = await FileDetails.findById(fileId);

      if (!videoFile) {
        res.status(404).json({ message: 'Video file not found' });
        return;
      }

      const uploadsDir = path.resolve(__dirname, '../../uploads');

      const thumbnailId = videoFile.metadata?.thumbnailFileId;
      if (thumbnailId) {
        const thumbnailFile = await FileDetails.findById(thumbnailId);
        if (thumbnailFile) {
          const thumbnailFullPath = path.join(uploadsDir, thumbnailFile.filePath);
          try {
            await fs.remove(thumbnailFullPath);
            console.log(`Deleted thumbnail: ${thumbnailFullPath}`);
          } catch (err) {
            console.warn(`Failed to delete thumbnail at: ${thumbnailFullPath}`, err);
          }
          await FileDetails.deleteOne({ _id: thumbnailId });
        }
      }

      const deleteResult = await MCQs.deleteMany({ videoId: fileId });

      if (deleteResult.deletedCount && deleteResult.deletedCount > 0) {
        console.log(`Deleted ${deleteResult.deletedCount} MCQs for videoId: ${fileId}`);
      } else {
        console.log(`No MCQs found for videoId: ${fileId} to delete.`);
      }

      
      const videoFullPath = path.join(uploadsDir, videoFile.filePath);
      try {
        await fs.remove(videoFullPath);
        console.log(`Deleted video: ${videoFullPath}`);
      } catch (err) {
        console.warn(`Failed to delete video at: ${videoFullPath}`, err);
      }

      await FileDetails.deleteOne({ _id: fileId });

      res.status(200).json({ message: 'Video and thumbnail deleted successfully' });
    } catch (error) {
      console.error('Error deleting video:', error);
      res.status(500).json({ message: 'Internal server error' });
    }

  },

  streamVideo: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const fileId = req.params.fileId;

      const file = await FileDetails.findOne({
        _id: fileId,
        isThumbnail: false
      });

      const videoPath = path.resolve('uploads/', file?.filePath || '');

      console.log(videoPath);

      if (!fs.existsSync(videoPath)) {
        res.status(404).send('Video not found');
        return;
      }

      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        if (start >= fileSize) {
          res.status(416).send('Requested range not satisfiable\n' + start + ' >= ' + fileSize);
          return;
        }

        const chunkSize = end - start + 1;
        const file = fs.createReadStream(videoPath, { start, end });

        res.writeHead(206, {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunkSize,
          'Content-Type': 'video/mp4',
        });

        file.pipe(res);
      } else {
        // No range header, send entire video
        res.writeHead(200, {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        });

        fs.createReadStream(videoPath).pipe(res);
      }
    } catch (err) {
      console.error('Error streaming video:', err);
      res.status(500).send('Internal Server Error');
    }
  },

  getFileById: async (req: express.Request, res: express.Response): Promise<void> => {
    try {
      const { fileId } = req.params;

      if (!fileId) {
        res.status(400).json({ message: 'fileId is required' });
        return;
      }

      const videoFile = await FileDetails.findById(fileId);

      if (!videoFile) {
        res.status(404).json({ message: 'Video file not found' });
        return;
      }

      res.status(200).json({
        message: 'File details fetched successfully',
        data: videoFile,
      });
    } catch (error) {
      console.error("Error fetching file:", error);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
};

export { FileController, uploadPath, uploadPathChunks };