// Copyright 2010 William Malone (www.williammalone.com)
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

/*jslint browser: true */
/*global G_vmlCanvasManager */

var drawingApp = (function () {

	"use strict";

	var canvas,
		context,
		canvasWidth = 500,
		canvasHeight = 220,
		colorBlack = "#000000",
		outlineImage = new Image(),
		crayonImage = new Image(),
		markerImage = new Image(),
		eraserImage = new Image(),
		crayonBackgroundImage = new Image(),
		markerBackgroundImage = new Image(),
		eraserBackgroundImage = new Image(),
		crayonTextureImage = new Image(),
		clickX = [],
		clickY = [],
		clickColor = [],
		clickTool = [],
		clickSize = [],
		clickDrag = [],
		paint = false,
		curColor = colorBlack,
		curTool = "crayon",
		curSize = "normal",
		mediumStartX = 18,
		mediumStartY = 19,
		mediumImageWidth = 93,
		mediumImageHeight = 46,
		drawingAreaX = 0,
		drawingAreaY = 11,
		drawingAreaWidth = 500,
		drawingAreaHeight = 200,
		totalLoadResources = 8,
		curLoadResNum = 0,


		// Clears the canvas.
		clearCanvas = function () {

			context.clearRect(0, 0, canvasWidth, canvasHeight);
		},

		// Redraws the canvas.
		redraw = function () {

			var locX,
				locY,
				radius,
				i,
				selected,

				drawCrayon = function (x, y, color, selected) {


				},

				drawMarker = function (x, y, color, selected) {


				};

			// Make sure required resources are loaded before redrawing
			if (curLoadResNum < totalLoadResources) {
				return;
			}

			clearCanvas();

			locY = 189;
			context.beginPath();
			context.rect(locX, locY, 2, 12);
			context.closePath();
			context.fillStyle = '#333333';
			context.fill();

			// Keep the drawing in the drawing area
			context.save();
			context.beginPath();
			context.rect(drawingAreaX, drawingAreaY, drawingAreaWidth, drawingAreaHeight);
			context.clip();

			// Draw the outline image
			context.drawImage(outlineImage, drawingAreaX, drawingAreaY, drawingAreaWidth, drawingAreaHeight);
			
			// For each point drawn
			for (i = 0; i < clickX.length; i += 1) {

				radius = 5

				// Set the drawing path
				context.beginPath();
				// If dragging then draw a line between the two points
				if (clickDrag[i] && i) {
					context.moveTo(clickX[i - 1], clickY[i - 1]);
				} else {
					// The x position is moved over one pixel so a circle even if not dragging
					context.moveTo(clickX[i] - 1, clickY[i]);
				}
				context.lineTo(clickX[i], clickY[i]);
				
				context.strokeStyle = clickColor[i];

				context.lineCap = "round";
				context.lineJoin = "round";
				context.lineWidth = radius;
				context.stroke();
			}
			context.closePath();
			//context.globalCompositeOperation = "source-over";// To erase instead of draw over with white
			context.restore();

			
			context.globalAlpha = 1; // No IE support

			
		},

		// Adds a point to the drawing array.
		// @param x
		// @param y
		// @param dragging
		addClick = function (x, y, dragging) {

			clickX.push(x);
			clickY.push(y);
			clickTool.push(curTool);
			clickColor.push(curColor);
			clickSize.push(curSize);
			clickDrag.push(dragging);
		},



		// Add mouse and touch event listeners to the canvas
		createUserEvents = function () {

			var press = function (e) {
				// Mouse down location
				var sizeHotspotStartX,
					mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) - this.offsetLeft,
mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) - this.offsetTop;

				
				paint = true;
				addClick(mouseX, mouseY, false);
				redraw();
			},

			drag = function (e) {
				
				var mouseX = (e.changedTouches ? e.changedTouches[0].pageX : e.pageX) - this.offsetLeft,
					mouseY = (e.changedTouches ? e.changedTouches[0].pageY : e.pageY) - this.offsetTop;
				
				if (paint) {
					addClick(mouseX, mouseY, true);
					redraw();
				}
				// Prevent the whole page from dragging if on mobile
				e.preventDefault();
			},

			release = function () {
				paint = false;
				redraw();
			},

			cancel = function () {
				paint = false;
			};

			// Add mouse event listeners to canvas element
			canvas.addEventListener("mousedown", press, false);
			canvas.addEventListener("mousemove", drag, false);
			canvas.addEventListener("mouseup", release);
			canvas.addEventListener("mouseout", cancel, false);

			// Add touch event listeners to canvas element
			canvas.addEventListener("touchstart", press, false);
			canvas.addEventListener("touchmove", drag, false);
			canvas.addEventListener("touchend", release, false);
			canvas.addEventListener("touchcancel", cancel, false);

			// Get the button, and when the user clicks on it, execute myFunction
			document.getElementById("clearCanvas").onclick = function() {myFunction()};

			/* myFunction toggles between adding and removing the show class, which is used to hide and show the dropdown content */
			function myFunction() {
				clearCanvas();
				clickX = new Array();
				clickY = new Array();
				clickDrag = new Array();
				clickColor = new Array();
				redraw();
			}
		},

		// Calls the redraw function after all neccessary resources are loaded.
		resourceLoaded = function () {

			curLoadResNum += 1;
			if (curLoadResNum === totalLoadResources) {
				redraw();
				createUserEvents();
			}
		},

		// Creates a canvas element, loads images, adds events, and draws the canvas for the first time.
		init = function () {

			// Create the canvas (Neccessary for IE because it doesn't know what a canvas element is)
			canvas = document.createElement('canvas');
			canvas.setAttribute('width', canvasWidth);
			canvas.setAttribute('height', canvasHeight);
			canvas.setAttribute('id', 'canvas');
			document.getElementById('canvasDiv').appendChild(canvas);
			if (typeof G_vmlCanvasManager !== "undefined") {
				canvas = G_vmlCanvasManager.initElement(canvas);
			}
			context = canvas.getContext("2d"); // Grab the 2d canvas context
			// Note: The above code is a workaround for IE 8 and lower. Otherwise we could have used:
			//     context = document.getElementById('canvas').getContext("2d");

			// Load images
			crayonImage.onload = resourceLoaded;
			crayonImage.src = "images/crayon-outline.png";

			markerImage.onload = resourceLoaded;
			markerImage.src = "images/marker-outline.png";

			eraserImage.onload = resourceLoaded;
			eraserImage.src = "images/eraser-outline.png";

			crayonBackgroundImage.onload = resourceLoaded;
			crayonBackgroundImage.src = "images/crayon-background.png";

			markerBackgroundImage.onload = resourceLoaded;
			markerBackgroundImage.src = "images/marker-background.png";

			eraserBackgroundImage.onload = resourceLoaded;
			eraserBackgroundImage.src = "images/eraser-background.png";

			crayonTextureImage.onload = resourceLoaded;
			crayonTextureImage.src = "images/crayon-texture.png";

			outlineImage.onload = resourceLoaded;
			outlineImage.src = "images/fma.png";
		};


	return {
		init: init
	};
}());