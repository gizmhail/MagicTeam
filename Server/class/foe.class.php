<?php

class FoeType{
	var $foeName;
	var $foeMaxLife = 100;
	var $castTime = 8;
	var $spellWeakness;
	var $damage = 20;

	function __construct($name, $weakness, $life = 100, $castTime = 8, $damage = 20){
		$this->foeName = $name;
		$this->foeMaxLife = $life;
		$this->spellWeakness = $weakness;
		$this->castTime = $castTime;
		$this->damage = $damage;
	}
}

class Foe{
	var $foeType;
	var $foeLife;
	var $active = false;
	var $serverNextCastTime;
	var $timeBeforeNextCast;
	var $entranceDate = null;
	var $lastDamageDone = 0;
	var $lastDamageTargetId = null;
	var $foeId = null;
	var $targetPlayerClassName = null;
	// A foe which has killed its player can flee (can't be active, but is not dead)
	var $hasFled = false;
	//TODO Had a flag

	function __construct($foeType){
		$this->foeType = $foeType;
		$this->foeLife = $foeType->foeMaxLife;
		$this->foeId = md5($foeType->foeName.microtime(true));
		$this->targetPlayerClassName = $this->targetPlayerClass();
	}

	function targetPlayerClass(){
		return $this->foeType->spellWeakness->playerClass;
	}
}
