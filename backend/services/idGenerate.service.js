function idGenerate(purpose) {

    const timestamp = Date.now();
    return purpose + "_" + timestamp.toString();
}

module.exports = idGenerate;