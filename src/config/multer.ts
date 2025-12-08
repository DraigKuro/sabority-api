import multer from "multer";
import path from "path";
import fs from "fs";
import { S3Client, DeleteObjectCommand } from "@aws-sdk/client-s3";
import multerS3 from "multer-s3";

export type StorageType = 'local' | 'cloud';
export const STORAGE_TYPE = (process.env.STORAGE_TYPE || 'local') as StorageType;

const AWS_CONFIG = {
    id: process.env.AWS_ID,
    key: process.env.AWS_KEY,
    region: process.env.AWS_REGION,
    bucket: process.env.AWS_BUCKET
};

const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const localStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, "uploads/"),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname);
        const baseName = path.basename(file.originalname, ext);

        const safeName = baseName
            .toLowerCase()
            .replace(/\s+/g, "_")
            .replace(/[^a-z0-9_.-]/g, "");

        cb(null, `${safeName}_${Date.now()}${ext}`);
    },
});

let storage: multer.StorageEngine = localStorage;

if (STORAGE_TYPE === 'cloud') {
    if (!AWS_CONFIG.region) throw new Error('AWS_REGION is required for cloud storage');
    if (!AWS_CONFIG.id) throw new Error('AWS_ID is required for cloud storage');
    if (!AWS_CONFIG.key) throw new Error('AWS_KEY is required for cloud storage');
    if (!AWS_CONFIG.bucket) throw new Error('AWS_BUCKET is required for cloud storage');

    const s3 = new S3Client({
        region: AWS_CONFIG.region,
        credentials: {
            accessKeyId: AWS_CONFIG.id,
            secretAccessKey: AWS_CONFIG.key,
        },
    });

    storage = multerS3({
        s3,
        bucket: AWS_CONFIG.bucket,
        acl: "public-read",
        contentType: multerS3.DEFAULT_CONTENT_TYPE,
        key: (req, file, cb) => {
            const ext = path.extname(file.originalname);
            const baseName = path.basename(file.originalname, ext);
            const safeName = baseName
                .toLowerCase()
                .replace(/\s+/g, "_")
                .replace(/[^a-z0-9_.-]/g, "");
            cb(null, `${safeName}_${Date.now()}${ext}`);
        },
    });
}

export const upload = multer({ storage });

let s3Client: S3Client | null = null;
if (STORAGE_TYPE === 'cloud') {
    s3Client = new S3Client({
        region: AWS_CONFIG.region!,
        credentials: {
            accessKeyId: AWS_CONFIG.id!,
            secretAccessKey: AWS_CONFIG.key!,
        },
    });
}

export const deleteFile = async (fileUrl: string) => {
    if (!fileUrl) return;

    if (STORAGE_TYPE === "local") {
        const filePath = path.join(process.cwd(), "uploads", path.basename(fileUrl));
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
            console.log(`Archivo eliminado: ${filePath}`);
        }
        return;
    }

    if (!s3Client) {
        console.error("S3 client not initialized");
        return;
    }

    try {
        const key = fileUrl.split(".com/")[1];
        await s3Client.send(
            new DeleteObjectCommand({
                Bucket: AWS_CONFIG.bucket!,
                Key: key,
            })
        );
        console.log(`Archivo eliminado de S3: ${key}`);
    } catch (err) {
        console.error("Error eliminando archivo en S3:", err);
    }
};
