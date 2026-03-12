"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// node_modules/vscode-languageclient/lib/common/utils/is.js
var require_is = __commonJS({
  "node_modules/vscode-languageclient/lib/common/utils/is.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.asPromise = exports2.thenable = exports2.typedArray = exports2.stringArray = exports2.array = exports2.func = exports2.error = exports2.number = exports2.string = exports2.boolean = void 0;
    function boolean(value) {
      return value === true || value === false;
    }
    exports2.boolean = boolean;
    function string(value) {
      return typeof value === "string" || value instanceof String;
    }
    exports2.string = string;
    function number(value) {
      return typeof value === "number" || value instanceof Number;
    }
    exports2.number = number;
    function error(value) {
      return value instanceof Error;
    }
    exports2.error = error;
    function func(value) {
      return typeof value === "function";
    }
    exports2.func = func;
    function array(value) {
      return Array.isArray(value);
    }
    exports2.array = array;
    function stringArray(value) {
      return array(value) && value.every((elem) => string(elem));
    }
    exports2.stringArray = stringArray;
    function typedArray(value, check) {
      return Array.isArray(value) && value.every(check);
    }
    exports2.typedArray = typedArray;
    function thenable(value) {
      return value && func(value.then);
    }
    exports2.thenable = thenable;
    function asPromise(value) {
      if (value instanceof Promise) {
        return value;
      } else if (thenable(value)) {
        return new Promise((resolve, reject) => {
          value.then((resolved) => resolve(resolved), (error2) => reject(error2));
        });
      } else {
        return Promise.resolve(value);
      }
    }
    exports2.asPromise = asPromise;
  }
});

// node_modules/vscode-jsonrpc/lib/common/is.js
var require_is2 = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/is.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.stringArray = exports2.array = exports2.func = exports2.error = exports2.number = exports2.string = exports2.boolean = void 0;
    function boolean(value) {
      return value === true || value === false;
    }
    exports2.boolean = boolean;
    function string(value) {
      return typeof value === "string" || value instanceof String;
    }
    exports2.string = string;
    function number(value) {
      return typeof value === "number" || value instanceof Number;
    }
    exports2.number = number;
    function error(value) {
      return value instanceof Error;
    }
    exports2.error = error;
    function func(value) {
      return typeof value === "function";
    }
    exports2.func = func;
    function array(value) {
      return Array.isArray(value);
    }
    exports2.array = array;
    function stringArray(value) {
      return array(value) && value.every((elem) => string(elem));
    }
    exports2.stringArray = stringArray;
  }
});

// node_modules/vscode-jsonrpc/lib/common/messages.js
var require_messages = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/messages.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Message = exports2.NotificationType9 = exports2.NotificationType8 = exports2.NotificationType7 = exports2.NotificationType6 = exports2.NotificationType5 = exports2.NotificationType4 = exports2.NotificationType3 = exports2.NotificationType2 = exports2.NotificationType1 = exports2.NotificationType0 = exports2.NotificationType = exports2.RequestType9 = exports2.RequestType8 = exports2.RequestType7 = exports2.RequestType6 = exports2.RequestType5 = exports2.RequestType4 = exports2.RequestType3 = exports2.RequestType2 = exports2.RequestType1 = exports2.RequestType = exports2.RequestType0 = exports2.AbstractMessageSignature = exports2.ParameterStructures = exports2.ResponseError = exports2.ErrorCodes = void 0;
    var is = require_is2();
    var ErrorCodes;
    (function(ErrorCodes2) {
      ErrorCodes2.ParseError = -32700;
      ErrorCodes2.InvalidRequest = -32600;
      ErrorCodes2.MethodNotFound = -32601;
      ErrorCodes2.InvalidParams = -32602;
      ErrorCodes2.InternalError = -32603;
      ErrorCodes2.jsonrpcReservedErrorRangeStart = -32099;
      ErrorCodes2.serverErrorStart = -32099;
      ErrorCodes2.MessageWriteError = -32099;
      ErrorCodes2.MessageReadError = -32098;
      ErrorCodes2.PendingResponseRejected = -32097;
      ErrorCodes2.ConnectionInactive = -32096;
      ErrorCodes2.ServerNotInitialized = -32002;
      ErrorCodes2.UnknownErrorCode = -32001;
      ErrorCodes2.jsonrpcReservedErrorRangeEnd = -32e3;
      ErrorCodes2.serverErrorEnd = -32e3;
    })(ErrorCodes || (exports2.ErrorCodes = ErrorCodes = {}));
    var ResponseError = class _ResponseError extends Error {
      constructor(code, message, data) {
        super(message);
        this.code = is.number(code) ? code : ErrorCodes.UnknownErrorCode;
        this.data = data;
        Object.setPrototypeOf(this, _ResponseError.prototype);
      }
      toJson() {
        const result = {
          code: this.code,
          message: this.message
        };
        if (this.data !== void 0) {
          result.data = this.data;
        }
        return result;
      }
    };
    exports2.ResponseError = ResponseError;
    var ParameterStructures = class _ParameterStructures {
      constructor(kind) {
        this.kind = kind;
      }
      static is(value) {
        return value === _ParameterStructures.auto || value === _ParameterStructures.byName || value === _ParameterStructures.byPosition;
      }
      toString() {
        return this.kind;
      }
    };
    exports2.ParameterStructures = ParameterStructures;
    ParameterStructures.auto = new ParameterStructures("auto");
    ParameterStructures.byPosition = new ParameterStructures("byPosition");
    ParameterStructures.byName = new ParameterStructures("byName");
    var AbstractMessageSignature = class {
      constructor(method, numberOfParams) {
        this.method = method;
        this.numberOfParams = numberOfParams;
      }
      get parameterStructures() {
        return ParameterStructures.auto;
      }
    };
    exports2.AbstractMessageSignature = AbstractMessageSignature;
    var RequestType0 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 0);
      }
    };
    exports2.RequestType0 = RequestType0;
    var RequestType = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports2.RequestType = RequestType;
    var RequestType1 = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports2.RequestType1 = RequestType1;
    var RequestType2 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 2);
      }
    };
    exports2.RequestType2 = RequestType2;
    var RequestType3 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 3);
      }
    };
    exports2.RequestType3 = RequestType3;
    var RequestType4 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 4);
      }
    };
    exports2.RequestType4 = RequestType4;
    var RequestType5 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 5);
      }
    };
    exports2.RequestType5 = RequestType5;
    var RequestType6 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 6);
      }
    };
    exports2.RequestType6 = RequestType6;
    var RequestType7 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 7);
      }
    };
    exports2.RequestType7 = RequestType7;
    var RequestType8 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 8);
      }
    };
    exports2.RequestType8 = RequestType8;
    var RequestType9 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 9);
      }
    };
    exports2.RequestType9 = RequestType9;
    var NotificationType = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports2.NotificationType = NotificationType;
    var NotificationType0 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 0);
      }
    };
    exports2.NotificationType0 = NotificationType0;
    var NotificationType1 = class extends AbstractMessageSignature {
      constructor(method, _parameterStructures = ParameterStructures.auto) {
        super(method, 1);
        this._parameterStructures = _parameterStructures;
      }
      get parameterStructures() {
        return this._parameterStructures;
      }
    };
    exports2.NotificationType1 = NotificationType1;
    var NotificationType2 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 2);
      }
    };
    exports2.NotificationType2 = NotificationType2;
    var NotificationType3 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 3);
      }
    };
    exports2.NotificationType3 = NotificationType3;
    var NotificationType4 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 4);
      }
    };
    exports2.NotificationType4 = NotificationType4;
    var NotificationType5 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 5);
      }
    };
    exports2.NotificationType5 = NotificationType5;
    var NotificationType6 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 6);
      }
    };
    exports2.NotificationType6 = NotificationType6;
    var NotificationType7 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 7);
      }
    };
    exports2.NotificationType7 = NotificationType7;
    var NotificationType8 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 8);
      }
    };
    exports2.NotificationType8 = NotificationType8;
    var NotificationType9 = class extends AbstractMessageSignature {
      constructor(method) {
        super(method, 9);
      }
    };
    exports2.NotificationType9 = NotificationType9;
    var Message;
    (function(Message2) {
      function isRequest(message) {
        const candidate = message;
        return candidate && is.string(candidate.method) && (is.string(candidate.id) || is.number(candidate.id));
      }
      Message2.isRequest = isRequest;
      function isNotification(message) {
        const candidate = message;
        return candidate && is.string(candidate.method) && message.id === void 0;
      }
      Message2.isNotification = isNotification;
      function isResponse(message) {
        const candidate = message;
        return candidate && (candidate.result !== void 0 || !!candidate.error) && (is.string(candidate.id) || is.number(candidate.id) || candidate.id === null);
      }
      Message2.isResponse = isResponse;
    })(Message || (exports2.Message = Message = {}));
  }
});

// node_modules/vscode-jsonrpc/lib/common/linkedMap.js
var require_linkedMap = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/linkedMap.js"(exports2) {
    "use strict";
    var _a;
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LRUCache = exports2.LinkedMap = exports2.Touch = void 0;
    var Touch;
    (function(Touch2) {
      Touch2.None = 0;
      Touch2.First = 1;
      Touch2.AsOld = Touch2.First;
      Touch2.Last = 2;
      Touch2.AsNew = Touch2.Last;
    })(Touch || (exports2.Touch = Touch = {}));
    var LinkedMap = class {
      constructor() {
        this[_a] = "LinkedMap";
        this._map = /* @__PURE__ */ new Map();
        this._head = void 0;
        this._tail = void 0;
        this._size = 0;
        this._state = 0;
      }
      clear() {
        this._map.clear();
        this._head = void 0;
        this._tail = void 0;
        this._size = 0;
        this._state++;
      }
      isEmpty() {
        return !this._head && !this._tail;
      }
      get size() {
        return this._size;
      }
      get first() {
        return this._head?.value;
      }
      get last() {
        return this._tail?.value;
      }
      has(key) {
        return this._map.has(key);
      }
      get(key, touch = Touch.None) {
        const item = this._map.get(key);
        if (!item) {
          return void 0;
        }
        if (touch !== Touch.None) {
          this.touch(item, touch);
        }
        return item.value;
      }
      set(key, value, touch = Touch.None) {
        let item = this._map.get(key);
        if (item) {
          item.value = value;
          if (touch !== Touch.None) {
            this.touch(item, touch);
          }
        } else {
          item = { key, value, next: void 0, previous: void 0 };
          switch (touch) {
            case Touch.None:
              this.addItemLast(item);
              break;
            case Touch.First:
              this.addItemFirst(item);
              break;
            case Touch.Last:
              this.addItemLast(item);
              break;
            default:
              this.addItemLast(item);
              break;
          }
          this._map.set(key, item);
          this._size++;
        }
        return this;
      }
      delete(key) {
        return !!this.remove(key);
      }
      remove(key) {
        const item = this._map.get(key);
        if (!item) {
          return void 0;
        }
        this._map.delete(key);
        this.removeItem(item);
        this._size--;
        return item.value;
      }
      shift() {
        if (!this._head && !this._tail) {
          return void 0;
        }
        if (!this._head || !this._tail) {
          throw new Error("Invalid list");
        }
        const item = this._head;
        this._map.delete(item.key);
        this.removeItem(item);
        this._size--;
        return item.value;
      }
      forEach(callbackfn, thisArg) {
        const state = this._state;
        let current = this._head;
        while (current) {
          if (thisArg) {
            callbackfn.bind(thisArg)(current.value, current.key, this);
          } else {
            callbackfn(current.value, current.key, this);
          }
          if (this._state !== state) {
            throw new Error(`LinkedMap got modified during iteration.`);
          }
          current = current.next;
        }
      }
      keys() {
        const state = this._state;
        let current = this._head;
        const iterator = {
          [Symbol.iterator]: () => {
            return iterator;
          },
          next: () => {
            if (this._state !== state) {
              throw new Error(`LinkedMap got modified during iteration.`);
            }
            if (current) {
              const result = { value: current.key, done: false };
              current = current.next;
              return result;
            } else {
              return { value: void 0, done: true };
            }
          }
        };
        return iterator;
      }
      values() {
        const state = this._state;
        let current = this._head;
        const iterator = {
          [Symbol.iterator]: () => {
            return iterator;
          },
          next: () => {
            if (this._state !== state) {
              throw new Error(`LinkedMap got modified during iteration.`);
            }
            if (current) {
              const result = { value: current.value, done: false };
              current = current.next;
              return result;
            } else {
              return { value: void 0, done: true };
            }
          }
        };
        return iterator;
      }
      entries() {
        const state = this._state;
        let current = this._head;
        const iterator = {
          [Symbol.iterator]: () => {
            return iterator;
          },
          next: () => {
            if (this._state !== state) {
              throw new Error(`LinkedMap got modified during iteration.`);
            }
            if (current) {
              const result = { value: [current.key, current.value], done: false };
              current = current.next;
              return result;
            } else {
              return { value: void 0, done: true };
            }
          }
        };
        return iterator;
      }
      [(_a = Symbol.toStringTag, Symbol.iterator)]() {
        return this.entries();
      }
      trimOld(newSize) {
        if (newSize >= this.size) {
          return;
        }
        if (newSize === 0) {
          this.clear();
          return;
        }
        let current = this._head;
        let currentSize = this.size;
        while (current && currentSize > newSize) {
          this._map.delete(current.key);
          current = current.next;
          currentSize--;
        }
        this._head = current;
        this._size = currentSize;
        if (current) {
          current.previous = void 0;
        }
        this._state++;
      }
      addItemFirst(item) {
        if (!this._head && !this._tail) {
          this._tail = item;
        } else if (!this._head) {
          throw new Error("Invalid list");
        } else {
          item.next = this._head;
          this._head.previous = item;
        }
        this._head = item;
        this._state++;
      }
      addItemLast(item) {
        if (!this._head && !this._tail) {
          this._head = item;
        } else if (!this._tail) {
          throw new Error("Invalid list");
        } else {
          item.previous = this._tail;
          this._tail.next = item;
        }
        this._tail = item;
        this._state++;
      }
      removeItem(item) {
        if (item === this._head && item === this._tail) {
          this._head = void 0;
          this._tail = void 0;
        } else if (item === this._head) {
          if (!item.next) {
            throw new Error("Invalid list");
          }
          item.next.previous = void 0;
          this._head = item.next;
        } else if (item === this._tail) {
          if (!item.previous) {
            throw new Error("Invalid list");
          }
          item.previous.next = void 0;
          this._tail = item.previous;
        } else {
          const next = item.next;
          const previous = item.previous;
          if (!next || !previous) {
            throw new Error("Invalid list");
          }
          next.previous = previous;
          previous.next = next;
        }
        item.next = void 0;
        item.previous = void 0;
        this._state++;
      }
      touch(item, touch) {
        if (!this._head || !this._tail) {
          throw new Error("Invalid list");
        }
        if (touch !== Touch.First && touch !== Touch.Last) {
          return;
        }
        if (touch === Touch.First) {
          if (item === this._head) {
            return;
          }
          const next = item.next;
          const previous = item.previous;
          if (item === this._tail) {
            previous.next = void 0;
            this._tail = previous;
          } else {
            next.previous = previous;
            previous.next = next;
          }
          item.previous = void 0;
          item.next = this._head;
          this._head.previous = item;
          this._head = item;
          this._state++;
        } else if (touch === Touch.Last) {
          if (item === this._tail) {
            return;
          }
          const next = item.next;
          const previous = item.previous;
          if (item === this._head) {
            next.previous = void 0;
            this._head = next;
          } else {
            next.previous = previous;
            previous.next = next;
          }
          item.next = void 0;
          item.previous = this._tail;
          this._tail.next = item;
          this._tail = item;
          this._state++;
        }
      }
      toJSON() {
        const data = [];
        this.forEach((value, key) => {
          data.push([key, value]);
        });
        return data;
      }
      fromJSON(data) {
        this.clear();
        for (const [key, value] of data) {
          this.set(key, value);
        }
      }
    };
    exports2.LinkedMap = LinkedMap;
    var LRUCache = class extends LinkedMap {
      constructor(limit, ratio = 1) {
        super();
        this._limit = limit;
        this._ratio = Math.min(Math.max(0, ratio), 1);
      }
      get limit() {
        return this._limit;
      }
      set limit(limit) {
        this._limit = limit;
        this.checkTrim();
      }
      get ratio() {
        return this._ratio;
      }
      set ratio(ratio) {
        this._ratio = Math.min(Math.max(0, ratio), 1);
        this.checkTrim();
      }
      get(key, touch = Touch.AsNew) {
        return super.get(key, touch);
      }
      peek(key) {
        return super.get(key, Touch.None);
      }
      set(key, value) {
        super.set(key, value, Touch.Last);
        this.checkTrim();
        return this;
      }
      checkTrim() {
        if (this.size > this._limit) {
          this.trimOld(Math.round(this._limit * this._ratio));
        }
      }
    };
    exports2.LRUCache = LRUCache;
  }
});

// node_modules/vscode-jsonrpc/lib/common/disposable.js
var require_disposable = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/disposable.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Disposable = void 0;
    var Disposable2;
    (function(Disposable3) {
      function create(func) {
        return {
          dispose: func
        };
      }
      Disposable3.create = create;
    })(Disposable2 || (exports2.Disposable = Disposable2 = {}));
  }
});

// node_modules/vscode-jsonrpc/lib/common/ral.js
var require_ral = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/ral.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var _ral;
    function RAL() {
      if (_ral === void 0) {
        throw new Error(`No runtime abstraction layer installed`);
      }
      return _ral;
    }
    (function(RAL2) {
      function install(ral) {
        if (ral === void 0) {
          throw new Error(`No runtime abstraction layer provided`);
        }
        _ral = ral;
      }
      RAL2.install = install;
    })(RAL || (RAL = {}));
    exports2.default = RAL;
  }
});

// node_modules/vscode-jsonrpc/lib/common/events.js
var require_events = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/events.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Emitter = exports2.Event = void 0;
    var ral_1 = require_ral();
    var Event;
    (function(Event2) {
      const _disposable = { dispose() {
      } };
      Event2.None = function() {
        return _disposable;
      };
    })(Event || (exports2.Event = Event = {}));
    var CallbackList = class {
      add(callback, context = null, bucket) {
        if (!this._callbacks) {
          this._callbacks = [];
          this._contexts = [];
        }
        this._callbacks.push(callback);
        this._contexts.push(context);
        if (Array.isArray(bucket)) {
          bucket.push({ dispose: () => this.remove(callback, context) });
        }
      }
      remove(callback, context = null) {
        if (!this._callbacks) {
          return;
        }
        let foundCallbackWithDifferentContext = false;
        for (let i = 0, len = this._callbacks.length; i < len; i++) {
          if (this._callbacks[i] === callback) {
            if (this._contexts[i] === context) {
              this._callbacks.splice(i, 1);
              this._contexts.splice(i, 1);
              return;
            } else {
              foundCallbackWithDifferentContext = true;
            }
          }
        }
        if (foundCallbackWithDifferentContext) {
          throw new Error("When adding a listener with a context, you should remove it with the same context");
        }
      }
      invoke(...args) {
        if (!this._callbacks) {
          return [];
        }
        const ret = [], callbacks = this._callbacks.slice(0), contexts = this._contexts.slice(0);
        for (let i = 0, len = callbacks.length; i < len; i++) {
          try {
            ret.push(callbacks[i].apply(contexts[i], args));
          } catch (e) {
            (0, ral_1.default)().console.error(e);
          }
        }
        return ret;
      }
      isEmpty() {
        return !this._callbacks || this._callbacks.length === 0;
      }
      dispose() {
        this._callbacks = void 0;
        this._contexts = void 0;
      }
    };
    var Emitter = class _Emitter {
      constructor(_options) {
        this._options = _options;
      }
      /**
       * For the public to allow to subscribe
       * to events from this Emitter
       */
      get event() {
        if (!this._event) {
          this._event = (listener, thisArgs, disposables) => {
            if (!this._callbacks) {
              this._callbacks = new CallbackList();
            }
            if (this._options && this._options.onFirstListenerAdd && this._callbacks.isEmpty()) {
              this._options.onFirstListenerAdd(this);
            }
            this._callbacks.add(listener, thisArgs);
            const result = {
              dispose: () => {
                if (!this._callbacks) {
                  return;
                }
                this._callbacks.remove(listener, thisArgs);
                result.dispose = _Emitter._noop;
                if (this._options && this._options.onLastListenerRemove && this._callbacks.isEmpty()) {
                  this._options.onLastListenerRemove(this);
                }
              }
            };
            if (Array.isArray(disposables)) {
              disposables.push(result);
            }
            return result;
          };
        }
        return this._event;
      }
      /**
       * To be kept private to fire an event to
       * subscribers
       */
      fire(event) {
        if (this._callbacks) {
          this._callbacks.invoke.call(this._callbacks, event);
        }
      }
      dispose() {
        if (this._callbacks) {
          this._callbacks.dispose();
          this._callbacks = void 0;
        }
      }
    };
    exports2.Emitter = Emitter;
    Emitter._noop = function() {
    };
  }
});

// node_modules/vscode-jsonrpc/lib/common/cancellation.js
var require_cancellation = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/cancellation.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CancellationTokenSource = exports2.CancellationToken = void 0;
    var ral_1 = require_ral();
    var Is = require_is2();
    var events_1 = require_events();
    var CancellationToken;
    (function(CancellationToken2) {
      CancellationToken2.None = Object.freeze({
        isCancellationRequested: false,
        onCancellationRequested: events_1.Event.None
      });
      CancellationToken2.Cancelled = Object.freeze({
        isCancellationRequested: true,
        onCancellationRequested: events_1.Event.None
      });
      function is(value) {
        const candidate = value;
        return candidate && (candidate === CancellationToken2.None || candidate === CancellationToken2.Cancelled || Is.boolean(candidate.isCancellationRequested) && !!candidate.onCancellationRequested);
      }
      CancellationToken2.is = is;
    })(CancellationToken || (exports2.CancellationToken = CancellationToken = {}));
    var shortcutEvent = Object.freeze(function(callback, context) {
      const handle = (0, ral_1.default)().timer.setTimeout(callback.bind(context), 0);
      return { dispose() {
        handle.dispose();
      } };
    });
    var MutableToken = class {
      constructor() {
        this._isCancelled = false;
      }
      cancel() {
        if (!this._isCancelled) {
          this._isCancelled = true;
          if (this._emitter) {
            this._emitter.fire(void 0);
            this.dispose();
          }
        }
      }
      get isCancellationRequested() {
        return this._isCancelled;
      }
      get onCancellationRequested() {
        if (this._isCancelled) {
          return shortcutEvent;
        }
        if (!this._emitter) {
          this._emitter = new events_1.Emitter();
        }
        return this._emitter.event;
      }
      dispose() {
        if (this._emitter) {
          this._emitter.dispose();
          this._emitter = void 0;
        }
      }
    };
    var CancellationTokenSource = class {
      get token() {
        if (!this._token) {
          this._token = new MutableToken();
        }
        return this._token;
      }
      cancel() {
        if (!this._token) {
          this._token = CancellationToken.Cancelled;
        } else {
          this._token.cancel();
        }
      }
      dispose() {
        if (!this._token) {
          this._token = CancellationToken.None;
        } else if (this._token instanceof MutableToken) {
          this._token.dispose();
        }
      }
    };
    exports2.CancellationTokenSource = CancellationTokenSource;
  }
});

// node_modules/vscode-jsonrpc/lib/common/sharedArrayCancellation.js
var require_sharedArrayCancellation = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/sharedArrayCancellation.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SharedArrayReceiverStrategy = exports2.SharedArraySenderStrategy = void 0;
    var cancellation_1 = require_cancellation();
    var CancellationState;
    (function(CancellationState2) {
      CancellationState2.Continue = 0;
      CancellationState2.Cancelled = 1;
    })(CancellationState || (CancellationState = {}));
    var SharedArraySenderStrategy = class {
      constructor() {
        this.buffers = /* @__PURE__ */ new Map();
      }
      enableCancellation(request) {
        if (request.id === null) {
          return;
        }
        const buffer = new SharedArrayBuffer(4);
        const data = new Int32Array(buffer, 0, 1);
        data[0] = CancellationState.Continue;
        this.buffers.set(request.id, buffer);
        request.$cancellationData = buffer;
      }
      async sendCancellation(_conn, id) {
        const buffer = this.buffers.get(id);
        if (buffer === void 0) {
          return;
        }
        const data = new Int32Array(buffer, 0, 1);
        Atomics.store(data, 0, CancellationState.Cancelled);
      }
      cleanup(id) {
        this.buffers.delete(id);
      }
      dispose() {
        this.buffers.clear();
      }
    };
    exports2.SharedArraySenderStrategy = SharedArraySenderStrategy;
    var SharedArrayBufferCancellationToken = class {
      constructor(buffer) {
        this.data = new Int32Array(buffer, 0, 1);
      }
      get isCancellationRequested() {
        return Atomics.load(this.data, 0) === CancellationState.Cancelled;
      }
      get onCancellationRequested() {
        throw new Error(`Cancellation over SharedArrayBuffer doesn't support cancellation events`);
      }
    };
    var SharedArrayBufferCancellationTokenSource = class {
      constructor(buffer) {
        this.token = new SharedArrayBufferCancellationToken(buffer);
      }
      cancel() {
      }
      dispose() {
      }
    };
    var SharedArrayReceiverStrategy = class {
      constructor() {
        this.kind = "request";
      }
      createCancellationTokenSource(request) {
        const buffer = request.$cancellationData;
        if (buffer === void 0) {
          return new cancellation_1.CancellationTokenSource();
        }
        return new SharedArrayBufferCancellationTokenSource(buffer);
      }
    };
    exports2.SharedArrayReceiverStrategy = SharedArrayReceiverStrategy;
  }
});

// node_modules/vscode-jsonrpc/lib/common/semaphore.js
var require_semaphore = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/semaphore.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.Semaphore = void 0;
    var ral_1 = require_ral();
    var Semaphore = class {
      constructor(capacity = 1) {
        if (capacity <= 0) {
          throw new Error("Capacity must be greater than 0");
        }
        this._capacity = capacity;
        this._active = 0;
        this._waiting = [];
      }
      lock(thunk) {
        return new Promise((resolve, reject) => {
          this._waiting.push({ thunk, resolve, reject });
          this.runNext();
        });
      }
      get active() {
        return this._active;
      }
      runNext() {
        if (this._waiting.length === 0 || this._active === this._capacity) {
          return;
        }
        (0, ral_1.default)().timer.setImmediate(() => this.doRunNext());
      }
      doRunNext() {
        if (this._waiting.length === 0 || this._active === this._capacity) {
          return;
        }
        const next = this._waiting.shift();
        this._active++;
        if (this._active > this._capacity) {
          throw new Error(`To many thunks active`);
        }
        try {
          const result = next.thunk();
          if (result instanceof Promise) {
            result.then((value) => {
              this._active--;
              next.resolve(value);
              this.runNext();
            }, (err) => {
              this._active--;
              next.reject(err);
              this.runNext();
            });
          } else {
            this._active--;
            next.resolve(result);
            this.runNext();
          }
        } catch (err) {
          this._active--;
          next.reject(err);
          this.runNext();
        }
      }
    };
    exports2.Semaphore = Semaphore;
  }
});

// node_modules/vscode-jsonrpc/lib/common/messageReader.js
var require_messageReader = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/messageReader.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReadableStreamMessageReader = exports2.AbstractMessageReader = exports2.MessageReader = void 0;
    var ral_1 = require_ral();
    var Is = require_is2();
    var events_1 = require_events();
    var semaphore_1 = require_semaphore();
    var MessageReader;
    (function(MessageReader2) {
      function is(value) {
        let candidate = value;
        return candidate && Is.func(candidate.listen) && Is.func(candidate.dispose) && Is.func(candidate.onError) && Is.func(candidate.onClose) && Is.func(candidate.onPartialMessage);
      }
      MessageReader2.is = is;
    })(MessageReader || (exports2.MessageReader = MessageReader = {}));
    var AbstractMessageReader = class {
      constructor() {
        this.errorEmitter = new events_1.Emitter();
        this.closeEmitter = new events_1.Emitter();
        this.partialMessageEmitter = new events_1.Emitter();
      }
      dispose() {
        this.errorEmitter.dispose();
        this.closeEmitter.dispose();
      }
      get onError() {
        return this.errorEmitter.event;
      }
      fireError(error) {
        this.errorEmitter.fire(this.asError(error));
      }
      get onClose() {
        return this.closeEmitter.event;
      }
      fireClose() {
        this.closeEmitter.fire(void 0);
      }
      get onPartialMessage() {
        return this.partialMessageEmitter.event;
      }
      firePartialMessage(info) {
        this.partialMessageEmitter.fire(info);
      }
      asError(error) {
        if (error instanceof Error) {
          return error;
        } else {
          return new Error(`Reader received error. Reason: ${Is.string(error.message) ? error.message : "unknown"}`);
        }
      }
    };
    exports2.AbstractMessageReader = AbstractMessageReader;
    var ResolvedMessageReaderOptions;
    (function(ResolvedMessageReaderOptions2) {
      function fromOptions(options) {
        let charset;
        let result;
        let contentDecoder;
        const contentDecoders = /* @__PURE__ */ new Map();
        let contentTypeDecoder;
        const contentTypeDecoders = /* @__PURE__ */ new Map();
        if (options === void 0 || typeof options === "string") {
          charset = options ?? "utf-8";
        } else {
          charset = options.charset ?? "utf-8";
          if (options.contentDecoder !== void 0) {
            contentDecoder = options.contentDecoder;
            contentDecoders.set(contentDecoder.name, contentDecoder);
          }
          if (options.contentDecoders !== void 0) {
            for (const decoder of options.contentDecoders) {
              contentDecoders.set(decoder.name, decoder);
            }
          }
          if (options.contentTypeDecoder !== void 0) {
            contentTypeDecoder = options.contentTypeDecoder;
            contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
          }
          if (options.contentTypeDecoders !== void 0) {
            for (const decoder of options.contentTypeDecoders) {
              contentTypeDecoders.set(decoder.name, decoder);
            }
          }
        }
        if (contentTypeDecoder === void 0) {
          contentTypeDecoder = (0, ral_1.default)().applicationJson.decoder;
          contentTypeDecoders.set(contentTypeDecoder.name, contentTypeDecoder);
        }
        return { charset, contentDecoder, contentDecoders, contentTypeDecoder, contentTypeDecoders };
      }
      ResolvedMessageReaderOptions2.fromOptions = fromOptions;
    })(ResolvedMessageReaderOptions || (ResolvedMessageReaderOptions = {}));
    var ReadableStreamMessageReader = class extends AbstractMessageReader {
      constructor(readable, options) {
        super();
        this.readable = readable;
        this.options = ResolvedMessageReaderOptions.fromOptions(options);
        this.buffer = (0, ral_1.default)().messageBuffer.create(this.options.charset);
        this._partialMessageTimeout = 1e4;
        this.nextMessageLength = -1;
        this.messageToken = 0;
        this.readSemaphore = new semaphore_1.Semaphore(1);
      }
      set partialMessageTimeout(timeout) {
        this._partialMessageTimeout = timeout;
      }
      get partialMessageTimeout() {
        return this._partialMessageTimeout;
      }
      listen(callback) {
        this.nextMessageLength = -1;
        this.messageToken = 0;
        this.partialMessageTimer = void 0;
        this.callback = callback;
        const result = this.readable.onData((data) => {
          this.onData(data);
        });
        this.readable.onError((error) => this.fireError(error));
        this.readable.onClose(() => this.fireClose());
        return result;
      }
      onData(data) {
        try {
          this.buffer.append(data);
          while (true) {
            if (this.nextMessageLength === -1) {
              const headers = this.buffer.tryReadHeaders(true);
              if (!headers) {
                return;
              }
              const contentLength = headers.get("content-length");
              if (!contentLength) {
                this.fireError(new Error(`Header must provide a Content-Length property.
${JSON.stringify(Object.fromEntries(headers))}`));
                return;
              }
              const length = parseInt(contentLength);
              if (isNaN(length)) {
                this.fireError(new Error(`Content-Length value must be a number. Got ${contentLength}`));
                return;
              }
              this.nextMessageLength = length;
            }
            const body = this.buffer.tryReadBody(this.nextMessageLength);
            if (body === void 0) {
              this.setPartialMessageTimer();
              return;
            }
            this.clearPartialMessageTimer();
            this.nextMessageLength = -1;
            this.readSemaphore.lock(async () => {
              const bytes = this.options.contentDecoder !== void 0 ? await this.options.contentDecoder.decode(body) : body;
              const message = await this.options.contentTypeDecoder.decode(bytes, this.options);
              this.callback(message);
            }).catch((error) => {
              this.fireError(error);
            });
          }
        } catch (error) {
          this.fireError(error);
        }
      }
      clearPartialMessageTimer() {
        if (this.partialMessageTimer) {
          this.partialMessageTimer.dispose();
          this.partialMessageTimer = void 0;
        }
      }
      setPartialMessageTimer() {
        this.clearPartialMessageTimer();
        if (this._partialMessageTimeout <= 0) {
          return;
        }
        this.partialMessageTimer = (0, ral_1.default)().timer.setTimeout((token, timeout) => {
          this.partialMessageTimer = void 0;
          if (token === this.messageToken) {
            this.firePartialMessage({ messageToken: token, waitingTime: timeout });
            this.setPartialMessageTimer();
          }
        }, this._partialMessageTimeout, this.messageToken, this._partialMessageTimeout);
      }
    };
    exports2.ReadableStreamMessageReader = ReadableStreamMessageReader;
  }
});

// node_modules/vscode-jsonrpc/lib/common/messageWriter.js
var require_messageWriter = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/messageWriter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WriteableStreamMessageWriter = exports2.AbstractMessageWriter = exports2.MessageWriter = void 0;
    var ral_1 = require_ral();
    var Is = require_is2();
    var semaphore_1 = require_semaphore();
    var events_1 = require_events();
    var ContentLength = "Content-Length: ";
    var CRLF = "\r\n";
    var MessageWriter;
    (function(MessageWriter2) {
      function is(value) {
        let candidate = value;
        return candidate && Is.func(candidate.dispose) && Is.func(candidate.onClose) && Is.func(candidate.onError) && Is.func(candidate.write);
      }
      MessageWriter2.is = is;
    })(MessageWriter || (exports2.MessageWriter = MessageWriter = {}));
    var AbstractMessageWriter = class {
      constructor() {
        this.errorEmitter = new events_1.Emitter();
        this.closeEmitter = new events_1.Emitter();
      }
      dispose() {
        this.errorEmitter.dispose();
        this.closeEmitter.dispose();
      }
      get onError() {
        return this.errorEmitter.event;
      }
      fireError(error, message, count) {
        this.errorEmitter.fire([this.asError(error), message, count]);
      }
      get onClose() {
        return this.closeEmitter.event;
      }
      fireClose() {
        this.closeEmitter.fire(void 0);
      }
      asError(error) {
        if (error instanceof Error) {
          return error;
        } else {
          return new Error(`Writer received error. Reason: ${Is.string(error.message) ? error.message : "unknown"}`);
        }
      }
    };
    exports2.AbstractMessageWriter = AbstractMessageWriter;
    var ResolvedMessageWriterOptions;
    (function(ResolvedMessageWriterOptions2) {
      function fromOptions(options) {
        if (options === void 0 || typeof options === "string") {
          return { charset: options ?? "utf-8", contentTypeEncoder: (0, ral_1.default)().applicationJson.encoder };
        } else {
          return { charset: options.charset ?? "utf-8", contentEncoder: options.contentEncoder, contentTypeEncoder: options.contentTypeEncoder ?? (0, ral_1.default)().applicationJson.encoder };
        }
      }
      ResolvedMessageWriterOptions2.fromOptions = fromOptions;
    })(ResolvedMessageWriterOptions || (ResolvedMessageWriterOptions = {}));
    var WriteableStreamMessageWriter = class extends AbstractMessageWriter {
      constructor(writable, options) {
        super();
        this.writable = writable;
        this.options = ResolvedMessageWriterOptions.fromOptions(options);
        this.errorCount = 0;
        this.writeSemaphore = new semaphore_1.Semaphore(1);
        this.writable.onError((error) => this.fireError(error));
        this.writable.onClose(() => this.fireClose());
      }
      async write(msg) {
        return this.writeSemaphore.lock(async () => {
          const payload = this.options.contentTypeEncoder.encode(msg, this.options).then((buffer) => {
            if (this.options.contentEncoder !== void 0) {
              return this.options.contentEncoder.encode(buffer);
            } else {
              return buffer;
            }
          });
          return payload.then((buffer) => {
            const headers = [];
            headers.push(ContentLength, buffer.byteLength.toString(), CRLF);
            headers.push(CRLF);
            return this.doWrite(msg, headers, buffer);
          }, (error) => {
            this.fireError(error);
            throw error;
          });
        });
      }
      async doWrite(msg, headers, data) {
        try {
          await this.writable.write(headers.join(""), "ascii");
          return this.writable.write(data);
        } catch (error) {
          this.handleError(error, msg);
          return Promise.reject(error);
        }
      }
      handleError(error, msg) {
        this.errorCount++;
        this.fireError(error, msg, this.errorCount);
      }
      end() {
        this.writable.end();
      }
    };
    exports2.WriteableStreamMessageWriter = WriteableStreamMessageWriter;
  }
});

// node_modules/vscode-jsonrpc/lib/common/messageBuffer.js
var require_messageBuffer = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/messageBuffer.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.AbstractMessageBuffer = void 0;
    var CR = 13;
    var LF = 10;
    var CRLF = "\r\n";
    var AbstractMessageBuffer = class {
      constructor(encoding = "utf-8") {
        this._encoding = encoding;
        this._chunks = [];
        this._totalLength = 0;
      }
      get encoding() {
        return this._encoding;
      }
      append(chunk) {
        const toAppend = typeof chunk === "string" ? this.fromString(chunk, this._encoding) : chunk;
        this._chunks.push(toAppend);
        this._totalLength += toAppend.byteLength;
      }
      tryReadHeaders(lowerCaseKeys = false) {
        if (this._chunks.length === 0) {
          return void 0;
        }
        let state = 0;
        let chunkIndex = 0;
        let offset = 0;
        let chunkBytesRead = 0;
        row: while (chunkIndex < this._chunks.length) {
          const chunk = this._chunks[chunkIndex];
          offset = 0;
          column: while (offset < chunk.length) {
            const value = chunk[offset];
            switch (value) {
              case CR:
                switch (state) {
                  case 0:
                    state = 1;
                    break;
                  case 2:
                    state = 3;
                    break;
                  default:
                    state = 0;
                }
                break;
              case LF:
                switch (state) {
                  case 1:
                    state = 2;
                    break;
                  case 3:
                    state = 4;
                    offset++;
                    break row;
                  default:
                    state = 0;
                }
                break;
              default:
                state = 0;
            }
            offset++;
          }
          chunkBytesRead += chunk.byteLength;
          chunkIndex++;
        }
        if (state !== 4) {
          return void 0;
        }
        const buffer = this._read(chunkBytesRead + offset);
        const result = /* @__PURE__ */ new Map();
        const headers = this.toString(buffer, "ascii").split(CRLF);
        if (headers.length < 2) {
          return result;
        }
        for (let i = 0; i < headers.length - 2; i++) {
          const header = headers[i];
          const index = header.indexOf(":");
          if (index === -1) {
            throw new Error(`Message header must separate key and value using ':'
${header}`);
          }
          const key = header.substr(0, index);
          const value = header.substr(index + 1).trim();
          result.set(lowerCaseKeys ? key.toLowerCase() : key, value);
        }
        return result;
      }
      tryReadBody(length) {
        if (this._totalLength < length) {
          return void 0;
        }
        return this._read(length);
      }
      get numberOfBytes() {
        return this._totalLength;
      }
      _read(byteCount) {
        if (byteCount === 0) {
          return this.emptyBuffer();
        }
        if (byteCount > this._totalLength) {
          throw new Error(`Cannot read so many bytes!`);
        }
        if (this._chunks[0].byteLength === byteCount) {
          const chunk = this._chunks[0];
          this._chunks.shift();
          this._totalLength -= byteCount;
          return this.asNative(chunk);
        }
        if (this._chunks[0].byteLength > byteCount) {
          const chunk = this._chunks[0];
          const result2 = this.asNative(chunk, byteCount);
          this._chunks[0] = chunk.slice(byteCount);
          this._totalLength -= byteCount;
          return result2;
        }
        const result = this.allocNative(byteCount);
        let resultOffset = 0;
        let chunkIndex = 0;
        while (byteCount > 0) {
          const chunk = this._chunks[chunkIndex];
          if (chunk.byteLength > byteCount) {
            const chunkPart = chunk.slice(0, byteCount);
            result.set(chunkPart, resultOffset);
            resultOffset += byteCount;
            this._chunks[chunkIndex] = chunk.slice(byteCount);
            this._totalLength -= byteCount;
            byteCount -= byteCount;
          } else {
            result.set(chunk, resultOffset);
            resultOffset += chunk.byteLength;
            this._chunks.shift();
            this._totalLength -= chunk.byteLength;
            byteCount -= chunk.byteLength;
          }
        }
        return result;
      }
    };
    exports2.AbstractMessageBuffer = AbstractMessageBuffer;
  }
});

// node_modules/vscode-jsonrpc/lib/common/connection.js
var require_connection = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/connection.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createMessageConnection = exports2.ConnectionOptions = exports2.MessageStrategy = exports2.CancellationStrategy = exports2.CancellationSenderStrategy = exports2.CancellationReceiverStrategy = exports2.RequestCancellationReceiverStrategy = exports2.IdCancellationReceiverStrategy = exports2.ConnectionStrategy = exports2.ConnectionError = exports2.ConnectionErrors = exports2.LogTraceNotification = exports2.SetTraceNotification = exports2.TraceFormat = exports2.TraceValues = exports2.Trace = exports2.NullLogger = exports2.ProgressType = exports2.ProgressToken = void 0;
    var ral_1 = require_ral();
    var Is = require_is2();
    var messages_1 = require_messages();
    var linkedMap_1 = require_linkedMap();
    var events_1 = require_events();
    var cancellation_1 = require_cancellation();
    var CancelNotification;
    (function(CancelNotification2) {
      CancelNotification2.type = new messages_1.NotificationType("$/cancelRequest");
    })(CancelNotification || (CancelNotification = {}));
    var ProgressToken;
    (function(ProgressToken2) {
      function is(value) {
        return typeof value === "string" || typeof value === "number";
      }
      ProgressToken2.is = is;
    })(ProgressToken || (exports2.ProgressToken = ProgressToken = {}));
    var ProgressNotification;
    (function(ProgressNotification2) {
      ProgressNotification2.type = new messages_1.NotificationType("$/progress");
    })(ProgressNotification || (ProgressNotification = {}));
    var ProgressType = class {
      constructor() {
      }
    };
    exports2.ProgressType = ProgressType;
    var StarRequestHandler;
    (function(StarRequestHandler2) {
      function is(value) {
        return Is.func(value);
      }
      StarRequestHandler2.is = is;
    })(StarRequestHandler || (StarRequestHandler = {}));
    exports2.NullLogger = Object.freeze({
      error: () => {
      },
      warn: () => {
      },
      info: () => {
      },
      log: () => {
      }
    });
    var Trace;
    (function(Trace2) {
      Trace2[Trace2["Off"] = 0] = "Off";
      Trace2[Trace2["Messages"] = 1] = "Messages";
      Trace2[Trace2["Compact"] = 2] = "Compact";
      Trace2[Trace2["Verbose"] = 3] = "Verbose";
    })(Trace || (exports2.Trace = Trace = {}));
    var TraceValues;
    (function(TraceValues2) {
      TraceValues2.Off = "off";
      TraceValues2.Messages = "messages";
      TraceValues2.Compact = "compact";
      TraceValues2.Verbose = "verbose";
    })(TraceValues || (exports2.TraceValues = TraceValues = {}));
    (function(Trace2) {
      function fromString(value) {
        if (!Is.string(value)) {
          return Trace2.Off;
        }
        value = value.toLowerCase();
        switch (value) {
          case "off":
            return Trace2.Off;
          case "messages":
            return Trace2.Messages;
          case "compact":
            return Trace2.Compact;
          case "verbose":
            return Trace2.Verbose;
          default:
            return Trace2.Off;
        }
      }
      Trace2.fromString = fromString;
      function toString(value) {
        switch (value) {
          case Trace2.Off:
            return "off";
          case Trace2.Messages:
            return "messages";
          case Trace2.Compact:
            return "compact";
          case Trace2.Verbose:
            return "verbose";
          default:
            return "off";
        }
      }
      Trace2.toString = toString;
    })(Trace || (exports2.Trace = Trace = {}));
    var TraceFormat;
    (function(TraceFormat2) {
      TraceFormat2["Text"] = "text";
      TraceFormat2["JSON"] = "json";
    })(TraceFormat || (exports2.TraceFormat = TraceFormat = {}));
    (function(TraceFormat2) {
      function fromString(value) {
        if (!Is.string(value)) {
          return TraceFormat2.Text;
        }
        value = value.toLowerCase();
        if (value === "json") {
          return TraceFormat2.JSON;
        } else {
          return TraceFormat2.Text;
        }
      }
      TraceFormat2.fromString = fromString;
    })(TraceFormat || (exports2.TraceFormat = TraceFormat = {}));
    var SetTraceNotification;
    (function(SetTraceNotification2) {
      SetTraceNotification2.type = new messages_1.NotificationType("$/setTrace");
    })(SetTraceNotification || (exports2.SetTraceNotification = SetTraceNotification = {}));
    var LogTraceNotification;
    (function(LogTraceNotification2) {
      LogTraceNotification2.type = new messages_1.NotificationType("$/logTrace");
    })(LogTraceNotification || (exports2.LogTraceNotification = LogTraceNotification = {}));
    var ConnectionErrors;
    (function(ConnectionErrors2) {
      ConnectionErrors2[ConnectionErrors2["Closed"] = 1] = "Closed";
      ConnectionErrors2[ConnectionErrors2["Disposed"] = 2] = "Disposed";
      ConnectionErrors2[ConnectionErrors2["AlreadyListening"] = 3] = "AlreadyListening";
    })(ConnectionErrors || (exports2.ConnectionErrors = ConnectionErrors = {}));
    var ConnectionError = class _ConnectionError extends Error {
      constructor(code, message) {
        super(message);
        this.code = code;
        Object.setPrototypeOf(this, _ConnectionError.prototype);
      }
    };
    exports2.ConnectionError = ConnectionError;
    var ConnectionStrategy;
    (function(ConnectionStrategy2) {
      function is(value) {
        const candidate = value;
        return candidate && Is.func(candidate.cancelUndispatched);
      }
      ConnectionStrategy2.is = is;
    })(ConnectionStrategy || (exports2.ConnectionStrategy = ConnectionStrategy = {}));
    var IdCancellationReceiverStrategy;
    (function(IdCancellationReceiverStrategy2) {
      function is(value) {
        const candidate = value;
        return candidate && (candidate.kind === void 0 || candidate.kind === "id") && Is.func(candidate.createCancellationTokenSource) && (candidate.dispose === void 0 || Is.func(candidate.dispose));
      }
      IdCancellationReceiverStrategy2.is = is;
    })(IdCancellationReceiverStrategy || (exports2.IdCancellationReceiverStrategy = IdCancellationReceiverStrategy = {}));
    var RequestCancellationReceiverStrategy;
    (function(RequestCancellationReceiverStrategy2) {
      function is(value) {
        const candidate = value;
        return candidate && candidate.kind === "request" && Is.func(candidate.createCancellationTokenSource) && (candidate.dispose === void 0 || Is.func(candidate.dispose));
      }
      RequestCancellationReceiverStrategy2.is = is;
    })(RequestCancellationReceiverStrategy || (exports2.RequestCancellationReceiverStrategy = RequestCancellationReceiverStrategy = {}));
    var CancellationReceiverStrategy;
    (function(CancellationReceiverStrategy2) {
      CancellationReceiverStrategy2.Message = Object.freeze({
        createCancellationTokenSource(_) {
          return new cancellation_1.CancellationTokenSource();
        }
      });
      function is(value) {
        return IdCancellationReceiverStrategy.is(value) || RequestCancellationReceiverStrategy.is(value);
      }
      CancellationReceiverStrategy2.is = is;
    })(CancellationReceiverStrategy || (exports2.CancellationReceiverStrategy = CancellationReceiverStrategy = {}));
    var CancellationSenderStrategy;
    (function(CancellationSenderStrategy2) {
      CancellationSenderStrategy2.Message = Object.freeze({
        sendCancellation(conn, id) {
          return conn.sendNotification(CancelNotification.type, { id });
        },
        cleanup(_) {
        }
      });
      function is(value) {
        const candidate = value;
        return candidate && Is.func(candidate.sendCancellation) && Is.func(candidate.cleanup);
      }
      CancellationSenderStrategy2.is = is;
    })(CancellationSenderStrategy || (exports2.CancellationSenderStrategy = CancellationSenderStrategy = {}));
    var CancellationStrategy;
    (function(CancellationStrategy2) {
      CancellationStrategy2.Message = Object.freeze({
        receiver: CancellationReceiverStrategy.Message,
        sender: CancellationSenderStrategy.Message
      });
      function is(value) {
        const candidate = value;
        return candidate && CancellationReceiverStrategy.is(candidate.receiver) && CancellationSenderStrategy.is(candidate.sender);
      }
      CancellationStrategy2.is = is;
    })(CancellationStrategy || (exports2.CancellationStrategy = CancellationStrategy = {}));
    var MessageStrategy;
    (function(MessageStrategy2) {
      function is(value) {
        const candidate = value;
        return candidate && Is.func(candidate.handleMessage);
      }
      MessageStrategy2.is = is;
    })(MessageStrategy || (exports2.MessageStrategy = MessageStrategy = {}));
    var ConnectionOptions;
    (function(ConnectionOptions2) {
      function is(value) {
        const candidate = value;
        return candidate && (CancellationStrategy.is(candidate.cancellationStrategy) || ConnectionStrategy.is(candidate.connectionStrategy) || MessageStrategy.is(candidate.messageStrategy));
      }
      ConnectionOptions2.is = is;
    })(ConnectionOptions || (exports2.ConnectionOptions = ConnectionOptions = {}));
    var ConnectionState;
    (function(ConnectionState2) {
      ConnectionState2[ConnectionState2["New"] = 1] = "New";
      ConnectionState2[ConnectionState2["Listening"] = 2] = "Listening";
      ConnectionState2[ConnectionState2["Closed"] = 3] = "Closed";
      ConnectionState2[ConnectionState2["Disposed"] = 4] = "Disposed";
    })(ConnectionState || (ConnectionState = {}));
    function createMessageConnection(messageReader, messageWriter, _logger, options) {
      const logger = _logger !== void 0 ? _logger : exports2.NullLogger;
      let sequenceNumber = 0;
      let notificationSequenceNumber = 0;
      let unknownResponseSequenceNumber = 0;
      const version = "2.0";
      let starRequestHandler = void 0;
      const requestHandlers = /* @__PURE__ */ new Map();
      let starNotificationHandler = void 0;
      const notificationHandlers = /* @__PURE__ */ new Map();
      const progressHandlers = /* @__PURE__ */ new Map();
      let timer;
      let messageQueue = new linkedMap_1.LinkedMap();
      let responsePromises = /* @__PURE__ */ new Map();
      let knownCanceledRequests = /* @__PURE__ */ new Set();
      let requestTokens = /* @__PURE__ */ new Map();
      let trace = Trace.Off;
      let traceFormat = TraceFormat.Text;
      let tracer;
      let state = ConnectionState.New;
      const errorEmitter = new events_1.Emitter();
      const closeEmitter = new events_1.Emitter();
      const unhandledNotificationEmitter = new events_1.Emitter();
      const unhandledProgressEmitter = new events_1.Emitter();
      const disposeEmitter = new events_1.Emitter();
      const cancellationStrategy = options && options.cancellationStrategy ? options.cancellationStrategy : CancellationStrategy.Message;
      function createRequestQueueKey(id) {
        if (id === null) {
          throw new Error(`Can't send requests with id null since the response can't be correlated.`);
        }
        return "req-" + id.toString();
      }
      function createResponseQueueKey(id) {
        if (id === null) {
          return "res-unknown-" + (++unknownResponseSequenceNumber).toString();
        } else {
          return "res-" + id.toString();
        }
      }
      function createNotificationQueueKey() {
        return "not-" + (++notificationSequenceNumber).toString();
      }
      function addMessageToQueue(queue, message) {
        if (messages_1.Message.isRequest(message)) {
          queue.set(createRequestQueueKey(message.id), message);
        } else if (messages_1.Message.isResponse(message)) {
          queue.set(createResponseQueueKey(message.id), message);
        } else {
          queue.set(createNotificationQueueKey(), message);
        }
      }
      function cancelUndispatched(_message) {
        return void 0;
      }
      function isListening() {
        return state === ConnectionState.Listening;
      }
      function isClosed() {
        return state === ConnectionState.Closed;
      }
      function isDisposed() {
        return state === ConnectionState.Disposed;
      }
      function closeHandler() {
        if (state === ConnectionState.New || state === ConnectionState.Listening) {
          state = ConnectionState.Closed;
          closeEmitter.fire(void 0);
        }
      }
      function readErrorHandler(error) {
        errorEmitter.fire([error, void 0, void 0]);
      }
      function writeErrorHandler(data) {
        errorEmitter.fire(data);
      }
      messageReader.onClose(closeHandler);
      messageReader.onError(readErrorHandler);
      messageWriter.onClose(closeHandler);
      messageWriter.onError(writeErrorHandler);
      function triggerMessageQueue() {
        if (timer || messageQueue.size === 0) {
          return;
        }
        timer = (0, ral_1.default)().timer.setImmediate(() => {
          timer = void 0;
          processMessageQueue();
        });
      }
      function handleMessage(message) {
        if (messages_1.Message.isRequest(message)) {
          handleRequest(message);
        } else if (messages_1.Message.isNotification(message)) {
          handleNotification(message);
        } else if (messages_1.Message.isResponse(message)) {
          handleResponse(message);
        } else {
          handleInvalidMessage(message);
        }
      }
      function processMessageQueue() {
        if (messageQueue.size === 0) {
          return;
        }
        const message = messageQueue.shift();
        try {
          const messageStrategy = options?.messageStrategy;
          if (MessageStrategy.is(messageStrategy)) {
            messageStrategy.handleMessage(message, handleMessage);
          } else {
            handleMessage(message);
          }
        } finally {
          triggerMessageQueue();
        }
      }
      const callback = (message) => {
        try {
          if (messages_1.Message.isNotification(message) && message.method === CancelNotification.type.method) {
            const cancelId = message.params.id;
            const key = createRequestQueueKey(cancelId);
            const toCancel = messageQueue.get(key);
            if (messages_1.Message.isRequest(toCancel)) {
              const strategy = options?.connectionStrategy;
              const response = strategy && strategy.cancelUndispatched ? strategy.cancelUndispatched(toCancel, cancelUndispatched) : cancelUndispatched(toCancel);
              if (response && (response.error !== void 0 || response.result !== void 0)) {
                messageQueue.delete(key);
                requestTokens.delete(cancelId);
                response.id = toCancel.id;
                traceSendingResponse(response, message.method, Date.now());
                messageWriter.write(response).catch(() => logger.error(`Sending response for canceled message failed.`));
                return;
              }
            }
            const cancellationToken = requestTokens.get(cancelId);
            if (cancellationToken !== void 0) {
              cancellationToken.cancel();
              traceReceivedNotification(message);
              return;
            } else {
              knownCanceledRequests.add(cancelId);
            }
          }
          addMessageToQueue(messageQueue, message);
        } finally {
          triggerMessageQueue();
        }
      };
      function handleRequest(requestMessage) {
        if (isDisposed()) {
          return;
        }
        function reply(resultOrError, method, startTime2) {
          const message = {
            jsonrpc: version,
            id: requestMessage.id
          };
          if (resultOrError instanceof messages_1.ResponseError) {
            message.error = resultOrError.toJson();
          } else {
            message.result = resultOrError === void 0 ? null : resultOrError;
          }
          traceSendingResponse(message, method, startTime2);
          messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
        }
        function replyError(error, method, startTime2) {
          const message = {
            jsonrpc: version,
            id: requestMessage.id,
            error: error.toJson()
          };
          traceSendingResponse(message, method, startTime2);
          messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
        }
        function replySuccess(result, method, startTime2) {
          if (result === void 0) {
            result = null;
          }
          const message = {
            jsonrpc: version,
            id: requestMessage.id,
            result
          };
          traceSendingResponse(message, method, startTime2);
          messageWriter.write(message).catch(() => logger.error(`Sending response failed.`));
        }
        traceReceivedRequest(requestMessage);
        const element = requestHandlers.get(requestMessage.method);
        let type;
        let requestHandler;
        if (element) {
          type = element.type;
          requestHandler = element.handler;
        }
        const startTime = Date.now();
        if (requestHandler || starRequestHandler) {
          const tokenKey = requestMessage.id ?? String(Date.now());
          const cancellationSource = IdCancellationReceiverStrategy.is(cancellationStrategy.receiver) ? cancellationStrategy.receiver.createCancellationTokenSource(tokenKey) : cancellationStrategy.receiver.createCancellationTokenSource(requestMessage);
          if (requestMessage.id !== null && knownCanceledRequests.has(requestMessage.id)) {
            cancellationSource.cancel();
          }
          if (requestMessage.id !== null) {
            requestTokens.set(tokenKey, cancellationSource);
          }
          try {
            let handlerResult;
            if (requestHandler) {
              if (requestMessage.params === void 0) {
                if (type !== void 0 && type.numberOfParams !== 0) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines ${type.numberOfParams} params but received none.`), requestMessage.method, startTime);
                  return;
                }
                handlerResult = requestHandler(cancellationSource.token);
              } else if (Array.isArray(requestMessage.params)) {
                if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byName) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines parameters by name but received parameters by position`), requestMessage.method, startTime);
                  return;
                }
                handlerResult = requestHandler(...requestMessage.params, cancellationSource.token);
              } else {
                if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byPosition) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InvalidParams, `Request ${requestMessage.method} defines parameters by position but received parameters by name`), requestMessage.method, startTime);
                  return;
                }
                handlerResult = requestHandler(requestMessage.params, cancellationSource.token);
              }
            } else if (starRequestHandler) {
              handlerResult = starRequestHandler(requestMessage.method, requestMessage.params, cancellationSource.token);
            }
            const promise = handlerResult;
            if (!handlerResult) {
              requestTokens.delete(tokenKey);
              replySuccess(handlerResult, requestMessage.method, startTime);
            } else if (promise.then) {
              promise.then((resultOrError) => {
                requestTokens.delete(tokenKey);
                reply(resultOrError, requestMessage.method, startTime);
              }, (error) => {
                requestTokens.delete(tokenKey);
                if (error instanceof messages_1.ResponseError) {
                  replyError(error, requestMessage.method, startTime);
                } else if (error && Is.string(error.message)) {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed with message: ${error.message}`), requestMessage.method, startTime);
                } else {
                  replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed unexpectedly without providing any details.`), requestMessage.method, startTime);
                }
              });
            } else {
              requestTokens.delete(tokenKey);
              reply(handlerResult, requestMessage.method, startTime);
            }
          } catch (error) {
            requestTokens.delete(tokenKey);
            if (error instanceof messages_1.ResponseError) {
              reply(error, requestMessage.method, startTime);
            } else if (error && Is.string(error.message)) {
              replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed with message: ${error.message}`), requestMessage.method, startTime);
            } else {
              replyError(new messages_1.ResponseError(messages_1.ErrorCodes.InternalError, `Request ${requestMessage.method} failed unexpectedly without providing any details.`), requestMessage.method, startTime);
            }
          }
        } else {
          replyError(new messages_1.ResponseError(messages_1.ErrorCodes.MethodNotFound, `Unhandled method ${requestMessage.method}`), requestMessage.method, startTime);
        }
      }
      function handleResponse(responseMessage) {
        if (isDisposed()) {
          return;
        }
        if (responseMessage.id === null) {
          if (responseMessage.error) {
            logger.error(`Received response message without id: Error is: 
${JSON.stringify(responseMessage.error, void 0, 4)}`);
          } else {
            logger.error(`Received response message without id. No further error information provided.`);
          }
        } else {
          const key = responseMessage.id;
          const responsePromise = responsePromises.get(key);
          traceReceivedResponse(responseMessage, responsePromise);
          if (responsePromise !== void 0) {
            responsePromises.delete(key);
            try {
              if (responseMessage.error) {
                const error = responseMessage.error;
                responsePromise.reject(new messages_1.ResponseError(error.code, error.message, error.data));
              } else if (responseMessage.result !== void 0) {
                responsePromise.resolve(responseMessage.result);
              } else {
                throw new Error("Should never happen.");
              }
            } catch (error) {
              if (error.message) {
                logger.error(`Response handler '${responsePromise.method}' failed with message: ${error.message}`);
              } else {
                logger.error(`Response handler '${responsePromise.method}' failed unexpectedly.`);
              }
            }
          }
        }
      }
      function handleNotification(message) {
        if (isDisposed()) {
          return;
        }
        let type = void 0;
        let notificationHandler;
        if (message.method === CancelNotification.type.method) {
          const cancelId = message.params.id;
          knownCanceledRequests.delete(cancelId);
          traceReceivedNotification(message);
          return;
        } else {
          const element = notificationHandlers.get(message.method);
          if (element) {
            notificationHandler = element.handler;
            type = element.type;
          }
        }
        if (notificationHandler || starNotificationHandler) {
          try {
            traceReceivedNotification(message);
            if (notificationHandler) {
              if (message.params === void 0) {
                if (type !== void 0) {
                  if (type.numberOfParams !== 0 && type.parameterStructures !== messages_1.ParameterStructures.byName) {
                    logger.error(`Notification ${message.method} defines ${type.numberOfParams} params but received none.`);
                  }
                }
                notificationHandler();
              } else if (Array.isArray(message.params)) {
                const params = message.params;
                if (message.method === ProgressNotification.type.method && params.length === 2 && ProgressToken.is(params[0])) {
                  notificationHandler({ token: params[0], value: params[1] });
                } else {
                  if (type !== void 0) {
                    if (type.parameterStructures === messages_1.ParameterStructures.byName) {
                      logger.error(`Notification ${message.method} defines parameters by name but received parameters by position`);
                    }
                    if (type.numberOfParams !== message.params.length) {
                      logger.error(`Notification ${message.method} defines ${type.numberOfParams} params but received ${params.length} arguments`);
                    }
                  }
                  notificationHandler(...params);
                }
              } else {
                if (type !== void 0 && type.parameterStructures === messages_1.ParameterStructures.byPosition) {
                  logger.error(`Notification ${message.method} defines parameters by position but received parameters by name`);
                }
                notificationHandler(message.params);
              }
            } else if (starNotificationHandler) {
              starNotificationHandler(message.method, message.params);
            }
          } catch (error) {
            if (error.message) {
              logger.error(`Notification handler '${message.method}' failed with message: ${error.message}`);
            } else {
              logger.error(`Notification handler '${message.method}' failed unexpectedly.`);
            }
          }
        } else {
          unhandledNotificationEmitter.fire(message);
        }
      }
      function handleInvalidMessage(message) {
        if (!message) {
          logger.error("Received empty message.");
          return;
        }
        logger.error(`Received message which is neither a response nor a notification message:
${JSON.stringify(message, null, 4)}`);
        const responseMessage = message;
        if (Is.string(responseMessage.id) || Is.number(responseMessage.id)) {
          const key = responseMessage.id;
          const responseHandler = responsePromises.get(key);
          if (responseHandler) {
            responseHandler.reject(new Error("The received response has neither a result nor an error property."));
          }
        }
      }
      function stringifyTrace(params) {
        if (params === void 0 || params === null) {
          return void 0;
        }
        switch (trace) {
          case Trace.Verbose:
            return JSON.stringify(params, null, 4);
          case Trace.Compact:
            return JSON.stringify(params);
          default:
            return void 0;
        }
      }
      function traceSendingRequest(message) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if ((trace === Trace.Verbose || trace === Trace.Compact) && message.params) {
            data = `Params: ${stringifyTrace(message.params)}

`;
          }
          tracer.log(`Sending request '${message.method} - (${message.id})'.`, data);
        } else {
          logLSPMessage("send-request", message);
        }
      }
      function traceSendingNotification(message) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.params) {
              data = `Params: ${stringifyTrace(message.params)}

`;
            } else {
              data = "No parameters provided.\n\n";
            }
          }
          tracer.log(`Sending notification '${message.method}'.`, data);
        } else {
          logLSPMessage("send-notification", message);
        }
      }
      function traceSendingResponse(message, method, startTime) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.error && message.error.data) {
              data = `Error data: ${stringifyTrace(message.error.data)}

`;
            } else {
              if (message.result) {
                data = `Result: ${stringifyTrace(message.result)}

`;
              } else if (message.error === void 0) {
                data = "No result returned.\n\n";
              }
            }
          }
          tracer.log(`Sending response '${method} - (${message.id})'. Processing request took ${Date.now() - startTime}ms`, data);
        } else {
          logLSPMessage("send-response", message);
        }
      }
      function traceReceivedRequest(message) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if ((trace === Trace.Verbose || trace === Trace.Compact) && message.params) {
            data = `Params: ${stringifyTrace(message.params)}

`;
          }
          tracer.log(`Received request '${message.method} - (${message.id})'.`, data);
        } else {
          logLSPMessage("receive-request", message);
        }
      }
      function traceReceivedNotification(message) {
        if (trace === Trace.Off || !tracer || message.method === LogTraceNotification.type.method) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.params) {
              data = `Params: ${stringifyTrace(message.params)}

`;
            } else {
              data = "No parameters provided.\n\n";
            }
          }
          tracer.log(`Received notification '${message.method}'.`, data);
        } else {
          logLSPMessage("receive-notification", message);
        }
      }
      function traceReceivedResponse(message, responsePromise) {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        if (traceFormat === TraceFormat.Text) {
          let data = void 0;
          if (trace === Trace.Verbose || trace === Trace.Compact) {
            if (message.error && message.error.data) {
              data = `Error data: ${stringifyTrace(message.error.data)}

`;
            } else {
              if (message.result) {
                data = `Result: ${stringifyTrace(message.result)}

`;
              } else if (message.error === void 0) {
                data = "No result returned.\n\n";
              }
            }
          }
          if (responsePromise) {
            const error = message.error ? ` Request failed: ${message.error.message} (${message.error.code}).` : "";
            tracer.log(`Received response '${responsePromise.method} - (${message.id})' in ${Date.now() - responsePromise.timerStart}ms.${error}`, data);
          } else {
            tracer.log(`Received response ${message.id} without active response promise.`, data);
          }
        } else {
          logLSPMessage("receive-response", message);
        }
      }
      function logLSPMessage(type, message) {
        if (!tracer || trace === Trace.Off) {
          return;
        }
        const lspMessage = {
          isLSPMessage: true,
          type,
          message,
          timestamp: Date.now()
        };
        tracer.log(lspMessage);
      }
      function throwIfClosedOrDisposed() {
        if (isClosed()) {
          throw new ConnectionError(ConnectionErrors.Closed, "Connection is closed.");
        }
        if (isDisposed()) {
          throw new ConnectionError(ConnectionErrors.Disposed, "Connection is disposed.");
        }
      }
      function throwIfListening() {
        if (isListening()) {
          throw new ConnectionError(ConnectionErrors.AlreadyListening, "Connection is already listening");
        }
      }
      function throwIfNotListening() {
        if (!isListening()) {
          throw new Error("Call listen() first.");
        }
      }
      function undefinedToNull(param) {
        if (param === void 0) {
          return null;
        } else {
          return param;
        }
      }
      function nullToUndefined(param) {
        if (param === null) {
          return void 0;
        } else {
          return param;
        }
      }
      function isNamedParam(param) {
        return param !== void 0 && param !== null && !Array.isArray(param) && typeof param === "object";
      }
      function computeSingleParam(parameterStructures, param) {
        switch (parameterStructures) {
          case messages_1.ParameterStructures.auto:
            if (isNamedParam(param)) {
              return nullToUndefined(param);
            } else {
              return [undefinedToNull(param)];
            }
          case messages_1.ParameterStructures.byName:
            if (!isNamedParam(param)) {
              throw new Error(`Received parameters by name but param is not an object literal.`);
            }
            return nullToUndefined(param);
          case messages_1.ParameterStructures.byPosition:
            return [undefinedToNull(param)];
          default:
            throw new Error(`Unknown parameter structure ${parameterStructures.toString()}`);
        }
      }
      function computeMessageParams(type, params) {
        let result;
        const numberOfParams = type.numberOfParams;
        switch (numberOfParams) {
          case 0:
            result = void 0;
            break;
          case 1:
            result = computeSingleParam(type.parameterStructures, params[0]);
            break;
          default:
            result = [];
            for (let i = 0; i < params.length && i < numberOfParams; i++) {
              result.push(undefinedToNull(params[i]));
            }
            if (params.length < numberOfParams) {
              for (let i = params.length; i < numberOfParams; i++) {
                result.push(null);
              }
            }
            break;
        }
        return result;
      }
      const connection = {
        sendNotification: (type, ...args) => {
          throwIfClosedOrDisposed();
          let method;
          let messageParams;
          if (Is.string(type)) {
            method = type;
            const first = args[0];
            let paramStart = 0;
            let parameterStructures = messages_1.ParameterStructures.auto;
            if (messages_1.ParameterStructures.is(first)) {
              paramStart = 1;
              parameterStructures = first;
            }
            let paramEnd = args.length;
            const numberOfParams = paramEnd - paramStart;
            switch (numberOfParams) {
              case 0:
                messageParams = void 0;
                break;
              case 1:
                messageParams = computeSingleParam(parameterStructures, args[paramStart]);
                break;
              default:
                if (parameterStructures === messages_1.ParameterStructures.byName) {
                  throw new Error(`Received ${numberOfParams} parameters for 'by Name' notification parameter structure.`);
                }
                messageParams = args.slice(paramStart, paramEnd).map((value) => undefinedToNull(value));
                break;
            }
          } else {
            const params = args;
            method = type.method;
            messageParams = computeMessageParams(type, params);
          }
          const notificationMessage = {
            jsonrpc: version,
            method,
            params: messageParams
          };
          traceSendingNotification(notificationMessage);
          return messageWriter.write(notificationMessage).catch((error) => {
            logger.error(`Sending notification failed.`);
            throw error;
          });
        },
        onNotification: (type, handler) => {
          throwIfClosedOrDisposed();
          let method;
          if (Is.func(type)) {
            starNotificationHandler = type;
          } else if (handler) {
            if (Is.string(type)) {
              method = type;
              notificationHandlers.set(type, { type: void 0, handler });
            } else {
              method = type.method;
              notificationHandlers.set(type.method, { type, handler });
            }
          }
          return {
            dispose: () => {
              if (method !== void 0) {
                notificationHandlers.delete(method);
              } else {
                starNotificationHandler = void 0;
              }
            }
          };
        },
        onProgress: (_type, token, handler) => {
          if (progressHandlers.has(token)) {
            throw new Error(`Progress handler for token ${token} already registered`);
          }
          progressHandlers.set(token, handler);
          return {
            dispose: () => {
              progressHandlers.delete(token);
            }
          };
        },
        sendProgress: (_type, token, value) => {
          return connection.sendNotification(ProgressNotification.type, { token, value });
        },
        onUnhandledProgress: unhandledProgressEmitter.event,
        sendRequest: (type, ...args) => {
          throwIfClosedOrDisposed();
          throwIfNotListening();
          let method;
          let messageParams;
          let token = void 0;
          if (Is.string(type)) {
            method = type;
            const first = args[0];
            const last = args[args.length - 1];
            let paramStart = 0;
            let parameterStructures = messages_1.ParameterStructures.auto;
            if (messages_1.ParameterStructures.is(first)) {
              paramStart = 1;
              parameterStructures = first;
            }
            let paramEnd = args.length;
            if (cancellation_1.CancellationToken.is(last)) {
              paramEnd = paramEnd - 1;
              token = last;
            }
            const numberOfParams = paramEnd - paramStart;
            switch (numberOfParams) {
              case 0:
                messageParams = void 0;
                break;
              case 1:
                messageParams = computeSingleParam(parameterStructures, args[paramStart]);
                break;
              default:
                if (parameterStructures === messages_1.ParameterStructures.byName) {
                  throw new Error(`Received ${numberOfParams} parameters for 'by Name' request parameter structure.`);
                }
                messageParams = args.slice(paramStart, paramEnd).map((value) => undefinedToNull(value));
                break;
            }
          } else {
            const params = args;
            method = type.method;
            messageParams = computeMessageParams(type, params);
            const numberOfParams = type.numberOfParams;
            token = cancellation_1.CancellationToken.is(params[numberOfParams]) ? params[numberOfParams] : void 0;
          }
          const id = sequenceNumber++;
          let disposable;
          if (token) {
            disposable = token.onCancellationRequested(() => {
              const p = cancellationStrategy.sender.sendCancellation(connection, id);
              if (p === void 0) {
                logger.log(`Received no promise from cancellation strategy when cancelling id ${id}`);
                return Promise.resolve();
              } else {
                return p.catch(() => {
                  logger.log(`Sending cancellation messages for id ${id} failed`);
                });
              }
            });
          }
          const requestMessage = {
            jsonrpc: version,
            id,
            method,
            params: messageParams
          };
          traceSendingRequest(requestMessage);
          if (typeof cancellationStrategy.sender.enableCancellation === "function") {
            cancellationStrategy.sender.enableCancellation(requestMessage);
          }
          return new Promise(async (resolve, reject) => {
            const resolveWithCleanup = (r) => {
              resolve(r);
              cancellationStrategy.sender.cleanup(id);
              disposable?.dispose();
            };
            const rejectWithCleanup = (r) => {
              reject(r);
              cancellationStrategy.sender.cleanup(id);
              disposable?.dispose();
            };
            const responsePromise = { method, timerStart: Date.now(), resolve: resolveWithCleanup, reject: rejectWithCleanup };
            try {
              await messageWriter.write(requestMessage);
              responsePromises.set(id, responsePromise);
            } catch (error) {
              logger.error(`Sending request failed.`);
              responsePromise.reject(new messages_1.ResponseError(messages_1.ErrorCodes.MessageWriteError, error.message ? error.message : "Unknown reason"));
              throw error;
            }
          });
        },
        onRequest: (type, handler) => {
          throwIfClosedOrDisposed();
          let method = null;
          if (StarRequestHandler.is(type)) {
            method = void 0;
            starRequestHandler = type;
          } else if (Is.string(type)) {
            method = null;
            if (handler !== void 0) {
              method = type;
              requestHandlers.set(type, { handler, type: void 0 });
            }
          } else {
            if (handler !== void 0) {
              method = type.method;
              requestHandlers.set(type.method, { type, handler });
            }
          }
          return {
            dispose: () => {
              if (method === null) {
                return;
              }
              if (method !== void 0) {
                requestHandlers.delete(method);
              } else {
                starRequestHandler = void 0;
              }
            }
          };
        },
        hasPendingResponse: () => {
          return responsePromises.size > 0;
        },
        trace: async (_value, _tracer, sendNotificationOrTraceOptions) => {
          let _sendNotification = false;
          let _traceFormat = TraceFormat.Text;
          if (sendNotificationOrTraceOptions !== void 0) {
            if (Is.boolean(sendNotificationOrTraceOptions)) {
              _sendNotification = sendNotificationOrTraceOptions;
            } else {
              _sendNotification = sendNotificationOrTraceOptions.sendNotification || false;
              _traceFormat = sendNotificationOrTraceOptions.traceFormat || TraceFormat.Text;
            }
          }
          trace = _value;
          traceFormat = _traceFormat;
          if (trace === Trace.Off) {
            tracer = void 0;
          } else {
            tracer = _tracer;
          }
          if (_sendNotification && !isClosed() && !isDisposed()) {
            await connection.sendNotification(SetTraceNotification.type, { value: Trace.toString(_value) });
          }
        },
        onError: errorEmitter.event,
        onClose: closeEmitter.event,
        onUnhandledNotification: unhandledNotificationEmitter.event,
        onDispose: disposeEmitter.event,
        end: () => {
          messageWriter.end();
        },
        dispose: () => {
          if (isDisposed()) {
            return;
          }
          state = ConnectionState.Disposed;
          disposeEmitter.fire(void 0);
          const error = new messages_1.ResponseError(messages_1.ErrorCodes.PendingResponseRejected, "Pending response rejected since connection got disposed");
          for (const promise of responsePromises.values()) {
            promise.reject(error);
          }
          responsePromises = /* @__PURE__ */ new Map();
          requestTokens = /* @__PURE__ */ new Map();
          knownCanceledRequests = /* @__PURE__ */ new Set();
          messageQueue = new linkedMap_1.LinkedMap();
          if (Is.func(messageWriter.dispose)) {
            messageWriter.dispose();
          }
          if (Is.func(messageReader.dispose)) {
            messageReader.dispose();
          }
        },
        listen: () => {
          throwIfClosedOrDisposed();
          throwIfListening();
          state = ConnectionState.Listening;
          messageReader.listen(callback);
        },
        inspect: () => {
          (0, ral_1.default)().console.log("inspect");
        }
      };
      connection.onNotification(LogTraceNotification.type, (params) => {
        if (trace === Trace.Off || !tracer) {
          return;
        }
        const verbose = trace === Trace.Verbose || trace === Trace.Compact;
        tracer.log(params.message, verbose ? params.verbose : void 0);
      });
      connection.onNotification(ProgressNotification.type, (params) => {
        const handler = progressHandlers.get(params.token);
        if (handler) {
          handler(params.value);
        } else {
          unhandledProgressEmitter.fire(params);
        }
      });
      return connection;
    }
    exports2.createMessageConnection = createMessageConnection;
  }
});

// node_modules/vscode-jsonrpc/lib/common/api.js
var require_api = __commonJS({
  "node_modules/vscode-jsonrpc/lib/common/api.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ProgressType = exports2.ProgressToken = exports2.createMessageConnection = exports2.NullLogger = exports2.ConnectionOptions = exports2.ConnectionStrategy = exports2.AbstractMessageBuffer = exports2.WriteableStreamMessageWriter = exports2.AbstractMessageWriter = exports2.MessageWriter = exports2.ReadableStreamMessageReader = exports2.AbstractMessageReader = exports2.MessageReader = exports2.SharedArrayReceiverStrategy = exports2.SharedArraySenderStrategy = exports2.CancellationToken = exports2.CancellationTokenSource = exports2.Emitter = exports2.Event = exports2.Disposable = exports2.LRUCache = exports2.Touch = exports2.LinkedMap = exports2.ParameterStructures = exports2.NotificationType9 = exports2.NotificationType8 = exports2.NotificationType7 = exports2.NotificationType6 = exports2.NotificationType5 = exports2.NotificationType4 = exports2.NotificationType3 = exports2.NotificationType2 = exports2.NotificationType1 = exports2.NotificationType0 = exports2.NotificationType = exports2.ErrorCodes = exports2.ResponseError = exports2.RequestType9 = exports2.RequestType8 = exports2.RequestType7 = exports2.RequestType6 = exports2.RequestType5 = exports2.RequestType4 = exports2.RequestType3 = exports2.RequestType2 = exports2.RequestType1 = exports2.RequestType0 = exports2.RequestType = exports2.Message = exports2.RAL = void 0;
    exports2.MessageStrategy = exports2.CancellationStrategy = exports2.CancellationSenderStrategy = exports2.CancellationReceiverStrategy = exports2.ConnectionError = exports2.ConnectionErrors = exports2.LogTraceNotification = exports2.SetTraceNotification = exports2.TraceFormat = exports2.TraceValues = exports2.Trace = void 0;
    var messages_1 = require_messages();
    Object.defineProperty(exports2, "Message", { enumerable: true, get: function() {
      return messages_1.Message;
    } });
    Object.defineProperty(exports2, "RequestType", { enumerable: true, get: function() {
      return messages_1.RequestType;
    } });
    Object.defineProperty(exports2, "RequestType0", { enumerable: true, get: function() {
      return messages_1.RequestType0;
    } });
    Object.defineProperty(exports2, "RequestType1", { enumerable: true, get: function() {
      return messages_1.RequestType1;
    } });
    Object.defineProperty(exports2, "RequestType2", { enumerable: true, get: function() {
      return messages_1.RequestType2;
    } });
    Object.defineProperty(exports2, "RequestType3", { enumerable: true, get: function() {
      return messages_1.RequestType3;
    } });
    Object.defineProperty(exports2, "RequestType4", { enumerable: true, get: function() {
      return messages_1.RequestType4;
    } });
    Object.defineProperty(exports2, "RequestType5", { enumerable: true, get: function() {
      return messages_1.RequestType5;
    } });
    Object.defineProperty(exports2, "RequestType6", { enumerable: true, get: function() {
      return messages_1.RequestType6;
    } });
    Object.defineProperty(exports2, "RequestType7", { enumerable: true, get: function() {
      return messages_1.RequestType7;
    } });
    Object.defineProperty(exports2, "RequestType8", { enumerable: true, get: function() {
      return messages_1.RequestType8;
    } });
    Object.defineProperty(exports2, "RequestType9", { enumerable: true, get: function() {
      return messages_1.RequestType9;
    } });
    Object.defineProperty(exports2, "ResponseError", { enumerable: true, get: function() {
      return messages_1.ResponseError;
    } });
    Object.defineProperty(exports2, "ErrorCodes", { enumerable: true, get: function() {
      return messages_1.ErrorCodes;
    } });
    Object.defineProperty(exports2, "NotificationType", { enumerable: true, get: function() {
      return messages_1.NotificationType;
    } });
    Object.defineProperty(exports2, "NotificationType0", { enumerable: true, get: function() {
      return messages_1.NotificationType0;
    } });
    Object.defineProperty(exports2, "NotificationType1", { enumerable: true, get: function() {
      return messages_1.NotificationType1;
    } });
    Object.defineProperty(exports2, "NotificationType2", { enumerable: true, get: function() {
      return messages_1.NotificationType2;
    } });
    Object.defineProperty(exports2, "NotificationType3", { enumerable: true, get: function() {
      return messages_1.NotificationType3;
    } });
    Object.defineProperty(exports2, "NotificationType4", { enumerable: true, get: function() {
      return messages_1.NotificationType4;
    } });
    Object.defineProperty(exports2, "NotificationType5", { enumerable: true, get: function() {
      return messages_1.NotificationType5;
    } });
    Object.defineProperty(exports2, "NotificationType6", { enumerable: true, get: function() {
      return messages_1.NotificationType6;
    } });
    Object.defineProperty(exports2, "NotificationType7", { enumerable: true, get: function() {
      return messages_1.NotificationType7;
    } });
    Object.defineProperty(exports2, "NotificationType8", { enumerable: true, get: function() {
      return messages_1.NotificationType8;
    } });
    Object.defineProperty(exports2, "NotificationType9", { enumerable: true, get: function() {
      return messages_1.NotificationType9;
    } });
    Object.defineProperty(exports2, "ParameterStructures", { enumerable: true, get: function() {
      return messages_1.ParameterStructures;
    } });
    var linkedMap_1 = require_linkedMap();
    Object.defineProperty(exports2, "LinkedMap", { enumerable: true, get: function() {
      return linkedMap_1.LinkedMap;
    } });
    Object.defineProperty(exports2, "LRUCache", { enumerable: true, get: function() {
      return linkedMap_1.LRUCache;
    } });
    Object.defineProperty(exports2, "Touch", { enumerable: true, get: function() {
      return linkedMap_1.Touch;
    } });
    var disposable_1 = require_disposable();
    Object.defineProperty(exports2, "Disposable", { enumerable: true, get: function() {
      return disposable_1.Disposable;
    } });
    var events_1 = require_events();
    Object.defineProperty(exports2, "Event", { enumerable: true, get: function() {
      return events_1.Event;
    } });
    Object.defineProperty(exports2, "Emitter", { enumerable: true, get: function() {
      return events_1.Emitter;
    } });
    var cancellation_1 = require_cancellation();
    Object.defineProperty(exports2, "CancellationTokenSource", { enumerable: true, get: function() {
      return cancellation_1.CancellationTokenSource;
    } });
    Object.defineProperty(exports2, "CancellationToken", { enumerable: true, get: function() {
      return cancellation_1.CancellationToken;
    } });
    var sharedArrayCancellation_1 = require_sharedArrayCancellation();
    Object.defineProperty(exports2, "SharedArraySenderStrategy", { enumerable: true, get: function() {
      return sharedArrayCancellation_1.SharedArraySenderStrategy;
    } });
    Object.defineProperty(exports2, "SharedArrayReceiverStrategy", { enumerable: true, get: function() {
      return sharedArrayCancellation_1.SharedArrayReceiverStrategy;
    } });
    var messageReader_1 = require_messageReader();
    Object.defineProperty(exports2, "MessageReader", { enumerable: true, get: function() {
      return messageReader_1.MessageReader;
    } });
    Object.defineProperty(exports2, "AbstractMessageReader", { enumerable: true, get: function() {
      return messageReader_1.AbstractMessageReader;
    } });
    Object.defineProperty(exports2, "ReadableStreamMessageReader", { enumerable: true, get: function() {
      return messageReader_1.ReadableStreamMessageReader;
    } });
    var messageWriter_1 = require_messageWriter();
    Object.defineProperty(exports2, "MessageWriter", { enumerable: true, get: function() {
      return messageWriter_1.MessageWriter;
    } });
    Object.defineProperty(exports2, "AbstractMessageWriter", { enumerable: true, get: function() {
      return messageWriter_1.AbstractMessageWriter;
    } });
    Object.defineProperty(exports2, "WriteableStreamMessageWriter", { enumerable: true, get: function() {
      return messageWriter_1.WriteableStreamMessageWriter;
    } });
    var messageBuffer_1 = require_messageBuffer();
    Object.defineProperty(exports2, "AbstractMessageBuffer", { enumerable: true, get: function() {
      return messageBuffer_1.AbstractMessageBuffer;
    } });
    var connection_1 = require_connection();
    Object.defineProperty(exports2, "ConnectionStrategy", { enumerable: true, get: function() {
      return connection_1.ConnectionStrategy;
    } });
    Object.defineProperty(exports2, "ConnectionOptions", { enumerable: true, get: function() {
      return connection_1.ConnectionOptions;
    } });
    Object.defineProperty(exports2, "NullLogger", { enumerable: true, get: function() {
      return connection_1.NullLogger;
    } });
    Object.defineProperty(exports2, "createMessageConnection", { enumerable: true, get: function() {
      return connection_1.createMessageConnection;
    } });
    Object.defineProperty(exports2, "ProgressToken", { enumerable: true, get: function() {
      return connection_1.ProgressToken;
    } });
    Object.defineProperty(exports2, "ProgressType", { enumerable: true, get: function() {
      return connection_1.ProgressType;
    } });
    Object.defineProperty(exports2, "Trace", { enumerable: true, get: function() {
      return connection_1.Trace;
    } });
    Object.defineProperty(exports2, "TraceValues", { enumerable: true, get: function() {
      return connection_1.TraceValues;
    } });
    Object.defineProperty(exports2, "TraceFormat", { enumerable: true, get: function() {
      return connection_1.TraceFormat;
    } });
    Object.defineProperty(exports2, "SetTraceNotification", { enumerable: true, get: function() {
      return connection_1.SetTraceNotification;
    } });
    Object.defineProperty(exports2, "LogTraceNotification", { enumerable: true, get: function() {
      return connection_1.LogTraceNotification;
    } });
    Object.defineProperty(exports2, "ConnectionErrors", { enumerable: true, get: function() {
      return connection_1.ConnectionErrors;
    } });
    Object.defineProperty(exports2, "ConnectionError", { enumerable: true, get: function() {
      return connection_1.ConnectionError;
    } });
    Object.defineProperty(exports2, "CancellationReceiverStrategy", { enumerable: true, get: function() {
      return connection_1.CancellationReceiverStrategy;
    } });
    Object.defineProperty(exports2, "CancellationSenderStrategy", { enumerable: true, get: function() {
      return connection_1.CancellationSenderStrategy;
    } });
    Object.defineProperty(exports2, "CancellationStrategy", { enumerable: true, get: function() {
      return connection_1.CancellationStrategy;
    } });
    Object.defineProperty(exports2, "MessageStrategy", { enumerable: true, get: function() {
      return connection_1.MessageStrategy;
    } });
    var ral_1 = require_ral();
    exports2.RAL = ral_1.default;
  }
});

// node_modules/vscode-jsonrpc/lib/node/ril.js
var require_ril = __commonJS({
  "node_modules/vscode-jsonrpc/lib/node/ril.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var util_1 = require("util");
    var api_1 = require_api();
    var MessageBuffer = class _MessageBuffer extends api_1.AbstractMessageBuffer {
      constructor(encoding = "utf-8") {
        super(encoding);
      }
      emptyBuffer() {
        return _MessageBuffer.emptyBuffer;
      }
      fromString(value, encoding) {
        return Buffer.from(value, encoding);
      }
      toString(value, encoding) {
        if (value instanceof Buffer) {
          return value.toString(encoding);
        } else {
          return new util_1.TextDecoder(encoding).decode(value);
        }
      }
      asNative(buffer, length) {
        if (length === void 0) {
          return buffer instanceof Buffer ? buffer : Buffer.from(buffer);
        } else {
          return buffer instanceof Buffer ? buffer.slice(0, length) : Buffer.from(buffer, 0, length);
        }
      }
      allocNative(length) {
        return Buffer.allocUnsafe(length);
      }
    };
    MessageBuffer.emptyBuffer = Buffer.allocUnsafe(0);
    var ReadableStreamWrapper = class {
      constructor(stream) {
        this.stream = stream;
      }
      onClose(listener) {
        this.stream.on("close", listener);
        return api_1.Disposable.create(() => this.stream.off("close", listener));
      }
      onError(listener) {
        this.stream.on("error", listener);
        return api_1.Disposable.create(() => this.stream.off("error", listener));
      }
      onEnd(listener) {
        this.stream.on("end", listener);
        return api_1.Disposable.create(() => this.stream.off("end", listener));
      }
      onData(listener) {
        this.stream.on("data", listener);
        return api_1.Disposable.create(() => this.stream.off("data", listener));
      }
    };
    var WritableStreamWrapper = class {
      constructor(stream) {
        this.stream = stream;
      }
      onClose(listener) {
        this.stream.on("close", listener);
        return api_1.Disposable.create(() => this.stream.off("close", listener));
      }
      onError(listener) {
        this.stream.on("error", listener);
        return api_1.Disposable.create(() => this.stream.off("error", listener));
      }
      onEnd(listener) {
        this.stream.on("end", listener);
        return api_1.Disposable.create(() => this.stream.off("end", listener));
      }
      write(data, encoding) {
        return new Promise((resolve, reject) => {
          const callback = (error) => {
            if (error === void 0 || error === null) {
              resolve();
            } else {
              reject(error);
            }
          };
          if (typeof data === "string") {
            this.stream.write(data, encoding, callback);
          } else {
            this.stream.write(data, callback);
          }
        });
      }
      end() {
        this.stream.end();
      }
    };
    var _ril = Object.freeze({
      messageBuffer: Object.freeze({
        create: (encoding) => new MessageBuffer(encoding)
      }),
      applicationJson: Object.freeze({
        encoder: Object.freeze({
          name: "application/json",
          encode: (msg, options) => {
            try {
              return Promise.resolve(Buffer.from(JSON.stringify(msg, void 0, 0), options.charset));
            } catch (err) {
              return Promise.reject(err);
            }
          }
        }),
        decoder: Object.freeze({
          name: "application/json",
          decode: (buffer, options) => {
            try {
              if (buffer instanceof Buffer) {
                return Promise.resolve(JSON.parse(buffer.toString(options.charset)));
              } else {
                return Promise.resolve(JSON.parse(new util_1.TextDecoder(options.charset).decode(buffer)));
              }
            } catch (err) {
              return Promise.reject(err);
            }
          }
        })
      }),
      stream: Object.freeze({
        asReadableStream: (stream) => new ReadableStreamWrapper(stream),
        asWritableStream: (stream) => new WritableStreamWrapper(stream)
      }),
      console,
      timer: Object.freeze({
        setTimeout(callback, ms, ...args) {
          const handle = setTimeout(callback, ms, ...args);
          return { dispose: () => clearTimeout(handle) };
        },
        setImmediate(callback, ...args) {
          const handle = setImmediate(callback, ...args);
          return { dispose: () => clearImmediate(handle) };
        },
        setInterval(callback, ms, ...args) {
          const handle = setInterval(callback, ms, ...args);
          return { dispose: () => clearInterval(handle) };
        }
      })
    });
    function RIL() {
      return _ril;
    }
    (function(RIL2) {
      function install() {
        api_1.RAL.install(_ril);
      }
      RIL2.install = install;
    })(RIL || (RIL = {}));
    exports2.default = RIL;
  }
});

// node_modules/vscode-jsonrpc/lib/node/main.js
var require_main = __commonJS({
  "node_modules/vscode-jsonrpc/lib/node/main.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createMessageConnection = exports2.createServerSocketTransport = exports2.createClientSocketTransport = exports2.createServerPipeTransport = exports2.createClientPipeTransport = exports2.generateRandomPipeName = exports2.StreamMessageWriter = exports2.StreamMessageReader = exports2.SocketMessageWriter = exports2.SocketMessageReader = exports2.PortMessageWriter = exports2.PortMessageReader = exports2.IPCMessageWriter = exports2.IPCMessageReader = void 0;
    var ril_1 = require_ril();
    ril_1.default.install();
    var path2 = require("path");
    var os = require("os");
    var crypto_1 = require("crypto");
    var net_1 = require("net");
    var api_1 = require_api();
    __exportStar(require_api(), exports2);
    var IPCMessageReader = class extends api_1.AbstractMessageReader {
      constructor(process2) {
        super();
        this.process = process2;
        let eventEmitter = this.process;
        eventEmitter.on("error", (error) => this.fireError(error));
        eventEmitter.on("close", () => this.fireClose());
      }
      listen(callback) {
        this.process.on("message", callback);
        return api_1.Disposable.create(() => this.process.off("message", callback));
      }
    };
    exports2.IPCMessageReader = IPCMessageReader;
    var IPCMessageWriter = class extends api_1.AbstractMessageWriter {
      constructor(process2) {
        super();
        this.process = process2;
        this.errorCount = 0;
        const eventEmitter = this.process;
        eventEmitter.on("error", (error) => this.fireError(error));
        eventEmitter.on("close", () => this.fireClose);
      }
      write(msg) {
        try {
          if (typeof this.process.send === "function") {
            this.process.send(msg, void 0, void 0, (error) => {
              if (error) {
                this.errorCount++;
                this.handleError(error, msg);
              } else {
                this.errorCount = 0;
              }
            });
          }
          return Promise.resolve();
        } catch (error) {
          this.handleError(error, msg);
          return Promise.reject(error);
        }
      }
      handleError(error, msg) {
        this.errorCount++;
        this.fireError(error, msg, this.errorCount);
      }
      end() {
      }
    };
    exports2.IPCMessageWriter = IPCMessageWriter;
    var PortMessageReader = class extends api_1.AbstractMessageReader {
      constructor(port) {
        super();
        this.onData = new api_1.Emitter();
        port.on("close", () => this.fireClose);
        port.on("error", (error) => this.fireError(error));
        port.on("message", (message) => {
          this.onData.fire(message);
        });
      }
      listen(callback) {
        return this.onData.event(callback);
      }
    };
    exports2.PortMessageReader = PortMessageReader;
    var PortMessageWriter = class extends api_1.AbstractMessageWriter {
      constructor(port) {
        super();
        this.port = port;
        this.errorCount = 0;
        port.on("close", () => this.fireClose());
        port.on("error", (error) => this.fireError(error));
      }
      write(msg) {
        try {
          this.port.postMessage(msg);
          return Promise.resolve();
        } catch (error) {
          this.handleError(error, msg);
          return Promise.reject(error);
        }
      }
      handleError(error, msg) {
        this.errorCount++;
        this.fireError(error, msg, this.errorCount);
      }
      end() {
      }
    };
    exports2.PortMessageWriter = PortMessageWriter;
    var SocketMessageReader = class extends api_1.ReadableStreamMessageReader {
      constructor(socket, encoding = "utf-8") {
        super((0, ril_1.default)().stream.asReadableStream(socket), encoding);
      }
    };
    exports2.SocketMessageReader = SocketMessageReader;
    var SocketMessageWriter = class extends api_1.WriteableStreamMessageWriter {
      constructor(socket, options) {
        super((0, ril_1.default)().stream.asWritableStream(socket), options);
        this.socket = socket;
      }
      dispose() {
        super.dispose();
        this.socket.destroy();
      }
    };
    exports2.SocketMessageWriter = SocketMessageWriter;
    var StreamMessageReader = class extends api_1.ReadableStreamMessageReader {
      constructor(readable, encoding) {
        super((0, ril_1.default)().stream.asReadableStream(readable), encoding);
      }
    };
    exports2.StreamMessageReader = StreamMessageReader;
    var StreamMessageWriter = class extends api_1.WriteableStreamMessageWriter {
      constructor(writable, options) {
        super((0, ril_1.default)().stream.asWritableStream(writable), options);
      }
    };
    exports2.StreamMessageWriter = StreamMessageWriter;
    var XDG_RUNTIME_DIR = process.env["XDG_RUNTIME_DIR"];
    var safeIpcPathLengths = /* @__PURE__ */ new Map([
      ["linux", 107],
      ["darwin", 103]
    ]);
    function generateRandomPipeName() {
      const randomSuffix = (0, crypto_1.randomBytes)(21).toString("hex");
      if (process.platform === "win32") {
        return `\\\\.\\pipe\\vscode-jsonrpc-${randomSuffix}-sock`;
      }
      let result;
      if (XDG_RUNTIME_DIR) {
        result = path2.join(XDG_RUNTIME_DIR, `vscode-ipc-${randomSuffix}.sock`);
      } else {
        result = path2.join(os.tmpdir(), `vscode-${randomSuffix}.sock`);
      }
      const limit = safeIpcPathLengths.get(process.platform);
      if (limit !== void 0 && result.length > limit) {
        (0, ril_1.default)().console.warn(`WARNING: IPC handle "${result}" is longer than ${limit} characters.`);
      }
      return result;
    }
    exports2.generateRandomPipeName = generateRandomPipeName;
    function createClientPipeTransport(pipeName, encoding = "utf-8") {
      let connectResolve;
      const connected = new Promise((resolve, _reject) => {
        connectResolve = resolve;
      });
      return new Promise((resolve, reject) => {
        let server = (0, net_1.createServer)((socket) => {
          server.close();
          connectResolve([
            new SocketMessageReader(socket, encoding),
            new SocketMessageWriter(socket, encoding)
          ]);
        });
        server.on("error", reject);
        server.listen(pipeName, () => {
          server.removeListener("error", reject);
          resolve({
            onConnected: () => {
              return connected;
            }
          });
        });
      });
    }
    exports2.createClientPipeTransport = createClientPipeTransport;
    function createServerPipeTransport(pipeName, encoding = "utf-8") {
      const socket = (0, net_1.createConnection)(pipeName);
      return [
        new SocketMessageReader(socket, encoding),
        new SocketMessageWriter(socket, encoding)
      ];
    }
    exports2.createServerPipeTransport = createServerPipeTransport;
    function createClientSocketTransport(port, encoding = "utf-8") {
      let connectResolve;
      const connected = new Promise((resolve, _reject) => {
        connectResolve = resolve;
      });
      return new Promise((resolve, reject) => {
        const server = (0, net_1.createServer)((socket) => {
          server.close();
          connectResolve([
            new SocketMessageReader(socket, encoding),
            new SocketMessageWriter(socket, encoding)
          ]);
        });
        server.on("error", reject);
        server.listen(port, "127.0.0.1", () => {
          server.removeListener("error", reject);
          resolve({
            onConnected: () => {
              return connected;
            }
          });
        });
      });
    }
    exports2.createClientSocketTransport = createClientSocketTransport;
    function createServerSocketTransport(port, encoding = "utf-8") {
      const socket = (0, net_1.createConnection)(port, "127.0.0.1");
      return [
        new SocketMessageReader(socket, encoding),
        new SocketMessageWriter(socket, encoding)
      ];
    }
    exports2.createServerSocketTransport = createServerSocketTransport;
    function isReadableStream(value) {
      const candidate = value;
      return candidate.read !== void 0 && candidate.addListener !== void 0;
    }
    function isWritableStream(value) {
      const candidate = value;
      return candidate.write !== void 0 && candidate.addListener !== void 0;
    }
    function createMessageConnection(input, output, logger, options) {
      if (!logger) {
        logger = api_1.NullLogger;
      }
      const reader = isReadableStream(input) ? new StreamMessageReader(input) : input;
      const writer = isWritableStream(output) ? new StreamMessageWriter(output) : output;
      if (api_1.ConnectionStrategy.is(options)) {
        options = { connectionStrategy: options };
      }
      return (0, api_1.createMessageConnection)(reader, writer, logger, options);
    }
    exports2.createMessageConnection = createMessageConnection;
  }
});

// node_modules/vscode-jsonrpc/node.js
var require_node = __commonJS({
  "node_modules/vscode-jsonrpc/node.js"(exports2, module2) {
    "use strict";
    module2.exports = require_main();
  }
});

// node_modules/vscode-languageserver-types/lib/umd/main.js
var require_main2 = __commonJS({
  "node_modules/vscode-languageserver-types/lib/umd/main.js"(exports2, module2) {
    (function(factory) {
      if (typeof module2 === "object" && typeof module2.exports === "object") {
        var v = factory(require, exports2);
        if (v !== void 0) module2.exports = v;
      } else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
      }
    })(function(require2, exports3) {
      "use strict";
      Object.defineProperty(exports3, "__esModule", { value: true });
      exports3.TextDocument = exports3.EOL = exports3.WorkspaceFolder = exports3.InlineCompletionContext = exports3.SelectedCompletionInfo = exports3.InlineCompletionTriggerKind = exports3.InlineCompletionList = exports3.InlineCompletionItem = exports3.StringValue = exports3.InlayHint = exports3.InlayHintLabelPart = exports3.InlayHintKind = exports3.InlineValueContext = exports3.InlineValueEvaluatableExpression = exports3.InlineValueVariableLookup = exports3.InlineValueText = exports3.SemanticTokens = exports3.SemanticTokenModifiers = exports3.SemanticTokenTypes = exports3.SelectionRange = exports3.DocumentLink = exports3.FormattingOptions = exports3.CodeLens = exports3.CodeAction = exports3.CodeActionContext = exports3.CodeActionTriggerKind = exports3.CodeActionKind = exports3.DocumentSymbol = exports3.WorkspaceSymbol = exports3.SymbolInformation = exports3.SymbolTag = exports3.SymbolKind = exports3.DocumentHighlight = exports3.DocumentHighlightKind = exports3.SignatureInformation = exports3.ParameterInformation = exports3.Hover = exports3.MarkedString = exports3.CompletionList = exports3.CompletionItem = exports3.CompletionItemLabelDetails = exports3.InsertTextMode = exports3.InsertReplaceEdit = exports3.CompletionItemTag = exports3.InsertTextFormat = exports3.CompletionItemKind = exports3.MarkupContent = exports3.MarkupKind = exports3.TextDocumentItem = exports3.OptionalVersionedTextDocumentIdentifier = exports3.VersionedTextDocumentIdentifier = exports3.TextDocumentIdentifier = exports3.WorkspaceChange = exports3.WorkspaceEdit = exports3.DeleteFile = exports3.RenameFile = exports3.CreateFile = exports3.TextDocumentEdit = exports3.AnnotatedTextEdit = exports3.ChangeAnnotationIdentifier = exports3.ChangeAnnotation = exports3.TextEdit = exports3.Command = exports3.Diagnostic = exports3.CodeDescription = exports3.DiagnosticTag = exports3.DiagnosticSeverity = exports3.DiagnosticRelatedInformation = exports3.FoldingRange = exports3.FoldingRangeKind = exports3.ColorPresentation = exports3.ColorInformation = exports3.Color = exports3.LocationLink = exports3.Location = exports3.Range = exports3.Position = exports3.uinteger = exports3.integer = exports3.URI = exports3.DocumentUri = void 0;
      var DocumentUri;
      (function(DocumentUri2) {
        function is(value) {
          return typeof value === "string";
        }
        DocumentUri2.is = is;
      })(DocumentUri || (exports3.DocumentUri = DocumentUri = {}));
      var URI;
      (function(URI2) {
        function is(value) {
          return typeof value === "string";
        }
        URI2.is = is;
      })(URI || (exports3.URI = URI = {}));
      var integer;
      (function(integer2) {
        integer2.MIN_VALUE = -2147483648;
        integer2.MAX_VALUE = 2147483647;
        function is(value) {
          return typeof value === "number" && integer2.MIN_VALUE <= value && value <= integer2.MAX_VALUE;
        }
        integer2.is = is;
      })(integer || (exports3.integer = integer = {}));
      var uinteger;
      (function(uinteger2) {
        uinteger2.MIN_VALUE = 0;
        uinteger2.MAX_VALUE = 2147483647;
        function is(value) {
          return typeof value === "number" && uinteger2.MIN_VALUE <= value && value <= uinteger2.MAX_VALUE;
        }
        uinteger2.is = is;
      })(uinteger || (exports3.uinteger = uinteger = {}));
      var Position2;
      (function(Position3) {
        function create(line, character) {
          if (line === Number.MAX_VALUE) {
            line = uinteger.MAX_VALUE;
          }
          if (character === Number.MAX_VALUE) {
            character = uinteger.MAX_VALUE;
          }
          return { line, character };
        }
        Position3.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Is.uinteger(candidate.line) && Is.uinteger(candidate.character);
        }
        Position3.is = is;
      })(Position2 || (exports3.Position = Position2 = {}));
      var Range5;
      (function(Range6) {
        function create(one, two, three, four) {
          if (Is.uinteger(one) && Is.uinteger(two) && Is.uinteger(three) && Is.uinteger(four)) {
            return { start: Position2.create(one, two), end: Position2.create(three, four) };
          } else if (Position2.is(one) && Position2.is(two)) {
            return { start: one, end: two };
          } else {
            throw new Error("Range#create called with invalid arguments[".concat(one, ", ").concat(two, ", ").concat(three, ", ").concat(four, "]"));
          }
        }
        Range6.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Position2.is(candidate.start) && Position2.is(candidate.end);
        }
        Range6.is = is;
      })(Range5 || (exports3.Range = Range5 = {}));
      var Location;
      (function(Location2) {
        function create(uri, range) {
          return { uri, range };
        }
        Location2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Range5.is(candidate.range) && (Is.string(candidate.uri) || Is.undefined(candidate.uri));
        }
        Location2.is = is;
      })(Location || (exports3.Location = Location = {}));
      var LocationLink;
      (function(LocationLink2) {
        function create(targetUri, targetRange, targetSelectionRange, originSelectionRange) {
          return { targetUri, targetRange, targetSelectionRange, originSelectionRange };
        }
        LocationLink2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Range5.is(candidate.targetRange) && Is.string(candidate.targetUri) && Range5.is(candidate.targetSelectionRange) && (Range5.is(candidate.originSelectionRange) || Is.undefined(candidate.originSelectionRange));
        }
        LocationLink2.is = is;
      })(LocationLink || (exports3.LocationLink = LocationLink = {}));
      var Color;
      (function(Color2) {
        function create(red, green, blue, alpha) {
          return {
            red,
            green,
            blue,
            alpha
          };
        }
        Color2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Is.numberRange(candidate.red, 0, 1) && Is.numberRange(candidate.green, 0, 1) && Is.numberRange(candidate.blue, 0, 1) && Is.numberRange(candidate.alpha, 0, 1);
        }
        Color2.is = is;
      })(Color || (exports3.Color = Color = {}));
      var ColorInformation;
      (function(ColorInformation2) {
        function create(range, color) {
          return {
            range,
            color
          };
        }
        ColorInformation2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Range5.is(candidate.range) && Color.is(candidate.color);
        }
        ColorInformation2.is = is;
      })(ColorInformation || (exports3.ColorInformation = ColorInformation = {}));
      var ColorPresentation;
      (function(ColorPresentation2) {
        function create(label, textEdit, additionalTextEdits) {
          return {
            label,
            textEdit,
            additionalTextEdits
          };
        }
        ColorPresentation2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Is.string(candidate.label) && (Is.undefined(candidate.textEdit) || TextEdit.is(candidate)) && (Is.undefined(candidate.additionalTextEdits) || Is.typedArray(candidate.additionalTextEdits, TextEdit.is));
        }
        ColorPresentation2.is = is;
      })(ColorPresentation || (exports3.ColorPresentation = ColorPresentation = {}));
      var FoldingRangeKind;
      (function(FoldingRangeKind2) {
        FoldingRangeKind2.Comment = "comment";
        FoldingRangeKind2.Imports = "imports";
        FoldingRangeKind2.Region = "region";
      })(FoldingRangeKind || (exports3.FoldingRangeKind = FoldingRangeKind = {}));
      var FoldingRange;
      (function(FoldingRange2) {
        function create(startLine, endLine, startCharacter, endCharacter, kind, collapsedText) {
          var result = {
            startLine,
            endLine
          };
          if (Is.defined(startCharacter)) {
            result.startCharacter = startCharacter;
          }
          if (Is.defined(endCharacter)) {
            result.endCharacter = endCharacter;
          }
          if (Is.defined(kind)) {
            result.kind = kind;
          }
          if (Is.defined(collapsedText)) {
            result.collapsedText = collapsedText;
          }
          return result;
        }
        FoldingRange2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Is.uinteger(candidate.startLine) && Is.uinteger(candidate.startLine) && (Is.undefined(candidate.startCharacter) || Is.uinteger(candidate.startCharacter)) && (Is.undefined(candidate.endCharacter) || Is.uinteger(candidate.endCharacter)) && (Is.undefined(candidate.kind) || Is.string(candidate.kind));
        }
        FoldingRange2.is = is;
      })(FoldingRange || (exports3.FoldingRange = FoldingRange = {}));
      var DiagnosticRelatedInformation;
      (function(DiagnosticRelatedInformation2) {
        function create(location, message) {
          return {
            location,
            message
          };
        }
        DiagnosticRelatedInformation2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Location.is(candidate.location) && Is.string(candidate.message);
        }
        DiagnosticRelatedInformation2.is = is;
      })(DiagnosticRelatedInformation || (exports3.DiagnosticRelatedInformation = DiagnosticRelatedInformation = {}));
      var DiagnosticSeverity;
      (function(DiagnosticSeverity2) {
        DiagnosticSeverity2.Error = 1;
        DiagnosticSeverity2.Warning = 2;
        DiagnosticSeverity2.Information = 3;
        DiagnosticSeverity2.Hint = 4;
      })(DiagnosticSeverity || (exports3.DiagnosticSeverity = DiagnosticSeverity = {}));
      var DiagnosticTag;
      (function(DiagnosticTag2) {
        DiagnosticTag2.Unnecessary = 1;
        DiagnosticTag2.Deprecated = 2;
      })(DiagnosticTag || (exports3.DiagnosticTag = DiagnosticTag = {}));
      var CodeDescription;
      (function(CodeDescription2) {
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Is.string(candidate.href);
        }
        CodeDescription2.is = is;
      })(CodeDescription || (exports3.CodeDescription = CodeDescription = {}));
      var Diagnostic;
      (function(Diagnostic2) {
        function create(range, message, severity, code, source, relatedInformation) {
          var result = { range, message };
          if (Is.defined(severity)) {
            result.severity = severity;
          }
          if (Is.defined(code)) {
            result.code = code;
          }
          if (Is.defined(source)) {
            result.source = source;
          }
          if (Is.defined(relatedInformation)) {
            result.relatedInformation = relatedInformation;
          }
          return result;
        }
        Diagnostic2.create = create;
        function is(value) {
          var _a;
          var candidate = value;
          return Is.defined(candidate) && Range5.is(candidate.range) && Is.string(candidate.message) && (Is.number(candidate.severity) || Is.undefined(candidate.severity)) && (Is.integer(candidate.code) || Is.string(candidate.code) || Is.undefined(candidate.code)) && (Is.undefined(candidate.codeDescription) || Is.string((_a = candidate.codeDescription) === null || _a === void 0 ? void 0 : _a.href)) && (Is.string(candidate.source) || Is.undefined(candidate.source)) && (Is.undefined(candidate.relatedInformation) || Is.typedArray(candidate.relatedInformation, DiagnosticRelatedInformation.is));
        }
        Diagnostic2.is = is;
      })(Diagnostic || (exports3.Diagnostic = Diagnostic = {}));
      var Command;
      (function(Command2) {
        function create(title, command) {
          var args = [];
          for (var _i = 2; _i < arguments.length; _i++) {
            args[_i - 2] = arguments[_i];
          }
          var result = { title, command };
          if (Is.defined(args) && args.length > 0) {
            result.arguments = args;
          }
          return result;
        }
        Command2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.string(candidate.title) && Is.string(candidate.command);
        }
        Command2.is = is;
      })(Command || (exports3.Command = Command = {}));
      var TextEdit;
      (function(TextEdit2) {
        function replace(range, newText) {
          return { range, newText };
        }
        TextEdit2.replace = replace;
        function insert(position, newText) {
          return { range: { start: position, end: position }, newText };
        }
        TextEdit2.insert = insert;
        function del(range) {
          return { range, newText: "" };
        }
        TextEdit2.del = del;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Is.string(candidate.newText) && Range5.is(candidate.range);
        }
        TextEdit2.is = is;
      })(TextEdit || (exports3.TextEdit = TextEdit = {}));
      var ChangeAnnotation;
      (function(ChangeAnnotation2) {
        function create(label, needsConfirmation, description) {
          var result = { label };
          if (needsConfirmation !== void 0) {
            result.needsConfirmation = needsConfirmation;
          }
          if (description !== void 0) {
            result.description = description;
          }
          return result;
        }
        ChangeAnnotation2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Is.string(candidate.label) && (Is.boolean(candidate.needsConfirmation) || candidate.needsConfirmation === void 0) && (Is.string(candidate.description) || candidate.description === void 0);
        }
        ChangeAnnotation2.is = is;
      })(ChangeAnnotation || (exports3.ChangeAnnotation = ChangeAnnotation = {}));
      var ChangeAnnotationIdentifier;
      (function(ChangeAnnotationIdentifier2) {
        function is(value) {
          var candidate = value;
          return Is.string(candidate);
        }
        ChangeAnnotationIdentifier2.is = is;
      })(ChangeAnnotationIdentifier || (exports3.ChangeAnnotationIdentifier = ChangeAnnotationIdentifier = {}));
      var AnnotatedTextEdit;
      (function(AnnotatedTextEdit2) {
        function replace(range, newText, annotation) {
          return { range, newText, annotationId: annotation };
        }
        AnnotatedTextEdit2.replace = replace;
        function insert(position, newText, annotation) {
          return { range: { start: position, end: position }, newText, annotationId: annotation };
        }
        AnnotatedTextEdit2.insert = insert;
        function del(range, annotation) {
          return { range, newText: "", annotationId: annotation };
        }
        AnnotatedTextEdit2.del = del;
        function is(value) {
          var candidate = value;
          return TextEdit.is(candidate) && (ChangeAnnotation.is(candidate.annotationId) || ChangeAnnotationIdentifier.is(candidate.annotationId));
        }
        AnnotatedTextEdit2.is = is;
      })(AnnotatedTextEdit || (exports3.AnnotatedTextEdit = AnnotatedTextEdit = {}));
      var TextDocumentEdit;
      (function(TextDocumentEdit2) {
        function create(textDocument, edits) {
          return { textDocument, edits };
        }
        TextDocumentEdit2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && OptionalVersionedTextDocumentIdentifier.is(candidate.textDocument) && Array.isArray(candidate.edits);
        }
        TextDocumentEdit2.is = is;
      })(TextDocumentEdit || (exports3.TextDocumentEdit = TextDocumentEdit = {}));
      var CreateFile;
      (function(CreateFile2) {
        function create(uri, options, annotation) {
          var result = {
            kind: "create",
            uri
          };
          if (options !== void 0 && (options.overwrite !== void 0 || options.ignoreIfExists !== void 0)) {
            result.options = options;
          }
          if (annotation !== void 0) {
            result.annotationId = annotation;
          }
          return result;
        }
        CreateFile2.create = create;
        function is(value) {
          var candidate = value;
          return candidate && candidate.kind === "create" && Is.string(candidate.uri) && (candidate.options === void 0 || (candidate.options.overwrite === void 0 || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === void 0 || Is.boolean(candidate.options.ignoreIfExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
        }
        CreateFile2.is = is;
      })(CreateFile || (exports3.CreateFile = CreateFile = {}));
      var RenameFile;
      (function(RenameFile2) {
        function create(oldUri, newUri, options, annotation) {
          var result = {
            kind: "rename",
            oldUri,
            newUri
          };
          if (options !== void 0 && (options.overwrite !== void 0 || options.ignoreIfExists !== void 0)) {
            result.options = options;
          }
          if (annotation !== void 0) {
            result.annotationId = annotation;
          }
          return result;
        }
        RenameFile2.create = create;
        function is(value) {
          var candidate = value;
          return candidate && candidate.kind === "rename" && Is.string(candidate.oldUri) && Is.string(candidate.newUri) && (candidate.options === void 0 || (candidate.options.overwrite === void 0 || Is.boolean(candidate.options.overwrite)) && (candidate.options.ignoreIfExists === void 0 || Is.boolean(candidate.options.ignoreIfExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
        }
        RenameFile2.is = is;
      })(RenameFile || (exports3.RenameFile = RenameFile = {}));
      var DeleteFile;
      (function(DeleteFile2) {
        function create(uri, options, annotation) {
          var result = {
            kind: "delete",
            uri
          };
          if (options !== void 0 && (options.recursive !== void 0 || options.ignoreIfNotExists !== void 0)) {
            result.options = options;
          }
          if (annotation !== void 0) {
            result.annotationId = annotation;
          }
          return result;
        }
        DeleteFile2.create = create;
        function is(value) {
          var candidate = value;
          return candidate && candidate.kind === "delete" && Is.string(candidate.uri) && (candidate.options === void 0 || (candidate.options.recursive === void 0 || Is.boolean(candidate.options.recursive)) && (candidate.options.ignoreIfNotExists === void 0 || Is.boolean(candidate.options.ignoreIfNotExists))) && (candidate.annotationId === void 0 || ChangeAnnotationIdentifier.is(candidate.annotationId));
        }
        DeleteFile2.is = is;
      })(DeleteFile || (exports3.DeleteFile = DeleteFile = {}));
      var WorkspaceEdit2;
      (function(WorkspaceEdit3) {
        function is(value) {
          var candidate = value;
          return candidate && (candidate.changes !== void 0 || candidate.documentChanges !== void 0) && (candidate.documentChanges === void 0 || candidate.documentChanges.every(function(change) {
            if (Is.string(change.kind)) {
              return CreateFile.is(change) || RenameFile.is(change) || DeleteFile.is(change);
            } else {
              return TextDocumentEdit.is(change);
            }
          }));
        }
        WorkspaceEdit3.is = is;
      })(WorkspaceEdit2 || (exports3.WorkspaceEdit = WorkspaceEdit2 = {}));
      var TextEditChangeImpl = (
        /** @class */
        (function() {
          function TextEditChangeImpl2(edits, changeAnnotations) {
            this.edits = edits;
            this.changeAnnotations = changeAnnotations;
          }
          TextEditChangeImpl2.prototype.insert = function(position, newText, annotation) {
            var edit;
            var id;
            if (annotation === void 0) {
              edit = TextEdit.insert(position, newText);
            } else if (ChangeAnnotationIdentifier.is(annotation)) {
              id = annotation;
              edit = AnnotatedTextEdit.insert(position, newText, annotation);
            } else {
              this.assertChangeAnnotations(this.changeAnnotations);
              id = this.changeAnnotations.manage(annotation);
              edit = AnnotatedTextEdit.insert(position, newText, id);
            }
            this.edits.push(edit);
            if (id !== void 0) {
              return id;
            }
          };
          TextEditChangeImpl2.prototype.replace = function(range, newText, annotation) {
            var edit;
            var id;
            if (annotation === void 0) {
              edit = TextEdit.replace(range, newText);
            } else if (ChangeAnnotationIdentifier.is(annotation)) {
              id = annotation;
              edit = AnnotatedTextEdit.replace(range, newText, annotation);
            } else {
              this.assertChangeAnnotations(this.changeAnnotations);
              id = this.changeAnnotations.manage(annotation);
              edit = AnnotatedTextEdit.replace(range, newText, id);
            }
            this.edits.push(edit);
            if (id !== void 0) {
              return id;
            }
          };
          TextEditChangeImpl2.prototype.delete = function(range, annotation) {
            var edit;
            var id;
            if (annotation === void 0) {
              edit = TextEdit.del(range);
            } else if (ChangeAnnotationIdentifier.is(annotation)) {
              id = annotation;
              edit = AnnotatedTextEdit.del(range, annotation);
            } else {
              this.assertChangeAnnotations(this.changeAnnotations);
              id = this.changeAnnotations.manage(annotation);
              edit = AnnotatedTextEdit.del(range, id);
            }
            this.edits.push(edit);
            if (id !== void 0) {
              return id;
            }
          };
          TextEditChangeImpl2.prototype.add = function(edit) {
            this.edits.push(edit);
          };
          TextEditChangeImpl2.prototype.all = function() {
            return this.edits;
          };
          TextEditChangeImpl2.prototype.clear = function() {
            this.edits.splice(0, this.edits.length);
          };
          TextEditChangeImpl2.prototype.assertChangeAnnotations = function(value) {
            if (value === void 0) {
              throw new Error("Text edit change is not configured to manage change annotations.");
            }
          };
          return TextEditChangeImpl2;
        })()
      );
      var ChangeAnnotations = (
        /** @class */
        (function() {
          function ChangeAnnotations2(annotations) {
            this._annotations = annotations === void 0 ? /* @__PURE__ */ Object.create(null) : annotations;
            this._counter = 0;
            this._size = 0;
          }
          ChangeAnnotations2.prototype.all = function() {
            return this._annotations;
          };
          Object.defineProperty(ChangeAnnotations2.prototype, "size", {
            get: function() {
              return this._size;
            },
            enumerable: false,
            configurable: true
          });
          ChangeAnnotations2.prototype.manage = function(idOrAnnotation, annotation) {
            var id;
            if (ChangeAnnotationIdentifier.is(idOrAnnotation)) {
              id = idOrAnnotation;
            } else {
              id = this.nextId();
              annotation = idOrAnnotation;
            }
            if (this._annotations[id] !== void 0) {
              throw new Error("Id ".concat(id, " is already in use."));
            }
            if (annotation === void 0) {
              throw new Error("No annotation provided for id ".concat(id));
            }
            this._annotations[id] = annotation;
            this._size++;
            return id;
          };
          ChangeAnnotations2.prototype.nextId = function() {
            this._counter++;
            return this._counter.toString();
          };
          return ChangeAnnotations2;
        })()
      );
      var WorkspaceChange = (
        /** @class */
        (function() {
          function WorkspaceChange2(workspaceEdit) {
            var _this = this;
            this._textEditChanges = /* @__PURE__ */ Object.create(null);
            if (workspaceEdit !== void 0) {
              this._workspaceEdit = workspaceEdit;
              if (workspaceEdit.documentChanges) {
                this._changeAnnotations = new ChangeAnnotations(workspaceEdit.changeAnnotations);
                workspaceEdit.changeAnnotations = this._changeAnnotations.all();
                workspaceEdit.documentChanges.forEach(function(change) {
                  if (TextDocumentEdit.is(change)) {
                    var textEditChange = new TextEditChangeImpl(change.edits, _this._changeAnnotations);
                    _this._textEditChanges[change.textDocument.uri] = textEditChange;
                  }
                });
              } else if (workspaceEdit.changes) {
                Object.keys(workspaceEdit.changes).forEach(function(key) {
                  var textEditChange = new TextEditChangeImpl(workspaceEdit.changes[key]);
                  _this._textEditChanges[key] = textEditChange;
                });
              }
            } else {
              this._workspaceEdit = {};
            }
          }
          Object.defineProperty(WorkspaceChange2.prototype, "edit", {
            /**
             * Returns the underlying {@link WorkspaceEdit} literal
             * use to be returned from a workspace edit operation like rename.
             */
            get: function() {
              this.initDocumentChanges();
              if (this._changeAnnotations !== void 0) {
                if (this._changeAnnotations.size === 0) {
                  this._workspaceEdit.changeAnnotations = void 0;
                } else {
                  this._workspaceEdit.changeAnnotations = this._changeAnnotations.all();
                }
              }
              return this._workspaceEdit;
            },
            enumerable: false,
            configurable: true
          });
          WorkspaceChange2.prototype.getTextEditChange = function(key) {
            if (OptionalVersionedTextDocumentIdentifier.is(key)) {
              this.initDocumentChanges();
              if (this._workspaceEdit.documentChanges === void 0) {
                throw new Error("Workspace edit is not configured for document changes.");
              }
              var textDocument = { uri: key.uri, version: key.version };
              var result = this._textEditChanges[textDocument.uri];
              if (!result) {
                var edits = [];
                var textDocumentEdit = {
                  textDocument,
                  edits
                };
                this._workspaceEdit.documentChanges.push(textDocumentEdit);
                result = new TextEditChangeImpl(edits, this._changeAnnotations);
                this._textEditChanges[textDocument.uri] = result;
              }
              return result;
            } else {
              this.initChanges();
              if (this._workspaceEdit.changes === void 0) {
                throw new Error("Workspace edit is not configured for normal text edit changes.");
              }
              var result = this._textEditChanges[key];
              if (!result) {
                var edits = [];
                this._workspaceEdit.changes[key] = edits;
                result = new TextEditChangeImpl(edits);
                this._textEditChanges[key] = result;
              }
              return result;
            }
          };
          WorkspaceChange2.prototype.initDocumentChanges = function() {
            if (this._workspaceEdit.documentChanges === void 0 && this._workspaceEdit.changes === void 0) {
              this._changeAnnotations = new ChangeAnnotations();
              this._workspaceEdit.documentChanges = [];
              this._workspaceEdit.changeAnnotations = this._changeAnnotations.all();
            }
          };
          WorkspaceChange2.prototype.initChanges = function() {
            if (this._workspaceEdit.documentChanges === void 0 && this._workspaceEdit.changes === void 0) {
              this._workspaceEdit.changes = /* @__PURE__ */ Object.create(null);
            }
          };
          WorkspaceChange2.prototype.createFile = function(uri, optionsOrAnnotation, options) {
            this.initDocumentChanges();
            if (this._workspaceEdit.documentChanges === void 0) {
              throw new Error("Workspace edit is not configured for document changes.");
            }
            var annotation;
            if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
              annotation = optionsOrAnnotation;
            } else {
              options = optionsOrAnnotation;
            }
            var operation;
            var id;
            if (annotation === void 0) {
              operation = CreateFile.create(uri, options);
            } else {
              id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
              operation = CreateFile.create(uri, options, id);
            }
            this._workspaceEdit.documentChanges.push(operation);
            if (id !== void 0) {
              return id;
            }
          };
          WorkspaceChange2.prototype.renameFile = function(oldUri, newUri, optionsOrAnnotation, options) {
            this.initDocumentChanges();
            if (this._workspaceEdit.documentChanges === void 0) {
              throw new Error("Workspace edit is not configured for document changes.");
            }
            var annotation;
            if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
              annotation = optionsOrAnnotation;
            } else {
              options = optionsOrAnnotation;
            }
            var operation;
            var id;
            if (annotation === void 0) {
              operation = RenameFile.create(oldUri, newUri, options);
            } else {
              id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
              operation = RenameFile.create(oldUri, newUri, options, id);
            }
            this._workspaceEdit.documentChanges.push(operation);
            if (id !== void 0) {
              return id;
            }
          };
          WorkspaceChange2.prototype.deleteFile = function(uri, optionsOrAnnotation, options) {
            this.initDocumentChanges();
            if (this._workspaceEdit.documentChanges === void 0) {
              throw new Error("Workspace edit is not configured for document changes.");
            }
            var annotation;
            if (ChangeAnnotation.is(optionsOrAnnotation) || ChangeAnnotationIdentifier.is(optionsOrAnnotation)) {
              annotation = optionsOrAnnotation;
            } else {
              options = optionsOrAnnotation;
            }
            var operation;
            var id;
            if (annotation === void 0) {
              operation = DeleteFile.create(uri, options);
            } else {
              id = ChangeAnnotationIdentifier.is(annotation) ? annotation : this._changeAnnotations.manage(annotation);
              operation = DeleteFile.create(uri, options, id);
            }
            this._workspaceEdit.documentChanges.push(operation);
            if (id !== void 0) {
              return id;
            }
          };
          return WorkspaceChange2;
        })()
      );
      exports3.WorkspaceChange = WorkspaceChange;
      var TextDocumentIdentifier;
      (function(TextDocumentIdentifier2) {
        function create(uri) {
          return { uri };
        }
        TextDocumentIdentifier2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.string(candidate.uri);
        }
        TextDocumentIdentifier2.is = is;
      })(TextDocumentIdentifier || (exports3.TextDocumentIdentifier = TextDocumentIdentifier = {}));
      var VersionedTextDocumentIdentifier;
      (function(VersionedTextDocumentIdentifier2) {
        function create(uri, version) {
          return { uri, version };
        }
        VersionedTextDocumentIdentifier2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.string(candidate.uri) && Is.integer(candidate.version);
        }
        VersionedTextDocumentIdentifier2.is = is;
      })(VersionedTextDocumentIdentifier || (exports3.VersionedTextDocumentIdentifier = VersionedTextDocumentIdentifier = {}));
      var OptionalVersionedTextDocumentIdentifier;
      (function(OptionalVersionedTextDocumentIdentifier2) {
        function create(uri, version) {
          return { uri, version };
        }
        OptionalVersionedTextDocumentIdentifier2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.string(candidate.uri) && (candidate.version === null || Is.integer(candidate.version));
        }
        OptionalVersionedTextDocumentIdentifier2.is = is;
      })(OptionalVersionedTextDocumentIdentifier || (exports3.OptionalVersionedTextDocumentIdentifier = OptionalVersionedTextDocumentIdentifier = {}));
      var TextDocumentItem;
      (function(TextDocumentItem2) {
        function create(uri, languageId, version, text) {
          return { uri, languageId, version, text };
        }
        TextDocumentItem2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.string(candidate.uri) && Is.string(candidate.languageId) && Is.integer(candidate.version) && Is.string(candidate.text);
        }
        TextDocumentItem2.is = is;
      })(TextDocumentItem || (exports3.TextDocumentItem = TextDocumentItem = {}));
      var MarkupKind;
      (function(MarkupKind2) {
        MarkupKind2.PlainText = "plaintext";
        MarkupKind2.Markdown = "markdown";
        function is(value) {
          var candidate = value;
          return candidate === MarkupKind2.PlainText || candidate === MarkupKind2.Markdown;
        }
        MarkupKind2.is = is;
      })(MarkupKind || (exports3.MarkupKind = MarkupKind = {}));
      var MarkupContent;
      (function(MarkupContent2) {
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(value) && MarkupKind.is(candidate.kind) && Is.string(candidate.value);
        }
        MarkupContent2.is = is;
      })(MarkupContent || (exports3.MarkupContent = MarkupContent = {}));
      var CompletionItemKind;
      (function(CompletionItemKind2) {
        CompletionItemKind2.Text = 1;
        CompletionItemKind2.Method = 2;
        CompletionItemKind2.Function = 3;
        CompletionItemKind2.Constructor = 4;
        CompletionItemKind2.Field = 5;
        CompletionItemKind2.Variable = 6;
        CompletionItemKind2.Class = 7;
        CompletionItemKind2.Interface = 8;
        CompletionItemKind2.Module = 9;
        CompletionItemKind2.Property = 10;
        CompletionItemKind2.Unit = 11;
        CompletionItemKind2.Value = 12;
        CompletionItemKind2.Enum = 13;
        CompletionItemKind2.Keyword = 14;
        CompletionItemKind2.Snippet = 15;
        CompletionItemKind2.Color = 16;
        CompletionItemKind2.File = 17;
        CompletionItemKind2.Reference = 18;
        CompletionItemKind2.Folder = 19;
        CompletionItemKind2.EnumMember = 20;
        CompletionItemKind2.Constant = 21;
        CompletionItemKind2.Struct = 22;
        CompletionItemKind2.Event = 23;
        CompletionItemKind2.Operator = 24;
        CompletionItemKind2.TypeParameter = 25;
      })(CompletionItemKind || (exports3.CompletionItemKind = CompletionItemKind = {}));
      var InsertTextFormat;
      (function(InsertTextFormat2) {
        InsertTextFormat2.PlainText = 1;
        InsertTextFormat2.Snippet = 2;
      })(InsertTextFormat || (exports3.InsertTextFormat = InsertTextFormat = {}));
      var CompletionItemTag;
      (function(CompletionItemTag2) {
        CompletionItemTag2.Deprecated = 1;
      })(CompletionItemTag || (exports3.CompletionItemTag = CompletionItemTag = {}));
      var InsertReplaceEdit;
      (function(InsertReplaceEdit2) {
        function create(newText, insert, replace) {
          return { newText, insert, replace };
        }
        InsertReplaceEdit2.create = create;
        function is(value) {
          var candidate = value;
          return candidate && Is.string(candidate.newText) && Range5.is(candidate.insert) && Range5.is(candidate.replace);
        }
        InsertReplaceEdit2.is = is;
      })(InsertReplaceEdit || (exports3.InsertReplaceEdit = InsertReplaceEdit = {}));
      var InsertTextMode;
      (function(InsertTextMode2) {
        InsertTextMode2.asIs = 1;
        InsertTextMode2.adjustIndentation = 2;
      })(InsertTextMode || (exports3.InsertTextMode = InsertTextMode = {}));
      var CompletionItemLabelDetails;
      (function(CompletionItemLabelDetails2) {
        function is(value) {
          var candidate = value;
          return candidate && (Is.string(candidate.detail) || candidate.detail === void 0) && (Is.string(candidate.description) || candidate.description === void 0);
        }
        CompletionItemLabelDetails2.is = is;
      })(CompletionItemLabelDetails || (exports3.CompletionItemLabelDetails = CompletionItemLabelDetails = {}));
      var CompletionItem;
      (function(CompletionItem2) {
        function create(label) {
          return { label };
        }
        CompletionItem2.create = create;
      })(CompletionItem || (exports3.CompletionItem = CompletionItem = {}));
      var CompletionList;
      (function(CompletionList2) {
        function create(items, isIncomplete) {
          return { items: items ? items : [], isIncomplete: !!isIncomplete };
        }
        CompletionList2.create = create;
      })(CompletionList || (exports3.CompletionList = CompletionList = {}));
      var MarkedString;
      (function(MarkedString2) {
        function fromPlainText(plainText) {
          return plainText.replace(/[\\`*_{}[\]()#+\-.!]/g, "\\$&");
        }
        MarkedString2.fromPlainText = fromPlainText;
        function is(value) {
          var candidate = value;
          return Is.string(candidate) || Is.objectLiteral(candidate) && Is.string(candidate.language) && Is.string(candidate.value);
        }
        MarkedString2.is = is;
      })(MarkedString || (exports3.MarkedString = MarkedString = {}));
      var Hover;
      (function(Hover2) {
        function is(value) {
          var candidate = value;
          return !!candidate && Is.objectLiteral(candidate) && (MarkupContent.is(candidate.contents) || MarkedString.is(candidate.contents) || Is.typedArray(candidate.contents, MarkedString.is)) && (value.range === void 0 || Range5.is(value.range));
        }
        Hover2.is = is;
      })(Hover || (exports3.Hover = Hover = {}));
      var ParameterInformation;
      (function(ParameterInformation2) {
        function create(label, documentation) {
          return documentation ? { label, documentation } : { label };
        }
        ParameterInformation2.create = create;
      })(ParameterInformation || (exports3.ParameterInformation = ParameterInformation = {}));
      var SignatureInformation;
      (function(SignatureInformation2) {
        function create(label, documentation) {
          var parameters = [];
          for (var _i = 2; _i < arguments.length; _i++) {
            parameters[_i - 2] = arguments[_i];
          }
          var result = { label };
          if (Is.defined(documentation)) {
            result.documentation = documentation;
          }
          if (Is.defined(parameters)) {
            result.parameters = parameters;
          } else {
            result.parameters = [];
          }
          return result;
        }
        SignatureInformation2.create = create;
      })(SignatureInformation || (exports3.SignatureInformation = SignatureInformation = {}));
      var DocumentHighlightKind;
      (function(DocumentHighlightKind2) {
        DocumentHighlightKind2.Text = 1;
        DocumentHighlightKind2.Read = 2;
        DocumentHighlightKind2.Write = 3;
      })(DocumentHighlightKind || (exports3.DocumentHighlightKind = DocumentHighlightKind = {}));
      var DocumentHighlight;
      (function(DocumentHighlight2) {
        function create(range, kind) {
          var result = { range };
          if (Is.number(kind)) {
            result.kind = kind;
          }
          return result;
        }
        DocumentHighlight2.create = create;
      })(DocumentHighlight || (exports3.DocumentHighlight = DocumentHighlight = {}));
      var SymbolKind;
      (function(SymbolKind2) {
        SymbolKind2.File = 1;
        SymbolKind2.Module = 2;
        SymbolKind2.Namespace = 3;
        SymbolKind2.Package = 4;
        SymbolKind2.Class = 5;
        SymbolKind2.Method = 6;
        SymbolKind2.Property = 7;
        SymbolKind2.Field = 8;
        SymbolKind2.Constructor = 9;
        SymbolKind2.Enum = 10;
        SymbolKind2.Interface = 11;
        SymbolKind2.Function = 12;
        SymbolKind2.Variable = 13;
        SymbolKind2.Constant = 14;
        SymbolKind2.String = 15;
        SymbolKind2.Number = 16;
        SymbolKind2.Boolean = 17;
        SymbolKind2.Array = 18;
        SymbolKind2.Object = 19;
        SymbolKind2.Key = 20;
        SymbolKind2.Null = 21;
        SymbolKind2.EnumMember = 22;
        SymbolKind2.Struct = 23;
        SymbolKind2.Event = 24;
        SymbolKind2.Operator = 25;
        SymbolKind2.TypeParameter = 26;
      })(SymbolKind || (exports3.SymbolKind = SymbolKind = {}));
      var SymbolTag;
      (function(SymbolTag2) {
        SymbolTag2.Deprecated = 1;
      })(SymbolTag || (exports3.SymbolTag = SymbolTag = {}));
      var SymbolInformation;
      (function(SymbolInformation2) {
        function create(name, kind, range, uri, containerName) {
          var result = {
            name,
            kind,
            location: { uri, range }
          };
          if (containerName) {
            result.containerName = containerName;
          }
          return result;
        }
        SymbolInformation2.create = create;
      })(SymbolInformation || (exports3.SymbolInformation = SymbolInformation = {}));
      var WorkspaceSymbol;
      (function(WorkspaceSymbol2) {
        function create(name, kind, uri, range) {
          return range !== void 0 ? { name, kind, location: { uri, range } } : { name, kind, location: { uri } };
        }
        WorkspaceSymbol2.create = create;
      })(WorkspaceSymbol || (exports3.WorkspaceSymbol = WorkspaceSymbol = {}));
      var DocumentSymbol;
      (function(DocumentSymbol2) {
        function create(name, detail, kind, range, selectionRange, children) {
          var result = {
            name,
            detail,
            kind,
            range,
            selectionRange
          };
          if (children !== void 0) {
            result.children = children;
          }
          return result;
        }
        DocumentSymbol2.create = create;
        function is(value) {
          var candidate = value;
          return candidate && Is.string(candidate.name) && Is.number(candidate.kind) && Range5.is(candidate.range) && Range5.is(candidate.selectionRange) && (candidate.detail === void 0 || Is.string(candidate.detail)) && (candidate.deprecated === void 0 || Is.boolean(candidate.deprecated)) && (candidate.children === void 0 || Array.isArray(candidate.children)) && (candidate.tags === void 0 || Array.isArray(candidate.tags));
        }
        DocumentSymbol2.is = is;
      })(DocumentSymbol || (exports3.DocumentSymbol = DocumentSymbol = {}));
      var CodeActionKind;
      (function(CodeActionKind2) {
        CodeActionKind2.Empty = "";
        CodeActionKind2.QuickFix = "quickfix";
        CodeActionKind2.Refactor = "refactor";
        CodeActionKind2.RefactorExtract = "refactor.extract";
        CodeActionKind2.RefactorInline = "refactor.inline";
        CodeActionKind2.RefactorRewrite = "refactor.rewrite";
        CodeActionKind2.Source = "source";
        CodeActionKind2.SourceOrganizeImports = "source.organizeImports";
        CodeActionKind2.SourceFixAll = "source.fixAll";
      })(CodeActionKind || (exports3.CodeActionKind = CodeActionKind = {}));
      var CodeActionTriggerKind;
      (function(CodeActionTriggerKind2) {
        CodeActionTriggerKind2.Invoked = 1;
        CodeActionTriggerKind2.Automatic = 2;
      })(CodeActionTriggerKind || (exports3.CodeActionTriggerKind = CodeActionTriggerKind = {}));
      var CodeActionContext;
      (function(CodeActionContext2) {
        function create(diagnostics, only, triggerKind) {
          var result = { diagnostics };
          if (only !== void 0 && only !== null) {
            result.only = only;
          }
          if (triggerKind !== void 0 && triggerKind !== null) {
            result.triggerKind = triggerKind;
          }
          return result;
        }
        CodeActionContext2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.typedArray(candidate.diagnostics, Diagnostic.is) && (candidate.only === void 0 || Is.typedArray(candidate.only, Is.string)) && (candidate.triggerKind === void 0 || candidate.triggerKind === CodeActionTriggerKind.Invoked || candidate.triggerKind === CodeActionTriggerKind.Automatic);
        }
        CodeActionContext2.is = is;
      })(CodeActionContext || (exports3.CodeActionContext = CodeActionContext = {}));
      var CodeAction;
      (function(CodeAction2) {
        function create(title, kindOrCommandOrEdit, kind) {
          var result = { title };
          var checkKind = true;
          if (typeof kindOrCommandOrEdit === "string") {
            checkKind = false;
            result.kind = kindOrCommandOrEdit;
          } else if (Command.is(kindOrCommandOrEdit)) {
            result.command = kindOrCommandOrEdit;
          } else {
            result.edit = kindOrCommandOrEdit;
          }
          if (checkKind && kind !== void 0) {
            result.kind = kind;
          }
          return result;
        }
        CodeAction2.create = create;
        function is(value) {
          var candidate = value;
          return candidate && Is.string(candidate.title) && (candidate.diagnostics === void 0 || Is.typedArray(candidate.diagnostics, Diagnostic.is)) && (candidate.kind === void 0 || Is.string(candidate.kind)) && (candidate.edit !== void 0 || candidate.command !== void 0) && (candidate.command === void 0 || Command.is(candidate.command)) && (candidate.isPreferred === void 0 || Is.boolean(candidate.isPreferred)) && (candidate.edit === void 0 || WorkspaceEdit2.is(candidate.edit));
        }
        CodeAction2.is = is;
      })(CodeAction || (exports3.CodeAction = CodeAction = {}));
      var CodeLens2;
      (function(CodeLens3) {
        function create(range, data) {
          var result = { range };
          if (Is.defined(data)) {
            result.data = data;
          }
          return result;
        }
        CodeLens3.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Range5.is(candidate.range) && (Is.undefined(candidate.command) || Command.is(candidate.command));
        }
        CodeLens3.is = is;
      })(CodeLens2 || (exports3.CodeLens = CodeLens2 = {}));
      var FormattingOptions;
      (function(FormattingOptions2) {
        function create(tabSize, insertSpaces) {
          return { tabSize, insertSpaces };
        }
        FormattingOptions2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.uinteger(candidate.tabSize) && Is.boolean(candidate.insertSpaces);
        }
        FormattingOptions2.is = is;
      })(FormattingOptions || (exports3.FormattingOptions = FormattingOptions = {}));
      var DocumentLink;
      (function(DocumentLink2) {
        function create(range, target, data) {
          return { range, target, data };
        }
        DocumentLink2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Range5.is(candidate.range) && (Is.undefined(candidate.target) || Is.string(candidate.target));
        }
        DocumentLink2.is = is;
      })(DocumentLink || (exports3.DocumentLink = DocumentLink = {}));
      var SelectionRange;
      (function(SelectionRange2) {
        function create(range, parent) {
          return { range, parent };
        }
        SelectionRange2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Range5.is(candidate.range) && (candidate.parent === void 0 || SelectionRange2.is(candidate.parent));
        }
        SelectionRange2.is = is;
      })(SelectionRange || (exports3.SelectionRange = SelectionRange = {}));
      var SemanticTokenTypes;
      (function(SemanticTokenTypes2) {
        SemanticTokenTypes2["namespace"] = "namespace";
        SemanticTokenTypes2["type"] = "type";
        SemanticTokenTypes2["class"] = "class";
        SemanticTokenTypes2["enum"] = "enum";
        SemanticTokenTypes2["interface"] = "interface";
        SemanticTokenTypes2["struct"] = "struct";
        SemanticTokenTypes2["typeParameter"] = "typeParameter";
        SemanticTokenTypes2["parameter"] = "parameter";
        SemanticTokenTypes2["variable"] = "variable";
        SemanticTokenTypes2["property"] = "property";
        SemanticTokenTypes2["enumMember"] = "enumMember";
        SemanticTokenTypes2["event"] = "event";
        SemanticTokenTypes2["function"] = "function";
        SemanticTokenTypes2["method"] = "method";
        SemanticTokenTypes2["macro"] = "macro";
        SemanticTokenTypes2["keyword"] = "keyword";
        SemanticTokenTypes2["modifier"] = "modifier";
        SemanticTokenTypes2["comment"] = "comment";
        SemanticTokenTypes2["string"] = "string";
        SemanticTokenTypes2["number"] = "number";
        SemanticTokenTypes2["regexp"] = "regexp";
        SemanticTokenTypes2["operator"] = "operator";
        SemanticTokenTypes2["decorator"] = "decorator";
      })(SemanticTokenTypes || (exports3.SemanticTokenTypes = SemanticTokenTypes = {}));
      var SemanticTokenModifiers;
      (function(SemanticTokenModifiers2) {
        SemanticTokenModifiers2["declaration"] = "declaration";
        SemanticTokenModifiers2["definition"] = "definition";
        SemanticTokenModifiers2["readonly"] = "readonly";
        SemanticTokenModifiers2["static"] = "static";
        SemanticTokenModifiers2["deprecated"] = "deprecated";
        SemanticTokenModifiers2["abstract"] = "abstract";
        SemanticTokenModifiers2["async"] = "async";
        SemanticTokenModifiers2["modification"] = "modification";
        SemanticTokenModifiers2["documentation"] = "documentation";
        SemanticTokenModifiers2["defaultLibrary"] = "defaultLibrary";
      })(SemanticTokenModifiers || (exports3.SemanticTokenModifiers = SemanticTokenModifiers = {}));
      var SemanticTokens;
      (function(SemanticTokens2) {
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && (candidate.resultId === void 0 || typeof candidate.resultId === "string") && Array.isArray(candidate.data) && (candidate.data.length === 0 || typeof candidate.data[0] === "number");
        }
        SemanticTokens2.is = is;
      })(SemanticTokens || (exports3.SemanticTokens = SemanticTokens = {}));
      var InlineValueText;
      (function(InlineValueText2) {
        function create(range, text) {
          return { range, text };
        }
        InlineValueText2.create = create;
        function is(value) {
          var candidate = value;
          return candidate !== void 0 && candidate !== null && Range5.is(candidate.range) && Is.string(candidate.text);
        }
        InlineValueText2.is = is;
      })(InlineValueText || (exports3.InlineValueText = InlineValueText = {}));
      var InlineValueVariableLookup;
      (function(InlineValueVariableLookup2) {
        function create(range, variableName, caseSensitiveLookup) {
          return { range, variableName, caseSensitiveLookup };
        }
        InlineValueVariableLookup2.create = create;
        function is(value) {
          var candidate = value;
          return candidate !== void 0 && candidate !== null && Range5.is(candidate.range) && Is.boolean(candidate.caseSensitiveLookup) && (Is.string(candidate.variableName) || candidate.variableName === void 0);
        }
        InlineValueVariableLookup2.is = is;
      })(InlineValueVariableLookup || (exports3.InlineValueVariableLookup = InlineValueVariableLookup = {}));
      var InlineValueEvaluatableExpression;
      (function(InlineValueEvaluatableExpression2) {
        function create(range, expression) {
          return { range, expression };
        }
        InlineValueEvaluatableExpression2.create = create;
        function is(value) {
          var candidate = value;
          return candidate !== void 0 && candidate !== null && Range5.is(candidate.range) && (Is.string(candidate.expression) || candidate.expression === void 0);
        }
        InlineValueEvaluatableExpression2.is = is;
      })(InlineValueEvaluatableExpression || (exports3.InlineValueEvaluatableExpression = InlineValueEvaluatableExpression = {}));
      var InlineValueContext;
      (function(InlineValueContext2) {
        function create(frameId, stoppedLocation) {
          return { frameId, stoppedLocation };
        }
        InlineValueContext2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Range5.is(value.stoppedLocation);
        }
        InlineValueContext2.is = is;
      })(InlineValueContext || (exports3.InlineValueContext = InlineValueContext = {}));
      var InlayHintKind;
      (function(InlayHintKind2) {
        InlayHintKind2.Type = 1;
        InlayHintKind2.Parameter = 2;
        function is(value) {
          return value === 1 || value === 2;
        }
        InlayHintKind2.is = is;
      })(InlayHintKind || (exports3.InlayHintKind = InlayHintKind = {}));
      var InlayHintLabelPart;
      (function(InlayHintLabelPart2) {
        function create(value) {
          return { value };
        }
        InlayHintLabelPart2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && (candidate.tooltip === void 0 || Is.string(candidate.tooltip) || MarkupContent.is(candidate.tooltip)) && (candidate.location === void 0 || Location.is(candidate.location)) && (candidate.command === void 0 || Command.is(candidate.command));
        }
        InlayHintLabelPart2.is = is;
      })(InlayHintLabelPart || (exports3.InlayHintLabelPart = InlayHintLabelPart = {}));
      var InlayHint;
      (function(InlayHint2) {
        function create(position, label, kind) {
          var result = { position, label };
          if (kind !== void 0) {
            result.kind = kind;
          }
          return result;
        }
        InlayHint2.create = create;
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && Position2.is(candidate.position) && (Is.string(candidate.label) || Is.typedArray(candidate.label, InlayHintLabelPart.is)) && (candidate.kind === void 0 || InlayHintKind.is(candidate.kind)) && candidate.textEdits === void 0 || Is.typedArray(candidate.textEdits, TextEdit.is) && (candidate.tooltip === void 0 || Is.string(candidate.tooltip) || MarkupContent.is(candidate.tooltip)) && (candidate.paddingLeft === void 0 || Is.boolean(candidate.paddingLeft)) && (candidate.paddingRight === void 0 || Is.boolean(candidate.paddingRight));
        }
        InlayHint2.is = is;
      })(InlayHint || (exports3.InlayHint = InlayHint = {}));
      var StringValue;
      (function(StringValue2) {
        function createSnippet(value) {
          return { kind: "snippet", value };
        }
        StringValue2.createSnippet = createSnippet;
      })(StringValue || (exports3.StringValue = StringValue = {}));
      var InlineCompletionItem;
      (function(InlineCompletionItem2) {
        function create(insertText, filterText, range, command) {
          return { insertText, filterText, range, command };
        }
        InlineCompletionItem2.create = create;
      })(InlineCompletionItem || (exports3.InlineCompletionItem = InlineCompletionItem = {}));
      var InlineCompletionList;
      (function(InlineCompletionList2) {
        function create(items) {
          return { items };
        }
        InlineCompletionList2.create = create;
      })(InlineCompletionList || (exports3.InlineCompletionList = InlineCompletionList = {}));
      var InlineCompletionTriggerKind;
      (function(InlineCompletionTriggerKind2) {
        InlineCompletionTriggerKind2.Invoked = 0;
        InlineCompletionTriggerKind2.Automatic = 1;
      })(InlineCompletionTriggerKind || (exports3.InlineCompletionTriggerKind = InlineCompletionTriggerKind = {}));
      var SelectedCompletionInfo;
      (function(SelectedCompletionInfo2) {
        function create(range, text) {
          return { range, text };
        }
        SelectedCompletionInfo2.create = create;
      })(SelectedCompletionInfo || (exports3.SelectedCompletionInfo = SelectedCompletionInfo = {}));
      var InlineCompletionContext;
      (function(InlineCompletionContext2) {
        function create(triggerKind, selectedCompletionInfo) {
          return { triggerKind, selectedCompletionInfo };
        }
        InlineCompletionContext2.create = create;
      })(InlineCompletionContext || (exports3.InlineCompletionContext = InlineCompletionContext = {}));
      var WorkspaceFolder;
      (function(WorkspaceFolder2) {
        function is(value) {
          var candidate = value;
          return Is.objectLiteral(candidate) && URI.is(candidate.uri) && Is.string(candidate.name);
        }
        WorkspaceFolder2.is = is;
      })(WorkspaceFolder || (exports3.WorkspaceFolder = WorkspaceFolder = {}));
      exports3.EOL = ["\n", "\r\n", "\r"];
      var TextDocument;
      (function(TextDocument2) {
        function create(uri, languageId, version, content) {
          return new FullTextDocument(uri, languageId, version, content);
        }
        TextDocument2.create = create;
        function is(value) {
          var candidate = value;
          return Is.defined(candidate) && Is.string(candidate.uri) && (Is.undefined(candidate.languageId) || Is.string(candidate.languageId)) && Is.uinteger(candidate.lineCount) && Is.func(candidate.getText) && Is.func(candidate.positionAt) && Is.func(candidate.offsetAt) ? true : false;
        }
        TextDocument2.is = is;
        function applyEdits(document, edits) {
          var text = document.getText();
          var sortedEdits = mergeSort(edits, function(a, b) {
            var diff = a.range.start.line - b.range.start.line;
            if (diff === 0) {
              return a.range.start.character - b.range.start.character;
            }
            return diff;
          });
          var lastModifiedOffset = text.length;
          for (var i = sortedEdits.length - 1; i >= 0; i--) {
            var e = sortedEdits[i];
            var startOffset = document.offsetAt(e.range.start);
            var endOffset = document.offsetAt(e.range.end);
            if (endOffset <= lastModifiedOffset) {
              text = text.substring(0, startOffset) + e.newText + text.substring(endOffset, text.length);
            } else {
              throw new Error("Overlapping edit");
            }
            lastModifiedOffset = startOffset;
          }
          return text;
        }
        TextDocument2.applyEdits = applyEdits;
        function mergeSort(data, compare) {
          if (data.length <= 1) {
            return data;
          }
          var p = data.length / 2 | 0;
          var left = data.slice(0, p);
          var right = data.slice(p);
          mergeSort(left, compare);
          mergeSort(right, compare);
          var leftIdx = 0;
          var rightIdx = 0;
          var i = 0;
          while (leftIdx < left.length && rightIdx < right.length) {
            var ret = compare(left[leftIdx], right[rightIdx]);
            if (ret <= 0) {
              data[i++] = left[leftIdx++];
            } else {
              data[i++] = right[rightIdx++];
            }
          }
          while (leftIdx < left.length) {
            data[i++] = left[leftIdx++];
          }
          while (rightIdx < right.length) {
            data[i++] = right[rightIdx++];
          }
          return data;
        }
      })(TextDocument || (exports3.TextDocument = TextDocument = {}));
      var FullTextDocument = (
        /** @class */
        (function() {
          function FullTextDocument2(uri, languageId, version, content) {
            this._uri = uri;
            this._languageId = languageId;
            this._version = version;
            this._content = content;
            this._lineOffsets = void 0;
          }
          Object.defineProperty(FullTextDocument2.prototype, "uri", {
            get: function() {
              return this._uri;
            },
            enumerable: false,
            configurable: true
          });
          Object.defineProperty(FullTextDocument2.prototype, "languageId", {
            get: function() {
              return this._languageId;
            },
            enumerable: false,
            configurable: true
          });
          Object.defineProperty(FullTextDocument2.prototype, "version", {
            get: function() {
              return this._version;
            },
            enumerable: false,
            configurable: true
          });
          FullTextDocument2.prototype.getText = function(range) {
            if (range) {
              var start = this.offsetAt(range.start);
              var end = this.offsetAt(range.end);
              return this._content.substring(start, end);
            }
            return this._content;
          };
          FullTextDocument2.prototype.update = function(event, version) {
            this._content = event.text;
            this._version = version;
            this._lineOffsets = void 0;
          };
          FullTextDocument2.prototype.getLineOffsets = function() {
            if (this._lineOffsets === void 0) {
              var lineOffsets = [];
              var text = this._content;
              var isLineStart = true;
              for (var i = 0; i < text.length; i++) {
                if (isLineStart) {
                  lineOffsets.push(i);
                  isLineStart = false;
                }
                var ch = text.charAt(i);
                isLineStart = ch === "\r" || ch === "\n";
                if (ch === "\r" && i + 1 < text.length && text.charAt(i + 1) === "\n") {
                  i++;
                }
              }
              if (isLineStart && text.length > 0) {
                lineOffsets.push(text.length);
              }
              this._lineOffsets = lineOffsets;
            }
            return this._lineOffsets;
          };
          FullTextDocument2.prototype.positionAt = function(offset) {
            offset = Math.max(Math.min(offset, this._content.length), 0);
            var lineOffsets = this.getLineOffsets();
            var low = 0, high = lineOffsets.length;
            if (high === 0) {
              return Position2.create(0, offset);
            }
            while (low < high) {
              var mid = Math.floor((low + high) / 2);
              if (lineOffsets[mid] > offset) {
                high = mid;
              } else {
                low = mid + 1;
              }
            }
            var line = low - 1;
            return Position2.create(line, offset - lineOffsets[line]);
          };
          FullTextDocument2.prototype.offsetAt = function(position) {
            var lineOffsets = this.getLineOffsets();
            if (position.line >= lineOffsets.length) {
              return this._content.length;
            } else if (position.line < 0) {
              return 0;
            }
            var lineOffset = lineOffsets[position.line];
            var nextLineOffset = position.line + 1 < lineOffsets.length ? lineOffsets[position.line + 1] : this._content.length;
            return Math.max(Math.min(lineOffset + position.character, nextLineOffset), lineOffset);
          };
          Object.defineProperty(FullTextDocument2.prototype, "lineCount", {
            get: function() {
              return this.getLineOffsets().length;
            },
            enumerable: false,
            configurable: true
          });
          return FullTextDocument2;
        })()
      );
      var Is;
      (function(Is2) {
        var toString = Object.prototype.toString;
        function defined(value) {
          return typeof value !== "undefined";
        }
        Is2.defined = defined;
        function undefined2(value) {
          return typeof value === "undefined";
        }
        Is2.undefined = undefined2;
        function boolean(value) {
          return value === true || value === false;
        }
        Is2.boolean = boolean;
        function string(value) {
          return toString.call(value) === "[object String]";
        }
        Is2.string = string;
        function number(value) {
          return toString.call(value) === "[object Number]";
        }
        Is2.number = number;
        function numberRange(value, min, max) {
          return toString.call(value) === "[object Number]" && min <= value && value <= max;
        }
        Is2.numberRange = numberRange;
        function integer2(value) {
          return toString.call(value) === "[object Number]" && -2147483648 <= value && value <= 2147483647;
        }
        Is2.integer = integer2;
        function uinteger2(value) {
          return toString.call(value) === "[object Number]" && 0 <= value && value <= 2147483647;
        }
        Is2.uinteger = uinteger2;
        function func(value) {
          return toString.call(value) === "[object Function]";
        }
        Is2.func = func;
        function objectLiteral(value) {
          return value !== null && typeof value === "object";
        }
        Is2.objectLiteral = objectLiteral;
        function typedArray(value, check) {
          return Array.isArray(value) && value.every(check);
        }
        Is2.typedArray = typedArray;
      })(Is || (Is = {}));
    });
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/messages.js
var require_messages2 = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/messages.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ProtocolNotificationType = exports2.ProtocolNotificationType0 = exports2.ProtocolRequestType = exports2.ProtocolRequestType0 = exports2.RegistrationType = exports2.MessageDirection = void 0;
    var vscode_jsonrpc_1 = require_main();
    var MessageDirection;
    (function(MessageDirection2) {
      MessageDirection2["clientToServer"] = "clientToServer";
      MessageDirection2["serverToClient"] = "serverToClient";
      MessageDirection2["both"] = "both";
    })(MessageDirection || (exports2.MessageDirection = MessageDirection = {}));
    var RegistrationType = class {
      constructor(method) {
        this.method = method;
      }
    };
    exports2.RegistrationType = RegistrationType;
    var ProtocolRequestType0 = class extends vscode_jsonrpc_1.RequestType0 {
      constructor(method) {
        super(method);
      }
    };
    exports2.ProtocolRequestType0 = ProtocolRequestType0;
    var ProtocolRequestType = class extends vscode_jsonrpc_1.RequestType {
      constructor(method) {
        super(method, vscode_jsonrpc_1.ParameterStructures.byName);
      }
    };
    exports2.ProtocolRequestType = ProtocolRequestType;
    var ProtocolNotificationType0 = class extends vscode_jsonrpc_1.NotificationType0 {
      constructor(method) {
        super(method);
      }
    };
    exports2.ProtocolNotificationType0 = ProtocolNotificationType0;
    var ProtocolNotificationType = class extends vscode_jsonrpc_1.NotificationType {
      constructor(method) {
        super(method, vscode_jsonrpc_1.ParameterStructures.byName);
      }
    };
    exports2.ProtocolNotificationType = ProtocolNotificationType;
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/utils/is.js
var require_is3 = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/utils/is.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.objectLiteral = exports2.typedArray = exports2.stringArray = exports2.array = exports2.func = exports2.error = exports2.number = exports2.string = exports2.boolean = void 0;
    function boolean(value) {
      return value === true || value === false;
    }
    exports2.boolean = boolean;
    function string(value) {
      return typeof value === "string" || value instanceof String;
    }
    exports2.string = string;
    function number(value) {
      return typeof value === "number" || value instanceof Number;
    }
    exports2.number = number;
    function error(value) {
      return value instanceof Error;
    }
    exports2.error = error;
    function func(value) {
      return typeof value === "function";
    }
    exports2.func = func;
    function array(value) {
      return Array.isArray(value);
    }
    exports2.array = array;
    function stringArray(value) {
      return array(value) && value.every((elem) => string(elem));
    }
    exports2.stringArray = stringArray;
    function typedArray(value, check) {
      return Array.isArray(value) && value.every(check);
    }
    exports2.typedArray = typedArray;
    function objectLiteral(value) {
      return value !== null && typeof value === "object";
    }
    exports2.objectLiteral = objectLiteral;
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.implementation.js
var require_protocol_implementation = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.implementation.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ImplementationRequest = void 0;
    var messages_1 = require_messages2();
    var ImplementationRequest;
    (function(ImplementationRequest2) {
      ImplementationRequest2.method = "textDocument/implementation";
      ImplementationRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      ImplementationRequest2.type = new messages_1.ProtocolRequestType(ImplementationRequest2.method);
    })(ImplementationRequest || (exports2.ImplementationRequest = ImplementationRequest = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.typeDefinition.js
var require_protocol_typeDefinition = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.typeDefinition.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TypeDefinitionRequest = void 0;
    var messages_1 = require_messages2();
    var TypeDefinitionRequest;
    (function(TypeDefinitionRequest2) {
      TypeDefinitionRequest2.method = "textDocument/typeDefinition";
      TypeDefinitionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      TypeDefinitionRequest2.type = new messages_1.ProtocolRequestType(TypeDefinitionRequest2.method);
    })(TypeDefinitionRequest || (exports2.TypeDefinitionRequest = TypeDefinitionRequest = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.workspaceFolder.js
var require_protocol_workspaceFolder = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.workspaceFolder.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DidChangeWorkspaceFoldersNotification = exports2.WorkspaceFoldersRequest = void 0;
    var messages_1 = require_messages2();
    var WorkspaceFoldersRequest;
    (function(WorkspaceFoldersRequest2) {
      WorkspaceFoldersRequest2.method = "workspace/workspaceFolders";
      WorkspaceFoldersRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      WorkspaceFoldersRequest2.type = new messages_1.ProtocolRequestType0(WorkspaceFoldersRequest2.method);
    })(WorkspaceFoldersRequest || (exports2.WorkspaceFoldersRequest = WorkspaceFoldersRequest = {}));
    var DidChangeWorkspaceFoldersNotification;
    (function(DidChangeWorkspaceFoldersNotification2) {
      DidChangeWorkspaceFoldersNotification2.method = "workspace/didChangeWorkspaceFolders";
      DidChangeWorkspaceFoldersNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidChangeWorkspaceFoldersNotification2.type = new messages_1.ProtocolNotificationType(DidChangeWorkspaceFoldersNotification2.method);
    })(DidChangeWorkspaceFoldersNotification || (exports2.DidChangeWorkspaceFoldersNotification = DidChangeWorkspaceFoldersNotification = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.configuration.js
var require_protocol_configuration = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.configuration.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ConfigurationRequest = void 0;
    var messages_1 = require_messages2();
    var ConfigurationRequest;
    (function(ConfigurationRequest2) {
      ConfigurationRequest2.method = "workspace/configuration";
      ConfigurationRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      ConfigurationRequest2.type = new messages_1.ProtocolRequestType(ConfigurationRequest2.method);
    })(ConfigurationRequest || (exports2.ConfigurationRequest = ConfigurationRequest = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.colorProvider.js
var require_protocol_colorProvider = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.colorProvider.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ColorPresentationRequest = exports2.DocumentColorRequest = void 0;
    var messages_1 = require_messages2();
    var DocumentColorRequest;
    (function(DocumentColorRequest2) {
      DocumentColorRequest2.method = "textDocument/documentColor";
      DocumentColorRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentColorRequest2.type = new messages_1.ProtocolRequestType(DocumentColorRequest2.method);
    })(DocumentColorRequest || (exports2.DocumentColorRequest = DocumentColorRequest = {}));
    var ColorPresentationRequest;
    (function(ColorPresentationRequest2) {
      ColorPresentationRequest2.method = "textDocument/colorPresentation";
      ColorPresentationRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      ColorPresentationRequest2.type = new messages_1.ProtocolRequestType(ColorPresentationRequest2.method);
    })(ColorPresentationRequest || (exports2.ColorPresentationRequest = ColorPresentationRequest = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.foldingRange.js
var require_protocol_foldingRange = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.foldingRange.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.FoldingRangeRefreshRequest = exports2.FoldingRangeRequest = void 0;
    var messages_1 = require_messages2();
    var FoldingRangeRequest;
    (function(FoldingRangeRequest2) {
      FoldingRangeRequest2.method = "textDocument/foldingRange";
      FoldingRangeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      FoldingRangeRequest2.type = new messages_1.ProtocolRequestType(FoldingRangeRequest2.method);
    })(FoldingRangeRequest || (exports2.FoldingRangeRequest = FoldingRangeRequest = {}));
    var FoldingRangeRefreshRequest;
    (function(FoldingRangeRefreshRequest2) {
      FoldingRangeRefreshRequest2.method = `workspace/foldingRange/refresh`;
      FoldingRangeRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      FoldingRangeRefreshRequest2.type = new messages_1.ProtocolRequestType0(FoldingRangeRefreshRequest2.method);
    })(FoldingRangeRefreshRequest || (exports2.FoldingRangeRefreshRequest = FoldingRangeRefreshRequest = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.declaration.js
var require_protocol_declaration = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.declaration.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DeclarationRequest = void 0;
    var messages_1 = require_messages2();
    var DeclarationRequest;
    (function(DeclarationRequest2) {
      DeclarationRequest2.method = "textDocument/declaration";
      DeclarationRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DeclarationRequest2.type = new messages_1.ProtocolRequestType(DeclarationRequest2.method);
    })(DeclarationRequest || (exports2.DeclarationRequest = DeclarationRequest = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.selectionRange.js
var require_protocol_selectionRange = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.selectionRange.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SelectionRangeRequest = void 0;
    var messages_1 = require_messages2();
    var SelectionRangeRequest;
    (function(SelectionRangeRequest2) {
      SelectionRangeRequest2.method = "textDocument/selectionRange";
      SelectionRangeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      SelectionRangeRequest2.type = new messages_1.ProtocolRequestType(SelectionRangeRequest2.method);
    })(SelectionRangeRequest || (exports2.SelectionRangeRequest = SelectionRangeRequest = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.progress.js
var require_protocol_progress = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.progress.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WorkDoneProgressCancelNotification = exports2.WorkDoneProgressCreateRequest = exports2.WorkDoneProgress = void 0;
    var vscode_jsonrpc_1 = require_main();
    var messages_1 = require_messages2();
    var WorkDoneProgress;
    (function(WorkDoneProgress2) {
      WorkDoneProgress2.type = new vscode_jsonrpc_1.ProgressType();
      function is(value) {
        return value === WorkDoneProgress2.type;
      }
      WorkDoneProgress2.is = is;
    })(WorkDoneProgress || (exports2.WorkDoneProgress = WorkDoneProgress = {}));
    var WorkDoneProgressCreateRequest;
    (function(WorkDoneProgressCreateRequest2) {
      WorkDoneProgressCreateRequest2.method = "window/workDoneProgress/create";
      WorkDoneProgressCreateRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      WorkDoneProgressCreateRequest2.type = new messages_1.ProtocolRequestType(WorkDoneProgressCreateRequest2.method);
    })(WorkDoneProgressCreateRequest || (exports2.WorkDoneProgressCreateRequest = WorkDoneProgressCreateRequest = {}));
    var WorkDoneProgressCancelNotification;
    (function(WorkDoneProgressCancelNotification2) {
      WorkDoneProgressCancelNotification2.method = "window/workDoneProgress/cancel";
      WorkDoneProgressCancelNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      WorkDoneProgressCancelNotification2.type = new messages_1.ProtocolNotificationType(WorkDoneProgressCancelNotification2.method);
    })(WorkDoneProgressCancelNotification || (exports2.WorkDoneProgressCancelNotification = WorkDoneProgressCancelNotification = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.callHierarchy.js
var require_protocol_callHierarchy = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.callHierarchy.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CallHierarchyOutgoingCallsRequest = exports2.CallHierarchyIncomingCallsRequest = exports2.CallHierarchyPrepareRequest = void 0;
    var messages_1 = require_messages2();
    var CallHierarchyPrepareRequest;
    (function(CallHierarchyPrepareRequest2) {
      CallHierarchyPrepareRequest2.method = "textDocument/prepareCallHierarchy";
      CallHierarchyPrepareRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CallHierarchyPrepareRequest2.type = new messages_1.ProtocolRequestType(CallHierarchyPrepareRequest2.method);
    })(CallHierarchyPrepareRequest || (exports2.CallHierarchyPrepareRequest = CallHierarchyPrepareRequest = {}));
    var CallHierarchyIncomingCallsRequest;
    (function(CallHierarchyIncomingCallsRequest2) {
      CallHierarchyIncomingCallsRequest2.method = "callHierarchy/incomingCalls";
      CallHierarchyIncomingCallsRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CallHierarchyIncomingCallsRequest2.type = new messages_1.ProtocolRequestType(CallHierarchyIncomingCallsRequest2.method);
    })(CallHierarchyIncomingCallsRequest || (exports2.CallHierarchyIncomingCallsRequest = CallHierarchyIncomingCallsRequest = {}));
    var CallHierarchyOutgoingCallsRequest;
    (function(CallHierarchyOutgoingCallsRequest2) {
      CallHierarchyOutgoingCallsRequest2.method = "callHierarchy/outgoingCalls";
      CallHierarchyOutgoingCallsRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CallHierarchyOutgoingCallsRequest2.type = new messages_1.ProtocolRequestType(CallHierarchyOutgoingCallsRequest2.method);
    })(CallHierarchyOutgoingCallsRequest || (exports2.CallHierarchyOutgoingCallsRequest = CallHierarchyOutgoingCallsRequest = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.semanticTokens.js
var require_protocol_semanticTokens = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.semanticTokens.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SemanticTokensRefreshRequest = exports2.SemanticTokensRangeRequest = exports2.SemanticTokensDeltaRequest = exports2.SemanticTokensRequest = exports2.SemanticTokensRegistrationType = exports2.TokenFormat = void 0;
    var messages_1 = require_messages2();
    var TokenFormat;
    (function(TokenFormat2) {
      TokenFormat2.Relative = "relative";
    })(TokenFormat || (exports2.TokenFormat = TokenFormat = {}));
    var SemanticTokensRegistrationType;
    (function(SemanticTokensRegistrationType2) {
      SemanticTokensRegistrationType2.method = "textDocument/semanticTokens";
      SemanticTokensRegistrationType2.type = new messages_1.RegistrationType(SemanticTokensRegistrationType2.method);
    })(SemanticTokensRegistrationType || (exports2.SemanticTokensRegistrationType = SemanticTokensRegistrationType = {}));
    var SemanticTokensRequest;
    (function(SemanticTokensRequest2) {
      SemanticTokensRequest2.method = "textDocument/semanticTokens/full";
      SemanticTokensRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      SemanticTokensRequest2.type = new messages_1.ProtocolRequestType(SemanticTokensRequest2.method);
      SemanticTokensRequest2.registrationMethod = SemanticTokensRegistrationType.method;
    })(SemanticTokensRequest || (exports2.SemanticTokensRequest = SemanticTokensRequest = {}));
    var SemanticTokensDeltaRequest;
    (function(SemanticTokensDeltaRequest2) {
      SemanticTokensDeltaRequest2.method = "textDocument/semanticTokens/full/delta";
      SemanticTokensDeltaRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      SemanticTokensDeltaRequest2.type = new messages_1.ProtocolRequestType(SemanticTokensDeltaRequest2.method);
      SemanticTokensDeltaRequest2.registrationMethod = SemanticTokensRegistrationType.method;
    })(SemanticTokensDeltaRequest || (exports2.SemanticTokensDeltaRequest = SemanticTokensDeltaRequest = {}));
    var SemanticTokensRangeRequest;
    (function(SemanticTokensRangeRequest2) {
      SemanticTokensRangeRequest2.method = "textDocument/semanticTokens/range";
      SemanticTokensRangeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      SemanticTokensRangeRequest2.type = new messages_1.ProtocolRequestType(SemanticTokensRangeRequest2.method);
      SemanticTokensRangeRequest2.registrationMethod = SemanticTokensRegistrationType.method;
    })(SemanticTokensRangeRequest || (exports2.SemanticTokensRangeRequest = SemanticTokensRangeRequest = {}));
    var SemanticTokensRefreshRequest;
    (function(SemanticTokensRefreshRequest2) {
      SemanticTokensRefreshRequest2.method = `workspace/semanticTokens/refresh`;
      SemanticTokensRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      SemanticTokensRefreshRequest2.type = new messages_1.ProtocolRequestType0(SemanticTokensRefreshRequest2.method);
    })(SemanticTokensRefreshRequest || (exports2.SemanticTokensRefreshRequest = SemanticTokensRefreshRequest = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.showDocument.js
var require_protocol_showDocument = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.showDocument.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ShowDocumentRequest = void 0;
    var messages_1 = require_messages2();
    var ShowDocumentRequest;
    (function(ShowDocumentRequest2) {
      ShowDocumentRequest2.method = "window/showDocument";
      ShowDocumentRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      ShowDocumentRequest2.type = new messages_1.ProtocolRequestType(ShowDocumentRequest2.method);
    })(ShowDocumentRequest || (exports2.ShowDocumentRequest = ShowDocumentRequest = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.linkedEditingRange.js
var require_protocol_linkedEditingRange = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.linkedEditingRange.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LinkedEditingRangeRequest = void 0;
    var messages_1 = require_messages2();
    var LinkedEditingRangeRequest;
    (function(LinkedEditingRangeRequest2) {
      LinkedEditingRangeRequest2.method = "textDocument/linkedEditingRange";
      LinkedEditingRangeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      LinkedEditingRangeRequest2.type = new messages_1.ProtocolRequestType(LinkedEditingRangeRequest2.method);
    })(LinkedEditingRangeRequest || (exports2.LinkedEditingRangeRequest = LinkedEditingRangeRequest = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.fileOperations.js
var require_protocol_fileOperations = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.fileOperations.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WillDeleteFilesRequest = exports2.DidDeleteFilesNotification = exports2.DidRenameFilesNotification = exports2.WillRenameFilesRequest = exports2.DidCreateFilesNotification = exports2.WillCreateFilesRequest = exports2.FileOperationPatternKind = void 0;
    var messages_1 = require_messages2();
    var FileOperationPatternKind;
    (function(FileOperationPatternKind2) {
      FileOperationPatternKind2.file = "file";
      FileOperationPatternKind2.folder = "folder";
    })(FileOperationPatternKind || (exports2.FileOperationPatternKind = FileOperationPatternKind = {}));
    var WillCreateFilesRequest;
    (function(WillCreateFilesRequest2) {
      WillCreateFilesRequest2.method = "workspace/willCreateFiles";
      WillCreateFilesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WillCreateFilesRequest2.type = new messages_1.ProtocolRequestType(WillCreateFilesRequest2.method);
    })(WillCreateFilesRequest || (exports2.WillCreateFilesRequest = WillCreateFilesRequest = {}));
    var DidCreateFilesNotification;
    (function(DidCreateFilesNotification2) {
      DidCreateFilesNotification2.method = "workspace/didCreateFiles";
      DidCreateFilesNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidCreateFilesNotification2.type = new messages_1.ProtocolNotificationType(DidCreateFilesNotification2.method);
    })(DidCreateFilesNotification || (exports2.DidCreateFilesNotification = DidCreateFilesNotification = {}));
    var WillRenameFilesRequest;
    (function(WillRenameFilesRequest2) {
      WillRenameFilesRequest2.method = "workspace/willRenameFiles";
      WillRenameFilesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WillRenameFilesRequest2.type = new messages_1.ProtocolRequestType(WillRenameFilesRequest2.method);
    })(WillRenameFilesRequest || (exports2.WillRenameFilesRequest = WillRenameFilesRequest = {}));
    var DidRenameFilesNotification;
    (function(DidRenameFilesNotification2) {
      DidRenameFilesNotification2.method = "workspace/didRenameFiles";
      DidRenameFilesNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidRenameFilesNotification2.type = new messages_1.ProtocolNotificationType(DidRenameFilesNotification2.method);
    })(DidRenameFilesNotification || (exports2.DidRenameFilesNotification = DidRenameFilesNotification = {}));
    var DidDeleteFilesNotification;
    (function(DidDeleteFilesNotification2) {
      DidDeleteFilesNotification2.method = "workspace/didDeleteFiles";
      DidDeleteFilesNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidDeleteFilesNotification2.type = new messages_1.ProtocolNotificationType(DidDeleteFilesNotification2.method);
    })(DidDeleteFilesNotification || (exports2.DidDeleteFilesNotification = DidDeleteFilesNotification = {}));
    var WillDeleteFilesRequest;
    (function(WillDeleteFilesRequest2) {
      WillDeleteFilesRequest2.method = "workspace/willDeleteFiles";
      WillDeleteFilesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WillDeleteFilesRequest2.type = new messages_1.ProtocolRequestType(WillDeleteFilesRequest2.method);
    })(WillDeleteFilesRequest || (exports2.WillDeleteFilesRequest = WillDeleteFilesRequest = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.moniker.js
var require_protocol_moniker = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.moniker.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.MonikerRequest = exports2.MonikerKind = exports2.UniquenessLevel = void 0;
    var messages_1 = require_messages2();
    var UniquenessLevel;
    (function(UniquenessLevel2) {
      UniquenessLevel2.document = "document";
      UniquenessLevel2.project = "project";
      UniquenessLevel2.group = "group";
      UniquenessLevel2.scheme = "scheme";
      UniquenessLevel2.global = "global";
    })(UniquenessLevel || (exports2.UniquenessLevel = UniquenessLevel = {}));
    var MonikerKind;
    (function(MonikerKind2) {
      MonikerKind2.$import = "import";
      MonikerKind2.$export = "export";
      MonikerKind2.local = "local";
    })(MonikerKind || (exports2.MonikerKind = MonikerKind = {}));
    var MonikerRequest;
    (function(MonikerRequest2) {
      MonikerRequest2.method = "textDocument/moniker";
      MonikerRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      MonikerRequest2.type = new messages_1.ProtocolRequestType(MonikerRequest2.method);
    })(MonikerRequest || (exports2.MonikerRequest = MonikerRequest = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.typeHierarchy.js
var require_protocol_typeHierarchy = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.typeHierarchy.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TypeHierarchySubtypesRequest = exports2.TypeHierarchySupertypesRequest = exports2.TypeHierarchyPrepareRequest = void 0;
    var messages_1 = require_messages2();
    var TypeHierarchyPrepareRequest;
    (function(TypeHierarchyPrepareRequest2) {
      TypeHierarchyPrepareRequest2.method = "textDocument/prepareTypeHierarchy";
      TypeHierarchyPrepareRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      TypeHierarchyPrepareRequest2.type = new messages_1.ProtocolRequestType(TypeHierarchyPrepareRequest2.method);
    })(TypeHierarchyPrepareRequest || (exports2.TypeHierarchyPrepareRequest = TypeHierarchyPrepareRequest = {}));
    var TypeHierarchySupertypesRequest;
    (function(TypeHierarchySupertypesRequest2) {
      TypeHierarchySupertypesRequest2.method = "typeHierarchy/supertypes";
      TypeHierarchySupertypesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      TypeHierarchySupertypesRequest2.type = new messages_1.ProtocolRequestType(TypeHierarchySupertypesRequest2.method);
    })(TypeHierarchySupertypesRequest || (exports2.TypeHierarchySupertypesRequest = TypeHierarchySupertypesRequest = {}));
    var TypeHierarchySubtypesRequest;
    (function(TypeHierarchySubtypesRequest2) {
      TypeHierarchySubtypesRequest2.method = "typeHierarchy/subtypes";
      TypeHierarchySubtypesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      TypeHierarchySubtypesRequest2.type = new messages_1.ProtocolRequestType(TypeHierarchySubtypesRequest2.method);
    })(TypeHierarchySubtypesRequest || (exports2.TypeHierarchySubtypesRequest = TypeHierarchySubtypesRequest = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.inlineValue.js
var require_protocol_inlineValue = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.inlineValue.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InlineValueRefreshRequest = exports2.InlineValueRequest = void 0;
    var messages_1 = require_messages2();
    var InlineValueRequest;
    (function(InlineValueRequest2) {
      InlineValueRequest2.method = "textDocument/inlineValue";
      InlineValueRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      InlineValueRequest2.type = new messages_1.ProtocolRequestType(InlineValueRequest2.method);
    })(InlineValueRequest || (exports2.InlineValueRequest = InlineValueRequest = {}));
    var InlineValueRefreshRequest;
    (function(InlineValueRefreshRequest2) {
      InlineValueRefreshRequest2.method = `workspace/inlineValue/refresh`;
      InlineValueRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      InlineValueRefreshRequest2.type = new messages_1.ProtocolRequestType0(InlineValueRefreshRequest2.method);
    })(InlineValueRefreshRequest || (exports2.InlineValueRefreshRequest = InlineValueRefreshRequest = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.inlayHint.js
var require_protocol_inlayHint = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.inlayHint.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InlayHintRefreshRequest = exports2.InlayHintResolveRequest = exports2.InlayHintRequest = void 0;
    var messages_1 = require_messages2();
    var InlayHintRequest;
    (function(InlayHintRequest2) {
      InlayHintRequest2.method = "textDocument/inlayHint";
      InlayHintRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      InlayHintRequest2.type = new messages_1.ProtocolRequestType(InlayHintRequest2.method);
    })(InlayHintRequest || (exports2.InlayHintRequest = InlayHintRequest = {}));
    var InlayHintResolveRequest;
    (function(InlayHintResolveRequest2) {
      InlayHintResolveRequest2.method = "inlayHint/resolve";
      InlayHintResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      InlayHintResolveRequest2.type = new messages_1.ProtocolRequestType(InlayHintResolveRequest2.method);
    })(InlayHintResolveRequest || (exports2.InlayHintResolveRequest = InlayHintResolveRequest = {}));
    var InlayHintRefreshRequest;
    (function(InlayHintRefreshRequest2) {
      InlayHintRefreshRequest2.method = `workspace/inlayHint/refresh`;
      InlayHintRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      InlayHintRefreshRequest2.type = new messages_1.ProtocolRequestType0(InlayHintRefreshRequest2.method);
    })(InlayHintRefreshRequest || (exports2.InlayHintRefreshRequest = InlayHintRefreshRequest = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.diagnostic.js
var require_protocol_diagnostic = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.diagnostic.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DiagnosticRefreshRequest = exports2.WorkspaceDiagnosticRequest = exports2.DocumentDiagnosticRequest = exports2.DocumentDiagnosticReportKind = exports2.DiagnosticServerCancellationData = void 0;
    var vscode_jsonrpc_1 = require_main();
    var Is = require_is3();
    var messages_1 = require_messages2();
    var DiagnosticServerCancellationData;
    (function(DiagnosticServerCancellationData2) {
      function is(value) {
        const candidate = value;
        return candidate && Is.boolean(candidate.retriggerRequest);
      }
      DiagnosticServerCancellationData2.is = is;
    })(DiagnosticServerCancellationData || (exports2.DiagnosticServerCancellationData = DiagnosticServerCancellationData = {}));
    var DocumentDiagnosticReportKind;
    (function(DocumentDiagnosticReportKind2) {
      DocumentDiagnosticReportKind2.Full = "full";
      DocumentDiagnosticReportKind2.Unchanged = "unchanged";
    })(DocumentDiagnosticReportKind || (exports2.DocumentDiagnosticReportKind = DocumentDiagnosticReportKind = {}));
    var DocumentDiagnosticRequest;
    (function(DocumentDiagnosticRequest2) {
      DocumentDiagnosticRequest2.method = "textDocument/diagnostic";
      DocumentDiagnosticRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentDiagnosticRequest2.type = new messages_1.ProtocolRequestType(DocumentDiagnosticRequest2.method);
      DocumentDiagnosticRequest2.partialResult = new vscode_jsonrpc_1.ProgressType();
    })(DocumentDiagnosticRequest || (exports2.DocumentDiagnosticRequest = DocumentDiagnosticRequest = {}));
    var WorkspaceDiagnosticRequest;
    (function(WorkspaceDiagnosticRequest2) {
      WorkspaceDiagnosticRequest2.method = "workspace/diagnostic";
      WorkspaceDiagnosticRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WorkspaceDiagnosticRequest2.type = new messages_1.ProtocolRequestType(WorkspaceDiagnosticRequest2.method);
      WorkspaceDiagnosticRequest2.partialResult = new vscode_jsonrpc_1.ProgressType();
    })(WorkspaceDiagnosticRequest || (exports2.WorkspaceDiagnosticRequest = WorkspaceDiagnosticRequest = {}));
    var DiagnosticRefreshRequest;
    (function(DiagnosticRefreshRequest2) {
      DiagnosticRefreshRequest2.method = `workspace/diagnostic/refresh`;
      DiagnosticRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      DiagnosticRefreshRequest2.type = new messages_1.ProtocolRequestType0(DiagnosticRefreshRequest2.method);
    })(DiagnosticRefreshRequest || (exports2.DiagnosticRefreshRequest = DiagnosticRefreshRequest = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.notebook.js
var require_protocol_notebook = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.notebook.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DidCloseNotebookDocumentNotification = exports2.DidSaveNotebookDocumentNotification = exports2.DidChangeNotebookDocumentNotification = exports2.NotebookCellArrayChange = exports2.DidOpenNotebookDocumentNotification = exports2.NotebookDocumentSyncRegistrationType = exports2.NotebookDocument = exports2.NotebookCell = exports2.ExecutionSummary = exports2.NotebookCellKind = void 0;
    var vscode_languageserver_types_1 = require_main2();
    var Is = require_is3();
    var messages_1 = require_messages2();
    var NotebookCellKind;
    (function(NotebookCellKind2) {
      NotebookCellKind2.Markup = 1;
      NotebookCellKind2.Code = 2;
      function is(value) {
        return value === 1 || value === 2;
      }
      NotebookCellKind2.is = is;
    })(NotebookCellKind || (exports2.NotebookCellKind = NotebookCellKind = {}));
    var ExecutionSummary;
    (function(ExecutionSummary2) {
      function create(executionOrder, success) {
        const result = { executionOrder };
        if (success === true || success === false) {
          result.success = success;
        }
        return result;
      }
      ExecutionSummary2.create = create;
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && vscode_languageserver_types_1.uinteger.is(candidate.executionOrder) && (candidate.success === void 0 || Is.boolean(candidate.success));
      }
      ExecutionSummary2.is = is;
      function equals(one, other) {
        if (one === other) {
          return true;
        }
        if (one === null || one === void 0 || other === null || other === void 0) {
          return false;
        }
        return one.executionOrder === other.executionOrder && one.success === other.success;
      }
      ExecutionSummary2.equals = equals;
    })(ExecutionSummary || (exports2.ExecutionSummary = ExecutionSummary = {}));
    var NotebookCell;
    (function(NotebookCell2) {
      function create(kind, document) {
        return { kind, document };
      }
      NotebookCell2.create = create;
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && NotebookCellKind.is(candidate.kind) && vscode_languageserver_types_1.DocumentUri.is(candidate.document) && (candidate.metadata === void 0 || Is.objectLiteral(candidate.metadata));
      }
      NotebookCell2.is = is;
      function diff(one, two) {
        const result = /* @__PURE__ */ new Set();
        if (one.document !== two.document) {
          result.add("document");
        }
        if (one.kind !== two.kind) {
          result.add("kind");
        }
        if (one.executionSummary !== two.executionSummary) {
          result.add("executionSummary");
        }
        if ((one.metadata !== void 0 || two.metadata !== void 0) && !equalsMetadata(one.metadata, two.metadata)) {
          result.add("metadata");
        }
        if ((one.executionSummary !== void 0 || two.executionSummary !== void 0) && !ExecutionSummary.equals(one.executionSummary, two.executionSummary)) {
          result.add("executionSummary");
        }
        return result;
      }
      NotebookCell2.diff = diff;
      function equalsMetadata(one, other) {
        if (one === other) {
          return true;
        }
        if (one === null || one === void 0 || other === null || other === void 0) {
          return false;
        }
        if (typeof one !== typeof other) {
          return false;
        }
        if (typeof one !== "object") {
          return false;
        }
        const oneArray = Array.isArray(one);
        const otherArray = Array.isArray(other);
        if (oneArray !== otherArray) {
          return false;
        }
        if (oneArray && otherArray) {
          if (one.length !== other.length) {
            return false;
          }
          for (let i = 0; i < one.length; i++) {
            if (!equalsMetadata(one[i], other[i])) {
              return false;
            }
          }
        }
        if (Is.objectLiteral(one) && Is.objectLiteral(other)) {
          const oneKeys = Object.keys(one);
          const otherKeys = Object.keys(other);
          if (oneKeys.length !== otherKeys.length) {
            return false;
          }
          oneKeys.sort();
          otherKeys.sort();
          if (!equalsMetadata(oneKeys, otherKeys)) {
            return false;
          }
          for (let i = 0; i < oneKeys.length; i++) {
            const prop = oneKeys[i];
            if (!equalsMetadata(one[prop], other[prop])) {
              return false;
            }
          }
        }
        return true;
      }
    })(NotebookCell || (exports2.NotebookCell = NotebookCell = {}));
    var NotebookDocument;
    (function(NotebookDocument2) {
      function create(uri, notebookType, version, cells) {
        return { uri, notebookType, version, cells };
      }
      NotebookDocument2.create = create;
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && Is.string(candidate.uri) && vscode_languageserver_types_1.integer.is(candidate.version) && Is.typedArray(candidate.cells, NotebookCell.is);
      }
      NotebookDocument2.is = is;
    })(NotebookDocument || (exports2.NotebookDocument = NotebookDocument = {}));
    var NotebookDocumentSyncRegistrationType;
    (function(NotebookDocumentSyncRegistrationType2) {
      NotebookDocumentSyncRegistrationType2.method = "notebookDocument/sync";
      NotebookDocumentSyncRegistrationType2.messageDirection = messages_1.MessageDirection.clientToServer;
      NotebookDocumentSyncRegistrationType2.type = new messages_1.RegistrationType(NotebookDocumentSyncRegistrationType2.method);
    })(NotebookDocumentSyncRegistrationType || (exports2.NotebookDocumentSyncRegistrationType = NotebookDocumentSyncRegistrationType = {}));
    var DidOpenNotebookDocumentNotification;
    (function(DidOpenNotebookDocumentNotification2) {
      DidOpenNotebookDocumentNotification2.method = "notebookDocument/didOpen";
      DidOpenNotebookDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidOpenNotebookDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidOpenNotebookDocumentNotification2.method);
      DidOpenNotebookDocumentNotification2.registrationMethod = NotebookDocumentSyncRegistrationType.method;
    })(DidOpenNotebookDocumentNotification || (exports2.DidOpenNotebookDocumentNotification = DidOpenNotebookDocumentNotification = {}));
    var NotebookCellArrayChange;
    (function(NotebookCellArrayChange2) {
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && vscode_languageserver_types_1.uinteger.is(candidate.start) && vscode_languageserver_types_1.uinteger.is(candidate.deleteCount) && (candidate.cells === void 0 || Is.typedArray(candidate.cells, NotebookCell.is));
      }
      NotebookCellArrayChange2.is = is;
      function create(start, deleteCount, cells) {
        const result = { start, deleteCount };
        if (cells !== void 0) {
          result.cells = cells;
        }
        return result;
      }
      NotebookCellArrayChange2.create = create;
    })(NotebookCellArrayChange || (exports2.NotebookCellArrayChange = NotebookCellArrayChange = {}));
    var DidChangeNotebookDocumentNotification;
    (function(DidChangeNotebookDocumentNotification2) {
      DidChangeNotebookDocumentNotification2.method = "notebookDocument/didChange";
      DidChangeNotebookDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidChangeNotebookDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidChangeNotebookDocumentNotification2.method);
      DidChangeNotebookDocumentNotification2.registrationMethod = NotebookDocumentSyncRegistrationType.method;
    })(DidChangeNotebookDocumentNotification || (exports2.DidChangeNotebookDocumentNotification = DidChangeNotebookDocumentNotification = {}));
    var DidSaveNotebookDocumentNotification;
    (function(DidSaveNotebookDocumentNotification2) {
      DidSaveNotebookDocumentNotification2.method = "notebookDocument/didSave";
      DidSaveNotebookDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidSaveNotebookDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidSaveNotebookDocumentNotification2.method);
      DidSaveNotebookDocumentNotification2.registrationMethod = NotebookDocumentSyncRegistrationType.method;
    })(DidSaveNotebookDocumentNotification || (exports2.DidSaveNotebookDocumentNotification = DidSaveNotebookDocumentNotification = {}));
    var DidCloseNotebookDocumentNotification;
    (function(DidCloseNotebookDocumentNotification2) {
      DidCloseNotebookDocumentNotification2.method = "notebookDocument/didClose";
      DidCloseNotebookDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidCloseNotebookDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidCloseNotebookDocumentNotification2.method);
      DidCloseNotebookDocumentNotification2.registrationMethod = NotebookDocumentSyncRegistrationType.method;
    })(DidCloseNotebookDocumentNotification || (exports2.DidCloseNotebookDocumentNotification = DidCloseNotebookDocumentNotification = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.inlineCompletion.js
var require_protocol_inlineCompletion = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.inlineCompletion.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InlineCompletionRequest = void 0;
    var messages_1 = require_messages2();
    var InlineCompletionRequest;
    (function(InlineCompletionRequest2) {
      InlineCompletionRequest2.method = "textDocument/inlineCompletion";
      InlineCompletionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      InlineCompletionRequest2.type = new messages_1.ProtocolRequestType(InlineCompletionRequest2.method);
    })(InlineCompletionRequest || (exports2.InlineCompletionRequest = InlineCompletionRequest = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/protocol.js
var require_protocol = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/protocol.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WorkspaceSymbolRequest = exports2.CodeActionResolveRequest = exports2.CodeActionRequest = exports2.DocumentSymbolRequest = exports2.DocumentHighlightRequest = exports2.ReferencesRequest = exports2.DefinitionRequest = exports2.SignatureHelpRequest = exports2.SignatureHelpTriggerKind = exports2.HoverRequest = exports2.CompletionResolveRequest = exports2.CompletionRequest = exports2.CompletionTriggerKind = exports2.PublishDiagnosticsNotification = exports2.WatchKind = exports2.RelativePattern = exports2.FileChangeType = exports2.DidChangeWatchedFilesNotification = exports2.WillSaveTextDocumentWaitUntilRequest = exports2.WillSaveTextDocumentNotification = exports2.TextDocumentSaveReason = exports2.DidSaveTextDocumentNotification = exports2.DidCloseTextDocumentNotification = exports2.DidChangeTextDocumentNotification = exports2.TextDocumentContentChangeEvent = exports2.DidOpenTextDocumentNotification = exports2.TextDocumentSyncKind = exports2.TelemetryEventNotification = exports2.LogMessageNotification = exports2.ShowMessageRequest = exports2.ShowMessageNotification = exports2.MessageType = exports2.DidChangeConfigurationNotification = exports2.ExitNotification = exports2.ShutdownRequest = exports2.InitializedNotification = exports2.InitializeErrorCodes = exports2.InitializeRequest = exports2.WorkDoneProgressOptions = exports2.TextDocumentRegistrationOptions = exports2.StaticRegistrationOptions = exports2.PositionEncodingKind = exports2.FailureHandlingKind = exports2.ResourceOperationKind = exports2.UnregistrationRequest = exports2.RegistrationRequest = exports2.DocumentSelector = exports2.NotebookCellTextDocumentFilter = exports2.NotebookDocumentFilter = exports2.TextDocumentFilter = void 0;
    exports2.MonikerRequest = exports2.MonikerKind = exports2.UniquenessLevel = exports2.WillDeleteFilesRequest = exports2.DidDeleteFilesNotification = exports2.WillRenameFilesRequest = exports2.DidRenameFilesNotification = exports2.WillCreateFilesRequest = exports2.DidCreateFilesNotification = exports2.FileOperationPatternKind = exports2.LinkedEditingRangeRequest = exports2.ShowDocumentRequest = exports2.SemanticTokensRegistrationType = exports2.SemanticTokensRefreshRequest = exports2.SemanticTokensRangeRequest = exports2.SemanticTokensDeltaRequest = exports2.SemanticTokensRequest = exports2.TokenFormat = exports2.CallHierarchyPrepareRequest = exports2.CallHierarchyOutgoingCallsRequest = exports2.CallHierarchyIncomingCallsRequest = exports2.WorkDoneProgressCancelNotification = exports2.WorkDoneProgressCreateRequest = exports2.WorkDoneProgress = exports2.SelectionRangeRequest = exports2.DeclarationRequest = exports2.FoldingRangeRefreshRequest = exports2.FoldingRangeRequest = exports2.ColorPresentationRequest = exports2.DocumentColorRequest = exports2.ConfigurationRequest = exports2.DidChangeWorkspaceFoldersNotification = exports2.WorkspaceFoldersRequest = exports2.TypeDefinitionRequest = exports2.ImplementationRequest = exports2.ApplyWorkspaceEditRequest = exports2.ExecuteCommandRequest = exports2.PrepareRenameRequest = exports2.RenameRequest = exports2.PrepareSupportDefaultBehavior = exports2.DocumentOnTypeFormattingRequest = exports2.DocumentRangesFormattingRequest = exports2.DocumentRangeFormattingRequest = exports2.DocumentFormattingRequest = exports2.DocumentLinkResolveRequest = exports2.DocumentLinkRequest = exports2.CodeLensRefreshRequest = exports2.CodeLensResolveRequest = exports2.CodeLensRequest = exports2.WorkspaceSymbolResolveRequest = void 0;
    exports2.InlineCompletionRequest = exports2.DidCloseNotebookDocumentNotification = exports2.DidSaveNotebookDocumentNotification = exports2.DidChangeNotebookDocumentNotification = exports2.NotebookCellArrayChange = exports2.DidOpenNotebookDocumentNotification = exports2.NotebookDocumentSyncRegistrationType = exports2.NotebookDocument = exports2.NotebookCell = exports2.ExecutionSummary = exports2.NotebookCellKind = exports2.DiagnosticRefreshRequest = exports2.WorkspaceDiagnosticRequest = exports2.DocumentDiagnosticRequest = exports2.DocumentDiagnosticReportKind = exports2.DiagnosticServerCancellationData = exports2.InlayHintRefreshRequest = exports2.InlayHintResolveRequest = exports2.InlayHintRequest = exports2.InlineValueRefreshRequest = exports2.InlineValueRequest = exports2.TypeHierarchySupertypesRequest = exports2.TypeHierarchySubtypesRequest = exports2.TypeHierarchyPrepareRequest = void 0;
    var messages_1 = require_messages2();
    var vscode_languageserver_types_1 = require_main2();
    var Is = require_is3();
    var protocol_implementation_1 = require_protocol_implementation();
    Object.defineProperty(exports2, "ImplementationRequest", { enumerable: true, get: function() {
      return protocol_implementation_1.ImplementationRequest;
    } });
    var protocol_typeDefinition_1 = require_protocol_typeDefinition();
    Object.defineProperty(exports2, "TypeDefinitionRequest", { enumerable: true, get: function() {
      return protocol_typeDefinition_1.TypeDefinitionRequest;
    } });
    var protocol_workspaceFolder_1 = require_protocol_workspaceFolder();
    Object.defineProperty(exports2, "WorkspaceFoldersRequest", { enumerable: true, get: function() {
      return protocol_workspaceFolder_1.WorkspaceFoldersRequest;
    } });
    Object.defineProperty(exports2, "DidChangeWorkspaceFoldersNotification", { enumerable: true, get: function() {
      return protocol_workspaceFolder_1.DidChangeWorkspaceFoldersNotification;
    } });
    var protocol_configuration_1 = require_protocol_configuration();
    Object.defineProperty(exports2, "ConfigurationRequest", { enumerable: true, get: function() {
      return protocol_configuration_1.ConfigurationRequest;
    } });
    var protocol_colorProvider_1 = require_protocol_colorProvider();
    Object.defineProperty(exports2, "DocumentColorRequest", { enumerable: true, get: function() {
      return protocol_colorProvider_1.DocumentColorRequest;
    } });
    Object.defineProperty(exports2, "ColorPresentationRequest", { enumerable: true, get: function() {
      return protocol_colorProvider_1.ColorPresentationRequest;
    } });
    var protocol_foldingRange_1 = require_protocol_foldingRange();
    Object.defineProperty(exports2, "FoldingRangeRequest", { enumerable: true, get: function() {
      return protocol_foldingRange_1.FoldingRangeRequest;
    } });
    Object.defineProperty(exports2, "FoldingRangeRefreshRequest", { enumerable: true, get: function() {
      return protocol_foldingRange_1.FoldingRangeRefreshRequest;
    } });
    var protocol_declaration_1 = require_protocol_declaration();
    Object.defineProperty(exports2, "DeclarationRequest", { enumerable: true, get: function() {
      return protocol_declaration_1.DeclarationRequest;
    } });
    var protocol_selectionRange_1 = require_protocol_selectionRange();
    Object.defineProperty(exports2, "SelectionRangeRequest", { enumerable: true, get: function() {
      return protocol_selectionRange_1.SelectionRangeRequest;
    } });
    var protocol_progress_1 = require_protocol_progress();
    Object.defineProperty(exports2, "WorkDoneProgress", { enumerable: true, get: function() {
      return protocol_progress_1.WorkDoneProgress;
    } });
    Object.defineProperty(exports2, "WorkDoneProgressCreateRequest", { enumerable: true, get: function() {
      return protocol_progress_1.WorkDoneProgressCreateRequest;
    } });
    Object.defineProperty(exports2, "WorkDoneProgressCancelNotification", { enumerable: true, get: function() {
      return protocol_progress_1.WorkDoneProgressCancelNotification;
    } });
    var protocol_callHierarchy_1 = require_protocol_callHierarchy();
    Object.defineProperty(exports2, "CallHierarchyIncomingCallsRequest", { enumerable: true, get: function() {
      return protocol_callHierarchy_1.CallHierarchyIncomingCallsRequest;
    } });
    Object.defineProperty(exports2, "CallHierarchyOutgoingCallsRequest", { enumerable: true, get: function() {
      return protocol_callHierarchy_1.CallHierarchyOutgoingCallsRequest;
    } });
    Object.defineProperty(exports2, "CallHierarchyPrepareRequest", { enumerable: true, get: function() {
      return protocol_callHierarchy_1.CallHierarchyPrepareRequest;
    } });
    var protocol_semanticTokens_1 = require_protocol_semanticTokens();
    Object.defineProperty(exports2, "TokenFormat", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.TokenFormat;
    } });
    Object.defineProperty(exports2, "SemanticTokensRequest", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.SemanticTokensRequest;
    } });
    Object.defineProperty(exports2, "SemanticTokensDeltaRequest", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.SemanticTokensDeltaRequest;
    } });
    Object.defineProperty(exports2, "SemanticTokensRangeRequest", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.SemanticTokensRangeRequest;
    } });
    Object.defineProperty(exports2, "SemanticTokensRefreshRequest", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.SemanticTokensRefreshRequest;
    } });
    Object.defineProperty(exports2, "SemanticTokensRegistrationType", { enumerable: true, get: function() {
      return protocol_semanticTokens_1.SemanticTokensRegistrationType;
    } });
    var protocol_showDocument_1 = require_protocol_showDocument();
    Object.defineProperty(exports2, "ShowDocumentRequest", { enumerable: true, get: function() {
      return protocol_showDocument_1.ShowDocumentRequest;
    } });
    var protocol_linkedEditingRange_1 = require_protocol_linkedEditingRange();
    Object.defineProperty(exports2, "LinkedEditingRangeRequest", { enumerable: true, get: function() {
      return protocol_linkedEditingRange_1.LinkedEditingRangeRequest;
    } });
    var protocol_fileOperations_1 = require_protocol_fileOperations();
    Object.defineProperty(exports2, "FileOperationPatternKind", { enumerable: true, get: function() {
      return protocol_fileOperations_1.FileOperationPatternKind;
    } });
    Object.defineProperty(exports2, "DidCreateFilesNotification", { enumerable: true, get: function() {
      return protocol_fileOperations_1.DidCreateFilesNotification;
    } });
    Object.defineProperty(exports2, "WillCreateFilesRequest", { enumerable: true, get: function() {
      return protocol_fileOperations_1.WillCreateFilesRequest;
    } });
    Object.defineProperty(exports2, "DidRenameFilesNotification", { enumerable: true, get: function() {
      return protocol_fileOperations_1.DidRenameFilesNotification;
    } });
    Object.defineProperty(exports2, "WillRenameFilesRequest", { enumerable: true, get: function() {
      return protocol_fileOperations_1.WillRenameFilesRequest;
    } });
    Object.defineProperty(exports2, "DidDeleteFilesNotification", { enumerable: true, get: function() {
      return protocol_fileOperations_1.DidDeleteFilesNotification;
    } });
    Object.defineProperty(exports2, "WillDeleteFilesRequest", { enumerable: true, get: function() {
      return protocol_fileOperations_1.WillDeleteFilesRequest;
    } });
    var protocol_moniker_1 = require_protocol_moniker();
    Object.defineProperty(exports2, "UniquenessLevel", { enumerable: true, get: function() {
      return protocol_moniker_1.UniquenessLevel;
    } });
    Object.defineProperty(exports2, "MonikerKind", { enumerable: true, get: function() {
      return protocol_moniker_1.MonikerKind;
    } });
    Object.defineProperty(exports2, "MonikerRequest", { enumerable: true, get: function() {
      return protocol_moniker_1.MonikerRequest;
    } });
    var protocol_typeHierarchy_1 = require_protocol_typeHierarchy();
    Object.defineProperty(exports2, "TypeHierarchyPrepareRequest", { enumerable: true, get: function() {
      return protocol_typeHierarchy_1.TypeHierarchyPrepareRequest;
    } });
    Object.defineProperty(exports2, "TypeHierarchySubtypesRequest", { enumerable: true, get: function() {
      return protocol_typeHierarchy_1.TypeHierarchySubtypesRequest;
    } });
    Object.defineProperty(exports2, "TypeHierarchySupertypesRequest", { enumerable: true, get: function() {
      return protocol_typeHierarchy_1.TypeHierarchySupertypesRequest;
    } });
    var protocol_inlineValue_1 = require_protocol_inlineValue();
    Object.defineProperty(exports2, "InlineValueRequest", { enumerable: true, get: function() {
      return protocol_inlineValue_1.InlineValueRequest;
    } });
    Object.defineProperty(exports2, "InlineValueRefreshRequest", { enumerable: true, get: function() {
      return protocol_inlineValue_1.InlineValueRefreshRequest;
    } });
    var protocol_inlayHint_1 = require_protocol_inlayHint();
    Object.defineProperty(exports2, "InlayHintRequest", { enumerable: true, get: function() {
      return protocol_inlayHint_1.InlayHintRequest;
    } });
    Object.defineProperty(exports2, "InlayHintResolveRequest", { enumerable: true, get: function() {
      return protocol_inlayHint_1.InlayHintResolveRequest;
    } });
    Object.defineProperty(exports2, "InlayHintRefreshRequest", { enumerable: true, get: function() {
      return protocol_inlayHint_1.InlayHintRefreshRequest;
    } });
    var protocol_diagnostic_1 = require_protocol_diagnostic();
    Object.defineProperty(exports2, "DiagnosticServerCancellationData", { enumerable: true, get: function() {
      return protocol_diagnostic_1.DiagnosticServerCancellationData;
    } });
    Object.defineProperty(exports2, "DocumentDiagnosticReportKind", { enumerable: true, get: function() {
      return protocol_diagnostic_1.DocumentDiagnosticReportKind;
    } });
    Object.defineProperty(exports2, "DocumentDiagnosticRequest", { enumerable: true, get: function() {
      return protocol_diagnostic_1.DocumentDiagnosticRequest;
    } });
    Object.defineProperty(exports2, "WorkspaceDiagnosticRequest", { enumerable: true, get: function() {
      return protocol_diagnostic_1.WorkspaceDiagnosticRequest;
    } });
    Object.defineProperty(exports2, "DiagnosticRefreshRequest", { enumerable: true, get: function() {
      return protocol_diagnostic_1.DiagnosticRefreshRequest;
    } });
    var protocol_notebook_1 = require_protocol_notebook();
    Object.defineProperty(exports2, "NotebookCellKind", { enumerable: true, get: function() {
      return protocol_notebook_1.NotebookCellKind;
    } });
    Object.defineProperty(exports2, "ExecutionSummary", { enumerable: true, get: function() {
      return protocol_notebook_1.ExecutionSummary;
    } });
    Object.defineProperty(exports2, "NotebookCell", { enumerable: true, get: function() {
      return protocol_notebook_1.NotebookCell;
    } });
    Object.defineProperty(exports2, "NotebookDocument", { enumerable: true, get: function() {
      return protocol_notebook_1.NotebookDocument;
    } });
    Object.defineProperty(exports2, "NotebookDocumentSyncRegistrationType", { enumerable: true, get: function() {
      return protocol_notebook_1.NotebookDocumentSyncRegistrationType;
    } });
    Object.defineProperty(exports2, "DidOpenNotebookDocumentNotification", { enumerable: true, get: function() {
      return protocol_notebook_1.DidOpenNotebookDocumentNotification;
    } });
    Object.defineProperty(exports2, "NotebookCellArrayChange", { enumerable: true, get: function() {
      return protocol_notebook_1.NotebookCellArrayChange;
    } });
    Object.defineProperty(exports2, "DidChangeNotebookDocumentNotification", { enumerable: true, get: function() {
      return protocol_notebook_1.DidChangeNotebookDocumentNotification;
    } });
    Object.defineProperty(exports2, "DidSaveNotebookDocumentNotification", { enumerable: true, get: function() {
      return protocol_notebook_1.DidSaveNotebookDocumentNotification;
    } });
    Object.defineProperty(exports2, "DidCloseNotebookDocumentNotification", { enumerable: true, get: function() {
      return protocol_notebook_1.DidCloseNotebookDocumentNotification;
    } });
    var protocol_inlineCompletion_1 = require_protocol_inlineCompletion();
    Object.defineProperty(exports2, "InlineCompletionRequest", { enumerable: true, get: function() {
      return protocol_inlineCompletion_1.InlineCompletionRequest;
    } });
    var TextDocumentFilter;
    (function(TextDocumentFilter2) {
      function is(value) {
        const candidate = value;
        return Is.string(candidate) || (Is.string(candidate.language) || Is.string(candidate.scheme) || Is.string(candidate.pattern));
      }
      TextDocumentFilter2.is = is;
    })(TextDocumentFilter || (exports2.TextDocumentFilter = TextDocumentFilter = {}));
    var NotebookDocumentFilter;
    (function(NotebookDocumentFilter2) {
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && (Is.string(candidate.notebookType) || Is.string(candidate.scheme) || Is.string(candidate.pattern));
      }
      NotebookDocumentFilter2.is = is;
    })(NotebookDocumentFilter || (exports2.NotebookDocumentFilter = NotebookDocumentFilter = {}));
    var NotebookCellTextDocumentFilter;
    (function(NotebookCellTextDocumentFilter2) {
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && (Is.string(candidate.notebook) || NotebookDocumentFilter.is(candidate.notebook)) && (candidate.language === void 0 || Is.string(candidate.language));
      }
      NotebookCellTextDocumentFilter2.is = is;
    })(NotebookCellTextDocumentFilter || (exports2.NotebookCellTextDocumentFilter = NotebookCellTextDocumentFilter = {}));
    var DocumentSelector;
    (function(DocumentSelector2) {
      function is(value) {
        if (!Array.isArray(value)) {
          return false;
        }
        for (let elem of value) {
          if (!Is.string(elem) && !TextDocumentFilter.is(elem) && !NotebookCellTextDocumentFilter.is(elem)) {
            return false;
          }
        }
        return true;
      }
      DocumentSelector2.is = is;
    })(DocumentSelector || (exports2.DocumentSelector = DocumentSelector = {}));
    var RegistrationRequest;
    (function(RegistrationRequest2) {
      RegistrationRequest2.method = "client/registerCapability";
      RegistrationRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      RegistrationRequest2.type = new messages_1.ProtocolRequestType(RegistrationRequest2.method);
    })(RegistrationRequest || (exports2.RegistrationRequest = RegistrationRequest = {}));
    var UnregistrationRequest;
    (function(UnregistrationRequest2) {
      UnregistrationRequest2.method = "client/unregisterCapability";
      UnregistrationRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      UnregistrationRequest2.type = new messages_1.ProtocolRequestType(UnregistrationRequest2.method);
    })(UnregistrationRequest || (exports2.UnregistrationRequest = UnregistrationRequest = {}));
    var ResourceOperationKind;
    (function(ResourceOperationKind2) {
      ResourceOperationKind2.Create = "create";
      ResourceOperationKind2.Rename = "rename";
      ResourceOperationKind2.Delete = "delete";
    })(ResourceOperationKind || (exports2.ResourceOperationKind = ResourceOperationKind = {}));
    var FailureHandlingKind;
    (function(FailureHandlingKind2) {
      FailureHandlingKind2.Abort = "abort";
      FailureHandlingKind2.Transactional = "transactional";
      FailureHandlingKind2.TextOnlyTransactional = "textOnlyTransactional";
      FailureHandlingKind2.Undo = "undo";
    })(FailureHandlingKind || (exports2.FailureHandlingKind = FailureHandlingKind = {}));
    var PositionEncodingKind;
    (function(PositionEncodingKind2) {
      PositionEncodingKind2.UTF8 = "utf-8";
      PositionEncodingKind2.UTF16 = "utf-16";
      PositionEncodingKind2.UTF32 = "utf-32";
    })(PositionEncodingKind || (exports2.PositionEncodingKind = PositionEncodingKind = {}));
    var StaticRegistrationOptions;
    (function(StaticRegistrationOptions2) {
      function hasId(value) {
        const candidate = value;
        return candidate && Is.string(candidate.id) && candidate.id.length > 0;
      }
      StaticRegistrationOptions2.hasId = hasId;
    })(StaticRegistrationOptions || (exports2.StaticRegistrationOptions = StaticRegistrationOptions = {}));
    var TextDocumentRegistrationOptions;
    (function(TextDocumentRegistrationOptions2) {
      function is(value) {
        const candidate = value;
        return candidate && (candidate.documentSelector === null || DocumentSelector.is(candidate.documentSelector));
      }
      TextDocumentRegistrationOptions2.is = is;
    })(TextDocumentRegistrationOptions || (exports2.TextDocumentRegistrationOptions = TextDocumentRegistrationOptions = {}));
    var WorkDoneProgressOptions;
    (function(WorkDoneProgressOptions2) {
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && (candidate.workDoneProgress === void 0 || Is.boolean(candidate.workDoneProgress));
      }
      WorkDoneProgressOptions2.is = is;
      function hasWorkDoneProgress(value) {
        const candidate = value;
        return candidate && Is.boolean(candidate.workDoneProgress);
      }
      WorkDoneProgressOptions2.hasWorkDoneProgress = hasWorkDoneProgress;
    })(WorkDoneProgressOptions || (exports2.WorkDoneProgressOptions = WorkDoneProgressOptions = {}));
    var InitializeRequest;
    (function(InitializeRequest2) {
      InitializeRequest2.method = "initialize";
      InitializeRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      InitializeRequest2.type = new messages_1.ProtocolRequestType(InitializeRequest2.method);
    })(InitializeRequest || (exports2.InitializeRequest = InitializeRequest = {}));
    var InitializeErrorCodes;
    (function(InitializeErrorCodes2) {
      InitializeErrorCodes2.unknownProtocolVersion = 1;
    })(InitializeErrorCodes || (exports2.InitializeErrorCodes = InitializeErrorCodes = {}));
    var InitializedNotification;
    (function(InitializedNotification2) {
      InitializedNotification2.method = "initialized";
      InitializedNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      InitializedNotification2.type = new messages_1.ProtocolNotificationType(InitializedNotification2.method);
    })(InitializedNotification || (exports2.InitializedNotification = InitializedNotification = {}));
    var ShutdownRequest;
    (function(ShutdownRequest2) {
      ShutdownRequest2.method = "shutdown";
      ShutdownRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      ShutdownRequest2.type = new messages_1.ProtocolRequestType0(ShutdownRequest2.method);
    })(ShutdownRequest || (exports2.ShutdownRequest = ShutdownRequest = {}));
    var ExitNotification;
    (function(ExitNotification2) {
      ExitNotification2.method = "exit";
      ExitNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      ExitNotification2.type = new messages_1.ProtocolNotificationType0(ExitNotification2.method);
    })(ExitNotification || (exports2.ExitNotification = ExitNotification = {}));
    var DidChangeConfigurationNotification;
    (function(DidChangeConfigurationNotification2) {
      DidChangeConfigurationNotification2.method = "workspace/didChangeConfiguration";
      DidChangeConfigurationNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidChangeConfigurationNotification2.type = new messages_1.ProtocolNotificationType(DidChangeConfigurationNotification2.method);
    })(DidChangeConfigurationNotification || (exports2.DidChangeConfigurationNotification = DidChangeConfigurationNotification = {}));
    var MessageType;
    (function(MessageType2) {
      MessageType2.Error = 1;
      MessageType2.Warning = 2;
      MessageType2.Info = 3;
      MessageType2.Log = 4;
      MessageType2.Debug = 5;
    })(MessageType || (exports2.MessageType = MessageType = {}));
    var ShowMessageNotification;
    (function(ShowMessageNotification2) {
      ShowMessageNotification2.method = "window/showMessage";
      ShowMessageNotification2.messageDirection = messages_1.MessageDirection.serverToClient;
      ShowMessageNotification2.type = new messages_1.ProtocolNotificationType(ShowMessageNotification2.method);
    })(ShowMessageNotification || (exports2.ShowMessageNotification = ShowMessageNotification = {}));
    var ShowMessageRequest;
    (function(ShowMessageRequest2) {
      ShowMessageRequest2.method = "window/showMessageRequest";
      ShowMessageRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      ShowMessageRequest2.type = new messages_1.ProtocolRequestType(ShowMessageRequest2.method);
    })(ShowMessageRequest || (exports2.ShowMessageRequest = ShowMessageRequest = {}));
    var LogMessageNotification;
    (function(LogMessageNotification2) {
      LogMessageNotification2.method = "window/logMessage";
      LogMessageNotification2.messageDirection = messages_1.MessageDirection.serverToClient;
      LogMessageNotification2.type = new messages_1.ProtocolNotificationType(LogMessageNotification2.method);
    })(LogMessageNotification || (exports2.LogMessageNotification = LogMessageNotification = {}));
    var TelemetryEventNotification;
    (function(TelemetryEventNotification2) {
      TelemetryEventNotification2.method = "telemetry/event";
      TelemetryEventNotification2.messageDirection = messages_1.MessageDirection.serverToClient;
      TelemetryEventNotification2.type = new messages_1.ProtocolNotificationType(TelemetryEventNotification2.method);
    })(TelemetryEventNotification || (exports2.TelemetryEventNotification = TelemetryEventNotification = {}));
    var TextDocumentSyncKind;
    (function(TextDocumentSyncKind2) {
      TextDocumentSyncKind2.None = 0;
      TextDocumentSyncKind2.Full = 1;
      TextDocumentSyncKind2.Incremental = 2;
    })(TextDocumentSyncKind || (exports2.TextDocumentSyncKind = TextDocumentSyncKind = {}));
    var DidOpenTextDocumentNotification;
    (function(DidOpenTextDocumentNotification2) {
      DidOpenTextDocumentNotification2.method = "textDocument/didOpen";
      DidOpenTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidOpenTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidOpenTextDocumentNotification2.method);
    })(DidOpenTextDocumentNotification || (exports2.DidOpenTextDocumentNotification = DidOpenTextDocumentNotification = {}));
    var TextDocumentContentChangeEvent;
    (function(TextDocumentContentChangeEvent2) {
      function isIncremental(event) {
        let candidate = event;
        return candidate !== void 0 && candidate !== null && typeof candidate.text === "string" && candidate.range !== void 0 && (candidate.rangeLength === void 0 || typeof candidate.rangeLength === "number");
      }
      TextDocumentContentChangeEvent2.isIncremental = isIncremental;
      function isFull(event) {
        let candidate = event;
        return candidate !== void 0 && candidate !== null && typeof candidate.text === "string" && candidate.range === void 0 && candidate.rangeLength === void 0;
      }
      TextDocumentContentChangeEvent2.isFull = isFull;
    })(TextDocumentContentChangeEvent || (exports2.TextDocumentContentChangeEvent = TextDocumentContentChangeEvent = {}));
    var DidChangeTextDocumentNotification;
    (function(DidChangeTextDocumentNotification2) {
      DidChangeTextDocumentNotification2.method = "textDocument/didChange";
      DidChangeTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidChangeTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidChangeTextDocumentNotification2.method);
    })(DidChangeTextDocumentNotification || (exports2.DidChangeTextDocumentNotification = DidChangeTextDocumentNotification = {}));
    var DidCloseTextDocumentNotification;
    (function(DidCloseTextDocumentNotification2) {
      DidCloseTextDocumentNotification2.method = "textDocument/didClose";
      DidCloseTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidCloseTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidCloseTextDocumentNotification2.method);
    })(DidCloseTextDocumentNotification || (exports2.DidCloseTextDocumentNotification = DidCloseTextDocumentNotification = {}));
    var DidSaveTextDocumentNotification;
    (function(DidSaveTextDocumentNotification2) {
      DidSaveTextDocumentNotification2.method = "textDocument/didSave";
      DidSaveTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidSaveTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(DidSaveTextDocumentNotification2.method);
    })(DidSaveTextDocumentNotification || (exports2.DidSaveTextDocumentNotification = DidSaveTextDocumentNotification = {}));
    var TextDocumentSaveReason;
    (function(TextDocumentSaveReason2) {
      TextDocumentSaveReason2.Manual = 1;
      TextDocumentSaveReason2.AfterDelay = 2;
      TextDocumentSaveReason2.FocusOut = 3;
    })(TextDocumentSaveReason || (exports2.TextDocumentSaveReason = TextDocumentSaveReason = {}));
    var WillSaveTextDocumentNotification;
    (function(WillSaveTextDocumentNotification2) {
      WillSaveTextDocumentNotification2.method = "textDocument/willSave";
      WillSaveTextDocumentNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      WillSaveTextDocumentNotification2.type = new messages_1.ProtocolNotificationType(WillSaveTextDocumentNotification2.method);
    })(WillSaveTextDocumentNotification || (exports2.WillSaveTextDocumentNotification = WillSaveTextDocumentNotification = {}));
    var WillSaveTextDocumentWaitUntilRequest;
    (function(WillSaveTextDocumentWaitUntilRequest2) {
      WillSaveTextDocumentWaitUntilRequest2.method = "textDocument/willSaveWaitUntil";
      WillSaveTextDocumentWaitUntilRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WillSaveTextDocumentWaitUntilRequest2.type = new messages_1.ProtocolRequestType(WillSaveTextDocumentWaitUntilRequest2.method);
    })(WillSaveTextDocumentWaitUntilRequest || (exports2.WillSaveTextDocumentWaitUntilRequest = WillSaveTextDocumentWaitUntilRequest = {}));
    var DidChangeWatchedFilesNotification;
    (function(DidChangeWatchedFilesNotification2) {
      DidChangeWatchedFilesNotification2.method = "workspace/didChangeWatchedFiles";
      DidChangeWatchedFilesNotification2.messageDirection = messages_1.MessageDirection.clientToServer;
      DidChangeWatchedFilesNotification2.type = new messages_1.ProtocolNotificationType(DidChangeWatchedFilesNotification2.method);
    })(DidChangeWatchedFilesNotification || (exports2.DidChangeWatchedFilesNotification = DidChangeWatchedFilesNotification = {}));
    var FileChangeType;
    (function(FileChangeType2) {
      FileChangeType2.Created = 1;
      FileChangeType2.Changed = 2;
      FileChangeType2.Deleted = 3;
    })(FileChangeType || (exports2.FileChangeType = FileChangeType = {}));
    var RelativePattern;
    (function(RelativePattern2) {
      function is(value) {
        const candidate = value;
        return Is.objectLiteral(candidate) && (vscode_languageserver_types_1.URI.is(candidate.baseUri) || vscode_languageserver_types_1.WorkspaceFolder.is(candidate.baseUri)) && Is.string(candidate.pattern);
      }
      RelativePattern2.is = is;
    })(RelativePattern || (exports2.RelativePattern = RelativePattern = {}));
    var WatchKind;
    (function(WatchKind2) {
      WatchKind2.Create = 1;
      WatchKind2.Change = 2;
      WatchKind2.Delete = 4;
    })(WatchKind || (exports2.WatchKind = WatchKind = {}));
    var PublishDiagnosticsNotification;
    (function(PublishDiagnosticsNotification2) {
      PublishDiagnosticsNotification2.method = "textDocument/publishDiagnostics";
      PublishDiagnosticsNotification2.messageDirection = messages_1.MessageDirection.serverToClient;
      PublishDiagnosticsNotification2.type = new messages_1.ProtocolNotificationType(PublishDiagnosticsNotification2.method);
    })(PublishDiagnosticsNotification || (exports2.PublishDiagnosticsNotification = PublishDiagnosticsNotification = {}));
    var CompletionTriggerKind;
    (function(CompletionTriggerKind2) {
      CompletionTriggerKind2.Invoked = 1;
      CompletionTriggerKind2.TriggerCharacter = 2;
      CompletionTriggerKind2.TriggerForIncompleteCompletions = 3;
    })(CompletionTriggerKind || (exports2.CompletionTriggerKind = CompletionTriggerKind = {}));
    var CompletionRequest;
    (function(CompletionRequest2) {
      CompletionRequest2.method = "textDocument/completion";
      CompletionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CompletionRequest2.type = new messages_1.ProtocolRequestType(CompletionRequest2.method);
    })(CompletionRequest || (exports2.CompletionRequest = CompletionRequest = {}));
    var CompletionResolveRequest;
    (function(CompletionResolveRequest2) {
      CompletionResolveRequest2.method = "completionItem/resolve";
      CompletionResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CompletionResolveRequest2.type = new messages_1.ProtocolRequestType(CompletionResolveRequest2.method);
    })(CompletionResolveRequest || (exports2.CompletionResolveRequest = CompletionResolveRequest = {}));
    var HoverRequest;
    (function(HoverRequest2) {
      HoverRequest2.method = "textDocument/hover";
      HoverRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      HoverRequest2.type = new messages_1.ProtocolRequestType(HoverRequest2.method);
    })(HoverRequest || (exports2.HoverRequest = HoverRequest = {}));
    var SignatureHelpTriggerKind;
    (function(SignatureHelpTriggerKind2) {
      SignatureHelpTriggerKind2.Invoked = 1;
      SignatureHelpTriggerKind2.TriggerCharacter = 2;
      SignatureHelpTriggerKind2.ContentChange = 3;
    })(SignatureHelpTriggerKind || (exports2.SignatureHelpTriggerKind = SignatureHelpTriggerKind = {}));
    var SignatureHelpRequest;
    (function(SignatureHelpRequest2) {
      SignatureHelpRequest2.method = "textDocument/signatureHelp";
      SignatureHelpRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      SignatureHelpRequest2.type = new messages_1.ProtocolRequestType(SignatureHelpRequest2.method);
    })(SignatureHelpRequest || (exports2.SignatureHelpRequest = SignatureHelpRequest = {}));
    var DefinitionRequest;
    (function(DefinitionRequest2) {
      DefinitionRequest2.method = "textDocument/definition";
      DefinitionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DefinitionRequest2.type = new messages_1.ProtocolRequestType(DefinitionRequest2.method);
    })(DefinitionRequest || (exports2.DefinitionRequest = DefinitionRequest = {}));
    var ReferencesRequest;
    (function(ReferencesRequest2) {
      ReferencesRequest2.method = "textDocument/references";
      ReferencesRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      ReferencesRequest2.type = new messages_1.ProtocolRequestType(ReferencesRequest2.method);
    })(ReferencesRequest || (exports2.ReferencesRequest = ReferencesRequest = {}));
    var DocumentHighlightRequest;
    (function(DocumentHighlightRequest2) {
      DocumentHighlightRequest2.method = "textDocument/documentHighlight";
      DocumentHighlightRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentHighlightRequest2.type = new messages_1.ProtocolRequestType(DocumentHighlightRequest2.method);
    })(DocumentHighlightRequest || (exports2.DocumentHighlightRequest = DocumentHighlightRequest = {}));
    var DocumentSymbolRequest;
    (function(DocumentSymbolRequest2) {
      DocumentSymbolRequest2.method = "textDocument/documentSymbol";
      DocumentSymbolRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentSymbolRequest2.type = new messages_1.ProtocolRequestType(DocumentSymbolRequest2.method);
    })(DocumentSymbolRequest || (exports2.DocumentSymbolRequest = DocumentSymbolRequest = {}));
    var CodeActionRequest;
    (function(CodeActionRequest2) {
      CodeActionRequest2.method = "textDocument/codeAction";
      CodeActionRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CodeActionRequest2.type = new messages_1.ProtocolRequestType(CodeActionRequest2.method);
    })(CodeActionRequest || (exports2.CodeActionRequest = CodeActionRequest = {}));
    var CodeActionResolveRequest;
    (function(CodeActionResolveRequest2) {
      CodeActionResolveRequest2.method = "codeAction/resolve";
      CodeActionResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CodeActionResolveRequest2.type = new messages_1.ProtocolRequestType(CodeActionResolveRequest2.method);
    })(CodeActionResolveRequest || (exports2.CodeActionResolveRequest = CodeActionResolveRequest = {}));
    var WorkspaceSymbolRequest;
    (function(WorkspaceSymbolRequest2) {
      WorkspaceSymbolRequest2.method = "workspace/symbol";
      WorkspaceSymbolRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WorkspaceSymbolRequest2.type = new messages_1.ProtocolRequestType(WorkspaceSymbolRequest2.method);
    })(WorkspaceSymbolRequest || (exports2.WorkspaceSymbolRequest = WorkspaceSymbolRequest = {}));
    var WorkspaceSymbolResolveRequest;
    (function(WorkspaceSymbolResolveRequest2) {
      WorkspaceSymbolResolveRequest2.method = "workspaceSymbol/resolve";
      WorkspaceSymbolResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      WorkspaceSymbolResolveRequest2.type = new messages_1.ProtocolRequestType(WorkspaceSymbolResolveRequest2.method);
    })(WorkspaceSymbolResolveRequest || (exports2.WorkspaceSymbolResolveRequest = WorkspaceSymbolResolveRequest = {}));
    var CodeLensRequest;
    (function(CodeLensRequest2) {
      CodeLensRequest2.method = "textDocument/codeLens";
      CodeLensRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CodeLensRequest2.type = new messages_1.ProtocolRequestType(CodeLensRequest2.method);
    })(CodeLensRequest || (exports2.CodeLensRequest = CodeLensRequest = {}));
    var CodeLensResolveRequest;
    (function(CodeLensResolveRequest2) {
      CodeLensResolveRequest2.method = "codeLens/resolve";
      CodeLensResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      CodeLensResolveRequest2.type = new messages_1.ProtocolRequestType(CodeLensResolveRequest2.method);
    })(CodeLensResolveRequest || (exports2.CodeLensResolveRequest = CodeLensResolveRequest = {}));
    var CodeLensRefreshRequest;
    (function(CodeLensRefreshRequest2) {
      CodeLensRefreshRequest2.method = `workspace/codeLens/refresh`;
      CodeLensRefreshRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      CodeLensRefreshRequest2.type = new messages_1.ProtocolRequestType0(CodeLensRefreshRequest2.method);
    })(CodeLensRefreshRequest || (exports2.CodeLensRefreshRequest = CodeLensRefreshRequest = {}));
    var DocumentLinkRequest;
    (function(DocumentLinkRequest2) {
      DocumentLinkRequest2.method = "textDocument/documentLink";
      DocumentLinkRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentLinkRequest2.type = new messages_1.ProtocolRequestType(DocumentLinkRequest2.method);
    })(DocumentLinkRequest || (exports2.DocumentLinkRequest = DocumentLinkRequest = {}));
    var DocumentLinkResolveRequest;
    (function(DocumentLinkResolveRequest2) {
      DocumentLinkResolveRequest2.method = "documentLink/resolve";
      DocumentLinkResolveRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentLinkResolveRequest2.type = new messages_1.ProtocolRequestType(DocumentLinkResolveRequest2.method);
    })(DocumentLinkResolveRequest || (exports2.DocumentLinkResolveRequest = DocumentLinkResolveRequest = {}));
    var DocumentFormattingRequest;
    (function(DocumentFormattingRequest2) {
      DocumentFormattingRequest2.method = "textDocument/formatting";
      DocumentFormattingRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentFormattingRequest2.type = new messages_1.ProtocolRequestType(DocumentFormattingRequest2.method);
    })(DocumentFormattingRequest || (exports2.DocumentFormattingRequest = DocumentFormattingRequest = {}));
    var DocumentRangeFormattingRequest;
    (function(DocumentRangeFormattingRequest2) {
      DocumentRangeFormattingRequest2.method = "textDocument/rangeFormatting";
      DocumentRangeFormattingRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentRangeFormattingRequest2.type = new messages_1.ProtocolRequestType(DocumentRangeFormattingRequest2.method);
    })(DocumentRangeFormattingRequest || (exports2.DocumentRangeFormattingRequest = DocumentRangeFormattingRequest = {}));
    var DocumentRangesFormattingRequest;
    (function(DocumentRangesFormattingRequest2) {
      DocumentRangesFormattingRequest2.method = "textDocument/rangesFormatting";
      DocumentRangesFormattingRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentRangesFormattingRequest2.type = new messages_1.ProtocolRequestType(DocumentRangesFormattingRequest2.method);
    })(DocumentRangesFormattingRequest || (exports2.DocumentRangesFormattingRequest = DocumentRangesFormattingRequest = {}));
    var DocumentOnTypeFormattingRequest;
    (function(DocumentOnTypeFormattingRequest2) {
      DocumentOnTypeFormattingRequest2.method = "textDocument/onTypeFormatting";
      DocumentOnTypeFormattingRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      DocumentOnTypeFormattingRequest2.type = new messages_1.ProtocolRequestType(DocumentOnTypeFormattingRequest2.method);
    })(DocumentOnTypeFormattingRequest || (exports2.DocumentOnTypeFormattingRequest = DocumentOnTypeFormattingRequest = {}));
    var PrepareSupportDefaultBehavior;
    (function(PrepareSupportDefaultBehavior2) {
      PrepareSupportDefaultBehavior2.Identifier = 1;
    })(PrepareSupportDefaultBehavior || (exports2.PrepareSupportDefaultBehavior = PrepareSupportDefaultBehavior = {}));
    var RenameRequest;
    (function(RenameRequest2) {
      RenameRequest2.method = "textDocument/rename";
      RenameRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      RenameRequest2.type = new messages_1.ProtocolRequestType(RenameRequest2.method);
    })(RenameRequest || (exports2.RenameRequest = RenameRequest = {}));
    var PrepareRenameRequest;
    (function(PrepareRenameRequest2) {
      PrepareRenameRequest2.method = "textDocument/prepareRename";
      PrepareRenameRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      PrepareRenameRequest2.type = new messages_1.ProtocolRequestType(PrepareRenameRequest2.method);
    })(PrepareRenameRequest || (exports2.PrepareRenameRequest = PrepareRenameRequest = {}));
    var ExecuteCommandRequest;
    (function(ExecuteCommandRequest2) {
      ExecuteCommandRequest2.method = "workspace/executeCommand";
      ExecuteCommandRequest2.messageDirection = messages_1.MessageDirection.clientToServer;
      ExecuteCommandRequest2.type = new messages_1.ProtocolRequestType(ExecuteCommandRequest2.method);
    })(ExecuteCommandRequest || (exports2.ExecuteCommandRequest = ExecuteCommandRequest = {}));
    var ApplyWorkspaceEditRequest;
    (function(ApplyWorkspaceEditRequest2) {
      ApplyWorkspaceEditRequest2.method = "workspace/applyEdit";
      ApplyWorkspaceEditRequest2.messageDirection = messages_1.MessageDirection.serverToClient;
      ApplyWorkspaceEditRequest2.type = new messages_1.ProtocolRequestType("workspace/applyEdit");
    })(ApplyWorkspaceEditRequest || (exports2.ApplyWorkspaceEditRequest = ApplyWorkspaceEditRequest = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/connection.js
var require_connection2 = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/connection.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createProtocolConnection = void 0;
    var vscode_jsonrpc_1 = require_main();
    function createProtocolConnection(input, output, logger, options) {
      if (vscode_jsonrpc_1.ConnectionStrategy.is(options)) {
        options = { connectionStrategy: options };
      }
      return (0, vscode_jsonrpc_1.createMessageConnection)(input, output, logger, options);
    }
    exports2.createProtocolConnection = createProtocolConnection;
  }
});

// node_modules/vscode-languageserver-protocol/lib/common/api.js
var require_api2 = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/common/api.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LSPErrorCodes = exports2.createProtocolConnection = void 0;
    __exportStar(require_main(), exports2);
    __exportStar(require_main2(), exports2);
    __exportStar(require_messages2(), exports2);
    __exportStar(require_protocol(), exports2);
    var connection_1 = require_connection2();
    Object.defineProperty(exports2, "createProtocolConnection", { enumerable: true, get: function() {
      return connection_1.createProtocolConnection;
    } });
    var LSPErrorCodes;
    (function(LSPErrorCodes2) {
      LSPErrorCodes2.lspReservedErrorRangeStart = -32899;
      LSPErrorCodes2.RequestFailed = -32803;
      LSPErrorCodes2.ServerCancelled = -32802;
      LSPErrorCodes2.ContentModified = -32801;
      LSPErrorCodes2.RequestCancelled = -32800;
      LSPErrorCodes2.lspReservedErrorRangeEnd = -32800;
    })(LSPErrorCodes || (exports2.LSPErrorCodes = LSPErrorCodes = {}));
  }
});

// node_modules/vscode-languageserver-protocol/lib/node/main.js
var require_main3 = __commonJS({
  "node_modules/vscode-languageserver-protocol/lib/node/main.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createProtocolConnection = void 0;
    var node_1 = require_node();
    __exportStar(require_node(), exports2);
    __exportStar(require_api2(), exports2);
    function createProtocolConnection(input, output, logger, options) {
      return (0, node_1.createMessageConnection)(input, output, logger, options);
    }
    exports2.createProtocolConnection = createProtocolConnection;
  }
});

// node_modules/vscode-languageclient/lib/common/utils/async.js
var require_async = __commonJS({
  "node_modules/vscode-languageclient/lib/common/utils/async.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.forEach = exports2.mapAsync = exports2.map = exports2.clearTestMode = exports2.setTestMode = exports2.Semaphore = exports2.Delayer = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var Delayer = class {
      constructor(defaultDelay) {
        this.defaultDelay = defaultDelay;
        this.timeout = void 0;
        this.completionPromise = void 0;
        this.onSuccess = void 0;
        this.task = void 0;
      }
      trigger(task, delay = this.defaultDelay) {
        this.task = task;
        if (delay >= 0) {
          this.cancelTimeout();
        }
        if (!this.completionPromise) {
          this.completionPromise = new Promise((resolve) => {
            this.onSuccess = resolve;
          }).then(() => {
            this.completionPromise = void 0;
            this.onSuccess = void 0;
            var result = this.task();
            this.task = void 0;
            return result;
          });
        }
        if (delay >= 0 || this.timeout === void 0) {
          this.timeout = (0, vscode_languageserver_protocol_1.RAL)().timer.setTimeout(() => {
            this.timeout = void 0;
            this.onSuccess(void 0);
          }, delay >= 0 ? delay : this.defaultDelay);
        }
        return this.completionPromise;
      }
      forceDelivery() {
        if (!this.completionPromise) {
          return void 0;
        }
        this.cancelTimeout();
        let result = this.task();
        this.completionPromise = void 0;
        this.onSuccess = void 0;
        this.task = void 0;
        return result;
      }
      isTriggered() {
        return this.timeout !== void 0;
      }
      cancel() {
        this.cancelTimeout();
        this.completionPromise = void 0;
      }
      cancelTimeout() {
        if (this.timeout !== void 0) {
          this.timeout.dispose();
          this.timeout = void 0;
        }
      }
    };
    exports2.Delayer = Delayer;
    var Semaphore = class {
      constructor(capacity = 1) {
        if (capacity <= 0) {
          throw new Error("Capacity must be greater than 0");
        }
        this._capacity = capacity;
        this._active = 0;
        this._waiting = [];
      }
      lock(thunk) {
        return new Promise((resolve, reject) => {
          this._waiting.push({ thunk, resolve, reject });
          this.runNext();
        });
      }
      get active() {
        return this._active;
      }
      runNext() {
        if (this._waiting.length === 0 || this._active === this._capacity) {
          return;
        }
        (0, vscode_languageserver_protocol_1.RAL)().timer.setImmediate(() => this.doRunNext());
      }
      doRunNext() {
        if (this._waiting.length === 0 || this._active === this._capacity) {
          return;
        }
        const next = this._waiting.shift();
        this._active++;
        if (this._active > this._capacity) {
          throw new Error(`To many thunks active`);
        }
        try {
          const result = next.thunk();
          if (result instanceof Promise) {
            result.then((value) => {
              this._active--;
              next.resolve(value);
              this.runNext();
            }, (err) => {
              this._active--;
              next.reject(err);
              this.runNext();
            });
          } else {
            this._active--;
            next.resolve(result);
            this.runNext();
          }
        } catch (err) {
          this._active--;
          next.reject(err);
          this.runNext();
        }
      }
    };
    exports2.Semaphore = Semaphore;
    var $test = false;
    function setTestMode() {
      $test = true;
    }
    exports2.setTestMode = setTestMode;
    function clearTestMode() {
      $test = false;
    }
    exports2.clearTestMode = clearTestMode;
    var defaultYieldTimeout = 15;
    var Timer = class {
      constructor(yieldAfter = defaultYieldTimeout) {
        this.yieldAfter = $test === true ? Math.max(yieldAfter, 2) : Math.max(yieldAfter, defaultYieldTimeout);
        this.startTime = Date.now();
        this.counter = 0;
        this.total = 0;
        this.counterInterval = 1;
      }
      start() {
        this.counter = 0;
        this.total = 0;
        this.counterInterval = 1;
        this.startTime = Date.now();
      }
      shouldYield() {
        if (++this.counter >= this.counterInterval) {
          const timeTaken = Date.now() - this.startTime;
          const timeLeft = Math.max(0, this.yieldAfter - timeTaken);
          this.total += this.counter;
          this.counter = 0;
          if (timeTaken >= this.yieldAfter || timeLeft <= 1) {
            this.counterInterval = 1;
            this.total = 0;
            return true;
          } else {
            switch (timeTaken) {
              case 0:
              case 1:
                this.counterInterval = this.total * 2;
                break;
            }
          }
        }
        return false;
      }
    };
    async function map(items, func, token, options) {
      if (items.length === 0) {
        return [];
      }
      const result = new Array(items.length);
      const timer = new Timer(options?.yieldAfter);
      function convertBatch(start) {
        timer.start();
        for (let i = start; i < items.length; i++) {
          result[i] = func(items[i]);
          if (timer.shouldYield()) {
            options?.yieldCallback && options.yieldCallback();
            return i + 1;
          }
        }
        return -1;
      }
      let index = convertBatch(0);
      while (index !== -1) {
        if (token !== void 0 && token.isCancellationRequested) {
          break;
        }
        index = await new Promise((resolve) => {
          (0, vscode_languageserver_protocol_1.RAL)().timer.setImmediate(() => {
            resolve(convertBatch(index));
          });
        });
      }
      return result;
    }
    exports2.map = map;
    async function mapAsync(items, func, token, options) {
      if (items.length === 0) {
        return [];
      }
      const result = new Array(items.length);
      const timer = new Timer(options?.yieldAfter);
      async function convertBatch(start) {
        timer.start();
        for (let i = start; i < items.length; i++) {
          result[i] = await func(items[i], token);
          if (timer.shouldYield()) {
            options?.yieldCallback && options.yieldCallback();
            return i + 1;
          }
        }
        return -1;
      }
      let index = await convertBatch(0);
      while (index !== -1) {
        if (token !== void 0 && token.isCancellationRequested) {
          break;
        }
        index = await new Promise((resolve) => {
          (0, vscode_languageserver_protocol_1.RAL)().timer.setImmediate(() => {
            resolve(convertBatch(index));
          });
        });
      }
      return result;
    }
    exports2.mapAsync = mapAsync;
    async function forEach(items, func, token, options) {
      if (items.length === 0) {
        return;
      }
      const timer = new Timer(options?.yieldAfter);
      function runBatch(start) {
        timer.start();
        for (let i = start; i < items.length; i++) {
          func(items[i]);
          if (timer.shouldYield()) {
            options?.yieldCallback && options.yieldCallback();
            return i + 1;
          }
        }
        return -1;
      }
      let index = runBatch(0);
      while (index !== -1) {
        if (token !== void 0 && token.isCancellationRequested) {
          break;
        }
        index = await new Promise((resolve) => {
          (0, vscode_languageserver_protocol_1.RAL)().timer.setImmediate(() => {
            resolve(runBatch(index));
          });
        });
      }
    }
    exports2.forEach = forEach;
  }
});

// node_modules/vscode-languageclient/lib/common/protocolCompletionItem.js
var require_protocolCompletionItem = __commonJS({
  "node_modules/vscode-languageclient/lib/common/protocolCompletionItem.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var code = require("vscode");
    var ProtocolCompletionItem = class extends code.CompletionItem {
      constructor(label) {
        super(label);
      }
    };
    exports2.default = ProtocolCompletionItem;
  }
});

// node_modules/vscode-languageclient/lib/common/protocolCodeLens.js
var require_protocolCodeLens = __commonJS({
  "node_modules/vscode-languageclient/lib/common/protocolCodeLens.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var code = require("vscode");
    var ProtocolCodeLens = class extends code.CodeLens {
      constructor(range) {
        super(range);
      }
    };
    exports2.default = ProtocolCodeLens;
  }
});

// node_modules/vscode-languageclient/lib/common/protocolDocumentLink.js
var require_protocolDocumentLink = __commonJS({
  "node_modules/vscode-languageclient/lib/common/protocolDocumentLink.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var code = require("vscode");
    var ProtocolDocumentLink = class extends code.DocumentLink {
      constructor(range, target) {
        super(range, target);
      }
    };
    exports2.default = ProtocolDocumentLink;
  }
});

// node_modules/vscode-languageclient/lib/common/protocolCodeAction.js
var require_protocolCodeAction = __commonJS({
  "node_modules/vscode-languageclient/lib/common/protocolCodeAction.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var vscode14 = require("vscode");
    var ProtocolCodeAction = class extends vscode14.CodeAction {
      constructor(title, data) {
        super(title);
        this.data = data;
      }
    };
    exports2.default = ProtocolCodeAction;
  }
});

// node_modules/vscode-languageclient/lib/common/protocolDiagnostic.js
var require_protocolDiagnostic = __commonJS({
  "node_modules/vscode-languageclient/lib/common/protocolDiagnostic.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ProtocolDiagnostic = exports2.DiagnosticCode = void 0;
    var vscode14 = require("vscode");
    var Is = require_is();
    var DiagnosticCode;
    (function(DiagnosticCode2) {
      function is(value) {
        const candidate = value;
        return candidate !== void 0 && candidate !== null && (Is.number(candidate.value) || Is.string(candidate.value)) && Is.string(candidate.target);
      }
      DiagnosticCode2.is = is;
    })(DiagnosticCode || (exports2.DiagnosticCode = DiagnosticCode = {}));
    var ProtocolDiagnostic = class extends vscode14.Diagnostic {
      constructor(range, message, severity, data) {
        super(range, message, severity);
        this.data = data;
        this.hasDiagnosticCode = false;
      }
    };
    exports2.ProtocolDiagnostic = ProtocolDiagnostic;
  }
});

// node_modules/vscode-languageclient/lib/common/protocolCallHierarchyItem.js
var require_protocolCallHierarchyItem = __commonJS({
  "node_modules/vscode-languageclient/lib/common/protocolCallHierarchyItem.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var code = require("vscode");
    var ProtocolCallHierarchyItem = class extends code.CallHierarchyItem {
      constructor(kind, name, detail, uri, range, selectionRange, data) {
        super(kind, name, detail, uri, range, selectionRange);
        if (data !== void 0) {
          this.data = data;
        }
      }
    };
    exports2.default = ProtocolCallHierarchyItem;
  }
});

// node_modules/vscode-languageclient/lib/common/protocolTypeHierarchyItem.js
var require_protocolTypeHierarchyItem = __commonJS({
  "node_modules/vscode-languageclient/lib/common/protocolTypeHierarchyItem.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var code = require("vscode");
    var ProtocolTypeHierarchyItem = class extends code.TypeHierarchyItem {
      constructor(kind, name, detail, uri, range, selectionRange, data) {
        super(kind, name, detail, uri, range, selectionRange);
        if (data !== void 0) {
          this.data = data;
        }
      }
    };
    exports2.default = ProtocolTypeHierarchyItem;
  }
});

// node_modules/vscode-languageclient/lib/common/protocolWorkspaceSymbol.js
var require_protocolWorkspaceSymbol = __commonJS({
  "node_modules/vscode-languageclient/lib/common/protocolWorkspaceSymbol.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var code = require("vscode");
    var WorkspaceSymbol = class extends code.SymbolInformation {
      constructor(name, kind, containerName, locationOrUri, data) {
        const hasRange = !(locationOrUri instanceof code.Uri);
        super(name, kind, containerName, hasRange ? locationOrUri : new code.Location(locationOrUri, new code.Range(0, 0, 0, 0)));
        this.hasRange = hasRange;
        if (data !== void 0) {
          this.data = data;
        }
      }
    };
    exports2.default = WorkspaceSymbol;
  }
});

// node_modules/vscode-languageclient/lib/common/protocolInlayHint.js
var require_protocolInlayHint = __commonJS({
  "node_modules/vscode-languageclient/lib/common/protocolInlayHint.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    var code = require("vscode");
    var ProtocolInlayHint = class extends code.InlayHint {
      constructor(position, label, kind) {
        super(position, label, kind);
      }
    };
    exports2.default = ProtocolInlayHint;
  }
});

// node_modules/vscode-languageclient/lib/common/codeConverter.js
var require_codeConverter = __commonJS({
  "node_modules/vscode-languageclient/lib/common/codeConverter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createConverter = void 0;
    var code = require("vscode");
    var proto = require_main3();
    var Is = require_is();
    var async = require_async();
    var protocolCompletionItem_1 = require_protocolCompletionItem();
    var protocolCodeLens_1 = require_protocolCodeLens();
    var protocolDocumentLink_1 = require_protocolDocumentLink();
    var protocolCodeAction_1 = require_protocolCodeAction();
    var protocolDiagnostic_1 = require_protocolDiagnostic();
    var protocolCallHierarchyItem_1 = require_protocolCallHierarchyItem();
    var protocolTypeHierarchyItem_1 = require_protocolTypeHierarchyItem();
    var protocolWorkspaceSymbol_1 = require_protocolWorkspaceSymbol();
    var protocolInlayHint_1 = require_protocolInlayHint();
    var InsertReplaceRange;
    (function(InsertReplaceRange2) {
      function is(value) {
        const candidate = value;
        return candidate && !!candidate.inserting && !!candidate.replacing;
      }
      InsertReplaceRange2.is = is;
    })(InsertReplaceRange || (InsertReplaceRange = {}));
    function createConverter(uriConverter) {
      const nullConverter = (value) => value.toString();
      const _uriConverter = uriConverter || nullConverter;
      function asUri(value) {
        return _uriConverter(value);
      }
      function asTextDocumentIdentifier(textDocument) {
        return {
          uri: _uriConverter(textDocument.uri)
        };
      }
      function asTextDocumentItem(textDocument) {
        return {
          uri: _uriConverter(textDocument.uri),
          languageId: textDocument.languageId,
          version: textDocument.version,
          text: textDocument.getText()
        };
      }
      function asVersionedTextDocumentIdentifier(textDocument) {
        return {
          uri: _uriConverter(textDocument.uri),
          version: textDocument.version
        };
      }
      function asOpenTextDocumentParams(textDocument) {
        return {
          textDocument: asTextDocumentItem(textDocument)
        };
      }
      function isTextDocumentChangeEvent(value) {
        const candidate = value;
        return !!candidate.document && !!candidate.contentChanges;
      }
      function isTextDocument(value) {
        const candidate = value;
        return !!candidate.uri && !!candidate.version;
      }
      function asChangeTextDocumentParams(arg0, arg1, arg2) {
        if (isTextDocument(arg0)) {
          const result = {
            textDocument: {
              uri: _uriConverter(arg0.uri),
              version: arg0.version
            },
            contentChanges: [{ text: arg0.getText() }]
          };
          return result;
        } else if (isTextDocumentChangeEvent(arg0)) {
          const uri = arg1;
          const version = arg2;
          const result = {
            textDocument: {
              uri: _uriConverter(uri),
              version
            },
            contentChanges: arg0.contentChanges.map((change) => {
              const range = change.range;
              return {
                range: {
                  start: { line: range.start.line, character: range.start.character },
                  end: { line: range.end.line, character: range.end.character }
                },
                rangeLength: change.rangeLength,
                text: change.text
              };
            })
          };
          return result;
        } else {
          throw Error("Unsupported text document change parameter");
        }
      }
      function asCloseTextDocumentParams(textDocument) {
        return {
          textDocument: asTextDocumentIdentifier(textDocument)
        };
      }
      function asSaveTextDocumentParams(textDocument, includeContent = false) {
        let result = {
          textDocument: asTextDocumentIdentifier(textDocument)
        };
        if (includeContent) {
          result.text = textDocument.getText();
        }
        return result;
      }
      function asTextDocumentSaveReason(reason) {
        switch (reason) {
          case code.TextDocumentSaveReason.Manual:
            return proto.TextDocumentSaveReason.Manual;
          case code.TextDocumentSaveReason.AfterDelay:
            return proto.TextDocumentSaveReason.AfterDelay;
          case code.TextDocumentSaveReason.FocusOut:
            return proto.TextDocumentSaveReason.FocusOut;
        }
        return proto.TextDocumentSaveReason.Manual;
      }
      function asWillSaveTextDocumentParams(event) {
        return {
          textDocument: asTextDocumentIdentifier(event.document),
          reason: asTextDocumentSaveReason(event.reason)
        };
      }
      function asDidCreateFilesParams(event) {
        return {
          files: event.files.map((fileUri) => ({
            uri: _uriConverter(fileUri)
          }))
        };
      }
      function asDidRenameFilesParams(event) {
        return {
          files: event.files.map((file) => ({
            oldUri: _uriConverter(file.oldUri),
            newUri: _uriConverter(file.newUri)
          }))
        };
      }
      function asDidDeleteFilesParams(event) {
        return {
          files: event.files.map((fileUri) => ({
            uri: _uriConverter(fileUri)
          }))
        };
      }
      function asWillCreateFilesParams(event) {
        return {
          files: event.files.map((fileUri) => ({
            uri: _uriConverter(fileUri)
          }))
        };
      }
      function asWillRenameFilesParams(event) {
        return {
          files: event.files.map((file) => ({
            oldUri: _uriConverter(file.oldUri),
            newUri: _uriConverter(file.newUri)
          }))
        };
      }
      function asWillDeleteFilesParams(event) {
        return {
          files: event.files.map((fileUri) => ({
            uri: _uriConverter(fileUri)
          }))
        };
      }
      function asTextDocumentPositionParams(textDocument, position) {
        return {
          textDocument: asTextDocumentIdentifier(textDocument),
          position: asWorkerPosition(position)
        };
      }
      function asCompletionTriggerKind(triggerKind) {
        switch (triggerKind) {
          case code.CompletionTriggerKind.TriggerCharacter:
            return proto.CompletionTriggerKind.TriggerCharacter;
          case code.CompletionTriggerKind.TriggerForIncompleteCompletions:
            return proto.CompletionTriggerKind.TriggerForIncompleteCompletions;
          default:
            return proto.CompletionTriggerKind.Invoked;
        }
      }
      function asCompletionParams(textDocument, position, context) {
        return {
          textDocument: asTextDocumentIdentifier(textDocument),
          position: asWorkerPosition(position),
          context: {
            triggerKind: asCompletionTriggerKind(context.triggerKind),
            triggerCharacter: context.triggerCharacter
          }
        };
      }
      function asSignatureHelpTriggerKind(triggerKind) {
        switch (triggerKind) {
          case code.SignatureHelpTriggerKind.Invoke:
            return proto.SignatureHelpTriggerKind.Invoked;
          case code.SignatureHelpTriggerKind.TriggerCharacter:
            return proto.SignatureHelpTriggerKind.TriggerCharacter;
          case code.SignatureHelpTriggerKind.ContentChange:
            return proto.SignatureHelpTriggerKind.ContentChange;
        }
      }
      function asParameterInformation(value) {
        return {
          label: value.label
        };
      }
      function asParameterInformations(values) {
        return values.map(asParameterInformation);
      }
      function asSignatureInformation(value) {
        return {
          label: value.label,
          parameters: asParameterInformations(value.parameters)
        };
      }
      function asSignatureInformations(values) {
        return values.map(asSignatureInformation);
      }
      function asSignatureHelp(value) {
        if (value === void 0) {
          return value;
        }
        return {
          signatures: asSignatureInformations(value.signatures),
          activeSignature: value.activeSignature,
          activeParameter: value.activeParameter
        };
      }
      function asSignatureHelpParams(textDocument, position, context) {
        return {
          textDocument: asTextDocumentIdentifier(textDocument),
          position: asWorkerPosition(position),
          context: {
            isRetrigger: context.isRetrigger,
            triggerCharacter: context.triggerCharacter,
            triggerKind: asSignatureHelpTriggerKind(context.triggerKind),
            activeSignatureHelp: asSignatureHelp(context.activeSignatureHelp)
          }
        };
      }
      function asWorkerPosition(position) {
        return { line: position.line, character: position.character };
      }
      function asPosition(value) {
        if (value === void 0 || value === null) {
          return value;
        }
        return { line: value.line > proto.uinteger.MAX_VALUE ? proto.uinteger.MAX_VALUE : value.line, character: value.character > proto.uinteger.MAX_VALUE ? proto.uinteger.MAX_VALUE : value.character };
      }
      function asPositions(values, token) {
        return async.map(values, asPosition, token);
      }
      function asPositionsSync(values) {
        return values.map(asPosition);
      }
      function asRange(value) {
        if (value === void 0 || value === null) {
          return value;
        }
        return { start: asPosition(value.start), end: asPosition(value.end) };
      }
      function asRanges(values) {
        return values.map(asRange);
      }
      function asLocation(value) {
        if (value === void 0 || value === null) {
          return value;
        }
        return proto.Location.create(asUri(value.uri), asRange(value.range));
      }
      function asDiagnosticSeverity(value) {
        switch (value) {
          case code.DiagnosticSeverity.Error:
            return proto.DiagnosticSeverity.Error;
          case code.DiagnosticSeverity.Warning:
            return proto.DiagnosticSeverity.Warning;
          case code.DiagnosticSeverity.Information:
            return proto.DiagnosticSeverity.Information;
          case code.DiagnosticSeverity.Hint:
            return proto.DiagnosticSeverity.Hint;
        }
      }
      function asDiagnosticTags(tags) {
        if (!tags) {
          return void 0;
        }
        let result = [];
        for (let tag of tags) {
          let converted = asDiagnosticTag(tag);
          if (converted !== void 0) {
            result.push(converted);
          }
        }
        return result.length > 0 ? result : void 0;
      }
      function asDiagnosticTag(tag) {
        switch (tag) {
          case code.DiagnosticTag.Unnecessary:
            return proto.DiagnosticTag.Unnecessary;
          case code.DiagnosticTag.Deprecated:
            return proto.DiagnosticTag.Deprecated;
          default:
            return void 0;
        }
      }
      function asRelatedInformation(item) {
        return {
          message: item.message,
          location: asLocation(item.location)
        };
      }
      function asRelatedInformations(items) {
        return items.map(asRelatedInformation);
      }
      function asDiagnosticCode(value) {
        if (value === void 0 || value === null) {
          return void 0;
        }
        if (Is.number(value) || Is.string(value)) {
          return value;
        }
        return { value: value.value, target: asUri(value.target) };
      }
      function asDiagnostic(item) {
        const result = proto.Diagnostic.create(asRange(item.range), item.message);
        const protocolDiagnostic = item instanceof protocolDiagnostic_1.ProtocolDiagnostic ? item : void 0;
        if (protocolDiagnostic !== void 0 && protocolDiagnostic.data !== void 0) {
          result.data = protocolDiagnostic.data;
        }
        const code2 = asDiagnosticCode(item.code);
        if (protocolDiagnostic_1.DiagnosticCode.is(code2)) {
          if (protocolDiagnostic !== void 0 && protocolDiagnostic.hasDiagnosticCode) {
            result.code = code2;
          } else {
            result.code = code2.value;
            result.codeDescription = { href: code2.target };
          }
        } else {
          result.code = code2;
        }
        if (Is.number(item.severity)) {
          result.severity = asDiagnosticSeverity(item.severity);
        }
        if (Array.isArray(item.tags)) {
          result.tags = asDiagnosticTags(item.tags);
        }
        if (item.relatedInformation) {
          result.relatedInformation = asRelatedInformations(item.relatedInformation);
        }
        if (item.source) {
          result.source = item.source;
        }
        return result;
      }
      function asDiagnostics(items, token) {
        if (items === void 0 || items === null) {
          return items;
        }
        return async.map(items, asDiagnostic, token);
      }
      function asDiagnosticsSync(items) {
        if (items === void 0 || items === null) {
          return items;
        }
        return items.map(asDiagnostic);
      }
      function asDocumentation(format, documentation) {
        switch (format) {
          case "$string":
            return documentation;
          case proto.MarkupKind.PlainText:
            return { kind: format, value: documentation };
          case proto.MarkupKind.Markdown:
            return { kind: format, value: documentation.value };
          default:
            return `Unsupported Markup content received. Kind is: ${format}`;
        }
      }
      function asCompletionItemTag(tag) {
        switch (tag) {
          case code.CompletionItemTag.Deprecated:
            return proto.CompletionItemTag.Deprecated;
        }
        return void 0;
      }
      function asCompletionItemTags(tags) {
        if (tags === void 0) {
          return tags;
        }
        const result = [];
        for (let tag of tags) {
          const converted = asCompletionItemTag(tag);
          if (converted !== void 0) {
            result.push(converted);
          }
        }
        return result;
      }
      function asCompletionItemKind(value, original) {
        if (original !== void 0) {
          return original;
        }
        return value + 1;
      }
      function asCompletionItem(item, labelDetailsSupport = false) {
        let label;
        let labelDetails;
        if (Is.string(item.label)) {
          label = item.label;
        } else {
          label = item.label.label;
          if (labelDetailsSupport && (item.label.detail !== void 0 || item.label.description !== void 0)) {
            labelDetails = { detail: item.label.detail, description: item.label.description };
          }
        }
        let result = { label };
        if (labelDetails !== void 0) {
          result.labelDetails = labelDetails;
        }
        let protocolItem = item instanceof protocolCompletionItem_1.default ? item : void 0;
        if (item.detail) {
          result.detail = item.detail;
        }
        if (item.documentation) {
          if (!protocolItem || protocolItem.documentationFormat === "$string") {
            result.documentation = item.documentation;
          } else {
            result.documentation = asDocumentation(protocolItem.documentationFormat, item.documentation);
          }
        }
        if (item.filterText) {
          result.filterText = item.filterText;
        }
        fillPrimaryInsertText(result, item);
        if (Is.number(item.kind)) {
          result.kind = asCompletionItemKind(item.kind, protocolItem && protocolItem.originalItemKind);
        }
        if (item.sortText) {
          result.sortText = item.sortText;
        }
        if (item.additionalTextEdits) {
          result.additionalTextEdits = asTextEdits(item.additionalTextEdits);
        }
        if (item.commitCharacters) {
          result.commitCharacters = item.commitCharacters.slice();
        }
        if (item.command) {
          result.command = asCommand(item.command);
        }
        if (item.preselect === true || item.preselect === false) {
          result.preselect = item.preselect;
        }
        const tags = asCompletionItemTags(item.tags);
        if (protocolItem) {
          if (protocolItem.data !== void 0) {
            result.data = protocolItem.data;
          }
          if (protocolItem.deprecated === true || protocolItem.deprecated === false) {
            if (protocolItem.deprecated === true && tags !== void 0 && tags.length > 0) {
              const index = tags.indexOf(code.CompletionItemTag.Deprecated);
              if (index !== -1) {
                tags.splice(index, 1);
              }
            }
            result.deprecated = protocolItem.deprecated;
          }
          if (protocolItem.insertTextMode !== void 0) {
            result.insertTextMode = protocolItem.insertTextMode;
          }
        }
        if (tags !== void 0 && tags.length > 0) {
          result.tags = tags;
        }
        if (result.insertTextMode === void 0 && item.keepWhitespace === true) {
          result.insertTextMode = proto.InsertTextMode.adjustIndentation;
        }
        return result;
      }
      function fillPrimaryInsertText(target, source) {
        let format = proto.InsertTextFormat.PlainText;
        let text = void 0;
        let range = void 0;
        if (source.textEdit) {
          text = source.textEdit.newText;
          range = source.textEdit.range;
        } else if (source.insertText instanceof code.SnippetString) {
          format = proto.InsertTextFormat.Snippet;
          text = source.insertText.value;
        } else {
          text = source.insertText;
        }
        if (source.range) {
          range = source.range;
        }
        target.insertTextFormat = format;
        if (source.fromEdit && text !== void 0 && range !== void 0) {
          target.textEdit = asCompletionTextEdit(text, range);
        } else {
          target.insertText = text;
        }
      }
      function asCompletionTextEdit(newText, range) {
        if (InsertReplaceRange.is(range)) {
          return proto.InsertReplaceEdit.create(newText, asRange(range.inserting), asRange(range.replacing));
        } else {
          return { newText, range: asRange(range) };
        }
      }
      function asTextEdit(edit) {
        return { range: asRange(edit.range), newText: edit.newText };
      }
      function asTextEdits(edits) {
        if (edits === void 0 || edits === null) {
          return edits;
        }
        return edits.map(asTextEdit);
      }
      function asSymbolKind(item) {
        if (item <= code.SymbolKind.TypeParameter) {
          return item + 1;
        }
        return proto.SymbolKind.Property;
      }
      function asSymbolTag(item) {
        return item;
      }
      function asSymbolTags(items) {
        return items.map(asSymbolTag);
      }
      function asReferenceParams(textDocument, position, options) {
        return {
          textDocument: asTextDocumentIdentifier(textDocument),
          position: asWorkerPosition(position),
          context: { includeDeclaration: options.includeDeclaration }
        };
      }
      async function asCodeAction(item, token) {
        let result = proto.CodeAction.create(item.title);
        if (item instanceof protocolCodeAction_1.default && item.data !== void 0) {
          result.data = item.data;
        }
        if (item.kind !== void 0) {
          result.kind = asCodeActionKind(item.kind);
        }
        if (item.diagnostics !== void 0) {
          result.diagnostics = await asDiagnostics(item.diagnostics, token);
        }
        if (item.edit !== void 0) {
          throw new Error(`VS Code code actions can only be converted to a protocol code action without an edit.`);
        }
        if (item.command !== void 0) {
          result.command = asCommand(item.command);
        }
        if (item.isPreferred !== void 0) {
          result.isPreferred = item.isPreferred;
        }
        if (item.disabled !== void 0) {
          result.disabled = { reason: item.disabled.reason };
        }
        return result;
      }
      function asCodeActionSync(item) {
        let result = proto.CodeAction.create(item.title);
        if (item instanceof protocolCodeAction_1.default && item.data !== void 0) {
          result.data = item.data;
        }
        if (item.kind !== void 0) {
          result.kind = asCodeActionKind(item.kind);
        }
        if (item.diagnostics !== void 0) {
          result.diagnostics = asDiagnosticsSync(item.diagnostics);
        }
        if (item.edit !== void 0) {
          throw new Error(`VS Code code actions can only be converted to a protocol code action without an edit.`);
        }
        if (item.command !== void 0) {
          result.command = asCommand(item.command);
        }
        if (item.isPreferred !== void 0) {
          result.isPreferred = item.isPreferred;
        }
        if (item.disabled !== void 0) {
          result.disabled = { reason: item.disabled.reason };
        }
        return result;
      }
      async function asCodeActionContext(context, token) {
        if (context === void 0 || context === null) {
          return context;
        }
        let only;
        if (context.only && Is.string(context.only.value)) {
          only = [context.only.value];
        }
        return proto.CodeActionContext.create(await asDiagnostics(context.diagnostics, token), only, asCodeActionTriggerKind(context.triggerKind));
      }
      function asCodeActionContextSync(context) {
        if (context === void 0 || context === null) {
          return context;
        }
        let only;
        if (context.only && Is.string(context.only.value)) {
          only = [context.only.value];
        }
        return proto.CodeActionContext.create(asDiagnosticsSync(context.diagnostics), only, asCodeActionTriggerKind(context.triggerKind));
      }
      function asCodeActionTriggerKind(kind) {
        switch (kind) {
          case code.CodeActionTriggerKind.Invoke:
            return proto.CodeActionTriggerKind.Invoked;
          case code.CodeActionTriggerKind.Automatic:
            return proto.CodeActionTriggerKind.Automatic;
          default:
            return void 0;
        }
      }
      function asCodeActionKind(item) {
        if (item === void 0 || item === null) {
          return void 0;
        }
        return item.value;
      }
      function asInlineValueContext(context) {
        if (context === void 0 || context === null) {
          return context;
        }
        return proto.InlineValueContext.create(context.frameId, asRange(context.stoppedLocation));
      }
      function asInlineCompletionParams(document, position, context) {
        return {
          context: proto.InlineCompletionContext.create(context.triggerKind, context.selectedCompletionInfo),
          textDocument: asTextDocumentIdentifier(document),
          position: asPosition(position)
        };
      }
      function asCommand(item) {
        let result = proto.Command.create(item.title, item.command);
        if (item.arguments) {
          result.arguments = item.arguments;
        }
        return result;
      }
      function asCodeLens(item) {
        let result = proto.CodeLens.create(asRange(item.range));
        if (item.command) {
          result.command = asCommand(item.command);
        }
        if (item instanceof protocolCodeLens_1.default) {
          if (item.data) {
            result.data = item.data;
          }
        }
        return result;
      }
      function asFormattingOptions(options, fileOptions) {
        const result = { tabSize: options.tabSize, insertSpaces: options.insertSpaces };
        if (fileOptions.trimTrailingWhitespace) {
          result.trimTrailingWhitespace = true;
        }
        if (fileOptions.trimFinalNewlines) {
          result.trimFinalNewlines = true;
        }
        if (fileOptions.insertFinalNewline) {
          result.insertFinalNewline = true;
        }
        return result;
      }
      function asDocumentSymbolParams(textDocument) {
        return {
          textDocument: asTextDocumentIdentifier(textDocument)
        };
      }
      function asCodeLensParams(textDocument) {
        return {
          textDocument: asTextDocumentIdentifier(textDocument)
        };
      }
      function asDocumentLink(item) {
        let result = proto.DocumentLink.create(asRange(item.range));
        if (item.target) {
          result.target = asUri(item.target);
        }
        if (item.tooltip !== void 0) {
          result.tooltip = item.tooltip;
        }
        let protocolItem = item instanceof protocolDocumentLink_1.default ? item : void 0;
        if (protocolItem && protocolItem.data) {
          result.data = protocolItem.data;
        }
        return result;
      }
      function asDocumentLinkParams(textDocument) {
        return {
          textDocument: asTextDocumentIdentifier(textDocument)
        };
      }
      function asCallHierarchyItem(value) {
        const result = {
          name: value.name,
          kind: asSymbolKind(value.kind),
          uri: asUri(value.uri),
          range: asRange(value.range),
          selectionRange: asRange(value.selectionRange)
        };
        if (value.detail !== void 0 && value.detail.length > 0) {
          result.detail = value.detail;
        }
        if (value.tags !== void 0) {
          result.tags = asSymbolTags(value.tags);
        }
        if (value instanceof protocolCallHierarchyItem_1.default && value.data !== void 0) {
          result.data = value.data;
        }
        return result;
      }
      function asTypeHierarchyItem(value) {
        const result = {
          name: value.name,
          kind: asSymbolKind(value.kind),
          uri: asUri(value.uri),
          range: asRange(value.range),
          selectionRange: asRange(value.selectionRange)
        };
        if (value.detail !== void 0 && value.detail.length > 0) {
          result.detail = value.detail;
        }
        if (value.tags !== void 0) {
          result.tags = asSymbolTags(value.tags);
        }
        if (value instanceof protocolTypeHierarchyItem_1.default && value.data !== void 0) {
          result.data = value.data;
        }
        return result;
      }
      function asWorkspaceSymbol(item) {
        const result = item instanceof protocolWorkspaceSymbol_1.default ? { name: item.name, kind: asSymbolKind(item.kind), location: item.hasRange ? asLocation(item.location) : { uri: _uriConverter(item.location.uri) }, data: item.data } : { name: item.name, kind: asSymbolKind(item.kind), location: asLocation(item.location) };
        if (item.tags !== void 0) {
          result.tags = asSymbolTags(item.tags);
        }
        if (item.containerName !== "") {
          result.containerName = item.containerName;
        }
        return result;
      }
      function asInlayHint(item) {
        const label = typeof item.label === "string" ? item.label : item.label.map(asInlayHintLabelPart);
        const result = proto.InlayHint.create(asPosition(item.position), label);
        if (item.kind !== void 0) {
          result.kind = item.kind;
        }
        if (item.textEdits !== void 0) {
          result.textEdits = asTextEdits(item.textEdits);
        }
        if (item.tooltip !== void 0) {
          result.tooltip = asTooltip(item.tooltip);
        }
        if (item.paddingLeft !== void 0) {
          result.paddingLeft = item.paddingLeft;
        }
        if (item.paddingRight !== void 0) {
          result.paddingRight = item.paddingRight;
        }
        if (item instanceof protocolInlayHint_1.default && item.data !== void 0) {
          result.data = item.data;
        }
        return result;
      }
      function asInlayHintLabelPart(item) {
        const result = proto.InlayHintLabelPart.create(item.value);
        if (item.location !== void 0) {
          result.location = asLocation(item.location);
        }
        if (item.command !== void 0) {
          result.command = asCommand(item.command);
        }
        if (item.tooltip !== void 0) {
          result.tooltip = asTooltip(item.tooltip);
        }
        return result;
      }
      function asTooltip(value) {
        if (typeof value === "string") {
          return value;
        }
        const result = {
          kind: proto.MarkupKind.Markdown,
          value: value.value
        };
        return result;
      }
      return {
        asUri,
        asTextDocumentIdentifier,
        asTextDocumentItem,
        asVersionedTextDocumentIdentifier,
        asOpenTextDocumentParams,
        asChangeTextDocumentParams,
        asCloseTextDocumentParams,
        asSaveTextDocumentParams,
        asWillSaveTextDocumentParams,
        asDidCreateFilesParams,
        asDidRenameFilesParams,
        asDidDeleteFilesParams,
        asWillCreateFilesParams,
        asWillRenameFilesParams,
        asWillDeleteFilesParams,
        asTextDocumentPositionParams,
        asCompletionParams,
        asSignatureHelpParams,
        asWorkerPosition,
        asRange,
        asRanges,
        asPosition,
        asPositions,
        asPositionsSync,
        asLocation,
        asDiagnosticSeverity,
        asDiagnosticTag,
        asDiagnostic,
        asDiagnostics,
        asDiagnosticsSync,
        asCompletionItem,
        asTextEdit,
        asSymbolKind,
        asSymbolTag,
        asSymbolTags,
        asReferenceParams,
        asCodeAction,
        asCodeActionSync,
        asCodeActionContext,
        asCodeActionContextSync,
        asInlineValueContext,
        asCommand,
        asCodeLens,
        asFormattingOptions,
        asDocumentSymbolParams,
        asCodeLensParams,
        asDocumentLink,
        asDocumentLinkParams,
        asCallHierarchyItem,
        asTypeHierarchyItem,
        asInlayHint,
        asWorkspaceSymbol,
        asInlineCompletionParams
      };
    }
    exports2.createConverter = createConverter;
  }
});

// node_modules/vscode-languageclient/lib/common/protocolConverter.js
var require_protocolConverter = __commonJS({
  "node_modules/vscode-languageclient/lib/common/protocolConverter.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.createConverter = void 0;
    var code = require("vscode");
    var ls = require_main3();
    var Is = require_is();
    var async = require_async();
    var protocolCompletionItem_1 = require_protocolCompletionItem();
    var protocolCodeLens_1 = require_protocolCodeLens();
    var protocolDocumentLink_1 = require_protocolDocumentLink();
    var protocolCodeAction_1 = require_protocolCodeAction();
    var protocolDiagnostic_1 = require_protocolDiagnostic();
    var protocolCallHierarchyItem_1 = require_protocolCallHierarchyItem();
    var protocolTypeHierarchyItem_1 = require_protocolTypeHierarchyItem();
    var protocolWorkspaceSymbol_1 = require_protocolWorkspaceSymbol();
    var protocolInlayHint_1 = require_protocolInlayHint();
    var vscode_languageserver_protocol_1 = require_main3();
    var CodeBlock;
    (function(CodeBlock2) {
      function is(value) {
        let candidate = value;
        return candidate && Is.string(candidate.language) && Is.string(candidate.value);
      }
      CodeBlock2.is = is;
    })(CodeBlock || (CodeBlock = {}));
    function createConverter(uriConverter, trustMarkdown, supportHtml) {
      const nullConverter = (value) => code.Uri.parse(value);
      const _uriConverter = uriConverter || nullConverter;
      function asUri(value) {
        return _uriConverter(value);
      }
      function asDocumentSelector(selector) {
        const result = [];
        for (const filter of selector) {
          if (typeof filter === "string") {
            result.push(filter);
          } else if (vscode_languageserver_protocol_1.NotebookCellTextDocumentFilter.is(filter)) {
            if (typeof filter.notebook === "string") {
              result.push({ notebookType: filter.notebook, language: filter.language });
            } else {
              const notebookType = filter.notebook.notebookType ?? "*";
              result.push({ notebookType, scheme: filter.notebook.scheme, pattern: filter.notebook.pattern, language: filter.language });
            }
          } else if (vscode_languageserver_protocol_1.TextDocumentFilter.is(filter)) {
            result.push({ language: filter.language, scheme: filter.scheme, pattern: filter.pattern });
          }
        }
        return result;
      }
      async function asDiagnostics(diagnostics, token) {
        return async.map(diagnostics, asDiagnostic, token);
      }
      function asDiagnosticsSync(diagnostics) {
        const result = new Array(diagnostics.length);
        for (let i = 0; i < diagnostics.length; i++) {
          result[i] = asDiagnostic(diagnostics[i]);
        }
        return result;
      }
      function asDiagnostic(diagnostic) {
        let result = new protocolDiagnostic_1.ProtocolDiagnostic(asRange(diagnostic.range), diagnostic.message, asDiagnosticSeverity(diagnostic.severity), diagnostic.data);
        if (diagnostic.code !== void 0) {
          if (typeof diagnostic.code === "string" || typeof diagnostic.code === "number") {
            if (ls.CodeDescription.is(diagnostic.codeDescription)) {
              result.code = {
                value: diagnostic.code,
                target: asUri(diagnostic.codeDescription.href)
              };
            } else {
              result.code = diagnostic.code;
            }
          } else if (protocolDiagnostic_1.DiagnosticCode.is(diagnostic.code)) {
            result.hasDiagnosticCode = true;
            const diagnosticCode = diagnostic.code;
            result.code = {
              value: diagnosticCode.value,
              target: asUri(diagnosticCode.target)
            };
          }
        }
        if (diagnostic.source) {
          result.source = diagnostic.source;
        }
        if (diagnostic.relatedInformation) {
          result.relatedInformation = asRelatedInformation(diagnostic.relatedInformation);
        }
        if (Array.isArray(diagnostic.tags)) {
          result.tags = asDiagnosticTags(diagnostic.tags);
        }
        return result;
      }
      function asRelatedInformation(relatedInformation) {
        const result = new Array(relatedInformation.length);
        for (let i = 0; i < relatedInformation.length; i++) {
          const info = relatedInformation[i];
          result[i] = new code.DiagnosticRelatedInformation(asLocation(info.location), info.message);
        }
        return result;
      }
      function asDiagnosticTags(tags) {
        if (!tags) {
          return void 0;
        }
        let result = [];
        for (let tag of tags) {
          let converted = asDiagnosticTag(tag);
          if (converted !== void 0) {
            result.push(converted);
          }
        }
        return result.length > 0 ? result : void 0;
      }
      function asDiagnosticTag(tag) {
        switch (tag) {
          case ls.DiagnosticTag.Unnecessary:
            return code.DiagnosticTag.Unnecessary;
          case ls.DiagnosticTag.Deprecated:
            return code.DiagnosticTag.Deprecated;
          default:
            return void 0;
        }
      }
      function asPosition(value) {
        return value ? new code.Position(value.line, value.character) : void 0;
      }
      function asRange(value) {
        return value ? new code.Range(value.start.line, value.start.character, value.end.line, value.end.character) : void 0;
      }
      async function asRanges(items, token) {
        return async.map(items, (range) => {
          return new code.Range(range.start.line, range.start.character, range.end.line, range.end.character);
        }, token);
      }
      function asDiagnosticSeverity(value) {
        if (value === void 0 || value === null) {
          return code.DiagnosticSeverity.Error;
        }
        switch (value) {
          case ls.DiagnosticSeverity.Error:
            return code.DiagnosticSeverity.Error;
          case ls.DiagnosticSeverity.Warning:
            return code.DiagnosticSeverity.Warning;
          case ls.DiagnosticSeverity.Information:
            return code.DiagnosticSeverity.Information;
          case ls.DiagnosticSeverity.Hint:
            return code.DiagnosticSeverity.Hint;
        }
        return code.DiagnosticSeverity.Error;
      }
      function asHoverContent(value) {
        if (Is.string(value)) {
          return asMarkdownString(value);
        } else if (CodeBlock.is(value)) {
          let result = asMarkdownString();
          return result.appendCodeblock(value.value, value.language);
        } else if (Array.isArray(value)) {
          let result = [];
          for (let element of value) {
            let item = asMarkdownString();
            if (CodeBlock.is(element)) {
              item.appendCodeblock(element.value, element.language);
            } else {
              item.appendMarkdown(element);
            }
            result.push(item);
          }
          return result;
        } else {
          return asMarkdownString(value);
        }
      }
      function asDocumentation(value) {
        if (Is.string(value)) {
          return value;
        } else {
          switch (value.kind) {
            case ls.MarkupKind.Markdown:
              return asMarkdownString(value.value);
            case ls.MarkupKind.PlainText:
              return value.value;
            default:
              return `Unsupported Markup content received. Kind is: ${value.kind}`;
          }
        }
      }
      function asMarkdownString(value) {
        let result;
        if (value === void 0 || typeof value === "string") {
          result = new code.MarkdownString(value);
        } else {
          switch (value.kind) {
            case ls.MarkupKind.Markdown:
              result = new code.MarkdownString(value.value);
              break;
            case ls.MarkupKind.PlainText:
              result = new code.MarkdownString();
              result.appendText(value.value);
              break;
            default:
              result = new code.MarkdownString();
              result.appendText(`Unsupported Markup content received. Kind is: ${value.kind}`);
              break;
          }
        }
        result.isTrusted = trustMarkdown;
        result.supportHtml = supportHtml;
        return result;
      }
      function asHover(hover) {
        if (!hover) {
          return void 0;
        }
        return new code.Hover(asHoverContent(hover.contents), asRange(hover.range));
      }
      async function asCompletionResult(value, allCommitCharacters, token) {
        if (!value) {
          return void 0;
        }
        if (Array.isArray(value)) {
          return async.map(value, (item) => asCompletionItem(item, allCommitCharacters), token);
        }
        const list = value;
        const { defaultRange, commitCharacters } = getCompletionItemDefaults(list, allCommitCharacters);
        const converted = await async.map(list.items, (item) => {
          return asCompletionItem(item, commitCharacters, defaultRange, list.itemDefaults?.insertTextMode, list.itemDefaults?.insertTextFormat, list.itemDefaults?.data);
        }, token);
        return new code.CompletionList(converted, list.isIncomplete);
      }
      function getCompletionItemDefaults(list, allCommitCharacters) {
        const rangeDefaults = list.itemDefaults?.editRange;
        const commitCharacters = list.itemDefaults?.commitCharacters ?? allCommitCharacters;
        return ls.Range.is(rangeDefaults) ? { defaultRange: asRange(rangeDefaults), commitCharacters } : rangeDefaults !== void 0 ? { defaultRange: { inserting: asRange(rangeDefaults.insert), replacing: asRange(rangeDefaults.replace) }, commitCharacters } : { defaultRange: void 0, commitCharacters };
      }
      function asCompletionItemKind(value) {
        if (ls.CompletionItemKind.Text <= value && value <= ls.CompletionItemKind.TypeParameter) {
          return [value - 1, void 0];
        }
        return [code.CompletionItemKind.Text, value];
      }
      function asCompletionItemTag(tag) {
        switch (tag) {
          case ls.CompletionItemTag.Deprecated:
            return code.CompletionItemTag.Deprecated;
        }
        return void 0;
      }
      function asCompletionItemTags(tags) {
        if (tags === void 0 || tags === null) {
          return [];
        }
        const result = [];
        for (const tag of tags) {
          const converted = asCompletionItemTag(tag);
          if (converted !== void 0) {
            result.push(converted);
          }
        }
        return result;
      }
      function asCompletionItem(item, defaultCommitCharacters, defaultRange, defaultInsertTextMode, defaultInsertTextFormat, defaultData) {
        const tags = asCompletionItemTags(item.tags);
        const label = asCompletionItemLabel(item);
        const result = new protocolCompletionItem_1.default(label);
        if (item.detail) {
          result.detail = item.detail;
        }
        if (item.documentation) {
          result.documentation = asDocumentation(item.documentation);
          result.documentationFormat = Is.string(item.documentation) ? "$string" : item.documentation.kind;
        }
        if (item.filterText) {
          result.filterText = item.filterText;
        }
        const insertText = asCompletionInsertText(item, defaultRange, defaultInsertTextFormat);
        if (insertText) {
          result.insertText = insertText.text;
          result.range = insertText.range;
          result.fromEdit = insertText.fromEdit;
        }
        if (Is.number(item.kind)) {
          let [itemKind, original] = asCompletionItemKind(item.kind);
          result.kind = itemKind;
          if (original) {
            result.originalItemKind = original;
          }
        }
        if (item.sortText) {
          result.sortText = item.sortText;
        }
        if (item.additionalTextEdits) {
          result.additionalTextEdits = asTextEditsSync(item.additionalTextEdits);
        }
        const commitCharacters = item.commitCharacters !== void 0 ? Is.stringArray(item.commitCharacters) ? item.commitCharacters : void 0 : defaultCommitCharacters;
        if (commitCharacters) {
          result.commitCharacters = commitCharacters.slice();
        }
        if (item.command) {
          result.command = asCommand(item.command);
        }
        if (item.deprecated === true || item.deprecated === false) {
          result.deprecated = item.deprecated;
          if (item.deprecated === true) {
            tags.push(code.CompletionItemTag.Deprecated);
          }
        }
        if (item.preselect === true || item.preselect === false) {
          result.preselect = item.preselect;
        }
        const data = item.data ?? defaultData;
        if (data !== void 0) {
          result.data = data;
        }
        if (tags.length > 0) {
          result.tags = tags;
        }
        const insertTextMode = item.insertTextMode ?? defaultInsertTextMode;
        if (insertTextMode !== void 0) {
          result.insertTextMode = insertTextMode;
          if (insertTextMode === ls.InsertTextMode.asIs) {
            result.keepWhitespace = true;
          }
        }
        return result;
      }
      function asCompletionItemLabel(item) {
        if (ls.CompletionItemLabelDetails.is(item.labelDetails)) {
          return {
            label: item.label,
            detail: item.labelDetails.detail,
            description: item.labelDetails.description
          };
        } else {
          return item.label;
        }
      }
      function asCompletionInsertText(item, defaultRange, defaultInsertTextFormat) {
        const insertTextFormat = item.insertTextFormat ?? defaultInsertTextFormat;
        if (item.textEdit !== void 0 || defaultRange !== void 0) {
          const [range, newText] = item.textEdit !== void 0 ? getCompletionRangeAndText(item.textEdit) : [defaultRange, item.textEditText ?? item.label];
          if (insertTextFormat === ls.InsertTextFormat.Snippet) {
            return { text: new code.SnippetString(newText), range, fromEdit: true };
          } else {
            return { text: newText, range, fromEdit: true };
          }
        } else if (item.insertText) {
          if (insertTextFormat === ls.InsertTextFormat.Snippet) {
            return { text: new code.SnippetString(item.insertText), fromEdit: false };
          } else {
            return { text: item.insertText, fromEdit: false };
          }
        } else {
          return void 0;
        }
      }
      function getCompletionRangeAndText(value) {
        if (ls.InsertReplaceEdit.is(value)) {
          return [{ inserting: asRange(value.insert), replacing: asRange(value.replace) }, value.newText];
        } else {
          return [asRange(value.range), value.newText];
        }
      }
      function asTextEdit(edit) {
        if (!edit) {
          return void 0;
        }
        return new code.TextEdit(asRange(edit.range), edit.newText);
      }
      async function asTextEdits(items, token) {
        if (!items) {
          return void 0;
        }
        return async.map(items, asTextEdit, token);
      }
      function asTextEditsSync(items) {
        if (!items) {
          return void 0;
        }
        const result = new Array(items.length);
        for (let i = 0; i < items.length; i++) {
          result[i] = asTextEdit(items[i]);
        }
        return result;
      }
      async function asSignatureHelp(item, token) {
        if (!item) {
          return void 0;
        }
        let result = new code.SignatureHelp();
        if (Is.number(item.activeSignature)) {
          result.activeSignature = item.activeSignature;
        } else {
          result.activeSignature = 0;
        }
        if (Is.number(item.activeParameter)) {
          result.activeParameter = item.activeParameter;
        } else {
          result.activeParameter = 0;
        }
        if (item.signatures) {
          result.signatures = await asSignatureInformations(item.signatures, token);
        }
        return result;
      }
      async function asSignatureInformations(items, token) {
        return async.mapAsync(items, asSignatureInformation, token);
      }
      async function asSignatureInformation(item, token) {
        let result = new code.SignatureInformation(item.label);
        if (item.documentation !== void 0) {
          result.documentation = asDocumentation(item.documentation);
        }
        if (item.parameters !== void 0) {
          result.parameters = await asParameterInformations(item.parameters, token);
        }
        if (item.activeParameter !== void 0) {
          result.activeParameter = item.activeParameter;
        }
        {
          return result;
        }
      }
      function asParameterInformations(items, token) {
        return async.map(items, asParameterInformation, token);
      }
      function asParameterInformation(item) {
        let result = new code.ParameterInformation(item.label);
        if (item.documentation) {
          result.documentation = asDocumentation(item.documentation);
        }
        return result;
      }
      function asLocation(item) {
        return item ? new code.Location(_uriConverter(item.uri), asRange(item.range)) : void 0;
      }
      async function asDeclarationResult(item, token) {
        if (!item) {
          return void 0;
        }
        return asLocationResult(item, token);
      }
      async function asDefinitionResult(item, token) {
        if (!item) {
          return void 0;
        }
        return asLocationResult(item, token);
      }
      function asLocationLink(item) {
        if (!item) {
          return void 0;
        }
        let result = {
          targetUri: _uriConverter(item.targetUri),
          targetRange: asRange(item.targetRange),
          originSelectionRange: asRange(item.originSelectionRange),
          targetSelectionRange: asRange(item.targetSelectionRange)
        };
        if (!result.targetSelectionRange) {
          throw new Error(`targetSelectionRange must not be undefined or null`);
        }
        return result;
      }
      async function asLocationResult(item, token) {
        if (!item) {
          return void 0;
        }
        if (Is.array(item)) {
          if (item.length === 0) {
            return [];
          } else if (ls.LocationLink.is(item[0])) {
            const links = item;
            return async.map(links, asLocationLink, token);
          } else {
            const locations = item;
            return async.map(locations, asLocation, token);
          }
        } else if (ls.LocationLink.is(item)) {
          return [asLocationLink(item)];
        } else {
          return asLocation(item);
        }
      }
      async function asReferences(values, token) {
        if (!values) {
          return void 0;
        }
        return async.map(values, asLocation, token);
      }
      async function asDocumentHighlights(values, token) {
        if (!values) {
          return void 0;
        }
        return async.map(values, asDocumentHighlight, token);
      }
      function asDocumentHighlight(item) {
        let result = new code.DocumentHighlight(asRange(item.range));
        if (Is.number(item.kind)) {
          result.kind = asDocumentHighlightKind(item.kind);
        }
        return result;
      }
      function asDocumentHighlightKind(item) {
        switch (item) {
          case ls.DocumentHighlightKind.Text:
            return code.DocumentHighlightKind.Text;
          case ls.DocumentHighlightKind.Read:
            return code.DocumentHighlightKind.Read;
          case ls.DocumentHighlightKind.Write:
            return code.DocumentHighlightKind.Write;
        }
        return code.DocumentHighlightKind.Text;
      }
      async function asSymbolInformations(values, token) {
        if (!values) {
          return void 0;
        }
        return async.map(values, asSymbolInformation, token);
      }
      function asSymbolKind(item) {
        if (item <= ls.SymbolKind.TypeParameter) {
          return item - 1;
        }
        return code.SymbolKind.Property;
      }
      function asSymbolTag(value) {
        switch (value) {
          case ls.SymbolTag.Deprecated:
            return code.SymbolTag.Deprecated;
          default:
            return void 0;
        }
      }
      function asSymbolTags(items) {
        if (items === void 0 || items === null) {
          return void 0;
        }
        const result = [];
        for (const item of items) {
          const converted = asSymbolTag(item);
          if (converted !== void 0) {
            result.push(converted);
          }
        }
        return result.length === 0 ? void 0 : result;
      }
      function asSymbolInformation(item) {
        const data = item.data;
        const location = item.location;
        const result = location.range === void 0 || data !== void 0 ? new protocolWorkspaceSymbol_1.default(item.name, asSymbolKind(item.kind), item.containerName ?? "", location.range === void 0 ? _uriConverter(location.uri) : new code.Location(_uriConverter(item.location.uri), asRange(location.range)), data) : new code.SymbolInformation(item.name, asSymbolKind(item.kind), item.containerName ?? "", new code.Location(_uriConverter(item.location.uri), asRange(location.range)));
        fillTags(result, item);
        return result;
      }
      async function asDocumentSymbols(values, token) {
        if (values === void 0 || values === null) {
          return void 0;
        }
        return async.map(values, asDocumentSymbol, token);
      }
      function asDocumentSymbol(value) {
        let result = new code.DocumentSymbol(value.name, value.detail || "", asSymbolKind(value.kind), asRange(value.range), asRange(value.selectionRange));
        fillTags(result, value);
        if (value.children !== void 0 && value.children.length > 0) {
          let children = [];
          for (let child of value.children) {
            children.push(asDocumentSymbol(child));
          }
          result.children = children;
        }
        return result;
      }
      function fillTags(result, value) {
        result.tags = asSymbolTags(value.tags);
        if (value.deprecated) {
          if (!result.tags) {
            result.tags = [code.SymbolTag.Deprecated];
          } else {
            if (!result.tags.includes(code.SymbolTag.Deprecated)) {
              result.tags = result.tags.concat(code.SymbolTag.Deprecated);
            }
          }
        }
      }
      function asCommand(item) {
        let result = { title: item.title, command: item.command };
        if (item.arguments) {
          result.arguments = item.arguments;
        }
        return result;
      }
      async function asCommands(items, token) {
        if (!items) {
          return void 0;
        }
        return async.map(items, asCommand, token);
      }
      const kindMapping = /* @__PURE__ */ new Map();
      kindMapping.set(ls.CodeActionKind.Empty, code.CodeActionKind.Empty);
      kindMapping.set(ls.CodeActionKind.QuickFix, code.CodeActionKind.QuickFix);
      kindMapping.set(ls.CodeActionKind.Refactor, code.CodeActionKind.Refactor);
      kindMapping.set(ls.CodeActionKind.RefactorExtract, code.CodeActionKind.RefactorExtract);
      kindMapping.set(ls.CodeActionKind.RefactorInline, code.CodeActionKind.RefactorInline);
      kindMapping.set(ls.CodeActionKind.RefactorRewrite, code.CodeActionKind.RefactorRewrite);
      kindMapping.set(ls.CodeActionKind.Source, code.CodeActionKind.Source);
      kindMapping.set(ls.CodeActionKind.SourceOrganizeImports, code.CodeActionKind.SourceOrganizeImports);
      function asCodeActionKind(item) {
        if (item === void 0 || item === null) {
          return void 0;
        }
        let result = kindMapping.get(item);
        if (result) {
          return result;
        }
        let parts = item.split(".");
        result = code.CodeActionKind.Empty;
        for (let part of parts) {
          result = result.append(part);
        }
        return result;
      }
      function asCodeActionKinds(items) {
        if (items === void 0 || items === null) {
          return void 0;
        }
        return items.map((kind) => asCodeActionKind(kind));
      }
      async function asCodeAction(item, token) {
        if (item === void 0 || item === null) {
          return void 0;
        }
        let result = new protocolCodeAction_1.default(item.title, item.data);
        if (item.kind !== void 0) {
          result.kind = asCodeActionKind(item.kind);
        }
        if (item.diagnostics !== void 0) {
          result.diagnostics = asDiagnosticsSync(item.diagnostics);
        }
        if (item.edit !== void 0) {
          result.edit = await asWorkspaceEdit(item.edit, token);
        }
        if (item.command !== void 0) {
          result.command = asCommand(item.command);
        }
        if (item.isPreferred !== void 0) {
          result.isPreferred = item.isPreferred;
        }
        if (item.disabled !== void 0) {
          result.disabled = { reason: item.disabled.reason };
        }
        return result;
      }
      function asCodeActionResult(items, token) {
        return async.mapAsync(items, async (item) => {
          if (ls.Command.is(item)) {
            return asCommand(item);
          } else {
            return asCodeAction(item, token);
          }
        }, token);
      }
      function asCodeLens(item) {
        if (!item) {
          return void 0;
        }
        let result = new protocolCodeLens_1.default(asRange(item.range));
        if (item.command) {
          result.command = asCommand(item.command);
        }
        if (item.data !== void 0 && item.data !== null) {
          result.data = item.data;
        }
        return result;
      }
      async function asCodeLenses(items, token) {
        if (!items) {
          return void 0;
        }
        return async.map(items, asCodeLens, token);
      }
      async function asWorkspaceEdit(item, token) {
        if (!item) {
          return void 0;
        }
        const sharedMetadata = /* @__PURE__ */ new Map();
        if (item.changeAnnotations !== void 0) {
          const changeAnnotations = item.changeAnnotations;
          await async.forEach(Object.keys(changeAnnotations), (key) => {
            const metaData = asWorkspaceEditEntryMetadata(changeAnnotations[key]);
            sharedMetadata.set(key, metaData);
          }, token);
        }
        const asMetadata = (annotation) => {
          if (annotation === void 0) {
            return void 0;
          } else {
            return sharedMetadata.get(annotation);
          }
        };
        const result = new code.WorkspaceEdit();
        if (item.documentChanges) {
          const documentChanges = item.documentChanges;
          await async.forEach(documentChanges, (change) => {
            if (ls.CreateFile.is(change)) {
              result.createFile(_uriConverter(change.uri), change.options, asMetadata(change.annotationId));
            } else if (ls.RenameFile.is(change)) {
              result.renameFile(_uriConverter(change.oldUri), _uriConverter(change.newUri), change.options, asMetadata(change.annotationId));
            } else if (ls.DeleteFile.is(change)) {
              result.deleteFile(_uriConverter(change.uri), change.options, asMetadata(change.annotationId));
            } else if (ls.TextDocumentEdit.is(change)) {
              const uri = _uriConverter(change.textDocument.uri);
              for (const edit of change.edits) {
                if (ls.AnnotatedTextEdit.is(edit)) {
                  result.replace(uri, asRange(edit.range), edit.newText, asMetadata(edit.annotationId));
                } else {
                  result.replace(uri, asRange(edit.range), edit.newText);
                }
              }
            } else {
              throw new Error(`Unknown workspace edit change received:
${JSON.stringify(change, void 0, 4)}`);
            }
          }, token);
        } else if (item.changes) {
          const changes = item.changes;
          await async.forEach(Object.keys(changes), (key) => {
            result.set(_uriConverter(key), asTextEditsSync(changes[key]));
          }, token);
        }
        return result;
      }
      function asWorkspaceEditEntryMetadata(annotation) {
        if (annotation === void 0) {
          return void 0;
        }
        return { label: annotation.label, needsConfirmation: !!annotation.needsConfirmation, description: annotation.description };
      }
      function asDocumentLink(item) {
        let range = asRange(item.range);
        let target = item.target ? asUri(item.target) : void 0;
        let link = new protocolDocumentLink_1.default(range, target);
        if (item.tooltip !== void 0) {
          link.tooltip = item.tooltip;
        }
        if (item.data !== void 0 && item.data !== null) {
          link.data = item.data;
        }
        return link;
      }
      async function asDocumentLinks(items, token) {
        if (!items) {
          return void 0;
        }
        return async.map(items, asDocumentLink, token);
      }
      function asColor(color) {
        return new code.Color(color.red, color.green, color.blue, color.alpha);
      }
      function asColorInformation(ci) {
        return new code.ColorInformation(asRange(ci.range), asColor(ci.color));
      }
      async function asColorInformations(colorInformation, token) {
        if (!colorInformation) {
          return void 0;
        }
        return async.map(colorInformation, asColorInformation, token);
      }
      function asColorPresentation(cp) {
        let presentation = new code.ColorPresentation(cp.label);
        presentation.additionalTextEdits = asTextEditsSync(cp.additionalTextEdits);
        if (cp.textEdit) {
          presentation.textEdit = asTextEdit(cp.textEdit);
        }
        return presentation;
      }
      async function asColorPresentations(colorPresentations, token) {
        if (!colorPresentations) {
          return void 0;
        }
        return async.map(colorPresentations, asColorPresentation, token);
      }
      function asFoldingRangeKind(kind) {
        if (kind) {
          switch (kind) {
            case ls.FoldingRangeKind.Comment:
              return code.FoldingRangeKind.Comment;
            case ls.FoldingRangeKind.Imports:
              return code.FoldingRangeKind.Imports;
            case ls.FoldingRangeKind.Region:
              return code.FoldingRangeKind.Region;
          }
        }
        return void 0;
      }
      function asFoldingRange(r) {
        return new code.FoldingRange(r.startLine, r.endLine, asFoldingRangeKind(r.kind));
      }
      async function asFoldingRanges(foldingRanges, token) {
        if (!foldingRanges) {
          return void 0;
        }
        return async.map(foldingRanges, asFoldingRange, token);
      }
      function asSelectionRange(selectionRange) {
        return new code.SelectionRange(asRange(selectionRange.range), selectionRange.parent ? asSelectionRange(selectionRange.parent) : void 0);
      }
      async function asSelectionRanges(selectionRanges, token) {
        if (!Array.isArray(selectionRanges)) {
          return [];
        }
        return async.map(selectionRanges, asSelectionRange, token);
      }
      function asInlineValue(inlineValue) {
        if (ls.InlineValueText.is(inlineValue)) {
          return new code.InlineValueText(asRange(inlineValue.range), inlineValue.text);
        } else if (ls.InlineValueVariableLookup.is(inlineValue)) {
          return new code.InlineValueVariableLookup(asRange(inlineValue.range), inlineValue.variableName, inlineValue.caseSensitiveLookup);
        } else {
          return new code.InlineValueEvaluatableExpression(asRange(inlineValue.range), inlineValue.expression);
        }
      }
      async function asInlineValues(inlineValues, token) {
        if (!Array.isArray(inlineValues)) {
          return [];
        }
        return async.map(inlineValues, asInlineValue, token);
      }
      async function asInlayHint(value, token) {
        const label = typeof value.label === "string" ? value.label : await async.map(value.label, asInlayHintLabelPart, token);
        const result = new protocolInlayHint_1.default(asPosition(value.position), label);
        if (value.kind !== void 0) {
          result.kind = value.kind;
        }
        if (value.textEdits !== void 0) {
          result.textEdits = await asTextEdits(value.textEdits, token);
        }
        if (value.tooltip !== void 0) {
          result.tooltip = asTooltip(value.tooltip);
        }
        if (value.paddingLeft !== void 0) {
          result.paddingLeft = value.paddingLeft;
        }
        if (value.paddingRight !== void 0) {
          result.paddingRight = value.paddingRight;
        }
        if (value.data !== void 0) {
          result.data = value.data;
        }
        return result;
      }
      function asInlayHintLabelPart(part) {
        const result = new code.InlayHintLabelPart(part.value);
        if (part.location !== void 0) {
          result.location = asLocation(part.location);
        }
        if (part.tooltip !== void 0) {
          result.tooltip = asTooltip(part.tooltip);
        }
        if (part.command !== void 0) {
          result.command = asCommand(part.command);
        }
        return result;
      }
      function asTooltip(value) {
        if (typeof value === "string") {
          return value;
        }
        return asMarkdownString(value);
      }
      async function asInlayHints(values, token) {
        if (!Array.isArray(values)) {
          return void 0;
        }
        return async.mapAsync(values, asInlayHint, token);
      }
      function asCallHierarchyItem(item) {
        if (item === null) {
          return void 0;
        }
        const result = new protocolCallHierarchyItem_1.default(asSymbolKind(item.kind), item.name, item.detail || "", asUri(item.uri), asRange(item.range), asRange(item.selectionRange), item.data);
        if (item.tags !== void 0) {
          result.tags = asSymbolTags(item.tags);
        }
        return result;
      }
      async function asCallHierarchyItems(items, token) {
        if (items === null) {
          return void 0;
        }
        return async.map(items, asCallHierarchyItem, token);
      }
      async function asCallHierarchyIncomingCall(item, token) {
        return new code.CallHierarchyIncomingCall(asCallHierarchyItem(item.from), await asRanges(item.fromRanges, token));
      }
      async function asCallHierarchyIncomingCalls(items, token) {
        if (items === null) {
          return void 0;
        }
        return async.mapAsync(items, asCallHierarchyIncomingCall, token);
      }
      async function asCallHierarchyOutgoingCall(item, token) {
        return new code.CallHierarchyOutgoingCall(asCallHierarchyItem(item.to), await asRanges(item.fromRanges, token));
      }
      async function asCallHierarchyOutgoingCalls(items, token) {
        if (items === null) {
          return void 0;
        }
        return async.mapAsync(items, asCallHierarchyOutgoingCall, token);
      }
      async function asSemanticTokens(value, _token) {
        if (value === void 0 || value === null) {
          return void 0;
        }
        return new code.SemanticTokens(new Uint32Array(value.data), value.resultId);
      }
      function asSemanticTokensEdit(value) {
        return new code.SemanticTokensEdit(value.start, value.deleteCount, value.data !== void 0 ? new Uint32Array(value.data) : void 0);
      }
      async function asSemanticTokensEdits(value, _token) {
        if (value === void 0 || value === null) {
          return void 0;
        }
        return new code.SemanticTokensEdits(value.edits.map(asSemanticTokensEdit), value.resultId);
      }
      function asSemanticTokensLegend(value) {
        return value;
      }
      async function asLinkedEditingRanges(value, token) {
        if (value === null || value === void 0) {
          return void 0;
        }
        return new code.LinkedEditingRanges(await asRanges(value.ranges, token), asRegularExpression(value.wordPattern));
      }
      function asRegularExpression(value) {
        if (value === null || value === void 0) {
          return void 0;
        }
        return new RegExp(value);
      }
      function asTypeHierarchyItem(item) {
        if (item === null) {
          return void 0;
        }
        let result = new protocolTypeHierarchyItem_1.default(asSymbolKind(item.kind), item.name, item.detail || "", asUri(item.uri), asRange(item.range), asRange(item.selectionRange), item.data);
        if (item.tags !== void 0) {
          result.tags = asSymbolTags(item.tags);
        }
        return result;
      }
      async function asTypeHierarchyItems(items, token) {
        if (items === null) {
          return void 0;
        }
        return async.map(items, asTypeHierarchyItem, token);
      }
      function asGlobPattern(pattern) {
        if (Is.string(pattern)) {
          return pattern;
        }
        if (ls.RelativePattern.is(pattern)) {
          if (ls.URI.is(pattern.baseUri)) {
            return new code.RelativePattern(asUri(pattern.baseUri), pattern.pattern);
          } else if (ls.WorkspaceFolder.is(pattern.baseUri)) {
            const workspaceFolder = code.workspace.getWorkspaceFolder(asUri(pattern.baseUri.uri));
            return workspaceFolder !== void 0 ? new code.RelativePattern(workspaceFolder, pattern.pattern) : void 0;
          }
        }
        return void 0;
      }
      async function asInlineCompletionResult(value, token) {
        if (!value) {
          return void 0;
        }
        if (Array.isArray(value)) {
          return async.map(value, (item) => asInlineCompletionItem(item), token);
        }
        const list = value;
        const converted = await async.map(list.items, (item) => {
          return asInlineCompletionItem(item);
        }, token);
        return new code.InlineCompletionList(converted);
      }
      function asInlineCompletionItem(item) {
        let insertText;
        if (typeof item.insertText === "string") {
          insertText = item.insertText;
        } else {
          insertText = new code.SnippetString(item.insertText.value);
        }
        let command = void 0;
        if (item.command) {
          command = asCommand(item.command);
        }
        const inlineCompletionItem = new code.InlineCompletionItem(insertText, asRange(item.range), command);
        if (item.filterText) {
          inlineCompletionItem.filterText = item.filterText;
        }
        return inlineCompletionItem;
      }
      return {
        asUri,
        asDocumentSelector,
        asDiagnostics,
        asDiagnostic,
        asRange,
        asRanges,
        asPosition,
        asDiagnosticSeverity,
        asDiagnosticTag,
        asHover,
        asCompletionResult,
        asCompletionItem,
        asTextEdit,
        asTextEdits,
        asSignatureHelp,
        asSignatureInformations,
        asSignatureInformation,
        asParameterInformations,
        asParameterInformation,
        asDeclarationResult,
        asDefinitionResult,
        asLocation,
        asReferences,
        asDocumentHighlights,
        asDocumentHighlight,
        asDocumentHighlightKind,
        asSymbolKind,
        asSymbolTag,
        asSymbolTags,
        asSymbolInformations,
        asSymbolInformation,
        asDocumentSymbols,
        asDocumentSymbol,
        asCommand,
        asCommands,
        asCodeAction,
        asCodeActionKind,
        asCodeActionKinds,
        asCodeActionResult,
        asCodeLens,
        asCodeLenses,
        asWorkspaceEdit,
        asDocumentLink,
        asDocumentLinks,
        asFoldingRangeKind,
        asFoldingRange,
        asFoldingRanges,
        asColor,
        asColorInformation,
        asColorInformations,
        asColorPresentation,
        asColorPresentations,
        asSelectionRange,
        asSelectionRanges,
        asInlineValue,
        asInlineValues,
        asInlayHint,
        asInlayHints,
        asSemanticTokensLegend,
        asSemanticTokens,
        asSemanticTokensEdit,
        asSemanticTokensEdits,
        asCallHierarchyItem,
        asCallHierarchyItems,
        asCallHierarchyIncomingCall,
        asCallHierarchyIncomingCalls,
        asCallHierarchyOutgoingCall,
        asCallHierarchyOutgoingCalls,
        asLinkedEditingRanges,
        asTypeHierarchyItem,
        asTypeHierarchyItems,
        asGlobPattern,
        asInlineCompletionResult,
        asInlineCompletionItem
      };
    }
    exports2.createConverter = createConverter;
  }
});

// node_modules/vscode-languageclient/lib/common/utils/uuid.js
var require_uuid = __commonJS({
  "node_modules/vscode-languageclient/lib/common/utils/uuid.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.generateUuid = exports2.parse = exports2.isUUID = exports2.v4 = exports2.empty = void 0;
    var ValueUUID = class {
      constructor(_value) {
        this._value = _value;
      }
      asHex() {
        return this._value;
      }
      equals(other) {
        return this.asHex() === other.asHex();
      }
    };
    var V4UUID = class _V4UUID extends ValueUUID {
      static _oneOf(array) {
        return array[Math.floor(array.length * Math.random())];
      }
      static _randomHex() {
        return _V4UUID._oneOf(_V4UUID._chars);
      }
      constructor() {
        super([
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          "-",
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          "-",
          "4",
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          "-",
          _V4UUID._oneOf(_V4UUID._timeHighBits),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          "-",
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex(),
          _V4UUID._randomHex()
        ].join(""));
      }
    };
    V4UUID._chars = ["0", "1", "2", "3", "4", "5", "6", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f"];
    V4UUID._timeHighBits = ["8", "9", "a", "b"];
    exports2.empty = new ValueUUID("00000000-0000-0000-0000-000000000000");
    function v4() {
      return new V4UUID();
    }
    exports2.v4 = v4;
    var _UUIDPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    function isUUID(value) {
      return _UUIDPattern.test(value);
    }
    exports2.isUUID = isUUID;
    function parse(value) {
      if (!isUUID(value)) {
        throw new Error("invalid uuid");
      }
      return new ValueUUID(value);
    }
    exports2.parse = parse;
    function generateUuid() {
      return v4().asHex();
    }
    exports2.generateUuid = generateUuid;
  }
});

// node_modules/vscode-languageclient/lib/common/progressPart.js
var require_progressPart = __commonJS({
  "node_modules/vscode-languageclient/lib/common/progressPart.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ProgressPart = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var Is = require_is();
    var ProgressPart = class {
      constructor(_client, _token, done) {
        this._client = _client;
        this._token = _token;
        this._reported = 0;
        this._infinite = false;
        this._lspProgressDisposable = this._client.onProgress(vscode_languageserver_protocol_1.WorkDoneProgress.type, this._token, (value) => {
          switch (value.kind) {
            case "begin":
              this.begin(value);
              break;
            case "report":
              this.report(value);
              break;
            case "end":
              this.done();
              done && done(this);
              break;
          }
        });
      }
      begin(params) {
        this._infinite = params.percentage === void 0;
        if (this._lspProgressDisposable === void 0) {
          return;
        }
        void vscode_1.window.withProgress({ location: vscode_1.ProgressLocation.Window, cancellable: params.cancellable, title: params.title }, async (progress, cancellationToken) => {
          if (this._lspProgressDisposable === void 0) {
            return;
          }
          this._progress = progress;
          this._cancellationToken = cancellationToken;
          this._tokenDisposable = this._cancellationToken.onCancellationRequested(() => {
            this._client.sendNotification(vscode_languageserver_protocol_1.WorkDoneProgressCancelNotification.type, { token: this._token });
          });
          this.report(params);
          return new Promise((resolve, reject) => {
            this._resolve = resolve;
            this._reject = reject;
          });
        });
      }
      report(params) {
        if (this._infinite && Is.string(params.message)) {
          this._progress !== void 0 && this._progress.report({ message: params.message });
        } else if (Is.number(params.percentage)) {
          const percentage = Math.max(0, Math.min(params.percentage, 100));
          const delta = Math.max(0, percentage - this._reported);
          this._reported += delta;
          this._progress !== void 0 && this._progress.report({ message: params.message, increment: delta });
        }
      }
      cancel() {
        this.cleanup();
        if (this._reject !== void 0) {
          this._reject();
          this._resolve = void 0;
          this._reject = void 0;
        }
      }
      done() {
        this.cleanup();
        if (this._resolve !== void 0) {
          this._resolve();
          this._resolve = void 0;
          this._reject = void 0;
        }
      }
      cleanup() {
        if (this._lspProgressDisposable !== void 0) {
          this._lspProgressDisposable.dispose();
          this._lspProgressDisposable = void 0;
        }
        if (this._tokenDisposable !== void 0) {
          this._tokenDisposable.dispose();
          this._tokenDisposable = void 0;
        }
        this._progress = void 0;
        this._cancellationToken = void 0;
      }
    };
    exports2.ProgressPart = ProgressPart;
  }
});

// node_modules/vscode-languageclient/lib/common/features.js
var require_features = __commonJS({
  "node_modules/vscode-languageclient/lib/common/features.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WorkspaceFeature = exports2.TextDocumentLanguageFeature = exports2.TextDocumentEventFeature = exports2.DynamicDocumentFeature = exports2.DynamicFeature = exports2.StaticFeature = exports2.ensure = exports2.LSPCancellationError = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var Is = require_is();
    var UUID = require_uuid();
    var LSPCancellationError = class extends vscode_1.CancellationError {
      constructor(data) {
        super();
        this.data = data;
      }
    };
    exports2.LSPCancellationError = LSPCancellationError;
    function ensure(target, key) {
      if (target[key] === void 0) {
        target[key] = {};
      }
      return target[key];
    }
    exports2.ensure = ensure;
    var StaticFeature;
    (function(StaticFeature2) {
      function is(value) {
        const candidate = value;
        return candidate !== void 0 && candidate !== null && Is.func(candidate.fillClientCapabilities) && Is.func(candidate.initialize) && Is.func(candidate.getState) && Is.func(candidate.clear) && (candidate.fillInitializeParams === void 0 || Is.func(candidate.fillInitializeParams));
      }
      StaticFeature2.is = is;
    })(StaticFeature || (exports2.StaticFeature = StaticFeature = {}));
    var DynamicFeature;
    (function(DynamicFeature2) {
      function is(value) {
        const candidate = value;
        return candidate !== void 0 && candidate !== null && Is.func(candidate.fillClientCapabilities) && Is.func(candidate.initialize) && Is.func(candidate.getState) && Is.func(candidate.clear) && (candidate.fillInitializeParams === void 0 || Is.func(candidate.fillInitializeParams)) && Is.func(candidate.register) && Is.func(candidate.unregister) && candidate.registrationType !== void 0;
      }
      DynamicFeature2.is = is;
    })(DynamicFeature || (exports2.DynamicFeature = DynamicFeature = {}));
    var DynamicDocumentFeature = class {
      constructor(client2) {
        this._client = client2;
      }
      /**
       * Returns the state the feature is in.
       */
      getState() {
        const selectors = this.getDocumentSelectors();
        let count = 0;
        for (const selector of selectors) {
          count++;
          for (const document of vscode_1.workspace.textDocuments) {
            if (vscode_1.languages.match(selector, document) > 0) {
              return { kind: "document", id: this.registrationType.method, registrations: true, matches: true };
            }
          }
        }
        const registrations = count > 0;
        return { kind: "document", id: this.registrationType.method, registrations, matches: false };
      }
    };
    exports2.DynamicDocumentFeature = DynamicDocumentFeature;
    var TextDocumentEventFeature = class extends DynamicDocumentFeature {
      static textDocumentFilter(selectors, textDocument) {
        for (const selector of selectors) {
          if (vscode_1.languages.match(selector, textDocument) > 0) {
            return true;
          }
        }
        return false;
      }
      constructor(client2, event, type, middleware, createParams, textDocument, selectorFilter) {
        super(client2);
        this._event = event;
        this._type = type;
        this._middleware = middleware;
        this._createParams = createParams;
        this._textDocument = textDocument;
        this._selectorFilter = selectorFilter;
        this._selectors = /* @__PURE__ */ new Map();
        this._onNotificationSent = new vscode_1.EventEmitter();
      }
      getStateInfo() {
        return [this._selectors.values(), false];
      }
      getDocumentSelectors() {
        return this._selectors.values();
      }
      register(data) {
        if (!data.registerOptions.documentSelector) {
          return;
        }
        if (!this._listener) {
          this._listener = this._event((data2) => {
            this.callback(data2).catch((error) => {
              this._client.error(`Sending document notification ${this._type.method} failed.`, error);
            });
          });
        }
        this._selectors.set(data.id, this._client.protocol2CodeConverter.asDocumentSelector(data.registerOptions.documentSelector));
      }
      async callback(data) {
        const doSend = async (data2) => {
          const params = this._createParams(data2);
          await this._client.sendNotification(this._type, params);
          this.notificationSent(this.getTextDocument(data2), this._type, params);
        };
        if (this.matches(data)) {
          const middleware = this._middleware();
          return middleware ? middleware(data, (data2) => doSend(data2)) : doSend(data);
        }
      }
      matches(data) {
        if (this._client.hasDedicatedTextSynchronizationFeature(this._textDocument(data))) {
          return false;
        }
        return !this._selectorFilter || this._selectorFilter(this._selectors.values(), data);
      }
      get onNotificationSent() {
        return this._onNotificationSent.event;
      }
      notificationSent(textDocument, type, params) {
        this._onNotificationSent.fire({ textDocument, type, params });
      }
      unregister(id) {
        this._selectors.delete(id);
        if (this._selectors.size === 0 && this._listener) {
          this._listener.dispose();
          this._listener = void 0;
        }
      }
      clear() {
        this._selectors.clear();
        this._onNotificationSent.dispose();
        if (this._listener) {
          this._listener.dispose();
          this._listener = void 0;
        }
      }
      getProvider(document) {
        for (const selector of this._selectors.values()) {
          if (vscode_1.languages.match(selector, document) > 0) {
            return {
              send: (data) => {
                return this.callback(data);
              }
            };
          }
        }
        return void 0;
      }
    };
    exports2.TextDocumentEventFeature = TextDocumentEventFeature;
    var TextDocumentLanguageFeature = class extends DynamicDocumentFeature {
      constructor(client2, registrationType) {
        super(client2);
        this._registrationType = registrationType;
        this._registrations = /* @__PURE__ */ new Map();
      }
      *getDocumentSelectors() {
        for (const registration of this._registrations.values()) {
          const selector = registration.data.registerOptions.documentSelector;
          if (selector === null) {
            continue;
          }
          yield this._client.protocol2CodeConverter.asDocumentSelector(selector);
        }
      }
      get registrationType() {
        return this._registrationType;
      }
      register(data) {
        if (!data.registerOptions.documentSelector) {
          return;
        }
        let registration = this.registerLanguageProvider(data.registerOptions, data.id);
        this._registrations.set(data.id, { disposable: registration[0], data, provider: registration[1] });
      }
      unregister(id) {
        let registration = this._registrations.get(id);
        if (registration !== void 0) {
          registration.disposable.dispose();
        }
      }
      clear() {
        this._registrations.forEach((value) => {
          value.disposable.dispose();
        });
        this._registrations.clear();
      }
      getRegistration(documentSelector, capability) {
        if (!capability) {
          return [void 0, void 0];
        } else if (vscode_languageserver_protocol_1.TextDocumentRegistrationOptions.is(capability)) {
          const id = vscode_languageserver_protocol_1.StaticRegistrationOptions.hasId(capability) ? capability.id : UUID.generateUuid();
          const selector = capability.documentSelector ?? documentSelector;
          if (selector) {
            return [id, Object.assign({}, capability, { documentSelector: selector })];
          }
        } else if (Is.boolean(capability) && capability === true || vscode_languageserver_protocol_1.WorkDoneProgressOptions.is(capability)) {
          if (!documentSelector) {
            return [void 0, void 0];
          }
          const options = Is.boolean(capability) && capability === true ? { documentSelector } : Object.assign({}, capability, { documentSelector });
          return [UUID.generateUuid(), options];
        }
        return [void 0, void 0];
      }
      getRegistrationOptions(documentSelector, capability) {
        if (!documentSelector || !capability) {
          return void 0;
        }
        return Is.boolean(capability) && capability === true ? { documentSelector } : Object.assign({}, capability, { documentSelector });
      }
      getProvider(textDocument) {
        for (const registration of this._registrations.values()) {
          let selector = registration.data.registerOptions.documentSelector;
          if (selector !== null && vscode_1.languages.match(this._client.protocol2CodeConverter.asDocumentSelector(selector), textDocument) > 0) {
            return registration.provider;
          }
        }
        return void 0;
      }
      getAllProviders() {
        const result = [];
        for (const item of this._registrations.values()) {
          result.push(item.provider);
        }
        return result;
      }
    };
    exports2.TextDocumentLanguageFeature = TextDocumentLanguageFeature;
    var WorkspaceFeature = class {
      constructor(client2, registrationType) {
        this._client = client2;
        this._registrationType = registrationType;
        this._registrations = /* @__PURE__ */ new Map();
      }
      getState() {
        const registrations = this._registrations.size > 0;
        return { kind: "workspace", id: this._registrationType.method, registrations };
      }
      get registrationType() {
        return this._registrationType;
      }
      register(data) {
        const registration = this.registerLanguageProvider(data.registerOptions);
        this._registrations.set(data.id, { disposable: registration[0], provider: registration[1] });
      }
      unregister(id) {
        let registration = this._registrations.get(id);
        if (registration !== void 0) {
          registration.disposable.dispose();
        }
      }
      clear() {
        this._registrations.forEach((registration) => {
          registration.disposable.dispose();
        });
        this._registrations.clear();
      }
      getProviders() {
        const result = [];
        for (const registration of this._registrations.values()) {
          result.push(registration.provider);
        }
        return result;
      }
    };
    exports2.WorkspaceFeature = WorkspaceFeature;
  }
});

// node_modules/vscode-languageclient/node_modules/minimatch/lib/path.js
var require_path = __commonJS({
  "node_modules/vscode-languageclient/node_modules/minimatch/lib/path.js"(exports2, module2) {
    var isWindows = typeof process === "object" && process && process.platform === "win32";
    module2.exports = isWindows ? { sep: "\\" } : { sep: "/" };
  }
});

// node_modules/balanced-match/index.js
var require_balanced_match = __commonJS({
  "node_modules/balanced-match/index.js"(exports2, module2) {
    "use strict";
    module2.exports = balanced;
    function balanced(a, b, str) {
      if (a instanceof RegExp) a = maybeMatch(a, str);
      if (b instanceof RegExp) b = maybeMatch(b, str);
      var r = range(a, b, str);
      return r && {
        start: r[0],
        end: r[1],
        pre: str.slice(0, r[0]),
        body: str.slice(r[0] + a.length, r[1]),
        post: str.slice(r[1] + b.length)
      };
    }
    function maybeMatch(reg, str) {
      var m = str.match(reg);
      return m ? m[0] : null;
    }
    balanced.range = range;
    function range(a, b, str) {
      var begs, beg, left, right, result;
      var ai = str.indexOf(a);
      var bi = str.indexOf(b, ai + 1);
      var i = ai;
      if (ai >= 0 && bi > 0) {
        if (a === b) {
          return [ai, bi];
        }
        begs = [];
        left = str.length;
        while (i >= 0 && !result) {
          if (i == ai) {
            begs.push(i);
            ai = str.indexOf(a, i + 1);
          } else if (begs.length == 1) {
            result = [begs.pop(), bi];
          } else {
            beg = begs.pop();
            if (beg < left) {
              left = beg;
              right = bi;
            }
            bi = str.indexOf(b, i + 1);
          }
          i = ai < bi && ai >= 0 ? ai : bi;
        }
        if (begs.length) {
          result = [left, right];
        }
      }
      return result;
    }
  }
});

// node_modules/vscode-languageclient/node_modules/brace-expansion/index.js
var require_brace_expansion = __commonJS({
  "node_modules/vscode-languageclient/node_modules/brace-expansion/index.js"(exports2, module2) {
    var balanced = require_balanced_match();
    module2.exports = expandTop;
    var escSlash = "\0SLASH" + Math.random() + "\0";
    var escOpen = "\0OPEN" + Math.random() + "\0";
    var escClose = "\0CLOSE" + Math.random() + "\0";
    var escComma = "\0COMMA" + Math.random() + "\0";
    var escPeriod = "\0PERIOD" + Math.random() + "\0";
    function numeric(str) {
      return parseInt(str, 10) == str ? parseInt(str, 10) : str.charCodeAt(0);
    }
    function escapeBraces(str) {
      return str.split("\\\\").join(escSlash).split("\\{").join(escOpen).split("\\}").join(escClose).split("\\,").join(escComma).split("\\.").join(escPeriod);
    }
    function unescapeBraces(str) {
      return str.split(escSlash).join("\\").split(escOpen).join("{").split(escClose).join("}").split(escComma).join(",").split(escPeriod).join(".");
    }
    function parseCommaParts(str) {
      if (!str)
        return [""];
      var parts = [];
      var m = balanced("{", "}", str);
      if (!m)
        return str.split(",");
      var pre = m.pre;
      var body = m.body;
      var post = m.post;
      var p = pre.split(",");
      p[p.length - 1] += "{" + body + "}";
      var postParts = parseCommaParts(post);
      if (post.length) {
        p[p.length - 1] += postParts.shift();
        p.push.apply(p, postParts);
      }
      parts.push.apply(parts, p);
      return parts;
    }
    function expandTop(str) {
      if (!str)
        return [];
      if (str.substr(0, 2) === "{}") {
        str = "\\{\\}" + str.substr(2);
      }
      return expand(escapeBraces(str), true).map(unescapeBraces);
    }
    function embrace(str) {
      return "{" + str + "}";
    }
    function isPadded(el) {
      return /^-?0\d/.test(el);
    }
    function lte(i, y) {
      return i <= y;
    }
    function gte(i, y) {
      return i >= y;
    }
    function expand(str, isTop) {
      var expansions = [];
      var m = balanced("{", "}", str);
      if (!m) return [str];
      var pre = m.pre;
      var post = m.post.length ? expand(m.post, false) : [""];
      if (/\$$/.test(m.pre)) {
        for (var k = 0; k < post.length; k++) {
          var expansion = pre + "{" + m.body + "}" + post[k];
          expansions.push(expansion);
        }
      } else {
        var isNumericSequence = /^-?\d+\.\.-?\d+(?:\.\.-?\d+)?$/.test(m.body);
        var isAlphaSequence = /^[a-zA-Z]\.\.[a-zA-Z](?:\.\.-?\d+)?$/.test(m.body);
        var isSequence = isNumericSequence || isAlphaSequence;
        var isOptions = m.body.indexOf(",") >= 0;
        if (!isSequence && !isOptions) {
          if (m.post.match(/,(?!,).*\}/)) {
            str = m.pre + "{" + m.body + escClose + m.post;
            return expand(str);
          }
          return [str];
        }
        var n;
        if (isSequence) {
          n = m.body.split(/\.\./);
        } else {
          n = parseCommaParts(m.body);
          if (n.length === 1) {
            n = expand(n[0], false).map(embrace);
            if (n.length === 1) {
              return post.map(function(p) {
                return m.pre + n[0] + p;
              });
            }
          }
        }
        var N;
        if (isSequence) {
          var x = numeric(n[0]);
          var y = numeric(n[1]);
          var width = Math.max(n[0].length, n[1].length);
          var incr = n.length == 3 ? Math.abs(numeric(n[2])) : 1;
          var test = lte;
          var reverse = y < x;
          if (reverse) {
            incr *= -1;
            test = gte;
          }
          var pad = n.some(isPadded);
          N = [];
          for (var i = x; test(i, y); i += incr) {
            var c;
            if (isAlphaSequence) {
              c = String.fromCharCode(i);
              if (c === "\\")
                c = "";
            } else {
              c = String(i);
              if (pad) {
                var need = width - c.length;
                if (need > 0) {
                  var z = new Array(need + 1).join("0");
                  if (i < 0)
                    c = "-" + z + c.slice(1);
                  else
                    c = z + c;
                }
              }
            }
            N.push(c);
          }
        } else {
          N = [];
          for (var j = 0; j < n.length; j++) {
            N.push.apply(N, expand(n[j], false));
          }
        }
        for (var j = 0; j < N.length; j++) {
          for (var k = 0; k < post.length; k++) {
            var expansion = pre + N[j] + post[k];
            if (!isTop || isSequence || expansion)
              expansions.push(expansion);
          }
        }
      }
      return expansions;
    }
  }
});

// node_modules/vscode-languageclient/node_modules/minimatch/minimatch.js
var require_minimatch = __commonJS({
  "node_modules/vscode-languageclient/node_modules/minimatch/minimatch.js"(exports2, module2) {
    var minimatch = module2.exports = (p, pattern, options = {}) => {
      assertValidPattern(pattern);
      if (!options.nocomment && pattern.charAt(0) === "#") {
        return false;
      }
      return new Minimatch(pattern, options).match(p);
    };
    module2.exports = minimatch;
    var path2 = require_path();
    minimatch.sep = path2.sep;
    var GLOBSTAR = /* @__PURE__ */ Symbol("globstar **");
    minimatch.GLOBSTAR = GLOBSTAR;
    var expand = require_brace_expansion();
    var plTypes = {
      "!": { open: "(?:(?!(?:", close: "))[^/]*?)" },
      "?": { open: "(?:", close: ")?" },
      "+": { open: "(?:", close: ")+" },
      "*": { open: "(?:", close: ")*" },
      "@": { open: "(?:", close: ")" }
    };
    var qmark = "[^/]";
    var star = qmark + "*?";
    var twoStarDot = "(?:(?!(?:\\/|^)(?:\\.{1,2})($|\\/)).)*?";
    var twoStarNoDot = "(?:(?!(?:\\/|^)\\.).)*?";
    var charSet = (s) => s.split("").reduce((set, c) => {
      set[c] = true;
      return set;
    }, {});
    var reSpecials = charSet("().*{}+?[]^$\\!");
    var addPatternStartSet = charSet("[.(");
    var slashSplit = /\/+/;
    minimatch.filter = (pattern, options = {}) => (p, i, list) => minimatch(p, pattern, options);
    var ext = (a, b = {}) => {
      const t = {};
      Object.keys(a).forEach((k) => t[k] = a[k]);
      Object.keys(b).forEach((k) => t[k] = b[k]);
      return t;
    };
    minimatch.defaults = (def) => {
      if (!def || typeof def !== "object" || !Object.keys(def).length) {
        return minimatch;
      }
      const orig = minimatch;
      const m = (p, pattern, options) => orig(p, pattern, ext(def, options));
      m.Minimatch = class Minimatch extends orig.Minimatch {
        constructor(pattern, options) {
          super(pattern, ext(def, options));
        }
      };
      m.Minimatch.defaults = (options) => orig.defaults(ext(def, options)).Minimatch;
      m.filter = (pattern, options) => orig.filter(pattern, ext(def, options));
      m.defaults = (options) => orig.defaults(ext(def, options));
      m.makeRe = (pattern, options) => orig.makeRe(pattern, ext(def, options));
      m.braceExpand = (pattern, options) => orig.braceExpand(pattern, ext(def, options));
      m.match = (list, pattern, options) => orig.match(list, pattern, ext(def, options));
      return m;
    };
    minimatch.braceExpand = (pattern, options) => braceExpand(pattern, options);
    var braceExpand = (pattern, options = {}) => {
      assertValidPattern(pattern);
      if (options.nobrace || !/\{(?:(?!\{).)*\}/.test(pattern)) {
        return [pattern];
      }
      return expand(pattern);
    };
    var MAX_PATTERN_LENGTH = 1024 * 64;
    var assertValidPattern = (pattern) => {
      if (typeof pattern !== "string") {
        throw new TypeError("invalid pattern");
      }
      if (pattern.length > MAX_PATTERN_LENGTH) {
        throw new TypeError("pattern is too long");
      }
    };
    var SUBPARSE = /* @__PURE__ */ Symbol("subparse");
    minimatch.makeRe = (pattern, options) => new Minimatch(pattern, options || {}).makeRe();
    minimatch.match = (list, pattern, options = {}) => {
      const mm = new Minimatch(pattern, options);
      list = list.filter((f) => mm.match(f));
      if (mm.options.nonull && !list.length) {
        list.push(pattern);
      }
      return list;
    };
    var globUnescape = (s) => s.replace(/\\(.)/g, "$1");
    var charUnescape = (s) => s.replace(/\\([^-\]])/g, "$1");
    var regExpEscape = (s) => s.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
    var braExpEscape = (s) => s.replace(/[[\]\\]/g, "\\$&");
    var Minimatch = class {
      constructor(pattern, options) {
        assertValidPattern(pattern);
        if (!options) options = {};
        this.options = options;
        this.set = [];
        this.pattern = pattern;
        this.windowsPathsNoEscape = !!options.windowsPathsNoEscape || options.allowWindowsEscape === false;
        if (this.windowsPathsNoEscape) {
          this.pattern = this.pattern.replace(/\\/g, "/");
        }
        this.regexp = null;
        this.negate = false;
        this.comment = false;
        this.empty = false;
        this.partial = !!options.partial;
        this.make();
      }
      debug() {
      }
      make() {
        const pattern = this.pattern;
        const options = this.options;
        if (!options.nocomment && pattern.charAt(0) === "#") {
          this.comment = true;
          return;
        }
        if (!pattern) {
          this.empty = true;
          return;
        }
        this.parseNegate();
        let set = this.globSet = this.braceExpand();
        if (options.debug) this.debug = (...args) => console.error(...args);
        this.debug(this.pattern, set);
        set = this.globParts = set.map((s) => s.split(slashSplit));
        this.debug(this.pattern, set);
        set = set.map((s, si, set2) => s.map(this.parse, this));
        this.debug(this.pattern, set);
        set = set.filter((s) => s.indexOf(false) === -1);
        this.debug(this.pattern, set);
        this.set = set;
      }
      parseNegate() {
        if (this.options.nonegate) return;
        const pattern = this.pattern;
        let negate = false;
        let negateOffset = 0;
        for (let i = 0; i < pattern.length && pattern.charAt(i) === "!"; i++) {
          negate = !negate;
          negateOffset++;
        }
        if (negateOffset) this.pattern = pattern.slice(negateOffset);
        this.negate = negate;
      }
      // set partial to true to test if, for example,
      // "/a/b" matches the start of "/*/b/*/d"
      // Partial means, if you run out of file before you run
      // out of pattern, then that's fine, as long as all
      // the parts match.
      matchOne(file, pattern, partial) {
        var options = this.options;
        this.debug(
          "matchOne",
          { "this": this, file, pattern }
        );
        this.debug("matchOne", file.length, pattern.length);
        for (var fi = 0, pi = 0, fl = file.length, pl = pattern.length; fi < fl && pi < pl; fi++, pi++) {
          this.debug("matchOne loop");
          var p = pattern[pi];
          var f = file[fi];
          this.debug(pattern, p, f);
          if (p === false) return false;
          if (p === GLOBSTAR) {
            this.debug("GLOBSTAR", [pattern, p, f]);
            var fr = fi;
            var pr = pi + 1;
            if (pr === pl) {
              this.debug("** at the end");
              for (; fi < fl; fi++) {
                if (file[fi] === "." || file[fi] === ".." || !options.dot && file[fi].charAt(0) === ".") return false;
              }
              return true;
            }
            while (fr < fl) {
              var swallowee = file[fr];
              this.debug("\nglobstar while", file, fr, pattern, pr, swallowee);
              if (this.matchOne(file.slice(fr), pattern.slice(pr), partial)) {
                this.debug("globstar found match!", fr, fl, swallowee);
                return true;
              } else {
                if (swallowee === "." || swallowee === ".." || !options.dot && swallowee.charAt(0) === ".") {
                  this.debug("dot detected!", file, fr, pattern, pr);
                  break;
                }
                this.debug("globstar swallow a segment, and continue");
                fr++;
              }
            }
            if (partial) {
              this.debug("\n>>> no match, partial?", file, fr, pattern, pr);
              if (fr === fl) return true;
            }
            return false;
          }
          var hit;
          if (typeof p === "string") {
            hit = f === p;
            this.debug("string match", p, f, hit);
          } else {
            hit = f.match(p);
            this.debug("pattern match", p, f, hit);
          }
          if (!hit) return false;
        }
        if (fi === fl && pi === pl) {
          return true;
        } else if (fi === fl) {
          return partial;
        } else if (pi === pl) {
          return fi === fl - 1 && file[fi] === "";
        }
        throw new Error("wtf?");
      }
      braceExpand() {
        return braceExpand(this.pattern, this.options);
      }
      parse(pattern, isSub) {
        assertValidPattern(pattern);
        const options = this.options;
        if (pattern === "**") {
          if (!options.noglobstar)
            return GLOBSTAR;
          else
            pattern = "*";
        }
        if (pattern === "") return "";
        let re = "";
        let hasMagic = false;
        let escaping = false;
        const patternListStack = [];
        const negativeLists = [];
        let stateChar;
        let inClass = false;
        let reClassStart = -1;
        let classStart = -1;
        let cs;
        let pl;
        let sp;
        let dotTravAllowed = pattern.charAt(0) === ".";
        let dotFileAllowed = options.dot || dotTravAllowed;
        const patternStart = () => dotTravAllowed ? "" : dotFileAllowed ? "(?!(?:^|\\/)\\.{1,2}(?:$|\\/))" : "(?!\\.)";
        const subPatternStart = (p) => p.charAt(0) === "." ? "" : options.dot ? "(?!(?:^|\\/)\\.{1,2}(?:$|\\/))" : "(?!\\.)";
        const clearStateChar = () => {
          if (stateChar) {
            switch (stateChar) {
              case "*":
                re += star;
                hasMagic = true;
                break;
              case "?":
                re += qmark;
                hasMagic = true;
                break;
              default:
                re += "\\" + stateChar;
                break;
            }
            this.debug("clearStateChar %j %j", stateChar, re);
            stateChar = false;
          }
        };
        for (let i = 0, c; i < pattern.length && (c = pattern.charAt(i)); i++) {
          this.debug("%s	%s %s %j", pattern, i, re, c);
          if (escaping) {
            if (c === "/") {
              return false;
            }
            if (reSpecials[c]) {
              re += "\\";
            }
            re += c;
            escaping = false;
            continue;
          }
          switch (c) {
            /* istanbul ignore next */
            case "/": {
              return false;
            }
            case "\\":
              if (inClass && pattern.charAt(i + 1) === "-") {
                re += c;
                continue;
              }
              clearStateChar();
              escaping = true;
              continue;
            // the various stateChar values
            // for the "extglob" stuff.
            case "?":
            case "*":
            case "+":
            case "@":
            case "!":
              this.debug("%s	%s %s %j <-- stateChar", pattern, i, re, c);
              if (inClass) {
                this.debug("  in class");
                if (c === "!" && i === classStart + 1) c = "^";
                re += c;
                continue;
              }
              this.debug("call clearStateChar %j", stateChar);
              clearStateChar();
              stateChar = c;
              if (options.noext) clearStateChar();
              continue;
            case "(": {
              if (inClass) {
                re += "(";
                continue;
              }
              if (!stateChar) {
                re += "\\(";
                continue;
              }
              const plEntry = {
                type: stateChar,
                start: i - 1,
                reStart: re.length,
                open: plTypes[stateChar].open,
                close: plTypes[stateChar].close
              };
              this.debug(this.pattern, "	", plEntry);
              patternListStack.push(plEntry);
              re += plEntry.open;
              if (plEntry.start === 0 && plEntry.type !== "!") {
                dotTravAllowed = true;
                re += subPatternStart(pattern.slice(i + 1));
              }
              this.debug("plType %j %j", stateChar, re);
              stateChar = false;
              continue;
            }
            case ")": {
              const plEntry = patternListStack[patternListStack.length - 1];
              if (inClass || !plEntry) {
                re += "\\)";
                continue;
              }
              patternListStack.pop();
              clearStateChar();
              hasMagic = true;
              pl = plEntry;
              re += pl.close;
              if (pl.type === "!") {
                negativeLists.push(Object.assign(pl, { reEnd: re.length }));
              }
              continue;
            }
            case "|": {
              const plEntry = patternListStack[patternListStack.length - 1];
              if (inClass || !plEntry) {
                re += "\\|";
                continue;
              }
              clearStateChar();
              re += "|";
              if (plEntry.start === 0 && plEntry.type !== "!") {
                dotTravAllowed = true;
                re += subPatternStart(pattern.slice(i + 1));
              }
              continue;
            }
            // these are mostly the same in regexp and glob
            case "[":
              clearStateChar();
              if (inClass) {
                re += "\\" + c;
                continue;
              }
              inClass = true;
              classStart = i;
              reClassStart = re.length;
              re += c;
              continue;
            case "]":
              if (i === classStart + 1 || !inClass) {
                re += "\\" + c;
                continue;
              }
              cs = pattern.substring(classStart + 1, i);
              try {
                RegExp("[" + braExpEscape(charUnescape(cs)) + "]");
                re += c;
              } catch (er) {
                re = re.substring(0, reClassStart) + "(?:$.)";
              }
              hasMagic = true;
              inClass = false;
              continue;
            default:
              clearStateChar();
              if (reSpecials[c] && !(c === "^" && inClass)) {
                re += "\\";
              }
              re += c;
              break;
          }
        }
        if (inClass) {
          cs = pattern.slice(classStart + 1);
          sp = this.parse(cs, SUBPARSE);
          re = re.substring(0, reClassStart) + "\\[" + sp[0];
          hasMagic = hasMagic || sp[1];
        }
        for (pl = patternListStack.pop(); pl; pl = patternListStack.pop()) {
          let tail;
          tail = re.slice(pl.reStart + pl.open.length);
          this.debug("setting tail", re, pl);
          tail = tail.replace(/((?:\\{2}){0,64})(\\?)\|/g, (_, $1, $2) => {
            if (!$2) {
              $2 = "\\";
            }
            return $1 + $1 + $2 + "|";
          });
          this.debug("tail=%j\n   %s", tail, tail, pl, re);
          const t = pl.type === "*" ? star : pl.type === "?" ? qmark : "\\" + pl.type;
          hasMagic = true;
          re = re.slice(0, pl.reStart) + t + "\\(" + tail;
        }
        clearStateChar();
        if (escaping) {
          re += "\\\\";
        }
        const addPatternStart = addPatternStartSet[re.charAt(0)];
        for (let n = negativeLists.length - 1; n > -1; n--) {
          const nl = negativeLists[n];
          const nlBefore = re.slice(0, nl.reStart);
          const nlFirst = re.slice(nl.reStart, nl.reEnd - 8);
          let nlAfter = re.slice(nl.reEnd);
          const nlLast = re.slice(nl.reEnd - 8, nl.reEnd) + nlAfter;
          const closeParensBefore = nlBefore.split(")").length;
          const openParensBefore = nlBefore.split("(").length - closeParensBefore;
          let cleanAfter = nlAfter;
          for (let i = 0; i < openParensBefore; i++) {
            cleanAfter = cleanAfter.replace(/\)[+*?]?/, "");
          }
          nlAfter = cleanAfter;
          const dollar = nlAfter === "" && isSub !== SUBPARSE ? "(?:$|\\/)" : "";
          re = nlBefore + nlFirst + nlAfter + dollar + nlLast;
        }
        if (re !== "" && hasMagic) {
          re = "(?=.)" + re;
        }
        if (addPatternStart) {
          re = patternStart() + re;
        }
        if (isSub === SUBPARSE) {
          return [re, hasMagic];
        }
        if (options.nocase && !hasMagic) {
          hasMagic = pattern.toUpperCase() !== pattern.toLowerCase();
        }
        if (!hasMagic) {
          return globUnescape(pattern);
        }
        const flags = options.nocase ? "i" : "";
        try {
          return Object.assign(new RegExp("^" + re + "$", flags), {
            _glob: pattern,
            _src: re
          });
        } catch (er) {
          return new RegExp("$.");
        }
      }
      makeRe() {
        if (this.regexp || this.regexp === false) return this.regexp;
        const set = this.set;
        if (!set.length) {
          this.regexp = false;
          return this.regexp;
        }
        const options = this.options;
        const twoStar = options.noglobstar ? star : options.dot ? twoStarDot : twoStarNoDot;
        const flags = options.nocase ? "i" : "";
        let re = set.map((pattern) => {
          pattern = pattern.map(
            (p) => typeof p === "string" ? regExpEscape(p) : p === GLOBSTAR ? GLOBSTAR : p._src
          ).reduce((set2, p) => {
            if (!(set2[set2.length - 1] === GLOBSTAR && p === GLOBSTAR)) {
              set2.push(p);
            }
            return set2;
          }, []);
          pattern.forEach((p, i) => {
            if (p !== GLOBSTAR || pattern[i - 1] === GLOBSTAR) {
              return;
            }
            if (i === 0) {
              if (pattern.length > 1) {
                pattern[i + 1] = "(?:\\/|" + twoStar + "\\/)?" + pattern[i + 1];
              } else {
                pattern[i] = twoStar;
              }
            } else if (i === pattern.length - 1) {
              pattern[i - 1] += "(?:\\/|" + twoStar + ")?";
            } else {
              pattern[i - 1] += "(?:\\/|\\/" + twoStar + "\\/)" + pattern[i + 1];
              pattern[i + 1] = GLOBSTAR;
            }
          });
          return pattern.filter((p) => p !== GLOBSTAR).join("/");
        }).join("|");
        re = "^(?:" + re + ")$";
        if (this.negate) re = "^(?!" + re + ").*$";
        try {
          this.regexp = new RegExp(re, flags);
        } catch (ex) {
          this.regexp = false;
        }
        return this.regexp;
      }
      match(f, partial = this.partial) {
        this.debug("match", f, this.pattern);
        if (this.comment) return false;
        if (this.empty) return f === "";
        if (f === "/" && partial) return true;
        const options = this.options;
        if (path2.sep !== "/") {
          f = f.split(path2.sep).join("/");
        }
        f = f.split(slashSplit);
        this.debug(this.pattern, "split", f);
        const set = this.set;
        this.debug(this.pattern, "set", set);
        let filename;
        for (let i = f.length - 1; i >= 0; i--) {
          filename = f[i];
          if (filename) break;
        }
        for (let i = 0; i < set.length; i++) {
          const pattern = set[i];
          let file = f;
          if (options.matchBase && pattern.length === 1) {
            file = [filename];
          }
          const hit = this.matchOne(file, pattern, partial);
          if (hit) {
            if (options.flipNegate) return true;
            return !this.negate;
          }
        }
        if (options.flipNegate) return false;
        return this.negate;
      }
      static defaults(def) {
        return minimatch.defaults(def).Minimatch;
      }
    };
    minimatch.Minimatch = Minimatch;
  }
});

// node_modules/vscode-languageclient/lib/common/diagnostic.js
var require_diagnostic = __commonJS({
  "node_modules/vscode-languageclient/lib/common/diagnostic.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DiagnosticFeature = exports2.DiagnosticPullMode = exports2.vsdiag = void 0;
    var minimatch = require_minimatch();
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var uuid_1 = require_uuid();
    var features_1 = require_features();
    function ensure(target, key) {
      if (target[key] === void 0) {
        target[key] = {};
      }
      return target[key];
    }
    var vsdiag;
    (function(vsdiag2) {
      let DocumentDiagnosticReportKind;
      (function(DocumentDiagnosticReportKind2) {
        DocumentDiagnosticReportKind2["full"] = "full";
        DocumentDiagnosticReportKind2["unChanged"] = "unChanged";
      })(DocumentDiagnosticReportKind = vsdiag2.DocumentDiagnosticReportKind || (vsdiag2.DocumentDiagnosticReportKind = {}));
    })(vsdiag || (exports2.vsdiag = vsdiag = {}));
    var DiagnosticPullMode;
    (function(DiagnosticPullMode2) {
      DiagnosticPullMode2["onType"] = "onType";
      DiagnosticPullMode2["onSave"] = "onSave";
    })(DiagnosticPullMode || (exports2.DiagnosticPullMode = DiagnosticPullMode = {}));
    var RequestStateKind;
    (function(RequestStateKind2) {
      RequestStateKind2["active"] = "open";
      RequestStateKind2["reschedule"] = "reschedule";
      RequestStateKind2["outDated"] = "drop";
    })(RequestStateKind || (RequestStateKind = {}));
    var Tabs = class _Tabs {
      constructor() {
        this.open = /* @__PURE__ */ new Set();
        this._onOpen = new vscode_1.EventEmitter();
        this._onClose = new vscode_1.EventEmitter();
        _Tabs.fillTabResources(this.open);
        const openTabsHandler = (event) => {
          if (event.closed.length === 0 && event.opened.length === 0) {
            return;
          }
          const oldTabs = this.open;
          const currentTabs = /* @__PURE__ */ new Set();
          _Tabs.fillTabResources(currentTabs);
          const closed = /* @__PURE__ */ new Set();
          const opened = new Set(currentTabs);
          for (const tab of oldTabs.values()) {
            if (currentTabs.has(tab)) {
              opened.delete(tab);
            } else {
              closed.add(tab);
            }
          }
          this.open = currentTabs;
          if (closed.size > 0) {
            const toFire = /* @__PURE__ */ new Set();
            for (const item of closed) {
              toFire.add(vscode_1.Uri.parse(item));
            }
            this._onClose.fire(toFire);
          }
          if (opened.size > 0) {
            const toFire = /* @__PURE__ */ new Set();
            for (const item of opened) {
              toFire.add(vscode_1.Uri.parse(item));
            }
            this._onOpen.fire(toFire);
          }
        };
        if (vscode_1.window.tabGroups.onDidChangeTabs !== void 0) {
          this.disposable = vscode_1.window.tabGroups.onDidChangeTabs(openTabsHandler);
        } else {
          this.disposable = { dispose: () => {
          } };
        }
      }
      get onClose() {
        return this._onClose.event;
      }
      get onOpen() {
        return this._onOpen.event;
      }
      dispose() {
        this.disposable.dispose();
      }
      isActive(document) {
        return document instanceof vscode_1.Uri ? vscode_1.window.activeTextEditor?.document.uri === document : vscode_1.window.activeTextEditor?.document === document;
      }
      isVisible(document) {
        const uri = document instanceof vscode_1.Uri ? document : document.uri;
        return this.open.has(uri.toString());
      }
      getTabResources() {
        const result = /* @__PURE__ */ new Set();
        _Tabs.fillTabResources(/* @__PURE__ */ new Set(), result);
        return result;
      }
      static fillTabResources(strings, uris) {
        const seen = strings ?? /* @__PURE__ */ new Set();
        for (const group of vscode_1.window.tabGroups.all) {
          for (const tab of group.tabs) {
            const input = tab.input;
            let uri;
            if (input instanceof vscode_1.TabInputText) {
              uri = input.uri;
            } else if (input instanceof vscode_1.TabInputTextDiff) {
              uri = input.modified;
            } else if (input instanceof vscode_1.TabInputCustom) {
              uri = input.uri;
            }
            if (uri !== void 0 && !seen.has(uri.toString())) {
              seen.add(uri.toString());
              uris !== void 0 && uris.add(uri);
            }
          }
        }
      }
    };
    var PullState;
    (function(PullState2) {
      PullState2[PullState2["document"] = 1] = "document";
      PullState2[PullState2["workspace"] = 2] = "workspace";
    })(PullState || (PullState = {}));
    var DocumentOrUri;
    (function(DocumentOrUri2) {
      function asKey(document) {
        return document instanceof vscode_1.Uri ? document.toString() : document.uri.toString();
      }
      DocumentOrUri2.asKey = asKey;
    })(DocumentOrUri || (DocumentOrUri = {}));
    var DocumentPullStateTracker = class {
      constructor() {
        this.documentPullStates = /* @__PURE__ */ new Map();
        this.workspacePullStates = /* @__PURE__ */ new Map();
      }
      track(kind, document, arg1) {
        const states = kind === PullState.document ? this.documentPullStates : this.workspacePullStates;
        const [key, uri, version] = document instanceof vscode_1.Uri ? [document.toString(), document, arg1] : [document.uri.toString(), document.uri, document.version];
        let state = states.get(key);
        if (state === void 0) {
          state = { document: uri, pulledVersion: version, resultId: void 0 };
          states.set(key, state);
        }
        return state;
      }
      update(kind, document, arg1, arg2) {
        const states = kind === PullState.document ? this.documentPullStates : this.workspacePullStates;
        const [key, uri, version, resultId] = document instanceof vscode_1.Uri ? [document.toString(), document, arg1, arg2] : [document.uri.toString(), document.uri, document.version, arg1];
        let state = states.get(key);
        if (state === void 0) {
          state = { document: uri, pulledVersion: version, resultId };
          states.set(key, state);
        } else {
          state.pulledVersion = version;
          state.resultId = resultId;
        }
      }
      unTrack(kind, document) {
        const key = DocumentOrUri.asKey(document);
        const states = kind === PullState.document ? this.documentPullStates : this.workspacePullStates;
        states.delete(key);
      }
      tracks(kind, document) {
        const key = DocumentOrUri.asKey(document);
        const states = kind === PullState.document ? this.documentPullStates : this.workspacePullStates;
        return states.has(key);
      }
      getResultId(kind, document) {
        const key = DocumentOrUri.asKey(document);
        const states = kind === PullState.document ? this.documentPullStates : this.workspacePullStates;
        return states.get(key)?.resultId;
      }
      getAllResultIds() {
        const result = [];
        for (let [uri, value] of this.workspacePullStates) {
          if (this.documentPullStates.has(uri)) {
            value = this.documentPullStates.get(uri);
          }
          if (value.resultId !== void 0) {
            result.push({ uri, value: value.resultId });
          }
        }
        return result;
      }
    };
    var DiagnosticRequestor = class {
      constructor(client2, tabs, options) {
        this.client = client2;
        this.tabs = tabs;
        this.options = options;
        this.isDisposed = false;
        this.onDidChangeDiagnosticsEmitter = new vscode_1.EventEmitter();
        this.provider = this.createProvider();
        this.diagnostics = vscode_1.languages.createDiagnosticCollection(options.identifier);
        this.openRequests = /* @__PURE__ */ new Map();
        this.documentStates = new DocumentPullStateTracker();
        this.workspaceErrorCounter = 0;
      }
      knows(kind, document) {
        const uri = document instanceof vscode_1.Uri ? document : document.uri;
        return this.documentStates.tracks(kind, document) || this.openRequests.has(uri.toString());
      }
      forget(kind, document) {
        this.documentStates.unTrack(kind, document);
      }
      pull(document, cb) {
        if (this.isDisposed) {
          return;
        }
        const uri = document instanceof vscode_1.Uri ? document : document.uri;
        this.pullAsync(document).then(() => {
          if (cb) {
            cb();
          }
        }, (error) => {
          this.client.error(`Document pull failed for text document ${uri.toString()}`, error, false);
        });
      }
      async pullAsync(document, version) {
        if (this.isDisposed) {
          return;
        }
        const isUri = document instanceof vscode_1.Uri;
        const uri = isUri ? document : document.uri;
        const key = uri.toString();
        version = isUri ? version : document.version;
        const currentRequestState = this.openRequests.get(key);
        const documentState = isUri ? this.documentStates.track(PullState.document, document, version) : this.documentStates.track(PullState.document, document);
        if (currentRequestState === void 0) {
          const tokenSource = new vscode_1.CancellationTokenSource();
          this.openRequests.set(key, { state: RequestStateKind.active, document, version, tokenSource });
          let report;
          let afterState;
          try {
            report = await this.provider.provideDiagnostics(document, documentState.resultId, tokenSource.token) ?? { kind: vsdiag.DocumentDiagnosticReportKind.full, items: [] };
          } catch (error) {
            if (error instanceof features_1.LSPCancellationError && vscode_languageserver_protocol_1.DiagnosticServerCancellationData.is(error.data) && error.data.retriggerRequest === false) {
              afterState = { state: RequestStateKind.outDated, document };
            }
            if (afterState === void 0 && error instanceof vscode_1.CancellationError) {
              afterState = { state: RequestStateKind.reschedule, document };
            } else {
              throw error;
            }
          }
          afterState = afterState ?? this.openRequests.get(key);
          if (afterState === void 0) {
            this.client.error(`Lost request state in diagnostic pull model. Clearing diagnostics for ${key}`);
            this.diagnostics.delete(uri);
            return;
          }
          this.openRequests.delete(key);
          if (!this.tabs.isVisible(document)) {
            this.documentStates.unTrack(PullState.document, document);
            return;
          }
          if (afterState.state === RequestStateKind.outDated) {
            return;
          }
          if (report !== void 0) {
            if (report.kind === vsdiag.DocumentDiagnosticReportKind.full) {
              this.diagnostics.set(uri, report.items);
            }
            documentState.pulledVersion = version;
            documentState.resultId = report.resultId;
          }
          if (afterState.state === RequestStateKind.reschedule) {
            this.pull(document);
          }
        } else {
          if (currentRequestState.state === RequestStateKind.active) {
            currentRequestState.tokenSource.cancel();
            this.openRequests.set(key, { state: RequestStateKind.reschedule, document: currentRequestState.document });
          } else if (currentRequestState.state === RequestStateKind.outDated) {
            this.openRequests.set(key, { state: RequestStateKind.reschedule, document: currentRequestState.document });
          }
        }
      }
      forgetDocument(document) {
        const uri = document instanceof vscode_1.Uri ? document : document.uri;
        const key = uri.toString();
        const request = this.openRequests.get(key);
        if (this.options.workspaceDiagnostics) {
          if (request !== void 0) {
            this.openRequests.set(key, { state: RequestStateKind.reschedule, document });
          } else {
            this.pull(document, () => {
              this.forget(PullState.document, document);
            });
          }
        } else {
          if (request !== void 0) {
            if (request.state === RequestStateKind.active) {
              request.tokenSource.cancel();
            }
            this.openRequests.set(key, { state: RequestStateKind.outDated, document });
          }
          this.diagnostics.delete(uri);
          this.forget(PullState.document, document);
        }
      }
      pullWorkspace() {
        if (this.isDisposed) {
          return;
        }
        this.pullWorkspaceAsync().then(() => {
          this.workspaceTimeout = (0, vscode_languageserver_protocol_1.RAL)().timer.setTimeout(() => {
            this.pullWorkspace();
          }, 2e3);
        }, (error) => {
          if (!(error instanceof features_1.LSPCancellationError) && !vscode_languageserver_protocol_1.DiagnosticServerCancellationData.is(error.data)) {
            this.client.error(`Workspace diagnostic pull failed.`, error, false);
            this.workspaceErrorCounter++;
          }
          if (this.workspaceErrorCounter <= 5) {
            this.workspaceTimeout = (0, vscode_languageserver_protocol_1.RAL)().timer.setTimeout(() => {
              this.pullWorkspace();
            }, 2e3);
          }
        });
      }
      async pullWorkspaceAsync() {
        if (!this.provider.provideWorkspaceDiagnostics || this.isDisposed) {
          return;
        }
        if (this.workspaceCancellation !== void 0) {
          this.workspaceCancellation.cancel();
          this.workspaceCancellation = void 0;
        }
        this.workspaceCancellation = new vscode_1.CancellationTokenSource();
        const previousResultIds = this.documentStates.getAllResultIds().map((item) => {
          return {
            uri: this.client.protocol2CodeConverter.asUri(item.uri),
            value: item.value
          };
        });
        await this.provider.provideWorkspaceDiagnostics(previousResultIds, this.workspaceCancellation.token, (chunk) => {
          if (!chunk || this.isDisposed) {
            return;
          }
          for (const item of chunk.items) {
            if (item.kind === vsdiag.DocumentDiagnosticReportKind.full) {
              if (!this.documentStates.tracks(PullState.document, item.uri)) {
                this.diagnostics.set(item.uri, item.items);
              }
            }
            this.documentStates.update(PullState.workspace, item.uri, item.version ?? void 0, item.resultId);
          }
        });
      }
      createProvider() {
        const result = {
          onDidChangeDiagnostics: this.onDidChangeDiagnosticsEmitter.event,
          provideDiagnostics: (document, previousResultId, token) => {
            const provideDiagnostics = (document2, previousResultId2, token2) => {
              const params = {
                identifier: this.options.identifier,
                textDocument: { uri: this.client.code2ProtocolConverter.asUri(document2 instanceof vscode_1.Uri ? document2 : document2.uri) },
                previousResultId: previousResultId2
              };
              if (this.isDisposed === true || !this.client.isRunning()) {
                return { kind: vsdiag.DocumentDiagnosticReportKind.full, items: [] };
              }
              return this.client.sendRequest(vscode_languageserver_protocol_1.DocumentDiagnosticRequest.type, params, token2).then(async (result2) => {
                if (result2 === void 0 || result2 === null || this.isDisposed || token2.isCancellationRequested) {
                  return { kind: vsdiag.DocumentDiagnosticReportKind.full, items: [] };
                }
                if (result2.kind === vscode_languageserver_protocol_1.DocumentDiagnosticReportKind.Full) {
                  return { kind: vsdiag.DocumentDiagnosticReportKind.full, resultId: result2.resultId, items: await this.client.protocol2CodeConverter.asDiagnostics(result2.items, token2) };
                } else {
                  return { kind: vsdiag.DocumentDiagnosticReportKind.unChanged, resultId: result2.resultId };
                }
              }, (error) => {
                return this.client.handleFailedRequest(vscode_languageserver_protocol_1.DocumentDiagnosticRequest.type, token2, error, { kind: vsdiag.DocumentDiagnosticReportKind.full, items: [] });
              });
            };
            const middleware = this.client.middleware;
            return middleware.provideDiagnostics ? middleware.provideDiagnostics(document, previousResultId, token, provideDiagnostics) : provideDiagnostics(document, previousResultId, token);
          }
        };
        if (this.options.workspaceDiagnostics) {
          result.provideWorkspaceDiagnostics = (resultIds, token, resultReporter) => {
            const convertReport = async (report) => {
              if (report.kind === vscode_languageserver_protocol_1.DocumentDiagnosticReportKind.Full) {
                return {
                  kind: vsdiag.DocumentDiagnosticReportKind.full,
                  uri: this.client.protocol2CodeConverter.asUri(report.uri),
                  resultId: report.resultId,
                  version: report.version,
                  items: await this.client.protocol2CodeConverter.asDiagnostics(report.items, token)
                };
              } else {
                return {
                  kind: vsdiag.DocumentDiagnosticReportKind.unChanged,
                  uri: this.client.protocol2CodeConverter.asUri(report.uri),
                  resultId: report.resultId,
                  version: report.version
                };
              }
            };
            const convertPreviousResultIds = (resultIds2) => {
              const converted = [];
              for (const item of resultIds2) {
                converted.push({ uri: this.client.code2ProtocolConverter.asUri(item.uri), value: item.value });
              }
              return converted;
            };
            const provideDiagnostics = (resultIds2, token2) => {
              const partialResultToken = (0, uuid_1.generateUuid)();
              const disposable = this.client.onProgress(vscode_languageserver_protocol_1.WorkspaceDiagnosticRequest.partialResult, partialResultToken, async (partialResult) => {
                if (partialResult === void 0 || partialResult === null) {
                  resultReporter(null);
                  return;
                }
                const converted = {
                  items: []
                };
                for (const item of partialResult.items) {
                  try {
                    converted.items.push(await convertReport(item));
                  } catch (error) {
                    this.client.error(`Converting workspace diagnostics failed.`, error);
                  }
                }
                resultReporter(converted);
              });
              const params = {
                identifier: this.options.identifier,
                previousResultIds: convertPreviousResultIds(resultIds2),
                partialResultToken
              };
              if (this.isDisposed === true || !this.client.isRunning()) {
                return { items: [] };
              }
              return this.client.sendRequest(vscode_languageserver_protocol_1.WorkspaceDiagnosticRequest.type, params, token2).then(async (result2) => {
                if (token2.isCancellationRequested) {
                  return { items: [] };
                }
                const converted = {
                  items: []
                };
                for (const item of result2.items) {
                  converted.items.push(await convertReport(item));
                }
                disposable.dispose();
                resultReporter(converted);
                return { items: [] };
              }, (error) => {
                disposable.dispose();
                return this.client.handleFailedRequest(vscode_languageserver_protocol_1.DocumentDiagnosticRequest.type, token2, error, { items: [] });
              });
            };
            const middleware = this.client.middleware;
            return middleware.provideWorkspaceDiagnostics ? middleware.provideWorkspaceDiagnostics(resultIds, token, resultReporter, provideDiagnostics) : provideDiagnostics(resultIds, token, resultReporter);
          };
        }
        return result;
      }
      dispose() {
        this.isDisposed = true;
        this.workspaceCancellation?.cancel();
        this.workspaceTimeout?.dispose();
        for (const [key, request] of this.openRequests) {
          if (request.state === RequestStateKind.active) {
            request.tokenSource.cancel();
          }
          this.openRequests.set(key, { state: RequestStateKind.outDated, document: request.document });
        }
        this.diagnostics.dispose();
      }
    };
    var BackgroundScheduler = class {
      constructor(diagnosticRequestor) {
        this.diagnosticRequestor = diagnosticRequestor;
        this.documents = new vscode_languageserver_protocol_1.LinkedMap();
        this.isDisposed = false;
      }
      add(document) {
        if (this.isDisposed === true) {
          return;
        }
        const key = DocumentOrUri.asKey(document);
        if (this.documents.has(key)) {
          return;
        }
        this.documents.set(key, document, vscode_languageserver_protocol_1.Touch.Last);
        this.trigger();
      }
      remove(document) {
        const key = DocumentOrUri.asKey(document);
        this.documents.delete(key);
        if (this.documents.size === 0) {
          this.stop();
        } else if (key === this.endDocumentKey()) {
          this.endDocument = this.documents.last;
        }
      }
      trigger() {
        if (this.isDisposed === true) {
          return;
        }
        if (this.intervalHandle !== void 0) {
          this.endDocument = this.documents.last;
          return;
        }
        this.endDocument = this.documents.last;
        this.intervalHandle = (0, vscode_languageserver_protocol_1.RAL)().timer.setInterval(() => {
          const document = this.documents.first;
          if (document !== void 0) {
            const key = DocumentOrUri.asKey(document);
            this.diagnosticRequestor.pull(document);
            this.documents.set(key, document, vscode_languageserver_protocol_1.Touch.Last);
            if (key === this.endDocumentKey()) {
              this.stop();
            }
          }
        }, 200);
      }
      dispose() {
        this.isDisposed = true;
        this.stop();
        this.documents.clear();
      }
      stop() {
        this.intervalHandle?.dispose();
        this.intervalHandle = void 0;
        this.endDocument = void 0;
      }
      endDocumentKey() {
        return this.endDocument !== void 0 ? DocumentOrUri.asKey(this.endDocument) : void 0;
      }
    };
    var DiagnosticFeatureProviderImpl = class {
      constructor(client2, tabs, options) {
        const diagnosticPullOptions = client2.clientOptions.diagnosticPullOptions ?? { onChange: true, onSave: false };
        const documentSelector = client2.protocol2CodeConverter.asDocumentSelector(options.documentSelector);
        const disposables = [];
        const matchResource = (resource) => {
          const selector = options.documentSelector;
          if (diagnosticPullOptions.match !== void 0) {
            return diagnosticPullOptions.match(selector, resource);
          }
          for (const filter of selector) {
            if (!vscode_languageserver_protocol_1.TextDocumentFilter.is(filter)) {
              continue;
            }
            if (typeof filter === "string") {
              return false;
            }
            if (filter.language !== void 0 && filter.language !== "*") {
              return false;
            }
            if (filter.scheme !== void 0 && filter.scheme !== "*" && filter.scheme !== resource.scheme) {
              return false;
            }
            if (filter.pattern !== void 0) {
              const matcher = new minimatch.Minimatch(filter.pattern, { noext: true });
              if (!matcher.makeRe()) {
                return false;
              }
              if (!matcher.match(resource.fsPath)) {
                return false;
              }
            }
          }
          return true;
        };
        const matches = (document) => {
          return document instanceof vscode_1.Uri ? matchResource(document) : vscode_1.languages.match(documentSelector, document) > 0 && tabs.isVisible(document);
        };
        const isActiveDocument = (document) => {
          return document instanceof vscode_1.Uri ? this.activeTextDocument?.uri.toString() === document.toString() : this.activeTextDocument === document;
        };
        this.diagnosticRequestor = new DiagnosticRequestor(client2, tabs, options);
        this.backgroundScheduler = new BackgroundScheduler(this.diagnosticRequestor);
        const addToBackgroundIfNeeded = (document) => {
          if (!matches(document) || !options.interFileDependencies || isActiveDocument(document)) {
            return;
          }
          this.backgroundScheduler.add(document);
        };
        this.activeTextDocument = vscode_1.window.activeTextEditor?.document;
        vscode_1.window.onDidChangeActiveTextEditor((editor) => {
          const oldActive = this.activeTextDocument;
          this.activeTextDocument = editor?.document;
          if (oldActive !== void 0) {
            addToBackgroundIfNeeded(oldActive);
          }
          if (this.activeTextDocument !== void 0) {
            this.backgroundScheduler.remove(this.activeTextDocument);
          }
        });
        const openFeature = client2.getFeature(vscode_languageserver_protocol_1.DidOpenTextDocumentNotification.method);
        disposables.push(openFeature.onNotificationSent((event) => {
          const textDocument = event.textDocument;
          if (this.diagnosticRequestor.knows(PullState.document, textDocument)) {
            return;
          }
          if (matches(textDocument)) {
            this.diagnosticRequestor.pull(textDocument, () => {
              addToBackgroundIfNeeded(textDocument);
            });
          }
        }));
        disposables.push(tabs.onOpen((opened) => {
          for (const resource of opened) {
            if (this.diagnosticRequestor.knows(PullState.document, resource)) {
              continue;
            }
            const uriStr = resource.toString();
            let textDocument;
            for (const item of vscode_1.workspace.textDocuments) {
              if (uriStr === item.uri.toString()) {
                textDocument = item;
                break;
              }
            }
            if (textDocument !== void 0 && matches(textDocument)) {
              this.diagnosticRequestor.pull(textDocument, () => {
                addToBackgroundIfNeeded(textDocument);
              });
            }
          }
        }));
        const pulledTextDocuments = /* @__PURE__ */ new Set();
        for (const textDocument of vscode_1.workspace.textDocuments) {
          if (matches(textDocument)) {
            this.diagnosticRequestor.pull(textDocument, () => {
              addToBackgroundIfNeeded(textDocument);
            });
            pulledTextDocuments.add(textDocument.uri.toString());
          }
        }
        if (diagnosticPullOptions.onTabs === true) {
          for (const resource of tabs.getTabResources()) {
            if (!pulledTextDocuments.has(resource.toString()) && matches(resource)) {
              this.diagnosticRequestor.pull(resource, () => {
                addToBackgroundIfNeeded(resource);
              });
            }
          }
        }
        if (diagnosticPullOptions.onChange === true) {
          const changeFeature = client2.getFeature(vscode_languageserver_protocol_1.DidChangeTextDocumentNotification.method);
          disposables.push(changeFeature.onNotificationSent(async (event) => {
            const textDocument = event.textDocument;
            if ((diagnosticPullOptions.filter === void 0 || !diagnosticPullOptions.filter(textDocument, DiagnosticPullMode.onType)) && this.diagnosticRequestor.knows(PullState.document, textDocument)) {
              this.diagnosticRequestor.pull(textDocument, () => {
                this.backgroundScheduler.trigger();
              });
            }
          }));
        }
        if (diagnosticPullOptions.onSave === true) {
          const saveFeature = client2.getFeature(vscode_languageserver_protocol_1.DidSaveTextDocumentNotification.method);
          disposables.push(saveFeature.onNotificationSent((event) => {
            const textDocument = event.textDocument;
            if ((diagnosticPullOptions.filter === void 0 || !diagnosticPullOptions.filter(textDocument, DiagnosticPullMode.onSave)) && this.diagnosticRequestor.knows(PullState.document, textDocument)) {
              this.diagnosticRequestor.pull(event.textDocument, () => {
                this.backgroundScheduler.trigger();
              });
            }
          }));
        }
        const closeFeature = client2.getFeature(vscode_languageserver_protocol_1.DidCloseTextDocumentNotification.method);
        disposables.push(closeFeature.onNotificationSent((event) => {
          this.cleanUpDocument(event.textDocument);
        }));
        tabs.onClose((closed) => {
          for (const document of closed) {
            this.cleanUpDocument(document);
          }
        });
        this.diagnosticRequestor.onDidChangeDiagnosticsEmitter.event(() => {
          for (const textDocument of vscode_1.workspace.textDocuments) {
            if (matches(textDocument)) {
              this.diagnosticRequestor.pull(textDocument);
            }
          }
        });
        if (options.workspaceDiagnostics === true && options.identifier !== "da348dc5-c30a-4515-9d98-31ff3be38d14") {
          this.diagnosticRequestor.pullWorkspace();
        }
        this.disposable = vscode_1.Disposable.from(...disposables, this.backgroundScheduler, this.diagnosticRequestor);
      }
      get onDidChangeDiagnosticsEmitter() {
        return this.diagnosticRequestor.onDidChangeDiagnosticsEmitter;
      }
      get diagnostics() {
        return this.diagnosticRequestor.provider;
      }
      cleanUpDocument(document) {
        if (this.diagnosticRequestor.knows(PullState.document, document)) {
          this.diagnosticRequestor.forgetDocument(document);
          this.backgroundScheduler.remove(document);
        }
      }
    };
    var DiagnosticFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.DocumentDiagnosticRequest.type);
      }
      fillClientCapabilities(capabilities) {
        let capability = ensure(ensure(capabilities, "textDocument"), "diagnostic");
        capability.dynamicRegistration = true;
        capability.relatedDocumentSupport = false;
        ensure(ensure(capabilities, "workspace"), "diagnostics").refreshSupport = true;
      }
      initialize(capabilities, documentSelector) {
        const client2 = this._client;
        client2.onRequest(vscode_languageserver_protocol_1.DiagnosticRefreshRequest.type, async () => {
          for (const provider of this.getAllProviders()) {
            provider.onDidChangeDiagnosticsEmitter.fire();
          }
        });
        let [id, options] = this.getRegistration(documentSelector, capabilities.diagnosticProvider);
        if (!id || !options) {
          return;
        }
        this.register({ id, registerOptions: options });
      }
      clear() {
        if (this.tabs !== void 0) {
          this.tabs.dispose();
          this.tabs = void 0;
        }
        super.clear();
      }
      registerLanguageProvider(options) {
        if (this.tabs === void 0) {
          this.tabs = new Tabs();
        }
        const provider = new DiagnosticFeatureProviderImpl(this._client, this.tabs, options);
        return [provider.disposable, provider];
      }
    };
    exports2.DiagnosticFeature = DiagnosticFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/notebook.js
var require_notebook = __commonJS({
  "node_modules/vscode-languageclient/lib/common/notebook.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.NotebookDocumentSyncFeature = void 0;
    var vscode14 = require("vscode");
    var minimatch = require_minimatch();
    var proto = require_main3();
    var UUID = require_uuid();
    var Is = require_is();
    function ensure(target, key) {
      if (target[key] === void 0) {
        target[key] = {};
      }
      return target[key];
    }
    var Converter;
    (function(Converter2) {
      let c2p;
      (function(c2p2) {
        function asVersionedNotebookDocumentIdentifier(notebookDocument, base) {
          return {
            version: notebookDocument.version,
            uri: base.asUri(notebookDocument.uri)
          };
        }
        c2p2.asVersionedNotebookDocumentIdentifier = asVersionedNotebookDocumentIdentifier;
        function asNotebookDocument(notebookDocument, cells, base) {
          const result = proto.NotebookDocument.create(base.asUri(notebookDocument.uri), notebookDocument.notebookType, notebookDocument.version, asNotebookCells(cells, base));
          if (Object.keys(notebookDocument.metadata).length > 0) {
            result.metadata = asMetadata(notebookDocument.metadata);
          }
          return result;
        }
        c2p2.asNotebookDocument = asNotebookDocument;
        function asNotebookCells(cells, base) {
          return cells.map((cell) => asNotebookCell(cell, base));
        }
        c2p2.asNotebookCells = asNotebookCells;
        function asMetadata(metadata) {
          const seen = /* @__PURE__ */ new Set();
          return deepCopy(seen, metadata);
        }
        c2p2.asMetadata = asMetadata;
        function asNotebookCell(cell, base) {
          const result = proto.NotebookCell.create(asNotebookCellKind(cell.kind), base.asUri(cell.document.uri));
          if (Object.keys(cell.metadata).length > 0) {
            result.metadata = asMetadata(cell.metadata);
          }
          if (cell.executionSummary !== void 0 && (Is.number(cell.executionSummary.executionOrder) && Is.boolean(cell.executionSummary.success))) {
            result.executionSummary = {
              executionOrder: cell.executionSummary.executionOrder,
              success: cell.executionSummary.success
            };
          }
          return result;
        }
        c2p2.asNotebookCell = asNotebookCell;
        function asNotebookCellKind(kind) {
          switch (kind) {
            case vscode14.NotebookCellKind.Markup:
              return proto.NotebookCellKind.Markup;
            case vscode14.NotebookCellKind.Code:
              return proto.NotebookCellKind.Code;
          }
        }
        function deepCopy(seen, value) {
          if (seen.has(value)) {
            throw new Error(`Can't deep copy cyclic structures.`);
          }
          if (Array.isArray(value)) {
            const result = [];
            for (const elem of value) {
              if (elem !== null && typeof elem === "object" || Array.isArray(elem)) {
                result.push(deepCopy(seen, elem));
              } else {
                if (elem instanceof RegExp) {
                  throw new Error(`Can't transfer regular expressions to the server`);
                }
                result.push(elem);
              }
            }
            return result;
          } else {
            const props = Object.keys(value);
            const result = /* @__PURE__ */ Object.create(null);
            for (const prop of props) {
              const elem = value[prop];
              if (elem !== null && typeof elem === "object" || Array.isArray(elem)) {
                result[prop] = deepCopy(seen, elem);
              } else {
                if (elem instanceof RegExp) {
                  throw new Error(`Can't transfer regular expressions to the server`);
                }
                result[prop] = elem;
              }
            }
            return result;
          }
        }
        function asTextContentChange(event, base) {
          const params = base.asChangeTextDocumentParams(event, event.document.uri, event.document.version);
          return { document: params.textDocument, changes: params.contentChanges };
        }
        c2p2.asTextContentChange = asTextContentChange;
        function asNotebookDocumentChangeEvent(event, base) {
          const result = /* @__PURE__ */ Object.create(null);
          if (event.metadata) {
            result.metadata = Converter2.c2p.asMetadata(event.metadata);
          }
          if (event.cells !== void 0) {
            const cells = /* @__PURE__ */ Object.create(null);
            const changedCells = event.cells;
            if (changedCells.structure) {
              cells.structure = {
                array: {
                  start: changedCells.structure.array.start,
                  deleteCount: changedCells.structure.array.deleteCount,
                  cells: changedCells.structure.array.cells !== void 0 ? changedCells.structure.array.cells.map((cell) => Converter2.c2p.asNotebookCell(cell, base)) : void 0
                },
                didOpen: changedCells.structure.didOpen !== void 0 ? changedCells.structure.didOpen.map((cell) => base.asOpenTextDocumentParams(cell.document).textDocument) : void 0,
                didClose: changedCells.structure.didClose !== void 0 ? changedCells.structure.didClose.map((cell) => base.asCloseTextDocumentParams(cell.document).textDocument) : void 0
              };
            }
            if (changedCells.data !== void 0) {
              cells.data = changedCells.data.map((cell) => Converter2.c2p.asNotebookCell(cell, base));
            }
            if (changedCells.textContent !== void 0) {
              cells.textContent = changedCells.textContent.map((event2) => Converter2.c2p.asTextContentChange(event2, base));
            }
            if (Object.keys(cells).length > 0) {
              result.cells = cells;
            }
          }
          return result;
        }
        c2p2.asNotebookDocumentChangeEvent = asNotebookDocumentChangeEvent;
      })(c2p = Converter2.c2p || (Converter2.c2p = {}));
    })(Converter || (Converter = {}));
    var $NotebookCell;
    (function($NotebookCell2) {
      function computeDiff(originalCells, modifiedCells, compareMetadata) {
        const originalLength = originalCells.length;
        const modifiedLength = modifiedCells.length;
        let startIndex = 0;
        while (startIndex < modifiedLength && startIndex < originalLength && equals(originalCells[startIndex], modifiedCells[startIndex], compareMetadata)) {
          startIndex++;
        }
        if (startIndex < modifiedLength && startIndex < originalLength) {
          let originalEndIndex = originalLength - 1;
          let modifiedEndIndex = modifiedLength - 1;
          while (originalEndIndex >= 0 && modifiedEndIndex >= 0 && equals(originalCells[originalEndIndex], modifiedCells[modifiedEndIndex], compareMetadata)) {
            originalEndIndex--;
            modifiedEndIndex--;
          }
          const deleteCount = originalEndIndex + 1 - startIndex;
          const newCells = startIndex === modifiedEndIndex + 1 ? void 0 : modifiedCells.slice(startIndex, modifiedEndIndex + 1);
          return newCells !== void 0 ? { start: startIndex, deleteCount, cells: newCells } : { start: startIndex, deleteCount };
        } else if (startIndex < modifiedLength) {
          return { start: startIndex, deleteCount: 0, cells: modifiedCells.slice(startIndex) };
        } else if (startIndex < originalLength) {
          return { start: startIndex, deleteCount: originalLength - startIndex };
        } else {
          return void 0;
        }
      }
      $NotebookCell2.computeDiff = computeDiff;
      function equals(one, other, compareMetaData = true) {
        if (one.kind !== other.kind || one.document.uri.toString() !== other.document.uri.toString() || one.document.languageId !== other.document.languageId || !equalsExecution(one.executionSummary, other.executionSummary)) {
          return false;
        }
        return !compareMetaData || compareMetaData && equalsMetadata(one.metadata, other.metadata);
      }
      function equalsExecution(one, other) {
        if (one === other) {
          return true;
        }
        if (one === void 0 || other === void 0) {
          return false;
        }
        return one.executionOrder === other.executionOrder && one.success === other.success && equalsTiming(one.timing, other.timing);
      }
      function equalsTiming(one, other) {
        if (one === other) {
          return true;
        }
        if (one === void 0 || other === void 0) {
          return false;
        }
        return one.startTime === other.startTime && one.endTime === other.endTime;
      }
      function equalsMetadata(one, other) {
        if (one === other) {
          return true;
        }
        if (one === null || one === void 0 || other === null || other === void 0) {
          return false;
        }
        if (typeof one !== typeof other) {
          return false;
        }
        if (typeof one !== "object") {
          return false;
        }
        const oneArray = Array.isArray(one);
        const otherArray = Array.isArray(other);
        if (oneArray !== otherArray) {
          return false;
        }
        if (oneArray && otherArray) {
          if (one.length !== other.length) {
            return false;
          }
          for (let i = 0; i < one.length; i++) {
            if (!equalsMetadata(one[i], other[i])) {
              return false;
            }
          }
        }
        if (isObjectLiteral(one) && isObjectLiteral(other)) {
          const oneKeys = Object.keys(one);
          const otherKeys = Object.keys(other);
          if (oneKeys.length !== otherKeys.length) {
            return false;
          }
          oneKeys.sort();
          otherKeys.sort();
          if (!equalsMetadata(oneKeys, otherKeys)) {
            return false;
          }
          for (let i = 0; i < oneKeys.length; i++) {
            const prop = oneKeys[i];
            if (!equalsMetadata(one[prop], other[prop])) {
              return false;
            }
          }
          return true;
        }
        return false;
      }
      function isObjectLiteral(value) {
        return value !== null && typeof value === "object";
      }
      $NotebookCell2.isObjectLiteral = isObjectLiteral;
    })($NotebookCell || ($NotebookCell = {}));
    var $NotebookDocumentFilter;
    (function($NotebookDocumentFilter2) {
      function matchNotebook(filter, notebookDocument) {
        if (typeof filter === "string") {
          return filter === "*" || notebookDocument.notebookType === filter;
        }
        if (filter.notebookType !== void 0 && filter.notebookType !== "*" && notebookDocument.notebookType !== filter.notebookType) {
          return false;
        }
        const uri = notebookDocument.uri;
        if (filter.scheme !== void 0 && filter.scheme !== "*" && uri.scheme !== filter.scheme) {
          return false;
        }
        if (filter.pattern !== void 0) {
          const matcher = new minimatch.Minimatch(filter.pattern, { noext: true });
          if (!matcher.makeRe()) {
            return false;
          }
          if (!matcher.match(uri.fsPath)) {
            return false;
          }
        }
        return true;
      }
      $NotebookDocumentFilter2.matchNotebook = matchNotebook;
    })($NotebookDocumentFilter || ($NotebookDocumentFilter = {}));
    var $NotebookDocumentSyncOptions;
    (function($NotebookDocumentSyncOptions2) {
      function asDocumentSelector(options) {
        const selector = options.notebookSelector;
        const result = [];
        for (const element of selector) {
          const notebookType = (typeof element.notebook === "string" ? element.notebook : element.notebook?.notebookType) ?? "*";
          const scheme = typeof element.notebook === "string" ? void 0 : element.notebook?.scheme;
          const pattern = typeof element.notebook === "string" ? void 0 : element.notebook?.pattern;
          if (element.cells !== void 0) {
            for (const cell of element.cells) {
              result.push(asDocumentFilter(notebookType, scheme, pattern, cell.language));
            }
          } else {
            result.push(asDocumentFilter(notebookType, scheme, pattern, void 0));
          }
        }
        return result;
      }
      $NotebookDocumentSyncOptions2.asDocumentSelector = asDocumentSelector;
      function asDocumentFilter(notebookType, scheme, pattern, language) {
        return scheme === void 0 && pattern === void 0 ? { notebook: notebookType, language } : { notebook: { notebookType, scheme, pattern }, language };
      }
    })($NotebookDocumentSyncOptions || ($NotebookDocumentSyncOptions = {}));
    var SyncInfo;
    (function(SyncInfo2) {
      function create(cells) {
        return {
          cells,
          uris: new Set(cells.map((cell) => cell.document.uri.toString()))
        };
      }
      SyncInfo2.create = create;
    })(SyncInfo || (SyncInfo = {}));
    var NotebookDocumentSyncFeatureProvider = class {
      constructor(client2, options) {
        this.client = client2;
        this.options = options;
        this.notebookSyncInfo = /* @__PURE__ */ new Map();
        this.notebookDidOpen = /* @__PURE__ */ new Set();
        this.disposables = [];
        this.selector = client2.protocol2CodeConverter.asDocumentSelector($NotebookDocumentSyncOptions.asDocumentSelector(options));
        vscode14.workspace.onDidOpenNotebookDocument((notebookDocument) => {
          this.notebookDidOpen.add(notebookDocument.uri.toString());
          this.didOpen(notebookDocument);
        }, void 0, this.disposables);
        for (const notebookDocument of vscode14.workspace.notebookDocuments) {
          this.notebookDidOpen.add(notebookDocument.uri.toString());
          this.didOpen(notebookDocument);
        }
        vscode14.workspace.onDidChangeNotebookDocument((event) => this.didChangeNotebookDocument(event), void 0, this.disposables);
        if (this.options.save === true) {
          vscode14.workspace.onDidSaveNotebookDocument((notebookDocument) => this.didSave(notebookDocument), void 0, this.disposables);
        }
        vscode14.workspace.onDidCloseNotebookDocument((notebookDocument) => {
          this.didClose(notebookDocument);
          this.notebookDidOpen.delete(notebookDocument.uri.toString());
        }, void 0, this.disposables);
      }
      getState() {
        for (const notebook of vscode14.workspace.notebookDocuments) {
          const matchingCells = this.getMatchingCells(notebook);
          if (matchingCells !== void 0) {
            return { kind: "document", id: "$internal", registrations: true, matches: true };
          }
        }
        return { kind: "document", id: "$internal", registrations: true, matches: false };
      }
      get mode() {
        return "notebook";
      }
      handles(textDocument) {
        return vscode14.languages.match(this.selector, textDocument) > 0;
      }
      didOpenNotebookCellTextDocument(notebookDocument, cell) {
        if (vscode14.languages.match(this.selector, cell.document) === 0) {
          return;
        }
        if (!this.notebookDidOpen.has(notebookDocument.uri.toString())) {
          return;
        }
        const syncInfo = this.notebookSyncInfo.get(notebookDocument.uri.toString());
        const cellMatches = this.cellMatches(notebookDocument, cell);
        if (syncInfo !== void 0) {
          const cellIsSynced = syncInfo.uris.has(cell.document.uri.toString());
          if (cellMatches && cellIsSynced || !cellMatches && !cellIsSynced) {
            return;
          }
          if (cellMatches) {
            const matchingCells = this.getMatchingCells(notebookDocument);
            if (matchingCells !== void 0) {
              const event = this.asNotebookDocumentChangeEvent(notebookDocument, void 0, syncInfo, matchingCells);
              if (event !== void 0) {
                this.doSendChange(event, matchingCells).catch(() => {
                });
              }
            }
          }
        } else {
          if (cellMatches) {
            this.doSendOpen(notebookDocument, [cell]).catch(() => {
            });
          }
        }
      }
      didChangeNotebookCellTextDocument(notebookDocument, event) {
        if (vscode14.languages.match(this.selector, event.document) === 0) {
          return;
        }
        this.doSendChange({
          notebook: notebookDocument,
          cells: { textContent: [event] }
        }, void 0).catch(() => {
        });
      }
      didCloseNotebookCellTextDocument(notebookDocument, cell) {
        const syncInfo = this.notebookSyncInfo.get(notebookDocument.uri.toString());
        if (syncInfo === void 0) {
          return;
        }
        const cellUri = cell.document.uri;
        const index = syncInfo.cells.findIndex((item) => item.document.uri.toString() === cellUri.toString());
        if (index === -1) {
          return;
        }
        if (index === 0 && syncInfo.cells.length === 1) {
          this.doSendClose(notebookDocument, syncInfo.cells).catch(() => {
          });
        } else {
          const newCells = syncInfo.cells.slice();
          const deleted = newCells.splice(index, 1);
          this.doSendChange({
            notebook: notebookDocument,
            cells: {
              structure: {
                array: { start: index, deleteCount: 1 },
                didClose: deleted
              }
            }
          }, newCells).catch(() => {
          });
        }
      }
      dispose() {
        for (const disposable of this.disposables) {
          disposable.dispose();
        }
      }
      didOpen(notebookDocument, matchingCells = this.getMatchingCells(notebookDocument), syncInfo = this.notebookSyncInfo.get(notebookDocument.uri.toString())) {
        if (syncInfo !== void 0) {
          if (matchingCells !== void 0) {
            const event = this.asNotebookDocumentChangeEvent(notebookDocument, void 0, syncInfo, matchingCells);
            if (event !== void 0) {
              this.doSendChange(event, matchingCells).catch(() => {
              });
            }
          } else {
            this.doSendClose(notebookDocument, []).catch(() => {
            });
          }
        } else {
          if (matchingCells === void 0) {
            return;
          }
          this.doSendOpen(notebookDocument, matchingCells).catch(() => {
          });
        }
      }
      didChangeNotebookDocument(event) {
        const notebookDocument = event.notebook;
        const syncInfo = this.notebookSyncInfo.get(notebookDocument.uri.toString());
        if (syncInfo === void 0) {
          if (event.contentChanges.length === 0) {
            return;
          }
          const cells = this.getMatchingCells(notebookDocument);
          if (cells === void 0) {
            return;
          }
          this.didOpen(notebookDocument, cells, syncInfo);
        } else {
          const cells = this.getMatchingCells(notebookDocument);
          if (cells === void 0) {
            this.didClose(notebookDocument, syncInfo);
            return;
          }
          const newEvent = this.asNotebookDocumentChangeEvent(event.notebook, event, syncInfo, cells);
          if (newEvent !== void 0) {
            this.doSendChange(newEvent, cells).catch(() => {
            });
          }
        }
      }
      didSave(notebookDocument) {
        const syncInfo = this.notebookSyncInfo.get(notebookDocument.uri.toString());
        if (syncInfo === void 0) {
          return;
        }
        this.doSendSave(notebookDocument).catch(() => {
        });
      }
      didClose(notebookDocument, syncInfo = this.notebookSyncInfo.get(notebookDocument.uri.toString())) {
        if (syncInfo === void 0) {
          return;
        }
        const syncedCells = notebookDocument.getCells().filter((cell) => syncInfo.uris.has(cell.document.uri.toString()));
        this.doSendClose(notebookDocument, syncedCells).catch(() => {
        });
      }
      async sendDidOpenNotebookDocument(notebookDocument) {
        const cells = this.getMatchingCells(notebookDocument);
        if (cells === void 0) {
          return;
        }
        return this.doSendOpen(notebookDocument, cells);
      }
      async doSendOpen(notebookDocument, cells) {
        const send = async (notebookDocument2, cells2) => {
          const nb = Converter.c2p.asNotebookDocument(notebookDocument2, cells2, this.client.code2ProtocolConverter);
          const cellDocuments = cells2.map((cell) => this.client.code2ProtocolConverter.asTextDocumentItem(cell.document));
          try {
            await this.client.sendNotification(proto.DidOpenNotebookDocumentNotification.type, {
              notebookDocument: nb,
              cellTextDocuments: cellDocuments
            });
          } catch (error) {
            this.client.error("Sending DidOpenNotebookDocumentNotification failed", error);
            throw error;
          }
        };
        const middleware = this.client.middleware?.notebooks;
        this.notebookSyncInfo.set(notebookDocument.uri.toString(), SyncInfo.create(cells));
        return middleware?.didOpen !== void 0 ? middleware.didOpen(notebookDocument, cells, send) : send(notebookDocument, cells);
      }
      async sendDidChangeNotebookDocument(event) {
        return this.doSendChange(event, void 0);
      }
      async doSendChange(event, cells = this.getMatchingCells(event.notebook)) {
        const send = async (event2) => {
          try {
            await this.client.sendNotification(proto.DidChangeNotebookDocumentNotification.type, {
              notebookDocument: Converter.c2p.asVersionedNotebookDocumentIdentifier(event2.notebook, this.client.code2ProtocolConverter),
              change: Converter.c2p.asNotebookDocumentChangeEvent(event2, this.client.code2ProtocolConverter)
            });
          } catch (error) {
            this.client.error("Sending DidChangeNotebookDocumentNotification failed", error);
            throw error;
          }
        };
        const middleware = this.client.middleware?.notebooks;
        if (event.cells?.structure !== void 0) {
          this.notebookSyncInfo.set(event.notebook.uri.toString(), SyncInfo.create(cells ?? []));
        }
        return middleware?.didChange !== void 0 ? middleware?.didChange(event, send) : send(event);
      }
      async sendDidSaveNotebookDocument(notebookDocument) {
        return this.doSendSave(notebookDocument);
      }
      async doSendSave(notebookDocument) {
        const send = async (notebookDocument2) => {
          try {
            await this.client.sendNotification(proto.DidSaveNotebookDocumentNotification.type, {
              notebookDocument: { uri: this.client.code2ProtocolConverter.asUri(notebookDocument2.uri) }
            });
          } catch (error) {
            this.client.error("Sending DidSaveNotebookDocumentNotification failed", error);
            throw error;
          }
        };
        const middleware = this.client.middleware?.notebooks;
        return middleware?.didSave !== void 0 ? middleware.didSave(notebookDocument, send) : send(notebookDocument);
      }
      async sendDidCloseNotebookDocument(notebookDocument) {
        return this.doSendClose(notebookDocument, this.getMatchingCells(notebookDocument) ?? []);
      }
      async doSendClose(notebookDocument, cells) {
        const send = async (notebookDocument2, cells2) => {
          try {
            await this.client.sendNotification(proto.DidCloseNotebookDocumentNotification.type, {
              notebookDocument: { uri: this.client.code2ProtocolConverter.asUri(notebookDocument2.uri) },
              cellTextDocuments: cells2.map((cell) => this.client.code2ProtocolConverter.asTextDocumentIdentifier(cell.document))
            });
          } catch (error) {
            this.client.error("Sending DidCloseNotebookDocumentNotification failed", error);
            throw error;
          }
        };
        const middleware = this.client.middleware?.notebooks;
        this.notebookSyncInfo.delete(notebookDocument.uri.toString());
        return middleware?.didClose !== void 0 ? middleware.didClose(notebookDocument, cells, send) : send(notebookDocument, cells);
      }
      asNotebookDocumentChangeEvent(notebook, event, syncInfo, matchingCells) {
        if (event !== void 0 && event.notebook !== notebook) {
          throw new Error("Notebook must be identical");
        }
        const result = {
          notebook
        };
        if (event?.metadata !== void 0) {
          result.metadata = Converter.c2p.asMetadata(event.metadata);
        }
        let matchingCellsSet;
        if (event?.cellChanges !== void 0 && event.cellChanges.length > 0) {
          const data = [];
          matchingCellsSet = new Set(matchingCells.map((cell) => cell.document.uri.toString()));
          for (const cellChange of event.cellChanges) {
            if (matchingCellsSet.has(cellChange.cell.document.uri.toString()) && (cellChange.executionSummary !== void 0 || cellChange.metadata !== void 0)) {
              data.push(cellChange.cell);
            }
          }
          if (data.length > 0) {
            result.cells = result.cells ?? {};
            result.cells.data = data;
          }
        }
        if ((event?.contentChanges !== void 0 && event.contentChanges.length > 0 || event === void 0) && syncInfo !== void 0 && matchingCells !== void 0) {
          const oldCells = syncInfo.cells;
          const newCells = matchingCells;
          const diff = $NotebookCell.computeDiff(oldCells, newCells, false);
          let addedCells;
          let removedCells;
          if (diff !== void 0) {
            addedCells = diff.cells === void 0 ? /* @__PURE__ */ new Map() : new Map(diff.cells.map((cell) => [cell.document.uri.toString(), cell]));
            removedCells = diff.deleteCount === 0 ? /* @__PURE__ */ new Map() : new Map(oldCells.slice(diff.start, diff.start + diff.deleteCount).map((cell) => [cell.document.uri.toString(), cell]));
            for (const key of Array.from(removedCells.keys())) {
              if (addedCells.has(key)) {
                removedCells.delete(key);
                addedCells.delete(key);
              }
            }
            result.cells = result.cells ?? {};
            const didOpen = [];
            const didClose = [];
            if (addedCells.size > 0 || removedCells.size > 0) {
              for (const cell of addedCells.values()) {
                didOpen.push(cell);
              }
              for (const cell of removedCells.values()) {
                didClose.push(cell);
              }
            }
            result.cells.structure = {
              array: diff,
              didOpen,
              didClose
            };
          }
        }
        return Object.keys(result).length > 1 ? result : void 0;
      }
      getMatchingCells(notebookDocument, cells = notebookDocument.getCells()) {
        if (this.options.notebookSelector === void 0) {
          return void 0;
        }
        for (const item of this.options.notebookSelector) {
          if (item.notebook === void 0 || $NotebookDocumentFilter.matchNotebook(item.notebook, notebookDocument)) {
            const filtered = this.filterCells(notebookDocument, cells, item.cells);
            return filtered.length === 0 ? void 0 : filtered;
          }
        }
        return void 0;
      }
      cellMatches(notebookDocument, cell) {
        const cells = this.getMatchingCells(notebookDocument, [cell]);
        return cells !== void 0 && cells[0] === cell;
      }
      filterCells(notebookDocument, cells, cellSelector) {
        const filtered = cellSelector !== void 0 ? cells.filter((cell) => {
          const cellLanguage = cell.document.languageId;
          return cellSelector.some(((filter) => filter.language === "*" || cellLanguage === filter.language));
        }) : cells;
        return typeof this.client.clientOptions.notebookDocumentOptions?.filterCells === "function" ? this.client.clientOptions.notebookDocumentOptions.filterCells(notebookDocument, filtered) : filtered;
      }
    };
    var NotebookDocumentSyncFeature = class _NotebookDocumentSyncFeature {
      constructor(client2) {
        this.client = client2;
        this.registrations = /* @__PURE__ */ new Map();
        this.registrationType = proto.NotebookDocumentSyncRegistrationType.type;
        vscode14.workspace.onDidOpenTextDocument((textDocument) => {
          if (textDocument.uri.scheme !== _NotebookDocumentSyncFeature.CellScheme) {
            return;
          }
          const [notebookDocument, notebookCell] = this.findNotebookDocumentAndCell(textDocument);
          if (notebookDocument === void 0 || notebookCell === void 0) {
            return;
          }
          for (const provider of this.registrations.values()) {
            if (provider instanceof NotebookDocumentSyncFeatureProvider) {
              provider.didOpenNotebookCellTextDocument(notebookDocument, notebookCell);
            }
          }
        });
        vscode14.workspace.onDidChangeTextDocument((event) => {
          if (event.contentChanges.length === 0) {
            return;
          }
          const textDocument = event.document;
          if (textDocument.uri.scheme !== _NotebookDocumentSyncFeature.CellScheme) {
            return;
          }
          const [notebookDocument] = this.findNotebookDocumentAndCell(textDocument);
          if (notebookDocument === void 0) {
            return;
          }
          for (const provider of this.registrations.values()) {
            if (provider instanceof NotebookDocumentSyncFeatureProvider) {
              provider.didChangeNotebookCellTextDocument(notebookDocument, event);
            }
          }
        });
        vscode14.workspace.onDidCloseTextDocument((textDocument) => {
          if (textDocument.uri.scheme !== _NotebookDocumentSyncFeature.CellScheme) {
            return;
          }
          const [notebookDocument, notebookCell] = this.findNotebookDocumentAndCell(textDocument);
          if (notebookDocument === void 0 || notebookCell === void 0) {
            return;
          }
          for (const provider of this.registrations.values()) {
            if (provider instanceof NotebookDocumentSyncFeatureProvider) {
              provider.didCloseNotebookCellTextDocument(notebookDocument, notebookCell);
            }
          }
        });
      }
      getState() {
        if (this.registrations.size === 0) {
          return { kind: "document", id: this.registrationType.method, registrations: false, matches: false };
        }
        for (const provider of this.registrations.values()) {
          const state = provider.getState();
          if (state.kind === "document" && state.registrations === true && state.matches === true) {
            return { kind: "document", id: this.registrationType.method, registrations: true, matches: true };
          }
        }
        return { kind: "document", id: this.registrationType.method, registrations: true, matches: false };
      }
      fillClientCapabilities(capabilities) {
        const synchronization = ensure(ensure(capabilities, "notebookDocument"), "synchronization");
        synchronization.dynamicRegistration = true;
        synchronization.executionSummarySupport = true;
      }
      preInitialize(capabilities) {
        const options = capabilities.notebookDocumentSync;
        if (options === void 0) {
          return;
        }
        this.dedicatedChannel = this.client.protocol2CodeConverter.asDocumentSelector($NotebookDocumentSyncOptions.asDocumentSelector(options));
      }
      initialize(capabilities) {
        const options = capabilities.notebookDocumentSync;
        if (options === void 0) {
          return;
        }
        const id = options.id ?? UUID.generateUuid();
        this.register({ id, registerOptions: options });
      }
      register(data) {
        const provider = new NotebookDocumentSyncFeatureProvider(this.client, data.registerOptions);
        this.registrations.set(data.id, provider);
      }
      unregister(id) {
        const provider = this.registrations.get(id);
        provider && provider.dispose();
      }
      clear() {
        for (const provider of this.registrations.values()) {
          provider.dispose();
        }
        this.registrations.clear();
      }
      handles(textDocument) {
        if (textDocument.uri.scheme !== _NotebookDocumentSyncFeature.CellScheme) {
          return false;
        }
        if (this.dedicatedChannel !== void 0 && vscode14.languages.match(this.dedicatedChannel, textDocument) > 0) {
          return true;
        }
        for (const provider of this.registrations.values()) {
          if (provider.handles(textDocument)) {
            return true;
          }
        }
        return false;
      }
      getProvider(notebookCell) {
        for (const provider of this.registrations.values()) {
          if (provider.handles(notebookCell.document)) {
            return provider;
          }
        }
        return void 0;
      }
      findNotebookDocumentAndCell(textDocument) {
        const uri = textDocument.uri.toString();
        for (const notebookDocument of vscode14.workspace.notebookDocuments) {
          for (const cell of notebookDocument.getCells()) {
            if (cell.document.uri.toString() === uri) {
              return [notebookDocument, cell];
            }
          }
        }
        return [void 0, void 0];
      }
    };
    exports2.NotebookDocumentSyncFeature = NotebookDocumentSyncFeature;
    NotebookDocumentSyncFeature.CellScheme = "vscode-notebook-cell";
  }
});

// node_modules/vscode-languageclient/lib/common/configuration.js
var require_configuration = __commonJS({
  "node_modules/vscode-languageclient/lib/common/configuration.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SyncConfigurationFeature = exports2.toJSONObject = exports2.ConfigurationFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var Is = require_is();
    var UUID = require_uuid();
    var features_1 = require_features();
    var ConfigurationFeature = class {
      constructor(client2) {
        this._client = client2;
      }
      getState() {
        return { kind: "static" };
      }
      fillClientCapabilities(capabilities) {
        capabilities.workspace = capabilities.workspace || {};
        capabilities.workspace.configuration = true;
      }
      initialize() {
        let client2 = this._client;
        client2.onRequest(vscode_languageserver_protocol_1.ConfigurationRequest.type, (params, token) => {
          let configuration = (params2) => {
            let result = [];
            for (let item of params2.items) {
              let resource = item.scopeUri !== void 0 && item.scopeUri !== null ? this._client.protocol2CodeConverter.asUri(item.scopeUri) : void 0;
              result.push(this.getConfiguration(resource, item.section !== null ? item.section : void 0));
            }
            return result;
          };
          let middleware = client2.middleware.workspace;
          return middleware && middleware.configuration ? middleware.configuration(params, token, configuration) : configuration(params, token);
        });
      }
      getConfiguration(resource, section) {
        let result = null;
        if (section) {
          let index = section.lastIndexOf(".");
          if (index === -1) {
            result = toJSONObject(vscode_1.workspace.getConfiguration(void 0, resource).get(section));
          } else {
            let config = vscode_1.workspace.getConfiguration(section.substr(0, index), resource);
            if (config) {
              result = toJSONObject(config.get(section.substr(index + 1)));
            }
          }
        } else {
          let config = vscode_1.workspace.getConfiguration(void 0, resource);
          result = {};
          for (let key of Object.keys(config)) {
            if (config.has(key)) {
              result[key] = toJSONObject(config.get(key));
            }
          }
        }
        if (result === void 0) {
          result = null;
        }
        return result;
      }
      clear() {
      }
    };
    exports2.ConfigurationFeature = ConfigurationFeature;
    function toJSONObject(obj) {
      if (obj) {
        if (Array.isArray(obj)) {
          return obj.map(toJSONObject);
        } else if (typeof obj === "object") {
          const res = /* @__PURE__ */ Object.create(null);
          for (const key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key)) {
              res[key] = toJSONObject(obj[key]);
            }
          }
          return res;
        }
      }
      return obj;
    }
    exports2.toJSONObject = toJSONObject;
    var SyncConfigurationFeature = class {
      constructor(_client) {
        this._client = _client;
        this.isCleared = false;
        this._listeners = /* @__PURE__ */ new Map();
      }
      getState() {
        return { kind: "workspace", id: this.registrationType.method, registrations: this._listeners.size > 0 };
      }
      get registrationType() {
        return vscode_languageserver_protocol_1.DidChangeConfigurationNotification.type;
      }
      fillClientCapabilities(capabilities) {
        (0, features_1.ensure)((0, features_1.ensure)(capabilities, "workspace"), "didChangeConfiguration").dynamicRegistration = true;
      }
      initialize() {
        this.isCleared = false;
        let section = this._client.clientOptions.synchronize?.configurationSection;
        if (section !== void 0) {
          this.register({
            id: UUID.generateUuid(),
            registerOptions: {
              section
            }
          });
        }
      }
      register(data) {
        let disposable = vscode_1.workspace.onDidChangeConfiguration((event) => {
          this.onDidChangeConfiguration(data.registerOptions.section, event);
        });
        this._listeners.set(data.id, disposable);
        if (data.registerOptions.section !== void 0) {
          this.onDidChangeConfiguration(data.registerOptions.section, void 0);
        }
      }
      unregister(id) {
        let disposable = this._listeners.get(id);
        if (disposable) {
          this._listeners.delete(id);
          disposable.dispose();
        }
      }
      clear() {
        for (const disposable of this._listeners.values()) {
          disposable.dispose();
        }
        this._listeners.clear();
        this.isCleared = true;
      }
      onDidChangeConfiguration(configurationSection, event) {
        if (this.isCleared) {
          return;
        }
        let sections;
        if (Is.string(configurationSection)) {
          sections = [configurationSection];
        } else {
          sections = configurationSection;
        }
        if (sections !== void 0 && event !== void 0) {
          let affected = sections.some((section) => event.affectsConfiguration(section));
          if (!affected) {
            return;
          }
        }
        const didChangeConfiguration = async (sections2) => {
          if (sections2 === void 0) {
            return this._client.sendNotification(vscode_languageserver_protocol_1.DidChangeConfigurationNotification.type, { settings: null });
          } else {
            return this._client.sendNotification(vscode_languageserver_protocol_1.DidChangeConfigurationNotification.type, { settings: this.extractSettingsInformation(sections2) });
          }
        };
        let middleware = this._client.middleware.workspace?.didChangeConfiguration;
        (middleware ? middleware(sections, didChangeConfiguration) : didChangeConfiguration(sections)).catch((error) => {
          this._client.error(`Sending notification ${vscode_languageserver_protocol_1.DidChangeConfigurationNotification.type.method} failed`, error);
        });
      }
      extractSettingsInformation(keys) {
        function ensurePath(config, path2) {
          let current = config;
          for (let i = 0; i < path2.length - 1; i++) {
            let obj = current[path2[i]];
            if (!obj) {
              obj = /* @__PURE__ */ Object.create(null);
              current[path2[i]] = obj;
            }
            current = obj;
          }
          return current;
        }
        let resource = this._client.clientOptions.workspaceFolder ? this._client.clientOptions.workspaceFolder.uri : void 0;
        let result = /* @__PURE__ */ Object.create(null);
        for (let i = 0; i < keys.length; i++) {
          let key = keys[i];
          let index = key.indexOf(".");
          let config = null;
          if (index >= 0) {
            config = vscode_1.workspace.getConfiguration(key.substr(0, index), resource).get(key.substr(index + 1));
          } else {
            config = vscode_1.workspace.getConfiguration(void 0, resource).get(key);
          }
          if (config) {
            let path2 = keys[i].split(".");
            ensurePath(result, path2)[path2[path2.length - 1]] = toJSONObject(config);
          }
        }
        return result;
      }
    };
    exports2.SyncConfigurationFeature = SyncConfigurationFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/textSynchronization.js
var require_textSynchronization = __commonJS({
  "node_modules/vscode-languageclient/lib/common/textSynchronization.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DidSaveTextDocumentFeature = exports2.WillSaveWaitUntilFeature = exports2.WillSaveFeature = exports2.DidChangeTextDocumentFeature = exports2.DidCloseTextDocumentFeature = exports2.DidOpenTextDocumentFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var UUID = require_uuid();
    var DidOpenTextDocumentFeature = class extends features_1.TextDocumentEventFeature {
      constructor(client2, syncedDocuments) {
        super(client2, vscode_1.workspace.onDidOpenTextDocument, vscode_languageserver_protocol_1.DidOpenTextDocumentNotification.type, () => client2.middleware.didOpen, (textDocument) => client2.code2ProtocolConverter.asOpenTextDocumentParams(textDocument), (data) => data, features_1.TextDocumentEventFeature.textDocumentFilter);
        this._syncedDocuments = syncedDocuments;
      }
      get openDocuments() {
        return this._syncedDocuments.values();
      }
      fillClientCapabilities(capabilities) {
        (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "synchronization").dynamicRegistration = true;
      }
      initialize(capabilities, documentSelector) {
        const textDocumentSyncOptions = capabilities.resolvedTextDocumentSync;
        if (documentSelector && textDocumentSyncOptions && textDocumentSyncOptions.openClose) {
          this.register({ id: UUID.generateUuid(), registerOptions: { documentSelector } });
        }
      }
      get registrationType() {
        return vscode_languageserver_protocol_1.DidOpenTextDocumentNotification.type;
      }
      register(data) {
        super.register(data);
        if (!data.registerOptions.documentSelector) {
          return;
        }
        const documentSelector = this._client.protocol2CodeConverter.asDocumentSelector(data.registerOptions.documentSelector);
        vscode_1.workspace.textDocuments.forEach((textDocument) => {
          const uri = textDocument.uri.toString();
          if (this._syncedDocuments.has(uri)) {
            return;
          }
          if (vscode_1.languages.match(documentSelector, textDocument) > 0 && !this._client.hasDedicatedTextSynchronizationFeature(textDocument)) {
            const middleware = this._client.middleware;
            const didOpen = (textDocument2) => {
              return this._client.sendNotification(this._type, this._createParams(textDocument2));
            };
            (middleware.didOpen ? middleware.didOpen(textDocument, didOpen) : didOpen(textDocument)).catch((error) => {
              this._client.error(`Sending document notification ${this._type.method} failed`, error);
            });
            this._syncedDocuments.set(uri, textDocument);
          }
        });
      }
      getTextDocument(data) {
        return data;
      }
      notificationSent(textDocument, type, params) {
        this._syncedDocuments.set(textDocument.uri.toString(), textDocument);
        super.notificationSent(textDocument, type, params);
      }
    };
    exports2.DidOpenTextDocumentFeature = DidOpenTextDocumentFeature;
    var DidCloseTextDocumentFeature = class extends features_1.TextDocumentEventFeature {
      constructor(client2, syncedDocuments, pendingTextDocumentChanges) {
        super(client2, vscode_1.workspace.onDidCloseTextDocument, vscode_languageserver_protocol_1.DidCloseTextDocumentNotification.type, () => client2.middleware.didClose, (textDocument) => client2.code2ProtocolConverter.asCloseTextDocumentParams(textDocument), (data) => data, features_1.TextDocumentEventFeature.textDocumentFilter);
        this._syncedDocuments = syncedDocuments;
        this._pendingTextDocumentChanges = pendingTextDocumentChanges;
      }
      get registrationType() {
        return vscode_languageserver_protocol_1.DidCloseTextDocumentNotification.type;
      }
      fillClientCapabilities(capabilities) {
        (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "synchronization").dynamicRegistration = true;
      }
      initialize(capabilities, documentSelector) {
        let textDocumentSyncOptions = capabilities.resolvedTextDocumentSync;
        if (documentSelector && textDocumentSyncOptions && textDocumentSyncOptions.openClose) {
          this.register({ id: UUID.generateUuid(), registerOptions: { documentSelector } });
        }
      }
      async callback(data) {
        await super.callback(data);
        this._pendingTextDocumentChanges.delete(data.uri.toString());
      }
      getTextDocument(data) {
        return data;
      }
      notificationSent(textDocument, type, params) {
        this._syncedDocuments.delete(textDocument.uri.toString());
        super.notificationSent(textDocument, type, params);
      }
      unregister(id) {
        const selector = this._selectors.get(id);
        super.unregister(id);
        const selectors = this._selectors.values();
        this._syncedDocuments.forEach((textDocument) => {
          if (vscode_1.languages.match(selector, textDocument) > 0 && !this._selectorFilter(selectors, textDocument) && !this._client.hasDedicatedTextSynchronizationFeature(textDocument)) {
            let middleware = this._client.middleware;
            let didClose = (textDocument2) => {
              return this._client.sendNotification(this._type, this._createParams(textDocument2));
            };
            this._syncedDocuments.delete(textDocument.uri.toString());
            (middleware.didClose ? middleware.didClose(textDocument, didClose) : didClose(textDocument)).catch((error) => {
              this._client.error(`Sending document notification ${this._type.method} failed`, error);
            });
          }
        });
      }
    };
    exports2.DidCloseTextDocumentFeature = DidCloseTextDocumentFeature;
    var DidChangeTextDocumentFeature = class extends features_1.DynamicDocumentFeature {
      constructor(client2, pendingTextDocumentChanges) {
        super(client2);
        this._changeData = /* @__PURE__ */ new Map();
        this._onNotificationSent = new vscode_1.EventEmitter();
        this._onPendingChangeAdded = new vscode_1.EventEmitter();
        this._pendingTextDocumentChanges = pendingTextDocumentChanges;
        this._syncKind = vscode_languageserver_protocol_1.TextDocumentSyncKind.None;
      }
      get onNotificationSent() {
        return this._onNotificationSent.event;
      }
      get onPendingChangeAdded() {
        return this._onPendingChangeAdded.event;
      }
      get syncKind() {
        return this._syncKind;
      }
      get registrationType() {
        return vscode_languageserver_protocol_1.DidChangeTextDocumentNotification.type;
      }
      fillClientCapabilities(capabilities) {
        (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "synchronization").dynamicRegistration = true;
      }
      initialize(capabilities, documentSelector) {
        let textDocumentSyncOptions = capabilities.resolvedTextDocumentSync;
        if (documentSelector && textDocumentSyncOptions && textDocumentSyncOptions.change !== void 0 && textDocumentSyncOptions.change !== vscode_languageserver_protocol_1.TextDocumentSyncKind.None) {
          this.register({
            id: UUID.generateUuid(),
            registerOptions: Object.assign({}, { documentSelector }, { syncKind: textDocumentSyncOptions.change })
          });
        }
      }
      register(data) {
        if (!data.registerOptions.documentSelector) {
          return;
        }
        if (!this._listener) {
          this._listener = vscode_1.workspace.onDidChangeTextDocument(this.callback, this);
        }
        this._changeData.set(data.id, {
          syncKind: data.registerOptions.syncKind,
          documentSelector: this._client.protocol2CodeConverter.asDocumentSelector(data.registerOptions.documentSelector)
        });
        this.updateSyncKind(data.registerOptions.syncKind);
      }
      *getDocumentSelectors() {
        for (const data of this._changeData.values()) {
          yield data.documentSelector;
        }
      }
      async callback(event) {
        if (event.contentChanges.length === 0) {
          return;
        }
        const uri = event.document.uri;
        const version = event.document.version;
        const promises = [];
        for (const changeData of this._changeData.values()) {
          if (vscode_1.languages.match(changeData.documentSelector, event.document) > 0 && !this._client.hasDedicatedTextSynchronizationFeature(event.document)) {
            const middleware = this._client.middleware;
            if (changeData.syncKind === vscode_languageserver_protocol_1.TextDocumentSyncKind.Incremental) {
              const didChange = async (event2) => {
                const params = this._client.code2ProtocolConverter.asChangeTextDocumentParams(event2, uri, version);
                await this._client.sendNotification(vscode_languageserver_protocol_1.DidChangeTextDocumentNotification.type, params);
                this.notificationSent(event2.document, vscode_languageserver_protocol_1.DidChangeTextDocumentNotification.type, params);
              };
              promises.push(middleware.didChange ? middleware.didChange(event, (event2) => didChange(event2)) : didChange(event));
            } else if (changeData.syncKind === vscode_languageserver_protocol_1.TextDocumentSyncKind.Full) {
              const didChange = async (event2) => {
                const eventUri = event2.document.uri.toString();
                this._pendingTextDocumentChanges.set(eventUri, event2.document);
                this._onPendingChangeAdded.fire();
              };
              promises.push(middleware.didChange ? middleware.didChange(event, (event2) => didChange(event2)) : didChange(event));
            }
          }
        }
        return Promise.all(promises).then(void 0, (error) => {
          this._client.error(`Sending document notification ${vscode_languageserver_protocol_1.DidChangeTextDocumentNotification.type.method} failed`, error);
          throw error;
        });
      }
      notificationSent(textDocument, type, params) {
        this._onNotificationSent.fire({ textDocument, type, params });
      }
      unregister(id) {
        this._changeData.delete(id);
        if (this._changeData.size === 0) {
          if (this._listener) {
            this._listener.dispose();
            this._listener = void 0;
          }
          this._syncKind = vscode_languageserver_protocol_1.TextDocumentSyncKind.None;
        } else {
          this._syncKind = vscode_languageserver_protocol_1.TextDocumentSyncKind.None;
          for (const changeData of this._changeData.values()) {
            this.updateSyncKind(changeData.syncKind);
            if (this._syncKind === vscode_languageserver_protocol_1.TextDocumentSyncKind.Full) {
              break;
            }
          }
        }
      }
      clear() {
        this._pendingTextDocumentChanges.clear();
        this._changeData.clear();
        this._syncKind = vscode_languageserver_protocol_1.TextDocumentSyncKind.None;
        if (this._listener) {
          this._listener.dispose();
          this._listener = void 0;
        }
      }
      getPendingDocumentChanges(excludes) {
        if (this._pendingTextDocumentChanges.size === 0) {
          return [];
        }
        let result;
        if (excludes.size === 0) {
          result = Array.from(this._pendingTextDocumentChanges.values());
          this._pendingTextDocumentChanges.clear();
        } else {
          result = [];
          for (const entry of this._pendingTextDocumentChanges) {
            if (!excludes.has(entry[0])) {
              result.push(entry[1]);
              this._pendingTextDocumentChanges.delete(entry[0]);
            }
          }
        }
        return result;
      }
      getProvider(document) {
        for (const changeData of this._changeData.values()) {
          if (vscode_1.languages.match(changeData.documentSelector, document) > 0) {
            return {
              send: (event) => {
                return this.callback(event);
              }
            };
          }
        }
        return void 0;
      }
      updateSyncKind(syncKind) {
        if (this._syncKind === vscode_languageserver_protocol_1.TextDocumentSyncKind.Full) {
          return;
        }
        switch (syncKind) {
          case vscode_languageserver_protocol_1.TextDocumentSyncKind.Full:
            this._syncKind = syncKind;
            break;
          case vscode_languageserver_protocol_1.TextDocumentSyncKind.Incremental:
            if (this._syncKind === vscode_languageserver_protocol_1.TextDocumentSyncKind.None) {
              this._syncKind = vscode_languageserver_protocol_1.TextDocumentSyncKind.Incremental;
            }
            break;
        }
      }
    };
    exports2.DidChangeTextDocumentFeature = DidChangeTextDocumentFeature;
    var WillSaveFeature = class extends features_1.TextDocumentEventFeature {
      constructor(client2) {
        super(client2, vscode_1.workspace.onWillSaveTextDocument, vscode_languageserver_protocol_1.WillSaveTextDocumentNotification.type, () => client2.middleware.willSave, (willSaveEvent) => client2.code2ProtocolConverter.asWillSaveTextDocumentParams(willSaveEvent), (event) => event.document, (selectors, willSaveEvent) => features_1.TextDocumentEventFeature.textDocumentFilter(selectors, willSaveEvent.document));
      }
      get registrationType() {
        return vscode_languageserver_protocol_1.WillSaveTextDocumentNotification.type;
      }
      fillClientCapabilities(capabilities) {
        let value = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "synchronization");
        value.willSave = true;
      }
      initialize(capabilities, documentSelector) {
        let textDocumentSyncOptions = capabilities.resolvedTextDocumentSync;
        if (documentSelector && textDocumentSyncOptions && textDocumentSyncOptions.willSave) {
          this.register({
            id: UUID.generateUuid(),
            registerOptions: { documentSelector }
          });
        }
      }
      getTextDocument(data) {
        return data.document;
      }
    };
    exports2.WillSaveFeature = WillSaveFeature;
    var WillSaveWaitUntilFeature = class extends features_1.DynamicDocumentFeature {
      constructor(client2) {
        super(client2);
        this._selectors = /* @__PURE__ */ new Map();
      }
      getDocumentSelectors() {
        return this._selectors.values();
      }
      get registrationType() {
        return vscode_languageserver_protocol_1.WillSaveTextDocumentWaitUntilRequest.type;
      }
      fillClientCapabilities(capabilities) {
        let value = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "synchronization");
        value.willSaveWaitUntil = true;
      }
      initialize(capabilities, documentSelector) {
        let textDocumentSyncOptions = capabilities.resolvedTextDocumentSync;
        if (documentSelector && textDocumentSyncOptions && textDocumentSyncOptions.willSaveWaitUntil) {
          this.register({
            id: UUID.generateUuid(),
            registerOptions: { documentSelector }
          });
        }
      }
      register(data) {
        if (!data.registerOptions.documentSelector) {
          return;
        }
        if (!this._listener) {
          this._listener = vscode_1.workspace.onWillSaveTextDocument(this.callback, this);
        }
        this._selectors.set(data.id, this._client.protocol2CodeConverter.asDocumentSelector(data.registerOptions.documentSelector));
      }
      callback(event) {
        if (features_1.TextDocumentEventFeature.textDocumentFilter(this._selectors.values(), event.document) && !this._client.hasDedicatedTextSynchronizationFeature(event.document)) {
          let middleware = this._client.middleware;
          let willSaveWaitUntil = (event2) => {
            return this._client.sendRequest(vscode_languageserver_protocol_1.WillSaveTextDocumentWaitUntilRequest.type, this._client.code2ProtocolConverter.asWillSaveTextDocumentParams(event2)).then(async (edits) => {
              let vEdits = await this._client.protocol2CodeConverter.asTextEdits(edits);
              return vEdits === void 0 ? [] : vEdits;
            });
          };
          event.waitUntil(middleware.willSaveWaitUntil ? middleware.willSaveWaitUntil(event, willSaveWaitUntil) : willSaveWaitUntil(event));
        }
      }
      unregister(id) {
        this._selectors.delete(id);
        if (this._selectors.size === 0 && this._listener) {
          this._listener.dispose();
          this._listener = void 0;
        }
      }
      clear() {
        this._selectors.clear();
        if (this._listener) {
          this._listener.dispose();
          this._listener = void 0;
        }
      }
    };
    exports2.WillSaveWaitUntilFeature = WillSaveWaitUntilFeature;
    var DidSaveTextDocumentFeature = class extends features_1.TextDocumentEventFeature {
      constructor(client2) {
        super(client2, vscode_1.workspace.onDidSaveTextDocument, vscode_languageserver_protocol_1.DidSaveTextDocumentNotification.type, () => client2.middleware.didSave, (textDocument) => client2.code2ProtocolConverter.asSaveTextDocumentParams(textDocument, this._includeText), (data) => data, features_1.TextDocumentEventFeature.textDocumentFilter);
        this._includeText = false;
      }
      get registrationType() {
        return vscode_languageserver_protocol_1.DidSaveTextDocumentNotification.type;
      }
      fillClientCapabilities(capabilities) {
        (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "synchronization").didSave = true;
      }
      initialize(capabilities, documentSelector) {
        const textDocumentSyncOptions = capabilities.resolvedTextDocumentSync;
        if (documentSelector && textDocumentSyncOptions && textDocumentSyncOptions.save) {
          const saveOptions = typeof textDocumentSyncOptions.save === "boolean" ? { includeText: false } : { includeText: !!textDocumentSyncOptions.save.includeText };
          this.register({
            id: UUID.generateUuid(),
            registerOptions: Object.assign({}, { documentSelector }, saveOptions)
          });
        }
      }
      register(data) {
        this._includeText = !!data.registerOptions.includeText;
        super.register(data);
      }
      getTextDocument(data) {
        return data;
      }
    };
    exports2.DidSaveTextDocumentFeature = DidSaveTextDocumentFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/completion.js
var require_completion = __commonJS({
  "node_modules/vscode-languageclient/lib/common/completion.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CompletionItemFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var UUID = require_uuid();
    var SupportedCompletionItemKinds = [
      vscode_languageserver_protocol_1.CompletionItemKind.Text,
      vscode_languageserver_protocol_1.CompletionItemKind.Method,
      vscode_languageserver_protocol_1.CompletionItemKind.Function,
      vscode_languageserver_protocol_1.CompletionItemKind.Constructor,
      vscode_languageserver_protocol_1.CompletionItemKind.Field,
      vscode_languageserver_protocol_1.CompletionItemKind.Variable,
      vscode_languageserver_protocol_1.CompletionItemKind.Class,
      vscode_languageserver_protocol_1.CompletionItemKind.Interface,
      vscode_languageserver_protocol_1.CompletionItemKind.Module,
      vscode_languageserver_protocol_1.CompletionItemKind.Property,
      vscode_languageserver_protocol_1.CompletionItemKind.Unit,
      vscode_languageserver_protocol_1.CompletionItemKind.Value,
      vscode_languageserver_protocol_1.CompletionItemKind.Enum,
      vscode_languageserver_protocol_1.CompletionItemKind.Keyword,
      vscode_languageserver_protocol_1.CompletionItemKind.Snippet,
      vscode_languageserver_protocol_1.CompletionItemKind.Color,
      vscode_languageserver_protocol_1.CompletionItemKind.File,
      vscode_languageserver_protocol_1.CompletionItemKind.Reference,
      vscode_languageserver_protocol_1.CompletionItemKind.Folder,
      vscode_languageserver_protocol_1.CompletionItemKind.EnumMember,
      vscode_languageserver_protocol_1.CompletionItemKind.Constant,
      vscode_languageserver_protocol_1.CompletionItemKind.Struct,
      vscode_languageserver_protocol_1.CompletionItemKind.Event,
      vscode_languageserver_protocol_1.CompletionItemKind.Operator,
      vscode_languageserver_protocol_1.CompletionItemKind.TypeParameter
    ];
    var CompletionItemFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.CompletionRequest.type);
        this.labelDetailsSupport = /* @__PURE__ */ new Map();
      }
      fillClientCapabilities(capabilities) {
        let completion = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "completion");
        completion.dynamicRegistration = true;
        completion.contextSupport = true;
        completion.completionItem = {
          snippetSupport: true,
          commitCharactersSupport: true,
          documentationFormat: [vscode_languageserver_protocol_1.MarkupKind.Markdown, vscode_languageserver_protocol_1.MarkupKind.PlainText],
          deprecatedSupport: true,
          preselectSupport: true,
          tagSupport: { valueSet: [vscode_languageserver_protocol_1.CompletionItemTag.Deprecated] },
          insertReplaceSupport: true,
          resolveSupport: {
            properties: ["documentation", "detail", "additionalTextEdits"]
          },
          insertTextModeSupport: { valueSet: [vscode_languageserver_protocol_1.InsertTextMode.asIs, vscode_languageserver_protocol_1.InsertTextMode.adjustIndentation] },
          labelDetailsSupport: true
        };
        completion.insertTextMode = vscode_languageserver_protocol_1.InsertTextMode.adjustIndentation;
        completion.completionItemKind = { valueSet: SupportedCompletionItemKinds };
        completion.completionList = {
          itemDefaults: [
            "commitCharacters",
            "editRange",
            "insertTextFormat",
            "insertTextMode",
            "data"
          ]
        };
      }
      initialize(capabilities, documentSelector) {
        const options = this.getRegistrationOptions(documentSelector, capabilities.completionProvider);
        if (!options) {
          return;
        }
        this.register({
          id: UUID.generateUuid(),
          registerOptions: options
        });
      }
      registerLanguageProvider(options, id) {
        this.labelDetailsSupport.set(id, !!options.completionItem?.labelDetailsSupport);
        const triggerCharacters = options.triggerCharacters ?? [];
        const defaultCommitCharacters = options.allCommitCharacters;
        const selector = options.documentSelector;
        const provider = {
          provideCompletionItems: (document, position, token, context) => {
            const client2 = this._client;
            const middleware = this._client.middleware;
            const provideCompletionItems = (document2, position2, context2, token2) => {
              return client2.sendRequest(vscode_languageserver_protocol_1.CompletionRequest.type, client2.code2ProtocolConverter.asCompletionParams(document2, position2, context2), token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asCompletionResult(result, defaultCommitCharacters, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.CompletionRequest.type, token2, error, null);
              });
            };
            return middleware.provideCompletionItem ? middleware.provideCompletionItem(document, position, context, token, provideCompletionItems) : provideCompletionItems(document, position, context, token);
          },
          resolveCompletionItem: options.resolveProvider ? (item, token) => {
            const client2 = this._client;
            const middleware = this._client.middleware;
            const resolveCompletionItem = (item2, token2) => {
              return client2.sendRequest(vscode_languageserver_protocol_1.CompletionResolveRequest.type, client2.code2ProtocolConverter.asCompletionItem(item2, !!this.labelDetailsSupport.get(id)), token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asCompletionItem(result);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.CompletionResolveRequest.type, token2, error, item2);
              });
            };
            return middleware.resolveCompletionItem ? middleware.resolveCompletionItem(item, token, resolveCompletionItem) : resolveCompletionItem(item, token);
          } : void 0
        };
        return [vscode_1.languages.registerCompletionItemProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider, ...triggerCharacters), provider];
      }
    };
    exports2.CompletionItemFeature = CompletionItemFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/hover.js
var require_hover = __commonJS({
  "node_modules/vscode-languageclient/lib/common/hover.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.HoverFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var UUID = require_uuid();
    var HoverFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.HoverRequest.type);
      }
      fillClientCapabilities(capabilities) {
        const hoverCapability = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "hover");
        hoverCapability.dynamicRegistration = true;
        hoverCapability.contentFormat = [vscode_languageserver_protocol_1.MarkupKind.Markdown, vscode_languageserver_protocol_1.MarkupKind.PlainText];
      }
      initialize(capabilities, documentSelector) {
        const options = this.getRegistrationOptions(documentSelector, capabilities.hoverProvider);
        if (!options) {
          return;
        }
        this.register({
          id: UUID.generateUuid(),
          registerOptions: options
        });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const provider = {
          provideHover: (document, position, token) => {
            const client2 = this._client;
            const provideHover = (document2, position2, token2) => {
              return client2.sendRequest(vscode_languageserver_protocol_1.HoverRequest.type, client2.code2ProtocolConverter.asTextDocumentPositionParams(document2, position2), token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asHover(result);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.HoverRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideHover ? middleware.provideHover(document, position, token, provideHover) : provideHover(document, position, token);
          }
        };
        return [this.registerProvider(selector, provider), provider];
      }
      registerProvider(selector, provider) {
        return vscode_1.languages.registerHoverProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider);
      }
    };
    exports2.HoverFeature = HoverFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/definition.js
var require_definition = __commonJS({
  "node_modules/vscode-languageclient/lib/common/definition.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DefinitionFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var UUID = require_uuid();
    var DefinitionFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.DefinitionRequest.type);
      }
      fillClientCapabilities(capabilities) {
        let definitionSupport = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "definition");
        definitionSupport.dynamicRegistration = true;
        definitionSupport.linkSupport = true;
      }
      initialize(capabilities, documentSelector) {
        const options = this.getRegistrationOptions(documentSelector, capabilities.definitionProvider);
        if (!options) {
          return;
        }
        this.register({ id: UUID.generateUuid(), registerOptions: options });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const provider = {
          provideDefinition: (document, position, token) => {
            const client2 = this._client;
            const provideDefinition = (document2, position2, token2) => {
              return client2.sendRequest(vscode_languageserver_protocol_1.DefinitionRequest.type, client2.code2ProtocolConverter.asTextDocumentPositionParams(document2, position2), token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asDefinitionResult(result, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.DefinitionRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideDefinition ? middleware.provideDefinition(document, position, token, provideDefinition) : provideDefinition(document, position, token);
          }
        };
        return [this.registerProvider(selector, provider), provider];
      }
      registerProvider(selector, provider) {
        return vscode_1.languages.registerDefinitionProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider);
      }
    };
    exports2.DefinitionFeature = DefinitionFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/signatureHelp.js
var require_signatureHelp = __commonJS({
  "node_modules/vscode-languageclient/lib/common/signatureHelp.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SignatureHelpFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var UUID = require_uuid();
    var SignatureHelpFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.SignatureHelpRequest.type);
      }
      fillClientCapabilities(capabilities) {
        let config = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "signatureHelp");
        config.dynamicRegistration = true;
        config.signatureInformation = { documentationFormat: [vscode_languageserver_protocol_1.MarkupKind.Markdown, vscode_languageserver_protocol_1.MarkupKind.PlainText] };
        config.signatureInformation.parameterInformation = { labelOffsetSupport: true };
        config.signatureInformation.activeParameterSupport = true;
        config.contextSupport = true;
      }
      initialize(capabilities, documentSelector) {
        const options = this.getRegistrationOptions(documentSelector, capabilities.signatureHelpProvider);
        if (!options) {
          return;
        }
        this.register({
          id: UUID.generateUuid(),
          registerOptions: options
        });
      }
      registerLanguageProvider(options) {
        const provider = {
          provideSignatureHelp: (document, position, token, context) => {
            const client2 = this._client;
            const providerSignatureHelp = (document2, position2, context2, token2) => {
              return client2.sendRequest(vscode_languageserver_protocol_1.SignatureHelpRequest.type, client2.code2ProtocolConverter.asSignatureHelpParams(document2, position2, context2), token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asSignatureHelp(result, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.SignatureHelpRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideSignatureHelp ? middleware.provideSignatureHelp(document, position, context, token, providerSignatureHelp) : providerSignatureHelp(document, position, context, token);
          }
        };
        return [this.registerProvider(options, provider), provider];
      }
      registerProvider(options, provider) {
        const selector = this._client.protocol2CodeConverter.asDocumentSelector(options.documentSelector);
        if (options.retriggerCharacters === void 0) {
          const triggerCharacters = options.triggerCharacters || [];
          return vscode_1.languages.registerSignatureHelpProvider(selector, provider, ...triggerCharacters);
        } else {
          const metaData = {
            triggerCharacters: options.triggerCharacters || [],
            retriggerCharacters: options.retriggerCharacters || []
          };
          return vscode_1.languages.registerSignatureHelpProvider(selector, provider, metaData);
        }
      }
    };
    exports2.SignatureHelpFeature = SignatureHelpFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/documentHighlight.js
var require_documentHighlight = __commonJS({
  "node_modules/vscode-languageclient/lib/common/documentHighlight.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DocumentHighlightFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var UUID = require_uuid();
    var DocumentHighlightFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.DocumentHighlightRequest.type);
      }
      fillClientCapabilities(capabilities) {
        (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "documentHighlight").dynamicRegistration = true;
      }
      initialize(capabilities, documentSelector) {
        const options = this.getRegistrationOptions(documentSelector, capabilities.documentHighlightProvider);
        if (!options) {
          return;
        }
        this.register({ id: UUID.generateUuid(), registerOptions: options });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const provider = {
          provideDocumentHighlights: (document, position, token) => {
            const client2 = this._client;
            const _provideDocumentHighlights = (document2, position2, token2) => {
              return client2.sendRequest(vscode_languageserver_protocol_1.DocumentHighlightRequest.type, client2.code2ProtocolConverter.asTextDocumentPositionParams(document2, position2), token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asDocumentHighlights(result, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.DocumentHighlightRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideDocumentHighlights ? middleware.provideDocumentHighlights(document, position, token, _provideDocumentHighlights) : _provideDocumentHighlights(document, position, token);
          }
        };
        return [vscode_1.languages.registerDocumentHighlightProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider), provider];
      }
    };
    exports2.DocumentHighlightFeature = DocumentHighlightFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/documentSymbol.js
var require_documentSymbol = __commonJS({
  "node_modules/vscode-languageclient/lib/common/documentSymbol.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DocumentSymbolFeature = exports2.SupportedSymbolTags = exports2.SupportedSymbolKinds = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var UUID = require_uuid();
    exports2.SupportedSymbolKinds = [
      vscode_languageserver_protocol_1.SymbolKind.File,
      vscode_languageserver_protocol_1.SymbolKind.Module,
      vscode_languageserver_protocol_1.SymbolKind.Namespace,
      vscode_languageserver_protocol_1.SymbolKind.Package,
      vscode_languageserver_protocol_1.SymbolKind.Class,
      vscode_languageserver_protocol_1.SymbolKind.Method,
      vscode_languageserver_protocol_1.SymbolKind.Property,
      vscode_languageserver_protocol_1.SymbolKind.Field,
      vscode_languageserver_protocol_1.SymbolKind.Constructor,
      vscode_languageserver_protocol_1.SymbolKind.Enum,
      vscode_languageserver_protocol_1.SymbolKind.Interface,
      vscode_languageserver_protocol_1.SymbolKind.Function,
      vscode_languageserver_protocol_1.SymbolKind.Variable,
      vscode_languageserver_protocol_1.SymbolKind.Constant,
      vscode_languageserver_protocol_1.SymbolKind.String,
      vscode_languageserver_protocol_1.SymbolKind.Number,
      vscode_languageserver_protocol_1.SymbolKind.Boolean,
      vscode_languageserver_protocol_1.SymbolKind.Array,
      vscode_languageserver_protocol_1.SymbolKind.Object,
      vscode_languageserver_protocol_1.SymbolKind.Key,
      vscode_languageserver_protocol_1.SymbolKind.Null,
      vscode_languageserver_protocol_1.SymbolKind.EnumMember,
      vscode_languageserver_protocol_1.SymbolKind.Struct,
      vscode_languageserver_protocol_1.SymbolKind.Event,
      vscode_languageserver_protocol_1.SymbolKind.Operator,
      vscode_languageserver_protocol_1.SymbolKind.TypeParameter
    ];
    exports2.SupportedSymbolTags = [
      vscode_languageserver_protocol_1.SymbolTag.Deprecated
    ];
    var DocumentSymbolFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.DocumentSymbolRequest.type);
      }
      fillClientCapabilities(capabilities) {
        let symbolCapabilities = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "documentSymbol");
        symbolCapabilities.dynamicRegistration = true;
        symbolCapabilities.symbolKind = {
          valueSet: exports2.SupportedSymbolKinds
        };
        symbolCapabilities.hierarchicalDocumentSymbolSupport = true;
        symbolCapabilities.tagSupport = {
          valueSet: exports2.SupportedSymbolTags
        };
        symbolCapabilities.labelSupport = true;
      }
      initialize(capabilities, documentSelector) {
        const options = this.getRegistrationOptions(documentSelector, capabilities.documentSymbolProvider);
        if (!options) {
          return;
        }
        this.register({ id: UUID.generateUuid(), registerOptions: options });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const provider = {
          provideDocumentSymbols: (document, token) => {
            const client2 = this._client;
            const _provideDocumentSymbols = async (document2, token2) => {
              try {
                const data = await client2.sendRequest(vscode_languageserver_protocol_1.DocumentSymbolRequest.type, client2.code2ProtocolConverter.asDocumentSymbolParams(document2), token2);
                if (token2.isCancellationRequested || data === void 0 || data === null) {
                  return null;
                }
                if (data.length === 0) {
                  return [];
                } else {
                  const first = data[0];
                  if (vscode_languageserver_protocol_1.DocumentSymbol.is(first)) {
                    return await client2.protocol2CodeConverter.asDocumentSymbols(data, token2);
                  } else {
                    return await client2.protocol2CodeConverter.asSymbolInformations(data, token2);
                  }
                }
              } catch (error) {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.DocumentSymbolRequest.type, token2, error, null);
              }
            };
            const middleware = client2.middleware;
            return middleware.provideDocumentSymbols ? middleware.provideDocumentSymbols(document, token, _provideDocumentSymbols) : _provideDocumentSymbols(document, token);
          }
        };
        const metaData = options.label !== void 0 ? { label: options.label } : void 0;
        return [vscode_1.languages.registerDocumentSymbolProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider, metaData), provider];
      }
    };
    exports2.DocumentSymbolFeature = DocumentSymbolFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/workspaceSymbol.js
var require_workspaceSymbol = __commonJS({
  "node_modules/vscode-languageclient/lib/common/workspaceSymbol.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WorkspaceSymbolFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var documentSymbol_1 = require_documentSymbol();
    var UUID = require_uuid();
    var WorkspaceSymbolFeature = class extends features_1.WorkspaceFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.WorkspaceSymbolRequest.type);
      }
      fillClientCapabilities(capabilities) {
        let symbolCapabilities = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "workspace"), "symbol");
        symbolCapabilities.dynamicRegistration = true;
        symbolCapabilities.symbolKind = {
          valueSet: documentSymbol_1.SupportedSymbolKinds
        };
        symbolCapabilities.tagSupport = {
          valueSet: documentSymbol_1.SupportedSymbolTags
        };
        symbolCapabilities.resolveSupport = { properties: ["location.range"] };
      }
      initialize(capabilities) {
        if (!capabilities.workspaceSymbolProvider) {
          return;
        }
        this.register({
          id: UUID.generateUuid(),
          registerOptions: capabilities.workspaceSymbolProvider === true ? { workDoneProgress: false } : capabilities.workspaceSymbolProvider
        });
      }
      registerLanguageProvider(options) {
        const provider = {
          provideWorkspaceSymbols: (query, token) => {
            const client2 = this._client;
            const provideWorkspaceSymbols = (query2, token2) => {
              return client2.sendRequest(vscode_languageserver_protocol_1.WorkspaceSymbolRequest.type, { query: query2 }, token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asSymbolInformations(result, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.WorkspaceSymbolRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideWorkspaceSymbols ? middleware.provideWorkspaceSymbols(query, token, provideWorkspaceSymbols) : provideWorkspaceSymbols(query, token);
          },
          resolveWorkspaceSymbol: options.resolveProvider === true ? (item, token) => {
            const client2 = this._client;
            const resolveWorkspaceSymbol = (item2, token2) => {
              return client2.sendRequest(vscode_languageserver_protocol_1.WorkspaceSymbolResolveRequest.type, client2.code2ProtocolConverter.asWorkspaceSymbol(item2), token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asSymbolInformation(result);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.WorkspaceSymbolResolveRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.resolveWorkspaceSymbol ? middleware.resolveWorkspaceSymbol(item, token, resolveWorkspaceSymbol) : resolveWorkspaceSymbol(item, token);
          } : void 0
        };
        return [vscode_1.languages.registerWorkspaceSymbolProvider(provider), provider];
      }
    };
    exports2.WorkspaceSymbolFeature = WorkspaceSymbolFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/reference.js
var require_reference = __commonJS({
  "node_modules/vscode-languageclient/lib/common/reference.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ReferencesFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var UUID = require_uuid();
    var ReferencesFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.ReferencesRequest.type);
      }
      fillClientCapabilities(capabilities) {
        (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "references").dynamicRegistration = true;
      }
      initialize(capabilities, documentSelector) {
        const options = this.getRegistrationOptions(documentSelector, capabilities.referencesProvider);
        if (!options) {
          return;
        }
        this.register({ id: UUID.generateUuid(), registerOptions: options });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const provider = {
          provideReferences: (document, position, options2, token) => {
            const client2 = this._client;
            const _providerReferences = (document2, position2, options3, token2) => {
              return client2.sendRequest(vscode_languageserver_protocol_1.ReferencesRequest.type, client2.code2ProtocolConverter.asReferenceParams(document2, position2, options3), token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asReferences(result, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.ReferencesRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideReferences ? middleware.provideReferences(document, position, options2, token, _providerReferences) : _providerReferences(document, position, options2, token);
          }
        };
        return [this.registerProvider(selector, provider), provider];
      }
      registerProvider(selector, provider) {
        return vscode_1.languages.registerReferenceProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider);
      }
    };
    exports2.ReferencesFeature = ReferencesFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/codeAction.js
var require_codeAction = __commonJS({
  "node_modules/vscode-languageclient/lib/common/codeAction.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CodeActionFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var UUID = require_uuid();
    var features_1 = require_features();
    var CodeActionFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.CodeActionRequest.type);
      }
      fillClientCapabilities(capabilities) {
        const cap = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "codeAction");
        cap.dynamicRegistration = true;
        cap.isPreferredSupport = true;
        cap.disabledSupport = true;
        cap.dataSupport = true;
        cap.resolveSupport = {
          properties: ["edit"]
        };
        cap.codeActionLiteralSupport = {
          codeActionKind: {
            valueSet: [
              vscode_languageserver_protocol_1.CodeActionKind.Empty,
              vscode_languageserver_protocol_1.CodeActionKind.QuickFix,
              vscode_languageserver_protocol_1.CodeActionKind.Refactor,
              vscode_languageserver_protocol_1.CodeActionKind.RefactorExtract,
              vscode_languageserver_protocol_1.CodeActionKind.RefactorInline,
              vscode_languageserver_protocol_1.CodeActionKind.RefactorRewrite,
              vscode_languageserver_protocol_1.CodeActionKind.Source,
              vscode_languageserver_protocol_1.CodeActionKind.SourceOrganizeImports
            ]
          }
        };
        cap.honorsChangeAnnotations = true;
      }
      initialize(capabilities, documentSelector) {
        const options = this.getRegistrationOptions(documentSelector, capabilities.codeActionProvider);
        if (!options) {
          return;
        }
        this.register({ id: UUID.generateUuid(), registerOptions: options });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const provider = {
          provideCodeActions: (document, range, context, token) => {
            const client2 = this._client;
            const _provideCodeActions = async (document2, range2, context2, token2) => {
              const params = {
                textDocument: client2.code2ProtocolConverter.asTextDocumentIdentifier(document2),
                range: client2.code2ProtocolConverter.asRange(range2),
                context: client2.code2ProtocolConverter.asCodeActionContextSync(context2)
              };
              return client2.sendRequest(vscode_languageserver_protocol_1.CodeActionRequest.type, params, token2).then((values) => {
                if (token2.isCancellationRequested || values === null || values === void 0) {
                  return null;
                }
                return client2.protocol2CodeConverter.asCodeActionResult(values, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.CodeActionRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideCodeActions ? middleware.provideCodeActions(document, range, context, token, _provideCodeActions) : _provideCodeActions(document, range, context, token);
          },
          resolveCodeAction: options.resolveProvider ? (item, token) => {
            const client2 = this._client;
            const middleware = this._client.middleware;
            const resolveCodeAction = async (item2, token2) => {
              return client2.sendRequest(vscode_languageserver_protocol_1.CodeActionResolveRequest.type, client2.code2ProtocolConverter.asCodeActionSync(item2), token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return item2;
                }
                return client2.protocol2CodeConverter.asCodeAction(result, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.CodeActionResolveRequest.type, token2, error, item2);
              });
            };
            return middleware.resolveCodeAction ? middleware.resolveCodeAction(item, token, resolveCodeAction) : resolveCodeAction(item, token);
          } : void 0
        };
        return [vscode_1.languages.registerCodeActionsProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider, options.codeActionKinds ? { providedCodeActionKinds: this._client.protocol2CodeConverter.asCodeActionKinds(options.codeActionKinds) } : void 0), provider];
      }
    };
    exports2.CodeActionFeature = CodeActionFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/codeLens.js
var require_codeLens = __commonJS({
  "node_modules/vscode-languageclient/lib/common/codeLens.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CodeLensFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var UUID = require_uuid();
    var features_1 = require_features();
    var CodeLensFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.CodeLensRequest.type);
      }
      fillClientCapabilities(capabilities) {
        (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "codeLens").dynamicRegistration = true;
        (0, features_1.ensure)((0, features_1.ensure)(capabilities, "workspace"), "codeLens").refreshSupport = true;
      }
      initialize(capabilities, documentSelector) {
        const client2 = this._client;
        client2.onRequest(vscode_languageserver_protocol_1.CodeLensRefreshRequest.type, async () => {
          for (const provider of this.getAllProviders()) {
            provider.onDidChangeCodeLensEmitter.fire();
          }
        });
        const options = this.getRegistrationOptions(documentSelector, capabilities.codeLensProvider);
        if (!options) {
          return;
        }
        this.register({ id: UUID.generateUuid(), registerOptions: options });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const eventEmitter = new vscode_1.EventEmitter();
        const provider = {
          onDidChangeCodeLenses: eventEmitter.event,
          provideCodeLenses: (document, token) => {
            const client2 = this._client;
            const provideCodeLenses = (document2, token2) => {
              return client2.sendRequest(vscode_languageserver_protocol_1.CodeLensRequest.type, client2.code2ProtocolConverter.asCodeLensParams(document2), token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asCodeLenses(result, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.CodeLensRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideCodeLenses ? middleware.provideCodeLenses(document, token, provideCodeLenses) : provideCodeLenses(document, token);
          },
          resolveCodeLens: options.resolveProvider ? (codeLens, token) => {
            const client2 = this._client;
            const resolveCodeLens = (codeLens2, token2) => {
              return client2.sendRequest(vscode_languageserver_protocol_1.CodeLensResolveRequest.type, client2.code2ProtocolConverter.asCodeLens(codeLens2), token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return codeLens2;
                }
                return client2.protocol2CodeConverter.asCodeLens(result);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.CodeLensResolveRequest.type, token2, error, codeLens2);
              });
            };
            const middleware = client2.middleware;
            return middleware.resolveCodeLens ? middleware.resolveCodeLens(codeLens, token, resolveCodeLens) : resolveCodeLens(codeLens, token);
          } : void 0
        };
        return [vscode_1.languages.registerCodeLensProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider), { provider, onDidChangeCodeLensEmitter: eventEmitter }];
      }
    };
    exports2.CodeLensFeature = CodeLensFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/formatting.js
var require_formatting = __commonJS({
  "node_modules/vscode-languageclient/lib/common/formatting.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DocumentOnTypeFormattingFeature = exports2.DocumentRangeFormattingFeature = exports2.DocumentFormattingFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var UUID = require_uuid();
    var features_1 = require_features();
    var FileFormattingOptions;
    (function(FileFormattingOptions2) {
      function fromConfiguration(document) {
        const filesConfig = vscode_1.workspace.getConfiguration("files", document);
        return {
          trimTrailingWhitespace: filesConfig.get("trimTrailingWhitespace"),
          trimFinalNewlines: filesConfig.get("trimFinalNewlines"),
          insertFinalNewline: filesConfig.get("insertFinalNewline")
        };
      }
      FileFormattingOptions2.fromConfiguration = fromConfiguration;
    })(FileFormattingOptions || (FileFormattingOptions = {}));
    var DocumentFormattingFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.DocumentFormattingRequest.type);
      }
      fillClientCapabilities(capabilities) {
        (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "formatting").dynamicRegistration = true;
      }
      initialize(capabilities, documentSelector) {
        const options = this.getRegistrationOptions(documentSelector, capabilities.documentFormattingProvider);
        if (!options) {
          return;
        }
        this.register({ id: UUID.generateUuid(), registerOptions: options });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const provider = {
          provideDocumentFormattingEdits: (document, options2, token) => {
            const client2 = this._client;
            const provideDocumentFormattingEdits = (document2, options3, token2) => {
              const params = {
                textDocument: client2.code2ProtocolConverter.asTextDocumentIdentifier(document2),
                options: client2.code2ProtocolConverter.asFormattingOptions(options3, FileFormattingOptions.fromConfiguration(document2))
              };
              return client2.sendRequest(vscode_languageserver_protocol_1.DocumentFormattingRequest.type, params, token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asTextEdits(result, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.DocumentFormattingRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideDocumentFormattingEdits ? middleware.provideDocumentFormattingEdits(document, options2, token, provideDocumentFormattingEdits) : provideDocumentFormattingEdits(document, options2, token);
          }
        };
        return [vscode_1.languages.registerDocumentFormattingEditProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider), provider];
      }
    };
    exports2.DocumentFormattingFeature = DocumentFormattingFeature;
    var DocumentRangeFormattingFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.DocumentRangeFormattingRequest.type);
      }
      fillClientCapabilities(capabilities) {
        const capability = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "rangeFormatting");
        capability.dynamicRegistration = true;
        capability.rangesSupport = true;
      }
      initialize(capabilities, documentSelector) {
        const options = this.getRegistrationOptions(documentSelector, capabilities.documentRangeFormattingProvider);
        if (!options) {
          return;
        }
        this.register({ id: UUID.generateUuid(), registerOptions: options });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const provider = {
          provideDocumentRangeFormattingEdits: (document, range, options2, token) => {
            const client2 = this._client;
            const provideDocumentRangeFormattingEdits = (document2, range2, options3, token2) => {
              const params = {
                textDocument: client2.code2ProtocolConverter.asTextDocumentIdentifier(document2),
                range: client2.code2ProtocolConverter.asRange(range2),
                options: client2.code2ProtocolConverter.asFormattingOptions(options3, FileFormattingOptions.fromConfiguration(document2))
              };
              return client2.sendRequest(vscode_languageserver_protocol_1.DocumentRangeFormattingRequest.type, params, token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asTextEdits(result, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.DocumentRangeFormattingRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideDocumentRangeFormattingEdits ? middleware.provideDocumentRangeFormattingEdits(document, range, options2, token, provideDocumentRangeFormattingEdits) : provideDocumentRangeFormattingEdits(document, range, options2, token);
          }
        };
        if (options.rangesSupport) {
          provider.provideDocumentRangesFormattingEdits = (document, ranges, options2, token) => {
            const client2 = this._client;
            const provideDocumentRangesFormattingEdits = (document2, ranges2, options3, token2) => {
              const params = {
                textDocument: client2.code2ProtocolConverter.asTextDocumentIdentifier(document2),
                ranges: client2.code2ProtocolConverter.asRanges(ranges2),
                options: client2.code2ProtocolConverter.asFormattingOptions(options3, FileFormattingOptions.fromConfiguration(document2))
              };
              return client2.sendRequest(vscode_languageserver_protocol_1.DocumentRangesFormattingRequest.type, params, token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asTextEdits(result, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.DocumentRangesFormattingRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideDocumentRangesFormattingEdits ? middleware.provideDocumentRangesFormattingEdits(document, ranges, options2, token, provideDocumentRangesFormattingEdits) : provideDocumentRangesFormattingEdits(document, ranges, options2, token);
          };
        }
        return [vscode_1.languages.registerDocumentRangeFormattingEditProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider), provider];
      }
    };
    exports2.DocumentRangeFormattingFeature = DocumentRangeFormattingFeature;
    var DocumentOnTypeFormattingFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.DocumentOnTypeFormattingRequest.type);
      }
      fillClientCapabilities(capabilities) {
        (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "onTypeFormatting").dynamicRegistration = true;
      }
      initialize(capabilities, documentSelector) {
        const options = this.getRegistrationOptions(documentSelector, capabilities.documentOnTypeFormattingProvider);
        if (!options) {
          return;
        }
        this.register({ id: UUID.generateUuid(), registerOptions: options });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const provider = {
          provideOnTypeFormattingEdits: (document, position, ch, options2, token) => {
            const client2 = this._client;
            const provideOnTypeFormattingEdits = (document2, position2, ch2, options3, token2) => {
              let params = {
                textDocument: client2.code2ProtocolConverter.asTextDocumentIdentifier(document2),
                position: client2.code2ProtocolConverter.asPosition(position2),
                ch: ch2,
                options: client2.code2ProtocolConverter.asFormattingOptions(options3, FileFormattingOptions.fromConfiguration(document2))
              };
              return client2.sendRequest(vscode_languageserver_protocol_1.DocumentOnTypeFormattingRequest.type, params, token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asTextEdits(result, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.DocumentOnTypeFormattingRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideOnTypeFormattingEdits ? middleware.provideOnTypeFormattingEdits(document, position, ch, options2, token, provideOnTypeFormattingEdits) : provideOnTypeFormattingEdits(document, position, ch, options2, token);
          }
        };
        const moreTriggerCharacter = options.moreTriggerCharacter || [];
        return [vscode_1.languages.registerOnTypeFormattingEditProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider, options.firstTriggerCharacter, ...moreTriggerCharacter), provider];
      }
    };
    exports2.DocumentOnTypeFormattingFeature = DocumentOnTypeFormattingFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/rename.js
var require_rename = __commonJS({
  "node_modules/vscode-languageclient/lib/common/rename.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.RenameFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var UUID = require_uuid();
    var Is = require_is();
    var features_1 = require_features();
    var RenameFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.RenameRequest.type);
      }
      fillClientCapabilities(capabilities) {
        let rename = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "rename");
        rename.dynamicRegistration = true;
        rename.prepareSupport = true;
        rename.prepareSupportDefaultBehavior = vscode_languageserver_protocol_1.PrepareSupportDefaultBehavior.Identifier;
        rename.honorsChangeAnnotations = true;
      }
      initialize(capabilities, documentSelector) {
        const options = this.getRegistrationOptions(documentSelector, capabilities.renameProvider);
        if (!options) {
          return;
        }
        if (Is.boolean(capabilities.renameProvider)) {
          options.prepareProvider = false;
        }
        this.register({ id: UUID.generateUuid(), registerOptions: options });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const provider = {
          provideRenameEdits: (document, position, newName, token) => {
            const client2 = this._client;
            const provideRenameEdits = (document2, position2, newName2, token2) => {
              let params = {
                textDocument: client2.code2ProtocolConverter.asTextDocumentIdentifier(document2),
                position: client2.code2ProtocolConverter.asPosition(position2),
                newName: newName2
              };
              return client2.sendRequest(vscode_languageserver_protocol_1.RenameRequest.type, params, token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asWorkspaceEdit(result, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.RenameRequest.type, token2, error, null, false);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideRenameEdits ? middleware.provideRenameEdits(document, position, newName, token, provideRenameEdits) : provideRenameEdits(document, position, newName, token);
          },
          prepareRename: options.prepareProvider ? (document, position, token) => {
            const client2 = this._client;
            const prepareRename = (document2, position2, token2) => {
              let params = {
                textDocument: client2.code2ProtocolConverter.asTextDocumentIdentifier(document2),
                position: client2.code2ProtocolConverter.asPosition(position2)
              };
              return client2.sendRequest(vscode_languageserver_protocol_1.PrepareRenameRequest.type, params, token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                if (vscode_languageserver_protocol_1.Range.is(result)) {
                  return client2.protocol2CodeConverter.asRange(result);
                } else if (this.isDefaultBehavior(result)) {
                  return result.defaultBehavior === true ? null : Promise.reject(new Error(`The element can't be renamed.`));
                } else if (result && vscode_languageserver_protocol_1.Range.is(result.range)) {
                  return {
                    range: client2.protocol2CodeConverter.asRange(result.range),
                    placeholder: result.placeholder
                  };
                }
                return Promise.reject(new Error(`The element can't be renamed.`));
              }, (error) => {
                if (typeof error.message === "string") {
                  throw new Error(error.message);
                } else {
                  throw new Error(`The element can't be renamed.`);
                }
              });
            };
            const middleware = client2.middleware;
            return middleware.prepareRename ? middleware.prepareRename(document, position, token, prepareRename) : prepareRename(document, position, token);
          } : void 0
        };
        return [this.registerProvider(selector, provider), provider];
      }
      registerProvider(selector, provider) {
        return vscode_1.languages.registerRenameProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider);
      }
      isDefaultBehavior(value) {
        const candidate = value;
        return candidate && Is.boolean(candidate.defaultBehavior);
      }
    };
    exports2.RenameFeature = RenameFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/documentLink.js
var require_documentLink = __commonJS({
  "node_modules/vscode-languageclient/lib/common/documentLink.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DocumentLinkFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var UUID = require_uuid();
    var DocumentLinkFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.DocumentLinkRequest.type);
      }
      fillClientCapabilities(capabilities) {
        const documentLinkCapabilities = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "documentLink");
        documentLinkCapabilities.dynamicRegistration = true;
        documentLinkCapabilities.tooltipSupport = true;
      }
      initialize(capabilities, documentSelector) {
        const options = this.getRegistrationOptions(documentSelector, capabilities.documentLinkProvider);
        if (!options) {
          return;
        }
        this.register({ id: UUID.generateUuid(), registerOptions: options });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const provider = {
          provideDocumentLinks: (document, token) => {
            const client2 = this._client;
            const provideDocumentLinks = (document2, token2) => {
              return client2.sendRequest(vscode_languageserver_protocol_1.DocumentLinkRequest.type, client2.code2ProtocolConverter.asDocumentLinkParams(document2), token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asDocumentLinks(result, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.DocumentLinkRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideDocumentLinks ? middleware.provideDocumentLinks(document, token, provideDocumentLinks) : provideDocumentLinks(document, token);
          },
          resolveDocumentLink: options.resolveProvider ? (link, token) => {
            const client2 = this._client;
            let resolveDocumentLink = (link2, token2) => {
              return client2.sendRequest(vscode_languageserver_protocol_1.DocumentLinkResolveRequest.type, client2.code2ProtocolConverter.asDocumentLink(link2), token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return link2;
                }
                return client2.protocol2CodeConverter.asDocumentLink(result);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.DocumentLinkResolveRequest.type, token2, error, link2);
              });
            };
            const middleware = client2.middleware;
            return middleware.resolveDocumentLink ? middleware.resolveDocumentLink(link, token, resolveDocumentLink) : resolveDocumentLink(link, token);
          } : void 0
        };
        return [vscode_1.languages.registerDocumentLinkProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider), provider];
      }
    };
    exports2.DocumentLinkFeature = DocumentLinkFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/executeCommand.js
var require_executeCommand = __commonJS({
  "node_modules/vscode-languageclient/lib/common/executeCommand.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ExecuteCommandFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var UUID = require_uuid();
    var features_1 = require_features();
    var ExecuteCommandFeature = class {
      constructor(client2) {
        this._client = client2;
        this._commands = /* @__PURE__ */ new Map();
      }
      getState() {
        return { kind: "workspace", id: this.registrationType.method, registrations: this._commands.size > 0 };
      }
      get registrationType() {
        return vscode_languageserver_protocol_1.ExecuteCommandRequest.type;
      }
      fillClientCapabilities(capabilities) {
        (0, features_1.ensure)((0, features_1.ensure)(capabilities, "workspace"), "executeCommand").dynamicRegistration = true;
      }
      initialize(capabilities) {
        if (!capabilities.executeCommandProvider) {
          return;
        }
        this.register({
          id: UUID.generateUuid(),
          registerOptions: Object.assign({}, capabilities.executeCommandProvider)
        });
      }
      register(data) {
        const client2 = this._client;
        const middleware = client2.middleware;
        const executeCommand = (command, args) => {
          let params = {
            command,
            arguments: args
          };
          return client2.sendRequest(vscode_languageserver_protocol_1.ExecuteCommandRequest.type, params).then(void 0, (error) => {
            return client2.handleFailedRequest(vscode_languageserver_protocol_1.ExecuteCommandRequest.type, void 0, error, void 0);
          });
        };
        if (data.registerOptions.commands) {
          const disposables = [];
          for (const command of data.registerOptions.commands) {
            disposables.push(vscode_1.commands.registerCommand(command, (...args) => {
              return middleware.executeCommand ? middleware.executeCommand(command, args, executeCommand) : executeCommand(command, args);
            }));
          }
          this._commands.set(data.id, disposables);
        }
      }
      unregister(id) {
        let disposables = this._commands.get(id);
        if (disposables) {
          disposables.forEach((disposable) => disposable.dispose());
        }
      }
      clear() {
        this._commands.forEach((value) => {
          value.forEach((disposable) => disposable.dispose());
        });
        this._commands.clear();
      }
    };
    exports2.ExecuteCommandFeature = ExecuteCommandFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/fileSystemWatcher.js
var require_fileSystemWatcher = __commonJS({
  "node_modules/vscode-languageclient/lib/common/fileSystemWatcher.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.FileSystemWatcherFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var FileSystemWatcherFeature = class {
      constructor(client2, notifyFileEvent) {
        this._client = client2;
        this._notifyFileEvent = notifyFileEvent;
        this._watchers = /* @__PURE__ */ new Map();
      }
      getState() {
        return { kind: "workspace", id: this.registrationType.method, registrations: this._watchers.size > 0 };
      }
      get registrationType() {
        return vscode_languageserver_protocol_1.DidChangeWatchedFilesNotification.type;
      }
      fillClientCapabilities(capabilities) {
        (0, features_1.ensure)((0, features_1.ensure)(capabilities, "workspace"), "didChangeWatchedFiles").dynamicRegistration = true;
        (0, features_1.ensure)((0, features_1.ensure)(capabilities, "workspace"), "didChangeWatchedFiles").relativePatternSupport = true;
      }
      initialize(_capabilities, _documentSelector) {
      }
      register(data) {
        if (!Array.isArray(data.registerOptions.watchers)) {
          return;
        }
        const disposables = [];
        for (const watcher of data.registerOptions.watchers) {
          const globPattern = this._client.protocol2CodeConverter.asGlobPattern(watcher.globPattern);
          if (globPattern === void 0) {
            continue;
          }
          let watchCreate = true, watchChange = true, watchDelete = true;
          if (watcher.kind !== void 0 && watcher.kind !== null) {
            watchCreate = (watcher.kind & vscode_languageserver_protocol_1.WatchKind.Create) !== 0;
            watchChange = (watcher.kind & vscode_languageserver_protocol_1.WatchKind.Change) !== 0;
            watchDelete = (watcher.kind & vscode_languageserver_protocol_1.WatchKind.Delete) !== 0;
          }
          const fileSystemWatcher = vscode_1.workspace.createFileSystemWatcher(globPattern, !watchCreate, !watchChange, !watchDelete);
          this.hookListeners(fileSystemWatcher, watchCreate, watchChange, watchDelete, disposables);
          disposables.push(fileSystemWatcher);
        }
        this._watchers.set(data.id, disposables);
      }
      registerRaw(id, fileSystemWatchers) {
        let disposables = [];
        for (let fileSystemWatcher of fileSystemWatchers) {
          this.hookListeners(fileSystemWatcher, true, true, true, disposables);
        }
        this._watchers.set(id, disposables);
      }
      hookListeners(fileSystemWatcher, watchCreate, watchChange, watchDelete, listeners) {
        if (watchCreate) {
          fileSystemWatcher.onDidCreate((resource) => this._notifyFileEvent({
            uri: this._client.code2ProtocolConverter.asUri(resource),
            type: vscode_languageserver_protocol_1.FileChangeType.Created
          }), null, listeners);
        }
        if (watchChange) {
          fileSystemWatcher.onDidChange((resource) => this._notifyFileEvent({
            uri: this._client.code2ProtocolConverter.asUri(resource),
            type: vscode_languageserver_protocol_1.FileChangeType.Changed
          }), null, listeners);
        }
        if (watchDelete) {
          fileSystemWatcher.onDidDelete((resource) => this._notifyFileEvent({
            uri: this._client.code2ProtocolConverter.asUri(resource),
            type: vscode_languageserver_protocol_1.FileChangeType.Deleted
          }), null, listeners);
        }
      }
      unregister(id) {
        let disposables = this._watchers.get(id);
        if (disposables) {
          for (let disposable of disposables) {
            disposable.dispose();
          }
        }
      }
      clear() {
        this._watchers.forEach((disposables) => {
          for (let disposable of disposables) {
            disposable.dispose();
          }
        });
        this._watchers.clear();
      }
    };
    exports2.FileSystemWatcherFeature = FileSystemWatcherFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/colorProvider.js
var require_colorProvider = __commonJS({
  "node_modules/vscode-languageclient/lib/common/colorProvider.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ColorProviderFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var ColorProviderFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.DocumentColorRequest.type);
      }
      fillClientCapabilities(capabilities) {
        (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "colorProvider").dynamicRegistration = true;
      }
      initialize(capabilities, documentSelector) {
        let [id, options] = this.getRegistration(documentSelector, capabilities.colorProvider);
        if (!id || !options) {
          return;
        }
        this.register({ id, registerOptions: options });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const provider = {
          provideColorPresentations: (color, context, token) => {
            const client2 = this._client;
            const provideColorPresentations = (color2, context2, token2) => {
              const requestParams = {
                color: color2,
                textDocument: client2.code2ProtocolConverter.asTextDocumentIdentifier(context2.document),
                range: client2.code2ProtocolConverter.asRange(context2.range)
              };
              return client2.sendRequest(vscode_languageserver_protocol_1.ColorPresentationRequest.type, requestParams, token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return this._client.protocol2CodeConverter.asColorPresentations(result, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.ColorPresentationRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideColorPresentations ? middleware.provideColorPresentations(color, context, token, provideColorPresentations) : provideColorPresentations(color, context, token);
          },
          provideDocumentColors: (document, token) => {
            const client2 = this._client;
            const provideDocumentColors = (document2, token2) => {
              const requestParams = {
                textDocument: client2.code2ProtocolConverter.asTextDocumentIdentifier(document2)
              };
              return client2.sendRequest(vscode_languageserver_protocol_1.DocumentColorRequest.type, requestParams, token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return this._client.protocol2CodeConverter.asColorInformations(result, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.DocumentColorRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideDocumentColors ? middleware.provideDocumentColors(document, token, provideDocumentColors) : provideDocumentColors(document, token);
          }
        };
        return [vscode_1.languages.registerColorProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider), provider];
      }
    };
    exports2.ColorProviderFeature = ColorProviderFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/implementation.js
var require_implementation = __commonJS({
  "node_modules/vscode-languageclient/lib/common/implementation.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ImplementationFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var ImplementationFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.ImplementationRequest.type);
      }
      fillClientCapabilities(capabilities) {
        let implementationSupport = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "implementation");
        implementationSupport.dynamicRegistration = true;
        implementationSupport.linkSupport = true;
      }
      initialize(capabilities, documentSelector) {
        let [id, options] = this.getRegistration(documentSelector, capabilities.implementationProvider);
        if (!id || !options) {
          return;
        }
        this.register({ id, registerOptions: options });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const provider = {
          provideImplementation: (document, position, token) => {
            const client2 = this._client;
            const provideImplementation = (document2, position2, token2) => {
              return client2.sendRequest(vscode_languageserver_protocol_1.ImplementationRequest.type, client2.code2ProtocolConverter.asTextDocumentPositionParams(document2, position2), token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asDefinitionResult(result, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.ImplementationRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideImplementation ? middleware.provideImplementation(document, position, token, provideImplementation) : provideImplementation(document, position, token);
          }
        };
        return [this.registerProvider(selector, provider), provider];
      }
      registerProvider(selector, provider) {
        return vscode_1.languages.registerImplementationProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider);
      }
    };
    exports2.ImplementationFeature = ImplementationFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/typeDefinition.js
var require_typeDefinition = __commonJS({
  "node_modules/vscode-languageclient/lib/common/typeDefinition.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TypeDefinitionFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var TypeDefinitionFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.TypeDefinitionRequest.type);
      }
      fillClientCapabilities(capabilities) {
        (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "typeDefinition").dynamicRegistration = true;
        let typeDefinitionSupport = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "typeDefinition");
        typeDefinitionSupport.dynamicRegistration = true;
        typeDefinitionSupport.linkSupport = true;
      }
      initialize(capabilities, documentSelector) {
        let [id, options] = this.getRegistration(documentSelector, capabilities.typeDefinitionProvider);
        if (!id || !options) {
          return;
        }
        this.register({ id, registerOptions: options });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const provider = {
          provideTypeDefinition: (document, position, token) => {
            const client2 = this._client;
            const provideTypeDefinition = (document2, position2, token2) => {
              return client2.sendRequest(vscode_languageserver_protocol_1.TypeDefinitionRequest.type, client2.code2ProtocolConverter.asTextDocumentPositionParams(document2, position2), token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asDefinitionResult(result, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.TypeDefinitionRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideTypeDefinition ? middleware.provideTypeDefinition(document, position, token, provideTypeDefinition) : provideTypeDefinition(document, position, token);
          }
        };
        return [this.registerProvider(selector, provider), provider];
      }
      registerProvider(selector, provider) {
        return vscode_1.languages.registerTypeDefinitionProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider);
      }
    };
    exports2.TypeDefinitionFeature = TypeDefinitionFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/workspaceFolder.js
var require_workspaceFolder = __commonJS({
  "node_modules/vscode-languageclient/lib/common/workspaceFolder.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WorkspaceFoldersFeature = exports2.arrayDiff = void 0;
    var UUID = require_uuid();
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    function access(target, key) {
      if (target === void 0 || target === null) {
        return void 0;
      }
      return target[key];
    }
    function arrayDiff(left, right) {
      return left.filter((element) => right.indexOf(element) < 0);
    }
    exports2.arrayDiff = arrayDiff;
    var WorkspaceFoldersFeature = class {
      constructor(client2) {
        this._client = client2;
        this._listeners = /* @__PURE__ */ new Map();
      }
      getState() {
        return { kind: "workspace", id: this.registrationType.method, registrations: this._listeners.size > 0 };
      }
      get registrationType() {
        return vscode_languageserver_protocol_1.DidChangeWorkspaceFoldersNotification.type;
      }
      fillInitializeParams(params) {
        const folders = vscode_1.workspace.workspaceFolders;
        this.initializeWithFolders(folders);
        if (folders === void 0) {
          params.workspaceFolders = null;
        } else {
          params.workspaceFolders = folders.map((folder) => this.asProtocol(folder));
        }
      }
      initializeWithFolders(currentWorkspaceFolders) {
        this._initialFolders = currentWorkspaceFolders;
      }
      fillClientCapabilities(capabilities) {
        capabilities.workspace = capabilities.workspace || {};
        capabilities.workspace.workspaceFolders = true;
      }
      initialize(capabilities) {
        const client2 = this._client;
        client2.onRequest(vscode_languageserver_protocol_1.WorkspaceFoldersRequest.type, (token) => {
          const workspaceFolders = () => {
            const folders = vscode_1.workspace.workspaceFolders;
            if (folders === void 0) {
              return null;
            }
            const result = folders.map((folder) => {
              return this.asProtocol(folder);
            });
            return result;
          };
          const middleware = client2.middleware.workspace;
          return middleware && middleware.workspaceFolders ? middleware.workspaceFolders(token, workspaceFolders) : workspaceFolders(token);
        });
        const value = access(access(access(capabilities, "workspace"), "workspaceFolders"), "changeNotifications");
        let id;
        if (typeof value === "string") {
          id = value;
        } else if (value === true) {
          id = UUID.generateUuid();
        }
        if (id) {
          this.register({ id, registerOptions: void 0 });
        }
      }
      sendInitialEvent(currentWorkspaceFolders) {
        let promise;
        if (this._initialFolders && currentWorkspaceFolders) {
          const removed = arrayDiff(this._initialFolders, currentWorkspaceFolders);
          const added = arrayDiff(currentWorkspaceFolders, this._initialFolders);
          if (added.length > 0 || removed.length > 0) {
            promise = this.doSendEvent(added, removed);
          }
        } else if (this._initialFolders) {
          promise = this.doSendEvent([], this._initialFolders);
        } else if (currentWorkspaceFolders) {
          promise = this.doSendEvent(currentWorkspaceFolders, []);
        }
        if (promise !== void 0) {
          promise.catch((error) => {
            this._client.error(`Sending notification ${vscode_languageserver_protocol_1.DidChangeWorkspaceFoldersNotification.type.method} failed`, error);
          });
        }
      }
      doSendEvent(addedFolders, removedFolders) {
        let params = {
          event: {
            added: addedFolders.map((folder) => this.asProtocol(folder)),
            removed: removedFolders.map((folder) => this.asProtocol(folder))
          }
        };
        return this._client.sendNotification(vscode_languageserver_protocol_1.DidChangeWorkspaceFoldersNotification.type, params);
      }
      register(data) {
        let id = data.id;
        let client2 = this._client;
        let disposable = vscode_1.workspace.onDidChangeWorkspaceFolders((event) => {
          let didChangeWorkspaceFolders = (event2) => {
            return this.doSendEvent(event2.added, event2.removed);
          };
          let middleware = client2.middleware.workspace;
          const promise = middleware && middleware.didChangeWorkspaceFolders ? middleware.didChangeWorkspaceFolders(event, didChangeWorkspaceFolders) : didChangeWorkspaceFolders(event);
          promise.catch((error) => {
            this._client.error(`Sending notification ${vscode_languageserver_protocol_1.DidChangeWorkspaceFoldersNotification.type.method} failed`, error);
          });
        });
        this._listeners.set(id, disposable);
        this.sendInitialEvent(vscode_1.workspace.workspaceFolders);
      }
      unregister(id) {
        let disposable = this._listeners.get(id);
        if (disposable === void 0) {
          return;
        }
        this._listeners.delete(id);
        disposable.dispose();
      }
      clear() {
        for (let disposable of this._listeners.values()) {
          disposable.dispose();
        }
        this._listeners.clear();
      }
      asProtocol(workspaceFolder) {
        if (workspaceFolder === void 0) {
          return null;
        }
        return { uri: this._client.code2ProtocolConverter.asUri(workspaceFolder.uri), name: workspaceFolder.name };
      }
    };
    exports2.WorkspaceFoldersFeature = WorkspaceFoldersFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/foldingRange.js
var require_foldingRange = __commonJS({
  "node_modules/vscode-languageclient/lib/common/foldingRange.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.FoldingRangeFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var FoldingRangeFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.FoldingRangeRequest.type);
      }
      fillClientCapabilities(capabilities) {
        let capability = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "foldingRange");
        capability.dynamicRegistration = true;
        capability.rangeLimit = 5e3;
        capability.lineFoldingOnly = true;
        capability.foldingRangeKind = { valueSet: [vscode_languageserver_protocol_1.FoldingRangeKind.Comment, vscode_languageserver_protocol_1.FoldingRangeKind.Imports, vscode_languageserver_protocol_1.FoldingRangeKind.Region] };
        capability.foldingRange = { collapsedText: false };
        (0, features_1.ensure)((0, features_1.ensure)(capabilities, "workspace"), "foldingRange").refreshSupport = true;
      }
      initialize(capabilities, documentSelector) {
        this._client.onRequest(vscode_languageserver_protocol_1.FoldingRangeRefreshRequest.type, async () => {
          for (const provider of this.getAllProviders()) {
            provider.onDidChangeFoldingRange.fire();
          }
        });
        let [id, options] = this.getRegistration(documentSelector, capabilities.foldingRangeProvider);
        if (!id || !options) {
          return;
        }
        this.register({ id, registerOptions: options });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const eventEmitter = new vscode_1.EventEmitter();
        const provider = {
          onDidChangeFoldingRanges: eventEmitter.event,
          provideFoldingRanges: (document, context, token) => {
            const client2 = this._client;
            const provideFoldingRanges = (document2, _, token2) => {
              const requestParams = {
                textDocument: client2.code2ProtocolConverter.asTextDocumentIdentifier(document2)
              };
              return client2.sendRequest(vscode_languageserver_protocol_1.FoldingRangeRequest.type, requestParams, token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asFoldingRanges(result, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.FoldingRangeRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideFoldingRanges ? middleware.provideFoldingRanges(document, context, token, provideFoldingRanges) : provideFoldingRanges(document, context, token);
          }
        };
        return [vscode_1.languages.registerFoldingRangeProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider), { provider, onDidChangeFoldingRange: eventEmitter }];
      }
    };
    exports2.FoldingRangeFeature = FoldingRangeFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/declaration.js
var require_declaration = __commonJS({
  "node_modules/vscode-languageclient/lib/common/declaration.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DeclarationFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var DeclarationFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.DeclarationRequest.type);
      }
      fillClientCapabilities(capabilities) {
        const declarationSupport = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "declaration");
        declarationSupport.dynamicRegistration = true;
        declarationSupport.linkSupport = true;
      }
      initialize(capabilities, documentSelector) {
        const [id, options] = this.getRegistration(documentSelector, capabilities.declarationProvider);
        if (!id || !options) {
          return;
        }
        this.register({ id, registerOptions: options });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const provider = {
          provideDeclaration: (document, position, token) => {
            const client2 = this._client;
            const provideDeclaration = (document2, position2, token2) => {
              return client2.sendRequest(vscode_languageserver_protocol_1.DeclarationRequest.type, client2.code2ProtocolConverter.asTextDocumentPositionParams(document2, position2), token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asDeclarationResult(result, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.DeclarationRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideDeclaration ? middleware.provideDeclaration(document, position, token, provideDeclaration) : provideDeclaration(document, position, token);
          }
        };
        return [this.registerProvider(selector, provider), provider];
      }
      registerProvider(selector, provider) {
        return vscode_1.languages.registerDeclarationProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider);
      }
    };
    exports2.DeclarationFeature = DeclarationFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/selectionRange.js
var require_selectionRange = __commonJS({
  "node_modules/vscode-languageclient/lib/common/selectionRange.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SelectionRangeFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var SelectionRangeFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.SelectionRangeRequest.type);
      }
      fillClientCapabilities(capabilities) {
        const capability = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "selectionRange");
        capability.dynamicRegistration = true;
      }
      initialize(capabilities, documentSelector) {
        const [id, options] = this.getRegistration(documentSelector, capabilities.selectionRangeProvider);
        if (!id || !options) {
          return;
        }
        this.register({ id, registerOptions: options });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const provider = {
          provideSelectionRanges: (document, positions, token) => {
            const client2 = this._client;
            const provideSelectionRanges = async (document2, positions2, token2) => {
              const requestParams = {
                textDocument: client2.code2ProtocolConverter.asTextDocumentIdentifier(document2),
                positions: client2.code2ProtocolConverter.asPositionsSync(positions2, token2)
              };
              return client2.sendRequest(vscode_languageserver_protocol_1.SelectionRangeRequest.type, requestParams, token2).then((ranges) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asSelectionRanges(ranges, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.SelectionRangeRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideSelectionRanges ? middleware.provideSelectionRanges(document, positions, token, provideSelectionRanges) : provideSelectionRanges(document, positions, token);
          }
        };
        return [this.registerProvider(selector, provider), provider];
      }
      registerProvider(selector, provider) {
        return vscode_1.languages.registerSelectionRangeProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider);
      }
    };
    exports2.SelectionRangeFeature = SelectionRangeFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/progress.js
var require_progress = __commonJS({
  "node_modules/vscode-languageclient/lib/common/progress.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ProgressFeature = void 0;
    var vscode_languageserver_protocol_1 = require_main3();
    var progressPart_1 = require_progressPart();
    function ensure(target, key) {
      if (target[key] === void 0) {
        target[key] = /* @__PURE__ */ Object.create(null);
      }
      return target[key];
    }
    var ProgressFeature = class {
      constructor(_client) {
        this._client = _client;
        this.activeParts = /* @__PURE__ */ new Set();
      }
      getState() {
        return { kind: "window", id: vscode_languageserver_protocol_1.WorkDoneProgressCreateRequest.method, registrations: this.activeParts.size > 0 };
      }
      fillClientCapabilities(capabilities) {
        ensure(capabilities, "window").workDoneProgress = true;
      }
      initialize() {
        const client2 = this._client;
        const deleteHandler = (part) => {
          this.activeParts.delete(part);
        };
        const createHandler = (params) => {
          this.activeParts.add(new progressPart_1.ProgressPart(this._client, params.token, deleteHandler));
        };
        client2.onRequest(vscode_languageserver_protocol_1.WorkDoneProgressCreateRequest.type, createHandler);
      }
      clear() {
        for (const part of this.activeParts) {
          part.done();
        }
        this.activeParts.clear();
      }
    };
    exports2.ProgressFeature = ProgressFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/callHierarchy.js
var require_callHierarchy = __commonJS({
  "node_modules/vscode-languageclient/lib/common/callHierarchy.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.CallHierarchyFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var CallHierarchyProvider = class {
      constructor(client2) {
        this.client = client2;
        this.middleware = client2.middleware;
      }
      prepareCallHierarchy(document, position, token) {
        const client2 = this.client;
        const middleware = this.middleware;
        const prepareCallHierarchy = (document2, position2, token2) => {
          const params = client2.code2ProtocolConverter.asTextDocumentPositionParams(document2, position2);
          return client2.sendRequest(vscode_languageserver_protocol_1.CallHierarchyPrepareRequest.type, params, token2).then((result) => {
            if (token2.isCancellationRequested) {
              return null;
            }
            return client2.protocol2CodeConverter.asCallHierarchyItems(result, token2);
          }, (error) => {
            return client2.handleFailedRequest(vscode_languageserver_protocol_1.CallHierarchyPrepareRequest.type, token2, error, null);
          });
        };
        return middleware.prepareCallHierarchy ? middleware.prepareCallHierarchy(document, position, token, prepareCallHierarchy) : prepareCallHierarchy(document, position, token);
      }
      provideCallHierarchyIncomingCalls(item, token) {
        const client2 = this.client;
        const middleware = this.middleware;
        const provideCallHierarchyIncomingCalls = (item2, token2) => {
          const params = {
            item: client2.code2ProtocolConverter.asCallHierarchyItem(item2)
          };
          return client2.sendRequest(vscode_languageserver_protocol_1.CallHierarchyIncomingCallsRequest.type, params, token2).then((result) => {
            if (token2.isCancellationRequested) {
              return null;
            }
            return client2.protocol2CodeConverter.asCallHierarchyIncomingCalls(result, token2);
          }, (error) => {
            return client2.handleFailedRequest(vscode_languageserver_protocol_1.CallHierarchyIncomingCallsRequest.type, token2, error, null);
          });
        };
        return middleware.provideCallHierarchyIncomingCalls ? middleware.provideCallHierarchyIncomingCalls(item, token, provideCallHierarchyIncomingCalls) : provideCallHierarchyIncomingCalls(item, token);
      }
      provideCallHierarchyOutgoingCalls(item, token) {
        const client2 = this.client;
        const middleware = this.middleware;
        const provideCallHierarchyOutgoingCalls = (item2, token2) => {
          const params = {
            item: client2.code2ProtocolConverter.asCallHierarchyItem(item2)
          };
          return client2.sendRequest(vscode_languageserver_protocol_1.CallHierarchyOutgoingCallsRequest.type, params, token2).then((result) => {
            if (token2.isCancellationRequested) {
              return null;
            }
            return client2.protocol2CodeConverter.asCallHierarchyOutgoingCalls(result, token2);
          }, (error) => {
            return client2.handleFailedRequest(vscode_languageserver_protocol_1.CallHierarchyOutgoingCallsRequest.type, token2, error, null);
          });
        };
        return middleware.provideCallHierarchyOutgoingCalls ? middleware.provideCallHierarchyOutgoingCalls(item, token, provideCallHierarchyOutgoingCalls) : provideCallHierarchyOutgoingCalls(item, token);
      }
    };
    var CallHierarchyFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.CallHierarchyPrepareRequest.type);
      }
      fillClientCapabilities(cap) {
        const capabilities = cap;
        const capability = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "callHierarchy");
        capability.dynamicRegistration = true;
      }
      initialize(capabilities, documentSelector) {
        const [id, options] = this.getRegistration(documentSelector, capabilities.callHierarchyProvider);
        if (!id || !options) {
          return;
        }
        this.register({ id, registerOptions: options });
      }
      registerLanguageProvider(options) {
        const client2 = this._client;
        const provider = new CallHierarchyProvider(client2);
        return [vscode_1.languages.registerCallHierarchyProvider(this._client.protocol2CodeConverter.asDocumentSelector(options.documentSelector), provider), provider];
      }
    };
    exports2.CallHierarchyFeature = CallHierarchyFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/semanticTokens.js
var require_semanticTokens = __commonJS({
  "node_modules/vscode-languageclient/lib/common/semanticTokens.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SemanticTokensFeature = void 0;
    var vscode14 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var Is = require_is();
    var SemanticTokensFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.SemanticTokensRegistrationType.type);
      }
      fillClientCapabilities(capabilities) {
        const capability = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "semanticTokens");
        capability.dynamicRegistration = true;
        capability.tokenTypes = [
          vscode_languageserver_protocol_1.SemanticTokenTypes.namespace,
          vscode_languageserver_protocol_1.SemanticTokenTypes.type,
          vscode_languageserver_protocol_1.SemanticTokenTypes.class,
          vscode_languageserver_protocol_1.SemanticTokenTypes.enum,
          vscode_languageserver_protocol_1.SemanticTokenTypes.interface,
          vscode_languageserver_protocol_1.SemanticTokenTypes.struct,
          vscode_languageserver_protocol_1.SemanticTokenTypes.typeParameter,
          vscode_languageserver_protocol_1.SemanticTokenTypes.parameter,
          vscode_languageserver_protocol_1.SemanticTokenTypes.variable,
          vscode_languageserver_protocol_1.SemanticTokenTypes.property,
          vscode_languageserver_protocol_1.SemanticTokenTypes.enumMember,
          vscode_languageserver_protocol_1.SemanticTokenTypes.event,
          vscode_languageserver_protocol_1.SemanticTokenTypes.function,
          vscode_languageserver_protocol_1.SemanticTokenTypes.method,
          vscode_languageserver_protocol_1.SemanticTokenTypes.macro,
          vscode_languageserver_protocol_1.SemanticTokenTypes.keyword,
          vscode_languageserver_protocol_1.SemanticTokenTypes.modifier,
          vscode_languageserver_protocol_1.SemanticTokenTypes.comment,
          vscode_languageserver_protocol_1.SemanticTokenTypes.string,
          vscode_languageserver_protocol_1.SemanticTokenTypes.number,
          vscode_languageserver_protocol_1.SemanticTokenTypes.regexp,
          vscode_languageserver_protocol_1.SemanticTokenTypes.operator,
          vscode_languageserver_protocol_1.SemanticTokenTypes.decorator
        ];
        capability.tokenModifiers = [
          vscode_languageserver_protocol_1.SemanticTokenModifiers.declaration,
          vscode_languageserver_protocol_1.SemanticTokenModifiers.definition,
          vscode_languageserver_protocol_1.SemanticTokenModifiers.readonly,
          vscode_languageserver_protocol_1.SemanticTokenModifiers.static,
          vscode_languageserver_protocol_1.SemanticTokenModifiers.deprecated,
          vscode_languageserver_protocol_1.SemanticTokenModifiers.abstract,
          vscode_languageserver_protocol_1.SemanticTokenModifiers.async,
          vscode_languageserver_protocol_1.SemanticTokenModifiers.modification,
          vscode_languageserver_protocol_1.SemanticTokenModifiers.documentation,
          vscode_languageserver_protocol_1.SemanticTokenModifiers.defaultLibrary
        ];
        capability.formats = [vscode_languageserver_protocol_1.TokenFormat.Relative];
        capability.requests = {
          range: true,
          full: {
            delta: true
          }
        };
        capability.multilineTokenSupport = false;
        capability.overlappingTokenSupport = false;
        capability.serverCancelSupport = true;
        capability.augmentsSyntaxTokens = true;
        (0, features_1.ensure)((0, features_1.ensure)(capabilities, "workspace"), "semanticTokens").refreshSupport = true;
      }
      initialize(capabilities, documentSelector) {
        const client2 = this._client;
        client2.onRequest(vscode_languageserver_protocol_1.SemanticTokensRefreshRequest.type, async () => {
          for (const provider of this.getAllProviders()) {
            provider.onDidChangeSemanticTokensEmitter.fire();
          }
        });
        const [id, options] = this.getRegistration(documentSelector, capabilities.semanticTokensProvider);
        if (!id || !options) {
          return;
        }
        this.register({ id, registerOptions: options });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const fullProvider = Is.boolean(options.full) ? options.full : options.full !== void 0;
        const hasEditProvider = options.full !== void 0 && typeof options.full !== "boolean" && options.full.delta === true;
        const eventEmitter = new vscode14.EventEmitter();
        const documentProvider = fullProvider ? {
          onDidChangeSemanticTokens: eventEmitter.event,
          provideDocumentSemanticTokens: (document, token) => {
            const client3 = this._client;
            const middleware = client3.middleware;
            const provideDocumentSemanticTokens = (document2, token2) => {
              const params = {
                textDocument: client3.code2ProtocolConverter.asTextDocumentIdentifier(document2)
              };
              return client3.sendRequest(vscode_languageserver_protocol_1.SemanticTokensRequest.type, params, token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client3.protocol2CodeConverter.asSemanticTokens(result, token2);
              }, (error) => {
                return client3.handleFailedRequest(vscode_languageserver_protocol_1.SemanticTokensRequest.type, token2, error, null);
              });
            };
            return middleware.provideDocumentSemanticTokens ? middleware.provideDocumentSemanticTokens(document, token, provideDocumentSemanticTokens) : provideDocumentSemanticTokens(document, token);
          },
          provideDocumentSemanticTokensEdits: hasEditProvider ? (document, previousResultId, token) => {
            const client3 = this._client;
            const middleware = client3.middleware;
            const provideDocumentSemanticTokensEdits = (document2, previousResultId2, token2) => {
              const params = {
                textDocument: client3.code2ProtocolConverter.asTextDocumentIdentifier(document2),
                previousResultId: previousResultId2
              };
              return client3.sendRequest(vscode_languageserver_protocol_1.SemanticTokensDeltaRequest.type, params, token2).then(async (result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                if (vscode_languageserver_protocol_1.SemanticTokens.is(result)) {
                  return await client3.protocol2CodeConverter.asSemanticTokens(result, token2);
                } else {
                  return await client3.protocol2CodeConverter.asSemanticTokensEdits(result, token2);
                }
              }, (error) => {
                return client3.handleFailedRequest(vscode_languageserver_protocol_1.SemanticTokensDeltaRequest.type, token2, error, null);
              });
            };
            return middleware.provideDocumentSemanticTokensEdits ? middleware.provideDocumentSemanticTokensEdits(document, previousResultId, token, provideDocumentSemanticTokensEdits) : provideDocumentSemanticTokensEdits(document, previousResultId, token);
          } : void 0
        } : void 0;
        const hasRangeProvider = options.range === true;
        const rangeProvider = hasRangeProvider ? {
          provideDocumentRangeSemanticTokens: (document, range, token) => {
            const client3 = this._client;
            const middleware = client3.middleware;
            const provideDocumentRangeSemanticTokens = (document2, range2, token2) => {
              const params = {
                textDocument: client3.code2ProtocolConverter.asTextDocumentIdentifier(document2),
                range: client3.code2ProtocolConverter.asRange(range2)
              };
              return client3.sendRequest(vscode_languageserver_protocol_1.SemanticTokensRangeRequest.type, params, token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client3.protocol2CodeConverter.asSemanticTokens(result, token2);
              }, (error) => {
                return client3.handleFailedRequest(vscode_languageserver_protocol_1.SemanticTokensRangeRequest.type, token2, error, null);
              });
            };
            return middleware.provideDocumentRangeSemanticTokens ? middleware.provideDocumentRangeSemanticTokens(document, range, token, provideDocumentRangeSemanticTokens) : provideDocumentRangeSemanticTokens(document, range, token);
          }
        } : void 0;
        const disposables = [];
        const client2 = this._client;
        const legend = client2.protocol2CodeConverter.asSemanticTokensLegend(options.legend);
        const documentSelector = client2.protocol2CodeConverter.asDocumentSelector(selector);
        if (documentProvider !== void 0) {
          disposables.push(vscode14.languages.registerDocumentSemanticTokensProvider(documentSelector, documentProvider, legend));
        }
        if (rangeProvider !== void 0) {
          disposables.push(vscode14.languages.registerDocumentRangeSemanticTokensProvider(documentSelector, rangeProvider, legend));
        }
        return [new vscode14.Disposable(() => disposables.forEach((item) => item.dispose())), { range: rangeProvider, full: documentProvider, onDidChangeSemanticTokensEmitter: eventEmitter }];
      }
    };
    exports2.SemanticTokensFeature = SemanticTokensFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/fileOperations.js
var require_fileOperations = __commonJS({
  "node_modules/vscode-languageclient/lib/common/fileOperations.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.WillDeleteFilesFeature = exports2.WillRenameFilesFeature = exports2.WillCreateFilesFeature = exports2.DidDeleteFilesFeature = exports2.DidRenameFilesFeature = exports2.DidCreateFilesFeature = void 0;
    var code = require("vscode");
    var minimatch = require_minimatch();
    var proto = require_main3();
    var UUID = require_uuid();
    function ensure(target, key) {
      if (target[key] === void 0) {
        target[key] = {};
      }
      return target[key];
    }
    function access(target, key) {
      return target[key];
    }
    function assign(target, key, value) {
      target[key] = value;
    }
    var FileOperationFeature = class _FileOperationFeature {
      constructor(client2, event, registrationType, clientCapability, serverCapability) {
        this._client = client2;
        this._event = event;
        this._registrationType = registrationType;
        this._clientCapability = clientCapability;
        this._serverCapability = serverCapability;
        this._filters = /* @__PURE__ */ new Map();
      }
      getState() {
        return { kind: "workspace", id: this._registrationType.method, registrations: this._filters.size > 0 };
      }
      filterSize() {
        return this._filters.size;
      }
      get registrationType() {
        return this._registrationType;
      }
      fillClientCapabilities(capabilities) {
        const value = ensure(ensure(capabilities, "workspace"), "fileOperations");
        assign(value, "dynamicRegistration", true);
        assign(value, this._clientCapability, true);
      }
      initialize(capabilities) {
        const options = capabilities.workspace?.fileOperations;
        const capability = options !== void 0 ? access(options, this._serverCapability) : void 0;
        if (capability?.filters !== void 0) {
          try {
            this.register({
              id: UUID.generateUuid(),
              registerOptions: { filters: capability.filters }
            });
          } catch (e) {
            this._client.warn(`Ignoring invalid glob pattern for ${this._serverCapability} registration: ${e}`);
          }
        }
      }
      register(data) {
        if (!this._listener) {
          this._listener = this._event(this.send, this);
        }
        const minimatchFilter = data.registerOptions.filters.map((filter) => {
          const matcher = new minimatch.Minimatch(filter.pattern.glob, _FileOperationFeature.asMinimatchOptions(filter.pattern.options));
          if (!matcher.makeRe()) {
            throw new Error(`Invalid pattern ${filter.pattern.glob}!`);
          }
          return { scheme: filter.scheme, matcher, kind: filter.pattern.matches };
        });
        this._filters.set(data.id, minimatchFilter);
      }
      unregister(id) {
        this._filters.delete(id);
        if (this._filters.size === 0 && this._listener) {
          this._listener.dispose();
          this._listener = void 0;
        }
      }
      clear() {
        this._filters.clear();
        if (this._listener) {
          this._listener.dispose();
          this._listener = void 0;
        }
      }
      getFileType(uri) {
        return _FileOperationFeature.getFileType(uri);
      }
      async filter(event, prop) {
        const fileMatches = await Promise.all(event.files.map(async (item) => {
          const uri = prop(item);
          const path2 = uri.fsPath.replace(/\\/g, "/");
          for (const filters of this._filters.values()) {
            for (const filter of filters) {
              if (filter.scheme !== void 0 && filter.scheme !== uri.scheme) {
                continue;
              }
              if (filter.matcher.match(path2)) {
                if (filter.kind === void 0) {
                  return true;
                }
                const fileType = await this.getFileType(uri);
                if (fileType === void 0) {
                  this._client.error(`Failed to determine file type for ${uri.toString()}.`);
                  return true;
                }
                if (fileType === code.FileType.File && filter.kind === proto.FileOperationPatternKind.file || fileType === code.FileType.Directory && filter.kind === proto.FileOperationPatternKind.folder) {
                  return true;
                }
              } else if (filter.kind === proto.FileOperationPatternKind.folder) {
                const fileType = await _FileOperationFeature.getFileType(uri);
                if (fileType === code.FileType.Directory && filter.matcher.match(`${path2}/`)) {
                  return true;
                }
              }
            }
          }
          return false;
        }));
        const files = event.files.filter((_, index) => fileMatches[index]);
        return { ...event, files };
      }
      static async getFileType(uri) {
        try {
          return (await code.workspace.fs.stat(uri)).type;
        } catch (e) {
          return void 0;
        }
      }
      static asMinimatchOptions(options) {
        const result = { dot: true };
        if (options?.ignoreCase === true) {
          result.nocase = true;
        }
        return result;
      }
    };
    var NotificationFileOperationFeature = class extends FileOperationFeature {
      constructor(client2, event, notificationType, clientCapability, serverCapability, accessUri, createParams) {
        super(client2, event, notificationType, clientCapability, serverCapability);
        this._notificationType = notificationType;
        this._accessUri = accessUri;
        this._createParams = createParams;
      }
      async send(originalEvent) {
        const filteredEvent = await this.filter(originalEvent, this._accessUri);
        if (filteredEvent.files.length) {
          const next = async (event) => {
            return this._client.sendNotification(this._notificationType, this._createParams(event));
          };
          return this.doSend(filteredEvent, next);
        }
      }
    };
    var CachingNotificationFileOperationFeature = class extends NotificationFileOperationFeature {
      constructor() {
        super(...arguments);
        this._fsPathFileTypes = /* @__PURE__ */ new Map();
      }
      async getFileType(uri) {
        const fsPath = uri.fsPath;
        if (this._fsPathFileTypes.has(fsPath)) {
          return this._fsPathFileTypes.get(fsPath);
        }
        const type = await FileOperationFeature.getFileType(uri);
        if (type) {
          this._fsPathFileTypes.set(fsPath, type);
        }
        return type;
      }
      async cacheFileTypes(event, prop) {
        await this.filter(event, prop);
      }
      clearFileTypeCache() {
        this._fsPathFileTypes.clear();
      }
      unregister(id) {
        super.unregister(id);
        if (this.filterSize() === 0 && this._willListener) {
          this._willListener.dispose();
          this._willListener = void 0;
        }
      }
      clear() {
        super.clear();
        if (this._willListener) {
          this._willListener.dispose();
          this._willListener = void 0;
        }
      }
    };
    var DidCreateFilesFeature = class extends NotificationFileOperationFeature {
      constructor(client2) {
        super(client2, code.workspace.onDidCreateFiles, proto.DidCreateFilesNotification.type, "didCreate", "didCreate", (i) => i, client2.code2ProtocolConverter.asDidCreateFilesParams);
      }
      doSend(event, next) {
        const middleware = this._client.middleware.workspace;
        return middleware?.didCreateFiles ? middleware.didCreateFiles(event, next) : next(event);
      }
    };
    exports2.DidCreateFilesFeature = DidCreateFilesFeature;
    var DidRenameFilesFeature = class extends CachingNotificationFileOperationFeature {
      constructor(client2) {
        super(client2, code.workspace.onDidRenameFiles, proto.DidRenameFilesNotification.type, "didRename", "didRename", (i) => i.oldUri, client2.code2ProtocolConverter.asDidRenameFilesParams);
      }
      register(data) {
        if (!this._willListener) {
          this._willListener = code.workspace.onWillRenameFiles(this.willRename, this);
        }
        super.register(data);
      }
      willRename(e) {
        e.waitUntil(this.cacheFileTypes(e, (i) => i.oldUri));
      }
      doSend(event, next) {
        this.clearFileTypeCache();
        const middleware = this._client.middleware.workspace;
        return middleware?.didRenameFiles ? middleware.didRenameFiles(event, next) : next(event);
      }
    };
    exports2.DidRenameFilesFeature = DidRenameFilesFeature;
    var DidDeleteFilesFeature = class extends CachingNotificationFileOperationFeature {
      constructor(client2) {
        super(client2, code.workspace.onDidDeleteFiles, proto.DidDeleteFilesNotification.type, "didDelete", "didDelete", (i) => i, client2.code2ProtocolConverter.asDidDeleteFilesParams);
      }
      register(data) {
        if (!this._willListener) {
          this._willListener = code.workspace.onWillDeleteFiles(this.willDelete, this);
        }
        super.register(data);
      }
      willDelete(e) {
        e.waitUntil(this.cacheFileTypes(e, (i) => i));
      }
      doSend(event, next) {
        this.clearFileTypeCache();
        const middleware = this._client.middleware.workspace;
        return middleware?.didDeleteFiles ? middleware.didDeleteFiles(event, next) : next(event);
      }
    };
    exports2.DidDeleteFilesFeature = DidDeleteFilesFeature;
    var RequestFileOperationFeature = class extends FileOperationFeature {
      constructor(client2, event, requestType, clientCapability, serverCapability, accessUri, createParams) {
        super(client2, event, requestType, clientCapability, serverCapability);
        this._requestType = requestType;
        this._accessUri = accessUri;
        this._createParams = createParams;
      }
      async send(originalEvent) {
        const waitUntil = this.waitUntil(originalEvent);
        originalEvent.waitUntil(waitUntil);
      }
      async waitUntil(originalEvent) {
        const filteredEvent = await this.filter(originalEvent, this._accessUri);
        if (filteredEvent.files.length) {
          const next = (event) => {
            return this._client.sendRequest(this._requestType, this._createParams(event), event.token).then(this._client.protocol2CodeConverter.asWorkspaceEdit);
          };
          return this.doSend(filteredEvent, next);
        } else {
          return void 0;
        }
      }
    };
    var WillCreateFilesFeature = class extends RequestFileOperationFeature {
      constructor(client2) {
        super(client2, code.workspace.onWillCreateFiles, proto.WillCreateFilesRequest.type, "willCreate", "willCreate", (i) => i, client2.code2ProtocolConverter.asWillCreateFilesParams);
      }
      doSend(event, next) {
        const middleware = this._client.middleware.workspace;
        return middleware?.willCreateFiles ? middleware.willCreateFiles(event, next) : next(event);
      }
    };
    exports2.WillCreateFilesFeature = WillCreateFilesFeature;
    var WillRenameFilesFeature = class extends RequestFileOperationFeature {
      constructor(client2) {
        super(client2, code.workspace.onWillRenameFiles, proto.WillRenameFilesRequest.type, "willRename", "willRename", (i) => i.oldUri, client2.code2ProtocolConverter.asWillRenameFilesParams);
      }
      doSend(event, next) {
        const middleware = this._client.middleware.workspace;
        return middleware?.willRenameFiles ? middleware.willRenameFiles(event, next) : next(event);
      }
    };
    exports2.WillRenameFilesFeature = WillRenameFilesFeature;
    var WillDeleteFilesFeature = class extends RequestFileOperationFeature {
      constructor(client2) {
        super(client2, code.workspace.onWillDeleteFiles, proto.WillDeleteFilesRequest.type, "willDelete", "willDelete", (i) => i, client2.code2ProtocolConverter.asWillDeleteFilesParams);
      }
      doSend(event, next) {
        const middleware = this._client.middleware.workspace;
        return middleware?.willDeleteFiles ? middleware.willDeleteFiles(event, next) : next(event);
      }
    };
    exports2.WillDeleteFilesFeature = WillDeleteFilesFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/linkedEditingRange.js
var require_linkedEditingRange = __commonJS({
  "node_modules/vscode-languageclient/lib/common/linkedEditingRange.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.LinkedEditingFeature = void 0;
    var code = require("vscode");
    var proto = require_main3();
    var features_1 = require_features();
    var LinkedEditingFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, proto.LinkedEditingRangeRequest.type);
      }
      fillClientCapabilities(capabilities) {
        const linkedEditingSupport = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "linkedEditingRange");
        linkedEditingSupport.dynamicRegistration = true;
      }
      initialize(capabilities, documentSelector) {
        let [id, options] = this.getRegistration(documentSelector, capabilities.linkedEditingRangeProvider);
        if (!id || !options) {
          return;
        }
        this.register({ id, registerOptions: options });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const provider = {
          provideLinkedEditingRanges: (document, position, token) => {
            const client2 = this._client;
            const provideLinkedEditing = (document2, position2, token2) => {
              return client2.sendRequest(proto.LinkedEditingRangeRequest.type, client2.code2ProtocolConverter.asTextDocumentPositionParams(document2, position2), token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asLinkedEditingRanges(result, token2);
              }, (error) => {
                return client2.handleFailedRequest(proto.LinkedEditingRangeRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideLinkedEditingRange ? middleware.provideLinkedEditingRange(document, position, token, provideLinkedEditing) : provideLinkedEditing(document, position, token);
          }
        };
        return [this.registerProvider(selector, provider), provider];
      }
      registerProvider(selector, provider) {
        return code.languages.registerLinkedEditingRangeProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider);
      }
    };
    exports2.LinkedEditingFeature = LinkedEditingFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/typeHierarchy.js
var require_typeHierarchy = __commonJS({
  "node_modules/vscode-languageclient/lib/common/typeHierarchy.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.TypeHierarchyFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var TypeHierarchyProvider = class {
      constructor(client2) {
        this.client = client2;
        this.middleware = client2.middleware;
      }
      prepareTypeHierarchy(document, position, token) {
        const client2 = this.client;
        const middleware = this.middleware;
        const prepareTypeHierarchy = (document2, position2, token2) => {
          const params = client2.code2ProtocolConverter.asTextDocumentPositionParams(document2, position2);
          return client2.sendRequest(vscode_languageserver_protocol_1.TypeHierarchyPrepareRequest.type, params, token2).then((result) => {
            if (token2.isCancellationRequested) {
              return null;
            }
            return client2.protocol2CodeConverter.asTypeHierarchyItems(result, token2);
          }, (error) => {
            return client2.handleFailedRequest(vscode_languageserver_protocol_1.TypeHierarchyPrepareRequest.type, token2, error, null);
          });
        };
        return middleware.prepareTypeHierarchy ? middleware.prepareTypeHierarchy(document, position, token, prepareTypeHierarchy) : prepareTypeHierarchy(document, position, token);
      }
      provideTypeHierarchySupertypes(item, token) {
        const client2 = this.client;
        const middleware = this.middleware;
        const provideTypeHierarchySupertypes = (item2, token2) => {
          const params = {
            item: client2.code2ProtocolConverter.asTypeHierarchyItem(item2)
          };
          return client2.sendRequest(vscode_languageserver_protocol_1.TypeHierarchySupertypesRequest.type, params, token2).then((result) => {
            if (token2.isCancellationRequested) {
              return null;
            }
            return client2.protocol2CodeConverter.asTypeHierarchyItems(result, token2);
          }, (error) => {
            return client2.handleFailedRequest(vscode_languageserver_protocol_1.TypeHierarchySupertypesRequest.type, token2, error, null);
          });
        };
        return middleware.provideTypeHierarchySupertypes ? middleware.provideTypeHierarchySupertypes(item, token, provideTypeHierarchySupertypes) : provideTypeHierarchySupertypes(item, token);
      }
      provideTypeHierarchySubtypes(item, token) {
        const client2 = this.client;
        const middleware = this.middleware;
        const provideTypeHierarchySubtypes = (item2, token2) => {
          const params = {
            item: client2.code2ProtocolConverter.asTypeHierarchyItem(item2)
          };
          return client2.sendRequest(vscode_languageserver_protocol_1.TypeHierarchySubtypesRequest.type, params, token2).then((result) => {
            if (token2.isCancellationRequested) {
              return null;
            }
            return client2.protocol2CodeConverter.asTypeHierarchyItems(result, token2);
          }, (error) => {
            return client2.handleFailedRequest(vscode_languageserver_protocol_1.TypeHierarchySubtypesRequest.type, token2, error, null);
          });
        };
        return middleware.provideTypeHierarchySubtypes ? middleware.provideTypeHierarchySubtypes(item, token, provideTypeHierarchySubtypes) : provideTypeHierarchySubtypes(item, token);
      }
    };
    var TypeHierarchyFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.TypeHierarchyPrepareRequest.type);
      }
      fillClientCapabilities(capabilities) {
        const capability = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "typeHierarchy");
        capability.dynamicRegistration = true;
      }
      initialize(capabilities, documentSelector) {
        const [id, options] = this.getRegistration(documentSelector, capabilities.typeHierarchyProvider);
        if (!id || !options) {
          return;
        }
        this.register({ id, registerOptions: options });
      }
      registerLanguageProvider(options) {
        const client2 = this._client;
        const provider = new TypeHierarchyProvider(client2);
        return [vscode_1.languages.registerTypeHierarchyProvider(client2.protocol2CodeConverter.asDocumentSelector(options.documentSelector), provider), provider];
      }
    };
    exports2.TypeHierarchyFeature = TypeHierarchyFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/inlineValue.js
var require_inlineValue = __commonJS({
  "node_modules/vscode-languageclient/lib/common/inlineValue.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InlineValueFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var InlineValueFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.InlineValueRequest.type);
      }
      fillClientCapabilities(capabilities) {
        (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "inlineValue").dynamicRegistration = true;
        (0, features_1.ensure)((0, features_1.ensure)(capabilities, "workspace"), "inlineValue").refreshSupport = true;
      }
      initialize(capabilities, documentSelector) {
        this._client.onRequest(vscode_languageserver_protocol_1.InlineValueRefreshRequest.type, async () => {
          for (const provider of this.getAllProviders()) {
            provider.onDidChangeInlineValues.fire();
          }
        });
        const [id, options] = this.getRegistration(documentSelector, capabilities.inlineValueProvider);
        if (!id || !options) {
          return;
        }
        this.register({ id, registerOptions: options });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const eventEmitter = new vscode_1.EventEmitter();
        const provider = {
          onDidChangeInlineValues: eventEmitter.event,
          provideInlineValues: (document, viewPort, context, token) => {
            const client2 = this._client;
            const provideInlineValues = (document2, viewPort2, context2, token2) => {
              const requestParams = {
                textDocument: client2.code2ProtocolConverter.asTextDocumentIdentifier(document2),
                range: client2.code2ProtocolConverter.asRange(viewPort2),
                context: client2.code2ProtocolConverter.asInlineValueContext(context2)
              };
              return client2.sendRequest(vscode_languageserver_protocol_1.InlineValueRequest.type, requestParams, token2).then((values) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asInlineValues(values, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.InlineValueRequest.type, token2, error, null);
              });
            };
            const middleware = client2.middleware;
            return middleware.provideInlineValues ? middleware.provideInlineValues(document, viewPort, context, token, provideInlineValues) : provideInlineValues(document, viewPort, context, token);
          }
        };
        return [this.registerProvider(selector, provider), { provider, onDidChangeInlineValues: eventEmitter }];
      }
      registerProvider(selector, provider) {
        return vscode_1.languages.registerInlineValuesProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider);
      }
    };
    exports2.InlineValueFeature = InlineValueFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/inlayHint.js
var require_inlayHint = __commonJS({
  "node_modules/vscode-languageclient/lib/common/inlayHint.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InlayHintsFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var InlayHintsFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.InlayHintRequest.type);
      }
      fillClientCapabilities(capabilities) {
        const inlayHint = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "inlayHint");
        inlayHint.dynamicRegistration = true;
        inlayHint.resolveSupport = {
          properties: ["tooltip", "textEdits", "label.tooltip", "label.location", "label.command"]
        };
        (0, features_1.ensure)((0, features_1.ensure)(capabilities, "workspace"), "inlayHint").refreshSupport = true;
      }
      initialize(capabilities, documentSelector) {
        this._client.onRequest(vscode_languageserver_protocol_1.InlayHintRefreshRequest.type, async () => {
          for (const provider of this.getAllProviders()) {
            provider.onDidChangeInlayHints.fire();
          }
        });
        const [id, options] = this.getRegistration(documentSelector, capabilities.inlayHintProvider);
        if (!id || !options) {
          return;
        }
        this.register({ id, registerOptions: options });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const eventEmitter = new vscode_1.EventEmitter();
        const provider = {
          onDidChangeInlayHints: eventEmitter.event,
          provideInlayHints: (document, viewPort, token) => {
            const client2 = this._client;
            const provideInlayHints = async (document2, viewPort2, token2) => {
              const requestParams = {
                textDocument: client2.code2ProtocolConverter.asTextDocumentIdentifier(document2),
                range: client2.code2ProtocolConverter.asRange(viewPort2)
              };
              try {
                const values = await client2.sendRequest(vscode_languageserver_protocol_1.InlayHintRequest.type, requestParams, token2);
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asInlayHints(values, token2);
              } catch (error) {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.InlayHintRequest.type, token2, error, null);
              }
            };
            const middleware = client2.middleware;
            return middleware.provideInlayHints ? middleware.provideInlayHints(document, viewPort, token, provideInlayHints) : provideInlayHints(document, viewPort, token);
          }
        };
        provider.resolveInlayHint = options.resolveProvider === true ? (hint, token) => {
          const client2 = this._client;
          const resolveInlayHint = async (item, token2) => {
            try {
              const value = await client2.sendRequest(vscode_languageserver_protocol_1.InlayHintResolveRequest.type, client2.code2ProtocolConverter.asInlayHint(item), token2);
              if (token2.isCancellationRequested) {
                return null;
              }
              const result = client2.protocol2CodeConverter.asInlayHint(value, token2);
              return token2.isCancellationRequested ? null : result;
            } catch (error) {
              return client2.handleFailedRequest(vscode_languageserver_protocol_1.InlayHintResolveRequest.type, token2, error, null);
            }
          };
          const middleware = client2.middleware;
          return middleware.resolveInlayHint ? middleware.resolveInlayHint(hint, token, resolveInlayHint) : resolveInlayHint(hint, token);
        } : void 0;
        return [this.registerProvider(selector, provider), { provider, onDidChangeInlayHints: eventEmitter }];
      }
      registerProvider(selector, provider) {
        return vscode_1.languages.registerInlayHintsProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider);
      }
    };
    exports2.InlayHintsFeature = InlayHintsFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/inlineCompletion.js
var require_inlineCompletion = __commonJS({
  "node_modules/vscode-languageclient/lib/common/inlineCompletion.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.InlineCompletionItemFeature = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var features_1 = require_features();
    var UUID = require_uuid();
    var InlineCompletionItemFeature = class extends features_1.TextDocumentLanguageFeature {
      constructor(client2) {
        super(client2, vscode_languageserver_protocol_1.InlineCompletionRequest.type);
      }
      fillClientCapabilities(capabilities) {
        let inlineCompletion = (0, features_1.ensure)((0, features_1.ensure)(capabilities, "textDocument"), "inlineCompletion");
        inlineCompletion.dynamicRegistration = true;
      }
      initialize(capabilities, documentSelector) {
        const options = this.getRegistrationOptions(documentSelector, capabilities.inlineCompletionProvider);
        if (!options) {
          return;
        }
        this.register({
          id: UUID.generateUuid(),
          registerOptions: options
        });
      }
      registerLanguageProvider(options) {
        const selector = options.documentSelector;
        const provider = {
          provideInlineCompletionItems: (document, position, context, token) => {
            const client2 = this._client;
            const middleware = this._client.middleware;
            const provideInlineCompletionItems = (document2, position2, context2, token2) => {
              return client2.sendRequest(vscode_languageserver_protocol_1.InlineCompletionRequest.type, client2.code2ProtocolConverter.asInlineCompletionParams(document2, position2, context2), token2).then((result) => {
                if (token2.isCancellationRequested) {
                  return null;
                }
                return client2.protocol2CodeConverter.asInlineCompletionResult(result, token2);
              }, (error) => {
                return client2.handleFailedRequest(vscode_languageserver_protocol_1.InlineCompletionRequest.type, token2, error, null);
              });
            };
            return middleware.provideInlineCompletionItems ? middleware.provideInlineCompletionItems(document, position, context, token, provideInlineCompletionItems) : provideInlineCompletionItems(document, position, context, token);
          }
        };
        return [vscode_1.languages.registerInlineCompletionItemProvider(this._client.protocol2CodeConverter.asDocumentSelector(selector), provider), provider];
      }
    };
    exports2.InlineCompletionItemFeature = InlineCompletionItemFeature;
  }
});

// node_modules/vscode-languageclient/lib/common/client.js
var require_client = __commonJS({
  "node_modules/vscode-languageclient/lib/common/client.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.ProposedFeatures = exports2.BaseLanguageClient = exports2.MessageTransports = exports2.SuspendMode = exports2.State = exports2.CloseAction = exports2.ErrorAction = exports2.RevealOutputChannelOn = void 0;
    var vscode_1 = require("vscode");
    var vscode_languageserver_protocol_1 = require_main3();
    var c2p = require_codeConverter();
    var p2c = require_protocolConverter();
    var Is = require_is();
    var async_1 = require_async();
    var UUID = require_uuid();
    var progressPart_1 = require_progressPart();
    var features_1 = require_features();
    var diagnostic_1 = require_diagnostic();
    var notebook_1 = require_notebook();
    var configuration_1 = require_configuration();
    var textSynchronization_1 = require_textSynchronization();
    var completion_1 = require_completion();
    var hover_1 = require_hover();
    var definition_1 = require_definition();
    var signatureHelp_1 = require_signatureHelp();
    var documentHighlight_1 = require_documentHighlight();
    var documentSymbol_1 = require_documentSymbol();
    var workspaceSymbol_1 = require_workspaceSymbol();
    var reference_1 = require_reference();
    var codeAction_1 = require_codeAction();
    var codeLens_1 = require_codeLens();
    var formatting_1 = require_formatting();
    var rename_1 = require_rename();
    var documentLink_1 = require_documentLink();
    var executeCommand_1 = require_executeCommand();
    var fileSystemWatcher_1 = require_fileSystemWatcher();
    var colorProvider_1 = require_colorProvider();
    var implementation_1 = require_implementation();
    var typeDefinition_1 = require_typeDefinition();
    var workspaceFolder_1 = require_workspaceFolder();
    var foldingRange_1 = require_foldingRange();
    var declaration_1 = require_declaration();
    var selectionRange_1 = require_selectionRange();
    var progress_1 = require_progress();
    var callHierarchy_1 = require_callHierarchy();
    var semanticTokens_1 = require_semanticTokens();
    var fileOperations_1 = require_fileOperations();
    var linkedEditingRange_1 = require_linkedEditingRange();
    var typeHierarchy_1 = require_typeHierarchy();
    var inlineValue_1 = require_inlineValue();
    var inlayHint_1 = require_inlayHint();
    var inlineCompletion_1 = require_inlineCompletion();
    var RevealOutputChannelOn;
    (function(RevealOutputChannelOn2) {
      RevealOutputChannelOn2[RevealOutputChannelOn2["Debug"] = 0] = "Debug";
      RevealOutputChannelOn2[RevealOutputChannelOn2["Info"] = 1] = "Info";
      RevealOutputChannelOn2[RevealOutputChannelOn2["Warn"] = 2] = "Warn";
      RevealOutputChannelOn2[RevealOutputChannelOn2["Error"] = 3] = "Error";
      RevealOutputChannelOn2[RevealOutputChannelOn2["Never"] = 4] = "Never";
    })(RevealOutputChannelOn || (exports2.RevealOutputChannelOn = RevealOutputChannelOn = {}));
    var ErrorAction;
    (function(ErrorAction2) {
      ErrorAction2[ErrorAction2["Continue"] = 1] = "Continue";
      ErrorAction2[ErrorAction2["Shutdown"] = 2] = "Shutdown";
    })(ErrorAction || (exports2.ErrorAction = ErrorAction = {}));
    var CloseAction;
    (function(CloseAction2) {
      CloseAction2[CloseAction2["DoNotRestart"] = 1] = "DoNotRestart";
      CloseAction2[CloseAction2["Restart"] = 2] = "Restart";
    })(CloseAction || (exports2.CloseAction = CloseAction = {}));
    var State;
    (function(State2) {
      State2[State2["Stopped"] = 1] = "Stopped";
      State2[State2["Starting"] = 3] = "Starting";
      State2[State2["Running"] = 2] = "Running";
    })(State || (exports2.State = State = {}));
    var SuspendMode;
    (function(SuspendMode2) {
      SuspendMode2["off"] = "off";
      SuspendMode2["on"] = "on";
    })(SuspendMode || (exports2.SuspendMode = SuspendMode = {}));
    var ResolvedClientOptions;
    (function(ResolvedClientOptions2) {
      function sanitizeIsTrusted(isTrusted) {
        if (isTrusted === void 0 || isTrusted === null) {
          return false;
        }
        if (typeof isTrusted === "boolean" || typeof isTrusted === "object" && isTrusted !== null && Is.stringArray(isTrusted.enabledCommands)) {
          return isTrusted;
        }
        return false;
      }
      ResolvedClientOptions2.sanitizeIsTrusted = sanitizeIsTrusted;
    })(ResolvedClientOptions || (ResolvedClientOptions = {}));
    var DefaultErrorHandler = class {
      constructor(client2, maxRestartCount) {
        this.client = client2;
        this.maxRestartCount = maxRestartCount;
        this.restarts = [];
      }
      error(_error, _message, count) {
        if (count && count <= 3) {
          return { action: ErrorAction.Continue };
        }
        return { action: ErrorAction.Shutdown };
      }
      closed() {
        this.restarts.push(Date.now());
        if (this.restarts.length <= this.maxRestartCount) {
          return { action: CloseAction.Restart };
        } else {
          let diff = this.restarts[this.restarts.length - 1] - this.restarts[0];
          if (diff <= 3 * 60 * 1e3) {
            return { action: CloseAction.DoNotRestart, message: `The ${this.client.name} server crashed ${this.maxRestartCount + 1} times in the last 3 minutes. The server will not be restarted. See the output for more information.` };
          } else {
            this.restarts.shift();
            return { action: CloseAction.Restart };
          }
        }
      }
    };
    var ClientState;
    (function(ClientState2) {
      ClientState2["Initial"] = "initial";
      ClientState2["Starting"] = "starting";
      ClientState2["StartFailed"] = "startFailed";
      ClientState2["Running"] = "running";
      ClientState2["Stopping"] = "stopping";
      ClientState2["Stopped"] = "stopped";
    })(ClientState || (ClientState = {}));
    var MessageTransports;
    (function(MessageTransports2) {
      function is(value) {
        let candidate = value;
        return candidate && vscode_languageserver_protocol_1.MessageReader.is(value.reader) && vscode_languageserver_protocol_1.MessageWriter.is(value.writer);
      }
      MessageTransports2.is = is;
    })(MessageTransports || (exports2.MessageTransports = MessageTransports = {}));
    var BaseLanguageClient = class _BaseLanguageClient {
      constructor(id, name, clientOptions) {
        this._traceFormat = vscode_languageserver_protocol_1.TraceFormat.Text;
        this._diagnosticQueue = /* @__PURE__ */ new Map();
        this._diagnosticQueueState = { state: "idle" };
        this._features = [];
        this._dynamicFeatures = /* @__PURE__ */ new Map();
        this.workspaceEditLock = new async_1.Semaphore(1);
        this._id = id;
        this._name = name;
        clientOptions = clientOptions || {};
        const markdown = { isTrusted: false, supportHtml: false };
        if (clientOptions.markdown !== void 0) {
          markdown.isTrusted = ResolvedClientOptions.sanitizeIsTrusted(clientOptions.markdown.isTrusted);
          markdown.supportHtml = clientOptions.markdown.supportHtml === true;
        }
        this._clientOptions = {
          documentSelector: clientOptions.documentSelector ?? [],
          synchronize: clientOptions.synchronize ?? {},
          diagnosticCollectionName: clientOptions.diagnosticCollectionName,
          outputChannelName: clientOptions.outputChannelName ?? this._name,
          revealOutputChannelOn: clientOptions.revealOutputChannelOn ?? RevealOutputChannelOn.Error,
          stdioEncoding: clientOptions.stdioEncoding ?? "utf8",
          initializationOptions: clientOptions.initializationOptions,
          initializationFailedHandler: clientOptions.initializationFailedHandler,
          progressOnInitialization: !!clientOptions.progressOnInitialization,
          errorHandler: clientOptions.errorHandler ?? this.createDefaultErrorHandler(clientOptions.connectionOptions?.maxRestartCount),
          middleware: clientOptions.middleware ?? {},
          uriConverters: clientOptions.uriConverters,
          workspaceFolder: clientOptions.workspaceFolder,
          connectionOptions: clientOptions.connectionOptions,
          markdown,
          // suspend: {
          // 	mode: clientOptions.suspend?.mode ?? SuspendMode.off,
          // 	callback: clientOptions.suspend?.callback ?? (() => Promise.resolve(true)),
          // 	interval: clientOptions.suspend?.interval ? Math.max(clientOptions.suspend.interval, defaultInterval) : defaultInterval
          // },
          diagnosticPullOptions: clientOptions.diagnosticPullOptions ?? { onChange: true, onSave: false },
          notebookDocumentOptions: clientOptions.notebookDocumentOptions ?? {}
        };
        this._clientOptions.synchronize = this._clientOptions.synchronize || {};
        this._state = ClientState.Initial;
        this._ignoredRegistrations = /* @__PURE__ */ new Set();
        this._listeners = [];
        this._notificationHandlers = /* @__PURE__ */ new Map();
        this._pendingNotificationHandlers = /* @__PURE__ */ new Map();
        this._notificationDisposables = /* @__PURE__ */ new Map();
        this._requestHandlers = /* @__PURE__ */ new Map();
        this._pendingRequestHandlers = /* @__PURE__ */ new Map();
        this._requestDisposables = /* @__PURE__ */ new Map();
        this._progressHandlers = /* @__PURE__ */ new Map();
        this._pendingProgressHandlers = /* @__PURE__ */ new Map();
        this._progressDisposables = /* @__PURE__ */ new Map();
        this._connection = void 0;
        this._initializeResult = void 0;
        if (clientOptions.outputChannel) {
          this._outputChannel = clientOptions.outputChannel;
          this._disposeOutputChannel = false;
        } else {
          this._outputChannel = void 0;
          this._disposeOutputChannel = true;
        }
        this._traceOutputChannel = clientOptions.traceOutputChannel;
        this._diagnostics = void 0;
        this._pendingOpenNotifications = /* @__PURE__ */ new Set();
        this._pendingChangeSemaphore = new async_1.Semaphore(1);
        this._pendingChangeDelayer = new async_1.Delayer(250);
        this._fileEvents = [];
        this._fileEventDelayer = new async_1.Delayer(250);
        this._onStop = void 0;
        this._telemetryEmitter = new vscode_languageserver_protocol_1.Emitter();
        this._stateChangeEmitter = new vscode_languageserver_protocol_1.Emitter();
        this._trace = vscode_languageserver_protocol_1.Trace.Off;
        this._tracer = {
          log: (messageOrDataObject, data) => {
            if (Is.string(messageOrDataObject)) {
              this.logTrace(messageOrDataObject, data);
            } else {
              this.logObjectTrace(messageOrDataObject);
            }
          }
        };
        this._c2p = c2p.createConverter(clientOptions.uriConverters ? clientOptions.uriConverters.code2Protocol : void 0);
        this._p2c = p2c.createConverter(clientOptions.uriConverters ? clientOptions.uriConverters.protocol2Code : void 0, this._clientOptions.markdown.isTrusted, this._clientOptions.markdown.supportHtml);
        this._syncedDocuments = /* @__PURE__ */ new Map();
        this.registerBuiltinFeatures();
      }
      get name() {
        return this._name;
      }
      get middleware() {
        return this._clientOptions.middleware ?? /* @__PURE__ */ Object.create(null);
      }
      get clientOptions() {
        return this._clientOptions;
      }
      get protocol2CodeConverter() {
        return this._p2c;
      }
      get code2ProtocolConverter() {
        return this._c2p;
      }
      get onTelemetry() {
        return this._telemetryEmitter.event;
      }
      get onDidChangeState() {
        return this._stateChangeEmitter.event;
      }
      get outputChannel() {
        if (!this._outputChannel) {
          this._outputChannel = vscode_1.window.createOutputChannel(this._clientOptions.outputChannelName ? this._clientOptions.outputChannelName : this._name);
        }
        return this._outputChannel;
      }
      get traceOutputChannel() {
        if (this._traceOutputChannel) {
          return this._traceOutputChannel;
        }
        return this.outputChannel;
      }
      get diagnostics() {
        return this._diagnostics;
      }
      get state() {
        return this.getPublicState();
      }
      get $state() {
        return this._state;
      }
      set $state(value) {
        let oldState = this.getPublicState();
        this._state = value;
        let newState = this.getPublicState();
        if (newState !== oldState) {
          this._stateChangeEmitter.fire({ oldState, newState });
        }
      }
      getPublicState() {
        switch (this.$state) {
          case ClientState.Starting:
            return State.Starting;
          case ClientState.Running:
            return State.Running;
          default:
            return State.Stopped;
        }
      }
      get initializeResult() {
        return this._initializeResult;
      }
      async sendRequest(type, ...params) {
        if (this.$state === ClientState.StartFailed || this.$state === ClientState.Stopping || this.$state === ClientState.Stopped) {
          return Promise.reject(new vscode_languageserver_protocol_1.ResponseError(vscode_languageserver_protocol_1.ErrorCodes.ConnectionInactive, `Client is not running`));
        }
        const connection = await this.$start();
        if (this._didChangeTextDocumentFeature.syncKind === vscode_languageserver_protocol_1.TextDocumentSyncKind.Full) {
          await this.sendPendingFullTextDocumentChanges(connection);
        }
        const _sendRequest = this._clientOptions.middleware?.sendRequest;
        if (_sendRequest !== void 0) {
          let param = void 0;
          let token = void 0;
          if (params.length === 1) {
            if (vscode_languageserver_protocol_1.CancellationToken.is(params[0])) {
              token = params[0];
            } else {
              param = params[0];
            }
          } else if (params.length === 2) {
            param = params[0];
            token = params[1];
          }
          return _sendRequest(type, param, token, (type2, param2, token2) => {
            const params2 = [];
            if (param2 !== void 0) {
              params2.push(param2);
            }
            if (token2 !== void 0) {
              params2.push(token2);
            }
            return connection.sendRequest(type2, ...params2);
          });
        } else {
          return connection.sendRequest(type, ...params);
        }
      }
      onRequest(type, handler) {
        const method = typeof type === "string" ? type : type.method;
        this._requestHandlers.set(method, handler);
        const connection = this.activeConnection();
        let disposable;
        if (connection !== void 0) {
          this._requestDisposables.set(method, connection.onRequest(type, handler));
          disposable = {
            dispose: () => {
              const disposable2 = this._requestDisposables.get(method);
              if (disposable2 !== void 0) {
                disposable2.dispose();
                this._requestDisposables.delete(method);
              }
            }
          };
        } else {
          this._pendingRequestHandlers.set(method, handler);
          disposable = {
            dispose: () => {
              this._pendingRequestHandlers.delete(method);
              const disposable2 = this._requestDisposables.get(method);
              if (disposable2 !== void 0) {
                disposable2.dispose();
                this._requestDisposables.delete(method);
              }
            }
          };
        }
        return {
          dispose: () => {
            this._requestHandlers.delete(method);
            disposable.dispose();
          }
        };
      }
      async sendNotification(type, params) {
        if (this.$state === ClientState.StartFailed || this.$state === ClientState.Stopping || this.$state === ClientState.Stopped) {
          return Promise.reject(new vscode_languageserver_protocol_1.ResponseError(vscode_languageserver_protocol_1.ErrorCodes.ConnectionInactive, `Client is not running`));
        }
        const needsPendingFullTextDocumentSync = this._didChangeTextDocumentFeature.syncKind === vscode_languageserver_protocol_1.TextDocumentSyncKind.Full;
        let openNotification;
        if (needsPendingFullTextDocumentSync && typeof type !== "string" && type.method === vscode_languageserver_protocol_1.DidOpenTextDocumentNotification.method) {
          openNotification = params?.textDocument.uri;
          this._pendingOpenNotifications.add(openNotification);
        }
        const connection = await this.$start();
        if (needsPendingFullTextDocumentSync) {
          await this.sendPendingFullTextDocumentChanges(connection);
        }
        if (openNotification !== void 0) {
          this._pendingOpenNotifications.delete(openNotification);
        }
        const _sendNotification = this._clientOptions.middleware?.sendNotification;
        return _sendNotification ? _sendNotification(type, connection.sendNotification.bind(connection), params) : connection.sendNotification(type, params);
      }
      onNotification(type, handler) {
        const method = typeof type === "string" ? type : type.method;
        this._notificationHandlers.set(method, handler);
        const connection = this.activeConnection();
        let disposable;
        if (connection !== void 0) {
          this._notificationDisposables.set(method, connection.onNotification(type, handler));
          disposable = {
            dispose: () => {
              const disposable2 = this._notificationDisposables.get(method);
              if (disposable2 !== void 0) {
                disposable2.dispose();
                this._notificationDisposables.delete(method);
              }
            }
          };
        } else {
          this._pendingNotificationHandlers.set(method, handler);
          disposable = {
            dispose: () => {
              this._pendingNotificationHandlers.delete(method);
              const disposable2 = this._notificationDisposables.get(method);
              if (disposable2 !== void 0) {
                disposable2.dispose();
                this._notificationDisposables.delete(method);
              }
            }
          };
        }
        return {
          dispose: () => {
            this._notificationHandlers.delete(method);
            disposable.dispose();
          }
        };
      }
      async sendProgress(type, token, value) {
        if (this.$state === ClientState.StartFailed || this.$state === ClientState.Stopping || this.$state === ClientState.Stopped) {
          return Promise.reject(new vscode_languageserver_protocol_1.ResponseError(vscode_languageserver_protocol_1.ErrorCodes.ConnectionInactive, `Client is not running`));
        }
        try {
          const connection = await this.$start();
          return connection.sendProgress(type, token, value);
        } catch (error) {
          this.error(`Sending progress for token ${token} failed.`, error);
          throw error;
        }
      }
      onProgress(type, token, handler) {
        this._progressHandlers.set(token, { type, handler });
        const connection = this.activeConnection();
        let disposable;
        const handleWorkDoneProgress = this._clientOptions.middleware?.handleWorkDoneProgress;
        const realHandler = vscode_languageserver_protocol_1.WorkDoneProgress.is(type) && handleWorkDoneProgress !== void 0 ? (params) => {
          handleWorkDoneProgress(token, params, () => handler(params));
        } : handler;
        if (connection !== void 0) {
          this._progressDisposables.set(token, connection.onProgress(type, token, realHandler));
          disposable = {
            dispose: () => {
              const disposable2 = this._progressDisposables.get(token);
              if (disposable2 !== void 0) {
                disposable2.dispose();
                this._progressDisposables.delete(token);
              }
            }
          };
        } else {
          this._pendingProgressHandlers.set(token, { type, handler });
          disposable = {
            dispose: () => {
              this._pendingProgressHandlers.delete(token);
              const disposable2 = this._progressDisposables.get(token);
              if (disposable2 !== void 0) {
                disposable2.dispose();
                this._progressDisposables.delete(token);
              }
            }
          };
        }
        return {
          dispose: () => {
            this._progressHandlers.delete(token);
            disposable.dispose();
          }
        };
      }
      createDefaultErrorHandler(maxRestartCount) {
        if (maxRestartCount !== void 0 && maxRestartCount < 0) {
          throw new Error(`Invalid maxRestartCount: ${maxRestartCount}`);
        }
        return new DefaultErrorHandler(this, maxRestartCount ?? 4);
      }
      async setTrace(value) {
        this._trace = value;
        const connection = this.activeConnection();
        if (connection !== void 0) {
          await connection.trace(this._trace, this._tracer, {
            sendNotification: false,
            traceFormat: this._traceFormat
          });
        }
      }
      data2String(data) {
        if (data instanceof vscode_languageserver_protocol_1.ResponseError) {
          const responseError = data;
          return `  Message: ${responseError.message}
  Code: ${responseError.code} ${responseError.data ? "\n" + responseError.data.toString() : ""}`;
        }
        if (data instanceof Error) {
          if (Is.string(data.stack)) {
            return data.stack;
          }
          return data.message;
        }
        if (Is.string(data)) {
          return data;
        }
        return data.toString();
      }
      debug(message, data, showNotification = true) {
        this.logOutputMessage(vscode_languageserver_protocol_1.MessageType.Debug, RevealOutputChannelOn.Debug, "Debug", message, data, showNotification);
      }
      info(message, data, showNotification = true) {
        this.logOutputMessage(vscode_languageserver_protocol_1.MessageType.Info, RevealOutputChannelOn.Info, "Info", message, data, showNotification);
      }
      warn(message, data, showNotification = true) {
        this.logOutputMessage(vscode_languageserver_protocol_1.MessageType.Warning, RevealOutputChannelOn.Warn, "Warn", message, data, showNotification);
      }
      error(message, data, showNotification = true) {
        this.logOutputMessage(vscode_languageserver_protocol_1.MessageType.Error, RevealOutputChannelOn.Error, "Error", message, data, showNotification);
      }
      logOutputMessage(type, reveal, name, message, data, showNotification) {
        this.outputChannel.appendLine(`[${name.padEnd(5)} - ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] ${message}`);
        if (data !== null && data !== void 0) {
          this.outputChannel.appendLine(this.data2String(data));
        }
        if (showNotification === "force" || showNotification && this._clientOptions.revealOutputChannelOn <= reveal) {
          this.showNotificationMessage(type, message);
        }
      }
      showNotificationMessage(type, message) {
        message = message ?? "A request has failed. See the output for more information.";
        const messageFunc = type === vscode_languageserver_protocol_1.MessageType.Error ? vscode_1.window.showErrorMessage : type === vscode_languageserver_protocol_1.MessageType.Warning ? vscode_1.window.showWarningMessage : vscode_1.window.showInformationMessage;
        void messageFunc(message, "Go to output").then((selection) => {
          if (selection !== void 0) {
            this.outputChannel.show(true);
          }
        });
      }
      logTrace(message, data) {
        this.traceOutputChannel.appendLine(`[Trace - ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] ${message}`);
        if (data) {
          this.traceOutputChannel.appendLine(this.data2String(data));
        }
      }
      logObjectTrace(data) {
        if (data.isLSPMessage && data.type) {
          this.traceOutputChannel.append(`[LSP   - ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] `);
        } else {
          this.traceOutputChannel.append(`[Trace - ${(/* @__PURE__ */ new Date()).toLocaleTimeString()}] `);
        }
        if (data) {
          this.traceOutputChannel.appendLine(`${JSON.stringify(data)}`);
        }
      }
      needsStart() {
        return this.$state === ClientState.Initial || this.$state === ClientState.Stopping || this.$state === ClientState.Stopped;
      }
      needsStop() {
        return this.$state === ClientState.Starting || this.$state === ClientState.Running;
      }
      activeConnection() {
        return this.$state === ClientState.Running && this._connection !== void 0 ? this._connection : void 0;
      }
      isRunning() {
        return this.$state === ClientState.Running;
      }
      async start() {
        if (this._disposed === "disposing" || this._disposed === "disposed") {
          throw new Error(`Client got disposed and can't be restarted.`);
        }
        if (this.$state === ClientState.Stopping) {
          throw new Error(`Client is currently stopping. Can only restart a full stopped client`);
        }
        if (this._onStart !== void 0) {
          return this._onStart;
        }
        const [promise, resolve, reject] = this.createOnStartPromise();
        this._onStart = promise;
        if (this._diagnostics === void 0) {
          this._diagnostics = this._clientOptions.diagnosticCollectionName ? vscode_1.languages.createDiagnosticCollection(this._clientOptions.diagnosticCollectionName) : vscode_1.languages.createDiagnosticCollection();
        }
        for (const [method, handler] of this._notificationHandlers) {
          if (!this._pendingNotificationHandlers.has(method)) {
            this._pendingNotificationHandlers.set(method, handler);
          }
        }
        for (const [method, handler] of this._requestHandlers) {
          if (!this._pendingRequestHandlers.has(method)) {
            this._pendingRequestHandlers.set(method, handler);
          }
        }
        for (const [token, data] of this._progressHandlers) {
          if (!this._pendingProgressHandlers.has(token)) {
            this._pendingProgressHandlers.set(token, data);
          }
        }
        this.$state = ClientState.Starting;
        try {
          const connection = await this.createConnection();
          connection.onNotification(vscode_languageserver_protocol_1.LogMessageNotification.type, (message) => {
            switch (message.type) {
              case vscode_languageserver_protocol_1.MessageType.Error:
                this.error(message.message, void 0, false);
                break;
              case vscode_languageserver_protocol_1.MessageType.Warning:
                this.warn(message.message, void 0, false);
                break;
              case vscode_languageserver_protocol_1.MessageType.Info:
                this.info(message.message, void 0, false);
                break;
              case vscode_languageserver_protocol_1.MessageType.Debug:
                this.debug(message.message, void 0, false);
                break;
              default:
                this.outputChannel.appendLine(message.message);
            }
          });
          connection.onNotification(vscode_languageserver_protocol_1.ShowMessageNotification.type, (message) => {
            switch (message.type) {
              case vscode_languageserver_protocol_1.MessageType.Error:
                void vscode_1.window.showErrorMessage(message.message);
                break;
              case vscode_languageserver_protocol_1.MessageType.Warning:
                void vscode_1.window.showWarningMessage(message.message);
                break;
              case vscode_languageserver_protocol_1.MessageType.Info:
                void vscode_1.window.showInformationMessage(message.message);
                break;
              default:
                void vscode_1.window.showInformationMessage(message.message);
            }
          });
          connection.onRequest(vscode_languageserver_protocol_1.ShowMessageRequest.type, (params) => {
            let messageFunc;
            switch (params.type) {
              case vscode_languageserver_protocol_1.MessageType.Error:
                messageFunc = vscode_1.window.showErrorMessage;
                break;
              case vscode_languageserver_protocol_1.MessageType.Warning:
                messageFunc = vscode_1.window.showWarningMessage;
                break;
              case vscode_languageserver_protocol_1.MessageType.Info:
                messageFunc = vscode_1.window.showInformationMessage;
                break;
              default:
                messageFunc = vscode_1.window.showInformationMessage;
            }
            let actions = params.actions || [];
            return messageFunc(params.message, ...actions);
          });
          connection.onNotification(vscode_languageserver_protocol_1.TelemetryEventNotification.type, (data) => {
            this._telemetryEmitter.fire(data);
          });
          connection.onRequest(vscode_languageserver_protocol_1.ShowDocumentRequest.type, async (params) => {
            const showDocument = async (params2) => {
              const uri = this.protocol2CodeConverter.asUri(params2.uri);
              try {
                if (params2.external === true) {
                  const success = await vscode_1.env.openExternal(uri);
                  return { success };
                } else {
                  const options = {};
                  if (params2.selection !== void 0) {
                    options.selection = this.protocol2CodeConverter.asRange(params2.selection);
                  }
                  if (params2.takeFocus === void 0 || params2.takeFocus === false) {
                    options.preserveFocus = true;
                  } else if (params2.takeFocus === true) {
                    options.preserveFocus = false;
                  }
                  await vscode_1.window.showTextDocument(uri, options);
                  return { success: true };
                }
              } catch (error) {
                return { success: false };
              }
            };
            const middleware = this._clientOptions.middleware.window?.showDocument;
            if (middleware !== void 0) {
              return middleware(params, showDocument);
            } else {
              return showDocument(params);
            }
          });
          connection.listen();
          await this.initialize(connection);
          resolve();
        } catch (error) {
          this.$state = ClientState.StartFailed;
          this.error(`${this._name} client: couldn't create connection to server.`, error, "force");
          reject(error);
        }
        return this._onStart;
      }
      createOnStartPromise() {
        let resolve;
        let reject;
        const promise = new Promise((_resolve, _reject) => {
          resolve = _resolve;
          reject = _reject;
        });
        return [promise, resolve, reject];
      }
      async initialize(connection) {
        this.refreshTrace(connection, false);
        const initOption = this._clientOptions.initializationOptions;
        const [rootPath, workspaceFolders] = this._clientOptions.workspaceFolder !== void 0 ? [this._clientOptions.workspaceFolder.uri.fsPath, [{ uri: this._c2p.asUri(this._clientOptions.workspaceFolder.uri), name: this._clientOptions.workspaceFolder.name }]] : [this._clientGetRootPath(), null];
        const initParams = {
          processId: null,
          clientInfo: {
            name: vscode_1.env.appName,
            version: vscode_1.version
          },
          locale: this.getLocale(),
          rootPath: rootPath ? rootPath : null,
          rootUri: rootPath ? this._c2p.asUri(vscode_1.Uri.file(rootPath)) : null,
          capabilities: this.computeClientCapabilities(),
          initializationOptions: Is.func(initOption) ? initOption() : initOption,
          trace: vscode_languageserver_protocol_1.Trace.toString(this._trace),
          workspaceFolders
        };
        this.fillInitializeParams(initParams);
        if (this._clientOptions.progressOnInitialization) {
          const token = UUID.generateUuid();
          const part = new progressPart_1.ProgressPart(connection, token);
          initParams.workDoneToken = token;
          try {
            const result = await this.doInitialize(connection, initParams);
            part.done();
            return result;
          } catch (error) {
            part.cancel();
            throw error;
          }
        } else {
          return this.doInitialize(connection, initParams);
        }
      }
      async doInitialize(connection, initParams) {
        try {
          const result = await connection.initialize(initParams);
          if (result.capabilities.positionEncoding !== void 0 && result.capabilities.positionEncoding !== vscode_languageserver_protocol_1.PositionEncodingKind.UTF16) {
            throw new Error(`Unsupported position encoding (${result.capabilities.positionEncoding}) received from server ${this.name}`);
          }
          this._initializeResult = result;
          this.$state = ClientState.Running;
          let textDocumentSyncOptions = void 0;
          if (Is.number(result.capabilities.textDocumentSync)) {
            if (result.capabilities.textDocumentSync === vscode_languageserver_protocol_1.TextDocumentSyncKind.None) {
              textDocumentSyncOptions = {
                openClose: false,
                change: vscode_languageserver_protocol_1.TextDocumentSyncKind.None,
                save: void 0
              };
            } else {
              textDocumentSyncOptions = {
                openClose: true,
                change: result.capabilities.textDocumentSync,
                save: {
                  includeText: false
                }
              };
            }
          } else if (result.capabilities.textDocumentSync !== void 0 && result.capabilities.textDocumentSync !== null) {
            textDocumentSyncOptions = result.capabilities.textDocumentSync;
          }
          this._capabilities = Object.assign({}, result.capabilities, { resolvedTextDocumentSync: textDocumentSyncOptions });
          connection.onNotification(vscode_languageserver_protocol_1.PublishDiagnosticsNotification.type, (params) => this.handleDiagnostics(params));
          connection.onRequest(vscode_languageserver_protocol_1.RegistrationRequest.type, (params) => this.handleRegistrationRequest(params));
          connection.onRequest("client/registerFeature", (params) => this.handleRegistrationRequest(params));
          connection.onRequest(vscode_languageserver_protocol_1.UnregistrationRequest.type, (params) => this.handleUnregistrationRequest(params));
          connection.onRequest("client/unregisterFeature", (params) => this.handleUnregistrationRequest(params));
          connection.onRequest(vscode_languageserver_protocol_1.ApplyWorkspaceEditRequest.type, (params) => this.handleApplyWorkspaceEdit(params));
          for (const [method, handler] of this._pendingNotificationHandlers) {
            this._notificationDisposables.set(method, connection.onNotification(method, handler));
          }
          this._pendingNotificationHandlers.clear();
          for (const [method, handler] of this._pendingRequestHandlers) {
            this._requestDisposables.set(method, connection.onRequest(method, handler));
          }
          this._pendingRequestHandlers.clear();
          for (const [token, data] of this._pendingProgressHandlers) {
            this._progressDisposables.set(token, connection.onProgress(data.type, token, data.handler));
          }
          this._pendingProgressHandlers.clear();
          await connection.sendNotification(vscode_languageserver_protocol_1.InitializedNotification.type, {});
          this.hookFileEvents(connection);
          this.hookConfigurationChanged(connection);
          this.initializeFeatures(connection);
          return result;
        } catch (error) {
          if (this._clientOptions.initializationFailedHandler) {
            if (this._clientOptions.initializationFailedHandler(error)) {
              void this.initialize(connection);
            } else {
              void this.stop();
            }
          } else if (error instanceof vscode_languageserver_protocol_1.ResponseError && error.data && error.data.retry) {
            void vscode_1.window.showErrorMessage(error.message, { title: "Retry", id: "retry" }).then((item) => {
              if (item && item.id === "retry") {
                void this.initialize(connection);
              } else {
                void this.stop();
              }
            });
          } else {
            if (error && error.message) {
              void vscode_1.window.showErrorMessage(error.message);
            }
            this.error("Server initialization failed.", error);
            void this.stop();
          }
          throw error;
        }
      }
      _clientGetRootPath() {
        let folders = vscode_1.workspace.workspaceFolders;
        if (!folders || folders.length === 0) {
          return void 0;
        }
        let folder = folders[0];
        if (folder.uri.scheme === "file") {
          return folder.uri.fsPath;
        }
        return void 0;
      }
      stop(timeout = 2e3) {
        return this.shutdown("stop", timeout);
      }
      dispose(timeout = 2e3) {
        try {
          this._disposed = "disposing";
          return this.stop(timeout);
        } finally {
          this._disposed = "disposed";
        }
      }
      async shutdown(mode, timeout) {
        if (this.$state === ClientState.Stopped || this.$state === ClientState.Initial) {
          return;
        }
        if (this.$state === ClientState.Stopping) {
          if (this._onStop !== void 0) {
            return this._onStop;
          } else {
            throw new Error(`Client is stopping but no stop promise available.`);
          }
        }
        const connection = this.activeConnection();
        if (connection === void 0 || this.$state !== ClientState.Running) {
          throw new Error(`Client is not running and can't be stopped. It's current state is: ${this.$state}`);
        }
        this._initializeResult = void 0;
        this.$state = ClientState.Stopping;
        this.cleanUp(mode);
        const tp = new Promise((c) => {
          (0, vscode_languageserver_protocol_1.RAL)().timer.setTimeout(c, timeout);
        });
        const shutdown = (async (connection2) => {
          await connection2.shutdown();
          await connection2.exit();
          return connection2;
        })(connection);
        return this._onStop = Promise.race([tp, shutdown]).then((connection2) => {
          if (connection2 !== void 0) {
            connection2.end();
            connection2.dispose();
          } else {
            this.error(`Stopping server timed out`, void 0, false);
            throw new Error(`Stopping the server timed out`);
          }
        }, (error) => {
          this.error(`Stopping server failed`, error, false);
          throw error;
        }).finally(() => {
          this.$state = ClientState.Stopped;
          mode === "stop" && this.cleanUpChannel();
          this._onStart = void 0;
          this._onStop = void 0;
          this._connection = void 0;
          this._ignoredRegistrations.clear();
        });
      }
      cleanUp(mode) {
        this._fileEvents = [];
        this._fileEventDelayer.cancel();
        const disposables = this._listeners.splice(0, this._listeners.length);
        for (const disposable of disposables) {
          disposable.dispose();
        }
        if (this._syncedDocuments) {
          this._syncedDocuments.clear();
        }
        for (const feature of Array.from(this._features.entries()).map((entry) => entry[1]).reverse()) {
          feature.clear();
        }
        if (mode === "stop" && this._diagnostics !== void 0) {
          this._diagnostics.dispose();
          this._diagnostics = void 0;
        }
        if (this._idleInterval !== void 0) {
          this._idleInterval.dispose();
          this._idleInterval = void 0;
        }
      }
      cleanUpChannel() {
        if (this._outputChannel !== void 0 && this._disposeOutputChannel) {
          this._outputChannel.dispose();
          this._outputChannel = void 0;
        }
      }
      notifyFileEvent(event) {
        const client2 = this;
        async function didChangeWatchedFile(event2) {
          client2._fileEvents.push(event2);
          return client2._fileEventDelayer.trigger(async () => {
            await client2.sendNotification(vscode_languageserver_protocol_1.DidChangeWatchedFilesNotification.type, { changes: client2._fileEvents });
            client2._fileEvents = [];
          });
        }
        const workSpaceMiddleware = this.clientOptions.middleware?.workspace;
        (workSpaceMiddleware?.didChangeWatchedFile ? workSpaceMiddleware.didChangeWatchedFile(event, didChangeWatchedFile) : didChangeWatchedFile(event)).catch((error) => {
          client2.error(`Notify file events failed.`, error);
        });
      }
      async sendPendingFullTextDocumentChanges(connection) {
        return this._pendingChangeSemaphore.lock(async () => {
          try {
            const changes = this._didChangeTextDocumentFeature.getPendingDocumentChanges(this._pendingOpenNotifications);
            if (changes.length === 0) {
              return;
            }
            for (const document of changes) {
              const params = this.code2ProtocolConverter.asChangeTextDocumentParams(document);
              await connection.sendNotification(vscode_languageserver_protocol_1.DidChangeTextDocumentNotification.type, params);
              this._didChangeTextDocumentFeature.notificationSent(document, vscode_languageserver_protocol_1.DidChangeTextDocumentNotification.type, params);
            }
          } catch (error) {
            this.error(`Sending pending changes failed`, error, false);
            throw error;
          }
        });
      }
      triggerPendingChangeDelivery() {
        this._pendingChangeDelayer.trigger(async () => {
          const connection = this.activeConnection();
          if (connection === void 0) {
            this.triggerPendingChangeDelivery();
            return;
          }
          await this.sendPendingFullTextDocumentChanges(connection);
        }).catch((error) => this.error(`Delivering pending changes failed`, error, false));
      }
      handleDiagnostics(params) {
        if (!this._diagnostics) {
          return;
        }
        const key = params.uri;
        if (this._diagnosticQueueState.state === "busy" && this._diagnosticQueueState.document === key) {
          this._diagnosticQueueState.tokenSource.cancel();
        }
        this._diagnosticQueue.set(params.uri, params.diagnostics);
        this.triggerDiagnosticQueue();
      }
      triggerDiagnosticQueue() {
        (0, vscode_languageserver_protocol_1.RAL)().timer.setImmediate(() => {
          this.workDiagnosticQueue();
        });
      }
      workDiagnosticQueue() {
        if (this._diagnosticQueueState.state === "busy") {
          return;
        }
        const next = this._diagnosticQueue.entries().next();
        if (next.done === true) {
          return;
        }
        const [document, diagnostics] = next.value;
        this._diagnosticQueue.delete(document);
        const tokenSource = new vscode_1.CancellationTokenSource();
        this._diagnosticQueueState = { state: "busy", document, tokenSource };
        this._p2c.asDiagnostics(diagnostics, tokenSource.token).then((converted) => {
          if (!tokenSource.token.isCancellationRequested) {
            const uri = this._p2c.asUri(document);
            const middleware = this.clientOptions.middleware;
            if (middleware.handleDiagnostics) {
              middleware.handleDiagnostics(uri, converted, (uri2, diagnostics2) => this.setDiagnostics(uri2, diagnostics2));
            } else {
              this.setDiagnostics(uri, converted);
            }
          }
        }).finally(() => {
          this._diagnosticQueueState = { state: "idle" };
          this.triggerDiagnosticQueue();
        });
      }
      setDiagnostics(uri, diagnostics) {
        if (!this._diagnostics) {
          return;
        }
        this._diagnostics.set(uri, diagnostics);
      }
      getLocale() {
        return vscode_1.env.language;
      }
      async $start() {
        if (this.$state === ClientState.StartFailed) {
          throw new Error(`Previous start failed. Can't restart server.`);
        }
        await this.start();
        const connection = this.activeConnection();
        if (connection === void 0) {
          throw new Error(`Starting server failed`);
        }
        return connection;
      }
      async createConnection() {
        let errorHandler = (error, message, count) => {
          this.handleConnectionError(error, message, count).catch((error2) => this.error(`Handling connection error failed`, error2));
        };
        let closeHandler = () => {
          this.handleConnectionClosed().catch((error) => this.error(`Handling connection close failed`, error));
        };
        const transports = await this.createMessageTransports(this._clientOptions.stdioEncoding || "utf8");
        this._connection = createConnection(transports.reader, transports.writer, errorHandler, closeHandler, this._clientOptions.connectionOptions);
        return this._connection;
      }
      async handleConnectionClosed() {
        if (this.$state === ClientState.Stopped) {
          return;
        }
        try {
          if (this._connection !== void 0) {
            this._connection.dispose();
          }
        } catch (error) {
        }
        let handlerResult = { action: CloseAction.DoNotRestart };
        if (this.$state !== ClientState.Stopping) {
          try {
            handlerResult = await this._clientOptions.errorHandler.closed();
          } catch (error) {
          }
        }
        this._connection = void 0;
        if (handlerResult.action === CloseAction.DoNotRestart) {
          this.error(handlerResult.message ?? "Connection to server got closed. Server will not be restarted.", void 0, handlerResult.handled === true ? false : "force");
          this.cleanUp("stop");
          if (this.$state === ClientState.Starting) {
            this.$state = ClientState.StartFailed;
          } else {
            this.$state = ClientState.Stopped;
          }
          this._onStop = Promise.resolve();
          this._onStart = void 0;
        } else if (handlerResult.action === CloseAction.Restart) {
          this.info(handlerResult.message ?? "Connection to server got closed. Server will restart.", !handlerResult.handled);
          this.cleanUp("restart");
          this.$state = ClientState.Initial;
          this._onStop = Promise.resolve();
          this._onStart = void 0;
          this.start().catch((error) => this.error(`Restarting server failed`, error, "force"));
        }
      }
      async handleConnectionError(error, message, count) {
        const handlerResult = await this._clientOptions.errorHandler.error(error, message, count);
        if (handlerResult.action === ErrorAction.Shutdown) {
          this.error(handlerResult.message ?? `Client ${this._name}: connection to server is erroring.
${error.message}
Shutting down server.`, void 0, handlerResult.handled === true ? false : "force");
          this.stop().catch((error2) => {
            this.error(`Stopping server failed`, error2, false);
          });
        } else {
          this.error(handlerResult.message ?? `Client ${this._name}: connection to server is erroring.
${error.message}`, void 0, handlerResult.handled === true ? false : "force");
        }
      }
      hookConfigurationChanged(connection) {
        this._listeners.push(vscode_1.workspace.onDidChangeConfiguration(() => {
          this.refreshTrace(connection, true);
        }));
      }
      refreshTrace(connection, sendNotification = false) {
        const config = vscode_1.workspace.getConfiguration(this._id);
        let trace = vscode_languageserver_protocol_1.Trace.Off;
        let traceFormat = vscode_languageserver_protocol_1.TraceFormat.Text;
        if (config) {
          const traceConfig = config.get("trace.server", "off");
          if (typeof traceConfig === "string") {
            trace = vscode_languageserver_protocol_1.Trace.fromString(traceConfig);
          } else {
            trace = vscode_languageserver_protocol_1.Trace.fromString(config.get("trace.server.verbosity", "off"));
            traceFormat = vscode_languageserver_protocol_1.TraceFormat.fromString(config.get("trace.server.format", "text"));
          }
        }
        this._trace = trace;
        this._traceFormat = traceFormat;
        connection.trace(this._trace, this._tracer, {
          sendNotification,
          traceFormat: this._traceFormat
        }).catch((error) => {
          this.error(`Updating trace failed with error`, error, false);
        });
      }
      hookFileEvents(_connection) {
        let fileEvents = this._clientOptions.synchronize.fileEvents;
        if (!fileEvents) {
          return;
        }
        let watchers;
        if (Is.array(fileEvents)) {
          watchers = fileEvents;
        } else {
          watchers = [fileEvents];
        }
        if (!watchers) {
          return;
        }
        this._dynamicFeatures.get(vscode_languageserver_protocol_1.DidChangeWatchedFilesNotification.type.method).registerRaw(UUID.generateUuid(), watchers);
      }
      registerFeatures(features) {
        for (let feature of features) {
          this.registerFeature(feature);
        }
      }
      registerFeature(feature) {
        this._features.push(feature);
        if (features_1.DynamicFeature.is(feature)) {
          const registrationType = feature.registrationType;
          this._dynamicFeatures.set(registrationType.method, feature);
        }
      }
      getFeature(request) {
        return this._dynamicFeatures.get(request);
      }
      hasDedicatedTextSynchronizationFeature(textDocument) {
        const feature = this.getFeature(vscode_languageserver_protocol_1.NotebookDocumentSyncRegistrationType.method);
        if (feature === void 0 || !(feature instanceof notebook_1.NotebookDocumentSyncFeature)) {
          return false;
        }
        return feature.handles(textDocument);
      }
      registerBuiltinFeatures() {
        const pendingFullTextDocumentChanges = /* @__PURE__ */ new Map();
        this.registerFeature(new configuration_1.ConfigurationFeature(this));
        this.registerFeature(new textSynchronization_1.DidOpenTextDocumentFeature(this, this._syncedDocuments));
        this._didChangeTextDocumentFeature = new textSynchronization_1.DidChangeTextDocumentFeature(this, pendingFullTextDocumentChanges);
        this._didChangeTextDocumentFeature.onPendingChangeAdded(() => {
          this.triggerPendingChangeDelivery();
        });
        this.registerFeature(this._didChangeTextDocumentFeature);
        this.registerFeature(new textSynchronization_1.WillSaveFeature(this));
        this.registerFeature(new textSynchronization_1.WillSaveWaitUntilFeature(this));
        this.registerFeature(new textSynchronization_1.DidSaveTextDocumentFeature(this));
        this.registerFeature(new textSynchronization_1.DidCloseTextDocumentFeature(this, this._syncedDocuments, pendingFullTextDocumentChanges));
        this.registerFeature(new fileSystemWatcher_1.FileSystemWatcherFeature(this, (event) => this.notifyFileEvent(event)));
        this.registerFeature(new completion_1.CompletionItemFeature(this));
        this.registerFeature(new hover_1.HoverFeature(this));
        this.registerFeature(new signatureHelp_1.SignatureHelpFeature(this));
        this.registerFeature(new definition_1.DefinitionFeature(this));
        this.registerFeature(new reference_1.ReferencesFeature(this));
        this.registerFeature(new documentHighlight_1.DocumentHighlightFeature(this));
        this.registerFeature(new documentSymbol_1.DocumentSymbolFeature(this));
        this.registerFeature(new workspaceSymbol_1.WorkspaceSymbolFeature(this));
        this.registerFeature(new codeAction_1.CodeActionFeature(this));
        this.registerFeature(new codeLens_1.CodeLensFeature(this));
        this.registerFeature(new formatting_1.DocumentFormattingFeature(this));
        this.registerFeature(new formatting_1.DocumentRangeFormattingFeature(this));
        this.registerFeature(new formatting_1.DocumentOnTypeFormattingFeature(this));
        this.registerFeature(new rename_1.RenameFeature(this));
        this.registerFeature(new documentLink_1.DocumentLinkFeature(this));
        this.registerFeature(new executeCommand_1.ExecuteCommandFeature(this));
        this.registerFeature(new configuration_1.SyncConfigurationFeature(this));
        this.registerFeature(new typeDefinition_1.TypeDefinitionFeature(this));
        this.registerFeature(new implementation_1.ImplementationFeature(this));
        this.registerFeature(new colorProvider_1.ColorProviderFeature(this));
        if (this.clientOptions.workspaceFolder === void 0) {
          this.registerFeature(new workspaceFolder_1.WorkspaceFoldersFeature(this));
        }
        this.registerFeature(new foldingRange_1.FoldingRangeFeature(this));
        this.registerFeature(new declaration_1.DeclarationFeature(this));
        this.registerFeature(new selectionRange_1.SelectionRangeFeature(this));
        this.registerFeature(new progress_1.ProgressFeature(this));
        this.registerFeature(new callHierarchy_1.CallHierarchyFeature(this));
        this.registerFeature(new semanticTokens_1.SemanticTokensFeature(this));
        this.registerFeature(new linkedEditingRange_1.LinkedEditingFeature(this));
        this.registerFeature(new fileOperations_1.DidCreateFilesFeature(this));
        this.registerFeature(new fileOperations_1.DidRenameFilesFeature(this));
        this.registerFeature(new fileOperations_1.DidDeleteFilesFeature(this));
        this.registerFeature(new fileOperations_1.WillCreateFilesFeature(this));
        this.registerFeature(new fileOperations_1.WillRenameFilesFeature(this));
        this.registerFeature(new fileOperations_1.WillDeleteFilesFeature(this));
        this.registerFeature(new typeHierarchy_1.TypeHierarchyFeature(this));
        this.registerFeature(new inlineValue_1.InlineValueFeature(this));
        this.registerFeature(new inlayHint_1.InlayHintsFeature(this));
        this.registerFeature(new diagnostic_1.DiagnosticFeature(this));
        this.registerFeature(new notebook_1.NotebookDocumentSyncFeature(this));
      }
      registerProposedFeatures() {
        this.registerFeatures(ProposedFeatures.createAll(this));
      }
      fillInitializeParams(params) {
        for (let feature of this._features) {
          if (Is.func(feature.fillInitializeParams)) {
            feature.fillInitializeParams(params);
          }
        }
      }
      computeClientCapabilities() {
        const result = {};
        (0, features_1.ensure)(result, "workspace").applyEdit = true;
        const workspaceEdit = (0, features_1.ensure)((0, features_1.ensure)(result, "workspace"), "workspaceEdit");
        workspaceEdit.documentChanges = true;
        workspaceEdit.resourceOperations = [vscode_languageserver_protocol_1.ResourceOperationKind.Create, vscode_languageserver_protocol_1.ResourceOperationKind.Rename, vscode_languageserver_protocol_1.ResourceOperationKind.Delete];
        workspaceEdit.failureHandling = vscode_languageserver_protocol_1.FailureHandlingKind.TextOnlyTransactional;
        workspaceEdit.normalizesLineEndings = true;
        workspaceEdit.changeAnnotationSupport = {
          groupsOnLabel: true
        };
        const diagnostics = (0, features_1.ensure)((0, features_1.ensure)(result, "textDocument"), "publishDiagnostics");
        diagnostics.relatedInformation = true;
        diagnostics.versionSupport = false;
        diagnostics.tagSupport = { valueSet: [vscode_languageserver_protocol_1.DiagnosticTag.Unnecessary, vscode_languageserver_protocol_1.DiagnosticTag.Deprecated] };
        diagnostics.codeDescriptionSupport = true;
        diagnostics.dataSupport = true;
        const windowCapabilities = (0, features_1.ensure)(result, "window");
        const showMessage = (0, features_1.ensure)(windowCapabilities, "showMessage");
        showMessage.messageActionItem = { additionalPropertiesSupport: true };
        const showDocument = (0, features_1.ensure)(windowCapabilities, "showDocument");
        showDocument.support = true;
        const generalCapabilities = (0, features_1.ensure)(result, "general");
        generalCapabilities.staleRequestSupport = {
          cancel: true,
          retryOnContentModified: Array.from(_BaseLanguageClient.RequestsToCancelOnContentModified)
        };
        generalCapabilities.regularExpressions = { engine: "ECMAScript", version: "ES2020" };
        generalCapabilities.markdown = {
          parser: "marked",
          version: "1.1.0"
        };
        generalCapabilities.positionEncodings = ["utf-16"];
        if (this._clientOptions.markdown.supportHtml) {
          generalCapabilities.markdown.allowedTags = ["ul", "li", "p", "code", "blockquote", "ol", "h1", "h2", "h3", "h4", "h5", "h6", "hr", "em", "pre", "table", "thead", "tbody", "tr", "th", "td", "div", "del", "a", "strong", "br", "img", "span"];
        }
        for (let feature of this._features) {
          feature.fillClientCapabilities(result);
        }
        return result;
      }
      initializeFeatures(_connection) {
        const documentSelector = this._clientOptions.documentSelector;
        for (const feature of this._features) {
          if (Is.func(feature.preInitialize)) {
            feature.preInitialize(this._capabilities, documentSelector);
          }
        }
        for (const feature of this._features) {
          feature.initialize(this._capabilities, documentSelector);
        }
      }
      async handleRegistrationRequest(params) {
        const middleware = this.clientOptions.middleware?.handleRegisterCapability;
        if (middleware) {
          return middleware(params, (nextParams) => this.doRegisterCapability(nextParams));
        } else {
          return this.doRegisterCapability(params);
        }
      }
      async doRegisterCapability(params) {
        if (!this.isRunning()) {
          for (const registration of params.registrations) {
            this._ignoredRegistrations.add(registration.id);
          }
          return;
        }
        for (const registration of params.registrations) {
          const feature = this._dynamicFeatures.get(registration.method);
          if (feature === void 0) {
            return Promise.reject(new Error(`No feature implementation for ${registration.method} found. Registration failed.`));
          }
          const options = registration.registerOptions ?? {};
          options.documentSelector = options.documentSelector ?? this._clientOptions.documentSelector;
          const data = {
            id: registration.id,
            registerOptions: options
          };
          try {
            feature.register(data);
          } catch (err) {
            return Promise.reject(err);
          }
        }
      }
      async handleUnregistrationRequest(params) {
        const middleware = this.clientOptions.middleware?.handleUnregisterCapability;
        if (middleware) {
          return middleware(params, (nextParams) => this.doUnregisterCapability(nextParams));
        } else {
          return this.doUnregisterCapability(params);
        }
      }
      async doUnregisterCapability(params) {
        for (const unregistration of params.unregisterations) {
          if (this._ignoredRegistrations.has(unregistration.id)) {
            continue;
          }
          const feature = this._dynamicFeatures.get(unregistration.method);
          if (!feature) {
            return Promise.reject(new Error(`No feature implementation for ${unregistration.method} found. Unregistration failed.`));
          }
          feature.unregister(unregistration.id);
        }
      }
      async handleApplyWorkspaceEdit(params) {
        const workspaceEdit = params.edit;
        const converted = await this.workspaceEditLock.lock(() => {
          return this._p2c.asWorkspaceEdit(workspaceEdit);
        });
        const openTextDocuments = /* @__PURE__ */ new Map();
        vscode_1.workspace.textDocuments.forEach((document) => openTextDocuments.set(document.uri.toString(), document));
        let versionMismatch = false;
        if (workspaceEdit.documentChanges) {
          for (const change of workspaceEdit.documentChanges) {
            if (vscode_languageserver_protocol_1.TextDocumentEdit.is(change) && change.textDocument.version && change.textDocument.version >= 0) {
              const changeUri = this._p2c.asUri(change.textDocument.uri).toString();
              const textDocument = openTextDocuments.get(changeUri);
              if (textDocument && textDocument.version !== change.textDocument.version) {
                versionMismatch = true;
                break;
              }
            }
          }
        }
        if (versionMismatch) {
          return Promise.resolve({ applied: false });
        }
        return Is.asPromise(vscode_1.workspace.applyEdit(converted).then((value) => {
          return { applied: value };
        }));
      }
      handleFailedRequest(type, token, error, defaultValue, showNotification = true) {
        if (error instanceof vscode_languageserver_protocol_1.ResponseError) {
          if (error.code === vscode_languageserver_protocol_1.ErrorCodes.PendingResponseRejected || error.code === vscode_languageserver_protocol_1.ErrorCodes.ConnectionInactive) {
            return defaultValue;
          }
          if (error.code === vscode_languageserver_protocol_1.LSPErrorCodes.RequestCancelled || error.code === vscode_languageserver_protocol_1.LSPErrorCodes.ServerCancelled) {
            if (token !== void 0 && token.isCancellationRequested) {
              return defaultValue;
            } else {
              if (error.data !== void 0) {
                throw new features_1.LSPCancellationError(error.data);
              } else {
                throw new vscode_1.CancellationError();
              }
            }
          } else if (error.code === vscode_languageserver_protocol_1.LSPErrorCodes.ContentModified) {
            if (_BaseLanguageClient.RequestsToCancelOnContentModified.has(type.method) || _BaseLanguageClient.CancellableResolveCalls.has(type.method)) {
              throw new vscode_1.CancellationError();
            } else {
              return defaultValue;
            }
          }
        }
        this.error(`Request ${type.method} failed.`, error, showNotification);
        throw error;
      }
    };
    exports2.BaseLanguageClient = BaseLanguageClient;
    BaseLanguageClient.RequestsToCancelOnContentModified = /* @__PURE__ */ new Set([
      vscode_languageserver_protocol_1.SemanticTokensRequest.method,
      vscode_languageserver_protocol_1.SemanticTokensRangeRequest.method,
      vscode_languageserver_protocol_1.SemanticTokensDeltaRequest.method
    ]);
    BaseLanguageClient.CancellableResolveCalls = /* @__PURE__ */ new Set([
      vscode_languageserver_protocol_1.CompletionResolveRequest.method,
      vscode_languageserver_protocol_1.CodeLensResolveRequest.method,
      vscode_languageserver_protocol_1.CodeActionResolveRequest.method,
      vscode_languageserver_protocol_1.InlayHintResolveRequest.method,
      vscode_languageserver_protocol_1.DocumentLinkResolveRequest.method,
      vscode_languageserver_protocol_1.WorkspaceSymbolResolveRequest.method
    ]);
    var ConsoleLogger = class {
      error(message) {
        (0, vscode_languageserver_protocol_1.RAL)().console.error(message);
      }
      warn(message) {
        (0, vscode_languageserver_protocol_1.RAL)().console.warn(message);
      }
      info(message) {
        (0, vscode_languageserver_protocol_1.RAL)().console.info(message);
      }
      log(message) {
        (0, vscode_languageserver_protocol_1.RAL)().console.log(message);
      }
    };
    function createConnection(input, output, errorHandler, closeHandler, options) {
      const logger = new ConsoleLogger();
      const connection = (0, vscode_languageserver_protocol_1.createProtocolConnection)(input, output, logger, options);
      connection.onError((data) => {
        errorHandler(data[0], data[1], data[2]);
      });
      connection.onClose(closeHandler);
      const result = {
        listen: () => connection.listen(),
        sendRequest: connection.sendRequest,
        onRequest: connection.onRequest,
        hasPendingResponse: connection.hasPendingResponse,
        sendNotification: connection.sendNotification,
        onNotification: connection.onNotification,
        onProgress: connection.onProgress,
        sendProgress: connection.sendProgress,
        trace: (value, tracer, sendNotificationOrTraceOptions) => {
          const defaultTraceOptions = {
            sendNotification: false,
            traceFormat: vscode_languageserver_protocol_1.TraceFormat.Text
          };
          if (sendNotificationOrTraceOptions === void 0) {
            return connection.trace(value, tracer, defaultTraceOptions);
          } else if (Is.boolean(sendNotificationOrTraceOptions)) {
            return connection.trace(value, tracer, sendNotificationOrTraceOptions);
          } else {
            return connection.trace(value, tracer, sendNotificationOrTraceOptions);
          }
        },
        initialize: (params) => {
          return connection.sendRequest(vscode_languageserver_protocol_1.InitializeRequest.type, params);
        },
        shutdown: () => {
          return connection.sendRequest(vscode_languageserver_protocol_1.ShutdownRequest.type, void 0);
        },
        exit: () => {
          return connection.sendNotification(vscode_languageserver_protocol_1.ExitNotification.type);
        },
        end: () => connection.end(),
        dispose: () => connection.dispose()
      };
      return result;
    }
    var ProposedFeatures;
    (function(ProposedFeatures2) {
      function createAll(_client) {
        let result = [
          new inlineCompletion_1.InlineCompletionItemFeature(_client)
        ];
        return result;
      }
      ProposedFeatures2.createAll = createAll;
    })(ProposedFeatures || (exports2.ProposedFeatures = ProposedFeatures = {}));
  }
});

// node_modules/vscode-languageclient/lib/node/processes.js
var require_processes = __commonJS({
  "node_modules/vscode-languageclient/lib/node/processes.js"(exports2) {
    "use strict";
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.terminate = void 0;
    var cp = require("child_process");
    var path_1 = require("path");
    var isWindows = process.platform === "win32";
    var isMacintosh = process.platform === "darwin";
    var isLinux = process.platform === "linux";
    function terminate(process2, cwd) {
      if (isWindows) {
        try {
          let options = {
            stdio: ["pipe", "pipe", "ignore"]
          };
          if (cwd) {
            options.cwd = cwd;
          }
          cp.execFileSync("taskkill", ["/T", "/F", "/PID", process2.pid.toString()], options);
          return true;
        } catch (err) {
          return false;
        }
      } else if (isLinux || isMacintosh) {
        try {
          var cmd = (0, path_1.join)(__dirname, "terminateProcess.sh");
          var result = cp.spawnSync(cmd, [process2.pid.toString()]);
          return result.error ? false : true;
        } catch (err) {
          return false;
        }
      } else {
        process2.kill("SIGKILL");
        return true;
      }
    }
    exports2.terminate = terminate;
  }
});

// node_modules/vscode-languageserver-protocol/node.js
var require_node2 = __commonJS({
  "node_modules/vscode-languageserver-protocol/node.js"(exports2, module2) {
    "use strict";
    module2.exports = require_main3();
  }
});

// node_modules/semver/internal/debug.js
var require_debug = __commonJS({
  "node_modules/semver/internal/debug.js"(exports2, module2) {
    "use strict";
    var debug = typeof process === "object" && process.env && process.env.NODE_DEBUG && /\bsemver\b/i.test(process.env.NODE_DEBUG) ? (...args) => console.error("SEMVER", ...args) : () => {
    };
    module2.exports = debug;
  }
});

// node_modules/semver/internal/constants.js
var require_constants = __commonJS({
  "node_modules/semver/internal/constants.js"(exports2, module2) {
    "use strict";
    var SEMVER_SPEC_VERSION = "2.0.0";
    var MAX_LENGTH = 256;
    var MAX_SAFE_INTEGER = Number.MAX_SAFE_INTEGER || /* istanbul ignore next */
    9007199254740991;
    var MAX_SAFE_COMPONENT_LENGTH = 16;
    var MAX_SAFE_BUILD_LENGTH = MAX_LENGTH - 6;
    var RELEASE_TYPES = [
      "major",
      "premajor",
      "minor",
      "preminor",
      "patch",
      "prepatch",
      "prerelease"
    ];
    module2.exports = {
      MAX_LENGTH,
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_SAFE_INTEGER,
      RELEASE_TYPES,
      SEMVER_SPEC_VERSION,
      FLAG_INCLUDE_PRERELEASE: 1,
      FLAG_LOOSE: 2
    };
  }
});

// node_modules/semver/internal/re.js
var require_re = __commonJS({
  "node_modules/semver/internal/re.js"(exports2, module2) {
    "use strict";
    var {
      MAX_SAFE_COMPONENT_LENGTH,
      MAX_SAFE_BUILD_LENGTH,
      MAX_LENGTH
    } = require_constants();
    var debug = require_debug();
    exports2 = module2.exports = {};
    var re = exports2.re = [];
    var safeRe = exports2.safeRe = [];
    var src = exports2.src = [];
    var safeSrc = exports2.safeSrc = [];
    var t = exports2.t = {};
    var R = 0;
    var LETTERDASHNUMBER = "[a-zA-Z0-9-]";
    var safeRegexReplacements = [
      ["\\s", 1],
      ["\\d", MAX_LENGTH],
      [LETTERDASHNUMBER, MAX_SAFE_BUILD_LENGTH]
    ];
    var makeSafeRegex = (value) => {
      for (const [token, max] of safeRegexReplacements) {
        value = value.split(`${token}*`).join(`${token}{0,${max}}`).split(`${token}+`).join(`${token}{1,${max}}`);
      }
      return value;
    };
    var createToken = (name, value, isGlobal) => {
      const safe = makeSafeRegex(value);
      const index = R++;
      debug(name, index, value);
      t[name] = index;
      src[index] = value;
      safeSrc[index] = safe;
      re[index] = new RegExp(value, isGlobal ? "g" : void 0);
      safeRe[index] = new RegExp(safe, isGlobal ? "g" : void 0);
    };
    createToken("NUMERICIDENTIFIER", "0|[1-9]\\d*");
    createToken("NUMERICIDENTIFIERLOOSE", "\\d+");
    createToken("NONNUMERICIDENTIFIER", `\\d*[a-zA-Z-]${LETTERDASHNUMBER}*`);
    createToken("MAINVERSION", `(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})\\.(${src[t.NUMERICIDENTIFIER]})`);
    createToken("MAINVERSIONLOOSE", `(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})\\.(${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASEIDENTIFIER", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIER]})`);
    createToken("PRERELEASEIDENTIFIERLOOSE", `(?:${src[t.NONNUMERICIDENTIFIER]}|${src[t.NUMERICIDENTIFIERLOOSE]})`);
    createToken("PRERELEASE", `(?:-(${src[t.PRERELEASEIDENTIFIER]}(?:\\.${src[t.PRERELEASEIDENTIFIER]})*))`);
    createToken("PRERELEASELOOSE", `(?:-?(${src[t.PRERELEASEIDENTIFIERLOOSE]}(?:\\.${src[t.PRERELEASEIDENTIFIERLOOSE]})*))`);
    createToken("BUILDIDENTIFIER", `${LETTERDASHNUMBER}+`);
    createToken("BUILD", `(?:\\+(${src[t.BUILDIDENTIFIER]}(?:\\.${src[t.BUILDIDENTIFIER]})*))`);
    createToken("FULLPLAIN", `v?${src[t.MAINVERSION]}${src[t.PRERELEASE]}?${src[t.BUILD]}?`);
    createToken("FULL", `^${src[t.FULLPLAIN]}$`);
    createToken("LOOSEPLAIN", `[v=\\s]*${src[t.MAINVERSIONLOOSE]}${src[t.PRERELEASELOOSE]}?${src[t.BUILD]}?`);
    createToken("LOOSE", `^${src[t.LOOSEPLAIN]}$`);
    createToken("GTLT", "((?:<|>)?=?)");
    createToken("XRANGEIDENTIFIERLOOSE", `${src[t.NUMERICIDENTIFIERLOOSE]}|x|X|\\*`);
    createToken("XRANGEIDENTIFIER", `${src[t.NUMERICIDENTIFIER]}|x|X|\\*`);
    createToken("XRANGEPLAIN", `[v=\\s]*(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:\\.(${src[t.XRANGEIDENTIFIER]})(?:${src[t.PRERELEASE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGEPLAINLOOSE", `[v=\\s]*(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:\\.(${src[t.XRANGEIDENTIFIERLOOSE]})(?:${src[t.PRERELEASELOOSE]})?${src[t.BUILD]}?)?)?`);
    createToken("XRANGE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAIN]}$`);
    createToken("XRANGELOOSE", `^${src[t.GTLT]}\\s*${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COERCEPLAIN", `${"(^|[^\\d])(\\d{1,"}${MAX_SAFE_COMPONENT_LENGTH}})(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?(?:\\.(\\d{1,${MAX_SAFE_COMPONENT_LENGTH}}))?`);
    createToken("COERCE", `${src[t.COERCEPLAIN]}(?:$|[^\\d])`);
    createToken("COERCEFULL", src[t.COERCEPLAIN] + `(?:${src[t.PRERELEASE]})?(?:${src[t.BUILD]})?(?:$|[^\\d])`);
    createToken("COERCERTL", src[t.COERCE], true);
    createToken("COERCERTLFULL", src[t.COERCEFULL], true);
    createToken("LONETILDE", "(?:~>?)");
    createToken("TILDETRIM", `(\\s*)${src[t.LONETILDE]}\\s+`, true);
    exports2.tildeTrimReplace = "$1~";
    createToken("TILDE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAIN]}$`);
    createToken("TILDELOOSE", `^${src[t.LONETILDE]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("LONECARET", "(?:\\^)");
    createToken("CARETTRIM", `(\\s*)${src[t.LONECARET]}\\s+`, true);
    exports2.caretTrimReplace = "$1^";
    createToken("CARET", `^${src[t.LONECARET]}${src[t.XRANGEPLAIN]}$`);
    createToken("CARETLOOSE", `^${src[t.LONECARET]}${src[t.XRANGEPLAINLOOSE]}$`);
    createToken("COMPARATORLOOSE", `^${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]})$|^$`);
    createToken("COMPARATOR", `^${src[t.GTLT]}\\s*(${src[t.FULLPLAIN]})$|^$`);
    createToken("COMPARATORTRIM", `(\\s*)${src[t.GTLT]}\\s*(${src[t.LOOSEPLAIN]}|${src[t.XRANGEPLAIN]})`, true);
    exports2.comparatorTrimReplace = "$1$2$3";
    createToken("HYPHENRANGE", `^\\s*(${src[t.XRANGEPLAIN]})\\s+-\\s+(${src[t.XRANGEPLAIN]})\\s*$`);
    createToken("HYPHENRANGELOOSE", `^\\s*(${src[t.XRANGEPLAINLOOSE]})\\s+-\\s+(${src[t.XRANGEPLAINLOOSE]})\\s*$`);
    createToken("STAR", "(<|>)?=?\\s*\\*");
    createToken("GTE0", "^\\s*>=\\s*0\\.0\\.0\\s*$");
    createToken("GTE0PRE", "^\\s*>=\\s*0\\.0\\.0-0\\s*$");
  }
});

// node_modules/semver/internal/parse-options.js
var require_parse_options = __commonJS({
  "node_modules/semver/internal/parse-options.js"(exports2, module2) {
    "use strict";
    var looseOption = Object.freeze({ loose: true });
    var emptyOpts = Object.freeze({});
    var parseOptions = (options) => {
      if (!options) {
        return emptyOpts;
      }
      if (typeof options !== "object") {
        return looseOption;
      }
      return options;
    };
    module2.exports = parseOptions;
  }
});

// node_modules/semver/internal/identifiers.js
var require_identifiers = __commonJS({
  "node_modules/semver/internal/identifiers.js"(exports2, module2) {
    "use strict";
    var numeric = /^[0-9]+$/;
    var compareIdentifiers = (a, b) => {
      if (typeof a === "number" && typeof b === "number") {
        return a === b ? 0 : a < b ? -1 : 1;
      }
      const anum = numeric.test(a);
      const bnum = numeric.test(b);
      if (anum && bnum) {
        a = +a;
        b = +b;
      }
      return a === b ? 0 : anum && !bnum ? -1 : bnum && !anum ? 1 : a < b ? -1 : 1;
    };
    var rcompareIdentifiers = (a, b) => compareIdentifiers(b, a);
    module2.exports = {
      compareIdentifiers,
      rcompareIdentifiers
    };
  }
});

// node_modules/semver/classes/semver.js
var require_semver = __commonJS({
  "node_modules/semver/classes/semver.js"(exports2, module2) {
    "use strict";
    var debug = require_debug();
    var { MAX_LENGTH, MAX_SAFE_INTEGER } = require_constants();
    var { safeRe: re, t } = require_re();
    var parseOptions = require_parse_options();
    var { compareIdentifiers } = require_identifiers();
    var SemVer = class _SemVer {
      constructor(version, options) {
        options = parseOptions(options);
        if (version instanceof _SemVer) {
          if (version.loose === !!options.loose && version.includePrerelease === !!options.includePrerelease) {
            return version;
          } else {
            version = version.version;
          }
        } else if (typeof version !== "string") {
          throw new TypeError(`Invalid version. Must be a string. Got type "${typeof version}".`);
        }
        if (version.length > MAX_LENGTH) {
          throw new TypeError(
            `version is longer than ${MAX_LENGTH} characters`
          );
        }
        debug("SemVer", version, options);
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        const m = version.trim().match(options.loose ? re[t.LOOSE] : re[t.FULL]);
        if (!m) {
          throw new TypeError(`Invalid Version: ${version}`);
        }
        this.raw = version;
        this.major = +m[1];
        this.minor = +m[2];
        this.patch = +m[3];
        if (this.major > MAX_SAFE_INTEGER || this.major < 0) {
          throw new TypeError("Invalid major version");
        }
        if (this.minor > MAX_SAFE_INTEGER || this.minor < 0) {
          throw new TypeError("Invalid minor version");
        }
        if (this.patch > MAX_SAFE_INTEGER || this.patch < 0) {
          throw new TypeError("Invalid patch version");
        }
        if (!m[4]) {
          this.prerelease = [];
        } else {
          this.prerelease = m[4].split(".").map((id) => {
            if (/^[0-9]+$/.test(id)) {
              const num = +id;
              if (num >= 0 && num < MAX_SAFE_INTEGER) {
                return num;
              }
            }
            return id;
          });
        }
        this.build = m[5] ? m[5].split(".") : [];
        this.format();
      }
      format() {
        this.version = `${this.major}.${this.minor}.${this.patch}`;
        if (this.prerelease.length) {
          this.version += `-${this.prerelease.join(".")}`;
        }
        return this.version;
      }
      toString() {
        return this.version;
      }
      compare(other) {
        debug("SemVer.compare", this.version, this.options, other);
        if (!(other instanceof _SemVer)) {
          if (typeof other === "string" && other === this.version) {
            return 0;
          }
          other = new _SemVer(other, this.options);
        }
        if (other.version === this.version) {
          return 0;
        }
        return this.compareMain(other) || this.comparePre(other);
      }
      compareMain(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.major < other.major) {
          return -1;
        }
        if (this.major > other.major) {
          return 1;
        }
        if (this.minor < other.minor) {
          return -1;
        }
        if (this.minor > other.minor) {
          return 1;
        }
        if (this.patch < other.patch) {
          return -1;
        }
        if (this.patch > other.patch) {
          return 1;
        }
        return 0;
      }
      comparePre(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        if (this.prerelease.length && !other.prerelease.length) {
          return -1;
        } else if (!this.prerelease.length && other.prerelease.length) {
          return 1;
        } else if (!this.prerelease.length && !other.prerelease.length) {
          return 0;
        }
        let i = 0;
        do {
          const a = this.prerelease[i];
          const b = other.prerelease[i];
          debug("prerelease compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      compareBuild(other) {
        if (!(other instanceof _SemVer)) {
          other = new _SemVer(other, this.options);
        }
        let i = 0;
        do {
          const a = this.build[i];
          const b = other.build[i];
          debug("build compare", i, a, b);
          if (a === void 0 && b === void 0) {
            return 0;
          } else if (b === void 0) {
            return 1;
          } else if (a === void 0) {
            return -1;
          } else if (a === b) {
            continue;
          } else {
            return compareIdentifiers(a, b);
          }
        } while (++i);
      }
      // preminor will bump the version up to the next minor release, and immediately
      // down to pre-release. premajor and prepatch work the same way.
      inc(release, identifier, identifierBase) {
        if (release.startsWith("pre")) {
          if (!identifier && identifierBase === false) {
            throw new Error("invalid increment argument: identifier is empty");
          }
          if (identifier) {
            const match = `-${identifier}`.match(this.options.loose ? re[t.PRERELEASELOOSE] : re[t.PRERELEASE]);
            if (!match || match[1] !== identifier) {
              throw new Error(`invalid identifier: ${identifier}`);
            }
          }
        }
        switch (release) {
          case "premajor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor = 0;
            this.major++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "preminor":
            this.prerelease.length = 0;
            this.patch = 0;
            this.minor++;
            this.inc("pre", identifier, identifierBase);
            break;
          case "prepatch":
            this.prerelease.length = 0;
            this.inc("patch", identifier, identifierBase);
            this.inc("pre", identifier, identifierBase);
            break;
          // If the input is a non-prerelease version, this acts the same as
          // prepatch.
          case "prerelease":
            if (this.prerelease.length === 0) {
              this.inc("patch", identifier, identifierBase);
            }
            this.inc("pre", identifier, identifierBase);
            break;
          case "release":
            if (this.prerelease.length === 0) {
              throw new Error(`version ${this.raw} is not a prerelease`);
            }
            this.prerelease.length = 0;
            break;
          case "major":
            if (this.minor !== 0 || this.patch !== 0 || this.prerelease.length === 0) {
              this.major++;
            }
            this.minor = 0;
            this.patch = 0;
            this.prerelease = [];
            break;
          case "minor":
            if (this.patch !== 0 || this.prerelease.length === 0) {
              this.minor++;
            }
            this.patch = 0;
            this.prerelease = [];
            break;
          case "patch":
            if (this.prerelease.length === 0) {
              this.patch++;
            }
            this.prerelease = [];
            break;
          // This probably shouldn't be used publicly.
          // 1.0.0 'pre' would become 1.0.0-0 which is the wrong direction.
          case "pre": {
            const base = Number(identifierBase) ? 1 : 0;
            if (this.prerelease.length === 0) {
              this.prerelease = [base];
            } else {
              let i = this.prerelease.length;
              while (--i >= 0) {
                if (typeof this.prerelease[i] === "number") {
                  this.prerelease[i]++;
                  i = -2;
                }
              }
              if (i === -1) {
                if (identifier === this.prerelease.join(".") && identifierBase === false) {
                  throw new Error("invalid increment argument: identifier already exists");
                }
                this.prerelease.push(base);
              }
            }
            if (identifier) {
              let prerelease = [identifier, base];
              if (identifierBase === false) {
                prerelease = [identifier];
              }
              if (compareIdentifiers(this.prerelease[0], identifier) === 0) {
                if (isNaN(this.prerelease[1])) {
                  this.prerelease = prerelease;
                }
              } else {
                this.prerelease = prerelease;
              }
            }
            break;
          }
          default:
            throw new Error(`invalid increment argument: ${release}`);
        }
        this.raw = this.format();
        if (this.build.length) {
          this.raw += `+${this.build.join(".")}`;
        }
        return this;
      }
    };
    module2.exports = SemVer;
  }
});

// node_modules/semver/functions/parse.js
var require_parse = __commonJS({
  "node_modules/semver/functions/parse.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var parse = (version, options, throwErrors = false) => {
      if (version instanceof SemVer) {
        return version;
      }
      try {
        return new SemVer(version, options);
      } catch (er) {
        if (!throwErrors) {
          return null;
        }
        throw er;
      }
    };
    module2.exports = parse;
  }
});

// node_modules/semver/internal/lrucache.js
var require_lrucache = __commonJS({
  "node_modules/semver/internal/lrucache.js"(exports2, module2) {
    "use strict";
    var LRUCache = class {
      constructor() {
        this.max = 1e3;
        this.map = /* @__PURE__ */ new Map();
      }
      get(key) {
        const value = this.map.get(key);
        if (value === void 0) {
          return void 0;
        } else {
          this.map.delete(key);
          this.map.set(key, value);
          return value;
        }
      }
      delete(key) {
        return this.map.delete(key);
      }
      set(key, value) {
        const deleted = this.delete(key);
        if (!deleted && value !== void 0) {
          if (this.map.size >= this.max) {
            const firstKey = this.map.keys().next().value;
            this.delete(firstKey);
          }
          this.map.set(key, value);
        }
        return this;
      }
    };
    module2.exports = LRUCache;
  }
});

// node_modules/semver/functions/compare.js
var require_compare = __commonJS({
  "node_modules/semver/functions/compare.js"(exports2, module2) {
    "use strict";
    var SemVer = require_semver();
    var compare = (a, b, loose) => new SemVer(a, loose).compare(new SemVer(b, loose));
    module2.exports = compare;
  }
});

// node_modules/semver/functions/eq.js
var require_eq = __commonJS({
  "node_modules/semver/functions/eq.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var eq = (a, b, loose) => compare(a, b, loose) === 0;
    module2.exports = eq;
  }
});

// node_modules/semver/functions/neq.js
var require_neq = __commonJS({
  "node_modules/semver/functions/neq.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var neq = (a, b, loose) => compare(a, b, loose) !== 0;
    module2.exports = neq;
  }
});

// node_modules/semver/functions/gt.js
var require_gt = __commonJS({
  "node_modules/semver/functions/gt.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var gt = (a, b, loose) => compare(a, b, loose) > 0;
    module2.exports = gt;
  }
});

// node_modules/semver/functions/gte.js
var require_gte = __commonJS({
  "node_modules/semver/functions/gte.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var gte = (a, b, loose) => compare(a, b, loose) >= 0;
    module2.exports = gte;
  }
});

// node_modules/semver/functions/lt.js
var require_lt = __commonJS({
  "node_modules/semver/functions/lt.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var lt = (a, b, loose) => compare(a, b, loose) < 0;
    module2.exports = lt;
  }
});

// node_modules/semver/functions/lte.js
var require_lte = __commonJS({
  "node_modules/semver/functions/lte.js"(exports2, module2) {
    "use strict";
    var compare = require_compare();
    var lte = (a, b, loose) => compare(a, b, loose) <= 0;
    module2.exports = lte;
  }
});

// node_modules/semver/functions/cmp.js
var require_cmp = __commonJS({
  "node_modules/semver/functions/cmp.js"(exports2, module2) {
    "use strict";
    var eq = require_eq();
    var neq = require_neq();
    var gt = require_gt();
    var gte = require_gte();
    var lt = require_lt();
    var lte = require_lte();
    var cmp = (a, op, b, loose) => {
      switch (op) {
        case "===":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a === b;
        case "!==":
          if (typeof a === "object") {
            a = a.version;
          }
          if (typeof b === "object") {
            b = b.version;
          }
          return a !== b;
        case "":
        case "=":
        case "==":
          return eq(a, b, loose);
        case "!=":
          return neq(a, b, loose);
        case ">":
          return gt(a, b, loose);
        case ">=":
          return gte(a, b, loose);
        case "<":
          return lt(a, b, loose);
        case "<=":
          return lte(a, b, loose);
        default:
          throw new TypeError(`Invalid operator: ${op}`);
      }
    };
    module2.exports = cmp;
  }
});

// node_modules/semver/classes/comparator.js
var require_comparator = __commonJS({
  "node_modules/semver/classes/comparator.js"(exports2, module2) {
    "use strict";
    var ANY = /* @__PURE__ */ Symbol("SemVer ANY");
    var Comparator = class _Comparator {
      static get ANY() {
        return ANY;
      }
      constructor(comp, options) {
        options = parseOptions(options);
        if (comp instanceof _Comparator) {
          if (comp.loose === !!options.loose) {
            return comp;
          } else {
            comp = comp.value;
          }
        }
        comp = comp.trim().split(/\s+/).join(" ");
        debug("comparator", comp, options);
        this.options = options;
        this.loose = !!options.loose;
        this.parse(comp);
        if (this.semver === ANY) {
          this.value = "";
        } else {
          this.value = this.operator + this.semver.version;
        }
        debug("comp", this);
      }
      parse(comp) {
        const r = this.options.loose ? re[t.COMPARATORLOOSE] : re[t.COMPARATOR];
        const m = comp.match(r);
        if (!m) {
          throw new TypeError(`Invalid comparator: ${comp}`);
        }
        this.operator = m[1] !== void 0 ? m[1] : "";
        if (this.operator === "=") {
          this.operator = "";
        }
        if (!m[2]) {
          this.semver = ANY;
        } else {
          this.semver = new SemVer(m[2], this.options.loose);
        }
      }
      toString() {
        return this.value;
      }
      test(version) {
        debug("Comparator.test", version, this.options.loose);
        if (this.semver === ANY || version === ANY) {
          return true;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        return cmp(version, this.operator, this.semver, this.options);
      }
      intersects(comp, options) {
        if (!(comp instanceof _Comparator)) {
          throw new TypeError("a Comparator is required");
        }
        if (this.operator === "") {
          if (this.value === "") {
            return true;
          }
          return new Range5(comp.value, options).test(this.value);
        } else if (comp.operator === "") {
          if (comp.value === "") {
            return true;
          }
          return new Range5(this.value, options).test(comp.semver);
        }
        options = parseOptions(options);
        if (options.includePrerelease && (this.value === "<0.0.0-0" || comp.value === "<0.0.0-0")) {
          return false;
        }
        if (!options.includePrerelease && (this.value.startsWith("<0.0.0") || comp.value.startsWith("<0.0.0"))) {
          return false;
        }
        if (this.operator.startsWith(">") && comp.operator.startsWith(">")) {
          return true;
        }
        if (this.operator.startsWith("<") && comp.operator.startsWith("<")) {
          return true;
        }
        if (this.semver.version === comp.semver.version && this.operator.includes("=") && comp.operator.includes("=")) {
          return true;
        }
        if (cmp(this.semver, "<", comp.semver, options) && this.operator.startsWith(">") && comp.operator.startsWith("<")) {
          return true;
        }
        if (cmp(this.semver, ">", comp.semver, options) && this.operator.startsWith("<") && comp.operator.startsWith(">")) {
          return true;
        }
        return false;
      }
    };
    module2.exports = Comparator;
    var parseOptions = require_parse_options();
    var { safeRe: re, t } = require_re();
    var cmp = require_cmp();
    var debug = require_debug();
    var SemVer = require_semver();
    var Range5 = require_range();
  }
});

// node_modules/semver/classes/range.js
var require_range = __commonJS({
  "node_modules/semver/classes/range.js"(exports2, module2) {
    "use strict";
    var SPACE_CHARACTERS = /\s+/g;
    var Range5 = class _Range {
      constructor(range, options) {
        options = parseOptions(options);
        if (range instanceof _Range) {
          if (range.loose === !!options.loose && range.includePrerelease === !!options.includePrerelease) {
            return range;
          } else {
            return new _Range(range.raw, options);
          }
        }
        if (range instanceof Comparator) {
          this.raw = range.value;
          this.set = [[range]];
          this.formatted = void 0;
          return this;
        }
        this.options = options;
        this.loose = !!options.loose;
        this.includePrerelease = !!options.includePrerelease;
        this.raw = range.trim().replace(SPACE_CHARACTERS, " ");
        this.set = this.raw.split("||").map((r) => this.parseRange(r.trim())).filter((c) => c.length);
        if (!this.set.length) {
          throw new TypeError(`Invalid SemVer Range: ${this.raw}`);
        }
        if (this.set.length > 1) {
          const first = this.set[0];
          this.set = this.set.filter((c) => !isNullSet(c[0]));
          if (this.set.length === 0) {
            this.set = [first];
          } else if (this.set.length > 1) {
            for (const c of this.set) {
              if (c.length === 1 && isAny(c[0])) {
                this.set = [c];
                break;
              }
            }
          }
        }
        this.formatted = void 0;
      }
      get range() {
        if (this.formatted === void 0) {
          this.formatted = "";
          for (let i = 0; i < this.set.length; i++) {
            if (i > 0) {
              this.formatted += "||";
            }
            const comps = this.set[i];
            for (let k = 0; k < comps.length; k++) {
              if (k > 0) {
                this.formatted += " ";
              }
              this.formatted += comps[k].toString().trim();
            }
          }
        }
        return this.formatted;
      }
      format() {
        return this.range;
      }
      toString() {
        return this.range;
      }
      parseRange(range) {
        const memoOpts = (this.options.includePrerelease && FLAG_INCLUDE_PRERELEASE) | (this.options.loose && FLAG_LOOSE);
        const memoKey = memoOpts + ":" + range;
        const cached = cache.get(memoKey);
        if (cached) {
          return cached;
        }
        const loose = this.options.loose;
        const hr = loose ? re[t.HYPHENRANGELOOSE] : re[t.HYPHENRANGE];
        range = range.replace(hr, hyphenReplace(this.options.includePrerelease));
        debug("hyphen replace", range);
        range = range.replace(re[t.COMPARATORTRIM], comparatorTrimReplace);
        debug("comparator trim", range);
        range = range.replace(re[t.TILDETRIM], tildeTrimReplace);
        debug("tilde trim", range);
        range = range.replace(re[t.CARETTRIM], caretTrimReplace);
        debug("caret trim", range);
        let rangeList = range.split(" ").map((comp) => parseComparator(comp, this.options)).join(" ").split(/\s+/).map((comp) => replaceGTE0(comp, this.options));
        if (loose) {
          rangeList = rangeList.filter((comp) => {
            debug("loose invalid filter", comp, this.options);
            return !!comp.match(re[t.COMPARATORLOOSE]);
          });
        }
        debug("range list", rangeList);
        const rangeMap = /* @__PURE__ */ new Map();
        const comparators = rangeList.map((comp) => new Comparator(comp, this.options));
        for (const comp of comparators) {
          if (isNullSet(comp)) {
            return [comp];
          }
          rangeMap.set(comp.value, comp);
        }
        if (rangeMap.size > 1 && rangeMap.has("")) {
          rangeMap.delete("");
        }
        const result = [...rangeMap.values()];
        cache.set(memoKey, result);
        return result;
      }
      intersects(range, options) {
        if (!(range instanceof _Range)) {
          throw new TypeError("a Range is required");
        }
        return this.set.some((thisComparators) => {
          return isSatisfiable(thisComparators, options) && range.set.some((rangeComparators) => {
            return isSatisfiable(rangeComparators, options) && thisComparators.every((thisComparator) => {
              return rangeComparators.every((rangeComparator) => {
                return thisComparator.intersects(rangeComparator, options);
              });
            });
          });
        });
      }
      // if ANY of the sets match ALL of its comparators, then pass
      test(version) {
        if (!version) {
          return false;
        }
        if (typeof version === "string") {
          try {
            version = new SemVer(version, this.options);
          } catch (er) {
            return false;
          }
        }
        for (let i = 0; i < this.set.length; i++) {
          if (testSet(this.set[i], version, this.options)) {
            return true;
          }
        }
        return false;
      }
    };
    module2.exports = Range5;
    var LRU = require_lrucache();
    var cache = new LRU();
    var parseOptions = require_parse_options();
    var Comparator = require_comparator();
    var debug = require_debug();
    var SemVer = require_semver();
    var {
      safeRe: re,
      t,
      comparatorTrimReplace,
      tildeTrimReplace,
      caretTrimReplace
    } = require_re();
    var { FLAG_INCLUDE_PRERELEASE, FLAG_LOOSE } = require_constants();
    var isNullSet = (c) => c.value === "<0.0.0-0";
    var isAny = (c) => c.value === "";
    var isSatisfiable = (comparators, options) => {
      let result = true;
      const remainingComparators = comparators.slice();
      let testComparator = remainingComparators.pop();
      while (result && remainingComparators.length) {
        result = remainingComparators.every((otherComparator) => {
          return testComparator.intersects(otherComparator, options);
        });
        testComparator = remainingComparators.pop();
      }
      return result;
    };
    var parseComparator = (comp, options) => {
      comp = comp.replace(re[t.BUILD], "");
      debug("comp", comp, options);
      comp = replaceCarets(comp, options);
      debug("caret", comp);
      comp = replaceTildes(comp, options);
      debug("tildes", comp);
      comp = replaceXRanges(comp, options);
      debug("xrange", comp);
      comp = replaceStars(comp, options);
      debug("stars", comp);
      return comp;
    };
    var isX = (id) => !id || id.toLowerCase() === "x" || id === "*";
    var replaceTildes = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceTilde(c, options)).join(" ");
    };
    var replaceTilde = (comp, options) => {
      const r = options.loose ? re[t.TILDELOOSE] : re[t.TILDE];
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("tilde", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0 <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          ret = `>=${M}.${m}.0 <${M}.${+m + 1}.0-0`;
        } else if (pr) {
          debug("replaceTilde pr", pr);
          ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
        } else {
          ret = `>=${M}.${m}.${p} <${M}.${+m + 1}.0-0`;
        }
        debug("tilde return", ret);
        return ret;
      });
    };
    var replaceCarets = (comp, options) => {
      return comp.trim().split(/\s+/).map((c) => replaceCaret(c, options)).join(" ");
    };
    var replaceCaret = (comp, options) => {
      debug("caret", comp, options);
      const r = options.loose ? re[t.CARETLOOSE] : re[t.CARET];
      const z = options.includePrerelease ? "-0" : "";
      return comp.replace(r, (_, M, m, p, pr) => {
        debug("caret", comp, _, M, m, p, pr);
        let ret;
        if (isX(M)) {
          ret = "";
        } else if (isX(m)) {
          ret = `>=${M}.0.0${z} <${+M + 1}.0.0-0`;
        } else if (isX(p)) {
          if (M === "0") {
            ret = `>=${M}.${m}.0${z} <${M}.${+m + 1}.0-0`;
          } else {
            ret = `>=${M}.${m}.0${z} <${+M + 1}.0.0-0`;
          }
        } else if (pr) {
          debug("replaceCaret pr", pr);
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}-${pr} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p}-${pr} <${+M + 1}.0.0-0`;
          }
        } else {
          debug("no pr");
          if (M === "0") {
            if (m === "0") {
              ret = `>=${M}.${m}.${p}${z} <${M}.${m}.${+p + 1}-0`;
            } else {
              ret = `>=${M}.${m}.${p}${z} <${M}.${+m + 1}.0-0`;
            }
          } else {
            ret = `>=${M}.${m}.${p} <${+M + 1}.0.0-0`;
          }
        }
        debug("caret return", ret);
        return ret;
      });
    };
    var replaceXRanges = (comp, options) => {
      debug("replaceXRanges", comp, options);
      return comp.split(/\s+/).map((c) => replaceXRange(c, options)).join(" ");
    };
    var replaceXRange = (comp, options) => {
      comp = comp.trim();
      const r = options.loose ? re[t.XRANGELOOSE] : re[t.XRANGE];
      return comp.replace(r, (ret, gtlt, M, m, p, pr) => {
        debug("xRange", comp, ret, gtlt, M, m, p, pr);
        const xM = isX(M);
        const xm = xM || isX(m);
        const xp = xm || isX(p);
        const anyX = xp;
        if (gtlt === "=" && anyX) {
          gtlt = "";
        }
        pr = options.includePrerelease ? "-0" : "";
        if (xM) {
          if (gtlt === ">" || gtlt === "<") {
            ret = "<0.0.0-0";
          } else {
            ret = "*";
          }
        } else if (gtlt && anyX) {
          if (xm) {
            m = 0;
          }
          p = 0;
          if (gtlt === ">") {
            gtlt = ">=";
            if (xm) {
              M = +M + 1;
              m = 0;
              p = 0;
            } else {
              m = +m + 1;
              p = 0;
            }
          } else if (gtlt === "<=") {
            gtlt = "<";
            if (xm) {
              M = +M + 1;
            } else {
              m = +m + 1;
            }
          }
          if (gtlt === "<") {
            pr = "-0";
          }
          ret = `${gtlt + M}.${m}.${p}${pr}`;
        } else if (xm) {
          ret = `>=${M}.0.0${pr} <${+M + 1}.0.0-0`;
        } else if (xp) {
          ret = `>=${M}.${m}.0${pr} <${M}.${+m + 1}.0-0`;
        }
        debug("xRange return", ret);
        return ret;
      });
    };
    var replaceStars = (comp, options) => {
      debug("replaceStars", comp, options);
      return comp.trim().replace(re[t.STAR], "");
    };
    var replaceGTE0 = (comp, options) => {
      debug("replaceGTE0", comp, options);
      return comp.trim().replace(re[options.includePrerelease ? t.GTE0PRE : t.GTE0], "");
    };
    var hyphenReplace = (incPr) => ($0, from, fM, fm, fp, fpr, fb, to, tM, tm, tp, tpr) => {
      if (isX(fM)) {
        from = "";
      } else if (isX(fm)) {
        from = `>=${fM}.0.0${incPr ? "-0" : ""}`;
      } else if (isX(fp)) {
        from = `>=${fM}.${fm}.0${incPr ? "-0" : ""}`;
      } else if (fpr) {
        from = `>=${from}`;
      } else {
        from = `>=${from}${incPr ? "-0" : ""}`;
      }
      if (isX(tM)) {
        to = "";
      } else if (isX(tm)) {
        to = `<${+tM + 1}.0.0-0`;
      } else if (isX(tp)) {
        to = `<${tM}.${+tm + 1}.0-0`;
      } else if (tpr) {
        to = `<=${tM}.${tm}.${tp}-${tpr}`;
      } else if (incPr) {
        to = `<${tM}.${tm}.${+tp + 1}-0`;
      } else {
        to = `<=${to}`;
      }
      return `${from} ${to}`.trim();
    };
    var testSet = (set, version, options) => {
      for (let i = 0; i < set.length; i++) {
        if (!set[i].test(version)) {
          return false;
        }
      }
      if (version.prerelease.length && !options.includePrerelease) {
        for (let i = 0; i < set.length; i++) {
          debug(set[i].semver);
          if (set[i].semver === Comparator.ANY) {
            continue;
          }
          if (set[i].semver.prerelease.length > 0) {
            const allowed = set[i].semver;
            if (allowed.major === version.major && allowed.minor === version.minor && allowed.patch === version.patch) {
              return true;
            }
          }
        }
        return false;
      }
      return true;
    };
  }
});

// node_modules/semver/functions/satisfies.js
var require_satisfies = __commonJS({
  "node_modules/semver/functions/satisfies.js"(exports2, module2) {
    "use strict";
    var Range5 = require_range();
    var satisfies = (version, range, options) => {
      try {
        range = new Range5(range, options);
      } catch (er) {
        return false;
      }
      return range.test(version);
    };
    module2.exports = satisfies;
  }
});

// node_modules/vscode-languageclient/lib/common/api.js
var require_api3 = __commonJS({
  "node_modules/vscode-languageclient/lib/common/api.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.DiagnosticPullMode = exports2.vsdiag = void 0;
    __exportStar(require_main3(), exports2);
    __exportStar(require_features(), exports2);
    var diagnostic_1 = require_diagnostic();
    Object.defineProperty(exports2, "vsdiag", { enumerable: true, get: function() {
      return diagnostic_1.vsdiag;
    } });
    Object.defineProperty(exports2, "DiagnosticPullMode", { enumerable: true, get: function() {
      return diagnostic_1.DiagnosticPullMode;
    } });
    __exportStar(require_client(), exports2);
  }
});

// node_modules/vscode-languageclient/lib/node/main.js
var require_main4 = __commonJS({
  "node_modules/vscode-languageclient/lib/node/main.js"(exports2) {
    "use strict";
    var __createBinding = exports2 && exports2.__createBinding || (Object.create ? (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      var desc = Object.getOwnPropertyDescriptor(m, k);
      if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m[k];
        } };
      }
      Object.defineProperty(o, k2, desc);
    }) : (function(o, m, k, k2) {
      if (k2 === void 0) k2 = k;
      o[k2] = m[k];
    }));
    var __exportStar = exports2 && exports2.__exportStar || function(m, exports3) {
      for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports3, p)) __createBinding(exports3, m, p);
    };
    Object.defineProperty(exports2, "__esModule", { value: true });
    exports2.SettingMonitor = exports2.LanguageClient = exports2.TransportKind = void 0;
    var cp = require("child_process");
    var fs = require("fs");
    var path2 = require("path");
    var vscode_1 = require("vscode");
    var Is = require_is();
    var client_1 = require_client();
    var processes_1 = require_processes();
    var node_1 = require_node2();
    var semverParse = require_parse();
    var semverSatisfies = require_satisfies();
    __exportStar(require_node2(), exports2);
    __exportStar(require_api3(), exports2);
    var REQUIRED_VSCODE_VERSION = "^1.82.0";
    var TransportKind;
    (function(TransportKind2) {
      TransportKind2[TransportKind2["stdio"] = 0] = "stdio";
      TransportKind2[TransportKind2["ipc"] = 1] = "ipc";
      TransportKind2[TransportKind2["pipe"] = 2] = "pipe";
      TransportKind2[TransportKind2["socket"] = 3] = "socket";
    })(TransportKind || (exports2.TransportKind = TransportKind = {}));
    var Transport;
    (function(Transport2) {
      function isSocket(value) {
        const candidate = value;
        return candidate && candidate.kind === TransportKind.socket && Is.number(candidate.port);
      }
      Transport2.isSocket = isSocket;
    })(Transport || (Transport = {}));
    var Executable2;
    (function(Executable3) {
      function is(value) {
        return Is.string(value.command);
      }
      Executable3.is = is;
    })(Executable2 || (Executable2 = {}));
    var NodeModule;
    (function(NodeModule2) {
      function is(value) {
        return Is.string(value.module);
      }
      NodeModule2.is = is;
    })(NodeModule || (NodeModule = {}));
    var StreamInfo;
    (function(StreamInfo2) {
      function is(value) {
        let candidate = value;
        return candidate && candidate.writer !== void 0 && candidate.reader !== void 0;
      }
      StreamInfo2.is = is;
    })(StreamInfo || (StreamInfo = {}));
    var ChildProcessInfo;
    (function(ChildProcessInfo2) {
      function is(value) {
        let candidate = value;
        return candidate && candidate.process !== void 0 && typeof candidate.detached === "boolean";
      }
      ChildProcessInfo2.is = is;
    })(ChildProcessInfo || (ChildProcessInfo = {}));
    var LanguageClient2 = class extends client_1.BaseLanguageClient {
      constructor(arg1, arg2, arg3, arg4, arg5) {
        let id;
        let name;
        let serverOptions;
        let clientOptions;
        let forceDebug;
        if (Is.string(arg2)) {
          id = arg1;
          name = arg2;
          serverOptions = arg3;
          clientOptions = arg4;
          forceDebug = !!arg5;
        } else {
          id = arg1.toLowerCase();
          name = arg1;
          serverOptions = arg2;
          clientOptions = arg3;
          forceDebug = arg4;
        }
        if (forceDebug === void 0) {
          forceDebug = false;
        }
        super(id, name, clientOptions);
        this._serverOptions = serverOptions;
        this._forceDebug = forceDebug;
        this._isInDebugMode = forceDebug;
        try {
          this.checkVersion();
        } catch (error) {
          if (Is.string(error.message)) {
            this.outputChannel.appendLine(error.message);
          }
          throw error;
        }
      }
      checkVersion() {
        const codeVersion = semverParse(vscode_1.version);
        if (!codeVersion) {
          throw new Error(`No valid VS Code version detected. Version string is: ${vscode_1.version}`);
        }
        if (codeVersion.prerelease && codeVersion.prerelease.length > 0) {
          codeVersion.prerelease = [];
        }
        if (!semverSatisfies(codeVersion, REQUIRED_VSCODE_VERSION)) {
          throw new Error(`The language client requires VS Code version ${REQUIRED_VSCODE_VERSION} but received version ${vscode_1.version}`);
        }
      }
      get isInDebugMode() {
        return this._isInDebugMode;
      }
      async restart() {
        await this.stop();
        if (this.isInDebugMode) {
          await new Promise((resolve) => setTimeout(resolve, 1e3));
          await this.start();
        } else {
          await this.start();
        }
      }
      stop(timeout = 2e3) {
        return super.stop(timeout).finally(() => {
          if (this._serverProcess) {
            const toCheck = this._serverProcess;
            this._serverProcess = void 0;
            if (this._isDetached === void 0 || !this._isDetached) {
              this.checkProcessDied(toCheck);
            }
            this._isDetached = void 0;
          }
        });
      }
      checkProcessDied(childProcess) {
        if (!childProcess || childProcess.pid === void 0) {
          return;
        }
        setTimeout(() => {
          try {
            if (childProcess.pid !== void 0) {
              process.kill(childProcess.pid, 0);
              (0, processes_1.terminate)(childProcess);
            }
          } catch (error) {
          }
        }, 2e3);
      }
      handleConnectionClosed() {
        this._serverProcess = void 0;
        return super.handleConnectionClosed();
      }
      fillInitializeParams(params) {
        super.fillInitializeParams(params);
        if (params.processId === null) {
          params.processId = process.pid;
        }
      }
      createMessageTransports(encoding) {
        function getEnvironment(env6, fork) {
          if (!env6 && !fork) {
            return void 0;
          }
          const result = /* @__PURE__ */ Object.create(null);
          Object.keys(process.env).forEach((key) => result[key] = process.env[key]);
          if (fork) {
            result["ELECTRON_RUN_AS_NODE"] = "1";
            result["ELECTRON_NO_ASAR"] = "1";
          }
          if (env6) {
            Object.keys(env6).forEach((key) => result[key] = env6[key]);
          }
          return result;
        }
        const debugStartWith = ["--debug=", "--debug-brk=", "--inspect=", "--inspect-brk="];
        const debugEquals = ["--debug", "--debug-brk", "--inspect", "--inspect-brk"];
        function startedInDebugMode() {
          let args = process.execArgv;
          if (args) {
            return args.some((arg) => {
              return debugStartWith.some((value) => arg.startsWith(value)) || debugEquals.some((value) => arg === value);
            });
          }
          return false;
        }
        function assertStdio(process2) {
          if (process2.stdin === null || process2.stdout === null || process2.stderr === null) {
            throw new Error("Process created without stdio streams");
          }
        }
        const server = this._serverOptions;
        if (Is.func(server)) {
          return server().then((result) => {
            if (client_1.MessageTransports.is(result)) {
              this._isDetached = !!result.detached;
              return result;
            } else if (StreamInfo.is(result)) {
              this._isDetached = !!result.detached;
              return { reader: new node_1.StreamMessageReader(result.reader), writer: new node_1.StreamMessageWriter(result.writer) };
            } else {
              let cp2;
              if (ChildProcessInfo.is(result)) {
                cp2 = result.process;
                this._isDetached = result.detached;
              } else {
                cp2 = result;
                this._isDetached = false;
              }
              cp2.stderr.on("data", (data) => this.outputChannel.append(Is.string(data) ? data : data.toString(encoding)));
              return { reader: new node_1.StreamMessageReader(cp2.stdout), writer: new node_1.StreamMessageWriter(cp2.stdin) };
            }
          });
        }
        let json;
        let runDebug = server;
        if (runDebug.run || runDebug.debug) {
          if (this._forceDebug || startedInDebugMode()) {
            json = runDebug.debug;
            this._isInDebugMode = true;
          } else {
            json = runDebug.run;
            this._isInDebugMode = false;
          }
        } else {
          json = server;
        }
        return this._getServerWorkingDir(json.options).then((serverWorkingDir) => {
          if (NodeModule.is(json) && json.module) {
            let node = json;
            let transport = node.transport || TransportKind.stdio;
            if (node.runtime) {
              const args = [];
              const options = node.options ?? /* @__PURE__ */ Object.create(null);
              if (options.execArgv) {
                options.execArgv.forEach((element) => args.push(element));
              }
              args.push(node.module);
              if (node.args) {
                node.args.forEach((element) => args.push(element));
              }
              const execOptions = /* @__PURE__ */ Object.create(null);
              execOptions.cwd = serverWorkingDir;
              execOptions.env = getEnvironment(options.env, false);
              const runtime = this._getRuntimePath(node.runtime, serverWorkingDir);
              let pipeName = void 0;
              if (transport === TransportKind.ipc) {
                execOptions.stdio = [null, null, null, "ipc"];
                args.push("--node-ipc");
              } else if (transport === TransportKind.stdio) {
                args.push("--stdio");
              } else if (transport === TransportKind.pipe) {
                pipeName = (0, node_1.generateRandomPipeName)();
                args.push(`--pipe=${pipeName}`);
              } else if (Transport.isSocket(transport)) {
                args.push(`--socket=${transport.port}`);
              }
              args.push(`--clientProcessId=${process.pid.toString()}`);
              if (transport === TransportKind.ipc || transport === TransportKind.stdio) {
                const serverProcess = cp.spawn(runtime, args, execOptions);
                if (!serverProcess || !serverProcess.pid) {
                  return handleChildProcessStartError(serverProcess, `Launching server using runtime ${runtime} failed.`);
                }
                this._serverProcess = serverProcess;
                serverProcess.stderr.on("data", (data) => this.outputChannel.append(Is.string(data) ? data : data.toString(encoding)));
                if (transport === TransportKind.ipc) {
                  serverProcess.stdout.on("data", (data) => this.outputChannel.append(Is.string(data) ? data : data.toString(encoding)));
                  return Promise.resolve({ reader: new node_1.IPCMessageReader(serverProcess), writer: new node_1.IPCMessageWriter(serverProcess) });
                } else {
                  return Promise.resolve({ reader: new node_1.StreamMessageReader(serverProcess.stdout), writer: new node_1.StreamMessageWriter(serverProcess.stdin) });
                }
              } else if (transport === TransportKind.pipe) {
                return (0, node_1.createClientPipeTransport)(pipeName).then((transport2) => {
                  const process2 = cp.spawn(runtime, args, execOptions);
                  if (!process2 || !process2.pid) {
                    return handleChildProcessStartError(process2, `Launching server using runtime ${runtime} failed.`);
                  }
                  this._serverProcess = process2;
                  process2.stderr.on("data", (data) => this.outputChannel.append(Is.string(data) ? data : data.toString(encoding)));
                  process2.stdout.on("data", (data) => this.outputChannel.append(Is.string(data) ? data : data.toString(encoding)));
                  return transport2.onConnected().then((protocol) => {
                    return { reader: protocol[0], writer: protocol[1] };
                  });
                });
              } else if (Transport.isSocket(transport)) {
                return (0, node_1.createClientSocketTransport)(transport.port).then((transport2) => {
                  const process2 = cp.spawn(runtime, args, execOptions);
                  if (!process2 || !process2.pid) {
                    return handleChildProcessStartError(process2, `Launching server using runtime ${runtime} failed.`);
                  }
                  this._serverProcess = process2;
                  process2.stderr.on("data", (data) => this.outputChannel.append(Is.string(data) ? data : data.toString(encoding)));
                  process2.stdout.on("data", (data) => this.outputChannel.append(Is.string(data) ? data : data.toString(encoding)));
                  return transport2.onConnected().then((protocol) => {
                    return { reader: protocol[0], writer: protocol[1] };
                  });
                });
              }
            } else {
              let pipeName = void 0;
              return new Promise((resolve, reject) => {
                const args = (node.args && node.args.slice()) ?? [];
                if (transport === TransportKind.ipc) {
                  args.push("--node-ipc");
                } else if (transport === TransportKind.stdio) {
                  args.push("--stdio");
                } else if (transport === TransportKind.pipe) {
                  pipeName = (0, node_1.generateRandomPipeName)();
                  args.push(`--pipe=${pipeName}`);
                } else if (Transport.isSocket(transport)) {
                  args.push(`--socket=${transport.port}`);
                }
                args.push(`--clientProcessId=${process.pid.toString()}`);
                const options = node.options ?? /* @__PURE__ */ Object.create(null);
                options.env = getEnvironment(options.env, true);
                options.execArgv = options.execArgv || [];
                options.cwd = serverWorkingDir;
                options.silent = true;
                if (transport === TransportKind.ipc || transport === TransportKind.stdio) {
                  const sp = cp.fork(node.module, args || [], options);
                  assertStdio(sp);
                  this._serverProcess = sp;
                  sp.stderr.on("data", (data) => this.outputChannel.append(Is.string(data) ? data : data.toString(encoding)));
                  if (transport === TransportKind.ipc) {
                    sp.stdout.on("data", (data) => this.outputChannel.append(Is.string(data) ? data : data.toString(encoding)));
                    resolve({ reader: new node_1.IPCMessageReader(this._serverProcess), writer: new node_1.IPCMessageWriter(this._serverProcess) });
                  } else {
                    resolve({ reader: new node_1.StreamMessageReader(sp.stdout), writer: new node_1.StreamMessageWriter(sp.stdin) });
                  }
                } else if (transport === TransportKind.pipe) {
                  (0, node_1.createClientPipeTransport)(pipeName).then((transport2) => {
                    const sp = cp.fork(node.module, args || [], options);
                    assertStdio(sp);
                    this._serverProcess = sp;
                    sp.stderr.on("data", (data) => this.outputChannel.append(Is.string(data) ? data : data.toString(encoding)));
                    sp.stdout.on("data", (data) => this.outputChannel.append(Is.string(data) ? data : data.toString(encoding)));
                    transport2.onConnected().then((protocol) => {
                      resolve({ reader: protocol[0], writer: protocol[1] });
                    }, reject);
                  }, reject);
                } else if (Transport.isSocket(transport)) {
                  (0, node_1.createClientSocketTransport)(transport.port).then((transport2) => {
                    const sp = cp.fork(node.module, args || [], options);
                    assertStdio(sp);
                    this._serverProcess = sp;
                    sp.stderr.on("data", (data) => this.outputChannel.append(Is.string(data) ? data : data.toString(encoding)));
                    sp.stdout.on("data", (data) => this.outputChannel.append(Is.string(data) ? data : data.toString(encoding)));
                    transport2.onConnected().then((protocol) => {
                      resolve({ reader: protocol[0], writer: protocol[1] });
                    }, reject);
                  }, reject);
                }
              });
            }
          } else if (Executable2.is(json) && json.command) {
            const command = json;
            const args = json.args !== void 0 ? json.args.slice(0) : [];
            let pipeName = void 0;
            const transport = json.transport;
            if (transport === TransportKind.stdio) {
              args.push("--stdio");
            } else if (transport === TransportKind.pipe) {
              pipeName = (0, node_1.generateRandomPipeName)();
              args.push(`--pipe=${pipeName}`);
            } else if (Transport.isSocket(transport)) {
              args.push(`--socket=${transport.port}`);
            } else if (transport === TransportKind.ipc) {
              throw new Error(`Transport kind ipc is not support for command executable`);
            }
            const options = Object.assign({}, command.options);
            options.cwd = options.cwd || serverWorkingDir;
            if (transport === void 0 || transport === TransportKind.stdio) {
              const serverProcess = cp.spawn(command.command, args, options);
              if (!serverProcess || !serverProcess.pid) {
                return handleChildProcessStartError(serverProcess, `Launching server using command ${command.command} failed.`);
              }
              serverProcess.stderr.on("data", (data) => this.outputChannel.append(Is.string(data) ? data : data.toString(encoding)));
              this._serverProcess = serverProcess;
              this._isDetached = !!options.detached;
              return Promise.resolve({ reader: new node_1.StreamMessageReader(serverProcess.stdout), writer: new node_1.StreamMessageWriter(serverProcess.stdin) });
            } else if (transport === TransportKind.pipe) {
              return (0, node_1.createClientPipeTransport)(pipeName).then((transport2) => {
                const serverProcess = cp.spawn(command.command, args, options);
                if (!serverProcess || !serverProcess.pid) {
                  return handleChildProcessStartError(serverProcess, `Launching server using command ${command.command} failed.`);
                }
                this._serverProcess = serverProcess;
                this._isDetached = !!options.detached;
                serverProcess.stderr.on("data", (data) => this.outputChannel.append(Is.string(data) ? data : data.toString(encoding)));
                serverProcess.stdout.on("data", (data) => this.outputChannel.append(Is.string(data) ? data : data.toString(encoding)));
                return transport2.onConnected().then((protocol) => {
                  return { reader: protocol[0], writer: protocol[1] };
                });
              });
            } else if (Transport.isSocket(transport)) {
              return (0, node_1.createClientSocketTransport)(transport.port).then((transport2) => {
                const serverProcess = cp.spawn(command.command, args, options);
                if (!serverProcess || !serverProcess.pid) {
                  return handleChildProcessStartError(serverProcess, `Launching server using command ${command.command} failed.`);
                }
                this._serverProcess = serverProcess;
                this._isDetached = !!options.detached;
                serverProcess.stderr.on("data", (data) => this.outputChannel.append(Is.string(data) ? data : data.toString(encoding)));
                serverProcess.stdout.on("data", (data) => this.outputChannel.append(Is.string(data) ? data : data.toString(encoding)));
                return transport2.onConnected().then((protocol) => {
                  return { reader: protocol[0], writer: protocol[1] };
                });
              });
            }
          }
          return Promise.reject(new Error(`Unsupported server configuration ` + JSON.stringify(server, null, 4)));
        }).finally(() => {
          if (this._serverProcess !== void 0) {
            this._serverProcess.on("exit", (code, signal) => {
              if (code !== null) {
                this.error(`Server process exited with code ${code}.`, void 0, false);
              }
              if (signal !== null) {
                this.error(`Server process exited with signal ${signal}.`, void 0, false);
              }
            });
          }
        });
      }
      _getRuntimePath(runtime, serverWorkingDirectory) {
        if (path2.isAbsolute(runtime)) {
          return runtime;
        }
        const mainRootPath = this._mainGetRootPath();
        if (mainRootPath !== void 0) {
          const result = path2.join(mainRootPath, runtime);
          if (fs.existsSync(result)) {
            return result;
          }
        }
        if (serverWorkingDirectory !== void 0) {
          const result = path2.join(serverWorkingDirectory, runtime);
          if (fs.existsSync(result)) {
            return result;
          }
        }
        return runtime;
      }
      _mainGetRootPath() {
        let folders = vscode_1.workspace.workspaceFolders;
        if (!folders || folders.length === 0) {
          return void 0;
        }
        let folder = folders[0];
        if (folder.uri.scheme === "file") {
          return folder.uri.fsPath;
        }
        return void 0;
      }
      _getServerWorkingDir(options) {
        let cwd = options && options.cwd;
        if (!cwd) {
          cwd = this.clientOptions.workspaceFolder ? this.clientOptions.workspaceFolder.uri.fsPath : this._mainGetRootPath();
        }
        if (cwd) {
          return new Promise((s) => {
            fs.lstat(cwd, (err, stats) => {
              s(!err && stats.isDirectory() ? cwd : void 0);
            });
          });
        }
        return Promise.resolve(void 0);
      }
    };
    exports2.LanguageClient = LanguageClient2;
    var SettingMonitor = class {
      constructor(_client, _setting) {
        this._client = _client;
        this._setting = _setting;
        this._listeners = [];
      }
      start() {
        vscode_1.workspace.onDidChangeConfiguration(this.onDidChangeConfiguration, this, this._listeners);
        this.onDidChangeConfiguration();
        return new vscode_1.Disposable(() => {
          if (this._client.needsStop()) {
            void this._client.stop();
          }
        });
      }
      onDidChangeConfiguration() {
        let index = this._setting.indexOf(".");
        let primary = index >= 0 ? this._setting.substr(0, index) : this._setting;
        let rest = index >= 0 ? this._setting.substr(index + 1) : void 0;
        let enabled = rest ? vscode_1.workspace.getConfiguration(primary).get(rest, false) : vscode_1.workspace.getConfiguration(primary);
        if (enabled && this._client.needsStart()) {
          this._client.start().catch((error) => this._client.error("Start failed after configuration change", error, "force"));
        } else if (!enabled && this._client.needsStop()) {
          void this._client.stop().catch((error) => this._client.error("Stop failed after configuration change", error, "force"));
        }
      }
    };
    exports2.SettingMonitor = SettingMonitor;
    function handleChildProcessStartError(process2, message) {
      if (process2 === null) {
        return Promise.reject(message);
      }
      return new Promise((_, reject) => {
        process2.on("error", (err) => {
          reject(`${message} ${err}`);
        });
        setImmediate(() => reject(message));
      });
    }
  }
});

// node_modules/vscode-languageclient/node.js
var require_node3 = __commonJS({
  "node_modules/vscode-languageclient/node.js"(exports2, module2) {
    "use strict";
    module2.exports = require_main4();
  }
});

// extension.ts
var extension_exports = {};
__export(extension_exports, {
  activate: () => activate11,
  deactivate: () => deactivate
});
module.exports = __toCommonJS(extension_exports);
var path = __toESM(require("path"));
var vscode13 = __toESM(require("vscode"));
var import_vscode = require("vscode");

// features/connectionsPanel.ts
var vscode4 = __toESM(require("vscode"));

// features/server.ts
function runQuery(client2, query, cluster, database, isReadOnly, maxRows) {
  return client2.sendRequest(
    "kusto/runQuery",
    { query, cluster, database, isReadOnly, maxRows }
  );
}
function getQueryResultType(client2, query, cluster, database) {
  return client2.sendRequest(
    "kusto/getQueryResultType",
    { query, cluster, database }
  );
}
function getFunctionResultType(client2, cluster, database, functionName) {
  return client2.sendRequest(
    "kusto/getFunctionResultType",
    { cluster, database, functionName }
  );
}
function getQueryRanges(client2, uri) {
  return client2.sendRequest(
    "kusto/getQueryRanges",
    { uri }
  );
}
function getQueryRange(client2, uri, position) {
  return client2.sendRequest(
    "kusto/getQueryRange",
    { uri, position }
  );
}
function getServerKind(client2, connection) {
  return client2.sendRequest(
    "kusto/getServerKind",
    { connection }
  );
}
function decodeConnectionString(client2, connectionString) {
  return client2.sendRequest(
    "kusto/decodeConnectionString",
    { connectionString }
  );
}
function getServerInfo(client2, connection, serverKind) {
  return client2.sendRequest(
    "kusto/getServerInfo",
    { connection, serverKind }
  );
}
function getDatabaseInfo(client2, cluster, database) {
  return client2.sendRequest(
    "kusto/getDatabaseInfo",
    { cluster, database }
  );
}
function getEntityAsCommand(client2, cluster, database, entityType, entityName) {
  return client2.sendRequest(
    "kusto/getEntityAsCommand",
    { cluster, database, entityType, entityName }
  );
}
function getEntityAsExpression(client2, cluster, database, entityType, entityName, uri) {
  return client2.sendRequest(
    "kusto/getEntityAsExpression",
    { cluster, database, entityType, entityName, uri }
  );
}
function getChartAsHtml(client2, data, darkMode) {
  return client2.sendRequest(
    "kusto/getChartAsHtml",
    {
      data,
      darkMode: darkMode ?? false
    }
  );
}
function getQueryAsHtml(client2, uri, selection, darkMode) {
  return client2.sendRequest(
    "kusto/getQueryAsHtml",
    {
      textDocument: { uri },
      selection,
      darkMode
    }
  );
}
function getDataAsExpression(client2, data, tableName) {
  return client2.sendRequest(
    "kusto/getDataAsExpression",
    {
      data,
      tableName
    }
  );
}
function getEntityDefinitionContent(client2, uri) {
  return client2.sendRequest(
    "kusto/getEntityDefinitionContent",
    { uri }
  );
}
function transformPaste(client2, text, kind, targetUri, targetPosition, entityCluster, entityDatabase, entityType, entityName) {
  return client2.sendRequest(
    "kusto/transformPaste",
    {
      text,
      kind,
      textDocument: { uri: targetUri },
      position: targetPosition,
      entityCluster,
      entityDatabase,
      entityType,
      entityName
    }
  );
}
function refreshSchema(client2, cluster, database) {
  return client2.sendRequest(
    "kusto/refreshSchema",
    { cluster, database }
  );
}
function refreshDocumentSchema(client2, uri) {
  return client2.sendRequest(
    "kusto/refreshDocumentSchema",
    { uri }
  );
}
function inferDocumentConnection(client2, uri) {
  return client2.sendRequest(
    "kusto/inferDocumentConnection",
    { uri }
  );
}
function ensureDocument(client2, uri, text) {
  return client2.sendRequest(
    "kusto/ensureDocument",
    { uri, text }
  );
}
function validateQuery(client2, query, cluster, database) {
  return client2.sendRequest(
    "kusto/validateQuery",
    { query, cluster, database }
  );
}
function getMinifiedQuery(client2, query) {
  return client2.sendRequest(
    "kusto/getMinifiedQuery",
    { query }
  );
}

// features/clipboard.ts
var vscode = __toESM(require("vscode"));
var clipboardContext;
function setClipboardContext(context) {
  clipboardContext = context;
}
function getClipboardContext() {
  return clipboardContext;
}
function clearClipboardContext() {
  clipboardContext = void 0;
}
function formatCfHtml(html) {
  const header = "Version:0.9\r\nStartHTML:XXXXXXXXXX\r\nEndHTML:XXXXXXXXXX\r\nStartFragment:XXXXXXXXXX\r\nEndFragment:XXXXXXXXXX\r\n";
  const prefix = "<html><body>\r\n<!--StartFragment-->";
  const suffix = "<!--EndFragment-->\r\n</body></html>";
  const headerBytes = Buffer.byteLength(header, "utf8");
  const prefixBytes = Buffer.byteLength(prefix, "utf8");
  const htmlBytes = Buffer.byteLength(html, "utf8");
  const suffixBytes = Buffer.byteLength(suffix, "utf8");
  const startHtml = headerBytes;
  const startFragment = headerBytes + prefixBytes;
  const endFragment = startFragment + htmlBytes;
  const endHtml = endFragment + suffixBytes;
  const pad = (n) => n.toString().padStart(10, "0");
  const filledHeader = `Version:0.9\r
StartHTML:${pad(startHtml)}\r
EndHTML:${pad(endHtml)}\r
StartFragment:${pad(startFragment)}\r
EndFragment:${pad(endFragment)}\r
`;
  return filledHeader + prefix + html + suffix;
}
async function copyToClipboard(items) {
  if (process.platform === "win32") {
    return copyToClipboardWindows(items);
  } else {
    return copyToClipboardFallback(items);
  }
}
async function copyToClipboardFallback(items) {
  const textItem = items.find((i) => i.format === "Text" && i.encoding === "text") ?? items.find((i) => i.format === "Text") ?? items.find((i) => i.encoding === "text");
  if (textItem) {
    await vscode.env.clipboard.writeText(textItem.data);
  } else {
    const firstItem = items[0];
    if (firstItem) {
      await vscode.env.clipboard.writeText(firstItem.data);
    }
  }
}
function copyToClipboardWindows(items) {
  const { spawn } = require("child_process");
  return new Promise((resolve, reject) => {
    const psScript = `
            Add-Type -AssemblyName System.Windows.Forms
            $json = $input | Out-String
            $items = ($json | ConvertFrom-Json)
            $data = New-Object System.Windows.Forms.DataObject
            $streams = @()
            foreach ($item in $items) {
                if ($item.encoding -eq 'text') {
                    $data.SetData($item.format, $item.data)
                } else {
                    if ($item.encoding -eq 'base64') {
                        $bytes = [Convert]::FromBase64String($item.data)
                    } else {
                        $bytes = [System.Text.Encoding]::UTF8.GetBytes($item.data)
                    }
                    $stream = New-Object System.IO.MemoryStream(,$bytes)
                    $streams += $stream
                    $data.SetData($item.format, $false, $stream)
                    # Also set as standard bitmap so Electron apps (Teams, Discord) can paste it
                    if ($item.format -eq 'PNG') {
                        Add-Type -AssemblyName System.Drawing
                        $imgStream = New-Object System.IO.MemoryStream(,$bytes)
                        $streams += $imgStream
                        $bitmap = [System.Drawing.Image]::FromStream($imgStream)
                        # Force 96 DPI so the bitmap renders at full pixel size on HiDPI displays
                        # (otherwise it inherits the screen DPI and appears the same logical size)
                        $bitmap.SetResolution(96, 96)
                        $data.SetImage($bitmap)
                    }
                }
            }
            [System.Windows.Forms.Clipboard]::SetDataObject($data, $true)
            foreach ($s in $streams) { $s.Dispose() }
        `;
    const ps = spawn("powershell", ["-sta", "-NoProfile", "-Command", psScript]);
    const payload = JSON.stringify(items);
    ps.stdin.write(payload);
    ps.stdin.end();
    ps.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`PowerShell exited with code ${code}`));
      }
    });
    ps.on("error", (err) => {
      reject(err);
    });
  });
}

// features/connections.ts
var vscode2 = __toESM(require("vscode"));
var SERVERS_STORAGE_KEY = "kusto.serversAndGroups";
var DOCUMENT_CONNECTIONS_KEY = "kusto.documentConnections";
function isServerGroup(item) {
  return "servers" in item;
}
function isServer(item) {
  return "cluster" in item;
}
async function getHostName(connection) {
  if (languageClient) {
    try {
      const result = await decodeConnectionString(languageClient, connection);
      if (result?.cluster) {
        return result.cluster;
      }
    } catch {
    }
  }
  return getHostNameSimple(connection);
}
function getHostNameSimple(connection) {
  let dataSource = connection;
  const connectionParts = connection.split(";");
  if (connectionParts.length > 1) {
    const dataSourcePart = connectionParts.find((part) => part.trim().toLowerCase().startsWith("data source="));
    if (dataSourcePart) {
      const dsParts = dataSourcePart.split("=");
      if (dsParts.length > 1 && dsParts[1]) {
        dataSource = dsParts[1].trim();
      }
    } else if (connectionParts[0]) {
      dataSource = connectionParts[0].trim();
    }
  } else if (connectionParts.length > 0 && connectionParts[0]) {
    dataSource = connectionParts[0].trim();
  }
  try {
    const url = new URL(dataSource.startsWith("https://") ? dataSource : `https://${dataSource}`);
    return url.hostname;
  } catch {
    return dataSource;
  }
}
function getDisplayName(cluster) {
  const defaultDomain = vscode2.workspace.getConfiguration("kusto").get("defaultDomain", ".kusto.windows.net");
  if (defaultDomain && cluster.endsWith(defaultDomain)) {
    const shortName = cluster.substring(0, cluster.length - defaultDomain.length);
    if (shortName && shortName !== cluster) {
      return shortName;
    }
  }
  return void 0;
}
var extensionContext;
var languageClient;
var documentConnectionChangedListeners = [];
var serversAndGroupsChangedListeners = [];
var documentConnections = /* @__PURE__ */ new Map();
var serversAndGroups = { items: [] };
var clusterConnections = [];
function activate(context, client2) {
  extensionContext = context;
  languageClient = client2;
}
function registerOnDocumentConnectionChanged(callback) {
  documentConnectionChangedListeners.push(callback);
  return new vscode2.Disposable(() => {
    const index = documentConnectionChangedListeners.indexOf(callback);
    if (index >= 0) documentConnectionChangedListeners.splice(index, 1);
  });
}
function registerOnServersAndGroupsChanged(callback) {
  serversAndGroupsChangedListeners.push(callback);
  return new vscode2.Disposable(() => {
    const index = serversAndGroupsChangedListeners.indexOf(callback);
    if (index >= 0) serversAndGroupsChangedListeners.splice(index, 1);
  });
}
async function raiseDocumentConnectionChanged(uri) {
  for (const listener of documentConnectionChangedListeners) {
    await listener(uri);
  }
}
function raiseServersAndGroupsChanged() {
  for (const listener of serversAndGroupsChangedListeners) listener();
}
function loadServersAndGroups() {
  if (!extensionContext) return;
  const data = extensionContext.globalState.get(SERVERS_STORAGE_KEY);
  serversAndGroups = data ?? { items: [] };
}
async function saveServersAndGroups() {
  if (!extensionContext) return;
  await extensionContext.globalState.update(SERVERS_STORAGE_KEY, serversAndGroups);
  if (languageClient) {
    const connectionsList = getConfiguredConnections();
    await languageClient.sendNotification("kusto/connectionsUpdated", {
      connections: connectionsList
    });
  }
}
function getServersAndGroups() {
  return serversAndGroups;
}
function sortServersAndGroups() {
  const getServerSortName = (s) => (s.displayName ?? s.cluster).toLowerCase();
  const getGroupSortName = (g) => g.name.toLowerCase();
  for (const item of serversAndGroups.items) {
    if (isServerGroup(item)) {
      item.servers.sort((a, b) => getServerSortName(a).localeCompare(getServerSortName(b)));
    }
  }
  const groups = serversAndGroups.items.filter(isServerGroup);
  const servers = serversAndGroups.items.filter(isServer);
  groups.sort((a, b) => getGroupSortName(a).localeCompare(getGroupSortName(b)));
  servers.sort((a, b) => getServerSortName(a).localeCompare(getServerSortName(b)));
  serversAndGroups.items = [...servers, ...groups];
}
async function addServer(server, groupName) {
  if (groupName) {
    const group = serversAndGroups.items.find(
      (item) => isServerGroup(item) && item.name === groupName
    );
    if (group) {
      group.servers.push(server);
    }
  } else {
    serversAndGroups.items.push(server);
  }
  sortServersAndGroups();
  await saveServersAndGroups();
  raiseServersAndGroupsChanged();
}
async function ensureServer(connectionString) {
  const cluster = await getHostName(connectionString);
  if (findServerInfo(cluster)) {
    return;
  }
  const newServer = {
    connection: connectionString,
    cluster
  };
  const displayName = getDisplayName(cluster);
  if (displayName) {
    newServer.displayName = displayName;
  }
  const serverKind = await fetchServerKind(connectionString);
  if (serverKind) {
    newServer.serverKind = serverKind;
  }
  await addServer(newServer);
}
async function addServerGroup(group) {
  serversAndGroups.items.push(group);
  sortServersAndGroups();
  await saveServersAndGroups();
  raiseServersAndGroupsChanged();
}
async function removeServer(cluster, groupName) {
  if (groupName) {
    const group = serversAndGroups.items.find(
      (item) => isServerGroup(item) && item.name === groupName
    );
    if (group) {
      group.servers = group.servers.filter((s) => s.cluster !== cluster);
    }
  } else {
    serversAndGroups.items = serversAndGroups.items.filter(
      (item) => !(isServer(item) && item.cluster === cluster)
    );
  }
  clusterConnections = clusterConnections.filter((c) => c.cluster !== cluster);
  await saveServersAndGroups();
  raiseServersAndGroupsChanged();
}
async function removeServerGroup(groupName) {
  const group = serversAndGroups.items.find(
    (item) => isServerGroup(item) && item.name === groupName
  );
  if (group) {
    const clusterNames = group.servers.map((s) => s.cluster);
    clusterConnections = clusterConnections.filter((c) => !clusterNames.includes(c.cluster));
  }
  serversAndGroups.items = serversAndGroups.items.filter(
    (item) => !(isServerGroup(item) && item.name === groupName)
  );
  await saveServersAndGroups();
  raiseServersAndGroupsChanged();
}
async function moveServer(cluster, sourceGroupName, targetGroupName) {
  let serverInfo;
  if (sourceGroupName) {
    const sourceGroup = serversAndGroups.items.find(
      (item) => isServerGroup(item) && item.name === sourceGroupName
    );
    serverInfo = sourceGroup?.servers.find((s) => s.cluster === cluster);
  } else {
    serverInfo = serversAndGroups.items.find(
      (item) => isServer(item) && item.cluster === cluster
    );
  }
  if (!serverInfo) return;
  const serverCopy = { ...serverInfo };
  if (sourceGroupName) {
    const sourceGroup = serversAndGroups.items.find(
      (item) => isServerGroup(item) && item.name === sourceGroupName
    );
    if (sourceGroup) {
      sourceGroup.servers = sourceGroup.servers.filter((s) => s.cluster !== cluster);
    }
  } else {
    serversAndGroups.items = serversAndGroups.items.filter(
      (item) => !(isServer(item) && item.cluster === cluster)
    );
  }
  if (targetGroupName) {
    const targetGroup = serversAndGroups.items.find(
      (item) => isServerGroup(item) && item.name === targetGroupName
    );
    if (targetGroup) {
      targetGroup.servers.push(serverCopy);
    }
  } else {
    serversAndGroups.items.push(serverCopy);
  }
  sortServersAndGroups();
  await saveServersAndGroups();
  raiseServersAndGroupsChanged();
}
async function editServer(oldCluster, newConnection, newDisplayName, newServerKind, groupName) {
  let serverInfo;
  if (groupName) {
    const group = serversAndGroups.items.find(
      (item) => isServerGroup(item) && item.name === groupName
    );
    serverInfo = group?.servers.find((s) => s.cluster === oldCluster);
  } else {
    serverInfo = serversAndGroups.items.find(
      (item) => isServer(item) && item.cluster === oldCluster
    );
  }
  if (!serverInfo) return;
  const newCluster = await getHostName(newConnection);
  serverInfo.connection = newConnection;
  serverInfo.cluster = newCluster;
  if (newDisplayName && newDisplayName !== newCluster) {
    serverInfo.displayName = newDisplayName;
  } else {
    delete serverInfo.displayName;
  }
  if (newServerKind) {
    serverInfo.serverKind = newServerKind;
  }
  if (oldCluster !== newCluster) {
    const connectionInfo = clusterConnections.find((c) => c.cluster === oldCluster);
    if (connectionInfo) {
      connectionInfo.cluster = newCluster;
      connectionInfo.connection = newConnection;
    }
  }
  await saveServersAndGroups();
  raiseServersAndGroupsChanged();
}
async function renameServer(cluster, newDisplayName, groupName) {
  let serverInfo;
  if (groupName) {
    const group = serversAndGroups.items.find(
      (item) => isServerGroup(item) && item.name === groupName
    );
    serverInfo = group?.servers.find((s) => s.cluster === cluster);
  } else {
    serverInfo = serversAndGroups.items.find(
      (item) => isServer(item) && item.cluster === cluster
    );
  }
  if (!serverInfo) return;
  if (newDisplayName && newDisplayName !== serverInfo.cluster) {
    serverInfo.displayName = newDisplayName;
  } else {
    delete serverInfo.displayName;
  }
  await saveServersAndGroups();
  raiseServersAndGroupsChanged();
}
async function renameServerGroup(currentName, newName) {
  const group = serversAndGroups.items.find(
    (item) => isServerGroup(item) && item.name === currentName
  );
  if (!group) return;
  group.name = newName;
  await saveServersAndGroups();
  raiseServersAndGroupsChanged();
}
function ensureClusterConnection(cluster) {
  let connectionInfo = clusterConnections.find((c) => c.cluster === cluster);
  if (!connectionInfo) {
    let serverInfo;
    for (const item of serversAndGroups.items) {
      if (isServerGroup(item)) {
        serverInfo = item.servers.find((s) => s.cluster === cluster);
        if (serverInfo) break;
      } else if (item.cluster === cluster) {
        serverInfo = item;
        break;
      }
    }
    connectionInfo = {
      cluster,
      connection: serverInfo?.connection ?? cluster,
      databases: []
    };
    clusterConnections.push(connectionInfo);
  }
  return connectionInfo;
}
function setClusterDatabases(cluster, databases) {
  const connectionInfo = ensureClusterConnection(cluster);
  connectionInfo.databases = databases;
  raiseServersAndGroupsChanged();
}
function getClusterDatabases(cluster) {
  return clusterConnections.find((c) => c.cluster === cluster)?.databases;
}
function setDatabaseInfo(cluster, databaseInfo) {
  const connectionInfo = ensureClusterConnection(cluster);
  if (!connectionInfo.databases) {
    connectionInfo.databases = [];
  }
  const existingIndex = connectionInfo.databases.findIndex((d) => d.name === databaseInfo.name);
  if (existingIndex >= 0) {
    connectionInfo.databases[existingIndex] = databaseInfo;
  } else {
    connectionInfo.databases.push(databaseInfo);
  }
}
function getDatabaseInfo2(cluster, database) {
  const connectionInfo = clusterConnections.find((c) => c.cluster === cluster);
  return connectionInfo?.databases?.find((d) => d.name === database);
}
async function fetchDatabasesForCluster(clusterName) {
  if (!languageClient) return;
  try {
    const serverInfo = findServerInfo(clusterName);
    const serverKind = serverInfo?.serverKind ?? null;
    const result = await getServerInfo(languageClient, clusterName, serverKind);
    if (result && result.databases) {
      const databases = result.databases.map((db) => ({ name: db.name }));
      setClusterDatabases(clusterName, databases);
    }
  } catch (error) {
    console.error(`Failed to get server info for ${clusterName}:`, error);
    vscode2.window.showErrorMessage(`Failed to load databases for ${clusterName}`);
  }
}
async function refreshClusterSchema(clusterName) {
  if (!languageClient) return;
  await vscode2.window.withProgress(
    {
      location: vscode2.ProgressLocation.Notification,
      title: `Refreshing schema for ${clusterName}...`,
      cancellable: false
    },
    async () => {
      try {
        await refreshSchema(languageClient, clusterName);
        const connectionInfo = clusterConnections.find((c) => c.cluster === clusterName);
        if (connectionInfo) {
          connectionInfo.databases = [];
        }
        raiseServersAndGroupsChanged();
      } catch (error) {
        console.error(`Failed to refresh schema for ${clusterName}:`, error);
        vscode2.window.showErrorMessage(`Failed to refresh schema for ${clusterName}`);
      }
    }
  );
}
async function refreshDatabaseSchema(clusterName, databaseName) {
  if (!languageClient) return;
  await vscode2.window.withProgress(
    {
      location: vscode2.ProgressLocation.Notification,
      title: `Refreshing schema for ${databaseName}...`,
      cancellable: false
    },
    async () => {
      try {
        await refreshSchema(languageClient, clusterName, databaseName);
        const connectionInfo = clusterConnections.find((c) => c.cluster === clusterName);
        if (connectionInfo?.databases) {
          const dbIndex = connectionInfo.databases.findIndex((d) => d.name === databaseName);
          if (dbIndex >= 0) {
            connectionInfo.databases[dbIndex] = { name: databaseName };
          }
        }
        raiseServersAndGroupsChanged();
      } catch (error) {
        console.error(`Failed to refresh schema for ${clusterName}/${databaseName}:`, error);
        vscode2.window.showErrorMessage(`Failed to refresh schema for ${clusterName}/${databaseName}`);
      }
    }
  );
}
async function loadDocumentConnections() {
  if (!extensionContext) return;
  const stored = extensionContext.workspaceState.get(DOCUMENT_CONNECTIONS_KEY);
  if (stored) {
    documentConnections.clear();
    for (const conn of stored) {
      documentConnections.set(conn.uri, conn);
    }
  }
}
async function saveDocumentConnections() {
  if (!extensionContext) return;
  const values = Array.from(documentConnections.values());
  await extensionContext.workspaceState.update(DOCUMENT_CONNECTIONS_KEY, values);
}
async function getDocumentConnection(uri) {
  const saved = documentConnections.get(uri);
  if (saved && !saved.cluster) {
    return void 0;
  }
  let inferred;
  if (languageClient) {
    try {
      const inferredResult = await inferDocumentConnection(languageClient, uri);
      if (inferredResult?.cluster) {
        inferred = {
          uri,
          cluster: inferredResult.cluster,
          database: inferredResult.database
        };
      }
    } catch (error) {
      console.error(`Failed to infer connection for ${uri}:`, error);
    }
  }
  if (saved?.cluster) {
    if (inferred && saved.cluster === inferred.cluster && saved.database === inferred.database) {
      documentConnections.delete(uri);
      await saveDocumentConnections();
    }
    return saved;
  }
  return inferred;
}
async function setDocumentConnection(uri, cluster, database) {
  if (!languageClient) {
    console.error("Language client not initialized");
    return;
  }
  let matchesInferred = false;
  if (cluster) {
    try {
      const inferred = await inferDocumentConnection(languageClient, uri);
      if (inferred?.cluster === cluster && inferred?.database === database) {
        matchesInferred = true;
      }
    } catch (error) {
      console.error(`Failed to infer connection for ${uri}:`, error);
    }
  }
  if (matchesInferred) {
    documentConnections.delete(uri);
  } else {
    const connection = {
      uri,
      cluster: cluster ?? void 0,
      database: database ?? void 0
    };
    documentConnections.set(uri, connection);
  }
  await saveDocumentConnections();
  await raiseDocumentConnectionChanged(uri);
  let serverKind = null;
  if (cluster) {
    const info = findServerInfo(cluster);
    serverKind = info?.serverKind ?? null;
  }
  await languageClient.sendNotification("kusto/documentConnectionChanged", {
    uri,
    cluster: cluster || null,
    database: database || null,
    serverKind
  });
}
function findServerInfo(cluster) {
  for (const item of serversAndGroups.items) {
    if (isServerGroup(item)) {
      const server = item.servers.find((s) => s.cluster === cluster);
      if (server) {
        return server;
      }
    } else if (isServer(item) && item.cluster === cluster) {
      return item;
    }
  }
  return void 0;
}
async function fetchServerKind(connectionString) {
  if (!languageClient) return void 0;
  try {
    const result = await getServerKind(languageClient, connectionString);
    return result?.serverKind;
  } catch (error) {
    console.error(`Failed to get server kind for ${connectionString}:`, error);
    return void 0;
  }
}
function getConfiguredConnections() {
  const servers = [];
  for (const item of serversAndGroups.items) {
    if (isServerGroup(item)) {
      for (const server of item.servers) {
        servers.push(server.cluster);
      }
    } else {
      servers.push(item.cluster);
    }
  }
  return servers;
}
async function getDatabasesForCluster(cluster) {
  if (!languageClient) {
    return [];
  }
  try {
    const serverInfo = findServerInfo(cluster);
    const serverKind = serverInfo?.serverKind ?? null;
    const result = await getServerInfo(languageClient, cluster, serverKind);
    if (result && result.databases) {
      return result.databases.map((db) => db.name);
    }
    return [];
  } catch (error) {
    console.error(`Failed to get databases for ${cluster}:`, error);
    return [];
  }
}
async function getDatabaseSchema(cluster, database) {
  if (!languageClient) {
    return void 0;
  }
  let dbInfo = getDatabaseInfo2(cluster, database);
  if (dbInfo && dbInfo.tables) {
    return dbInfo;
  }
  try {
    const result = await getDatabaseInfo(languageClient, cluster, database);
    if (result) {
      setDatabaseInfo(cluster, result);
      return result;
    }
  } catch (error) {
    console.error(`Failed to get database info for ${cluster}/${database}:`, error);
  }
  return void 0;
}
async function getActiveDocumentConnection() {
  const editor = vscode2.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "kusto") {
    return void 0;
  }
  const connection = await getDocumentConnection(editor.document.uri.toString());
  if (!connection?.cluster) {
    return void 0;
  }
  return {
    cluster: connection.cluster,
    database: connection.database
  };
}

// features/entityDefinitionProvider.ts
var vscode3 = __toESM(require("vscode"));
var ENTITY_DEFINITION_SCHEME = "kusto-entity";
var EntityDefinitionProvider = class {
  constructor(client2) {
    this.client = client2;
    this._onDidChange = new vscode3.EventEmitter();
    this.onDidChange = this._onDidChange.event;
  }
  async provideTextDocumentContent(uri, token) {
    try {
      const result = await this.client.sendRequest(
        "kusto/getEntityDefinitionContent",
        { uri: uri.toString() },
        token
      );
      if (result?.content) {
        return result.content;
      }
    } catch (error) {
      console.error("Failed to get entity definition content:", error);
    }
    return "// Unable to retrieve entity definition";
  }
  /**
   * Invalidates the cached content for a URI, causing VS Code to request fresh content.
   * Call this if you know the entity definition has changed on the server.
   */
  refresh(uri) {
    this._onDidChange.fire(uri);
  }
  dispose() {
    this._onDidChange.dispose();
  }
};
function registerEntityDefinitionProvider(context, client2) {
  const provider = new EntityDefinitionProvider(client2);
  const registration = vscode3.workspace.registerTextDocumentContentProvider(
    ENTITY_DEFINITION_SCHEME,
    provider
  );
  context.subscriptions.push(registration);
  context.subscriptions.push(provider);
  return provider;
}

// features/connectionsPanel.ts
async function activate2(context, client2) {
  languageClient2 = client2;
  connectionsProvider = new KustoConnectionsProvider();
  context.subscriptions.push(registerOnDocumentConnectionChanged(async (uri) => {
    if (isTreeSelectionChangingConnection) {
      return;
    }
    if (vscode4.window.activeTextEditor?.document.uri.toString() === uri) {
      await updateTreeSelectionForActiveDocument();
    }
  }));
  context.subscriptions.push(registerOnServersAndGroupsChanged(async () => {
    connectionsProvider?.refresh();
    if (!isFetchingDatabasesForTreeUpdate) {
      setTimeout(async () => {
        await updateTreeSelectionForActiveDocument();
      }, 100);
    }
  }));
  loadServersAndGroups();
  treeView = vscode4.window.createTreeView("kusto.connections", {
    treeDataProvider: connectionsProvider,
    showCollapseAll: true,
    dragAndDropController: new KustoDragAndDropController()
  });
  context.subscriptions.push(treeView);
  context.subscriptions.push(
    vscode4.languages.registerDocumentDropEditProvider(
      { language: "kusto" },
      new KustoDocumentDropEditProvider(),
      { dropMimeTypes: [ENTITY_DRAG_MIME] }
    )
  );
  const initialConnections = getConfiguredConnections();
  client2.sendNotification("kusto/connectionsUpdated", {
    connections: initialConnections
  });
  await loadDocumentConnections();
  for (const document of vscode4.workspace.textDocuments) {
    if (document.languageId === "kusto") {
      const connection = await getDocumentConnection(document.uri.toString());
      const serverKind = connection?.cluster ? findServerInfo(connection.cluster)?.serverKind ?? null : null;
      await client2.sendNotification("kusto/documentConnectionChanged", {
        uri: document.uri.toString(),
        cluster: connection?.cluster || null,
        database: connection?.database || null,
        serverKind
      });
    }
  }
  client2.onNotification("kusto/documentReady", async (params) => {
    const editor = vscode4.window.activeTextEditor;
    if (editor && editor.document.uri.toString() === params.uri) {
      await updateTreeSelectionForActiveDocument();
    }
  });
  context.subscriptions.push(
    vscode4.window.onDidChangeActiveTextEditor(async (editor) => {
      if (editor && editor.document.languageId === "kusto") {
        await ensureDocument(
          client2,
          editor.document.uri.toString(),
          editor.document.getText()
        );
      } else {
        await updateTreeSelectionForActiveDocument();
      }
    })
  );
  const initialEditor = vscode4.window.activeTextEditor;
  const initialIsKusto = initialEditor && initialEditor.document.languageId === "kusto";
  await vscode4.commands.executeCommand("setContext", "kusto.hasActiveDocument", initialIsKusto);
  context.subscriptions.push(
    treeView.onDidChangeSelection(async (event) => {
      if (isProgrammaticSelection()) {
        return;
      }
      if (isDragging) {
        return;
      }
      if (event.selection.length === 0) {
        return;
      }
      const selected = event.selection[0];
      const isSelectableItem = selected instanceof NoConnectionTreeItem || selected instanceof ServerTreeItem || selected instanceof DatabaseTreeItem;
      if (!isSelectableItem) {
        if (lastValidSelection) {
          try {
            await programmaticSelectTreeItem(lastValidSelection, { select: true, focus: false, expand: false });
          } catch {
          }
        }
        return;
      }
      lastValidSelection = selected;
      const editor = vscode4.window.activeTextEditor;
      if (!editor || editor.document.languageId !== "kusto") {
        return;
      }
      isTreeSelectionChangingConnection = true;
      try {
        if (selected instanceof NoConnectionTreeItem) {
          await setDocumentConnection(editor.document.uri.toString(), void 0, void 0);
        } else if (selected instanceof ServerTreeItem) {
          await setDocumentConnection(editor.document.uri.toString(), selected.clusterName, void 0);
        } else if (selected instanceof DatabaseTreeItem) {
          await setDocumentConnection(editor.document.uri.toString(), selected.clusterName, selected.databaseName);
        }
      } catch (error) {
        console.error("Failed to set document connection:", error);
      } finally {
        isTreeSelectionChangingConnection = false;
      }
    })
  );
  setTimeout(async () => {
    const editor = vscode4.window.activeTextEditor;
    if (editor && editor.document.languageId === "kusto") {
      await updateTreeSelectionForActiveDocument();
    }
  }, 100);
  connectionsProvider.refresh();
  context.subscriptions.push(
    treeView.onDidExpandElement(async (event) => {
      const element = event.element;
      if (element instanceof ServerTreeItem) {
        await fetchDatabasesForCluster(element.clusterName);
        connectionsProvider?.refreshItem(element);
      }
    })
  );
  context.subscriptions.push(
    vscode4.commands.registerCommand("kusto.selectServer", () => {
    }),
    vscode4.commands.registerCommand("kusto.selectDatabase", () => {
    }),
    vscode4.commands.registerCommand("kusto.selectEntity", () => {
    }),
    vscode4.commands.registerCommand("kusto.addServer", async () => {
      await connectionsProvider.promptAddServer();
    }),
    vscode4.commands.registerCommand("kusto.addServerToGroup", async (item) => {
      await connectionsProvider.promptAddServer(item.groupInfo.name);
    }),
    vscode4.commands.registerCommand("kusto.addServerGroup", async () => {
      await connectionsProvider.promptAddServerGroup();
    }),
    vscode4.commands.registerCommand("kusto.removeServer", async (item) => {
      const confirm = await vscode4.window.showWarningMessage(
        `Are you sure you want to remove connection "${item.displayName ?? item.clusterName}"?`,
        { modal: true },
        "Remove"
      );
      if (confirm === "Remove") {
        await removeServer(item.clusterName, item.groupName);
      }
    }),
    vscode4.commands.registerCommand("kusto.removeServerGroup", async (item) => {
      const confirm = await vscode4.window.showWarningMessage(
        `Are you sure you want to remove group "${item.groupInfo.name}" and all its connections?`,
        { modal: true },
        "Remove"
      );
      if (confirm === "Remove") {
        await removeServerGroup(item.groupInfo.name);
      }
    }),
    vscode4.commands.registerCommand("kusto.moveServer", async (item) => {
      await connectionsProvider.promptMoveServer(
        item.clusterName,
        item.displayName ?? item.clusterName,
        item.groupName
      );
    }),
    vscode4.commands.registerCommand("kusto.editServer", async (item) => {
      await connectionsProvider.promptEditServer(
        item.connection,
        item.clusterName,
        item.displayName,
        item.groupName
      );
    }),
    vscode4.commands.registerCommand("kusto.renameServer", async (item) => {
      await connectionsProvider.promptRenameServer(
        item.clusterName,
        item.displayName ?? item.clusterName,
        item.groupName
      );
    }),
    vscode4.commands.registerCommand("kusto.renameServerGroup", async (item) => {
      await connectionsProvider.promptRenameServerGroup(item.groupInfo.name);
    }),
    vscode4.commands.registerCommand("kusto.refreshServer", async (item) => {
      await refreshClusterSchema(item.clusterName);
    }),
    vscode4.commands.registerCommand("kusto.refreshDatabase", async (item) => {
      await refreshDatabaseSchema(item.clusterName, item.databaseName);
    }),
    vscode4.commands.registerCommand("kusto.copyEntityAsCommand", async (item) => {
      if (!client2) {
        return;
      }
      const entityType = getEntityType(item);
      if (!entityType) {
        return;
      }
      const entityName = getEntityName(item);
      const cluster = getEntityCluster(item);
      const database = getEntityDatabase(item);
      try {
        const definition = await getEntityAsCommand(
          client2,
          cluster,
          database,
          entityType,
          entityName
        );
        if (definition) {
          await vscode4.env.clipboard.writeText(definition);
          setClipboardContext({
            text: definition,
            kind: "command",
            entityCluster: cluster,
            entityDatabase: database,
            entityType,
            entityName
          });
        }
      } catch (error) {
        vscode4.window.showErrorMessage(`Failed to copy entity: ${error}`);
      }
    }),
    vscode4.commands.registerCommand("kusto.copyEntityAsExpression", async (item) => {
      if (!client2) {
        return;
      }
      const entityType = getEntityType(item);
      if (!entityType) {
        return;
      }
      const entityName = getEntityName(item);
      const cluster = getEntityCluster(item);
      const database = getEntityDatabase(item);
      try {
        const expression = await getEntityAsExpression(
          client2,
          cluster,
          database,
          entityType,
          entityName,
          null
        );
        if (expression) {
          await vscode4.env.clipboard.writeText(expression);
          setClipboardContext({
            text: expression,
            kind: "expression",
            entityCluster: cluster,
            entityDatabase: database,
            entityType,
            entityName
          });
        }
      } catch (error) {
        vscode4.window.showErrorMessage(`Failed to copy expression: ${error}`);
      }
    }),
    vscode4.commands.registerCommand("kusto.viewEntityDefinition", async (item) => {
      const entityType = getEntityType(item);
      if (!entityType) {
        return;
      }
      if (item instanceof ServerTreeItem || item instanceof DatabaseTreeItem) {
        return;
      }
      const entityName = getEntityName(item);
      const cluster = getEntityCluster(item);
      const database = getEntityDatabase(item);
      if (!cluster || !database) {
        return;
      }
      const encodedCluster = encodeURIComponent(cluster);
      const encodedDatabase = encodeURIComponent(database);
      const encodedEntityType = encodeURIComponent(entityType);
      const encodedEntityName = encodeURIComponent(entityName);
      const uri = vscode4.Uri.parse(
        `${ENTITY_DEFINITION_SCHEME}://${encodedCluster}/${encodedDatabase}/${encodedEntityType}/${encodedEntityName}.kql`
      );
      try {
        const doc = await vscode4.workspace.openTextDocument(uri);
        await vscode4.window.showTextDocument(doc, { preview: true });
      } catch (error) {
        vscode4.window.showErrorMessage(`Failed to open entity definition: ${error}`);
      }
    })
  );
}
function isEntityTreeItem(item) {
  return item instanceof ServerTreeItem || item instanceof DatabaseTreeItem || item instanceof TableTreeItem || item instanceof ExternalTableTreeItem || item instanceof MaterializedViewTreeItem || item instanceof FunctionTreeItem || item instanceof EntityGroupTreeItem || item instanceof GraphModelTreeItem;
}
var entityTypeMap = {
  "server": "Cluster",
  "database": "Database",
  "table": "Table",
  "externalTable": "ExternalTable",
  "materializedView": "MaterializedView",
  "function": "Function",
  "entityGroup": "EntityGroup",
  "graphModel": "Graph"
};
function getEntityType(item) {
  return entityTypeMap[item.contextValue ?? ""];
}
function getEntityName(item) {
  if (item instanceof ServerTreeItem) {
    return item.clusterName;
  } else if (item instanceof DatabaseTreeItem) {
    return item.databaseName;
  } else if (item instanceof TableTreeItem || item instanceof ExternalTableTreeItem) {
    return item.tableInfo.name;
  } else if (item instanceof MaterializedViewTreeItem) {
    return item.viewInfo.name;
  } else if (item instanceof FunctionTreeItem) {
    return item.functionInfo.name;
  } else if (item instanceof EntityGroupTreeItem) {
    return item.groupInfo.name;
  } else if (item instanceof GraphModelTreeItem) {
    return item.graphInfo.name;
  }
  throw new Error(`Unknown entity tree item type`);
}
function getEntityCluster(item) {
  if (item instanceof ServerTreeItem) {
    return "";
  }
  return item.clusterName;
}
function getEntityDatabase(item) {
  if (item instanceof ServerTreeItem || item instanceof DatabaseTreeItem) {
    return "";
  }
  return item.databaseName;
}
var NoConnectionTreeItem = class extends vscode4.TreeItem {
  constructor() {
    super("(No Connection)", vscode4.TreeItemCollapsibleState.None);
    this.id = "no-connection";
    this.contextValue = "noConnection";
    this.iconPath = new vscode4.ThemeIcon("circle-slash");
  }
};
var ServerGroupTreeItem = class extends vscode4.TreeItem {
  constructor(groupInfo) {
    super(groupInfo.name, vscode4.TreeItemCollapsibleState.Collapsed);
    this.groupInfo = groupInfo;
    this.id = `group:${groupInfo.name}`;
    this.contextValue = "serverGroup";
    this.iconPath = new vscode4.ThemeIcon("folder");
  }
};
function getServerKindIcon(serverKind) {
  switch (serverKind) {
    case "Engine":
      return new vscode4.ThemeIcon("server");
    // Server icon for query engine
    case "DataManager":
      return new vscode4.ThemeIcon("cloud-upload");
    // Cloud upload for data ingestion
    case "ClusterManager":
      return new vscode4.ThemeIcon("settings-gear");
    // Gear for cluster management
    default:
      return new vscode4.ThemeIcon("server");
  }
}
var ServerTreeItem = class extends vscode4.TreeItem {
  constructor(connection, clusterName, displayName, groupName, serverKind) {
    const name = displayName ?? clusterName;
    super(name, vscode4.TreeItemCollapsibleState.Collapsed);
    this.connection = connection;
    this.clusterName = clusterName;
    this.displayName = displayName;
    this.groupName = groupName;
    this.serverKind = serverKind;
    this.id = `server:${clusterName}`;
    this.contextValue = "server";
    this.iconPath = getServerKindIcon(serverKind);
    this.command = {
      command: "kusto.selectServer",
      title: "Select Server",
      arguments: [this]
    };
    if (displayName) {
      this.description = clusterName;
    }
  }
};
var DatabaseTreeItem = class extends vscode4.TreeItem {
  constructor(clusterName, databaseName) {
    super(databaseName, vscode4.TreeItemCollapsibleState.Collapsed);
    this.clusterName = clusterName;
    this.databaseName = databaseName;
    this.id = `database:${clusterName}:${databaseName}`;
    this.contextValue = "database";
    this.iconPath = new vscode4.ThemeIcon("database");
    this.command = {
      command: "kusto.selectDatabase",
      title: "Select Database",
      arguments: [this]
    };
  }
};
var DatabaseFolderTreeItem = class extends vscode4.TreeItem {
  constructor(clusterName, databaseName, folderType, label, icon) {
    super(label, vscode4.TreeItemCollapsibleState.Collapsed);
    this.clusterName = clusterName;
    this.databaseName = databaseName;
    this.folderType = folderType;
    this.id = `folder:${clusterName}:${databaseName}:${folderType}`;
    this.contextValue = "databaseFolder";
    this.iconPath = new vscode4.ThemeIcon(icon);
  }
};
var EntityFolderTreeItem = class extends vscode4.TreeItem {
  constructor(clusterName, databaseName, folderType, folderPath) {
    const segments = folderPath.split("/");
    const folderName = segments[segments.length - 1] ?? folderPath;
    super(folderName, vscode4.TreeItemCollapsibleState.Collapsed);
    this.clusterName = clusterName;
    this.databaseName = databaseName;
    this.folderType = folderType;
    this.folderPath = folderPath;
    this.id = `entityFolder:${clusterName}:${databaseName}:${folderType}:${folderPath}`;
    this.contextValue = "entityFolder";
    this.iconPath = new vscode4.ThemeIcon("folder");
  }
};
var TableTreeItem = class extends vscode4.TreeItem {
  constructor(clusterName, databaseName, tableInfo) {
    const hasColumns = tableInfo.columns && tableInfo.columns.length > 0;
    super(tableInfo.name, hasColumns ? vscode4.TreeItemCollapsibleState.Collapsed : vscode4.TreeItemCollapsibleState.None);
    this.clusterName = clusterName;
    this.databaseName = databaseName;
    this.tableInfo = tableInfo;
    this.id = `table:${clusterName}:${databaseName}:${tableInfo.name}`;
    this.contextValue = "table";
    this.iconPath = new vscode4.ThemeIcon("table");
    if (tableInfo.description) {
      this.tooltip = tableInfo.description;
    }
    this.command = { command: "kusto.selectEntity", title: "Select Entity", arguments: [this] };
  }
};
var ExternalTableTreeItem = class extends vscode4.TreeItem {
  constructor(clusterName, databaseName, tableInfo) {
    const hasColumns = tableInfo.columns && tableInfo.columns.length > 0;
    super(tableInfo.name, hasColumns ? vscode4.TreeItemCollapsibleState.Collapsed : vscode4.TreeItemCollapsibleState.None);
    this.clusterName = clusterName;
    this.databaseName = databaseName;
    this.tableInfo = tableInfo;
    this.id = `externalTable:${clusterName}:${databaseName}:${tableInfo.name}`;
    this.contextValue = "externalTable";
    this.iconPath = new vscode4.ThemeIcon("cloud");
    if (tableInfo.description) {
      this.tooltip = tableInfo.description;
    }
    this.command = { command: "kusto.selectEntity", title: "Select Entity", arguments: [this] };
  }
};
var MaterializedViewTreeItem = class extends vscode4.TreeItem {
  constructor(clusterName, databaseName, viewInfo) {
    const hasColumns = viewInfo.columns && viewInfo.columns.length > 0;
    super(viewInfo.name, hasColumns ? vscode4.TreeItemCollapsibleState.Collapsed : vscode4.TreeItemCollapsibleState.None);
    this.clusterName = clusterName;
    this.databaseName = databaseName;
    this.viewInfo = viewInfo;
    this.id = `materializedView:${clusterName}:${databaseName}:${viewInfo.name}`;
    this.contextValue = "materializedView";
    this.iconPath = new vscode4.ThemeIcon("eye");
    if (viewInfo.description) {
      this.tooltip = viewInfo.description;
    }
    this.command = { command: "kusto.selectEntity", title: "Select Entity", arguments: [this] };
  }
};
var ColumnTreeItem = class extends vscode4.TreeItem {
  constructor(clusterName, databaseName, parentName, parentType, columnInfo) {
    super(columnInfo.name, vscode4.TreeItemCollapsibleState.None);
    this.clusterName = clusterName;
    this.databaseName = databaseName;
    this.parentName = parentName;
    this.parentType = parentType;
    this.columnInfo = columnInfo;
    this.id = `column:${clusterName}:${databaseName}:${parentType}:${parentName}:${columnInfo.name}`;
    this.contextValue = "column";
    this.iconPath = new vscode4.ThemeIcon("symbol-field");
    this.description = columnInfo.type;
  }
};
var FunctionTreeItem = class extends vscode4.TreeItem {
  constructor(clusterName, databaseName, functionInfo) {
    super(functionInfo.name, vscode4.TreeItemCollapsibleState.None);
    this.clusterName = clusterName;
    this.databaseName = databaseName;
    this.functionInfo = functionInfo;
    this.id = `function:${clusterName}:${databaseName}:${functionInfo.name}`;
    this.contextValue = "function";
    this.iconPath = new vscode4.ThemeIcon("symbol-function");
    if (functionInfo.parameters) {
      this.description = functionInfo.parameters;
    }
    if (functionInfo.description) {
      this.tooltip = functionInfo.description;
    }
  }
};
var EntityGroupTreeItem = class extends vscode4.TreeItem {
  constructor(clusterName, databaseName, groupInfo) {
    const hasEntities = groupInfo.entities && groupInfo.entities.length > 0;
    super(groupInfo.name, hasEntities ? vscode4.TreeItemCollapsibleState.Collapsed : vscode4.TreeItemCollapsibleState.None);
    this.clusterName = clusterName;
    this.databaseName = databaseName;
    this.groupInfo = groupInfo;
    this.id = `entityGroup:${clusterName}:${databaseName}:${groupInfo.name}`;
    this.contextValue = "entityGroup";
    this.iconPath = new vscode4.ThemeIcon("symbol-namespace");
    if (groupInfo.description) {
      this.tooltip = groupInfo.description;
    }
    this.command = { command: "kusto.selectEntity", title: "Select Entity", arguments: [this] };
  }
};
var EntityGroupMemberTreeItem = class extends vscode4.TreeItem {
  constructor(clusterName, databaseName, groupName, entityName) {
    super(entityName, vscode4.TreeItemCollapsibleState.None);
    this.clusterName = clusterName;
    this.databaseName = databaseName;
    this.groupName = groupName;
    this.entityName = entityName;
    this.id = `entityGroupMember:${clusterName}:${databaseName}:${groupName}:${entityName}`;
    this.contextValue = "entityGroupMember";
    this.iconPath = new vscode4.ThemeIcon("symbol-reference");
  }
};
var GraphModelTreeItem = class extends vscode4.TreeItem {
  constructor(clusterName, databaseName, graphInfo) {
    super(graphInfo.name, vscode4.TreeItemCollapsibleState.None);
    this.clusterName = clusterName;
    this.databaseName = databaseName;
    this.graphInfo = graphInfo;
    this.id = `graphModel:${clusterName}:${databaseName}:${graphInfo.name}`;
    this.contextValue = "graphModel";
    this.iconPath = new vscode4.ThemeIcon("type-hierarchy");
  }
};
function getEntitiesAndSubfolders(entities, currentPath) {
  const directEntities = [];
  const subfolderPathSet = /* @__PURE__ */ new Set();
  for (const entity of entities) {
    const folder = entity.folder?.replace(/\\/g, "/");
    if (!folder) {
      if (currentPath === "") {
        directEntities.push(entity);
      }
      continue;
    }
    if (currentPath === "") {
      const firstSlash = folder.indexOf("/");
      const topFolder = firstSlash === -1 ? folder : folder.substring(0, firstSlash);
      subfolderPathSet.add(topFolder);
    } else if (folder === currentPath) {
      directEntities.push(entity);
    } else if (folder.startsWith(currentPath + "/")) {
      const remaining = folder.substring(currentPath.length + 1);
      const nextSlash = remaining.indexOf("/");
      const nextSegment = nextSlash === -1 ? remaining : remaining.substring(0, nextSlash);
      subfolderPathSet.add(currentPath + "/" + nextSegment);
    }
  }
  return {
    directEntities,
    subfolderPaths: Array.from(subfolderPathSet).sort(
      (a, b) => a.localeCompare(b, void 0, { sensitivity: "base" })
    )
  };
}
function buildEntityFolderChildren(entities, currentPath, clusterName, databaseName, folderType, createTreeItem) {
  const { directEntities, subfolderPaths } = getEntitiesAndSubfolders(entities, currentPath);
  const folderItems = subfolderPaths.map(
    (p) => new EntityFolderTreeItem(clusterName, databaseName, folderType, p)
  );
  const entityItems = directEntities.map((e) => createTreeItem(e)).sort((a, b) => {
    const aLabel = typeof a.label === "string" ? a.label : a.label?.label ?? "";
    const bLabel = typeof b.label === "string" ? b.label : b.label?.label ?? "";
    return aLabel.localeCompare(bLabel, void 0, { sensitivity: "base" });
  });
  return [...folderItems, ...entityItems];
}
var KustoConnectionsProvider = class {
  constructor() {
    this._onDidChangeTreeData = new vscode4.EventEmitter();
    this.onDidChangeTreeData = this._onDidChangeTreeData.event;
  }
  refresh() {
    this._onDidChangeTreeData.fire(void 0);
  }
  refreshItem(item) {
    this._onDidChangeTreeData.fire(item);
  }
  // =========================================================================
  // UI Prompt Methods
  // =========================================================================
  /**
   * Prompts the user to add a new server.
   * @param groupName Optional group name to add the server to
   */
  async promptAddServer(groupName) {
    const connectionString = await vscode4.window.showInputBox({
      prompt: "Enter the connection URL or connection string",
      placeHolder: "e.g., myserver.kusto.windows.net"
    });
    if (!connectionString) {
      return;
    }
    const cluster = await getHostName(connectionString);
    const displayName = getDisplayName(cluster);
    const server = {
      connection: connectionString,
      cluster
    };
    if (displayName) {
      server.displayName = displayName;
    }
    const serverKind = await fetchServerKind(connectionString);
    if (serverKind) {
      server.serverKind = serverKind;
    }
    await addServer(server, groupName);
  }
  /**
   * Prompts the user to add a new server group.
   */
  async promptAddServerGroup() {
    const name = await vscode4.window.showInputBox({
      prompt: "Enter the group name",
      placeHolder: "e.g., Production Clusters"
    });
    if (!name) {
      return;
    }
    const group = {
      name,
      servers: []
    };
    await addServerGroup(group);
  }
  /**
   * Prompts the user to select a destination and moves the server.
   */
  async promptMoveServer(cluster, displayName, currentGroupName) {
    const destinations = [];
    if (currentGroupName) {
      destinations.push({
        label: "$(home) Root",
        description: "Move to root level"
      });
    }
    for (const item of getServersAndGroups().items) {
      if (isServerGroup(item) && item.name !== currentGroupName) {
        destinations.push({
          label: `$(folder) ${item.name}`,
          description: `Move to group "${item.name}"`
        });
      }
    }
    if (destinations.length === 0) {
      vscode4.window.showInformationMessage("No other destinations available. Create a group first.");
      return;
    }
    const selection = await vscode4.window.showQuickPick(destinations, {
      placeHolder: `Select destination for "${displayName}"`
    });
    if (!selection) {
      return;
    }
    let targetGroupName;
    if (!selection.label.startsWith("$(home)")) {
      targetGroupName = selection.label.replace("$(folder) ", "");
    }
    await moveServer(cluster, currentGroupName, targetGroupName);
  }
  /**
   * Prompts the user to edit a server's connection string.
   */
  async promptEditServer(connection, cluster, displayName, groupName) {
    const newConnectionString = await vscode4.window.showInputBox({
      prompt: "Edit the connection URL or connection string",
      value: connection,
      placeHolder: "e.g., myserver.kusto.windows.net"
    });
    if (!newConnectionString) {
      return;
    }
    const newCluster = await getHostName(newConnectionString);
    let newDisplayName;
    if (newCluster === cluster) {
      newDisplayName = displayName;
    } else {
      if (newCluster.endsWith(".kusto.windows.net")) {
        newDisplayName = newCluster.substring(0, newCluster.indexOf(".kusto.windows.net"));
      } else {
        newDisplayName = newCluster;
      }
    }
    const serverKind = await fetchServerKind(newConnectionString);
    await editServer(cluster, newConnectionString, newDisplayName, serverKind ?? void 0, groupName);
  }
  /**
   * Prompts the user to rename a server's display name.
   */
  async promptRenameServer(cluster, currentDisplayName, groupName) {
    const newDisplayName = await vscode4.window.showInputBox({
      prompt: "Enter a new display name",
      value: currentDisplayName
    });
    if (newDisplayName === void 0 || newDisplayName === currentDisplayName) {
      return;
    }
    await renameServer(cluster, newDisplayName, groupName);
  }
  /**
   * Prompts the user to rename a server group.
   */
  async promptRenameServerGroup(currentName) {
    const newName = await vscode4.window.showInputBox({
      prompt: "Enter a new group name",
      value: currentName
    });
    if (!newName || newName === currentName) {
      return;
    }
    await renameServerGroup(currentName, newName);
  }
  // =========================================================================
  // Tree Data Provider Implementation
  // =========================================================================
  getTreeItem(element) {
    return element;
  }
  getChildren(element) {
    if (!element) {
      const items = [];
      items.push(new NoConnectionTreeItem());
      const groups = [];
      const servers = [];
      for (const item of getServersAndGroups().items) {
        if (isServerGroup(item)) {
          groups.push(new ServerGroupTreeItem(item));
        } else {
          servers.push(new ServerTreeItem(item.connection, item.cluster, item.displayName, void 0, item.serverKind));
        }
      }
      groups.sort(
        (a, b) => a.groupInfo.name.localeCompare(b.groupInfo.name, void 0, { sensitivity: "base" })
      );
      servers.sort((a, b) => {
        const aName = a.displayName ?? a.clusterName;
        const bName = b.displayName ?? b.clusterName;
        return aName.localeCompare(bName, void 0, { sensitivity: "base" });
      });
      items.push(...servers);
      items.push(...groups);
      return items;
    }
    if (element instanceof ServerGroupTreeItem) {
      const servers = element.groupInfo.servers.map(
        (s) => new ServerTreeItem(s.connection, s.cluster, s.displayName, element.groupInfo.name, s.serverKind)
      );
      servers.sort((a, b) => {
        const aName = a.displayName ?? a.clusterName;
        const bName = b.displayName ?? b.clusterName;
        return aName.localeCompare(bName, void 0, { sensitivity: "base" });
      });
      return servers;
    }
    if (element instanceof ServerTreeItem) {
      const databases = getClusterDatabases(element.clusterName);
      const items = databases?.map((db) => new DatabaseTreeItem(element.clusterName, db.name)) ?? [];
      items.sort(
        (a, b) => a.databaseName.localeCompare(b.databaseName, void 0, { sensitivity: "base" })
      );
      return items;
    }
    if (element instanceof DatabaseTreeItem) {
      return getDatabaseSchema(element.clusterName, element.databaseName).then((dbInfo) => {
        const folders = [];
        if (dbInfo?.tables && dbInfo.tables.length > 0) {
          folders.push(new DatabaseFolderTreeItem(element.clusterName, element.databaseName, "tables", "Tables", "table"));
        }
        if (dbInfo?.externalTables && dbInfo.externalTables.length > 0) {
          folders.push(new DatabaseFolderTreeItem(element.clusterName, element.databaseName, "externalTables", "External Tables", "cloud"));
        }
        if (dbInfo?.materializedViews && dbInfo.materializedViews.length > 0) {
          folders.push(new DatabaseFolderTreeItem(element.clusterName, element.databaseName, "materializedViews", "Materialized Views", "eye"));
        }
        if (dbInfo?.functions && dbInfo.functions.length > 0) {
          folders.push(new DatabaseFolderTreeItem(element.clusterName, element.databaseName, "functions", "Functions", "symbol-function"));
        }
        if (dbInfo?.entityGroups && dbInfo.entityGroups.length > 0) {
          folders.push(new DatabaseFolderTreeItem(element.clusterName, element.databaseName, "entityGroups", "Entity Groups", "symbol-namespace"));
        }
        if (dbInfo?.graphModels && dbInfo.graphModels.length > 0) {
          folders.push(new DatabaseFolderTreeItem(element.clusterName, element.databaseName, "graphModels", "Graph Models", "type-hierarchy"));
        }
        return folders;
      });
    }
    if (element instanceof DatabaseFolderTreeItem) {
      return getDatabaseSchema(element.clusterName, element.databaseName).then((dbInfo) => {
        if (!dbInfo) return [];
        switch (element.folderType) {
          case "tables":
            return buildEntityFolderChildren(
              dbInfo.tables ?? [],
              "",
              element.clusterName,
              element.databaseName,
              "tables",
              (t) => new TableTreeItem(element.clusterName, element.databaseName, t)
            );
          case "externalTables":
            return buildEntityFolderChildren(
              dbInfo.externalTables ?? [],
              "",
              element.clusterName,
              element.databaseName,
              "externalTables",
              (t) => new ExternalTableTreeItem(element.clusterName, element.databaseName, t)
            );
          case "materializedViews":
            return buildEntityFolderChildren(
              dbInfo.materializedViews ?? [],
              "",
              element.clusterName,
              element.databaseName,
              "materializedViews",
              (v) => new MaterializedViewTreeItem(element.clusterName, element.databaseName, v)
            );
          case "functions":
            return buildEntityFolderChildren(
              dbInfo.functions ?? [],
              "",
              element.clusterName,
              element.databaseName,
              "functions",
              (f) => new FunctionTreeItem(element.clusterName, element.databaseName, f)
            );
          case "entityGroups":
            return buildEntityFolderChildren(
              dbInfo.entityGroups ?? [],
              "",
              element.clusterName,
              element.databaseName,
              "entityGroups",
              (g) => new EntityGroupTreeItem(element.clusterName, element.databaseName, g)
            );
          case "graphModels":
            return (dbInfo.graphModels ?? []).map((g) => new GraphModelTreeItem(element.clusterName, element.databaseName, g)).sort((a, b) => a.graphInfo.name.localeCompare(b.graphInfo.name, void 0, { sensitivity: "base" }));
          default:
            return [];
        }
      });
    }
    if (element instanceof EntityFolderTreeItem) {
      return getDatabaseSchema(element.clusterName, element.databaseName).then((dbInfo) => {
        if (!dbInfo) return [];
        switch (element.folderType) {
          case "tables":
            return buildEntityFolderChildren(
              dbInfo.tables ?? [],
              element.folderPath,
              element.clusterName,
              element.databaseName,
              "tables",
              (t) => new TableTreeItem(element.clusterName, element.databaseName, t)
            );
          case "externalTables":
            return buildEntityFolderChildren(
              dbInfo.externalTables ?? [],
              element.folderPath,
              element.clusterName,
              element.databaseName,
              "externalTables",
              (t) => new ExternalTableTreeItem(element.clusterName, element.databaseName, t)
            );
          case "materializedViews":
            return buildEntityFolderChildren(
              dbInfo.materializedViews ?? [],
              element.folderPath,
              element.clusterName,
              element.databaseName,
              "materializedViews",
              (v) => new MaterializedViewTreeItem(element.clusterName, element.databaseName, v)
            );
          case "functions":
            return buildEntityFolderChildren(
              dbInfo.functions ?? [],
              element.folderPath,
              element.clusterName,
              element.databaseName,
              "functions",
              (f) => new FunctionTreeItem(element.clusterName, element.databaseName, f)
            );
          case "entityGroups":
            return buildEntityFolderChildren(
              dbInfo.entityGroups ?? [],
              element.folderPath,
              element.clusterName,
              element.databaseName,
              "entityGroups",
              (g) => new EntityGroupTreeItem(element.clusterName, element.databaseName, g)
            );
          default:
            return [];
        }
      });
    }
    if (element instanceof TableTreeItem) {
      return (element.tableInfo.columns ?? []).map((c) => new ColumnTreeItem(element.clusterName, element.databaseName, element.tableInfo.name, "table", c));
    }
    if (element instanceof ExternalTableTreeItem) {
      return (element.tableInfo.columns ?? []).map((c) => new ColumnTreeItem(element.clusterName, element.databaseName, element.tableInfo.name, "externalTable", c));
    }
    if (element instanceof MaterializedViewTreeItem) {
      return (element.viewInfo.columns ?? []).map((c) => new ColumnTreeItem(element.clusterName, element.databaseName, element.viewInfo.name, "materializedView", c));
    }
    if (element instanceof EntityGroupTreeItem) {
      return (element.groupInfo.entities ?? []).map((e) => new EntityGroupMemberTreeItem(element.clusterName, element.databaseName, element.groupInfo.name, e));
    }
    return [];
  }
  getParent(element) {
    if (element instanceof TableTreeItem) {
      const folder = element.tableInfo.folder;
      if (folder) {
        return new EntityFolderTreeItem(element.clusterName, element.databaseName, "tables", folder);
      }
      return new DatabaseFolderTreeItem(element.clusterName, element.databaseName, "tables", "Tables", "table");
    }
    if (element instanceof ExternalTableTreeItem) {
      const folder = element.tableInfo.folder;
      if (folder) {
        return new EntityFolderTreeItem(element.clusterName, element.databaseName, "externalTables", folder);
      }
      return new DatabaseFolderTreeItem(element.clusterName, element.databaseName, "externalTables", "External Tables", "cloud");
    }
    if (element instanceof MaterializedViewTreeItem) {
      const folder = element.viewInfo.folder;
      if (folder) {
        return new EntityFolderTreeItem(element.clusterName, element.databaseName, "materializedViews", folder);
      }
      return new DatabaseFolderTreeItem(element.clusterName, element.databaseName, "materializedViews", "Materialized Views", "eye");
    }
    if (element instanceof FunctionTreeItem) {
      const folder = element.functionInfo.folder;
      if (folder) {
        return new EntityFolderTreeItem(element.clusterName, element.databaseName, "functions", folder);
      }
      return new DatabaseFolderTreeItem(element.clusterName, element.databaseName, "functions", "Functions", "symbol-function");
    }
    if (element instanceof EntityGroupTreeItem) {
      const folder = element.groupInfo.folder;
      if (folder) {
        return new EntityFolderTreeItem(element.clusterName, element.databaseName, "entityGroups", folder);
      }
      return new DatabaseFolderTreeItem(element.clusterName, element.databaseName, "entityGroups", "Entity Groups", "symbol-namespace");
    }
    if (element instanceof EntityGroupMemberTreeItem) {
      const dbInfo = getDatabaseInfo2(element.clusterName, element.databaseName);
      const groupInfo = dbInfo?.entityGroups?.find((g) => g.name === element.groupName);
      if (groupInfo) {
        return new EntityGroupTreeItem(element.clusterName, element.databaseName, groupInfo);
      }
      return void 0;
    }
    if (element instanceof GraphModelTreeItem) {
      return new DatabaseFolderTreeItem(element.clusterName, element.databaseName, "graphModels", "Graph Models", "type-hierarchy");
    }
    if (element instanceof EntityFolderTreeItem) {
      const lastSlash = element.folderPath.lastIndexOf("/");
      if (lastSlash !== -1) {
        const parentPath = element.folderPath.substring(0, lastSlash);
        return new EntityFolderTreeItem(element.clusterName, element.databaseName, element.folderType, parentPath);
      }
      const folderLabels = {
        "tables": ["Tables", "table"],
        "externalTables": ["External Tables", "cloud"],
        "materializedViews": ["Materialized Views", "eye"],
        "functions": ["Functions", "symbol-function"],
        "entityGroups": ["Entity Groups", "symbol-namespace"],
        "graphModels": ["Graph Models", "type-hierarchy"]
      };
      const [label, icon] = folderLabels[element.folderType];
      return new DatabaseFolderTreeItem(element.clusterName, element.databaseName, element.folderType, label, icon);
    }
    if (element instanceof DatabaseFolderTreeItem) {
      return new DatabaseTreeItem(element.clusterName, element.databaseName);
    }
    if (element instanceof DatabaseTreeItem) {
      for (const item of getServersAndGroups().items) {
        if (isServerGroup(item)) {
          const server = item.servers.find((s) => s.cluster === element.clusterName);
          if (server) {
            return new ServerTreeItem(server.connection, server.cluster, server.displayName, item.name, server.serverKind);
          }
        } else if (item.cluster === element.clusterName) {
          return new ServerTreeItem(item.connection, item.cluster, item.displayName, void 0, item.serverKind);
        }
      }
      return void 0;
    }
    if (element instanceof ServerTreeItem) {
      if (element.groupName) {
        const group = getServersAndGroups().items.find(
          (item) => isServerGroup(item) && item.name === element.groupName
        );
        if (group) {
          return new ServerGroupTreeItem(group);
        }
      }
      return void 0;
    }
    return void 0;
  }
};
var ENTITY_DRAG_MIME = "application/vnd.kusto.entity";
var KustoDragAndDropController = class {
  constructor() {
    this.dropMimeTypes = ["application/vnd.code.tree.kusto.connections"];
    this.dragMimeTypes = ["application/vnd.code.tree.kusto.connections", ENTITY_DRAG_MIME];
  }
  async handleDrag(source, dataTransfer, token) {
    isDragging = true;
    setTimeout(() => {
      isDragging = false;
    }, 100);
    const servers = source.filter((item) => item instanceof ServerTreeItem);
    if (servers.length > 0) {
      const dragData = servers.map((s) => ({
        cluster: s.clusterName,
        groupName: s.groupName
      }));
      dataTransfer.set("application/vnd.code.tree.kusto.connections", new vscode4.DataTransferItem(dragData));
    }
    if (source.length === 1) {
      const item = source[0];
      if (isEntityTreeItem(item)) {
        const entityType = getEntityType(item);
        if (entityType) {
          const entityName = getEntityName(item);
          const metadata = {
            cluster: getEntityCluster(item),
            database: getEntityDatabase(item),
            entityType,
            entityName
          };
          dataTransfer.set(ENTITY_DRAG_MIME, new vscode4.DataTransferItem(JSON.stringify(metadata)));
        }
      }
    }
  }
  async handleDrop(target, dataTransfer, token) {
    const transferItem = dataTransfer.get("application/vnd.code.tree.kusto.connections");
    if (!transferItem) {
      return;
    }
    const dragData = transferItem.value;
    if (!dragData || dragData.length === 0) {
      return;
    }
    let targetGroupName;
    if (target instanceof ServerGroupTreeItem) {
      targetGroupName = target.groupInfo.name;
    } else if (target instanceof ServerTreeItem && target.groupName) {
      targetGroupName = target.groupName;
    }
    for (const item of dragData) {
      if (item.groupName === targetGroupName) {
        continue;
      }
      await moveServer(item.cluster, item.groupName, targetGroupName);
    }
  }
};
var KustoDocumentDropEditProvider = class {
  async provideDocumentDropEdits(document, position, dataTransfer, token) {
    const transferItem = dataTransfer.get(ENTITY_DRAG_MIME);
    if (!transferItem || !languageClient2) {
      return void 0;
    }
    const raw = await transferItem.asString();
    if (!raw || token.isCancellationRequested) {
      return void 0;
    }
    let metadata;
    try {
      metadata = JSON.parse(raw);
    } catch {
      return void 0;
    }
    const expression = await getEntityAsExpression(
      languageClient2,
      metadata.cluster,
      metadata.database,
      metadata.entityType,
      metadata.entityName,
      document.uri.toString()
    );
    if (!expression || token.isCancellationRequested) {
      return void 0;
    }
    const edit = new vscode4.DocumentDropEdit(expression);
    return edit;
  }
};
var languageClient2;
var connectionsProvider;
var treeView;
var programmaticSelectionCount = 0;
var isTreeSelectionChangingConnection = false;
var isFetchingDatabasesForTreeUpdate = false;
var isDragging = false;
var lastValidSelection;
function isProgrammaticSelection() {
  return programmaticSelectionCount > 0;
}
async function programmaticSelectTreeItem(item, options) {
  if (!treeView) return;
  programmaticSelectionCount++;
  try {
    await treeView.reveal(item, options);
  } finally {
    programmaticSelectionCount--;
  }
}
async function findServerTreeItem(cluster) {
  if (!connectionsProvider) return void 0;
  const clusterLower = cluster.toLowerCase();
  const rootItems = await connectionsProvider.getChildren();
  for (const item of rootItems) {
    if (item instanceof ServerGroupTreeItem) {
      const groupItems = await connectionsProvider.getChildren(item);
      for (const sItem of groupItems) {
        if (sItem instanceof ServerTreeItem && sItem.clusterName.toLowerCase() === clusterLower) {
          return sItem;
        }
      }
    } else if (item instanceof ServerTreeItem && item.clusterName.toLowerCase() === clusterLower) {
      return item;
    }
  }
  return void 0;
}
async function findTreeItem(cluster, database) {
  if (!connectionsProvider || !languageClient2) return void 0;
  let serverItem = await findServerTreeItem(cluster);
  if (!serverItem) {
    return void 0;
  }
  if (!database) {
    return serverItem;
  }
  isFetchingDatabasesForTreeUpdate = true;
  try {
    await fetchDatabasesForCluster(serverItem.clusterName);
  } finally {
    isFetchingDatabasesForTreeUpdate = false;
  }
  await new Promise((resolve) => setTimeout(resolve, 100));
  serverItem = await findServerTreeItem(cluster);
  if (!serverItem) {
    return void 0;
  }
  const dbItems = await connectionsProvider.getChildren(serverItem);
  for (const dbItem of dbItems) {
    if (dbItem instanceof DatabaseTreeItem && dbItem.databaseName.toLowerCase() === database.toLowerCase()) {
      return dbItem;
    }
  }
  return serverItem;
}
async function selectNeutralTreeItem() {
  if (!connectionsProvider || !treeView) return;
  try {
    const rootItems = await connectionsProvider.getChildren();
    const noConnectionItem = rootItems.find((item) => item instanceof NoConnectionTreeItem);
    if (noConnectionItem) {
      try {
        await programmaticSelectTreeItem(noConnectionItem, { select: true, focus: false, expand: false });
        lastValidSelection = noConnectionItem;
      } catch {
      }
    }
  } catch {
  }
}
async function updateTreeSelectionForActiveDocument() {
  if (!treeView) return;
  const editor = vscode4.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "kusto") {
    await selectNeutralTreeItem();
    return;
  }
  const uri = editor.document.uri.toString();
  const connection = await getDocumentConnection(uri);
  if (!connection?.cluster) {
    await selectNeutralTreeItem();
    return;
  }
  if (languageClient2) {
    const serverKind = findServerInfo(connection.cluster)?.serverKind ?? null;
    await languageClient2.sendNotification("kusto/documentConnectionChanged", {
      uri,
      cluster: connection.cluster,
      database: connection.database || null,
      serverKind
    });
  }
  try {
    const itemToSelect = await findTreeItem(connection.cluster, connection.database);
    if (itemToSelect) {
      try {
        const currentEditor = vscode4.window.activeTextEditor;
        if (currentEditor && currentEditor.document.languageId === "kusto") {
          await programmaticSelectTreeItem(itemToSelect, { select: true, focus: false, expand: false });
          lastValidSelection = itemToSelect;
        }
      } catch {
      }
    }
  } catch {
  }
}

// features/documentPanels.ts
var vscode9 = __toESM(require("vscode"));

// features/resultsPanel.ts
var vscode7 = __toESM(require("vscode"));

// features/resultsViewer.ts
var vscode5 = __toESM(require("vscode"));

// features/markdown.ts
function resultDataToMarkdown(data, tableName) {
  if (!data.tables || data.tables.length === 0) {
    return "";
  }
  const table = tableName ? data.tables.find((t) => t.name === tableName) : data.tables[0];
  if (!table) {
    return "";
  }
  return resultTableToMarkdown(table);
}
function resultTableToMarkdown(table) {
  if (table.columns.length === 0) {
    return "";
  }
  const lines = [];
  const headers = table.columns.map((col) => escapeMarkdown(col.name));
  lines.push(`| ${headers.join(" | ")} |`);
  const separators = table.columns.map(() => "---");
  lines.push(`| ${separators.join(" | ")} |`);
  for (const row of table.rows) {
    const cells = row.map((cell) => escapeMarkdown(formatCellValue(cell)));
    lines.push(`| ${cells.join(" | ")} |`);
  }
  return lines.join("\n");
}
function formatCellValue(value) {
  if (value === null || value === void 0) {
    return "";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}
function escapeMarkdown(text) {
  return text.replace(/\|/g, "\\|").replace(/\n/g, " ").replace(/\r/g, "");
}

// features/html.ts
var DEFAULT_OPTIONS = {
  tableAttributes: 'border="1" style="border-collapse: collapse; width: fit-content;"',
  thAttributes: 'style="padding: 4px; font-weight: bold;"',
  tdAttributes: 'style="padding: 4px; white-space: nowrap; overflow-x: auto; max-width: 500px;"'
};
function resultDataToHtml(data, tableName, options) {
  const tables = tableName ? data.tables.filter((t) => t.name === tableName) : data.tables;
  return {
    tables: tables.map((t) => ({
      name: t.name,
      html: resultTableToHtml(t, options),
      rowCount: t.rows.length
    })),
    hasChart: !!data.chartOptions
  };
}
function resultTableToHtml(table, options) {
  if (table.columns.length === 0) {
    return "";
  }
  const { tableAttributes, thAttributes, tdAttributes } = { ...DEFAULT_OPTIONS, ...options };
  const lines = [];
  lines.push(`<table ${tableAttributes}>`);
  lines.push("<thead><tr>");
  for (const col of table.columns) {
    lines.push(`<th ${thAttributes}>${escapeHtml(col.name)}</th>`);
  }
  lines.push("</tr></thead>");
  lines.push("<tbody>");
  for (const row of table.rows) {
    lines.push("<tr>");
    for (const cell of row) {
      lines.push(`<td ${tdAttributes}>${escapeHtml(formatCellValue2(cell))}</td>`);
    }
    lines.push("</tr>");
  }
  lines.push("</tbody>");
  lines.push("</table>");
  return lines.join("");
}
function formatCellValue2(value) {
  if (value === null || value === void 0) {
    return "";
  }
  if (typeof value === "object") {
    return JSON.stringify(value);
  }
  return String(value);
}
function escapeHtml(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

// features/resultsViewer.ts
var resultEditorViewType = "kusto.resultEditor";
var languageClient3;
var chartWebviews = /* @__PURE__ */ new Set();
var activeChartWebview;
var chartKinds = [
  "AreaChart",
  "BarChart",
  "Card",
  "ColumnChart",
  "Graph",
  "LineChart",
  "PieChart",
  "PivotChart",
  "Plotly",
  "Sankey",
  "ScatterChart",
  "StackedAreaChart",
  "3DChart",
  "TimeLadderChart",
  "TimeLineChart",
  "TimeLineWithAnomalyChart",
  "TimePivot",
  "TreeMap"
];
var chartModes = ["Default", "Unstacked", "Stacked", "Stacked100"];
var axisTypes = ["Linear", "Log"];
var editorStates = /* @__PURE__ */ new Map();
function registerChartWebview(panel) {
  chartWebviews.add(panel);
  activeChartWebview = panel;
  panel.onDidChangeViewState(() => {
    if (panel.active) {
      activeChartWebview = panel;
    }
  });
  panel.onDidDispose(() => {
    chartWebviews.delete(panel);
    if (activeChartWebview === panel) {
      activeChartWebview = void 0;
    }
  });
}
function activate3(context, client2) {
  languageClient3 = client2;
  context.subscriptions.push(
    vscode5.window.registerCustomEditorProvider(
      resultEditorViewType,
      new ResultEditorProvider(),
      { supportsMultipleEditorsPerDocument: false }
    )
  );
  context.subscriptions.push(
    vscode5.commands.registerCommand("kusto.copyChartLight", () => {
      activeChartWebview?.webview.postMessage({ command: "copyChartLight" });
    }),
    vscode5.commands.registerCommand("kusto.copyChartDark", () => {
      activeChartWebview?.webview.postMessage({ command: "copyChartDark" });
    }),
    vscode5.commands.registerCommand("kusto.toggleChartEditor", () => {
      activeChartWebview?.webview.postMessage({ command: "toggleEditPanel" });
    })
  );
}
function isDarkMode() {
  const colorTheme = vscode5.window.activeColorTheme;
  return colorTheme.kind === vscode5.ColorThemeKind.Dark || colorTheme.kind === vscode5.ColorThemeKind.HighContrast;
}
function handleChartWebviewMessage(message) {
  if (message.command === "copyChartError") {
    vscode5.window.showErrorMessage(`Chart copy failed in webview: ${message.error}`);
    return true;
  }
  if (message.command === "copyChartResult" && message.pngDataUrl) {
    onCopyChartMessage(message.pngDataUrl, message.svgDataUrl);
    return true;
  }
  return false;
}
function onCopyChartMessage(pngDataUrl, svgDataUrl) {
  try {
    const pngBase64 = pngDataUrl.split(",")[1] ?? "";
    const items = [
      { format: "PNG", data: pngBase64, encoding: "base64" }
    ];
    if (svgDataUrl) {
      const svgPart = svgDataUrl.split(",").slice(1).join(",");
      const svgText = decodeURIComponent(svgPart);
      items.push({ format: "image/svg+xml", data: svgText });
    }
    copyToClipboard(items).catch((error) => {
      vscode5.window.showErrorMessage(`Failed to copy chart to clipboard: ${error}`);
    });
  } catch (error) {
    vscode5.window.showErrorMessage(`Failed to copy chart: ${error}`);
  }
}
async function saveResults(source) {
  const resultData = source.data;
  const saveUri = await vscode5.window.showSaveDialog({
    filters: { "Kusto Query Results": ["kqr"] },
    defaultUri: vscode5.Uri.file("results.kqr")
  });
  if (!saveUri) {
    return void 0;
  }
  const finalUri = saveUri.path.endsWith(".kqr") ? saveUri : saveUri.with({ path: saveUri.path + ".kqr" });
  const content = JSON.stringify(resultData, null, 2);
  const openDoc = vscode5.workspace.textDocuments.find(
    (doc) => doc.uri.fsPath.toLowerCase() === finalUri.fsPath.toLowerCase()
  );
  if (openDoc) {
    const fullRange = new vscode5.Range(
      openDoc.positionAt(0),
      openDoc.positionAt(openDoc.getText().length)
    );
    const edit = new vscode5.WorkspaceEdit();
    edit.replace(openDoc.uri, fullRange, content);
    await vscode5.workspace.applyEdit(edit);
    await openDoc.save();
    return { uri: finalUri, alreadyOpen: true };
  }
  await vscode5.workspace.fs.writeFile(finalUri, Buffer.from(content, "utf-8"));
  return { uri: finalUri, alreadyOpen: false };
}
var chartMessageHandlerScript = `
<script>
    (function() {
        const vscodeApi = (typeof acquireVsCodeApi === 'function') ? acquireVsCodeApi() : null;
        if (!vscodeApi) return;
        // Expose for edit panel script
        window._vscodeApi = vscodeApi;

        // Track the element under the cursor when context menu opens (for copyCell)
        let lastContextTarget = null;
        document.addEventListener('contextmenu', function(event) {
            lastContextTarget = event.target;
        });

        // Notify the extension when the active view tab changes
        document.addEventListener('click', function(e) {
            const btn = e.target.closest ? e.target.closest('.view-toggle button[data-view]') : null;
            if (btn) {
                vscodeApi.postMessage({ command: 'viewChanged', viewId: btn.getAttribute('data-view') });
            }
        });

        // Colors for Copy (Light): dark text/axes on white bg
        const lightCopyColors = {
            'font.color': '#333333',
            'xaxis.color': '#333333',
            'xaxis.linecolor': '#333333',
            'xaxis.tickfont.color': '#333333',
            'xaxis.title.font.color': '#333333',
            'xaxis.gridcolor': 'rgba(0,0,0,0.15)',
            'yaxis.color': '#333333',
            'yaxis.linecolor': '#333333',
            'yaxis.tickfont.color': '#333333',
            'yaxis.title.font.color': '#333333',
            'yaxis.gridcolor': 'rgba(0,0,0,0.15)',
            'legend.font.color': '#333333'
        };

        // Colors for Copy (Dark): white text/axes on black bg
        const darkCopyColors = {
            'font.color': '#ffffff',
            'xaxis.color': '#ffffff',
            'xaxis.linecolor': '#ffffff',
            'xaxis.tickfont.color': '#ffffff',
            'xaxis.title.font.color': '#ffffff',
            'xaxis.gridcolor': 'rgba(255,255,255,0.15)',
            'yaxis.color': '#ffffff',
            'yaxis.linecolor': '#ffffff',
            'yaxis.tickfont.color': '#ffffff',
            'yaxis.title.font.color': '#ffffff',
            'yaxis.gridcolor': 'rgba(255,255,255,0.15)',
            'legend.font.color': '#ffffff'
        };

        // Transparent background for SVG
        const transparentBg = {
            paper_bgcolor: 'rgba(0,0,0,0)',
            plot_bgcolor: 'rgba(0,0,0,0)'
        };

        // Solid backgrounds for bitmap
        const whiteBg = {
            paper_bgcolor: '#ffffff',
            plot_bgcolor: '#ffffff'
        };

        const blackBg = {
            paper_bgcolor: '#000000',
            plot_bgcolor: '#000000'
        };

        window.addEventListener('message', async event => {
            const message = event.data;

            if (message.command === 'copyCell') {
                const cell = lastContextTarget ? lastContextTarget.closest('td, th') : null;
                if (cell) {
                    vscodeApi.postMessage({ command: 'copyText', text: cell.innerText });
                }
                return;
            }

            if (message.command === 'copyChartLight' || message.command === 'copyChartDark') {
                try {
                    const dark = message.command === 'copyChartDark';
                    const colors = dark ? darkCopyColors : lightCopyColors;
                    const solidBg = dark ? blackBg : whiteBg;

                    // Find the Plotly chart div
                    const plotDiv = document.querySelector('.js-plotly-plot') || document.querySelector('.plotly-graph-div');
                    if (plotDiv && typeof Plotly !== 'undefined') {
                        const width = plotDiv.offsetWidth;
                        const height = plotDiv.offsetHeight;
                        const layout = plotDiv.layout || {};

                        // Save original layout properties before any changes
                        const savedLayout = {
                            paper_bgcolor: layout.paper_bgcolor,
                            plot_bgcolor: layout.plot_bgcolor,
                            'font.color': layout.font?.color ?? null,
                            'xaxis.color': layout.xaxis?.color ?? null,
                            'xaxis.linecolor': layout.xaxis?.linecolor ?? null,
                            'xaxis.tickfont.color': layout.xaxis?.tickfont?.color ?? null,
                            'xaxis.title.font.color': layout.xaxis?.title?.font?.color ?? null,
                            'xaxis.gridcolor': layout.xaxis?.gridcolor ?? null,
                            'yaxis.color': layout.yaxis?.color ?? null,
                            'yaxis.linecolor': layout.yaxis?.linecolor ?? null,
                            'yaxis.tickfont.color': layout.yaxis?.tickfont?.color ?? null,
                            'yaxis.title.font.color': layout.yaxis?.title?.font?.color ?? null,
                            'yaxis.gridcolor': layout.yaxis?.gridcolor ?? null,
                            'legend.font.color': layout.legend?.font?.color ?? null
                        };

                        // SVG: transparent background with appropriate text colors
                        await Plotly.relayout(plotDiv, { ...transparentBg, ...colors });
                        const svgDataUrl = await Plotly.toImage(plotDiv, { format: 'svg', width: width, height: height });

                        // PNG: solid background with matching text colors (scale 2x for readability)
                        await Plotly.relayout(plotDiv, solidBg);
                        const pngDataUrl = await Plotly.toImage(plotDiv, { format: 'png', width: width, height: height, scale: 2 });

                        // Restore original layout
                        await Plotly.relayout(plotDiv, savedLayout);

                        vscodeApi.postMessage({ command: 'copyChartResult', pngDataUrl: pngDataUrl, svgDataUrl: svgDataUrl });
                    } else {
                        // Fallback: use canvas if available
                        const canvas = document.querySelector('canvas');
                        if (canvas) {
                            const dataUrl = canvas.toDataURL('image/png');
                            vscodeApi.postMessage({ command: 'copyChartResult', pngDataUrl: dataUrl });
                        }
                    }
                } catch (err) {
                    vscodeApi.postMessage({ command: 'copyChartError', error: String(err) });
                }
            }
        });
    })();
</script>`;
function injectChartMessageHandler(html) {
  let result = html;
  const contextAttr = ` data-vscode-context='{"preventDefaultContextMenuItems": true}'`;
  if (result.includes("<body")) {
    result = result.replace("<body", "<body" + contextAttr);
  } else if (result.includes("<html")) {
    result = result.replace("<html>", "<html><body" + contextAttr + ">");
    if (result.includes("</html>")) {
      result = result.replace("</html>", "</body></html>");
    }
  }
  if (result.includes("</html>")) {
    return result.replace("</html>", chartMessageHandlerScript + "</html>");
  }
  if (result.includes("</body>")) {
    return result.replace("</body>", chartMessageHandlerScript + "</body>");
  }
  return result + chartMessageHandlerScript;
}
var ResultEditorProvider = class {
  async resolveCustomTextEditor(document, webviewPanel, _token) {
    webviewPanel.webview.options = {
      enableScripts: true
    };
    registerChartWebview(webviewPanel);
    const updateChartContext = () => {
      if (webviewPanel.active) {
        const state = editorStates.get(webviewPanel);
        const hasChart = !!state?.resultData?.chartOptions;
        vscode5.commands.executeCommand("setContext", "kusto.resultEditorHasChart", hasChart);
      }
    };
    webviewPanel.onDidChangeViewState(() => updateChartContext());
    let chartOptionsTimer;
    let ignoringSelfEdit = false;
    webviewPanel.webview.onDidReceiveMessage(async (message) => {
      if (message.command === "viewChanged" && typeof message.viewId === "string") {
        const state = editorStates.get(webviewPanel);
        if (state) {
          state.activeView = message.viewId;
        }
        return;
      }
      if (message.command === "copyText" && typeof message.text === "string") {
        vscode5.env.clipboard.writeText(message.text);
        return;
      }
      if (message.command === "chartOptionsChanged" && message.chartOptions) {
        const state = editorStates.get(webviewPanel);
        if (!state) {
          return;
        }
        state.chartOptionsOverride = message.chartOptions;
        if (chartOptionsTimer) {
          clearTimeout(chartOptionsTimer);
        }
        chartOptionsTimer = setTimeout(async () => {
          await this.updateChartOnly(state, webviewPanel);
          const updatedData = { ...state.resultData, chartOptions: state.chartOptionsOverride };
          const content = JSON.stringify(updatedData, null, 2);
          const fullRange = new vscode5.Range(
            document.positionAt(0),
            document.positionAt(document.getText().length)
          );
          const edit = new vscode5.WorkspaceEdit();
          edit.replace(document.uri, fullRange, content);
          ignoringSelfEdit = true;
          await vscode5.workspace.applyEdit(edit);
          ignoringSelfEdit = false;
        }, 600);
        return;
      }
      handleChartWebviewMessage(message);
    });
    await this.updateWebview(document, webviewPanel);
    const changeSubscription = vscode5.workspace.onDidChangeTextDocument(async (e) => {
      if (e.document.uri.toString() === document.uri.toString()) {
        if (ignoringSelfEdit) {
          return;
        }
        await this.updateWebview(document, webviewPanel);
      }
    });
    const themeSubscription = vscode5.window.onDidChangeActiveColorTheme(async () => {
      await this.updateWebview(document, webviewPanel);
    });
    webviewPanel.onDidDispose(() => {
      if (chartOptionsTimer) {
        clearTimeout(chartOptionsTimer);
      }
      editorStates.delete(webviewPanel);
      vscode5.commands.executeCommand("setContext", "kusto.resultEditorHasChart", false);
      changeSubscription.dispose();
      themeSubscription.dispose();
    });
  }
  async updateWebview(document, webviewPanel) {
    const text = document.getText();
    let resultData;
    try {
      resultData = JSON.parse(text);
    } catch {
      webviewPanel.webview.html = "<html><body><p>Invalid result file.</p></body></html>";
      return;
    }
    if (!resultData?.tables?.length) {
      webviewPanel.webview.html = "<html><body><p>No result data found.</p></body></html>";
      return;
    }
    const darkMode = isDarkMode();
    const [dataResult, chartResult] = await Promise.all([
      Promise.resolve(resultDataToHtml(resultData)),
      resultData.chartOptions ? getChartAsHtml(languageClient3, resultData, darkMode) : Promise.resolve(null)
    ]);
    const hasChart = !!chartResult?.html;
    const hasTable = !!dataResult?.tables?.length;
    if (webviewPanel.active) {
      vscode5.commands.executeCommand("setContext", "kusto.resultEditorHasChart", hasChart);
    }
    if (!hasTable && !hasChart) {
      webviewPanel.webview.html = "<html><body><p>Failed to render results.</p></body></html>";
      return;
    }
    const tableNames = (dataResult?.tables ?? []).map((t) => t.name);
    const firstActiveView = hasChart ? "chart" : "table-0";
    const existingState = editorStates.get(webviewPanel);
    editorStates.set(webviewPanel, {
      resultData,
      tableNames,
      activeView: existingState?.activeView ?? firstActiveView
    });
    const chartOptions = existingState?.chartOptionsOverride ?? resultData.chartOptions;
    const columnNames = resultData.tables[0]?.columns?.map((c) => c.name) ?? [];
    const html = this.buildDualViewHtml(dataResult, chartResult?.html, hasChart, chartOptions, columnNames);
    webviewPanel.webview.html = injectChartMessageHandler(html);
  }
  async updateChartOnly(state, webviewPanel) {
    const chartOptions = state.chartOptionsOverride ?? state.resultData.chartOptions;
    if (!chartOptions) {
      return;
    }
    const modifiedData = {
      ...state.resultData,
      chartOptions
    };
    const darkMode = isDarkMode();
    const chartResult = await getChartAsHtml(languageClient3, modifiedData, darkMode);
    if (chartResult?.html) {
      webviewPanel.webview.postMessage({
        command: "updateChart",
        chartBodyHtml: this.extractBody(chartResult.html)
      });
    }
  }
  buildDualViewHtml(dataResult, chartHtml, hasChart, chartOptions, columnNames) {
    const tables = dataResult?.tables ?? [];
    const tableContents = tables.map(
      (t, i) => `<div id="table-${i}" class="view-content" data-vscode-context='{"chartVisible": false, "preventDefaultContextMenuItems": true}'>${t.html}</div>`
    ).join("");
    const chartContent = chartHtml ? this.extractBody(chartHtml) : "";
    const chartHead = chartHtml ? this.extractHead(chartHtml) : "";
    const chartButton = hasChart ? `<button class="active" data-view="chart" onclick="switchView('chart')">Chart</button>` : "";
    let tableButtons;
    if (tables.length === 1) {
      tableButtons = `<button${hasChart ? "" : ' class="active"'} data-view="table-0" onclick="switchView('table-0')">Data</button>`;
    } else {
      tableButtons = tables.map(
        (t, i) => `<button${!hasChart && i === 0 ? ' class="active"' : ""} data-view="table-${i}" onclick="switchView('table-${i}')">${this.escapeHtml(t.name)} (${t.rowCount})</button>`
      ).join("");
    }
    const firstActiveView = hasChart ? "chart" : "table-0";
    const editPanelHtml = hasChart ? this.buildEditPanelHtml(chartOptions, columnNames ?? []) : "";
    return `<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    ${chartHead}
    <style>
        body {
            margin: 0;
            padding: 0;
            font-family: var(--vscode-font-family, sans-serif);
            font-size: var(--vscode-font-size, 13px);
            color: var(--vscode-foreground);
            background: var(--vscode-editor-background);
        }
        .view-toggle {
            display: flex;
            align-items: center;
            border-bottom: 1px solid var(--vscode-panel-border, #444);
            background: var(--vscode-editor-background);
            position: sticky;
            top: 0;
            z-index: 100;
        }
        .view-toggle button {
            padding: 6px 16px;
            border: none;
            background: transparent;
            color: var(--vscode-foreground);
            cursor: pointer;
            border-bottom: 2px solid transparent;
            font-family: inherit;
            font-size: inherit;
        }
        .view-toggle button:hover {
            background: var(--vscode-list-hoverBackground, #2a2d2e);
        }
        .view-toggle button.active {
            border-bottom-color: var(--vscode-focusBorder, #007acc);
            color: var(--vscode-foreground);
        }
        .view-toggle .spacer { flex: 1; }
        .main-area {
            display: flex;
            height: calc(100vh - 33px);
        }
        .content-area {
            flex: 1;
            overflow: hidden;
            min-width: 0;
        }
        .view-content { display: none; height: 100%; overflow: auto; }
        .view-content.active { display: block; }
        #chart-view { padding: 0; }
        /* Edit panel */
        .edit-panel {
            display: none;
            width: 280px;
            min-width: 280px;
            border-left: 1px solid var(--vscode-panel-border, #444);
            background: var(--vscode-sideBar-background, var(--vscode-editor-background));
            overflow-y: auto;
            padding: 12px;
            box-sizing: border-box;
        }
        .edit-panel.visible { display: block; }
        .edit-panel h3 {
            margin: 0 0 12px 0;
            font-size: 13px;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: var(--vscode-foreground);
            opacity: 0.8;
        }
        .edit-panel .field { margin-bottom: 10px; }
        .edit-panel label {
            display: block;
            margin-bottom: 3px;
            font-size: 11px;
            color: var(--vscode-descriptionForeground, var(--vscode-foreground));
        }
        .edit-panel select,
        .edit-panel input[type="text"] {
            width: 100%;
            padding: 4px 6px;
            background: var(--vscode-input-background, #3c3c3c);
            color: var(--vscode-input-foreground, var(--vscode-foreground));
            border: 1px solid var(--vscode-input-border, #555);
            border-radius: 2px;
            font-family: inherit;
            font-size: inherit;
            box-sizing: border-box;
        }
        .edit-panel select:focus,
        .edit-panel input[type="text"]:focus {
            outline: 1px solid var(--vscode-focusBorder, #007acc);
            outline-offset: -1px;
        }
        .edit-panel .checkbox-field {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        .edit-panel .checkbox-field label {
            display: inline;
            margin-bottom: 0;
        }
        .edit-panel .column-picker {
            display: flex;
            gap: 4px;
        }
        .edit-panel .column-picker select {
            flex: 1;
            min-width: 0;
        }
        .edit-panel .column-picker button {
            padding: 2px 8px;
            cursor: pointer;
            background: var(--vscode-button-background, #0e639c);
            color: var(--vscode-button-foreground, #fff);
            border: none;
            border-radius: 2px;
            font-size: inherit;
        }
        .edit-panel .column-picker button:hover {
            background: var(--vscode-button-hoverBackground, #1177bb);
        }
        .edit-panel .column-list {
            list-style: none;
            padding: 0;
            margin: 4px 0 0 0;
            max-height: 120px;
            overflow-y: auto;
            border: 1px solid var(--vscode-input-border, #555);
            border-radius: 2px;
            background: var(--vscode-input-background, #3c3c3c);
        }
        .edit-panel .column-list:empty {
            display: none;
        }
        .edit-panel .column-list li {
            display: flex;
            align-items: center;
            padding: 2px 4px;
            gap: 2px;
        }
        .edit-panel .column-list li:hover {
            background: var(--vscode-list-hoverBackground, #2a2d2e);
        }
        .edit-panel .column-list li span {
            flex: 1;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
        .edit-panel .column-list li button {
            background: none;
            border: none;
            color: var(--vscode-foreground, #ccc);
            cursor: pointer;
            padding: 0 2px;
            font-size: 14px;
            line-height: 1;
            opacity: 0.7;
        }
        .edit-panel .column-list li button:hover {
            opacity: 1;
        }
        /* Table styles */
        table { border-collapse: collapse; width: 100%; }
        th, td {
            padding: 4px 8px;
            text-align: left;
            border: 1px solid var(--vscode-editorGroup-border, var(--vscode-panel-border, #666));
            white-space: nowrap;
        }
        th {
            position: sticky;
            top: 0;
            background: var(--vscode-editorWidget-background, var(--vscode-editor-background));
            z-index: 1;
            font-weight: 600;
        }
    </style>
</head>
<body>
    <div class="view-toggle">
        ${chartButton}
        ${tableButtons}
    </div>
    <div class="main-area">
        <div class="content-area">
            ${hasChart ? `<div id="chart" class="view-content${firstActiveView === "chart" ? " active" : ""}" data-vscode-context='{"chartVisible": true, "preventDefaultContextMenuItems": true}'>${chartContent}</div>` : ""}
            ${tableContents}
        </div>
        ${editPanelHtml}
    </div>
    <script>
        // Set initial active table view
        (function() {
            var first = document.getElementById('${firstActiveView}');
            if (first) first.classList.add('active');
        })();

        // Track whether the user wants the edit panel open
        var editPanelUserVisible = false;

        function switchView(viewId) {
            document.querySelectorAll('.view-content').forEach(function(el) { el.classList.remove('active'); });
            document.querySelectorAll('.view-toggle button[data-view]').forEach(function(el) { el.classList.remove('active'); });
            var target = document.getElementById(viewId);
            if (target) target.classList.add('active');
            var btn = document.querySelector('.view-toggle button[data-view="' + viewId + '"]');
            if (btn) btn.classList.add('active');
            // Hide/restore edit panel based on view and user preference
            var editPanel = document.getElementById('edit-panel');
            if (editPanel) {
                if (viewId.startsWith('table-')) {
                    editPanel.classList.remove('visible');
                } else if (editPanelUserVisible) {
                    editPanel.classList.add('visible');
                }
            }
            // Trigger Plotly resize when switching to chart
            if (viewId === 'chart') {
                setTimeout(function() {
                    var plotDiv = document.querySelector('#chart .js-plotly-plot') || document.querySelector('#chart .plotly-graph-div');
                    if (plotDiv && typeof Plotly !== 'undefined') {
                        Plotly.Plots.resize(plotDiv);
                    }
                }, 50);
            }
        }

        function addColumnItem(pickerId, listId) {
            var picker = document.getElementById(pickerId);
            var list = document.getElementById(listId);
            if (!picker || !list || !picker.value) return;
            var val = picker.value;
            var li = document.createElement('li');
            var span = document.createElement('span');
            span.textContent = val;
            li.appendChild(span);
            var upBtn = document.createElement('button');
            upBtn.innerHTML = '&uarr;';
            upBtn.title = 'Move up';
            upBtn.onclick = function() { moveColumnItem(upBtn, -1); };
            li.appendChild(upBtn);
            var downBtn = document.createElement('button');
            downBtn.innerHTML = '&darr;';
            downBtn.title = 'Move down';
            downBtn.onclick = function() { moveColumnItem(downBtn, 1); };
            li.appendChild(downBtn);
            var removeBtn = document.createElement('button');
            removeBtn.innerHTML = '&times;';
            removeBtn.title = 'Remove';
            removeBtn.onclick = function() { removeColumnItem(removeBtn); };
            li.appendChild(removeBtn);
            list.appendChild(li);
            onChartOptionChanged();
        }

        function removeColumnItem(btn) {
            var li = btn.closest('li');
            if (li) { li.remove(); onChartOptionChanged(); }
        }

        function moveColumnItem(btn, dir) {
            var li = btn.closest('li');
            if (!li) return;
            var list = li.parentNode;
            if (dir === -1 && li.previousElementSibling) {
                list.insertBefore(li, li.previousElementSibling);
            } else if (dir === 1 && li.nextElementSibling) {
                list.insertBefore(li.nextElementSibling, li);
            }
            onChartOptionChanged();
        }

        function toggleEditPanel() {
            var panel = document.getElementById('edit-panel');
            if (!panel) return;
            editPanelUserVisible = !editPanelUserVisible;
            panel.classList.toggle('visible', editPanelUserVisible);
            // Resize chart when panel toggles
            setTimeout(function() {
                var plotDiv = document.querySelector('#chart .js-plotly-plot') || document.querySelector('#chart .plotly-graph-div');
                if (plotDiv && typeof Plotly !== 'undefined') {
                    Plotly.Plots.resize(plotDiv);
                }
            }, 50);
        }

        // Collect current chart options from the edit panel form
        function collectChartOptions() {
            var opts = {};
            var kind = document.getElementById('opt-kind');
            if (kind) opts.kind = kind.value;
            var mode = document.getElementById('opt-mode');
            if (mode && mode.value) opts.mode = mode.value;
            var legend = document.getElementById('opt-legend');
            if (legend) opts.legend = legend.checked ? 'Visible' : 'Hidden';
            var title = document.getElementById('opt-title');
            if (title && title.value) opts.title = title.value;
            var xTitle = document.getElementById('opt-xTitle');
            if (xTitle && xTitle.value) opts.xTitle = xTitle.value;
            var yTitle = document.getElementById('opt-yTitle');
            if (yTitle && yTitle.value) opts.yTitle = yTitle.value;
            var xColumn = document.getElementById('opt-xColumn');
            if (xColumn && xColumn.value) opts.xColumn = xColumn.value;
            var yColList = document.getElementById('opt-yColumns-list');
            if (yColList) { var items = Array.from(yColList.querySelectorAll('li span')).map(function(s) { return s.textContent; }); if (items.length) opts.yColumns = items; }
            var seriesList = document.getElementById('opt-series-list');
            if (seriesList) { var si = Array.from(seriesList.querySelectorAll('li span')).map(function(s) { return s.textContent; }); if (si.length) opts.series = si; }
            var xAxis = document.getElementById('opt-xAxis');
            if (xAxis && xAxis.value) opts.xAxis = xAxis.value;
            var yAxis = document.getElementById('opt-yAxis');
            if (yAxis && yAxis.value) opts.yAxis = yAxis.value;
            var xmin = document.getElementById('opt-xmin');
            if (xmin && xmin.value) opts.xmin = xmin.value;
            var xmax = document.getElementById('opt-xmax');
            if (xmax && xmax.value) opts.xmax = xmax.value;
            var ymin = document.getElementById('opt-ymin');
            if (ymin && ymin.value) opts.ymin = ymin.value;
            var ymax = document.getElementById('opt-ymax');
            if (ymax && ymax.value) opts.ymax = ymax.value;
            var accumulate = document.getElementById('opt-accumulate');
            if (accumulate) opts.accumulate = accumulate.checked;
            return opts;
        }

        // Notify extension when any chart option changes
        function onChartOptionChanged() {
            if (window._vscodeApi) {
                window._vscodeApi.postMessage({ command: 'chartOptionsChanged', chartOptions: collectChartOptions() });
            }
        }

        // Listen for updateChart and toggleEditPanel messages from the extension
        window.addEventListener('message', function(event) {
            var msg = event.data;
            if (msg && msg.command === 'toggleEditPanel') {
                toggleEditPanel();
                return;
            }
            if (msg && msg.command === 'updateChart' && msg.chartBodyHtml) {
                var chartDiv = document.getElementById('chart');
                if (chartDiv) {
                    chartDiv.innerHTML = msg.chartBodyHtml;
                    // Re-execute any script tags in the new content
                    chartDiv.querySelectorAll('script').forEach(function(oldScript) {
                        var newScript = document.createElement('script');
                        if (oldScript.src) {
                            newScript.src = oldScript.src;
                        } else {
                            newScript.textContent = oldScript.textContent;
                        }
                        oldScript.parentNode.replaceChild(newScript, oldScript);
                    });
                }
            }
        });
    </script>
</body>
</html>`;
  }
  buildEditPanelHtml(chartOptions, columnNames) {
    const opts = chartOptions ?? { kind: "ColumnChart" };
    const allKinds = chartKinds.includes(opts.kind) ? chartKinds : [opts.kind, ...chartKinds];
    const kindOptions = allKinds.map(
      (k) => `<option value="${k}"${k === opts.kind ? " selected" : ""}>${this.escapeHtml(k)}</option>`
    ).join("");
    const currentMode = opts.mode ?? "";
    const allModes = !currentMode || chartModes.includes(currentMode) ? chartModes : [currentMode, ...chartModes];
    const modeOptions = ["", ...allModes].map(
      (m) => `<option value="${m}"${m === currentMode ? " selected" : ""}>${m || "(default)"}</option>`
    ).join("");
    const legendChecked = (opts.legend ?? "Visible") !== "Hidden" ? " checked" : "";
    const xColOptions = ["", ...columnNames].map(
      (c) => `<option value="${this.escapeHtml(c)}"${c === (opts.xColumn ?? "") ? " selected" : ""}>${c || "(auto)"}</option>`
    ).join("");
    const currentXAxis = opts.xAxis ?? "";
    const allAxisTypes = currentXAxis && !axisTypes.includes(currentXAxis) ? [currentXAxis, ...axisTypes] : axisTypes;
    const xAxisOptions = ["", ...allAxisTypes].map(
      (a) => `<option value="${a}"${a === currentXAxis ? " selected" : ""}>${a || "(default)"}</option>`
    ).join("");
    const currentYAxis = opts.yAxis ?? "";
    const allYAxisTypes = currentYAxis && !axisTypes.includes(currentYAxis) ? [currentYAxis, ...axisTypes] : axisTypes;
    const yAxisOptions = ["", ...allYAxisTypes].map(
      (a) => `<option value="${a}"${a === currentYAxis ? " selected" : ""}>${a || "(default)"}</option>`
    ).join("");
    const allColOptions = columnNames.map(
      (c) => `<option value="${this.escapeHtml(c)}">${this.escapeHtml(c)}</option>`
    ).join("");
    const yColumnsItems = (opts.yColumns ?? []).map(
      (c) => `<li><span>${this.escapeHtml(c)}</span><button onclick="moveColumnItem(this,-1)" title="Move up">&uarr;</button><button onclick="moveColumnItem(this,1)" title="Move down">&darr;</button><button onclick="removeColumnItem(this)" title="Remove">&times;</button></li>`
    ).join("");
    const seriesItems = (opts.series ?? []).map(
      (c) => `<li><span>${this.escapeHtml(c)}</span><button onclick="moveColumnItem(this,-1)" title="Move up">&uarr;</button><button onclick="moveColumnItem(this,1)" title="Move down">&darr;</button><button onclick="removeColumnItem(this)" title="Remove">&times;</button></li>`
    ).join("");
    return `<div id="edit-panel" class="edit-panel">
            <h3>Chart Options</h3>
            <div class="field">
                <label for="opt-kind">Chart Type</label>
                <select id="opt-kind" onchange="onChartOptionChanged()">${kindOptions}</select>
            </div>
            <div class="field">
                <label for="opt-mode">Mode</label>
                <select id="opt-mode" onchange="onChartOptionChanged()">${modeOptions}</select>
            </div>
            <div class="field checkbox-field">
                <input type="checkbox" id="opt-legend"${legendChecked} onchange="onChartOptionChanged()">
                <label for="opt-legend">Show Legend</label>
            </div>
            <div class="field">
                <label for="opt-title">Title</label>
                <input type="text" id="opt-title" value="${this.escapeHtml(opts.title ?? "")}" oninput="onChartOptionChanged()">
            </div>
            <div class="field">
                <label for="opt-xColumn">X Column</label>
                <select id="opt-xColumn" onchange="onChartOptionChanged()">${xColOptions}</select>
            </div>
            <div class="field">
                <label>Y Columns</label>
                <div class="column-picker">
                    <select id="opt-yColumns-picker">${allColOptions}</select>
                    <button onclick="addColumnItem('opt-yColumns-picker','opt-yColumns-list')">Add</button>
                </div>
                <ul id="opt-yColumns-list" class="column-list">${yColumnsItems}</ul>
            </div>
            <div class="field">
                <label>Series</label>
                <div class="column-picker">
                    <select id="opt-series-picker">${allColOptions}</select>
                    <button onclick="addColumnItem('opt-series-picker','opt-series-list')">Add</button>
                </div>
                <ul id="opt-series-list" class="column-list">${seriesItems}</ul>
            </div>
            <div class="field">
                <label for="opt-xTitle">X-Axis Title</label>
                <input type="text" id="opt-xTitle" value="${this.escapeHtml(opts.xTitle ?? "")}" oninput="onChartOptionChanged()">
            </div>
            <div class="field">
                <label for="opt-yTitle">Y-Axis Title</label>
                <input type="text" id="opt-yTitle" value="${this.escapeHtml(opts.yTitle ?? "")}" oninput="onChartOptionChanged()">
            </div>
            <div class="field">
                <label for="opt-xAxis">X-Axis Type</label>
                <select id="opt-xAxis" onchange="onChartOptionChanged()">${xAxisOptions}</select>
            </div>
            <div class="field">
                <label for="opt-yAxis">Y-Axis Type</label>
                <select id="opt-yAxis" onchange="onChartOptionChanged()">${yAxisOptions}</select>
            </div>
            <div class="field">
                <label for="opt-xmin">X Min</label>
                <input type="text" id="opt-xmin" value="${this.escapeHtml(String(opts.xmin ?? ""))}" oninput="onChartOptionChanged()">
            </div>
            <div class="field">
                <label for="opt-xmax">X Max</label>
                <input type="text" id="opt-xmax" value="${this.escapeHtml(String(opts.xmax ?? ""))}" oninput="onChartOptionChanged()">
            </div>
            <div class="field">
                <label for="opt-ymin">Y Min</label>
                <input type="text" id="opt-ymin" value="${this.escapeHtml(String(opts.ymin ?? ""))}" oninput="onChartOptionChanged()">
            </div>
            <div class="field">
                <label for="opt-ymax">Y Max</label>
                <input type="text" id="opt-ymax" value="${this.escapeHtml(String(opts.ymax ?? ""))}" oninput="onChartOptionChanged()">
            </div>
            <div class="field checkbox-field">
                <input type="checkbox" id="opt-accumulate"${opts.accumulate ? " checked" : ""} onchange="onChartOptionChanged()">
                <label for="opt-accumulate">Accumulate</label>
            </div>
        </div>`;
  }
  buildTabbedTableHtml(tables) {
    if (tables.length === 1) {
      return tables[0].html;
    }
    const tabs = tables.map(
      (t, i) => `<button class="table-tab${i === 0 ? " active" : ""}" onclick="switchTable(${i})">${this.escapeHtml(t.name)} (${t.rowCount})</button>`
    ).join("");
    const contents = tables.map(
      (t, i) => `<div class="table-content${i === 0 ? " active" : ""}">${t.html}</div>`
    ).join("");
    return `<div class="table-tabs">${tabs}</div>${contents}`;
  }
  extractBody(html) {
    const match = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
    return match?.[1] ?? html;
  }
  extractHead(html) {
    const match = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    return match?.[1] ?? "";
  }
  escapeHtml(text) {
    return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }
};
function getActiveEditorState() {
  if (!activeChartWebview?.active) {
    return void 0;
  }
  return editorStates.get(activeChartWebview);
}
function getActiveTableName(state) {
  const match = state.activeView.match(/^table-(\d+)$/);
  if (match) {
    const idx = parseInt(match[1], 10);
    return state.tableNames[idx];
  }
  return state.tableNames[0];
}
function copyCellFromEditor() {
  const state = getActiveEditorState();
  if (!state || !activeChartWebview) {
    return false;
  }
  activeChartWebview.webview.postMessage({ command: "copyCell" });
  return true;
}
async function copyDataFromEditor() {
  const state = getActiveEditorState();
  if (!state) {
    return false;
  }
  const tableName = getActiveTableName(state);
  const htmlResult = resultDataToHtml(state.resultData, tableName);
  const html = htmlResult?.tables[0]?.html;
  const markdown = resultDataToMarkdown(state.resultData, tableName);
  if (html) {
    copyToClipboard([
      { format: "HTML Format", data: formatCfHtml(html), encoding: "utf8" },
      { format: "Text", data: markdown || html, encoding: "text" }
    ]);
  } else if (markdown) {
    vscode5.env.clipboard.writeText(markdown);
  }
  return true;
}
async function copyTableAsExpressionFromEditor() {
  const state = getActiveEditorState();
  if (!state) {
    return false;
  }
  try {
    const tableName = getActiveTableName(state);
    const result = await getDataAsExpression(languageClient3, state.resultData, tableName);
    if (result?.expression) {
      await vscode5.env.clipboard.writeText(result.expression);
    }
  } catch (error) {
    vscode5.window.showErrorMessage(`Failed to copy as expression: ${error}`);
  }
  return true;
}

// features/chartPanel.ts
var vscode6 = __toESM(require("vscode"));
var chartPanel;
var currentResultData;
var languageClient4;
function activate4(context, client2) {
  languageClient4 = client2;
  context.subscriptions.push(
    vscode6.commands.registerCommand("kusto.saveChart", () => saveChartFromPanel()),
    vscode6.commands.registerCommand("kusto.moveChartToMain", () => moveChartToMain())
  );
}
function hasChartPanel() {
  return chartPanel !== void 0;
}
async function displayChart(client2, resultData) {
  currentResultData = resultData;
  const darkMode = isDarkMode();
  const chartResult = resultData ? await getChartAsHtml(client2, resultData, darkMode) : null;
  showChart(chartResult?.html);
}
function getChartViewColumn() {
  return vscode6.ViewColumn.Beside;
}
function moveChartToMain() {
  if (chartPanel) {
    const isMain = chartPanel.viewColumn === vscode6.ViewColumn.One;
    chartPanel.reveal(isMain ? vscode6.ViewColumn.Beside : vscode6.ViewColumn.One, false);
  }
}
function showChart(chartHtml) {
  if (chartHtml) {
    const viewColumn = getChartViewColumn();
    if (!chartPanel) {
      chartPanel = vscode6.window.createWebviewPanel(
        "kusto",
        "Chart",
        {
          viewColumn,
          preserveFocus: true
        },
        {
          enableScripts: true,
          retainContextWhenHidden: true
        }
      );
      vscode6.commands.executeCommand("kusto.chartPanelStateChanged");
      registerChartWebview(chartPanel);
      chartPanel.webview.onDidReceiveMessage(async (message) => {
        handleChartWebviewMessage(message);
      });
      chartPanel.onDidDispose(() => {
        chartPanel = void 0;
        currentResultData = void 0;
        vscode6.commands.executeCommand("kusto.chartPanelStateChanged");
      });
    }
    chartPanel.webview.html = injectChartMessageHandler(chartHtml);
    chartPanel.reveal(viewColumn, true);
  } else if (chartPanel) {
    try {
      chartPanel.dispose();
    } catch {
    }
    chartPanel = void 0;
    currentResultData = void 0;
    vscode6.commands.executeCommand("kusto.chartPanelStateChanged");
  }
}
async function saveChartFromPanel() {
  if (!currentResultData) {
    vscode6.window.showWarningMessage("No chart data available to save.");
    return;
  }
  const result = await saveResults({ data: currentResultData });
  if (result) {
    chartPanel?.dispose();
    await vscode6.commands.executeCommand("vscode.openWith", result.uri, "kusto.resultEditor", vscode6.ViewColumn.One);
  }
}

// features/resultsPanel.ts
var resultsView;
var lastResultData;
var lastTableNames = [];
var activeTabIndex = 0;
var languageClient5;
function activate5(context, client2) {
  languageClient5 = client2;
  vscode7.window.registerWebviewViewProvider("kusto.resultsView", {
    resolveWebviewView(webviewView) {
      resultsView = webviewView;
      webviewView.webview.options = {
        enableScripts: true,
        // Prevent the view from being disposed when hidden (e.g., when chart panel has focus)
        enableForms: false
      };
      webviewView.onDidDispose(() => {
        resultsView = void 0;
      });
      webviewView.webview.onDidReceiveMessage((message) => {
        if (message.command === "tabChanged" && typeof message.index === "number") {
          activeTabIndex = message.index;
          sendExpressionToWebview();
        }
        if (message.command === "requestExpression") {
          sendExpressionToWebview();
        }
        if (message.command === "copyText" && typeof message.text === "string") {
          vscode7.env.clipboard.writeText(message.text);
        }
      });
      webviewView.webview.html = "<html>no results</html>";
    }
  }, {
    webviewOptions: {
      retainContextWhenHidden: true
      // Keep the view alive even when hidden
    }
  });
  vscode7.commands.executeCommand("kusto.resultsView.focus");
  context.subscriptions.push(
    vscode7.commands.registerCommand("kusto.copyData", () => copyData()),
    vscode7.commands.registerCommand("kusto.copyCell", () => copyCell()),
    vscode7.commands.registerCommand("kusto.copyTableAsExpression", () => copyTableAsExpression(client2)),
    vscode7.commands.registerCommand("kusto.saveResults", () => saveResultsFromPanel(client2))
  );
}
async function displayResults(client2, resultData) {
  const data = resultData ? resultDataToHtml(resultData) : null;
  if (data && data.tables.length > 0) {
    lastResultData = resultData;
    lastTableNames = data.tables.map((t) => t.name);
    activeTabIndex = 0;
    const html = buildTabbedHtml(data.tables);
    const totalRows = data.tables.reduce((sum, t) => sum + t.rowCount, 0);
    await showResultsHtml(html, totalRows, data.hasChart);
    sendExpressionToWebview();
  } else {
    await showResultsHtml("<html>no results</html>", void 0, false);
  }
}
async function saveResultsFromPanel(client2) {
  if (!lastResultData) {
    vscode7.window.showWarningMessage("No result data available to save.");
    return;
  }
  const result = await saveResults({ data: lastResultData });
  if (result) {
    await displayChart(client2, void 0);
    await vscode7.commands.executeCommand("vscode.openWith", result.uri, "kusto.resultEditor", vscode7.ViewColumn.One);
  }
}
async function displayError(error) {
  var htmlMessage = `<html><body><table><tr><td>\u274C</td><td><pre>${escapeHtml2(error.message)}</pre></td></tr></tr><td></td><td><pre>${escapeHtml2(error.details || "")}</pre></td></tr></table></body></html>`;
  await showResultsHtml(htmlMessage, void 0, false, true);
}
var tabStyles = `
<style>
    .tab-bar {
        display: flex;
        border-bottom: 1px solid var(--vscode-panel-border, #444);
        background: var(--vscode-editor-background, #1e1e1e);
        padding: 0;
        margin: 0;
        position: sticky;
        top: 0;
        z-index: 10;
        overflow-x: auto;
        overflow-y: hidden;
        scrollbar-width: thin;
    }
    .tab-button {
        padding: 6px 16px;
        border: none;
        background: transparent;
        color: var(--vscode-foreground, #ccc);
        cursor: pointer;
        font-size: 12px;
        font-family: var(--vscode-font-family, sans-serif);
        border-bottom: 2px solid transparent;
        opacity: 0.7;
        white-space: nowrap;
        flex-shrink: 0;
    }
    .tab-button:hover {
        opacity: 1;
        background: var(--vscode-list-hoverBackground, #2a2d2e);
    }
    .tab-button.active {
        opacity: 1;
        border-bottom-color: var(--vscode-focusBorder, #007acc);
        color: var(--vscode-foreground, #fff);
    }
    .tab-badge {
        margin-left: 6px;
        font-size: 10px;
        opacity: 0.6;
    }
    .tab-content {
        display: none;
    }
    .tab-content.active {
        display: block;
    }
</style>`;
function buildTabbedHtml(tables) {
  if (tables.length === 0) {
    return "<html><body>no results</body></html>";
  }
  if (tables.length === 1) {
    return tables[0].html;
  }
  const tabButtons = tables.map(
    (t, i) => `<button class="tab-button${i === 0 ? " active" : ""}" onclick="switchTab(${i})">${escapeHtml2(t.name)}<span class="tab-badge">(${t.rowCount})</span></button>`
  ).join("\n");
  const tabContents = tables.map(
    (t, i) => `<div class="tab-content${i === 0 ? " active" : ""}">${t.html}</div>`
  ).join("\n");
  return `<html>
<head>${tabStyles}</head>
<body>
<div class="tab-bar">
    ${tabButtons}
</div>
${tabContents}
</body>
</html>`;
}
function escapeHtml2(text) {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
async function showResultsHtml(dataHtml, rowCount, hasChart, hasError) {
  if (!resultsView) {
    await vscode7.commands.executeCommand("kusto.resultsView.focus");
  }
  if (!resultsView) {
    return;
  }
  try {
    resultsView.webview.html = injectMessageHandler(dataHtml);
    if (rowCount) {
      resultsView.badge = {
        tooltip: `${rowCount} rows`,
        value: rowCount
      };
    } else if (hasError) {
      resultsView.badge = {
        tooltip: "Error",
        value: 1
      };
    } else {
      resultsView.badge = void 0;
    }
    if (!hasChart) {
      resultsView.show(true);
    }
  } catch (error) {
    await vscode7.commands.executeCommand("kusto.resultsView.focus");
    if (resultsView) {
      try {
        resultsView.webview.html = injectMessageHandler(dataHtml);
        if (rowCount) {
          resultsView.badge = {
            tooltip: `${rowCount} rows`,
            value: rowCount
          };
        }
        if (!hasChart) {
          resultsView.show(true);
        }
      } catch (retryError) {
        vscode7.window.showErrorMessage(`Failed to display results: ${retryError}`);
      }
    }
  }
}
async function copyCell() {
  if (copyCellFromEditor()) {
    return;
  }
  if (!resultsView) {
    return;
  }
  resultsView.webview.postMessage({ command: "copyCell" });
}
async function copyTableAsExpression(client2) {
  if (await copyTableAsExpressionFromEditor()) {
    return;
  }
  if (!lastResultData) {
    return;
  }
  try {
    const tableName = lastTableNames[activeTabIndex];
    const result = await getDataAsExpression(client2, lastResultData, tableName);
    if (result?.expression) {
      await vscode7.env.clipboard.writeText(result.expression);
    }
  } catch (error) {
    vscode7.window.showErrorMessage(`Failed to copy as expression: ${error}`);
  }
}
async function copyData() {
  if (await copyDataFromEditor()) {
    return;
  }
  if (!languageClient5 || !lastResultData) {
    return;
  }
  const tableName = lastTableNames[activeTabIndex];
  const htmlResult = resultDataToHtml(lastResultData, tableName);
  const html = htmlResult?.tables[0]?.html;
  const markdown = resultDataToMarkdown(lastResultData, tableName);
  if (html) {
    copyToClipboard([
      { format: "HTML Format", data: formatCfHtml(html), encoding: "utf8" },
      { format: "Text", data: markdown || html, encoding: "text" }
    ]);
  } else if (markdown) {
    vscode7.env.clipboard.writeText(markdown);
  }
}
var webviewMessageHandlerScript = `
<script>
    const vscode = acquireVsCodeApi();

    // Tab switching
    let cachedExpression = '';

    function makeTablesDraggable() {
        // Find tables in the active tab, or all tables if no tabs
        const activeTab = document.querySelector('.tab-content.active');
        const container = activeTab || document.body;
        container.querySelectorAll('table').forEach(function(tbl) {
            tbl.setAttribute('draggable', 'true');
        });
    }
    makeTablesDraggable();

    function switchTab(index) {
        document.querySelectorAll('.tab-button').forEach(function(btn, i) {
            btn.classList.toggle('active', i === index);
        });
        document.querySelectorAll('.tab-content').forEach(function(content, i) {
            content.classList.toggle('active', i === index);
        });
        cachedExpression = '';  // Clear stale expression until the new tab's expression arrives
        makeTablesDraggable();  // Re-apply draggable on newly visible tables
        vscode.postMessage({ command: 'tabChanged', index: index });
    }

    // Track the element under the cursor when context menu opens
    let lastContextTarget = null;
    document.addEventListener('contextmenu', event => {
        lastContextTarget = event.target;
    });

    // Drag and drop from result tables: use event delegation so it works
    // regardless of when tables become visible (tab switching).
    // The actual expression text is sent from the extension host and cached here.
    document.addEventListener('dragstart', function(e) {
        const tbl = e.target.closest ? e.target.closest('table') : null;
        if (!tbl) { return; }
        if (cachedExpression) {
            e.dataTransfer.setData('text/plain', cachedExpression);
            e.dataTransfer.effectAllowed = 'copy';
        } else {
            // No expression cached yet \u2014 request it for next time
            vscode.postMessage({ command: 'requestExpression' });
            e.preventDefault();
        }
    });

    window.addEventListener('message', event => {
        const message = event.data;
        if (message.command === 'setExpression' && typeof message.expression === 'string') {
            cachedExpression = message.expression;
        }

        if (message.command === 'copyCell') {
            // Find the closest td or th from the right-clicked element
            const cell = lastContextTarget ? lastContextTarget.closest('td, th') : null;
            if (cell) {
                vscode.postMessage({ command: 'copyText', text: cell.innerText });
            }
        }
    });
</script>`;
async function sendExpressionToWebview() {
  if (!resultsView || !languageClient5 || !lastResultData) {
    return;
  }
  try {
    const tableName = lastTableNames[activeTabIndex];
    const result = await getDataAsExpression(languageClient5, lastResultData, tableName);
    if (result?.expression && resultsView) {
      resultsView.webview.postMessage({ command: "setExpression", expression: result.expression });
    }
  } catch {
  }
}
function injectMessageHandler(html) {
  let result = html;
  const contextAttr = ` data-vscode-context='{"webviewSection": "results"}'`;
  if (result.includes("<body")) {
    result = result.replace("<body", "<body" + contextAttr);
  } else if (result.includes("<html")) {
    result = result.replace("<html>", "<html><body" + contextAttr + ">");
    if (result.includes("</html>")) {
      result = result.replace("</html>", "</body></html>");
    }
  }
  if (result.includes("</html>")) {
    return result.replace("</html>", webviewMessageHandlerScript + "</html>");
  }
  if (result.includes("</body>")) {
    return result.replace("</body>", webviewMessageHandlerScript + "</body>");
  }
  return result + webviewMessageHandlerScript;
}

// features/resultsCache.ts
var vscode8 = __toESM(require("vscode"));
var languageClient6 = null;
var documentCache = /* @__PURE__ */ new Map();
function initialize(client2) {
  languageClient6 = client2;
  vscode8.workspace.onDidCloseTextDocument((document) => {
    if (document.languageId === "kusto") {
      documentCache.delete(document.uri.toString());
    }
  });
}
async function getMinifiedKey(query) {
  if (!languageClient6) {
    return query.replace(/\s+/g, " ").trim();
  }
  const result = await getMinifiedQuery(languageClient6, query);
  return result?.minifiedQuery ?? query.replace(/\s+/g, " ").trim();
}
async function addToCache(uri, queryText, data) {
  let queryCache = documentCache.get(uri);
  if (!queryCache) {
    queryCache = /* @__PURE__ */ new Map();
    documentCache.set(uri, queryCache);
  }
  const minifiedKey = await getMinifiedKey(queryText);
  queryCache.set(minifiedKey, data);
}
async function getFromCache(uri, queryText) {
  const queryCache = documentCache.get(uri);
  if (!queryCache) {
    return null;
  }
  const minifiedKey = await getMinifiedKey(queryText);
  return queryCache.get(minifiedKey) ?? null;
}
async function hasInCache(uri, queryText) {
  const queryCache = documentCache.get(uri);
  if (!queryCache) {
    return false;
  }
  const minifiedKey = await getMinifiedKey(queryText);
  return queryCache.has(minifiedKey);
}

// features/documentPanels.ts
var PASTE_KIND = vscode9.DocumentDropOrPasteEditKind.Text.append("kusto");
var errorRangeDecoration = vscode9.window.createTextEditorDecorationType({
  before: {
    contentText: "\u274C",
    margin: "0 4px 0 0"
  }
});
var codeLensProvider;
function activate6(context, client2) {
  activate5(context, client2);
  activate4(context, client2);
  context.subscriptions.push(
    vscode9.commands.registerCommand("kusto.runQuery", (startLine, startChar, endLine, endChar) => runQuery2(client2, rangeFromArgs(startLine, startChar, endLine, endChar))),
    vscode9.commands.registerCommand("kusto.copyQuery", () => copyQuery(client2)),
    vscode9.commands.registerCommand("kusto.copyQueryTransparent", (startLine, startChar, endLine, endChar) => copyQueryTransparent(client2, rangeFromArgs(startLine, startChar, endLine, endChar))),
    vscode9.commands.registerCommand("kusto.formatQuery", (startLine, startChar, endLine, endChar) => formatQuery(client2, rangeFromArgs(startLine, startChar, endLine, endChar))),
    vscode9.commands.registerCommand("kusto.selectQuery", (startLine, startChar, endLine, endChar) => selectQuery(startLine, startChar, endLine, endChar)),
    vscode9.commands.registerCommand("kusto.showResults", (uri, line, character) => showResults(client2, uri, line, character)),
    vscode9.commands.registerCommand("kusto.refreshDocumentSchema", () => refreshDocumentSchema2(client2))
  );
  codeLensProvider = new KustoCodeLensProvider(client2);
  context.subscriptions.push(
    vscode9.languages.registerCodeLensProvider(
      { language: "kusto" },
      codeLensProvider
    )
  );
  context.subscriptions.push(
    vscode9.languages.registerDocumentPasteEditProvider(
      { language: "kusto" },
      new KustoPasteEditProvider(client2),
      {
        providedPasteEditKinds: [PASTE_KIND],
        pasteMimeTypes: ["text/plain"]
      }
    )
  );
  activateQuerySeparators(context, client2);
  activateSemanticColoring(context, client2);
}
function rangeFromArgs(startLine, startChar, endLine, endChar) {
  if (startLine !== void 0 && startChar !== void 0 && endLine !== void 0 && endChar !== void 0) {
    return { start: { line: startLine, character: startChar }, end: { line: endLine, character: endChar } };
  }
  return void 0;
}
async function runQuery2(client2, queryRange) {
  const editor = vscode9.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "kusto") {
    return;
  }
  if (editor.document.uri.scheme === ENTITY_DEFINITION_SCHEME) {
    return;
  }
  try {
    const uri = editor.document.uri.toString();
    const selection = queryRange ?? {
      start: { line: editor.selection.start.line, character: editor.selection.start.character },
      end: { line: editor.selection.end.line, character: editor.selection.end.character }
    };
    const isZeroLength = selection.start.line === selection.end.line && selection.start.character === selection.end.character;
    const resolvedRange = isZeroLength ? await getQueryRange(client2, uri, selection.start) : selection;
    if (!resolvedRange) {
      return;
    }
    const queryText = editor.document.getText(new vscode9.Range(
      resolvedRange.start.line,
      resolvedRange.start.character,
      resolvedRange.end.line,
      resolvedRange.end.character
    ));
    const connection = await getDocumentConnection(uri);
    const runResult = await runQuery(client2, queryText, connection?.cluster, connection?.database, true);
    if (runResult?.connection || runResult?.cluster) {
      await ensureServer(runResult.connection ?? runResult.cluster);
    }
    if (runResult && runResult.cluster) {
      await setDocumentConnection(uri, runResult.cluster, runResult.database);
    }
    editor.setDecorations(errorRangeDecoration, []);
    if (runResult && runResult.error) {
      await displayError(runResult.error);
      await displayChart(client2, void 0);
      if (runResult.error.range) {
        const r = runResult.error.range;
        const range = new vscode9.Range(r.start.line, r.start.character, r.end.line, r.end.character);
        editor.setDecorations(errorRangeDecoration, [range]);
      }
    } else if (runResult?.data) {
      await addToCache(uri, queryText, runResult.data);
      await displayResults(client2, runResult.data);
      await displayChart(client2, runResult.data);
    }
    codeLensProvider.refresh();
  } catch (error) {
    vscode9.window.showErrorMessage(`Failed to execute query: ${error}`);
  }
}
async function showResults(client2, uri, line, character) {
  try {
    const queryRange = await getQueryRange(client2, uri, { line, character });
    if (!queryRange) {
      return;
    }
    const editor = vscode9.window.activeTextEditor;
    if (!editor) {
      return;
    }
    const queryText = editor.document.getText(new vscode9.Range(
      queryRange.start.line,
      queryRange.start.character,
      queryRange.end.line,
      queryRange.end.character
    ));
    const cachedData = await getFromCache(uri, queryText);
    if (cachedData) {
      await displayResults(client2, cachedData);
      await displayChart(client2, cachedData);
    }
  } catch (error) {
    vscode9.window.showErrorMessage(`Failed to show results: ${error}`);
  }
}
function selectQuery(startLine, startChar, endLine, endChar) {
  const editor = vscode9.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "kusto") {
    return;
  }
  const start = new vscode9.Position(startLine, startChar);
  let end = new vscode9.Position(endLine, endChar);
  if (endLine > startLine && endChar === 0) {
    end = editor.document.lineAt(endLine - 1).range.end;
  }
  editor.selection = new vscode9.Selection(start, end);
  editor.revealRange(new vscode9.Range(start, end));
}
async function copyQuery(client2) {
  const editor = vscode9.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "kusto") {
    return;
  }
  try {
    const cursorPos = editor.selection.active;
    const queryRange = await getQueryRange(
      client2,
      editor.document.uri.toString(),
      { line: cursorPos.line, character: cursorPos.character }
    );
    if (!queryRange) {
      return;
    }
    const previousSelection = editor.selection;
    const range = new vscode9.Range(
      queryRange.start.line,
      queryRange.start.character,
      queryRange.end.line,
      queryRange.end.character
    );
    editor.selection = new vscode9.Selection(range.start, range.end);
    await vscode9.commands.executeCommand("editor.action.clipboardCopyWithSyntaxHighlightingAction");
    editor.selection = previousSelection;
  } catch (error) {
    vscode9.window.showErrorMessage(`Failed to copy query: ${error}`);
  }
}
async function copyQueryTransparent(client2, codeLensRange) {
  const editor = vscode9.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "kusto") {
    return;
  }
  try {
    const uri = editor.document.uri.toString();
    let queryRange = codeLensRange;
    if (!queryRange) {
      const cursorPos = editor.selection.active;
      queryRange = await getQueryRange(
        client2,
        uri,
        { line: cursorPos.line, character: cursorPos.character }
      );
    }
    if (!queryRange) {
      return;
    }
    const selection = {
      start: { line: queryRange.start.line, character: queryRange.start.character },
      end: { line: queryRange.end.line, character: queryRange.end.character }
    };
    const result = await getQueryAsHtml(client2, uri, selection, false);
    if (!result?.html) {
      return;
    }
    const range = new vscode9.Range(
      queryRange.start.line,
      queryRange.start.character,
      queryRange.end.line,
      queryRange.end.character
    );
    const plainText = editor.document.getText(range);
    const items = [
      { format: "HTML Format", data: wrapHtmlForClipboard(result.html) },
      { format: "Text", data: plainText, encoding: "text" }
    ];
    await copyToClipboard(items);
  } catch (error) {
    vscode9.window.showErrorMessage(`Failed to copy query: ${error}`);
  }
}
function wrapHtmlForClipboard(html) {
  const header = "Version:0.9\r\nStartHTML:SSSSSSSSSS\r\nEndHTML:EEEEEEEEEE\r\nStartFragment:FFFFFFFFFF\r\nEndFragment:GGGGGGGGGG\r\n";
  const startFragment = "<!--StartFragment-->";
  const endFragment = "<!--EndFragment-->";
  const body = `<!DOCTYPE html><html><body>${startFragment}${html}${endFragment}</body></html>`;
  const full = header + body;
  const encoder = new TextEncoder();
  const headerBytes = encoder.encode(header).length;
  const startFragOffset = headerBytes + encoder.encode(`<!DOCTYPE html><html><body>${startFragment}`).length - encoder.encode(startFragment).length + encoder.encode(startFragment).length;
  const fullBytes = encoder.encode(full).length;
  const beforeFragment = header + `<!DOCTYPE html><html><body>`;
  const afterStartFragment = beforeFragment + startFragment;
  const beforeEndFragment = afterStartFragment + html;
  const startHtml = encoder.encode(header).length;
  const endHtml = encoder.encode(full).length;
  const startFrag = encoder.encode(afterStartFragment).length;
  const endFrag = encoder.encode(beforeEndFragment).length;
  return full.replace("SSSSSSSSSS", startHtml.toString().padStart(10, "0")).replace("EEEEEEEEEE", endHtml.toString().padStart(10, "0")).replace("FFFFFFFFFF", startFrag.toString().padStart(10, "0")).replace("GGGGGGGGGG", endFrag.toString().padStart(10, "0"));
}
async function formatQuery(client2, codeLensRange) {
  const editor = vscode9.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "kusto") {
    return;
  }
  try {
    let queryRange = codeLensRange;
    if (!queryRange) {
      const cursorPos = editor.selection.active;
      queryRange = await getQueryRange(
        client2,
        editor.document.uri.toString(),
        { line: cursorPos.line, character: cursorPos.character }
      );
    }
    if (!queryRange) {
      return;
    }
    const range = new vscode9.Range(
      queryRange.start.line,
      queryRange.start.character,
      queryRange.end.line,
      queryRange.end.character
    );
    const edits = await vscode9.commands.executeCommand(
      "vscode.executeFormatRangeProvider",
      editor.document.uri,
      range,
      editor.options
    );
    if (edits && edits.length > 0) {
      await editor.edit((editBuilder) => {
        for (const edit of edits) {
          editBuilder.replace(edit.range, edit.newText);
        }
      });
    }
  } catch (error) {
    vscode9.window.showErrorMessage(`Failed to format query: ${error}`);
  }
}
async function refreshDocumentSchema2(client2) {
  const editor = vscode9.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "kusto") {
    return;
  }
  await vscode9.window.withProgress(
    {
      location: vscode9.ProgressLocation.Notification,
      title: "Refreshing schema for referenced databases...",
      cancellable: false
    },
    async () => {
      try {
        const uri = editor.document.uri.toString();
        await refreshDocumentSchema(client2, uri);
      } catch (error) {
        vscode9.window.showErrorMessage(`Failed to refresh schema: ${error}`);
      }
    }
  );
}
var KustoCodeLensProvider = class {
  constructor(client2) {
    this._onDidChangeCodeLenses = new vscode9.EventEmitter();
    this.onDidChangeCodeLenses = this._onDidChangeCodeLenses.event;
    this.client = client2;
  }
  refresh() {
    this._onDidChangeCodeLenses.fire();
  }
  async provideCodeLenses(document) {
    const isEntityDefinition = document.uri.scheme === ENTITY_DEFINITION_SCHEME;
    const result = await getQueryRanges(this.client, document.uri.toString());
    if (!result || !result.ranges.length) {
      return [];
    }
    const lenses = [];
    for (const range of result.ranges) {
      const vsRange = new vscode9.Range(
        range.start.line,
        range.start.character,
        range.end.line,
        range.end.character
      );
      const queryText = document.getText(vsRange);
      if (queryText.trim().length === 0) {
        continue;
      }
      lenses.push(new vscode9.CodeLens(vsRange, {
        title: "\u2B1A Select",
        command: "kusto.selectQuery",
        tooltip: "Select this query",
        arguments: [range.start.line, range.start.character, range.end.line, range.end.character]
      }));
      if (!isEntityDefinition) {
        lenses.push(new vscode9.CodeLens(vsRange, {
          title: "\u25B6 Run",
          command: "kusto.runQuery",
          tooltip: "Run this query",
          arguments: [range.start.line, range.start.character, range.end.line, range.end.character]
        }));
      }
      lenses.push(new vscode9.CodeLens(vsRange, {
        title: "\u{1F4CB} Copy",
        command: "kusto.copyQueryTransparent",
        tooltip: "Copy this query with syntax highlighting",
        arguments: [range.start.line, range.start.character, range.end.line, range.end.character]
      }));
      if (!isEntityDefinition) {
        lenses.push(new vscode9.CodeLens(vsRange, {
          title: "\u270E Format",
          command: "kusto.formatQuery",
          tooltip: "Format this query",
          arguments: [range.start.line, range.start.character, range.end.line, range.end.character]
        }));
        if (await hasInCache(document.uri.toString(), queryText)) {
          lenses.push(new vscode9.CodeLens(vsRange, {
            title: "\u{1F4CA} Results",
            command: "kusto.showResults",
            tooltip: "Show cached results for this query",
            arguments: [document.uri.toString(), range.start.line, range.start.character]
          }));
        }
      }
    }
    return lenses;
  }
};
var KustoPasteEditProvider = class {
  constructor(client2) {
    this.client = client2;
  }
  async provideDocumentPasteEdits(document, ranges, dataTransfer, context, token) {
    const clipboardContext2 = getClipboardContext();
    if (!clipboardContext2) {
      return void 0;
    }
    const textItem = dataTransfer.get("text/plain");
    if (!textItem) {
      return void 0;
    }
    const clipboardText = await textItem.asString();
    if (clipboardText !== clipboardContext2.text) {
      clearClipboardContext();
      return void 0;
    }
    const insertPosition = ranges[0]?.start;
    if (!insertPosition) {
      return void 0;
    }
    const result = await transformPaste(
      this.client,
      clipboardContext2.text,
      clipboardContext2.kind,
      document.uri.toString(),
      { line: insertPosition.line, character: insertPosition.character },
      clipboardContext2.entityCluster,
      clipboardContext2.entityDatabase,
      clipboardContext2.entityType,
      clipboardContext2.entityName
    );
    if (!result || result === clipboardContext2.text) {
      return void 0;
    }
    const edit = new vscode9.DocumentPasteEdit(
      result,
      "Paste with connection context",
      PASTE_KIND
    );
    return [edit];
  }
};
function activateQuerySeparators(context, client2) {
  const querySeparatorDecoration = vscode9.window.createTextEditorDecorationType({
    isWholeLine: true,
    borderWidth: "0 0 3px 0",
    borderStyle: "solid",
    borderColor: "rgba(128, 128, 128, 0.25)"
  });
  const debounceTimers = /* @__PURE__ */ new Map();
  async function updateQuerySeparators(uri) {
    try {
      const result = await getQueryRanges(client2, uri);
      if (!result) {
        return;
      }
      const editors = vscode9.window.visibleTextEditors.filter(
        (e) => e.document.uri.toString() === result.uri
      );
      const config = vscode9.workspace.getConfiguration("kusto");
      const enableSeparators = config.get("editor.showQuerySeparators", true);
      const firstEditor = editors[0];
      if (!firstEditor) {
        return;
      }
      const doc = firstEditor.document;
      const ranges = result.ranges.slice(1, result.ranges.length).filter((r) => doc.getText(new vscode9.Range(r.start.line, 0, r.end.line, 0)).trim().length > 0).filter((r) => r.start.line > 0 && r.start.line < doc.lineCount).map((r) => new vscode9.Range(r.start.line - 1, 0, r.start.line - 1, 0));
      for (const editor of editors) {
        editor.setDecorations(querySeparatorDecoration, []);
        if (enableSeparators) {
          editor.setDecorations(querySeparatorDecoration, ranges);
        }
      }
    } catch (error) {
      console.error(`Failed to get query ranges for ${uri}:`, error);
    }
  }
  context.subscriptions.push(
    vscode9.workspace.onDidOpenTextDocument(async (document) => {
      if (document.languageId === "kusto") {
        await updateQuerySeparators(document.uri.toString());
      }
    })
  );
  context.subscriptions.push(
    vscode9.workspace.onDidChangeTextDocument((event) => {
      if (event.document.languageId === "kusto") {
        const errorEditor = vscode9.window.visibleTextEditors.find(
          (e) => e.document.uri.toString() === event.document.uri.toString()
        );
        if (errorEditor) {
          errorEditor.setDecorations(errorRangeDecoration, []);
        }
        const uri = event.document.uri.toString();
        const existingTimer = debounceTimers.get(uri);
        if (existingTimer) {
          clearTimeout(existingTimer);
        }
        const timer = setTimeout(() => {
          updateQuerySeparators(uri);
          debounceTimers.delete(uri);
        }, 300);
        debounceTimers.set(uri, timer);
      }
    })
  );
  for (const document of vscode9.workspace.textDocuments) {
    if (document.languageId === "kusto") {
      updateQuerySeparators(document.uri.toString());
    }
  }
}
function activateSemanticColoring(context, client2) {
  client2.onNotification("workspace/semanticTokens/refresh", forceRefreshSemanticTokens);
  const serverCapabilities = client2.initializeResult?.capabilities;
  if (serverCapabilities?.semanticTokensProvider) {
    setTimeout(() => {
      vscode9.workspace.textDocuments.forEach((doc) => {
        if (doc.languageId === "kusto") {
          const editor = vscode9.window.visibleTextEditors.find((e) => e.document === doc);
          if (editor) {
            vscode9.commands.executeCommand("vscode.executeDocumentSemanticTokensProvider", doc.uri);
          }
        }
      });
    }, 100);
  }
  context.subscriptions.push(
    vscode9.workspace.onDidOpenTextDocument((doc) => {
      if (doc.languageId === "kusto") {
        setTimeout(() => {
          vscode9.commands.executeCommand("vscode.executeDocumentSemanticTokensProvider", doc.uri);
        }, 100);
      }
    })
  );
}
async function forceRefreshSemanticTokens() {
  for (const editor of vscode9.window.visibleTextEditors) {
    if (editor.document.languageId === "kusto") {
      try {
        const lastLine = Math.max(0, editor.document.lineCount - 1);
        const charOffset = editor.document.lineAt(lastLine).text.length;
        const endPos = new vscode9.Position(lastLine, charOffset);
        await editor.edit((editBuilder) => {
          editBuilder.insert(endPos, " ");
        }, {
          undoStopBefore: false,
          undoStopAfter: false
        });
        await editor.edit((editBuilder) => {
          editBuilder.delete(new vscode9.Range(endPos, endPos.translate(0, 1)));
        }, {
          undoStopBefore: false,
          undoStopAfter: false
        });
      } catch (e) {
      }
    }
  }
}

// features/copilot.ts
var vscode10 = __toESM(require("vscode"));
var COPILOT_PARTICIPANT_ID = "kusto";
var MAX_SCHEMA_CHARS = 3e4;
var languageClient7;
async function resolveConnection(input) {
  let cluster = input.cluster;
  let database = input.database;
  if (!cluster || !database) {
    const active = await getActiveDocumentConnection();
    if (active) {
      cluster = cluster ?? active.cluster;
      database = database ?? active.database;
    }
  }
  return cluster ? { cluster, database: database ?? "" } : void 0;
}
function textResult(text) {
  return new vscode10.LanguageModelToolResult([new vscode10.LanguageModelTextPart(text)]);
}
function registerTool(context, id, progressMessage, handler) {
  const tool = {
    async prepareInvocation() {
      return { invocationMessage: progressMessage };
    },
    async invoke(options, token) {
      return textResult(await handler(options.input, token));
    }
  };
  context.subscriptions.push(vscode10.lm.registerTool(id, tool));
}
function activate7(context, client2) {
  languageClient7 = client2;
  registerTool(context, "kusto_getClusters", "Getting available clusters...", getClusters);
  registerTool(context, "kusto_getActiveConnection", "Getting active connection...", getActiveConnection);
  registerTool(context, "kusto_getDatabases", "Getting databases...", getDatabases);
  registerTool(context, "kusto_getTables", "Getting tables...", getTables);
  registerTool(context, "kusto_getTableColumns", "Getting table columns...", getTableColumns);
  registerTool(context, "kusto_getExternalTables", "Getting external tables...", getExternalTables);
  registerTool(context, "kusto_getExternalTableColumns", "Getting external table columns...", getExternalTableColumns);
  registerTool(context, "kusto_getFunctions", "Getting functions...", getFunctions);
  registerTool(context, "kusto_getMaterializedViews", "Getting materialized views...", getMaterializedViews);
  registerTool(context, "kusto_getMaterializedViewColumns", "Getting materialized view columns...", getMaterializedViewColumns);
  registerTool(context, "kusto_getEntityGroups", "Getting entity groups...", getEntityGroups);
  registerTool(context, "kusto_getGraphModels", "Getting graph models...", getGraphModels);
  registerTool(context, "kusto_getTableDefinition", "Getting table definition...", getTableDefinition);
  registerTool(context, "kusto_getExternalTableDefinition", "Getting external table definition...", getExternalTableDefinition);
  registerTool(context, "kusto_getMaterializedViewDefinition", "Getting materialized view definition...", getMaterializedViewDefinition);
  registerTool(context, "kusto_getFunctionDefinition", "Getting function definition...", getFunctionDefinition);
  registerTool(context, "kusto_getEntityGroupDefinition", "Getting entity group definition...", getEntityGroupDefinition);
  registerTool(context, "kusto_getGraphModelDefinition", "Getting graph model definition...", getGraphModelDefinition);
  registerTool(context, "kusto_getCurrentQueryText", "Getting current query...", getCurrentQuery);
  registerTool(context, "kusto_getQueryRanges", "Getting query ranges...", getQueryRanges2);
  registerTool(context, "kusto_validateQuery", "Validating query...", validateQuery2);
  registerTool(context, "kusto_getQueryResultType", "Getting query result type...", getQueryResultType2);
  registerTool(context, "kusto_getFunctionResultType", "Getting function result type...", getFunctionResultType2);
  registerTool(context, "kusto_runQuery", "Running query...", runQuery3);
  const participant = vscode10.chat.createChatParticipant(COPILOT_PARTICIPANT_ID, handleChatRequest);
  participant.iconPath = new vscode10.ThemeIcon("database");
  context.subscriptions.push(participant);
}
async function getClusters() {
  const clusters = getConfiguredConnections();
  if (clusters.length === 0) {
    return "No clusters configured. Add a cluster connection first.";
  }
  return `Available clusters:
${clusters.join("\n")}`;
}
async function getActiveConnection() {
  const active = await getActiveDocumentConnection();
  if (!active) {
    return "No active connection. Open a .kql file and connect to a database.";
  }
  return `Active connection: cluster=${active.cluster}, database=${active.database ?? "(none)"}`;
}
async function getDatabases(input) {
  let cluster = input.cluster;
  if (!cluster) {
    const active = await getActiveDocumentConnection();
    cluster = active?.cluster;
  }
  if (!cluster) {
    return "No cluster specified and no active connection.";
  }
  const databases = await getDatabasesForCluster(cluster);
  if (databases.length === 0) {
    return `No databases found for cluster ${cluster}.`;
  }
  return `Databases in ${cluster}:
${databases.join("\n")}`;
}
async function getResolvedSchema(input) {
  const connection = await resolveConnection(input);
  if (!connection) {
    return "No Kusto connection available. Please connect to a cluster and database first.";
  }
  const schema = await getDatabaseSchema(connection.cluster, connection.database);
  if (!schema) {
    return `Unable to fetch schema for ${connection.cluster}/${connection.database}.`;
  }
  return schema;
}
async function getTables(input) {
  const schema = await getResolvedSchema(input);
  if (typeof schema === "string") return schema;
  const tables = schema.tables ?? [];
  if (tables.length === 0) return `No tables in ${schema.name}.`;
  return `Tables in ${schema.name}:
${tables.map((t) => t.name).join("\n")}`;
}
function formatColumns(entityType, name, columns) {
  if (!columns || columns.length === 0) return `No columns in ${entityType} ${name}.`;
  return `Columns in ${entityType} ${name}:
${columns.map((c) => `${c.name}: ${c.type}`).join("\n")}`;
}
async function getTableColumns(input) {
  const schema = await getResolvedSchema(input);
  if (typeof schema === "string") return schema;
  const table = schema.tables?.find((t) => t.name === input.table);
  if (!table) return `Table "${input.table}" not found in ${schema.name}.`;
  return formatColumns("table", input.table, table.columns);
}
async function getExternalTableColumns(input) {
  const schema = await getResolvedSchema(input);
  if (typeof schema === "string") return schema;
  const table = schema.externalTables?.find((t) => t.name === input.table);
  if (!table) return `External table "${input.table}" not found in ${schema.name}.`;
  return formatColumns("external table", input.table, table.columns);
}
async function getMaterializedViewColumns(input) {
  const schema = await getResolvedSchema(input);
  if (typeof schema === "string") return schema;
  const view = schema.materializedViews?.find((v) => v.name === input.view);
  if (!view) return `Materialized view "${input.view}" not found in ${schema.name}.`;
  return formatColumns("materialized view", input.view, view.columns);
}
async function getFunctions(input) {
  const schema = await getResolvedSchema(input);
  if (typeof schema === "string") return schema;
  const functions = schema.functions ?? [];
  if (functions.length === 0) return `No functions in ${schema.name}.`;
  return `Functions in ${schema.name}:
${functions.map((f) => `${f.name}${f.parameters ?? "()"}`).join("\n")}`;
}
async function getMaterializedViews(input) {
  const schema = await getResolvedSchema(input);
  if (typeof schema === "string") return schema;
  const views = schema.materializedViews ?? [];
  if (views.length === 0) return `No materialized views in ${schema.name}.`;
  return `Materialized views in ${schema.name}:
${views.map((v) => v.name).join("\n")}`;
}
async function getExternalTables(input) {
  const schema = await getResolvedSchema(input);
  if (typeof schema === "string") return schema;
  const tables = schema.externalTables ?? [];
  if (tables.length === 0) return `No external tables in ${schema.name}.`;
  return `External tables in ${schema.name}:
${tables.map((t) => t.name).join("\n")}`;
}
async function getEntityGroups(input) {
  const schema = await getResolvedSchema(input);
  if (typeof schema === "string") return schema;
  const groups = schema.entityGroups ?? [];
  if (groups.length === 0) return `No entity groups in ${schema.name}.`;
  return `Entity groups in ${schema.name}:
${groups.map((g) => g.name).join("\n")}`;
}
async function getGraphModels(input) {
  const schema = await getResolvedSchema(input);
  if (typeof schema === "string") return schema;
  const models = schema.graphModels ?? [];
  if (models.length === 0) return `No graph models in ${schema.name}.`;
  return `Graph models in ${schema.name}:
${models.map((m) => m.name).join("\n")}`;
}
async function getEntityDefinition(input, entityType) {
  const connection = await resolveConnection(input);
  if (!connection) {
    return "No Kusto connection available. Please connect to a cluster and database first.";
  }
  const uri = `${ENTITY_DEFINITION_SCHEME}://${encodeURIComponent(connection.cluster)}/${encodeURIComponent(connection.database)}/${encodeURIComponent(entityType)}/${encodeURIComponent(input.name)}.kql`;
  const result = await getEntityDefinitionContent(languageClient7, uri);
  if (!result) {
    return `${entityType} "${input.name}" not found in ${connection.cluster}/${connection.database}.`;
  }
  return result.content;
}
async function getTableDefinition(input) {
  return getEntityDefinition(input, "Table");
}
async function getExternalTableDefinition(input) {
  return getEntityDefinition(input, "ExternalTable");
}
async function getMaterializedViewDefinition(input) {
  return getEntityDefinition(input, "MaterializedView");
}
async function getFunctionDefinition(input) {
  return getEntityDefinition(input, "Function");
}
async function getEntityGroupDefinition(input) {
  return getEntityDefinition(input, "EntityGroup");
}
async function getGraphModelDefinition(input) {
  return getEntityDefinition(input, "Graph");
}
async function getCurrentQuery() {
  const editor = vscode10.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "kusto") {
    return "No active Kusto document. Open a .kql file first.";
  }
  const uri = editor.document.uri.toString();
  const cursorPos = editor.selection.active;
  const queryRange = await getQueryRange(
    languageClient7,
    uri,
    { line: cursorPos.line, character: cursorPos.character }
  );
  if (!queryRange) {
    return "No query found at the current cursor position.";
  }
  const range = new vscode10.Range(
    queryRange.start.line,
    queryRange.start.character,
    queryRange.end.line,
    queryRange.end.character
  );
  const queryText = editor.document.getText(range);
  return `Current query (lines ${queryRange.start.line + 1}-${queryRange.end.line + 1}):
${queryText}`;
}
async function getQueryRanges2() {
  const editor = vscode10.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "kusto") {
    return "No active Kusto document. Open a .kql file first.";
  }
  const result = await getQueryRanges(languageClient7, editor.document.uri.toString());
  if (!result || result.ranges.length === 0) {
    return "No queries found in the active document.";
  }
  return `Queries in document (${result.ranges.length}):
${result.ranges.map(
    (r, i) => `  Query ${i + 1}: lines ${r.start.line + 1}-${r.end.line + 1}`
  ).join("\n")}`;
}
async function validateQuery2(input) {
  let cluster = input.cluster;
  let database = input.database;
  if (!cluster) {
    const active = await getActiveDocumentConnection();
    if (active) {
      cluster = cluster ?? active.cluster;
      database = database ?? active.database;
    }
  }
  if (!cluster) {
    return "No cluster specified and no active connection. Cannot validate query without schema context.";
  }
  const result = await validateQuery(languageClient7, input.query, cluster, database);
  if (!result) {
    return "Validation failed. The server did not return a result.";
  }
  if (result.diagnostics.length === 0) {
    return "Query is valid. No errors or warnings found.";
  }
  return `Query has ${result.diagnostics.length} diagnostic(s):
${result.diagnostics.map((d) => {
    const severity = d.severity === 1 ? "Error" : d.severity === 2 ? "Warning" : "Info";
    const line = d.range.start.line + 1;
    const col = d.range.start.character + 1;
    return `  ${severity} at line ${line}, col ${col}: ${d.message}`;
  }).join("\n")}`;
}
async function getQueryResultType2(input) {
  let cluster = input.cluster;
  let database = input.database;
  if (!cluster) {
    const active = await getActiveDocumentConnection();
    if (active) {
      cluster = cluster ?? active.cluster;
      database = database ?? active.database;
    }
  }
  if (!cluster) {
    return "No cluster specified and no active connection. Cannot determine query result type.";
  }
  const result = await getQueryResultType(languageClient7, input.query, cluster, database);
  if (!result || !result.resultType) {
    return "The query does not have a determinable result type (it may not be a tabular or scalar expression).";
  }
  return result.resultType;
}
async function getFunctionResultType2(input) {
  const connection = await resolveConnection(input);
  if (!connection) {
    return "No Kusto connection available. Please connect to a cluster and database first.";
  }
  const result = await getFunctionResultType(languageClient7, connection.cluster, connection.database, input.name);
  if (!result || !result.resultType) {
    return `Function "${input.name}" was not found or does not have a determinable result type.`;
  }
  return result.resultType;
}
async function runQuery3(input) {
  let cluster = input.cluster;
  let database = input.database;
  if (!cluster) {
    const active = await getActiveDocumentConnection();
    if (active) {
      cluster = cluster ?? active.cluster;
      database = database ?? active.database;
    }
  }
  if (!cluster) {
    return "No cluster specified and no active connection. Cannot run query.";
  }
  const result = await runQuery(languageClient7, input.query, cluster, database, true, input.maxRows);
  if (!result) {
    return "Query execution failed. The server did not return a result.";
  }
  if (result.error) {
    return `Query error: ${result.error.message}${result.error.details ? "\n" + result.error.details : ""}`;
  }
  if (!result.data || result.data.tables.length === 0) {
    return "Query returned no results.";
  }
  if (input.showResults) {
    await displayResults(languageClient7, result.data);
    await displayChart(languageClient7, result.data);
  }
  return resultTableToMarkdown(result.data.tables[0]);
}
async function handleChatRequest(request, context, stream, token) {
  const activeConnection = await getActiveDocumentConnection();
  if (!activeConnection) {
    stream.markdown("\u26A0\uFE0F No active Kusto connection.\n\nPlease:\n1. Open a `.kql` file\n2. Click on a database in the **Connections** panel to connect");
    return { metadata: { command: "" } };
  }
  if (!activeConnection.database) {
    stream.markdown(`\u26A0\uFE0F Connected to cluster **${activeConnection.cluster}** but no database selected.

Please click on a database in the **Connections** panel.`);
    return { metadata: { command: "" } };
  }
  stream.progress(`Fetching schema for ${activeConnection.cluster}/${activeConnection.database}...`);
  let dbSchema;
  try {
    dbSchema = await getDatabaseSchema(activeConnection.cluster, activeConnection.database);
  } catch (error) {
    stream.markdown(`\u274C Error fetching schema: ${error}`);
    return { metadata: { command: "" } };
  }
  if (!dbSchema) {
    stream.markdown(`\u274C Unable to fetch schema for **${activeConnection.cluster}/${activeConnection.database}**.

The database may not exist or you may not have access.`);
    return { metadata: { command: "" } };
  }
  const tableCount = (dbSchema.tables?.length ?? 0) + (dbSchema.externalTables?.length ?? 0) + (dbSchema.materializedViews?.length ?? 0);
  const functionCount = dbSchema.functions?.length ?? 0;
  if (tableCount === 0 && functionCount === 0) {
    stream.markdown(`\u26A0\uFE0F Schema for **${activeConnection.database}** appears to be empty.

Found: ${JSON.stringify(dbSchema, null, 2)}`);
    return { metadata: { command: "" } };
  }
  stream.markdown(`Using schema from **${activeConnection.cluster}/${activeConnection.database}** (${tableCount} tables, ${functionCount} functions)

---

`);
  const compressedSchema = compressSchema(dbSchema);
  const combinedPrompt = `You are a Kusto Query Language (KQL) expert assistant. 

IMPORTANT: Below is the database schema. Use ONLY these table and column names:

${compressedSchema}

Rules:
- Use ONLY the table and column names from the schema above
- Do NOT make up table or column names
- Follow KQL best practices

User question: ${request.prompt}`;
  try {
    const models = await vscode10.lm.selectChatModels({});
    const model = models?.[0];
    if (model) {
      stream.markdown(`*Using model: ${model.name}*

`);
      const messages = [
        vscode10.LanguageModelChatMessage.User(combinedPrompt)
      ];
      const chatResponse = await model.sendRequest(messages, {}, token);
      for await (const fragment of chatResponse.text) {
        stream.markdown(fragment);
      }
    } else {
      stream.markdown("\u274C No language model available. Please ensure GitHub Copilot is installed and active.");
    }
  } catch (error) {
    if (error instanceof vscode10.LanguageModelError) {
      stream.markdown(`\u274C Language model error: ${error.message}`);
    } else {
      stream.markdown(`\u274C Unexpected error: ${error}`);
    }
  }
  return { metadata: { command: "" } };
}
function compressSchema(dbSchema) {
  const lines = [];
  lines.push(`Database: ${dbSchema.name}`);
  const formatColumns2 = (columns) => {
    if (!columns || columns.length === 0) return "";
    return columns.map((c) => `${c.name}:${c.type}`).join(", ");
  };
  if (dbSchema.tables && dbSchema.tables.length > 0) {
    lines.push("\nTables:");
    for (const table of dbSchema.tables) {
      const cols = formatColumns2(table.columns);
      lines.push(`  ${table.name}(${cols})`);
    }
  }
  if (dbSchema.materializedViews && dbSchema.materializedViews.length > 0) {
    lines.push("\nMaterialized Views:");
    for (const view of dbSchema.materializedViews) {
      const cols = formatColumns2(view.columns);
      lines.push(`  ${view.name}(${cols})`);
    }
  }
  if (dbSchema.externalTables && dbSchema.externalTables.length > 0) {
    lines.push("\nExternal Tables:");
    for (const table of dbSchema.externalTables) {
      const cols = formatColumns2(table.columns);
      lines.push(`  ${table.name}(${cols})`);
    }
  }
  if (dbSchema.functions && dbSchema.functions.length > 0) {
    lines.push("\nFunctions:");
    for (const func of dbSchema.functions) {
      lines.push(`  ${func.name}${func.parameters ?? "()"}`);
    }
  }
  let result = lines.join("\n");
  if (result.length > MAX_SCHEMA_CHARS) {
    result = result.substring(0, MAX_SCHEMA_CHARS);
    result += "\n\n[Schema truncated due to size...]";
  }
  return result;
}

// features/connectionStatusBar.ts
var vscode11 = __toESM(require("vscode"));
var connectionStatusBarItem;
function activate8(context) {
  connectionStatusBarItem = vscode11.window.createStatusBarItem(
    vscode11.StatusBarAlignment.Left,
    0
    // priority (higher = more to the left)
  );
  connectionStatusBarItem.text = "$(database) not connected";
  connectionStatusBarItem.show();
  context.subscriptions.push(connectionStatusBarItem);
  context.subscriptions.push(registerOnDocumentConnectionChanged(async (uri) => {
    if (vscode11.window.activeTextEditor?.document.uri.toString() === uri) {
      updateStatusBar();
    }
  }));
  context.subscriptions.push(vscode11.window.onDidChangeActiveTextEditor(() => {
    updateStatusBar();
  }));
  updateStatusBar();
}
function update(cluster, database) {
  if (!connectionStatusBarItem) return;
  if (!cluster) {
    connectionStatusBarItem.text = `$(database) not connected`;
  } else if (!database) {
    connectionStatusBarItem.text = `$(database) cluster('${cluster}')`;
  } else {
    connectionStatusBarItem.text = `$(database) cluster('${cluster}').database('${database}')`;
  }
}
function show() {
  connectionStatusBarItem?.show();
}
function hide() {
  connectionStatusBarItem?.hide();
}
async function updateStatusBar() {
  const editor = vscode11.window.activeTextEditor;
  if (!editor || editor.document.languageId !== "kusto") {
    hide();
    return;
  }
  show();
  const connection = await getDocumentConnection(editor.document.uri.toString());
  update(connection?.cluster, connection?.database);
}

// features/clientStorage.ts
var extensionContext2;
function activate9(context, client2) {
  extensionContext2 = context;
  client2.onRequest("kusto/getData", handleGetData);
  client2.onRequest("kusto/setData", handleSetData);
}
async function handleGetData(params) {
  if (!extensionContext2) {
    return null;
  }
  const data = extensionContext2.globalState.get(params.key);
  return data ?? null;
}
async function handleSetData(params) {
  if (!extensionContext2) {
    return;
  }
  await extensionContext2.globalState.update(params.key, params.data);
}

// features/dotnet.ts
var vscode12 = __toESM(require("vscode"));
var import_child_process = require("child_process");
var import_util = require("util");
var execFileAsync = (0, import_util.promisify)(import_child_process.execFile);
var outputChannel;
function log(message) {
  const timestamp = (/* @__PURE__ */ new Date()).toISOString();
  const logMessage = `[${timestamp}] [dotnet] ${message}`;
  outputChannel?.appendLine(logMessage);
  console.log(logMessage);
}
async function findSystemDotnet() {
  try {
    const { stdout } = await execFileAsync("dotnet", ["--version"]);
    const version = stdout.trim();
    const majorVersion = parseInt(version.split(".")[0] ?? "0", 10);
    if (majorVersion >= 10) {
      return "dotnet";
    }
    log(`System dotnet version ${version} is below required version 10.0`);
    return void 0;
  } catch {
    return void 0;
  }
}
async function acquireDotnetFromExtension() {
  try {
    const dotnetExtension = vscode12.extensions.getExtension("ms-dotnettools.vscode-dotnet-runtime");
    if (!dotnetExtension) {
      log(".NET Runtime acquisition extension not installed");
      return void 0;
    }
    if (!dotnetExtension.isActive) {
      await dotnetExtension.activate();
    }
    const result = await vscode12.commands.executeCommand(
      "dotnet.acquire",
      { version: "10.0", requestingExtensionId: "Microsoft.kusto-explorer-vscode" }
    );
    if (result?.dotnetPath) {
      return result.dotnetPath;
    }
    log(".NET Runtime acquisition failed.");
    return void 0;
  } catch (error) {
    log(`.NET Runtime acquisition failed with error: ${error instanceof Error ? error.stack ?? error.message : String(error)}`);
    return void 0;
  }
}
async function getDotnetPath() {
  const config = vscode12.workspace.getConfiguration("kusto");
  const useSystemDotnet = config.get("runtime.useSystemDotnet", true);
  if (useSystemDotnet) {
    const systemDotnet = await findSystemDotnet();
    if (systemDotnet) {
      log("Using system installed dotnet");
      return systemDotnet;
    }
  }
  const acquiredDotnet = await acquireDotnetFromExtension();
  if (acquiredDotnet) {
    log(`Using extension installed dotnet: ${acquiredDotnet}`);
    return acquiredDotnet;
  }
  return void 0;
}
async function activate10(channel) {
  outputChannel = channel;
  let dotnetPath;
  try {
    dotnetPath = await getDotnetPath();
  } catch (error) {
    log(`Unexpected error during .NET runtime detection: ${error instanceof Error ? error.message : String(error)}`);
    dotnetPath = void 0;
  }
  if (!dotnetPath) {
    const action = await vscode12.window.showErrorMessage(
      "Kusto Explorer requires .NET Runtime 10.0 or later to be installed.",
      "Download .NET",
      "Dismiss"
    );
    if (action === "Download .NET") {
      vscode12.env.openExternal(vscode12.Uri.parse("https://dot.net/download"));
    }
    return void 0;
  }
  return dotnetPath;
}

// extension.ts
var import_node = __toESM(require_node3());
var client;
async function activate11(context) {
  const outputChannel2 = import_vscode.window.createOutputChannel("Kusto");
  const dotnetPath = await activate10(outputChannel2);
  if (!dotnetPath) {
    return;
  }
  const serverDll = path.join(context.extensionPath, "server", "KustoLspServer.dll");
  const serverExecutable = {
    command: dotnetPath,
    args: [serverDll, "vscode"]
  };
  const serverOptions = {
    run: serverExecutable,
    debug: serverExecutable
  };
  const clientOptions = {
    documentSelector: [
      { scheme: "file", language: "kusto" },
      { scheme: ENTITY_DEFINITION_SCHEME, language: "kusto" }
    ],
    synchronize: {
      fileEvents: import_vscode.workspace.createFileSystemWatcher("**/*.{kql,csl,kusto}")
    },
    outputChannel: outputChannel2,
    middleware: {
      provideCompletionItem: async (document, position, context2, token, next) => {
        const result = await next(document, position, context2, token);
        const globalCommitChars = client?.initializeResult?.capabilities?.completionProvider?.allCommitCharacters ?? [];
        return fixCompletionCommit(result, globalCommitChars);
      }
    }
  };
  client = new import_node.LanguageClient(
    "kustoLanguageServer",
    "Kusto Language Server",
    serverOptions,
    clientOptions
  );
  await client.start();
  activate9(context, client);
  initialize(client);
  registerEntityDefinitionProvider(context, client);
  context.subscriptions.push(
    vscode13.commands.registerCommand("kusto.fixCommitCharDoubling", fixCommitCharDoubling)
  );
  const updateKustoContext = () => {
    const hasKustoDocument = vscode13.workspace.textDocuments.some((doc) => doc.languageId === "kusto");
    const isKustoActive = hasKustoDocument || hasChartPanel();
    vscode13.commands.executeCommand("setContext", "kusto.hasActiveDocument", isKustoActive);
    const activeEditor = vscode13.window.activeTextEditor;
    const isEntityDef = activeEditor?.document.uri.scheme === ENTITY_DEFINITION_SCHEME;
    vscode13.commands.executeCommand("setContext", "kusto.isEntityDefinition", isEntityDef);
  };
  context.subscriptions.push(
    vscode13.commands.registerCommand("kusto.chartPanelStateChanged", () => {
      updateKustoContext();
    })
  );
  updateKustoContext();
  context.subscriptions.push(
    vscode13.workspace.onDidOpenTextDocument(() => updateKustoContext()),
    vscode13.workspace.onDidCloseTextDocument(() => updateKustoContext()),
    vscode13.window.onDidChangeActiveTextEditor(() => updateKustoContext())
  );
  activate(context, client);
  await activate2(context, client);
  activate8(context);
  activate6(context, client);
  activate3(context, client);
  activate7(context, client);
}
function deactivate() {
  if (!client) {
    return void 0;
  }
  return client.stop();
}
function fixCompletionCommit(result, globalCommitChars) {
  if (!result) {
    return result;
  }
  const items = Array.isArray(result) ? result : result.items;
  for (const item of items) {
    const commitChars = item.commitCharacters && item.commitCharacters.length > 0 ? item.commitCharacters : globalCommitChars;
    if (commitChars.length === 0) {
      continue;
    }
    const insertText = typeof item.insertText === "string" ? item.insertText : item.insertText instanceof vscode13.SnippetString ? item.insertText.value : void 0;
    if (!insertText) {
      continue;
    }
    const conflicting = commitChars.filter((ch) => insertText.includes(ch));
    if (conflicting.length > 0) {
      item.command = {
        title: "",
        command: "kusto.fixCommitCharDoubling",
        arguments: [conflicting, item.command]
      };
    }
  }
  return result;
}
async function fixCommitCharDoubling(commitChars, originalCommand) {
  const editor = vscode13.window.activeTextEditor;
  if (editor && editor.document.languageId === "kusto") {
    const disposable = vscode13.workspace.onDidChangeTextDocument(async (e) => {
      if (e.document !== editor.document) {
        return;
      }
      disposable.dispose();
      for (const change of e.contentChanges) {
        if (change.text.length === 1 && commitChars.includes(change.text)) {
          const insertPos = change.range.start;
          if (insertPos.character >= 1) {
            const charBefore = e.document.getText(
              new vscode13.Range(insertPos.translate(0, -1), insertPos)
            );
            if (charBefore === change.text) {
              await editor.edit((eb) => {
                eb.delete(new vscode13.Range(insertPos, insertPos.translate(0, 1)));
              }, { undoStopBefore: false, undoStopAfter: false });
            }
          }
          break;
        }
      }
    });
    setTimeout(() => disposable.dispose(), 1e3);
  }
  if (originalCommand) {
    await vscode13.commands.executeCommand(originalCommand.command, ...originalCommand.arguments ?? []);
  }
}
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  activate,
  deactivate
});
//# sourceMappingURL=extension.js.map
