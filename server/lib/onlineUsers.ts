const ONLINE_WINDOW_MS = 2 * 60 * 1000;
const activeUsers = new Map<number, number>();

export const recordUserActivity = (userId: number): void => {
  activeUsers.set(userId, Date.now());
};

export const getOnlineUserCount = (): number => {
  const cutoff = Date.now() - ONLINE_WINDOW_MS;

  for (const [userId, lastSeen] of activeUsers) {
    if (lastSeen < cutoff) {
      activeUsers.delete(userId);
    }
  }

  return activeUsers.size;
};
