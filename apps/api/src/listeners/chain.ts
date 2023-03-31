import Web3 from "web3";

const RPC_ENDPOINT =
  "wss://eth-goerli.g.alchemy.com/v2/FlXXN3nULrloYrb9Lk5ZBlbqjkYa1KHm";
const web3 = new Web3(RPC_ENDPOINT);
import { PrismaClient } from "@prisma/client";
const main = new PrismaClient();
import executor from "../executor";
interface Trigger {
  id: string;
  to?: string;
  from?: string;
  topic?: any;
  status?: boolean;
  action?: {
    safeAddress: string;
    transactionId: string;
  };
}
let apps: Trigger[] = [];

web3.eth.subscribe("newBlockHeaders", async (err, result) => {
  if (err) {
    console.log(err);
    return;
  }
  const { number } = result;
  const block = await web3.eth
    .getBlock(number)
    .then((blockResults) => blockResults);
  const { transactions } = block;
  const txs = transactions.map((tx) => web3.eth.getTransactionReceipt(tx));
  const results = await Promise.all(txs);
  const criteriaMatching = results.filter((tx) => {
    const { to, from, status, logs } = tx;
    return (
      apps.filter((app) => {
        const requiredScore = Object.keys(app).filter(
          (x) =>
            (app as any)[x] !== undefined &&
            (x === "to" || x === "from" || x === "status" || x === "topic")
        ).length;
        let score = 0;

        if (app.to && to && to.toLowerCase() === app.to.toLowerCase()) {
          score++;
        } else {
        }

        if (app.from && from && from.toLowerCase() === app.from.toLowerCase()) {
          score++;
        } else {
        }

        if (app.status && status !== undefined && status === app.status) {
          score++;
        } else {
        }

        if (
          app.topic &&
          logs &&
          logs.filter((log) => {
            const x = log.topics[0].toLowerCase() === app.topic.toLowerCase();

            return x;
          }).length > 0
        ) {
          score++;
        } else {
        }
        if (score > 0)
          console.log(
            "Got score",
            score,
            "required score",
            requiredScore,
            "for app",
            app.id,
            "on tx",
            tx.transactionHash
          );
        if (score === requiredScore) executeAction(app, tx);
        return score === requiredScore;
      }).length > 0
    );
  });
});

async function start() {
  while (true) {
    apps = await main.safeTrigger
      .findMany()
      .then((apps: any) => apps.filter((app: any) => app.type === "EVM_EVENT"))
      .then((apps: any) =>
        apps.map((app: any) => {
          const { id, context, transactionId, safeAddress } = app;
          const { to, from, status, topic } = context as any;
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
        })
      );

    await new Promise((resolve) => setTimeout(resolve, 10000));
  }
}
export default start;

const queue: any[] = [];

async function executeAction(app: Trigger, tx: any) {
  console.log(
    "EXECUTING ACTION FOR APP ID",
    app.id,
    "ON TRANSACTION",
    tx.transactionHash
  );
  executor.add(app);
}
