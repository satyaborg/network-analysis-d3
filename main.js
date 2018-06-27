//main js file

$(document).ready(function(){
    
    //default function call to create a network graph
    createD3Network();
    $('[data-toggle="popover"]').popover();   
    
});

//function for creating the network graph
function createD3Network(){

    //variables
    var width = 1000;
    var height = 500;

    //this variable can be assigned the name of the source data file
    var dataSource = "data.json";

    //declaring the main svg variable
    var svg = d3.select("#network")
        .append("svg")
        .attr("width", width)
        .attr("height", height)

    //reading the json data
    d3.json(dataSource, function(error, json_data) {
        //error handling
        if(error){
            return console.error(error);
        }

    var links = json_data.links   
    var nodes = json_data.nodes
    var expanded_links = [];
    var factor = 0.015;

    //div for the tooltip
    var div = d3.select("#network").append("div")
        .attr("class", "tooltip")				
        .style("opacity", 0);

    links.forEach(function(d) {
        expanded_links.push({'node' : d.node01, 'amount' : d.amount})
        expanded_links.push({'node' : d.node02, 'amount' : d.amount})
    });

    //finding the total amount
    var data = d3.nest().key(function(d){ return d.node })
        .rollup(function(d){
            return d3.sum(d, function(g){ return g.amount })
        }).entries(expanded_links);

    //sorting the keys
    data.sort(function(x, y){
       return d3.ascending(x.key, y.key);
    });
    nodes.sort(function(x, y){
       return d3.ascending(x.id, y.id);
    });

    data.forEach(function(d,i){
        d.node = d.key;
        delete d.key;
        d.amount = d.value;
        delete d.value;
        d.x = nodes[i].x;
        d.y = nodes[i].y;
        noOfSites = 0;
        links.map(function(val,idx,arr){
            if (val.node01 == d.node || val.node02 == d.node){
                noOfSites++;
            }
        }); 
        d.noOfSites = noOfSites;
    });

    function showTip(d){
        div.style("display", "block");

        div.transition()		
            .duration(200)		
            .style("opacity", .9);		

        div.html("Total trading amount : " + d.amount+"<br/>"+
            "No. of connected sites : " + d.noOfSites)	
            .style("left", (d.x + d.amount * factor) + "px")		
            .style("top", (d.y+10) + "px");
    }

    function hideTip(){
        div.transition()		
            .duration(500)		
            .style("opacity", 0);

        div.style("display", "none");
    }

    var expanded_nodes = {};
    nodes.map(function(val,i,arr){
        expanded_nodes[val.id] = {"x" : val.x, "y" : val.y};
    });

    //for checking for links between nodes    
    var linkedByIndex = {};
    links.forEach(function(d) {
      linkedByIndex[d.node01 + "," + d.node02] = true;
    });

    //function to determine if two nodes are connected or not
    function isConnected(x, y){
      return linkedByIndex[x.node + "," + y.node] || linkedByIndex[y.node + "," + x.node] || x.node == y.node;
    }   

    //creating the links
    var link = svg.selectAll(".link")
        .data(links).enter()
        .append("line")
        .attr("stroke", '#777')
        .attr("stroke-width", function(d) { return d.amount * 0.01 })
        .attr("x1", function(d) { return expanded_nodes[d.node01].x; })
        .attr("y1", function(d) { return expanded_nodes[d.node01].y; })
        .attr("x2", function(d) { return expanded_nodes[d.node02].x; })
        .attr("y2", function(d) { return expanded_nodes[d.node02].y; });

    //creating the circles
    var node = svg.selectAll(".node")
        .data(data).enter()
        .append("circle")
        .attr("r", function(d) { return (d.amount * factor); })
        .attr("cx", function(d) { return (d.x); })
        .attr("cy", function(d) { return (d.y); })
        .attr("fill", "yellowgreen")
        .on("mouseover", function(d) {
            //show tooltip
            showTip(d);
            //highlight the node
            node.attr("fill", function(o){
                return d.node == o.node ? "#c4e500" : "yellowgreen";
            });
            //highlight the links
            link.attr("stroke", function(o){
                return o.node01 === d.node || o.node02 === d.node ? "#8fbc8f" : "#777";
            });
            //increase font size
            text.attr("font-size", function(o){
                return d.node == o.node ? "25px" : "14px";
            //change font color
            }).attr("fill", function(o){
                return d.node == o.node ? "#c4e500" : "black";
            });
            //to make non-connected nodes transparent
            node.transition(500).style("opacity", function(o) {
                return isConnected(d, o) ? 1.0 : 0.1 ;
            });
            //to make non-connected links transparent
            link.transition(500).style("opacity", function(o) {
                return o.node01 === d.node || o.node02 === d.node ? 1.0 : 0.1;
            });
            //to make other text transparent
            text.transition(500).style("opacity", function(o) {
                return isConnected(d, o) ? 1.0 : 0.1 ;
            });
        })
        .on("mouseout", function(d) {
            //hide tooltip
            hideTip();
            //change the all properties to default
            node.attr("fill", "yellowgreen" );
            link.attr("stroke", "#777");
            text.attr("fill", "black").attr("font-size", "14px");
            node.transition(500).style("opacity", 1)
            link.transition(500).style("opacity", 1);
            text.transition(500).style("opacity", 1);
    });

    //Creating the text labels
    var text = svg.selectAll("text")
        .data(data).enter()
        .append("text")
        .attr("x", function(d) { return (d.x + d.amount * 0.02); })
        .attr("y", function(d) { return (d.y - d.amount * 0.010); })
        .attr("text-anchor", "right")
        .attr("font-weight", "bold")
        .text(function(d){
            return d.node;
        });

    });

}


