// Exam-style formats the other files use less often: RANDOM ("which value
// could be displayed?"), fill in <MISSING CODE>, and "which of these code
// segments work?" with segments labelled I, II, III. These are checked
// during development by substituting each option / running each segment
// against several inputs (and by enumerating every RANDOM outcome), so
// they're marked verify: "manual" for the single-run output checker.
import type { PseudoQuestion } from "./pseudocodeQuestions";

export const EXAM_STYLE_QUESTIONS: PseudoQuestion[] = [
	// ---------------------------------------------------------------- RANDOM
	{
		id: "x-rand-1",
		level: "easy",
		topics: ["Arithmetic & MOD", "Variables & display"],
		prompt: "RANDOM(a, b) gives a random whole number from a to b. Which value could NOT be displayed?",
		code: `x ← RANDOM(1, 6)
DISPLAY(x)`,
		verify: "manual",
		options: ["0", "1", "6", "3"],
		answer: 0,
		explanation: "RANDOM(1, 6) can give 1, 2, 3, 4, 5 or 6 — both ends are included. It never gives 0.",
	},
	{
		id: "x-rand-2",
		level: "easy",
		topics: ["Arithmetic & MOD"],
		prompt: "Which list shows every value that could be displayed?",
		code: `n ← RANDOM(1, 4) * 2
DISPLAY(n)`,
		verify: "manual",
		options: ["2, 4, 6, 8", "1, 2, 3, 4", "2, 4, 6", "0, 2, 4, 6, 8"],
		answer: 0,
		explanation: "RANDOM(1, 4) gives 1, 2, 3 or 4. Doubling each one gives 2, 4, 6 or 8.",
	},
	{
		id: "x-rand-3",
		level: "medium",
		topics: ["Arithmetic & MOD", "Variables & display"],
		prompt: "Which value could NOT be displayed?",
		code: `a ← RANDOM(1, 3)
b ← RANDOM(1, 3)
DISPLAY(a + b)`,
		verify: "manual",
		options: ["1", "2", "4", "6"],
		answer: 0,
		explanation: "The smallest each can be is 1, so the smallest total is 1 + 1 = 2. The largest is 3 + 3 = 6. A total of 1 is impossible.",
	},
	{
		id: "x-rand-4",
		level: "medium",
		topics: ["Selection", "Arithmetic & MOD"],
		prompt: "What is the chance that win is displayed?",
		code: `roll ← RANDOM(1, 10)
IF (roll ≤ 3)
{
  DISPLAY("win")
}
ELSE
{
  DISPLAY("try again")
}`,
		verify: "manual",
		options: ["30%", "33%", "40%", "10%"],
		answer: 0,
		explanation: "There are 10 equally likely rolls. Three of them (1, 2, 3) are ≤ 3, so the chance is 3 out of 10 = 30%.",
	},
	{
		id: "x-rand-5",
		level: "medium",
		topics: ["Selection", "Arithmetic & MOD"],
		prompt: "A game should give a 1 in 4 chance of finding treasure. Which condition does this?",
		verify: "manual",
		options: ["IF (RANDOM(1, 4) = 1)", "IF (RANDOM(1, 4) ≤ 4)", "IF (RANDOM(0, 4) = 1)", "IF (RANDOM(1, 4) > 1)"],
		answer: 0,
		explanation:
			"RANDOM(1, 4) has four equal outcomes, and = 1 picks exactly one of them. ≤ 4 is always true, RANDOM(0, 4) has five outcomes (1 in 5), and > 1 is true 3 times out of 4.",
	},
	{
		id: "x-rand-6",
		level: "challenging",
		topics: ["Iteration", "Selection", "Arithmetic & MOD"],
		prompt: "Which values could be displayed?",
		code: `count ← 0
REPEAT 3 TIMES
{
  IF (RANDOM(1, 2) = 1)
  {
    count ← count + 1
  }
}
DISPLAY(count)`,
		verify: "manual",
		options: ["0, 1, 2, or 3", "1, 2, or 3 only", "0 or 3 only", "3 only"],
		answer: 0,
		explanation:
			"Each of the 3 passes is like a coin flip that may or may not add 1. Anything from no hits (0) to three hits (3) can happen.",
	},

	// ---------------------------------------------------------------- Missing code
	{
		id: "x-miss-1",
		level: "medium",
		topics: ["Lists", "Iteration", "Arithmetic & MOD"],
		prompt: "The code should add up only the even numbers in nums, so 14 is displayed. Which replaces <MISSING CODE>?",
		code: `nums ← [3, 8, 5, 6]
total ← 0
FOR EACH n IN nums
{
  IF (<MISSING CODE>)
  {
    total ← total + n
  }
}
DISPLAY(total)`,
		verify: "manual",
		options: ["n MOD 2 = 0", "n MOD 2 = 1", "total MOD 2 = 0", "n / 2 = 0"],
		answer: 0,
		explanation:
			"A number is even when dividing by 2 leaves no remainder: n MOD 2 = 0. That adds 8 + 6 = 14. n MOD 2 = 1 would add the odd numbers instead.",
	},
	{
		id: "x-miss-2",
		level: "medium",
		topics: ["Lists", "Iteration", "Selection"],
		prompt: "The code should display the largest value in nums. Which replaces <MISSING CODE>?",
		code: `nums ← [4, 9, 2, 7]
max ← nums[1]
FOR EACH n IN nums
{
  IF (n > max)
  {
    <MISSING CODE>
  }
}
DISPLAY(max)`,
		verify: "manual",
		options: ["max ← n", "n ← max", "max ← max + 1", "DISPLAY(n)"],
		answer: 0,
		explanation:
			"When a bigger value turns up, max has to remember it: max ← n. Writing n ← max changes the loop variable instead, so max stays 4.",
	},
	{
		id: "x-miss-3",
		level: "challenging",
		topics: ["Iteration", "Boolean logic"],
		prompt: "The code should display 1 2 3 4 5. Which replaces <MISSING CODE>?",
		code: `i ← 1
REPEAT UNTIL (<MISSING CODE>)
{
  DISPLAY(i)
  i ← i + 1
}`,
		verify: "manual",
		options: ["i > 5", "i = 5", "i ≥ 5", "i < 5"],
		answer: 0,
		explanation:
			"REPEAT UNTIL checks before each pass and stops when the condition is true. With i > 5 it still runs when i is 5. i = 5 and i ≥ 5 stop one pass early (1 2 3 4); i < 5 is true straight away, so nothing is displayed.",
	},
	{
		id: "x-miss-4",
		level: "challenging",
		topics: ["Procedures", "Lists", "Iteration"],
		prompt: "average should return the mean of any list of numbers. Which replaces <MISSING CODE>?",
		code: `PROCEDURE average(list)
{
  sum ← 0
  FOR EACH x IN list
  {
    sum ← sum + x
  }
  <MISSING CODE>
}

DISPLAY(average([2, 4, 9]))`,
		verify: "manual",
		options: ["RETURN(sum / LENGTH(list))", "RETURN(sum / x)", "RETURN(LENGTH(list) / sum)", "DISPLAY(sum / LENGTH(list))"],
		answer: 0,
		explanation:
			"The mean is the total divided by how many numbers there are, and the procedure must RETURN it so the caller can use it. DISPLAY inside the procedure would show the value but return nothing.",
	},
	{
		id: "x-miss-5",
		level: "medium",
		topics: ["Lists", "Variables & display"],
		prompt: "The code should swap the first and last items, so [30, 20, 10] is displayed. Which replaces <MISSING CODE>?",
		code: `list ← [10, 20, 30]
temp ← list[1]
list[1] ← list[3]
<MISSING CODE>
DISPLAY(list)`,
		verify: "manual",
		options: ["list[3] ← temp", "list[3] ← list[1]", "temp ← list[3]", "list[1] ← temp"],
		answer: 0,
		explanation:
			"temp saved the old first item (10) before it was overwritten. Putting temp into the last spot finishes the swap. list[3] ← list[1] would copy 30 back, giving [30, 20, 30].",
	},

	// ---------------------------------------------------------------- Which segments work?
	{
		id: "x-seg-1",
		level: "challenging",
		topics: ["Iteration", "Variables & display"],
		prompt: "Which of these code segments display 2 4 6 8 10?",
		code: `Segment I
n ← 2
REPEAT 5 TIMES
{
  DISPLAY(n)
  n ← n + 2
}

Segment II
n ← 0
REPEAT 5 TIMES
{
  n ← n + 2
  DISPLAY(n)
}

Segment III
n ← 2
REPEAT UNTIL (n > 10)
{
  DISPLAY(n)
  n ← n + 2
}`,
		verify: "manual",
		options: ["I, II, and III", "I only", "I and II only", "I and III only"],
		answer: 0,
		explanation:
			"All three work. II starts at 0 but adds 2 before displaying. III stops once n reaches 12, after 10 has been displayed. Different code can produce the same result.",
	},
	{
		id: "x-seg-2",
		level: "challenging",
		topics: ["Lists", "Iteration", "Selection"],
		prompt: "Each segment should set found to true if list contains 7 anywhere, and false if it doesn't. Which always work?",
		code: `Segment I
found ← false
FOR EACH n IN list
{
  IF (n = 7)
  {
    found ← true
  }
}

Segment II
found ← false
FOR EACH n IN list
{
  found ← (n = 7)
}

Segment III
found ← true
FOR EACH n IN list
{
  IF (n ≠ 7)
  {
    found ← false
  }
}`,
		verify: "manual",
		options: ["I only", "I and II", "I and III", "I, II, and III"],
		answer: 0,
		explanation:
			"Only I works. II overwrites found on every pass, so only the last item counts ([7, 3] gives false). III is only true when every item is 7.",
	},
	{
		id: "x-seg-3",
		level: "challenging",
		topics: ["Variables & display", "Arithmetic & MOD"],
		prompt: "a and b hold numbers. Which segments swap their values?",
		code: `Segment I
temp ← a
a ← b
b ← temp

Segment II
a ← b
b ← a

Segment III
a ← a + b
b ← a - b
a ← a - b`,
		verify: "manual",
		options: ["I and III", "I only", "I and II", "I, II, and III"],
		answer: 0,
		explanation:
			"I saves a first, so nothing is lost. II loses a's value: both end up as the old b. III is a math trick — try a = 3, b = 5: a becomes 8, b becomes 3, then a becomes 5.",
	},
	{
		id: "x-seg-4",
		level: "challenging",
		topics: ["Procedures", "Arithmetic & MOD", "Boolean logic"],
		prompt: "Which versions of isEven return true exactly when the positive whole number n is even?",
		code: `Version I
PROCEDURE isEven(n)
{
  RETURN(n MOD 2 = 0)
}

Version II
PROCEDURE isEven(n)
{
  IF (n MOD 2 = 0)
  {
    RETURN(true)
  }
  RETURN(false)
}

Version III
PROCEDURE isEven(n)
{
  RETURN(n / 2 = 0)
}`,
		verify: "manual",
		options: ["I and II", "I only", "II only", "I, II, and III"],
		answer: 0,
		explanation:
			"I returns the true/false result of the test directly. II does the same in more steps — RETURN ends the procedure, so false is only reached for odd n. III divides instead of using MOD: 4 / 2 is 2, not 0, so it returns false.",
	},
	{
		id: "x-seg-5",
		level: "challenging",
		topics: ["Selection", "Variables & display"],
		prompt: "What do the two segments display?",
		code: `Segment I
x ← 10
IF (x > 5)
{
  x ← x - 5
}
IF (x > 2)
{
  x ← x - 2
}
DISPLAY(x)

Segment II
x ← 10
IF (x > 5)
{
  x ← x - 5
}
ELSE
{
  IF (x > 2)
  {
    x ← x - 2
  }
}
DISPLAY(x)`,
		verify: "manual",
		options: ["I displays 3, II displays 5", "Both display 3", "Both display 5", "I displays 5, II displays 3"],
		answer: 0,
		explanation:
			"In I, both IFs are checked: 10 → 5, then 5 > 2 so 5 → 3. In II, the second test is inside ELSE, so it's skipped once the first IF runs: 10 → 5.",
	},
];
