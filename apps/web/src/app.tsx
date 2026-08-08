import { Outlet, Route, Routes } from "react-router";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { Home } from "@/routes/home";
import { NotFound } from "@/routes/not-found";
import { Playground } from "@/routes/playground";
import { Usage } from "@/routes/usage";

/** Header and footer belong to the site, not to every route: 404 opts out. */
function SiteLayout() {
  return (
    <div className="flex min-h-svh flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

export function App() {
  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route element={<Home />} index />
        <Route element={<Usage />} path="/usage" />
        <Route element={<Playground />} path="/playground" />
      </Route>
      <Route element={<NotFound />} path="*" />
    </Routes>
  );
}
