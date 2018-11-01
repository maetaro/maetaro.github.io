// グローバルに展開
phina.globalize();

// 定数
var ASSETS = {
    //画像
    image: {
        player: 'assets/image/player.png',
        rockbuster: 'assets/image/rockbuster.png',
    },
    sound: {
        bgm1: 'assets/sound/BGM114-110921-minnnadeyamanobori-wav.wav',
        se_jump: 'assets/sound/se_jump.wav',
        se_chakuchi: 'assets/sound/se_chakuchi.wav',
        se_damage: 'assets/sound/se_damage.wav',
        se_gettomato: 'assets/sound/se_gettomato.wav',
    },
    //フレームアニメーション情報
    spritesheet: {
        'player_ss': 'assets/tmss/player.tmss',
        'rockbuster_ss': 'assets/tmss/rockbuster.tmss',
    },
    tmx: {
        "map": "assets/tilemap/BRGFCMAP.tmx",
    },
};
// グローバル変数
var SCALE = 2.5;
var SCREEN_WIDTH = 566;  // スクリーン幅
var SCREEN_HEIGHT = 980;  // スクリーン高さ
var JUMP_POWOR = 10; // ジャンプ力

var time = 0;

function intersect(a, b) {
    var x = Math.max(a.left, b.left);
    var num1 = Math.min(a.right, b.right);
    var y = Math.max(a.top, b.top);
    var num2 = Math.min(a.bottom, b.bottom);
    if (num1 >= x && num2 >= y)
        return { x: x, y: y, width: num1 - x, height: num2 - y };
    else
        return { x: 0, y: 0, width: 0, height: 0 };
}
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

        var self = this;

        // 描画オブジェクトすべて
        this.mapGroup = DisplayElement().addChildTo(this);

        this.mapBase = phina.display.DisplayElement()
            .setPosition(0, 0)
            .addChildTo(this);

        //.tmxファイルからマップをイメージとして取得し、スプライトで表示
        this.tmx = phina.asset.AssetManager.get("tmx", "map");
        this.map = phina.display.Sprite(this.tmx.getImage())
            .setOrigin(0, 0)
            .setPosition(0, 0)
            .addChildTo(this.mapBase);
        this.map.tweener.clear().setUpdateType('fps');
        this.map.setScale(SCALE, SCALE);

        // サウンドラベル
        this.soundLabel = Label({ text: 'sound off' }).addChildTo(this);
        this.soundLabel.setPosition(100, 100);
        this.soundLabel.collider.show();
        // タッチ可能にする
        this.soundLabel.setInteractive(true);
        // タッチイベント登録
        this.soundLabel.onpointstart = function (e) {
            //alert('タッチされました');
            if (SoundManager.playingBGM) {
                SoundManager.playingBGM = false;
                SoundManager.stopMusic('bgm1');
                e.target.text = "sound off";
            } else {
                SoundManager.playingBGM = true;
                SoundManager.playMusic('bgm1');
                e.target.text = "sound on";
            }
        };

        // プレイヤー
        var player = Player('player').addChildTo(this);
        player.setPosition(100, 400);
        player.setScale(SCALE, SCALE);
        player.collider
            //.setSize(player.width - 15, player.height)
            .show();
        player.JUMP_FLG = true;
        player.anim.gotoAndPlay('fly');
        player.scaleX *= -1;
        player.vy = -JUMP_POWOR;
        this.player = player;

        var shape1 = RectangleShape().addChildTo(player);
        var shape2 = RectangleShape().addChildTo(shape1);
        shape2.fill = 'yellow';
        shape2.width = 15;
        shape2.height = 15;
        this.shape1 = shape1;
        this.shape1.height = 2;
        this.shape1.width = 150;
        shape2.setPosition(shape1.width / 2, 0);
        this.shape1.fill = 'red';
        shape1.hide();
        shape2.hide();

        //// トマト
        //this.tomatoGroup = DisplayElement().addChildTo(this.mapGroup);
        //var self = this;
        //this.addTomato = function () {
        //    var tname = "tomato";
        //    var r = Random.random();
        //    if (r <= 0.3) {
        //        tname = "tomato_green";
        //    } else if (r <= 0.6) {
        //        tname = "tomato_yellow";
        //    } else {
        //        tname = "tomato";
        //    }
        //    var tomato = Sprite(tname).addChildTo(self.tomatoGroup);
        //    tomato.origin.set(0, 0); // 左上基準に変更
        //    tomato.setPosition(SCREEN_WIDTH + 50, 400);
        //    tomato.collider.show();
        //}
        //this.addTomato();
        //var addTomatoLoop = function () {
        //    self.addTomato();
        //    var x = 2000 + (Random.random() * 3000);
        //    setTimeout(addTomatoLoop, x);
        //}
        //addTomatoLoop();

        // 画面上でのタッチ移動時
        this.onpointmove = function (e) {
            console.log(e);
            let power = e.pointer.startPosition.x - e.pointer.position.x;
            player.vx = (power > 0 ? -3 : 3);
            player.anim.gotoAndPlay('run');
        };
        // 画面タッチ時処理
        this.onpointend = function () {
            player.vx = 0;
            if (!player.JUMP_FLG) {
                player.anim.gotoAndPlay('right');
            }
            // プレイヤーの攻撃
            player.shot();
        }

        var flickable = Flickable().attachTo(this);
        // 動かさない
        flickable.horizontal = false;
        flickable.vertical = false;

        flickable.onflickstart = function (e) {
            var angle = e.direction.toAngle().toDegree() | 0;
            let cl = ComboLabel(
                (Math.round(e.direction.x * 100, 2) / 100) + " " + (Math.round(e.direction.y * 100, 2) / 100)
            ).addChildTo(self).setPosition(100, 100);
            cl.fontSize = 16;
            player.vx = e.direction.x * 3.5;
            if (45 < angle && angle < 135) {
                //label.text = 'angle: {0} -> しゃがむ'.format(angle);
            }
            if (225 < angle && angle < 315) {
                //label.text = 'angle: {0} -> ジャンプ'.format(angle);
                SoundManager.play('se_jump');
                if (!player.JUMP_FLG) {
                    player.JUMP_FLG = true;
                    player.anim.gotoAndPlay('fly');
                    player.scaleX *= -1;
                }
                player.vy = -JUMP_POWOR;
                player.y -= 10;
            }
        };

        // コンボ数をリセット
        this.combo = 0;
    },

    // 更新
    update: function (app) {

        var self = this;

        // 経過時間更新
        time += app.deltaTime;

        //背景画像の移動
        this.player.x = SCREEN_WIDTH / 2;
        let vx = this.player.vx;
        if (vx != null) {
            this.mapGroup.x -= vx;
            this.mapBase.x -= vx;
        }
        if (this.mapBase.x > 0) {
            this.mapBase.x = 0;
        }
        if (this.mapBase.x < (this.tmx.width * 16 * this.map.scaleX * -1) + SCREEN_WIDTH) {
            this.mapBase.x = (this.tmx.width * 16 * this.map.scaleX * -1) + SCREEN_WIDTH;
        }

        //プレイヤーの移動
        var player = this.player;
        if (player.JUMP_FLG) {
            player.vy += 0.3;
        }
        let nextPos = player.getNextPos();
        let nextRect = phina.geom.Rect(nextPos.x, nextPos.y, player.collider.getAbsoluteRect().width, player.collider.getAbsoluteRect().height);

        let collisionLayer = this.tmx.layers.filter(function (e) { return e.name == "collision"; }).first;
        const unitSize = 16 * this.map.scaleX;
        for (var r = 0; r < collisionLayer.height; r++) {
            for (var c = 0; c < collisionLayer.width; c++) {
                let index = (r * collisionLayer.width) + c;
                if (collisionLayer.data[index] == -1) {
                    continue;
                }
                let top = r * unitSize;
                let left = c * unitSize + this.mapBase.x;

                let blockRect = phina.geom.Rect(left, top, unitSize, unitSize);
                if (!phina.geom.Collision.testRectRect(player.collider.getAbsoluteRect(), blockRect)) {
                    continue;
                }

                let checkResult = player.collisionBlock(blockRect);

                //this.shape1.rotation = degree2;

                // プレイヤーの上で接触
                if (checkResult.contactAt == "top") {
                    // プレイヤーより上のブロックの底に位置を合わせる
                    nextPos.y = blockRect.bottom;
                }
                // プレイヤーの下で接触
                if (checkResult.contactAt == "bottom") {
                    // チェック対象ブロックの上に乗る
                    player.JUMP_FLG = false;
                    nextPos.y = blockRect.top; //- player.height;
                    player.vy = 0;
                }
                // プレイヤーの左で接触
                if (checkResult.contactAt == "left") {
                    // プレイヤーの左をブロックの右に合わせる
                    nextPos.left = blockRect.right;
                }
                // プレイヤーの右で接触
                if (checkResult.contactAt == "right") {
                    // プレイヤーの右をブロックの左に合わせる
                    nextPos.right = blockRect.left;
                }
            }
        }
        player.x = nextPos.x;
        player.y = nextPos.y;
    }
});

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
        this.anim = FrameAnimation('player_ss').attachTo(this);
        // 初期アニメーション指定
        this.anim.gotoAndPlay('right');
        this.topShape = RectangleShape().addChildTo(this);
        this.topShape.fill = 'yellow';
        this.topShape.width = 16;
        this.topShape.height = 1;
        this.topShape.setPosition(0, -8);
        this.bottomShape = RectangleShape().addChildTo(this);
        this.bottomShape.fill = 'yellow';
        this.bottomShape.width = 16;
        this.bottomShape.height = 1;
        this.bottomShape.setPosition(0, 16);
        this.leftShape = RectangleShape().addChildTo(this);
        this.leftShape.fill = 'yellow';
        this.leftShape.width = 1;
        this.leftShape.height = 20;
        this.leftShape.setPosition(-8, 4);
        this.rightShape = RectangleShape().addChildTo(this);
        this.rightShape.fill = 'yellow';
        this.rightShape.width = 1;
        this.rightShape.height = 20;
        this.rightShape.setPosition(8, 4);

        this.JUMP_FLG = false; // ジャンプ中かどうか
        this.vx = 0;
        this.vy = 0;
        //var shape1 = RectangleShape().addChildTo(this);
        //var shape2 = RectangleShape().addChildTo(shape1);
        //shape2.fill = 'yellow';
        //shape2.width = 15;
        //shape2.height = 15;
        //this.shape1 = shape1;
        //this.shape1.height = 2;
        //this.shape1.width = 150;
        //shape2.setPosition(shape1.width / 2, 0);
        //this.shape1.fill = 'red';
    },
    // 毎フレーム処理
    update: function (app) {
        var key = app.keyboard;
        // 上下左右移動
        if (key.getKey('left')) { this.vx = -6; }
        if (key.getKey('right')) { this.vx = 6; }
        if (key.getKey('up')) {
            SoundManager.play('se_jump');
            if (!this.JUMP_FLG) {
                this.JUMP_FLG = true;
                this.anim.gotoAndPlay('fly');
                this.scaleX *= -1;
            }
            this.vy = -JUMP_POWOR;
        }
        //if (key.getKey('down')) { this.vy = 3; }
        this.move();
    },
    move: function () {
        //if (this.vx != null) {
        //    this.x += this.vx;
        //}
        ////if (JUMP_FLG) {
        //    this.vy += 0.3;
        ////}
        //if (this.vy != null) {
        //    this.y += this.vy;
        //}
    },
    getNextPos: function () {
        let nextPos = {
            x: this.x + this.vx,
            y: this.y + this.vy
        }

        if (nextPos.y > SCREEN_HEIGHT + 100) {  //地面に着地時
            SoundManager.play('se_chakuchi');
            nextPos.y = SCREEN_HEIGHT + 100;
            if (this.JUMP_FLG) {
                this.JUMP_FLG = false;
                this.anim.gotoAndPlay('right');
                this.scaleX *= -1;
            }
            this.vy = 0;
        }
        if (nextPos.y < 0) {
            nextPos.y = 0;
        }
        if (nextPos.x < 0) {
            nextPos.x = 0;
        }
        if (nextPos.x > SCREEN_WIDTH) {
            nextPos.x = SCREEN_WIDTH;
        }
        return nextPos;
    },
    collisionBlock: function (rect) {
        let nextPos = this.getNextPos();
        // 2点間の距離
        let distance = Math.sqrt((nextPos.x - rect.x) * (nextPos.x - rect.x) + (nextPos.y - rect.y) * (nextPos.y - rect.y));
        // 2点間の角度
        let radian = Math.atan2(nextPos.y - rect.y, nextPos.x - rect.x);
        let degree = radian * 180 / Math.PI;
        // ベクトル量
        let quantity = Math.sqrt(Math.pow(this.vx, 2), Math.pow(this.vy, 2));
        // ベクトル角度
        let radian2 = Math.atan2(this.vy - 0, this.vx - 0);
        let degree2 = radian2 * 180 / Math.PI * this.scaleX;
        if (degree2 != 0) {
            degree2 -= 180;
        }
        if (degree2 < 0) {
            degree2 += 360;
        }
        if (degree2 > 360) {
            degree2 -= 360;
        }
        console.log(degree);
        
//left
let p1 = {x: this.x, y:this.y };
let p2 = {x: nextPos.x, y:nextPos.y };
let p3 = {x: rect.x - (rect.width/2), y:rect.y };
let p4 = {x: rect.x - (rect.width/2), y:rect.y + rect.height };

let dev = (p2.y-p1.y)*(p4.x-p3.x)-(p2.x-p1.x)*(p4.y-p3.y);

let d1, d2;
d1 = (p3.y*p4.x-p3.x*p4.y);
	d2 = (p1.y*p2.x-p1.x*p2.y);
let ap1 = {};
	ap1.x = d1*(p2.x-p1.x) - d2*(p4.x-p3.x)
	ap1.x /= dev;
	ap1.y = d1*(p2.y-p1.y) - d2*(p4.y-p3.y)
	ap1.y /= dev;


return {
            collision: true,
            contactAt: 'bottom',
        }
    },
    shot: function () {
        this.anim.gotoAndPlay('shot');
        RockBuster({ x: this.x, y: this.y }).addChildTo(this.parent);
    }
});

/*
 * ロックバスタークラス
 */
phina.define('RockBuster', {
    superClass: 'Sprite',
    // コンストラクタ
    init: function (initPos) {
        // 親クラス初期化
        this.superInit('rockbuster');
        this.setScale(SCALE, SCALE)
        // フレームアニメーションをアタッチ
        this.anim = FrameAnimation('rockbuster_ss').attachTo(this);
        // 初期アニメーション指定
        this.anim.gotoAndPlay('normal');
        this.x = initPos.x;
        this.y = initPos.y;
    },
    // 毎フレーム処理
    update: function (app) {
        this.x += 20;
    },
    //move: function () {
    //    if (this.vx != null) {
    //        this.x += this.vx;
    //    }
    //    if (JUMP_FLG) {
    //        this.vy += 0.3;
    //    }
    //    if (this.vy != null) {
    //        this.y += this.vy;
    //    }
    //}
});

/*
 * コンボラベル
 */
phina.define('ComboLabel', {
    superClass: 'Label',
    init: function (num) {
        this.superInit(num + ' combo!');

        this.stroke = 'white';
        this.strokeWidth = 8;

        // 数によって色とサイズを分岐
        if (num < 5) {
            this.fill = 'hsl(40, 60%, 60%)';
            this.fontSize = 16;
        }
        else if (num < 10) {
            this.fill = 'hsl(120, 60%, 60%)';
            this.fontSize = 32;
        }
        else {
            this.fill = 'hsl(220, 60%, 60%)';
            this.fontSize = 48;
        }

        // フェードアウトして削除
        this.tweener
            .by({
                alpha: -1,
                y: -50,
            })
            .call(function () {
                this.remove();
            }, this)
            ;
    },
});

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
        var s = phina.asset.Sound();
        s.loadFromBuffer();
        s.play().stop();
        app.domElement.removeEventListener('touchend', dummy);
    });

    // 実行
    app.run();
});
