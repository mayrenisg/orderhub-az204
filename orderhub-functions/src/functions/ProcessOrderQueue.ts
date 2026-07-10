import { app, InvocationContext } from "@azure/functions";
import { updateOrderStatus } from "../db";

export async function ProcessOrderQueue(
  message: { orderId: number },
  context: InvocationContext
): Promise<void> {

  context.log("Processing order", message);

  await updateOrderStatus(message.orderId);

  context.log(`Order ${message.orderId} updated to Processed`);
}

app.storageQueue("ProcessOrderQueue", {
  queueName: "order-processing",
  connection: "AzureWebJobsStorage",
  handler: ProcessOrderQueue,
});