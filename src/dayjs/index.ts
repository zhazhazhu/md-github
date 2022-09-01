import dayjs from "dayjs";
import zh from "dayjs/locale/zh";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import updateLocale from "dayjs/plugin/updateLocale";
import utc from "dayjs/plugin/utc";

export const setupDayjs = () => {
  dayjs.extend(utc);
  dayjs.extend(timezone);
  dayjs.extend(relativeTime);
  dayjs.extend(updateLocale);

  dayjs.locale(zh);

  dayjs.updateLocale("zh", {
    relativeTime: {
      ...zh.relativeTime,
    },
  });
};
