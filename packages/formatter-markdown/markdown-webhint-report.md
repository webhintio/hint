# Webhint Report - 2020-10-02T20:19:10.489Z

hints:

## pwa

✔ No issues

## pitfalls

✔ No issues

## compatibility

### Use charset 'utf-8': hints 1

[Why is this important](https://webhint.io/docs/user-guide/hints/hint-meta-charset-utf-8/#why-is-this-important)

[How to fix it](https://webhint.io/docs/user-guide/hints/hint-meta-charset-utf-8/#examples-that-pass-the-hint)

#### **💡Hint** 'charset' meta element should be the first thing in'<head>'

https://www.example.com/:4:4

``` html
<meta charset="utf-8" />
```

## security

### No Vulnerable Libraries: hints 1

#### ⛔ **Error** 'Lo-Dash@4.17.15' has 2 known vulnerabilities (1 high, 1 medium)

https://www.example.com/

## performance

### Http Cache: hints 1

#### **⚠Warning** A 'cache-control' header contains directives that are not recommended: 'must revalidate'

``` http
Cache-Control: private, max-age=31557600, must-revalidate
```

https://webhint.io/:-1:-1

---

Powered by [Webhint - 6.1.0](https://webhint.io/)
