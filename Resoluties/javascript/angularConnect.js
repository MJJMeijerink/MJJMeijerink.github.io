window.EsConnector = angular.module('EsConnector', ['elasticsearch', 'ngSanitize', 'rzModule'],
  ['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
  }]).filter('unsafe', function($sce) { return $sce.trustAsHtml; });

EsConnector.controller('QueryController', ['es', '$location', '$scope', function(results, $location, $scope) {
	
	function reset() {
		document.getElementsByClassName('no-results')[0].style.visibility = 'hidden';
		document.getElementsByClassName('load-more')[0].style.visibility = 'hidden';
		var res = document.getElementById('results');
		$scope.page = -1;
		$scope.results = [];
		$scope.allResults = false;
	}
	
	$scope.results = [];   
	$scope.page = -1;         
	$scope.allResults = false;  
	$scope.searchTerm = '';
	$scope.speakers = [];
	$scope.chartData = [];
	$scope.resultCount = 0;
	
	$scope.orderBy = ["Datum (asc)", "Datum (desc)", "Doc. lengte (asc)", "Doc. lengte (desc)"];
	
	$scope.selectedOrder = '';
	$scope.orderQuery = [];
	$scope.changeOrder = function(o) {
		if (o === null) {
			$scope.orderQuery = [];
			$scope.search();
		}else if (o == $scope.orderBy[0]) {
			var query = {date : {order : "asc"}};
			$scope.orderQuery = query;
			$scope.search();
		}else if (o == $scope.orderBy[1]) {
			var query = {date : {order : "desc"}};
			$scope.orderQuery = query;
			$scope.search();
		}else if (o == $scope.orderBy[2]) {
			var query = {_script: { type: "number", script: "doc['text'].values.size()", order: "asc"}}
			$scope.orderQuery = query;
			$scope.search();
		}else if (o == $scope.orderBy[3]) {
			var query = {_script: { type: "number", script: "doc['text'].values.size()", order: "desc"}}
			$scope.orderQuery = query;
			$scope.search();
		}
	}
	
	$scope.showText = function(id) {
		var el = document.getElementById("text" + id.toString());
		var el2 = document.getElementById("show" + id.toString());
		if (el.style.display == 'none') {
			el.style.display = 'initial'
			el2.innerHTML = "Hide full text..."
		}else {
			el.style.display = 'none'
			el2.innerHTML = "Show full text..."
		}
	}

	$scope.search = function() {
		reset();
		document.getElementsByClassName('no-results')[0].style.visibility = 'initial';
		document.getElementsByClassName('load-more')[0].style.visibility = 'initial';
		$scope.loadMore();
    };

	$scope.loadMore = function() {
		$scope.page += 1
		results.search($scope.searchTerm, $scope.page, $scope.slider.minValue, 
					$scope.slider.maxValue, $scope.selectedSpeakers, $scope.orderQuery).then(function(results) {
			$scope.tags = results.tags;
		    if (results.hits.length !== 10) {
			    $scope.allResults = true;
		    }

		    var ii = 0;
			$scope.results = [];
		    for (; ii < results.hits.length; ii++) {
			  $scope.results.push(results.hits[ii]);
		    }
			$scope.resultCount = results.hitCount;
		});
	};
	
	$scope.loadLess = function() {
		if (!($scope.page < 1)) {
			$scope.page -= 1
			results.search($scope.searchTerm, $scope.page, $scope.slider.minValue, 
						$scope.slider.maxValue, $scope.selectedSpeakers, $scope.orderQuery).then(function(results) {
				$scope.tags = results.tags;
				if (results.hits.length !== 10) {
					$scope.allResults = true;
				}

				var ii = 0;
				$scope.results = [];
				for (; ii < results.hits.length; ii++) {
				  $scope.results.push(results.hits[ii]);
				}
				$scope.resultCount = results.hitCount;
			});
		};
	};
	
	
	results.info().then(function(results) {
		var minVal = results.min_value;
		var maxVal = results.max_value;
		$scope.slider = {
			minValue: minVal,
			maxValue: maxVal,
			options: {
				floor: minVal,
				ceil: maxVal,
				step: 1,
				onEnd: function () {
					$scope.search();
				}
			}
		};
	});
	
	$scope.navigateSlider = function(dir) {
		if (dir == 'left') {
			$scope.slider2.value--
			drawPlot($scope.plotlyData, $scope.slider2.value)
		}else if (dir == 'right') {
			$scope.slider2.value++
			drawPlot($scope.plotlyData, $scope.slider2.value)
		}
	}
	
	$scope.plotlyData = false;
	$scope.loaded = true;
	var opened = true;
	$scope.loadData = function(){
		if (!$scope.plotlyData) {
			$scope.loaded = false;
			results.getAllData().then(function(results) {
				$scope.plotlyData = results;
				$scope.loaded = true;
				$scope.slider2 = {
					value: 0,
					options: {
						floor: 0,
						ceil: results.length - 1,
						translate: function(value) {
							return results[value].date + ", resolutie " + results[value].resolution
						},
						onEnd: function() {
							drawPlot($scope.plotlyData, $scope.slider2.value)
						}
					}
				}
				document.getElementById('plotControls').style.display = 'initial';
				drawPlot($scope.plotlyData, $scope.slider2.value)
			});
		}
		else {
			if (!opened) {
				drawPlot($scope.plotlyData, $scope.slider2.value);
				document.getElementById('plotControls').style.display = 'initial';
				opened = true;
			}else {
				document.getElementById('plotControls').style.display = 'none';
				document.getElementById('plot').innerHTML = '';
				opened = false;
			}
		}
	}
}]);


EsConnector.factory('es', ['$q', 'esFactory', '$location', function($q, elasticsearch, $location) {
  var client = elasticsearch({
    host: '86.85.152.188:9200'
  });
  var search = function(term, offset, min, max, speakers, sortQuery) {
			var stopW = stopwords;
			var regex = /[^\w\s]/gi;
			var term = term.replace(regex, '');
			var termList = term.toLowerCase().trim().split(' ')
			for (word in termList) {
				stopW.push(termList[word])
			}
			var deferred = $q.defer();
			var query = {
			    filtered: {
					query : {
						match : {
							text : term
						}
					}
				}
			};
			client.search({
			  index: 'names',
			  type: 'doc',
			  body: {
				size: 10,
				from: offset * 10,
				query: query,
				filter:{
					range : {
						year : {
							gte : min,
							lte : max
						}
					}
				},
				highlight : {
				  require_field_match: 'false',
				  pre_tags: ["<b>"],
				  post_tags: ["</b>"],
				  fields : {
				    text : {}
				  }
				},
				sort : sortQuery
			  }
			}).then(function(result) {
				console.log(result)
				var ii = 0, hits_in, hits_out = [];
				hits_in = (result.hits || {}).hits || [];
				var data = {}
				for(; ii < hits_in.length; ii++) {
					var ar = [];
					for (var x=0; x < hits_in[ii]['highlight'].text.length; x++) {
						ar.push(hits_in[ii]['highlight'].text[x])
					}
					var date = new Date(hits_in[ii]._source['date']);
					var options = {weekday: "long", year: "numeric", month: "long", day: "numeric"};
					//hits_in[ii]._source['names'] = hits_in[ii]._source['names'].filter(function(item,pos) {
					//	return hits_in[ii]._source['names'].indexOf(item) == pos;
					//})
					hits_in[ii]._source['date'] = date.toLocaleString("nl-NL", options);
					hits_in[ii]._source['id'] = hits_in[ii]._id
					hits_in[ii]._source['highlight'] = ar;
					hits_in[ii]._source['totalWords'] = hits_in[ii]._source.text.countWords() - 2;
					hits_out.push(hits_in[ii]._source);
				}
				data.hits = hits_out;
				data.hitCount = result.hits.total;
				deferred.resolve(data);
			}, deferred.reject);
			
			return deferred.promise;
	};
	
	var info = function() {
		var deferred = $q.defer();
			client.fieldStats({
				index : 'names',
				fields : ['year']
			}).then(function(result) {
			  var out = result.indices._all.fields.year
			  deferred.resolve(out);
			}, deferred.reject);
			
			return deferred.promise;
	};
	
	var getAllData = function(index) {
		var deferred = $q.defer();
		client.search({
			index: 'names',
			body: {
				query: {
					match_all: {}
				},
				size: 30000,
				sort: {date : {order : "asc"}}
			}
		}).then(function(result) {
			var ii = 0, hits_in, hits_out = [];
			hits_in = (result.hits || {}).hits || [];
			for(; ii < hits_in.length; ii++) {
				hits_out.push(hits_in[ii]._source);
			}
			deferred.resolve(hits_out);
		}, deferred.reject);
			
		return deferred.promise;
	};

    return {
		search: search,
		info: info,
		getAllData : getAllData
    };
}]);


String.prototype.countWords = function(){
  return this.split(/\s+/).length;
}