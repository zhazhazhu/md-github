<script lang="ts" setup>
import { getFileListContentKey } from "~/event-bus";
import { githubApi, useGithubFetch } from "~/fetch";
import { githubConfig, user } from "~/store";
import { useLoadingService } from "../hooks/element";
import { useFileGlobalState } from "../store/index";
import type { GithubFile } from "../store/types";

const { getFile, getPathToString, pushPath, popPath, setFile } =
  useFileGlobalState();

const { on } = useEventBus(getFileListContentKey);

const mdPath = ["index.md", "README.md"];

const api = {
  GetContent(repo: string) {
    return useGithubFetch(
      githubApi +
        `/repos/${unref(user).login}/${repo}/contents${
          getPathToString.value
        }?t=${Date.now()}`
    )
      .get()
      .json<GithubFile[]>();
  },
};

const fileContainerRef = ref<HTMLElement>();

const content = ref<GithubFile[]>([]);

const dirContent = computed(() =>
  content.value?.filter((item) => item.type === "dir")
);

const mdContent = computed(() =>
  content.value?.filter(
    (item) => item.type === "file" && item.name.endsWith("md")
  )
);

const repo = githubConfig.value.repo;

async function onDirClick(p: string) {
  pushPath(p);
}

function onFileClick(md: GithubFile) {
  setFile(md);
}

function onReturnClick() {
  popPath();
}

watch(
  () => unref(githubConfig).repo,
  async (value) => {
    if (!value) return;
    const { data } = await api.GetContent(value);
    content.value = data.value || [];
  },
  {
    immediate: true,
  }
);

const { loading, open } = useLoadingService({
  target: fileContainerRef,
  text: "加载中...",
});

async function getContent() {
  open();
  const { data } = await api.GetContent(repo);
  content.value = data.value || [];
  loading.value?.close();
}

watchDebounced(
  getPathToString,
  async () => {
    getContent();
  },
  {
    debounce: 200,
  }
);

watch(mdContent, (val) => {
  if (val.length) {
    const current = val.find((item) => mdPath.includes(item.name)) || val[0];
    setFile(current);
  }
});

on(() => {
  getContent();
});
</script>

<template>
  <main class="w-100% color-gray-6 text-12px my10px" ref="fileContainerRef">
    <el-link
      class="my-10px m-l-30px"
      v-if="getPathToString !== '/'"
      @click="onReturnClick"
    >
      <div i-typcn-arrow-back></div>
      <span class="m-l-4px text-12px">返回上一级</span>
    </el-link>

    <div class="file-list">
      <template v-for="dir in dirContent">
        <div cursor-pointer class="file-item" @click="onDirClick(dir.name)">
          <span class="name">{{ dir.name }}</span>
        </div>
      </template>
    </div>

    <div class="file-list">
      <template v-for="md in mdContent">
        <div cursor-pointer class="file-item" @click="onFileClick(md)">
          <span class="name">{{ md.name }}</span>
          <span
            v-if="getFile?.sha === md.sha"
            class="w8px h8px bg-green b-rd-100% m-l-10px"
          ></span>
        </div>
      </template>
    </div>
  </main>
</template>

<style lang="less" scoped>
.file-list {
  display: flex;
  align-items: center;
  flex-direction: column;
}
.file-item {
  height: 40px;
  width: 100px;
  border-radius: 8px;
  line-height: 40px;
  padding: 0 30px;
  display: flex;
  align-items: center;
  &:hover {
    background-color: rgb(229, 231, 235);
  }
}
.file-item .name {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>
