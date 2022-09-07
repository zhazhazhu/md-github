<script lang="ts" setup>
import { getFileListContentKey, openNextFileKey } from "~/event-bus";
import { githubApi, useGithubFetch } from "~/fetch";
import { githubConfig, user } from "~/store";
import { useLoadingService } from "../hooks/element";
import { downloadURLToCDN } from "../logic/index";
import { useFileGlobalState } from "../store/index";
import type { GithubFile } from "../store/types";

const {
  getPath,
  getCurrentTabPane,
  pushPath,
  popPath,
  setFileList,
  addTabPane,
  getFileList,
} = useFileGlobalState();

const { on } = useEventBus(getFileListContentKey);

const { emit } = useEventBus(openNextFileKey);

const route = useRoute();

const router = useRouter();

const imgSuffix = ["jpeg", "jpg", "png"];

const api = {
  GetContent(repo: string) {
    return useGithubFetch(
      githubApi +
        `/repos/${unref(user).login}/${repo}/contents${
          getPath.value
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

const mdContent = ref<GithubFile[]>([]);

const imgContent = ref<GithubFile[]>([]);

//设置图片和markdown 文件列表
watch(content, (val) => {
  imgContent.value = val
    ?.filter(
      (item) =>
        item.type === "file" && imgSuffix.some((fix) => item.name.endsWith(fix))
    )
    .map((item) => ({ ...item, cdn_url: downloadURLToCDN(item.path) }));
  mdContent.value =
    val
      ?.filter((item) => item.type === "file" && item.name.endsWith("md"))
      .map((item) => ({ ...item, cdn_url: downloadURLToCDN(item.path) })) || [];

  setFileList([...mdContent.value, ...imgContent.value]);
});

const repo = computed(() => githubConfig.value.repo);

async function onDirClick(p: string) {
  if (route.name !== "home") router.push("/home");
  pushPath(p);
}

function onFileClick(file: GithubFile) {
  if (route.name !== "home") router.push("/home");
  emit(file);
}

function onReturnClick() {
  popPath();
}

//当前仓库变化重新获取当前仓库下的文件
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
  const { data } = await api.GetContent(repo.value);
  content.value = data.value || [];
  loading.value?.close();
}

//当前路径变化重新获取当前路径下的文件内容
watchDebounced(
  getPath,
  async () => {
    getContent();
  },
  {
    debounce: 200,
  }
);

//当前选择的markdown变化后更新当前文件
// watch(mdContent, (val) => {
//   if (val.length) {
//     const current = val.find((item) => mdPath.includes(item.name)) || val[0];
//     setFile(current);
//   }
// });

//获取文件列表
on(() => {
  getContent();
});
</script>

<template>
  <main class="w-100% color-gray-6 text-12px my10px" ref="fileContainerRef">
    <el-link
      class="my-10px m-l-30px"
      v-if="getPath !== '/'"
      @click="onReturnClick"
    >
      <div i-typcn-arrow-back></div>
      <span class="m-l-4px text-12px">返回上一级</span>
    </el-link>

    <div class="file-list">
      <template v-for="dir in dirContent">
        <div cursor-pointer class="file-item" @click="onDirClick(dir.path)">
          <span class="name flex-center">
            <div
              i-ic-baseline-insert-drive-file
              class="color-#6f94f3 mr-6px w12px"
            ></div>
            <span>{{ dir.name }}</span>
          </span>
        </div>
      </template>
    </div>

    <div class="file-list">
      <template v-for="file in getFileList">
        <div cursor-pointer class="file-item" @click="onFileClick(file)">
          <span class="name flex-center">
            <div
              i-mdi-language-markdown
              class="color-#6f94f3 mr-6px w12px"
              v-if="file.name.endsWith('md')"
            ></div>
            <div i-bxs-image class="color-#6f94f3 mr-6px w12px" v-else></div>
            <span>{{ file.name }}</span>
          </span>

          <span
            v-if="getCurrentTabPane?.sha === file.sha"
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
  width: 200px;
  border-radius: 8px;
  line-height: 40px;
  padding: 0 20px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  box-sizing: border-box;
  &:hover {
    background-color: rgb(229, 231, 235);
  }
}
.file-item .name {
  width: 100%;
  justify-content: flex-start;
  span {
    width: calc(100% - 20px);
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
  }
}
</style>
