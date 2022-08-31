import { createFetch, type UseFetchOptions } from "@vueuse/core";
import { githubConfig } from "~/store";

export const githubApi = "https://api.github.com";

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
