import multer from 'multer';

const storage = multer.memoryStorage();

const fileFilter = (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];

    if (!allowedTypes.includes(file.mimetype)) {
        return cb(new Error('Apenas arquivos PNG, JPG e JPEG são permitidos'));
    }

    cb(null, true);
};

export const lotImageUpload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024
    },
    fileFilter
}).single('image');
