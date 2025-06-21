(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push([typeof document === "object" ? document.currentScript : undefined, {

"[project]/apps/web/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
/**
 * @license React
 * react-jsx-dev-runtime.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function getComponentNameFromType(type) {
        if (null == type) return null;
        if ("function" === typeof type) return type.$$typeof === REACT_CLIENT_REFERENCE ? null : type.displayName || type.name || null;
        if ("string" === typeof type) return type;
        switch(type){
            case REACT_FRAGMENT_TYPE:
                return "Fragment";
            case REACT_PROFILER_TYPE:
                return "Profiler";
            case REACT_STRICT_MODE_TYPE:
                return "StrictMode";
            case REACT_SUSPENSE_TYPE:
                return "Suspense";
            case REACT_SUSPENSE_LIST_TYPE:
                return "SuspenseList";
            case REACT_ACTIVITY_TYPE:
                return "Activity";
        }
        if ("object" === typeof type) switch("number" === typeof type.tag && console.error("Received an unexpected object in getComponentNameFromType(). This is likely a bug in React. Please file an issue."), type.$$typeof){
            case REACT_PORTAL_TYPE:
                return "Portal";
            case REACT_CONTEXT_TYPE:
                return (type.displayName || "Context") + ".Provider";
            case REACT_CONSUMER_TYPE:
                return (type._context.displayName || "Context") + ".Consumer";
            case REACT_FORWARD_REF_TYPE:
                var innerType = type.render;
                type = type.displayName;
                type || (type = innerType.displayName || innerType.name || "", type = "" !== type ? "ForwardRef(" + type + ")" : "ForwardRef");
                return type;
            case REACT_MEMO_TYPE:
                return innerType = type.displayName || null, null !== innerType ? innerType : getComponentNameFromType(type.type) || "Memo";
            case REACT_LAZY_TYPE:
                innerType = type._payload;
                type = type._init;
                try {
                    return getComponentNameFromType(type(innerType));
                } catch (x) {}
        }
        return null;
    }
    function testStringCoercion(value) {
        return "" + value;
    }
    function checkKeyStringCoercion(value) {
        try {
            testStringCoercion(value);
            var JSCompiler_inline_result = !1;
        } catch (e) {
            JSCompiler_inline_result = !0;
        }
        if (JSCompiler_inline_result) {
            JSCompiler_inline_result = console;
            var JSCompiler_temp_const = JSCompiler_inline_result.error;
            var JSCompiler_inline_result$jscomp$0 = "function" === typeof Symbol && Symbol.toStringTag && value[Symbol.toStringTag] || value.constructor.name || "Object";
            JSCompiler_temp_const.call(JSCompiler_inline_result, "The provided key is an unsupported type %s. This value must be coerced to a string before using it here.", JSCompiler_inline_result$jscomp$0);
            return testStringCoercion(value);
        }
    }
    function getTaskName(type) {
        if (type === REACT_FRAGMENT_TYPE) return "<>";
        if ("object" === typeof type && null !== type && type.$$typeof === REACT_LAZY_TYPE) return "<...>";
        try {
            var name = getComponentNameFromType(type);
            return name ? "<" + name + ">" : "<...>";
        } catch (x) {
            return "<...>";
        }
    }
    function getOwner() {
        var dispatcher = ReactSharedInternals.A;
        return null === dispatcher ? null : dispatcher.getOwner();
    }
    function UnknownOwner() {
        return Error("react-stack-top-frame");
    }
    function hasValidKey(config) {
        if (hasOwnProperty.call(config, "key")) {
            var getter = Object.getOwnPropertyDescriptor(config, "key").get;
            if (getter && getter.isReactWarning) return !1;
        }
        return void 0 !== config.key;
    }
    function defineKeyPropWarningGetter(props, displayName) {
        function warnAboutAccessingKey() {
            specialPropKeyWarningShown || (specialPropKeyWarningShown = !0, console.error("%s: `key` is not a prop. Trying to access it will result in `undefined` being returned. If you need to access the same value within the child component, you should pass it as a different prop. (https://react.dev/link/special-props)", displayName));
        }
        warnAboutAccessingKey.isReactWarning = !0;
        Object.defineProperty(props, "key", {
            get: warnAboutAccessingKey,
            configurable: !0
        });
    }
    function elementRefGetterWithDeprecationWarning() {
        var componentName = getComponentNameFromType(this.type);
        didWarnAboutElementRef[componentName] || (didWarnAboutElementRef[componentName] = !0, console.error("Accessing element.ref was removed in React 19. ref is now a regular prop. It will be removed from the JSX Element type in a future release."));
        componentName = this.props.ref;
        return void 0 !== componentName ? componentName : null;
    }
    function ReactElement(type, key, self, source, owner, props, debugStack, debugTask) {
        self = props.ref;
        type = {
            $$typeof: REACT_ELEMENT_TYPE,
            type: type,
            key: key,
            props: props,
            _owner: owner
        };
        null !== (void 0 !== self ? self : null) ? Object.defineProperty(type, "ref", {
            enumerable: !1,
            get: elementRefGetterWithDeprecationWarning
        }) : Object.defineProperty(type, "ref", {
            enumerable: !1,
            value: null
        });
        type._store = {};
        Object.defineProperty(type._store, "validated", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: 0
        });
        Object.defineProperty(type, "_debugInfo", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: null
        });
        Object.defineProperty(type, "_debugStack", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugStack
        });
        Object.defineProperty(type, "_debugTask", {
            configurable: !1,
            enumerable: !1,
            writable: !0,
            value: debugTask
        });
        Object.freeze && (Object.freeze(type.props), Object.freeze(type));
        return type;
    }
    function jsxDEVImpl(type, config, maybeKey, isStaticChildren, source, self, debugStack, debugTask) {
        var children = config.children;
        if (void 0 !== children) if (isStaticChildren) if (isArrayImpl(children)) {
            for(isStaticChildren = 0; isStaticChildren < children.length; isStaticChildren++)validateChildKeys(children[isStaticChildren]);
            Object.freeze && Object.freeze(children);
        } else console.error("React.jsx: Static children should always be an array. You are likely explicitly calling React.jsxs or React.jsxDEV. Use the Babel transform instead.");
        else validateChildKeys(children);
        if (hasOwnProperty.call(config, "key")) {
            children = getComponentNameFromType(type);
            var keys = Object.keys(config).filter(function(k) {
                return "key" !== k;
            });
            isStaticChildren = 0 < keys.length ? "{key: someKey, " + keys.join(": ..., ") + ": ...}" : "{key: someKey}";
            didWarnAboutKeySpread[children + isStaticChildren] || (keys = 0 < keys.length ? "{" + keys.join(": ..., ") + ": ...}" : "{}", console.error('A props object containing a "key" prop is being spread into JSX:\n  let props = %s;\n  <%s {...props} />\nReact keys must be passed directly to JSX without using spread:\n  let props = %s;\n  <%s key={someKey} {...props} />', isStaticChildren, children, keys, children), didWarnAboutKeySpread[children + isStaticChildren] = !0);
        }
        children = null;
        void 0 !== maybeKey && (checkKeyStringCoercion(maybeKey), children = "" + maybeKey);
        hasValidKey(config) && (checkKeyStringCoercion(config.key), children = "" + config.key);
        if ("key" in config) {
            maybeKey = {};
            for(var propName in config)"key" !== propName && (maybeKey[propName] = config[propName]);
        } else maybeKey = config;
        children && defineKeyPropWarningGetter(maybeKey, "function" === typeof type ? type.displayName || type.name || "Unknown" : type);
        return ReactElement(type, children, self, source, getOwner(), maybeKey, debugStack, debugTask);
    }
    function validateChildKeys(node) {
        "object" === typeof node && null !== node && node.$$typeof === REACT_ELEMENT_TYPE && node._store && (node._store.validated = 1);
    }
    var React = __turbopack_context__.r("[project]/apps/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), REACT_ELEMENT_TYPE = Symbol.for("react.transitional.element"), REACT_PORTAL_TYPE = Symbol.for("react.portal"), REACT_FRAGMENT_TYPE = Symbol.for("react.fragment"), REACT_STRICT_MODE_TYPE = Symbol.for("react.strict_mode"), REACT_PROFILER_TYPE = Symbol.for("react.profiler");
    Symbol.for("react.provider");
    var REACT_CONSUMER_TYPE = Symbol.for("react.consumer"), REACT_CONTEXT_TYPE = Symbol.for("react.context"), REACT_FORWARD_REF_TYPE = Symbol.for("react.forward_ref"), REACT_SUSPENSE_TYPE = Symbol.for("react.suspense"), REACT_SUSPENSE_LIST_TYPE = Symbol.for("react.suspense_list"), REACT_MEMO_TYPE = Symbol.for("react.memo"), REACT_LAZY_TYPE = Symbol.for("react.lazy"), REACT_ACTIVITY_TYPE = Symbol.for("react.activity"), REACT_CLIENT_REFERENCE = Symbol.for("react.client.reference"), ReactSharedInternals = React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE, hasOwnProperty = Object.prototype.hasOwnProperty, isArrayImpl = Array.isArray, createTask = console.createTask ? console.createTask : function() {
        return null;
    };
    React = {
        "react-stack-bottom-frame": function(callStackForError) {
            return callStackForError();
        }
    };
    var specialPropKeyWarningShown;
    var didWarnAboutElementRef = {};
    var unknownOwnerDebugStack = React["react-stack-bottom-frame"].bind(React, UnknownOwner)();
    var unknownOwnerDebugTask = createTask(getTaskName(UnknownOwner));
    var didWarnAboutKeySpread = {};
    exports.Fragment = REACT_FRAGMENT_TYPE;
    exports.jsxDEV = function(type, config, maybeKey, isStaticChildren, source, self) {
        var trackActualOwner = 1e4 > ReactSharedInternals.recentlyCreatedOwnerStacks++;
        return jsxDEVImpl(type, config, maybeKey, isStaticChildren, source, self, trackActualOwner ? Error("react-stack-top-frame") : unknownOwnerDebugStack, trackActualOwner ? createTask(getTaskName(type)) : unknownOwnerDebugTask);
    };
}();
}}),
"[project]/apps/web/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) {
    "TURBOPACK unreachable";
} else {
    module.exports = __turbopack_context__.r("[project]/apps/web/node_modules/next/dist/compiled/react/cjs/react-jsx-dev-runtime.development.js [app-client] (ecmascript)");
}
}}),
"[project]/apps/web/node_modules/next/dist/compiled/buffer/index.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
(function() {
    var e = {
        675: function(e, r) {
            "use strict";
            r.byteLength = byteLength;
            r.toByteArray = toByteArray;
            r.fromByteArray = fromByteArray;
            var t = [];
            var f = [];
            var n = typeof Uint8Array !== "undefined" ? Uint8Array : Array;
            var i = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
            for(var o = 0, u = i.length; o < u; ++o){
                t[o] = i[o];
                f[i.charCodeAt(o)] = o;
            }
            f["-".charCodeAt(0)] = 62;
            f["_".charCodeAt(0)] = 63;
            function getLens(e) {
                var r = e.length;
                if (r % 4 > 0) {
                    throw new Error("Invalid string. Length must be a multiple of 4");
                }
                var t = e.indexOf("=");
                if (t === -1) t = r;
                var f = t === r ? 0 : 4 - t % 4;
                return [
                    t,
                    f
                ];
            }
            function byteLength(e) {
                var r = getLens(e);
                var t = r[0];
                var f = r[1];
                return (t + f) * 3 / 4 - f;
            }
            function _byteLength(e, r, t) {
                return (r + t) * 3 / 4 - t;
            }
            function toByteArray(e) {
                var r;
                var t = getLens(e);
                var i = t[0];
                var o = t[1];
                var u = new n(_byteLength(e, i, o));
                var a = 0;
                var s = o > 0 ? i - 4 : i;
                var h;
                for(h = 0; h < s; h += 4){
                    r = f[e.charCodeAt(h)] << 18 | f[e.charCodeAt(h + 1)] << 12 | f[e.charCodeAt(h + 2)] << 6 | f[e.charCodeAt(h + 3)];
                    u[a++] = r >> 16 & 255;
                    u[a++] = r >> 8 & 255;
                    u[a++] = r & 255;
                }
                if (o === 2) {
                    r = f[e.charCodeAt(h)] << 2 | f[e.charCodeAt(h + 1)] >> 4;
                    u[a++] = r & 255;
                }
                if (o === 1) {
                    r = f[e.charCodeAt(h)] << 10 | f[e.charCodeAt(h + 1)] << 4 | f[e.charCodeAt(h + 2)] >> 2;
                    u[a++] = r >> 8 & 255;
                    u[a++] = r & 255;
                }
                return u;
            }
            function tripletToBase64(e) {
                return t[e >> 18 & 63] + t[e >> 12 & 63] + t[e >> 6 & 63] + t[e & 63];
            }
            function encodeChunk(e, r, t) {
                var f;
                var n = [];
                for(var i = r; i < t; i += 3){
                    f = (e[i] << 16 & 16711680) + (e[i + 1] << 8 & 65280) + (e[i + 2] & 255);
                    n.push(tripletToBase64(f));
                }
                return n.join("");
            }
            function fromByteArray(e) {
                var r;
                var f = e.length;
                var n = f % 3;
                var i = [];
                var o = 16383;
                for(var u = 0, a = f - n; u < a; u += o){
                    i.push(encodeChunk(e, u, u + o > a ? a : u + o));
                }
                if (n === 1) {
                    r = e[f - 1];
                    i.push(t[r >> 2] + t[r << 4 & 63] + "==");
                } else if (n === 2) {
                    r = (e[f - 2] << 8) + e[f - 1];
                    i.push(t[r >> 10] + t[r >> 4 & 63] + t[r << 2 & 63] + "=");
                }
                return i.join("");
            }
        },
        72: function(e, r, t) {
            "use strict";
            /*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <https://feross.org>
 * @license  MIT
 */ var f = t(675);
            var n = t(783);
            var i = typeof Symbol === "function" && typeof Symbol.for === "function" ? Symbol.for("nodejs.util.inspect.custom") : null;
            r.Buffer = Buffer;
            r.SlowBuffer = SlowBuffer;
            r.INSPECT_MAX_BYTES = 50;
            var o = 2147483647;
            r.kMaxLength = o;
            Buffer.TYPED_ARRAY_SUPPORT = typedArraySupport();
            if (!Buffer.TYPED_ARRAY_SUPPORT && typeof console !== "undefined" && typeof console.error === "function") {
                console.error("This browser lacks typed array (Uint8Array) support which is required by " + "`buffer` v5.x. Use `buffer` v4.x if you require old browser support.");
            }
            function typedArraySupport() {
                try {
                    var e = new Uint8Array(1);
                    var r = {
                        foo: function() {
                            return 42;
                        }
                    };
                    Object.setPrototypeOf(r, Uint8Array.prototype);
                    Object.setPrototypeOf(e, r);
                    return e.foo() === 42;
                } catch (e) {
                    return false;
                }
            }
            Object.defineProperty(Buffer.prototype, "parent", {
                enumerable: true,
                get: function() {
                    if (!Buffer.isBuffer(this)) return undefined;
                    return this.buffer;
                }
            });
            Object.defineProperty(Buffer.prototype, "offset", {
                enumerable: true,
                get: function() {
                    if (!Buffer.isBuffer(this)) return undefined;
                    return this.byteOffset;
                }
            });
            function createBuffer(e) {
                if (e > o) {
                    throw new RangeError('The value "' + e + '" is invalid for option "size"');
                }
                var r = new Uint8Array(e);
                Object.setPrototypeOf(r, Buffer.prototype);
                return r;
            }
            function Buffer(e, r, t) {
                if (typeof e === "number") {
                    if (typeof r === "string") {
                        throw new TypeError('The "string" argument must be of type string. Received type number');
                    }
                    return allocUnsafe(e);
                }
                return from(e, r, t);
            }
            Buffer.poolSize = 8192;
            function from(e, r, t) {
                if (typeof e === "string") {
                    return fromString(e, r);
                }
                if (ArrayBuffer.isView(e)) {
                    return fromArrayLike(e);
                }
                if (e == null) {
                    throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, " + "or Array-like Object. Received type " + typeof e);
                }
                if (isInstance(e, ArrayBuffer) || e && isInstance(e.buffer, ArrayBuffer)) {
                    return fromArrayBuffer(e, r, t);
                }
                if (typeof SharedArrayBuffer !== "undefined" && (isInstance(e, SharedArrayBuffer) || e && isInstance(e.buffer, SharedArrayBuffer))) {
                    return fromArrayBuffer(e, r, t);
                }
                if (typeof e === "number") {
                    throw new TypeError('The "value" argument must not be of type number. Received type number');
                }
                var f = e.valueOf && e.valueOf();
                if (f != null && f !== e) {
                    return Buffer.from(f, r, t);
                }
                var n = fromObject(e);
                if (n) return n;
                if (typeof Symbol !== "undefined" && Symbol.toPrimitive != null && typeof e[Symbol.toPrimitive] === "function") {
                    return Buffer.from(e[Symbol.toPrimitive]("string"), r, t);
                }
                throw new TypeError("The first argument must be one of type string, Buffer, ArrayBuffer, Array, " + "or Array-like Object. Received type " + typeof e);
            }
            Buffer.from = function(e, r, t) {
                return from(e, r, t);
            };
            Object.setPrototypeOf(Buffer.prototype, Uint8Array.prototype);
            Object.setPrototypeOf(Buffer, Uint8Array);
            function assertSize(e) {
                if (typeof e !== "number") {
                    throw new TypeError('"size" argument must be of type number');
                } else if (e < 0) {
                    throw new RangeError('The value "' + e + '" is invalid for option "size"');
                }
            }
            function alloc(e, r, t) {
                assertSize(e);
                if (e <= 0) {
                    return createBuffer(e);
                }
                if (r !== undefined) {
                    return typeof t === "string" ? createBuffer(e).fill(r, t) : createBuffer(e).fill(r);
                }
                return createBuffer(e);
            }
            Buffer.alloc = function(e, r, t) {
                return alloc(e, r, t);
            };
            function allocUnsafe(e) {
                assertSize(e);
                return createBuffer(e < 0 ? 0 : checked(e) | 0);
            }
            Buffer.allocUnsafe = function(e) {
                return allocUnsafe(e);
            };
            Buffer.allocUnsafeSlow = function(e) {
                return allocUnsafe(e);
            };
            function fromString(e, r) {
                if (typeof r !== "string" || r === "") {
                    r = "utf8";
                }
                if (!Buffer.isEncoding(r)) {
                    throw new TypeError("Unknown encoding: " + r);
                }
                var t = byteLength(e, r) | 0;
                var f = createBuffer(t);
                var n = f.write(e, r);
                if (n !== t) {
                    f = f.slice(0, n);
                }
                return f;
            }
            function fromArrayLike(e) {
                var r = e.length < 0 ? 0 : checked(e.length) | 0;
                var t = createBuffer(r);
                for(var f = 0; f < r; f += 1){
                    t[f] = e[f] & 255;
                }
                return t;
            }
            function fromArrayBuffer(e, r, t) {
                if (r < 0 || e.byteLength < r) {
                    throw new RangeError('"offset" is outside of buffer bounds');
                }
                if (e.byteLength < r + (t || 0)) {
                    throw new RangeError('"length" is outside of buffer bounds');
                }
                var f;
                if (r === undefined && t === undefined) {
                    f = new Uint8Array(e);
                } else if (t === undefined) {
                    f = new Uint8Array(e, r);
                } else {
                    f = new Uint8Array(e, r, t);
                }
                Object.setPrototypeOf(f, Buffer.prototype);
                return f;
            }
            function fromObject(e) {
                if (Buffer.isBuffer(e)) {
                    var r = checked(e.length) | 0;
                    var t = createBuffer(r);
                    if (t.length === 0) {
                        return t;
                    }
                    e.copy(t, 0, 0, r);
                    return t;
                }
                if (e.length !== undefined) {
                    if (typeof e.length !== "number" || numberIsNaN(e.length)) {
                        return createBuffer(0);
                    }
                    return fromArrayLike(e);
                }
                if (e.type === "Buffer" && Array.isArray(e.data)) {
                    return fromArrayLike(e.data);
                }
            }
            function checked(e) {
                if (e >= o) {
                    throw new RangeError("Attempt to allocate Buffer larger than maximum " + "size: 0x" + o.toString(16) + " bytes");
                }
                return e | 0;
            }
            function SlowBuffer(e) {
                if (+e != e) {
                    e = 0;
                }
                return Buffer.alloc(+e);
            }
            Buffer.isBuffer = function isBuffer(e) {
                return e != null && e._isBuffer === true && e !== Buffer.prototype;
            };
            Buffer.compare = function compare(e, r) {
                if (isInstance(e, Uint8Array)) e = Buffer.from(e, e.offset, e.byteLength);
                if (isInstance(r, Uint8Array)) r = Buffer.from(r, r.offset, r.byteLength);
                if (!Buffer.isBuffer(e) || !Buffer.isBuffer(r)) {
                    throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
                }
                if (e === r) return 0;
                var t = e.length;
                var f = r.length;
                for(var n = 0, i = Math.min(t, f); n < i; ++n){
                    if (e[n] !== r[n]) {
                        t = e[n];
                        f = r[n];
                        break;
                    }
                }
                if (t < f) return -1;
                if (f < t) return 1;
                return 0;
            };
            Buffer.isEncoding = function isEncoding(e) {
                switch(String(e).toLowerCase()){
                    case "hex":
                    case "utf8":
                    case "utf-8":
                    case "ascii":
                    case "latin1":
                    case "binary":
                    case "base64":
                    case "ucs2":
                    case "ucs-2":
                    case "utf16le":
                    case "utf-16le":
                        return true;
                    default:
                        return false;
                }
            };
            Buffer.concat = function concat(e, r) {
                if (!Array.isArray(e)) {
                    throw new TypeError('"list" argument must be an Array of Buffers');
                }
                if (e.length === 0) {
                    return Buffer.alloc(0);
                }
                var t;
                if (r === undefined) {
                    r = 0;
                    for(t = 0; t < e.length; ++t){
                        r += e[t].length;
                    }
                }
                var f = Buffer.allocUnsafe(r);
                var n = 0;
                for(t = 0; t < e.length; ++t){
                    var i = e[t];
                    if (isInstance(i, Uint8Array)) {
                        i = Buffer.from(i);
                    }
                    if (!Buffer.isBuffer(i)) {
                        throw new TypeError('"list" argument must be an Array of Buffers');
                    }
                    i.copy(f, n);
                    n += i.length;
                }
                return f;
            };
            function byteLength(e, r) {
                if (Buffer.isBuffer(e)) {
                    return e.length;
                }
                if (ArrayBuffer.isView(e) || isInstance(e, ArrayBuffer)) {
                    return e.byteLength;
                }
                if (typeof e !== "string") {
                    throw new TypeError('The "string" argument must be one of type string, Buffer, or ArrayBuffer. ' + "Received type " + typeof e);
                }
                var t = e.length;
                var f = arguments.length > 2 && arguments[2] === true;
                if (!f && t === 0) return 0;
                var n = false;
                for(;;){
                    switch(r){
                        case "ascii":
                        case "latin1":
                        case "binary":
                            return t;
                        case "utf8":
                        case "utf-8":
                            return utf8ToBytes(e).length;
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                            return t * 2;
                        case "hex":
                            return t >>> 1;
                        case "base64":
                            return base64ToBytes(e).length;
                        default:
                            if (n) {
                                return f ? -1 : utf8ToBytes(e).length;
                            }
                            r = ("" + r).toLowerCase();
                            n = true;
                    }
                }
            }
            Buffer.byteLength = byteLength;
            function slowToString(e, r, t) {
                var f = false;
                if (r === undefined || r < 0) {
                    r = 0;
                }
                if (r > this.length) {
                    return "";
                }
                if (t === undefined || t > this.length) {
                    t = this.length;
                }
                if (t <= 0) {
                    return "";
                }
                t >>>= 0;
                r >>>= 0;
                if (t <= r) {
                    return "";
                }
                if (!e) e = "utf8";
                while(true){
                    switch(e){
                        case "hex":
                            return hexSlice(this, r, t);
                        case "utf8":
                        case "utf-8":
                            return utf8Slice(this, r, t);
                        case "ascii":
                            return asciiSlice(this, r, t);
                        case "latin1":
                        case "binary":
                            return latin1Slice(this, r, t);
                        case "base64":
                            return base64Slice(this, r, t);
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                            return utf16leSlice(this, r, t);
                        default:
                            if (f) throw new TypeError("Unknown encoding: " + e);
                            e = (e + "").toLowerCase();
                            f = true;
                    }
                }
            }
            Buffer.prototype._isBuffer = true;
            function swap(e, r, t) {
                var f = e[r];
                e[r] = e[t];
                e[t] = f;
            }
            Buffer.prototype.swap16 = function swap16() {
                var e = this.length;
                if (e % 2 !== 0) {
                    throw new RangeError("Buffer size must be a multiple of 16-bits");
                }
                for(var r = 0; r < e; r += 2){
                    swap(this, r, r + 1);
                }
                return this;
            };
            Buffer.prototype.swap32 = function swap32() {
                var e = this.length;
                if (e % 4 !== 0) {
                    throw new RangeError("Buffer size must be a multiple of 32-bits");
                }
                for(var r = 0; r < e; r += 4){
                    swap(this, r, r + 3);
                    swap(this, r + 1, r + 2);
                }
                return this;
            };
            Buffer.prototype.swap64 = function swap64() {
                var e = this.length;
                if (e % 8 !== 0) {
                    throw new RangeError("Buffer size must be a multiple of 64-bits");
                }
                for(var r = 0; r < e; r += 8){
                    swap(this, r, r + 7);
                    swap(this, r + 1, r + 6);
                    swap(this, r + 2, r + 5);
                    swap(this, r + 3, r + 4);
                }
                return this;
            };
            Buffer.prototype.toString = function toString() {
                var e = this.length;
                if (e === 0) return "";
                if (arguments.length === 0) return utf8Slice(this, 0, e);
                return slowToString.apply(this, arguments);
            };
            Buffer.prototype.toLocaleString = Buffer.prototype.toString;
            Buffer.prototype.equals = function equals(e) {
                if (!Buffer.isBuffer(e)) throw new TypeError("Argument must be a Buffer");
                if (this === e) return true;
                return Buffer.compare(this, e) === 0;
            };
            Buffer.prototype.inspect = function inspect() {
                var e = "";
                var t = r.INSPECT_MAX_BYTES;
                e = this.toString("hex", 0, t).replace(/(.{2})/g, "$1 ").trim();
                if (this.length > t) e += " ... ";
                return "<Buffer " + e + ">";
            };
            if (i) {
                Buffer.prototype[i] = Buffer.prototype.inspect;
            }
            Buffer.prototype.compare = function compare(e, r, t, f, n) {
                if (isInstance(e, Uint8Array)) {
                    e = Buffer.from(e, e.offset, e.byteLength);
                }
                if (!Buffer.isBuffer(e)) {
                    throw new TypeError('The "target" argument must be one of type Buffer or Uint8Array. ' + "Received type " + typeof e);
                }
                if (r === undefined) {
                    r = 0;
                }
                if (t === undefined) {
                    t = e ? e.length : 0;
                }
                if (f === undefined) {
                    f = 0;
                }
                if (n === undefined) {
                    n = this.length;
                }
                if (r < 0 || t > e.length || f < 0 || n > this.length) {
                    throw new RangeError("out of range index");
                }
                if (f >= n && r >= t) {
                    return 0;
                }
                if (f >= n) {
                    return -1;
                }
                if (r >= t) {
                    return 1;
                }
                r >>>= 0;
                t >>>= 0;
                f >>>= 0;
                n >>>= 0;
                if (this === e) return 0;
                var i = n - f;
                var o = t - r;
                var u = Math.min(i, o);
                var a = this.slice(f, n);
                var s = e.slice(r, t);
                for(var h = 0; h < u; ++h){
                    if (a[h] !== s[h]) {
                        i = a[h];
                        o = s[h];
                        break;
                    }
                }
                if (i < o) return -1;
                if (o < i) return 1;
                return 0;
            };
            function bidirectionalIndexOf(e, r, t, f, n) {
                if (e.length === 0) return -1;
                if (typeof t === "string") {
                    f = t;
                    t = 0;
                } else if (t > 2147483647) {
                    t = 2147483647;
                } else if (t < -2147483648) {
                    t = -2147483648;
                }
                t = +t;
                if (numberIsNaN(t)) {
                    t = n ? 0 : e.length - 1;
                }
                if (t < 0) t = e.length + t;
                if (t >= e.length) {
                    if (n) return -1;
                    else t = e.length - 1;
                } else if (t < 0) {
                    if (n) t = 0;
                    else return -1;
                }
                if (typeof r === "string") {
                    r = Buffer.from(r, f);
                }
                if (Buffer.isBuffer(r)) {
                    if (r.length === 0) {
                        return -1;
                    }
                    return arrayIndexOf(e, r, t, f, n);
                } else if (typeof r === "number") {
                    r = r & 255;
                    if (typeof Uint8Array.prototype.indexOf === "function") {
                        if (n) {
                            return Uint8Array.prototype.indexOf.call(e, r, t);
                        } else {
                            return Uint8Array.prototype.lastIndexOf.call(e, r, t);
                        }
                    }
                    return arrayIndexOf(e, [
                        r
                    ], t, f, n);
                }
                throw new TypeError("val must be string, number or Buffer");
            }
            function arrayIndexOf(e, r, t, f, n) {
                var i = 1;
                var o = e.length;
                var u = r.length;
                if (f !== undefined) {
                    f = String(f).toLowerCase();
                    if (f === "ucs2" || f === "ucs-2" || f === "utf16le" || f === "utf-16le") {
                        if (e.length < 2 || r.length < 2) {
                            return -1;
                        }
                        i = 2;
                        o /= 2;
                        u /= 2;
                        t /= 2;
                    }
                }
                function read(e, r) {
                    if (i === 1) {
                        return e[r];
                    } else {
                        return e.readUInt16BE(r * i);
                    }
                }
                var a;
                if (n) {
                    var s = -1;
                    for(a = t; a < o; a++){
                        if (read(e, a) === read(r, s === -1 ? 0 : a - s)) {
                            if (s === -1) s = a;
                            if (a - s + 1 === u) return s * i;
                        } else {
                            if (s !== -1) a -= a - s;
                            s = -1;
                        }
                    }
                } else {
                    if (t + u > o) t = o - u;
                    for(a = t; a >= 0; a--){
                        var h = true;
                        for(var c = 0; c < u; c++){
                            if (read(e, a + c) !== read(r, c)) {
                                h = false;
                                break;
                            }
                        }
                        if (h) return a;
                    }
                }
                return -1;
            }
            Buffer.prototype.includes = function includes(e, r, t) {
                return this.indexOf(e, r, t) !== -1;
            };
            Buffer.prototype.indexOf = function indexOf(e, r, t) {
                return bidirectionalIndexOf(this, e, r, t, true);
            };
            Buffer.prototype.lastIndexOf = function lastIndexOf(e, r, t) {
                return bidirectionalIndexOf(this, e, r, t, false);
            };
            function hexWrite(e, r, t, f) {
                t = Number(t) || 0;
                var n = e.length - t;
                if (!f) {
                    f = n;
                } else {
                    f = Number(f);
                    if (f > n) {
                        f = n;
                    }
                }
                var i = r.length;
                if (f > i / 2) {
                    f = i / 2;
                }
                for(var o = 0; o < f; ++o){
                    var u = parseInt(r.substr(o * 2, 2), 16);
                    if (numberIsNaN(u)) return o;
                    e[t + o] = u;
                }
                return o;
            }
            function utf8Write(e, r, t, f) {
                return blitBuffer(utf8ToBytes(r, e.length - t), e, t, f);
            }
            function asciiWrite(e, r, t, f) {
                return blitBuffer(asciiToBytes(r), e, t, f);
            }
            function latin1Write(e, r, t, f) {
                return asciiWrite(e, r, t, f);
            }
            function base64Write(e, r, t, f) {
                return blitBuffer(base64ToBytes(r), e, t, f);
            }
            function ucs2Write(e, r, t, f) {
                return blitBuffer(utf16leToBytes(r, e.length - t), e, t, f);
            }
            Buffer.prototype.write = function write(e, r, t, f) {
                if (r === undefined) {
                    f = "utf8";
                    t = this.length;
                    r = 0;
                } else if (t === undefined && typeof r === "string") {
                    f = r;
                    t = this.length;
                    r = 0;
                } else if (isFinite(r)) {
                    r = r >>> 0;
                    if (isFinite(t)) {
                        t = t >>> 0;
                        if (f === undefined) f = "utf8";
                    } else {
                        f = t;
                        t = undefined;
                    }
                } else {
                    throw new Error("Buffer.write(string, encoding, offset[, length]) is no longer supported");
                }
                var n = this.length - r;
                if (t === undefined || t > n) t = n;
                if (e.length > 0 && (t < 0 || r < 0) || r > this.length) {
                    throw new RangeError("Attempt to write outside buffer bounds");
                }
                if (!f) f = "utf8";
                var i = false;
                for(;;){
                    switch(f){
                        case "hex":
                            return hexWrite(this, e, r, t);
                        case "utf8":
                        case "utf-8":
                            return utf8Write(this, e, r, t);
                        case "ascii":
                            return asciiWrite(this, e, r, t);
                        case "latin1":
                        case "binary":
                            return latin1Write(this, e, r, t);
                        case "base64":
                            return base64Write(this, e, r, t);
                        case "ucs2":
                        case "ucs-2":
                        case "utf16le":
                        case "utf-16le":
                            return ucs2Write(this, e, r, t);
                        default:
                            if (i) throw new TypeError("Unknown encoding: " + f);
                            f = ("" + f).toLowerCase();
                            i = true;
                    }
                }
            };
            Buffer.prototype.toJSON = function toJSON() {
                return {
                    type: "Buffer",
                    data: Array.prototype.slice.call(this._arr || this, 0)
                };
            };
            function base64Slice(e, r, t) {
                if (r === 0 && t === e.length) {
                    return f.fromByteArray(e);
                } else {
                    return f.fromByteArray(e.slice(r, t));
                }
            }
            function utf8Slice(e, r, t) {
                t = Math.min(e.length, t);
                var f = [];
                var n = r;
                while(n < t){
                    var i = e[n];
                    var o = null;
                    var u = i > 239 ? 4 : i > 223 ? 3 : i > 191 ? 2 : 1;
                    if (n + u <= t) {
                        var a, s, h, c;
                        switch(u){
                            case 1:
                                if (i < 128) {
                                    o = i;
                                }
                                break;
                            case 2:
                                a = e[n + 1];
                                if ((a & 192) === 128) {
                                    c = (i & 31) << 6 | a & 63;
                                    if (c > 127) {
                                        o = c;
                                    }
                                }
                                break;
                            case 3:
                                a = e[n + 1];
                                s = e[n + 2];
                                if ((a & 192) === 128 && (s & 192) === 128) {
                                    c = (i & 15) << 12 | (a & 63) << 6 | s & 63;
                                    if (c > 2047 && (c < 55296 || c > 57343)) {
                                        o = c;
                                    }
                                }
                                break;
                            case 4:
                                a = e[n + 1];
                                s = e[n + 2];
                                h = e[n + 3];
                                if ((a & 192) === 128 && (s & 192) === 128 && (h & 192) === 128) {
                                    c = (i & 15) << 18 | (a & 63) << 12 | (s & 63) << 6 | h & 63;
                                    if (c > 65535 && c < 1114112) {
                                        o = c;
                                    }
                                }
                        }
                    }
                    if (o === null) {
                        o = 65533;
                        u = 1;
                    } else if (o > 65535) {
                        o -= 65536;
                        f.push(o >>> 10 & 1023 | 55296);
                        o = 56320 | o & 1023;
                    }
                    f.push(o);
                    n += u;
                }
                return decodeCodePointsArray(f);
            }
            var u = 4096;
            function decodeCodePointsArray(e) {
                var r = e.length;
                if (r <= u) {
                    return String.fromCharCode.apply(String, e);
                }
                var t = "";
                var f = 0;
                while(f < r){
                    t += String.fromCharCode.apply(String, e.slice(f, f += u));
                }
                return t;
            }
            function asciiSlice(e, r, t) {
                var f = "";
                t = Math.min(e.length, t);
                for(var n = r; n < t; ++n){
                    f += String.fromCharCode(e[n] & 127);
                }
                return f;
            }
            function latin1Slice(e, r, t) {
                var f = "";
                t = Math.min(e.length, t);
                for(var n = r; n < t; ++n){
                    f += String.fromCharCode(e[n]);
                }
                return f;
            }
            function hexSlice(e, r, t) {
                var f = e.length;
                if (!r || r < 0) r = 0;
                if (!t || t < 0 || t > f) t = f;
                var n = "";
                for(var i = r; i < t; ++i){
                    n += s[e[i]];
                }
                return n;
            }
            function utf16leSlice(e, r, t) {
                var f = e.slice(r, t);
                var n = "";
                for(var i = 0; i < f.length; i += 2){
                    n += String.fromCharCode(f[i] + f[i + 1] * 256);
                }
                return n;
            }
            Buffer.prototype.slice = function slice(e, r) {
                var t = this.length;
                e = ~~e;
                r = r === undefined ? t : ~~r;
                if (e < 0) {
                    e += t;
                    if (e < 0) e = 0;
                } else if (e > t) {
                    e = t;
                }
                if (r < 0) {
                    r += t;
                    if (r < 0) r = 0;
                } else if (r > t) {
                    r = t;
                }
                if (r < e) r = e;
                var f = this.subarray(e, r);
                Object.setPrototypeOf(f, Buffer.prototype);
                return f;
            };
            function checkOffset(e, r, t) {
                if (e % 1 !== 0 || e < 0) throw new RangeError("offset is not uint");
                if (e + r > t) throw new RangeError("Trying to access beyond buffer length");
            }
            Buffer.prototype.readUIntLE = function readUIntLE(e, r, t) {
                e = e >>> 0;
                r = r >>> 0;
                if (!t) checkOffset(e, r, this.length);
                var f = this[e];
                var n = 1;
                var i = 0;
                while(++i < r && (n *= 256)){
                    f += this[e + i] * n;
                }
                return f;
            };
            Buffer.prototype.readUIntBE = function readUIntBE(e, r, t) {
                e = e >>> 0;
                r = r >>> 0;
                if (!t) {
                    checkOffset(e, r, this.length);
                }
                var f = this[e + --r];
                var n = 1;
                while(r > 0 && (n *= 256)){
                    f += this[e + --r] * n;
                }
                return f;
            };
            Buffer.prototype.readUInt8 = function readUInt8(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 1, this.length);
                return this[e];
            };
            Buffer.prototype.readUInt16LE = function readUInt16LE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 2, this.length);
                return this[e] | this[e + 1] << 8;
            };
            Buffer.prototype.readUInt16BE = function readUInt16BE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 2, this.length);
                return this[e] << 8 | this[e + 1];
            };
            Buffer.prototype.readUInt32LE = function readUInt32LE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 4, this.length);
                return (this[e] | this[e + 1] << 8 | this[e + 2] << 16) + this[e + 3] * 16777216;
            };
            Buffer.prototype.readUInt32BE = function readUInt32BE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 4, this.length);
                return this[e] * 16777216 + (this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3]);
            };
            Buffer.prototype.readIntLE = function readIntLE(e, r, t) {
                e = e >>> 0;
                r = r >>> 0;
                if (!t) checkOffset(e, r, this.length);
                var f = this[e];
                var n = 1;
                var i = 0;
                while(++i < r && (n *= 256)){
                    f += this[e + i] * n;
                }
                n *= 128;
                if (f >= n) f -= Math.pow(2, 8 * r);
                return f;
            };
            Buffer.prototype.readIntBE = function readIntBE(e, r, t) {
                e = e >>> 0;
                r = r >>> 0;
                if (!t) checkOffset(e, r, this.length);
                var f = r;
                var n = 1;
                var i = this[e + --f];
                while(f > 0 && (n *= 256)){
                    i += this[e + --f] * n;
                }
                n *= 128;
                if (i >= n) i -= Math.pow(2, 8 * r);
                return i;
            };
            Buffer.prototype.readInt8 = function readInt8(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 1, this.length);
                if (!(this[e] & 128)) return this[e];
                return (255 - this[e] + 1) * -1;
            };
            Buffer.prototype.readInt16LE = function readInt16LE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 2, this.length);
                var t = this[e] | this[e + 1] << 8;
                return t & 32768 ? t | 4294901760 : t;
            };
            Buffer.prototype.readInt16BE = function readInt16BE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 2, this.length);
                var t = this[e + 1] | this[e] << 8;
                return t & 32768 ? t | 4294901760 : t;
            };
            Buffer.prototype.readInt32LE = function readInt32LE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 4, this.length);
                return this[e] | this[e + 1] << 8 | this[e + 2] << 16 | this[e + 3] << 24;
            };
            Buffer.prototype.readInt32BE = function readInt32BE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 4, this.length);
                return this[e] << 24 | this[e + 1] << 16 | this[e + 2] << 8 | this[e + 3];
            };
            Buffer.prototype.readFloatLE = function readFloatLE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 4, this.length);
                return n.read(this, e, true, 23, 4);
            };
            Buffer.prototype.readFloatBE = function readFloatBE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 4, this.length);
                return n.read(this, e, false, 23, 4);
            };
            Buffer.prototype.readDoubleLE = function readDoubleLE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 8, this.length);
                return n.read(this, e, true, 52, 8);
            };
            Buffer.prototype.readDoubleBE = function readDoubleBE(e, r) {
                e = e >>> 0;
                if (!r) checkOffset(e, 8, this.length);
                return n.read(this, e, false, 52, 8);
            };
            function checkInt(e, r, t, f, n, i) {
                if (!Buffer.isBuffer(e)) throw new TypeError('"buffer" argument must be a Buffer instance');
                if (r > n || r < i) throw new RangeError('"value" argument is out of bounds');
                if (t + f > e.length) throw new RangeError("Index out of range");
            }
            Buffer.prototype.writeUIntLE = function writeUIntLE(e, r, t, f) {
                e = +e;
                r = r >>> 0;
                t = t >>> 0;
                if (!f) {
                    var n = Math.pow(2, 8 * t) - 1;
                    checkInt(this, e, r, t, n, 0);
                }
                var i = 1;
                var o = 0;
                this[r] = e & 255;
                while(++o < t && (i *= 256)){
                    this[r + o] = e / i & 255;
                }
                return r + t;
            };
            Buffer.prototype.writeUIntBE = function writeUIntBE(e, r, t, f) {
                e = +e;
                r = r >>> 0;
                t = t >>> 0;
                if (!f) {
                    var n = Math.pow(2, 8 * t) - 1;
                    checkInt(this, e, r, t, n, 0);
                }
                var i = t - 1;
                var o = 1;
                this[r + i] = e & 255;
                while(--i >= 0 && (o *= 256)){
                    this[r + i] = e / o & 255;
                }
                return r + t;
            };
            Buffer.prototype.writeUInt8 = function writeUInt8(e, r, t) {
                e = +e;
                r = r >>> 0;
                if (!t) checkInt(this, e, r, 1, 255, 0);
                this[r] = e & 255;
                return r + 1;
            };
            Buffer.prototype.writeUInt16LE = function writeUInt16LE(e, r, t) {
                e = +e;
                r = r >>> 0;
                if (!t) checkInt(this, e, r, 2, 65535, 0);
                this[r] = e & 255;
                this[r + 1] = e >>> 8;
                return r + 2;
            };
            Buffer.prototype.writeUInt16BE = function writeUInt16BE(e, r, t) {
                e = +e;
                r = r >>> 0;
                if (!t) checkInt(this, e, r, 2, 65535, 0);
                this[r] = e >>> 8;
                this[r + 1] = e & 255;
                return r + 2;
            };
            Buffer.prototype.writeUInt32LE = function writeUInt32LE(e, r, t) {
                e = +e;
                r = r >>> 0;
                if (!t) checkInt(this, e, r, 4, 4294967295, 0);
                this[r + 3] = e >>> 24;
                this[r + 2] = e >>> 16;
                this[r + 1] = e >>> 8;
                this[r] = e & 255;
                return r + 4;
            };
            Buffer.prototype.writeUInt32BE = function writeUInt32BE(e, r, t) {
                e = +e;
                r = r >>> 0;
                if (!t) checkInt(this, e, r, 4, 4294967295, 0);
                this[r] = e >>> 24;
                this[r + 1] = e >>> 16;
                this[r + 2] = e >>> 8;
                this[r + 3] = e & 255;
                return r + 4;
            };
            Buffer.prototype.writeIntLE = function writeIntLE(e, r, t, f) {
                e = +e;
                r = r >>> 0;
                if (!f) {
                    var n = Math.pow(2, 8 * t - 1);
                    checkInt(this, e, r, t, n - 1, -n);
                }
                var i = 0;
                var o = 1;
                var u = 0;
                this[r] = e & 255;
                while(++i < t && (o *= 256)){
                    if (e < 0 && u === 0 && this[r + i - 1] !== 0) {
                        u = 1;
                    }
                    this[r + i] = (e / o >> 0) - u & 255;
                }
                return r + t;
            };
            Buffer.prototype.writeIntBE = function writeIntBE(e, r, t, f) {
                e = +e;
                r = r >>> 0;
                if (!f) {
                    var n = Math.pow(2, 8 * t - 1);
                    checkInt(this, e, r, t, n - 1, -n);
                }
                var i = t - 1;
                var o = 1;
                var u = 0;
                this[r + i] = e & 255;
                while(--i >= 0 && (o *= 256)){
                    if (e < 0 && u === 0 && this[r + i + 1] !== 0) {
                        u = 1;
                    }
                    this[r + i] = (e / o >> 0) - u & 255;
                }
                return r + t;
            };
            Buffer.prototype.writeInt8 = function writeInt8(e, r, t) {
                e = +e;
                r = r >>> 0;
                if (!t) checkInt(this, e, r, 1, 127, -128);
                if (e < 0) e = 255 + e + 1;
                this[r] = e & 255;
                return r + 1;
            };
            Buffer.prototype.writeInt16LE = function writeInt16LE(e, r, t) {
                e = +e;
                r = r >>> 0;
                if (!t) checkInt(this, e, r, 2, 32767, -32768);
                this[r] = e & 255;
                this[r + 1] = e >>> 8;
                return r + 2;
            };
            Buffer.prototype.writeInt16BE = function writeInt16BE(e, r, t) {
                e = +e;
                r = r >>> 0;
                if (!t) checkInt(this, e, r, 2, 32767, -32768);
                this[r] = e >>> 8;
                this[r + 1] = e & 255;
                return r + 2;
            };
            Buffer.prototype.writeInt32LE = function writeInt32LE(e, r, t) {
                e = +e;
                r = r >>> 0;
                if (!t) checkInt(this, e, r, 4, 2147483647, -2147483648);
                this[r] = e & 255;
                this[r + 1] = e >>> 8;
                this[r + 2] = e >>> 16;
                this[r + 3] = e >>> 24;
                return r + 4;
            };
            Buffer.prototype.writeInt32BE = function writeInt32BE(e, r, t) {
                e = +e;
                r = r >>> 0;
                if (!t) checkInt(this, e, r, 4, 2147483647, -2147483648);
                if (e < 0) e = 4294967295 + e + 1;
                this[r] = e >>> 24;
                this[r + 1] = e >>> 16;
                this[r + 2] = e >>> 8;
                this[r + 3] = e & 255;
                return r + 4;
            };
            function checkIEEE754(e, r, t, f, n, i) {
                if (t + f > e.length) throw new RangeError("Index out of range");
                if (t < 0) throw new RangeError("Index out of range");
            }
            function writeFloat(e, r, t, f, i) {
                r = +r;
                t = t >>> 0;
                if (!i) {
                    checkIEEE754(e, r, t, 4, 34028234663852886e22, -34028234663852886e22);
                }
                n.write(e, r, t, f, 23, 4);
                return t + 4;
            }
            Buffer.prototype.writeFloatLE = function writeFloatLE(e, r, t) {
                return writeFloat(this, e, r, true, t);
            };
            Buffer.prototype.writeFloatBE = function writeFloatBE(e, r, t) {
                return writeFloat(this, e, r, false, t);
            };
            function writeDouble(e, r, t, f, i) {
                r = +r;
                t = t >>> 0;
                if (!i) {
                    checkIEEE754(e, r, t, 8, 17976931348623157e292, -17976931348623157e292);
                }
                n.write(e, r, t, f, 52, 8);
                return t + 8;
            }
            Buffer.prototype.writeDoubleLE = function writeDoubleLE(e, r, t) {
                return writeDouble(this, e, r, true, t);
            };
            Buffer.prototype.writeDoubleBE = function writeDoubleBE(e, r, t) {
                return writeDouble(this, e, r, false, t);
            };
            Buffer.prototype.copy = function copy(e, r, t, f) {
                if (!Buffer.isBuffer(e)) throw new TypeError("argument should be a Buffer");
                if (!t) t = 0;
                if (!f && f !== 0) f = this.length;
                if (r >= e.length) r = e.length;
                if (!r) r = 0;
                if (f > 0 && f < t) f = t;
                if (f === t) return 0;
                if (e.length === 0 || this.length === 0) return 0;
                if (r < 0) {
                    throw new RangeError("targetStart out of bounds");
                }
                if (t < 0 || t >= this.length) throw new RangeError("Index out of range");
                if (f < 0) throw new RangeError("sourceEnd out of bounds");
                if (f > this.length) f = this.length;
                if (e.length - r < f - t) {
                    f = e.length - r + t;
                }
                var n = f - t;
                if (this === e && typeof Uint8Array.prototype.copyWithin === "function") {
                    this.copyWithin(r, t, f);
                } else if (this === e && t < r && r < f) {
                    for(var i = n - 1; i >= 0; --i){
                        e[i + r] = this[i + t];
                    }
                } else {
                    Uint8Array.prototype.set.call(e, this.subarray(t, f), r);
                }
                return n;
            };
            Buffer.prototype.fill = function fill(e, r, t, f) {
                if (typeof e === "string") {
                    if (typeof r === "string") {
                        f = r;
                        r = 0;
                        t = this.length;
                    } else if (typeof t === "string") {
                        f = t;
                        t = this.length;
                    }
                    if (f !== undefined && typeof f !== "string") {
                        throw new TypeError("encoding must be a string");
                    }
                    if (typeof f === "string" && !Buffer.isEncoding(f)) {
                        throw new TypeError("Unknown encoding: " + f);
                    }
                    if (e.length === 1) {
                        var n = e.charCodeAt(0);
                        if (f === "utf8" && n < 128 || f === "latin1") {
                            e = n;
                        }
                    }
                } else if (typeof e === "number") {
                    e = e & 255;
                } else if (typeof e === "boolean") {
                    e = Number(e);
                }
                if (r < 0 || this.length < r || this.length < t) {
                    throw new RangeError("Out of range index");
                }
                if (t <= r) {
                    return this;
                }
                r = r >>> 0;
                t = t === undefined ? this.length : t >>> 0;
                if (!e) e = 0;
                var i;
                if (typeof e === "number") {
                    for(i = r; i < t; ++i){
                        this[i] = e;
                    }
                } else {
                    var o = Buffer.isBuffer(e) ? e : Buffer.from(e, f);
                    var u = o.length;
                    if (u === 0) {
                        throw new TypeError('The value "' + e + '" is invalid for argument "value"');
                    }
                    for(i = 0; i < t - r; ++i){
                        this[i + r] = o[i % u];
                    }
                }
                return this;
            };
            var a = /[^+/0-9A-Za-z-_]/g;
            function base64clean(e) {
                e = e.split("=")[0];
                e = e.trim().replace(a, "");
                if (e.length < 2) return "";
                while(e.length % 4 !== 0){
                    e = e + "=";
                }
                return e;
            }
            function utf8ToBytes(e, r) {
                r = r || Infinity;
                var t;
                var f = e.length;
                var n = null;
                var i = [];
                for(var o = 0; o < f; ++o){
                    t = e.charCodeAt(o);
                    if (t > 55295 && t < 57344) {
                        if (!n) {
                            if (t > 56319) {
                                if ((r -= 3) > -1) i.push(239, 191, 189);
                                continue;
                            } else if (o + 1 === f) {
                                if ((r -= 3) > -1) i.push(239, 191, 189);
                                continue;
                            }
                            n = t;
                            continue;
                        }
                        if (t < 56320) {
                            if ((r -= 3) > -1) i.push(239, 191, 189);
                            n = t;
                            continue;
                        }
                        t = (n - 55296 << 10 | t - 56320) + 65536;
                    } else if (n) {
                        if ((r -= 3) > -1) i.push(239, 191, 189);
                    }
                    n = null;
                    if (t < 128) {
                        if ((r -= 1) < 0) break;
                        i.push(t);
                    } else if (t < 2048) {
                        if ((r -= 2) < 0) break;
                        i.push(t >> 6 | 192, t & 63 | 128);
                    } else if (t < 65536) {
                        if ((r -= 3) < 0) break;
                        i.push(t >> 12 | 224, t >> 6 & 63 | 128, t & 63 | 128);
                    } else if (t < 1114112) {
                        if ((r -= 4) < 0) break;
                        i.push(t >> 18 | 240, t >> 12 & 63 | 128, t >> 6 & 63 | 128, t & 63 | 128);
                    } else {
                        throw new Error("Invalid code point");
                    }
                }
                return i;
            }
            function asciiToBytes(e) {
                var r = [];
                for(var t = 0; t < e.length; ++t){
                    r.push(e.charCodeAt(t) & 255);
                }
                return r;
            }
            function utf16leToBytes(e, r) {
                var t, f, n;
                var i = [];
                for(var o = 0; o < e.length; ++o){
                    if ((r -= 2) < 0) break;
                    t = e.charCodeAt(o);
                    f = t >> 8;
                    n = t % 256;
                    i.push(n);
                    i.push(f);
                }
                return i;
            }
            function base64ToBytes(e) {
                return f.toByteArray(base64clean(e));
            }
            function blitBuffer(e, r, t, f) {
                for(var n = 0; n < f; ++n){
                    if (n + t >= r.length || n >= e.length) break;
                    r[n + t] = e[n];
                }
                return n;
            }
            function isInstance(e, r) {
                return e instanceof r || e != null && e.constructor != null && e.constructor.name != null && e.constructor.name === r.name;
            }
            function numberIsNaN(e) {
                return e !== e;
            }
            var s = function() {
                var e = "0123456789abcdef";
                var r = new Array(256);
                for(var t = 0; t < 16; ++t){
                    var f = t * 16;
                    for(var n = 0; n < 16; ++n){
                        r[f + n] = e[t] + e[n];
                    }
                }
                return r;
            }();
        },
        783: function(e, r) {
            /*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */ r.read = function(e, r, t, f, n) {
                var i, o;
                var u = n * 8 - f - 1;
                var a = (1 << u) - 1;
                var s = a >> 1;
                var h = -7;
                var c = t ? n - 1 : 0;
                var l = t ? -1 : 1;
                var p = e[r + c];
                c += l;
                i = p & (1 << -h) - 1;
                p >>= -h;
                h += u;
                for(; h > 0; i = i * 256 + e[r + c], c += l, h -= 8){}
                o = i & (1 << -h) - 1;
                i >>= -h;
                h += f;
                for(; h > 0; o = o * 256 + e[r + c], c += l, h -= 8){}
                if (i === 0) {
                    i = 1 - s;
                } else if (i === a) {
                    return o ? NaN : (p ? -1 : 1) * Infinity;
                } else {
                    o = o + Math.pow(2, f);
                    i = i - s;
                }
                return (p ? -1 : 1) * o * Math.pow(2, i - f);
            };
            r.write = function(e, r, t, f, n, i) {
                var o, u, a;
                var s = i * 8 - n - 1;
                var h = (1 << s) - 1;
                var c = h >> 1;
                var l = n === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0;
                var p = f ? 0 : i - 1;
                var y = f ? 1 : -1;
                var g = r < 0 || r === 0 && 1 / r < 0 ? 1 : 0;
                r = Math.abs(r);
                if (isNaN(r) || r === Infinity) {
                    u = isNaN(r) ? 1 : 0;
                    o = h;
                } else {
                    o = Math.floor(Math.log(r) / Math.LN2);
                    if (r * (a = Math.pow(2, -o)) < 1) {
                        o--;
                        a *= 2;
                    }
                    if (o + c >= 1) {
                        r += l / a;
                    } else {
                        r += l * Math.pow(2, 1 - c);
                    }
                    if (r * a >= 2) {
                        o++;
                        a /= 2;
                    }
                    if (o + c >= h) {
                        u = 0;
                        o = h;
                    } else if (o + c >= 1) {
                        u = (r * a - 1) * Math.pow(2, n);
                        o = o + c;
                    } else {
                        u = r * Math.pow(2, c - 1) * Math.pow(2, n);
                        o = 0;
                    }
                }
                for(; n >= 8; e[t + p] = u & 255, p += y, u /= 256, n -= 8){}
                o = o << n | u;
                s += n;
                for(; s > 0; e[t + p] = o & 255, p += y, o /= 256, s -= 8){}
                e[t + p - y] |= g * 128;
            };
        }
    };
    var r = {};
    function __nccwpck_require__(t) {
        var f = r[t];
        if (f !== undefined) {
            return f.exports;
        }
        var n = r[t] = {
            exports: {}
        };
        var i = true;
        try {
            e[t](n, n.exports, __nccwpck_require__);
            i = false;
        } finally{
            if (i) delete r[t];
        }
        return n.exports;
    }
    if (typeof __nccwpck_require__ !== "undefined") __nccwpck_require__.ab = __dirname + "/";
    var t = __nccwpck_require__(72);
    module.exports = t;
})();
}}),
"[project]/apps/web/node_modules/next/navigation.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
module.exports = __turbopack_context__.r("[project]/apps/web/node_modules/next/dist/client/components/navigation.js [app-client] (ecmascript)");
}}),
"[project]/node_modules/@firebase/util/dist/index.esm2017.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * @fileoverview Firebase constants.  Some of these (@defines) can be overridden at compile-time.
 */ __turbopack_context__.s({
    "CONSTANTS": (()=>CONSTANTS),
    "DecodeBase64StringError": (()=>DecodeBase64StringError),
    "Deferred": (()=>Deferred),
    "ErrorFactory": (()=>ErrorFactory),
    "FirebaseError": (()=>FirebaseError),
    "MAX_VALUE_MILLIS": (()=>MAX_VALUE_MILLIS),
    "RANDOM_FACTOR": (()=>RANDOM_FACTOR),
    "Sha1": (()=>Sha1),
    "areCookiesEnabled": (()=>areCookiesEnabled),
    "assert": (()=>assert),
    "assertionError": (()=>assertionError),
    "async": (()=>async),
    "base64": (()=>base64),
    "base64Decode": (()=>base64Decode),
    "base64Encode": (()=>base64Encode),
    "base64urlEncodeWithoutPadding": (()=>base64urlEncodeWithoutPadding),
    "calculateBackoffMillis": (()=>calculateBackoffMillis),
    "contains": (()=>contains),
    "createMockUserToken": (()=>createMockUserToken),
    "createSubscribe": (()=>createSubscribe),
    "decode": (()=>decode),
    "deepCopy": (()=>deepCopy),
    "deepEqual": (()=>deepEqual),
    "deepExtend": (()=>deepExtend),
    "errorPrefix": (()=>errorPrefix),
    "extractQuerystring": (()=>extractQuerystring),
    "getDefaultAppConfig": (()=>getDefaultAppConfig),
    "getDefaultEmulatorHost": (()=>getDefaultEmulatorHost),
    "getDefaultEmulatorHostnameAndPort": (()=>getDefaultEmulatorHostnameAndPort),
    "getDefaults": (()=>getDefaults),
    "getExperimentalSetting": (()=>getExperimentalSetting),
    "getGlobal": (()=>getGlobal),
    "getModularInstance": (()=>getModularInstance),
    "getUA": (()=>getUA),
    "isAdmin": (()=>isAdmin),
    "isBrowser": (()=>isBrowser),
    "isBrowserExtension": (()=>isBrowserExtension),
    "isCloudflareWorker": (()=>isCloudflareWorker),
    "isElectron": (()=>isElectron),
    "isEmpty": (()=>isEmpty),
    "isIE": (()=>isIE),
    "isIndexedDBAvailable": (()=>isIndexedDBAvailable),
    "isMobileCordova": (()=>isMobileCordova),
    "isNode": (()=>isNode),
    "isNodeSdk": (()=>isNodeSdk),
    "isReactNative": (()=>isReactNative),
    "isSafari": (()=>isSafari),
    "isUWP": (()=>isUWP),
    "isValidFormat": (()=>isValidFormat),
    "isValidTimestamp": (()=>isValidTimestamp),
    "isWebWorker": (()=>isWebWorker),
    "issuedAtTime": (()=>issuedAtTime),
    "jsonEval": (()=>jsonEval),
    "map": (()=>map),
    "ordinal": (()=>ordinal),
    "promiseWithTimeout": (()=>promiseWithTimeout),
    "querystring": (()=>querystring),
    "querystringDecode": (()=>querystringDecode),
    "safeGet": (()=>safeGet),
    "stringLength": (()=>stringLength),
    "stringToByteArray": (()=>stringToByteArray),
    "stringify": (()=>stringify),
    "validateArgCount": (()=>validateArgCount),
    "validateCallback": (()=>validateCallback),
    "validateContextObject": (()=>validateContextObject),
    "validateIndexedDBOpenable": (()=>validateIndexedDBOpenable),
    "validateNamespace": (()=>validateNamespace)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
const CONSTANTS = {
    /**
     * @define {boolean} Whether this is the client Node.js SDK.
     */ NODE_CLIENT: false,
    /**
     * @define {boolean} Whether this is the Admin Node.js SDK.
     */ NODE_ADMIN: false,
    /**
     * Firebase SDK Version
     */ SDK_VERSION: '${JSCORE_VERSION}'
};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Throws an error if the provided assertion is falsy
 */ const assert = function(assertion, message) {
    if (!assertion) {
        throw assertionError(message);
    }
};
/**
 * Returns an Error object suitable for throwing.
 */ const assertionError = function(message) {
    return new Error('Firebase Database (' + CONSTANTS.SDK_VERSION + ') INTERNAL ASSERT FAILED: ' + message);
};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const stringToByteArray$1 = function(str) {
    // TODO(user): Use native implementations if/when available
    const out = [];
    let p = 0;
    for(let i = 0; i < str.length; i++){
        let c = str.charCodeAt(i);
        if (c < 128) {
            out[p++] = c;
        } else if (c < 2048) {
            out[p++] = c >> 6 | 192;
            out[p++] = c & 63 | 128;
        } else if ((c & 0xfc00) === 0xd800 && i + 1 < str.length && (str.charCodeAt(i + 1) & 0xfc00) === 0xdc00) {
            // Surrogate Pair
            c = 0x10000 + ((c & 0x03ff) << 10) + (str.charCodeAt(++i) & 0x03ff);
            out[p++] = c >> 18 | 240;
            out[p++] = c >> 12 & 63 | 128;
            out[p++] = c >> 6 & 63 | 128;
            out[p++] = c & 63 | 128;
        } else {
            out[p++] = c >> 12 | 224;
            out[p++] = c >> 6 & 63 | 128;
            out[p++] = c & 63 | 128;
        }
    }
    return out;
};
/**
 * Turns an array of numbers into the string given by the concatenation of the
 * characters to which the numbers correspond.
 * @param bytes Array of numbers representing characters.
 * @return Stringification of the array.
 */ const byteArrayToString = function(bytes) {
    // TODO(user): Use native implementations if/when available
    const out = [];
    let pos = 0, c = 0;
    while(pos < bytes.length){
        const c1 = bytes[pos++];
        if (c1 < 128) {
            out[c++] = String.fromCharCode(c1);
        } else if (c1 > 191 && c1 < 224) {
            const c2 = bytes[pos++];
            out[c++] = String.fromCharCode((c1 & 31) << 6 | c2 & 63);
        } else if (c1 > 239 && c1 < 365) {
            // Surrogate Pair
            const c2 = bytes[pos++];
            const c3 = bytes[pos++];
            const c4 = bytes[pos++];
            const u = ((c1 & 7) << 18 | (c2 & 63) << 12 | (c3 & 63) << 6 | c4 & 63) - 0x10000;
            out[c++] = String.fromCharCode(0xd800 + (u >> 10));
            out[c++] = String.fromCharCode(0xdc00 + (u & 1023));
        } else {
            const c2 = bytes[pos++];
            const c3 = bytes[pos++];
            out[c++] = String.fromCharCode((c1 & 15) << 12 | (c2 & 63) << 6 | c3 & 63);
        }
    }
    return out.join('');
};
// We define it as an object literal instead of a class because a class compiled down to es5 can't
// be treeshaked. https://github.com/rollup/rollup/issues/1691
// Static lookup maps, lazily populated by init_()
// TODO(dlarocque): Define this as a class, since we no longer target ES5.
const base64 = {
    /**
     * Maps bytes to characters.
     */ byteToCharMap_: null,
    /**
     * Maps characters to bytes.
     */ charToByteMap_: null,
    /**
     * Maps bytes to websafe characters.
     * @private
     */ byteToCharMapWebSafe_: null,
    /**
     * Maps websafe characters to bytes.
     * @private
     */ charToByteMapWebSafe_: null,
    /**
     * Our default alphabet, shared between
     * ENCODED_VALS and ENCODED_VALS_WEBSAFE
     */ ENCODED_VALS_BASE: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz' + '0123456789',
    /**
     * Our default alphabet. Value 64 (=) is special; it means "nothing."
     */ get ENCODED_VALS () {
        return this.ENCODED_VALS_BASE + '+/=';
    },
    /**
     * Our websafe alphabet.
     */ get ENCODED_VALS_WEBSAFE () {
        return this.ENCODED_VALS_BASE + '-_.';
    },
    /**
     * Whether this browser supports the atob and btoa functions. This extension
     * started at Mozilla but is now implemented by many browsers. We use the
     * ASSUME_* variables to avoid pulling in the full useragent detection library
     * but still allowing the standard per-browser compilations.
     *
     */ HAS_NATIVE_SUPPORT: typeof atob === 'function',
    /**
     * Base64-encode an array of bytes.
     *
     * @param input An array of bytes (numbers with
     *     value in [0, 255]) to encode.
     * @param webSafe Boolean indicating we should use the
     *     alternative alphabet.
     * @return The base64 encoded string.
     */ encodeByteArray (input, webSafe) {
        if (!Array.isArray(input)) {
            throw Error('encodeByteArray takes an array as a parameter');
        }
        this.init_();
        const byteToCharMap = webSafe ? this.byteToCharMapWebSafe_ : this.byteToCharMap_;
        const output = [];
        for(let i = 0; i < input.length; i += 3){
            const byte1 = input[i];
            const haveByte2 = i + 1 < input.length;
            const byte2 = haveByte2 ? input[i + 1] : 0;
            const haveByte3 = i + 2 < input.length;
            const byte3 = haveByte3 ? input[i + 2] : 0;
            const outByte1 = byte1 >> 2;
            const outByte2 = (byte1 & 0x03) << 4 | byte2 >> 4;
            let outByte3 = (byte2 & 0x0f) << 2 | byte3 >> 6;
            let outByte4 = byte3 & 0x3f;
            if (!haveByte3) {
                outByte4 = 64;
                if (!haveByte2) {
                    outByte3 = 64;
                }
            }
            output.push(byteToCharMap[outByte1], byteToCharMap[outByte2], byteToCharMap[outByte3], byteToCharMap[outByte4]);
        }
        return output.join('');
    },
    /**
     * Base64-encode a string.
     *
     * @param input A string to encode.
     * @param webSafe If true, we should use the
     *     alternative alphabet.
     * @return The base64 encoded string.
     */ encodeString (input, webSafe) {
        // Shortcut for Mozilla browsers that implement
        // a native base64 encoder in the form of "btoa/atob"
        if (this.HAS_NATIVE_SUPPORT && !webSafe) {
            return btoa(input);
        }
        return this.encodeByteArray(stringToByteArray$1(input), webSafe);
    },
    /**
     * Base64-decode a string.
     *
     * @param input to decode.
     * @param webSafe True if we should use the
     *     alternative alphabet.
     * @return string representing the decoded value.
     */ decodeString (input, webSafe) {
        // Shortcut for Mozilla browsers that implement
        // a native base64 encoder in the form of "btoa/atob"
        if (this.HAS_NATIVE_SUPPORT && !webSafe) {
            return atob(input);
        }
        return byteArrayToString(this.decodeStringToByteArray(input, webSafe));
    },
    /**
     * Base64-decode a string.
     *
     * In base-64 decoding, groups of four characters are converted into three
     * bytes.  If the encoder did not apply padding, the input length may not
     * be a multiple of 4.
     *
     * In this case, the last group will have fewer than 4 characters, and
     * padding will be inferred.  If the group has one or two characters, it decodes
     * to one byte.  If the group has three characters, it decodes to two bytes.
     *
     * @param input Input to decode.
     * @param webSafe True if we should use the web-safe alphabet.
     * @return bytes representing the decoded value.
     */ decodeStringToByteArray (input, webSafe) {
        this.init_();
        const charToByteMap = webSafe ? this.charToByteMapWebSafe_ : this.charToByteMap_;
        const output = [];
        for(let i = 0; i < input.length;){
            const byte1 = charToByteMap[input.charAt(i++)];
            const haveByte2 = i < input.length;
            const byte2 = haveByte2 ? charToByteMap[input.charAt(i)] : 0;
            ++i;
            const haveByte3 = i < input.length;
            const byte3 = haveByte3 ? charToByteMap[input.charAt(i)] : 64;
            ++i;
            const haveByte4 = i < input.length;
            const byte4 = haveByte4 ? charToByteMap[input.charAt(i)] : 64;
            ++i;
            if (byte1 == null || byte2 == null || byte3 == null || byte4 == null) {
                throw new DecodeBase64StringError();
            }
            const outByte1 = byte1 << 2 | byte2 >> 4;
            output.push(outByte1);
            if (byte3 !== 64) {
                const outByte2 = byte2 << 4 & 0xf0 | byte3 >> 2;
                output.push(outByte2);
                if (byte4 !== 64) {
                    const outByte3 = byte3 << 6 & 0xc0 | byte4;
                    output.push(outByte3);
                }
            }
        }
        return output;
    },
    /**
     * Lazy static initialization function. Called before
     * accessing any of the static map variables.
     * @private
     */ init_ () {
        if (!this.byteToCharMap_) {
            this.byteToCharMap_ = {};
            this.charToByteMap_ = {};
            this.byteToCharMapWebSafe_ = {};
            this.charToByteMapWebSafe_ = {};
            // We want quick mappings back and forth, so we precompute two maps.
            for(let i = 0; i < this.ENCODED_VALS.length; i++){
                this.byteToCharMap_[i] = this.ENCODED_VALS.charAt(i);
                this.charToByteMap_[this.byteToCharMap_[i]] = i;
                this.byteToCharMapWebSafe_[i] = this.ENCODED_VALS_WEBSAFE.charAt(i);
                this.charToByteMapWebSafe_[this.byteToCharMapWebSafe_[i]] = i;
                // Be forgiving when decoding and correctly decode both encodings.
                if (i >= this.ENCODED_VALS_BASE.length) {
                    this.charToByteMap_[this.ENCODED_VALS_WEBSAFE.charAt(i)] = i;
                    this.charToByteMapWebSafe_[this.ENCODED_VALS.charAt(i)] = i;
                }
            }
        }
    }
};
/**
 * An error encountered while decoding base64 string.
 */ class DecodeBase64StringError extends Error {
    constructor(){
        super(...arguments);
        this.name = 'DecodeBase64StringError';
    }
}
/**
 * URL-safe base64 encoding
 */ const base64Encode = function(str) {
    const utf8Bytes = stringToByteArray$1(str);
    return base64.encodeByteArray(utf8Bytes, true);
};
/**
 * URL-safe base64 encoding (without "." padding in the end).
 * e.g. Used in JSON Web Token (JWT) parts.
 */ const base64urlEncodeWithoutPadding = function(str) {
    // Use base64url encoding and remove padding in the end (dot characters).
    return base64Encode(str).replace(/\./g, '');
};
/**
 * URL-safe base64 decoding
 *
 * NOTE: DO NOT use the global atob() function - it does NOT support the
 * base64Url variant encoding.
 *
 * @param str To be decoded
 * @return Decoded result, if possible
 */ const base64Decode = function(str) {
    try {
        return base64.decodeString(str, true);
    } catch (e) {
        console.error('base64Decode failed: ', e);
    }
    return null;
};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Do a deep-copy of basic JavaScript Objects or Arrays.
 */ function deepCopy(value) {
    return deepExtend(undefined, value);
}
/**
 * Copy properties from source to target (recursively allows extension
 * of Objects and Arrays).  Scalar values in the target are over-written.
 * If target is undefined, an object of the appropriate type will be created
 * (and returned).
 *
 * We recursively copy all child properties of plain Objects in the source- so
 * that namespace- like dictionaries are merged.
 *
 * Note that the target can be a function, in which case the properties in
 * the source Object are copied onto it as static properties of the Function.
 *
 * Note: we don't merge __proto__ to prevent prototype pollution
 */ function deepExtend(target, source) {
    if (!(source instanceof Object)) {
        return source;
    }
    switch(source.constructor){
        case Date:
            // Treat Dates like scalars; if the target date object had any child
            // properties - they will be lost!
            const dateValue = source;
            return new Date(dateValue.getTime());
        case Object:
            if (target === undefined) {
                target = {};
            }
            break;
        case Array:
            // Always copy the array source and overwrite the target.
            target = [];
            break;
        default:
            // Not a plain Object - treat it as a scalar.
            return source;
    }
    for(const prop in source){
        // use isValidKey to guard against prototype pollution. See https://snyk.io/vuln/SNYK-JS-LODASH-450202
        if (!source.hasOwnProperty(prop) || !isValidKey(prop)) {
            continue;
        }
        target[prop] = deepExtend(target[prop], source[prop]);
    }
    return target;
}
function isValidKey(key) {
    return key !== '__proto__';
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Polyfill for `globalThis` object.
 * @returns the `globalThis` object for the given environment.
 * @public
 */ function getGlobal() {
    if (typeof self !== 'undefined') {
        return self;
    }
    if (typeof window !== 'undefined') {
        return window;
    }
    if (typeof global !== 'undefined') {
        return global;
    }
    throw new Error('Unable to locate global object.');
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const getDefaultsFromGlobal = ()=>getGlobal().__FIREBASE_DEFAULTS__;
/**
 * Attempt to read defaults from a JSON string provided to
 * process(.)env(.)__FIREBASE_DEFAULTS__ or a JSON file whose path is in
 * process(.)env(.)__FIREBASE_DEFAULTS_PATH__
 * The dots are in parens because certain compilers (Vite?) cannot
 * handle seeing that variable in comments.
 * See https://github.com/firebase/firebase-js-sdk/issues/6838
 */ const getDefaultsFromEnvVariable = ()=>{
    if (typeof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] === 'undefined' || typeof __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env === 'undefined') {
        return;
    }
    const defaultsJsonString = __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].env.__FIREBASE_DEFAULTS__;
    if (defaultsJsonString) {
        return JSON.parse(defaultsJsonString);
    }
};
const getDefaultsFromCookie = ()=>{
    if (typeof document === 'undefined') {
        return;
    }
    let match;
    try {
        match = document.cookie.match(/__FIREBASE_DEFAULTS__=([^;]+)/);
    } catch (e) {
        // Some environments such as Angular Universal SSR have a
        // `document` object but error on accessing `document.cookie`.
        return;
    }
    const decoded = match && base64Decode(match[1]);
    return decoded && JSON.parse(decoded);
};
/**
 * Get the __FIREBASE_DEFAULTS__ object. It checks in order:
 * (1) if such an object exists as a property of `globalThis`
 * (2) if such an object was provided on a shell environment variable
 * (3) if such an object exists in a cookie
 * @public
 */ const getDefaults = ()=>{
    try {
        return getDefaultsFromGlobal() || getDefaultsFromEnvVariable() || getDefaultsFromCookie();
    } catch (e) {
        /**
         * Catch-all for being unable to get __FIREBASE_DEFAULTS__ due
         * to any environment case we have not accounted for. Log to
         * info instead of swallowing so we can find these unknown cases
         * and add paths for them if needed.
         */ console.info(`Unable to get __FIREBASE_DEFAULTS__ due to: ${e}`);
        return;
    }
};
/**
 * Returns emulator host stored in the __FIREBASE_DEFAULTS__ object
 * for the given product.
 * @returns a URL host formatted like `127.0.0.1:9999` or `[::1]:4000` if available
 * @public
 */ const getDefaultEmulatorHost = (productName)=>{
    var _a, _b;
    return (_b = (_a = getDefaults()) === null || _a === void 0 ? void 0 : _a.emulatorHosts) === null || _b === void 0 ? void 0 : _b[productName];
};
/**
 * Returns emulator hostname and port stored in the __FIREBASE_DEFAULTS__ object
 * for the given product.
 * @returns a pair of hostname and port like `["::1", 4000]` if available
 * @public
 */ const getDefaultEmulatorHostnameAndPort = (productName)=>{
    const host = getDefaultEmulatorHost(productName);
    if (!host) {
        return undefined;
    }
    const separatorIndex = host.lastIndexOf(':'); // Finding the last since IPv6 addr also has colons.
    if (separatorIndex <= 0 || separatorIndex + 1 === host.length) {
        throw new Error(`Invalid host ${host} with no separate hostname and port!`);
    }
    // eslint-disable-next-line no-restricted-globals
    const port = parseInt(host.substring(separatorIndex + 1), 10);
    if (host[0] === '[') {
        // Bracket-quoted `[ipv6addr]:port` => return "ipv6addr" (without brackets).
        return [
            host.substring(1, separatorIndex - 1),
            port
        ];
    } else {
        return [
            host.substring(0, separatorIndex),
            port
        ];
    }
};
/**
 * Returns Firebase app config stored in the __FIREBASE_DEFAULTS__ object.
 * @public
 */ const getDefaultAppConfig = ()=>{
    var _a;
    return (_a = getDefaults()) === null || _a === void 0 ? void 0 : _a.config;
};
/**
 * Returns an experimental setting on the __FIREBASE_DEFAULTS__ object (properties
 * prefixed by "_")
 * @public
 */ const getExperimentalSetting = (name)=>{
    var _a;
    return (_a = getDefaults()) === null || _a === void 0 ? void 0 : _a[`_${name}`];
};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class Deferred {
    constructor(){
        this.reject = ()=>{};
        this.resolve = ()=>{};
        this.promise = new Promise((resolve, reject)=>{
            this.resolve = resolve;
            this.reject = reject;
        });
    }
    /**
     * Our API internals are not promisified and cannot because our callback APIs have subtle expectations around
     * invoking promises inline, which Promises are forbidden to do. This method accepts an optional node-style callback
     * and returns a node-style callback which will resolve or reject the Deferred's promise.
     */ wrapCallback(callback) {
        return (error, value)=>{
            if (error) {
                this.reject(error);
            } else {
                this.resolve(value);
            }
            if (typeof callback === 'function') {
                // Attaching noop handler just in case developer wasn't expecting
                // promises
                this.promise.catch(()=>{});
                // Some of our callbacks don't expect a value and our own tests
                // assert that the parameter length is 1
                if (callback.length === 1) {
                    callback(error);
                } else {
                    callback(error, value);
                }
            }
        };
    }
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function createMockUserToken(token, projectId) {
    if (token.uid) {
        throw new Error('The "uid" field is no longer supported by mockUserToken. Please use "sub" instead for Firebase Auth User ID.');
    }
    // Unsecured JWTs use "none" as the algorithm.
    const header = {
        alg: 'none',
        type: 'JWT'
    };
    const project = projectId || 'demo-project';
    const iat = token.iat || 0;
    const sub = token.sub || token.user_id;
    if (!sub) {
        throw new Error("mockUserToken must contain 'sub' or 'user_id' field!");
    }
    const payload = Object.assign({
        // Set all required fields to decent defaults
        iss: `https://securetoken.google.com/${project}`,
        aud: project,
        iat,
        exp: iat + 3600,
        auth_time: iat,
        sub,
        user_id: sub,
        firebase: {
            sign_in_provider: 'custom',
            identities: {}
        }
    }, token);
    // Unsecured JWTs use the empty string as a signature.
    const signature = '';
    return [
        base64urlEncodeWithoutPadding(JSON.stringify(header)),
        base64urlEncodeWithoutPadding(JSON.stringify(payload)),
        signature
    ].join('.');
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Returns navigator.userAgent string or '' if it's not defined.
 * @return user agent string
 */ function getUA() {
    if (typeof navigator !== 'undefined' && typeof navigator['userAgent'] === 'string') {
        return navigator['userAgent'];
    } else {
        return '';
    }
}
/**
 * Detect Cordova / PhoneGap / Ionic frameworks on a mobile device.
 *
 * Deliberately does not rely on checking `file://` URLs (as this fails PhoneGap
 * in the Ripple emulator) nor Cordova `onDeviceReady`, which would normally
 * wait for a callback.
 */ function isMobileCordova() {
    return typeof window !== 'undefined' && // @ts-ignore Setting up an broadly applicable index signature for Window
    // just to deal with this case would probably be a bad idea.
    !!(window['cordova'] || window['phonegap'] || window['PhoneGap']) && /ios|iphone|ipod|ipad|android|blackberry|iemobile/i.test(getUA());
}
/**
 * Detect Node.js.
 *
 * @return true if Node.js environment is detected or specified.
 */ // Node detection logic from: https://github.com/iliakan/detect-node/
function isNode() {
    var _a;
    const forceEnvironment = (_a = getDefaults()) === null || _a === void 0 ? void 0 : _a.forceEnvironment;
    if (forceEnvironment === 'node') {
        return true;
    } else if (forceEnvironment === 'browser') {
        return false;
    }
    try {
        return Object.prototype.toString.call(global.process) === '[object process]';
    } catch (e) {
        return false;
    }
}
/**
 * Detect Browser Environment.
 * Note: This will return true for certain test frameworks that are incompletely
 * mimicking a browser, and should not lead to assuming all browser APIs are
 * available.
 */ function isBrowser() {
    return typeof window !== 'undefined' || isWebWorker();
}
/**
 * Detect Web Worker context.
 */ function isWebWorker() {
    return typeof WorkerGlobalScope !== 'undefined' && typeof self !== 'undefined' && self instanceof WorkerGlobalScope;
}
/**
 * Detect Cloudflare Worker context.
 */ function isCloudflareWorker() {
    return typeof navigator !== 'undefined' && navigator.userAgent === 'Cloudflare-Workers';
}
function isBrowserExtension() {
    const runtime = typeof chrome === 'object' ? chrome.runtime : typeof browser === 'object' ? browser.runtime : undefined;
    return typeof runtime === 'object' && runtime.id !== undefined;
}
/**
 * Detect React Native.
 *
 * @return true if ReactNative environment is detected.
 */ function isReactNative() {
    return typeof navigator === 'object' && navigator['product'] === 'ReactNative';
}
/** Detects Electron apps. */ function isElectron() {
    return getUA().indexOf('Electron/') >= 0;
}
/** Detects Internet Explorer. */ function isIE() {
    const ua = getUA();
    return ua.indexOf('MSIE ') >= 0 || ua.indexOf('Trident/') >= 0;
}
/** Detects Universal Windows Platform apps. */ function isUWP() {
    return getUA().indexOf('MSAppHost/') >= 0;
}
/**
 * Detect whether the current SDK build is the Node version.
 *
 * @return true if it's the Node SDK build.
 */ function isNodeSdk() {
    return CONSTANTS.NODE_CLIENT === true || CONSTANTS.NODE_ADMIN === true;
}
/** Returns true if we are running in Safari. */ function isSafari() {
    return !isNode() && !!navigator.userAgent && navigator.userAgent.includes('Safari') && !navigator.userAgent.includes('Chrome');
}
/**
 * This method checks if indexedDB is supported by current browser/service worker context
 * @return true if indexedDB is supported by current browser/service worker context
 */ function isIndexedDBAvailable() {
    try {
        return typeof indexedDB === 'object';
    } catch (e) {
        return false;
    }
}
/**
 * This method validates browser/sw context for indexedDB by opening a dummy indexedDB database and reject
 * if errors occur during the database open operation.
 *
 * @throws exception if current browser/sw context can't run idb.open (ex: Safari iframe, Firefox
 * private browsing)
 */ function validateIndexedDBOpenable() {
    return new Promise((resolve, reject)=>{
        try {
            let preExist = true;
            const DB_CHECK_NAME = 'validate-browser-context-for-indexeddb-analytics-module';
            const request = self.indexedDB.open(DB_CHECK_NAME);
            request.onsuccess = ()=>{
                request.result.close();
                // delete database only when it doesn't pre-exist
                if (!preExist) {
                    self.indexedDB.deleteDatabase(DB_CHECK_NAME);
                }
                resolve(true);
            };
            request.onupgradeneeded = ()=>{
                preExist = false;
            };
            request.onerror = ()=>{
                var _a;
                reject(((_a = request.error) === null || _a === void 0 ? void 0 : _a.message) || '');
            };
        } catch (error) {
            reject(error);
        }
    });
}
/**
 *
 * This method checks whether cookie is enabled within current browser
 * @return true if cookie is enabled within current browser
 */ function areCookiesEnabled() {
    if (typeof navigator === 'undefined' || !navigator.cookieEnabled) {
        return false;
    }
    return true;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * @fileoverview Standardized Firebase Error.
 *
 * Usage:
 *
 *   // TypeScript string literals for type-safe codes
 *   type Err =
 *     'unknown' |
 *     'object-not-found'
 *     ;
 *
 *   // Closure enum for type-safe error codes
 *   // at-enum {string}
 *   var Err = {
 *     UNKNOWN: 'unknown',
 *     OBJECT_NOT_FOUND: 'object-not-found',
 *   }
 *
 *   let errors: Map<Err, string> = {
 *     'generic-error': "Unknown error",
 *     'file-not-found': "Could not find file: {$file}",
 *   };
 *
 *   // Type-safe function - must pass a valid error code as param.
 *   let error = new ErrorFactory<Err>('service', 'Service', errors);
 *
 *   ...
 *   throw error.create(Err.GENERIC);
 *   ...
 *   throw error.create(Err.FILE_NOT_FOUND, {'file': fileName});
 *   ...
 *   // Service: Could not file file: foo.txt (service/file-not-found).
 *
 *   catch (e) {
 *     assert(e.message === "Could not find file: foo.txt.");
 *     if ((e as FirebaseError)?.code === 'service/file-not-found') {
 *       console.log("Could not read file: " + e['file']);
 *     }
 *   }
 */ const ERROR_NAME = 'FirebaseError';
// Based on code from:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error#Custom_Error_Types
class FirebaseError extends Error {
    constructor(/** The error code for this error. */ code, message, /** Custom data for this error. */ customData){
        super(message);
        this.code = code;
        this.customData = customData;
        /** The custom name for all FirebaseErrors. */ this.name = ERROR_NAME;
        // Fix For ES5
        // https://github.com/Microsoft/TypeScript-wiki/blob/master/Breaking-Changes.md#extending-built-ins-like-error-array-and-map-may-no-longer-work
        // TODO(dlarocque): Replace this with `new.target`: https://www.typescriptlang.org/docs/handbook/release-notes/typescript-2-2.html#support-for-newtarget
        //                   which we can now use since we no longer target ES5.
        Object.setPrototypeOf(this, FirebaseError.prototype);
        // Maintains proper stack trace for where our error was thrown.
        // Only available on V8.
        if (Error.captureStackTrace) {
            Error.captureStackTrace(this, ErrorFactory.prototype.create);
        }
    }
}
class ErrorFactory {
    constructor(service, serviceName, errors){
        this.service = service;
        this.serviceName = serviceName;
        this.errors = errors;
    }
    create(code, ...data) {
        const customData = data[0] || {};
        const fullCode = `${this.service}/${code}`;
        const template = this.errors[code];
        const message = template ? replaceTemplate(template, customData) : 'Error';
        // Service Name: Error message (service/code).
        const fullMessage = `${this.serviceName}: ${message} (${fullCode}).`;
        const error = new FirebaseError(fullCode, fullMessage, customData);
        return error;
    }
}
function replaceTemplate(template, data) {
    return template.replace(PATTERN, (_, key)=>{
        const value = data[key];
        return value != null ? String(value) : `<${key}?>`;
    });
}
const PATTERN = /\{\$([^}]+)}/g;
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Evaluates a JSON string into a javascript object.
 *
 * @param {string} str A string containing JSON.
 * @return {*} The javascript object representing the specified JSON.
 */ function jsonEval(str) {
    return JSON.parse(str);
}
/**
 * Returns JSON representing a javascript object.
 * @param {*} data JavaScript object to be stringified.
 * @return {string} The JSON contents of the object.
 */ function stringify(data) {
    return JSON.stringify(data);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Decodes a Firebase auth. token into constituent parts.
 *
 * Notes:
 * - May return with invalid / incomplete claims if there's no native base64 decoding support.
 * - Doesn't check if the token is actually valid.
 */ const decode = function(token) {
    let header = {}, claims = {}, data = {}, signature = '';
    try {
        const parts = token.split('.');
        header = jsonEval(base64Decode(parts[0]) || '');
        claims = jsonEval(base64Decode(parts[1]) || '');
        signature = parts[2];
        data = claims['d'] || {};
        delete claims['d'];
    } catch (e) {}
    return {
        header,
        claims,
        data,
        signature
    };
};
/**
 * Decodes a Firebase auth. token and checks the validity of its time-based claims. Will return true if the
 * token is within the time window authorized by the 'nbf' (not-before) and 'iat' (issued-at) claims.
 *
 * Notes:
 * - May return a false negative if there's no native base64 decoding support.
 * - Doesn't check if the token is actually valid.
 */ const isValidTimestamp = function(token) {
    const claims = decode(token).claims;
    const now = Math.floor(new Date().getTime() / 1000);
    let validSince = 0, validUntil = 0;
    if (typeof claims === 'object') {
        if (claims.hasOwnProperty('nbf')) {
            validSince = claims['nbf'];
        } else if (claims.hasOwnProperty('iat')) {
            validSince = claims['iat'];
        }
        if (claims.hasOwnProperty('exp')) {
            validUntil = claims['exp'];
        } else {
            // token will expire after 24h by default
            validUntil = validSince + 86400;
        }
    }
    return !!now && !!validSince && !!validUntil && now >= validSince && now <= validUntil;
};
/**
 * Decodes a Firebase auth. token and returns its issued at time if valid, null otherwise.
 *
 * Notes:
 * - May return null if there's no native base64 decoding support.
 * - Doesn't check if the token is actually valid.
 */ const issuedAtTime = function(token) {
    const claims = decode(token).claims;
    if (typeof claims === 'object' && claims.hasOwnProperty('iat')) {
        return claims['iat'];
    }
    return null;
};
/**
 * Decodes a Firebase auth. token and checks the validity of its format. Expects a valid issued-at time.
 *
 * Notes:
 * - May return a false negative if there's no native base64 decoding support.
 * - Doesn't check if the token is actually valid.
 */ const isValidFormat = function(token) {
    const decoded = decode(token), claims = decoded.claims;
    return !!claims && typeof claims === 'object' && claims.hasOwnProperty('iat');
};
/**
 * Attempts to peer into an auth token and determine if it's an admin auth token by looking at the claims portion.
 *
 * Notes:
 * - May return a false negative if there's no native base64 decoding support.
 * - Doesn't check if the token is actually valid.
 */ const isAdmin = function(token) {
    const claims = decode(token).claims;
    return typeof claims === 'object' && claims['admin'] === true;
};
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function contains(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
}
function safeGet(obj, key) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
        return obj[key];
    } else {
        return undefined;
    }
}
function isEmpty(obj) {
    for(const key in obj){
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            return false;
        }
    }
    return true;
}
function map(obj, fn, contextObj) {
    const res = {};
    for(const key in obj){
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            res[key] = fn.call(contextObj, obj[key], key, obj);
        }
    }
    return res;
}
/**
 * Deep equal two objects. Support Arrays and Objects.
 */ function deepEqual(a, b) {
    if (a === b) {
        return true;
    }
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    for (const k of aKeys){
        if (!bKeys.includes(k)) {
            return false;
        }
        const aProp = a[k];
        const bProp = b[k];
        if (isObject(aProp) && isObject(bProp)) {
            if (!deepEqual(aProp, bProp)) {
                return false;
            }
        } else if (aProp !== bProp) {
            return false;
        }
    }
    for (const k of bKeys){
        if (!aKeys.includes(k)) {
            return false;
        }
    }
    return true;
}
function isObject(thing) {
    return thing !== null && typeof thing === 'object';
}
/**
 * @license
 * Copyright 2022 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Rejects if the given promise doesn't resolve in timeInMS milliseconds.
 * @internal
 */ function promiseWithTimeout(promise, timeInMS = 2000) {
    const deferredPromise = new Deferred();
    setTimeout(()=>deferredPromise.reject('timeout!'), timeInMS);
    promise.then(deferredPromise.resolve, deferredPromise.reject);
    return deferredPromise.promise;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Returns a querystring-formatted string (e.g. &arg=val&arg2=val2) from a
 * params object (e.g. {arg: 'val', arg2: 'val2'})
 * Note: You must prepend it with ? when adding it to a URL.
 */ function querystring(querystringParams) {
    const params = [];
    for (const [key, value] of Object.entries(querystringParams)){
        if (Array.isArray(value)) {
            value.forEach((arrayVal)=>{
                params.push(encodeURIComponent(key) + '=' + encodeURIComponent(arrayVal));
            });
        } else {
            params.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
        }
    }
    return params.length ? '&' + params.join('&') : '';
}
/**
 * Decodes a querystring (e.g. ?arg=val&arg2=val2) into a params object
 * (e.g. {arg: 'val', arg2: 'val2'})
 */ function querystringDecode(querystring) {
    const obj = {};
    const tokens = querystring.replace(/^\?/, '').split('&');
    tokens.forEach((token)=>{
        if (token) {
            const [key, value] = token.split('=');
            obj[decodeURIComponent(key)] = decodeURIComponent(value);
        }
    });
    return obj;
}
/**
 * Extract the query string part of a URL, including the leading question mark (if present).
 */ function extractQuerystring(url) {
    const queryStart = url.indexOf('?');
    if (!queryStart) {
        return '';
    }
    const fragmentStart = url.indexOf('#', queryStart);
    return url.substring(queryStart, fragmentStart > 0 ? fragmentStart : undefined);
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * @fileoverview SHA-1 cryptographic hash.
 * Variable names follow the notation in FIPS PUB 180-3:
 * http://csrc.nist.gov/publications/fips/fips180-3/fips180-3_final.pdf.
 *
 * Usage:
 *   var sha1 = new sha1();
 *   sha1.update(bytes);
 *   var hash = sha1.digest();
 *
 * Performance:
 *   Chrome 23:   ~400 Mbit/s
 *   Firefox 16:  ~250 Mbit/s
 *
 */ /**
 * SHA-1 cryptographic hash constructor.
 *
 * The properties declared here are discussed in the above algorithm document.
 * @constructor
 * @final
 * @struct
 */ class Sha1 {
    constructor(){
        /**
         * Holds the previous values of accumulated variables a-e in the compress_
         * function.
         * @private
         */ this.chain_ = [];
        /**
         * A buffer holding the partially computed hash result.
         * @private
         */ this.buf_ = [];
        /**
         * An array of 80 bytes, each a part of the message to be hashed.  Referred to
         * as the message schedule in the docs.
         * @private
         */ this.W_ = [];
        /**
         * Contains data needed to pad messages less than 64 bytes.
         * @private
         */ this.pad_ = [];
        /**
         * @private {number}
         */ this.inbuf_ = 0;
        /**
         * @private {number}
         */ this.total_ = 0;
        this.blockSize = 512 / 8;
        this.pad_[0] = 128;
        for(let i = 1; i < this.blockSize; ++i){
            this.pad_[i] = 0;
        }
        this.reset();
    }
    reset() {
        this.chain_[0] = 0x67452301;
        this.chain_[1] = 0xefcdab89;
        this.chain_[2] = 0x98badcfe;
        this.chain_[3] = 0x10325476;
        this.chain_[4] = 0xc3d2e1f0;
        this.inbuf_ = 0;
        this.total_ = 0;
    }
    /**
     * Internal compress helper function.
     * @param buf Block to compress.
     * @param offset Offset of the block in the buffer.
     * @private
     */ compress_(buf, offset) {
        if (!offset) {
            offset = 0;
        }
        const W = this.W_;
        // get 16 big endian words
        if (typeof buf === 'string') {
            for(let i = 0; i < 16; i++){
                // TODO(user): [bug 8140122] Recent versions of Safari for Mac OS and iOS
                // have a bug that turns the post-increment ++ operator into pre-increment
                // during JIT compilation.  We have code that depends heavily on SHA-1 for
                // correctness and which is affected by this bug, so I've removed all uses
                // of post-increment ++ in which the result value is used.  We can revert
                // this change once the Safari bug
                // (https://bugs.webkit.org/show_bug.cgi?id=109036) has been fixed and
                // most clients have been updated.
                W[i] = buf.charCodeAt(offset) << 24 | buf.charCodeAt(offset + 1) << 16 | buf.charCodeAt(offset + 2) << 8 | buf.charCodeAt(offset + 3);
                offset += 4;
            }
        } else {
            for(let i = 0; i < 16; i++){
                W[i] = buf[offset] << 24 | buf[offset + 1] << 16 | buf[offset + 2] << 8 | buf[offset + 3];
                offset += 4;
            }
        }
        // expand to 80 words
        for(let i = 16; i < 80; i++){
            const t = W[i - 3] ^ W[i - 8] ^ W[i - 14] ^ W[i - 16];
            W[i] = (t << 1 | t >>> 31) & 0xffffffff;
        }
        let a = this.chain_[0];
        let b = this.chain_[1];
        let c = this.chain_[2];
        let d = this.chain_[3];
        let e = this.chain_[4];
        let f, k;
        // TODO(user): Try to unroll this loop to speed up the computation.
        for(let i = 0; i < 80; i++){
            if (i < 40) {
                if (i < 20) {
                    f = d ^ b & (c ^ d);
                    k = 0x5a827999;
                } else {
                    f = b ^ c ^ d;
                    k = 0x6ed9eba1;
                }
            } else {
                if (i < 60) {
                    f = b & c | d & (b | c);
                    k = 0x8f1bbcdc;
                } else {
                    f = b ^ c ^ d;
                    k = 0xca62c1d6;
                }
            }
            const t = (a << 5 | a >>> 27) + f + e + k + W[i] & 0xffffffff;
            e = d;
            d = c;
            c = (b << 30 | b >>> 2) & 0xffffffff;
            b = a;
            a = t;
        }
        this.chain_[0] = this.chain_[0] + a & 0xffffffff;
        this.chain_[1] = this.chain_[1] + b & 0xffffffff;
        this.chain_[2] = this.chain_[2] + c & 0xffffffff;
        this.chain_[3] = this.chain_[3] + d & 0xffffffff;
        this.chain_[4] = this.chain_[4] + e & 0xffffffff;
    }
    update(bytes, length) {
        // TODO(johnlenz): tighten the function signature and remove this check
        if (bytes == null) {
            return;
        }
        if (length === undefined) {
            length = bytes.length;
        }
        const lengthMinusBlock = length - this.blockSize;
        let n = 0;
        // Using local instead of member variables gives ~5% speedup on Firefox 16.
        const buf = this.buf_;
        let inbuf = this.inbuf_;
        // The outer while loop should execute at most twice.
        while(n < length){
            // When we have no data in the block to top up, we can directly process the
            // input buffer (assuming it contains sufficient data). This gives ~25%
            // speedup on Chrome 23 and ~15% speedup on Firefox 16, but requires that
            // the data is provided in large chunks (or in multiples of 64 bytes).
            if (inbuf === 0) {
                while(n <= lengthMinusBlock){
                    this.compress_(bytes, n);
                    n += this.blockSize;
                }
            }
            if (typeof bytes === 'string') {
                while(n < length){
                    buf[inbuf] = bytes.charCodeAt(n);
                    ++inbuf;
                    ++n;
                    if (inbuf === this.blockSize) {
                        this.compress_(buf);
                        inbuf = 0;
                        break;
                    }
                }
            } else {
                while(n < length){
                    buf[inbuf] = bytes[n];
                    ++inbuf;
                    ++n;
                    if (inbuf === this.blockSize) {
                        this.compress_(buf);
                        inbuf = 0;
                        break;
                    }
                }
            }
        }
        this.inbuf_ = inbuf;
        this.total_ += length;
    }
    /** @override */ digest() {
        const digest = [];
        let totalBits = this.total_ * 8;
        // Add pad 0x80 0x00*.
        if (this.inbuf_ < 56) {
            this.update(this.pad_, 56 - this.inbuf_);
        } else {
            this.update(this.pad_, this.blockSize - (this.inbuf_ - 56));
        }
        // Add # bits.
        for(let i = this.blockSize - 1; i >= 56; i--){
            this.buf_[i] = totalBits & 255;
            totalBits /= 256; // Don't use bit-shifting here!
        }
        this.compress_(this.buf_);
        let n = 0;
        for(let i = 0; i < 5; i++){
            for(let j = 24; j >= 0; j -= 8){
                digest[n] = this.chain_[i] >> j & 255;
                ++n;
            }
        }
        return digest;
    }
}
/**
 * Helper to make a Subscribe function (just like Promise helps make a
 * Thenable).
 *
 * @param executor Function which can make calls to a single Observer
 *     as a proxy.
 * @param onNoObservers Callback when count of Observers goes to zero.
 */ function createSubscribe(executor, onNoObservers) {
    const proxy = new ObserverProxy(executor, onNoObservers);
    return proxy.subscribe.bind(proxy);
}
/**
 * Implement fan-out for any number of Observers attached via a subscribe
 * function.
 */ class ObserverProxy {
    /**
     * @param executor Function which can make calls to a single Observer
     *     as a proxy.
     * @param onNoObservers Callback when count of Observers goes to zero.
     */ constructor(executor, onNoObservers){
        this.observers = [];
        this.unsubscribes = [];
        this.observerCount = 0;
        // Micro-task scheduling by calling task.then().
        this.task = Promise.resolve();
        this.finalized = false;
        this.onNoObservers = onNoObservers;
        // Call the executor asynchronously so subscribers that are called
        // synchronously after the creation of the subscribe function
        // can still receive the very first value generated in the executor.
        this.task.then(()=>{
            executor(this);
        }).catch((e)=>{
            this.error(e);
        });
    }
    next(value) {
        this.forEachObserver((observer)=>{
            observer.next(value);
        });
    }
    error(error) {
        this.forEachObserver((observer)=>{
            observer.error(error);
        });
        this.close(error);
    }
    complete() {
        this.forEachObserver((observer)=>{
            observer.complete();
        });
        this.close();
    }
    /**
     * Subscribe function that can be used to add an Observer to the fan-out list.
     *
     * - We require that no event is sent to a subscriber synchronously to their
     *   call to subscribe().
     */ subscribe(nextOrObserver, error, complete) {
        let observer;
        if (nextOrObserver === undefined && error === undefined && complete === undefined) {
            throw new Error('Missing Observer.');
        }
        // Assemble an Observer object when passed as callback functions.
        if (implementsAnyMethods(nextOrObserver, [
            'next',
            'error',
            'complete'
        ])) {
            observer = nextOrObserver;
        } else {
            observer = {
                next: nextOrObserver,
                error,
                complete
            };
        }
        if (observer.next === undefined) {
            observer.next = noop;
        }
        if (observer.error === undefined) {
            observer.error = noop;
        }
        if (observer.complete === undefined) {
            observer.complete = noop;
        }
        const unsub = this.unsubscribeOne.bind(this, this.observers.length);
        // Attempt to subscribe to a terminated Observable - we
        // just respond to the Observer with the final error or complete
        // event.
        if (this.finalized) {
            // eslint-disable-next-line @typescript-eslint/no-floating-promises
            this.task.then(()=>{
                try {
                    if (this.finalError) {
                        observer.error(this.finalError);
                    } else {
                        observer.complete();
                    }
                } catch (e) {
                // nothing
                }
                return;
            });
        }
        this.observers.push(observer);
        return unsub;
    }
    // Unsubscribe is synchronous - we guarantee that no events are sent to
    // any unsubscribed Observer.
    unsubscribeOne(i) {
        if (this.observers === undefined || this.observers[i] === undefined) {
            return;
        }
        delete this.observers[i];
        this.observerCount -= 1;
        if (this.observerCount === 0 && this.onNoObservers !== undefined) {
            this.onNoObservers(this);
        }
    }
    forEachObserver(fn) {
        if (this.finalized) {
            // Already closed by previous event....just eat the additional values.
            return;
        }
        // Since sendOne calls asynchronously - there is no chance that
        // this.observers will become undefined.
        for(let i = 0; i < this.observers.length; i++){
            this.sendOne(i, fn);
        }
    }
    // Call the Observer via one of it's callback function. We are careful to
    // confirm that the observe has not been unsubscribed since this asynchronous
    // function had been queued.
    sendOne(i, fn) {
        // Execute the callback asynchronously
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.task.then(()=>{
            if (this.observers !== undefined && this.observers[i] !== undefined) {
                try {
                    fn(this.observers[i]);
                } catch (e) {
                    // Ignore exceptions raised in Observers or missing methods of an
                    // Observer.
                    // Log error to console. b/31404806
                    if (typeof console !== 'undefined' && console.error) {
                        console.error(e);
                    }
                }
            }
        });
    }
    close(err) {
        if (this.finalized) {
            return;
        }
        this.finalized = true;
        if (err !== undefined) {
            this.finalError = err;
        }
        // Proxy is no longer needed - garbage collect references
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.task.then(()=>{
            this.observers = undefined;
            this.onNoObservers = undefined;
        });
    }
}
/** Turn synchronous function into one called asynchronously. */ // eslint-disable-next-line @typescript-eslint/ban-types
function async(fn, onError) {
    return (...args)=>{
        Promise.resolve(true).then(()=>{
            fn(...args);
        }).catch((error)=>{
            if (onError) {
                onError(error);
            }
        });
    };
}
/**
 * Return true if the object passed in implements any of the named methods.
 */ function implementsAnyMethods(obj, methods) {
    if (typeof obj !== 'object' || obj === null) {
        return false;
    }
    for (const method of methods){
        if (method in obj && typeof obj[method] === 'function') {
            return true;
        }
    }
    return false;
}
function noop() {
// do nothing
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Check to make sure the appropriate number of arguments are provided for a public function.
 * Throws an error if it fails.
 *
 * @param fnName The function name
 * @param minCount The minimum number of arguments to allow for the function call
 * @param maxCount The maximum number of argument to allow for the function call
 * @param argCount The actual number of arguments provided.
 */ const validateArgCount = function(fnName, minCount, maxCount, argCount) {
    let argError;
    if (argCount < minCount) {
        argError = 'at least ' + minCount;
    } else if (argCount > maxCount) {
        argError = maxCount === 0 ? 'none' : 'no more than ' + maxCount;
    }
    if (argError) {
        const error = fnName + ' failed: Was called with ' + argCount + (argCount === 1 ? ' argument.' : ' arguments.') + ' Expects ' + argError + '.';
        throw new Error(error);
    }
};
/**
 * Generates a string to prefix an error message about failed argument validation
 *
 * @param fnName The function name
 * @param argName The name of the argument
 * @return The prefix to add to the error thrown for validation.
 */ function errorPrefix(fnName, argName) {
    return `${fnName} failed: ${argName} argument `;
}
/**
 * @param fnName
 * @param argumentNumber
 * @param namespace
 * @param optional
 */ function validateNamespace(fnName, namespace, optional) {
    if (optional && !namespace) {
        return;
    }
    if (typeof namespace !== 'string') {
        //TODO: I should do more validation here. We only allow certain chars in namespaces.
        throw new Error(errorPrefix(fnName, 'namespace') + 'must be a valid firebase namespace.');
    }
}
function validateCallback(fnName, argumentName, // eslint-disable-next-line @typescript-eslint/ban-types
callback, optional) {
    if (optional && !callback) {
        return;
    }
    if (typeof callback !== 'function') {
        throw new Error(errorPrefix(fnName, argumentName) + 'must be a valid function.');
    }
}
function validateContextObject(fnName, argumentName, context, optional) {
    if (optional && !context) {
        return;
    }
    if (typeof context !== 'object' || context === null) {
        throw new Error(errorPrefix(fnName, argumentName) + 'must be a valid context object.');
    }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ // Code originally came from goog.crypt.stringToUtf8ByteArray, but for some reason they
// automatically replaced '\r\n' with '\n', and they didn't handle surrogate pairs,
// so it's been modified.
// Note that not all Unicode characters appear as single characters in JavaScript strings.
// fromCharCode returns the UTF-16 encoding of a character - so some Unicode characters
// use 2 characters in JavaScript.  All 4-byte UTF-8 characters begin with a first
// character in the range 0xD800 - 0xDBFF (the first character of a so-called surrogate
// pair).
// See http://www.ecma-international.org/ecma-262/5.1/#sec-15.1.3
/**
 * @param {string} str
 * @return {Array}
 */ const stringToByteArray = function(str) {
    const out = [];
    let p = 0;
    for(let i = 0; i < str.length; i++){
        let c = str.charCodeAt(i);
        // Is this the lead surrogate in a surrogate pair?
        if (c >= 0xd800 && c <= 0xdbff) {
            const high = c - 0xd800; // the high 10 bits.
            i++;
            assert(i < str.length, 'Surrogate pair missing trail surrogate.');
            const low = str.charCodeAt(i) - 0xdc00; // the low 10 bits.
            c = 0x10000 + (high << 10) + low;
        }
        if (c < 128) {
            out[p++] = c;
        } else if (c < 2048) {
            out[p++] = c >> 6 | 192;
            out[p++] = c & 63 | 128;
        } else if (c < 65536) {
            out[p++] = c >> 12 | 224;
            out[p++] = c >> 6 & 63 | 128;
            out[p++] = c & 63 | 128;
        } else {
            out[p++] = c >> 18 | 240;
            out[p++] = c >> 12 & 63 | 128;
            out[p++] = c >> 6 & 63 | 128;
            out[p++] = c & 63 | 128;
        }
    }
    return out;
};
/**
 * Calculate length without actually converting; useful for doing cheaper validation.
 * @param {string} str
 * @return {number}
 */ const stringLength = function(str) {
    let p = 0;
    for(let i = 0; i < str.length; i++){
        const c = str.charCodeAt(i);
        if (c < 128) {
            p++;
        } else if (c < 2048) {
            p += 2;
        } else if (c >= 0xd800 && c <= 0xdbff) {
            // Lead surrogate of a surrogate pair.  The pair together will take 4 bytes to represent.
            p += 4;
            i++; // skip trail surrogate.
        } else {
            p += 3;
        }
    }
    return p;
};
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * The amount of milliseconds to exponentially increase.
 */ const DEFAULT_INTERVAL_MILLIS = 1000;
/**
 * The factor to backoff by.
 * Should be a number greater than 1.
 */ const DEFAULT_BACKOFF_FACTOR = 2;
/**
 * The maximum milliseconds to increase to.
 *
 * <p>Visible for testing
 */ const MAX_VALUE_MILLIS = 4 * 60 * 60 * 1000; // Four hours, like iOS and Android.
/**
 * The percentage of backoff time to randomize by.
 * See
 * http://go/safe-client-behavior#step-1-determine-the-appropriate-retry-interval-to-handle-spike-traffic
 * for context.
 *
 * <p>Visible for testing
 */ const RANDOM_FACTOR = 0.5;
/**
 * Based on the backoff method from
 * https://github.com/google/closure-library/blob/master/closure/goog/math/exponentialbackoff.js.
 * Extracted here so we don't need to pass metadata and a stateful ExponentialBackoff object around.
 */ function calculateBackoffMillis(backoffCount, intervalMillis = DEFAULT_INTERVAL_MILLIS, backoffFactor = DEFAULT_BACKOFF_FACTOR) {
    // Calculates an exponentially increasing value.
    // Deviation: calculates value from count and a constant interval, so we only need to save value
    // and count to restore state.
    const currBaseValue = intervalMillis * Math.pow(backoffFactor, backoffCount);
    // A random "fuzz" to avoid waves of retries.
    // Deviation: randomFactor is required.
    const randomWait = Math.round(// A fraction of the backoff value to add/subtract.
    // Deviation: changes multiplication order to improve readability.
    RANDOM_FACTOR * currBaseValue * // A random float (rounded to int by Math.round above) in the range [-1, 1]. Determines
    // if we add or subtract.
    (Math.random() - 0.5) * 2);
    // Limits backoff to max to avoid effectively permanent backoff.
    return Math.min(MAX_VALUE_MILLIS, currBaseValue + randomWait);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Provide English ordinal letters after a number
 */ function ordinal(i) {
    if (!Number.isFinite(i)) {
        return `${i}`;
    }
    return i + indicator(i);
}
function indicator(i) {
    i = Math.abs(i);
    const cent = i % 100;
    if (cent >= 10 && cent <= 20) {
        return 'th';
    }
    const dec = i % 10;
    if (dec === 1) {
        return 'st';
    }
    if (dec === 2) {
        return 'nd';
    }
    if (dec === 3) {
        return 'rd';
    }
    return 'th';
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function getModularInstance(service) {
    if (service && service._delegate) {
        return service._delegate;
    } else {
        return service;
    }
}
;
 //# sourceMappingURL=index.esm2017.js.map
}}),
"[project]/node_modules/@firebase/component/dist/esm/index.esm2017.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "Component": (()=>Component),
    "ComponentContainer": (()=>ComponentContainer),
    "Provider": (()=>Provider)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/util/dist/index.esm2017.js [app-client] (ecmascript)");
;
/**
 * Component for service name T, e.g. `auth`, `auth-internal`
 */ class Component {
    /**
     *
     * @param name The public service name, e.g. app, auth, firestore, database
     * @param instanceFactory Service factory responsible for creating the public interface
     * @param type whether the service provided by the component is public or private
     */ constructor(name, instanceFactory, type){
        this.name = name;
        this.instanceFactory = instanceFactory;
        this.type = type;
        this.multipleInstances = false;
        /**
         * Properties to be added to the service namespace
         */ this.serviceProps = {};
        this.instantiationMode = "LAZY" /* InstantiationMode.LAZY */ ;
        this.onInstanceCreated = null;
    }
    setInstantiationMode(mode) {
        this.instantiationMode = mode;
        return this;
    }
    setMultipleInstances(multipleInstances) {
        this.multipleInstances = multipleInstances;
        return this;
    }
    setServiceProps(props) {
        this.serviceProps = props;
        return this;
    }
    setInstanceCreatedCallback(callback) {
        this.onInstanceCreated = callback;
        return this;
    }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const DEFAULT_ENTRY_NAME = '[DEFAULT]';
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Provider for instance for service name T, e.g. 'auth', 'auth-internal'
 * NameServiceMapping[T] is an alias for the type of the instance
 */ class Provider {
    constructor(name, container){
        this.name = name;
        this.container = container;
        this.component = null;
        this.instances = new Map();
        this.instancesDeferred = new Map();
        this.instancesOptions = new Map();
        this.onInitCallbacks = new Map();
    }
    /**
     * @param identifier A provider can provide multiple instances of a service
     * if this.component.multipleInstances is true.
     */ get(identifier) {
        // if multipleInstances is not supported, use the default name
        const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
        if (!this.instancesDeferred.has(normalizedIdentifier)) {
            const deferred = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Deferred"]();
            this.instancesDeferred.set(normalizedIdentifier, deferred);
            if (this.isInitialized(normalizedIdentifier) || this.shouldAutoInitialize()) {
                // initialize the service if it can be auto-initialized
                try {
                    const instance = this.getOrInitializeService({
                        instanceIdentifier: normalizedIdentifier
                    });
                    if (instance) {
                        deferred.resolve(instance);
                    }
                } catch (e) {
                // when the instance factory throws an exception during get(), it should not cause
                // a fatal error. We just return the unresolved promise in this case.
                }
            }
        }
        return this.instancesDeferred.get(normalizedIdentifier).promise;
    }
    getImmediate(options) {
        var _a;
        // if multipleInstances is not supported, use the default name
        const normalizedIdentifier = this.normalizeInstanceIdentifier(options === null || options === void 0 ? void 0 : options.identifier);
        const optional = (_a = options === null || options === void 0 ? void 0 : options.optional) !== null && _a !== void 0 ? _a : false;
        if (this.isInitialized(normalizedIdentifier) || this.shouldAutoInitialize()) {
            try {
                return this.getOrInitializeService({
                    instanceIdentifier: normalizedIdentifier
                });
            } catch (e) {
                if (optional) {
                    return null;
                } else {
                    throw e;
                }
            }
        } else {
            // In case a component is not initialized and should/cannot be auto-initialized at the moment, return null if the optional flag is set, or throw
            if (optional) {
                return null;
            } else {
                throw Error(`Service ${this.name} is not available`);
            }
        }
    }
    getComponent() {
        return this.component;
    }
    setComponent(component) {
        if (component.name !== this.name) {
            throw Error(`Mismatching Component ${component.name} for Provider ${this.name}.`);
        }
        if (this.component) {
            throw Error(`Component for ${this.name} has already been provided`);
        }
        this.component = component;
        // return early without attempting to initialize the component if the component requires explicit initialization (calling `Provider.initialize()`)
        if (!this.shouldAutoInitialize()) {
            return;
        }
        // if the service is eager, initialize the default instance
        if (isComponentEager(component)) {
            try {
                this.getOrInitializeService({
                    instanceIdentifier: DEFAULT_ENTRY_NAME
                });
            } catch (e) {
            // when the instance factory for an eager Component throws an exception during the eager
            // initialization, it should not cause a fatal error.
            // TODO: Investigate if we need to make it configurable, because some component may want to cause
            // a fatal error in this case?
            }
        }
        // Create service instances for the pending promises and resolve them
        // NOTE: if this.multipleInstances is false, only the default instance will be created
        // and all promises with resolve with it regardless of the identifier.
        for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()){
            const normalizedIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
            try {
                // `getOrInitializeService()` should always return a valid instance since a component is guaranteed. use ! to make typescript happy.
                const instance = this.getOrInitializeService({
                    instanceIdentifier: normalizedIdentifier
                });
                instanceDeferred.resolve(instance);
            } catch (e) {
            // when the instance factory throws an exception, it should not cause
            // a fatal error. We just leave the promise unresolved.
            }
        }
    }
    clearInstance(identifier = DEFAULT_ENTRY_NAME) {
        this.instancesDeferred.delete(identifier);
        this.instancesOptions.delete(identifier);
        this.instances.delete(identifier);
    }
    // app.delete() will call this method on every provider to delete the services
    // TODO: should we mark the provider as deleted?
    async delete() {
        const services = Array.from(this.instances.values());
        await Promise.all([
            ...services.filter((service)=>'INTERNAL' in service) // legacy services
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((service)=>service.INTERNAL.delete()),
            ...services.filter((service)=>'_delete' in service) // modularized services
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((service)=>service._delete())
        ]);
    }
    isComponentSet() {
        return this.component != null;
    }
    isInitialized(identifier = DEFAULT_ENTRY_NAME) {
        return this.instances.has(identifier);
    }
    getOptions(identifier = DEFAULT_ENTRY_NAME) {
        return this.instancesOptions.get(identifier) || {};
    }
    initialize(opts = {}) {
        const { options = {} } = opts;
        const normalizedIdentifier = this.normalizeInstanceIdentifier(opts.instanceIdentifier);
        if (this.isInitialized(normalizedIdentifier)) {
            throw Error(`${this.name}(${normalizedIdentifier}) has already been initialized`);
        }
        if (!this.isComponentSet()) {
            throw Error(`Component ${this.name} has not been registered yet`);
        }
        const instance = this.getOrInitializeService({
            instanceIdentifier: normalizedIdentifier,
            options
        });
        // resolve any pending promise waiting for the service instance
        for (const [instanceIdentifier, instanceDeferred] of this.instancesDeferred.entries()){
            const normalizedDeferredIdentifier = this.normalizeInstanceIdentifier(instanceIdentifier);
            if (normalizedIdentifier === normalizedDeferredIdentifier) {
                instanceDeferred.resolve(instance);
            }
        }
        return instance;
    }
    /**
     *
     * @param callback - a function that will be invoked  after the provider has been initialized by calling provider.initialize().
     * The function is invoked SYNCHRONOUSLY, so it should not execute any longrunning tasks in order to not block the program.
     *
     * @param identifier An optional instance identifier
     * @returns a function to unregister the callback
     */ onInit(callback, identifier) {
        var _a;
        const normalizedIdentifier = this.normalizeInstanceIdentifier(identifier);
        const existingCallbacks = (_a = this.onInitCallbacks.get(normalizedIdentifier)) !== null && _a !== void 0 ? _a : new Set();
        existingCallbacks.add(callback);
        this.onInitCallbacks.set(normalizedIdentifier, existingCallbacks);
        const existingInstance = this.instances.get(normalizedIdentifier);
        if (existingInstance) {
            callback(existingInstance, normalizedIdentifier);
        }
        return ()=>{
            existingCallbacks.delete(callback);
        };
    }
    /**
     * Invoke onInit callbacks synchronously
     * @param instance the service instance`
     */ invokeOnInitCallbacks(instance, identifier) {
        const callbacks = this.onInitCallbacks.get(identifier);
        if (!callbacks) {
            return;
        }
        for (const callback of callbacks){
            try {
                callback(instance, identifier);
            } catch (_a) {
            // ignore errors in the onInit callback
            }
        }
    }
    getOrInitializeService({ instanceIdentifier, options = {} }) {
        let instance = this.instances.get(instanceIdentifier);
        if (!instance && this.component) {
            instance = this.component.instanceFactory(this.container, {
                instanceIdentifier: normalizeIdentifierForFactory(instanceIdentifier),
                options
            });
            this.instances.set(instanceIdentifier, instance);
            this.instancesOptions.set(instanceIdentifier, options);
            /**
             * Invoke onInit listeners.
             * Note this.component.onInstanceCreated is different, which is used by the component creator,
             * while onInit listeners are registered by consumers of the provider.
             */ this.invokeOnInitCallbacks(instance, instanceIdentifier);
            /**
             * Order is important
             * onInstanceCreated() should be called after this.instances.set(instanceIdentifier, instance); which
             * makes `isInitialized()` return true.
             */ if (this.component.onInstanceCreated) {
                try {
                    this.component.onInstanceCreated(this.container, instanceIdentifier, instance);
                } catch (_a) {
                // ignore errors in the onInstanceCreatedCallback
                }
            }
        }
        return instance || null;
    }
    normalizeInstanceIdentifier(identifier = DEFAULT_ENTRY_NAME) {
        if (this.component) {
            return this.component.multipleInstances ? identifier : DEFAULT_ENTRY_NAME;
        } else {
            return identifier; // assume multiple instances are supported before the component is provided.
        }
    }
    shouldAutoInitialize() {
        return !!this.component && this.component.instantiationMode !== "EXPLICIT" /* InstantiationMode.EXPLICIT */ ;
    }
}
// undefined should be passed to the service factory for the default instance
function normalizeIdentifierForFactory(identifier) {
    return identifier === DEFAULT_ENTRY_NAME ? undefined : identifier;
}
function isComponentEager(component) {
    return component.instantiationMode === "EAGER" /* InstantiationMode.EAGER */ ;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * ComponentContainer that provides Providers for service name T, e.g. `auth`, `auth-internal`
 */ class ComponentContainer {
    constructor(name){
        this.name = name;
        this.providers = new Map();
    }
    /**
     *
     * @param component Component being added
     * @param overwrite When a component with the same name has already been registered,
     * if overwrite is true: overwrite the existing component with the new component and create a new
     * provider with the new component. It can be useful in tests where you want to use different mocks
     * for different tests.
     * if overwrite is false: throw an exception
     */ addComponent(component) {
        const provider = this.getProvider(component.name);
        if (provider.isComponentSet()) {
            throw new Error(`Component ${component.name} has already been registered with ${this.name}`);
        }
        provider.setComponent(component);
    }
    addOrOverwriteComponent(component) {
        const provider = this.getProvider(component.name);
        if (provider.isComponentSet()) {
            // delete the existing provider from the container, so we can register the new component
            this.providers.delete(component.name);
        }
        this.addComponent(component);
    }
    /**
     * getProvider provides a type safe interface where it can only be called with a field name
     * present in NameServiceMapping interface.
     *
     * Firebase SDKs providing services should extend NameServiceMapping interface to register
     * themselves.
     */ getProvider(name) {
        if (this.providers.has(name)) {
            return this.providers.get(name);
        }
        // create a Provider for a service that hasn't registered with Firebase
        const provider = new Provider(name, this);
        this.providers.set(name, provider);
        return provider;
    }
    getProviders() {
        return Array.from(this.providers.values());
    }
}
;
 //# sourceMappingURL=index.esm2017.js.map
}}),
"[project]/node_modules/@firebase/logger/dist/esm/index.esm2017.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * A container for all of the Logger instances
 */ __turbopack_context__.s({
    "LogLevel": (()=>LogLevel),
    "Logger": (()=>Logger),
    "setLogLevel": (()=>setLogLevel),
    "setUserLogHandler": (()=>setUserLogHandler)
});
const instances = [];
/**
 * The JS SDK supports 5 log levels and also allows a user the ability to
 * silence the logs altogether.
 *
 * The order is a follows:
 * DEBUG < VERBOSE < INFO < WARN < ERROR
 *
 * All of the log types above the current log level will be captured (i.e. if
 * you set the log level to `INFO`, errors will still be logged, but `DEBUG` and
 * `VERBOSE` logs will not)
 */ var LogLevel;
(function(LogLevel) {
    LogLevel[LogLevel["DEBUG"] = 0] = "DEBUG";
    LogLevel[LogLevel["VERBOSE"] = 1] = "VERBOSE";
    LogLevel[LogLevel["INFO"] = 2] = "INFO";
    LogLevel[LogLevel["WARN"] = 3] = "WARN";
    LogLevel[LogLevel["ERROR"] = 4] = "ERROR";
    LogLevel[LogLevel["SILENT"] = 5] = "SILENT";
})(LogLevel || (LogLevel = {}));
const levelStringToEnum = {
    'debug': LogLevel.DEBUG,
    'verbose': LogLevel.VERBOSE,
    'info': LogLevel.INFO,
    'warn': LogLevel.WARN,
    'error': LogLevel.ERROR,
    'silent': LogLevel.SILENT
};
/**
 * The default log level
 */ const defaultLogLevel = LogLevel.INFO;
/**
 * By default, `console.debug` is not displayed in the developer console (in
 * chrome). To avoid forcing users to have to opt-in to these logs twice
 * (i.e. once for firebase, and once in the console), we are sending `DEBUG`
 * logs to the `console.log` function.
 */ const ConsoleMethod = {
    [LogLevel.DEBUG]: 'log',
    [LogLevel.VERBOSE]: 'log',
    [LogLevel.INFO]: 'info',
    [LogLevel.WARN]: 'warn',
    [LogLevel.ERROR]: 'error'
};
/**
 * The default log handler will forward DEBUG, VERBOSE, INFO, WARN, and ERROR
 * messages on to their corresponding console counterparts (if the log method
 * is supported by the current log level)
 */ const defaultLogHandler = (instance, logType, ...args)=>{
    if (logType < instance.logLevel) {
        return;
    }
    const now = new Date().toISOString();
    const method = ConsoleMethod[logType];
    if (method) {
        console[method](`[${now}]  ${instance.name}:`, ...args);
    } else {
        throw new Error(`Attempted to log a message with an invalid logType (value: ${logType})`);
    }
};
class Logger {
    /**
     * Gives you an instance of a Logger to capture messages according to
     * Firebase's logging scheme.
     *
     * @param name The name that the logs will be associated with
     */ constructor(name){
        this.name = name;
        /**
         * The log level of the given Logger instance.
         */ this._logLevel = defaultLogLevel;
        /**
         * The main (internal) log handler for the Logger instance.
         * Can be set to a new function in internal package code but not by user.
         */ this._logHandler = defaultLogHandler;
        /**
         * The optional, additional, user-defined log handler for the Logger instance.
         */ this._userLogHandler = null;
        /**
         * Capture the current instance for later use
         */ instances.push(this);
    }
    get logLevel() {
        return this._logLevel;
    }
    set logLevel(val) {
        if (!(val in LogLevel)) {
            throw new TypeError(`Invalid value "${val}" assigned to \`logLevel\``);
        }
        this._logLevel = val;
    }
    // Workaround for setter/getter having to be the same type.
    setLogLevel(val) {
        this._logLevel = typeof val === 'string' ? levelStringToEnum[val] : val;
    }
    get logHandler() {
        return this._logHandler;
    }
    set logHandler(val) {
        if (typeof val !== 'function') {
            throw new TypeError('Value assigned to `logHandler` must be a function');
        }
        this._logHandler = val;
    }
    get userLogHandler() {
        return this._userLogHandler;
    }
    set userLogHandler(val) {
        this._userLogHandler = val;
    }
    /**
     * The functions below are all based on the `console` interface
     */ debug(...args) {
        this._userLogHandler && this._userLogHandler(this, LogLevel.DEBUG, ...args);
        this._logHandler(this, LogLevel.DEBUG, ...args);
    }
    log(...args) {
        this._userLogHandler && this._userLogHandler(this, LogLevel.VERBOSE, ...args);
        this._logHandler(this, LogLevel.VERBOSE, ...args);
    }
    info(...args) {
        this._userLogHandler && this._userLogHandler(this, LogLevel.INFO, ...args);
        this._logHandler(this, LogLevel.INFO, ...args);
    }
    warn(...args) {
        this._userLogHandler && this._userLogHandler(this, LogLevel.WARN, ...args);
        this._logHandler(this, LogLevel.WARN, ...args);
    }
    error(...args) {
        this._userLogHandler && this._userLogHandler(this, LogLevel.ERROR, ...args);
        this._logHandler(this, LogLevel.ERROR, ...args);
    }
}
function setLogLevel(level) {
    instances.forEach((inst)=>{
        inst.setLogLevel(level);
    });
}
function setUserLogHandler(logCallback, options) {
    for (const instance of instances){
        let customLogLevel = null;
        if (options && options.level) {
            customLogLevel = levelStringToEnum[options.level];
        }
        if (logCallback === null) {
            instance.userLogHandler = null;
        } else {
            instance.userLogHandler = (instance, level, ...args)=>{
                const message = args.map((arg)=>{
                    if (arg == null) {
                        return null;
                    } else if (typeof arg === 'string') {
                        return arg;
                    } else if (typeof arg === 'number' || typeof arg === 'boolean') {
                        return arg.toString();
                    } else if (arg instanceof Error) {
                        return arg.message;
                    } else {
                        try {
                            return JSON.stringify(arg);
                        } catch (ignored) {
                            return null;
                        }
                    }
                }).filter((arg)=>arg).join(' ');
                if (level >= (customLogLevel !== null && customLogLevel !== void 0 ? customLogLevel : instance.logLevel)) {
                    logCallback({
                        level: LogLevel[level].toLowerCase(),
                        message,
                        args,
                        type: instance.name
                    });
                }
            };
        }
    }
}
;
 //# sourceMappingURL=index.esm2017.js.map
}}),
"[project]/node_modules/idb/build/wrap-idb-value.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "a": (()=>reverseTransformCache),
    "i": (()=>instanceOfAny),
    "r": (()=>replaceTraps),
    "u": (()=>unwrap),
    "w": (()=>wrap)
});
const instanceOfAny = (object, constructors)=>constructors.some((c)=>object instanceof c);
let idbProxyableTypes;
let cursorAdvanceMethods;
// This is a function to prevent it throwing up in node environments.
function getIdbProxyableTypes() {
    return idbProxyableTypes || (idbProxyableTypes = [
        IDBDatabase,
        IDBObjectStore,
        IDBIndex,
        IDBCursor,
        IDBTransaction
    ]);
}
// This is a function to prevent it throwing up in node environments.
function getCursorAdvanceMethods() {
    return cursorAdvanceMethods || (cursorAdvanceMethods = [
        IDBCursor.prototype.advance,
        IDBCursor.prototype.continue,
        IDBCursor.prototype.continuePrimaryKey
    ]);
}
const cursorRequestMap = new WeakMap();
const transactionDoneMap = new WeakMap();
const transactionStoreNamesMap = new WeakMap();
const transformCache = new WeakMap();
const reverseTransformCache = new WeakMap();
function promisifyRequest(request) {
    const promise = new Promise((resolve, reject)=>{
        const unlisten = ()=>{
            request.removeEventListener('success', success);
            request.removeEventListener('error', error);
        };
        const success = ()=>{
            resolve(wrap(request.result));
            unlisten();
        };
        const error = ()=>{
            reject(request.error);
            unlisten();
        };
        request.addEventListener('success', success);
        request.addEventListener('error', error);
    });
    promise.then((value)=>{
        // Since cursoring reuses the IDBRequest (*sigh*), we cache it for later retrieval
        // (see wrapFunction).
        if (value instanceof IDBCursor) {
            cursorRequestMap.set(value, request);
        }
    // Catching to avoid "Uncaught Promise exceptions"
    }).catch(()=>{});
    // This mapping exists in reverseTransformCache but doesn't doesn't exist in transformCache. This
    // is because we create many promises from a single IDBRequest.
    reverseTransformCache.set(promise, request);
    return promise;
}
function cacheDonePromiseForTransaction(tx) {
    // Early bail if we've already created a done promise for this transaction.
    if (transactionDoneMap.has(tx)) return;
    const done = new Promise((resolve, reject)=>{
        const unlisten = ()=>{
            tx.removeEventListener('complete', complete);
            tx.removeEventListener('error', error);
            tx.removeEventListener('abort', error);
        };
        const complete = ()=>{
            resolve();
            unlisten();
        };
        const error = ()=>{
            reject(tx.error || new DOMException('AbortError', 'AbortError'));
            unlisten();
        };
        tx.addEventListener('complete', complete);
        tx.addEventListener('error', error);
        tx.addEventListener('abort', error);
    });
    // Cache it for later retrieval.
    transactionDoneMap.set(tx, done);
}
let idbProxyTraps = {
    get (target, prop, receiver) {
        if (target instanceof IDBTransaction) {
            // Special handling for transaction.done.
            if (prop === 'done') return transactionDoneMap.get(target);
            // Polyfill for objectStoreNames because of Edge.
            if (prop === 'objectStoreNames') {
                return target.objectStoreNames || transactionStoreNamesMap.get(target);
            }
            // Make tx.store return the only store in the transaction, or undefined if there are many.
            if (prop === 'store') {
                return receiver.objectStoreNames[1] ? undefined : receiver.objectStore(receiver.objectStoreNames[0]);
            }
        }
        // Else transform whatever we get back.
        return wrap(target[prop]);
    },
    set (target, prop, value) {
        target[prop] = value;
        return true;
    },
    has (target, prop) {
        if (target instanceof IDBTransaction && (prop === 'done' || prop === 'store')) {
            return true;
        }
        return prop in target;
    }
};
function replaceTraps(callback) {
    idbProxyTraps = callback(idbProxyTraps);
}
function wrapFunction(func) {
    // Due to expected object equality (which is enforced by the caching in `wrap`), we
    // only create one new func per func.
    // Edge doesn't support objectStoreNames (booo), so we polyfill it here.
    if (func === IDBDatabase.prototype.transaction && !('objectStoreNames' in IDBTransaction.prototype)) {
        return function(storeNames, ...args) {
            const tx = func.call(unwrap(this), storeNames, ...args);
            transactionStoreNamesMap.set(tx, storeNames.sort ? storeNames.sort() : [
                storeNames
            ]);
            return wrap(tx);
        };
    }
    // Cursor methods are special, as the behaviour is a little more different to standard IDB. In
    // IDB, you advance the cursor and wait for a new 'success' on the IDBRequest that gave you the
    // cursor. It's kinda like a promise that can resolve with many values. That doesn't make sense
    // with real promises, so each advance methods returns a new promise for the cursor object, or
    // undefined if the end of the cursor has been reached.
    if (getCursorAdvanceMethods().includes(func)) {
        return function(...args) {
            // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
            // the original object.
            func.apply(unwrap(this), args);
            return wrap(cursorRequestMap.get(this));
        };
    }
    return function(...args) {
        // Calling the original function with the proxy as 'this' causes ILLEGAL INVOCATION, so we use
        // the original object.
        return wrap(func.apply(unwrap(this), args));
    };
}
function transformCachableValue(value) {
    if (typeof value === 'function') return wrapFunction(value);
    // This doesn't return, it just creates a 'done' promise for the transaction,
    // which is later returned for transaction.done (see idbObjectHandler).
    if (value instanceof IDBTransaction) cacheDonePromiseForTransaction(value);
    if (instanceOfAny(value, getIdbProxyableTypes())) return new Proxy(value, idbProxyTraps);
    // Return the same value back if we're not going to transform it.
    return value;
}
function wrap(value) {
    // We sometimes generate multiple promises from a single IDBRequest (eg when cursoring), because
    // IDB is weird and a single IDBRequest can yield many responses, so these can't be cached.
    if (value instanceof IDBRequest) return promisifyRequest(value);
    // If we've already transformed this value before, reuse the transformed value.
    // This is faster, but it also provides object equality.
    if (transformCache.has(value)) return transformCache.get(value);
    const newValue = transformCachableValue(value);
    // Not all types are transformed.
    // These may be primitive types, so they can't be WeakMap keys.
    if (newValue !== value) {
        transformCache.set(value, newValue);
        reverseTransformCache.set(newValue, value);
    }
    return newValue;
}
const unwrap = (value)=>reverseTransformCache.get(value);
;
}}),
"[project]/node_modules/idb/build/index.js [app-client] (ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "deleteDB": (()=>deleteDB),
    "openDB": (()=>openDB)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$wrap$2d$idb$2d$value$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/idb/build/wrap-idb-value.js [app-client] (ecmascript)");
;
;
/**
 * Open a database.
 *
 * @param name Name of the database.
 * @param version Schema version.
 * @param callbacks Additional callbacks.
 */ function openDB(name, version, { blocked, upgrade, blocking, terminated } = {}) {
    const request = indexedDB.open(name, version);
    const openPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$wrap$2d$idb$2d$value$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["w"])(request);
    if (upgrade) {
        request.addEventListener('upgradeneeded', (event)=>{
            upgrade((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$wrap$2d$idb$2d$value$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["w"])(request.result), event.oldVersion, event.newVersion, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$wrap$2d$idb$2d$value$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["w"])(request.transaction), event);
        });
    }
    if (blocked) {
        request.addEventListener('blocked', (event)=>blocked(// Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
            event.oldVersion, event.newVersion, event));
    }
    openPromise.then((db)=>{
        if (terminated) db.addEventListener('close', ()=>terminated());
        if (blocking) {
            db.addEventListener('versionchange', (event)=>blocking(event.oldVersion, event.newVersion, event));
        }
    }).catch(()=>{});
    return openPromise;
}
/**
 * Delete a database.
 *
 * @param name Name of the database.
 */ function deleteDB(name, { blocked } = {}) {
    const request = indexedDB.deleteDatabase(name);
    if (blocked) {
        request.addEventListener('blocked', (event)=>blocked(// Casting due to https://github.com/microsoft/TypeScript-DOM-lib-generator/pull/1405
            event.oldVersion, event));
    }
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$wrap$2d$idb$2d$value$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["w"])(request).then(()=>undefined);
}
const readMethods = [
    'get',
    'getKey',
    'getAll',
    'getAllKeys',
    'count'
];
const writeMethods = [
    'put',
    'add',
    'delete',
    'clear'
];
const cachedMethods = new Map();
function getMethod(target, prop) {
    if (!(target instanceof IDBDatabase && !(prop in target) && typeof prop === 'string')) {
        return;
    }
    if (cachedMethods.get(prop)) return cachedMethods.get(prop);
    const targetFuncName = prop.replace(/FromIndex$/, '');
    const useIndex = prop !== targetFuncName;
    const isWrite = writeMethods.includes(targetFuncName);
    if (// Bail if the target doesn't exist on the target. Eg, getAll isn't in Edge.
    !(targetFuncName in (useIndex ? IDBIndex : IDBObjectStore).prototype) || !(isWrite || readMethods.includes(targetFuncName))) {
        return;
    }
    const method = async function(storeName, ...args) {
        // isWrite ? 'readwrite' : undefined gzipps better, but fails in Edge :(
        const tx = this.transaction(storeName, isWrite ? 'readwrite' : 'readonly');
        let target = tx.store;
        if (useIndex) target = target.index(args.shift());
        // Must reject if op rejects.
        // If it's a write operation, must reject if tx.done rejects.
        // Must reject with op rejection first.
        // Must resolve with op value.
        // Must handle both promises (no unhandled rejections)
        return (await Promise.all([
            target[targetFuncName](...args),
            isWrite && tx.done
        ]))[0];
    };
    cachedMethods.set(prop, method);
    return method;
}
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$wrap$2d$idb$2d$value$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["r"])((oldTraps)=>({
        ...oldTraps,
        get: (target, prop, receiver)=>getMethod(target, prop) || oldTraps.get(target, prop, receiver),
        has: (target, prop)=>!!getMethod(target, prop) || oldTraps.has(target, prop)
    }));
;
}}),
"[project]/node_modules/idb/build/index.js [app-client] (ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$wrap$2d$idb$2d$value$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/idb/build/wrap-idb-value.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/idb/build/index.js [app-client] (ecmascript) <locals>");
}}),
"[project]/node_modules/@firebase/app/dist/esm/index.esm2017.js [app-client] (ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "SDK_VERSION": (()=>SDK_VERSION),
    "_DEFAULT_ENTRY_NAME": (()=>DEFAULT_ENTRY_NAME),
    "_addComponent": (()=>_addComponent),
    "_addOrOverwriteComponent": (()=>_addOrOverwriteComponent),
    "_apps": (()=>_apps),
    "_clearComponents": (()=>_clearComponents),
    "_components": (()=>_components),
    "_getProvider": (()=>_getProvider),
    "_isFirebaseApp": (()=>_isFirebaseApp),
    "_isFirebaseServerApp": (()=>_isFirebaseServerApp),
    "_registerComponent": (()=>_registerComponent),
    "_removeServiceInstance": (()=>_removeServiceInstance),
    "_serverApps": (()=>_serverApps),
    "deleteApp": (()=>deleteApp),
    "getApp": (()=>getApp),
    "getApps": (()=>getApps),
    "initializeApp": (()=>initializeApp),
    "initializeServerApp": (()=>initializeServerApp),
    "onLog": (()=>onLog),
    "registerVersion": (()=>registerVersion),
    "setLogLevel": (()=>setLogLevel)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$component$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/component/dist/esm/index.esm2017.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$logger$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/logger/dist/esm/index.esm2017.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/util/dist/index.esm2017.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/idb/build/index.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/idb/build/index.js [app-client] (ecmascript) <locals>");
;
;
;
;
;
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class PlatformLoggerServiceImpl {
    constructor(container){
        this.container = container;
    }
    // In initial implementation, this will be called by installations on
    // auth token refresh, and installations will send this string.
    getPlatformInfoString() {
        const providers = this.container.getProviders();
        // Loop through providers and get library/version pairs from any that are
        // version components.
        return providers.map((provider)=>{
            if (isVersionServiceProvider(provider)) {
                const service = provider.getImmediate();
                return `${service.library}/${service.version}`;
            } else {
                return null;
            }
        }).filter((logString)=>logString).join(' ');
    }
}
/**
 *
 * @param provider check if this provider provides a VersionService
 *
 * NOTE: Using Provider<'app-version'> is a hack to indicate that the provider
 * provides VersionService. The provider is not necessarily a 'app-version'
 * provider.
 */ function isVersionServiceProvider(provider) {
    const component = provider.getComponent();
    return (component === null || component === void 0 ? void 0 : component.type) === "VERSION" /* ComponentType.VERSION */ ;
}
const name$q = "@firebase/app";
const version$1 = "0.11.1";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const logger = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$logger$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Logger"]('@firebase/app');
const name$p = "@firebase/app-compat";
const name$o = "@firebase/analytics-compat";
const name$n = "@firebase/analytics";
const name$m = "@firebase/app-check-compat";
const name$l = "@firebase/app-check";
const name$k = "@firebase/auth";
const name$j = "@firebase/auth-compat";
const name$i = "@firebase/database";
const name$h = "@firebase/data-connect";
const name$g = "@firebase/database-compat";
const name$f = "@firebase/functions";
const name$e = "@firebase/functions-compat";
const name$d = "@firebase/installations";
const name$c = "@firebase/installations-compat";
const name$b = "@firebase/messaging";
const name$a = "@firebase/messaging-compat";
const name$9 = "@firebase/performance";
const name$8 = "@firebase/performance-compat";
const name$7 = "@firebase/remote-config";
const name$6 = "@firebase/remote-config-compat";
const name$5 = "@firebase/storage";
const name$4 = "@firebase/storage-compat";
const name$3 = "@firebase/firestore";
const name$2 = "@firebase/vertexai";
const name$1 = "@firebase/firestore-compat";
const name = "firebase";
const version = "11.3.1";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * The default app name
 *
 * @internal
 */ const DEFAULT_ENTRY_NAME = '[DEFAULT]';
const PLATFORM_LOG_STRING = {
    [name$q]: 'fire-core',
    [name$p]: 'fire-core-compat',
    [name$n]: 'fire-analytics',
    [name$o]: 'fire-analytics-compat',
    [name$l]: 'fire-app-check',
    [name$m]: 'fire-app-check-compat',
    [name$k]: 'fire-auth',
    [name$j]: 'fire-auth-compat',
    [name$i]: 'fire-rtdb',
    [name$h]: 'fire-data-connect',
    [name$g]: 'fire-rtdb-compat',
    [name$f]: 'fire-fn',
    [name$e]: 'fire-fn-compat',
    [name$d]: 'fire-iid',
    [name$c]: 'fire-iid-compat',
    [name$b]: 'fire-fcm',
    [name$a]: 'fire-fcm-compat',
    [name$9]: 'fire-perf',
    [name$8]: 'fire-perf-compat',
    [name$7]: 'fire-rc',
    [name$6]: 'fire-rc-compat',
    [name$5]: 'fire-gcs',
    [name$4]: 'fire-gcs-compat',
    [name$3]: 'fire-fst',
    [name$1]: 'fire-fst-compat',
    [name$2]: 'fire-vertex',
    'fire-js': 'fire-js',
    [name]: 'fire-js-all'
};
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * @internal
 */ const _apps = new Map();
/**
 * @internal
 */ const _serverApps = new Map();
/**
 * Registered components.
 *
 * @internal
 */ // eslint-disable-next-line @typescript-eslint/no-explicit-any
const _components = new Map();
/**
 * @param component - the component being added to this app's container
 *
 * @internal
 */ function _addComponent(app, component) {
    try {
        app.container.addComponent(component);
    } catch (e) {
        logger.debug(`Component ${component.name} failed to register with FirebaseApp ${app.name}`, e);
    }
}
/**
 *
 * @internal
 */ function _addOrOverwriteComponent(app, component) {
    app.container.addOrOverwriteComponent(component);
}
/**
 *
 * @param component - the component to register
 * @returns whether or not the component is registered successfully
 *
 * @internal
 */ function _registerComponent(component) {
    const componentName = component.name;
    if (_components.has(componentName)) {
        logger.debug(`There were multiple attempts to register component ${componentName}.`);
        return false;
    }
    _components.set(componentName, component);
    // add the component to existing app instances
    for (const app of _apps.values()){
        _addComponent(app, component);
    }
    for (const serverApp of _serverApps.values()){
        _addComponent(serverApp, component);
    }
    return true;
}
/**
 *
 * @param app - FirebaseApp instance
 * @param name - service name
 *
 * @returns the provider for the service with the matching name
 *
 * @internal
 */ function _getProvider(app, name) {
    const heartbeatController = app.container.getProvider('heartbeat').getImmediate({
        optional: true
    });
    if (heartbeatController) {
        void heartbeatController.triggerHeartbeat();
    }
    return app.container.getProvider(name);
}
/**
 *
 * @param app - FirebaseApp instance
 * @param name - service name
 * @param instanceIdentifier - service instance identifier in case the service supports multiple instances
 *
 * @internal
 */ function _removeServiceInstance(app, name, instanceIdentifier = DEFAULT_ENTRY_NAME) {
    _getProvider(app, name).clearInstance(instanceIdentifier);
}
/**
 *
 * @param obj - an object of type FirebaseApp or FirebaseOptions.
 *
 * @returns true if the provide object is of type FirebaseApp.
 *
 * @internal
 */ function _isFirebaseApp(obj) {
    return obj.options !== undefined;
}
/**
 *
 * @param obj - an object of type FirebaseApp.
 *
 * @returns true if the provided object is of type FirebaseServerAppImpl.
 *
 * @internal
 */ function _isFirebaseServerApp(obj) {
    if (obj === null || obj === undefined) {
        return false;
    }
    return obj.settings !== undefined;
}
/**
 * Test only
 *
 * @internal
 */ function _clearComponents() {
    _components.clear();
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const ERRORS = {
    ["no-app" /* AppError.NO_APP */ ]: "No Firebase App '{$appName}' has been created - " + 'call initializeApp() first',
    ["bad-app-name" /* AppError.BAD_APP_NAME */ ]: "Illegal App name: '{$appName}'",
    ["duplicate-app" /* AppError.DUPLICATE_APP */ ]: "Firebase App named '{$appName}' already exists with different options or config",
    ["app-deleted" /* AppError.APP_DELETED */ ]: "Firebase App named '{$appName}' already deleted",
    ["server-app-deleted" /* AppError.SERVER_APP_DELETED */ ]: 'Firebase Server App has been deleted',
    ["no-options" /* AppError.NO_OPTIONS */ ]: 'Need to provide options, when not being deployed to hosting via source.',
    ["invalid-app-argument" /* AppError.INVALID_APP_ARGUMENT */ ]: 'firebase.{$appName}() takes either no argument or a ' + 'Firebase App instance.',
    ["invalid-log-argument" /* AppError.INVALID_LOG_ARGUMENT */ ]: 'First argument to `onLog` must be null or a function.',
    ["idb-open" /* AppError.IDB_OPEN */ ]: 'Error thrown when opening IndexedDB. Original error: {$originalErrorMessage}.',
    ["idb-get" /* AppError.IDB_GET */ ]: 'Error thrown when reading from IndexedDB. Original error: {$originalErrorMessage}.',
    ["idb-set" /* AppError.IDB_WRITE */ ]: 'Error thrown when writing to IndexedDB. Original error: {$originalErrorMessage}.',
    ["idb-delete" /* AppError.IDB_DELETE */ ]: 'Error thrown when deleting from IndexedDB. Original error: {$originalErrorMessage}.',
    ["finalization-registry-not-supported" /* AppError.FINALIZATION_REGISTRY_NOT_SUPPORTED */ ]: 'FirebaseServerApp deleteOnDeref field defined but the JS runtime does not support FinalizationRegistry.',
    ["invalid-server-app-environment" /* AppError.INVALID_SERVER_APP_ENVIRONMENT */ ]: 'FirebaseServerApp is not for use in browser environments.'
};
const ERROR_FACTORY = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ErrorFactory"]('app', 'Firebase', ERRORS);
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class FirebaseAppImpl {
    constructor(options, config, container){
        this._isDeleted = false;
        this._options = Object.assign({}, options);
        this._config = Object.assign({}, config);
        this._name = config.name;
        this._automaticDataCollectionEnabled = config.automaticDataCollectionEnabled;
        this._container = container;
        this.container.addComponent(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$component$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Component"]('app', ()=>this, "PUBLIC" /* ComponentType.PUBLIC */ ));
    }
    get automaticDataCollectionEnabled() {
        this.checkDestroyed();
        return this._automaticDataCollectionEnabled;
    }
    set automaticDataCollectionEnabled(val) {
        this.checkDestroyed();
        this._automaticDataCollectionEnabled = val;
    }
    get name() {
        this.checkDestroyed();
        return this._name;
    }
    get options() {
        this.checkDestroyed();
        return this._options;
    }
    get config() {
        this.checkDestroyed();
        return this._config;
    }
    get container() {
        return this._container;
    }
    get isDeleted() {
        return this._isDeleted;
    }
    set isDeleted(val) {
        this._isDeleted = val;
    }
    /**
     * This function will throw an Error if the App has already been deleted -
     * use before performing API actions on the App.
     */ checkDestroyed() {
        if (this.isDeleted) {
            throw ERROR_FACTORY.create("app-deleted" /* AppError.APP_DELETED */ , {
                appName: this._name
            });
        }
    }
}
/**
 * @license
 * Copyright 2023 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ // Parse the token and check to see if the `exp` claim is in the future.
// Reports an error to the console if the token or claim could not be parsed, or if `exp` is in
// the past.
function validateTokenTTL(base64Token, tokenName) {
    const secondPart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["base64Decode"])(base64Token.split('.')[1]);
    if (secondPart === null) {
        console.error(`FirebaseServerApp ${tokenName} is invalid: second part could not be parsed.`);
        return;
    }
    const expClaim = JSON.parse(secondPart).exp;
    if (expClaim === undefined) {
        console.error(`FirebaseServerApp ${tokenName} is invalid: expiration claim could not be parsed`);
        return;
    }
    const exp = JSON.parse(secondPart).exp * 1000;
    const now = new Date().getTime();
    const diff = exp - now;
    if (diff <= 0) {
        console.error(`FirebaseServerApp ${tokenName} is invalid: the token has expired.`);
    }
}
class FirebaseServerAppImpl extends FirebaseAppImpl {
    constructor(options, serverConfig, name, container){
        // Build configuration parameters for the FirebaseAppImpl base class.
        const automaticDataCollectionEnabled = serverConfig.automaticDataCollectionEnabled !== undefined ? serverConfig.automaticDataCollectionEnabled : false;
        // Create the FirebaseAppSettings object for the FirebaseAppImp constructor.
        const config = {
            name,
            automaticDataCollectionEnabled
        };
        if (options.apiKey !== undefined) {
            // Construct the parent FirebaseAppImp object.
            super(options, config, container);
        } else {
            const appImpl = options;
            super(appImpl.options, config, container);
        }
        // Now construct the data for the FirebaseServerAppImpl.
        this._serverConfig = Object.assign({
            automaticDataCollectionEnabled
        }, serverConfig);
        // Ensure that the current time is within the `authIdtoken` window of validity.
        if (this._serverConfig.authIdToken) {
            validateTokenTTL(this._serverConfig.authIdToken, 'authIdToken');
        }
        // Ensure that the current time is within the `appCheckToken` window of validity.
        if (this._serverConfig.appCheckToken) {
            validateTokenTTL(this._serverConfig.appCheckToken, 'appCheckToken');
        }
        this._finalizationRegistry = null;
        if (typeof FinalizationRegistry !== 'undefined') {
            this._finalizationRegistry = new FinalizationRegistry(()=>{
                this.automaticCleanup();
            });
        }
        this._refCount = 0;
        this.incRefCount(this._serverConfig.releaseOnDeref);
        // Do not retain a hard reference to the dref object, otherwise the FinalizationRegistry
        // will never trigger.
        this._serverConfig.releaseOnDeref = undefined;
        serverConfig.releaseOnDeref = undefined;
        registerVersion(name$q, version$1, 'serverapp');
    }
    toJSON() {
        return undefined;
    }
    get refCount() {
        return this._refCount;
    }
    // Increment the reference count of this server app. If an object is provided, register it
    // with the finalization registry.
    incRefCount(obj) {
        if (this.isDeleted) {
            return;
        }
        this._refCount++;
        if (obj !== undefined && this._finalizationRegistry !== null) {
            this._finalizationRegistry.register(obj, this);
        }
    }
    // Decrement the reference count.
    decRefCount() {
        if (this.isDeleted) {
            return 0;
        }
        return --this._refCount;
    }
    // Invoked by the FinalizationRegistry callback to note that this app should go through its
    // reference counts and delete itself if no reference count remain. The coordinating logic that
    // handles this is in deleteApp(...).
    automaticCleanup() {
        void deleteApp(this);
    }
    get settings() {
        this.checkDestroyed();
        return this._serverConfig;
    }
    /**
     * This function will throw an Error if the App has already been deleted -
     * use before performing API actions on the App.
     */ checkDestroyed() {
        if (this.isDeleted) {
            throw ERROR_FACTORY.create("server-app-deleted" /* AppError.SERVER_APP_DELETED */ );
        }
    }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * The current SDK version.
 *
 * @public
 */ const SDK_VERSION = version;
function initializeApp(_options, rawConfig = {}) {
    let options = _options;
    if (typeof rawConfig !== 'object') {
        const name = rawConfig;
        rawConfig = {
            name
        };
    }
    const config = Object.assign({
        name: DEFAULT_ENTRY_NAME,
        automaticDataCollectionEnabled: false
    }, rawConfig);
    const name = config.name;
    if (typeof name !== 'string' || !name) {
        throw ERROR_FACTORY.create("bad-app-name" /* AppError.BAD_APP_NAME */ , {
            appName: String(name)
        });
    }
    options || (options = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDefaultAppConfig"])());
    if (!options) {
        throw ERROR_FACTORY.create("no-options" /* AppError.NO_OPTIONS */ );
    }
    const existingApp = _apps.get(name);
    if (existingApp) {
        // return the existing app if options and config deep equal the ones in the existing app.
        if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deepEqual"])(options, existingApp.options) && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["deepEqual"])(config, existingApp.config)) {
            return existingApp;
        } else {
            throw ERROR_FACTORY.create("duplicate-app" /* AppError.DUPLICATE_APP */ , {
                appName: name
            });
        }
    }
    const container = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$component$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ComponentContainer"](name);
    for (const component of _components.values()){
        container.addComponent(component);
    }
    const newApp = new FirebaseAppImpl(options, config, container);
    _apps.set(name, newApp);
    return newApp;
}
function initializeServerApp(_options, _serverAppConfig) {
    if ((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isBrowser"])() && !(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isWebWorker"])()) {
        // FirebaseServerApp isn't designed to be run in browsers.
        throw ERROR_FACTORY.create("invalid-server-app-environment" /* AppError.INVALID_SERVER_APP_ENVIRONMENT */ );
    }
    if (_serverAppConfig.automaticDataCollectionEnabled === undefined) {
        _serverAppConfig.automaticDataCollectionEnabled = false;
    }
    let appOptions;
    if (_isFirebaseApp(_options)) {
        appOptions = _options.options;
    } else {
        appOptions = _options;
    }
    // Build an app name based on a hash of the configuration options.
    const nameObj = Object.assign(Object.assign({}, _serverAppConfig), appOptions);
    // However, Do not mangle the name based on releaseOnDeref, since it will vary between the
    // construction of FirebaseServerApp instances. For example, if the object is the request headers.
    if (nameObj.releaseOnDeref !== undefined) {
        delete nameObj.releaseOnDeref;
    }
    const hashCode = (s)=>{
        return [
            ...s
        ].reduce((hash, c)=>Math.imul(31, hash) + c.charCodeAt(0) | 0, 0);
    };
    if (_serverAppConfig.releaseOnDeref !== undefined) {
        if (typeof FinalizationRegistry === 'undefined') {
            throw ERROR_FACTORY.create("finalization-registry-not-supported" /* AppError.FINALIZATION_REGISTRY_NOT_SUPPORTED */ , {});
        }
    }
    const nameString = '' + hashCode(JSON.stringify(nameObj));
    const existingApp = _serverApps.get(nameString);
    if (existingApp) {
        existingApp.incRefCount(_serverAppConfig.releaseOnDeref);
        return existingApp;
    }
    const container = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$component$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ComponentContainer"](nameString);
    for (const component of _components.values()){
        container.addComponent(component);
    }
    const newApp = new FirebaseServerAppImpl(appOptions, _serverAppConfig, nameString, container);
    _serverApps.set(nameString, newApp);
    return newApp;
}
/**
 * Retrieves a {@link @firebase/app#FirebaseApp} instance.
 *
 * When called with no arguments, the default app is returned. When an app name
 * is provided, the app corresponding to that name is returned.
 *
 * An exception is thrown if the app being retrieved has not yet been
 * initialized.
 *
 * @example
 * ```javascript
 * // Return the default app
 * const app = getApp();
 * ```
 *
 * @example
 * ```javascript
 * // Return a named app
 * const otherApp = getApp("otherApp");
 * ```
 *
 * @param name - Optional name of the app to return. If no name is
 *   provided, the default is `"[DEFAULT]"`.
 *
 * @returns The app corresponding to the provided app name.
 *   If no app name is provided, the default app is returned.
 *
 * @public
 */ function getApp(name = DEFAULT_ENTRY_NAME) {
    const app = _apps.get(name);
    if (!app && name === DEFAULT_ENTRY_NAME && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDefaultAppConfig"])()) {
        return initializeApp();
    }
    if (!app) {
        throw ERROR_FACTORY.create("no-app" /* AppError.NO_APP */ , {
            appName: name
        });
    }
    return app;
}
/**
 * A (read-only) array of all initialized apps.
 * @public
 */ function getApps() {
    return Array.from(_apps.values());
}
/**
 * Renders this app unusable and frees the resources of all associated
 * services.
 *
 * @example
 * ```javascript
 * deleteApp(app)
 *   .then(function() {
 *     console.log("App deleted successfully");
 *   })
 *   .catch(function(error) {
 *     console.log("Error deleting app:", error);
 *   });
 * ```
 *
 * @public
 */ async function deleteApp(app) {
    let cleanupProviders = false;
    const name = app.name;
    if (_apps.has(name)) {
        cleanupProviders = true;
        _apps.delete(name);
    } else if (_serverApps.has(name)) {
        const firebaseServerApp = app;
        if (firebaseServerApp.decRefCount() <= 0) {
            _serverApps.delete(name);
            cleanupProviders = true;
        }
    }
    if (cleanupProviders) {
        await Promise.all(app.container.getProviders().map((provider)=>provider.delete()));
        app.isDeleted = true;
    }
}
/**
 * Registers a library's name and version for platform logging purposes.
 * @param library - Name of 1p or 3p library (e.g. firestore, angularfire)
 * @param version - Current version of that library.
 * @param variant - Bundle variant, e.g., node, rn, etc.
 *
 * @public
 */ function registerVersion(libraryKeyOrName, version, variant) {
    var _a;
    // TODO: We can use this check to whitelist strings when/if we set up
    // a good whitelist system.
    let library = (_a = PLATFORM_LOG_STRING[libraryKeyOrName]) !== null && _a !== void 0 ? _a : libraryKeyOrName;
    if (variant) {
        library += `-${variant}`;
    }
    const libraryMismatch = library.match(/\s|\//);
    const versionMismatch = version.match(/\s|\//);
    if (libraryMismatch || versionMismatch) {
        const warning = [
            `Unable to register library "${library}" with version "${version}":`
        ];
        if (libraryMismatch) {
            warning.push(`library name "${library}" contains illegal characters (whitespace or "/")`);
        }
        if (libraryMismatch && versionMismatch) {
            warning.push('and');
        }
        if (versionMismatch) {
            warning.push(`version name "${version}" contains illegal characters (whitespace or "/")`);
        }
        logger.warn(warning.join(' '));
        return;
    }
    _registerComponent(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$component$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Component"](`${library}-version`, ()=>({
            library,
            version
        }), "VERSION" /* ComponentType.VERSION */ ));
}
/**
 * Sets log handler for all Firebase SDKs.
 * @param logCallback - An optional custom log handler that executes user code whenever
 * the Firebase SDK makes a logging call.
 *
 * @public
 */ function onLog(logCallback, options) {
    if (logCallback !== null && typeof logCallback !== 'function') {
        throw ERROR_FACTORY.create("invalid-log-argument" /* AppError.INVALID_LOG_ARGUMENT */ );
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$logger$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setUserLogHandler"])(logCallback, options);
}
/**
 * Sets log level for all Firebase SDKs.
 *
 * All of the log types above the current log level are captured (i.e. if
 * you set the log level to `info`, errors are logged, but `debug` and
 * `verbose` logs are not).
 *
 * @public
 */ function setLogLevel(logLevel) {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$logger$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["setLogLevel"])(logLevel);
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const DB_NAME = 'firebase-heartbeat-database';
const DB_VERSION = 1;
const STORE_NAME = 'firebase-heartbeat-store';
let dbPromise = null;
function getDbPromise() {
    if (!dbPromise) {
        dbPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["openDB"])(DB_NAME, DB_VERSION, {
            upgrade: (db, oldVersion)=>{
                // We don't use 'break' in this switch statement, the fall-through
                // behavior is what we want, because if there are multiple versions between
                // the old version and the current version, we want ALL the migrations
                // that correspond to those versions to run, not only the last one.
                // eslint-disable-next-line default-case
                switch(oldVersion){
                    case 0:
                        try {
                            db.createObjectStore(STORE_NAME);
                        } catch (e) {
                            // Safari/iOS browsers throw occasional exceptions on
                            // db.createObjectStore() that may be a bug. Avoid blocking
                            // the rest of the app functionality.
                            console.warn(e);
                        }
                }
            }
        }).catch((e)=>{
            throw ERROR_FACTORY.create("idb-open" /* AppError.IDB_OPEN */ , {
                originalErrorMessage: e.message
            });
        });
    }
    return dbPromise;
}
async function readHeartbeatsFromIndexedDB(app) {
    try {
        const db = await getDbPromise();
        const tx = db.transaction(STORE_NAME);
        const result = await tx.objectStore(STORE_NAME).get(computeKey(app));
        // We already have the value but tx.done can throw,
        // so we need to await it here to catch errors
        await tx.done;
        return result;
    } catch (e) {
        if (e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseError"]) {
            logger.warn(e.message);
        } else {
            const idbGetError = ERROR_FACTORY.create("idb-get" /* AppError.IDB_GET */ , {
                originalErrorMessage: e === null || e === void 0 ? void 0 : e.message
            });
            logger.warn(idbGetError.message);
        }
    }
}
async function writeHeartbeatsToIndexedDB(app, heartbeatObject) {
    try {
        const db = await getDbPromise();
        const tx = db.transaction(STORE_NAME, 'readwrite');
        const objectStore = tx.objectStore(STORE_NAME);
        await objectStore.put(heartbeatObject, computeKey(app));
        await tx.done;
    } catch (e) {
        if (e instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseError"]) {
            logger.warn(e.message);
        } else {
            const idbGetError = ERROR_FACTORY.create("idb-set" /* AppError.IDB_WRITE */ , {
                originalErrorMessage: e === null || e === void 0 ? void 0 : e.message
            });
            logger.warn(idbGetError.message);
        }
    }
}
function computeKey(app) {
    return `${app.name}!${app.options.appId}`;
}
/**
 * @license
 * Copyright 2021 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const MAX_HEADER_BYTES = 1024;
const MAX_NUM_STORED_HEARTBEATS = 30;
class HeartbeatServiceImpl {
    constructor(container){
        this.container = container;
        /**
         * In-memory cache for heartbeats, used by getHeartbeatsHeader() to generate
         * the header string.
         * Stores one record per date. This will be consolidated into the standard
         * format of one record per user agent string before being sent as a header.
         * Populated from indexedDB when the controller is instantiated and should
         * be kept in sync with indexedDB.
         * Leave public for easier testing.
         */ this._heartbeatsCache = null;
        const app = this.container.getProvider('app').getImmediate();
        this._storage = new HeartbeatStorageImpl(app);
        this._heartbeatsCachePromise = this._storage.read().then((result)=>{
            this._heartbeatsCache = result;
            return result;
        });
    }
    /**
     * Called to report a heartbeat. The function will generate
     * a HeartbeatsByUserAgent object, update heartbeatsCache, and persist it
     * to IndexedDB.
     * Note that we only store one heartbeat per day. So if a heartbeat for today is
     * already logged, subsequent calls to this function in the same day will be ignored.
     */ async triggerHeartbeat() {
        var _a, _b;
        try {
            const platformLogger = this.container.getProvider('platform-logger').getImmediate();
            // This is the "Firebase user agent" string from the platform logger
            // service, not the browser user agent.
            const agent = platformLogger.getPlatformInfoString();
            const date = getUTCDateString();
            if (((_a = this._heartbeatsCache) === null || _a === void 0 ? void 0 : _a.heartbeats) == null) {
                this._heartbeatsCache = await this._heartbeatsCachePromise;
                // If we failed to construct a heartbeats cache, then return immediately.
                if (((_b = this._heartbeatsCache) === null || _b === void 0 ? void 0 : _b.heartbeats) == null) {
                    return;
                }
            }
            // Do not store a heartbeat if one is already stored for this day
            // or if a header has already been sent today.
            if (this._heartbeatsCache.lastSentHeartbeatDate === date || this._heartbeatsCache.heartbeats.some((singleDateHeartbeat)=>singleDateHeartbeat.date === date)) {
                return;
            } else {
                // There is no entry for this date. Create one.
                this._heartbeatsCache.heartbeats.push({
                    date,
                    agent
                });
                // If the number of stored heartbeats exceeds the maximum number of stored heartbeats, remove the heartbeat with the earliest date.
                // Since this is executed each time a heartbeat is pushed, the limit can only be exceeded by one, so only one needs to be removed.
                if (this._heartbeatsCache.heartbeats.length > MAX_NUM_STORED_HEARTBEATS) {
                    const earliestHeartbeatIdx = getEarliestHeartbeatIdx(this._heartbeatsCache.heartbeats);
                    this._heartbeatsCache.heartbeats.splice(earliestHeartbeatIdx, 1);
                }
            }
            return this._storage.overwrite(this._heartbeatsCache);
        } catch (e) {
            logger.warn(e);
        }
    }
    /**
     * Returns a base64 encoded string which can be attached to the heartbeat-specific header directly.
     * It also clears all heartbeats from memory as well as in IndexedDB.
     *
     * NOTE: Consuming product SDKs should not send the header if this method
     * returns an empty string.
     */ async getHeartbeatsHeader() {
        var _a;
        try {
            if (this._heartbeatsCache === null) {
                await this._heartbeatsCachePromise;
            }
            // If it's still null or the array is empty, there is no data to send.
            if (((_a = this._heartbeatsCache) === null || _a === void 0 ? void 0 : _a.heartbeats) == null || this._heartbeatsCache.heartbeats.length === 0) {
                return '';
            }
            const date = getUTCDateString();
            // Extract as many heartbeats from the cache as will fit under the size limit.
            const { heartbeatsToSend, unsentEntries } = extractHeartbeatsForHeader(this._heartbeatsCache.heartbeats);
            const headerString = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["base64urlEncodeWithoutPadding"])(JSON.stringify({
                version: 2,
                heartbeats: heartbeatsToSend
            }));
            // Store last sent date to prevent another being logged/sent for the same day.
            this._heartbeatsCache.lastSentHeartbeatDate = date;
            if (unsentEntries.length > 0) {
                // Store any unsent entries if they exist.
                this._heartbeatsCache.heartbeats = unsentEntries;
                // This seems more likely than emptying the array (below) to lead to some odd state
                // since the cache isn't empty and this will be called again on the next request,
                // and is probably safest if we await it.
                await this._storage.overwrite(this._heartbeatsCache);
            } else {
                this._heartbeatsCache.heartbeats = [];
                // Do not wait for this, to reduce latency.
                void this._storage.overwrite(this._heartbeatsCache);
            }
            return headerString;
        } catch (e) {
            logger.warn(e);
            return '';
        }
    }
}
function getUTCDateString() {
    const today = new Date();
    // Returns date format 'YYYY-MM-DD'
    return today.toISOString().substring(0, 10);
}
function extractHeartbeatsForHeader(heartbeatsCache, maxSize = MAX_HEADER_BYTES) {
    // Heartbeats grouped by user agent in the standard format to be sent in
    // the header.
    const heartbeatsToSend = [];
    // Single date format heartbeats that are not sent.
    let unsentEntries = heartbeatsCache.slice();
    for (const singleDateHeartbeat of heartbeatsCache){
        // Look for an existing entry with the same user agent.
        const heartbeatEntry = heartbeatsToSend.find((hb)=>hb.agent === singleDateHeartbeat.agent);
        if (!heartbeatEntry) {
            // If no entry for this user agent exists, create one.
            heartbeatsToSend.push({
                agent: singleDateHeartbeat.agent,
                dates: [
                    singleDateHeartbeat.date
                ]
            });
            if (countBytes(heartbeatsToSend) > maxSize) {
                // If the header would exceed max size, remove the added heartbeat
                // entry and stop adding to the header.
                heartbeatsToSend.pop();
                break;
            }
        } else {
            heartbeatEntry.dates.push(singleDateHeartbeat.date);
            // If the header would exceed max size, remove the added date
            // and stop adding to the header.
            if (countBytes(heartbeatsToSend) > maxSize) {
                heartbeatEntry.dates.pop();
                break;
            }
        }
        // Pop unsent entry from queue. (Skipped if adding the entry exceeded
        // quota and the loop breaks early.)
        unsentEntries = unsentEntries.slice(1);
    }
    return {
        heartbeatsToSend,
        unsentEntries
    };
}
class HeartbeatStorageImpl {
    constructor(app){
        this.app = app;
        this._canUseIndexedDBPromise = this.runIndexedDBEnvironmentCheck();
    }
    async runIndexedDBEnvironmentCheck() {
        if (!(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isIndexedDBAvailable"])()) {
            return false;
        } else {
            return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateIndexedDBOpenable"])().then(()=>true).catch(()=>false);
        }
    }
    /**
     * Read all heartbeats.
     */ async read() {
        const canUseIndexedDB = await this._canUseIndexedDBPromise;
        if (!canUseIndexedDB) {
            return {
                heartbeats: []
            };
        } else {
            const idbHeartbeatObject = await readHeartbeatsFromIndexedDB(this.app);
            if (idbHeartbeatObject === null || idbHeartbeatObject === void 0 ? void 0 : idbHeartbeatObject.heartbeats) {
                return idbHeartbeatObject;
            } else {
                return {
                    heartbeats: []
                };
            }
        }
    }
    // overwrite the storage with the provided heartbeats
    async overwrite(heartbeatsObject) {
        var _a;
        const canUseIndexedDB = await this._canUseIndexedDBPromise;
        if (!canUseIndexedDB) {
            return;
        } else {
            const existingHeartbeatsObject = await this.read();
            return writeHeartbeatsToIndexedDB(this.app, {
                lastSentHeartbeatDate: (_a = heartbeatsObject.lastSentHeartbeatDate) !== null && _a !== void 0 ? _a : existingHeartbeatsObject.lastSentHeartbeatDate,
                heartbeats: heartbeatsObject.heartbeats
            });
        }
    }
    // add heartbeats
    async add(heartbeatsObject) {
        var _a;
        const canUseIndexedDB = await this._canUseIndexedDBPromise;
        if (!canUseIndexedDB) {
            return;
        } else {
            const existingHeartbeatsObject = await this.read();
            return writeHeartbeatsToIndexedDB(this.app, {
                lastSentHeartbeatDate: (_a = heartbeatsObject.lastSentHeartbeatDate) !== null && _a !== void 0 ? _a : existingHeartbeatsObject.lastSentHeartbeatDate,
                heartbeats: [
                    ...existingHeartbeatsObject.heartbeats,
                    ...heartbeatsObject.heartbeats
                ]
            });
        }
    }
}
/**
 * Calculate bytes of a HeartbeatsByUserAgent array after being wrapped
 * in a platform logging header JSON object, stringified, and converted
 * to base 64.
 */ function countBytes(heartbeatsCache) {
    // base64 has a restricted set of characters, all of which should be 1 byte.
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["base64urlEncodeWithoutPadding"])(// heartbeatsCache wrapper properties
    JSON.stringify({
        version: 2,
        heartbeats: heartbeatsCache
    })).length;
}
/**
 * Returns the index of the heartbeat with the earliest date.
 * If the heartbeats array is empty, -1 is returned.
 */ function getEarliestHeartbeatIdx(heartbeats) {
    if (heartbeats.length === 0) {
        return -1;
    }
    let earliestHeartbeatIdx = 0;
    let earliestHeartbeatDate = heartbeats[0].date;
    for(let i = 1; i < heartbeats.length; i++){
        if (heartbeats[i].date < earliestHeartbeatDate) {
            earliestHeartbeatDate = heartbeats[i].date;
            earliestHeartbeatIdx = i;
        }
    }
    return earliestHeartbeatIdx;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function registerCoreComponents(variant) {
    _registerComponent(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$component$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Component"]('platform-logger', (container)=>new PlatformLoggerServiceImpl(container), "PRIVATE" /* ComponentType.PRIVATE */ ));
    _registerComponent(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$component$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Component"]('heartbeat', (container)=>new HeartbeatServiceImpl(container), "PRIVATE" /* ComponentType.PRIVATE */ ));
    // Register `app` package.
    registerVersion(name$q, version$1, variant);
    // BUILD_TARGET will be replaced by values like esm2017, cjs2017, etc during the compilation
    registerVersion(name$q, version$1, 'esm2017');
    // Register platform SDK identifier (no version).
    registerVersion('fire-js', '');
}
/**
 * Firebase App
 *
 * @remarks This package coordinates the communication between the different Firebase components
 * @packageDocumentation
 */ registerCoreComponents('');
;
 //# sourceMappingURL=index.esm2017.js.map
}}),
"[project]/node_modules/@firebase/app/dist/esm/index.esm2017.js [app-client] (ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$component$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/component/dist/esm/index.esm2017.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$logger$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/logger/dist/esm/index.esm2017.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/util/dist/index.esm2017.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/idb/build/index.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm2017.js [app-client] (ecmascript) <locals>");
}}),
"[project]/node_modules/tslib/tslib.es6.mjs [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */ /* global Reflect, Promise, SuppressedError, Symbol, Iterator */ __turbopack_context__.s({
    "__addDisposableResource": (()=>__addDisposableResource),
    "__assign": (()=>__assign),
    "__asyncDelegator": (()=>__asyncDelegator),
    "__asyncGenerator": (()=>__asyncGenerator),
    "__asyncValues": (()=>__asyncValues),
    "__await": (()=>__await),
    "__awaiter": (()=>__awaiter),
    "__classPrivateFieldGet": (()=>__classPrivateFieldGet),
    "__classPrivateFieldIn": (()=>__classPrivateFieldIn),
    "__classPrivateFieldSet": (()=>__classPrivateFieldSet),
    "__createBinding": (()=>__createBinding),
    "__decorate": (()=>__decorate),
    "__disposeResources": (()=>__disposeResources),
    "__esDecorate": (()=>__esDecorate),
    "__exportStar": (()=>__exportStar),
    "__extends": (()=>__extends),
    "__generator": (()=>__generator),
    "__importDefault": (()=>__importDefault),
    "__importStar": (()=>__importStar),
    "__makeTemplateObject": (()=>__makeTemplateObject),
    "__metadata": (()=>__metadata),
    "__param": (()=>__param),
    "__propKey": (()=>__propKey),
    "__read": (()=>__read),
    "__rest": (()=>__rest),
    "__rewriteRelativeImportExtension": (()=>__rewriteRelativeImportExtension),
    "__runInitializers": (()=>__runInitializers),
    "__setFunctionName": (()=>__setFunctionName),
    "__spread": (()=>__spread),
    "__spreadArray": (()=>__spreadArray),
    "__spreadArrays": (()=>__spreadArrays),
    "__values": (()=>__values),
    "default": (()=>__TURBOPACK__default__export__)
});
var extendStatics = function(d, b) {
    extendStatics = Object.setPrototypeOf || ({
        __proto__: []
    }) instanceof Array && function(d, b) {
        d.__proto__ = b;
    } || function(d, b) {
        for(var p in b)if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p];
    };
    return extendStatics(d, b);
};
function __extends(d, b) {
    if (typeof b !== "function" && b !== null) throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
    extendStatics(d, b);
    function __() {
        this.constructor = d;
    }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}
var __assign = function() {
    __assign = Object.assign || function __assign(t) {
        for(var s, i = 1, n = arguments.length; i < n; i++){
            s = arguments[i];
            for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
function __rest(s, e) {
    var t = {};
    for(var p in s)if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for(var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++){
        if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i])) t[p[i]] = s[p[i]];
    }
    return t;
}
function __decorate(decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for(var i = decorators.length - 1; i >= 0; i--)if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
}
function __param(paramIndex, decorator) {
    return function(target, key) {
        decorator(target, key, paramIndex);
    };
}
function __esDecorate(ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) {
        if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected");
        return f;
    }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for(var i = decorators.length - 1; i >= 0; i--){
        var context = {};
        for(var p in contextIn)context[p] = p === "access" ? {} : contextIn[p];
        for(var p in contextIn.access)context.access[p] = contextIn.access[p];
        context.addInitializer = function(f) {
            if (done) throw new TypeError("Cannot add initializers after decoration has completed");
            extraInitializers.push(accept(f || null));
        };
        var result = (0, decorators[i])(kind === "accessor" ? {
            get: descriptor.get,
            set: descriptor.set
        } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        } else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
}
;
function __runInitializers(thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for(var i = 0; i < initializers.length; i++){
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
}
;
function __propKey(x) {
    return typeof x === "symbol" ? x : "".concat(x);
}
;
function __setFunctionName(f, name, prefix) {
    if (typeof name === "symbol") name = name.description ? "[".concat(name.description, "]") : "";
    return Object.defineProperty(f, "name", {
        configurable: true,
        value: prefix ? "".concat(prefix, " ", name) : name
    });
}
;
function __metadata(metadataKey, metadataValue) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(metadataKey, metadataValue);
}
function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) {
        return value instanceof P ? value : new P(function(resolve) {
            resolve(value);
        });
    }
    return new (P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) {
            try {
                step(generator.next(value));
            } catch (e) {
                reject(e);
            }
        }
        function rejected(value) {
            try {
                step(generator["throw"](value));
            } catch (e) {
                reject(e);
            }
        }
        function step(result) {
            result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
        }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}
function __generator(thisArg, body) {
    var _ = {
        label: 0,
        sent: function() {
            if (t[0] & 1) throw t[1];
            return t[1];
        },
        trys: [],
        ops: []
    }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() {
        return this;
    }), g;
    "TURBOPACK unreachable";
    function verb(n) {
        return function(v) {
            return step([
                n,
                v
            ]);
        };
    }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while(g && (g = 0, op[0] && (_ = 0)), _)try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [
                op[0] & 2,
                t.value
            ];
            switch(op[0]){
                case 0:
                case 1:
                    t = op;
                    break;
                case 4:
                    _.label++;
                    return {
                        value: op[1],
                        done: false
                    };
                case 5:
                    _.label++;
                    y = op[1];
                    op = [
                        0
                    ];
                    continue;
                case 7:
                    op = _.ops.pop();
                    _.trys.pop();
                    continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) {
                        _ = 0;
                        continue;
                    }
                    if (op[0] === 3 && (!t || op[1] > t[0] && op[1] < t[3])) {
                        _.label = op[1];
                        break;
                    }
                    if (op[0] === 6 && _.label < t[1]) {
                        _.label = t[1];
                        t = op;
                        break;
                    }
                    if (t && _.label < t[2]) {
                        _.label = t[2];
                        _.ops.push(op);
                        break;
                    }
                    if (t[2]) _.ops.pop();
                    _.trys.pop();
                    continue;
            }
            op = body.call(thisArg, _);
        } catch (e) {
            op = [
                6,
                e
            ];
            y = 0;
        } finally{
            f = t = 0;
        }
        if (op[0] & 5) throw op[1];
        return {
            value: op[0] ? op[1] : void 0,
            done: true
        };
    }
}
var __createBinding = Object.create ? function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = {
            enumerable: true,
            get: function() {
                return m[k];
            }
        };
    }
    Object.defineProperty(o, k2, desc);
} : function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
};
function __exportStar(m, o) {
    for(var p in m)if (p !== "default" && !Object.prototype.hasOwnProperty.call(o, p)) __createBinding(o, m, p);
}
function __values(o) {
    var s = typeof Symbol === "function" && Symbol.iterator, m = s && o[s], i = 0;
    if (m) return m.call(o);
    if (o && typeof o.length === "number") return {
        next: function() {
            if (o && i >= o.length) o = void 0;
            return {
                value: o && o[i++],
                done: !o
            };
        }
    };
    throw new TypeError(s ? "Object is not iterable." : "Symbol.iterator is not defined.");
}
function __read(o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while((n === void 0 || n-- > 0) && !(r = i.next()).done)ar.push(r.value);
    } catch (error) {
        e = {
            error: error
        };
    } finally{
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        } finally{
            if (e) throw e.error;
        }
    }
    return ar;
}
function __spread() {
    for(var ar = [], i = 0; i < arguments.length; i++)ar = ar.concat(__read(arguments[i]));
    return ar;
}
function __spreadArrays() {
    for(var s = 0, i = 0, il = arguments.length; i < il; i++)s += arguments[i].length;
    for(var r = Array(s), k = 0, i = 0; i < il; i++)for(var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)r[k] = a[j];
    return r;
}
function __spreadArray(to, from, pack) {
    if (pack || arguments.length === 2) for(var i = 0, l = from.length, ar; i < l; i++){
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
}
function __await(v) {
    return this instanceof __await ? (this.v = v, this) : new __await(v);
}
function __asyncGenerator(thisArg, _arguments, generator) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var g = generator.apply(thisArg, _arguments || []), i, q = [];
    return i = Object.create((typeof AsyncIterator === "function" ? AsyncIterator : Object).prototype), verb("next"), verb("throw"), verb("return", awaitReturn), i[Symbol.asyncIterator] = function() {
        return this;
    }, i;
    "TURBOPACK unreachable";
    function awaitReturn(f) {
        return function(v) {
            return Promise.resolve(v).then(f, reject);
        };
    }
    function verb(n, f) {
        if (g[n]) {
            i[n] = function(v) {
                return new Promise(function(a, b) {
                    q.push([
                        n,
                        v,
                        a,
                        b
                    ]) > 1 || resume(n, v);
                });
            };
            if (f) i[n] = f(i[n]);
        }
    }
    function resume(n, v) {
        try {
            step(g[n](v));
        } catch (e) {
            settle(q[0][3], e);
        }
    }
    function step(r) {
        r.value instanceof __await ? Promise.resolve(r.value.v).then(fulfill, reject) : settle(q[0][2], r);
    }
    function fulfill(value) {
        resume("next", value);
    }
    function reject(value) {
        resume("throw", value);
    }
    function settle(f, v) {
        if (f(v), q.shift(), q.length) resume(q[0][0], q[0][1]);
    }
}
function __asyncDelegator(o) {
    var i, p;
    return i = {}, verb("next"), verb("throw", function(e) {
        throw e;
    }), verb("return"), i[Symbol.iterator] = function() {
        return this;
    }, i;
    "TURBOPACK unreachable";
    function verb(n, f) {
        i[n] = o[n] ? function(v) {
            return (p = !p) ? {
                value: __await(o[n](v)),
                done: false
            } : f ? f(v) : v;
        } : f;
    }
}
function __asyncValues(o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function() {
        return this;
    }, i);
    "TURBOPACK unreachable";
    function verb(n) {
        i[n] = o[n] && function(v) {
            return new Promise(function(resolve, reject) {
                v = o[n](v), settle(resolve, reject, v.done, v.value);
            });
        };
    }
    function settle(resolve, reject, d, v) {
        Promise.resolve(v).then(function(v) {
            resolve({
                value: v,
                done: d
            });
        }, reject);
    }
}
function __makeTemplateObject(cooked, raw) {
    if (Object.defineProperty) {
        Object.defineProperty(cooked, "raw", {
            value: raw
        });
    } else {
        cooked.raw = raw;
    }
    return cooked;
}
;
var __setModuleDefault = Object.create ? function(o, v) {
    Object.defineProperty(o, "default", {
        enumerable: true,
        value: v
    });
} : function(o, v) {
    o["default"] = v;
};
var ownKeys = function(o) {
    ownKeys = Object.getOwnPropertyNames || function(o) {
        var ar = [];
        for(var k in o)if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
        return ar;
    };
    return ownKeys(o);
};
function __importStar(mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) {
        for(var k = ownKeys(mod), i = 0; i < k.length; i++)if (k[i] !== "default") __createBinding(result, mod, k[i]);
    }
    __setModuleDefault(result, mod);
    return result;
}
function __importDefault(mod) {
    return mod && mod.__esModule ? mod : {
        default: mod
    };
}
function __classPrivateFieldGet(receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
}
function __classPrivateFieldSet(receiver, state, value, kind, f) {
    if (kind === "m") throw new TypeError("Private method is not writable");
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
    return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), value;
}
function __classPrivateFieldIn(state, receiver) {
    if (receiver === null || typeof receiver !== "object" && typeof receiver !== "function") throw new TypeError("Cannot use 'in' operator on non-object");
    return typeof state === "function" ? receiver === state : state.has(receiver);
}
function __addDisposableResource(env, value, async) {
    if (value !== null && value !== void 0) {
        if (typeof value !== "object" && typeof value !== "function") throw new TypeError("Object expected.");
        var dispose, inner;
        if (async) {
            if (!Symbol.asyncDispose) throw new TypeError("Symbol.asyncDispose is not defined.");
            dispose = value[Symbol.asyncDispose];
        }
        if (dispose === void 0) {
            if (!Symbol.dispose) throw new TypeError("Symbol.dispose is not defined.");
            dispose = value[Symbol.dispose];
            if (async) inner = dispose;
        }
        if (typeof dispose !== "function") throw new TypeError("Object not disposable.");
        if (inner) dispose = function() {
            try {
                inner.call(this);
            } catch (e) {
                return Promise.reject(e);
            }
        };
        env.stack.push({
            value: value,
            dispose: dispose,
            async: async
        });
    } else if (async) {
        env.stack.push({
            async: true
        });
    }
    return value;
}
var _SuppressedError = typeof SuppressedError === "function" ? SuppressedError : function(error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};
function __disposeResources(env) {
    function fail(e) {
        env.error = env.hasError ? new _SuppressedError(e, env.error, "An error was suppressed during disposal.") : e;
        env.hasError = true;
    }
    var r, s = 0;
    function next() {
        while(r = env.stack.pop()){
            try {
                if (!r.async && s === 1) return s = 0, env.stack.push(r), Promise.resolve().then(next);
                if (r.dispose) {
                    var result = r.dispose.call(r.value);
                    if (r.async) return s |= 2, Promise.resolve(result).then(next, function(e) {
                        fail(e);
                        return next();
                    });
                } else s |= 1;
            } catch (e) {
                fail(e);
            }
        }
        if (s === 1) return env.hasError ? Promise.reject(env.error) : Promise.resolve();
        if (env.hasError) throw env.error;
    }
    return next();
}
function __rewriteRelativeImportExtension(path, preserveJsx) {
    if (typeof path === "string" && /^\.\.?\//.test(path)) {
        return path.replace(/\.(tsx)$|((?:\.d)?)((?:\.[^./]+?)?)\.([cm]?)ts$/i, function(m, tsx, d, ext, cm) {
            return tsx ? preserveJsx ? ".jsx" : ".js" : d && (!ext || !cm) ? m : d + ext + "." + cm.toLowerCase() + "js";
        });
    }
    return path;
}
const __TURBOPACK__default__export__ = {
    __extends,
    __assign,
    __rest,
    __decorate,
    __param,
    __esDecorate,
    __runInitializers,
    __propKey,
    __setFunctionName,
    __metadata,
    __awaiter,
    __generator,
    __createBinding,
    __exportStar,
    __values,
    __read,
    __spread,
    __spreadArrays,
    __spreadArray,
    __await,
    __asyncGenerator,
    __asyncDelegator,
    __asyncValues,
    __makeTemplateObject,
    __importStar,
    __importDefault,
    __classPrivateFieldGet,
    __classPrivateFieldSet,
    __classPrivateFieldIn,
    __addDisposableResource,
    __disposeResources,
    __rewriteRelativeImportExtension
};
}}),
"[project]/apps/web/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm2017/index.js [app-client] (ecmascript) <module evaluation>"); //# sourceMappingURL=index.esm.js.map
;
}}),
"[project]/apps/web/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$auth$2f$dist$2f$esm2017$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/auth/dist/esm2017/index.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$firebase$2f$auth$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/firebase/auth/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
}}),
"[project]/apps/web/node_modules/firebase/app/dist/esm/index.esm.js [app-client] (ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm2017.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm2017.js [app-client] (ecmascript) <locals>");
;
;
var name = "firebase";
var version = "11.9.1";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["registerVersion"])(name, version, 'app'); //# sourceMappingURL=index.esm.js.map
}}),
"[project]/apps/web/node_modules/firebase/app/dist/esm/index.esm.js [app-client] (ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm2017.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/firebase/app/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
}}),
"[project]/apps/web/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.esm2017.js [app-client] (ecmascript)"); //# sourceMappingURL=index.esm.js.map
;
}}),
"[project]/apps/web/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$firestore$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/firestore/dist/index.esm2017.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$firebase$2f$firestore$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/firebase/firestore/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
}}),
"[project]/apps/web/node_modules/firebase/storage/dist/esm/index.esm.js [app-client] (ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$storage$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/storage/dist/index.esm2017.js [app-client] (ecmascript)"); //# sourceMappingURL=index.esm.js.map
;
}}),
"[project]/apps/web/node_modules/firebase/storage/dist/esm/index.esm.js [app-client] (ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$storage$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/storage/dist/index.esm2017.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$firebase$2f$storage$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/firebase/storage/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
}}),
"[project]/apps/web/node_modules/firebase/messaging/dist/esm/index.esm.js [app-client] (ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$messaging$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/messaging/dist/esm/index.esm2017.js [app-client] (ecmascript)"); //# sourceMappingURL=index.esm.js.map
;
}}),
"[project]/apps/web/node_modules/firebase/messaging/dist/esm/index.esm.js [app-client] (ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$messaging$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/messaging/dist/esm/index.esm2017.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$firebase$2f$messaging$2f$dist$2f$esm$2f$index$2e$esm$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/firebase/messaging/dist/esm/index.esm.js [app-client] (ecmascript) <locals>");
}}),
"[project]/node_modules/@firebase/webchannel-wrapper/dist/bloom-blob/esm/bloom_blob_es2018.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "Integer": (()=>Integer),
    "Md5": (()=>Md5),
    "default": (()=>bloom_blob_es2018)
});
var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};
var bloom_blob_es2018 = {};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/ var Integer;
var Md5;
(function() {
    var h; /** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/ 
    function k(f, a) {
        function c() {}
        c.prototype = a.prototype;
        f.D = a.prototype;
        f.prototype = new c;
        f.prototype.constructor = f;
        f.C = function(d, e, g) {
            for(var b = Array(arguments.length - 2), r = 2; r < arguments.length; r++)b[r - 2] = arguments[r];
            return a.prototype[e].apply(d, b);
        };
    }
    function l() {
        this.blockSize = -1;
    }
    function m() {
        this.blockSize = -1;
        this.blockSize = 64;
        this.g = Array(4);
        this.B = Array(this.blockSize);
        this.o = this.h = 0;
        this.s();
    }
    k(m, l);
    m.prototype.s = function() {
        this.g[0] = 1732584193;
        this.g[1] = 4023233417;
        this.g[2] = 2562383102;
        this.g[3] = 271733878;
        this.o = this.h = 0;
    };
    function n(f, a, c) {
        c || (c = 0);
        var d = Array(16);
        if ("string" === typeof a) for(var e = 0; 16 > e; ++e)d[e] = a.charCodeAt(c++) | a.charCodeAt(c++) << 8 | a.charCodeAt(c++) << 16 | a.charCodeAt(c++) << 24;
        else for(e = 0; 16 > e; ++e)d[e] = a[c++] | a[c++] << 8 | a[c++] << 16 | a[c++] << 24;
        a = f.g[0];
        c = f.g[1];
        e = f.g[2];
        var g = f.g[3];
        var b = a + (g ^ c & (e ^ g)) + d[0] + 3614090360 & 4294967295;
        a = c + (b << 7 & 4294967295 | b >>> 25);
        b = g + (e ^ a & (c ^ e)) + d[1] + 3905402710 & 4294967295;
        g = a + (b << 12 & 4294967295 | b >>> 20);
        b = e + (c ^ g & (a ^ c)) + d[2] + 606105819 & 4294967295;
        e = g + (b << 17 & 4294967295 | b >>> 15);
        b = c + (a ^ e & (g ^ a)) + d[3] + 3250441966 & 4294967295;
        c = e + (b << 22 & 4294967295 | b >>> 10);
        b = a + (g ^ c & (e ^ g)) + d[4] + 4118548399 & 4294967295;
        a = c + (b << 7 & 4294967295 | b >>> 25);
        b = g + (e ^ a & (c ^ e)) + d[5] + 1200080426 & 4294967295;
        g = a + (b << 12 & 4294967295 | b >>> 20);
        b = e + (c ^ g & (a ^ c)) + d[6] + 2821735955 & 4294967295;
        e = g + (b << 17 & 4294967295 | b >>> 15);
        b = c + (a ^ e & (g ^ a)) + d[7] + 4249261313 & 4294967295;
        c = e + (b << 22 & 4294967295 | b >>> 10);
        b = a + (g ^ c & (e ^ g)) + d[8] + 1770035416 & 4294967295;
        a = c + (b << 7 & 4294967295 | b >>> 25);
        b = g + (e ^ a & (c ^ e)) + d[9] + 2336552879 & 4294967295;
        g = a + (b << 12 & 4294967295 | b >>> 20);
        b = e + (c ^ g & (a ^ c)) + d[10] + 4294925233 & 4294967295;
        e = g + (b << 17 & 4294967295 | b >>> 15);
        b = c + (a ^ e & (g ^ a)) + d[11] + 2304563134 & 4294967295;
        c = e + (b << 22 & 4294967295 | b >>> 10);
        b = a + (g ^ c & (e ^ g)) + d[12] + 1804603682 & 4294967295;
        a = c + (b << 7 & 4294967295 | b >>> 25);
        b = g + (e ^ a & (c ^ e)) + d[13] + 4254626195 & 4294967295;
        g = a + (b << 12 & 4294967295 | b >>> 20);
        b = e + (c ^ g & (a ^ c)) + d[14] + 2792965006 & 4294967295;
        e = g + (b << 17 & 4294967295 | b >>> 15);
        b = c + (a ^ e & (g ^ a)) + d[15] + 1236535329 & 4294967295;
        c = e + (b << 22 & 4294967295 | b >>> 10);
        b = a + (e ^ g & (c ^ e)) + d[1] + 4129170786 & 4294967295;
        a = c + (b << 5 & 4294967295 | b >>> 27);
        b = g + (c ^ e & (a ^ c)) + d[6] + 3225465664 & 4294967295;
        g = a + (b << 9 & 4294967295 | b >>> 23);
        b = e + (a ^ c & (g ^ a)) + d[11] + 643717713 & 4294967295;
        e = g + (b << 14 & 4294967295 | b >>> 18);
        b = c + (g ^ a & (e ^ g)) + d[0] + 3921069994 & 4294967295;
        c = e + (b << 20 & 4294967295 | b >>> 12);
        b = a + (e ^ g & (c ^ e)) + d[5] + 3593408605 & 4294967295;
        a = c + (b << 5 & 4294967295 | b >>> 27);
        b = g + (c ^ e & (a ^ c)) + d[10] + 38016083 & 4294967295;
        g = a + (b << 9 & 4294967295 | b >>> 23);
        b = e + (a ^ c & (g ^ a)) + d[15] + 3634488961 & 4294967295;
        e = g + (b << 14 & 4294967295 | b >>> 18);
        b = c + (g ^ a & (e ^ g)) + d[4] + 3889429448 & 4294967295;
        c = e + (b << 20 & 4294967295 | b >>> 12);
        b = a + (e ^ g & (c ^ e)) + d[9] + 568446438 & 4294967295;
        a = c + (b << 5 & 4294967295 | b >>> 27);
        b = g + (c ^ e & (a ^ c)) + d[14] + 3275163606 & 4294967295;
        g = a + (b << 9 & 4294967295 | b >>> 23);
        b = e + (a ^ c & (g ^ a)) + d[3] + 4107603335 & 4294967295;
        e = g + (b << 14 & 4294967295 | b >>> 18);
        b = c + (g ^ a & (e ^ g)) + d[8] + 1163531501 & 4294967295;
        c = e + (b << 20 & 4294967295 | b >>> 12);
        b = a + (e ^ g & (c ^ e)) + d[13] + 2850285829 & 4294967295;
        a = c + (b << 5 & 4294967295 | b >>> 27);
        b = g + (c ^ e & (a ^ c)) + d[2] + 4243563512 & 4294967295;
        g = a + (b << 9 & 4294967295 | b >>> 23);
        b = e + (a ^ c & (g ^ a)) + d[7] + 1735328473 & 4294967295;
        e = g + (b << 14 & 4294967295 | b >>> 18);
        b = c + (g ^ a & (e ^ g)) + d[12] + 2368359562 & 4294967295;
        c = e + (b << 20 & 4294967295 | b >>> 12);
        b = a + (c ^ e ^ g) + d[5] + 4294588738 & 4294967295;
        a = c + (b << 4 & 4294967295 | b >>> 28);
        b = g + (a ^ c ^ e) + d[8] + 2272392833 & 4294967295;
        g = a + (b << 11 & 4294967295 | b >>> 21);
        b = e + (g ^ a ^ c) + d[11] + 1839030562 & 4294967295;
        e = g + (b << 16 & 4294967295 | b >>> 16);
        b = c + (e ^ g ^ a) + d[14] + 4259657740 & 4294967295;
        c = e + (b << 23 & 4294967295 | b >>> 9);
        b = a + (c ^ e ^ g) + d[1] + 2763975236 & 4294967295;
        a = c + (b << 4 & 4294967295 | b >>> 28);
        b = g + (a ^ c ^ e) + d[4] + 1272893353 & 4294967295;
        g = a + (b << 11 & 4294967295 | b >>> 21);
        b = e + (g ^ a ^ c) + d[7] + 4139469664 & 4294967295;
        e = g + (b << 16 & 4294967295 | b >>> 16);
        b = c + (e ^ g ^ a) + d[10] + 3200236656 & 4294967295;
        c = e + (b << 23 & 4294967295 | b >>> 9);
        b = a + (c ^ e ^ g) + d[13] + 681279174 & 4294967295;
        a = c + (b << 4 & 4294967295 | b >>> 28);
        b = g + (a ^ c ^ e) + d[0] + 3936430074 & 4294967295;
        g = a + (b << 11 & 4294967295 | b >>> 21);
        b = e + (g ^ a ^ c) + d[3] + 3572445317 & 4294967295;
        e = g + (b << 16 & 4294967295 | b >>> 16);
        b = c + (e ^ g ^ a) + d[6] + 76029189 & 4294967295;
        c = e + (b << 23 & 4294967295 | b >>> 9);
        b = a + (c ^ e ^ g) + d[9] + 3654602809 & 4294967295;
        a = c + (b << 4 & 4294967295 | b >>> 28);
        b = g + (a ^ c ^ e) + d[12] + 3873151461 & 4294967295;
        g = a + (b << 11 & 4294967295 | b >>> 21);
        b = e + (g ^ a ^ c) + d[15] + 530742520 & 4294967295;
        e = g + (b << 16 & 4294967295 | b >>> 16);
        b = c + (e ^ g ^ a) + d[2] + 3299628645 & 4294967295;
        c = e + (b << 23 & 4294967295 | b >>> 9);
        b = a + (e ^ (c | ~g)) + d[0] + 4096336452 & 4294967295;
        a = c + (b << 6 & 4294967295 | b >>> 26);
        b = g + (c ^ (a | ~e)) + d[7] + 1126891415 & 4294967295;
        g = a + (b << 10 & 4294967295 | b >>> 22);
        b = e + (a ^ (g | ~c)) + d[14] + 2878612391 & 4294967295;
        e = g + (b << 15 & 4294967295 | b >>> 17);
        b = c + (g ^ (e | ~a)) + d[5] + 4237533241 & 4294967295;
        c = e + (b << 21 & 4294967295 | b >>> 11);
        b = a + (e ^ (c | ~g)) + d[12] + 1700485571 & 4294967295;
        a = c + (b << 6 & 4294967295 | b >>> 26);
        b = g + (c ^ (a | ~e)) + d[3] + 2399980690 & 4294967295;
        g = a + (b << 10 & 4294967295 | b >>> 22);
        b = e + (a ^ (g | ~c)) + d[10] + 4293915773 & 4294967295;
        e = g + (b << 15 & 4294967295 | b >>> 17);
        b = c + (g ^ (e | ~a)) + d[1] + 2240044497 & 4294967295;
        c = e + (b << 21 & 4294967295 | b >>> 11);
        b = a + (e ^ (c | ~g)) + d[8] + 1873313359 & 4294967295;
        a = c + (b << 6 & 4294967295 | b >>> 26);
        b = g + (c ^ (a | ~e)) + d[15] + 4264355552 & 4294967295;
        g = a + (b << 10 & 4294967295 | b >>> 22);
        b = e + (a ^ (g | ~c)) + d[6] + 2734768916 & 4294967295;
        e = g + (b << 15 & 4294967295 | b >>> 17);
        b = c + (g ^ (e | ~a)) + d[13] + 1309151649 & 4294967295;
        c = e + (b << 21 & 4294967295 | b >>> 11);
        b = a + (e ^ (c | ~g)) + d[4] + 4149444226 & 4294967295;
        a = c + (b << 6 & 4294967295 | b >>> 26);
        b = g + (c ^ (a | ~e)) + d[11] + 3174756917 & 4294967295;
        g = a + (b << 10 & 4294967295 | b >>> 22);
        b = e + (a ^ (g | ~c)) + d[2] + 718787259 & 4294967295;
        e = g + (b << 15 & 4294967295 | b >>> 17);
        b = c + (g ^ (e | ~a)) + d[9] + 3951481745 & 4294967295;
        f.g[0] = f.g[0] + a & 4294967295;
        f.g[1] = f.g[1] + (e + (b << 21 & 4294967295 | b >>> 11)) & 4294967295;
        f.g[2] = f.g[2] + e & 4294967295;
        f.g[3] = f.g[3] + g & 4294967295;
    }
    m.prototype.u = function(f, a) {
        void 0 === a && (a = f.length);
        for(var c = a - this.blockSize, d = this.B, e = this.h, g = 0; g < a;){
            if (0 == e) for(; g <= c;)n(this, f, g), g += this.blockSize;
            if ("string" === typeof f) for(; g < a;){
                if (d[e++] = f.charCodeAt(g++), e == this.blockSize) {
                    n(this, d);
                    e = 0;
                    break;
                }
            }
            else for(; g < a;)if (d[e++] = f[g++], e == this.blockSize) {
                n(this, d);
                e = 0;
                break;
            }
        }
        this.h = e;
        this.o += a;
    };
    m.prototype.v = function() {
        var f = Array((56 > this.h ? this.blockSize : 2 * this.blockSize) - this.h);
        f[0] = 128;
        for(var a = 1; a < f.length - 8; ++a)f[a] = 0;
        var c = 8 * this.o;
        for(a = f.length - 8; a < f.length; ++a)f[a] = c & 255, c /= 256;
        this.u(f);
        f = Array(16);
        for(a = c = 0; 4 > a; ++a)for(var d = 0; 32 > d; d += 8)f[c++] = this.g[a] >>> d & 255;
        return f;
    };
    function p(f, a) {
        var c = q;
        return Object.prototype.hasOwnProperty.call(c, f) ? c[f] : c[f] = a(f);
    }
    function t(f, a) {
        this.h = a;
        for(var c = [], d = !0, e = f.length - 1; 0 <= e; e--){
            var g = f[e] | 0;
            d && g == a || (c[e] = g, d = !1);
        }
        this.g = c;
    }
    var q = {};
    function u(f) {
        return -128 <= f && 128 > f ? p(f, function(a) {
            return new t([
                a | 0
            ], 0 > a ? -1 : 0);
        }) : new t([
            f | 0
        ], 0 > f ? -1 : 0);
    }
    function v(f) {
        if (isNaN(f) || !isFinite(f)) return w;
        if (0 > f) return x(v(-f));
        for(var a = [], c = 1, d = 0; f >= c; d++)a[d] = f / c | 0, c *= 4294967296;
        return new t(a, 0);
    }
    function y(f, a) {
        if (0 == f.length) throw Error("number format error: empty string");
        a = a || 10;
        if (2 > a || 36 < a) throw Error("radix out of range: " + a);
        if ("-" == f.charAt(0)) return x(y(f.substring(1), a));
        if (0 <= f.indexOf("-")) throw Error('number format error: interior "-" character');
        for(var c = v(Math.pow(a, 8)), d = w, e = 0; e < f.length; e += 8){
            var g = Math.min(8, f.length - e), b = parseInt(f.substring(e, e + g), a);
            8 > g ? (g = v(Math.pow(a, g)), d = d.j(g).add(v(b))) : (d = d.j(c), d = d.add(v(b)));
        }
        return d;
    }
    var w = u(0), z = u(1), A = u(16777216);
    h = t.prototype;
    h.m = function() {
        if (B(this)) return -x(this).m();
        for(var f = 0, a = 1, c = 0; c < this.g.length; c++){
            var d = this.i(c);
            f += (0 <= d ? d : 4294967296 + d) * a;
            a *= 4294967296;
        }
        return f;
    };
    h.toString = function(f) {
        f = f || 10;
        if (2 > f || 36 < f) throw Error("radix out of range: " + f);
        if (C(this)) return "0";
        if (B(this)) return "-" + x(this).toString(f);
        for(var a = v(Math.pow(f, 6)), c = this, d = "";;){
            var e = D(c, a).g;
            c = F(c, e.j(a));
            var g = ((0 < c.g.length ? c.g[0] : c.h) >>> 0).toString(f);
            c = e;
            if (C(c)) return g + d;
            for(; 6 > g.length;)g = "0" + g;
            d = g + d;
        }
    };
    h.i = function(f) {
        return 0 > f ? 0 : f < this.g.length ? this.g[f] : this.h;
    };
    function C(f) {
        if (0 != f.h) return !1;
        for(var a = 0; a < f.g.length; a++)if (0 != f.g[a]) return !1;
        return !0;
    }
    function B(f) {
        return -1 == f.h;
    }
    h.l = function(f) {
        f = F(this, f);
        return B(f) ? -1 : C(f) ? 0 : 1;
    };
    function x(f) {
        for(var a = f.g.length, c = [], d = 0; d < a; d++)c[d] = ~f.g[d];
        return new t(c, ~f.h).add(z);
    }
    h.abs = function() {
        return B(this) ? x(this) : this;
    };
    h.add = function(f) {
        for(var a = Math.max(this.g.length, f.g.length), c = [], d = 0, e = 0; e <= a; e++){
            var g = d + (this.i(e) & 65535) + (f.i(e) & 65535), b = (g >>> 16) + (this.i(e) >>> 16) + (f.i(e) >>> 16);
            d = b >>> 16;
            g &= 65535;
            b &= 65535;
            c[e] = b << 16 | g;
        }
        return new t(c, c[c.length - 1] & -2147483648 ? -1 : 0);
    };
    function F(f, a) {
        return f.add(x(a));
    }
    h.j = function(f) {
        if (C(this) || C(f)) return w;
        if (B(this)) return B(f) ? x(this).j(x(f)) : x(x(this).j(f));
        if (B(f)) return x(this.j(x(f)));
        if (0 > this.l(A) && 0 > f.l(A)) return v(this.m() * f.m());
        for(var a = this.g.length + f.g.length, c = [], d = 0; d < 2 * a; d++)c[d] = 0;
        for(d = 0; d < this.g.length; d++)for(var e = 0; e < f.g.length; e++){
            var g = this.i(d) >>> 16, b = this.i(d) & 65535, r = f.i(e) >>> 16, E = f.i(e) & 65535;
            c[2 * d + 2 * e] += b * E;
            G(c, 2 * d + 2 * e);
            c[2 * d + 2 * e + 1] += g * E;
            G(c, 2 * d + 2 * e + 1);
            c[2 * d + 2 * e + 1] += b * r;
            G(c, 2 * d + 2 * e + 1);
            c[2 * d + 2 * e + 2] += g * r;
            G(c, 2 * d + 2 * e + 2);
        }
        for(d = 0; d < a; d++)c[d] = c[2 * d + 1] << 16 | c[2 * d];
        for(d = a; d < 2 * a; d++)c[d] = 0;
        return new t(c, 0);
    };
    function G(f, a) {
        for(; (f[a] & 65535) != f[a];)f[a + 1] += f[a] >>> 16, f[a] &= 65535, a++;
    }
    function H(f, a) {
        this.g = f;
        this.h = a;
    }
    function D(f, a) {
        if (C(a)) throw Error("division by zero");
        if (C(f)) return new H(w, w);
        if (B(f)) return a = D(x(f), a), new H(x(a.g), x(a.h));
        if (B(a)) return a = D(f, x(a)), new H(x(a.g), a.h);
        if (30 < f.g.length) {
            if (B(f) || B(a)) throw Error("slowDivide_ only works with positive integers.");
            for(var c = z, d = a; 0 >= d.l(f);)c = I(c), d = I(d);
            var e = J(c, 1), g = J(d, 1);
            d = J(d, 2);
            for(c = J(c, 2); !C(d);){
                var b = g.add(d);
                0 >= b.l(f) && (e = e.add(c), g = b);
                d = J(d, 1);
                c = J(c, 1);
            }
            a = F(f, e.j(a));
            return new H(e, a);
        }
        for(e = w; 0 <= f.l(a);){
            c = Math.max(1, Math.floor(f.m() / a.m()));
            d = Math.ceil(Math.log(c) / Math.LN2);
            d = 48 >= d ? 1 : Math.pow(2, d - 48);
            g = v(c);
            for(b = g.j(a); B(b) || 0 < b.l(f);)c -= d, g = v(c), b = g.j(a);
            C(g) && (g = z);
            e = e.add(g);
            f = F(f, b);
        }
        return new H(e, f);
    }
    h.A = function(f) {
        return D(this, f).h;
    };
    h.and = function(f) {
        for(var a = Math.max(this.g.length, f.g.length), c = [], d = 0; d < a; d++)c[d] = this.i(d) & f.i(d);
        return new t(c, this.h & f.h);
    };
    h.or = function(f) {
        for(var a = Math.max(this.g.length, f.g.length), c = [], d = 0; d < a; d++)c[d] = this.i(d) | f.i(d);
        return new t(c, this.h | f.h);
    };
    h.xor = function(f) {
        for(var a = Math.max(this.g.length, f.g.length), c = [], d = 0; d < a; d++)c[d] = this.i(d) ^ f.i(d);
        return new t(c, this.h ^ f.h);
    };
    function I(f) {
        for(var a = f.g.length + 1, c = [], d = 0; d < a; d++)c[d] = f.i(d) << 1 | f.i(d - 1) >>> 31;
        return new t(c, f.h);
    }
    function J(f, a) {
        var c = a >> 5;
        a %= 32;
        for(var d = f.g.length - c, e = [], g = 0; g < d; g++)e[g] = 0 < a ? f.i(g + c) >>> a | f.i(g + c + 1) << 32 - a : f.i(g + c);
        return new t(e, f.h);
    }
    m.prototype.digest = m.prototype.v;
    m.prototype.reset = m.prototype.s;
    m.prototype.update = m.prototype.u;
    Md5 = bloom_blob_es2018.Md5 = m;
    t.prototype.add = t.prototype.add;
    t.prototype.multiply = t.prototype.j;
    t.prototype.modulo = t.prototype.A;
    t.prototype.compare = t.prototype.l;
    t.prototype.toNumber = t.prototype.m;
    t.prototype.toString = t.prototype.toString;
    t.prototype.getBits = t.prototype.i;
    t.fromNumber = v;
    t.fromString = y;
    Integer = bloom_blob_es2018.Integer = t;
}).apply(typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {});
;
 //# sourceMappingURL=bloom_blob_es2018.js.map
}}),
"[project]/node_modules/@firebase/webchannel-wrapper/dist/webchannel-blob/esm/webchannel_blob_es2018.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "ErrorCode": (()=>ErrorCode),
    "Event": (()=>Event),
    "EventType": (()=>EventType),
    "FetchXmlHttpFactory": (()=>FetchXmlHttpFactory),
    "Stat": (()=>Stat),
    "WebChannel": (()=>WebChannel),
    "XhrIo": (()=>XhrIo),
    "createWebChannelTransport": (()=>createWebChannelTransport),
    "default": (()=>webchannel_blob_es2018),
    "getStatEventTarget": (()=>getStatEventTarget)
});
var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};
var webchannel_blob_es2018 = {};
/** @license
Copyright The Closure Library Authors.
SPDX-License-Identifier: Apache-2.0
*/ var XhrIo;
var FetchXmlHttpFactory;
var WebChannel;
var EventType;
var ErrorCode;
var Stat;
var Event;
var getStatEventTarget;
var createWebChannelTransport;
(function() {
    var h, aa = "function" == typeof Object.defineProperties ? Object.defineProperty : function(a, b, c) {
        if (a == Array.prototype || a == Object.prototype) return a;
        a[b] = c.value;
        return a;
    };
    function ba(a) {
        a = [
            "object" == typeof globalThis && globalThis,
            a,
            "object" == typeof window && window,
            "object" == typeof self && self,
            "object" == typeof commonjsGlobal && commonjsGlobal
        ];
        for(var b = 0; b < a.length; ++b){
            var c = a[b];
            if (c && c.Math == Math) return c;
        }
        throw Error("Cannot find global object");
    }
    var ca = ba(this);
    function da(a, b) {
        if (b) a: {
            var c = ca;
            a = a.split(".");
            for(var d = 0; d < a.length - 1; d++){
                var e = a[d];
                if (!(e in c)) break a;
                c = c[e];
            }
            a = a[a.length - 1];
            d = c[a];
            b = b(d);
            b != d && null != b && aa(c, a, {
                configurable: !0,
                writable: !0,
                value: b
            });
        }
    }
    function ea(a, b) {
        a instanceof String && (a += "");
        var c = 0, d = !1, e = {
            next: function() {
                if (!d && c < a.length) {
                    var f = c++;
                    return {
                        value: b(f, a[f]),
                        done: !1
                    };
                }
                d = !0;
                return {
                    done: !0,
                    value: void 0
                };
            }
        };
        e[Symbol.iterator] = function() {
            return e;
        };
        return e;
    }
    da("Array.prototype.values", function(a) {
        return a ? a : function() {
            return ea(this, function(b, c) {
                return c;
            });
        };
    }); /** @license

 Copyright The Closure Library Authors.
 SPDX-License-Identifier: Apache-2.0
*/ 
    var fa = fa || {}, k = this || self;
    function ha(a) {
        var b = typeof a;
        b = "object" != b ? b : a ? Array.isArray(a) ? "array" : b : "null";
        return "array" == b || "object" == b && "number" == typeof a.length;
    }
    function n(a) {
        var b = typeof a;
        return "object" == b && null != a || "function" == b;
    }
    function ia(a, b, c) {
        return a.call.apply(a.bind, arguments);
    }
    function ja(a, b, c) {
        if (!a) throw Error();
        if (2 < arguments.length) {
            var d = Array.prototype.slice.call(arguments, 2);
            return function() {
                var e = Array.prototype.slice.call(arguments);
                Array.prototype.unshift.apply(e, d);
                return a.apply(b, e);
            };
        }
        return function() {
            return a.apply(b, arguments);
        };
    }
    function p(a, b, c) {
        p = Function.prototype.bind && -1 != Function.prototype.bind.toString().indexOf("native code") ? ia : ja;
        return p.apply(null, arguments);
    }
    function ka(a, b) {
        var c = Array.prototype.slice.call(arguments, 1);
        return function() {
            var d = c.slice();
            d.push.apply(d, arguments);
            return a.apply(this, d);
        };
    }
    function r(a, b) {
        function c() {}
        c.prototype = b.prototype;
        a.aa = b.prototype;
        a.prototype = new c;
        a.prototype.constructor = a;
        a.Qb = function(d, e, f) {
            for(var g = Array(arguments.length - 2), m = 2; m < arguments.length; m++)g[m - 2] = arguments[m];
            return b.prototype[e].apply(d, g);
        };
    }
    function la(a) {
        const b = a.length;
        if (0 < b) {
            const c = Array(b);
            for(let d = 0; d < b; d++)c[d] = a[d];
            return c;
        }
        return [];
    }
    function ma(a, b) {
        for(let c = 1; c < arguments.length; c++){
            const d = arguments[c];
            if (ha(d)) {
                const e = a.length || 0, f = d.length || 0;
                a.length = e + f;
                for(let g = 0; g < f; g++)a[e + g] = d[g];
            } else a.push(d);
        }
    }
    class na {
        constructor(a, b){
            this.i = a;
            this.j = b;
            this.h = 0;
            this.g = null;
        }
        get() {
            let a;
            0 < this.h ? (this.h--, a = this.g, this.g = a.next, a.next = null) : a = this.i();
            return a;
        }
    }
    function t(a) {
        return /^[\s\xa0]*$/.test(a);
    }
    function u() {
        var a = k.navigator;
        return a && (a = a.userAgent) ? a : "";
    }
    function oa(a) {
        oa[" "](a);
        return a;
    }
    oa[" "] = function() {};
    var pa = -1 != u().indexOf("Gecko") && !(-1 != u().toLowerCase().indexOf("webkit") && -1 == u().indexOf("Edge")) && !(-1 != u().indexOf("Trident") || -1 != u().indexOf("MSIE")) && -1 == u().indexOf("Edge");
    function qa(a, b, c) {
        for(const d in a)b.call(c, a[d], d, a);
    }
    function ra(a, b) {
        for(const c in a)b.call(void 0, a[c], c, a);
    }
    function sa(a) {
        const b = {};
        for(const c in a)b[c] = a[c];
        return b;
    }
    const ta = "constructor hasOwnProperty isPrototypeOf propertyIsEnumerable toLocaleString toString valueOf".split(" ");
    function ua(a, b) {
        let c, d;
        for(let e = 1; e < arguments.length; e++){
            d = arguments[e];
            for(c in d)a[c] = d[c];
            for(let f = 0; f < ta.length; f++)c = ta[f], Object.prototype.hasOwnProperty.call(d, c) && (a[c] = d[c]);
        }
    }
    function va(a) {
        var b = 1;
        a = a.split(":");
        const c = [];
        for(; 0 < b && a.length;)c.push(a.shift()), b--;
        a.length && c.push(a.join(":"));
        return c;
    }
    function wa(a) {
        k.setTimeout(()=>{
            throw a;
        }, 0);
    }
    function xa() {
        var a = za;
        let b = null;
        a.g && (b = a.g, a.g = a.g.next, a.g || (a.h = null), b.next = null);
        return b;
    }
    class Aa {
        constructor(){
            this.h = this.g = null;
        }
        add(a, b) {
            const c = Ba.get();
            c.set(a, b);
            this.h ? this.h.next = c : this.g = c;
            this.h = c;
        }
    }
    var Ba = new na(()=>new Ca, (a)=>a.reset());
    class Ca {
        constructor(){
            this.next = this.g = this.h = null;
        }
        set(a, b) {
            this.h = a;
            this.g = b;
            this.next = null;
        }
        reset() {
            this.next = this.g = this.h = null;
        }
    }
    let x, y = !1, za = new Aa, Ea = ()=>{
        const a = k.Promise.resolve(void 0);
        x = ()=>{
            a.then(Da);
        };
    };
    var Da = ()=>{
        for(var a; a = xa();){
            try {
                a.h.call(a.g);
            } catch (c) {
                wa(c);
            }
            var b = Ba;
            b.j(a);
            100 > b.h && (b.h++, a.next = b.g, b.g = a);
        }
        y = !1;
    };
    function z() {
        this.s = this.s;
        this.C = this.C;
    }
    z.prototype.s = !1;
    z.prototype.ma = function() {
        this.s || (this.s = !0, this.N());
    };
    z.prototype.N = function() {
        if (this.C) for(; this.C.length;)this.C.shift()();
    };
    function A(a, b) {
        this.type = a;
        this.g = this.target = b;
        this.defaultPrevented = !1;
    }
    A.prototype.h = function() {
        this.defaultPrevented = !0;
    };
    var Fa = function() {
        if (!k.addEventListener || !Object.defineProperty) return !1;
        var a = !1, b = Object.defineProperty({}, "passive", {
            get: function() {
                a = !0;
            }
        });
        try {
            const c = ()=>{};
            k.addEventListener("test", c, b);
            k.removeEventListener("test", c, b);
        } catch (c) {}
        return a;
    }();
    function C(a, b) {
        A.call(this, a ? a.type : "");
        this.relatedTarget = this.g = this.target = null;
        this.button = this.screenY = this.screenX = this.clientY = this.clientX = 0;
        this.key = "";
        this.metaKey = this.shiftKey = this.altKey = this.ctrlKey = !1;
        this.state = null;
        this.pointerId = 0;
        this.pointerType = "";
        this.i = null;
        if (a) {
            var c = this.type = a.type, d = a.changedTouches && a.changedTouches.length ? a.changedTouches[0] : null;
            this.target = a.target || a.srcElement;
            this.g = b;
            if (b = a.relatedTarget) {
                if (pa) {
                    a: {
                        try {
                            oa(b.nodeName);
                            var e = !0;
                            break a;
                        } catch (f) {}
                        e = !1;
                    }
                    e || (b = null);
                }
            } else "mouseover" == c ? b = a.fromElement : "mouseout" == c && (b = a.toElement);
            this.relatedTarget = b;
            d ? (this.clientX = void 0 !== d.clientX ? d.clientX : d.pageX, this.clientY = void 0 !== d.clientY ? d.clientY : d.pageY, this.screenX = d.screenX || 0, this.screenY = d.screenY || 0) : (this.clientX = void 0 !== a.clientX ? a.clientX : a.pageX, this.clientY = void 0 !== a.clientY ? a.clientY : a.pageY, this.screenX = a.screenX || 0, this.screenY = a.screenY || 0);
            this.button = a.button;
            this.key = a.key || "";
            this.ctrlKey = a.ctrlKey;
            this.altKey = a.altKey;
            this.shiftKey = a.shiftKey;
            this.metaKey = a.metaKey;
            this.pointerId = a.pointerId || 0;
            this.pointerType = "string" === typeof a.pointerType ? a.pointerType : Ga[a.pointerType] || "";
            this.state = a.state;
            this.i = a;
            a.defaultPrevented && C.aa.h.call(this);
        }
    }
    r(C, A);
    var Ga = {
        2: "touch",
        3: "pen",
        4: "mouse"
    };
    C.prototype.h = function() {
        C.aa.h.call(this);
        var a = this.i;
        a.preventDefault ? a.preventDefault() : a.returnValue = !1;
    };
    var D = "closure_listenable_" + (1E6 * Math.random() | 0);
    var Ha = 0;
    function Ia(a, b, c, d, e) {
        this.listener = a;
        this.proxy = null;
        this.src = b;
        this.type = c;
        this.capture = !!d;
        this.ha = e;
        this.key = ++Ha;
        this.da = this.fa = !1;
    }
    function Ja(a) {
        a.da = !0;
        a.listener = null;
        a.proxy = null;
        a.src = null;
        a.ha = null;
    }
    function Ka(a) {
        this.src = a;
        this.g = {};
        this.h = 0;
    }
    Ka.prototype.add = function(a, b, c, d, e) {
        var f = a.toString();
        a = this.g[f];
        a || (a = this.g[f] = [], this.h++);
        var g = La(a, b, d, e);
        -1 < g ? (b = a[g], c || (b.fa = !1)) : (b = new Ia(b, this.src, f, !!d, e), b.fa = c, a.push(b));
        return b;
    };
    function Ma(a, b) {
        var c = b.type;
        if (c in a.g) {
            var d = a.g[c], e = Array.prototype.indexOf.call(d, b, void 0), f;
            (f = 0 <= e) && Array.prototype.splice.call(d, e, 1);
            f && (Ja(b), 0 == a.g[c].length && (delete a.g[c], a.h--));
        }
    }
    function La(a, b, c, d) {
        for(var e = 0; e < a.length; ++e){
            var f = a[e];
            if (!f.da && f.listener == b && f.capture == !!c && f.ha == d) return e;
        }
        return -1;
    }
    var Na = "closure_lm_" + (1E6 * Math.random() | 0), Oa = {};
    function Qa(a, b, c, d, e) {
        if (d && d.once) return Ra(a, b, c, d, e);
        if (Array.isArray(b)) {
            for(var f = 0; f < b.length; f++)Qa(a, b[f], c, d, e);
            return null;
        }
        c = Sa(c);
        return a && a[D] ? a.K(b, c, n(d) ? !!d.capture : !!d, e) : Ta(a, b, c, !1, d, e);
    }
    function Ta(a, b, c, d, e, f) {
        if (!b) throw Error("Invalid event type");
        var g = n(e) ? !!e.capture : !!e, m = Ua(a);
        m || (a[Na] = m = new Ka(a));
        c = m.add(b, c, d, g, f);
        if (c.proxy) return c;
        d = Va();
        c.proxy = d;
        d.src = a;
        d.listener = c;
        if (a.addEventListener) Fa || (e = g), void 0 === e && (e = !1), a.addEventListener(b.toString(), d, e);
        else if (a.attachEvent) a.attachEvent(Wa(b.toString()), d);
        else if (a.addListener && a.removeListener) a.addListener(d);
        else throw Error("addEventListener and attachEvent are unavailable.");
        return c;
    }
    function Va() {
        function a(c) {
            return b.call(a.src, a.listener, c);
        }
        const b = Xa;
        return a;
    }
    function Ra(a, b, c, d, e) {
        if (Array.isArray(b)) {
            for(var f = 0; f < b.length; f++)Ra(a, b[f], c, d, e);
            return null;
        }
        c = Sa(c);
        return a && a[D] ? a.L(b, c, n(d) ? !!d.capture : !!d, e) : Ta(a, b, c, !0, d, e);
    }
    function Ya(a, b, c, d, e) {
        if (Array.isArray(b)) for(var f = 0; f < b.length; f++)Ya(a, b[f], c, d, e);
        else (d = n(d) ? !!d.capture : !!d, c = Sa(c), a && a[D]) ? (a = a.i, b = String(b).toString(), b in a.g && (f = a.g[b], c = La(f, c, d, e), -1 < c && (Ja(f[c]), Array.prototype.splice.call(f, c, 1), 0 == f.length && (delete a.g[b], a.h--)))) : a && (a = Ua(a)) && (b = a.g[b.toString()], a = -1, b && (a = La(b, c, d, e)), (c = -1 < a ? b[a] : null) && Za(c));
    }
    function Za(a) {
        if ("number" !== typeof a && a && !a.da) {
            var b = a.src;
            if (b && b[D]) Ma(b.i, a);
            else {
                var c = a.type, d = a.proxy;
                b.removeEventListener ? b.removeEventListener(c, d, a.capture) : b.detachEvent ? b.detachEvent(Wa(c), d) : b.addListener && b.removeListener && b.removeListener(d);
                (c = Ua(b)) ? (Ma(c, a), 0 == c.h && (c.src = null, b[Na] = null)) : Ja(a);
            }
        }
    }
    function Wa(a) {
        return a in Oa ? Oa[a] : Oa[a] = "on" + a;
    }
    function Xa(a, b) {
        if (a.da) a = !0;
        else {
            b = new C(b, this);
            var c = a.listener, d = a.ha || a.src;
            a.fa && Za(a);
            a = c.call(d, b);
        }
        return a;
    }
    function Ua(a) {
        a = a[Na];
        return a instanceof Ka ? a : null;
    }
    var $a = "__closure_events_fn_" + (1E9 * Math.random() >>> 0);
    function Sa(a) {
        if ("function" === typeof a) return a;
        a[$a] || (a[$a] = function(b) {
            return a.handleEvent(b);
        });
        return a[$a];
    }
    function E() {
        z.call(this);
        this.i = new Ka(this);
        this.M = this;
        this.F = null;
    }
    r(E, z);
    E.prototype[D] = !0;
    E.prototype.removeEventListener = function(a, b, c, d) {
        Ya(this, a, b, c, d);
    };
    function F(a, b) {
        var c, d = a.F;
        if (d) for(c = []; d; d = d.F)c.push(d);
        a = a.M;
        d = b.type || b;
        if ("string" === typeof b) b = new A(b, a);
        else if (b instanceof A) b.target = b.target || a;
        else {
            var e = b;
            b = new A(d, a);
            ua(b, e);
        }
        e = !0;
        if (c) for(var f = c.length - 1; 0 <= f; f--){
            var g = b.g = c[f];
            e = ab(g, d, !0, b) && e;
        }
        g = b.g = a;
        e = ab(g, d, !0, b) && e;
        e = ab(g, d, !1, b) && e;
        if (c) for(f = 0; f < c.length; f++)g = b.g = c[f], e = ab(g, d, !1, b) && e;
    }
    E.prototype.N = function() {
        E.aa.N.call(this);
        if (this.i) {
            var a = this.i, c;
            for(c in a.g){
                for(var d = a.g[c], e = 0; e < d.length; e++)Ja(d[e]);
                delete a.g[c];
                a.h--;
            }
        }
        this.F = null;
    };
    E.prototype.K = function(a, b, c, d) {
        return this.i.add(String(a), b, !1, c, d);
    };
    E.prototype.L = function(a, b, c, d) {
        return this.i.add(String(a), b, !0, c, d);
    };
    function ab(a, b, c, d) {
        b = a.i.g[String(b)];
        if (!b) return !0;
        b = b.concat();
        for(var e = !0, f = 0; f < b.length; ++f){
            var g = b[f];
            if (g && !g.da && g.capture == c) {
                var m = g.listener, q = g.ha || g.src;
                g.fa && Ma(a.i, g);
                e = !1 !== m.call(q, d) && e;
            }
        }
        return e && !d.defaultPrevented;
    }
    function bb(a, b, c) {
        if ("function" === typeof a) c && (a = p(a, c));
        else if (a && "function" == typeof a.handleEvent) a = p(a.handleEvent, a);
        else throw Error("Invalid listener argument");
        return 2147483647 < Number(b) ? -1 : k.setTimeout(a, b || 0);
    }
    function cb(a) {
        a.g = bb(()=>{
            a.g = null;
            a.i && (a.i = !1, cb(a));
        }, a.l);
        const b = a.h;
        a.h = null;
        a.m.apply(null, b);
    }
    class eb extends z {
        constructor(a, b){
            super();
            this.m = a;
            this.l = b;
            this.h = null;
            this.i = !1;
            this.g = null;
        }
        j(a) {
            this.h = arguments;
            this.g ? this.i = !0 : cb(this);
        }
        N() {
            super.N();
            this.g && (k.clearTimeout(this.g), this.g = null, this.i = !1, this.h = null);
        }
    }
    function G(a) {
        z.call(this);
        this.h = a;
        this.g = {};
    }
    r(G, z);
    var fb = [];
    function gb(a) {
        qa(a.g, function(b, c) {
            this.g.hasOwnProperty(c) && Za(b);
        }, a);
        a.g = {};
    }
    G.prototype.N = function() {
        G.aa.N.call(this);
        gb(this);
    };
    G.prototype.handleEvent = function() {
        throw Error("EventHandler.handleEvent not implemented");
    };
    var hb = k.JSON.stringify;
    var ib = k.JSON.parse;
    var jb = class {
        stringify(a) {
            return k.JSON.stringify(a, void 0);
        }
        parse(a) {
            return k.JSON.parse(a, void 0);
        }
    };
    function kb() {}
    kb.prototype.h = null;
    function lb(a) {
        return a.h || (a.h = a.i());
    }
    function mb() {}
    var H = {
        OPEN: "a",
        kb: "b",
        Ja: "c",
        wb: "d"
    };
    function nb() {
        A.call(this, "d");
    }
    r(nb, A);
    function ob() {
        A.call(this, "c");
    }
    r(ob, A);
    var I = {}, pb = null;
    function qb() {
        return pb = pb || new E;
    }
    I.La = "serverreachability";
    function rb(a) {
        A.call(this, I.La, a);
    }
    r(rb, A);
    function J(a) {
        const b = qb();
        F(b, new rb(b));
    }
    I.STAT_EVENT = "statevent";
    function sb(a, b) {
        A.call(this, I.STAT_EVENT, a);
        this.stat = b;
    }
    r(sb, A);
    function K(a) {
        const b = qb();
        F(b, new sb(b, a));
    }
    I.Ma = "timingevent";
    function tb(a, b) {
        A.call(this, I.Ma, a);
        this.size = b;
    }
    r(tb, A);
    function ub(a, b) {
        if ("function" !== typeof a) throw Error("Fn must not be null and must be a function");
        return k.setTimeout(function() {
            a();
        }, b);
    }
    function vb() {
        this.g = !0;
    }
    vb.prototype.xa = function() {
        this.g = !1;
    };
    function wb(a, b, c, d, e, f) {
        a.info(function() {
            if (a.g) if (f) {
                var g = "";
                for(var m = f.split("&"), q = 0; q < m.length; q++){
                    var l = m[q].split("=");
                    if (1 < l.length) {
                        var v = l[0];
                        l = l[1];
                        var w = v.split("_");
                        g = 2 <= w.length && "type" == w[1] ? g + (v + "=" + l + "&") : g + (v + "=redacted&");
                    }
                }
            } else g = null;
            else g = f;
            return "XMLHTTP REQ (" + d + ") [attempt " + e + "]: " + b + "\n" + c + "\n" + g;
        });
    }
    function xb(a, b, c, d, e, f, g) {
        a.info(function() {
            return "XMLHTTP RESP (" + d + ") [ attempt " + e + "]: " + b + "\n" + c + "\n" + f + " " + g;
        });
    }
    function L(a, b, c, d) {
        a.info(function() {
            return "XMLHTTP TEXT (" + b + "): " + yb(a, c) + (d ? " " + d : "");
        });
    }
    function zb(a, b) {
        a.info(function() {
            return "TIMEOUT: " + b;
        });
    }
    vb.prototype.info = function() {};
    function yb(a, b) {
        if (!a.g) return b;
        if (!b) return null;
        try {
            var c = JSON.parse(b);
            if (c) {
                for(a = 0; a < c.length; a++)if (Array.isArray(c[a])) {
                    var d = c[a];
                    if (!(2 > d.length)) {
                        var e = d[1];
                        if (Array.isArray(e) && !(1 > e.length)) {
                            var f = e[0];
                            if ("noop" != f && "stop" != f && "close" != f) for(var g = 1; g < e.length; g++)e[g] = "";
                        }
                    }
                }
            }
            return hb(c);
        } catch (m) {
            return b;
        }
    }
    var Ab = {
        NO_ERROR: 0,
        gb: 1,
        tb: 2,
        sb: 3,
        nb: 4,
        rb: 5,
        ub: 6,
        Ia: 7,
        TIMEOUT: 8,
        xb: 9
    };
    var Bb = {
        lb: "complete",
        Hb: "success",
        Ja: "error",
        Ia: "abort",
        zb: "ready",
        Ab: "readystatechange",
        TIMEOUT: "timeout",
        vb: "incrementaldata",
        yb: "progress",
        ob: "downloadprogress",
        Pb: "uploadprogress"
    };
    var Cb;
    function Db() {}
    r(Db, kb);
    Db.prototype.g = function() {
        return new XMLHttpRequest;
    };
    Db.prototype.i = function() {
        return {};
    };
    Cb = new Db;
    function M(a, b, c, d) {
        this.j = a;
        this.i = b;
        this.l = c;
        this.R = d || 1;
        this.U = new G(this);
        this.I = 45E3;
        this.H = null;
        this.o = !1;
        this.m = this.A = this.v = this.L = this.F = this.S = this.B = null;
        this.D = [];
        this.g = null;
        this.C = 0;
        this.s = this.u = null;
        this.X = -1;
        this.J = !1;
        this.O = 0;
        this.M = null;
        this.W = this.K = this.T = this.P = !1;
        this.h = new Eb;
    }
    function Eb() {
        this.i = null;
        this.g = "";
        this.h = !1;
    }
    var Fb = {}, Gb = {};
    function Hb(a, b, c) {
        a.L = 1;
        a.v = Ib(N(b));
        a.m = c;
        a.P = !0;
        Jb(a, null);
    }
    function Jb(a, b) {
        a.F = Date.now();
        Kb(a);
        a.A = N(a.v);
        var c = a.A, d = a.R;
        Array.isArray(d) || (d = [
            String(d)
        ]);
        Lb(c.i, "t", d);
        a.C = 0;
        c = a.j.J;
        a.h = new Eb;
        a.g = Mb(a.j, c ? b : null, !a.m);
        0 < a.O && (a.M = new eb(p(a.Y, a, a.g), a.O));
        b = a.U;
        c = a.g;
        d = a.ca;
        var e = "readystatechange";
        Array.isArray(e) || (e && (fb[0] = e.toString()), e = fb);
        for(var f = 0; f < e.length; f++){
            var g = Qa(c, e[f], d || b.handleEvent, !1, b.h || b);
            if (!g) break;
            b.g[g.key] = g;
        }
        b = a.H ? sa(a.H) : {};
        a.m ? (a.u || (a.u = "POST"), b["Content-Type"] = "application/x-www-form-urlencoded", a.g.ea(a.A, a.u, a.m, b)) : (a.u = "GET", a.g.ea(a.A, a.u, null, b));
        J();
        wb(a.i, a.u, a.A, a.l, a.R, a.m);
    }
    M.prototype.ca = function(a) {
        a = a.target;
        const b = this.M;
        b && 3 == P(a) ? b.j() : this.Y(a);
    };
    M.prototype.Y = function(a) {
        try {
            if (a == this.g) a: {
                const w = P(this.g);
                var b = this.g.Ba();
                const O = this.g.Z();
                if (!(3 > w) && (3 != w || this.g && (this.h.h || this.g.oa() || Nb(this.g)))) {
                    this.J || 4 != w || 7 == b || (8 == b || 0 >= O ? J(3) : J(2));
                    Ob(this);
                    var c = this.g.Z();
                    this.X = c;
                    b: if (Pb(this)) {
                        var d = Nb(this.g);
                        a = "";
                        var e = d.length, f = 4 == P(this.g);
                        if (!this.h.i) {
                            if ("undefined" === typeof TextDecoder) {
                                Q(this);
                                Qb(this);
                                var g = "";
                                break b;
                            }
                            this.h.i = new k.TextDecoder;
                        }
                        for(b = 0; b < e; b++)this.h.h = !0, a += this.h.i.decode(d[b], {
                            stream: !(f && b == e - 1)
                        });
                        d.length = 0;
                        this.h.g += a;
                        this.C = 0;
                        g = this.h.g;
                    } else g = this.g.oa();
                    this.o = 200 == c;
                    xb(this.i, this.u, this.A, this.l, this.R, w, c);
                    if (this.o) {
                        if (this.T && !this.K) {
                            b: {
                                if (this.g) {
                                    var m, q = this.g;
                                    if ((m = q.g ? q.g.getResponseHeader("X-HTTP-Initial-Response") : null) && !t(m)) {
                                        var l = m;
                                        break b;
                                    }
                                }
                                l = null;
                            }
                            if (c = l) L(this.i, this.l, c, "Initial handshake response via X-HTTP-Initial-Response"), this.K = !0, Rb(this, c);
                            else {
                                this.o = !1;
                                this.s = 3;
                                K(12);
                                Q(this);
                                Qb(this);
                                break a;
                            }
                        }
                        if (this.P) {
                            c = !0;
                            let B;
                            for(; !this.J && this.C < g.length;)if (B = Sb(this, g), B == Gb) {
                                4 == w && (this.s = 4, K(14), c = !1);
                                L(this.i, this.l, null, "[Incomplete Response]");
                                break;
                            } else if (B == Fb) {
                                this.s = 4;
                                K(15);
                                L(this.i, this.l, g, "[Invalid Chunk]");
                                c = !1;
                                break;
                            } else L(this.i, this.l, B, null), Rb(this, B);
                            Pb(this) && 0 != this.C && (this.h.g = this.h.g.slice(this.C), this.C = 0);
                            4 != w || 0 != g.length || this.h.h || (this.s = 1, K(16), c = !1);
                            this.o = this.o && c;
                            if (!c) L(this.i, this.l, g, "[Invalid Chunked Response]"), Q(this), Qb(this);
                            else if (0 < g.length && !this.W) {
                                this.W = !0;
                                var v = this.j;
                                v.g == this && v.ba && !v.M && (v.j.info("Great, no buffering proxy detected. Bytes received: " + g.length), Tb(v), v.M = !0, K(11));
                            }
                        } else L(this.i, this.l, g, null), Rb(this, g);
                        4 == w && Q(this);
                        this.o && !this.J && (4 == w ? Ub(this.j, this) : (this.o = !1, Kb(this)));
                    } else Vb(this.g), 400 == c && 0 < g.indexOf("Unknown SID") ? (this.s = 3, K(12)) : (this.s = 0, K(13)), Q(this), Qb(this);
                }
            }
        } catch (w) {} finally{}
    };
    function Pb(a) {
        return a.g ? "GET" == a.u && 2 != a.L && a.j.Ca : !1;
    }
    function Sb(a, b) {
        var c = a.C, d = b.indexOf("\n", c);
        if (-1 == d) return Gb;
        c = Number(b.substring(c, d));
        if (isNaN(c)) return Fb;
        d += 1;
        if (d + c > b.length) return Gb;
        b = b.slice(d, d + c);
        a.C = d + c;
        return b;
    }
    M.prototype.cancel = function() {
        this.J = !0;
        Q(this);
    };
    function Kb(a) {
        a.S = Date.now() + a.I;
        Wb(a, a.I);
    }
    function Wb(a, b) {
        if (null != a.B) throw Error("WatchDog timer not null");
        a.B = ub(p(a.ba, a), b);
    }
    function Ob(a) {
        a.B && (k.clearTimeout(a.B), a.B = null);
    }
    M.prototype.ba = function() {
        this.B = null;
        const a = Date.now();
        0 <= a - this.S ? (zb(this.i, this.A), 2 != this.L && (J(), K(17)), Q(this), this.s = 2, Qb(this)) : Wb(this, this.S - a);
    };
    function Qb(a) {
        0 == a.j.G || a.J || Ub(a.j, a);
    }
    function Q(a) {
        Ob(a);
        var b = a.M;
        b && "function" == typeof b.ma && b.ma();
        a.M = null;
        gb(a.U);
        a.g && (b = a.g, a.g = null, b.abort(), b.ma());
    }
    function Rb(a, b) {
        try {
            var c = a.j;
            if (0 != c.G && (c.g == a || Xb(c.h, a))) {
                if (!a.K && Xb(c.h, a) && 3 == c.G) {
                    try {
                        var d = c.Da.g.parse(b);
                    } catch (l) {
                        d = null;
                    }
                    if (Array.isArray(d) && 3 == d.length) {
                        var e = d;
                        if (0 == e[0]) a: {
                            if (!c.u) {
                                if (c.g) if (c.g.F + 3E3 < a.F) Yb(c), Zb(c);
                                else break a;
                                $b(c);
                                K(18);
                            }
                        }
                        else c.za = e[1], 0 < c.za - c.T && 37500 > e[2] && c.F && 0 == c.v && !c.C && (c.C = ub(p(c.Za, c), 6E3));
                        if (1 >= ac(c.h) && c.ca) {
                            try {
                                c.ca();
                            } catch (l) {}
                            c.ca = void 0;
                        }
                    } else R(c, 11);
                } else if ((a.K || c.g == a) && Yb(c), !t(b)) for(e = c.Da.g.parse(b), b = 0; b < e.length; b++){
                    let l = e[b];
                    c.T = l[0];
                    l = l[1];
                    if (2 == c.G) if ("c" == l[0]) {
                        c.K = l[1];
                        c.ia = l[2];
                        const v = l[3];
                        null != v && (c.la = v, c.j.info("VER=" + c.la));
                        const w = l[4];
                        null != w && (c.Aa = w, c.j.info("SVER=" + c.Aa));
                        const O = l[5];
                        null != O && "number" === typeof O && 0 < O && (d = 1.5 * O, c.L = d, c.j.info("backChannelRequestTimeoutMs_=" + d));
                        d = c;
                        const B = a.g;
                        if (B) {
                            const ya = B.g ? B.g.getResponseHeader("X-Client-Wire-Protocol") : null;
                            if (ya) {
                                var f = d.h;
                                f.g || -1 == ya.indexOf("spdy") && -1 == ya.indexOf("quic") && -1 == ya.indexOf("h2") || (f.j = f.l, f.g = new Set, f.h && (bc(f, f.h), f.h = null));
                            }
                            if (d.D) {
                                const db = B.g ? B.g.getResponseHeader("X-HTTP-Session-Id") : null;
                                db && (d.ya = db, S(d.I, d.D, db));
                            }
                        }
                        c.G = 3;
                        c.l && c.l.ua();
                        c.ba && (c.R = Date.now() - a.F, c.j.info("Handshake RTT: " + c.R + "ms"));
                        d = c;
                        var g = a;
                        d.qa = cc(d, d.J ? d.ia : null, d.W);
                        if (g.K) {
                            dc(d.h, g);
                            var m = g, q = d.L;
                            q && (m.I = q);
                            m.B && (Ob(m), Kb(m));
                            d.g = g;
                        } else ec(d);
                        0 < c.i.length && fc(c);
                    } else "stop" != l[0] && "close" != l[0] || R(c, 7);
                    else 3 == c.G && ("stop" == l[0] || "close" == l[0] ? "stop" == l[0] ? R(c, 7) : gc(c) : "noop" != l[0] && c.l && c.l.ta(l), c.v = 0);
                }
            }
            J(4);
        } catch (l) {}
    }
    var hc = class {
        constructor(a, b){
            this.g = a;
            this.map = b;
        }
    };
    function ic(a) {
        this.l = a || 10;
        k.PerformanceNavigationTiming ? (a = k.performance.getEntriesByType("navigation"), a = 0 < a.length && ("hq" == a[0].nextHopProtocol || "h2" == a[0].nextHopProtocol)) : a = !!(k.chrome && k.chrome.loadTimes && k.chrome.loadTimes() && k.chrome.loadTimes().wasFetchedViaSpdy);
        this.j = a ? this.l : 1;
        this.g = null;
        1 < this.j && (this.g = new Set);
        this.h = null;
        this.i = [];
    }
    function jc(a) {
        return a.h ? !0 : a.g ? a.g.size >= a.j : !1;
    }
    function ac(a) {
        return a.h ? 1 : a.g ? a.g.size : 0;
    }
    function Xb(a, b) {
        return a.h ? a.h == b : a.g ? a.g.has(b) : !1;
    }
    function bc(a, b) {
        a.g ? a.g.add(b) : a.h = b;
    }
    function dc(a, b) {
        a.h && a.h == b ? a.h = null : a.g && a.g.has(b) && a.g.delete(b);
    }
    ic.prototype.cancel = function() {
        this.i = kc(this);
        if (this.h) this.h.cancel(), this.h = null;
        else if (this.g && 0 !== this.g.size) {
            for (const a of this.g.values())a.cancel();
            this.g.clear();
        }
    };
    function kc(a) {
        if (null != a.h) return a.i.concat(a.h.D);
        if (null != a.g && 0 !== a.g.size) {
            let b = a.i;
            for (const c of a.g.values())b = b.concat(c.D);
            return b;
        }
        return la(a.i);
    }
    function lc(a) {
        if (a.V && "function" == typeof a.V) return a.V();
        if ("undefined" !== typeof Map && a instanceof Map || "undefined" !== typeof Set && a instanceof Set) return Array.from(a.values());
        if ("string" === typeof a) return a.split("");
        if (ha(a)) {
            for(var b = [], c = a.length, d = 0; d < c; d++)b.push(a[d]);
            return b;
        }
        b = [];
        c = 0;
        for(d in a)b[c++] = a[d];
        return b;
    }
    function mc(a) {
        if (a.na && "function" == typeof a.na) return a.na();
        if (!a.V || "function" != typeof a.V) {
            if ("undefined" !== typeof Map && a instanceof Map) return Array.from(a.keys());
            if (!("undefined" !== typeof Set && a instanceof Set)) {
                if (ha(a) || "string" === typeof a) {
                    var b = [];
                    a = a.length;
                    for(var c = 0; c < a; c++)b.push(c);
                    return b;
                }
                b = [];
                c = 0;
                for(const d in a)b[c++] = d;
                return b;
            }
        }
    }
    function nc(a, b) {
        if (a.forEach && "function" == typeof a.forEach) a.forEach(b, void 0);
        else if (ha(a) || "string" === typeof a) Array.prototype.forEach.call(a, b, void 0);
        else for(var c = mc(a), d = lc(a), e = d.length, f = 0; f < e; f++)b.call(void 0, d[f], c && c[f], a);
    }
    var oc = RegExp("^(?:([^:/?#.]+):)?(?://(?:([^\\\\/?#]*)@)?([^\\\\/?#]*?)(?::([0-9]+))?(?=[\\\\/?#]|$))?([^?#]+)?(?:\\?([^#]*))?(?:#([\\s\\S]*))?$");
    function pc(a, b) {
        if (a) {
            a = a.split("&");
            for(var c = 0; c < a.length; c++){
                var d = a[c].indexOf("="), e = null;
                if (0 <= d) {
                    var f = a[c].substring(0, d);
                    e = a[c].substring(d + 1);
                } else f = a[c];
                b(f, e ? decodeURIComponent(e.replace(/\+/g, " ")) : "");
            }
        }
    }
    function T(a) {
        this.g = this.o = this.j = "";
        this.s = null;
        this.m = this.l = "";
        this.h = !1;
        if (a instanceof T) {
            this.h = a.h;
            qc(this, a.j);
            this.o = a.o;
            this.g = a.g;
            rc(this, a.s);
            this.l = a.l;
            var b = a.i;
            var c = new sc;
            c.i = b.i;
            b.g && (c.g = new Map(b.g), c.h = b.h);
            tc(this, c);
            this.m = a.m;
        } else a && (b = String(a).match(oc)) ? (this.h = !1, qc(this, b[1] || "", !0), this.o = uc(b[2] || ""), this.g = uc(b[3] || "", !0), rc(this, b[4]), this.l = uc(b[5] || "", !0), tc(this, b[6] || "", !0), this.m = uc(b[7] || "")) : (this.h = !1, this.i = new sc(null, this.h));
    }
    T.prototype.toString = function() {
        var a = [], b = this.j;
        b && a.push(vc(b, wc, !0), ":");
        var c = this.g;
        if (c || "file" == b) a.push("//"), (b = this.o) && a.push(vc(b, wc, !0), "@"), a.push(encodeURIComponent(String(c)).replace(/%25([0-9a-fA-F]{2})/g, "%$1")), c = this.s, null != c && a.push(":", String(c));
        if (c = this.l) this.g && "/" != c.charAt(0) && a.push("/"), a.push(vc(c, "/" == c.charAt(0) ? xc : yc, !0));
        (c = this.i.toString()) && a.push("?", c);
        (c = this.m) && a.push("#", vc(c, zc));
        return a.join("");
    };
    function N(a) {
        return new T(a);
    }
    function qc(a, b, c) {
        a.j = c ? uc(b, !0) : b;
        a.j && (a.j = a.j.replace(/:$/, ""));
    }
    function rc(a, b) {
        if (b) {
            b = Number(b);
            if (isNaN(b) || 0 > b) throw Error("Bad port number " + b);
            a.s = b;
        } else a.s = null;
    }
    function tc(a, b, c) {
        b instanceof sc ? (a.i = b, Ac(a.i, a.h)) : (c || (b = vc(b, Bc)), a.i = new sc(b, a.h));
    }
    function S(a, b, c) {
        a.i.set(b, c);
    }
    function Ib(a) {
        S(a, "zx", Math.floor(2147483648 * Math.random()).toString(36) + Math.abs(Math.floor(2147483648 * Math.random()) ^ Date.now()).toString(36));
        return a;
    }
    function uc(a, b) {
        return a ? b ? decodeURI(a.replace(/%25/g, "%2525")) : decodeURIComponent(a) : "";
    }
    function vc(a, b, c) {
        return "string" === typeof a ? (a = encodeURI(a).replace(b, Cc), c && (a = a.replace(/%25([0-9a-fA-F]{2})/g, "%$1")), a) : null;
    }
    function Cc(a) {
        a = a.charCodeAt(0);
        return "%" + (a >> 4 & 15).toString(16) + (a & 15).toString(16);
    }
    var wc = /[#\/\?@]/g, yc = /[#\?:]/g, xc = /[#\?]/g, Bc = /[#\?@]/g, zc = /#/g;
    function sc(a, b) {
        this.h = this.g = null;
        this.i = a || null;
        this.j = !!b;
    }
    function U(a) {
        a.g || (a.g = new Map, a.h = 0, a.i && pc(a.i, function(b, c) {
            a.add(decodeURIComponent(b.replace(/\+/g, " ")), c);
        }));
    }
    h = sc.prototype;
    h.add = function(a, b) {
        U(this);
        this.i = null;
        a = V(this, a);
        var c = this.g.get(a);
        c || this.g.set(a, c = []);
        c.push(b);
        this.h += 1;
        return this;
    };
    function Dc(a, b) {
        U(a);
        b = V(a, b);
        a.g.has(b) && (a.i = null, a.h -= a.g.get(b).length, a.g.delete(b));
    }
    function Ec(a, b) {
        U(a);
        b = V(a, b);
        return a.g.has(b);
    }
    h.forEach = function(a, b) {
        U(this);
        this.g.forEach(function(c, d) {
            c.forEach(function(e) {
                a.call(b, e, d, this);
            }, this);
        }, this);
    };
    h.na = function() {
        U(this);
        const a = Array.from(this.g.values()), b = Array.from(this.g.keys()), c = [];
        for(let d = 0; d < b.length; d++){
            const e = a[d];
            for(let f = 0; f < e.length; f++)c.push(b[d]);
        }
        return c;
    };
    h.V = function(a) {
        U(this);
        let b = [];
        if ("string" === typeof a) Ec(this, a) && (b = b.concat(this.g.get(V(this, a))));
        else {
            a = Array.from(this.g.values());
            for(let c = 0; c < a.length; c++)b = b.concat(a[c]);
        }
        return b;
    };
    h.set = function(a, b) {
        U(this);
        this.i = null;
        a = V(this, a);
        Ec(this, a) && (this.h -= this.g.get(a).length);
        this.g.set(a, [
            b
        ]);
        this.h += 1;
        return this;
    };
    h.get = function(a, b) {
        if (!a) return b;
        a = this.V(a);
        return 0 < a.length ? String(a[0]) : b;
    };
    function Lb(a, b, c) {
        Dc(a, b);
        0 < c.length && (a.i = null, a.g.set(V(a, b), la(c)), a.h += c.length);
    }
    h.toString = function() {
        if (this.i) return this.i;
        if (!this.g) return "";
        const a = [], b = Array.from(this.g.keys());
        for(var c = 0; c < b.length; c++){
            var d = b[c];
            const f = encodeURIComponent(String(d)), g = this.V(d);
            for(d = 0; d < g.length; d++){
                var e = f;
                "" !== g[d] && (e += "=" + encodeURIComponent(String(g[d])));
                a.push(e);
            }
        }
        return this.i = a.join("&");
    };
    function V(a, b) {
        b = String(b);
        a.j && (b = b.toLowerCase());
        return b;
    }
    function Ac(a, b) {
        b && !a.j && (U(a), a.i = null, a.g.forEach(function(c, d) {
            var e = d.toLowerCase();
            d != e && (Dc(this, d), Lb(this, e, c));
        }, a));
        a.j = b;
    }
    function Fc(a, b) {
        const c = new vb;
        if (k.Image) {
            const d = new Image;
            d.onload = ka(W, c, "TestLoadImage: loaded", !0, b, d);
            d.onerror = ka(W, c, "TestLoadImage: error", !1, b, d);
            d.onabort = ka(W, c, "TestLoadImage: abort", !1, b, d);
            d.ontimeout = ka(W, c, "TestLoadImage: timeout", !1, b, d);
            k.setTimeout(function() {
                if (d.ontimeout) d.ontimeout();
            }, 1E4);
            d.src = a;
        } else b(!1);
    }
    function Gc(a, b) {
        const c = new vb, d = new AbortController, e = setTimeout(()=>{
            d.abort();
            W(c, "TestPingServer: timeout", !1, b);
        }, 1E4);
        fetch(a, {
            signal: d.signal
        }).then((f)=>{
            clearTimeout(e);
            f.ok ? W(c, "TestPingServer: ok", !0, b) : W(c, "TestPingServer: server error", !1, b);
        }).catch(()=>{
            clearTimeout(e);
            W(c, "TestPingServer: error", !1, b);
        });
    }
    function W(a, b, c, d, e) {
        try {
            e && (e.onload = null, e.onerror = null, e.onabort = null, e.ontimeout = null), d(c);
        } catch (f) {}
    }
    function Hc() {
        this.g = new jb;
    }
    function Ic(a, b, c) {
        const d = c || "";
        try {
            nc(a, function(e, f) {
                let g = e;
                n(e) && (g = hb(e));
                b.push(d + f + "=" + encodeURIComponent(g));
            });
        } catch (e) {
            throw b.push(d + "type=" + encodeURIComponent("_badmap")), e;
        }
    }
    function Jc(a) {
        this.l = a.Ub || null;
        this.j = a.eb || !1;
    }
    r(Jc, kb);
    Jc.prototype.g = function() {
        return new Kc(this.l, this.j);
    };
    Jc.prototype.i = function(a) {
        return function() {
            return a;
        };
    }({});
    function Kc(a, b) {
        E.call(this);
        this.D = a;
        this.o = b;
        this.m = void 0;
        this.status = this.readyState = 0;
        this.responseType = this.responseText = this.response = this.statusText = "";
        this.onreadystatechange = null;
        this.u = new Headers;
        this.h = null;
        this.B = "GET";
        this.A = "";
        this.g = !1;
        this.v = this.j = this.l = null;
    }
    r(Kc, E);
    h = Kc.prototype;
    h.open = function(a, b) {
        if (0 != this.readyState) throw this.abort(), Error("Error reopening a connection");
        this.B = a;
        this.A = b;
        this.readyState = 1;
        Lc(this);
    };
    h.send = function(a) {
        if (1 != this.readyState) throw this.abort(), Error("need to call open() first. ");
        this.g = !0;
        const b = {
            headers: this.u,
            method: this.B,
            credentials: this.m,
            cache: void 0
        };
        a && (b.body = a);
        (this.D || k).fetch(new Request(this.A, b)).then(this.Sa.bind(this), this.ga.bind(this));
    };
    h.abort = function() {
        this.response = this.responseText = "";
        this.u = new Headers;
        this.status = 0;
        this.j && this.j.cancel("Request was aborted.").catch(()=>{});
        1 <= this.readyState && this.g && 4 != this.readyState && (this.g = !1, Mc(this));
        this.readyState = 0;
    };
    h.Sa = function(a) {
        if (this.g && (this.l = a, this.h || (this.status = this.l.status, this.statusText = this.l.statusText, this.h = a.headers, this.readyState = 2, Lc(this)), this.g && (this.readyState = 3, Lc(this), this.g))) if ("arraybuffer" === this.responseType) a.arrayBuffer().then(this.Qa.bind(this), this.ga.bind(this));
        else if ("undefined" !== typeof k.ReadableStream && "body" in a) {
            this.j = a.body.getReader();
            if (this.o) {
                if (this.responseType) throw Error('responseType must be empty for "streamBinaryChunks" mode responses.');
                this.response = [];
            } else this.response = this.responseText = "", this.v = new TextDecoder;
            Nc(this);
        } else a.text().then(this.Ra.bind(this), this.ga.bind(this));
    };
    function Nc(a) {
        a.j.read().then(a.Pa.bind(a)).catch(a.ga.bind(a));
    }
    h.Pa = function(a) {
        if (this.g) {
            if (this.o && a.value) this.response.push(a.value);
            else if (!this.o) {
                var b = a.value ? a.value : new Uint8Array(0);
                if (b = this.v.decode(b, {
                    stream: !a.done
                })) this.response = this.responseText += b;
            }
            a.done ? Mc(this) : Lc(this);
            3 == this.readyState && Nc(this);
        }
    };
    h.Ra = function(a) {
        this.g && (this.response = this.responseText = a, Mc(this));
    };
    h.Qa = function(a) {
        this.g && (this.response = a, Mc(this));
    };
    h.ga = function() {
        this.g && Mc(this);
    };
    function Mc(a) {
        a.readyState = 4;
        a.l = null;
        a.j = null;
        a.v = null;
        Lc(a);
    }
    h.setRequestHeader = function(a, b) {
        this.u.append(a, b);
    };
    h.getResponseHeader = function(a) {
        return this.h ? this.h.get(a.toLowerCase()) || "" : "";
    };
    h.getAllResponseHeaders = function() {
        if (!this.h) return "";
        const a = [], b = this.h.entries();
        for(var c = b.next(); !c.done;)c = c.value, a.push(c[0] + ": " + c[1]), c = b.next();
        return a.join("\r\n");
    };
    function Lc(a) {
        a.onreadystatechange && a.onreadystatechange.call(a);
    }
    Object.defineProperty(Kc.prototype, "withCredentials", {
        get: function() {
            return "include" === this.m;
        },
        set: function(a) {
            this.m = a ? "include" : "same-origin";
        }
    });
    function Oc(a) {
        let b = "";
        qa(a, function(c, d) {
            b += d;
            b += ":";
            b += c;
            b += "\r\n";
        });
        return b;
    }
    function Pc(a, b, c) {
        a: {
            for(d in c){
                var d = !1;
                break a;
            }
            d = !0;
        }
        d || (c = Oc(c), "string" === typeof a ? null != c && encodeURIComponent(String(c)) : S(a, b, c));
    }
    function X(a) {
        E.call(this);
        this.headers = new Map;
        this.o = a || null;
        this.h = !1;
        this.v = this.g = null;
        this.D = "";
        this.m = 0;
        this.l = "";
        this.j = this.B = this.u = this.A = !1;
        this.I = null;
        this.H = "";
        this.J = !1;
    }
    r(X, E);
    var Qc = /^https?$/i, Rc = [
        "POST",
        "PUT"
    ];
    h = X.prototype;
    h.Ha = function(a) {
        this.J = a;
    };
    h.ea = function(a, b, c, d) {
        if (this.g) throw Error("[goog.net.XhrIo] Object is active with another request=" + this.D + "; newUri=" + a);
        b = b ? b.toUpperCase() : "GET";
        this.D = a;
        this.l = "";
        this.m = 0;
        this.A = !1;
        this.h = !0;
        this.g = this.o ? this.o.g() : Cb.g();
        this.v = this.o ? lb(this.o) : lb(Cb);
        this.g.onreadystatechange = p(this.Ea, this);
        try {
            this.B = !0, this.g.open(b, String(a), !0), this.B = !1;
        } catch (f) {
            Sc(this, f);
            return;
        }
        a = c || "";
        c = new Map(this.headers);
        if (d) if (Object.getPrototypeOf(d) === Object.prototype) for(var e in d)c.set(e, d[e]);
        else if ("function" === typeof d.keys && "function" === typeof d.get) for (const f of d.keys())c.set(f, d.get(f));
        else throw Error("Unknown input type for opt_headers: " + String(d));
        d = Array.from(c.keys()).find((f)=>"content-type" == f.toLowerCase());
        e = k.FormData && a instanceof k.FormData;
        !(0 <= Array.prototype.indexOf.call(Rc, b, void 0)) || d || e || c.set("Content-Type", "application/x-www-form-urlencoded;charset=utf-8");
        for (const [f, g] of c)this.g.setRequestHeader(f, g);
        this.H && (this.g.responseType = this.H);
        "withCredentials" in this.g && this.g.withCredentials !== this.J && (this.g.withCredentials = this.J);
        try {
            Tc(this), this.u = !0, this.g.send(a), this.u = !1;
        } catch (f) {
            Sc(this, f);
        }
    };
    function Sc(a, b) {
        a.h = !1;
        a.g && (a.j = !0, a.g.abort(), a.j = !1);
        a.l = b;
        a.m = 5;
        Uc(a);
        Vc(a);
    }
    function Uc(a) {
        a.A || (a.A = !0, F(a, "complete"), F(a, "error"));
    }
    h.abort = function(a) {
        this.g && this.h && (this.h = !1, this.j = !0, this.g.abort(), this.j = !1, this.m = a || 7, F(this, "complete"), F(this, "abort"), Vc(this));
    };
    h.N = function() {
        this.g && (this.h && (this.h = !1, this.j = !0, this.g.abort(), this.j = !1), Vc(this, !0));
        X.aa.N.call(this);
    };
    h.Ea = function() {
        this.s || (this.B || this.u || this.j ? Wc(this) : this.bb());
    };
    h.bb = function() {
        Wc(this);
    };
    function Wc(a) {
        if (a.h && "undefined" != typeof fa && (!a.v[1] || 4 != P(a) || 2 != a.Z())) {
            if (a.u && 4 == P(a)) bb(a.Ea, 0, a);
            else if (F(a, "readystatechange"), 4 == P(a)) {
                a.h = !1;
                try {
                    const g = a.Z();
                    a: switch(g){
                        case 200:
                        case 201:
                        case 202:
                        case 204:
                        case 206:
                        case 304:
                        case 1223:
                            var b = !0;
                            break a;
                        default:
                            b = !1;
                    }
                    var c;
                    if (!(c = b)) {
                        var d;
                        if (d = 0 === g) {
                            var e = String(a.D).match(oc)[1] || null;
                            !e && k.self && k.self.location && (e = k.self.location.protocol.slice(0, -1));
                            d = !Qc.test(e ? e.toLowerCase() : "");
                        }
                        c = d;
                    }
                    if (c) F(a, "complete"), F(a, "success");
                    else {
                        a.m = 6;
                        try {
                            var f = 2 < P(a) ? a.g.statusText : "";
                        } catch (m) {
                            f = "";
                        }
                        a.l = f + " [" + a.Z() + "]";
                        Uc(a);
                    }
                } finally{
                    Vc(a);
                }
            }
        }
    }
    function Vc(a, b) {
        if (a.g) {
            Tc(a);
            const c = a.g, d = a.v[0] ? ()=>{} : null;
            a.g = null;
            a.v = null;
            b || F(a, "ready");
            try {
                c.onreadystatechange = d;
            } catch (e) {}
        }
    }
    function Tc(a) {
        a.I && (k.clearTimeout(a.I), a.I = null);
    }
    h.isActive = function() {
        return !!this.g;
    };
    function P(a) {
        return a.g ? a.g.readyState : 0;
    }
    h.Z = function() {
        try {
            return 2 < P(this) ? this.g.status : -1;
        } catch (a) {
            return -1;
        }
    };
    h.oa = function() {
        try {
            return this.g ? this.g.responseText : "";
        } catch (a) {
            return "";
        }
    };
    h.Oa = function(a) {
        if (this.g) {
            var b = this.g.responseText;
            a && 0 == b.indexOf(a) && (b = b.substring(a.length));
            return ib(b);
        }
    };
    function Nb(a) {
        try {
            if (!a.g) return null;
            if ("response" in a.g) return a.g.response;
            switch(a.H){
                case "":
                case "text":
                    return a.g.responseText;
                case "arraybuffer":
                    if ("mozResponseArrayBuffer" in a.g) return a.g.mozResponseArrayBuffer;
            }
            return null;
        } catch (b) {
            return null;
        }
    }
    function Vb(a) {
        const b = {};
        a = (a.g && 2 <= P(a) ? a.g.getAllResponseHeaders() || "" : "").split("\r\n");
        for(let d = 0; d < a.length; d++){
            if (t(a[d])) continue;
            var c = va(a[d]);
            const e = c[0];
            c = c[1];
            if ("string" !== typeof c) continue;
            c = c.trim();
            const f = b[e] || [];
            b[e] = f;
            f.push(c);
        }
        ra(b, function(d) {
            return d.join(", ");
        });
    }
    h.Ba = function() {
        return this.m;
    };
    h.Ka = function() {
        return "string" === typeof this.l ? this.l : String(this.l);
    };
    function Xc(a, b, c) {
        return c && c.internalChannelParams ? c.internalChannelParams[a] || b : b;
    }
    function Yc(a) {
        this.Aa = 0;
        this.i = [];
        this.j = new vb;
        this.ia = this.qa = this.I = this.W = this.g = this.ya = this.D = this.H = this.m = this.S = this.o = null;
        this.Ya = this.U = 0;
        this.Va = Xc("failFast", !1, a);
        this.F = this.C = this.u = this.s = this.l = null;
        this.X = !0;
        this.za = this.T = -1;
        this.Y = this.v = this.B = 0;
        this.Ta = Xc("baseRetryDelayMs", 5E3, a);
        this.cb = Xc("retryDelaySeedMs", 1E4, a);
        this.Wa = Xc("forwardChannelMaxRetries", 2, a);
        this.wa = Xc("forwardChannelRequestTimeoutMs", 2E4, a);
        this.pa = a && a.xmlHttpFactory || void 0;
        this.Xa = a && a.Tb || void 0;
        this.Ca = a && a.useFetchStreams || !1;
        this.L = void 0;
        this.J = a && a.supportsCrossDomainXhr || !1;
        this.K = "";
        this.h = new ic(a && a.concurrentRequestLimit);
        this.Da = new Hc;
        this.P = a && a.fastHandshake || !1;
        this.O = a && a.encodeInitMessageHeaders || !1;
        this.P && this.O && (this.O = !1);
        this.Ua = a && a.Rb || !1;
        a && a.xa && this.j.xa();
        a && a.forceLongPolling && (this.X = !1);
        this.ba = !this.P && this.X && a && a.detectBufferingProxy || !1;
        this.ja = void 0;
        a && a.longPollingTimeout && 0 < a.longPollingTimeout && (this.ja = a.longPollingTimeout);
        this.ca = void 0;
        this.R = 0;
        this.M = !1;
        this.ka = this.A = null;
    }
    h = Yc.prototype;
    h.la = 8;
    h.G = 1;
    h.connect = function(a, b, c, d) {
        K(0);
        this.W = a;
        this.H = b || {};
        c && void 0 !== d && (this.H.OSID = c, this.H.OAID = d);
        this.F = this.X;
        this.I = cc(this, null, this.W);
        fc(this);
    };
    function gc(a) {
        Zc(a);
        if (3 == a.G) {
            var b = a.U++, c = N(a.I);
            S(c, "SID", a.K);
            S(c, "RID", b);
            S(c, "TYPE", "terminate");
            $c(a, c);
            b = new M(a, a.j, b);
            b.L = 2;
            b.v = Ib(N(c));
            c = !1;
            if (k.navigator && k.navigator.sendBeacon) try {
                c = k.navigator.sendBeacon(b.v.toString(), "");
            } catch (d) {}
            !c && k.Image && ((new Image).src = b.v, c = !0);
            c || (b.g = Mb(b.j, null), b.g.ea(b.v));
            b.F = Date.now();
            Kb(b);
        }
        ad(a);
    }
    function Zb(a) {
        a.g && (Tb(a), a.g.cancel(), a.g = null);
    }
    function Zc(a) {
        Zb(a);
        a.u && (k.clearTimeout(a.u), a.u = null);
        Yb(a);
        a.h.cancel();
        a.s && ("number" === typeof a.s && k.clearTimeout(a.s), a.s = null);
    }
    function fc(a) {
        if (!jc(a.h) && !a.s) {
            a.s = !0;
            var b = a.Ga;
            x || Ea();
            y || (x(), y = !0);
            za.add(b, a);
            a.B = 0;
        }
    }
    function bd(a, b) {
        if (ac(a.h) >= a.h.j - (a.s ? 1 : 0)) return !1;
        if (a.s) return a.i = b.D.concat(a.i), !0;
        if (1 == a.G || 2 == a.G || a.B >= (a.Va ? 0 : a.Wa)) return !1;
        a.s = ub(p(a.Ga, a, b), cd(a, a.B));
        a.B++;
        return !0;
    }
    h.Ga = function(a) {
        if (this.s) if (this.s = null, 1 == this.G) {
            if (!a) {
                this.U = Math.floor(1E5 * Math.random());
                a = this.U++;
                const e = new M(this, this.j, a);
                let f = this.o;
                this.S && (f ? (f = sa(f), ua(f, this.S)) : f = this.S);
                null !== this.m || this.O || (e.H = f, f = null);
                if (this.P) a: {
                    var b = 0;
                    for(var c = 0; c < this.i.length; c++){
                        b: {
                            var d = this.i[c];
                            if ("__data__" in d.map && (d = d.map.__data__, "string" === typeof d)) {
                                d = d.length;
                                break b;
                            }
                            d = void 0;
                        }
                        if (void 0 === d) break;
                        b += d;
                        if (4096 < b) {
                            b = c;
                            break a;
                        }
                        if (4096 === b || c === this.i.length - 1) {
                            b = c + 1;
                            break a;
                        }
                    }
                    b = 1E3;
                }
                else b = 1E3;
                b = dd(this, e, b);
                c = N(this.I);
                S(c, "RID", a);
                S(c, "CVER", 22);
                this.D && S(c, "X-HTTP-Session-Id", this.D);
                $c(this, c);
                f && (this.O ? b = "headers=" + encodeURIComponent(String(Oc(f))) + "&" + b : this.m && Pc(c, this.m, f));
                bc(this.h, e);
                this.Ua && S(c, "TYPE", "init");
                this.P ? (S(c, "$req", b), S(c, "SID", "null"), e.T = !0, Hb(e, c, null)) : Hb(e, c, b);
                this.G = 2;
            }
        } else 3 == this.G && (a ? ed(this, a) : 0 == this.i.length || jc(this.h) || ed(this));
    };
    function ed(a, b) {
        var c;
        b ? c = b.l : c = a.U++;
        const d = N(a.I);
        S(d, "SID", a.K);
        S(d, "RID", c);
        S(d, "AID", a.T);
        $c(a, d);
        a.m && a.o && Pc(d, a.m, a.o);
        c = new M(a, a.j, c, a.B + 1);
        null === a.m && (c.H = a.o);
        b && (a.i = b.D.concat(a.i));
        b = dd(a, c, 1E3);
        c.I = Math.round(.5 * a.wa) + Math.round(.5 * a.wa * Math.random());
        bc(a.h, c);
        Hb(c, d, b);
    }
    function $c(a, b) {
        a.H && qa(a.H, function(c, d) {
            S(b, d, c);
        });
        a.l && nc({}, function(c, d) {
            S(b, d, c);
        });
    }
    function dd(a, b, c) {
        c = Math.min(a.i.length, c);
        var d = a.l ? p(a.l.Na, a.l, a) : null;
        a: {
            var e = a.i;
            let f = -1;
            for(;;){
                const g = [
                    "count=" + c
                ];
                -1 == f ? 0 < c ? (f = e[0].g, g.push("ofs=" + f)) : f = 0 : g.push("ofs=" + f);
                let m = !0;
                for(let q = 0; q < c; q++){
                    let l = e[q].g;
                    const v = e[q].map;
                    l -= f;
                    if (0 > l) f = Math.max(0, e[q].g - 100), m = !1;
                    else try {
                        Ic(v, g, "req" + l + "_");
                    } catch (w) {
                        d && d(v);
                    }
                }
                if (m) {
                    d = g.join("&");
                    break a;
                }
            }
        }
        a = a.i.splice(0, c);
        b.D = a;
        return d;
    }
    function ec(a) {
        if (!a.g && !a.u) {
            a.Y = 1;
            var b = a.Fa;
            x || Ea();
            y || (x(), y = !0);
            za.add(b, a);
            a.v = 0;
        }
    }
    function $b(a) {
        if (a.g || a.u || 3 <= a.v) return !1;
        a.Y++;
        a.u = ub(p(a.Fa, a), cd(a, a.v));
        a.v++;
        return !0;
    }
    h.Fa = function() {
        this.u = null;
        fd(this);
        if (this.ba && !(this.M || null == this.g || 0 >= this.R)) {
            var a = 2 * this.R;
            this.j.info("BP detection timer enabled: " + a);
            this.A = ub(p(this.ab, this), a);
        }
    };
    h.ab = function() {
        this.A && (this.A = null, this.j.info("BP detection timeout reached."), this.j.info("Buffering proxy detected and switch to long-polling!"), this.F = !1, this.M = !0, K(10), Zb(this), fd(this));
    };
    function Tb(a) {
        null != a.A && (k.clearTimeout(a.A), a.A = null);
    }
    function fd(a) {
        a.g = new M(a, a.j, "rpc", a.Y);
        null === a.m && (a.g.H = a.o);
        a.g.O = 0;
        var b = N(a.qa);
        S(b, "RID", "rpc");
        S(b, "SID", a.K);
        S(b, "AID", a.T);
        S(b, "CI", a.F ? "0" : "1");
        !a.F && a.ja && S(b, "TO", a.ja);
        S(b, "TYPE", "xmlhttp");
        $c(a, b);
        a.m && a.o && Pc(b, a.m, a.o);
        a.L && (a.g.I = a.L);
        var c = a.g;
        a = a.ia;
        c.L = 1;
        c.v = Ib(N(b));
        c.m = null;
        c.P = !0;
        Jb(c, a);
    }
    h.Za = function() {
        null != this.C && (this.C = null, Zb(this), $b(this), K(19));
    };
    function Yb(a) {
        null != a.C && (k.clearTimeout(a.C), a.C = null);
    }
    function Ub(a, b) {
        var c = null;
        if (a.g == b) {
            Yb(a);
            Tb(a);
            a.g = null;
            var d = 2;
        } else if (Xb(a.h, b)) c = b.D, dc(a.h, b), d = 1;
        else return;
        if (0 != a.G) {
            if (b.o) if (1 == d) {
                c = b.m ? b.m.length : 0;
                b = Date.now() - b.F;
                var e = a.B;
                d = qb();
                F(d, new tb(d, c));
                fc(a);
            } else ec(a);
            else if (e = b.s, 3 == e || 0 == e && 0 < b.X || !(1 == d && bd(a, b) || 2 == d && $b(a))) switch(c && 0 < c.length && (b = a.h, b.i = b.i.concat(c)), e){
                case 1:
                    R(a, 5);
                    break;
                case 4:
                    R(a, 10);
                    break;
                case 3:
                    R(a, 6);
                    break;
                default:
                    R(a, 2);
            }
        }
    }
    function cd(a, b) {
        let c = a.Ta + Math.floor(Math.random() * a.cb);
        a.isActive() || (c *= 2);
        return c * b;
    }
    function R(a, b) {
        a.j.info("Error code " + b);
        if (2 == b) {
            var c = p(a.fb, a), d = a.Xa;
            const e = !d;
            d = new T(d || "//www.google.com/images/cleardot.gif");
            k.location && "http" == k.location.protocol || qc(d, "https");
            Ib(d);
            e ? Fc(d.toString(), c) : Gc(d.toString(), c);
        } else K(2);
        a.G = 0;
        a.l && a.l.sa(b);
        ad(a);
        Zc(a);
    }
    h.fb = function(a) {
        a ? (this.j.info("Successfully pinged google.com"), K(2)) : (this.j.info("Failed to ping google.com"), K(1));
    };
    function ad(a) {
        a.G = 0;
        a.ka = [];
        if (a.l) {
            const b = kc(a.h);
            if (0 != b.length || 0 != a.i.length) ma(a.ka, b), ma(a.ka, a.i), a.h.i.length = 0, la(a.i), a.i.length = 0;
            a.l.ra();
        }
    }
    function cc(a, b, c) {
        var d = c instanceof T ? N(c) : new T(c);
        if ("" != d.g) b && (d.g = b + "." + d.g), rc(d, d.s);
        else {
            var e = k.location;
            d = e.protocol;
            b = b ? b + "." + e.hostname : e.hostname;
            e = +e.port;
            var f = new T(null);
            d && qc(f, d);
            b && (f.g = b);
            e && rc(f, e);
            c && (f.l = c);
            d = f;
        }
        c = a.D;
        b = a.ya;
        c && b && S(d, c, b);
        S(d, "VER", a.la);
        $c(a, d);
        return d;
    }
    function Mb(a, b, c) {
        if (b && !a.J) throw Error("Can't create secondary domain capable XhrIo object.");
        b = a.Ca && !a.pa ? new X(new Jc({
            eb: c
        })) : new X(a.pa);
        b.Ha(a.J);
        return b;
    }
    h.isActive = function() {
        return !!this.l && this.l.isActive(this);
    };
    function gd() {}
    h = gd.prototype;
    h.ua = function() {};
    h.ta = function() {};
    h.sa = function() {};
    h.ra = function() {};
    h.isActive = function() {
        return !0;
    };
    h.Na = function() {};
    function hd() {}
    hd.prototype.g = function(a, b) {
        return new Y(a, b);
    };
    function Y(a, b) {
        E.call(this);
        this.g = new Yc(b);
        this.l = a;
        this.h = b && b.messageUrlParams || null;
        a = b && b.messageHeaders || null;
        b && b.clientProtocolHeaderRequired && (a ? a["X-Client-Protocol"] = "webchannel" : a = {
            "X-Client-Protocol": "webchannel"
        });
        this.g.o = a;
        a = b && b.initMessageHeaders || null;
        b && b.messageContentType && (a ? a["X-WebChannel-Content-Type"] = b.messageContentType : a = {
            "X-WebChannel-Content-Type": b.messageContentType
        });
        b && b.va && (a ? a["X-WebChannel-Client-Profile"] = b.va : a = {
            "X-WebChannel-Client-Profile": b.va
        });
        this.g.S = a;
        (a = b && b.Sb) && !t(a) && (this.g.m = a);
        this.v = b && b.supportsCrossDomainXhr || !1;
        this.u = b && b.sendRawJson || !1;
        (b = b && b.httpSessionIdParam) && !t(b) && (this.g.D = b, a = this.h, null !== a && b in a && (a = this.h, b in a && delete a[b]));
        this.j = new Z(this);
    }
    r(Y, E);
    Y.prototype.m = function() {
        this.g.l = this.j;
        this.v && (this.g.J = !0);
        this.g.connect(this.l, this.h || void 0);
    };
    Y.prototype.close = function() {
        gc(this.g);
    };
    Y.prototype.o = function(a) {
        var b = this.g;
        if ("string" === typeof a) {
            var c = {};
            c.__data__ = a;
            a = c;
        } else this.u && (c = {}, c.__data__ = hb(a), a = c);
        b.i.push(new hc(b.Ya++, a));
        3 == b.G && fc(b);
    };
    Y.prototype.N = function() {
        this.g.l = null;
        delete this.j;
        gc(this.g);
        delete this.g;
        Y.aa.N.call(this);
    };
    function id(a) {
        nb.call(this);
        a.__headers__ && (this.headers = a.__headers__, this.statusCode = a.__status__, delete a.__headers__, delete a.__status__);
        var b = a.__sm__;
        if (b) {
            a: {
                for(const c in b){
                    a = c;
                    break a;
                }
                a = void 0;
            }
            if (this.i = a) a = this.i, b = null !== b && a in b ? b[a] : void 0;
            this.data = b;
        } else this.data = a;
    }
    r(id, nb);
    function jd() {
        ob.call(this);
        this.status = 1;
    }
    r(jd, ob);
    function Z(a) {
        this.g = a;
    }
    r(Z, gd);
    Z.prototype.ua = function() {
        F(this.g, "a");
    };
    Z.prototype.ta = function(a) {
        F(this.g, new id(a));
    };
    Z.prototype.sa = function(a) {
        F(this.g, new jd());
    };
    Z.prototype.ra = function() {
        F(this.g, "b");
    };
    hd.prototype.createWebChannel = hd.prototype.g;
    Y.prototype.send = Y.prototype.o;
    Y.prototype.open = Y.prototype.m;
    Y.prototype.close = Y.prototype.close;
    createWebChannelTransport = webchannel_blob_es2018.createWebChannelTransport = function() {
        return new hd;
    };
    getStatEventTarget = webchannel_blob_es2018.getStatEventTarget = function() {
        return qb();
    };
    Event = webchannel_blob_es2018.Event = I;
    Stat = webchannel_blob_es2018.Stat = {
        mb: 0,
        pb: 1,
        qb: 2,
        Jb: 3,
        Ob: 4,
        Lb: 5,
        Mb: 6,
        Kb: 7,
        Ib: 8,
        Nb: 9,
        PROXY: 10,
        NOPROXY: 11,
        Gb: 12,
        Cb: 13,
        Db: 14,
        Bb: 15,
        Eb: 16,
        Fb: 17,
        ib: 18,
        hb: 19,
        jb: 20
    };
    Ab.NO_ERROR = 0;
    Ab.TIMEOUT = 8;
    Ab.HTTP_ERROR = 6;
    ErrorCode = webchannel_blob_es2018.ErrorCode = Ab;
    Bb.COMPLETE = "complete";
    EventType = webchannel_blob_es2018.EventType = Bb;
    mb.EventType = H;
    H.OPEN = "a";
    H.CLOSE = "b";
    H.ERROR = "c";
    H.MESSAGE = "d";
    E.prototype.listen = E.prototype.K;
    WebChannel = webchannel_blob_es2018.WebChannel = mb;
    FetchXmlHttpFactory = webchannel_blob_es2018.FetchXmlHttpFactory = Jc;
    X.prototype.listenOnce = X.prototype.L;
    X.prototype.getLastError = X.prototype.Ka;
    X.prototype.getLastErrorCode = X.prototype.Ba;
    X.prototype.getStatus = X.prototype.Z;
    X.prototype.getResponseJson = X.prototype.Oa;
    X.prototype.getResponseText = X.prototype.oa;
    X.prototype.send = X.prototype.ea;
    X.prototype.setWithCredentials = X.prototype.Ha;
    XhrIo = webchannel_blob_es2018.XhrIo = X;
}).apply(typeof commonjsGlobal !== 'undefined' ? commonjsGlobal : typeof self !== 'undefined' ? self : typeof window !== 'undefined' ? window : {});
;
 //# sourceMappingURL=webchannel_blob_es2018.js.map
}}),
"[project]/node_modules/@firebase/installations/dist/esm/index.esm2017.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "deleteInstallations": (()=>deleteInstallations),
    "getId": (()=>getId),
    "getInstallations": (()=>getInstallations),
    "getToken": (()=>getToken),
    "onIdChange": (()=>onIdChange)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm2017.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm2017.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$component$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/component/dist/esm/index.esm2017.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/util/dist/index.esm2017.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/idb/build/index.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/idb/build/index.js [app-client] (ecmascript) <locals>");
;
;
;
;
const name = "@firebase/installations";
const version = "0.6.12";
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const PENDING_TIMEOUT_MS = 10000;
const PACKAGE_VERSION = `w:${version}`;
const INTERNAL_AUTH_VERSION = 'FIS_v2';
const INSTALLATIONS_API_URL = 'https://firebaseinstallations.googleapis.com/v1';
const TOKEN_EXPIRATION_BUFFER = 60 * 60 * 1000; // One hour
const SERVICE = 'installations';
const SERVICE_NAME = 'Installations';
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const ERROR_DESCRIPTION_MAP = {
    ["missing-app-config-values" /* ErrorCode.MISSING_APP_CONFIG_VALUES */ ]: 'Missing App configuration value: "{$valueName}"',
    ["not-registered" /* ErrorCode.NOT_REGISTERED */ ]: 'Firebase Installation is not registered.',
    ["installation-not-found" /* ErrorCode.INSTALLATION_NOT_FOUND */ ]: 'Firebase Installation not found.',
    ["request-failed" /* ErrorCode.REQUEST_FAILED */ ]: '{$requestName} request failed with error "{$serverCode} {$serverStatus}: {$serverMessage}"',
    ["app-offline" /* ErrorCode.APP_OFFLINE */ ]: 'Could not process request. Application offline.',
    ["delete-pending-registration" /* ErrorCode.DELETE_PENDING_REGISTRATION */ ]: "Can't delete installation while there is a pending registration request."
};
const ERROR_FACTORY = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ErrorFactory"](SERVICE, SERVICE_NAME, ERROR_DESCRIPTION_MAP);
/** Returns true if error is a FirebaseError that is based on an error from the server. */ function isServerError(error) {
    return error instanceof __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FirebaseError"] && error.code.includes("request-failed" /* ErrorCode.REQUEST_FAILED */ );
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function getInstallationsEndpoint({ projectId }) {
    return `${INSTALLATIONS_API_URL}/projects/${projectId}/installations`;
}
function extractAuthTokenInfoFromResponse(response) {
    return {
        token: response.token,
        requestStatus: 2 /* RequestStatus.COMPLETED */ ,
        expiresIn: getExpiresInFromResponseExpiresIn(response.expiresIn),
        creationTime: Date.now()
    };
}
async function getErrorFromResponse(requestName, response) {
    const responseJson = await response.json();
    const errorData = responseJson.error;
    return ERROR_FACTORY.create("request-failed" /* ErrorCode.REQUEST_FAILED */ , {
        requestName,
        serverCode: errorData.code,
        serverMessage: errorData.message,
        serverStatus: errorData.status
    });
}
function getHeaders({ apiKey }) {
    return new Headers({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-goog-api-key': apiKey
    });
}
function getHeadersWithAuth(appConfig, { refreshToken }) {
    const headers = getHeaders(appConfig);
    headers.append('Authorization', getAuthorizationHeader(refreshToken));
    return headers;
}
/**
 * Calls the passed in fetch wrapper and returns the response.
 * If the returned response has a status of 5xx, re-runs the function once and
 * returns the response.
 */ async function retryIfServerError(fn) {
    const result = await fn();
    if (result.status >= 500 && result.status < 600) {
        // Internal Server Error. Retry request.
        return fn();
    }
    return result;
}
function getExpiresInFromResponseExpiresIn(responseExpiresIn) {
    // This works because the server will never respond with fractions of a second.
    return Number(responseExpiresIn.replace('s', '000'));
}
function getAuthorizationHeader(refreshToken) {
    return `${INTERNAL_AUTH_VERSION} ${refreshToken}`;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function createInstallationRequest({ appConfig, heartbeatServiceProvider }, { fid }) {
    const endpoint = getInstallationsEndpoint(appConfig);
    const headers = getHeaders(appConfig);
    // If heartbeat service exists, add the heartbeat string to the header.
    const heartbeatService = heartbeatServiceProvider.getImmediate({
        optional: true
    });
    if (heartbeatService) {
        const heartbeatsHeader = await heartbeatService.getHeartbeatsHeader();
        if (heartbeatsHeader) {
            headers.append('x-firebase-client', heartbeatsHeader);
        }
    }
    const body = {
        fid,
        authVersion: INTERNAL_AUTH_VERSION,
        appId: appConfig.appId,
        sdkVersion: PACKAGE_VERSION
    };
    const request = {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    };
    const response = await retryIfServerError(()=>fetch(endpoint, request));
    if (response.ok) {
        const responseValue = await response.json();
        const registeredInstallationEntry = {
            fid: responseValue.fid || fid,
            registrationStatus: 2 /* RequestStatus.COMPLETED */ ,
            refreshToken: responseValue.refreshToken,
            authToken: extractAuthTokenInfoFromResponse(responseValue.authToken)
        };
        return registeredInstallationEntry;
    } else {
        throw await getErrorFromResponse('Create Installation', response);
    }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /** Returns a promise that resolves after given time passes. */ function sleep(ms) {
    return new Promise((resolve)=>{
        setTimeout(resolve, ms);
    });
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function bufferToBase64UrlSafe(array) {
    const b64 = btoa(String.fromCharCode(...array));
    return b64.replace(/\+/g, '-').replace(/\//g, '_');
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const VALID_FID_PATTERN = /^[cdef][\w-]{21}$/;
const INVALID_FID = '';
/**
 * Generates a new FID using random values from Web Crypto API.
 * Returns an empty string if FID generation fails for any reason.
 */ function generateFid() {
    try {
        // A valid FID has exactly 22 base64 characters, which is 132 bits, or 16.5
        // bytes. our implementation generates a 17 byte array instead.
        const fidByteArray = new Uint8Array(17);
        const crypto = self.crypto || self.msCrypto;
        crypto.getRandomValues(fidByteArray);
        // Replace the first 4 random bits with the constant FID header of 0b0111.
        fidByteArray[0] = 0b01110000 + fidByteArray[0] % 0b00010000;
        const fid = encode(fidByteArray);
        return VALID_FID_PATTERN.test(fid) ? fid : INVALID_FID;
    } catch (_a) {
        // FID generation errored
        return INVALID_FID;
    }
}
/** Converts a FID Uint8Array to a base64 string representation. */ function encode(fidByteArray) {
    const b64String = bufferToBase64UrlSafe(fidByteArray);
    // Remove the 23rd character that was added because of the extra 4 bits at the
    // end of our 17 byte array, and the '=' padding.
    return b64String.substr(0, 22);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /** Returns a string key that can be used to identify the app. */ function getKey(appConfig) {
    return `${appConfig.appName}!${appConfig.appId}`;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const fidChangeCallbacks = new Map();
/**
 * Calls the onIdChange callbacks with the new FID value, and broadcasts the
 * change to other tabs.
 */ function fidChanged(appConfig, fid) {
    const key = getKey(appConfig);
    callFidChangeCallbacks(key, fid);
    broadcastFidChange(key, fid);
}
function addCallback(appConfig, callback) {
    // Open the broadcast channel if it's not already open,
    // to be able to listen to change events from other tabs.
    getBroadcastChannel();
    const key = getKey(appConfig);
    let callbackSet = fidChangeCallbacks.get(key);
    if (!callbackSet) {
        callbackSet = new Set();
        fidChangeCallbacks.set(key, callbackSet);
    }
    callbackSet.add(callback);
}
function removeCallback(appConfig, callback) {
    const key = getKey(appConfig);
    const callbackSet = fidChangeCallbacks.get(key);
    if (!callbackSet) {
        return;
    }
    callbackSet.delete(callback);
    if (callbackSet.size === 0) {
        fidChangeCallbacks.delete(key);
    }
    // Close broadcast channel if there are no more callbacks.
    closeBroadcastChannel();
}
function callFidChangeCallbacks(key, fid) {
    const callbacks = fidChangeCallbacks.get(key);
    if (!callbacks) {
        return;
    }
    for (const callback of callbacks){
        callback(fid);
    }
}
function broadcastFidChange(key, fid) {
    const channel = getBroadcastChannel();
    if (channel) {
        channel.postMessage({
            key,
            fid
        });
    }
    closeBroadcastChannel();
}
let broadcastChannel = null;
/** Opens and returns a BroadcastChannel if it is supported by the browser. */ function getBroadcastChannel() {
    if (!broadcastChannel && 'BroadcastChannel' in self) {
        broadcastChannel = new BroadcastChannel('[Firebase] FID Change');
        broadcastChannel.onmessage = (e)=>{
            callFidChangeCallbacks(e.data.key, e.data.fid);
        };
    }
    return broadcastChannel;
}
function closeBroadcastChannel() {
    if (fidChangeCallbacks.size === 0 && broadcastChannel) {
        broadcastChannel.close();
        broadcastChannel = null;
    }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const DATABASE_NAME = 'firebase-installations-database';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'firebase-installations-store';
let dbPromise = null;
function getDbPromise() {
    if (!dbPromise) {
        dbPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["openDB"])(DATABASE_NAME, DATABASE_VERSION, {
            upgrade: (db, oldVersion)=>{
                // We don't use 'break' in this switch statement, the fall-through
                // behavior is what we want, because if there are multiple versions between
                // the old version and the current version, we want ALL the migrations
                // that correspond to those versions to run, not only the last one.
                // eslint-disable-next-line default-case
                switch(oldVersion){
                    case 0:
                        db.createObjectStore(OBJECT_STORE_NAME);
                }
            }
        });
    }
    return dbPromise;
}
/** Assigns or overwrites the record for the given key with the given value. */ async function set(appConfig, value) {
    const key = getKey(appConfig);
    const db = await getDbPromise();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const objectStore = tx.objectStore(OBJECT_STORE_NAME);
    const oldValue = await objectStore.get(key);
    await objectStore.put(value, key);
    await tx.done;
    if (!oldValue || oldValue.fid !== value.fid) {
        fidChanged(appConfig, value.fid);
    }
    return value;
}
/** Removes record(s) from the objectStore that match the given key. */ async function remove(appConfig) {
    const key = getKey(appConfig);
    const db = await getDbPromise();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    await tx.objectStore(OBJECT_STORE_NAME).delete(key);
    await tx.done;
}
/**
 * Atomically updates a record with the result of updateFn, which gets
 * called with the current value. If newValue is undefined, the record is
 * deleted instead.
 * @return Updated value
 */ async function update(appConfig, updateFn) {
    const key = getKey(appConfig);
    const db = await getDbPromise();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    const store = tx.objectStore(OBJECT_STORE_NAME);
    const oldValue = await store.get(key);
    const newValue = updateFn(oldValue);
    if (newValue === undefined) {
        await store.delete(key);
    } else {
        await store.put(newValue, key);
    }
    await tx.done;
    if (newValue && (!oldValue || oldValue.fid !== newValue.fid)) {
        fidChanged(appConfig, newValue.fid);
    }
    return newValue;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Updates and returns the InstallationEntry from the database.
 * Also triggers a registration request if it is necessary and possible.
 */ async function getInstallationEntry(installations) {
    let registrationPromise;
    const installationEntry = await update(installations.appConfig, (oldEntry)=>{
        const installationEntry = updateOrCreateInstallationEntry(oldEntry);
        const entryWithPromise = triggerRegistrationIfNecessary(installations, installationEntry);
        registrationPromise = entryWithPromise.registrationPromise;
        return entryWithPromise.installationEntry;
    });
    if (installationEntry.fid === INVALID_FID) {
        // FID generation failed. Waiting for the FID from the server.
        return {
            installationEntry: await registrationPromise
        };
    }
    return {
        installationEntry,
        registrationPromise
    };
}
/**
 * Creates a new Installation Entry if one does not exist.
 * Also clears timed out pending requests.
 */ function updateOrCreateInstallationEntry(oldEntry) {
    const entry = oldEntry || {
        fid: generateFid(),
        registrationStatus: 0 /* RequestStatus.NOT_STARTED */ 
    };
    return clearTimedOutRequest(entry);
}
/**
 * If the Firebase Installation is not registered yet, this will trigger the
 * registration and return an InProgressInstallationEntry.
 *
 * If registrationPromise does not exist, the installationEntry is guaranteed
 * to be registered.
 */ function triggerRegistrationIfNecessary(installations, installationEntry) {
    if (installationEntry.registrationStatus === 0 /* RequestStatus.NOT_STARTED */ ) {
        if (!navigator.onLine) {
            // Registration required but app is offline.
            const registrationPromiseWithError = Promise.reject(ERROR_FACTORY.create("app-offline" /* ErrorCode.APP_OFFLINE */ ));
            return {
                installationEntry,
                registrationPromise: registrationPromiseWithError
            };
        }
        // Try registering. Change status to IN_PROGRESS.
        const inProgressEntry = {
            fid: installationEntry.fid,
            registrationStatus: 1 /* RequestStatus.IN_PROGRESS */ ,
            registrationTime: Date.now()
        };
        const registrationPromise = registerInstallation(installations, inProgressEntry);
        return {
            installationEntry: inProgressEntry,
            registrationPromise
        };
    } else if (installationEntry.registrationStatus === 1 /* RequestStatus.IN_PROGRESS */ ) {
        return {
            installationEntry,
            registrationPromise: waitUntilFidRegistration(installations)
        };
    } else {
        return {
            installationEntry
        };
    }
}
/** This will be executed only once for each new Firebase Installation. */ async function registerInstallation(installations, installationEntry) {
    try {
        const registeredInstallationEntry = await createInstallationRequest(installations, installationEntry);
        return set(installations.appConfig, registeredInstallationEntry);
    } catch (e) {
        if (isServerError(e) && e.customData.serverCode === 409) {
            // Server returned a "FID cannot be used" error.
            // Generate a new ID next time.
            await remove(installations.appConfig);
        } else {
            // Registration failed. Set FID as not registered.
            await set(installations.appConfig, {
                fid: installationEntry.fid,
                registrationStatus: 0 /* RequestStatus.NOT_STARTED */ 
            });
        }
        throw e;
    }
}
/** Call if FID registration is pending in another request. */ async function waitUntilFidRegistration(installations) {
    // Unfortunately, there is no way of reliably observing when a value in
    // IndexedDB changes (yet, see https://github.com/WICG/indexed-db-observers),
    // so we need to poll.
    let entry = await updateInstallationRequest(installations.appConfig);
    while(entry.registrationStatus === 1 /* RequestStatus.IN_PROGRESS */ ){
        // createInstallation request still in progress.
        await sleep(100);
        entry = await updateInstallationRequest(installations.appConfig);
    }
    if (entry.registrationStatus === 0 /* RequestStatus.NOT_STARTED */ ) {
        // The request timed out or failed in a different call. Try again.
        const { installationEntry, registrationPromise } = await getInstallationEntry(installations);
        if (registrationPromise) {
            return registrationPromise;
        } else {
            // if there is no registrationPromise, entry is registered.
            return installationEntry;
        }
    }
    return entry;
}
/**
 * Called only if there is a CreateInstallation request in progress.
 *
 * Updates the InstallationEntry in the DB based on the status of the
 * CreateInstallation request.
 *
 * Returns the updated InstallationEntry.
 */ function updateInstallationRequest(appConfig) {
    return update(appConfig, (oldEntry)=>{
        if (!oldEntry) {
            throw ERROR_FACTORY.create("installation-not-found" /* ErrorCode.INSTALLATION_NOT_FOUND */ );
        }
        return clearTimedOutRequest(oldEntry);
    });
}
function clearTimedOutRequest(entry) {
    if (hasInstallationRequestTimedOut(entry)) {
        return {
            fid: entry.fid,
            registrationStatus: 0 /* RequestStatus.NOT_STARTED */ 
        };
    }
    return entry;
}
function hasInstallationRequestTimedOut(installationEntry) {
    return installationEntry.registrationStatus === 1 /* RequestStatus.IN_PROGRESS */  && installationEntry.registrationTime + PENDING_TIMEOUT_MS < Date.now();
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function generateAuthTokenRequest({ appConfig, heartbeatServiceProvider }, installationEntry) {
    const endpoint = getGenerateAuthTokenEndpoint(appConfig, installationEntry);
    const headers = getHeadersWithAuth(appConfig, installationEntry);
    // If heartbeat service exists, add the heartbeat string to the header.
    const heartbeatService = heartbeatServiceProvider.getImmediate({
        optional: true
    });
    if (heartbeatService) {
        const heartbeatsHeader = await heartbeatService.getHeartbeatsHeader();
        if (heartbeatsHeader) {
            headers.append('x-firebase-client', heartbeatsHeader);
        }
    }
    const body = {
        installation: {
            sdkVersion: PACKAGE_VERSION,
            appId: appConfig.appId
        }
    };
    const request = {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    };
    const response = await retryIfServerError(()=>fetch(endpoint, request));
    if (response.ok) {
        const responseValue = await response.json();
        const completedAuthToken = extractAuthTokenInfoFromResponse(responseValue);
        return completedAuthToken;
    } else {
        throw await getErrorFromResponse('Generate Auth Token', response);
    }
}
function getGenerateAuthTokenEndpoint(appConfig, { fid }) {
    return `${getInstallationsEndpoint(appConfig)}/${fid}/authTokens:generate`;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Returns a valid authentication token for the installation. Generates a new
 * token if one doesn't exist, is expired or about to expire.
 *
 * Should only be called if the Firebase Installation is registered.
 */ async function refreshAuthToken(installations, forceRefresh = false) {
    let tokenPromise;
    const entry = await update(installations.appConfig, (oldEntry)=>{
        if (!isEntryRegistered(oldEntry)) {
            throw ERROR_FACTORY.create("not-registered" /* ErrorCode.NOT_REGISTERED */ );
        }
        const oldAuthToken = oldEntry.authToken;
        if (!forceRefresh && isAuthTokenValid(oldAuthToken)) {
            // There is a valid token in the DB.
            return oldEntry;
        } else if (oldAuthToken.requestStatus === 1 /* RequestStatus.IN_PROGRESS */ ) {
            // There already is a token request in progress.
            tokenPromise = waitUntilAuthTokenRequest(installations, forceRefresh);
            return oldEntry;
        } else {
            // No token or token expired.
            if (!navigator.onLine) {
                throw ERROR_FACTORY.create("app-offline" /* ErrorCode.APP_OFFLINE */ );
            }
            const inProgressEntry = makeAuthTokenRequestInProgressEntry(oldEntry);
            tokenPromise = fetchAuthTokenFromServer(installations, inProgressEntry);
            return inProgressEntry;
        }
    });
    const authToken = tokenPromise ? await tokenPromise : entry.authToken;
    return authToken;
}
/**
 * Call only if FID is registered and Auth Token request is in progress.
 *
 * Waits until the current pending request finishes. If the request times out,
 * tries once in this thread as well.
 */ async function waitUntilAuthTokenRequest(installations, forceRefresh) {
    // Unfortunately, there is no way of reliably observing when a value in
    // IndexedDB changes (yet, see https://github.com/WICG/indexed-db-observers),
    // so we need to poll.
    let entry = await updateAuthTokenRequest(installations.appConfig);
    while(entry.authToken.requestStatus === 1 /* RequestStatus.IN_PROGRESS */ ){
        // generateAuthToken still in progress.
        await sleep(100);
        entry = await updateAuthTokenRequest(installations.appConfig);
    }
    const authToken = entry.authToken;
    if (authToken.requestStatus === 0 /* RequestStatus.NOT_STARTED */ ) {
        // The request timed out or failed in a different call. Try again.
        return refreshAuthToken(installations, forceRefresh);
    } else {
        return authToken;
    }
}
/**
 * Called only if there is a GenerateAuthToken request in progress.
 *
 * Updates the InstallationEntry in the DB based on the status of the
 * GenerateAuthToken request.
 *
 * Returns the updated InstallationEntry.
 */ function updateAuthTokenRequest(appConfig) {
    return update(appConfig, (oldEntry)=>{
        if (!isEntryRegistered(oldEntry)) {
            throw ERROR_FACTORY.create("not-registered" /* ErrorCode.NOT_REGISTERED */ );
        }
        const oldAuthToken = oldEntry.authToken;
        if (hasAuthTokenRequestTimedOut(oldAuthToken)) {
            return Object.assign(Object.assign({}, oldEntry), {
                authToken: {
                    requestStatus: 0 /* RequestStatus.NOT_STARTED */ 
                }
            });
        }
        return oldEntry;
    });
}
async function fetchAuthTokenFromServer(installations, installationEntry) {
    try {
        const authToken = await generateAuthTokenRequest(installations, installationEntry);
        const updatedInstallationEntry = Object.assign(Object.assign({}, installationEntry), {
            authToken
        });
        await set(installations.appConfig, updatedInstallationEntry);
        return authToken;
    } catch (e) {
        if (isServerError(e) && (e.customData.serverCode === 401 || e.customData.serverCode === 404)) {
            // Server returned a "FID not found" or a "Invalid authentication" error.
            // Generate a new ID next time.
            await remove(installations.appConfig);
        } else {
            const updatedInstallationEntry = Object.assign(Object.assign({}, installationEntry), {
                authToken: {
                    requestStatus: 0 /* RequestStatus.NOT_STARTED */ 
                }
            });
            await set(installations.appConfig, updatedInstallationEntry);
        }
        throw e;
    }
}
function isEntryRegistered(installationEntry) {
    return installationEntry !== undefined && installationEntry.registrationStatus === 2 /* RequestStatus.COMPLETED */ ;
}
function isAuthTokenValid(authToken) {
    return authToken.requestStatus === 2 /* RequestStatus.COMPLETED */  && !isAuthTokenExpired(authToken);
}
function isAuthTokenExpired(authToken) {
    const now = Date.now();
    return now < authToken.creationTime || authToken.creationTime + authToken.expiresIn < now + TOKEN_EXPIRATION_BUFFER;
}
/** Returns an updated InstallationEntry with an InProgressAuthToken. */ function makeAuthTokenRequestInProgressEntry(oldEntry) {
    const inProgressAuthToken = {
        requestStatus: 1 /* RequestStatus.IN_PROGRESS */ ,
        requestTime: Date.now()
    };
    return Object.assign(Object.assign({}, oldEntry), {
        authToken: inProgressAuthToken
    });
}
function hasAuthTokenRequestTimedOut(authToken) {
    return authToken.requestStatus === 1 /* RequestStatus.IN_PROGRESS */  && authToken.requestTime + PENDING_TIMEOUT_MS < Date.now();
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Creates a Firebase Installation if there isn't one for the app and
 * returns the Installation ID.
 * @param installations - The `Installations` instance.
 *
 * @public
 */ async function getId(installations) {
    const installationsImpl = installations;
    const { installationEntry, registrationPromise } = await getInstallationEntry(installationsImpl);
    if (registrationPromise) {
        registrationPromise.catch(console.error);
    } else {
        // If the installation is already registered, update the authentication
        // token if needed.
        refreshAuthToken(installationsImpl).catch(console.error);
    }
    return installationEntry.fid;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Returns a Firebase Installations auth token, identifying the current
 * Firebase Installation.
 * @param installations - The `Installations` instance.
 * @param forceRefresh - Force refresh regardless of token expiration.
 *
 * @public
 */ async function getToken(installations, forceRefresh = false) {
    const installationsImpl = installations;
    await completeInstallationRegistration(installationsImpl);
    // At this point we either have a Registered Installation in the DB, or we've
    // already thrown an error.
    const authToken = await refreshAuthToken(installationsImpl, forceRefresh);
    return authToken.token;
}
async function completeInstallationRegistration(installations) {
    const { registrationPromise } = await getInstallationEntry(installations);
    if (registrationPromise) {
        // A createInstallation request is in progress. Wait until it finishes.
        await registrationPromise;
    }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function deleteInstallationRequest(appConfig, installationEntry) {
    const endpoint = getDeleteEndpoint(appConfig, installationEntry);
    const headers = getHeadersWithAuth(appConfig, installationEntry);
    const request = {
        method: 'DELETE',
        headers
    };
    const response = await retryIfServerError(()=>fetch(endpoint, request));
    if (!response.ok) {
        throw await getErrorFromResponse('Delete Installation', response);
    }
}
function getDeleteEndpoint(appConfig, { fid }) {
    return `${getInstallationsEndpoint(appConfig)}/${fid}`;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Deletes the Firebase Installation and all associated data.
 * @param installations - The `Installations` instance.
 *
 * @public
 */ async function deleteInstallations(installations) {
    const { appConfig } = installations;
    const entry = await update(appConfig, (oldEntry)=>{
        if (oldEntry && oldEntry.registrationStatus === 0 /* RequestStatus.NOT_STARTED */ ) {
            // Delete the unregistered entry without sending a deleteInstallation request.
            return undefined;
        }
        return oldEntry;
    });
    if (entry) {
        if (entry.registrationStatus === 1 /* RequestStatus.IN_PROGRESS */ ) {
            // Can't delete while trying to register.
            throw ERROR_FACTORY.create("delete-pending-registration" /* ErrorCode.DELETE_PENDING_REGISTRATION */ );
        } else if (entry.registrationStatus === 2 /* RequestStatus.COMPLETED */ ) {
            if (!navigator.onLine) {
                throw ERROR_FACTORY.create("app-offline" /* ErrorCode.APP_OFFLINE */ );
            } else {
                await deleteInstallationRequest(appConfig, entry);
                await remove(appConfig);
            }
        }
    }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Sets a new callback that will get called when Installation ID changes.
 * Returns an unsubscribe function that will remove the callback when called.
 * @param installations - The `Installations` instance.
 * @param callback - The callback function that is invoked when FID changes.
 * @returns A function that can be called to unsubscribe.
 *
 * @public
 */ function onIdChange(installations, callback) {
    const { appConfig } = installations;
    addCallback(appConfig, callback);
    return ()=>{
        removeCallback(appConfig, callback);
    };
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Returns an instance of {@link Installations} associated with the given
 * {@link @firebase/app#FirebaseApp} instance.
 * @param app - The {@link @firebase/app#FirebaseApp} instance.
 *
 * @public
 */ function getInstallations(app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getApp"])()) {
    const installationsImpl = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_getProvider"])(app, 'installations').getImmediate();
    return installationsImpl;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function extractAppConfig(app) {
    if (!app || !app.options) {
        throw getMissingValueError('App Configuration');
    }
    if (!app.name) {
        throw getMissingValueError('App Name');
    }
    // Required app config keys
    const configKeys = [
        'projectId',
        'apiKey',
        'appId'
    ];
    for (const keyName of configKeys){
        if (!app.options[keyName]) {
            throw getMissingValueError(keyName);
        }
    }
    return {
        appName: app.name,
        projectId: app.options.projectId,
        apiKey: app.options.apiKey,
        appId: app.options.appId
    };
}
function getMissingValueError(valueName) {
    return ERROR_FACTORY.create("missing-app-config-values" /* ErrorCode.MISSING_APP_CONFIG_VALUES */ , {
        valueName
    });
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const INSTALLATIONS_NAME = 'installations';
const INSTALLATIONS_NAME_INTERNAL = 'installations-internal';
const publicFactory = (container)=>{
    const app = container.getProvider('app').getImmediate();
    // Throws if app isn't configured properly.
    const appConfig = extractAppConfig(app);
    const heartbeatServiceProvider = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_getProvider"])(app, 'heartbeat');
    const installationsImpl = {
        app,
        appConfig,
        heartbeatServiceProvider,
        _delete: ()=>Promise.resolve()
    };
    return installationsImpl;
};
const internalFactory = (container)=>{
    const app = container.getProvider('app').getImmediate();
    // Internal FIS instance relies on public FIS instance.
    const installations = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_getProvider"])(app, INSTALLATIONS_NAME).getImmediate();
    const installationsInternal = {
        getId: ()=>getId(installations),
        getToken: (forceRefresh)=>getToken(installations, forceRefresh)
    };
    return installationsInternal;
};
function registerInstallations() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_registerComponent"])(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$component$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Component"](INSTALLATIONS_NAME, publicFactory, "PUBLIC" /* ComponentType.PUBLIC */ ));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_registerComponent"])(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$component$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Component"](INSTALLATIONS_NAME_INTERNAL, internalFactory, "PRIVATE" /* ComponentType.PRIVATE */ ));
}
/**
 * The Firebase Installations Web SDK.
 * This SDK does not work in a Node.js environment.
 *
 * @packageDocumentation
 */ registerInstallations();
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["registerVersion"])(name, version);
// BUILD_TARGET will be replaced by values like esm2017, cjs2017, etc during the compilation
(0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["registerVersion"])(name, version, 'esm2017');
;
 //# sourceMappingURL=index.esm2017.js.map
}}),
"[project]/node_modules/@firebase/messaging/dist/esm/index.esm2017.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "deleteToken": (()=>deleteToken),
    "getMessaging": (()=>getMessagingInWindow),
    "getToken": (()=>getToken),
    "isSupported": (()=>isWindowSupported),
    "onMessage": (()=>onMessage)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$installations$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/installations/dist/esm/index.esm2017.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$component$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/component/dist/esm/index.esm2017.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/idb/build/index.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/idb/build/index.js [app-client] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@firebase/util/dist/index.esm2017.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$module__evaluation$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm2017.js [app-client] (ecmascript) <module evaluation>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/@firebase/app/dist/esm/index.esm2017.js [app-client] (ecmascript) <locals>");
;
;
;
;
;
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const DEFAULT_SW_PATH = '/firebase-messaging-sw.js';
const DEFAULT_SW_SCOPE = '/firebase-cloud-messaging-push-scope';
const DEFAULT_VAPID_KEY = 'BDOU99-h67HcA6JeFXHbSNMu7e2yNNu3RzoMj8TM4W88jITfq7ZmPvIM1Iv-4_l2LxQcYwhqby2xGpWwzjfAnG4';
const ENDPOINT = 'https://fcmregistrations.googleapis.com/v1';
const CONSOLE_CAMPAIGN_ID = 'google.c.a.c_id';
const CONSOLE_CAMPAIGN_NAME = 'google.c.a.c_l';
const CONSOLE_CAMPAIGN_TIME = 'google.c.a.ts';
/** Set to '1' if Analytics is enabled for the campaign */ const CONSOLE_CAMPAIGN_ANALYTICS_ENABLED = 'google.c.a.e';
const DEFAULT_REGISTRATION_TIMEOUT = 10000;
var MessageType$1;
(function(MessageType) {
    MessageType[MessageType["DATA_MESSAGE"] = 1] = "DATA_MESSAGE";
    MessageType[MessageType["DISPLAY_NOTIFICATION"] = 3] = "DISPLAY_NOTIFICATION";
})(MessageType$1 || (MessageType$1 = {}));
/**
 * @license
 * Copyright 2018 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except
 * in compliance with the License. You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under the License
 * is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
 * or implied. See the License for the specific language governing permissions and limitations under
 * the License.
 */ var MessageType;
(function(MessageType) {
    MessageType["PUSH_RECEIVED"] = "push-received";
    MessageType["NOTIFICATION_CLICKED"] = "notification-clicked";
})(MessageType || (MessageType = {}));
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function arrayToBase64(array) {
    const uint8Array = new Uint8Array(array);
    const base64String = btoa(String.fromCharCode(...uint8Array));
    return base64String.replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
function base64ToArray(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for(let i = 0; i < rawData.length; ++i){
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const OLD_DB_NAME = 'fcm_token_details_db';
/**
 * The last DB version of 'fcm_token_details_db' was 4. This is one higher, so that the upgrade
 * callback is called for all versions of the old DB.
 */ const OLD_DB_VERSION = 5;
const OLD_OBJECT_STORE_NAME = 'fcm_token_object_Store';
async function migrateOldDatabase(senderId) {
    if ('databases' in indexedDB) {
        // indexedDb.databases() is an IndexedDB v3 API and does not exist in all browsers. TODO: Remove
        // typecast when it lands in TS types.
        const databases = await indexedDB.databases();
        const dbNames = databases.map((db)=>db.name);
        if (!dbNames.includes(OLD_DB_NAME)) {
            // old DB didn't exist, no need to open.
            return null;
        }
    }
    let tokenDetails = null;
    const db = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["openDB"])(OLD_DB_NAME, OLD_DB_VERSION, {
        upgrade: async (db, oldVersion, newVersion, upgradeTransaction)=>{
            var _a;
            if (oldVersion < 2) {
                // Database too old, skip migration.
                return;
            }
            if (!db.objectStoreNames.contains(OLD_OBJECT_STORE_NAME)) {
                // Database did not exist. Nothing to do.
                return;
            }
            const objectStore = upgradeTransaction.objectStore(OLD_OBJECT_STORE_NAME);
            const value = await objectStore.index('fcmSenderId').get(senderId);
            await objectStore.clear();
            if (!value) {
                // No entry in the database, nothing to migrate.
                return;
            }
            if (oldVersion === 2) {
                const oldDetails = value;
                if (!oldDetails.auth || !oldDetails.p256dh || !oldDetails.endpoint) {
                    return;
                }
                tokenDetails = {
                    token: oldDetails.fcmToken,
                    createTime: (_a = oldDetails.createTime) !== null && _a !== void 0 ? _a : Date.now(),
                    subscriptionOptions: {
                        auth: oldDetails.auth,
                        p256dh: oldDetails.p256dh,
                        endpoint: oldDetails.endpoint,
                        swScope: oldDetails.swScope,
                        vapidKey: typeof oldDetails.vapidKey === 'string' ? oldDetails.vapidKey : arrayToBase64(oldDetails.vapidKey)
                    }
                };
            } else if (oldVersion === 3) {
                const oldDetails = value;
                tokenDetails = {
                    token: oldDetails.fcmToken,
                    createTime: oldDetails.createTime,
                    subscriptionOptions: {
                        auth: arrayToBase64(oldDetails.auth),
                        p256dh: arrayToBase64(oldDetails.p256dh),
                        endpoint: oldDetails.endpoint,
                        swScope: oldDetails.swScope,
                        vapidKey: arrayToBase64(oldDetails.vapidKey)
                    }
                };
            } else if (oldVersion === 4) {
                const oldDetails = value;
                tokenDetails = {
                    token: oldDetails.fcmToken,
                    createTime: oldDetails.createTime,
                    subscriptionOptions: {
                        auth: arrayToBase64(oldDetails.auth),
                        p256dh: arrayToBase64(oldDetails.p256dh),
                        endpoint: oldDetails.endpoint,
                        swScope: oldDetails.swScope,
                        vapidKey: arrayToBase64(oldDetails.vapidKey)
                    }
                };
            }
        }
    });
    db.close();
    // Delete all old databases.
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["deleteDB"])(OLD_DB_NAME);
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["deleteDB"])('fcm_vapid_details_db');
    await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["deleteDB"])('undefined');
    return checkTokenDetails(tokenDetails) ? tokenDetails : null;
}
function checkTokenDetails(tokenDetails) {
    if (!tokenDetails || !tokenDetails.subscriptionOptions) {
        return false;
    }
    const { subscriptionOptions } = tokenDetails;
    return typeof tokenDetails.createTime === 'number' && tokenDetails.createTime > 0 && typeof tokenDetails.token === 'string' && tokenDetails.token.length > 0 && typeof subscriptionOptions.auth === 'string' && subscriptionOptions.auth.length > 0 && typeof subscriptionOptions.p256dh === 'string' && subscriptionOptions.p256dh.length > 0 && typeof subscriptionOptions.endpoint === 'string' && subscriptionOptions.endpoint.length > 0 && typeof subscriptionOptions.swScope === 'string' && subscriptionOptions.swScope.length > 0 && typeof subscriptionOptions.vapidKey === 'string' && subscriptionOptions.vapidKey.length > 0;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ // Exported for tests.
const DATABASE_NAME = 'firebase-messaging-database';
const DATABASE_VERSION = 1;
const OBJECT_STORE_NAME = 'firebase-messaging-store';
let dbPromise = null;
function getDbPromise() {
    if (!dbPromise) {
        dbPromise = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$idb$2f$build$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["openDB"])(DATABASE_NAME, DATABASE_VERSION, {
            upgrade: (upgradeDb, oldVersion)=>{
                // We don't use 'break' in this switch statement, the fall-through behavior is what we want,
                // because if there are multiple versions between the old version and the current version, we
                // want ALL the migrations that correspond to those versions to run, not only the last one.
                // eslint-disable-next-line default-case
                switch(oldVersion){
                    case 0:
                        upgradeDb.createObjectStore(OBJECT_STORE_NAME);
                }
            }
        });
    }
    return dbPromise;
}
/** Gets record(s) from the objectStore that match the given key. */ async function dbGet(firebaseDependencies) {
    const key = getKey(firebaseDependencies);
    const db = await getDbPromise();
    const tokenDetails = await db.transaction(OBJECT_STORE_NAME).objectStore(OBJECT_STORE_NAME).get(key);
    if (tokenDetails) {
        return tokenDetails;
    } else {
        // Check if there is a tokenDetails object in the old DB.
        const oldTokenDetails = await migrateOldDatabase(firebaseDependencies.appConfig.senderId);
        if (oldTokenDetails) {
            await dbSet(firebaseDependencies, oldTokenDetails);
            return oldTokenDetails;
        }
    }
}
/** Assigns or overwrites the record for the given key with the given value. */ async function dbSet(firebaseDependencies, tokenDetails) {
    const key = getKey(firebaseDependencies);
    const db = await getDbPromise();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    await tx.objectStore(OBJECT_STORE_NAME).put(tokenDetails, key);
    await tx.done;
    return tokenDetails;
}
/** Removes record(s) from the objectStore that match the given key. */ async function dbRemove(firebaseDependencies) {
    const key = getKey(firebaseDependencies);
    const db = await getDbPromise();
    const tx = db.transaction(OBJECT_STORE_NAME, 'readwrite');
    await tx.objectStore(OBJECT_STORE_NAME).delete(key);
    await tx.done;
}
function getKey({ appConfig }) {
    return appConfig.appId;
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const ERROR_MAP = {
    ["missing-app-config-values" /* ErrorCode.MISSING_APP_CONFIG_VALUES */ ]: 'Missing App configuration value: "{$valueName}"',
    ["only-available-in-window" /* ErrorCode.AVAILABLE_IN_WINDOW */ ]: 'This method is available in a Window context.',
    ["only-available-in-sw" /* ErrorCode.AVAILABLE_IN_SW */ ]: 'This method is available in a service worker context.',
    ["permission-default" /* ErrorCode.PERMISSION_DEFAULT */ ]: 'The notification permission was not granted and dismissed instead.',
    ["permission-blocked" /* ErrorCode.PERMISSION_BLOCKED */ ]: 'The notification permission was not granted and blocked instead.',
    ["unsupported-browser" /* ErrorCode.UNSUPPORTED_BROWSER */ ]: "This browser doesn't support the API's required to use the Firebase SDK.",
    ["indexed-db-unsupported" /* ErrorCode.INDEXED_DB_UNSUPPORTED */ ]: "This browser doesn't support indexedDb.open() (ex. Safari iFrame, Firefox Private Browsing, etc)",
    ["failed-service-worker-registration" /* ErrorCode.FAILED_DEFAULT_REGISTRATION */ ]: 'We are unable to register the default service worker. {$browserErrorMessage}',
    ["token-subscribe-failed" /* ErrorCode.TOKEN_SUBSCRIBE_FAILED */ ]: 'A problem occurred while subscribing the user to FCM: {$errorInfo}',
    ["token-subscribe-no-token" /* ErrorCode.TOKEN_SUBSCRIBE_NO_TOKEN */ ]: 'FCM returned no token when subscribing the user to push.',
    ["token-unsubscribe-failed" /* ErrorCode.TOKEN_UNSUBSCRIBE_FAILED */ ]: 'A problem occurred while unsubscribing the ' + 'user from FCM: {$errorInfo}',
    ["token-update-failed" /* ErrorCode.TOKEN_UPDATE_FAILED */ ]: 'A problem occurred while updating the user from FCM: {$errorInfo}',
    ["token-update-no-token" /* ErrorCode.TOKEN_UPDATE_NO_TOKEN */ ]: 'FCM returned no token when updating the user to push.',
    ["use-sw-after-get-token" /* ErrorCode.USE_SW_AFTER_GET_TOKEN */ ]: 'The useServiceWorker() method may only be called once and must be ' + 'called before calling getToken() to ensure your service worker is used.',
    ["invalid-sw-registration" /* ErrorCode.INVALID_SW_REGISTRATION */ ]: 'The input to useServiceWorker() must be a ServiceWorkerRegistration.',
    ["invalid-bg-handler" /* ErrorCode.INVALID_BG_HANDLER */ ]: 'The input to setBackgroundMessageHandler() must be a function.',
    ["invalid-vapid-key" /* ErrorCode.INVALID_VAPID_KEY */ ]: 'The public VAPID key must be a string.',
    ["use-vapid-key-after-get-token" /* ErrorCode.USE_VAPID_KEY_AFTER_GET_TOKEN */ ]: 'The usePublicVapidKey() method may only be called once and must be ' + 'called before calling getToken() to ensure your VAPID key is used.'
};
const ERROR_FACTORY = new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ErrorFactory"]('messaging', 'Messaging', ERROR_MAP);
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function requestGetToken(firebaseDependencies, subscriptionOptions) {
    const headers = await getHeaders(firebaseDependencies);
    const body = getBody(subscriptionOptions);
    const subscribeOptions = {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
    };
    let responseData;
    try {
        const response = await fetch(getEndpoint(firebaseDependencies.appConfig), subscribeOptions);
        responseData = await response.json();
    } catch (err) {
        throw ERROR_FACTORY.create("token-subscribe-failed" /* ErrorCode.TOKEN_SUBSCRIBE_FAILED */ , {
            errorInfo: err === null || err === void 0 ? void 0 : err.toString()
        });
    }
    if (responseData.error) {
        const message = responseData.error.message;
        throw ERROR_FACTORY.create("token-subscribe-failed" /* ErrorCode.TOKEN_SUBSCRIBE_FAILED */ , {
            errorInfo: message
        });
    }
    if (!responseData.token) {
        throw ERROR_FACTORY.create("token-subscribe-no-token" /* ErrorCode.TOKEN_SUBSCRIBE_NO_TOKEN */ );
    }
    return responseData.token;
}
async function requestUpdateToken(firebaseDependencies, tokenDetails) {
    const headers = await getHeaders(firebaseDependencies);
    const body = getBody(tokenDetails.subscriptionOptions);
    const updateOptions = {
        method: 'PATCH',
        headers,
        body: JSON.stringify(body)
    };
    let responseData;
    try {
        const response = await fetch(`${getEndpoint(firebaseDependencies.appConfig)}/${tokenDetails.token}`, updateOptions);
        responseData = await response.json();
    } catch (err) {
        throw ERROR_FACTORY.create("token-update-failed" /* ErrorCode.TOKEN_UPDATE_FAILED */ , {
            errorInfo: err === null || err === void 0 ? void 0 : err.toString()
        });
    }
    if (responseData.error) {
        const message = responseData.error.message;
        throw ERROR_FACTORY.create("token-update-failed" /* ErrorCode.TOKEN_UPDATE_FAILED */ , {
            errorInfo: message
        });
    }
    if (!responseData.token) {
        throw ERROR_FACTORY.create("token-update-no-token" /* ErrorCode.TOKEN_UPDATE_NO_TOKEN */ );
    }
    return responseData.token;
}
async function requestDeleteToken(firebaseDependencies, token) {
    const headers = await getHeaders(firebaseDependencies);
    const unsubscribeOptions = {
        method: 'DELETE',
        headers
    };
    try {
        const response = await fetch(`${getEndpoint(firebaseDependencies.appConfig)}/${token}`, unsubscribeOptions);
        const responseData = await response.json();
        if (responseData.error) {
            const message = responseData.error.message;
            throw ERROR_FACTORY.create("token-unsubscribe-failed" /* ErrorCode.TOKEN_UNSUBSCRIBE_FAILED */ , {
                errorInfo: message
            });
        }
    } catch (err) {
        throw ERROR_FACTORY.create("token-unsubscribe-failed" /* ErrorCode.TOKEN_UNSUBSCRIBE_FAILED */ , {
            errorInfo: err === null || err === void 0 ? void 0 : err.toString()
        });
    }
}
function getEndpoint({ projectId }) {
    return `${ENDPOINT}/projects/${projectId}/registrations`;
}
async function getHeaders({ appConfig, installations }) {
    const authToken = await installations.getToken();
    return new Headers({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'x-goog-api-key': appConfig.apiKey,
        'x-goog-firebase-installations-auth': `FIS ${authToken}`
    });
}
function getBody({ p256dh, auth, endpoint, vapidKey }) {
    const body = {
        web: {
            endpoint,
            auth,
            p256dh
        }
    };
    if (vapidKey !== DEFAULT_VAPID_KEY) {
        body.web.applicationPubKey = vapidKey;
    }
    return body;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ // UpdateRegistration will be called once every week.
const TOKEN_EXPIRATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
async function getTokenInternal(messaging) {
    const pushSubscription = await getPushSubscription(messaging.swRegistration, messaging.vapidKey);
    const subscriptionOptions = {
        vapidKey: messaging.vapidKey,
        swScope: messaging.swRegistration.scope,
        endpoint: pushSubscription.endpoint,
        auth: arrayToBase64(pushSubscription.getKey('auth')),
        p256dh: arrayToBase64(pushSubscription.getKey('p256dh'))
    };
    const tokenDetails = await dbGet(messaging.firebaseDependencies);
    if (!tokenDetails) {
        // No token, get a new one.
        return getNewToken(messaging.firebaseDependencies, subscriptionOptions);
    } else if (!isTokenValid(tokenDetails.subscriptionOptions, subscriptionOptions)) {
        // Invalid token, get a new one.
        try {
            await requestDeleteToken(messaging.firebaseDependencies, tokenDetails.token);
        } catch (e) {
            // Suppress errors because of #2364
            console.warn(e);
        }
        return getNewToken(messaging.firebaseDependencies, subscriptionOptions);
    } else if (Date.now() >= tokenDetails.createTime + TOKEN_EXPIRATION_MS) {
        // Weekly token refresh
        return updateToken(messaging, {
            token: tokenDetails.token,
            createTime: Date.now(),
            subscriptionOptions
        });
    } else {
        // Valid token, nothing to do.
        return tokenDetails.token;
    }
}
/**
 * This method deletes the token from the database, unsubscribes the token from FCM, and unregisters
 * the push subscription if it exists.
 */ async function deleteTokenInternal(messaging) {
    const tokenDetails = await dbGet(messaging.firebaseDependencies);
    if (tokenDetails) {
        await requestDeleteToken(messaging.firebaseDependencies, tokenDetails.token);
        await dbRemove(messaging.firebaseDependencies);
    }
    // Unsubscribe from the push subscription.
    const pushSubscription = await messaging.swRegistration.pushManager.getSubscription();
    if (pushSubscription) {
        return pushSubscription.unsubscribe();
    }
    // If there's no SW, consider it a success.
    return true;
}
async function updateToken(messaging, tokenDetails) {
    try {
        const updatedToken = await requestUpdateToken(messaging.firebaseDependencies, tokenDetails);
        const updatedTokenDetails = Object.assign(Object.assign({}, tokenDetails), {
            token: updatedToken,
            createTime: Date.now()
        });
        await dbSet(messaging.firebaseDependencies, updatedTokenDetails);
        return updatedToken;
    } catch (e) {
        throw e;
    }
}
async function getNewToken(firebaseDependencies, subscriptionOptions) {
    const token = await requestGetToken(firebaseDependencies, subscriptionOptions);
    const tokenDetails = {
        token,
        createTime: Date.now(),
        subscriptionOptions
    };
    await dbSet(firebaseDependencies, tokenDetails);
    return tokenDetails.token;
}
/**
 * Gets a PushSubscription for the current user.
 */ async function getPushSubscription(swRegistration, vapidKey) {
    const subscription = await swRegistration.pushManager.getSubscription();
    if (subscription) {
        return subscription;
    }
    return swRegistration.pushManager.subscribe({
        userVisibleOnly: true,
        // Chrome <= 75 doesn't support base64-encoded VAPID key. For backward compatibility, VAPID key
        // submitted to pushManager#subscribe must be of type Uint8Array.
        applicationServerKey: base64ToArray(vapidKey)
    });
}
/**
 * Checks if the saved tokenDetails object matches the configuration provided.
 */ function isTokenValid(dbOptions, currentOptions) {
    const isVapidKeyEqual = currentOptions.vapidKey === dbOptions.vapidKey;
    const isEndpointEqual = currentOptions.endpoint === dbOptions.endpoint;
    const isAuthEqual = currentOptions.auth === dbOptions.auth;
    const isP256dhEqual = currentOptions.p256dh === dbOptions.p256dh;
    return isVapidKeyEqual && isEndpointEqual && isAuthEqual && isP256dhEqual;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function externalizePayload(internalPayload) {
    const payload = {
        from: internalPayload.from,
        // eslint-disable-next-line camelcase
        collapseKey: internalPayload.collapse_key,
        // eslint-disable-next-line camelcase
        messageId: internalPayload.fcmMessageId
    };
    propagateNotificationPayload(payload, internalPayload);
    propagateDataPayload(payload, internalPayload);
    propagateFcmOptions(payload, internalPayload);
    return payload;
}
function propagateNotificationPayload(payload, messagePayloadInternal) {
    if (!messagePayloadInternal.notification) {
        return;
    }
    payload.notification = {};
    const title = messagePayloadInternal.notification.title;
    if (!!title) {
        payload.notification.title = title;
    }
    const body = messagePayloadInternal.notification.body;
    if (!!body) {
        payload.notification.body = body;
    }
    const image = messagePayloadInternal.notification.image;
    if (!!image) {
        payload.notification.image = image;
    }
    const icon = messagePayloadInternal.notification.icon;
    if (!!icon) {
        payload.notification.icon = icon;
    }
}
function propagateDataPayload(payload, messagePayloadInternal) {
    if (!messagePayloadInternal.data) {
        return;
    }
    payload.data = messagePayloadInternal.data;
}
function propagateFcmOptions(payload, messagePayloadInternal) {
    var _a, _b, _c, _d, _e;
    // fcmOptions.link value is written into notification.click_action. see more in b/232072111
    if (!messagePayloadInternal.fcmOptions && !((_a = messagePayloadInternal.notification) === null || _a === void 0 ? void 0 : _a.click_action)) {
        return;
    }
    payload.fcmOptions = {};
    const link = (_c = (_b = messagePayloadInternal.fcmOptions) === null || _b === void 0 ? void 0 : _b.link) !== null && _c !== void 0 ? _c : (_d = messagePayloadInternal.notification) === null || _d === void 0 ? void 0 : _d.click_action;
    if (!!link) {
        payload.fcmOptions.link = link;
    }
    // eslint-disable-next-line camelcase
    const analyticsLabel = (_e = messagePayloadInternal.fcmOptions) === null || _e === void 0 ? void 0 : _e.analytics_label;
    if (!!analyticsLabel) {
        payload.fcmOptions.analyticsLabel = analyticsLabel;
    }
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function isConsoleMessage(data) {
    // This message has a campaign ID, meaning it was sent using the Firebase Console.
    return typeof data === 'object' && !!data && CONSOLE_CAMPAIGN_ID in data;
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ _mergeStrings('AzSCbw63g1R0nCw85jG8', 'Iaya3yLKwmgvh7cF0q4');
function _mergeStrings(s1, s2) {
    const resultArray = [];
    for(let i = 0; i < s1.length; i++){
        resultArray.push(s1.charAt(i));
        if (i < s2.length) {
            resultArray.push(s2.charAt(i));
        }
    }
    return resultArray.join('');
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function extractAppConfig(app) {
    if (!app || !app.options) {
        throw getMissingValueError('App Configuration Object');
    }
    if (!app.name) {
        throw getMissingValueError('App Name');
    }
    // Required app config keys
    const configKeys = [
        'projectId',
        'apiKey',
        'appId',
        'messagingSenderId'
    ];
    const { options } = app;
    for (const keyName of configKeys){
        if (!options[keyName]) {
            throw getMissingValueError(keyName);
        }
    }
    return {
        appName: app.name,
        projectId: options.projectId,
        apiKey: options.apiKey,
        appId: options.appId,
        senderId: options.messagingSenderId
    };
}
function getMissingValueError(valueName) {
    return ERROR_FACTORY.create("missing-app-config-values" /* ErrorCode.MISSING_APP_CONFIG_VALUES */ , {
        valueName
    });
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ class MessagingService {
    constructor(app, installations, analyticsProvider){
        // logging is only done with end user consent. Default to false.
        this.deliveryMetricsExportedToBigQueryEnabled = false;
        this.onBackgroundMessageHandler = null;
        this.onMessageHandler = null;
        this.logEvents = [];
        this.isLogServiceStarted = false;
        const appConfig = extractAppConfig(app);
        this.firebaseDependencies = {
            app,
            appConfig,
            installations,
            analyticsProvider
        };
    }
    _delete() {
        return Promise.resolve();
    }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function registerDefaultSw(messaging) {
    try {
        messaging.swRegistration = await navigator.serviceWorker.register(DEFAULT_SW_PATH, {
            scope: DEFAULT_SW_SCOPE
        });
        // The timing when browser updates sw when sw has an update is unreliable from experiment. It
        // leads to version conflict when the SDK upgrades to a newer version in the main page, but sw
        // is stuck with the old version. For example,
        // https://github.com/firebase/firebase-js-sdk/issues/2590 The following line reliably updates
        // sw if there was an update.
        messaging.swRegistration.update().catch(()=>{
        /* it is non blocking and we don't care if it failed */ });
        await waitForRegistrationActive(messaging.swRegistration);
    } catch (e) {
        throw ERROR_FACTORY.create("failed-service-worker-registration" /* ErrorCode.FAILED_DEFAULT_REGISTRATION */ , {
            browserErrorMessage: e === null || e === void 0 ? void 0 : e.message
        });
    }
}
/**
 * Waits for registration to become active. MDN documentation claims that
 * a service worker registration should be ready to use after awaiting
 * navigator.serviceWorker.register() but that doesn't seem to be the case in
 * practice, causing the SDK to throw errors when calling
 * swRegistration.pushManager.subscribe() too soon after register(). The only
 * solution seems to be waiting for the service worker registration `state`
 * to become "active".
 */ async function waitForRegistrationActive(registration) {
    return new Promise((resolve, reject)=>{
        const rejectTimeout = setTimeout(()=>reject(new Error(`Service worker not registered after ${DEFAULT_REGISTRATION_TIMEOUT} ms`)), DEFAULT_REGISTRATION_TIMEOUT);
        const incomingSw = registration.installing || registration.waiting;
        if (registration.active) {
            clearTimeout(rejectTimeout);
            resolve();
        } else if (incomingSw) {
            incomingSw.onstatechange = (ev)=>{
                var _a;
                if (((_a = ev.target) === null || _a === void 0 ? void 0 : _a.state) === 'activated') {
                    incomingSw.onstatechange = null;
                    clearTimeout(rejectTimeout);
                    resolve();
                }
            };
        } else {
            clearTimeout(rejectTimeout);
            reject(new Error('No incoming service worker found.'));
        }
    });
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function updateSwReg(messaging, swRegistration) {
    if (!swRegistration && !messaging.swRegistration) {
        await registerDefaultSw(messaging);
    }
    if (!swRegistration && !!messaging.swRegistration) {
        return;
    }
    if (!(swRegistration instanceof ServiceWorkerRegistration)) {
        throw ERROR_FACTORY.create("invalid-sw-registration" /* ErrorCode.INVALID_SW_REGISTRATION */ );
    }
    messaging.swRegistration = swRegistration;
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function updateVapidKey(messaging, vapidKey) {
    if (!!vapidKey) {
        messaging.vapidKey = vapidKey;
    } else if (!messaging.vapidKey) {
        messaging.vapidKey = DEFAULT_VAPID_KEY;
    }
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function getToken$1(messaging, options) {
    if (!navigator) {
        throw ERROR_FACTORY.create("only-available-in-window" /* ErrorCode.AVAILABLE_IN_WINDOW */ );
    }
    if (Notification.permission === 'default') {
        await Notification.requestPermission();
    }
    if (Notification.permission !== 'granted') {
        throw ERROR_FACTORY.create("permission-blocked" /* ErrorCode.PERMISSION_BLOCKED */ );
    }
    await updateVapidKey(messaging, options === null || options === void 0 ? void 0 : options.vapidKey);
    await updateSwReg(messaging, options === null || options === void 0 ? void 0 : options.serviceWorkerRegistration);
    return getTokenInternal(messaging);
}
/**
 * @license
 * Copyright 2019 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function logToScion(messaging, messageType, data) {
    const eventType = getEventType(messageType);
    const analytics = await messaging.firebaseDependencies.analyticsProvider.get();
    analytics.logEvent(eventType, {
        /* eslint-disable camelcase */ message_id: data[CONSOLE_CAMPAIGN_ID],
        message_name: data[CONSOLE_CAMPAIGN_NAME],
        message_time: data[CONSOLE_CAMPAIGN_TIME],
        message_device_time: Math.floor(Date.now() / 1000)
    });
}
function getEventType(messageType) {
    switch(messageType){
        case MessageType.NOTIFICATION_CLICKED:
            return 'notification_open';
        case MessageType.PUSH_RECEIVED:
            return 'notification_foreground';
        default:
            throw new Error();
    }
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function messageEventListener(messaging, event) {
    const internalPayload = event.data;
    if (!internalPayload.isFirebaseMessaging) {
        return;
    }
    if (messaging.onMessageHandler && internalPayload.messageType === MessageType.PUSH_RECEIVED) {
        if (typeof messaging.onMessageHandler === 'function') {
            messaging.onMessageHandler(externalizePayload(internalPayload));
        } else {
            messaging.onMessageHandler.next(externalizePayload(internalPayload));
        }
    }
    // Log to Scion if applicable
    const dataPayload = internalPayload.data;
    if (isConsoleMessage(dataPayload) && dataPayload[CONSOLE_CAMPAIGN_ANALYTICS_ENABLED] === '1') {
        await logToScion(messaging, internalPayload.messageType, dataPayload);
    }
}
const name = "@firebase/messaging";
const version = "0.12.16";
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ const WindowMessagingFactory = (container)=>{
    const messaging = new MessagingService(container.getProvider('app').getImmediate(), container.getProvider('installations-internal').getImmediate(), container.getProvider('analytics-internal'));
    navigator.serviceWorker.addEventListener('message', (e)=>messageEventListener(messaging, e));
    return messaging;
};
const WindowMessagingInternalFactory = (container)=>{
    const messaging = container.getProvider('messaging').getImmediate();
    const messagingInternal = {
        getToken: (options)=>getToken$1(messaging, options)
    };
    return messagingInternal;
};
function registerMessagingInWindow() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_registerComponent"])(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$component$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Component"]('messaging', WindowMessagingFactory, "PUBLIC" /* ComponentType.PUBLIC */ ));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_registerComponent"])(new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$component$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Component"]('messaging-internal', WindowMessagingInternalFactory, "PRIVATE" /* ComponentType.PRIVATE */ ));
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["registerVersion"])(name, version);
    // BUILD_TARGET will be replaced by values like esm2017, cjs2017, etc during the compilation
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["registerVersion"])(name, version, 'esm2017');
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Checks if all required APIs exist in the browser.
 * @returns a Promise that resolves to a boolean.
 *
 * @public
 */ async function isWindowSupported() {
    try {
        // This throws if open() is unsupported, so adding it to the conditional
        // statement below can cause an uncaught error.
        await (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["validateIndexedDBOpenable"])();
    } catch (e) {
        return false;
    }
    // firebase-js-sdk/issues/2393 reveals that idb#open in Safari iframe and Firefox private browsing
    // might be prohibited to run. In these contexts, an error would be thrown during the messaging
    // instantiating phase, informing the developers to import/call isSupported for special handling.
    return typeof window !== 'undefined' && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["isIndexedDBAvailable"])() && (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["areCookiesEnabled"])() && 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window && 'fetch' in window && ServiceWorkerRegistration.prototype.hasOwnProperty('showNotification') && PushSubscription.prototype.hasOwnProperty('getKey');
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ async function deleteToken$1(messaging) {
    if (!navigator) {
        throw ERROR_FACTORY.create("only-available-in-window" /* ErrorCode.AVAILABLE_IN_WINDOW */ );
    }
    if (!messaging.swRegistration) {
        await registerDefaultSw(messaging);
    }
    return deleteTokenInternal(messaging);
}
/**
 * @license
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ function onMessage$1(messaging, nextOrObserver) {
    if (!navigator) {
        throw ERROR_FACTORY.create("only-available-in-window" /* ErrorCode.AVAILABLE_IN_WINDOW */ );
    }
    messaging.onMessageHandler = nextOrObserver;
    return ()=>{
        messaging.onMessageHandler = null;
    };
}
/**
 * @license
 * Copyright 2017 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */ /**
 * Retrieves a Firebase Cloud Messaging instance.
 *
 * @returns The Firebase Cloud Messaging instance associated with the provided firebase app.
 *
 * @public
 */ function getMessagingInWindow(app = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["getApp"])()) {
    // Conscious decision to make this async check non-blocking during the messaging instance
    // initialization phase for performance consideration. An error would be thrown latter for
    // developer's information. Developers can then choose to import and call `isSupported` for
    // special handling.
    isWindowSupported().then((isSupported)=>{
        // If `isWindowSupported()` resolved, but returned false.
        if (!isSupported) {
            throw ERROR_FACTORY.create("unsupported-browser" /* ErrorCode.UNSUPPORTED_BROWSER */ );
        }
    }, (_)=>{
        // If `isWindowSupported()` rejected.
        throw ERROR_FACTORY.create("indexed-db-unsupported" /* ErrorCode.INDEXED_DB_UNSUPPORTED */ );
    });
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$app$2f$dist$2f$esm$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__["_getProvider"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getModularInstance"])(app), 'messaging').getImmediate();
}
/**
 * Subscribes the {@link Messaging} instance to push notifications. Returns a Firebase Cloud
 * Messaging registration token that can be used to send push messages to that {@link Messaging}
 * instance.
 *
 * If notification permission isn't already granted, this method asks the user for permission. The
 * returned promise rejects if the user does not allow the app to show notifications.
 *
 * @param messaging - The {@link Messaging} instance.
 * @param options - Provides an optional vapid key and an optional service worker registration.
 *
 * @returns The promise resolves with an FCM registration token.
 *
 * @public
 */ async function getToken(messaging, options) {
    messaging = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getModularInstance"])(messaging);
    return getToken$1(messaging, options);
}
/**
 * Deletes the registration token associated with this {@link Messaging} instance and unsubscribes
 * the {@link Messaging} instance from the push subscription.
 *
 * @param messaging - The {@link Messaging} instance.
 *
 * @returns The promise resolves when the token has been successfully deleted.
 *
 * @public
 */ function deleteToken(messaging) {
    messaging = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getModularInstance"])(messaging);
    return deleteToken$1(messaging);
}
/**
 * When a push message is received and the user is currently on a page for your origin, the
 * message is passed to the page and an `onMessage()` event is dispatched with the payload of
 * the push message.
 *
 *
 * @param messaging - The {@link Messaging} instance.
 * @param nextOrObserver - This function, or observer object with `next` defined,
 *     is called when a message is received and the user is currently viewing your page.
 * @returns To stop listening for messages execute this returned function.
 *
 * @public
 */ function onMessage(messaging, nextOrObserver) {
    messaging = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$firebase$2f$util$2f$dist$2f$index$2e$esm2017$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getModularInstance"])(messaging);
    return onMessage$1(messaging, nextOrObserver);
}
/**
 * The Firebase Cloud Messaging Web SDK.
 * This SDK does not work in a Node.js environment.
 *
 * @packageDocumentation
 */ registerMessagingInWindow();
;
 //# sourceMappingURL=index.esm2017.js.map
}}),
"[project]/node_modules/use-sync-external-store/cjs/use-sync-external-store-with-selector.development.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
/**
 * @license React
 * use-sync-external-store-with-selector.development.js
 *
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */ var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
"production" !== ("TURBOPACK compile-time value", "development") && function() {
    function is(x, y) {
        return x === y && (0 !== x || 1 / x === 1 / y) || x !== x && y !== y;
    }
    "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStart(Error());
    var React = __turbopack_context__.r("[project]/apps/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"), objectIs = "function" === typeof Object.is ? Object.is : is, useSyncExternalStore = React.useSyncExternalStore, useRef = React.useRef, useEffect = React.useEffect, useMemo = React.useMemo, useDebugValue = React.useDebugValue;
    exports.useSyncExternalStoreWithSelector = function(subscribe, getSnapshot, getServerSnapshot, selector, isEqual) {
        var instRef = useRef(null);
        if (null === instRef.current) {
            var inst = {
                hasValue: !1,
                value: null
            };
            instRef.current = inst;
        } else inst = instRef.current;
        instRef = useMemo(function() {
            function memoizedSelector(nextSnapshot) {
                if (!hasMemo) {
                    hasMemo = !0;
                    memoizedSnapshot = nextSnapshot;
                    nextSnapshot = selector(nextSnapshot);
                    if (void 0 !== isEqual && inst.hasValue) {
                        var currentSelection = inst.value;
                        if (isEqual(currentSelection, nextSnapshot)) return memoizedSelection = currentSelection;
                    }
                    return memoizedSelection = nextSnapshot;
                }
                currentSelection = memoizedSelection;
                if (objectIs(memoizedSnapshot, nextSnapshot)) return currentSelection;
                var nextSelection = selector(nextSnapshot);
                if (void 0 !== isEqual && isEqual(currentSelection, nextSelection)) return memoizedSnapshot = nextSnapshot, currentSelection;
                memoizedSnapshot = nextSnapshot;
                return memoizedSelection = nextSelection;
            }
            var hasMemo = !1, memoizedSnapshot, memoizedSelection, maybeGetServerSnapshot = void 0 === getServerSnapshot ? null : getServerSnapshot;
            return [
                function() {
                    return memoizedSelector(getSnapshot());
                },
                null === maybeGetServerSnapshot ? void 0 : function() {
                    return memoizedSelector(maybeGetServerSnapshot());
                }
            ];
        }, [
            getSnapshot,
            getServerSnapshot,
            selector,
            isEqual
        ]);
        var value = useSyncExternalStore(subscribe, instRef[0], instRef[1]);
        useEffect(function() {
            inst.hasValue = !0;
            inst.value = value;
        }, [
            value
        ]);
        useDebugValue(value);
        return value;
    };
    "undefined" !== typeof __REACT_DEVTOOLS_GLOBAL_HOOK__ && "function" === typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop && __REACT_DEVTOOLS_GLOBAL_HOOK__.registerInternalModuleStop(Error());
}();
}}),
"[project]/node_modules/use-sync-external-store/with-selector.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
'use strict';
if ("TURBOPACK compile-time falsy", 0) {
    "TURBOPACK unreachable";
} else {
    module.exports = __turbopack_context__.r("[project]/node_modules/use-sync-external-store/cjs/use-sync-external-store-with-selector.development.js [app-client] (ecmascript)");
}
}}),
"[project]/apps/web/node_modules/react-redux/dist/react-redux.mjs [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/utils/react.ts
__turbopack_context__.s({
    "Provider": (()=>Provider_default),
    "ReactReduxContext": (()=>ReactReduxContext),
    "batch": (()=>batch),
    "connect": (()=>connect_default),
    "createDispatchHook": (()=>createDispatchHook),
    "createSelectorHook": (()=>createSelectorHook),
    "createStoreHook": (()=>createStoreHook),
    "shallowEqual": (()=>shallowEqual),
    "useDispatch": (()=>useDispatch),
    "useSelector": (()=>useSelector),
    "useStore": (()=>useStore)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
// src/hooks/useSelector.ts
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$sync$2d$external$2d$store$2f$with$2d$selector$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/use-sync-external-store/with-selector.js [app-client] (ecmascript)");
;
// src/utils/react-is.ts
var IS_REACT_19 = /* @__PURE__ */ __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["version"].startsWith("19");
var REACT_ELEMENT_TYPE = /* @__PURE__ */ Symbol.for(IS_REACT_19 ? "react.transitional.element" : "react.element");
var REACT_PORTAL_TYPE = /* @__PURE__ */ Symbol.for("react.portal");
var REACT_FRAGMENT_TYPE = /* @__PURE__ */ Symbol.for("react.fragment");
var REACT_STRICT_MODE_TYPE = /* @__PURE__ */ Symbol.for("react.strict_mode");
var REACT_PROFILER_TYPE = /* @__PURE__ */ Symbol.for("react.profiler");
var REACT_CONSUMER_TYPE = /* @__PURE__ */ Symbol.for("react.consumer");
var REACT_CONTEXT_TYPE = /* @__PURE__ */ Symbol.for("react.context");
var REACT_FORWARD_REF_TYPE = /* @__PURE__ */ Symbol.for("react.forward_ref");
var REACT_SUSPENSE_TYPE = /* @__PURE__ */ Symbol.for("react.suspense");
var REACT_SUSPENSE_LIST_TYPE = /* @__PURE__ */ Symbol.for("react.suspense_list");
var REACT_MEMO_TYPE = /* @__PURE__ */ Symbol.for("react.memo");
var REACT_LAZY_TYPE = /* @__PURE__ */ Symbol.for("react.lazy");
var REACT_OFFSCREEN_TYPE = /* @__PURE__ */ Symbol.for("react.offscreen");
var REACT_CLIENT_REFERENCE = /* @__PURE__ */ Symbol.for("react.client.reference");
var ForwardRef = REACT_FORWARD_REF_TYPE;
var Memo = REACT_MEMO_TYPE;
function isValidElementType(type) {
    return typeof type === "string" || typeof type === "function" || type === REACT_FRAGMENT_TYPE || type === REACT_PROFILER_TYPE || type === REACT_STRICT_MODE_TYPE || type === REACT_SUSPENSE_TYPE || type === REACT_SUSPENSE_LIST_TYPE || type === REACT_OFFSCREEN_TYPE || typeof type === "object" && type !== null && (type.$$typeof === REACT_LAZY_TYPE || type.$$typeof === REACT_MEMO_TYPE || type.$$typeof === REACT_CONTEXT_TYPE || type.$$typeof === REACT_CONSUMER_TYPE || type.$$typeof === REACT_FORWARD_REF_TYPE || type.$$typeof === REACT_CLIENT_REFERENCE || type.getModuleId !== void 0) ? true : false;
}
function typeOf(object) {
    if (typeof object === "object" && object !== null) {
        const { $$typeof } = object;
        switch($$typeof){
            case REACT_ELEMENT_TYPE:
                switch(object = object.type, object){
                    case REACT_FRAGMENT_TYPE:
                    case REACT_PROFILER_TYPE:
                    case REACT_STRICT_MODE_TYPE:
                    case REACT_SUSPENSE_TYPE:
                    case REACT_SUSPENSE_LIST_TYPE:
                        return object;
                    default:
                        switch(object = object && object.$$typeof, object){
                            case REACT_CONTEXT_TYPE:
                            case REACT_FORWARD_REF_TYPE:
                            case REACT_LAZY_TYPE:
                            case REACT_MEMO_TYPE:
                                return object;
                            case REACT_CONSUMER_TYPE:
                                return object;
                            default:
                                return $$typeof;
                        }
                }
            case REACT_PORTAL_TYPE:
                return $$typeof;
        }
    }
}
function isContextConsumer(object) {
    return IS_REACT_19 ? typeOf(object) === REACT_CONSUMER_TYPE : typeOf(object) === REACT_CONTEXT_TYPE;
}
function isMemo(object) {
    return typeOf(object) === REACT_MEMO_TYPE;
}
// src/utils/warning.ts
function warning(message) {
    if (typeof console !== "undefined" && typeof console.error === "function") {
        console.error(message);
    }
    try {
        throw new Error(message);
    } catch (e) {}
}
// src/connect/verifySubselectors.ts
function verify(selector, methodName) {
    if (!selector) {
        throw new Error(`Unexpected value for ${methodName} in connect.`);
    } else if (methodName === "mapStateToProps" || methodName === "mapDispatchToProps") {
        if (!Object.prototype.hasOwnProperty.call(selector, "dependsOnOwnProps")) {
            warning(`The selector for ${methodName} of connect did not specify a value for dependsOnOwnProps.`);
        }
    }
}
function verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps) {
    verify(mapStateToProps, "mapStateToProps");
    verify(mapDispatchToProps, "mapDispatchToProps");
    verify(mergeProps, "mergeProps");
}
// src/connect/selectorFactory.ts
function pureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, { areStatesEqual, areOwnPropsEqual, areStatePropsEqual }) {
    let hasRunAtLeastOnce = false;
    let state;
    let ownProps;
    let stateProps;
    let dispatchProps;
    let mergedProps;
    function handleFirstCall(firstState, firstOwnProps) {
        state = firstState;
        ownProps = firstOwnProps;
        stateProps = mapStateToProps(state, ownProps);
        dispatchProps = mapDispatchToProps(dispatch, ownProps);
        mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
        hasRunAtLeastOnce = true;
        return mergedProps;
    }
    function handleNewPropsAndNewState() {
        stateProps = mapStateToProps(state, ownProps);
        if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);
        mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
        return mergedProps;
    }
    function handleNewProps() {
        if (mapStateToProps.dependsOnOwnProps) stateProps = mapStateToProps(state, ownProps);
        if (mapDispatchToProps.dependsOnOwnProps) dispatchProps = mapDispatchToProps(dispatch, ownProps);
        mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
        return mergedProps;
    }
    function handleNewState() {
        const nextStateProps = mapStateToProps(state, ownProps);
        const statePropsChanged = !areStatePropsEqual(nextStateProps, stateProps);
        stateProps = nextStateProps;
        if (statePropsChanged) mergedProps = mergeProps(stateProps, dispatchProps, ownProps);
        return mergedProps;
    }
    function handleSubsequentCalls(nextState, nextOwnProps) {
        const propsChanged = !areOwnPropsEqual(nextOwnProps, ownProps);
        const stateChanged = !areStatesEqual(nextState, state, nextOwnProps, ownProps);
        state = nextState;
        ownProps = nextOwnProps;
        if (propsChanged && stateChanged) return handleNewPropsAndNewState();
        if (propsChanged) return handleNewProps();
        if (stateChanged) return handleNewState();
        return mergedProps;
    }
    return function pureFinalPropsSelector(nextState, nextOwnProps) {
        return hasRunAtLeastOnce ? handleSubsequentCalls(nextState, nextOwnProps) : handleFirstCall(nextState, nextOwnProps);
    };
}
function finalPropsSelectorFactory(dispatch, { initMapStateToProps, initMapDispatchToProps, initMergeProps, ...options }) {
    const mapStateToProps = initMapStateToProps(dispatch, options);
    const mapDispatchToProps = initMapDispatchToProps(dispatch, options);
    const mergeProps = initMergeProps(dispatch, options);
    if ("TURBOPACK compile-time truthy", 1) {
        verifySubselectors(mapStateToProps, mapDispatchToProps, mergeProps);
    }
    return pureFinalPropsSelectorFactory(mapStateToProps, mapDispatchToProps, mergeProps, dispatch, options);
}
// src/utils/bindActionCreators.ts
function bindActionCreators(actionCreators, dispatch) {
    const boundActionCreators = {};
    for(const key in actionCreators){
        const actionCreator = actionCreators[key];
        if (typeof actionCreator === "function") {
            boundActionCreators[key] = (...args)=>dispatch(actionCreator(...args));
        }
    }
    return boundActionCreators;
}
// src/utils/isPlainObject.ts
function isPlainObject(obj) {
    if (typeof obj !== "object" || obj === null) return false;
    const proto = Object.getPrototypeOf(obj);
    if (proto === null) return true;
    let baseProto = proto;
    while(Object.getPrototypeOf(baseProto) !== null){
        baseProto = Object.getPrototypeOf(baseProto);
    }
    return proto === baseProto;
}
// src/utils/verifyPlainObject.ts
function verifyPlainObject(value, displayName, methodName) {
    if (!isPlainObject(value)) {
        warning(`${methodName}() in ${displayName} must return a plain object. Instead received ${value}.`);
    }
}
// src/connect/wrapMapToProps.ts
function wrapMapToPropsConstant(getConstant) {
    return function initConstantSelector(dispatch) {
        const constant = getConstant(dispatch);
        function constantSelector() {
            return constant;
        }
        constantSelector.dependsOnOwnProps = false;
        return constantSelector;
    };
}
function getDependsOnOwnProps(mapToProps) {
    return mapToProps.dependsOnOwnProps ? Boolean(mapToProps.dependsOnOwnProps) : mapToProps.length !== 1;
}
function wrapMapToPropsFunc(mapToProps, methodName) {
    return function initProxySelector(dispatch, { displayName }) {
        const proxy = function mapToPropsProxy(stateOrDispatch, ownProps) {
            return proxy.dependsOnOwnProps ? proxy.mapToProps(stateOrDispatch, ownProps) : proxy.mapToProps(stateOrDispatch, void 0);
        };
        proxy.dependsOnOwnProps = true;
        proxy.mapToProps = function detectFactoryAndVerify(stateOrDispatch, ownProps) {
            proxy.mapToProps = mapToProps;
            proxy.dependsOnOwnProps = getDependsOnOwnProps(mapToProps);
            let props = proxy(stateOrDispatch, ownProps);
            if (typeof props === "function") {
                proxy.mapToProps = props;
                proxy.dependsOnOwnProps = getDependsOnOwnProps(props);
                props = proxy(stateOrDispatch, ownProps);
            }
            if ("TURBOPACK compile-time truthy", 1) verifyPlainObject(props, displayName, methodName);
            return props;
        };
        return proxy;
    };
}
// src/connect/invalidArgFactory.ts
function createInvalidArgFactory(arg, name) {
    return (dispatch, options)=>{
        throw new Error(`Invalid value of type ${typeof arg} for ${name} argument when connecting component ${options.wrappedComponentName}.`);
    };
}
// src/connect/mapDispatchToProps.ts
function mapDispatchToPropsFactory(mapDispatchToProps) {
    return mapDispatchToProps && typeof mapDispatchToProps === "object" ? wrapMapToPropsConstant((dispatch)=>// @ts-ignore
        bindActionCreators(mapDispatchToProps, dispatch)) : !mapDispatchToProps ? wrapMapToPropsConstant((dispatch)=>({
            dispatch
        })) : typeof mapDispatchToProps === "function" ? // @ts-ignore
    wrapMapToPropsFunc(mapDispatchToProps, "mapDispatchToProps") : createInvalidArgFactory(mapDispatchToProps, "mapDispatchToProps");
}
// src/connect/mapStateToProps.ts
function mapStateToPropsFactory(mapStateToProps) {
    return !mapStateToProps ? wrapMapToPropsConstant(()=>({})) : typeof mapStateToProps === "function" ? // @ts-ignore
    wrapMapToPropsFunc(mapStateToProps, "mapStateToProps") : createInvalidArgFactory(mapStateToProps, "mapStateToProps");
}
// src/connect/mergeProps.ts
function defaultMergeProps(stateProps, dispatchProps, ownProps) {
    return {
        ...ownProps,
        ...stateProps,
        ...dispatchProps
    };
}
function wrapMergePropsFunc(mergeProps) {
    return function initMergePropsProxy(dispatch, { displayName, areMergedPropsEqual }) {
        let hasRunOnce = false;
        let mergedProps;
        return function mergePropsProxy(stateProps, dispatchProps, ownProps) {
            const nextMergedProps = mergeProps(stateProps, dispatchProps, ownProps);
            if (hasRunOnce) {
                if (!areMergedPropsEqual(nextMergedProps, mergedProps)) mergedProps = nextMergedProps;
            } else {
                hasRunOnce = true;
                mergedProps = nextMergedProps;
                if ("TURBOPACK compile-time truthy", 1) verifyPlainObject(mergedProps, displayName, "mergeProps");
            }
            return mergedProps;
        };
    };
}
function mergePropsFactory(mergeProps) {
    return !mergeProps ? ()=>defaultMergeProps : typeof mergeProps === "function" ? wrapMergePropsFunc(mergeProps) : createInvalidArgFactory(mergeProps, "mergeProps");
}
// src/utils/batch.ts
function defaultNoopBatch(callback) {
    callback();
}
// src/utils/Subscription.ts
function createListenerCollection() {
    let first = null;
    let last = null;
    return {
        clear () {
            first = null;
            last = null;
        },
        notify () {
            defaultNoopBatch(()=>{
                let listener = first;
                while(listener){
                    listener.callback();
                    listener = listener.next;
                }
            });
        },
        get () {
            const listeners = [];
            let listener = first;
            while(listener){
                listeners.push(listener);
                listener = listener.next;
            }
            return listeners;
        },
        subscribe (callback) {
            let isSubscribed = true;
            const listener = last = {
                callback,
                next: null,
                prev: last
            };
            if (listener.prev) {
                listener.prev.next = listener;
            } else {
                first = listener;
            }
            return function unsubscribe() {
                if (!isSubscribed || first === null) return;
                isSubscribed = false;
                if (listener.next) {
                    listener.next.prev = listener.prev;
                } else {
                    last = listener.prev;
                }
                if (listener.prev) {
                    listener.prev.next = listener.next;
                } else {
                    first = listener.next;
                }
            };
        }
    };
}
var nullListeners = {
    notify () {},
    get: ()=>[]
};
function createSubscription(store, parentSub) {
    let unsubscribe;
    let listeners = nullListeners;
    let subscriptionsAmount = 0;
    let selfSubscribed = false;
    function addNestedSub(listener) {
        trySubscribe();
        const cleanupListener = listeners.subscribe(listener);
        let removed = false;
        return ()=>{
            if (!removed) {
                removed = true;
                cleanupListener();
                tryUnsubscribe();
            }
        };
    }
    function notifyNestedSubs() {
        listeners.notify();
    }
    function handleChangeWrapper() {
        if (subscription.onStateChange) {
            subscription.onStateChange();
        }
    }
    function isSubscribed() {
        return selfSubscribed;
    }
    function trySubscribe() {
        subscriptionsAmount++;
        if (!unsubscribe) {
            unsubscribe = parentSub ? parentSub.addNestedSub(handleChangeWrapper) : store.subscribe(handleChangeWrapper);
            listeners = createListenerCollection();
        }
    }
    function tryUnsubscribe() {
        subscriptionsAmount--;
        if (unsubscribe && subscriptionsAmount === 0) {
            unsubscribe();
            unsubscribe = void 0;
            listeners.clear();
            listeners = nullListeners;
        }
    }
    function trySubscribeSelf() {
        if (!selfSubscribed) {
            selfSubscribed = true;
            trySubscribe();
        }
    }
    function tryUnsubscribeSelf() {
        if (selfSubscribed) {
            selfSubscribed = false;
            tryUnsubscribe();
        }
    }
    const subscription = {
        addNestedSub,
        notifyNestedSubs,
        handleChangeWrapper,
        isSubscribed,
        trySubscribe: trySubscribeSelf,
        tryUnsubscribe: tryUnsubscribeSelf,
        getListeners: ()=>listeners
    };
    return subscription;
}
// src/utils/useIsomorphicLayoutEffect.ts
var canUseDOM = ()=>!!(typeof window !== "undefined" && typeof window.document !== "undefined" && typeof window.document.createElement !== "undefined");
var isDOM = /* @__PURE__ */ canUseDOM();
var isRunningInReactNative = ()=>typeof navigator !== "undefined" && navigator.product === "ReactNative";
var isReactNative = /* @__PURE__ */ isRunningInReactNative();
var getUseIsomorphicLayoutEffect = ()=>isDOM || isReactNative ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useLayoutEffect"] : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"];
var useIsomorphicLayoutEffect = /* @__PURE__ */ getUseIsomorphicLayoutEffect();
// src/utils/shallowEqual.ts
function is(x, y) {
    if (x === y) {
        return x !== 0 || y !== 0 || 1 / x === 1 / y;
    } else {
        return x !== x && y !== y;
    }
}
function shallowEqual(objA, objB) {
    if (is(objA, objB)) return true;
    if (typeof objA !== "object" || objA === null || typeof objB !== "object" || objB === null) {
        return false;
    }
    const keysA = Object.keys(objA);
    const keysB = Object.keys(objB);
    if (keysA.length !== keysB.length) return false;
    for(let i = 0; i < keysA.length; i++){
        if (!Object.prototype.hasOwnProperty.call(objB, keysA[i]) || !is(objA[keysA[i]], objB[keysA[i]])) {
            return false;
        }
    }
    return true;
}
// src/utils/hoistStatics.ts
var REACT_STATICS = {
    childContextTypes: true,
    contextType: true,
    contextTypes: true,
    defaultProps: true,
    displayName: true,
    getDefaultProps: true,
    getDerivedStateFromError: true,
    getDerivedStateFromProps: true,
    mixins: true,
    propTypes: true,
    type: true
};
var KNOWN_STATICS = {
    name: true,
    length: true,
    prototype: true,
    caller: true,
    callee: true,
    arguments: true,
    arity: true
};
var FORWARD_REF_STATICS = {
    $$typeof: true,
    render: true,
    defaultProps: true,
    displayName: true,
    propTypes: true
};
var MEMO_STATICS = {
    $$typeof: true,
    compare: true,
    defaultProps: true,
    displayName: true,
    propTypes: true,
    type: true
};
var TYPE_STATICS = {
    [ForwardRef]: FORWARD_REF_STATICS,
    [Memo]: MEMO_STATICS
};
function getStatics(component) {
    if (isMemo(component)) {
        return MEMO_STATICS;
    }
    return TYPE_STATICS[component["$$typeof"]] || REACT_STATICS;
}
var defineProperty = Object.defineProperty;
var getOwnPropertyNames = Object.getOwnPropertyNames;
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor;
var getPrototypeOf = Object.getPrototypeOf;
var objectPrototype = Object.prototype;
function hoistNonReactStatics(targetComponent, sourceComponent) {
    if (typeof sourceComponent !== "string") {
        if (objectPrototype) {
            const inheritedComponent = getPrototypeOf(sourceComponent);
            if (inheritedComponent && inheritedComponent !== objectPrototype) {
                hoistNonReactStatics(targetComponent, inheritedComponent);
            }
        }
        let keys = getOwnPropertyNames(sourceComponent);
        if (getOwnPropertySymbols) {
            keys = keys.concat(getOwnPropertySymbols(sourceComponent));
        }
        const targetStatics = getStatics(targetComponent);
        const sourceStatics = getStatics(sourceComponent);
        for(let i = 0; i < keys.length; ++i){
            const key = keys[i];
            if (!KNOWN_STATICS[key] && !(sourceStatics && sourceStatics[key]) && !(targetStatics && targetStatics[key])) {
                const descriptor = getOwnPropertyDescriptor(sourceComponent, key);
                try {
                    defineProperty(targetComponent, key, descriptor);
                } catch (e) {}
            }
        }
    }
    return targetComponent;
}
// src/components/Context.ts
var ContextKey = /* @__PURE__ */ Symbol.for(`react-redux-context`);
var gT = typeof globalThis !== "undefined" ? globalThis : /* fall back to a per-module scope (pre-8.1 behaviour) if `globalThis` is not available */ {};
function getContext() {
    if (!__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"]) return {};
    const contextMap = gT[ContextKey] ??= /* @__PURE__ */ new Map();
    let realContext = contextMap.get(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"]);
    if (!realContext) {
        realContext = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"])(null);
        if ("TURBOPACK compile-time truthy", 1) {
            realContext.displayName = "ReactRedux";
        }
        contextMap.set(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createContext"], realContext);
    }
    return realContext;
}
var ReactReduxContext = /* @__PURE__ */ getContext();
// src/components/connect.tsx
var NO_SUBSCRIPTION_ARRAY = [
    null,
    null
];
var stringifyComponent = (Comp)=>{
    try {
        return JSON.stringify(Comp);
    } catch (err) {
        return String(Comp);
    }
};
function useIsomorphicLayoutEffectWithArgs(effectFunc, effectArgs, dependencies) {
    useIsomorphicLayoutEffect({
        "useIsomorphicLayoutEffectWithArgs.useIsomorphicLayoutEffect": ()=>effectFunc(...effectArgs)
    }["useIsomorphicLayoutEffectWithArgs.useIsomorphicLayoutEffect"], dependencies);
}
function captureWrapperProps(lastWrapperProps, lastChildProps, renderIsScheduled, wrapperProps, childPropsFromStoreUpdate, notifyNestedSubs) {
    lastWrapperProps.current = wrapperProps;
    renderIsScheduled.current = false;
    if (childPropsFromStoreUpdate.current) {
        childPropsFromStoreUpdate.current = null;
        notifyNestedSubs();
    }
}
function subscribeUpdates(shouldHandleStateChanges, store, subscription, childPropsSelector, lastWrapperProps, lastChildProps, renderIsScheduled, isMounted, childPropsFromStoreUpdate, notifyNestedSubs, additionalSubscribeListener) {
    if (!shouldHandleStateChanges) return ()=>{};
    let didUnsubscribe = false;
    let lastThrownError = null;
    const checkForUpdates = ()=>{
        if (didUnsubscribe || !isMounted.current) {
            return;
        }
        const latestStoreState = store.getState();
        let newChildProps, error;
        try {
            newChildProps = childPropsSelector(latestStoreState, lastWrapperProps.current);
        } catch (e) {
            error = e;
            lastThrownError = e;
        }
        if (!error) {
            lastThrownError = null;
        }
        if (newChildProps === lastChildProps.current) {
            if (!renderIsScheduled.current) {
                notifyNestedSubs();
            }
        } else {
            lastChildProps.current = newChildProps;
            childPropsFromStoreUpdate.current = newChildProps;
            renderIsScheduled.current = true;
            additionalSubscribeListener();
        }
    };
    subscription.onStateChange = checkForUpdates;
    subscription.trySubscribe();
    checkForUpdates();
    const unsubscribeWrapper = ()=>{
        didUnsubscribe = true;
        subscription.tryUnsubscribe();
        subscription.onStateChange = null;
        if (lastThrownError) {
            throw lastThrownError;
        }
    };
    return unsubscribeWrapper;
}
function strictEqual(a, b) {
    return a === b;
}
var hasWarnedAboutDeprecatedPureOption = false;
function connect(mapStateToProps, mapDispatchToProps, mergeProps, { // The `pure` option has been removed, so TS doesn't like us destructuring this to check its existence.
// @ts-ignore
pure, areStatesEqual = strictEqual, areOwnPropsEqual = shallowEqual, areStatePropsEqual = shallowEqual, areMergedPropsEqual = shallowEqual, // use React's forwardRef to expose a ref of the wrapped component
forwardRef = false, // the context consumer to use
context = ReactReduxContext } = {}) {
    if ("TURBOPACK compile-time truthy", 1) {
        if (pure !== void 0 && !hasWarnedAboutDeprecatedPureOption) {
            hasWarnedAboutDeprecatedPureOption = true;
            warning('The `pure` option has been removed. `connect` is now always a "pure/memoized" component');
        }
    }
    const Context = context;
    const initMapStateToProps = mapStateToPropsFactory(mapStateToProps);
    const initMapDispatchToProps = mapDispatchToPropsFactory(mapDispatchToProps);
    const initMergeProps = mergePropsFactory(mergeProps);
    const shouldHandleStateChanges = Boolean(mapStateToProps);
    const wrapWithConnect = (WrappedComponent)=>{
        if ("TURBOPACK compile-time truthy", 1) {
            const isValid = /* @__PURE__ */ isValidElementType(WrappedComponent);
            if (!isValid) throw new Error(`You must pass a component to the function returned by connect. Instead received ${stringifyComponent(WrappedComponent)}`);
        }
        const wrappedComponentName = WrappedComponent.displayName || WrappedComponent.name || "Component";
        const displayName = `Connect(${wrappedComponentName})`;
        const selectorFactoryOptions = {
            shouldHandleStateChanges,
            displayName,
            wrappedComponentName,
            WrappedComponent,
            // @ts-ignore
            initMapStateToProps,
            initMapDispatchToProps,
            initMergeProps,
            areStatesEqual,
            areStatePropsEqual,
            areOwnPropsEqual,
            areMergedPropsEqual
        };
        function ConnectFunction(props) {
            const [propsContext, reactReduxForwardedRef, wrapperProps] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
                "connect.wrapWithConnect.ConnectFunction.useMemo": ()=>{
                    const { reactReduxForwardedRef: reactReduxForwardedRef2, ...wrapperProps2 } = props;
                    return [
                        props.context,
                        reactReduxForwardedRef2,
                        wrapperProps2
                    ];
                }
            }["connect.wrapWithConnect.ConnectFunction.useMemo"], [
                props
            ]);
            const ContextToUse = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
                "connect.wrapWithConnect.ConnectFunction.useMemo[ContextToUse]": ()=>{
                    let ResultContext = Context;
                    if (propsContext?.Consumer) {
                        if ("TURBOPACK compile-time truthy", 1) {
                            const isValid = /* @__PURE__ */ isContextConsumer(// @ts-ignore
                            /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])(propsContext.Consumer, null));
                            if (!isValid) {
                                throw new Error("You must pass a valid React context consumer as `props.context`");
                            }
                            ResultContext = propsContext;
                        }
                    }
                    return ResultContext;
                }
            }["connect.wrapWithConnect.ConnectFunction.useMemo[ContextToUse]"], [
                propsContext,
                Context
            ]);
            const contextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(ContextToUse);
            const didStoreComeFromProps = Boolean(props.store) && Boolean(props.store.getState) && Boolean(props.store.dispatch);
            const didStoreComeFromContext = Boolean(contextValue) && Boolean(contextValue.store);
            if (("TURBOPACK compile-time value", "development") !== "production" && !didStoreComeFromProps && !didStoreComeFromContext) {
                throw new Error(`Could not find "store" in the context of "${displayName}". Either wrap the root component in a <Provider>, or pass a custom React context provider to <Provider> and the corresponding React context consumer to ${displayName} in connect options.`);
            }
            const store = didStoreComeFromProps ? props.store : contextValue.store;
            const getServerState = didStoreComeFromContext ? contextValue.getServerState : store.getState;
            const childPropsSelector = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
                "connect.wrapWithConnect.ConnectFunction.useMemo[childPropsSelector]": ()=>{
                    return finalPropsSelectorFactory(store.dispatch, selectorFactoryOptions);
                }
            }["connect.wrapWithConnect.ConnectFunction.useMemo[childPropsSelector]"], [
                store
            ]);
            const [subscription, notifyNestedSubs] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
                "connect.wrapWithConnect.ConnectFunction.useMemo": ()=>{
                    if (!shouldHandleStateChanges) return NO_SUBSCRIPTION_ARRAY;
                    const subscription2 = createSubscription(store, didStoreComeFromProps ? void 0 : contextValue.subscription);
                    const notifyNestedSubs2 = subscription2.notifyNestedSubs.bind(subscription2);
                    return [
                        subscription2,
                        notifyNestedSubs2
                    ];
                }
            }["connect.wrapWithConnect.ConnectFunction.useMemo"], [
                store,
                didStoreComeFromProps,
                contextValue
            ]);
            const overriddenContextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
                "connect.wrapWithConnect.ConnectFunction.useMemo[overriddenContextValue]": ()=>{
                    if (didStoreComeFromProps) {
                        return contextValue;
                    }
                    return {
                        ...contextValue,
                        subscription
                    };
                }
            }["connect.wrapWithConnect.ConnectFunction.useMemo[overriddenContextValue]"], [
                didStoreComeFromProps,
                contextValue,
                subscription
            ]);
            const lastChildProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(void 0);
            const lastWrapperProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(wrapperProps);
            const childPropsFromStoreUpdate = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(void 0);
            const renderIsScheduled = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
            const isMounted = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(false);
            const latestSubscriptionCallbackError = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(void 0);
            useIsomorphicLayoutEffect({
                "connect.wrapWithConnect.ConnectFunction.useIsomorphicLayoutEffect": ()=>{
                    isMounted.current = true;
                    return ({
                        "connect.wrapWithConnect.ConnectFunction.useIsomorphicLayoutEffect": ()=>{
                            isMounted.current = false;
                        }
                    })["connect.wrapWithConnect.ConnectFunction.useIsomorphicLayoutEffect"];
                }
            }["connect.wrapWithConnect.ConnectFunction.useIsomorphicLayoutEffect"], []);
            const actualChildPropsSelector = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
                "connect.wrapWithConnect.ConnectFunction.useMemo[actualChildPropsSelector]": ()=>{
                    const selector = {
                        "connect.wrapWithConnect.ConnectFunction.useMemo[actualChildPropsSelector].selector": ()=>{
                            if (childPropsFromStoreUpdate.current && wrapperProps === lastWrapperProps.current) {
                                return childPropsFromStoreUpdate.current;
                            }
                            return childPropsSelector(store.getState(), wrapperProps);
                        }
                    }["connect.wrapWithConnect.ConnectFunction.useMemo[actualChildPropsSelector].selector"];
                    return selector;
                }
            }["connect.wrapWithConnect.ConnectFunction.useMemo[actualChildPropsSelector]"], [
                store,
                wrapperProps
            ]);
            const subscribeForReact = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
                "connect.wrapWithConnect.ConnectFunction.useMemo[subscribeForReact]": ()=>{
                    const subscribe = {
                        "connect.wrapWithConnect.ConnectFunction.useMemo[subscribeForReact].subscribe": (reactListener)=>{
                            if (!subscription) {
                                return ({
                                    "connect.wrapWithConnect.ConnectFunction.useMemo[subscribeForReact].subscribe": ()=>{}
                                })["connect.wrapWithConnect.ConnectFunction.useMemo[subscribeForReact].subscribe"];
                            }
                            return subscribeUpdates(shouldHandleStateChanges, store, subscription, // @ts-ignore
                            childPropsSelector, lastWrapperProps, lastChildProps, renderIsScheduled, isMounted, childPropsFromStoreUpdate, notifyNestedSubs, reactListener);
                        }
                    }["connect.wrapWithConnect.ConnectFunction.useMemo[subscribeForReact].subscribe"];
                    return subscribe;
                }
            }["connect.wrapWithConnect.ConnectFunction.useMemo[subscribeForReact]"], [
                subscription
            ]);
            useIsomorphicLayoutEffectWithArgs(captureWrapperProps, [
                lastWrapperProps,
                lastChildProps,
                renderIsScheduled,
                wrapperProps,
                childPropsFromStoreUpdate,
                notifyNestedSubs
            ]);
            let actualChildProps;
            try {
                actualChildProps = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStore"])(// TODO We're passing through a big wrapper that does a bunch of extra side effects besides subscribing
                subscribeForReact, // TODO This is incredibly hacky. We've already processed the store update and calculated new child props,
                // TODO and we're just passing that through so it triggers a re-render for us rather than relying on `uSES`.
                actualChildPropsSelector, getServerState ? ({
                    "connect.wrapWithConnect.ConnectFunction.useSyncExternalStore": ()=>childPropsSelector(getServerState(), wrapperProps)
                })["connect.wrapWithConnect.ConnectFunction.useSyncExternalStore"] : actualChildPropsSelector);
            } catch (err) {
                if (latestSubscriptionCallbackError.current) {
                    ;
                    err.message += `
The error may be correlated with this previous error:
${latestSubscriptionCallbackError.current.stack}

`;
                }
                throw err;
            }
            useIsomorphicLayoutEffect({
                "connect.wrapWithConnect.ConnectFunction.useIsomorphicLayoutEffect": ()=>{
                    latestSubscriptionCallbackError.current = void 0;
                    childPropsFromStoreUpdate.current = void 0;
                    lastChildProps.current = actualChildProps;
                }
            }["connect.wrapWithConnect.ConnectFunction.useIsomorphicLayoutEffect"]);
            const renderedWrappedComponent = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
                "connect.wrapWithConnect.ConnectFunction.useMemo[renderedWrappedComponent]": ()=>{
                    return(// @ts-ignore
                    /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])(WrappedComponent, {
                        ...actualChildProps,
                        ref: reactReduxForwardedRef
                    }));
                }
            }["connect.wrapWithConnect.ConnectFunction.useMemo[renderedWrappedComponent]"], [
                reactReduxForwardedRef,
                WrappedComponent,
                actualChildProps
            ]);
            const renderedChild = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
                "connect.wrapWithConnect.ConnectFunction.useMemo[renderedChild]": ()=>{
                    if (shouldHandleStateChanges) {
                        return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])(ContextToUse.Provider, {
                            value: overriddenContextValue
                        }, renderedWrappedComponent);
                    }
                    return renderedWrappedComponent;
                }
            }["connect.wrapWithConnect.ConnectFunction.useMemo[renderedChild]"], [
                ContextToUse,
                renderedWrappedComponent,
                overriddenContextValue
            ]);
            return renderedChild;
        }
        const _Connect = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["memo"])(ConnectFunction);
        const Connect = _Connect;
        Connect.WrappedComponent = WrappedComponent;
        Connect.displayName = ConnectFunction.displayName = displayName;
        if (forwardRef) {
            const _forwarded = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(function forwardConnectRef(props, ref) {
                return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])(Connect, {
                    ...props,
                    reactReduxForwardedRef: ref
                });
            });
            const forwarded = _forwarded;
            forwarded.displayName = displayName;
            forwarded.WrappedComponent = WrappedComponent;
            return /* @__PURE__ */ hoistNonReactStatics(forwarded, WrappedComponent);
        }
        return /* @__PURE__ */ hoistNonReactStatics(Connect, WrappedComponent);
    };
    return wrapWithConnect;
}
var connect_default = connect;
// src/components/Provider.tsx
function Provider(providerProps) {
    const { children, context, serverState, store } = providerProps;
    const contextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Provider.useMemo[contextValue]": ()=>{
            const subscription = createSubscription(store);
            const baseContextValue = {
                store,
                subscription,
                getServerState: serverState ? ({
                    "Provider.useMemo[contextValue]": ()=>serverState
                })["Provider.useMemo[contextValue]"] : void 0
            };
            if ("TURBOPACK compile-time falsy", 0) {
                "TURBOPACK unreachable";
            } else {
                const { identityFunctionCheck = "once", stabilityCheck = "once" } = providerProps;
                return /* @__PURE__ */ Object.assign(baseContextValue, {
                    stabilityCheck,
                    identityFunctionCheck
                });
            }
        }
    }["Provider.useMemo[contextValue]"], [
        store,
        serverState
    ]);
    const previousState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useMemo"])({
        "Provider.useMemo[previousState]": ()=>store.getState()
    }["Provider.useMemo[previousState]"], [
        store
    ]);
    useIsomorphicLayoutEffect({
        "Provider.useIsomorphicLayoutEffect": ()=>{
            const { subscription } = contextValue;
            subscription.onStateChange = subscription.notifyNestedSubs;
            subscription.trySubscribe();
            if (previousState !== store.getState()) {
                subscription.notifyNestedSubs();
            }
            return ({
                "Provider.useIsomorphicLayoutEffect": ()=>{
                    subscription.tryUnsubscribe();
                    subscription.onStateChange = void 0;
                }
            })["Provider.useIsomorphicLayoutEffect"];
        }
    }["Provider.useIsomorphicLayoutEffect"], [
        contextValue,
        previousState
    ]);
    const Context = context || ReactReduxContext;
    return /* @__PURE__ */ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])(Context.Provider, {
        value: contextValue
    }, children);
}
var Provider_default = Provider;
// src/hooks/useReduxContext.ts
function createReduxContextHook(context = ReactReduxContext) {
    return function useReduxContext2() {
        const contextValue = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useContext"])(context);
        if (("TURBOPACK compile-time value", "development") !== "production" && !contextValue) {
            throw new Error("could not find react-redux context value; please ensure the component is wrapped in a <Provider>");
        }
        return contextValue;
    };
}
var useReduxContext = /* @__PURE__ */ createReduxContextHook();
// src/hooks/useStore.ts
function createStoreHook(context = ReactReduxContext) {
    const useReduxContext2 = context === ReactReduxContext ? useReduxContext : // @ts-ignore
    createReduxContextHook(context);
    const useStore2 = ()=>{
        const { store } = useReduxContext2();
        return store;
    };
    Object.assign(useStore2, {
        withTypes: ()=>useStore2
    });
    return useStore2;
}
var useStore = /* @__PURE__ */ createStoreHook();
// src/hooks/useDispatch.ts
function createDispatchHook(context = ReactReduxContext) {
    const useStore2 = context === ReactReduxContext ? useStore : createStoreHook(context);
    const useDispatch2 = ()=>{
        const store = useStore2();
        return store.dispatch;
    };
    Object.assign(useDispatch2, {
        withTypes: ()=>useDispatch2
    });
    return useDispatch2;
}
var useDispatch = /* @__PURE__ */ createDispatchHook();
;
var refEquality = (a, b)=>a === b;
function createSelectorHook(context = ReactReduxContext) {
    const useReduxContext2 = context === ReactReduxContext ? useReduxContext : createReduxContextHook(context);
    const useSelector2 = (selector, equalityFnOrOptions = {})=>{
        const { equalityFn = refEquality } = typeof equalityFnOrOptions === "function" ? {
            equalityFn: equalityFnOrOptions
        } : equalityFnOrOptions;
        if ("TURBOPACK compile-time truthy", 1) {
            if (!selector) {
                throw new Error(`You must pass a selector to useSelector`);
            }
            if (typeof selector !== "function") {
                throw new Error(`You must pass a function as a selector to useSelector`);
            }
            if (typeof equalityFn !== "function") {
                throw new Error(`You must pass a function as an equality function to useSelector`);
            }
        }
        const reduxContext = useReduxContext2();
        const { store, subscription, getServerState } = reduxContext;
        const firstRun = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(true);
        const wrappedSelector = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useCallback"])({
            [selector.name] (state) {
                const selected = selector(state);
                if ("TURBOPACK compile-time truthy", 1) {
                    const { devModeChecks = {} } = typeof equalityFnOrOptions === "function" ? {} : equalityFnOrOptions;
                    const { identityFunctionCheck, stabilityCheck } = reduxContext;
                    const { identityFunctionCheck: finalIdentityFunctionCheck, stabilityCheck: finalStabilityCheck } = {
                        stabilityCheck,
                        identityFunctionCheck,
                        ...devModeChecks
                    };
                    if (finalStabilityCheck === "always" || finalStabilityCheck === "once" && firstRun.current) {
                        const toCompare = selector(state);
                        if (!equalityFn(selected, toCompare)) {
                            let stack = void 0;
                            try {
                                throw new Error();
                            } catch (e) {
                                ;
                                ({ stack } = e);
                            }
                            console.warn("Selector " + (selector.name || "unknown") + " returned a different result when called with the same parameters. This can lead to unnecessary rerenders.\nSelectors that return a new reference (such as an object or an array) should be memoized: https://redux.js.org/usage/deriving-data-selectors#optimizing-selectors-with-memoization", {
                                state,
                                selected,
                                selected2: toCompare,
                                stack
                            });
                        }
                    }
                    if (finalIdentityFunctionCheck === "always" || finalIdentityFunctionCheck === "once" && firstRun.current) {
                        if (selected === state) {
                            let stack = void 0;
                            try {
                                throw new Error();
                            } catch (e) {
                                ;
                                ({ stack } = e);
                            }
                            console.warn("Selector " + (selector.name || "unknown") + " returned the root state when called. This can lead to unnecessary rerenders.\nSelectors that return the entire state are almost certainly a mistake, as they will cause a rerender whenever *anything* in state changes.", {
                                stack
                            });
                        }
                    }
                    if (firstRun.current) firstRun.current = false;
                }
                return selected;
            }
        }[selector.name], [
            selector
        ]);
        const selectedState = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$use$2d$sync$2d$external$2d$store$2f$with$2d$selector$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useSyncExternalStoreWithSelector"])(subscription.addNestedSub, store.getState, getServerState || store.getState, wrappedSelector, equalityFn);
        (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useDebugValue"])(selectedState);
        return selectedState;
    };
    Object.assign(useSelector2, {
        withTypes: ()=>useSelector2
    });
    return useSelector2;
}
var useSelector = /* @__PURE__ */ createSelectorHook();
// src/exports.ts
var batch = defaultNoopBatch;
;
 //# sourceMappingURL=react-redux.mjs.map
}}),
"[project]/apps/web/node_modules/redux-persist/es/integration/react.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "PersistGate": (()=>PersistGate)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)"); // eslint-disable-line import/no-unresolved
function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof(obj) {
            return typeof obj;
        };
    } else {
        _typeof = function _typeof(obj) {
            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
    }
    return _typeof(obj);
}
function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
        throw new TypeError("Cannot call a class as a function");
    }
}
function _defineProperties(target, props) {
    for(var i = 0; i < props.length; i++){
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
    }
}
function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
}
function _possibleConstructorReturn(self, call) {
    if (call && (_typeof(call) === "object" || typeof call === "function")) {
        return call;
    }
    return _assertThisInitialized(self);
}
function _getPrototypeOf(o) {
    _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) {
        return o.__proto__ || Object.getPrototypeOf(o);
    };
    return _getPrototypeOf(o);
}
function _assertThisInitialized(self) {
    if (self === void 0) {
        throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }
    return self;
}
function _inherits(subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
        throw new TypeError("Super expression must either be null or a function");
    }
    subClass.prototype = Object.create(superClass && superClass.prototype, {
        constructor: {
            value: subClass,
            writable: true,
            configurable: true
        }
    });
    if (superClass) _setPrototypeOf(subClass, superClass);
}
function _setPrototypeOf(o, p) {
    _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) {
        o.__proto__ = p;
        return o;
    };
    return _setPrototypeOf(o, p);
}
function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
;
var PersistGate = /*#__PURE__*/ function(_PureComponent) {
    _inherits(PersistGate, _PureComponent);
    function PersistGate() {
        var _getPrototypeOf2;
        var _this;
        _classCallCheck(this, PersistGate);
        for(var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++){
            args[_key] = arguments[_key];
        }
        _this = _possibleConstructorReturn(this, (_getPrototypeOf2 = _getPrototypeOf(PersistGate)).call.apply(_getPrototypeOf2, [
            this
        ].concat(args)));
        _defineProperty(_assertThisInitialized(_this), "state", {
            bootstrapped: false
        });
        _defineProperty(_assertThisInitialized(_this), "_unsubscribe", void 0);
        _defineProperty(_assertThisInitialized(_this), "handlePersistorState", function() {
            var persistor = _this.props.persistor;
            var _persistor$getState = persistor.getState(), bootstrapped = _persistor$getState.bootstrapped;
            if (bootstrapped) {
                if (_this.props.onBeforeLift) {
                    Promise.resolve(_this.props.onBeforeLift()).finally(function() {
                        return _this.setState({
                            bootstrapped: true
                        });
                    });
                } else {
                    _this.setState({
                        bootstrapped: true
                    });
                }
                _this._unsubscribe && _this._unsubscribe();
            }
        });
        return _this;
    }
    _createClass(PersistGate, [
        {
            key: "componentDidMount",
            value: function componentDidMount() {
                this._unsubscribe = this.props.persistor.subscribe(this.handlePersistorState);
                this.handlePersistorState();
            }
        },
        {
            key: "componentWillUnmount",
            value: function componentWillUnmount() {
                this._unsubscribe && this._unsubscribe();
            }
        },
        {
            key: "render",
            value: function render() {
                if ("TURBOPACK compile-time truthy", 1) {
                    if (typeof this.props.children === 'function' && this.props.loading) console.error('redux-persist: PersistGate expects either a function child or loading prop, but not both. The loading prop will be ignored.');
                }
                if (typeof this.props.children === 'function') {
                    return this.props.children(this.state.bootstrapped);
                }
                return this.state.bootstrapped ? this.props.children : this.props.loading;
            }
        }
    ]);
    return PersistGate;
}(__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PureComponent"]);
_defineProperty(PersistGate, "defaultProps", {
    children: null,
    loading: null
});
}}),
"[project]/apps/web/node_modules/redux-persist/es/constants.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "DEFAULT_VERSION": (()=>DEFAULT_VERSION),
    "FLUSH": (()=>FLUSH),
    "KEY_PREFIX": (()=>KEY_PREFIX),
    "PAUSE": (()=>PAUSE),
    "PERSIST": (()=>PERSIST),
    "PURGE": (()=>PURGE),
    "REGISTER": (()=>REGISTER),
    "REHYDRATE": (()=>REHYDRATE)
});
var KEY_PREFIX = 'persist:';
var FLUSH = 'persist/FLUSH';
var REHYDRATE = 'persist/REHYDRATE';
var PAUSE = 'persist/PAUSE';
var PERSIST = 'persist/PERSIST';
var PURGE = 'persist/PURGE';
var REGISTER = 'persist/REGISTER';
var DEFAULT_VERSION = -1;
}}),
"[project]/apps/web/node_modules/redux-persist/es/stateReconciler/autoMergeLevel1.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>autoMergeLevel1)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof(obj) {
            return typeof obj;
        };
    } else {
        _typeof = function _typeof(obj) {
            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
    }
    return _typeof(obj);
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) symbols = symbols.filter(function(sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _objectSpread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        if (i % 2) {
            ownKeys(source, true).forEach(function(key) {
                _defineProperty(target, key, source[key]);
            });
        } else if (Object.getOwnPropertyDescriptors) {
            Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
        } else {
            ownKeys(source).forEach(function(key) {
                Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
            });
        }
    }
    return target;
}
function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function autoMergeLevel1(inboundState, originalState, reducedState, _ref) {
    var debug = _ref.debug;
    var newState = _objectSpread({}, reducedState); // only rehydrate if inboundState exists and is an object
    if (inboundState && _typeof(inboundState) === 'object') {
        Object.keys(inboundState).forEach(function(key) {
            // ignore _persist data
            if (key === '_persist') return; // if reducer modifies substate, skip auto rehydration
            if (originalState[key] !== reducedState[key]) {
                if (("TURBOPACK compile-time value", "development") !== 'production' && debug) console.log('redux-persist/stateReconciler: sub state for key `%s` modified, skipping.', key);
                return;
            } // otherwise hard set the new value
            newState[key] = inboundState[key];
        });
    }
    if (("TURBOPACK compile-time value", "development") !== 'production' && debug && inboundState && _typeof(inboundState) === 'object') console.log("redux-persist/stateReconciler: rehydrated keys '".concat(Object.keys(inboundState).join(', '), "'"));
    return newState;
}
}}),
"[project]/apps/web/node_modules/redux-persist/es/createPersistoid.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>createPersistoid)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/constants.js [app-client] (ecmascript)");
;
function createPersistoid(config) {
    // defaults
    var blacklist = config.blacklist || null;
    var whitelist = config.whitelist || null;
    var transforms = config.transforms || [];
    var throttle = config.throttle || 0;
    var storageKey = "".concat(config.keyPrefix !== undefined ? config.keyPrefix : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KEY_PREFIX"]).concat(config.key);
    var storage = config.storage;
    var serialize;
    if (config.serialize === false) {
        serialize = function serialize(x) {
            return x;
        };
    } else if (typeof config.serialize === 'function') {
        serialize = config.serialize;
    } else {
        serialize = defaultSerialize;
    }
    var writeFailHandler = config.writeFailHandler || null; // initialize stateful values
    var lastState = {};
    var stagedState = {};
    var keysToProcess = [];
    var timeIterator = null;
    var writePromise = null;
    var update = function update(state) {
        // add any changed keys to the queue
        Object.keys(state).forEach(function(key) {
            if (!passWhitelistBlacklist(key)) return; // is keyspace ignored? noop
            if (lastState[key] === state[key]) return; // value unchanged? noop
            if (keysToProcess.indexOf(key) !== -1) return; // is key already queued? noop
            keysToProcess.push(key); // add key to queue
        }); //if any key is missing in the new state which was present in the lastState,
        //add it for processing too
        Object.keys(lastState).forEach(function(key) {
            if (state[key] === undefined && passWhitelistBlacklist(key) && keysToProcess.indexOf(key) === -1 && lastState[key] !== undefined) {
                keysToProcess.push(key);
            }
        }); // start the time iterator if not running (read: throttle)
        if (timeIterator === null) {
            timeIterator = setInterval(processNextKey, throttle);
        }
        lastState = state;
    };
    function processNextKey() {
        if (keysToProcess.length === 0) {
            if (timeIterator) clearInterval(timeIterator);
            timeIterator = null;
            return;
        }
        var key = keysToProcess.shift();
        var endState = transforms.reduce(function(subState, transformer) {
            return transformer.in(subState, key, lastState);
        }, lastState[key]);
        if (endState !== undefined) {
            try {
                stagedState[key] = serialize(endState);
            } catch (err) {
                console.error('redux-persist/createPersistoid: error serializing state', err);
            }
        } else {
            //if the endState is undefined, no need to persist the existing serialized content
            delete stagedState[key];
        }
        if (keysToProcess.length === 0) {
            writeStagedState();
        }
    }
    function writeStagedState() {
        // cleanup any removed keys just before write.
        Object.keys(stagedState).forEach(function(key) {
            if (lastState[key] === undefined) {
                delete stagedState[key];
            }
        });
        writePromise = storage.setItem(storageKey, serialize(stagedState)).catch(onWriteFail);
    }
    function passWhitelistBlacklist(key) {
        if (whitelist && whitelist.indexOf(key) === -1 && key !== '_persist') return false;
        if (blacklist && blacklist.indexOf(key) !== -1) return false;
        return true;
    }
    function onWriteFail(err) {
        // @TODO add fail handlers (typically storage full)
        if (writeFailHandler) writeFailHandler(err);
        if (err && ("TURBOPACK compile-time value", "development") !== 'production') {
            console.error('Error storing data', err);
        }
    }
    var flush = function flush() {
        while(keysToProcess.length !== 0){
            processNextKey();
        }
        return writePromise || Promise.resolve();
    }; // return `persistoid`
    return {
        update: update,
        flush: flush
    };
} // @NOTE in the future this may be exposed via config
function defaultSerialize(data) {
    return JSON.stringify(data);
}
}}),
"[project]/apps/web/node_modules/redux-persist/es/getStoredState.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>getStoredState)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/constants.js [app-client] (ecmascript)");
;
function getStoredState(config) {
    var transforms = config.transforms || [];
    var storageKey = "".concat(config.keyPrefix !== undefined ? config.keyPrefix : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KEY_PREFIX"]).concat(config.key);
    var storage = config.storage;
    var debug = config.debug;
    var deserialize;
    if (config.deserialize === false) {
        deserialize = function deserialize(x) {
            return x;
        };
    } else if (typeof config.deserialize === 'function') {
        deserialize = config.deserialize;
    } else {
        deserialize = defaultDeserialize;
    }
    return storage.getItem(storageKey).then(function(serialized) {
        if (!serialized) return undefined;
        else {
            try {
                var state = {};
                var rawState = deserialize(serialized);
                Object.keys(rawState).forEach(function(key) {
                    state[key] = transforms.reduceRight(function(subState, transformer) {
                        return transformer.out(subState, key, rawState);
                    }, deserialize(rawState[key]));
                });
                return state;
            } catch (err) {
                if (("TURBOPACK compile-time value", "development") !== 'production' && debug) console.log("redux-persist/getStoredState: Error restoring data ".concat(serialized), err);
                throw err;
            }
        }
    });
}
function defaultDeserialize(serial) {
    return JSON.parse(serial);
}
}}),
"[project]/apps/web/node_modules/redux-persist/es/purgeStoredState.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>purgeStoredState)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/constants.js [app-client] (ecmascript)");
;
function purgeStoredState(config) {
    var storage = config.storage;
    var storageKey = "".concat(config.keyPrefix !== undefined ? config.keyPrefix : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["KEY_PREFIX"]).concat(config.key);
    return storage.removeItem(storageKey, warnIfRemoveError);
}
function warnIfRemoveError(err) {
    if (err && ("TURBOPACK compile-time value", "development") !== 'production') {
        console.error('redux-persist/purgeStoredState: Error purging data stored state', err);
    }
}
}}),
"[project]/apps/web/node_modules/redux-persist/es/persistReducer.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>persistReducer)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/constants.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$stateReconciler$2f$autoMergeLevel1$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/stateReconciler/autoMergeLevel1.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$createPersistoid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/createPersistoid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$getStoredState$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/getStoredState.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$purgeStoredState$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/purgeStoredState.js [app-client] (ecmascript)");
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) symbols = symbols.filter(function(sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _objectSpread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        if (i % 2) {
            ownKeys(source, true).forEach(function(key) {
                _defineProperty(target, key, source[key]);
            });
        } else if (Object.getOwnPropertyDescriptors) {
            Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
        } else {
            ownKeys(source).forEach(function(key) {
                Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
            });
        }
    }
    return target;
}
function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function _objectWithoutProperties(source, excluded) {
    if (source == null) return {};
    var target = _objectWithoutPropertiesLoose(source, excluded);
    var key, i;
    if (Object.getOwnPropertySymbols) {
        var sourceSymbolKeys = Object.getOwnPropertySymbols(source);
        for(i = 0; i < sourceSymbolKeys.length; i++){
            key = sourceSymbolKeys[i];
            if (excluded.indexOf(key) >= 0) continue;
            if (!Object.prototype.propertyIsEnumerable.call(source, key)) continue;
            target[key] = source[key];
        }
    }
    return target;
}
function _objectWithoutPropertiesLoose(source, excluded) {
    if (source == null) return {};
    var target = {};
    var sourceKeys = Object.keys(source);
    var key, i;
    for(i = 0; i < sourceKeys.length; i++){
        key = sourceKeys[i];
        if (excluded.indexOf(key) >= 0) continue;
        target[key] = source[key];
    }
    return target;
}
;
;
;
;
;
var DEFAULT_TIMEOUT = 5000;
function persistReducer(config, baseReducer) {
    if ("TURBOPACK compile-time truthy", 1) {
        if (!config) throw new Error('config is required for persistReducer');
        if (!config.key) throw new Error('key is required in persistor config');
        if (!config.storage) throw new Error("redux-persist: config.storage is required. Try using one of the provided storage engines `import storage from 'redux-persist/lib/storage'`");
    }
    var version = config.version !== undefined ? config.version : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_VERSION"];
    var debug = config.debug || false;
    var stateReconciler = config.stateReconciler === undefined ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$stateReconciler$2f$autoMergeLevel1$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] : config.stateReconciler;
    var getStoredState = config.getStoredState || __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$getStoredState$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"];
    var timeout = config.timeout !== undefined ? config.timeout : DEFAULT_TIMEOUT;
    var _persistoid = null;
    var _purge = false;
    var _paused = true;
    var conditionalUpdate = function conditionalUpdate(state) {
        // update the persistoid only if we are rehydrated and not paused
        state._persist.rehydrated && _persistoid && !_paused && _persistoid.update(state);
        return state;
    };
    return function(state, action) {
        var _ref = state || {}, _persist = _ref._persist, rest = _objectWithoutProperties(_ref, [
            "_persist"
        ]); // $FlowIgnore need to update State type
        var restState = rest;
        if (action.type === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PERSIST"]) {
            var _sealed = false;
            var _rehydrate = function _rehydrate(payload, err) {
                // dev warning if we are already sealed
                if (("TURBOPACK compile-time value", "development") !== 'production' && _sealed) console.error("redux-persist: rehydrate for \"".concat(config.key, "\" called after timeout."), payload, err); // only rehydrate if we are not already sealed
                if (!_sealed) {
                    action.rehydrate(config.key, payload, err);
                    _sealed = true;
                }
            };
            timeout && setTimeout(function() {
                !_sealed && _rehydrate(undefined, new Error("redux-persist: persist timed out for persist key \"".concat(config.key, "\"")));
            }, timeout); // @NOTE PERSIST resumes if paused.
            _paused = false; // @NOTE only ever create persistoid once, ensure we call it at least once, even if _persist has already been set
            if (!_persistoid) _persistoid = (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$createPersistoid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(config); // @NOTE PERSIST can be called multiple times, noop after the first
            if (_persist) {
                // We still need to call the base reducer because there might be nested
                // uses of persistReducer which need to be aware of the PERSIST action
                return _objectSpread({}, baseReducer(restState, action), {
                    _persist: _persist
                });
            }
            if (typeof action.rehydrate !== 'function' || typeof action.register !== 'function') throw new Error('redux-persist: either rehydrate or register is not a function on the PERSIST action. This can happen if the action is being replayed. This is an unexplored use case, please open an issue and we will figure out a resolution.');
            action.register(config.key);
            getStoredState(config).then(function(restoredState) {
                var migrate = config.migrate || function(s, v) {
                    return Promise.resolve(s);
                };
                migrate(restoredState, version).then(function(migratedState) {
                    _rehydrate(migratedState);
                }, function(migrateErr) {
                    if (("TURBOPACK compile-time value", "development") !== 'production' && migrateErr) console.error('redux-persist: migration error', migrateErr);
                    _rehydrate(undefined, migrateErr);
                });
            }, function(err) {
                _rehydrate(undefined, err);
            });
            return _objectSpread({}, baseReducer(restState, action), {
                _persist: {
                    version: version,
                    rehydrated: false
                }
            });
        } else if (action.type === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PURGE"]) {
            _purge = true;
            action.result((0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$purgeStoredState$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(config));
            return _objectSpread({}, baseReducer(restState, action), {
                _persist: _persist
            });
        } else if (action.type === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FLUSH"]) {
            action.result(_persistoid && _persistoid.flush());
            return _objectSpread({}, baseReducer(restState, action), {
                _persist: _persist
            });
        } else if (action.type === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PAUSE"]) {
            _paused = true;
        } else if (action.type === __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["REHYDRATE"]) {
            // noop on restState if purging
            if (_purge) return _objectSpread({}, restState, {
                _persist: _objectSpread({}, _persist, {
                    rehydrated: true
                }) // @NOTE if key does not match, will continue to default else below
            });
            if (action.key === config.key) {
                var reducedState = baseReducer(restState, action);
                var inboundState = action.payload; // only reconcile state if stateReconciler and inboundState are both defined
                var reconciledRest = stateReconciler !== false && inboundState !== undefined ? stateReconciler(inboundState, state, reducedState, config) : reducedState;
                var _newState = _objectSpread({}, reconciledRest, {
                    _persist: _objectSpread({}, _persist, {
                        rehydrated: true
                    })
                });
                return conditionalUpdate(_newState);
            }
        } // if we have not already handled PERSIST, straight passthrough
        if (!_persist) return baseReducer(state, action); // run base reducer:
        // is state modified ? return original : return updated
        var newState = baseReducer(restState, action);
        if (newState === restState) return state;
        return conditionalUpdate(_objectSpread({}, newState, {
            _persist: _persist
        }));
    };
}
}}),
"[project]/apps/web/node_modules/redux-persist/es/stateReconciler/autoMergeLevel2.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>autoMergeLevel2)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof(obj) {
            return typeof obj;
        };
    } else {
        _typeof = function _typeof(obj) {
            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
    }
    return _typeof(obj);
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) symbols = symbols.filter(function(sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _objectSpread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        if (i % 2) {
            ownKeys(source, true).forEach(function(key) {
                _defineProperty(target, key, source[key]);
            });
        } else if (Object.getOwnPropertyDescriptors) {
            Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
        } else {
            ownKeys(source).forEach(function(key) {
                Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
            });
        }
    }
    return target;
}
function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
function autoMergeLevel2(inboundState, originalState, reducedState, _ref) {
    var debug = _ref.debug;
    var newState = _objectSpread({}, reducedState); // only rehydrate if inboundState exists and is an object
    if (inboundState && _typeof(inboundState) === 'object') {
        Object.keys(inboundState).forEach(function(key) {
            // ignore _persist data
            if (key === '_persist') return; // if reducer modifies substate, skip auto rehydration
            if (originalState[key] !== reducedState[key]) {
                if (("TURBOPACK compile-time value", "development") !== 'production' && debug) console.log('redux-persist/stateReconciler: sub state for key `%s` modified, skipping.', key);
                return;
            }
            if (isPlainEnoughObject(reducedState[key])) {
                // if object is plain enough shallow merge the new values (hence "Level2")
                newState[key] = _objectSpread({}, newState[key], {}, inboundState[key]);
                return;
            } // otherwise hard set
            newState[key] = inboundState[key];
        });
    }
    if (("TURBOPACK compile-time value", "development") !== 'production' && debug && inboundState && _typeof(inboundState) === 'object') console.log("redux-persist/stateReconciler: rehydrated keys '".concat(Object.keys(inboundState).join(', '), "'"));
    return newState;
}
function isPlainEnoughObject(o) {
    return o !== null && !Array.isArray(o) && _typeof(o) === 'object';
}
}}),
"[project]/apps/web/node_modules/redux-persist/es/persistCombineReducers.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>persistCombineReducers)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$redux$2f$dist$2f$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/redux/dist/redux.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$persistReducer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/persistReducer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$stateReconciler$2f$autoMergeLevel2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/stateReconciler/autoMergeLevel2.js [app-client] (ecmascript)");
;
;
;
function persistCombineReducers(config, reducers) {
    config.stateReconciler = config.stateReconciler === undefined ? __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$stateReconciler$2f$autoMergeLevel2$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"] : config.stateReconciler;
    return (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$persistReducer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])(config, (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$redux$2f$dist$2f$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["combineReducers"])(reducers));
}
}}),
"[project]/apps/web/node_modules/redux-persist/es/persistStore.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>persistStore)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$redux$2f$dist$2f$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/redux/dist/redux.mjs [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/constants.js [app-client] (ecmascript)");
function _toConsumableArray(arr) {
    return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _nonIterableSpread();
}
function _nonIterableSpread() {
    throw new TypeError("Invalid attempt to spread non-iterable instance");
}
function _iterableToArray(iter) {
    if (Symbol.iterator in Object(iter) || Object.prototype.toString.call(iter) === "[object Arguments]") return Array.from(iter);
}
function _arrayWithoutHoles(arr) {
    if (Array.isArray(arr)) {
        for(var i = 0, arr2 = new Array(arr.length); i < arr.length; i++){
            arr2[i] = arr[i];
        }
        return arr2;
    }
}
function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
        var symbols = Object.getOwnPropertySymbols(object);
        if (enumerableOnly) symbols = symbols.filter(function(sym) {
            return Object.getOwnPropertyDescriptor(object, sym).enumerable;
        });
        keys.push.apply(keys, symbols);
    }
    return keys;
}
function _objectSpread(target) {
    for(var i = 1; i < arguments.length; i++){
        var source = arguments[i] != null ? arguments[i] : {};
        if (i % 2) {
            ownKeys(source, true).forEach(function(key) {
                _defineProperty(target, key, source[key]);
            });
        } else if (Object.getOwnPropertyDescriptors) {
            Object.defineProperties(target, Object.getOwnPropertyDescriptors(source));
        } else {
            ownKeys(source).forEach(function(key) {
                Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
            });
        }
    }
    return target;
}
function _defineProperty(obj, key, value) {
    if (key in obj) {
        Object.defineProperty(obj, key, {
            value: value,
            enumerable: true,
            configurable: true,
            writable: true
        });
    } else {
        obj[key] = value;
    }
    return obj;
}
;
;
var initialState = {
    registry: [],
    bootstrapped: false
};
var persistorReducer = function persistorReducer() {
    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
    var action = arguments.length > 1 ? arguments[1] : undefined;
    switch(action.type){
        case __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["REGISTER"]:
            return _objectSpread({}, state, {
                registry: [].concat(_toConsumableArray(state.registry), [
                    action.key
                ])
            });
        case __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["REHYDRATE"]:
            var firstIndex = state.registry.indexOf(action.key);
            var registry = _toConsumableArray(state.registry);
            registry.splice(firstIndex, 1);
            return _objectSpread({}, state, {
                registry: registry,
                bootstrapped: registry.length === 0
            });
        default:
            return state;
    }
};
function persistStore(store, options, cb) {
    // help catch incorrect usage of passing PersistConfig in as PersistorOptions
    if ("TURBOPACK compile-time truthy", 1) {
        var optionsToTest = options || {};
        var bannedKeys = [
            'blacklist',
            'whitelist',
            'transforms',
            'storage',
            'keyPrefix',
            'migrate'
        ];
        bannedKeys.forEach(function(k) {
            if (!!optionsToTest[k]) console.error("redux-persist: invalid option passed to persistStore: \"".concat(k, "\". You may be incorrectly passing persistConfig into persistStore, whereas it should be passed into persistReducer."));
        });
    }
    var boostrappedCb = cb || false;
    var _pStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$redux$2f$dist$2f$redux$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createStore"])(persistorReducer, initialState, options && options.enhancer ? options.enhancer : undefined);
    var register = function register(key) {
        _pStore.dispatch({
            type: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["REGISTER"],
            key: key
        });
    };
    var rehydrate = function rehydrate(key, payload, err) {
        var rehydrateAction = {
            type: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["REHYDRATE"],
            payload: payload,
            err: err,
            key: key // dispatch to `store` to rehydrate and `persistor` to track result
        };
        store.dispatch(rehydrateAction);
        _pStore.dispatch(rehydrateAction);
        if (boostrappedCb && persistor.getState().bootstrapped) {
            boostrappedCb();
            boostrappedCb = false;
        }
    };
    var persistor = _objectSpread({}, _pStore, {
        purge: function purge() {
            var results = [];
            store.dispatch({
                type: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PURGE"],
                result: function result(purgeResult) {
                    results.push(purgeResult);
                }
            });
            return Promise.all(results);
        },
        flush: function flush() {
            var results = [];
            store.dispatch({
                type: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["FLUSH"],
                result: function result(flushResult) {
                    results.push(flushResult);
                }
            });
            return Promise.all(results);
        },
        pause: function pause() {
            store.dispatch({
                type: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PAUSE"]
            });
        },
        persist: function persist() {
            store.dispatch({
                type: __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["PERSIST"],
                register: register,
                rehydrate: rehydrate
            });
        }
    });
    if (!(options && options.manualPersist)) {
        persistor.persist();
    }
    return persistor;
}
}}),
"[project]/apps/web/node_modules/redux-persist/es/createMigrate.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>createMigrate)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/constants.js [app-client] (ecmascript)");
;
function createMigrate(migrations, config) {
    var _ref = config || {}, debug = _ref.debug;
    return function(state, currentVersion) {
        if (!state) {
            if (("TURBOPACK compile-time value", "development") !== 'production' && debug) console.log('redux-persist: no inbound state, skipping migration');
            return Promise.resolve(undefined);
        }
        var inboundVersion = state._persist && state._persist.version !== undefined ? state._persist.version : __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["DEFAULT_VERSION"];
        if (inboundVersion === currentVersion) {
            if (("TURBOPACK compile-time value", "development") !== 'production' && debug) console.log('redux-persist: versions match, noop migration');
            return Promise.resolve(state);
        }
        if (inboundVersion > currentVersion) {
            if ("TURBOPACK compile-time truthy", 1) console.error('redux-persist: downgrading version is not supported');
            return Promise.resolve(state);
        }
        var migrationKeys = Object.keys(migrations).map(function(ver) {
            return parseInt(ver);
        }).filter(function(key) {
            return currentVersion >= key && key > inboundVersion;
        }).sort(function(a, b) {
            return a - b;
        });
        if (("TURBOPACK compile-time value", "development") !== 'production' && debug) console.log('redux-persist: migrationKeys', migrationKeys);
        try {
            var migratedState = migrationKeys.reduce(function(state, versionKey) {
                if (("TURBOPACK compile-time value", "development") !== 'production' && debug) console.log('redux-persist: running migration for versionKey', versionKey);
                return migrations[versionKey](state);
            }, state);
            return Promise.resolve(migratedState);
        } catch (err) {
            return Promise.reject(err);
        }
    };
}
}}),
"[project]/apps/web/node_modules/redux-persist/es/createTransform.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>createTransform)
});
function createTransform(inbound, outbound) {
    var config = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : {};
    var whitelist = config.whitelist || null;
    var blacklist = config.blacklist || null;
    function whitelistBlacklistCheck(key) {
        if (whitelist && whitelist.indexOf(key) === -1) return true;
        if (blacklist && blacklist.indexOf(key) !== -1) return true;
        return false;
    }
    return {
        in: function _in(state, key, fullState) {
            return !whitelistBlacklistCheck(key) && inbound ? inbound(state, key, fullState) : state;
        },
        out: function out(state, key, fullState) {
            return !whitelistBlacklistCheck(key) && outbound ? outbound(state, key, fullState) : state;
        }
    };
}
}}),
"[project]/apps/web/node_modules/redux-persist/es/index.js [app-client] (ecmascript) <locals>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$persistReducer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/persistReducer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$persistCombineReducers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/persistCombineReducers.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$persistStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/persistStore.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$createMigrate$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/createMigrate.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$createTransform$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/createTransform.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$getStoredState$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/getStoredState.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$createPersistoid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/createPersistoid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$purgeStoredState$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/purgeStoredState.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/constants.js [app-client] (ecmascript)");
;
;
;
;
;
;
;
;
;
}}),
"[project]/apps/web/node_modules/redux-persist/es/index.js [app-client] (ecmascript) <module evaluation>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$persistReducer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/persistReducer.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$persistCombineReducers$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/persistCombineReducers.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$persistStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/persistStore.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$createMigrate$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/createMigrate.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$createTransform$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/createTransform.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$getStoredState$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/getStoredState.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$createPersistoid$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/createPersistoid.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$purgeStoredState$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/purgeStoredState.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$constants$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/constants.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/index.js [app-client] (ecmascript) <locals>");
}}),
"[project]/apps/web/node_modules/redux-persist/es/persistStore.js [app-client] (ecmascript) <export default as persistStore>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "persistStore": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$persistStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$persistStore$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/persistStore.js [app-client] (ecmascript)");
}}),
"[project]/apps/web/node_modules/redux-persist/es/persistReducer.js [app-client] (ecmascript) <export default as persistReducer>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "persistReducer": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$persistReducer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$redux$2d$persist$2f$es$2f$persistReducer$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/redux-persist/es/persistReducer.js [app-client] (ecmascript)");
}}),
"[project]/apps/web/node_modules/redux-persist/lib/storage/getStorage.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
"use strict";
exports.__esModule = true;
exports.default = getStorage;
function _typeof(obj) {
    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
        _typeof = function _typeof(obj) {
            return typeof obj;
        };
    } else {
        _typeof = function _typeof(obj) {
            return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
        };
    }
    return _typeof(obj);
}
function noop() {}
var noopStorage = {
    getItem: noop,
    setItem: noop,
    removeItem: noop
};
function hasStorage(storageType) {
    if ((typeof self === "undefined" ? "undefined" : _typeof(self)) !== 'object' || !(storageType in self)) {
        return false;
    }
    try {
        var storage = self[storageType];
        var testKey = "redux-persist ".concat(storageType, " test");
        storage.setItem(testKey, 'test');
        storage.getItem(testKey);
        storage.removeItem(testKey);
    } catch (e) {
        if ("TURBOPACK compile-time truthy", 1) console.warn("redux-persist ".concat(storageType, " test failed, persistence will be disabled."));
        return false;
    }
    return true;
}
function getStorage(type) {
    var storageType = "".concat(type, "Storage");
    if (hasStorage(storageType)) return self[storageType];
    else {
        if ("TURBOPACK compile-time truthy", 1) {
            console.error("redux-persist failed to create sync storage. falling back to noop storage.");
        }
        return noopStorage;
    }
}
}}),
"[project]/apps/web/node_modules/redux-persist/lib/storage/createWebStorage.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
"use strict";
exports.__esModule = true;
exports.default = createWebStorage;
var _getStorage = _interopRequireDefault(__turbopack_context__.r("[project]/apps/web/node_modules/redux-persist/lib/storage/getStorage.js [app-client] (ecmascript)"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
function createWebStorage(type) {
    var storage = (0, _getStorage.default)(type);
    return {
        getItem: function getItem(key) {
            return new Promise(function(resolve, reject) {
                resolve(storage.getItem(key));
            });
        },
        setItem: function setItem(key, item) {
            return new Promise(function(resolve, reject) {
                resolve(storage.setItem(key, item));
            });
        },
        removeItem: function removeItem(key) {
            return new Promise(function(resolve, reject) {
                resolve(storage.removeItem(key));
            });
        }
    };
}
}}),
"[project]/apps/web/node_modules/redux-persist/lib/storage/index.js [app-client] (ecmascript)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
"use strict";
exports.__esModule = true;
exports.default = void 0;
var _createWebStorage = _interopRequireDefault(__turbopack_context__.r("[project]/apps/web/node_modules/redux-persist/lib/storage/createWebStorage.js [app-client] (ecmascript)"));
function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : {
        default: obj
    };
}
var _default = (0, _createWebStorage.default)('local');
exports.default = _default;
}}),
"[project]/node_modules/immer/dist/immer.mjs [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/utils/env.ts
__turbopack_context__.s({
    "Immer": (()=>Immer2),
    "applyPatches": (()=>applyPatches),
    "castDraft": (()=>castDraft),
    "castImmutable": (()=>castImmutable),
    "createDraft": (()=>createDraft),
    "current": (()=>current),
    "enableMapSet": (()=>enableMapSet),
    "enablePatches": (()=>enablePatches),
    "finishDraft": (()=>finishDraft),
    "freeze": (()=>freeze),
    "immerable": (()=>DRAFTABLE),
    "isDraft": (()=>isDraft),
    "isDraftable": (()=>isDraftable),
    "nothing": (()=>NOTHING),
    "original": (()=>original),
    "produce": (()=>produce),
    "produceWithPatches": (()=>produceWithPatches),
    "setAutoFreeze": (()=>setAutoFreeze),
    "setUseStrictShallowCopy": (()=>setUseStrictShallowCopy)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var NOTHING = Symbol.for("immer-nothing");
var DRAFTABLE = Symbol.for("immer-draftable");
var DRAFT_STATE = Symbol.for("immer-state");
// src/utils/errors.ts
var errors = ("TURBOPACK compile-time truthy", 1) ? [
    // All error codes, starting by 0:
    function(plugin) {
        return `The plugin for '${plugin}' has not been loaded into Immer. To enable the plugin, import and call \`enable${plugin}()\` when initializing your application.`;
    },
    function(thing) {
        return `produce can only be called on things that are draftable: plain objects, arrays, Map, Set or classes that are marked with '[immerable]: true'. Got '${thing}'`;
    },
    "This object has been frozen and should not be mutated",
    function(data) {
        return "Cannot use a proxy that has been revoked. Did you pass an object from inside an immer function to an async process? " + data;
    },
    "An immer producer returned a new value *and* modified its draft. Either return a new value *or* modify the draft.",
    "Immer forbids circular references",
    "The first or second argument to `produce` must be a function",
    "The third argument to `produce` must be a function or undefined",
    "First argument to `createDraft` must be a plain object, an array, or an immerable object",
    "First argument to `finishDraft` must be a draft returned by `createDraft`",
    function(thing) {
        return `'current' expects a draft, got: ${thing}`;
    },
    "Object.defineProperty() cannot be used on an Immer draft",
    "Object.setPrototypeOf() cannot be used on an Immer draft",
    "Immer only supports deleting array indices",
    "Immer only supports setting array indices and the 'length' property",
    function(thing) {
        return `'original' expects a draft, got: ${thing}`;
    }
] : ("TURBOPACK unreachable", undefined);
function die(error, ...args) {
    if ("TURBOPACK compile-time truthy", 1) {
        const e = errors[error];
        const msg = typeof e === "function" ? e.apply(null, args) : e;
        throw new Error(`[Immer] ${msg}`);
    }
    throw new Error(`[Immer] minified error nr: ${error}. Full error at: https://bit.ly/3cXEKWf`);
}
// src/utils/common.ts
var getPrototypeOf = Object.getPrototypeOf;
function isDraft(value) {
    return !!value && !!value[DRAFT_STATE];
}
function isDraftable(value) {
    if (!value) return false;
    return isPlainObject(value) || Array.isArray(value) || !!value[DRAFTABLE] || !!value.constructor?.[DRAFTABLE] || isMap(value) || isSet(value);
}
var objectCtorString = Object.prototype.constructor.toString();
function isPlainObject(value) {
    if (!value || typeof value !== "object") return false;
    const proto = getPrototypeOf(value);
    if (proto === null) {
        return true;
    }
    const Ctor = Object.hasOwnProperty.call(proto, "constructor") && proto.constructor;
    if (Ctor === Object) return true;
    return typeof Ctor == "function" && Function.toString.call(Ctor) === objectCtorString;
}
function original(value) {
    if (!isDraft(value)) die(15, value);
    return value[DRAFT_STATE].base_;
}
function each(obj, iter) {
    if (getArchtype(obj) === 0 /* Object */ ) {
        Reflect.ownKeys(obj).forEach((key)=>{
            iter(key, obj[key], obj);
        });
    } else {
        obj.forEach((entry, index)=>iter(index, entry, obj));
    }
}
function getArchtype(thing) {
    const state = thing[DRAFT_STATE];
    return state ? state.type_ : Array.isArray(thing) ? 1 /* Array */  : isMap(thing) ? 2 /* Map */  : isSet(thing) ? 3 /* Set */  : 0 /* Object */ ;
}
function has(thing, prop) {
    return getArchtype(thing) === 2 /* Map */  ? thing.has(prop) : Object.prototype.hasOwnProperty.call(thing, prop);
}
function get(thing, prop) {
    return getArchtype(thing) === 2 /* Map */  ? thing.get(prop) : thing[prop];
}
function set(thing, propOrOldValue, value) {
    const t = getArchtype(thing);
    if (t === 2 /* Map */ ) thing.set(propOrOldValue, value);
    else if (t === 3 /* Set */ ) {
        thing.add(value);
    } else thing[propOrOldValue] = value;
}
function is(x, y) {
    if (x === y) {
        return x !== 0 || 1 / x === 1 / y;
    } else {
        return x !== x && y !== y;
    }
}
function isMap(target) {
    return target instanceof Map;
}
function isSet(target) {
    return target instanceof Set;
}
function latest(state) {
    return state.copy_ || state.base_;
}
function shallowCopy(base, strict) {
    if (isMap(base)) {
        return new Map(base);
    }
    if (isSet(base)) {
        return new Set(base);
    }
    if (Array.isArray(base)) return Array.prototype.slice.call(base);
    const isPlain = isPlainObject(base);
    if (strict === true || strict === "class_only" && !isPlain) {
        const descriptors = Object.getOwnPropertyDescriptors(base);
        delete descriptors[DRAFT_STATE];
        let keys = Reflect.ownKeys(descriptors);
        for(let i = 0; i < keys.length; i++){
            const key = keys[i];
            const desc = descriptors[key];
            if (desc.writable === false) {
                desc.writable = true;
                desc.configurable = true;
            }
            if (desc.get || desc.set) descriptors[key] = {
                configurable: true,
                writable: true,
                // could live with !!desc.set as well here...
                enumerable: desc.enumerable,
                value: base[key]
            };
        }
        return Object.create(getPrototypeOf(base), descriptors);
    } else {
        const proto = getPrototypeOf(base);
        if (proto !== null && isPlain) {
            return {
                ...base
            };
        }
        const obj = Object.create(proto);
        return Object.assign(obj, base);
    }
}
function freeze(obj, deep = false) {
    if (isFrozen(obj) || isDraft(obj) || !isDraftable(obj)) return obj;
    if (getArchtype(obj) > 1) {
        obj.set = obj.add = obj.clear = obj.delete = dontMutateFrozenCollections;
    }
    Object.freeze(obj);
    if (deep) Object.entries(obj).forEach(([key, value])=>freeze(value, true));
    return obj;
}
function dontMutateFrozenCollections() {
    die(2);
}
function isFrozen(obj) {
    return Object.isFrozen(obj);
}
// src/utils/plugins.ts
var plugins = {};
function getPlugin(pluginKey) {
    const plugin = plugins[pluginKey];
    if (!plugin) {
        die(0, pluginKey);
    }
    return plugin;
}
function loadPlugin(pluginKey, implementation) {
    if (!plugins[pluginKey]) plugins[pluginKey] = implementation;
}
// src/core/scope.ts
var currentScope;
function getCurrentScope() {
    return currentScope;
}
function createScope(parent_, immer_) {
    return {
        drafts_: [],
        parent_,
        immer_,
        // Whenever the modified draft contains a draft from another scope, we
        // need to prevent auto-freezing so the unowned draft can be finalized.
        canAutoFreeze_: true,
        unfinalizedDrafts_: 0
    };
}
function usePatchesInScope(scope, patchListener) {
    if (patchListener) {
        getPlugin("Patches");
        scope.patches_ = [];
        scope.inversePatches_ = [];
        scope.patchListener_ = patchListener;
    }
}
function revokeScope(scope) {
    leaveScope(scope);
    scope.drafts_.forEach(revokeDraft);
    scope.drafts_ = null;
}
function leaveScope(scope) {
    if (scope === currentScope) {
        currentScope = scope.parent_;
    }
}
function enterScope(immer2) {
    return currentScope = createScope(currentScope, immer2);
}
function revokeDraft(draft) {
    const state = draft[DRAFT_STATE];
    if (state.type_ === 0 /* Object */  || state.type_ === 1 /* Array */ ) state.revoke_();
    else state.revoked_ = true;
}
// src/core/finalize.ts
function processResult(result, scope) {
    scope.unfinalizedDrafts_ = scope.drafts_.length;
    const baseDraft = scope.drafts_[0];
    const isReplaced = result !== void 0 && result !== baseDraft;
    if (isReplaced) {
        if (baseDraft[DRAFT_STATE].modified_) {
            revokeScope(scope);
            die(4);
        }
        if (isDraftable(result)) {
            result = finalize(scope, result);
            if (!scope.parent_) maybeFreeze(scope, result);
        }
        if (scope.patches_) {
            getPlugin("Patches").generateReplacementPatches_(baseDraft[DRAFT_STATE].base_, result, scope.patches_, scope.inversePatches_);
        }
    } else {
        result = finalize(scope, baseDraft, []);
    }
    revokeScope(scope);
    if (scope.patches_) {
        scope.patchListener_(scope.patches_, scope.inversePatches_);
    }
    return result !== NOTHING ? result : void 0;
}
function finalize(rootScope, value, path) {
    if (isFrozen(value)) return value;
    const state = value[DRAFT_STATE];
    if (!state) {
        each(value, (key, childValue)=>finalizeProperty(rootScope, state, value, key, childValue, path));
        return value;
    }
    if (state.scope_ !== rootScope) return value;
    if (!state.modified_) {
        maybeFreeze(rootScope, state.base_, true);
        return state.base_;
    }
    if (!state.finalized_) {
        state.finalized_ = true;
        state.scope_.unfinalizedDrafts_--;
        const result = state.copy_;
        let resultEach = result;
        let isSet2 = false;
        if (state.type_ === 3 /* Set */ ) {
            resultEach = new Set(result);
            result.clear();
            isSet2 = true;
        }
        each(resultEach, (key, childValue)=>finalizeProperty(rootScope, state, result, key, childValue, path, isSet2));
        maybeFreeze(rootScope, result, false);
        if (path && rootScope.patches_) {
            getPlugin("Patches").generatePatches_(state, path, rootScope.patches_, rootScope.inversePatches_);
        }
    }
    return state.copy_;
}
function finalizeProperty(rootScope, parentState, targetObject, prop, childValue, rootPath, targetIsSet) {
    if (("TURBOPACK compile-time value", "development") !== "production" && childValue === targetObject) die(5);
    if (isDraft(childValue)) {
        const path = rootPath && parentState && parentState.type_ !== 3 /* Set */  && // Set objects are atomic since they have no keys.
        !has(parentState.assigned_, prop) ? rootPath.concat(prop) : void 0;
        const res = finalize(rootScope, childValue, path);
        set(targetObject, prop, res);
        if (isDraft(res)) {
            rootScope.canAutoFreeze_ = false;
        } else return;
    } else if (targetIsSet) {
        targetObject.add(childValue);
    }
    if (isDraftable(childValue) && !isFrozen(childValue)) {
        if (!rootScope.immer_.autoFreeze_ && rootScope.unfinalizedDrafts_ < 1) {
            return;
        }
        finalize(rootScope, childValue);
        if ((!parentState || !parentState.scope_.parent_) && typeof prop !== "symbol" && Object.prototype.propertyIsEnumerable.call(targetObject, prop)) maybeFreeze(rootScope, childValue);
    }
}
function maybeFreeze(scope, value, deep = false) {
    if (!scope.parent_ && scope.immer_.autoFreeze_ && scope.canAutoFreeze_) {
        freeze(value, deep);
    }
}
// src/core/proxy.ts
function createProxyProxy(base, parent) {
    const isArray = Array.isArray(base);
    const state = {
        type_: isArray ? 1 /* Array */  : 0 /* Object */ ,
        // Track which produce call this is associated with.
        scope_: parent ? parent.scope_ : getCurrentScope(),
        // True for both shallow and deep changes.
        modified_: false,
        // Used during finalization.
        finalized_: false,
        // Track which properties have been assigned (true) or deleted (false).
        assigned_: {},
        // The parent draft state.
        parent_: parent,
        // The base state.
        base_: base,
        // The base proxy.
        draft_: null,
        // set below
        // The base copy with any updated values.
        copy_: null,
        // Called by the `produce` function.
        revoke_: null,
        isManual_: false
    };
    let target = state;
    let traps = objectTraps;
    if (isArray) {
        target = [
            state
        ];
        traps = arrayTraps;
    }
    const { revoke, proxy } = Proxy.revocable(target, traps);
    state.draft_ = proxy;
    state.revoke_ = revoke;
    return proxy;
}
var objectTraps = {
    get (state, prop) {
        if (prop === DRAFT_STATE) return state;
        const source = latest(state);
        if (!has(source, prop)) {
            return readPropFromProto(state, source, prop);
        }
        const value = source[prop];
        if (state.finalized_ || !isDraftable(value)) {
            return value;
        }
        if (value === peek(state.base_, prop)) {
            prepareCopy(state);
            return state.copy_[prop] = createProxy(value, state);
        }
        return value;
    },
    has (state, prop) {
        return prop in latest(state);
    },
    ownKeys (state) {
        return Reflect.ownKeys(latest(state));
    },
    set (state, prop, value) {
        const desc = getDescriptorFromProto(latest(state), prop);
        if (desc?.set) {
            desc.set.call(state.draft_, value);
            return true;
        }
        if (!state.modified_) {
            const current2 = peek(latest(state), prop);
            const currentState = current2?.[DRAFT_STATE];
            if (currentState && currentState.base_ === value) {
                state.copy_[prop] = value;
                state.assigned_[prop] = false;
                return true;
            }
            if (is(value, current2) && (value !== void 0 || has(state.base_, prop))) return true;
            prepareCopy(state);
            markChanged(state);
        }
        if (state.copy_[prop] === value && // special case: handle new props with value 'undefined'
        (value !== void 0 || prop in state.copy_) || // special case: NaN
        Number.isNaN(value) && Number.isNaN(state.copy_[prop])) return true;
        state.copy_[prop] = value;
        state.assigned_[prop] = true;
        return true;
    },
    deleteProperty (state, prop) {
        if (peek(state.base_, prop) !== void 0 || prop in state.base_) {
            state.assigned_[prop] = false;
            prepareCopy(state);
            markChanged(state);
        } else {
            delete state.assigned_[prop];
        }
        if (state.copy_) {
            delete state.copy_[prop];
        }
        return true;
    },
    // Note: We never coerce `desc.value` into an Immer draft, because we can't make
    // the same guarantee in ES5 mode.
    getOwnPropertyDescriptor (state, prop) {
        const owner = latest(state);
        const desc = Reflect.getOwnPropertyDescriptor(owner, prop);
        if (!desc) return desc;
        return {
            writable: true,
            configurable: state.type_ !== 1 /* Array */  || prop !== "length",
            enumerable: desc.enumerable,
            value: owner[prop]
        };
    },
    defineProperty () {
        die(11);
    },
    getPrototypeOf (state) {
        return getPrototypeOf(state.base_);
    },
    setPrototypeOf () {
        die(12);
    }
};
var arrayTraps = {};
each(objectTraps, (key, fn)=>{
    arrayTraps[key] = function() {
        arguments[0] = arguments[0][0];
        return fn.apply(this, arguments);
    };
});
arrayTraps.deleteProperty = function(state, prop) {
    if (("TURBOPACK compile-time value", "development") !== "production" && isNaN(parseInt(prop))) die(13);
    return arrayTraps.set.call(this, state, prop, void 0);
};
arrayTraps.set = function(state, prop, value) {
    if (("TURBOPACK compile-time value", "development") !== "production" && prop !== "length" && isNaN(parseInt(prop))) die(14);
    return objectTraps.set.call(this, state[0], prop, value, state[0]);
};
function peek(draft, prop) {
    const state = draft[DRAFT_STATE];
    const source = state ? latest(state) : draft;
    return source[prop];
}
function readPropFromProto(state, source, prop) {
    const desc = getDescriptorFromProto(source, prop);
    return desc ? `value` in desc ? desc.value : // This is a very special case, if the prop is a getter defined by the
    // prototype, we should invoke it with the draft as context!
    desc.get?.call(state.draft_) : void 0;
}
function getDescriptorFromProto(source, prop) {
    if (!(prop in source)) return void 0;
    let proto = getPrototypeOf(source);
    while(proto){
        const desc = Object.getOwnPropertyDescriptor(proto, prop);
        if (desc) return desc;
        proto = getPrototypeOf(proto);
    }
    return void 0;
}
function markChanged(state) {
    if (!state.modified_) {
        state.modified_ = true;
        if (state.parent_) {
            markChanged(state.parent_);
        }
    }
}
function prepareCopy(state) {
    if (!state.copy_) {
        state.copy_ = shallowCopy(state.base_, state.scope_.immer_.useStrictShallowCopy_);
    }
}
// src/core/immerClass.ts
var Immer2 = class {
    constructor(config){
        this.autoFreeze_ = true;
        this.useStrictShallowCopy_ = false;
        /**
     * The `produce` function takes a value and a "recipe function" (whose
     * return value often depends on the base state). The recipe function is
     * free to mutate its first argument however it wants. All mutations are
     * only ever applied to a __copy__ of the base state.
     *
     * Pass only a function to create a "curried producer" which relieves you
     * from passing the recipe function every time.
     *
     * Only plain objects and arrays are made mutable. All other objects are
     * considered uncopyable.
     *
     * Note: This function is __bound__ to its `Immer` instance.
     *
     * @param {any} base - the initial state
     * @param {Function} recipe - function that receives a proxy of the base state as first argument and which can be freely modified
     * @param {Function} patchListener - optional function that will be called with all the patches produced here
     * @returns {any} a new state, or the initial state if nothing was modified
     */ this.produce = (base, recipe, patchListener)=>{
            if (typeof base === "function" && typeof recipe !== "function") {
                const defaultBase = recipe;
                recipe = base;
                const self = this;
                return function curriedProduce(base2 = defaultBase, ...args) {
                    return self.produce(base2, (draft)=>recipe.call(this, draft, ...args));
                };
            }
            if (typeof recipe !== "function") die(6);
            if (patchListener !== void 0 && typeof patchListener !== "function") die(7);
            let result;
            if (isDraftable(base)) {
                const scope = enterScope(this);
                const proxy = createProxy(base, void 0);
                let hasError = true;
                try {
                    result = recipe(proxy);
                    hasError = false;
                } finally{
                    if (hasError) revokeScope(scope);
                    else leaveScope(scope);
                }
                usePatchesInScope(scope, patchListener);
                return processResult(result, scope);
            } else if (!base || typeof base !== "object") {
                result = recipe(base);
                if (result === void 0) result = base;
                if (result === NOTHING) result = void 0;
                if (this.autoFreeze_) freeze(result, true);
                if (patchListener) {
                    const p = [];
                    const ip = [];
                    getPlugin("Patches").generateReplacementPatches_(base, result, p, ip);
                    patchListener(p, ip);
                }
                return result;
            } else die(1, base);
        };
        this.produceWithPatches = (base, recipe)=>{
            if (typeof base === "function") {
                return (state, ...args)=>this.produceWithPatches(state, (draft)=>base(draft, ...args));
            }
            let patches, inversePatches;
            const result = this.produce(base, recipe, (p, ip)=>{
                patches = p;
                inversePatches = ip;
            });
            return [
                result,
                patches,
                inversePatches
            ];
        };
        if (typeof config?.autoFreeze === "boolean") this.setAutoFreeze(config.autoFreeze);
        if (typeof config?.useStrictShallowCopy === "boolean") this.setUseStrictShallowCopy(config.useStrictShallowCopy);
    }
    createDraft(base) {
        if (!isDraftable(base)) die(8);
        if (isDraft(base)) base = current(base);
        const scope = enterScope(this);
        const proxy = createProxy(base, void 0);
        proxy[DRAFT_STATE].isManual_ = true;
        leaveScope(scope);
        return proxy;
    }
    finishDraft(draft, patchListener) {
        const state = draft && draft[DRAFT_STATE];
        if (!state || !state.isManual_) die(9);
        const { scope_: scope } = state;
        usePatchesInScope(scope, patchListener);
        return processResult(void 0, scope);
    }
    /**
   * Pass true to automatically freeze all copies created by Immer.
   *
   * By default, auto-freezing is enabled.
   */ setAutoFreeze(value) {
        this.autoFreeze_ = value;
    }
    /**
   * Pass true to enable strict shallow copy.
   *
   * By default, immer does not copy the object descriptors such as getter, setter and non-enumrable properties.
   */ setUseStrictShallowCopy(value) {
        this.useStrictShallowCopy_ = value;
    }
    applyPatches(base, patches) {
        let i;
        for(i = patches.length - 1; i >= 0; i--){
            const patch = patches[i];
            if (patch.path.length === 0 && patch.op === "replace") {
                base = patch.value;
                break;
            }
        }
        if (i > -1) {
            patches = patches.slice(i + 1);
        }
        const applyPatchesImpl = getPlugin("Patches").applyPatches_;
        if (isDraft(base)) {
            return applyPatchesImpl(base, patches);
        }
        return this.produce(base, (draft)=>applyPatchesImpl(draft, patches));
    }
};
function createProxy(value, parent) {
    const draft = isMap(value) ? getPlugin("MapSet").proxyMap_(value, parent) : isSet(value) ? getPlugin("MapSet").proxySet_(value, parent) : createProxyProxy(value, parent);
    const scope = parent ? parent.scope_ : getCurrentScope();
    scope.drafts_.push(draft);
    return draft;
}
// src/core/current.ts
function current(value) {
    if (!isDraft(value)) die(10, value);
    return currentImpl(value);
}
function currentImpl(value) {
    if (!isDraftable(value) || isFrozen(value)) return value;
    const state = value[DRAFT_STATE];
    let copy;
    if (state) {
        if (!state.modified_) return state.base_;
        state.finalized_ = true;
        copy = shallowCopy(value, state.scope_.immer_.useStrictShallowCopy_);
    } else {
        copy = shallowCopy(value, true);
    }
    each(copy, (key, childValue)=>{
        set(copy, key, currentImpl(childValue));
    });
    if (state) {
        state.finalized_ = false;
    }
    return copy;
}
// src/plugins/patches.ts
function enablePatches() {
    const errorOffset = 16;
    if ("TURBOPACK compile-time truthy", 1) {
        errors.push('Sets cannot have "replace" patches.', function(op) {
            return "Unsupported patch operation: " + op;
        }, function(path) {
            return "Cannot apply patch, path doesn't resolve: " + path;
        }, "Patching reserved attributes like __proto__, prototype and constructor is not allowed");
    }
    const REPLACE = "replace";
    const ADD = "add";
    const REMOVE = "remove";
    function generatePatches_(state, basePath, patches, inversePatches) {
        switch(state.type_){
            case 0 /* Object */ :
            case 2 /* Map */ :
                return generatePatchesFromAssigned(state, basePath, patches, inversePatches);
            case 1 /* Array */ :
                return generateArrayPatches(state, basePath, patches, inversePatches);
            case 3 /* Set */ :
                return generateSetPatches(state, basePath, patches, inversePatches);
        }
    }
    function generateArrayPatches(state, basePath, patches, inversePatches) {
        let { base_, assigned_ } = state;
        let copy_ = state.copy_;
        if (copy_.length < base_.length) {
            ;
            [base_, copy_] = [
                copy_,
                base_
            ];
            [patches, inversePatches] = [
                inversePatches,
                patches
            ];
        }
        for(let i = 0; i < base_.length; i++){
            if (assigned_[i] && copy_[i] !== base_[i]) {
                const path = basePath.concat([
                    i
                ]);
                patches.push({
                    op: REPLACE,
                    path,
                    // Need to maybe clone it, as it can in fact be the original value
                    // due to the base/copy inversion at the start of this function
                    value: clonePatchValueIfNeeded(copy_[i])
                });
                inversePatches.push({
                    op: REPLACE,
                    path,
                    value: clonePatchValueIfNeeded(base_[i])
                });
            }
        }
        for(let i = base_.length; i < copy_.length; i++){
            const path = basePath.concat([
                i
            ]);
            patches.push({
                op: ADD,
                path,
                // Need to maybe clone it, as it can in fact be the original value
                // due to the base/copy inversion at the start of this function
                value: clonePatchValueIfNeeded(copy_[i])
            });
        }
        for(let i = copy_.length - 1; base_.length <= i; --i){
            const path = basePath.concat([
                i
            ]);
            inversePatches.push({
                op: REMOVE,
                path
            });
        }
    }
    function generatePatchesFromAssigned(state, basePath, patches, inversePatches) {
        const { base_, copy_ } = state;
        each(state.assigned_, (key, assignedValue)=>{
            const origValue = get(base_, key);
            const value = get(copy_, key);
            const op = !assignedValue ? REMOVE : has(base_, key) ? REPLACE : ADD;
            if (origValue === value && op === REPLACE) return;
            const path = basePath.concat(key);
            patches.push(op === REMOVE ? {
                op,
                path
            } : {
                op,
                path,
                value
            });
            inversePatches.push(op === ADD ? {
                op: REMOVE,
                path
            } : op === REMOVE ? {
                op: ADD,
                path,
                value: clonePatchValueIfNeeded(origValue)
            } : {
                op: REPLACE,
                path,
                value: clonePatchValueIfNeeded(origValue)
            });
        });
    }
    function generateSetPatches(state, basePath, patches, inversePatches) {
        let { base_, copy_ } = state;
        let i = 0;
        base_.forEach((value)=>{
            if (!copy_.has(value)) {
                const path = basePath.concat([
                    i
                ]);
                patches.push({
                    op: REMOVE,
                    path,
                    value
                });
                inversePatches.unshift({
                    op: ADD,
                    path,
                    value
                });
            }
            i++;
        });
        i = 0;
        copy_.forEach((value)=>{
            if (!base_.has(value)) {
                const path = basePath.concat([
                    i
                ]);
                patches.push({
                    op: ADD,
                    path,
                    value
                });
                inversePatches.unshift({
                    op: REMOVE,
                    path,
                    value
                });
            }
            i++;
        });
    }
    function generateReplacementPatches_(baseValue, replacement, patches, inversePatches) {
        patches.push({
            op: REPLACE,
            path: [],
            value: replacement === NOTHING ? void 0 : replacement
        });
        inversePatches.push({
            op: REPLACE,
            path: [],
            value: baseValue
        });
    }
    function applyPatches_(draft, patches) {
        patches.forEach((patch)=>{
            const { path, op } = patch;
            let base = draft;
            for(let i = 0; i < path.length - 1; i++){
                const parentType = getArchtype(base);
                let p = path[i];
                if (typeof p !== "string" && typeof p !== "number") {
                    p = "" + p;
                }
                if ((parentType === 0 /* Object */  || parentType === 1 /* Array */ ) && (p === "__proto__" || p === "constructor")) die(errorOffset + 3);
                if (typeof base === "function" && p === "prototype") die(errorOffset + 3);
                base = get(base, p);
                if (typeof base !== "object") die(errorOffset + 2, path.join("/"));
            }
            const type = getArchtype(base);
            const value = deepClonePatchValue(patch.value);
            const key = path[path.length - 1];
            switch(op){
                case REPLACE:
                    switch(type){
                        case 2 /* Map */ :
                            return base.set(key, value);
                        case 3 /* Set */ :
                            die(errorOffset);
                        default:
                            return base[key] = value;
                    }
                case ADD:
                    switch(type){
                        case 1 /* Array */ :
                            return key === "-" ? base.push(value) : base.splice(key, 0, value);
                        case 2 /* Map */ :
                            return base.set(key, value);
                        case 3 /* Set */ :
                            return base.add(value);
                        default:
                            return base[key] = value;
                    }
                case REMOVE:
                    switch(type){
                        case 1 /* Array */ :
                            return base.splice(key, 1);
                        case 2 /* Map */ :
                            return base.delete(key);
                        case 3 /* Set */ :
                            return base.delete(patch.value);
                        default:
                            return delete base[key];
                    }
                default:
                    die(errorOffset + 1, op);
            }
        });
        return draft;
    }
    function deepClonePatchValue(obj) {
        if (!isDraftable(obj)) return obj;
        if (Array.isArray(obj)) return obj.map(deepClonePatchValue);
        if (isMap(obj)) return new Map(Array.from(obj.entries()).map(([k, v])=>[
                k,
                deepClonePatchValue(v)
            ]));
        if (isSet(obj)) return new Set(Array.from(obj).map(deepClonePatchValue));
        const cloned = Object.create(getPrototypeOf(obj));
        for(const key in obj)cloned[key] = deepClonePatchValue(obj[key]);
        if (has(obj, DRAFTABLE)) cloned[DRAFTABLE] = obj[DRAFTABLE];
        return cloned;
    }
    function clonePatchValueIfNeeded(obj) {
        if (isDraft(obj)) {
            return deepClonePatchValue(obj);
        } else return obj;
    }
    loadPlugin("Patches", {
        applyPatches_,
        generatePatches_,
        generateReplacementPatches_
    });
}
// src/plugins/mapset.ts
function enableMapSet() {
    class DraftMap extends Map {
        constructor(target, parent){
            super();
            this[DRAFT_STATE] = {
                type_: 2 /* Map */ ,
                parent_: parent,
                scope_: parent ? parent.scope_ : getCurrentScope(),
                modified_: false,
                finalized_: false,
                copy_: void 0,
                assigned_: void 0,
                base_: target,
                draft_: this,
                isManual_: false,
                revoked_: false
            };
        }
        get size() {
            return latest(this[DRAFT_STATE]).size;
        }
        has(key) {
            return latest(this[DRAFT_STATE]).has(key);
        }
        set(key, value) {
            const state = this[DRAFT_STATE];
            assertUnrevoked(state);
            if (!latest(state).has(key) || latest(state).get(key) !== value) {
                prepareMapCopy(state);
                markChanged(state);
                state.assigned_.set(key, true);
                state.copy_.set(key, value);
                state.assigned_.set(key, true);
            }
            return this;
        }
        delete(key) {
            if (!this.has(key)) {
                return false;
            }
            const state = this[DRAFT_STATE];
            assertUnrevoked(state);
            prepareMapCopy(state);
            markChanged(state);
            if (state.base_.has(key)) {
                state.assigned_.set(key, false);
            } else {
                state.assigned_.delete(key);
            }
            state.copy_.delete(key);
            return true;
        }
        clear() {
            const state = this[DRAFT_STATE];
            assertUnrevoked(state);
            if (latest(state).size) {
                prepareMapCopy(state);
                markChanged(state);
                state.assigned_ = /* @__PURE__ */ new Map();
                each(state.base_, (key)=>{
                    state.assigned_.set(key, false);
                });
                state.copy_.clear();
            }
        }
        forEach(cb, thisArg) {
            const state = this[DRAFT_STATE];
            latest(state).forEach((_value, key, _map)=>{
                cb.call(thisArg, this.get(key), key, this);
            });
        }
        get(key) {
            const state = this[DRAFT_STATE];
            assertUnrevoked(state);
            const value = latest(state).get(key);
            if (state.finalized_ || !isDraftable(value)) {
                return value;
            }
            if (value !== state.base_.get(key)) {
                return value;
            }
            const draft = createProxy(value, state);
            prepareMapCopy(state);
            state.copy_.set(key, draft);
            return draft;
        }
        keys() {
            return latest(this[DRAFT_STATE]).keys();
        }
        values() {
            const iterator = this.keys();
            return {
                [Symbol.iterator]: ()=>this.values(),
                next: ()=>{
                    const r = iterator.next();
                    if (r.done) return r;
                    const value = this.get(r.value);
                    return {
                        done: false,
                        value
                    };
                }
            };
        }
        entries() {
            const iterator = this.keys();
            return {
                [Symbol.iterator]: ()=>this.entries(),
                next: ()=>{
                    const r = iterator.next();
                    if (r.done) return r;
                    const value = this.get(r.value);
                    return {
                        done: false,
                        value: [
                            r.value,
                            value
                        ]
                    };
                }
            };
        }
        [(DRAFT_STATE, Symbol.iterator)]() {
            return this.entries();
        }
    }
    function proxyMap_(target, parent) {
        return new DraftMap(target, parent);
    }
    function prepareMapCopy(state) {
        if (!state.copy_) {
            state.assigned_ = /* @__PURE__ */ new Map();
            state.copy_ = new Map(state.base_);
        }
    }
    class DraftSet extends Set {
        constructor(target, parent){
            super();
            this[DRAFT_STATE] = {
                type_: 3 /* Set */ ,
                parent_: parent,
                scope_: parent ? parent.scope_ : getCurrentScope(),
                modified_: false,
                finalized_: false,
                copy_: void 0,
                base_: target,
                draft_: this,
                drafts_: /* @__PURE__ */ new Map(),
                revoked_: false,
                isManual_: false
            };
        }
        get size() {
            return latest(this[DRAFT_STATE]).size;
        }
        has(value) {
            const state = this[DRAFT_STATE];
            assertUnrevoked(state);
            if (!state.copy_) {
                return state.base_.has(value);
            }
            if (state.copy_.has(value)) return true;
            if (state.drafts_.has(value) && state.copy_.has(state.drafts_.get(value))) return true;
            return false;
        }
        add(value) {
            const state = this[DRAFT_STATE];
            assertUnrevoked(state);
            if (!this.has(value)) {
                prepareSetCopy(state);
                markChanged(state);
                state.copy_.add(value);
            }
            return this;
        }
        delete(value) {
            if (!this.has(value)) {
                return false;
            }
            const state = this[DRAFT_STATE];
            assertUnrevoked(state);
            prepareSetCopy(state);
            markChanged(state);
            return state.copy_.delete(value) || (state.drafts_.has(value) ? state.copy_.delete(state.drafts_.get(value)) : /* istanbul ignore next */ false);
        }
        clear() {
            const state = this[DRAFT_STATE];
            assertUnrevoked(state);
            if (latest(state).size) {
                prepareSetCopy(state);
                markChanged(state);
                state.copy_.clear();
            }
        }
        values() {
            const state = this[DRAFT_STATE];
            assertUnrevoked(state);
            prepareSetCopy(state);
            return state.copy_.values();
        }
        entries() {
            const state = this[DRAFT_STATE];
            assertUnrevoked(state);
            prepareSetCopy(state);
            return state.copy_.entries();
        }
        keys() {
            return this.values();
        }
        [(DRAFT_STATE, Symbol.iterator)]() {
            return this.values();
        }
        forEach(cb, thisArg) {
            const iterator = this.values();
            let result = iterator.next();
            while(!result.done){
                cb.call(thisArg, result.value, result.value, this);
                result = iterator.next();
            }
        }
    }
    function proxySet_(target, parent) {
        return new DraftSet(target, parent);
    }
    function prepareSetCopy(state) {
        if (!state.copy_) {
            state.copy_ = /* @__PURE__ */ new Set();
            state.base_.forEach((value)=>{
                if (isDraftable(value)) {
                    const draft = createProxy(value, state);
                    state.drafts_.set(value, draft);
                    state.copy_.add(draft);
                } else {
                    state.copy_.add(value);
                }
            });
        }
    }
    function assertUnrevoked(state) {
        if (state.revoked_) die(3, JSON.stringify(latest(state)));
    }
    loadPlugin("MapSet", {
        proxyMap_,
        proxySet_
    });
}
// src/immer.ts
var immer = new Immer2();
var produce = immer.produce;
var produceWithPatches = immer.produceWithPatches.bind(immer);
var setAutoFreeze = immer.setAutoFreeze.bind(immer);
var setUseStrictShallowCopy = immer.setUseStrictShallowCopy.bind(immer);
var applyPatches = immer.applyPatches.bind(immer);
var createDraft = immer.createDraft.bind(immer);
var finishDraft = immer.finishDraft.bind(immer);
function castDraft(value) {
    return value;
}
function castImmutable(value) {
    return value;
}
;
 //# sourceMappingURL=immer.mjs.map
}}),
"[project]/node_modules/immer/dist/immer.mjs [app-client] (ecmascript) <export produce as createNextState>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "createNextState": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$immer$2f$dist$2f$immer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["produce"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$immer$2f$dist$2f$immer$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/immer/dist/immer.mjs [app-client] (ecmascript)");
}}),
"[project]/apps/web/node_modules/reselect/dist/reselect.mjs [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/devModeChecks/identityFunctionCheck.ts
__turbopack_context__.s({
    "createSelector": (()=>createSelector),
    "createSelectorCreator": (()=>createSelectorCreator),
    "createStructuredSelector": (()=>createStructuredSelector),
    "lruMemoize": (()=>lruMemoize),
    "referenceEqualityCheck": (()=>referenceEqualityCheck),
    "setGlobalDevModeChecks": (()=>setGlobalDevModeChecks),
    "unstable_autotrackMemoize": (()=>autotrackMemoize),
    "weakMapMemoize": (()=>weakMapMemoize)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
var runIdentityFunctionCheck = (resultFunc, inputSelectorsResults, outputSelectorResult)=>{
    if (inputSelectorsResults.length === 1 && inputSelectorsResults[0] === outputSelectorResult) {
        let isInputSameAsOutput = false;
        try {
            const emptyObject = {};
            if (resultFunc(emptyObject) === emptyObject) isInputSameAsOutput = true;
        } catch  {}
        if (isInputSameAsOutput) {
            let stack = void 0;
            try {
                throw new Error();
            } catch (e) {
                ;
                ({ stack } = e);
            }
            console.warn("The result function returned its own inputs without modification. e.g\n`createSelector([state => state.todos], todos => todos)`\nThis could lead to inefficient memoization and unnecessary re-renders.\nEnsure transformation logic is in the result function, and extraction logic is in the input selectors.", {
                stack
            });
        }
    }
};
// src/devModeChecks/inputStabilityCheck.ts
var runInputStabilityCheck = (inputSelectorResultsObject, options, inputSelectorArgs)=>{
    const { memoize, memoizeOptions } = options;
    const { inputSelectorResults, inputSelectorResultsCopy } = inputSelectorResultsObject;
    const createAnEmptyObject = memoize(()=>({}), ...memoizeOptions);
    const areInputSelectorResultsEqual = createAnEmptyObject.apply(null, inputSelectorResults) === createAnEmptyObject.apply(null, inputSelectorResultsCopy);
    if (!areInputSelectorResultsEqual) {
        let stack = void 0;
        try {
            throw new Error();
        } catch (e) {
            ;
            ({ stack } = e);
        }
        console.warn("An input selector returned a different result when passed same arguments.\nThis means your output selector will likely run more frequently than intended.\nAvoid returning a new reference inside your input selector, e.g.\n`createSelector([state => state.todos.map(todo => todo.id)], todoIds => todoIds.length)`", {
            arguments: inputSelectorArgs,
            firstInputs: inputSelectorResults,
            secondInputs: inputSelectorResultsCopy,
            stack
        });
    }
};
// src/devModeChecks/setGlobalDevModeChecks.ts
var globalDevModeChecks = {
    inputStabilityCheck: "once",
    identityFunctionCheck: "once"
};
var setGlobalDevModeChecks = (devModeChecks)=>{
    Object.assign(globalDevModeChecks, devModeChecks);
};
// src/utils.ts
var NOT_FOUND = /* @__PURE__ */ Symbol("NOT_FOUND");
function assertIsFunction(func, errorMessage = `expected a function, instead received ${typeof func}`) {
    if (typeof func !== "function") {
        throw new TypeError(errorMessage);
    }
}
function assertIsObject(object, errorMessage = `expected an object, instead received ${typeof object}`) {
    if (typeof object !== "object") {
        throw new TypeError(errorMessage);
    }
}
function assertIsArrayOfFunctions(array, errorMessage = `expected all items to be functions, instead received the following types: `) {
    if (!array.every((item)=>typeof item === "function")) {
        const itemTypes = array.map((item)=>typeof item === "function" ? `function ${item.name || "unnamed"}()` : typeof item).join(", ");
        throw new TypeError(`${errorMessage}[${itemTypes}]`);
    }
}
var ensureIsArray = (item)=>{
    return Array.isArray(item) ? item : [
        item
    ];
};
function getDependencies(createSelectorArgs) {
    const dependencies = Array.isArray(createSelectorArgs[0]) ? createSelectorArgs[0] : createSelectorArgs;
    assertIsArrayOfFunctions(dependencies, `createSelector expects all input-selectors to be functions, but received the following types: `);
    return dependencies;
}
function collectInputSelectorResults(dependencies, inputSelectorArgs) {
    const inputSelectorResults = [];
    const { length } = dependencies;
    for(let i = 0; i < length; i++){
        inputSelectorResults.push(dependencies[i].apply(null, inputSelectorArgs));
    }
    return inputSelectorResults;
}
var getDevModeChecksExecutionInfo = (firstRun, devModeChecks)=>{
    const { identityFunctionCheck, inputStabilityCheck } = {
        ...globalDevModeChecks,
        ...devModeChecks
    };
    return {
        identityFunctionCheck: {
            shouldRun: identityFunctionCheck === "always" || identityFunctionCheck === "once" && firstRun,
            run: runIdentityFunctionCheck
        },
        inputStabilityCheck: {
            shouldRun: inputStabilityCheck === "always" || inputStabilityCheck === "once" && firstRun,
            run: runInputStabilityCheck
        }
    };
};
// src/autotrackMemoize/autotracking.ts
var $REVISION = 0;
var CURRENT_TRACKER = null;
var Cell = class {
    revision = $REVISION;
    _value;
    _lastValue;
    _isEqual = tripleEq;
    constructor(initialValue, isEqual = tripleEq){
        this._value = this._lastValue = initialValue;
        this._isEqual = isEqual;
    }
    // Whenever a storage value is read, it'll add itself to the current tracker if
    // one exists, entangling its state with that cache.
    get value() {
        CURRENT_TRACKER?.add(this);
        return this._value;
    }
    // Whenever a storage value is updated, we bump the global revision clock,
    // assign the revision for this storage to the new value, _and_ we schedule a
    // rerender. This is important, and it's what makes autotracking  _pull_
    // based. We don't actively tell the caches which depend on the storage that
    // anything has happened. Instead, we recompute the caches when needed.
    set value(newValue) {
        if (this.value === newValue) return;
        this._value = newValue;
        this.revision = ++$REVISION;
    }
};
function tripleEq(a, b) {
    return a === b;
}
var TrackingCache = class {
    _cachedValue;
    _cachedRevision = -1;
    _deps = [];
    hits = 0;
    fn;
    constructor(fn){
        this.fn = fn;
    }
    clear() {
        this._cachedValue = void 0;
        this._cachedRevision = -1;
        this._deps = [];
        this.hits = 0;
    }
    get value() {
        if (this.revision > this._cachedRevision) {
            const { fn } = this;
            const currentTracker = /* @__PURE__ */ new Set();
            const prevTracker = CURRENT_TRACKER;
            CURRENT_TRACKER = currentTracker;
            this._cachedValue = fn();
            CURRENT_TRACKER = prevTracker;
            this.hits++;
            this._deps = Array.from(currentTracker);
            this._cachedRevision = this.revision;
        }
        CURRENT_TRACKER?.add(this);
        return this._cachedValue;
    }
    get revision() {
        return Math.max(...this._deps.map((d)=>d.revision), 0);
    }
};
function getValue(cell) {
    if (!(cell instanceof Cell)) {
        console.warn("Not a valid cell! ", cell);
    }
    return cell.value;
}
function setValue(storage, value) {
    if (!(storage instanceof Cell)) {
        throw new TypeError("setValue must be passed a tracked store created with `createStorage`.");
    }
    storage.value = storage._lastValue = value;
}
function createCell(initialValue, isEqual = tripleEq) {
    return new Cell(initialValue, isEqual);
}
function createCache(fn) {
    assertIsFunction(fn, "the first parameter to `createCache` must be a function");
    return new TrackingCache(fn);
}
// src/autotrackMemoize/tracking.ts
var neverEq = (a, b)=>false;
function createTag() {
    return createCell(null, neverEq);
}
function dirtyTag(tag, value) {
    setValue(tag, value);
}
var consumeCollection = (node)=>{
    let tag = node.collectionTag;
    if (tag === null) {
        tag = node.collectionTag = createTag();
    }
    getValue(tag);
};
var dirtyCollection = (node)=>{
    const tag = node.collectionTag;
    if (tag !== null) {
        dirtyTag(tag, null);
    }
};
// src/autotrackMemoize/proxy.ts
var REDUX_PROXY_LABEL = Symbol();
var nextId = 0;
var proto = Object.getPrototypeOf({});
var ObjectTreeNode = class {
    constructor(value){
        this.value = value;
        this.value = value;
        this.tag.value = value;
    }
    proxy = new Proxy(this, objectProxyHandler);
    tag = createTag();
    tags = {};
    children = {};
    collectionTag = null;
    id = nextId++;
};
var objectProxyHandler = {
    get (node, key) {
        function calculateResult() {
            const { value } = node;
            const childValue = Reflect.get(value, key);
            if (typeof key === "symbol") {
                return childValue;
            }
            if (key in proto) {
                return childValue;
            }
            if (typeof childValue === "object" && childValue !== null) {
                let childNode = node.children[key];
                if (childNode === void 0) {
                    childNode = node.children[key] = createNode(childValue);
                }
                if (childNode.tag) {
                    getValue(childNode.tag);
                }
                return childNode.proxy;
            } else {
                let tag = node.tags[key];
                if (tag === void 0) {
                    tag = node.tags[key] = createTag();
                    tag.value = childValue;
                }
                getValue(tag);
                return childValue;
            }
        }
        const res = calculateResult();
        return res;
    },
    ownKeys (node) {
        consumeCollection(node);
        return Reflect.ownKeys(node.value);
    },
    getOwnPropertyDescriptor (node, prop) {
        return Reflect.getOwnPropertyDescriptor(node.value, prop);
    },
    has (node, prop) {
        return Reflect.has(node.value, prop);
    }
};
var ArrayTreeNode = class {
    constructor(value){
        this.value = value;
        this.value = value;
        this.tag.value = value;
    }
    proxy = new Proxy([
        this
    ], arrayProxyHandler);
    tag = createTag();
    tags = {};
    children = {};
    collectionTag = null;
    id = nextId++;
};
var arrayProxyHandler = {
    get ([node], key) {
        if (key === "length") {
            consumeCollection(node);
        }
        return objectProxyHandler.get(node, key);
    },
    ownKeys ([node]) {
        return objectProxyHandler.ownKeys(node);
    },
    getOwnPropertyDescriptor ([node], prop) {
        return objectProxyHandler.getOwnPropertyDescriptor(node, prop);
    },
    has ([node], prop) {
        return objectProxyHandler.has(node, prop);
    }
};
function createNode(value) {
    if (Array.isArray(value)) {
        return new ArrayTreeNode(value);
    }
    return new ObjectTreeNode(value);
}
function updateNode(node, newValue) {
    const { value, tags, children } = node;
    node.value = newValue;
    if (Array.isArray(value) && Array.isArray(newValue) && value.length !== newValue.length) {
        dirtyCollection(node);
    } else {
        if (value !== newValue) {
            let oldKeysSize = 0;
            let newKeysSize = 0;
            let anyKeysAdded = false;
            for(const _key in value){
                oldKeysSize++;
            }
            for(const key in newValue){
                newKeysSize++;
                if (!(key in value)) {
                    anyKeysAdded = true;
                    break;
                }
            }
            const isDifferent = anyKeysAdded || oldKeysSize !== newKeysSize;
            if (isDifferent) {
                dirtyCollection(node);
            }
        }
    }
    for(const key in tags){
        const childValue = value[key];
        const newChildValue = newValue[key];
        if (childValue !== newChildValue) {
            dirtyCollection(node);
            dirtyTag(tags[key], newChildValue);
        }
        if (typeof newChildValue === "object" && newChildValue !== null) {
            delete tags[key];
        }
    }
    for(const key in children){
        const childNode = children[key];
        const newChildValue = newValue[key];
        const childValue = childNode.value;
        if (childValue === newChildValue) {
            continue;
        } else if (typeof newChildValue === "object" && newChildValue !== null) {
            updateNode(childNode, newChildValue);
        } else {
            deleteNode(childNode);
            delete children[key];
        }
    }
}
function deleteNode(node) {
    if (node.tag) {
        dirtyTag(node.tag, null);
    }
    dirtyCollection(node);
    for(const key in node.tags){
        dirtyTag(node.tags[key], null);
    }
    for(const key in node.children){
        deleteNode(node.children[key]);
    }
}
// src/lruMemoize.ts
function createSingletonCache(equals) {
    let entry;
    return {
        get (key) {
            if (entry && equals(entry.key, key)) {
                return entry.value;
            }
            return NOT_FOUND;
        },
        put (key, value) {
            entry = {
                key,
                value
            };
        },
        getEntries () {
            return entry ? [
                entry
            ] : [];
        },
        clear () {
            entry = void 0;
        }
    };
}
function createLruCache(maxSize, equals) {
    let entries = [];
    function get(key) {
        const cacheIndex = entries.findIndex((entry)=>equals(key, entry.key));
        if (cacheIndex > -1) {
            const entry = entries[cacheIndex];
            if (cacheIndex > 0) {
                entries.splice(cacheIndex, 1);
                entries.unshift(entry);
            }
            return entry.value;
        }
        return NOT_FOUND;
    }
    function put(key, value) {
        if (get(key) === NOT_FOUND) {
            entries.unshift({
                key,
                value
            });
            if (entries.length > maxSize) {
                entries.pop();
            }
        }
    }
    function getEntries() {
        return entries;
    }
    function clear() {
        entries = [];
    }
    return {
        get,
        put,
        getEntries,
        clear
    };
}
var referenceEqualityCheck = (a, b)=>a === b;
function createCacheKeyComparator(equalityCheck) {
    return function areArgumentsShallowlyEqual(prev, next) {
        if (prev === null || next === null || prev.length !== next.length) {
            return false;
        }
        const { length } = prev;
        for(let i = 0; i < length; i++){
            if (!equalityCheck(prev[i], next[i])) {
                return false;
            }
        }
        return true;
    };
}
function lruMemoize(func, equalityCheckOrOptions) {
    const providedOptions = typeof equalityCheckOrOptions === "object" ? equalityCheckOrOptions : {
        equalityCheck: equalityCheckOrOptions
    };
    const { equalityCheck = referenceEqualityCheck, maxSize = 1, resultEqualityCheck } = providedOptions;
    const comparator = createCacheKeyComparator(equalityCheck);
    let resultsCount = 0;
    const cache = maxSize <= 1 ? createSingletonCache(comparator) : createLruCache(maxSize, comparator);
    function memoized() {
        let value = cache.get(arguments);
        if (value === NOT_FOUND) {
            value = func.apply(null, arguments);
            resultsCount++;
            if (resultEqualityCheck) {
                const entries = cache.getEntries();
                const matchingEntry = entries.find((entry)=>resultEqualityCheck(entry.value, value));
                if (matchingEntry) {
                    value = matchingEntry.value;
                    resultsCount !== 0 && resultsCount--;
                }
            }
            cache.put(arguments, value);
        }
        return value;
    }
    memoized.clearCache = ()=>{
        cache.clear();
        memoized.resetResultsCount();
    };
    memoized.resultsCount = ()=>resultsCount;
    memoized.resetResultsCount = ()=>{
        resultsCount = 0;
    };
    return memoized;
}
// src/autotrackMemoize/autotrackMemoize.ts
function autotrackMemoize(func) {
    const node = createNode([]);
    let lastArgs = null;
    const shallowEqual = createCacheKeyComparator(referenceEqualityCheck);
    const cache = createCache(()=>{
        const res = func.apply(null, node.proxy);
        return res;
    });
    function memoized() {
        if (!shallowEqual(lastArgs, arguments)) {
            updateNode(node, arguments);
            lastArgs = arguments;
        }
        return cache.value;
    }
    memoized.clearCache = ()=>{
        return cache.clear();
    };
    return memoized;
}
// src/weakMapMemoize.ts
var StrongRef = class {
    constructor(value){
        this.value = value;
    }
    deref() {
        return this.value;
    }
};
var Ref = typeof WeakRef !== "undefined" ? WeakRef : StrongRef;
var UNTERMINATED = 0;
var TERMINATED = 1;
function createCacheNode() {
    return {
        s: UNTERMINATED,
        v: void 0,
        o: null,
        p: null
    };
}
function weakMapMemoize(func, options = {}) {
    let fnNode = createCacheNode();
    const { resultEqualityCheck } = options;
    let lastResult;
    let resultsCount = 0;
    function memoized() {
        let cacheNode = fnNode;
        const { length } = arguments;
        for(let i = 0, l = length; i < l; i++){
            const arg = arguments[i];
            if (typeof arg === "function" || typeof arg === "object" && arg !== null) {
                let objectCache = cacheNode.o;
                if (objectCache === null) {
                    cacheNode.o = objectCache = /* @__PURE__ */ new WeakMap();
                }
                const objectNode = objectCache.get(arg);
                if (objectNode === void 0) {
                    cacheNode = createCacheNode();
                    objectCache.set(arg, cacheNode);
                } else {
                    cacheNode = objectNode;
                }
            } else {
                let primitiveCache = cacheNode.p;
                if (primitiveCache === null) {
                    cacheNode.p = primitiveCache = /* @__PURE__ */ new Map();
                }
                const primitiveNode = primitiveCache.get(arg);
                if (primitiveNode === void 0) {
                    cacheNode = createCacheNode();
                    primitiveCache.set(arg, cacheNode);
                } else {
                    cacheNode = primitiveNode;
                }
            }
        }
        const terminatedNode = cacheNode;
        let result;
        if (cacheNode.s === TERMINATED) {
            result = cacheNode.v;
        } else {
            result = func.apply(null, arguments);
            resultsCount++;
            if (resultEqualityCheck) {
                const lastResultValue = lastResult?.deref?.() ?? lastResult;
                if (lastResultValue != null && resultEqualityCheck(lastResultValue, result)) {
                    result = lastResultValue;
                    resultsCount !== 0 && resultsCount--;
                }
                const needsWeakRef = typeof result === "object" && result !== null || typeof result === "function";
                lastResult = needsWeakRef ? new Ref(result) : result;
            }
        }
        terminatedNode.s = TERMINATED;
        terminatedNode.v = result;
        return result;
    }
    memoized.clearCache = ()=>{
        fnNode = createCacheNode();
        memoized.resetResultsCount();
    };
    memoized.resultsCount = ()=>resultsCount;
    memoized.resetResultsCount = ()=>{
        resultsCount = 0;
    };
    return memoized;
}
// src/createSelectorCreator.ts
function createSelectorCreator(memoizeOrOptions, ...memoizeOptionsFromArgs) {
    const createSelectorCreatorOptions = typeof memoizeOrOptions === "function" ? {
        memoize: memoizeOrOptions,
        memoizeOptions: memoizeOptionsFromArgs
    } : memoizeOrOptions;
    const createSelector2 = (...createSelectorArgs)=>{
        let recomputations = 0;
        let dependencyRecomputations = 0;
        let lastResult;
        let directlyPassedOptions = {};
        let resultFunc = createSelectorArgs.pop();
        if (typeof resultFunc === "object") {
            directlyPassedOptions = resultFunc;
            resultFunc = createSelectorArgs.pop();
        }
        assertIsFunction(resultFunc, `createSelector expects an output function after the inputs, but received: [${typeof resultFunc}]`);
        const combinedOptions = {
            ...createSelectorCreatorOptions,
            ...directlyPassedOptions
        };
        const { memoize, memoizeOptions = [], argsMemoize = weakMapMemoize, argsMemoizeOptions = [], devModeChecks = {} } = combinedOptions;
        const finalMemoizeOptions = ensureIsArray(memoizeOptions);
        const finalArgsMemoizeOptions = ensureIsArray(argsMemoizeOptions);
        const dependencies = getDependencies(createSelectorArgs);
        const memoizedResultFunc = memoize(function recomputationWrapper() {
            recomputations++;
            return resultFunc.apply(null, arguments);
        }, ...finalMemoizeOptions);
        let firstRun = true;
        const selector = argsMemoize(function dependenciesChecker() {
            dependencyRecomputations++;
            const inputSelectorResults = collectInputSelectorResults(dependencies, arguments);
            lastResult = memoizedResultFunc.apply(null, inputSelectorResults);
            if ("TURBOPACK compile-time truthy", 1) {
                const { identityFunctionCheck, inputStabilityCheck } = getDevModeChecksExecutionInfo(firstRun, devModeChecks);
                if (identityFunctionCheck.shouldRun) {
                    identityFunctionCheck.run(resultFunc, inputSelectorResults, lastResult);
                }
                if (inputStabilityCheck.shouldRun) {
                    const inputSelectorResultsCopy = collectInputSelectorResults(dependencies, arguments);
                    inputStabilityCheck.run({
                        inputSelectorResults,
                        inputSelectorResultsCopy
                    }, {
                        memoize,
                        memoizeOptions: finalMemoizeOptions
                    }, arguments);
                }
                if (firstRun) firstRun = false;
            }
            return lastResult;
        }, ...finalArgsMemoizeOptions);
        return Object.assign(selector, {
            resultFunc,
            memoizedResultFunc,
            dependencies,
            dependencyRecomputations: ()=>dependencyRecomputations,
            resetDependencyRecomputations: ()=>{
                dependencyRecomputations = 0;
            },
            lastResult: ()=>lastResult,
            recomputations: ()=>recomputations,
            resetRecomputations: ()=>{
                recomputations = 0;
            },
            memoize,
            argsMemoize
        });
    };
    Object.assign(createSelector2, {
        withTypes: ()=>createSelector2
    });
    return createSelector2;
}
var createSelector = /* @__PURE__ */ createSelectorCreator(weakMapMemoize);
// src/createStructuredSelector.ts
var createStructuredSelector = Object.assign((inputSelectorsObject, selectorCreator = createSelector)=>{
    assertIsObject(inputSelectorsObject, `createStructuredSelector expects first argument to be an object where each property is a selector, instead received a ${typeof inputSelectorsObject}`);
    const inputSelectorKeys = Object.keys(inputSelectorsObject);
    const dependencies = inputSelectorKeys.map((key)=>inputSelectorsObject[key]);
    const structuredSelector = selectorCreator(dependencies, (...inputSelectorResults)=>{
        return inputSelectorResults.reduce((composition, value, index)=>{
            composition[inputSelectorKeys[index]] = value;
            return composition;
        }, {});
    });
    return structuredSelector;
}, {
    withTypes: ()=>createStructuredSelector
});
;
 //# sourceMappingURL=reselect.mjs.map
}}),
"[project]/node_modules/redux/dist/redux.mjs [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/utils/formatProdErrorMessage.ts
__turbopack_context__.s({
    "__DO_NOT_USE__ActionTypes": (()=>actionTypes_default),
    "applyMiddleware": (()=>applyMiddleware),
    "bindActionCreators": (()=>bindActionCreators),
    "combineReducers": (()=>combineReducers),
    "compose": (()=>compose),
    "createStore": (()=>createStore),
    "isAction": (()=>isAction),
    "isPlainObject": (()=>isPlainObject),
    "legacy_createStore": (()=>legacy_createStore)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$build$2f$polyfills$2f$process$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/build/polyfills/process.js [app-client] (ecmascript)");
function formatProdErrorMessage(code) {
    return `Minified Redux error #${code}; visit https://redux.js.org/Errors?code=${code} for the full message or use the non-minified dev environment for full errors. `;
}
// src/utils/symbol-observable.ts
var $$observable = /* @__PURE__ */ (()=>typeof Symbol === "function" && Symbol.observable || "@@observable")();
var symbol_observable_default = $$observable;
// src/utils/actionTypes.ts
var randomString = ()=>Math.random().toString(36).substring(7).split("").join(".");
var ActionTypes = {
    INIT: `@@redux/INIT${randomString()}`,
    REPLACE: `@@redux/REPLACE${randomString()}`,
    PROBE_UNKNOWN_ACTION: ()=>`@@redux/PROBE_UNKNOWN_ACTION${randomString()}`
};
var actionTypes_default = ActionTypes;
// src/utils/isPlainObject.ts
function isPlainObject(obj) {
    if (typeof obj !== "object" || obj === null) return false;
    let proto = obj;
    while(Object.getPrototypeOf(proto) !== null){
        proto = Object.getPrototypeOf(proto);
    }
    return Object.getPrototypeOf(obj) === proto || Object.getPrototypeOf(obj) === null;
}
// src/utils/kindOf.ts
function miniKindOf(val) {
    if (val === void 0) return "undefined";
    if (val === null) return "null";
    const type = typeof val;
    switch(type){
        case "boolean":
        case "string":
        case "number":
        case "symbol":
        case "function":
            {
                return type;
            }
    }
    if (Array.isArray(val)) return "array";
    if (isDate(val)) return "date";
    if (isError(val)) return "error";
    const constructorName = ctorName(val);
    switch(constructorName){
        case "Symbol":
        case "Promise":
        case "WeakMap":
        case "WeakSet":
        case "Map":
        case "Set":
            return constructorName;
    }
    return Object.prototype.toString.call(val).slice(8, -1).toLowerCase().replace(/\s/g, "");
}
function ctorName(val) {
    return typeof val.constructor === "function" ? val.constructor.name : null;
}
function isError(val) {
    return val instanceof Error || typeof val.message === "string" && val.constructor && typeof val.constructor.stackTraceLimit === "number";
}
function isDate(val) {
    if (val instanceof Date) return true;
    return typeof val.toDateString === "function" && typeof val.getDate === "function" && typeof val.setDate === "function";
}
function kindOf(val) {
    let typeOfVal = typeof val;
    if ("TURBOPACK compile-time truthy", 1) {
        typeOfVal = miniKindOf(val);
    }
    return typeOfVal;
}
// src/createStore.ts
function createStore(reducer, preloadedState, enhancer) {
    if (typeof reducer !== "function") {
        throw new Error(("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : `Expected the root reducer to be a function. Instead, received: '${kindOf(reducer)}'`);
    }
    if (typeof preloadedState === "function" && typeof enhancer === "function" || typeof enhancer === "function" && typeof arguments[3] === "function") {
        throw new Error(("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : "It looks like you are passing several store enhancers to createStore(). This is not supported. Instead, compose them together to a single function. See https://redux.js.org/tutorials/fundamentals/part-4-store#creating-a-store-with-enhancers for an example.");
    }
    if (typeof preloadedState === "function" && typeof enhancer === "undefined") {
        enhancer = preloadedState;
        preloadedState = void 0;
    }
    if (typeof enhancer !== "undefined") {
        if (typeof enhancer !== "function") {
            throw new Error(("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : `Expected the enhancer to be a function. Instead, received: '${kindOf(enhancer)}'`);
        }
        return enhancer(createStore)(reducer, preloadedState);
    }
    let currentReducer = reducer;
    let currentState = preloadedState;
    let currentListeners = /* @__PURE__ */ new Map();
    let nextListeners = currentListeners;
    let listenerIdCounter = 0;
    let isDispatching = false;
    function ensureCanMutateNextListeners() {
        if (nextListeners === currentListeners) {
            nextListeners = /* @__PURE__ */ new Map();
            currentListeners.forEach((listener, key)=>{
                nextListeners.set(key, listener);
            });
        }
    }
    function getState() {
        if (isDispatching) {
            throw new Error(("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : "You may not call store.getState() while the reducer is executing. The reducer has already received the state as an argument. Pass it down from the top reducer instead of reading it from the store.");
        }
        return currentState;
    }
    function subscribe(listener) {
        if (typeof listener !== "function") {
            throw new Error(("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : `Expected the listener to be a function. Instead, received: '${kindOf(listener)}'`);
        }
        if (isDispatching) {
            throw new Error(("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : "You may not call store.subscribe() while the reducer is executing. If you would like to be notified after the store has been updated, subscribe from a component and invoke store.getState() in the callback to access the latest state. See https://redux.js.org/api/store#subscribelistener for more details.");
        }
        let isSubscribed = true;
        ensureCanMutateNextListeners();
        const listenerId = listenerIdCounter++;
        nextListeners.set(listenerId, listener);
        return function unsubscribe() {
            if (!isSubscribed) {
                return;
            }
            if (isDispatching) {
                throw new Error(("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : "You may not unsubscribe from a store listener while the reducer is executing. See https://redux.js.org/api/store#subscribelistener for more details.");
            }
            isSubscribed = false;
            ensureCanMutateNextListeners();
            nextListeners.delete(listenerId);
            currentListeners = null;
        };
    }
    function dispatch(action) {
        if (!isPlainObject(action)) {
            throw new Error(("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : `Actions must be plain objects. Instead, the actual type was: '${kindOf(action)}'. You may need to add middleware to your store setup to handle dispatching other values, such as 'redux-thunk' to handle dispatching functions. See https://redux.js.org/tutorials/fundamentals/part-4-store#middleware and https://redux.js.org/tutorials/fundamentals/part-6-async-logic#using-the-redux-thunk-middleware for examples.`);
        }
        if (typeof action.type === "undefined") {
            throw new Error(("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : 'Actions may not have an undefined "type" property. You may have misspelled an action type string constant.');
        }
        if (typeof action.type !== "string") {
            throw new Error(("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : `Action "type" property must be a string. Instead, the actual type was: '${kindOf(action.type)}'. Value was: '${action.type}' (stringified)`);
        }
        if (isDispatching) {
            throw new Error(("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : "Reducers may not dispatch actions.");
        }
        try {
            isDispatching = true;
            currentState = currentReducer(currentState, action);
        } finally{
            isDispatching = false;
        }
        const listeners = currentListeners = nextListeners;
        listeners.forEach((listener)=>{
            listener();
        });
        return action;
    }
    function replaceReducer(nextReducer) {
        if (typeof nextReducer !== "function") {
            throw new Error(("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : `Expected the nextReducer to be a function. Instead, received: '${kindOf(nextReducer)}`);
        }
        currentReducer = nextReducer;
        dispatch({
            type: actionTypes_default.REPLACE
        });
    }
    function observable() {
        const outerSubscribe = subscribe;
        return {
            /**
       * The minimal observable subscription method.
       * @param observer Any object that can be used as an observer.
       * The observer object should have a `next` method.
       * @returns An object with an `unsubscribe` method that can
       * be used to unsubscribe the observable from the store, and prevent further
       * emission of values from the observable.
       */ subscribe (observer) {
                if (typeof observer !== "object" || observer === null) {
                    throw new Error(("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : `Expected the observer to be an object. Instead, received: '${kindOf(observer)}'`);
                }
                function observeState() {
                    const observerAsObserver = observer;
                    if (observerAsObserver.next) {
                        observerAsObserver.next(getState());
                    }
                }
                observeState();
                const unsubscribe = outerSubscribe(observeState);
                return {
                    unsubscribe
                };
            },
            [symbol_observable_default] () {
                return this;
            }
        };
    }
    dispatch({
        type: actionTypes_default.INIT
    });
    const store = {
        dispatch,
        subscribe,
        getState,
        replaceReducer,
        [symbol_observable_default]: observable
    };
    return store;
}
function legacy_createStore(reducer, preloadedState, enhancer) {
    return createStore(reducer, preloadedState, enhancer);
}
// src/utils/warning.ts
function warning(message) {
    if (typeof console !== "undefined" && typeof console.error === "function") {
        console.error(message);
    }
    try {
        throw new Error(message);
    } catch (e) {}
}
// src/combineReducers.ts
function getUnexpectedStateShapeWarningMessage(inputState, reducers, action, unexpectedKeyCache) {
    const reducerKeys = Object.keys(reducers);
    const argumentName = action && action.type === actionTypes_default.INIT ? "preloadedState argument passed to createStore" : "previous state received by the reducer";
    if (reducerKeys.length === 0) {
        return "Store does not have a valid reducer. Make sure the argument passed to combineReducers is an object whose values are reducers.";
    }
    if (!isPlainObject(inputState)) {
        return `The ${argumentName} has unexpected type of "${kindOf(inputState)}". Expected argument to be an object with the following keys: "${reducerKeys.join('", "')}"`;
    }
    const unexpectedKeys = Object.keys(inputState).filter((key)=>!reducers.hasOwnProperty(key) && !unexpectedKeyCache[key]);
    unexpectedKeys.forEach((key)=>{
        unexpectedKeyCache[key] = true;
    });
    if (action && action.type === actionTypes_default.REPLACE) return;
    if (unexpectedKeys.length > 0) {
        return `Unexpected ${unexpectedKeys.length > 1 ? "keys" : "key"} "${unexpectedKeys.join('", "')}" found in ${argumentName}. Expected to find one of the known reducer keys instead: "${reducerKeys.join('", "')}". Unexpected keys will be ignored.`;
    }
}
function assertReducerShape(reducers) {
    Object.keys(reducers).forEach((key)=>{
        const reducer = reducers[key];
        const initialState = reducer(void 0, {
            type: actionTypes_default.INIT
        });
        if (typeof initialState === "undefined") {
            throw new Error(("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : `The slice reducer for key "${key}" returned undefined during initialization. If the state passed to the reducer is undefined, you must explicitly return the initial state. The initial state may not be undefined. If you don't want to set a value for this reducer, you can use null instead of undefined.`);
        }
        if (typeof reducer(void 0, {
            type: actionTypes_default.PROBE_UNKNOWN_ACTION()
        }) === "undefined") {
            throw new Error(("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : `The slice reducer for key "${key}" returned undefined when probed with a random type. Don't try to handle '${actionTypes_default.INIT}' or other actions in "redux/*" namespace. They are considered private. Instead, you must return the current state for any unknown actions, unless it is undefined, in which case you must return the initial state, regardless of the action type. The initial state may not be undefined, but can be null.`);
        }
    });
}
function combineReducers(reducers) {
    const reducerKeys = Object.keys(reducers);
    const finalReducers = {};
    for(let i = 0; i < reducerKeys.length; i++){
        const key = reducerKeys[i];
        if ("TURBOPACK compile-time truthy", 1) {
            if (typeof reducers[key] === "undefined") {
                warning(`No reducer provided for key "${key}"`);
            }
        }
        if (typeof reducers[key] === "function") {
            finalReducers[key] = reducers[key];
        }
    }
    const finalReducerKeys = Object.keys(finalReducers);
    let unexpectedKeyCache;
    if (("TURBOPACK compile-time value", "development") !== "production") {
        unexpectedKeyCache = {};
    }
    let shapeAssertionError;
    try {
        assertReducerShape(finalReducers);
    } catch (e) {
        shapeAssertionError = e;
    }
    return function combination(state = {}, action) {
        if (shapeAssertionError) {
            throw shapeAssertionError;
        }
        if ("TURBOPACK compile-time truthy", 1) {
            const warningMessage = getUnexpectedStateShapeWarningMessage(state, finalReducers, action, unexpectedKeyCache);
            if (warningMessage) {
                warning(warningMessage);
            }
        }
        let hasChanged = false;
        const nextState = {};
        for(let i = 0; i < finalReducerKeys.length; i++){
            const key = finalReducerKeys[i];
            const reducer = finalReducers[key];
            const previousStateForKey = state[key];
            const nextStateForKey = reducer(previousStateForKey, action);
            if (typeof nextStateForKey === "undefined") {
                const actionType = action && action.type;
                throw new Error(("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : `When called with an action of type ${actionType ? `"${String(actionType)}"` : "(unknown type)"}, the slice reducer for key "${key}" returned undefined. To ignore an action, you must explicitly return the previous state. If you want this reducer to hold no value, you can return null instead of undefined.`);
            }
            nextState[key] = nextStateForKey;
            hasChanged = hasChanged || nextStateForKey !== previousStateForKey;
        }
        hasChanged = hasChanged || finalReducerKeys.length !== Object.keys(state).length;
        return hasChanged ? nextState : state;
    };
}
// src/bindActionCreators.ts
function bindActionCreator(actionCreator, dispatch) {
    return function(...args) {
        return dispatch(actionCreator.apply(this, args));
    };
}
function bindActionCreators(actionCreators, dispatch) {
    if (typeof actionCreators === "function") {
        return bindActionCreator(actionCreators, dispatch);
    }
    if (typeof actionCreators !== "object" || actionCreators === null) {
        throw new Error(("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : `bindActionCreators expected an object or a function, but instead received: '${kindOf(actionCreators)}'. Did you write "import ActionCreators from" instead of "import * as ActionCreators from"?`);
    }
    const boundActionCreators = {};
    for(const key in actionCreators){
        const actionCreator = actionCreators[key];
        if (typeof actionCreator === "function") {
            boundActionCreators[key] = bindActionCreator(actionCreator, dispatch);
        }
    }
    return boundActionCreators;
}
// src/compose.ts
function compose(...funcs) {
    if (funcs.length === 0) {
        return (arg)=>arg;
    }
    if (funcs.length === 1) {
        return funcs[0];
    }
    return funcs.reduce((a, b)=>(...args)=>a(b(...args)));
}
// src/applyMiddleware.ts
function applyMiddleware(...middlewares) {
    return (createStore2)=>(reducer, preloadedState)=>{
            const store = createStore2(reducer, preloadedState);
            let dispatch = ()=>{
                throw new Error(("TURBOPACK compile-time falsy", 0) ? ("TURBOPACK unreachable", undefined) : "Dispatching while constructing your middleware is not allowed. Other middleware would not be applied to this dispatch.");
            };
            const middlewareAPI = {
                getState: store.getState,
                dispatch: (action, ...args)=>dispatch(action, ...args)
            };
            const chain = middlewares.map((middleware)=>middleware(middlewareAPI));
            dispatch = compose(...chain)(store.dispatch);
            return {
                ...store,
                dispatch
            };
        };
}
// src/utils/isAction.ts
function isAction(action) {
    return isPlainObject(action) && "type" in action && typeof action.type === "string";
}
;
 //# sourceMappingURL=redux.mjs.map
}}),
"[project]/node_modules/redux-thunk/dist/redux-thunk.mjs [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/index.ts
__turbopack_context__.s({
    "thunk": (()=>thunk),
    "withExtraArgument": (()=>withExtraArgument)
});
function createThunkMiddleware(extraArgument) {
    const middleware = ({ dispatch, getState })=>(next)=>(action)=>{
                if (typeof action === "function") {
                    return action(dispatch, getState, extraArgument);
                }
                return next(action);
            };
    return middleware;
}
var thunk = createThunkMiddleware();
var withExtraArgument = createThunkMiddleware;
;
}}),
"[project]/node_modules/@standard-schema/utils/dist/index.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// src/getDotPath/getDotPath.ts
__turbopack_context__.s({
    "SchemaError": (()=>SchemaError),
    "getDotPath": (()=>getDotPath)
});
function getDotPath(issue) {
    if (issue.path?.length) {
        let dotPath = "";
        for (const item of issue.path){
            const key = typeof item === "object" ? item.key : item;
            if (typeof key === "string" || typeof key === "number") {
                if (dotPath) {
                    dotPath += `.${key}`;
                } else {
                    dotPath += key;
                }
            } else {
                return null;
            }
        }
        return dotPath;
    }
    return null;
}
// src/SchemaError/SchemaError.ts
var SchemaError = class extends Error {
    /**
   * The schema issues.
   */ issues;
    /**
   * Creates a schema error with useful information.
   *
   * @param issues The schema issues.
   */ constructor(issues){
        super(issues[0].message);
        this.name = "SchemaError";
        this.issues = issues;
    }
};
;
}}),
"[project]/apps/web/node_modules/@heroicons/react/24/outline/esm/ChatBubbleLeftRightIcon.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
function ChatBubbleLeftRightIcon({ title, titleId, ...props }, svgRef) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])("svg", Object.assign({
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        strokeWidth: 1.5,
        stroke: "currentColor",
        "aria-hidden": "true",
        "data-slot": "icon",
        ref: svgRef,
        "aria-labelledby": titleId
    }, props), title ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])("title", {
        id: titleId
    }, title) : null, /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M20.25 8.511c.884.284 1.5 1.128 1.5 2.097v4.286c0 1.136-.847 2.1-1.98 2.193-.34.027-.68.052-1.02.072v3.091l-3-3c-1.354 0-2.694-.055-4.02-.163a2.115 2.115 0 0 1-.825-.242m9.345-8.334a2.126 2.126 0 0 0-.476-.095 48.64 48.64 0 0 0-8.048 0c-1.131.094-1.976 1.057-1.976 2.192v4.286c0 .837.46 1.58 1.155 1.951m9.345-8.334V6.637c0-1.621-1.152-3.026-2.76-3.235A48.455 48.455 0 0 0 11.25 3c-2.115 0-4.198.137-6.24.402-1.608.209-2.76 1.614-2.76 3.235v6.226c0 1.621 1.152 3.026 2.76 3.235.577.075 1.157.14 1.74.194V21l4.155-4.155"
    }));
}
const ForwardRef = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(ChatBubbleLeftRightIcon);
const __TURBOPACK__default__export__ = ForwardRef;
}}),
"[project]/apps/web/node_modules/@heroicons/react/24/outline/esm/ChatBubbleLeftRightIcon.js [app-client] (ecmascript) <export default as ChatBubbleLeftRightIcon>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "ChatBubbleLeftRightIcon": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChatBubbleLeftRightIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$ChatBubbleLeftRightIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/@heroicons/react/24/outline/esm/ChatBubbleLeftRightIcon.js [app-client] (ecmascript)");
}}),
"[project]/apps/web/node_modules/@heroicons/react/24/outline/esm/XMarkIcon.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
function XMarkIcon({ title, titleId, ...props }, svgRef) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])("svg", Object.assign({
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        strokeWidth: 1.5,
        stroke: "currentColor",
        "aria-hidden": "true",
        "data-slot": "icon",
        ref: svgRef,
        "aria-labelledby": titleId
    }, props), title ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])("title", {
        id: titleId
    }, title) : null, /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M6 18 18 6M6 6l12 12"
    }));
}
const ForwardRef = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(XMarkIcon);
const __TURBOPACK__default__export__ = ForwardRef;
}}),
"[project]/apps/web/node_modules/@heroicons/react/24/outline/esm/XMarkIcon.js [app-client] (ecmascript) <export default as XMarkIcon>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "XMarkIcon": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$XMarkIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$XMarkIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/@heroicons/react/24/outline/esm/XMarkIcon.js [app-client] (ecmascript)");
}}),
"[project]/apps/web/node_modules/@heroicons/react/24/outline/esm/MinusIcon.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
function MinusIcon({ title, titleId, ...props }, svgRef) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])("svg", Object.assign({
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        strokeWidth: 1.5,
        stroke: "currentColor",
        "aria-hidden": "true",
        "data-slot": "icon",
        ref: svgRef,
        "aria-labelledby": titleId
    }, props), title ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])("title", {
        id: titleId
    }, title) : null, /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M5 12h14"
    }));
}
const ForwardRef = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(MinusIcon);
const __TURBOPACK__default__export__ = ForwardRef;
}}),
"[project]/apps/web/node_modules/@heroicons/react/24/outline/esm/MinusIcon.js [app-client] (ecmascript) <export default as MinusIcon>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "MinusIcon": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$MinusIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$MinusIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/@heroicons/react/24/outline/esm/MinusIcon.js [app-client] (ecmascript)");
}}),
"[project]/apps/web/node_modules/@heroicons/react/24/outline/esm/PaperAirplaneIcon.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
function PaperAirplaneIcon({ title, titleId, ...props }, svgRef) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])("svg", Object.assign({
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        strokeWidth: 1.5,
        stroke: "currentColor",
        "aria-hidden": "true",
        "data-slot": "icon",
        ref: svgRef,
        "aria-labelledby": titleId
    }, props), title ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])("title", {
        id: titleId
    }, title) : null, /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5"
    }));
}
const ForwardRef = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(PaperAirplaneIcon);
const __TURBOPACK__default__export__ = ForwardRef;
}}),
"[project]/apps/web/node_modules/@heroicons/react/24/outline/esm/PaperAirplaneIcon.js [app-client] (ecmascript) <export default as PaperAirplaneIcon>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "PaperAirplaneIcon": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$PaperAirplaneIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$PaperAirplaneIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/@heroicons/react/24/outline/esm/PaperAirplaneIcon.js [app-client] (ecmascript)");
}}),
"[project]/apps/web/node_modules/@heroicons/react/24/outline/esm/MicrophoneIcon.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
function MicrophoneIcon({ title, titleId, ...props }, svgRef) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])("svg", Object.assign({
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        strokeWidth: 1.5,
        stroke: "currentColor",
        "aria-hidden": "true",
        "data-slot": "icon",
        ref: svgRef,
        "aria-labelledby": titleId
    }, props), title ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])("title", {
        id: titleId
    }, title) : null, /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M12 18.75a6 6 0 0 0 6-6v-1.5m-6 7.5a6 6 0 0 1-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 0 1-3-3V4.5a3 3 0 1 1 6 0v8.25a3 3 0 0 1-3 3Z"
    }));
}
const ForwardRef = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(MicrophoneIcon);
const __TURBOPACK__default__export__ = ForwardRef;
}}),
"[project]/apps/web/node_modules/@heroicons/react/24/outline/esm/MicrophoneIcon.js [app-client] (ecmascript) <export default as MicrophoneIcon>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "MicrophoneIcon": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$MicrophoneIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$MicrophoneIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/@heroicons/react/24/outline/esm/MicrophoneIcon.js [app-client] (ecmascript)");
}}),
"[project]/apps/web/node_modules/@heroicons/react/24/outline/esm/FaceSmileIcon.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
function FaceSmileIcon({ title, titleId, ...props }, svgRef) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])("svg", Object.assign({
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        strokeWidth: 1.5,
        stroke: "currentColor",
        "aria-hidden": "true",
        "data-slot": "icon",
        ref: svgRef,
        "aria-labelledby": titleId
    }, props), title ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])("title", {
        id: titleId
    }, title) : null, /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "M15.182 15.182a4.5 4.5 0 0 1-6.364 0M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0ZM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75Zm-.375 0h.008v.015h-.008V9.75Z"
    }));
}
const ForwardRef = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(FaceSmileIcon);
const __TURBOPACK__default__export__ = ForwardRef;
}}),
"[project]/apps/web/node_modules/@heroicons/react/24/outline/esm/FaceSmileIcon.js [app-client] (ecmascript) <export default as FaceSmileIcon>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "FaceSmileIcon": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$FaceSmileIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$FaceSmileIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/@heroicons/react/24/outline/esm/FaceSmileIcon.js [app-client] (ecmascript)");
}}),
"[project]/apps/web/node_modules/@heroicons/react/24/outline/esm/PhotoIcon.js [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "default": (()=>__TURBOPACK__default__export__)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
function PhotoIcon({ title, titleId, ...props }, svgRef) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])("svg", Object.assign({
        xmlns: "http://www.w3.org/2000/svg",
        fill: "none",
        viewBox: "0 0 24 24",
        strokeWidth: 1.5,
        stroke: "currentColor",
        "aria-hidden": "true",
        "data-slot": "icon",
        ref: svgRef,
        "aria-labelledby": titleId
    }, props), title ? /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])("title", {
        id: titleId
    }, title) : null, /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createElement"])("path", {
        strokeLinecap: "round",
        strokeLinejoin: "round",
        d: "m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z"
    }));
}
const ForwardRef = /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["forwardRef"])(PhotoIcon);
const __TURBOPACK__default__export__ = ForwardRef;
}}),
"[project]/apps/web/node_modules/@heroicons/react/24/outline/esm/PhotoIcon.js [app-client] (ecmascript) <export default as PhotoIcon>": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "PhotoIcon": (()=>__TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$PhotoIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"])
});
var __TURBOPACK__imported__module__$5b$project$5d2f$apps$2f$web$2f$node_modules$2f40$heroicons$2f$react$2f$24$2f$outline$2f$esm$2f$PhotoIcon$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/apps/web/node_modules/@heroicons/react/24/outline/esm/PhotoIcon.js [app-client] (ecmascript)");
}}),
}]);

//# sourceMappingURL=_35826a58._.js.map