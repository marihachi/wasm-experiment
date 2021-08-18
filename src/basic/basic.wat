(module

	(import "imports" "fn" (func $f))

	(func (export "run") (param i32 i32) (result i32)
		call $f        ;; javascript function calling
		(local.get 0)  ;; push stack param 0
		(local.get 1)  ;; push stack param 1
		i32.add        ;; add operation
		return         ;; return the result value
	)

)
