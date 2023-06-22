const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const uploadFiles = upload.array("files", 10);

module.exports = uploadFiles;
