import { createClient } from "@/lib/supabase/server";

export default async function TestSupabase() {
  const supabase = await createClient();

  // Test database connection
  const { data: profiles, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .limit(1);

  // Test auth connection
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  // Get table count
  const tables = ["profiles", "clients", "sessions", "recordings"];
  const tableCounts: Record<string, number> = {};

  for (const table of tables) {
    const { count } = await supabase
      .from(table)
      .select("*", { count: "exact", head: true });
    tableCounts[table] = count || 0;
  }

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔌 Supabase Connection Test</h1>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          {profileError ? (
            <div className="flex items-center gap-2 text-red-600">
              <span className="text-2xl">❌</span>
              <div>
                <p className="font-semibold">Connection Failed</p>
                <p className="text-sm text-gray-600">{profileError.message}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-green-600">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold">Connected Successfully!</p>
                <p className="text-sm text-gray-600">
                  Database is accessible and RLS policies are working
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Auth Status */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          {user ? (
            <div className="flex items-center gap-2 text-green-600">
              <span className="text-2xl">✅</span>
              <div>
                <p className="font-semibold">User Authenticated</p>
                <p className="text-sm text-gray-600">{user.email}</p>
                <p className="text-xs text-gray-500 mt-1">ID: {user.id}</p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-yellow-600">
              <span className="text-2xl">⚠️</span>
              <div>
                <p className="font-semibold">Not Authenticated</p>
                <p className="text-sm text-gray-600">
                  No user logged in (this is normal for first setup)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Database Tables */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Database Tables</h2>
          <div className="grid grid-cols-2 gap-4">
            {Object.entries(tableCounts).map(([table, count]) => (
              <div
                key={table}
                className="border border-gray-200 rounded p-4 flex justify-between items-center"
              >
                <span className="font-medium capitalize">{table}</span>
                <span className="text-2xl font-bold text-blue-600">
                  {count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Configuration</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <div>
                <p className="font-semibold">Supabase URL</p>
                <p className="text-gray-600 font-mono text-xs break-all">
                  {process.env.NEXT_PUBLIC_SUPABASE_URL || "Not configured"}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-2">
              <span className="text-green-500">✓</span>
              <div>
                <p className="font-semibold">Anon Key</p>
                <p className="text-gray-600 font-mono text-xs">
                  {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
                    ? `${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(
                        0,
                        20
                      )}...`
                    : "Not configured"}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Next Steps */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            🚀 Next Steps
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li>Create authentication pages (login/signup)</li>
            <li>Implement user registration and login</li>
            <li>Build the dashboard layout with sidebar</li>
            <li>Start with the Clients module (Phase 2)</li>
          </ol>
          <p className="mt-4 text-sm text-blue-700">
            See{" "}
            <code className="bg-blue-100 px-2 py-1 rounded">
              SETUP_GUIDE.md
            </code>{" "}
            for detailed instructions.
          </p>
        </div>
      </div>
    </div>
  );
}
