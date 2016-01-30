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
            $(document).ready(function(){
                $('#playerId').html(playerId);
                $('#gameId').html(gameId);
                registerPlayer(gameId, playerId, function(player){
                    $('#playerClass').html(player["playerClass"]);
                })
            });

        </script>
    </head>
    <body>
    	<div>
            Debug info
            <ul>
                <li>Player id: <span id='playerId'></span></li>
                <li>Player class: <span id='playerClass'></span></li>
                <li>Game id: <span id='gameId'></span></li>
            </ul>
    	</div>
    </body>
</html>

