const through2 = require('through2')
import Vinyl = require('vinyl')
import PluginError = require('plugin-error');
const pkginfo = require('pkginfo')(module); // project package.json info into module.exports
const PLUGIN_NAME = module.exports.name;
import * as loglevel from 'loglevel'
const log = loglevel.getLogger(PLUGIN_NAME) // get a logger instance based on the project name
log.setLevel((process.env.DEBUG_LEVEL || 'warn') as log.LogLevelDesc)

import * as mailparser from 'mailparser'
var sp = mailparser.simpleParser // higher-level parser (easier to use, not as efficient)
var string_to_strm = require('string-to-stream')


/** wrap incoming recordObject in a Singer RECORD Message object*/
function createRecord(recordObject:Object, streamName: string) : any {
  return {type:"RECORD", stream:streamName, record:recordObject}
}

/* This is a gulp-etl plugin. It is compliant with best practices for Gulp plugins (see
https://github.com/gulpjs/gulp/blob/master/docs/writing-a-plugin/guidelines.md#what-does-a-good-plugin-look-like ),
and like all gulp-etl plugins it accepts a configObj as its first parameter */
export function tapMime(configObj: any) {
  if (!configObj) configObj = {}

  // creating a stream through which each file will pass - a new instance will be created and invoked for each file 
  // see https://stackoverflow.com/a/52432089/5578474 for a note on the "this" param
const strm = through2.obj(
  async function (this: any, file: Vinyl, encoding: string, cb: Function) {
    let returnErr: any = null

    if (file.isNull()) {
      // return empty file
      return cb(returnErr, file)
    }
    else if (file.isBuffer()) {
      let parsed = await sp(file.contents)
        let parsedMail = createRecord(parsed, "BufferModeStream")
        file.contents = Buffer.from(JSON.stringify(parsedMail))
        // we are done with file processing. Pass the processed file along
        log.debug('calling callback')    
        cb(returnErr, file);    
    }
    else if (file.isStream()) {
      let parsed = await sp(file.contents)
      let parsedMail = createRecord(parsed, "ModeStream")
      file.contents = string_to_strm(JSON.stringify(parsedMail));
      log.debug('calling callback')    
      cb(returnErr, file);
    }
  })

  return strm
}