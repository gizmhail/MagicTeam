
var gSequence = [];

function updateUIFromGameState(game){
    if(game != null && game["gameStarted"]){
        $("#startButton").html("Stop game");
    }else{
        $("#startButton").html("Start game");   
    }
    bestiary = game.players[userIdentifier()].bestiary;
    $('#playersSide').html('');
    $('#foesSide').html('');
    $('#bestiary').html('');
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
        
    for (var i = 0; i < bestiary.length; i++) {
        var foeType = bestiary[i];
        var foeTypeDiv = $('<div/>', {
            class: 'bestiary',
            style: 'border:1px solid red;',
        });
        $('<div/>', {
            class: 'foeName',
            text: foeType.foeName
        }).appendTo(foeTypeDiv);
        $('<div/>', {
            class: 'playerKillingFoe',
            text: 'Weak to '+ foeType.spellWeakness.playerClass +"'s "+foeType.spellWeakness.spellName  
        }).appendTo(foeTypeDiv);
        $('<div/>', {
            class: 'sequence',
            text: 'Spell sequence:'+foeType.spellWeakness.arcaneSequence.join(',')
        }).appendTo(foeTypeDiv);
        foeTypeDiv.appendTo('#bestiary');

    }
}

function regularGameStateUpdate(){
    updateGameState(currentGameId(), function(game){
        updateUIFromGameState(game);
    });
}

$(document).ready(function(){  
    var gameId = currentGameId();
    var playerId = userIdentifier();
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

    $("#castButton").click(function(){
        castSpell(gameId, playerId, gSequence, function(){});
        gSequence = [];
        $(".arcane").html("");
    });
    $("#resetButton").click(function(){
        gSequence = [];
        $(".arcane").html("");
    });

    $(".key").click(function(event){
        var keyId = event.target.id;
        keyId = keyId.replace("key-","");
        if(gSequence.length < 3){
            gSequence.push(keyId);
        }
        $("#arcane"+gSequence.length).html(keyId);
    });
});