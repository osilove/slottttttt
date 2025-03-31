import speech_recognition as sr

recognizer = sr.Recognizer()
with sr.Microphone() as source:
    print("話してください")
    audio = recognizer.listen(source)

try:
    text = recognizer.recognize_google(audio, language='ja-JP')
    print(f"あなた: {text}")
except sr.UnknownValueError:
    print("聞き取れませんでした")

import pyttsx3

engine = pyttsx3.init()
engine.say("こんにちは、何をお手伝いしましょうか？")
engine.runAndWait()
