function drawPlot(data, index) {
	var names = data[index].names
	
	xData = {};
	nameCountPerDay = {};
	data.map(function(el){
		var multiple = 0;
		if (nameCountPerDay[el.date] == null) {
			nameCountPerDay[el.date] = 0;
		}
		for (name in names) {
			if (el.names.indexOf(names[name]) > -1) {
				if (xData[names[name]] == null) {
					xData[names[name]] = [];
				}
				xData[names[name]].push(el.date)
				nameCountPerDay[el.date]++;
			}
		}
	});
	
	var d = [];
	for (key in names) {
		var vals = xData[names[key]];
		var i = {};
		i['x'] = vals;
		i['y'] = fillArray(names[key], vals.length);
		i['mode'] = 'markers';
		i['type'] = 'scatter';
		i['name'] = names[key];
		i['hoverinfo'] = "x+y";
		d.push(i);
	}

	var y = [];
	var x = [];
	for (var key in nameCountPerDay) {
		if (nameCountPerDay.hasOwnProperty(key)) {
			y.push(nameCountPerDay[key]);
			x.push(key)
		}
	}
	var lineData = {
		x: x,
		y: y,
		type: 'bar',
		yaxis: 'y2',
		hoverinfo: "x+y"
	}
	d.push(lineData)	
	
	var max = Math.max(...y)
	var tickvals = function(max) {
		a = [];
		for (var i = 1; i <= max; i++) {
			a.push(i)
		}
		return a
	}
	
	var margin = function(){
		if (index >= data.length * 0.5) {
			return -50;
		}
		else return 50;
	}

	var layout = {
		height: window.innerHeight * 0.8,
		showlegend: false,
		hovermode:'closest',
		margin: {
			l: 150,
			t: 45
		},
		yaxis: {
			title: "Naam locaties",
			tickfont: {
				size: 10
			},
			type: 'category',
			showticklabels: true,
			range: [-(names.length+1), names.length],
			zeroline: false,
			gridcolor: "rgb(159, 197, 232)"
		},
		yaxis2: {
			side: 'right',
			overlaying: 'y',
			title: "Aantal namen per dag",
			range: [0, max * 2.2],
			autotick: false,
			tickmode: 'array',
			tickvals: tickvals(max),
			dtick: function() {
				if (max > 20) {
					return 2
				}else if (max > 40) {
					return 5
				}else {
					return 1
				}
			},
			gridcolor: "rgb(159, 197, 232)", 
		},
		xaxis: {
			title: 'Resoluties',
			zeroline: false,
			range: [new Date(data[0].date).getTime(), new Date(data[data.length - 1].date).getTime()]
		},
		shapes: [{
			type: 'line',
			yref: 'paper',
			x0: data[index].date,
			x1: data[index].date,
			y0: 0.5,
			y1: 1,
			fillcolor: '#000',
			line: {
				width: 1
			}
		}],
		annotations: [{
			yref: 'paper',
			x: data[index + margin()].date,
			y: 1.07,
			yanchor: 'top',
			text: 'Document focus: ' + data[index].date + '<br> Resolutie ' + data[index].resolution,
			showarrow: false
		}]
	}
	
	Plotly.newPlot('plot', d, layout)
}

// http://stackoverflow.com/questions/12503146/create-an-array-with-same-element-repeated-multiple-times-in-javascript
function fillArray(value, len) {
  if (len == 0) return [];
  var a = [value];
  while (a.length * 2 <= len) a = a.concat(a);
  if (a.length < len) a = a.concat(a.slice(0, len - a.length));
  return a;
}
