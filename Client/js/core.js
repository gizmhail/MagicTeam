
//The game will be displayed in the gameDiv HTML element, and will take a 800x600 space
var magicTeamGame = new Phaser.Game(640, 284, Phaser.AUTO, 'gameDiv');
//All game states
magicTeamGame.state.add("BattleState", battleState);
//Initial state
magicTeamGame.state.start("BattleState");

