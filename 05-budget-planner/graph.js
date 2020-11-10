// const dims = { width: 300, height: 300, radius: 150 }; // Dimensions
const dims = { width: 300, height: 300, radius: 150 }; // Dimensions
const cent = { x: dims.width / 2 + 5, y: dims.height / 2 + 5 }; // Center of the pie chart

const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", dims.width + 150)
  .attr("height", dims.height + 150);

const graph = svg
  .append("g")
  .attr("transform", `translate(${cent.x}, ${cent.y})`);

// Pie generator
const pie = d3
  .pie()
  .sort(null)
  .value((d) => d.cost);

// Arc path generator
const arcPath = d3
  .arc()
  .outerRadius(dims.radius)
  .innerRadius(dims.radius / 2);

// Color ordinal scale (https://github.com/d3/d3-scale-chromatic)
const color = d3.scaleOrdinal(d3["schemeSet3"]);

// Legend (https://d3-legend.susielu.com/)
const legendGroup = svg
  .append("g")
  .attr("transform", `translate(${dims.width + 40}, 10)`);

const legend = d3.legendColor().shape("circle").shapePadding(5).scale(color);

// Update function
const update = (data) => {
  // Update the color scale domain
  color.domain(data.map((item) => item.name));

  // Update the legend
  legendGroup.call(legend);
  legendGroup.selectAll("text").attr("fill", "white");

  // Join the data to paths
  const paths = graph.selectAll("path").data(pie(data));

  // Remove the exit selections
  paths.exit().transition().duration(500).attrTween("d", arcTweenExit).remove();

  // Update the current DOM paths
  paths
    // .attr("d", arcPath)
    .transition()
    .duration(500)
    .attrTween("d", arcTweenUpdate);

  // Add the enter selections to the DOM
  paths
    .enter()
    .append("path")
    .attr("class", "arc")
    // .attr("d", arcPath)
    .attr("stroke", "#3f51b5") // Same as the background color
    .attr("stroke-width", 5)
    .attr("fill", (d) => color(d.data.name))
    .each(function (d) {
      // To save the original object
      this._current = d;
    })
    .transition()
    .duration(500)
    .attrTween("d", arcTweenEnter);
};

// Data array and Firestore
let data = [];
db.collection("expenses").onSnapshot((res) => {
  res.docChanges().forEach((change) => {
    const doc = { ...change.doc.data(), id: change.doc.id };

    switch (change.type) {
      case "added":
        data.push(doc);
        break;
      case "modified":
        const index = data.findIndex((item) => item.id === doc.id);
        data[index] = doc;
        break;
      case "removed":
        data = data.filter((item) => item.id !== doc.id);
        break;
      default:
        break;
    }
  });

  update(data);
});

// Custom Tween for the Enter selections
const arcTweenEnter = (d) => {
  const i = d3.interpolate(d.endAngle, d.startAngle);

  return function (t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

const arcTweenExit = (d) => {
  const i = d3.interpolate(d.startAngle, d.endAngle);

  return function (t) {
    d.startAngle = i(t);
    return arcPath(d);
  };
};

function arcTweenUpdate(d) {
  const i = d3.interpolate(this._current, d);

  // Save the updated value to the current property
  this._current = d;
  // this._current = i(d);

  return function (t) {
    return arcPath(i(t));
  };
}
