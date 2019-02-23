
const worker = new Worker("/worker.js");
worker.postMessage(["init", {
    ND_DEV_ID: process.env.ND_DEV_ID,    // goto https://developers.nativedocuments.com/ to get a dev-id/dev-secret
    ND_DEV_SECRET: process.env.ND_DEV_SECRET, // you can also set the credentials in the enviroment variables
    ND_LICENSE_URL: process.env.ND_LICENSE_URL,
    ND_MAX_STACK_SIZE_MB: process.env.ND_MAX_STACK_SIZE_MB || 5,          // this is the "small" config, so that it will run inside Android
    ND_MAX_HEAP_SIZE_MB: process.env.ND_MAX_HEAP_SIZE_MB || (256-5),      // this is the "small" config, so that it will run inside Android
    ND_MAX_STREAM_SIZE_MB: process.env.ND_MAX_STREAM_SIZE_MB || (128),    // this is the "small" config, so that it will run inside Android
    ND_MAX_SCRATCH_SIZE_MB: process.env.ND_MAX_SCRATCH_SIZE_MB || (128)   // this is the "small" config, so that it will run inside Android
}]);

const uploadForm="<form onsubmit=\"function(e){e.preventDefault();return false;}\">Drag or choose a Word Document: <input type=\"file\" onchange=\"this.dispatchEvent(new CustomEvent('docxDropped', {bubbles: true, detail:this.files}))\"></form>";
var ui={
    status: "Loading initial javascript...",
    setStatus:function(text, timer0) {
        ui.text=text;
        ui.timer0=timer0;
    },
    setProgress:null,
    timer0: null
};

worker.onmessage = function (msg) {
    switch (msg.data[0]) {
        case "error":
            console.error(msg.data);
            ui.setStatus(msg.data[1]+":"+msg.data[2]);
        break;
        case "init":
            console.log("init: "+msg.data[1]);
            switch (msg.data[1]) {
                case "resources":
                    ui.setStatus("Caching Resources...");
                    break;
                case "wasm":
                    ui.setStatus("Starting WASM...");
                    break;
                case "ready":
                    ui.setStatus(uploadForm);
                    break;
            }
        break;
        case "fetch":
            switch(msg.data[1]) {
                case "progress":
                    this.fetch[msg.data[2]]={
                        loaded:msg.data[3],
                        total:msg.data[4]||0
                    };
                break;
                case "done":
                    delete this.fetch[msg.data[2]];
                break;
            }
            if (ui.setProgress) {
                const progress=Object.keys(this.fetch).reduce(function(ret, url){
                    const item=this.fetch[url];
                    if (item.total>0 && undefined!==item.total) {  
                        ret.total+=item.total;
                    } else {
                        ret.total=undefined;
                    }
                    ret.loaded+=item.loaded;
                    ret.count++;
                    return ret;
                }.bind(this), {
                    count:0,
                    loaded:0,
                    total:0
                });
                if (progress.count>0) {
                    ui.setProgress(progress.loaded, progress.total);
                } else {
                    ui.setProgress(undefined, undefined);
                }
            }
            break;
        case "pdf":
            const data=msg.data[1];
            const blob = new Blob([data], {type: 'application/pdf'});
            var a = document.createElement("a");
            a.href = window.URL.createObjectURL(blob);
            a.download = "out.pdf";
            document.body.appendChild(a);  // Firefox needs this
            a.click(); 
            // Wait a bit for Firefox; though doesn't seem necessary in 65.0
            setTimeout(function(){
                document.body.removeChild(a);
                window.URL.revokeObjectURL(url);  
            }, 100);   
            ui.setStatus(uploadForm);
        break;
    }
}.bind({
    fetch: {

    }
});

window.addEventListener("docxDropped", function(event) {
    if (event && event.detail && event.detail.length>0) {
        var f = event.detail[0];
        console.log("FILE RECEIVED "+f.name+" "+f.size+" "+f.type);
        var reader = new FileReader();
        reader.onload = function() {  
            var dataBuffer = reader.result;
            worker.postMessage(["convertToPDF", dataBuffer], [dataBuffer]);
            ui.setStatus("Converting "+f.name+" to PDF...", new Date());
        }
        reader.readAsArrayBuffer(f);
    }
});

window.addEventListener("dragover", function(event) {
    event.preventDefault();
    return false;
});
window.addEventListener("drop", function(event) {
    event.preventDefault();
    var dt = event.dataTransfer;
    if (dt && dt.files) {
        this.dispatchEvent(new CustomEvent('docxDropped', {bubbles: true, detail:dt.files}));
    }  
    return false;
});

window.addEventListener("load", function() {
    ui.setProgress=function(loaded, total) {
        var text="";
        if (loaded) {
            text=text+"loaded "+loaded+" bytes";
            if (total) {
                text=text+" "+Math.round(loaded*100/total)+"%";
            }    
            console.log(text);
        } else if (total) {
            text=total;
        }
        this.innerHTML=text;
    }.bind(document.getElementById("progress"));
    ui.setStatus=function(text, timer0) {
        this.innerHTML=text;
        ui.timer0=timer0;
    }.bind(this.document.getElementById("status"));
    ui.setStatus(ui.status);
});

window.setInterval(function() {
    if (ui.timer0) {
        var delta_sec=Math.round((new Date()-ui.timer0)/1000);
        var delta_str=Math.floor(delta_sec/60)+"m "+(delta_sec%60)+"s";
        if (ui.setProgress) {
            ui.setProgress(null, delta_str);
        }
    }
}, 1000);
