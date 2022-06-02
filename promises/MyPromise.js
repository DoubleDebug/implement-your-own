const MyPromiseState = {
    resolved: 'fulfilled',
    rejected: 'rejected',
    pending: 'pending'
}

class MyPromise {
    #state = MyPromiseState.pending;
    #thenCbs = [];
    #catchCbs = [];
    #value;
    #onSuccessBinded = this.#onSuccess.bind(this);
    #onFailureBinded = this.#onFailure.bind(this);

    constructor(cb) {
        try {
            cb(this.#onSuccessBinded, this.#onFailureBinded);
        } catch (e) {
            this.#onFailure(e);
        }
    }

    #runCallbacks() {
        if (this.#state === MyPromiseState.pending) return;
        if (this.#state === MyPromiseState.resolved) {
            this.#thenCbs.forEach(cb => cb(this.#value));
            this.#thenCbs = [];
        }
        if (this.#state === MyPromiseState.rejected) {
            this.#catchCbs.forEach(cb => cb(this.#value));
            this.#catchCbs = [];
        }
    }

    #onSuccess(value) {
        queueMicrotask(() => {
            if (this.#state !== MyPromiseState.pending) return;
    
            if (value instanceof MyPromise) {
                value.then(this.#onSuccessBinded, this.#onFailureBinded);
                return;
            }
    
            this.#state = MyPromiseState.resolved;
            this.#value = value;
            this.#runCallbacks();
        });
    }

    #onFailure(value) {
        queueMicrotask(() => {
            if (this.#state !== MyPromiseState.pending) return;
    
            if (value instanceof MyPromise) {
                value.then(this.#onSuccessBinded, this.#onFailureBinded);
                return;
            }

            if (this.#catchCbs.length === 0) {
                throw new UncaughtPromiseError(value);
            }
    
            this.#state = MyPromiseState.rejected;
            this.#value = value;
            this.#runCallbacks();
        });
    }

    then(thenCb, catchCb) {
        return new MyPromise((resolve, reject) => {
            this.#thenCbs.push(result => {
                if (thenCb == null) {
                    resolve(result);
                    return;
                }

                try {
                    resolve(thenCb(result));
                }
                catch (err) {
                    reject(err);
                }

            });

            this.#catchCbs.push(result => {
                if (catchCb == null) {
                    reject(result);
                    return;
                }

                try {
                    resolve(catchCb(result));
                }
                catch (err) {
                    reject(err);
                }

            });

            this.#runCallbacks();
        })
    }

    catch(cb) {
        return this.then(undefined, cb);
    }

    finally(cb) {
        return this.then(result => {
            cb()
            return result;
        }, result => {
            cb()
            throw result;
        })
    }

    static resolve(value) {
        return new MyPromise(resolve => resolve(value));
    }

    static reject(value) {
        return new MyPromise((resolve, reject) => reject(value));
    }

    static all(promises) {
        const results = [];
        let numOfResolved = 0;

        return new MyPromise((resolve, reject) => {
            for (let i=0; i<promises.length; i++) {
                promises[i].then(value => {
                    numOfResolved++;
                    results[i] = value;
                    if (numOfResolved === promises.length) {
                        resolve(results);
                    }
                }).catch(reject);
            }
        })
    }

    static allSettled(promises) {
        const results = [];
        let numOfResolved = 0;

        return new MyPromise((resolve) => {
            for (let i=0; i<promises.length; i++) {
                promises[i]
                .then(value => {
                    results[i] = {
                        state: MyPromiseState.resolved,
                        value
                    }
                })
                .catch(error => {
                    results[i] = {
                        state: MyPromiseState.rejected,
                        error
                    }
                })
                .finally(() => {
                    numOfResolved++;
                    if (numOfResolved === promises.length) {
                        resolve(results);
                    }

                });
            }
        })
    }
    
    static race(promises) {
        return new MyPromise((resolve, reject) => {
            promises.forEach(p => {
                p.then(resolve).catch(reject);
            })
        });
    }

    static any(promises) {
        const errors = [];
        let numOfRejected = 0;

        return new MyPromise((resolve, reject) => {
            for (let i=0; i<promises.length; i++) {
                promises[i]
                .then(resolve)
                .catch(value => {
                    errors[i] = value;
                    numOfRejected++;
                    if (numOfRejected === promises.length) {
                        reject(new AggregateError(errors, "All promises were rejected."));
                    }
                });
            }
        })
    }
}

class UncaughtPromiseError extends Error {
    constructor(err) {
        super(err);
        this.stack = `(in promise) ${error.stack}`;
    }
}

module.exports = MyPromise;
