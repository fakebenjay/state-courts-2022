var rawWidth = document.getElementById('article-body').offsetWidth
var w = rawWidth;
var h = rawWidth * (2 / 3);
//Define map projection
var projection = d3.geoAlbersUsa()
  .translate([w / 2, h / 2.25])
  .scale([rawWidth * 1.25]);
//Define path generator
var path = d3.geoPath()
  .projection(projection);
//Create SVG element
var svg = d3.select("#intermediate-map .chart")
  .append("svg")
  .attr("width", w)
  .attr("height", h);
var tooltip = d3.select("#intermediate-map")
  .append('div')
  .style('visibility', 'hidden')
  .attr('class', 'my-tooltip')

var radCoeff = d3.scaleLinear()
  .domain([200, 640])
  .range([2, 12])
  .clamp(true)

var color = d3.scaleOrdinal()
  .domain(['notUp', 'contested', 'notContested'])
  .range(['#d3d3d3', '#707c9c', '#d5563a'])

function radius(datum) {
  return radCoeff(rawWidth) * (Math.sqrt(datum) / document.querySelector('#article-body').offsetWidth)
}

var anglePI = (45) * (Math.PI / 180);
var angleCoeff = 55
var angleCoords = {
  'x1': Math.round(angleCoeff + Math.sin(anglePI) * angleCoeff) + '%',
  'y1': Math.round(angleCoeff + Math.cos(anglePI) * angleCoeff) + '%',
  'x2': Math.round(angleCoeff + Math.sin(anglePI + Math.PI) * angleCoeff) + '%',
  'y2': Math.round(angleCoeff + Math.cos(anglePI + Math.PI) * angleCoeff) + '%',
}

function tooltipText(values) {
  return `
  <style>
    .yr-2019 .val-${values.yr2019 > 300000 ? 'out':'in'} {
      display:none;
    }

    .yr-2020 .val-${values.yr2020 > 300000 ? 'out':'in'} {
      display:none;
    }

    .yr-2021 .val-${values.yr2021 > 300000 ? 'out':'in'} {
      display:none;
    }

    .yr-2022 .val-${values.yr2022 > 300000 ? 'out':'in'} {
      display:none;
    }
  </style>
  <h2>${values.port}</h2>
    <p style="font-size:14pt;padding-top:5px";>${values.city.replaceAll(';', ',')}</p>
    <br/>
    <table>
      <tr class="table-year yr-2019">
        <td class='yr'>July 2019</td>
        <td class='bar'><span class="barfill" style="background-color:#faa916;width:${(values.yr2019/935424)*100}%;text-align:right;"><span class="val val-in">${numeral(values.yr2019).format('0,0')}</span></span><span class="val val-out">${numeral(values.yr2019).format('0,0')}</span></td>
      </tr>
      <tr class="table-year yr-2020">
        <td class='yr'>July 2020</td>
        <td class='bar'><span class="barfill" style="background-color:#707c9c;width:${(values.yr2020/935424)*100}%;text-align:right;"><span class="val val-in">${numeral(values.yr2020).format('0,0')}</span></span><span class="val val-out">${numeral(values.yr2020).format('0,0')}</span></td>
      </tr>
      <tr class="table-year yr-2021">
        <td class='yr'>July 2021</td>
        <td class='bar'><span class="barfill" style="background-color:#654f6f;width:${(values.yr2021/935424)*100}%;text-align:right;"><span class="val val-in" style="color:white;">${numeral(values.yr2021).format('0,0')}</span></span><span class="val val-out">${numeral(values.yr2021).format('0,0')}</span></td>
      </tr>
      <tr class="table-year yr-2022">
        <td class='yr'>July 2022</td>
        <td class='bar'><span class="barfill" style="background-color:#d5563a;width:${(values.yr2022/935424)*100}%;text-align:right;"><span class="val val-in">${numeral(values.yr2022).format('0,0')}</span></span><span class="val val-out">${numeral(values.yr2022).format('0,0')}</span></td>
      </tr>
    </table>`
}

function mouseover(d) {
  var values = d
  var html = tooltipText(values)

  d3.select('.my-tooltip')
    .html(html)
    .attr('display', 'block')
    .style("visibility", "visible")
    .style('top', topTT)
    .style('left', leftTT)

  d3.selectAll('text')
    .raise()
}

function mousemove() {
  tooltip.style("visibility", "visible")
    .style("left", leftTT)
    .style("top", topTT);
}

function mouseout(d) {
  d3.select('.my-tooltip')
    .html("")
    .attr('display', 'none')
    .style("visibility", "hidden")
    .style("left", null)
    .style("top", null);
}

function topTT() {
  var offsetParent = document.querySelector('.chart').offsetParent
  var offY = offsetParent.offsetTop
  var cursorY = 5

  var windowWidth = window.innerWidth
  var ch = document.querySelector('.my-tooltip').clientHeight
  var cy = d3.event.pageY - offY
  var windowHeight = window.innerHeight
  if (windowWidth > 767) {
    if (ch + cy >= windowHeight) {
      return cy - (ch / 2) + "px"
    } else {
      return cy - 28 + "px"
    }
  }
}

function leftTT() {
  var offsetParent = document.querySelector('.chart').offsetParent
  var offX = offsetParent.offsetLeft
  var cursorX = 5

  var windowWidth = window.innerWidth
  var cw = document.querySelector('.my-tooltip').clientWidth
  var cx = d3.event.pageX - offX
  var bodyWidth = document.querySelector('.chart').clientWidth
  var bodyLeft = document.querySelector('.chart').offsetLeft


  if (windowWidth > 767) {
    if (cw + cx >= bodyWidth + bodyLeft) {
      document.querySelector('.my-tooltip').classList.remove('box-shadow-right')
      document.querySelector('.my-tooltip').classList.add('box-shadow-left')
      return cx - cw - cursorX + "px"
    } else {
      document.querySelector('.my-tooltip').classList.remove('box-shadow-left')
      document.querySelector('.my-tooltip').classList.add('box-shadow-right')
      return cx + cursorX + "px"
    }
  }
}

//Load in referendum data
d3.csv("https://assets.law360news.com/1531000/1531923/data.csv")
  .then(function(data) {

    //Load in GeoJSON data
    d3.json("https://assets.law360news.com/1531000/1531923/states-10m.json")
      .then(function(json) {
        //Merge the referendum data and GeoJSON
        //Loop through once for each data value
        // for (var i = 0; i < data.length; i++) {
        //   //Grab state name
        //   var dataState = data[i].state;
        //   //Grab legal/referendum status
        //   var dataObj = data[i]
        //   //Find the corresponding state inside the GeoJSON
        //   for (var j = 0; j < json.objects.states.geometries.length; j++) {
        //     var jsonState = json.objects.states.geometries[j].properties.name;
        //     if (dataState === jsonState) {
        //       //Copy the data value into the JSON
        //       json.objects.states.geometries[j].properties.value = dataObj;
        //       //Stop looking through the JSON
        //       break;
        //     }
        //   }
        // }

        svg.append("path")
          .datum(topojson.mesh(json, json.objects.states))
          .attr("d", path)
          .attr("class", d => `states-mesh`)
          .attr('stroke-width', '1')
          .attr('stroke', 'black')
          .attr('opacity', 0.5)
          .attr('stroke-opacity', 0.5)
          .attr('fill', 'none')

        // //Textures.js causes the first element of json.objects.states to disappear
        // //This is my hacky workaround to ensure that Alabama renders
        // json.objects.states.geometries.unshift("fake alabama")
        // json.objects.states.geometries.unshift("fake alaska")
        // json.objects.states.geometries.unshift("fake arizona")
        // json.objects.states.geometries.unshift("fake arkansas")
        //
        // svg.selectAll('.port')
        //   .data(data)
        //   .enter()
        //   .append('circle')
        //   .attr('data-yr2019', d => d.yr2019)
        //   .attr('data-yr2020', d => d.yr2020)
        //   .attr('data-yr2021', d => d.yr2021)
        //   .attr('data-yr2022', d => d.yr2022)
        //   .attr('class', d => `port ${d.port.split(" (")[0].replaceAll(' ', '-').replaceAll(".", '').replaceAll(",", '').toLowerCase()}`)
        //   .attr('cx', (d) => {
        //     var activeClass = document.querySelector('.year-legend.active').classList[1].replaceAll('-', '')
        //     var count = d[activeClass]
        //
        //     var dir = !d.offsetEW ? 1 : d.offsetEW === 'E' ? 1 : -1
        //     var dist = !d.offsetLng ? 0 : (Math.abs(projection([d.lng, d.lat])[0] - projection([d.offsetLng, d.offsetLat])[0])) / 2
        //     var diff = !d.offsetTotal ? 0 : Math.abs(radius(parseInt(count)))
        //     var change = (diff - dist) * dir
        //     var califAngle = !d.offsetLng ? 0 : (90 - (Math.atan2(Math.abs(d.lat - d.offsetLat), Math.abs(d.lng - d.offsetLng)) * 180 / Math.PI)) / 90
        //     var southAngle = !d.offsetLng ? 0 : ((Math.atan2(Math.abs(d.lat - d.offsetLat), Math.abs(d.lng - d.offsetLng)) * 180 / Math.PI)) / 90
        //     var angle = d.city.includes('Calif.') ? califAngle : southAngle
        //
        //     return projection([d.lng, d.lat])[0] + (change * angle)
        //   })
        //   .attr('cy', (d) => {
        //     var activeClass = document.querySelector('.year-legend.active').classList[1].replaceAll('-', '')
        //     var count = d[activeClass]
        //
        //     var dir = !d.offsetNS ? 1 : d.offsetNS === 'N' ? -1 : 1
        //     var dist = !d.offsetLat ? 0 : (Math.abs(projection([d.lng, d.lat])[1] - projection([d.offsetLng, d.offsetLat])[1])) / 2
        //     var diff = !d.offsetTotal ? 0 : Math.abs(radius(parseInt(count)))
        //     var change = (diff - dist) * dir
        //     var califAngle = !d.offsetLat ? 0 : ((Math.atan2(Math.abs(d.lat - d.offsetLat), Math.abs(d.lng - d.offsetLng)) * 180 / Math.PI)) / 90
        //     var southAngle = !d.offsetLat ? 0 : (90 - (Math.atan2(Math.abs(d.lat - d.offsetLat), Math.abs(d.lng - d.offsetLng)) * 180 / Math.PI)) / 90
        //     var angle = d.city.includes('Calif.') ? califAngle : southAngle
        //
        //     return projection([d.lng, d.lat])[1] + (change * angle)
        //   })
        //   .attr('r', (d) => {
        //     var activeClass = document.querySelector('.year-legend.active').classList[1].replaceAll('-', '')
        //     return radius(d[activeClass])
        //   })
        //   .style('stroke', 'black')
        //   .style('stroke-width', 1)
        //   .style('fill', () => {
        //     var activeClass = document.querySelector('.year-legend.active').classList[1].replaceAll('-', '')
        //     return activeClass === 'yr2019' ? '#faa916' : activeClass === 'yr2020' ? '#707c9c' : activeClass === 'yr2021' ? '#654f6f' : '#d5563a'
        //   })
        //   .style('opacity', 1)
        //   .on('mouseover mousemove', (d) => {
        //     d3.select(event.target)
        //       .style('stroke-width', 3)
        //
        //     mouseover(d)
        //   })
        //   .on('mouseout', (d) => {
        //     d3.select(event.target)
        //       .style('stroke-width', 1)
        //     mouseout(d)
        //   })

      });
  })
  .then(() => {
    let pieShop = svg.append('g')
      .attr('class', 'pie-shop')

    let rad = rawWidth / 16
    let arc = d3.arc()
      .outerRadius(rad / 2.5)
      .innerRadius(0);

    let pie = d3.pie()
      .value(function(d) {
        return d.pct;
      })
      .sort((b, a) => {
        return b.name > a.name
      });

    d3.csv("intermediate-appellate.csv")
      .then(function(data) {

        data.forEach((d) => {
          let slices = [{
            'state': d.state,
            'name': 'notUp',
            'val': d.notUp,
            'pct': d.notUp / d.seats,
            'lat': d.lat,
            'lng': d.lng
          }, {
            'state': d.state,
            'name': 'contested',
            'val': d.contested,
            'pct': d.contested / d.seats,
            'lat': d.lat,
            'lng': d.lng
          }, {
            'state': d.state,
            'name': 'notContested',
            'val': d.notContested,
            'pct': d.notContested / d.seats,
            'lat': d.lat,
            'lng': d.lng
          }, ]

          let emptyPies = pieShop.selectAll("pie")
            .data(pie(slices))
            .enter()
            .append("g")
            .attr("class", (d) => {
              return `arc ${d.data.name.replaceAll('notUp', 'not-up').replaceAll('notContested', 'not-contested')} ${d.data.state.toLowerCase().replaceAll(' ','-')}`
            })
            .attr('transform', (d) => {
              return `translate(${projection([d.data.lng, d.data.lat])[0]},${projection([d.data.lng, d.data.lat])[1]})`
            })

          emptyPies.append("path")
            .attr("d", arc)
            .style("fill", d => color(d.data.name))
        })
      })

    // d3.selectAll('.legend span')
    //   .on('click', () => {
    //     var target = event.target.closest('.year-legend')
    //
    //     d3.selectAll('.year-legend')
    //       .classed('active', false)
    //
    //     d3.select(target)
    //       .classed('active', true)
    //
    //     svg.selectAll('circle.port')
    //       .transition()
    //       .duration(500)
    //       .attr('cx', (d) => {
    //         var activeClass = document.querySelector('.year-legend.active').classList[1].replaceAll('-', '')
    //         var count = d[activeClass]
    //
    //         var dir = !d.offsetEW ? 1 : d.offsetEW === 'E' ? 1 : -1
    //         var dist = !d.offsetLng ? 0 : (Math.abs(projection([d.lng, d.lat])[0] - projection([d.offsetLng, d.offsetLat])[0])) / 2
    //         var diff = !d.offsetTotal ? 0 : Math.abs(radius(parseInt(count)))
    //         var change = (diff - dist) * dir
    //         var califAngle = !d.offsetLng ? 0 : (90 - (Math.atan2(Math.abs(d.lat - d.offsetLat), Math.abs(d.lng - d.offsetLng)) * 180 / Math.PI)) / 90
    //         var southAngle = !d.offsetLng ? 0 : ((Math.atan2(Math.abs(d.lat - d.offsetLat), Math.abs(d.lng - d.offsetLng)) * 180 / Math.PI)) / 90
    //         var angle = d.city.includes('Calif.') ? califAngle : southAngle
    //
    //         return projection([d.lng, d.lat])[0] + (change * angle)
    //       })
    //       .attr('cy', (d) => {
    //         var activeClass = document.querySelector('.year-legend.active').classList[1].replaceAll('-', '')
    //         var count = d[activeClass]
    //
    //         var dir = !d.offsetNS ? 1 : d.offsetNS === 'N' ? -1 : 1
    //         var dist = !d.offsetLat ? 0 : (Math.abs(projection([d.lng, d.lat])[1] - projection([d.offsetLng, d.offsetLat])[1])) / 2
    //         var diff = !d.offsetTotal ? 0 : Math.abs(radius(parseInt(count)))
    //         var change = (diff - dist) * dir
    //         var califAngle = !d.offsetLat ? 0 : ((Math.atan2(Math.abs(d.lat - d.offsetLat), Math.abs(d.lng - d.offsetLng)) * 180 / Math.PI)) / 90
    //         var southAngle = !d.offsetLat ? 0 : (90 - (Math.atan2(Math.abs(d.lat - d.offsetLat), Math.abs(d.lng - d.offsetLng)) * 180 / Math.PI)) / 90
    //         var angle = d.city.includes('Calif.') ? califAngle : southAngle
    //
    //         return projection([d.lng, d.lat])[1] + (change * angle)
    //       })
    //       .attr('r', (d) => {
    //         var activeClass = document.querySelector('.year-legend.active').classList[1].replaceAll('-', '')
    //         return radius(d[activeClass])
    //       })
    //       .style('fill', () => {
    //         var activeClass = document.querySelector('.year-legend.active').classList[1].replaceAll('-', '')
    //         return activeClass === 'yr2019' ? '#faa916' : activeClass === 'yr2020' ? '#707c9c' : activeClass === 'yr2021' ? '#654f6f' : '#d5563a'
    //       })
    //   })
  })
  .then(() => {
    d3.select('.pie-shop')
      .raise()
  })