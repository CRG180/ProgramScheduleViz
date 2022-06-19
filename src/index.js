
// Svg element dimensions
const width = 960;
const height = 500;

// Set up svg element
const svg = d3.select("#chart").append("svg").attr("width", width).attr("height", height);

// Make a bar chart
const render = (countries) => {
  // Margins and dimensions of the drawing area

  const margin = { top: 50, right: 40, bottom: 75, left: 140 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  // Functions for draging the node
  function dragstarted() {
    d3.select(this).attr("r", 10);
    console.log("start");
  }

  function dragged(event, d) {
    var dx = event.x;
    var starting = xScale(d.start);
    var ending = xScale(d.population);
    //var x1New = dx > 800 ? 800 : dx < 0 ? 0 : dx;
    var x1New = dx > ending ? ending : dx < starting ? starting : dx;
    d3.select(this)
      .raise()
      .attr("cx", (d.current = x1New));
  }

  function dragended() {
    d3.select(this).attr("r", "6").attr("fill", "red");
  }

  //tooltip 
  var div = d3.select("body").append("div")
  .attr("class", "tooltip")
  .style("opacity", 0);

  var Tooltip = d3.select("#chart")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

 // Three function that change the tooltip when user hover / move / leave a cell
 var mouseover = function(d) {
  Tooltip
    .style("opacity", 1)
  d3.select(this)
    .style("stroke", "black")
    .style("opacity", 1)
}
var mousemove = function(d) {
  Tooltip
    .html("The exact value of<br>this cell is: " + d.population)
    .style("left", (d3.mouse(this)[0]+70) + "px")
    .style("top", (d3.mouse(this)[1]) + "px")
}
var mouseleave = function(d) {
  Tooltip
    .style("opacity", 0)
  d3.select(this)
    .style("stroke", "none")
    .style("opacity", 0.8)
}

            
  // Scales of the axes

  let xScale = d3.scaleLinear().domain([0, 26]).range([0, innerWidth]);

  const yScale = d3
    .scaleBand()
    .domain(countries.map((country) => country.country))
    .range([0, innerHeight])
    .padding(0.1);

  // Element containing everything related to the chart: axes, bars, titles, etc.
  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // Formats the population to improve readability
  const xAxisTickFormat = (number) =>
    d3.format(".3s")(number).replace("G", "B");

  // Axes
  const xAxis = d3
    .axisBottom(xScale)
    .tickFormat(xAxisTickFormat)
    .tickSize(-innerHeight);

  const yAxis = d3.axisLeft(yScale);

  // Axis elements group
  const yAxisG = g.append("g").call(yAxis);

  const xAxisG = g
    .append("g")
    .call(xAxis)
    .attr("transform", `translate(0, ${innerHeight})`);

  // Axis customization

  xAxisG.select(".domain").remove();

  xAxisG
    .append("text")
    .attr("class", "axis-label")
    .attr("x", innerWidth / 2)
    .attr("y", 65)
    .attr("fill", "black")
    .text("Fiscal Years");

  yAxisG.selectAll(".domain, .tick line").remove();

  // Plotting the bars
  g.selectAll("rect")
    .data(countries)
    .enter()
    .append("rect")
    .attr("y", (country) => yScale(country.country))
    .attr("x", (d) => xScale(d.start))
    .attr("width", (country) => xScale(country.population - country.start))
    .attr("height", yScale.bandwidth())
    .on("mouseover", function(event,d) {
      div.transition()
        .duration(200)
        .style("opacity", .9);
      div.html("hello")
        .style("left", (event.pageX) + "px")
        .style("top", (event.pageY - 28) + "px");
      })
    .on("mouseout", function(d) {
      div.transition()
        .duration(500)
        .style("opacity", 0);
      });
    //.on("mouseover", mouseover)
    //.on("mousemove", mousemove)
    //.on("mouseleave", mouseleave);

  // Plotting the action point
  g.selectAll("circle")
    .data(countries)
    .enter()
    .append("circle")
    .attr("cy", (d) => yScale(d.country) + 17)
    .attr("cx", (d) => xScale(d.current))
    .attr("r", 5)
    .call(
      d3
        .drag() // call specific function when circle is dragged
        .on("start", dragstarted)
        .on("drag", dragged)
        .on("end", dragended)
    );

  // Add title

  g.append("text")
    .attr("class", "title")
    .attr("y", -10)
    .text("Program Schedule: Capability X");
};

// Data reading
d3.csv("./src/data.csv").then((data) => {
  const countries = data.map(({ country, population, start, current }) => ({
    country : country,
    population: population,
    start: start,
    current: current
  }));
  render(countries);
});
