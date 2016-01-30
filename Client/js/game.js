
var serverHostname = location.protocol+'//'+location.hostname+(location.port ? ':'+location.port: '');

var serverBaseUrl = serverHostname + "/Phaser/GameJam/MagicTeam/Server";
//TODO Rename gameId and playerId to differiante "global", or use methods (better)
var gameId = currentGameId();
var playerId = userIdentifier();
var lastGameState = null;

function currentGameId(){
	return getUrlParameter("gameId");
}

function userIdentifier(){
	var clientId = localStorage.getItem('clientId');
	if(clientId == null){
		clientId =  (new Date()).getTime();
		localStorage.setItem('clientId', clientId);
	}
	return clientId;
}

function createGame(callback){
	$.ajax({
        url: serverBaseUrl+'/gameManager.php?request=newGame',
        dataType: 'jsonp',
        success: function(data){
        	console.log("createGame", data);
            callback(data);
        }
    });
}

function registerPlayer(gameId, playerId, callback){
	$.ajax({
        url: serverBaseUrl+'/gameManager.php?request=registerPlayer&gameId='+gameId+'&playerId='+playerId,
        dataType: 'jsonp',
        success: function(data){
        	console.log("registerPlayer", data);
            callback(data);
        }
    });
}


function updateGameState(gameId, callback){
	$.ajax({
        url: serverBaseUrl+'/gameManager.php?request=gameState&gameId='+gameId,
        dataType: 'jsonp',
        success: function(data){
        	//console.log("updateGameState", data);
        	lastGameState = data;
            callback(data);
        }
    });
}

function startGame(gameId, callback){
	$.ajax({
        url: serverBaseUrl+'/gameManager.php?request=startGame&gameId='+gameId,
        dataType: 'jsonp',
        success: function(data){
        	console.log("startGame", data);
        	lastGameState = data;
            callback(data);
        }
    });
}

function stopGame(gameId, callback){
	$.ajax({
        url: serverBaseUrl+'/gameManager.php?request=stopGame&gameId='+gameId,
        dataType: 'jsonp',
        success: function(data){
        	console.log("stopGame", data);
        	lastGameState = data;
            callback(data);
        }
    });
}

function castSpell(gameId, playerId, sequence, callback){
	$.ajax({
        url: serverBaseUrl+'/gameManager.php?request=castSpell&gameId='+gameId+'&playerId='+playerId+'&sequence='+sequence.join(','),
        dataType: 'jsonp',
        success: function(data){
        	console.log("castSpell", data);
        	lastGameState = data;
            callback(data);
        }
    });
}
