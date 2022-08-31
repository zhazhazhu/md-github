import { useStorage } from "@vueuse/core";
import type { GithubConfig, User } from "./types";

export const user = useStorage<User>("user", {} as User);

export const githubConfig = useStorage<GithubConfig>("github-config", {
  token: "",
  repo: null,
} as GithubConfig);
