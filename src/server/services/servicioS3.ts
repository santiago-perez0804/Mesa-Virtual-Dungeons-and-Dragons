import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || ''
  }
});

const BUCKET_NAME = process.env.AWS_BUCKET_NAME || process.env.S3_BUCKET_NAME || 'tu-bucket-dnd';

export async function uploadToS3(filename: string, buffer: Buffer, mimetype: string, folder: string = 'misc'): Promise<string> {
  // Construye la ruta de la carpeta dentro del Bucket, forzando que esté dentro de 'public'
  const s3Path = `public/${folder}/${filename}`;
  
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: s3Path,
    Body: buffer,
    ContentType: mimetype
  });

  await s3Client.send(command);

  const region = process.env.AWS_REGION || 'us-east-1';
  return `https://${BUCKET_NAME}.s3.${region}.amazonaws.com/${s3Path}`;
}
