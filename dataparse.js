		var marketShares = []
		var websites = []
		var data = []
		d3.csv("browser-ww-monthly-201305-201405.csv", function (d) {
		data = d;
		});
		for (i=0;i<5;i++) {
			marketShares.push(data[i]["Market Share Perc. (May 2013 to May 2014)"]);
			websites.push(data[i].Browser);}