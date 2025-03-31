import tkinter as tk
import speech_recognition as sr

# 言語選択に対応する言語コードの辞書
language_dict = {
    "日本語": "ja-JP",
    "英語": "en-US",
    "フランス語": "fr-FR",
    "ドイツ語": "de-DE",
    "スペイン語": "es-ES",
    "中国語": "zh-CN",
    "イタリア語": "it-IT",
    "ポルトガル語": "pt-BR"
}

# 音声認識処理
def recognize_speech():
    recognizer = sr.Recognizer()

    # 言語コードを取得（ドロップダウンメニューで選ばれた言語）
    selected_language = language_dict[language_var.get()]

    # マイクから音声を取得
    with sr.Microphone() as source:
        label.config(text="音声を聞いています...")
        recognizer.adjust_for_ambient_noise(source)
        audio = recognizer.listen(source)

    try:
        # Google Web Speech APIを使って音声をテキストに変換
        label.config(text="音声認識中...")
        text = recognizer.recognize_google(audio, language=selected_language)
        result_label.config(text="認識結果: " + text)
    except sr.UnknownValueError:
        label.config(text="音声が理解できませんでした")
    except sr.RequestError:
        label.config(text="音声認識サービスに接続できませんでした")

# Tkinterウィンドウの設定
window = tk.Tk()
window.title("音声認識アプリ")
window.geometry("500x300")

# 言語選択ラベル
language_label = tk.Label(window, text="音声認識の言語を選択してください", font=("Arial", 12))
language_label.pack(pady=10)

# 言語選択用のドロップダウンメニュー
language_var = tk.StringVar(window)
language_var.set("英語")  # デフォルトの言語を英語に設定
language_menu = tk.OptionMenu(window, language_var, *language_dict.keys())
language_menu.pack(pady=10)

# ラベル（音声認識の状態を表示）
label = tk.Label(window, text="音声認識を開始するにはボタンを押してください", font=("Arial", 14))
label.pack(pady=20)

# 結果を表示するラベル
result_label = tk.Label(window, text="", font=("Arial", 12))
result_label.pack(pady=10)

# 音声認識を開始するボタン
start_button = tk.Button(window, text="音声認識開始", font=("Arial", 12), command=recognize_speech)
start_button.pack(pady=20)

# Tkinterウィンドウの実行
window.mainloop()
