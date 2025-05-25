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
    var client, users, _a, _b, _c, _i, userKey, user, name_1, phoneNumber, barcode, money, existsResult, workedHoursData, onlyFirstDay, _d, _e, _f, _g, dateKey, firstDateKey, _h, month, year, day, hours, err_1;
    var _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x;
    return __generator(this, function (_y) {
        switch (_y.label) {
            case 0:
                if (process.env.VERSION === 'dev') {
                    client = new pg_1.Client({
                        user: 'creo',
                        host: 'localhost',
                        database: 'mirage',
                        password: '',
                        port: 5432,
                    });
                }
                if (process.env.VERSION === 'prod') {
                    client = new pg_1.Client({
                        user: 'mirage_bot',
                        host: 'localhost',
                        database: 'mirage',
                        password: 'password',
                        port: 5432,
                    });
                }
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
                _y.sent();
                _y.label = 2;
            case 2:
                _y.trys.push([2, 16, 17, 19]);
                users = data['Выгрузка'];
                _a = users;
                _b = [];
                for (_c in _a)
                    _b.push(_c);
                _i = 0;
                _y.label = 3;
            case 3:
                if (!(_i < _b.length)) return [3 /*break*/, 15];
                _c = _b[_i];
                if (!(_c in _a)) return [3 /*break*/, 14];
                userKey = _c;
                if (!users.hasOwnProperty(userKey)) return [3 /*break*/, 14];
                user = users[userKey][0];
                name_1 = ((_l = (_k = (_j = user.ФИО) === null || _j === void 0 ? void 0 : _j[0]) === null || _k === void 0 ? void 0 : _k.ФИО) === null || _l === void 0 ? void 0 : _l[0]) || null;
                phoneNumber = ((_p = (_o = (_m = user.НомерТелефона) === null || _m === void 0 ? void 0 : _m[0]) === null || _o === void 0 ? void 0 : _o.НомерТелефона) === null || _p === void 0 ? void 0 : _p[0]) || null;
                barcode = ((_s = (_r = (_q = user.ШтрихКод) === null || _q === void 0 ? void 0 : _q[0]) === null || _r === void 0 ? void 0 : _r.ШтрихКод) === null || _s === void 0 ? void 0 : _s[0]) || null;
                money = ((_v = (_u = (_t = user.Баланс) === null || _t === void 0 ? void 0 : _t[0]) === null || _u === void 0 ? void 0 : _u.Остаток) === null || _v === void 0 ? void 0 : _v[0]) || null;
                return [4 /*yield*/, client.query('SELECT 1 FROM users WHERE user_n = $1', [userKey])];
            case 4:
                existsResult = _y.sent();
                if (!(existsResult.rows.length > 0)) return [3 /*break*/, 6];
                return [4 /*yield*/, client.query('UPDATE users SET name = $1, phone_number = $2, barcode = $3, money = $4 WHERE user_n = $5', [name_1, phoneNumber, barcode, money, userKey])];
            case 5:
                _y.sent();
                console.log("\u0414\u0430\u043D\u043D\u044B\u0435 \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ".concat(userKey, " \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D\u044B"));
                return [3 /*break*/, 8];
            case 6: return [4 /*yield*/, client.query('INSERT INTO users (user_n, name, phone_number, barcode, money) VALUES ($1, $2, $3, $4, $5)', [userKey, name_1, phoneNumber, barcode, money])];
            case 7:
                _y.sent();
                console.log("\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C ".concat(userKey, " \u0434\u043E\u0431\u0430\u0432\u043B\u0435\u043D"));
                _y.label = 8;
            case 8:
                workedHoursData = ((_w = user.ОтработанныеЧасы) === null || _w === void 0 ? void 0 : _w[0]) || null;
                if (!workedHoursData) return [3 /*break*/, 14];
                onlyFirstDay = Object.keys(workedHoursData).length === 1 && workedHoursData.hasOwnProperty('А01');
                if (!onlyFirstDay) return [3 /*break*/, 10];
                return [4 /*yield*/, client.query('DELETE FROM worked_hours WHERE user_n = $1', [userKey])];
            case 9:
                _y.sent();
                console.log("\u0422\u0430\u0431\u043B\u0438\u0446\u0430 worked_hours \u043E\u0431\u043D\u0443\u043B\u0435\u043D\u0430 \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F ".concat(userKey));
                _y.label = 10;
            case 10:
                _d = workedHoursData;
                _e = [];
                for (_f in _d)
                    _e.push(_f);
                _g = 0;
                _y.label = 11;
            case 11:
                if (!(_g < _e.length)) return [3 /*break*/, 14];
                _f = _e[_g];
                if (!(_f in _d)) return [3 /*break*/, 13];
                dateKey = _f;
                if (!(workedHoursData.hasOwnProperty(dateKey) && dateKey.startsWith('А'))) return [3 /*break*/, 13];
                firstDateKey = Object.keys(workedHoursData).find(function (key) { return key.startsWith('А'); });
                if (!firstDateKey) {
                    console.error('Неверный формат данных о рабочих часах:', workedHoursData);
                    return [3 /*break*/, 13];
                }
                _h = firstDateKey.substring(1).split('_').map(Number), month = _h[1], year = _h[2];
                day = new Date(year, month - 1, parseInt(dateKey.substring(1)));
                hours = parseFloat(((_x = workedHoursData[dateKey][0]) === null || _x === void 0 ? void 0 : _x.replace(',', '.')) || '0');
                return [4 /*yield*/, client.query(
                    // 'INSERT INTO worked_hours (user_n, day, hours) VALUES ($1, $2, $3) ON CONFLICT (user_n, day) DO UPDATE SET hours = $3',
                    // `INSERT INTO worked_hours (user_n, day, hours) VALUES ($1, $2, $3) ON CONFLICT ON CONSTRAINT unique_user_day DO UPDATE SET hours = excluded.hours`,
                    "INSERT INTO worked_hours (user_n, day, hours) VALUES ($1, $2, $3) ON CONFLICT ON CONSTRAINT unique_user_day DO UPDATE SET hours = $3", [userKey, day, hours])];
            case 12:
                _y.sent();
                _y.label = 13;
            case 13:
                _g++;
                return [3 /*break*/, 11];
            case 14:
                _i++;
                return [3 /*break*/, 3];
            case 15: return [3 /*break*/, 19];
            case 16:
                err_1 = _y.sent();
                console.error('Error:', err_1);
                return [3 /*break*/, 19];
            case 17: return [4 /*yield*/, client.end()];
            case 18:
                _y.sent();
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
