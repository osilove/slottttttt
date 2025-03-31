import random
import tkinter as tk
from tkinter import messagebox
from PIL import Image, ImageTk

def guess_number_game():
    # ランダムに1から1000の数を選ぶ
    secret_number = random.randint(1, 1000)
    
    print("1から1000までの数を当ててください！")
    
    attempts = 0
    while True:
        try:
            guess = int(input("数を入力してください: "))
            attempts += 1
            
            if guess < secret_number:
                print("もっと大きな数です！")
            elif guess > secret_number:
                print("もっと小さな数です！")
            else:
                print(f"正解です！{secret_number}を当てました！")
                print(f"あなたの試行回数は{attempts}回でした。")
                print("ゲームクリア！スロットゲームに移行します...")
                root = tk.Tk()
                app = SlotMachineApp(root)
                root.mainloop()
                return  # 正解した場合は関数を終了してゲームを終了する
        except ValueError:
            print("無効な入力です。整数を入力してください。")

class SlotMachineApp:
    def __init__(self, root):
        self.root = root
        self.root.title("スロットマシン")
        self.root.geometry("400x200")  # ウィンドウサイズの調整

        # 画像ラベルの配置
        self.slot_labels = [tk.Label(root) for _ in range(3)]  # サイズを指定しない
        for i, label in enumerate(self.slot_labels):
            label.grid(row=0, column=i, padx=20, pady=20)

        # スロットを回すボタン
        self.spin_button = tk.Button(root, text="スロットを回す", command=self.spin_slot, font=("Helvetica", 16))
        self.spin_button.grid(row=1, column=0, columnspan=3, pady=20)

        # スロットのアニメーション設定
        self.symbols = list(symbols.keys())
        self.frames = 20  # アニメーションのフレーム数
        self.spin_delay = 50  # ミリ秒単位でアニメーションの遅延
        self.slot_images = {}

    def spin_slot(self):
        # アニメーションを開始
        self.current_frame = 0
        self.final_slot = [random.choice(self.symbols) for _ in range(3)]
        self.spin_animation()

    def spin_animation(self):
        if self.current_frame < self.frames:
            # スロットのシンボルをランダムに更新
            slot = [random.choice(self.symbols) for _ in range(3)]

            for i, symbol in enumerate(slot):
                try:
                    img = Image.open(symbols[symbol])
                    img = img.resize((100, 100), Image.Resampling.LANCZOS)  # 画像のサイズを100x100に調整
                    img_tk = ImageTk.PhotoImage(img)
                    self.slot_labels[i].config(image=img_tk)
                    self.slot_labels[i].image = img_tk  # 参照を保持するための処理
                except Exception as e:
                    print(f"Error loading image {symbols[symbol]}: {e}")

            # 次のフレームをスケジュール
            self.current_frame += 1
            self.root.after(self.spin_delay, self.spin_animation)
        else:
            # アニメーションが終了したら最終結果を表示
            self.show_result()

    def show_result(self):
        # 最終的なスロットの結果を表示
        for i, symbol in enumerate(self.final_slot):
            try:
                img = Image.open(symbols[symbol])
                img = img.resize((100, 100), Image.Resampling.LANCZOS)  # 画像のサイズを100x100に調整
                img_tk = ImageTk.PhotoImage(img)
                self.slot_labels[i].config(image=img_tk)
                self.slot_labels[i].image = img_tk  # 参照を保持するための処理
            except Exception as e:
                print(f"Error loading image {symbols[symbol]}: {e}")

        if self.final_slot[0] == self.final_slot[1] == self.final_slot[2]:
            messagebox.showinfo("結果", "おめでとう！ジャックポット!")
        else:
            messagebox.showinfo("結果", "もう一度挑戦してみてください。")

# スロットシンボルの画像ファイルのパス
symbols = {
    '🍒': '../画像/cherry.png',
    '🍋': '../画像/lemon.png',
    '🍊': '../画像/orange.png',
}

# ゲームを開始する
if __name__ == "__main__":
    guess_number_game()
