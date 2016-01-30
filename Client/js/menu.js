var menu = function(){
    this.characterSprite = null;
    this.backgroundSprite = null;
    this.cursorKeys = null;
    this.menuEntryTexts = [];
    this.selectedEntry = 0;
};

menu.prototype = { 
    // Assets loading - do not use asssets here
    preload: function () {
        // Load this images, available with the associated keys later
        tutorialGame.load.image('background', 'assets/background.jpg');
    },
    // Called after preload - create sprites,... using assets here
    create: function () {
        this.backgroundSprite = tutorialGame.add.sprite(0, 0, 'background');
        var i = 1;
        while(i<=5){
            var style = {}
            if(this.selectedEntry == (i-1) ) {
                style =this.selectedStyle();
            }else{
                style = this.notSelectedStyle;
            }
            var text = tutorialGame.add.text(tutorialGame.world.centerX, i*60, "Game - step "+i, style);
            text.inputEnabled = true;
            text.anchor.set(.5,.5);
            text.events.onInputDown.add(this.stateClick(i), this);
            this.menuEntryTexts[this.menuEntryTexts.length] = text;
            i++;
        }
        this.cursorKeys = tutorialGame.input.keyboard.createCursorKeys();
   },
    // Called for each refresh
    update: function (){
        var previousSelectedEntry = this.selectedEntry;
        if(this.cursorKeys.up.isDown){
            this.selectedEntry--;
            if(this.selectedEntry<0){
                this.selectedEntry = 0;
            }
        }else if(this.cursorKeys.down.isDown){
            this.selectedEntry++;
            if(this.selectedEntry>= this.menuEntryTexts.length){
                this.selectedEntry = this.menuEntryTexts.length - 1;
            }
        }

        // Update styles
        if( previousSelectedEntry != this.selectedEntry ){
            this.menuEntryTexts[previousSelectedEntry].setStyle( this.notSelectedStyle() );
            this.menuEntryTexts[this.selectedEntry].setStyle( this.selectedStyle() );
        }
    },
    // Called after the renderer rendered - usefull for debug rendering, ...
    render: function  () {
    
    },

    stateClick: function(index){
        return function (){
            tutorialGame.state.start("GameStateStep"+index);
        };
    },

    // Styles
    selectedStyle: function(){
        return { font: "45px Arial", fill: "#ff0000", align: "center" };
    },
    notSelectedStyle: function(){
        return { font: "45px Arial", fill: "#ff6600", align: "center" };
    },
};
