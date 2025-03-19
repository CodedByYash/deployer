import { S3 } from "aws-sdk";
import path, { resolve } from "path";
import fs from "fs";

const s3 = new S3({
  accessKeyId: "",
  secretAccessKey: "",
  endpoint: "",
});

export async function downloadS3Folder(prefix: string) {
  const allFiles = await s3
    .listObjectsV2({ Bucket: "vercel", Prefix: prefix })
    .promise();

  const allPromises =
    allFiles.Contents?.map(async ({ Key }) => {
      if (!Key) {
        resolve("");
        return;
      }
      const finalPath = path.join(__dirname, Key);
      const outputFile = fs.createWriteStream(finalPath);
      const dirName = path.dirname(finalPath);
      if (!fs.existsSync(finalPath)) {
        fs.mkdirSync(dirName, { recursive: true });
      }
      s3.getObject({
        Bucket: "vercel",
        Key,
      })
        .createReadStream()
        .pipe(outputFile)
        .on("finish", () => {
          resolve("");
        });
    }) || [];
  console.log("awaiting");

  await Promise.all(allPromises.filter((x) => x !== undefined));
}

export function copyDistFolder(id: string) {
  const folderPath = path.join(__dirname, `/output/${id}`);
  const allFiles = getAllFiles(folderPath);
  allFiles.forEach((file) => {
    uploadFile(`/dist/${id}` + file.slice(folderPath.length + 1), file);
  });
}

const getAllFiles = (folderPath: string) => {
  let response: string[] = [];

  const allFileAndFolder = fs.readdirSync(folderPath);
  allFileAndFolder.forEach((file) => {
    const fullFilePath = path.join(folderPath, file);
    if (fs.statSync(fullFilePath).isDirectory()) {
      response = response.concat(getAllFiles(fullFilePath));
    } else {
      response.push(fullFilePath);
    }
  });
  return response;
};

const uploadFile = async (fileName: string, localFilePath: string) => {
  const fileContent = fs.readFileSync(localFilePath);
  const response = await s3
    .upload({
      Body: fileContent,
      Bucket: "vercel",
      Key: fileName,
    })
    .promise();
  console.log(response);
};
