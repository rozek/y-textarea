import * as Y from "yjs";
var textareaCaret = { exports: {} };
(function(module) {
  (function() {
    var properties = [
      "direction",
      "boxSizing",
      "width",
      "height",
      "overflowX",
      "overflowY",
      "borderTopWidth",
      "borderRightWidth",
      "borderBottomWidth",
      "borderLeftWidth",
      "borderStyle",
      "paddingTop",
      "paddingRight",
      "paddingBottom",
      "paddingLeft",
      "fontStyle",
      "fontVariant",
      "fontWeight",
      "fontStretch",
      "fontSize",
      "fontSizeAdjust",
      "lineHeight",
      "fontFamily",
      "textAlign",
      "textTransform",
      "textIndent",
      "textDecoration",
      "letterSpacing",
      "wordSpacing",
      "tabSize",
      "MozTabSize"
    ];
    var isBrowser = typeof window !== "undefined";
    var isFirefox = isBrowser && window.mozInnerScreenX != null;
    function getCaretCoordinates2(element, position, options) {
      if (!isBrowser) {
        throw new Error("textarea-caret-position#getCaretCoordinates should only be called in a browser");
      }
      var debug = options && options.debug || false;
      if (debug) {
        var el = document.querySelector("#input-textarea-caret-position-mirror-div");
        if (el)
          el.parentNode.removeChild(el);
      }
      var div = document.createElement("div");
      div.id = "input-textarea-caret-position-mirror-div";
      document.body.appendChild(div);
      var style = div.style;
      var computed = window.getComputedStyle ? window.getComputedStyle(element) : element.currentStyle;
      var isInput = element.nodeName === "INPUT";
      style.whiteSpace = "pre-wrap";
      if (!isInput)
        style.wordWrap = "break-word";
      style.position = "absolute";
      if (!debug)
        style.visibility = "hidden";
      properties.forEach(function(prop) {
        if (isInput && prop === "lineHeight") {
          style.lineHeight = computed.height;
        } else {
          style[prop] = computed[prop];
        }
      });
      if (isFirefox) {
        if (element.scrollHeight > parseInt(computed.height))
          style.overflowY = "scroll";
      } else {
        style.overflow = "hidden";
      }
      div.textContent = element.value.substring(0, position);
      if (isInput)
        div.textContent = div.textContent.replace(/\s/g, "\xA0");
      var span = document.createElement("span");
      span.textContent = element.value.substring(position) || ".";
      div.appendChild(span);
      var coordinates = {
        top: span.offsetTop + parseInt(computed["borderTopWidth"]),
        left: span.offsetLeft + parseInt(computed["borderLeftWidth"]),
        height: parseInt(computed["lineHeight"])
      };
      if (debug) {
        span.style.backgroundColor = "#aaa";
      } else {
        document.body.removeChild(div);
      }
      return coordinates;
    }
    {
      module.exports = getCaretCoordinates2;
    }
  })();
})(textareaCaret);
var getCaretCoordinates = textareaCaret.exports;
function getOverlap(rectangle1, rectangle2) {
  const intersectionX1 = Math.max(rectangle1.x, rectangle2.x);
  const intersectionX2 = Math.min(rectangle1.x + rectangle1.width, rectangle2.x + rectangle2.width);
  if (intersectionX2 < intersectionX1) {
    return null;
  }
  const intersectionY1 = Math.max(rectangle1.y, rectangle2.y);
  const intersectionY2 = Math.min(rectangle1.y + rectangle1.height, rectangle2.y + rectangle2.height);
  if (intersectionY2 < intersectionY1) {
    return null;
  }
  return new Rectangle(intersectionX1, intersectionY1, intersectionX2 - intersectionX1, intersectionY2 - intersectionY1);
}
class Rectangle {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }
  get area() {
    return this.width * this.height;
  }
}
var rectangleOverlap = getOverlap;
const events = ["keyup", "mouseup", "touchstart", "paste", "cut", "selectend"];
class Cursor {
  constructor(fontSize, cssColor, element, name) {
    Object.defineProperty(this, "_div", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "_nameDiv", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "_color", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "_fontSize", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "_selectedIndex", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "_name", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "_parent", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this._selectedIndex = { start: -1, end: -1 };
    this._fontSize = fontSize;
    this._parent = element.offsetParent || document.body;
    this._div = document.createElement("div");
    this._div.style.position = "absolute";
    this._div.style.height = fontSize;
    this._div.style.width = "1px";
    this._div.style.display = "none";
    this._div.classList.add("selectedText");
    this._parent.appendChild(this._div);
    if (name !== void 0)
      this.updateCursor(name, cssColor);
  }
  show() {
    this._div.style.display = "block";
    if (this._nameDiv)
      this._nameDiv.style.display = "block";
  }
  hide() {
    this._div.style.display = "none";
    if (this._nameDiv)
      this._nameDiv.style.display = "none";
  }
  updateCursor(name, cssColor) {
    if (this._name === name && this._color.r === cssColor.r && this._color.g === cssColor.g && this._color.b === cssColor.b)
      return;
    this._color = cssColor;
    this._name = name;
    if (!this._nameDiv) {
      this._nameDiv = document.createElement("div");
      this._nameDiv.style.position = "absolute";
      this._nameDiv.style.display = "none";
      this._nameDiv.classList.add("nameTag");
      this._parent.appendChild(this._nameDiv);
    }
    this._nameDiv.innerHTML = name;
    this._nameDiv.style.backgroundColor = `rgba(${this._color.r}, ${this._color.g}, ${this._color.b}, 1.0)`;
    this._div.style.backgroundColor = `rgba(${this._color.r}, ${this._color.g}, ${this._color.b}, 0.4)`;
  }
  setPosition(start, end) {
    this._selectedIndex = { start, end };
  }
  setWidth(width) {
    this._div.style.width = width + "px";
    if (width === 1) {
      this._div.style.backgroundColor = `rgba(${this._color.r}, ${this._color.g}, ${this._color.b}, 1.0)`;
    } else {
      this._div.style.backgroundColor = `rgba(${this._color.r}, ${this._color.g}, ${this._color.b}, 0.4)`;
    }
  }
  rePosition(textFeild) {
    if (this._selectedIndex.start === -1 || this._selectedIndex.end === -1)
      return;
    const startCoordinates = getCaretCoordinates(textFeild, this._selectedIndex.start);
    const screenSpaceTop = textFeild.offsetTop - textFeild.scrollTop + startCoordinates.top;
    const screenSpaceLeft = textFeild.offsetLeft - textFeild.scrollLeft + startCoordinates.left;
    let width = 1;
    let height = 0;
    if (this._selectedIndex.start !== this._selectedIndex.end) {
      let endCoordinates = getCaretCoordinates(textFeild, this._selectedIndex.end);
      width = endCoordinates.left - startCoordinates.left;
      height = endCoordinates.top - startCoordinates.top;
      if (height !== 0)
        width = 1;
    }
    const areaScreenSpace = {
      x: textFeild.offsetLeft,
      y: textFeild.offsetTop,
      width: textFeild.clientWidth,
      height: textFeild.clientHeight
    };
    const cursorScreenSpace = {
      x: screenSpaceLeft,
      y: screenSpaceTop,
      width,
      height: parseInt(this._fontSize)
    };
    const overlap = rectangleOverlap(areaScreenSpace, cursorScreenSpace);
    if (!overlap) {
      this.hide();
      return;
    }
    this._div.style.top = overlap.y + "px";
    this._div.style.left = overlap.x + "px";
    this.setWidth(overlap.width);
    this.show();
    if (this._nameDiv) {
      this._nameDiv.style.top = overlap.y + parseInt(this._fontSize) + "px";
      this._nameDiv.style.left = overlap.x + "px";
    }
  }
  destroy() {
    this._parent.removeChild(this._div);
    if (this._nameDiv)
      this._parent.removeChild(this._nameDiv);
  }
}
class TextAreaCursors {
  constructor(yText, textField, options) {
    Object.defineProperty(this, "_unobserveFns", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
    Object.defineProperty(this, "_cursors", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: /* @__PURE__ */ new Map()
    });
    Object.defineProperty(this, "_areaID", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: ""
    });
    Object.defineProperty(this, "_textField", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    this._areaID = textField.id;
    this._textField = textField;
    if (textField.id === "") {
      throw new Error("ID attribute is required on textarea/field if using cursors");
    }
    if (textField.selectionStart === null || textField.selectionEnd === null) {
      throw new Error("unSupported Input type");
    }
    const doc = yText.doc;
    if (doc === null) {
      throw new Error("Missing doc on yText");
    }
    const awarenessUpdate = (event) => {
      if (event.removed.length != 0) {
        for (const id of event.removed) {
          if (this._cursors.has(id)) {
            const cursor = this._cursors.get(id);
            cursor == null ? void 0 : cursor.destroy();
            this._cursors.delete(id);
          }
        }
      }
      const fontSize = getComputedStyle(textField).getPropertyValue("font-size");
      const changes = options.awareness.getStates();
      for (const [clientID, change] of changes.entries()) {
        if (clientID === options.awareness.clientID)
          continue;
        const user = change[this._areaID];
        if (user === void 0)
          continue;
        const encodedStart = user["start"];
        const encodedEnd = user["end"];
        const name = user["name"];
        const color = user["color"];
        const selection = user["selection"];
        if (!this._cursors.has(clientID) && !selection) {
          continue;
        }
        if (!this._cursors.has(clientID)) {
          this._cursors.set(clientID, new Cursor(fontSize, color, textField, name));
        }
        const cursorMarker = this._cursors.get(clientID);
        if (!selection) {
          cursorMarker == null ? void 0 : cursorMarker.setPosition(-1, -1);
          cursorMarker == null ? void 0 : cursorMarker.hide();
          continue;
        }
        cursorMarker == null ? void 0 : cursorMarker.updateCursor(name, color);
        if (encodedStart === void 0 || encodedEnd === void 0)
          continue;
        const start = Y.createAbsolutePositionFromRelativePosition(JSON.parse(encodedStart), doc);
        const end = Y.createAbsolutePositionFromRelativePosition(JSON.parse(encodedEnd), doc);
        if (start === null || end === null) {
          cursorMarker == null ? void 0 : cursorMarker.hide();
          continue;
        }
        cursorMarker == null ? void 0 : cursorMarker.setPosition(start.index, end.index);
        cursorMarker == null ? void 0 : cursorMarker.rePosition(textField);
      }
    };
    options.awareness.on("update", awarenessUpdate);
    this._unobserveFns.push(() => options.awareness.off("update", awarenessUpdate));
    const textFieldChanged = () => {
      const start = textField.selectionStart;
      const end = textField.selectionEnd;
      const startRel = Y.createRelativePositionFromTypeIndex(yText, start);
      const endRel = Y.createRelativePositionFromTypeIndex(yText, end);
      options.awareness.setLocalStateField(this._areaID, {
        user: options.awareness.clientID,
        selection: true,
        start: JSON.stringify(startRel),
        end: JSON.stringify(endRel),
        name: options.clientName,
        color: options.color || { r: 45, g: 80, b: 237 }
      });
    };
    for (const event of events) {
      textField.addEventListener(event, textFieldChanged);
      this._unobserveFns.push(() => {
        textField.removeEventListener(event, textFieldChanged);
      });
    }
    const onFocusOut = () => {
      options.awareness.setLocalStateField(this._areaID, {
        user: options.awareness.clientID,
        selection: false
      });
    };
    textField.addEventListener("focusout", onFocusOut);
    this._unobserveFns.push(() => {
      textField.removeEventListener("focusout", onFocusOut);
    });
    const onScroll = () => {
      this.rePositionCursors();
    };
    textField.addEventListener("scroll", onScroll);
    this._unobserveFns.push(() => {
      textField.removeEventListener("scroll", onScroll);
    });
  }
  rePositionCursors() {
    if (this._textField) {
      for (const [_index, cursor] of this._cursors) {
        cursor.rePosition(this._textField);
      }
    }
  }
  destroy() {
    for (const unobserveFn of this._unobserveFns) {
      unobserveFn();
    }
    this._unobserveFns = [];
    for (const [__key, value] of this._cursors) {
      value.destroy();
    }
    this._cursors.clear();
  }
}
var DIFF_DELETE = -1;
var DIFF_INSERT = 1;
var DIFF_EQUAL = 0;
function diff_main(text1, text2, cursor_pos, _fix_unicode) {
  if (text1 === text2) {
    if (text1) {
      return [[DIFF_EQUAL, text1]];
    }
    return [];
  }
  if (cursor_pos != null) {
    var editdiff = find_cursor_edit_diff(text1, text2, cursor_pos);
    if (editdiff) {
      return editdiff;
    }
  }
  var commonlength = diff_commonPrefix(text1, text2);
  var commonprefix = text1.substring(0, commonlength);
  text1 = text1.substring(commonlength);
  text2 = text2.substring(commonlength);
  commonlength = diff_commonSuffix(text1, text2);
  var commonsuffix = text1.substring(text1.length - commonlength);
  text1 = text1.substring(0, text1.length - commonlength);
  text2 = text2.substring(0, text2.length - commonlength);
  var diffs = diff_compute_(text1, text2);
  if (commonprefix) {
    diffs.unshift([DIFF_EQUAL, commonprefix]);
  }
  if (commonsuffix) {
    diffs.push([DIFF_EQUAL, commonsuffix]);
  }
  diff_cleanupMerge(diffs, _fix_unicode);
  return diffs;
}
function diff_compute_(text1, text2) {
  var diffs;
  if (!text1) {
    return [[DIFF_INSERT, text2]];
  }
  if (!text2) {
    return [[DIFF_DELETE, text1]];
  }
  var longtext = text1.length > text2.length ? text1 : text2;
  var shorttext = text1.length > text2.length ? text2 : text1;
  var i = longtext.indexOf(shorttext);
  if (i !== -1) {
    diffs = [
      [DIFF_INSERT, longtext.substring(0, i)],
      [DIFF_EQUAL, shorttext],
      [DIFF_INSERT, longtext.substring(i + shorttext.length)]
    ];
    if (text1.length > text2.length) {
      diffs[0][0] = diffs[2][0] = DIFF_DELETE;
    }
    return diffs;
  }
  if (shorttext.length === 1) {
    return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
  }
  var hm = diff_halfMatch_(text1, text2);
  if (hm) {
    var text1_a = hm[0];
    var text1_b = hm[1];
    var text2_a = hm[2];
    var text2_b = hm[3];
    var mid_common = hm[4];
    var diffs_a = diff_main(text1_a, text2_a);
    var diffs_b = diff_main(text1_b, text2_b);
    return diffs_a.concat([[DIFF_EQUAL, mid_common]], diffs_b);
  }
  return diff_bisect_(text1, text2);
}
function diff_bisect_(text1, text2) {
  var text1_length = text1.length;
  var text2_length = text2.length;
  var max_d = Math.ceil((text1_length + text2_length) / 2);
  var v_offset = max_d;
  var v_length = 2 * max_d;
  var v1 = new Array(v_length);
  var v2 = new Array(v_length);
  for (var x = 0; x < v_length; x++) {
    v1[x] = -1;
    v2[x] = -1;
  }
  v1[v_offset + 1] = 0;
  v2[v_offset + 1] = 0;
  var delta = text1_length - text2_length;
  var front = delta % 2 !== 0;
  var k1start = 0;
  var k1end = 0;
  var k2start = 0;
  var k2end = 0;
  for (var d = 0; d < max_d; d++) {
    for (var k1 = -d + k1start; k1 <= d - k1end; k1 += 2) {
      var k1_offset = v_offset + k1;
      var x1;
      if (k1 === -d || k1 !== d && v1[k1_offset - 1] < v1[k1_offset + 1]) {
        x1 = v1[k1_offset + 1];
      } else {
        x1 = v1[k1_offset - 1] + 1;
      }
      var y1 = x1 - k1;
      while (x1 < text1_length && y1 < text2_length && text1.charAt(x1) === text2.charAt(y1)) {
        x1++;
        y1++;
      }
      v1[k1_offset] = x1;
      if (x1 > text1_length) {
        k1end += 2;
      } else if (y1 > text2_length) {
        k1start += 2;
      } else if (front) {
        var k2_offset = v_offset + delta - k1;
        if (k2_offset >= 0 && k2_offset < v_length && v2[k2_offset] !== -1) {
          var x2 = text1_length - v2[k2_offset];
          if (x1 >= x2) {
            return diff_bisectSplit_(text1, text2, x1, y1);
          }
        }
      }
    }
    for (var k2 = -d + k2start; k2 <= d - k2end; k2 += 2) {
      var k2_offset = v_offset + k2;
      var x2;
      if (k2 === -d || k2 !== d && v2[k2_offset - 1] < v2[k2_offset + 1]) {
        x2 = v2[k2_offset + 1];
      } else {
        x2 = v2[k2_offset - 1] + 1;
      }
      var y2 = x2 - k2;
      while (x2 < text1_length && y2 < text2_length && text1.charAt(text1_length - x2 - 1) === text2.charAt(text2_length - y2 - 1)) {
        x2++;
        y2++;
      }
      v2[k2_offset] = x2;
      if (x2 > text1_length) {
        k2end += 2;
      } else if (y2 > text2_length) {
        k2start += 2;
      } else if (!front) {
        var k1_offset = v_offset + delta - k2;
        if (k1_offset >= 0 && k1_offset < v_length && v1[k1_offset] !== -1) {
          var x1 = v1[k1_offset];
          var y1 = v_offset + x1 - k1_offset;
          x2 = text1_length - x2;
          if (x1 >= x2) {
            return diff_bisectSplit_(text1, text2, x1, y1);
          }
        }
      }
    }
  }
  return [[DIFF_DELETE, text1], [DIFF_INSERT, text2]];
}
function diff_bisectSplit_(text1, text2, x, y) {
  var text1a = text1.substring(0, x);
  var text2a = text2.substring(0, y);
  var text1b = text1.substring(x);
  var text2b = text2.substring(y);
  var diffs = diff_main(text1a, text2a);
  var diffsb = diff_main(text1b, text2b);
  return diffs.concat(diffsb);
}
function diff_commonPrefix(text1, text2) {
  if (!text1 || !text2 || text1.charAt(0) !== text2.charAt(0)) {
    return 0;
  }
  var pointermin = 0;
  var pointermax = Math.min(text1.length, text2.length);
  var pointermid = pointermax;
  var pointerstart = 0;
  while (pointermin < pointermid) {
    if (text1.substring(pointerstart, pointermid) == text2.substring(pointerstart, pointermid)) {
      pointermin = pointermid;
      pointerstart = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }
  if (is_surrogate_pair_start(text1.charCodeAt(pointermid - 1))) {
    pointermid--;
  }
  return pointermid;
}
function diff_commonSuffix(text1, text2) {
  if (!text1 || !text2 || text1.slice(-1) !== text2.slice(-1)) {
    return 0;
  }
  var pointermin = 0;
  var pointermax = Math.min(text1.length, text2.length);
  var pointermid = pointermax;
  var pointerend = 0;
  while (pointermin < pointermid) {
    if (text1.substring(text1.length - pointermid, text1.length - pointerend) == text2.substring(text2.length - pointermid, text2.length - pointerend)) {
      pointermin = pointermid;
      pointerend = pointermin;
    } else {
      pointermax = pointermid;
    }
    pointermid = Math.floor((pointermax - pointermin) / 2 + pointermin);
  }
  if (is_surrogate_pair_end(text1.charCodeAt(text1.length - pointermid))) {
    pointermid--;
  }
  return pointermid;
}
function diff_halfMatch_(text1, text2) {
  var longtext = text1.length > text2.length ? text1 : text2;
  var shorttext = text1.length > text2.length ? text2 : text1;
  if (longtext.length < 4 || shorttext.length * 2 < longtext.length) {
    return null;
  }
  function diff_halfMatchI_(longtext2, shorttext2, i) {
    var seed = longtext2.substring(i, i + Math.floor(longtext2.length / 4));
    var j = -1;
    var best_common = "";
    var best_longtext_a, best_longtext_b, best_shorttext_a, best_shorttext_b;
    while ((j = shorttext2.indexOf(seed, j + 1)) !== -1) {
      var prefixLength = diff_commonPrefix(longtext2.substring(i), shorttext2.substring(j));
      var suffixLength = diff_commonSuffix(longtext2.substring(0, i), shorttext2.substring(0, j));
      if (best_common.length < suffixLength + prefixLength) {
        best_common = shorttext2.substring(j - suffixLength, j) + shorttext2.substring(j, j + prefixLength);
        best_longtext_a = longtext2.substring(0, i - suffixLength);
        best_longtext_b = longtext2.substring(i + prefixLength);
        best_shorttext_a = shorttext2.substring(0, j - suffixLength);
        best_shorttext_b = shorttext2.substring(j + prefixLength);
      }
    }
    if (best_common.length * 2 >= longtext2.length) {
      return [
        best_longtext_a,
        best_longtext_b,
        best_shorttext_a,
        best_shorttext_b,
        best_common
      ];
    } else {
      return null;
    }
  }
  var hm1 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 4));
  var hm2 = diff_halfMatchI_(longtext, shorttext, Math.ceil(longtext.length / 2));
  var hm;
  if (!hm1 && !hm2) {
    return null;
  } else if (!hm2) {
    hm = hm1;
  } else if (!hm1) {
    hm = hm2;
  } else {
    hm = hm1[4].length > hm2[4].length ? hm1 : hm2;
  }
  var text1_a, text1_b, text2_a, text2_b;
  if (text1.length > text2.length) {
    text1_a = hm[0];
    text1_b = hm[1];
    text2_a = hm[2];
    text2_b = hm[3];
  } else {
    text2_a = hm[0];
    text2_b = hm[1];
    text1_a = hm[2];
    text1_b = hm[3];
  }
  var mid_common = hm[4];
  return [text1_a, text1_b, text2_a, text2_b, mid_common];
}
function diff_cleanupMerge(diffs, fix_unicode) {
  diffs.push([DIFF_EQUAL, ""]);
  var pointer = 0;
  var count_delete = 0;
  var count_insert = 0;
  var text_delete = "";
  var text_insert = "";
  var commonlength;
  while (pointer < diffs.length) {
    if (pointer < diffs.length - 1 && !diffs[pointer][1]) {
      diffs.splice(pointer, 1);
      continue;
    }
    switch (diffs[pointer][0]) {
      case DIFF_INSERT:
        count_insert++;
        text_insert += diffs[pointer][1];
        pointer++;
        break;
      case DIFF_DELETE:
        count_delete++;
        text_delete += diffs[pointer][1];
        pointer++;
        break;
      case DIFF_EQUAL:
        var previous_equality = pointer - count_insert - count_delete - 1;
        if (fix_unicode) {
          if (previous_equality >= 0 && ends_with_pair_start(diffs[previous_equality][1])) {
            var stray = diffs[previous_equality][1].slice(-1);
            diffs[previous_equality][1] = diffs[previous_equality][1].slice(0, -1);
            text_delete = stray + text_delete;
            text_insert = stray + text_insert;
            if (!diffs[previous_equality][1]) {
              diffs.splice(previous_equality, 1);
              pointer--;
              var k = previous_equality - 1;
              if (diffs[k] && diffs[k][0] === DIFF_INSERT) {
                count_insert++;
                text_insert = diffs[k][1] + text_insert;
                k--;
              }
              if (diffs[k] && diffs[k][0] === DIFF_DELETE) {
                count_delete++;
                text_delete = diffs[k][1] + text_delete;
                k--;
              }
              previous_equality = k;
            }
          }
          if (starts_with_pair_end(diffs[pointer][1])) {
            var stray = diffs[pointer][1].charAt(0);
            diffs[pointer][1] = diffs[pointer][1].slice(1);
            text_delete += stray;
            text_insert += stray;
          }
        }
        if (pointer < diffs.length - 1 && !diffs[pointer][1]) {
          diffs.splice(pointer, 1);
          break;
        }
        if (text_delete.length > 0 || text_insert.length > 0) {
          if (text_delete.length > 0 && text_insert.length > 0) {
            commonlength = diff_commonPrefix(text_insert, text_delete);
            if (commonlength !== 0) {
              if (previous_equality >= 0) {
                diffs[previous_equality][1] += text_insert.substring(0, commonlength);
              } else {
                diffs.splice(0, 0, [DIFF_EQUAL, text_insert.substring(0, commonlength)]);
                pointer++;
              }
              text_insert = text_insert.substring(commonlength);
              text_delete = text_delete.substring(commonlength);
            }
            commonlength = diff_commonSuffix(text_insert, text_delete);
            if (commonlength !== 0) {
              diffs[pointer][1] = text_insert.substring(text_insert.length - commonlength) + diffs[pointer][1];
              text_insert = text_insert.substring(0, text_insert.length - commonlength);
              text_delete = text_delete.substring(0, text_delete.length - commonlength);
            }
          }
          var n = count_insert + count_delete;
          if (text_delete.length === 0 && text_insert.length === 0) {
            diffs.splice(pointer - n, n);
            pointer = pointer - n;
          } else if (text_delete.length === 0) {
            diffs.splice(pointer - n, n, [DIFF_INSERT, text_insert]);
            pointer = pointer - n + 1;
          } else if (text_insert.length === 0) {
            diffs.splice(pointer - n, n, [DIFF_DELETE, text_delete]);
            pointer = pointer - n + 1;
          } else {
            diffs.splice(pointer - n, n, [DIFF_DELETE, text_delete], [DIFF_INSERT, text_insert]);
            pointer = pointer - n + 2;
          }
        }
        if (pointer !== 0 && diffs[pointer - 1][0] === DIFF_EQUAL) {
          diffs[pointer - 1][1] += diffs[pointer][1];
          diffs.splice(pointer, 1);
        } else {
          pointer++;
        }
        count_insert = 0;
        count_delete = 0;
        text_delete = "";
        text_insert = "";
        break;
    }
  }
  if (diffs[diffs.length - 1][1] === "") {
    diffs.pop();
  }
  var changes = false;
  pointer = 1;
  while (pointer < diffs.length - 1) {
    if (diffs[pointer - 1][0] === DIFF_EQUAL && diffs[pointer + 1][0] === DIFF_EQUAL) {
      if (diffs[pointer][1].substring(diffs[pointer][1].length - diffs[pointer - 1][1].length) === diffs[pointer - 1][1]) {
        diffs[pointer][1] = diffs[pointer - 1][1] + diffs[pointer][1].substring(0, diffs[pointer][1].length - diffs[pointer - 1][1].length);
        diffs[pointer + 1][1] = diffs[pointer - 1][1] + diffs[pointer + 1][1];
        diffs.splice(pointer - 1, 1);
        changes = true;
      } else if (diffs[pointer][1].substring(0, diffs[pointer + 1][1].length) == diffs[pointer + 1][1]) {
        diffs[pointer - 1][1] += diffs[pointer + 1][1];
        diffs[pointer][1] = diffs[pointer][1].substring(diffs[pointer + 1][1].length) + diffs[pointer + 1][1];
        diffs.splice(pointer + 1, 1);
        changes = true;
      }
    }
    pointer++;
  }
  if (changes) {
    diff_cleanupMerge(diffs, fix_unicode);
  }
}
function is_surrogate_pair_start(charCode) {
  return charCode >= 55296 && charCode <= 56319;
}
function is_surrogate_pair_end(charCode) {
  return charCode >= 56320 && charCode <= 57343;
}
function starts_with_pair_end(str) {
  return is_surrogate_pair_end(str.charCodeAt(0));
}
function ends_with_pair_start(str) {
  return is_surrogate_pair_start(str.charCodeAt(str.length - 1));
}
function remove_empty_tuples(tuples) {
  var ret = [];
  for (var i = 0; i < tuples.length; i++) {
    if (tuples[i][1].length > 0) {
      ret.push(tuples[i]);
    }
  }
  return ret;
}
function make_edit_splice(before, oldMiddle, newMiddle, after) {
  if (ends_with_pair_start(before) || starts_with_pair_end(after)) {
    return null;
  }
  return remove_empty_tuples([
    [DIFF_EQUAL, before],
    [DIFF_DELETE, oldMiddle],
    [DIFF_INSERT, newMiddle],
    [DIFF_EQUAL, after]
  ]);
}
function find_cursor_edit_diff(oldText, newText, cursor_pos) {
  var oldRange = typeof cursor_pos === "number" ? { index: cursor_pos, length: 0 } : cursor_pos.oldRange;
  var newRange = typeof cursor_pos === "number" ? null : cursor_pos.newRange;
  var oldLength = oldText.length;
  var newLength = newText.length;
  if (oldRange.length === 0 && (newRange === null || newRange.length === 0)) {
    var oldCursor = oldRange.index;
    var oldBefore = oldText.slice(0, oldCursor);
    var oldAfter = oldText.slice(oldCursor);
    var maybeNewCursor = newRange ? newRange.index : null;
    editBefore: {
      var newCursor = oldCursor + newLength - oldLength;
      if (maybeNewCursor !== null && maybeNewCursor !== newCursor) {
        break editBefore;
      }
      if (newCursor < 0 || newCursor > newLength) {
        break editBefore;
      }
      var newBefore = newText.slice(0, newCursor);
      var newAfter = newText.slice(newCursor);
      if (newAfter !== oldAfter) {
        break editBefore;
      }
      var prefixLength = Math.min(oldCursor, newCursor);
      var oldPrefix = oldBefore.slice(0, prefixLength);
      var newPrefix = newBefore.slice(0, prefixLength);
      if (oldPrefix !== newPrefix) {
        break editBefore;
      }
      var oldMiddle = oldBefore.slice(prefixLength);
      var newMiddle = newBefore.slice(prefixLength);
      return make_edit_splice(oldPrefix, oldMiddle, newMiddle, oldAfter);
    }
    editAfter: {
      if (maybeNewCursor !== null && maybeNewCursor !== oldCursor) {
        break editAfter;
      }
      var cursor = oldCursor;
      var newBefore = newText.slice(0, cursor);
      var newAfter = newText.slice(cursor);
      if (newBefore !== oldBefore) {
        break editAfter;
      }
      var suffixLength = Math.min(oldLength - cursor, newLength - cursor);
      var oldSuffix = oldAfter.slice(oldAfter.length - suffixLength);
      var newSuffix = newAfter.slice(newAfter.length - suffixLength);
      if (oldSuffix !== newSuffix) {
        break editAfter;
      }
      var oldMiddle = oldAfter.slice(0, oldAfter.length - suffixLength);
      var newMiddle = newAfter.slice(0, newAfter.length - suffixLength);
      return make_edit_splice(oldBefore, oldMiddle, newMiddle, oldSuffix);
    }
  }
  if (oldRange.length > 0 && newRange && newRange.length === 0) {
    replaceRange: {
      var oldPrefix = oldText.slice(0, oldRange.index);
      var oldSuffix = oldText.slice(oldRange.index + oldRange.length);
      var prefixLength = oldPrefix.length;
      var suffixLength = oldSuffix.length;
      if (newLength < prefixLength + suffixLength) {
        break replaceRange;
      }
      var newPrefix = newText.slice(0, prefixLength);
      var newSuffix = newText.slice(newLength - suffixLength);
      if (oldPrefix !== newPrefix || oldSuffix !== newSuffix) {
        break replaceRange;
      }
      var oldMiddle = oldText.slice(prefixLength, oldLength - suffixLength);
      var newMiddle = newText.slice(prefixLength, newLength - suffixLength);
      return make_edit_splice(oldPrefix, oldMiddle, newMiddle, oldSuffix);
    }
  }
  return null;
}
function diff(text1, text2, cursor_pos) {
  return diff_main(text1, text2, cursor_pos, true);
}
diff.INSERT = DIFF_INSERT;
diff.DELETE = DIFF_DELETE;
diff.EQUAL = DIFF_EQUAL;
var diff_1 = diff;
class TextAreaBinding {
  constructor(yText, textField, options) {
    Object.defineProperty(this, "_cursors", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: void 0
    });
    Object.defineProperty(this, "_unobserveFns", {
      enumerable: true,
      configurable: true,
      writable: true,
      value: []
    });
    let doc = yText.doc;
    if (doc === null) {
      throw new Error("Missing doc on yText");
    }
    if (textField.selectionStart === void 0 || textField.selectionEnd === void 0) {
      throw new Error("textField argument doesn't look like a text field");
    }
    if (options) {
      this._cursors = new TextAreaCursors(yText, textField, options);
    }
    textField.value = yText.toString();
    let relPosStart;
    let relPosEnd;
    let direction;
    const onDocBeforeTransaction = () => {
      direction = textField.selectionDirection;
      const r = this.createRange(textField);
      relPosStart = Y.createRelativePositionFromTypeIndex(yText, r.left);
      relPosEnd = Y.createRelativePositionFromTypeIndex(yText, r.right);
    };
    doc.on("beforeTransaction", onDocBeforeTransaction);
    this._unobserveFns.push(() => doc.off("beforeTransaction", onDocBeforeTransaction));
    let textfieldChanged = false;
    const yTextObserver = (__event, transaction) => {
      if (transaction.local && textfieldChanged) {
        textfieldChanged = false;
        return;
      }
      textField.value = yText.toString();
      if (textField.getRootNode().activeElement === textField) {
        const startPos = Y.createAbsolutePositionFromRelativePosition(relPosStart, doc);
        const endPos = Y.createAbsolutePositionFromRelativePosition(relPosEnd, doc);
        if (startPos !== null && endPos !== null) {
          if (direction === null)
            direction = "forward";
          textField.setSelectionRange(startPos.index, endPos.index, direction);
        }
      }
    };
    yText.observe(yTextObserver);
    this._unobserveFns.push(() => yText.unobserve(yTextObserver));
    const onTextFieldInput = () => {
      textfieldChanged = true;
      const r = this.createRange(textField);
      let oldContent = yText.toString();
      let content = textField.value;
      let diffs = diff_1(oldContent, content, r.left);
      let pos = 0;
      for (let i = 0; i < diffs.length; i++) {
        let d = diffs[i];
        if (d[0] === 0) {
          pos += d[1].length;
        } else if (d[0] === -1) {
          yText.delete(pos, d[1].length);
        } else {
          yText.insert(pos, d[1]);
          pos += d[1].length;
        }
      }
    };
    textField.addEventListener("input", onTextFieldInput);
    this._unobserveFns.push(() => textField.removeEventListener("input", onTextFieldInput));
  }
  createRange(element) {
    const left = element.selectionStart;
    const right = element.selectionEnd;
    return { left, right };
  }
  rePositionCursors() {
    var _a;
    (_a = this._cursors) == null ? void 0 : _a.rePositionCursors();
  }
  destroy() {
    for (const unobserveFn of this._unobserveFns) {
      unobserveFn();
    }
    this._unobserveFns = [];
    if (this._cursors) {
      this._cursors.destroy();
    }
  }
}
export { TextAreaBinding };
