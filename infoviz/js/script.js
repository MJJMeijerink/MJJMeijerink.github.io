function init() {
	// Global variables
	var dataDict = {},
		currentDate = '07/2014',
		currentHour = '14',
		mapColorScale = d3.scale.linear()
			.domain([1, 3])
			.range(['#fb6a4a','#67000d']),
		chart,
		hours = true,
		comparing = false,
		pid = null,
		year = 2005;
	
	//Loading text
	var conWidth = document.getElementById('svgContainer').offsetWidth;
	var conHeight = window.innerHeight;
	
	d3.select('#svgContainer')
		.append('div')
		.attr('id', 'loadtext')
		.style('width', conWidth + 'px')
		.style('height', conHeight/2 + 'px')
		.style('text-align', 'center')
		.style('vertical-align', 'middle')
		.style('line-height', conHeight/2 + 'px')
		.html("I'm loading!");
	
	
	// Loading all data, happens before anything else can happen.
	d3.csv("data/flatmetbuurten.csv", function(data) {
		function getData(d) {
			for (i = 0; i < d.length; i++) {
				var nbhCode = 'F' + d[i]['neighborhood_id_ams'];
				var inciPrio = d[i]['incident_prio'];
				var nbhName = d[i]['neighborhood_name_ams'];
				var inciTime = new Date(d[i]['incident_timestamp'].substring(0,19));
				var inciCat = d[i]['incident_category'];
				var month = inciTime.getMonth() + 1;
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
						
						for (var x in categories) {
							if (categories[x] != inciCat) {
								dataDict[nbhCode][inciTimeMY][categories[x]] = 0;
							} else if (categories[x] == inciCat) {
								dataDict[nbhCode][inciTimeMY][categories[x]] = 1;
							}
						}
						
						for (var y in priorities) {
							if (priorities[y] != inciPrio) {
								dataDict[nbhCode][inciTimeMY]['prio' + priorities[y]] = 0;
							} else if (priorities[y] == inciPrio) {
								dataDict[nbhCode][inciTimeMY]['prio' + priorities[y]] = 1;
							}
						}
						
					} else {
						dataDict[nbhCode][inciTimeMY]['total']++;
						dataDict[nbhCode][inciTimeMY][inciHour.toString()]++;
						dataDict[nbhCode][inciTimeMY][inciCat]++;
						dataDict[nbhCode][inciTimeMY]['prio' + inciPrio]++;
					}
				}
			}
		}
		var categories = ['Alarm', 'Bezitsaantasting', 'Brand', 'Dienstverlening', 'Gezondheid', 'Leefmilieu', 'Ongeval', 'Overige', 'Railvervoer', 'Veiligheidenopenbareorde', 'Verkeer'];
		var translated = ['Alarm', 'Conversion of property', 'Fire', 'Services', 'Health', 'Environment', 'Accident', 'Other', 'Railway traffic', 'Safety and public order', 'Traffic']
		
		var priorities = ['1', '2', '3', '4', '5'];
		
		getData(data);
		
		d3.select('#loadtext').remove();
		
		//
		// Filter functionality
		//
		
		d3.select('#filterBut').style('display', 'initial');
		
		$(".check").prop("checked", true);

		$('.dropdown-menu .prio').on('click', function(event) {
			var $target = $( event.currentTarget ),
			    val = $target.attr('data-value'),
			    $inp = $target.find('input'),
			    idx;

		    if ((idx = priorities.indexOf(val)) > -1 ) {
			    priorities.splice(idx, 1);
			    setTimeout(function() {$inp.prop('checked', false)}, 0);
			    dataDict = {}
			  
		    } else {
			    priorities.push( val );
			    setTimeout(function() {$inp.prop('checked', true)}, 0);
			    dataDict = {}
		    }

		    $(event.target).blur();
			
		   	getData(data.filter(selectPrio));
			colorMap(currentDate, currentHour, false);
		    return false;
		});
		
		function selectPrio(d) {
			if (priorities.length == 5) {
				return true
			} else {
				var i = priorities.indexOf(d.incident_prio);
				if (i != -1) {
					return d.incident_prio == priorities[i]
				} 
			}
		}
		
		$('.dropdown-menu .cat').on('click', function(event) {

		    var $target = $( event.currentTarget ),
			    val = $target.attr('data-value'),
			    $inp = $target.find('input'),
			    idx;

		    if ((idx = categories.indexOf(val)) > -1 ) {
			    categories.splice(idx, 1);
			    setTimeout(function() {$inp.prop('checked', false)}, 0);
			    dataDict = {}
			  
		    } else {
			    categories.push( val );
			    setTimeout(function() {$inp.prop('checked', true)}, 0);
			    dataDict = {}
		    }

		    $(event.target).blur();

		   	getData(data.filter(selectCat));
			colorMap(currentDate, currentHour, false);
		    return false;
		   
		});
		
		function selectCat(d) {
			if (categories.length == 11) {
				return true
			} else {
				var i = categories.indexOf(d.incident_category);
				if (i != -1) {
					return d.incident_category == categories[i]
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
			.attr('class', 'btn btn-default')
			.attr('id', 'compare')
			.style('position', 'absolute')
			.html('Compare')
			.on('click', compare);

		var pz = panzoom(g.node());
		
		var selected = [];
		
		
		//
		// Date Slider Functionality
		//
		
		var dateSlidediv = d3.select('#svgContainer').append('div')
			.style('position', 'absolute')
			.style('bottom', '-95px')
			.style('width', 'inherit')
			.style('left' , '0px');
		dateSlidediv.append('label').html('Months')
		
		var dateSlide = dateSlidediv
			.append('input')
			//.attr('class', 'form-control')
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
			.attr('value', function() {
				return new Date('2014/07/02').valueOf();
			})
			.attr('id', 'dateSlide');
			
		var dateDisplay = d3.select('.page-header')
			.append('span')
			.html('July 2014');

		document.getElementById('dateSlide').oninput = datesliding;
		
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
		
		var oldm = 12000; //can't be a month so that's okay
		function datesliding() {
			var val = this.value;
			var d = new Date(parseInt(val));
			var m = d.getMonth() + 1;
			var fullMonth = month[m - 1];
			year = d.getFullYear()
			if (m != oldm) {
				if (m < 10) {
					m = '0' + (m);
				}
				dateDisplay.html(fullMonth + ' ' + d.getFullYear());
				currentDate = m+'/'+d.getFullYear();
				colorMap(currentDate, currentHour, false);
				if (comparing) {
					bchart(d=null, 'updateMonths');
				}
			}
			oldm = m;
		}
		
		//
		// Day Night Slider Functionality
		//
		
		var dayNightdiv = d3.select('#svgContainer').append('div')
			.style('position', 'absolute')
			.style('width', 'inherit')
			.style('left' , '0px')
			.style('bottom', '-50px');
		
		dayNightdiv.append('label').html('Hours');
		
		var dayNightSlide = dayNightdiv
			.append('input')
			//.attr('class', 'form-control')
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
			.domain([0, 0.2, 0.6, .75, 1])
			.range(["#003366", "#FFFFFF" , "#FFFFFF", "#003366", "#003366"]);
			
		var rect = dayNightOverlay.append('rect')
			.attr('height', '100%')
			.attr('width', '100%')
			.attr('fill', function() {
				return dayNightColorScale(dayNightSlide.node().value/1000);
			})
			.attr('opacity', 0.9);

		d3.select('.page-header').style('border-bottom', 'none')
		var displayColorScale = d3.scale.linear().domain([0,.2,.6,1])
			  .range([d3.rgb("#FFF"), d3.rgb("#333"), d3.rgb("#333"), d3.rgb('#FFF')]);
			
		var h24 = 24 * 60 * 60 * 1000;
		var initDate = new Date('jan 1 1970 05:00:00');

		var timeDisplay = d3.select('.page-header')
			.append('span')
			.html(' -&nbsp;' + new Date(initDate.valueOf() + 0.4 * h24).getHours() + ':00'); //- ' + new Date(initDate.valueOf() + h24/12).getHours().toString() + ':00');

		document.getElementById('dnslider').oninput = timeslide;
		
		var oldh = 831013; //random number that cannot be an hour
		function timeslide() {
			var val = this.value;
			var perc = val/1000;
			rect.attr('fill', dayNightColorScale(perc));
			d3.select('.page-header')
				.style('color', displayColorScale(perc));
			var updateDate = new Date(initDate.valueOf() + perc * h24)
			var hours = updateDate.getHours();
			if (hours != oldh) {
				timeDisplay.html(' -&nbsp;' + hours + ':00'); //- ' + new Date(updateDate.valueOf() + h24/12).getHours().toString() + ':00');
				currentHour = hours;
				colorMap(currentDate, currentHour, false);
				if (comparing) {
					bchart(d=null, 'updateMonths');
				}
			}
			oldh = hours;
		}
	
		var toggle = d3.select('#svgContainer')
			.append('div')
			.attr('id', 'toggleBut')
			.style('position', 'absolute')
			.style('bottom', 0)
			.style('left', 0)
			.append('label')
			.html('Turn hourly data on/off <br>')
			.append('input')
			.attr('checked', 'checked')
			.attr('name', 'toggle')
			.attr('type', 'checkbox')
		
		$.fn.bootstrapSwitch.defaults.size = 'small';
		$('[name="toggle"]').bootstrapSwitch();
		
		$('input[name="toggle"]').on('switchChange.bootstrapSwitch', function(event, state) {
		    hours = state;
			if (!state) {
				notify('Data will now be displayed per month!')
				toggleHoursOff();
			} else {
				notify('Data will now be displayed per month and hour of the day!')
				toggleHoursOn();
			}
			colorMap(currentDate, currentHour);
			if (comparing) {
				bchart(d=null, 'updateMonths');
			}
		});
	
		//
		// Parallax Functionality
		//
		
		var parallaxOverlay = d3.select('#overlay2').append('div')
			.attr('id', 'parallaxViz')
			.style('width', '100%')
			.style('height', '100%')
			.style('background-color', 'white')
			.style('position', 'fixed')
			.style('top', window.innerHeight*2 + 'px')
			.style('left', 0)
			
		var parallaxOverlay2 = d3.select('#overlay3').append('div')
			.attr('id', 'parallaxIntro')
			.style('width', '100%')
			.style('height', '100%')
			.style('background-color', 'white')
			.style('opacity', 0.96)
			.style('position', 'fixed')
			.style('top', '0px')
			.style('left', 0)
			.append('div')
			.attr('class', 'container')
			.append('div')
			.attr('class', 'row')
			.append('div')
			.attr('class', 'col-log-12')
			.attr('id', 'introText')
			.append('h1')
			.style('class', 'page-header')
			.style('margin-top', '150px')
			.style('text-align', 'center')
			.html('Information Visualization')
			
		d3.select('#introText').append('p')
			.style('font-size', '20px')
			.html('The fire brigade Amsterdam has handled more than 192.000 incidents in the last eleven years which you can see coming alive in the following map.\
				<br>The neighborhoods are colored based on the amount of incidents in that neighborhood at a certain time, which you can change using the time sliders. \
				The darker red the color of the neighborhood, the more incidents that have taken place there in that time period.<br>The map can be filtered on incident priority and category,\
				based on the priority and categories provided by the fire brigade.<br>Neighborhoods can be compared using the compare button. Just click the button, then click two or more neighborhoods, \
				and a graph comparing the incidents in that time period between those neighborhoods will appear.<br>The map will show when you scroll down. Just scroll up to read this message again! \
				If you scroll down a second time, you will see priority circles containing dots, which stand for the different neighborhoods. Each dot represents a neighborhood\'s average incident priority.\
				Using the slider you can see this change throughout the years.')
			

		window.addEventListener('DOMMouseScroll', mouseWheelEvent);
		window.addEventListener('mousewheel', mouseWheelEvent);

		var pos = 0; 

		var parallaxsvg = d3.select('#parallaxViz');
		var parallaxintro = d3.select('#parallaxIntro');
		var layer = 'top';
		var limit = 12;
		
		var out = false;
		function mouseWheelEvent(e) {
			if (!$('#SVG').is(":hover")) {
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
					
					if (pos <= limit) {
						pos += 1;
					} else if (pos > limit) {
						if (layer == 'top') {
							parallaxintro.transition().duration(1000).style('top', -window.innerHeight + 'px');
							layer = 'nothing';
							setTimeout(function() {
								layer='middle';
							}, 1000);
						} else if (layer == 'middle') {
							parallaxsvg.transition().duration(1000).style('top', '0px');
							layer = 'nothing';
							setTimeout(function() {
								layer='bottom';
							}, 1000);
							setTimeout( function() {
								notify('You can see the average priority per neighborhood here!');
							},1000);
						}
						clearTimeout(timeout);
						pos = 0;
						out = false;
					}
				
				} else {
					
					if (pos <= limit) {
						pos += 1;
					} else if (pos > limit) {
						if (layer == 'middle') {
							parallaxintro.transition().duration(1000).style('top', '0px');
							layer = 'nothing';
							setTimeout(function() {
								layer='top';
							}, 1000);
						} else if (layer == 'bottom') {
							parallaxsvg.transition().duration(1000).style('top', window.innerHeight*2 + 'px');
							layer = 'nothing';
							setTimeout(function() {
								layer='middle';
							}, 1000);
						}
						clearTimeout(timeout);
						pos = 0;
						out = false;
					}
					
				}
			}
		}
		
		$(document).keyup(function(e) {
			 if (e.keyCode == 27) { // escape key maps to keycode `27`
				if (comp) {
					undoCompare();
				} else if (clicked) {
					undoZoom();
				} else if (layer == 'bottom') {
					parallaxsvg.transition().duration(1000).style('top', window.innerHeight*2 + 'px');
					layer = 'middle';
				}
			}
		});
		
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
				.style('cursor', 'pointer')
				.on('mousedown', function(d) {
					now = true;
					setTimeout(function() {
						now = false;
					},200)
				})
				.on('mouseup', function(d) {
					if (!clicked) {
						if (now) {
							nbhSelected(d);
						}
					} else if (comp) {
						var el = d3.select(this).node()
						var sw = window.getComputedStyle(el).getPropertyValue('stroke-width');
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
						d3.select('#tooltip').remove();
						el.parentNode.appendChild(el);
					}
				});
				
				colorMap(currentDate, currentHour, false);
		});
		
		//
		// Functions
		//
		
		function toggleHoursOff() {
			dayNightdiv.style('opacity', 0.5);
			dayNightSlide.attr('disabled', 'disabled');
			mapColorScale = d3.scale.linear()
				.domain([1, 15])
				.range(['#fb6a4a','#67000d'])
			timeDisplay.style('display', 'none');
			rect.attr('fill', '#fff');
			d3.select('.page-header').style('color', '#333');
		}
		
		function toggleHoursOn() {
			dayNightdiv.style('opacity', 1);
			dayNightSlide.attr('disabled', null);
			mapColorScale = d3.scale.linear()
				.domain([1, 3])
				.range(['#fb6a4a','#67000d'])
			timeDisplay.style('display', 'initial');
			rect.attr('fill', dayNightColorScale(document.getElementById('dnslider').value/1000));
			d3.select('.page-header').style('color', displayColorScale(document.getElementById('dnslider').value/1000));			
		}
		
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
			notify('Click on two or more neighborhoods to compare them!')
			
			comp = true;
			clicked = true;
			
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
				.style('opacity', 1);
			
			compareZoom();
				
			window.setTimeout(xButton, 800);
			
			function xButton(){		
				makeXButton('compare');
			};
		};
		
		var compareColorScale = d3.scale.linear()
			.domain([1, 10])
			.range(['#fb6a4a','#67000d']);
			
		function hexToRGB(hex, alpha) {
			var r = parseInt(hex.slice(1, 3), 16),
				g = parseInt(hex.slice(3, 5), 16),
				b = parseInt(hex.slice(5, 7), 16);

			if (alpha) {
				return "rgba(" + r + ", " + g + ", " + b + ", " + alpha + ")";
			} else {
				return "rgb(" + r + ", " + g + ", " + b + ")";
			}
		}
		
		function bchart(d, mode) {
			comparing = true;
			d3.select('#placeholdertext').transition().duration(800).style('opacity', 0).remove();
			
			if (!hours) {
				try {
					var val = dataDict['F' + d.Buurt_code.substring(1)][currentDate].total;
				} catch (e) {
					var val = 0;
				}
			} else {
				try {
					var val = dataDict['F' + d.Buurt_code.substring(1)][currentDate][currentHour];
				} catch (e) {
					var val = 0;
				}
			}
		
			if (mode == 'create') {
				
				addChartCanvas();
				var data = {
					labels: [d['Buurt'].split(' ')],
					datasets: [
						{
							label: 'Incidents',
							data: [val],
							borderWidth: 2,
							borderColor: [compareColorScale(val)],
							backgroundColor: [hexToRGB(compareColorScale(val), 0.3)]
						}
					]
				}
				
				var ctx = document.getElementById('charts').getContext('2d');
				if (hours) {
					var tText = 'Compare neighborhoods - Incidents per month and hour of the day';
				} else {
					var tText = 'Compare neighborhoods - Incidents per month';
				}
				
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
							text: tText
						},
						legend: {
							display: false
						}

					}
				});
				
			}
			else if (mode == 'update') {
			
				chart.data.datasets[0].data.push(val);
				chart.data.labels.push(d['Buurt'].split(' '));
				chart.data.datasets[0].backgroundColor.push(hexToRGB(compareColorScale(val), 0.3));
				chart.data.datasets[0].borderColor.push(compareColorScale(val));
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
			else if (mode == 'updateMonths') {
				var d = [];
				var l = [];
				var bgColors = [];
				var bordColors = [];
				for (var nbh in selected) {
					var id = selected[nbh].id;
					if (hours) {
						try {
							var val = dataDict[id][currentDate][currentHour];
						} catch (e) {
							var val = 0;
						}
						d.push(val);
					} else {
						try {
							var val = dataDict[id][currentDate].total;
						} catch (e) {
							var val = 0;
						}
						d.push(val);
					}
					bgColors.push(hexToRGB(compareColorScale(val), 0.3));
					bordColors.push(compareColorScale(val));
					l.push(dataDict[id].name.split(' '));
				}
				
				if (hours) {
					var tText = 'Compare neighborhoods - Incidents per month and hour of the day';
				} else {
					var tText = 'Compare neighborhoods - Incidents per month';
				}
				
				chart.options.title.text = tText;
				chart.data.datasets[0].data = d;
				chart.data.labels = l;
				chart.data.datasets[0].backgroundColor = bgColors;
				chart.data.datasets[0].borderColor = bordColors;
				chart.update();
			}
			else if (mode == 'updateHours') {
				var d = [];
				var l = [];
				var bgColors = [];
				var bordColors = [];
				for (var nbh in selected) {
					var id = selected[nbh].id;
					try {
						var val = dataDict[id][currentDate][currentHour];
					} catch (e) {
						var val = 0;
					}
					d.push(val);
					bgColors.push(hexToRGB(compareColorScale(val), 0.3));
					bordColors.push(compareColorScale(val));
					l.push(dataDict[id].name.split(' '));
				}
				chart.data.datasets[0].data = d;
				chart.data.labels = l;
				chart.data.datasets[0].backgroundColor = bgColors;
				chart.data.datasets[0].borderColor = bordColors;
				chart.update();
			}
			
			var c = d3.select('#charts').node();
			c.onclick = function(e) {
			    var active = chart.getElementsAtEvent(e);
			    var key = active[0]._xScale.ticks[active[0]._index].join(' ')
			    for (var el in selected) {
			 	    var nbhName = dataDict[selected[el].id].name;
		 		    if (nbhName == key) {
	 				    key = selected[el].id
 				    }
			    }
			    showInfo(dataDict[key][currentDate], dataDict[key].name, currentDate);
			};
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
						label: 'Incidents',
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
			
			ctx.onclick = function(e) {
			   var active = chart.getElementsAtEvent(e);
			   var key = active[0]._xScale.ticks[active[0]._index]
			   showInfo(nbhJson[key], nbhJson.name, key);
			};
		
		
		}
		
		function showInfo(info, nbhName, date) {
			var y = date.split('/')[1]
			if (date.split('/')[0][0] == '0') {
				var m = month[date.split('/')[0].substring(1) - 1]
			} else {
				var m = month[date.split('/')[0] - 1]
			}
			
			var prioString = '';
			var catString = '';
			var tString = '';
			for (var key in info) {
			    if (info.hasOwnProperty(key)) {
					if (key.indexOf('prio') != -1) {
						if (info[key] > 0) {
							prioString += 'Priority ' + key.substring(4) + ': ' + info[key] + '<br>'; 
						}
					} else if (categories.indexOf(key) != -1) {
						if (info[key] > 0) {
							catString += translated[categories.indexOf(key)] + ': ' + info[key] + '<br>';
						}
					} else if (key == 'total') {
						tString += '<strong>Total incidents: '+ info[key] +'</strong>';
					}
			    }
			}
			
			d3.select('body').append('div')
				.attr('id', 'infoModal')
				.style('position', 'absolute')
				.html('<div class="modal fade" id="myModal" role="dialog">\
						<div class="modal-dialog">\
						  <div class="modal-content">\
							<div class="modal-header">\
							  <button type="button" class="close" data-dismiss="modal" onclick="closeModal();">&times;</button>\
							  <h4 class="modal-title">' + nbhName +' - ' + m + ' ' + y + '</h4>\
							</div>\
							<div class="modal-body">\
								<strong>Incident priorities</strong>\
								<p id="prios">' + prioString + '</p>\
								<strong>Incident categories</strong>\
								<p id="cats">' + catString + '</p>\
								' + tString + '\
							</div>\
						  </div>\
						</div>\
					  </div>');
			
			$('#myModal').modal({backdrop: 'static'});
			$('#myModal').modal('show');
		}
		
		function hideElements() {
			if (!comp) {
				dayNightdiv.style('display', 'none');
				dateSlidediv.style('display', 'none');
				d3.select('#toggleBut').style('display', 'none');
				d3.select('#title').style('visibility', 'hidden')
			}
			compareButton.style('display', 'none');
			d3.select('#filterBut').style('display', 'none');
		}
		
		var fill;
		var c;
		function setZoom(code) {
			c = code;
			
			d3.selectAll('.neighborhood').transition().duration(800).style('opacity', .1);
			
			var newWidth = height,
				newHeight = height,
				mapSF = .6,
				transDuration = 800;
			
			var nbh = d3.select('#' + code);
			var element = nbh.node();
			fill = window.getComputedStyle(element).getPropertyValue('fill');
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
		
		function undoCompare() {
			comparing = false;
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
			
			d3.select('#closeBut').remove();
			
			setTimeout(reset ,800)
			
			function reset() {
				compareButton.style('display', 'initial');
				//dayNightdiv.style('display', 'initial');
				//dateSlidediv.style('display', 'initial');
				d3.select('#filterBut').style('display', 'initial');
				//d3.select('#toggleBut').style('display', 'initial');
			}
			
			clicked = false;
			comp = false;
			
			d3.selectAll('.neighborhood').style('stroke-width', 1)
			
			destroyChart();

			selected = [];
		}
		
		function undoZoom() {
			pid = null;
			d3.select("#psvg").remove();
			createData(dataglob);
			
			svg.transition().duration(800)
				.attr('width', width)
				.attr('height', height);
			d3.selectAll('.neighborhood').transition().duration(800)
				.style('opacity', 1);
			d3.select('#mapLayer').transition().duration(800)
				.attr('transform', 'matrix(1, 0, 0, 1, 0, 0)');
			d3.select('#closeBut').remove();
			
			setTimeout(reset, 800)
			
			function reset() {
				pz = panzoom(g.node());
				compareButton.style('display', 'initial');
				dayNightdiv.style('display', 'initial');
				dateSlidediv.style('display', 'initial');
				d3.select('#filterBut').style('display', 'initial');
				d3.select('#toggleBut').style('display', 'initial');
				d3.select('#title').style('visibility', 'initial');
			} 
			
			clicked = false;
			
			var nbh = d3.select('#' + c)
			
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
						undoCompare();
					} else if (mode == 'zoom') {
						undoZoom();
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
		
		function nbhSelected(d) {
			zoomIn('F' + d.properties.Buurt_code.substring(1));
			d3.select("#psvg").remove();
			pid = 'F' + d.properties.Buurt_code.substring(1);
			createData(dataglob);
			notify('Click on a datapoint to get extra information! <br><br> You can scroll down to see the average priority for this neighborhood!')
			clicked = true;
		}
		
		//
		// Parallax Visualization
		//
		
		var positions = {};
		function createposition(dataset){
		  
		   
		   for (i = 0; i < dataset.length; i++) {
			 nameplace = dataset[i].neighborhood_name_ams;

				if (!positions.hasOwnProperty(nameplace)){
					positions[nameplace] = (Math.random() * (1 - 0) + 0).toFixed(2);
				 }
			}        
		};		
		
		var dataglob;
		d3.csv("data/perpriobuurtjaar.csv", function(data) {
			dataglob = data;
			createposition(data);
			createData(dataglob);
		});

		function createData(dataset){
		    var areas = []
		    for (i = 0; i < dataset.length; i++) { 
				if (dataset[i].year == year){
					//console.log(typeof positions[dataset[i].neighborhood_name_ams])
					areas.push([dataset[i].neighborhood_name_ams, dataset[i].incident_prio,positions[dataset[i].neighborhood_name_ams], dataset[i].neighborhood_id_ams])
				}
			}
			drawPoints(areas)

		};

		function drawPoints(data) {
			/*https://www.dashingd3js.com/creating-svg-elements-based-on-data*/
			var circleRadii = [5, 4, 3, 2, 1];
			var radiusSize = height/10;
			var placeX = 1170/2;
			var placeY = height/2;
			document.getElementById("year").innerHTML = 'Year: ' + year;

			var transition = d3.transition();
		 
			var svg = d3.select("#svgContainer2").append("svg")
				.attr('id', 'psvg')
				.attr("width", 1170)
				.attr("height", height);
		 
			var circles = svg.selectAll("circle")
				.data(circleRadii)
				.enter()
				.append("circle");

			var circleAttributes = circles
				.attr("cx", placeX)
				.attr("cy", placeY)
				.attr("r", function (d) { return d*radiusSize; })
				.style("fill", function(d) {
					var returnColor;
					if (d === 5) { returnColor = "#F5A9A9";
					} else if (d === 3) { returnColor = "#FE2E2E";
					} else if (d === 4) { returnColor = "#FA5858";
					} else if (d === 2) { returnColor = "#DF0101"; 
					} else if (d === 1) { returnColor = "#FFFFFF"; }
					return returnColor;
				});

			/*http://alignedleft.com/tutorials/d3/making-a-scatterplot*/
			var points = svg.selectAll(".point")
				.data(data)
				.enter()
				.append("circle")
				.attr('id', function(d){
					return 'PF' + d[3];
				})
				.attr("cx", function(d) {
					return ((d[1]*radiusSize)*Math.cos(2 * Math.PI * d[2] ))+placeX; 
				})
				.attr("cy", function(d) {
					return ((d[1]*radiusSize)*Math.sin(2 * Math.PI * d[2]))+placeY; 
				})
				.attr("r", function (d) {
					if ('F' + d[3] == pid) {
						return 8;
					} else {
						return 3;
					}
 				})
				.on('mouseover', function(d) {
					
					div = d3.select('body').append('div')	
						.attr('id', 'tooltip');
					div.html(d[0] + '<br> Average priority: ' + d[1])
					d3.select(this).style('fill', 'gray')
				
				})
				.on('mouseout', function(d) {		
					div.remove();
					if ('F' + d[3] == pid) {
						d3.select(this).style('fill', 'blue');
					} else {
						d3.select(this).style('fill', 'black');
					}
				})
				.on('mousemove', function() {
					div
						.style('left', (d3.event.pageX + 20) + 'px')		
						.style('top', (d3.event.pageY - 50) + 'px');
				})
				.style("opacity", 0.0)
				.style('cursor', 'pointer')
				.transition()
				.duration(500)
				.style("opacity", 1)
				.style("fill", function(d) {
					if ('F' + d[3] == pid) {
						return 'blue';
					} else {
						return 'black';
					}
				});
			
			if (pid != null) {
				var ontop = d3.select('#P' + pid).node();
				ontop.parentNode.appendChild(ontop);
			}

		}; /*end function drawpoints*/
		
		var Psvg = d3.select('#parallaxViz').append('div')
			.style('margin-top', '100px')
			.attr('class', 'container')
			.append('div')
			.attr('class', 'row')
			.append('div')
			.attr('class', 'col-lg-12')
			.attr('id', 'svgContainer2');
			
		var yearSlide = d3.select('#svgContainer2').append('div')
			.style('position', 'absolute')
			.style('bottom', '-50px')
			.style('width', 'inherit');
		
		yearSlide.append('label').attr('id', 'year').html('Year: 2005');
		
		var yearSlider = yearSlide
			.append('input')
			//.attr('class', 'form-control')
			.attr('type', 'range')
			.attr('min', 2005)
			.attr('max', 2017)
			.attr('value', year)
			.attr('id', 'nYear');
		
		d3.select("#nYear").on("input", function() {
			updateData(+this.value);
		});
		
		//Function that updates the data for each year  
		function updateData(val) {
			year = val;
			//First remove the previous content of the barchart
			d3.select("#psvg").remove();
			createData(dataglob)
			//Calls to draw the bar chart for the new year 
		};
	});


	function colorMap(MY, hour) {
		for (nbh in dataDict) {
		
			if (MY in dataDict[nbh]) {
				if (dataDict[nbh][MY][hour] == 0 && hours) {
					d3.select('#' + nbh).transition().duration(300).style('fill', '#999');
					tooltip(nbh, data=false);
					continue;
				}
			} else {
				d3.select('#' + nbh).transition().duration(300).style('fill', '#999');
				tooltip(nbh, data=false);
				continue;
			}
			if (!hours) {
				var data = dataDict[nbh][MY]['total'];
			} else {
				var data = dataDict[nbh][MY][hour];
			}
			var name = dataDict[nbh].name
			
			d3.select('#' + nbh).transition().duration(300).style('fill', function () {
					return mapColorScale(data);
				});
				
			tooltip(nbh, data);
		}
	
		function tooltip(nbh, data) {
			
			d3.select('#' + nbh)
				.on('mouseover', function(d) {
					
					div = d3.select('body').append('div')	
						.attr('id', 'tooltip')
						.style('left', (d3.event.pageX + 20) + 'px')		
						.style('top', (d3.event.pageY - 50) + 'px');
					if (!data) {
						div.html(d.properties.Buurt)
					} else {
						div.html(d.properties.Buurt + '<br> Incidents: ' + data)
					}					
				
					})					
				.on('mouseout', function() {		
					div.remove();
				})
				.on('mousemove', function() {
					div
						.style('left', (d3.event.pageX + 20) + 'px')		
						.style('top', (d3.event.pageY - 50) + 'px');
				})
				
		}
	
	}
}

var notifTimeout;
var activeNotifs = 0;
function notify(text) {
	d3.select('#N' + activeNotifs).remove();
	if (typeof notifTimeout != 'undefined') {
		clearTimeout(notifTimeout);
	}
	activeNotifs += 1
	var notification = d3.select('body')
		.append('div')
		.attr('class', 'alert alert-info')
		.attr('id', 'N' + activeNotifs)
		.style('position', 'absolute')
		.style('z-indez', 1000)
		.style('top', '70px')
		.style('right', '20px')
		.append('strong')
		.html(text)
		
	notifTimeout = setTimeout(function () {
		d3.select('#N' + activeNotifs).remove();
		activeNotifs -= 1
	}, 6000);
	
}

function closeModal() {
	setTimeout(function() {
		d3.select('#infoModal').remove();
	}, 500)
}