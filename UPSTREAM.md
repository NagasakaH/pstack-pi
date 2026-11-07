# Upstream provenance / 上流の来歴

このリポジトリ [NagasakaH/pstack-pi](https://github.com/NagasakaH/pstack-pi) は、
下記上流の **非公式 Pi ポート** です。

| 項目 | 値 |
| --- | --- |
| 上流リポジトリ | [cursor/plugins](https://github.com/cursor/plugins) — `pstack/` ディレクトリ |
| 同期したコミット | `6b0300214a09fd6029cfb7077043125758cd1fd2` (main) |
| 上流バージョン | pstack 0.15.36 |
| ライセンス | MIT（`LICENSE` を同梱。上流Copyrightを保持） |
| 作者 | Lauren Tan（上流記載どおり） |

- `skills/`（`skills/pstack-harness/` を除く）, `agents/`, `docs/upstream/`,
  `automations/`, `LICENSE`, `docs/upstream-README.md` は上流の内容を**無変更**で
  コピーしたもの。frontmatter の書き換え等は一切加えていない。
  Pi 向けの読み替え方針は [PORTING.md](PORTING.md) を参照。
- `skills/pstack-harness/` のみが当ポートの追加（上流の Claude Code 移植表
  `docs/upstream/harness/claude-code.md` に対応する Pi 版読み替え表）。
- 上流の `setup-pstack` は Pi に該当機構がないため同期から除外（PORTING.md 参照）。
- 再同期は `bash scripts/sync-upstream.sh`（上流を `vendor-src/` に sparse clone して
  rsync する。`vendor-src/` は gitignore 済み）。
- 上流の `plugin.json` / `.cursor-plugin/`（Cursor プラグインマニフェスト）は
  持ち込まない。Pi 側の変換は `package.json` の `pi` キーが担う。
