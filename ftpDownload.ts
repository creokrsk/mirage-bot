import * as fs from 'fs';
import * as path from 'path';
import { Client } from 'basic-ftp';

const ftpConfig = {
  host: 'father.mirage.ru',
  user: 'ftptime',
  password: 'yW6Vv_5iMz',
  port: 21,
};

export async function downloadAndReplaceFile(localFilePath: string) {
  const client = new Client();
  const { host, user, password, port } = ftpConfig;
  const remoteFileName = path.basename(localFilePath);
  const localFileDir = path.dirname(localFilePath);
  const tempLocalFilePath = path.join(localFileDir, `${remoteFileName}.tmp`);

  try {
    await client.access({ host, user, password, secure: false, port });
    const fileList = await client.list();
    console.log(fileList);

    await client.downloadTo(tempLocalFilePath, remoteFileName);

    fs.renameSync(tempLocalFilePath, localFilePath);
    console.log(`Файл ${remoteFileName} успешно загружен и заменен`);
  } catch (err) {
    console.error(`Ошибка при загрузке или замене файла ${remoteFileName}:`, err);
  } finally {
    client.close();
  }
}
