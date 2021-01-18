/*
 * ATTENTION: The "eval" devtool has been used (maybe by default in mode: "development").
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
/******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/reversi.ts":
/*!************************!*\
  !*** ./src/reversi.ts ***!
  \************************/
/***/ (function(module, exports, __webpack_require__) {

eval("var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;var __extends = (this && this.__extends) || (function () {\n    var extendStatics = function (d, b) {\n        extendStatics = Object.setPrototypeOf ||\n            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||\n            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };\n        return extendStatics(d, b);\n    };\n    return function (d, b) {\n        extendStatics(d, b);\n        function __() { this.constructor = d; }\n        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());\n    };\n})();\n(function (factory) {\n    if ( true && typeof module.exports === \"object\") {\n        var v = factory(__webpack_require__(\"./src sync recursive\"), exports);\n        if (v !== undefined) module.exports = v;\n    }\n    else if (true) {\n        !(__WEBPACK_AMD_DEFINE_ARRAY__ = [__webpack_require__, exports], __WEBPACK_AMD_DEFINE_FACTORY__ = (factory),\n\t\t__WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ?\n\t\t(__WEBPACK_AMD_DEFINE_FACTORY__.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__)) : __WEBPACK_AMD_DEFINE_FACTORY__),\n\t\t__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));\n    }\n})(function (require, exports) {\n    \"use strict\";\n    Object.defineProperty(exports, \"__esModule\", { value: true });\n    exports.Stone = exports.Board = exports.Reversi = exports.GameObject = exports.Game = exports.sum = void 0;\n    var sum = function () {\n        var a = [];\n        for (var _i = 0; _i < arguments.length; _i++) {\n            a[_i] = arguments[_i];\n        }\n        return a.reduce(function (acc, val) { return acc + val; }, 0);\n    };\n    exports.sum = sum;\n    var Game = /** @class */ (function () {\n        function Game(parent) {\n            var _this = this;\n            this.frameCount = 0;\n            this.parent = parent;\n            this.canvas = document.createElement(\"canvas\");\n            this.context = this.canvas.getContext(\"2d\");\n            parent.appendChild(this.canvas);\n            this.fps = document.getElementById(\"fps\");\n            this.prevTime = performance.now();\n            this.children = [];\n            this.size =\n                Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight) - 50;\n            requestAnimationFrame(function (timestamp) { return _this.mainloop(timestamp); });\n        }\n        Game.prototype.mainloop = function (timestamp) {\n            var _this = this;\n            if (this.context == null) {\n                return;\n            }\n            this.frameCount++;\n            this.resizeCanvas();\n            this.update(timestamp);\n            this.context.clearRect(0, 0, this.size, this.size);\n            this.draw(this.context);\n            var now = performance.now();\n            var elapsed = now - this.prevTime;\n            if (elapsed > 1000) {\n                this.fps.innerText = this.frameCount + \"fps\";\n                this.prevTime = performance.now();\n                this.frameCount = 0;\n            }\n            requestAnimationFrame(function (timestamp) { return _this.mainloop(timestamp); });\n        };\n        Game.prototype.update = function (timestamp) {\n            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {\n                var iterator = _a[_i];\n                iterator.update(timestamp);\n            }\n        };\n        Game.prototype.draw = function (context) {\n            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {\n                var iterator = _a[_i];\n                iterator.draw(context);\n            }\n        };\n        Game.prototype.resizeCanvas = function () {\n            this.size =\n                Math.min(document.documentElement.clientWidth, document.documentElement.clientHeight) - 50;\n            this.size = 560;\n            this.canvas.width = this.size;\n            this.canvas.height = this.size;\n        };\n        return Game;\n    }());\n    exports.Game = Game;\n    var GameObject = /** @class */ (function () {\n        function GameObject(game) {\n            this.game = game;\n            this.children = [];\n        }\n        GameObject.prototype.update = function (timestamp) {\n            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {\n                var iterator = _a[_i];\n                iterator.update(timestamp);\n            }\n        };\n        GameObject.prototype.draw = function (context) {\n            for (var _i = 0, _a = this.children; _i < _a.length; _i++) {\n                var iterator = _a[_i];\n                iterator.draw(context);\n            }\n        };\n        return GameObject;\n    }());\n    exports.GameObject = GameObject;\n    var Reversi = /** @class */ (function (_super) {\n        __extends(Reversi, _super);\n        function Reversi(parent) {\n            var _this = _super.call(this, parent) || this;\n            // Reversi.cellWidth = (this.size - Reversi.borderWeight * 9) / 8;\n            Reversi.cellWidth = 67;\n            _this.children.push(new Board(_this));\n            return _this;\n        }\n        Reversi.prototype.resizeCanvas = function () {\n            _super.prototype.resizeCanvas.call(this);\n            // Reversi.cellWidth = (this.size - Reversi.borderWeight * 9) / 8;\n        };\n        Reversi.borderWeight = 2;\n        Reversi.cellWidth = 0;\n        return Reversi;\n    }(Game));\n    exports.Reversi = Reversi;\n    var Board = /** @class */ (function (_super) {\n        __extends(Board, _super);\n        function Board(game) {\n            var _this = _super.call(this, game) || this;\n            _this.hoverCellIndex = null;\n            _this.children.push(new Stone(game, 3, 3, StoneState.White));\n            _this.children.push(new Stone(game, 4, 3, StoneState.Black));\n            _this.children.push(new Stone(game, 3, 4, StoneState.Black));\n            _this.children.push(new Stone(game, 4, 4, StoneState.White));\n            return _this;\n        }\n        Object.defineProperty(Board.prototype, \"stones\", {\n            get: function () {\n                var stones = new Array(64).fill(0);\n                return stones;\n            },\n            enumerable: false,\n            configurable: true\n        });\n        Board.prototype.draw = function (context) {\n            context.fillStyle = \"green\";\n            context.fillRect(0, 0, this.game.size, this.game.size);\n            var borderWeight = Reversi.borderWeight;\n            var cellWidth = Reversi.cellWidth;\n            context.fillStyle = \"black\";\n            for (var i = 0; i < 9; i++) {\n                var pos = (borderWeight + cellWidth) * i;\n                context.fillRect(pos, 0, borderWeight, this.game.size);\n                context.fillRect(0, pos, this.game.size, borderWeight);\n            }\n            if (this.hoverCellIndex != null) {\n                var i = this.hoverCellIndex;\n                var x = i % 8;\n                var y = Math.floor(i / 8);\n                var left = (borderWeight + cellWidth) * x + 1;\n                var top_1 = (borderWeight + cellWidth) * y + 1;\n                var width = borderWeight + cellWidth;\n                var height = borderWeight + cellWidth;\n                context.beginPath();\n                context.rect(left, top_1, width, height);\n                context.strokeStyle = \"white\";\n                context.lineWidth = 1;\n                context.stroke();\n            }\n            _super.prototype.draw.call(this, context);\n        };\n        return Board;\n    }(GameObject));\n    exports.Board = Board;\n    var StoneState = {\n        Black: \"黒\",\n        White: \"白\",\n    };\n    var Stone = /** @class */ (function (_super) {\n        __extends(Stone, _super);\n        function Stone(game, x, y, state) {\n            var _this = _super.call(this, game) || this;\n            if (!Stone.imageLoaded) {\n                Stone.imageLoaded = true;\n                var img_1 = new Image();\n                img_1.src = \"image/stone.png\";\n                img_1.onload = function () {\n                    console.log(\"stone image is loaded.\");\n                    Stone.image = img_1;\n                };\n            }\n            _this.currentFrame = 0;\n            var ma = Stone.margin;\n            _this.frames = [\n                {\n                    ms: 5000,\n                    frames: [\n                        0,\n                        0,\n                        100,\n                        100,\n                        0 + ma,\n                        0 + ma,\n                        Reversi.cellWidth,\n                        Reversi.cellWidth,\n                    ],\n                },\n                {\n                    ms: 300,\n                    frames: [\n                        101,\n                        0,\n                        50,\n                        100,\n                        15 + ma,\n                        0 + ma,\n                        Reversi.cellWidth / 2,\n                        Reversi.cellWidth,\n                    ],\n                },\n                {\n                    ms: 300,\n                    frames: [\n                        148,\n                        0,\n                        50,\n                        100,\n                        20 + ma,\n                        0 + ma,\n                        Reversi.cellWidth / 2,\n                        Reversi.cellWidth,\n                    ],\n                },\n                {\n                    ms: 1000,\n                    frames: [\n                        200,\n                        0,\n                        100,\n                        100,\n                        0 + Stone.margin,\n                        0 + Stone.margin,\n                        Reversi.cellWidth,\n                        Reversi.cellWidth,\n                    ],\n                },\n            ];\n            _this.prevtime = 0;\n            _this.x = x;\n            _this.y = y;\n            _this.state = state;\n            return _this;\n        }\n        Stone.prototype.update = function (timestamp) {\n            // console.log(timestamp);\n            var frame = this.frames[this.currentFrame];\n            if (timestamp - this.prevtime > frame.ms) {\n                this.currentFrame++;\n                if (this.currentFrame >= this.frames.length)\n                    this.currentFrame = 0;\n                this.prevtime = timestamp;\n            }\n        };\n        Stone.prototype.draw = function (context) {\n            if (!Stone.image)\n                return;\n            var frameIndex = this.state == StoneState.Black ? 0 : 3;\n            var frame = this.frames[frameIndex];\n            var frames = frame.frames.slice(0, 8);\n            frames[4] += (Reversi.borderWeight + Reversi.cellWidth) * this.x + 2;\n            frames[5] += (Reversi.borderWeight + Reversi.cellWidth) * this.y + 2;\n            context.drawImage(Stone.image, frames[0], frames[1], frames[2], frames[3], frames[4], frames[5], frames[6], frames[7]);\n        };\n        Stone.prototype.flip = function () {\n            this.state =\n                this.state == StoneState.Black ? StoneState.White : StoneState.Black;\n        };\n        Stone.image = null;\n        Stone.imageLoaded = false;\n        Stone.margin = 2;\n        return Stone;\n    }(GameObject));\n    exports.Stone = Stone;\n    window.onload = function () {\n        var div = document.getElementById(\"board\");\n        if (div == null) {\n            return;\n        }\n        new Reversi(div);\n    };\n});\n\n\n//# sourceURL=webpack://reversi/./src/reversi.ts?");

/***/ }),

/***/ "./src sync recursive":
/*!*******************!*\
  !*** ./src/ sync ***!
  \*******************/
/***/ ((module) => {

eval("function webpackEmptyContext(req) {\n\tvar e = new Error(\"Cannot find module '\" + req + \"'\");\n\te.code = 'MODULE_NOT_FOUND';\n\tthrow e;\n}\nwebpackEmptyContext.keys = () => [];\nwebpackEmptyContext.resolve = webpackEmptyContext;\nwebpackEmptyContext.id = \"./src sync recursive\";\nmodule.exports = webpackEmptyContext;\n\n//# sourceURL=webpack://reversi/./src/_sync?");

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		if(__webpack_module_cache__[moduleId]) {
/******/ 			return __webpack_module_cache__[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => Object.prototype.hasOwnProperty.call(obj, prop)
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	// startup
/******/ 	// Load entry module
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	__webpack_require__("./src/reversi.ts");
/******/ })()
;