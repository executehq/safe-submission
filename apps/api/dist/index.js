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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const executor_1 = __importDefault(require("./executor"));
const client_1 = require("@prisma/client");
const main = new client_1.PrismaClient();
const time_1 = __importDefault(require("./listeners/time"));
const chain_1 = __importDefault(require("./listeners/chain"));
const price_1 = __importDefault(require("./listeners/price"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use((0, cors_1.default)());
app.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, safeAddress, transactionId, trigger } = req.body;
    const app = yield main.safeTrigger.create({
        data: {
            safeAddress,
            type,
            context: trigger,
            transactionId,
            totalExecutions: 0,
        },
    });
    res.send(app.id);
}));
app.listen(4444, () => {
    console.log("Listening on 4444");
    (0, time_1.default)();
    (0, price_1.default)();
    (0, chain_1.default)();
    executor_1.default.start();
});
