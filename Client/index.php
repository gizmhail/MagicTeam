<!doctype html>
<html>
    <head>
        <meta charset="UTF-8" />
        <meta name="apple-mobile-web-app-capable" content="yes">
        <meta name = "viewport" content = "width = device-width, initial-scale = 1.0, user-scalable = no">
        <title>MagicTeam</title>
        <script src="js/phaser.min.js"></script>
        <script src="js/jquery.min.js"></script>
        <script src="js/tools.js"></script>
        <script src="js/game.js"></script>
        <link rel="stylesheet" type="text/css" href="game.css">
        <script type="text/javascript">
            function launchNewGame(){
                console.log("Creating new game");
                var gameId = $("#gameName").val();
                if(gameId == null || gameId == ''){
                    createGame(function(data){
                        console.log(data);
                        window.location.href = "game.html?gameId="+data["gameId"] 
                    });
                }else{
                    window.location.href = "game.html?gameId="+gameId                         
                }

            }
            $(document).ready(function() {
                $('#gameName').keypress(function (e) {
                  if (e.which == 13) {
                    launchNewGame();
                    return false;
                  }
                });
                $("#newGame").click(function(){
                    launchNewGame();
                });
            });
        </script>
    </head>
    <body>
        <div>
            <a href='#' id='newGame'>Create a new game</a> <input id='gameName' placeholder='Game name'/>
        </div>
    	<div>
            Existing games:
            <?php
            // TODO Request in json, remove php from client
            include(dirname(dirname(__FILE__)).'/Server/class/game.class.php');
            $games = Game::existingGames();
            echo count($games);
            ?>
            <ul>
            <?php

                foreach ($games as $gameId) {
                    $game = new Game($gameId);
                ?>
                <li style='border:1px solid brown;margin:5px;'>
                    <a href='game.html?gameId=<?php echo $gameId?>'>
                        Players: <?php echo count($game->players)?>/<?php echo count($game->gameClasses()) ?>
                        <ul>
                            <li>Game name: <?php echo $gameId?> </li>
                            <li>
                                Start date: <?php echo date("d/m - H:i:s", $game->creationDate)?> 
                                (<?php echo date("d/m - H:i:s", $game->lastSaveDate)?>)
                            </li>
                        </ul>
                    </a>
                </li>
                <?php
                }
            ?>

    		</ul>
    	</div>
        <hr/>
        <div>
            <img src='assets/redmage_f.png' style='float:left; margin:10px'/>
            <p>
            The game is a mix between Magicka and Spaceteam, very inspired by this later.
            Indeed, as with Spaceteam, the goal of the game is to achieve a maximum auditive chaos ^_^
            </p>
            <p>
            It is a <b>cooperative game</b>, where you are, with your friends, a team of mages.
            You have to cast spells to fight your foes, and only some spells can hurt a given ennemy.
            To cast a spell, you have to send each arcane symbols in the proper order, as written in the bestiary (where for a given creature, the appropriate spell is given)
            <p>
            <b>...but there is a twist</b>: your bestiary does NOT contain your spells, but the spells of your teamates.
            And thus, you are obliged to quickly communicate together outside of the video game, by whisping/telling/<b>YELLING</b> the commands to your teamates
            </p>
        </div>
    </body>
</html>

