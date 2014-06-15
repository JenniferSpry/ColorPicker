var svg, r;
var circleMoving = false, scaleMoving = false;
var hue, saturation, lightness;

function init() {
  r = 200;
  createWheel("wheel");
}

function createWheel(element){
  var gradient, arc, data, grayCircle, lightnessScale;

  // it starts with red
  this.hue = 0;
  this.saturation = 1;
  this.lightness = 0.5;

  // create the arc function
  arc = d3.svg.arc().innerRadius(0).outerRadius(r).startAngle(function(d) {
        return d.startAngle;
      }).endAngle(function(d) {
        return d.endAngle;
      });

  // create the data for the color fan
  // increase detail 180 => 360, 2 => 1
  data = d3.range(180).map(function(d, i) { // 180 pie pieces
    i *= 2; // there is a new piece every 2 degrees
    return {
      startAngle: i * (Math.PI / 180),
      endAngle: (i + 2) * (Math.PI / 180), // pieces are 2 degrees wide
      fill: d3.hsl(i, 1, 0.5).toString() // hue, saturation, lightness
    };
  });

  // create the svg
  svg = d3.select("#" + element).insert('svg')
    .attr("width", r*2)
    .attr("height", r*2+r/10+r/6);

  // append gray gradient
  gradient = svg.append("svg:defs").append("svg:radialGradient")
    .attr("id", "grayGradient")
    .attr("cx", "50%").attr("cy", "50%") // center point (this & r = edge)
    .attr("r", "50%")
    .attr("fx", "50%").attr("fy", "50%") // focal point (percieved middle)
    .attr("spreadMethod", "pad"); // what to to at the end of the gradient (continue color)
  gradient.append("svg:stop").attr("offset", "10%")
    .attr("stop-color", "rgb(150,150,150)").attr("stop-opacity", 1);
  gradient.append("svg:stop").attr("offset", "100%")
    .attr("stop-color", "rgb(150,150,150)").attr("stop-opacity", 0);

  // append black to white gradient
  gradient = svg.append("svg:defs").append("svg:linearGradient")
    .attr("id", "blackToWhiteGradient")
    .attr("spreadMethod", "pad"); // what to to at the end of the gradient (continue color)
  gradient.append("svg:stop").attr("offset", "0%")
    .attr("stop-color", "rgb(0,0,0)").attr("stop-opacity", 1);
  gradient.append("svg:stop").attr("offset", "50%")
    .attr("stop-color", "rgb(0,0,0)").attr("stop-opacity", 0);
  gradient.append("svg:stop").attr("offset", "100%")
    .attr("stop-color", "rgb(255,255,255)").attr("stop-opacity", 1);

  // append lightness scale ______________________________________________
  // color rectangle
  svg.append("rect").attr("id", "lightnessScaleColor")
    .attr("x", 0)
    .attr("y", 2*r+r/10)
    .attr("width", 2*r)
    .attr("height", r/6)
    .style("fill", d3.hsl(hue, saturation, lightness).toString()); // to an RGB hexadecimal string

  // gradient rectangle
  lightnessScale = svg.append("rect").attr("id", "lightnessScale")
    .attr("x", 0)
    .attr("y", 2*r+r/10)
    .attr("width", 2*r)
    .attr("height", r/6)
    .style("fill", "url(#blackToWhiteGradient)");

  // line cursor
  svg.append("rect").attr("id", "lightnessScaleCursor")
    .attr("x", r).attr("y", 2*r+r/10)
    .attr("width", 3).attr("height", r/6)
    .style("fill", "black")
    .attr("pointer-events", "none"); // so I can put the event listener on the element below

  // append color fan __________________________________________________
  // color pieces
  svg.attr("id", "icon").append('g')
    .attr("transform", "translate(" + r + "," + r + ")") // position in the middle
    .selectAll('path').data(data).enter()
    .append('path').attr("d", arc)
    .attr("stroke-width", 1).attr("stroke", function(d) { // stroke to prevent tiny gaps
        return d.fill;
      }).attr("fill", function(d) {
        return d.fill;
      });

  // circle with gradient
  grayCircle = svg.append("circle").attr("cx", r).attr("cy", r).attr("r", r).attr("fill", "url('#grayGradient')");
  
  // circle cursor
  svg.append("circle").attr("id","circleCursor").attr("cx", r).attr("cy", 5).attr("r", 10).attr("stroke", "black")
    .attr("stroke-width", 2).style("fill-opacity", 0).attr("pointer-events", "none"); // ignore this when it comes to events
  
  // add result color view _____________________________________________
  svg.append("circle").attr("id", "resultColor").attr("cx", 2*r-r/7).attr("cy",r/7).attr("r", r/8).attr("fill", d3.hsl(hue, saturation, lightness).toString());
  
  // add listeners _____________________________________________________
  // add listerners on lightness scale
  lightnessScale.on("mousemove", setLightness)
    .on("mousedown", setScaleMoving)
    .on("mouseup", setScaleNotMoving);

  // move cursor with mouse
  grayCircle.on("mousemove", setHueAndSaturation)
    .on("mousedown", setCircleMoving)
    .on("mouseup", setCircleNotMoving)
}

function setCircleMoving() {
  circleMoving = true;
}

function setCircleNotMoving() {
  var point = d3.mouse(this);
  setHueAndSaturation(point);
  circleMoving = false;
}

function setHueAndSaturation(p) {
  if (circleMoving) {
    var point = p || d3.mouse(this);
    var distance = Math.abs(Math.sqrt((point[0]-r)*(point[0]-r) + (point[1]-r)*(point[1]-r)));

    if (distance < r) {
      svg.select("#circleCursor").attr("cx", point[0]).attr("cy", point[1]);
      var colorRadius = (Math.atan2((point[1]-r), (point[0]-r)) * 180/Math.PI) + 90;
      // + 90 because the arc starts at 12 o'clock
      if (colorRadius < 0) colorRadius += 360;

      svg.select("#cursor").attr("cx", point[0]).attr("cy", point[1]);
      svg.select("#lightnessScaleColor").style("fill", d3.hsl(colorRadius, distance/r, 0.5).toString());
      hue = colorRadius;
      saturation = distance/r;
      updateColor();
    }
  }
}

function setScaleMoving() {
  scaleMoving = true;
}

function setScaleNotMoving() {
  var point = d3.mouse(this);
  setLightness(point);
  scaleMoving = false;
}

function setLightness(p) {
  if(scaleMoving){
    var point = p || d3.mouse(this);
    svg.select("#lightnessScaleCursor").attr("x", point[0]);
    if (point[0] < r) {
      svg.select("#lightnessScaleCursor").style("fill", "white");
    } else {
      svg.select("#lightnessScaleCursor").style("fill", "black");
    }
    lightness = point[0]/(2*r);
    updateColor();
  }
}

function updateColor(){
  svg.select("#resultColor").attr("fill", d3.hsl(hue, saturation, lightness).toString());
}