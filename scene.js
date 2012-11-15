(function() {

var SceneNode = sh.Obj.extend({
    init: function(pos, rot, scale) {
        // TODO: proper type checking
        if(pos && !pos.length) {
            var opts = pos;
            pos = opts.pos;
            rot = opts.rot;
            scale = opts.scale;

            if(opts.update) {
                this.update = opts.update;
            }

            if(opts.render) {
                this.render = opts.render;
            }
        }

        this.pos = pos || vec3.create([0, 0, 0]);
        this.rot = rot || vec3.create([0, 0, 0]);
        this.scale = scale || vec3.create([1, 1, 1]);
        this.transform = mat4.create();
        this.worldTransform = mat4.create();

        this.quat = quat4.fromAngleAxis.apply(null, rot || [0.0, [0.0, 0.0, 1.0]]);
        this.useQuat = false;

        this._scaleMatrix = mat4.create();
        mat4.identity(this._scaleMatrix);

        this._realTransform = mat4.create();

        this.children = [];
        this.program = sh.Shaders.getProgram('default');
        this._dirty = true;
        this._dirtyWorld = true;
        this.type = 'node';
    },

    setMaterial: function(program) {
        this.program = program;
        this.transformLoc = gl.getUniformLocation(program, "transform");
        this.normalLoc = gl.getUniformLocation(program, "normalMatrix");

        if(this.normalLoc === -1) {
            this.normalLoc = null;
        }
    },

    addObject: function(obj, inits) {
        if(typeof obj == 'function') {
            inits = inits || {};
            var o = new SceneNode(inits.pos, inits.rot, inits.scale);
            o.update = obj;
            obj = o;
        }

        obj._parent = this;
        this.children.push(obj);

        SceneNode.fireAdd(obj);
        return obj;
    },

    setPos: function(x, y, z) {
        this.pos[0] = x;
        this.pos[1] = y;
        this.pos[2] = z;
        this._dirty = true;
    },

    setRot: function(xOrQuat, y, z) {
        if(this.useQuat) {
            this.quat = xOrQuat;
        }
        else {
            this.rot[0] = xOrQuat;
            this.rot[1] = y;
            this.rot[2] = z;
        }
        this._dirty = true;
    },

    setScale: function(x, y, z) {
        this.scale[0] = x;
        this.scale[1] = y;
        this.scale[2] = z;
        this._dirty = true;
    },

    translate: function(x, y, z) {
        this.pos[0] += x;
        this.pos[1] += y;
        this.pos[2] += z;
        this._dirty = true;
    },

    translateX: function(v) {
        this.pos[0] += v;
        this._dirty = true;
    },

    translateY: function(v) {
        this.pos[1] += v;
        this._dirty = true;
    },

    translateZ: function(v) {
        this.pos[2] += v;
        this._dirty = true;
    },

    // rotate: function(angle, axis) {
        
    //     var rot = quat4.fromAngleAxis(angle, axis);
    //     quat4.multiply(this.rot, rot);
    //     this._dirty = true;
    // },

    rotateX: function(v) {
        if(this.useQuat) {
            quat4.rotateX(this.rot, v);
        }
        else {
            this.rot[0] += v;
        }
        this._dirty = true;
    },

    rotateY: function(v) {
        if(this.useQuat) {
            quat4.rotateY(this.rot, v);
        }
        else {
            this.rot[1] += v;
        }
        this._dirty = true;
    },

    rotateZ: function(v) {
        if(this.useQuat) {
            quat4.rotateZ(this.rot, v);
        }
        else {
            this.rot[2] += v;
        }
        this._dirty = true;
    },

    scale: function(x, y, z) {
        this.scale[0] += x;
        this.scale[1] += y;
        this.scale[2] += z;
        this._dirty = true;
    },

    scaleX: function(v) {
        this.scale[0] += v;
        this._dirty = true;
    },

    scaleY: function(v) {
        this.scale[1] += v;
        this._dirty = true;
    },

    scaleZ: function(v) {
        this.scale[2] += v;
        this._dirty = true;
    },

    traverse: function(func) {
        func(this);

        for(var i=0, l=this.children.length; i<l; i++) {
            this.children[i].traverse(func);
        }
    },

    needsWorldUpdate: function() {
        return this._dirty || this._dirtyWorld;
    },

    updateMatrices: function(force) {
        var parent = this._parent;

        if(this._dirty) {
            if(this.useQuat) {
                mat4.fromRotationTranslation(this.quat, this.pos, this.transform);
            }
            else {
                mat4.identity(this.transform);
                mat4.translate(this.transform, this.pos);
                mat4.rotateX(this.transform, this.rot[0]);
                mat4.rotateY(this.transform, this.rot[1]);
                mat4.rotateZ(this.transform, this.rot[2]);
                mat4.scale(this.transform, this.scale);
            }

            // if(this.scale[0] !== 1.0 &&
            //    this.scale[1] !== 1.0 &&
            //    this.scale[2] !== 1.0) {
            //     var scaleM = this._scaleMatrix;
            //     scaleM[0] = this.scale[0];
            //     scaleM[5] = this.scale[1];
            //     scaleM[10] = this.scale[2];
            //     mat4.multiply(this.transform, scaleM, this.transform);
            // }

            this._dirty = false;
            this._dirtyWorld = true;
        }

        if(this._dirtyWorld || force) {
            if(parent) {
                mat4.multiply(parent.worldTransform,
                              this.transform,
                              this.worldTransform);
            }
            else {
                mat4.set(this.transform, this.worldTransform);
            }

            if(this.preMatrix) {
                mat4.multiply(this.worldTransform,
                              this.preMatrix,
                              this._realTransform);
            }
            else {
                mat4.set(this.worldTransform, this._realTransform);
            }

            this._dirtyWorld = false;
        }
    },

    render: function() {
    },

    update: function() {
    }
});

SceneNode.onAdd = function(func) {
    if(!SceneNode._onAdd) {
        SceneNode._onAdd = [];
    }

    SceneNode._onAdd.push(func);
};

SceneNode.fireAdd = function(obj) {
    var _onAdd = SceneNode._onAdd;

    if(_onAdd) {
        for(var i=0, l=_onAdd.length; i<l; i++) {
            _onAdd[i](obj);
        }
    }
};

SceneNode.onRemove = function(func) {
    if(!SceneNode._onRemove) {
        SceneNode._onRemove = [];
    }

    SceneNode._onRemove.push(func);
};

SceneNode.fireRemove = function(obj) {
    var _onRemove = SceneNode._onRemove;

    if(_onRemove) {
        for(var i=0, l=_onRemove.length; i<l; i++) {
            _onRemove[i](obj);
        }
    }
};

sh.SceneNode = SceneNode;
})();