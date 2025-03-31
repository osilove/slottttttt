import tkinter as tk
import random

# ゲームウィンドウの設定
root = tk.Tk()
root.title("障害物回避ゲーム")
canvas = tk.Canvas(root, width=root.winfo_screenwidth(), height=root.winfo_screenheight(), bg="#87CEEB")
canvas.pack()

# ゲーム変数
player = {
    "x": 50,
    "y": canvas.winfo_height() // 2,
    "width": 30,
    "height": 30,
    "color": 'red',
    "speed": 5,
}

obstacles = []
obstacle_width = 50
frame = 0
game_over = False
slow_mode = False
score = 0

# 障害物を作成する関数
def create_obstacle():
    gap_height = 200
    gap_position = random.randint(100, canvas.winfo_height() - gap_height - 100)
    obstacles.append({
        "x": canvas.winfo_width(),
        "y": 0,
        "width": obstacle_width,
        "height": gap_position,
        "color": 'green',
    })
    obstacles.append({
        "x": canvas.winfo_width(),
        "y": gap_position + gap_height,
        "width": obstacle_width,
        "height": canvas.winfo_height() - gap_position - gap_height,
        "color": 'green',
    })

# 障害物を移動する関数
def move_obstacles():
    # 障害物の移動速度を速くする
    speed = 5 if slow_mode else 10  # 遅いモードの時は5、通常は10
    for obstacle in obstacles[:]:
        obstacle["x"] -= speed
        if obstacle["x"] + obstacle["width"] < 0:
            obstacles.remove(obstacle)

# 障害物を描画する関数
def draw_obstacles():
    for obstacle in obstacles:
        canvas.create_rectangle(obstacle["x"], obstacle["y"],
                                obstacle["x"] + obstacle["width"], obstacle["y"] + obstacle["height"],
                                fill=obstacle["color"])

# 衝突を検出する関数
def detect_collision():
    global game_over
    for obstacle in obstacles:
        if (player["x"] < obstacle["x"] + obstacle["width"] and
            player["x"] + player["width"] > obstacle["x"] and
            player["y"] < obstacle["y"] + obstacle["height"] and
            player["y"] + player["height"] > obstacle["y"]):
            game_over = True

# プレイヤーを描画する関数
def draw_player():
    canvas.create_rectangle(player["x"], player["y"],
                            player["x"] + player["width"], player["y"] + player["height"],
                            fill=player["color"])

# スコアを描画する関数
def draw_score():
    canvas.create_text(10, 10, anchor="nw", text=f"スコア: {score}", font=("Arial", 24), fill="black")

# 入力を処理する関数
def handle_input(event):
    if event.keysym == 'Up' and player["y"] > 0:
        player["y"] -= player["speed"]
    elif event.keysym == 'Down' and player["y"] + player["height"] < canvas.winfo_height():
        player["y"] += player["speed"]

def toggle_slow_mode(event):
    global slow_mode
    if event.keysym == 'Control':
        slow_mode = True

def disable_slow_mode(event):
    global slow_mode
    if event.keysym == 'Control':
        slow_mode = False

def escape_game(event):
    if event.keysym == 'Escape':
        root.quit()

# ゲームループ
def update():
    global frame, score
    if game_over:
        canvas.create_text(canvas.winfo_width() // 2, canvas.winfo_height() // 2, text="ゲームオーバー", font=("Arial", 48), fill="black")
        return

    canvas.delete("all")

    frame += 1
    if frame % 120 == 0:
        create_obstacle()

    if frame % 60 == 0:
        score += 1

    move_obstacles()
    draw_obstacles()
    detect_collision()
    draw_player()
    draw_score()

    root.after(16, update)  # 約60FPSで更新

# キーイベントリスナーを設定
root.bind('<KeyPress-Up>', handle_input)
root.bind('<KeyPress-Down>', handle_input)
root.bind('<KeyPress-Control_L>', toggle_slow_mode)
root.bind('<KeyRelease-Control_L>', disable_slow_mode)
root.bind('<KeyPress-Escape>', escape_game)

# ゲームループを開始
update()

# Tkinterのイベントループを実行
root.mainloop()
