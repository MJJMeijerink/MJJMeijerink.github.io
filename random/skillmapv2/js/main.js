$.ajaxSetup({beforeSend: function(xhr) {
  if (xhr.overrideMimeType){
      xhr.overrideMimeType("application/json");
  }
}}); // remove later
$('#input').keypress(function (e) {
  var key = e.which;
  if(key == 13) {
    search()
  }
});

// Modal variables
// Get the modal
var personModal = document.getElementById("personModal");

// Get the <span> element that closes the modal
var modalClose = document.getElementsByClassName("modalClose")[0];

// Get the content contentContainer
var contentContainer = document.getElementById("contentContainer");

// Modal handler listeners
// When the user clicks on <span> (x), close the modal
modalClose.onclick = function() {
  personModal.style.display = "none";
}

  // When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == personModal) {
    personModal.style.display = "none";
  }
}

var network = undefined;
var id2person = {};
var person2id = {};
var name2id = {};
var titleNodes2Children = {};


$.getJSON("data/test_data.json", function(json) {
    var people = []
  	for (var name in json) {
  		people.push(new Person(name, json[name]))
  	}

    people_by_title = getPeopleByTitle(people)


    var edges = [];
    var nodes = [];
    nodeCount = 1;

    nodes.push({id: nodeCount, group: "main", label: "C&I"});
    nodeCount++;

    for (var title in people_by_title) {
      var people = people_by_title[title]
      nodes.push({id: nodeCount, group: title, label: title})
      edges.push({from: 1, to: nodeCount})
      titleID = nodeCount;
      if (!(nodeCount in titleNodes2Children)) {
        titleNodes2Children[nodeCount] = [];
      }
      nodeCount++;

      for (var i = 0; i < people.length; i++) {
        person = people[i];
        id2person[nodeCount] = person;
        person2id[person] = nodeCount;
        name2id[person.name] = nodeCount;
        nodes.push({id: nodeCount, group: title, label: person.name});
        edges.push({from: titleID, to:nodeCount});
        titleNodes2Children[titleID].push(nodeCount);
        nodeCount++;
      }
    }

    nodes = new vis.DataSet(nodes);
    edges = new vis.DataSet(edges);

    // create a network
    var container = document.getElementById('network');
    var data = {
      nodes: nodes,
      edges: edges
    };
    var options =
    {
      "physics": {
        "enabled": true,
        "repulsion": {
          "nodeDistance": 200
        },
        "solver": "repulsion"
      }
    };

    network = new vis.Network(container, data, options);

    network.on( 'click', function(properties) {
      var ids = properties.nodes;
      var clickedNodes = nodes.get(ids);
      if (clickedNodes.length > 0) {
        var id = clickedNodes[0].id;
        if (id == 1) {
          network.fit({nodes: Object.keys(id2person), animation: {duration: 250}});
        } else {
          network.focus(id, {scale: 1, animation: {duration: 250}})
        }

        if (id in id2person) {
          personClickHandler(id2person[id]);
        }
      }
    });
});

function personClickHandler(personData) {
  var name = personData.name;
  var title = personData.job_title;
  var skills = personData.skills;
  var projects = personData.projects;

  var skillsString = "";
  for (var i = 0; i < skills.length; i++) {
    skillsString += skills[i] + "<br>"
  }

  var projectsString = "";
  for (var i = 0; i < projects.length; i++) {
    projectsString += projects[i] + "<br>"
  }

  var html = "<h1>" + name + "</h1><h3>" + title + "</h3><br>" +
             "<b>Skills:</b><br>" + skillsString + "<br>" +
             "<b>Projects:</b><br>" + projectsString;

  contentContainer.innerHTML = html;
  personModal.style.display = "block";
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

function search() {
  var value = document.getElementById("input").value
  console.log(value);
  if (value in name2id) {
    var id = name2id[value];
    network.selectNodes([id]);
    network.focus(id, {scale: 1, animation: {duration: 250}})

    if (id in id2person) {
      personClickHandler(id2person[id]);
    }
  }
}
