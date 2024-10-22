// export function ReqTodb() {
const fs = require('fs');
const xml2js = require('xml2js');

const parser = new xml2js.Parser();
const xml = fs.readFileSync('./db/ВыгрузкаXML.XML', 'utf8');

parser.parseString(xml, (err, result) => {
  if (err) {
    console.error(err);
  } else {
    const jsonData = result;
    console.log(jsonData);
  }
});
// }
