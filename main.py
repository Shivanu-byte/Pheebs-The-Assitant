from config import settings


def main():
    print(f"Application: {settings.app_name}")
    print(f"Environment: {settings.app_env}")
    print(f"Whisper: {settings.whisper_model}")
    print(f"TTS: {settings.tts_model}")


if __name__ == "__main__":
    main()