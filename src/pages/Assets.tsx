import PageHeader from "@/components/layout/PageHeader.tsx"
import ManualItemsBanner from "@/components/manualItems/ManualItemsBanner.tsx"
import ManualItemsCard from "@/components/manualItems/ManualItemsCard.tsx"
import { getManualItemsSummary } from "@/data"

function Assets() {
  // One call, both cards. Splitting by `kind` happens in the data layer
  // (summarizeManualItems) rather than here, for the same reason the net-worth
  // buckets do: it's a derivation, and derivations that two screens depend on
  // belong somewhere testable. These totals are the same figures the net-worth
  // screen shows as its "Manual assets" and "Loans" buckets.
  const { assets, liabilities } = getManualItemsSummary()

  return (
    <div>
      <PageHeader title="Assets & liabilities" />

      <div className="flex flex-col gap-5">
        <ManualItemsBanner />

        {/* items-start, so each card sizes to its own rows. Deliberately unlike
            the spending screen, where the two cards are stretched to match:
            there they read as one row of a pair, whereas here the reference
            shows the liabilities card ending well short of the assets card. */}
        <div className="grid items-start gap-5 lg:grid-cols-2">
          <ManualItemsCard
            title="Manual assets"
            total={assets.total}
            items={assets.items}
            tone="asset"
          />
          <ManualItemsCard
            title="Manual liabilities"
            total={liabilities.total}
            items={liabilities.items}
            tone="liability"
          />
        </div>
      </div>
    </div>
  )
}

export default Assets
