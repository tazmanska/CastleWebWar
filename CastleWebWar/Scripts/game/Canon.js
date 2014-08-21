var Canon = function (selector, toRight, onDegreeChanged) {
    var active = false;
    var direction = 1;
    var self = this;

    self.barrel = $(selector + " .barrel");
    self.toRight = toRight;
    if (self.toRight) {
        direction = -1;
    }
    self.setIsActive = function (val) {
        active = val;
    }
    self.getIsActive = function () {
        return active;
    }
    self.angle = self.minAngle;
    self.setDegree = function (angle) {
        if (angle < self.minAngle) {
            angle = self.minAngle;
        } else if (angle > self.maxAngle) {
            angle = self.maxAngle;
        }
        var _angle = angle * direction;
        self.barrel.css("transform", "rotate(" + _angle + "deg)");
        self.barrel.css("transform-origin", self.rotateShift + "px 50%");

        self.angle = angle;
        if (typeof onDegreeChanged == "function") {
            onDegreeChanged(angle);
        }
    };
    self.calculateRotationCenter = function () {
        var $barrel = self.barrel;
        self.y = $barrel.offset().top + ($barrel.height() / 2);
        var barrelCenterX = $barrel.offset().left + ($barrel.width() / 2);
        var barrelWidthShift = (self.widthShift * direction);
        self.x = barrelCenterX + barrelWidthShift;
        self.rotateShift = self.x - $barrel.offset().left;
    };
    self.calculateRotationCenter();
    self.setDegree(self.minAngle);
    self.calculateDegree = function (event) {
        var v1;
        if (self.toRight) {
            v1 = new Vector(event.pageX - self.x, self.y - event.pageY);
        } else {
            v1 = new Vector(self.x - event.pageX, self.y - event.pageY);
        }

        var angle = self.minAngle;
        if (v1.y > 0) {
            var v1Length = v1.getLength();
            var radians = Math.acos(v1.x / v1Length);
            angle = (radians * 180) / Math.PI;
        }
        self.setDegree(angle);
    }
    self.shoot = function (power) {
        world.add(
           Physics.body('circle', {
               x: self.x, // x-coordinate
               y: self.y, // y-coordinate
               vx:self.toRight ? 0.8 : -0.8, // velocity in x-direction
               vy: -0.3, // velocity in y-direction
               radius: 20
           })
       );
    }


    $("body").mousemove(function (event) {
        if (!active)
            return;

        self.calculateDegree(event);
    });
};
Canon.prototype.widthShift = 60;
Canon.prototype.minAngle = 10;
Canon.prototype.maxAngle = 85;
