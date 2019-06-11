"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const through2 = require('through2');
const pkginfo = require('pkginfo')(module); // project package.json info into module.exports
const PLUGIN_NAME = module.exports.name;
const loglevel = require("loglevel");
const log = loglevel.getLogger(PLUGIN_NAME); // get a logger instance based on the project name
log.setLevel((process.env.DEBUG_LEVEL || 'warn'));
const mailparser = require("mailparser");
var sp = mailparser.simpleParser; // higher-level parser (easier to use, not as efficient)
var string_to_strm = require('string-to-stream');
/** wrap incoming recordObject in a Singer RECORD Message object*/
function createRecord(recordObject, streamName) {
    return { type: "RECORD", stream: streamName, record: recordObject };
}
/* This is a gulp-etl plugin. It is compliant with best practices for Gulp plugins (see
https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md#what-does-a-good-plugin-look-like ),
and like all gulp-etl plugins it accepts a configObj as its first parameter */
function tapMime(configObj) {
    if (!configObj)
        configObj = {};
    // creating a stream through which each file will pass - a new instance will be created and invoked for each file 
    // see https://stackoverflow.com/a/52432089/5578474 for a note on the "this" param
    const strm = through2.obj(function (file, encoding, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnErr = null;
            if (file.isNull()) {
                // return empty file
                return cb(returnErr, file);
            }
            else if (file.isBuffer()) {
                let parsed = yield sp(file.contents);
                let parsedMail = createRecord(parsed, "TapMimeBufferMode");
                file.contents = Buffer.from(JSON.stringify(parsedMail));
                // we are done with file processing. Pass the processed file along
                log.debug('calling callback');
                cb(returnErr, file);
            }
            else if (file.isStream()) {
                let parsed = yield sp(file.contents);
                let parsedMail = createRecord(parsed, "TapMimeStreamMode");
                file.contents = string_to_strm(JSON.stringify(parsedMail));
                // we are done with file processing. Pass the processed file along
                log.debug('calling callback');
                cb(returnErr, file);
            }
        });
    });
    return strm;
}
exports.tapMime = tapMime;
//# sourceMappingURL=plugin.js.map