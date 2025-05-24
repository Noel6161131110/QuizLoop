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

router.get('/videos', FileController.getAllVideos);

router.get('/:fileId', FileController.getFileById);

router.delete('', FileController.deleteVideo);

router.get('/stream/:fileId', FileController.streamVideo);

export default router;