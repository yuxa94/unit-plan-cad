# CAD execution contract

## Tool support

Use MCP `system status/get_backend`, `drawing get_variables` and read-only entity/block queries to inspect the connection. Required backend is `file_ipc`, Windows regular AutoCAD. Package version includes upstream source under `mcp/autocad-mcp` and an MIT license. Its general API remains legacy; this skill's mutations use the guarded route below.

Never use bundled `drawing create`: its implementation erases and purges the current drawing. Avoid `drawing open` as a completed handoff: it does not verify new-document dispatcher readiness. Instead create a real document with `powershell -File scripts/New-JobDrawing.ps1 -OutputPath "<absolute job/output-v001.dwg>"`. This uses Documents.Add, saves a new path, leaves existing documents open and verifies the active path. Optional TemplatePath accepts a DWT. Do not overwrite an input/reference.

New documents have separate LISP namespaces. Load this package's `mcp/autocad-mcp/lisp-code/mcp_dispatch.lsp` in the selected job document via AutoCAD APPLOAD, then ping and read DWGNAME/DWGPREFIX again. The installation guide supplies a bootstrap file for the selected document. A successful ping in another drawing does not prove readiness here.

## Guard each mutation

Use MCP `system` operation `execute_lisp` and pass one code string. Load the helper, then wrap the whole batch:

```lisp
(load "<installed skill absolute path>/scripts/cad-guard.lsp")
(up:run "<absolute output DWG path>" "<absolute existing job/operations directory>" "walls-001"
  '(lambda (doc / ms obj)
     (setq ms (vla-get-ModelSpace doc))
     ;; Geometry computed from this job, not copied fixed trial coordinates.
     (setq obj (vla-AddLine ms (vlax-3d-point 0 0 0) (vlax-3d-point 1000 0 0)))
     (vla-get-Handle obj)))
```

The line is only an execution example, not a wall design. The helper checks exact saved-document path before executing; operation IDs accept letters/numbers/underscore/hyphen. It writes `.started` before the batch and `.done` or `.failed` afterward. Existing receipts reject retries. Receipts live in the job directory; never write them into this package.

Batch functions use the supplied `doc` rather than repeatedly taking ActiveDocument. Do not open/close/switch documents, use interactive commands or write packaged assets inside a batch. Work serially. The guard is not a sandbox for arbitrary code and cannot undo a partially failed batch; it is a document/receipt check for trusted task code.

Resolve a DWG asset with `(findfile path)` before passing it to `vla-InsertBlock`; this returns the Windows-native path. Passing a forward-slash string directly failed with a key-not-found error in the tested COM route. For TTF styles, resolve the actual installed font file or use the font API; a basename such as `malgun.ttf` was not found by AutoCAD despite the font existing in the Windows Fonts folder.

A top-level MCP response `ok=true` only means the LISP loader returned. Inspect the operation receipt and independently query generated objects before claiming success. The underlying server may time out or misdecode Korean output. Use an explicit UTF-8 JSON evidence file for exact text/geometry; do not infer wrong text from mojibake alone.

## Timeout and revision handling

On timeout, wait for the current operation to finish and inspect `.started/.done/.failed`, CAD command state and object ownership. Do not remove a receipt and rerun blindly. A `.started` without a final receipt means uncertain/partial execution. Reconcile actual handles with the planned batch and use a new operation ID only for confirmed missing work. Save only the named job document and retain prior output versions.

Keep the original file path, source hash, before/after counts and current DBMOD in read-only reference extraction records. WBLOCK whole-drawing exports are suitable for portable host reference copies; separately identify saved XREF snapshots and retain relative paths. Do not conflate ObjectDBX read-open with full graphical XREF rendering or plot verification.
