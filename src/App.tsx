import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import '@/i18n/config';
import Index from "./pages/Index.tsx";
import Interview from "./pages/Interview.tsx";
import CVBuilder from "./pages/CVBuilder.tsx";
import Evaluate from "./pages/Evaluate.tsx";
import Tips from "./pages/Tips.tsx";
import Advanced from "./pages/Advanced.tsx";
import AdvancedTool from "./pages/AdvancedTool.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter
        future={{
          v7_startTransition: true,
          v7_relativeSplatPath: true,
        }}
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/interview" element={<Interview />} />
          <Route path="/cv" element={<CVBuilder />} />
          <Route path="/evaluate" element={<Evaluate />} />
          <Route path="/tips" element={<Tips />} />
          <Route path="/advanced" element={<Advanced />} />
          <Route path="/advanced/:toolId" element={<AdvancedTool />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
