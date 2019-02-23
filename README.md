# docx-wasm-client-side

## Description

docx to PDF conversion, entirely in the browser.  Reduce server loads, and even allow the client to work offline!

docx-wasm is a World first, production ready commercial grade solution for handling Microsoft Word documents in pure javascript + wasm, proudly brought to you by Native Documents.   PDF output is achieved using the Word compatible page layout we developed for our web-based document editing/viewing components (more information: https://nativedocuments.com).

docx-wasm-client-side executes this client-side in-browser (including on Android). 

## Installation

Get an ND\_DEV\_ID, ND\_DEV\_SECRET pair at https://developers.nativedocuments.com/

Configure your environment:
```
> npm install
> npm start --nd-dev-id="YOUR DEV ID" --nd-dev-secret="YOUR DEV SECRET" --nd-user=test --nd-save-config
```

For now, if you later find you want to run `npm install` again, please delete package-lock.json first.

### Convert a docx

Start the local server:
```
> npm run dev-server --nd-user=test
```

Visit http://localhost:8080 using a recent Chrome or Firefox.

This is our first release for demo purposes.  iOS support is a known issue (let us know if its a priority for you). 


### Untrusted Origins

TLDR: unless you use HTTPS, you can only access the server locally. This is a client-side restriction, for testing purposes you can configure Chrome or Firefox to allow access to an untrusted origin.   For example, chrome://flags/#unsafely-treat-insecure-origin-as-secure 

See further https://www.chromium.org/Home/chromium-security/deprecating-powerful-features-on-insecure-origins

### Registration

You'll need a ND\_DEV\_ID, ND\_DEV\_SECRET pair to use this module (or an ND\_LICENSE\_URL).   We have a generous free tier, you can get your keys at https://developers.nativedocuments.com/

An ND\_LICENSE\_URL is necessary for offline operation (since ND\_DEV\_ID, ND\_DEV\_SECRET pair does a periodic online check).  Please email us if you want to try ND\_LICENSE\_URL.  Note: fully offline operation is currently a TODO.

## Troubleshooting

If you are having trouble with the sample code, please check the error message.

* If no documents work and you see "browser too old" in Chrome, or a security error in Firefox, are you testing against an untrusted origin?  See above.

* If you see "conversion error", this means something is wrong with this particular document; see the console for more detail.

## Getting Help

If you continue to have problems, please ask a question on StackOverflow, using tags #docx-wasm, #node.js, #ms-word, and #pdf as appropriate.



