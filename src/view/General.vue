<script lang="ts" setup>
import type { FormInstance } from "element-plus";
import { token } from "~/store";

const form = reactive({
  accessToken: token.value,
});

const formRef = ref<FormInstance>();

function submitForm(formEl: FormInstance | undefined) {
  if (!formEl || !form.accessToken) return;
  token.value = form.accessToken;
}
</script>

<template>
  <main class="w-350px m-auto">
    <el-form :model="form" label-position="top" ref="formRef">
      <el-form-item label="Github access token">
        <el-input v-model="form.accessToken" placeholder="请输入" />
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="submitForm(formRef)" class="w-100%"
          >保存配置</el-button
        >
      </el-form-item>
    </el-form>

    <span class="text-12px text-gray">
      注意： Pichub不会对你的 access token
      进行储存和转移，它只会储存在你的本机的浏览器内，所以它是相对安全的。如果你试图去浏览器的缓存中清除掉它，你会发现，它需要重新登陆了，但我们不推荐这样操作。
    </span>
  </main>
</template>

<style lang="less" scoped></style>
