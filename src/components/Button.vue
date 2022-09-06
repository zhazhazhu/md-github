<script lang="ts" setup></script>

<template>
  <div class="md-button">
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
  border-radius: 8px;
  font-weight: bold;
  font-size: 14px;
  &:hover {
    background-color: #e2e4e7;
  }
}
</style>
