# pstack → Pi 移植ノート（非公式ポート）

[upstream pstack](https://github.com/cursor/plugins/tree/main/pstack)（MIT, Lauren Tan）の
スキル群を、[Pi coding agent](https://pi.dev) の Pi パッケージとして使えるようにした
**非公式ポート**です。上流ファイルは 1 バイトも変更していません。

## Pi 側の対応状況（dsh 版との違い）

Pi は [Agent Skills 仕様](https://agentskills.io/specification)をそのまま実装しているため、
dsh 版のようなプロバイダプラグイン（コード）は**不要**でした。移植面は以下だけです。

| 論点 | Cursor 上流 | Pi | このポートの処置 |
| --- | --- | --- | --- |
| SKILL.md frontmatter | `name` / `description` / `disable-model-invocation` | 同一仕様（追加キーは警告のみ） | **無変更でそのまま** |
| スキル起動 | `/name` | `/skill:<name>`（`disable-model-invocation: true` でも可） | ハーネステーブ表中に明記 |
| モデル自動発火 | 全 57 スキルが `disable-model-invocation: true` | 同じ意味（カタログに出ない） | 上流設計どおり維持 |
| `Task` サブエージェント | 内蔵 | 内蔵なし（`pi -p` で代替） | `pstack-harness` スキルが表で変換 |
| `AskQuestion` | 内蔵 | なし | 同上（プレーンテキストで質問） |
| `.cursor/rules/*.mdc` | 常時適用ルール | `AGENTS.md` / `~/.pi/agent/AGENTS.md` | 同上 |
| トランスクリプト | `~/.cursor/projects/...` | `~/.pi/agent/sessions/--<slug>--/*.jsonl` | 同上 |
| `setup-pstack` | `.mdc` ルール書き込み | 書き込み先が存在しない | **同期時に除外**（dsh 版は実行時除外） |
| `agents/*.md` | `subagent_type` で参照可能 | 自動登録されない | リファレンス同梱。ブリーフに本文を貼る |

## pstack-harness スキル

上流の Claude Code 移植は `docs/harness/claude-code.md` を「セッション開始時に 1 回読む」
運用を前提にしています。Pi では「必要時にモデルが読みに行くモデル発火可能スキル」が
その役割を持てるので、同じ内容の対応表を **`skills/pstack-harness/SKILL.md`** として
追加しました（このポートが追加する唯一のファイル群。モデル発火可能なので、pstack
スキル本文に出てくる Cursor 名（`Task`, `AskQuestion`, `~/.cursor/...`）に遭遇した折に
自動で読まれます）。

## setup-pstack を同梱しない理由

`setup-pstack` は「モデル役割テーブルを `~/.cursor/rules/pstack-models.mdc` に書く」
セットアップスキルで、Claude Code 版も `~/.claude/rules/` への書き換え案内付きで
同梱されています。Pi には対応する常時ルール機構の書き込み先がなく
（`AGENTS.md` は手編集前提）、`pstack-harness` 側に `~/.pi/agent/AGENTS.md` へ
1 行/役割で保存する案内を入れたため、スキル自体は同期から除外しています。
どうしても必要なら上流の原文を直接参照してください。

## スキル名の衝突

Pi の仕様では名前の衝突は「先に発見されたものが勝つ」+ 警告 1 行です。
パッケージ由来よりユーザー/プロジェクト由来（`~/.agents/skills/` 等）が後に読まれる
ため、`~/.agents/skills/<name>/SKILL.md` を置けば pstack 版を上書きできます。
`pstack-harness` は当ポート追加のスキル名なので衝突に気づきやすいはずです。

## 既知の警告

上流 frontmatter の `icon` / `color` 等は Agent Skills 仕様の外側で、Pi は起動時に
警告を出します（仕様上「警告のみ、ロードは継続」）。上流ファイル無変更を貫くため
あえて残しています。警告がうるさい場合は frontmatter から該当キーを削ってください。

## 上流との同期

```bash
./scripts/sync-upstream.sh   # 上流を sparse clone → skills/ 等へ rsync → 検証
```

`skills/pstack-harness/` は rsync の `--exclude` で削除から保護されます。
`setup-pstack` は同じ除外設定でコピーも削除もしません（元々置いていない）。
