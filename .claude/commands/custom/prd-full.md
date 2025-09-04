---
allowed-tools: Bash
---

# Custom: PRD Full

Complete PRD to Epic workflow with branch creation and GitHub synchronization.

## Usage
```
/custom:prd-full <feature_name> [options]
```

## Description
This command executes a complete end-to-end workflow:
1. **Context Reset** - Clear session/cache if requested
2. **PRD Generation** - Create comprehensive Product Requirements Document 
3. **Epic Parsing** - Convert PRD to epic with task breakdown
4. **GitHub Sync** - Create issues and sync to GitHub
5. **Branch Creation** - Create epic and task branches with proper structure
6. **Summary Report** - Provide complete overview of created assets

## Options
```
--reset-context     Clear session/cache before starting (default: false)
--base <branch>     Base branch for epic branch (default: develop)  
--task-branches <mode>  Task branch creation: none|per-task (default: per-task)
--labels <labels>   Additional GitHub labels (default: prd,backlog)
--assignees <users> GitHub assignees (comma-separated)
--repo <repo>       GitHub repository (default: auto-detect)
```

## Instructions

Execute the comprehensive PRD workflow:

```bash
bash .claude/scripts/custom/prd-full.sh $ARGUMENTS
```

## Workflow Steps

### 1. Context Initialization
- Clear `.claude/session/` and `.claude/cache/` if `--reset-context`
- Validate feature name format (kebab-case only)
- Check for existing PRD conflicts

### 2. PRD Generation
- Run `/pm:prd-new <feature_name>` with interactive brainstorming
- Generate comprehensive PRD at `.claude/prds/<feature_name>.md`
- Include user requirements, acceptance criteria, technical specs

### 3. Epic Creation & Task Breakdown  
- Run `/pm:prd-parse --input .claude/prds/<feature_name>.md`
- Generate epic at `.claude/epics/<feature_name>/epic.md`
- Run `/pm:epic-oneshot <feature_name>` for task decomposition and GitHub sync

### 4. Branch Structure Creation
```
epic/<feature_name>     # Epic branch from base branch
├── task/1-<short-name> # Task branches (if --task-branches per-task)
├── task/2-<short-name>
└── task/N-<short-name>
```

### 5. GitHub Integration
- Create epic issue with epic metadata
- Create task issues linked to epic
- Apply labels: `prd`, `backlog`, plus custom labels
- Assign users if specified
- Link PRD document in epic description

## Output Format
```
🚀 PRD Full Workflow Starting: feature-name

📋 Step 1: Context Initialization
===============================
✅ Context cleared (--reset-context)
✅ Feature name validated: feature-name
✅ No existing PRD conflicts

📝 Step 2: PRD Generation  
=========================
✅ PRD created: .claude/prds/feature-name.md
   - 15 acceptance criteria
   - Technical architecture defined
   - User stories completed

🎯 Step 3: Epic & Task Creation
=============================== 
✅ Epic created: .claude/epics/feature-name/epic.md
✅ Tasks decomposed: 5 tasks created
✅ GitHub sync completed:
   - Epic Issue: #123 (https://github.com/user/repo/issues/123)
   - Task Issues: #124, #125, #126, #127, #128

🌟 Step 4: Branch Structure
===========================
✅ Epic branch: epic/feature-name (from develop)
✅ Task branches created:
   - task/124-backend-api (from epic/feature-name)
   - task/125-frontend-ui (from epic/feature-name) 
   - task/126-database-schema (from epic/feature-name)
   - task/127-authentication (from epic/feature-name)
   - task/128-testing-suite (from epic/feature-name)

📊 Summary
==========
PRD File:     .claude/prds/feature-name.md
Epic File:    .claude/epics/feature-name/epic.md  
Task Files:   .claude/epics/feature-name/001.md - 005.md
Epic Issue:   #123 - Feature Name Epic
Task Issues:  #124-#128
Epic Branch:  epic/feature-name
Task Branches: 5 branches created

✅ PRD Full Workflow Complete - Ready for Development
```

## Error Handling
- Validate all prerequisites before starting
- Continue workflow even if optional steps fail
- Provide clear error messages and recovery suggestions
- Clean up partial state on critical failures
- Never leave workflow in inconsistent state

## Examples
```bash
# Basic workflow
/custom:prd-full user-authentication

# With all options
/custom:prd-full payment-integration \
  --reset-context \
  --base main \
  --task-branches per-task \
  --labels "priority:high,backend,frontend" \
  --assignees "john,mary" \
  --repo "myorg/myproject"

# Minimal branches
/custom:prd-full quick-feature \
  --task-branches none
```

## Notes
- Feature name must be kebab-case (lowercase, hyphens only)
- Requires GitHub CLI authentication (`gh auth status`)
- Epic branch tracks against specified base branch
- Task branches track against epic branch for proper PR flow  
- All created assets are cross-linked for traceability
- Compatible with existing CCPM workflow and tooling