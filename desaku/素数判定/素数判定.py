import tkinter as tk
from tkinter import messagebox
import math

# 素数判定関数
def is_prime(num):
    if num <= 1:
        return False
    for i in range(2, int(math.sqrt(num)) + 1):
        if num % i == 0:
            return False
    return True

# 最大素数を探す関数
def find_max_prime(min_value, max_value):
    for num in range(max_value, min_value - 1, -1):
        if is_prime(num):
            return num
    return None  # 素数が見つからない場合

# 最小素数を探す関数
def find_min_prime(min_value, max_value):
    for num in range(min_value, max_value + 1):
        if is_prime(num):
            return num
    return None  # 素数が見つからない場合

# ボタンがクリックされた時の処理
def on_find_prime():
    try:
        min_value = int(min_entry.get())
        max_value = int(max_entry.get())
        
        if min_value > max_value:
            messagebox.showerror("入力エラー", "最小値は最大値以下でなければなりません。")
            return
        
        max_prime = find_max_prime(min_value, max_value)
        min_prime = find_min_prime(min_value, max_value)
        
        if max_prime is not None and min_prime is not None:
            result_label.config(text=f"最大の素数は {max_prime} で、最小の素数は {min_prime} です。")
        elif max_prime is not None:
            result_label.config(text=f"最大の素数は {max_prime} ですが、最小の素数は見つかりませんでした。")
        elif min_prime is not None:
            result_label.config(text=f"最小の素数は {min_prime} ですが、最大の素数は見つかりませんでした。")
        else:
            result_label.config(text="指定した範囲内に素数はありません。")
        
    except ValueError:
        messagebox.showerror("入力エラー", "数値を正しく入力してください。")

# メインウィンドウの設定
root = tk.Tk()
root.title("最大と最小の素数を探す")
root.geometry("350x300")

# GUIコンポーネント
min_label = tk.Label(root, text="最小値:")
min_label.pack(pady=5)

min_entry = tk.Entry(root)
min_entry.pack(pady=5)

max_label = tk.Label(root, text="最大値:")
max_label.pack(pady=5)

max_entry = tk.Entry(root)
max_entry.pack(pady=5)

find_button = tk.Button(root, text="最大と最小の素数を表示", command=on_find_prime)
find_button.pack(pady=10)

result_label = tk.Label(root, text="")
result_label.pack(pady=10)

# アプリケーションの実行
root.mainloop()
