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
const executor_1 = __importDefault(require("../executor"));
const ids = new Set();
const apps = {};
function start() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("STARTING TIME TRIGGER");
        const triggers = (yield main.safeTrigger.findMany({
            where: {
                type: "TIMESTAMP",
            },
        })).filter((trigger) => {
            if (ids.has(trigger.id)) {
                return false;
            }
            else {
                ids.add(trigger.id);
                apps[trigger.id] = trigger;
                return true;
            }
        });
        triggers.forEach((trigger) => {
            console.log("TRIGGER", trigger);
            console.log(parseInt(trigger.context.time));
            console.log(Date.now());
            if (parseInt(trigger.context.time) * 1000 > Date.now()) {
                console.log("SCHEDULING TIME TRIGGER", trigger.id);
                setTimeout(() => {
                    executeTransaction(trigger);
                }, parseInt(trigger.context.time) * 1000 - Date.now());
            }
            else {
                console.log("EXECUTING TIME TRIGGER", trigger.id);
                // executeTransaction(trigger)
            }
        });
        yield new Promise((resolve) => setTimeout(resolve, 5000));
        start();
    });
}
exports.default = start;
function executeTransaction(trigger) {
    return __awaiter(this, void 0, void 0, function* () {
        executor_1.default.add(trigger);
        console.log("EXECUTING TIME TRIGGER", trigger.id);
    });
}
