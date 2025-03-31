import tkinter as tk
from tkinter import messagebox
from PIL import Image, ImageTk
import random
import os

# ゲーム設定
image_folder = "images"  # 画像フォルダのパス
images = [f"card{i}.png" for i in range(1, 26)] * 2  # 25枚の画像を2回使う

# 画像を読み込む関数
def load_image(image_path):
    try:
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"{image_path} が見つかりません。")
        image = Image.open(image_path)
        image = image.resize((100, 100))  # 画像サイズを調整
        return ImageTk.PhotoImage(image)
    except Exception as e:
        # エラーメッセージを表示
        messagebox.showerror("エラー", f"画像の読み込みに失敗しました: {e}")
        return None

# ウィンドウ作成
root = tk.Tk()
root.title("神経衰弱")
root.geometry("800x800")
root.resizable(False, False)

# 画像の読み込みを試みる
image_objects = [load_image(image) for image in images]
if None in image_objects:
    print("画像の読み込みに失敗しました。画像のパスを確認してください。")
    messagebox.showerror("エラー", "画像の読み込みに失敗しました。ゲームを終了します。")
else:
    # 画像が正常に読み込まれた場合、ランダムにシャッフル
    random.shuffle(image_objects)

    # ゲーム状態
    pairs_found = 0
    flipped_cards = []
    clickable = True
    dark_theme = False

    # 画像が正常に読み込まれた場合、ランダムにシャッフル
    random.shuffle(image_objects)

    # テーマの設定
    def toggle_theme():
        global dark_theme
        dark_theme = not dark_theme
        if dark_theme:
            root.config(bg="black")
            status_label.config(bg="black", fg="white")
            reset_button.config(bg="black", fg="white")
            theme_button.config(bg="black", fg="white")
        else:
            root.config(bg="white")
            status_label.config(bg="white", fg="black")
            reset_button.config(bg="lightgray", fg="black")
            theme_button.config(bg="lightgray", fg="black")

    # ゲームの初期化
    def init_game():
        global pairs_found, flipped_cards, clickable
        pairs_found = 0
        flipped_cards = []
        clickable = True
        status_label.config(text=f"ペアを見つけた数: {pairs_found}")

        for card in cards:
            card.config(image=None, bg="gray", state="normal")
        random.shuffle(image_objects)

    # カードを裏返す処理
    def reveal_card(card_index):
        global clickable, flipped_cards
        if not clickable or cards[card_index]["state"] == "disabled":
            return

        try:
            card_image = image_objects[card_index]
            if card_image:
                cards[card_index].config(image=card_image, state="disabled")
                flipped_cards.append(card_index)

                if len(flipped_cards) == 2:
                    clickable = False
                    root.after(1000, check_match)
        except Exception as e:
            messagebox.showerror("エラー", f"カードを裏返す処理でエラーが発生しました: {e}")

    # ペアが一致するか確認
    def check_match():
        global pairs_found, flipped_cards, clickable
        first_index, second_index = flipped_cards
        if images[first_index] == images[second_index]:
            pairs_found += 1
            status_label.config(text=f"ペアを見つけた数: {pairs_found}")
            flipped_cards = []
            clickable = True

            if pairs_found == 25:
                messagebox.showinfo("おめでとう!", "全てのペアを見つけました!")
                init_game()  # ゲームをリセット
        else:
            cards[first_index].config(image=None, state="normal")
            cards[second_index].config(image=None, state="normal")
            flipped_cards = []
            clickable = True

    # ゲームボードの作成
    cards = []
    for i in range(50):
        button = tk.Button(root, text="?", width=10, height=4, bg="gray",
                        command=lambda i=i: reveal_card(i))
        button.grid(row=i // 5, column=i % 5, padx=5, pady=5)
        cards.append(button)

    # ステータス表示
    status_label = tk.Label(root, text="ペアを見つけた数: 0", font=("Arial", 16))
    status_label.pack(pady=20)

    # リセットボタン
    reset_button = tk.Button(root, text="リセットゲーム", font=("Arial", 14), command=init_game)
    reset_button.pack(pady=10)

    # テーマ切替ボタン
    theme_button = tk.Button(root, text="テーマ切替", font=("Arial", 14), command=toggle_theme)
    theme_button.pack(pady=10)

    # 初期設定
    toggle_theme()  # 現在のテーマを反映
    init_game()  # ゲームを初期化

    # メインループ
    root.mainloop()
