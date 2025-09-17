# Pickleball Finder - Electron React TypeScript App

A modern desktop application built with Electron, React, and TypeScript for finding and connecting with pickleball players and courts. Ready for Windows Store (MSIX) distribution.

## 🚀 Features

- **Modern Tech Stack**: Electron + React + TypeScript
- **Windows Store Ready**: Configured for MSIX packaging and Windows Store distribution
- **Secure Architecture**: Context isolation and secure preload scripts
- **Responsive Design**: Modern UI with CSS Grid and Flexbox
- **Type Safety**: Full TypeScript implementation
- **Hot Reload**: Development environment with live reloading

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Windows 10/11 (for Windows Store packaging)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd pickleball-finder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

## 🖥️ Development

### Start Development Server
```bash
npm run dev
```
This starts both the React development server and Electron app with hot reload.

### Available Scripts

- `npm start` - Start the Electron app (production build)
- `npm run dev` - Start development environment with hot reload
- `npm run dev:react` - Start React development server only
- `npm run dev:electron` - Start Electron app only
- `npm run build` - Build both React and Electron for production
- `npm run build:react` - Build React app only
- `npm run build:electron` - Build Electron main process only
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Run ESLint

## 📦 Building for Production

### Build the Application
```bash
npm run build
```

### Package for Windows
```bash
npm run build:win
```

### Package for Windows Store (MSIX)
```bash
npm run build:msix
```

## 🏪 Windows Store Submission

This app is pre-configured for Windows Store submission:

### Required Steps:

1. **Create App Icons**
   - Replace placeholder files in `build/` directory
   - Generate required icon sizes (see `build/README.md`)

2. **Update Package Information**
   - Edit `package.json` with your app details
   - Update publisher name and app ID in build configuration

3. **Create Developer Account**
   - Register at [Microsoft Partner Center](https://partner.microsoft.com/)
   - Reserve your app name

4. **Build MSIX Package**
   ```bash
   npm run build:msix
   ```

5. **Test the Package**
   - Install the generated MSIX file locally
   - Test all functionality

6. **Submit to Store**
   - Upload MSIX package to Partner Center
   - Complete store listing information
   - Submit for certification

### Build Configuration

The app includes electron-builder configuration for:
- **NSIS Installer**: Traditional Windows installer
- **MSIX Package**: Modern Windows Store format
- **Code Signing**: Ready for certificate signing
- **Auto Updates**: Configured for future update mechanism

## 🏗️ Project Structure

```
pickleball-finder/
├── src/
│   ├── main.ts                 # Electron main process
│   ├── preload.ts             # Secure preload script
│   └── renderer/              # React application
│       ├── components/        # React components
│       ├── styles/           # CSS files
│       ├── types/            # TypeScript definitions
│       ├── App.tsx           # Main React component
│       └── index.tsx         # React entry point
├── build/                     # App icons and assets
├── dist/                      # Built application
├── package.json              # Dependencies and build config
├── tsconfig.json             # TypeScript config (renderer)
├── tsconfig.main.json        # TypeScript config (main process)
├── webpack.config.js         # Webpack configuration
└── .eslintrc.json           # ESLint configuration
```

## 🔐 Security

The app implements Electron security best practices:

- **Context Isolation**: Enabled for all renderer processes
- **Node Integration**: Disabled in renderer processes
- **Secure Preload**: Limited API exposure via contextBridge
- **CSP Headers**: Content Security Policy implemented
- **External Link Handling**: All external links open in default browser

## 🧪 Testing

### Type Checking
```bash
npm run type-check
```

### Linting
```bash
npm run lint
```

## 📝 Customization

### Update App Information
1. Edit `package.json` - name, description, author, homepage
2. Update `src/main.ts` - window title, menu items
3. Modify `src/renderer/components/` - UI components
4. Replace icons in `build/` directory

### Add New Features
1. Create new React components in `src/renderer/components/`
2. Add new IPC handlers in `src/main.ts`
3. Update preload API in `src/preload.ts`
4. Add new styles in `src/renderer/styles/`

## 🐛 Troubleshooting

### Common Issues

**Build fails with TypeScript errors**
```bash
npm run type-check
```
Fix any TypeScript errors before building.

**Electron app doesn't start**
- Ensure all dependencies are installed: `npm install`
- Check that the build completed successfully: `npm run build:electron`

**React hot reload not working**
- Ensure port 3000 is available
- Restart the development server: `npm run dev`

### Development Tools

- **React DevTools**: Available in development mode
- **Electron DevTools**: Open with Ctrl+Shift+I
- **TypeScript Compilation**: Watch mode with `tsc --watch`

## 📚 Learn More

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Windows Store Publishing](https://docs.microsoft.com/en-us/windows/uwp/publish)
- [Electron Builder](https://www.electron.build/)

## 📄 License

MIT License - see LICENSE file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

---

Built with ❤️ using Electron, React, and TypeScript