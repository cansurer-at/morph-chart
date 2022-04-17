function _interopDefault (ex) { return (ex && (typeof ex === 'object') && 'default' in ex) ? ex['default'] : ex; }

var React = require('react');
var React__default = _interopDefault(React);
var shape = require('d3-shape');
var d3Scale = require('d3-scale');
var parseSVG = _interopDefault(require('parse-svg-path'));
var absSVG = _interopDefault(require('abs-svg-path'));
var d3InterpolatePath = require('d3-interpolate-path');

var cubicBezier = function cubicBezier(t, from, c1, c2, to) {
  "worklet";

  var term = 1 - t;
  var a = 1 * Math.pow(term, 3) * Math.pow(t, 0) * from;
  var b = 3 * Math.pow(term, 2) * Math.pow(t, 1) * c1;
  var c = 3 * Math.pow(term, 1) * Math.pow(t, 2) * c2;
  var d = 1 * Math.pow(term, 0) * Math.pow(t, 3) * to;
  return a + b + c + d;
};
var round = function round(value, precision) {
  "worklet";

  if (precision === void 0) {
    precision = 0;
  }

  var p = Math.pow(10, precision);
  return Math.round(value * p) / p;
};

var cuberoot = function cuberoot(x) {
  "worklet";

  var y = Math.pow(Math.abs(x), 1 / 3);
  return x < 0 ? -y : y;
};

var solveCubic = function solveCubic(a, b, c, d) {
  "worklet";

  if (Math.abs(a) < 1e-8) {
    a = b;
    b = c;
    c = d;

    if (Math.abs(a) < 1e-8) {
      a = b;
      b = c;

      if (Math.abs(a) < 1e-8) {
        return [];
      }

      return [-b / a];
    }

    var D = b * b - 4 * a * c;

    if (Math.abs(D) < 1e-8) {
      return [-b / (2 * a)];
    } else if (D > 0) {
      return [(-b + Math.sqrt(D)) / (2 * a), (-b - Math.sqrt(D)) / (2 * a)];
    }

    return [];
  }

  var p = (3 * a * c - b * b) / (3 * a * a);
  var q = (2 * b * b * b - 9 * a * b * c + 27 * a * a * d) / (27 * a * a * a);
  var roots;

  if (Math.abs(p) < 1e-8) {
    roots = [cuberoot(-q)];
  } else if (Math.abs(q) < 1e-8) {
    roots = [0].concat(p < 0 ? [Math.sqrt(-p), -Math.sqrt(-p)] : []);
  } else {
    var _D = q * q / 4 + p * p * p / 27;

    if (Math.abs(_D) < 1e-8) {
      roots = [-1.5 * q / p, 3 * q / p];
    } else if (_D > 0) {
      var u = cuberoot(-q / 2 - Math.sqrt(_D));
      roots = [u - p / (3 * u)];
    } else {
      var _u = 2 * Math.sqrt(-p / 3);

      var t = Math.acos(3 * q / p / _u) / 3;
      var k = 2 * Math.PI / 3;
      roots = [_u * Math.cos(t), _u * Math.cos(t - k), _u * Math.cos(t - 2 * k)];
    }
  }

  for (var i = 0; i < roots.length; i++) {
    roots[i] -= b / (3 * a);
  }

  return roots;
};

var cubicBezierYForX = function cubicBezierYForX(x, a, b, c, d, precision) {
  "worklet";

  if (precision === void 0) {
    precision = 2;
  }

  var pa = -a.x + 3 * b.x - 3 * c.x + d.x;
  var pb = 3 * a.x - 6 * b.x + 3 * c.x;
  var pc = -3 * a.x + 3 * b.x;
  var pd = a.x - x;
  var t = solveCubic(pa, pb, pc, pd).map(function (root) {
    return round(root, precision);
  }).filter(function (root) {
    return root >= 0 && root <= 1;
  })[0];
  return cubicBezier(t, a.y, b.y, c.y, d.y);
};
var mapValues = function mapValues(value, inputRange, outputRange) {
  var leftSpan = inputRange[1] - inputRange[0];
  var rightSpan = outputRange[1] - outputRange[0];
  var valueScaled = (value - inputRange[0]) / leftSpan;
  return outputRange[0] + valueScaled * rightSpan;
};
var relativePercent = function relativePercent(price, startPrice) {
  var increase = price - startPrice;
  var change = increase / startPrice;
  return change;
};

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var TAU = Math.PI * 2;

var mapToEllipse = function mapToEllipse(_ref, rx, ry, cosphi, sinphi, centerx, centery) {
  var x = _ref.x,
      y = _ref.y;

  x *= rx;
  y *= ry;

  var xp = cosphi * x - sinphi * y;
  var yp = sinphi * x + cosphi * y;

  return {
    x: xp + centerx,
    y: yp + centery
  };
};

var approxUnitArc = function approxUnitArc(ang1, ang2) {
  // If 90 degree circular arc, use a constant
  // as derived from http://spencermortensen.com/articles/bezier-circle
  var a = ang2 === 1.5707963267948966 ? 0.551915024494 : ang2 === -1.5707963267948966 ? -0.551915024494 : 4 / 3 * Math.tan(ang2 / 4);

  var x1 = Math.cos(ang1);
  var y1 = Math.sin(ang1);
  var x2 = Math.cos(ang1 + ang2);
  var y2 = Math.sin(ang1 + ang2);

  return [{
    x: x1 - y1 * a,
    y: y1 + x1 * a
  }, {
    x: x2 + y2 * a,
    y: y2 - x2 * a
  }, {
    x: x2,
    y: y2
  }];
};

var vectorAngle = function vectorAngle(ux, uy, vx, vy) {
  var sign = ux * vy - uy * vx < 0 ? -1 : 1;

  var dot = ux * vx + uy * vy;

  if (dot > 1) {
    dot = 1;
  }

  if (dot < -1) {
    dot = -1;
  }

  return sign * Math.acos(dot);
};

var getArcCenter = function getArcCenter(px, py, cx, cy, rx, ry, largeArcFlag, sweepFlag, sinphi, cosphi, pxp, pyp) {
  var rxsq = Math.pow(rx, 2);
  var rysq = Math.pow(ry, 2);
  var pxpsq = Math.pow(pxp, 2);
  var pypsq = Math.pow(pyp, 2);

  var radicant = rxsq * rysq - rxsq * pypsq - rysq * pxpsq;

  if (radicant < 0) {
    radicant = 0;
  }

  radicant /= rxsq * pypsq + rysq * pxpsq;
  radicant = Math.sqrt(radicant) * (largeArcFlag === sweepFlag ? -1 : 1);

  var centerxp = radicant * rx / ry * pyp;
  var centeryp = radicant * -ry / rx * pxp;

  var centerx = cosphi * centerxp - sinphi * centeryp + (px + cx) / 2;
  var centery = sinphi * centerxp + cosphi * centeryp + (py + cy) / 2;

  var vx1 = (pxp - centerxp) / rx;
  var vy1 = (pyp - centeryp) / ry;
  var vx2 = (-pxp - centerxp) / rx;
  var vy2 = (-pyp - centeryp) / ry;

  var ang1 = vectorAngle(1, 0, vx1, vy1);
  var ang2 = vectorAngle(vx1, vy1, vx2, vy2);

  if (sweepFlag === 0 && ang2 > 0) {
    ang2 -= TAU;
  }

  if (sweepFlag === 1 && ang2 < 0) {
    ang2 += TAU;
  }

  return [centerx, centery, ang1, ang2];
};

var arcToBezier = function arcToBezier(_ref2) {
  var px = _ref2.px,
      py = _ref2.py,
      cx = _ref2.cx,
      cy = _ref2.cy,
      rx = _ref2.rx,
      ry = _ref2.ry,
      _ref2$xAxisRotation = _ref2.xAxisRotation,
      xAxisRotation = _ref2$xAxisRotation === undefined ? 0 : _ref2$xAxisRotation,
      _ref2$largeArcFlag = _ref2.largeArcFlag,
      largeArcFlag = _ref2$largeArcFlag === undefined ? 0 : _ref2$largeArcFlag,
      _ref2$sweepFlag = _ref2.sweepFlag,
      sweepFlag = _ref2$sweepFlag === undefined ? 0 : _ref2$sweepFlag;

  var curves = [];

  if (rx === 0 || ry === 0) {
    return [];
  }

  var sinphi = Math.sin(xAxisRotation * TAU / 360);
  var cosphi = Math.cos(xAxisRotation * TAU / 360);

  var pxp = cosphi * (px - cx) / 2 + sinphi * (py - cy) / 2;
  var pyp = -sinphi * (px - cx) / 2 + cosphi * (py - cy) / 2;

  if (pxp === 0 && pyp === 0) {
    return [];
  }

  rx = Math.abs(rx);
  ry = Math.abs(ry);

  var lambda = Math.pow(pxp, 2) / Math.pow(rx, 2) + Math.pow(pyp, 2) / Math.pow(ry, 2);

  if (lambda > 1) {
    rx *= Math.sqrt(lambda);
    ry *= Math.sqrt(lambda);
  }

  var _getArcCenter = getArcCenter(px, py, cx, cy, rx, ry, largeArcFlag, sweepFlag, sinphi, cosphi, pxp, pyp),
      _getArcCenter2 = _slicedToArray(_getArcCenter, 4),
      centerx = _getArcCenter2[0],
      centery = _getArcCenter2[1],
      ang1 = _getArcCenter2[2],
      ang2 = _getArcCenter2[3];

  // If 'ang2' == 90.0000000001, then `ratio` will evaluate to
  // 1.0000000001. This causes `segments` to be greater than one, which is an
  // unecessary split, and adds extra points to the bezier curve. To alleviate
  // this issue, we round to 1.0 when the ratio is close to 1.0.


  var ratio = Math.abs(ang2) / (TAU / 4);
  if (Math.abs(1.0 - ratio) < 0.0000001) {
    ratio = 1.0;
  }

  var segments = Math.max(Math.ceil(ratio), 1);

  ang2 /= segments;

  for (var i = 0; i < segments; i++) {
    curves.push(approxUnitArc(ang1, ang2));
    ang1 += ang2;
  }

  return curves.map(function (curve) {
    var _mapToEllipse = mapToEllipse(curve[0], rx, ry, cosphi, sinphi, centerx, centery),
        x1 = _mapToEllipse.x,
        y1 = _mapToEllipse.y;

    var _mapToEllipse2 = mapToEllipse(curve[1], rx, ry, cosphi, sinphi, centerx, centery),
        x2 = _mapToEllipse2.x,
        y2 = _mapToEllipse2.y;

    var _mapToEllipse3 = mapToEllipse(curve[2], rx, ry, cosphi, sinphi, centerx, centery),
        x = _mapToEllipse3.x,
        y = _mapToEllipse3.y;

    return { x1: x1, y1: y1, x2: x2, y2: y2, x: x, y: y };
  });
};

function normalize(path){
  // init state
  var prev;
  var result = [];
  var bezierX = 0;
  var bezierY = 0;
  var startX = 0;
  var startY = 0;
  var quadX = null;
  var quadY = null;
  var x = 0;
  var y = 0;

  for (var i = 0, len = path.length; i < len; i++) {
    var seg = path[i];
    var command = seg[0];

    switch (command) {
      case 'M':
        startX = seg[1];
        startY = seg[2];
        break
      case 'A':
        var curves = arcToBezier({
          px: x,
          py: y,
          cx: seg[6],
          cy:  seg[7],
          rx: seg[1],
          ry: seg[2],
          xAxisRotation: seg[3],
          largeArcFlag: seg[4],
          sweepFlag: seg[5]
        });

        // null-curves
        if (!curves.length) continue

        for (var j = 0, c; j < curves.length; j++) {
          c = curves[j];
          seg = ['C', c.x1, c.y1, c.x2, c.y2, c.x, c.y];
          if (j < curves.length - 1) result.push(seg);
        }

        break
      case 'S':
        // default control point
        var cx = x;
        var cy = y;
        if (prev == 'C' || prev == 'S') {
          cx += cx - bezierX; // reflect the previous command's control
          cy += cy - bezierY; // point relative to the current point
        }
        seg = ['C', cx, cy, seg[1], seg[2], seg[3], seg[4]];
        break
      case 'T':
        if (prev == 'Q' || prev == 'T') {
          quadX = x * 2 - quadX; // as with 'S' reflect previous control point
          quadY = y * 2 - quadY;
        } else {
          quadX = x;
          quadY = y;
        }
        seg = quadratic(x, y, quadX, quadY, seg[1], seg[2]);
        break
      case 'Q':
        quadX = seg[1];
        quadY = seg[2];
        seg = quadratic(x, y, seg[1], seg[2], seg[3], seg[4]);
        break
      case 'L':
        seg = line(x, y, seg[1], seg[2]);
        break
      case 'H':
        seg = line(x, y, seg[1], y);
        break
      case 'V':
        seg = line(x, y, x, seg[1]);
        break
      case 'Z':
        seg = line(x, y, startX, startY);
        break
    }

    // update state
    prev = command;
    x = seg[seg.length - 2];
    y = seg[seg.length - 1];
    if (seg.length > 4) {
      bezierX = seg[seg.length - 4];
      bezierY = seg[seg.length - 3];
    } else {
      bezierX = x;
      bezierY = y;
    }
    result.push(seg);
  }

  return result
}

function line(x1, y1, x2, y2){
  return ['C', x1, y1, x2, y2, x2, y2]
}

function quadratic(x1, y1, cx, cy, x2, y2){
  return [
    'C',
    x1/3 + (2/3) * cx,
    y1/3 + (2/3) * cy,
    x2/3 + (2/3) * cx,
    y2/3 + (2/3) * cy,
    x2,
    y2
  ]
}

var createPath = function createPath(move) {
  return {
    move: move,
    curves: [],
    close: false
  };
};
var close = function close(path) {
  path.close = true;
};
var addCurve = function addCurve(path, c) {
  path.curves.push({
    c1: c.c1,
    c2: c.c2,
    to: c.to
  });
};
var parse = function parse(d) {
  var segments = normalize(absSVG(parseSVG(d)));
  var path = createPath({
    x: segments[0][1],
    y: segments[0][2]
  });
  segments.forEach(function (segment) {
    if (segment[0] === "Z") {
      close(path);
    } else if (segment[0] === "C") {
      addCurve(path, {
        c1: {
          x: segment[1],
          y: segment[2]
        },
        c2: {
          x: segment[3],
          y: segment[4]
        },
        to: {
          x: segment[5],
          y: segment[6]
        }
      });
    }
  });
  return path;
};

var curveIsFound = function curveIsFound(c) {
  "worklet";

  return c.curve !== null;
};

var selectCurve = function selectCurve(path, x) {
  "worklet";

  var result = {
    from: path.move,
    curve: null
  };

  for (var i = 0; i < path.curves.length; i++) {
    var c = path.curves[i];
    var contains = result.from.x > c.to.x ? x >= c.to.x && x <= result.from.x : x >= result.from.x && x <= c.to.x;

    if (contains) {
      result.curve = c;
      break;
    }

    result.from = c.to;
  }

  if (!curveIsFound(result)) {
    throw new Error("No curve found at " + x);
  }

  return result;
};
var getYForX = function getYForX(path, x, precision) {
  if (precision === void 0) {
    precision = 2;
  }

  var c = selectCurve(path, x);
  return cubicBezierYForX(x, c.from, c.curve.c1, c.curve.c2, c.curve.to, precision);
};

var defaultHeader = {
  currentValue: {
    display: true,
    update: true,
    prefix: "",
    suffix: ""
  },
  percentageChange: {
    display: true,
    update: true
  },
  labels: {
    display: true,
    update: true
  }
};
var defaultCursor = {
  display: true,
  cursorColor: "black",
  lineColor: "black"
};

var DataLoader = function DataLoader(_ref) {
  var chartLabels = _ref.chartLabels,
      chartData = _ref.chartData,
      _ref$title = _ref.title,
      title = _ref$title === void 0 ? undefined : _ref$title,
      _ref$graphColor = _ref.graphColor,
      graphColor = _ref$graphColor === void 0 ? "black" : _ref$graphColor,
      _ref$buttonColor = _ref.buttonColor,
      buttonColor = _ref$buttonColor === void 0 ? "black" : _ref$buttonColor,
      _ref$header = _ref.header,
      header = _ref$header === void 0 ? defaultHeader : _ref$header,
      _ref$cursor = _ref.cursor,
      cursor = _ref$cursor === void 0 ? defaultCursor : _ref$cursor,
      _ref$currentValueDisp = _ref.currentValueDisplayPrefix,
      currentValueDisplayPrefix = _ref$currentValueDisp === void 0 ? "" : _ref$currentValueDisp,
      _ref$partialGraph = _ref.partialGraph,
      partialGraph = _ref$partialGraph === void 0 ? false : _ref$partialGraph;

  this.throwErrorOnInvalidParameters = function (data) {
    data.chartData.forEach(function (data) {
      data.points.forEach(function (point) {
        if (typeof point.value !== "number") {
          throw new Error("Invalid value type for datapoint" + point);
        }
      });
    });

    if (data.chartLabels) {
      if (data.chartLabels.length > 0 && data.chartLabels.length !== data.chartData.length) {
        throw new Error("Length of chart labels not matching length of data. Expected " + data.chartData.length + " labels only got " + data.chartLabels.length + ".");
      }
    }

    var header = data.header;

    if (header.currentValue.update && !header.currentValue.display) {
      throw new Error("updateCurrentValue cannot be true if displayCurrentValue is false or undefined.");
    }

    if (header.percentageChange.update && !header.percentageChange.display) {
      throw new Error("updatePercentageChange cannot be true if displayPercentageChange is false or undefined.");
    }
  };

  this.throwErrorOnInvalidParameters({
    chartLabels: chartLabels,
    chartData: chartData,
    title: title,
    graphColor: graphColor,
    buttonColor: buttonColor,
    header: header,
    cursor: cursor,
    currentValueDisplayPrefix: currentValueDisplayPrefix,
    partialGraph: partialGraph
  });
  this.chartLabels = chartLabels;
  this.chartData = chartData;
  this.title = title;
  this.graphColor = graphColor;
  this.buttonColor = buttonColor;
  this.header = header;
  this.cursor = cursor;
  this.currentValueDisplayPrefix = currentValueDisplayPrefix;
  this.partialGraph = partialGraph;
};

var d3 = require("d3");

var ChartModel = function ChartModel(_data, _width, _height, _state) {
  var _this = this;

  this.calcPath = function () {
    var datapoints = _this.data.chartData[_this.state];
    var formattedValues = datapoints.points.map(function (datapoint, index) {
      return [datapoint.value, index];
    });
    var prices = formattedValues.map(function (value) {
      return value[0];
    });
    var indices = formattedValues.map(function (value) {
      return value[1];
    });
    var relDataPoints = 1;

    if (datapoints.maxDataPoints !== undefined) {
      var maxDataPoints = datapoints.maxDataPoints;
      var dataPoints = datapoints.points.length;
      relDataPoints = dataPoints / maxDataPoints;
    }

    var scaleX = d3Scale.scaleLinear().domain([Math.min.apply(Math, indices), Math.max.apply(Math, indices)]).range([0, _this.width * relDataPoints]);
    var minPrice = Math.min.apply(Math, prices);
    var maxPrice = Math.max.apply(Math, prices);
    var scaleY = d3Scale.scaleLinear().domain([minPrice, maxPrice]).range([_this.height - 10, 10]);
    return {
      minPrice: minPrice,
      maxPrice: maxPrice,
      datapoints: datapoints,
      path: shape.line().x(function (_ref) {
        var x = _ref[1];
        return scaleX(x);
      }).y(function (_ref2) {
        var y = _ref2[0];
        return scaleY(y);
      }).curve(shape.curveCatmullRom.alpha(0.2))(formattedValues)
    };
  };

  this.changeState = function (state, morph, ref) {
    _this.state = state;

    if (morph === true) {
      var previous = _this.pathData.path;

      var interpolatedPathData = _this.getInterpolatedPath();

      _this.morphPath(previous, interpolatedPathData, state, ref);
    }

    _this.pathData = _this.calcPath();
    _this.parsedPath = parse(_this.pathData.path);
  };

  this.morphPath = function (oldPath, newPath, newState, graphRef) {
    d3.select(graphRef.current).attr("d", oldPath).transition().duration(1000).attrTween("d", function () {
      return newPath;
    }).on("start", function () {
      _this.morphing = true;
    }).on("end", function () {
      _this.state = newState;
      _this.morphing = false;
    });
  };

  this.getInterpolatedPath = function () {
    var current = _this.calcPath();

    return d3InterpolatePath.interpolatePath(_this.pathData.path, current.path);
  };

  this.getXYValues = function (xPosition, maxDataPoints) {
    var dataPointsIndex = Math.abs(Math.round(mapValues(xPosition, [0, _this.width], [0, maxDataPoints - 1])));

    if (dataPointsIndex >= _this.data.chartData[_this.state].points.length) {
      return {
        dataPointsIndex: -1,
        xValue: -1,
        yValue: -1
      };
    }

    var xValue = mapValues(dataPointsIndex, [0, maxDataPoints - 1], [0, _this.width]);
    var yValue = _this.data.chartData[_this.state].points[dataPointsIndex].value;
    var yCord = mapValues(yValue, [_this.pathData.minPrice, _this.pathData.maxPrice], [_this.height - 10, 10]);
    return {
      dataPointsIndex: dataPointsIndex,
      xValue: xValue,
      yValue: yCord
    };
  };

  this.getYOnGraph = function (x) {
    try {
      return getYForX(_this.parsedPath, x);
    } catch (error) {
      return -1;
    }
  };

  this.getMaxDataPoints = function () {
    var currentDPs = _this.data.chartData[_this.state];

    if (currentDPs.maxDataPoints === undefined) {
      return currentDPs.points.length;
    } else {
      return currentDPs.maxDataPoints;
    }
  };

  this.getPercentChangeFromIndex = function (index) {
    var firstValue = _this.getDataPointByIndex(0).value;

    var secondValue = _this.getDataPointByIndex(index).value;

    var percentChange = relativePercent(secondValue, firstValue);
    return Math.round(percentChange * 10000) / 100;
  };

  this.getLatestDataPoint = function () {
    var pointsLength = _this.data.chartData[_this.state].points.length;
    return _this.data.chartData[_this.state].points[pointsLength - 1];
  };

  this.getDataPointByIndex = function (index) {
    return _this.data.chartData[_this.state].points[index];
  };

  this.getDataPointsLength = function () {
    return _this.data.chartData[_this.state].points.length;
  };

  this.data = new DataLoader(_data);
  this.width = _width;
  this.height = _height;
  this.state = _state;
  this.morphing = false;
  this.pathData = this.calcPath();
  this.parsedPath = parse(this.pathData.path);
};

var styles = {"chartContainer":"_3XvYA","graph":"_gypY7","buttonContainer":"_tWHtY","selectedButton":"_3m-aD","percentChange":"_1mSO8","label":"_3sXmF","title":"_2KezC","dpValue":"_1USMk"};

var Header = function Header(_ref) {
  var headerConfig = _ref.headerConfig,
      headerData = _ref.headerData;
  return React__default.createElement("div", null, React__default.createElement("h1", {
    className: styles.title
  }, headerData.title), !headerConfig.currentValue.display ? null : React__default.createElement("h1", {
    className: styles.dpValue
  }, headerData.dataPointValue), !headerConfig.percentageChange.display && !headerConfig.labels.display ? null : React__default.createElement("div", null, React__default.createElement("p", {
    className: styles.percentChange
  }, headerConfig.percentageChange.display ? headerData.percentChange + "%" : null), React__default.createElement("p", {
    className: styles.label
  }, headerConfig.labels.display ? headerData.label : null)));
};

var LabelButtons = function LabelButtons(_ref) {
  var chartLabels = _ref.chartLabels,
      chartModel = _ref.chartModel,
      handleChartChangeClick = _ref.handleChartChangeClick;
  return React__default.createElement("div", null, chartLabels === null ? null : React__default.createElement("div", {
    className: styles.buttonContainer
  }, chartLabels.map(function (value, index) {
    return React__default.createElement("button", {
      style: index === (chartModel === null || chartModel === void 0 ? void 0 : chartModel.state) ? {
        borderBottomWidth: 3,
        borderColor: chartModel.data.buttonColor,
        borderStyle: "solid"
      } : {},
      key: index,
      onClick: function onClick() {
        return handleChartChangeClick(index);
      }
    }, value);
  })));
};

var HEADER_HEIGHT = 100;

function useForceUpdate() {
  var _useState = React.useState(0),
      value = _useState[0],
      setValue = _useState[1];

  return function () {
    return setValue(value + 1);
  };
}

var Graph = function Graph(_ref) {
  var _chartModel$data$curs2, _chartModel$data$curs3;

  var chartModel = _ref.chartModel,
      children = _ref.children;

  var _useState2 = React.useState({
    x: 0,
    y: 0,
    show: false
  }),
      chartCursor = _useState2[0],
      setChartCursor = _useState2[1];

  var _useState3 = React.useState({
    dataPointValue: null,
    percentChange: null,
    label: null
  }),
      headerData = _useState3[0],
      setHeaderData = _useState3[1];

  var graphRef = React.useRef(null);
  var forceUpdate = useForceUpdate();
  React.useEffect(function () {
    if (headerData.dataPointValue === null) {
      setHeaderData({
        title: chartModel.data.title,
        dataPointValue: chartModel.getLatestDataPoint().value,
        percentChange: chartModel.getPercentChangeFromIndex(chartModel.getDataPointsLength() - 1),
        label: chartModel.getLatestDataPoint().label
      });
    }
  });

  var handleChartChangeClick = function handleChartChangeClick(state) {
    chartModel.changeState(state, true, graphRef);
    forceUpdate();
  };

  var handleMouseLeave = function handleMouseLeave() {
    changeHeaderData(chartModel.getDataPointsLength());
    setChartCursor({
      x: 0,
      y: 0,
      show: false
    });
  };

  var handleMouseMove = function handleMouseMove(event) {
    var _chartModel$data$curs;

    if (chartModel.morphing || !((_chartModel$data$curs = chartModel.data.cursor) !== null && _chartModel$data$curs !== void 0 && _chartModel$data$curs.display)) return;
    var maxDataPoints = chartModel.getMaxDataPoints();

    var _chartModel$getXYValu = chartModel.getXYValues(event.nativeEvent.offsetX, maxDataPoints),
        dataPointsIndex = _chartModel$getXYValu.dataPointsIndex,
        xValue = _chartModel$getXYValu.xValue,
        yValue = _chartModel$getXYValu.yValue;

    changeHeaderData(dataPointsIndex);
    setChartCursor({
      x: xValue,
      y: yValue,
      show: yValue !== -1
    });
  };

  var changeHeaderData = function changeHeaderData(index) {
    if (index < chartModel.getDataPointsLength() && index >= 0) {
      var dpValue = headerData.dataPointValue;
      var pcValue = headerData.percentChange;
      var dpLabel = headerData.label;
      var _headerConfig = chartModel.data.header;

      if (_headerConfig.currentValue.update) {
        dpValue = chartModel.getDataPointByIndex(index).value;
      }

      if (_headerConfig.percentageChange.update) {
        pcValue = chartModel.getPercentChangeFromIndex(index);
      }

      if (_headerConfig.labels.update) {
        dpLabel = chartModel.getDataPointByIndex(index).label;
      }

      setHeaderData(function (data) {
        return {
          title: data.title,
          dataPointValue: dpValue,
          percentChange: pcValue,
          label: dpLabel
        };
      });
    }
  };

  var headerConfig = chartModel.data.header;
  var chartLabels = chartModel.data.chartLabels;
  return React__default.createElement("div", {
    className: styles.chartContainer,
    style: {
      width: chartModel.width
    }
  }, React__default.createElement("div", {
    style: {
      maxHeight: HEADER_HEIGHT
    },
    className: "header"
  }, children === undefined ? React__default.createElement(Header, {
    headerData: headerData,
    headerConfig: headerConfig
  }) : children(headerData)), React__default.createElement("svg", {
    width: chartModel.width,
    height: chartModel.height,
    onMouseMove: handleMouseMove,
    onMouseLeave: handleMouseLeave,
    className: styles.graph
  }, React__default.createElement("path", {
    d: chartModel.pathData.path !== null ? chartModel.pathData.path : "",
    style: {
      fill: "transparent",
      stroke: chartModel.data.graphColor,
      strokeWidth: 3
    },
    ref: graphRef
  }), React__default.createElement("circle", {
    cx: chartCursor.x,
    cy: chartCursor.y,
    r: chartCursor.show ? 6 : 0,
    stroke: "white",
    strokeWidth: 2,
    fill: ((_chartModel$data$curs2 = chartModel.data.cursor) === null || _chartModel$data$curs2 === void 0 ? void 0 : _chartModel$data$curs2.cursorColor) || ""
  }), React__default.createElement("line", {
    strokeWidth: chartCursor.show ? 1.5 : 0,
    x1: chartCursor.x,
    y1: chartModel.height,
    x2: chartCursor.x,
    y2: chartCursor.y,
    stroke: ((_chartModel$data$curs3 = chartModel.data.cursor) === null || _chartModel$data$curs3 === void 0 ? void 0 : _chartModel$data$curs3.lineColor) || "",
    opacity: 0.7
  })), React__default.createElement(LabelButtons, {
    chartLabels: chartLabels,
    chartModel: chartModel,
    handleChartChangeClick: handleChartChangeClick
  }));
};

var Chart = function Chart(_ref) {
  var width = _ref.width,
      height = _ref.height,
      data = _ref.data,
      children = _ref.children;
  var chartModel = new ChartModel(data, width, height, 0);
  return React__default.createElement(Graph, {
    chartModel: chartModel,
    children: children
  });
};

module.exports = Chart;
//# sourceMappingURL=index.js.map
