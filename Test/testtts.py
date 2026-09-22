from services.tts import TextToSpeech


def main():
    tts = TextToSpeech()

    output_path = "tts_output.wav"

    tts.generate(
        text="Hello Shivanu, I am Pheebs.",
        output_path=output_path,
    )

    print(f"Audio generated: {output_path}")


if __name__ == "__main__":
    main()