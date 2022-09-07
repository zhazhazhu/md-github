import { CDN } from "~/cdn";
import { githubConfig, user } from "~/store";

export function downloadURLToCDN(
  url: string,
  type: keyof typeof CDN = "JSDELIVR"
) {
  return (
    CDN[type] +
    unref(user).login +
    "/" +
    unref(githubConfig).repo +
    "@master" +
    "/" +
    url
  );
}
