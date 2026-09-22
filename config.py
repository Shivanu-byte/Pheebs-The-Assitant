from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "Pheebs"
    app_env: str = "development"
    debug: bool = True

    # NVIDIA
    llm_api_key: str = ""
    llm_base_url: str = ""
    llm_model: str = ""

    # NVIDIA STT
    nvidia_stt_url: str = ""

    # TTS
    tts_model: str = "chatterbox"
    tts_voice_path: str = ""

    audio_sample_rate: int = 24000

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )


settings = Settings()