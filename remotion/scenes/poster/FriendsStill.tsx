import React from "react";
import { AbsoluteFill } from "remotion";
import { posterFriends, getInitials } from "../../lib/poster-mock-data";
import { Theme, LIGHT_THEME } from "../../lib/poster-theme";

/**
 * FriendsStill - Static poster screenshot of friends page
 *
 * Shows social features with:
 * - Pending friend requests (shows engagement)
 * - Friends list with profiles
 */

export function FriendsStill({ theme = LIGHT_THEME }: { theme?: Theme }) {
  const { pendingRequests, friends } = posterFriends;

  return (
    <AbsoluteFill
      className={theme.className}
      style={{
        background: theme.background,
        fontFamily: "system-ui, -apple-system, sans-serif",
      }}
    >
      <div
        style={{
          padding: "40px 32px 32px",
          width: "100%",
        }}
      >
        {/* Header */}
        <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 32, marginBottom: 32 }}>
          Friends & Requests
        </div>

        {/* Pending Requests Section */}
        <div
          style={{
            background: theme.cardBg,
            borderRadius: 16,
            border: `1px solid ${theme.border}`,
            marginBottom: 32,
            overflow: "hidden",
            boxShadow: theme.shadow,
          }}
        >
          {/* Section Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "20px 24px",
              borderBottom: `1px solid ${theme.border}`,
            }}
          >
            <span style={{ fontSize: 18 }}>✓</span>
            <span style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 17 }}>
              Pending Friend Requests ({pendingRequests.length})
            </span>
          </div>

          {/* Request Cards */}
          <div style={{ padding: 24 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {pendingRequests.map((request) => (
                <FriendRequestCard key={request.id} request={request} theme={theme} />
              ))}
            </div>
          </div>
        </div>

        {/* Friends List Section */}
        <div
          style={{
            background: theme.cardBg,
            borderRadius: 16,
            border: `1px solid ${theme.border}`,
            overflow: "hidden",
            boxShadow: theme.shadow,
          }}
        >
          {/* Section Header */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "20px 24px",
              borderBottom: `1px solid ${theme.border}`,
            }}
          >
            <span style={{ fontSize: 18 }}>👥</span>
            <span style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 17 }}>
              Friends ({friends.length})
            </span>
          </div>

          {/* Friends Grid */}
          <div style={{ padding: 24 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(2, 1fr)",
                gap: 16,
              }}
            >
              {friends.map((friend) => (
                <FriendCard key={friend.userId} friend={friend} theme={theme} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
}

function FriendRequestCard({
  request,
  theme,
}: {
  request: (typeof posterFriends)["pendingRequests"][0];
  theme: Theme;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: theme.cardBgSubtle,
        borderRadius: 12,
        padding: 16,
        border: `1px solid ${theme.borderSubtle}`,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        {/* Avatar */}
        <div
          style={{
            width: 48,
            height: 48,
            borderRadius: 12,
            background: theme.accentGradient,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: theme.textOnAccent,
            fontWeight: 600,
            fontSize: 16,
          }}
        >
          {getInitials(request.requesterDisplayName)}
        </div>

        {/* Info */}
        <div>
          <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 15 }}>
            {request.requesterDisplayName}
          </div>
          <div style={{ color: theme.textSecondary, fontSize: 13 }}>
            @{request.requesterHandle}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div style={{ display: "flex", gap: 8 }}>
        <button
          style={{
            background: theme.accentGradient,
            border: "none",
            borderRadius: 8,
            padding: "10px 20px",
            color: theme.textOnAccent,
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
            boxShadow: theme.accentShadow,
          }}
        >
          <span>✓</span>
          Accept
        </button>
        <button
          style={{
            background: theme.cardBgHover,
            border: `1px solid ${theme.border}`,
            borderRadius: 8,
            padding: "10px 20px",
            color: theme.textSecondary,
            fontSize: 13,
            fontWeight: 600,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>✕</span>
          Decline
        </button>
      </div>
    </div>
  );
}

function FriendCard({ friend, theme }: { friend: (typeof posterFriends)["friends"][0]; theme: Theme }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 14,
        background: theme.cardBgSubtle,
        borderRadius: 12,
        padding: 16,
        border: `1px solid ${theme.borderSubtle}`,
      }}
    >
      {/* Avatar */}
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 12,
          background: theme.accentGradient,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: theme.textOnAccent,
          fontWeight: 600,
          fontSize: 16,
          flexShrink: 0,
        }}
      >
        {getInitials(friend.displayName)}
      </div>

      {/* Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 15 }}>
          {friend.displayName}
        </div>
        <div style={{ color: theme.textSecondary, fontSize: 13 }}>
          @{friend.handle}
        </div>
        {friend.tagline && (
          <div
            style={{
              color: theme.textMuted,
              fontSize: 12,
              marginTop: 4,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            {friend.tagline}
          </div>
        )}
      </div>
    </div>
  );
}
