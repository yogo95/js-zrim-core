/**
 * Created by yogo95 on 17-01-23.
 */

var Modes = {
  SearchVar: Symbol(),
  ComputeVar: Symbol(),
  DollarFound: Symbol(),
  PercentFound: Symbol()
};

var FormatType = {
  NodePercent: Symbol(),
  DollarVarName: Symbol(),
  DollarIndes: Symbol()
};

function _isStringNumber(str) {
  for (var i = 0, l = str.length; i < l; ++i) {
    if (!(str[i] >= '0' && str[i] <= '9')) {
      return false;
    }
  }

  return str.length > 0;
}

function _isCharNumber(c) {
  return c >= '0' && c <= '9';
}

function _extractPartInformation(part, partInfo) {
  partInfo.name = part;
}

function _format_v1(fmt, args) {

  var parts = [];

  var i = 0, l = fmt.length,
    c = '',
    escaped = false,
    mode = Modes.SearchVar,
    currentPart = undefined,
    percentArgIndex = 0
  ;

  while (i < l) {
    c = fmt[i];

    if (escaped) {
      escaped = false;
    } else if (c === '\\') {
      escaped = true;
    } else if (mode === Modes.DollarFound) {
      if (c === '{') {
        mode = Modes.ComputeVar;
        currentPart.type = FormatType.DollarVarName;
      } else {
        mode = Modes.SearchVar; // Back to search
        currentPart = undefined;
      }
    } else if (mode === Modes.PercentFound) {
      mode = Modes.SearchVar;
      currentPart.end = i;
      currentPart.type = FormatType.NodePercent;
      currentPart.percentType = c;
      currentPart.percentArgIndex = percentArgIndex;
      ++percentArgIndex;
      parts.push(currentPart);
      currentPart = undefined;
    } else if (mode === Modes.ComputeVar) {
      if (c === '}') {
        mode = Modes.SearchVar;
        currentPart.end = i;
        currentPart.raw = fmt.substring(currentPart.start + 2, i);
        _extractPartInformation(currentPart.raw, currentPart);
        parts.push(currentPart);
        currentPart = undefined;
      }
    } else {
      if (c === '$') {
        mode = Modes.DollarFound;
        currentPart = {
          start: i
        };
      } else if (c === '%') {
        mode = Modes.PercentFound;
        currentPart = {
          start: i
        };
      }
    }

    ++i;
  }

  if (parts.length === 0) {
    return fmt;
  }

  var previousIndex = 0,
    part = undefined,
    str = ""
  ;
  for (i = 0, l = parts.length; i < l; ++i) {
    part = parts[i];
    str += fmt.substring(previousIndex, part.start);
    previousIndex = part.end + 1;

    // replace
    if (part.type === FormatType.NodePercent) {
      str += arguments[part.percentArgIndex + 1];
    } else {
      str += args[part.name];
    }

    // console.log('part[' + i + ']=' + part.name);
  }

  if (previousIndex < fmt.length) {
    str += fmt.substring(previousIndex);
  }

  console.log(str);
  //
  // console.log(JSON.stringify(parts, undefined, 2));
  //
  //
  // for (i = 0, l = parts.length; i < l; ++i) {
  //   console.log("part[", i, "]=", fmt.substr(parts[i].start, parts[i].end));
  // }

}


_format_v1("Test ${a} to ${b}", {
  a: '1234',
  b: 'zaxs'
});

_format_v1("Test %s to %s", 1234, 'zaxs');

