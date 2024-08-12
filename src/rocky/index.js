// gotta have it
var rocky = require('rocky');

// aplite - pebble - 
// basalt - time - 144x168 (2px border)
// chalk - time round -   (circular, border?)
// diorite - pebble 2 - 144x168
// emery - time 2 - (2px border)

// don't let spacing get too negative (> -stroke)
// probably don't let length or hight go negative at all, probably won't be good (>0)

//                val, x, y, stroke, width, height, diagonal, spacing
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

var diagonal = 0;
var length = 50;
var hight = 100;
var stroke = 8;
var space = -8;
var gapth = 2;
var border_x = 5;
var border_y = 25;

var num1 = 'purple';
var num2 = 'orange';
var num3 = 'cyan';
var num4 = 'green';
var num5 = 'blue';
var num6 = 'magenta';
var col1 = 'grey';
var col2 = 'red';
var bac = 'white';

// OG SIMPLE DIGITAL
// var diagonal = 1;
// var length = 12;
// var hight = 12;
// var stroke = 3;
// var space = 0;
// var gapth = 4;
// var border_x = 4;
// var border_y = 4;

// var num1 = 'black';
// var num2 = 'black';
// var num3 = 'black';
// var num4 = 'black';
// var num5 = 'black';
// var num6 = 'black';
// var col1 = 'black';
// var col2 = 'black';
// var bac = 'white';

var drawseconds = true;
var squish_x = true;
var squish_y = true;
var y_just = 'center';
var x_just = 'center';


rocky.on('draw', function(event) {
  // import settings
  var dia = diagonal;
  var len = length;
  var hig = hight;
  var str = stroke;
  var spa = space;
  var gap = gapth;
  var box = border_x;
  var boy = border_y;

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
  drawColon(ctx, p_x, p_y + str - dia + spa + hig / 2 - 1, str, hig + str + 2 * (1 + spa - dia), dia, col1);
  p_x += colonwidth + gap
  drawNumber(ctx, minutes[0], p_x, p_y, str, len, hig, dia, spa, num3);
  p_x += numberwidth + gap;
  drawNumber(ctx, minutes[1], p_x, p_y, str, len, hig, dia, spa, num4);

  // handle seconds if requested
  if (drawseconds) {
    p_x += numberwidth + gap;
    drawColon(ctx, p_x, p_y + str - dia + spa + hig / 2 - 1, str, hig + str + 2 * (1 + spa - dia), dia, col2);
    p_x += colonwidth + gap
    drawNumber(ctx, seconds[0], p_x, p_y, str, len, hig, dia, spa, num5);
    p_x += numberwidth + gap;
    drawNumber(ctx, seconds[1], p_x, p_y, str, len, hig, dia, spa, num6);
  }
  });


if (drawseconds) {
  // update every second
  rocky.on('secondchange', function(event) {rocky.requestDraw()});
} else {
  // update every minute
  rocky.on('minutechange', function(event) {rocky.requestDraw()});
}


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
  drawCell(ctx, x, y + height - stroke, stroke, stroke, diagonal);
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