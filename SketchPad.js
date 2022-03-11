// JavaScript source code
var context;
var gradientFillEnabled = false;
var fillPickerColor;
var grd;

// Check for the canvas tag onload. 
if (window.addEventListener) {
    window.addEventListener('load', function () {
        var canvas, canvaso, contexto;
        // Default tool. (chalk, line, rectangle, circle etc....) 
        var tool;
        var tool_default = 'chalk';

        function init() {
            canvaso = document.getElementById('drawingCanvas');
            if (!canvaso) {
                alert('Error! The canvas element was not found!');
                return;
            }
            if (!canvaso.getContext) {
                alert('Error! No canvas.getContext!');
                return;
            }
            // Create 2d canvas. 
            contexto = canvaso.getContext('2d');
            if (!contexto) {
                alert('Error! Failed to getContext!');
                return;
            }
            // Build the temporary canvas. 
            var container = canvaso.parentNode;
            canvas = document.createElement('canvas');
            if (!canvas) {
                alert('Error! Cannot create a new canvas element!');
                return;
            }
            canvas.id = 'tempCanvas';
            canvas.width = canvaso.width;
            canvas.height = canvaso.height;
            container.appendChild(canvas);
            context = canvas.getContext('2d');
            context.strokeStyle = "#FFFFFF";// Default line color. 
            context.lineWidth = 1.0;// Default stroke weight. 

            // Fill transparent canvas with dark grey (So we can use the color to erase). 
            context.fillStyle = "#000000";
            context.fillRect(0, 0, 897, 532);//Top, Left, Width, Height of canvas.
            // Create a select field with our tools.


            var RChalk_Selector = document.getElementById('RChalk');
            if (!RChalk_Selector) {
                alert('Error! Failed to get the select element!');
                return;
            }
            RChalk_Selector.addEventListener('change', select_RChalk, false);

            var RLine_Selector = document.getElementById('RLine');
            if (!RLine_Selector) {
                alert('Error! Failed to get the select element!');
                return;
            }
            RLine_Selector.addEventListener('change', select_RLine, false);

            var RRect_Selector = document.getElementById('RRect');
            if (!RRect_Selector) {
                alert('Error! Failed to get the select element!');
                return;
            }
            RRect_Selector.addEventListener('change', select_RRect, false);

            var RCircle_Selector = document.getElementById('RCircle');
            if (!RCircle_Selector) {
                alert('Error! Failed to get the select element!');
                return;
            }
            RCircle_Selector.addEventListener('change', select_RCircle, false);


            //Create pen width selector
            var penWidth_selector = document.getElementById("penWidth");
            penWidth_selector.addEventListener('change', penWidth_changer, false);

            //Create pen colour selector
            var colorPicker_selector = document.getElementById("colourPicker");
            colorPicker_selector.addEventListener('change', colorPicker_changer, false);

            //Create fill colour selector
            var fillPicker_selector = document.getElementById("fillPicker");
            fillPicker_selector.addEventListener('change', fillPicker_changer, false);

            var gradientfill_selector = document.getElementById("gradientfill");
            gradientfill_selector.addEventListener('change', gradientfill_changer, false);

            // Activate the default tool (chalk). 
            if (tools[tool_default]) {
                tool = new tools[tool_default]();
            }
            // Event Listeners. 
            canvas.addEventListener('mousedown', ev_canvas, false);
            canvas.addEventListener('mousemove', ev_canvas, false);
            canvas.addEventListener('mouseup', ev_canvas, false);
        }
        // Get the mouse position. 
        function ev_canvas(ev) {
            if (ev.layerX || ev.layerX == 0) { // Firefox 
                ev._x = ev.layerX;
                ev._y = ev.layerY;
            } else if (ev.offsetX || ev.offsetX == 0) { // Opera 
                ev._x = ev.offsetX;
                ev._y = ev.offsetY;
            }
            // Get the tool's event handler. 
            var func = tool[ev.type];
            if (func) {
                func(ev);
            }
        }

        function select_RChalk(ev) {
            tool = new tools["chalk"]();
        }

        function select_RLine(ev) {
            tool = new tools["line"]();
        }

        function select_RRect(ev) {
            tool = new tools["rect"]();
        }

        function select_RCircle(ev) {
            tool = new tools["circle"]();
        }



        function penWidth_changer(ev) {
            context.lineWidth = this.value;
        }

        function colorPicker_changer(ev) {
            context.strokeStyle = this.value;
        }

        function fillPicker_changer(ev) {
            fillPickerColor = this.value;
            context.fillStyle = fillPickerColor;
        }

        function gradientfill_changer(ev) {
            if (this.checked) {
                gradientFillEnabled = true
            } else {
                gradientFillEnabled = false
            }
        }

        // Create the temporary canvas on top of the canvas, which is cleared each time the user draws. 
        function img_update() {
            contexto.drawImage(canvas, 0, 0);
            context.clearRect(0, 0, canvas.width, canvas.height);
        }
        var tools = {}; //this is a "list"
        // Chalk tool. 
        tools.chalk = function () {
            var tool = this;
            this.started = false;
            // Begin drawing with the chalk tool. 
            this.mousedown = function (ev) {
                context.beginPath();
                context.moveTo(ev._x, ev._y);
                tool.started = true;
            };
            this.mousemove = function (ev) {
                if (tool.started) {
                    //var img = document.getElementById("greypen");
                    //var pat = context.createPattern(img, 'repeat');
                    //context.strokeStyle = pat;
                    //context.globalAlpha = 0.2;
                    context.lineTo(ev._x, ev._y);
                    context.stroke();
                }
            };
            this.mouseup = function (ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                    img_update();
                }
            };
        };

        // The rectangle tool. 
        tools.rect = function () {
            var tool = this;
            this.started = false;
            this.mousedown = function (ev) {
                tool.started = true;
                tool.x0 = ev._x;
                tool.y0 = ev._y;
            };
            this.mousemove = function (ev) {
                if (!tool.started) {
                    return;
                }
                // This creates a rectangle on the canvas. 
                var x = Math.min(ev._x, tool.x0),
                    y = Math.min(ev._y, tool.y0),
                    w = Math.abs(ev._x - tool.x0),
                    h = Math.abs(ev._y - tool.y0);
                context.clearRect(0, 0, canvas.width, canvas.height);// Clears the rectangle onload. 

                if (!w || !h) {
                    return;
                }

                context.beginPath();

                context.rect(x, y, w, h);
                if (gradientFillEnabled) {
                    grd = context.createLinearGradient(x, y, x+w, y+h);;
                    grd.addColorStop(0, context.strokeStyle);
                    grd.addColorStop(1, fillPickerColor);
                    context.fillStyle = grd;
                } else {
                    context.fillStyle = fillPickerColor;
                }
                context.fill();
                context.stroke();
            };
            // Now when you select the rectangle tool, you can draw rectangles. 
            this.mouseup = function (ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                    img_update();
                }
            };
        };

        // The line tool. 
        tools.line = function () {
            var tool = this;
            this.started = false;
            this.mousedown = function (ev) {
                tool.started = true;
                tool.x0 = ev._x;
                tool.y0 = ev._y;
            };
            this.mousemove = function (ev) {
                if (!tool.started) {
                    return;
                }
                context.clearRect(0, 0, canvas.width, canvas.height);
                // Begin the line. 

                context.beginPath();
                context.moveTo(tool.x0, tool.y0);
                context.lineTo(ev._x, ev._y);
                //add line width here
                //add colour here
                context.stroke();
                context.closePath();
            };
            // Now you can draw lines when the line tool is seletcted. 
            this.mouseup = function (ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                    img_update();
                }
            };
        };

        //The circle tool
        tools.circle = function () {
            var tool = this;
            this.started = false;
            this.mousedown = function (ev) {
                tool.started = true;
                tool.x0 = ev._x;
                tool.y0 = ev._y;
            };
            this.mousemove = function (ev) {
                if (!tool.started) {
                    return;
                }
                // This creates a circle on the canvas.
                //var x = Math.min(ev._x, tool.x0),
                //    y = Math.min(ev._y, tool.y0),
                //    d = Math.abs(ev._x - tool.x0);      //diameter of the circle
                var x = ev._x,
                    y = ev._y,
                    d = Math.abs(ev._x - tool.x0);      //diameter of the circle
                context.clearRect(0, 0, canvas.width, canvas.height);// Clears the circle onload. 
                context.beginPath();
                context.arc(x,y,d, 0, 2 * Math.PI);   //draw circle
                context.fill();
                context.stroke();
            }
            this.mouseup = function (ev) {
                if (tool.started) {
                    tool.mousemove(ev);
                    tool.started = false;
                    img_update();
                }
            }

        };
        init();
    }, false);
}