import tkinter as tk
from tkinter import filedialog, messagebox
from PIL import Image, ImageTk
import imageio
import os

class GifCreatorApp:
    def __init__(self, root):
        self.root = root
        self.root.title("GIF作成ツール")
        self.root.geometry("400x400")
        
        self.image_files = []

        # タイトルラベル
        self.title_label = tk.Label(self.root, text="画像からGIFを作成", font=("Arial", 14))
        self.title_label.pack(pady=10)

        # ファイル選択ボタン
        self.select_button = tk.Button(self.root, text="画像を選択", command=self.select_files)
        self.select_button.pack(pady=10)

        # GIF作成ボタン
        self.create_button = tk.Button(self.root, text="GIFを作成", command=self.create_gif)
        self.create_button.pack(pady=10)

        # GIF表示用のラベル
        self.gif_label = tk.Label(self.root)
        self.gif_label.pack(pady=20)

        # 保存ボタン
        self.save_button = tk.Button(self.root, text="GIFを保存", command=self.save_gif, state=tk.DISABLED)
        self.save_button.pack(pady=10)

        # 保存先ファイルパス
        self.saved_gif_path = ""

    def select_files(self):
        # 複数の画像ファイルを選択するダイアログを開く
        file_paths = filedialog.askopenfilenames(title="画像を選択", filetypes=[("Image files", "*.png;*.jpg;*.jpeg")])
        if file_paths:
            self.image_files = file_paths
            print(f"選択された画像: {self.image_files}")

    def create_gif(self):
        if len(self.image_files) < 2:
            messagebox.showwarning("警告", "2つ以上の画像を選択してください。")
            return

        # 画像を格納するリストを作成
        images = []
        
        # 最初の画像のサイズを基準にリサイズ
        try:
            base_image = Image.open(self.image_files[0])
            base_image = base_image.convert("RGB")  # RGBモードに変換
            base_image = base_image.resize((300, 300))  # 基準サイズとして300x300にリサイズ
        except Exception as e:
            messagebox.showerror("エラー", f"最初の画像の読み込みまたはリサイズに失敗しました: {str(e)}")
            return

        for file in self.image_files:
            try:
                img = Image.open(file)
                img = img.convert("RGB")  # RGBモードに変換
                img = img.resize(base_image.size)  # 他の画像も基準サイズにリサイズ
                images.append(img)
                print(f"画像サイズ: {img.size}")  # 各画像のサイズを確認
            except Exception as e:
                messagebox.showerror("エラー", f"画像の読み込みまたはリサイズに失敗しました: {file} - {str(e)}")
                return

        # imageioを使用してGIFを作成
        gif_path = "output.gif"
        try:
            imageio.mimsave(gif_path, images, duration=0.5)  # 0.5秒ごとのフレームでGIFを作成
        except Exception as e:
            messagebox.showerror("エラー", f"GIFの作成に失敗しました: {str(e)}")
            return

        # 作成したGIFを表示
        self.show_gif(gif_path)

        # 保存ボタンを有効にする
        self.saved_gif_path = gif_path
        self.save_button.config(state=tk.NORMAL)

    def show_gif(self, gif_path):
        # 作成したGIFを開いて表示
        try:
            gif_image = Image.open(gif_path)
            gif_photo = ImageTk.PhotoImage(gif_image)
            self.gif_label.config(image=gif_photo)
            self.gif_label.image = gif_photo
        except Exception as e:
            messagebox.showerror("エラー", f"GIFの表示に失敗しました: {str(e)}")

    def save_gif(self):
        # 保存先ファイルパスを選択するダイアログを開く
        save_path = filedialog.asksaveasfilename(defaultextension=".gif", filetypes=[("GIF files", "*.gif")])
        if save_path:
            # GIFとして保存
            try:
                # imageioで作成したGIFを保存
                gif_image = Image.open(self.saved_gif_path)
                gif_image.save(save_path, format="GIF")
                messagebox.showinfo("成功", f"GIFを保存しました: {save_path}")
            except Exception as e:
                messagebox.showerror("エラー", f"GIFの保存に失敗しました: {str(e)}")
        else:
            messagebox.showwarning("警告", "保存先が選択されませんでした。")

if __name__ == "__main__":
    root = tk.Tk()
    app = GifCreatorApp(root)
    root.mainloop()
