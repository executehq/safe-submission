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
Object.defineProperty(exports, "__esModule", { value: true });
const contract_1 = require("./contract");
class Executor {
    constructor() {
        this.queue = [];
    }
    add(app) {
        return __awaiter(this, void 0, void 0, function* () {
            this.queue.push(app);
        });
    }
    start() {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l;
        return __awaiter(this, void 0, void 0, function* () {
            while (true) {
                if (this.queue.length > 0) {
                    const app = this.queue.shift();
                    if (app.safeAddress) {
                        app.action = {
                            safeAddress: app.safeAddress,
                            transactionId: app.transactionId,
                        };
                    }
                    console.log((_a = app.action) === null || _a === void 0 ? void 0 : _a.safeAddress);
                    console.log((_b = app.action) === null || _b === void 0 ? void 0 : _b.transactionId);
                    const verificationId = yield contract_1.verifierContract.getNextVerificationId((_c = app.action) === null || _c === void 0 ? void 0 : _c.safeAddress);
                    console.log("VERIFICATION ID", verificationId);
                    console.log("VERIFYING", (_d = app.action) === null || _d === void 0 ? void 0 : _d.safeAddress, (_e = app.action) === null || _e === void 0 ? void 0 : _e.transactionId);
                    const verificationTx = yield (yield contract_1.verifierContract
                        .submit((_f = app.action) === null || _f === void 0 ? void 0 : _f.safeAddress, (_g = app.action) === null || _g === void 0 ? void 0 : _g.transactionId)
                        .catch((e) => {
                        var _a;
                        console.log("ERRRRRR", e, (_a = app.action) === null || _a === void 0 ? void 0 : _a.safeAddress);
                        process.exit();
                    })).wait(5);
                    console.log("VERIFICATION TX", verificationTx);
                    console.log("EXECUTING", (_h = app.action) === null || _h === void 0 ? void 0 : _h.safeAddress, (_j = app.action) === null || _j === void 0 ? void 0 : _j.transactionId);
                    const executionTx = yield (yield contract_1.moduleContract.executeTransaction((_k = app.action) === null || _k === void 0 ? void 0 : _k.safeAddress, (_l = app.action) === null || _l === void 0 ? void 0 : _l.transactionId, verificationId)).wait();
                    console.log("EXECUTION TX", executionTx);
                }
                else {
                    yield new Promise((resolve) => setTimeout(resolve, 1000));
                }
            }
        });
    }
}
const executor = new Executor();
exports.default = executor;
