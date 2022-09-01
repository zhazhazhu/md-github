import { useStorage } from "@vueuse/core";
import type { GithubConfig, GithubFile, User } from "./types";

export const user = useStorage<User>("user", {} as User);

export const githubConfig = useStorage<GithubConfig>("github-config", {
  token: "",
  repo: "",
} as GithubConfig);

export const useFileGlobalState = createGlobalState(() => {
  // state
  const file = ref<GithubFile | null>(null);

  //getters
  const getFile = computed(() => file.value);

  //actions
  function setFile(newFile: GithubFile) {
    file.value = newFile;
  }

  return { file, getFile, setFile };
});
