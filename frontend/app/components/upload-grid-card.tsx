import { PlusIcon } from "lucide-react";
import { Card } from "./ui/card";

interface UploadCardProps {
  onClick: () => void;
}

const UploadGridCard: React.FC<UploadCardProps> = ({ onClick }) => {
  return (
    <div
      className="relative inline-block rounded-md
                 p-[4px] bg-transparent
                 group"
      style={{ backgroundClip: "padding-box" }}
    >
      {/* Rainbow border on hover */}
      <div
        className="absolute inset-0 rounded-md
                   bg-[length:400%_400%] bg-rainbow-gradient
                   opacity-0 group-hover:opacity-100
                   group-hover:animate-rainbow-border
                   transition-opacity duration-500
                   pointer-events-none"
        style={{ zIndex: 0 }}
      ></div>

      {/* Card inside with white background */}
      <Card
        onClick={onClick}
        className="relative z-10 aspect-[4/3] flex flex-col justify-center items-center
                   cursor-pointer p-4 bg-white rounded-md overflow-hidden
                   transition-transform duration-300 group-hover:scale-100"
      >
        <PlusIcon className="w-8 h-8 text-gray-500 transition-transform duration-300 group-hover:scale-110" />
        <div className="text-sm font-medium text-gray-600 transition-transform duration-300 group-hover:scale-110 text-center">
          Upload File
        </div>
      </Card>
    </div>
  );
};

export default UploadGridCard;