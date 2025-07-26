# Per Ankh Consciousness Technology Platform

> Ancient African wisdom meets cutting-edge bio-technology for consciousness expansion and planetary healing.

[![CI/CD Pipeline](https://github.com/your-org/per-ankh/actions/workflows/ci.yml/badge.svg)](https://github.com/your-org/per-ankh/actions/workflows/ci.yml)
[![Security Scan](https://img.shields.io/badge/security-scanned-green.svg)](https://github.com/your-org/per-ankh/security)
[![Code Coverage](https://codecov.io/gh/your-org/per-ankh/branch/main/graph/badge.svg)](https://codecov.io/gh/your-org/per-ankh)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## 🌟 Overview

The Per Ankh Consciousness Technology Platform is a revolutionary integration of ancient African spiritual wisdom with cutting-edge bio-technology, creating a complete digital sanctuary for entheogenic healing and community building. This platform bridges traditional wisdom with modern consciousness technology while maintaining sacred integrity and cultural authenticity.

### ✨ Key Features

- **🔒 Enterprise-Grade Security**: AES encryption, CSRF protection, secure session management
- **🎨 Modern Component Architecture**: Modular, reusable components with TypeScript support
- **📱 Responsive Design**: Mobile-first approach with accessibility compliance (WCAG 2.1)
- **🧪 Comprehensive Testing**: Unit, integration, and E2E tests with 80%+ coverage
- **🚀 Performance Optimized**: Sub-3s load times, code splitting, lazy loading
- **🤖 AI-Agentic Ready**: ESLint security rules, automated code review, CI/CD integration

## 🏗️ Architecture

### Modern Tech Stack (2025 Standards)

- **Frontend**: Vanilla JavaScript ES2022+ with TypeScript
- **Build System**: Vite 5.x with optimized bundling
- **Styling**: Modern CSS with custom properties and fluid typography
- **Testing**: Vitest (unit) + Playwright (E2E)
- **Security**: Content Security Policy, secure headers, encrypted sessions
- **CI/CD**: GitHub Actions with automated testing and deployment

### Project Structure

```
Per-Ankh/
├── src/
│   ├── components/           # Modular UI components
│   │   ├── Header/
│   │   │   ├── Header.js
│   │   │   └── Header.css
│   │   └── Navigation/
│   │       ├── Navigation.js
│   │       └── Navigation.css
│   ├── styles/              # Design system
│   │   ├── variables.css    # CSS custom properties
│   │   └── base.css         # Modern CSS reset
│   ├── utils/               # Utility functions
│   │   └── auth.js          # Secure authentication
│   ├── tests/               # Test suites
│   │   ├── unit/            # Unit tests
│   │   └── e2e/             # End-to-end tests
│   └── main.js              # Application entry point
├── public/                  # Static assets
├── dist/                    # Build output
├── .github/workflows/       # CI/CD pipelines
├── package.json             # Dependencies and scripts
├── vite.config.js           # Build configuration
├── vitest.config.js         # Test configuration
├── playwright.config.js     # E2E test configuration
├── .eslintrc.js             # Code quality rules
├── .prettierrc              # Code formatting
└── tsconfig.json            # TypeScript configuration
```

## 🚀 Quick Start

### Prerequisites

- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**: Latest version

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/per-ankh.git
   cd per-ankh
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   ```
   http://localhost:3000
   ```

### Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm test` | Run unit tests with coverage |
| `npm run test:e2e` | Run end-to-end tests |
| `npm run lint` | Run ESLint with auto-fix |
| `npm run format` | Format code with Prettier |
| `npm run type-check` | TypeScript type checking |
| `npm run security-audit` | Security vulnerability scan |

## 🔒 Security Features

### Authentication System

- **Secure Session Management**: AES-256 encryption for session data
- **Rate Limiting**: Protection against brute force attacks
- **CSRF Protection**: Token-based request validation
- **Input Validation**: Comprehensive sanitization and validation
- **Session Monitoring**: Automatic logout on inactivity

### Security Headers

- Content Security Policy (CSP)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection: 1; mode=block
- Referrer-Policy: strict-origin-when-cross-origin

### Data Protection

- No hardcoded credentials or secrets
- Environment-based configuration
- Secure storage with encryption
- Regular security audits and scans

## 🧪 Testing Strategy

### Test Coverage

- **Unit Tests**: Component logic, utility functions, authentication
- **Integration Tests**: Component interactions, API integration
- **E2E Tests**: Complete user workflows, authentication flows
- **Accessibility Tests**: WCAG compliance, screen reader support
- **Performance Tests**: Core Web Vitals, load time optimization

### Running Tests

```bash
# Run all tests with coverage
npm test

# Run tests in watch mode
npm run test:watch

# Run E2E tests
npm run test:e2e

# Run accessibility tests
npm run test:a11y
```

## 🎨 Design System

### Color Palette

```css
/* Sacred Brand Colors */
--color-earth-brown: #8B4513;
--color-forest-green: #228B22;
--color-golden-ankh: #DAA520;
--color-sacred-amber: #FFBF00;
--color-mycelium-white: #F5F5DC;
--color-consciousness-purple: #663399;
```

### Typography

- **Display Font**: Cinzel (serif) - For headings and sacred text
- **Body Font**: Inter (sans-serif) - For readable content
- **Mono Font**: JetBrains Mono - For code and technical content

### Responsive Breakpoints

- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1279px
- **Large Desktop**: 1280px+

## 🚀 Performance Optimization

### Core Web Vitals Targets

- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1

### Optimization Techniques

- Code splitting and lazy loading
- Image optimization and WebP support
- CSS and JavaScript minification
- Gzip/Brotli compression
- CDN integration ready
- Service Worker for caching

## 🤖 AI-Agentic Development

### AI-Assisted Development Features

- **ESLint Security Rules**: Automated security vulnerability detection
- **Prettier Integration**: Consistent code formatting
- **TypeScript Support**: Enhanced code intelligence and error detection
- **Automated Testing**: AI-friendly test structure and naming
- **CI/CD Integration**: Automated code review and quality checks

### AI Development Workflow

1. **Code Generation**: Use GitHub Copilot or similar for boilerplate
2. **Code Review**: Automated security and quality checks
3. **Testing**: AI-assisted test generation and coverage analysis
4. **Documentation**: Automated documentation generation
5. **Deployment**: Intelligent deployment strategies

## 🌍 Deployment

### Production Deployment

1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to your hosting provider**
   - Netlify, Vercel, AWS S3, or any static hosting
   - Ensure HTTPS is enabled
   - Configure security headers

3. **Environment Configuration**
   ```bash
   # Production environment variables
   NODE_ENV=production
   API_BASE_URL=https://api.perankh1.org
   ```

### Staging Environment

- Automatic deployment on `develop` branch
- Smoke tests and integration validation
- Performance monitoring and alerts

## 🔧 Development Guidelines

### Code Quality Standards

- **ESLint**: Enforce coding standards and security rules
- **Prettier**: Consistent code formatting
- **TypeScript**: Type safety and better IDE support
- **Husky**: Pre-commit hooks for quality checks
- **Conventional Commits**: Standardized commit messages

### Component Development

```javascript
// Example component structure
export class ComponentName {
  constructor(options = {}) {
    this.options = { ...defaultOptions, ...options };
    this.init();
  }

  init() {
    this.render();
    this.bindEvents();
  }

  render() {
    // Component rendering logic
  }

  bindEvents() {
    // Event binding logic
  }

  destroy() {
    // Cleanup logic
  }
}
```

### Testing Guidelines

- Write tests before implementing features (TDD)
- Aim for 80%+ code coverage
- Test user interactions, not implementation details
- Use descriptive test names and group related tests

## 📚 Documentation

### API Documentation

- Authentication endpoints and flows
- Component API reference
- Utility function documentation
- Configuration options

### User Guides

- Getting started tutorial
- Component usage examples
- Customization guide
- Troubleshooting common issues

## 🤝 Contributing

### Development Process

1. **Fork the repository**
2. **Create a feature branch**: `git checkout -b feature/amazing-feature`
3. **Make your changes** following our coding standards
4. **Add tests** for new functionality
5. **Run the test suite**: `npm test`
6. **Commit your changes**: `git commit -m 'Add amazing feature'`
7. **Push to the branch**: `git push origin feature/amazing-feature`
8. **Open a Pull Request**

### Code Review Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review of code completed
- [ ] Tests added for new functionality
- [ ] All tests pass
- [ ] Documentation updated
- [ ] Security considerations addressed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Ancient African Wisdom Traditions** - The spiritual foundation of this platform
- **Open Source Community** - For the tools and libraries that make this possible
- **Per Ankh Community** - For their vision and support

## 📞 Support

- **Website**: [PerAnkh1.org](https://perankh1.org)
- **Documentation**: [docs.perankh1.org](https://docs.perankh1.org)
- **Community**: [community.perankh1.org](https://community.perankh1.org)
- **Issues**: [GitHub Issues](https://github.com/your-org/per-ankh/issues)

---

**"The spores of consciousness are spreading. The revolution has begun."** 🍄⚡

*Per Ankh Entheogenic Church | Founded 2020 | Ancient Wisdom • Modern Innovation • Planetary Healing*
