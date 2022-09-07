import { useBase64 } from "@vueuse/core";
import Compressor from "compressorjs";
import Base64 from "crypto-js/enc-base64";
import UTF8 from "crypto-js/enc-utf8";
import type { CompressFile } from "~/types";

export function encryptByBase64(cipherText: string) {
  return UTF8.parse(cipherText).toString(Base64);
}

export function decodeByBase64(cipherText: string) {
  return Base64.parse(cipherText).toString(UTF8);
}

export function createHash(hashLength) {
  return Array.from(Array(Number(hashLength) || 24), () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join("");
}

export function handleCompress(
  file: File,
  quality: number = 0.6
): PromiseLike<CompressFile> {
  return new Promise((resolve, reject) => {
    new Compressor(file, {
      quality,
      async success(result: File) {
        const { name, size, type } = result;
        const original_base64 = await useBase64(file).promise.value;
        const compress_base64 = await useBase64(result).promise.value;
        resolve({
          name: `${name.substring(0, file.name.lastIndexOf("."))}_${createHash(
            6
          )}`,
          original_size: file.size,
          compress_size: size,
          original_base64: original_base64,
          compress_base64: compress_base64,
          type,
          quality,
        });
      },
      error(err) {
        reject(err);
      },
    });
  });
}
