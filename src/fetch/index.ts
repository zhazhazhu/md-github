import { createFetch, type UseFetchOptions } from "@vueuse/core";
import { ElMessage } from "element-plus";
import { githubConfig } from "~/store";

export const githubApi = "https://api.github.com";

export enum GithubStatus {
  Success = 200,
  Created = 201,
  Not_found = 404,
  Conflict = 409,
  Validation_failed = 422,
  Service_unavailable = 503,
}

const options: UseFetchOptions = {
  timeout: 30 * 1000,
  beforeFetch({ url, options, cancel }) {
    if (!githubConfig.value.token) {
      cancel();
    }

    options.headers = {
      ...options.headers,
      Authorization: `Bearer ${githubConfig.value.token}`,
    };

    return {
      options,
    };
  },
  onFetchError(ctx) {
    ElMessage.error(ctx.data);
    return ctx;
  },
};

const fetchOptions: RequestInit = {
  headers: {
    "Content-Type": "application/json",
  },
};

export const useGithubFetch = createFetch({
  options,
  fetchOptions,
});
