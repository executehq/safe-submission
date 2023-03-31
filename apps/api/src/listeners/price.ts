import { PrismaClient } from "@prisma/client";
const main = new PrismaClient();
import fetch from "node-fetch";
import executor from "../executor";
const tokens: {
  [key: string]: {
    id: string;
    price: number;
    operator: "gt" | "lt" | "eq";
    trigger: any;
    action?: {
      safeAddress: string;
      transactionId: string;
    };
  }[];
} = {};
let started: boolean;
async function start() {
  if (!started) {
    started = true;
    checkPrices();
  }

  while (true) {
    console.log("CHECKING NEW PRICE TRIGGERS...");
    const triggers = await main.safeTrigger.findMany({
      where: {
        type: "PRICE",
      },
    });

    triggers.forEach((trigger: any) => {
      const tokenId = (trigger.context as any).token;
      const triggerId = trigger.id;

      if (!tokens[tokenId]) {
        tokens[tokenId] = [];
      }

      const isExisting = tokens[tokenId].some((t) => t.id === triggerId);

      if (!isExisting) {
        console.log("ADDING TRIGGER", trigger);
        tokens[tokenId].push({
          id: triggerId,
          price: (trigger.context as any).price,
          operator: "eq",
          trigger: trigger,
          action: {
            safeAddress: trigger.safeAddress,
            transactionId: trigger.transactionId,
          },
        });
      }
    });

    await new Promise((resolve) => setTimeout(resolve, 10000)); // wait for 10 seconds before checking again
  }
}

async function checkPrices() {
  console.log("CHECKING PRICES");
  const prices = await fetch(
    `https://api.coingecko.com/api/v3/simple/price?ids=ethereum,${Object.keys(
      tokens
    ).join(",")}&vs_currencies=usd`
  ).then((data) => data.json());
  console.log(prices, tokens);
  Object.keys(tokens).forEach((item) => {
    console.log("CHECKING PRICE FOR", item);
    if (prices[item]) {
      const price = prices[item].usd;
      tokens[item].forEach((x) => {
        console.log("CHECKING PRICE", x.price, price);
        if (parseFloat(x.price as any) === parseFloat(price)) {
          console.log("PRICE FOR", item, "IS", price, "EXECUTING");
          executeTransaction(x);
        } else {
          console.log("PRICE FOR", item, "IS", price, "not", x.price, "NOT EXECUTING");
        }
      });
    } else {
      console.log("NO PRICE FOR", item);
    }
  });
  await new Promise((resolve) => setTimeout(resolve, 20000));
  checkPrices();
}

export default start;

async function executeTransaction(trigger: any) {
  console.log("EXECUTING PRICE TRIGGER", trigger.id);
  executor.add(trigger);
}
// execute({
//   safeAddress: "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
//   transactionId: "0",
// });

console.log("STARTING TIME TRIGGER");
