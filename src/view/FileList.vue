<script lang="ts" setup>
import { githubApi, useGithubFetch } from "~/fetch";
import { githubConfig, user } from "~/store";
import { useLoadingService } from "../hooks/element";

const pathHistory = ref(["/"]);

const path = computed(() => pathHistory.value.join().replace(",", ""));

const api = {
  GetContent(repo: string) {
    return useGithubFetch(
      githubApi + `/repos/${unref(user).login}/${repo}/contents${path.value}`
    )
      .get()
      .json();
  },
};

const fileContainerRef = ref<HTMLElement>();

const content = ref<any[]>([]);

const dirContent = computed(() =>
  content.value.filter((item) => item.type === "dir")
);

const mdContent = computed(() =>
  content.value.filter(
    (item) => item.type === "file" && item.name.endsWith("md")
  )
);

const repo = githubConfig.value.repo;

async function onDirClick(p: string) {
  pathHistory.value.push(p);
}

function onReturnClick() {
  pathHistory.value.pop();
}

watch(
  () => unref(githubConfig).repo,
  async (value) => {
    if (!value) return;
    const { data } = await api.GetContent(value);
    content.value = data.value;
  },
  {
    immediate: true,
  }
);

const { loading, open } = useLoadingService({
  target: fileContainerRef,
  text: "加载中...",
});

watchDebounced(
  path,
  async () => {
    open();
    const { data } = await api.GetContent(repo);
    content.value = data.value;
    loading.value?.close();
  },
  {
    debounce: 200,
  }
);
</script>

<template>
  <main
    class="file-list w-100% color-gray-6 text-12px my10px"
    ref="fileContainerRef"
  >
    <el-link
      class="my-10px m-l-30px"
      v-if="path !== '/'"
      @click="onReturnClick"
    >
      <div i-icon-park-outline-return></div>
      <span class="m-l-4px text-12px">返回上一级</span>
    </el-link>
    <div class="flex items-center flex-col">
      <template v-for="dir in dirContent">
        <div
          cursor-pointer
          class="h40px w-50% b-rd-8px hover:bg-gray-2 lh-40px px30px"
          @click="onDirClick(dir.path)"
        >
          {{ dir.name }}
        </div>
      </template>
    </div>

    <div class="flex items-center flex-col">
      <template v-for="md in mdContent">
        <div
          cursor-pointer
          class="h40px w-50% b-rd-8px hover:bg-gray-2 lh-40px px30px"
        >
          {{ md.name }}
        </div>
      </template>
    </div>
  </main>
</template>

<style lang="less" scoped></style>
