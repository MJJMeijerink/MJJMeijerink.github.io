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

	$scope.index = 'troonredes';
	$scope.type = 'troonrede';
	$scope.selectedIndex = 'Troonredes'
	$scope.changeIndex = function(index) {
		document.getElementsByClassName('no-results')[0].style.visibility = 'hidden';
		document.getElementsByClassName('load-more')[0].style.visibility = 'hidden';
		var res = document.getElementById('results');
		while (res.firstChild) {
			res.removeChild(res.firstChild);
		}
		$scope.page = 0;
		$scope.results = [];
		$scope.allResults = false;
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
		$scope.drawCloud($scope.tags);
		document.getElementsByClassName('no-results')[0].style.visibility = 'initial';
		document.getElementsByClassName('load-more')[0].style.visibility = 'initial';
		document.getElementById('word').style.display = 'initial';
		var res = document.getElementById('results');
		while (res.firstChild) {
			res.removeChild(res.firstChild);
		}
		$scope.page = 0;
		$scope.results = [];
		$scope.allResults = false;
		$scope.loadMore();
		$scope.drawCloud($scope.tags);
    };

	$scope.loadMore = function() {
		results.search($scope.searchTerm, $scope.page++, $scope.slider.minValue, 
					$scope.slider.maxValue, $scope.selectedSpeakers, $scope.orderQuery, $scope.index, $scope.type).then(function(results) {
		    draw(results.hits, $scope.searchTerm, $scope.page, $scope.index);
			$scope.tags = results.tags
			console.log($scope.tags)
		    if (results.hits.length !== 10) {
			    $scope.allResults = true;
		    }

		    var ii = 0;

		    for (; ii < results.hits.length; ii++) {
			  $scope.results.push(results.hits[ii]);
		    }
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
	
	$scope.drawCloud = function() {
		wordCloud($scope.tags);
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

  return {
	search: search,
	info: info,
	getSpeakers : getSpeakers
  };
  
}]);


function draw(hits, term, page, index) {
	var stopW = stopwords[index]
	var regex = /[^\w\s]/gi;
	var term = term.replace(regex, '');
	var termList = term.toLowerCase().trim().split(' ')
	for (var hit = 0; hit < hits.length; hit++) {
		hits[hit].text
		var data = [];
		var lines = hits[hit].sentences
		//console.log(hits[hit].year)
		for (var t in termList) {
			searchTerm = termList[t];
			if (stopW.indexOf(searchTerm) == -1){
				for (var sent in lines) {
					var s = lines[sent].join(' ').toLowerCase()  ;
					if (s.indexOf(searchTerm) > 0) {
						var matches = getMatchIndexes(s, searchTerm)
						for (idx in matches){
							var i =  matches[idx]
							var before = s[i-1]
							var after = s[i+searchTerm.length]
							if (regex.test(before) || before == ' ') {
								if (regex.test(after) || after == ' ') {
									d = {};
									d.len = searchTerm.length / s.length;
									d.SPOS = lines.indexOf(lines[sent]) / lines.length;
									d.TPOS = (i - 1) / s.length;
									d.height = 1 / lines.length;
									d.sentence = s;
									d.sIndex = lines.indexOf(lines[sent]) + 1
									data.push(d);
									var linesLength = lines.length;
								}
							}					
						}
					}
				}
			}
		}
		var height = 400;
		var width = 250;
		
		var div = d3.select("#results").append("div").attr("class", "resultVis");
		var title = div.append("p").style('text-align', 'center')
					.html(hits[hit].title + "<br>" + hits[hit].speaker);
		
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
				.style('stroke-width', 0.5)
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

function getMatchIndexes(str, toMatch) {
    var toMatchLength = toMatch.length,
        indexMatches = [], match,
        i = 0;
    
    while ((match = str.indexOf(toMatch, i)) > -1) {
        indexMatches.push(match);
        i = match + toMatchLength;
    }
    
    return indexMatches;
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