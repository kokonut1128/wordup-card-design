import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";

const Index = lazy(() => import("./pages/Index"));
const Auth = lazy(() => import("./pages/Auth"));
const Flashcards = lazy(() => import("./pages/Flashcards"));
const Study = lazy(() => import("./pages/Study"));
const Review = lazy(() => import("./pages/Review"));
const Quiz = lazy(() => import("./pages/Quiz"));
const WordDetail = lazy(() => import("./pages/WordDetail"));
const NotFound = lazy(() => import("./pages/NotFound"));

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen">載入中...</div>}>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<Index />} />
            <Route path="/flashcards" element={<Flashcards />} />
            <Route path="/study" element={<Study />} />
            <Route path="/review" element={<Review />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/word/:word" element={<WordDetail />} />
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
