
sh.Resources = sh.Obj.extend({
    init: function() {
        this.resourceCache = new Array(1000);
        this.readyCallbacks = [];
    },

    load: function(url /* , loader args */) {
        var args = Array.prototype.slice.call(arguments);

        if(this.resourceCache[url] === undefined) {
            var matches = url.match(/\.([^\.]*)$/);
            var ext = matches[1];
            this.resourceCache[url] = false;
            var loader;

            if(ext == 'mesh') {
                loader = this.loadMesh;
            }
            else {
                loader = this.loadImage;
            }

            loader.apply(this, args);
        }
    },

    onLoaded: function(url, obj) {
        this.resourceCache[url] = obj;

        if(this.isReady()) {
            this.readyCallbacks.forEach(function(func) {
                func();
            });
            this.readyCallbacks = [];
        }
    },

    onFailure: function(url) {
        console.log('failed to load resource: ' + url);
    },

    loadMesh: function(url, attribArrays) {
        var req = new XMLHttpRequest();
        var _this = this;

        req.onload = function() {
            if(req.status === 200 || req.status === 0) {
                var mesh = sh.util.decompressSimpleMesh(req.responseText,
                                                        attribArrays);
                _this.onLoaded(url, mesh);
            }
        };

        req.onerror = function(err) {
            _this.onFailure(url);
        };

        req.open('GET', url, true);
        req.send(null);
    },

    loadImage: function(url) {
        var img = new Image();
        var _this = this;

        img.onload = function() {
            _this.onLoaded(url, img);
        };
        img.onerror = function(err) {
            _this.onFailure(url);
        };

        img.src = url;
    },

    get: function(url) {
        return this.resourceCache[url];
    },

    isReady: function() {
        var ready = true;
        for(var k in this.resourceCache) {
            if(!this.resourceCache[k]) {
                ready = false;
            }
        }
        return ready;
    },

    onReady: function(func) {
        if(this.isReady()) {
            func();
        }
        else {
            this.readyCallbacks.push(func);
        }
    }
});