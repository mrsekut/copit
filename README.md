# copit

A GitHub File Fetcher TUI application that allows you to browse and download files from GitHub repositories with OAuth authentication, fuzzy search, and download history management.

## Features

- 🔐 **GitHub OAuth Authentication** - Secure Device Flow authentication
- 🔍 **Fuzzy Search** - Fast file and repository search using fuse.js
- 📋 **Download History** - Track and quickly re-download recent files
- 🚀 **Terminal UI** - Beautiful terminal interface built with ink + React
- 💾 **Encrypted Storage** - Secure token storage with AES-256-GCM encryption
- 🛡️ **Security** - Path traversal protection and input validation

## Installation

### Global Installation

```bash
# Install globally via npm
npm install -g copit

# Or install via bunx (recommended)
bunx copit
```

### Local Development

```bash
# Clone the repository
git clone https://github.com/mrsekut/copit.git
cd copit

# Install dependencies
bun install

# Run in development mode
bun run dev
```

## Usage

### Basic Usage

```bash
# Run the application
copit

# Or with bunx
bunx copit
```

### Environment Variables

Create a `.env` file or set environment variables:

```bash
# GitHub OAuth Client ID (optional - uses default if not set)
GITHUB_CLIENT_ID=your_github_client_id
```

### First Run

1. Run `copit` command
2. Follow the OAuth authentication flow
3. Browse repositories and download files
4. Use Tab to switch between History and Browse modes

### Navigation

- **↑/↓** - Navigate through lists
- **Enter** - Select/Download files
- **Tab** - Switch between History and Browse modes
- **Esc** - Go back or exit
- **Type** - Fuzzy search in any list

## GitHub OAuth Setup

To use your own GitHub OAuth App:

1. Go to [GitHub Developer Settings](https://github.com/settings/applications/new)
2. Create a new OAuth App with these settings:
   - Application name: `copit` (or your preferred name)
   - Homepage URL: `https://github.com/mrsekut/copit`
   - Authorization callback URL: `http://localhost` (not used for device flow)
3. Enable "Device Flow" in the app settings
4. Copy the Client ID and set it as `GITHUB_CLIENT_ID` environment variable

## Architecture

Built with modern technologies and patterns:

- **Runtime**: Bun
- **UI**: ink + React for terminal interface
- **State Management**: jotai
- **Authentication**: GitHub OAuth Device Flow
- **Search**: fuse.js for fuzzy search
- **Architecture**: Package by Feature pattern
- **Language**: TypeScript with strict type checking

## Security

- OAuth tokens are encrypted using AES-256-GCM
- Path traversal protection for file downloads
- Input validation and sanitization
- No hardcoded secrets (configurable via environment variables)

## Scripts

```bash
# Development
bun run dev          # Start development server
bun run build        # Build for production
bun run typecheck    # Run TypeScript type checking
bun run lint         # Run ESLint
bun run format       # Format code with Prettier
bun run test         # Run tests
bun run check        # Run all checks (typecheck + lint + format + test)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run `bun run check` to ensure code quality
5. Submit a pull request

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Author

[mrsekut](https://github.com/mrsekut)
