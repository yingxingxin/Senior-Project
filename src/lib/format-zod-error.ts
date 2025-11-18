import { ZodError, ZodIssue } from "zod";

/**
 * Format Zod Error Utility
 *
 * Architecture Decision:
 * - Flattens deeply nested union errors into readable format
 * - Preserves field paths and context for debugging
 * - Handles discriminated unions (common in AI SDK message validation)
 *
 * Why not use Zod's built-in .flatten()?
 * - Built-in flatten() loses context for nested unions
 * - Doesn't show which discriminator values were attempted
 * - Unhelpful for complex AI SDK message schemas
 */

interface FormattedError {
  path: string;
  message: string;
  expected?: string;
  received?: string;
  code: string;
}

/**
 * Recursively flatten Zod errors, including nested union errors
 */
function flattenZodIssues(issues: ZodIssue[], parentPath: string[] = []): FormattedError[] {
  const formatted: FormattedError[] = [];

  for (const issue of issues) {
    const fullPath = [...parentPath, ...issue.path.map(String)];
    const pathString = fullPath.length > 0 ? fullPath.join(".") : "(root)";

    // Handle union errors by recursing into nested errors
    if (issue.code === "invalid_union" && "unionErrors" in issue) {
      const unionErrors = issue.unionErrors as Array<{ issues: ZodIssue[] }>;
      // Add a summary for the union itself
      formatted.push({
        path: pathString,
        message: `Union validation failed (tried ${unionErrors.length} options)`,
        code: issue.code,
      });

      // Recurse into each union option's errors
      unionErrors.forEach((unionError, index) => {
        const nestedPath = [...fullPath, `union_option_${index + 1}`];
        formatted.push(...flattenZodIssues(unionError.issues, nestedPath));
      });
    } else {
      // Standard error
      const error: FormattedError = {
        path: pathString,
        message: issue.message,
        code: issue.code,
      };

      // Add type information if available
      if ("expected" in issue && "received" in issue) {
        error.expected = String(issue.expected);
        error.received = String(issue.received);
      }

      // Add enum values if available (options property indicates an enum/union error)
      if ("options" in issue) {
        error.expected = `one of: ${(issue.options as string[]).join(", ")}`;
        if ("received" in issue) {
          error.received = JSON.stringify(issue.received);
        }
      }

      formatted.push(error);
    }
  }

  return formatted;
}

/**
 * Format Zod error into readable string for logging
 */
export function formatZodError(error: ZodError): string {
  const formatted = flattenZodIssues(error.issues);

  // Group by path for better readability
  const byPath = new Map<string, FormattedError[]>();
  for (const err of formatted) {
    const existing = byPath.get(err.path) || [];
    existing.push(err);
    byPath.set(err.path, existing);
  }

  const lines: string[] = ["Zod Validation Errors:", ""];

  for (const [path, errors] of byPath) {
    lines.push(`  Path: ${path}`);
    for (const err of errors) {
      lines.push(`    ❌ ${err.message} [${err.code}]`);
      if (err.expected) {
        lines.push(`       Expected: ${err.expected}`);
      }
      if (err.received) {
        lines.push(`       Received: ${err.received}`);
      }
    }
    lines.push("");
  }

  return lines.join("\n");
}

/**
 * Format Zod error with data context for debugging
 */
export function formatZodErrorWithData(
  error: ZodError,
  data: unknown,
  options: { maxDataLength?: number; label?: string } = {}
): string {
  const { maxDataLength = 1000, label = "Data" } = options;

  const errorFormatted = formatZodError(error);
  const dataString = JSON.stringify(data, null, 2);
  const dataTruncated =
    dataString.length > maxDataLength
      ? `${dataString.slice(0, maxDataLength)}... (truncated ${dataString.length - maxDataLength} chars)`
      : dataString;

  return [
    errorFormatted,
    `${label} being validated:`,
    dataTruncated,
    "",
  ].join("\n");
}

/**
 * Get first error path and message for user-facing error
 */
export function getFirstZodError(error: ZodError): { path: string; message: string } {
  const formatted = flattenZodIssues(error.issues);
  const firstError = formatted[0];

  if (!firstError) {
    return {
      path: "unknown",
      message: "Validation failed",
    };
  }

  return {
    path: firstError.path,
    message: firstError.message,
  };
}
