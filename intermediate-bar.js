var svg3 = d3.select("#intermediate-map .chart-bar")
  .append("svg")
  .attr("width", barWidth)
  .attr("height", height);

var tooltip3 = d3.select("#intermediate-map .chart-bar")
  .append('div')
  .style('visibility', 'hidden')
  .attr('class', 'my-tooltip')
  .attr('id', 'intermediate-tooltip')

var yScale3

d3.selectAll('#intermediate-map .toggle')
  .on('click', () => {
    d3.selectAll('#intermediate-map .toggle')
      .classed('active', false)

    d3.select(event.target)
      .classed('active', true)

    svg3.selectAll('#intermediate-map .bar.contested')
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
      .style('stroke-dasharray', (d) => {
        let toggleSwitch = document.querySelector('#intermediate-map .toggle.active').className.includes('all') ? 'seats' : 'up'
        if (toggleSwitch === 'seats') {
          return d.state === 'TOTAL' ? `${xScale(d.contested / d[toggleSwitch])} ${yScale3.bandwidth()}` : '0'
        } else {
          return d.state === 'TOTAL' ? `${xScale(d.contested / d[toggleSwitch]) + yScale3.bandwidth() + xScale(d.contested / d[toggleSwitch])} ${yScale3.bandwidth()}` : '0'
        }
      })

    svg3.selectAll('#intermediate-map .bar.not-contested')
      .transition()
      .duration(400)
      .attr('width', function(d) {
        let toggleSwitch = document.querySelector('#intermediate-map .toggle.active').className.includes('all') ? 'seats' : 'up'
        return xScale(d.notContested / d[toggleSwitch]);
      })
      .attr("x", margin.left)
      .style('stroke-dasharray', (d) => {
        let toggleSwitch = document.querySelector('#intermediate-map .toggle.active').className.includes('all') ? 'seats' : 'up'

        return d.state === 'TOTAL' ? `${xScale(d.notContested / d[toggleSwitch])} ${yScale3.bandwidth()} ${xScale(d.notContested / d[toggleSwitch]) + yScale3.bandwidth() + 3} 0` : '0'
      })

    svg3.selectAll('#intermediate-map .bar.not-up')
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

    d3.select('#intermediate-map .chart-header .value')
      .html(() => {
        let toggleSwitch = document.querySelector('#intermediate-map .toggle.active').className.includes('all') ? 'seats' : 'up'

        return toggleSwitch === 'seats' ? `<strong>146 races</strong> this year out of <strong>431 total seats</strong>` : `<strong>93 uncontested races</strong> out of <strong>146 total races</strong>`
      })

    d3.select('#intermediate-map .year.not-up')
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
      yScale3 = d3.scaleBand()
        .range([margin.top, height - margin.bottom])
        .domain(csv.map(function(d) {
          return d.state;
        }))
        .padding(.1)

      // Define Y axis
      var yAxis3 = d3.axisLeft(yScale3)
        .tickFormat('')
      var toggle = document.querySelector('#intermediate-map .toggle.active').className.includes('all') ? 'seats' : 'up'

      svg3.selectAll("bars")
        .data(csv)
        .enter()
        .append("rect")
        .attr("x", d => margin.left + xScale(d.notContested / d[toggle]))
        .attr("y", function(d) {
          return yScale3(d.state)
        })
        .attr("width", function(d) {
          return xScale(d.contested / d[toggle]);
        })
        .attr("height", yScale3.bandwidth())
        .attr('class', (d) => {
          return `bar contested ${d.state.toLowerCase().replaceAll(' ', '-').replaceAll('&', '-')}`
        })
        .style("fill", '#6ba292')
        .style('stroke', 'black')
        .style('stroke-dasharray', d => d.state === 'TOTAL' ? `${xScale(d.contested / d[toggle])} ${yScale3.bandwidth()}` : '0')
        .style('stroke-width', d => d.state === 'TOTAL' ? '3px' : '0')
        .on('mouseover mousemove', (d) => {
          return mouseover('intermediate', d)
        })
        .on('mouseout', () => {
          return mouseout('intermediate')
        })

      svg3.selectAll("bars")
        .data(csv)
        .enter()
        .append("rect")
        .attr("x", d => margin.left)
        .attr("y", function(d) {
          return yScale3(d.state)
        })
        .attr("width", function(d) {
          return xScale(d.notContested / d[toggle]);
        })
        .attr("height", yScale3.bandwidth())
        .attr('class', (d) => {
          return `bar not-contested ${d.state.toLowerCase().replaceAll(' ', '-').replaceAll('&', '-')}`
        })
        .style("fill", '#ed6a5a')
        .style('stroke', 'black')
        .style('stroke-dasharray', d => d.state === 'TOTAL' ? `${xScale(d.notContested / d[toggle])} ${yScale3.bandwidth()} ${xScale(d.notContested / d[toggle]) + yScale3.bandwidth() + 3} 0` : '0')
        .style('stroke-width', d => d.state === 'TOTAL' ? '3px' : '0')
        .on('mouseover mousemove', (d) => {
          return mouseover('intermediate', d)
        })
        .on('mouseout', () => {
          return mouseout('intermediate')
        })

      svg3.selectAll("bars")
        .data(csv)
        .enter()
        .append("rect")
        .attr("x", d => margin.left + xScale(d.contested / d[toggle]) + xScale(d.notContested / d[toggle]))
        .attr("y", function(d) {
          return yScale3(d.state)
        })
        .attr("width", function(d) {
          return xScale(d.notUp / d[toggle]);
        })
        .attr("height", yScale3.bandwidth())
        .attr('class', (d) => {
          return `bar not-up ${d.state.toLowerCase().replaceAll(' ', '-').replaceAll('&', '-')}`
        })
        .style("fill", '#d3d3d3')
        .style('display', d => d.toggle === 'up' ? 'none' : 'block')
        .style('stroke', 'black')
        .style('stroke-dasharray', d => d.state === 'TOTAL' ? `${xScale(d.notUp / d[toggle]) + yScale3.bandwidth() + xScale(d.notUp / d[toggle]) } ${yScale3.bandwidth()}` : '0')
        .style('stroke-width', d => d.state === 'TOTAL' ? '3px' : '0')
        .on('mouseover mousemove', (d) => {
          return mouseover('intermediate', d)
        })
        .on('mouseout', () => {
          return mouseout('intermediate')
        })

      svg3.selectAll("bars")
        .data(csv)
        .enter()
        .append("text")
        .attr("x", function(d) {
          return 5 + margin.left
        })
        .attr("y", function(d) {
          return yScale3(d.state) + yScale3.bandwidth() - yScale3.bandwidth() * .3
        })
        .text(d => `${d.state}`)
        .attr('class', (d) => {
          return `bar-label ${d.state.toLowerCase().replaceAll(' ', '-').replaceAll('&', '-')}`
        })
        .attr('text-anchor', 'start')
        .attr('font-size', '10pt')
        .attr('fill', 'black')
        .style('pointer-events', 'none')
        .style('font-weight', d => d.state === 'TOTAL' ? 'bold' : 'normal')
        .on('mouseover mousemove', (d) => {
          return mouseover('intermediate', d)
        })
        .on('mouseout', () => {
          return mouseout('intermediate')
        })

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
        .call(yAxis3)
        .selectAll(".tick text")
        .style('text-anchor', 'end')
        .attr('class', (d) => {
          return 'status ' + d.toLowerCase().replaceAll(' ', '-').replaceAll('&', '-')
        })
        .style('font-size', '8pt')
        .call(wrapText, (margin.left))
        .data(csv)
        .style('font-weight', (d) => {
          return d.state === 'TOTAL' ? 'bold' : 'regular'
        })
        //
        // svg3.selectAll('.y-axis .tick text tspan')
        //   .data(csv)
        //   .enter()
        .text((d) => {
          return `${d.up} of ${d.seats}`
        })
        .on('mouseover mousemove', (d) => {
          return mouseover('intermediate', d)
        })
        .on('mouseout', () => {
          return mouseout('intermediate')
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

    }).then(() => {
      // Render X grid
      svg3.append("g")
        .attr("transform", `translate(${margin.left},${height - margin.bottom})`)
        .attr("class", "grid")
        .style('color', 'black')
        .style('opacity', '0.3')
        .call(xGrid)
    })
}

renderIntermediate()


// d3.json("https://assets.law360news.com/1531000/1531923/states-10m.json")
//   .then(function(json) {
//     var dataset = topojson.feature(json, json.objects.states).features
//     dataset = dataset.filter(d => yScale3.domain().includes(d.properties.name))
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