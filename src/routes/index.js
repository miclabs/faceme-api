const router = require("express").Router();

router.use("/fma", require("./people.routes"));

module.exports = router;