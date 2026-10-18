// Medium questions: two ideas combined (a loop with MOD, a list inside a
// loop, a procedure that makes a decision, a robot that repeats moves…).
import type { PseudoQuestion } from "./pseudocodeQuestions";

export const MEDIUM_QUESTIONS: PseudoQuestion[] = [
	// ---------------------------------------------------------------- Loops + arithmetic
	{
		id: "m-la-1",
		level: "medium",
		topics: ["Iteration", "Variables & display"],
		prompt: "What is displayed?",
		code: `total ← 0
n ← 1
REPEAT 4 TIMES
{
  total ← total + n
  n ← n + 1
}
DISPLAY(total)`,
		options: ["10", "4", "15", "6"],
		answer: 0,
		explanation: "n takes the values 1, 2, 3, 4, and each one is added to total: 1 + 2 + 3 + 4 = 10.",
	},
	{
		id: "m-la-2",
		level: "medium",
		topics: ["Iteration", "Arithmetic & MOD"],
		prompt: "What is displayed?",
		code: `x ← 1
REPEAT 5 TIMES
{
  x ← x * 2
}
DISPLAY(x)`,
		options: ["32", "10", "16", "64"],
		answer: 0,
		explanation: "Doubling five times: 1 → 2 → 4 → 8 → 16 → 32. That's 2⁵ — five bits give 32 possible patterns for the same reason.",
	},
	{
		id: "m-la-3",
		level: "medium",
		topics: ["Iteration", "Arithmetic & MOD"],
		prompt: "What is displayed?",
		code: `n ← 100
count ← 0
REPEAT UNTIL (n < 10)
{
  n ← n / 2
  count ← count + 1
}
DISPLAY(count)`,
		options: ["4", "3", "5", "10"],
		answer: 0,
		explanation: "Halving: 100 → 50 → 25 → 12.5 → 6.25. That's 4 halvings; at 6.25, n < 10 is true and the loop stops.",
	},
	{
		id: "m-la-4",
		level: "medium",
		topics: ["Iteration", "Variables & display"],
		prompt: "What is displayed?",
		code: `a ← 0
b ← 1
REPEAT 5 TIMES
{
  temp ← a + b
  a ← b
  b ← temp
}
DISPLAY(b)`,
		options: ["8", "5", "13", "6"],
		answer: 0,
		explanation:
			"Each pass, b becomes the sum of the previous two values: b goes 1, 2, 3, 5, 8. (This is the start of the Fibonacci sequence.) temp stops the old value of b being lost.",
	},
	{
		id: "m-la-5",
		level: "medium",
		topics: ["Iteration", "Boolean logic"],
		prompt: "What is displayed?",
		code: `count ← 0
n ← 0
REPEAT UNTIL (n ≥ 20)
{
  n ← n + 3
  count ← count + 1
}
DISPLAY(count)`,
		options: ["7", "6", "20", "8"],
		answer: 0,
		explanation: "n goes 3, 6, 9, 12, 15, 18, 21 — seven steps. 18 isn't ≥ 20 yet, so it takes one more step to reach 21.",
	},
	{
		id: "m-la-6",
		level: "medium",
		topics: ["Iteration", "Lists"],
		prompt: "What is displayed?",
		code: `product ← 1
FOR EACH k IN [1, 2, 3, 4]
{
  product ← product * k
}
DISPLAY(product)`,
		options: ["24", "10", "4", "1"],
		answer: 0,
		explanation: "1 × 1 = 1, × 2 = 2, × 3 = 6, × 4 = 24. Starting product at 1 (not 0) matters — anything times 0 is 0.",
	},

	// ---------------------------------------------------------------- Loops + selection
	{
		id: "m-ls-1",
		level: "medium",
		topics: ["Iteration", "Selection", "Arithmetic & MOD"],
		prompt: "What is displayed?",
		code: `n ← 1
REPEAT 6 TIMES
{
  IF (n MOD 3 = 0)
  {
    DISPLAY(n)
  }
  n ← n + 1
}`,
		options: ["3 6", "3", "1 2 3 4 5 6", "6"],
		answer: 0,
		explanation: "n runs from 1 to 6, but only multiples of 3 (where n MOD 3 is 0) are displayed: 3 and 6.",
	},
	{
		id: "m-ls-2",
		level: "medium",
		topics: ["Iteration", "Selection", "Lists"],
		prompt: "What is displayed?",
		code: `count ← 0
FOR EACH t IN [72, 85, 90, 64, 99]
{
  IF (t ≥ 85)
  {
    count ← count + 1
  }
}
DISPLAY(count)`,
		options: ["3", "2", "4", "5"],
		answer: 0,
		explanation: "85, 90 and 99 are all at least 85 (85 counts because of ≥). 72 and 64 aren't. That's 3.",
	},
	{
		id: "m-ls-3",
		level: "medium",
		topics: ["Iteration", "Selection"],
		prompt: "What is displayed?",
		code: `x ← 10
REPEAT 3 TIMES
{
  IF (x > 5)
  {
    x ← x - 4
  }
  ELSE
  {
    x ← x + 1
  }
}
DISPLAY(x)`,
		options: ["3", "2", "6", "-2"],
		answer: 0,
		explanation: "Pass 1: 10 > 5, so x = 6. Pass 2: 6 > 5, so x = 2. Pass 3: 2 is not > 5, so x = 3.",
	},
	{
		id: "m-ls-4",
		level: "medium",
		topics: ["Iteration", "Selection"],
		prompt: "What is displayed?",
		code: `i ← 1
REPEAT UNTIL (i > 4)
{
  IF (i = 3)
  {
    DISPLAY("three")
  }
  ELSE
  {
    DISPLAY(i)
  }
  i ← i + 1
}`,
		options: ["1 2 three 4", "1 2 3 4", "three", "1 2 three"],
		answer: 0,
		explanation: "Every value from 1 to 4 is displayed, except that when i is 3 the word three is shown instead.",
	},
	{
		id: "m-ls-5",
		level: "medium",
		topics: ["Iteration", "Selection", "Arithmetic & MOD"],
		prompt: "What is displayed?",
		code: `evens ← 0
odds ← 0
FOR EACH n IN [2, 7, 4, 9, 6]
{
  IF (n MOD 2 = 0)
  {
    evens ← evens + 1
  }
  ELSE
  {
    odds ← odds + 1
  }
}
DISPLAY(evens)
DISPLAY(odds)`,
		options: ["3 2", "2 3", "5 0", "3 3"],
		answer: 0,
		explanation: "2, 4 and 6 are even (3 of them); 7 and 9 are odd (2 of them). Every number lands in exactly one count.",
	},
	{
		id: "m-ls-6",
		level: "medium",
		topics: ["Iteration", "Selection", "Lists"],
		prompt: "What is displayed?",
		code: `best ← 0
FOR EACH s IN [4, 11, 7]
{
  IF (s > best)
  {
    best ← s
    DISPLAY(best)
  }
}`,
		options: ["4 11", "11", "4 11 7", "4 7 11"],
		answer: 0,
		explanation: "It only displays when it finds a new best. 4 beats 0, 11 beats 4, but 7 doesn't beat 11 — so nothing is shown for 7.",
	},

	// ---------------------------------------------------------------- Lists + loops
	{
		id: "m-ll-1",
		level: "medium",
		topics: ["Lists", "Iteration"],
		prompt: "What is displayed?",
		code: `nums ← [5, 3, 8]
FOR EACH n IN nums
{
  DISPLAY(n * 2)
}`,
		options: ["10 6 16", "5 3 8", "16 6 10", "32"],
		answer: 0,
		explanation: "FOR EACH visits the items in order and displays each one doubled.",
	},
	{
		id: "m-ll-2",
		level: "medium",
		topics: ["Lists", "Iteration"],
		prompt: "What is displayed?",
		code: `words ← ["a", "b", "c"]
i ← LENGTH(words)
REPEAT UNTIL (i < 1)
{
  DISPLAY(words[i])
  i ← i - 1
}`,
		options: ["c b a", "a b c", "c b", "b a"],
		answer: 0,
		explanation: "i starts at the last index (3) and counts down to 1, so the list is shown backwards. The loop stops once i reaches 0.",
	},
	{
		id: "m-ll-3",
		level: "medium",
		topics: ["Lists", "Iteration"],
		prompt: "What is displayed?",
		code: `result ← []
FOR EACH x IN [1, 2, 3]
{
  APPEND(result, x * x)
}
DISPLAY(result)`,
		options: ["[1, 4, 9]", "[1, 2, 3]", "[2, 4, 6]", "[9, 4, 1]"],
		answer: 0,
		explanation: "Starting from an empty list, each square (1, 4, 9) is added to the end in turn.",
	},
	{
		id: "m-ll-4",
		level: "medium",
		topics: ["Lists", "Iteration"],
		prompt: "What is displayed?",
		code: `data ← [3, 8, 2, 6]
total ← 0
i ← 1
REPEAT 2 TIMES
{
  total ← total + data[i]
  i ← i + 2
}
DISPLAY(total)`,
		options: ["5", "11", "14", "19"],
		answer: 0,
		explanation: "i jumps by 2, so it visits index 1 and index 3 only: data[1] + data[3] = 3 + 2 = 5.",
	},
	{
		id: "m-ll-5",
		level: "medium",
		topics: ["Lists", "Iteration"],
		prompt: "What is displayed?",
		code: `list ← [10, 20, 30]
REPEAT 2 TIMES
{
  APPEND(list, list[1])
}
DISPLAY(list)`,
		options: ["[10, 20, 30, 10, 10]", "[10, 20, 30, 10, 20]", "[10, 20, 30]", "[10, 10, 20, 30]"],
		answer: 0,
		explanation: "list[1] is always the first item, 10 — appending doesn't change what's at the front. So 10 is added to the end twice.",
	},
	{
		id: "m-ll-6",
		level: "medium",
		topics: ["Lists", "Iteration", "Selection"],
		prompt: "What is displayed?",
		code: `names ← ["Ana", "Ben", "Ana", "Cy"]
c ← 0
FOR EACH n IN names
{
  IF (n = "Ana")
  {
    c ← c + 1
  }
}
DISPLAY(c)`,
		options: ["2", "1", "4", "3"],
		answer: 0,
		explanation: "This counts how many times \"Ana\" appears in the list. It appears twice.",
	},
	{
		id: "m-ll-7",
		level: "medium",
		topics: ["Lists", "Iteration", "Arithmetic & MOD"],
		prompt: "What is displayed?",
		code: `scores ← [80, 90, 70]
sum ← 0
FOR EACH s IN scores
{
  sum ← sum + s
}
DISPLAY(sum / LENGTH(scores))`,
		options: ["80", "240", "3", "90"],
		answer: 0,
		explanation: "The loop adds up all the scores (240). Dividing by how many there are (3) gives the average: 80.",
	},
	{
		id: "m-ll-8",
		level: "medium",
		topics: ["Lists", "Iteration"],
		prompt: "What is displayed?",
		code: `nums ← [4, 1, 6]
i ← 1
REPEAT LENGTH(nums) TIMES
{
  nums[i] ← nums[i] + i
  i ← i + 1
}
DISPLAY(nums)`,
		options: ["[5, 3, 9]", "[5, 2, 7]", "[4, 1, 6]", "[5, 1, 6]"],
		answer: 0,
		explanation: "Each item has its own index added to it: 4 + 1 = 5, 1 + 2 = 3, 6 + 3 = 9.",
	},

	// ---------------------------------------------------------------- Lists + selection
	{
		id: "m-lsel-1",
		level: "medium",
		topics: ["Lists", "Selection"],
		prompt: "What is displayed?",
		code: `items ← [2, 4, 6]
IF (LENGTH(items) > 2)
{
  DISPLAY(items[LENGTH(items)])
}
ELSE
{
  DISPLAY(items[1])
}`,
		options: ["6", "2", "3", "An error"],
		answer: 0,
		explanation: "The list has 3 items, so the first branch runs. items[LENGTH(items)] is items[3] — always the last item — which is 6.",
	},
	{
		id: "m-lsel-2",
		level: "medium",
		topics: ["Lists", "Selection"],
		prompt: "What is displayed?",
		code: `q ← ["x", "y"]
IF (q[1] = "y")
{
  APPEND(q, "z")
}
ELSE
{
  INSERT(q, 1, "z")
}
DISPLAY(q)`,
		options: ["[z, x, y]", "[x, y, z]", "[x, z, y]", "[x, y]"],
		answer: 0,
		explanation: "q[1] is \"x\", not \"y\", so the ELSE runs: \"z\" is inserted at index 1, pushing the others along.",
	},
	{
		id: "m-lsel-3",
		level: "medium",
		topics: ["Lists", "Selection"],
		prompt: "What is displayed?",
		code: `n ← [7]
REMOVE(n, 1)
IF (LENGTH(n) = 0)
{
  DISPLAY("empty")
}
ELSE
{
  DISPLAY(n)
}`,
		options: ["empty", "[7]", "[]", "An error"],
		answer: 0,
		explanation: "Removing the only item leaves an empty list, whose length is 0.",
	},
	{
		id: "m-lsel-4",
		level: "medium",
		topics: ["Lists", "Selection", "Boolean logic"],
		prompt: "What is displayed?",
		code: `nums ← [3, 9, 4]
IF ((nums[2] > nums[1]) AND (nums[2] > nums[3]))
{
  DISPLAY("peak")
}
ELSE
{
  DISPLAY("no peak")
}`,
		options: ["peak", "no peak", "9", "peak no peak"],
		answer: 0,
		explanation: "9 > 3 is true and 9 > 4 is true, so the middle item is bigger than both neighbors.",
	},

	// ---------------------------------------------------------------- Procedures + selection
	{
		id: "m-ps-1",
		level: "medium",
		topics: ["Procedures", "Selection"],
		prompt: "What is displayed?",
		code: `PROCEDURE grade(s)
{
  IF (s ≥ 50)
  {
    RETURN("pass")
  }
  RETURN("retry")
}
DISPLAY(grade(50))
DISPLAY(grade(49))`,
		options: ["pass retry", "retry pass", "pass pass", "retry retry"],
		answer: 0,
		explanation: "50 ≥ 50 is true, so the first call returns pass. 49 ≥ 50 is false, so the second call skips to RETURN(\"retry\").",
	},
	{
		id: "m-ps-2",
		level: "medium",
		topics: ["Procedures", "Selection", "Arithmetic & MOD"],
		prompt: "What is displayed?",
		code: `PROCEDURE absVal(n)
{
  IF (n < 0)
  {
    RETURN(0 - n)
  }
  RETURN(n)
}
DISPLAY(absVal(-6) + absVal(2))`,
		options: ["8", "-4", "4", "-8"],
		answer: 0,
		explanation: "absVal turns a negative number positive: absVal(-6) is 6 and absVal(2) is 2. 6 + 2 = 8.",
	},
	{
		id: "m-ps-3",
		level: "medium",
		topics: ["Procedures", "Boolean logic", "Arithmetic & MOD"],
		prompt: "What is displayed?",
		code: `PROCEDURE isEven(n)
{
  RETURN(n MOD 2 = 0)
}
DISPLAY(isEven(7))
DISPLAY(isEven(10))`,
		options: ["false true", "true false", "1 0", "7 10"],
		answer: 0,
		explanation: "A procedure can return true or false. 7 MOD 2 is 1 (not 0) → false. 10 MOD 2 is 0 → true.",
	},
	{
		id: "m-ps-4",
		level: "medium",
		topics: ["Procedures", "Selection"],
		prompt: "What is displayed?",
		code: `PROCEDURE max3(a, b, c)
{
  m ← a
  IF (b > m)
  {
    m ← b
  }
  IF (c > m)
  {
    m ← c
  }
  RETURN(m)
}
DISPLAY(max3(4, 9, 2))`,
		options: ["9", "4", "2", "15"],
		answer: 0,
		explanation: "m starts at 4, is replaced by 9 (9 > 4), and stays 9 because 2 isn't bigger. The procedure returns the largest of the three.",
	},
	{
		id: "m-ps-5",
		level: "medium",
		topics: ["Procedures", "Selection"],
		prompt: "What is displayed?",
		code: `PROCEDURE sign(n)
{
  IF (n > 0)
  {
    RETURN("positive")
  }
  ELSE
  {
    IF (n < 0)
    {
      RETURN("negative")
    }
  }
  RETURN("zero")
}
DISPLAY(sign(0))`,
		options: ["zero", "positive", "negative", "Nothing is displayed"],
		answer: 0,
		explanation: "0 > 0 is false and 0 < 0 is false, so neither RETURN inside the IFs runs. The procedure reaches RETURN(\"zero\").",
	},

	// ---------------------------------------------------------------- Procedures + loops
	{
		id: "m-pl-1",
		level: "medium",
		topics: ["Procedures", "Iteration"],
		prompt: "What is displayed?",
		code: `PROCEDURE countdown(n)
{
  REPEAT UNTIL (n = 0)
  {
    DISPLAY(n)
    n ← n - 1
  }
  DISPLAY("go")
}
countdown(3)`,
		options: ["3 2 1 go", "3 2 1 0 go", "go", "2 1 0 go"],
		answer: 0,
		explanation: "n is 3, 2, 1 while it's displayed. When n reaches 0 the loop stops (0 is never shown), then go is displayed.",
	},
	{
		id: "m-pl-2",
		level: "medium",
		topics: ["Procedures", "Iteration"],
		prompt: "What is displayed?",
		code: `PROCEDURE power(b, e)
{
  r ← 1
  REPEAT e TIMES
  {
    r ← r * b
  }
  RETURN(r)
}
DISPLAY(power(3, 3))`,
		options: ["27", "9", "6", "81"],
		answer: 0,
		explanation: "r is multiplied by 3 three times: 1 → 3 → 9 → 27. That's 3³.",
	},
	{
		id: "m-pl-3",
		level: "medium",
		topics: ["Procedures", "Iteration"],
		prompt: "What is displayed?",
		code: `PROCEDURE sumTo(n)
{
  s ← 0
  i ← 1
  REPEAT n TIMES
  {
    s ← s + i
    i ← i + 1
  }
  RETURN(s)
}
DISPLAY(sumTo(5))`,
		options: ["15", "5", "10", "25"],
		answer: 0,
		explanation: "It adds 1 + 2 + 3 + 4 + 5 = 15.",
	},
	{
		id: "m-pl-4",
		level: "medium",
		topics: ["Procedures", "Iteration"],
		prompt: "What is displayed?",
		code: `PROCEDURE stars(n)
{
  REPEAT n TIMES
  {
    DISPLAY("*")
  }
}
stars(2)
stars(1)`,
		options: ["* * *", "* *", "*", "* * * *"],
		answer: 0,
		explanation: "The first call shows 2 stars and the second shows 1 — three in total.",
	},
	{
		id: "m-pl-5",
		level: "medium",
		topics: ["Procedures", "Iteration"],
		prompt: "What is displayed?",
		code: `PROCEDURE double(x)
{
  RETURN(x * 2)
}
n ← 1
REPEAT 3 TIMES
{
  n ← double(n)
}
DISPLAY(n)`,
		options: ["8", "6", "2", "4"],
		answer: 0,
		explanation: "Each pass replaces n with double its value: 1 → 2 → 4 → 8.",
	},

	// ---------------------------------------------------------------- Procedures + lists
	{
		id: "m-plist-1",
		level: "medium",
		topics: ["Procedures", "Lists"],
		prompt: "What is displayed?",
		code: `PROCEDURE first(list)
{
  RETURN(list[1])
}
DISPLAY(first([9, 8, 7]))`,
		options: ["9", "7", "8", "[9, 8, 7]"],
		answer: 0,
		explanation: "The whole list is passed in as the parameter, and the procedure returns its first item.",
	},
	{
		id: "m-plist-2",
		level: "medium",
		topics: ["Procedures", "Lists"],
		prompt: "What is displayed?",
		code: `PROCEDURE last(list)
{
  RETURN(list[LENGTH(list)])
}
DISPLAY(last(["a", "b", "c", "d"]))`,
		options: ["d", "a", "4", "An error"],
		answer: 0,
		explanation: "LENGTH is 4, and index 4 is the last item, d. This works for a list of any length.",
	},
	{
		id: "m-plist-3",
		level: "medium",
		topics: ["Procedures", "Lists", "Selection"],
		prompt: "What is displayed?",
		code: `PROCEDURE countOver(list, limit)
{
  c ← 0
  FOR EACH x IN list
  {
    IF (x > limit)
    {
      c ← c + 1
    }
  }
  RETURN(c)
}
DISPLAY(countOver([5, 12, 8, 20], 8))`,
		options: ["2", "3", "1", "4"],
		answer: 0,
		explanation: "Only 12 and 20 are greater than 8. 8 itself doesn't count — > means strictly greater.",
	},
	{
		id: "m-plist-4",
		level: "medium",
		topics: ["Procedures", "Lists", "Iteration"],
		prompt: "What is displayed?",
		code: `PROCEDURE addToAll(list, n)
{
  result ← []
  FOR EACH x IN list
  {
    APPEND(result, x + n)
  }
  RETURN(result)
}
DISPLAY(addToAll([1, 2, 3], 10))`,
		options: ["[11, 12, 13]", "[1, 2, 3, 10]", "[11, 2, 3]", "36"],
		answer: 0,
		explanation: "The procedure builds a new list with 10 added to every item.",
	},
	{
		id: "m-plist-5",
		level: "medium",
		topics: ["Procedures", "Lists", "Boolean logic"],
		prompt: "What is displayed?",
		code: `PROCEDURE contains(list, target)
{
  FOR EACH x IN list
  {
    IF (x = target)
    {
      RETURN(true)
    }
  }
  RETURN(false)
}
DISPLAY(contains([4, 6, 8], 6))
DISPLAY(contains([4, 6, 8], 5))`,
		options: ["true false", "false true", "true true", "6 false"],
		answer: 0,
		explanation: "RETURN(true) ends the procedure as soon as a match is found. If the loop finishes with no match, it returns false. This is a linear search.",
	},

	// ---------------------------------------------------------------- Boolean + selection
	{
		id: "m-bs-1",
		level: "medium",
		topics: ["Boolean logic", "Selection"],
		prompt: "What is displayed?",
		code: `age ← 16
hasTicket ← true
IF ((age ≥ 18) OR hasTicket)
{
  DISPLAY("enter")
}
ELSE
{
  DISPLAY("no entry")
}`,
		options: ["enter", "no entry", "enter no entry", "16"],
		answer: 0,
		explanation: "age ≥ 18 is false, but hasTicket is true — and OR only needs one of them.",
	},
	{
		id: "m-bs-2",
		level: "medium",
		topics: ["Boolean logic", "Selection"],
		prompt: "What is displayed?",
		code: `raining ← true
hasUmbrella ← false
IF (raining AND (NOT hasUmbrella))
{
  DISPLAY("get wet")
}
ELSE
{
  DISPLAY("stay dry")
}`,
		options: ["get wet", "stay dry", "true", "Nothing is displayed"],
		answer: 0,
		explanation: "NOT hasUmbrella is true, and raining is true, so the AND is true.",
	},
	{
		id: "m-bs-3",
		level: "medium",
		topics: ["Boolean logic", "Selection"],
		prompt: "What is displayed?",
		code: `x ← 5
IF (NOT ((x > 3) AND (x < 10)))
{
  DISPLAY("outside")
}
ELSE
{
  DISPLAY("inside")
}`,
		options: ["inside", "outside", "5", "true"],
		answer: 0,
		explanation: "Inside the brackets, 5 > 3 and 5 < 10 are both true, so the AND is true. NOT flips it to false, so the ELSE runs.",
	},
	{
		id: "m-bs-4",
		level: "medium",
		topics: ["Boolean logic"],
		prompt: "Which condition is true exactly when x is NOT between 1 and 10 (including 1 and 10)?",
		verify: "manual",
		options: ["(x < 1) OR (x > 10)", "(x < 1) AND (x > 10)", "(x ≥ 1) AND (x ≤ 10)", "(x > 1) OR (x < 10)"],
		answer: 0,
		explanation:
			"Outside the range means too small OR too big. AND can never be true (no number is both below 1 and above 10), and the third option is the in-range test.",
	},
	{
		id: "m-bs-5",
		level: "medium",
		topics: ["Boolean logic"],
		prompt: "What is displayed?",
		code: `a ← true
b ← false
DISPLAY((a OR b) AND (NOT b))`,
		options: ["true", "false", "a", "An error"],
		answer: 0,
		explanation: "a OR b is true. NOT b is true. true AND true is true.",
	},

	// ---------------------------------------------------------------- Tracing order of statements
	{
		id: "m-disp-1",
		level: "medium",
		topics: ["Variables & display"],
		prompt: "What is displayed?",
		code: `x ← 1
DISPLAY(x)
x ← x + 1
DISPLAY(x)
DISPLAY(x + 1)
DISPLAY(x)`,
		options: ["1 2 3 2", "1 2 3 3", "1 2 3 4", "1 2 2 3"],
		answer: 0,
		explanation: "DISPLAY(x + 1) shows 3 but doesn't change x — only ← changes a variable. So the last line still shows 2.",
	},
	{
		id: "m-disp-2",
		level: "medium",
		topics: ["Variables & display"],
		prompt: "What is displayed?",
		code: `a ← "up"
b ← "down"
temp ← a
a ← b
DISPLAY(a)
DISPLAY(temp)`,
		options: ["down up", "up down", "down down", "up up"],
		answer: 0,
		explanation: "temp saved \"up\" before a was overwritten with \"down\".",
	},
	{
		id: "m-disp-3",
		level: "medium",
		topics: ["Variables & display"],
		prompt: "What is displayed?",
		code: `x ← 3
y ← x
x ← x * 2
y ← y + x
DISPLAY(y)`,
		options: ["9", "6", "12", "3"],
		answer: 0,
		explanation: "y copies 3. x then becomes 6 (y is unaffected). Finally y = 3 + 6 = 9.",
	},

	// ---------------------------------------------------------------- Robot + loops
	{
		id: "m-rl-1",
		level: "medium",
		topics: ["Robot", "Iteration"],
		prompt: "The robot starts facing up. Which square does it end on?",
		code: `REPEAT 3 TIMES
{
  MOVE_FORWARD()
}
ROTATE_RIGHT()
REPEAT 2 TIMES
{
  MOVE_FORWARD()
}`,
		grid: {
			rows: ["..C..", "..AB.", "..D..", ".....", "....."],
			robot: { row: 4, col: 0, facing: "up" },
		},
		verify: "square",
		options: ["A", "B", "C", "D"],
		answer: 0,
		explanation: "Three squares up, turn to face right, then two squares right — landing on A.",
	},
	{
		id: "m-rl-2",
		level: "medium",
		topics: ["Robot", "Iteration"],
		prompt: "The robot starts facing up. Which square does it end on?",
		code: `REPEAT 2 TIMES
{
  MOVE_FORWARD()
  ROTATE_LEFT()
}`,
		grid: {
			rows: ["..B..", ".AC..", ".D...", ".....", "....."],
			robot: { row: 2, col: 2, facing: "up" },
		},
		verify: "square",
		options: ["A", "B", "C", "D"],
		answer: 0,
		explanation: "Pass 1: up one square (to C), turn left. Pass 2: left one square (to A), turn left again. Turning doesn't move it.",
	},
	{
		id: "m-rl-3",
		level: "medium",
		topics: ["Robot", "Iteration"],
		prompt: "The robot starts facing left. Which square does it end on?",
		code: `REPEAT 4 TIMES
{
  MOVE_FORWARD()
}`,
		grid: {
			rows: ["....D", ".....", ".....", "C....", "AB..."],
			robot: { row: 4, col: 4, facing: "left" },
		},
		verify: "square",
		options: ["A", "B", "C", "D"],
		answer: 0,
		explanation: "Four squares to the left takes the robot from the right-hand edge to the left-hand edge of its row: A.",
	},
	{
		id: "m-rl-4",
		level: "medium",
		topics: ["Robot", "Iteration"],
		prompt: "The robot starts facing up. Which way is it facing after this code?",
		code: `REPEAT 3 TIMES
{
  ROTATE_RIGHT()
}`,
		grid: {
			rows: ["...", "...", "..."],
			robot: { row: 1, col: 1, facing: "up" },
		},
		verify: "facing",
		options: ["Left", "Right", "Down", "Up"],
		answer: 0,
		explanation: "Up → right → down → left. Three right turns end up the same as one left turn.",
	},
	{
		id: "m-rl-5",
		level: "medium",
		topics: ["Robot", "Iteration"],
		prompt: "The robot starts facing right. Which square does it end on?",
		code: `REPEAT 2 TIMES
{
  MOVE_FORWARD()
  MOVE_FORWARD()
  ROTATE_LEFT()
}`,
		grid: {
			rows: ["..D..", ".....", "B.A..", ".....", "..C.."],
			robot: { row: 4, col: 0, facing: "right" },
		},
		verify: "square",
		options: ["A", "B", "C", "D"],
		answer: 0,
		explanation: "Pass 1: two squares right (to C), turn to face up. Pass 2: two squares up (to A), turn to face left.",
	},

	// ---------------------------------------------------------------- Robot + CAN_MOVE / IF
	{
		id: "m-rc-1",
		level: "medium",
		topics: ["Robot", "Selection"],
		prompt: "The robot starts facing right. Black squares are blocked. Which square does it end on?",
		code: `IF (CAN_MOVE("forward"))
{
  MOVE_FORWARD()
}
IF (CAN_MOVE("forward"))
{
  MOVE_FORWARD()
}
ELSE
{
  ROTATE_LEFT()
  MOVE_FORWARD()
}`,
		grid: {
			rows: [".....", ".A...", ".D#B.", ".C...", "....."],
			robot: { row: 2, col: 0, facing: "right" },
		},
		verify: "square",
		options: ["A", "B", "C", "D"],
		answer: 0,
		explanation:
			"The first IF moves the robot to D. Now the square ahead is blocked, so the second IF's ELSE runs: turn left (now facing up) and move up to A.",
	},
	{
		id: "m-rc-2",
		level: "medium",
		topics: ["Robot", "Selection"],
		prompt: "The robot starts facing up. Black squares are blocked. Which square does it end on?",
		code: `IF (CAN_MOVE("left"))
{
  ROTATE_LEFT()
  MOVE_FORWARD()
}
ELSE
{
  ROTATE_RIGHT()
  MOVE_FORWARD()
}`,
		grid: {
			rows: [".....", ".....", "..D..", ".C#..", ".A.B."],
			robot: { row: 4, col: 2, facing: "up" },
		},
		verify: "square",
		options: ["A", "B", "C", "D"],
		answer: 0,
		explanation:
			"CAN_MOVE(\"left\") checks the square to the robot's own left. Facing up, that's the square to the west — open. So it turns left and moves onto A.",
	},
	{
		id: "m-rc-3",
		level: "medium",
		topics: ["Robot", "Selection"],
		prompt: "The robot starts facing up. Black squares are blocked. Which square does it end on?",
		code: `IF (CAN_MOVE("forward"))
{
  MOVE_FORWARD()
}
ELSE
{
  IF (CAN_MOVE("left"))
  {
    ROTATE_LEFT()
    MOVE_FORWARD()
  }
  ELSE
  {
    ROTATE_RIGHT()
    MOVE_FORWARD()
  }
}`,
		grid: {
			rows: [".....", ".....", "..B..", ".C#..", ".#.AD"],
			robot: { row: 4, col: 2, facing: "up" },
		},
		verify: "square",
		options: ["A", "B", "C", "D"],
		answer: 0,
		explanation: "Forward is blocked, and so is the robot's left. That leaves the last ELSE: turn right (now facing right) and move onto A.",
	},
	{
		id: "m-rc-4",
		level: "medium",
		topics: ["Robot", "Iteration", "Selection"],
		prompt: "The robot starts facing right. Black squares are blocked. Which square does it end on?",
		code: `REPEAT 3 TIMES
{
  IF (CAN_MOVE("forward"))
  {
    MOVE_FORWARD()
  }
}`,
		grid: {
			rows: ["..C..", ".DA#B", "....."],
			robot: { row: 1, col: 0, facing: "right" },
		},
		verify: "square",
		options: ["A", "B", "C", "D"],
		answer: 0,
		explanation: "Two moves take it to A. On the third pass the square ahead is blocked, so the IF is skipped and it stays on A.",
	},

	// ---------------------------------------------------------------- MOD + selection
	{
		id: "m-ms-1",
		level: "medium",
		topics: ["Arithmetic & MOD", "Selection"],
		prompt: "What is displayed?",
		code: `n ← 27
IF (n MOD 9 = 0)
{
  DISPLAY("multiple of 9")
}
ELSE
{
  DISPLAY("not a multiple")
}`,
		options: ["multiple of 9", "not a multiple", "3", "0"],
		answer: 0,
		explanation: "27 = 9 × 3 exactly, so 27 MOD 9 is 0. \"MOD something = 0\" is the standard test for \"divides evenly.\"",
	},
	{
		id: "m-ms-2",
		level: "medium",
		topics: ["Arithmetic & MOD", "Selection", "Iteration"],
		prompt: "What is displayed?",
		code: `FOR EACH n IN [3, 5, 15]
{
  IF (n MOD 15 = 0)
  {
    DISPLAY("FizzBuzz")
  }
  ELSE
  {
    IF (n MOD 3 = 0)
    {
      DISPLAY("Fizz")
    }
    ELSE
    {
      IF (n MOD 5 = 0)
      {
        DISPLAY("Buzz")
      }
    }
  }
}`,
		options: ["Fizz Buzz FizzBuzz", "Fizz Buzz Fizz", "FizzBuzz FizzBuzz FizzBuzz", "3 5 15"],
		answer: 0,
		explanation:
			"3 is a multiple of 3 → Fizz. 5 is a multiple of 5 → Buzz. 15 is checked for 15 first → FizzBuzz. Checking 15 first matters: otherwise 15 would stop at Fizz.",
	},
	{
		id: "m-ms-3",
		level: "medium",
		topics: ["Arithmetic & MOD"],
		prompt: "A movie is 135 minutes long. What does this display?",
		code: `DISPLAY(135 MOD 60)`,
		options: ["15", "2", "75", "2.25"],
		answer: 0,
		explanation: "60 goes into 135 twice (120), leaving 15. So the movie is 2 hours and 15 minutes — MOD gives the leftover minutes.",
	},
	{
		id: "m-ms-4",
		level: "medium",
		topics: ["Arithmetic & MOD", "Iteration"],
		prompt: "Days of the week are numbered 0 to 6. What is displayed?",
		code: `day ← 5
REPEAT 4 TIMES
{
  day ← (day + 1) MOD 7
}
DISPLAY(day)`,
		options: ["2", "9", "0", "5"],
		answer: 0,
		explanation: "day goes 6, then (7 MOD 7) = 0, then 1, then 2. MOD 7 makes the count wrap back around to 0, like a week does.",
	},
];
