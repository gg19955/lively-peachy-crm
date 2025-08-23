export const renderFallback = () => (
  <div className="min-h-screen bg-background flex items-center justify-center transition-colors duration-300">
    <div className="text-center">
      {/* Spinner */}
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
      {/* Loading text */}
      <p className="text-sm text-foreground">Loading...</p>
    </div>
  </div>
);
