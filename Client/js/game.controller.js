
var gSequence = [];

function updateUIFromGameState(game){
    // Phaser update
    magicTeamGame.state.states[magicTeamGame.state.current].updateUIWithGameInfo(game);

    // Debug update
    if(game != null && game["gameStarted"]){
        $("#startButton").html("Stop game");
    }else{
        $("#startButton").html("Start game");   
    }
    var displayedId = currentGameId();
    if(displayedId.length>13){
        displayedId = displayedId.substring(0,10)+"...";
    }
    if(game.levelSucess){
        $('#gameStatus').html("Sucess for level "+game.currentLevel+" (game '"+displayedId+"')");
    }else if(game.levelFailure){
        $('#gameStatus').html("You were slain in level "+game.currentLevel+"(game '"+displayedId+"')");
    }else if(game.gameStarted){
        $('#gameStatus').html("Level "+game.currentLevel+" playing ! (game '"+displayedId+"')");
    }else{
        $('#gameStatus').html("Game '"+displayedId+"'' not started for level "+game.currentLevel);        
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
                html: foe.foeType.foeName+"<small>"+foe.foeLife+"/"+foe.foeType.foeMaxLife+"</small>"
            }).appendTo(foeDiv);
            var timeBeforeNextCast = Math.round(foe.timeBeforeNextCast*100)/100;
            $('<div/>', {
                class: 'foeAttack',
                html: "<small>will attack "+foe.foeType.spellWeakness.playerClass+" in "+timeBeforeNextCast+" seconds</small>"
            }).appendTo(foeDiv);
            foeDiv.appendTo('#foesSide');


        }
    };
        
    if(bestiary.length == 0 && game.gameStarted == false){
        var foeTypeDiv = $('<div/>', {
            class: 'bestiary',
            style: 'border:1px solid red;',
            text: "The game is not started, the bestiary will be filled with your friends spells once it is started"
        });
        foeTypeDiv.appendTo('#bestiary');   
    }
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
            text: 'Spell sequence: '+foeType.spellWeakness.arcaneSequence.join(',')
        }).appendTo(foeTypeDiv);
        foeTypeDiv.appendTo('#bestiary');

    }
    $('#keysContainer').html("");
    for (var i = 0; i < game.availableKeys.length; i++) {
        var key = game.availableKeys[i];
        $("#keysContainer").append("<div id='key-"+key+"' class='key'>"+key+"</div>");
    }
    updateKeysCallbacks();
}

function regularGameStateUpdate(){
    updateGameState(currentGameId(), function(game){
        updateUIFromGameState(game);
    });
}

function castPreparedSpell(){
    castSpell(gameId, playerId, gSequence, function(){});
    gSequence = [];
    $(".arcane").html("");
}

var lastTouchEnd = null;
var touchStart = false;
function pressKey(keyId){
    if ( $( "#key-"+keyId ).length ){
        if(gSequence.length < 3){
            gSequence.push(keyId);
        }
        $("#arcane"+gSequence.length).html(keyId);
        if(gSequence.length == 3){
            // Automatic cast (with a small delay to SEE third arcane symbol pressed)
            window.setTimeout(function(){castPreparedSpell()}, 500);
        }
    }
}


function touchKeyEventHandling(event){
    var touchOk = true;
    var now = Date.now();
    if(lastTouchEnd != null){
        var deltaTime = now - lastTouchEnd;
        if(deltaTime < 200){
            touchOk = false;
        }
    }
    lastTouchEnd = now;

    if(touchOk){
        var keyId = event.target.id;
        keyId = keyId.replace("key-","");
        pressKey(keyId);
        event.stopPropagation()             
    }
}

function updateKeysCallbacks(){
    $('.key').on('touchstart', function(event) {
        lastTouchEnd = null;
        touchStart = true;
    });

    $('.key').on('touchend', function(event) {
        touchKeyEventHandling(event);
    });

    $(".key").click(function(event){
        if(!touchStart){
            touchKeyEventHandling(event);
        }
    });        
}

function restartGame(){
    startGame(gameId, $("#level").val(), function(game){
        updateUIFromGameState(lastGameState);
        if(Object.keys(game.players).length < 2){
            var displayedId = currentGameId();
            if(displayedId.length>13){
                displayedId = displayedId.substring(0,10)+"...";
            }
            $('#gameStatus').html("<span style='fint-weight:bold;color:red'>Not enough players: bring friends to game '"+displayedId+"' !</span>");
        }
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
            restartGame();
        }else{
            stopGame(gameId,function(game){
                updateUIFromGameState(lastGameState);
            })

        }
    });

    $("#castButton").click(function(){
        castPreparedSpell();
    });
    $("#resetButton").click(function(){
        gSequence = [];
        $(".arcane").html("");
    });

    updateKeysCallbacks();

    $("body").keydown(function(e) {
        switch(e.which) {
            case 38: 
            case 40: 
                break;
            case 37: // left
                showBestiary();
                break;
            case 39: // right
                showSpellBook();
                break;
            case 32: 
                if(!$('#spellBookToogle').is(":visible")){
                    showSpellBook();
                }else{
                    showBestiary();
                }
                break;
            default: // Letter probably
                var keyId = String.fromCharCode(e.which).toLowerCase();
                // console.log(e, keyId);
                pressKey(keyId);
        }

    });

    function showBestiary(){
        $('#bestiary').show();
        $('#input').hide();
        $('#bestiaryToogle').css("background-color", "#FFE4B5");
        $('#spellBookToogle').css("background-color", "white");
    }

    function showSpellBook(){
        $('#input').show();
        $('#bestiary').hide();
        $('#bestiaryToogle').css("background-color", "white");
        $('#spellBookToogle').css("background-color", "#FFE4B5");        
    }
    $("#spellBookToogle").click(function(event){
        showSpellBook();
    });

    $("#bestiaryToogle").click(function(event){
        showBestiary();        
    });
    
    $("#level").change(function(event){
        restartGame();      
    });

    if(getUrlParameter("debug") == "1"){
        $("#debugInfo").show();
        $("#gameInfo").show();
    }
});