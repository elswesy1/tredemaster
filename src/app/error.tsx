"use client";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-8 border rounded-lg bg-card max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-500/10 flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-destructive mb-4">حدث خطأ غير متوقع</h2>
          <p className="text-muted-foreground mb-6 text-sm">{error.message || "Client-side exception"}</p>
          <div className="flex gap-2 justify-center">
            <button 
              onClick={reset} 
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"
            >
              إعادة المحاولة
            </button>
            <button 
              onClick={() => window.location.href = '/'} 
              className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary/90 transition"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
