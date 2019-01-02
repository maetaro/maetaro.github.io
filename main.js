// グローバルに展開
phina.globalize();

// 定数
var ASSETS = {
    //画像
    image: {
        tomapiko: 'https://rawgit.com/phi-jp/phina.js/develop/assets/images/tomapiko_ss.png',
        tomato: 'assets/image/tomato.png',
        tomato_green: 'assets/image/tomato_green.png',
        tomato_yellow: 'assets/image/tomato_yellow.png',
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
        'tomapiko_ss': 'https://rawgit.com/phi-jp/phina.js/develop/assets/tmss/tomapiko.tmss',
    },
    tmx: {
        "map": "assets/tilemap/BRGFCMAP.tmx",
    },
};
// グローバル変数
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
        this.map.setScale(2, 2);

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
        var player = Player('tomapiko').addChildTo(this);
        player.setPosition(100, 400);
        player.collider
            .setSize(player.width - 15, player.height)
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
        shape2.setPosition(shape1.width/2,0);
        this.shape1.fill = 'red';

        // トマト
        this.tomatoGroup = DisplayElement().addChildTo(this.mapGroup);
        var self = this;
        this.addTomato = function () {
            var tname = "tomato";
            var r = Random.random();
            if (r <= 0.3) {
                tname = "tomato_green";
            } else if (r <= 0.6) {
                tname = "tomato_yellow";
            } else {
                tname = "tomato";
            }
            var tomato = Sprite(tname).addChildTo(self.tomatoGroup);
            tomato.origin.set(0, 0); // 左上基準に変更
            tomato.setPosition(SCREEN_WIDTH + 50, 400);
            tomato.collider.show();
        }
        this.addTomato();
        var addTomatoLoop = function () {
            self.addTomato();
            var x = 2000 + (Random.random() * 3000);
            setTimeout(addTomatoLoop, x);
        }
        addTomatoLoop();

        // 画面上でのタッチ移動時
        this.onpointmove = function (e) {
            console.log(e);
            let power = e.pointer.startPosition.x - e.pointer.position.x;
            player.vx = (power > 0 ? -3 : 3);
        };
        // 画面タッチ時処理
        this.onpointend = function () {
            player.vx = 0;
            if (!player.JUMP_FLG) {
                player.anim.gotoAndPlay('right');
            }
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
        //if (this.player.x > SCREEN_WIDTH / 2) {
        //    let vx = this.player.vx;
        //    //if (this.player.vx > 0) {
        //    //    this.player.vx = 0;
        //    //}
        //    this.mapGroup.x -= vx;
        //    this.mapBase.x -= vx;

        //    //this.tomatoGroup.children.each(function (tomato) {
        //    //    tomato.x -= vx;
        //    //    if (tomato.x < -100) {
        //    //        //tomato.x = SCREEN_WIDTH;
        //    //        tomato.remove();
        //    //    }
        //    //})
        //}
        //if (this.player.x < SCREEN_WIDTH / 2) {
        //    let vx = this.player.vx;
        //    if (vx != null) {
        //        this.mapGroup.x += vx;
        //        this.mapBase.x += vx;
        //    }
        //}


        //プレイヤーのアニメーション
        var player = this.player;
        if (player.y > SCREEN_HEIGHT + 100) {  //地面に着地時
            SoundManager.play('se_chakuchi');
            player.y = SCREEN_HEIGHT + 100;
            if (player.JUMP_FLG) {
                player.JUMP_FLG = false;
                player.anim.gotoAndPlay('right');
                player.scaleX *= -1;
            }
            player.vy = 0;
        }
        if (player.y < 0) {
            player.y = 0;
        }
        if (player.x < 0) {
            player.x = 0;
        }
        if (player.x > SCREEN_WIDTH) {
            player.x = SCREEN_WIDTH;
        }

        var self = this;

        var hitTestTomato = function collisionByPlayerAndTomato(a, b, self) {
            var c1 = Circle(a.x, a.y, a.srcRect.width / 2 * a.scaleX * 0.5);
            var c2 = Circle(b.x, b.y, b.srcRect.width / 2 * b.scaleX * 0.5);
            // 円判定
            if (Collision.testCircleCircle(c1, c2)) {
                console.log("hit.");
                self.combo += 1;
                self.score += self.combo * 100;
                var c = ComboLabel(self.combo).addChildTo(self);
                c.x = b.x + 30;
                c.y = b.y - 10;
                b.remove();
                SoundManager.play('se_gettomato');
            }
        }
        this.tomatoGroup.children.each(function (tomato) {
            hitTestTomato(player, tomato, self);
        });

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

                // 2点間の距離
                let distance = Math.sqrt((player.x - left) * (player.x - left) + (player.y - top) * (player.y - top));
                // 2点間の角度
                let radian = Math.atan2(player.y - top, player.x - left);
                let degree = radian * 180 / Math.PI;
                // ベクトル量
                let quantity = Math.sqrt(Math.pow(player.vx, 2), Math.pow(player.vy, 2));
                // ベクトル角度
                let radian2 = Math.atan2(player.vy - 0, player.vx - 0);
                let degree2 = radian2 * 180 / Math.PI * player.scaleX;
                if (degree2 != 0) {
                    degree2 -= 180;
                }
                if (degree2 < 0) {
                    degree2 += 360;
                }
                if (degree2 > 360) {
                    degree2 -= 360;
                }
                
                this.shape1.rotation = degree2;
                this.soundLabel.text = Math.round(degree2, 3);

                let collisionRect = phina.geom.Rect(left, top, unitSize, unitSize);
                if (!phina.geom.Collision.testRectRect(player.collider.getAbsoluteRect(), collisionRect)) {
                    continue;
                }

                var rect = intersect(player.collider.getAbsoluteRect(), collisionRect);
                if (rect.height <= 0 || rect.width <= 0) {
                    continue;
                }
                if (rect.width > rect.height) {
                    player.vy = 0;
                    if (player.y >= collisionRect.y) {
                        // 自分の上側で接触
                        player.top = collisionRect.y + collisionRect.height;
                    } else {
                        // 自分の下側で接触
                        if (player.JUMP_FLG) {
                            player.JUMP_FLG = false;
                            SoundManager.play('se_chakuchi');
                            player.anim.gotoAndPlay('right');
                            player.scaleX *= -1;
                        }
                        player.bottom = collisionRect.y;
                    }
                } else {
                    player.vx = 0;
                    if (player.x <= collisionRect.x) {
                        // 自分の右側で接触
                        player.x = collisionRect.x - (player.collider.getAbsoluteRect().width / 2);
                    } else {
                        // 自分の左側で接触
                        player.x = collisionRect.x + (player.collider.getAbsoluteRect().width / 2);
                    }
                }
            }
        }
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
            this.anim = FrameAnimation('tomapiko_ss').attachTo(this);
            // 初期アニメーション指定
            this.anim.gotoAndPlay('right');
            this.JUMP_FLG = false; // ジャンプ中かどうか
        },
        // 毎フレーム処理
        update: function (app) {
            var key = app.keyboard;
            // 上下左右移動
            if (key.getKey('left')) { this.vx = -6;  }
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
            if (this.vx != null) {
                this.x += this.vx;
            }
            //if (JUMP_FLG) {
                this.vy += 0.3;
            //}
            if (this.vy != null) {
                this.y += this.vy;
            }
        }
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
