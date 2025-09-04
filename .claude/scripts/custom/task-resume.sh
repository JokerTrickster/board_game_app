#!/bin/bash

# Task Resume Script
# Complete task resumption workflow with sync, branch management, and specialized agent handoff

set -e  # Exit on error

# Validation
if [ -z "$1" ]; then
    echo "❌ Error: Issue number required"
    echo "Usage: bash .claude/scripts/custom/task-resume.sh <issue_number>"
    exit 1
fi

issue_number="$1"

echo "🚀 Task Resume Starting for Issue #${issue_number}..."
echo

# Step 1: GitHub Sync
echo "🔄 Step 1: GitHub Sync"
echo "======================"

# Get current state of all issues for sync
if gh issue list --label "epic" --limit 1000 --json number,title,state,body,labels,updatedAt > /tmp/epics.json 2>/dev/null; then
    epic_count=$(jq '. | length' /tmp/epics.json)
else
    epic_count=0
    echo "[]" > /tmp/epics.json
fi

if gh issue list --label "task" --limit 1000 --json number,title,state,body,labels,updatedAt > /tmp/tasks.json 2>/dev/null; then
    task_count=$(jq '. | length' /tmp/tasks.json)
else
    task_count=0
    echo "[]" > /tmp/tasks.json
fi

# Basic sync output
echo "✅ Fetched latest GitHub state"
echo "   Epic issues: ${epic_count}"
echo "   Task issues: ${task_count}"
echo

# Step 2: In-Progress Check
echo "📊 Step 2: In-Progress Check"
echo "============================"

# Execute in-progress check
if [ -f .claude/scripts/pm/in-progress.sh ]; then
    bash .claude/scripts/pm/in-progress.sh
else
    # Fallback basic check
    echo "🔄 Checking for active work..."
    if find .claude/epics -name "*-analysis.md" 2>/dev/null | grep -q .; then
        echo "   Found active analysis files"
    else
        echo "   No active work items found."
    fi
fi
echo

# Step 3: Issue Details
echo "🎫 Step 3: Issue #${issue_number} Details"
echo "======================================"

# Get GitHub issue details
if ! gh issue view "#${issue_number}" --json number,title,body,state,labels,createdAt,updatedAt > /tmp/issue_${issue_number}.json 2>/dev/null; then
    echo "❌ Cannot access issue #${issue_number}"
    echo "   Check issue number or run: gh auth login"
    
    # Cleanup and exit
    rm -f /tmp/epics.json /tmp/tasks.json /tmp/issue_${issue_number}.json
    exit 1
fi

# Display issue info
title=$(jq -r '.title' /tmp/issue_${issue_number}.json)
state=$(jq -r '.state' /tmp/issue_${issue_number}.json)
labels=$(jq -r '.labels[].name' /tmp/issue_${issue_number}.json | tr '\n' ', ' | sed 's/,$//' | sed 's/^$/none/')

echo "   Title: ${title}"
echo "   State: ${state}"
echo "   Labels: ${labels}"

# Find local task file
local_file=""
epic_name=""

# Search for local task file
while IFS= read -r -d '' file; do
    if grep -q "github:.*issues/${issue_number}" "$file" 2>/dev/null; then
        local_file="$file"
        epic_name=$(echo "$file" | cut -d'/' -f3)
        break
    fi
done < <(find .claude/epics -name "*.md" -print0 2>/dev/null)

if [ -n "$local_file" ]; then
    echo "   Local file: ${local_file}"
    echo "   Epic: ${epic_name}"
else
    echo "   ⚠️  No local task file found"
fi
echo

# Step 4: Branch Management
echo "🌟 Step 4: Branch Management"
echo "==========================="

# Get current branch
current_branch=$(git branch --show-current)
echo "   Current branch: ${current_branch}"

# Create new branch with timestamp
timestamp=$(date +%Y%m%d-%H%M%S)
branch_name="issue-${issue_number}-${timestamp}"

# Check if we're not on main/master
if [ "$current_branch" = "main" ] || [ "$current_branch" = "master" ]; then
    echo "   Creating feature branch from ${current_branch}..."
else
    echo "   Creating feature branch from current branch..."
fi

# Create and checkout new branch
if git checkout -b "${branch_name}" 2>/dev/null; then
    echo "   ✅ Created and switched to: ${branch_name}"
else
    echo "   ❌ Failed to create branch: ${branch_name}"
    echo "   Continuing on current branch: ${current_branch}"
    branch_name="${current_branch}"
fi
echo

# Step 5: Start Issue Work
echo "🚀 Step 5: Starting Specialized Work"
echo "===================================="

# Check if local task exists before starting
if [ -n "$local_file" ]; then
    echo "   Found local task file: ${local_file}"
    
    # Check if analysis exists
    analysis_file="${local_file%-*.md}-analysis.md"
    if [ -f "$analysis_file" ]; then
        echo "   ✅ Analysis found: ${analysis_file}"
        
        # Execute issue start workflow
        # This mirrors the pm:issue-start logic but simplified for custom command
        
        # Mark issue as assigned and in-progress
        if gh issue edit "${issue_number}" --add-assignee @me --add-label "in-progress" 2>/dev/null; then
            echo "   ✅ Assigned issue to self and marked in-progress"
        else
            echo "   ⚠️  Could not assign issue (may lack permissions)"
        fi
        
        echo "   🎯 Issue #${issue_number} ready for development"
        echo "   📁 Working in: ${branch_name}"
        echo "   📝 Task file: ${local_file}"
        echo "   🔍 Analysis: ${analysis_file}"
        
        echo
        echo "💡 Next Steps:"
        echo "   • Review analysis file: ${analysis_file}"
        echo "   • Start development in current branch: ${branch_name}"
        echo "   • Use: /pm:issue-start ${issue_number} for full agent workflow"
        
    else
        echo "   ⚠️  No analysis found: ${analysis_file}"
        echo "   💡 Run: /pm:issue-analyze ${issue_number} first"
    fi
else
    echo "   ❌ No local task file found for issue #${issue_number}"
    echo "   💡 This issue may have been created outside the PM system"
    echo "   💡 Try: /pm:import to sync GitHub issues to local PM system"
fi

echo

# Cleanup temporary files
echo "🧹 Cleanup"
echo "========="
rm -f /tmp/epics.json /tmp/tasks.json /tmp/issue_${issue_number}.json
echo "   ✅ Temporary files cleaned"

echo
echo "✅ Task Resume Complete"

# Final summary
echo
echo "📋 Summary"
echo "=========="
echo "   Issue: #${issue_number} - ${title}"
echo "   Branch: ${branch_name}"
if [ -n "$local_file" ]; then
    echo "   Task File: ${local_file}"
    if [ -f "$analysis_file" ]; then
        echo "   Status: ✅ Ready for development"
    else
        echo "   Status: ⚠️  Needs analysis first"
    fi
else
    echo "   Status: ❌ No local task file found"
fi