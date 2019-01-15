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

	//We need to organize people by their job title, let's do that now
	people_by_title = getPeopleByTitle(people)


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
