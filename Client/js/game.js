
var serverBaseUrl = "http://localhost:8888/Phaser/GameJam/MagicTeam/Server";
var gameId = getUrlParameter("gameId");
var playerId = userIdentifier();

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
        	console.log(data);
            callback(data);
        }
    });
}

function registerPlayer(gameId, playerId, callback){
	$.ajax({
        url: serverBaseUrl+'/gameManager.php?request=registerPlayer&gameId='+gameId+'&playerId='+playerId,
        dataType: 'jsonp',
        success: function(data){
        	console.log(data);
            callback(data);
        }
    });
}
