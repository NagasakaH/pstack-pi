# pstack-pi

[pstack](https://github.com/cursor/plugins/tree/main/pstack)（Cursor 用プラグイン、作者
Lauren Tan、MIT）のスキル群を、[Pi coding agent](https://pi.dev) でそのまま使えるようにした
**非公式 Pi ポート**です。上流ファイルは無変更。Pi は Agent Skills 仕様を実装して
いるので、dsh 版のようなコードは不要、リソースだけの Pi パッケージです。

- 同梱スキル: 上流 58 本中 57 本（`setup-pstack` のみ Pi に対応機構がなく除外）
  + `pstack-harness`（Cursor 固有記述を Pi に読み替える表。当ポート追加）
- 対応確認: Pi 1.1.0

## インストール

```bash
pi install git:github.com/NagasakaH/pstack-pi     # GitHub から
pi install /path/to/pstack-pi                     # ローカル checkout から
```

`package.json` の `pi.skills` が `skills/` を指すだけなので、`~/.agents/skills/` に
`skills/` 以下を置いて素のスキルとして発見させることもできます。

## 使い方

上流 pstack の全スキルは `disable-model-invocation: true`（モデル自動発火 off）の設計で、
Pi ではスラッシュコマンドで起動します:

```
/skill:poteto-mode          # pstack 全体のハブ。ここから入るのが定番
/skill:how この関数どう動いてる?
/skill:unslop
/skill:tdd
```

57 本すべては `/skill:` で起動可能（入力欄の補完に出ないものは frontmatter を見てください）。
代表例:

| 用途 | スキル |
| --- | --- |
| モード（フルワークフロー） | `poteto-mode`, `automate-me` |
| 調査・理解 | `how`, `why`, `figure-it-out`, `interrogate`, `teach`, `recall` |
| 設計・実装 | `architect`, `arena`, `swarm`, `tdd`, `correct`, `statechart` |
| 検証 | `show-me-your-work`, `blast-radius`, `create-verification-skill` |
| 文章 | `unslop`, `technical-writing`, `no-comments` |
| 原則リファレンス | `principle-*` 24 本（他スキルから参照される部品） |

pstack のスキル本文は Cursor 語彙（`Task`, `AskQuestion`, `~/.cursor/...`,
Cursor モデルスラッグ）で書かれています。`pstack-harness` スキルが Pi への読み替え表を
持ち、Pi は pstack スキルに従う際にそれを拾いにいきます（読み落とす場合は
`/skill:pstack-harness` で明示）。

## このポートの構成

| パス | 内容 |
| --- | --- |
| `skills/` | 上流スキル 57 本（無変更）+ `pstack-harness`（追加） |
| `agents/` | 上流のサブエージェント定義。Pi は自動登録しないので、Task 相当のブリーフに本文を貼る |
| `automations/`, `docs/upstream/` | 上流のリファレンス（Cursor Automations 等は Pi では使えない） |
| [PORTING.md](PORTING.md) | Cursor→Pi の移植方針と意図的に隠した/除外したものの記録 |
| [UPSTREAM.md](UPSTREAM.md) | 上流コミットとライセンス来歴 |
| `scripts/sync-upstream.sh` | 上流からの再同期 |

## 非公式ポートであること

Cursor 公式・Pi 公式どちらもではありません。pstack の著作権・商標は上流作者に帰属します
（MIT、`LICENSE` 参照）。バグ報告はまず本リポジトリへ。上流そのものの問題の場合は
cursor/plugins への issue 誘導があります。
