function updateUIFromGameState(game){
    if(game != null && game["gameStarted"]){
        $("#startButton").html("Pause game");
    }else{
        $("#startButton").html("Start game");   
    }
}

$(document).ready(function(){  
    $('#playerId').html(playerId);
    $('#gameId').html(gameId);
    registerPlayer(gameId, playerId, function(player){
        $('#playerClass').html(player["playerClass"]);
        updateGameState(gameId, function (game){
            updateUIFromGameState(lastGameState);
        });
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