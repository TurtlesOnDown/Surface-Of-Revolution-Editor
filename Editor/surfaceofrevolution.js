// By Spenser Riebs
// Surfaceofrevolution object and all associated functions

function SurfaceOfRevolution(control, vertices, indices, color, UV) {
    if (color == undefined) this.color = new Vector3([0, 0, 0]);
    else this.color = color;
    this.control = control;

    this.smoothVerts = vertex3ToFloat32(vertices);
    this.smoothIndices = new Uint16Array(indices);
    this.smoothNormals = [];
    this.smoothUVs = UVtoFloat32(UV);

    this.flatVerts = [];
    this.flatIndices = [];
    this.flatNormals = [];
    this.flatUVs = [];

    var _this = this;
    function generateFlatShading() {
        for (var i = 0; i < indices.length; i += 3) {
            _this.flatVerts.push(vertices[indices[i]]);
            _this.flatVerts.push(vertices[indices[i+1]]);
            _this.flatVerts.push(vertices[indices[i+2]]);

            _this.flatUVs.push(UV[indices[i]]);
            _this.flatUVs.push(UV[indices[i+1]]);
            _this.flatUVs.push(UV[indices[i+2]]);

            _this.flatIndices.push(i);
            _this.flatIndices.push(i+1);
            _this.flatIndices.push(i+2);

            var norm = crossProduct(vectorFromPoints(vertices[indices[i+1]], vertices[indices[i]]),
                vectorFromPoints(vertices[indices[i+2]], vertices[indices[i]]));
            norm.normalize();
            _this.flatNormals.push(norm);
            _this.flatNormals.push(norm);
            _this.flatNormals.push(norm);
        }
        _this.flatVerts = vertex3ToFloat32(_this.flatVerts);
        _this.flatIndices = new Uint16Array(_this.flatIndices);
        _this.flatUVs = UVtoFloat32(_this.flatUVs);
    }
    generateFlatShading();

    function generateSmoothNormals() {
        for (var i = 0; i < vertices.length; i++) {
            _this.smoothNormals.push(new Vector3([0, 0, 0]));
        }

        for (var i = 0; i < indices.length; i++) {
            var norm = _this.flatNormals[i];
            _this.smoothNormals[indices[i]] = addVectors(_this.smoothNormals[indices[i]], norm);
        }

        for (var i = 0; i < _this.smoothNormals; i++) {
            _this.smoothNormals[i].normalize();
        }

        _this.smoothNormals = vertex3ToFloat32(_this.smoothNormals);
        _this.flatNormals = vertex3ToFloat32(_this.flatNormals);
    }
    generateSmoothNormals();

    this.shininess = 1;
    this.specularOn = false;
    this.x = 0;
    this.y = 0;
    this.z = 0;
    this.scale = 1;
    this.angleX = 0;
    this.angleY = 0;
    this.angleZ = 0;

    this.texture = control.gl.createTexture();
    control.gl.bindTexture(control.gl.TEXTURE_2D, this.texture);
    control.gl.texImage2D(control.gl.TEXTURE_2D, 0, control.gl.RGBA, 1, 1, 0, control.gl.RGBA, control.gl.UNSIGNED_BYTE,
        new Uint8Array([this.color.elements[0] * 255, this.color.elements[1] * 255, this.color.elements[2] * 255, 255]));

    this.vbuffer = control.gl.createBuffer();
    this.nbuffer = control.gl.createBuffer();
    this.uvbuffer = control.gl.createBuffer();
    this.elembuffer = control.gl.createBuffer();

    this.currentIndices = this.flatIndices;
    updateArrayBuffer(this.flatVerts, this.vbuffer, this.control);
    updateArrayBuffer(this.flatNormals, this.nbuffer, this.control);
    updateArrayBuffer(this.flatUVs, this.uvbuffer, this.control);
    updateElementArrayBuffer(this.currentIndices, this.elembuffer, this.control);

    this.shaderName = "SORShader";

    this.a_Position = control.gl.getAttribLocation(control[this.shaderName].program, 'a_Position');
    this.a_Normal = control.gl.getAttribLocation(control[this.shaderName].program, 'a_Normal');
    this.a_TexCoord = control.gl.getAttribLocation(control[this.shaderName].program, 'a_TexCoord');


    this.u_ViewMatrix = control.gl.getUniformLocation(control[this.shaderName].program, 'u_ViewMatrix');
    this.u_ProjMatrix = control.gl.getUniformLocation(control[this.shaderName].program, 'u_ProjMatrix');
    this.u_ModelMatrix = control.gl.getUniformLocation(control[this.shaderName].program, 'u_ModelMatrix');
    this.u_InverseTransposeModelMatrix = control.gl.getUniformLocation(control[this.shaderName].program, 'u_InverseTransposeModelMatrix');

    this.u_viewPosition = control.gl.getUniformLocation(control[this.shaderName].program, 'u_viewPosition');
    this.u_material = new SMaterial(control[this.shaderName].program, control, 'u_material');
    this.u_dirLight = new SDirLight(control[this.shaderName].program, control, 'u_dirLight');
    this.u_pointLights = [];
    for (var i = 0; i < 4; i++) this.u_pointLights.push(new SPointLight(control[this.shaderName].program, control, 'u_pointLights', i));

    this.u_clicked = control.gl.getUniformLocation(control[this.shaderName].program, 'u_clicked');
    this.u_clickColor = control.gl.getUniformLocation(control[this.shaderName].program, 'u_clickColor');
}

SurfaceOfRevolution.prototype.changeColor = function(color) {
    this.color = color;
    this.texture = this.control.gl.createTexture();
    this.control.gl.bindTexture(this.control.gl.TEXTURE_2D, this.texture);
    this.control.gl.texImage2D(this.control.gl.TEXTURE_2D, 0, this.control.gl.RGBA, 1, 1, 0, this.control.gl.RGBA, this.control.gl.UNSIGNED_BYTE,
        new Uint8Array([this.color.elements[0] * 255, this.color.elements[1] * 255, this.color.elements[2] * 255, 255]));
};

SurfaceOfRevolution.prototype.switchSpecular = function() {
    this.specularOn ? this.specularOn = false : this.specularOn = true;
};

SurfaceOfRevolution.prototype.changeShininess = function(value) {
    this.shininess = value;
};

SurfaceOfRevolution.prototype.flatShading = function() {
    this.currentIndices = this.flatIndices;
    updateArrayBuffer(this.flatVerts, this.vbuffer, this.control);
    updateArrayBuffer(this.flatNormals, this.nbuffer, this.control);
    updateArrayBuffer(this.flatUVs, this.uvbuffer, this.control);
    updateElementArrayBuffer(this.currentIndices, this.elembuffer, this.control);
};

SurfaceOfRevolution.prototype.gourandShading = function() {
    this.currentIndices = this.smoothIndices;
    updateArrayBuffer(this.smoothVerts, this.vbuffer, this.control);
    updateArrayBuffer(this.smoothNormals, this.nbuffer, this.control);
    updateArrayBuffer(this.smoothUVs, this.uvbuffer, this.control);
    updateElementArrayBuffer(this.currentIndices, this.elembuffer, this.control);
};

SurfaceOfRevolution.prototype.changeTexture = function(tex) {
    this.texture = tex;
};

SurfaceOfRevolution.prototype.transX = function(val) {
    this.x += val;
};

SurfaceOfRevolution.prototype.transY = function(val) {
    this.y += val;
};

SurfaceOfRevolution.prototype.transZ = function(val) {
    this.z += val;
};

SurfaceOfRevolution.prototype.rotX = function(val) {
    this.angleX += val;
};

SurfaceOfRevolution.prototype.rotY = function(val) {
    this.angleY += val;
};

SurfaceOfRevolution.prototype.rotZ = function(val) {
    this.angleZ += val;
};

SurfaceOfRevolution.prototype.changeScale = function(val) {
    this.scale *= val;
}

SurfaceOfRevolution.prototype.draw = function(control) {
    this.modelMatrix = new Matrix4();

    this.modelMatrix.setTranslate(this.x, this.y, this.z);
    this.modelMatrix.scale(this.scale, this.scale, this.scale);
    this.modelMatrix.rotate(this.angleX, 1, 0, 0);
    this.modelMatrix.rotate(this.angleY, 0, 1, 0);
    this.modelMatrix.rotate(this.angleZ, 0, 0, 1);

    this.inverseTransposeModelMatrix = new Matrix4().set(this.modelMatrix);
    this.inverseTransposeModelMatrix.invert();
    this.inverseTransposeModelMatrix.transpose();

    control.gl.useProgram(control[this.shaderName].program);

    control.gl.bindBuffer(control.gl.ARRAY_BUFFER, this.vbuffer);
    control.gl.vertexAttribPointer(this.a_Position, 3, control.gl.FLOAT, false, 0, 0);
    control.gl.enableVertexAttribArray(this.a_Position);

    control.gl.bindBuffer(control.gl.ARRAY_BUFFER, this.nbuffer);
    control.gl.vertexAttribPointer(this.a_Normal, 3, control.gl.FLOAT, false, 0, 0);
    control.gl.enableVertexAttribArray(this.a_Normal);

    control.gl.bindBuffer(control.gl.ARRAY_BUFFER, this.uvbuffer);
    control.gl.vertexAttribPointer(this.a_TexCoord, 2, control.gl.FLOAT, false, 0, 0);
    control.gl.enableVertexAttribArray(this.a_TexCoord);

    control.gl.uniformMatrix4fv(this.u_ViewMatrix, false, control.viewMatrix.elements);
    control.gl.uniformMatrix4fv(this.u_ProjMatrix, false, control.projectionMatrix.elements);
    control.gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.modelMatrix.elements);
    control.gl.uniformMatrix4fv(this.u_InverseTransposeModelMatrix, false, this.inverseTransposeModelMatrix.elements);

    control.gl.uniform3fv(this.u_viewPosition, control.viewPosition.elements);

    control.gl.bindTexture(control.gl.TEXTURE_2D, this.texture);
    control.gl.uniform1i(this.u_material.color, 0);
    control.gl.uniform1f(this.u_material.shininess, this.shininess);
    control.gl.uniform1f(this.u_material.specularOn, this.specularOn);

    if (control.directionalLight) {
        control.gl.uniform3fv(this.u_dirLight.direction, control.directionalLight.direction.elements);

        control.gl.uniform3fv(this.u_dirLight.ambientColor, control.directionalLight.ambientColor.elements);
        control.gl.uniform3fv(this.u_dirLight.diffuseColor, control.directionalLight.diffuseColor.elements);
        control.gl.uniform3fv(this.u_dirLight.specularColor, control.directionalLight.specularColor.elements);

        control.gl.uniform1f(this.u_dirLight.isOn, control.directionalLight.isOn);
    }

    control.gl.uniform1f(this.u_clicked, false);

    control.gl.bindBuffer(control.gl.ELEMENT_ARRAY_BUFFER, this.elembuffer);
    control.gl.drawElements(control.gl.TRIANGLES, this.currentIndices.length, control.gl.UNSIGNED_SHORT, 0);
    control.gl.bindBuffer(control.gl.ARRAY_BUFFER, null);


};

SurfaceOfRevolution.prototype.drawClicked = function(control, CID) {
    control.gl.useProgram(control[this.shaderName].program);

    control.gl.bindBuffer(control.gl.ARRAY_BUFFER, this.vbuffer);
    control.gl.vertexAttribPointer(this.a_Position, 3, control.gl.FLOAT, false, 0, 0);
    control.gl.enableVertexAttribArray(this.a_Position);

    control.gl.bindBuffer(control.gl.ARRAY_BUFFER, this.nbuffer);
    control.gl.vertexAttribPointer(this.a_Normal, 3, control.gl.FLOAT, false, 0, 0);
    control.gl.enableVertexAttribArray(this.a_Normal);

    control.gl.bindBuffer(control.gl.ARRAY_BUFFER, this.uvbuffer);
    control.gl.vertexAttribPointer(this.a_TexCoord, 2, control.gl.FLOAT, false, 0, 0);
    control.gl.enableVertexAttribArray(this.a_TexCoord);

    control.gl.uniformMatrix4fv(this.u_ViewMatrix, false, control.viewMatrix.elements);
    control.gl.uniformMatrix4fv(this.u_ProjMatrix, false, control.projectionMatrix.elements);
    control.gl.uniformMatrix4fv(this.u_ModelMatrix, false, this.modelMatrix.elements);
    control.gl.uniformMatrix4fv(this.u_InverseTransposeModelMatrix, false, this.inverseTransposeModelMatrix.elements);

    control.gl.uniform1f(this.u_clicked, true);
    control.gl.uniform3fv(this.u_clickColor, CID.elements);

    control.gl.bindBuffer(control.gl.ELEMENT_ARRAY_BUFFER, this.elembuffer);
    control.gl.drawElements(control.gl.TRIANGLES, this.currentIndices.length, control.gl.UNSIGNED_SHORT, 0);
    control.gl.bindBuffer(control.gl.ARRAY_BUFFER, null);
};
