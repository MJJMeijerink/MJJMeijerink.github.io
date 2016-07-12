window.EsConnector = angular.module('EsConnector', ['elasticsearch', 'ngSanitize', 'rzModule'],
  ['$locationProvider', function($locationProvider) {
    $locationProvider.html5Mode(true);
  }]).filter('unsafe', function($sce) { return $sce.trustAsHtml; });

EsConnector.controller('QueryController', ['es', '$location', '$scope', function(results, $location, $scope) {
	
	$scope.results = [];   
	$scope.page = 0;         
	$scope.allResults = false;  
	$scope.searchTerm = '';
	$scope.speakers = [];
	
	results.getSpeakers().then(function(results){
		for (var ii = 0; ii < results.length; ii++) {
			$scope.speakers.push(results[ii]);
		}
		$scope.selectedSpeakers = $scope.speakers.slice();
	});
	$scope.orderBy = ["Relevance (default)", "Date (asc)", "Date (desc)"];
	
	$scope.selectedOrder = '';
	$scope.orderQuery = [];
	$scope.changeOrder = function(o) {
		if (o == $scope.orderBy[0]) {
			$scope.orderQuery = [];
			$scope.search();
		}else if (o == $scope.orderBy[1]) {
			var query = {year : {order : "asc"}};
			$scope.orderQuery = [query];
			$scope.search();
		}else if (o == $scope.orderBy[2]) {
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
		document.getElementsByClassName('no-results')[0].style.visibility = 'initial';
		document.getElementsByClassName('load-more')[0].style.visibility = 'initial';
		var res = document.getElementById('results');
		while (res.firstChild) {
			res.removeChild(res.firstChild);
		}
		$scope.page = 0;
		$scope.results = [];
		$scope.allResults = false;
		$scope.loadMore();
    };

	$scope.loadMore = function() {
		results.search($scope.searchTerm, $scope.page++, $scope.slider.minValue, 
					$scope.slider.maxValue, $scope.selectedSpeakers, $scope.orderQuery).then(function(results) {
		    draw(results, $scope.searchTerm, $scope.page);
		    if (results.length !== 10) {
			    $scope.allResults = true;
		    }

		    var ii = 0;

		    for (; ii < results.length; ii++) {
			  $scope.results.push(results[ii]);
		    }
		});
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
				step: 1
			}
		};
	});
	
}]);


EsConnector.factory('es', ['$q', 'esFactory', '$location', function($q, elasticsearch, $location) {
  var client = elasticsearch({
    host: 'https://p0ibqk3wzz:67dpxx06v0@thesis-8085233189.eu-west-1.bonsai.io'
  });
  var search = function(term, offset, min, max, speakers, sortQuery) {
			var deferred = $q.defer();
			var query = {
			    filtered: {
					query : {
						match : {
							_all : term
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
			  index: 'troonredes',
			  type: 'troonrede',
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
				sort : sortQuery
			  }
			}).then(function(result) {
				console.log(result)
				var ii = 0, hits_in, hits_out = [];
				hits_in = (result.hits || {}).hits || [];
			
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
				deferred.resolve(hits_out);
			}, deferred.reject);
			
			return deferred.promise;
	};
	
	var info = function() {
		var deferred = $q.defer();
			client.fieldStats({
				index : 'troonredes',
				fields : ['year']
			}).then(function(result) {
			  var out = result.indices._all.fields.year
			  deferred.resolve(out);
			}, deferred.reject);
			
			return deferred.promise;
	};
	
	var getSpeakers = function() {
		var deferred = $q.defer();
			client.search({
			    index: 'troonredes',
				  body: {
					query: {
					  match_all: {}
					},
					aggs: {
					  tags: {
						terms: {
						  field: 'speaker'
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

  return {
	search: search,
	info: info,
	getSpeakers : getSpeakers
  };
  
}]);


function draw(hits, term, page) {
	var termList = term.toLowerCase().trim().split(' ')
	for (var hit = 0; hit < hits.length; hit++) {
		hits[hit].text
		var data = [];
		var lines = hits[hit].sentences
		//console.log(hits[hit].year)
		for (var t in termList) {
			for (var sent in lines) {
				var s = lines[sent].join(' ');
				if (s.indexOf(termList[t]) > 0) {
					//console.log(s)
					d = {};
					d.len = termList[t].length / s.length;
					d.SPOS = lines.indexOf(lines[sent]) / lines.length;
					d.TPOS = (s.indexOf(termList[t]) - 1) / s.length;
					d.height = 1 / lines.length;
					d.sentence = s;
					d.sIndex = lines.indexOf(lines[sent]) + 1
					data.push(d);
					var linesLength = lines.length;
				}
			}
		}
		var height = 400;
		var width = 250;
		
		var div = d3.select("#results").append("div").attr("class", "resultVis");
		var title = div.append("p").html("Troonrede van " + hits[hit].year.toString() + " - " + hits[hit].speaker);
		
		var svg = div.append("svg")
			.attr("width", width).attr("height", height)
		
		var tip = d3.tip()
		    .attr('class', 'd3-tip')
		    .offset([-10, 0])
		    .html(function(d) {
				return "<p>Sentence #" + d.sIndex + "<br><br>" + d.sentence + "</p>";
		    })
		svg.call(tip);
		
		svg.append("rect")
			.attr("width", "100%")
			.attr("height", "100%")
			.style("stroke", "black")
			.style("stroke-location", "outside")
			.style("fill", "none")
			.style("stroke-width", 4);
		
		for (var i = 0; i < linesLength; i++) {
			svg.append("line")
				.style("stroke", "black")
				.style("opacity", 0.5)
				.attr("x1", 0)
				.attr("y1", (i / linesLength) * height)
				.attr("x2", width)
				.attr("y2", (i / linesLength) * height);
		}
		
		var d = [{'id' : hits[hit].id}];
		svg.selectAll("rect.background").data(d).enter().append("rect")
			.attr("width", "100%")
			.attr("height", "100%")
			.on("click", function(d){
				var modal = document.getElementById('modal' + d.id.toString());
				modal.style.display = "block";
				var close = document.getElementById('close' + d.id.toString());
				close.onclick = function() {
					modal.style.display = "none";
				}
			})
			.style("fill", "steelblue")
			.style("opacity", 0.1)
			.append("svg:title")
				.text("Click for more information");;
		
		svg.selectAll("rect.location")
			.data(data)
			.enter()
			.append("rect")
			.attr("class", "rectangle")
			.attr("x", function(d) { return (d.TPOS * width) })
			.attr("y", function(d) { return (d.SPOS * height) })
			.attr("width", function(d) {return (d.len * 100).toString() + '%'}) 
			.attr("height", function(d) {return (d.height * 100).toString() + '%'})
			.on('mouseover', tip.show)
			.on('mouseout', tip.hide)
			.style("fill", "steelblue")			
			.style("stroke", "black")
			.style("stroke-location", "outside")
			.style("stroke-width", 1);
	}
}

String.prototype.countWords = function(){
  return this.split(/\s+/).length;
}