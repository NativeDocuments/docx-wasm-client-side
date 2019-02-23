const ndConfig = require('nd-client-nodejs/nodeConfig.js');
const fontpoolPackage = require('@nativedocuments/fontpool/package.json');
const docxwasmPackage = require('@nativedocuments/docx-wasm/package.json');
const fontpoolHASH=fontpoolPackage.version.split('-')[1].substring(1);
const docxwasmHASH=parseInt(docxwasmPackage.version.split('-')[1]).toString(16).toUpperCase();
const fontpoolURL=fontpoolHASH;
const docxwasmURL=docxwasmHASH;


module.exports={
    fontpoolHASH: fontpoolHASH,
    docxwasmHASH: docxwasmHASH,
    fontpoolURL: fontpoolURL,
    docxwasmURL: docxwasmURL,
    ndConfig: ndConfig,
    'process.env': Object.assign({
        'process.env.ND_FONTPOOL_VERSION': JSON.stringify(fontpoolHASH),
        'process.env.ND_DOCXWASM_VERSION': JSON.stringify(docxwasmHASH),
        'process.env.ND_FONTPOOL_BASE_URL': JSON.stringify("/"+fontpoolURL+"/"),
        'process.env.ND_DOCXWASM_BASE_URL': JSON.stringify("/"+docxwasmURL+"/")
    }, ndConfig)
};

//console.log(module.exports);
