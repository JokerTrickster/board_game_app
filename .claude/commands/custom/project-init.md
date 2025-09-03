---
allowed-tools: Bash
---

# Custom: Project Init

Initialize project with PM and SC setup by running three sequential commands.

## Usage
```
/custom:project-init
```

## Description
This command executes three initialization commands in sequence:
1. `/pm:init` - Initialize project management system
2. `/pm:sync` - Sync with GitHub issues and project state  
3. `/sc:analyze` - Analyze project structure and codebase

## Instructions

Execute the following commands in sequence:

### 1. Initialize PM System
```bash
# Execute pm:init command
bash .claude/scripts/pm/init.sh
```

### 2. Sync Project State
Run the sync command to ensure local and GitHub are aligned.

### 3. Analyze Project Structure
Run the analyze command to understand the current codebase structure.

## Output
Show the combined output of all three commands with clear separation between each step.

```
🚀 Project Initialization Starting...

==== Step 1: PM Init ====
[pm:init output]

==== Step 2: PM Sync ====
[pm:sync output]

==== Step 3: SC Analyze ====
[sc:analyze output]

✅ Project Initialization Complete
```

## Notes
- Each command must complete successfully before proceeding to the next
- If any command fails, stop execution and report the error
- This is a convenience command for quickly setting up a project environment