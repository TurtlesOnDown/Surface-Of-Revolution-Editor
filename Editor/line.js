// By Spenser Riebs
// Line Objects and all associated functions

// Creates an empty line to add points to, takes in a color
// If intending to draw the line, then make sure to add the shader for the line before
// Creating the line
function Line(control, color) {
    if (color == undefined) this.color = new Vector3([0, 0, 0]);
    else this.color = color;


    this.vertices = [];

    if (control != undefined) {
        this.control = control;
        this.vbuffer = control.gl.createBuffer();
        this.shaderName = "lineShader";

        this.a_Position = control.gl.getAttribLocation(control[this.shaderName].program, 'a_Position');

        this.u_color = control.gl.getUniformLocation(control[this.shaderName].program, 'u_Color');
        this.u_viewMat = control.gl.getUniformLocation(control[this.shaderName].program, 'u_ViewMatrix');
        this.u_projMat = control.gl.getUniformLocation(control[this.shaderName].program, 'u_ProjMatrix');
    }
}

Line.prototype.pushPoint = function(vert) {
    this.vertices.push(vert);

    if (this.control != undefined)updateArrayBuffer(vertex3ToFloat32(this.vertices), this.vbuffer, this.control);
};

Line.prototype.popPoint = function() {
    this.vertices.pop();

    if (this.control != undefined) updateArrayBuffer(vertex3ToFloat32(this.vertices), this.vbuffer, this.control);
};

Line.prototype.draw = function(control) {
    //Pass in viewpoint
    this.control.gl.uniformMatrix4fv(this.u_viewMat, false, control.viewMatrix.elements);
    this.control.gl.uniformMatrix4fv(this.u_projMat, false, control.projectionMatrix.elements);


    this.control.gl.uniform3fv(this.u_color, this.color.elements);

    this.control.gl.bindBuffer(this.control.gl.ARRAY_BUFFER, this.vbuffer);
    this.control.gl.vertexAttribPointer(this.a_Position, 3, this.control.gl.FLOAT, false, 0, 0);
    // Enable the assignment of the buffer object to the attribute variable
    this.control.gl.enableVertexAttribArray(this.a_Position);

    this.control.gl.drawArrays(this.control.gl.LINE_STRIP, 0, this.vertices.length);
    this.control.gl.drawArrays(this.control.gl.POINTS, 0, this.vertices.length);
    this.control.gl.bindBuffer(this.control.gl.ARRAY_BUFFER, null);
};