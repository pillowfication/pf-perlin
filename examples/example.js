'use strict';

var $ = require('jquery');
var pfcanvas = require('pf-canvas');
var pfperlin = require('..');

var cos = Math.cos, sin = Math.sin;
var res = 35, size = 280, square = size/res;
var color = 'red';

$(function() {
  var cube = document.getElementById('cube'), time = 0;
  var mouseX = 0, mouseY = 0, pitch = -.5, roll = 0, dragging = false, ease = 100;
  var perlin = pfperlin({
    dimensions: 4,
    wavelength: 12,
    octaves: 2
  });
  var i, c, r;

  // Initialize each point's (x, y, z) location
  var points = [], face, col, point;
  for (i = 0; i < 6 && (face = []); i = points.push(face))
    for (c = 0; c < res && (col = []); c = face.push(col))
      for (r = 0; r < res; r = col.push(point))
        switch (i) {
          /* eslint-disable */
          case 0: point = [c, r, 0];         break;
          case 1: point = [res-1-c, r, res]; break;
          case 2: point = [c, 0, res-1-r];   break;
          case 3: point = [c, res, r];       break;
          case 4: point = [0, r, res-1-c];   break;
          case 5: point = [res, r, c];       break;
          /* eslint-enable */
        }

  // Create the canvases on each face
  var faces = ['F', 'B', 'U', 'D', 'L', 'R'];
  for (i = 0; i < 6; ++i)
    pfcanvas(document.getElementById(faces[i]), (function() {
      var face = points[i];
      return function(ctx) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = color;
        var c, _c, cs, r, point;
        for (c = 0; c < res && (cs = c*square, _c = face[c]); ++c)
          for (r = 0; r < res && (point = _c[r]); ++r)
            if (perlin.get(point[0], point[1], point[2], time) > .5)
              ctx.fillRect(cs, r*square, square, square);
      };
    })(), {redraw: 'always'});

  // Increment time
  (function update() {
    time += .1;
    requestAnimationFrame(update);
  })();

  // Handle cube rotation
  function rotateCube() {
    var cA = cos(pitch), sA = sin(pitch), cB = cos(roll), sB = sin(roll),
        m = [cA, 0, -sA, 0, sA*sB, cB, cA*sB, 0, sA*cB, -sB, cA*cB, 0, 0, 0, 0, 1];
    cube.style.transform = 'matrix3d('+m+')';
  }
  rotateCube();

  // Handle mouse dragging
  $(document.body).mousemove(function(e) {
    if (dragging) {
      pitch += (e.pageX-mouseX) / ease;
      roll += (mouseY-e.pageY) / ease;
      rotateCube();
    }
    mouseX = e.pageX;
    mouseY = e.pageY;
  }).mousedown(function() {
    dragging = true;
  }).mouseup(function() {
    dragging = false;
  });
});
