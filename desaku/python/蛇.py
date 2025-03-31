import tkinter as tk
import random

# ゲームの設定
GRID_SIZE = 20
TILE_COUNT = 20  # グリッドの数（キャンバスのサイズ）
SPEED = 100  # ゲームの速度（ミリ秒）

class SnakeGame(tk.Tk):
    def __init__(self):
        super().__init__()

        self.title("スネークゲーム")
        self.canvas = tk.Canvas(self, width=GRID_SIZE * TILE_COUNT, height=GRID_SIZE * TILE_COUNT, bg="#f0f0f0")
        self.canvas.pack()

        # ゲーム状態の初期化
        self.snake = [(8, 8)]  # スネークの初期位置
        self.direction = (0, 0)  # スネークの初期方向
        self.food = (5, 5)  # 食べ物の初期位置
        self.game_over = False  # ゲームオーバーのフラグ
        self.game_started = False  # ゲーム開始フラグ
        self.slow_motion = False  # スローモーションフラグ
        self.speed = SPEED  # 初期速度

        self.bind("<KeyPress>", self.on_key_press)
        self.bind("<KeyRelease>", self.on_key_release)

        # ゲームループの開始
        self.after(self.speed, self.game_loop)

    def game_loop(self):
        if self.game_over:
            self.canvas.create_text(GRID_SIZE * TILE_COUNT // 2, GRID_SIZE * TILE_COUNT // 2, text="ゲームオーバー!", font=('Arial', 24))
            return

        if self.game_started:
            # スネークの移動
            head_x, head_y = self.snake[0]
            new_head = (head_x + self.direction[0], head_y + self.direction[1])

            # 衝突判定
            if (new_head[0] < 0 or new_head[0] >= TILE_COUNT or
                new_head[1] < 0 or new_head[1] >= TILE_COUNT or
                new_head in self.snake):
                self.game_over = True
                return

            # 食べ物を食べたらスネークを伸ばす
            if new_head == self.food:
                self.snake.insert(0, new_head)
                self.place_food()
            else:
                self.snake = [new_head] + self.snake[:-1]

            # 描画更新
            self.canvas.delete("all")
            self.draw_snake()
            self.draw_food()

        # ゲームループを繰り返し
        self.after(self.speed, self.game_loop)

    def draw_snake(self):
        for segment in self.snake:
            self.canvas.create_rectangle(
                segment[0] * GRID_SIZE, segment[1] * GRID_SIZE,
                (segment[0] + 1) * GRID_SIZE, (segment[1] + 1) * GRID_SIZE,
                fill="green"
            )

    def draw_food(self):
        self.canvas.create_rectangle(
            self.food[0] * GRID_SIZE, self.food[1] * GRID_SIZE,
            (self.food[0] + 1) * GRID_SIZE, (self.food[1] + 1) * GRID_SIZE,
            fill="red"
        )

    def place_food(self):
        self.food = (random.randint(0, TILE_COUNT - 1), random.randint(0, TILE_COUNT - 1))

    def on_key_press(self, event):
        if event.keysym == 'Up' and self.direction != (0, 1):
            self.direction = (0, -1)
        elif event.keysym == 'Down' and self.direction != (0, -1):
            self.direction = (0, 1)
        elif event.keysym == 'Left' and self.direction != (1, 0):
            self.direction = (-1, 0)
        elif event.keysym == 'Right' and self.direction != (-1, 0):
            self.direction = (1, 0)

        if not self.game_started:
            self.game_started = True
            self.canvas.create_text(GRID_SIZE * TILE_COUNT // 2, GRID_SIZE * TILE_COUNT // 4, text="ゲーム開始!", font=('Arial', 18))

        if event.keysym == 'Control':
            self.slow_motion = True
            self.speed = 200  # スローモーションにする
            self.after(self.speed, self.game_loop)

    def on_key_release(self, event):
        if event.keysym == 'Control':
            self.slow_motion = False
            self.speed = SPEED  # 通常速度に戻す
            self.after(self.speed, self.game_loop)

    def reset_game(self):
        self.snake = [(8, 8)]
        self.direction = (0, 0)
        self.place_food()
        self.game_over = False
        self.game_started = False
        self.slow_motion = False
        self.speed = SPEED  # 通常速度に戻す
        self.canvas.delete("all")
        self.canvas.create_text(GRID_SIZE * TILE_COUNT // 2, GRID_SIZE * TILE_COUNT // 4, text="ゲーム開始!", font=('Arial', 18))

if __name__ == "__main__":
    game = SnakeGame()
    game.mainloop()
