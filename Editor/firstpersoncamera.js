// By Spenser Riebs
// First person camera meant to be used with gcontrol

function FirstPersonCamera(pos, worUp, speed) {
    this.position = pos;
    this.pitch = 0;
    this.yaw = -(Math.PI / 2);
    this.worldUp = worUp;
    this.updateVectors();
    this.velocity = speed;

}

FirstPersonCamera.prototype.translateCam = function(x, y, z) {
    this.position.elements[0] += (x * this.velocity);
    this.position.elements[1] += (y * this.velocity);
    this.position.elements[2] += (z * this.velocity);
};

FirstPersonCamera.prototype.changePosition = function(x, y, z) {
    this.position = new Vector3([x, y, z]);
};

// Rotate about the X-axis
FirstPersonCamera.prototype.changePitch = function(rotX) {
    this.pitch += rotX;
    this.updateVectors();
};

// Rotate about the Y-axis
FirstPersonCamera.prototype.changeYaw = function(rotY) {
    this.yaw += rotY;
    this.updateVectors();
};

// Returns the view matrix for the camera.
FirstPersonCamera.prototype.getViewMatrix = function() {
    var viewSpot = addVectors(this.position, this.front);
    return new Matrix4().setLookAt(this.position.elements[0], this.position.elements[1], this.position.elements[2],
        viewSpot.elements[0], viewSpot.elements[1], viewSpot.elements[2], this.up.elements[0], this.up.elements[1],
        this.up.elements[2]);
};

FirstPersonCamera.prototype.updateVectors = function() {
    this.front = new Vector3();
    this.front.elements[0] = Math.cos(this.yaw) * Math.cos(this.pitch);
    this.front.elements[1] = Math.sin(this.pitch);
    this.front.elements[2] = Math.sin(this.yaw) * Math.cos(this.pitch);
    this.front.normalize();
    this.right = crossProduct(this.front, this.worldUp).normalize();
    this.up = crossProduct(this.right, this.front).normalize();
};