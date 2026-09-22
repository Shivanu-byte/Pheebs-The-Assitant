import speech_recognition as sr

r = sr.Recognizer()

# Configure recognizer settings
# pause_threshold: seconds of silence to wait before considering the sentence complete (default is 0.8)
r.pause_threshold = 2.0

# Capture live audio from the microphone
with sr.Microphone() as source:
    print("Calibrating ambient noise, please wait...")
    r.adjust_for_ambient_noise(source, duration=1)  # Calibrates energy threshold
    print("Listening... Speak your full sentence (microphone will wait for you to finish):")
    audio = r.listen(source)

try:
    # Uses free Google Web Speech API
    text = r.recognize_google(audio)
    print(f"You said: {text}")
except sr.UnknownValueError:
    print("Could not understand the audio.")
except sr.RequestError:
    print("Could not request results from the service.")
