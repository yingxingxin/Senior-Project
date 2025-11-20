/**
 * Maps external assistant avatar URLs to local file paths when available.
 * 
 * This allows using local files from /public/assistants/ instead of external URLs
 * when the files have been manually added to the project.
 */

const ASSISTANT_IMAGE_MAP: Record<string, string> = {
  // Nova images
  'Nova_face.png': '/assistants/Nova_face.png',
  'Nova_standing.png': '/assistants/Nova_standing.png',
  
  // Add more mappings as you add local files
  // 'tomoyw.jpg': '/assistants/tomoyw.jpg',
  // 'femto.jpg': '/assistants/femto.jpg',
};

/**
 * Converts an external assistant image URL to a local path if available.
 * 
 * @param url - The external URL or existing local path
 * @returns The local path if available, otherwise returns the original URL
 * 
 * @example
 * convertToLocalPath('https://pub-60d5694a417d4bf6aad60ebfc01b5621.r2.dev/Nova_face.png')
 * // Returns: '/assistants/Nova_face.png'
 */
export function convertToLocalPath(url: string | null | undefined): string | null {
  if (!url) return null;
  
  // If it's already a local path, return as-is
  if (url.startsWith('/')) {
    return url;
  }
  
  // Extract filename from external URL
  try {
    const urlObj = new URL(url);
    const filename = urlObj.pathname.split('/').pop() || '';
    
    // Check if we have a local mapping for this file
    if (filename && ASSISTANT_IMAGE_MAP[filename]) {
      return ASSISTANT_IMAGE_MAP[filename];
    }
  } catch {
    // If URL parsing fails, return original
    return url;
  }
  
  // Return original URL if no local mapping exists
  return url;
}

