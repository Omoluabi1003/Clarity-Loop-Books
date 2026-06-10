import type { UserAccount } from "@/lib/auth";
import { getPlanBadgeLabel } from "@/lib/plans";
export function AccountBadge({ account }: { account: UserAccount }) { return <span className={`account-plan-badge status-${account.planStatus}`}>{getPlanBadgeLabel(account.selectedPlan, account.planStatus)}</span>; }
