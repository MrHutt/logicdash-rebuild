// Challenging questions: several ideas at once and longer traces — nested
// loops, lists that change while being looped over, procedures calling
// procedures, "what does this do?", and multi-step robot routes.
import type { PseudoQuestion } from "./pseudocodeQuestions";

export const CHALLENGING_QUESTIONS: PseudoQuestion[] = [
	// ---------------------------------------------------------------- Nested loops
	{
		id: "c-nest-1",
		level: "challenging",
		topics: ["Iteration"],
		prompt: "What is displayed?",
		code: `count ← 0
REPEAT 3 TIMES
{
  REPEAT 4 TIMES
  {
    count ← count + 1
  }
}
DISPLAY(count)`,
		options: ["12", "7", "4", "3"],
		answer: 0,
		explanation: "The inner loop runs 4 times for each of the 3 outer passes: 3 × 4 = 12.",
	},
	{
		id: "c-nest-2",
		level: "challenging",
		topics: ["Iteration", "Variables & display"],
		prompt: "What is displayed?",
		code: `i ← 1
REPEAT 3 TIMES
{
  j ← 1
  REPEAT i TIMES
  {
    DISPLAY(j)
    j ← j + 1
  }
  i ← i + 1
}`,
		options: ["1 1 2 1 2 3", "1 2 3", "1 2 3 1 2 3 1 2 3", "1 1 1 2 2 3"],
		answer: 0,
		explanation:
			"The inner loop runs i times, and i grows each pass. Pass 1 shows 1; pass 2 shows 1 2; pass 3 shows 1 2 3. j is reset to 1 at the start of every pass.",
	},
	{
		id: "c-nest-3",
		level: "challenging",
		topics: ["Iteration"],
		prompt: "What is displayed?",
		code: `n ← 0
REPEAT 2 TIMES
{
  REPEAT 3 TIMES
  {
    n ← n + 2
  }
  n ← n - 1
}
DISPLAY(n)`,
		options: ["10", "12", "11", "5"],
		answer: 0,
		explanation: "Each outer pass adds 2 three times (+6) and then subtracts 1, a net +5. Two passes: 0 + 5 + 5 = 10.",
	},
	{
		id: "c-nest-4",
		level: "challenging",
		topics: ["Iteration", "Selection", "Lists"],
		prompt: "What is displayed?",
		code: `FOR EACH a IN [1, 2]
{
  FOR EACH b IN [1, 2]
  {
    IF (a ≠ b)
    {
      DISPLAY(a * 10 + b)
    }
  }
}`,
		options: ["12 21", "11 12 21 22", "12", "21 12"],
		answer: 0,
		explanation:
			"All four pairs are tried: (1,1), (1,2), (2,1), (2,2). Only the two pairs with different values pass the IF, giving 12 then 21.",
	},
	{
		id: "c-nest-5",
		level: "challenging",
		topics: ["Iteration", "Selection", "Lists"],
		prompt: "What is displayed?",
		code: `count ← 0
FOR EACH x IN [2, 3, 4]
{
  FOR EACH y IN [2, 3, 4]
  {
    IF (x * y > 8)
    {
      count ← count + 1
    }
  }
}
DISPLAY(count)`,
		options: ["4", "3", "5", "9"],
		answer: 0,
		explanation: "Of the 9 products, only 3×3 = 9, 3×4 = 12, 4×3 = 12 and 4×4 = 16 are greater than 8. (2×4 and 4×2 are exactly 8, which doesn't count.)",
	},
	{
		id: "c-nest-6",
		level: "challenging",
		topics: ["Iteration"],
		prompt: "What is displayed?",
		code: `i ← 1
REPEAT UNTIL (i > 3)
{
  REPEAT i TIMES
  {
    DISPLAY("*")
  }
  DISPLAY("|")
  i ← i + 1
}`,
		options: ["* | * * | * * * |", "* * * |", "* | * | * |", "* * * | * * | * |"],
		answer: 0,
		explanation: "Each pass shows i stars and then a bar, and i grows from 1 to 3 — a growing staircase.",
	},

	// ---------------------------------------------------------------- Changing a list inside a loop
	{
		id: "c-lmod-1",
		level: "challenging",
		topics: ["Lists", "Iteration", "Selection"],
		prompt: "What is displayed?",
		code: `nums ← [1, 2, 3, 4]
i ← 1
REPEAT UNTIL (i > LENGTH(nums))
{
  IF (nums[i] MOD 2 = 0)
  {
    REMOVE(nums, i)
  }
  ELSE
  {
    i ← i + 1
  }
}
DISPLAY(nums)`,
		options: ["[1, 3]", "[2, 4]", "[1, 3, 4]", "[1, 2, 3, 4]"],
		answer: 0,
		explanation:
			"This removes every even number. The key detail: after a REMOVE, i does NOT move on, because the next item has just slid into position i and still needs checking.",
	},
	{
		id: "c-lmod-2",
		level: "challenging",
		topics: ["Lists", "Iteration", "Selection"],
		prompt: "This code is meant to remove every even number. What is actually displayed?",
		code: `nums ← [2, 4, 6, 7]
i ← 1
REPEAT UNTIL (i > LENGTH(nums))
{
  IF (nums[i] MOD 2 = 0)
  {
    REMOVE(nums, i)
  }
  i ← i + 1
}
DISPLAY(nums)`,
		options: ["[4, 7]", "[7]", "[2, 4, 6, 7]", "[4, 6, 7]"],
		answer: 0,
		explanation:
			"Removing 2 slides 4 into index 1 — but i moves on to 2 anyway, so 4 is never checked. Then 6 is removed and i goes past the end. This \"skip after remove\" bug is very common.",
	},
	{
		id: "c-lmod-3",
		level: "challenging",
		topics: ["Lists", "Iteration"],
		prompt: "What is displayed?",
		code: `list ← [5]
REPEAT 3 TIMES
{
  INSERT(list, 1, LENGTH(list))
}
DISPLAY(list)`,
		options: ["[3, 2, 1, 5]", "[5, 1, 2, 3]", "[1, 2, 3, 5]", "[3, 3, 3, 5]"],
		answer: 0,
		explanation:
			"Each pass puts the current length at the front. The length is 1, then 2, then 3 — and each new number goes in front of the last one: [1, 5] → [2, 1, 5] → [3, 2, 1, 5].",
	},
	{
		id: "c-lmod-4",
		level: "challenging",
		topics: ["Lists", "Iteration"],
		prompt: "What is displayed?",
		code: `a ← [1, 2, 3]
b ← []
FOR EACH x IN a
{
  INSERT(b, 1, x)
}
DISPLAY(b)`,
		options: ["[3, 2, 1]", "[1, 2, 3]", "[1]", "[3]"],
		answer: 0,
		explanation: "Every item is inserted at the front, so each new one pushes the earlier ones back. The result is the list reversed.",
	},
	{
		id: "c-lmod-5",
		level: "challenging",
		topics: ["Lists", "Iteration"],
		prompt: "What is displayed?",
		code: `q ← ["A", "B", "C"]
REPEAT 2 TIMES
{
  front ← q[1]
  REMOVE(q, 1)
  APPEND(q, front)
}
DISPLAY(q)`,
		options: ["[C, A, B]", "[B, C, A]", "[A, B, C]", "[C, B, A]"],
		answer: 0,
		explanation: "Each pass moves the front item to the back, like people rejoining a queue: [B, C, A], then [C, A, B].",
	},
	{
		id: "c-lmod-6",
		level: "challenging",
		topics: ["Lists", "Selection", "Variables & display"],
		prompt: "What is displayed?",
		code: `nums ← [3, 1, 2]
IF (nums[1] > nums[2])
{
  temp ← nums[1]
  nums[1] ← nums[2]
  nums[2] ← temp
}
IF (nums[2] > nums[3])
{
  temp ← nums[2]
  nums[2] ← nums[3]
  nums[3] ← temp
}
DISPLAY(nums)`,
		options: ["[1, 2, 3]", "[1, 3, 2]", "[3, 1, 2]", "[2, 1, 3]"],
		answer: 0,
		explanation:
			"The first IF swaps 3 and 1 → [1, 3, 2]. The second compares the new middle (3) with 2 and swaps → [1, 2, 3]. This is one pass of a bubble sort.",
	},
	{
		id: "c-lmod-7",
		level: "challenging",
		topics: ["Lists", "Iteration", "Boolean logic"],
		prompt: "What is displayed?",
		code: `src ← [4, 4, 7, 4, 9]
out ← []
FOR EACH x IN src
{
  found ← false
  FOR EACH y IN out
  {
    IF (y = x)
    {
      found ← true
    }
  }
  IF (NOT found)
  {
    APPEND(out, x)
  }
}
DISPLAY(out)`,
		options: ["[4, 7, 9]", "[4, 4, 7, 4, 9]", "[7, 9]", "[4, 7, 4, 9]"],
		answer: 0,
		explanation: "For each item, the inner loop checks whether it's already in out. Only new values get added, so repeats are dropped.",
	},
	{
		id: "c-lmod-8",
		level: "challenging",
		topics: ["Lists"],
		prompt: "What is displayed?",
		code: `nums ← [10, 15, 20, 25]
REMOVE(nums, 2)
INSERT(nums, 2, 99)
APPEND(nums, nums[1])
DISPLAY(nums)`,
		options: ["[10, 99, 20, 25, 10]", "[10, 99, 15, 20, 25, 10]", "[99, 10, 20, 25, 10]", "[10, 99, 25, 10]"],
		answer: 0,
		explanation: "Remove 15 → [10, 20, 25]. Insert 99 at index 2 → [10, 99, 20, 25]. Append nums[1], which is 10.",
	},

	// ---------------------------------------------------------------- Procedures calling procedures
	{
		id: "c-pp-1",
		level: "challenging",
		topics: ["Procedures"],
		prompt: "What is displayed?",
		code: `PROCEDURE square(x)
{
  RETURN(x * x)
}
PROCEDURE sumSquares(a, b)
{
  RETURN(square(a) + square(b))
}
DISPLAY(sumSquares(2, 3))`,
		options: ["13", "25", "10", "36"],
		answer: 0,
		explanation: "sumSquares calls square twice: 2² + 3² = 4 + 9 = 13. (25 would be (2 + 3)², a different thing.)",
	},
	{
		id: "c-pp-2",
		level: "challenging",
		topics: ["Procedures"],
		prompt: "What is displayed?",
		code: `PROCEDURE f(x)
{
  RETURN(x + 3)
}
PROCEDURE g(x)
{
  RETURN(f(x) * 2)
}
DISPLAY(g(1))
DISPLAY(f(g(1)))`,
		options: ["8 11", "8 8", "5 8", "7 10"],
		answer: 0,
		explanation: "g(1) = f(1) × 2 = 4 × 2 = 8. Then f(g(1)) = f(8) = 11.",
	},
	{
		id: "c-pp-3",
		level: "challenging",
		topics: ["Procedures", "Selection", "Arithmetic & MOD"],
		prompt: "Leap years follow special rules. What is displayed?",
		code: `PROCEDURE isDiv(n, d)
{
  RETURN(n MOD d = 0)
}
PROCEDURE isLeap(y)
{
  IF (isDiv(y, 400))
  {
    RETURN(true)
  }
  IF (isDiv(y, 100))
  {
    RETURN(false)
  }
  RETURN(isDiv(y, 4))
}
DISPLAY(isLeap(1900))
DISPLAY(isLeap(2024))`,
		options: ["false true", "true true", "true false", "false false"],
		answer: 0,
		explanation:
			"1900 isn't divisible by 400, but it is divisible by 100, so it returns false. 2024 passes neither of the first two checks and is divisible by 4 → true.",
	},
	{
		id: "c-pp-4",
		level: "challenging",
		topics: ["Procedures", "Variables & display"],
		prompt: "What is displayed?",
		code: `PROCEDURE greet(n)
{
  DISPLAY("Hi")
  RETURN(n + 1)
}
x ← greet(greet(0))
DISPLAY(x)`,
		options: ["Hi Hi 2", "Hi 2", "Hi Hi 1", "2"],
		answer: 0,
		explanation: "greet runs twice (inner call first), displaying Hi each time. The inner call returns 1, the outer returns 2.",
	},
	{
		id: "c-pp-5",
		level: "challenging",
		topics: ["Procedures", "Selection", "Iteration"],
		prompt: "What is displayed?",
		code: `PROCEDURE clamp(n, lo, hi)
{
  IF (n < lo)
  {
    RETURN(lo)
  }
  IF (n > hi)
  {
    RETURN(hi)
  }
  RETURN(n)
}
FOR EACH v IN [-5, 7, 50]
{
  DISPLAY(clamp(v, 0, 10))
}`,
		options: ["0 7 10", "-5 7 50", "0 7 50", "10 7 0"],
		answer: 0,
		explanation: "clamp keeps a value inside a range: too low becomes 0, too high becomes 10, anything in between is unchanged.",
	},

	// ---------------------------------------------------------------- Procedures + lists + early RETURN
	{
		id: "c-plr-1",
		level: "challenging",
		topics: ["Procedures", "Lists", "Iteration"],
		prompt: "What is displayed?",
		code: `PROCEDURE indexOf(list, t)
{
  i ← 1
  FOR EACH x IN list
  {
    IF (x = t)
    {
      RETURN(i)
    }
    i ← i + 1
  }
  RETURN(-1)
}
DISPLAY(indexOf([5, 8, 8, 2], 8))
DISPLAY(indexOf([5, 8], 3))`,
		options: ["2 -1", "3 -1", "2 0", "8 3"],
		answer: 0,
		explanation:
			"RETURN stops at the first match, so the first 8 (index 2) is reported, not the second. When nothing matches, -1 signals \"not found.\"",
	},
	{
		id: "c-plr-2",
		level: "challenging",
		topics: ["Procedures", "Lists", "Boolean logic"],
		prompt: "What is displayed?",
		code: `PROCEDURE allPositive(list)
{
  FOR EACH x IN list
  {
    IF (x ≤ 0)
    {
      RETURN(false)
    }
  }
  RETURN(true)
}
DISPLAY(allPositive([3, 1, 0, 6]))`,
		options: ["false", "true", "0", "3"],
		answer: 0,
		explanation: "0 is not positive (0 ≤ 0 is true), so the procedure returns false as soon as it reaches it.",
	},
	{
		id: "c-plr-3",
		level: "challenging",
		topics: ["Procedures", "Lists", "Selection"],
		prompt: "What is displayed?",
		code: `PROCEDURE findMin(list)
{
  m ← list[1]
  FOR EACH x IN list
  {
    IF (x < m)
    {
      m ← x
    }
  }
  RETURN(m)
}
DISPLAY(findMin([7, 3, 9, 3, 5]))`,
		options: ["3", "7", "5", "2"],
		answer: 0,
		explanation: "m starts at 7 and is replaced whenever something smaller turns up. The smallest value is 3 (the repeat changes nothing).",
	},
	{
		id: "c-plr-4",
		level: "challenging",
		topics: ["Procedures", "Lists", "Selection"],
		prompt: "This procedure is meant to find the largest value. What is displayed?",
		code: `PROCEDURE findMax(list)
{
  m ← 0
  FOR EACH x IN list
  {
    IF (x > m)
    {
      m ← x
    }
  }
  RETURN(m)
}
DISPLAY(findMax([-4, -2, -9]))`,
		options: ["0", "-2", "-4", "-9"],
		answer: 0,
		explanation:
			"None of the values is greater than the starting 0, so 0 is returned — a number that isn't even in the list. Starting m at list[1] fixes this bug.",
	},
	{
		id: "c-plr-5",
		level: "challenging",
		topics: ["Procedures", "Lists", "Iteration"],
		prompt: "What is displayed?",
		code: `PROCEDURE total(list)
{
  s ← 0
  FOR EACH x IN list
  {
    s ← s + x
    IF (s > 10)
    {
      RETURN(s)
    }
  }
  RETURN(s)
}
DISPLAY(total([4, 5, 6, 7]))`,
		options: ["15", "22", "9", "10"],
		answer: 0,
		explanation: "s goes 4, 9, 15. As soon as it passes 10, RETURN ends the procedure — so the 7 is never added.",
	},

	// ---------------------------------------------------------------- What does it do?
	{
		id: "c-purpose-1",
		level: "challenging",
		topics: ["Procedures", "Lists", "Arithmetic & MOD"],
		prompt: "What does mystery return?",
		code: `PROCEDURE mystery(list)
{
  c ← 0
  FOR EACH x IN list
  {
    IF (x MOD 2 = 1)
    {
      c ← c + 1
    }
  }
  RETURN(c)
}`,
		verify: "manual",
		options: [
			"How many odd numbers are in the list",
			"How many even numbers are in the list",
			"The total of the odd numbers",
			"true if the list contains an odd number",
		],
		answer: 0,
		explanation: "x MOD 2 = 1 is true for odd numbers, and c goes up by 1 (not by x) each time — so it counts them.",
	},
	{
		id: "c-purpose-2",
		level: "challenging",
		topics: ["Procedures", "Selection"],
		prompt: "What does mystery return?",
		code: `PROCEDURE mystery(a, b)
{
  IF (a < b)
  {
    RETURN(a)
  }
  RETURN(b)
}`,
		verify: "manual",
		options: ["The smaller of a and b", "The larger of a and b", "Always a", "The difference between a and b"],
		answer: 0,
		explanation: "If a is less than b it returns a; otherwise b. Either way, the smaller one (or b when they're equal, which is the same value).",
	},
	{
		id: "c-purpose-3",
		level: "challenging",
		topics: ["Procedures", "Lists", "Iteration"],
		prompt: "What does mystery return?",
		code: `PROCEDURE mystery(list)
{
  r ← []
  FOR EACH x IN list
  {
    INSERT(r, 1, x)
  }
  RETURN(r)
}`,
		verify: "manual",
		options: [
			"A copy of the list in reverse order",
			"A copy of the list in the same order",
			"The list sorted from smallest to largest",
			"A list with only the first item",
		],
		answer: 0,
		explanation: "Inserting each item at the front means later items end up before earlier ones — a reversed copy.",
	},
	{
		id: "c-purpose-4",
		level: "challenging",
		topics: ["Procedures", "Lists", "Boolean logic"],
		prompt: "What does mystery return?",
		code: `PROCEDURE mystery(list, t)
{
  c ← 0
  FOR EACH x IN list
  {
    IF (x = t)
    {
      c ← c + 1
    }
  }
  RETURN(c > 0)
}`,
		verify: "manual",
		options: [
			"true if t appears anywhere in the list",
			"How many times t appears in the list",
			"true only if every item equals t",
			"The position of t in the list",
		],
		answer: 0,
		explanation: "It counts matches, but returns c > 0 — a true/false value that is true if there was at least one match.",
	},
	{
		id: "c-purpose-5",
		level: "challenging",
		topics: ["Arithmetic & MOD", "Boolean logic"],
		prompt: "Which condition is true exactly when n is a multiple of both 3 and 5?",
		verify: "manual",
		options: [
			"(n MOD 3 = 0) AND (n MOD 5 = 0)",
			"(n MOD 3 = 0) OR (n MOD 5 = 0)",
			"n MOD 15 = 1",
			"(n / 3 = 0) AND (n / 5 = 0)",
		],
		answer: 0,
		explanation:
			"\"Multiple of 3\" is n MOD 3 = 0, and both must hold, so AND. OR would also accept 6 or 10. Division (/) doesn't test divisibility.",
	},
	{
		id: "c-purpose-6",
		level: "challenging",
		topics: ["Procedures", "Lists", "Selection"],
		prompt: "What does mystery return?",
		code: `PROCEDURE mystery(list)
{
  prev ← list[1]
  FOR EACH x IN list
  {
    IF (x < prev)
    {
      RETURN(false)
    }
    prev ← x
  }
  RETURN(true)
}`,
		verify: "manual",
		options: [
			"true if the list is in order from smallest to largest",
			"true if the list has no repeated values",
			"true if every item is positive",
			"The largest item in the list",
		],
		answer: 0,
		explanation:
			"It compares each item with the one before it and gives up (false) the moment one goes down. Getting through the whole list means it never decreased — it's sorted.",
	},

	// ---------------------------------------------------------------- Boolean logic, deeper
	{
		id: "c-bool-1",
		level: "challenging",
		topics: ["Boolean logic"],
		prompt: "Which expression always gives the same result as NOT (a AND b)?",
		verify: "manual",
		options: ["(NOT a) OR (NOT b)", "(NOT a) AND (NOT b)", "a OR b", "(NOT a) AND b"],
		answer: 0,
		explanation:
			"\"Not both\" means at least one of them is false. For example, with a true and b false, NOT (a AND b) is true, and so is (NOT a) OR (NOT b) — but (NOT a) AND (NOT b) is false.",
	},
	{
		id: "c-bool-2",
		level: "challenging",
		topics: ["Boolean logic"],
		prompt: "What is displayed?",
		code: `x ← 4
y ← 9
DISPLAY(((x > 5) OR (y > 5)) AND (NOT (x = y)))`,
		options: ["true", "false", "9", "An error"],
		answer: 0,
		explanation: "x > 5 is false but y > 5 is true, so the OR is true. x = y is false, so NOT (x = y) is true. true AND true is true.",
	},
	{
		id: "c-bool-3",
		level: "challenging",
		topics: ["Boolean logic"],
		prompt: "What is displayed?",
		code: `a ← true
b ← false
c ← true
DISPLAY(a AND (b OR (NOT c)))`,
		options: ["false", "true", "a", "c"],
		answer: 0,
		explanation: "NOT c is false, and b is false, so (b OR NOT c) is false. a AND false is false.",
	},
	{
		id: "c-bool-4",
		level: "challenging",
		topics: ["Boolean logic", "Arithmetic & MOD"],
		prompt: "What is displayed?",
		code: `n ← 12
DISPLAY((n MOD 4 = 0) AND (NOT (n MOD 3 = 0)))`,
		options: ["false", "true", "0", "12"],
		answer: 0,
		explanation: "12 is a multiple of 4 (true), but it's also a multiple of 3, so NOT (n MOD 3 = 0) is false. true AND false is false.",
	},
	{
		id: "c-bool-5",
		level: "challenging",
		topics: ["Boolean logic", "Arithmetic & MOD"],
		prompt: "For which value of x does this display true?",
		code: `DISPLAY((x > 3) AND (x MOD 2 = 0) AND (x < 10))`,
		verify: "manual",
		options: ["8", "2", "7", "12"],
		answer: 0,
		explanation: "x must be more than 3, even, and less than 10. 2 is too small, 7 is odd, 12 is too big. Only 8 passes all three.",
	},

	// ---------------------------------------------------------------- REPEAT UNTIL, carefully
	{
		id: "c-until-1",
		level: "challenging",
		topics: ["Iteration", "Boolean logic"],
		prompt: "What is displayed?",
		code: `x ← 1
y ← 10
REPEAT UNTIL (x ≥ y)
{
  x ← x * 2
  y ← y + 1
}
DISPLAY(x)
DISPLAY(y)`,
		options: ["16 14", "8 13", "16 13", "32 15"],
		answer: 0,
		explanation: "Both change each pass: (2, 11), (4, 12), (8, 13), (16, 14). Only then is x ≥ y.",
	},
	{
		id: "c-until-2",
		level: "challenging",
		topics: ["Iteration"],
		prompt: "What happens when this code runs?",
		code: `n ← 5
REPEAT UNTIL (n = 0)
{
  n ← n - 2
}
DISPLAY(n)`,
		options: ["The loop never stops", "It displays 0", "It displays 1", "It displays -1"],
		answer: 0,
		explanation: "n goes 5, 3, 1, -1, -3… It jumps over 0 and is never exactly 0. Using n ≤ 0 instead of n = 0 would fix it.",
	},
	{
		id: "c-until-3",
		level: "challenging",
		topics: ["Iteration", "Boolean logic"],
		prompt: "What is displayed?",
		code: `count ← 0
n ← 1
REPEAT UNTIL ((n > 50) OR (count = 4))
{
  n ← n * 3
  count ← count + 1
}
DISPLAY(n)`,
		options: ["81", "27", "243", "4"],
		answer: 0,
		explanation: "n goes 3, 9, 27, 81 while count goes 1 to 4. At that point both conditions are true, and the loop stops with n = 81.",
	},
	{
		id: "c-until-4",
		level: "challenging",
		topics: ["Iteration", "Lists", "Boolean logic"],
		prompt: "What is displayed?",
		code: `a ← [3, 7, 2, 9, 4]
i ← 1
REPEAT UNTIL ((i > LENGTH(a)) OR (a[i] > 8))
{
  i ← i + 1
}
DISPLAY(i)`,
		options: ["4", "9", "5", "6"],
		answer: 0,
		explanation: "The loop walks forward until it finds an item bigger than 8. That's 9, at index 4 — it displays the position, not the value.",
	},
	{
		id: "c-until-5",
		level: "challenging",
		topics: ["Iteration", "Variables & display"],
		prompt: "What is displayed?",
		code: `total ← 0
n ← 10
REPEAT UNTIL (total > 20)
{
  total ← total + n
  n ← n - 3
}
DISPLAY(total)
DISPLAY(n)`,
		options: ["21 1", "17 4", "21 4", "24 -2"],
		answer: 0,
		explanation: "total goes 10, 17, 21 while n goes 7, 4, 1. At 21 the condition is true. n was already reduced in that same pass, so it's 1.",
	},

	// ---------------------------------------------------------------- Robot, multi-step
	{
		id: "c-robot-1",
		level: "challenging",
		topics: ["Robot", "Iteration"],
		prompt: "The robot starts facing up. Black squares are blocked. Which square does it end on?",
		code: `REPEAT UNTIL (NOT CAN_MOVE("forward"))
{
  MOVE_FORWARD()
}
ROTATE_RIGHT()
REPEAT UNTIL (NOT CAN_MOVE("forward"))
{
  MOVE_FORWARD()
}`,
		grid: {
			rows: [".CA#B", ".....", "..D..", ".....", "....."],
			robot: { row: 4, col: 0, facing: "up" },
		},
		verify: "square",
		options: ["A", "B", "C", "D"],
		answer: 0,
		explanation:
			"The first loop drives up until the edge of the grid (top-left corner). After turning right, the second loop drives right until the blocked square — stopping on A. The edge of the grid counts as \"can't move\" too.",
	},
	{
		id: "c-robot-2",
		level: "challenging",
		topics: ["Robot", "Iteration", "Selection"],
		prompt: "The robot starts facing right. Black squares are blocked. Which square does it end on?",
		code: `REPEAT 4 TIMES
{
  IF (CAN_MOVE("forward"))
  {
    MOVE_FORWARD()
  }
  ELSE
  {
    ROTATE_LEFT()
  }
}`,
		grid: {
			rows: [".AD..", ".B...", "..#.C"],
			robot: { row: 2, col: 0, facing: "right" },
		},
		verify: "square",
		options: ["A", "B", "C", "D"],
		answer: 0,
		explanation:
			"Pass 1: move right. Pass 2: blocked, so turn left (now facing up) — a turn uses up a whole pass. Passes 3 and 4: move up twice, through B to A.",
	},
	{
		id: "c-robot-3",
		level: "challenging",
		topics: ["Robot"],
		prompt:
			"If the robot tries to move into a blocked square, it stays where it is and the program stops. The robot starts facing right. Where does it end?",
		code: `MOVE_FORWARD()
MOVE_FORWARD()
MOVE_FORWARD()`,
		grid: {
			rows: ["..C..", ".A#BD", "....."],
			robot: { row: 1, col: 0, facing: "right" },
		},
		verify: "square",
		options: ["A", "B", "C", "D"],
		answer: 0,
		explanation:
			"The first move reaches A. The second tries to enter the blocked square, so the robot stays on A and the program ends — the third line never runs.",
	},
	{
		id: "c-robot-4",
		level: "challenging",
		topics: ["Robot", "Iteration", "Variables & display"],
		prompt: "The robot starts facing up. Which square does it end on?",
		code: `n ← 3
REPEAT 2 TIMES
{
  REPEAT n TIMES
  {
    MOVE_FORWARD()
  }
  ROTATE_RIGHT()
  n ← n - 1
}`,
		grid: {
			rows: [".....", "D.AB.", "..C..", ".....", "....."],
			robot: { row: 4, col: 0, facing: "up" },
		},
		verify: "square",
		options: ["A", "B", "C", "D"],
		answer: 0,
		explanation: "First pass: 3 squares up (to D), turn right, n becomes 2. Second pass: 2 squares right, landing on A.",
	},
	{
		id: "c-robot-5",
		level: "challenging",
		topics: ["Robot", "Procedures"],
		prompt: "The robot starts facing up. Which square does it end on?",
		code: `PROCEDURE turnAround()
{
  ROTATE_LEFT()
  ROTATE_LEFT()
}
MOVE_FORWARD()
turnAround()
MOVE_FORWARD()
MOVE_FORWARD()`,
		grid: {
			rows: ["..B..", "..D..", ".....", "..A..", "..C.."],
			robot: { row: 2, col: 2, facing: "up" },
		},
		verify: "square",
		options: ["A", "B", "C", "D"],
		answer: 0,
		explanation: "Up one square (to D), turn around to face down, then two squares down — back past the start to A.",
	},
	{
		id: "c-robot-6",
		level: "challenging",
		topics: ["Robot", "Iteration", "Selection"],
		prompt: "The robot starts in the top-left corner, facing up. Which way is it facing at the end?",
		code: `REPEAT 4 TIMES
{
  IF (NOT CAN_MOVE("forward"))
  {
    ROTATE_RIGHT()
  }
}`,
		grid: {
			rows: ["...", "...", "..."],
			robot: { row: 0, col: 0, facing: "up" },
		},
		verify: "facing",
		options: ["Right", "Up", "Down", "Left"],
		answer: 0,
		explanation:
			"Facing up at the top edge, it can't move, so it turns right. Now the way ahead is open, so the IF is false for the other three passes. (The robot never actually moves.)",
	},
	{
		id: "c-robot-7",
		level: "challenging",
		topics: ["Robot", "Iteration", "Variables & display"],
		prompt: "The robot starts facing right. Black squares are blocked. What is displayed?",
		code: `steps ← 0
REPEAT UNTIL (NOT CAN_MOVE("forward"))
{
  MOVE_FORWARD()
  steps ← steps + 1
}
DISPLAY(steps)`,
		grid: {
			rows: ["......", "......", "....#."],
			robot: { row: 2, col: 0, facing: "right" },
		},
		options: ["3", "4", "5", "2"],
		answer: 0,
		explanation: "There are three open squares between the robot and the blocked square, so it moves (and counts) 3 times.",
	},
	{
		id: "c-robot-8",
		level: "challenging",
		topics: ["Robot", "Iteration", "Selection"],
		prompt: "The robot starts facing up. Black squares are blocked. Which square does it end on?",
		code: `REPEAT 6 TIMES
{
  IF (CAN_MOVE("right"))
  {
    ROTATE_RIGHT()
    MOVE_FORWARD()
  }
  ELSE
  {
    IF (CAN_MOVE("forward"))
    {
      MOVE_FORWARD()
    }
  }
}`,
		grid: {
			rows: [".....", ".....", ".C...", "..B.D", ".#A.."],
			robot: { row: 4, col: 0, facing: "up" },
		},
		verify: "square",
		options: ["A", "B", "C", "D"],
		answer: 0,
		explanation:
			"It prefers turning right when it can. 1: right is blocked, so forward (up one). 2: right is open — turn and move right. 3: right (down) is blocked, so forward to B. 4: right (down) is open — turn and move down to A. 5–6: stuck, nothing happens.",
	},

	// ---------------------------------------------------------------- Classic patterns
	{
		id: "c-acc-1",
		level: "challenging",
		topics: ["Variables & display"],
		prompt: "What is displayed?",
		code: `a ← 1
b ← 2
c ← 3
temp ← a
a ← c
c ← b
b ← temp
DISPLAY(a)
DISPLAY(b)
DISPLAY(c)`,
		options: ["3 1 2", "3 2 1", "2 3 1", "1 2 3"],
		answer: 0,
		explanation: "temp keeps 1. a gets c's 3, c gets b's 2, and b gets the saved 1. The three values have rotated.",
	},
	{
		id: "c-acc-2",
		level: "challenging",
		topics: ["Lists", "Iteration", "Selection"],
		prompt: "What is displayed?",
		code: `nums ← [6, 2, 9, 1]
hi ← nums[1]
lo ← nums[1]
FOR EACH n IN nums
{
  IF (n > hi)
  {
    hi ← n
  }
  IF (n < lo)
  {
    lo ← n
  }
}
DISPLAY(hi - lo)`,
		options: ["8", "5", "7", "3"],
		answer: 0,
		explanation: "One loop tracks both the largest (9) and the smallest (1). The difference — the range of the data — is 8.",
	},
	{
		id: "c-acc-3",
		level: "challenging",
		topics: ["Lists", "Iteration", "Selection"],
		prompt: "What is displayed?",
		code: `data ← [1, 1, 0, 1, 1, 1, 0]
run ← 0
best ← 0
FOR EACH d IN data
{
  IF (d = 1)
  {
    run ← run + 1
    IF (run > best)
    {
      best ← run
    }
  }
  ELSE
  {
    run ← 0
  }
}
DISPLAY(best)`,
		options: ["3", "5", "2", "7"],
		answer: 0,
		explanation: "run counts 1s in a row and resets to 0 at each 0. best remembers the longest run seen: 1 1 1 in the middle, so 3.",
	},
	{
		id: "c-acc-4",
		level: "challenging",
		topics: ["Variables & display", "Arithmetic & MOD"],
		prompt: "What is displayed?",
		code: `a ← 3
b ← 8
a ← a + b
b ← a - b
a ← a - b
DISPLAY(a)
DISPLAY(b)`,
		options: ["8 3", "3 8", "11 3", "8 8"],
		answer: 0,
		explanation: "a becomes 11. b = 11 − 8 = 3. a = 11 − 3 = 8. The values have been swapped without a temp variable.",
	},

	// ---------------------------------------------------------------- Searching
	{
		id: "c-search-1",
		level: "challenging",
		topics: ["Lists", "Iteration", "Selection"],
		prompt: "What is displayed?",
		code: `list ← [4, 8, 15, 16, 23, 42]
target ← 23
checks ← 0
FOR EACH x IN list
{
  checks ← checks + 1
  IF (x = target)
  {
    DISPLAY(checks)
  }
}`,
		options: ["5", "4", "6", "23"],
		answer: 0,
		explanation: "A linear search checks items one at a time from the start. 23 is the 5th item, so it has been checked on the 5th pass.",
	},
	{
		id: "c-search-2",
		level: "challenging",
		topics: ["Lists", "Iteration"],
		prompt:
			"A sorted list has 1,000 items. Using binary search (always check the middle, then throw away half), what is the most items it could need to check?",
		verify: "manual",
		options: ["10", "500", "1,000", "100"],
		answer: 0,
		explanation: "Each check halves what's left: 1,000 → 500 → 250 → … → 1 takes about 10 halvings, since 2¹⁰ = 1,024.",
	},
	{
		id: "c-search-3",
		level: "challenging",
		topics: ["Lists"],
		prompt: "Binary search can only be used on one of these lists. Which one?",
		verify: "manual",
		options: ["[2, 5, 9, 14, 20]", "[9, 2, 14, 5, 20]", "[20, 5, 14, 2, 9]", "[5, 2, 9, 20, 14]"],
		answer: 0,
		explanation: "Binary search needs the list to be sorted — otherwise \"higher\" or \"lower\" tells you nothing about which half to keep.",
	},
	{
		id: "c-search-4",
		level: "challenging",
		topics: ["Lists", "Iteration"],
		prompt:
			"A procedure checks each item of a list one at a time until it finds a match. The list grows from 500 items to 1,000. In the worst case, how many checks does it need now?",
		verify: "manual",
		options: ["1,000", "501", "250", "1,000,000"],
		answer: 0,
		explanation: "A linear search may have to look at every item, so doubling the list doubles the worst case.",
	},

	// ---------------------------------------------------------------- Mixed
	{
		id: "c-mix-1",
		level: "challenging",
		topics: ["Procedures", "Lists", "Arithmetic & MOD"],
		prompt: "What is displayed?",
		code: `PROCEDURE evensOnly(list)
{
  r ← []
  FOR EACH x IN list
  {
    IF (x MOD 2 = 0)
    {
      APPEND(r, x)
    }
  }
  RETURN(r)
}
DISPLAY(LENGTH(evensOnly([1, 2, 3, 4, 6])))`,
		options: ["3", "5", "2", "12"],
		answer: 0,
		explanation: "evensOnly builds a new list [2, 4, 6]. LENGTH of that list is 3.",
	},
	{
		id: "c-mix-2",
		level: "challenging",
		topics: ["Lists", "Iteration", "Selection"],
		prompt: "What is displayed?",
		code: `scores ← [55, 82, 91, 67]
adjusted ← []
FOR EACH s IN scores
{
  IF (s < 70)
  {
    APPEND(adjusted, s + 10)
  }
  ELSE
  {
    APPEND(adjusted, s)
  }
}
DISPLAY(adjusted)`,
		options: ["[65, 82, 91, 77]", "[65, 92, 101, 77]", "[55, 82, 91, 67]", "[65, 77]"],
		answer: 0,
		explanation: "Only scores under 70 get 10 added. Every score is still appended once, so the new list is the same length.",
	},
	{
		id: "c-mix-3",
		level: "challenging",
		topics: ["Lists", "Iteration", "Arithmetic & MOD"],
		prompt: "What is displayed?",
		code: `n ← 37
bits ← []
REPEAT UNTIL (n = 0)
{
  INSERT(bits, 1, n MOD 2)
  n ← (n - n MOD 2) / 2
}
DISPLAY(bits)`,
		options: ["[1, 0, 0, 1, 0, 1]", "[1, 0, 1, 0, 0, 1]", "[1, 1, 0, 0, 1, 0]", "[3, 7]"],
		answer: 0,
		explanation:
			"This is the divide-by-2 method for writing a number in binary. Each remainder is added to the front: 37 → 18 → 9 → 4 → 2 → 1 → 0 gives remainders 1, 0, 1, 0, 0, 1, read back as 100101.",
	},
	{
		id: "c-mix-4",
		level: "challenging",
		topics: ["Lists", "Iteration", "Boolean logic"],
		prompt: "What is displayed?",
		code: `temps ← [18, 21, 25, 19, 26]
warmDays ← 0
FOR EACH t IN temps
{
  IF ((t ≥ 20) AND (t ≤ 25))
  {
    warmDays ← warmDays + 1
  }
}
DISPLAY(warmDays)`,
		options: ["2", "3", "4", "1"],
		answer: 0,
		explanation: "Only 21 and 25 are between 20 and 25 inclusive. 26 is too warm and 18, 19 too cool.",
	},
];
