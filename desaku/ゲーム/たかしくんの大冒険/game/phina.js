// グローバルに展開
phina.globalize();
// アセット
var ASSETS = {
  // 画像
  image: {
    'tomapiko': 'https://cdn.jsdelivr.net/npm/phina.js@0.2.3/assets/images/tomapiko_ss.png',
  },
  // フレームアニメーション情報
  spritesheet: {
    'tomapiko_ss': 'https://cdn.jsdelivr.net/npm/phina.js@0.2.3/assets/tmss/tomapiko.tmss',
  },
};
// 定数
var JUMP_POWOR = 10; // ジャンプ力
var GRAVITY = 0.5; // 重力
var first_check = 0 //初動用
var test_desu = [0, 2, 4, 6, 8, 10]; // 床のy座標
// var isOnAnyFloor = false;


/*
 * メインシーン
 */
phina.define("MainScene", {
  // 継承
  superClass: 'DisplayScene',

  // コンストラクタ
  init: function() {
    // 親クラス初期化
    this.superInit();
    // 背景
    this.backgroundColor = 'skyblue';

    this.createStage();

    Label({
      text: 'Touch To Jump',
      fontSize: 48,
      fill: 'gray',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.span(3));
    // 床
    // this.floors = [];
    // for (var i = 0; i < test_desu.length; i++) {
    //   var floor = RectangleShape({
    //     width: this.gridX.width,
    //     height: this.gridY.span(0.5),
    //     fill: 'silver',
    //   }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center(test_desu[i]));
    //   this.floors.push(floor); // 床を配列に保存
    // }


    // this.floor = RectangleShape({
    //   width: this.gridX.width,
    //   height: this.gridY.span(1),
    //   fill: 'silver',
    // }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center(2));
    // 壁
    // this.wall = RectangleShape({
    //   width: this.gridX.width,
    //   height: this.gridY.span(1),
    //   fill: 'red',
    // }).addChildTo(this).setPosition(this.gridX.center(test_desu[0]), this.gridY.center(test_desu[1]));
    // プレイヤー作成
    var player = Player('tomapiko').addChildTo(this);
    // 初期位置
    player.x = this.gridX.center();
    player.bottom = this.floors[0].top;
    // 画面タッチ時処理
    this.onpointend = function() {
      // 床の上なら
      if (player.isOnFloor) {
        // 上方向に速度を与える（ジャンプ）
        player.physical.velocity.y = -JUMP_POWOR;
        // 重力復活
        player.physical.gravity.y = GRAVITY;
        // フラグ変更
        player.isOnFloor = false;
        // アニメーション変更
        player.anim.gotoAndPlay('fly');
      } else {
        // player.anim.gotoAndPlay('fly')
      }
    };
    // 参照用
    this.player = player;
    // this.frameCount = 0;
  },

  createStage: function() {
    // 床を作成
    this.floors = [];
    for (var i = 0; i < 5; i++) {
      var floor = RectangleShape({
        width: 800,
        height: this.gridY.span(0.5),
        fill: 'silver',
      }).addChildTo(this).setPosition(400, 200 + i * 80);
      this.floors.push(floor);
    }

    // 壁を作成
    this.walls = [];
    var wallLeft = RectangleShape({
      width: this.gridX.span(1),
      height: this.gridY.height,
      fill: 'brown',
    }).addChildTo(this).setPosition(0, this.gridY.center());
    this.walls.push(wallLeft);

    var wallRight = RectangleShape({
      width: this.gridX.span(1),
      height: this.gridY.height,
      fill: 'brown',
    }).addChildTo(this).setPosition(800, this.gridY.center());
    this.walls.push(wallRight);

    // 障害物（壁）を作成
    var wall1 = RectangleShape({
      width: 100,
      height: 200,
      fill: 'brown',
    }).addChildTo(this).setPosition(600, 320);
    this.walls.push(wall1);

    // 障害物（壁）2
    var wall2 = RectangleShape({
      width: 100,
      height: 200,
      fill: 'brown',
    }).addChildTo(this).setPosition(300, 420);
    this.walls.push(wall2);
  },

  // 毎フレーム処理
  update: function(app) {
    var player = this.player;
    // var i = 0
    
      var isOnAnyFloor = false;
    
    

    // 床とヒットしたら
      if (player.physical.velocity.y >= 0) {  // 下向きに移動している時だけ衝突判定
        this.floors.forEach(function(floor) {
          if (player.hitTestElement(floor)) {
            player.physical.velocity.y = 0;  // y方向の速度を止める（落下を止める）
            player.physical.gravity.y = 0;  // 重力を無効にする
            player.bottom = floor.top;  // 床の上に配置
            player.isOnFloor = true;  // 地面にいるフラグを立てる
            isOnAnyFloor = true;
            // console.log(player.isOnFloor)
            // 通常アニメーションに切り替える
            player.anim.gotoAndPlay('left');

            if (player.damage) {
              player.anim.gotoAndPlay('die');  // ダメージを受けているときのアニメーション
              this.damageCount = 10;
            } else {
              player.anim.gotoAndPlay('left');  // 通常のアニメーション
            }
          }
        }, this);
      
    }
     // プレイヤーがどの床にも接していない場合は、重力を再適用
     if (!isOnAnyFloor) {

      player.isOnFloor = false;
      // console.log(player.isOnFloor)
      player.physical.gravity.y = GRAVITY;  // 重力を再適用
    }

    // 壁との衝突判定
    this.walls.forEach(function(wall) {
      if (player.hitTestElement(wall)) {
        if (player.left < wall.right && player.right > wall.left) {
          // 左右の壁に当たったとき
          if (player.bottom > wall.top && player.top < wall.bottom) {
            player.physical.velocity.x = 0;  // 横方向の速度をゼロに
          }
        }
      }
    });

    // ダメージ処理
    if (this.damageCount > 0) {
      this.damageCount--;
      if (this.damageCount === 0) {
        player.anim.gotoAndPlay('left');
        player.damage = false;
      }
    }
    
    // プレイヤーをキーボードで操作
    var key = app.keyboard;
    if (player.isOnFloor) { //地上操作
      if (key.getKey('A')) {
        if (first_check == 0) {
          player.anim.gotoAndPlay('left');
          first_check = 1;
        }
        player.physical.velocity.x = -5; // 左移動
        player.scaleX = 1; // 左向き
      } else if (key.getKey('D')) {
        if (first_check == 0) {
          player.anim.gotoAndPlay('left');
          first_check = -1;
        }
        player.physical.velocity.x = 5; // 右移動
        player.scaleX = -1; // 右向き
      } else {
        player.anim.gotoAndPlay('stand');
        first_check = 0
        player.physical.velocity.x = 0; // 停止
      }
    } else { //空中操作
      if (key.getKey('A')) {
        if (first_check == 0) {
          // player.anim.gotoAndPlay('left');
          first_check = 1;
        }
        player.physical.velocity.x = -5; // 左移動
        player.scaleX = 1; // 左向き
      } else if (key.getKey('D')) {
        if (first_check == 0) {
          // player.anim.gotoAndPlay('left');
          first_check = -1;
        }
        player.physical.velocity.x = 5; // 右移動
        player.scaleX = -1; // 右向き
      } else {
        // player.anim.gotoAndPlay('stand');
        first_check = 0
        player.physical.velocity.x = 0; // 停止
      }
    }
    // 横スクロール機能
    if (player.x < this.gridX.width / 4) {
      this.floors.forEach(function(floor) {
        floor.x += 5; // 床を右に移動
      });
      player.x += 5; // プレイヤーを右に移動
    } else if (player.x > this.gridX.width * 3 / 4) {
      this.floors.forEach(function(floor) {
        floor.x -= 5; // 床を左に移動
      });
      player.x -= 5; // プレイヤーを左に移動
    }
  },
});
/*
 * プレイヤークラス
 */
phina.define('Player', {
  superClass: 'Sprite',
  // コンストラクタ
  init: function(image) {
    // 親クラス初期化
    this.superInit(image);
    // フレームアニメーションをアタッチ
    this.anim = FrameAnimation('tomapiko_ss').attachTo(this);
    // 初期アニメーション指定
    this.anim.gotoAndPlay('stand');
    // 初速度を与える
    this.physical.force(-2, 0);
    // 床の上かどうか
    this.isOnFloor = true;
    // 端にぶつかる
    this.damage = false;
  },
  // 毎フレーム処理
  update: function(app) {
    var key = app.keyboard;
    // 画面端で速度と向き反転
    if (this.left < 0) {
      if (key.getKey('A')) {
        this.physical.velocity.x = 5
      }
      
      this.physical.velocity.x *= -1;
      this.scaleX *= -1;
      // 飛んでいるときに画面橋に来たらダメージ
      if (!this.isOnFloor && !this.damage) {
        this.anim.gotoAndPlay('damage');
        this.damage = true;
      }
    } else if (this.right > 640) {
      this.physical.velocity.x = 640
      if (!this.isOnFloor && !this.damage) {
        this.anim.gotoAndPlay('damage');
        this.damage = true;
        this.scaleX *= -1;
      }
    }
  },
});
/*
 * メイン処理
 */
phina.main(function() {
  // アプリケーションを生成
  var app = GameApp({
    // MainScene から開始
    startLabel: 'main',
    // アセット読み込み
    assets: ASSETS,
  });
  // fps表示
  //app.enableStats();
  // 実行
  app.run();
});