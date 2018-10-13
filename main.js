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
        tomato_green: 'assets/image/tomato_green.png',
        tomato_yellow: 'assets/image/tomato_yellow.png',
        block: 'assets/image/block.png',
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
};
// 定数
var SCREEN_WIDTH = 566;  // スクリーン幅
var SCREEN_HEIGHT = 980;  // スクリーン高さ
var JUMP_POWOR = 10; // ジャンプ力
var GRAVITY = 0.3; // 重力
var JUMP_FLG = false; // ジャンプ中かどうか

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
        // 背景
        this.bg = Sprite("bg").addChildTo(this);
        this.bg.origin.set(0, 0); // 左上基準に変更
        this.bg2 = Sprite("bg2").addChildTo(this);
        this.bg2.origin.set(0, 0); // 左上基準に変更
        this.bg2.setPosition(SCREEN_WIDTH, 0); // 左上基準に変更

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
        this.player = player;

        // トマト
        this.tomatoGroup = DisplayElement().addChildTo(this);
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

        // ブロック
        this.blockGroup = DisplayElement().addChildTo(this);
        this.addBlock = function (x, y) {
            var block = Sprite("block").addChildTo(self.blockGroup);
            block.origin.set(0, 0); // 左上基準に変更
            block.setPosition(x, y);
            block.collider.show();
            //var block2 = Sprite("block").addChildTo(self.blockGroup);
            //block2.origin.set(0, 0); // 左上基準に変更
            //block2.setPosition(SCREEN_WIDTH + 50, 400 - block2.height);
            //block2.collider.show();
        };

        (100).times(function (i) {
            self.addBlock(i * 30, 600);
        })
        //this.addBlock();
        //var addBlockLoop = function () {
        //    self.addBlock();
        //    var x = 2000 + (Random.random() * 4000);
        //    setTimeout(addBlockLoop, x);
        //}
        //addBlockLoop();

        // 画面上でのタッチ移動時
        this.onpointmove = function (e) {
            console.log(e);
            let power = e.pointer.startPosition.x - e.pointer.position.x;
            player.physical.velocity.x = (power > 0 ? -3 : 3);
            //player.vx = (power > 0 ? -3 : 3);
        };
        // 画面タッチ時処理
        this.onpointend = function () {
            player.physical.velocity.x = 0;
            //player.vx = 0;
            if (!JUMP_FLG) {
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
            player.physical.velocity.x = e.direction.x * 7;
            if (45 < angle && angle < 135) {
                //label.text = 'angle: {0} -> しゃがむ'.format(angle);
            }
            if (225 < angle && angle < 315) {
                //label.text = 'angle: {0} -> ジャンプ'.format(angle);
                SoundManager.play('se_jump');
                if (!JUMP_FLG) {
                    JUMP_FLG = true;
                    player.anim.gotoAndPlay('fly');
                    player.scaleX *= -1;
                }
                player.physical.velocity.y = -JUMP_POWOR;
                player.physical.gravity.y = GRAVITY;
            }
        };

        // コンボ数をリセット
        this.combo = 0;
    },

    // 更新
    update: function (app) {

        //背景画像の移動
        //this.bg.x -= 2;
        //this.bg2.x -= 2;
        if (this.bg.x <= -SCREEN_WIDTH) {
            this.bg.x = 0;
            this.bg2.x = SCREEN_WIDTH;
        }

        //this.blockGroup.children.each(function (block) {
        //    block.x -= 1;
        //    if (block.x < -100) {
        //        //block.x = SCREEN_WIDTH;
        //        block.remove();
        //    }
        //})

        this.tomatoGroup.children.each(function (tomato) {
            tomato.x -= 1;
            if (tomato.x < -100) {
                //tomato.x = SCREEN_WIDTH;
                tomato.remove();
            }
        })

        //プレイヤーのアニメーション
        var player = this.player;
        if (player.y > 710) {  //地面に着地時
            SoundManager.play('se_chakuchi');
            player.y = 610;
            if (JUMP_FLG) {
                JUMP_FLG = false;
                player.anim.gotoAndPlay('right');
                player.scaleX *= -1;
            }
            player.physical.velocity.y = 0;
            player.physical.gravity.y = 0;
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

        // 判定用の円
        var collisionByPlayerAndBlock = function collisionByPlayerAndBlock(a, b, self) {
            if (a.collider.hitTest(b.collider)) {
                //var w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
                //var h = Math.min(a.top, b.top) - Math.max(a.bottom, b.bottom);
                // ベクトルの大きさ
                var quantity = Math.sqrt(Math.pow(player.physical.velocity.x, 2), Math.pow(player.physical.velocity.y, 2));
                var angle = Math.sqrt(Math.pow(player.physical.velocity.x, 2), Math.pow(player.physical.velocity.y, 2));
                a.latestPos = { x: a.x, y: a.y };

                var rect = intersect(a.collider.getAbsoluteRect(), b.collider.getAbsoluteRect());
                if (rect.width > rect.height) {
                    SoundManager.play('se_chakuchi');
                    if (JUMP_FLG) {
                        JUMP_FLG = false;
                        player.anim.gotoAndPlay('right');
                        player.scaleX *= -1;
                    }
                    player.physical.velocity.y = 0;
                    a.bottom = b.top - 1;
                } else {
                    a.physical.velocity.x = 0;
                    if (a.x <= b.x) {
                        a.right = b.left + (a.width - a.collider.getAbsoluteRect().width) / 2;
                    } else {
                        a.left = b.right;
                    }
                }
            }
        };
        this.blockGroup.children.each(function (block) {
            collisionByPlayerAndBlock(player, block, self);
        });

        var hitTestTomato = function collisionByPlayerAndTomato(a, b, self) {
            var c1 = Circle(a.x, a.y, a.srcRect.width / 2 * a.scaleX * 0.5);
            var c2 = Circle(b.x, b.y, b.srcRect.width / 2 * b.scaleX * 0.5);
            // 円判定
            if (Collision.testCircleCircle(c1, c2)) {
                console.log("hit.");
                self.combo += 1;
                self.score += self.combo * 100;
                var c = ComboLabel(self.combo).addChildTo(self);
                //c.x = self.gridX.span(12) + Math.randint(-50, 50);
                //c.y = self.gridY.span(12) + Math.randint(-50, 50);
                c.x = b.x + 30;
                c.y = b.y - 10;
                b.remove();
                SoundManager.play('se_gettomato');
            }
        }
        this.tomatoGroup.children.each(function (tomato) {
            hitTestTomato(player, tomato, self);
        });

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
    },
    // 毎フレーム処理
    update: function (app) {
        //this.move();
    },
    move: function () {
        if (this.vx != null) {
            this.x += this.vx;
        }
        if (this.vy != null) {
            this.y += this.vy;
        }
    }
});


// ブロック
phina.define('Block', {
    superClass: 'RectangleShape',
    init: function (x, y) {
        this.superInit(x, y);
        this.width = 31;
        this.height = 31;
        this.x = x + this.width / 2;
        this.y = y + this.height / 2;
        this.fill = 'transparent';
        this.stroke = 'gray';
    },
    hitPlayerShot: function (playerShot) {

    },
    hitEnemyShot: function (enemyShot) {

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
