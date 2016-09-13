var Pulse = (function() {
    var Pulse = function(x, y, startSize, endSize, time, isGood) {
        this.x = x;
        this.y = y;
        this.lifeExpectancy = time;

        this.isGood = isGood;

        this.lifetime = 0;

        this.isAlive = true;

        this.startSize = startSize;
        this.endSize = endSize;

        this.radius = startSize;
    }

    Pulse.prototype = {
        step: function(dt) {
            this.lifetime += dt;

            if (this.lifetime > this.lifeExpectancy) {
                this.destroy();
                return;
            }

            this.radius = App.lerp(this.startSize, this.endSize, this.lifetime / this.lifeExpectancy);
        },

        render: function(ctx) {
                var opacity = (1 - this.lifetime / this.lifeExpectancy);
                var color = this.isGood ? 'rgba(46, 204, 113,' + opacity + ')' : 'red';

                var size = this.radius;

            // shadow
            // TODO extract 2PI
            ctx.beginPath();
            ctx.arc(this.x + SHADOW_OFFSET, this.y + SHADOW_OFFSET, size, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(0,0,0,' + opacity * 0.15 + ')';
            ctx.stroke();
            ctx.closePath();

            ctx.beginPath();
            ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.stroke();
            ctx.closePath();
        },

        destroy: function() {
            this.isAlive = false;
        }
    }

    return Pulse;
}());
