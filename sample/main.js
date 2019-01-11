// グローバルに展開
phina.globalize();
// アセット
var ASSETS = {
    // 画像
    image: {
        'tomapiko': 'https://rawgit.com/phi-jp/phina.js/develop/assets/images/tomapiko.png',
    },
};
/*
 * メインシーン
 */
phina.define("MainScene", {
    // 継承
    superClass: 'DisplayScene',
    // コンストラクタ
    init: function () {
        // 親クラス初期化
        this.superInit();
        // 背景
        this.backgroundColor = 'skyblue';
        // 判定対象
        this.block = Block().addChildTo(this);
        this.block.x = this.gridX.center();
        this.block.y = this.gridY.center();

        // スプライト画像作成
        this.player = Player().addChildTo(this);

        // var shape1 = RectangleShape().setSize(150, 2).addChildTo(this).hide();
        this.connectorNext = RectangleShape({ color: 'red' }).setSize(150, 2).addChildTo(this).hide();
        this.intersectionShape = RectangleShape({ fill: 'red' }).setSize(2, 2).addChildTo(this);

        this.lblDegree = Label({ text: '角度:' })
            .setPosition(100, 100)
            .addChildTo(this);

        this.elapsedSecond = 0;

    },
    update: function(app) {
        var key = app.keyboard;
        this.elapsedSecond += app.deltaTime;

        // 上下左右移動
        if (key.getKey('left')) { this.player.vx -= 2; }
        if (key.getKey('right')) { this.player.vx += 2; }
        if (key.getKey('up')) { this.player.vy -= 2; }
        if (key.getKey('down')) { this.player.vy += 2; }
    },
    onpointstart: function (e) {
        this.player.x = e.pointer.x;
        this.player.y = e.pointer.y;
        this.player.nextRect.x = 0;
        this.player.nextRect.y = 0;
    },
    onpointmove: function (e) {
        // スプライトをタッチ位置に
        this.player.nextRect.x = e.pointer.x - this.player.x;
        this.player.nextRect.y = e.pointer.y - this.player.y;

        this.setConnector(this.player, this.player.nextRect, this.connectorNext);

        let pointIntersection = this.CalcIntersectionPoint(
            this.player,
            this.player.nextRect,
            { x: this.block.left, y: this.block.top },
            { x: this.block.right, y: this.block.top }
        );

        if (pointIntersection != null) {
            this.intersectionShape.x = pointIntersection.x;
            this.intersectionShape.y = pointIntersection.y;
        }

        if (Collision.testRectRect(this.player.nextRect.collider.getAbsoluteRect(), this.block.collider.getAbsoluteRect())) {
            // 2点間の角度にそって後ろに戻す
            let distance = 1; //Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
            let radian = Math.atan2(this.player.y - this.player.nextRect.y, this.player.x - this.player.nextRect.x);
            let degree = radian * 180 / Math.PI;
            if (degree != 0) degree -= 180;
            if (degree < 0) degree += 360;
            if (degree > 360) degree -= 360;
            if (pointIntersection != null) {
                this.player.nextRect.x = pointIntersection.x;
                this.player.nextRect.y = pointIntersection.y - (this.player.height / 2);
            }
        }
    },
    CalcIntersectionPoint: function (pointA,
        pointB,
        pointC,
        pointD,
        pointIntersection,
        dR,
        dS) {
        let dBunbo = (pointB.x - pointA.x)
            * (pointD.y - pointC.y)
            - (pointB.y - pointA.y)
            * (pointD.x - pointC.x);
        if (0 == dBunbo) {
            // 平行
            return null;
        }

        let vectorAC = { x: pointC.x - pointA.x, y: pointC.y - pointA.y };

        dR = ((pointD.y - pointC.y) * vectorAC.x - (pointD.x - pointC.x) * vectorAC.y) / dBunbo;
        dS = ((pointB.y - pointA.y) * vectorAC.x - (pointB.x - pointA.x) * vectorAC.y) / dBunbo;

        pointIntersection = {
            x: pointA.x + (dR * (pointB.x - pointA.x)),
            y: pointA.y + (dR * (pointB.y - pointA.y)),
        };

        return pointIntersection;
    },
    setConnector: function (a, b, connector) {
        let left = Math.min(a.x, b.x);
        let right = Math.max(a.x, b.x);
        let top = Math.min(a.y, b.y);
        let bottom = Math.max(a.y, b.y);
        // 2点間の距離
        let distance = Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
        connector.hide();
        if (distance > 1) {
            // connector.width = distance; // right - left;
            connector.width = 1000;
            connector.show();
        }
        // 2点間の角度
        let radian = Math.atan2(a.y - b.y, a.x - b.x);
        //radianをdegreeに変換
        let degree = radian * 180 / Math.PI;
        this.lblDegree.text = "角度:" + parseInt(degree, 10);
        connector.rotation = degree;
        // 2点間の中心位置
        connector.setPosition(
            (a.x + b.x) / 2,
            (a.y + b.y) / 2
        );
    }

});

phina.define("Player", {
    // 継承
    superClass: 'Sprite',
    // コンストラクタ
    init: function () {
        // 親クラス初期化
        this.superInit('tomapiko');
        // 初期位置
        this.vx = 0;
        this.vy = 0;
        this.collider.show();
        RectangleShape({
            fill: 'red',
            width: 5,
            height: 5,
            strokeWidth: 1,
        })
        // .setOrigin(this.origin.x, this.origin.y)
        .addChildTo(this);

        this.nextRect = RectangleShape({
            width: this.width,
            height: this.height,
            fill: null,
            // padding: 1,
            strokeWidth: 1,
        })
        // .setOrigin(this.player.origin.x, this.player.origin.y)
        .addChildTo(this);

    },
    update: function() {
    },
    hit: function(other) {

    },
});

phina.define("Block", {
    // 継承
    superClass: 'RectangleShape',
    // コンストラクタ
    init: function () {
        // 親クラス初期化
        this.superInit({
            backgroundColor: 'blue',
            width: 60,
            height: 60,
        });
        // 初期位置
    },
    // update: function() {
    // },
    // hit: function(other) {

    // },
});

/*
 * メイン処理
 */
phina.main(function () {
    // アプリケーションを生成
    var app = GameApp({
        title: '当り判定(矩形)',
        // MainScene から開始
        //startLabel: 'main',
        // アセット読み込み
        assets: ASSETS,
    });
    // fps表示
    //app.enableStats();
    // 実行
    app.run();
});