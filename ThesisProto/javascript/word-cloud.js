var drawn = false;
function wordCloud(tags){
	if (drawn) {
		d3.select("#word").html("");
		drawn = false;
	} else if (tags.length > 1) {
		drawn = true;
		document.getElementById('word').style.display = 'initial'
		var w = 1000,
			h = 300;

		var max, fontSize;

		var layout = d3.layout.cloud()
				.timeInterval(Infinity)
				.size([w, h])
				.fontSize(function(d) {
					return fontSize(+d.doc_count);
				})
				.text(function(d) {
					return d.key;
				})
				.on("end", draw);

		var svg = d3.select("#word").append("svg")
				.attr("width", "100%")
				.attr("height", 300)

		var vis = svg.append("g").attr("transform", "translate(" + [w >> 1, h >> 1] + ")");

		update();

		function draw(data, bounds) {
			var color = d3.scale.category20b()
			var w = 1000,
				h = 300;
			
		
			svg.attr("width", w).attr("height", h);

			scale = bounds ? Math.min(
					w / Math.abs(bounds[1].x - w / 2),
					w / Math.abs(bounds[0].x - w / 2),
					h / Math.abs(bounds[1].y - h / 2),
					h / Math.abs(bounds[0].y - h / 2)) / 2 : 1;

			var text = vis.selectAll("text")
					.data(data, function(d) {
						return d.text.toLowerCase();
					});
			text.transition()
					.duration(1000)
					.attr("transform", function(d) {
						return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
					})
					.style("font-size", function(d) {
						return d.size + "px";
					});
			text.enter().append("text")
					.attr("text-anchor", "middle")
					.attr("transform", function(d) {
						return "translate(" + [d.x, d.y] + ")rotate(" + d.rotate + ")";
					})
					.style("font-size", function(d) {
						return d.size + "px";
					})
					.style("opacity", 1e-6)
					.transition()
					.duration(1000)
					.style("opacity", 1);
			text.style("font-family", function(d) {
				return d.font;
			})
					.style("fill", function(d) {
						return color(d.size);
					})
					.text(function(d) {
						return d.text;
					});

			vis.transition().attr("transform", "translate(" + [w >> 1, h >> 1] + ")scale(" + scale + ")");
		}

		function update() {
			layout.font('impact').spiral('archimedean');
			layout.rotate(0)
			fontSize = d3.scale['sqrt']().range([10, 100]);
			if (tags.length){
				fontSize.domain([+tags[tags.length - 1].doc_count || 1, +tags[0].doc_count]);
			}
			layout.stop().words(tags).start();
		}
	} else if (!tags) {
		d3.select("#word").html("");
		drawn = false;
	}
};