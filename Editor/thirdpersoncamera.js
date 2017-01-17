// By Spenser Riebs
// Third person camera meant to be used with gcontrol

function ThirdPersonCamera(pos, vPoint, worUp) {
    this.position = pos;
    this.viewPoint = vPoint;
    this.rotationAboutX = 0;
    this.rotationAboutY = 0;
    this.worldUp = worUp;

    this.updateVectors();
}

ThirdPersonCamera.prototype.setViewSpot = function(x, y, z) {
    this.viewPoint = new Vector3([x, y, z]);
    this.rotationAboutX = 0;
    this.rotationAboutY = 0;
    this.updateVectors();
};

ThirdPersonCamera.prototype.changePosition = function(x, y, z) {
    this.position = new Vector3([x, y, z]);
    this.rotationAboutX = 0;
    this.rotationAboutY = 0;
    this.updateVectors();
};

// Rotate about the X-axis
ThirdPersonCamera.prototype.rotateX = function(rotX) {
    this.position = rotateX(rotX).multiplyVector3(this.position);
    this.updateVectors();
};

// Rotate about the Y-axis
ThirdPersonCamera.prototype.rotateY = function(rotY) {
    this.position = rotateY(rotY).multiplyVector3(this.position);
    this.updateVectors();
};

// Returns the view matrix for the camera.
ThirdPersonCamera.prototype.getViewMatrix = function() {
    var test = new Matrix4().setLookAt(this.position.elements[0], this.position.elements[1], this.position.elements[2],
        this.viewPoint.elements[0], this.viewPoint.elements[1], this.viewPoint.elements[2], this.up.elements[0],
        this.up.elements[1], this.up.elements[2]);
    return test;
};

ThirdPersonCamera.prototype.updateVectors = function() {
    this.front = vectorFromPoints(this.viewPoint, this.position).normalize();
    this.right = crossProduct(this.front, this.worldUp).normalize();
    this.up = crossProduct(this.right, this.front).normalize();
};