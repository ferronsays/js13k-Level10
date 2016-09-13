var V2 = (function() {
    function V2(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    }

    V2.prototype = {
        set: function(x, y) {
            this.x = x;
            this.y = y;

            return this;
        },
        copy: function() {
            return new V2(this.x, this.y);
        },
        copyVec: function(v) {
            this.x = v.x;
            this.y = v.y;

            return this;
        },
        length: function() {
            return Math.sqrt(this.x * this.x + this.y * this.y);
        },
        // todo just use square of length?
        lengthSquared: function() {
            return Math.pow(this.x, 2) + Math.pow(this.y, 2);
        },
        norm: function() {
            var m = this.length();

            if (m > 0) {
                this.divide(m);
            }

            return this;
        },
        limit: function(max) {
            if (this.length() > max) {
                this.norm();

                return this.mult(max);
            } else {
                return this;
            }
        },
        heading: function() {
            return -1 * Math.atan2(-1 * this.y, this.x);
        },
        add: function(v) {
            this.x += v.x;
            this.y += v.y;

            return this;
        },
        sub: function(v) {
            this.x -= v.x;
            this.y -= v.y;

            return this;
        },
        mult: function(n) {
            this.x = this.x * n;
            this.y = this.y * n;

            return this;
        },
        divide: function(n) {
            this.x = this.x / n;
            this.y = this.y / n;

            return this;
        },
        dot: function(v) {
            return this.x * v.x + this.y * v.y;
        },
        toInt: function() {
            this.x = Math.round(this.x);
            this.y = Math.round(this.y);
            return this;
        }
    };
    return V2;
})();


var ABC123 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
var noop = function(){};
var SHADOW_OFFSET = 6;
var WIDTH = 600;
var HEIGHT = 800;
var GRAVITY_VECTOR = new V2(0, 0.4);

var DO_CIRCLES_COLLIDE = function(circle1, circle2) {
    if (!circle1 || !circle2) {
        return false;
    }

    if (Math.abs(circle1.pos.y - circle2.pos.y) > 100) {
        return false;
    }

    // http://www.gamedev.net/topic/488102-circlecircle-collision-response/
    var distanceVec = circle1.pos.copy().sub(circle2.pos);
    var distanceSquared = distanceVec.dot(distanceVec);

    var radius = circle1.radius + circle2.radius;
    var radiusSquared = radius * radius;

    if (distanceSquared > radiusSquared) {
        return false;
    }

    return true;
}

var bT = true;
var bF = false;

var STANDARD_CONFIG = [
    {
        x: 492,
        y: 707,
        t: bF
    },
    {
        x: 300,
        y: 666,
        t: bT,
        i: 1
    },
    {
        x: 109,
        y: 658,
        t: bF
    },
    {
        x: 181,
        y: 638,
        t: bF
    },
    {
        x: 239,
        y: 636,
        t: bF,
        b: bT
    },
    {
        x: 373,
        y: 646,
        t: bF
    },
    {
        x: 473,
        y: 642,
        t: bT,
        i: 2
    },
    {
        x: 532,
        y: 640,
        t: bF
    },
    {
        x: 553,
        y: 597,
        t: bF,
        b: bT
    },
    {
        x: 493,
        y: 594,
        t: bF
    },
    {
        x: 426,
        y: 610,
        t: bF
    },
    {
        x: 381,
        y: 590,
        t: bF
    },
    {
        x: 302,
        y: 612,
        t: bF
    },
    {
        x: 127,
        y: 589,
        t: bT,
        i: 3
    },
    {
        x: 71,
        y: 606,
        t: bF
    },
    {
        x: 44,
        y: 547,
        t: bF,
        b: bT
    },
    {
        x: 169,
        y: 555,
        t: bF
    },
    {
        x: 308,
        y: 544,
        t: bF,
        b: bT
    },
    {
        x: 393,
        y: 534,
        t: bT,
        i: 4
    },
    {
        x: 441,
        y: 531,
        t: bF,
        b: bT
    },
    {
        x: 559,
        y: 544,
        t: bF,
        b: bT
    },
    {
        x: 502,
        y: 460,
        t: bF,
        b: bT
    },
    {
        x: 403,
        y: 465,
        t: bF
    },
    {
        x: 359,
        y: 460,
        t: bF
    },
    {
        x: 282,
        y: 485,
        t: bF
    },
    {
        x: 254,
        y: 518,
        t: bF
    },
    {
        x: 218,
        y: 487,
        t: bF
    },
    {
        x: 131,
        y: 496,
        t: bF,
        b: bT
    },
    {
        x: 183,
        y: 450,
        t: bF
    },
    {
        x: 228,
        y: 434,
        t: bT,
        i: 5
    },
    {
        x: 327,
        y: 431,
        t: bF
    },
    {
        x: 469,
        y: 411,
        t: bF
    },
    {
        x: 528,
        y: 374,
        t: bF
    },
    {
        x: 432,
        y: 369,
        t: bF
    },
    {
        x: 314,
        y: 358,
        t: bF
    },
    {
        x: 227,
        y: 350,
        t: bF
    },
    {
        x: 187,
        y: 387,
        t: bF
    },
    {
        x: 137,
        y: 412,
        t: bF,
        b: bT
    },
    {
        x: 91,
        y: 433,
        t: bF
    },
    {
        x: 66,
        y: 388,
        t: bF
    },
    {
        x: 41,
        y: 341,
        t: bF,
        b: bT
    },
    {
        x: 277,
        y: 318,
        t: bF,
        b: bT
    },
    {
        x: 352,
        y: 319,
        t: bF,
        b: bT
    },
    {
        x: 396,
        y: 331,
        t: bF
    },
    {
        x: 471,
        y: 331,
        t: bT,
        i: 6
    },
    {
        x: 543,
        y: 330,
        t: bF
    },
    {
        x: 563,
        y: 287,
        t: bF,
        b: bT
    },
    {
        x: 508,
        y: 288,
        t: bF
    },
    {
        x: 473,
        y: 247,
        t: bF
    },
    {
        x: 398,
        y: 279,
        t: bF,
        b: bT
    },
    {
        x: 313,
        y: 278,
        t: bT,
        i: 7
    },
    {
        x: 239,
        y: 280,
        t: bF
    },
    {
        x: 190,
        y: 270,
        t: bF
    },
    {
        x: 146,
        y: 290,
        t: bF
    },
    {
        x: 101,
        y: 271,
        t: bF
    },
    {
        x: 43,
        y: 243,
        t: bF,
        b: bT
    },
    {
        x: 84,
        y: 223,
        t: bF
    },
    {
        x: 142,
        y: 222,
        t: bT,
        i: 8
    },
    {
        x: 203,
        y: 222,
        t: bF
    },
    {
        x: 276,
        y: 237,
        t: bF,
        b: bT
    },
    {
        x: 352,
        y: 238,
        t: bF,
        b: bT
    },
    {
        x: 403,
        y: 210,
        t: bF
    },
    {
        x: 313,
        y: 196,
        t: bF
    },
    {
        x: 248,
        y: 163,
        t: bF
    },
    {
        x: 141,
        y: 159,
        t: bF
    },
    {
        x: 98,
        y: 174,
        t: bF
    },
    {
        x: 110,
        y: 109,
        t: bF,
        b: bT
    },
    {
        x: 182,
        y: 91,
        t: bF
    },
    {
        x: 215,
        y: 128,
        t: bF,
        b: bT
    },
    {
        x: 281,
        y: 127,
        t: bF,
        b: bT
    },
    {
        x: 341,
        y: 141,
        t: bF
    },
    {
        x: 406,
        y: 141,
        t: bT,
        i: 9
    },
    {
        x: 437,
        y: 176,
        t: bF
    },
    {
        x: 468,
        y: 140,
        t: bF
    },
    {
        x: 548,
        y: 126,
        t: bF,
        b: bT
    },
    {
        x: 438,
        y: 106,
        t: bF
    },
    {
        x: 406,
        y: 71,
        t: bF
    },
    {
        x: 373,
        y: 107,
        t: bF
    },
    {
        x: 311,
        y: 91,
        t: bF
    },
    {
        x: 279,
        y: 57,
        t: bF,
        b: bT
    },
    {
        x: 247,
        y: 92,
        t: bT,
        i: 10
    },
    {
        x: 214,
        y: 56,
        t: bF,
        b: bT
    },
];

// Compiled by wesbos (https://github.com/wesbos/keycodes)
var KEYCODES = {
  3 :"break",
  8 :"backspace / delete",
  9 :"tab",
  12 : 'clear',
  13 :"enter",
  16 :"shift",
  17 :"ctrl",
  18 :"alt",
  19 :"pause/break",
  20 :"caps lock",
  27 :"escape",
  32 :"spacebar",
  33 :"page up",
  34 :"page down",
  35 :"end",
  36 :"home",
  37 :"left arrow",
  38 :"up arrow",
  39 :"right arrow",
  40 :"down arrow",
  41 :"select",
  42 :"print",
  43 :"execute",
  44 :"Print Screen",
  45 :"insert",
  46 :"delete",
  48 :"0",
  49 :"1",
  50 :"2",
  51 :"3",
  52 :"4",
  53 :"5",
  54 :"6",
  55 :"7",
  56 :"8",
  57 :"9",
  58 :":",
  59 :"semicolon (firefox), equals",
  60 :"<",
  61 :"equals (firefox)",
  63 :"ß",
  64 :"@ (firefox)",
  65 :"a",
  66 :"b",
  67 :"c",
  68 :"d",
  69 :"e",
  70 :"f",
  71 :"g",
  72 :"h",
  73 :"i",
  74 :"j",
  75 :"k",
  76 :"l",
  77 :"m",
  78 :"n",
  79 :"o",
  80 :"p",
  81 :"q",
  82 :"r",
  83 :"s",
  84 :"t",
  85 :"u",
  86 :"v",
  87 :"w",
  88 :"x",
  89 :"y",
  90 :"z",
  91 :"Windows Key / Left cmd / Chromebook Search key",
  92 :"right window key",
  93 :"Windows Menu / Right cmd",
  96 :"numpad 0",
  97 :"numpad 1",
  98 :"numpad 2",
  99 :"numpad 3",
  100 :"numpad 4",
  101 :"numpad 5",
  102 :"numpad 6",
  103 :"numpad 7",
  104 :"numpad 8",
  105 :"numpad 9",
  106 :"multiply",
  107 :"add",
  108 :"numpad period (firefox)",
  109 :"subtract",
  110 :"decimal point",
  111 :"divide",
  112 :"f1",
  113 :"f2",
  114 :"f3",
  115 :"f4",
  116 :"f5",
  117 :"f6",
  118 :"f7",
  119 :"f8",
  120 :"f9",
  121 :"f10",
  122 :"f11",
  123 :"f12",
  124 :"f13",
  125 :"f14",
  126 :"f15",
  127 :"f16",
  128 :"f17",
  129 :"f18",
  130 :"f19",
  131 :"f20",
  132 :"f21",
  133 :"f22",
  134 :"f23",
  135 :"f24",
  144 :"num lock",
  145 :"scroll lock",
  160 :"^",
  161: '!',
  163 :"#",
  164: '$',
  165: 'ù',
  166 :"page backward",
  167 :"page forward",
  169 :"closing paren (AZERTY)",
  170: '*',
  171 :"~ + * key",
  173 :"minus (firefox), mute/unmute",
  174 :"decrease volume level",
  175 :"increase volume level",
  176 :"next",
  177 :"previous",
  178 :"stop",
  179 :"play/pause",
  180 :"e-mail",
  181 :"mute/unmute (firefox)",
  182 :"decrease volume level (firefox)",
  183 :"increase volume level (firefox)",
  186 :"semi-colon",
  187 :"equal sign",
  188 :"comma",
  189 :"dash",
  190 :"period",
  191 :"forward slash",
  192 :"grave accent",
  193 :"?, /",
  194 :"numpad period (chrome)",
  219 :"open bracket",
  220 :"back slash",
  221 :"close bracket",
  222 :"single quote",
  223 :"`",
  224 :"left or right cmd key (firefox)",
  225 :"altgr",
  226 :"< /git >",
  230 :"GNOME Compose Key",
  233 :"XF86Forward",
  234 :"XF86Back",
  255 :"toggle touchpad"
};

window.onload = function() {
    window.GAME = new App();
};
