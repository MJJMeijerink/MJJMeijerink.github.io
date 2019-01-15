// Loading all data, happens before anything else can happen.
d3.json("data/test_data.json", function(data) {
	var people = []
	for (var name in data) {
		people.push(new Person(name, data[name]))
	}
	var navbarHeight = d3.select(".navbar-static-top")[0][0].clientHeight

	// Let's create our svg
	var svg = d3.select("body").append("svg")
						  .attr("height", window.innerHeight - navbarHeight - 21)
							.style("background", "grey")

	var vis = svg.append("g").attr("id", "panzoom-target")

	// var pz = panzoom(vis.node()) // annoying when testing

	// Let's add some title text in the middle
	addCenteredText(vis, "C&I Skillmap", "50%", "50%", 40)

	// Let's add tiles, so we know (kind of) where we want our minitiles
	rectangles = addTiles(vis, data)

	//We need to organize people by their job title, let's do that now
	people_by_title = getPeopleByTitle(people)

	for (job_title in people_by_title) {
		rect = rectangles[job_title]
		people = people_by_title[job_title]
		for (var i = 0; i < people.length; i++) {
			person = people[i]

		}
	}


});


function getPeopleByTitle(people) {
	people_by_title = {}
	for (var name in people) {
		job_title = people[name]["job_title"]

		if (!(job_title in people_by_title)) {
			people_by_title[job_title] = []
		}
		people_by_title[job_title].push(people[name])
	}
	return people_by_title
}


function addTiles(node, data) {
	var job_titles = setToList(getSetFor(data, "job_title"))
	job_titles.push("anotha one")
	var job_title_iterator = job_titles.values()
	var max_on_one_line = 3  // We can change this to 4, possibly, maybe?
	var num_job_titles = job_titles.length
	var lines = Math.ceil(num_job_titles / max_on_one_line)

	var split_job_titles = splitArrayEqually(job_titles, lines)

	var coordinates = {}
	for (var line = 0; line < split_job_titles.length; line++) {
		n_on_line = split_job_titles[line].length
		for (var pos = 0; pos < n_on_line; pos++) {
			var x = getPercentagePos(n_on_line, pos)
			var y = getPercentagePos(lines, line)
			var width = 100 / n_on_line
			var height = 100 / lines
			var text = split_job_titles[line][pos]
			var g = node.append("g")
			g.append("ellipse").attr("cx", x + "%").attr("cy", y + "%").attr("rx", width/3 + "%").attr("ry", height/3 + "%").attr("fill", "white")
			addCenteredText(g, text, x + "%", y + "%", 20)
			coordinates[text] = new Rect(x - width/2, y - height/2, width, height, text)
		}
	}

	return coordinates
}

function getPercentagePos(n, pos) {
	var start = 100 / (n * 2)
	return (pos * 2 + 1) * start
}

function splitArrayEqually(array, num_splits) {
	var splits = []
	for (var i = 0; i < num_splits; i++) {
		splits[i] = Math.floor(array.length / num_splits)
	}
	var left = array.length % num_splits

	var i = 0
	while (i < left) {
		for (var j = 0; j < splits.length; j++) {
			splits[j] = splits[j] + 1

			i++
			if (i == left) {
				break
			}
		}
	}

	var arrayOfArrays = []
	s = 0
	for (var i = 0; i < splits.length; i++) {
		splitArray = []
		for (var j = 0; j < splits[i]; j++) {
			splitArray.push(array[j + s])
		}
		s += splits[i]
		arrayOfArrays.push(splitArray)
	}

	return arrayOfArrays
}

function setToList(set) {
	l = []
	values = set.values()
	nextValue = values.next().value
	while (nextValue != undefined) {
		l.push(nextValue)
		nextValue = values.next().value
	}
	return l
}

function addCenteredText(node, text, x, y, fontSize) {
	node.append("text").text(text)
			.attr("x", x).attr("y", y)
			.attr("font-size", fontSize)
			.attr("text-anchor", "middle")
			.attr("dominant-baseline", "middle")
			.attr("fill", "white")
}


function getSetFor(data, title) {
	job_titles = new Set()
	for (name in data) {
		if (typeof(data[name][title]) != "object") {
			job_titles.add(data[name][title])
		} else {
			for (var i = 0; i < data[name][title].length; i++) {
				job_titles.add(data[name][title][i])
			}
		}
	}
	return job_titles
}

function Person(name, information) {
	this.name = name
	this.job_title = information["job_title"]
	this.skills = information["skills"]
	this.projects = information["projects"]
}

// Adding a method to the constructor
Person.prototype.renderInNode = function(node, x, y) {
	var container = node.append("g")
	container.append("rect").attr("fill", "white").attr("x", x).attr("y", y)
	return
}

function Rect(x, y, width, height, id) {
	this.id = id
	this.x = x
	this.y = y
	this.width = width
	this.height = height

	this.centerX = width / 2
	this.centerY = height / 2
}
