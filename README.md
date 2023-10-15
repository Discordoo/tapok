<p align="center">
<img width="520" src="https://cdn.ddoo.dev/github/ddoologo_new_1.2_banner_tapok.svg" alt="">
</p>

<p align="center">
  <b>
    Discord bots. Simplified and boosted
    <span> · </span>
    <a href="https://ddoo.dev">Docs & Guide</a>
    <span> · </span>
    <a href="https://github.com/ddoodev/discordoo/blob/develop/CONTRIBUTING.md">Contribute</a>
  </b>
</p>

<p align="center">
  <a href="https://ddoo.dev/discord">
    <img 
      src="https://img.shields.io/discord/811663819721539674?color=7280DA&label=Discord&logo=discord&logoColor=white" 
      alt="Online"
    >
  </a>
</p>
<hr>

# Discordoo documentation generator (generates json file)

Big thanks
=
to [Federico Grandi](https://github.com/EndBug). The author of [this](https://github.com/dbots-pkg/ts-docgen) package. This repository is based on this person's code. [Sponsor Federico Grandi](https://github.com/sponsors/EndBug).

Usage
-
```shell
$ tapok path/to/typedoc-result.json
$ tapok path/to/markdown-contents-file.json
```

Flags
-
```shell
--config -c     string    typedoc config (like typedoc.json)
--entry -e      string    typedoc entry point (used in typedoc --entry)
--markdown -m   boolean   switch to markdown files processing
--directory -d  string    directory where read markdown files
--include -i    string    include non-exported types or not
```

Examples
-
```shell
$ tapok ./docs.json -c ./typedoc-config.json -e typedoc/entry/point.ts
# ┗ will generate docs.json using typedoc and then will replace result with ddoo-compatible json file.
$ tapok ./markdown.json -m -d ./docs
# ┗ will generate markdown.json that contains array of markdown files from docs directory
```
