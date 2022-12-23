const multer = require("multer");
let count = 0;
//Configuration for Multer
const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/Images");
  },
  filename: (req, file, cb) => {
    const ext = file.mimetype.split("/")[1];
    cb(null, `/${(file.fieldname, count++)}-${Date.now()}.${ext}`);
  },
});

// Multer Filter
// const multerFilter = (req, file, cb) => {
//     if (file.mimetype.split("/")[1] === "pdf") {
//       cb(null, true);
//     } else {
//       cb(new Error("Not a PDF File!!"), false);
//     }
//   };

module.exports.upload = multer({
  storage: multerStorage,
  // fileFilter: multerFilter,
});
