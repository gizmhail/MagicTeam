<?php

define("MAGE_CLASS_1", "Mage blanc");
define("MAGE_CLASS_2", "Mage frost");
define("MAGE_CLASS_3", "Mage feu");

class Player{
	var $playerId;
	var $playerClass = false;
	var $playerLife = 100;
	var $bestiary = array();
	var $keys = array();

	function __construct($playerId){
		$this->playerId = $playerId;
	}
}

class Spell{
	var $spellName;
	var $playerClass;
	var $arcaneSequence = array();
	var $spellDamage = 50;

	function __construct($name, $sequence, $playerClass, $damage = 50){
		$this->spellName = $name;
		$this->arcaneSequence = $sequence;
		$this->spellDamage = $damage;
		$this->playerClass = $playerClass;
	}
}

class FoeType{
	var $foeName;
	var $foeMaxLife = 100;
	var $spellWeakness;

	function __construct($name, $weakness, $life = 100){
		$this->foeName = $name;
		$this->foeMaxLife = $life;
		$this->spellWeakness = $weakness;
	}
}

class Foe{
	var $foeType;
	var $foeLife;
	function __construct($foeType){
		$this->foeType = $foeType;
		$this->foeLife = $foeType->foeMaxLife;
	}
}

class Game{
	var $gameId = false;
	var $players = array();
	var $creationDate;
	var $lastSaveDate;
	var $currentLevel = 1;
	var $levelInfo = array();
	var $gameStarted = false;
	var $playingClasses = array();

	function __construct($gameId = false){
		if($gameId === false){
			$this->gameId = $this->generateGameId();
			$this->loadLevel($this->currentLevel);
		}else{
			$this->gameId = $gameId;
		}
		// Will be replaced if the game existed before
		$this->creationDate = microtime(true);
		// Load saved game, if it existed before
		$this->loadSavedGame();
	}

	function startGame(){
		if(count($this->players)>1){
			$this->gameStarted = true;
			$this->loadLevel();
			$this->save();
		}
	}
	
	function stopGame(){
		$this->gameStarted = false;
		$this->save();
	}
	
	function generateGameId(){
		$time = microtime(true);
		$id = md5($time);
		return $id;
	}

	function changeLevel($level){
		$this->currentLevel = $level;
		$this->loadLevel();
	}

	function loadLevel(){
		$this->resetLevel();

		//TODO Load level accordingly to number
		if($this->currentLevel == 1){
			$this->loadLevel1();
		}

		//TODO Fill key with placeholder symbols
	}

	function resetLevel(){
		$this->levelInfo = array("wave"=>array(), "activeFoes"=>array());
		foreach ($this->players as $player) {
			$player->playerLife = 100;
			$player->bestiary = array();
			$player->keys = array();
		}
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
				$this->playingClasses[] = $player->playerClass;
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

	function loadSavedGame(){
		if(is_file($this->storageFile())){
			$storedGameContent = file_get_contents($this->storageFile());			
			$storedGame = unserialize($storedGameContent);
			// Bring back stored game info to this one
			$this->creationDate = $storedGame->creationDate;
			$this->players = $storedGame->players;
			$this->lastSaveDate = $storedGame->lastSaveDate;
			$this->currentLevel = $storedGame->currentLevel;
			$this->gameStarted = $storedGame->gameStarted;
			$this->playingClasses = $storedGame->playingClasses;
			$this->levelInfo = $storedGame->levelInfo;
		}
	}

	/**
	 * Level preparation
	 */
	function addFoeToBestiary($foeType){
		$requiredClass = $foeType->spellWeakness->playerClass;
		if(in_array($requiredClass, $this->playingClasses)){
			// The needed caster is in the game
			//$this->levelInfo["foeTypes"][] = $foeType;
			//$this->levelInfo["spells"][] = $foeType->spellWeakness;
			$minBestiarySize = 100;
			$minBestiaryPlayer = null;
			foreach ($this->players as $player) {
				if($player->playerClass != $requiredClass){
					if($minBestiaryPlayer == null || count($player->bestiary) <= $minBestiarySize ){
						$minBestiarySize = count($player->bestiary);
						$minBestiaryPlayer = $player;
					}
				}
			}
			$minBestiaryPlayer->bestiary[] = $foeType;
			$spellKeys = $foeType->spellWeakness->arcaneSequence;
			foreach ($spellKeys as $spellKey) {
				if(!in_array($spellKey, $minBestiaryPlayer->keys)){
					$minBestiaryPlayer->keys[] = $spellKey;
				}
			}
		}
	}

	function addFoeInstanceToWave($foe){
		$requiredClass = $foe->foeType->spellWeakness->playerClass;
		if(in_array($requiredClass, $this->playingClasses)){
			// The needed caster is in the game
			$this->levelInfo["wave"][] = $foe;
		}
	}
	/**
	 * Game rules
	 */
	function gameClasses(){
		return array(MAGE_CLASS_1, MAGE_CLASS_2, MAGE_CLASS_3);
	}

	function loadLevel1(){	
		// -- Spells	

		// Blanc
		$sacredLightSpell = new Spell("Lumière sacrée", array("m","a","o"), MAGE_CLASS_1, 50);
		$lightStrikeSpell = new Spell("Frappe divine", array("o","o","o"), MAGE_CLASS_1, 50);
		// Glace
		$frostBoltSpell = new Spell("Eclair de givre", array("i","c","e"), MAGE_CLASS_2, 50);
		$iceLanceSpell = new Spell("Javelot de glace", array("j","k","z"), MAGE_CLASS_2, 50);
		// Fire
		$fireballSpell = new Spell("Fireball", array("a","z","e"), MAGE_CLASS_3, 50);
		$fireTornadoSpell = new Spell("Tornade de flammes", array("i","j","k"), MAGE_CLASS_3, 50);

		// Blanc
		$zombieFoeType = new FoeType("Zombie", $lightStrikeSpell, 100);
		$vampireFoeType = new FoeType("Vampire", $sacredLightSpell, 100);
		// Glace
		$fireElemFoeType = new FoeType("Elémentaire de feu", $frostBoltSpell, 100);
		$sparkFoeType = new FoeType("Etincelle", $iceLanceSpell, 50);
		// Fire
		$iceElemFoeType = new FoeType("Elémentaire de glace", $fireballSpell, 100);
		$iceGiantFoeType = new FoeType("Géant du froid", $fireTornadoSpell, 100);

		// -- Foe types	
		$this->addFoeToBestiary($zombieFoeType);
		$this->addFoeToBestiary($vampireFoeType);
		$this->addFoeToBestiary($fireElemFoeType);
		$this->addFoeToBestiary($sparkFoeType);
		$this->addFoeToBestiary($iceElemFoeType);
		$this->addFoeToBestiary($iceGiantFoeType);

		// -- Foe waves
		$this->addFoeInstanceToWave(new Foe($zombieFoeType));
		$this->addFoeInstanceToWave(new Foe($fireElemFoeType));
		$this->addFoeInstanceToWave(new Foe($iceElemFoeType));
		$this->addFoeInstanceToWave(new Foe($vampireFoeType));
		$this->addFoeInstanceToWave(new Foe($sparkFoeType));
		$this->addFoeInstanceToWave(new Foe($iceGiantFoeType));
	}
}