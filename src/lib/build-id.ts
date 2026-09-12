import 'server-only';

/**
 * Identifies the deployment the browser is currently running.
 *
 * The service worker is registered under this id, so every deployment is a
 * distinct worker script URL. That is what makes the browser fetch the new
 * worker instead of keeping the copy it already has - without it, a member who
 * installed the app would stay on the version they first got.
 *
 * Vercel sets the commit sha on every build. Anywhere else the id is stable,
 * which is what a local build wants.
 */
export function buildId(): string {
  const sha = process.env.VERCEL_GIT_COMMIT_SHA;
  if (sha) return sha.slice(0, 12);
  return process.env.BUILD_ID ?? 'dev';
}
