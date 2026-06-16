import { ShieldAlert, AlertTriangle, Lock, FileWarning } from 'lucide-react';

export default function RulesPage() {
  return (
    <main className="flex-1 max-w-3xl mx-auto w-full px-4 sm:px-6 py-12 animate-fade-in">
      <div className="flex flex-col items-center text-center mb-10">
        <div className="w-16 h-16 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-6">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h1 className="text-3xl font-700 tracking-tight text-foreground mb-3">
          Portal Rules & Terms
        </h1>
        <p className="text-muted-foreground max-w-lg">
          To ensure a secure and fair learning environment, all students must adhere to the following portal rules.
        </p>
      </div>

      <div className="space-y-6">
        <div className="surface p-6 rounded-xl border border-destructive/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-1">
              <Lock className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-600 text-foreground mb-2">Do Not Share Your Login Details</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Your student account and login credentials are for your personal use only. Sharing your logins with anyone else is strictly prohibited.
              </p>
            </div>
          </div>
        </div>

        <div className="surface p-6 rounded-xl border border-destructive/20 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-destructive" />
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0 mt-1">
              <FileWarning className="w-5 h-5 text-destructive" />
            </div>
            <div>
              <h3 className="text-lg font-600 text-foreground mb-2">Do Not Distribute Video Properties</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                All video properties, materials, and resources provided on this portal are the intellectual property of OfficePro Education Institute. You may not download, distribute, record, or share these videos externally.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-12 p-6 rounded-xl bg-destructive/5 border border-destructive/20 flex items-start gap-4">
          <AlertTriangle className="w-6 h-6 text-destructive flex-shrink-0" />
          <div>
            <h4 className="font-600 text-foreground mb-1">Consequences of Violation</h4>
            <p className="text-sm text-muted-foreground">
              Violation of these rules will cause users to become <strong className="text-foreground font-600">permanently inactive</strong> and may lead to <strong className="text-foreground font-600">legal actions</strong> against you. We actively monitor account usage and access patterns to protect our content.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
