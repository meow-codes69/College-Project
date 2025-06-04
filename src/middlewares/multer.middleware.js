import multer from "multer"
import crypto from "crypto"
import path from "path"

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, './public/temp')
  },
  filename: function (_req, file, cb) {
    crypto.randomBytes(10, (_err, bytes) => {
        const fn = bytes.toString("hex") + path.extname(file.originalname)
        cb(null, fn)
    })
  }
})

export const upload = multer({ storage})