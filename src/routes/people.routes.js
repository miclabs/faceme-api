const express = require("express");
const multer = require("multer");

const controller = require("../controllers/people.controller");

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage()
});

router.post(
  "/import_person",
  upload.fields([
    {
      name: "cover_image",
      maxCount: 1
    },
    {
      name: "snapshots",
      maxCount: 5
    }
  ]),
  controller.importPerson
);

module.exports = router;