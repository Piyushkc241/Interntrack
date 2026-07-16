// No ORM in this project (raw pg queries live in services/), so this file
// just centralizes the one enum-like value both application.service.js and
// the frontend status dropdown need to agree on.
const APPLICATION_STATUSES = ["applied", "interview", "offer", "rejected"];

module.exports = { APPLICATION_STATUSES };
