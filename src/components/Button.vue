<script lang="ts" setup>
const { type = "default", round = false } = defineProps<{
  type?: "primary" | "default" | "gray";
  round?: boolean;
}>();

const roundStyle = round ? "100%" : "8px";
</script>

<template>
  <div class="md-button" :class="type">
    <slot></slot>
  </div>
</template>

<style lang="less" scoped>
.md-button {
  display: flex;
  align-items: center;
  font-family: inherit;
  padding: 10px;
  box-sizing: border-box;
  color: #313131;
  cursor: pointer;
  border-radius: v-bind(roundStyle);
  font-weight: bold;
  font-size: 14px;
  &:hover {
    background-color: #e2e4e7;
  }
}
.md-button.primary {
  background-color: #1b74e4;
  color: white;
  padding: 10px 20px;
  &:hover {
    background-color: #3286ed;
  }
}
.md-button.gray {
  background-color: #e3e5e9;
  color: #636363;
  padding: 10px 20px;
  &:hover {
    background-color: #d4d8dd;
  }
}
</style>
