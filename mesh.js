
sh.Mesh = sh.SceneNode.extend({
    init: function(pos, rot, scale, url) {
        this.parent(pos, rot, scale);
        this.url = url;
        this.attribDesc = DEFAULT_ATTRIB_ARRAYS;
    },

    create: function(program) {
        var mesh = resources.get(this.url);
        program = program || getProgram('default');

        this.attribBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.attribBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, mesh[0], gl.STATIC_DRAW);

        this.indexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        //var indices = convertToWireframe(mesh[1]);
        var indices = mesh[1];
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);

        this.numIndices = indices.length;
        this.program = program;

        this.attribs = {};
        var numAttribs = gl.getProgramParameter(program, gl.ACTIVE_ATTRIBUTES);
        for(var i=0; i<numAttribs; i++) {
            var attrib = gl.getActiveAttrib(program, i);
            this.attribs[attrib.name] = gl.getAttribLocation(program,
                                                             attrib.name);
        }

        this.uniforms = {};
        var numUniforms = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for(var i=0; i<numUniforms; i++) {
            var uniform = gl.getActiveUniform(program, i);
            this.uniforms[uniform.name] = gl.getUniformLocation(program,
                                                                uniform.name);
        }
    },

    render: function() {
        gl.bindBuffer(gl.ARRAY_BUFFER, this.attribBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);

        for(var i=0; i<this.attribDesc.length; i++) {
            var desc = this.attribDesc[i];
            var loc = this.attribs[desc.name];

            if(loc !== undefined) {
                gl.enableVertexAttribArray(loc);

                // Assume float
                gl.vertexAttribPointer(loc, desc.size, gl.FLOAT,
                                       !!desc.normalized, 4*desc.stride,
                                       4*desc.offset);
            }
        }

        gl.drawElements(gl.TRIANGLES, this.numIndices, gl.UNSIGNED_SHORT, 0);
    }
});
