import * as fs from 'fs';
import { Parser } from 'xml2js';
import { Client } from 'pg';

const parseXMLFile = (filePath: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    fs.readFile(filePath, (err, data) => {
      if (err) {
        return reject(err);
      }
      new Parser().parseString(data, (err, result) => {
        if (err) {
          return reject(err);
        }
        resolve(result);
      });
    });
  });
};

// const insertDataToPostgres = async (data: any) => {
//   const client = new Client({
//     user: 'creo',
//     host: 'localhost',
//     database: 'mirage',
//     password: '',
//     port: 5432,
//   });

//   await client.connect();

//   try {
//     const users = data['Выгрузка'];
//     for (const userKey in users) {
//       if (users.hasOwnProperty(userKey)) {
//         const user = users[userKey][0];
//         const name = user.ФИО?.[0]?.ФИО?.[0] || null;
//         const phoneNumber = user.НомерТелефона?.[0]?.НомерТелефона?.[0] || null;
//         const barcode = user.ШтрихКод?.[0]?.ШтрихКод?.[0] || null;
//         const hoursWorked = user.ОтработанныеЧасы?.[0]?.ОтработанныеЧасы?.[0] || null;

//         await client.query(
//           'INSERT INTO users (user_n, name, phone_number, barcode, hours_worked) VALUES ($1, $2, $3, $4, $5)',
//           [userKey, name, phoneNumber, barcode, hoursWorked]
//         );
//       }
//     }
//     console.log('Data successfully inserted into PostgreSQL');
//   } catch (err) {
//     console.error('Error:', err);
//   } finally {
//     await client.end();
//   }
// };

const updateUserOrInsert = async (data: any) => {
  const client = new Client({
    user: 'creo',
    host: 'localhost',
    database: 'mirage',
    password: '',
    port: 5432,
  });

  await client.connect();

  try {
    const users = data['Выгрузка'];
    for (const userKey in users) {
      if (users.hasOwnProperty(userKey)) {
        const user = users[userKey][0];
        const name = user.ФИО?.[0]?.ФИО?.[0] || null;
        const phoneNumber = user.НомерТелефона?.[0]?.НомерТелефона?.[0] || null;
        const barcode = user.ШтрихКод?.[0]?.ШтрихКод?.[0] || null;
        const hoursWorked = user.ОтработанныеЧасы?.[0]?.ОтработанныеЧасы?.[0] || null;

        const existsResult = await client.query('SELECT 1 FROM users WHERE user_n = $1', [userKey]);

        if (existsResult.rows.length > 0) {
          await client.query(
            'UPDATE users SET name = $1, phone_number = $2, barcode = $3, hours_worked = $4 WHERE user_n = $5',
            [name, phoneNumber, barcode, hoursWorked, userKey]
          );
          console.log(`Данные пользователя ${userKey} обновлены`);
        } else {
          await client.query(
            'INSERT INTO users (user_n, name, phone_number, barcode, hours_worked) VALUES ($1, $2, $3, $4, $5)',
            [userKey, name, phoneNumber, barcode, hoursWorked]
          );
          console.log(`Пользователь ${userKey} добавлен`);
        }
      }
    }
  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.end();
  }
};

export async function updateXMLData(filePath: string = './db/ВыгрузкаXML.XML') {
  try {
    const xmlData = await parseXMLFile(filePath);
    await updateUserOrInsert(xmlData);
  } catch (err) {
    console.error('Error during XML data update:', err);
  }
}

// export const importXMLData = async (filePath: string = './db/ВыгрузкаXML.XML') => {
//   try {
//     const xmlData = await parseXMLFile(filePath);
//     await insertDataToPostgres(xmlData);
//   } catch (err) {
//     console.error('Error during XML data import:', err);
//   }
// };
