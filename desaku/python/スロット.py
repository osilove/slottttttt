import random
import tkinter as tk
from tkinter import messagebox
from PIL import Image, ImageTk

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
        self.spin_delay = 100  # ミリ秒単位でアニメーションの遅延
        self.frames = 20  # アニメーションのフレーム数

        # 最終的なスロットの結果を保存するための変数
        self.final_symbols = [None, None, None]

    def spin_slot(self):
        # スロットのアニメーションを開始
        self.spin_animation(0)

    def spin_animation(self, frame):
        if frame < self.frames:
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

            # 最終的なシンボルの保存
            self.final_symbols = slot

            # 次のフレームをスケジュール
            self.root.after(self.spin_delay, self.spin_animation, frame + 1)
        else:
            # アニメーションが終わったら最終結果を表示
            self.show_result()

    def show_result(self):
        if self.final_symbols[0] == self.final_symbols[1] == self.final_symbols[2]:
            messagebox.showinfo("結果", "おめでとう！ジャックポット!")
        else:
            messagebox.showinfo("結果", "もう一度挑戦してみてください。")

# スロットシンボルの画像ファイルのパス
symbols = {
    '🍒': '../画像/cherry.png',
    '🍋': '../画像/lemon.png',
    '🍊': '../画像/orange.png',
}

# スロットマシンアプリケーションを起動する
if __name__ == "__main__":
    root = tk.Tk()
    app = SlotMachineApp(root)
    root.mainloop()

