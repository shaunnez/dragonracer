angular.module('dragonrace.controllers', [])

.controller('HomeCtrl', function($scope, $state, $timeout) {
	//////////////////
	var container = $('#progress-container');
	var element = $("#progress").eq(0);
	var buttonContainer = $('.home-button-container');
	//////////////////
	element.ElasticProgress({
		buttonSize: 60,
		colorBg: "#666",
		colorFg: "#EEE",
		bleedTop: 110,
		bleedBottom: 40,
		buttonSize: 100,
		labelTilt: 70,
		arrowDirection: "up",
		align: "center",
		onOpen: function() {
			var $obj = $(this);
			var speed = 2;
			var v = 0;
			var l = function() {
				v += Math.pow(Math.random(), 2) * 0.1 * speed;
				if (typeof $obj.jquery != "undefined") {
					$obj.ElasticProgress("setValue", v);
				} else {
					$obj.setValue(v);
				}
				if (v < 1) {
					TweenMax.delayedCall(0.05 + (Math.random() * 0.14), l)
				}
			};
			l();
		},
		onComplete: function() {
			$timeout(function() {
				element.fadeOut(function() {
					buttonContainer.fadeIn();
				});
			}, 500);
		}
	});
	//////////////////
	container.addClass('opacity-on');
	element.ElasticProgress("open");
})

.controller('SetupCtrl', function($scope, $state, $timeout, $ionicLoading, configService) {
	//////////////////
	$scope.config = configService.loadConfig();
	//////////////////
	$scope.$on('$ionicView.enter', function() {
		$scope.config = configService.loadConfig();
		$scope.$apply();
	});
	//////////////////
	$scope.totalWeight = 0;
	//////////////////
	var goToBetPage = function() {
		$state.go('app.placebet');
	}
	//////////////////
	$scope.save = function() {
		configService.saveConfig($scope.config);
		goToBetPage();
	}
	//////////////////
	$scope.reset = function() {
		configService.resetConfig();
		goToBetPage();
	}
	//////////////////
	$scope.resetScores = function() {
		configService.resetScores();
		goToBetPage();
	}
	//////////////////
	var calculateTotalWeight = function() {
		var totalWeight = 0;
		for(var i = 0; i < $scope.config.amountOfDragons; i++) {
			totalWeight += $scope.config.dragons[i].weight;
		}
		$scope.totalWeight = totalWeight;
	}
	$scope.$watch('config.dragons', function() {
		calculateTotalWeight();
	},true)
	$scope.$watch('config.amountOfDragons', function() {
		calculateTotalWeight();
	},true)
})


.controller('StatsCtrl', function($scope, $state, $timeout, $ionicLoading, configService) {
	//////////////////
	$scope.config = configService.loadConfig();
	//////////////////
	$scope.$on('$ionicView.enter', function() {
		var totalWeight = 0;
		for(var i = 0; i < $scope.config.amountOfDragons; i++) {
			totalWeight += $scope.config.dragons[i].weight;
		}
		$scope.totalWeight = totalWeight;
		$scope.config = configService.loadConfig();
		$scope.$apply();
	});
	//////////////////
	$scope.reverse = false;
	//////////////////
	$scope.changeOrder = function() {
		$scope.reverse = !$scope.reverse;
	}
	//////////////////
	$scope.getOrdinal = function(n) {
		var s = ["th","st","nd","rd"];
		var v = n%100;
		return n+(s[(v-20)%10]||s[v]||s[0]);
	}
})

.controller('PlaceBetCtrl', function($rootScope, $scope, $state, $timeout, $ionicLoading, $ionicPopup, configService) {
	//////////////////
	$scope.config = configService.loadConfig();
	//////////////////
	$scope.bet = {
		dragonName: '',
		dragonWeight: 0,
		winAmount: 0,
		betAmount: Math.round($scope.config.playerScore / 4),
		pointsMade: 0
	}
	$rootScope.bet = $scope.bet;
	//////////////////
	var setTotalWeight = function() {
		$scope.config = configService.loadConfig();
		var totalWeight = 0;
		for(var i = 0; i < $scope.config.amountOfDragons; i++) {
			totalWeight += $scope.config.dragons[i].weight;
		}
		$scope.totalWeight = totalWeight;
	}
	var calculateWinAmount = function() {
		var probabilityOfWinning = $scope.bet.dragonWeight / $scope.totalWeight;
		var probabilityOfLosing = 1 - probabilityOfWinning;
		$scope.bet.winAmount = Math.round(probabilityOfLosing * $scope.bet.betAmount);
	}
	//////////////////
	setTotalWeight();
	//////////////////
	//////////////////
	$scope.$on('$ionicView.enter', function() {
		setTotalWeight();
		$scope.$apply();
	});
	//////////////////
	$scope.$watch('bet.betAmount', function() {
		calculateWinAmount();
	});
	//////////////////
	$scope.placeBet = function(dragonName, dragonWeight) {
		$scope.bet.dragonName = dragonName;
		$scope.bet.dragonWeight = dragonWeight;
		var template = '<div class="item item-input">' +
		'<input type="number" ng-model="bet.betAmount" min="1" max="' + $scope.config.playerScore + '" />' +
		'</div><br/><p class="text-center"><strong>You could win</strong>: {{ bet.winAmount }}</p>';
		
		calculateWinAmount();
		var myPopup = $ionicPopup.show({
			title: 'Place bet',
			subTitle: 'Enter in the amount you would like to bet ',
			template: template,
			scope: $scope,
			buttons: [
				{ text: 'Cancel' },
				{
					text: '<b>Save</b>',
					type: 'button-positive',
					onTap: function(e) {
						if($scope.bet.betAmount < 0 || $scope.bet.betAmount > $scope.config.playerScore) {
							e.preventDefault();
						} else {
							return $scope.bet.betAmount;
						}
					}
				}
			]
		});
	  myPopup.then(function(res) {
			if(res) {
				$ionicLoading.show({ template: 'Loading...' });
				$rootScope.bet = $scope.bet;
				$state.go('app.game');
			}
	  });
	}
	//////////////////
	$scope.getOrdinal = function(n) {
		var s = ["th","st","nd","rd"];
		var v = n%100;
		return n+(s[(v-20)%10]||s[v]||s[0]);
	}
})

.controller('GameCtrl', function($rootScope, $scope, $http, $state, $ionicLoading, $timeout, ngAudio, configService, gameService) {
	//////////////////
	$scope.$on('$ionicView.enter', function() {
		init();
	});
	//////////////////
	$scope.$on('$ionicView.leave', function() {
		$rootScope.bet = {};
		hideWinners();
		if(gameInitialised) {
			endGame();
			moveDragonsToStartingPosition();
		}
		audio.stop();
	});
	//////////////////
	//////////////////
	var width = window.innerWidth;
	var height = window.innerHeight;
	var renderer = PIXI.autoDetectRenderer(width, height, { backgroundColor : 0x2290cd });
	var domContainer = document.getElementById('mainContainer');
	domContainer.appendChild(renderer.view);
	//////////////////
	var stage = new PIXI.Container();
	var container = new PIXI.Container();
	stage.addChild(container);
	//////////////////
	var loader = PIXI.loader;
	var audio = ngAudio.load('music/nyancat.mp3');
	audio.loop = true;
	//////////////////
	var texture, background, sunSprite, sunTween;
	var gameInitialised = false, gameWon = false, runLocally = false;
	var backgroundPosition = 0;
	var endGameTimeout, runGameTimeout;
	var animationFrame, dragonRes;
	var dragons = [], dragonCages = [], winningDragons = [];
	//////////////////
	var config = configService.loadConfig();
	var params = [];
	for(var i = 0; i < config.amountOfDragons; i++) {
		params.push(config.dragons[i]);
	}
	var animateBackground = config.animateBackground;
	//////////////////
	var maxDistance = width / config.maxStepsToTake;
	//////////////////
	var init = function() {
		try {
			loader.add('dragon', 'dragon/dragon.json');
			loader.once('complete', function(loader, res) {
				for (var i = stage.children.length - 1; i >= 0; i--) {
					stage.removeChild(stage.children[i]);
				};
				$rootScope.dragonRes = res.dragon.spineData;
				gameInitialised = true;
				finishInit();
			});
			loader.load();
		} catch(ex) {
			for (var i = stage.children.length - 1; i >= 0; i--) {
				stage.removeChild(stage.children[i]);
			};
			finishInit();
		}
	}
	//////////////////
	var finishInit = function() {
		config = configService.loadConfig();
		params = [];
		for(var i = 0; i < config.amountOfDragons; i++) {
			params.push(config.dragons[i]);
		}
		animateBackground = config.animateBackground;
		maxDistance = width / config.maxStepsToTake;
		dragons = [], dragonCages = [], winningDragons = [];
		setupBackground();
		setupDragons($rootScope.dragonRes);
		$ionicLoading.hide();
		// start audio
		audio.volume = config.volume;
		if(config.playMusic) {
    	audio.play();
		} else {
			audio.stop();
		}
		startGame();
	}
	//////////////////
	var setupBackground = function() {
		// add background to stage
		texture = PIXI.Texture.fromImage('img/Full.png');
		background = new PIXI.extras.TilingSprite(texture, width, 512); // stretch to full width
		background.position.y = height - 540; // place at bottom of stage
		stage.addChild(background);
		// add sun to staghe
		texture = PIXI.Texture.fromImage('img/sun.png');	
		sunSprite = new PIXI.Sprite(texture);
		// anchor center to we can rotate
		sunSprite.anchor.x = 0.5;
		sunSprite.anchor.y = 0.5;
		sunSprite.position.x = width;
		stage.addChild(sunSprite);
	}
	//////////////////
	var setupDragons = function(spineData) {
		var dragon, dragonCage, localRect;
		
		for(var i = 0; i < config.amountOfDragons; i++) {
			dragon = new PIXI.spine.Spine(spineData);
			localRect = dragon.getLocalBounds();
			//////////////////
			var myFilter = new PIXI.filters.ColorMatrixFilter();
			myFilter.hue(i * 35);
			dragon.filters = [myFilter];
			//////////////////
			dragon.skeleton.setToSetupPose();
			dragon.update(0);
			dragon.autoUpdate = true;
			// create a container for the spine animation and add the animation to it
			dragonCage = new PIXI.Container();
			dragonCage.addChild(dragon);
			dragonWidth = dragonCage.width;
			dragonHeight = dragonCage.height;
			// measure the spine animation and position it inside its container to align it to the origin
			dragon.position.set(-localRect.x, -localRect.y);
			// now we can scale, position and rotate the container as any other display object
			scale = Math.min((renderer.width * 0.2) / dragonCage.width, (renderer.height * 0.2) / dragonCage.height);
			dragonCage.scale.set(scale, scale);
			dragonCage.position.set(-(dragonCage.width), 10 + (height - 50) / config.amountOfDragons * i);
			// add the container to the stage
			stage.addChild(dragonCage);
			dragons.push(dragon);
			dragonCages.push(dragonCage);
		}
	}
	//////////////////
	var moveDragonsToStartingPosition = function() {
		// move dragons to starting position
		for(var i = 0; i < dragonCages.length; i++) {
			dragonCages[i].position.x = -(dragonCages[i].width);
		}
	}
	//////////////////
	var animate = function() {
		animationFrame = requestAnimationFrame(animate);
		renderer.render(stage);
		if(config.animateBackground && animateBackground) {
			backgroundPosition += config.animateBackgroundSpeed;
			background.tilePosition.x = -(backgroundPosition);
		}
	}
	//////////////////
	var startAnimatingDragons = function() {
		for(var i = 0; i < config.amountOfDragons; i++ ) {
			dragons[i].state.setAnimationByName(0, 'flying', true);
		}
	}
	//////////////////
	var stopAnimatingDragons = function() {
		for(var i = 0; i < config.amountOfDragons; i++ ) {
			dragons[i].state.setAnimationByName(0, 'flying', false);
		}
	}
	//////////////////
	var startAnimatingSun = function() {
		if(!sunTween) {
			sunTween = TweenLite.to(sunSprite, 60, { rotation: config.animateSunSpeed });
		} else {
			sunTween.restart();
		}
	}
	//////////////////
	var stopAnimatingSun = function() {
		if(sunTween) {
			sunTween.pause();
		}
	}
	//////////////////
	var startGame = function() {
		$ionicLoading.hide();
		gameWon = false;
		winningDragons = [];
		// move dragons to starting position
		moveDragonsToStartingPosition();
		// animate dragons up and down
		if(config.animateDragons) {
			startAnimatingDragons();
		}
		// start spinning sun
		if(config.animateSun) {
			startAnimatingSun();
		}
		// start animating background
		animateBackground = true;
		// start the actual animation frame
		animate();
		// run the game
		runGame();
	}
	//////////////////
	var runGame = function() {
		// duplicate params for safety
		var updateParams = JSON.parse(JSON.stringify({ items: params }));
		if(config.useOnlineService && !runLocally) {
			$http.post(config.simulatorUrl, updateParams).success(processGameResults).error(function() {
				runLocally = true;
				runGame();
			});
		} else {
			gameService.runDecisionSimulation(updateParams, processGameResults);
		}
	}
	//////////////////
	var processGameResults = function(json) {
		var results = json.results || json;
		for(var i = 0; i < results.length; i++) {
			// get the dragon
			var dragonName = results[i].name;
			var dragonRanking = results[i].position;
			// get the original dragons index
			var dragonIdx = configService.getDragonIndexByName(dragonName);
			// get the dragon cage based on the above indx
			var dragonCage = dragonCages[dragonIdx];
			// the higher the ranking, the more distance it will move
			var distance = (maxDistance / dragonRanking) * 1.2;
			var nextPosX =  dragonCage.position.x + distance;
			var t1 = new TweenLite.to(dragonCage.position, config.dragonTweenTime, { x: nextPosX })
			// var dragonBox = nextPosX + dragonCage.width;
			if(nextPosX >= width) {
				$ionicLoading.show({ template: 'We have a winner!<br/>Waiting for the game to end...' });
				if(winningDragons.indexOf(dragonName) === -1) {
					winningDragons.push(dragonName);
				}
				if(winningDragons.length.toString() === config.amountOfDragons.toString()) {
					gameWon = true;
				}
			}
		}
		if(!gameWon) {
			// rerun game, half the time it takes the dragon to move to keep things smooth
			runGameTimeout = setTimeout(function() {
				runGame();
			}, config.dragonTweenTime * 500);
		} else {
			endGameTimeout = $timeout(function() {
				// update scores
				config = configService.updateDragonsScores(winningDragons);
				// calculate new score
				if($scope.bet.dragonName === winningDragons[0]) {
					$rootScope.bet.pointsMade = $rootScope.bet.winAmount;
					config.playerScore += $rootScope.bet.pointsMade;
				} else {
					$rootScope.bet.pointsMade = -$rootScope.bet.betAmount;
					config.playerScore -= $rootScope.bet.pointsMade;
				}
				$rootScope.playerScore = config.playerScore;
				// used for game winner overlay
				$rootScope.winningDragons = winningDragons;
				$rootScope.showWinners = true;
				
				configService.saveConfig(config);
				// end game
				endGame();
			}, config.dragonTweenTime * 1000);
		}
	}
	//////////////////
	var endGame = function() {
		$ionicLoading.hide();
		clearTimeout(runGameTimeout);
		clearTimeout(endGameTimeout);
		stopAnimatingDragons();
		stopAnimatingSun();
		animateBackground = false;
		cancelAnimationFrame(animationFrame);
	}
	//////////////////
	var hideWinners = function() {
		$rootScope.winningDragons = '';
		$rootScope.showWinners = false;
	}
	//////////////////
	var resetGame = function() {
		hideWinners();
		endGame();
		$state.go('app.placebet');
	}
	//////////////////
	var viewStats = function() {
		hideWinners();
		endGame();
		$state.go('app.stats');
	}
	//////////////////
	//////////////////
	$rootScope.resetGame = resetGame;
	//////////////////
	$rootScope.viewStats = viewStats;
	//////////////////
});