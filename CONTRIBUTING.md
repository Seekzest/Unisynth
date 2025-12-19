# Contributing to Unisynth

Thank you for your interest in contributing to Unisynth! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/Unisynth.git`
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes
5. Test your changes thoroughly
6. Commit your changes: `git commit -m "Add feature: description"`
7. Push to your fork: `git push origin feature/your-feature-name`
8. Create a Pull Request

## Development Setup

Follow the instructions in [docs/SETUP.md](docs/SETUP.md) to set up your development environment.

## Code Style

### JavaScript/React Native
- Use ES6+ features
- Use functional components with hooks
- Follow Airbnb JavaScript Style Guide
- Use meaningful variable and function names
- Add comments for complex logic

### Code Formatting
- Use 2 spaces for indentation
- Use semicolons
- Use single quotes for strings
- Maximum line length: 100 characters

## Commit Messages

Follow these guidelines for commit messages:

- Use present tense ("Add feature" not "Added feature")
- Use imperative mood ("Move cursor to..." not "Moves cursor to...")
- First line should be a brief summary (50 chars or less)
- Reference issues and pull requests when applicable

Examples:
```
Add camera frustum visualization to viewer
Fix WebSocket connection timeout issue
Update documentation for session API
```

## Pull Request Process

1. **Update Documentation**: If you've changed APIs or added features, update the relevant documentation
2. **Add Tests**: If applicable, add tests for your changes
3. **Update CHANGELOG**: Add a note about your changes (if we have one)
4. **Code Review**: Wait for maintainers to review your PR
5. **Address Feedback**: Make requested changes
6. **Merge**: Once approved, a maintainer will merge your PR

## Areas for Contribution

### High Priority
- [ ] Structure-from-Motion 3D reconstruction implementation
- [ ] Point cloud generation from depth data
- [ ] Video texture mapping on 3D models
- [ ] Authentication and user management
- [ ] Cloud storage integration

### Features
- [ ] VR headset support for viewing
- [ ] Export to 3D formats (OBJ, FBX, GLTF)
- [ ] Real-time preview during recording
- [ ] Advanced camera calibration
- [ ] Multi-session management
- [ ] Collaborative editing

### Improvements
- [ ] Performance optimization
- [ ] Better error handling
- [ ] Improved UI/UX
- [ ] Mobile app testing suite
- [ ] Backend API documentation
- [ ] Docker support
- [ ] CI/CD pipeline

### Documentation
- [ ] Video tutorials
- [ ] API reference
- [ ] Example projects
- [ ] Troubleshooting guide
- [ ] Architecture diagrams

## Bug Reports

When reporting bugs, please include:

1. **Description**: Clear description of the bug
2. **Steps to Reproduce**: Detailed steps to reproduce the issue
3. **Expected Behavior**: What you expected to happen
4. **Actual Behavior**: What actually happened
5. **Environment**: 
   - OS and version
   - Node.js version
   - Browser (for viewer issues)
   - Device model (for mobile issues)
6. **Screenshots/Logs**: If applicable

## Feature Requests

When requesting features, please:

1. **Search First**: Check if the feature has already been requested
2. **Describe Use Case**: Explain why this feature would be useful
3. **Provide Examples**: If possible, show examples from other apps
4. **Consider Alternatives**: Mention alternative solutions you've considered

## Testing

Before submitting your PR, ensure:

- [ ] Backend server starts without errors
- [ ] Mobile app builds successfully
- [ ] 3D viewer loads correctly
- [ ] New features work as expected
- [ ] Existing features still work
- [ ] No console errors
- [ ] Code follows style guidelines

## Questions?

If you have questions:
- Check existing documentation
- Search closed issues
- Open a new issue with the "question" label
- Join our community discussions

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Code of Conduct

Be respectful and inclusive. We want to create a welcoming environment for all contributors.

Thank you for contributing to Unisynth! 🚀
