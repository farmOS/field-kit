# Code Standards
These are code standards for farmOS Field Kit and its Field Modules and do not pertain to the farmOS (ie, the server) codebase or its modules.

This cannot be an exhaustive set of instructions, but only a rough guide, which we can point to and build upon in code reviews. Pull requests will still be reviewed on a case-by-case basis, and may be subject to criteria not covered in this document. Our main hope with this document is that it will help avoid the most common pitfalls and steer the overall codebase towards a more consistent style and structure.

## Functional Over Object-Oriented
In general, and wherever possible, contributors should favor a functional programming (FP) style over imperative or object-oriented styles. Much of what this means in practice is covered in the [Functions](#functions) section, but the resources below can help programmers get up to speed who do not have extensive experience with FP. I recommend Anjana Vakil's talk for absolute beginners, as it will start with explaining what FP is, and moves quickly through the basic concepts and terminology. I also recommend all contributors have basic familiarity with higher order functions, such as the basic array methods map, filter and reduce. (Also note that `map` should be preferred over `forEach`, because the latter does not return a new array and should only be used for explicitly committing side effects.) For programmers already with a basic grasp of pure functions and higher order functions, I highly recommend Rafal Dittwald's talk. It provides an excellent example for how to "minimize, concentrate and defer" state and other side effects by refactoring a JavaScript program from an imperative to a functional style. Finally, for more advanced topics in FP, I recommend the free e-book, _Professor Frisby's Mostly Adequate Guide to Functional Programming_, particularly chapters 1 - 5, which culminate with an in-depth discussion of function composition. Along with eliminating unnecessary state and side effects, I believe that function composition is among the core value propositions of functional programming, as it provides the main organizing structure for large applications, when used properly.

### Functional Programming Resources
- Anjana Vakil - [Learning Functional Programming with JavaScript (video)](https://www.youtube.com/watch?v=e-5obm1G_FY)
- Mozilla Developer Network - Array methods: [map](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/map), [filter](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/filter) and [reduce](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/Reduce)
- Rafal Dittwald - [Solving Problems the Clojure Way (video)](https://www.youtube.com/watch?v=vK1DazRK_a0)
- Brian Lonsdorf - [Professor Frisby's Mostly Adequate Guide to Functional Programming](https://mostly-adequate.gitbooks.io/mostly-adequate-guide/)

## Linting & Cleanliness
We use the [AirBnB Style Guide](https://github.com/airbnb/javascript), and expect that all code be linted before each commit. In addition, any extraneous comments, dead code and console statements should be removed before each commit.

## Comments, Naming & Readability
Good naming and function composition can go a long ways toward improving the readability of a program, as opposed to excessive comments, which carry the additional burden of needing to be maintained along with the code. [provide an example]

Name a function or method according to what it does, not for how it's used. For instance, a method like this,

```js
updateLogFromServer(state, params) {
  state.logs.splice(params.index, 1, params.log);
},
```

should simply be named `updateLogByIndex`.

## Functions
First and foremost, keep functions small, and whenever possible keep them pure.

Avoid functions with no parameters. Also avoid functions with no return value. These are sometimes necessary, but can also indicate the use of unnecessary side effects.

Avoid using variables and pieces of state from the function's outer scope; instead, pass variables in as function parameters. However, if your function has so many parameters they're hard to keep track of and cause the linter to yell "max-len!" that's probably a sign you could stand to break it down into multiple smaller functions.

Don't load too many functions into the scope of a parent function. You should be able to extract most functions like these from their enclosing scope and they should work fine as standalone utilities. If you can't, you probably have some side effects you need to eliminate. Some exceptions to this rule might include error handlers and other context-specific callback functions, as well as curried functions and special cases where the function closure is being used for encapsulation.

When your function must perform side effects, try to isolate the logic of that function, and compose it up from smaller, pure functions.
