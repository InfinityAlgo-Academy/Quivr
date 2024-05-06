import { useEffect, useState } from "react";

import { useSupabase } from "@/lib/context/SupabaseProvider";

import { Notification } from "./Notification/Notification";
import styles from "./Notifications.module.scss";
import { NotificationType } from "./types/types";

import { Icon } from "../../ui/Icon/Icon";
import { TextButton } from "../../ui/TextButton/TextButton";

export const Notifications = (): JSX.Element => {
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unreadNotifications, setUnreadNotifications] = useState<number>(0);
  const [panelOpened, setPanelOpened] = useState<boolean>(false);
  const { supabase } = useSupabase();

  const updateNotifications = async () => {
    try {
      let notifs = (await supabase.from("notifications").select()).data;
      if (notifs) {
        notifs = notifs.sort(
          (a: NotificationType, b: NotificationType) =>
            new Date(b.datetime).getTime() - new Date(a.datetime).getTime()
        );
      }
      setNotifications(notifs ?? []);
      setUnreadNotifications(
        notifs?.filter((n: NotificationType) => !n.read).length ?? 0
      );
    } catch (error) {
      console.error(error);
    }
  };

  const deleteAllNotifications = async () => {
    for (const notification of notifications) {
      await supabase.from("notifications").delete().eq("id", notification.id);
    }
    await updateNotifications();
  };

  const markAllAsRead = async () => {
    for (const notification of notifications) {
      await supabase
        .from("notifications")
        .update({ read: !notification.read })
        .eq("id", notification.id);
    }
    await updateNotifications();
  };

  useEffect(() => {
    void (async () => {
      await updateNotifications();
    })();
  }, []);

  return (
    <div className={styles.notifications_wrapper}>
      <div onClick={() => setPanelOpened(!panelOpened)}>
        <Icon
          name="notifications"
          size="large"
          color="black"
          handleHover={true}
        />
        <span className={styles.badge}>{unreadNotifications}</span>
      </div>
      {panelOpened && (
        <div className={styles.notifications_panel}>
          <div className={styles.notifications_panel_header}>
            <span>Notifications</span>
            <div className={styles.buttons}>
              <TextButton
                label="Mark all as read"
                color="black"
                onClick={() => void markAllAsRead()}
              />
              <span>|</span>
              <TextButton
                label="Delete all"
                color="black"
                onClick={() => void deleteAllNotifications()}
              />
            </div>
          </div>
          {notifications.map((notification, i) => (
            <Notification
              key={i}
              notification={notification}
              lastNotification={i === notifications.length - 1}
              updateNotifications={updateNotifications}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Notifications;
