		var marketShares = []
		var websites = []
		var data = []
		d3.csv("browser-ww-monthly-201305-201405.csv", function (d) {
		data = d;
		});