import pyttsx3
engine = pyttsx3.init()
voices = engine.getProperty('voices')
engine.setProperty('voice', voices[0].id) # or voices[1].id
engine.say("Hello sir, I am Jarvis and ready to help you. Please tell me what can I do for you sir?")
engine.setProperty('volume',1.0)  
engine.setProperty('rate', 50)
engine.runAndWait()
