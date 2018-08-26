# ESM CLI

the es-modules command line interface

Syntax: esm <command>

Commands:
esm help [command]                      shows help information for esm or one of its commands
esm link source-path                    links the dependency from source-path to the current projects es-modules folder

Configuration files are stored in /home/ee/.esm

Registry: https://es-modules.co/
API (http2 only): https://api.es-modules.co/


ESM organizes your modules and its dependecies in a flat structure.
You always know where to find your modules.

my-winning-project/
├── es-modules/
│   ├── vendor
│   │   └── package
│   │       └── version
│   │           └── es-modules -> ../../../../
│   └── distributed-systems
│       └── http2-server
│           ├── x -> ../2.3.19
│           ├── 2.x -> ../2.3.19
│           ├── 2.3.x -> ../2.3.19
│           └── 2.3.19
│               ├── es-modules -> ../../../../
│               └── src
│                   ├── HTT2Server.mjs
│                   ├── Response.mjs
│                   └── Request.mjs
├── src
│   └── MyModule.mjs
└── module.yml
