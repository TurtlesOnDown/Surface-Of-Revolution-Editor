// By Spenser Riebs
// These objects are to be used with a graphics unit to represent lights

function DirectionalLight(dir, ambColor, difColor, specColor) {
    this.GUID = GUID;
    GUID++;

    this.direction = dir;
    this.ambientColor = ambColor;
    this.diffuseColor = difColor;
    this.specularColor = specColor;

    this.isOn = true;
}

DirectionalLight.prototype.addVisual = function(shader, elem) {
    this.shader = shader;
    this.element = elem;
};

DirectionalLight.prototype.giveCID = function(cid) {
    if (this.element != undefined) this.CID = cid;
};

DirectionalLight.prototype.draw = function(control) {
    if (this.element != undefined) {
        control[this.shader].use();
        this.element.draw(control.viewMatrix, control.projectionMatrix, control.viewPosition);
    }
};

DirectionalLight.prototype.flip = function() {
    if (this.isOn) this.isOn = false;
    else this.isOn = true;
};

function PointLight(pos, ambColor, difColor, specColor) {
    this.GUID = GUID;
    GUID++;

    this.position = pos;
    this.ambientColor = ambColor;
    this.diffuseColor = difColor;
    this.specularColor = specColor;

    this.isOn = true;
}

PointLight.prototype.addVisual = function(shader, elem) {
    this.shader = shader;
    this.element = elem;
};

PointLight.prototype.giveCID = function(cid) {
    if (this.element != undefined) this.CID = cid;
};

PointLight.prototype.draw = function(control) {
    if (this.element != undefined) {
        control[this.shader].use();
        this.element.draw(control.viewMatrix, control.projectionMatrix, control.viewPosition);
    }
};

PointLight.prototype.flip = function() {
    if (this.isOn) this.isOn = false;
    else this.isOn = true;
};