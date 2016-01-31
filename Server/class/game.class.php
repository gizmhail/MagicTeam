<?php

include_once(dirname(__FILE__).'/foe.class.php');
include_once(dirname(__FILE__).'/player.class.php');

/*
define("MAGE_CLASS_1", "Mage blanc");
define("MAGE_CLASS_2", "Mage frost");
define("MAGE_CLASS_3", "Mage feu");
*/

define("MAX_GAME_LEVEL", 3);

define("MAGE_CLASS_1", "White mage");
define("MAGE_CLASS_2", "Frost mage");
define("MAGE_CLASS_3", "Fire mage");

define("ZOMBIE_TYPE", "Zombie");
define("VAMPIRE_TYPE", "Vampire");
define("FIREMASTER_TYPE", "Fire master");
define("SPARKLE_TYPE", "Sparkle");
define("ICELEMENTAL_TYPE", "Ice elemental");
define("COLDGIANT_TYPE", "Cold giant");

define("SERVER_SPEED", 1);


class Game{
	var $gameId = false;
	var $players = array();
	var $creationDate;
	var $lastSaveDate;
	var $currentLevel = 1;
	var $speed = SERVER_SPEED;
	var $levelInfo = array();
	var $gameStarted = false;
	var $playingClasses = array();
	var $waveInfo = array();
	//TODO Fix orth error (suCcess) everyone (client included)
	var $levelSucess = false;
	var $levelFailure = false;
	var $availableKeys = array();
	var $foeTypes = array();
	// Do not serialize debug
	var $debug = array();

	// Level and speed can only be set at creation/startGame
	function __construct($gameId = false){
		if($gameId === false){
			$this->gameId = $this->generateGameId();
			$this->loadLevel();
		}else{
			$this->gameId = $gameId;
		}
		// Will be replaced if the game existed before
		$this->creationDate = microtime(true);
		// Load saved game, if it existed before
		$this->loadSavedGame();
	}

	function startGame($level = 1, $speed = SERVER_SPEED){
		if(count($this->players)>1){
			$this->gameStarted = true;
			$this->changeLevel($level, $speed);
			$this->gameProgression();
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

	function changeLevel($level, $speed = SERVER_SPEED){
		if($speed < 0){
			$speed = 1;
		}
		if($level < 0 || $level > MAX_GAME_LEVEL){
			$level = 1;
		}
		$this->currentLevel = $level;
		$this->speed = $speed;
		$this->loadLevel();
	}

	function loadLevel(){
		$this->resetLevel();

		//TODO Load level accordingly to number
		if($this->currentLevel == 1){
			$this->loadLevel1();
		}
		if($this->currentLevel == 2){
			$this->loadLevel2();
		}
		if($this->currentLevel == 3){
			$this->loadLevel3();
		}
		if($this->currentLevel == 4){
			$this->loadLevel4();
		}
	}

	function resetLevel(){
		$this->levelSucess = false;
		$this->waveInfo = array();
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

	static function compareGameIds($aId, $bId){
		$a = self::loadSavedGameForGameId($aId);
		$b = self::loadSavedGameForGameId($bId);
	    $aEval = $a->lastSaveDate;
        $bEval = $b->lastSaveDate;
        if ($aEval == $bEval) {
            return 0;
        }
        return ($aEval < $bEval) ? +1 : -1;
    }

	static function existingGames(){
		$gameIds = array();
		$games = glob(self::storageDir().'/game.*.txt');
		foreach ($games as $game) {
			$gameId = basename($game);
			$gameId = str_replace("game.", "", $gameId);
			$gameId = str_replace(".txt", "", $gameId);
			$gameObj = self::loadSavedGameForGameId($gameId);
			$now = microtime(true);
			if( ($now - $gameObj->lastSaveDate) < 10*60 ){
				$gameIds[] = $gameId;
			}else{
				unlink($game);
			}
		}
		usort($gameIds, array("Game", "compareGameIds"));
		// TODO: load game. Remove one with very old last save date (game probably finished)
		return $gameIds;
	}

	static function storageFileForGameId($gameId){
		$storageDir = self::storageDir();
		$storageFile = $storageDir.'/game.'.$gameId.'.txt';
		return $storageFile;
	}

	function storageFile(){
		return $this->storageFileForGameId($this->gameId);
	}

	function save(){
		$this->lastSaveDate = microtime(true);
		$content = serialize($this);
		file_put_contents($this->storageFile(), $content);
	}

	static function loadSavedGameForGameId($gameId){
		if(is_file(self::storageFileForGameId($gameId))){
			$storedGameContent = file_get_contents(self::storageFileForGameId($gameId));			
			$storedGame = unserialize($storedGameContent);
		}
		return $storedGame;
	}

	function loadSavedGame(){
		if(is_file($this->storageFile())){
			$storedGameContent = file_get_contents($this->storageFile());			
			$storedGame = unserialize($storedGameContent);
			if($storedGameContent){
				// Bring back stored game info to this one
				$this->creationDate = $storedGame->creationDate;
				$this->players = $storedGame->players;
				$this->lastSaveDate = $storedGame->lastSaveDate;
				$this->currentLevel = $storedGame->currentLevel;
				$this->speed = $storedGame->speed;
				$this->gameStarted = $storedGame->gameStarted;
				$this->playingClasses = $storedGame->playingClasses;
				$this->waveInfo = $storedGame->waveInfo;
				$this->availableKeys = $storedGame->availableKeys;
				$this->foeTypes = $storedGame->foeTypes;
				$this->levelSucess = $storedGame->levelSucess;
				$this->levelFailure = $storedGame->levelFailure;

			}else{
				throw new Exception('Problem with '.$this->storageFile().' game state file');
			}
		}
	}

	/**
	 * Level preparation
	 */
	function addFoeToBestiary($foeType){
		$this->foeTypes[$foeType->foeName] = $foeType;
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
		$foeType = $foe->foeType;
		$requiredClass = $foeType->spellWeakness->playerClass;
		if(in_array($requiredClass, $this->playingClasses)){
			// The needed caster is in the game
			$this->waveInfo[] = $foe;
		}
	}

	function gameProgression(){
		$aliveFoes = array();
		$aliveFoesNotActiveForLivePLayers = array();
		$aliveFoesNotActive = array();
		$activeFoes = array();
		$change = false;
		foreach ($this->waveInfo as $foe) {
			if(!$this->gameStarted){
				if($foe->active) $change = true;
				$foe->active = false;
			}
			if($foe->foeLife > 0 && !$foe->hasFled){
				$aliveFoes[] = $foe;
				if(!$foe->active){
					$playerKillingFoe = $this->playerOfClass($foe->foeType->spellWeakness->playerClass);
					$aliveFoesNotActive[] = $foe;
					if($playerKillingFoe && $playerKillingFoe->playerLife > 0){
						$aliveFoesNotActiveForLivePLayers[] = $foe;
					}else{
						// The player that can kill this monster is not here anymore...we'll be nice, and skip this one :)
						// (otherwise the remaining players could only die, they would be doomed ! )
						$foe->hasFled = true;
						$foe->active = false;
					}
				}else{
					$activeFoes[] = $foe;
				}
			}else{
				$foe->active = false;
			}
		}

		if($this->gameStarted){
			$change = true;
			if(count($aliveFoes) == 0){
				// If the foe buffer is empty, WIN
				//TODO Check that one player at last is alive :)
				$this->levelSucess = true;
				$this->gameStarted = false;
			}else{
				// If active foe buffer (1 foe for 1 player) is not full, we fill it
				while (count($activeFoes) < count($this->players) && count($aliveFoesNotActiveForLivePLayers) != 0) {
					// We have a partially filled active foes buffer
					$firstInactive = array_shift($aliveFoesNotActiveForLivePLayers);
					$firstInactive->active = true;
					$firstInactive->serverNextCastTime = microtime(true) + $firstInactive->foeType->castTime;
					$firstInactive->timeBeforeNextCast = $firstInactive->foeType->castTime;
					$firstInactive->entranceDate = microtime(true);
					$activeFoes[] = $firstInactive;
				}

				// For each active foe, we update next cast time, and do damages if needed
				foreach ($activeFoes as $foe) {
					$delta = $foe->serverNextCastTime - microtime(true);
					if($delta < 0 ){
						// We cast the spell
						$damage = $foe->foeType->damage;
						//The target is the player who can hurt the foe (clever foe ;) ) 
						$target = null;
						foreach ($this->players as $player) {
							if($player->playerClass == $foe->targetPlayerClass() ){
								$target = $player;
							}
						}
						if($target){
							$currentLife = $target->playerLife;
							$currentLife = $currentLife - $damage;
							$target->playerLife = max($currentLife, 0);
							$foe->lastDamageDone = $damage;
							$foe->lastDamageTargetId = $target->playerId;
							// We prepare the next attack
							//var_dump("".$delta." ".microtime(true)." ".$foe->serverNextCastTime);
							$foe->serverNextCastTime = microtime(true) + $foe->foeType->castTime;
							$foe->timeBeforeNextCast = $foe->foeType->castTime;
							if($target->playerLife == 0){
								$foe->hasFled = true;
								$foe->active = false;
							}
						}else{
							$foe->hasFled = true;
							$foe->active = false;
							//TODO Handle this case: the player has been removed
						}
					}else{
						$foe->timeBeforeNextCast = $delta;
					}
				}
			}
		}
		$anyPlayerAlive = false;
		foreach ($this->players as $player) {
			if($player->playerLife > 0){
				$anyPlayerAlive = true;
			}else{
				foreach ($aliveFoesNotActive as $foe) {
					if($foe->foeType->spellWeakness->playerClass == $player->playerClass){
						// Not need to wait little foe: your victim is already dead, flee, flee towards your liberty !!
						if($foe->hasFled != true) $change = true;
						if($foe->active != false) $change = true;
						$foe->hasFled = true;
						$foe->active = false;
					}
				}
			}
		}
		if(!$anyPlayerAlive){
			if($this->levelFailure != true) $change = true;
			if($this->gameStarted != false) $change = true;
			$this->levelFailure = true;
			$this->gameStarted = false;
		}else{
			if($this->levelFailure != false) $change = true;
			$this->levelFailure = false;
			$anyFoeAlive = false;
			foreach ($this->waveInfo as $foe) {
				if($foe->foeLife > 0 && !$foe->hasFled){
					$anyFoeAlive = true;
				}
			}
			if(!$anyFoeAlive && count($this->waveInfo) != 0){
				if($this->levelSucess != true) $change = true;
				$this->levelSucess = true;
			}
		}
		if($change){
			$this->save();
		}
	}

	function castSpell($playerId, $sequence,$targetFoeTypeName=null){
		$sourcePlayer = isset($this->players[$playerId])?$this->players[$playerId]:null;
		// By default, all goes wrong...
		$backFire = true;
		if($sourcePlayer){
			foreach ($this->players as $player) {
				foreach ($player->bestiary as $foeType) {
					if($foeType->spellWeakness->playerClass == $sourcePlayer->playerClass && $sourcePlayer->playerLife > 0){
						// This spell can be cast by the player (who is still alive - no cheating ;p )
						if(!$targetFoeTypeName || $foeType->foeName == $targetFoeTypeName){
							// We're targeting the proper enemy kind (or not yet using targeting in the game ;) )
							if($sequence == $foeType->spellWeakness->arcaneSequence){
								// The spell has been properly done !
								$backFire = false;
								$targetedFoes = $this->activeFoesOfType($foeType);
								foreach ($this->activeFoesOfType($foeType) as $foe) {
									$previousLife = $foe->foeLife;
									$currentLife = $previousLife - $foeType->spellWeakness->spellDamage;
									$foe->foeLife = max(0, $currentLife);
									$this->debug[] = "Foe damage $previousLife -> $currentLife for ".$foeType->foeName;
									$this->gameProgression();
								}
							}else{
								$this->debug[] = "Bad sequence :'( (".implode(':', $sequence).",".implode(':', $foeType->spellWeakness->arcaneSequence).")";
							}
						}
					}
				}
			}
		}
		if($backFire){
			//TODO Add punishment :) (or do it client side ?)
			$this->debug[] = "Spell backfired ! ($playerId, ".implode(':',$sequence).",$targetFoeTypeName)";

		}
	}

	/**
	 * Model access helpers
	 */

	function playerOfClass($requiredClass){
		foreach ($this->players as $player) {
			if($player->playerClass == $requiredClass){
				return $player;
			}
		}
		return null;
	}
	function activeFoesOfType($foeType){
		$foes = array();
		foreach ($this->waveInfo as $foe) {
			if($foe->foeType == $foeType && $foe->active){
				$foes[] = $foe;
			}
		}
		return $foes;
	}

	function foeTypeByName($name){
		if(isset($this->foeTypes[$name])){
			return $this->foeTypes[$name];
		}
		return nil;
	}

	/**
	 * Game rules
	 */
	function gameClasses(){
		return array(MAGE_CLASS_1, MAGE_CLASS_2, MAGE_CLASS_3);
	}

	function randomSpellSequence($availableKeys, $size = 3){
		$sequence = array();
		while(count($sequence) < $size){
			$availableKeysIndex = rand(0, count($availableKeys)-1);
			$key = $availableKeys[$availableKeysIndex];
			$sequence[] = $key;
		}
		return $sequence;
	}

	function loadBaseLevelTemplate($availableKeys = array("m","a","o","i","c","e","j","k","z"), $speed = 1, $playerStrength = 1, $foesStrength = 1){
		$this->availableKeys = $availableKeys;

		// -- Spells	

		// Blanc
		$sacredLightSpell = new Spell("Lumière sacrée", $this->randomSpellSequence($availableKeys), MAGE_CLASS_1, 50*$playerStrength);
		$lightStrikeSpell = new Spell("Frappe divine", $this->randomSpellSequence($availableKeys), MAGE_CLASS_1, 50*$playerStrength);
		// Glace
		$frostBoltSpell = new Spell("Eclair de givre", $this->randomSpellSequence($availableKeys), MAGE_CLASS_2, 50*$playerStrength);
		$iceLanceSpell = new Spell("Javelot de glace", $this->randomSpellSequence($availableKeys), MAGE_CLASS_2, 50*$playerStrength);
		// Fire
		$fireballSpell = new Spell("Fireball", $this->randomSpellSequence($availableKeys), MAGE_CLASS_3, 50*$playerStrength);
		$fireTornadoSpell = new Spell("Tornade de flammes", $this->randomSpellSequence($availableKeys), MAGE_CLASS_3, 50*$playerStrength);

		// Blanc
		$zombieFoeType = new FoeType(ZOMBIE_TYPE, $lightStrikeSpell, 100, 9/$speed, 20*$foesStrength);
		$vampireFoeType = new FoeType(VAMPIRE_TYPE, $sacredLightSpell, 100, 7/$speed, 20*$foesStrength);
		// Glace
		$fireElemFoeType = new FoeType(FIREMASTER_TYPE, $frostBoltSpell, 100, 10/$speed, 20*$foesStrength);
		$sparkFoeType = new FoeType(SPARKLE_TYPE, $iceLanceSpell, 50, 6/$speed, 20*$foesStrength);
		// Fire
		$iceElemFoeType = new FoeType(ICELEMENTAL_TYPE, $fireballSpell, 100, 11/$speed, 20*$foesStrength);
		$iceGiantFoeType = new FoeType(COLDGIANT_TYPE, $fireTornadoSpell, 100, 9/$speed, 20*$foesStrength);

		// -- Foe types	
		$this->addFoeToBestiary($zombieFoeType);
		$this->addFoeToBestiary($vampireFoeType);
		$this->addFoeToBestiary($fireElemFoeType);
		$this->addFoeToBestiary($sparkFoeType);
		$this->addFoeToBestiary($iceElemFoeType);
		$this->addFoeToBestiary($iceGiantFoeType);
	}

	function loadLevel1(){	
		$speed = $this->speed;
		$playerStrength = 2;
		$foesStrength = 1;
		$availableKeys = array("m","a","o","i","c","e","j","k","z");
		$this->loadBaseLevelTemplate($availableKeys, $speed, $playerStrength, $foesStrength);

		// -- Foe waves
		$waveCount = 1;
		while($waveCount>0){
			$this->addFoeInstanceToWave(new Foe($this->foeTypeByName(ZOMBIE_TYPE)));
			$this->addFoeInstanceToWave(new Foe($this->foeTypeByName(FIREMASTER_TYPE)));
			$this->addFoeInstanceToWave(new Foe($this->foeTypeByName(ICELEMENTAL_TYPE)));
			$waveCount--;
		}
	}

	function loadLevel2(){	
		$speed = $this->speed;
		$playerStrength = 1;
		$foesStrength = 2;
		$availableKeys = array("m","a","o","i","c","e","j","k","z");
		$this->loadBaseLevelTemplate($availableKeys, $speed, $playerStrength, $foesStrength);

		// -- Foe waves
		$waveCount = 1;
		while($waveCount>0){
			$this->addFoeInstanceToWave(new Foe($this->foeTypeByName(ZOMBIE_TYPE)));
			$this->addFoeInstanceToWave(new Foe($this->foeTypeByName(FIREMASTER_TYPE)));
			$this->addFoeInstanceToWave(new Foe($this->foeTypeByName(ICELEMENTAL_TYPE)));
			$this->addFoeInstanceToWave(new Foe($this->foeTypeByName(VAMPIRE_TYPE)));
			$this->addFoeInstanceToWave(new Foe($this->foeTypeByName(SPARKLE_TYPE)));
			$this->addFoeInstanceToWave(new Foe($this->foeTypeByName(COLDGIANT_TYPE)));
			$waveCount--;
		}
	}

	function loadLevel3(){	
		$speed = $this->speed;
		$playerStrength = 1;
		$foesStrength = 1;
		$availableKeys = array("m","a","o","i","c","e","j","k","z");
		$this->loadBaseLevelTemplate($availableKeys, $speed, $playerStrength, $foesStrength);

		// -- Foe waves
		$waveCount = 2;
		while($waveCount>0){
			$this->addFoeInstanceToWave(new Foe($this->foeTypeByName(ZOMBIE_TYPE)));
			$this->addFoeInstanceToWave(new Foe($this->foeTypeByName(FIREMASTER_TYPE)));
			$this->addFoeInstanceToWave(new Foe($this->foeTypeByName(ICELEMENTAL_TYPE)));
			$this->addFoeInstanceToWave(new Foe($this->foeTypeByName(VAMPIRE_TYPE)));
			$this->addFoeInstanceToWave(new Foe($this->foeTypeByName(SPARKLE_TYPE)));
			$this->addFoeInstanceToWave(new Foe($this->foeTypeByName(COLDGIANT_TYPE)));
			$waveCount--;
		}
	}

	function loadLevel4(){	
		$speed = $this->speed*1.3;
		$playerStrength = 1;
		$foesStrength = 2;
		$availableKeys = array("m","a","o","i","c","e","j","k","z");
		$this->loadBaseLevelTemplate($availableKeys, $speed, $playerStrength, $foesStrength);

		// -- Foe waves
		$waveCount = 2;
		while($waveCount>0){
			$this->addFoeInstanceToWave(new Foe($this->foeTypeByName(ZOMBIE_TYPE)));
			$this->addFoeInstanceToWave(new Foe($this->foeTypeByName(FIREMASTER_TYPE)));
			$this->addFoeInstanceToWave(new Foe($this->foeTypeByName(ICELEMENTAL_TYPE)));
			$this->addFoeInstanceToWave(new Foe($this->foeTypeByName(VAMPIRE_TYPE)));
			$this->addFoeInstanceToWave(new Foe($this->foeTypeByName(SPARKLE_TYPE)));
			$this->addFoeInstanceToWave(new Foe($this->foeTypeByName(COLDGIANT_TYPE)));
			$waveCount--;
		}
	}
}