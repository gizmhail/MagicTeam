<?php

class Player{
	var $playerId;
	var $playerClass = false;
	function __construct($playerId){
		$this->playerId = $playerId;
	}
}

class Game{
	var $gameId = false;
	var $players = array();
	var $creationDate;
	var $lastSaveDate;
	var $currentLevel = 1;
	var $gameStarted = false;
	function __construct($gameId = false){
		if($gameId === false){
			$this->gameId = $this->generateGameId();
		}else{
			$this->gameId = $gameId;
		}
		// Will be replaced if the game existed before
		$this->creationDate = microtime(true);
		// Load game, if it existed before
		$this->loadGame();
	}

	function generateGameId(){
		$time = microtime(true);
		$id = md5($time);
		return $id;
	}

	function addPlayerId($playerId){
		$player = new Player($playerId);
		$existing = false;
		$remainingClass = $this->gameClasses();
		foreach ($this->players as $knownPlayer) {
			if($knownPlayer->playerId == $playerId){
				$existing = true;
				$player = $knownPlayer;
			}else{
				$takenClass = $knownPlayer->playerClass;
				if($takenClass && ($key = array_search($takenClass, $remainingClass)) !== false) {
					unset($remainingClass[$key]);
				}
			}
		}
		if(!$existing){
			if(count($remainingClass)>0){
				$randClassKey = array_rand($remainingClass);
				$player->playerClass = $remainingClass[$randClassKey];
				$this->players[$playerId] = $player;
				$this->save();
			}else{
				//No more space in game
				$player = null;
			}
		}else{

		}
		return $player;
	}
	/**
	 * JSON repr
	 */

	function asJson(){
		//TODO Improve encoding
		return json_encode($this);
	}

	/**
	 * Content serailization
	 */

	static function storageDir(){
		$gameBaseDir = dirname(dirname(__FILE__));
		$storageDir = $gameBaseDir.'/storage';		
		return $storageDir;
	}

	static function existingGames(){
		$gameIds = array();
		$games = glob(self::storageDir().'/game.*.txt');
		foreach ($games as $game) {
			$gameId = basename($game);
			$gameId = str_replace("game.", "", $gameId);
			$gameId = str_replace(".txt", "", $gameId);
			$gameIds[] = $gameId;
		}
		// TODO: load game. Remove one with very old last save date (game probably finished)
		return $gameIds;
	}

	function storageFile(){
		$storageDir = $this->storageDir();
		$storageFile = $storageDir.'/game.'.$this->gameId.'.txt';
		return $storageFile;
	}


	function save(){
		$this->lastSaveDate = microtime(true);
		$content = serialize($this);
		file_put_contents($this->storageFile(), $content);
	}

	function loadGame(){
		if(is_file($this->storageFile())){
			$storedGameContent = file_get_contents($this->storageFile());			
			$storedGame = unserialize($storedGameContent);
			// Bring back stored game info to this one
			$this->creationDate = $storedGame->creationDate;
			$this->players = $storedGame->players;
		}
	}

	/**
	 * Game rules
	 */
	function gameClasses(){
		return array("Mage blanc", "Mage noir", "Mage rouge");
	}
}