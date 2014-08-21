
var Vector = function (x, y) {
    this.x = x;
    this.y = y;
};
Vector.prototype.getLength = function () {
    return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
};

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
    self.degree = self.minDegree;
    self.setDegree = function (degree) {
        if (degree < self.minDegree) {
            degree = self.minDegree;
        } else if (degree > self.maxDegree) {
            degree = self.maxDegree;
        }
        var _degree = degree * direction;
        self.barrel.css("transform", "rotate(" + _degree + "deg)");
        self.barrel.css("transform-origin", self.rotateShift + "px 50%");

        self.degree = degree;
        if (typeof onDegreeChanged == "function") {
            onDegreeChanged(degree);
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
    self.setDegree(self.minDegree);
    self.calculateDegree = function (event) {
        var v1;
        if (self.toRight) {
            v1 = new Vector(event.pageX - self.x, self.y - event.pageY);
        } else {
            v1 = new Vector(self.x - event.pageX, self.y - event.pageY);
        }

        var degree = self.minDegree;
        if (v1.y > 0) {
            var v1Length = v1.getLength();
            var radians = Math.acos(v1.x / v1Length);
            degree = (radians * 180) / Math.PI;
        }
        self.setDegree(degree);
    }
    $("body").mousemove(function (event) {
        if (!active)
            return;

        self.calculateDegree(event);
    });
};
Canon.prototype.widthShift = 60;
Canon.prototype.minDegree = 10;
Canon.prototype.maxDegree = 85;



var Game = function () {

    return {
        Start: function () {
            
        }
    };
};

var playerElement = null;
var otherPlayerElement = null;
var game = Game();

var gameHub = $.connection.gameHub;
var powerElement = null;
var pow = null;        
var playerMove = false;
var yourCannon = null;  
var otherCannon = null;      

$(function () {

    powerElement = $("#progressbar");
    var left = $("#game").width() - 30;
    if (isPlayerLeft) {
        left = 10;
    }
    powerElement.css({left: left, top: 300});
    powerElement.show();   
    
    pow = PowerMeter("#progressbar");
    pow.callback(function(value) {
        Game_PlayerFired();
    });

    playerElement = $("#" + playerId);
    playerElement.text("YOU");
    playerElement.addClass("ingame");

    otherPlayerElement = $("#" + otherPlayerId);

    var cannonRight = new Canon("#cannon-right", false);
    var cannonLeft = new Canon("#cannon-left", true);    
    if(isPlayerLeft){
        yourCannon = cannonLeft;
        otherCannon = cannonRight;
    }
    else{
        yourCannon = cannonRight; 
        otherCannon = cannonLeft;     
    }

    if (isOtherPlayerPresent) {
        otherPlayerElement.text(otherPlayerName);
        otherPlayerElement.addClass("ingame");
    }

    gameHub.client.playerJoined = function(playerName) {
        if (!isOtherPlayerPresent) {
            isOtherPlayerPresent = true;
            otherPlayerName = playerName;
            otherPlayerElement.text(otherPlayerName);
            otherPlayerElement.addClass("ingame");
            Game_Start();
        }
    };

    gameHub.client.playerFire = function(player) {
        if (player == playerName) {
            Game_PlayerFire();
        } else {
            Game_OtherPlayerFire();
        }
    };

    gameHub.client.playerMove = function(player, power, angle) {
        if (player != playerName) {                    
            otherCannon.setDegree(angle);
        }
    };

    $.connection.hub.start().done(function () {
        gameHub.server.join(gameId, playerName);
    });

    setInterval(Game_PlayerUpdate, 100);


    Physics(function (world) {
        var viewWidth = window.innerWidth
        , viewHeight = window.innerHeight
        // bounds of the window
        , viewportBounds = Physics.aabb(0, 0, viewWidth, viewHeight)
        //, edgeBounce
        //, renderer
        ;

       // var viewWidth = 500;
        //var viewHeight = 300;

        var renderer = Physics.renderer('canvas', {
            el: 'viewport',
            width: viewWidth,
            height: viewHeight,
            meta: false, // don't display meta data
            styles: {
                // set colors for the circle bodies
                'circle': {
                    strokeStyle: '#351024',
                    lineWidth: 1,
                    fillStyle: '#d33682',
                    angleIndicator: '#351024'
                }
            }
        });

        // add the renderer
        world.add(renderer);
        // render on each step
        world.on('step', function () {
            world.render();
        });       

        // add a circle
        world.add(
            Physics.body('circle', {
                x: 300, // x-coordinate
                y: 630, // y-coordinate
                vx: 0.8, // velocity in x-direction
                vy: -0.3, // velocity in y-direction
                radius: 20
            })
        );

        // ensure objects bounce when edge collision is detected
        //world.add(Physics.behavior('body-impulse-response'));

        // add some gravity
        world.add(Physics.behavior('constant-acceleration'));

        // subscribe to ticker to advance the simulation
        Physics.util.ticker.on(function (time, dt) {

            world.step(time);
        });

        // start the ticker
        Physics.util.ticker.start();

    });
});

function Game_Start() {
    if (isFirstMove) {
        gameHub.server.start(gameId);
    }

    setInterval(Game_PlayerUpdate, 100);
}

function Game_PlayerUpdate() {
    if (playerMove) {
        console.log("player-move"); 
        var angle = parseInt(yourCannon.degree);                                                
        gameHub.server.playerMoved(gameId, playerName, pow.power(), angle);
    }
}

function Game_PlayerFire() {
    playerElement.addClass("fire");
    otherPlayerElement.removeClass("fire");
    pow.reset();
    pow.enable(true);
    playerMove = true;
    yourCannon.setIsActive(true);
}

function Game_OtherPlayerFire() {
    playerElement.removeClass("fire");
    otherPlayerElement.addClass("fire");
}

function Game_PlayerFired() {
    playerMove = false;
    pow.enable(false);
    var angle = 0;
    var power = pow.power();
    gameHub.server.playerFired(gameId, power, angle);
    yourCannon.setIsActive(false);
}