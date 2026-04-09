function getLocalDate(isoDate) {
    let indianDate = new Date(isoDate).toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });

    indianDate = indianDate.split(", ");

    return { date: indianDate[0], time: indianDate[1] }
}

module.exports = getLocalDate;