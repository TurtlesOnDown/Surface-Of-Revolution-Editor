// By Spenser Riebs
// Main function to run in canvas

function ActionControl() {
    this.rotation = false;
    this.panningXY = false;
    this.panningZ = false;
    this.translationXY = false;
    this.translationZ = false;

    this.glPoint = [];
    this.point = [];
}

var GRAPHICSENGINE = null;
var MOUSE = new Mouse();
var ACTIONS = new ActionControl();

function main() {
    // Start up graphics engine and webgl to the canvas
    var canvas = document.getElementById('webgl');
    GRAPHICSENGINE = new Gcontroller(canvas);
    GRAPHICSENGINE.setOrthographic(-400, 400, -400, 400, -400, 400);
    GRAPHICSENGINE.setLookAt(0, 0, 1, 0, 0, 0, 0, 1, 0);
    GRAPHICSENGINE.setViewPos(0, 0, 800);

    var lineShader = new Shader("lineShader", GRAPHICSENGINE,
        getShaderCode("lineShader-vs"), getShaderCode("lineShader-fs"));
    GRAPHICSENGINE.addShader(lineShader);
    var SORShader = new Shader("SORShader", GRAPHICSENGINE,
        getShaderCode("SORShader-vs"), getShaderCode("SORShader-fs"));
    GRAPHICSENGINE.addShader(SORShader);

    var directionLight = new DirectionalLight(new Vector3([-1, -1, -1]), new Vector3([1, 1, 1]), new Vector3([1, 1, 1]), new Vector3([1, 1, 1]));
    GRAPHICSENGINE.setDirLight(directionLight);

    LINE = new Line(GRAPHICSENGINE, new Vector3([1, 0, 0]));
    LINE.first = true;


    DIVIDERLINE = new Line(GRAPHICSENGINE);
    DIVIDERLINE.pushPoint(new Vector3([0, 2000, 0]));
    DIVIDERLINE.pushPoint(new Vector3([0, -2000, 0]));
    DIVIDERLINE = new DrawObject(DIVIDERLINE, "lineShader");
    GRAPHICSENGINE.pushDrawObject(DIVIDERLINE);

    MOUSE.mouseDownAction = onClickCreateLine;
    MOUSE.mouseMoveAction = mouseMoveCreateLine;
    MOUSE.mouseScrollAction = function(event) {};
    MOUSE.mouseUpAction = function(event) {};
    MOUSE.beginCapture(GRAPHICSENGINE.canvas);

    GRAPHICSENGINE.canvas.addEventListener('contextmenu', function (event) {
        if (event.button == 2) {
            event.preventDefault();
            return false;
        }
    });

    GRAPHICSENGINE.draw();
}

setInterval(update, 1);

function update() {
    GRAPHICSENGINE.draw();
}

MOUSE.banding = false;
var LINE = null;
var dLINE = null;
var DIVIDERLINE = null;


function onClickCreateLine(event) {
    var rect = event.target.getBoundingClientRect();
    var x = event.pageX - rect.left;
    var y = event.pageY - rect.top;

    var pointX = x - GRAPHICSENGINE.canvas.width/2;
    var pointY = GRAPHICSENGINE.canvas.height/2 - y;

    if (event.button === 0) {
        LINE.pushPoint(new Vector3([pointX, pointY, 0]));
        if (MOUSE.banding == false) MOUSE.banding = true;

        if (LINE.first) {
            dLINE = new DrawObject(LINE, "lineShader");
            GRAPHICSENGINE.pushDrawObject(dLINE);
        }
    }
    if (event.button === 2 && MOUSE.banding == true) {
        MOUSE.banding = false;
        LINE.pushPoint(new Vector3([pointX, pointY, 0]));
        GRAPHICSENGINE.removeDrawObject(DIVIDERLINE.GUID);

        var SORVertices = generateVertices(LINE);
        var SORIndices = generateIndices(LINE.vertices, SORVertices);
        var SORUVs = generateUVs(LINE);

        var SOR = new SurfaceOfRevolution(GRAPHICSENGINE, SORVertices, SORIndices, new Vector3([.2, 0, .5]), SORUVs);

        GRAPHICSENGINE.removeDrawObject(dLINE.GUID);
        GRAPHICSENGINE.pushDrawObject(new DrawObject(SOR, "SORShader"));
        perspective();


        MOUSE.mouseDownAction = onMouseDownSOR;
        MOUSE.mouseMoveAction = onMoveSOR;
        MOUSE.mouseScrollAction = onScrollSOR;
        MOUSE.mouseUpAction = onMouseUpSOR;
    }

    GRAPHICSENGINE.draw();
}

function mouseMoveCreateLine(event) {
    var rect = event.target.getBoundingClientRect();
    var x = event.pageX - rect.left;
    var y = event.pageY - rect.top;

    var pointX = x - GRAPHICSENGINE.canvas.width/2;
    var pointY = GRAPHICSENGINE.canvas.height/2 - y;

    // Rubberbanding code, adds a point if starting the rubberband
    if (MOUSE.banding == true && LINE.first == true) {
        LINE.pushPoint(new Vector3([pointX, pointY, 0]));
        LINE.first = false;
    }
    // pops previous point adds a new one on each move if rubberband is going
    if (MOUSE.banding == true && LINE.first == false) {
        LINE.popPoint();
        LINE.pushPoint(new Vector3([pointX, pointY, 0]));
    }
    GRAPHICSENGINE.draw();
}

function onMouseDownSOR(event) {
    var rect = event.target.getBoundingClientRect();
    var x = event.pageX - rect.left;
    var y = rect.bottom - event.pageY;
    var target = GRAPHICSENGINE.findClicked(x, y);
    if (target) GRAPHICSENGINE.select(target);
    else GRAPHICSENGINE.deselect();

    if (target && event.button == 0) ACTIONS.translationXY = true;
    if (target && event.button == 1) ACTIONS.translationZ = true;
    if (target && event.button == 2) ACTIONS.rotation = true;

    if (!target && event.button == 0) ACTIONS.panningXY = true;
    if (!target && event.button == 0) ACTIONS.panningZ = true;

}

function onMoveSOR(event) {
    var rect = event.target.getBoundingClientRect();
    var x = event.pageX - rect.left;
    var y = event.pageY - rect.top;

    var pointX = x - GRAPHICSENGINE.canvas.width/2;
    var pointY = GRAPHICSENGINE.canvas.height/2 - y;

    if (ACTIONS.translationXY) {
        var translateX = pointX - ACTIONS.glPoint[0];
        var translateY = pointY - ACTIONS.glPoint[1];

        GRAPHICSENGINE.translateSelX(translateX);
        GRAPHICSENGINE.translateSelY(translateY);

    }
    if (ACTIONS.translationZ) {
        var translateZ = pointY - ACTIONS.glPoint[1];

        GRAPHICSENGINE.translateSelZ(translateZ * 1.5);
    }

    if (ACTIONS.rotation) {
        var translateX = Math.abs(pointX - ACTIONS.glPoint[0]);
        var translateY = Math.abs(pointY - ACTIONS.glPoint[1]);

        GRAPHICSENGINE.rotateSelX(translateX * .5);
        GRAPHICSENGINE.rotateSelZ(translateY * .5);
    }

    if (ACTIONS.panningXY) {
        var xdirect = x - ACTIONS.point[0];
        var ydirect = y - ACTIONS.point[1];

        GRAPHICSENGINE.transViewPosX(xdirect * 40);
        GRAPHICSENGINE.transViewPosY(ydirect * 40);
    }

    ACTIONS.point = [x, y];
    ACTIONS.glPoint = [pointX, pointY];
}

function onScrollSOR(event) {
    if (GRAPHICSENGINE.getSelected()) {
        if (event.deltaY > 0) GRAPHICSENGINE.scaleSel(.95);
        else GRAPHICSENGINE.scaleSel(1.05);
    }
    if (!GRAPHICSENGINE.getSelected()) {
        if (event.deltaY > 0) GRAPHICSENGINE.changeZoom(2);
        else GRAPHICSENGINE.changeZoom(-2);
    }

}

function onMouseUpSOR(event) {
    if (ACTIONS.rotation) ACTIONS.rotation = false;
    if (ACTIONS.panningXY) ACTIONS.panningXY = false;
    if (ACTIONS.panningZ) ACTIONS.panningZ = false;
    if (ACTIONS.translationXY) ACTIONS.translationXY = false;
    if (ACTIONS.translationZ) ACTIONS.translationZ = false;
}

function switchSpec() {
    var obj = GRAPHICSENGINE.getSelected();
    if (obj) obj.element.switchSpecular();
}

function updateShiny() {
    var obj = GRAPHICSENGINE.getSelected();
    if (obj) obj.element.changeShininess(document.getElementById("shiny").value);
}

function flatShading() {
    var obj = GRAPHICSENGINE.getSelected();
    if (obj) obj.element.flatShading();
}

function gourandShading() {
    var obj = GRAPHICSENGINE.getSelected();
    if (obj) obj.element.gourandShading();
}

function orthographic() {
    GRAPHICSENGINE.setOrthographic(-400, 400, -400, 400, -400, 400);
    GRAPHICSENGINE.setLookAt(1, 1, 0, 0, 0, 0, 0, 1, 0);
    GRAPHICSENGINE.setViewPos(0, 0, 800);
}

function perspective() {
    GRAPHICSENGINE.setPerspective(80, 1, 1600);
    GRAPHICSENGINE.setLookAt(0, 0, 1000, 0, 0, 0, 0, 1, 0);
    GRAPHICSENGINE.setViewPos(0, 0, 800);
}

function newObject() {
    GRAPHICSENGINE.setOrthographic(-400, 400, -400, 400, -400, 400);
    GRAPHICSENGINE.setLookAt(0, 0, 1, 0, 0, 0, 0, 1, 0);
    GRAPHICSENGINE.setViewPos(0, 0, 800);

    LINE = new Line(GRAPHICSENGINE, new Vector3([1, 0, 0]));
    LINE.first = true;
    GRAPHICSENGINE.pushDrawObject(DIVIDERLINE);

    MOUSE.mouseDownAction = onClickCreateLine;
    MOUSE.mouseMoveAction = mouseMoveCreateLine;
    MOUSE.mouseScrollAction = function(event) {};
    MOUSE.mouseUpAction = function(event) {};

}

function removeObject() {
    if (GRAPHICSENGINE.getSelected()) {
        GRAPHICSENGINE.removeDrawObject(GRAPHICSENGINE.getSelected().GUID);
    }
}
