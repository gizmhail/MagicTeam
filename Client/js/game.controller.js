function updateUIFromGameState(game){
    if(game != null && game["gameStarted"]){
        $("#startButton").html("Stop game");
    }else{
        $("#startButton").html("Start game");   
    }
    $('#playersSide').html('');
    $('#foesSide').html('');
    for (var playerId in game.players) {
        var player = game.players[playerId];
        var playerDiv = $('<div/>', {
            class: 'player',
            style: 'border:1px solid grey;',
        });
        var classStyle = "";
        if(playerId == userIdentifier()){
            classStyle = "color: blue";
        }
        $('<div/>', {
            class: 'playerClass',
            style: classStyle,
            text: player.playerClass
        }).appendTo(playerDiv);
        $('<div/>', {
            class: 'playerLife',
            text: player.playerLife+"/100"
        }).appendTo(playerDiv);
        playerDiv.appendTo('#playersSide');
    };
    for (var i = 0; i < game.waveInfo.length; i++) {
        var foe = game.waveInfo[i];
        if(foe.active){
        console.log(foe);
            var foeDiv = $('<div/>', {
                class: 'foe',
                style: 'border:1px solid red;',
            });
            $('<div/>', {
                class: 'foeClass',
                style: classStyle,
                text: foe.foeType.foeName
            }).appendTo(foeDiv);
            $('<div/>', {
                class: 'foeLife',
                text: foe.foeLife+"/"+foe.foeType.foeMaxLife
            }).appendTo(foeDiv);
            var timeBeforeNextCast = Math.round(foe.timeBeforeNextCast*100)/100;
            $('<div/>', {
                class: 'foeAttack',
                text: "will attack "+foe.foeType.spellWeakness.playerClass+" in "+timeBeforeNextCast+" seconds"
            }).appendTo(foeDiv);
            foeDiv.appendTo('#foesSide');


        }
    };
}

function regularGameStateUpdate(){
    updateGameState(gameId, function(game){
        updateUIFromGameState(game);
    });
}

$(document).ready(function(){  
    $('#playerId').html(playerId);
    $('#gameId').html(gameId);
    registerPlayer(gameId, playerId, function(player){
        $('#playerClass').html(player["playerClass"]);
        window.setInterval(regularGameStateUpdate, 500);
    });
    $("#startButton").click(function(){
        var gameStarted = false;
        if(lastGameState != null){
            gameStarted = lastGameState["gameStarted"]
        }
        if(!gameStarted){
            startGame(gameId,function(game){
                updateUIFromGameState(lastGameState);
            });
        }else{
            stopGame(gameId,function(game){
                updateUIFromGameState(lastGameState);
            })

        }
    });

});