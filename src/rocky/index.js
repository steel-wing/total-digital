// gotta have it
var rocky = require('rocky');

// aplite - pebble - 
// basalt - time - 144x168 (2px border)
// chalk - time round -   (circular, border?)
// diorite - pebble 2 - 144x168
// emery - time 2 - (2px border)

// don't let spacing get too negative (> -stroke)
// probably don't let length or higt go negative at all, probably won't be good (>0)

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

// 
var dia = 0;
var len = 30;
var hig = 60;
var str = 10;
var spa = -5;
var gap = 2;
var border = 5;
var col = 'white';
var bac = 'white';

var x_just = 'right';
var y_just = 'center';

// precalculate all important dimensions
var numberwidth = numberWidth(8, str, len, dia, spa);
var numberheight = numberHeight(str, hig, dia, spa);
var colonwidth = colonWidth(str);
var timewidth = 4 * numberwidth + colonwidth + 4 * gap;

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

rocky.on('draw', function(event) {
  // get the CanvasRenderingContext2D object and clear the screen
  var ctx = event.context;
  ctx.clearRect(0, 0, ctx.canvas.clientWidth, ctx.canvas.clientHeight);

  // current time
  var d = new Date();
  var time = d.toLocaleTimeString().split(":");
  var hours =   [1]; //time[0].split("");
  var minutes = [8,8]; //time[1].split("");
  var seconds = time[2].split("");

  // get our two main dimensions
  var d_x = Math.floor(ctx.canvas.unobstructedWidth);
  var d_y = Math.floor(ctx.canvas.unobstructedHeight);

  // draw background and define colors
  ctx.fillStyle = bac;
  ctx.fillRect(0, 0, d_x, d_y);

  // shift the pointers to where the number will start before drawing
  var correction = numberwidth - numberWidth(hours[0], str, len, dia, spa)
  var p_x = (d_x - timewidth - correction) / 2 + 1;  // correct for the first digit (if 1, 3, or 7)
  var p_y = (d_y - numberheight) / 2 + 1;

  ctx.fillStyle = 'black';
  ctx.fillText(numberwidth.toString(), 1, 1, 100);
  ctx.fillText(correction.toString(), 1, 10, 100);


  // handle justification of number placements
  if (x_just == 'left') {
    p_x = border - correction + 1;

  } else if (x_just == 'right') {
    p_x = d_x - timewidth - correction - border;
  }

  if (y_just == 'top') {
    p_y = border + 1;
  } else if (y_just == 'bottom') {
    p_y = d_y - numberheight - border + 1;
  }
 
  // handle three numbers vs four
  if (hours.length == 2) {
    drawNumber(ctx, hours[0], p_x, p_y, str, len, hig, dia, spa, 'purple');
    p_x += numberwidth + gap;
    drawNumber(ctx, hours[1], p_x, p_y, str, len, hig, dia, spa, 'grey');
  } else {
    if (x_just != 'left' || x_just != 'right') {
      // shift over the missing first number for the centered case
      p_x += (numberwidth + gap) / 2;
    }
    drawNumber(ctx, hours[0], p_x, p_y, str, len, hig, dia, spa, 'grey');
  }

  // draw colon and minutes
  p_x += numberwidth + gap;
  drawnColon(ctx, p_x, p_y + (numberheight - hig) / 2, str, hig, dia, 'green');
  p_x += colonwidth + gap
  drawNumber(ctx, minutes[0], p_x, p_y, str, len, hig, dia, spa, 'red');
  p_x += numberwidth + gap;
  drawNumber(ctx, minutes[1], p_x, p_y, str, len, hig, dia, spa, 'blue');
});

// only update on the minute
rocky.on('minutechange', function(event) {
  // draw what we've done on the next pass
  rocky.requestDraw();
});


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
  // handle diagonals reaching out of their cells
  if (stroke - diagonal + spacing < 0) {
    x = x - stroke + diagonal - spacing;
    y = y - stroke + diagonal - spacing;
  }

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
function drawnColon(ctx, x, y, stroke, height, diagonal, color) {
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
  if (val == 3 || val == 7) {
    return width + stroke + spacing - diagonal;
  } else if (val == 1) {
    return stroke;
  } else {
    return width + 2 * (spacing + stroke - diagonal);
  }
}

/* numberHeight: returns the height of a number
*   stroke: the stroke value used in the number
*   height: the height of a cell in the number
*   diagonal: the diagonal value used in the number
*   spacing: the spacing value used in the number
*/
function numberHeight(stroke, height, diagonal, spacing) {
  return 2 * height + 3 * stroke + 4 * (spacing - diagonal);
}

/* colonWidth: returns the width of a colon
*   for now, this just is the stroke. might not need to be a function later.
*/
function colonWidth(stroke) {
  return stroke;
}