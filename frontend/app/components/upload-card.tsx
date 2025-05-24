import { useCallback, useState, useEffect, useRef } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, MinusCircleIcon, PlusCircleIcon, UploadIcon } from "lucide-react";
import { api } from "~/api/axios";

interface UploadCardProps {
  setShowUpload: React.Dispatch<React.SetStateAction<boolean>>;
  setShowPreviewSize: React.Dispatch<React.SetStateAction<boolean>>;
  showPreviewSize: boolean;
  onUploadSuccess: () => void | Promise<void>; // ← add this line
}

const UploadCard = ({ setShowUpload, setShowPreviewSize, showPreviewSize, onUploadSuccess }: UploadCardProps) => {
  const [noOfMCQs, setNoOfMCQs] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [thumbnail, setThumbnail] = useState<string | null>(null);

  const [thumbnailFileId, setThumbnailFileId] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);

  const videoRef = useRef<HTMLVideoElement>(null);

  const handleIncrement = () => {
    setNoOfMCQs((prev: number) => (prev < 8 ? prev + 1 : prev));
  };

  const handleDecrement = () => {
    setNoOfMCQs((prev: number) => (prev > 0 ? prev - 1 : prev));
  };

  const handleUpload = async () => {
    if (!videoFile || !thumbnail || duration == null) return;

    try {
      const base64Data = thumbnail.split(",")[1];
      const binary = atob(base64Data);
      const array = [];
      for (let i = 0; i < binary.length; i++) array.push(binary.charCodeAt(i));
      const blob = new Blob([new Uint8Array(array)], { type: "image/png" });

      const thumbFormData = new FormData();
      thumbFormData.append("thumbnail", blob, "thumbnail.png");
      thumbFormData.append("title", "thumbnail Image Lecture");


      const thumbRes = await api.post("/api/files/thumbnail", thumbFormData);
      const thumbnailFileId = thumbRes.data.fileId;


      const chunkSize = 10 * 1024 * 1024;
      const totalChunks = Math.ceil(videoFile.size / chunkSize);

      for (let start = 0; start < videoFile.size; start += chunkSize) {
        const chunk = videoFile.slice(start, start + chunkSize);
        const currentChunk = Math.floor(start / chunkSize);

        const formData = new FormData();
        formData.append("video", chunk, videoFile.name);
        formData.append("chunk", currentChunk.toString());
        formData.append("totalChunks", totalChunks.toString());
        formData.append("originalname", videoFile.name);
        formData.append("filename", videoFile.name);
        formData.append("thumbnailFileId", thumbnailFileId);
        formData.append("title", videoFile.name);
        formData.append("noOfMCQs", noOfMCQs.toString());
        formData.append("durationInSeconds", Math.floor(duration).toString());

        const res = await api.post("/api/files", formData);

        if (res.status !== 200) {
          throw new Error("Chunk upload failed");
        }

        const progress = Math.round(((start + chunk.size) / videoFile.size) * 100);
        setProgress(progress);

        if (progress === 100) {
          setShowUpload(false);

          await onUploadSuccess();

        }
      }

    } catch (error) {
      console.error("Upload failed:", error);
      alert("Upload failed.");
    }
  };


  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file && file.type.startsWith("video/")) {
      setVideoFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      "video/*": [],
    },
  });

  useEffect(() => {
    if (videoFile) {
      const url = URL.createObjectURL(videoFile);
      const video = document.createElement("video");
      video.src = url;
      video.currentTime = 1;

      video.addEventListener("loadeddata", () => {
        setDuration(video.duration);
        const canvas = document.createElement("canvas");
        canvas.width = 320;
        canvas.height = 180;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setThumbnail(canvas.toDataURL("image/png"));
          setShowPreviewSize(true);
        }

        URL.revokeObjectURL(url);
      });
    }
  }, [videoFile]);

  return (
    <div
      className={`relative w-full mx-auto px-2 ${showPreviewSize ? 'sm:max-w-[100%]' : 'sm:max-w-lg'
        } max-w-lg`}
    >
      <button
        onClick={() => setShowUpload(false)}
        className="absolute -top-16 -right-6 sm:-top-20 sm:-right-6 bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-full w-9 h-9 sm:w-12 sm:h-12 flex items-center justify-center shadow-sm hover:bg-gray-100 dark:hover:bg-zinc-800 transition"
      >
        <X />
      </button>

      {videoFile && thumbnail ? (
        <div className="w-full border rounded-2xl overflow-hidden shadow-md relative">

          <img
            src={thumbnail}
            alt="Video thumbnail"
            className="w-full object-cover h-40 sm:h-80"
          />

          <div className="absolute inset-0 z-10 overflow-hidden">

            <div
              className="absolute top-0 left-0 h-full w-full bg-[#1E1E1E] opacity-70 transition-all duration-500 ease-in-out"
              style={{ transform: `translateX(${progress}%)` }}
            ></div>


            <div className="absolute bottom-4 right-4 font-outfit font-bold text-5xl sm:text-9xl bg-gradient-to-t from-[#999999] to-[#e1e1e1] bg-clip-text text-transparent z-20">
              {progress}%
            </div>
          </div>


        </div>
      ) : (
        <div className="flex items-center justify-center min-h-[200px] sm:h-[300px] w-full">
          <div
            {...getRootProps()}
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 sm:p-8 w-full h-full flex flex-col items-center justify-center text-center transition hover:border-primary cursor-pointer"
          >
            <input {...getInputProps()} />
            <UploadCloud className="w-10 h-10 text-gray-500 dark:text-gray-400 mb-4" />
            {isDragActive ? (
              <p className="text-gray-600 dark:text-gray-300">Drop the video file here ...</p>
            ) : (
              <>
                <p className="text-gray-600 dark:text-gray-300 font-medium">
                  Drag and drop your video file here, or click to select
                </p>
                <p className="text-xs text-gray-400 mt-1">Only one video file at a time</p>
              </>
            )}
          </div>
        </div>
      )}
      {videoFile && thumbnail && (
        <div className="pt-4">
          <p className="font-semibold font-outfit text-xl sm:text-5xl">{videoFile.name}</p>
          <p className="text-sm text-[rgba(84,84,84,0.8)] sm:text-2xl mt-4">
            {duration ? (() => {
              const hours = Math.floor(duration / 3600);
              const minutes = Math.floor((duration % 3600) / 60);
              return `${hours > 0 ? `${hours}h ` : ''}${minutes}min`;
            })() : "Loading..."}
          </p>
          <div className="text-sm text-[rgba(84,84,84,0.9)] sm:text-3xl mt-4 inline-flex items-center gap-x-2">
            <span>How many MCQs in each 5 min segment?</span>

            <button
              onClick={handleDecrement}
              className={`ml-6 mr-3 transition-colors ${noOfMCQs === 0 ? "opacity-50 cursor-not-allowed" : "hover:text-red-500"
                }`}
              aria-label="Decrease MCQs"
              disabled={noOfMCQs === 0}
            >
              <MinusCircleIcon className="w-6 h-6" />
            </button>

            <span className="font-semibold w-6 text-center inline-block">
              {noOfMCQs}
            </span>

            <button
              onClick={handleIncrement}
              className={`ml-3 transition-colors ${noOfMCQs === 8 ? "opacity-50 cursor-not-allowed" : "hover:text-green-500"
                }`}
              aria-label="Increase MCQs"
              disabled={noOfMCQs === 8}
            >
              <PlusCircleIcon className="w-6 h-6" />
            </button>
          </div>


          <div className="relative w-full h-full flex justify-end items-end py-2 sm:p-2">
            <button
              onClick={handleUpload}

              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 sm:px-5 sm:py-3 rounded-full shadow-md transition duration-200 text-sm">
              <UploadIcon className="w-3 h-3 sm:w-5 sm:h-5" />
              Upload
            </button>
          </div>
        </div>)}

    </div>
  );
};

export default UploadCard;