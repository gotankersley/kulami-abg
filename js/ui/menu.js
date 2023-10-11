//Struct MenuProperties
function MenuProperties() {
	this.expertMode = false;
	this.showAxes = true;
	this.showGrid = false;
	this.showPinsRemaining = true;
	this.showScore = true;
	this.showScoreMap = false;
	this.suggest = suggestMove;
	this.moveDelay = 0;
	this.tileRounding = TILE_RADIUS_SIZE;
	this.board = 0;
	this.player1 = PLAYER_HUMAN;
	this.player2 = PLAYER_HUMAN;
}
//End struct MenuProperties

//Class MenuManager
function MenuManager() {
	this.properties = new MenuProperties();
	this.rootMenu = new dat.GUI();	
	
	//Options
	var optionsMenu = this.rootMenu.addFolder('Options');
	optionsMenu.add(this.properties, 'expertMode').onChange(this.onScoreToggle);	
	optionsMenu.add(this.properties, 'moveDelay', 0, 10000);	
	optionsMenu.add(this.properties, 'tileRounding', 0, UNIT_SIZE);	
	optionsMenu.add(this.properties, 'showAxes');
	optionsMenu.add(this.properties, 'showGrid');
	optionsMenu.add(this.properties, 'showPinsRemaining');
	//optionsMenu.add(this.properties, 'showScore').onChange(this.onScoreToggle);
	optionsMenu.add(this.properties, 'showScoreMap');
	optionsMenu.add(this.properties, 'suggest');	
	
	//Root menu
	var boardOptions = {Default:0, Irregular:1, Team1:2, Team2:3, Team3:4, Team4:5, Team5:6, Team6:7, Team7:8};
	this.rootMenu.add(this.properties, 'board', boardOptions).onChange(this.onBoardChange);

	var playerOptions = {Human:PLAYER_HUMAN, Weak:PLAYER_HEURISTIC, Good:PLAYER_ALPHA, Salami:PLAYER_MC};
	this.rootMenu.add(this.properties, 'player1', playerOptions).onChange(this.onChangePlayer);
	this.rootMenu.add(this.properties, 'player2', playerOptions).onChange(this.onChangePlayer);
}

//Events
MenuManager.prototype.onChangePlayer = function(val) {
	game.players = new Players(menu.player1, menu.player2);	
	game.onMoveStart();
}

MenuManager.prototype.onBoardChange = function(val) {
	game = new Game(KBNS[val]);
}

MenuManager.prototype.onScoreToggle = function(val) {
	$('#score').toggle();
}

function suggestMove() {
	menu.showScoreMap = true;
	for (var r = 0; r < GRID_SIZE; r++) {
		for (var c = 0; c < GRID_SIZE; c++) {
			game.scoreMap[r][c] = '';
		}
	}
	AB.getMove(game.board);	
}
//End class MenuManager
