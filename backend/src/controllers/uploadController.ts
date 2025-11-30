import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    cb(
      null,
      `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
    );
  },
});

function checkFileType(file: Express.Multer.File, cb: any) {
  const filetypes = /jpg|jpeg|png|mp4|mov|avi/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images and Videos only!');
  }
}

export const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

export const uploadFile = (req: Request, res: Response) => {
  if (req.file) {
    res.send(`/${req.file.path}`);
  } else {
    res.status(400).send('No file uploaded');
  }
};

export const uploadFiles = (req: Request, res: Response) => {
  if (req.files) {
    const files = req.files as Express.Multer.File[];
    const paths = files.map((file) => `/${file.path}`);
    res.send(paths);
  } else {
    res.status(400).send('No files uploaded');
  }
};

