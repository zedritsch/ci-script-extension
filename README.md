# CI-Script for VS Code and other TextMate based editors
## Features
* Syntax highlighting
* Icons for `.cis`/`.ris` files

## Building
### From Editor
Go to Terminal (menubar) and select `Run Build Task...` (or press `CTRL`+`SHIFT`+`B`)

### Command Palette
Press `F1` (or `CTRL`+`SHIFT`+`P`) and type `Run Build Task...`

### Or Terminal
```sh
vsce package
```

## Installation
### JetBrains IDEs
Guide from the [PyCharm Documentation](https://www.jetbrains.com/help/pycharm/tutorial-using-textmate-bundles.html#importing-bundles)

1. Go to the settings dialog (`CTRL`+`ALT`+`S`), and under `Editor` select `TextMate Bundles`
2. Click the add button (`+`) and locate the **extracted** `.zip`-folder on your disk
3. Then press `OK` to apply the changes

### VS Code
Go to the extensions tab (`CTRL`+`SHIFT`+`X`), more options (`...`) and select `Install from VSIX...`

Alternative press `F1` (or `CTRL`+`SHIFT`+`P`) and type `Install from VSIX...`

Or use the terminal:

**Visual Studio Code**
```sh
code --install-extension <extension_path>
```

**VSCodium**
```sh
codium --install-extension <extension_path>
```

## Contributing
Contributions to this project are always welcome! If you want to add or change anything, feel free to `fork` this repository. After applying your changes, create a `pull request` with a meaningful title and detailed description. Also, please make sure to pay attention to `requested changes` and `reviews` from other contributors. Thanks in advance!