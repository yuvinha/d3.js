const svg = d3.select("svg");

d3.json("planets.json").then((data) => {
  const circs = svg.selectAll("circle").data(data);

  circs
    .attr("r", (d) => d.radius)
    .attr("cx", (d) => d.distance)
    .attr("cy", 200)
    .attr("fill", (d) => d.fill);

  circs
    .enter()
    .append("circle")
    .attr("r", (d) => d.radius)
    .attr("cx", (d) => d.distance)
    .attr("cy", 200)
    .attr("fill", (d) => d.fill);
});
