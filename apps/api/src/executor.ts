import { verifierContract, moduleContract } from "./contract";
class Executor {
  queue: any[];

  constructor() {
    this.queue = [];
  }

  async add(app: any) {
    this.queue.push(app);
  }

  async start() {
    while (true) {
      if (this.queue.length > 0) {
        const app = this.queue.shift();
        if (app.safeAddress) {
          app.action = {
            safeAddress: app.safeAddress,
            transactionId: app.transactionId,
          };
        }

        console.log(app.action?.safeAddress);
        console.log(app.action?.transactionId);

        const verificationId = await verifierContract.getNextVerificationId(
          app.action?.safeAddress
        );
        
        console.log("VERIFICATION ID", verificationId);
        console.log(
          "VERIFYING",
          app.action?.safeAddress,
          app.action?.transactionId
        );
        const verificationTx = await (
          await verifierContract
            .submit(app.action?.safeAddress, app.action?.transactionId)
            .catch((e: any) => {
              console.log("ERRRRRR", e, app.action?.safeAddress);
              process.exit();
            })
        ).wait(5);
        console.log("VERIFICATION TX", verificationTx);
        console.log(
          "EXECUTING",
          app.action?.safeAddress,
          app.action?.transactionId
        );

        const executionTx = await (
          await moduleContract.executeTransaction(
            app.action?.safeAddress,
            app.action?.transactionId,
            verificationId
          )
        ).wait();
        console.log("EXECUTION TX", executionTx);
      } else {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }
  }
}

const executor = new Executor();

export default executor;
