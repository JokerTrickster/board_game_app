---
allowed-tools: Bash
---

# Custom: Task Validate

Validate completed task with language-specific checks and create PR with comprehensive summary.

## Usage
```
/custom:task-validate [issue_number]
```

## Description
This command executes a complete task validation and PR creation workflow:
1. Detect project language/framework and run appropriate validation
2. Execute lint, format, build, and test commands based on project type
3. Generate comprehensive work summary from git changes
4. Create PR with validation results and improvement suggestions
5. Use specialized agents for different validation aspects

## Instructions

Execute the task validation script:

```bash
bash .claude/scripts/custom/task-validate.sh $ARGUMENTS
```

## Output Format
```
🔍 Task Validation Starting...

📋 Project Analysis
==================
   Language: React Native + TypeScript
   Package Manager: npm
   Available Scripts: lint, test, start
   
🧹 Code Quality Validation
==========================
   ✅ ESLint: No issues found
   ✅ Prettier: Code formatted correctly  
   ✅ TypeScript: Type checking passed
   
🔧 Build & Test Validation
==========================
   ✅ Build: Successful compilation
   ✅ Tests: 15 passed, 0 failed
   
📊 Change Analysis
==================
   Files Modified: 5
   Lines Added: 127
   Lines Removed: 23
   
🚀 Creating Pull Request
========================
   Branch: issue14--남은-작업 → main
   Title: [기능 개선] 남은 작업
   
   ## Summary
   - Implemented user authentication flow
   - Added form validation utilities
   - Updated test coverage to 95%
   
   ## Validation Results
   ✅ All quality checks passed
   ✅ Build successful  
   ✅ Tests passing
   
   ## Areas for Improvement
   - Consider adding integration tests
   - Documentation could be enhanced
   
   PR URL: https://github.com/user/repo/pull/123

✅ Task Validation Complete
```

## Language Detection & Validation

### React Native / TypeScript (Current Project)
- **Lint**: `npm run lint` (ESLint)
- **Format**: `npx prettier --check .`
- **Type Check**: `npx tsc --noEmit`
- **Test**: `npm test`
- **Build**: `npx react-native bundle` (if applicable)

### Node.js / JavaScript
- **Lint**: `npm run lint` or `eslint .`
- **Format**: `prettier --check .`
- **Test**: `npm test`
- **Build**: `npm run build`

### Python
- **Lint**: `flake8`, `pylint`
- **Format**: `black --check .`, `isort --check .`
- **Type**: `mypy`
- **Test**: `pytest`
- **Build**: `python setup.py build`

### Go
- **Lint**: `golangci-lint run`
- **Format**: `gofmt -d .`
- **Test**: `go test ./...`
- **Build**: `go build`

### Rust  
- **Lint**: `cargo clippy`
- **Format**: `cargo fmt --check`
- **Test**: `cargo test`
- **Build**: `cargo build`

## Agent Usage
- **code-analyzer**: Analyze changes and generate comprehensive summary
- **quality-engineer**: Run validation checks and assess code quality
- **technical-writer**: Generate PR description with proper formatting

## Error Handling
- Continue validation even if some checks fail
- Report all issues in final summary
- Create PR with validation status even on failures
- Provide actionable improvement suggestions

## Notes
- Automatically detects project type from config files
- Uses project-specific validation tools and commands
- Generates rich PR descriptions with change analysis
- Integrates with existing git workflow and GitHub CLI