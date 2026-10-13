---
name: unit-plan-cad
description: Draft and revise apartment unit plans through AutoCAD MCP from room zoning or CAD boundaries, using user-supplied project references. Use for 단위세대 평면도, CAD 조닝, walls, doors/windows, finishes, insulation, hatches and dimensions.
---

# Unit plan CAD — public edition

Create designer-review drawings from room zoning and a **user-supplied local project profile**. This package supplies instructions, MCP code, execution helpers and synthetic examples. It contains no project DWGs, extracted native parts, source geometry dumps or finished project drawings. It is an agent-assisted workflow, not a universal drafting engine.

## Start

- New PC: read [installation](references/installation.md); verify the package before setup.
- References: read [local project profile](references/project-profile.md). Ask for the user's authorized reference DWG and retain it outside the tracked package. No project style is configured by default.
- Drafting: read [workflow](references/workflow.md), [detail rules](references/detail-rules.md), [job records](references/job-records.md) and [execution contract](references/cad-execution.md).
- HTML zoning: open the [editor](assets/examples/zoning-editor/index.html); read [input contract](references/input-contract.md) for schema 1.1 effective regions and holes.
- [CAD files](CAD-FILES.md) lists synthetic DXFs and explains how to supply actual references locally.

## Decide before affected drafting

Record units, boundary meaning, fixed structure/shafts, entrance, wall assemblies, opening and room-level schedules. Distinguish observation, proposal, user approval and unresolved information. Previous trial wall thicknesses are not defaults. Prepare line-plan options where layout changes are necessary and record the selection; keep already approved conditions.

## Generate and verify

Inspect nested block transforms, actual frame/leaf/opening dimensions, material boundaries and measured anchors. Reuse matching physical parts at scale 1; otherwise author a clearly identified review candidate. Recompute room labels, levels, opening tags and dimensions from this job. Check wall joins, finish/insulation terminations, hatch loops/islands, opening swings and annotation collisions.

Work in a separate saved job DWG. Verify its full path before each write. Never use legacy drawing.create: it erases the active drawing. Use New-JobDrawing.ps1 for a separate document, then load the dispatcher in that document. Guard trusted writes with up:run through MCP system/execute_lisp, serialize calls and inspect receipts before retries. Preserve manual edits using the revision contract.

Save versioned DWGs, decisions, object map and review evidence outside this package. Read actual saved geometry back and inspect full/detail views. Report geometry, reference-detail and plot verification separately. A package check or MCP success is not proof of drawing fidelity. The supplied workflow has no completed public reference benchmark.
