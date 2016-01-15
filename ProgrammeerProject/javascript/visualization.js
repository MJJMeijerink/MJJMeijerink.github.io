function ready() { // Load SVG before doing ANYTHING

	var variables = ['Violent crime rate', 'Forcible rape rate', 'Robbery rate', 'Aggravated assault rate', 'Murder rate',
					'Property crime rate', 'Burglary rate', 'Larceny-theft rate', 'Motor vehicle theft rate', 'Unemployment', 'Guns per household']
	
	for (v in variables) {
		document.getElementById(variables[v]).checked = false;
	}
	document.getElementById('slider').min = 0;
	document.getElementById('slider').max = 0;
	
	var w = 300, h = 60;
	var parent = d3.select("#SVG").append("svg").attr("id", "parent").attr("width", '90%').attr("height", h);
	var legend = parent.append("defs").append("svg:linearGradient").attr("id", "gradient").attr("x1", "100%").attr("y1", "0%").attr("x2", "0%").attr("y2", "0%");
	legend.append("stop").attr("offset", "0%").attr("stop-color", '#00441b').attr("stop-opacity", 1);
	legend.append("stop").attr("offset", "100%").attr("stop-color", '#f7fcf5').attr("stop-opacity", 1);

	var data;
	var loadData = new XMLHttpRequest();
	loadData.onload = dataLoaded;
	loadData.open("get", "data/data.json", true);
	loadData.send();
	
	function dataLoaded(){
		var data = JSON.parse(this.responseText);
		
		for (var i = 0; i < Object.keys(states).length; i++) {
			var state = d3.select('#' + Object.keys(states)[i]);
			state.on('click', function(){goTo(variables, this, data);}).attr('class', 'state');
		}	
	
		slider = document.getElementById('slider')
		
		d3.selectAll('.radButton').on('click', function () {
			if (~this.id.indexOf('rate')) { //http://stackoverflow.com/a/1789952
				slider.min = 1960;
				slider.max = 2012;
			}else if (this.id == 'Unemployment') {
				slider.min = 1976;
				slider.max = 2015;
			}else {
				slider.min = 0;
				slider.max = 2;
			}
			drawMap(this.id, data, slider, w, h, legend, parent, false);
			if ($('#graph').is(':visible')) {
				back();
			}
		});

		slider.oninput = function () {
			for (x in variables) {
				if (document.getElementById(variables[x]).checked) {
					v = document.getElementById(variables[x])
				}
			}
			if (slider.max > 0) {
				drawMap(v.id, data, slider, w, h, legend, parent, true);
			}
			if (slider.value > 1950) {
				document.getElementById('sliderText').innerHTML = 'Year: ' + slider.value;
			}else if (slider.value == 2) {
				document.getElementById('sliderText').innerHTML = 'Year: 2001 - 2010';
			}else if (slider.value == 1) {
				document.getElementById('sliderText').innerHTML = 'Year: 1991 - 2000';
			}else if (slider.value == 0 && slider.max > 0) {
				document.getElementById('sliderText').innerHTML = 'Year: 1981 - 1990';
			}
		}
		
		var tooltip = d3.select('#map').append('g')
				.attr('id', 'tooltip').style('display', 'none');
			tooltip.append('rect').attr('id', 'tooltipRect').attr('height', '10px').attr('width', 0)
				.style('fill', '#FFF')
				.style('stroke', '#000').style('stroke-width', 0.5);
			tooltip.append('text').attr('id', 'tooltipText1').attr('font-size', 3);
			tooltip.append('text').attr('id', 'tooltipText2').attr('font-size', 3);
		
		d3.selectAll('.state')
			.on('mouseover', function(){
				d3.select(this).style('cursor', 'hand').style('cursor', 'pointer').style('stroke-width', 0.6);
				this.parentNode.appendChild(this);
				var labels = document.getElementById('labels')
				labels.parentNode.appendChild(labels);
				var tTip = document.getElementById('tooltip');
				tTip.parentNode.appendChild(tTip);
				tooltip.style('display', 'initial');
			}).on('mouseout', function(){
				d3.select(this).style('stroke-width', 0.28222218).style('fill-opacity', 1);
				tooltip.style('display', 'none')
			}).on('mousemove', function() {
				var el = this;
				var mouse = d3.mouse(this);
				for (x in variables) {
					if (document.getElementById(variables[x]).checked) {
						var variable = document.getElementById(variables[x])
					}
				}
				if (mouse[0] < 135) {
					d3.select('#tooltipRect').attr('x', mouse[0] + 2).attr('y', mouse[1] - 12);
					d3.select('#tooltipText1').text(function(){
						return states[el.id];
					}).attr('x', mouse[0] + 4).attr('y', mouse[1]-8);
					d3.select('#tooltipText2').text(function(){
						if (variable == undefined) {return '-'}
						else if (variable.id == 'Guns per household') {
							if (slider.value == 0) {return data[0][states[el.id]][variable.id]['1981 - 1990'];}
							else if (slider.value == 1) {return data[0][states[el.id]][variable.id]['1991 - 2000'];}
							else return data[0][states[el.id]][variable.id]['2001 - 2010'];
						}
						else {
							return data[0][states[el.id]][variable.id][slider.value];
						}
					}).attr('x', mouse[0] + 4).attr('y', mouse[1]-4.5);
					var textWidth = document.getElementById('tooltipText1').getComputedTextLength();
					d3.select('#tooltipRect').attr('width', textWidth + 5)
				} else {
					var text1 = d3.select('#tooltipText1')
					text1.text(function(){
						return states[el.id];
					});
					var textWidth = document.getElementById('tooltipText1').getComputedTextLength();
					d3.select('#tooltipRect').attr('x', mouse[0] - textWidth - 6).attr('y', mouse[1] - 12);
					d3.select('#tooltipText2').text(function(){
						if (variable == undefined) {return '-'}
						else if (el.id == 'DC') {
							return 'NaN'
						}
						else if (variable.id == 'Guns per household') {
							if (slider.value == 0) {return data[0][states[el.id]][variable.id]['2001 - 2010'];}
							else if (slider.value == 1) {return data[0][states[el.id]][variable.id]['1991 - 2000'];}
							else return data[0][states[el.id]][variable.id]['1981 - 1990'];
						}
						else {
							return data[0][states[el.id]][variable.id][slider.value];
						}
					}).attr('x', mouse[0] - textWidth - 4).attr('y', mouse[1]-4.5);
					d3.select('#tooltipRect').attr('width', textWidth + 5)
					text1.attr('x', mouse[0] - textWidth - 4).attr('y', mouse[1]-8);
				}
			});
	}
	
}

function goTo(variables, state, data) {
	if (state.id != 'DC') {
		if (!$('#graph').is(':visible')) {
			var parent = document.getElementById("graph");
			var canvas = document.createElement('canvas');
			canvas.id = 'chart';
			parent.appendChild(canvas);
		}else {
			var parent = document.getElementById('graph');
			var canvas = document.getElementById('chart');
			parent.removeChild(canvas);
			var parent = document.getElementById("graph");
			var canvas = document.createElement('canvas');
			canvas.id = 'chart';
			parent.appendChild(canvas);
		}
		for (x in variables) {
			if (document.getElementById(variables[x]).checked) {
				variable = document.getElementById(variables[x])
			}
		}if (typeof(variable) != 'undefined') {
			document.getElementById("compare").style.display = 'none';
			$( "#SVG" ).animate({width: '35%'});
			$( "#graph" ).fadeIn( "slow");
			makeChart(variable.id, state.id, data);
		}
	}
}

function back() {
	document.getElementById('graph').style.display = 'none';
	document.getElementById('compare').style.display = 'initial';
	$( "#SVG" ).animate({width: '65%'});
	var parent = document.getElementById('graph');
	var canvas = document.getElementById('chart');
	parent.removeChild(canvas);
}

function getData(d, v) {
	var l = {};
	for (var x in d[0]) {
		var vals = Object.keys(d[0][x][v]).map(function (key) {
			return d[0][x][v][key];
		});
		l[d[0][x]['Name']]=vals;
	}
	return l
}


function drawMap(v, data, slider, w, h, legend, parent, slide){
	if (slider.value > 1950) {
		document.getElementById('sliderText').innerHTML = 'Year: ' + slider.value;
	}else {
		if (slider.value == 0) {var inner = 'Year: 1981 - 1990'}
		else if (slider.value == 1) { var inner = 'Year: 1991 - 2000'}
		else var inner = 'Year: 2001 - 2010';
		document.getElementById('sliderText').innerHTML = inner;
	}
	var d = getData(data, v);
	var vals = Object.keys(d).map(function (key) {
		return d[key];
	});
	var max = d3.max(vals, function(array) {
		if (v != 'Guns per household') {
			return d3.max([array[slider.value - slider.min]]);
		}else{
			if (slider.value == 0) {return d3.max([array[2]]);}
			else if (slider.value == 2) {return d3.max([array[0]]);}
			else return d3.max([array[1]])
		}
	});
	var min = d3.min(vals, function (array) {
		if (v != 'Guns per household') {
			return d3.min([array[slider.value - slider.min]]);
		}else{
			if (slider.value == 0) {return d3.min([array[2]]);}
			else if (slider.value == 2) {return d3.min([array[0]]);}
			else return d3.min([array[1]])
		}
	});
	var stateNames = Object.getOwnPropertyNames(d);
	for (var i = 0; i < stateNames.length; i++) {
		var state = d3.select('#' + Object.getOwnPropertyNames(d)[i]);
		if (v != 'Guns per household') {
			var value = d[stateNames[i]][slider.value - slider.min]
		} else {
			if (slider.value == 0) {var value = d[stateNames[i]][2];}
			else if (slider.value == 2) {var value = d[stateNames[i]][0];}
			else {var value = d[stateNames[i]][1];}
		}
		var color = d3.scale.linear().domain([min, max]).range(['#f7fcf5', '#00441b']); //http://bl.ocks.org/darrenjaworski/5874214
		state.style('fill', function() {return color(value);});
	}
	parent.selectAll('#legend').remove();
	parent.append("rect").attr('id', 'legend').attr("width", 400).attr("height", h-50).style("fill", "url(#gradient)").attr("transform", "translate(0,10)");
	var x = d3.scale.linear().range([0, 400]).domain([min, max]);
	var xAxis = d3.svg.axis().scale(x).tickSize(1);
	parent.append("g").attr('id', 'legend').attr("class", "x axis").attr("transform", "translate(0,20)").call(xAxis)
		.append("text").text(document.getElementById(v).value).attr("y", 30).style("text-anchor","right").attr('font-size', '10px');
	d3.selectAll('.tick').style('font-size', '10px');
}

function makeChart(variable, state, d) {
	document.getElementById('titleText').innerHTML = states[state] + ' - ' + variable;
	var data = {}
	var selectionData = d[0][states[state]][variable];
	var labels = Object.keys(selectionData);
	var values = [];
	for(var key in selectionData) values.push(selectionData[key]);
	if (variable == 'Guns per household') {
		values.reverse();
		labels.reverse();
	}
	data['labels'] = labels;
	data['datasets'] =  [{
            label: states[state],
            fillColor: "rgba(158,186,166,0.2)",
            strokeColor: "#9EBAA6",
            pointColor: "#9EBAA6",
            pointStrokeColor: "#fff",
            pointHighlightFill: "green",
            pointHighlightStroke: "#fff",
            data: values
        }];
	var options = {
		pointHitDetectionRadius : 0,
	};
	var ctx = document.getElementById("chart").getContext("2d");
	var lineChart = new Chart(ctx).Line(data,options);
}

function makeComparison() {
	var person = prompt("Please enter your name", "Harry Potter");
}