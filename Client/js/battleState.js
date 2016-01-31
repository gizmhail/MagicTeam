var battleState = function(){
    this.characterSprite = null;
    this.mageSprites = [];
    this.foeSprites = [];
    this.foeIndicatorSprites = [];
    this.mageKeys = [gFireMageKey, gFrostMageKey, gWhiteMageKey];
    this.whiteEmitter = null;
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
        magicTeamGame.load.spritesheet('white_explosion', 'assets/sparkle.png', 36, 32);
        magicTeamGame.load.spritesheet('explosion', 'assets/red_sparkle.png', 36, 32);
        magicTeamGame.load.spritesheet('zombie', 'assets/ZombieSpriteSheet.png', 40, 37);

    },
    // Called after preload - create sprites,... using assets here
    create: function () {
        // Scalling
        this.scale.scaleMode = Phaser.ScaleManager.SHOW_ALL;
        this.scale.minWidth = 120;
        this.scale.minHeight = 100;
        this.scale.maxHeight = 384;
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
                if(targetPlayer && targetPlayer.playerLife > 0){
                    //console.log("Active foe", foe.foeId, foe);
                    var foeSprite = null;
                    var spriteFound = false;
                    for (var j = 0; j < this.foeSprites.length; j++) {
                        if(this.foeSprites[j].foeId == foe.foeId){
                            foeSprite = this.foeSprites[j];
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
        if(game.levelSucess){
            var nextLvlMsg = "Try next level !";
            if(game.currentLevel == 4){
                nextLvlMsg = "You have beaten the game, congratulation !!"
            }
            this.messageBox.message.text = "Sucess for level "+game.currentLevel
                +" !!\n(game '"+displayedId+"')"
                +"\n"+nextLvlMsg;
            this.messageBox.revive();
        }else if(game.levelFailure){
            this.messageBox.message.text = "You were slain in level "+game.currentLevel+"\n(game '"+displayedId+"')";
            this.messageBox.revive();
        }else if(game.gameStarted){
            this.messageBox.kill();
        }else{
            var additionalInfo = "";
            if(Object.keys(game.players).length < 2){
                additionalInfo = "\n\nNot enough players: bring friends to game '"+displayedId+"' !";
            }
            this.messageBox.message.text = "Game '"+displayedId+"'' not started\nfor level "+game.currentLevel+additionalInfo;
            this.messageBox.revive();
        }
    },
};
