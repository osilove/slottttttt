import tkinter as tk
import random

# グローバル設定
CELL_SIZE = 20  # 1マスのサイズ
GRID_SIZE = 30  # 迷路のサイズ (30x30)

class MazeGame:
    def __init__(self, root):
        self.root = root
        self.root.title("迷路ゲーム")
        self.canvas = tk.Canvas(root, width=GRID_SIZE * CELL_SIZE, height=GRID_SIZE * CELL_SIZE, bg="white")
        self.canvas.pack()

        # プレイヤーの位置
        self.player_pos = None
        self.goal_pos = None

        # 迷路を生成
        self.maze = self.generate_maze()
        self.draw_maze()

        # キーイベントのバインド
        self.root.bind("<Up>", lambda event: self.move_player(0, -1))
        self.root.bind("<Down>", lambda event: self.move_player(0, 1))
        self.root.bind("<Left>", lambda event: self.move_player(-1, 0))
        self.root.bind("<Right>", lambda event: self.move_player(1, 0))

    def generate_maze(self):
        # Prim'sアルゴリズムで迷路を生成
        maze = [[1 for _ in range(GRID_SIZE)] for _ in range(GRID_SIZE)]
        start_x, start_y = random.randint(0, GRID_SIZE - 1), random.randint(0, GRID_SIZE - 1)
        maze[start_y][start_x] = 0

        walls = [(start_x + dx, start_y + dy) for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]]
        while walls:
            x, y = random.choice(walls)
            walls.remove((x, y))

            if 0 < x < GRID_SIZE - 1 and 0 < y < GRID_SIZE - 1 and maze[y][x] == 1:
                adjacent_walls = sum(maze[y + dy][x + dx] for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)])
                if adjacent_walls >= 3:
                    maze[y][x] = 0
                    walls += [(x + dx, y + dy) for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)] if maze[y + dy][x + dx] == 1]

        # スタートとゴールをランダムに配置
        self.player_pos = (start_x, start_y)
        while True:
            goal_x, goal_y = random.randint(0, GRID_SIZE - 1), random.randint(0, GRID_SIZE - 1)
            if maze[goal_y][goal_x] == 0 and (goal_x, goal_y) != self.player_pos:
                self.goal_pos = (goal_x, goal_y)
                break

        return maze

    def draw_maze(self):
        for y in range(GRID_SIZE):
            for x in range(GRID_SIZE):
                color = "black" if self.maze[y][x] == 1 else "white"
                self.canvas.create_rectangle(x * CELL_SIZE, y * CELL_SIZE,
                                             (x + 1) * CELL_SIZE, (y + 1) * CELL_SIZE, fill=color, outline="gray")

        # ゴール
        gx, gy = self.goal_pos
        self.canvas.create_rectangle(gx * CELL_SIZE, gy * CELL_SIZE,
                                     (gx + 1) * CELL_SIZE, (gy + 1) * CELL_SIZE, fill="red", outline="gray")

        # プレイヤー
        self.update_player()

    def update_player(self):
        px, py = self.player_pos
        self.canvas.create_oval(px * CELL_SIZE + 2, py * CELL_SIZE + 2,
                                (px + 1) * CELL_SIZE - 2, (py + 1) * CELL_SIZE - 2, fill="blue")

    def move_player(self, dx, dy):
        px, py = self.player_pos
        nx, ny = px + dx, py + dy

        # 移動可能なら移動
        if 0 <= nx < GRID_SIZE and 0 <= ny < GRID_SIZE and self.maze[ny][nx] == 0:
            self.player_pos = (nx, ny)
            self.canvas.delete("all")
            self.draw_maze()

            # ゴール判定
            if self.player_pos == self.goal_pos:
                self.canvas.create_text(GRID_SIZE * CELL_SIZE // 2, GRID_SIZE * CELL_SIZE // 2,
                                        text="クリア！", fill="green", font=("Helvetica", 24))
                self.root.after(2000, self.root.quit)  # 2秒後にゲームを終了

# メイン処理
if __name__ == "__main__":
    root = tk.Tk()
    game = MazeGame(root)
    root.mainloop()
