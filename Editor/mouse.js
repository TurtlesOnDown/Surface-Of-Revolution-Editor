// By Spenser Riebs
// Mouse control unit for a surfaceofrevolution file

// A mouse object meant to act as a global control of the mouse functions
function Mouse() {
    this.x = 0;
    this.y = 0;
    this.mouseMoveAction = null;
    this.mouseDownAction = null;
    this.mouseUpAction = null;
    this.mouseScrollAction = null;
    this.isMouseDown = false;
}

// Turns all functions to eventlisteners when called. Initializing the mouse functionality
Mouse.prototype.beginCapture = function (canvas) {
    var _this = this;
    if (this.mouseMoveAction) {
        canvas.addEventListener('mousemove', function(event) {
            _this.x = event.pageX - canvas.offsetLeft;
            _this.y = event.pageY - canvas.offsetTop;
            return _this.mouseMoveAction(event);
        });
    }
    if (this.mouseDownAction) {
        canvas.addEventListener('mousedown', function(event) {
            return _this.mouseDownAction(event);
        });
    }
    if (this.mouseUpAction) {
        canvas.addEventListener('mouseup', function(event) {
            return _this.mouseUpAction(event);
        });
    }
    if (this.mouseScrollAction) {
        canvas.addEventListener('wheel', function(event) {
            return _this.mouseScrollAction(event);
        });
    }
};