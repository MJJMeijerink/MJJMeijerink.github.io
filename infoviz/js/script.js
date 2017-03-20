// Global variables
var dataDict = {},
	currentDate = '03/2005',
	currentHour = '14',
    mapColorScale = d3.scale.linear()
		.domain([1, 3])
		.range(['#fb6a4a','#67000d']),
	chart;

window.onerror = function(event) {
	if (event.indexOf('Error: Unable to parse color from string') != -1) {
		return true;
	} else {
		return event;
	}
};
// Loading all data, happens before anything else can happen.
d3.csv("data/flatmetbuurten.csv", function(data) {
	for (i = 0; i < data.length; i++) {
		var nbhCode = 'F' + data[i]['neighborhood_id_ams'];
		var inciPrio = data[i]['incident_prio'];
		var nbhName = data[i]['neighborhood_name_ams'];
		var inciTime = new Date(data[i]['incident_timestamp'].substring(0,19));
		var month = inciTime.getMonth() + 1
		if (month < 10) {
				month = '0' + (month);
			}
		var inciTimeMY = month + '/' + inciTime.getFullYear();
		var inciHour = inciTime.getHours();
		
		if ( !dataDict.hasOwnProperty(nbhCode) ) {
			dataDict[nbhCode] = {}
		} else {
			if (!dataDict[nbhCode].hasOwnProperty('name')) {
				dataDict[nbhCode]['name'] = nbhName;
			}
			if (!dataDict[nbhCode].hasOwnProperty(inciTimeMY)) {
				dataDict[nbhCode][inciTimeMY] = {};
				dataDict[nbhCode][inciTimeMY]['total'] = 1;
				for (var j = 0; j < 24; j++) {
					if (j != inciHour) {
						dataDict[nbhCode][inciTimeMY][j.toString()] = 0;
					} else if (j == inciHour) {
						dataDict[nbhCode][inciTimeMY][j.toString()] = 1;
					}
				}	
			} else {
				dataDict[nbhCode][inciTimeMY]['total']++;
				dataDict[nbhCode][inciTimeMY][inciHour.toString()]++;
			}
		}
	}

	//
	// Map variables/functionality
	//
	
	var winHeight = window.innerHeight;

	var width = 1000,
		height = winHeight * 0.6,
		centered,
		clicked = false,
		center = [4.909000, 52.355399],
		now = false,
		comp = false,
		div;

	var scale = height * 227;
		
	var svgContainer = d3.select('#svgContainer').append('svg')
		.attr('width', width)
		.attr('height', height);

	var projection = d3.geo.mercator()
		.scale(scale)
		.center(center)
		.translate([width / 2, height / 2]);

	var path = d3.geo.path()
		.projection(projection);

	var svg = d3.select('svg')
		.attr('id', 'SVG')
		.attr('width', width)
		.attr('height', height);

	var g = svg.append('g').attr('id', 'mapLayer')

	var compareButton = d3.select('#svgContainer')
		.append('button')
		.attr('id', 'compare')
		.style('position', 'absolute')
		.html('Compare')
		.on('click', compare);

	var pz = panzoom(g.node());
	
	var selected = [];
	
	//
	// Day Night Slider Functionality
	//
	
	var dayNightSlide = d3.select('#svgContainer')
		.append('input')
		.attr('type', 'range')
		.attr('min', 1)
		.attr('max', 1000)
		.attr('value', 400)
		.attr('id', 'dnslider');
		
	var dayNightOverlay = d3.select('#overlay').append('svg')
		.attr('width', '100%')
		.attr('height', '100%')
		.style('position', 'fixed')
		.style('top', 0)
		.style('left', 0);


	var dayNightColorScale = d3.scale.linear()
		.domain([0, 0.3, 0.6, 1])
		.range(["#003366", "#FFFFFF" , "#FFFFFF", "#003366"]);
		
	var rect = dayNightOverlay.append('rect')
		.attr('height', '100%')
		.attr('width', '100%')
		.attr('fill', function() {
			return dayNightColorScale(dayNightSlide.node().value/1000);
		})
		.attr('opacity', 0.9);

	d3.select('.page-header').style('border-bottom', 'none')
	var qcolorScale = d3.scale.quantize().domain([0,0.3,0.6,1])
		  //.interpolate(d3.interpolateRgb)
		  .range([d3.rgb("#FFF"), d3.rgb("#333"), d3.rgb("#333"), d3.rgb('#FFF')]);
		
	var h24 = 24 * 60 * 60 * 1000;
	var initDate = new Date('jan 1 1970 05:00:00');

	var timeDisplay = d3.select('.page-header')
		.append('span')
		.style('float', 'right')
		.html(new Date(initDate.valueOf() + 0.4 * h24).getHours() + ':00'); //- ' + new Date(initDate.valueOf() + h24/12).getHours().toString() + ':00');

	document.getElementById('dnslider').oninput = timeslide;
	
	var oldh = 831013; //random number that cannot be an hour
	function timeslide() {
		var val = this.value;
		var perc = val/1000;
		rect.attr('fill', dayNightColorScale(perc));
		d3.select('.page-header')
			.style('color', qcolorScale(perc));
		var updateDate = new Date(initDate.valueOf() + perc * h24)
		var hours = updateDate.getHours();
		if (hours != oldh) {
			timeDisplay.html(hours + ':00'); //- ' + new Date(updateDate.valueOf() + h24/12).getHours().toString() + ':00');
			colorMap(currentDate, hours);
			currentHour = hours;
		}
		oldh = hours;
	}
	
	//
	// Date Slider Functionality
	//
		
	var dateSlide = d3.select('#svgContainer')
		.append('input')
		.attr('type', 'range')
		.attr('min', function() {
			return new Date('2005/03/02').valueOf();
		})
		.attr('max', function () {
			return new Date('2017/02/01').valueOf();
		})
		.attr('step', function () {
			return 7 * 24 * 60 * 60 * 1000;
		})
		.attr('id', 'dateSlide');
		
	var dateDisplay = d3.select('.page-header')
		.append('span')
		.style('float', 'right')
		.html('March 2005 -&nbsp;');

	document.getElementById('dateSlide').oninput = datesliding;
	
	var oldm = 12000; //can't be a month so that's okay
	function datesliding() {
		var val = this.value;
		var d = new Date(parseInt(val));
		var m = d.getMonth() + 1;
		var month = new Array();
			month[0] = "January";
			month[1] = "February";
			month[2] = "March";
			month[3] = "April";
			month[4] = "May";
			month[5] = "June";
			month[6] = "July";
			month[7] = "August";
			month[8] = "September";
			month[9] = "October";
			month[10] = "November";
			month[11] = "December";
		var fullMonth = month[m - 1];
		if (m != oldm) {
			if (m < 10) {
				m = '0' + (m);
			}
			dateDisplay.html(fullMonth + ' ' + d.getFullYear() +  ' -&nbsp;');
			colorMap(m+'/'+d.getFullYear(), currentHour);
			currentDate = m+'/'+d.getFullYear();
		}
		oldm = m;
	}
	
	//
	// Parallax Functionality
	//
	
	var parallaxOverlay = d3.select('#overlay2').append('svg')
		.attr('id', 'parallaxViz')
		.attr('width', '100%')
		.attr('height', '100%')
		//.attr('transform', 'translate(0, -' + window.innerHeight + ')')
		.style('position', 'fixed')
		.style('top', -window.innerHeight + 'px')
		.style('left', 0)
		
	var backgroundRect = parallaxOverlay.append('rect')
		.attr('width', '100%')
		.attr('height', '100%')
		.attr('fill', 'white')
		.attr('opacity', 0.95);

	window.addEventListener('DOMMouseScroll', mouseWheelEvent);
	window.addEventListener('mousewheel', mouseWheelEvent);

	var pos = 0; 

	var parallaxsvg = d3.select('#parallaxViz');
	var out = false;
	function mouseWheelEvent(e) {
		var f = 30;
		var delta = e.detail < 0 || e.wheelDelta > 0 ? 1 : -1;
		if (!out) {
			var timeout = setTimeout(function() {
				pos = 0;
				out = false;
			}, 1200);
		}
		out = true;
		if (delta < 0) {
			if (pos <= 5) {
				pos += 1;
			} else if (pos > 5) {
				parallaxsvg.transition().duration(1000).style('top', '0px');
				clearTimeout(timeout);
				pos = 0;
				out = false;
			}
		} else {
			if (pos <= 5) {
				pos += 1;
			} else if (pos > 5) {
				parallaxsvg.transition().duration(1000).style('top', -window.innerHeight + 'px');
				clearTimeout(timeout);
				pos = 0;
				out = false;
			}
		}
	}
	
	//
	// Paint map
	//
	d3.json('geojson/adamBuurtenExWater.geojson', function(error, mapData) {
		var features = mapData.features;
		//console.log(features)
		
		g.selectAll('path')
			.data(features)
			.enter().append('path')
			.attr('d', path)
			.attr('vector-effect', 'non-scaling-stroke')
			.attr('id', function(d) {return 'F' + d.properties.Buurt_code.substring(1)})
			.attr('class', 'neighborhood')
			.style('stroke', '#000')
			.style('stroke-width', 1)
			.style('fill', '#999')
			.on('mouseover', function(d) {
				div = d3.select('body').append('div')	
					.attr('id', 'tooltip');
				div.html(d.properties.Buurt)
					.style('left', (d3.event.pageX) + 'px')		
					.style('top', (d3.event.pageY - 28) + 'px')
				div
					.style('width', (document.getElementById('tooltip').clientWidth + 16) + 'px')
					.style('height', (document.getElementById('tooltip').clientHeight) + 'px');
					
				d3.select(this).style('cursor', 'pointer');
				})					
			.on('mouseout', function() {		
				div.remove();
			})
			.on('mousemove', function() {
				div
					.style('left', (d3.event.pageX) + 'px')		
					.style('top', (d3.event.pageY - 28) + 'px');
			})
			.on('mousedown', function(d) {
				now = true;
				setTimeout(function() {
					now = false;
				},200)
			})
			.on('mouseup', function(d) {
				if (!clicked) {
					if (now) {
						zoomIn('F' + d.properties.Buurt_code.substring(1));
						clicked = true;
					}
				} else if (comp) {
					var el = d3.select(this).node()
					var sw = window.getComputedStyle(el).getPropertyValue('stroke-width');
					var fill = window.getComputedStyle(el).getPropertyValue('fill');
					if (fill != 'rgb(153, 153, 153)') {
						if (sw != '3px' && sw != 3) {
							d3.select(this).style('stroke-width', 3);
							if (selected.length < 1) {
								bchart(d.properties, 'create');
							} else {
								bchart(d.properties, 'update');
							}
							selected.push(this);
						} else {
							d3.select(this).style('stroke-width', 1);
							bchart(d.properties, 'remove');
							selected.splice(selected.indexOf(this), 1);
						}
					}
				}
			});
			
			colorMap(currentDate, currentHour);
	});


	function zoomIn(code) {
		
		
		hideElements();
		
		var fill = setZoom(code);
		
		
		window.setTimeout(xButton, 800);
		
		function xButton(){
			lchart(code);
			makeXButton('zoom', code, fill);
		};
	};

	function compare() {
		
		hideElements();
		
		d3.select('#svgContainer')
			.append('div')
			.style('position', 'absolute')
			.attr('id', 'placeholdertext')
			.style('top', height/2 + 'px')
			.style('left', (d3.select('#svgContainer').node().offsetWidth * 0.5) + 'px')
			.html('<h1> Click neighborhoods to visualize </h1>')
			.style('opacity', 0)
			.transition().duration(800)
			.style('opacity', 1)

		
		comp = true;
		clicked = true;
		
		compareZoom();
			
		window.setTimeout(xButton, 800);
		
		function xButton(){		
			makeXButton('compare');
		};
	};
	
	function bchart(d, mode) {
		d3.select('#placeholdertext').transition().duration(800).style('opacity', 0).remove();
		
		var val = dataDict['F' + d.Buurt_code.substring(1)][currentDate][currentHour]
		if (mode == 'create') {
			
			addChartCanvas();
			var data = {
				labels: [d['Buurt'].split(' ')],
				datasets: [
					{
						label: 'Comparing neighborhoods',
						data: [dataDict['F' + d.Buurt_code.substring(1)][currentDate][currentHour]],
						borderWidth: 2,
						borderColor: [mapColorScale(val)],
						backgroundColor: [mapColorScale(val) + '4c']
					}
				]
			}
			
			var ctx = document.getElementById('charts').getContext('2d');
			
			chart = new Chart(ctx, {
				type: 'bar',
				data: data,
				options: {
					scales: {
						yAxes: [{
							ticks: {
								beginAtZero:true
							}
						}],
						xAxes: [{
							ticks: {
								autoSkip: false
							}
						}]
					},
					title: {
						display: true,
						text: 'Compare neighborhoods'
					},
					legend: {
						display: false
					}

				}
			});
			
		}
		else if (mode == 'update') {
		
			chart.data.datasets[0].data.push(dataDict['F' + d.Buurt_code.substring(1)][currentDate][currentHour]);
			chart.data.labels.push(d['Buurt'].split(' '));
			chart.data.datasets[0].backgroundColor.push(mapColorScale(val) + '4c');
			chart.data.datasets[0].borderColor.push(mapColorScale(val));
			chart.update();
			
		}
		else if (mode == 'remove') {
			
			for (var x in chart.data.labels) {
				var w = '';
				for (var word in chart.data.labels[x]) {
					w += chart.data.labels[x][word] + ' ';
				}
				if (w == d['Buurt'] + ' ') {
					var index = x;
				}
			}
			chart.data.datasets[0].data.splice(index, 1);
			chart.data.labels.splice(index, 1);
			chart.data.datasets[0].backgroundColor.splice(index, 1);
			chart.data.datasets[0].borderColor.splice(index, 1);
			chart.update();
			
		}
	}
	
	function lchart(code) {
		var nbhLabels = [];
		var nbhData = [];
		var nbhJson = dataDict['F' + code.substring(1)]
		
		var sortedKeys = [];
		for (k in nbhJson) {
		  if (nbhJson.hasOwnProperty(k)) {
			sortedKeys.push(k);
		  }
		}
		
		sortedKeys.splice(0, 1);
		
		sortedKeys.sort(function(a,b) {
		  a = a.split('/').reverse().join('');
		  b = b.split('/').reverse().join('');
		  return a > b ? 1 : a < b ? -1 : 0;
		});

		for (var i = 0; i < sortedKeys.length; i++) {
			nbhLabels.push(sortedKeys[i]);
			if (typeof nbhJson[sortedKeys[i]].total != 'undefined' && sortedKeys[i] != 'name') {
				nbhData.push(nbhJson[sortedKeys[i]].total);
			} else {
				nbhData.push(0);
			}
		}
		
		addChartCanvas();
		
		var data = {
			labels: nbhLabels,
			datasets: [
				{
					label: dataDict['F' + code.substring(1)].name,
					lineTension: 0.1,
					backgroundColor: "rgba(200,25,25,0.4)",
					borderColor: "rgba(200,25,25,1)",
					borderCapStyle: 'butt',
					borderDash: [],
					borderDashOffset: 0.0,
					borderJoinStyle: 'miter',
					pointBorderColor: "rgba(200,25,25,1)",
					pointBackgroundColor: "#fff",
					pointBorderWidth: 1,
					pointHoverRadius: 5,
					pointHoverBackgroundColor: "rgba(200,25,25,1)",
					pointHoverBorderColor: "rgba(200,25,25,1)",
					pointHoverBorderWidth: 2,
					pointRadius: 1,
					pointHitRadius: 10,
					data: nbhData,
					spanGaps: false,
				}
			]
		};
		
		var ctx = d3.select('#charts').node();
		chart = new Chart(ctx, {
			type: 'line',
			data: data,
			options: {
				title: {
					display: true,
					text: dataDict['F' + code.substring(1)].name
				},
				legend: {
					display: false
				}
			}
		});
		
	}
	
	function hideElements() {
		dayNightSlide.style('display', 'none');
		dateSlide.style('display', 'none');
		compareButton.style('display', 'none');
	}
	
	function setZoom(code) {
		d3.selectAll('.neighborhood').transition().duration(800).style('opacity', .1);
		
		var newWidth = height,
			newHeight = height,
			mapSF = .6,
			transDuration = 800;
		
		var nbh = d3.select('#' + code);
		var element = nbh.node();
		var fill = window.getComputedStyle(element).getPropertyValue('fill');
		nbh.style('fill', '#999');
		
		var bbox = element.getBBox();
		var sf = 1 / d3.max([bbox.width, bbox.height]) * (150 * (1/mapSF)) //scale factor
		var centroid = [bbox.x*sf + bbox.width*sf/2, bbox.y*sf + bbox.height*sf/2];
		
		svg.transition().duration(transDuration)
			.attr('width', newWidth)
			.attr('height', newHeight);
		
		nbh.transition().duration(transDuration)
			.style('opacity', 1);
			
		d3.select('#mapLayer').transition().duration(transDuration)
				.attr('transform', 'translate(' + (newWidth/2 - centroid[0]) + ',' + (newHeight/2 - centroid[1]) + ') scale(' + sf + ')');
		
		pz.dispose();
		
		return fill;
	}
	
	function compareZoom() {
		
		var newWidth = height,
			newHeight = height;
		
		svg.transition().duration(800)
			.attr('width', newWidth)
			.attr('height', newHeight);
			
		var projection = d3.geo.mercator()
			.scale(height * 150)
			.center(center)
			.translate([newWidth / 2, newHeight / 2]);

		var path = d3.geo.path()
			.projection(projection);
			
		d3.selectAll('path').transition().duration(800).attr('d', path);
	}
	
	function undoCompare(t) {
		d3.select('#placeholdertext').transition().duration(800).style('opacity', 0).remove();
		
		svg
			.attr('width', width)
			.attr('height', height);
			
		var projection = d3.geo.mercator()
			.scale(height * 227)
			.center(center)
			.translate([width / 2, height / 2]);

		var path = d3.geo.path()
			.projection(projection);
			
		d3.selectAll('path').transition().duration(800).attr('d', path);
		
		t.remove();
		
		setTimeout(reset ,800)
		
		function reset() {
			compareButton.style('display', 'initial');
			dayNightSlide.style('display', 'initial');
			dateSlide.style('display', 'initial');
		}
		
		clicked = false;
		comp = false;
		
		d3.selectAll('.neighborhood').style('stroke-width', 1)
		
		destroyChart();

		selected = [];
	}
	
	function undoZoom(t, code, fill) {
		svg.transition().duration(800)
			.attr('width', width)
			.attr('height', height);
		d3.selectAll('.neighborhood').transition().duration(800)
			.style('opacity', 1);
		d3.select('#mapLayer').transition().duration(800)
			.attr('transform', 'matrix(1, 0, 0, 1, 0, 0)');
		t.remove();
		
		setTimeout(reset, 800)
		
		function reset() {
			pz = panzoom(g.node());
			compareButton.style('display', 'initial');
			dayNightSlide.style('display', 'initial');
			dateSlide.style('display', 'initial');
		} 
		
		clicked = false;
		
		var nbh = d3.select('#' + code)
		
		nbh.style('fill' , fill);
		
		destroyChart();
	}
	
	function makeXButton(mode, code = false, fill = false) {
		d3.select('#svgContainer')
			.append('div').html('&#10006;')
			.attr('id', 'closeBut')
			.style('top', '0px')
			.style('right', '0px')
			.style('font-size', '30px')
			.style('position', 'absolute')
			.on('mouseover', function() {
				d3.select(this).style('cursor', 'pointer');
			})
			.on('click', function(){
				if (mode == 'compare') {
					undoCompare(this);
				} else if (mode == 'zoom') {
					undoZoom(this, code, fill);
				}
			});
	}
	
	function addChartCanvas() {
		d3.select('#svgContainer')
			.append('div')
			.attr('id', 'chartDiv')
			.style('position', 'relative')
			.style('float', 'right')
			.style('max-width', '0px')
			.style('max-height', '0px')
			.append('canvas')
			.attr('id', 'charts');
		
		var s = d3.select('#SVG').node().getAttribute('width');
		var c = d3.select('#svgContainer').node().offsetWidth;
		d3.select('#chartDiv').style('max-width', c-s-100 + 'px').style('max-height', height + 'px');
		d3.select('#charts').attr('height', height).attr('width', c-s-100);
	}
	
	function destroyChart() {
		chart.destroy();
		d3.select('#chartDiv').remove();
	}
});


function colorMap(MY, hour) {
	
	for (nbh in dataDict) {
		if (MY in dataDict[nbh]) {
			if (dataDict[nbh][MY][hour] == 0) {
				d3.select('#' + nbh).transition().duration(300).style('fill', '#999');
				continue;
			}
		} else {
			d3.select('#' + nbh).transition().duration(300).style('fill', '#999');
			continue;
		}
		var data = dataDict[nbh][MY][hour];
		var name = dataDict[nbh].name
		
		d3.select('#' + nbh).transition().duration(300).style('fill', function () {
				return mapColorScale(data);
			});
	}
	
}
