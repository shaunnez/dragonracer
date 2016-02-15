angular.module('dragonrace.services', [])

.service('configService', function($window) {
	//////////////////
	var localStorageName = 'dragonrace';
	//////////////////
	var config = {
		playerName: 'New Player',
		playerScore: 100,
		animateBackgroundSpeed: 1,
		animateSunSpeed: 4,
		animateBackground: true,
		animateDragons: true,
		animateSun: true,
		playMusic: true,
		useOnlineService: false,
		amountOfDragons: 5,
		maxStepsToTake: 5,
		dragonTweenTime: 2,
		volume: 1,
		simulatorUrl: 'http://localhost:9000/api/decision/runDecisionSimulation',
		dragons: [{
			name: 'Raswarum',
			weight: 1,
			score: 0,
			positions: []
		}, {
			name: 'Worturim',
			weight: 1,
			score: 0,
			positions: []
		}, {
			name: 'Bhakris',
			weight: 1,
			score: 0,
			positions: []
		}, {
			name: 'Sulgrax',
			weight: 1,
			score: 0,
			positions: []
		}, {
			name: 'Vyrarinn',
			weight: 1,
			score: 0,
			positions: []
		}, {
			name: 'Nerroth',
			weight: 1,
			score: 0,
			positions: []
		}, {
			name: 'Lennalth',
			weight: 1,
			score: 0,
			positions: []
		}, {
			name: 'Meseth',
			weight: 1,
			score: 0,
			positions: []
		}, {
			name: 'Valstrath',
			weight: 1,
			score: 0,
			positions: []
		}, {
			name: 'Rylarth',
			weight: 1,
			score: 0,
			positions: []
		}]
	}
	//////////////////
	var backupConfig = JSON.stringify(config);
	//////////////////
	var resetConfig = function(obj) {
		return saveConfig(JSON.parse(backupConfig));
	}
	//////////////////
	var resetScores = function(obj) {
		for(var i = 0; i < config.dragons.length; i++) {
			var dragon = config.dragons[i];
			dragon.score = 0;
		}
		return saveConfig(config);
	}
	//////////////////
	var loadConfig = function() {
		if($window.localStorage) {
			try {
				var storedData = JSON.parse($window.localStorage.getItem(localStorageName));
				// update local config with stored data config by matching key names
				for(var k in storedData) {
					if(config[k] && storedData[k]) {
						config[k] = storedData[k];
					}
				} 
			} catch(ex) {
				// oh well
			}
		}
		return config;
	}
	//////////////////
	var saveConfig = function(obj) {
		if($window.localStorage) {
			// update local config with json object passed in - match key names 
			for(var k in obj) {
				if(config[k] && obj[k]) {
					config[k] = obj[k];
				}
			}
			$window.localStorage.setItem(localStorageName, JSON.stringify(config));
			return loadConfig();
		}
	}
	//////////////////
	var getDragonIndexByName = function(name) {
		var idx = -1;
		for(var i = 0; i < config.dragons.length; i++) {
			if(config.dragons[i].name === name) {
				idx = i;
				break;
			}
		}
		return idx;
	}
	//////////////////
	var getDragonByName = function(name) {
		var dragon;
		for(var i = 0; i < config.dragons.length; i++) {
			if(config.dragons[i].name === name) {
				dragon = config.dragons[i];
				break;
			}
		}
		return dragon;
	}
	//////////////////
	// first = 100, second = 50, third = 33, fourth = 25, fifth = 20
	var updateDragonsScores = function(dragonNames) {
	  var score;
		for(var i = 0; i < dragonNames.length; i++) {
			score = Math.round(100 / (i + 1));
			if(score < 20) {
				score = 0;
			}
			var dragon = getDragonByName(dragonNames[i]);
			if(dragon) {
				dragon.score += score;
				dragon.positions.push(i + 1);
			}
		}
		return saveConfig();
	}
	
	//////////////////
	return {
		resetConfig: resetConfig,
		resetScores: resetScores,
		loadConfig: loadConfig,
		saveConfig: saveConfig,
		getDragonIndexByName: getDragonIndexByName,
		updateDragonsScores: updateDragonsScores
	};
})

//////////////////
.service('gameService', function() {
	//////////////////
	var runDecisionSimulation = function(json, callback) {
	  startDecisionSimulation(json.items, function(result) {
	    callback(result);  
	  });
	};
	//////////////////
	function startDecisionSimulation(items, callback) {
	  var result = {};
	  simulate(items, [], function(resultList) {
	    result.results = resultList;
	    return callback(result);
	  });
	};
	//////////////////
	function simulate(items, resultList, callback) {
	  if (items.length == 1) {
	    resultList.push({
	      'name': items[0].name,
	      'position': resultList.length + 1
	    });
	    return callback(resultList);
	  }

	  var totalWeight = calculateTotalWeight(items);
	  var portions = {};

	  for (var i = 0; i < items.length; i++) {
	    if (i === 0) {
	      portions[items[i].name] = items[i].weight
	    } else {
	      portions[items[i].name] = items[i].weight + portions[items[i - 1].name];
	    }
	  }

	  var randomNumber = getRandomNumber(1, totalWeight);
	  var result = {};
	  result.random = randomNumber + ' from range:  1-' + totalWeight;
	  result.portions = portions;
	  result.winner = determineWinner(portions, randomNumber);

	  resultList.push({
	    'name': result.winner,
	    'position': resultList.length + 1
	  });
	  removeWinner(result.winner, items);
	  setTimeout(function() {
	    simulate(items, resultList, callback);
	  }, 0);
	}
	//////////////////
	function removeWinner(winner, items) {
	  for (var i = 0; i < items.length; i++) {
	    if (items[i].name === winner) {
	      items.splice(i, 1);
	    }
	  };
	}
	//////////////////
	function calculateTotalWeight(items) {
	  var totalWeight = 0;
	  for (var i = 0; i < items.length; i++) {
	    totalWeight += items[i].weight;
	  };
	  return totalWeight;
	}
	//////////////////
	function determineWinner(portions, random) {
	  for (var i in portions) {
	    if (random <= portions[i]) {
	      return i;
	    };
	  }
	}
	//////////////////
	function getRandomNumber(minRange, maxRange) {
	  return _.random(minRange, maxRange);
	}
	//////////////////
	return {
		runDecisionSimulation: runDecisionSimulation
	}
	//////////////////
})