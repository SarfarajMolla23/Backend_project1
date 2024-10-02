import multer from "multer";





const storage = multer.diskStorage({
  destination: function (req, file, cb) {

    cb(null, "./public/temp");
  },
  filename: function (req, file, cb) {

    cb(null, file.originalname);// we can add uniqued id into the name to give it some uniqueness.

    console.log(file);
  },
});

export const upload = multer({ storage, });


