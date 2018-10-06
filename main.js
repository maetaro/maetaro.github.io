// グローバルに展開
phina.globalize();

// 定数
var ASSETS = {
    //画像
    image: {
        bg: 'assets/image/bg.png',
        bg2: 'assets/image/bg.png',
        tomapiko: 'https://rawgit.com/phi-jp/phina.js/develop/assets/images/tomapiko_ss.png',
        tomato: 'assets/image/tomato.png',
        block: 'assets/image/block.png',
    },
    //フレームアニメーション情報
    spritesheet: {
        'tomapiko_ss': 'https://rawgit.com/phi-jp/phina.js/develop/assets/tmss/tomapiko.tmss',
    },
};
//var SCREEN_WIDTH = 465;              // スクリーン幅
//var SCREEN_HEIGHT = 465;              // スクリーン高さ
//var SPEED = 8;
// 定数
var SCREEN_WIDTH = 465;  // スクリーン幅
var SCREEN_HEIGHT = 565;  // スクリーン高さ
var JUMP_POWOR = 10; // ジャンプ力
var GRAVITY = 0.3; // 重力
var JUMP_FLG = false; // ジャンプ中かどうか

/*
    * プレイヤークラス
    */
phina.define('Player', {
    superClass: 'Sprite',
    // コンストラクタ
    init: function (image) {
        // 親クラス初期化
        this.superInit(image);
        // フレームアニメーションをアタッチ
        this.anim = FrameAnimation('tomapiko_ss').attachTo(this);
        // 初期アニメーション指定
        this.anim.gotoAndPlay('right');
    },
    // 毎フレーム処理
    update: function () {
    },
});

/*
 * メインシーン
 */
phina.define("MainScene", {
    // 継承
    superClass: 'DisplayScene',

    // 初期化
    init: function (options) {
        // super init
        this.superInit(options);
        // 背景
        this.bg = Sprite("bg").addChildTo(this);
        this.bg.origin.set(0, 0); // 左上基準に変更
        this.bg2 = Sprite("bg2").addChildTo(this);
        this.bg2.origin.set(0, 0); // 左上基準に変更
        this.bg2.setPosition(SCREEN_WIDTH, 0); // 左上基準に変更

        // プレイヤー
        var player = Player('tomapiko').addChildTo(this);
        player.setPosition(100, 400);
        this.player = player;

        // トマト
        this.tomato = Sprite("tomato").addChildTo(this);
        this.tomato.origin.set(0, 0); // 左上基準に変更
        this.tomato.setPosition(200, 400);

        // ブロック
        this.block = Sprite("block").addChildTo(this);
        this.block.origin.set(0, 0); // 左上基準に変更
        this.block.setPosition(240, 400);

        // 画面タッチ時処理
        this.onpointend = function () {
            //if (!JUMP_FLG) {
            //    JUMP_FLG = true;
            //    player.anim.gotoAndPlay('fly');
            //    player.scaleX *= -1;
            //}
            //player.physical.velocity.y = -JUMP_POWOR;
            //player.physical.gravity.y = GRAVITY;
            player.physical.velocity.x = 0;
        }

        var flickable = Flickable().attachTo(this);
        // 動かさない
        flickable.horizontal = false;
        flickable.vertical = false;

        flickable.onflickstart = function (e) {
            var angle = e.direction.toAngle().toDegree() | 0;
            player.physical.velocity.x = e.direction.x;
            if (45 < angle && angle < 135) {
                //label.text = 'angle: {0} -> しゃがむ'.format(angle);
            }
            if (225 < angle && angle < 315) {
                //label.text = 'angle: {0} -> ジャンプ'.format(angle);
                if (!JUMP_FLG) {
                    JUMP_FLG = true;
                    player.anim.gotoAndPlay('fly');
                    player.scaleX *= -1;
                }
                player.physical.velocity.y = -JUMP_POWOR;
                player.physical.gravity.y = GRAVITY;
            }
        };
    },

    // 更新
    update: function (app) {

        //背景画像の移動
        this.bg.x -= 2;
        this.bg2.x -= 2;
        if (this.bg.x <= -SCREEN_WIDTH) {
            this.bg.x = 0;
            this.bg2.x = SCREEN_WIDTH;
        }

        this.block.x -= 1;
        if (this.block.x < -100) {
            this.block.x = SCREEN_WIDTH;
        }

        this.tomato.x -= 1;
        if (this.tomato.x < -100) {
            this.tomato.x = SCREEN_WIDTH;
        }

        //プレイヤーのアニメーション
        var player = this.player;
        if (player.y > 410) {  //地面に着地時
            player.y = 400;
            JUMP_FLG = false;
            player.anim.gotoAndPlay('right');
            player.scaleX *= -1;
            player.physical.velocity.y = 0;
            player.physical.gravity.y = 0;
        }

        // 判定用の円
        var c1 = Circle(player.x, player.y, player.srcRect.width / 2 * player.scaleX);
        var c2 = Circle(this.block.x, this.block.y, this.block.srcRect.width / 2 * this.block.scaleX);
        // 円判定
        if (Collision.testCircleCircle(c1, c2)) {
            EGG_DIE = true;
            //egg.frameIndex = 1;
            //egg.scaleY = egg.scaleX = 1.1;
            player.x = this.block.x - 30;
            player.anim.gotoAndPlay('damage');
        }

    }
});

/*
 * メイン処理
 */
phina.main(function () {
    // アプリケーションを生成
    var app = GameApp({
        startLabel: 'main',   // MainScene から開始
        fps: 60,
        width: SCREEN_WIDTH,  // 画面幅
        height: SCREEN_HEIGHT,// 画面高さ
        assets: ASSETS,       // アセット読み込み
    });

    app.enableStats();

    // 実行
    app.run();
});
