window.addEventListener("load", game());

  
function game() { 

	var status = 0; // If ON or OFF
	var starting = 1; // If just pressed ON or not. Used for the Start button
	var aiNotPlaying = 0; // When 0 keeps the player from pressing the colors or Reste/Start
	var strict = 0;

	var selectors = {
		colors : document.querySelectorAll('[value]'), // Select the color buttons
		normalColor : ["rgb(29,138,62)","rgb(165,0,0)","rgb(196,195,22)","rgb(0,126,171)"], // Used when relaesing a color from pressed (player or AI)
		engagedColor : ["rgb(144,209,164)","rgb(242,104,104)","rgb(242,241,111)","rgb(105,186,214)"], // Use when a color is pressed by player pr selected by AI
		screen : document.querySelector('#screen'),
		bstart : document.querySelector('button'),
		sonoff : document.querySelector('#onoffswitch'),
		sstrict : document.querySelector('#strictswitch'),
		sounds : [document.querySelector('#s0'),document.querySelector('#s1'),document.querySelector('#s2'),document.querySelector('#s3'),document.querySelector('#slose'),document.querySelector('#swin')] // Sounds
	}

	for (var i = 0; i < 4; i++) {selectors.sounds[i].playbackRate=0.5;} // Lengthen the color sounds

	var moves = {
		model : [], // Array storing the choices made by AI. Its length is used as a counter
		player : [], // Array storing the player's inputs. Is compared to the model array
	}
	
	selectors.sstrict.addEventListener("click", function () {strict = !!strict ? 0 : 1;}); // Enable/Disable Strict mode

	selectors.sonoff.addEventListener("click", function () {
		if (!!status) { 
			location.reload(); // To simply reload the page when click on OFF (otherwise would have add to kill all running SetTimeouts)
		} else {
			status = 1;
			screenUpdate ("white","var(--main-color)","-"); // Screens becomes dark with white font
		}
	});

	selectors.bstart.addEventListener("click", function () {
		if ( (!!status) && ( (!!aiNotPlaying) || (!!starting) ) ) { // Only clickable when just pressed ON or when player has the right to play
			reset(); 
			aiMove (1); // Starts the 1st AI move
			selectors.bstart.textContent = "RESET";
			starting = 0;
		}
	});


	function screenUpdate (color,background,text) { // Updates the counter screen. Only used once but let as is in case want to change code where OFF would not trigger a reload
		selectors.screen.style.color = color;
		selectors.screen.style.background = background;
		selectors.screen.textContent = text;
	}

	function reset () { // Clears the moves arrays  and the screen to start from scratch
		moves.model = [];
		moves.player = [];
		selectors.screen.textContent = moves.model.length;
	}

	function choicePlayer (choice,time,lastiteration) { // Visual and audio play of the AI or player choices
		setTimeout(function() { // To make sure that player has the time to see the color and hear the sound
			selectors.sounds[choice].play(); // Color sound
			selectors.colors[choice].style.background = selectors.engagedColor[choice]; // Switch to loghter color to show that selected
			setTimeout(function() {
				selectors.colors[choice].style.background = selectors.normalColor[choice]; // Switch back to normal color. SetTimeOut is here to let the player the time to see that was selected
			}, 1000);
			aiNotPlaying = (!!lastiteration) ? 1 : 0; // Only allows the player to play when we are at the last AI color move (otherwise the player could select a color while the AI is still showing the colors)
		}, time); // The AI has to show, the higher the time. Each choice will then fire one after the other
	}

	function aiChoice () {
		return Math.trunc( Math.random() * 4 ); // AI chooses between one of the 4 colors
	}

	function aiMove (up) { // Triggers the AI sequence of colors. If we move up one additional color, up = 1. Otherwise up = 0 (O is used when we have to repeat a wrong sequence)
		if (!!up) {
			moves.model.push(Math.trunc( Math.random() * 4 )); // Add the AI choice to the array. Only if we are not repeating an array (1st move or successful player combination)
		}
		selectors.screen.textContent = moves.model.length; // Displays where we stand
		for (var i = 0; i < moves.model.length; i++) { // Goes through all the AI choices array
			let index = moves.model[i];
			choicePlayer(index,(i + 1) * 2000,i == moves.model.length - 1); // This triggers each choice color/sound one after the other by increasing the SetTimeout time. Ex: if 3 colors, then 1st will fire at 2s, 2nd at 4s and 3rd at 6s
		}
	}


	for (var i = 0; i < 4; i++) { // When player click on 1 color
			selectors.colors[i].addEventListener("click", function () {
				if ( (!!status) && (!!aiNotPlaying) ) { // To make sure that the player can only click when the game is ON and when AI is not showing something
					let choice = Number(this.getAttribute("value")); // Player's choice
					moves.player.push(choice); // Adds the player's choice in its choice array
					if (moves.player[moves.player.length - 1] == moves.model[moves.player.length - 1]) { // If the selected color (which is the last of the player choice array) is the same as the last color of the AI array
						choicePlayer(choice,0,true); // The true parameter is here to allow the player to play again (if not blocked again by conditions below)
						if (moves.player.length == moves.model.length) { // Case when the player managed to repeat all the colors requested by AI
							if (moves.player.length == 20) { // When player reaches the 20 combination. Final victory
								selectors.sounds[5].play();
								selectors.screen.textContent = ":)";
								selectors.bstart.textContent = "START";	
								setTimeout(function() { // Whait for the music to finish before resting and saying Win alert
									reset();
									alert("You won the game!!!");
								}, 7000);
								setTimeout(function() { // Had to stop the player with a short SetTimeout otherwise the choicePlayer function would release him, while we don't want it (when winning the player should press Start)
									aiNotPlaying = 0;
								}, 50);			
							} else { // Case when the player successfully input the total combination but is not at 20 yet
								aiNotPlaying = 0;
								moves.player = []; // The player's array is cleared each he inputs the right combination of colors
								aiMove(1);
							}
						}
					} else { // Case player inputs a wrong color
						aiNotPlaying = 0;
						selectors.sounds[4].play();
						selectors.screen.textContent = "!!";
						if (!!strict) { // If in strict mode, the player start from scratch again
							setTimeout(function() { // A Settimeout is used to let the player the time to hear the error sound and see the !!
								reset();
								aiMove(1);
							}, 2000);
						} else { // Not strict mode. Just repeat te current combination
							setTimeout(function() {
								aiMove();
								moves.player = [];
							}, 2000);
						}
					}
				}
			});
	}
}