<script lang="ts" setup>
import { useCeil } from "@vueuse/math";
import dayjs from "dayjs";
import { ElNotification } from "element-plus";
import { githubApi, GithubStatus, useGithubFetch } from "~/fetch";
import { useLoadingService } from "~/hooks";
import { githubConfig, useFileGlobalState, user } from "~/store";
import type { SaveRepoData } from "~/store/types";
import type { CompressFile } from "~/types";
import { handleCompress } from "~/utils";
import Button from "../components/Button.vue";

const { getPath } = useFileGlobalState();

const api = {
  AddFile(data: SaveRepoData, fileName: string) {
    const url =
      githubApi +
      "/repos/" +
      unref(user).login +
      "/" +
      unref(githubConfig).repo +
      "/contents" +
      (unref(getPath) === "/" ? unref(getPath) : unref(getPath) + "/") +
      fileName;
    return useGithubFetch(url).put(data);
  },
};

const uploadRef = ref<HTMLDivElement>();

const inputRef = ref<HTMLInputElement>();

const filesData = ref<Set<File>>(new Set());

const uploadFiles = ref<Set<CompressFile>>(new Set());

function onDrop(files: File[] | null) {
  if (!files?.length) return;
  files.forEach((file) => {
    filesData.value.add(file);
  });
  compressImage();
  // called when files are dropped on zone
}

const { isOverDropZone } = useDropZone(uploadRef, onDrop);

function onBrowseFile() {
  inputRef.value!.value = "";
  inputRef.value!.click();
}

async function handleChange(e: Event) {
  const files = (e.target as HTMLInputElement).files;
  if (!files) return;

  for (let i = 0; i < files.length; i++) {
    filesData.value.add(files[i]);
  }
  compressImage();
}

async function compressImage() {
  const compressFiles = await Promise.all(
    [...filesData.value].map((file) => {
      return handleCompress(file);
    })
  );
  uploadFiles.value = new Set(compressFiles);
  return compressFiles;
}

async function onChangeSlider(file: CompressFile, key: number) {
  const afterFiles = [...uploadFiles.value];
  afterFiles.splice(key, 1);
  const newFile = await handleCompress(
    [...filesData.value].at(key)!,
    file.quality
  );
  afterFiles.splice(key, 0, newFile);
  uploadFiles.value = new Set(afterFiles);
}

function onDeleteFile(file: CompressFile, key: number) {
  uploadFiles.value.delete(file);
  filesData.value = new Set([...filesData.value].splice(key, 1));
}

const { loading, open } = useLoadingService({
  text: "上传中,请稍后...",
});

async function onStartUpload() {
  open();
  const res = await Promise.all(
    [...uploadFiles.value].map((file) => {
      const fileName = file.name + "." + file.type!.split("/")[1];
      return api.AddFile(
        {
          message:
            "md-github from a new image commit" +
            dayjs().format("YYYY/MM/DD HH:mm"),
          content: file.compress_base64!.replace(
            /^data:image\/\w+;base64,/,
            ""
          ),
        },
        fileName
      );
    })
  );
  const pass = res.filter(
    (item) => item.statusCode.value === GithubStatus.Created
  );
  ElNotification({
    title: "Success",
    message: `${pass.length} 张图片上传成功！${
      res.length - pass.length
    }上传失败`,
    type: "success",
  });
  filesData.value.clear();
  uploadFiles.value.clear();
  loading.value?.close();
}
</script>

<template>
  <div class="w100% bg-white h100vh flex justify-center relative">
    <header
      class="header absolute top-0 flex justify-between items-center px20px"
      v-show="uploadFiles.size"
    >
      <div class="color-#1b74e4 font-bold ml-30px flex-center">
        <div i-ph-circle-notch-bold mr-10px></div>
        <span>待上传 {{ uploadFiles.size }} 个图片</span>
      </div>
      <Button type="primary" class="h60px" @click="onStartUpload">
        开始上传
      </Button>
    </header>

    <div
      v-if="!uploadFiles.size"
      ref="uploadRef"
      class="upload-container w-80% h-400px bg-gray-1 b-rd-14px m50px mt120px max-w-1000px flex-center flex-col"
    >
      <svg class="icon mr12px text-50px" aria-hidden="true">
        <use xlink:href="#icon-picture3"></use>
      </svg>
      <div class="my-20px text-center text-1.4rem">
        点击\拖拽\粘贴 <br />
        上传文件
      </div>
      <Button type="primary" @click="onBrowseFile">
        浏 览
        <input
          ref="inputRef"
          v-show="false"
          type="file"
          name="file"
          accept="image/*"
          multiple
          @change="handleChange"
          @click.stop
        />
      </Button>
    </div>

    <div
      v-else
      ref="uploadRef"
      class="upload-container after w100% h[calc(100%-180px)] bg-gray-1 b-rd-14px m50px mt120px p50px flex"
    >
      <aside class="w100px">
        <Button
          type="gray"
          @click="onBrowseFile"
          class="w80px h80px justify-center"
        >
          <div i-material-symbols-add text-40px></div>
          <input
            ref="inputRef"
            v-show="false"
            type="file"
            name="file"
            accept="image/*"
            multiple
            @change="handleChange"
            @click.stop
          />
        </Button>

        <div
          v-for="item in uploadFiles"
          :key="item.compress_base64"
          class="img-cover"
        >
          <img :src="item.compress_base64" alt="upload_error" />
        </div>
      </aside>

      <main class="w[calc(100%-100px)] overflow-auto">
        <div
          v-for="(item, key) in uploadFiles"
          :key="item.compress_base64"
          class="flex-center justify-between"
        >
          <div class="image-container w[calc(100%-80px)]">
            <img :src="item.compress_base64" alt="upload_error" />
            <div class="w100% my15px ml30px">
              <el-form class="h45px" label-width="60px" label-position="left">
                <el-form-item label="名称">
                  <el-input v-model="item.name" placeholder=""></el-input>
                </el-form-item>
              </el-form>
              <div class="flex-center justify-start">
                <div class="text">原图</div>
                <el-tag class="line-through mr10px" type="info">
                  {{ useCeil(item.original_size! / 1000) }}kb
                </el-tag>
                <div class="text">压缩</div>
                <el-tag type="warning">
                  {{ useCeil(item.compress_size! / 1000) }}kb
                </el-tag>
              </div>
              <div class="flex-center justify-start">
                <div class="text w60px">压缩率</div>
                <el-slider
                  v-model="item.quality"
                  class="w[calc(100%-60px)]!"
                  :step="0.1"
                  show-stops
                  :max="1"
                  :min="0"
                  @change="onChangeSlider(item, key)"
                />
              </div>
            </div>
          </div>

          <Button
            type="gray"
            round
            class="w60px h60px"
            @click="onDeleteFile(item, key)"
          >
            <div i-mdi-delete-off text-20px></div>
          </Button>
        </div>
      </main>
    </div>
  </div>
</template>

<style lang="less" scoped>
.upload-container {
  border: 4px dashed rgb(183, 183, 183);
  cursor: pointer;
  &.after {
    cursor: auto;
    border: 2px dashed rgb(227, 227, 227);
  }
  &:hover {
    border-color: rgb(125, 145, 170);
  }
  &.after:hover {
    border-color: rgb(187, 200, 215);
  }
}

.upload-container aside {
  display: flex;
  flex-direction: column;
}

.upload-container .img-cover {
  margin-top: 10px;
  position: relative;
  width: 80px;
  height: 80px;
  &::before {
    position: absolute;
    top: 0;
    left: 0;
    content: "";
    background: rgba(0, 0, 0, 0.3);
    border-radius: 8px;
    height: 100%;
    width: 100%;
    z-index: 999;
  }
}

.upload-container img {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  object-fit: cover;
}
.image-container {
  background-color: #edeff3;
  height: 170px;
  border-radius: 8px;
  padding: 10px 20px;
  display: flex;
  margin-bottom: 20px;
}
.image-container img {
  height: 120px;
  width: 120px;
  margin: 15px 0;
  object-fit: cover;
}
:deep(.el-form-item__label) {
  height: 40px !important;
  line-height: 40px !important;
  font-weight: bold;
}

.text {
  color: var(--el-text-color-regular);
  font-size: 14px;
  line-height: 40px;
  font-weight: bold;
  width: 60px;
}
.header {
  width: 100%;
  height: 100px;
  box-sizing: border-box;
}
</style>
