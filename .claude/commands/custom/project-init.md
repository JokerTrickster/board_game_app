---
allowed-tools: Bash
---

# Custom: Project Init

Complete project initialization with full PM and SC setup by running seven sequential commands.

## Usage
```
/custom:project-init
```

## Description
This command executes the complete project initialization sequence:
1. `/pm:init` - 의존성 설치 + GitHub 기본 구성
2. `/pm:validate` - 세팅 점검(토큰/리모트/브랜치 보호 규칙/라벨/템플릿)
3. `/pm:sync` - 깃헙과 양방향 동기화(초기 메타/보드/라벨 올림)
4. `/pm:import` - (있다면) 기존 이슈/템플릿/프로젝트 항목 가져오기
5. `/pm:status` - 전체 프로젝트 대시보드 스냅샷 확인
6. `/pm:in-progress` - 진행 중 리스트 비거나 최소화 확인(초기 WIP 가시화)
7. `/sc:analyze` - 코드 품질/보안/성능 베이스라인 리포트 생성

## Instructions

Execute the following commands in sequence. Each command must complete successfully before proceeding to the next.

### 1. Initialize PM System
Execute `/pm:init` to install dependencies and configure GitHub basics.

### 2. Validate Settings
Execute `/pm:validate` to check tokens, remotes, branch protection rules, labels, and templates.

### 3. Sync with GitHub
Execute `/pm:sync` to perform bidirectional sync (upload initial meta/boards/labels).

### 4. Import Existing Data
Execute `/pm:import` to import any existing issues/templates/project items.

### 5. Check Project Status
Execute `/pm:status` to get complete project dashboard snapshot.

### 6. Review In-Progress Items
Execute `/pm:in-progress` to verify in-progress list is empty or minimized (initial WIP visibility).

### 7. Analyze Codebase
Execute `/sc:analyze` to generate code quality/security/performance baseline report.

## Output Format
```
🚀 Complete Project Initialization Starting...

==== Step 1: PM Init (Dependencies + GitHub Config) ====
[pm:init output]

==== Step 2: PM Validate (Settings Check) ====
[pm:validate output]

==== Step 3: PM Sync (Bidirectional Sync) ====
[pm:sync output]

==== Step 4: PM Import (Existing Data) ====
[pm:import output]

==== Step 5: PM Status (Dashboard Snapshot) ====
[pm:status output]

==== Step 6: PM In-Progress (WIP Check) ====
[pm:in-progress output]

==== Step 7: SC Analyze (Baseline Report) ====
[sc:analyze output]

✅ Complete Project Initialization Finished
   - Dependencies installed and GitHub configured
   - Settings validated
   - GitHub synchronized
   - Existing data imported
   - Project status confirmed
   - WIP minimized
   - Baseline analysis complete
```

## Notes
- Each command must complete successfully before proceeding to the next
- If any command fails, stop execution and report the error
- This provides complete project environment setup
- All Korean descriptions preserved for clarity