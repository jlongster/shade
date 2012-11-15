(function() {

    var shaders = {};
    var programs = {};

    function _loadShader(id) {
        var el = document.getElementById(id);
        if(!el) {
            return null;
        }

        var src = el.text;
        var type;

        if(el.type == 'x-shader/x-vertex') {
            type = gl.VERTEX_SHADER;
        }
        else if(el.type == 'x-shader/x-fragment') {
            type = gl.FRAGMENT_SHADER;
        }
        else {
            throw new Error('unknown shader type: ' + id);
        }

        var shader = gl.createShader(type);
        gl.shaderSource(shader, src);
        gl.compileShader(shader);

        var status = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
        if(!status) {
            var err = gl.getShaderInfoLog(shader);
            gl.deleteShader(shader);
            throw new Error('shader compilation error (' + id + '): ' + err);
        }

        shaders[id] = shader;
        return shader;
    }

    function getShader(id) {
        if(!shaders[id]) {
            _loadShader(id);
        }

        return shaders[id];
    }

    function createProgram(name, vertexShader, fragmentShader) {
        var program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);

        var status = gl.getProgramParameter(program, gl.LINK_STATUS);
        if(!status) {
            var err = gl.getProgramInfoLog(program);
            gl.deleteProgram(program);
            throw new Error('program linking error: ' + err);
        }

        programs[name]  = program;
        return program;
    }

    function getProgram(name) {
        return programs[name];
    }

    function iterPrograms(func) {
        for(var k in programs) {
            func(programs[k]);
        }
    }

    sh.Shaders = {
        getShader: getShader,
        createProgram: createProgram,
        getProgram: getProgram,
        iterPrograms: iterPrograms
    };

})();