#!/usr/bin/env bash
#
# Applies the INSERT files that `qparser sql` generated to the database.
#
#   ./load.sh "configs/lesson6(id=7)"             # apply, one transaction per file
#   ./load.sh --dry-run "configs/lesson6(id=7)"   # run all of them, then roll back
#   ./load.sh configs/lesson6*/sdamgia-337947.sql # or name the files yourself
#
# The connection comes from the standard PG* variables; the project's usual host, port and
# database are the defaults, the user and password are not — a load needs write access, and
# the readonly_user in README.md does not have it:
#
#   PGUSER=... PGPASSWORD=... ./load.sh "configs/lesson6(id=7)"
#
# Every generated file is its own BEGIN/COMMIT, so a failure half-way leaves the files before
# it applied and the rest untouched — the message says where it stopped. Worth a --dry-run
# first: it puts everything in one transaction and rolls it back, which checks the whole batch
# against the real schema (unique "order" per lesson included) without writing anything.

set -euo pipefail

: "${PGHOST:=localhost}"
: "${PGPORT:=5432}"
: "${PGDATABASE:=flash_ct}"
export PGHOST PGPORT PGDATABASE

dry_run=false
targets=()

for arg in "$@"; do
    case "$arg" in
        --dry-run) dry_run=true ;;
        -h|--help) sed -n '2,20p' "$0" | cut -c 3-; exit 0 ;;
        -*) echo "Unknown option $arg" >&2; exit 2 ;;
        *) targets+=("$arg") ;;
    esac
done

if [ ${#targets[@]} -eq 0 ]; then
    echo "Usage: $0 [--dry-run] <directory with .sql | file.sql ...>" >&2
    exit 2
fi

# A directory means every .sql in it, in name order — which is also the order the startOrder
# values in the configs were handed out in.
files=()
for target in "${targets[@]}"; do
    if [ -d "$target" ]; then
        while IFS= read -r file; do
            files+=("$file")
        done < <(find "$target" -maxdepth 1 -name '*.sql' | sort)
    elif [ -f "$target" ]; then
        files+=("$target")
    else
        echo "No such file or directory: $target" >&2
        exit 2
    fi
done

if [ ${#files[@]} -eq 0 ]; then
    echo "No .sql files in ${targets[*]}" >&2
    exit 2
fi

echo "${PGUSER:-$USER}@$PGHOST:$PGPORT/$PGDATABASE — ${#files[@]} file(s)"
for file in "${files[@]}"; do
    echo "  $file"
done
echo

if $dry_run; then
    # One transaction around the lot, so the rollback undoes all of it. The per-file BEGIN and
    # COMMIT have to go, or the first COMMIT would make everything before it permanent.
    batch=$(mktemp -t qparser-load-XXXXXX.sql)
    trap 'rm -f "$batch"' EXIT
    {
        echo "BEGIN;"
        for file in "${files[@]}"; do
            sed -e '/^BEGIN;$/d' -e '/^COMMIT;$/d' "$file"
        done
        echo "ROLLBACK;"
    } > "$batch"

    psql --quiet --no-psqlrc -v ON_ERROR_STOP=1 -f "$batch" > /dev/null
    echo "--dry-run: everything applied cleanly and was rolled back. Nothing was written."
    exit 0
fi

for file in "${files[@]}"; do
    psql --quiet --no-psqlrc -v ON_ERROR_STOP=1 -f "$file" > /dev/null
    echo "applied  $file"
done

echo
psql --quiet --no-psqlrc -c \
    'SELECT lesson_id, count(*) AS questions, min("order") AS first, max("order") AS last
       FROM questions
      WHERE lesson_id IS NOT NULL
      GROUP BY lesson_id
      ORDER BY lesson_id;'
