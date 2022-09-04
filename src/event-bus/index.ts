import type { EventBusKey } from "@vueuse/core";
import type { GithubFile } from "~/store/types";

export const getFileListContentKey: EventBusKey<unknown> = Symbol();

export const openNextFileKey: EventBusKey<GithubFile> = Symbol();
