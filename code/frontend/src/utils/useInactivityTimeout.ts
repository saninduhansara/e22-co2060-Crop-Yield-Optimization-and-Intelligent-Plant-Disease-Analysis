import { useEffect, useRef, useCallback } from 'react';

interface UseInactivityTimeoutProps {
  timeout?: number; // Timeout in milliseconds (default: 15 minutes)
  onTimeout: () => void; // Callback when timeout occurs
}

export function useInactivityTimeout({
  timeout = 15 * 60 * 1000, // 15 minutes in milliseconds
  onTimeout,
}: UseInactivityTimeoutProps) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isActiveRef = useRef(true);

  // Reset the inactivity timer
  const resetTimer = useCallback(() => {
    // Clear existing timer
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Update last activity timestamp
    localStorage.setItem('lastActivityTime', Date.now().toString());

    // Set new timer
    timeoutRef.current = setTimeout(() => {
      if (isActiveRef.current) {
        onTimeout();
      }
    }, timeout);
  }, [timeout, onTimeout]);

  // Check if session has expired on mount
  const checkSessionExpiry = useCallback(() => {
    const lastActivityTime = localStorage.getItem('lastActivityTime');
    if (lastActivityTime) {
      const timeSinceLastActivity = Date.now() - parseInt(lastActivityTime, 10);
      if (timeSinceLastActivity > timeout) {
        onTimeout();
        return true;
      }
    }
    return false;
  }, [timeout, onTimeout]);

  // Handle user activity
  const handleActivity = useCallback(() => {
    if (isActiveRef.current) {
      resetTimer();
    }
  }, [resetTimer]);

  useEffect(() => {
    // Check if session is already expired
    const isExpired = checkSessionExpiry();
    if (isExpired) {
      return;
    }

    // Initialize timer
    resetTimer();

    // Activity event listeners
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
    ];

    // Add event listeners
    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Visibility change handler (tab switching)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became visible, check if session expired
        checkSessionExpiry();
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Cleanup
    return () => {
      isActiveRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [resetTimer, handleActivity, checkSessionExpiry]);

  return { resetTimer };
}
