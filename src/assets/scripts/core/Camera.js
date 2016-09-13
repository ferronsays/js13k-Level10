var Camera = (function() {
    var Camera = function(g) {
        this.dist = 100;
        this.targetDistance = 600;

        this.lookat = new V2();
        this.c = g.ctx;
        this.fov = Math.PI / 4.0;
        this.vp = {
            l: 0,
            r: 0,
            t: 0,
            b: 0,
            w: 0,
            h: 0,
            scale: new V2(1, 1)
        };

        // this.bounds = g.bounds;

        this.lerp = true;
        this.lerpD = 0.04;

        this.shake = 0;
        this.stepVp(0);
    }

    Camera.prototype = {
        begin: function() {
            this.c.save();
            this.scale();
            this.translate();
        },
        end: function() {
            this.c.restore();
        },
        scale: function() {
            this.c.scale(this.vp.scale.x, this.vp.scale.y);
        },
        translate: function() {
            this.c.translate(-this.vp.l, -this.vp.t);
        },
        step: function(dt) {
            this.shake = Math.max(this.shake - dt, 0);
            this.zoomTo(this.dist + (this.targetDistance - this.dist) * 0.05);
        },
        stepVp: function(dt) {
            this.aspectRatio = this.c.canvas.width / this.c.canvas.height;
            this.vp.w = this.dist * Math.tan(this.fov);
            this.vp.h = this.vp.w / this.aspectRatio;
            this.vp.l = this.lookat.x - (this.vp.w / 2.0);
            this.vp.t = this.lookat.y - (this.vp.h / 2.0);

        // TODO magic numbers for space
        this.vp.scale.x = WIDTH / this.vp.w;
        this.vp.scale.y = HEIGHT / this.vp.h;

        // this.lockBounds();

        if (this.shake > 0) {
            this.vp.l += App.randPN() * 4;
            this.vp.t += App.randPN() * 4;
        }

        this.vp.r = this.vp.l + this.vp.w;
        this.vp.b = this.vp.t + this.vp.h;

        },
        zoomTo: function(z) {
            this.dist = z;
            this.stepVp();
        },
        moveTo: function(x, y) {
            if (this.lerp) {
                this.lookat.x -= (this.lookat.x - x) * this.lerpD;
                this.lookat.y -= (this.lookat.y - y) * this.lerpD;
            } else {
                this.lookat.x = x;
                this.lookat.y = y;
            }

            this.stepVp();
        },
        lockBounds: function() {
            this.vp.l = App.clamp(this.vp.l, this.bounds.l, this.bounds.r - this.vp.w);
            this.vp.t = App.clamp(this.vp.t, this.bounds.t, this.bounds.b - this.vp.h);
        },
        screenToWorld: function(x, y, obj) {
            obj = obj || {};
            obj.x = (x / this.vp.scale.x) + this.vp.l;
            obj.y = (y / this.vp.scale.y) + this.vp.t;
            return obj;
        },
        worldToScreen: function(x, y, obj) {
            obj = obj || {};
            obj.x = (x - this.vp.l) * (this.vp.scale.x);
            obj.y = (y - this.vp.t) * (this.vp.scale.y);
            return obj;
        }
    }

    return Camera;
}());