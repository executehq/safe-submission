import { PrismaClient } from "@prisma/client";
const main = new PrismaClient();
import executor from "../executor";
const ids = new Set<string>();
const apps: any = {};

async function start() {
  console.log("STARTING TIME TRIGGER");
  const triggers = (
    await main.safeTrigger.findMany({
      where: {
        type: "TIMESTAMP",
      },
    })
  ).filter((trigger: any) => {
    if (ids.has(trigger.id)) {
      return false;
    } else {
      ids.add(trigger.id);
      apps[trigger.id] = trigger;
      return true;
    }
  });
  triggers.forEach((trigger: any) => {
    console.log("TRIGGER", trigger);
    console.log(parseInt((trigger.context as any).time));
    console.log(Date.now());
    if (parseInt((trigger.context as any).time) * 1000 > Date.now()) {
      console.log("SCHEDULING TIME TRIGGER", trigger.id);
      setTimeout(() => {
        executeTransaction(trigger);
      }, parseInt((trigger.context as any).time) * 1000 - Date.now());
    } else {
      console.log("EXECUTING TIME TRIGGER", trigger.id);
      // executeTransaction(trigger)
    }
  });
  await new Promise((resolve) => setTimeout(resolve, 5000));
  start();
}

export default start;

async function executeTransaction(trigger: any) {
  executor.add(trigger);
  console.log("EXECUTING TIME TRIGGER", trigger.id);
}
