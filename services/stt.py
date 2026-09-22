import speech_recognition as sr


class SpeechToText:
    def __init__(self):
        self.recognizer = sr.Recognizer()
        self.recognizer.pause_threshold = 2.0

    def transcribe(self, audio_path: str) -> str:
        with sr.AudioFile(audio_path) as source:
            audio = self.recognizer.record(source)

        try:
            return self.recognizer.recognize_google(audio).strip()

        except sr.UnknownValueError:
            return ""

        except sr.RequestError as error:
            raise RuntimeError(
                f"Speech recognition service error: {error}"
            ) from error