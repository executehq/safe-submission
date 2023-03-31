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
const web3_1 = __importDefault(require("web3"));
const RPC_ENDPOINT = "wss://eth-goerli.g.alchemy.com/v2/FlXXN3nULrloYrb9Lk5ZBlbqjkYa1KHm";
const web3 = new web3_1.default(RPC_ENDPOINT);
const client_1 = require("@prisma/client");
const main = new client_1.PrismaClient();
const executor_1 = __importDefault(require("../executor"));
let apps = [];
web3.eth.subscribe("newBlockHeaders", (err, result) => __awaiter(void 0, void 0, void 0, function* () {
    if (err) {
        console.log(err);
        return;
    }
    const { number } = result;
    const block = yield web3.eth
        .getBlock(number)
        .then((blockResults) => blockResults);
    const { transactions } = block;
    const txs = transactions.map((tx) => web3.eth.getTransactionReceipt(tx));
    const results = yield Promise.all(txs);
    const criteriaMatching = results.filter((tx) => {
        const { to, from, status, logs } = tx;
        return (apps.filter((app) => {
            const requiredScore = Object.keys(app).filter((x) => app[x] !== undefined &&
                (x === "to" || x === "from" || x === "status" || x === "topic")).length;
            let score = 0;
            if (app.to && to && to.toLowerCase() === app.to.toLowerCase()) {
                score++;
            }
            else {
            }
            if (app.from && from && from.toLowerCase() === app.from.toLowerCase()) {
                score++;
            }
            else {
            }
            if (app.status && status !== undefined && status === app.status) {
                score++;
            }
            else {
            }
            if (app.topic &&
                logs &&
                logs.filter((log) => {
                    const x = log.topics[0].toLowerCase() === app.topic.toLowerCase();
                    return x;
                }).length > 0) {
                score++;
            }
            else {
            }
            if (score > 0)
                console.log("Got score", score, "required score", requiredScore, "for app", app.id, "on tx", tx.transactionHash);
            if (score === requiredScore)
                executeAction(app, tx);
            return score === requiredScore;
        }).length > 0);
    });
}));
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        while (true) {
            apps = yield main.safeTrigger
                .findMany()
                .then((apps) => apps.filter((app) => app.type === "EVM_EVENT"))
                .then((apps) => apps.map((app) => {
                const { id, context, transactionId, safeAddress } = app;
                const { to, from, status, topic } = context;
                return {
                    id,
                    to,
                    from,
                    status,
                    topic,
                    action: {
                        safeAddress,
                        transactionId,
                    },
                };
            }));
            yield new Promise((resolve) => setTimeout(resolve, 10000));
        }
    });
}
exports.default = start;
const queue = [];
function executeAction(app, tx) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("EXECUTING ACTION FOR APP ID", app.id, "ON TRANSACTION", tx.transactionHash);
        executor_1.default.add(app);
    });
}
