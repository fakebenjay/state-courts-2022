var svg4 = d3.select("#supreme-map .chart-bar")
  .append("svg")
  .attr("width", barWidth)
  .attr("height", height);

var tooltip4 = d3.select("#supreme-map .chart-bar")
  .append('div')
  .style('visibility', 'hidden')
  .attr('class', 'my-tooltip')
  .attr('id', 'supreme-tooltip')

var yScale4

d3.selectAll('#supreme-map .toggle')
  .on('click', () => {
    d3.selectAll('#supreme-map .toggle')
      .classed('active', false)

    d3.select(event.target)
      .classed('active', true)

    svg4.selectAll('#supreme-map .bar.contested')
      .transition()
      .duration(400)
      .attr('width', function(d) {
        let toggleSwitch = document.querySelector('#supreme-map .toggle.active').className.includes('all') ? 'seats' : 'up'
        return xScale(d.contested / d[toggleSwitch]);
      })
      .attr("x", (d) => {
        let toggleSwitch = document.querySelector('#supreme-map .toggle.active').className.includes('all') ? 'seats' : 'up'
        return margin.left + xScale(d.notContested / d[toggleSwitch])
      })
      .style('stroke-dasharray', (d) => {
        let toggleSwitch = document.querySelector('#supreme-map .toggle.active').className.includes('all') ? 'seats' : 'up'
        if (toggleSwitch === 'seats') {
          return d.state === 'OVERALL' ? `${xScale(d.contested / d[toggleSwitch])} ${yScale4.bandwidth()}` : '0'
        } else {
          return d.state === 'OVERALL' ? `${xScale(d.contested / d[toggleSwitch]) + yScale4.bandwidth() + xScale(d.contested / d[toggleSwitch])} ${yScale4.bandwidth()}` : '0'
        }
      })

    svg4.selectAll('#supreme-map .bar.not-contested')
      .transition()
      .duration(400)
      .attr('width', function(d) {
        let toggleSwitch = document.querySelector('#supreme-map .toggle.active').className.includes('all') ? 'seats' : 'up'
        return xScale(d.notContested / d[toggleSwitch]);
      })
      .attr("x", margin.left)
      .style('stroke-dasharray', (d) => {
        let toggleSwitch = document.querySelector('#supreme-map .toggle.active').className.includes('all') ? 'seats' : 'up'

        return d.state === 'OVERALL' ? `${xScale(d.notContested / d[toggleSwitch])} ${yScale4.bandwidth()} ${xScale(d.notContested / d[toggleSwitch]) + yScale4.bandwidth() + 3} 0` : '0'
      })

    svg4.selectAll('#supreme-map .bar.not-up')
      .transition()
      .duration(400)
      // .style('display', (d) => {
      //   let toggleSwitch = document.querySelector('#supreme-map .toggle.active').className.includes('all') ? 'seats' : 'up'
      //   return toggleSwitch === 'up' ? 'none' : 'block'
      // })
      .attr('width', function(d) {
        let toggleSwitch = document.querySelector('#supreme-map .toggle.active').className.includes('all') ? 'seats' : 'up'
        return toggleSwitch === 'seats' ? xScale(d.notUp / d[toggleSwitch]) : 0;
      })
      .attr("x", (d) => {
        let toggleSwitch = document.querySelector('#supreme-map .toggle.active').className.includes('all') ? 'seats' : 'up'
        return margin.left + xScale(d.contested / d[toggleSwitch]) + xScale(d.notContested / d[toggleSwitch])
      })
      .attr("x", (d) => {
        let toggleSwitch = document.querySelector('#supreme-map .toggle.active').className.includes('all') ? 'seats' : 'up'
        return margin.left + xScale(d.contested / d[toggleSwitch]) + xScale(d.notContested / d[toggleSwitch])
      })

    svg4.selectAll("#supreme-map .y-axis .tick text")
      .text((d) => {
        let toggleSwitch = document.querySelector('#supreme-map .toggle.active').className.includes('all') ? 'seats' : 'up'

        return toggleSwitch === 'seats' ? `${d.up} of ${d.seats}` : `${d.notContested} of ${d.up}`
      })

    d3.select('#supreme-map .chart-header .value')
      .html(() => {
        let toggleSwitch = document.querySelector('#supreme-map .toggle.active').className.includes('all') ? 'seats' : 'up'

        return toggleSwitch === 'seats' ? `<strong>43 races</strong> this year out of <strong>137 total seats</strong>` : `<strong>18 uncontested races</strong> out of <strong>43 total races</strong>`
      })

    d3.select('#supreme-map .year.not-up')
      .style('display', () => {
        let toggleSwitch = document.querySelector('#supreme-map .toggle.active').className.includes('all') ? 'seats' : 'up'

        return toggleSwitch === 'seats' ? `block` : `none`
      })
    // .on('mous
  })

function renderSupreme() {
  d3.csv("supreme-appellate.csv")
    .then(function(csv) {
      // Add Y scale
      csv.sort((b, a) => {
        return a.notContested / a.seats > b.notContested / b.seats
      })
      csv.sort((b, a) => {
        return a.notContested / a.up > b.notContested / b.up
      })
      yScale4 = d3.scaleBand()
        .range([margin.top, height - margin.bottom])
        .domain(csv.map(function(d) {
          return d.state;
        }))
        .padding(.1)

      // Define Y axis
      var yAxis4 = d3.axisLeft(yScale4)
        .tickFormat('')
      var toggle = document.querySelector('#supreme-map .toggle.active').className.includes('all') ? 'seats' : 'up'

      svg4.selectAll("bars")
        .data(csv)
        .enter()
        .append("rect")
        .attr("x", d => margin.left + xScale(d.notContested / d[toggle]))
        .attr("y", function(d) {
          return yScale4(d.state)
        })
        .attr("width", function(d) {
          return xScale(d.contested / d[toggle]);
        })
        .attr("height", yScale4.bandwidth())
        .attr('class', (d) => {
          return `bar contested ${d.state.toLowerCase().replaceAll(' ', '-').replaceAll('&', '-')}`
        })
        .style("fill", '#707c9c')
        .style('stroke', 'black')
        .style('stroke-dasharray', d => d.state === 'OVERALL' ? `${xScale(d.contested / d[toggle])} ${yScale4.bandwidth()}` : '0')
        .style('stroke-width', d => d.state === 'OVERALL' ? '3px' : '0')
        .on('mouseover mousemove', (d) => {
          return mouseover('supreme', d)
        })
        .on('mouseout', () => {
          return mouseout('supreme')
        })

      svg4.selectAll("bars")
        .data(csv)
        .enter()
        .append("rect")
        .attr("x", d => margin.left)
        .attr("y", function(d) {
          return yScale4(d.state)
        })
        .attr("width", function(d) {
          return xScale(d.notContested / d[toggle]);
        })
        .attr("height", yScale4.bandwidth())
        .attr('class', (d) => {
          return `bar not-contested ${d.state.toLowerCase().replaceAll(' ', '-').replaceAll('&', '-')}`
        })
        .style("fill", '#d5563a')
        .style('stroke', 'black')
        .style('stroke-dasharray', d => d.state === 'OVERALL' ? `${xScale(d.notContested / d[toggle])} ${yScale4.bandwidth()} ${xScale(d.notContested / d[toggle]) + yScale4.bandwidth() + 3} 0` : '0')
        .style('stroke-width', d => d.state === 'OVERALL' ? '3px' : '0')
        .on('mouseover mousemove', (d) => {
          return mouseover('supreme', d)
        })
        .on('mouseout', () => {
          return mouseout('supreme')
        })

      svg4.selectAll("bars")
        .data(csv)
        .enter()
        .append("rect")
        .attr("x", d => margin.left + xScale(d.contested / d[toggle]) + xScale(d.notContested / d[toggle]))
        .attr("y", function(d) {
          return yScale4(d.state)
        })
        .attr("width", function(d) {
          return xScale(d.notUp / d[toggle]);
        })
        .attr("height", yScale4.bandwidth())
        .attr('class', (d) => {
          return `bar not-up ${d.state.toLowerCase().replaceAll(' ', '-').replaceAll('&', '-')}`
        })
        .style("fill", '#d3d3d3')
        .style('display', d => d.toggle === 'up' ? 'none' : 'block')
        .style('stroke', 'black')
        .style('stroke-dasharray', d => d.state === 'OVERALL' ? `${xScale(d.notUp / d[toggle]) + yScale4.bandwidth() + xScale(d.notUp / d[toggle]) } ${yScale4.bandwidth()}` : '0')
        .style('stroke-width', d => d.state === 'OVERALL' ? '3px' : '0')
        .on('mouseover mousemove', (d) => {
          return mouseover('supreme', d)
        })
        .on('mouseout', () => {
          return mouseout('supreme')
        })

      svg4.selectAll("bars")
        .data(csv)
        .enter()
        .append("text")
        .attr("x", function(d) {
          return 5 + margin.left
        })
        .attr("y", function(d) {
          return yScale4(d.state) + yScale4.bandwidth() - yScale4.bandwidth() * .3
        })
        .text(d => regWidth < 640 ? `${d.abbr}${d.asterisk}` : `${d.state}${d.asterisk}`)
        .attr('class', (d) => {
          return `bar-label ${d.state.toLowerCase().replaceAll(' ', '-').replaceAll('&', '-')}`
        })
        .attr('text-anchor', 'start')
        .attr('font-size', d => regWidth < 640 ? '9pt' : '10pt')
        .attr('fill', 'white')
        .style('pointer-events', 'none')
        .style('font-weight', d => d.state === 'OVERALL' ? 'bold' : 'normal')
        .on('mouseover mousemove', (d) => {
          return mouseover('supreme', d)
        })
        .on('mouseout', () => {
          return mouseout('supreme')
        })

      svg4.selectAll('bars')
        .data(csv)

      // .on('mouseout')

      // Render X axis
      svg4.append("g")
        .attr("transform", `translate(${margin.left},${height - margin.bottom})`)
        .attr('class', 'x-axis')
        .call(xAxis)
        .style('color', 'black')
        .selectAll("text")
        .attr("transform", "translate(0,0)")
        .attr("text-anchor", "middle")
        .style('font-size', '8pt')


      svg4.append("text")
        .attr("class", "x-label")
        .attr("text-anchor", "end")
        .attr("x", regWidth / 2 + margin.right + margin.left)
        .attr("y", height - 5)
        .style('font-size', '9pt')

      //Render Y axis
      svg4.append("g")
        .attr("transform", `translate(${margin.left},0)`)
        .attr('class', 'y-axis')
        .style('color', 'black')
        .call(yAxis4)
        .selectAll(".tick text")
        .style('text-anchor', 'end')
        .attr('class', (d) => {
          return 'status ' + d.toLowerCase().replaceAll(' ', '-').replaceAll('&', '-')
        })
        .style('font-size', '8pt')
        .call(wrapText, (margin.left))
        .data(csv)
        .style('font-weight', (d) => {
          return d.state === 'OVERALL' ? 'bold' : 'regular'
        })
        //
        // svg4.selectAll('.y-axis .tick text tspan')
        //   .data(csv)
        //   .enter()
        .text((d) => {
          return `${d.up} of ${d.seats}`
        })
        .on('mouseover mousemove', (d) => {
          return mouseover('supreme', d)
        })
        .on('mouseout', () => {
          return mouseout('supreme')
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
    .then(() => {
      // Render X grid
      svg4.append("g")
        .attr("transform", `translate(${margin.left},${height - margin.bottom})`)
        .attr("class", "grid")
        .style('color', 'black')
        .style('opacity', '0.3')
        .call(xGrid)
    })
}

renderSupreme()

// // Render X grid
// svg4.append("g")
//   .attr("transform", `translate(${margin.left},${height - margin.bottom})`)
//   .attr("class", "grid")
//   .style('color', 'black')
//   .style('opacity', '0.3')
//   .call(xGrid)

// d3.json("https://assets.law360news.com/1531000/1531923/states-10m.json")
//   .then(function(json) {
//     var dataset = topojson.feature(json, json.objects.states).features
//     dataset = dataset.filter(d => yScale4.domain().includes(d.properties.name))
//
//     svg4.append("path")
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