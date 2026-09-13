#!/usr/bin/env bash
#
# Runs the GLoW database layer against a throwaway local PostgreSQL and asserts
# that the booking transactions, the public invitation endpoint and Row Level
# Security all behave. No Supabase account needed.
#
#   ./scripts/verify-sql.sh
#
# Requires PostgreSQL 14+ server binaries (initdb, pg_ctl, psql).
# On Debian/Ubuntu: sudo apt-get install -y postgresql
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PGDATA="${GLOW_PG_DATA:-/tmp/glow-verify-pg}"
# The socket lives beside PGDATA, since initdb requires an empty data directory.
SOCKET_DIR="${PGDATA}-socket"

PGBIN="$(dirname "$(command -v psql 2>/dev/null || echo /usr/bin/psql)")"
for candidate in /usr/lib/postgresql/*/bin; do
  [ -x "$candidate/initdb" ] && PGBIN="$candidate"
done
if [ ! -x "$PGBIN/initdb" ]; then
  echo "PostgreSQL server binaries not found (initdb). Install postgresql first." >&2
  exit 1
fi

# initdb refuses to run as root, so drop privileges when we are root.
RUNNER=""
if [ "$(id -u)" = "0" ]; then
  id -u glowpg >/dev/null 2>&1 || useradd -m glowpg
  RUNNER="glowpg"
fi
as_pg() {
  if [ -n "$RUNNER" ]; then su "$RUNNER" -c "$1"; else bash -c "$1"; fi
}

stop_server() { as_pg "$PGBIN/pg_ctl -D $PGDATA stop -m immediate" >/dev/null 2>&1 || true; }
# err.log lives outside PGDATA so the data directory stays pristine for initdb.
ERR_LOG="${PGDATA}-error.log"
trap stop_server EXIT

echo "==> starting a throwaway PostgreSQL"
stop_server
rm -rf "$PGDATA" "$SOCKET_DIR"
mkdir -p "$PGDATA" "$SOCKET_DIR"
if [ -n "$RUNNER" ]; then chown -R "$RUNNER" "$PGDATA" "$SOCKET_DIR"; fi

as_pg "$PGBIN/initdb -D $PGDATA -U postgres --auth=trust" >/dev/null
# Listen on a Unix socket only: no TCP port to collide with anything.
as_pg "$PGBIN/pg_ctl -D $PGDATA -o \"-c listen_addresses='' -k $SOCKET_DIR\" -l $PGDATA/server.log start" >/dev/null
sleep 2

PSQL=(psql -h "$SOCKET_DIR" -U postgres -q -v ON_ERROR_STOP=1)

apply() {
  local db="$1" file="$2" label="$3"
  if "${PSQL[@]}" -d "$db" -f "$ROOT/$file" >/dev/null 2>"$ERR_LOG"; then
    echo "    ok   $label"
  else
    echo "    FAIL $label" >&2
    grep -E "ERROR|LINE|DETAIL" "$ERR_LOG" | head -6 >&2
    exit 1
  fi
}

# Some files are meant to refuse. A message nobody can reach is not a message,
# so the refusal is tested the same way the success is.
refuses() {
  local db="$1" file="$2" needle="$3" label="$4"
  local out
  if out=$("${PSQL[@]}" -d "$db" -f "$ROOT/$file" 2>&1); then
    echo "    FAIL $label (it succeeded instead of refusing)" >&2
    exit 1
  fi
  if ! echo "$out" | grep -qF "$needle"; then
    echo "    FAIL $label" >&2
    echo "      expected to see: $needle" >&2
    echo "$out" | grep -E "ERROR|HINT" | head -4 >&2
    exit 1
  fi
  echo "    ok   $label"
}

assert() {
  local db="$1" file="$2"
  local out
  if ! out=$("${PSQL[@]}" -d "$db" -f "$ROOT/$file" 2>&1); then
    echo "$out" | grep -E "ERROR|DETAIL|CONTEXT" | head -8 >&2
    exit 1
  fi
  # psql prefixes notices with "psql:<file>:<line>: NOTICE:  " - strip that.
  echo "$out" | grep NOTICE | sed -E 's/^.*NOTICE: +/    ok   /'
}

# --- 1. the migrations, applied the way `supabase db push` applies them -------
echo "==> applying migrations"
"${PSQL[@]}" -d postgres -c "create database glow_migrations;" >/dev/null
apply glow_migrations scripts/sql/stub-supabase.sql "supabase stub"
for migration in "$ROOT"/supabase/migrations/*.sql; do
  apply glow_migrations "supabase/migrations/$(basename "$migration")" "$(basename "$migration")"
done
apply glow_migrations supabase/seed.sql "seed.sql"

echo "==> asserting booking behaviour"
assert glow_migrations scripts/sql/assert-booking.sql

echo "==> asserting who gets in, and as what"
assert glow_migrations scripts/sql/assert-joining.sql

echo "==> asserting the workout of the day stays hidden until booked"
assert glow_migrations scripts/sql/assert-workouts.sql

# The filler on a database that has the club but not the workout library - the
# state anyone is in between running an older setup.sql and the current one.
# Without a reachable guard it fails deep inside a PL/pgSQL block with
# `type "public.workout_category" does not exist`, which tells nobody anything.
echo "==> asserting the timetable filler explains itself when run too early"
"${PSQL[@]}" -d postgres -c "create database glow_early;" >/dev/null
apply glow_early scripts/sql/stub-supabase.sql "supabase stub"
for migration in "$ROOT"/supabase/migrations/2026010100000[0-4]_*.sql; do
  apply glow_early "supabase/migrations/$(basename "$migration")" "$(basename "$migration")"
done
apply glow_early supabase/seed.sql "seed.sql"
refuses glow_early supabase/fill-schedule.sql \
  "The workout library is not installed." \
  "it names the missing piece instead of failing on a type"

# The timetable filler is applied twice on purpose: it is meant to be re-run
# weekly to roll the window forward, and a second run must not duplicate a day.
echo "==> asserting the hourly timetable filler"
apply glow_migrations supabase/fill-schedule.sql "fill-schedule.sql"
apply glow_migrations supabase/fill-schedule.sql "fill-schedule.sql, again"
assert glow_migrations scripts/sql/assert-fill-schedule.sql

# --- 2. setup.sql, the single file pasted into the Supabase SQL editor --------
echo "==> applying setup.sql (the one-paste path)"
"${PSQL[@]}" -d postgres -c "create database glow_setup;" >/dev/null
apply glow_setup scripts/sql/stub-supabase.sql "supabase stub"
apply glow_setup supabase/setup.sql "setup.sql"

echo "==> asserting starter content"
assert glow_setup scripts/sql/assert-starter-content.sql

# Nobody pastes setup.sql exactly once. People re-run it after editing an
# address, or because they lost track of whether the first paste finished.
# A second run must be a no-op rather than "type member_role already exists".
echo "==> applying setup.sql a second time (it has to be re-runnable)"
apply glow_setup supabase/setup.sql "setup.sql, again"
assert glow_setup scripts/sql/assert-starter-content.sql

echo
echo "All database checks passed."
