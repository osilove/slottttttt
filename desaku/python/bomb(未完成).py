import pygame
import random
import traceback

# Initialize Pygame
pygame.init()

# Screen dimensions
WIDTH, HEIGHT = 640, 480
TILE_SIZE = 40
ROWS, COLS = HEIGHT // TILE_SIZE, WIDTH // TILE_SIZE

# Colors
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
RED = (255, 0, 0)
BLUE = (0, 0, 255)

# Screen setup
screen = pygame.display.set_mode((WIDTH, HEIGHT))
pygame.display.set_caption("Bomberman")

# Clock
clock = pygame.time.Clock()
FPS = 5  # Reduced movement speed

# Player and NPC
player = {"x": 1, "y": 1, "color": BLUE}
npc = {"x": COLS - 2, "y": ROWS - 2, "color": RED, "bomb_timer": 0}

# Game map (0 = empty, 1 = wall)
game_map = [[0 if (x % 2 == 0 or y % 2 == 0) else 1 for x in range(COLS)] for y in range(ROWS)]
game_map[1][1] = 0  # Ensure player starts in an open space
game_map[ROWS - 2][COLS - 2] = 0  # Ensure NPC starts in an open space

# Bombs and explosions
bombs = []
explosions = []

# Functions
def draw_map():
    for y in range(ROWS):
        for x in range(COLS):
            if game_map[y][x] == 1:
                pygame.draw.rect(screen, WHITE, (x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE))

def draw_player(entity):
    pygame.draw.rect(screen, entity["color"], (entity["x"] * TILE_SIZE, entity["y"] * TILE_SIZE, TILE_SIZE, TILE_SIZE))

def place_bomb(x, y):
    bombs.append({"x": x, "y": y, "timer": 30})  # Timer = 30 frames

def explode_bomb(bomb):
    explosion = []
    explosion.append((bomb["x"], bomb["y"]))
    for dx, dy in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
        nx, ny = bomb["x"] + dx, bomb["y"] + dy
        if 0 <= nx < COLS and 0 <= ny < ROWS and game_map[ny][nx] != 1:
            explosion.append((nx, ny))
    return explosion

# Main game loop
running = True
while running:
    try:
        screen.fill(BLACK)

        for event in pygame.event.get():
            if event.type == pygame.QUIT:
                running = False

        # Player movement
        keys = pygame.key.get_pressed()
        if keys[pygame.K_UP] and player["y"] > 0 and game_map[player["y"] - 1][player["x"]] != 1:
            player["y"] -= 1
        if keys[pygame.K_DOWN] and player["y"] < ROWS - 1 and game_map[player["y"] + 1][player["x"]] != 1:
            player["y"] += 1
        if keys[pygame.K_LEFT] and player["x"] > 0 and game_map[player["y"]][player["x"] - 1] != 1:
            player["x"] -= 1
        if keys[pygame.K_RIGHT] and player["x"] < COLS - 1 and game_map[player["y"]][player["x"] + 1] != 1:
            player["x"] += 1
        if keys[pygame.K_SPACE]:
            place_bomb(player["x"], player["y"])

        # NPC movement (random)
        if random.random() < 0.2:
            direction = random.choice(["UP", "DOWN", "LEFT", "RIGHT"])
            if direction == "UP" and npc["y"] > 0 and game_map[npc["y"] - 1][npc["x"]] != 1:
                npc["y"] -= 1
            if direction == "DOWN" and npc["y"] < ROWS - 1 and game_map[npc["y"] + 1][npc["x"]] != 1:
                npc["y"] += 1
            if direction == "LEFT" and npc["x"] > 0 and game_map[npc["y"]][npc["x"] - 1] != 1:
                npc["x"] -= 1
            if direction == "RIGHT" and npc["x"] < COLS - 1 and game_map[npc["y"]][npc["x"] + 1] != 1:
                npc["x"] += 1

        # NPC places bombs randomly
        if npc["bomb_timer"] <= 0 and random.random() < 0.1:
            place_bomb(npc["x"], npc["y"])
            npc["bomb_timer"] = 20  # Cooldown for placing bombs
        npc["bomb_timer"] -= 1

        # Bomb logic
        for bomb in bombs[:]:
            bomb["timer"] -= 1
            if bomb["timer"] <= 0:
                explosions.extend(explode_bomb(bomb))
                bombs.remove(bomb)

        # Draw map, players, bombs, and explosions
        draw_map()
        draw_player(player)
        draw_player(npc)

        for bomb in bombs:
            pygame.draw.circle(screen, WHITE, (bomb["x"] * TILE_SIZE + TILE_SIZE // 2, bomb["y"] * TILE_SIZE + TILE_SIZE // 2), TILE_SIZE // 3)

        for explosion in explosions[:]:
            for ex, ey in explosion:
                pygame.draw.rect(screen, RED, (ex * TILE_SIZE, ey * TILE_SIZE, TILE_SIZE, TILE_SIZE))
            explosions.remove(explosion)

        # Check for collisions with explosions
        for explosion in explosions:
            for ex, ey in explosion:
                if (player["x"], player["y"]) == (ex, ey):
                    print("Player lost!")
                    running = False
                if (npc["x"], npc["y"]) == (ex, ey):
                    print("NPC lost!")
                    running = False

        pygame.display.flip()
        clock.tick(FPS)

    except Exception as e:
        print("An error occurred:", e)
        traceback.print_exc()

pygame.quit()
