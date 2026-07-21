import PageHeader from "@/components/layout/PageHeader.tsx"

/**
 * Placeholder so the /transactions route resolves while the shell is wired up.
 * The feed, filter bar, and summary row land next (Week 2, steps 3–4).
 */
function Transactions() {
  return (
    <div>
      <PageHeader title="Transactions" />
      <p className="font-mono text-sm text-muted-foreground">
        Transaction feed coming next.
      </p>
    </div>
  )
}

export default Transactions
