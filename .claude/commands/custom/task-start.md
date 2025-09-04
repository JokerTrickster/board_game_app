---
allowed-tools: Bash
---

# Custom: Task Start

Start a new task by creating a branch and setting up the work environment.

## Usage
```
/custom:task-start <issue_number>
```

## Description
This command executes a complete task start workflow:
1. Create and checkout a new branch with format: `issue<number>-<title>` 
2. Prepare the work environment
3. Display task information and next steps

## Instructions

Execute the task start script with the provided issue number:

```bash
bash .claude/scripts/custom/task-start.sh $ARGUMENTS
```

## Output Format
```
🚀 Starting Task for Issue #${issue_number}...

📋 Issue Details
================
   Title: [Enhancement] Add new feature
   State: OPEN
   Labels: enhancement
   
🌟 Branch Management
===================
   Current branch: main
   Creating new branch: issue123-add-new-feature
   ✅ Created and switched to: issue123-add-new-feature

✅ Task Start Complete - Ready for Development
```

## Error Handling
- If issue_number not provided: Show usage and exit with code 1
- If GitHub issue not found: Display error and suggest alternatives
- If git operations fail: Show error and exit
- If branch already exists: Show warning but continue

## Notes
- Creates branch with naming convention: issue{number}-{sanitized-title}
- Sanitizes issue titles for valid git branch names
- Can be used with hooks for pre/post task start actions