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

var dia = 0;
var len = 20;
var hig = 20;
var str = 6;
var spa = -6;
var gap = 35;
var col = 'white';
var bac = 'black';

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
  var hours =  time[0].split("");
  var minutes = time[1].split("");
  var seconds = time[2].split("");

  // get our two main dimensions
  var w = ctx.canvas.unobstructedWidth;
  var h = ctx.canvas.unobstructedHeight;

  // draw background and define colors
  ctx.fillStyle = bac;
  ctx.fillRect(-1, -1, w+10, h+10);
 
  // handle three numbers vs four
  if (hours.length == 2) {
    drawNumber(ctx, hours[0], w / 2 - 1.5 * gap - 10, 60, str, len, hig, dia, spa, 'purple');
    drawNumber(ctx, hours[1], w / 2 - 0.5 * gap - 10, 60, str, len, hig, dia, spa, 'yellow');
  } else {
    drawNumber(ctx, hours[0], w / 2 - 0.5 * gap - 10, 60, str, len, hig, dia, spa, 'cyan');
  }

  drawnColons(ctx, w / 2, 67, 5, 15, 1, 'red');

  drawNumber(ctx, minutes[0], w / 2 + 0.5 * gap - 10, 60, str, len, hig, dia, spa, 'blue');
  drawNumber(ctx, minutes[1], w / 2 + 1.5 * gap - 10, 60, str, len, hig, dia, spa, 'green');
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
  ctx.lineTo(x + width - diagonal, y + height);                       // do we want to give it the option for some slant?
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
*/
function drawNumber(ctx, val, x, y, stroke, width, height, diagonal, spacing, color) {
  // handle diagonals reaching out of their cells
  if (stroke - diagonal + spacing < 0) {
    x = x - stroke + diagonal - spacing;
    y = y - stroke + diagonal - spacing;
  }

  ctx.fillStyle = color;

  // an array of all of the  cell-drawing functions
  var drawings = [function() { drawCell(ctx, x + stroke - diagonal + spacing, y, width, stroke, diagonal)},
                  function() { drawCell(ctx, x + width + stroke + 2 * (spacing - diagonal), y + stroke - diagonal + spacing, stroke, height, diagonal)},
                  function() { drawCell(ctx, x + width + stroke + 2 * (spacing - diagonal), y + height + 2 * stroke + 3 * (spacing - diagonal), stroke, height, diagonal)},
                  function() { drawCell(ctx, x + stroke - diagonal + spacing, y + 2 * (height + stroke) + 4 * (spacing - diagonal), width, stroke, diagonal)},
                  function() { drawCell(ctx, x, y + height + 2 * stroke + 3 * (spacing - diagonal), stroke, height, diagonal)},
                  function() { drawCell(ctx, x, y + stroke - diagonal + spacing, stroke, height, diagonal)},
                  function() { drawCell(ctx, x + stroke - diagonal + spacing, y + height + stroke + 2 * (spacing - diagonal), width, stroke, diagonal)}];

  // draw the cells for the requested number
  for (var i = 0; i < 7; i++) {
    if (numTable[val][i]) {
      drawings[i]();
    }
  }
}

function drawnColons(ctx, x, y, stroke, height, diagonal, color) {
  ctx.fillStyle = color;
  drawCell(ctx, x, y, stroke, stroke, diagonal);
  drawCell(ctx, x, y + height, stroke, stroke, diagonal);
}


/* numberWidth: calculates the width of the given number
*   val: 
*   stroke: 
*
*
*
*
*
*/

function numberWidth(ctx, val, stroke, width, height, diagonal, spacing) {

  var xlen = len - 2 * dia + 2 * (str + spa);
  var ylen = 2 * hig + 4 * (spa - dia) + 2 * str;  
}

function numberHeight(ctx, val, stroke, width, height, diagonal, spacing) {

}