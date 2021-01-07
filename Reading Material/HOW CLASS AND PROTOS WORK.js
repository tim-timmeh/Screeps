// ES6 class javascript
class Animal {
    constructor(name, weight) {
        this.name = name;
        this.weight = weight;
    }

    eat() {
        return `${this.name} is eating!`;
    }

    sleep() {
        return `${this.name} is going to sleep!`;
    }

    wakeUp() {
        return `${this.name} is waking up!`;
    }

}

class Gorilla extends Animal {
    constructor(name, weight) {
        super(name, weight);
    }

    climbTrees() {
        return `${this.name} is climbing trees!`;
    }

    poundChest() {
        return `${this.name} is pounding its chest!`;
    }

    showVigour() {
        return `${super.eat()} ${this.poundChest()}`;
    }

    dailyRoutine() {
        return `${super.wakeUp()} ${this.poundChest()} ${super.eat()} ${super.sleep()}`;
    }

}

function display(content) {
    console.log(content);
}

const gorilla = new Gorilla('George', '160Kg');
display(gorilla.poundChest());
display(gorilla.sleep());
display(gorilla.showVigour());
display(gorilla.dailyRoutine());

// OUTPUT:
// George is pounding its chest!
// George is going to sleep!
// George is eating! George is pounding its chest!
// George is waking up! George is pounding its chest! George is eating! George is going to sleep!

---------------------------------------------------------------------------------------------------------
//Pure Javascript

function Animal(name, weight) {
    this.name = name;
    this.weight = weight;
}

Animal.prototype.eat = function() {
    return `${this.name} is eating!`;
}

Animal.prototype.sleep = function() {
    return `${this.name} is going to sleep!`;
}

Animal.prototype.wakeUp = function() {
    return `${this.name} is waking up!`;
}


function Gorilla(name, weight) {
    Animal.call(this, name, weight); // uses params to pass object through animal constructor first
}

Gorilla.prototype = Object.create(Animal.prototype); // makes gorilla protos animals protos
Gorilla.prototype.constructor = Gorilla; // reset constructor to gorilla, or else constructor is animal

Gorilla.prototype.climbTrees = function () { // add gorilla protos, which already have animal protos now
    return `${this.name} is climbing trees!`;
}

Gorilla.prototype.poundChest = function() {
    return `${this.name} is pounding its chest!`;
}

Gorilla.prototype.showVigour = function () {
    return `${Animal.prototype.eat.call(this)} ${this.poundChest()}`;
}

Gorilla.prototype.dailyRoutine = function() {
    return `${Animal.prototype.wakeUp.call(this)} ${this.poundChest()} ${Animal.prototype.eat.call(this)} ${Animal.prototype.sleep.call(this)}`;
}

function display(content) {
    console.log(content);
}

var gorilla = new Gorilla('George', '160Kg');
display(gorilla.poundChest());
display(gorilla.sleep());
display(gorilla.showVigour());
display(gorilla.dailyRoutine());

// OUTPUT:
// George is pounding its chest!
// George is going to sleep!
// George is eating! George is pounding its chest!
// George is waking up! George is pounding its chest! George is eating! George is going to sleep!
