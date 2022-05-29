function forEach(arr, cb) {
    for (let i = 0; i < arr.length; i++) {
        cb(arr[i], i, arr);
    }
}

function map(arr, cb) {
    const modifiedArray = [];
    for (let i = 0; i < arr.length; i++) {
        modifiedArray.push(cb(arr[i], i, arr));
    }
    return modifiedArray;
}

function filter(arr, cb) {
    const filtered = [];
    for (let i = 0; i < arr.length; i++) {
        const condition = cb(arr[i], i, arr);
        if (condition) filtered.push(arr[i]);
    }
    return filtered;
}

function reduce(arr, cb, initialValue) {
    let result, i;
    if (initialValue === undefined) {
        result = arr[0];
        i = 1;
    } else {
        result = initialValue;
        i = 0;
    }
    for (i; i < arr.length; i++) {
        result = cb(result, arr[i], i, arr);
    }
    return result;
}

function some(arr, cb) {
    let result = false;
    let i = 0;
    while (!result && i < arr.length) {
        result = cb(arr[i], i, arr);
        i++;
    }
    return result;
}

function every(arr, cb) {
    let result = false;
    let i = 0;
    while (i < arr.length) {
        result = cb(arr[i], i, arr);
        if (!result) return false;
        i++;
    }
    return result;
}

function flat(arr, depth = 1) {
    const newArr = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] instanceof Array && depth !== 0) {
            flat(arr[i], depth - 1).forEach((e) => newArr.push(e));
        } else {
            newArr.push(arr[i]);
        }
    }
    return newArr;
}

function find(arr, cb) {
    let result;
    let i = 0;
    while (!result && i < arr.length) {
        result = cb(arr[i], i, arr);
        if (result) return arr[i];
        i++;
    }
    return undefined;
}

module.exports = {
    forEach,
    map,
    filter,
    reduce,
    some,
    every,
    flat,
    find,
};
