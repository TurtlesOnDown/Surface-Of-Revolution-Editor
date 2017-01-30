// By Spenser Riebs
// This file creates and uses shaders for use in webgl objects

// Takes in an html id and returns a single string containing the shaders code
function getShaderCode(id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3)
            str += k.textContent;
        k = k.nextSibling;
    }

    return str;
}

// Creates a shader object
// Takes in the name of the shader
// the code for the vertex and fragment shaders
// Takes the a function to call all the required attributes
function Shader(name, control, vshader, fshader) {
    this.name = name;
    this.program = createProgram(control.gl, vshader, fshader);

    var _this = this;
    this.use = function() { control.gl.useProgram(_this.program); };
}

// Gets the uniform locations of the Surface of Revolution object shader for a material
function SMaterial(shader, control, name) {
    this.color = control.gl.getUniformLocation(shader, name + '.color');
    this.shininess = control.gl.getUniformLocation(shader, name + '.shininess');
    this.specularOn = control.gl.getUniformLocation(shader, name + '.specularOn');
}

// Gets the uniform locations of the Surface of Revolution object shader for a direct light
function SDirLight(shader, control, name) {
    this.direction = control.gl.getUniformLocation(shader, name + '.direction');

    this.ambientColor = control.gl.getUniformLocation(shader, name + '.ambientColor');
    this.diffuseColor = control.gl.getUniformLocation(shader, name + '.diffuseColor');
    this.specularColor = control.gl.getUniformLocation(shader, name + '.specularColor');

    this.isOn = control.gl.getUniformLocation(shader, name + '.isOn');
}

// Gets the uniform locations of the Surface of Revolution object shader for a point light at index i
function SPointLight(shader, control, name, i) {
    this.position = control.gl.getUniformLocation(shader, name + '[' + i +'].position');

    this.ambientColor = control.gl.getUniformLocation(shader, name + '[' + i +'].ambientColor');
    this.diffuseColor = control.gl.getUniformLocation(shader, name + '[' + i +'].diffuseColor');
    this.specularColor = control.gl.getUniformLocation(shader, name + '[' + i +'].specularColor');

    this.isOn = control.gl.getUniformLocation(shader, name + '[' + i +'].isOn');
}