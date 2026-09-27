const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
const pool = require("../config/db");

// Resumes are PDFs/Word docs, not images, so they're uploaded as Cloudinary
// "raw" resources, tucked into their own folder per project.
const CLOUDINARY_FOLDER = "interntrack/resumes";

// How long a generated download link stays valid. This — not just the
// signature — is what actually limits the damage of a leaked link: a
// signed URL with no expiry is just as reusable-forever as a public one,
// anyone holding it can use it. Short-lived is the point.
const DOWNLOAD_LINK_TTL_SECONDS = 5 * 60;

function uploadBufferToCloudinary(buffer, originalName) {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        resource_type: "raw",
        // "authenticated" (not the default "upload") means this file has no
        // public URL at all — every access, forever, must go through a
        // signed URL we generate server-side (see getDownloadUrl below).
        // Stronger than the "private" type, which only protects the
        // original and leaves any transformed/derived copies public.
        type: "authenticated",
        folder: CLOUDINARY_FOLDER,
        // Keep the original extension in the public_id so downloads/previews
        // still carry a sensible filename.
        public_id: `${Date.now()}-${Math.round(Math.random() * 1e9)}-${originalName}`,
        use_filename: true,
        unique_filename: false,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(uploadStream);
  });
}

function deleteFromCloudinary(publicId, accessType) {
  if (!publicId) return Promise.resolve();
  return cloudinary.uploader.destroy(publicId, {
    resource_type: "raw",
    type: accessType === "authenticated" ? "authenticated" : "upload",
  });
}

// Builds the URL the browser actually downloads from. Two branches because
// resumes uploaded before this feature existed are still stored under
// Cloudinary's public "upload" type — a resource's identity is tied to
// (public_id, resource_type, type) together, so a signed "authenticated"
// URL can't retroactively secure a file that was never uploaded that way.
// Those legacy rows would need deleting and re-uploading to gain the same
// protection; until then, this keeps them downloadable as before.
function getDownloadUrl(resume) {
  if (resume.access_type === "authenticated") {
    return cloudinary.utils.private_download_url(resume.cloudinary_id, "", {
      resource_type: "raw",
      type: "authenticated",
      expires_at: Math.floor(Date.now() / 1000) + DOWNLOAD_LINK_TTL_SECONDS,
      attachment: true,
    });
  }

  return cloudinary.url(resume.cloudinary_id, {
    resource_type: "raw",
    type: "upload",
    secure: true,
    flags: `attachment:${encodeURIComponent(resume.original_name)}`,
  });
}

async function list(userId, { page, limit } = {}) {
  // Same clamping as applications' list(): limit capped at 100 so a client
  // can't force an unbounded scan, page/limit always coerced to sane
  // positive integers even if the query string is garbage.
  const safeLimit = Math.min(Math.max(parseInt(limit, 10) || 10, 1), 100);
  const safePage = Math.max(parseInt(page, 10) || 1, 1);
  const offset = (safePage - 1) * safeLimit;

  const countResult = await pool.query("SELECT COUNT(*) FROM resumes WHERE user_id = $1", [userId]);
  const total = parseInt(countResult.rows[0].count, 10);

  const dataResult = await pool.query(
    "SELECT * FROM resumes WHERE user_id = $1 ORDER BY uploaded_at DESC LIMIT $2 OFFSET $3",
    [userId, safeLimit, offset]
  );

  return {
    data: dataResult.rows,
    pagination: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages: Math.ceil(total / safeLimit) || 1,
    },
  };
}

async function getById(userId, resumeId) {
  const result = await pool.query(
    "SELECT * FROM resumes WHERE id = $1 AND user_id = $2",
    [resumeId, userId]
  );
  return result.rows[0] || null;
}

async function create(userId, { label, originalName, buffer }) {
  const uploaded = await uploadBufferToCloudinary(buffer, originalName);

  const result = await pool.query(
    `INSERT INTO resumes (user_id, label, original_name, cloudinary_url, cloudinary_id, access_type)
     VALUES ($1, $2, $3, $4, $5, 'authenticated')
     RETURNING *`,
    [userId, label, originalName, uploaded.secure_url, uploaded.public_id]
  );
  return result.rows[0];
}

async function remove(userId, resumeId) {
  const resume = await getById(userId, resumeId);
  if (!resume) return false;

  await pool.query("DELETE FROM resumes WHERE id = $1 AND user_id = $2", [resumeId, userId]);
  await deleteFromCloudinary(resume.cloudinary_id, resume.access_type).catch(() => {}); // best-effort cloud cleanup
  return true;
}

module.exports = { list, getById, create, remove, getDownloadUrl };
