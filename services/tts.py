# services/tts.py

import pyttsx3


class TextToSpeech:
    def __init__(self):
        self.engine = pyttsx3.init()

        voices = self.engine.getProperty("voices")

        if voices:
            self.engine.setProperty("voice", voices[0].id)

        self.engine.setProperty("volume", 1.0)
        self.engine.setProperty("rate", 50)

    def generate(self, text: str, output_path: str = "audio/response.wav") -> str:
        self.engine.save_to_file(text, output_path)
        self.engine.runAndWait()

        return output_path