import { ThemeToggle } from '@/components/ThemeToggle';
import { Toaster } from '@/components/ui/sonner';
import { Calculator } from '@/components/Calculator';
export function HomePage() {
  return (
    <div className="min-h-screen w-full bg-background text-foreground selection:bg-primary/20">
      <div className="fixed inset-0 -z-10 h-full w-full bg-gradient-to-br from-background to-muted/40" />
      <div className="fixed inset-0 -z-20 h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] dark:bg-[radial-gradient(rgba(255,255,255,0.1)_1px,transparent_1px)]" />
      <ThemeToggle className="fixed top-4 right-4" />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-screen flex flex-col items-center justify-center py-8 md:py-10 lg:py-12">
          <div className="text-center space-y-4 mb-8 animate-fade-in">
            <h1 className="text-5xl md:text-6xl font-display font-bold text-balance leading-tight">
              Lumin<span className="text-gradient">Calc</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-xl mx-auto text-pretty">
              A small, beautiful, fast calculator with a focus on user experience and visual polish.
            </p>
          </div>
          <Calculator />
          <footer className="absolute bottom-8 text-center text-muted-foreground/80 text-sm">
            <p>Built with ❤️ at Cloudflare</p>
          </footer>
        </div>
      </main>
      <Toaster richColors closeButton theme="system" />
    </div>
  );
}