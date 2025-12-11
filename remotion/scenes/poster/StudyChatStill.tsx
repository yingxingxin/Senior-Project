import React from "react";
import { AbsoluteFill, Img } from "remotion";
import { posterStudyChat, posterAssistant } from "../../lib/poster-mock-data";
import { Theme, LIGHT_THEME } from "../../lib/poster-theme";

/**
 * StudyChatStill - Static poster screenshot of study chat page
 *
 * Shows interactive learning with:
 * - Chat messages between user and assistant
 * - Code examples with syntax highlighting
 */

export function StudyChatStill({ theme = LIGHT_THEME }: { theme?: Theme }) {
  const { lessonTitle, messages } = posterStudyChat;

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
          padding: "24px 32px 32px",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Header */}
        <div
          style={{
            background: theme.cardBg,
            borderRadius: 16,
            border: `1px solid ${theme.border}`,
            padding: "16px 24px",
            marginBottom: 24,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            boxShadow: theme.shadow,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                background: theme.accentGradient,
                overflow: "hidden",
              }}
            >
              <Img
                src={posterAssistant.avatarUrl}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <div>
              <div style={{ color: theme.textPrimary, fontWeight: 600, fontSize: 17 }}>
                Study Mode: {lessonTitle}
              </div>
              <div style={{ color: theme.textSecondary, fontSize: 14 }}>
                with {posterAssistant.name}
              </div>
            </div>
          </div>
          <button
            style={{
              background: theme.cardBgHover,
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              padding: "10px 20px",
              color: theme.textPrimary,
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            End Session
          </button>
        </div>

        {/* Chat Area */}
        <div
          style={{
            flex: 1,
            background: "transparent",
            borderRadius: 16,
            padding: 24,
            display: "flex",
            flexDirection: "column",
            gap: 20,
            overflow: "hidden",
          }}
        >
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} theme={theme} />
          ))}
        </div>

        {/* Input Area */}
        <div
          style={{
            marginTop: 16,
            background: theme.cardBg,
            borderRadius: 16,
            border: `1px solid ${theme.border}`,
            padding: 16,
            display: "flex",
            gap: 12,
            boxShadow: theme.shadow,
          }}
        >
          <input
            type="text"
            placeholder="Ask a question about the lesson..."
            style={{
              flex: 1,
              background: theme.inputBg,
              border: `1px solid ${theme.border}`,
              borderRadius: 10,
              padding: "14px 18px",
              color: theme.textPrimary,
              fontSize: 15,
              outline: "none",
            }}
          />
          <button
            style={{
              background: theme.accentGradient,
              border: "none",
              borderRadius: 10,
              padding: "14px 28px",
              color: theme.textOnAccent,
              fontSize: 15,
              fontWeight: 600,
              boxShadow: theme.accentShadow,
            }}
          >
            Send
          </button>
        </div>
      </div>
    </AbsoluteFill>
  );
}

function ChatMessage({
  message,
  theme,
}: {
  message: (typeof posterStudyChat)["messages"][0];
  theme: Theme;
}) {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        display: "flex",
        justifyContent: isUser ? "flex-end" : "flex-start",
      }}
    >
      <div
        style={{
          maxWidth: "80%",
          display: "flex",
          gap: 12,
          flexDirection: isUser ? "row-reverse" : "row",
        }}
      >
        {/* Avatar */}
        {!isUser && (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: theme.accentGradient,
              overflow: "hidden",
              flexShrink: 0,
            }}
          >
            <Img
              src={posterAssistant.avatarUrl}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>
        )}
        {isUser && (
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: theme.accentGradient,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: theme.textOnAccent,
              fontWeight: 600,
              fontSize: 14,
              flexShrink: 0,
            }}
          >
            A
          </div>
        )}

        {/* Message Content */}
        <div>
          {message.text && (
            <div
              style={{
                background: isUser ? theme.accentGradient : theme.cardBg,
                borderRadius: 16,
                borderTopLeftRadius: isUser ? 16 : 4,
                borderTopRightRadius: isUser ? 4 : 16,
                padding: "14px 18px",
                color: isUser ? theme.textOnAccent : theme.textPrimary,
                fontSize: 15,
                lineHeight: 1.6,
                border: isUser ? "none" : `1px solid ${theme.border}`,
                boxShadow: theme.shadow,
              }}
            >
              {message.text}
            </div>
          )}

          {message.code && (
            <div
              style={{
                marginTop: message.text ? 12 : 0,
                background: theme.codeBg,
                borderRadius: 12,
                overflow: "hidden",
                border: `1px solid ${theme.codeBorder}`,
                boxShadow: theme.shadow,
              }}
            >
              {/* Code Header */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 16px",
                  background: theme.codeHeaderBg,
                  borderBottom: `1px solid ${theme.codeBorder}`,
                }}
              >
                <span style={{ color: theme.textSecondary, fontSize: 12 }}>
                  Python
                </span>
                <button
                  style={{
                    background: theme.cardBgHover,
                    border: `1px solid ${theme.border}`,
                    borderRadius: 6,
                    padding: "4px 10px",
                    color: theme.textSecondary,
                    fontSize: 11,
                  }}
                >
                  Copy
                </button>
              </div>

              {/* Code Content */}
              <div
                style={{
                  padding: 16,
                  fontFamily: "'Fira Code', 'SF Mono', Consolas, monospace",
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: theme.codeText,
                  whiteSpace: "pre-wrap",
                }}
              >
                {formatPythonCode(message.code, theme)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Simple syntax highlighting for Python code
function formatPythonCode(code: string, theme: Theme) {
  const lines = code.split("\n");

  return lines.map((line, i) => {
    // Highlight comments
    if (line.trim().startsWith("#")) {
      return (
        <div key={i} style={{ color: theme.codeComment }}>
          {line}
        </div>
      );
    }

    // Highlight keywords
    const keywords = ["def", "return", "if", "else", "for", "while", "import", "from", "class", "print"];

    return (
      <div key={i}>
        {line.split(/(\s+)/).map((part, j) => {
          if (keywords.includes(part)) {
            return (
              <span key={j} style={{ color: theme.codeKeyword }}>
                {part}
              </span>
            );
          }
          if (part.match(/^["'].*["']$/)) {
            return (
              <span key={j} style={{ color: theme.codeString }}>
                {part}
              </span>
            );
          }
          if (part.match(/^\d+$/)) {
            return (
              <span key={j} style={{ color: theme.codeNumber }}>
                {part}
              </span>
            );
          }
          return <span key={j}>{part}</span>;
        })}
      </div>
    );
  });
}
