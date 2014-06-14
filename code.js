var svg, r;

function init() {
  r = 200;
  createWheel("wheel", 400);
}

function createWheel(element, size){
  var gradient, arc, data;

  // create the arc function
  arc = d3.svg.arc().innerRadius(0).outerRadius(r).startAngle(function(d) {
        return d.startAngle;
      }).endAngle(function(d) {
        return d.endAngle;
      });

  // create the data for the color fan
  // increase detail 180 => 360, 2 =>
  data = d3.range(180).map(function(d, i) { // 180 pie pieces
    i *= 2; // there is a new piece every 2 degrees
    return {
      startAngle: i * (Math.PI / 180),
      endAngle: (i + 2) * (Math.PI / 180), // pieces are 2 degrees wide
      fill: d3.hsl(i, 1, 0.5).toString() // hue, satturation, lightness
    };
  });

  // create the svg
  svg = d3.select("#" + element).insert('svg')
    .attr("width", r*2)
    .attr("height", r*2)
    .style("border", "1px solid black");

  // append gray gradient circle
  gradient = svg.append("svg:defs").append("svg:radialGradient")
    .attr("id", "gradient")
    .attr("cx", "50%").attr("cy", "50%") // center point (this & r = edge)
    .attr("r", "50%")
    .attr("fx", "50%").attr("fy", "50%") // focal point (percieved middle)
    .attr("spreadMethod", "pad"); // what to to at the end of the gradient (continue color)
  gradient.append("svg:stop").attr("offset", "20%")
    .attr("stop-color", "rgb(100,100,100)").attr("stop-opacity", 1);
  gradient.append("svg:stop").attr("offset", "100%")
    .attr("stop-color", "rgb(100,100,100)").attr("stop-opacity", 0);

  // append color fan
  svg.attr("id", "icon").append('g')
    //.attr("transform", "translate(" + r + "," + r + ") rotate(90) scale(-1,1)") // why flip and rotate?
    .attr("transform", "translate(" + r + "," + r + ")")
    .selectAll('path').data(data).enter()
    .append('path').attr("d", arc)
    .attr("stroke-width", 1).attr("stroke", function(d) { // stroke to prevent tiny gaps
        return d.fill;
      }).attr("fill", function(d) {
        return d.fill;
      });

  // append circle with gradient on top
  svg.append("circle").attr("cx", r).attr("cy", r).attr("r", r).attr("fill", "url('#gradient')");
  // add cursor
  svg.append("circle").attr("id","cursor").attr("cx", r).attr("cy", r).attr("r", 10).attr("stroke", "black").attr("stroke-width", 2).style("fill-opacity", 0);;
  // move cursor with mouse
  svg.on("mousemove", moveCursor);
}

function moveCursor(){
  var point = d3.mouse(this);
  var distance = Math.abs(Math.sqrt((point[0]-r)*(point[0]-r) + (point[1]-r)*(point[1]-r)));
  console.log(distance);
  if (distance < r)
  svg.select("#cursor").attr("cx", point[0]).attr("cy", point[1]);
}