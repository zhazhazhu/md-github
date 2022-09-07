<script lang="ts" setup>
import { useClipboard } from "@vueuse/core";
import dayjs from "dayjs";
import { ElMessage, ElMessageBox, ElNotification } from "element-plus";
import { getFileListContentKey, openNextFileKey } from "~/event-bus";
import { githubApi, useGithubFetch } from "~/fetch";
import { useLoadingService } from "~/hooks";
import MdEditor from "~/markdown-editor";
import { githubConfig, useFileGlobalState, user } from "~/store";
import type { DeleteRepoData, GithubFile, SaveRepoData } from "~/store/types";
import { encryptByBase64 } from "~/utils";
import { GithubStatus } from "../fetch/index";
import ImagePreview from "./ImagePreview.vue";

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

const { copy } = useClipboard();

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

const imagePreviewRef = ref<InstanceType<typeof ImagePreview>>();

function onPreviewImage(file: GithubFile) {
  imagePreviewRef.value?.open(file.path);
}

function copyText(text: string) {
  copy(text);
  ElMessage.success("复制成功");
}
</script>

<template>
  <el-button
    type="primary"
    @click="onSaveClick"
    v-if="tabName !== 'all'"
    class="absolute top-4px right-20px z-1000"
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
            class="file-item w150px h150px b-rd-10px bg-#f7f7f7 m-10px flex-center flex-col justify-between cursor-pointer relative"
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
            <a class="w100px max-h100px m-20px h[calc(100%-90px)]" v-else>
              <el-image
                :src="file.cdn_url"
                alt="loading error"
                fit="cover"
                style="
                  width: 100%;
                  max-height: 100%;
                  line-height: calc(100% - 90px);
                "
                class="b-rd-8px cursor-zoom-in"
                @click="onPreviewImage(file)"
              />
            </a>

            <div class="h40px color-gray-8 text-12px text">
              <div class="info">
                <el-button
                  text
                  bg
                  size="small"
                  @click.stop="copyText(`![${file.name}](${file.cdn_url})`)"
                  >markdown</el-button
                >
                <el-button
                  text
                  bg
                  size="small"
                  @click.stop="copyText(file.cdn_url)"
                >
                  cdn
                </el-button>
              </div>

              <span class="name">
                {{ file.name }}
              </span>
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

  <ImagePreview ref="imagePreviewRef"></ImagePreview>
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
  box-sizing: border-box;
  .close {
    display: none;
  }
  .text {
    width: 100%;
    padding: 0 10px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: center;
    line-height: 36px;
  }
  .name {
    display: black;
  }
  .info {
    display: none;
  }
  &:hover {
    border: 1px solid #ebebeb;
  }
  &:hover .close {
    display: block;
  }
  &:hover .text {
    background-color: #ffffff;
    border-radius: 0 0 10px 10px;
    .info {
      display: block;
    }
    .name {
      display: none;
    }
  }
}
:deep(.el-tabs__header) {
  border: none;
  margin: 0 !important;
  height: 34px;
  .el-tabs__item {
    font-size: 12px !important;
    border: none !important;
    min-width: 140px;
    border-radius: 6px 6px 0 0;
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
