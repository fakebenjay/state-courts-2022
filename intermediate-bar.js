//Create svg3 element
var barWidth = document.getElementById('intermediate-map').offsetWidth
var rawWidth = document.getElementById('article-body').offsetWidth
var w = rawWidth;
var h = rawWidth * (2 / 3);
var projection = d3.geoMercator()
  .translate([w / 2, h / 2.25])
  .scale([rawWidth * 1.25]);
//Define path generator
var path = d3.geoPath()
  .projection(projection);
var svg3 = d3.select("#intermediate-map .chart-bar")
  .append("svg")
  .attr("width", barWidth)
  .attr("height", height);

var tooltip1 = d3.select(".chart-bar")
  .append('div')
  .style('visibility', 'hidden')
  .attr('class', 'my-tooltip')
  .attr('id', 'tooltip')

// Add X scale
var xScale = d3.scaleLinear()
  .domain([0, 1])
  .range([0, barWidth - margin.right - margin.left])

// Define X axis and format tick marks
var xAxis = d3.axisBottom(xScale)
  // .tickFormat((d) => {
  //   if (d === 0) {
  //     return '$' + 0
  //   } else if (d > 999999) {
  //     return `$${d/1000000}M`
  //   } else {
  //     return `$${d/1000}K`
  //   }
  // })
  .ticks(tickNums)
  .tickFormat(d => d * 100 + '%')

var xGrid = d3.axisBottom(xScale)
  .tickSize(-height + (margin.top + margin.bottom), 0, 0)
  .tickFormat("")
  .ticks(tickNums)

// Render X grid
svg3.append("g")
  .attr("transform", `translate(${margin.left},${height - margin.bottom})`)
  .attr("class", "grid")
  .style('color', 'black')
  .style('opacity', '0.3')
  .call(xGrid)

var yScale

d3.selectAll('#intermediate-map .toggle')
  .on('click', () => {
    d3.selectAll('#intermediate-map .toggle')
      .classed('active', false)

    d3.select(event.target)
      .classed('active', true)

    svg3.selectAll('.bar.contested')
      .transition()
      .duration(400)
      .attr('width', function(d) {
        let toggleSwitch = document.querySelector('#intermediate-map .toggle.active').className.includes('all') ? 'seats' : 'up'
        return xScale(d.contested / d[toggleSwitch]);
      })
      .attr("x", (d) => {
        let toggleSwitch = document.querySelector('#intermediate-map .toggle.active').className.includes('all') ? 'seats' : 'up'
        return margin.left + xScale(d.notContested / d[toggleSwitch])
      })

    svg3.selectAll('.bar.not-contested')
      .transition()
      .duration(400)
      .attr('width', function(d) {
        let toggleSwitch = document.querySelector('#intermediate-map .toggle.active').className.includes('all') ? 'seats' : 'up'
        return xScale(d.notContested / d[toggleSwitch]);
      })
      .attr("x", margin.left)

    svg3.selectAll('.bar.not-up')
      .transition()
      .duration(400)
      // .style('display', (d) => {
      //   let toggleSwitch = document.querySelector('#intermediate-map .toggle.active').className.includes('all') ? 'seats' : 'up'
      //   return toggleSwitch === 'up' ? 'none' : 'block'
      // })
      .attr('width', function(d) {
        let toggleSwitch = document.querySelector('#intermediate-map .toggle.active').className.includes('all') ? 'seats' : 'up'
        return toggleSwitch === 'seats' ? xScale(d.notUp / d[toggleSwitch]) : 0;
      })
      .attr("x", (d) => {
        let toggleSwitch = document.querySelector('#intermediate-map .toggle.active').className.includes('all') ? 'seats' : 'up'
        return margin.left + xScale(d.contested / d[toggleSwitch]) + xScale(d.notContested / d[toggleSwitch])
      })

    svg3.selectAll("#intermediate-map .y-axis .tick text")
      .text((d) => {
        let toggleSwitch = document.querySelector('#intermediate-map .toggle.active').className.includes('all') ? 'seats' : 'up'

        return toggleSwitch === 'seats' ? `${d.up} of ${d.seats}` : `${d.notContested} of ${d.up}`
      })

    d3.select('.chart-header .value')
      .text(() => {
        let toggleSwitch = document.querySelector('#intermediate-map .toggle.active').className.includes('all') ? 'seats' : 'up'

        return toggleSwitch === 'seats' ? `Seats up for election out of total` : `Contested seats out of seats up for election`
      })

    d3.select('.year.not-up')
      .style('display', () => {
        let toggleSwitch = document.querySelector('#intermediate-map .toggle.active').className.includes('all') ? 'seats' : 'up'

        return toggleSwitch === 'seats' ? `block` : `none`
      })
    // .on('mous
  })

function renderIntermediate() {
  d3.csv("intermediate-appellate.csv")
    .then(function(csv) {
      // Add Y scale
      csv.sort((b, a) => {
        return a.notContested / a.seats > b.notContested / b.seats
      })
      csv.sort((b, a) => {
        return a.notContested / a.up > b.notContested / b.up
      })
      yScale = d3.scaleBand()
        .range([margin.top, height - margin.bottom])
        .domain(csv.map(function(d) {
          return d.state;
        }))
        .padding(.1)

      // Define Y axis
      var yAxis = d3.axisLeft(yScale)
        .tickFormat('')
      var toggle = document.querySelector('#intermediate-map .toggle.active').className.includes('all') ? 'seats' : 'up'

      svg3.selectAll("bars")
        .data(csv)
        .enter()
        .append("rect")
        .attr("x", d => margin.left + xScale(d.notContested / d[toggle]))
        .attr("y", function(d) {
          return yScale(d.state)
        })
        .attr("width", function(d) {
          return xScale(d.contested / d[toggle]);
        })
        .attr("height", yScale.bandwidth())
        .attr('class', (d) => {
          return `bar contested ${d.state.toLowerCase().replaceAll(' ', '-').replaceAll('&', '-')}`
        })
        .style("fill", '#6ba292')
      // .on('mouseover mousemove', (d) => {
      //   return mouseover(d)
      // })
      // .on('mouseout', mouseout)

      svg3.selectAll("bars")
        .data(csv)
        .enter()
        .append("rect")
        .attr("x", d => margin.left)
        .attr("y", function(d) {
          return yScale(d.state)
        })
        .attr("width", function(d) {
          return xScale(d.notContested / d[toggle]);
        })
        .attr("height", yScale.bandwidth())
        .attr('class', (d) => {
          return `bar not-contested ${d.state.toLowerCase().replaceAll(' ', '-').replaceAll('&', '-')}`
        })
        .style("fill", '#ed6a5a')
      // .on('mouseover mousemove', (d) => {
      //   return mouseover(d)
      // })
      // .on('mouseout', mouseout)

      svg3.selectAll("bars")
        .data(csv)
        .enter()
        .append("rect")
        .attr("x", d => margin.left + xScale(d.contested / d[toggle]) + xScale(d.notContested / d[toggle]))
        .attr("y", function(d) {
          return yScale(d.state)
        })
        .attr("width", function(d) {
          return xScale(d.notUp / d[toggle]);
        })
        .attr("height", yScale.bandwidth())
        .attr('class', (d) => {
          return `bar not-up ${d.state.toLowerCase().replaceAll(' ', '-').replaceAll('&', '-')}`
        })
        .style("fill", '#d3d3d3')
        .style('display', d => d.toggle === 'up' ? 'none' : 'block')
      // .on('mouseover mousemove', (d) => {
      //   return mouseover(d)
      // })
      // .on('mouseout', mouseout)

      svg3.selectAll("bars")
        .data(csv)
        .enter()
        .append("text")
        .attr("x", function(d) {
          return 5 + margin.left
        })
        .attr("y", function(d) {
          return yScale(d.state) + yScale.bandwidth() - yScale.bandwidth() * .3
        })
        .text(d => `${d.state}`)
        .attr('class', (d) => {
          return `bar-label ${d.state.toLowerCase().replaceAll(' ', '-').replaceAll('&', '-')}`
        })
        .attr('text-anchor', 'start')
        .attr('font-size', '10pt')
        .attr('fill', 'black')
        .style('pointer-events', 'none')
        .style('font-weight', d => d.state === 'Attorney General' ? 'bold' : 'normal')

      svg3.selectAll('bars')
        .data(csv)

      // .on('mouseout')

      // Render X axis
      svg3.append("g")
        .attr("transform", `translate(${margin.left},${height - margin.bottom})`)
        .attr('class', 'x-axis')
        .call(xAxis)
        .style('color', 'black')
        .selectAll("text")
        .attr("transform", "translate(0,0)")
        .attr("text-anchor", "middle")
        .style('font-size', '8pt')


      svg3.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "end")
        .attr("x", regWidth / 2 + margin.right + margin.left)
        .attr("y", height - 5)
        .style('font-size', '9pt')

      //Render Y axis
      svg3.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .attr('class', 'y-axis')
        .style('color', 'black')
        .call(yAxis)
        .selectAll(".tick text")
        .style('text-anchor', 'end')
        .attr('class', (d) => {
          return 'status ' + d.toLowerCase().replaceAll(' ', '-').replaceAll('&', '-')
        })
        .style('font-size', '8pt')
        .call(wrapText, (margin.left))
        .data(csv)
        .style('font-weight', (d) => {
          return d.state === 'Attorney General' ? 'bold' : 'regular'
        })
        //
        // svg3.selectAll('.y-axis .tick text tspan')
        //   .data(csv)
        //   .enter()
        .text((d) => {
          return `${d.up} of ${d.seats}`
        })
      // .on('mouseover mousemove', (d) => {
      //   return mouseover(d)
      // })
      // .on('mouseout', mouseout)

      // d3.selectAll('.legend-entry')
      //   .on('mouseover mousemove', (d) => {
      //     d3.selectAll('.bar, .bar-label')
      //       .style('opacity', 0.3)
      //
      //     d3.selectAll(`.firm-${event.target.classList[0].split('-')[1]}`)
      //       .style('opacity', 1)
      //   })
      //   .on('mouseout', () => {
      //     d3.selectAll('.bar, .bar-label')
      //       .style('opacity', 1)
      //   })

    })
}

renderIntermediate()

// d3.json("https://assets.law360news.com/1531000/1531923/states-10m.json")
//   .then(function(json) {
//     var dataset = topojson.feature(json, json.objects.states).features
//     dataset = dataset.filter(d => yScale.domain().includes(d.properties.name))
//
//     svg3.append("path")
//       .data(dataset)
//       .attr("d", (d) => {
//         debugger
//         path(d)
//       })
//       .attr("class", d => `state ${d.properties.name.toLowerCase().replaceAll(' ', '-')}`)
//       .attr('stroke-width', '1')
//       .attr('stroke', 'black')
//       .attr('opacity', 1)
//       .attr('stroke-opacity', 1)
//       .attr('fill', 'none')
//   })