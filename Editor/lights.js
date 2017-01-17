// By Spenser Riebs
// These objects are to be used with a graphics unit to represent lights

// Directional Light object
function DirectionalLight(dir, ambColor, difColor, specColor) {
    this.GUID = GUID;
    GUID++;

    this.direction = dir;
    this.ambientColor = ambColor;
    this.diffuseColor = difColor;
    this.specularColor = specColor;

    this.isOn = true;
}

// Adds a visual element to be drawn
DirectionalLight.prototype.addVisual = function(shader, elem) {
    this.shader = shader;
    this.element = elem;
};

// gives the light a color id to be clicked on
DirectionalLight.prototype.giveCID = function(cid) {
    if (this.element != undefined) this.CID = cid;
};

// Draws any visual element if it has one.
DirectionalLight.prototype.draw = function(control) {
    if (this.element != undefined) {
        control[this.shader].use();
        this.element.draw(control.viewMatrix, control.projectionMatrix, control.viewPosition);
    }
};

// Turns on or off the directional light
DirectionalLight.prototype.flip = function() {
    this.isOn ? this.isOn = false : this.isOn = true;
};

// Point Light object
function PointLight(pos, ambColor, difColor, specColor) {
    this.GUID = GUID;
    GUID++;

    this.position = pos;
    this.ambientColor = ambColor;
    this.diffuseColor = difColor;
    this.specularColor = specColor;

    this.isOn = true;
}

// Adds a visual element to be drawn
PointLight.prototype.addVisual = function(shader, elem) {
    this.shader = shader;
    this.element = elem;
};

// gives the light a color id to be clicked on
PointLight.prototype.giveCID = function(cid) {
    if (this.element != undefined) this.CID = cid;
};

// Draws any visual element if it has one.
PointLight.prototype.draw = function(control) {
    if (this.element != undefined) {
        control[this.shader].use();
        this.element.draw(control.viewMatrix, control.projectionMatrix, control.viewPosition);
    }
};

// Turns on or off the point light
PointLight.prototype.flip = function() {
    this.isOn ? this.isOn = false : this.isOn = true;
};