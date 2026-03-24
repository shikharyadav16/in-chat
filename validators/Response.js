function response(status, msg="") {
    if (status) return { status: true }
    else return { status: true, message: msg };
}


module.exports =  response;