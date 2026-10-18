// Question bank for /learn/pseudocode-practice (part 1 of 5 — see also
// pseudocodeQuestionsEasy/Medium/Challenging/ExamStyle.ts). Every question uses the
// text-based pseudocode from the AP Computer Science Principles exam
// reference sheet (the page itself deliberately doesn't name the exam):
// ← for assignment, 1-based list indexes, REPEAT n TIMES / REPEAT UNTIL,
// FOR EACH, PROCEDURE/RETURN, and the robot commands.
//
// `answer` is the index into `options` of the correct choice (the tool
// shuffles options at display time, so authoring order doesn't matter).
// IDs are stable keys for saved progress — never renumber them; add new
// questions with new IDs instead.

import { EASY_QUESTIONS } from "./pseudocodeQuestionsEasy";
import { MEDIUM_QUESTIONS } from "./pseudocodeQuestionsMedium";
import { CHALLENGING_QUESTIONS } from "./pseudocodeQuestionsChallenging";
import { EXAM_STYLE_QUESTIONS } from "./pseudocodeQuestionsExamStyle";

export type PseudoCategory =
	| "Variables & display"
	| "Arithmetic & MOD"
	| "Boolean logic"
	| "Selection"
	| "Iteration"
	| "Lists"
	| "Procedures"
	| "Robot";

export const PSEUDO_CATEGORIES: PseudoCategory[] = [
	"Variables & display",
	"Arithmetic & MOD",
	"Boolean logic",
	"Selection",
	"Iteration",
	"Lists",
	"Procedures",
	"Robot",
];

export type PseudoLevel = "easy" | "medium" | "challenging";
export const PSEUDO_LEVELS: PseudoLevel[] = ["easy", "medium", "challenging"];

/** Robot grid: rows top-to-bottom. "." open, "#" blocked, "A"–"D" labelled open squares. */
export interface RobotGrid {
	rows: string[];
	robot: { row: number; col: number; facing: "up" | "down" | "left" | "right" };
}

export interface PseudoQuestion {
	id: string;
	/** easy = one idea, a few lines; medium = two ideas combined; challenging = several ideas, longer traces. */
	level: PseudoLevel;
	/** Every concept the question exercises, main one first. */
	topics: PseudoCategory[];
	prompt: string;
	code?: string;
	grid?: RobotGrid;
	/**
	 * How the automated answer check (a small interpreter used during
	 * development) verifies this question: the DISPLAY output (default), the
	 * grid label the robot ends on, the way it ends up facing, or "manual" for
	 * conceptual questions checked by hand.
	 */
	verify?: "output" | "square" | "facing" | "manual";
	options: string[];
	answer: number;
	explanation: string;
}

export const CORE_QUESTIONS: PseudoQuestion[] = [
	// ---------------------------------------------------------------- Variables & display
	{
		id: "var-1",
		level: "easy",
		topics: ["Variables & display"],
		prompt: "What is displayed?",
		code: `a ← 4
b ← a
a ← 7
DISPLAY(b)`,
		options: ["4", "7", "11", "a"],
		answer: 0,
		explanation:
			"b ← a copies the value a had at that moment (4) into b. Changing a to 7 afterwards doesn't reach back and change b.",
	},
	{
		id: "var-2",
		level: "easy",
		topics: ["Variables & display"],
		prompt: "What is displayed?",
		code: `x ← 3
y ← 5
x ← y
y ← x
DISPLAY(x)
DISPLAY(y)`,
		options: ["5 5", "5 3", "3 5", "3 3"],
		answer: 0,
		explanation:
			"x ← y makes x 5. Then y ← x copies that new 5 back into y. The original 3 is lost — this is why swapping two variables needs a third, temporary one.",
	},
	{
		id: "var-3",
		level: "medium",
		topics: ["Variables & display"],
		prompt: "What is displayed?",
		code: `a ← 2
b ← 9
temp ← a
a ← b
b ← temp
DISPLAY(a)
DISPLAY(b)`,
		options: ["9 2", "2 9", "9 9", "2 2"],
		answer: 0,
		explanation:
			"temp saves a's 2 before a is overwritten with 9. Then b gets the saved 2. The values have been swapped.",
	},
	{
		id: "var-4",
		level: "easy",
		topics: ["Variables & display"],
		prompt: "What is displayed?",
		code: `count ← 10
count ← count + 1
count ← count * 2
DISPLAY(count)`,
		options: ["22", "21", "12", "20"],
		answer: 0,
		explanation: "Line by line: count is 10, then 10 + 1 = 11, then 11 × 2 = 22.",
	},
	{
		id: "var-5",
		level: "easy",
		topics: ["Variables & display"],
		prompt: "The user types Sam when asked for input. What is displayed?",
		code: `name ← INPUT()
DISPLAY("Hello")
DISPLAY(name)`,
		options: ["Hello Sam", "Hello name", "Sam Hello", "Hello INPUT()"],
		answer: 0,
		explanation:
			"INPUT() waits for the user and stores what they typed — Sam — in name. DISPLAY(name) shows the variable's value, not the word \"name\".",
	},

	// ---------------------------------------------------------------- Arithmetic & MOD
	{
		id: "mod-1",
		level: "easy",
		topics: ["Arithmetic & MOD"],
		prompt: "What is displayed?",
		code: `DISPLAY(17 MOD 5)`,
		options: ["2", "3", "3.4", "12"],
		answer: 0,
		explanation: "MOD gives the remainder after dividing. 17 ÷ 5 is 3 with 2 left over, so 17 MOD 5 is 2.",
	},
	{
		id: "mod-2",
		level: "easy",
		topics: ["Arithmetic & MOD"],
		prompt: "What is displayed?",
		code: `DISPLAY(20 MOD 4)`,
		options: ["0", "5", "4", "1"],
		answer: 0,
		explanation: "4 goes into 20 exactly 5 times with nothing left over, so the remainder is 0.",
	},
	{
		id: "mod-3",
		level: "easy",
		topics: ["Arithmetic & MOD"],
		prompt: "What is displayed?",
		code: `DISPLAY(4 MOD 9)`,
		options: ["4", "0", "5", "2"],
		answer: 0,
		explanation:
			"9 goes into 4 zero times, leaving all 4 as the remainder. Whenever the first number is smaller, MOD gives back the first number.",
	},
	{
		id: "mod-4",
		level: "easy",
		topics: ["Arithmetic & MOD"],
		prompt: "What is displayed?",
		code: `x ← 7
DISPLAY(x / 2)`,
		options: ["3.5", "3", "4", "1"],
		answer: 0,
		explanation: "In this pseudocode, / is ordinary division, so 7 / 2 is 3.5. (MOD is the operator that gives a remainder.)",
	},
	{
		id: "mod-5",
		level: "easy",
		topics: ["Arithmetic & MOD"],
		prompt: "What is displayed?",
		code: `DISPLAY(2 + 3 * 4)`,
		options: ["14", "20", "24", "9"],
		answer: 0,
		explanation: "Multiplication happens before addition, just like in math class: 3 × 4 = 12, then 2 + 12 = 14.",
	},
	{
		id: "mod-6",
		level: "easy",
		topics: ["Arithmetic & MOD"],
		prompt: "What is displayed?",
		code: `n ← 472
DISPLAY(n MOD 10)`,
		options: ["2", "47", "7", "0"],
		answer: 0,
		explanation: "Dividing by 10 leaves the last digit as the remainder: 472 = 47 × 10 + 2. MOD 10 is a handy way to get a number's last digit.",
	},

	// ---------------------------------------------------------------- Boolean logic
	{
		id: "bool-1",
		level: "easy",
		topics: ["Boolean logic"],
		prompt: "What is displayed?",
		code: `a ← 5
b ← 8
DISPLAY((a > 3) AND (b < 6))`,
		options: ["false", "true", "5", "8"],
		answer: 0,
		explanation: "a > 3 is true, but b < 6 is false (8 is not less than 6). AND needs both sides true, so the result is false.",
	},
	{
		id: "bool-2",
		level: "easy",
		topics: ["Boolean logic"],
		prompt: "What is displayed?",
		code: `DISPLAY(NOT (4 = 4))`,
		options: ["false", "true", "4", "0"],
		answer: 0,
		explanation: "4 = 4 is true. NOT flips it, so the result is false.",
	},
	{
		id: "bool-3",
		level: "easy",
		topics: ["Boolean logic"],
		prompt: "What is displayed?",
		code: `x ← 10
DISPLAY((x ≥ 10) OR (x < 0))`,
		options: ["true", "false", "10", "0"],
		answer: 0,
		explanation: "x ≥ 10 is true (10 is equal to 10). OR only needs one side to be true, so the result is true.",
	},
	{
		id: "bool-4",
		level: "medium",
		topics: ["Boolean logic"],
		prompt: "Which expression is true exactly when n is between 1 and 10, including 1 and 10?",
		verify: "manual",
		options: ["(n ≥ 1) AND (n ≤ 10)", "(n ≥ 1) OR (n ≤ 10)", "(n > 1) AND (n < 10)", "NOT (n ≥ 1)"],
		answer: 0,
		explanation:
			"n must be at least 1 AND at most 10, so both conditions must hold. OR would be true for every number, and > / < would leave out 1 and 10 themselves.",
	},
	{
		id: "bool-5",
		level: "easy",
		topics: ["Boolean logic"],
		prompt: "What is displayed?",
		code: `raining ← true
cold ← false
DISPLAY(raining AND (NOT cold))`,
		options: ["true", "false", "raining", "cold"],
		answer: 0,
		explanation: "NOT cold flips false to true. Then raining AND true is true AND true, which is true.",
	},

	// ---------------------------------------------------------------- Selection
	{
		id: "sel-1",
		level: "medium",
		topics: ["Selection"],
		prompt: "What is displayed?",
		code: `score ← 85
IF (score ≥ 90)
{
  DISPLAY("A")
}
ELSE
{
  IF (score ≥ 80)
  {
    DISPLAY("B")
  }
  ELSE
  {
    DISPLAY("Keep going")
  }
}`,
		options: ["B", "A", "Keep going", "A B"],
		answer: 0,
		explanation:
			"85 is not ≥ 90, so the outer ELSE runs. Inside it, 85 ≥ 80 is true, so it displays B. Putting an IF inside an ELSE is how this pseudocode writes \"else if\".",
	},
	{
		id: "sel-2",
		level: "easy",
		topics: ["Selection"],
		prompt: "What is displayed?",
		code: `temp ← 15
IF (temp > 20)
{
  DISPLAY("warm")
}
DISPLAY("done")`,
		options: ["done", "warm done", "warm", "Nothing is displayed"],
		answer: 0,
		explanation:
			"15 > 20 is false, so the code inside the IF is skipped. DISPLAY(\"done\") is outside the IF, so it always runs.",
	},
	{
		id: "sel-3",
		level: "medium",
		topics: ["Selection"],
		prompt: "What is displayed?",
		code: `x ← 4
IF (x MOD 2 = 0)
{
  x ← x + 3
}
ELSE
{
  x ← x * 2
}
IF (x > 6)
{
  DISPLAY("big")
}
ELSE
{
  DISPLAY("small")
}`,
		options: ["big", "small", "big small", "8"],
		answer: 0,
		explanation:
			"4 MOD 2 is 0, so x becomes 4 + 3 = 7. Then 7 > 6 is true, so it displays big.",
	},
	{
		id: "sel-4",
		level: "easy",
		topics: ["Selection"],
		prompt: "What is displayed?",
		code: `age ← 13
IF ((age ≥ 13) AND (age ≤ 19))
{
  DISPLAY("teen")
}
ELSE
{
  DISPLAY("not a teen")
}`,
		options: ["teen", "not a teen", "teen not a teen", "13"],
		answer: 0,
		explanation: "13 ≥ 13 is true and 13 ≤ 19 is true, so the whole condition is true and the first branch runs.",
	},
	{
		id: "sel-5",
		level: "easy",
		topics: ["Selection"],
		prompt: "What is displayed?",
		code: `n ← 12
IF (n > 5)
{
  DISPLAY("A")
}
IF (n > 10)
{
  DISPLAY("B")
}`,
		options: ["A B", "A", "B", "Nothing is displayed"],
		answer: 0,
		explanation:
			"These are two separate IF statements, not an IF/ELSE — each is checked on its own. 12 > 5 and 12 > 10 are both true, so both run.",
	},

	// ---------------------------------------------------------------- Iteration
	{
		id: "loop-1",
		level: "easy",
		topics: ["Iteration"],
		prompt: "What is displayed?",
		code: `total ← 0
REPEAT 4 TIMES
{
  total ← total + 3
}
DISPLAY(total)`,
		options: ["12", "3", "7", "16"],
		answer: 0,
		explanation: "The loop adds 3 four times: 0 → 3 → 6 → 9 → 12.",
	},
	{
		id: "loop-2",
		level: "easy",
		topics: ["Iteration"],
		prompt: "What is displayed?",
		code: `n ← 1
REPEAT 3 TIMES
{
  n ← n * 2
}
DISPLAY(n)`,
		options: ["8", "6", "7", "4"],
		answer: 0,
		explanation: "Doubling three times: 1 → 2 → 4 → 8. That's 2³ — the same doubling you see when you add bits.",
	},
	{
		id: "loop-3",
		level: "easy",
		topics: ["Iteration"],
		prompt: "What is displayed?",
		code: `x ← 0
REPEAT UNTIL (x > 10)
{
  x ← x + 4
}
DISPLAY(x)`,
		options: ["12", "10", "8", "16"],
		answer: 0,
		explanation:
			"x goes 0 → 4 → 8 → 12. The condition is checked before each repeat: at 8 it's not yet > 10, so the loop runs again. At 12 it stops.",
	},
	{
		id: "loop-4",
		level: "medium",
		topics: ["Iteration"],
		prompt: "What is displayed?",
		code: `count ← 0
n ← 20
REPEAT UNTIL (n < 5)
{
  n ← n - 6
  count ← count + 1
}
DISPLAY(count)`,
		options: ["3", "4", "2", "20"],
		answer: 0,
		explanation: "n goes 20 → 14 → 8 → 2, and count goes up once each time: 3 times. At 2, n < 5 is true, so the loop stops.",
	},
	{
		id: "loop-5",
		level: "easy",
		topics: ["Iteration"],
		prompt: "What is displayed?",
		code: `x ← 10
REPEAT UNTIL (x > 5)
{
  x ← x + 1
}
DISPLAY(x)`,
		options: ["10", "11", "6", "The loop never stops"],
		answer: 0,
		explanation:
			"REPEAT UNTIL checks its condition first. 10 > 5 is already true, so the loop body never runs at all and x stays 10.",
	},
	{
		id: "loop-6",
		level: "medium",
		topics: ["Iteration"],
		prompt: "What happens when this code runs?",
		code: `x ← 1
REPEAT UNTIL (x = 10)
{
  x ← x + 2
}
DISPLAY(x)`,
		options: ["The loop never stops", "It displays 10", "It displays 11", "It displays 9"],
		answer: 0,
		explanation:
			"x goes 1, 3, 5, 7, 9, 11, 13… — always odd, so it skips right past 10 and is never exactly equal to it. This is an infinite loop.",
	},
	{
		id: "loop-7",
		level: "easy",
		topics: ["Iteration"],
		prompt: "What is displayed?",
		code: `total ← 0
FOR EACH n IN [2, 5, 1]
{
  total ← total + n
}
DISPLAY(total)`,
		options: ["8", "3", "251", "1"],
		answer: 0,
		explanation: "FOR EACH visits every item in turn: 0 + 2 = 2, then + 5 = 7, then + 1 = 8.",
	},

	// ---------------------------------------------------------------- Lists
	{
		id: "list-1",
		level: "easy",
		topics: ["Lists"],
		prompt: "What is displayed?",
		code: `nums ← [10, 20, 30, 40]
DISPLAY(nums[2])`,
		options: ["20", "30", "10", "An error"],
		answer: 0,
		explanation:
			"In this pseudocode, lists start at index 1, not 0. nums[1] is 10, so nums[2] is 20.",
	},
	{
		id: "list-2",
		level: "easy",
		topics: ["Lists"],
		prompt: "What is displayed?",
		code: `pets ← ["cat", "dog"]
APPEND(pets, "fish")
DISPLAY(LENGTH(pets))`,
		options: ["3", "2", "4", "fish"],
		answer: 0,
		explanation: "APPEND adds \"fish\" to the end, so the list now holds 3 items. LENGTH counts them.",
	},
	{
		id: "list-3",
		level: "medium",
		topics: ["Lists"],
		prompt: "What is displayed?",
		code: `letters ← ["a", "b", "c"]
INSERT(letters, 2, "z")
DISPLAY(letters)`,
		options: ["[a, z, b, c]", "[a, b, z, c]", "[z, a, b, c]", "[a, z, c]"],
		answer: 0,
		explanation:
			"INSERT puts \"z\" at index 2 and shifts everything from there one place to the right. Nothing is replaced.",
	},
	{
		id: "list-4",
		level: "easy",
		topics: ["Lists"],
		prompt: "What is displayed?",
		code: `list ← [5, 6, 7, 8]
REMOVE(list, 1)
DISPLAY(list[1])`,
		options: ["6", "5", "7", "An error"],
		answer: 0,
		explanation:
			"REMOVE(list, 1) deletes the first item (5). Everything shifts left, so 6 is now at index 1.",
	},
	{
		id: "list-5",
		level: "easy",
		topics: ["Lists"],
		prompt: "What is displayed?",
		code: `scores ← [3, 9, 4]
scores[2] ← scores[1] + scores[3]
DISPLAY(scores)`,
		options: ["[3, 7, 4]", "[3, 13, 4]", "[3, 9, 4]", "[7, 9, 4]"],
		answer: 0,
		explanation: "scores[1] is 3 and scores[3] is 4, so scores[2] is replaced with 3 + 4 = 7.",
	},
	{
		id: "list-6",
		level: "easy",
		topics: ["Lists"],
		prompt: "What happens when this code runs?",
		code: `items ← [4, 8, 15]
DISPLAY(items[4])`,
		options: ["An error — there is no index 4", "It displays 15", "It displays 0", "It displays 4"],
		answer: 0,
		explanation:
			"The list has only 3 items, at indexes 1, 2 and 3. Asking for index 4 is outside the list, which causes an error.",
	},
	{
		id: "list-7",
		level: "medium",
		topics: ["Lists"],
		prompt: "What is displayed?",
		code: `list ← [7, 2, 9, 4]
max ← list[1]
FOR EACH item IN list
{
  IF (item > max)
  {
    max ← item
  }
}
DISPLAY(max)`,
		options: ["9", "7", "4", "22"],
		answer: 0,
		explanation:
			"max starts as the first item, 7. The loop only replaces it when it finds something bigger — which happens once, at 9. This is the classic \"find the biggest\" pattern.",
	},
	{
		id: "list-8",
		level: "medium",
		topics: ["Lists"],
		prompt: "What is displayed?",
		code: `nums ← [3, 8, 6, 5, 10]
c ← 0
FOR EACH n IN nums
{
  IF (n MOD 2 = 0)
  {
    c ← c + 1
  }
}
DISPLAY(c)`,
		options: ["3", "2", "5", "24"],
		answer: 0,
		explanation: "n MOD 2 = 0 means n is even. The even numbers are 8, 6 and 10 — three of them.",
	},

	// ---------------------------------------------------------------- Procedures
	{
		id: "proc-1",
		level: "easy",
		topics: ["Procedures"],
		prompt: "What is displayed?",
		code: `PROCEDURE double(x)
{
  RETURN(x * 2)
}
DISPLAY(double(5) + 1)`,
		options: ["11", "12", "10", "6"],
		answer: 0,
		explanation: "double(5) returns 10. Then 10 + 1 = 11 is displayed.",
	},
	{
		id: "proc-2",
		level: "easy",
		topics: ["Procedures"],
		prompt: "What is displayed?",
		code: `PROCEDURE greet(name)
{
  DISPLAY("Hi")
  DISPLAY(name)
}
greet("Ana")
greet("Ben")`,
		options: ["Hi Ana Hi Ben", "Hi Ana Ben", "Ana Ben", "Hi name Hi name"],
		answer: 0,
		explanation:
			"The procedure runs once per call. Each time, the parameter name holds whatever was passed in — first \"Ana\", then \"Ben\".",
	},
	{
		id: "proc-3",
		level: "medium",
		topics: ["Procedures"],
		prompt: "What is displayed?",
		code: `PROCEDURE mystery(a, b)
{
  IF (a > b)
  {
    RETURN(a)
  }
  RETURN(b)
}
DISPLAY(mystery(3, 8))`,
		options: ["8", "3", "11", "true"],
		answer: 0,
		explanation:
			"3 > 8 is false, so the first RETURN is skipped and the procedure returns b, which is 8. mystery returns whichever number is bigger.",
	},
	{
		id: "proc-4",
		level: "medium",
		topics: ["Procedures"],
		prompt: "What is displayed?",
		code: `PROCEDURE check(n)
{
  IF (n < 0)
  {
    RETURN("negative")
  }
  RETURN("not negative")
}
DISPLAY(check(0))`,
		options: ["not negative", "negative", "negative not negative", "0"],
		answer: 0,
		explanation:
			"0 < 0 is false (0 isn't less than itself), so the procedure skips to RETURN(\"not negative\"). RETURN ends the procedure straight away, so only one value ever comes back.",
	},
	{
		id: "proc-5",
		level: "medium",
		topics: ["Procedures"],
		prompt: "What is displayed?",
		code: `PROCEDURE addUp(list)
{
  sum ← 0
  FOR EACH x IN list
  {
    sum ← sum + x
  }
  RETURN(sum)
}
DISPLAY(addUp([1, 2, 3, 4]))`,
		options: ["10", "4", "1234", "24"],
		answer: 0,
		explanation: "The procedure adds every item: 1 + 2 + 3 + 4 = 10, and returns it.",
	},

	// ---------------------------------------------------------------- Robot
	{
		id: "robot-1",
		level: "easy",
		topics: ["Robot"],
		prompt: "The robot (triangle) starts facing up. Which square does it end on?",
		code: `MOVE_FORWARD()
MOVE_FORWARD()
ROTATE_RIGHT()
MOVE_FORWARD()`,
		grid: {
			rows: [".....", ".B...", ".A.D.", ".C...", "....."],
			robot: { row: 4, col: 0, facing: "up" },
		},
		verify: "square",
		options: ["A", "B", "C", "D"],
		answer: 0,
		explanation: "Two squares up, a quarter turn to the right (now facing right), then one square right — landing on A.",
	},
	{
		id: "robot-2",
		level: "medium",
		topics: ["Robot"],
		prompt: "The robot starts facing right. Which square does it end on?",
		code: `REPEAT 3 TIMES
{
  MOVE_FORWARD()
}
ROTATE_LEFT()
MOVE_FORWARD()`,
		grid: {
			rows: [".....", ".....", "....B", "...CA", "....D"],
			robot: { row: 4, col: 1, facing: "right" },
		},
		verify: "square",
		options: ["A", "B", "C", "D"],
		answer: 0,
		explanation:
			"Three squares right takes it to the bottom-right corner (square D). Turning left while facing right makes it face up. One square up is A.",
	},
	{
		id: "robot-3",
		level: "medium",
		topics: ["Robot"],
		prompt: "The robot starts facing right. Dark squares are blocked. Which square does it end on?",
		code: `REPEAT UNTIL (NOT CAN_MOVE("forward"))
{
  MOVE_FORWARD()
}`,
		grid: {
			rows: [".....", "..D..", "..A#B", "..C..", "....."],
			robot: { row: 2, col: 0, facing: "right" },
		},
		verify: "square",
		options: ["A", "B", "C", "D"],
		answer: 0,
		explanation:
			"The robot keeps moving forward while the way ahead is open. From A, the next square is blocked, so CAN_MOVE(\"forward\") is false and the loop stops on A.",
	},
	{
		id: "robot-4",
		level: "easy",
		topics: ["Robot"],
		prompt: "The robot starts facing up. Which way is it facing after this code?",
		code: `ROTATE_RIGHT()
ROTATE_RIGHT()
ROTATE_LEFT()`,
		grid: {
			rows: ["...", "...", "..."],
			robot: { row: 1, col: 1, facing: "up" },
		},
		verify: "facing",
		options: ["Right", "Up", "Down", "Left"],
		answer: 0,
		explanation: "Right twice turns it from up to right to down. One left turn brings it back to facing right.",
	},
	{
		id: "robot-5",
		level: "medium",
		topics: ["Robot"],
		prompt: "The robot starts facing up. Where does it end up?",
		code: `REPEAT 4 TIMES
{
  MOVE_FORWARD()
  ROTATE_RIGHT()
}`,
		grid: {
			rows: [".....", ".....", ".....", ".....", "....."],
			robot: { row: 3, col: 1, facing: "up" },
		},
		verify: "manual",
		options: [
			"Back where it started, facing up",
			"Back where it started, facing down",
			"One square up from where it started",
			"Four squares up from where it started",
		],
		answer: 0,
		explanation:
			"Up, right, down, left — the robot traces a small square and arrives back at its starting square. Four right turns is a full circle, so it's facing up again.",
	},
	{
		id: "robot-6",
		level: "medium",
		topics: ["Robot"],
		prompt: "The robot starts facing up. Dark squares are blocked. Which square does it end on?",
		code: `IF (CAN_MOVE("forward"))
{
  MOVE_FORWARD()
}
ELSE
{
  ROTATE_RIGHT()
  MOVE_FORWARD()
}`,
		grid: {
			rows: [".....", ".....", "D....", "#B...", ".AC.."],
			robot: { row: 4, col: 0, facing: "up" },
		},
		verify: "square",
		options: ["A", "B", "C", "D"],
		answer: 0,
		explanation:
			"The square above the robot is blocked, so CAN_MOVE(\"forward\") is false and the ELSE runs: turn right (now facing right) and move one square — onto A.",
	},
];

/** The whole bank: the original set, the three level files, and the exam-style formats. */
export const PSEUDO_QUESTIONS: PseudoQuestion[] = [
	...CORE_QUESTIONS,
	...EASY_QUESTIONS,
	...MEDIUM_QUESTIONS,
	...CHALLENGING_QUESTIONS,
	...EXAM_STYLE_QUESTIONS,
];
