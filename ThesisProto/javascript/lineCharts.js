function barChart1(data, yearMin, yearMax) {
	var r = range(yearMin, yearMax + 1 - yearMin);

	var years = [];
	var tfs = [];
	for (object in data) {
		years.push(data[object].year[0])
		tfs.push(data[object].tf[0])
	}
	
	var allTfs = [];
	for (var i = 0; i<r.length; i++) {
		if (years.indexOf(r[i]) > 0) {
			var matches = getMatchIndexes(years, r[i])
			var c = 0
			for (idx in matches){
				c += tfs[matches[idx]]
			}
			allTfs.push(c)
		}else {
			allTfs.push(0)
		}
	}
	var d = [
		{
			x : r,
			y : allTfs,
			type : 'bar'
		}
	];
	var layout = {
	  title: 'Hits per year',
	  width: 1140,
	  height: 400,
	  xaxis: {
		title: 'Year',
	  },
	  yaxis: {
		title: 'Occurrences',
	  }
	};
	Plotly.newPlot('chart', d, layout);
}

function barChart2(data, speakers) {
	var obj = {};
	for (speaker in speakers) {
		obj[speakers[speaker]] = 0;
	}
	for (object in data) {
		var speaker = data[object].speaker[0];
		obj[speaker] += data[object].tf[0];
	}
	
	var y = [];
	var x = [];
	for (var key in obj) {
	    if (obj.hasOwnProperty(key)) {
			y.push(obj[key])
			x.push(key)
	    }
	}
	
	var d = [
		{
			x : x,
			y : y,
			type : 'bar'
		}
	];
	var layout = {
	  title: 'Hits per speaker',
	  width: 1140,
	  height: 400,
	  margin: {
		b: 100
	  },
	  xaxis: {
		title: 'Speaker',
		tickangle: -45,
		tickfont: {
		  size: 10	
		}
	  },
	  yaxis: {
		title: 'Occurrences'
	  },
	};
	Plotly.newPlot('chart', d, layout);
}

function range(start, count) {
  return Array.apply(0, Array(count))
	.map(function (element, index) { 
	  return index + start;  
  });
}

function getMatchIndexes(arr, toMatch) {
	if (toMatch % 1 === 0) {
		var toMatchLength = 1;
	}else {
		var toMatchLength = toMatch.length;
	}
	var indexMatches = [], match,
        i = 0;
    
    while ((match = arr.indexOf(toMatch, i)) > -1) {
        indexMatches.push(match);
        i = match + toMatchLength;
    }
    
    return indexMatches;
}
