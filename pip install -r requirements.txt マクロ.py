import pyautogui
import time
from pynput import mouse, keyboard
import threading
import cv2
import numpy as np
import mss  # 高速スクリーンキャプチャ
import os

# 画像フォルダ内のPNGファイルを取得
image_folder = "images"
image_files = [f for f in os.listdir(image_folder) if f.endswith(".png")]

click_points = []  # クリック位置を記録
mode = {"record": False, "color_right_click": False, "color_left_click": False, "human_detect": False, "autoclick": False, "image_match": False}
running = True

target_color = None
color_threshold = 30  # 初期閾値

# MobileNet SSD（人型検出用）
net = cv2.dnn.readNetFromCaffe(
    "deploy.prototxt", 
    "mobilenet_iter_73000.caffemodel"
)
CLASSES = ["background", "person"]  # 「人」クラスのみ検出

# 連打用設定
click_speed = 0.1  # 初期のクリック間隔（秒）
click_repeat = 1  # クリック回数

### 【1】マウス右クリックでクリック位置を記録
def on_click(x, y, button, pressed):
    if mode["record"] and button == mouse.Button.right and pressed:
        click_points.append((x, y))
        print(f"[{len(click_points)}] 登録されたポイント: {x}, {y}")
        # 画面上にマーカーを描画
        draw_marker(x, y)

### 【2】キーボード入力でモード切替 & 閾値調整
def on_press(key):
    global target_color, color_threshold, click_speed, click_repeat

    if key == keyboard.Key.esc:
        global running
        running = False
        print("終了します。")

    elif key == keyboard.KeyCode.from_char('x'):
        mode["color_right_click"] = not mode["color_right_click"]
        print(f"モード切替: 色検知 → 右クリック [{mode['color_right_click']}]")
        if mode["color_right_click"]: set_color()

    elif key == keyboard.KeyCode.from_char('y'):
        mode["color_left_click"] = not mode["color_left_click"]
        print(f"モード切替: 色検知 → 左クリック [{mode['color_left_click']}]")
        if mode["color_left_click"]: set_color()

    elif key == keyboard.KeyCode.from_char('a'):
        mode["human_detect"] = not mode["human_detect"]
        print(f"モード切替: 人型検知 → 右クリック [{mode['human_detect']}]")

    elif key == keyboard.KeyCode.from_char('r'):
        mode["record"] = not mode["record"]
        print(f"モード切替: クリック登録 [{mode['record']}]")

    elif key == keyboard.KeyCode.from_char('e'):  # 連打設定
        mode["autoclick"] = not mode["autoclick"]
        print(f"連打モード切替: {mode['autoclick']}")
        if mode["autoclick"]:
            print(f"連打設定：速度 = {click_speed}s、回数 = {click_repeat}回")

    elif key == keyboard.KeyCode.from_char('+'):
        color_threshold += 5
        print(f"色の閾値を増加: {color_threshold}")

    elif key == keyboard.KeyCode.from_char('-'):
        color_threshold = max(5, color_threshold - 5)  # 最小値を5に制限
        print(f"色の閾値を減少: {color_threshold}")

    elif key == keyboard.KeyCode.from_char('w'):  # クリック間隔調整（+）
        click_speed = max(0.05, click_speed - 0.05)  # 最小値は0.05秒
        print(f"連打速度（クリック間隔）を早く: {click_speed}s")

    elif key == keyboard.KeyCode.from_char('s'):  # クリック間隔調整（-）
        click_speed += 0.05
        print(f"連打速度（クリック間隔）を遅く: {click_speed}s")

    elif key == keyboard.KeyCode.from_char('d'):  # 連打回数調整（+）
        click_repeat += 1
        print(f"連打回数を増加: {click_repeat}回")

    elif key == keyboard.KeyCode.from_char('f'):  # 連打回数調整（-）
        click_repeat = max(1, click_repeat - 1)
        print(f"連打回数を減少: {click_repeat}回")

    elif key == keyboard.KeyCode.from_char('z'):
        mode["image_match"] = not mode["image_match"]
        print(f"画像一致検出モード: {mode['image_match']}")
# 画像一致検出スレッド
def image_match_thread():
    with mss.mss() as sct:
        while True:
            if mode["image_match"]:  # フラグがオンのときだけ検出を行う
                # スクリーンショットの取得
                screen = np.array(sct.grab(sct.monitors[1]))[:, :, :3]
                for image_file in image_files:
                    image_path = os.path.join(image_folder, image_file)
                    target_image = cv2.imread(image_path, cv2.IMREAD_COLOR)

                    # 画像一致検出
                    result = cv2.matchTemplate(screen, target_image, cv2.TM_CCOEFF_NORMED)
                    threshold = 0.8  # 一致の閾値（調整可能）
                    loc = np.where(result >= threshold)

                    # 検出された位置に対して処理
                    for pt in zip(*loc[::-1]):  # 検出された位置
                        x, y = pt
                        print(f"一致した画像: {image_file} 位置: {x}, {y}")

                        # 位置でクリック
                        pyautogui.moveTo(x, y)
                        pyautogui.click()

                        time.sleep(0.1)  # クリック後に少し待機

            time.sleep(0.1)  # スレッドの待機時間

# 画像一致検出用スレッドを開始
image_match_thread = threading.Thread(target=image_match_thread)
image_match_thread.start()

### 【3】色指定（画面全体の中でクリックした色をターゲットにする）
def set_color():
    global target_color
    print("3秒以内に検知したい色を画面上でクリックしてください")
    time.sleep(3)
    screenshot = pyautogui.screenshot()  # スクリーンショットを取得
    x, y = pyautogui.position()  # 現在のマウス位置を取得
    target_color = np.array(screenshot.getpixel((x, y)))  # 色を取得
    print(f"指定された色: {target_color}")

### 【4】色検知スレッド（mss で高速キャプチャ）
def color_detect_thread():
    with mss.mss() as sct:
        while running:
            # 色検知モードがオンのときに色検知を行う
            if mode["color_right_click"] or mode["color_left_click"]:
                if target_color is None:  
                    continue
                screen = np.array(sct.grab(sct.monitors[1]))[:, :, :3]  # RGB取得
                mask = cv2.inRange(screen, target_color - color_threshold, target_color + color_threshold)  # 色範囲でフィルタリング
                
                # 一致する座標を取得
                loc = np.column_stack(np.where(mask > 0))  # すべての一致する座標を取得
                if loc.shape[0] > 0:
                    x, y = loc[0][1], loc[0][0]  # XとYの順序を修正
                    print(f"検出座標: {x}, {y}")

                    # クリック動作
                    pyautogui.moveTo(x, y)
                    time.sleep(0.05)  # クリックの前に少し待つ

                    # 右クリックまたは左クリック
                    if mode["color_right_click"]:
                        pyautogui.rightClick()
                        print(f"右クリック実行: {x}, {y}")
                    elif mode["color_left_click"]:
                        pyautogui.leftClick()
                        print(f"左クリック実行: {x}, {y}")

                time.sleep(0.1)  # ループの待機時間を適切に調整

### 【5】人型検知スレッド（画面全体を監視）
def human_detect_thread():
    with mss.mss() as sct:
        while running:
            if mode["human_detect"]:
                screen = np.array(sct.grab(sct.monitors[1]))[:, :, :3]  # RGB取得
                h, w = screen.shape[:2]
                blob = cv2.dnn.blobFromImage(screen, 0.007843, (300, 300), 127.5)  # 画像の前処理
                net.setInput(blob)
                detections = net.forward()

                # 人型検出処理
                for i in range(detections.shape[2]):
                    confidence = detections[0, 0, i, 2]  # 検出された信頼度
                    if confidence > 0.5:  # 信頼度が0.5以上の検出結果のみ処理
                        class_id = int(detections[0, 0, i, 1])
                        if class_id < len(CLASSES) and CLASSES[class_id] == "person":  # 人クラスの検出
                            box = detections[0, 0, i, 3:7] * np.array([w, h, w, h])  # 座標のスケーリング
                            (x1, y1, x2, y2) = box.astype("int")
                            center_x, center_y = (x1 + x2) // 2, (y1 + y2) // 2  # 人型の中心を計算
                            
                            pyautogui.moveTo(center_x, center_y)  # 中心位置にマウス移動
                            time.sleep(0.05)
                            pyautogui.rightClick()  # 右クリック
                            print(f"【人型検出】→ 右クリック: ({center_x}, {center_y})")

            time.sleep(0.1)  # 高速化

### 【6】連打実行スレッド
def autoclick_thread():
    while running:
        if mode["autoclick"]:
            for _ in range(click_repeat):
                for (x, y) in click_points:
                    pyautogui.moveTo(x, y)  # クリック位置にマウス移動
                    pyautogui.click()  # クリック実行
                    time.sleep(click_speed)  # クリック後に待機
            time.sleep(0.5)  # ループの待機時間を適切に調整

### 【7】画面上にクリック位置のマーカー（番号付き）を描画
def draw_marker():
    screenshot = pyautogui.screenshot()  # スクリーンショットを取得
    img = np.array(screenshot)
    img = cv2.cvtColor(img, cv2.COLOR_RGB2BGR)  # 画像の色空間変換

    # すべてのクリックポイントにマーカー（円+番号）を描画
    for idx, (x, y) in enumerate(click_points):
        cv2.circle(img, (x, y), 10, (0, 0, 255), -1)  # 赤い円を描画
        cv2.putText(img, str(idx + 1), (x + 10, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)

    # 描画した画像を表示
    cv2.imshow("Click Marker", img)  # クリック位置にマーカーを描画
    cv2.waitKey(1)  # 即時更新
### 【1】マウス右クリックでクリック位置を記録
def on_click(x, y, button, pressed):
    if mode["record"] and button == mouse.Button.right and pressed:  # 右クリックされた時のみ記録
        click_points.append((x, y))  # クリックした座標をリストに追加
        print(f"[{len(click_points)}] 登録されたポイント: {x}, {y}")  # 登録されたポイントを表示
        draw_marker()  # 修正した `draw_marker()` を呼び出してマーカーを描画

### 【8】スレッド起動
# スレッドの起動に関するユーザー向けの説明
print("""
[R]キー: クリック登録ON/OFF  # クリック位置登録の切替
[X]キー: 色検知 → 右クリック ON/OFF  # 色検知で右クリックの切替
[Y]キー: 色検知 → 左クリック ON/OFF  # 色検知で左クリックの切替
[A]キー: 人型検知 ON/OFF  # 人型検知の有効/無効切替
[E]キー: 連打モード ON/OFF  # 連打モードのON/OFF切替
[W]キー: 連打速度調整 (+)  # 連打速度を早く
[S]キー: 連打速度調整 (-)  # 連打速度を遅く
[D]キー: 連打回数調整 (+)  # 連打回数を増加
[F]キー: 連打回数調整 (-)  # 連打回数を減少
[Z]: 画像検出  # 画像一致検出を開始
""")

# スレッドをそれぞれ開始
# マウスのクリックイベントを監視するリスナー
mouse_listener = threading.Thread(target=lambda: mouse.Listener(on_click=on_click).start())
# キーボードのキー入力を監視するリスナー
keyboard_listener = threading.Thread(target=lambda: keyboard.Listener(on_press=on_press).start())
# 色検知スレッド
color_thread = threading.Thread(target=color_detect_thread)
# 人型検知スレッド
human_thread = threading.Thread(target=human_detect_thread)
# 連打実行スレッド
autoclick_thread = threading.Thread(target=autoclick_thread)

# 各スレッドを開始
mouse_listener.start()
keyboard_listener.start()
color_thread.start()
human_thread.start()
autoclick_thread.start()

# メインスレッドでの待機（プログラムが終了するまで1秒ごとに待機）
while running:
    time.sleep(1)

# 終了処理（ウィンドウの閉鎖）
cv2.destroyAllWindows()

# すべてのスレッドが終了するのを待つ
mouse_listener.join()  # マウスリスナーの終了を待つ
keyboard_listener.join()  # キーボードリスナーの終了を待つ
color_thread.join()  # 色検知スレッドの終了を待つ
human_thread.join()  # 人型検知スレッドの終了を待つ
autoclick_thread.join()  # 連打スレッドの終了を待つ

# プログラム終了メッセージ
print("プログラムが終了しました。")
