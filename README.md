# lively4-filesystem-dump

Utility to dump offline meta information for lively4 static file system.

## Install

```
$ npm install --global lively4-filesystem-dump
```

## Usage

```
Usage: lively4-filesystem-dump [options]

        --help, -h
                Displays help information about this script
                'lively4-filesystem-dump.js -h' or 'lively4-filesystem-dump.js --help'

        --ignore, -i
                Patterns to ignore, can be specified multiple times. Default: "node_modules", ".*"

        --list, -l
                Only list exported file paths

        --output, -o
                Path to write dump; STDOUT if undefined

        --pretty, -p
                Output pretty JSON instead of minified
```

## Example

```
$ lively4-filesystem-dump > __meta__.json
```

## License

MIT License (c) Jan Graichen <jgraichen@altimos.de>
