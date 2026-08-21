import { useEffect } from "react";
import { Outlet, Route, Routes, useLocation } from "react-router";

import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { applyHead } from "@/lib/head";
import { metaForPath } from "@/lib/seo";
import { About } from "@/routes/about";
import { Contact } from "@/routes/contact";
import { Home } from "@/routes/home";
import { NotFound } from "@/routes/not-found";
import { Playground } from "@/routes/playground";
import { Usage } from "@/routes/usage";

/**
 * Every URL is served its own prerendered head, so this is only for client-side
 * navigation — without it the title and canonical would stay on whichever page
 * the visitor happened to land on.
 */
function useRouteHead() {
  const { pathname } = useLocation();
  useEffect(() => {
    applyHead(metaForPath(pathname));
  }, [pathname]);
}

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
  useRouteHead();

  return (
    <Routes>
      <Route element={<SiteLayout />}>
        <Route element={<Home />} index />
        <Route element={<Usage />} path="/usage" />
        <Route element={<Playground />} path="/playground" />
        <Route element={<About />} path="/about" />
        <Route element={<Contact />} path="/contact" />
      </Route>
      <Route element={<NotFound />} path="*" />
    </Routes>
  );
}
