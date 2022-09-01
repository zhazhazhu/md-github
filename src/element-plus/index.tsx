import { ElConfigProvider, type ConfigProviderInstance } from "element-plus";
import "element-plus/es/components/loading/style/css";
import "element-plus/es/components/message/style/css";
import "element-plus/es/components/notification/style/css";
import type { Language } from "element-plus/es/locale";
import zhCn from "element-plus/lib/locale/lang/zh-cn";
import { defineComponent, type PropType } from "vue";

export default defineComponent({
  name: "ElConfigProviderPreset",
  props: {
    size: {
      type: String as PropType<ConfigProviderInstance["size"]>,
      default: "default",
    },
    zIndex: { type: Number, default: 3000 },
    locale: { type: Object as PropType<Language>, default: zhCn },
  },
  setup(props, { slots }) {
    return () => (
      <ElConfigProvider
        size={props.size}
        zIndex={props.zIndex}
        locale={props.locale}
      >
        {slots.default && slots.default()}
      </ElConfigProvider>
    );
  },
});
