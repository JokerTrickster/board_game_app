---
allowed-tools: Bash
---

# Custom: Task Resume

Complete task resumption workflow with sync, branch management, and specialized agent handoff.

## Usage
```
/custom:task-resume <issue_number>
```

## Description
This command executes a complete task resumption workflow:
1. `/pm:sync` - GitHub 양방향 동기화
2. `/pm:in-progress` - 현재 진행중 상태 스냅샷
3. `/pm:issue-show <issue#>` - 대상 이슈 확인
4. 기존 생성한 브랜치가 있는지 체크 후 없으면 브랜치 생성/체크아웃 (항상 새 브랜치)
5. `/pm:issue-start <issue#>` - 전문 에이전트와 작업 시작

## Instructions

Execute the task resume script with the provided issue number:

```bash
bash .claude/scripts/custom/task-resume.sh $ARGUMENTS
```

## Output Format
```
🚀 Task Resume Starting for Issue #${issue_number}...

🔄 Step 1: GitHub Sync
======================
✅ Fetched latest GitHub state
   Epic issues: 0
   Task issues: 7

📊 Step 2: In-Progress Check
============================
🔄 Checking for active work...
   No active work items found.

🎫 Step 3: Issue #14 Details
======================================
   Title: [기능 개선] 남은 작업
   State: OPEN
   Labels: enhancement
   Local file: .claude/epics/game-improvements/001.md
   Epic: game-improvements

🌟 Step 4: Branch Management
===========================
   Current branch: main
   Creating feature branch from main...
   ✅ Created and switched to: issue-14-20250904-153000

🚀 Step 5: Starting Specialized Work
====================================
   Found local task file: .claude/epics/game-improvements/001.md
   ⚠️  No analysis found: .claude/epics/game-improvements/001-analysis.md
   💡 Run: /pm:issue-analyze 14 first

✅ Task Resume Complete - Ready for Analysis & Development
```

## Error Handling
- If issue_number not provided: Show usage and exit with code 1
- If GitHub issue not found: Display error and suggest alternatives
- If git operations fail: Continue with warning, don't fail completely
- If PM files missing: Show helpful guidance for next steps
- Always cleanup temporary files (/tmp/epics.json, /tmp/tasks.json, /tmp/issue_*.json)

## Cleanup
Always clean up temporary files:
```bash
# Cleanup temporary files
rm -f /tmp/epics.json /tmp/tasks.json /tmp/issue_${issue_number}.json

echo "✅ Task Resume Complete"
```

## Notes
- Always creates a new branch, even if issue branch exists (with timestamp)
- Maintains full audit trail of sync and branch operations
- Integrates with existing PM system workflows
- Designed for seamless handoff to specialized development agents
- Compatible with existing PM command structure and naming conventions
- Uses standard GitHub CLI commands and CCPM patterns