
$.getJSON("data/test_data.json", function(json) {
    console.log(json); // this will show the info it in firebug console

    var people = []
  	for (var name in json) {
  		people.push(new Person(name, json[name]))
  	}

    people_by_title = getPeopleByTitle(people)

    console.log(people_by_title);
});

// create an array with nodes
var nodes = new vis.DataSet([
  {id: 1, label: 'Node 1'},
  {id: 2, label: 'Node 2'},
  {id: 3, label: 'Node 3'},
  {id: 4, label: 'Node 4'},
  {id: 5, label: 'Node 5'}
]);

// create an array with edges
var edges = new vis.DataSet([
  {from: 1, to: 3},
  {from: 1, to: 2},
  {from: 2, to: 4},
  {from: 2, to: 5},
  {from: 3, to: 3}
]);

// create a network
var container = document.getElementById('mynetwork');
var data = {
  nodes: nodes,
  edges: edges
};
var options = {};
var network = new vis.Network(container, data, options);



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
