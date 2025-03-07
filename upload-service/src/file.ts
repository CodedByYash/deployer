import fs from "fs";
import path from "path";

export const getAllFiles = (FolderPath: string) => {
  let files: string[] = [];

  const allFileInFolder = fs.readdirSync(FolderPath);

  allFileInFolder.forEach((file) => {
    const fullFilepath = path.join(__dirname, file);
    if (fs.statSync(fullFilepath).isDirectory()) {
      files = files.concat(getAllFiles(fullFilepath));
    } else {
      files.push(fullFilepath);
    }
  });
  return files;
};
