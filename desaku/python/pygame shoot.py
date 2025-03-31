import pygame
import random

# Pygameの初期化
pygame.init()

# ゲームウィンドウのサイズ
SCREEN_WIDTH = 800
SCREEN_HEIGHT = 600
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("弾幕回避ゲーム")

# 色の定義
WHITE = (255, 255, 255)
RED = (255, 0, 0)
BLACK = (0, 0, 0)

# FPS設定
FPS = 60
clock = pygame.time.Clock()

# プレイヤーのクラス
class Player(pygame.sprite.Sprite):
    def __init__(self):
        super().__init__()
        self.image = pygame.Surface((50, 50))
        self.image.fill(WHITE)
        self.rect = self.image.get_rect()
        self.rect.center = (SCREEN_WIDTH // 2, SCREEN_HEIGHT - 50)
        self.speed = 5
        self.lives = 5  # 初期ライフを3に設定

    def update(self):
        keys = pygame.key.get_pressed()
        if keys[pygame.K_LEFT] and self.rect.left > 0:
            self.rect.x -= self.speed
        if keys[pygame.K_RIGHT] and self.rect.right < SCREEN_WIDTH:
            self.rect.x += self.speed
        if keys[pygame.K_UP] and self.rect.top > 0:
            self.rect.y -= self.speed
        if keys[pygame.K_DOWN] and self.rect.bottom < SCREEN_HEIGHT:
            self.rect.y += self.speed

    def decrease_life(self):
        if self.lives > 1:  # ライフが2以上の場合に減らす
            self.lives -= 1
        elif self.lives == 1:  # ライフが1のときはゲームオーバー
            self.lives -= 1
            return True  # ゲームオーバー
        return False

class Bullet(pygame.sprite.Sprite):
    def __init__(self, direction):
        super().__init__()
        self.image = pygame.Surface((10, 30))
        self.image.fill(RED)
        self.rect = self.image.get_rect()

        # ランダムな位置と方向で弾を出現
        if direction == "up":
            self.rect.x = random.randint(0, SCREEN_WIDTH - 10)
            self.rect.y = -30  # 画面外（上）から出現
            self.speed = random.randint(3, 6)
        elif direction == "down":
            self.rect.x = random.randint(0, SCREEN_WIDTH - 10)
            self.rect.y = SCREEN_HEIGHT + 30  # 画面外（下）から出現
            self.speed = random.randint(3, 6)
        elif direction == "left":
            self.rect.x = -30  # 画面外（左）から出現
            self.rect.y = random.randint(0, SCREEN_HEIGHT - 10)
            self.speed = random.randint(3, 6)
        elif direction == "right":
            self.rect.x = SCREEN_WIDTH + 30  # 画面外（右）から出現
            self.rect.y = random.randint(0, SCREEN_HEIGHT - 10)
            self.speed = random.randint(3, 6)

        self.direction = direction

    def update(self):
        if self.direction == "up":
            self.rect.y += self.speed
        elif self.direction == "down":
            self.rect.y -= self.speed
        elif self.direction == "left":
            self.rect.x += self.speed
        elif self.direction == "right":
            self.rect.x -= self.speed

# ゲームオーバーの関数
def game_over():
    font = pygame.font.SysFont(None, 75)
    text = font.render("GAME OVER", True, RED)
    text_rect = text.get_rect(center=(SCREEN_WIDTH // 2, SCREEN_HEIGHT // 2))
    screen.blit(text, text_rect)
    pygame.display.flip()
    pygame.time.wait(2000)

# ライフ表示の関数
def display_lives(player):
    font = pygame.font.SysFont(None, 36)
    text = font.render(f"Lives: {player.lives}", True, WHITE)
    screen.blit(text, (10, 10))

# メインゲームの関数
def main():
    player = Player()
    all_sprites = pygame.sprite.Group()
    all_sprites.add(player)

    bullets = pygame.sprite.Group()

    running = True
    while running:
        clock.tick(FPS)

        # イベント処理
        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        # 弾を一定の間隔で生成
        if random.randint(1, 10) == 1:  # 1/10 の確率で弾を生成
            direction = random.choice(["up", "down", "left", "right"])  # ランダムな方向
            bullet = Bullet(direction)
            bullets.add(bullet)
            all_sprites.add(bullet)

        # 更新
        all_sprites.update()

        # 衝突判定
        collided_bullets = pygame.sprite.spritecollide(player, bullets, False)
        if collided_bullets:
            if player.decrease_life():
                game_over()
                running = False
            # 衝突した弾を削除
            for bullet in collided_bullets:
                bullet.kill()

        # 描画
        screen.fill(BLACK)
        display_lives(player)
        all_sprites.draw(screen)
        pygame.display.update()  # `flip()` ではなく `update()` を使う場合もある

    pygame.quit()

# ゲームの実行
if __name__ == "__main__":
    main()
