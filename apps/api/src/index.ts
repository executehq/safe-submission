import express from "express";
import executor from "./executor";
import { PrismaClient } from "@prisma/client";
const main = new PrismaClient();
import time from "./listeners/time";
import chain from "./listeners/chain";
import price from "./listeners/price";
import cors from "cors";

const app = express();
app.use(express.json());
app.use(cors());

app.post("/create", async (req, res) => {
  const { type, safeAddress, transactionId, trigger } = req.body;
  const app = await main.safeTrigger.create({
    data: {
      safeAddress,
      type,
      context: trigger,
      transactionId,
      totalExecutions: 0,
    },
  });
  res.send(app.id);
});

app.listen(4444, () => {
  console.log("Listening on 4444");
  time();
  price();
  chain();
  executor.start();
});
