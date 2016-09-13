var Bar = (function() {
    var Bar = function(centerPoint, length, edgeHeight) {
        var halfLength = length / 2;

        this.length = length;

        this.centerPoint = centerPoint.copy();

        this.edgeHeight = edgeHeight;

        this.baseOffset = 10;

        this.maxHeightDifference = 175;

        this.leftPoint = new V2(centerPoint.x - halfLength, centerPoint.y);
        this.rightPoint = new V2(centerPoint.x + halfLength, centerPoint.y);

        this.base = new Line(this.leftPoint.x, this.leftPoint.y, this.rightPoint.x, this.rightPoint.y);
        // this.base2 = new Line(this.leftPoint.x, this.leftPoint.y + this.baseOffset, this.rightPoint.x, this.rightPoint.y + this.baseOffset);

        this.leftBoundary = new Line(this.leftPoint.x, this.leftPoint.y, this.leftPoint.x, this.leftPoint.y - edgeHeight);
        this.rightBoundary = new Line(this.rightPoint.x, this.rightPoint.y, this.rightPoint.x, this.rightPoint.y - edgeHeight);

        // Set the entities
        this.leftBoundary.entity = this.rightBoundary.entity = this.base.entity = this;

        // Flags for collision start/end
        this.wasBCWS = false;
        this.isBCWS = false;
        this.wasBCWB = false;
        this.isBCWB = false;

        this.isAlive = true;

        this.timeSinceLastInput = 0;
        this.receivingInput = false;
    }

    Bar.prototype = {
        addToWorld: function addToWorld(world) {
            world.addLine(this.base);
            // world.addLine(this.base2);
            world.addLine(this.leftBoundary);
            world.addLine(this.rightBoundary);
        },

        handleInput: function(inputController, game) {
            // TODO if not touched for a while screw with bar

            var leftOffsetY = 0;
            var rightOffsetY = 0;

            var OFFSET_AMT = 2.6;

            if (inputController.LU) {
                leftOffsetY -= OFFSET_AMT;
            }

            if (inputController.LD) {
                leftOffsetY += OFFSET_AMT;
            }

            if (inputController.RU) {
                rightOffsetY -= OFFSET_AMT;
            }

            if (inputController.RD) {
                rightOffsetY += OFFSET_AMT;
            }

            if (rightOffsetY === 0 && leftOffsetY === 0) {
                var noInputThreshold = game.currentTargetIndex ? Math.max(12000 - game.currentTargetIndex * 1200, 3000): 5000;
                if (this.timeSinceLastInput >= noInputThreshold) {
                    var difference = Math.abs(this.base.p1.y - this.base.p2.y);
                    if (difference <= OFFSET_AMT * 2 && difference !== 0) {
                        leftOffsetY = this.base.p1.y - (this.base.p2.y - this.base.p1.y);
                        rightOffsetY = this.base.p2.y - (this.base.p1.y - this.base.p2.y);
                    } else {
                        if (this.base.p1.y < this.base.p2.y) {
                            // left is higher than right
                            leftOffsetY = Math.min(difference, OFFSET_AMT);
                            rightOffsetY = -Math.min(difference, OFFSET_AMT);
                        } else if (this.base.p1.y > this.base.p2.y) {
                            // right is higher than left
                            rightOffsetY = Math.min(difference, OFFSET_AMT);
                            leftOffsetY = -Math.min(difference, OFFSET_AMT);
                        } else {
                            // they're even
                            rightOffsetY = leftOffsetY = -OFFSET_AMT;
                        }
                    }

                    sfx.play('jerk');
                    this.timeSinceLastInput = 0;
                } else {
                    return;
                }
            }

            this.receivingInput = true;

            var newP1 = this.base.p1.copy().add(new V2(0, leftOffsetY));
            var newP2 = this.base.p2.copy().add(new V2(0, rightOffsetY));

            // Don't allow bar to extend past height different max
            if (Math.abs(newP2.y - newP1.y) > this.maxHeightDifference) {
                return;
            }

            var points = window.GAME.modeBarLimitFn(newP1, newP2);

            this.changePosition(points[0], points[1]);
        },

        changePosition: function(p1, p2) {
            // TODO put in conditional to reduce overhead?
            this.base.updatePosition(
                p1,
                p2
            );

            // this.base2.updatePosition(
            //     p1.copy().add(new V2(0, this.baseOffset)),
            //     p2.copy().add(new V2(0, this.baseOffset))
            // );

            var angle = Math.atan2(this.base.p2.y - this.base.p1.y, this.base.p2.x - this.base.p1.x);
            // Rotate 90 degrees
            angle += Math.PI / 2;
            var edgeVec = new V2(Math.cos(angle), Math.sin(angle)).mult(-this.edgeHeight);

            this.leftBoundary.updatePosition(
                this.base.p1.copy(),
                this.base.p1.copy().add(edgeVec)
            );

            this.rightBoundary.updatePosition(
                this.base.p2.copy(),
                this.base.p2.copy().add(edgeVec)
            );
        },

        handleCollision: function (object1, object2) {
            if (object1 == this.leftBoundary || object1 == this.rightBoundary) {
                this.isBCWS = true;
                return;
            }

            if (object1 == this.base) {
                this.isBCWB = true;
            }

        },

        step: function(dt) {
            if (!this.receivingInput) {
                this.timeSinceLastInput += dt;
            } else {
                this.timeSinceLastInput = 0;
            }

            // initial hit, play a sound
            if (!this.wasBCWS && this.isBCWS) {
                sfx.play('hit');
                camera.shake = 25;
            }

            // initial hit, play a sound
            if (!this.wasBCWB && this.isBCWB) {
                sfx.play('hitSoft');
                camera.shake = 10;
            }

            this.wasBCWS = this.isBCWS;
            this.isBCWS = false;

            this.wasBCWB = this.isBCWB;
            this.isBCWB = false;

            this.receivingInput = false;
        },


        render: function(ctx) {
            ctx.save();
            ctx.strokeStyle = 'rgba(0,0,0,0.15)';
            ctx.beginPath();
            ctx.moveTo(this.base.p1.x + SHADOW_OFFSET, this.base.p1.y + SHADOW_OFFSET);
            ctx.lineTo(this.base.p2.x + SHADOW_OFFSET, this.base.p2.y + SHADOW_OFFSET);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(this.leftBoundary.p1.x + SHADOW_OFFSET, this.leftBoundary.p1.y + SHADOW_OFFSET);
            ctx.lineTo(this.leftBoundary.p2.x + SHADOW_OFFSET, this.leftBoundary.p2.y + SHADOW_OFFSET);
            ctx.stroke();
            
            ctx.beginPath();
            ctx.moveTo(this.rightBoundary.p1.x + SHADOW_OFFSET, this.rightBoundary.p1.y + SHADOW_OFFSET);
            ctx.lineTo(this.rightBoundary.p2.x + SHADOW_OFFSET, this.rightBoundary.p2.y + SHADOW_OFFSET);
            ctx.stroke();

            ctx.fillStyle = 'black';
            ctx.font = "normal 14px monospace";

            ctx.textAlign = 'left';

            if(!GAME.inputController.presses[0]) {
                ctx.fillText(String.fromCharCode(parseInt('25B2', 16)) + ' ' +KEYCODES[GAME.inputController.CONTROLS['leftUp']], this.leftBoundary.p2.x + 5, this.leftBoundary.p2.y);
            }
            if(!GAME.inputController.presses[1]) {
                ctx.fillText(String.fromCharCode(parseInt('25BC', 16)) + ' ' +KEYCODES[GAME.inputController.CONTROLS['leftDown']], this.leftBoundary.p1.x + 5, this.leftBoundary.p1.y - 5);
            }

            ctx.textAlign = 'right';
            
            if(!GAME.inputController.presses[2]) {
                ctx.fillText(KEYCODES[GAME.inputController.CONTROLS['rightUp']] + ' ' + String.fromCharCode(parseInt('25B2', 16)), this.rightBoundary.p2.x - 5, this.rightBoundary.p2.y);
            }
            if(!GAME.inputController.presses[3]) {
                ctx.fillText(KEYCODES[GAME.inputController.CONTROLS['rightDown']] + ' ' + String.fromCharCode(parseInt('25BC', 16)), this.rightBoundary.p1.x - 5, this.rightBoundary.p1.y - 5);
            }
            ctx.restore();
        },

        returnToStart: function() {
            var leftPoint = new V2(this.centerPoint.x - this.length/2, this.centerPoint.y);
            var rightPoint = new V2(this.centerPoint.x + this.length/2, this.centerPoint.y);
            this.changePosition(leftPoint, rightPoint);
        },

        getY: function() {
            return (this.base.p1.y + this.base.p2.y) / 2;
        }
    }

    return Bar;
}());