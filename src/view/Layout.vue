<script lang="ts" setup>
import dayjs from "dayjs";
import { ElMessage, ElNotification } from "element-plus";
import { githubApi, GithubStatus, useGithubFetch } from "~/fetch";
import { useLoadingService } from "~/hooks";
import { githubConfig, useFileGlobalState, user } from "~/store";
import type { RepoData } from "~/store/types";
import { getFileListContentKey } from "../event-bus/index";
import { encryptByBase64 } from "../utils/index";
import FileList from "./FileList.vue";

const { getPath } = useFileGlobalState();

const fileName = ref("");

const dirName = ref("");

const api = {
  AddFile(data: RepoData) {
    const url =
      githubApi +
      "/repos/" +
      unref(user).login +
      "/" +
      unref(githubConfig).repo +
      "/contents" +
      (unref(getPath) === "/" ? unref(getPath) : unref(getPath) + "/") +
      unref(fileName) +
      ".md";
    return useGithubFetch(url).put(data);
  },
  AddDir(data: RepoData) {
    const url =
      githubApi +
      "/repos/" +
      unref(user).login +
      "/" +
      unref(githubConfig).repo +
      "/contents" +
      (unref(getPath) === "/" ? unref(getPath) : unref(getPath) + "/") +
      unref(dirName) +
      "/README.md";
    return useGithubFetch(url).put(data);
  },
};
const router = useRouter();

const popover = reactive({
  file: false,
  dir: false,
});

const { emit } = useEventBus(getFileListContentKey);

const { loading, open } = useLoadingService({
  text: "创建文件中...",
});

async function onAddFile() {
  open();
  const { statusCode } = await api.AddFile({
    message:
      "md-github from a new file commit " + dayjs().format("YYYY/MM/DD HH:mm"),
    content: encryptByBase64("Hello Markdown Github"),
  });
  if (statusCode.value === GithubStatus.Created) {
    ElNotification({
      title: "Success",
      message: "创建成功",
      type: "success",
    });
  }
  popover.file = false;
  loading.value?.close();
  emit();
}

async function onAddDir() {
  open();
  const { statusCode } = await api.AddDir({
    message:
      "md-github from a new Dir commit " + dayjs().format("YYYY/MM/DD HH:mm"),
    content: encryptByBase64("Hello Markdown Github"),
  });
  if (statusCode.value === GithubStatus.Created) {
    ElNotification({
      title: "Success",
      message: "创建成功",
      type: "success",
    });
  }
  popover.dir = false;
  loading.value?.close();
  emit();
}

function showPopover() {
  if (!unref(githubConfig).token) {
    popover.file = false;
    popover.dir = false;
    ElMessage.warning("请先登录");
  }
}

function afterPopover() {
  fileName.value = "";
  dirName.value = "";
}

function openGithub() {
  window.open("https://github.com/zhazhazhu/md-github");
}
</script>

<template>
  <el-container class="h-100vh layout">
    <el-aside width="210px" class="bg-#f5fbff relative">
      <div flex-center cursor-pointer @click="router.push('/')">
        <div i-mdi-language-markdown text-70px color-gray></div>
        <div class="text-gray-600">Markdown</div>
      </div>

      <main class="h[calc(100%-300px)]">
        <FileList></FileList>
      </main>

      <footer
        class="w-100% h-300px absolute bottom-0 text-center py-20px flex flex-col items-center justify-end"
      >
        <el-popover
          placement="right"
          :width="200"
          trigger="click"
          v-model:visible="popover.file"
          @before-enter="showPopover"
          @after-leave="afterPopover"
        >
          <template #reference>
            <el-button size="large" class="w-160px m-b-10px text-12px!" round
              >新建Markdown</el-button
            >
          </template>
          <el-input v-model="fileName" placeholder="请输入文件名" />
          <div m-t-10px text-center>
            <el-button type="info" @click="popover.file = false"
              >取消</el-button
            >
            <el-button type="primary" @click="onAddFile">确定</el-button>
          </div>
        </el-popover>

        <el-popover
          placement="right"
          :width="200"
          trigger="click"
          v-model:visible="popover.dir"
          @before-enter="showPopover"
          @after-leave="afterPopover"
        >
          <template #reference>
            <el-button
              size="large"
              class="w-160px m-b-10px ml0! text-12px!"
              round
              >新建文件夹</el-button
            >
          </template>
          <el-input v-model="dirName" placeholder="请输入文件夹名" />
          <div m-t-10px text-center>
            <el-button type="info" @click="popover.dir = false">取消</el-button>
            <el-button type="primary" @click="onAddDir">确定</el-button>
          </div>
        </el-popover>

        <el-button
          size="large"
          class="w-160px m-b-10px ml0! text-12px!"
          round
          @click="router.push('/general')"
          >设 置</el-button
        >

        <el-button
          size="large"
          class="w-160px m-b-10px ml0!"
          round
          @click="openGithub"
        >
          <div i-fa-github-alt m-auto text-28px></div>
        </el-button>
      </footer>
    </el-aside>

    <el-main class="p0!">
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<style lang="less" scoped></style>
