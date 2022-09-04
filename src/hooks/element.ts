import type { MaybeRef } from "@vueuse/core";
import { ElLoading, type LoadingOptionsResolved } from "element-plus";

type LoadingOptions = Partial<
  Omit<LoadingOptionsResolved, "target" | "parent"> & {
    target: MaybeRef<string | HTMLElement | undefined>;
    body: boolean;
  }
>;

const loadingOptions: LoadingOptions = {
  fullscreen: true,
};

export function useLoadingService(options: LoadingOptions) {
  const target = ref(options.target);
  const loading = ref<ReturnType<typeof ElLoading["service"]>>();
  function open() {
    loading.value = ElLoading.service({
      background: "#f5fbff",
      ...loadingOptions,
      ...options,
      target: target.value,
    });
  }

  return {
    loading,
    open,
  };
}
