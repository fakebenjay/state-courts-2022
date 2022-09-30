function tooltipText(values, index) {
  return `<span class='quit'>x</span><div class="tooltip-container"><h2>${values.state}</h2>
  <div>There are <strong>${values.up} ${index === 'intermediate' ? 'intermediate appellate':'state supreme court'}</strong> races this year.</div>
  <div>Of those, <strong>${values.contested} are contested</strong> and <strong>${values.notContested} are not</strong>.</div>
  <br/>
  <div>There are <strong>${values.seats} total ${index === 'intermediate' ? 'intermediate appellate':'state supreme court'} seats in the state.</strong></div>
  </div>`
}

function mouseover(index, d) {
  var values = d
  var html = tooltipText(d, index)

  d3.select(`#${index}-map .my-tooltip`)
    .html(html)
    .attr('display', 'block')
    .style("visibility", "visible")
    .style('top', () => {
      return topTT(index)
    })
    .style('left', () => {
      return leftTT(index)
    })

  d3.selectAll(`#${index}-map .my-tooltip .quit`)
    .on('click', () => {
      d3.select(`#${index}-tooltip`)
        .html("")
        .attr('display', 'none')
        .style("visibility", "hidden")
        .style("left", null)
        .style("top", null);
    })
}

function mouseout(index) {
  if (window.innerWidth > 767) {
    d3.select(`#${index}-map .my-tooltip`)
      .html("")
      .attr('display', 'none')
      .style("visibility", "hidden")
      .style("left", null)
      .style("top", null);
  }
}

function topTT(index) {
  var offsetParent = document.querySelector(`#${index}-map .chart-bar`).offsetParent
  var offY = offsetParent.offsetTop
  var cursorY = 5

  var windowWidth = window.innerWidth
  var ch = document.querySelector(`#${index}-map .my-tooltip`).clientHeight
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

function leftTT(index) {
  var offsetParent = document.querySelector(`#${index}-map .chart-bar`).offsetParent
  var offX = offsetParent.offsetLeft
  var cursorX = 5

  var windowWidth = window.innerWidth
  var cw = document.querySelector(`#${index}-map .my-tooltip`).clientWidth
  var cx = d3.event.pageX - offX
  var bodyWidth = document.querySelector(`#${index}-map .chart-bar`).clientWidth
  var bodyLeft = document.querySelector(`#${index}-map .chart-bar`).offsetLeft


  if (windowWidth > 767) {
    if (cw + cx >= bodyWidth + bodyLeft) {
      document.querySelector(`#${index}-map .my-tooltip`).classList.remove('box-shadow-right')
      document.querySelector(`#${index}-map .my-tooltip`).classList.add('box-shadow-left')
      return cx - cw - cursorX + "px"
    } else {
      document.querySelector(`#${index}-map .my-tooltip`).classList.remove('box-shadow-left')
      document.querySelector(`#${index}-map .my-tooltip`).classList.add('box-shadow-right')
      return cx + cursorX + "px"
    }
  }
}