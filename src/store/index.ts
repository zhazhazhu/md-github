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
  const path = ref("/");

  //getters
  const getFile = computed(() => file.value);

  const getPath = computed(() => path.value);

  //actions
  function setFile(newFile: GithubFile) {
    file.value = newFile;
  }

  function pushPath(p: string) {
    path.value = "/".concat(p);
  }
  function popPath() {
    const arr = path.value.split("/");
    arr.pop();
    path.value = arr.join("/") || "/";
  }
  return {
    file,
    getFile,
    getPath,
    setFile,
    pushPath,
    popPath,
  };
});
