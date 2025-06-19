"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
exports.getMessages = exports.updateMessageToManagement = exports.updateOfferToManagement = exports.updateUserTgId = exports.getName = exports.getUsers = exports.query = void 0;
var pg_1 = require("pg");
// if (process.env.VERSION === 'dev') {
//   const pool = new Pool({
//     user: 'creo',
//     host: 'localhost',
//     database: 'mirage',
//     password: '',
//     port: 5432,
//   });
// }
// if (process.env.VERSION === 'prod') {
//   const pool = new Pool({
//     user: 'mirage_bot',
//     host: 'localhost',
//     database: 'mirage',
//     password: 'password',
//     port: 5432,
//   });
// }
var commonConfig = {
    host: 'localhost',
    database: 'mirage',
    port: 5432,
};
var pool;
switch (process.env.VERSION) {
    case 'dev':
        pool = new pg_1.Pool(__assign({ user: 'creo', password: '' }, commonConfig));
        break;
    case 'prod':
        pool = new pg_1.Pool(__assign({ user: 'mirage_bot', password: 'password' }, commonConfig));
        break;
    default:
        console.error('Ошибка: process.env.VERSION не определен или имеет неверное значение.');
        pool = new pg_1.Pool(commonConfig);
        break;
}
var query = function (text, params) { return __awaiter(void 0, void 0, void 0, function () {
    var client, result, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, pool.connect()];
            case 1:
                client = _a.sent();
                _a.label = 2;
            case 2:
                _a.trys.push([2, 4, 5, 6]);
                return [4 /*yield*/, client.query(text, params)];
            case 3:
                result = _a.sent();
                return [2 /*return*/, result];
            case 4:
                error_1 = _a.sent();
                console.error('Ошибка выполнения запроса:', error_1);
                throw error_1;
            case 5:
                client.release();
                return [7 /*endfinally*/];
            case 6: return [2 /*return*/];
        }
    });
}); };
exports.query = query;
var getUsers = function () { return __awaiter(void 0, void 0, void 0, function () {
    var users;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, exports.query)('SELECT * FROM users')];
            case 1:
                users = _a.sent();
                return [2 /*return*/, users];
        }
    });
}); };
exports.getUsers = getUsers;
var getName = function (tgId) { return __awaiter(void 0, void 0, void 0, function () {
    var name;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log(tgId);
                return [4 /*yield*/, (0, exports.query)("SELECT name FROM users WHERE tg_id=".concat(tgId))];
            case 1:
                name = _a.sent();
                return [2 /*return*/, name];
        }
    });
}); };
exports.getName = getName;
var updateUserTgId = function (phoneNumber, tgId) { return __awaiter(void 0, void 0, void 0, function () {
    var result, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                return [4 /*yield*/, (0, exports.query)('UPDATE users SET tg_id = $1 WHERE phone_number = $2', [
                        tgId,
                        phoneNumber,
                    ])];
            case 1:
                result = _a.sent();
                if (result.rowCount === 1) {
                    console.log("tg_id \u043E\u0431\u043D\u043E\u0432\u043B\u0435\u043D \u0434\u043B\u044F \u043F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044F \u0441 phoneNumber: ".concat(phoneNumber));
                }
                else {
                    console.log("\u041F\u043E\u043B\u044C\u0437\u043E\u0432\u0430\u0442\u0435\u043B\u044C \u0441 phoneNumber: ".concat(phoneNumber, " \u043D\u0435 \u043D\u0430\u0439\u0434\u0435\u043D"));
                }
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Ошибка обновления tg_id:', error_2);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.updateUserTgId = updateUserTgId;
var updateOfferToManagement = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var formattedDate, error_3;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                formattedDate = data.date.toISOString().slice(0, 10);
                return [4 /*yield*/, (0, exports.query)("INSERT INTO offers (name, tgId, subdivision, ideastype, idea, date, checked) VALUES ($1, $2, $3, $4, $5, $6, $7)", [
                        data.name,
                        data.tgId,
                        data.subDivision,
                        data.ideasType,
                        data.idea,
                        formattedDate,
                        data.checked,
                    ])];
            case 1:
                _a.sent();
                console.log('Предложение успешно добавлено в базу данных');
                return [3 /*break*/, 3];
            case 2:
                error_3 = _a.sent();
                console.error('Ошибка при добавлении предложения в базу данных:', error_3);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.updateOfferToManagement = updateOfferToManagement;
var updateMessageToManagement = function (data) { return __awaiter(void 0, void 0, void 0, function () {
    var formattedDate, error_4;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                formattedDate = data.date.toISOString().slice(0, 10);
                return [4 /*yield*/, (0, exports.query)("INSERT INTO messages (name, tgId, destination, message, date, checked) VALUES ($1, $2, $3, $4, $5, $6)", [data.name, data.tgId, data.destination, data.message, formattedDate, data.checked])];
            case 1:
                _a.sent();
                console.log('Предложение успешно добавлено в базу данных');
                return [3 /*break*/, 3];
            case 2:
                error_4 = _a.sent();
                console.error('Ошибка при добавлении предложения в базу данных:', error_4);
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.updateMessageToManagement = updateMessageToManagement;
var getMessages = function (accesTag, tgId) { return __awaiter(void 0, void 0, void 0, function () {
    var messages, messages, messages, messages, messages, messages;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log(accesTag);
                console.log(tgId);
                if (!(accesTag === 'view-1')) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, exports.query)("SELECT name, subdivision, ideastype, idea, date, checked FROM offers")];
            case 1:
                messages = _a.sent();
                return [2 /*return*/, messages];
            case 2:
                if (!(accesTag === 'view-2')) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, exports.query)("SELECT name, message, date, destination FROM messages WHERE destination=$1", ['message-dir'])];
            case 3:
                messages = _a.sent();
                return [2 /*return*/, messages];
            case 4:
                if (!(accesTag === 'view-3')) return [3 /*break*/, 6];
                return [4 /*yield*/, (0, exports.query)("SELECT name, message, date, destination FROM messages WHERE destination=$1", ['message-founder'])];
            case 5:
                messages = _a.sent();
                return [2 /*return*/, messages];
            case 6:
                if (!(accesTag === 'view-4')) return [3 /*break*/, 8];
                return [4 /*yield*/, (0, exports.query)("SELECT name, message, date, destination FROM messages WHERE destination=$1", ['message-accountant'])];
            case 7:
                messages = _a.sent();
                return [2 /*return*/, messages];
            case 8:
                if (!(accesTag === 'view-5')) return [3 /*break*/, 10];
                return [4 /*yield*/, (0, exports.query)("SELECT name, subdivision, ideastype, idea, date, checked FROM offers WHERE tgId=$1", [tgId])];
            case 9:
                messages = _a.sent();
                return [2 /*return*/, messages];
            case 10:
                if (!(accesTag === 'view-6')) return [3 /*break*/, 12];
                return [4 /*yield*/, (0, exports.query)("SELECT name, message, date, destination FROM messages WHERE tgId=$1", [tgId])];
            case 11:
                messages = _a.sent();
                return [2 /*return*/, messages];
            case 12: 
            // const name = await query(`SELECT name FROM users WHERE tg_id=${tgId}`);
            // return name;
            return [2 /*return*/];
        }
    });
}); };
exports.getMessages = getMessages;
