# QuizLoop - Lecture Video Transcriber & MCQ Generator

## Overview

This project is a full-stack web application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) that enables users to upload lecture videos (MP4 format, ~60 minutes). The application automatically transcribes the video, segments the transcript into 5-minute intervals, and generates objective multiple-choice questions (MCQs) for each segment using a locally hosted Large Language Model (LLM). This ensures offline operation and privacy of user data.

---

## Key Features

### Frontend (React.js + TypeScript)

- Responsive web interface for uploading MP4 video files.
- Real-time progress bar and status updates for transcription and question generation.
- Display transcript segmented by 5-minute intervals.
- Auto-generated MCQs for each transcript segment.
- Options to review, edit, and export generated questions.

### Backend (Node.js + Express.js + TypeScript)

- Secure handling of video file uploads, stored temporarily on the local machine.
- Integration with a Python-based transcription service (Whisper).
- Transcript segmentation into fixed 5-minute chunks.
- Communication with a locally hosted LLM service for MCQ generation via REST API.
- Storage of questions in MongoDB.

### Database (MongoDB)

- Stores metadata of uploaded videos.
- Stores generated objective-type questions for each segment.

### AI/ML Integration

- Transcription using Whisper model running locally.
- Question generation using a locally deployed LLM (e.g., LLaMA, Mistral, GPT4All).
- Python REST API backend (FastAPI) hosting the AI models.
- Prompt engineering to generate relevant, randomized MCQs for each transcript segment.

---

## Technology Stack

| Layer          | Technology / Tools                                                  |
| -------------- | ------------------------------------------------------------------- |
| Frontend       | React.js, TypeScript, ShadCN, React Query                           |
| Backend        | Node.js, Express.js, TypeScript, routing-controllers                |
| Database       | MongoDB (with official Node.js driver)                              |
| AI/ML Services | Whisper (local transcription), LLM via Ollama, FastAPI for REST API |
| Storage        | Local file system (for videos)                                      |
| Messaging      | RabbitMQ                                                            |

---

## Application Overview

<p align="center">
  <img src="https://raw.githubusercontent.com/Noel6161131110/QuizLoop/main/assets/1.png" alt="Dashboard/Home" width="45%" />
  <img src="https://raw.githubusercontent.com/Noel6161131110/quizloop/main/assets/2.png" alt="Upload Video" width="45%" />
</p>
<p align="center">
  <img src="https://raw.githubusercontent.com/Noel6161131110/quizloop/main/assets/3.png" alt="Transcription Process" width="45%" />
  <img src="https://raw.githubusercontent.com/Noel6161131110/quizloop/main/assets/4.png" alt="Video Streaming/MCQs" width="45%" />
</p>
<p align="center">
  <img src="https://raw.githubusercontent.com/Noel6161131110/quizloop/main/assets/5.png" alt="MCQ Overview" width="45%" />
  <img src="https://raw.githubusercontent.com/Noel6161131110/quizloop/main/assets/6.png" alt="MCQ Overview 2" width="45%" />
</p>
<p align="center">
  <img src="https://raw.githubusercontent.com/Noel6161131110/quizloop/main/assets/7.png" alt="MCQ Edit Option" width="45%" />
  <img src="https://raw.githubusercontent.com/Noel6161131110/quizloop/main/assets/8.png" alt="MCQ Reveal Answer" width="45%" />
</p>


## Application Flow

1. User uploads a lecture video via the React frontend.
2. Backend receives and stores the video locally.
3. Video is sent to the transcription Python service (Whisper) to convert speech to text.
4. The full transcript is segmented into 5-minute intervals.
5. Each segment is sent to the locally hosted LLM service, which generates multiple-choice questions.
6. Transcripts and generated MCQs are saved in MongoDB.
7. The frontend displays segmented transcripts and MCQs, allowing users to review and export.

---

## Setup & Running the Application

### Prerequisites

- Node.js (v16+ recommended)
- MongoDB (running locally or remotely)
- Python 3.8+ with required AI/ML dependencies installed (Whisper, LLM models, Flask/FastAPI)
- RabbitMQ (for messaging and background task processing)
- FFmpeg (for video processing, if needed)

<p align="center"><em>With ❤️ Open-Source.</em></p>
