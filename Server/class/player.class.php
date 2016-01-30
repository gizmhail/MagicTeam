<?php

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
