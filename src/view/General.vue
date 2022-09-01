<script lang="ts" setup>
import { ElMessage, type FormInstance } from "element-plus";
import { isEmpty } from "lodash-es";
import { useLoadingService } from "~/hooks";
import { githubConfig, user } from "~/store";
import { githubApi, useGithubFetch } from "../fetch/index";
import type { GithubConfig, User } from "../store/types";

const api = {
  GetUser() {
    return useGithubFetch(githubApi + "/user")
      .get()
      .json<User>();
  },
  GetRepos() {
    return useGithubFetch(
      `${user.value.repos_url}?type=all&sort=created&per_page=100`
    )
      .get()
      .json();
  },
};

const router = useRouter();

const form = reactive({
  token: githubConfig.value.token,
  repo: githubConfig.value.repo,
});

const formRef = ref<FormInstance>();

const repos = ref<any[]>([]);

async function init() {
  if (!form.token) return;
  if (isEmpty(user.value)) {
    const { data } = await api.GetUser();
    user.value = data.value;
  }
  const { data: res } = await api.GetRepos();
  repos.value = res.value;
}

const { loading, open } = useLoadingService({
  text: "保存中...",
});

async function saveToken() {
  if (!form.token) return;
  open();
  githubConfig.value.token = form.token;
  await init();
  loading.value?.close();
}

async function saveRepo() {
  open();
  githubConfig.value.repo = form.repo;
  ElMessage.success("保存成功");
  loading.value?.close();
  router.push("/");
}

async function sinInOut() {
  githubConfig.value = {} as GithubConfig;
  user.value = null;
  form.token = "";
  form.repo = null as any;
  repos.value = [];
}

function getToken() {
  window.open("https://www.qzzhu.cn/moments/github-token");
}

onMounted(() => {
  init();
});
</script>

<template>
  <main class="w-350px m-auto mt6%">
    <p class="text-22px color-gray-700 font-500">开始</p>
    <el-form :model="form" label-position="top" ref="formRef">
      <el-form-item>
        <template #label>
          <span>Github access token</span>
          <el-link class="m-l-10px" @click="getToken">如何获取?</el-link>
        </template>
        <el-input v-model="form.token" placeholder="请输入" />
      </el-form-item>

      <el-form-item label="Github repo" v-show="repos.length">
        <el-select
          v-model.number="form.repo"
          placeholder="Select"
          class="w-100%"
        >
          <el-option
            v-for="item in repos"
            :key="item.id"
            :label="item.name"
            :value="item.name"
          >
            <span style="float: left">{{ item.name }}</span>
            <span
              style="
                float: right;
                color: var(--el-text-color-secondary);
                font-size: 13px;
              "
              >{{ item.visibility }}</span
            >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>

    <div>
      <el-button
        type="primary"
        @click="saveToken"
        class="w100% h40px!"
        v-if="!repos.length"
      >
        确 定
      </el-button>
      <el-button type="primary" @click="saveRepo" class="w100% h-40px!" v-else>
        保存配置
      </el-button>

      <el-button
        type="danger"
        @click="sinInOut"
        class="w100% h-40px! m0! mt16px!"
        v-if="!isEmpty(user)"
      >
        退出登录
      </el-button>
    </div>

    <div class="text-12px text-gray mt-20px">
      注意： Pichub不会对你的 access token
      进行储存和转移，它只会储存在你的本机的浏览器内，所以它是相对安全的。如果你试图去浏览器的缓存中清除掉它，你会发现，它需要重新登陆了，但我们不推荐这样操作。
    </div>
  </main>
</template>

<style lang="less" scoped></style>
