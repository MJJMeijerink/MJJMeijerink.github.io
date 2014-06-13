function make(){
	if (!clicked) {
	
		var fullNames = [];
		
		for (var i = 0; i<countries.length; i++){
			if (countries[i] === Object.keys(Countries)[i]){
				var Country = Object.keys(Countries)[i];
				fullNames.push(Countries[Country]);
			}
		}
		
		var svg = d3.select("body").append("svg")
			.attr("class", "chart").attr("height", 750);
			
		d3.select(".chart").selectAll("rect")
			.data(dataSet).enter()
			.append("rect")
			.attr("y", function(d,i) {
				if (i % 2 === 0) {return i * 10}
				else {return (i-1) * 10 + 6}})
			.attr("x", 150)
			.attr("width", function(d) {return d * 4})
			.attr("height", 5)
			.style("fill", function(d,i) {
				if (i % 2 === 0) {return "#47B8C8"}
				else {return "steelblue"}});
				
		d3.select(".chart").selectAll("text")
			.data(fullNames).enter()
			.append("text")
			.attr("x", 140)
			.attr("y", function(d,i) {return i * 20 + 10})
			.text(function(d) {return d})
			.attr("font-family", "sans-serif")
			.attr("font-size", "12px")
			.attr("text-anchor", "end");
			
		var g1 = d3.select(".chart").append("g");
		g1.append("rect")
			.attr("x", 560)
			.attr("y",0)
			.attr("width", 10)
			.attr("height", 10)
			.style("fill", "#47B8C8");
			
		g1.append("text")
			.attr("x", 573)
			.attr("y", 8)
			.text("2001")
			.attr("font-family", "sans-serif")
			.attr("font-size", "10px");
			
		var g2 = d3.select(".chart").append("g");
		g2.append("rect")
			.attr("x", 560)
			.attr("y",15)
			.attr("width", 10)
			.attr("height", 10)
			.style("fill", "steelblue");
			
		g2.append("text")
			.attr("x", 573)
			.attr("y", 23)
			.text("2012")
			.attr("font-family", "sans-serif")
			.attr("font-size", "10px");
			
		var x = d3.scale.linear().range([150, 550]);
		x.domain([0,100]).nice();
				
		svg.append("g")
			.attr("class", "x axis")
			.attr("transform", "translate(0," + 700 + ")")
			.style("fill", "black")
			.call(d3.svg.axis().scale(x).orient("bottom"));
			
		d3.select(".chart").append("text")
			.attr("x", 148)
			.attr("y", 735)
			.text("Percentage of 18-year-olds in education")
			.attr("font-family", "sans-serif")
			.attr("font-size", "12px");
		
		var axisLines = [150,230,310,390,470];
		d3.select(".chart").append("svg").attr("class", "lines");
		
		d3.select(".lines").selectAll("rect").data(axisLines)
			.enter().append("rect")
			.attr("x", function (d) {return d}).attr("y", 0)
			.attr("width", 1).attr("height", 705)
			.style("fill", "black");
		clicked = true;
	}
}

var clicked = false;
var dataSet = [];
var countries = [];
d3.tsv("18-year-olds-in-education.tsv", function (data) {
	for (var i = 0; i<data.length; i++){
		if (data[i]["2001 "] != ": " && data[i]["2012 "] != ": "){
			dataSet.push(parseFloat(data[i]["2001 "]));
			dataSet.push(parseFloat(data[i]["2012 "]));
			var keys = Object.keys(data[i]);
			countries.push(data[i][keys[0]]);
		}
	}
});
		
function make2() {
	if (!clicked) {
		var totalRest = 0.0;
		
		for (var i = 0; i<5; i++){
			totalRest = totalRest + marketShares[i];
		}
		
		totalRest = 100.0 - totalRest;
		
		websites.push("Others");
		
		marketShares.push(totalRest.toPrecision(3));
		
		d3.select("body").append("div").attr("class", "chart");
		
		d3.select(".chart").selectAll("div")
			.data(marketShares)
			.enter().append("div")
			.style("width", function(d) { return d * 25 + "px"; })
			.style("height", "30px")
			.style("display", "block")
			.style("background-color", "steelblue")
			.style("padding", "3px")
			.style("margin", "1px")
			.style("text-align", "right")
			.style("font", "10px sans-serif")
			.style("color", "white")
			.text(function(d,i) { return websites[i] + " " + d + "%"; });
			
		clicked = true;
	}
}
		
var clicked = false;
var marketShares = [];
var websites = [];
d3.csv("browser-ww-monthly-201305-201405.csv", function (data) {
	for (var i=0;i<5;i++) {
		marketShares.push(parseFloat(data[i]["Market Share Perc. (May 2013 to May 2014)"]));
		websites.push(data[i].Browser);
	}
});