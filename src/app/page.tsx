import { auth, signIn, signOut } from "@/auth";
import { ModeDoorSelect } from "@/components/home/ModeDoorSelect";
import { ProfileApiTest } from "@/components/dev/ProfileApiTest";

export default async function Home() {
  const session = await auth();
  const userName = session?.user?.name ?? session?.user?.email ?? "Developer";
  const isGoogleConfigured = hasOAuthProviderConfig("AUTH_GOOGLE");
  const isGithubConfigured = hasOAuthProviderConfig("AUTH_GITHUB");

  return (
    <div className="min-h-dvh bg-[#071018] font-sans text-white">
      <main className="flex min-h-dvh flex-col">
        <ProfileApiTest />
        <ModeDoorSelect />

        <footer className="home-footer w-full shrink-0 border-t border-cyan-300/15 bg-[#071018]">
          <section className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 py-2 text-xs font-medium text-slate-300 sm:flex-row sm:items-center sm:justify-between">
            {session ? (
              <>
                <p>
                  Signed in as{" "}
                  <span className="font-bold text-cyan-100">
                    {userName}
                  </span>
                </p>
                <form
                  action={async () => {
                    "use server";
                    await signOut();
                  }}
                >
                  <button
                    className="border border-cyan-300/40 bg-black/40 px-3 py-1.5 font-bold text-cyan-100 transition hover:border-cyan-100 hover:bg-cyan-500/10"
                    type="submit"
                  >
                    Logout
                  </button>
                </form>
              </>
            ) : (
              <div className="flex flex-col gap-1 sm:items-end">
                <div className="flex flex-wrap gap-2">
                  {isGoogleConfigured ? (
                    <form
                      action={async () => {
                        "use server";
                        await signIn("google");
                      }}
                    >
                      <button
                        className="border border-cyan-300/40 bg-black/40 px-3 py-1.5 font-bold text-cyan-100 transition hover:border-cyan-100 hover:bg-cyan-500/10"
                        type="submit"
                      >
                        Login with Google
                      </button>
                    </form>
                  ) : (
                    <button
                      className="cursor-not-allowed border border-slate-500/30 bg-black/30 px-3 py-1.5 font-bold text-slate-500"
                      disabled
                      type="button"
                    >
                      Google login not configured
                    </button>
                  )}

                  {isGithubConfigured ? (
                    <form
                      action={async () => {
                        "use server";
                        await signIn("github");
                      }}
                    >
                      <button
                        className="border border-cyan-300/40 bg-black/40 px-3 py-1.5 font-bold text-cyan-100 transition hover:border-cyan-100 hover:bg-cyan-500/10"
                        type="submit"
                      >
                        Login with GitHub
                      </button>
                    </form>
                  ) : (
                    <button
                      className="cursor-not-allowed border border-slate-500/30 bg-black/30 px-3 py-1.5 font-bold text-slate-500"
                      disabled
                      type="button"
                    >
                      GitHub login not configured
                    </button>
                  )}
                </div>
                {!isGoogleConfigured || !isGithubConfigured ? (
                  <p className="max-w-md text-[11px] text-slate-500">
                    Add OAuth client IDs and secrets to .env.local to enable sign-in.
                  </p>
                ) : null}
              </div>
            )}
          </section>
        </footer>
      </main>
    </div>
  );
}

function hasOAuthProviderConfig(prefix: "AUTH_GOOGLE" | "AUTH_GITHUB") {
  return Boolean(process.env[`${prefix}_ID`] && process.env[`${prefix}_SECRET`]);
}
