<!doctype html>
<html>
    <head>
        <meta charset="UTF-8" />
        <title>hello phaser!</title>
        <script src="js/phaser.min.js"></script>
        <script src="js/jquery.min.js"></script>
        <script src="js/tools.js"></script>
        <script src="js/game.js"></script>
        <script type="text/javascript">
            $(document).ready(function() {
                $("#newGame").click(function(){
                    console.log("Creating new game");
                    createGame(function(data){
                        console.log(data);
                        window.location.href = "game.html?gameId="+data["gameId"] 
                    });
                });
            });
        </script>
    </head>
    <body>
        <div>
            Games edition:
            <ul>
                <li><a href='#' id='newGame'>Create a new game</a></li>
            </ul>
        </div>
    	<div>
            Existing games:
            <ul>
            <?php
                // TODO Request in json, remove php from client
                include(dirname(dirname(__FILE__)).'/Server/class/game.class.php');

                foreach (Game::existingGames() as $gameId) {
                    $game = new Game($gameId);
                ?>
                <li>
                    <a href='game.html?gameId=<?php echo $gameId?>'>
                        Game <?php echo $gameId?> 
                        (<?php echo count($game->players)?>/<?php echo count($game->gameClasses()) ?>)
                    </a>
                </li>
                <?php
                }
            ?>

    		</ul>
    	</div>
    </body>
</html>

