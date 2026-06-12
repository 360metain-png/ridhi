import { useCallback, useEffect, useRef } from "react";
import { useFocusEffect } from "expo-router";
import { useAuth } from "@/contexts/AuthContext";
import {
  startSession,
  endSession,
  trackScreenEnter,
  trackScreenExit,
  trackEvent,
  trackLike,
  trackUnlike,
  trackShare,
  trackComment,
  trackSave,
  trackFollow,
  trackUnfollow,
  trackBlock,
  trackReport,
  trackCoinRecharge,
  trackCoinSpent,
  trackSubscriptionPurchase,
  trackGiftSend,
  trackMatchSwipe,
  trackMatchMessage,
  trackChatSend,
  trackDmOpen,
  trackDmSend,
  trackSearch,
  trackHashtagClick,
  trackCommunityJoin,
  trackCommunityLeave,
  trackContentCreate,
  trackAdEvent,
  getCurrentSession,
  exportAnalytics,
  clearEvents,
  type ScreenName,
  type EventType,
  type ContentType,
} from "@/data/analytics";

export function useAnalytics() {
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";

  const track = useCallback(
    async (type: EventType, params?: { contentId?: string; contentType?: ContentType; targetUserId?: string; metadata?: Record<string, any>; coins?: number }) => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackEvent({
        type,
        userId,
        sessionId: session.id,
        ...params,
      });
    },
    [userId]
  );

  const trackLikeContent = useCallback(
    async (contentId: string, contentType: ContentType) => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackLike(contentId, contentType, userId, session.id);
    },
    [userId]
  );

  const trackUnlikeContent = useCallback(
    async (contentId: string, contentType: ContentType) => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackUnlike(contentId, contentType, userId, session.id);
    },
    [userId]
  );

  const trackShareContent = useCallback(
    async (contentId: string, contentType: ContentType, platform?: string) => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackShare(contentId, contentType, userId, session.id, platform);
    },
    [userId]
  );

  const trackCommentContent = useCallback(
    async (contentId: string, contentType: ContentType) => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackComment(contentId, contentType, userId, session.id);
    },
    [userId]
  );

  const trackSaveContent = useCallback(
    async (contentId: string, contentType: ContentType) => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackSave(contentId, contentType, userId, session.id);
    },
    [userId]
  );

  const trackFollowUser = useCallback(
    async (targetUserId: string) => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackFollow(targetUserId, userId, session.id);
    },
    [userId]
  );

  const trackUnfollowUser = useCallback(
    async (targetUserId: string) => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackUnfollow(targetUserId, userId, session.id);
    },
    [userId]
  );

  const trackBlockUser = useCallback(
    async (targetUserId: string) => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackBlock(targetUserId, userId, session.id);
    },
    [userId]
  );

  const trackReportContent = useCallback(
    async (targetUserId: string, contentId: string, contentType: ContentType) => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackReport(targetUserId, contentId, contentType, userId, session.id);
    },
    [userId]
  );

  const trackCoinRechargeEvent = useCallback(
    async (amount: number) => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackCoinRecharge(amount, userId, session.id);
    },
    [userId]
  );

  const trackCoinSpentEvent = useCallback(
    async (amount: number, contentId: string) => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackCoinSpent(amount, contentId, userId, session.id);
    },
    [userId]
  );

  const trackSubscription = useCallback(
    async (tier: string) => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackSubscriptionPurchase(tier, userId, session.id);
    },
    [userId]
  );

  const trackGift = useCallback(
    async (targetUserId: string, giftId: string, cost: number) => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackGiftSend(targetUserId, giftId, cost, userId, session.id);
    },
    [userId]
  );

  const trackMatch = useCallback(
    async (direction: "right" | "left" | "super", targetUserId: string) => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackMatchSwipe(direction, targetUserId, userId, session.id);
    },
    [userId]
  );

  const trackMatchMsg = useCallback(
    async (targetUserId: string) => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackMatchMessage(targetUserId, userId, session.id);
    },
    [userId]
  );

  const trackChat = useCallback(
    async (type: "text" | "voice" | "image" | "gif" | "sticker") => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackChatSend(type, userId, session.id);
    },
    [userId]
  );

  const trackDmOpenEvent = useCallback(
    async (targetUserId: string) => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackDmOpen(targetUserId, userId, session.id);
    },
    [userId]
  );

  const trackDmSendEvent = useCallback(
    async (targetUserId: string) => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackDmSend(targetUserId, userId, session.id);
    },
    [userId]
  );

  const trackSearchQuery = useCallback(
    async (query: string) => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackSearch(query, userId, session.id);
    },
    [userId]
  );

  const trackHashtag = useCallback(
    async (tag: string) => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackHashtagClick(tag, userId, session.id);
    },
    [userId]
  );

  const trackCommunity = useCallback(
    async (action: "join" | "leave", communityId: string) => {
      const session = await getCurrentSession();
      if (!session) return;
      if (action === "join") await trackCommunityJoin(communityId, userId, session.id);
      else await trackCommunityLeave(communityId, userId, session.id);
    },
    [userId]
  );

  const trackCreate = useCallback(
    async (type: "post" | "reel" | "story" | "live") => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackContentCreate(type, userId, session.id);
    },
    [userId]
  );

  const trackAd = useCallback(
    async (type: "ad_impression" | "ad_click" | "ad_conversion", adId: string) => {
      const session = await getCurrentSession();
      if (!session) return;
      await trackAdEvent(type, adId, userId, session.id);
    },
    [userId]
  );

  return {
    track,
    trackLike: trackLikeContent,
    trackUnlike: trackUnlikeContent,
    trackShare: trackShareContent,
    trackComment: trackCommentContent,
    trackSave: trackSaveContent,
    trackFollow: trackFollowUser,
    trackUnfollow: trackUnfollowUser,
    trackBlock: trackBlockUser,
    trackReport: trackReportContent,
    trackCoinRecharge: trackCoinRechargeEvent,
    trackCoinSpent: trackCoinSpentEvent,
    trackSubscription: trackSubscription,
    trackGift: trackGift,
    trackMatch: trackMatch,
    trackMatchMessage: trackMatchMsg,
    trackChat: trackChat,
    trackDmOpen: trackDmOpenEvent,
    trackDmSend: trackDmSendEvent,
    trackSearch: trackSearchQuery,
    trackHashtag: trackHashtag,
    trackCommunity: trackCommunity,
    trackCreate: trackCreate,
    trackAd: trackAd,
    exportAnalytics,
    clearEvents,
  };
}

/**
 * Auto-track screen views when a screen is focused.
 * Call this in the root of any screen component.
 */
export function useTrackScreen(screen: ScreenName) {
  const { user } = useAuth();
  const userId = user?.id ?? "anonymous";
  const screenRef = useRef(screen);
  screenRef.current = screen;

  useEffect(() => {
    startSession(userId);
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      const currentScreen = screenRef.current;
      trackScreenEnter(currentScreen, userId);
      return () => {
        trackScreenExit(currentScreen, userId);
      };
    }, [userId])
  );
}
