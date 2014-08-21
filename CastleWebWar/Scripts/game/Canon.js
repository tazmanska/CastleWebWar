var Canon = function (selector, toRight, onAngleChanged) {
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
    self.setAngle = function (angle) {
        if (angle < self.minAngle) {
            angle = self.minAngle;
        } else if (angle > self.maxAngle) {
            angle = self.maxAngle;
        }
        var _angle = angle * direction;
        self.barrel.css("transform", "rotate(" + _angle + "deg)");
        self.barrel.css("transform-origin", self.rotateShift + "px 50%");

        self.angle = angle;
        if (typeof onAngleChanged == "function") {
            onAngleChanged(angle);
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
    self.setAngle(self.minAngle);
    self.calculateAngle = function (event) {
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
        self.v1 = v1;
        self.setAngle(angle);
    }
    self.getAngleRadians = function () {
        return self.angle * Math.PI / 180;
    }
    self.shoot = function (power) {
        var vx, vy;

        var c = power / 50;

        var b = Math.cos(self.getAngleRadians()) * c;
        var a = Math.sin(self.getAngleRadians()) * c;

        if (self.toRight) {           
            vx = b;
            vy = a * -1;
        } else {            
            vx = b * -1;
            vy = a * -1;
        }

        

        var bullet = Physics.body('circle', {
            label: 'bullet',
            x: self.x, // x-coordinate
            y: self.y, // y-coordinate
            vx: vx,
            vy: vy,
            radius: 20
        });
        world.add(
            bullet
        );
        world.gravity.applyTo([bullet]);        
    }


    $("body").mousemove(function (event) {
        if (!active)
            return;

        self.calculateAngle(event);
    });
};
Canon.prototype.widthShift = 60;
Canon.prototype.minAngle = 10;
Canon.prototype.maxAngle = 85;
