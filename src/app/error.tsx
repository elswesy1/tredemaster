"use client";

export default function GlobalError({ 
  error, 
  reset 
}: { 
  error: Error & { digest?: string }; 
  reset: () => void; 
}) {
  console.error('[Error Boundary]', error);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="text-center p-8 border rounded-lg bg-card max-w-md">
        <h2 className="text-2xl font-bold text-destructive mb-4">
          حدث خطأ غير متوقع
        </h2>
        <p className="text-muted-foreground mb-6 text-sm">
          {error.message}
        </p>
        <div className="flex gap-4 justify-center">
          <button 
            onClick={reset} 
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            إعادة المحاولة
          </button>
          <a 
            href="/"
            className="px-4 py-2 bg-secondary text-secondary-foreground rounded hover:bg-secondary/90"
          >
            العودة للرئيسية
          </a>
        </div>
      </div>
    </div>
  );
}
