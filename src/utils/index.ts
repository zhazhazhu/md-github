import Base64 from "crypto-js/enc-base64";
import UTF8 from "crypto-js/enc-utf8";

export function encryptByBase64(cipherText: string) {
  return UTF8.parse(cipherText).toString(Base64);
}

export function decodeByBase64(cipherText: string) {
  return Base64.parse(cipherText).toString(UTF8);
}
