import { createClient, commandOptions } from "redis";

const subscriber = createClient();
subscriber.connect();

async function main() {
  while (true) {
    const response = await subscriber.brPop(
      commandOptions({ isolated: true }),
      "build-queue",
      0
    );

    const id = response.element;

    await console.log(response);
  }
}
