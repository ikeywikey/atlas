import PageHeader from "@/components/layout/PageHeader.tsx"
import NetWorthCard from "@/components/dashboard/NetWorthCard.tsx"
import CompositionCard from "@/components/netWorth/CompositionCard.tsx"
import { getNetWorthComposition } from "@/data"

function NetWorth() {
  // Read once per render. This is a plain synchronous call into the mock data
  // layer today; when it becomes a fetch in Phase 2 this is the line that grows
  // loading/error states, and nothing below it has to change shape.
  const { assets, liabilities, debtToAssetRatio } = getNetWorthComposition()

  return (
    <div>
      <PageHeader title="Net worth" />

      <div className="flex flex-col gap-5">
        {/* Same component as the dashboard tile, at hero scale — see the
            VARIANTS table in NetWorthCard for exactly what differs. */}
        <NetWorthCard variant="hero" />

        {/* Single column until there's room for two; the cards are dense enough
            that side-by-side below ~1024px would cramp the bars. */}
        <div className="grid gap-5 lg:grid-cols-2">
          <CompositionCard
            title="Assets"
            tone="asset"
            total={assets.total}
            buckets={assets.buckets}
          />
          <CompositionCard
            title="Liabilities"
            tone="liability"
            total={liabilities.total}
            buckets={liabilities.buckets}
            footer={
              <>
                <span className="text-sm text-muted-foreground">
                  Debt-to-asset ratio
                </span>
                <span className="text-sm tabular-nums text-foreground">
                  {debtToAssetRatio.toFixed(1)}%
                </span>
              </>
            }
          />
        </div>
      </div>
    </div>
  )
}

export default NetWorth
