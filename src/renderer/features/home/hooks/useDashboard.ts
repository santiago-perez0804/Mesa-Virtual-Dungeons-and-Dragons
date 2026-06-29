import { useState, useEffect } from 'react';

export const useDashboard = (socket: any, campaigns: any[], characters: any[], user: any) => {
  const [friendsOnline, setFriendsOnline] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    if (!socket) return;

    const handleFriendsOnline = (data: any[]) => setFriendsOnline(data || []);
    const handleActivity = (data: any[]) => setRecentActivity(data || []);

    socket.on('dashboard:friends_online', handleFriendsOnline);
    socket.on('dashboard:recent_activity', handleActivity);

    socket.emit('dashboard:request_friends_online');
    socket.emit('dashboard:request_recent_activity');

    return () => {
      socket.off('dashboard:friends_online', handleFriendsOnline);
      socket.off('dashboard:recent_activity', handleActivity);
    };
  }, [socket]);

  const myCampaigns = campaigns.filter((c: any) => c.owner === user?.name);
  const myCharacters = characters.filter((c: any) => c.owner === user?.name);
  const activeCampaigns = campaigns.filter((c: any) => c.is_active === 1);

  return {
    myCampaigns,
    myCharacters,
    activeCampaigns,
    friendsOnline,
    recentActivity
  };
};
