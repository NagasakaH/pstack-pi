#!/usr/bin/env bash
# pstack 上流（cursor/plugins の pstack プラグイン）からの同期スクリプト。
# dsh 版 (pstack-dsh) と同じ手順だが、Pi 版は実行コードを持たないため
# setup-pstack は「実行時に隠す」のではなく「同梱しない」で除外する。
# 追加スキル skills/pstack-harness/ は --exclude で --delete から保護される。
set -euo pipefail
cd "$(dirname "$0")/.."

UPSTREAM_REPO="https://github.com/cursor/plugins.git"
VENDOR="vendor-src"
SRC="$VENDOR/plugins/pstack"

rm -rf "$VENDOR"
git clone --filter=blob:none --sparse --depth 1 "$UPSTREAM_REPO" "$VENDOR"
git -C "$VENDOR" sparse-checkout set plugins/pstack

echo "upstream commit: $(git -C "$VENDOR" rev-parse HEAD)"
grep -m1 '"version"' "$SRC/plugin.json" || true

rsync -a --delete --exclude 'setup-pstack/' --exclude 'pstack-harness/' "$SRC/skills/" skills/
rsync -a --delete "$SRC/agents/"            agents/
rsync -a --delete "$SRC/automations/"       automations/
rsync -a --delete "$SRC/docs/"              docs/upstream/
cp "$SRC/LICENSE" LICENSE
cp "$SRC/README.md" docs/upstream-README.md

rm -rf "$VENDOR"
node scripts/test-package.mjs
