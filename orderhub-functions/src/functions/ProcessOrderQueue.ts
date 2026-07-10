import { app, InvocationContext } from "@azure/functions";
import { updateOrderStatus } from "../db";

export async function ProcessOrderQueue(
  message: unknown,
  context: InvocationContext
): Promise<void> {

  const order = JSON.parse(message as string);

  context.log("Processing order", order);

  await updateOrderStatus(order.orderId);

  context.log(`Order ${order.orderId} updated to Processed`);
}

app.storageQueue("ProcessOrderQueue", {
  queueName: "order-processing",
  connection: "AzureWebJobsStorage",
  handler: ProcessOrderQueue,
});