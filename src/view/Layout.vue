<script lang="ts" setup>
import dayjs from "dayjs";
import { ElNotification } from "element-plus";
import { githubApi, GithubStatus, useGithubFetch } from "~/fetch";
import { useLoadingService } from "~/hooks";
import { githubConfig, useFileGlobalState, user } from "~/store";
import type { RepoData } from "~/store/types";
import { getFileListContentKey } from "../event-bus/index";
import { encryptByBase64 } from "../utils/index";
import FileList from "./FileList.vue";

const { getPathToString } = useFileGlobalState();

const fileName = ref("");

const api = {
  AddFile(data: RepoData) {
    return useGithubFetch(
      `${githubApi}/repos/${user.value.login}/${githubConfig.value.repo}/contents${getPathToString.value}${fileName.value}.md`
    ).put(data);
  },
};
const router = useRouter();

const popoverVisible = ref(false);

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
  popoverVisible.value = false;
  loading.value?.close();
  emit();
}
</script>

<template>
  <el-container class="h-100vh layout">
    <el-aside width="210px" class="b-r-1px b-color-#dcdfe6 relative">
      <div flex-center cursor-pointer @click="router.push('/')">
        <div i-mdi-language-markdown text-70px color-gray></div>
        <div class="text-gray-600">Markdown</div>
      </div>
      <div class="b-b-1px b-color-#dcdfe6 w-100%" />

      <main class="h[calc(100%-300px)]">
        <FileList></FileList>
      </main>

      <footer
        class="w-100% h-300px b-t-1px b-color-#dcdfe6 absolute bottom-0 bg-gray-50 text-center py-20px"
      >
        <el-popover
          placement="right"
          :width="200"
          trigger="click"
          v-model:visible="popoverVisible"
        >
          <template #reference>
            <el-button size="large" class="w-160px m-b-10px text-12px!" round
              >新建Markdown</el-button
            >
          </template>
          <el-input v-model="fileName" placeholder="请输入文件名" />
          <div m-t-10px text-center>
            <el-button type="info" @click="popoverVisible = false"
              >取消</el-button
            >
            <el-button type="primary" @click="onAddFile">确定</el-button>
          </div>
        </el-popover>

        <el-button
          size="large"
          class="w-160px m0! text-12px!"
          round
          @click="router.push('/general')"
          >设 置</el-button
        >
      </footer>
    </el-aside>

    <el-main>
      <router-view></router-view>
    </el-main>
  </el-container>
</template>

<style lang="less" scoped></style>
