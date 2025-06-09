import { HttpException, HttpStatus } from '@nestjs/common';
import { extname } from 'path';

export const DRYFileName = (req, file, callback) => {
  const name = file.originalname.split('.')[0];
  const extension = extname(file.originalname);
  const randomName = Array(8)
    .fill(0)
    .map(() => Math.floor(Math.random() * 10).toString())
    .join('');
  callback(null, `${name}${randomName}${extension}`);
};

export const imageFileFilter = (req, file, callback) => {
  if (!file.originalname.match(/\.(jpg|jpeg|svg|png)$/)) {
    return callback(
      new HttpException(
        'Your file image is not allowed',
        HttpStatus.BAD_REQUEST,
      ),
      false,
    );
  }
  callback(null, true);
};
