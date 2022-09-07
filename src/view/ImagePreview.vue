<script lang="ts" setup>
import Viewer from "viewerjs";
import "viewerjs/dist/viewer.css";
import { useFileGlobalState } from "~/store";

const { getFileList } = useFileGlobalState();

const imageList = computed(() =>
  getFileList.value.filter((file) => !file.name.endsWith("md"))
);

const imagePreviewRef = ref<HTMLUListElement>();

const viewer = ref<Viewer>();

function open(path: string) {
  const index = imageList.value.findIndex((file) => file.path === path);
  if (!viewer.value)
    viewer.value = new Viewer(imagePreviewRef.value!, {
      fullscreen: true,
      initialViewIndex: index,
      zIndexInline: 2,
      toolbar: false,
    });
  viewer.value.view(index);
  viewer.value.show();
}

defineExpose({ open });
</script>

<template>
  <ul ref="imagePreviewRef">
    <li v-for="image in imageList">
      <img :src="image.cdn_url" :alt="image.name" />
    </li>
  </ul>
</template>

<style lang="less" scoped></style>
