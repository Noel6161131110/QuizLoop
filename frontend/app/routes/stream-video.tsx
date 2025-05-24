import { useEffect, useState } from "react";
import { useParams } from "react-router";
import { api } from "~/api/axios";
import { Pencil } from "lucide-react";
import dayjs from "dayjs";

interface MCQ {
  _id: string;
  question: string;
  options: string[];
  answer: string;
}

interface Segment {
  range: string;
  mcqs: MCQ[];
}

const WatchPage = () => {
  const { fileId } = useParams<{ fileId: string }>();
  const [segments, setSegments] = useState<Segment[]>([]);
  const [expandedSections, setExpandedSections] = useState<number[]>([]);
  const [revealedAnswers, setRevealedAnswers] = useState<{ [key: string]: string }>({});
  const [editingKey, setEditingKey] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<{ question: string; options: string[]; answer: string }>({
    question: "",
    options: [],
    answer: "",
  });

  const [fileDetails, setFileDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFileDetails = async () => {
      try {
        const res = await api.get(`/api/files/${fileId}`);
        setFileDetails(res.data.data);
      } catch (err) {
        console.error("Failed to fetch file details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (fileId) fetchFileDetails();
  }, [fileId]);

  const fetchMCQsforExport = async (): Promise<MCQ[]> => {
    try {
      const response = await api.post("/api/mcqs", { videoId: fileId });
      return response.data.result;
    } catch (error) {
      console.error("Failed to fetch MCQs:", error);
      return [];
    }
  };

  const handleExportClick = async () => {
    const rawMCQs = await fetchMCQsforExport();

    // Remove _id from each item
    const cleanedMCQs = rawMCQs.map(({ _id, ...rest }) => rest);

    const blob = new Blob([JSON.stringify(cleanedMCQs, null, 2)], {
      type: "application/json",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `mcqs_${fileId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const fetchMCQs = async () => {
    try {
      const response = await api.post("/api/mcqs", { videoId: fileId });
      const rawData = response.data.result;

      const grouped: Segment[] = [];

      rawData.forEach((item: any) => {
        const range = `${Math.floor(item.start)} - ${Math.ceil(item.end)} min`;

        let segment = grouped.find((s) => s.range === range);
        if (!segment) {
          segment = { range, mcqs: [] };
          grouped.push(segment);
        }

        segment.mcqs.push({
          _id: item._id,
          question: item.question,
          options: item.options,
          answer: item.answer,
        });
      });

      setSegments(grouped);
    } catch (err) {
      console.error("Failed to fetch MCQs:", err);
    }
  };

  useEffect(() => {
    if (fileId) {
      fetchMCQs();
    }
  }, [fileId]);

  const toggleSection = (index: number) => {
    setExpandedSections((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const revealAnswer = (segmentIndex: number, mcqIndex: number) => {
    const key = `${segmentIndex}-${mcqIndex}`;
    const answer = segments[segmentIndex].mcqs[mcqIndex].answer;
    setRevealedAnswers((prev) => ({ ...prev, [key]: answer }));
  };

  return (
    <div className="flex w-full min-h-screen bg-white text-gray-900">
      {/* Left: Video */}
      <div className="w-2/3 p-6 border-r border-gray-200">
        {loading ? (
          <p>Loading video...</p>
        ) : fileDetails ? (
          <>
            <div className="rounded-xl overflow-hidden shadow-md mb-4">
              <video
                controls
                autoPlay
                className="w-full aspect-video rounded-xl"
                style={{ backgroundColor: "#000" }}
              >
                <source
                  src={`http://localhost:3000/api/files/stream/${fileId}`}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>

            <h2 className="text-2xl font-semibold">{fileDetails.fileName}</h2>

            <div className="mt-2 flex items-center space-x-3 text-gray-600 text-sm">
              <span>
                Uploaded on:{" "}
                {dayjs(fileDetails.uploadedAt).format("MMMM D, YYYY h:mm A")}
              </span>

              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full uppercase font-medium">
                {fileDetails.fileType}
              </span>

              <span
                onClick={handleExportClick}
                className="cursor-pointer px-3 py-1.5 bg-gradient-to-r from-orange-400 to-yellow-400 text-gray-50 text-xs rounded-full uppercase font-semibold shadow-md transition duration-300 ease-in-out hover:from-yellow-400 hover:to-orange-500 hover:shadow-lg"
              >
                Export JSON
              </span>

            </div>
          </>
        ) : (
          <p>File not found.</p>
        )}
      </div>
      {/* Right: MCQs */}
      <div className="w-1/3 p-6 overflow-y-auto">
        <h3 className="text-xl font-bold mb-4">MCQs</h3>
        {segments.map((segment, segmentIndex) => (
          <div key={segmentIndex} className="mb-4 border border-gray-200 rounded-md shadow-sm">
            <button
              className="flex justify-between w-full px-4 py-3 text-left font-medium text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-t-md"
              onClick={() => toggleSection(segmentIndex)}
            >
              <span>{segment.range}</span>
              <span>{expandedSections.includes(segmentIndex) ? "▲" : "▼"}</span>
            </button>

            {expandedSections.includes(segmentIndex) && (
              <div className="bg-white px-4 py-3 space-y-4">
                {segment.mcqs.map((mcq, mcqIndex) => {
                  const key = `${segmentIndex}-${mcqIndex}`;
                  const revealed = revealedAnswers[key];

                  return (
                    <div key={mcqIndex} className="border border-gray-200 p-3 rounded-md">
                      {editingKey === mcq._id ? (
                        <>
                          <label className="block text-sm font-medium mb-1">Question</label>
                          <input
                            type="text"
                            value={editForm.question}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, question: e.target.value }))
                            }
                            className="w-full p-2 border rounded mb-2"
                          />

                          <label className="block text-sm font-medium mb-1">Options</label>
                          {editForm.options.map((option, i) => (
                            <input
                              key={i}
                              type="text"
                              value={option}
                              onChange={(e) => {
                                const newOptions = [...editForm.options];
                                newOptions[i] = e.target.value;
                                setEditForm((prev) => ({ ...prev, options: newOptions }));
                              }}
                              className="w-full p-2 border rounded mb-2"
                            />
                          ))}

                          <label className="block text-sm font-medium mb-1 text-green-600">Answer</label>
                          <input
                            type="text"
                            value={editForm.answer}
                            onChange={(e) =>
                              setEditForm((prev) => ({ ...prev, answer: e.target.value }))
                            }
                            className="w-full p-2 border-2 border-green-500 rounded mb-2"
                          />

                          <div className="flex gap-2">
                            <button
                              className="bg-green-600 text-white px-3 py-1 rounded"
                              onClick={async () => {
                                if (!editForm.options.includes(editForm.answer)) {
                                  alert("Answer must be one of the options.");
                                  return;
                                }

                                try {
                                  await api.put("/api/mcqs", {
                                    _id: mcq._id,
                                    question: editForm.question,
                                    options: editForm.options,
                                    answer: editForm.answer,
                                  });
                                  setEditingKey(null);
                                  fetchMCQs();
                                } catch (err) {
                                  console.error("Failed to update MCQ:", err);
                                }
                              }}
                            >
                              Save
                            </button>

                            <button
                              className="bg-gray-400 text-white px-3 py-1 rounded"
                              onClick={() => setEditingKey(null)}
                            >
                              Cancel
                            </button>
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="flex justify-between items-start">
                            <p className="font-semibold">{mcq.question}</p>
                            <Pencil
                              className="w-4 h-4 text-blue-600 cursor-pointer"
                              onClick={() => {
                                setEditingKey(mcq._id);
                                setEditForm({
                                  question: mcq.question,
                                  options: [...mcq.options],
                                  answer: mcq.answer,
                                });
                              }}
                            />
                          </div>
                          <ul className="list-disc list-inside space-y-1 mt-2 text-gray-700">
                            {mcq.options.map((option, optionIndex) => (
                              <li
                                key={optionIndex}
                                className={`pl-1 ${revealed === option ? "text-green-600 font-bold" : ""
                                  }`}
                              >
                                {option}
                              </li>
                            ))}
                          </ul>
                          {!revealed && (
                            <button
                              onClick={() => revealAnswer(segmentIndex, mcqIndex)}
                              className="mt-3 px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                            >
                              Reveal Answer
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default WatchPage;