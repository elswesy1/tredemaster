"use client";

export default function Loading() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-green-500 border-t-transparent animate-spin" />
        <p className="text-muted-foreground text-lg">جاري التحميل...</p>
      </div>
    </div>
  );
}
