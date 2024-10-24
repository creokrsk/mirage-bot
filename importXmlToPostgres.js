"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.importXMLData = void 0;
var fs = require("fs");
var xml2js_1 = require("xml2js");
var pg_1 = require("pg");
var parseXMLFile = function (filePath) {
    return new Promise(function (resolve, reject) {
        fs.readFile(filePath, function (err, data) {
            if (err) {
                return reject(err);
            }
            new xml2js_1.Parser().parseString(data, function (err, result) {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });
    });
};
// Функция для вставки данных в PostgreSQL
var insertDataToPostgres = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var client, users, _a, _b, _c, _i, userKey, user, name_1, phoneNumber, barcode, hoursWorked, err_1;
    var _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q;
    return __generator(this, function (_r) {
        switch (_r.label) {
            case 0:
                client = new pg_1.Client({
                    user: 'creo',
                    host: 'localhost',
                    database: 'mirage',
                    password: '',
                    port: 5432,
                });
                return [4 /*yield*/, client.connect()];
            case 1:
                _r.sent();
                _r.label = 2;
            case 2:
                _r.trys.push([2, 7, 8, 10]);
                users = data['Выгрузка'];
                _a = users;
                _b = [];
                for (_c in _a)
                    _b.push(_c);
                _i = 0;
                _r.label = 3;
            case 3:
                if (!(_i < _b.length)) return [3 /*break*/, 6];
                _c = _b[_i];
                if (!(_c in _a)) return [3 /*break*/, 5];
                userKey = _c;
                if (!users.hasOwnProperty(userKey)) return [3 /*break*/, 5];
                user = users[userKey][0];
                name_1 = ((_f = (_e = (_d = user.ФИО) === null || _d === void 0 ? void 0 : _d[0]) === null || _e === void 0 ? void 0 : _e.ФИО) === null || _f === void 0 ? void 0 : _f[0]) || null;
                phoneNumber = ((_j = (_h = (_g = user.НомерТелефона) === null || _g === void 0 ? void 0 : _g[0]) === null || _h === void 0 ? void 0 : _h.НомерТелефона) === null || _j === void 0 ? void 0 : _j[0]) || null;
                barcode = ((_m = (_l = (_k = user.ШтрихКод) === null || _k === void 0 ? void 0 : _k[0]) === null || _l === void 0 ? void 0 : _l.ШтрихКод) === null || _m === void 0 ? void 0 : _m[0]) || null;
                hoursWorked = ((_q = (_p = (_o = user.ОтработанныеЧасы) === null || _o === void 0 ? void 0 : _o[0]) === null || _p === void 0 ? void 0 : _p.ОтработанныеЧасы) === null || _q === void 0 ? void 0 : _q[0]) || null;
                return [4 /*yield*/, client.query('INSERT INTO users (user_n, name, phone_number, barcode, hours_worked) VALUES ($1, $2, $3, $4, $5)', [userKey, name_1, phoneNumber, barcode, hoursWorked])];
            case 4:
                _r.sent();
                _r.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 3];
            case 6:
                console.log('Data successfully inserted into PostgreSQL');
                return [3 /*break*/, 10];
            case 7:
                err_1 = _r.sent();
                console.error('Error:', err_1);
                return [3 /*break*/, 10];
            case 8: return [4 /*yield*/, client.end()];
            case 9:
                _r.sent();
                return [7 /*endfinally*/];
            case 10: return [2 /*return*/];
        }
    });
}); };
var importXMLData = function (filePath) {
    if (filePath === void 0) { filePath = './db/ВыгрузкаXML.XML'; }
    return __awaiter(void 0, void 0, void 0, function () {
        var xmlData, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, parseXMLFile(filePath)];
                case 1:
                    xmlData = _a.sent();
                    return [4 /*yield*/, insertDataToPostgres(xmlData)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    console.error('Error during XML data import:', err_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
};
exports.importXMLData = importXMLData;
// import * as fs from 'fs';
// import { Parser } from 'xml2js';
// import { Client } from 'pg';
//   const client = new Client({
//     user: 'creo',
//     host: 'localhost',
//     database: 'mirage',
//     password: '',
//     port: 5432,
//   });
//   client.connect();
//   const parseXMLFile = (filePath: string) => {
//     return new Promise((resolve, reject) => {
//       fs.readFile(filePath, (err, data) => {
//         if (err) {
//           return reject(err);
//         }
//         xml2js.parseString(data, (err, result) => {
//           if (err) {
//             return reject(err);
//           }
//           // console.log(result);
//           resolve(result);
//         });
//       });
//     });
//   };
//   const insertDataToPostgres = async (data) => {
//     const users = data['Выгрузка'];
//     for (const userKey in users) {
//       if (users.hasOwnProperty(userKey)) {
//         const user = users[userKey][0];
//         // console.log(user);
//         // console.log(userKey);
//         // console.log(users[userKey][0]);
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
//   };
//   const main = async () => {
//     console.log('111');
//     try {
//       console.log('2222');
//       const xmlData = await parseXMLFile('./db/ВыгрузкаXML.XML');
//       const users = xmlData;
//       console.log('33333');
//       // const users = xmlData;
//       // console.log(users);
//       await insertDataToPostgres(users);
//       console.log('Data successfully inserted into PostgreSQL');
//     } catch (err) {
//       console.error('Error:', err);
//     } finally {
//       client.end();
//     }
//   };
// main();
