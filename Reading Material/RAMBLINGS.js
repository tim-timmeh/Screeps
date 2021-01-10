'use strict'

//Function factorys dont use new/this, use object.create to link prototype.
//Constructor Functions use new, .call(this), .prototype = object.create(.prototype), prototype.constructer.
//Classes use new, class, constructor, extend.

----

function king() { // factory, how to build the object

}
king.prototype.build = function () { // Initialize / build objects required

};
king.prototype.rolecall = function () { // perform rolecall on required creeps spawn if needed

};
king.prototype.action = function () { // perform actions / missions

};
//king.prototype.finalize = function () { // finalize?
//
//};
//
// Additional methods/functions below

----

function OperationBase(flag, flagName, flagType, king) {
  let opBase = Object.create(Operation(this, flag, flagName, flagType, king)); // uses params to pass object through operation factory first
  opBase.priority = PRIORITY.CORE;
  opBase.memory.bootstrapTimer = opBase.memory.bootstrapTimer || 280
  return opBase;
};

-----

//https://medium.com/javascript-in-plain-english/class-factory-and-object-prototypes-b4a7fff7dba8
//Example of factory function. Inheritance is from Object.create (Object.create() method creates a new object, using an existing object as the prototype of the newly created object.)

const RegularEmployee = {
  wagePerHour: 15,
  getWageReport: function () {
    const totalWage = calculateWage(this.wagePerHour, this.hours);
    return `${this.name} total wages: ${totalWage}`;
  }
};
const Employee = (name, hoursWorked, model) => {
   let newEmployee = Object.create(model);
   newEmployee.name = name;
   newEmployee.hours = hoursWorked;
   newEmployee.totalWage = newEmployee.getWageReport();
   return Object.freeze(newEmployee);
}
const employeeThree = Employee("Amy", 20, RegularEmployeeModel);
employeeThree.totalWage; // output: "Amy total wages: 300"

-----

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
