import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { Storage } from '@google-cloud/storage';
import { v4 as uuidv4 } from 'uuid';
import { extname } from 'path';

@Injectable()
export class GcsService {
  private storage: Storage;
  private bucketName = process.env.GCS_BUCKET_NAME;

  constructor() {
    this.storage = new Storage({
      projectId: process.env.GCS_PROJECT_ID,
      credentials: {
        client_email: process.env.GCS_CLIENT_EMAIL,
        private_key: process.env.GCS_PRIVATE_KEY.replace(/\\n/g, '\n'),
      },
    });
  }

  async uploadFile(file: Express.Multer.File, folder: string): Promise<string> {
    try {
      const bucket = this.storage.bucket(this.bucketName);

      const filename = `${folder}/${uuidv4()}${extname(file.originalname)}`;
      const fileUpload = bucket.file(filename);

      const stream = fileUpload.createWriteStream({
        metadata: {
          contentType: file.mimetype,
        },
      });

      stream.end(file.buffer);

      await new Promise((resolve, reject) => {
        stream.on('finish', resolve);
        stream.on('error', reject);
      });

      await fileUpload.makePublic();

      return `https://storage.googleapis.com/${this.bucketName}/${filename}`;
    } catch (error) {
      throw new InternalServerErrorException('Error uploading file to GCS');
    }
  }
}
