# HabroSanitizer

## [22.12.2020] V.2.4.0

### Fetaures

* Added keyboard support for the ban field

### Bugs

* Fixed accessibility for the label

## [20.12.2020] V.2.3.0

### Features

* Added build process for the extension to support same codebase for the Chrome and FireFox. Loading extension directly from the src is still available without build

### Bugs

* Fixed add button not working when clicked directly on SVG element
* Fixed issue with closing body tag for the options page (shame on me!)

## [13.12.2020] V.2.2.0

### Features

* `manifest.json` now supports FireFox, extensions can be loaded for the nightly FireFox build with flag `extensions.langpacks.signatures.required` set to false.

### Features

## [24.11.2020] V.2.1.0

### Features

* Added possibility to hide hubs. If articles belong to any hub from the ban list - it will be hidden even if it belongs to other habs as well

## [19.11.2020] V.2.0.1

### Improvments

* Updated texts to give a clearer overview of the functionality
* Switched from removing the article from the DOM to `display:none` approach for the performance reasons

## [11.07.2020] V.2.0.0

### Breaking Change

* Removed possibility to sanitize block from READING NOW block, see [the issue](https://github.com/Drag13/HabrSanitizer/issues/6)

### Improvments

* New design

### Bugs

* Fixed bug adding non-trimmed names
* Fixed bug with losing focus when author not added due to duplication

## [11.01.2020] V.1.1.1

### Bugs

* Fixed bug when articles were removed from the personal page
* Fixed bug with incorrect logging

## [10.30.2020] V.1.1

### Bugs

* Fixed bug with removing directly opened article. Content will be visible for now even if the author/blog is banned

### Features

* Added functionality to block the whole company
* Added toggle to show/hide links to articles from the READING NOW block

### Improvments

* Added new icon for the extension: !['Deepest thanks to the community'](./src/asset/i19.png). Deepest thanks to the anonymous author.
* Ban list re-ordered from new to old entries
* Removed unnecessary permission for accessing the active tab
