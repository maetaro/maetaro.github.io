// グローバルに展開
phina.globalize();

// 定数
var ASSETS = {
    //画像
    image: {
        tomapiko: 'https://rawgit.com/phi-jp/phina.js/develop/assets/images/tomapiko_ss.png',
    },
    sound: {
        bgm1: 'assets/sound/BGM114-110921-minnnadeyamanobori-wav.wav',
        se_jump: 'assets/sound/se_jump.wav',
        se_chakuchi: 'assets/sound/se_chakuchi.wav',
        se_damage: 'assets/sound/se_damage.wav',
    },
    //フレームアニメーション情報
    spritesheet: {
        'tomapiko_ss': 'https://rawgit.com/phi-jp/phina.js/develop/assets/tmss/tomapiko.tmss',
    },
    tmx: {
        "map1": "assets/tilemap/BRGFCMAP.tmx",
        //"FlashManStage": "assets/tilemap/FlashManStage.tmx",
        //"MetalManStage": "assets/tilemap/MetalManStage.tmx",
        //"AirManStage": "assets/tilemap/AirManStage.tmx",
    },
};
// グローバル変数
var SCREEN_WIDTH = 566;  // スクリーン幅
var SCREEN_HEIGHT = 980;  // スクリーン高さ

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

        this.mapBase = DisplayElement()
            .setPosition(0, 0)
            .addChildTo(this);

        //.tmxファイルからマップをイメージとして取得し、スプライトで表示
        this.tmx = AssetManager.get("tmx", "map1");
        this.collisionLayer = this.tmx.layers.filter(function (e) { return e.name == "collision"; }).first;
        this.map = Sprite(this.tmx.getImage())
            .setOrigin(0, 0)
            .setPosition(0, 0)
            .addChildTo(this.mapBase);
        this.map.tweener.clear().setUpdateType('fps');
        this.map.setScale(2, 2);

        //this.blocks = [];
        //let collisionLayer = this.collisionLayer;
        //const unitSize = 16 * this.map.scaleX;
        //for (var r = 0; r < collisionLayer.height; r++) {
        //    for (var c = 0; c < collisionLayer.width; c++) {
        //        let index = (r * collisionLayer.width) + c;
        //        if (collisionLayer.data[index] == -1) {
        //            continue;
        //        }
        //        let top = r * unitSize;
        //        let left = c * unitSize + this.mapBase.x;

        //        let targetRect = Rect(left, top, unitSize, unitSize);
        //        let s = RectangleShape({
        //            x: targetRect.x + (targetRect.width / 2),
        //            y: targetRect.y + (targetRect.height / 2),
        //            width: targetRect.width,
        //            height: targetRect.height,
        //        })
        //        .addChildTo(this.mapBase);
        //        //s.collider.show();
        //        this.blocks.push(s);
        //    }
        //}


        //// サウンドラベル
        //this.soundLabel = SoundLabel().addChildTo(this);

        // プレイヤー
        this.player = Player().addChildTo(this);
        let player = this.player;

        // フリック
        var flickable = Flickable().attachTo(this);
        // 動かさない
        flickable.horizontal = false;
        flickable.vertical = false;
        flickable.onflickstart = function (e) {
            var angle = e.direction.toAngle().toDegree() | 0;
            player.vx = e.direction.x * 3.5;
            if (225 < angle && angle < 315) {
                player.jump();
            }
        };

        //// コンボ数をリセット
        //this.combo = 0;
    },

    // 画面上でのタッチ移動時
    onpointmove: function (e) {
         console.log(e);
        let power = e.pointer.startPosition.x - e.pointer.position.x;
        this.player.vx = (power > 0 ? -3 : 3);
    },

    // 画面タッチ時処理
    onpointend: function () {
        this.player.vx = 0;
        //if (!this.player.JUMP_FLG) {
        //    this.player.anim.gotoAndPlay('right');
        //}
    },

    // 更新
    update: function (app) {

        //背景画像の移動
        this.player.x = SCREEN_WIDTH / 2;
        let vx = this.player.vx;
        if (vx != null) {
            this.mapBase.x -= vx;
        }
        if (this.mapBase.x > 0) {
            this.mapBase.x = 0;
        }
        if (this.mapBase.x < (this.tmx.width * 16 * this.map.scaleX * -1) + SCREEN_WIDTH) {
            this.mapBase.x = (this.tmx.width * 16 * this.map.scaleX * -1) + SCREEN_WIDTH;
        }

        //プレイヤーが画面をはみ出さないように位置を調整
        var player = this.player;
        if (player.y > SCREEN_HEIGHT + 100) {  //画面最下部に着地時
            player.vy = 0;
        }
        player.y = Math.clamp(player.y, 0, SCREEN_HEIGHT + 100);

        var self = this;

        // 衝突時の位置調整
        let collisionLayer = this.collisionLayer;
        const unitSize = 16 * this.map.scaleX;
        for (var r = 0; r < collisionLayer.height; r++) {
            for (var c = 0; c < collisionLayer.width; c++) {
                let index = (r * collisionLayer.width) + c;
                if (collisionLayer.data[index] == -1) {
                    continue;
                }
                let top = r * unitSize;
                let left = c * unitSize + this.mapBase.x;

                // 衝突判定
                let playerRect = player.collider.getAbsoluteRect();
                let targetRect = Rect(left, top, unitSize, unitSize);
                if (Collision.testRectRect(playerRect, targetRect)) {
                    player.hit(targetRect);
                }
            }
        }
    },

});

/*
 * プレイヤークラス
 */
phina.define('Player', {
    superClass: 'Sprite',
    GetDegree: function () {
        let degree = Vector2(this.vx, this.vy).toAngle().toDegree();
        if (degree != 0) degree -= 180;
        if (degree < 0) degree += 360;
        if (degree > 360) degree -= 360;
        return degree;
    },
    // コンストラクタ
    init: function () {
        // 親クラス初期化
        this.superInit("tomapiko");
        this.vx = 0;
        this.vy = 0;
        // フレームアニメーションをアタッチ
        this.anim = FrameAnimation('tomapiko_ss').attachTo(this);
        // 初期アニメーション指定
        this.anim.gotoAndPlay('right');
        this.JUMP_POWOR = 10; // ジャンプ力
        this.setPosition(100, 400);
        this.collider
            .setSize(this.width - 15, this.height)
            .show();
        this.JUMP_FLG = true;
        this.anim.gotoAndPlay('fly');
        this.scaleX *= -1;
        this.vy = this.JUMP_POWOR * -1;
    },
    // 毎フレーム処理
    update: function (app) {
        var key = app.keyboard;
        // 上下左右移動
        if (key.getKey('left')) {
            if (this.vx > 0) {
                this.anim.gotoAndPlay('left');
            }
            this.vx = -2;
        }
        if (key.getKey('right')) {
            if (this.vx < 0) {
                this.anim.gotoAndPlay('right');
            }
            this.vx = 2;
        }
        if (key.getKey('up')) {
            if (this.vy >= 0) {
                SoundManager.play('se_jump');
                if (!this.JUMP_FLG) {
                    this.JUMP_FLG = true;
                    this.anim.gotoAndPlay('fly');
                    this.scaleX *= -1;
                }
                this.vy = this.JUMP_POWOR * -1;
            }
        }
        this.move();
    },
    move: function () {
        this.x += this.vx;
        // 重力加速
        this.vy += 0.3;
        this.y += this.vy;
    },
    hit: function (other) {
        // 前フレームでの四角
        let nextRect = Rect(this.x + this.vx, this.y + this.vy, this.width, this.heigth);

        // 衝突方向に応じた位置調整
        var intersect = function (a, b) {
            var left = Math.max(a.left, b.left);
            var right = Math.min(a.right, b.right);
            var y = Math.max(a.top, b.top);
            var num2 = Math.min(a.bottom, b.bottom);
            // if (right >= left && num2 >= y)
            return { x: left, y: y, width: right - left, height: num2 - y };
        }
        var rect = intersect(this, other);
        if (rect.height < 0 || rect.width < 0) {
            return;
        }
        let collisionAt = "default";
        if (rect.width > rect.height) {
            // 縦方向で接触
            this.vy = 0;
            if (this.y >= other.y) {
                // 自分の上側で接触
                collisionAt = "top";
            } else {
                // 自分の下側で接触
                collisionAt = "bottom";
            }
        } else {
            // 横方向で接触
            this.vx = 0;
            if (this.x <= other.x) {
                // 自分の右側で接触
                collisionAt = "right";
            } else {
                // 自分の左側で接触
                collisionAt = "left";
            }
        }
        switch (collisionAt) {
            case "top":
                this.top = other.y + other.height + 1;
                break;
            case "bottom":
                if (this.JUMP_FLG) {
                    this.JUMP_FLG = false;
                    SoundManager.play('se_chakuchi');
                    this.anim.gotoAndPlay('right');
                    this.scaleX *= -1;
                }
                this.bottom = other.y - 1;
                break;
            case "left":
                this.x = other.x + (this.width / 2) + 1;
                break;
            case "right":
                this.x = other.x - (this.width / 2) - 1;
                break;
        }
    },
    jump: function () {
        SoundManager.play('se_jump');
        if (!this.JUMP_FLG) {
            this.JUMP_FLG = true;
            this.anim.gotoAndPlay('fly');
            this.scaleX *= -1;
        }
        this.vy = this.JUMP_POWOR * -1;
        this.y -= 10;

    }
});

///*
// * コンボラベル
// */
//phina.define('ComboLabel', {
//    superClass: 'Label',
//    init: function (num) {
//        this.superInit(num + ' combo!');

//        this.stroke = 'white';
//        this.strokeWidth = 8;

//        // 数によって色とサイズを分岐
//        if (num < 5) {
//            this.fill = 'hsl(40, 60%, 60%)';
//            this.fontSize = 16;
//        }
//        else if (num < 10) {
//            this.fill = 'hsl(120, 60%, 60%)';
//            this.fontSize = 32;
//        }
//        else {
//            this.fill = 'hsl(220, 60%, 60%)';
//            this.fontSize = 48;
//        }

//        // フェードアウトして削除
//        this.tweener
//            .by({
//                alpha: -1,
//                y: -50,
//            })
//            .call(function () {
//                this.remove();
//            }, this)
//            ;
//    },
//});

///**
// * サウンドラベル
// */
//phina.define('SoundLabel', {
//    superClass: 'Label',
//    init: function () {
//        this.superInit({ text: 'sound off' });
//        this.setSize(140, 50);
//        this.setPosition(100, 100);
//        this.setInteractive(true); // タッチ可能にする
//        this.collider.show();
//    },
//    // タッチイベント登録
//    onpointstart: function (e) {
//        //alert('タッチされました');
//        if (SoundManager.playingBGM) {
//            SoundManager.playingBGM = false;
//            SoundManager.stopMusic('bgm1');
//            e.target.text = "sound off";
//        } else {
//            SoundManager.playingBGM = true;
//            SoundManager.playMusic('bgm1');
//            e.target.text = "sound on";
//        }
//    },
//});

/*
 * メイン処理
 */
phina.main(function () {
    // アプリケーションを生成
    var app = GameApp({
        startLabel: 'title',   // MainScene から開始
        fps: 60,
        width: SCREEN_WIDTH,  // 画面幅
        height: SCREEN_HEIGHT,// 画面高さ
        assets: ASSETS,       // アセット読み込み
    });

    app.enableStats();

    app.domElement.addEventListener('touchend', function dummy() {
        var s = Sound();
        s.loadFromBuffer();
        s.play().stop();
        app.domElement.removeEventListener('touchend', dummy);
    });

    // 実行
    app.run();
});
