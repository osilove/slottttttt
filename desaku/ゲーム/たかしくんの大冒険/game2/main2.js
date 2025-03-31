//phina.jsをグローバルに展開
phina.globalize();

//アセット
var ASSETS = {
  image: {
    'map': 'https://rawgit.com/shioleap/tomapiko-action/master/assets/map.png'
  },
};

//どこからでも参照できるようにする
var map = [];//マップを格納する配列
var floorLen = 0;//地面の長さ

//MainSceneを定義
phina.define('MainScene', {
  //DisplaySceneクラスを継承
  superClass: 'DisplayScene',
  //コンストラクタ
  init: function() {
    //親クラス初期化
    this.superInit();
    
    (21).times(function(i) {
      //マップをMainSceneに追加
      map[i] = Sprite('map', 32, 400).addChildTo(this);
      //基準点を左上にする
      map[i].setOrigin(0,0);
      //位置をセット
      map[i].setPosition(i * 32, 560);
    },this);
    
  },
  //update時の処理
  update: function() {
    
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
  }
});

//メイン処理
phina.main(function() {
  // アプリケーションを生成
  var app = GameApp({
    startLabel: 'splash',//splashから開始
    title: 'アクションゲーム',//タイトル
    backgroundColor: '#42a5f5',//背景色
    fps: 30,//fps
    assets: ASSETS,//アセット
  });
  app.enableStats();//fpsの表示、重いので要らなければコメントアウトする
  app.run();// 実行
});