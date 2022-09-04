import { useStorage } from "@vueuse/core";
import type { GithubConfig, GithubFile, TabPane, User } from "./types";

export const user = useStorage<User>("user", {} as User);

export const githubConfig = useStorage<GithubConfig>("github-config", {
  token: "",
  repo: "",
} as GithubConfig);

export const useFileGlobalState = createGlobalState(() => {
  // state
  //文件路径
  const path = ref("/");
  //图片和文件列表
  const fileList = ref<GithubFile[]>([]);
  //tab
  const tabPanes = ref<TabPane[]>([]);

  const currentTab = ref<TabPane | null>(null);

  //getters
  const getPath = computed(() => path.value);

  const getFileList = computed(() => fileList.value);

  const getTabPanes = computed(() => tabPanes.value);

  const getCurrentTabPane = computed(() => currentTab.value);

  //actions
  function pushPath(p: string) {
    path.value = "/".concat(p);
  }
  function popPath() {
    const arr = path.value.split("/");
    arr.pop();
    path.value = arr.join("/") || "/";
  }

  function setFileList(files: GithubFile[]) {
    fileList.value = files;
  }

  function addTabPane(tabContent: TabPane) {
    tabPanes.value.push(tabContent);
  }

  function deleteTabPane(sha: string) {
    tabPanes.value.splice(
      tabPanes.value.findIndex((item) => item.sha === sha),
      1
    );
  }

  function setCurrentTabPane(path: string) {
    currentTab.value =
      getTabPanes.value.find((tab) => tab.path === path) || null;
    return currentTab.value;
  }

  return {
    getPath,
    getFileList,
    getTabPanes,
    getCurrentTabPane,
    tabPanes,
    pushPath,
    popPath,
    setFileList,
    addTabPane,
    deleteTabPane,
    setCurrentTabPane,
  };
});
