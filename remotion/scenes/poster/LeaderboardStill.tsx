import React from "react";
import { AbsoluteFill } from "remotion";
import { posterLeaderboard, formatTime } from "../../lib/poster-mock-data";
import { Theme, LIGHT_THEME } from "../../lib/poster-theme";

/**
 * LeaderboardStill - Static poster screenshot of leaderboard page
 *
 * Shows timed run leaderboard with:
 * - Exercise and language filters
 * - Ranking table with current user highlighted
 */

export function LeaderboardStill({ theme = LIGHT_THEME }: { theme?: Theme }) {
  const { exercise, language, entries } = posterLeaderboard;

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
        <div style={{ marginBottom: 24 }}>
          <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 32, marginBottom: 8 }}>
            Timed Run Leaderboard
          </div>
          <div style={{ color: theme.textSecondary, fontSize: 15 }}>
            Fastest times per user. Filter by exercise and language.
          </div>
        </div>

        {/* Filters */}
        <div style={{ display: "flex", gap: 24, marginBottom: 32 }}>
          <FilterDropdown label="Exercise" value={exercise} theme={theme} />
          <FilterDropdown label="Language" value={language} theme={theme} />
        </div>

        {/* Leaderboard Table */}
        <div
          style={{
            background: theme.cardBg,
            borderRadius: 16,
            border: `1px solid ${theme.border}`,
            overflow: "hidden",
            boxShadow: theme.shadow,
          }}
        >
          {/* Table Header */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "80px 1fr 1fr 120px 150px",
              padding: "16px 24px",
              background: theme.cardBgHover,
              borderBottom: `1px solid ${theme.border}`,
              fontSize: 13,
              fontWeight: 600,
              color: theme.textSecondary,
            }}
          >
            <div>Rank</div>
            <div>User</div>
            <div>Email</div>
            <div>Language</div>
            <div style={{ textAlign: "right" }}>Best Time</div>
          </div>

          {/* Table Rows */}
          {entries.map((entry, index) => (
            <div
              key={entry.rank}
              style={{
                display: "grid",
                gridTemplateColumns: "80px 1fr 1fr 120px 150px",
                padding: "16px 24px",
                background: entry.isCurrentUser
                  ? theme.accentBgSubtle
                  : index % 2 === 0
                    ? "transparent"
                    : theme.cardBgSubtle,
                borderBottom:
                  index < entries.length - 1 ? `1px solid ${theme.borderSubtle}` : "none",
                alignItems: "center",
              }}
            >
              {/* Rank */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {entry.rank <= 3 ? (
                  <span
                    style={{
                      fontSize: 20,
                    }}
                  >
                    {entry.rank === 1 ? "🥇" : entry.rank === 2 ? "🥈" : "🥉"}
                  </span>
                ) : (
                  <span style={{ color: theme.textSecondary, fontWeight: 600 }}>
                    {entry.rank}
                  </span>
                )}
              </div>

              {/* User Name */}
              <div
                style={{
                  color: entry.isCurrentUser ? theme.accent : theme.textPrimary,
                  fontWeight: entry.isCurrentUser ? 600 : 400,
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {entry.name}
                {entry.isCurrentUser && (
                  <span
                    style={{
                      background: theme.accentBgSubtle,
                      color: theme.accent,
                      padding: "2px 8px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                    }}
                  >
                    You
                  </span>
                )}
              </div>

              {/* Email */}
              <div style={{ color: theme.textSecondary, fontSize: 14 }}>
                {entry.email}
              </div>

              {/* Language */}
              <div>
                <span
                  style={{
                    background: theme.cardBgHover,
                    color: theme.textSecondary,
                    padding: "4px 10px",
                    borderRadius: 6,
                    fontSize: 12,
                    border: `1px solid ${theme.border}`,
                  }}
                >
                  {entry.lang}
                </span>
              </div>

              {/* Time */}
              <div
                style={{
                  textAlign: "right",
                  color: entry.isCurrentUser ? theme.accent : theme.textPrimary,
                  fontWeight: 600,
                  fontFamily: "monospace",
                  fontSize: 15,
                }}
              >
                {formatTime(entry.timeMs)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
}

function FilterDropdown({ label, value, theme }: { label: string; value: string; theme: Theme }) {
  return (
    <div style={{ width: 200 }}>
      <div style={{ color: theme.textSecondary, fontSize: 13, marginBottom: 8 }}>
        {label}
      </div>
      <div
        style={{
          background: theme.cardBgHover,
          borderRadius: 10,
          padding: "12px 16px",
          border: `1px solid ${theme.border}`,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ color: theme.textPrimary, fontSize: 14 }}>{value}</span>
        <span style={{ color: theme.textSecondary }}>▼</span>
      </div>
    </div>
  );
}
