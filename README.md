# cc-chargen
This is a standalone app wrapper for a set of upcoming COMP/CON features related to the automatic generation of narrative elements for LANCER games. One it's far enough along to be merged it will be incorporated as a node package and published for other Lancer-related works to use.

Additionally, it'll be generalized into a standalone package for development of non- (or not necessarily, I guess) Lancer-related random generators.

The goal is for this to be smarter and more flexible than a markov generator or adlib engine, without falling down the simulation rabbit hole.

# How it works
chargen is essentially a text-replacement engine with some extra features. You define json arrays and objects with string data, and chargen replaces bits of them with other bits. It's adlib templates that can be conditionally filled with other templates, or regular words, or keywords that are picked once and never change.

It seems complicated (and I've written a lot of words here) but was built to be pretty easy, straightforward, and organizable in practice. You can check the `/src/data` folder for a complicated Lancer example, but the generic module version of this project will have a much simpler example (or, probably, a small set of examples)

# Usage

## Setup
Create a new Generator object and pass a [configuration](#configurations), an object that represents the foundational structure of the thing you want to generate:
```ts
  const generator = new Generator(myconfiguration: configuration)
```

You must then fill the Generator's `Library` - an object hierarchy of generator data. These data will be referenced in template data by their object path (eg. occupation.artist), derived from:

```js
  generator.LoadLibraryObject(myData, myOtherData) // the object hierarchy/ies of the passed object 
  generator.LoadLibraryFile('./data/otherData.json', '../etc/example.json') // the file path(s) of the json files
```

It's important to note that all file must be .json files, all all data stored therein must be named arrays of strings. These load functions can be called multiple times and work additively, meaning that if the library receives two load commands with duplicate key paths, the objects at those keys will be merged, not overwritten.

The Library is a public property of a Generator, but helper functions are included:

The library can also be built or modified with the following functions
```js
  SetLibrary(path, data) // set a library key, overwriting what was there, if anything
  AppendLibrary(path, data) // append `data` to an already-existing item in the library
  DeleteLibrary(path) // delete anything found at path
```
the `path` parameter is either the property path as a string (eg. `object.prop1.prop2`) or an array of strings describing that path. The `data` parameter must be an array of strings.

Furthermore, you can get the contents of a library with
```js
  GetLibrary(path) //returns a string[]
```

Or test if a Library has data at an object path:
```js
  HasLibrary(path) //returns a boolean
```

Some of your generator syntax might require values that you want external control over. This can be done with the following functions:
```ts
  SetDefinition(key: string, val: string)
  GetDefinition(key: string): string 
  HasDefinition(key: string): boolean
  DeleteDefinition(key: string)
```
"Definition" functions well set static definitions that can be referenced when evaluating the template. Eg. `SetDefinition('age', "30")` will replace the `%age` keyword in templates with the string "30". This can be used to control selection sets if the keyword is used in keys. Definitions will always be evaluated as early as possible, so it's better to set these as early as possible as well.

```ts
  SetValueMap(key: string, value: string | string[]) 
  AppendValueMap(key: string, value: string | string[]) 
  GetValueMap(key: string): string[]
  HasValueMap(key: string): boolean
  DeleteValueMap(key: string)
```
"ValueMap" functions set first-level selection sets for the generation process. These get automatically constructed based on the contents of the Configuration's [Models](#models), and will be where chargen looks first when generating an item. Eg. `SetValueMap('job', ['waiter', 'mechanic', 'painter'])` will replace selection sets of `{job}` with one of "waiter", "mechanic" or "painter". These items can be given weights as well (see [Syntax](#tldr)).

`SetValueMap(key, val)` will add data `val` at key, or overwrite anything already there with `val`, whereas `SetValueMap(key, val)` will add data `val` at key, or add `val` to anything that already exists at key.

## Generation

Once everything is set up, you can generate something from your configuration with the `Generate()` function: 
```ts
  Generate(skipPostprocess?: boolean): string // return an item from a random configuration configuration (if no configuration has been set)
  Generate(config: string|number, skipPostprocess?: boolean): string // return an item from a configuration by name (string) or index (number)
```

the configuration can be set independently with the `SetConfiguration(config: string|number)` function.


## Rendering
TODO: RENDERING
this produces a per-property template
can then push this into rendering output

eg. "occupation" will contain a template and/or refs to lower properties

Render function can take options that turn keys into title, markdown, etc

// These will produce an evaluated and formatted string. chargen will do some limited post-process cleanup of the output by default. This can be skipped by setting the **optional** `skipPostprocess` parameter to `true`.

By default, chargen runs the following, which take a string and return a new string:
```ts
  CleanMultipleSpaces(input: string): string // finds and removes consecutive /s characters
  RemoveEscapes(input: string): string // finds and removes the backspace (/) character, used for escaping special characters and reserved snytax
  CapitalizeFirst(input: string): string // capitalizes the first letter of every line, and every character after a period
```

# Syntax

## tl;dr
|syntax | result |
---|---
{prop} | sample from collected data at key "prop" (or Library if it doesn't exist)
{.prop} | sample from Library at path "prop"
{inline\|sample} | sample from ["inline", "sample"]
{inline:1\|sample:2} | weighted sample (1 and 2, respectively)
@pct10{prop.path} | sample from prop.path 10% of the time, otherwise ignore 
@key{prop.path} | assign sample from prop.path to `key`
@key{inline\|sample} | assign either "inline" or "sample" to `key` 
@key{inline:3\|sample:10} | same as above, but with selection weights
^{any} | capitalize the first letter of finalized selection (`hello world` => `Hello world`)
^^{any} | capitalize the first letter of all words in the finalized selection (`hello world` => `Hello World`)
^^^{any} | capitalize all letters in the finalized selection (`hello world` => `HELLO WORLD`)

## Definitions vs Selections vs Templates
The three main concepts in chargen's data structure as well as its syntax are: 

## Definitions 
**Static or singly-selected items that are then glossed to a keyword.**

Templates and selection sets can then reference that keyword, and will always receive the same set value. For example, let's say we establish a definition for the keyword `name`. We can explicitly define this keyword in a generator with the `SetDefinition()` function, in any data structure's `"definitions"` object, or we can allow this definition to be set as part of the processing of a template by using any selection syntax. 

An inline definition, for example:

```json
"this is a template, written by @name{beeftime|some jerk|your mom}"
```

or, within a data definition:

```json
  "definitions": {
    "name": "{beeftime|some jerk|your mom}"
  },
```

or directly, in the generator: 
```ts
  const myGenerator = new Generator(myconfiguration);
  const selection = _.sample(['beeftime', 'some jerk', 'your mom'])
  myGenerator.SetDefinition('name', selection)
```

Definitions can then be used in templates by prefacing the keyword with the `%` character:

```json
"this example was written by %name"
```

becomes 

```json
this example was written by beeftime
```

Definitions don't have to be set within top-level data, necessarily. chargen will continuiously loop through output until all open tags are resolved, or it hits its execution limit (100 loops, by default). In the above example, the %name definition could have been set at the end of my generation process. That said, if a definition can't be evaluated until a later step it will get passed along as a template or selection set, and is therefore unlikely to remain consistent. It is best practice to either ensure definitions are either set as early as possible, or set in such a way that only one selection is possible.

As an aside: outside of the generator `SetDefinition` function, definitions cannot be changed once set. Duplicate keys will just be skipped. In eg `"@name{'A'|'B'} @name{'C'|'D'}"`, `%name` will only be defined as `A` or `B`. `C` or `D` will still be selected from the latter set, but will not be assigned to `%name`.

Finally, the generator's `SetDefinition(key: string, value: string)` function is useful where more involved selection is necessary, or selections set by eg. user choices. Character gender is a good example here, where other useful keywords (such as pronouns) are dependent on another choice. It'd be easier to set your pronoun keywords based on the selected gender rather than writing complicated selection templates. User overrides are another good use case -- you might allow a user to set the %name keyword explicitly in a UI and allow it to override places where the name keyword might be otherwise defined in the generation process.

## Selections
**Selections are in-place random substitutions.** 

They can come from an inline list, a value map made from property selections (see [Data Structures](#data-structures)) or data in the library found at a property path. They can also contain keywords in order to modify selection sets (eg. `{cities_%country}` might resolve to `{cities_usa}` or `cities_china`).

Inline sets are very simple, and are written as `{bracketed|items|seperated|by|pipes}`. Every item has an equal chance of being selected, though this can be modified with *weights*. Weights are appended with a `:` and an integer, for example:

`"here's a template with a {good:10|cool:50|awful:1} weighted selection"`

In the above example, "good" has weight 10, "cool" 50, and "awful" 1. This is selected "by weight", which is (I think) most easily explained as if it was from a 61-item-long list (10 "good"s, 50 "cool"s, and 1 "awful"). Anything that is not assigned a weight will take a default weight of one, so `{a:1|b:1|c:2} == {a|b|c:2}` .

Inline selection sets can also be empty, for example: `{alpha|beta|}`, which will render as "alpha", "beta", or an empty string. Empty selection sets can also be weighted, eg: `{alpha:1|beta:2|:3}`. Empty sets might cause issues with spacing, but under default postprocessing this shouldn't be much of an issue.

Selections that have no pipes are interpreted by chargen as a reference selection. Chargen will first look for a string array with a key that matches a template selection that has already been made (see [Data Structures](#data-structures)). If it can't find one, it will then look for a string array at that location in the generator library. When it finds one, it makes a random selection from there. 

To override the template-first selection, append a `.` to the beginning of the selection key to force chargen to look in the library. Eg. `{job}` will first look for a `job` array in the key-value map it makes after collecting template properties, then look for `job` in the generator's library. `{.job}` will skip the key-value map step. Typically you'd use this to get a selection from a property that is independent of the thing you're generating. chargen will try to find anything that matches the key, so if you have a large library make sure to specify the path as closely as possible (eg. `{.gear.weapon.hammer}` instead of `{.hammer}`, especially if you have a list at {.gear.tool.hammer})

Finally, selected elements can also be weighted by adding a `:n` integer to the end, exactly like the inline syntax. This will be ignored if not followed immediately by an integer, or if the colon is escaped with `\`

## Templates
**Strings that can contain selection sets or definitions, that can themselves be selected over or defined.**

This is where the real meat of chargen is, and you can think of them like conditional ad-libs within ad-libs, if that makes any sense. A template might look something like:

```json
"this is an example template, with a selection of {another_template}"
```

the `"another_template"` here could look like this:

`"another_template": ["static string", "a new {selection|choice}", "or even {yet_another_template}"]`

chargen loops through output, finding bracketed selection sets and injecting strings and/or additional templates as it goes. This becomes very useful when you begin combining selection sets with definitions. Let's say you were writing a generator to produce a description of a bar, and wanted a sample drink from that bar. A general selection set might work, like:

```json
"they're famous for their {drink_types}"
```

and you could generate `old fashioneds`, `beer`, and `carrot juice` -- and maybe that works for you, but with definitions and nested templates you could get pretty involved without writing an explicit bar generation algorithm. Consider something like

```json
"You arrive at {names_%bartype}, a {styles_%bartype} %bartype renown for its {drinks_%bartype}"
```

The first time you generate with this template the `bartype` keyword is set to `pub`, and the first loop gets you:

```json
"You arrive at {The {animal} & {animal}}, a {classic} pub renown for its {robust {beer}}"
```

`{names_%bartype}` has resolved into `{names_pub}`, which is itself a list of templates of pub-sounding name formats, the one chosen is the classic "The so-and-so". Similarly, `{drink_%bartype}` has resolved into `{drinks_pub}`, a template that lists (for our example) beers with beer-y adjectives. chargen will loop through again, and its final pass might get us:

```json
"You arrive at The Horse & Hound, a classic pub renown for its robust Irish Stout"
```

Not bad! But what if you run it again and get `wine bar` instead of `pub` assigned to the `%bartype` keyword?

```json
"You arrive at The Cravat, an upscale wine bar renown for its exciting selection of Bordeaux"
```

A much different vibe, and one you didn't have to write a bar-type-determiner algorithm for, just some templates and their associated selection data.


## Nesting
Inline selection sets **cannot** be nested: `{choice a|choice {b1|b2|b3}|choice c}` will **not** work. Aside from that, any sort of nesting should be viable (for the most part). One thing to watch out for is selection sets that can select for themselves. Consider:
```json
"my_selection_set": "this is a template containing {my_selection_set}"
```
this circular reference will render a looping "this is a template containing this is a template containing this is a template containing this is a template containing"...  chargen will, by default, bail out after 100 loops, but this is something to be wary of when writing nested templates.

##  Reserved Characters
- global: `{}` `@` `^` `%`
- within a sample set: `|` 
- `:` is reserved only if it is immediately proceeded by an integer

These characters can be escaped with a backslash (`\`). 

Additionally, the words `key` and `pct` cannot be used as definition keywords

## Format
  ### Capitalization
  The `^` character will capitalize the following character (eg. `^a` becomes `A`). This is useful for rendering proper nouns correctly as part of a generation sequence. For example, if my list of names is in lowercase but should be rendered with the correct capitals, I could write it as ^{firstname} ^{lastname}, and my final string would render as **J**ohn **S**mith, instead of john smith (as it'd appear in my raw data).

  Doubling the caret (`^^`) will capitalize every word in the selection set. Tripling (`^^^`) capitalizes every character. 
  
  input|output
  ---|---
  now playing: {album}    | now playing: illmatic
  now playing: ^{album}   | now playing: Paul's boutique
  now playing: ^^{album}  | now playing: Brand New Second Hand
  now playing: ^^^{album} | now playing: MADVILLAINY

  (every album data string in the above example being saved in lower case)
  
  All capitalization sequences can be escaped by prepending a single backslash: `\^` `\^^` and `\^^^`


## Special

# Data Structure
## Configuration
A Configuration is the base definition of the thing you want to generate -- the "type" of generator you're invoking. It contains base definitions common throughout every generated thing of the same type, as well as "configurations", which will be further described below.

A Configuration outline:
```js
{
  name: string,
  definitions: object,
  models: Property[]
}
```

An example configuration object for a character generator:
```json
{
  "name": "Character",
  "definitions": {
    "alignment": ["good", "neutral", "evil"]
  },
  "models": [
    {
      "name": "orc",
      "definitions": {
        "ears": "pointy"
      },
      "properties": {
        "class": ["warrior", "berserker"]
      }
    },
    {
      "name": "elf":,
      "definitions": {
        "ears": "long"
      },
      "properties": {
        "class": ["ranger", "sorcerer"]
      }
    },
  ]
}
```
in the above example, the definition "alignment" is a property common to every character, independent of configuration, that are necessary for selections lower in the hierarchy. In our example above, selecting a character's alignment doesn't depend on anything, but can modify choices downstream, such as name. Name is common to all characters, and could be added as a configuration-level definition, but in our example we want to be able to choose names for good orcs that are different than names we choose for neutral orcs or neutral humans, and so on.

In the general sense, definitions are data selections that are made before anything else on that level or below in our generation hierarchy is selected, and might influence later selections.

`models` is an array of base-level [Properties](#properties) that are the foundation(s) for specific implementations of the thing you want to generate. If you wanted to write a random treasure generator, your Configuration might hold Models for the various types of loot you wanted to build: weapons, gems, magic scrolls, objets d'art, etc.

The only thing that distinguishes Models from any other Property array is that they're the starting point from which the generator output and key-value map is constructed. 

## Properties

Properties are organizational tools for templates and selection sets, and should generally be used when inline templating would be too complicated or lengthy.

```ts
{
  key: string
  definitions: object
  properties: property[]
  template: string[]
  ...
}
```

`key` is an identifier that lets other objects find this property from the library. A configuration might include `class: ['warrior', 'mage']`, and chargen would look in the library for objects located at `class.warrior` and `class.mage`, whose data objects would have had the keys "warrior" and "mage". These keys must exist and match (chargen will fail on missing property keys). They do not necessarily need to be unique, but identical keys at the same node in the library will overwrite. This might be a useful behavior for generation routines, so it is not checked for explicitly.

The generator can be given an optional parameter to print these keys as section headers. See [Rendering](#rendering)

`definitions` are as described above, and are a dictionary object representing a key-value map capable of selection snytax, eg:
```json
  "definitions": {
    "key": "value",
    "key2": "{inline|selection}",
    "key3": ["array","{selection}","{with|selection|syntax}"]
  }
```

`properties` are other property references, which will be evaluated as children to this property, and contain their own template material, sub properties, etc. A "meal" property might contain sub-properties for "appetizer", "main', "desert", etc, which then might have their own sub-properties.

`templates` are the base template that is rendered for this generation level. A property does not need to contain a template, but without at least one, will not render anything for that level. You could, however, have a property that is just a container for sub-properties, and if those had templates would produce output

aside from those special properties (of which only `key` is required) every other property of this object will be treated as a selection set definition. For example, you might have a property like this:

```json
  {
    "key": "my_property",
    "definitions": {
      "name": "beeftime"
    },
    "templates": [
      "Hello {you}, I am ^%name",
      "{greeting} buddy, {my name is|you can call me} ^%name"
    ],
    "you": ["buddy|pal|friend", "{insult}"],
    "insult": ["dingus", "nerd"],
    "greeting": ["{howdy:1|hey:3}", "sup"]
  }
```

which would produce output like: `Hello nerd, I am Beeftime`, `Hey buddy, you can call me Beeftime`, or `Hello pal, I am Beeftime`. These selection sets (and definitions) are written into both the library and the value map, so any other properties selected during this generation process would replace `%name` with `beeftime` and `{insult}` with a selection from "dingus" or "nerd". Other properties that defined `insult` would add to the possible selection set, which is gathered before the template is evaluated, so if other properties elsewhere in the object expanded the `insult` array, the templates above would be able to choose from that expanded set.

That's a complicated way of explaining that any selection definitions in properties are collected and merged together **before** any templates are evaluated


---

# Known Issues/TODOs
## They/Them grammatical issues
eg: `He agrees`/`They agrees`, `They were`/`He were`, etc. 
