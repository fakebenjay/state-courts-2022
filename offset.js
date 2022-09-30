// set the dimensions and margins of the graph
var margin = {
  top: 10,
  right: 15,
  bottom: 30,
  left: 65
}

var winWidth = window.innerWidth
var regWidth = document.getElementById('intermediate-map').offsetWidth
var height = 450;

var tickNums = 5

//Create svg4 element
var barWidth = document.getElementById('intermediate-map').offsetWidth
var rawWidth = document.getElementById('article-body').offsetWidth
var w = rawWidth;
var h = rawWidth * (2 / 3);

// Add X scale
var xScale = d3.scaleLinear()
  .domain([0, 1])
  .range([0, barWidth - margin.right - margin.left])

// Define X axis and format tick marks
var xAxis = d3.axisBottom(xScale)
  .ticks(tickNums)
  .tickFormat(d => d * 100 + '%')

var xGrid = d3.axisBottom(xScale)
  .tickSize(-height + (margin.top + margin.bottom), 0, 0)
  .tickFormat("")
  .ticks(tickNums)

function wrapText(text, width) {
  text.each(function() {
    var text = d3.select(this),
      textContent = text.text(),
      tempWord = addBreakSpace(textContent).split(/\s+/),
      x = text.attr('x'),
      y = text.attr('y'),
      dy = parseFloat(text.attr('dy') || 0),
      tspan = text.text(null).append('tspan').attr('x', x).attr('y', y).attr('dy', dy + 'em');
    for (var i = 0; i < tempWord.length; i++) {
      tempWord[i] = calHyphen(tempWord[i]);
    }
    textContent = tempWord.join(" ");
    var words = textContent.split(/\s+/).reverse(),
      word,
      line = [],
      lineNumber = 0,
      lineHeight = .3, // ems
      spanContent,
      breakChars = ['/', '&', '-', 'V'];
    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(' '));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        spanContent = line.join(' ');
        breakChars.forEach(function(char) {
          // Remove spaces trailing breakChars that were added above
          spanContent = spanContent.replace(char + ' ', char);
        });
        tspan.text(spanContent);
        line = [word];
        if (lineNumber === 0) {
          tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
        } else {
          tspan = text.append('tspan').attr('x', x).attr('y', y).attr('dy', lineHeight + dy + 'em').text(word);
        }

      }
    }
    var emToPxRatio = parseInt(window.getComputedStyle(text._groups[0][0]).fontSize.slice(0, -2));
    text.attr("transform", "translate(-" + 0 + ", -" + lineNumber / 2 * emToPxRatio + ")");

    function calHyphen(word) {
      tspan.text(word);
      if (tspan.node().getComputedTextLength() > width) {
        var chars = word.split('');
        var asword = "";
        for (var i = 0; i < chars.length; i++) {
          asword += chars[i];
          tspan.text(asword);
          if (tspan.node().getComputedTextLength() > width) {
            if (chars[i - 1] !== "-") {
              word = word.slice(0, i - 1) + "- " + calHyphen(word.slice(i - 1));
            }
            i = chars.length;
          }
        }
      }
      return word;
    }
  });

  function addBreakSpace(inputString) {
    var breakChars = ['/', '&', '-']
    breakChars.forEach(function(char) {
      // Add a space after each break char for the function to use to determine line breaks
      inputString = inputString.replace(char, char + ' ');
    });
    return inputString;
  }
}