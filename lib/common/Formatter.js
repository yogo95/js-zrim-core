/**
 * Created by enegroycastro on 2017-01-20.
 */

var util = require('util');

var Modes = {
  Searching: 0x100,
  Text: 0x100,
  ComputeVar: 0x200,
  NodePercent: 0x201,
  DollarVar: 0x202,
  ExtendedDollarVar: 0x204
};

function _isDollarModeValidName(c) {
  return (c >= 48 && c <= 57) || (c >= 64 && c <= 90) || (c >= 97 && c <= 122);
}

var charCodes = {
  backSlash: 92,
  dollar: 36,
  percent: 37,
  openCurly: 123,
  closeCurly: 125
};

/**
 *
 * @param {string} fmt
 * @return {string}
 * @private
 */
function _format_v2(fmt) {

  var i = 0, l = fmt.length, e = l - 1,
    c = 0,
    switchType = Modes.Text
    ;

  var parts = [],
    currentPart = {
      start: 0,
      end: 0,
      type: Modes.Text
    }
    ;

  var argObj = typeof arguments[1] === 'object' ? arguments[1] : {};

  for(;i < l; ++i) {
    c = fmt.charCodeAt(i);
    if (c === charCodes.backSlash) {
      if (currentPart.type !== Modes.ExtendedDollarVar && currentPart.type !== Modes.Searching) {
        // New part
        parts.push({
          start: currentPart.start,
          end: i,
          type: currentPart.type
        });

        currentPart.start = i + 1;
        currentPart.type = Modes.Text;
      }
    } else if ((currentPart.type & Modes.ComputeVar) === Modes.ComputeVar) {
      // We start a variable
      switch (currentPart.type) {
        case Modes.NodePercent:
          parts.push({
            start: currentPart.start,
            end: i,
            type: currentPart.type,
            percentCharTypeCode: c
          });

          currentPart.start = i + 1;
          currentPart.type = Modes.Text;
          continue;
        case Modes.DollarVar:
          if (currentPart.start === (i - 1) && c === charCodes.openCurly) {
            // Pass to extended mode
            currentPart.type = Modes.ExtendedDollarVar;
          } else {
            if (!_isDollarModeValidName(c)) {
              if (currentPart.start === (i - 1)) {
                // Change to text mode
                currentPart.type = Modes.Text;
              } else {
                parts.push({
                  start: currentPart.start,
                  end: i - 1,
                  type: currentPart.type
                });

                currentPart.start = i;
                currentPart.type = Modes.Text;
              }
            }
          }
          break;
        case Modes.ExtendedDollarVar:
          if (c === charCodes.closeCurly) {
            parts.push({
              start: currentPart.start,
              end: i,
              type: currentPart.type
            });

            currentPart.start = i + 1;
            currentPart.type = Modes.Text;
            continue;
          }
          break;
        default:
          currentPart.type = Modes.Text;
          break;
      }
    } else {
      // Searching mode
      switch (c) {
        case charCodes.percent:
          switchType = Modes.NodePercent;
          break;
        case charCodes.dollar:
          switchType = Modes.DollarVar;
          break;
        default:
          switchType = Modes.Text;
          break;
      }

      if (switchType !== currentPart.type) {
        if (currentPart.start === i) {
          currentPart.type = switchType;
        } else {
          parts.push({
            start: currentPart.start,
            end: i - 1,
            type: currentPart.type
          });

          currentPart.type = switchType;
          currentPart.start = i;
        }
      }
    }

    if (i >= e) {
      // Nothing to do more
      if (currentPart.start === i) {
        // One part of test
        parts.push({
          start: currentPart.start,
          end: i,
          type: Modes.Text
        });
      } else {
        parts.push({
          start: currentPart.start,
          end: i,
          // If extend dollar back to simple text
          type: currentPart.type === Modes.ExtendedDollarVar ? Modes.Text : currentPart.type
        });
      }
    }
  }

  var str = "";
  var currentPercentIndex = 1;
  var dollarIndex, dollarName;
  var tmp;
  for (i = 0, l = parts.length; i < l; ++i) {
    currentPart = parts[i];
    switch (currentPart.type) {
      case Modes.NodePercent:
        switch (currentPart.percentCharTypeCode) {
          case charCodes.percent:
            str += '%';
            break;
          case 68:
          case 100:
            // %d
            str += Number(arguments[currentPercentIndex]);
            break;
          case 83:
          case 115:
            // %s
            str += _convertToString(arguments[currentPercentIndex]);
            break;
          case 74:
          case 106:
            // %j
            str += _convertToJson(arguments[currentPercentIndex]);
            break;
          default:
            // As string
            str += _convertToString(arguments[currentPercentIndex]);
            break;
        }
        ++currentPercentIndex;
        break;
      case Modes.DollarVar:
        dollarName = fmt.slice(currentPart.start + 1, currentPart.end + 1);
        dollarIndex = parseInt(dollarName);
        if (isNaN(dollarIndex)) {
          tmp = argObj[dollarName];
        } else {
          tmp = arguments[dollarIndex + 1];
        }

        str += _convertToString(tmp);

        break;
      case Modes.ExtendedDollarVar:
        dollarName = fmt.slice(currentPart.start + 2, currentPart.end);
        str += _convertToString(argObj[dollarName]);
        break;
      default:
        str += fmt.slice(currentPart.start, currentPart.end + 1);
        break;
    }
  }

  return str;
}

function _convertToString(v) {
  switch (typeof v) {
    case 'string':
      return v;
    case 'number':
      return v;
    case 'object':
      return "[object]";
    case 'function':
      return "[function]";
    default:
      return String(v);
  }
}

function _convertToJson(o) {
  try {
    return JSON.stringify(o);
  } catch (unexpectedError) {
    return "[Circular]";
  }
}

function _format_v1(fmt) {

  var i = 0, l = fmt.length,
    c = '',
    mode = Modes.Searching,
    escaped = false,
    str = "",
    varPart = "" // Keep the part in case of write it back
    ;

  var nodePercentContent = {
    argIndex: 1
  };

  var dollarOptions = {
    startArgIndex: 1,
    args: arguments,
    argsWithName: arguments[1]
  };

  for(;i < l; ++i) {
    c = fmt[i];
    if (escaped) {
      escaped = false;
      if (mode & Modes.ComputeVar === Modes.ComputeVar) {
        varPart += c;
      } else {
        str += c;
      }
    } else if (c === '\\') {
      escaped = true;
      if (mode !== Modes.ExtendedDollarVar && mode !== Modes.Searching) {
        // Write back the part
        str += varPart;
        varPart = "";
        mode = Modes.Searching;
      }
    } else if ((mode & Modes.ComputeVar) === Modes.ComputeVar) {
      switch (mode) {
        case Modes.NodePercent:
          if (c === '%') {
            str += '%';
          } else {
            str += formatArgs(c, arguments[nodePercentContent.argIndex]);
            ++nodePercentContent.argIndex;
          }
          varPart = "";
          mode = Modes.Searching;
          break;
        case Modes.DollarVar:
          varPart += c;
          if (varPart.length === 2 && c === '{') {
            // Pass to extended mode
            mode = Modes.ExtendedDollarVar;
          } else {
            if (!_isDollarModeValidName(c)) {
              // End the parse

              // Parse the name
              str += _formatArgDollar(varPart, dollarOptions);

              // Still need to add the c
              varPart = "";
              str += c;
              mode = Modes.Searching;
            }
          }
          break;
        case Modes.ExtendedDollarVar:
          varPart += c;
          if (c === '}') {
            // Parse
            str += _formatArgExtendedDollar(varPart, dollarOptions);

            varPart = "";
            mode = Modes.Searching;
          }
          break;
        default:
          // Do not know how to do it then back to normal
          str += varPart;
          str += c;
          varPart = "";
          mode = Modes.Searching;
          break;
      }
    } else {
      // Searching mode
      switch (c) {
        case '%':
          varPart = c;
          mode = Modes.NodePercent;
          break;
        case '$':
          varPart = c;
          mode = Modes.DollarVar;
          break;
        default:
          str += c;
          break;
      }
    }
  }

  if (varPart.length > 0) {
    // We were in the var case mode
    switch (mode) {
      case Modes.NodePercent:
        str += varPart;
        break;
      case Modes.DollarVar:
        if (varPart.length === 1) {
          // We only have the $
          str += varPart;
        } else {
          // Try to parse it
          str += _formatArgDollar(varPart, dollarOptions);
        }
        break;
      case Modes.ExtendedDollarVar:
        // Did not close the extended mode, then just copy
        str += varPart;
        break;
      default:
        str += varPart;
        break;
    }
  }

  return str;
}

function _formatArgDollar(rawName, options) {
  if (rawName.length === 1) {
    return '$';
  }

  var name = rawName.substring(1),
    numberName = parseInt(name)
    ;

  if (isNaN(numberName)) {
    return options.argsWithName[name];
  } else {
    return options.args[options.startArgIndex + numberName];
  }
}

function _formatArgExtendedDollar(rawName, options) {
  var name = rawName.substring(2, rawName.length - 1);
  if (name.length === 0) {
    return "";
  }

  return options.argsWithName[name];
}


function format(fmt) {
  if (typeof fmt !== 'string') {
    return "";
  }

  var i = 0,
    l = fmt.length,
    escaped = false,
    c = '',
    ret = "",
    p = false,
    argIndex = 1
    ;

  while (i < l) {
    c = fmt[i];
    if (escaped) {
      ret += c;
      escaped = false;
    } else if (c === '\\') {
      escaped = true;
    } else if (p) {
      ret += formatArgs(c, arguments[argIndex++]);
      p = false;
    } else if (c === '%') {
      p = true;
    } else {
      ret += c;
    }

    ++i;
  }

  if (p) {
    ret += '%';
  }

  return ret;
}

function formatArgs(code, arg) {
  switch (code) {
    case '%':
      return '%';
    case 'd':
      return Number(arg);
    case 's':
      return String(arg);
    case 'j':
      try {
        return JSON.stringify(arg);
      } catch (unexpectedError) {
        return "[Circular]";
      }
    default:
      return String(arg);
  }
}

function testFormat(fn, n) {
  var started = Date.now();
  if (!n) {
    n = 900000;
  }
  for (var i = 0; i < n; ++i) {
    fn("Le %d de %s -> %j", 1254, '5844', {s: 1254});
  }
  var duration = Date.now() - started;
  console.log("End in ", duration);
}

var testFormat_v1 = testFormat;

function testFormat_v2(fn, n) {
  var started = Date.now();
  if (!n) {
    n = 900000;
  }
  for (var i = 0; i < n; ++i) {
    fn("Le ${theNameOfTheFirst} prix %j de $2 est %d ${NotFoundVarName}", {
        theNameOfTheFirst: 'osghdofhosdhofh'
      },
      147852,
      "test"
    );
  }
  var duration = Date.now() - started;
  console.log("End in ", duration);
}

function testFormat_v3(fn, n) {
  var started = Date.now();
  if (!n) {
    n = 900000;
  }
  for (var i = 0; i < n; ++i) {
    fn("Le $0 prix $1 de $2 est $1 $0", {
        theNameOfTheFirst: 'osghdofhosdhofh'
      },
      147852,
      "test"
    );
  }
  var duration = Date.now() - started;
  console.log("End in ", duration);
}

// console.log("STR=" + _format_v1("Le %d de %s -> %j", 1254, '5844', {s: 1254}));
// console.log("STR=" + _format_v1("Le $1 de $1 -> $2", 1254, '5844', {s: 1254}));

// console.log("STR=" + _format_v1("Le ${sb} de $1 -> $2", {s: 1254}, '5844', 123));
// console.log("STR=" + _format_v2("Le ${s} de $1 -> %s $2 ${dd", {s: 1254}, '5844', 123));

// console.log("MS=" + (new Date().getUTCMilliseconds() / 1000).toFixed(3).slice(2, 5));

// testFormat(format);
// testFormat(_format_v1);
// testFormat_v1(_format_v2);
// testFormat_v2(_format_v2);
testFormat_v3(_format_v2);
// testFormat(util.format);
