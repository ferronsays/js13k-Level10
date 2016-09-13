var Ball = (function() {

    var Ball = function(radius, x, y) {
        this.circle = new Circle(radius, x, y);
        this.circle.restitutionCoeff = 0;

        this.gravityVec = new V2(0, 0.75);
        this.circle.acc = this.gravityVec.copy();

        this.circle.entity = this;

        this.isOnLine = false;

        this.isAlive = true;
    }

    Ball.prototype = {
        addToWorld: function addToWorld(world) {
                world.addCircle(this.circle);
            },

        //http://answers.unity3d.com/questions/369386/what-is-the-best-way-to-prevent-a-physics-object-f.html

        handleCollision: function(object1, object2, distanceVec) {
            if (object1 !== this.circle) {
                return;
            }

            if (object2.type === 'TRIGGER') {
                var distanceVec = this.circle.pos.copy().sub(object2.pos);
                var distance = Math.sqrt(distanceVec.dot(distanceVec));

                // Check if totally inside
                if (distance <= Math.abs(this.circle.radius - object2.radius)) {
                    this.onSunk(object2);
                // Check if > X into trigger
                } else if (
                    (this.circle.pos.y - this.circle.radius) <= object2.pos.y && 
                    (this.circle.pos.y) >= object2.pos.y - object2.radius &&
                    distance - this.circle.radius <= object2.radius - this.circle.radius * .75
                ) {
                    var dirVec = object2.pos.copy().sub(this.circle.pos).norm();
                    dirVec.x *= .35;
                    dirVec.y *= Math.max(.12 * distance, 1.1); //.75
                    this.circle.acc.add(dirVec);
                } else {
                    // Rest acc vector
                    this.circle.acc = this.gravityVec.copy();
                }
            }

            if (object2.type === 'LINE') {
                this.isOnLine = true;
            }
        },

        onSunk: function(obj) {
            // Should have an entity
            var hole = obj.entity;
            document.dispatchEvent(new CustomEvent('ballSunk', {
                'detail': {
                    ball: this,
                    hole: hole
                }
            }));
        },

        step: function() {

            // if (this.isOnLine && this.circle.pos.x !== this.circle.prevPos.x) {
            if (this.isOnLine) {
                var rSpeed = Math.abs(this.circle.rotationSpeed);

                if (rSpeed > 1.5) {
                    sfx.play('rollFast');
                } else if (rSpeed > 0.6 && rSpeed < 1.5) {
                    sfx.play('rollMedium');
                } else if (rSpeed > 0.1 && rSpeed < 0.6) {
                    sfx.play('rollSlow');
                }
            }

            this.isOnLine = false;

            this.circle.acc = this.gravityVec.copy();
        },

        render: function(ctx) {
            // shadow
            // TODO extract 2PI
            ctx.beginPath();
            ctx.arc(this.circle.pos.x + SHADOW_OFFSET, this.circle.pos.y + SHADOW_OFFSET, this.circle.radius, this.circle.rotation, this.circle.rotation + Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fill();
            ctx.closePath();

            ctx.save();
            ctx.translate(this.circle.pos.x, this.circle.pos.y);
            ctx.beginPath();
            // ctx.moveTo(this.circle.pos.x, this.circle.pos.y);
            // TODO extract 2PI
            ctx.arc(0, 0, this.circle.radius, 0, Math.PI * 2);
            // ctx.strokeStyle = '#7f8c8d';
            ctx.fillStyle = '#2f2f2f';
            ctx.fill();
            ctx.closePath();

            ctx.fillStyle = '#fff';
            ctx.rotate(this.circle.rotation);

            ctx.beginPath();
            ctx.arc(6, 0, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.arc(-6, 0, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.arc(0, 6, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.arc(0, -6, 2, 0, Math.PI * 2);
            ctx.fill();
            ctx.closePath();

            // ctx.stroke();
            ctx.restore();

        },

        destroy: function() {
            this.isAlive = false;
            this.circle.isAlive = false;
        }
    }

    return Ball;
}());
