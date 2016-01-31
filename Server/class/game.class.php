<?php

include_once(dirname(__FILE__).'/foe.class.php');
include_once(dirname(__FILE__).'/player.class.php');

/*
define("MAGE_CLASS_1", "Mage blanc");
define("MAGE_CLASS_2", "Mage frost");
define("MAGE_CLASS_3", "Mage feu");
*/
define("MAGE_CLASS_1", "White mage");
define("MAGE_CLASS_2", "Frost mage");
define("MAGE_CLASS_3", "Fire mage");

define("SERVER_SPEED", 1);


class Game{
	var $gameId = false;
	var $players = array();
	var $creationDate;
	var $lastSaveDate;
	var $currentLevel = 1;
	var $levelInfo = array();
	var $gameStarted = false;
	var $playingClasses = array();
	var $waveInfo = array();
	var $levelSucess = false;
	var $levelFailure = false;
	var $availableKeys = array();
	// Do not serialize debug
	var $debug = array();

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
				$this->gameStarted = $storedGame->gameStarted;
				$this->playingClasses = $storedGame->playingClasses;
				$this->waveInfo = $storedGame->waveInfo;
				$this->availableKeys = $storedGame->availableKeys;
			}else{
				throw new Exception('Problem with '.$this->storageFile().' game state file');
			}
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
			$this->waveInfo[] = $foe;
		}
	}

	function gameProgression(){
		if($this->gameStarted){
			$aliveFoes = array();
			$aliveFoesNotActive = array();
			$activeFoes = array();

			foreach ($this->waveInfo as $foe) {
				if($foe->foeLife > 0 && !$foe->hasFled){
					$aliveFoes[] = $foe;
					if(!$foe->active){
						$playerKillingFoe = $this->playerOfClass($foe->foeType->spellWeakness->playerClass);
						if($playerKillingFoe && $playerKillingFoe->playerLife > 0){
							$aliveFoesNotActive[] = $foe;
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

			if(count($aliveFoes) == 0){
				// If the foe buffer is empty, WIN
				//TODO Check that one player at last is alive :)
				$this->levelSucess = true;
				$this->gameStarted = false;
			}else{
				// If active foe buffer (1 foe for 1 player) is not full, we fill it
				while (count($activeFoes) < count($this->players) && count($aliveFoesNotActive) != 0) {
					// We have a partially filled active foes buffer
					$firstInactive = array_shift($aliveFoesNotActive);
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
							//TODO Handle this case: the player has been removed
						}
					}else{
						$foe->timeBeforeNextCast = $delta;
					}
				}
			}
			$anyPlayerAlive = false;
			foreach ($this->players as $player) {
				if($player->playerLife > 0){
					$anyPlayerAlive = true;
				}
			}
			if(!$anyPlayerAlive){
				$this->levelFailure = true;
				$this->gameStarted = false;
			}else{
				$this->levelFailure = false;
			}
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
	function loadLevel1(){	
		$availableKeys = array("m","a","o","i","c","e","j","k","z");
		$this->availableKeys = $availableKeys;

		// -- Spells	

		// Blanc
		$sacredLightSpell = new Spell("Lumière sacrée", $this->randomSpellSequence($availableKeys), MAGE_CLASS_1, 50);
		$lightStrikeSpell = new Spell("Frappe divine", $this->randomSpellSequence($availableKeys), MAGE_CLASS_1, 50);
		// Glace
		$frostBoltSpell = new Spell("Eclair de givre", $this->randomSpellSequence($availableKeys), MAGE_CLASS_2, 50);
		$iceLanceSpell = new Spell("Javelot de glace", $this->randomSpellSequence($availableKeys), MAGE_CLASS_2, 50);
		// Fire
		$fireballSpell = new Spell("Fireball", $this->randomSpellSequence($availableKeys), MAGE_CLASS_3, 50);
		$fireTornadoSpell = new Spell("Tornade de flammes", $this->randomSpellSequence($availableKeys), MAGE_CLASS_3, 50);

		// Blanc
		$zombieFoeType = new FoeType("Zombie", $lightStrikeSpell, 100, 9/SERVER_SPEED);
		$vampireFoeType = new FoeType("Vampire", $sacredLightSpell, 100, 7/SERVER_SPEED);
		// Glace
		$fireElemFoeType = new FoeType("Fire master", $frostBoltSpell, 100, 10/SERVER_SPEED);
		$sparkFoeType = new FoeType("Sparkle", $iceLanceSpell, 50, 6/SERVER_SPEED);
		// Fire
		$iceElemFoeType = new FoeType("Ice elemental", $fireballSpell, 100, 11/SERVER_SPEED);
		$iceGiantFoeType = new FoeType("Cold giant", $fireTornadoSpell, 100, 9/SERVER_SPEED);

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
		$this->addFoeInstanceToWave(new Foe($zombieFoeType));
		$this->addFoeInstanceToWave(new Foe($fireElemFoeType));
		$this->addFoeInstanceToWave(new Foe($iceElemFoeType));
		$this->addFoeInstanceToWave(new Foe($vampireFoeType));
		$this->addFoeInstanceToWave(new Foe($sparkFoeType));
		$this->addFoeInstanceToWave(new Foe($iceGiantFoeType));
	}
}