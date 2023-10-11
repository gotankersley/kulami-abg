//Top level variables
var game;
var menu;

$(function() {    	
	var menuManager = new MenuManager();
	menu = menuManager.properties;	
    game = new Game();	

	//Event callbacks
	var canvas = document.getElementById('mainCanvas');
	$(canvas).click(game.onClick);
	$(canvas).mousemove(game.onMouse);	 	
	
});