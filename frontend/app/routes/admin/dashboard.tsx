import { PlusIcon } from "lucide-react";
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { TrashIcon, PlayCircleIcon } from "lucide-react";
import { Toaster } from "~/components/ui/sonner"
import { useState, useEffect } from "react";
import UploadCard from "~/components/upload-card";
import { cn } from "~/lib/utils";
import {api, API_URL} from "~/api/axios";
import CircularProgressDemo from "~/components/customized/progress/progress-07";
import { Link } from "react-router";
import UploadGridCard from "~/components/upload-grid-card";

type Video = {
  videoFileName: string;
  thumbnailUrl: string;
  fileId: string,
  videoUrl: string;
  durationInSeconds: number;
  uploadedAt: string;
};



const Dashboard = () => {
const [progressMCQ, setProgressMCQ] = useState([100]);
  const [showUpload, setShowUpload] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [showPreviewSize, setShowPreviewSize] = useState(false);

  const fetchVideos = async () => {
    try {
      const response = await api.get<{ result: Video[] }>("/api/files/videos");
      setVideos(response.data.result);
    } catch (error) {
      console.error("Failed to fetch videos", error);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const DeleteVideo = async (fileId: string) => {
    try {
      await api.delete("/api/files", {
        data: { fileId },
      });

      await fetchVideos();
    } catch (error) {
      console.error("Failed to delete video", error);
    }
  };

  return (
    <main>
      
      <div className="max-h-screen flex-1 space-y-4 overflow-y-auto p-4 pt-6 md:p-8">
        <div className="flex items-center justify-center space-y-2">
          <div className="w-full max-w-3xl px-4">
            <svg
              viewBox="0 0 600 120"
              className="w-full h-auto overflow-visible"
              preserveAspectRatio="xMidYMid meet"
            >
              <defs>
                <linearGradient
                  id="movingGradient"
                  x1="0"
                  y1="0"
                  x2="1200"
                  y2="0"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0" stopColor="#ffdbbb" />
                  <stop offset="0.25" stopColor="#ffdbbb" />
                  <stop offset="0.5" stopColor="#ffdbbb" />
                  <stop offset="0.75" stopColor="#ffdbbb" />
                  <stop offset="1" stopColor="#ffdbbb" />
                </linearGradient>

                <mask id="textMask">
                  <text
                    x="50%"
                    y="80"
                    textAnchor="middle"
                    fontSize="80"
                    fontFamily="Arial Black"
                    fontStyle="italic"
                    fill="white"
                  >
                    QuizLoop
                  </text>
                </mask>
              </defs>

              <text
                x="50%"
                y="80"
                textAnchor="middle"
                fontSize="80"
                fontFamily="Arial Black"
                fontStyle="italic"
                fill="#111827"
              >
                QuizLoop
              </text>

              <g mask="url(#textMask)">
                <g className="wave-slide">
                  <path
                    fill="url(#movingGradient)"
                    d="M0,70 Q75,90 150,70 T300,70 T450,70 T600,70 V120 H0 Z"
                  />
                  <path
                    fill="url(#movingGradient)"
                    d="M0,70 Q75,90 150,70 T300,70 T450,70 T600,70 V120 H0 Z"
                    transform="translate(600, 0)"
                  />
                </g>
              </g>
            </svg>
          </div>
        </div>

        <hr className="border-t border-gray-200 dark:border-gray-700 my-4" />

        {showUpload && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center h-screen">
            <div
              className={cn(
                "bg-white dark:bg-zinc-900 p-6 shadow-xl relative transition-all",
                showPreviewSize
                  ? "w-[90%] sm:w-[50%] sm:h-[600px] rounded-3xl"
                  : "max-w-xs sm:max-w-lg w-full rounded-lg"
              )}
            >
              <UploadCard 
                setShowUpload={setShowUpload} 
                setShowPreviewSize={setShowPreviewSize} 
                showPreviewSize={showPreviewSize} 
                onUploadSuccess={fetchVideos}
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 px-4 lg:px-6">
       
          <div className="w-full flex flex-col">
            <UploadGridCard onClick={() => setShowUpload(true)} />
            <div className="mt-2 ml-2 text-base font-semibold text-left invisible select-none">
              Placeholder title
            </div>
          </div>

          {videos.map((video, i) => {
            const minutes = Math.floor(video.durationInSeconds / 60);
            const hours = Math.floor(minutes / 60);
            const remainingMinutes = minutes % 60;
            const durationFormatted = `${hours > 0 ? `${hours}h ` : ''}${remainingMinutes}min`;

            return (
              <div key={i} className="w-full flex flex-col">
                
                  <Card className="aspect-[4/3] w-full relative overflow-hidden rounded-md p-0 cursor-pointer">
                    <img
                      src={`http://localhost:3000${video.thumbnailUrl}`}
                      alt={video.videoFileName}
                      crossOrigin="anonymous"
                      className="absolute top-0 left-0 w-full h-full object-cover"
                    />

                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-t from-black/70 to-transparent z-10" />

                    <div className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded-full z-20">
                      {durationFormatted}
                    </div>

                    {progressMCQ[0] < 100 && (
                      <div className="absolute bottom-2 right-2 z-20">
                        <CircularProgressDemo progress={progressMCQ} />
                      </div>
                    )}

                    <div
                      className="absolute top-2 right-2 z-20 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md
                                hover:bg-red-100 hover:scale-105 transition-all duration-200 ease-in-out cursor-pointer"
                      onClick={() => DeleteVideo(video.fileId)}
                    >
                      <TrashIcon className="text-gray-700 hover:text-red-600 transition-colors duration-200" />
                    </div>
                    <Link to={`/watch/${video.fileId}`}>
                    <div
                      className="absolute bottom-2 left-2 z-20 bg-white/80 backdrop-blur-sm p-4 rounded-full shadow-md
                                hover:bg-gray-100 hover:scale-105 transition-all duration-200 ease-in-out cursor-pointer"
                    >
                      <PlayCircleIcon className="text-gray-700 hover:text-black transition-colors duration-200" />
                    </div>
                    </Link>
                  </Card>
            

                <div className="mt-2 ml-2 text-base font-semibold text-left truncate">
                  {video.videoFileName}
                </div>
              </div>
            );
          })}


        </div>

        
      </div>


    </main>
  );
};

export default Dashboard;

