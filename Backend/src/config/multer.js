const multer = require("multer");
const path = require("path");

// Files are held in memory only, then streamed straight to Cloudinary —
// nothing touches local disk, so this works fine on ephemeral hosts too.
const storage = multer.memoryStorage();

const allowedTypes = [".pdf", ".doc", ".docx"];

function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) return cb(null, true);

  // A plain Error here isn't a multer.MulterError, so errorHandler.js's
  // dedicated multer branch won't catch it — without `.status`, it used to
  // fall through to the generic 500 "internal server error" and the real
  // reason ("wrong file type") never reached the user. Setting `.status`
  // routes it through the normal err.status branch instead, with the
  // actual message intact.
  const err = new Error("Only PDF and Word documents are allowed for resumes");
  err.status = 400;
  cb(err);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

module.exports = upload;
