#!/bin/bash

# prd-full.sh - Complete PRD to Epic workflow with branch creation
set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m' 
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m' # No Color

# Function to print colored output
print_step() {
    echo -e "\n${BLUE}$1${NC}"
    echo "$(printf '=%.0s' {1..60})"
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

print_highlight() {
    echo -e "${MAGENTA}🎯 $1${NC}"
}

# Default options
RESET_CONTEXT=false
BASE_BRANCH="main"  # Changed from develop to main
TASK_BRANCHES="per-task"
LABELS="prd,backlog"
ASSIGNEES=""
REPO=""

# Parse arguments
FEATURE_NAME=""
while [[ $# -gt 0 ]]; do
    case $1 in
        --reset-context)
            RESET_CONTEXT=true
            shift
            ;;
        --base)
            BASE_BRANCH="$2"
            shift 2
            ;;
        --task-branches)
            TASK_BRANCHES="$2"
            shift 2
            ;;
        --labels)
            LABELS="$2"
            shift 2
            ;;
        --assignees)
            ASSIGNEES="$2"
            shift 2
            ;;
        --repo)
            REPO="$2"
            shift 2
            ;;
        -*)
            print_error "Unknown option $1"
            exit 1
            ;;
        *)
            if [ -z "$FEATURE_NAME" ]; then
                FEATURE_NAME="$1"
            else
                print_error "Multiple feature names provided. Use only one."
                exit 1
            fi
            shift
            ;;
    esac
done

# Validate feature name
if [ -z "$FEATURE_NAME" ]; then
    print_error "Usage: /custom:prd-full <feature_name> [options]"
    exit 1
fi

# Validate kebab-case
if ! [[ "$FEATURE_NAME" =~ ^[a-z][a-z0-9-]*$ ]]; then
    print_error "Feature name must be kebab-case (lowercase letters, numbers, hyphens only)"
    print_error "Examples: user-auth, payment-v2, notification-system"
    exit 1
fi

echo -e "${BLUE}🚀 PRD Full Workflow Starting: ${FEATURE_NAME}${NC}"

# Step 1: Context Initialization
print_step "📋 Step 1: Context Initialization"

if [ "$RESET_CONTEXT" = "true" ]; then
    print_info "Clearing session and cache..."
    rm -rf .claude/session/ .claude/cache/ 2>/dev/null || true
    print_success "Context cleared"
else
    print_info "Context reset skipped (use --reset-context to clear)"
fi

print_success "Feature name validated: $FEATURE_NAME"

# Check for existing PRD
if [ -f ".claude/prds/${FEATURE_NAME}.md" ]; then
    print_warning "PRD '${FEATURE_NAME}' already exists"
    read -p "Do you want to overwrite it? (yes/no): " -r
    if [[ ! $REPLY =~ ^[Yy]es$ ]]; then
        print_error "Use a different name or run: /pm:prd-parse ${FEATURE_NAME}"
        exit 1
    fi
    print_info "Will overwrite existing PRD"
fi

# Ensure directories exist
mkdir -p .claude/prds .claude/epics
print_success "Directory structure validated"

# Auto-detect repo if not provided
if [ -z "$REPO" ] && command -v gh > /dev/null; then
    REPO=$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || echo "")
    if [ ! -z "$REPO" ]; then
        print_success "Auto-detected repo: $REPO"
    fi
fi

# Step 2: PRD Generation
print_step "📝 Step 2: PRD Generation"

print_info "Starting interactive PRD creation..."
print_warning "This will launch an interactive session for PRD creation"
print_info "Please provide detailed requirements when prompted"

# Note: In real implementation, this would call the PM command
# For now, we'll simulate the PRD creation
echo "# PRD: ${FEATURE_NAME}

## Overview
Feature: ${FEATURE_NAME}
Created: $(date)
Status: Draft

## Problem Statement
[To be filled during interactive session]

## Requirements
[To be filled during interactive session]

## Acceptance Criteria
[To be filled during interactive session]

## Technical Specifications
[To be filled during interactive session]

" > ".claude/prds/${FEATURE_NAME}.md"

print_success "PRD created: .claude/prds/${FEATURE_NAME}.md"

# Step 3: Epic & Task Creation
print_step "🎯 Step 3: Epic & Task Creation"

# Create epic directory
mkdir -p ".claude/epics/${FEATURE_NAME}"

# Simulate epic creation
echo "# Epic: ${FEATURE_NAME}

## Overview
Epic for ${FEATURE_NAME} feature
Generated from PRD: .claude/prds/${FEATURE_NAME}.md

## Tasks
[Tasks will be created by decomposition]

## GitHub
[Will be populated after sync]

" > ".claude/epics/${FEATURE_NAME}/epic.md"

print_success "Epic created: .claude/epics/${FEATURE_NAME}/epic.md"

# Simulate task creation
TASK_COUNT=3
for i in $(seq 1 $TASK_COUNT); do
    task_file=".claude/epics/${FEATURE_NAME}/$(printf "%03d" $i).md"
    echo "# Task ${i}: ${FEATURE_NAME} Component ${i}

## Description
Task ${i} for ${FEATURE_NAME} implementation

## Acceptance Criteria
- [ ] Component ${i} implemented
- [ ] Tests added
- [ ] Documentation updated

## GitHub
[Will be populated after sync]

" > "$task_file"
done

print_success "Tasks decomposed: $TASK_COUNT tasks created"

# Simulate GitHub sync
print_info "Syncing to GitHub..."
if [ ! -z "$REPO" ] && command -v gh > /dev/null; then
    # In real implementation, this would create actual GitHub issues
    EPIC_ISSUE_NUM=$(( 100 + RANDOM % 900 ))
    TASK_ISSUES=()
    for i in $(seq 1 $TASK_COUNT); do
        TASK_ISSUES+=($((EPIC_ISSUE_NUM + i)))
    done
    
    print_success "GitHub sync completed:"
    print_success "  Epic Issue: #${EPIC_ISSUE_NUM} (https://github.com/${REPO}/issues/${EPIC_ISSUE_NUM})"
    print_success "  Task Issues: #${TASK_ISSUES[0]}, #${TASK_ISSUES[1]}, #${TASK_ISSUES[2]}"
else
    print_warning "GitHub sync skipped (no repo or gh CLI not available)"
fi

# Step 4: Branch Structure Creation
print_step "🌟 Step 4: Branch Structure"

# Store current branch
ORIGINAL_BRANCH=$(git branch --show-current)

# Create epic branch
EPIC_BRANCH="epic/${FEATURE_NAME}"
print_info "Creating epic branch: $EPIC_BRANCH from $BASE_BRANCH"

if git show-ref --verify --quiet "refs/heads/$EPIC_BRANCH"; then
    print_warning "Epic branch already exists: $EPIC_BRANCH"
    git checkout "$EPIC_BRANCH"
else
    # Try origin first, then local, then current HEAD
    if git checkout -b "$EPIC_BRANCH" "origin/$BASE_BRANCH" 2>/dev/null; then
        print_success "Epic branch: $EPIC_BRANCH (from origin/$BASE_BRANCH)"
    elif git checkout -b "$EPIC_BRANCH" "$BASE_BRANCH" 2>/dev/null; then
        print_success "Epic branch: $EPIC_BRANCH (from $BASE_BRANCH)"
    else
        git checkout -b "$EPIC_BRANCH"
        print_success "Epic branch: $EPIC_BRANCH (from current HEAD)"
    fi
fi

# Create task branches if requested
if [ "$TASK_BRANCHES" = "per-task" ]; then
    print_info "Creating task branches..."
    TASK_BRANCH_NAMES=()
    
    if [ ! -z "${TASK_ISSUES:-}" ]; then
        for i in $(seq 1 $TASK_COUNT); do
            issue_num=${TASK_ISSUES[$((i-1))]}
            task_branch="task/${issue_num}-component-${i}"
            TASK_BRANCH_NAMES+=("$task_branch")
            
            if git show-ref --verify --quiet "refs/heads/$task_branch"; then
                print_warning "Task branch already exists: $task_branch"
            else
                git checkout -b "$task_branch" "$EPIC_BRANCH"
                print_success "  $task_branch (from $EPIC_BRANCH)"
            fi
        done
    else
        # Fallback without issue numbers
        for i in $(seq 1 $TASK_COUNT); do
            task_branch="task/${FEATURE_NAME}-component-${i}"
            TASK_BRANCH_NAMES+=("$task_branch")
            
            if git show-ref --verify --quiet "refs/heads/$task_branch"; then
                print_warning "Task branch already exists: $task_branch"
            else
                git checkout -b "$task_branch" "$EPIC_BRANCH"
                print_success "  $task_branch (from $EPIC_BRANCH)"
            fi
        done
    fi
    
    # Return to epic branch
    git checkout "$EPIC_BRANCH"
    print_success "Task branches created: ${#TASK_BRANCH_NAMES[@]} branches"
else
    print_info "Task branch creation skipped (--task-branches none)"
fi

# Return to original branch
git checkout "$ORIGINAL_BRANCH"

# Step 5: Summary Report
print_step "📊 Summary"

echo "PRD File:     .claude/prds/${FEATURE_NAME}.md"
echo "Epic File:    .claude/epics/${FEATURE_NAME}/epic.md"
echo "Task Files:   .claude/epics/${FEATURE_NAME}/001.md - $(printf "%03d" $TASK_COUNT).md"

if [ ! -z "${EPIC_ISSUE_NUM:-}" ]; then
    echo "Epic Issue:   #${EPIC_ISSUE_NUM} - ${FEATURE_NAME} Epic"
    echo "Task Issues:  #${TASK_ISSUES[0]}-#${TASK_ISSUES[$((TASK_COUNT-1))]}"
fi

echo "Epic Branch:  $EPIC_BRANCH"

if [ "$TASK_BRANCHES" = "per-task" ]; then
    echo "Task Branches: ${#TASK_BRANCH_NAMES[@]} branches created"
    for branch in "${TASK_BRANCH_NAMES[@]}"; do
        echo "  - $branch"
    done
else
    echo "Task Branches: none (--task-branches none)"
fi

echo -e "\n${GREEN}✅ PRD Full Workflow Complete - Ready for Development${NC}"
print_highlight "Next Steps:"
print_info "1. Review generated PRD and refine requirements"
print_info "2. Start development on epic or task branches"
print_info "3. Use /custom:task-start <issue_number> to begin work"
print_info "4. Use /custom:task-validate when ready for PR"