// gotta have it
var rocky = require('rocky');

var settings = null;

// val, x, y, stroke, width, height, diagonal, spacing
// drawNumber(ctx, 2, 1,   1,  4,  25, 30, 6,  -5);     // gothic
// drawNumber(ctx, 2, 31,  1,  14, 14, 14, 6,  -1);     // diamond
// drawNumber(ctx, 2, 61,  1,  5,  9,  14, 2,  1);      // digital classic
// drawNumber(ctx, 2, 91,  1,  8,  8,  8,  2,  3);      // bubble
// drawNumber(ctx, 2, 121, 1,  6,  6,  12, 0,  0);      // pixel
// drawNumber(ctx, 2, 1,   50, 4,  15, 15, 1,  0);      // standard (simple digital)
// drawNumber(ctx, 2, 31,  50, 8,  21, 23, 0,  -8);     // clean
// drawNumber(ctx, 2, 61,  50, 6,  20, 20, 2,  -3);     // digital clean
// drawNumber(ctx, 2, 91,  50, 6,  16, 16, 0,  -3);     // pixel smooth
// drawNumber(ctx, 2, 121, 50, 5,  21, 21, 5,  0);      // stellated

var dia = 1;
var len = 100;
var hig = 100;
var str = 6;
var spa = -5;
var gap = 4;
var box = 4;
var boy = 40;

var num1 = 'white';
var num2 = 'white';
var num3 = 'white';
var num4 = 'white';
var num5 = 'white';
var num6 = 'white';
var col1 = 'white';
var col2 = 'white';
var bac = 'black';

var drawseconds = true;
var squish_x = true;
var squish_y = true;
var y_just = 'center';
var x_just = 'center';

rocky.on('draw', function(event) {
  // import settings
  if(settings) {
    dia = settings.diagonal;
    len = settings.width;
    hig = settings.height;
    str = settings.stroke;
    spa = settings.spacing;
    gap = settings.gap;
    box = settings.xborder;
    boy = settings.yborder;

    num1 = cssColor(settings.Hour1);
    num2 = cssColor(settings.Hour2);
    num3 = cssColor(settings.Minute1);
    num4 = cssColor(settings.Minute2);
    num5 = cssColor(settings.Second1);
    num6 = cssColor(settings.Second2);
    col1 = cssColor(settings.Colon1);
    col2 = cssColor(settings.Colon2);
    bac = cssColor(settings.BackgroundColor);

    squish_x = settings.xSquish;
    squish_y = settings.ySquish;
    y_just = settings.yJustify;
    x_just = settings.xJustify;
    drawseconds = settings.seconds;
  }

  // get time information
  var time = new Date().toLocaleTimeString().split(":");
  var hours = time[0].split("");
  var minutes = time[1].split("");
  var seconds = time[2].split("");

  // get our two main dimensions from our context object
  var ctx = event.context;
  var d_x = ctx.canvas.unobstructedWidth;
  var d_y = ctx.canvas.unobstructedHeight;

  // clear and color background
  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);
  ctx.fillStyle = bac;
  ctx.fillRect(0, 0, d_x, d_y);

  // calculate all important dimensions
  var firstnumber = numberWidth(hours[0], str, len, dia, spa);
  var numberwidth = numberWidth(8, str, len, dia, spa);
  var numberheight = numberHeight(str, hig, dia, spa);
  var colonwidth = colonWidth(str);
  var exactwidth = firstnumber + 2 * numberwidth + colonwidth + 3 * gap;  // h:mm

  // conditional repositionings
  if (hours.length == 2) {
    exactwidth += numberwidth + gap;  // hh:mm
  }

  if (drawseconds) {
    exactwidth += 2 * numberwidth + colonwidth + 3 * gap; // hh:mm:ss
  }

  // squish the time into frame if it gets too wide
  if (squish_x && (exactwidth > d_x - 2 * box)) {
    var remainder = exactwidth - d_x  + 2 * box;
    var cutback = 2 + hours.length;

    if (hours[0] == '1') {
      cutback -= 1;
    }

    if (drawseconds) {
      cutback += 2;
    }

    // bring things back into bounds
    len -= Math.ceil(remainder / cutback);

    // recalculating...
    firstnumber = numberWidth(hours[0], str, len, dia, spa);
    numberwidth = numberWidth(8, str, len, dia, spa);
    exactwidth = firstnumber + 2 * numberwidth + colonwidth + 3 * gap;    // h:mm

    if (hours.length == 2) {
      exactwidth += numberwidth + gap;  // hh:mm
    }

    if (drawseconds) {
      exactwidth += 2 * numberwidth + colonwidth + 3 * gap; // hh:mm:ss
    }
  }

  // squish the time into frame if gets too tall 
  if (squish_y && numberheight > d_y - 2 * boy) {
    var overhead = numberheight - d_y + 2 *  boy;

    hig -= Math.ceil(overhead / 2);

    // recalculating...
    numberheight = numberHeight(str, hig, dia, spa);
  }

  // we assume hh:mm to start, and will compensate for it later (we already handled the true case earlier for squeezing)
  if (hours.length == 1) {
    exactwidth += numberwidth + gap;
  }

  // shift the pointers to where the number will start before drawing (favor top-right in case of odd pixels)
  var correction = numberwidth - firstnumber; // correct justification for the first digit (if 1, 3, or 7)
  var p_x = (d_x - exactwidth) / 2 - correction + 1;
  var p_y;

  if (numberheight % 2 == 0) {
    p_y = (d_y - numberheight) / 2 + 1;
  } else {
    p_y = (d_y - numberheight) / 2;
  }

  // handle justification of number placements
  if (x_just == 'left') {
    p_x = box - correction + 1;
  } else if (x_just == 'right') {
    p_x = d_x - exactwidth - correction - box + 1;
  }

  if (y_just == 'top') {
    p_y = boy + 1;
  } else if (y_just == 'bottom') {
    p_y = d_y - numberheight - boy + 1;
  }
 
  // draw the hours
  if (hours.length == 2) {
    drawNumber(ctx, hours[0], p_x, p_y, str, len, hig, dia, spa, num1);
    p_x += numberwidth + gap;
    drawNumber(ctx, hours[1], p_x, p_y, str, len, hig, dia, spa, num2);
  } else {
    // shift over the missing first number
    if (x_just == 'center') {
      p_x += (numberwidth + gap) / 2;
    } else if (x_just == 'right'){
      p_x += numberwidth + gap;
    }
    drawNumber(ctx, hours[0], p_x, p_y, str, len, hig, dia, spa, num2);
  }

  // draw colon and minutes
  p_x += numberwidth + gap;
  // crazy colon math to center the colon dots in their respective cell rows
  drawColon(ctx, p_x, p_y + (hig + str) / 2 - dia + spa, str, hig + str + 2 * (spa - dia), dia, col1);
  p_x += colonwidth + gap
  drawNumber(ctx, minutes[0], p_x, p_y, str, len, hig, dia, spa, num3);
  p_x += numberwidth + gap;
  drawNumber(ctx, minutes[1], p_x, p_y, str, len, hig, dia, spa, num4);

  // handle seconds if requested
  if (drawseconds) {
    p_x += numberwidth + gap;
    drawColon(ctx, p_x, p_y + (hig + str) / 2 - dia + spa, str, hig + str + 2 * (spa - dia), dia, col2);
    p_x += colonwidth + gap
    drawNumber(ctx, seconds[0], p_x, p_y, str, len, hig, dia, spa, num5);
    p_x += numberwidth + gap;
    drawNumber(ctx, seconds[1], p_x, p_y, str, len, hig, dia, spa, num6);
  }

  // quality of life: if connection is lost, we only do minutes
  drawseconds = false;
  });


rocky.on('message', function(event) {settings = event.data;});

if (drawseconds) {
  // update every second
  rocky.on('secondchange', function(event) {rocky.requestDraw()});
} else {
  // update every minute
  rocky.on('minutechange', function(event) {rocky.requestDraw()});
}

rocky.postMessage({command: "settings"});

/* drawCell: draws a single cell of a 7-segment display
*   x, y: define the top-left corner of the bounding box (in-center)
*   width: the maximum width, from side to side, of the cell
*   height: the total length from tip to tail, of the cell
*   diagonal: the block distance cut into each corner (max is at or under width / 2)
*   edges: choose whether or not to do edges around the cell
*/
function drawCell(ctx, x, y, width, height, diagonal) {
  // strange corrections. Top-left-most cell is (1,1)
  height--;
  width++;
  x--;

  // special case if height is now 0 (1 was requested)
  if (height == 0) {
    ctx.beginPath();
    ctx.moveTo(x + 1, y);
    ctx.lineTo(x + width - 1, y);
    ctx.stroke();
  }

  // draw the cell
  ctx.beginPath();
  ctx.moveTo(x + diagonal, y);
  ctx.lineTo(x + width - diagonal, y);
  ctx.lineTo(x + width, y + diagonal);
  ctx.lineTo(x + width, y + height - diagonal);
  ctx.lineTo(x + width - diagonal, y + height);
  ctx.lineTo(x + diagonal, y + height);
  ctx.lineTo(x, y + height - diagonal);
  ctx.lineTo(x, y + diagonal);
  ctx.lineTo(x + diagonal, y);

  // fill the cell
  ctx.fill();
}


/* drawNumber: draws a number using a 7 segment display
*   val: the actual value, 0-9, to be displayed
*   x, y: define the top-left corner of the bounding box (in-center)
*   stroke: the width of the cells in the number
*   width: the maximum width, from side to side, of the number
*   height: the total length from tip to tail, of the number
*   diagonal: the block distance cut into each corner (max is at or under width / 2, going beyond looks weird)
*   spacing: the block distance between adjacent cells
*   color: the color of the number
*/
function drawNumber(ctx, val, x, y, stroke, width, height, diagonal, spacing, color) {
  var numTable = [[true,  true,  true,  true,  true,  true,  false],  // 0
                  [false, true,  true,  false, false, false, false],  // 1
                  [true,  true,  false, true,  true,  false, true ],  // 2
                  [true,  true,  true,  true,  false, false, true ],  // 3
                  [false, true,  true,  false, false, true,  true ],  // 4
                  [true,  false, true,  true,  false, true,  true ],  // 5
                  [true,  false, true,  true,  true,  true,  true ],  // 6
                  [true,  true,  true,  false, false, false, false],  // 7
                  [true,  true,  true,  true,  true,  true,  true ],  // 8
                  [true,  true,  true,  true,  false, true,  true ]]; // 9

  // handle diagonals reaching out of their cells
  if (stroke - diagonal + spacing < 0) {
    x = x - stroke + diagonal - spacing;
    y = y - stroke + diagonal - spacing;
  }

  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  // an array of all of the cell-drawing functions
  var drawings = [function() {drawCell(ctx, x + stroke - diagonal + spacing, y, width, stroke, diagonal)},
                  function() {drawCell(ctx, x + width + stroke + 2 * (spacing - diagonal), y + stroke - diagonal + spacing, stroke, height, diagonal)},
                  function() {drawCell(ctx, x + width + stroke + 2 * (spacing - diagonal), y + height + 2 * stroke + 3 * (spacing - diagonal), stroke, height, diagonal)},
                  function() {drawCell(ctx, x + stroke - diagonal + spacing, y + 2 * (height + stroke) + 4 * (spacing - diagonal), width, stroke, diagonal)},
                  function() {drawCell(ctx, x, y + height + 2 * stroke + 3 * (spacing - diagonal), stroke, height, diagonal)},
                  function() {drawCell(ctx, x, y + stroke - diagonal + spacing, stroke, height, diagonal)},
                  function() {drawCell(ctx, x + stroke - diagonal + spacing, y + height + stroke + 2 * (spacing - diagonal), width, stroke, diagonal)}];

  // draw the cells for the requested number
  for (var i = 0; i < 7; i++) {
    if (numTable[val][i]) {
      drawings[i]();
    }
  }
}


/* drawColon: draws a colon
*   x, y: the location of the top-left corner
*   stroke: the width/height of the dots
*   height: how tall the bounding box is
*   diagonal: the block  distnace cut into each corner
*   color: the color of the colon
*/
function drawColon(ctx, x, y, stroke, height, diagonal, color) {
  ctx.fillStyle = color;
  drawCell(ctx, x, y, stroke, stroke, diagonal);
  drawCell(ctx, x, y + height, stroke, stroke, diagonal);
}


/* numberWidth: returns the width of a number
*   val: the value of the number
*   stroke: the stroke value used in the number
*   width: the width of a cell in the number
*   diagonal: the diagonal value used in the number
*   spacing: the spacing value used in the number
*/
function numberWidth(val, stroke, width, diagonal, spacing) {
  var correction =  0;
  if (stroke - diagonal + spacing < 0) {
    correction = 2 * (diagonal - spacing - stroke);
  }

  if (val == 3 || val == 7) {
    return width + stroke + spacing - diagonal + correction;
  } else if (val == 1) {
    return stroke + correction;
  } else {
    return width + 2 * (spacing + stroke - diagonal) + correction;
  }
}


/* numberHeight: returns the height of a number
*   stroke: the stroke value used in the number
*   height: the height of a cell in the number
*   diagonal: the diagonal value used in the number
*   spacing: the spacing value used in the number
*/
function numberHeight(stroke, height, diagonal, spacing) {
  var correction =  0;
  if (stroke - diagonal + spacing < 0) {
    correction = 2 * (diagonal - spacing - stroke);
  }
  return 2 * height + 3 * stroke + 4 * (spacing - diagonal) + correction;
}


/* colonWidth: returns the width of a colon
*   for now, this just is the stroke. might not need to be a function later.
*/
function colonWidth(stroke) {
  return stroke;
}

// Borrowed from Clay.js

/**
 * @param {string|boolean|number} color
 * @returns {string}
 */
function cssColor(color) {
  if (typeof color === 'number') {
    color = color.toString(16);
  } else if (!color) {
    return 'transparent';
  }

  color = padColorString(color);

  return '#' + color;
}

/**
 * @param {string} color
 * @return {string}
 */
function padColorString(color) {
  color = color.toLowerCase();

  while (color.length < 6) {
    color = '0' + color;
  }

  return color;
}