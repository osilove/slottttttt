import tkinter as tk
import random

class Boss:
    def __init__(self, canvas):
        self.canvas = canvas
        self.hp = 10
        self.boss = self.canvas.create_rectangle(150, 50, 250, 150, fill="red")
        self.direction = 1  # 1: 右、-1: 左
        self.move_interval = 20  # ボスが移動する間隔（ピクセル単位）

    def move(self):
        # ボスの現在の座標を取得
        x1, y1, x2, y2 = self.canvas.coords(self.boss)
        if x1 <= 0 or x2 >= 400:  # ボスが画面の端に到達したら方向を反転
            self.direction *= -1
        self.canvas.move(self.boss, self.direction * self.move_interval, 0)

    def hit(self):
        self.hp -= 1
        if self.hp <= 0:
            self.canvas.delete(self.boss)
            return True
        return False

class ShootingGame:
    def __init__(self, root):
        self.root = root
        self.root.title("シューティングゲーム")

        self.canvas = tk.Canvas(root, width=400, height=800, bg="white")
        self.canvas.pack()

        self.cannon = self.canvas.create_rectangle(370, 780, 390, 800, fill="blue")
        self.bullets = []
        self.targets = []
        self.game_over = False
        self.boss = None

        self.score = 0
        self.score_label = tk.Label(root, text=f"スコア: {self.score}")
        self.score_label.pack()

        self.spawn_targets()

        self.root.bind("<Left>", self.move_cannon_left)
        self.root.bind("<Right>", self.move_cannon_right)
        self.root.bind("<space>", self.shoot)

        self.update_game()

    def move_cannon_left(self, event):
        if not self.game_over:
            self.canvas.move(self.cannon, -20, 0)

    def move_cannon_right(self, event):
        if not self.game_over:
            self.canvas.move(self.cannon, 20, 0)

    def shoot(self, event):
        if not self.game_over:
            x1, y1, x2, y2 = self.canvas.coords(self.cannon)
            bullet = self.canvas.create_rectangle((x1 + x2) / 2 - 2, y1 - 10, (x1 + x2) / 2 + 2, y1, fill="red")
            self.bullets.append(bullet)

    def update_game(self):
        if not self.game_over:
            self.move_bullets()
            self.move_targets()
            self.check_collisions()
            if self.score >= 20 and not self.boss:
                self.spawn_boss()
            if self.boss:
                self.boss.move()
            self.root.after(50, self.update_game)

    def move_bullets(self):
        for bullet in self.bullets:
            self.canvas.move(bullet, 0, -10)
            if self.canvas.coords(bullet)[1] < 0:
                self.canvas.delete(bullet)
                self.bullets.remove(bullet)

    def move_targets(self):
        for target in self.targets:
            self.canvas.move(target, 0, 5)
            if self.canvas.coords(target)[3] > 800:
                self.canvas.delete(target)
                self.targets.remove(target)
                self.spawn_target()  # 画面外に出たターゲットを再生成

    def check_collisions(self):
        bullets_to_remove = []
        targets_to_remove = []

        for bullet in self.bullets:
            bullet_coords = self.canvas.coords(bullet)
            if bullet_coords:  # bullet_coordsが空でないことを確認
                if self.boss:
                    boss_coords = self.canvas.coords(self.boss.boss)
                    if boss_coords:  # boss_coordsが空でないことを確認
                        if (bullet_coords[2] > boss_coords[0] and bullet_coords[0] < boss_coords[2] and
                                bullet_coords[3] > boss_coords[1] and bullet_coords[1] < boss_coords[3]):
                            if self.boss.hit():
                                self.canvas.create_text(200, 400, text="ゲームクリア!", font=("Arial", 24), fill="black")
                                self.game_over = True
                                self.root.after(2000, self.start_target_game)  # 2秒後にターゲットゲームを開始
                            self.canvas.delete(bullet)
                            bullets_to_remove.append(bullet)
                else:
                    for target in self.targets[:]:  # リストをコピーして反復処理する
                        target_coords = self.canvas.coords(target)
                        if target_coords:  # target_coordsが空でないことを確認
                            if (bullet_coords[2] > target_coords[0] and bullet_coords[0] < target_coords[2] and
                                    bullet_coords[3] > target_coords[1] and bullet_coords[1] < target_coords[3]):
                                if target in self.targets:
                                    self.canvas.delete(bullet)
                                    self.canvas.delete(target)
                                    bullets_to_remove.append(bullet)
                                    targets_to_remove.append(target)
                                    self.score += 1
                                    self.score_label.config(text=f"スコア: {self.score}")
                                    if self.score >= 20 and not self.boss:
                                        self.spawn_boss()  # スコアが20に達したらボスを生成
                                    self.spawn_target()  # ターゲットを再生成
                                    break
        
        # Remove bullets and targets outside of the main loop to avoid modifying list during iteration
        for bullet in bullets_to_remove:
            if bullet in self.bullets:
                self.bullets.remove(bullet)
        for target in targets_to_remove:
            if target in self.targets:
                self.targets.remove(target)

    def spawn_targets(self):
        for _ in range(5):  # 初期に5つのターゲットを生成
            self.spawn_target()

    def spawn_target(self):
        x = random.randint(0, 380)  # ターゲットの位置を画面内に制限
        y = 0
        target = self.canvas.create_rectangle(x, y, x + 20, y + 20, fill="green")
        self.targets.append(target)

    def spawn_boss(self):
        self.boss = Boss(self.canvas)
        self.clear_targets()  # ボスが出現した際にターゲットをすべて削除

    def clear_targets(self):
        for target in self.targets[:]:  # リストをコピーして反復処理する
            self.canvas.delete(target)
        self.targets.clear()  # ターゲットリストを空にする

    def start_target_game(self):
        self.root.destroy()  # 現在のウィンドウを閉じる
        target_root = tk.Tk()
        TargetGame(target_root)
        target_root.mainloop()

class TargetGame:
    def __init__(self, root):
        self.root = root
        self.root.title("ターゲットクリックゲーム")

        self.canvas = tk.Canvas(root, width=400, height=400, bg="pink")
        self.canvas.pack()

        self.score = 0
        self.time_left = 30
        self.target_size = 50

        self.score_label = tk.Label(root, text=f"スコア: {self.score}")
        self.score_label.pack()

        self.timer_label = tk.Label(root, text=f"残り時間: {self.time_left}秒")
        self.timer_label.pack()

        self.target = self.canvas.create_oval(0, 0, 0, 0, fill="white")

        self.update_target()
        self.canvas.bind("<Button-1>", self.check_click)
        
        self.update_timer()
    
    def update_target(self):
        x = random.randint(0, 400 - self.target_size)
        y = random.randint(0, 400 - self.target_size)
        self.canvas.coords(self.target, x, y, x + self.target_size, y + self.target_size)
    
    def check_click(self, event):
        x1, y1, x2, y2 = self.canvas.coords(self.target)
        if x1 <= event.x <= x2 and y1 <= event.y <= y2:
            self.score += 1
            self.score_label.config(text=f"スコア: {self.score}")
            self.update_target()
    
    def update_timer(self):
        if self.time_left > 0:
            self.time_left -= 1
            self.timer_label.config(text=f"残り時間: {self.time_left}秒")
            self.root.after(1000, self.update_timer)
        else:
            self.end_game()
    
    def end_game(self):
        self.canvas.unbind("<Button-1>")
        self.canvas.create_text(200, 200, text=f"ゲーム終了! 最終スコア: {self.score}", font=("Arial", 20), fill="black")

if __name__ == "__main__":
    root = tk.Tk()
    game = ShootingGame(root)
    root.mainloop()
