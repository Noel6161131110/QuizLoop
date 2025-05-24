import { Router } from 'express';
import multer from 'multer';
import { FileController, uploadPath, uploadPathChunks } from '../controllers/FileController.ts';
import fs from 'fs-extra';
import path from 'path';

const router = Router();
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadPathChunks);
  },
  filename: (req, file, cb) => {
    const baseFileName = file.originalname.replace(/\s+/g, '');

    fs.readdir(uploadPathChunks, (err: NodeJS.ErrnoException | null, files: string[]) => {
      if (err) {
        return cb(err, baseFileName);
      }

      // Filter files that match the base filename
      const matchingFiles = files.filter((f: string) => f.startsWith(baseFileName));

      let chunkNumber = 0;
      if (matchingFiles.length > 0) {
        // Extract the highest chunk number
        const highestChunk = Math.max(
          ...matchingFiles.map((f: string) => {
            const match = f.match(/\.part_(\d+)$/);
            return match ? parseInt(match[1], 10) : -1;
          })
        );
        chunkNumber = highestChunk + 1;
      }

      const fileName = `${baseFileName}.part_${chunkNumber}`;
      cb(null, fileName);
    });
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 2048 * 1024 * 1024 }, 
  fileFilter: (req, file, cb) => {
    if (
      file.mimetype.startsWith('video/') ||
      file.mimetype === 'application/octet-stream'
    ) {
      cb(null, true);
    } else {
      cb(new Error('Not a video file. Please upload only videos.'));
    }
  },
});


const storageThumbnail = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, 'uploads/thumbnails/'); // Make sure this path exists or create it
  },
  filename: function (_req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `thumb-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter for image types
const fileFilter = (_req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed as thumbnail.'));
  }
};

const uploadThumbnail = multer({ storage: storageThumbnail, fileFilter });
/**
 * @swagger
 * /api/files:
 *   post:
 *     summary: Upload a video chunk
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: video
 *         type: file
 *         description: The video file
 *     responses:
 *       200:
 *         description: Upload successful
 */

router.post('', upload.single('video'), FileController.uploadVideo);


/**
 * @swagger
 * /api/files/thumbnail:
 *   post:
 *     summary: Upload Thumbnail
 *     consumes:
 *       - multipart/form-data
 *     parameters:
 *       - in: formData
 *         name: thumbnail
 *         type: file
 *         description: thumbnail image
 *     responses:
 *       200:
 *         description: Upload successful
 */

router.post('/thumbnail', uploadThumbnail.single('thumbnail'), FileController.uploadThumbnail);


/**
 * @swagger
 * /api/files/thumbnails/{filename}:
 *   get:
 *     summary: Get Thumbnail Image by filename
 *     parameters:
 *       - in: path
 *         name: filename
 *         required: true
 *         schema:
 *           type: string
 *         description: The name of the thumbnail image file to retrieve
 *     responses:
 *       200:
 *         description: Returns the thumbnail image
 *         content:
 *           image/png:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Thumbnail not found
 */

router.get('/thumbnails/:filename', FileController.getThumbnailImage);

/**
 * @swagger
 * /api/files/videos:
 *   get:
 *     summary: Retrieve all uploaded videos metadata
 *     responses:
 *       200:
 *         description: A list of videos metadata
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                     description: Video ID
 *                   filename:
 *                     type: string
 *                   originalname:
 *                     type: string
 *                   size:
 *                     type: integer
 *                   uploadDate:
 *                     type: string
 *                     format: date-time
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/files/{fileId}:
 *   get:
 *     summary: Get video metadata by file ID
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the video file
 *     responses:
 *       200:
 *         description: Video metadata object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 _id:
 *                   type: string
 *                 filename:
 *                   type: string
 *                 originalname:
 *                   type: string
 *                 size:
 *                   type: integer
 *                 uploadDate:
 *                   type: string
 *                   format: date-time
 *       404:
 *         description: Video not found
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/files:
 *   delete:
 *     summary: Delete a video file by file ID
 *     parameters:
 *       - in: query
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the video file to delete
 *     responses:
 *       200:
 *         description: Video deleted successfully
 *       404:
 *         description: Video not found
 *       400:
 *         description: Missing or invalid fileId parameter
 *       500:
 *         description: Internal server error
 */

/**
 * @swagger
 * /api/files/stream/{fileId}:
 *   get:
 *     summary: Stream video file by file ID
 *     parameters:
 *       - in: path
 *         name: fileId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the video file to stream
 *     responses:
 *       200:
 *         description: Video stream
 *         content:
 *           video/mp4:
 *             schema:
 *               type: string
 *               format: binary
 *       404:
 *         description: Video not found
 *       500:
 *         description: Internal server error
 */

router.get('/videos', FileController.getAllVideos);

router.get('/:fileId', FileController.getFileById);

router.delete('', FileController.deleteVideo);

router.get('/stream/:fileId', FileController.streamVideo);

export default router;