const fs = require('fs');
const xml2js = require('xml2js');

const parser = new xml2js.Parser();
const xml = fs.readFileSync('./db/ВыгрузкаXML.XML', 'utf8');

const insertDataToPostgres = async (data) => {
  if (!data || !data['Выгрузка']) {
    console.error('Некорректная структура XML-файла');
    return;
  }

  const users = data['Выгрузка'];
  const usersArray = Object.keys(users).map((key) => users[key]);
  for (const user of usersArray) {
    const fio = user.ФИО[0].ФИО[0];
    const phoneNumber = user.НомерТелефона[0].НомерТелефона[0];
    const barcode = user.ШтрихКод[0].ШтрихКод[0];
    const workedHours = user.ОтработанныеЧасы[0].ОтработанныеЧасы[0];
    await client.query(
      'INSERT INTO users (fio, phone_number, barcode, worked_hours) VALUES ($1, $2, $3, $4)',
      [fio, phoneNumber, barcode, workedHours]
    );
  }
};

parser.parseString(xml, (err, result) => {
  if (err) {
    console.error(err);
  } else {
    const jsonData = result;
    console.log(jsonData);
    insertDataToPostgres(data);
  }
});

// const { Pool } = require('pg');

// const pool = new Pool({
//   user: 'myuser',
//   host: 'localhost',
//   database: 'mydatabase',
//   password: 'mypassword',
//   port: 5432,
// });

// pool.on('error', (err, client) => {
//   console.error('Unexpected error on idle client', err);
//   process.exit(-1);
// });

// const importData = async (jsonData) => {
//   try {
//     const client = await pool.connect();
//     try {
//       for (const elem of jsonData.myelement) {
//         const myfield1 = elem.myfield1[0];
//         const myfield2 = elem.myfield2[0];
//         await client.query(`INSERT INTO mytable (myfield1, myfield2) VALUES ($1, $2)`, [
//           myfield1,
//           myfield2,
//         ]);
//       }
//     } finally {
//       client.release();
//     }
//   } catch (err) {
//     console.error(err);
//   }
// };

// parser.parseString(xml, (err, result) => {
//   if (err) {
//     console.error(err);
//   } else {
//     const jsonData = result;
//     importData(jsonData);
//   }
// });
