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
const Vinyl = require("vinyl");
const pkginfo = require('pkginfo')(module); // project package.json info into module.exports
const PLUGIN_NAME = module.exports.name;
const loglevel = require("loglevel");
const log = loglevel.getLogger(PLUGIN_NAME); // get a logger instance based on the project name
log.setLevel((process.env.DEBUG_LEVEL || 'warn'));
const mailparser = require("mailparser");
var sp = mailparser.simpleParser; // higher-level parser (easier to use, not as efficient)
var string_to_strm = require('string-to-stream');
const replaceExt = require("replace-ext");
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
    let keepCidLinks = (configObj.keepCidLinks !== null) ? configObj.keepCidLinks : undefined;
    let ResendableJSON = (configObj.ResendableJSON !== null) ? configObj.ResendableJSON : false;
    let ExtractAttachments = (configObj.ExtractAttachments !== null) ? configObj.ExtractAttachments : true;
    // creating a stream through which each file will pass - a new instance will be created and invoked for each file 
    // see https://stackoverflow.com/a/52432089/5578474 for a note on the "this" param
    const strm = through2.obj(function (file, encoding, cb) {
        return __awaiter(this, void 0, void 0, function* () {
            let returnErr = null;
            const self = this;
            function convertor(MailObject) {
                //for headers
                MailObject.headers = MailObject.headerLines;
                delete MailObject.headerLines;
                for (var i = 0; i < MailObject.headers.length; i++) {
                    //MailObject.headers[i].key = ""
                    var index = MailObject.headers[i].line.indexOf(":");
                    var NewKeyValue = MailObject.headers[i].line.slice(0, index);
                    MailObject.headers[i].key = NewKeyValue;
                    MailObject.headers[i].line = MailObject.headers[i].line.slice(index + 2);
                    MailObject.headers[i].value = MailObject.headers[i].line;
                    delete MailObject.headers[i].line;
                }
                //for attachments
                let attachmentIdx = Object.keys(MailObject).indexOf("attachments");
                if (attachmentIdx > -1 && MailObject.attachments.length > 0) {
                    for (var i = 0; i < MailObject.attachments.length; i++) {
                        MailObject.attachments[i].content = MailObject.attachments[i].content;
                    }
                }
                //for from 
                if (MailObject.from)
                    MailObject.from = MailObject.from.value;
                //for to
                if (MailObject.to)
                    MailObject.to = MailObject.to.value;
            }
            function extractAttachments(attachments, stream) {
                if (attachments.length > 0) {
                    if (Array.isArray(attachments)) {
                        for (var i = 0; i < attachments.length; i++) {
                            stream.push(new Vinyl({
                                path: attachments[i].filename,
                                contents: attachments[i].content
                            }));
                        }
                    }
                    else if (attachments) {
                        stream.push(new Vinyl({
                            path: attachments.filename,
                            contents: attachments.content
                        }));
                    }
                }
            }
            if (file.isNull()) {
                // return empty file
                return cb(returnErr, file);
            }
            else if (file.isBuffer()) {
                let parsed;
                if (keepCidLinks) {
                    parsed = yield sp(file.contents, { keepCidLinks: keepCidLinks });
                }
                else {
                    parsed = yield sp(file.contents);
                }
                let parsedMail = createRecord(parsed, "TapMimeBufferMode");
                if (ResendableJSON) {
                    convertor(parsedMail.record);
                }
                if (ExtractAttachments) {
                    extractAttachments(parsedMail.record.attachments, self);
                    parsedMail.record.attachments = [];
                }
                file.contents = Buffer.from(JSON.stringify(parsedMail));
                file.path = replaceExt(file.path, '.JSON');
                // we are done with file processing. Pass the processed file along
                log.debug('calling callback');
                cb(returnErr, file);
            }
            else if (file.isStream()) {
                let parsed;
                if (keepCidLinks) {
                    parsed = yield sp(file.contents, { keepCidLinks: keepCidLinks });
                }
                else {
                    parsed = yield sp(file.contents);
                }
                let parsedMail = createRecord(parsed, "TapMimeStreamMode");
                if (ResendableJSON) {
                    convertor(parsedMail.record);
                }
                if (ExtractAttachments) {
                    extractAttachments(parsedMail.record.attachments, self);
                    parsedMail.record.attachments = [];
                }
                file.contents = string_to_strm(JSON.stringify(parsedMail));
                file.path = replaceExt(file.path, '.JSON');
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