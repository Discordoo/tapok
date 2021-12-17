<p align="center">
<img width="520" src="https://cdn.discordapp.com/attachments/531549268033404928/891388371384029184/ddoologo_new_1.2_banner_tapok.svg" alt="">
</p>

<p align="center">
  <b>
    Discord bots. Simplified and boosted
    <span> · </span>
    <a href="https://docs.discordoo.xyz">Docs & Guide</a>
    <span> · </span>
    <a href="https://github.com/Discordoo/discordoo/blob/develop/CONTRIBUTING.md">Contribute</a>
  </b>
</p>

<p align="center">
  <a href="https://discord.gg/eHC8ynn2H3">
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
```

Examples
-
```shell
$ tapok ./docs.json -c ./typedoc-config.json
# ┗ will generate docs.json using typedoc and then will replace result with ddoo-compatible json file.
$ tapok ./docs.json -e ./typedoc/entry/ts.ts
```
