import express from "express";
import cors from "cors";
import { z } from "zod";
import { createClient } from "redis";
import { generateId } from "./utils";
import simpleGit from "simple-git";
import { getAllFiles } from "./file";
import { uploadFiles } from "./aws";
import path from "path";

const publisher = createClient();
publisher.connect();
const app = express();
app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
  const Schema = z.object({
    url: z.string().min(3).max(400),
  });

  const parsedBody = Schema.safeParse(req.body);
  if (!parsedBody.success) {
    res.status(400).json({ message: "Invalid input" });
    return;
  }

  const url = parsedBody.data.url;
  const id = generateId();

  await simpleGit().clone(url, path.join(__dirname, `/output/${id}`));

  const files = getAllFiles(path.join(__dirname, `/output/${id}`));

  files.forEach(async (file) => {
    await uploadFiles(file.slice(__dirname.length + 1), file);
  });

  publisher.lPush("build-queue", id);

  res.status(200).json({ id: id, message: "Successfully Cloned Repository" });
});

app.listen(3000);
