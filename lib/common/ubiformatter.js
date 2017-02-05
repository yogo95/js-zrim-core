/**
 * Created by enegroycastro on 2017-01-20.
 */

var util = require('util');

var Modes = {
  Searching: 0x100,
  ComputeVar: 0x200,
  NodePercent: 0x201,
  DollarVar: 0x202,
  ExtendedDollarVar: 0x204
};

function _isDollarModeValidName(c) {
  return (c >= '0' && c <= '9') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');
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
    fn("Le %d de %s -> %s", 1254, '5844', {s: 1254});
  }
  var duration = Date.now() - started;
  console.log("End in ", duration);
}
// console.log("STR=" + _format_v1("Le %d de %s -> %j", 1254, '5844', {s: 1254}));
// console.log("STR=" + _format_v1("Le $1 de $1 -> $2", 1254, '5844', {s: 1254}));

// console.log("STR=" + _format_v1("Le ${sb} de $1 -> $2", {s: 1254}, '5844', 123));

// testFormat(format);
testFormat(_format_v1);
// testFormat(util.format);
