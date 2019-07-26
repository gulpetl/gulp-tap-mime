# gulp-tap-mime #

This is a [gulp](https://gulpjs.com/) plugin.
This plugin converts MIME (Email) files to **JSON files**. It is a **gulp** wrapper for [mailparser](https://nodemailer.com/extras/mailparser/).

### Usage
The configObj will contain any info the plugin needs. For this plugin the configObj can have three options which may ne true or false:
<ul>
    <li><b>keepCidLinks: Boolean </b>- optionally choosing if the embeded links in images are to be kept or not. If its true it will keep cidLinks and if its false, it will get rid of them, defaults to true
    <li><b>ResendableJSON: Boolean</b> - optionally choosing if you want to resend the email/forward it, so it gets changed to the format of Mail Composing System and run a convertor to do that. If its true it will run the convertor and if its false, it will not run the convertor, defaults to false
    <li><b>ExtractAttachments: Boolean</b> - optionally choosing if the attachments coming in are reurned as separate files or stored in the JSON object and passed on in the gulpStream. If its true it will save the files and take the attachment object out of the JSON object and if its false, it will not save the files and keep the attachment object in the JSON object, defaults to true
</ul>


##### Sample gulpfile.js
```
/* parse all .MIME files in a folder into Message Stream files in a different folder */

let gulp = require('gulp')
var tapMime = require('gulp-etl-tap-mime').tapMime

exports.default = function() {
    return gulp.src('data/*.eml')
    .pipe(tapMime({ResendableJSON: true, ExtractAttachments: true})) 
    .pipe(gulp.dest('output/'));
}
```
### Quick Start for Coding on This Plugin
* Dependencies: 
    * [git](https://git-scm.com/downloads)
    * [nodejs](https://nodejs.org/en/download/releases/) - At least v6.3 (6.9 for Windows) required for TypeScript debugging
    * npm (installs with Node)
    * typescript - installed as a development dependency
* Clone this repo and run `npm install` to install npm packages
* Debug: with [VScode](https://code.visualstudio.com/download) use `Open Folder` to open the project folder, then hit F5 to debug. This runs without compiling to javascript using [ts-node](https://www.npmjs.com/package/ts-node)
* Test: `npm test` or `npm t`
* Compile to javascript: `npm run build`

### Testing

We are using [Jest](https://facebook.github.io/jest/docs/en/getting-started.html) for our testing. Each of our tests are in the `test` folder.

- Run `npm test` to run the test suites



Note: This document is written in [Markdown](https://daringfireball.net/projects/markdown/). We like to use [Typora](https://typora.io/) and [Markdown Preview Plus](https://chrome.google.com/webstore/detail/markdown-preview-plus/febilkbfcbhebfnokafefeacimjdckgl?hl=en-US) for our Markdown work..
