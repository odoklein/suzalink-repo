import { EmailHubTabs } from "@/components/email/EmailHubTabs";

// Phase 1 — Inbox unification.
// Wraps every /manager/email/<sub-route> with the canonical Hub tab bar.
// The Inbox itself (/manager/email exact) lives outside this group and renders
// without tabs so it can fill the full viewport via AppLayoutShell's isEmailHub
// branch.
export default function ManagerEmailHubLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4">
                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Email
                </p>
                <EmailHubTabs />
            </div>
            {children}
        </div>
    );
}
