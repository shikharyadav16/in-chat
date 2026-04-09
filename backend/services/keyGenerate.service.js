const nacl = require("tweetnacl");
const util = require("tweetnacl-util");

function generateKey() {
    const keyPair = nacl.box.keyPair();
    const publicKey = util.encodeBase64(keyPair.publicKey);
    const privateKey = util.encodeBase64(keyPair.secretKey);

    return {
        publicKey,
        privateKey
    };
}

module.exports = generateKey;
