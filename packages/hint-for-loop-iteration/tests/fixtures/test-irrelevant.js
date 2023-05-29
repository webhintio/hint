class Test {
    constructor(list = []) {
        this.list = list;
    }

    add(string) {
        this.list.push(string);
    }

    remove(string) {
        this.list = this.list.filter((entry) => entry !== string);
    }
};

const test = new Test();
test.add(".foo");
test.remove(".foo");

const set = new Set();
set.add('.foo');
