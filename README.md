# プロジェクト整形とインデントについて

このリポジトリでは、ソースコードのインデントを「タブ（幅 4）」に統一しています。

-   エディタ設定:

    -   `editor.detectIndentation`: `false`（ファイル内の既存インデントを自動検出しない）
    -   `editor.tabSize`: `4`
    -   `editor.insertSpaces`: `false`（実際のタブ文字を使う）
    -   上記はリポジトリルートの `.vscode/settings.json` とワークスペース設定で管理しています。

-   エディタ間の互換性（EditorConfig）:

    -   ルートに `.editorconfig` を置いて、対象ファイルの `indent_style = tab` と `tab_width = 4` を指定しています。

-   Prettier:
    -   `.prettierrc` に `useTabs: true` と `tabWidth: 4` を指定しています。
    -   フォーマットは Prettier を使って一括で適用できます。

一括整形（例）:

npx prettier --check "frontend/serp/\*_/_.{ts,tsx,js,jsx,json,css,scss,html,md}"

npx prettier --write "frontend/serp/\*_/_.{ts,tsx,js,jsx,json,css,scss,html,md}"

git add -A
git commit -m "chore: format files to tabs (tab width 4)"

ヒント:

-   VS Code でプロジェクトのルールを確実に適用するには、`editor.detectIndentation` を `false` に設定してからファイルを保存（あるいは Format Document）してください。
-   Prettier の CLI は `useTabs: true` を尊重してタブに変換します。大きな変更が心配であれば、先に `--check`（差分確認）を行ってください。

-   Python の例外:

    -   Python ファイルは `PEP8` に従い **スペース 4**（`indent_size = 4`）に統一しています。
    -   これは `.editorconfig` の `[*.py]` セクションと、ワークスペースの `[python]` 設定（`editor.insertSpaces = true`, `editor.tabSize = 4`）で適用されます。
