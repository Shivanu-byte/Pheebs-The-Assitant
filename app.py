from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import os
import subprocess
from services.stt import SpeechToText

app = FastAPI()
stt = SpeechToText()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/pheebs")
def home():
    return {"message": "Pheebs backend is running"}

@app.post("/pheebs/voice")
async def receive_voice(file: UploadFile = File(...)):
    # Files used during the current voice-processing request
    webm_path = "temp/voice.webm"
    wav_path = "temp/voice.wav"

    # Save the latest browser recording
    with open(webm_path, "wb") as audio_file:
        audio_file.write(await file.read())

    # Convert WebM → WAV using FFmpeg
    subprocess.run(
        [
            r"C:\Users\styagi\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.1-full_build\bin\ffmpeg.exe",
            "-y",
            "-i",
            webm_path,
            "-ar",
            "16000",
            "-ac",
            "1",
            wav_path,
        ],
        check=True,
    )

    transcription = stt.transcribe(wav_path)

    return {
        "message": "Voice processed successfully",
        "transcription": transcription,
    }