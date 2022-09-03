<script lang="ts" setup>
import dayjs from "dayjs";
import { ElNotification } from "element-plus";
import { githubApi, useGithubFetch } from "~/fetch";
import { useLoadingService } from "~/hooks";
import MdEditor from "~/markdown-editor";
import { githubConfig, useFileGlobalState, user } from "~/store";
import type { RepoData } from "~/store/types";
import { encryptByBase64 } from "~/utils";
import { GithubStatus } from "../fetch/index";

const { getFile } = useFileGlobalState();

const content = ref("");

const api = {
  SaveFile(data: RepoData) {
    return useGithubFetch(getFile.value?.url!).put(data);
  },
  GetFile() {
    return useGithubFetch(
      `${githubApi}/repos/${user.value.login}/${
        githubConfig.value.repo
      }/contents/${getFile.value?.path}?t=${Date.now()}`
    )
      .get()
      .json();
  },
};

const { loading, open } = useLoadingService({
  text: "保存中...",
});

watchDebounced(
  getFile,
  async (val) => {
    if (!val) return;
    open();
    loading.value?.setText("加载中");
    const { data } = await api.GetFile();
    content.value = decodeURIComponent(
      escape(window.atob(data.value?.content))
    );
    loading.value?.close();
  },
  { debounce: 200, immediate: true }
);

async function onSaveClick() {
  open();
  const { statusCode } = await api.SaveFile({
    message:
      "md-github from a new commit message " +
      dayjs().format("YYYY/MM/DD HH:mm"),
    content: encryptByBase64(content.value),
    sha: getFile.value!.sha,
  });
  if (statusCode.value === GithubStatus.Success) {
    ElNotification({
      title: "Success",
      message: "保存成功",
      type: "success",
    });
    api.GetFile();
  }
  loading.value?.close();
}
</script>

<template>
  <el-container>
    <el-header class="flex justify-between h40px!">
      <div></div>
      <div>
        <el-button type="primary" @click="onSaveClick" v-if="getFile">
          保 存
        </el-button>
      </div>
    </el-header>
    <el-main>
      <MdEditor v-model="content" height="80vh" v-if="getFile"></MdEditor>
      <div class="flex-center flex-col" v-else>
        <div i-ic-outline-insert-drive-file text-5rem color-gray-4></div>
        <span class="color-gray-4 text-12px">请选择一个markdown文件</span>
      </div>
    </el-main>
  </el-container>
</template>

<style lang="less" scoped></style>
