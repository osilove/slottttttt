
        phina.globalize();



        // マップの自動生成
        phina.define('Map', {
            superClass: 'DisplayElement',

            init: function() {
                this.superInit();
                this.tileWidth = 32;  // タイルの幅
                this.tileHeight = 32; // タイルの高さ
                this.mapWidth = 100;  // マップの幅
                this.mapHeight = 10;  // マップの高さ
                this.generateMap();   // マップ生成
            },

            generateMap: function() {
                this.tiles = [];
                
                for (var y = 0; y < this.mapHeight; y++) {
                    for (var x = 0; x < this.mapWidth; x++) {
                        // 50% の確率で床を生成（1: 足場, 0: 空き地）
                        var tileType = Math.random() > 0.5 ? 1 : 0;
                        var tile = Sprite('tile'); // 「tile」画像を設定
                        tile.setPosition(x * this.tileWidth, y * this.tileHeight);
                        tile.frameIndex = tileType;  // タイルの種類（0: 空き地, 1: 足場）
                        this.addChild(tile);
                        this.tiles.push(tile);
                    }
                }
            },
        });

        // プレイヤーキャラクターの作成
        phina.define('Player', {
            superClass: 'Sprite',

            init: function() {
                this.superInit('player');  // 'player' という画像を使用
                this.setPosition(100, 280);
                this.speed = 5;  // プレイヤーの移動速度
            },

            update: function() {
                // 左右の移動
                if (this.app.keyboard.getKey('left')) {
                    this.x -= this.speed;
                }
                if (this.app.keyboard.getKey('right')) {
                    this.x += this.speed;
                }

                // プレイヤーを画面外に出ないように制限
                this.x = Math.clamp(this.x, 0, this.app.width - this.width);
            },
        });

        // メインシーン
        phina.define('MainScene', {
            superClass: 'DisplayScene',

            init: function() {
                this.superInit();

                // マップとプレイヤーを作成
                this.map = Map();
                this.addChild(this.map);

                this.player = Player();
                this.addChild(this.player);

                // カメラをプレイヤーに追従させる
                this.camera.x = this.player.x - this.app.width / 2;
                this.camera.y = 0;
            },

            update: function() {
                // プレイヤーの移動更新
                this.player.update();

                // プレイヤーが進むとカメラを右にスクロール
                this.camera.x = this.player.x - this.app.width / 2;

                // 新しいエリアを生成（プレイヤーが進んだら）
                if (this.player.x > this.map.tileWidth * (this.map.mapWidth - 1) - this.app.width / 2) {
                    this.map.generateMap();  // 新しいマップを生成
                }
            },
        });

                // ゲームの初期化
                var game = GameApp({
                  startLabel: 'main',
                  width: 640,
                  height: 360,
                  assets: {
                      images: {
                          player: 'https://via.placeholder.com/32x32?text=Player',  // プレイヤー画像（例）
                          tile: 'https://via.placeholder.com/32x32?text=Tile',    // タイル画像（例）
                      }
                  }
              });
      
              game.run();