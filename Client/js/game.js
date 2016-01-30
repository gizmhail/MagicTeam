
var serverBaseUrl = "http://localhost:8888/Phaser/GameJam/MagicTeam/Server";
var gameId = getUrlParameter("gameId");
var playerId = userIdentifier();
var lastGameState = null;

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
        	console.log("updateGameState", data);
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
