// Easy questions: one idea at a time, a few lines of code. See
// pseudocodeQuestions.ts for the notation and the answer-key conventions.
import type { PseudoQuestion } from "./pseudocodeQuestions";

export const EASY_QUESTIONS: PseudoQuestion[] = [
	// ---------------------------------------------------------------- Variables & display
	{
		id: "e-var-1",
		level: "easy",
		topics: ["Variables & display"],
		prompt: "What is displayed?",
		code: `a ← 3
b ← a + 2
DISPLAY(b)
DISPLAY(a)`,
		options: ["5 3", "3 5", "5 5", "3 3"],
		answer: 0,
		explanation: "b is set to 3 + 2 = 5. Using a in a calculation doesn't change a, so a is still 3. b is displayed first.",
	},
	{
		id: "e-var-2",
		level: "easy",
		topics: ["Variables & display"],
		prompt: "What is displayed?",
		code: `x ← 8
x ← x - 3
x ← x - 3
DISPLAY(x)`,
		options: ["2", "5", "8", "14"],
		answer: 0,
		explanation: "Each line takes 3 away from the current value of x: 8 → 5 → 2.",
	},
	{
		id: "e-var-3",
		level: "easy",
		topics: ["Variables & display"],
		prompt: "What is displayed?",
		code: `name ← "Kai"
DISPLAY("name")
DISPLAY(name)`,
		options: ["name Kai", "Kai Kai", "name name", "Kai name"],
		answer: 0,
		explanation:
			"Quotation marks mean \"show exactly this text,\" so DISPLAY(\"name\") shows the word name. Without quotes, DISPLAY(name) shows the variable's value, Kai.",
	},
	{
		id: "e-var-4",
		level: "easy",
		topics: ["Variables & display"],
		prompt: "What is displayed?",
		code: `p ← 2
q ← p * p
p ← q + 1
DISPLAY(p)`,
		options: ["5", "4", "3", "9"],
		answer: 0,
		explanation: "q is 2 × 2 = 4. Then p is replaced with 4 + 1 = 5.",
	},

	// ---------------------------------------------------------------- Arithmetic & MOD
	{
		id: "e-mod-1",
		level: "easy",
		topics: ["Arithmetic & MOD"],
		prompt: "What is displayed?",
		code: `DISPLAY(10 MOD 3)`,
		options: ["1", "3", "0", "7"],
		answer: 0,
		explanation: "3 goes into 10 three times (9), leaving 1 over. So 10 MOD 3 is 1.",
	},
	{
		id: "e-mod-2",
		level: "easy",
		topics: ["Arithmetic & MOD"],
		prompt: "What is displayed?",
		code: `DISPLAY(9 MOD 9)`,
		options: ["0", "1", "9", "81"],
		answer: 0,
		explanation: "Any number MOD itself is 0 — it divides exactly once with nothing left over.",
	},
	{
		id: "e-mod-3",
		level: "easy",
		topics: ["Arithmetic & MOD"],
		prompt: "What is displayed?",
		code: `DISPLAY((2 + 3) * 4)`,
		options: ["20", "14", "24", "9"],
		answer: 0,
		explanation: "Brackets come first: 2 + 3 = 5. Then 5 × 4 = 20. (Without the brackets it would be 14.)",
	},
	{
		id: "e-mod-4",
		level: "easy",
		topics: ["Arithmetic & MOD"],
		prompt: "What is displayed?",
		code: `x ← 15
DISPLAY(x MOD 2)`,
		options: ["1", "0", "7", "7.5"],
		answer: 0,
		explanation: "15 ÷ 2 is 7 with 1 left over. Any odd number MOD 2 is 1; any even number MOD 2 is 0.",
	},

	// ---------------------------------------------------------------- Boolean logic
	{
		id: "e-bool-1",
		level: "easy",
		topics: ["Boolean logic"],
		prompt: "What is displayed?",
		code: `DISPLAY((3 < 5) OR (2 > 9))`,
		options: ["true", "false", "3", "An error"],
		answer: 0,
		explanation: "3 < 5 is true. OR only needs one side to be true, so the whole thing is true.",
	},
	{
		id: "e-bool-2",
		level: "easy",
		topics: ["Boolean logic"],
		prompt: "What is displayed?",
		code: `DISPLAY((6 = 6) AND (1 = 2))`,
		options: ["false", "true", "6", "1"],
		answer: 0,
		explanation: "6 = 6 is true, but 1 = 2 is false. AND needs both sides to be true, so the result is false.",
	},
	{
		id: "e-bool-3",
		level: "easy",
		topics: ["Boolean logic"],
		prompt: "What is displayed?",
		code: `done ← false
DISPLAY(NOT done)`,
		options: ["true", "false", "NOT done", "done"],
		answer: 0,
		explanation: "NOT flips a true/false value. done is false, so NOT done is true.",
	},
	{
		id: "e-bool-4",
		level: "easy",
		topics: ["Boolean logic"],
		prompt: "What is displayed?",
		code: `x ← 7
DISPLAY(x ≠ 7)`,
		options: ["false", "true", "7", "0"],
		answer: 0,
		explanation: "≠ means \"is not equal to.\" x is 7, so \"x is not equal to 7\" is false.",
	},

	// ---------------------------------------------------------------- Selection
	{
		id: "e-sel-1",
		level: "easy",
		topics: ["Selection"],
		prompt: "What is displayed?",
		code: `n ← 3
IF (n > 5)
{
  DISPLAY("big")
}
ELSE
{
  DISPLAY("small")
}`,
		options: ["small", "big", "big small", "3"],
		answer: 0,
		explanation: "3 > 5 is false, so the ELSE block runs. Exactly one of the two blocks always runs.",
	},
	{
		id: "e-sel-2",
		level: "easy",
		topics: ["Selection"],
		prompt: "What is displayed?",
		code: `t ← 0
IF (t = 0)
{
  t ← 10
}
DISPLAY(t)`,
		options: ["10", "0", "t", "Nothing is displayed"],
		answer: 0,
		explanation: "t = 0 is true, so t is changed to 10 inside the IF. The DISPLAY after the IF then shows 10.",
	},
	{
		id: "e-sel-3",
		level: "easy",
		topics: ["Selection", "Boolean logic"],
		prompt: "What is displayed?",
		code: `ready ← false
IF (ready)
{
  DISPLAY("go")
}
ELSE
{
  DISPLAY("wait")
}`,
		options: ["wait", "go", "go wait", "false"],
		answer: 0,
		explanation: "A true/false variable can be the whole condition. ready is false, so the ELSE block runs.",
	},
	{
		id: "e-sel-4",
		level: "easy",
		topics: ["Selection"],
		prompt: "What is displayed?",
		code: `x ← 4
IF (x MOD 2 = 1)
{
  DISPLAY("odd")
}
DISPLAY("end")`,
		options: ["end", "odd end", "odd", "Nothing is displayed"],
		answer: 0,
		explanation: "4 MOD 2 is 0, not 1, so \"odd\" is skipped. DISPLAY(\"end\") is outside the IF, so it always runs.",
	},

	// ---------------------------------------------------------------- Iteration
	{
		id: "e-loop-1",
		level: "easy",
		topics: ["Iteration"],
		prompt: "What is displayed?",
		code: `REPEAT 3 TIMES
{
  DISPLAY("hi")
}`,
		options: ["hi hi hi", "hi", "hi hi", "hi hi hi hi"],
		answer: 0,
		explanation: "The block inside runs exactly 3 times.",
	},
	{
		id: "e-loop-2",
		level: "easy",
		topics: ["Iteration"],
		prompt: "What is displayed?",
		code: `n ← 10
REPEAT 2 TIMES
{
  n ← n - 4
}
DISPLAY(n)`,
		options: ["2", "6", "8", "14"],
		answer: 0,
		explanation: "Subtracting 4 twice: 10 → 6 → 2.",
	},
	{
		id: "e-loop-3",
		level: "easy",
		topics: ["Iteration"],
		prompt: "What is displayed?",
		code: `k ← 1
REPEAT UNTIL (k > 3)
{
  DISPLAY(k)
  k ← k + 1
}`,
		options: ["1 2 3", "1 2 3 4", "1 2", "2 3 4"],
		answer: 0,
		explanation: "k is displayed and then increased: 1, 2, 3. When k reaches 4, k > 3 is true and the loop stops before displaying it.",
	},
	{
		id: "e-loop-4",
		level: "easy",
		topics: ["Iteration", "Lists"],
		prompt: "What is displayed?",
		code: `sum ← 0
FOR EACH v IN [4, 4, 4]
{
  sum ← sum + v
}
DISPLAY(sum)`,
		options: ["12", "4", "3", "444"],
		answer: 0,
		explanation: "The loop visits each of the three 4s and adds it: 4 + 4 + 4 = 12.",
	},

	// ---------------------------------------------------------------- Lists
	{
		id: "e-list-1",
		level: "easy",
		topics: ["Lists"],
		prompt: "What is displayed?",
		code: `colors ← ["red", "green", "blue"]
DISPLAY(colors[3])`,
		options: ["blue", "green", "red", "An error"],
		answer: 0,
		explanation: "Lists here start counting at 1: colors[1] is red, colors[2] is green, colors[3] is blue.",
	},
	{
		id: "e-list-2",
		level: "easy",
		topics: ["Lists"],
		prompt: "What is displayed?",
		code: `nums ← [1, 2]
APPEND(nums, 9)
DISPLAY(nums)`,
		options: ["[1, 2, 9]", "[9, 1, 2]", "[1, 9, 2]", "[1, 2]"],
		answer: 0,
		explanation: "APPEND always adds the new item to the end of the list.",
	},
	{
		id: "e-list-3",
		level: "easy",
		topics: ["Lists"],
		prompt: "What is displayed?",
		code: `a ← []
DISPLAY(LENGTH(a))`,
		options: ["0", "1", "An error", "[]"],
		answer: 0,
		explanation: "[] is an empty list — it exists, but it has no items in it, so its length is 0.",
	},
	{
		id: "e-list-4",
		level: "easy",
		topics: ["Lists"],
		prompt: "What is displayed?",
		code: `w ← [3, 6, 9]
w[1] ← 5
DISPLAY(w)`,
		options: ["[5, 6, 9]", "[3, 5, 9]", "[5, 3, 6, 9]", "[3, 6, 9]"],
		answer: 0,
		explanation: "Assigning to w[1] replaces the first item (3) with 5. Nothing moves and the length stays the same.",
	},

	// ---------------------------------------------------------------- Procedures
	{
		id: "e-proc-1",
		level: "easy",
		topics: ["Procedures"],
		prompt: "What is displayed?",
		code: `PROCEDURE square(n)
{
  RETURN(n * n)
}
DISPLAY(square(4))`,
		options: ["16", "8", "4", "44"],
		answer: 0,
		explanation: "square(4) runs the procedure with n = 4 and returns 4 × 4 = 16.",
	},
	{
		id: "e-proc-2",
		level: "easy",
		topics: ["Procedures"],
		prompt: "What is displayed?",
		code: `PROCEDURE shout()
{
  DISPLAY("HEY")
}
shout()
shout()`,
		options: ["HEY HEY", "HEY", "Nothing is displayed", "shout shout"],
		answer: 0,
		explanation: "Defining a procedure doesn't run it. Each call — shout() — runs it once, so HEY appears twice.",
	},
	{
		id: "e-proc-3",
		level: "easy",
		topics: ["Procedures"],
		prompt: "What is displayed?",
		code: `PROCEDURE addOne(x)
{
  RETURN(x + 1)
}
y ← addOne(addOne(1))
DISPLAY(y)`,
		options: ["3", "2", "1", "4"],
		answer: 0,
		explanation: "Work from the inside out: addOne(1) is 2, then addOne(2) is 3.",
	},

	// ---------------------------------------------------------------- Robot
	{
		id: "e-robot-1",
		level: "easy",
		topics: ["Robot"],
		prompt: "The robot starts facing right. Which square does it end on?",
		code: `MOVE_FORWARD()
MOVE_FORWARD()`,
		grid: {
			rows: ["....", "....", "..B.", ".CAD"],
			robot: { row: 3, col: 0, facing: "right" },
		},
		verify: "square",
		options: ["A", "B", "C", "D"],
		answer: 0,
		explanation: "MOVE_FORWARD moves one square in the direction the robot is facing. Two squares to the right is A.",
	},
	{
		id: "e-robot-2",
		level: "easy",
		topics: ["Robot"],
		prompt: "The robot starts facing up. Which square does it end on?",
		code: `ROTATE_LEFT()
MOVE_FORWARD()`,
		grid: {
			rows: [".D.", "A.B", ".C."],
			robot: { row: 1, col: 1, facing: "up" },
		},
		verify: "square",
		options: ["A", "B", "C", "D"],
		answer: 0,
		explanation: "ROTATE_LEFT turns the robot a quarter turn to its left (now facing left) without moving it. Then it moves one square left, onto A.",
	},
	{
		id: "e-robot-3",
		level: "easy",
		topics: ["Robot"],
		prompt: "The robot starts facing right. Which way is it facing after this code?",
		code: `ROTATE_LEFT()
ROTATE_LEFT()`,
		grid: {
			rows: ["...", "...", "..."],
			robot: { row: 1, col: 1, facing: "right" },
		},
		verify: "facing",
		options: ["Left", "Right", "Up", "Down"],
		answer: 0,
		explanation: "Two quarter turns make a half turn. Facing right, a half turn leaves the robot facing left.",
	},
];
