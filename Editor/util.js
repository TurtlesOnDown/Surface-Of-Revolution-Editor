// By Spenser Riebs
// These are useful untility functions for a surfaceofrevolution editor

// Updates the array buffer
function updateArrayBuffer(data, buffer, control) {
    control.gl.bindBuffer(control.gl.ARRAY_BUFFER, buffer);
    control.gl.bufferData(control.gl.ARRAY_BUFFER, new Float32Array(data), control.gl.STATIC_DRAW);
    control.gl.bindBuffer(control.gl.ARRAY_BUFFER, null);
}

// updates the element array buffer
function updateElementArrayBuffer(data, buffer, control) {
    control.gl.bindBuffer(control.gl.ELEMENT_ARRAY_BUFFER, buffer);
    control.gl.bufferData(control.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(data), control.gl.STATIC_DRAW);
    control.gl.bindBuffer(control.gl.ELEMENT_ARRAY_BUFFER, null);
}

// Turns a Vertex3 array into a float32 array
function vertex3ToFloat32(array) {
    var result = [];
    for (var i = 0; i < array.length; i++) {
        result.push(array[i].elements[0]);
        result.push(array[i].elements[1]);
        result.push(array[i].elements[2]);
    }
    return new Float32Array(result);
}

// converts an array of size 2 arrays into a Float32 array
function UVtoFloat32(array) {
    var result = [];
    for (var i = 0; i < array.length; i++) {
        result.push(array[i][0]);
        result.push(array[i][1]);
    }
    return new Float32Array(result);
}

/*
Rotation Functions
 */

// Creates rotation about the Y axis
function rotateY(theta) {
    var sn = Math.sin(theta);
    var cs = Math.cos(theta);
    var Matrix = new Matrix4();
    Matrix.elements =
        [cs,  0, sn, 0,
            0,   1, 0,  0,
            -sn, 0, cs, 0,
            0,   0, 0,  1];
    return Matrix;
}
// produces rotation matrix about x for some theta
function rotateX(theta) {
    var sn = Math.sin(theta);
    var cs = Math.cos(theta);
    var Matrix = new Matrix4();
    Matrix.elements =
        [1, 0,  0,   0,
            0, cs, -sn, 0,
            0, sn, cs,  0,
            0, 0,  0,   1];
    return Matrix;
}

// produces rotation matrix about z for some theta
function rotateZ(theta) {
    var sn = Math.sin(theta);
    var cs = Math.cos(theta);
    var Matrix = new Matrix4();
    Matrix.elements =
        [cs, -sn,  0,   0,
            sn, cs, 0, 0,
            0, 0, 1,  0,
            0, 0,  0,   1];
    return Matrix;
}

/*
Vector Math
 */

//takes two points, returns the vector between them
function vectorFromPoints(v1, v2) {
    var x = v1.elements[0] - v2.elements[0];
    var y = v1.elements[1] - v2.elements[1];
    var z = v1.elements[2] - v2.elements[2];
    return new Vector3([x, y, z])
}

//takes two vectors and creates a cross product
function crossProduct(v1, v2) {
    var x = v1.elements[1] * v2.elements[2] - v1.elements[2] * v2.elements[1];
    var y = v1.elements[2] * v2.elements[0] - v1.elements[0] * v2.elements[2];
    var z = v1.elements[0] * v2.elements[1] - v1.elements[1] * v2.elements[0];
    return new Vector3([x, y, z]);
}

// returns dot product of two vectors
function dotProduct(v1, v2) {
    var x = v1.elements[0] * v2.elements[0];
    var y = v1.elements[1] * v2.elements[1];
    var z = v1.elements[2] * v2.elements[2];
    return x + y + z;
}

//multiples a scalar by a vector3
function scalarVector3(s, v) {
    return new Vector3([s * v.elements[0], s * v.elements[1], s * v.elements[2]]);
}

//Add vectors
function addVectors(v1, v2) {
    var x = v1.elements[0] + v2.elements[0];
    var y = v1.elements[1] + v2.elements[1];
    var z = v1.elements[2] + v2.elements[2];
    return new Vector3([x, y, z])
}

/*
Vertex, Indice and UV Generation
 */

function generateVertices(line) {
    var delta = Math.PI / 18;
    var vertices = [];
    for (var theta = 0; theta < Math.PI * 2; theta += delta) {
        var rotateTheta = rotateY(-theta);
        for (var i = 0; i < line.vertices.length; i++) {
            var x = line.vertices[i].elements[0];
            var y = line.vertices[i].elements[1];
            var z = line.vertices[i].elements[2];
            var point = new Vector3([x, y, z]);
            var result = rotateTheta.multiplyVector3(point);
            vertices.push(result);

        }
    }
    return vertices;
}

// Creates an Nx2 array of UV coordinates for use by a surface of revolution object
function generateUVs(line) {
    var delta = Math.PI / 18;
    var UVS = [];
    var UVheightspacer = 1 / line.vertices.length;
    var UVwidth = 0;
    var angleSpacer = (Math.PI * 2) / delta;
    var UVwidthspacer = 1 / angleSpacer;
    for (var theta = 0; theta < Math.PI * 2; theta += delta) {
        var UVheight = 1;
        for (var i = 0; i < line.vertices.length; i++) {
            var point = [UVwidth, UVheight];
            UVheight -= UVheightspacer;
            if (UVheight < 0) UVheight = 0;

            UVS.push(point);
        }
        UVwidth += UVwidthspacer;
        if (UVwidth > 1) UVwidth = 1;
    }
    return UVS;
}

//Takes a Vertex List, and a Line's vertices
function generateIndices(line, vertices) {
    var indices = [];
    for (var i = 0; i < vertices.length; i += line.length) {
        for (var j = 0; j < line.length - 1; j++) {
            if (i == vertices.length - line.length) {
                indices.push(i + j);
                indices.push(0 + j + 1);
                indices.push(0 + j);

                indices.push(i + j);
                indices.push(i + j + 1);
                indices.push(0 + j + 1);
            }
            else {
                indices.push(i + j);
                indices.push((i + line.length) + (j + 1));
                indices.push((i + line.length) + j);

                indices.push(i + j);
                indices.push(i + j + 1);
                indices.push((i + line.length) + (j + 1));
            }
        }
    }
    return indices;
}