import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import { getDueDateAt9AM } from '../utils/helpers';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationService = {
  async requestPermissions() {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === 'granted';
  },

  async scheduleCardNotification(card, boardTitle) {
    if (!card.dueDate) return null;

    try {
      // Cancel any existing notification for this card
      await this.cancelCardNotification(card.id);

      const triggerDate = getDueDateAt9AM(card.dueDate);
      const now = Date.now();

      // Don't schedule if the time has already passed
      if (triggerDate <= now) return null;

      const identifier = await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Task Due Today',
          body: `"${card.title}" from board "${boardTitle}"`,
          data: { cardId: card.id },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DATE,
          date: triggerDate,
        },
      });

      return identifier;
    } catch (e) {
      console.error('Error scheduling notification:', e);
      return null;
    }
  },

  async cancelCardNotification(cardId) {
    try {
      const scheduled = await Notifications.getAllScheduledNotificationsAsync();
      const toCancel = scheduled.filter((n) => n.content.data?.cardId === cardId);
      for (const n of toCancel) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    } catch (e) {
      console.error('Error canceling notification:', e);
    }
  },

  async cancelAllNotifications() {
    try {
      await Notifications.cancelAllScheduledNotificationsAsync();
    } catch (e) {
      console.error('Error canceling all notifications:', e);
    }
  },
};
