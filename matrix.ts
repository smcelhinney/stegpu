function isValidMatrix(matrix: number[][]): boolean {
  const rowLength = matrix[0].length;
  if (!matrix.every((row) => row.length === rowLength)) {
    return false;
  }

  const identityColumn = matrix[0].sort((a, b) => a - b);
  const sortedMatrixRows = matrix.map((row) => row.sort((a, b) => a - b));
  return sortedMatrixRows.every(
    (row, i) => JSON.stringify(row) === JSON.stringify(identityColumn)
  );
}

function canSwap(str1: string, str2: string) {
  // Check if strings are the same length
  if (str1.length !== str2.length) {
    return false;
  }

  // Check if every character in string 1 exists in string 2
  for (let i = 0; i < str1.length; i++) {
    if (!str2.includes(str1[i])) {
      return false;
    }
  }

  // Create a variable to store the number of characters that are in different locations in each string
  let diff = 0;
  for (let i = 0; i < str1.length; i++) {
    if (str1[i] !== str2[i]) {
      diff++;
    }
  }

  // If the number of different characters is greater than 2, return false
  if (diff > 2) {
    return false;
  }

  return true;
}

function numRectanglesFormingLargestSquare(input: number[][]) {
  const squares = [];
  for (const rectangle of input) {
    rectangle.sort((a, b) => a - b);
    squares.push(rectangle[0]);
  }
  console.log({ squares });

  // Find the count of the highest recurring number in the squares array
  const counts = squares.reduce((acc, curr) => {
    acc[curr] = (acc[curr] || 0) + 1;
    return acc;
  }, {});

  const squareSides = Object.keys(counts);

  return squareSides.reduce((a, b) => {
    if (counts[a] > counts[b]) {
      return a;
    }
    return b;
  }, squareSides[0]);
}

console.log(
  numRectanglesFormingLargestSquare([
    [1, 2],
    [2, 1],
    [1, 2],
    [3, 5],
    [3, 3],
    [1, 3],
    [5, 3],
  ])
); // 2

console.log(
  numRectanglesFormingLargestSquare([
    [5, 8],
    [3, 9],
    [5, 12],
    [16, 5],
  ])
); // 2

// console.log(canSwap("abc", "bca")); // false
// console.log(canSwap("abc", "cba")); // true
// console.log(canSwap("bank", "kanb")); // true
// console.log(canSwap("fiver", "firev")); // true
// console.log(canSwap("test", "no")); // false

// console.log(
//   isValidMatrix([
//     [1, 2, 3],
//     [6, 5, 4],
//     [7, 8, 9, 10],
//   ])
// ); // false

// console.log(
//     isValidMatrix([
//       [5, 4, 6],
//       [6, 5, 4],
//       [4, 6, 5],
//       [5, 6, 4],
//     ])
//   ); // true

//   console.log(
//   isValidMatrix([
//     [1, 2, 3],
//     [3, 2, 1],
//     [2, 1, 3],
//   ])
// ); // true
