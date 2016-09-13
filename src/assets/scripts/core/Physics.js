var Physics = (function(){
    var Physics = function() {
        this.reset();
    }

    Physics.prototype = {
        reset: function() {
            this.circles = [];
            this.lines = [];
            this.triggers = [];
        },

        update: function() {
            // solve constraints
            // for (var i = 0; i < this.constraintAccuracy; i++) {
            //     this.constraints.forEach(function(constraint) {
            //         constraint.resolve();
            //     });
            // }

            this.triggers = this.triggers.filter(function(obj){ return obj.isAlive; });

            this.triggers.forEach(function(trigger) {
                
                // detect collisions
                trigger.detectCircleCollisions(this.circles, function(circle) {
                    if (circle.entity) {
                        circle.entity.handleCollision(circle, trigger);
                    }
                });
            }.bind(this));

            // update circle positions

            this.circles = this.circles.filter(function(obj){ return obj.isAlive; });

            this.circles.forEach(function(circle) {

                circle.integrate();

                // detect collisions
                circle.detectCircleCollisions(this.circles, function() {});

                circle.detectLineCollisions(this.lines, function(line, nearestPointOnLine) {
                    if (line.entity) {
                        line.entity.handleCollision(line, circle);
                    }

                    if (circle.entity) {
                        circle.entity.handleCollision(circle, line);
                    }

                    var offset = circle.projectOut(nearestPointOnLine);

                    // Bounce, baby
                    circle.pos = circle.pos.copy().add(offset.copy().mult(circle.restitutionCoeff));

                    circle.rotate(offset);
                });
            }.bind(this));
        },

        render: function(ctx) {
            // this.constraints.forEach(function(constraint) {
            //     constraint.render(ctx);
            // });

            this.circles.forEach(function(circle) {
                circle.render(ctx);
            });

            this.lines.forEach(function(line) {
                line.render(ctx);
            });

            this.triggers.forEach(function(trigger) {
                trigger.render(ctx);
            });
        },

        addCircle: function(obj) {
            this.circles.push(obj);
        },

        addLine: function(obj) {
            this.lines.push(obj);
        },

        // addConstraint: function(obj) {
        //     this.constraints.push(obj);
        // },

        addTrigger: function(obj) {
            this.triggers.push(obj);
        }
    };

    return Physics;
}());

var Line = (function(){

    var Line = function(x1, y1, x2, y2) {
        this.type = 'LINE';
        this.entity = null;
        this.isAlive = true;

        this.point = new V2();
        this.pointVec = new V2();

        this.p1 = new V2(x1, y1);
        this.p2 = new V2(x2, y2);
        this.piece = new V2().copyVec(this.p2).sub(this.p1);
        this.norm = new V2().copyVec(this.piece).norm();
        this.sqrLength = this.piece.lengthSquared();
    }

    Line.prototype = {
        nearestPoint: function(pos) {
            this.pointVec.copyVec(pos).sub(this.p1);
            normalizedProjection = this.pointVec.dot(this.piece);
            if (normalizedProjection < 0) {
                return this.p1;
            } else if (normalizedProjection > this.sqrLength) {
                return this.p2;
            } else { // Projection is on line
                this.point.copyVec(this.piece)
                    .mult(normalizedProjection / this.sqrLength)
                    .add(this.p1);
                return this.point;
            }
        },

        updatePosition: function(p1, p2) {
            this.p1 = p1.copy();
            this.p2 = p2.copy();
            this.piece = new V2().copyVec(this.p2).sub(this.p1);
            this.norm = new V2().copyVec(this.piece).norm();
            this.sqrLength = this.piece.lengthSquared();
        },

        render: function(ctx) {
            ctx.beginPath();
            ctx.strokeStyle = '#333';
            ctx.moveTo(this.p1.x, this.p1.y);
            ctx.lineTo(this.p2.x, this.p2.y);
            ctx.stroke();
        }
    }

    return Line;
}());

var Circle = (function() {
    var Circle = function(radius, x, y, px, py) {
        this.type = 'CIRCLE';
        this.entity = null;
        this.isAlive = true;

        this.newPos = new V2();

        this.acc = GRAVITY_VECTOR.copy();
        
        this.rotation = 0;
        this.rotationSpeed = 0;
        this.pointToPos = new V2();

        this.radius = radius;
        this.radiusSquared = Math.pow(radius, 2);
        this.pos = new V2(x, y);
        this.prevPos = new V2(px || this.pos.x, py || this.pos.y);

        this.restitutionCoeff = 0.8;

        this.rotation = Math.floor(Math.random() * (-Math.PI - Math.PI + 1) + Math.PI);
    }

    Circle.prototype = {
        velocity: function() {
            return this.pos.copy().sub(this.prevPos);
        },

        // Calculate new position based on prev pos (Verlet integration)
        integrate: function() {
            this.newPos.copyVec(this.pos)
                .mult(2)
                .sub(this.prevPos)
                .add(this.acc);
            this.prevPos.copyVec(this.pos);
            this.pos.copyVec(this.newPos);
            this.rotation += this.rotationSpeed / this.radius;
            this.rotation = App.wrapAngle(this.rotation);

            this.acc = GRAVITY_VECTOR.copy();
        },

        rotate: function(offset, stiffness) {
            var deltaPos = this.prevPos.copy().sub(this.pos);
            var clockwise = new V2(offset.y, -offset.x).norm();
            var projection = clockwise.copy().mult(deltaPos.dot(clockwise));

            stiffness = stiffness || 0.2;
            var rotationDiff, projLength;

            if (clockwise.dot(projection) <= 0) {
                projLength = -projection.length();
            } else {
                projLength = projection.length();
            }

            rotationDiff = projLength - this.rotationSpeed;

            // this.pos.add(clockwise.mult(rotationDiff * stiffness));

            this.rotationSpeed += rotationDiff * stiffness;
        },

        detectCircleCollisions: function(circles, onCollisionCallback) {
            var distance;

            circles.forEach(function(circle) {
                if (circle === this) {
                    return;
                }

                debugger;
                var collides = DO_CIRCLES_COLLIDE(circle, this);

                if (!collides) {
                    return;
                }

                // dist between centers
                var distance = Math.sqrt(distanceSquared);

                // normal of collision
                var collisionNormal = distanceVec.copy().divide(distance);

                // penetration distance
                var collisionDistance = radius - distance;

                // inverse masses (0 == infinite mass = static)
                // TODO set masses instead of radius
                var imA = (circle.radius > 0) ? 1 / circle.radius : 0;
                var imB = (this.radius > 0) ? 1 / this.radius : 0;

                // separation vector
                var separationVec = collisionNormal.copy().mult(collisionDistance / (imA + imB));

                // separate circles
                circle.pos = circle.pos.copy().sub(separationVec.copy().mult(imA));
                this.pos = this.pos.copy().add(separationVec.copy().mult(imB));

                // combine velocity
                var collisionVelocity = this.velocity().sub(circle.velocity());

                // impact speed
                var vn = collisionVelocity.copy().dot(collisionNormal);

                // TODO TODO TODO
                // object moving away, dont reflect velocity
                // if (vn > 0) { // TODO vector sign calc?
                //     // collided
                //     return true;
                // }

                // coef of restitution in range [0, 1]
                var cor = 0.15;

                // collision impulse
                var j = -(1 + cor) * (vn) / (imA + imB);

                // impulse vec
                var impulse = collisionNormal.copy().mult(j);

                // change momentum 
                //
                //    a.vel -= impulse * imA;
                //    b.vel += impulse * imB;
                //
                circle.pos = circle.pos.copy().sub(impulse.copy().mult(imA));
                this.pos = this.pos.copy().add(impulse.copy().mult(imB));

                // Manage rotations/torque
                // http://scicomp.stackexchange.com/questions/11353/angular-velocity-by-vector-2d
            }.bind(this));
        },

        detectLineCollisions: function(lines, onCollisionCallback) {
            var pointToPos = new V2();
            var nearestPointOnLine;

            lines.forEach(function(line) {
                nearestPointOnLine = line.nearestPoint(this.pos);
                pointToPos.copyVec(this.pos).sub(nearestPointOnLine);

                if (pointToPos.lengthSquared() < this.radiusSquared) {
                    onCollisionCallback(line, pointToPos);
                }
            }.bind(this));
        },

        projectOut: function(pointToPos) {
            var offset = new V2();
            var depth = this.radius - pointToPos.length();

            offset.copyVec(pointToPos).norm().mult(depth);
            this.pos.add(offset);
            //this.rotate(offset);
            return offset;
        },

        render: function(ctx) {
            // ctx.beginPath();
            // ctx.moveTo(this.pos.x, this.pos.y);
            // // TODO extract 2PI
            // ctx.arc(this.pos.x, this.pos.y, this.radius, this.rotation, this.rotation + Math.PI * 2);
            // ctx.stroke();
        }
    }

    return Circle;
}());

var Trigger = (function(){
    var Trigger = function(radius, x, y, px, py) {
        this.type = 'TRIGGER';
        this.entity = null;
        this.isAlive = true;

        this.radius = radius;
        this.radiusSquared = Math.pow(radius, 2);
        this.pos = new V2(x, y);

        this.isTriggered = false;
    }

    Trigger.prototype = {
        detectCircleCollisions: function(circles, onCollisionCallback) {
            var distance;
            this.isTriggered = false;

            circles.forEach(function(circle) {

                // http://www.gamedev.net/topic/488102-circlecircle-collision-response/
                var distanceVec = circle.pos.copy().sub(this.pos);
                var distanceSquared = distanceVec.dot(distanceVec);

                var radius = circle.radius + this.radius;
                var radiusSquared = radius * radius;

                if (distanceSquared > radiusSquared) {
                    return;
                }

                onCollisionCallback(circle);

                this.isTriggered = true;
             
            }.bind(this));
        },

        render: function(ctx) {
            // ctx.beginPath();
            // ctx.strokeStyle = '#2ecc71';

            // // TODO extract 2PI
            // ctx.arc(this.pos.x, this.pos.y, this.radius, 0, Math.PI * 2);

            // if (this.isTriggered) {
            //     ctx.fillStyle = 'rgba(46, 204, 113, 0.25)';
            //     ctx.fill();
            // }

            // ctx.stroke();
        }
    }

    return Trigger;
}());
// var Constraint = Class.extend({
//     init: function(w1, w2, distance) {
//         this.distVec = new V2();

//         this.v1 = w1;
//         this.v2 = w2;
//         this.dist = distance;
//     },

//     resolve: function() {
//         this.distVec.copyVec(this.v2.pos).sub(this.v1.pos);
//         var curDist = this.distVec.length();

//         if (this.curDist != this.dist) {
//             var ratio = (1 - curDist / this.dist) / 2;
//             this.distVec.mult(ratio * 0.04);
//             this.v1.pos.sub(this.distVec);
//             this.v2.pos.add(this.distVec);
//         }
//     },

//     render: function(ctx) {
//         ctx.beginPath();
//         ctx.moveTo(this.v1.pos.x, this.v1.pos.y);
//         ctx.lineTo(this.v2.pos.x, this.v2.pos.y);
//         ctx.stroke();
//     }
// });