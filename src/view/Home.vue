<script lang="ts" setup>
import { fileDownloadUrlKey } from "~/event-bus";
import MdEditor from "~/markdown-editor";

const content = ref("");

const { on } = useEventBus(fileDownloadUrlKey);

on(async (download_url) => {
  const { data } = await useFetch(download_url).get().text();
  content.value = data.value?.toString() || "";
});
</script>

<template>
  <MdEditor v-model="content" height="80vh"></MdEditor>
</template>

<style lang="less" scoped></style>
