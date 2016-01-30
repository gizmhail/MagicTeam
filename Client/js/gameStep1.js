var gameStateStep1 = function(){
    this.characterSprite = null;
    this.backgroundSprite = null;
    this.ballSprite = null;
    this.cursorKeys = null;
    this.spacebarKey = null;
    this.debug = false;
    this.wallLayer = null;
    this.goalLayer = null;
    this.startDate = null;
};

gameStateStep1.prototype = { 
    // Assets loading - do not use asssets here
    preload: function () {
        // Load this images, available with the associated keys later
        tutorialGame.load.image('background', 'assets/background.jpg');
        tutorialGame.load.image('character', 'assets/Sara.png');
        // Each sprite is 54x55 . -1 means we don't limit to a number of sprites,
        //  0 is the margin of the file, 10 the spacing between each sprites
        tutorialGame.load.spritesheet('characterFrames', 'assets/SaraFullSheet7.png', 54, 55, -1, 0 ,10);
        tutorialGame.load.spritesheet('ballFrames', 'assets/ball_animation.png', 45, 45);

        //Tilemap
        //Created with Tiled software, with needed format: Orthogonal / CSV / .json files
        tutorialGame.load.tilemap('map', 'assets/tiled.json', null, Phaser.Tilemap.TILED_JSON);
        tutorialGame.load.image('RPGpack_sheet', 'assets/RPGpack_sheet.png');

    },
    // Called after preload - create sprites,... using assets here
    create: function () {
        // Create a sprite
        this.backgroundSprite = tutorialGame.add.sprite(0, 0, 'background');
        this.ballSprite = tutorialGame.add.sprite(120, 325, 'ballFrames');
        this.ballSprite.scale.set(0.5,0.5);
        this.characterSprite = tutorialGame.add.sprite(50, 300, 'characterFrames');

        // Add animations
        this.characterSprite.animations.add("up",[0,1,2,3,4,5,6,7,8]);
        this.characterSprite.animations.add("left",[13,14,15,16,17,18,19,20,21]);
        this.characterSprite.animations.add("down",[26,27,28,29,30,31,32,33,34]);
        this.characterSprite.animations.add("right",[39,40,41,42,43,44,45,46,47]);
        this.ballSprite.animations.add("rolling");

        // Shortcut method to create 4 inputs for the arrow keys
        this.cursorKeys = tutorialGame.input.keyboard.createCursorKeys();
        // Creation of a specific key observer
        this.spacebarKey = tutorialGame.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

        // Physics engine initialisation (optional for arcade engine, need for other ones)
        tutorialGame.physics.startSystem(Phaser.Physics.ARCADE);
        // Add a physical body to the sprite
        tutorialGame.physics.enable(this.characterSprite, Phaser.Physics.ARCADE);
        // The sprite will collide with the borders
        this.characterSprite.body.collideWorldBounds = true;
        // We limit the physic body to a smaller part of the sprite (it contains white spaces)
        this.characterSprite.body.setSize(15, 35, 25, 20);
        //Ball body
        tutorialGame.physics.enable(this.ballSprite, Phaser.Physics.ARCADE);
        this.ballSprite.body.collideWorldBounds = true;
        // A ball is very bouncy, we set its bounce to the max
        this.ballSprite.body.bounce.set(0.8, 0.8);
        // We decrease the default mass (1) to have a more reactive ball during collision (it is not as heavy as the player !)
        this.ballSprite.body.mass = 0.5;
        // Drag will progressively decrease ball velocity
        this.ballSprite.body.drag.x = 50;
        this.ballSprite.body.drag.y = 50;


        var map = tutorialGame.add.tilemap('map');
        // The tileset name must match the one defined in Tiled
        map.addTilesetImage('RPGpack_sheet');
        // The layer name must match the one defined in Tiled
        var backgroundLayer = map.createLayer('background');
        this.wallLayer = map.createLayer('walls');
        this.goalLayer = map.createLayer('goals');
        //The world will have the map size
        backgroundLayer.resizeWorld();
        //The camera will follow the player, as the world is bigger than the screen
        tutorialGame.camera.follow(this.characterSprite);
        // Every tiles in the walls layer will be able to colide in this layer
        map.setCollisionByExclusion([],true,'walls');
        map.setCollisionByExclusion([],true,'goals');

        // Sprites are z-ordered by creation. As we added tiles later,
        //  we move back other sprites to top
        this.ballSprite.bringToTop();
        this.characterSprite.bringToTop();

        this.startDate = new Date();
    },
    // Called for each refresh
    update: function (){
        var characterSpeed = 4;
        var moving = false;
        var walkAnimationSpeed = 10;
        var walkAnimationLooping = true;//true means that the animation will loop once finished
        if(this.cursorKeys.left.isDown){
            this.characterSprite.body.velocity.x -= characterSpeed;
            if(!moving) this.characterSprite.animations.play("left",walkAnimationSpeed,walkAnimationLooping);
            moving = true;
        }else if(this.cursorKeys.right.isDown){
            this.characterSprite.body.velocity.x += characterSpeed;
            if(!moving) this.characterSprite.animations.play("right",walkAnimationSpeed,walkAnimationLooping);
            moving = true;
        }else{
            this.characterSprite.body.velocity.x *= 0.8;
        }
        if(this.cursorKeys.up.isDown){
            this.characterSprite.body.velocity.y -= characterSpeed;
            if(!moving) this.characterSprite.animations.play("up",walkAnimationSpeed,walkAnimationLooping);
            moving = true;
        }else if(this.cursorKeys.down.isDown){
            this.characterSprite.body.velocity.y += characterSpeed;
            if(!moving) this.characterSprite.animations.play("down",walkAnimationSpeed,walkAnimationLooping);
            moving = true;
        }else {
            this.characterSprite.body.velocity.y *= 0.8;            
        }
        if(!moving){
            this.characterSprite.frame = 26;
            this.characterSprite.body.velocity.x = 0;
            this.characterSprite.body.velocity.y = 0;
        }
        var maxCharacterVelocity = 300;
        this.characterSprite.body.maxVelocity.set(maxCharacterVelocity,maxCharacterVelocity);    

        // Ball/player collision customization
        tutorialGame.physics.arcade.collide(this.characterSprite, this.ballSprite, function(){
            console.log("Ball was touched by player");
            // We shortcut the natural rebound to have a "dribble" effect (the ball follows a bit the player, randomly)
            var effect = 0.5+0.5*Math.random();
            this.ballSprite.body.velocity.x += effect*this.characterSprite.body.velocity.x;
            var effect = 0.5+0.5*Math.random();
            this.ballSprite.body.velocity.y += effect*this.characterSprite.body.velocity.y;
            // We limit the amplification of velocity to avoid unrealistic move, but to a bit
            //  greater max than character, to have the ball "jump" in front of the character
            var maxBallVelocity = 400;
            this.ballSprite.body.maxVelocity.set(maxBallVelocity,maxBallVelocity);    
            return true;
        }, null, this);
        // Ball animation (relative to its velocity)
        if(this.ballSprite.body.velocity.getMagnitude() > 2){
            var animationSpeed = Math.floor(15*Math.min(this.ballSprite.body.velocity.getMagnitude(), 100)/100);
            var rollingBallAnimation = this.ballSprite.animations.getAnimation("rolling");
            if (rollingBallAnimation.isPlaying) {
               rollingBallAnimation.speed = animationSpeed;
            } else {
                this.ballSprite.animations.play("rolling", animationSpeed, true);
            }
        }else{
            this.ballSprite.animations.stop("rolling");
        }
        // Collision checks
        tutorialGame.physics.arcade.collide(this.ballSprite, this.wallLayer, function(){
            console.log("Ball touched wall");
            return true;
        });
        tutorialGame.physics.arcade.collide(this.characterSprite, this.wallLayer, function(){
            console.log("Played touched wall");
            return true;
        }, null, this);
        tutorialGame.physics.arcade.collide(this.ballSprite, this.goalLayer, function(){
            console.log("Goal !!!!!!");
            var now = new Date();
            var deltaTime = now.getTime() - this.startDate.getTime();
            var text = tutorialGame.add.text(400,300,"GOAL (in "+Math.floor(deltaTime/1000)+" seconds)!!!!");
            //Not needed here as we pause the game. But otherwise, the text would stay in position
            text.fixedToCamera = true;
            tutorialGame.paused = true;
            window.setTimeout(function(){
                tutorialGame.state.restart(true);
                tutorialGame.paused = false;
            }, 2000);
            return true;
        }, null, this);

        // Tutorial debug
        if(this.spacebarKey.isDown){
            this.debug = true;
        }else{            
            this.debug = false;
        }
    },
    // Called after the renderer rendered - usefull for debug rendering, ...
    render: function  () {
        if(this.debug){
            tutorialGame.debug.body(this.characterSprite);
            tutorialGame.debug.body(this.ballSprite);
        }else{
            tutorialGame.debug.reset();
        }
    }
};
