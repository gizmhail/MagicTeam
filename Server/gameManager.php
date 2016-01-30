<?php

$gameBaseDir = dirname(__FILE__);

include_once($gameBaseDir.'/class/game.class.php');

// Param parsing
$request = isset($_GET['request'])?$_GET['request']:"listGames";
$playerId = isset($_GET['playerId'])?$_GET['playerId']:false;
$gameId = isset($_GET['gameId'])?$_GET['gameId']:false;
$sequence = isset($_GET['sequence'])?explode(',',$_GET['sequence']):false;
$targetFoeTypeName = isset($_GET['targetFoeTypeName'])?$_GET['targetFoeTypeName']:false;

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
if($request == "startGame"){
	if($gameId){
		$game = new Game($gameId);
		$game->startGame();
		$data = $game;
	}else{
		$data = array("error"=>"Missing parameters (gameId needed)");
	}
}
if($request == "stopGame"){
	if($gameId){
		$game = new Game($gameId);
		$game->stopGame();
		$data = $game;
	}else{
		$data = array("error"=>"Missing parameters (gameId needed)");
	}
}
if($request == "castSpell"){
	if($gameId && $sequence){
		$game = new Game($gameId);
		// targetFoeTypeName can be null (we're tolerant guys ^^)
		$game->castSpell($playerId, $sequence,$targetFoeTypeName);
		$data = $game;
	}else{
		$data = array("error"=>"Missing parameters (gameId and sequence in a,b,c format needed)");
	}

}

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
         

