var Hole = (function() {
    var Hole = function(radius, x, y, config) {
        this.trigger = new Trigger(radius, x, y);
        this.isHole = true;

        config = config ? config : {t:false, i : null}
        this.isTarget = config.t || false;
        this.targetIndex = config.i || -1;
        
        this.isActiveTarget = false;

        this.pointValue = config.pointValue || 0;

        this.trigger.entity = this;

        this.isAlive = true;
    }

    Hole.prototype = {
        addToWorld: function addToWorld(world) {
            world.addTrigger(this.trigger);
        },

        handleCollision: function(object1, object2, distanceVec) {},

        step: function() {},

        render: function(ctx) {
            // shadow
            // TODO extract 2PI
            ctx.beginPath();
            ctx.arc(this.trigger.pos.x + SHADOW_OFFSET, this.trigger.pos.y + SHADOW_OFFSET, this.trigger.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fill();
            ctx.closePath();

            ctx.beginPath();
            ctx.strokeStyle = '#34495e';
            // TODO extract 2PI
            ctx.arc(this.trigger.pos.x, this.trigger.pos.y, this.trigger.radius, 0, Math.PI * 2);
            ctx.fillStyle = '#11181f';
            ctx.fill();
            ctx.closePath()
            // ctx.stroke();

            if (this.isTarget) {
                var startAngle = Math.PI;
                
                if (this.isActiveTarget) {
                    var t = Math.sin(Date.now() * 0.0045);
                    var t2 = Math.sin(Date.now() * 0.002);
                    startAngle = Math.PI * 2 * t;

                    var pulseSize = this.trigger.radius - ((Date.now() * 0.01) % this.trigger.radius);
                    ctx.beginPath();
                    ctx.strokeStyle = 'rgba(255,255,255,' + pulseSize / this.trigger.radius + ')';
                    ctx.arc(this.trigger.pos.x, this.trigger.pos.y, pulseSize, 0, Math.PI * 2);
                    ctx.stroke();
                    ctx.closePath()
                }

                var endAngle = startAngle + Math.PI;

                // Shadow arc
                ctx.strokeStyle = 'rgba(0,0,0,0.15)';
                ctx.beginPath();
                ctx.arc(this.trigger.pos.x + SHADOW_OFFSET, this.trigger.pos.y + SHADOW_OFFSET, this.trigger.radius + 4, startAngle, endAngle);
                ctx.stroke();

                // Arc
                ctx.strokeStyle = '#34495e';
                ctx.beginPath();
                ctx.arc(this.trigger.pos.x, this.trigger.pos.y, this.trigger.radius + 4, startAngle, endAngle);
                ctx.stroke();

                ctx.fillText(this.targetIndex, this.trigger.pos.x, this.trigger.pos.y - this.trigger.radius - 8);
            }
        },

        destroy: function() {
            this.isAlive = false;
            this.trigger.isAlive = false;
        }
    }

    return Hole;
}());