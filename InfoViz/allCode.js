//Slideshow!
var count = 2002;
var done = false;
var done2=false;
var done3=false;
function slideshow () {
	done3 = true;
	done2 = true;
	if (!done) {
		setTimeout(function () {
			d3.select('.year').text(count);
			d3.select('.slider').attr('value', count);
			color2(json, count);
			count++;                   
			if (count <= 2012) {          
				slideshow();           
			}                        
		}, 500)
	}
	else if (done) {
		count = 2002;
		d3.select('.year').text(count);
		d3.select('.slider').attr('value', count);
		done = false;
		setTimeout(function () {
			d3.select('.year').text(count);
			d3.select('.slider').attr('value', count);
			color2(json, count);
			count++;                   
			if (count <= 2012) {          
				slideshow();           
			}                        
		}, 500)
	}
	if (count === 2012) {
		done = true;
		done3=false;
		return
	}
}
//Slideshow made!

//Make the slider!
var clicked2 = false;
function slider() {
	if (!clicked2 && !clicked) {
	d3.select('#slider').append('div').attr('class', 'extrabuttons');
	d3.select('.extrabuttons').append('label').style('margin-left', '30px').text('Show data for ');
	d3.select('.extrabuttons').append('label').attr('class', 'year').attr('name', 'year').text('2002');
	d3.select('.extrabuttons').append('br').attr('class', 'tempbreak');
	d3.select('.extrabuttons').append('label').text('2002').style('margin-left', '30px');
	d3.select('.extrabuttons').append('input').attr('type', 'range')
		.attr('class', 'slider').attr('min', '2002').attr('max', '2012')
		.attr('onchange', 'year(this)').attr('value', '0').attr('step', '1');
	d3.select('.extrabuttons').append('label').text('2012');
	d3.select('.extrabuttons').append('button').attr('class', 'slideshow').attr('onclick', 'if (!done3) {slideshow()}').style('margin-left', '50px').text('slideshow');
	d3.select('.extrabuttons').append('br').attr('class', 'tempbreak');
	d3.select('.extrabuttons').append('br').attr('class', 'tempbreak');
	var y = d3.select('svg');
	y[0][0].parentNode.appendChild(y[0][0]);
	color2(json, 2002);
	clicked2 = true;
	}
	else if (clicked && !clicked2) {
		d3.selectAll('path').style('fill', 'grey');
		d3.selectAll('text').remove();
		d3.selectAll('rect').remove();
		d3.selectAll('line').remove();
		d3.selectAll('.tempbreak').remove();
		d3.selectAll('input').remove();
		d3.selectAll('label').remove();
		d3.selectAll('.slideshow').remove();
		clicked = false;
		
		d3.select('#slider').append('div').attr('class', 'extrabuttons');
		d3.select('.extrabuttons').append('label').style('margin-left', '30px').text('Show data of ');
		d3.select('.extrabuttons').append('label').attr('class', 'year').attr('name', 'year').text('2002');
		d3.select('.extrabuttons').append('br').attr('class', 'tempbreak');
		d3.select('.extrabuttons').append('label').style('margin-left', '30px').text('2002');
		d3.select('.extrabuttons').append('input').attr('type', 'range')
			.attr('name', 'slider').attr('min', '2002').attr('max', '2012')
			.attr('onchange', 'year(this)').attr('value', '0').attr('step', '1');
		d3.select('.extrabuttons').append('label').text('2012');
		d3.select('.extrabuttons').append('button').attr('class', 'slideshow').attr('onclick', 'slideshow()').style('margin-left', '50px').text('slideshow');
		d3.select('.extrabuttons').append('br').attr('class', 'tempbreak');
		d3.select('.extrabuttons').append('br').attr('class', 'tempbreak');
		var y = d3.select('svg');
		y[0][0].parentNode.appendChild(y[0][0]);
		color2(json, 2002);
		clicked2 = true;
		done = false;
		
	}
}
//Slider made!

//Update the slider!
var current = 2002;
function year(x) {
	if (!done3) {
	done = false;
	count = 2002;
	current = x.value;
	d3.select('.year').text(current);
	color2(json, current);
	}
}
//Slider updated!

//Outline functions!
function outline(x, el, year) {
	if (done) {year = 2012;}
	else if (!done) {year = current;}
	if (clicked || clicked2){
		el.parentNode.appendChild(el);
		var done4 = false;
		if (clicked){
			for (var i=0; i < fixedData.length; i++) {
				if (fixedData[i][0] === x) {
					var n = fixedData[i][1] + "%";
					done4 = true;
				}
				else { if (!done4) {var n = 'No information'}}
			}
		}
		else if (clicked2){
			for (var i=0; i<json.length; i++) {
				if (json[i].country === x) {
					var n = json[i]['ratio'][year] + "%";
					done4 = true;
				}
				else { if (!done4) {var n = 'No information'}}
			}
		}
		for (var y in Countries) {
			if (y === x) {
				Full = Countries[y];
			}
			else {y = 'available'}
		}
		
		d3.select('.' + x).style('stroke', 'black')
			.append('animate')
			.attr("attributeType", "CSS")
			.attr("attributeName", "stroke-width")
			.attr('from', '1').attr('to', '2')
			.attr('dur', '1s').attr('repeatCount', 'indefinite');
		var g = d3.select('svg').append('g')
			.attr('class', 'tekst')
		g.append('rect')
			.attr('x', 330).attr('y', 110)
			.attr('width', 120).attr('height', 50)
			.style('fill', 'seagreen')
			.style('fill-opacity', 0.4);
		g.append('text').text(Full)
			.attr('x', 390).attr('y', 130)
			.attr("font-family", "sans-serif")		
			.attr('text-anchor', 'middle')
			.attr('font-size', '12px');
		g.append('text').text(n)
			.attr('x', 390).attr('y', 150)
			.attr('text-anchor', 'middle')
			.attr("font-family", "sans-serif")
			.attr('font-size', '12px');
	}
}
function outline2() {
d3.selectAll('path').style("stroke", "#999").style('stroke-width', 1);
d3.selectAll('rect').style('stroke-width', 0);
d3.select('.tekst').remove();
d3.selectAll('animate').remove();
}
function outline3(x, t, el) {
	d3.select('.'+t).style('stroke', 'black').style('stroke-width', 1)
	var countrySet = []
	var actualSet = []
	if (x === '#1a9641') {
		for (var i =0; i<fixedData.length; i++) {
			if (fixedData[i][1] >= 15) {
				var y = d3.select('.' + fixedData[i][0]);
				y[0][0].parentNode.appendChild(y[0][0]);
				d3.select('.' + fixedData[i][0]).style("stroke", "black")
					.append('animate')
					.attr("attributeType", "CSS")
					.attr("attributeName", "stroke-width")
					.attr('from', '1').attr('to', '2')
					.attr('dur', '1s').attr('repeatCount', 'indefinite');
				countrySet.push(fixedData[i][0]);
			}
		}
	}
	else if (x === '#d7191c') {
		for (var i =0; i<fixedData.length; i++) {
			if (fixedData[i][1] <= -30) {
				var y = d3.select('.' + fixedData[i][0]);
				y[0][0].parentNode.appendChild(y[0][0]);
				d3.select('.' + fixedData[i][0]).style("stroke", "black")
					.append('animate')
					.attr("attributeType", "CSS")
					.attr("attributeName", "stroke-width")
					.attr('from', '1').attr('to', '2')
					.attr('dur', '1s').attr('repeatCount', 'indefinite');
				countrySet.push(fixedData[i][0]);
			}
		}
	}
	else if (x === '#fdae61') {
		for (var i =0; i<fixedData.length; i++) {
			if (fixedData[i][1] > -30 && fixedData[i][1] <= -15) {
				var y = d3.select('.' + fixedData[i][0]);
				y[0][0].parentNode.appendChild(y[0][0]);
				d3.select('.' + fixedData[i][0]).style("stroke", "black")
					.append('animate')
					.attr("attributeType", "CSS")
					.attr("attributeName", "stroke-width")
					.attr('from', '1').attr('to', '2')
					.attr('dur', '1s').attr('repeatCount', 'indefinite');
				countrySet.push(fixedData[i][0]);
			}
		}
	}
	else if (x === '#ffffbf') {
		for (var i =0; i<fixedData.length; i++) {
			if (fixedData[i][1] > -15 && fixedData[i][1] < 0) {
				var y = d3.select('.' + fixedData[i][0]);
				y[0][0].parentNode.appendChild(y[0][0]);
				d3.select('.' + fixedData[i][0]).style("stroke", "black")
					.append('animate')
					.attr("attributeType", "CSS")
					.attr("attributeName", "stroke-width")
					.attr('from', '1').attr('to', '2')
					.attr('dur', '1s').attr('repeatCount', 'indefinite');
				countrySet.push(fixedData[i][0]);
			}
		}
	}
	else if (x === '#a6d96a') {
		for (var i =0; i<fixedData.length; i++) {
			if (fixedData[i][1] >= 0 && fixedData[i][1] < 15) {
				var y = d3.select('.' + fixedData[i][0]);
				y[0][0].parentNode.appendChild(y[0][0]);
				d3.select('.' + fixedData[i][0]).style("stroke", "black")
				.append('animate')
					.attr("attributeType", "CSS")
					.attr("attributeName", "stroke-width")
					.attr('from', '1').attr('to', '2')
					.attr('dur', '1s').attr('repeatCount', 'indefinite');
				countrySet.push(fixedData[i][0]);
			}
		}
	}
	for (i in Object.keys(Countries)){
		for (c in countrySet) {
			if (countrySet[c] === Object.keys(Countries)[i]) {
				actualSet.push(Countries[countrySet[c]]);
			}
		}
	}
	actualSet.sort();
	var g = d3.select('svg').append('g').attr('class', 'tekst')
	g.append('rect')
		.attr('x', 330).attr('y', 100 - actualSet.length * 10)
		.attr('width', 120).attr('height', 10 + actualSet.length * 20)
		.style('fill', 'seagreen').style('fill-opacity', 0.4);
	g.selectAll('text').data(actualSet).enter()
		.append('text')
		.text(function(d){return d})
		.attr('x', 390)
		.attr('y', function(d,i){return 118 - actualSet.length * 10 + i * 20})
		.attr('text-anchor', 'middle')
		.attr("font-family", "sans-serif")
		.attr('font-size', '12px');
}
function outline4(x, t, el, year) {
	if (done) {year = 2012;}
	else if (!done) {year = current;}
	d3.select('.'+t).style('stroke', 'black').style('stroke-width', 1)
	var countrySet = [];
	var actualSet = [];
	var gradient = [['#ffffcc', 0, 25], ['#ffeda0', 25, 50],['#fed976', 50, 75],['#feb24c', 75, 100],
		['#fd8d3c', 100, 125],['#fc4e2a', 125, 150], ['#e31a1c', 150, 175], 
		['#bd0026', 175, 200], ['#800026', 200, 225], ['#630021', 225, 250]];
	for (var i =0; i<json.length; i++) {
		var name = json[i]['country'];
		for (y in gradient) {
			var range1 = gradient[y][1];
			var range2 = gradient[y][2];
			if (gradient[y][0] === x) {
				if (json[i]['ratio'][year] > range1 && json[i]['ratio'][year] <= range2) {
					var y = d3.select('.' + name);
					y[0][0].parentNode.appendChild(y[0][0]);
					d3.select('.' + name).style("stroke", "black")
						.append('animate')
						.attr("attributeType", "CSS")
						.attr("attributeName", "stroke-width")
						.attr('from', '1').attr('to', '2')
						.attr('dur', '1s').attr('repeatCount', 'indefinite');
					countrySet.push(name);
				}
			}
		}
	}
	var DK = false;
	for (i in Object.keys(Countries)){
		for (c in countrySet) {
			if (countrySet[c] === Object.keys(Countries)[i]) {
				actualSet.push(Countries[countrySet[c]]);
				if (countrySet[c] === 'DK') {DK = true;}
			}
		}
	}
	if (DK) {actualSet.pop();}
	
	if (actualSet.length != 0) {
		actualSet.sort();
		var g = d3.select('svg').append('g').attr('class', 'tekst')
		g.append('rect')
			.attr('x', 330).attr('y', 100 - actualSet.length * 10)
			.attr('width', 120).attr('height', 10 + actualSet.length * 20)
			.style('fill', 'seagreen').style('fill-opacity', 0.4);
		g.selectAll('text').data(actualSet).enter()
			.append('text')
			.text(function(d){return d})
			.attr('x', 390)
			.attr('y', function(d,i){return 118 - actualSet.length * 10 + i * 20})
			.attr('text-anchor', 'middle')
			.attr("font-family", "sans-serif")
			.attr('font-size', '12px');
	}
}
//End of outline function!

//Show the colors!
var clicked = false;
function color(dataSet) {
	if (!done3) {
	done2= false;
	current = 2002;
	if (!clicked && !clicked2){
	var gradient = ['#d7191c','#fdae61','#ffffbf','#a6d96a','#1a9641'];
	for (var i=0; i<dataSet.length; i++){
		x = dataSet[i];
		if (x[1] <= -30){
			d3.select("." + x[0]).style("fill", gradient[0]);
		}
		else if (x[1] > -30 && x[1] <= -15){
			d3.select("." + x[0]).style("fill", gradient[1]);
		}
		else if (x[1] > -15 && x[1] < 0) {
			d3.select("." + x[0]).style("fill", gradient[2]);
		}
		else if (x[1] >= 0 && x[1] < 15) {
			d3.select("." + x[0]).style("fill", gradient[3]);
		}
		else if (x[1] >= 15) {
			d3.select("." + x[0]).style("fill", gradient[4]);
		}
	};
	var g = d3.select('svg').selectAll('rect').data(gradient).enter()
	g.append('rect').attr('class', function(d,i){return 'rect'+i})
		.attr('x', function(d,i){return 70 + 70 * i}).attr('y', 470)
		.attr('width', 70)
		.attr('height', 20)
		.attr('onmouseover', function(d,i){return 'outline3("'+d+'", "rect'+i+'", this)'})
		.attr('onmouseout', 'outline2()')
		.style('fill', function(d){ return d });
	g.append('text')
		.text(function(d,i) {if (i === 0) {return '-30%'}
							if (i === 1) {return '-15%'}
							if (i === 2) {return '0%'}
							if (i === 3) {return '15%'}
							if (i === 4) {return ''}})
		.attr("font-family", "sans-serif")
		.attr("font-size", "12px")
		.attr('x', function(d,i){return 140 + 70 * i}).attr('y', 505)
		.attr("text-anchor", 'middle');
	d3.select('svg').append('text')
		.text('European GDP changes in 2012, compared to 2001.')
		.attr("text-anchor", 'middle')
		.attr("font-family", "sans-serif")
		.attr("font-size", "20px")
		.attr('x', 245).attr('y', 450);
		var lines = [140, 210, 280, 350];
	d3.select('svg').selectAll('line').data(lines).enter()
		.append('line')
		.attr('x1', function(d) {return d}).attr('y1', 470)
		.attr('x2', function(d) {return d}).attr('y2', 490)
		.style('stroke', 'black').style('stroke-width', 2);

	clicked = true;
}
	
	else if (clicked2 && !clicked){
		d3.selectAll('path').style('fill', 'grey');
		d3.selectAll('text').remove();
		d3.selectAll('rect').remove();
		d3.selectAll('line').remove();
		d3.selectAll('.tempbreak').remove();
		d3.selectAll('input').remove();
		d3.selectAll('label').remove();
		d3.selectAll('.slideshow').remove();
		clicked2 = false;
		
		var gradient = ['#d7191c','#fdae61','#ffffbf','#a6d96a','#1a9641'];
		for (var i=0; i<dataSet.length; i++){
			x = dataSet[i];
			if (x[1] <= -30){
				d3.select("." + x[0]).style("fill", gradient[0]);
			}
			else if (x[1] > -30 && x[1] <= -15){
				d3.select("." + x[0]).style("fill", gradient[1]);
			}
			else if (x[1] > -15 && x[1] < 0) {
				d3.select("." + x[0]).style("fill", gradient[2]);
			}
			else if (x[1] >= 0 && x[1] < 15) {
				d3.select("." + x[0]).style("fill", gradient[3]);
			}
			else if (x[1] >= 15) {
				d3.select("." + x[0]).style("fill", gradient[4]);
			}
		};
		var g = d3.select('svg').selectAll('rect').data(gradient).enter()
		g.append('rect').attr('class', function(d,i){return 'rect'+i})
			.attr('x', function(d,i){return 70 + 70 * i}).attr('y', 470)
			.attr('width', 70)
			.attr('height', 20)
			.attr('onmouseover', function(d,i){return 'outline3("'+d+'", "rect'+i+'", this)'})
			.attr('onmouseout', 'outline2()')
			.style('fill', function(d){ return d });
		g.append('text')
			.text(function(d,i) {if (i === 0) {return '-30%'}
								if (i === 1) {return '-15%'}
								if (i === 2) {return '0%'}
								if (i === 3) {return '15%'}
								if (i === 4) {return ''}})
			.attr("font-family", "sans-serif")
			.attr("font-size", "12px")
			.attr('x', function(d,i){return 140 + 70 * i}).attr('y', 505)
			.attr("text-anchor", 'middle');
		d3.select('svg').append('text')
			.text('European GDP changes in 2012, compared to 2001.')
			.attr("text-anchor", 'middle')
			.attr("font-family", "sans-serif")
			.attr("font-size", "20px")
			.attr('x', 245).attr('y', 450);
			var lines = [140, 210, 280, 350];
		d3.select('svg').selectAll('line').data(lines).enter()
			.append('line')
			.attr('x1', function(d) {return d}).attr('y1', 470)
			.attr('x2', function(d) {return d}).attr('y2', 490)
			.style('stroke', 'black').style('stroke-width', 2);

		clicked = true;
	}
	}
}

function color2(dataSet2, year) {
	var gradient = ['#ffffcc', '#ffeda0','#fed976','#feb24c','#fd8d3c','#fc4e2a', '#e31a1c', '#bd0026', '#800026', '#630021'];
	for (var i=0; i<dataSet2.length; i++){
		var x = dataSet2[i]['ratio'][year];
		var c = dataSet2[i]['country'];
		if (x < 25){
			d3.select("." + c).style("fill", gradient[0]);
		}
		else if (x >= 25 && x < 50){
			d3.select("." + c).style("fill", gradient[1]);
		}
		else if (x >= 50 && x < 75) {
			d3.select("." + c).style("fill", gradient[2]);
		}
		else if (x >= 75 && x < 100) {
			d3.select("." + c).style("fill", gradient[3]);
		}
		else if (x >= 100 && x < 125) {
			d3.select("." + c).style("fill", gradient[4]);
		}
		else if (x >= 125 && x < 150) {
			d3.select("." + c).style("fill", gradient[5]);
		}
		else if (x >= 150 && x < 175) {
			d3.select("." + c).style("fill", gradient[6]);
		}
		else if (x >= 175 && x < 200) {
			d3.select("." + c).style("fill", gradient[7]);
		}
		else if (x >= 200 && x < 225) {
			d3.select("." + c).style("fill", gradient[8]);
		}
		else if (x >= 225) {
			d3.select("." + c).style("fill", gradient[9]);
		}
	}
	if (current === 2002 && !done2) {
	var g = d3.select('svg').selectAll('rect').data(gradient).enter()
	g.append('rect').attr('class', function(d,i){return 'rect'+i})
		.attr('x', function(d,i){return 50 + 35 * i}).attr('y', 480)
		.attr('width', 35)
		.attr('height', 20)
		.attr('onmouseover', function(d,i){return 'outline4("'+d+'", "rect'+i+'", this)'})
		.attr('onmouseout', 'outline2()')
		.style('fill', function(d){ return d });
	g.append('text')
		.text(function(d,i) {if (i === 0) {return '50%'}
							if (i === 1) {return '100%'}
							if (i === 2) {return '150%'}
							if (i === 3) {return '200%'}
							if (i === 4) {return ''}})
		.attr("font-family", "sans-serif")
		.attr("font-size", "12px")
		.attr('x', function(d,i){return 120 + 70 * i}).attr('y', 515)
		.attr("text-anchor", 'middle');
	d3.select('svg').append('text')
		.text('Debts as a percentage of GDP in European countries, from 2002 to 2012.')
		.attr("font-family", "sans-serif")
		.attr("font-size", "14px")
		.attr('x', 10).attr('y', 450);
		var lines = [120, 190, 260, 330];
	d3.select('svg').selectAll('line').data(lines).enter()
		.append('line')
		.attr('x1', function(d) {return d}).attr('y1', 480)
		.attr('x2', function(d) {return d}).attr('y2', 500)
		.style('stroke', 'black').style('stroke-width', 2);
	}
}


//End of color showing!



//Organizing and cleaning data!
var fixedData = [];
var countries = [];    
var data1 = [];    
var allData = [];
var countries3 = [];	
var countries2 = [];
var cleandata = [];	
var cleandata2 = [];	
var json = [];
/*function Laterpas() {
d3.tsv("tec00114.tsv", function (data) {
    for (var i=0;i<data.length;i++) {
        if(data[i]["2001 "] != ": " && data[i]["2012 "] != ": "){
			var keys = Object.keys(data[i]);
			var c = data[i][keys[0]].substring(19,23);
			allData.push(data[i]);
			dataX = parseFloat(data[i]["2001 "]);
			dataY = parseFloat(data[i]["2012 "]);
			Diff = dataX-dataY;
			for (x in Country){
				if (c === Country[x]){
					fixedData.push([c, Diff]);
				}
			}
         };
    };
});*/

			
			d3.tsv("tec00114.tsv", function (data) {
				for (var i=0;i<data.length;i++) {
					data[i]["2001 "] = parseFloat(data[i]["2001 "]);
					data[i]["2002 "] = parseFloat(data[i]["2002 "]);
					data[i]["2003 "] = parseFloat(data[i]["2003 "]);
					data[i]["2004 "] = parseFloat(data[i]["2004 "]);
					data[i]["2005 "] = parseFloat(data[i]["2005 "]);
					data[i]["2006 "] = parseFloat(data[i]["2006 "]);
					data[i]["2007 "] = parseFloat(data[i]["2007 "]);
					data[i]["2008 "] = parseFloat(data[i]["2008 "]);
					data[i]["2009 "] = parseFloat(data[i]["2009 "]);
					data[i]["2010 "] = parseFloat(data[i]["2010 "]);
					data[i]["2011 "] = parseFloat(data[i]["2011 "]);
					data[i]["2012 "] = parseFloat(data[i]["2012 "]);
					if(!isNaN(data[i]["2001 "])){
						cleandata.push(data[i]);
					};
				};
				
				d3.tsv("tec00104.tsv", function (sec_data) {
					for (var i=0;i<sec_data.length;i++) {
						
						sec_data[i]["2002 "] = parseFloat(sec_data[i]["2002 "]);
						sec_data[i]["2003 "] = parseFloat(sec_data[i]["2003 "]);
						sec_data[i]["2004 "] = parseFloat(sec_data[i]["2004 "]);
						sec_data[i]["2005 "] = parseFloat(sec_data[i]["2005 "]);
						sec_data[i]["2006 "] = parseFloat(sec_data[i]["2006 "]);
						sec_data[i]["2007 "] = parseFloat(sec_data[i]["2007 "]);
						sec_data[i]["2008 "] = parseFloat(sec_data[i]["2008 "]);
						sec_data[i]["2009 "] = parseFloat(sec_data[i]["2009 "]);
						sec_data[i]["2010 "] = parseFloat(sec_data[i]["2010 "]);
						sec_data[i]["2011 "] = parseFloat(sec_data[i]["2011 "]);
						sec_data[i]["2012 "] = parseFloat(sec_data[i]["2012 "]);
						if(!isNaN(sec_data[i]["2004 "])){
							cleandata2.push(sec_data[i]);
						};
					};
	
					for(var i=0;i<cleandata.length;i++){
						keys = Object.keys(data[i]);
						countries3.push(cleandata[i][keys[0]]);
					};
					
					for(var i=0;i<cleandata2.length;i++){
						keys = Object.keys(sec_data[i]);
						countries2.push(cleandata2[i][keys[0]]);
					};					

					for(var i=0;i<cleandata2.length;i++){

						debt = {						
							2002: cleandata2[i]['2002 '],
							2003: cleandata2[i]['2003 '],
							2004: cleandata2[i]['2004 '],
							2005: cleandata2[i]['2005 '],
							2006: cleandata2[i]['2006 '],
							2007: cleandata2[i]['2007 '],
							2008: cleandata2[i]['2008 '],
							2009: cleandata2[i]['2009 '],
							2010: cleandata2[i]['2010 '],
							2011: cleandata2[i]['2011 '],
							2012: cleandata2[i]['2012 ']
						};						

						
						for(var j=0;j<cleandata.length;j++){
							
							gdp = {									
								2002: cleandata[j]['2002 '],
								2003: cleandata[j]['2003 '],
								2004: cleandata[j]['2004 '],
								2005: cleandata[j]['2005 '],
								2006: cleandata[j]['2006 '],
								2007: cleandata[j]['2007 '],
								2008: cleandata[j]['2008 '],
								2009: cleandata[j]['2009 '],
								2010: cleandata[j]['2010 '],
								2011: cleandata[j]['2011 '],
								2012: cleandata[j]['2012 ']
							};

							if(countries3[j].slice(-2) === countries2[i].slice(-2) && countries3[j].slice(-2) != '17') {
		
								ratio = {
									2002: parseFloat((debt[2002] / gdp[2002] *100).toFixed(2)),
									2003: parseFloat((debt[2003] / gdp[2003] *100).toFixed(2)),
									2004: parseFloat((debt[2004] / gdp[2004] *100).toFixed(2)),
									2005: parseFloat((debt[2005] / gdp[2005] *100).toFixed(2)),
									2006: parseFloat((debt[2006] / gdp[2006] *100).toFixed(2)),
									2007: parseFloat((debt[2007] / gdp[2007] *100).toFixed(2)),
									2008: parseFloat((debt[2008] / gdp[2008] *100).toFixed(2)),
									2009: parseFloat((debt[2009] / gdp[2009] *100).toFixed(2)),
									2010: parseFloat((debt[2010] / gdp[2010] *100).toFixed(2)),
									2011: parseFloat((debt[2011] / gdp[2011] *100).toFixed(2)),
									2012: parseFloat((debt[2012] / gdp[2012] *100).toFixed(2)),
								};
								
								comb_data = {
									country: countries3[j].slice(-2),
									'gdp' : gdp,
									'debt' : debt,
									'ratio' : ratio
								};
							};
						};
						
						
						json[json.length] = comb_data ;
					};						
				})
			})
//Data organized and cleaned