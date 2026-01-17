/**
 * Suppress harmless ResizeObserver error
 * This is a known issue with React and ResizeObserver
 * See: https://github.com/WICG/resize-observer/issues/38
 */

const suppressResizeObserverError = () => {
  // Store the original error handler
  const originalError = console.error;

  // Override console.error
  console.error = (...args) => {
    // Check if it's the ResizeObserver error
    if (
      args[0] &&
      typeof args[0] === 'string' &&
      args[0].includes('ResizeObserver loop')
    ) {
      // Suppress this specific error
      return;
    }
    
    // Call the original error handler for other errors
    originalError.apply(console, args);
  };
};

export default suppressResizeObserverError;
