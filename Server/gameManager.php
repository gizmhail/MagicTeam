<?php

$gameBaseDir = dirname(__FILE__);

include_once($gameBaseDir.'/class/game.class.php');

// Param parsing
$request = isset($_GET['request'])?$_GET['request']:"listGames";
$playerId = isset($_GET['playerId'])?$_GET['playerId']:false;
$gameId = isset($_GET['gameId'])?$_GET['gameId']:false;

// Output placeholders
$data = array();
$jsonString = null;

// API verbs

if($request == "newGame"){
	$game = new Game();
	$game->save();
	$jsonString = $game->asJson();
}
if($request == "listGames"){
	$data = Game::existingGames();
}
if($request == "gameState"){
	if($gameId){
		$data = new Game($gameId);
	}else{
		$data = array("error"=>"Missing parameters (gameId needed)");
	}
}
if($request == "registerPlayer"){
	if($playerId && $gameId){
		$game = new Game($gameId);
		$player = $game->addPlayerId($playerId);
		$data = $player;
	}else{
		$data = array("error"=>"Missing parameters (playerId and gameId needed)");
	}
}
//if($request == "startGame"){}
//if($request == "castSpell"){}

// Output formating

header("Content-Type: application/json");
if($jsonString == null){
	$jsonString = json_encode($data);
}

if(isset($_GET['callback'])){
	// jsonp
	echo $_GET['callback'] . '(' . $jsonString . ')';
}else{
	echo $jsonString;
}
         

