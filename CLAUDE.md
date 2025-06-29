# Bun TypeScript Project Rules

## Project Overview

- **Purpose**: Bun TypeScript starter project
- **Language**: TypeScript
- **Runtime**: Bun (JavaScript/TypeScript runtime alternative to Node.js)
- **Main Features**: Fast startup, built-in bundler, native TypeScript support

## Bun-Specific Rules

Default to using Bun instead of Node.js.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Bun automatically loads .env, so don't use dotenv.

### Bun APIs

- `Bun.serve()` supports WebSockets, HTTPS, and routes. Don't use `express`.
- `bun:sqlite` for SQLite. Don't use `better-sqlite3`.
- `Bun.redis` for Redis. Don't use `ioredis`.
- `Bun.sql` for Postgres. Don't use `pg` or `postgres.js`.
- `WebSocket` is built-in. Don't use `ws`.
- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

### Testing with Bun

Use `bun test` to run tests.

```ts
import { test, expect } from "bun:test";

test("hello world", () => {
	expect(1).toBe(1);
});
```

### Frontend Development

Use HTML imports with `Bun.serve()`. Don't use `vite`. HTML imports fully support React, CSS, Tailwind.

Server example:

```ts
import index from "./index.html";

Bun.serve({
	routes: {
		"/": index,
		"/api/users/:id": {
			GET: (req) => {
				return new Response(JSON.stringify({ id: req.params.id }));
			},
		},
	},
	websocket: {
		open: (ws) => {
			ws.send("Hello, world!");
		},
		message: (ws, message) => {
			ws.send(message);
		},
		close: (ws) => {
			// handle close
		},
	},
	development: {
		hmr: true,
		console: true,
	},
});
```

## TypeScript コーディングルール

### 基本原則

- 型定義は interface ではなく、type を使用する
- for よりも map などの関数型メソッドを優先して使用する
- let は一切使わず、const を使用
- 外部で使われていない場合は export しない
- 使用していない import や変数は削除
- class は一切使わない

### インポート・エクスポート

- ES Modules 使用時は .js 拡張子を明示してインポート
- 相対パス指定時は一貫したベースパスを使用
- デフォルトエクスポートよりも名前付きエクスポートを優先

### 型安全性

- any 型の使用を避け、適切な型定義を行う
- オプショナル型は `?:` を使用
- Union types で状態を明確に表現
- 配列アクセス時は bounds check を実装

### エラーハンドリング

- Promise ベースの処理では適切な catch を実装
- 型ガードを使用して実行時型チェックを行う
- Error 型を継承したカスタムエラークラスを定義

## 一般的なコーディングプラクティス

### 関数型アプローチ

- 純粋関数を優先
- 不変データ構造を使用
- 副作用を分離
- 型安全性を確保

### ドメイン駆動設計 (DDD)

- 値オブジェクトとエンティティを区別
- 集約で整合性を保証
- リポジトリでデータアクセスを抽象化
- 境界付けられたコンテキストを意識

### テスト駆動開発 (TDD)

- Red-Green-Refactor サイクル
- テストを仕様として扱う
- 小さな単位で反復
- 継続的なリファクタリング

### 使っていないものは消す

- 使用していない変数や関数は消す
- 使用していない import は消す
- 使用していないライブラリは消す
- 不要になったファイルは消す
- 先を見越して過剰な method を先に定義しない

## 実装パターン

### 値オブジェクト

- 不変
- 値に基づく同一性
- 自己検証
- ドメイン操作を持つ

### エンティティ

- ID に基づく同一性
- 制御された更新
- 整合性ルールを持つ

### リポジトリ

- ドメインモデルのみを扱う
- 永続化の詳細を隠蔽
- テスト用のインメモリ実装を提供

## ディレクトリ構成

### Package by Feature

機能単位でコードを整理し、関連するファイルをすべて同じフォルダにまとめる構造。

```
src/
  features/
    auth/
      LoginForm.tsx
      useLogin.ts
      service.ts
      types.ts
      test.ts
    user/
      UserProfile.tsx
      useUserProfile.ts
      service.ts
      types.ts
      test.ts
```

## Git プラクティス

### コミットの作成

- できるだけ小さい粒度で commit を作成する
- commit 前に、format, lint, typecheck, test を実行する
- コミットメッセージは「なぜ」に焦点を当てる
- 明確で簡潔な言葉を使用
- 変更の目的を正確に反映

### コミットメッセージの例

```bash
# 新機能の追加
feat: Result型によるエラー処理の導入

# 既存機能の改善
update: キャッシュ機能のパフォーマンス改善

# バグ修正
fix: 認証トークンの期限切れ処理を修正

# リファクタリング
refactor: Adapterパターンを使用して外部依存を抽象化

# テスト追加
test: Result型のエラーケースのテストを追加

# ドキュメント更新
docs: エラー処理のベストプラクティスを追加
```

## プロジェクト固有のガイドライン

- Bun のビルトイン機能を優先的に使用
- Node.js 固有のパッケージではなく、Bun 対応または Web 標準の API を使用
- パフォーマンスを意識し、Bun の高速性を最大限活用
- ホットリロード機能 (`bun --hot`) を開発時に活用

## セキュリティ考慮事項

- 環境変数は Bun が自動で読み込むため、.env ファイルの管理に注意
- Bun.serve() 使用時は適切なルートガードを実装
- 外部入力の検証を徹底

## 重要な注意事項

- このプロジェクトで実際に作業を行う際は、必ず上記のルールに従う
- 何か実装する前に、これらのプラクティスを参照する
- コードを書いた後は、lint, typecheck, test を実行する

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.md`.
