
sh.CubeMesh = sh.Obj.extend({
    create: function() {
        this.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer);

        var vertices = [
            // front
            0, 0, 0,
            1, 0, 0,
            1, 1, 0,
            0, 1, 0,

            // left
            1, 0, 0,
            1, 0, 1,
            1, 1, 1,
            1, 1, 0,

            // right
            0, 0, 1,
            0, 0, 0,
            0, 1, 0,
            0, 1, 1,

            // back
            1, 0, 1,
            0, 0, 1,
            0, 1, 1,
            1, 1, 1,

            // top
            0, 1, 0,
            1, 1, 0,
            1, 1, 1,
            0, 1, 1,

            // bottom
            0, 0, 1,
            1, 0, 1,
            1, 0, 0,
            0, 0, 0
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

        // Normals

        this.normalBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);

        var normals = [
            // front
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,
            0, 0, -1,

            // left
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,
            1, 0, 0,

            // right
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,
            -1, 0, 0,

            // back
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,
            0, 0, 1,

            // top
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,
            0, 1, 0,

            // bottom
            0, -1, 0,
            0, -1, 0,
            0, -1, 0,
            0, -1, 0
        ];

        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
        
        // Indices

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        // 6 sides, 2 triangles each, 3 vertices each tri
        var indices = new Uint16Array(6*2*3);
        var idx = 0;

        for(var i=0; i<vertices.length; i+=4) {
            indices[idx++] = i;
            indices[idx++] = i+2;
            indices[idx++] = i+1;

            indices[idx++] = i;
            indices[idx++] = i+3;
            indices[idx++] = i+2;
        }

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        // Wireframe

        this.wireIndexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.wireIndexBuffer);

        var wireIndices = new Uint16Array(6*8);
        idx = 0;

        for(var i=0; i<vertices.length; i+=4) {
            wireIndices[idx++] = i;
            wireIndices[idx++] = i+1;

            wireIndices[idx++] = i+1;
            wireIndices[idx++] = i+2;

            wireIndices[idx++] = i+2;
            wireIndices[idx++] = i+3;

            wireIndices[idx++] = i+3;
            wireIndices[idx++] = i;
        }

        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, wireIndices, gl.STATIC_DRAW);
    },

    render: function(program, wireframe) {
        renderer.bindAndEnableBuffer(program, this.vertexBuffer, 'a_position');
        renderer.bindAndEnableBuffer(program, this.normalBuffer, 'a_normal');

        if(wireframe) {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.wireIndexBuffer);
            gl.drawElements(gl.LINES, 6*8, gl.UNSIGNED_SHORT, 0);
        }
        else {
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
            gl.drawElements(gl.TRIANGLES, 6*2*3, gl.UNSIGNED_SHORT, 0);
        }
    }
});

sh.Cube = sh.SceneNode.extend({
    init: function(pos, rot, scale, opts) {
        this.parent(pos, rot, scale);
        this.wireframe = opts && opts.wireframe;

        if(opts && opts.centered) {
            this.preMatrix = mat4.create();
            mat4.identity(this.preMatrix);
            mat4.translate(this.preMatrix, [-.5, -.5, -.5]);
        }
    },

    setMaterial: function(program) {
        if(!sh.Cube.mesh) {
            sh.Cube.mesh = new sh.CubeMesh();
            sh.Cube.mesh.create();
        }

        this.parent(program);
    },

    render: function() {
        sh.Cube.mesh.render(this.program, this.wireframe);

        // if(normalLocation != -1) {
        //     gl.disableVertexAttribArray(normalLocation);
        // }
    }
});
