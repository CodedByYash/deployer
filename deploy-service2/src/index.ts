import { createClient, commandOptions } from "redis";
import { copyDistFolder, downloadS3Folder } from "./aws";
import { buildProject } from "./utils";

const subscriber = createClient();
subscriber.connect();
const publisher = createClient();
publisher.connect();

async function main() {
  while (true) {
    const response = await subscriber.brPop(
      commandOptions({ isolated: true }),
      "build-queue",
      0
    );

    // @ts-ignore
    const id: string = response.element;
    await downloadS3Folder(`output/${id}`);
    await buildProject(id);
    copyDistFolder(id);
    publisher.hSet("status", id, "deployed");
  }
}
