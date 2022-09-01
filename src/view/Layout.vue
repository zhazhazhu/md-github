<script lang="ts" setup>
import FileList from "./FileList.vue";
const router = useRouter();
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
        <el-button
          size="large"
          class="w-200px"
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
