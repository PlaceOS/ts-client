#!/usr/bin/env bash
# Opens a pull request when the generated client does not match the API documents on master, and
# closes the older regeneration pull requests. `.github/workflows/regenerate.yml` runs it each day,
# from the root of the repository.
#
#     scripts/regenerate-pr.sh            Regenerates, then pushes and opens or closes PRs.
#     DRY_RUN=1 scripts/regenerate-pr.sh  Regenerates and shows what it would do on GitHub.
#
# The branch name has a hash of the change. A second run with the same change finds the open PR
# and does nothing. A run with another change opens a new PR and closes the old ones. Each run also
# deletes the regeneration branches that have no open PR, such as the branch of a merged PR.
set -euo pipefail

readonly BRANCH_PREFIX='bot/regenerate-'
readonly BASE="${BASE:-master}"
# More open regeneration PRs or branches than this is a bug in this script, not a normal state.
readonly PRS_MAX=50
readonly BRANCHES_MAX=200
readonly LOG_DIR="${RUNNER_TEMP:-$(mktemp -d)}"
# The files that `generate` and `v1-map` write.
readonly GENERATED=(src/generated src/migrate/v1-map.ts src/compat/enums.ts)

# Runs a command that changes GitHub. A dry run prints it.
remote() {
    if [ "${DRY_RUN:-}" = 1 ]; then
        echo "dry run: $*"
    else
        "$@"
    fi
}

# The open regeneration PRs: "<number> <branch>" on each line.
open_prs() {
    gh pr list --state open --base "$BASE" --limit "$PRS_MAX" --json number,headRefName \
        --jq ".[] | select(.headRefName | startswith(\"$BRANCH_PREFIX\")) | \"\(.number) \(.headRefName)\""
}

# Closes each open regeneration PR except the one on branch $1, with the comment $2.
close_others() {
    local keep="$1" comment="$2" prs number head
    # A failure of `gh` stops the script here, not in the loop.
    prs="$(open_prs)"
    while read -r number head; do
        if [ -z "$number" ] || [ "$head" = "$keep" ]; then continue; fi
        echo "Closing #$number ($head)."
        remote gh pr close "$number" --delete-branch --comment "$comment"
    done <<<"$prs"
}

# Deletes each regeneration branch on the remote without an open PR, except the branch $1. The
# branch of a merged PR stays when the repository does not delete it, and a run can push a branch
# and then fail to open its PR.
delete_orphan_branches() {
    local keep="$1" prs branches branch count=0
    prs="$(open_prs)"
    branches="$(git ls-remote --heads origin "refs/heads/$BRANCH_PREFIX*" | sed 's#.*refs/heads/##')"
    while read -r branch; do
        if [ -z "$branch" ] || [ "$branch" = "$keep" ]; then continue; fi
        if awk -v branch="$branch" '$2 == branch { found = 1 } END { exit !found }' <<<"$prs"; then
            continue
        fi
        count=$((count + 1))
        if [ "$count" -gt "$BRANCHES_MAX" ]; then
            echo "More than $BRANCHES_MAX regeneration branches. Delete them by hand." >&2
            exit 1
        fi
        echo "Deleting the branch $branch. It has no open PR."
        remote git push origin --delete "$branch"
    done <<<"$branches"
}

bun run generate && bun run v1-map
# Staged, so that a new generated file, such as one of a new controller, is in the diff and the hash.
git add -A -- "${GENERATED[@]}"

if git diff --cached --quiet -- "${GENERATED[@]}"; then
    echo "The generated client matches the API documents."
    close_others '' "Closed by the scheduled regeneration: \`$BASE\` matches the API documents now."
    delete_orphan_branches ''
    exit 0
fi

hash="$(git diff --cached --binary -- "${GENERATED[@]}" | sha256sum | cut -c1-12)"
branch="$BRANCH_PREFIX$hash"
prs="$(open_prs)"
existing="$(awk -v branch="$branch" '$2 == branch { print $1 }' <<<"$prs")"
if [ -n "$existing" ]; then
    echo "#$existing has this change."
    close_others "$branch" "Superseded by #$existing."
    delete_orphan_branches "$branch"
    exit 0
fi

# A PR that the workflow token opens does not start the PR checks, so the results go in the PR.
results=''
for check in v1-map:check check test build; do
    if bun run "$check" >"$LOG_DIR/$check.log" 2>&1; then
        results+="- \`bun run $check\`: passes"$'\n'
    else
        results+="- \`bun run $check\`: **fails**. See the log of the workflow run."$'\n'
        echo "bun run $check fails:" && tail -n 40 "$LOG_DIR/$check.log"
    fi
done

rest_api="$(gh api repos/PlaceOS/rest-api/commits/master --jq .sha)"
staff_api="$(gh api repos/PlaceOS/staff-api/commits/master --jq .sha)"
run_url="${GITHUB_SERVER_URL:-https://github.com}/${GITHUB_REPOSITORY:-PlaceOS/ts-client}/actions/runs/${GITHUB_RUN_ID:-local}"
body="$LOG_DIR/body.md"
cat >"$body" <<EOF
The API documents on master changed, so the generated client is out of date.

This regenerates \`src/generated\`, \`src/generated/staff\` and the 6.x migration map from:

- PlaceOS/rest-api \`${rest_api:0:12}\`
- PlaceOS/staff-api \`${staff_api:0:12}\`

Examine the diff for changes that break apps, such as a field that is now \`null\` or a removed
operation.

${results}
\`\`\`
$(git diff --cached --stat -- "${GENERATED[@]}" | tail -n 25)
\`\`\`

The [scheduled regeneration]($run_url) opened this PR. It closes this PR when a newer
regeneration replaces it, or when \`$BASE\` matches the API documents.
EOF

git config user.name 'github-actions[bot]'
git config user.email '41898282+github-actions[bot]@users.noreply.github.com'
git switch -c "$branch"
git commit -q -m 'chore: regenerate the client from the API documents'
# A branch of this name can be left from a failed run on an older base. Only this script writes to
# the prefix, so the push replaces it.
remote git push --force origin "$branch"
remote gh pr create --base "$BASE" --head "$branch" \
    --title 'chore: regenerate the client from the API documents' --body-file "$body"

if [ "${DRY_RUN:-}" = 1 ]; then
    number='<new>'
    cat "$body"
else
    number="$(gh pr view "$branch" --json number --jq .number)"
fi
close_others "$branch" "Superseded by #$number."
delete_orphan_branches "$branch"
