// `BrowserRouter` subscribes to the browser's History API and puts the current
// URL into React context. `Routes` matches that URL against its children and
// renders the single best match; `Route` declares one such match.
import { BrowserRouter, Route, Routes } from "react-router"

import AppShell from "@/components/layout/AppShell.tsx"
import Dashboard from "@/pages/Dashboard.tsx"
import Transactions from "@/pages/Transactions.tsx"
import NetWorth from "@/pages/NetWorth.tsx"

function App() {
  return (
    // BrowserRouter uses real paths (/transactions). It needs the dev server
    // and, later, Vercel to serve index.html for unknown paths — otherwise a
    // hard refresh on /transactions 404s. Vite handles this already.
    <BrowserRouter>
      <Routes>
        {/* A pathless layout route: no `path`, just an `element`. It matches
            everything below it, so AppShell wraps every page and its <Outlet />
            renders whichever child matched. */}
        <Route element={<AppShell />}>
          {/* `index` is the child that matches the parent's own path — here,
              "/". It's the nested-route equivalent of a default. */}
          <Route index element={<Dashboard />} />
          {/* Child paths are relative to the parent, so this resolves to
              "/transactions". No leading slash needed. */}
          <Route path="transactions" element={<Transactions />} />
          <Route path="net-worth" element={<NetWorth />} />
          {/* "*" is the catch-all, matched only when nothing else does. Ranked
              last by the router regardless of where it sits in this list. */}
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
