import { Inject, Injectable } from '@nestjs/common';
import { UploadApiResponse, UploadApiErrorResponse, v2 } from 'cloudinary';
import * as streamifier from 'streamifier';
import * as fs from 'node:fs';
import { CLOUDINARY } from './cloudinary.provider';

@Injectable()
export class CloudinaryService {
  constructor(@Inject(CLOUDINARY) private readonly cloudinary: typeof v2) {}

  async uploadImage(
    file: Express.Multer.File,
  ): Promise<UploadApiResponse | UploadApiErrorResponse> {
    return new Promise((resolve, reject) => {
      const resourceType = file?.mimetype?.startsWith('video') ? 'video' : 'auto';
      const uploadStream = this.cloudinary.uploader.upload_stream(
        { resource_type: resourceType },
        (error, result) => {
          if (error) return reject(error);
          if (!result) return reject(new Error('Cloudinary upload failed'));
          resolve(result);
        },
      );

      if (file?.buffer && file.buffer.length > 0) {
        streamifier.createReadStream(file.buffer).pipe(uploadStream);
        return;
      }

      if (file?.path) {
        fs.createReadStream(file.path).pipe(uploadStream);
        return;
      }

      reject(new Error('Uploaded file has no buffer or path'));
    });
  }
}
