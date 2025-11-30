import multer from 'multer';
import { v4 as uuid } from 'uuid';
import { existsSync, mkdirSync } from 'fs';

// Ensure uploads directory exists
if (!existsSync('uploads')) {
  mkdirSync('uploads', { recursive: true });
}

const storage = multer.diskStorage({
   destination(req, file, callback) {
        callback(null, 'uploads/');
   },
   filename(req, file, callback) {
     const id = uuid();
     const extName = file.originalname.split('.').pop();
        callback(null, `${id}.${extName}`);
   },
});

export const singleUpload  = multer({ storage }).single('image');