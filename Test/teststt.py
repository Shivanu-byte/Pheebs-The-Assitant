from services.stt import SpeechToText


def main():
    stt = SpeechToText()

    audio_path = r"D:\Agentic AI LangGraph\Pheebs-The Assistant\test_audio.wav"

    text = stt.transcribe(audio_path)

    print("Transcription:")
    print(text)


if __name__ == "__main__":
    main()