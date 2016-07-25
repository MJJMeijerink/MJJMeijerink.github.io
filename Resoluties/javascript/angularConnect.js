window.EsConnector = angular.module('EsConnector', ['elasticsearch', 'ngSanitize', 'rzModule'],
  ['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
  }]).filter('unsafe', function($sce) { return $sce.trustAsHtml; });

EsConnector.controller('QueryController', ['es', '$location', '$scope', function(results, $location, $scope) {
	
	if (window.innerWidth < 1000) {
		document.getElementById('container').style.width  = "804px";
		document.getElementById('slider').style.width = "804px";
	}else if (window.innerWidth < 1140) {
		document.getElementById('container').style.width  = "1024px";
		document.getElementById('slider').style.width = "1024px";
	}
	
	function reset() {
		document.getElementsByClassName('no-results')[0].style.visibility = 'hidden';
		document.getElementsByClassName('load-more')[0].style.visibility = 'hidden';
		var res = document.getElementById('results');
		$scope.page = 0;
		$scope.results = [];
		$scope.allResults = false;
	}
	
	$scope.results = [];   
	$scope.page = 0;         
	$scope.allResults = false;  
	$scope.searchTerm = '';
	$scope.speakers = [];
	$scope.chartData = [];
	$scope.resultCount = 0;
	
	$scope.orderBy = ["Date (asc)", "Date (desc)", "Doc size (asc)", "Doc size (desc)"];
	
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
			$scope.tags = results.tags;
		    if (results.hits.length !== 10) {
			    $scope.allResults = true;
		    }

		    var ii = 0;

		    for (; ii < results.hits.length; ii++) {
			  $scope.results.push(results.hits[ii]);
		    }
			$scope.resultCount = results.hitCount;
		});
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
}]);


EsConnector.factory('es', ['$q', 'esFactory', '$location', function($q, elasticsearch, $location) {
  var client = elasticsearch({
    host: '86.85.152.188:9200'
  });
  var search = function(term, offset, min, max, speakers, sortQuery, index, type) {
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
					var date = new Date(hits_in[ii]._source['date']);
					var options = {weekday: "long", year: "numeric", month: "long", day: "numeric"};
					hits_in[ii]._source['names'] = hits_in[ii]._source['names'].filter(function(item,pos) {
						return hits_in[ii]._source['names'].indexOf(item) == pos;
					})
					hits_in[ii]._source['date'] = date.toLocaleString("nl-NL", options);
					hits_in[ii]._source['id'] = hits_in[ii]._id
					hits_in[ii]._source['highlight'] = ar;
					hits_in[ii]._source['totalWords'] = hits_in[ii]._source.text.countWords() - 2;
					hits_out.push(hits_in[ii]._source);
				}
				data.hits = hits_out;
				data.hitCount = result.hits.total;
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
				index : 'names',
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
		document.getElementById('slider').style.width = "804px";
	}else if (window.innerWidth < 1300 && window.innerWidth > 1139) {
		document.getElementById('container').style.width  = "1024";
		document.getElementById('slider').style.width = "1024px";
	}else if (window.innerWidth > 1299) {
		document.getElementById('container').style.width  = "1140px";
		document.getElementById('slider').style.width = "1140px";
	}
}