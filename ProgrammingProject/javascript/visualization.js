var barChart;
function ready() { // Load SVG before doing ANYTHING

	if (window.innerHeight<600) { // If visualization is loaded on a small screen, make the graph smaller so it still fits
		document.getElementById('graph').style.height = '350px';
		document.getElementById('graph').style.marginTop = '50px';
	}

	// List of variables used to check which variable is checked
	var variables = ['Violent crime rate', 'Forcible rape rate', 'Robbery rate', 'Aggravated assault rate', 'Murder rate', 'Cook PVI',
					'Property crime rate', 'Burglary rate', 'Larceny-theft rate', 'Motor vehicle theft rate', 'Unemployment', 'Guns per household']
	
	for (v in variables) { // Uncheck all variables in case a browser uses form history and the page is reloaded
		document.getElementById(variables[v]).checked = false;
	}
	document.getElementById('slider').min = 0; // When no variable is selected, the slider should not be functional
	document.getElementById('slider').max = 0;
	
	var w = 300, h = 60;  //Initiate the gradient legend for the map: http://bl.ocks.org/darrenjaworski/5874214
	var parent = d3.select("#SVG").append("svg").attr("id", "parent").attr("width", '90%').attr("height", h);
	var legend = parent.append("defs").append("svg:linearGradient").attr("id", "gradient").attr("x1", "100%").attr("y1", "0%").attr("x2", "0%").attr("y2", "0%");
	legend.append("stop").attr("offset", "0%").attr("stop-color", '#00441b').attr("stop-opacity", 1);
	legend.append("stop").attr("offset", "100%").attr("stop-color", '#f7fcf5').attr("stop-opacity", 1);

	var selectAll = document.getElementById('selectAll');
	selectAll.onclick = function() {									// Functionality for the checkbox to tick or untick
		var elements = document.getElementsByClassName('checkboxes');   // all checkboxes in the compare states window
		if (this.checked == true) {
			for (el in elements) {
				elements[el].checked = true;
			}
		}else if (this.checked == false) {
			for (el in elements) {
				elements[el].checked = false;
			}
		}
	}
	
	var data;
	var loadData = new XMLHttpRequest();
	loadData.onload = dataLoaded;                  // Load the data using XMLHttpRequest
	loadData.open("get", "data/data.json", true);
	loadData.send();
	
	function dataLoaded(){ // Do all this when data is loaded
		var data = JSON.parse(this.responseText); // Store data object in a variable
		
		slider = document.getElementById('slider'); // Store slider object in a variable
		
		for (var i = 0; i < Object.keys(states).length; i++) { // Add class to states
			var state = d3.select('#' + Object.keys(states)[i]);
			state.attr('class', 'state');
		}	
		
		d3.selectAll('.radButton').on('click', function () { // Add onclick listener for radio-buttons
			if (~this.id.indexOf('rate')) { //http://stackoverflow.com/a/1789952
				slider.min = 1960;
				slider.max = 2012;
				slider.step = 1
			}else if (this.id == 'Unemployment') {
				slider.min = 1976;
				slider.max = 2015;
				slider.step = 1
			}else if (this.id == 'Cook PVI') {    		// Different variables have different timespans
				slider.min = 1960;
				slider.max = 2012;
				slider.step = 4;
			}else {
				slider.min = 0;
				slider.max = 2;
				slider.step = 1
			}
			drawMap(this.id, data, slider, legend, parent);
			if ($('#graph').is(':visible')) {
				if (document.getElementById('chart').value != undefined) { // If our canvas has a value we know it is a barchart
					var selected = [];
					$('#checkboxes :checked').each(function() { //http://stackoverflow.com/a/786215
						selected.push($(this).val());
					});
					goTo(variables, selected, data, slider);
				} else back();
			}
		});

		slider.onchange = function () { // Add onclick listener for slider
			for (x in variables) {
				if (document.getElementById(variables[x]).checked) {
					v = document.getElementById(variables[x]);
				}
			}
			if (slider.max > 0) { // Make sure slider is usable
				drawMap(v.id, data, slider, legend, parent);
				if ($('#graph').is(':visible')) {
					if (document.getElementById('chart').value != undefined) {
						update(barChart, slider, data, v.id);
					}
				}
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
		
		var tooltip = d3.select('#map').append('g')  // Initiate the tooltip
				.attr('id', 'tooltip').style('display', 'none');
			tooltip.append('rect').attr('id', 'tooltipRect').attr('height', '10px').attr('width', 0)
				.style('fill', '#FFF')
				.style('stroke', '#000').style('stroke-width', 0.5);
			tooltip.append('text').attr('id', 'tooltipText1').attr('font-size', 3);
			tooltip.append('text').attr('id', 'tooltipText2').attr('font-size', 3);
		
		d3.selectAll('.state') // Mouse events for the states
			.on('mouseover', function(){
				d3.select(this).style('cursor', 'pointer').style('stroke-width', 0.6);
				this.parentNode.appendChild(this);
				var labels = document.getElementById('labels')
				labels.parentNode.appendChild(labels);
				var tTip = document.getElementById('tooltip');  // Make sure the targeted state and the tooltip are always on top
				tTip.parentNode.appendChild(tTip);
				tooltip.style('display', 'initial');
			}).on('mouseout', function(){
				d3.select(this).style('stroke-width', 0.28222218);
				tooltip.style('display', 'none')
			}).on('mousemove', function() { // Draw tooltip on mousemove so it follows the mouse
				var el = this;
				var mouse = d3.mouse(this);
				for (x in variables) {
					if (document.getElementById(variables[x]).checked) {
						var variable = document.getElementById(variables[x])
					}
				}
				d3.select('#tooltipText1').text(function(){
					return states[el.id];
				});
				var textWidth1 = document.getElementById('tooltipText1').getComputedTextLength();
				var textWidth2 = document.getElementById('tooltipText2').getComputedTextLength();
				if (textWidth1 > textWidth2) {var textWidth = textWidth1;}
				else var textWidth = textWidth2;
				if (mouse[0] < 135) {
					d3.select('#tooltipRect').attr('width', textWidth + 5);
					d3.select('#tooltipRect').attr('x', mouse[0] + 2).attr('y', mouse[1] - 12);
					d3.select('#tooltipText1').attr('x', mouse[0] + 4).attr('y', mouse[1]-8);
					d3.select('#tooltipText2').attr('x', mouse[0] + 4).attr('y', mouse[1]-4.5);
				} else {
					d3.select('#tooltipRect').attr('x', mouse[0] - textWidth - 6).attr('y', mouse[1] - 12);
					d3.select('#tooltipText2').attr('x', mouse[0] - textWidth - 4).attr('y', mouse[1]-4.5);
					d3.select('#tooltipRect').attr('width', textWidth + 5);
					d3.select('#tooltipText1').attr('x', mouse[0] - textWidth - 4).attr('y', mouse[1]-8);
				}
				d3.select('#tooltipText2').text(function(){
						if (variable == undefined) {return '-';}
						else if (el.id == 'DC') {
							return 'NaN';
						}
						else if (variable.id == 'Guns per household') {
							if (slider.value == 0) {return data[0][states[el.id]][variable.id]['2001 - 2010'];}
							else if (slider.value == 1) {return data[0][states[el.id]][variable.id]['1991 - 2000'];}
							else return data[0][states[el.id]][variable.id]['1981 - 1990'];
						} else if (variable.id == 'Cook PVI') {
							var val = data[0][states[el.id]][variable.id][slider.value];
							if (val < 0) {
								return 'Democrats +' + val.toString().slice(1);				// Custom tooltip for Cook PVI variable
							} else return 'Republicans +' + val.toString();
						} else {
							return data[0][states[el.id]][variable.id][slider.value];
						}
				})
			}).on('click', function() {
				if (this.id != 'DC') { // There is no data for District of Colombia, so ignore this state
					goTo(variables, this.id, data, slider);
				}
			});
			
		d3.selectAll('.label').on('mouseover', function () {
			d3.select(this).style('cursor', 'pointer')
			d3.select('#SVG').select('#' + this.id).style('stroke-width', 0.6);							// Hovering over a state in the compare window
			document.getElementById(this.id).parentNode.appendChild(document.getElementById(this.id));  // also highlights the state on the map
			var labels = document.getElementById('labels')
			labels.parentNode.appendChild(labels);
		}).on('mouseout', function() {
			d3.select('#SVG').select('#' + this.id).style('stroke-width', 0.28222218);
		});
		
		d3.select('#submitButton').on('click', function() {  // Draw comparison when the compare button is clicked
			var selected = [];
			$('#checkboxes :checked').each(function() { //http://stackoverflow.com/a/786215
				selected.push($(this).val());
			});
			if (selected.length < 2) {alert("Please select at least two states to compare.")}
			else {
				goTo(variables, selected, data, slider);
			}
		});
	}
}

function goTo(variables, state, data, slider) {  // Changes view when a graph has to be drawn
	for (x in variables) {
		if (document.getElementById(variables[x]).checked) {
			variable = document.getElementById(variables[x])
		}
	}
	if (typeof(variable) != 'undefined') {	
		if (!$('#graph').is(':visible')) {
			var parent = document.getElementById("graph"); 
			var canvas = document.createElement('canvas');
			canvas.id = 'chart';
			parent.appendChild(canvas);								// Append or reset canvas when necessary
		}else {
			var parent = document.getElementById('graph');
			var canvas = document.getElementById('chart');   
			parent.removeChild(canvas);
			var parent = document.getElementById("graph");
			var canvas = document.createElement('canvas');
			canvas.id = 'chart';
			parent.appendChild(canvas);
		}
		if ($('#graph').is(':visible')) {         // No animations when the graph is already visible
			if (typeof(state) != 'string'){       // Check whether we have to make a line- or barchart
				canvas.value = 'bar';
				makeComparison(variable.id, state, data, slider);
			} else makeChart(variable.id, state, data);
		} else {
			$("#compare").fadeOut(300);
			$( "#SVG" ).animate({width: '35%'}, 400, function() {
				$( "#graph" ).fadeIn( "slow");
				if (typeof(state) != 'string'){
					canvas.value = 'bar';
					makeComparison(variable.id, state, data, slider);
				} else makeChart(variable.id, state, data);
			});
		}
	}else alert('Please select a variable to visualize.');
}

function back() {                              // Go back to initial view with just the map
	$( "#graph" ).fadeOut(400, function() {
		$( "#SVG" ).animate({width: '65%'});
		$("#compare").fadeIn("slow");
	});
	var parent = document.getElementById('graph');
	var canvas = document.getElementById('chart');   
	parent.removeChild(canvas);
}

function getData(data, variable) { // Get data for the map
	var l = {};
	for (var state in data[0]) {
		if (v == 'Cook PVI') {
			var sortable = [];
			for (var dataPoint in data[0][state][variable]) {
				  sortable.push([dataPoint, data[0][state][variable][dataPoint]])
			}
			sortable.sort(function(a, b) {return a[0] - b[0]})        // Sort data if variable is Cook PVI (rest of the variables in naturally sorted)
			var vals = [];
			for (value in sortable) {
				vals.push(sortable[value][1])
			}
		}else {
			var vals = Object.keys(data[0][state][variable]).map(function (key) {
				return data[0][state][variable][key];
			});
		}
		l[data[0][state]['Name']]=vals;
	}
	return l
}


function drawMap(variable, data, slider, legend, parent){            // Color the map and draw the legend
	if (slider.value > 1950) {
		document.getElementById('sliderText').innerHTML = 'Year: ' + slider.value;
	}else {
		if (slider.value == 0) {var inner = 'Year: 1981 - 1990'}
		else if (slider.value == 1) { var inner = 'Year: 1991 - 2000'}
		else var inner = 'Year: 2001 - 2010';
		document.getElementById('sliderText').innerHTML = inner;
	}
	var d = getData(data, variable);
	var vals = Object.keys(d).map(function (key) {
		return d[key];
	});
	if (variable != 'Cook PVI') {
		var max = d3.max(vals, function(array) {
			if (variable != 'Guns per household') {
				return d3.max([array[slider.value - slider.min]]);
			}else{
				if (slider.value == 0) {return d3.max([array[2]]);}
				else if (slider.value == 2) {return d3.max([array[0]]);}
				else return d3.max([array[1]])
			}
		});
		var min = d3.min(vals, function (array) {										// Min and max values gradient domain
			if (variable != 'Guns per household') {
				return d3.min([array[slider.value - slider.min]]);
			}else{
				if (slider.value == 0) {return d3.min([array[2]]);}
				else if (slider.value == 2) {return d3.min([array[0]]);}
				else return d3.min([array[1]])
			}
		});
		var color = d3.scale.linear().domain([min, max]).range(['#f7fcf5', '#00441b']); //http://bl.ocks.org/darrenjaworski/5874214
	}
	var stateNames = Object.getOwnPropertyNames(d);
	for (var i = 0; i < stateNames.length; i++) {
		var state = d3.select('#' + Object.getOwnPropertyNames(d)[i]);
		if (variable != 'Guns per household' && variable != 'Cook PVI') {
			var value = d[stateNames[i]][slider.value - slider.min]
		} else if (variable == 'Cook PVI') {
			var value = d[stateNames[i]][(slider.value - slider.min) / 4]
		}else {
			if (slider.value == 0) {var value = d[stateNames[i]][2];}
			else if (slider.value == 2) {var value = d[stateNames[i]][0];}
			else {var value = d[stateNames[i]][1];}
		}
		if (variable == 'Cook PVI') {
			state.style('fill', function() {
				if (value < 0) {
					return 'blue';
				} else return 'red';
			});
		}else state.style('fill', function() {return color(value);});
	}
	if (variable != 'Cook PVI') {   	// Draw legend, but not if variable is Cook PVI
		var w = 300, h = 60; 
		parent.selectAll('#legend').remove();
		parent.append("rect").attr('id', 'legend').attr("width", 400).attr("height", h-50).style("fill", "url(#gradient)").attr("transform", "translate(0,10)");
		var x = d3.scale.linear().range([0, 400]).domain([min, max]);
		var xAxis = d3.svg.axis().scale(x).tickSize(1);
		parent.append("g").attr('id', 'legend').attr("class", "x axis").attr("transform", "translate(0,20)").call(xAxis)
			.append("text").text(document.getElementById(variable).value).attr("y", 30).style("text-anchor","right");
	} else {
		parent.selectAll('#legend').remove();
	}
}

function makeChart(variable, state, d) { // Generate the line chart
	document.getElementById('titleText').innerHTML = states[state] + ' - ' + variable;
	var data = {}
	var selectionData = d[0][states[state]][variable];	
	if (variable != 'Cook PVI'){
		var labels = Object.keys(selectionData);
		var values = [];
		for(var key in selectionData) values.push(selectionData[key]);
		if (variable == 'Guns per household') {      // Values have to be reversed because they were stored in reverse for this variable
			values.reverse();
			labels.reverse();
		}
	}else {
		var sortable = [];
		for (var dataPoint in selectionData) {
			  sortable.push([dataPoint, selectionData[dataPoint]])
		}
		sortable.sort(function(a, b) {return a[0] - b[0]})
		var labels = [];
		var values = [];
		for (x in sortable) {
			labels.push(sortable[x][0]);
			values.push(sortable[x][1]);
		}
	}
	data['labels'] = labels;
	if (variable == 'Cook PVI') {
		data['datasets'] =  [{
            label: states[state],
            fillColor: "rgba(0,0,0,0.05)",
            strokeColor: "rgba(0,0,0,0.1)",
            pointColor: "#9EBAA6",
            pointStrokeColor: "rgba(0,0,0,0.8)",             // Custom dataset for Cook PVI
            pointHighlightFill: "white",
            pointHighlightStroke: "rgba(0,0,0,0.05)",
            data: values
        }];
	}else {
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
	}
	if (variable == 'Cook PVI') {
		var options = {
			scaleBeginAtZero: false,
			scaleLabel: function(valuePayload) {
				if (valuePayload.value > 0){
					return "R+" + valuePayload.value;
				}else if (valuePayload.value == 0){
					return "Even";
				}else return "D+" + valuePayload.value.slice(1);
			}, 															// Custom label and tooltip for Cook PVI
			tooltipTemplate: function(valuePayload) {
				if (valuePayload.value > 0){
					return valuePayload.label + ": R+" + valuePayload.value;
				}else if (valuePayload.value == 0){
					return "Even";
				}else return valuePayload.label + ": D+" + valuePayload.value.toString().slice(1);
			}
		}
	}else var options = {
		pointHitDetectionRadius : 0,
		scaleBeginAtZero: true
	}
	var ctx = document.getElementById("chart").getContext("2d");
	var lineChart = new Chart(ctx).Line(data,options);
	if (variable == 'Cook PVI') {				// Color the dots if variable equals Cook PVI, for extra clarity
		for (point in lineChart.datasets[0].points) {
			var p = lineChart.datasets[0].points[point];
			if (p.value > 0) {
				p.fillColor = 'red';
				p.highlightFill = 'red';
			}else {
				p.fillColor = 'blue';
				p.highlightFill = 'blue';
			}
		}
		lineChart.update();
	}
}

function makeComparison(variable, state, d, slider) {
	if (slider.value == 0) {
		var displayYear = '1981 - 1990';
		var year = '2001 - 2010';
	} else if (slider.value == 1) {
		var displayYear = '1991 - 2000';
		var year = '1991 - 2000';			
	} else if (slider.value == 2) {
		var displayYear = '2001 - 2010';
		var year = '1981 - 1990';
	}else {
		var displayYear = slider.value;
		var year = slider.value;
	}
	document.getElementById('titleText').innerHTML = variable + ' - ' + displayYear;
	var data = {};
	var dataSet = [];
	var labels = [];
	for (s in state) {
		labels.push(states[state[s]])
		var stateData = d[0][states[state[s]]][variable][year];
		if (stateData == undefined) {
			stateData = 0;
		}
		dataSet.push(stateData);
	}
	data['labels'] = labels;
	data['datasets'] = [{
            label: 'Comparison',
            fillColor: "rgba(158,186,166,0.2)",
            strokeColor: "#9EBAA6",
            pointColor: "#9EBAA6",
            pointStrokeColor: "#fff",
            pointHighlightFill: "green",
            pointHighlightStroke: "#fff",
            data: dataSet
    }];
	if (variable == 'Cook PVI') {
		var options = {
			scaleBeginAtZero: false,
			scaleLabel: function(valuePayload) {
				if (valuePayload.value > 0){
					return "R+" + valuePayload.value;
				}else if (valuePayload.value == 0){
					return "Even";
				}else return "D+" + valuePayload.value.slice(1);
			}, 															// Custom label and tooltip for Cook PVI
			tooltipTemplate: function(valuePayload) {
				if (valuePayload.value > 0){
					return valuePayload.label + ": R+" + valuePayload.value;
				}else if (valuePayload.value == 0){
					return "Even";
				}else return valuePayload.label + ": D+" + valuePayload.value.toString().slice(1);
			}
		}
	}else var options = {scaleBeginAtZero: true}
	var ctx = document.getElementById("chart").getContext("2d");
	barChart = new Chart(ctx).Bar(data, options);
	if (variable == 'Cook PVI') {
		for (bar in barChart.datasets[0].bars) {
			var b = barChart.datasets[0].bars[bar];
			if (b.value > 0) {
				b.fillColor = "rgba(255,0,0,0.4)";
				b.highlightFill = "rgba(255,0,0,0.3)"
				b.strokeColor = 'red';
				b.highlightStroke = 'red';								// Color the bars if variable equals Cook PVI, for extra clarity
			}else {
				b.fillColor = "rgba(0,0,255,0.4)";
				b.highlightFill = "rgba(0,0,255,0.3)"
				b.strokeColor = 'blue';
				b.highlightStroke = 'blue';
			}
		}
		barChart.update();
	}
}

function update(barChart, slider, d, variable) { // Updates the barchart when the slider is used
	barChart.stop();
	if (slider.value == 0) {
		var displayYear = '1981 - 1990';
		var year = '2001 - 2010';
	} else if (slider.value == 1) {
		var displayYear = '1991 - 2000';
		var year = '1991 - 2000';			
	} else if (slider.value == 2) {
		var displayYear = '2001 - 2010';
		var year = '1981 - 1990';
	}else {
		var displayYear = slider.value;
		var year = slider.value;
	}
	document.getElementById('titleText').innerHTML = variable + ' - ' + displayYear;
	
	var stateList = [];
	$('#checkboxes :checked').each(function() { //http://stackoverflow.com/a/786215
		stateList.push($(this).val());
	});
	dataSet = [];
	for (s in stateList) {
		var stateData = d[0][states[stateList[s]]][variable][year];
		if (stateData == undefined) {
			stateData = 0;
		}
		dataSet.push(stateData);
	}
	for (dataPoint in barChart.datasets[0].bars) {
		barChart.datasets[0].bars[dataPoint].value = dataSet[dataPoint]
	}
	if (variable == 'Cook PVI') {
		for (bar in barChart.datasets[0].bars) {
			var b = barChart.datasets[0].bars[bar];
			if (b.value > 0) {
				b.fillColor = "rgba(255,0,0,0.4)";
				b.highlightFill = "rgba(255,0,0,0.3)"
				b.strokeColor = 'red';
				b.hightlightStroke = 'red';
			}else {
				b.fillColor = "rgba(0,0,255,0.4)";
				b.highlightFill = "rgba(0,0,255,0.3)"
				b.strokeColor = 'blue';
				b.highlightStroke = 'blue';
			}
		}
	}
	barChart.update();
}

function navigateSlider(direction) {
	if (direction == 'left'){
		if (slider.value > slider.min) {
			slider.value = parseInt(slider.value) - parseInt(slider.step);
		}																		// Move slider when one of the arrow buttons is clicked
	}else {
		if (slider.value < slider.max) {
			slider.value = parseInt(slider.value) + parseInt(slider.step);
		}
	}
	slider.onchange();
}