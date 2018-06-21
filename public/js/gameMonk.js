$(function() {
	/* Let's store some data */
	$('body').after('<p class="lastPositionPillar" hidden></p>');
	$('body').after('<p class="areYouBlocked" hidden></p>');
	$('body').after('<p class="areYouDead" hidden>0</p>');
	$('body').after('<p class="speedGame" hidden>100</p>');
	$('body').after('<p class="isFalling" hidden>0</p>');
	/* Music loop */
	var music = document.createElement('audio');
	music.setAttribute('src', 'sound/music/music.mp3');
	music.addEventListener('ended', function() {
		this.currentTime = 0;
		this.play();
	}, false);
	music.play();

	/* LOOP ANIMATION */
	/* background animation */
	function skyIsMoving () {
		$('.skyBackground').animate({left : '-=960'}, 4000, 'linear', function() {
			$('.skyBackground:first').css('left', 960);
			$('.skyBackground:nth-child(2)').css('left', 0);
			if ($('.areYouDead').html() !=1)
				skyIsMoving();
		});
	}
	/* Monk animation */
	function monkIsAnimating(numImgs) {
		monk.css('margin-left', -1 * (count * monkHeight));
		count++;
		if (count === numImgs) {
			count = 0;
		}
	}
	/* Monk variables */
	var 	monkHeight = 63.25;
	var 	count = 0;
	var 	monk = $('.monkContainer').find('img');

	/* PILLARS STUFF */
	/* Pillars are coming : general function*/
	function setNewPillar() {
		var speedPillar = pillarsAreQuicker(timeStart);
		// speed = distance / time
		var speedGame = 960 / speedPillar;		
		$('.speedGame').html(speedGame);
		var pillar = $('.pillars:first').clone().appendTo('.pillarsContainer');
		/* Where does it comes ? 
		 * 2 chances on 3 that it will be 
		 * different from the previous
		 */
		if (parseInt($('.lastPositionPillar').html()) === 0) {
			var pillarY = Math.ceil(Math.random() * 3);
			if (pillarY == 2 || pillarY == 3) {
				pillarY = 1;
			} else 
				pillarY = 0;
		} else {
			var pillarY = Math.ceil(Math.random() * 3);
			if (pillarY == 2 || pillarY == 3) {
				pillarY = 0;
			} else 
				pillarY = 1;
		}
		pillarY *= 370;
		$('.lastPositionPillar').html(pillarY);
		pillar.css('left', 870);
		pillar.css('top', pillarY);
		pillarIsComing(pillar, pillarY, speedPillar);
		// Stock the ID in array interval4 for clear it when game will be over
		interval4[interval4.length] = (setInterval(function() {helloPillar(pillar);}, 80 - speedGame));
	}		
	/* Display a pillar and destroy it when 'top' comes to 0*/
	function pillarIsComing(pillar, pillarY, speed) {
		pillar.animate({left : 0}, speed, 'linear', function() {
			pillarX = parseInt($(this).css('left'));
			while (pillarX < 0) {
				$(this).css('left', pillarX);
				pillarX = parseInt($(this).css('left'));
			}
			pillar.remove();
			pillar.clearQueue();
		});
	}

	/* More you survive... more god is angry
	Deal with speed of pillars */
	var timeStart = $.now();
	function pillarsAreQuicker(timeStart) {
		var timeNow = $.now();
		var timeSinceTheBeggining = timeNow - timeStart;
		// pillarsSpeed is the duration (ms) for a pillar to go through the screen
		var pillarsSpeed = 4500 - (timeSinceTheBeggining / 10);
		if (pillarsSpeed < 1000) {
			pillarsSpeed = 1000;
		}
		return parseInt(pillarsSpeed);
	}
	/* Deal with pace of pillars */
	function pillarsAreNumerous(timeStart) {
		var timeNow = $.now();
		var timeSinceTheBeggining = timeNow - timeStart;
		var pillarsPace = parseInt(2000 - (timeSinceTheBeggining / 20));
		if (pillarsPace < 200) {
			pillarsPace = 200;
		}
		if (parseInt($('.areYouDead').html()) != 1) {
			setNewPillar();
			setTimeout(function() {pillarsAreNumerous(timeStart);}, pillarsPace);
		}
	}

	/* COLLISION */ 
	function helloPillar (pillar) {
		var monkY = parseInt($('.monkContainer').css('top'));
		var monkX = parseInt($('.monkContainer').css('left'));
		var pillarY = parseInt(pillar.css('top'));
		var pillarX = parseInt(pillar.css('left'));
		var speedGame = parseFloat($('.speedGame').html());
		// Meet a pillar from the face
		if (
		monkY < (pillarY + 370)
		&& monkY > (pillarY - 20)
		&& monkX < pillarX
		&& (monkX + 60) > pillarX) {

			$('.monkContainer').stop();
			monkX = monkX - (speedGame * (speedGame * 65)) - 20 * (1 + speedGame);
			$('.monkContainer').animate({left: monkX},{ 
				duration: 100 - speedGame * 65, 
				easing: 'linear',
				queue: false,
				complete: function() {
					monkFalling();
				}
			});
			$('.monkContainer').animate({top: monkY + 20},{ 
				duration: 100 - speedGame * 65,
				easing: 'linear',
				queue: false,
				complete: function() {
					monkFalling();
				}
			});
			$('.areYouBlocked').html(1);
		} else 
			$('.areYouBlocked').html(0);
		// Meet a pillard from the bottom
		if (
		monkY >= (pillarY + 370)
		&& monkY < (pillarY + 420)
		&& monkX > pillarX - 40
		&& monkX < (pillarX + 40)
		&& pillarX > 0) {
			$('.monkContainer').stop();
			monkFalling();
			$('.areYouBlocked').html(1);
		} else 
			$('.areYouBlocked').html(0);
		// Meet a pillard from the top
		if (
		monkY <= pillarY
		&& monkY + 50 >= pillarY
		&& monkX > pillarX - 20
		&& monkX < (pillarX + 40)) {
			monkY = 300;
			$('.monkContainer').stop();
			monkFalling();
			$('.areYouBlocked').html(1);
		} else 
			$('.areYouBlocked').html(0);
	}
	/* MONK'S MOVEMENTS */
	/* Monk is always falling... */
	function monkFalling() {
		var monkY = parseInt($('.monkContainer').css('top'));
		var monkX = parseInt($('.monkContainer').css('left'));

		$('.monkContainer').animate({left: 0}, {
			duration: 4000,
			easing: 'linear',
			queue: false
		});
		$('.monkContainer').animate({top: 760}, {
			duration: 2000,
			easing: 'linear',
			queue: false
		});
	}
	/* Monk has gone too far */
	function monkSpatialLimits() {
		var monkY = parseInt($('.monkContainer').css('top'));
		var monkX = parseInt($('.monkContainer').css('left'));
		if (monkX > 800) {
			$('.monkContainer').stop();
			monkFalling();
		}
		if (monkY < 60) {
			$('.monkContainer').stop();
			monkFalling();
		}
	}
	/* DEFEAT */
	function monkDead() {
		var monkX = parseInt($('.monkContainer').css('left'));
		var monkY = parseInt($('.monkContainer').css('top'));
		if (monkX < 0 || (monkY > 700 && parseInt($('.areYouDead').html()) != 1)) {
			$('.areYouDead').html(1);
			$('.monkContainer').css('display', 'none');
			var gameOverSound = document.createElement('audio');
			gameOverSound.setAttribute('src', 'sound/sounds/gameOver.mp3');
			gameOverSound.play();
			// clear initial functionCalling (end of file)
			clearInterval(interval1);
			clearInterval(interval2);
			clearInterval(interval3);
			// clear all the helloPillar() setInterval
			for (var i = 0 ; i < interval4.length ; i++) {
				clearInterval(interval4[i]);
			}
		}
	}

	/* EVENT GESTION */
	/* Moving the little guy */
	$(document).on('keydown', moveTheMonk);
	$(document).on('click', moveTheMonk);

	function moveTheMonk(e) {
		var monkY = parseInt($('.monkContainer').css('top'));
		var monkX = parseInt($('.monkContainer').css('left'));
		var bottomScreen = parseInt($('body').height());
		var distanceMonkBottom = bottomScreen - monkY;
		var bezierPath_params = {
			start: {
				x: monkX,
				y: monkY,
				angle: -25,
				lenght: 1,
			},
			end: {
				x: monkX + 150,
				y: monkY - 200,
				angle: 65,
				lenght: 1,
			}
		}
		switch (e.which) {
			// Top
			case 38:
				if (monkY > 10 && $('.areYouBlocked').html() != 1)
					$('.monkContainer').css('top', monkY -= 50);
				monkFalling();
			break;
			// Bottom
			case 40:
				if (monkY < 700 && $('.areYouBlocked').html() != 1)
					$('.monkContainer').css('top', monkY += 50);
				monkFalling();
			break;
			// Left
			case 37:
				if (monkX > 8 && $('.areYouBlocked').html() != 1)
					$('.monkContainer').css('left', monkX -= 50);
				monkFalling();
			break;
			// Right
			case 39:
				if (monkX < 800 && $('.areYouBlocked').html() != 1)
					$('.monkContainer').css('left', monkX += 50);
				monkFalling();
			break;
			// Mouseclick 
			case 1:
				$('.monkContainer').stop();
				$('.monkContainer').animate({path : new $.path.bezier(bezierPath_params)}, {
					duration: 1000,
					queue: false,
					complete: function() {
						monkFalling();
					}
				});
			break;
		}
	}

	/* FUNCTIONS CALLING */
	var interval1 = setInterval(function() {monkIsAnimating(4);} , 200);
	var interval2 = setInterval(monkDead, 20);
	var interval3 = setInterval(monkSpatialLimits, 20);
	// global array for the ID of HelloPillar()'s' setInterval
	var interval4 = [];
	skyIsMoving();
	pillarsAreNumerous(timeStart);
	monkFalling();
});