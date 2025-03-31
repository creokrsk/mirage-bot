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
exports.updateXMLData = void 0;
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
var updateUserOrInsert = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var client, users, _a, _b, _c, _i, userKey, user, name_1, phoneNumber, barcode, existsResult, workedHoursData, onlyFirstDay, _d, _e, _f, _g, dateKey, day, hours, err_1;
    var _h, _j, _k, _l, _m, _o, _p, _q, _r, _s;
    return __generator(this, function (_t) {
        switch (_t.label) {
            case 0:
                client = new pg_1.Client({
                    user: 'creo',
                    host: 'localhost',
                    database: 'mirage',
                    password: '',
                    port: 5432,
                });
                // CREATE TABLE users (
                //   user_n VARCHAR(255) PRIMARY KEY,
                //   name TEXT,
                //   phone_number TEXT,
                //   barcode TEXT
                // );
                // CREATE TABLE worked_hours (
                //   id SERIAL PRIMARY KEY,
                //   user_n VARCHAR(255) REFERENCES users(user_n),
                //   day INTEGER,
                //   hours NUMERIC
                // );
                //   ALTER TABLE worked_hours
                // ADD CONSTRAINT unique_user_day UNIQUE (user_n, day);
                return [4 /*yield*/, client.connect()];
            case 1:
                // CREATE TABLE users (
                //   user_n VARCHAR(255) PRIMARY KEY,
                //   name TEXT,
                //   phone_number TEXT,
                //   barcode TEXT
                // );
                // CREATE TABLE worked_hours (
                //   id SERIAL PRIMARY KEY,
                //   user_n VARCHAR(255) REFERENCES users(user_n),
                //   day INTEGER,
                //   hours NUMERIC
                // );
                //   ALTER TABLE worked_hours
                // ADD CONSTRAINT unique_user_day UNIQUE (user_n, day);
                _t.sent();
                _t.label = 2;
            case 2:
                _t.trys.push([2, 16, 17, 19]);
                users = data['Выгрузка'];
                _a = users;
                _b = [];
                for (_c in _a)
                    _b.push(_c);
                _i = 0;
                _t.label = 3;
            case 3:
                if (!(_i < _b.length)) return [3 /*break*/, 15];
                _c = _b[_i];
                if (!(_c in _a)) return [3 /*break*/, 14];
                userKey = _c;
                if (!users.hasOwnProperty(userKey)) return [3 /*break*/, 14];
                user = users[userKey][0];
                name_1 = ((_k = (_j = (_h = user.ФИО) === null || _h === void 0 ? void 0 : _h[0]) === null || _j === void 0 ? void 0 : _j.ФИО) === null || _k === void 0 ? void 0 : _k[0]) || null;
                phoneNumber = ((_o = (_m = (_l = user.НомерТелефона) === null || _l === void 0 ? void 0 : _l[0]) === null || _m === void 0 ? void 0 : _m.НомерТелефона) === null || _o === void 0 ? void 0 : _o[0]) || null;
                barcode = ((_r = (_q = (_p = user.ШтрихКод) === null || _p === void 0 ? void 0 : _p[0]) === null || _q === void 0 ? void 0 : _q.ШтрихКод) === null || _r === void 0 ? void 0 : _r[0]) || null;
                return [4 /*yield*/, client.query('SELECT 1 FROM users WHERE user_n = $1', [userKey])];
            case 4:
                existsResult = _t.sent();
                if (!(existsResult.rows.length > 0)) return [3 /*break*/, 6];
                return [4 /*yield*/, client.query('UPDATE users SET name = $1, phone_number = $2, barcode = $3 WHERE user_n = $4', [name_1, phoneNumber, barcode, userKey])];
            case 5:
                _t.sent();
                console.log("\u0414\u0430\u043D\u043D\u044B\u0435 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ".concat(userKey, " \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u044B"));
                return [3 /*break*/, 8];
            case 6: return [4 /*yield*/, client.query('INSERT INTO users (user_n, name, phone_number, barcode) VALUES ($1, $2, $3, $4)', [userKey, name_1, phoneNumber, barcode])];
            case 7:
                _t.sent();
                console.log("\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ".concat(userKey, " \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D"));
                _t.label = 8;
            case 8:
                workedHoursData = ((_s = user.ОтработанныеЧасы) === null || _s === void 0 ? void 0 : _s[0]) || null;
                if (!workedHoursData) return [3 /*break*/, 14];
                onlyFirstDay = Object.keys(workedHoursData).length === 1 && workedHoursData.hasOwnProperty('А01');
                if (!onlyFirstDay) return [3 /*break*/, 10];
                return [4 /*yield*/, client.query('DELETE FROM worked_hours WHERE user_n = $1', [userKey])];
            case 9:
                _t.sent();
                console.log("\u0422\u0430\u0431\u043B\u0438\u0446\u0430 worked_hours \u043E\u0431\u043D\u0443\u043B\u0435\u043D\u0430 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ".concat(userKey));
                _t.label = 10;
            case 10:
                _d = workedHoursData;
                _e = [];
                for (_f in _d)
                    _e.push(_f);
                _g = 0;
                _t.label = 11;
            case 11:
                if (!(_g < _e.length)) return [3 /*break*/, 14];
                _f = _e[_g];
                if (!(_f in _d)) return [3 /*break*/, 13];
                dateKey = _f;
                if (!(workedHoursData.hasOwnProperty(dateKey) && dateKey.startsWith('А'))) return [3 /*break*/, 13];
                day = parseInt(dateKey.substring(1));
                hours = parseFloat(workedHoursData[dateKey][0] || '0');
                return [4 /*yield*/, client.query('INSERT INTO worked_hours (user_n, day, hours) VALUES ($1, $2, $3) ON CONFLICT (user_n, day) DO UPDATE SET hours = $3', [userKey, day, hours])];
            case 12:
                _t.sent();
                _t.label = 13;
            case 13:
                _g++;
                return [3 /*break*/, 11];
            case 14:
                _i++;
                return [3 /*break*/, 3];
            case 15: return [3 /*break*/, 19];
            case 16:
                err_1 = _t.sent();
                console.error('Error:', err_1);
                return [3 /*break*/, 19];
            case 17: return [4 /*yield*/, client.end()];
            case 18:
                _t.sent();
                return [7 /*endfinally*/];
            case 19: return [2 /*return*/];
        }
    });
}); };
function updateXMLData(filePath) {
    if (filePath === void 0) { filePath = './db/ВыгрузкаXML.XML'; }
    return __awaiter(this, void 0, void 0, function () {
        var xmlData, err_2;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    _a.trys.push([0, 3, , 4]);
                    return [4 /*yield*/, parseXMLFile(filePath)];
                case 1:
                    xmlData = _a.sent();
                    return [4 /*yield*/, updateUserOrInsert(xmlData)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    err_2 = _a.sent();
                    console.error('Error during XML data update:', err_2);
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.updateXMLData = updateXMLData;
// export const importXMLData = async (filePath: string = './db/ВыгрузкаXML.XML') => {
//   try {
//     const xmlData = await parseXMLFile(filePath);
//     await insertDataToPostgres(xmlData);
//   } catch (err) {
//     console.error('Error during XML data import:', err);
//   }
// };
