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
					var displayS = lines[sent].join(' ')
					var s = displayS.toLowerCase();
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
									d.sentence = displayS;
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