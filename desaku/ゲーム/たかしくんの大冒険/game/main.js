// グローバルに展開
phina.globalize();
// アセット
var ASSETS = {
  // 画像
  image: {
    'tomapiko': 'https://cdn.jsdelivr.net/npm/phina.js@0.2.3/assets/images/tomapiko_ss.png',
    // 'map': 'images/block.png'
    'map': 'https://free-texture.net/wp-content/uploads/Brick01.jpg',
    'flore': 'https://img.freepik.com/premium-vector/sky-day-game-background_7814-306.jpg?w=826'
  },
  // フレームアニメーション情報
  spritesheet: {
    'tomapiko_ss': 'https://cdn.jsdelivr.net/npm/phina.js@0.2.3/assets/tmss/tomapiko.tmss',
  },
};
// 定数
var JUMP_POWOR = 5; // ジャンプ力
var GRAVITY = 0.01; // 重力
var first_check = 0 //初動用
var test_desu = [0, 2, 4, 6, 8, 10]; // 床のy座標

//どこからでも参照できるようにする
var map = [];//マップを格納する配列
var floorLen = 0;//地面の長さ

var kari = 1

var key;

var score = 0;
var highscore = 0;
/*
 * メインシーン
 */

phina.define("TitleScene", {
  superClass: 'DisplayScene',
  
  init: function() {
    // 親クラス初期化
    this.superInit();

    score = 0;
    
    // 背景色
    this.backgroundColor = 'skyblue';
    
    // タイトルテキスト
    Label({
      text: '鳥が頑張るゲーム',
      fontSize: 48,
      fill: 'white',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center(-2));

    Label({
      text: 'AD移動 左ckickでジャンプ',
      fontSize: 20,
      fill: 'white',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center(0));

    // 開始ボタン
    Label({
      text: 'Tap to Start',
      fontSize: 32,
      fill: 'yellow',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center(2));

    // タップイベントを設定してゲームを開始
    this.onpointend = function() {
      this.app.replaceScene(MainScene());
    };
  }
});

phina.define("EndingScene", {
  superClass: 'DisplayScene',
  

  init: function() {
    this.superInit();
    

    if(highscore <= score){
      highscore = score;
    }
    

    this.backgroundColor = 'skyblue';

    Label({
      text: '今回のscore: ' + score,
      fontSize: 48,
      fill: 'white',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center(-2));

    Label({
      text: 'highscore: ' + highscore,
      fontSize: 48,
      fill: 'white',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center(0));

    Label({
      text: 'Tap to Title back',
      fontSize: 32,
      fill: 'yellow',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center(2));

    this.onpointend = function() {
      this.app.replaceScene(TitleScene());
    }
  }
});

phina.define("MainScene", {
  // 継承
  superClass: 'DisplayScene',
  // コンストラクタ
  init: function() {
    // 親クラス初期化
    this.superInit();
    // 背景
    this.backgroundColor = 'skyblue';
    this.score += 1;  // 進んだ分だけスコアを加算（適宜変更）
    this.score = 0

    this.label = Label({
      text:  'score: ' + score.padding(6, '0'),
      // text: 'aaa'
    }).addChildTo(this).setPosition(this.gridX.span(3), this.gridY.span(0.5));
    

    // Label({
    //   text: 'Touch To Jump',
    //   fontSize: 48,
    //   fill: 'gray',
    // }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.span(3));
    // // 床
    // this.floors = [];
    // for (var i = 0; i < test_desu.length; i++) {
    //   var floor = RectangleShape({
    //     width: this.gridX.width,
    //     height: this.gridY.span(0.5),
    //     fill: 'silver',
    //   }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center(test_desu[i]));
    //   this.floors.push(floor); // 床を配列に保存
    // }
    (21).times(function(i) {
      //マップをMainSceneに追加
      map[i] = Sprite('map', 32, 400).addChildTo(this);
      //基準点を左上にする
      map[i].setOrigin(0,0);
      //位置をセット
      map[i].setPosition(i * 32, 560);
    },this);


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
    player.anim.gotoAndPlay('fly');
    // 初期位置
    player.x = this.gridX.center();
    // player.bottom = this.floors[0].top;
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
    this.frameCount = 0; // フレームカウント用
  },
  // 毎フレーム処理
  update: function(app) {
    var player = this.player;
    score += 1;  // 進んだ分だけスコアを加算（適宜変更）
    this.label.text = 'score: ' + score.padding(6,'0'); // スコア表示を更新

    // Label({
    //   text: this.score,
    //   // text: 'aaa'
    // }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.center());

    (21).times(function(i) {
      //マップをスクロール
      map[i].x -= 8;
    });
    
    if (map[0].x === -32) {
      (21).times(function(i) {
        //マップのシフト
        map[i].x += 32;
        if (i < 20) {
          map[i].y = map[i + 1].y;
        }
      });
      //新規マップの高さの計算
      if (floorLen > 0) {
        //floorLenをデクリメント
        floorLen--;
      } else if (map[19].y === 960) {
        //floorLenをセット
        floorLen = 1 + Math.randint(0, 4);
        //map[20]の高さをセット
        map[20].y = 960 - 32 * (5 + Math.randint(0,7));
      } else {
        //floorLenをセット
        floorLen = 1 + Math.randint(0, 5);
        //マップ[20]の高さを960に
        map[20].y = 960;
      }
    }

    if (player.y >= 900) {
      console.log("Game Over");
      key = app.keyboard;
      // app.stop(); // ゲームを終了
      app.replaceScene(EndingScene()); // ゲームオーバー時に遷移
    }

    

    // 床との当たり判定処理
  // checkFloorCollision: function(player) {
    var isOnAnyFloor = false;

    // プレイヤーの当たり判定をマップに対してチェック
    map.forEach(function(floor) {
      // console.log(floor)
      if (player.hitTestElement(floor)) {
        
        // 衝突した場合
        if (player.physical.velocity.y >= 0 && player.bottom >= floor.top) {
          // if (kari == 1){
          //   console.log("player y")
          // console.log(player.physical.velocity.y)
          // console.log("plaer bottom")
          // console.log(player.bottom)
          // console.log("floor top")
          // console.log(floor.top)
          // kari += 1
          // }
          if (player.top >= floor.top || player.physical.velocity.v == 0){
            console.log("out")
            player.anim.gotoAndPlay('damage');
            this.damage = true;
            key = false
          }else{
            player.isOnFloor = true;
            player.physical.velocity.y = 0;
            player.bottom = floor.top;
            isOnAnyFloor = true;
            if ( kari == 1) {
              player.anim.gotoAndPlay('stand'); // 地面に着地したら立ち状態に
              kari += 1
              key = app.keyboard;
            }
          }
        }
      }
    });

    // 床に当たっていなければ
    if (!isOnAnyFloor) {
      player.isOnFloor = false;
      player.physical.gravity.y = GRAVITY; // 重力を再適用
      kari = 1
      // player.anim.gotoAndPlay('fly');
    }

    
  // }
    // if (this.frameCount % 5 === 0) { // 例えば5フレームごとに処理
      //   // 床との当たり判定
      //   var isOnAnyFloor = false;
      //   this.floors.forEach(function(floor) {
      //   if (player.hitTestElement(floor)) {
      //     player.physical.velocity.y = 0;
      //     player.physical.gravity.y = 0;
      //     player.bottom = floor.top;
      //     player.isOnFloor = true;
      //     isOnAnyFloor = true;

      //     if (player.damage) {
      //       player.anim.gotoAndPlay('die');
      //       this.damageCount = 10;
      //     } else {
      //       player.anim.gotoAndPlay('left');
      //     }
      //   }
      // }, this); // 'this'をバインドして、damageCountを参照できるようにする

    // }
  

    // 床に当たっていない場合の処理
    // if (!isOnAnyFloor) {
    //   player.isOnFloor = false;
    //   player.physical.gravity.y = GRAVITY; // 重力を再適用
    //   console.log("bbb")
    // }
    
    

    // しばらくdieしたら復活
    if (this.damageCount > 0) {
        this.damageCount--;
        if (this.damageCount == 0) {
          player.anim.gotoAndPlay('left');
          player.damage = false;
        }
    }

    if(score == 1){
      key = app.keyboard;
    }
    
    // プレイヤーをキーボードで操作
    if(key != false){
      key = app.keyboard;
    }
    

    

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
      if(key != false){
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
      
    }

    // 横スクロール機能
    // if (player.x < this.gridX.width / 4) {
    //   this.floors.forEach(function(floor) {
    //     floor.x += 5; // 床を右に移動
    //   });
    //   player.x += 5; // プレイヤーを右に移動
    // } else if (player.x > this.gridX.width * 3 / 4) {
    //   this.floors.forEach(function(floor) {
    //     floor.x -= 5; // 床を左に移動
    //   });
    //   player.x -= 5; // プレイヤーを左に移動
    // }
    

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
    if(key != false){
      key = app.keyboard;
    }
    // 画面端で速度と向き反転
    if (this.left < 0 && key != false ) {
      if (key.getKey('A')) {
        this.physical.velocity.x = 5
      }
      
      this.physical.velocity.x *= -1;
      this.scaleX *= -1;
      // 飛んでいるときに画面端に来たらダメージ
      // if (!this.isOnFloor && !this.damage) {
      //   this.anim.gotoAndPlay('damage');
      //   this.damage = true;
      //   key = false;
      // }
    } else if (this.right > 640) {
      this.physical.velocity.x = 640
      // if (!this.isOnFloor && !this.damage) {
      //   this.anim.gotoAndPlay('damage');
      //   this.damage = true;
      //   this.scaleX *= -1;
      //   key = false;
      // }
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
    // startLabel: 'main',
    startLabel: 'title',
    // アセット読み込み
    assets: ASSETS,
  });
  // fps表示
  //app.enableStats();
  // 実行
  app.run();
});