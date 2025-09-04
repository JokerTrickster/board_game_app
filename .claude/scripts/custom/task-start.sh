#!/bin/bash

# task-start.sh - Start a new task with proper branch creation
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

# Check if issue number is provided
if [ $# -eq 0 ]; then
    print_error "Usage: /custom:task-start <issue_number>"
    exit 1
fi

issue_number=$1

echo -e "${BLUE}🚀 Starting Task for Issue #${issue_number}...${NC}"

# Step 1: Get issue details from GitHub
print_step "📋 Issue Details"

# Check if gh is available
if ! command -v gh &> /dev/null; then
    print_error "GitHub CLI (gh) not found. Please install it first."
    exit 1
fi

# Fetch issue details
issue_json=$(gh issue view $issue_number --json title,state,labels 2>/dev/null || echo "")

if [ -z "$issue_json" ]; then
    print_error "Issue #${issue_number} not found or GitHub CLI not authenticated"
    exit 1
fi

# Parse issue details
title=$(echo "$issue_json" | jq -r '.title')
state=$(echo "$issue_json" | jq -r '.state')
labels=$(echo "$issue_json" | jq -r '.labels[].name' | tr '\n' ',' | sed 's/,$//')

echo "   Title: $title"
echo "   State: $state"
echo "   Labels: $labels"

# Step 2: Create branch name
print_step "🌟 Branch Management"

# Sanitize title for branch name
sanitized_title=$(echo "$title" | \
    sed 's/\[.*\]//g' | \
    sed 's/[^a-zA-Z0-9가-힣]/-/g' | \
    sed 's/--*/-/g' | \
    sed 's/^-\|-$//g' | \
    tr '[:upper:]' '[:lower:]' | \
    cut -c1-30)

branch_name="issue${issue_number}-${sanitized_title}"

echo "   Current branch: $(git branch --show-current)"
echo "   Creating new branch: $branch_name"

# Check if branch already exists
if git show-ref --verify --quiet refs/heads/$branch_name; then
    print_warning "Branch '$branch_name' already exists"
    echo "   Checking out existing branch..."
    git checkout $branch_name
else
    # Create and checkout new branch
    git checkout -b $branch_name
    print_success "Created and switched to: $branch_name"
fi

# Step 3: Display completion
echo -e "\n${GREEN}✅ Task Start Complete - Ready for Development${NC}"

# Optional: Display helpful next steps
echo -e "\n${BLUE}💡 Next Steps:${NC}"
echo "   - Start implementing the feature/fix"
echo "   - Use hooks for pre/post development actions"
echo "   - Run tests before committing changes"
echo "   - Use /custom:task-finish when ready to submit"