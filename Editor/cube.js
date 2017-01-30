// By Spenser Riebs
// Cube object and all associated functions

function SurfaceOfRevolution(control, width, color) {
    if (color == undefined) this.color = new Vector3([0, 0, 0]);
    else this.color = color;
    this.control = control;

    var vertexMarker = Math.abs(width - (width/2));

    this.flatVerts = [ -vertexMarker, vertexMarker, -vertexMarker, //0
        -vertexMarker, -vertexMarker, -vertexMarker, // 1
        vertexMarker, vertexMarker, -vertexMarker, //2
        vertexMarker, -vertexMarker, -vertexMarker, //3
        vertexMarker, vertexMarker, vertexMarker, //4
        vertexMarker, -vertexMarker, vertexMarker, //5
        -vertexMarker, vertexMarker, vertexMarker, //6
        -vertexMarker, -vertexMarker, vertexMarker]; //7
    this.flatIndices = [0,1,2, 2,1,3, 2,3,4, 4,3,5, 4,5,6, 6,5,7, 6,7,0, 0,7,1];
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