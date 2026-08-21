import { randomUUID } from "crypto";

export function createImagePath(
  userId: string,
  fileName: string
) {
  const extension =
    fileName.split(".").pop();

  return `${userId}/${randomUUID()}.${extension}`;
}