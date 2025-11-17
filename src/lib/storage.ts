// Safe localStorage wrapper with error handling

export const safeStorage = {
  getItem: (key: string): string | null => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error("localStorage getItem error:", error);
      return null;
    }
  },

  setItem: (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error("localStorage setItem error:", error);
      // Handle quota exceeded
      if (
        error instanceof DOMException &&
        (error.name === "QuotaExceededError" ||
          error.name === "NS_ERROR_DOM_QUOTA_REACHED")
      ) {
        // Try to clear some space
        try {
          const savedPosts = localStorage.getItem("savedPosts");
          if (savedPosts) {
            const posts = JSON.parse(savedPosts);
            // Keep only last 50 posts
            if (posts.length > 50) {
              localStorage.setItem("savedPosts", JSON.stringify(posts.slice(0, 50)));
              // Retry
              localStorage.setItem(key, value);
              return true;
            }
          }
        } catch (cleanupError) {
          console.error("Cleanup error:", cleanupError);
        }
      }
      return false;
    }
  },

  removeItem: (key: string): boolean => {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error("localStorage removeItem error:", error);
      return false;
    }
  },

  clear: (): boolean => {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.error("localStorage clear error:", error);
      return false;
    }
  },
};
