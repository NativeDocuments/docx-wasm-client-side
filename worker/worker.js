import "@babel/polyfill";
import * as docx from "@nativedocuments/docx-wasm";

const cacheNamePrefix = "@nativedocuments/";

function _loadResource(cache, name, resource) {
    return new Promise(function (resolve, reject) {
        const url = resource.base + name;
        cache.match(url).then(function(cacheResponse) {
            if (cacheResponse && cacheResponse.ok) {
                cacheResponse.arrayBuffer().then(function(arrayBuffer) {
                    resource.data=arrayBuffer;
                    resolve();
                }).catch(function(err) {
                    reject(err);
                });
            } else {
                self.postMessage(["fetch", "start", url, 0, 0]);
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function () {
                    if (this.readyState == 4) {
                        if (200 <= this.status && this.status <= 299) {
                            resource.data = this.response;
                            const cacheRequest = new Request(url);
                            const cacheResponseOptions = {
                                type: resource.type
                            }
                            const cacheResponse = new Response(this.response, cacheResponseOptions);
                            cache.put(cacheRequest, cacheResponse).then(function () {
                                resolve();
                            }).catch(function (err) {
                                reject(err);
                            });
                            self.postMessage(["fetch", "done", url, this.response.byteLength, this.response.byteLength]);
                        } else {
                            const msg="XMLHttpRequest(" + url + "): " + this.status + " " + this.statusText;
                            reject(new Error(msg));
                            self.postMessage(["fetch", "error", url, 0, msg]);
                        }
                    }
                };
                xhr.onprogress = function (ev) {
                    self.postMessage(["fetch", "progress", url, ev.loaded, ev.lengthComputable?ev.total:0]);
                };
                xhr.open("GET", url, true);
                xhr.responseType = "arraybuffer";                
                xhr.send();
            }
        }).catch(function(err) {
            reject(err);
        });
    });
}

function _loadResources(cacheName, resourceFiles) {
    return new Promise(function (resolve, reject) {    
        caches.open(cacheName).then(function (cache) {
            Promise.all(Object.keys(resourceFiles).map(function (name) {
                return _loadResource(cache, name, resourceFiles[name]);
            })).then(function () {
                resolve(resourceFiles);
            }).catch(function (err) {
                reject(err);
            })
        }).catch(function (err) {
            reject(err);
        })
    });
}


function loadResources() {
    return new Promise(function (resolve, reject) {
        caches.keys().then(function (cachedNames) {
            Promise.all(cachedNames.map(function (cachedName) {
                if (cachedName===cacheNamePrefix+process.env.ND_DOCXWASM_VERSION ||
                    cachedName===cacheNamePrefix+process.env.ND_FONTPOOL_VERSION) {
                    return null;
                } else {
                    return caches.delete(cachedName);
                }
            })).then(function () {
                Promise.all([
                    _loadResources(cacheNamePrefix + process.env.ND_DOCXWASM_VERSION, {
                        "noox_worker.wasm": { 
                            base: process.env.ND_DOCXWASM_BASE_URL, 
                            version: process.env.ND_DOCXWASM_VERSION, 
                            type: "application/wasm", 
                            data: null
                        }
                    }),
                    _loadResources(cacheNamePrefix + process.env.ND_FONTPOOL_VERSION, {
                        ".fontdata": { 
                            base: process.env.ND_FONTPOOL_BASE_URL, 
                            version: process.env.ND_FONTPOOL_VERSION, 
                            type: "application/octet-stream", 
                            data: null 
                        },
                        ".fontpool": { 
                            base: process.env.ND_FONTPOOL_BASE_URL, 
                            version: process.env.ND_FONTPOOL_VERSION, 
                            type: "application/octet-stream", data: null 
                        }
                    })
                ]).then(function(resources) {
                    const ndResources = {
                        "@nativedocuments/docx-wasm": Object.keys(resources[0]).reduce(function(ret, name) {
                            ret[name]=resources[0][name].data;
                            return ret;
                        }, {}),
                        "@nativedocuments/fontpool": function(filename) {
                            if (filename in this) {
                                return this[filename];
                            } else {
                                const url=process.env.ND_FONTPOOL_BASE_URL+filename;
                                self.postMessage(["fetch", "start", url, 0, 0]);
                                const req=new XMLHttpRequest();
                                req.onprogress = function (ev) {
                                    self.postMessage(["fetch", "progress", url, ev.loaded, ev.lengthComputable?ev.total:0]);
                                };
                                req.open("GET", url, false);
                                req.responseType = "arraybuffer";
                                req.send();
                                if (200<=req.status && req.status<=299 && req.response && req.response.byteLength) {
                                    this[filename]=req.response; // cache!
                                    self.postMessage(["fetch", "done", url, req.response.byteLength, req.response.byteLength]);
                                    return this[filename];
                                } else {
                                    const msg="XMLHttpRequest(" + url + "): " + this.status + " " + this.statusText;
                                    console.error(msg);
                                    self.postMessage(["fetch", "error", url, 0, msg]);
                                    return null;
                                }
                            }
                        }.bind(Object.keys(resources[1]).reduce(function(ret, name) {
                            ret[name]=resources[1][name].data;
                            return ret;
                        }, {}))
                    };
                   resolve(ndResources);
                }).catch(function(err) {
                    reject(err);
                });
            }).catch(function (err) {
                reject(err);
            });
        }).catch(function (err) {
            reject(err);
        });
    });
}

self.onmessage=function(msg) {
    if ("init"===msg.data[0]) {
        const initConfig=msg.data[1];

        if (!("caches" in self)) {
            self.postMessage(["error", "browser too old", "no HTML5 Cache API"]);
            // or Chrome untrusted origin 
            return;
        }
            
        self.postMessage(["init", "resources"]);
        loadResources().then(function (ndResources) {
            self.postMessage(["init", "wasm"]);
            docx.init(Object.assign(initConfig, {
                ENVIRONMENT: "WORKER", // required
                LAZY_INIT: false,
                ND_RESOURCES: ndResources,
                ND_EXTERNALS: {
                    "@nativedocuments/docx-wasm": process.env.ND_DOCXWASM_BASE_URL,
                    "@nativedocuments/fontpool": process.env.ND_FONTPOOL_BASE_URL
                }
            })).then(function(api) {
                self.postMessage(["init", "ready"]);
                self.onmessage=async function(msg) {
                    console.log("CMD: "+JSON.stringify(msg.data[0]));
                    try {
                        switch(msg.data[0]) {
                            case "convertToPDF":
                            const dataBuffer=msg.data[1];
                            console.log("FILE "+dataBuffer.byteLength);
                            const api=await docx.engine();
                            await api.load(new Uint8Array(dataBuffer, 0));
                            const exportBuffer=await api.exportPDF();
                            self.postMessage(["pdf", exportBuffer], [exportBuffer]);
                            await api.close();
                            break;
                        }
                    } catch(err) {
                        console.error(err);
                        self.postMessage(["error", "conversion error", JSON.stringify(err.toString())]);
                    }
                };
            }).catch(function(err) {
                console.error(err);
                self.postMessage(["error", "wasm initialization failed", JSON.stringify(err.toString())]);
            })
        }).catch(function (err) {
            console.error(err);
            // Firefox rejects with a SecurityError on untrusted origins ie those that aren't using HTTPS 
            self.postMessage(["error", "resources initialization failed", JSON.stringify(err.toString())]);
        });
    }
}