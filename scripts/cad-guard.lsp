;;; Guard an agent-authored batch. Requires regular AutoCAD Visual LISP.
;;; Receipts live outside the skill, in the explicitly supplied job directory.
(vl-load-com)
(defun up:path (p) (strcase (vl-string-translate "\\" "/" p)))
(defun up:receipt (path value / stream)
  (setq stream (open path "w" "utf8"))
  (if (not stream) (error "Cannot create operation receipt"))
  (write-line value stream) (close stream))
(defun up:run (expected job op thunk / doc actual base result status)
  (setq doc (vla-get-ActiveDocument (vlax-get-acad-object))
        actual (vla-get-FullName doc))
  (cond
    ((or (= (vla-get-Path doc) "") (/= (up:path actual) (up:path expected)))
      (princ "\nUP_REJECT_WRONG_DOCUMENT") nil)
    ((or (= op "") (wcmatch op "*[~A-Za-z0-9_-]*"))
      (princ "\nUP_REJECT_OPERATION_ID") nil)
    ((not (vl-file-directory-p job))
      (princ "\nUP_REJECT_JOB_DIRECTORY") nil)
    (T
      (setq base (strcat (vl-string-right-trim "/\\" job) "/" op))
      (if (or (findfile (strcat base ".started")) (findfile (strcat base ".done")) (findfile (strcat base ".failed")))
        (progn (princ "\nUP_REJECT_EXISTING_RECEIPT_INSPECT_FIRST") nil)
        (progn
          (up:receipt (strcat base ".started") actual)
          (setq result (vl-catch-all-apply thunk (list doc)))
          (setq status
            (cond
              ((vl-catch-all-error-p result) (strcat "FAILED: " (vl-catch-all-error-message result)))
              ((/= (up:path actual) (up:path (vla-get-FullName (vla-get-ActiveDocument (vlax-get-acad-object))))) "FAILED: Active document changed during batch")
              (T "DONE")))
          (up:receipt (strcat base (if (= status "DONE") ".done" ".failed")) status)
          (princ (strcat "\nUP_" status))
          (= status "DONE"))))))
(princ)
