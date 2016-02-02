var battleState = function(){
    this.characterSprite = null;
    this.mageSprites = [];
    this.foeSprites = [];
    this.foeIndicatorSprites = [];
    this.mageKeys = [gFireMageKey, gFrostMageKey, gWhiteMageKey];
    this.whiteEmitter = null;
    this.whiteEmitter = null;
    this.sounds = [];
    this.soundsLoaded = false;
    this.lastMessageBoxSound = false;
    this.spellBookButton = null;
    this.bestiaryButton = null;
    this.spellBookMode = true;
    this.arcaneZones = [];
    this.arcaneButtons = [];
    this.arcaneSymbols = [];
    this.displayedKeys = null;
};

battleState.prototype = { 
    // Assets loading - do not use asssets here
    preload: function () {
        // Load this images, available with the associated keys later
        magicTeamGame.load.image('background', 'assets/background_1.01.png');
        magicTeamGame.load.image('frostMage', 'assets/bluemage_f.png');
        magicTeamGame.load.image('fireMage', 'assets/redmage_f.png');
        magicTeamGame.load.image('whiteMage', 'assets/whitemage_f.png');
        magicTeamGame.load.image('foe_active', 'assets/foe_active.png');
        magicTeamGame.load.image('foe_absent', 'assets/foe_absent.png');
        magicTeamGame.load.image('foe_killed', 'assets/foe_killed.png');
        magicTeamGame.load.image('vampire', 'assets/drow_male1.png');
        magicTeamGame.load.image('headLessKnight', 'assets/headLessKnight.png');
        magicTeamGame.load.image('death', 'assets/death.png');
        magicTeamGame.load.image('santa', 'assets/santa.png');
        magicTeamGame.load.image('giant', 'assets/drax.png');
        magicTeamGame.load.image('iceElemental', 'assets/bahamut.png');
        magicTeamGame.load.image('sparkle', 'assets/rincewind.png');
        magicTeamGame.load.image('fireTornadoMage', 'assets/rincewind.png');
        magicTeamGame.load.image('bestiary_on', 'assets/bestiary_on.png');
        magicTeamGame.load.image('bestiary_off', 'assets/bestiary_off.png');
        magicTeamGame.load.image('spellbook_off', 'assets/spellbook_off.png');
        magicTeamGame.load.image('spellbook_on', 'assets/spellbook_on.png');
        magicTeamGame.load.image('button_back', 'assets/button_back.png');
        magicTeamGame.load.image('circle', 'assets/circle.png');

        magicTeamGame.load.spritesheet('white_explosion', 'assets/sparkle.png', 36, 32);
        magicTeamGame.load.spritesheet('explosion', 'assets/red_sparkle.png', 36, 32);
        magicTeamGame.load.spritesheet('zombie', 'assets/ZombieSpriteSheet.png', 40, 37);

        magicTeamGame.load.audio('coup1', 'sounds/coup1.mp3');
        magicTeamGame.load.audio('coup2', 'sounds/coup2.mp3');
        magicTeamGame.load.audio('coup3', 'sounds/coup3.mp3');
        magicTeamGame.load.audio('gameover1', 'sounds/gameover.mp3');
        magicTeamGame.load.audio('gameover2', 'sounds/gameover2.mp3');
        magicTeamGame.load.audio('levelup', 'sounds/levelup.mp3');
        magicTeamGame.load.audio('musiqueambiancecourt', 'sounds/musiqueambiancecourt.mp3');
        magicTeamGame.load.audio('musiqueambiancecourt2', 'sounds/musiqueambiancecourt2.mp3');


    },
    // Called after preload - create sprites,... using assets here
    create: function () {
        // Scalling
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.minWidth = 320;
        this.scale.minHeight = 442;
        this.scale.maxHeight = 1084;
        this.scale.maxWidth = 640;
        
        this.backgroundSprite = magicTeamGame.add.sprite(0, 0, 'background');
        this.backgroundSprite.crop(new Phaser.Rectangle(0, 100, 640, 384 - 100))
        this.mageSprites[gFireMageKey] = magicTeamGame.add.sprite(80, 60, 'fireMage');
        this.mageSprites[gFrostMageKey] = magicTeamGame.add.sprite(60, 135, 'frostMage');
        this.mageSprites[gWhiteMageKey] = magicTeamGame.add.sprite(40, 213, 'whiteMage');

        this.foeSprites.push( magicTeamGame.add.sprite(500, 70, 'zombie') ); 
        this.foeSprites.push( magicTeamGame.add.sprite(520, 140, 'zombie') ); 
        this.foeSprites.push( magicTeamGame.add.sprite(540, 210, 'zombie') ); 

        for (var i = 0; i < 15; i++) {
            var indicatorSprite = magicTeamGame.add.sprite(20+40*i, 10, 'foe_absent');
            indicatorSprite.scale.set(0.3);
            this.foeIndicatorSprites.push(indicatorSprite);
            if(i < 3){
                indicatorSprite.loadTexture('foe_active', 0, false);;
            }
        };

        for (var i = 0; i < this.mageKeys.length; i++) {
            var emptyBar = magicTeamGame.add.bitmapData(50, 5); 
            emptyBar.ctx.beginPath();
            emptyBar.ctx.rect(0, 0, 50, 5);
            emptyBar.ctx.fillStyle = '#ffffff';
            emptyBar.ctx.fill();
            var fullBar = magicTeamGame.add.bitmapData(50, 5); 
            fullBar.ctx.beginPath();
            fullBar.ctx.rect(1, 1, 48, 3);
            fullBar.ctx.fillStyle = '#ff6000';
            fullBar.ctx.fill();
            var mageKey = this.mageKeys[i];
            var lifeBarEmpty = magicTeamGame.add.sprite(-10,50, emptyBar);
            var lifeBarFull = magicTeamGame.add.sprite(0,0, fullBar);
            this.mageSprites[mageKey].addChild(lifeBarEmpty);
            lifeBarEmpty.addChild(lifeBarFull);
            this.mageSprites[mageKey].lifeBarFull = lifeBarFull;

            var style = { font: "12px Arial", fill: "#ffffff", align: "center" };
            var text = mageKey;
            var mageDisplayText = magicTeamGame.add.text(-20, 55, text, style); 
            this.mageSprites[mageKey].addChild(mageDisplayText);
            this.mageSprites[mageKey].mageDisplayText = mageDisplayText;
            this.mageSprites[mageKey].particlePosition = null;
        };

        for (var i = 0; i < 3; i++) {
            var emptyBar = magicTeamGame.add.bitmapData(50, 5); 
            emptyBar.ctx.beginPath();
            emptyBar.ctx.rect(0, 0, 50, 5);
            emptyBar.ctx.fillStyle = '#ffffff';
            emptyBar.ctx.fill();
            var fullBar = magicTeamGame.add.bitmapData(50, 5); 
            fullBar.ctx.beginPath();
            fullBar.ctx.rect(1, 1, 48, 3);
            fullBar.ctx.fillStyle = '#00AA00';
            fullBar.ctx.fill();
            var lifeBarEmpty = magicTeamGame.add.sprite(-10,40, emptyBar);
            var lifeBarFull = magicTeamGame.add.sprite(0,0, fullBar);
            this.foeSprites[i].addChild(lifeBarEmpty);
            lifeBarEmpty.addChild(lifeBarFull);
            this.foeSprites[i].lifeBarFull = lifeBarFull;
            this.foeSprites[i].originalPosition = {x: this.foeSprites[i].x, y: this.foeSprites[i].y};
            this.foeSprites[i].foeId = null;
            this.foeSprites[i].attackTween = null;

            var style = { font: "12px Arial", fill: "#ffffff", align: "center" };
            var text = "";
            var foeDisplayText = magicTeamGame.add.text(-20, 45, text, style); 
            this.foeSprites[i].addChild(foeDisplayText);
            this.foeSprites[i].foeDisplayText = foeDisplayText;

        };


        var emptyBar = magicTeamGame.add.bitmapData(600, 200); 
        emptyBar.ctx.beginPath();
        emptyBar.ctx.rect(0, 0, 600, 200);
        emptyBar.ctx.fillStyle = 'brown';
        emptyBar.ctx.fill();
        var fullBar = magicTeamGame.add.bitmapData(600, 200); 
        fullBar.ctx.beginPath();
        fullBar.ctx.rect(0, 0, 580, 180);
        fullBar.ctx.fillStyle = '#FFE4B5';
        fullBar.ctx.fill();
        this.messageBox = magicTeamGame.add.sprite(20,20, emptyBar);
        var foreground = magicTeamGame.add.sprite(10,10, fullBar);
        var message = magicTeamGame.add.text(this.messageBox.width / 2, this.messageBox.height / 2,"----",{"font": "22px Arial", "text-align":"center", wordWrap: true, wordWrapWidth: this.messageBox.width - 2*15});
        message.anchor.set(0.5);
        this.messageBox.addChild(foreground);
        this.messageBox.addChild(message);
        this.messageBox.message = message;
        this.messageBox.kill();

        /*
        this.updateMageLife(gFireMageKey, 0.5);
        this.updateMageLife(gFrostMageKey, 0.2);
        this.updateMageLife(gWhiteMageKey, 1);

        this.mageSprites[gFrostMageKey].kill();
        this.mageSprites[gFrostMageKey].revive();
        */

        magicTeamGame.physics.startSystem(Phaser.Physics.ARCADE);

        this.whiteEmitter = magicTeamGame.add.emitter(0, 0, 100);

        this.whiteEmitter.makeParticles('explosion', [5,6,7]);
        this.whiteEmitter.gravity = 200;

        this.music = magicTeamGame.add.audio('musiqueambiancecourt2');
        this.sounds["musiqueambiancecourt2"] = this.music;
        var soundsToLoad = [
            this.music,
        ];
        var soundEffectKeys = ['coup1', 'coup2','coup3', 'gameover1', 'gameover2', 'levelup'];
        for (var i = 0; i < soundEffectKeys.length; i++) {
            var audioKey = soundEffectKeys[i];
            this.sounds[audioKey] = magicTeamGame.add.audio(audioKey);
            soundsToLoad.push( this.sounds[audioKey] );
        };

        magicTeamGame.sound.setDecodedCallback(soundsToLoad, this.soundsAvailable, this);

        // UI
        this.stage.backgroundColor = "#ffffff";

        // Mode button
        var xButton = 0;
        var yButton = 284;
        var buttonScale = 0.412;
        this.spellBookButton = magicTeamGame.add.button(xButton, yButton, "spellbook_on", function(){
            this.toogleButtonMode();
        }, this);
        xButton = 320;
        this.bestiaryButton = magicTeamGame.add.button(xButton, yButton, "bestiary_off", function(){
            this.toogleButtonMode();
        }, this);
        this.spellBookButton.scale.set(buttonScale);
        this.bestiaryButton.scale.set(buttonScale);

        // Cast zone
        var symbol = magicTeamGame.add.text(5, 340,"Press 3 arcane symbol to cast a spell",{"font": "20px fantasy", "text-align":"center", wordWrap: true, wordWrapWidth: 190});
        var xArcaneZone = 250;
        for (var i = 0; i < 3; i++) {
            var arcaneZone = magicTeamGame.add.sprite(xArcaneZone + i*130, 320, "circle");
            this.arcaneZones.push(arcaneZone);
        }        

        this.scale.onSizeChange.add(this.sizeChange, this);
    },


    sizeChange: function(){
        if(this.scale.height < 884){
            var scale = 884/this.scale.height;
            $("#bestiary").css("top", 61 + 303/scale);
        }
    },

    soundsAvailable: function(){
        this.music.loopFull(0.2);
        this.soundsLoaded = true;
    },

    toogleButtonMode: function(){
        if(this.spellBookMode){
            this.spellBookMode = false;
            showBestiary();
            this.bestiaryButton.loadTexture("bestiary_on");
            this.spellBookButton.loadTexture("spellbook_off");
        }else{
            this.spellBookMode = true;
            showSpellBook();
            this.spellBookButton.loadTexture("spellbook_on");
            this.bestiaryButton.loadTexture("bestiary_off");
        }
    },

    playFX: function(audioKey){
        if(this.soundsLoaded && (audioKey in this.sounds) ) {
            this.sounds[audioKey].play();
        }
    },

    // Called for each refresh
    update: function (){

    },
    // Called after the renderer rendered - usefull for debug rendering, ...
    render: function  () {
    },

    // -- Effects

    particleBurst: function (x, y) {

        //  Position the emitter where the mouse/touch event was
        this.whiteEmitter.x = x;
        this.whiteEmitter.y = y;

        //  The first parameter sets the effect to "explode" which means all particles are emitted at once
        //  The second gives each particle a 2000ms lifespan
        //  The third is ignored when using burst/explode mode
        //  The final parameter (10) is how many particles will be emitted in this single burst
        this.whiteEmitter.start(true, 2000, null, 10);

    },

    // --- Mages interactions
    updateMageLife: function(mageKey, percent){
        this.mageSprites[mageKey].lifeBarFull.crop(new Phaser.Rectangle(0, 0, percent*48, 3))
    },

    // --- Global update logic
    updateUIWithGameInfo: function(game){
        if(this.displayedKeys == null || JSON.stringify(this.displayedKeys)!=JSON.stringify(game.availableKeys)){
            var xButton = 5;
            var yButton = 454;
            var xSize = 127;
            var ySize = 127;
            for (var i = 0; i < game.availableKeys.length; i++) {
                var keyId = game.availableKeys[i];
                var arcaneButton = magicTeamGame.add.button(xButton, yButton, "button_back", function(){
                    if(gSequence.length < 3){
                        var text = magicTeamGame.add.text(
                            this.x, 
                            this.y,
                            this.keyId,
                            {"font": "102px fantasy", "text-align":"center"}
                        );  
                        this.state.arcaneSymbols.push(text);  
                        magicTeamGame.add.tween(text)
                            .to({
                                x:this.state.arcaneZones[gSequence.length].x+20, 
                                y:this.state.arcaneZones[gSequence.length].y-15
                            }, 500).start();
                        gSequence.push(this.keyId);
                        if(gSequence.length == 3){
                            // Automatic cast (with a small delay to SEE third arcane symbol pressed)
                            var state = this.state;
                            window.setTimeout(function(){
                                castPreparedSpell()
                            }, 300);
                            window.setTimeout(function(){
                                for (var k = 0; k < state.arcaneSymbols.length; k++) {
                                    var text = state.arcaneSymbols[k];
                                    text.destroy();
                                };
                                state.arcaneSymbols = [];
                            }, 600);
                        }
                    }
                }, {"state":this, x: xButton, y: yButton, keyId: keyId});
                var symbol = magicTeamGame.add.text(30,-20,keyId,{"font": "152px fantasy", "text-align":"center"});
                arcaneButton.arcaneText = symbol;
                arcaneButton.keyId = keyId;
                arcaneButton.addChild(symbol);
                arcaneButton.scale.set(0.8);
                this.arcaneButtons.push(arcaneButton);
                xButton += xSize;
                if(i==4){
                    xButton = 5;
                    yButton += ySize;
                }
            }
            this.displayedKeys = game.availableKeys;
        }

        for (var i = 0; i < this.foeIndicatorSprites.length; i++) {
            var sprite = this.foeIndicatorSprites[i];
            if(i < game.waveInfo.length){
                var foe = game.waveInfo[i];
                sprite.revive();
                var texture = "foe_absent";
                if(foe.active){
                    texture = "foe_active";
                }else if(foe.foeLife == 0){
                    texture = "foe_killed";
                }else{
                    texture = "foe_absent";
                }
                if(sprite.foeTexture != texture){
                    sprite.loadTexture(texture, 0, false);
                    sprite.foeTexture = texture;
                }
            }else{
                sprite.kill();
            }
        };
        

        var absentMages = this.mageKeys.slice();

        for (var playerId in game.players) {
            var player = game.players[playerId];
            var mageKey = player.playerClass;
            var sprite = this.mageSprites[mageKey];
            var mageKeyIndex = absentMages.indexOf(mageKey);
            absentMages.splice(mageKeyIndex, 1);
            if(player.playerLife >0){
                sprite.revive();
                this.updateMageLife(mageKey, player.playerLife / 100);
                if(playerId == userIdentifier()){
                    this.mageSprites[mageKey].mageDisplayText.text = mageKey+" (YOU)";
                    this.mageSprites[mageKey].mageDisplayText.setStyle({ font: "12px Arial", fill: "#ff6600", align: "center" });
                }
            }else{
                //TODO Add annimation when killed (and check if killed)
                if(sprite.alive){
                    this.particleBurst(sprite.x + 5, sprite.y + 5);
                    this.particleBurst(sprite.x + 8, sprite.y + 8);
                    this.particleBurst(sprite.x + 8, sprite.y);
                    this.particleBurst(sprite.x    , sprite.y + 8);
                    this.playFX("gameover2");
                }
                sprite.kill();
            }
        }

        for (var i = 0; i < absentMages.length; i++) {
            var absentKey = absentMages[i];
            var sprite = this.mageSprites[absentKey];
            sprite.kill();
        };

        // We remove any previously used foe sprite
        for (var j = 0; j < this.foeSprites.length; j++) {
            var foeSprite = this.foeSprites[j];
            var foe = null;
            var targetPlayer = null;
            var stillUsed = false;
            for (var i = 0; i < game.waveInfo.length; i++) {
                if(game.waveInfo[i].foeId == foeSprite.foeId){
                    foe = game.waveInfo[i];
                    if(foe.active){
                        //We also check that the targeted user is still alive ;)
                        for (var playerId in game.players) {
                            var player = game.players[playerId];
                            if(player.playerClass == foe.targetPlayerClassName){
                                targetPlayer = player;
                                if(player.playerLife >0 && game.gameStarted){
                                    stillUsed = true;
                                }
                            }
                        }                        
                    }
                }
            }
            if(!stillUsed){
                //console.log("Killing foe sprite", foeSprite, foeSprite.foeId, targetPlayer, foe);
                foeSprite.foeId = null;
                if(foeSprite.attackTween){
                    console.log("Stopping tween", foeSprite.attackTween);
                    foeSprite.attackTween.stop();
                }
                foeSprite.attackTween = null;

                foeSprite.kill();
            }
        }

        for (var i = 0; i < game.waveInfo.length; i++) {
            var foe = game.waveInfo[i];
            var targetPlayer = null;
            for (var playerId in game.players) {
                var player = game.players[playerId];
                if(player.playerClass == foe.targetPlayerClassName && player.playerLife >0){
                   targetPlayer = player;
                }
            }
            if(foe.active){
                var foeSpriteIndex = Math.floor((Math.random() * 3) + 1);
                if(targetPlayer && targetPlayer.playerLife > 0){
                    //console.log("Active foe", foe.foeId, foe);
                    var foeSprite = null;
                    var spriteFound = false;
                    for (var j = 0; j < this.foeSprites.length; j++) {
                        if(this.foeSprites[j].foeId == foe.foeId){
                            foeSprite = this.foeSprites[j];
                            foeSpriteIndex = j;
                            spriteFound = true;
                            break;
                        }
                    };
                    if(!spriteFound){
                        for (var k = 0; k < 3; k++) {
                            var sprite = this.foeSprites[k];
                            if(sprite.foeId == null || !sprite.alive){
                                sprite.revive();
                                sprite.foeId = foe.foeId;
                                sprite.foeDisplayText.text = foe.foeType.foeName;
                                sprite.attackTween = null;
                                // console.log("---- ", foe.foeId);
                                sprite.x = sprite.originalPosition.x;
                                sprite.y = sprite.originalPosition.y;
                                var texture = "zombie";
                                if(foe.foeType.foeName == "Headless knight"){
                                    texture = "headLessKnight";
                                }
                                if(foe.foeType.foeName == "Santa"){
                                    texture = "santa";
                                }
                                if(foe.foeType.foeName == "The Death"){
                                    texture = "death";
                                }

                                if(foe.foeType.foeName == "Vampire"){
                                    texture = "vampire";
                                }
                                if(foe.foeType.foeName == "Sparkle"){
                                    texture = "sparkle";
                                }
                                if(foe.foeType.foeName == "Fire master"){
                                    texture = "fireTornadoMage";
                                }
                                if(foe.foeType.foeName == "Cold giant"){
                                    texture = "giant";
                                }
                                if(foe.foeType.foeName == "Ice elemental"){
                                    texture = "iceElemental";
                                }
                                if(sprite.foeTexture != texture){
                                    sprite.loadTexture(texture, 0, false);
                                    sprite.foeTexture = texture;
                                }
                                foeSprite = sprite;
                                foeSpriteIndex = k;
                                break;
                            }
                        }
                    }
                    if(foeSprite != null){
                        // console.log("Sprite for foe", foeSprite,foe);
                        var percent = foe.foeLife / foe.foeType.foeMaxLife;
                        foeSprite.lifeBarFull.crop(new Phaser.Rectangle(0, 0, percent*48, 3));
                        foeSprite.revive();
                        // console.log("---", foeSprite);
                        var tweenRunning = foeSprite.attackTween == null || foeSprite.attackTween.isRunning == false;
                        if(foe.timeBeforeNextCast != null && game.gameStarted){
                            var targetMageClass = foe.targetPlayerClassName;
                            var mageSprite = this.mageSprites[targetMageClass];
                            //console.log("---- mageSprite", mageSprite);
                            //console.log(foeSprite.attackTween, foe.timeBeforeNextCast);
                            if(tweenRunning && foe.timeBeforeNextCast < (foe.foeType.castTime - 1)){
                                //console.log("No tween", foeSprite.attackTween);
                                var x = mageSprite.x;
                                var y = mageSprite.y;
                                foeSprite.attackTween = magicTeamGame.add.tween(foeSprite)
                                    .to( {x: x + 10, y: y}, 1000*foe.timeBeforeNextCast);
                                foeSprite.attackTween.onComplete.add(function(){
                                    this.state.particleBurst(this.x, this.y);
                                    foeSpriteIndex = Math.floor((Math.random() * 3) + 1);
                                    console.log(foeSpriteIndex);
                                    this.state.playFX("coup"+foeSpriteIndex);

                                }, {"state": this, "x":x,"y":y});
                                foeSprite.attackTween.start();
                                //console.log("Starting tween", foeSprite.attackTween);
                            }else{
                                foeSprite.x = foeSprite.originalPosition.x;
                                foeSprite.y = foeSprite.originalPosition.y;
                            }
                        }else if(tweenRunning){
                            // No need to move (no game or no attack): reset !
                            if(foeSprite.attackTween != null){
                                foeSprite.attackTween.stop();
                                foeSprite.attackTween = null;
                            }
                            foeSprite.x = foeSprite.originalPosition.x;
                            foeSprite.y = foeSprite.originalPosition.y;
                        }
                    }else{
                        console.log("Unable to find a sprite for foe: "
                            , foe
                            , this.foeSprites[0].foeId, this.foeSprites[1].foeId, this.foeSprites[2].foeId);
                    }
                }else{
                    console.log("foe active but player dead", foe, targetPlayer);
                }
            }            
        }

        //TODO Add start/stop button
        //TODO Add gameover (or player killed) messages
        var displayedId = currentGameId();
        if(displayedId.length>13){
            displayedId = displayedId.substring(0,10)+"...";
        }
        if(Object.keys(game.players).length < 2){
            var additionalInfo = "\n\nNot enough players: bring friends to game '"+displayedId+"' !";
            this.messageBox.message.text = "Game '"+displayedId+"'' not started\nfor level "+game.currentLevel+additionalInfo;
            this.messageBox.revive();
        } else if(game.levelSucess){
            var nextLvlMsg = "Try next level !";
            if(game.currentLevel == 4){
                nextLvlMsg = "You have beaten the game, congratulation !!"
            }
            this.messageBox.message.text = "Sucess for level "+game.currentLevel
                +" !!\n(game '"+displayedId+"')"
                +"\n"+nextLvlMsg;
            this.messageBox.revive();
            if(this.lastMessageBoxSound != "success"){
                this.playFX("levelup");
                this.lastMessageBoxSound = "success";
            }
        }else if(game.levelFailure){
            this.messageBox.message.text = "You were slain in level "+game.currentLevel+"\n(game '"+displayedId+"')";
            this.messageBox.revive();
            if(this.lastMessageBoxSound != "gameover"){
                this.playFX("gameover1");
                this.lastMessageBoxSound = "gameover";
            }

        }else if(game.gameStarted){
            this.messageBox.kill();
        }else{
            this.messageBox.message.text = "Game '"+displayedId+"'' not started\nfor level "+game.currentLevel;
            this.messageBox.revive();
        }
    },
};
