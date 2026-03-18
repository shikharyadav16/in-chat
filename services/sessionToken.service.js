const tokens = new Map()

function set(key, value) {
    tokens.set(key, value)
}

function get(key) {
    if (!key || !tokens.has(key)) {
        return null
    }
    return tokens.get(key)
}

module.exports = {
    set,
    get
}