

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
        Game_SendPlayerFired();
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

    gameHub.client.playerFired = function (player, power, angle) {
        if (player == playerName) {
            Game_PlayerFired(power, angle);
        } else {
            Game_OtherPlayerFired(power, angle);
        }
    };

    gameHub.client.playerMove = function(player, power, angle) {
        if (player != playerName) {                    
            otherCannon.setAngle(angle);
        }
    };

    $.connection.hub.start().done(function () {
        gameHub.server.join(gameId, playerName);
    });

    setInterval(Game_PlayerUpdate, 100);

    $(window).on("colission", function () {
        gameHub.server.bulletLanded(gameId, playerName);
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
        var angle = parseInt(yourCannon.angle);                                                
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


function Game_PlayerFired(power, angle) {
    yourCannon.setAngle(angle);
    yourCannon.shoot(power);
}

function Game_OtherPlayerFired(power, angle) {
    otherCannon.setAngle(angle);
    otherCannon.shoot(power);
}


function Game_OtherPlayerFire() {
    playerElement.removeClass("fire");
    otherPlayerElement.addClass("fire");
}

function Game_SendPlayerFired() {
    playerMove = false;
    pow.enable(false);
    var angle = parseInt(yourCannon.angle);
    var power = pow.power();
    gameHub.server.playerFired(gameId, power, angle);
    yourCannon.setIsActive(false);     
}