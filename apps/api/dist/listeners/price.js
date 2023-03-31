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
const client_1 = require("@prisma/client");
const main = new client_1.PrismaClient();
const node_fetch_1 = __importDefault(require("node-fetch"));
const executor_1 = __importDefault(require("../executor"));
const tokens = {};
let started;
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!started) {
            started = true;
            checkPrices();
        }
        while (true) {
            console.log("CHECKING NEW PRICE TRIGGERS...");
            const triggers = yield main.safeTrigger.findMany({
                where: {
                    type: "PRICE",
                },
            });
            triggers.forEach((trigger) => {
                const tokenId = trigger.context.token;
                const triggerId = trigger.id;
                if (!tokens[tokenId]) {
                    tokens[tokenId] = [];
                }
                const isExisting = tokens[tokenId].some((t) => t.id === triggerId);
                if (!isExisting) {
                    console.log("ADDING TRIGGER", trigger);
                    tokens[tokenId].push({
                        id: triggerId,
                        price: trigger.context.price,
                        operator: "eq",
                        trigger: trigger,
                        action: {
                            safeAddress: trigger.safeAddress,
                            transactionId: trigger.transactionId,
                        },
                    });
                }
            });
            yield new Promise((resolve) => setTimeout(resolve, 10000)); // wait for 10 seconds before checking again
        }
    });
}
function checkPrices() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("CHECKING PRICES");
        const prices = yield (0, node_fetch_1.default)(`https://api.coingecko.com/api/v3/simple/price?ids=ethereum,${Object.keys(tokens).join(",")}&vs_currencies=usd`).then((data) => data.json());
        console.log(prices, tokens);
        Object.keys(tokens).forEach((item) => {
            console.log("CHECKING PRICE FOR", item);
            if (prices[item]) {
                const price = prices[item].usd;
                tokens[item].forEach((x) => {
                    console.log("CHECKING PRICE", x.price, price);
                    if (parseFloat(x.price) === parseFloat(price)) {
                        console.log("PRICE FOR", item, "IS", price, "EXECUTING");
                        executeTransaction(x);
                    }
                    else {
                        console.log("PRICE FOR", item, "IS", price, "not", x.price, "NOT EXECUTING");
                    }
                });
            }
            else {
                console.log("NO PRICE FOR", item);
            }
        });
        yield new Promise((resolve) => setTimeout(resolve, 20000));
        checkPrices();
    });
}
exports.default = start;
function executeTransaction(trigger) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("EXECUTING PRICE TRIGGER", trigger.id);
        executor_1.default.add(trigger);
    });
}
// execute({
//   safeAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
//   transactionId: "0",
// });
console.log("STARTING TIME TRIGGER");
