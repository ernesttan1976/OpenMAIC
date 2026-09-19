Below is a **100-topic TypeScript curriculum** designed to become a content-generation backbone rather than merely a checklist. It progresses from writing basic TypeScript to understanding how the compiler reasons about types, then into production architecture and type-level programming.

The official TypeScript Handbook itself recommends starting with the Basics and moving through Everyday Types, Narrowing, Functions, Object Types, Classes, Modules, and then the deeper type-manipulation references. ([TypeScript][1])

I would organize your learning material into **10 levels × 10 topics**.

# TypeScript Curriculum — Beginner to Advanced

## Level 1 — TypeScript Foundations

| #  | Topic                  | What the learner should understand                                                  | TypeScript Docs                                                                                                                   |
| -- | ---------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------- |
| 1  | What is TypeScript?    | Relationship between JavaScript and TypeScript; static type checking; transpilation | [TS for JavaScript Programmers](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html?utm_source=chatgpt.com) |
| 2  | Installing TypeScript  | `npm install typescript`, `tsc`, project vs global installations                    | [TypeScript Tooling](https://www.typescriptlang.org/docs/handbook/typescript-tooling-in-5-minutes.html?utm_source=chatgpt.com)    |
| 3  | Compiling TypeScript   | `.ts → .js`, compile-time checking vs runtime execution                             | [The Basics](https://www.typescriptlang.org/docs/handbook/2/basic-types.html?utm_source=chatgpt.com)                              |
| 4  | Type Annotations       | Explicitly declaring variable, parameter and return types                           | [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html?utm_source=chatgpt.com)                       |
| 5  | Type Inference         | How TypeScript determines a type without annotations                                | [Type Inference](https://www.typescriptlang.org/docs/handbook/type-inference.html?utm_source=chatgpt.com)                         |
| 6  | Primitive Types        | `string`, `number`, `boolean`, `bigint`, `symbol`                                   | [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html?utm_source=chatgpt.com)                       |
| 7  | Arrays                 | `string[]`, `Array<T>`, element typing                                              | [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html?utm_source=chatgpt.com)                       |
| 8  | Object Types           | Typing object properties and object parameters                                      | [Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html?utm_source=chatgpt.com)                                |
| 9  | `null` and `undefined` | Nullability and `strictNullChecks`                                                  | [Everyday Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html?utm_source=chatgpt.com)                       |
| 10 | Basic Functions        | Parameter types, return types and inference                                         | [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html?utm_source=chatgpt.com)                         |

### Milestone

The learner should now be able to convert a small JavaScript program into TypeScript.

---

# Level 2 — Everyday TypeScript

| #  | Topic                   | What the learner should understand                 | Docs                                                                                                                                                                                         |
| -- | ----------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 11 | Type Aliases            | Creating reusable names for types                  | [Everyday Types — Type Aliases](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html?utm_source=chatgpt.com#type-aliases)                                                      |
| 12 | Interfaces              | Defining reusable object contracts                 | [Everyday Types — Interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html?utm_source=chatgpt.com#interfaces)                                                          |
| 13 | Interface vs Type Alias | Similarities and important differences             | [Differences Between Type Aliases and Interfaces](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html?utm_source=chatgpt.com#differences-between-type-aliases-and-interfaces) |
| 14 | Optional Properties     | `name?: string` and missing values                 | [Object Types — Optional Properties](https://www.typescriptlang.org/docs/handbook/2/objects.html?utm_source=chatgpt.com#optional-properties)                                                 |
| 15 | Readonly Properties     | Preventing mutation through a particular type      | [Object Types — readonly Properties](https://www.typescriptlang.org/docs/handbook/2/objects.html?utm_source=chatgpt.com#readonly-properties)                                                 |
| 16 | Union Types             | `string \| number`; representing alternatives      | [Everyday Types — Union Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html?utm_source=chatgpt.com#union-types)                                                        |
| 17 | Literal Types           | `"open" \| "closed"` and exact value types         | [Everyday Types — Literal Types](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html?utm_source=chatgpt.com#literal-types)                                                    |
| 18 | Tuples                  | Fixed-position heterogeneous arrays                | [Object Types — Tuple Types](https://www.typescriptlang.org/docs/handbook/2/objects.html?utm_source=chatgpt.com#tuple-types)                                                                 |
| 19 | Enums                   | Numeric/string enums and when they appear          | [Enums](https://www.typescriptlang.org/docs/handbook/enums.html?utm_source=chatgpt.com)                                                                                                      |
| 20 | Type Assertions         | `as Type`, what assertions do and do not guarantee | [Everyday Types — Type Assertions](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html?utm_source=chatgpt.com#type-assertions)                                                |

### Milestone

Build a typed model for something real:

```ts
type UserRole = "admin" | "operator" | "viewer";

interface User {
  id: number;
  name: string;
  role: UserRole;
  email?: string;
}
```

---

# Level 3 — Understanding the Type System

This level is particularly important. It moves the learner from **"adding types"** to understanding **how TypeScript reasons**.

| #  | Topic                          | Learning objective                                           | Docs                                                                                                                                                       |
| -- | ------------------------------ | ------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 21 | `any`                          | How `any` effectively opts out of checking                   | [Everyday Types — any](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html?utm_source=chatgpt.com#any)                                      |
| 22 | `unknown`                      | Representing an unknown value safely                         | [More on Functions — unknown](https://www.typescriptlang.org/docs/handbook/2/functions.html?utm_source=chatgpt.com#unknown)                                |
| 23 | `never`                        | Understanding the empty set of possible values               | [More on Functions — never](https://www.typescriptlang.org/docs/handbook/2/functions.html?utm_source=chatgpt.com#never)                                    |
| 24 | `void`                         | Functions whose return value isn't used                      | [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html?utm_source=chatgpt.com)                                                  |
| 25 | Structural Typing              | Compatibility depends on shape rather than declared identity | [Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html?utm_source=chatgpt.com)                                          |
| 26 | Assignability                  | Why one type can or cannot be assigned to another            | [Type Compatibility](https://www.typescriptlang.org/docs/handbook/type-compatibility.html?utm_source=chatgpt.com)                                          |
| 27 | Excess Property Checking       | Why fresh object literals receive additional checks          | [Object Types — Excess Property Checks](https://www.typescriptlang.org/docs/handbook/2/objects.html?utm_source=chatgpt.com#excess-property-checks)         |
| 28 | Widening and Literal Inference | Why `"hello"` can become `string`                            | [Everyday Types — Literal Inference](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html?utm_source=chatgpt.com#literal-inference)          |
| 29 | `as const`                     | Preserving literal information and readonly structures       | [Everyday Types — Literal Inference](https://www.typescriptlang.org/docs/handbook/2/everyday-types.html?utm_source=chatgpt.com#literal-inference)          |
| 30 | `satisfies`                    | Validating a value without replacing its inferred type       | [TypeScript 4.9 — satisfies](https://www.typescriptlang.org/docs/handbook/release-notes/typescript-4-9.html?utm_source=chatgpt.com#the-satisfies-operator) |

### Critical conceptual milestone

At this point, teach types as **sets of possible values**.

For example:

```text
unknown = all possible values

string
 ├─ "hello"
 ├─ "world"
 └─ ...

never = no possible values
```

This mental model makes later topics like unions, intersections, narrowing and conditional types much easier.

---

# Level 4 — Narrowing and Control Flow

Narrowing is one of the most important TypeScript concepts because TypeScript uses runtime checks to refine static types. ([TypeScript][2])

| #  | Topic                   | Learning objective                             | Docs                                                                                                                                    |
| -- | ----------------------- | ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| 31 | Control-Flow Analysis   | How execution paths affect inferred types      | [Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html?utm_source=chatgpt.com)                                       |
| 32 | `typeof` Guards         | Narrowing primitives using runtime checks      | [typeof Type Guards](https://www.typescriptlang.org/docs/handbook/2/narrowing.html?utm_source=chatgpt.com#typeof-type-guards)           |
| 33 | Truthiness Narrowing    | `if (value)` and its consequences              | [Truthiness Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html?utm_source=chatgpt.com#truthiness-narrowing)       |
| 34 | Equality Narrowing      | Using `===` and `!==` to refine types          | [Equality Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html?utm_source=chatgpt.com#equality-narrowing)           |
| 35 | `in` Operator Narrowing | Testing whether a property exists              | [in Operator Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html?utm_source=chatgpt.com#the-in-operator-narrowing) |
| 36 | `instanceof` Narrowing  | Narrowing class instances                      | [instanceof Narrowing](https://www.typescriptlang.org/docs/handbook/2/narrowing.html?utm_source=chatgpt.com#instanceof-narrowing)       |
| 37 | Assignment Narrowing    | How assignment changes inferred possibilities  | [Assignments](https://www.typescriptlang.org/docs/handbook/2/narrowing.html?utm_source=chatgpt.com#assignments)                         |
| 38 | Type Predicates         | Writing `value is SomeType`                    | [Using Type Predicates](https://www.typescriptlang.org/docs/handbook/2/narrowing.html?utm_source=chatgpt.com#using-type-predicates)     |
| 39 | Discriminated Unions    | Modeling states using a shared literal field   | [Discriminated Unions](https://www.typescriptlang.org/docs/handbook/2/narrowing.html?utm_source=chatgpt.com#discriminated-unions)       |
| 40 | Exhaustiveness Checking | Using `never` to ensure every state is handled | [Exhaustiveness Checking](https://www.typescriptlang.org/docs/handbook/2/narrowing.html?utm_source=chatgpt.com#exhaustiveness-checking) |

Example worth turning into an entire lesson:

```ts
type RequestState =
  | { status: "loading" }
  | { status: "success"; data: User[] }
  | { status: "error"; error: Error };
```

This pattern is fundamental for React, APIs and state machines.

---

# Level 5 — Functions

TypeScript's function system includes generic relationships, overloads, callbacks, call signatures, construct signatures and explicit `this` handling. ([TypeScript][3])

| #  | Topic                     | Learning objective                                       | Docs                                                                                                                                                                            |
| -- | ------------------------- | -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 41 | Function Type Expressions | `(value: string) => number`                              | [Function Type Expressions](https://www.typescriptlang.org/docs/handbook/2/functions.html?utm_source=chatgpt.com#function-type-expressions)                                     |
| 42 | Call Signatures           | Callable objects with additional properties              | [Call Signatures](https://www.typescriptlang.org/docs/handbook/2/functions.html?utm_source=chatgpt.com#call-signatures)                                                         |
| 43 | Construct Signatures      | Describing functions/classes invoked with `new`          | [Construct Signatures](https://www.typescriptlang.org/docs/handbook/2/functions.html?utm_source=chatgpt.com#construct-signatures)                                               |
| 44 | Optional Parameters       | `value?: number`                                         | [Optional Parameters](https://www.typescriptlang.org/docs/handbook/2/functions.html?utm_source=chatgpt.com#optional-parameters)                                                 |
| 45 | Default Parameters        | Defaults and inferred parameter types                    | [More on Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html?utm_source=chatgpt.com)                                                                       |
| 46 | Rest Parameters           | `...values: number[]`                                    | [Rest Parameters and Arguments](https://www.typescriptlang.org/docs/handbook/2/functions.html?utm_source=chatgpt.com#rest-parameters-and-arguments)                             |
| 47 | Function Overloads        | Providing multiple public call signatures                | [Function Overloads](https://www.typescriptlang.org/docs/handbook/2/functions.html?utm_source=chatgpt.com#function-overloads)                                                   |
| 48 | Callback Types            | Correctly describing callback arguments                  | [Optional Parameters in Callbacks](https://www.typescriptlang.org/docs/handbook/2/functions.html?utm_source=chatgpt.com#optional-parameters-in-callbacks)                       |
| 49 | Typing `this`             | Explicit `this` parameters and callback context          | [Declaring this in a Function](https://www.typescriptlang.org/docs/handbook/2/functions.html?utm_source=chatgpt.com#declaring-this-in-a-function)                               |
| 50 | Function Variance         | Why callback parameter compatibility behaves differently | [Type Compatibility — Function Parameter Bivariance](https://www.typescriptlang.org/docs/handbook/type-compatibility.html?utm_source=chatgpt.com#function-parameter-bivariance) |

---

# Level 6 — Objects, Interfaces and Classes

| #  | Topic                            | Learning objective                            | Docs                                                                                                                                            |
| -- | -------------------------------- | --------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| 51 | Index Signatures                 | Modeling dictionary-style objects             | [Index Signatures](https://www.typescriptlang.org/docs/handbook/2/objects.html?utm_source=chatgpt.com#index-signatures)                         |
| 52 | Extending Interfaces             | Building interfaces from existing interfaces  | [Extending Types](https://www.typescriptlang.org/docs/handbook/2/objects.html?utm_source=chatgpt.com#extending-types)                           |
| 53 | Intersection Types               | Combining types with `&`                      | [Intersection Types](https://www.typescriptlang.org/docs/handbook/2/objects.html?utm_source=chatgpt.com#intersection-types)                     |
| 54 | Generic Object Types             | `Box<T>`, `ApiResponse<T>`                    | [Generic Object Types](https://www.typescriptlang.org/docs/handbook/2/objects.html?utm_source=chatgpt.com#generic-object-types)                 |
| 55 | Classes                          | Fields, constructors and methods              | [Classes](https://www.typescriptlang.org/docs/handbook/2/classes.html?utm_source=chatgpt.com)                                                   |
| 56 | `public`, `protected`, `private` | Member visibility                             | [Member Visibility](https://www.typescriptlang.org/docs/handbook/2/classes.html?utm_source=chatgpt.com#member-visibility)                       |
| 57 | `readonly` Class Members         | Initialization vs later mutation              | [readonly](https://www.typescriptlang.org/docs/handbook/2/classes.html?utm_source=chatgpt.com#readonly)                                         |
| 58 | Abstract Classes                 | Abstract methods and implementation contracts | [Abstract Classes and Members](https://www.typescriptlang.org/docs/handbook/2/classes.html?utm_source=chatgpt.com#abstract-classes-and-members) |
| 59 | `implements`                     | Checking a class against an interface         | [implements Clauses](https://www.typescriptlang.org/docs/handbook/2/classes.html?utm_source=chatgpt.com#implements-clauses)                     |
| 60 | Generic Classes                  | Classes parameterized by types                | [Generic Classes](https://www.typescriptlang.org/docs/handbook/2/generics.html?utm_source=chatgpt.com#generic-classes)                          |

---

# Level 7 — Generics

Generics establish **relationships between types**, rather than simply accepting arbitrary types. This distinction is central to TypeScript. ([TypeScript][4])

| #  | Topic                                | Learning objective                                         | Docs                                                                                                                                                                                |
| -- | ------------------------------------ | ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 61 | Generic Functions                    | `function identity<T>(value: T): T`                        | [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html?utm_source=chatgpt.com)                                                                                     |
| 62 | Generic Type Inference               | Allowing TypeScript to determine `T`                       | [Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html?utm_source=chatgpt.com)                                                                                     |
| 63 | Multiple Type Parameters             | `<T, U>` and relationships between them                    | [Generic Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html?utm_source=chatgpt.com#generic-functions)                                                         |
| 64 | Generic Interfaces                   | Interfaces parameterized by another type                   | [Generic Types](https://www.typescriptlang.org/docs/handbook/2/generics.html?utm_source=chatgpt.com#generic-types)                                                                  |
| 65 | Generic Constraints                  | `<T extends Something>`                                    | [Generic Constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html?utm_source=chatgpt.com#generic-constraints)                                                      |
| 66 | Using Type Parameters in Constraints | `<T, K extends keyof T>`                                   | [Using Type Parameters in Generic Constraints](https://www.typescriptlang.org/docs/handbook/2/generics.html?utm_source=chatgpt.com#using-type-parameters-in-generic-constraints)    |
| 67 | Generic Defaults                     | `<T = DefaultType>`                                        | [Generic Parameter Defaults](https://www.typescriptlang.org/docs/handbook/2/generics.html?utm_source=chatgpt.com#generic-parameter-defaults)                                        |
| 68 | Constructor Constraints              | Generic factories and `new () => T`                        | [Using Class Types in Generics](https://www.typescriptlang.org/docs/handbook/2/generics.html?utm_source=chatgpt.com#using-class-types-in-generics)                                  |
| 69 | Good Generic Design                  | Push type parameters down; minimize unnecessary parameters | [Guidelines for Writing Good Generic Functions](https://www.typescriptlang.org/docs/handbook/2/functions.html?utm_source=chatgpt.com#guidelines-for-writing-good-generic-functions) |
| 70 | Variance Annotations                 | `in`, `out`, covariance and contravariance                 | [Variance Annotations](https://www.typescriptlang.org/docs/handbook/2/generics.html?utm_source=chatgpt.com#variance-annotations)                                                    |

Example progression:

```ts
function getProperty<T, K extends keyof T>(
  object: T,
  key: K
): T[K] {
  return object[key];
}
```

That single example prepares the learner for much of advanced TypeScript.

---

# Level 8 — Creating Types from Types

This is where TypeScript starts behaving almost like a **programming language operating on types**. The official docs group generics, `keyof`, `typeof`, indexed access, conditional types, mapped types and template literal types under "Creating Types from Types." ([TypeScript][5])

| #  | Topic                          | Learning objective                        | Docs                                                                                                                                                                  |
| -- | ------------------------------ | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 71 | `keyof`                        | Generate a union of object property names | [keyof Type Operator](https://www.typescriptlang.org/docs/handbook/2/keyof-types.html?utm_source=chatgpt.com)                                                         |
| 72 | Type-level `typeof`            | Derive a type from an existing value      | [typeof Type Operator](https://www.typescriptlang.org/docs/handbook/2/typeof-types.html?utm_source=chatgpt.com)                                                       |
| 73 | Indexed Access Types           | `User["name"]`, `T[K]`, `Array[number]`   | [Indexed Access Types](https://www.typescriptlang.org/docs/handbook/2/indexed-access-types.html?utm_source=chatgpt.com)                                               |
| 74 | Mapped Types                   | Iterate through keys of another type      | [Mapped Types](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html?utm_source=chatgpt.com)                                                               |
| 75 | Mapping Modifiers              | Add/remove `readonly` and optionality     | [Mapping Modifiers](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html?utm_source=chatgpt.com#mapping-modifiers)                                        |
| 76 | Key Remapping                  | `as` within mapped types                  | [Key Remapping via as](https://www.typescriptlang.org/docs/handbook/2/mapped-types.html?utm_source=chatgpt.com#key-remapping-via-as)                                  |
| 77 | Conditional Types              | Type-level conditional logic              | [Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html?utm_source=chatgpt.com)                                                     |
| 78 | `infer`                        | Extract a type from another type          | [Inferring Within Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html?utm_source=chatgpt.com#inferring-within-conditional-types) |
| 79 | Distributive Conditional Types | Conditional types applied across unions   | [Distributive Conditional Types](https://www.typescriptlang.org/docs/handbook/2/conditional-types.html?utm_source=chatgpt.com#distributive-conditional-types)         |
| 80 | Template Literal Types         | Generate string types from other types    | [Template Literal Types](https://www.typescriptlang.org/docs/handbook/2/template-literal-types.html?utm_source=chatgpt.com)                                           |

Conditional types follow the conceptual pattern:

```ts
T extends U ? X : Y
```

and can use `infer` to extract information from another type. ([TypeScript][6])

---

# Level 9 — Utility Types, Modules and Compiler Configuration

| #  | Topic                                 | Learning objective                                                              | Docs                                                                                                             |
| -- | ------------------------------------- | ------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------- |
| 81 | `Partial<T>`                          | Make every property optional                                                    | [Partial](https://www.typescriptlang.org/docs/handbook/utility-types.html?utm_source=chatgpt.com#partialtype)    |
| 82 | `Required<T>` and `Readonly<T>`       | Modify property requirements and mutability                                     | [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html?utm_source=chatgpt.com)          |
| 83 | `Pick<T,K>` and `Omit<T,K>`           | Select and remove object properties                                             | [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html?utm_source=chatgpt.com)          |
| 84 | `Record<K,T>`                         | Construct dictionary/object types                                               | [Record](https://www.typescriptlang.org/docs/handbook/utility-types.html?utm_source=chatgpt.com#recordkeys-type) |
| 85 | `Exclude`, `Extract`, `NonNullable`   | Perform set-like operations over unions                                         | [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html?utm_source=chatgpt.com)          |
| 86 | `Parameters`, `ReturnType`, `Awaited` | Derive types from functions and promises                                        | [Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html?utm_source=chatgpt.com)          |
| 87 | ES Modules                            | `import`, `export`, default vs named exports                                    | [Modules](https://www.typescriptlang.org/docs/handbook/2/modules.html?utm_source=chatgpt.com)                    |
| 88 | Module Resolution                     | How TS finds imported modules                                                   | [Modules Reference](https://www.typescriptlang.org/docs/handbook/modules/reference.html?utm_source=chatgpt.com)  |
| 89 | `tsconfig.json`                       | Configuring a TypeScript project                                                | [TSConfig Reference](https://www.typescriptlang.org/tsconfig/?utm_source=chatgpt.com)                            |
| 90 | Strict Compiler Options               | `strict`, `noImplicitAny`, `strictNullChecks`, `noUncheckedIndexedAccess`, etc. | [TSConfig Reference](https://www.typescriptlang.org/tsconfig/?utm_source=chatgpt.com)                            |

For production teaching, I would make topic 90 especially substantial. Compiler configuration is where many "TypeScript bugs" are actually introduced or prevented.

---

# Level 10 — Advanced and Production TypeScript

| #   | Topic                       | Learning objective                                                                                            | Docs                                                                                                                                           |
| --- | --------------------------- | ------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------- |
| 91  | Declaration Files           | Understanding `.d.ts` files                                                                                   | [Declaration Files](https://www.typescriptlang.org/docs/handbook/declaration-files/introduction.html?utm_source=chatgpt.com)                   |
| 92  | Typing JavaScript Libraries | Declaring types for packages without built-in typings                                                         | [Declaration File Templates](https://www.typescriptlang.org/docs/handbook/declaration-files/templates/module-d-ts.html?utm_source=chatgpt.com) |
| 93  | Declaration Merging         | How multiple declarations with the same name combine                                                          | [Declaration Merging](https://www.typescriptlang.org/docs/handbook/declaration-merging.html?utm_source=chatgpt.com)                            |
| 94  | Module Augmentation         | Adding types to an existing module                                                                            | [Module Augmentation](https://www.typescriptlang.org/docs/handbook/declaration-merging.html?utm_source=chatgpt.com#module-augmentation)        |
| 95  | Project References          | Splitting large TS systems into coordinated projects                                                          | [Project References](https://www.typescriptlang.org/docs/handbook/project-references.html?utm_source=chatgpt.com)                              |
| 96  | JavaScript Interoperability | `allowJs`, `checkJs`, JSDoc and migration strategies                                                          | [JavaScript Projects](https://www.typescriptlang.org/docs/handbook/intro-to-js-ts.html?utm_source=chatgpt.com)                                 |
| 97  | JSX and React Typing        | JSX types, props and TypeScript's JSX processing                                                              | [JSX](https://www.typescriptlang.org/docs/handbook/jsx.html?utm_source=chatgpt.com)                                                            |
| 98  | Decorators                  | Decorator syntax and typing                                                                                   | [Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html?utm_source=chatgpt.com)                                              |
| 99  | Recursive and Deep Types    | Combining conditional, mapped and recursive types                                                             | [Creating Types from Types](https://www.typescriptlang.org/docs/handbook/2/types-from-types.html?utm_source=chatgpt.com)                       |
| 100 | Designing Type-Safe APIs    | Combining generics, discriminated unions, inference, conditional types and exhaustive checking into real APIs | [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/?utm_source=chatgpt.com)                                                    |

---

# The learning progression

I would **not treat all 100 topics as equally important**. They form roughly five capability stages:

```text
STAGE 1 — WRITE TYPESCRIPT
Topics 1–20
       ↓
variables → functions → objects → unions

STAGE 2 — REASON ABOUT TYPES
Topics 21–40
       ↓
unknown → never → assignability → narrowing
       ↓
discriminated unions

STAGE 3 — DESIGN TYPED PROGRAMS
Topics 41–70
       ↓
functions → objects → classes → generics

STAGE 4 — PROGRAM THE TYPE SYSTEM
Topics 71–86
       ↓
keyof → indexed access → mapped types
       ↓
conditional types → infer → utility types

STAGE 5 — ENGINEER TYPESCRIPT SYSTEMS
Topics 87–100
       ↓
modules → compiler → declarations
       ↓
large projects → libraries → API design
```

## What I would consider the **core 20 concepts**

For someone who wants to become genuinely good at TypeScript rather than memorize syntax, these deserve much more training time:

**Union types → literal types → structural typing → assignability → `unknown` → `never` → narrowing → discriminated unions → exhaustive checking → generics → generic constraints → `keyof` → indexed access → mapped types → conditional types → `infer` → utility types → module boundaries → strict compiler configuration → type-safe API design.**

Those are essentially the conceptual spine of TypeScript.

For example, `keyof` transforms an object type into a union of its keys, which becomes especially powerful when combined with generics and mapped types. ([TypeScript][7]) Object types likewise form the basis for interfaces, type aliases and generic data structures. ([TypeScript][8])

---

# Recommended lesson-generation format

Since you're planning to feed this into a **learning-material generator**, I would make every one of the 100 topics conform to the same lesson schema:

```text
TOPIC
↓
1. Why does this exist?
2. Mental model
3. Syntax
4. Simplest example
5. Real-world example
6. What TypeScript infers
7. Common mistake
8. Compiler error exercise
9. Fix-the-code exercise
10. Predict-the-type exercise
11. Write-your-own-code exercise
12. Mini challenge
13. Connection to previous topics
14. Official TypeScript reference
```

For example, don't teach `never` as merely:

```ts
function fail(): never {}
```

Instead teach:

```text
unknown = universal set of values
string  = subset
"hello" = smaller subset
never   = empty set
```

Then connect that directly to:

```ts
function assertNever(value: never): never {
  throw new Error("Unexpected value");
}
```

and subsequently to exhaustive discriminated-union checking.

That turns the curriculum from **"100 TypeScript features"** into **100 progressively connected mental models**, which is far more suitable for generating lessons, exercises, quizzes and personalized learning paths.

[1]: https://www.typescriptlang.org/docs/handbook/?utm_source=chatgpt.com "TypeScript: The starting point for learning TypeScript"
[2]: https://www.typescriptlang.org/docs/handbook/2/narrowing?utm_source=chatgpt.com "TypeScript: Documentation - Narrowing"
[3]: https://www.typescriptlang.org/docs/handbook/2/functions.html?utm_source=chatgpt.com "TypeScript: Documentation - More on Functions"
[4]: https://www.typescriptlang.org/docs/handbook/2/generics?utm_source=chatgpt.com "TypeScript: Documentation - Generics"
[5]: https://www.typescriptlang.org/docs/handbook/2/types-from-types.html?utm_source=chatgpt.com "TypeScript: Documentation - Creating Types from Types"
[6]: https://www.typescriptlang.org/docs/handbook/2/conditional-types.html?utm_source=chatgpt.com "TypeScript: Documentation - Conditional Types"
[7]: https://www.typescriptlang.org/docs/handbook/2/keyof-types.html?utm_source=chatgpt.com "TypeScript: Documentation - Keyof Type Operator"
[8]: https://www.typescriptlang.org/docs/handbook/2/objects?utm_source=chatgpt.com "TypeScript: Documentation - Object Types"
