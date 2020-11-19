// main.js - put your code here
	$(document).ready(function() {
		if (p['key'] != undefined){
			if (p['title'] != undefined){
				var title = decodeURIComponent(p['title']);
				document.title = title;
				$('h1').text(title);
			}
			var tq = "&tq=select%20*";
			if (p['tq'] != undefined){
				tq = "&tq="+p['tq'];	
			} 
			var gid ="";
			if (p['gid'] != undefined){
				gid = "&gid="+p['gid'];	
			} else if (p['sheet'] != undefined){
				gid = "&sheet="+p['sheet'];
			}
			var url = 'https://spreadsheets.google.com/tq?key='+p['key']+gid+'&pub=1'+tq;
			var query = new google.visualization.Query(url);
			query.send(handleQueryResponse);
		}
	});
		$(function() {
		$("#aUnfold").click(function() {
        var nav = $("#nav");
		console.log(nav.offset().top);
        if (nav.offset().top < -6) {
            nav.animate({
                "top" : "-20px"
            }, function() {
                $("#aUnfold").attr("class","leftarrow");
            });
        } else {
            nav.animate({
                "top" : "-" + nav.height() + "px"
            }, function() {
                $("#aUnfold").attr("class","rightarrow");
            });
        }
        return false;
    	});
	});
	
	function preview() {
	  $('#sheetSelect').hide();
	  $('#loader').show();
	  if ($('#gsKey').val()!='') key=$('#gsKey').val();
	  if (/key=([^&#]*)/.test(key)) key=getParameterByName('key',key);
	
	  var url='https://spreadsheets.google.com/feeds/worksheets/'+key+'/public/basic?alt=json';
	  $.getJSON(url,function(json){
		var vizUrl=document.getElementById('gsSheet');
		var optionSelected = 0;
		for (var u in json['feed']['entry']) {
		  var sheetName = json['feed']['entry'][u]['title']['$t'];
		  var sheetQueryString = getQueryVars(json['feed']['entry'][u]['link'][2]['href']);
		  var sheetID = sheetQueryString['sheet'];
		  if (sheetName == "Edges")
				optionSelected = u;
		  vizUrl.options[u]=new Option(sheetName,sheetID);
		}
		vizUrl.options[optionSelected].selected = true;
		$('#loader').hide();
		$('#sheetSelect').show();
	  });
	}

	function getQueryVars(){
		var vars = [], hash;
		var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
		for(var i = 0; i < hashes.length; i++)
		{
		  hash = hashes[i].split('=');
		  vars.push(hash[0]);
		  vars[hash[0]] = hash[1];
		}
		return vars;
	}
	
	var p = getQueryVars();
	var data, sankey, margin, width, height;

    
    function handleQueryResponse(response) {
      if (response.isError()) {
        alert('Error in query: ' + response.getMessage() + ' ' + response.getDetailedMessage());
        return;
      }
    
      data = response.getDataTable();
	  

//if (p['key'] != undefined && p['gid'] != undefined && p['tq'] != undefined){
	console.log("Making sankey ...");
	var units = "Weight:";
	
	margin = {top: 10, right: 10, bottom: 10, left: 10},
		width = 1000 - margin.left - margin.right,
		height = 500 - margin.top - margin.bottom;
	
	var formatNumber = d3.format(",.0f"),    // zero decimal places
		format = function(d) { return units + " " + formatNumber(d) },
		color = d3.scale.category20();
	
	// append the svg canvas to the page
	var svg = d3.select("#chart").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
	  .append("g")
		.attr("transform", 
			  "translate(" + margin.left + "," + margin.top + ")");
	
	// Set the sankey diagram properties
	sankey = d3.sankey()
		.nodeWidth(15)
		.nodePadding(10)
		.size([width, height]);
	
	var path = sankey.link();
	
	// load the data (using the timelyportfolio csv method)
	
	//console.log("https://spreadsheets.google.com/tq?tqx=out:html&tq="+p['tq']+"&key="+p['key']+"&gid="+p['gid'])
	//d3.csv("https://spreadsheets.google.com/tq?tqx=out:csv&tq="+p['tq']+"&key="+p['key']+"&gid="+p['gid'], function(error, data) {
	
	  //set up graph in same style as original example but empty
	  graph = {"nodes" : [], "links" : []};
		if (p['output'] == 1){
			for (i=0; i<data.getNumberOfRows(); i++){	
				graph.nodes.push({ "name": data.getValue(i,0) });
				graph.nodes.push({ "name": data.getValue(i,1) });
				graph.links.push({ "source": data.getValue(i,0),
								   "target": data.getValue(i,1),
								   "value": +data.getValue(i,2) });
			}	
		} else if (p['output'] == 2){
			for (i=0; i<data.getNumberOfRows(); i++){	
				if (data.getValue(i,3)) {
				graph.nodes.push({ "name": data.getValue(i,0) });
					graph.nodes.push({ "name": data.getValue(i,3) });
					graph.links.push({ "source": data.getValue(i,0),
								   "target": data.getValue(i,3),
								   "value": +data.getValue(i,2) });
					graph.nodes.push({ "name": data.getValue(i,3) });
					graph.nodes.push({ "name": data.getValue(i,1) });
				graph.links.push({ "source": data.getValue(i,3),
								   "target": data.getValue(i,1),
								   "value": +data.getValue(i,2) });
				} else {
					graph.nodes.push({ "name": data.getValue(i,0) });
					graph.nodes.push({ "name": data.getValue(i,1) });
				graph.links.push({ "source": data.getValue(i,0),
								   "target": data.getValue(i,1),
								   "value": +data.getValue(i,2) });
				}
			}	
		} else if (p['tq'] != undefined) {
			var d = {};
			var splitBy = decodeURIComponent(p['splitby']) || ", ";
			for (var c = 0; c <  data.getNumberOfColumns()-1; c++){
				for (i=0; i<data.getNumberOfRows(); i++){	
				  var sources = data.getValue(i,c).split(splitBy);
				  for (s in sources){
					if (sources[s] !=""){
					  var targets = data.getValue(i,c+1).split(splitBy);
					  for (t in targets){
						if (targets[t] !=""){
						  if (d[sources[s]+"|"+targets[t]] == undefined){
							d[sources[s]+"|"+targets[t]] = {source:sources[s],
															target: targets[t],
															value: 1};
						  } else {
							d[sources[s]+"|"+targets[t]].value = d[sources[s]+"|"+targets[t]].value+1;
						  }
						}
					  }
					}
				  }
				}
			}
			for (i in d){
				graph.nodes.push({ "name": d[i].source });
				graph.nodes.push({ "name": d[i].target });
				graph.links.push({ "source": d[i].source,
								   "target": d[i].target,
								   "value": +d[i].value });
			} 
		} else {
			alert('No valid source data found');	
		}
	     //}
		 // return only the distinct / unique nodes
		 graph.nodes = d3.keys(d3.nest()
		   .key(function (d) { return d.name; })
		   .map(graph.nodes));
	
		 // loop through each link replacing the text with its index from node
		 graph.links.forEach(function (d, i) {
		   graph.links[i].source = graph.nodes.indexOf(graph.links[i].source);
		   graph.links[i].target = graph.nodes.indexOf(graph.links[i].target);
		 });
	
		 //now loop through each nodes to make nodes an array of objects
		 // rather than an array of strings
		 graph.nodes.forEach(function (d, i) {
		   graph.nodes[i] = { "name": d };
		 });
	
	  sankey
		.nodes(graph.nodes)
		.links(graph.links)
		.layout(32);
	
	// add in the links
	  var link = svg.append("g").selectAll(".link")
		  .data(graph.links)
		.enter().append("path")
		  .attr("class", "link")
		  .attr("d", path)
		  .style("stroke-width", function(d) { return Math.max(1, d.dy); })
		  .sort(function(a, b) { return b.dy - a.dy; });
	
	// add the link titles
	  link.append("title")
			.text(function(d) {
				return d.source.name + " → " + 
					d.target.name + "\n" + format(d.value); });
	
	// add in the nodes
	  var node = svg.append("g").selectAll(".node")
		  .data(graph.nodes)
		.enter().append("g")
		  .attr("class", "node")
		  .attr("transform", function(d) { 
			  return "translate(" + d.x + "," + d.y + ")"; })
		.call(d3.behavior.drag()
		  .origin(function(d) { return d; })
		  .on("dragstart", function() { 
			  this.parentNode.appendChild(this); })
		  .on("drag", dragmove));
	
	// add the rectangles for the nodes
	  node.append("rect")
		  .attr("height", function(d) { return d.dy; })
		  .attr("width", sankey.nodeWidth())
		  .style("fill", function(d) { 
			  return d.color = color(d.name.replace(/ .*/, "")); })
		  .style("stroke", function(d) { 
			  return d3.rgb(d.color).darker(2); })
		.append("title")
		  .text(function(d) { 
			  return d.name + "\n" + format(d.value); });
	
	// add in the title for the nodes
	  node.append("text")
		  .attr("x", -6)
		  .attr("y", function(d) { return d.dy / 2; })
		  .attr("dy", ".35em")
		  .attr("text-anchor", "end")
		  .attr("transform", null)
		  .text(function(d) { return d.name; })
		.filter(function(d) { return d.x < width / 2; })
		  .attr("x", 6 + sankey.nodeWidth())
		  .attr("text-anchor", "start");
	
	// the function for moving the nodes
	  function dragmove(d) {
		d3.select(this).attr("transform", 
			"translate(" + d.x + "," + (
					d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))
				) + ")");
		sankey.relayout();
		link.attr("d", path);
	  }
	//});
//} // end of is query set

		if (p['fontSize'] != undefined){
			console.log(p['fontSize']);
			$('svg').css({fontSize:p['fontSize']});
		}
    }