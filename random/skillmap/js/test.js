// Get JSON data
d3.json('data/test_data.json', function(error, realData) {


  var people = []
	for (var name in realData) {
		people.push(new Person(name, realData[name]))
	}

  people_by_title = getPeopleByTitle(people)

  treeData = {"name": "C&I", "children":[]}
  for (title in people_by_title) {
    obj = {"name": title, "children": []}
    for (person in people_by_title[title]) {
      obj["children"].push({"name": people_by_title[title][person].name})
    }
    treeData["children"].push(obj)
  }

  var DURATION = 700; // d3 animation duration
  var STAGGERN = 4; // delay for each node
  var STAGGERD = 200; // delay for each depth
  var NODE_DIAMETER = 4; // diameter of circular nodes
  var HAS_CHILDREN_COLOR = 'lightsteelblue';
  var SELECTED_COLOR = '#a00';  // color of selected node

  var counter = 0;  // node ids
  var curNode;  // currently selected node
  var curPath;  // array of nodes in the path to the currently selected node

  // size of the diagram
  var width = window.innerWidth;
  var height = window.innerHeight;

  // current pan, zoom, and rotation
  var curX = width / 2;
  var curY = height / 2;
  var curZ = 1.0; // current zoom
  var curR = 270; // current rotation


  // define the svgBase, attaching a class for styling and the zoomListener
  var svgBase = d3.select('#tree-container')
    .append('svg')
    .attr("id", "sourceSVG")
    .attr('width', width)
    .attr('height', height);

  // d3 diagonal projection for use by the node paths
  var diagonal= d3.svg.diagonal.radial()
    .projection(function(d) {
        return [d.y, d.x / 180 * Math.PI];
    });

  // d3 tree layout
  var tree = d3.layout.tree()
    // .nodeSize([4.5, 120])
    .size([360, Math.min(width, height) / 2 - 120])
    .separation(function(a, b) {
      return a.depth === 0 ? 1 : (a.parent === b.parent ? 1 : 2) / a.depth;
  });

  // d3 zoom
  var zoom = d3.behavior.zoom()
    .scaleExtent([1, 10])
    .on("zoom", zoomed);


  svgBase.call(zoom).on("dblclick.zoom", null);

  // Group which holds all nodes
  var svgGroup = svgBase.append('g')
    .attr('transform', 'translate(' + curX + ',' + curY + ')');

  d3.select(window).on('resize', resize);

  // Define the data root
  var root = treeData;
  root.x0 = curY;
  root.y0 = 0;
  selectNode(root); // current selected node

  // Collapse all children of root's children before rendering
  // if (root.children) {
  //   root.children.forEach(function(child) {
  //       collapseTree(child);
  //   });
  // }

  update(root, true); // Layout the tree initially and center on the root node

  // update the tree
  // source - source node of the update
  // transition - whether to do a transition
  function update(source, transition) {

    var duration = transition ?
      (d3.event && d3.event.altKey ? DURATION * 4 : DURATION) : 0;

    // Compute the new tree layout.
    var nodes = tree.nodes(root);
    var links = tree.links(nodes);

    // Update the view
    svgGroup.transition().duration(duration)
      .attr('transform',
        'rotate(' + curR + ' ' + curX + ' ' + curY +
        ')translate(' + curX + ' ' + curY +
        ')scale(' + curZ + ')');

    // Update the nodes…
    var node = svgGroup.selectAll('g.node')
      .data(nodes, function(d) {
        return d.id || (d.id = ++counter);
      });

    // Enter any new nodes at the parent's previous position
    var nodeEnter = node.enter().insert('g', ':first-child')
        .attr('class', 'node')
        .attr('transform', 'rotate(' + (source.x0 - 90) + ')translate(' + source.y0 + ')')
        .on('click', click).on('dblclick', dblclick);

    nodeEnter.append('circle')
      .attr('r', 1e-6)
      .style('fill', function(d) {
        return d._children ? HAS_CHILDREN_COLOR : 'white';
      });

    nodeEnter.append('text')
      .text(function(d) {
        return d.name;
      })
      .style('opacity', 0.9)
      .style('fill-opacity', 0)
      .attr('transform', function() {
          return ((source.x0 + curR) % 360 <= 180 ?
              'translate(8)scale(' :
              'rotate(180)translate(-8)scale('
            ) + reduceZ() + ')';
      });

    // update existing graph nodes

    // Change the circle fill depending on whether it has children and is collapsed
    node.select('circle')
      .attr('r', NODE_DIAMETER * reduceZ())
      .style('fill', function(d) {
          return d._children ? HAS_CHILDREN_COLOR : 'white';
      }).attr('stroke', function(d) {
          return d.selected ? SELECTED_COLOR : 'steelblue';
      }).attr('stroke-width', function(d) {
          return d.selected ? 3 : 1.5;
      });

    node.select('text')
      .attr('text-anchor', function(d) {
          return (d.x + curR) % 360 <= 180 ? 'start' : 'end';
      }).attr('transform', function(d) {
          return ((d.x + curR) % 360 <= 180 ?
              'translate(8)scale(' :
              'rotate(180)translate(-8)scale('
            ) + reduceZ() +')';
      }).attr('fill', function(d) {
          return d.selected ? SELECTED_COLOR : 'black';
      }).attr('dy', '.35em');

    var nodeUpdate = node.transition().duration(duration)
      .delay( transition ? function(d, i) {
          return i * STAGGERN +
            Math.abs(d.depth - curNode.depth) * STAGGERD; }  : 0)
      .attr('transform', function(d) {
          return 'rotate(' + (d.x - 90) + ')translate(' + d.y + ')';
      });

    nodeUpdate.select('circle')
      .attr('r', NODE_DIAMETER * reduceZ());
      // .style('fill', function(d) {
      //   return d._children ? HAS_CHILDREN_COLOR : 'white';
      // });

    nodeUpdate.select('text')
      .style('fill-opacity', 1);

    // Transition exiting nodes to the parent's new position and remove
    var nodeExit = node.exit().transition().duration(duration)
      .delay( transition ? function(d, i) {
          return i * STAGGERN; } : 0)
      .attr('transform', function() {
        return 'rotate(' + (source.x - 90) +')translate(' + source.y + ')';
    }).remove();

    nodeExit.select('circle').attr('r', 0);
    nodeExit.select('text').style('fill-opacity', 0);

    // Update the links…
    var link = svgGroup.selectAll('path.link')
      .data(links, function(d) {
        return d.target.id;
      });

    // Enter any new links at the parent's previous position
    link.enter().insert('path', 'g')
        .attr('class', 'link')
        .attr('d', function() {
        var o = {
            x: source.x0,
            y: source.y0
        };
        return diagonal({
            source: o,
            target: o
        });
    });

    // Transition links to their new position
    link.transition().duration(duration)
      .delay( transition ? function(d, i) {
          return i * STAGGERN +
            Math.abs(d.source.depth - curNode.depth) * STAGGERD;
            // Math.max(0, d.source.depth - curNode.depth) * STAGGERD;
          } : 0)
      .attr('d', diagonal);

    // Transition exiting nodes to the parent's new position
    link.exit().transition().duration(duration)
        .attr('d', function() {
          var o = {
            x: source.x0,
            y: source.y0
          };
          return diagonal({
            source: o,
            target: o
          });
      }).remove();

    // Stash the old positions for transition
    nodes.forEach(function(d) {
      d.x0 = d.x;
      d.y0 = d.y;
    });
  } // end update

  // Helper functions for collapsing and expanding nodes

  // Toggle expand / collapse
  function toggle(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    } else if (d._children) {
      d.children = d._children;
      d._children = null;
    }
  }

  function toggleTree(d) {
    if (d.children) {
      collapseTree(d);
    } else {
      expandTree(d);
    }
  }

  function expand(d) {
    if (d._children) {
      d.children = d._children;
      d._children = null;
    }
  }

  // expand all children, whether expanded or collapsed
  function expandTree(d) {
    if (d._children) {
      d.children = d._children;
      d._children = null;
    }
    if (d.children) {
      d.children.forEach(expandTree);
    }
  }

  function collapse(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    }
  }

  // collapse all children
  function collapseTree(d) {
    if (d.children) {
      d._children = d.children;
      d.children = null;
    }
    if (d._children) {
      d._children.forEach(collapseTree);
    }
  }

  // zooming
  function zoomed() {
    svgBase.attr("transform", "translate(" + zoom.translate() + ")scale(" + zoom.scale() + ")");
  }

  // expand one level of tree
  function expand1Level(d) {
    var q = [d]; // non-recursive
    var cn;
    var done = null;
    while (q.length > 0) {
      cn = q.shift();
      if (done !== null && done < cn.depth) { return; }
      if (cn._children) {
        done = cn.depth;
        cn.children = cn._children;
        cn._children = null;
        cn.children.forEach(collapse);
      }
      if (cn.children) { q = q.concat(cn.children); }
    }
    // no nodes to open
  }

  // highlight selected node
  function selectNode(node) {
    if (curNode) {
      delete curNode.selected;
    }
    curNode = node;
    curNode.selected = true;
    curPath = []; // filled in by fullpath
    d3.select('#selection').html(fullpath(node));
  }

  // for displaying full path of node in tree
  function fullpath(d, idx) {
    idx = idx || 0;
    curPath.push(d);
    return (d.parent ? fullpath(d.parent, curPath.length) : '') +
      '/<span class="nodepath'+(d.name === root.name ? ' highlight' : '')+
      '" data-sel="'+ idx +'" title="Set Root to '+ d.name +'">' +
      d.name + '</span>';
  }

  // d3 event handlers

  function switchroot() {
    d3.event.preventDefault();
    var pathelms = document.querySelectorAll('#selection .nodepath');
    for (var i = 0; i < pathelms.length; i++) {
      pathelms[i].classList.remove('highlight');
    }
    var target = d3.event.target;
    var node = curPath[+target.dataset.sel];
    if (d3.event.shiftKey) {
      if (curNode !== node) {
        selectNode(node);
      }
    } else {
      root = node;
      target.classList.add('highlight');
    }
    update(root, true);
  }

  function resize() { // window resize
    var oldwidth = width;
    var oldheight = height;
    width = window.innerWidth - 20;
    height = window.innerHeight - 20;
    tree.size([360, Math.min(width, height) / 2 - 120]);
    svgBase.attr('width', width).attr('height', height);
    curX += (width - oldwidth) / 2;
    curY += (height - oldheight) / 2;
    svgGroup.attr('transform', 'rotate(' + curR + ' ' + curX + ' ' + curY +
        ')translate(' + curX + ' ' + curY + ')scale(' + curZ + ')');
    update(root);
  }

  function click(d) { // select node
    if (d3.event.defaultPrevented || d === curNode) { return; } // suppressed
    d3.event.preventDefault();
    selectNode(d);
    update(d);
  }

  function dblclick(d) {  // Toggle children of node
    if (d3.event.defaultPrevented) { return; } // click suppressed
    d3.event.preventDefault();
    if (d3.event.shiftKey) {
      expand1Level(d); // expand node by one level
    } else {
      toggle(d);
    }
    update(d, true);
  }

  // limit size of text and nodes as scale increases
  function reduceZ() {
    return Math.pow(1.1, -curZ);
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

function Person(name, information) {
	this.name = name
	this.job_title = information["job_title"]
	this.skills = information["skills"]
	this.projects = information["projects"]
}
