function map() { //Function map gets called when the body is loaded (see d3map.html) to make sure document.getElementById('container') wont return null
	var map = new Datamap({ //Draw the map
		element: document.getElementById("mappp"),
		width: 800,
		height: 400,
		fills: {
			c0c0c0: '#c0c0c0',
			fee5d9: '#fee5d9',
			fcae91: '#fcae91',
			fb6a4a: '#fb6a4a', //Colorscheme, colorcodes are in the json file
			de2d26: '#de2d26',
			a50f15: '#a50f15',
			defaultFill: '#c0c0c0'
		},
		dataUrl: 'mapData.json', //Use data from data.json
		data: {},
		geographyConfig: { //Interactivity
			highlightBorderWidth: 1,
			highlightFillColor: 'black',
			popupTemplate:  function(geography, data){
				if (data && data.population > 0) { //Only display population if we have the data
					return '<div class=hoverinfo><strong> Country: ' + data.name + 
						'<br>Population 65+: ' + data.population.toFixed(2) + '%</strong></div>';
				}
				else if (data && data.population == 0) { //Write 'No data' if we have no population data
					return '<div class=hoverinfo><strong> Country: ' + data.name + 
						'<br>No data</strong></div>';
				}
				else { //Use the default country name if we don't have any data at all
					return '<div class=hoverinfo><strong> Country: ' + geography.properties.name +
						'<br>No data</strong></div>';
				}
			}  
		}
	});
	
	d3.json("lineData.json", function(data) {
		var temps = data.Temperatures;
		var dates = data.Dates;
		makeGraph(temps,dates);
	}); //Load data and call makeGraph() to draw the graph

	function makeGraph(temps, dates) { //This function draws the graph and adds interaction
		var data = [];
		var entry = {};
		for (var i = 0; i < temps.length; i++) { //Making an array with each date and it's corresponding temperature, so the data is easier to use in d3
			entry['temp'] = temps[i];
			entry['date'] = dates[i];
			data.push(entry);
			entry = {};
		}
		
		var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]; //List of months for x-axis labels
		var graph = d3.select('#graph'); //Select the svg
		//Set variables for svg
		var width = 800;
		var height = 400;
		var marginTop = 20, marginBottom = 20, marginRight = 30, marginLeft = 50;
		
		//Set range and domain for x-axis.
		var xCoords = d3.scale.linear().range([marginLeft, width - marginRight]).domain([d3.min(data, function(d, i) {
		  return i;
		}), d3.max(data, function(d, i) {
		  return i;
		})])
		
		//Our data uses dates, xRange is used to draw x-axis labels
		var xRange = d3.time.scale()
			.domain([new Date(dates[0]), d3.time.day.offset(new Date(dates[dates.length - 1]), 1)])
			.rangeRound([marginLeft, width - marginRight]);
		
		//Set range and domain for y-axis
		var yRange = d3.scale.linear().range([height - marginTop, marginBottom]).domain([0.00001,
			d3.max(temps, function(d) {return d+20;})]);
		
		//x-axis
		var xAxis = d3.svg.axis().scale(xRange).tickFormat(function(d) {
				if (d.getMonth() == 0) {return d.getFullYear();}
				else {return months[d.getMonth()]}})
			.tickSize(1).tickPadding(4);
		
		//y-axis
		var yAxis = d3.svg.axis().scale(yRange).tickFormat(function(d) {var t = d/10; return t.toString() + unescape('%B0') + 'C';})
			.tickSize(1).orient('left');								//Divide by ten because temperatures are in 0.1 degrees and add degree symbol etc

		//Draw x and y axis
		graph.append('svg:g').attr('id', 'x').attr('transform', 'translate(0,' + (height - marginBottom) + ')').call(xAxis);
		graph.append('svg:g').attr('id', 'y').attr('transform', 'translate(' + marginLeft + ',0)').call(yAxis);
		
		//Variable coords to get the right x and y coordinates for our data
		var coords = d3.svg.line()
			.x(function(d, i) { return xCoords(i); })
			.y(function(d) { return yRange(d.temp); })
			.interpolate('linear');
		
		//Draw our data on the svg
		graph.append("path").attr("id", "line").attr("d", coords(data)).attr('stroke-width', 1).attr('fill', 'none').attr('stroke', 'green');
		
		//Add circles to datapoints
		graph.selectAll('circle').data(data).enter().append('circle')
			.attr('cx', function(d, i) { return xCoords(i); })
			.attr('cy', function(d) { return yRange(d.temp); })
			.attr('r', 3)
			.attr('class', 'circle')
			.style('fill', 'white').style('stroke', 'green').style('stroke-width', '1px');
		
		//Crosshair elements
		var crossHair = graph.append('g').style('display', 'none'); //Make sure elements are invisible
		crossHair.append('line').attr('id', 'xLine');
		crossHair.append('line').attr('id', 'yLine');
		crossHair.append('circle').attr('id', 'hitCircle').attr('r', 3).style('fill', 'red');
		crossHair.append('rect').attr('id', 'xRect').attr('class', 'tooltip')
			.style('fill', 'white').style('stroke', 'red').style('stroke-width', '1px');
		crossHair.append('text').attr('id', 'xTooltip').attr('class', 'tooltip')
			.style('font-family', 'Arial, "Helvetica Neue", Helvetica, sans-serif');
		crossHair.append('rect').attr('id', 'yRect').attr('class', 'tooltip')
			.style('fill', 'white').style('stroke', 'red').style('stroke-width', '1px');
		crossHair.append('text').attr('id', 'yTooltip').attr('class', 'tooltip')
			.style('font-family', 'Arial, "Helvetica Neue", Helvetica, sans-serif');
		
		var timeout;
		//When your mouse hits the svg the crosshair elements are made visible, leaving the svg will make them invisible again
		graph.on('mouseover', function() { crossHair.style('display', 'initial'); }).on('mouseout', function() { crossHair.style('display', 'none'); })
			.on('mousemove', function() { //Drawing the crosshair
				d3.selectAll('.tooltip').style('display', 'none'); //Make sure tooltip isn't still visible after moving mouse
				
				var mouse = d3.mouse(this); //Mouse coordinates
				var xIndex = Math.ceil(xCoords.invert(mouse[0])); //Convert mouseposition x to fit data index
				var y  = yRange(data[xIndex].temp); //Y coordinate
				var x = xCoords(xIndex); //X coordinate
				crossHair.select('#hitCircle').attr('cx', x).attr('cy', y); //Draw crosshair circle on datapoint
				crossHair.select('#yLine')
					.attr('x1', x).attr('y1', height-marginBottom).attr('x2', x).attr('y2', marginTop)
					.attr('stroke-width', 1).attr('stroke', 'red');                                   //Drawing crosshair lines
				crossHair.select('#xLine')
					.attr('x1', marginLeft).attr('y1', y).attr('x2', width-marginRight).attr('y2', y)
					.attr('stroke-width', 1).attr('stroke', 'red');
				
				//Timeout function for the tooltip
				if (timeout){
					clearTimeout(timeout); //Make sure tooltip doesn't show up when the mouse moves
				};
				timeout = setTimeout(function(){ //Tooltip
					d3.selectAll('.tooltip').style('display', 'initial'); //Make tooltip visible
					//Tooltip text
					var xText = new Date(data[xIndex].date).toDateString();
					var yText = (data[xIndex].temp/10).toString() + unescape('%B0') + 'C';
					//Code below draws tooltip
					//And makes sure tooltips move when they don't fit on the svg anymore
					if (x < (width - 200) && y < (height - 100) && x > 155) {
						crossHair.select('#xRect').attr('width', 150).attr('height', 30).attr('x', x).attr('y', y+29);
						crossHair.select('#xTooltip').attr('x', x+10).attr('y', y+50).text(xText);
						crossHair.select('#yRect').attr('width', 70).attr('height', 30).attr('x', x-100).attr('y', y-30);
						crossHair.select('#yTooltip').attr('x', x-90).attr('y', y-9).text(yText);
					}
					else if (x >= (width - 200) && y >= (height - 100)){
						crossHair.select('#xRect').attr('width', 150).attr('height', 30).attr('x', x-150).attr('y', y-121);
						crossHair.select('#xTooltip').attr('x', x-140).attr('y', y-100).text(xText);
						crossHair.select('#yRect').attr('width', 70).attr('height', 30).attr('x', x-100).attr('y', y-30);
						crossHair.select('#yTooltip').attr('x', x-90).attr('y', y-9).text(yText);
					}
					else if (x >= (width - 200) && y < (height - 100)){
						crossHair.select('#xRect').attr('width', 150).attr('height', 30).attr('x', x-150).attr('y', y+29);
						crossHair.select('#xTooltip').attr('x', x-140).attr('y', y+50).text(xText);
						crossHair.select('#yRect').attr('width', 70).attr('height', 30).attr('x', x-100).attr('y', y-30);
						crossHair.select('#yTooltip').attr('x', x-90).attr('y', y-9).text(yText);
					}
					else if (x <= 155 && y >= (height - 100)){
						crossHair.select('#xRect').attr('width', 150).attr('height', 30).attr('x', x).attr('y', y-121);
						crossHair.select('#xTooltip').attr('x', x+10).attr('y', y-100).text(xText);
						crossHair.select('#yRect').attr('width', 70).attr('height', 30).attr('x', x+100).attr('y', y-30);
						crossHair.select('#yTooltip').attr('x', x+120).attr('y', y-9).text(yText);
					}
					else if (x <= 155 && y < (height - 100)){
						crossHair.select('#xRect').attr('width', 150).attr('height', 30).attr('x', x).attr('y', y+29);
						crossHair.select('#xTooltip').attr('x', x+10).attr('y', y+50).text(xText);
						crossHair.select('#yRect').attr('width', 70).attr('height', 30).attr('x', x+100).attr('y', y-30);
						crossHair.select('#yTooltip').attr('x', x+110).attr('y', y-9).text(yText);
					}
				}, 1000);
			});
	}	
}