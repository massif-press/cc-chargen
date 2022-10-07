# cc-chargen

## Contents

- [cc-chargen](#cc-chargen)
  - [Contents](#contents)
- [Overview](#overview)
- [How it works](#how-it-works)
- [Demos](#demos)
- [Usage](#usage)
  - [Setup](#setup)
  - [Generation](#generation)
  - [Debugging](#debugging)
- [Syntax](#syntax)
  - [tl;dr](#tl-dr)
    - [Reserved Characters](#reserved-characters)
  - [Definitions vs Selections vs Templates](#definitions-vs-selections-vs-templates)
  - [Definitions](#definitions)
    - [Keyword Syntax](#keyword-syntax)
  - [Selections](#selections)
  - [Templates](#templates)
  - [Nesting](#nesting)
  - [Format](#format)
    - [Capitalization](#capitalization)
- [Data Structure](#data-structure)
  - [LibraryData](#librarydata)
  - [Example JSON](#example-json)
  - [Dynamic Generation](#dynamic-generation)
    - [Definitions](#definitions)
    - [Templates](#templates)
    - [Values](#values)
      - [Value Items](#value-items)
    - [Utility Functions](#utility-functions)

<small><i><a href='http://ecotrust-canada.github.io/markdown-toc/'>Table of contents generated with markdown-toc</a></i></small>

# Overview

This is a standalone app wrapper for a set of upcoming COMP/CON features related to the automatic generation of narrative elements for LANCER games. One it's far enough along to be merged it will be incorporated as a node package and published for other Lancer-related works to use.

Additionally, it'll be generalized into a standalone package for development of non- (or not necessarily, I guess) Lancer-related random generators.

The goal is for this to be smarter and more flexible than a markov generator or adlib engine, without falling down the simulation rabbit hole.

# How it works

chargen is essentially a text-replacement engine with some extra features. You define json arrays and objects with string data, and chargen replaces bits of them with other bits. It's adlib templates that can be conditionally filled with other templates, or regular words, or keywords that are picked once and never change.

It seems complicated (and I've written a lot of words here) but was built to be pretty easy, straightforward, and organizable in practice. You can check the `/src/data` folder for a complicated Lancer example, but the generic module version of this project will have a much simpler example (or, probably, a small set of examples)

# Demos

TODO TODO TODO

# Usage

Broadly, chargen consists of Libraries (which contain the raw data used in generating things), and Generators (the things doing the generation). You fill Libraries with information a Generator can pick from, and how to pick it, and the Generator looks through all of that information and those instructions and spits out something based on the data it finds.

## Setup

To start, create a new Generator:

```ts
const myGenerator = new Generator();
```

To use the generator, we need to provide this generator with a Library: an an object hierarchy of data that the generator will pull from to construct output.

```ts
const myLibrary = new Library();
```

A [Library](#library) contains one or more [LibraryData](#librarydata). These data can be imported as [static JSON objects](#data-structure) or can be [programmatically generated](#dynamic-generation). Take a look at [Example JSON](#example-json) or !!!!!TODO!!!!!these demos!!!!!TODO!!!!! to get started with building Libraries.

Multiple LibraryData can be added to a Library, to allow for deep and complex and/or dynamically produced generators. The library can be built or modified with the following functions:

```ts
  AddData(data: LibraryData) // add new data, or merge in new data to an already-existing item in the library with the same key
  SetData(data: LibraryData) // set data at the LibraryData's key, overwriting what was there, if anything
  DeleteData(key: string | LibraryData) // delete anything found at a key string, or the key value of the supplied LibraryData
```

Libraries can also be initialized with LibraryData:

```ts
  const myLibrary = new Library(...data: LibraryData[])
```

Furthermore, you can get the contents of a library with

```ts
  GetLibrary(key: string | LibraryData): LibraryData
```

Or test if a Library has data at an object path:

```ts
  HasLibrary(key: string | LibraryData): boolean
```

Once we have finished collecting our data, we can load the library and ready the generator by:

```ts
myGenerator.LoadLibrary(myLibrary);
// or, as a constructor parameter
const myGenerator = new Generator(myLibrary);
```

This builds our ValueMap and prepares the generator. It's important to note that loading another library will clear and rebuild the ValueMap, so any manual ValueMap changes must be redone between Library loads.

After a library is loaded, we can modify the ValueMap, a collection of key-value pairs that represent substitutions for specific strings that appear in templates or other substitutions. These get automatically constructed based on the contents of the [LibraryData](#library-data), and will be where chargen looks first when generating an item. See [Data Structure](#data-structure) for more details.

```ts
  AddValueMap(key: string, value: ValueInput) // add new values, or merge values at an already-existing key
  SetValueMap(key: string, value: ValueInput) // add new values, or overwrite values at an already-existing key
  SetValueAtIndex(key: string, index: number, value: string | {value: string, weight: number}) // overwrite value at index (cannot be an array)
  GetValueMap(key: string): {key: string, weight: number}  // return an object of values (and their weights) at key. Returns null if the key is not defined
  HasValueMap(key: string): boolean // returns a true if any values exist at key, false if there aren't any, and an error if the key is not defined
```

`ValueInput` is an interface that represents any of a number of ways to pass values and/or their [Selection Weights](#selections). A ValueInput parameter can be:

- A simple string, which is assigned a default weight of `1`: `"example one"`
- A string containing [Weight Syntax](#syntax), which is assigned weight based on the number after the `:`: `"example two:2"` (weight 2)
- A string with pipes `|`, with or without weights: `"example 3|example 4|example 5"`
- An array of strings with or without weight syntax: `["arr 1", "arr 2", "arr3:2]"` (weights 1, 1, and 2, respectively)
- An object with one or more value-weight pairs: `{first_val: 1, second_val: 3} (weights 1 and 3, respectively)

All other [syntax](#syntax) is safe to use here, as it won't be evaluated at this time.

From here, we can begin to generate output.

## Generation

We can generate a new item `Generate()` function:

```ts
  Generate(template?: number|string|string[]|{Key: string}|{Templates: string}, options?: GeneratorOptions): string
```

The first optional parameter is the starting template:

- If nothing is provided chargen will select a random template from a random top-level LibraryData item.
- If a number is provided chargen will select a random template from the LibraryData item at that index.
- If an object with a `Key` string is provided (such as a LibraryItem), chargen will select a random template from the LibraryData item with the same key
- If an object with a `Templates` array is provided (such as a LibraryItem), chargen will select a random string from that array
- If a string array is provided, chargen will select a random item from the array
- If a string is provided, chargen will use that string as its initial template

The second optional parameter is a GeneratorOptions object:

```ts
 class GeneratorOptions {
  CleanMultipleSpaces: boolean, // remove all whitespace segments greater than length 1
  CapitalizeFirst: boolean // capitalize the first character after every newline character
  IgnoreMissingKeys: boolean // ignore any missing keys instead of erroring out
  MaxIterations: number // number of times the parser will recursively iterate through the output before it quits
 }
```

If no second parameter is supplied, the following default options will be used:

```ts
  {
    CleanMultipleSpaces: true,
    CapitalizeFirst: true,
    IgnoreMissingKeys: true,
    MaxIterations: 100
  }
```

## Debugging

```ts
  TestGeneration(template?: number|string|string[]|{Key: string}|{Templates: string}): string[]
```

Run a generation and collect issues (errors and warnings).

```ts
FindMissingValues(): string[];
```

Recursively iterates through the entire library and detects any missing keys (per the GeneratorOption `IgnoreMissingKeys`)

```ts
OverlappingDefinitions(): string[];
```

Searches through the Library to find any multiple instances of definitions mapped to the same key

# Syntax

## tl;dr

| syntax                    | result                                                                                               |
| ------------------------- | ---------------------------------------------------------------------------------------------------- |
| {prop}                    | sample from the ValueMap at key "prop" (or Library if it doesn't exist)                              |
| %prop                     | same as above                                                                                        |
| %prop%                    | same as above (used when chaining or nesting keywords, see [Keyword Syntax](#keyword-syntax))        |
| {inline\|sample}          | sample from ["inline", "sample"]                                                                     |
| {inline:1\|sample:2}      | weighted sample (1 and 2, respectively)                                                              |
| @pct10{prop}              | sample from prop 10% of the time, otherwise ignore                                                   |
| @key{prop}                | assign sample from prop to `key`                                                                     |
| @key{inline\|sample}      | assign either "inline" or "sample" to `key`                                                          |
| @key{inline:3\|sample:10} | same as above, but with selection weights                                                            |
| ^{any}                    | capitalize the first letter of finalized selection (`hello world` => `Hello world`)                  |
| ^^{any}                   | capitalize the first letter of all words in the finalized selection (`hello world` => `Hello World`) |
| ^^^{any}                  | capitalize all letters in the finalized selection (`hello world` => `HELLO WORLD`)                   |

### Reserved Characters

- global: `{}` `@` `^` `%`
- within a sample set: `|`
- `:` is reserved only if it is immediately proceeded by an integer

These characters can be escaped with a backslash (`\`).

Additionally, the following strings cannot be used as definitions or value keys:

- `key`
- `pct`
- `definitions`
- `values`
- `templates`

though they may be included in other strings. `mytemplates`, for example, is valid.

## Definitions vs Selections vs Templates

The three main concepts in chargen's data structure as well as its syntax are Definitions, Selections, and Templates. They are all, ultimately, key-value pairs, handled slightly differently for ease of use and organization. Definitions are keys with a single value that cannot be changed once set. Selections are arrays of values that are always selected from randomly (but can include item weights). Templates are values keyed by their containing LibraryData's own key, and serve as the entrypoint into new LibraryData sections. They're described in detail below:

## Definitions

**Immutable items that are glossed to a keyword.**

Templates and selection sets can then reference that keyword, and will always receive the same set value. For example, let's say we establish a definition for the keyword `name`. We can explicitly define this keyword in a generator with the `SetDefinition()` function, in any data structure's `"definitions"` object, or we can allow this definition to be set as part of the processing of a template by using any selection syntax.

An inline definition, for example:

```json
"this is a template, written by @name{beef|some jerk|your mom}"
```

or, within a data definition:

```json
  "definitions": {
    "name": "{beef|some jerk|your mom}"
  },
```

or directly, in the generator:

```ts
const myGenerator = new Generator(myLibraryData);
const selection = _.sample(['beef', 'some jerk', 'your mom']);
myGenerator.Define('name', selection);
```

Definitions can then be used in templates like any other keyed item:

| template                               | result                           |
| -------------------------------------- | -------------------------------- |
| `"this example was written by {name}"` | this example was written by beef |

but can also use the `%key` syntax, which allows for its use _within_ selection sets:
template|transformation|result
---|---|---
`{cities_%state} is in %state` | `{cities_illinois} is in illinois` | `chicago is in illinois`

Definitions don't have to be set within top-level data, necessarily. chargen will continuously loop through output until all open tags are resolved, or it hits its execution limit (100 loops, by default). In the above example, the %name definition could have been set at the end of my generation process. That said, if a definition can't be evaluated until a later step it will get passed along as a template or selection set, and is therefore unlikely to remain consistent. It is best practice to either ensure definitions are either set as early as possible, or set in such a way that only one selection is possible.

It's important to note that definitions cannot be changed once set. Duplicate keys will just be skipped. In eg `"@name{'A'|'B'} @name{'C'|'D'}"`, `%name` will only be defined as `A` or `B`. `C` or `D` will still be selected from the latter set, but will not be assigned to `%name`.

Finally, the generator's `Define(key: string, value: string)` function is useful where more involved selection is necessary, or selections set by eg. user choices. Character gender is a good example here, where other useful keywords (such as pronouns) are dependent on another choice. It'd be easier to set your pronoun keywords based on the selected gender rather than writing complicated selection templates. User overrides are another good use case -- you might allow a user to set the %name keyword explicitly in a UI and allow it to override places where the name keyword might be otherwise defined in the generation process.

### Keyword Syntax

You **can** use the %key syntax to invoke **any** ValueMap key (eg. `%name` instead of {name}). You can even compose key names out of keyword syntax by closing the keyword definition with another `%`: `{%itemstyle%_%itemtype%}` could become `{ancient_weapon}`, and therefore pull from that ValueMap key.

Furthermore you can use this syntax to nest keywords where you otherwise couldn't `{%like|%this|%or%-%this%}`.

## Selections

**Selections are in-place random substitutions.**

They can come from an inline list, a value map made from property selections (see [Data Structures](#data-structures)) or data in the library found at a property path. They can also contain keywords in order to modify selection sets (eg. `{cities_%country}` might resolve to `{cities_usa}` or `cities_china`).

Inline sets are very simple, and are written as `{bracketed|items|seperated|by|pipes}`. Every item has an equal chance of being selected, though this can be modified with _weights_. Weights are appended with a `:` and an integer, for example:

`"here's a template with a {good:10|cool:50|awful:1} weighted selection"`

In the above example, "good" has weight 10, "cool" 50, and "awful" 1. This is selected "by weight", which is (I think) most easily explained as if it was from a 61-item-long list (10 "good"s, 50 "cool"s, and 1 "awful"). Anything that is not assigned a weight will take a default weight of one, so `{a:1|b:1|c:2} == {a|b|c:2}` .

Inline selection sets can also be empty, for example: `{alpha|beta|}`, which will render as "alpha", "beta", or an empty string. Empty selection sets can also be weighted, eg: `{alpha:1|beta:2|:3}`. Empty sets might cause issues with spacing, but under default postprocessing this shouldn't be much of an issue.

Selections that have no pipes are interpreted by chargen as a reference selection. Chargen will first look for a string array with a key that matches a template selection that has already been made (see [Data Structures](#data-structures)). If it can't find one, it will then look for a string array at that location in the generator library. When it finds one, it makes a random selection from there.

Finally, array elements can also be weighted by adding a `:n` integer to the end, exactly like the inline syntax. This will be ignored if not followed immediately by an integer, or if the colon is escaped with `\`

## Templates

**Strings that can contain selection sets or definitions, that can themselves be selected over or defined.**

This is where the real meat of chargen is, and you can think of them like conditional ad-libs within ad-libs, if that makes any sense. A template might look something like:

```json
"this is an example template, with a selection of {another_template}"
```

the `"another_template"` here could look like this:

```json
"another_template": ["static string", "a new {selection|choice}", "or even {yet_another_template}"]
```

chargen loops through output, finding bracketed selection sets and injecting strings and/or additional templates as it goes. This becomes very useful when you begin combining selection sets with definitions. Let's say you were writing a generator to produce a description of a bar, and wanted a sample drink from that bar. A general selection set might work, like:

```json
"they're famous for their {drink_types}"
```

and you could generate `old fashioneds`, `beer`, and `carrot juice` -- and maybe that works for you, but with definitions and nested templates you could get pretty involved without writing an explicit bar generation algorithm. Consider something like

```json
"You arrive at {names_%bartype%}, a {styles_%bartype%} %bartype renown for its {drinks_%bartype%}"
```

The first time you generate with this template the `bartype` keyword is set to `pub`, and the first loop gets you:

```json
"You arrive at {The {animal} & {animal}}, a {classic} pub renown for its {robust {beer}}"
```

`{names_%bartype%}` has resolved into `{names_pub}`, which is itself a list of templates of pub-sounding name formats, the one chosen is the classic "The so-and-so". Similarly, `{drink_%bartype%}` has resolved into `{drinks_pub}`, a template that lists (for our example) beers with beer-y adjectives. chargen will loop through again, and its final pass might get us:

```json
"You arrive at The Horse & Hound, a classic pub renown for its robust Irish Stout"
```

Not bad! But what if you run it again and get `wine bar` instead of `pub` assigned to the `%bartype` keyword?

```json
"You arrive at The Cravat, an upscale wine bar renown for its exciting selection of Bordeaux"
```

A much different vibe, and one you didn't have to write a bar-type-determiner algorithm for, just some templates and their associated selection data.

## Nesting

Double inline selection sets, **cannot** be nested: `{choice a|choice {b1|b2|b3}|choice c}` will **not** work. `{choice a|choice %subchoice%|choice c}` where %subchoice points to a string of `"{b1|b2|b3}"` _will_ work.

Aside from double inline sets, any sort of nesting should be viable (for the most part). One thing to watch out for is selection sets that can select for themselves. Consider:

```json
"my_selection_set": "this is a template containing {my_selection_set}"
```

this circular reference will render a looping "this is a template containing this is a template containing this is a template containing this is a template containing"... chargen will, by default, bail out after 100 loops, but this is something to be wary of when writing nested templates, especially as your reference trees become more complex.

## Format

### Capitalization

The `^` character will capitalize the following character (eg. `^a` becomes `A`). This is useful for rendering proper nouns correctly as part of a generation sequence. For example, if my list of names is in lowercase but should be rendered with the correct capitals, I could write it as ^{firstname} ^{lastname}, and my final string would render as **J**ohn **S**mith, instead of john smith (as it'd appear in my raw data).

Doubling the caret (`^^`) will capitalize every word in the selection set. Tripling (`^^^`) capitalizes every character.

| input                   | output                             |
| ----------------------- | ---------------------------------- |
| now playing: {album}    | now playing: illmatic              |
| now playing: ^{album}   | now playing: Paul's boutique       |
| now playing: ^^{album}  | now playing: Brand New Second Hand |
| now playing: ^^^{album} | now playing: MADVILLAINY           |

(every album data string in the above example being saved in lower case)

All capitalization sequences can be escaped by prepending a single backslash: `\^` `\^^` and `\^^^`

Capitalization sequences should come first in a set of reserved characters:

- ❌ `@pct50{^selection}`
- ✅ `^@pct50{selection}`
- ❌ `%^another_one`
- ✅ `^%another_one`

# Data Structure

## LibraryData

LibraryData objects contain all of your generation data, and are used to construct a Generator's Library.

LibraryData outline:

```ts
{
  key: string,
  definitions: Map<string, string>,
  values: Map<string, string | string[]>,
  templates: string[]
}
```

`definitions`, `values`, and `templates` all furnish a Generator's ValueMap, but are imported into a Library in slightly different ways.

**Definitions**, once set, cannot be overwritten. This means:

- A definition with selection syntax will never be resolved into a single value. Defining something `"{like|this}"` will mean that a choice between `like` _or_ `this` will be made _every_ time the key is invoked
- Overlapping definitions will be ignored as soon as a key is defined. You can examine a Library for these with the `Generator.OverlappingDefinitions()` function, which will return a list of all colliding definition keys.

**Values** are standard key-value pairs. They are converted to `{key: string, value: string, weight: number}` objects when the Generator loads a library. Multiple LibraryData objects can contain values with the same key, which will be merged on Library load.

**Templates** are key-value pairs, but take the key of the LibraryData object that defines them. Additionally, the Generator will begin its generation process by selecting from the `templates` array if passed an index, a LibraryData key, or a LibraryData object. This allows for library organization by injecting template keys into other templates, for example:

`parent.json`

```json
{
  "key": "parent",
  "definitions": {
    "parent_definition": "definition 1"
  },
  "values": {
    "parent_value": "value 1"
  },
  "templates": ["%child_definition {child_value} / nested template: {child}"]
}
```

`child.json`

```json
{
  "key": "child",
  "definitions": {
    "child_definition": "definition 2"
  },
  "values": {
    "child_value": "value 2"
  },,
  "templates": [
    "hello from nested template %parent_definition {parent_value}"
  ]
}
```

produces: `definition 2 value 2 / nested template: hello from nested template definition 1 value 1`

## Example JSON

```json
{
  "key": "example",
  "definitions": {
    "name": "beef"
  },
  "values": {
    "you": ["buddy|pal|friend", "{insult}"],
    "insult": ["dingus", "nerd"],
    "greeting": ["{howdy:1|hey:3}", "sup"]
  },
  "templates": [
    "Hello {you}, I am ^%name",
    "{greeting} buddy, {my name is|you can call me} ^%name"
  ]
}
```

Would produce output like: `Hello nerd, I am Beef`, `Hey buddy, you can call me Beef`, or `Hello pal, I am Beef`. These selection sets (and definitions) are written into both the library and the value map, so any other properties selected during this generation process would replace `%name` with `beef` and `{insult}` with a selection from "dingus" or "nerd". Other properties that defined `insult` would add to the possible selection set, which is gathered before the template is evaluated, so if other properties elsewhere in the object expanded the `insult` array, the templates above would be able to choose from that expanded set.

That's a complicated way of explaining that any selection definitions in properties are collected and merged together **before** any templates are evaluated

## Dynamic Generation

Static data may not be sufficient for your use case - for example, you may want to allow a user to manually add items to a selection set, or define their own generation template. In these cases, you can dynamically construct LibraryData for your library or generator.

Create a LibraryData with:

```ts
const myData = new LibraryData(key: string);
```

all fields (`key`, `definitions`, `values`, and `templates`) on a LibraryData object are public, so you can manipulate them directly, but convenience methods are provided:

### Definitions

```ts
myData.definitions;
```

```ts
Define(key: string, value: string)
```

This function will throw an error if the key is already defined

```ts
ClearDefinition(key: string)
```

Removes a definition.

### Templates

```ts
myData.templates;
```

```ts
AddTemplate(...value: string[])
```

Adds one or more template strings. Templates are automatically given the same key as its containing LibraryData.

```ts
SetTemplate(index: number, value: string)
```

Overwrites a template at index.

```ts
RemoveTemplate(index: number)
```

Removes a template at index.

```ts
ClearTemplates(index: number)
```

Removes all templates on the object.

### Values

```ts
myData.values;
```

```ts
GetValue(key: string): {value: string, weight: number}[]
```

Get an array of all value items (and their weights) at the provided key. If the key does not exist, this will return `null`.

```ts
AddValue(key: string, value: string | string[], weight?: number | number[])
```

If it already exists, the the value item will be added to the existing key. Values can be added as an array of strings, or with any chargen syntax (eg. `{item 1|item 2|item 3}`). Item weights can be optionally added as a single number, which will be given to all values, or, as an array of numbers which will be assigned to the values in order (ie `value[3]` will be weighted by `weight[3]`). Weights can be passed via chargen syntax as well (`{item a:5|item b:3|item c:1}`). Weights passed as a parameter will overwrite weights derived from syntax.

```ts
SetValue(key: string, value: string | string[], weight?: number | number[])
```

As above, but will overwrite an existing key

```ts
ClearValue(key: string)
```

Clears all values for the given key. An empty value set will be left blank at rendering, but will **not** throw an error on generation.

```ts
ClearValueWeights(key: string)
```

Sets the weight of all items under the key to `1`

```ts
DeleteValue(key: string, index: number)
```

Removes a key and all of its associated values. A missing key **will** throw an error on generation.

### Value Items

The following functions can be used to manipulate the specific elements a Value can select over (its internal selection array).

```ts
SetValueItemWeight(key: string, index: number, weight: number)
```

Sets a value's item's weight based on its index in the array.

```ts
ClearValueItem(key: string, index: number)
```

Sets the value item at `key[index]` to an empty string with weight `1`

```ts
DeleteValueItem(key: string, index: number)
```

Removes a value item at `key[index]`

### Utility Functions
