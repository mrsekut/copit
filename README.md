# copit

A TUI tool for managing local file templates. Register frequently used config files and copy them to new projects with a single command.

## Features

- 📌 **Template Registration** - Save local files as reusable templates
- 📄 **Relative Path Preservation** - Maintains directory structure (e.g., `.vscode/settings.json`)
- ⚠️ **Overwrite Confirmation** - Prompts before overwriting existing files
- 🚀 **Terminal UI** - Simple interface built with ink + React

## Installation

```bash
# Install globally via npm
npm install -g copit

# Or run directly with bunx
bunx copit
```

## Usage

```bash
copit
```

### Workflow

1. **Register a template**
   - Press `Tab` to switch to Register screen
   - Navigate to the file you want to register
   - Press `Enter` to select, then enter a template name

2. **Use a template**
   - Select a template from the list
   - Press `Enter` to copy it to the current directory
   - Confirm overwrite if the file already exists

3. **Delete a template**
   - Highlight a template and press `d`
   - Confirm deletion

## Development

```bash
# Clone the repository
git clone https://github.com/mrsekut/copit.git
cd copit

# Install dependencies
bun install

# Run in development mode
bun run dev

# Build
bun run build

# Run checks
bun run check
```

## License

MIT
