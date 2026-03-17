function idGenerate(purpose) {

    const timestamp = Date.now();
    return purpose.slice(0, 3) + "-" + timestamp.toString();
}

module.exports = idGenerate;