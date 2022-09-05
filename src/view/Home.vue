<script lang="ts" setup>
import dayjs from "dayjs";
import { ElMessageBox, ElNotification } from "element-plus";
import { getFileListContentKey, openNextFileKey } from "~/event-bus";
import { githubApi, useGithubFetch } from "~/fetch";
import { useLoadingService } from "~/hooks";
import MdEditor from "~/markdown-editor";
import { githubConfig, useFileGlobalState, user } from "~/store";
import type { DeleteRepoData, GithubFile, SaveRepoData } from "~/store/types";
import { encryptByBase64 } from "~/utils";
import { GithubStatus } from "../fetch/index";

const {
  getTabPanes,
  addTabPane,
  getPath,
  setCurrentTabPane,
  getCurrentTabPane,
  getFileList,
} = useFileGlobalState();

const { on } = useEventBus(openNextFileKey);

const { emit } = useEventBus(getFileListContentKey);

const tabName = ref("all");

const nextFile = ref<GithubFile | null>(null);

const api = {
  SaveFile(data: SaveRepoData) {
    return useGithubFetch(nextFile.value?.url!).put(data);
  },
  GetFile(path: string) {
    return useGithubFetch(
      `${githubApi}/repos/${user.value.login}/${
        githubConfig.value.repo
      }/contents/${path}?t=${Date.now()}`
    )
      .get()
      .json();
  },
  DeleteFile(path: string, data: DeleteRepoData) {
    return useGithubFetch(path).delete(data);
  },
};

const { loading, open } = useLoadingService({
  text: "保存中...",
});

//保存当前文件
async function onSaveClick() {
  open();
  const { content } = getTabPanes.value.find(
    (tab) => tab.name === tabName.value
  )!;
  const { statusCode } = await api.SaveFile({
    message:
      "feat: md-github from a new commit message " +
      dayjs().format("YYYY/MM/DD HH:mm"),
    content: encryptByBase64(content!),
    sha: getCurrentTabPane.value!.sha,
  });
  if (statusCode.value === GithubStatus.Success) {
    ElNotification({
      title: "Success",
      message: "保存成功",
      type: "success",
    });
    api.GetFile(getPath.value);
  }
  loading.value?.close();
}

//获取文件内容
async function getFileContent() {
  const { data } = await api.GetFile(nextFile.value?.path!);
  return decodeURIComponent(escape(window.atob(data.value?.content)));
}

//打开markdown文件并且添加tab
function onOpenFile(file: GithubFile) {
  nextFile.value = file;
}

//从文件列表中点击
on((file) => {
  nextFile.value = file;
});

//点击markdown文件请求内容并添加到tab
watchDebounced(
  nextFile,
  async (val) => {
    if (
      !getTabPanes.value.find((f) => f.sha === val?.sha) &&
      val?.name.endsWith("md")
    ) {
      open();
      loading.value?.setText("加载中");
      const content = await getFileContent();
      addTabPane({
        ...val,
        content: content,
      });
      tabName.value = val.path;
      loading.value?.close();
    }
  },
  { debounce: 200 }
);

function onTabChange(val) {
  if (val === "all") return;
  setCurrentTabPane(tabName.value);
}

function deleteFile(file: GithubFile) {
  ElMessageBox.confirm(`确认删除 ${file.name} 吗?`, {
    confirmButtonText: "OK",
    cancelButtonText: "Cancel",
    type: "warning",
  }).then(async () => {
    open();
    loading.value?.setText("删除文件中...");
    const { statusCode } = await api.DeleteFile(file.url, {
      message:
        "delete: file and md-github from a new commit message " +
        dayjs().format("YYYY/MM/DD HH:mm"),
      sha: file.sha,
    });
    loading.value?.close();
    if (statusCode.value === GithubStatus.Success) {
      ElNotification({
        title: "Success",
        message: "删除成功",
        type: "success",
      });
      emit();
    }
  });
}
</script>

<template>
  <el-button
    type="primary"
    @click="onSaveClick"
    v-if="tabName !== 'all'"
    class="absolute top-8px right-20px z-1000"
  >
    保 存
  </el-button>
  <el-tabs
    type="card"
    v-model="tabName"
    @tab-change="onTabChange"
    class="pt8px h99vh"
  >
    <el-tab-pane label="全 部" name="all">
      <div class="flex-center justify-start flex-wrap file-wrap">
        <template v-if="getFileList.length">
          <div
            v-for="file in getFileList"
            :key="file.sha"
            class="file-item w150px h150px b-rd-10px bg-#f7f7f7 m-10px flex-center flex-col cursor-pointer hover:bg-#f5fbff relative"
            @click="onOpenFile(file)"
          >
            <div
              i-uiw-circle-close
              class="close absolute top-6px right-6px text-#ff5151a6"
              @click.stop="deleteFile(file)"
            ></div>

            <!-- markdown 文件 -->
            <div
              v-if="file.name.endsWith('md')"
              i-file-icons-rmarkdown
              text-4rem
              color-gray
              class="h[calc(100%-30px)]"
            ></div>

            <!-- 图片文件 -->
            <a class="w100px max-h100px m-20px h[calc(100%-70px)]" v-else>
              <el-image
                :src="file.download_url"
                alt=""
                fit="cover"
                style="
                  width: 100%;
                  max-height: 100%;
                  line-height: calc(100% - 70px);
                "
                class="b-rd-8px"
              />
            </a>

            <div class="h20px color-gray-8 text-12px">
              {{ file.name }}
            </div>
          </div>
        </template>
        <div class="flex-center flex-col" v-else>
          <div i-ic-outline-insert-drive-file text-5rem color-gray-4></div>
          <span class="color-gray-4 text-12px">暂无文件</span>
        </div>
      </div>
    </el-tab-pane>

    <template v-if="getTabPanes.length">
      <el-tab-pane
        v-for="tab in getTabPanes"
        :key="tab.sha"
        :label="tab.name"
        :name="tab.path"
      >
        <MdEditor v-model="tab.content" height="100%"></MdEditor>
      </el-tab-pane>
    </template>
  </el-tabs>

  <!-- <MdEditor v-model="content" height="80vh" v-if="getFile"></MdEditor>
  <div class="flex-center flex-col" v-else>
    <div i-ic-outline-insert-drive-file text-5rem color-gray-4></div>
    <span class="color-gray-4 text-12px">请选择一个markdown文件</span>
  </div> -->
</template>

<style lang="less" scoped>
.file-wrap {
  display: grid;
  align-content: flex-start;
  padding: 15px;
  grid-gap: 15px;
  min-height: calc(100vh - 150px);
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
}
.file-item {
  .close {
    display: none;
  }
  &:hover .close {
    display: block;
  }
}
:deep(.el-tabs__header) {
  border: none;
  margin: 0 !important;
  .el-tabs__item {
    font-size: 12px !important;
    border: none !important;
    min-width: 140px;
  }
  .el-tabs__item.is-active {
    background-color: #fff;
  }
}
:deep(.el-tabs__nav) {
  border: none !important;
}
:deep(.el-tab-pane) {
  height: 100%;
}
:deep(.el-tabs__content) {
  height: calc(100vh - 80px);
  overflow-y: auto;
  background-color: #fff;
  padding: 10px;
}
</style>
