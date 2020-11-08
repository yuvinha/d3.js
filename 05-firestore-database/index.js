/**
 * SETUP
 */
const svg = d3
  .select(".canvas")
  .append("svg")
  .attr("width", 600)
  .attr("height", 600);

// Add margins around the graph
const margins = { top: 20, right: 20, bottom: 100, left: 100 };
const graphWidth = 600 - margins.left - margins.right;
const graphHeight = 600 - margins.top - margins.bottom;
const graph = svg
  .append("g")
  .attr("width", graphWidth)
  .attr("height", graphHeight)
  .attr("transform", `translate(${margins.left}, ${margins.top})`);

// Linear scale (Y)
const y = d3.scaleLinear().range([graphHeight, 0]);

// Band scale (X)
const x = d3.scaleBand().range([0, 500]).paddingInner(0.2).paddingOuter(0.2);

// Add axes on the graph
const xAxisGroup = graph
  .append("g")
  .attr("transform", `translate(0, ${graphHeight})`);
const yAxisGroup = graph.append("g");

// Create axes
const xAxis = d3.axisBottom(x);
const yAxis = d3
  .axisLeft(y)
  .ticks(5)
  .tickFormat((d) => d + " orders");

/**
 * UPDATE
 */
const update = (data) => {
  // 1. Update scale domains
  y.domain([0, d3.max(data, (d) => d.orders)]);
  x.domain(data.map((item) => item.name));

  // 2. Join the data to rects
  const rects = graph.selectAll("rect").data(data);

  // 3. Remove exit selections
  rects.exit().remove();

  // 4. Update current shapes in the DOM
  rects
    .attr("width", x.bandwidth)
    .attr("height", (d) => graphHeight - y(d.orders))
    .attr("x", (d) => x(d.name))
    .attr("y", (d) => y(d.orders))
    .attr("fill", "orangered");

  // 5. Add enter selections to the DOM
  rects
    .enter()
    .append("rect")
    .attr("width", x.bandwidth)
    .attr("height", (d) => graphHeight - y(d.orders))
    .attr("x", (d) => x(d.name))
    .attr("y", (d) => y(d.orders))
    .attr("fill", "orangered");

  // 6. Call the axes
  xAxisGroup.call(xAxis);
  yAxisGroup.call(yAxis);

  // 7. Update xAxis texts
  xAxisGroup
    .selectAll("text")
    .attr("transform", "rotate(-40)")
    .attr("text-anchor", "end")
    .attr("fill", "orangered");
};

/**
 * GET data from firestore
 */
/* Realtime */
let data = [];

db.collection("dishes").onSnapshot((res) => {
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
/* Static */
// db.collection("dishes")
//   .get()
//   .then((res) => {
//     let data = [];
//     res.docs.forEach((doc) => data.push(doc.data()));

//     update(data);
//   });
