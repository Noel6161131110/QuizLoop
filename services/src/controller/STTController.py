import whisper
import torch, os
from fastapi import UploadFile, File, HTTPException, Depends, Request
from fastapi.responses import StreamingResponse, JSONResponse
import aiofiles

def transcribeAudio(audio_file):
    model = whisper.load_model("base")
    result = model.transcribe(audio_file, fp16=False)
    return result["text"]

async def uploadFile(file: UploadFile = File(...)):

    file_ext = file.filename.split(".")[-1]
    file_path = f"storage/{file.filename}"
    os.makedirs("storage", exist_ok=True)
    
    async with aiofiles.open(file_path, "wb") as buffer:
        while content := await file.read(1024):
            await buffer.write(content)
            
    if file_ext not in ["wav", "mp3", "m4a"]:
        os.remove(file_path)
        raise HTTPException(status_code=400, detail="Invalid file type. Only .wav, .mp3, and .m4a files are allowed.")
    
    try:
        transcription = transcribeAudio(file_path)
        
        if(transcription):
            os.remove(file_path)
        else:
            os.remove(file_path)
            raise HTTPException(status_code=500, detail="Transcription failed. Please try again with a different audio file.")
        
        return JSONResponse(content={"transcription": transcription}, status_code=200)
    except Exception as e:
        os.remove(file_path)
        raise HTTPException(status_code=500, detail=f"Error during transcription: {str(e)}")
            