import { Route, Routes } from "react-router";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Home } from "@/routes/home";
import { NotFound } from "@/routes/not-found";
import { Playground } from "@/routes/playground";
import { Usage } from "@/routes/usage";

export function App() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1">
        <Routes>
          <Route element={<Home />} index />
          <Route element={<Usage />} path="/usage" />
          <Route element={<Playground />} path="/playground" />
          <Route element={<NotFound />} path="*" />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
