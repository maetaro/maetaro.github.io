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
  init: function() {
    // 親クラス初期化
    this.superInit();
    // 背景
    this.backgroundColor = 'skyblue';
    // 判定対象
    var shape = Shape({
      backgroundColor: 'blue',
      x: this.gridX.center(),
      y: this.gridY.center(),
      width: 100,
      height: 100,
    }).addChildTo(this);
    // スプライト画像作成
    var sprite = Sprite('tomapiko').addChildTo(this);
    collider = RectangleShape({
        width: sprite.width,
        height: sprite.height,
        fill: null,
        // padding: 1,
        strokeWidth: 1,
    }).setOrigin(sprite.origin.x, sprite.origin.y)
    .addChildTo(sprite);

    nextRect = RectangleShape({
        width: sprite.width,
        height: sprite.height,
        fill: null,
        // padding: 1,
        strokeWidth: 1,
    }).setOrigin(sprite.origin.x, sprite.origin.y)
    .addChildTo(this);

    // 初期位置
    sprite.vx = 0;
    sprite.vy = 0;
    sprite.x = this.gridX.span(1);
    sprite.y = this.gridY.span(1);
    // タッチイベント
    this.onpointstart = function(e) {
        sprite.vx = 0;
        sprite.vy = 0;
        sprite.x = e.pointer.x;
        sprite.y = e.pointer.y;
      }
    this.onpointmove = function(e) {
        // スプライトをタッチ位置に
    //   sprite.x = e.pointer.x;
    //   sprite.y = e.pointer.y;
      nextRect.x = e.pointer.x;
      nextRect.y = e.pointer.y;

      let setConnector = function(a, b, connector) {
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
        lblDegree.text = "角度:" + parseInt(degree, 10);
        connector.rotation = degree;
        // 2点間の中心位置
        connector.setPosition(
            (a.x + b.x) / 2,
            (a.y + b.y) / 2
        );
      }
      setConnector(sprite, nextRect, connectorNext);

      let pointIntersection = CalcIntersectionPoint(
        sprite,
        nextRect,
        {x:shape.left, y:shape.top},
        {x:shape.right, y:shape.top}
      );

      intersectionShape.x = pointIntersection.x;
      intersectionShape.y = pointIntersection.y;

      if (nextRect.hitTestElement(shape)) {
        // 2点間の角度にそって後ろに戻す
        let distance = 1; //Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
        let radian = Math.atan2(sprite.y - nextRect.y, sprite.x - nextRect.x);
        let degree = radian * 180 / Math.PI;
        if (degree != 0)  degree -= 180;
        if (degree < 0)   degree += 360;
        if (degree > 360) degree -= 360;
      //   nextRect.x = Math.abs(Math.cos(degree) * nextRect.x);
      //   nextRect.y = Math.abs(Math.sin(degree) * nextRect.y);
        nextRect.x = pointIntersection.x;
        nextRect.y = pointIntersection.y;
    }


    };

    var shape1 = RectangleShape().setSize(150, 2).addChildTo(this).hide();
    var connectorNext = RectangleShape({color: 'red'}).setSize(150, 2).addChildTo(this).hide();
    var intersectionShape = RectangleShape({fill:'red'}).setSize(2, 2).addChildTo(this);

    lblDegree = Label({ text: '角度:' })
        .setPosition(100, 100)
        .addChildTo(this);

    let elapsedSecond = 0;
    
    let CalcIntersectionPoint = function(pointA,
        pointB,
        pointC,
        pointD,
        pointIntersection,
        dR,
        dS)
    {
        let dBunbo = ( pointB.x - pointA.x )
            * ( pointD.y - pointC.y )
            - ( pointB.y - pointA.y )
            * ( pointD.x - pointC.x );
        if( 0 == dBunbo )
        {
            // 平行
            return null;
        }

        let vectorAC = {x: pointC.x - pointA.x, y: pointC.y - pointA.y};

        dR = ( ( pointD.y - pointC.y ) * vectorAC.x - ( pointD.x - pointC.x ) * vectorAC.y ) / dBunbo;
        dS = ( ( pointB.y - pointA.y ) * vectorAC.x - ( pointB.x - pointA.x ) * vectorAC.y ) / dBunbo;

        pointIntersection = {
            x: pointA.x + (dR * ( pointB.x - pointA.x )),
            y: pointA.y + (dR * ( pointB.y - pointA.y )),
        };

        return pointIntersection;
    }

    // 更新処理
    this.update = function(app) {
        var key = app.keyboard;
        elapsedSecond += app.deltaTime;

        // 上下左右移動
        if (key.getKey('left')) { sprite.vx -= 2;  }
        if (key.getKey('right')) { sprite.vx += 2; }
        if (key.getKey('up')) { sprite.vy -= 2; }
        if (key.getKey('down')) { sprite.vy += 2; }

        // let setConnector = function(a, b, connector) {
        //     let left = Math.min(a.x, b.x);
        //     let right = Math.max(a.x, b.x);
        //     let top = Math.min(a.y, b.y);
        //     let bottom = Math.max(a.y, b.y);
        //     // 2点間の距離
        //     let distance = Math.sqrt((a.x - b.x) * (a.x - b.x) + (a.y - b.y) * (a.y - b.y));
        //     connector.hide();
        //     if (distance > 1) {
        //         // connector.width = distance; // right - left;
        //         connector.width = 1000;
        //         connector.show();
        //     }
        //     // 2点間の角度
        //     let radian = Math.atan2(a.y - b.y, a.x - b.x);
        //     //radianをdegreeに変換
        //     let degree = radian * 180 / Math.PI;
        //     lblDegree.text = "角度:" + parseInt(degree, 10);
        //     connector.rotation = degree;
        //     // 2点間の中心位置
        //     connector.setPosition(
        //         (a.x + b.x) / 2,
        //         (a.y + b.y) / 2
        //     );
        // }

        // setConnector(sprite, shape, shape1);
        // shape1.hide();

        // if (elapsedSecond > 1500) {
        //     elapsedSecond = 0;
        //     sprite.x += sprite.vx;
        //     sprite.y += sprite.vy;
        //     nextRect.x = sprite.x + sprite.vx;
        //     nextRect.y = sprite.y + sprite.vy;
        //     if (sprite.vx > 0) {
        //         setConnector(sprite, nextRect, connectorNext);
        //     }
        //     // プレイヤーの移動ベクトルとブロックの上辺交点座標の計算
        //     CalcIntersectionPoint(
        //         sprite,
        //         nextRect,
        //         {x:shape.left, y:shape.top},
        //         {x:shape.right, y:shape.top}
        //     );
        // }

        // 矩形判定
        if (sprite.hitTestElement(shape)) {
            shape.backgroundColor = 'red';
        }
        else {
            shape.backgroundColor = 'blue';
        }
    };

},
});
/*
 * メイン処理
 */
phina.main(function() {
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