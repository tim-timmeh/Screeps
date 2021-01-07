let fname = { firstName : 'Black' };
let lname = { lastName : 'Panther'}
How would you merge them into one object? One way is to write a function that copies data from the second object onto the first one. Unfortunately, this might not be what you want — you may need to create an entirely new object without mutating any of the existing objects. The easiest way is to use the Object.assign function introduced in ES6:

let full_names = Object.assign(fname, lname);
You can also use the object destruction notation introduced in ES8:

let full_names = {...fname, ...lname};

// joining arrays
const odd = [1, 3, 5 ];
const nums = [2 ,4 , 6, ...odd];
console.log(nums); // [ 2, 4, 6, 1, 3, 5 ]

// cloning arrays
const arr = [1, 2, 3, 4];
const arr2 = [...arr];

// Destructure OBJ to Key/Value pair Array
const credits = { producer: 'John', director: 'Jane', assistant: 'Peter' };
const arr = Object.entries(credits);
console.log(arr);
/** Output:
[ [ 'producer', 'John' ],
  [ 'director', 'Jane' ],
  [ 'assistant', 'Peter' ]
]
**/
const credits = { producer: 'John', director: 'Jane', assistant: 'Peter' };
const arr = Object.values(credits);
console.log(arr);

/** Output:
[ 'John', 'Jane', 'Peter' ]
**/
