const ndConfig = require('nd-client-nodejs/config.js');
const fs = require('fs');

//const args=process.argv.splice(2);
//const help_arg=(args.length>0 && "help"===args[0]);

if (ndConfig.config_file_loaded) {
    console.log("Configuration was read from "+JSON.stringify(ndConfig.config_file)+".");
} else if (ndConfig.config_file) {
    console.log("No/invalid configuration file "+JSON.stringify(ndConfig.config_file)+".");
}

function missing_param(param) {
    return "MISSING! (use --nd-"+param.replace('_', '-')+"=VALUE parameter)";
}

console.log("dev_id      : "+(ndConfig.dev_id || missing_param("dev_id")));
console.log("dev_secret  : "+(ndConfig.dev_secret || missing_param("dev_secret")));
console.log("");

if (process.env.npm_config_nd_save_config && ndConfig.config_file && ndConfig.config_home) {
    console.log("");
    console.log("Saving configuration to "+JSON.stringify(ndConfig.config_file)+".");
    console.log("");
    if (!fs.existsSync(ndConfig.config_home)) {
        fs.mkdirSync(ndConfig.config_home);
    }
    if (fs.existsSync(ndConfig.config_home)) {
        const config=Object.assign({}, ndConfig, {
            config_home:undefined,
            config_file:undefined,
            config_file_loaded:undefined
        });
        const config_str=JSON.stringify(config, null, 4);
        console.log(config_str);
        fs.writeFileSync(ndConfig.config_file, config_str);
    }
} else {
    console.log("");
    console.log("Use --nd-save-config to update the configuration file "+JSON.stringify(ndConfig.config_file)+".");
    console.log("");
}

if (ndConfig.dev_id && ndConfig.dev_secret) { // configured
    console.log("npm run dev-server [--nd-user=USER]");
    console.log("npm run build [--nd-user=USER]");
}
