window.EsConnector = angular.module('EsConnector', ['elasticsearch', 'ngSanitize', 'rzModule'],
  ['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
  }]).filter('unsafe', function($sce) { return $sce.trustAsHtml; });

EsConnector.controller('QueryController', ['es', '$location', '$scope', function(results, $location, $scope) {
	
	if (window.innerWidth < 1000) {
		document.getElementById('container').style.width  = "804px";
		document.getElementById('slider').style.width = "450px";
	}else if (window.innerWidth < 1140) {
		document.getElementById('container').style.width  = "1024";
		document.getElementById('slider').style.width = "650px";
	}
	
	function reset() {
		$scope.tags = [];
		$scope.drawCloud($scope.tags);
		document.getElementsByClassName('no-results')[0].style.visibility = 'hidden';
		document.getElementsByClassName('load-more')[0].style.visibility = 'hidden';
		document.getElementById("chart").style.display = 'none';
		d3.select('#chart').html("");
		$scope.chartData = [];
		var res = document.getElementById('results');
		while (res.firstChild) {
			res.removeChild(res.firstChild);
		}
		$scope.page = 0;
		$scope.results = [];
		$scope.allResults = false;
	}

	$scope.index = 'troonredes';
	$scope.type = 'troonrede';
	$scope.selectedIndex = 'Troonredes'
	$scope.changeIndex = function(index) {
		reset();
		$scope.searchTerm = '';
		$scope.speakers = [];
		if (index == 'unions') {
			$scope.selectedIndex = 'State of the Union Adresses'
			$scope.index = index;
			$scope.type = 'union';
			results.info($scope.index).then(function(results) {
				var minVal = results.min_value;
				var maxVal = results.max_value;
				$scope.slider = {
					minValue: minVal,
					maxValue: maxVal,
					options: {
						floor: minVal,
						ceil: maxVal,
						step: 1
					}
				};
			});
			results.getSpeakers($scope.index).then(function(results){
				for (var ii = 0; ii < results.length; ii++) {
						$scope.speakers.push(results[ii]);
					}
				$scope.selectedSpeakers = $scope.speakers.slice();
			});
		}
		else if (index == 'troonredes'){
			$scope.selectedIndex = 'Troonredes'
			$scope.index = index;
			$scope.type = 'troonrede';
			results.info($scope.index).then(function(results) {
				var minVal = results.min_value;
				var maxVal = results.max_value;
				$scope.slider = {
					minValue: minVal,
					maxValue: maxVal,
					options: {
						floor: minVal,
						ceil: maxVal,
						step: 1
					}
				};
			});
			results.getSpeakers($scope.index).then(function(results){
				for (var ii = 0; ii < results.length; ii++) {
						$scope.speakers.push(results[ii]);
					}
				$scope.selectedSpeakers = $scope.speakers.slice();
			});
		}
	}
	
	$scope.results = [];   
	$scope.page = 0;         
	$scope.allResults = false;  
	$scope.searchTerm = '';
	$scope.speakers = [];
	$scope.chartData = [];
	
	results.getSpeakers($scope.index).then(function(results){
		for (var ii = 0; ii < results.length; ii++) {
			$scope.speakers.push(results[ii]);
		}
		$scope.selectedSpeakers = $scope.speakers.slice();
	});
	
	$scope.orderBy = ["Date (asc)", "Date (desc)"];
	
	$scope.selectedOrder = '';
	$scope.orderQuery = [];
	$scope.changeOrder = function(o) {
		if (o === null) {
			$scope.orderQuery = [];
			$scope.search();
		}else if (o == $scope.orderBy[0]) {
			var query = {year : {order : "asc"}};
			$scope.orderQuery = [query];
			$scope.search();
		}else if (o == $scope.orderBy[1]) {
			var query = {year : {order : "desc"}};
			$scope.orderQuery = [query];
			$scope.search();
		}
	}
	
	$scope.toggleSelection = function toggleSelection(speaker) {
		var idx = $scope.selectedSpeakers.indexOf(speaker);
		
		if (idx > -1) {
		  $scope.selectedSpeakers.splice(idx, 1);
		}
		else {
		  $scope.selectedSpeakers.push(speaker);
		}
		$scope.search();
	}

	$scope.$on("slideEnded", function() {
		$scope.search();
	});

	$scope.search = function() {
		reset();
		document.getElementsByClassName('no-results')[0].style.visibility = 'initial';
		document.getElementsByClassName('load-more')[0].style.visibility = 'initial';
		$scope.loadMore();
    };

	$scope.loadMore = function() {
		results.search($scope.searchTerm, $scope.page++, $scope.slider.minValue, 
					$scope.slider.maxValue, $scope.selectedSpeakers, $scope.orderQuery, $scope.index, $scope.type).then(function(results) {
		    draw(results.hits, $scope.searchTerm, $scope.page, $scope.index);
			$scope.tags = results.tags;
		    if (results.hits.length !== 10) {
			    $scope.allResults = true;
		    }

		    var ii = 0;

		    for (; ii < results.hits.length; ii++) {
			  $scope.results.push(results.hits[ii]);
		    }
		});
		var regex = /[^\w\s]/gi;
		var term = $scope.searchTerm.replace(regex, '');
		var termList = term.toLowerCase().trim().split(' ')
		for (term in termList) {
			results.barChartData(termList[term], $scope.slider.minValue, 
					$scope.slider.maxValue, $scope.selectedSpeakers, $scope.index, $scope.type).then(function(results) {
				$scope.chartData = $scope.chartData.concat(results);
			});
		}
		
	};
	
	results.info($scope.index).then(function(results) {
		var minVal = results.min_value;
		var maxVal = results.max_value;
		$scope.slider = {
			minValue: minVal,
			maxValue: maxVal,
			options: {
				floor: minVal,
				ceil: maxVal,
				step: 1
			}
		};
	});
	
	$scope.drawCloud = function() {
		wordCloud($scope.tags);
	}
	
	var current = '';
	$scope.drawCharts = function(kind) {
		console.log(current)
		if ($scope.chartData.length > 1) {
			document.getElementById("chart").style.display = 'initial';
			d3.select('#chart').html("");
			if (kind == 1) {
				if (current == 'per year') {
					d3.select('#chart').html("");
					document.getElementById("chart").style.display = 'none';
					current = '';
				}else {
					current = 'per year';
				}
				barChart1($scope.chartData, $scope.slider.minValue, $scope.slider.maxValue);
			}else if (kind == 2) {
				if (current == 'per speaker') {
					d3.select('#chart').html("");
					document.getElementById("chart").style.display = 'none';
					current = '';
				}else {
					current = 'per speaker';
				}
				barChart2($scope.chartData, $scope.speakers)
			}
		}
	}
}]);


EsConnector.factory('es', ['$q', 'esFactory', '$location', function($q, elasticsearch, $location) {
  var client = elasticsearch({
    host: '86.85.152.188:9200'
  });
  var search = function(term, offset, min, max, speakers, sortQuery, index, type) {
			var stopW = stopwords[index].splice(-1, 1);
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
					},
					filter: {
						terms: {
							speaker : speakers
						}
					}
				}
			};
			client.search({
			  index: index,
			  type: type,
			  body: {
				size: 10,
				from: (offset || 0) * 10,
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
				aggs : {
					tagcloud : {
						terms : {
							field : "text",
							size : 100,
							exclude : stopW
						}
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
					hits_in[ii]._source['id'] = hits_in[ii]._id
					hits_in[ii]._source['highlight'] = ar;
					hits_in[ii]._source['totalWords'] = hits_in[ii]._source.text.countWords() - 2;
					hits_out.push(hits_in[ii]._source);
				}
				data.hits = hits_out;
				var aggs = result.aggregations.tagcloud.buckets;
				var tags = [];
				for (var i= 0; i<aggs.length; i++) {
					if (aggs[i].doc_count < result.hits.total *0.9){
						tags.push(aggs[i]);
					}
				}
				data.tags = tags;
				deferred.resolve(data);
			}, deferred.reject);
			
			return deferred.promise;
	};
	
	var info = function(index) {
		var deferred = $q.defer();
			client.fieldStats({
				index : index,
				fields : ['year']
			}).then(function(result) {
			  var out = result.indices._all.fields.year
			  deferred.resolve(out);
			}, deferred.reject);
			
			return deferred.promise;
	};
	
	var getSpeakers = function(index) {
		var deferred = $q.defer();
		client.search({
			index: index,
			  body: {
				query: {
				  match_all: {}
				},
				aggs: {
				  tags: {
					terms: {
					  field: 'speaker',
					  size : 41
					},
					aggs : {
					  statistics : { stats : { field : "year"}}
					}
				  }
				}
			}
		}).then(function(result) {
			function compare(a,b) {
				if (a.statistics.avg < b.statistics.avg)
					return -1;
				if (a.statistics.avg > b.statistics.avg)
					return 1;
				return 0;
			}
			var ii = 0, hits_in, hits_out = [];
			hits_in = result.aggregations.tags.buckets.sort(compare)

			for(; ii < hits_in.length; ii++) {
				hits_out.push(hits_in[ii].key);
			  }
			  deferred.resolve(hits_out);
			}, deferred.reject);
			
			return deferred.promise;
	};
	
	var barChartData = function(term, min, max, speakers, index, type) {
		var deferred = $q.defer();
		var query = {
			filtered: {
				query : {
					match : {
						text : term
					}
				},
				filter: {
					terms: {
						speaker : speakers
					}
				}
			}
		};
		client.search({
			  index: index,
			  type: type,
			  body: {
				size: 1000,
				query: query,
				filter:{
					range : {
						year : {
							gte : min,
							lte : max
						}
					}
				},
				script_fields: {
					tf: {
					  script: "_index['text']['" + term + "'].tf()"
					},
					year: {
					  script: "_doc['year'].value"
					},
					speaker : {
					  script: "_doc['speaker'].value"
					}
				}
			  }
			}).then(function(result) {
				var ii = 0, hits_in, data = [];
				hits_in = result.hits.hits;
				
				for(; ii < hits_in.length; ii++) {
					data.push(hits_in[ii].fields)
			    }
				deferred.resolve(data);
			}, deferred.reject);
			
			return deferred.promise;
	};

  return {
	search: search,
	info: info,
	getSpeakers : getSpeakers,
	barChartData: barChartData
  };
  
}]);


String.prototype.countWords = function(){
  return this.split(/\s+/).length;
}

window.onresize = function() {
	if (window.innerWidth<1140) {
		document.getElementById('container').style.width  = "804px";
		document.getElementById('slider').style.width = "450px";
	}else if (window.innerWidth < 1300 && window.innerWidth > 1139) {
		document.getElementById('container').style.width  = "1024";
		document.getElementById('slider').style.width = "650px";
	}else if (window.innerWidth > 1299) {
		document.getElementById('container').style.width  = "1140px";
		document.getElementById('slider').style.width = "750px";
	}
}