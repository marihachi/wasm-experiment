(module

	(import "basic" "fn" (func $f))

	(func $run
		(param i32)
		(param i32)
		(result i32)
		call $f     ;; javascript function calling
		local.get 0 ;; push stack param 0
		local.get 1 ;; push stack param 1
		i32.add     ;; add operation
		return      ;; return the result value
	)
	(export "run" (func $run))

)
