var InputController = (function() {

    var InputController = function(CONTROLS) {
        this.CONTROLS = CONTROLS || {};
        this.bind();

        this.presses = [0,0,0,0];
    }

    InputController.prototype = {
        bind: function() {
            var t = this;
            var w = window.addEventListener;

            w('keydown', function(e) {
                if (window.GAME.keybindingObj.isListening) {
                    // TODO prevent using already bound codes
                    this.CONTROLS[window.GAME.keybindingObj.controlCode] = e.keyCode;
                    window.GAME.updateControlView();
                    window.GAME.keybindingObj.isListening = false;
                    return;
                }

                if (e.keyCode === 80) {
                    if (window.GAME.isPaused) {
                        window.GAME.resume();
                    } else {
                        window.GAME.pause();
                    }

                    return;
                }

                switch (e.keyCode) {
                    case this.CONTROLS['leftUp']:
                        t.presses[0] = 1;
                        t.LU = bT;
                        break;
                    case this.CONTROLS['leftDown']:
                        t.presses[1] = 1;
                        t.LD = bT;
                        break;
                    case this.CONTROLS['rightUp']:
                        t.presses[2] = 1;
                        t.RU = bT;
                        break;
                    case this.CONTROLS['rightDown']:
                        t.presses[3] = 1;
                        t.RD = bT;
                        break;
                }
            }.bind(this));

            w('keyup', function(e) {
                switch (e.keyCode) {
                    case this.CONTROLS['leftUp']:
                        t.LU = bF;
                        break;
                    case this.CONTROLS['leftDown']:
                        t.LD = bF;
                        break;
                    case this.CONTROLS['rightUp']:
                        t.RU = bF;
                        break;
                    case this.CONTROLS['rightDown']:
                        t.RD = bF;
                        break;
                }
            }.bind(this));
        }
    }

    return InputController;
}());