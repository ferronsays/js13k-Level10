//http://codepen.io/ksmth/pen/BmwAd
//http://codepen.io/hi-im-si/pen/oXyqjG
//http://codepen.io/cRckls/pen/tvbgG

var App = (function() {
    /**
     * Constructor
     */
    var App = function() {
        this.init();
    };

    /**
     * Static Helpers
     */
    App.extend = function(to, from, allowNew) {
        for (var i in from) {
            if (allowNew || to.hasOwnProperty(i)) {
                to[i] = from[i];
            }
        }
        return to;
    };

    App.randPN = function() {
        return Math.random() * 2 - 1;
    };

    App.degToRad = function(degrees) {
        return (degrees * Math.PI) / 180;
    };

    App.radToDeg = function(radians) {
        return (radians * 180) / Math.PI;
    };

    App.wrapAngle = function(r) {
        while (r < -Math.PI) {
            r += Math.PI * 2;
        }
        while (r > Math.PI) {
            r -= Math.PI * 2;
        }

        return r;
    };

    App.wrapNumber = function(n, low, high) {
        if (n < low) {
            return high;
        }

        if (n > high) {
            return low;
        }

        return n;
    };

    App.randRange = function(from, to) {
        return Math.floor(Math.random() * (to - from + 1) + from);
    };

    App.clamp = function(value, min, max) {
        return value < min ? min : value < max ? value : max;
    };

    App.inRange = function(value, min, max) {
        return (value >= min && value <= max);
    };

    App.pad = function(number, length) {
        var str = '' + number;
        while (str.length < length) {
            str = '0' + str;
        }

        return str;
    };

    App.lerp = function (value1, value2, amount) {
        amount = amount < 0 ? 0 : amount;
        amount = amount > 1 ? 1 : amount;
        return value1 + (value2 - value1) * amount;
    };

    App.getHSLString = function (obj) {
        return 'hsl('+obj[0]+', '+obj[1]+'%,'+obj[2]+'%)';
    };

    App.prototype = {
        init: function() {
            this.width = WIDTH;
            this.height = HEIGHT;

            //delta time between steps
            this.dt = 0;

            //current time, used to calculate dt
            this.currentTime = new Date().getTime();

            // Scene Graph
            this.nodes = [];

            // Ref to canvas
            this.canvas = document.getElementById('g');

            // Set dimension properties
            // TODO Magic numbers to save space
            this.resetDimensions(this.canvas, this.width, this.height);

            // Shortcut to canvas context
            this.ctx = this.canvas.getContext('2d');

            this.started = false;

            this.isPaused = false;

            this.pixelation = 100;
            //'hsl(214, 100%, 93%)'
            this.backgroundColor = [214, 100, 93];

            this.storage = window['localStorage'];

            var highScores = this.storage.getItem('highScores');
            var keyBindings = this.storage.getItem('keyBindings');

            if (!highScores) {
                this.storage.setItem('highScores', [
                    300, 600, 1100, 1400, 1700, 2100, 2500, 3000, 4000, 5000
                ]);
            }


            var highScores = this.storage.getItem('highScoresSurvival');

            if (!highScores) {
                this.storage.setItem('highScoresSurvival', [
                    500, 1000, 1750, 2500, 3500, 4500, 6000, 7750, 10000, 14000
                ]);
            }

            if (!keyBindings) {
                keyBindings = {
                    'leftUp': 65, //a
                    'leftDown': 90, //z
                    'rightUp': 75, //;
                    'rightDown': 77 //.
                };

                this.storage.setItem('keyBindings', JSON.stringify(keyBindings));
            } else {
                keyBindings = JSON.parse(keyBindings);
            }

            this.inputController = new InputController(keyBindings);

            this.keybindingObj = {
                isListening: false,
                controlCode: null
            };

            this.physics = new Physics();

            this.camera = new Camera(this);
            // this.camera.moveTo(0,0);
            this.camera.lookat = new V2(this.width/2, this.height/2);
            window.camera = this.camera;

            this.lastModeStartFn = noop;
            this.modeStepFn = noop;

            this.initSounds();
            
            this.initElements();

            this.initEventListeners();

            this.updateGlow();

            this.playMusic();
        },

        /**
         *
         *
         */
        initSounds: function() {
            this.sfx = new SFX();
            window.sfx = this.sfx;

            // Sounds
            var hitSounds =[
                [ 0,,0.0596,,0.2991,0.26,,-0.4176,,,,,,0.4098,,,,,1,,,,,0.5 ],
                [ 1,,0.01,,0.2483,0.2643,,-0.3235,,,,,,,,,,,1,,,,,0.5 ],
                [ 3,,0.0633,,0.2823,0.4429,,-0.6523,,,,,,,,,,,1,,,0.0184,,0.5 ]
            ];

            this.sfx.add('hit', 6, hitSounds, 0.5);

            this.sfx.add('hitSoft', 6, hitSounds, 0.15);

            this.sfx.add('rollFast', 3, [
                // [ 0,,0.0596,,0.2991,0.26,,-0.4176,,,,,,0.4098,,,,,1,,,,,0.5 ]
                [ 3,0.1611,0.0188,,,,,-1,-1,,,-1,-0.4823,,-1,,-1,-1,0.27,-0.8,,,-1,0.5]
            ], 0.1);

            this.sfx.add('rollMedium', 1, [
                // [ 0,,0.0596,,0.2991,0.26,,-0.4176,,,,,,0.4098,,,,,1,,,,,0.5 ]
                [ 3,0.1606,0.0193,0.0118,,,,-0.9775,-1,0.045,0.0064,-1,,,-0.9992,,-0.9556,-0.9679,0.27,-0.8,0.0314,0.0197,-1,0.5]
            ], 0.1);

            this.sfx.add('rollSlow', 1, [
                // [ 0,,0.0596,,0.2991,0.26,,-0.4176,,,,,,0.4098,,,,,1,,,,,0.5 ]
                [ 3,0.1611,0.0188,,0.51,,,-1,-1,,,-1,,,-1,,-1,-1,0.27,-0.8,,,-1,0.5]
            ], 0.1);

            this.sfx.add('sinkGood', 1, [
                [1,,0.2434,,0.4381,0.2149,,0.242,,0.3704,0.593,,,,,,,,1,,,,,0.5]
            ], 0.5);

            this.sfx.add('sinkBad', 1, [
                [3,,0.2104,0.3283,0.4148,0.2317,,,,,,0.4105,0.6585,,,0.7011,0.2052,-0.2005,1,,,,,0.5]
            ], 0.5);

            this.sfx.add('jerk', 1, [
                [3,0.0153,0.2006,0.525,0.0001,0.0617,,0.0561,-0.0122,0.0055,,-0.4821,0.8556,0.0084,0.0352,0.0247,0.0426,-0.2518,0.9836,-0.0067,,0.032,-0.044,0.5]
            ], 0.5);
        },

        /**
         *
         *
         */
        initElements: function() {
            var getEl = document.getElementById.bind(document);

            this.$gameOverScreen = getEl('gameOverScreen');
            this.$startScreen = getEl('startScreen');
            this.$pauseScreen = getEl('pauseScreen');

            this.$classicMode = getEl('classicMode');
            this.$survivalMode = getEl('survivalMode');

            this.$highScores = getEl('highScores');

            this.$restart = getEl('restart');

            this.$goToMenu = getEl('goToMenu');

            this.$wrapper = getEl('wrapper');

            // Get the items, but convert from HTMLCollection to Array
            this.$controlBinders = [].slice.call(document.getElementsByClassName('controlBinder'));

            this.updateControlView();
        },

        updateControlView: function() {
            // Need to put content in these based on control settings
            this.$controlBinders.forEach(function(el){
                var controls = this.inputController.CONTROLS;
                var LU = 'leftUp',
                    LD = 'leftDown',
                    RU = 'rightUp',
                    RD = 'rightDown';

                switch(el.dataset.control) {
                    case LU:
                        el.innerHTML = KEYCODES[controls[LU]];
                        break;
                    case LD:
                        el.innerHTML = KEYCODES[controls[LD]];
                        break;
                    case RU:
                        el.innerHTML = KEYCODES[controls[RU]];
                        break;
                    case RD:
                        el.innerHTML = KEYCODES[controls[RD]];
                        break;
                }
            }.bind(this));
        },

        /**
         *
         *
         */
        initEventListeners: function() {
            window.addEventListener('keydown', function(e) {
                
            }.bind(this));

            this.$classicMode.addEventListener('click', function() {
                this.toggleScreens(null, this.$startScreen);
                this.startClassicMode();
                this.keybindingObj.isListening = false;
            }.bind(this));

            this.$survivalMode.addEventListener('click', function() {
                this.toggleScreens(null, this.$startScreen);
                this.startSurvivalMode();
                this.keybindingObj.isListening = false;
            }.bind(this));

            this.$controlBinders.forEach(function($controlBinder) {
                $controlBinder.addEventListener('click', function(e) {
                    this.keybindingObj = {
                        isListening: true,
                        controlCode: $controlBinder.dataset.control
                    };
                    e.target.innerHTML = 'PRESS ANY KEY';
                }.bind(this));
            }.bind(this));

            this.$restart.addEventListener('click', function() {
                this.toggleScreens(null, this.$gameOverScreen);
                this.lastModeStartFn();
            }.bind(this));

            this.$goToMenu.addEventListener('click', function() {
                this.toggleScreens(this.$startScreen, this.$gameOverScreen);
                this.ctx.clearRect(0, 0, this.width, this.height);
            }.bind(this));

            // window.onblur = function() {
            //     this.pause();
            // }.bind(this);

            document.addEventListener('ballSunk', function(event) {
                var ball = event.detail.ball;
                var hole = event.detail.hole;

                // debugger;

                var triggerPos = hole.trigger.pos;
                var holeSize = hole.trigger.radius;

                ball.destroy();

                if (hole.isActiveTarget) {
                    sfx.play('sinkGood');

                    for (var i = 0; i < 5; i++) {
                        this.addChild(new Pulse(triggerPos.x, triggerPos.y, holeSize, App.randRange(holeSize * 2, holeSize * 4), App.randRange(400, 1000), true));
                    }

                    // Award a bonus ball when crossing 7
                    if (this.currentTargetIndex == 7) {
                        this.totalBalls += 1;
                    }

                    // set bonus and add to score
                    this.score += this.bonus; // TODO add score for hole?
                    
                    var nextTarget = this.currentTargetIndex + 1;
                    if (nextTarget > 10) {
                        // Start over
                        nextTarget = 1;
                    }

                    this.setCurrentTarget(nextTarget);
                } else {
                    sfx.play('sinkBad');

                    for (var i = 0; i < 5; i++) {
                        this.addChild(new Pulse(triggerPos.x, triggerPos.y, holeSize, App.randRange(holeSize * 2, holeSize * 3), App.randRange(50, 300), false));
                    }
                    this.pixelation = 0;
                    this.camera.shake = 70;
                    this.totalBalls -= 1;

                    if (this.totalBalls == 0) {
                        this.onGameOver();
                        return;
                    }
                }

                this.bar.returnToStart();

                window.setTimeout(this.spawnBall.bind(this), 1);

            }.bind(this));
        },

        /**
         *
         *
         */
        startClassicMode: function() {
            this.inputController.presses = [0,0,0,0];
            this.camera.lookat = new V2(this.width/2, this.height/2);
            this.lastModeStartFn = this.startClassicMode;

            this.modeStepFn = function(dt) {
                this.bonusCounter += dt;

                if (this.bonusCounter > 3000) {
                    this.bonusCounter = 0;
                    this.bonus = Math.max(this.bonus - 10, 0);
                }
            }.bind(this);

            this.modeBarLimitFn = function(newP1, newP2) {
                // Don't allow bar to go below bottom threshold
                newP1.y = newP1.y > HEIGHT - 40 ? HEIGHT - 40 : newP1.y;
                newP2.y = newP2.y > HEIGHT - 40 ? HEIGHT - 40 : newP2.y;

                // Don't allow bar to go above top threshold
                newP1.y = newP1.y < 40 ? 40 : newP1.y;
                newP2.y = newP2.y < 40 ? 40 : newP2.y;

                return [newP1, newP2];
            }.bind(this);

            this.modeScoreDrawFn = function() {
                this.ctx.fillStyle = 'black';
                this.ctx.font = "normal 18px monospace";

                this.ctx.fillText('BALLS: ' + this.totalBalls, 10, HEIGHT - 10);
                this.ctx.fillText('BONUS: ' + this.bonus, 150, HEIGHT - 10);
                this.ctx.fillText('SCORE: ' + this.score, 350, HEIGHT - 10);
            }.bind(this);

            this.nodes = [];
            this.physics.reset();

            // Game values
            this.totalBalls = 3;
            this.score = 0;
            this.bonus = 0;
            this.bonusCounter = 0;
            this.currentTargetIndex = 1;

            this.pixelation = 100;

            this.camera.dist = 100;

            this.spawnBall();

            this.spawnBar();

            for (var i = 0; i < STANDARD_CONFIG.length; i++) {
                var hole = new Hole(STANDARD_CONFIG[i].b ? 21 : 17, STANDARD_CONFIG[i].x, STANDARD_CONFIG[i].y - 20, STANDARD_CONFIG[i]);
                this.addChild(hole);
                hole.addToWorld(this.physics);
            }

            this.setCurrentTarget(1);

            this.enable();
        },

        /**
         *
         *
         */
        startSurvivalMode: function() {
            this.inputController.presses = [0,0,0,0];
            this.lastModeStartFn = this.startSurvivalMode; 

            var getNewHole = function(minY, maxY) {
                var x, y, radius = false;
                
                var findSpot = function() {
                    x = App.randRange(10, this.width - 10);
                    y = App.randRange(minY, maxY);
                    radius = Math.random() > 0.5 ? 21 : 17;

                    var goodSpot = true;

                    for (var j = 0; j < this.physics.triggers.length; j++) {
                        var doesCollide = DO_CIRCLES_COLLIDE({pos: new V2(x,y), radius: radius}, this.physics.triggers[j]);
                        if (doesCollide) {
                            goodSpot = false;
                            break;
                        }
                    }

                    return goodSpot;
                }.bind(this)

                var added = false;

                var hole;
                while(!added) {
                    var foundSpot = findSpot();

                    if (!foundSpot) {
                        continue;
                    }

                    hole = new Hole(radius, x, y);
                    break;
                }

                return hole;
            }.bind(this);

            var addNewHole = function(minY, maxY) {
                var hole = getNewHole(minY, maxY);
                this.addChild(hole);
                hole.addToWorld(this.physics);
            }.bind(this);

            this.modeStepFn = function(dt) {
                var y = this.bar.getY() - 300;
                this.camera.moveTo(this.width/2, y);

                var lastScore = this.score;

                this.score = Math.max(Math.round(Math.abs(this.bar.getY() - (HEIGHT - 40))), this.score);

                this.scoreCounter = this.scoreCounter || 0;

                // console.log(this.camera.screenToWorld(0, this.camera.vp.b).y);
                var addMore = 0;
                this.nodes = this.nodes.filter(function(node) {
                    if (node.isHole) {
                        if (node.trigger.pos.y > this.bar.getY() + 200) {
                            // console.log('removing hole', this.nodes.length, this.physics.triggers.length);
                            // debugger;
                            node.destroy();

                            addMore += 2;
                        }
                    }

                    return true;

                }.bind(this));

                var scoreDiff = this.score - lastScore;
                if (scoreDiff != 0) {
                    this.scoreCounter += scoreDiff;
                    if (this.scoreCounter > 100) {
                        addMore +=1;
                        this.scoreCounter = 0;
                        // console.log('adding')
                    }
                }

                for(var i = 0; i < addMore; i++) {
                    var topY = this.camera.screenToWorld(0, this.camera.vp.t).y;
                    addNewHole(topY + 100, topY + 50);

                    // console.log('holes', this.physics.triggers.length);
                    // console.log('nodes', this.nodes.length);
                }
            }.bind(this);

            this.modeBarLimitFn = function(newP1, newP2) {
                // Don't allow bar to go below bottom threshold
                newP1.y = newP1.y > HEIGHT - 40 ? HEIGHT - 40 : newP1.y;
                newP2.y = newP2.y > HEIGHT - 40 ? HEIGHT - 40 : newP2.y;

                return [newP1, newP2];
            }.bind(this);

            this.modeScoreDrawFn = function() {
                this.ctx.fillStyle = 'black';
                this.ctx.font = "normal 18px monospace";

                this.ctx.fillText('SCORE: ' + this.score, 10, HEIGHT - 10);
            }.bind(this);

            this.nodes = [];
            this.physics.reset();

            // Game values
            this.totalBalls = 1;
            this.score = 0;

            this.camera.dist = 100;

            this.spawnBall();

            this.spawnBar();

            for (var i = 0; i < 70; i++) {
                addNewHole(-400, this.height - 200);
            }

            this.enable();
        },

        setCurrentTarget: function(index) {
            this.nodes.forEach(function(node){
                if (typeof node.targetIndex != 'undefined') {
                    node.isActiveTarget = false;
                    if (node.targetIndex == index) {
                        node.isActiveTarget = true;
                    }
                }
            });

            this.currentTargetIndex = index;

            this.bonus = this.currentTargetIndex * 100;
        },

        // Start game Loop
        enable: function() {
            this.started = true;
            this.animate(new Date().getTime());
        },

        // Execute Game Loop
        animate: function(time) {
            this.animationFrame = requestAnimationFrame(function() {
                this.animate(new Date().getTime());
            }.bind(this));

            var dt = time - this.currentTime;
            this.currentTime = time;
            this.step(dt);
        },

        // Turn off game loop
        disable: function() {
            this.started = false;
            cancelAnimationFrame(this.animationFrame);
        },

        // Toggle screen visibility
        toggleScreens: function(on, off) {
            on ? on.style.display = 'block' : noop;
            off ? off.style.display = 'none' : noop;
        },

        // Pause
        pause: function() {
            if(!this.started) {
                return;
            }
            this.disable();
            this.isPaused = true;
            this.toggleScreens(this.$pauseScreen, null);
        },

        // Unpause
        resume: function() {
            if (this.isPaused) {
                this.currentTime = new Date().getTime();
                this.enable();
                this.isPaused = false;
                this.toggleScreens(null, this.$pauseScreen);
            }
        },

        // Game Over
        onGameOver: function() {
            this.disable();

            var highScoreStr = this.lastModeStartFn === this.startClassicMode ? 'highScores' : 'highScoresSurvival';
            var highScores = this.storage.getItem(highScoreStr).split(',').map(function(el){ return parseInt(el); });

            highScores.sort(function(a,b){return b-a;});

            var hasNewHighScore = highScores.some(function(el) {
                return el < this.score;
            }.bind(this));            

            if (hasNewHighScore) {
                highScores.push(this.score);
                highScores.sort(function(a,b){return b-a;});
                highScores = highScores.slice(0,10);
                this.storage.setItem(highScoreStr, highScores);
            }

            function getRank(i) {
                switch(i) {
                    case 1:
                        return '1st';
                    case 2:
                        return '2nd';
                    case 3: 
                        return '3rd';
                    default:
                        return i+'th';
                }
            }

            this.$highScores.innerHTML = highScores.reduce(function(a,b, i) {
                return a + '<tr class="' + (b == this.score ? 'new' : '') +'"><td>'+getRank(i+1)+'</td><td>' + App.pad(b, 6) + '</td></tr>';
            }.bind(this), '');

            this.toggleScreens(this.$gameOverScreen, null);
        },

        resetDimensions: function(canvas, w, h) {
            this.width = canvas.width = w;
            this.height = canvas.height = h;
        },

        addChild: function(obj) {
            this.nodes.push(obj);
        },

        addChildAt: function (obj, index) {
            if (index >= 0 && index <= this.nodes.length){
                this.nodes.splice(index, 0, obj);
            }
        },

        step: function(dt) {
            // after pausing where dt is 0, causes projectiles to stick
            if (!dt) {
                return;
            }


            // this.$bonusVal.innerHTML = this.bonus;

            this.camera.step(dt);
            this.physics.update();

                        this.modeStepFn(dt);


            if (this.pixelation < 100) {
                this.pixelation = Math.min(100, this.pixelation + 1);
            }

            this.bar.handleInput(this.inputController, this);

            var len = this.nodes.length;
            while (len--) {
                var entity = this.nodes[len];
                entity.step(dt);
                if (!entity.isAlive) {
                    this.nodes.splice(len, 1);
                    continue;
                }
            }

            this.render();


                // var blockSize = 5, // only visit every 5 pixels
                //     defaultRGB = {r:0,g:0,b:0}, // for non-supporting envs
                //     canvas = document.createElement('canvas'),
                //     context = canvas.getContext && canvas.getContext('2d'),
                //     data, width, height,
                //     i = -4,
                //     length,
                //     rgb = {r:0,g:0,b:0},
                //     count = 0;
                    
                
                // height = this.height;
                // width = this.width;            
                
                // data = this.ctx.getImageData(0, 0, width, height);
                
                // length = data.data.length;
                
                // while ( (i += blockSize * 4) < length ) {
                //     ++count;
                //     rgb.r += data.data[i];
                //     rgb.g += data.data[i+1];
                //     rgb.b += data.data[i+2];
                // }
                
                // // ~~ used to floor values
                // rgb.r = ~~(rgb.r/count);
                // rgb.g = ~~(rgb.g/count);
                // rgb.b = ~~(rgb.b/count);
            this.updateGlow();
        },

        render: function() {
            this.ctx.fillStyle = App.getHSLString(this.backgroundColor);
            this.ctx.fillRect(0, 0, this.width, this.height);

            this.ctx.save();
            this.ctx.lineWidth = 2;
            this.ctx.strokeStyle = '#2c3e50';
            this.ctx.font = "12px monospace";
            this.ctx.textAlign = 'center';

            this.ctx.save();

            this.camera.begin();

            var len = this.nodes.length;
            while (len--) {
                this.nodes[len].render(this.ctx);
            }

            this.physics.render(this.ctx);

            this.ctx.restore();

            this.camera.end();

            if (this.pixelation !== 100) {
                var w = this.canvas.width * this.pixelation * .01;
                var h = this.canvas.height * this.pixelation * .01;
                this.ctx.drawImage(this.canvas, 0, 0, w, h);
                this.ctx.drawImage(this.canvas, 0, 0, w, h, 0, 0, this.canvas.width, this.canvas.height);
            }

            this.ctx.restore();

            this.modeScoreDrawFn();
        },

        spawnBall: function() {
            this.mainBall = new Ball(10, 300, HEIGHT - 60);
            this.mainBall.addToWorld(this.physics);
            this.addChildAt(this.mainBall, 0);
        },

        spawnBar: function() {
            this.bar = new Bar(new V2(300, HEIGHT - 40), 540, 30);
            this.bar.addToWorld(this.physics);
            this.addChild(this.bar);
        },

        updateGlow: function() {
            this.backgroundColor[0] = App.wrapNumber(this.backgroundColor[0] + 0.25, 0, 360)

            this.$wrapper.style.boxShadow = '0px 0px 80px ' + App.getHSLString(this.backgroundColor);
        },

        playMusic: function() {
            // var AudioContext = window.AudioContext // Default
            //     || window.webkitAudioContext // Safari and old versions of Chrome
            //     || false;
            
            // // create a new Web Audio API context
            // var ac = new AudioContext();

            // // set the playback tempo (120 beats per minute)
            // var tempo = 120;


            // var bass = [
            //   'C3 e',
            //   'G3 e',
            //   'F3 e',
            //   'A3 e'
            // ];

            // var harmony = [
            //   'C4 e',
            //   'D4 e',
            //   'E4 e',
            //   'C4 e',
            // ];
            
            // // create a new sequence
            // var sequence1 = new TinyMusic.Sequence( ac, tempo, bass);
            // var sequence2 = new TinyMusic.Sequence( ac, tempo, harmony);
            
            // // disable looping
            // sequence1.loop = true;
            // sequence2.loop = true;

            // sequence1.gain.gain.value = 0.25; // half volume
            // sequence2.gain.gain.value = 0.25; // half volume

            // // play it
            // // sequence1.play();
            // // sequence2.play();
        }
    };

    return App;
}());

 // for (var i = 0; i < 35; i++) {
            //     var hole = new Hole(20, App.randRange(20, 580), App.randRange(20, 700));
            //     this.addChild(hole);
            //     hole.addToWorld(this.physics);

            //     var hole2 = new Hole(18, App.randRange(20, 580), App.randRange(20, 700));
            //     this.addChild(hole2);
            //     hole2.addToWorld(this.physics);
            // }

            // var b1 = new Circle(20, 200, 0);
            // var b2 = new Circle(20, 300, 0);
            // var b3 = new Circle(20, 250, -50);

            // this.physics.addCircle(b1);
            // this.physics.addCircle(b2);
            // this.physics.addCircle(b3);

            // this.physics.addConstraint(new Constraint(b1, b2, 100));
            // this.physics.addConstraint(new Constraint(b2, b3, 100));
            // this.physics.addConstraint(new Constraint(b1, b3, 100));

            // for (var i = 0; i < 25; i++) {                
            //     this.physics.addCircle(new Circle(App.randRange(5, 20), 101 + i * 10, App.randRange(-10, 10)));
            //     this.physics.addCircle(new Circle(App.randRange(5, 20), 101 + i * 10, App.randRange(-100, -40)));
            //     this.physics.addCircle(new Circle(App.randRange(10, 30), 300 + i * 10, App.randRange(-200, -150)));
            //     this.physics.addCircle(new Circle(App.randRange(5, 10), 200 + i * 10, App.randRange(-300, -200)));
            //     this.physics.addCircle(new Circle(App.randRange(20, 40), 85 + i * 10, App.randRange(-500, -400)));
            // }

            // Random lines for testing
            // this.physics.addLine(new Line(600, 200, 600, 150));
            // this.physics.addLine(new Line(0, 200, 350, 300));
            // this.physics.addLine(new Line(450, 500, 600, 450));            
            // this.physics.addLine(new Line(0, 700, 400, 750));

            // Boundary lines
            // this.physics.addLine(new Line(-1, -600, -1, 901));
            // this.physics.addLine(new Line(-1, 901, 601, 901));
            // this.physics.addLine(new Line(601, -601, 601, 901));

            // this.$ballsVal.innerHTML = this.totalBalls;
            // this.$scoreVal.innerHTML = this.score;
            // this.$bonusVal.innerHTML = this.bonus;
