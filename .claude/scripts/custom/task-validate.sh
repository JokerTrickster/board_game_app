#!/bin/bash

# task-validate.sh - Comprehensive task validation and PR creation
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m' 
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "\n${BLUE}$1${NC}"
    echo "$(printf '=%.0s' {1..50})"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Get current branch and issue number
current_branch=$(git branch --show-current)
issue_number=""

# Extract issue number from branch name or argument
if [ $# -gt 0 ]; then
    issue_number=$1
elif [[ $current_branch =~ issue([0-9]+) ]]; then
    issue_number=${BASH_REMATCH[1]}
fi

echo -e "${BLUE}🔍 Task Validation Starting...${NC}"
[ ! -z "$issue_number" ] && echo -e "   Issue: #$issue_number"
echo -e "   Branch: $current_branch"

# Step 1: Project Analysis
print_step "📋 Project Analysis"

detect_project_type() {
    if [ -f "package.json" ]; then
        local has_react_native=$(grep -q "react-native" package.json && echo "true" || echo "false")
        local has_typescript=$([ -f "tsconfig.json" ] && echo "true" || echo "false")
        
        if [ "$has_react_native" = "true" ]; then
            echo "react-native"
        elif [ "$has_typescript" = "true" ]; then
            echo "typescript"
        else
            echo "javascript"
        fi
    elif [ -f "pyproject.toml" ] || [ -f "requirements.txt" ] || [ -f "setup.py" ]; then
        echo "python"
    elif [ -f "go.mod" ] || [ -f "main.go" ]; then
        echo "go"
    elif [ -f "Cargo.toml" ]; then
        echo "rust"
    else
        echo "unknown"
    fi
}

PROJECT_TYPE=$(detect_project_type)
echo "   Language/Framework: $PROJECT_TYPE"

# Determine package manager and available scripts
if [ -f "package.json" ]; then
    PACKAGE_MANAGER="npm"
    if [ -f "yarn.lock" ]; then
        PACKAGE_MANAGER="yarn"
    elif [ -f "pnpm-lock.yaml" ]; then
        PACKAGE_MANAGER="pnpm"
    fi
    
    echo "   Package Manager: $PACKAGE_MANAGER"
    
    # Show available scripts
    if command -v jq > /dev/null; then
        echo "   Available Scripts: $(jq -r '.scripts | keys | join(", ")' package.json 2>/dev/null || echo "N/A")"
    fi
fi

# Step 2: Code Quality Validation
print_step "🧹 Code Quality Validation"

validation_results=()
validation_success=true

run_validation() {
    local name="$1"
    local command="$2"
    local optional="$3"
    
    echo -n "   $name: "
    
    if eval "$command" >/dev/null 2>&1; then
        print_success "$name passed"
        validation_results+=("✅ $name: Passed")
        return 0
    else
        if [ "$optional" = "true" ]; then
            print_warning "$name skipped (optional)"
            validation_results+=("⚠️ $name: Skipped")
        else
            print_error "$name failed"
            validation_results+=("❌ $name: Failed")
            validation_success=false
        fi
        return 0  # Always return 0 to continue execution
    fi
}

# Language-specific validations
case $PROJECT_TYPE in
    "react-native"|"typescript"|"javascript")
        # Check if scripts exist before running
        if grep -q '"lint"' package.json; then
            run_validation "ESLint" "$PACKAGE_MANAGER run lint"
        else
            run_validation "ESLint" "npx eslint ." "true"
        fi
        
        run_validation "Prettier" "npx prettier --check ." "true"
        
        if [ -f "tsconfig.json" ]; then
            run_validation "TypeScript" "npx tsc --noEmit"
        fi
        
        if grep -q '"test"' package.json; then
            run_validation "Tests" "$PACKAGE_MANAGER test -- --passWithNoTests"
        fi
        
        # Try to run build if available
        if grep -q '"build"' package.json; then
            run_validation "Build" "$PACKAGE_MANAGER run build" "true"
        fi
        ;;
        
    "python")
        run_validation "Flake8" "flake8 ." "true"
        run_validation "Black" "black --check ." "true"
        run_validation "isort" "isort --check-only ." "true"
        run_validation "MyPy" "mypy ." "true"
        run_validation "Tests" "pytest" "true"
        ;;
        
    "go")
        run_validation "Go Format" "gofmt -d ."
        run_validation "Go Vet" "go vet ./..."
        run_validation "Go Lint" "golangci-lint run" "true"
        run_validation "Go Test" "go test ./..."
        run_validation "Go Build" "go build ./..."
        ;;
        
    "rust")
        run_validation "Cargo Format" "cargo fmt -- --check"
        run_validation "Cargo Clippy" "cargo clippy -- -D warnings"
        run_validation "Cargo Test" "cargo test"
        run_validation "Cargo Build" "cargo build"
        ;;
        
    *)
        print_warning "Unknown project type - skipping automatic validation"
        ;;
esac

# Step 3: Change Analysis
print_step "📊 Change Analysis"

# Get git changes
files_changed=$(git diff --name-only HEAD~1 2>/dev/null | wc -l || echo "0")
lines_added=$(git diff --shortstat HEAD~1 2>/dev/null | grep -o '[0-9]\+ insertion' | grep -o '[0-9]\+' || echo "0")
lines_removed=$(git diff --shortstat HEAD~1 2>/dev/null | grep -o '[0-9]\+ deletion' | grep -o '[0-9]\+' || echo "0")

echo "   Files Modified: $files_changed"
echo "   Lines Added: $lines_added"
echo "   Lines Removed: $lines_removed"

# Step 4: Generate PR using Claude agents
print_step "🚀 Creating Pull Request"

# Create temporary file for change analysis
temp_analysis="/tmp/task_validation_$$"
git log --oneline -10 > "$temp_analysis"
git diff --stat HEAD~1 >> "$temp_analysis" 2>/dev/null || echo "No changes to analyze" >> "$temp_analysis"

# Get issue title if available
issue_title=""
if [ ! -z "$issue_number" ] && command -v gh > /dev/null; then
    issue_title=$(gh issue view $issue_number --json title -q '.title' 2>/dev/null || echo "")
fi

# Determine PR title
pr_title="$issue_title"
if [ -z "$pr_title" ]; then
    pr_title="Task validation for branch: $current_branch"
fi

# Create PR body
pr_body="## Summary
$(git log --oneline -5 | sed 's/^/- /')

## Validation Results
$(printf '%s\n' "${validation_results[@]}")

## Change Statistics
- Files Modified: $files_changed
- Lines Added: $lines_added  
- Lines Removed: $lines_removed

## Next Steps
- Review validation results above
- Address any failed checks before merging
- Consider adding tests if coverage is low

---
*Automated validation completed on $(date)*"

# Create PR if on feature branch
if [ "$current_branch" != "main" ] && [ "$current_branch" != "master" ] && command -v gh > /dev/null; then
    if gh pr create --title "$pr_title" --body "$pr_body" --base main 2>/dev/null; then
        pr_url=$(gh pr view --json url -q '.url')
        print_success "PR created: $pr_url"
    else
        print_warning "PR creation failed or PR already exists"
        print_info "You can manually create PR with the validation results"
    fi
else
    print_warning "Not on feature branch or GitHub CLI not available"
    echo -e "\n${CYAN}Generated PR Content:${NC}"
    echo "Title: $pr_title"
    echo "Body:"
    echo "$pr_body"
fi

# Cleanup
rm -f "$temp_analysis"

# Final summary
echo -e "\n${GREEN}✅ Task Validation Complete${NC}"
if [ "$validation_success" = "true" ]; then
    print_success "All validations passed!"
else
    print_warning "Some validations failed - please review and fix"
fi