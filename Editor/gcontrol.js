// By Spenser Riebs
// Graphics control object and functionality

var GUID = 0;

// Constructor
// Takes in a color ID and an element, giving it a unique global ID
function DrawObject(obj, shader) {
    this.GUID = GUID;
    GUID++;

    this.shader = shader;
    this.element = obj;
    this.color = obj.color;
    this.texture = null;
}

// Adds color ID to a DrawObject
DrawObject.prototype.giveCID = function(cid) {
    this.CID = cid;
};

// Calls the draw function of the element
DrawObject.prototype.draw = function(control) {
    control[this.shader].use();
    this.element.draw(control);
};

// Calls the drawClicked function of the element
DrawObject.prototype.drawClicked = function(control) {
    control[this.shader].use();
    var clickColor = new Vector3([this.CID.elements[0] / 255, this.CID.elements[1] / 255, this.CID.elements[2] / 255]);
    this.element.drawClicked(control, clickColor);
};

// Selects this specific object
// Changes the color of the object to grey to represent selected
DrawObject.prototype.select = function() {
    if (this.element.changeColor != undefined) {
        this.element.changeColor(new Vector3([.5, .5, .5]));
    }
};

// returns the color to it's original state or texture
DrawObject.prototype.deselect = function() {
    this.element.changeColor(this.color);
    if (this.texture) {
        this.element.changeTexture(this.texture);
    }
};

// Changes the texture of the object if it has a changeTexture function
DrawObject.prototype.changeTexture = function(tex, control) {
  if (this.element.changeTexture != undefined) {
      var image = new Image();
      var _Texture = control.gl.createTexture();
      var _ThisGL = control.gl;
      image.src = tex;
      image.addEventListener('load', function() {
          _ThisGL.pixelStorei(_ThisGL.UNPACK_FLIP_Y_WEBGL, 1);
          _ThisGL.bindTexture(_ThisGL.TEXTURE_2D, _Texture);
          _ThisGL.texImage2D(_ThisGL.TEXTURE_2D, 0, _ThisGL.RGBA, _ThisGL.RGBA, _ThisGL.UNSIGNED_BYTE, image);
          _ThisGL.generateMipmap(_ThisGL.TEXTURE_2D);
      });

      this.texture = _Texture;
      this.element.changeTexture(_Texture);
  }
};

// Constructor
// Creates the webgl context and controls all objects that will be drawn on the screen
function Gcontroller(canvas) {
    // Drawobjects to be drawn on screen
    this.drawObjects = [];
    this.nextCID = new Vector3([0, 0, 0]);

    // Lighting Objects
    this.pointLights = []; // array of pointlights
    this.directionalLight = null; // directional light

    // selected object to be transformed
    this.selectedObject = null;

    // Projection Matrix
    this.projectionMatrix = new Matrix4();

    this.camera = new ThirdPersonCamera(new Vector3([0, 0, 1]), new Vector3([0, 0, 0]), new Vector3([0, 1, 0]));
    this.cameraType = "THIRD";
    this.cameraVelocity = 10;

    this.zoom = null;

    // Check Variables
    this.normalsOn = false;

    //Context and Canvas
    this.canvas = canvas;
    this.gl = getWebGLContext(canvas);
    //Enable Depth Testing
    this.gl.enable(this.gl.DEPTH_TEST);
    // Specify canvas clear color
    this.gl.clearColor(1.0, 1.0, 1.0, 1.0);
    // Clear the canvas
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
}

// Set's the projection matrix to orthographic
Gcontroller.prototype.setOrthographic = function(left, right, bottom, top, near, far) {
    this.projectionMatrix.setOrtho(left, right, bottom, top, near, far);
};

// Set's the projection matrix to perspective
Gcontroller.prototype.setPerspective = function(fovy, near, far) {
    this.zoom = fovy;
    this.perspNear = near;
    this.perspFar = far;
    this.projectionMatrix.setPerspective(fovy, this.canvas.width/this.canvas.height, near, far);
};

// Changes the zoom of the camera, only works in perspective projection
Gcontroller.prototype.changeZoom = function(val) {
    this.zoom += val;
    if (this.perspNear) this.projectionMatrix.setPerspective(this.zoom, this.canvas.width/this.canvas.height, this.perspNear, this.perspFar);
};

// Set the position of the camrea manually
Gcontroller.prototype.setViewPos = function(x, y, z) {
    this.camera.changePosition(x, y, z);
};

Gcontroller.prototype.getViewPos = function() {
    return this.camera.position;
};

Gcontroller.prototype.rotateCamAboutX = function(delta) {
    this.cameraType == "THIRD" ? this.camera.rotateX(delta) : this.camera.changePitch(delta);
};

Gcontroller.prototype.rotateCamAboutY = function (delta) {
    this.cameraType == "THIRD" ? this.camera.rotateY(delta) : this.camera.changeYaw(delta);
};

Gcontroller.prototype.changeCamType = function() {
    if (this.cameraType == "FIRST") {
        this.camera = new ThirdPersonCamera(this.camera.position, new Vector3([0, 0, 0]), new Vector3([0, 1, 0]));
        this.cameraType = "THIRD";
    }
    else {
        this.camera = new FirstPersonCamera(this.camera.position, new Vector3([0, 1, 0]), this.cameraVelocity);
        this.cameraType = "FIRST";
    }
};

Gcontroller.prototype.getViewMatrix = function() {
    return this.camera.getViewMatrix();
};

Gcontroller.prototype.moveCamera = function(x, y, z) {
    if (this.cameraType == "FIRST") this.camera.translateCam(x, y, z);
};

// Adds a drawObject to the list to be drawn.
Gcontroller.prototype.pushDrawObject = function(dObj) {
    dObj.giveCID(new Vector3(this.nextCID.elements));
    for (var i = 0; i < this.nextCID.elements.length; i++) {
        if (this.nextCID.elements[i] < 255) {
            this.nextCID.elements[i]++;
            break;
        }
    }
    this.drawObjects.push(dObj);
};

// Removes a drawObject from the list of drawable objects
Gcontroller.prototype.removeDrawObject = function(id) {
    var i;
    for (i = 0; i < this.drawObjects.length; i++) if (this.drawObjects[i].GUID == id) break;

    this.drawObjects.splice(i, 1);
};

// removes the last added drawObject
Gcontroller.prototype.popDrawObject = function() {
    this.drawObjects.pop();
};

// Adds a drawObject to the list to be drawn.
Gcontroller.prototype.setDirLight = function(dLight) {
    dLight.giveCID(this.nextCID);
    for (var i = 0; i < this.nextCID.elements.length; i++) {
        if (this.nextCID.elements[i] < 255) {
            this.nextCID.elements[i]++;
            break;
        }
    }
    this.directionalLight = dLight;
};

// Add a point light object to the graphics controller
Gcontroller.prototype.addPointLight = function(pLight) {
    pLight.giveCID(this.nextCID);
    for (var i = 0; i < this.nextCID.elements.length; i++) {
        if (this.nextCID.elements[i] < 255) {
            this.nextCID.elements[i]++;
            break;
        }
    }
    this.pointLights.push(pLight);
};

// Adds a shader to the graphics controller to be used
Gcontroller.prototype.addShader = function(shader) {
    if (this[shader.name] != undefined) return null;

    this[shader.name] = shader;
};

// removes a shader from the graphics controller
Gcontroller.prototype.removeShader = function(name) {
    this[name] = undefined;
};

// Returns the GUID of an object that was at the points X, Y
Gcontroller.prototype.findClicked = function(x, y) {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    for (var i = 0; i < this.drawObjects.length; i++) this.drawObjects[i].drawClicked(this);
    // Add more here when doing pointlights

    var pixels = new Uint8Array(4);
    this.gl.readPixels(x, y, 1, 1, this.gl.RGBA, this.gl.UNSIGNED_BYTE, pixels);
    var selectedColor = new Vector3([pixels[0], pixels[1], pixels[2]]);
    this.draw();

    for (var i = 0; i < this.drawObjects.length; i++) {
        if (selectedColor.elements[0] == this.drawObjects[i].CID.elements[0] &&
            selectedColor.elements[1] == this.drawObjects[i].CID.elements[1] &&
            selectedColor.elements[2] == this.drawObjects[i].CID.elements[2]) return this.drawObjects[i].GUID;
    }
    // Add more here for lights

    return null;
};

// Selects and object based on it's GUID
Gcontroller.prototype.select = function(id) {
    // If there is not object selected, find one and change the color
    if (this.selectedObject && this.selectedObject.GUID != id) this.selectedObject.deselect();
    if (!this.selectedObject || this.selectedObject.GUID != id) {
        // Find the correct element
        var i;
        for (i = 0; i < this.drawObjects.length; i++)
            if (this.drawObjects[i].GUID == id) this.selectedObject = this.drawObjects[i];
        this.selectedObject.select();
    }
};

// Deselects an object
Gcontroller.prototype.deselect = function() {
    if (this.selectedObject) this.selectedObject.deselect();
    this.selectedObject = null;
};

// Returns the selected draw object
Gcontroller.prototype.getSelected = function() {
    return this.selectedObject;
};

// Moves the selected object by X
Gcontroller.prototype.translateSelX = function(val) {
    this.selectedObject.element.transX(val);
};

// Moves the selected object by Y
Gcontroller.prototype.translateSelY = function(val) {
    this.selectedObject.element.transY(val);
};

// Moves the selected object by Z
Gcontroller.prototype.translateSelZ = function(val) {
    this.selectedObject.element.transZ(val);
};

// rotates the selected object by X
Gcontroller.prototype.rotateSelX = function(val) {
    this.selectedObject.element.rotX(val);
};

// rotates the selected object by Y
Gcontroller.prototype.rotateSelY = function(val) {
    this.selectedObject.element.rotY(val);
};

// rotates the selected object by Z
Gcontroller.prototype.rotateSelZ = function(val) {
    this.selectedObject.element.rotZ(val);
};

// scales the selected object by a value
Gcontroller.prototype.scaleSel = function(val) {
    this.selectedObject.element.changeScale(val);
};

// draws all visible objects in the scene
Gcontroller.prototype.draw = function() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    for (var i = 0; i < this.drawObjects.length; i++) this.drawObjects[i].draw(this);
};