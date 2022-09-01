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
  const pathHistory = ref<string[]>(["/"]);

  //getters
  const getFile = computed(() => file.value);
  const getPathHistory = computed(() => pathHistory.value);
  const getPathToString = computed(() =>
    pathHistory.value.join().replace(",", "")
  );

  //actions
  function setFile(newFile: GithubFile) {
    file.value = newFile;
  }

  function pushPath(path: string) {
    pathHistory.value.push(path);
  }
  function popPath() {
    pathHistory.value.pop();
  }

  return {
    file,
    getFile,
    getPathHistory,
    getPathToString,
    setFile,
    pushPath,
    popPath,
  };
});
