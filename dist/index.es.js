const le = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
  "a",
  "b",
  "c",
  "d",
  "e",
  "f",
  "g",
  "h",
  "i",
  "j",
  "k",
  "l",
  "m",
  "n",
  "o",
  "p",
  "q",
  "r",
  "s",
  "t",
  "u",
  "v",
  "w",
  "x",
  "y",
  "z",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "+",
  "/"
], es = [
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  255,
  62,
  255,
  255,
  255,
  63,
  52,
  53,
  54,
  55,
  56,
  57,
  58,
  59,
  60,
  61,
  255,
  255,
  255,
  0,
  255,
  255,
  255,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
  15,
  16,
  17,
  18,
  19,
  20,
  21,
  22,
  23,
  24,
  25,
  255,
  255,
  255,
  255,
  255,
  255,
  26,
  27,
  28,
  29,
  30,
  31,
  32,
  33,
  34,
  35,
  36,
  37,
  38,
  39,
  40,
  41,
  42,
  43,
  44,
  45,
  46,
  47,
  48,
  49,
  50,
  51
];
function Rt(t) {
  if (t >= es.length)
    throw new Error("Unable to parse base64 string.");
  const e = es[t];
  if (e === 255)
    throw new Error("Unable to parse base64 string.");
  return e;
}
function ls(t) {
  let e = "", n, s = t.length;
  for (n = 2; n < s; n += 3)
    e += le[t[n - 2] >> 2], e += le[(t[n - 2] & 3) << 4 | t[n - 1] >> 4], e += le[(t[n - 1] & 15) << 2 | t[n] >> 6], e += le[t[n] & 63];
  return n === s + 1 && (e += le[t[n - 2] >> 2], e += le[(t[n - 2] & 3) << 4], e += "=="), n === s && (e += le[t[n - 2] >> 2], e += le[(t[n - 2] & 3) << 4 | t[n - 1] >> 4], e += le[(t[n - 1] & 15) << 2], e += "="), e;
}
function ti(t) {
  if (t.length % 4 !== 0)
    throw new Error("Unable to parse base64 string.");
  const e = t.indexOf("=");
  if (e !== -1 && e < t.length - 2)
    throw new Error("Unable to parse base64 string.");
  let n = t.endsWith("==") ? 2 : t.endsWith("=") ? 1 : 0, s = t.length, i = new Uint8Array(3 * (s / 4)), r;
  for (let o = 0, l = 0; o < s; o += 4, l += 3)
    r = Rt(t.charCodeAt(o)) << 18 | Rt(t.charCodeAt(o + 1)) << 12 | Rt(t.charCodeAt(o + 2)) << 6 | Rt(t.charCodeAt(o + 3)), i[l] = r >> 16, i[l + 1] = r >> 8 & 255, i[l + 2] = r & 255;
  return i.subarray(0, i.length - n);
}
function ni(t, e = new TextEncoder()) {
  return ls(e.encode(t));
}
var It = { exports: {} }, si = It.exports, ts;
function ii() {
  return ts || (ts = 1, function(t) {
    (function(e, n) {
      var s = {};
      n(s);
      var i = s.default;
      for (var r in s)
        i[r] = s[r];
      t.exports = i;
    })(si, function(e) {
      e.__esModule = !0, e.digestLength = 32, e.blockSize = 64;
      var n = new Uint32Array([
        1116352408,
        1899447441,
        3049323471,
        3921009573,
        961987163,
        1508970993,
        2453635748,
        2870763221,
        3624381080,
        310598401,
        607225278,
        1426881987,
        1925078388,
        2162078206,
        2614888103,
        3248222580,
        3835390401,
        4022224774,
        264347078,
        604807628,
        770255983,
        1249150122,
        1555081692,
        1996064986,
        2554220882,
        2821834349,
        2952996808,
        3210313671,
        3336571891,
        3584528711,
        113926993,
        338241895,
        666307205,
        773529912,
        1294757372,
        1396182291,
        1695183700,
        1986661051,
        2177026350,
        2456956037,
        2730485921,
        2820302411,
        3259730800,
        3345764771,
        3516065817,
        3600352804,
        4094571909,
        275423344,
        430227734,
        506948616,
        659060556,
        883997877,
        958139571,
        1322822218,
        1537002063,
        1747873779,
        1955562222,
        2024104815,
        2227730452,
        2361852424,
        2428436474,
        2756734187,
        3204031479,
        3329325298
      ]);
      function s(S, c, p, f, C) {
        for (var P, I, x, Q, H, E, re, z, j, F, Ke, Je, Tt; C >= 64; ) {
          for (P = c[0], I = c[1], x = c[2], Q = c[3], H = c[4], E = c[5], re = c[6], z = c[7], F = 0; F < 16; F++)
            Ke = f + F * 4, S[F] = (p[Ke] & 255) << 24 | (p[Ke + 1] & 255) << 16 | (p[Ke + 2] & 255) << 8 | p[Ke + 3] & 255;
          for (F = 16; F < 64; F++)
            j = S[F - 2], Je = (j >>> 17 | j << 15) ^ (j >>> 19 | j << 13) ^ j >>> 10, j = S[F - 15], Tt = (j >>> 7 | j << 25) ^ (j >>> 18 | j << 14) ^ j >>> 3, S[F] = (Je + S[F - 7] | 0) + (Tt + S[F - 16] | 0);
          for (F = 0; F < 64; F++)
            Je = (((H >>> 6 | H << 26) ^ (H >>> 11 | H << 21) ^ (H >>> 25 | H << 7)) + (H & E ^ ~H & re) | 0) + (z + (n[F] + S[F] | 0) | 0) | 0, Tt = ((P >>> 2 | P << 30) ^ (P >>> 13 | P << 19) ^ (P >>> 22 | P << 10)) + (P & I ^ P & x ^ I & x) | 0, z = re, re = E, E = H, H = Q + Je | 0, Q = x, x = I, I = P, P = Je + Tt | 0;
          c[0] += P, c[1] += I, c[2] += x, c[3] += Q, c[4] += H, c[5] += E, c[6] += re, c[7] += z, f += 64, C -= 64;
        }
        return f;
      }
      var i = (
        /** @class */
        function() {
          function S() {
            this.digestLength = e.digestLength, this.blockSize = e.blockSize, this.state = new Int32Array(8), this.temp = new Int32Array(64), this.buffer = new Uint8Array(128), this.bufferLength = 0, this.bytesHashed = 0, this.finished = !1, this.reset();
          }
          return S.prototype.reset = function() {
            return this.state[0] = 1779033703, this.state[1] = 3144134277, this.state[2] = 1013904242, this.state[3] = 2773480762, this.state[4] = 1359893119, this.state[5] = 2600822924, this.state[6] = 528734635, this.state[7] = 1541459225, this.bufferLength = 0, this.bytesHashed = 0, this.finished = !1, this;
          }, S.prototype.clean = function() {
            for (var c = 0; c < this.buffer.length; c++)
              this.buffer[c] = 0;
            for (var c = 0; c < this.temp.length; c++)
              this.temp[c] = 0;
            this.reset();
          }, S.prototype.update = function(c, p) {
            if (p === void 0 && (p = c.length), this.finished)
              throw new Error("SHA256: can't update because hash was finished.");
            var f = 0;
            if (this.bytesHashed += p, this.bufferLength > 0) {
              for (; this.bufferLength < 64 && p > 0; )
                this.buffer[this.bufferLength++] = c[f++], p--;
              this.bufferLength === 64 && (s(this.temp, this.state, this.buffer, 0, 64), this.bufferLength = 0);
            }
            for (p >= 64 && (f = s(this.temp, this.state, c, f, p), p %= 64); p > 0; )
              this.buffer[this.bufferLength++] = c[f++], p--;
            return this;
          }, S.prototype.finish = function(c) {
            if (!this.finished) {
              var p = this.bytesHashed, f = this.bufferLength, C = p / 536870912 | 0, P = p << 3, I = p % 64 < 56 ? 64 : 128;
              this.buffer[f] = 128;
              for (var x = f + 1; x < I - 8; x++)
                this.buffer[x] = 0;
              this.buffer[I - 8] = C >>> 24 & 255, this.buffer[I - 7] = C >>> 16 & 255, this.buffer[I - 6] = C >>> 8 & 255, this.buffer[I - 5] = C >>> 0 & 255, this.buffer[I - 4] = P >>> 24 & 255, this.buffer[I - 3] = P >>> 16 & 255, this.buffer[I - 2] = P >>> 8 & 255, this.buffer[I - 1] = P >>> 0 & 255, s(this.temp, this.state, this.buffer, 0, I), this.finished = !0;
            }
            for (var x = 0; x < 8; x++)
              c[x * 4 + 0] = this.state[x] >>> 24 & 255, c[x * 4 + 1] = this.state[x] >>> 16 & 255, c[x * 4 + 2] = this.state[x] >>> 8 & 255, c[x * 4 + 3] = this.state[x] >>> 0 & 255;
            return this;
          }, S.prototype.digest = function() {
            var c = new Uint8Array(this.digestLength);
            return this.finish(c), c;
          }, S.prototype._saveState = function(c) {
            for (var p = 0; p < this.state.length; p++)
              c[p] = this.state[p];
          }, S.prototype._restoreState = function(c, p) {
            for (var f = 0; f < this.state.length; f++)
              this.state[f] = c[f];
            this.bytesHashed = p, this.finished = !1, this.bufferLength = 0;
          }, S;
        }()
      );
      e.Hash = i;
      var r = (
        /** @class */
        function() {
          function S(c) {
            this.inner = new i(), this.outer = new i(), this.blockSize = this.inner.blockSize, this.digestLength = this.inner.digestLength;
            var p = new Uint8Array(this.blockSize);
            if (c.length > this.blockSize)
              new i().update(c).finish(p).clean();
            else
              for (var f = 0; f < c.length; f++)
                p[f] = c[f];
            for (var f = 0; f < p.length; f++)
              p[f] ^= 54;
            this.inner.update(p);
            for (var f = 0; f < p.length; f++)
              p[f] ^= 106;
            this.outer.update(p), this.istate = new Uint32Array(8), this.ostate = new Uint32Array(8), this.inner._saveState(this.istate), this.outer._saveState(this.ostate);
            for (var f = 0; f < p.length; f++)
              p[f] = 0;
          }
          return S.prototype.reset = function() {
            return this.inner._restoreState(this.istate, this.inner.blockSize), this.outer._restoreState(this.ostate, this.outer.blockSize), this;
          }, S.prototype.clean = function() {
            for (var c = 0; c < this.istate.length; c++)
              this.ostate[c] = this.istate[c] = 0;
            this.inner.clean(), this.outer.clean();
          }, S.prototype.update = function(c) {
            return this.inner.update(c), this;
          }, S.prototype.finish = function(c) {
            return this.outer.finished ? this.outer.finish(c) : (this.inner.finish(c), this.outer.update(c, this.digestLength).finish(c)), this;
          }, S.prototype.digest = function() {
            var c = new Uint8Array(this.digestLength);
            return this.finish(c), c;
          }, S;
        }()
      );
      e.HMAC = r;
      function o(S) {
        var c = new i().update(S), p = c.digest();
        return c.clean(), p;
      }
      e.hash = o, e.default = o;
      function l(S, c) {
        var p = new r(S).update(c), f = p.digest();
        return p.clean(), f;
      }
      e.hmac = l;
      function b(S, c, p, f) {
        var C = f[0];
        if (C === 0)
          throw new Error("hkdf: cannot expand more");
        c.reset(), C > 1 && c.update(S), p && c.update(p), c.update(f), c.finish(S), f[0]++;
      }
      var L = new Uint8Array(e.digestLength);
      function R(S, c, p, f) {
        c === void 0 && (c = L), f === void 0 && (f = 32);
        for (var C = new Uint8Array([1]), P = l(c, S), I = new r(P), x = new Uint8Array(I.digestLength), Q = x.length, H = new Uint8Array(f), E = 0; E < f; E++)
          Q === x.length && (b(x, I, p, C), Q = 0), H[E] = x[Q++];
        return I.clean(), x.fill(0), C.fill(0), H;
      }
      e.hkdf = R;
      function W(S, c, p, f) {
        for (var C = new r(S), P = C.digestLength, I = new Uint8Array(4), x = new Uint8Array(P), Q = new Uint8Array(P), H = new Uint8Array(f), E = 0; E * P < f; E++) {
          var re = E + 1;
          I[0] = re >>> 24 & 255, I[1] = re >>> 16 & 255, I[2] = re >>> 8 & 255, I[3] = re >>> 0 & 255, C.reset(), C.update(c), C.update(I), C.finish(Q);
          for (var z = 0; z < P; z++)
            x[z] = Q[z];
          for (var z = 2; z <= p; z++) {
            C.reset(), C.update(Q).finish(Q);
            for (var j = 0; j < P; j++)
              x[j] ^= Q[j];
          }
          for (var z = 0; z < P && E * P + z < f; z++)
            H[E * P + z] = x[z];
        }
        for (var E = 0; E < P; E++)
          x[E] = Q[E] = 0;
        for (var E = 0; E < 4; E++)
          I[E] = 0;
        return C.clean(), H;
      }
      e.pbkdf2 = W;
    });
  }(It)), It.exports;
}
var ri = ii();
const oi = new Int32Array(4);
class Z {
  static hashStr(e, n = !1) {
    return this.onePassHasher.start().appendStr(e).end(n);
  }
  static hashAsciiStr(e, n = !1) {
    return this.onePassHasher.start().appendAsciiStr(e).end(n);
  }
  // Private Static Variables
  static stateIdentity = new Int32Array([
    1732584193,
    -271733879,
    -1732584194,
    271733878
  ]);
  static buffer32Identity = new Int32Array([
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0,
    0
  ]);
  static hexChars = "0123456789abcdef";
  static hexOut = [];
  // Permanent instance is to use for one-call hashing
  static onePassHasher = new Z();
  static _hex(e) {
    const n = Z.hexChars, s = Z.hexOut;
    let i, r, o, l;
    for (l = 0; l < 4; l += 1)
      for (r = l * 8, i = e[l], o = 0; o < 8; o += 2)
        s[r + 1 + o] = n.charAt(i & 15), i >>>= 4, s[r + 0 + o] = n.charAt(i & 15), i >>>= 4;
    return s.join("");
  }
  static _md5cycle(e, n) {
    let s = e[0], i = e[1], r = e[2], o = e[3];
    s += (i & r | ~i & o) + n[0] - 680876936 | 0, s = (s << 7 | s >>> 25) + i | 0, o += (s & i | ~s & r) + n[1] - 389564586 | 0, o = (o << 12 | o >>> 20) + s | 0, r += (o & s | ~o & i) + n[2] + 606105819 | 0, r = (r << 17 | r >>> 15) + o | 0, i += (r & o | ~r & s) + n[3] - 1044525330 | 0, i = (i << 22 | i >>> 10) + r | 0, s += (i & r | ~i & o) + n[4] - 176418897 | 0, s = (s << 7 | s >>> 25) + i | 0, o += (s & i | ~s & r) + n[5] + 1200080426 | 0, o = (o << 12 | o >>> 20) + s | 0, r += (o & s | ~o & i) + n[6] - 1473231341 | 0, r = (r << 17 | r >>> 15) + o | 0, i += (r & o | ~r & s) + n[7] - 45705983 | 0, i = (i << 22 | i >>> 10) + r | 0, s += (i & r | ~i & o) + n[8] + 1770035416 | 0, s = (s << 7 | s >>> 25) + i | 0, o += (s & i | ~s & r) + n[9] - 1958414417 | 0, o = (o << 12 | o >>> 20) + s | 0, r += (o & s | ~o & i) + n[10] - 42063 | 0, r = (r << 17 | r >>> 15) + o | 0, i += (r & o | ~r & s) + n[11] - 1990404162 | 0, i = (i << 22 | i >>> 10) + r | 0, s += (i & r | ~i & o) + n[12] + 1804603682 | 0, s = (s << 7 | s >>> 25) + i | 0, o += (s & i | ~s & r) + n[13] - 40341101 | 0, o = (o << 12 | o >>> 20) + s | 0, r += (o & s | ~o & i) + n[14] - 1502002290 | 0, r = (r << 17 | r >>> 15) + o | 0, i += (r & o | ~r & s) + n[15] + 1236535329 | 0, i = (i << 22 | i >>> 10) + r | 0, s += (i & o | r & ~o) + n[1] - 165796510 | 0, s = (s << 5 | s >>> 27) + i | 0, o += (s & r | i & ~r) + n[6] - 1069501632 | 0, o = (o << 9 | o >>> 23) + s | 0, r += (o & i | s & ~i) + n[11] + 643717713 | 0, r = (r << 14 | r >>> 18) + o | 0, i += (r & s | o & ~s) + n[0] - 373897302 | 0, i = (i << 20 | i >>> 12) + r | 0, s += (i & o | r & ~o) + n[5] - 701558691 | 0, s = (s << 5 | s >>> 27) + i | 0, o += (s & r | i & ~r) + n[10] + 38016083 | 0, o = (o << 9 | o >>> 23) + s | 0, r += (o & i | s & ~i) + n[15] - 660478335 | 0, r = (r << 14 | r >>> 18) + o | 0, i += (r & s | o & ~s) + n[4] - 405537848 | 0, i = (i << 20 | i >>> 12) + r | 0, s += (i & o | r & ~o) + n[9] + 568446438 | 0, s = (s << 5 | s >>> 27) + i | 0, o += (s & r | i & ~r) + n[14] - 1019803690 | 0, o = (o << 9 | o >>> 23) + s | 0, r += (o & i | s & ~i) + n[3] - 187363961 | 0, r = (r << 14 | r >>> 18) + o | 0, i += (r & s | o & ~s) + n[8] + 1163531501 | 0, i = (i << 20 | i >>> 12) + r | 0, s += (i & o | r & ~o) + n[13] - 1444681467 | 0, s = (s << 5 | s >>> 27) + i | 0, o += (s & r | i & ~r) + n[2] - 51403784 | 0, o = (o << 9 | o >>> 23) + s | 0, r += (o & i | s & ~i) + n[7] + 1735328473 | 0, r = (r << 14 | r >>> 18) + o | 0, i += (r & s | o & ~s) + n[12] - 1926607734 | 0, i = (i << 20 | i >>> 12) + r | 0, s += (i ^ r ^ o) + n[5] - 378558 | 0, s = (s << 4 | s >>> 28) + i | 0, o += (s ^ i ^ r) + n[8] - 2022574463 | 0, o = (o << 11 | o >>> 21) + s | 0, r += (o ^ s ^ i) + n[11] + 1839030562 | 0, r = (r << 16 | r >>> 16) + o | 0, i += (r ^ o ^ s) + n[14] - 35309556 | 0, i = (i << 23 | i >>> 9) + r | 0, s += (i ^ r ^ o) + n[1] - 1530992060 | 0, s = (s << 4 | s >>> 28) + i | 0, o += (s ^ i ^ r) + n[4] + 1272893353 | 0, o = (o << 11 | o >>> 21) + s | 0, r += (o ^ s ^ i) + n[7] - 155497632 | 0, r = (r << 16 | r >>> 16) + o | 0, i += (r ^ o ^ s) + n[10] - 1094730640 | 0, i = (i << 23 | i >>> 9) + r | 0, s += (i ^ r ^ o) + n[13] + 681279174 | 0, s = (s << 4 | s >>> 28) + i | 0, o += (s ^ i ^ r) + n[0] - 358537222 | 0, o = (o << 11 | o >>> 21) + s | 0, r += (o ^ s ^ i) + n[3] - 722521979 | 0, r = (r << 16 | r >>> 16) + o | 0, i += (r ^ o ^ s) + n[6] + 76029189 | 0, i = (i << 23 | i >>> 9) + r | 0, s += (i ^ r ^ o) + n[9] - 640364487 | 0, s = (s << 4 | s >>> 28) + i | 0, o += (s ^ i ^ r) + n[12] - 421815835 | 0, o = (o << 11 | o >>> 21) + s | 0, r += (o ^ s ^ i) + n[15] + 530742520 | 0, r = (r << 16 | r >>> 16) + o | 0, i += (r ^ o ^ s) + n[2] - 995338651 | 0, i = (i << 23 | i >>> 9) + r | 0, s += (r ^ (i | ~o)) + n[0] - 198630844 | 0, s = (s << 6 | s >>> 26) + i | 0, o += (i ^ (s | ~r)) + n[7] + 1126891415 | 0, o = (o << 10 | o >>> 22) + s | 0, r += (s ^ (o | ~i)) + n[14] - 1416354905 | 0, r = (r << 15 | r >>> 17) + o | 0, i += (o ^ (r | ~s)) + n[5] - 57434055 | 0, i = (i << 21 | i >>> 11) + r | 0, s += (r ^ (i | ~o)) + n[12] + 1700485571 | 0, s = (s << 6 | s >>> 26) + i | 0, o += (i ^ (s | ~r)) + n[3] - 1894986606 | 0, o = (o << 10 | o >>> 22) + s | 0, r += (s ^ (o | ~i)) + n[10] - 1051523 | 0, r = (r << 15 | r >>> 17) + o | 0, i += (o ^ (r | ~s)) + n[1] - 2054922799 | 0, i = (i << 21 | i >>> 11) + r | 0, s += (r ^ (i | ~o)) + n[8] + 1873313359 | 0, s = (s << 6 | s >>> 26) + i | 0, o += (i ^ (s | ~r)) + n[15] - 30611744 | 0, o = (o << 10 | o >>> 22) + s | 0, r += (s ^ (o | ~i)) + n[6] - 1560198380 | 0, r = (r << 15 | r >>> 17) + o | 0, i += (o ^ (r | ~s)) + n[13] + 1309151649 | 0, i = (i << 21 | i >>> 11) + r | 0, s += (r ^ (i | ~o)) + n[4] - 145523070 | 0, s = (s << 6 | s >>> 26) + i | 0, o += (i ^ (s | ~r)) + n[11] - 1120210379 | 0, o = (o << 10 | o >>> 22) + s | 0, r += (s ^ (o | ~i)) + n[2] + 718787259 | 0, r = (r << 15 | r >>> 17) + o | 0, i += (o ^ (r | ~s)) + n[9] - 343485551 | 0, i = (i << 21 | i >>> 11) + r | 0, e[0] = s + e[0] | 0, e[1] = i + e[1] | 0, e[2] = r + e[2] | 0, e[3] = o + e[3] | 0;
  }
  _dataLength = 0;
  _bufferLength = 0;
  _state = new Int32Array(4);
  _buffer = new ArrayBuffer(68);
  _buffer8;
  _buffer32;
  constructor() {
    this._buffer8 = new Uint8Array(this._buffer, 0, 68), this._buffer32 = new Uint32Array(this._buffer, 0, 17), this.start();
  }
  /**
   * Initialise buffer to be hashed
   */
  start() {
    return this._dataLength = 0, this._bufferLength = 0, this._state.set(Z.stateIdentity), this;
  }
  // Char to code point to to array conversion:
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/charCodeAt
  // #Example.3A_Fixing_charCodeAt_to_handle_non-Basic-Multilingual-Plane_characters_if_their_presence_earlier_in_the_string_is_unknown
  /**
   * Append a UTF-8 string to the hash buffer
   * @param str String to append
   */
  appendStr(e) {
    const n = this._buffer8, s = this._buffer32;
    let i = this._bufferLength, r, o;
    for (o = 0; o < e.length; o += 1) {
      if (r = e.charCodeAt(o), r < 128)
        n[i++] = r;
      else if (r < 2048)
        n[i++] = (r >>> 6) + 192, n[i++] = r & 63 | 128;
      else if (r < 55296 || r > 56319)
        n[i++] = (r >>> 12) + 224, n[i++] = r >>> 6 & 63 | 128, n[i++] = r & 63 | 128;
      else {
        if (r = (r - 55296) * 1024 + (e.charCodeAt(++o) - 56320) + 65536, r > 1114111)
          throw new Error(
            "Unicode standard supports code points up to U+10FFFF"
          );
        n[i++] = (r >>> 18) + 240, n[i++] = r >>> 12 & 63 | 128, n[i++] = r >>> 6 & 63 | 128, n[i++] = r & 63 | 128;
      }
      i >= 64 && (this._dataLength += 64, Z._md5cycle(this._state, s), i -= 64, s[0] = s[16]);
    }
    return this._bufferLength = i, this;
  }
  /**
   * Append an ASCII string to the hash buffer
   * @param str String to append
   */
  appendAsciiStr(e) {
    const n = this._buffer8, s = this._buffer32;
    let i = this._bufferLength, r, o = 0;
    for (; ; ) {
      for (r = Math.min(e.length - o, 64 - i); r--; )
        n[i++] = e.charCodeAt(o++);
      if (i < 64)
        break;
      this._dataLength += 64, Z._md5cycle(this._state, s), i = 0;
    }
    return this._bufferLength = i, this;
  }
  /**
   * Append a byte array to the hash buffer
   * @param input array to append
   */
  appendByteArray(e) {
    const n = this._buffer8, s = this._buffer32;
    let i = this._bufferLength, r, o = 0;
    for (; ; ) {
      for (r = Math.min(e.length - o, 64 - i); r--; )
        n[i++] = e[o++];
      if (i < 64)
        break;
      this._dataLength += 64, Z._md5cycle(this._state, s), i = 0;
    }
    return this._bufferLength = i, this;
  }
  /**
   * Get the state of the hash buffer
   */
  getState() {
    const e = this._state;
    return {
      buffer: String.fromCharCode.apply(null, Array.from(this._buffer8)),
      buflen: this._bufferLength,
      length: this._dataLength,
      state: [e[0], e[1], e[2], e[3]]
    };
  }
  /**
   * Override the current state of the hash buffer
   * @param state New hash buffer state
   */
  setState(e) {
    const n = e.buffer, s = e.state, i = this._state;
    let r;
    for (this._dataLength = e.length, this._bufferLength = e.buflen, i[0] = s[0], i[1] = s[1], i[2] = s[2], i[3] = s[3], r = 0; r < n.length; r += 1)
      this._buffer8[r] = n.charCodeAt(r);
  }
  /**
   * Hash the current state of the hash buffer and return the result
   * @param raw Whether to return the value as an `Int32Array`
   */
  end(e = !1) {
    const n = this._bufferLength, s = this._buffer8, i = this._buffer32, r = (n >> 2) + 1;
    this._dataLength += n;
    const o = this._dataLength * 8;
    if (s[n] = 128, s[n + 1] = s[n + 2] = s[n + 3] = 0, i.set(Z.buffer32Identity.subarray(r), r), n > 55 && (Z._md5cycle(this._state, i), i.set(Z.buffer32Identity)), o <= 4294967295)
      i[14] = o;
    else {
      const l = o.toString(16).match(/(.*?)(.{0,8})$/);
      if (l === null) return e ? oi : "";
      const b = parseInt(l[2], 16), L = parseInt(l[1], 16) || 0;
      i[14] = b, i[15] = L;
    }
    return Z._md5cycle(this._state, i), e ? this._state : Z._hex(this._state);
  }
}
if (Z.hashStr("hello") !== "5d41402abc4b2a76b9719d911017c592")
  throw new Error("Md5 self test failed.");
const ui = 36e5, ns = Symbol.for("constructDateFrom");
function Et(t, e) {
  return typeof t == "function" ? t(e) : t && typeof t == "object" && ns in t ? t[ns](e) : t instanceof Date ? new t.constructor(e) : new Date(e);
}
function et(t, e) {
  return Et(t, t);
}
function ci(t, e, n) {
  const s = et(t);
  if (isNaN(e)) return Et(t, NaN);
  const i = s.getDate(), r = Et(t, s.getTime());
  r.setMonth(s.getMonth() + e + 1, 0);
  const o = r.getDate();
  return i >= o ? r : (s.setFullYear(
    r.getFullYear(),
    r.getMonth(),
    i
  ), s);
}
function ps(t, e, n) {
  return Et(t, +et(t) + e);
}
function ai(t, e, n) {
  return ps(t, e * ui);
}
function hi(t, e, n) {
  return ps(t, e * 1e3);
}
function li(t, e, n) {
  return ci(t, e * 12);
}
function In(t) {
  return Math.trunc(+et(t) / 1e3);
}
function ds(t, e) {
  return +et(t) < +et(e);
}
function Ot(t, e, n, s = "debug", i) {
  if (window.debug) {
    const o = ["color: #0288D1", `color:${i || "#009688"}`, "color: default"];
    n ? ss() ? console[s](
      `%c[PlaceOS]%c[${t}] %c${e}`,
      ...o,
      n
    ) : console[s](`[PlaceOS][${t}] ${e}`, n) : ss() ? console[s](`%c[PlaceOS]%c[${t}] %c${e}`, ...o) : console[s](`[PlaceOS][${t}] ${e}`);
  }
}
function Gt(t) {
  const e = (i) => i.length <= 0 ? void 0 : i.length === 1 ? i[0] : i, n = (i, r, o) => Ot(t, r, e(o), i), s = (i, ...r) => n("debug", i, r);
  return s.debug = (i, ...r) => n("debug", i, r), s.info = (i, ...r) => n("info", i, r), s.error = (i, ...r) => n("error", i, r), s.warn = (i, ...r) => n("warn", i, r), s.log = (i, ...r) => n("log", i, r), s.group = (i, ...r) => n("group", i, r), s.groupCollapsed = (i, ...r) => n("groupCollapsed", i, r), s.groupEnd = (i, ...r) => n("groupEnd", i, r), s;
}
function ss() {
  return !(document.documentMode || /Edge/.test(navigator.userAgent));
}
function fs() {
  const t = window.location?.hash ? window.location?.hash.slice(1) : window.location?.href.split("#")[1] || "";
  let e = window.location?.search ? window.location?.search.slice(1) : window.location?.href.split("?")[1] || "", n = {};
  if (t)
    if (t.indexOf("?") >= 0) {
      const i = t.split("?");
      n = Ce(i[0]), e || (e = i[1]);
    } else
      n = Ce(t);
  let s = {};
  return e && (s = Ce(e)), { ...n, ...s };
}
function Ce(t) {
  const e = {}, n = t.split("&");
  for (const s of n) {
    const i = s.split("=");
    i[1] && (e[decodeURIComponent(i[0])] = decodeURIComponent(
      i[1]
    ));
  }
  return e;
}
const Ve = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
function _s(t = 40) {
  let e = "";
  const n = window?.crypto;
  if (n?.getRandomValues) {
    const s = 256 - 256 % Ve.length, i = new Uint8Array(t * 2);
    for (; e.length < t; ) {
      n.getRandomValues(i);
      for (const r of i)
        r < s && e.length < t && (e += Ve.charAt(r % Ve.length));
    }
    return e;
  }
  for (let s = 0; s < t; s++)
    e += Ve.charAt(
      Math.floor(Math.random() * Ve.length)
    );
  return e;
}
function oe(t) {
  const e = (window.location?.hash || "").replace(new RegExp(`${t}[a-zA-Z0-9_+-.%=]*&?`, "g"), "").replace(/&&/g, "&").replace(/#&/g, "#").replace(/&$/g, "#"), n = (window.location?.search || "").replace(new RegExp(`${t}[a-zA-Z0-9_+-.%=]*&?`, "g"), "").replace(/&&/g, "&").replace(/\?&/g, "#").replace(/&$/g, "#");
  window.history?.replaceState && window.history?.replaceState(
    null,
    "",
    `${window.location?.pathname}${e}${n}`
  );
}
function Mt(t, e = !1) {
  const n = e ? 1e3 : 1024;
  if (t < n)
    return t + (e ? " iB" : " B");
  const s = Math.floor(Math.log(t) / Math.log(n)), i = (e ? "kMGTPE" : "KMGTPE").charAt(s - 1) + (e ? "iB" : "B");
  return (t / Math.pow(n, s)).toFixed(2) + " " + i;
}
function pi(t) {
  if (t.length === 0)
    throw new Error("Input must not be of zero length");
  const e = t.split(","), n = {};
  for (const s of e) {
    const i = s.split(";");
    if (i.length !== 2)
      throw new Error("Section could not be split on ';'");
    const r = i[0].replace(/<(.*)>/, "$1").trim(), o = i[1].replace(/rel="(.*)"/, "$1").trim();
    n[o] = r;
  }
  return n;
}
function di(t, e) {
  for (const n in t)
    t.hasOwnProperty(n) && e.indexOf(t[n]) >= 0 && delete t[n];
  return t;
}
function fi() {
  return [
    "iPad Simulator",
    "iPhone Simulator",
    "iPod Simulator",
    "iPad",
    "iPhone",
    "iPod"
  ].includes(navigator.platform) || // iPad on iOS 13 detection
  navigator.userAgent.includes("Mac") && "ontouchend" in document;
}
function _i() {
  return window.location !== window.parent.location;
}
function mi(t = Date.now(), e = 60 * 1e3) {
  return Math.floor(t / e);
}
class gi {
  abort() {
    Ot("Stub", "Aborted");
  }
}
function g(t) {
  let e = "";
  if (t)
    for (const n in t)
      t.hasOwnProperty(n) && t[n] !== void 0 && t[n] !== null && (e += `${e ? "&" : ""}${n}=${encodeURIComponent(
        t[n]
      )}`);
  return e;
}
const xe = {}, Ye = {}, ge = {};
function yi() {
  for (const t in xe)
    xe.hasOwnProperty(t) && $e(t);
  for (const t in Ye)
    Ye.hasOwnProperty(t) && $i(t);
  for (const t in ge)
    ge.hasOwnProperty(t) && bi(t);
}
function ue(t, e, n = 300) {
  if (t && e && e instanceof Function)
    $e(t), xe[t] = setTimeout(() => {
      e(), delete xe[t];
    }, n);
  else
    throw new Error(
      t ? "Cannot create named timeout without a name" : "Cannot create a timeout without a callback"
    );
}
function $e(t) {
  xe[t] && (clearTimeout(xe[t]), delete xe[t]);
}
function $i(t) {
  Ye[t] && (clearInterval(Ye[t]), delete Ye[t]);
}
function bi(t) {
  ge && ge[t] && (typeof ge[t] == "function" ? ge[t]() : ge[t].unsubscribe(), delete ge[t]);
}
function se(t) {
  let e = t;
  const n = /* @__PURE__ */ new Set(), s = () => e;
  return Object.defineProperty(s, "value", {
    get: () => e,
    enumerable: !0
  }), s.subscribe = (i, r = {}) => (n.add(i), r.emitCurrent !== !1 && i(e, e), () => n.delete(i)), s.set = (i) => {
    if (Object.is(i, e)) return;
    const r = e;
    e = i;
    for (const o of [...n])
      o(e, r);
  }, s.update = (i) => s.set(i(e)), s.asReadonly = () => s, s;
}
function io(t, e) {
  const n = se(t());
  for (const s of e)
    s.subscribe(() => n.set(t()), {
      emitCurrent: !1
    });
  return n.asReadonly();
}
function ro(t, e = Boolean) {
  return e(t.value) ? Promise.resolve(t.value) : new Promise((n) => {
    const s = t.subscribe(
      (i) => {
        e(i) && (s(), n(i));
      },
      { emitCurrent: !1 }
    );
  });
}
function vi(t) {
  return new Promise((e) => setTimeout(e, t));
}
const ki = {
  id: "mock-authority",
  name: "localhost:4200",
  description: "",
  domain: "localhost:4200",
  login_url: "/login?continue={{url}}",
  logout_url: "/logout",
  session: !0,
  production: !1,
  config: {},
  version: "2.0.0"
}, $ = Gt("Auth");
let d = {}, T = localStorage, w;
const m = {};
let U = "", be = "";
const ve = se(""), tt = se("");
let En = "/api/engine/v2";
const ye = se(!1), On = se(!1);
let Xe = 0;
function ms() {
  if (d.mock) return !0;
  if (!T) return !1;
  if (nt() && !d.ignore_api_key) return !0;
  const t = T.getItem(`${U}_expires_at`) || "";
  return ds(+t, /* @__PURE__ */ new Date()) ? !1 : !!(ve.value || T.getItem(`${U}_access_token`));
}
function He() {
  On.set(ms());
}
function gs(t) {
  if (!t || t.startsWith("http://") || t.startsWith("https://"))
    return t;
  const e = w?.domain;
  return e ? `${d.secure || window.location?.protocol.indexOf("https") >= 0 ? "https:" : "http:"}//${e}${t}` : t;
}
function u() {
  return `${`${d.secure || window.location?.protocol.indexOf("https") >= 0 ? "https:" : "http:"}//${d.host || window.location?.host}`}${ys()}`;
}
function ys() {
  return d.version === "ACA Engine" ? "/control/api" : En;
}
function Si() {
  return !!d.token_header;
}
function Ai() {
  return U;
}
function oo() {
  return d.redirect_uri;
}
function uo(t, e = !0) {
  T.setItem(`${U}_x-api-key`, `${t}`), T.setItem("trusted", `${e}`), xi("x-api-key", li(/* @__PURE__ */ new Date(), 5).valueOf());
}
function nt() {
  return Nt("x-api-key", !1) || "";
}
function xi(t, e = ai(/* @__PURE__ */ new Date(), 2).valueOf()) {
  d.ignore_api_key && t === "x-api-key" || (T.setItem(`${U}_expires_at`, `${e}`), T.setItem(`${U}_access_token`, t), ve.set(t), He());
}
function J(t = !0) {
  if (d.mock) return "mock-token";
  if (!T) return "";
  if (nt() && !d.ignore_api_key) return "x-api-key";
  const e = T.getItem(`${U}_expires_at`) || "", n = ve.value;
  return ds(+e, /* @__PURE__ */ new Date()) && ($("Token expired. Requesting new token..."), Nn(), m.load_authority || (Xe += 1, ue(
    "re-authorise",
    async () => {
      delete m.authorise, await Bt().catch(
        (s) => $.error("Failed to get token:", s)
      );
    },
    200 * Math.min(20, Xe)
  )), !t) ? "" : n || T.getItem(`${U}_access_token`) || "";
}
function Ct() {
  return tt.value || T.getItem(`${U}_refresh_token`) || "";
}
function Un() {
  return d.host || window.location?.host;
}
function co() {
  return !!J();
}
function qi() {
  return He(), On.asReadonly();
}
function wt() {
  return w;
}
function ao() {
  return ye.value;
}
function Mn() {
  return !!d.mock;
}
function Pi() {
  return !!d.secure;
}
function ho() {
  return ye.asReadonly();
}
function Cn() {
  return Nt("trust") === "true" || Nt("trusted") === "true";
}
function $s() {
  return !!nt() && !d.ignore_api_key || Nt("fixed_device") === "true";
}
function Nt(t, e = !0) {
  let s = fs()[t];
  if (T) {
    const i = `${Ai()}_${t}`;
    s = s || T.getItem(i) || T.getItem(t) || "", e && T.setItem(i, `${s}`);
  }
  return s;
}
async function lo(t) {
  return d = t || d, d.token_header = d.token_header ?? _i(), window.AbortController || (window.AbortController = gi), T = d.storage === "session" ? sessionStorage : localStorage, U = Z.hashStr(d.redirect_uri, !1), Ti(), d.delay && d.delay > 0 && await vi(d.delay), Dn();
}
let Dt = !1;
function Ti() {
  Dt || (Dt = !0, window.addEventListener("focus", Ht), document.addEventListener("visibilitychange", Ht));
}
function Ri() {
  Dt && (Dt = !1, window.removeEventListener("focus", Ht), document.removeEventListener("visibilitychange", Ht));
}
async function Ht() {
  if (document.visibilityState === "hidden" || d.mock || !w || w.session || ms()) return;
  if (delete m.check_params, await vs().catch(() => !1) || be || Ct()) {
    $("Application focused with new credentials. Authorising..."), Ne = !1, delete m.authorise, await Bt().catch(
      (e) => $.error("Failed to authorise on focus:", e)
    );
    return;
  }
  $("Application focused without a session. Reloading authority..."), Ne = !1, wn().catch(
    (e) => $.error("Failed to refresh authority:", e)
  );
}
async function po(t) {
  const e = {}, n = t.match(/[?#](.*)/);
  if (n)
    for (const s of n[1].split(/[?#]/))
      Object.assign(e, Ce(s));
  if (!e.code && !e.access_token && !e.refresh_token)
    throw new Error("No auth parameters found in redirect URL");
  return $("Received auth redirect. Storing parameters..."), sessionStorage.setItem("ENGINE.auth.params", JSON.stringify(e)), !w && m.load_authority && await m.load_authority, Ne = !1, delete m.check_params, delete m.authorise, Bt();
}
function fo(t) {
  T = t === "session" ? sessionStorage : localStorage;
}
function _o() {
  d = {}, w = void 0, ve.set(""), tt.set(""), On.set(!1), ye.set(!1), U = "", be = "", En = "/api/engine/v2", Ne = !1, Ri();
  for (const t in m)
    t in m && delete m[t];
  yi();
}
function wn() {
  return $("Refreshing authorty."), w = void 0, Dn();
}
function Nn() {
  $("Invalidating tokens."), T.removeItem(`${U}_access_token`), T.removeItem(`${U}_expires_at`), ve.value && ve.set(""), He();
}
function Bt(t, e = w) {
  return !m.authorise && !e ? Promise.reject("Authority is not loaded") : (m.authorise || (m.authorise = new Promise((n, s) => {
    $("Authorising user...");
    const i = () => {
      if (J(!1))
        $("Valid token found."), delete m.authorise, n(J());
      else {
        const r = [
          () => {
            $("Successfully generated token."), n(J()), delete m.authorise;
          },
          () => {
            $.error("Failed to generate token."), s("Failed to generate token"), setTimeout(() => delete m.authorise, 200);
          }
        ];
        if (d && d.auth_type === "password")
          $("Logging in with credentials."), Ni(d).then(
            ...r
          ), Xe = 0;
        else if (be || Ct())
          $(
            `Generating token with ${be ? "code" : "refresh token"}`
          ), ks().then(...r), Xe = 0;
        else if (d.entra_token)
          $("Exchanging Entra token..."), d.entra_token().then(Di).then(...r), Xe = 0;
        else if (e.session)
          $(
            "Users has session. Authorising application..."
          ), Ii(t).then(...r);
        else {
          $("No user session"), s("No user session"), setTimeout(() => delete m.authorise, 200);
          try {
            bs(e);
          } catch {
          }
        }
      }
    };
    Ei().then(i, i);
  })), m.authorise);
}
function mo() {
  const t = gs(
    w ? w.logout_url : "/logout"
  );
  fetch(t, {
    method: "GET",
    redirect: "manual",
    headers: {
      Authorization: "Bearer " + J()
    }
  }).then(
    (e) => {
      const n = e.headers.get("Location") || t;
      is(), window.location?.assign(n);
    },
    (e) => {
      $.error("Error logging out:", e), is(), window.location?.assign(t);
    }
  );
}
function is() {
  const t = [];
  for (let e = 0; e < T.length; e++) {
    const n = T.key(e);
    n && n.indexOf(U) >= 0 && t.push(n);
  }
  for (const e of t)
    T.removeItem(e);
  ve.set(""), tt.set(""), He();
}
function Dn(t = 0) {
  return m.load_authority || (m.load_authority = new Promise((e) => {
    if (ye.set(!1), d.mock) {
      w = ki, $("System in mock mode"), ye.set(!0), e();
      return;
    }
    $(`Fixed: ${$s()} | Trusted: ${Cn()}`), $("Loading authority...");
    const n = d.secure || window.location?.protocol.indexOf("https") >= 0, s = (i) => {
      $.error(`Failed to load authority(${i})`), ye.set(!1), ue(
        "load_authority",
        () => {
          delete m.load_authority, Dn(t).then((r) => e());
        },
        300 * Math.min(20, ++t)
      );
    };
    fetch(`${n ? "https:" : "http:"}//${Un()}/auth/authority`, {
      credentials: "same-origin"
    }).then(async (i) => {
      if (!i.ok)
        return s(await i.text().catch((o) => o));
      w = await i.json(), En = /[2-9]\.[0-9]+\.[0-9]+/g.test(
        w.version || ""
      ) ? "/api/engine/v2" : "/control/api", $.group("Loaded authority."), w && ($(`Name: ${w.name}`), $(`Version: ${w.version}`), $(`Domain: ${w.domain}`), $(`Session: ${w.session}`), $(`Production: ${w.production}`), $(
        `Config Keys: ${Object.keys(w.config || {}).length}`
      )), $.groupEnd("");
      const r = () => {
        ye.set(!0), $("Application set online."), e();
      };
      delete m.load_authority, Bt("").then(r, r);
    }, s);
  })), m.load_authority;
}
async function Ii(t) {
  if (d.use_iframe && m.iframe_auth)
    return m.iframe_auth;
  const e = Oi(t);
  if (d.use_iframe)
    return Ui(e);
  window.location?.assign(e);
}
function Ui(t) {
  return m.iframe_auth || (m.iframe_auth = new Promise((e, n) => {
    $("Authorizing in an iFrame...");
    const s = document.createElement("iframe");
    s.style.position = "absolute", s.style.top = "0", s.style.left = "0", s.style.height = "1px", s.style.width = "1px", s.style.zIndex = "-1", s.id = "place-authorize", s.src = `${t}`;
    const i = (o) => {
      if (o.origin === window.location?.origin && o.data.type === "place-os") {
        const l = o.data;
        if ($("Received credentials from iFrame..."), document.body.removeChild(s), $e("iframe_auth"), window.removeEventListener("message", i), delete m.iframe_auth, l.token)
          return e(), zn({
            access_token: l.token,
            ...l
          });
        be = l.code || "", ks().then(
          (b) => e(b),
          (b) => n(b)
        );
      }
    }, r = () => {
      window.removeEventListener("message", i), s.parentNode && s.parentNode.removeChild(s), delete m.iframe_auth;
    };
    ue(
      "iframe_auth",
      () => {
        $.error("Unable to resolve iFrame after 15 seconds..."), r(), n();
      },
      15 * 1e3
    ), window.addEventListener("message", i), s.onerror = (o) => {
      $.error("iFrame error.", o), $e("iframe_auth"), r(), n();
    }, document.body.appendChild(s);
  })), m.iframe_auth;
}
let Ne = !1;
function bs(t) {
  if (d.handle_login !== !1 && !Ne) {
    $("Redirecting to login page...");
    const e = gs(
      t.login_url?.replace(
        "{{url}}",
        encodeURIComponent(window.location?.href)
      )
    );
    throw setTimeout(() => window.location?.assign(e), 300), Ne = !0, new Error("Redirecting to login page...");
  } else
    $("Login being handled locally.");
  delete m.authorise;
}
function Ei() {
  return m.check_token || (m.check_token = new Promise(async (t, e) => {
    J() ? ($("Valid token found."), t(J())) : ($("No token. Checking URL for auth credentials..."), await vs() ? t(!0) : e()), delete m.check_token;
  })), m.check_token;
}
function vs() {
  return m.check_params || (m.check_params = new Promise((t) => {
    $("Checking for auth parameters...");
    let e = fs();
    if ((!e || Object.keys(e).length <= 0) && sessionStorage && (e = JSON.parse(
      sessionStorage.getItem("ENGINE.auth.params") || "{}"
    ), sessionStorage.removeItem("ENGINE.auth.params")), e && (e.code || e.access_token || e.refresh_token)) {
      const n = T.getItem(`${U}_nonce`) || "", s = (e.state || "").split(";");
      oe("state"), oe("token_type");
      const i = s[0];
      n === i ? (e.code && (be = e.code, oe("code")), e.refresh_token && (T.setItem(
        `${U}_refresh_token`,
        e.refresh_token
      ), oe("refresh_token")), zn(e), t(!!e.access_token)) : (oe("code"), oe("access_token"), oe("refresh_token"), t(!1));
    } else
      t(!1);
    ue(
      "check_params_promise",
      () => delete m.check_params,
      50
    );
  })), m.check_params;
}
function Oi(t) {
  const e = Hi();
  t = t ? `${e};${t}` : e;
  const n = d ? (d.auth_uri || "").indexOf("?") >= 0 : !1, s = (d ? d.auth_uri : null) || "/auth/oauth/authorize", i = Cn() || d.auth_type === "auth_code" ? "code" : "token";
  let r = `${s}${n ? "&" : "?"}response_type=${encodeURIComponent(i)}&client_id=${encodeURIComponent(U)}&state=${encodeURIComponent(t)}&redirect_uri=${encodeURIComponent(d.redirect_uri)}&scope=${encodeURIComponent(d.scope)}`;
  if (d.auth_type === "auth_code") {
    const { challenge: o, verify: l } = Mi();
    sessionStorage.setItem(`${U}_challenge`, o), r += "&code_challenge_method=S256", r += `&code_challenge=${l}`;
  }
  return r;
}
function Mi(t = 43) {
  const e = _s(t), n = ti(ni(e)), s = ls(ri.hash(n)).split("=")[0].replace(/\//g, "_").replace(/\+/g, "-");
  return { challenge: e, verify: s };
}
function Ci() {
  let e = (d.token_uri || "/auth/token") + `?client_id=${encodeURIComponent(U)}`, n = "";
  if (e += `&redirect_uri=${encodeURIComponent(d.redirect_uri)}`, Ct()) {
    e += `&refresh_token=${encodeURIComponent(Ct())}`, e += "&grant_type=refresh_token";
    const s = e.indexOf("?");
    n = e.slice(s + 1), e = e.slice(0, s);
  } else {
    e += `&code=${encodeURIComponent(be)}`, e += "&grant_type=authorization_code";
    const s = sessionStorage.getItem(`${U}_challenge`);
    s && (e += `&code_verifier=${s}`, sessionStorage.removeItem(`${U}_challenge`)), be = "";
  }
  return [e, n];
}
function wi(t) {
  const e = t.token_uri || "/auth/token", n = g({
    grant_type: "password",
    client_id: U,
    client_secret: t.client_secret,
    redirect_uri: t.redirect_uri,
    authority: w?.id,
    scope: t.scope,
    username: t.username,
    password: t.password
  });
  return `${e}?${n}`;
}
function ks() {
  return Hn(...Ci());
}
function Ni(t) {
  return Hn(wi(t));
}
function Di(t) {
  const e = g({
    grant_type: "urn:ietf:params:oauth:grant-type:token-exchange",
    client_id: U,
    client_secret: d.client_secret,
    subject_token: t,
    subject_token_type: "urn:ietf:params:oauth:token-type:access_token",
    scope: d.scope
  });
  return Hn(d.token_uri || "/auth/token", e);
}
function Hn(t, e = "") {
  return m.generate_tokens || (m.generate_tokens = new Promise((n, s) => {
    $("Generating new token...");
    const i = (r) => {
      $.error("Error generating new tokens:", r), r && r.status >= 400 && r.status < 500 && (T.removeItem(`${U}_refresh_token`), tt.set("")), He(), s(), delete m.generate_tokens;
    };
    fetch(t, {
      method: "POST",
      body: e,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded"
      }
    }).then(async (r) => {
      if (!r.ok) return i(r);
      const o = await r.json();
      zn(o), n(), delete m.generate_tokens;
    }, i);
  })), m.generate_tokens;
}
function zn(t) {
  const e = hi(
    /* @__PURE__ */ new Date(),
    Math.max(60, parseInt(t.expires_in, 10) - 300)
  );
  $("Tokens generated storing..."), Cn() && (t.access_token && (T.setItem(
    `${U}_access_token`,
    t.access_token
  ), oe("access_token")), t.refresh_token && (T.setItem(
    `${U}_refresh_token`,
    t.refresh_token
  ), oe("refresh_token"))), t.expires_in && (T.setItem(`${U}_expires_at`, `${e.valueOf()}`), oe("expires_in")), ye.set(!0), ve.set(t.access_token || ""), tt.set(t.refresh_token || ""), He();
}
function Hi() {
  const t = _s();
  return T.setItem(`${U}_nonce`, t), t;
}
const qe = Gt("HTTP(M)"), Wt = {};
let Ss = (t, e) => {
  const n = new Error(`Mock endpoint not found: ${t} ${e}`);
  return n.status = 404, qe(`404 ${t}:`, e), Promise.reject(n);
};
function go(t) {
  Ss = t;
}
function yo(t, e = Wt) {
  zi(t.method, t.path, e);
  const n = `${t.method}|${t.path}`, s = t.path.replace(/(http|https):\/\/[a-zA-Z0-9.-]*:?([0-9]*)?/g, "").replace(/^\//, "").split("/"), i = {
    ...t,
    path_parts: s,
    path_structure: s.map(
      (r) => r[0] === ":" ? r.replace(":", "") : ""
    )
  };
  e[n] = i, qe(`+ ${t.method} ${t.path}`);
}
function zi(t, e, n = Wt) {
  const s = `${t}|${e}`;
  n[s] && (delete n[s], qe(`- ${t} ${e}`));
}
function Fi(t, e, n, s = Wt) {
  const i = Li(t, e, s);
  if (i) {
    const r = ji(e, i, n);
    return Gi(i, r);
  }
  try {
    return Ss(t, e);
  } catch (r) {
    return qe.error(`ERROR ${t}:`, [e, r]), Promise.reject(r);
  }
}
function Li(t, e, n = Wt) {
  const i = e.replace(/(http|https):\/\/[a-zA-Z0-9.-]*:?([0-9]*)?/g, "").replace(/^\//, "").split("?")[0].split("/"), r = Object.keys(
    n
  ).reduce((o, l) => (l.indexOf(`${t}|`) === 0 && o.push(n[l]), o), []);
  for (const o of r)
    if (o.path_structure.length === i.length) {
      let l = !0;
      for (let b = 0; b < o.path_structure.length; b++)
        if (!o.path_structure[b] && o.path_parts[b] !== i[b]) {
          l = !1;
          break;
        }
      if (l)
        return o;
    }
  return null;
}
function ji(t, e, n) {
  const s = t.replace(/(http|https):\/\/[a-zA-Z0-9.-]*:?([0-9]*)?/g, "").split("?"), i = s[0].replace(/^\//, ""), r = s[1] || "", o = Ce(r), l = i.split("/"), b = {};
  for (let R = 0; R < e.path_structure.length; R++) {
    const W = e.path_structure[R];
    W && (b[W] = l[R]);
  }
  const L = {
    url: t,
    path: e.path,
    method: e.method,
    metadata: e.metadata,
    route_params: b,
    query_params: o,
    body: n
  };
  return qe(`MATCHED ${L.method}:`, L), L;
}
function Gi(t, e) {
  let n;
  try {
    n = t.callback ? t.callback(e) : t.metadata;
  } catch (o) {
    return qe.error(`ERROR ${e.method}:`, e.url, o), Promise.reject(o);
  }
  const s = t.delay_variance || 100, i = t.delay || 300, r = Math.floor(Math.random() * s - s / 2) + i;
  return qe(`RESP ${e.method}:`, e.url, n), new Promise((o) => {
    setTimeout(() => o(n), Math.max(200, r));
  });
}
const Bi = Gt("HTTP"), Wi = 3e4;
async function Qi() {
  J(!1);
  const t = qi();
  t.value || await new Promise((e, n) => {
    const s = setTimeout(() => {
      i(), n(new Error("Timed out waiting for authentication."));
    }, Wi), i = t.subscribe(
      (r) => {
        r && (clearTimeout(s), i(), e());
      },
      { emitCurrent: !1 }
    );
  });
}
const As = {};
function Zi(t, e = As) {
  return e[t] || {};
}
function _(t, e, n = st) {
  return e || (e = { response_type: "json" }), n("GET", t, { response_type: "json", ...e });
}
function v(t, e, n, s = st) {
  return n || (n = { response_type: "json" }), s("POST", t, { body: e, response_type: "json", ...n });
}
function ce(t, e, n, s = st) {
  return n || (n = { response_type: "json" }), s("PUT", t, { body: e, response_type: "json", ...n });
}
function te(t, e, n, s = st) {
  return n || (n = { response_type: "json" }), s("PATCH", t, { body: e, response_type: "json", ...n });
}
function V(t, e, n = st) {
  return e || (e = { response_type: "void" }), n("DELETE", t, { response_type: "void", ...e });
}
async function Ki(t, e, n = As) {
  if (t.headers) {
    const s = {};
    t.headers.forEach ? t.headers.forEach((i, r) => s[r.toLowerCase()] = i) : Object.keys(t.headers).forEach(
      (i) => s[i.toLowerCase()] = t.headers[i]
    ), n[t.url || ""] = s;
  }
  switch (e) {
    case "blob":
      return await t.blob();
    case "json":
      return await t.json().catch(() => ({}));
    case "text":
      return await t.text();
    case "void":
      return;
    default:
      return await t.json().catch(() => ({}));
  }
}
const xs = () => (Nn(), wn().then(
  () => Promise.resolve(),
  () => new Promise((t) => {
    setTimeout(() => {
      xs().then(() => t());
    }, 1e3);
  })
));
function st(t, e, n, s = Mn, i = Fi, r = Ki) {
  if (s()) {
    const R = i(t, e, n?.body);
    if (R) return R;
  }
  n.headers = n.headers || {}, !n.headers["Content-Type"] && !n.headers["content-type"] && (n.headers["Content-Type"] = "application/json");
  const o = () => {
    const R = {
      ...n,
      method: t,
      credentials: "same-origin"
    };
    return delete R.response_type, delete R.skip_auth, delete R.skip_auth_flow, ["POST", "PUT", "PATCH"].includes(t) && n.body !== void 0 && (R.body = typeof n.body == "string" ? n.body : JSON.stringify(n.body)), fetch(e, R);
  }, l = async () => {
    n.skip_auth || (await Qi(), J() === "x-api-key" ? n.headers["X-API-Key"] = nt() : n.headers.Authorization = `Bearer ${J()}`);
    const R = await o();
    if (R.ok) return r(R, n.response_type);
    throw R;
  }, b = 4, L = async (R) => {
    try {
      return await l();
    } catch (W) {
      if (R >= b) throw W || {};
      if (n.skip_auth || n.skip_auth_flow) throw W || {};
      if (W.status === 511)
        throw bs(wt()), W;
      if (W.status !== 401) throw W || {};
      return Bi.warn("Auth error:", W), await xs().catch(() => {
        throw W;
      }), L(R + 1);
    }
  };
  return L(0);
}
class N {
  /** Unique Identifier of the object */
  id;
  /** Human readable name of the object */
  name;
  /** Unix epoch in seconds of the creation time of the object */
  created_at;
  /** Unix epoch in seconds of the creation time of the object */
  updated_at;
  /** Version of the data */
  version;
  constructor(e = {}) {
    this.id = e.id || "", this.name = e.name || "", this.created_at = e.created_at || 0, this.updated_at = e.updated_at || 0, this.version = e.version || 0;
  }
  /**
   * Convert object into plain object
   */
  toJSON() {
    const e = { ...this };
    return e.version = this.version, delete e.created_at, di(e, [void 0, null, ""]);
  }
}
class Ji extends N {
  // Dashboard to show this alert on
  alert_dashboard_id;
  // Details of the dashboard assigned
  alert_dashboard_details;
  // Domain authority that the dashboard exists under
  authority_id;
  // Description of the dashboard's purpose
  description;
  // Whether the dashboard is enabled or not
  enabled;
  // Conditions for triggering the alert
  conditions;
  // Severity of the alert
  severity;
  // Type of the alert
  alert_type;
  // How often should this alert should be raised when triggered
  debounce_period;
  // Whether condition checks should match any single condition to pass or all of them
  any_match;
  constructor(e) {
    super(e), this.authority_id = e.authority_id || "", this.description = e.description || "", this.enabled = e.enabled || !1, this.conditions = e.conditions || {
      time_dependents: [],
      comparisons: []
    }, this.severity = e.severity || "low", this.alert_type = e.alert_type || "threshold", this.debounce_period = e.debounce_period || 0, this.alert_dashboard_id = e.alert_dashboard_id || "", this.alert_dashboard_details = e.alert_dashboard_details || void 0, this.any_match = e.any_match || !1;
  }
}
class Vi extends N {
  // Domain authority that the dashboard exists under
  authority_id;
  // Description of the dashboard's purpose
  description;
  // Whether the dashboard is enabled or not
  enabled;
  constructor(e) {
    super(e), this.authority_id = e.authority_id || "", this.description = e.description || "", this.enabled = e.enabled || !1;
  }
}
const ze = "alert_dashboards";
function Qt(t) {
  return new Vi(t);
}
function $o(t = {}) {
  return y({
    query_params: t,
    fn: Qt,
    path: ze
  });
}
function bo(t) {
  return h({
    id: t,
    query_params: {},
    fn: Qt,
    path: ze
  });
}
function vo(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: Qt,
    path: ze
  });
}
function ko(t) {
  return A({
    form_data: t,
    query_params: {},
    fn: Qt,
    path: ze
  });
}
function So(t) {
  return k({ id: t, query_params: {}, path: ze });
}
function Ao(t) {
  return y({
    query_params: {},
    fn: rt,
    path: `${ze}/${t}/alerts`
  });
}
const it = "alerts";
function rt(t) {
  return new Ji(t);
}
function xo(t = {}) {
  return y({
    query_params: t,
    fn: rt,
    path: it
  });
}
function qo(t, e = {}) {
  return h({
    id: t,
    query_params: e,
    fn: rt,
    path: it
  });
}
function Po(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: rt,
    path: it
  });
}
function To(t) {
  return A({
    form_data: t,
    query_params: {},
    fn: rt,
    path: it
  });
}
function Ro(t) {
  return k({ id: t, query_params: {}, path: it });
}
class Yi extends N {
  /** Unique identifier of the application */
  uid;
  /** Secret associated with the application */
  secret;
  /** ID of the domain that owns this application */
  owner_id;
  /** Access scopes required by users to access the application */
  scopes;
  /** Authentication redirect URI */
  redirect_uri;
  /** Whether the application uses a confidential client secret */
  confidential;
  /** Skip authorization checks for the application */
  skip_authorization;
  /** Subsystems the application has access to */
  subsystems;
  /** Whether Client ID should be updated on changes */
  preserve_client_id;
  constructor(e = {}) {
    super(e), this.uid = e.uid || "", this.secret = e.secret || "", this.owner_id = e.owner_id || "", this.scopes = e.scopes || "", this.redirect_uri = e.redirect_uri || "", this.confidential = e.confidential || !1, this.skip_authorization = e.skip_authorization || !1, this.subsystems = e.subsystems || [], this.preserve_client_id = e.preserve_client_id || !1;
  }
}
function Io(t) {
  return qs[t] || 0;
}
function Uo(t) {
  return Ps[t] || 0;
}
let qs = {}, Ps = {}, rs = "";
const Zt = (t) => t, Xi = 300, Me = {};
function y(t) {
  const { query_params: e, fn: n, path: s, endpoint: i } = t, r = g(e), o = `${i || u()}${s ? "/" + s : ""}${r ? "?" + r : ""}`;
  if (Me[o]) return Me[o].promise;
  const l = _(o).then((b) => {
    const L = er(o, r, s);
    return {
      total: L.total || 0,
      next: L.next ? () => y({
        query_params: L.next,
        fn: n,
        endpoint: i,
        path: s
      }) : null,
      data: b && b instanceof Array ? b.map((R) => (n || Zt)(R)) : b && !(b instanceof Array) && b.results ? b.results.map((R) => R) : []
    };
  });
  return Me[o] = {
    promise: l,
    timeout: setTimeout(() => delete Me[o], Xi)
  }, l.catch(() => {
    clearTimeout(Me[o]?.timeout), delete Me[o];
  }), l;
}
function h(t) {
  const { query_params: e, id: n, path: s, fn: i, options: r } = t, o = g(e), l = `${u()}/${s}/${n}${o ? "?" + o : ""}`;
  return _(l, r).then((b) => (i || Zt)(b));
}
function A(t) {
  const { query_params: e, form_data: n, path: s, fn: i } = t, r = g(e), o = `${u()}/${s}${r ? "?" + r : ""}`;
  return v(o, n).then((l) => (i || Zt)(l));
}
function a(t) {
  const { id: e, task_name: n, form_data: s, method: i, path: r, callback: o } = t, l = g(s), b = `${u()}/${r}/${e}/${n}`;
  return (i === "post" || i === "put" || !i ? (i === "put" ? ce : v)(b, s) : (i === "del" ? V : _)(
    `${b}${l ? "?" + l : ""}`,
    {
      response_type: "json"
    }
  )).then((R) => (o || ((W) => W))(R));
}
function q(t) {
  const { id: e, query_params: n, form_data: s, method: i, path: r, fn: o } = t, l = g({
    ...n,
    version: s.version || 0
  }), b = `${u()}/${r}/${e}${l ? "?" + l : ""}`;
  return (i === "put" ? ce : te)(b, s).then(
    (L) => (o || Zt)(L)
  );
}
function k(t) {
  const { id: e, query_params: n, path: s } = t, i = g(n), r = `${u()}/${s}/${e}${i ? "?" + i : ""}`;
  return V(r);
}
function er(t, e, n) {
  const s = Zi(
    t[0] === "/" ? `${location.origin}${t}` : t
  ), i = {
    total: 0,
    next: null
  };
  if (s && s["x-total-count"]) {
    const r = +(s["x-total-count"] || 0);
    (e.length < 2 || e.length < 12 && e.indexOf("offset=") >= 0) && (qs[n] = r), Ps[n] = r, i.total = r;
  }
  return s && s.link && (rs = pi(s.link || "").next, i.next = Ce(rs.split("?")[1])), i;
}
const ot = "oauth_apps";
function Kt(t) {
  return new Yi(t);
}
function Eo(t = {}) {
  return y({ query_params: t, fn: Kt, path: ot });
}
function Oo(t) {
  return h({ id: t, query_params: {}, fn: Kt, path: ot });
}
function Mo(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: Kt,
    path: ot
  });
}
function Co(t) {
  return A({ form_data: t, query_params: {}, fn: Kt, path: ot });
}
function wo(t) {
  return k({ id: t, query_params: {}, path: ot });
}
class Fn extends N {
  /** Hash of the email address of the user */
  email_digest;
  /** ID of the authority associated with the user */
  authority_id;
  /** Email address of the user */
  email;
  /** Phone number of the user */
  phone;
  /** Display nickname of the user */
  nickname;
  /** Country that the user resides in */
  country;
  /** Office building the user is associated */
  building;
  /** Access control groups that user is associated */
  groups;
  /** Avatar image for the user */
  image;
  /** Additional metadata associated with the user */
  metadata;
  /** Miscellaneous user data */
  misc;
  /** Username credential of the user */
  login_name;
  /** Organisation ID of the user */
  staff_id;
  /** First name of the user */
  first_name;
  /** Last name of the user */
  last_name;
  /** Whether user is a support role */
  support;
  /** Whether user is a system admin role */
  sys_admin;
  /** Name of the active theme on the displayed UI */
  ui_theme;
  /** Preferred language of the user */
  preferred_language;
  /** Card Number associated with the user */
  card_number;
  /** Organisational department the user belongs */
  department;
  /** Default worktime preferences for the user */
  work_preferences;
  /** Overrides of the worktime preferences for the user */
  work_overrides;
  /** ID of the user's photo in the PlaceOS uploads service */
  photo_upload_id;
  /** Whether the user has opted in to location tracking */
  locatable;
  /** Password */
  password = "";
  /** Password */
  confirm_password = "";
  deleted;
  constructor(e = {}) {
    super(e), this.authority_id = e.authority_id || "", this.email = e.email || "", this.email_digest = e.email_digest || "", this.phone = e.phone || "", this.nickname = e.nickname || "", this.country = e.country || "", this.building = e.building || "", this.image = e.image || "", this.metadata = e.metadata || "", this.misc = e.misc || "", this.login_name = e.login_name || "", this.staff_id = e.staff_id || "", this.first_name = e.first_name || "", this.last_name = e.last_name || "", this.support = !!e.support, this.sys_admin = !!e.sys_admin, this.ui_theme = e.ui_theme || "", this.preferred_language = e.preferred_language || "", this.card_number = e.card_number || "", this.groups = e.groups || [], this.department = e.department || "", this.photo_upload_id = e.photo_upload_id || "", this.work_preferences = e.work_preferences || [], this.work_overrides = e.work_overrides || {}, this.locatable = e.locatable ?? !0, this.deleted = e.deleted ?? !1;
  }
}
class tr extends N {
  description;
  scopes;
  permissions;
  secret;
  user_id;
  authority_id;
  x_api_key;
  user;
  authority;
  expires_at;
  ttl;
  constructor(e = {}) {
    super(e), this.description = e.description || "", this.scopes = e.scopes || [], this.permissions = e.permissions || "", this.secret = e.secret || "", this.user_id = e.user_id || "", this.authority_id = e.authority_id || "", this.x_api_key = e.x_api_key || "", this.user = e.user ? new Fn(e.user) : void 0, this.authority = e.authority, this.expires_at = e.expires_at, this.ttl = e.ttl;
  }
}
const Fe = "api_keys";
function Jt(t) {
  return new tr(t);
}
function No(t = {}) {
  return y({ query_params: t, fn: Jt, path: Fe });
}
function Do(t) {
  return h({ id: t, query_params: {}, fn: Jt, path: Fe });
}
function Ho(t) {
  return A({ form_data: t, query_params: {}, fn: Jt, path: Fe });
}
function zo(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: Jt,
    path: Fe
  });
}
function Fo(t) {
  return k({ id: t, query_params: {}, path: Fe });
}
function Lo() {
  return _(`${u()}/${Fe}/inspect`);
}
var nr = /* @__PURE__ */ ((t) => (t[t.Certificate = 0] = "Certificate", t[t.NoAuth = 1] = "NoAuth", t[t.UserPassword = 2] = "UserPassword", t))(nr || {});
class sr extends N {
  /** ID of the organisation that owns this row; empty when unowned */
  organisation_id;
  /** Unique identifier for the Broker */
  id;
  /** Name of the Broker */
  name;
  /** Type of authentication used for connecting to the Broker */
  auth_type;
  /** Details of the Broker */
  description;
  /** Host name of the Broker endpoint */
  host;
  /** Port number of the Broker endpoint */
  port;
  /** Whether connection to the Broker endpoint has TLS */
  tls;
  /** Username to use for connecting to Broker */
  username;
  /** Password to use for connecting to Broker */
  password;
  /** Certificate details */
  certificate;
  /** User secret */
  secret;
  /**  */
  filters;
  constructor(e = {}) {
    super(), this.organisation_id = e.organisation_id || "", this.id = e.id || "", this.name = e.name || "", this.auth_type = e.auth_type || 2, this.description = e.description || "", this.host = e.host || "", this.port = e.port || 1883, this.tls = e.tls || !1, this.username = e.username || "", this.password = e.password || "", this.certificate = e.certificate || "", this.secret = e.secret || "", this.filters = e.filters || [];
  }
}
const ut = "brokers";
function Vt(t) {
  return new sr(t);
}
function jo(t = {}) {
  return y({ query_params: t, fn: Vt, path: ut });
}
function Go(t, e = {}) {
  return h({ id: t, query_params: e, fn: Vt, path: ut });
}
function Bo(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: Vt,
    path: ut
  });
}
function Wo(t) {
  return A({ form_data: t, query_params: {}, fn: Vt, path: ut });
}
function Qo(t, e = {}) {
  return k({ id: t, query_params: e, path: ut });
}
const Ts = "build";
function Zo(t = {}) {
  const e = g(t);
  return _(`${u()}/${Ts}/monitor${e ? "?" + e : ""}`);
}
function Ko(t) {
  return V(`${u()}/${Ts}/cancel/${encodeURIComponent(t)}`, {
    response_type: "json"
  });
}
class ir {
  /** Unique identifier of the application */
  id;
  /** List of running drivers */
  compiled_drivers;
  /** List of running drivers */
  available_repositories;
  /** Number of actively running drivers */
  running_drivers;
  /** Number of actively running drivers */
  module_instances;
  /** List of repositories that are unavailable to the cluster */
  unavailable_repositories;
  /** List of drivers that are unavailable to the cluster */
  unavailable_drivers;
  /** Name of the cluster */
  hostname;
  /** Number of CPUs available on the host */
  cpu_count;
  /** Percentage of CPU usage by the cluster's root process */
  core_cpu;
  /** Percentage of CPU usage by the whole cluster */
  total_cpu;
  /** Total amount of available memory on the host in KB */
  memory_total;
  /** Total amount of memory used by the whole cluster in KB */
  memory_usage;
  /** Total amount of memory used by the cluster root process in KB */
  core_memory;
  /** Percentage of memory used by the cluster */
  memory_percentage;
  /** Display string for the memory usage */
  used_memory;
  /** Display string for the memory total */
  total_memory;
  /** List of edge nodes within the cluster */
  edge_nodes;
  run_counts;
  constructor(e = {}) {
    this.id = e.id || e.core_id || "", this.compiled_drivers = e.compiled_drivers || [], this.available_repositories = e.available_repositories || e.status?.available_repositories || [], this.running_drivers = e.running_drivers || e.status?.running_drivers || 0, this.module_instances = e.module_instances || e.status?.module_instances || 0, this.unavailable_repositories = e.unavailable_repositories || e.status?.unavailable_repositories || [], this.unavailable_drivers = e.unavailable_drivers || e.status?.unavailable_drivers || [], this.hostname = e.hostname || e.load?.local.hostname || "", this.cpu_count = e.cpu_count || e.load?.local.cpu_count || 0, this.core_cpu = e.core_cpu || e.load?.local.core_cpu || 0, this.total_cpu = e.total_cpu || e.load?.local.total_cpu || 0, this.memory_total = e.memory_total || e.load?.local.memory_total || 0, this.memory_usage = e.memory_usage || e.load?.local.memory_usage || 0, this.core_memory = e.core_memory || e.load?.local.core_memory || 0, this.run_counts = e.run_counts || e.status?.run_counts?.local || { modules: 0, drivers: 0 }, this.memory_percentage = +(this.memory_usage / this.memory_total * 100).toFixed(4), this.used_memory = Mt(this.memory_usage * 1024), this.total_memory = Mt(this.memory_total * 1024);
    const n = e.load?.edge || {};
    this.edge_nodes = e.edge_nodes || Object.keys(n).map((s) => ({
      id: s,
      ...n[s],
      run_count: e.status?.run_count?.edge[s] || {}
    })) || [];
  }
}
class rr {
  /** ID of the cluster associated with the process */
  cluster_id;
  /** Unique identifier of the application */
  id;
  /** List of module IDs that are running in this process */
  modules;
  /** Whether the process is running */
  running;
  /** Number if modules instances running in this process */
  module_instances;
  /** Last exit code of the process */
  last_exit_code;
  /** Number of times this process has been launched */
  launch_count;
  /** Time that the latest instance of the process launched */
  launch_time;
  /** Current CPU usage of the process */
  cpu_usage;
  /** Total amount of available memory on the host in KB */
  memory_total;
  /** Total amount of memory used by the process in KB */
  memory_usage;
  /** Display string for the memory usage */
  used_memory;
  /** Display string for the memory total */
  total_memory;
  constructor(e, n = {}) {
    this.cluster_id = e, this.id = n.id || n.driver || "", this.modules = n.modules || [], this.running = n.running || !1, this.module_instances = n.module_instances || n.edge?.status?.module_instances || n.local?.status?.module_instances || 0, this.last_exit_code = n.last_exit_code || n.edge?.status?.last_exit_code || n.local?.status?.last_exit_code || 0, this.launch_count = n.launch_count || n.edge?.status?.launch_count || n.local?.status?.launch_count || 0, this.launch_time = n.launch_time || n.edge?.status?.launch_time || n.local?.status?.launch_time || 0, this.cpu_usage = n.cpu_usage || n.percentage_cpu || n.edge?.status?.percentage_cpu || n.local?.status?.percentage_cpu || 0, this.memory_total = n.memory_total || n.edge?.status?.memory_total || n.local?.status?.memory_total || 0, this.memory_usage = n.memory_usage || n.edge?.status?.memory_usage || n.local?.status?.memory_usage || 0, this.used_memory = Mt(this.memory_usage * 1024), this.total_memory = Mt(this.memory_total * 1024);
  }
}
const Le = "cluster";
function Rs(t) {
  return new ir(t);
}
function Jo(t = {}) {
  return y({ query_params: t, fn: Rs, path: Le });
}
function Vo(t, e = {}) {
  return h({ id: t, query_params: e, fn: Rs, path: Le });
}
function Yo(t, e = {}) {
  return h({
    id: t,
    query_params: e,
    fn: (n) => n.map(
      (s) => new rr(t, s)
    ),
    path: Le
  });
}
function Xo(t, e) {
  return k({ id: t, query_params: e, path: Le });
}
function eu() {
  const t = `${u()}${Le}/rebalance`;
  return v(t, {}).then(() => {
  });
}
function tu() {
  const t = `${u()}${Le}/versions`;
  return _(t).then((e) => e);
}
class or extends N {
  /** ID of the organisation that owns this row; empty when unowned */
  organisation_id;
  /** Domain name */
  domain;
  /** Login URL for the domain */
  login_url;
  /** Logout URL for the domain */
  logout_url;
  /** Description of the domain domain */
  description;
  /** Local configuration for the domain */
  config;
  /** Internal settings for the domain */
  internals;
  /** List of email domains associated with the domain */
  email_domains;
  constructor(e = {}) {
    super(e), this.organisation_id = e.organisation_id || "", this.description = e.description || "", this.domain = e.domain || "", this.login_url = e.login_url || "", this.logout_url = e.logout_url || "", this.config = e.config || {}, this.internals = e.internals || {}, this.email_domains = e.email_domains || [];
  }
}
const je = "domains";
function Yt(t) {
  return new or(t);
}
function nu(t = {}) {
  return y({ query_params: t, fn: Yt, path: je });
}
function su(t) {
  return h({ id: t, query_params: {}, fn: Yt, path: je });
}
function iu(t, e, n = "patch", s = {}) {
  return q({
    id: t,
    form_data: e,
    query_params: s,
    method: n,
    fn: Yt,
    path: je
  });
}
function ru(t, e = {}) {
  return A({ form_data: t, query_params: e, fn: Yt, path: je });
}
function ou(t) {
  return k({ id: t, query_params: {}, path: je });
}
function uu(t) {
  const e = `${u()}${je}/lookup/${encodeURIComponent(t)}`;
  return _(e).then((n) => `${n}`);
}
class ur extends N {
  /** ID of the user holding the grant */
  user_id;
  /** `partner`, `organisation` or `authority` */
  scope_type;
  /** ID of the partner, organisation or domain */
  scope_id;
  /** Permission bitmask (same flags as group memberships) */
  permissions;
  /** When the grant stops applying; empty for a standing grant */
  expires_at;
  /** ID of the user who issued the grant */
  granted_by;
  constructor(e = {}) {
    super(e), this.user_id = e.user_id || "", this.scope_type = e.scope_type || "organisation", this.scope_id = e.scope_id || "", this.permissions = e.permissions || 0, this.expires_at = e.expires_at || "", this.granted_by = e.granted_by || "";
  }
}
const Xt = "grants";
function Ln(t) {
  return new ur(t);
}
function cu(t = {}) {
  return y({ query_params: t, fn: Ln, path: Xt });
}
function au(t) {
  return h({ id: t, query_params: {}, fn: Ln, path: Xt });
}
function hu(t) {
  return A({ form_data: t, query_params: {}, fn: Ln, path: Xt });
}
function lu(t) {
  return k({ id: t, query_params: {}, path: Xt });
}
class cr extends N {
  /** Description of the organisation */
  description;
  /** ID of the partner that manages this organisation; empty when self managed */
  partner_id;
  /** Who is invoiced: the partner or the organisation */
  payer;
  /** Whether this is the partner's own staff organisation, whose admins reach every organisation under the partner */
  partner_staff;
  /** Local configuration for the organisation */
  config;
  constructor(e = {}) {
    super(e), this.description = e.description || "", this.partner_id = e.partner_id || "", this.payer = e.payer || "organisation", this.partner_staff = !!e.partner_staff, this.config = e.config || {};
  }
}
class Is extends N {
  /** Description of the partner */
  description;
  /** Whether this is the platform operator's own partner; its staff reach every organisation */
  management;
  /** ID of the parent partner, if any */
  parent_id;
  /** Local configuration for the partner */
  config;
  constructor(e = {}) {
    super(e), this.description = e.description || "", this.management = !!e.management, this.parent_id = e.parent_id || "", this.config = e.config || {};
  }
}
const Pe = "organisations";
function De(t) {
  return new cr(t);
}
function pu(t = {}) {
  return y({ query_params: t, fn: De, path: Pe });
}
function du(t) {
  return h({ id: t, query_params: {}, fn: De, path: Pe });
}
function fu(t, e, n = {}, s = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: n,
    method: s,
    fn: De,
    path: Pe
  });
}
function _u(t, e = {}) {
  return A({ form_data: t, query_params: e, fn: De, path: Pe });
}
function mu(t) {
  return k({ id: t, query_params: {}, path: Pe });
}
function gu() {
  const t = `${u()}/${Pe}/current`;
  return _(t).then((e) => ({
    reach: e.reach || "organisation",
    enforcing: !!e.enforcing,
    organisation: e.organisation ? De(e.organisation) : null,
    partner: e.partner ? new Is(e.partner) : null,
    organisations: e.organisations ? e.organisations.map(De) : null
  }));
}
function yu(t, e) {
  const n = `${u()}/${Pe}/${encodeURIComponent(t)}/claim`;
  return v(n, { zone_ids: e }).then(
    (s) => s
  );
}
const ct = "partners";
function en(t) {
  return new Is(t);
}
function $u(t = {}) {
  return y({ query_params: t, fn: en, path: ct });
}
function bu(t) {
  return h({ id: t, query_params: {}, fn: en, path: ct });
}
function vu(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: en,
    path: ct
  });
}
function ku(t) {
  return A({ form_data: t, query_params: {}, fn: en, path: ct });
}
function Su(t) {
  return k({ id: t, query_params: {}, path: ct });
}
var Ge = /* @__PURE__ */ ((t) => (t[t.None = 0] = "None", t[t.Support = 1] = "Support", t[t.Admin = 2] = "Admin", t[t.NeverDisplay = 3] = "NeverDisplay", t))(Ge || {});
class Te extends N {
  /** ID of the parent zone/system/module/driver */
  parent_id;
  /** Unix timestamp in seconds of when the settings where last updated */
  updated_at;
  /** Access level for the settings data */
  encryption_level;
  /** Contents of the settings */
  settings_string;
  /** Top level keys for the parsed settings */
  keys;
  /** ID of the user that last modified the metadata */
  modified_by_id;
  /** Contents of the settings */
  get value() {
    return this.settings_string;
  }
  constructor(e = {}) {
    super(e), this.parent_id = e.parent_id || "", this.updated_at = e.updated_at || Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3), this.settings_string = e.settings_string || "", this.encryption_level = e.encryption_level || Ge.None, this.keys = e.keys || [], this.modified_by_id = e.modified_by_id || "";
  }
}
var zt = /* @__PURE__ */ ((t) => (t[t.SSH = 0] = "SSH", t[t.Device = 1] = "Device", t[t.Service = 2] = "Service", t[t.Websocket = 3] = "Websocket", t[t.Logic = 99] = "Logic", t))(zt || {});
class Us extends N {
  /** Place class name of the driver */
  class_name;
  /** Description of the driver functionality */
  description;
  /** Name to use for modules that inherit this driver */
  module_name;
  /** Role of the driver in engine */
  role;
  /** Default URI for the driver */
  default_uri;
  /** Default port number for the driver */
  default_port;
  /** ID of the repository the driver is from */
  repository_id;
  /** Name of the file from the repository to load the driver logic from */
  file_name;
  /** Version of the driver logic to use */
  commit;
  /** Ignore connection issues */
  ignore_connected;
  /** Whether newer version of driver is available */
  update_available;
  update_info;
  /**  */
  alert_level;
  /** Tuple of user settings of differring encryption levels for the driver */
  settings;
  constructor(e = {}) {
    super(e), this.description = e.description || "", this.module_name = e.module_name || "", this.role = e.role ?? zt.Logic, this.default_uri = e.default_uri || "", this.default_port = e.default_port || 1, this.ignore_connected = e.ignore_connected || !1, this.class_name = e.class_name || "", this.repository_id = e.repository_id || "", this.file_name = e.file_name || "", this.commit = e.commit || "", this.update_available = e.update_available || !1, this.update_info = e.update_info, this.alert_level = e.alert_level || "medium", this.settings = e.settings || [null, null, null, null], typeof this.settings != "object" && (this.settings = [null, null, null, null]);
    for (const n in Ge)
      !isNaN(Number(n)) && !this.settings[n] && (this.settings[n] = new Te({
        parent_id: this.id,
        encryption_level: +n
      }));
  }
}
const pe = "drivers";
function tn(t) {
  return new Us(t);
}
function Au(t = {}) {
  return y({ query_params: t, fn: tn, path: pe });
}
function xu(t, e = {}) {
  return h({ id: t, query_params: e, fn: tn, path: pe });
}
function qu(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: tn,
    path: pe
  });
}
function Pu(t) {
  return A({ form_data: t, query_params: {}, fn: tn, path: pe });
}
function Tu(t) {
  return k({ id: t, query_params: {}, path: pe });
}
function Ru(t) {
  return a({ id: t, task_name: "recompile", path: pe });
}
function Iu(t) {
  return a({ id: t, task_name: "reload", path: pe });
}
function Uu(t) {
  return a({ id: t, task_name: "compiled", method: "get", path: pe });
}
function Eu(t) {
  return a({ id: t, task_name: "readme", method: "get", path: pe });
}
class ar extends N {
  /** ID of the organisation that owns this row; empty when unowned */
  organisation_id;
  description;
  secret;
  x_api_key;
  online;
  last_seen;
  constructor(e = {}) {
    super(e), this.organisation_id = e.organisation_id || "", this.description = e.description || "", this.secret = e.secret || "", this.x_api_key = e.x_api_key || "", this.last_seen = (e.last_seen || 0) * 1e3 || Date.now(), this.online = e.online || !1;
  }
  toJSON() {
    const e = super.toJSON();
    return delete e.last_seen, e;
  }
}
const D = "edges";
function nn(t) {
  return new ar(t);
}
function Ou(t = {}) {
  return y({ query_params: t, fn: nn, path: D });
}
function Mu(t) {
  return h({ id: t, query_params: {}, fn: nn, path: D });
}
function Cu(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: nn,
    path: D
  });
}
function wu(t) {
  return A({ form_data: t, query_params: {}, fn: nn, path: D });
}
function Nu(t) {
  return k({ id: t, query_params: {}, path: D });
}
function Du(t) {
  return a({
    id: t,
    task_name: "token",
    form_data: {},
    method: "get",
    path: D
  });
}
function Hu() {
  const t = u(), e = t.startsWith("https") ? "wss:" : "ws:", n = t.startsWith("https") ? "https:" : "http:";
  return `${t.replace(n, e).replace(/\/$/, "")}/${D}/control`;
}
function zu(t = {}) {
  const e = g(t);
  return _(`${u()}/${D}/errors${e ? "?" + e : ""}`);
}
function Fu(t, e = {}) {
  const n = g(e);
  return _(
    `${u()}/${D}/${encodeURIComponent(t)}/errors${n ? "?" + n : ""}`
  );
}
function Lu(t) {
  return _(
    `${u()}/${D}/${encodeURIComponent(t)}/modules/status`
  );
}
function ju() {
  return _(`${u()}/${D}/health`);
}
function Gu(t) {
  return _(
    `${u()}/${D}/${encodeURIComponent(t)}/health`
  );
}
function Bu() {
  return _(`${u()}/${D}/connections`);
}
function Wu(t) {
  return _(
    `${u()}/${D}/${encodeURIComponent(t)}/connections`
  );
}
function Qu() {
  return _(`${u()}/${D}/modules/failures`);
}
function Zu() {
  return _(`${u()}/${D}/statistics`);
}
function Ku(t = {}) {
  const e = g(t);
  return v(
    `${u()}/${D}/monitoring/cleanup${e ? "?" + e : ""}`,
    {}
  ).then(() => {
  });
}
function Ju() {
  return _(`${u()}/${D}/monitoring/summary`);
}
function Vu() {
  return `${u()}/${D}/errors/stream`;
}
function Yu(t) {
  return `${u()}/${D}/${encodeURIComponent(t)}/errors/stream`;
}
function Xu() {
  return `${u()}/${D}/modules/stream`;
}
class jn {
  /** ISO8601 timestamp of the creation time of the group */
  created_at;
  /** ISO8601 timestamp of the last update time of the group */
  updated_at;
  /** Unique identifier of the group */
  id;
  /** Human readable name of the group */
  name;
  /** Description of the group's purpose */
  description;
  /** Subsystems this group participates in */
  subsystems;
  /** ID of the authority associated with the group */
  authority_id;
  /** ID of the parent group */
  parent_id;
  /**
   * Feature flags per subsystem, i.e. `{ signage: { templates: true } }`.
   * Child groups inherit and can override ancestor keys
   */
  features;
  /** Permission bitmask given to users added without explicit permissions */
  default_permissions;
  /** AD group ID mapped to its display name and permission bitmask */
  ad_group_mappings;
  /** Count of child groups for this group */
  children_count;
  constructor(e = {}) {
    this.created_at = e.created_at || "", this.updated_at = e.updated_at || "", this.id = e.id || "", this.name = e.name || "", this.description = e.description || "", this.subsystems = e.subsystems || [], this.authority_id = e.authority_id || "", this.parent_id = e.parent_id || "", this.features = e.features || {}, this.default_permissions = e.default_permissions || 0, this.ad_group_mappings = e.ad_group_mappings || {}, isFinite(Number(e.children_count)) && (this.children_count = e.children_count);
  }
}
class Es {
  /** ISO8601 timestamp of the creation time of the association */
  created_at;
  /** ISO8601 timestamp of the last update time of the association */
  updated_at;
  /** ID of the user associated with the group */
  user_id;
  /** ID of the group associated with the user */
  group_id;
  /** Permission bitmask granted by this association */
  permissions;
  /** AD group ID that added this membership. Empty when added manually */
  auto_assigned;
  /** Group details included by the API when available */
  group;
  /** User details included by the API when available */
  user;
  constructor(e = {}) {
    this.created_at = e.created_at || "", this.updated_at = e.updated_at || "", this.user_id = e.user_id || "", this.group_id = e.group_id || "", this.permissions = e.permissions || 0, this.auto_assigned = e.auto_assigned || "", this.group = e.group ? new jn(e.group) : void 0, this.user = e.user ? new Fn(e.user) : void 0;
  }
}
class hr {
  /** Unique identifier of the history entry */
  id;
  /** ID of the group associated with the history entry */
  group_id;
  /** ID of the user who performed the action */
  user_id;
  /** Email of the user who performed the action */
  email;
  /** Action that was performed */
  action;
  /** Type of resource that was changed */
  resource_type;
  /** ID of the resource that was changed */
  resource_id;
  /** Fields changed by the action */
  changed_fields;
  /** ISO8601 timestamp of the creation time of the history entry */
  created_at;
  constructor(e = {}) {
    this.id = e.id || "", this.group_id = e.group_id || "", this.user_id = e.user_id || "", this.email = e.email || "", this.action = e.action || "", this.resource_type = e.resource_type || "", this.resource_id = e.resource_id || "", this.changed_fields = e.changed_fields || [], this.created_at = e.created_at || "";
  }
}
class lr {
  /** ISO8601 timestamp of the creation time of the invitation */
  created_at;
  /** ISO8601 timestamp of the last update time of the invitation */
  updated_at;
  /** Unique identifier of the invitation */
  id;
  /** Email address the invitation was sent to */
  email;
  /** Digest of the invitation secret */
  secret_digest;
  /** Permission bitmask granted when accepted */
  permissions;
  /** ISO8601 timestamp when the invitation expires */
  expires_at;
  /** ID of the group associated with the invitation */
  group_id;
  constructor(e = {}) {
    this.created_at = e.created_at || "", this.updated_at = e.updated_at || "", this.id = e.id || "", this.email = e.email || "", this.secret_digest = e.secret_digest || "", this.permissions = e.permissions || 0, this.expires_at = e.expires_at || "", this.group_id = e.group_id || "";
  }
}
const Re = "groups", Os = "group_history", at = "group_invitations";
function ht(t) {
  return new jn(t);
}
function Ms(t) {
  return new hr(t);
}
function Gn(t) {
  return new lr(t);
}
function ec(t = {}) {
  return y({ query_params: t, fn: ht, path: Re });
}
function tc(t) {
  const e = `${u()}/${Re}/${encodeURIComponent(t)}`;
  return _(e).then((n) => ht(n));
}
function nc(t = {}) {
  const e = g(t), n = `${u()}/${Re}/current${e ? "?" + e : ""}`;
  return _(n).then(
    (s) => (s || []).map((i) => ({
      group: ht(i.group || {}),
      permissions: i.permissions || 0
    }))
  );
}
function sc(t, e = {}) {
  const n = g(e), s = `${u()}/${Re}/${encodeURIComponent(t)}/features${n ? "?" + n : ""}`;
  return _(s).then((i) => i || {});
}
function ic(t) {
  const e = `${u()}/${Re}`;
  return v(e, t).then((n) => ht(n));
}
function rc(t, e, n = "patch") {
  const s = `${u()}/${Re}/${encodeURIComponent(t)}`;
  return (n === "put" ? ce : te)(s, e).then(
    (i) => ht(i)
  );
}
function oc(t) {
  const e = `${u()}/${Re}/${encodeURIComponent(t)}`;
  return V(e, { response_type: "void" });
}
function uc(t = {}) {
  return y({ query_params: t, fn: Ms, path: Os });
}
function cc(t) {
  const e = `${u()}/${Os}/${encodeURIComponent(t)}`;
  return _(e).then((n) => Ms(n));
}
function ac(t = {}) {
  return y({
    query_params: t,
    fn: Gn,
    path: at
  });
}
function hc(t) {
  const e = `${u()}/${at}/${encodeURIComponent(t)}`;
  return _(e).then((n) => Gn(n));
}
function lc(t) {
  const e = `${u()}/${at}`;
  return v(e, t).then((n) => ({
    invitation: Gn(n.invitation || {}),
    plaintext_secret: n.plaintext_secret || ""
  }));
}
function pc(t) {
  const e = `${u()}/${at}/${encodeURIComponent(t)}`;
  return V(e, { response_type: "void" });
}
function dc(t) {
  const e = `${u()}/${at}/${encodeURIComponent(t)}/accept`;
  return v(e, {}).then((n) => new Es(n));
}
const Bn = "group_users";
function sn(t) {
  return new Es(t);
}
function Wn(t, e) {
  return `${Bn}/${encodeURIComponent(t)}/${encodeURIComponent(e)}`;
}
function fc(t = {}) {
  return y({ query_params: t, fn: sn, path: Bn });
}
function _c(t, e) {
  const n = `${u()}/${Wn(t, e)}`;
  return _(n).then((s) => sn(s));
}
function mc(t) {
  const e = `${u()}/${Bn}`;
  return v(e, t).then((n) => sn(n));
}
function gc(t, e, n, s = "patch") {
  const i = `${u()}/${Wn(t, e)}`;
  return (s === "put" ? ce : te)(i, n).then(
    (r) => sn(r)
  );
}
function yc(t, e) {
  const n = `${u()}/${Wn(t, e)}`;
  return V(n, { response_type: "void" });
}
class de extends N {
  /** ID of the organisation that owns this row; empty when unowned */
  organisation_id;
  /** Name of the system assocaited with the trigger */
  system_name;
  /** Number of times the trigger has been activated/triggered */
  activated_count;
  /** Description of the trigger */
  description;
  /** Duration with which to ignore sequential activations of the trigger */
  debounce_period;
  /** Whether the trigger should take priority */
  important;
  /** Whether trigger is enabled on the associated zone or system */
  enabled;
  /** Whether the trigger can call webhooks */
  enable_webhook;
  /** Whether the trigger instance can execute methods */
  exec_enabled;
  /** Auth key for trigger's webhook */
  webhook_secret;
  /** HTTP verbs supported by the webhook */
  supported_methods;
  /** ID of the system associated with the trigger */
  control_system_id;
  /** ID of the zone associated with the trigger */
  zone_id;
  /** ID of the Parent trigger */
  trigger_id;
  /** List of playlist IDs associated with the system */
  playlists;
  // Whether condition checks should match any single condition to pass or all of them
  any_match;
  /** ID of the system associated with the trigger */
  get system_id() {
    return this.control_system_id;
  }
  /** Actions to perform when the trigger is activated */
  get actions() {
    const e = this._actions, n = (e.functions || []).map((i) => ({
      ...i,
      args: { ...i.args }
    })), s = (e.mailers || []).map((i) => ({
      ...i,
      emails: [...i.emails]
    }));
    return { functions: n, mailers: s };
  }
  /** Conditions for activating the trigger */
  get conditions() {
    const e = this._conditions, n = (e.comparisons || []).map((i) => ({
      ...i,
      left: typeof i.left == "object" ? { ...i.left } : i.left,
      right: typeof i.right == "object" ? { ...i.right } : i.right
    })), s = (e.time_dependents || []).map((i) => ({
      ...i
    }));
    return { comparisons: n, time_dependents: s };
  }
  /** Actions to perform when the trigger is activated */
  _actions;
  /** Conditions for activating the trigger */
  _conditions;
  constructor(e = {}) {
    super(e), this.organisation_id = e.organisation_id || "", this.description = e.description || "", this._actions = e.actions || { functions: [], mailers: [] }, this._conditions = e.conditions || {
      comparisons: [],
      time_dependents: []
    }, this.debounce_period = e.debounce_period || 0, this.important = e.important || !1, this.enabled = e.enabled || !1, this.webhook_secret = e.webhook_secret || "", this.control_system_id = e.system_id || e.control_system_id || "", this.zone_id = e.zone_id || "", this.system_name = e.system_name || (e.control_system ? e.control_system.name : ""), this.enable_webhook = e.enable_webhook || !1, this.exec_enabled = e.exec_enabled || !1, this.supported_methods = e.supported_methods || ["POST"], this.activated_count = e.activated_count || e.trigger_count || 0, this.playlists = e.playlists || [], this.trigger_id = e.trigger_id || "", this.any_match = e.any_match || !1;
  }
}
class rn extends N {
  /** ID of the organisation that owns this row; empty when unowned */
  organisation_id;
  /** Tuple of user settings of differring encryption levels for the zone */
  settings = [null, null, null, null];
  /** Description of the zone's purpose */
  description;
  /** ID of the parent zone */
  parent_id;
  /** List of triggers associated with the zone */
  triggers;
  /** List of tags associated with the zone */
  tags;
  /** Geo-location details associated with the zone */
  location;
  /** Custom display name for the zone */
  display_name;
  /** Organisational code associated with the zone */
  code;
  /** Organisational categorisation of the zone */
  type;
  /** Count of resources associated with the zone */
  count;
  /** Count of child zones for this zone */
  children_count;
  /** Amount of physical capacity associated with the zone */
  capacity;
  /** ID or URL of or in a map associated with the zone */
  map_id;
  /** List of image URLs */
  images;
  /** Timezone of the associated real world location */
  timezone;
  /** List of playlist IDs associated with the system */
  playlists;
  /**
   * List of modules associated with the system.
   * Only available from the show method with the `complete` query parameter
   */
  trigger_list = [];
  constructor(e = {}) {
    super(e), this.organisation_id = e.organisation_id || "", this.description = e.description || "", this.tags = e.tags || [], this.triggers = e.triggers || [], this.settings = e.settings || [null, null, null, null], this.parent_id = e.parent_id || "", this.location = e.location || "", this.display_name = e.display_name || "", this.code = e.code || "", this.type = e.type || "", this.count = e.count || 0, this.capacity = e.capacity || 0, this.map_id = e.map_id || "", this.timezone = e.timezone || "", this.images = e.images || [], this.playlists = e.playlists || [], isFinite(Number(e.children_count)) && (this.children_count = e.children_count), typeof this.settings != "object" && (this.settings = [null, null, null, null]);
    for (const n in Ge)
      !isNaN(Number(n)) && !this.settings[n] && (this.settings[n] = new Te({
        parent_id: this.id,
        encryption_level: +n
      }));
    e.trigger_data && e.trigger_data instanceof Array && (this.trigger_list = e.trigger_data.map(
      (n) => new de(n)
    ));
  }
}
class pr {
  /** ISO8601 timestamp of the creation time of the association */
  created_at;
  /** ISO8601 timestamp of the last update time of the association */
  updated_at;
  /** ID of the group associated with the zone */
  group_id;
  /** ID of the zone associated with the group */
  zone_id;
  /** Permission bitmask granted by this association */
  permissions;
  /** Whether this association denies the permission bitmask */
  deny;
  /** Group details included by the API when available */
  group;
  /** Zone details included by the API when available */
  zone;
  constructor(e = {}) {
    this.created_at = e.created_at || "", this.updated_at = e.updated_at || "", this.group_id = e.group_id || "", this.zone_id = e.zone_id || "", this.permissions = e.permissions || 0, this.deny = !!e.deny, this.group = e.group ? new jn(e.group) : void 0, this.zone = e.zone ? new rn(e.zone) : void 0;
  }
}
const Qn = "group_zones";
function on(t) {
  return new pr(t);
}
function Zn(t, e) {
  return `${Qn}/${encodeURIComponent(t)}/${encodeURIComponent(e)}`;
}
function $c(t = {}) {
  return y({ query_params: t, fn: on, path: Qn });
}
function bc(t, e) {
  const n = `${u()}/${Zn(t, e)}`;
  return _(n).then((s) => on(s));
}
function vc(t) {
  const e = `${u()}/${Qn}`;
  return v(e, t).then((n) => on(n));
}
function kc(t, e, n, s = "patch") {
  const i = `${u()}/${Zn(t, e)}`;
  return (s === "put" ? ce : te)(i, n).then(
    (r) => on(r)
  );
}
function Sc(t, e) {
  const n = `${u()}/${Zn(t, e)}`;
  return V(n, { response_type: "void" });
}
class dr extends N {
  /** Type of auth source */
  type = "ldap";
  /** ID of the authority associted with the auth method */
  authority_id;
  /** HTTP URL of the SSO provider */
  host;
  /** Application ID from the SSO provider providing the Ldap services */
  port;
  /** Application secret from the SSO provider providing the Ldap services */
  auth_method;
  /** Mapping of engine values to SSO provider values */
  uid;
  /** URL from the SSO provider for authorisation */
  base;
  /** Default DN to user when performing a user lookup */
  bind_dn;
  /** Password to access LDAP service */
  password;
  /**
   * LDAP Filter. Can be used instead of `uid`.
   * e.g. (&(uid=%{username})(memberOf=cn=myapp-users,ou=groups,dc=example,dc=com))
   */
  filter;
  constructor(e = {}) {
    super(e), this.authority_id = e.authority_id || "", this.host = e.host || "", this.port = e.port || 636, this.auth_method = e.auth_method || "ssl", this.uid = e.uid || "", this.base = e.base || "", this.bind_dn = e.bind_dn || "", this.password = e.password || "", this.filter = e.filter || "";
  }
}
const lt = "ldap_auths";
function un(t) {
  return new dr(t);
}
function Ac(t = {}) {
  return y({ query_params: t, fn: un, path: lt });
}
function xc(t) {
  return h({ id: t, query_params: {}, fn: un, path: lt });
}
function qc(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: un,
    path: lt
  });
}
function Pc(t) {
  return A({ form_data: t, query_params: {}, fn: un, path: lt });
}
function Tc(t) {
  return k({ id: t, query_params: {}, path: lt });
}
class Cs {
  /** ID of the parent resource associated with the metadata */
  id;
  /** ID of the parent resource associated with the metadata */
  parent_id;
  /** Name/ID of the zone metadata */
  name;
  /** Description of what this metadata represents */
  description;
  /** Metadata associated with this key. */
  details;
  /** List user groups allowed to edit the metadata */
  editors;
  /** JSON schema associated with the metadata details */
  schema;
  /** ID of the schema associated with the metadata details */
  schema_id;
  /** Unix timestamp that the metadata was created at */
  created_at;
  /** Unix timestamp that the metadata was last modified at */
  updated_at;
  /** ID of the user that last modified the metadata */
  modified_by_id;
  /** Version of the data */
  version;
  constructor(e = {}) {
    this.parent_id = e.parent_id || e.id || "", this.id = this.parent_id, this.name = e.name || "", this.description = e.description || "";
    try {
      this.details = (typeof e.details == "string" ? JSON.parse(e.details) : e.details) || {};
    } catch {
      this.details = e.details || {};
    }
    this.editors = e.editors || [], this.schema_id = e.schema_id || e.schema || "", this.schema = this.schema_id, this.created_at = (e.created_at || 0) * 1e3 || Date.now(), this.updated_at = (e.updated_at || 0) * 1e3 || Date.now(), this.modified_by_id = e.modified_by_id || "", this.version = e.version || 0;
  }
}
class fr {
  /** Zone associated with the metadata */
  zone;
  /** Metadata for zone */
  metadata;
  /** List of the root keys in the metadata */
  keys;
  constructor(e = {}) {
    this.zone = new rn(e.zone), this.keys = e.keys || [], this.metadata = {};
    const n = e.metadata || {};
    for (const s of this.keys)
      this.metadata[s] = new Cs(n[s]);
  }
}
const fe = "metadata";
function Ie(t) {
  return new Cs(t);
}
function Rc(t, e = {}) {
  return h({
    id: t,
    query_params: e,
    fn: (n) => Object.keys(n).map((s) => Ie(n[s])),
    path: fe
  });
}
function _r(t) {
  const e = [...t], n = [];
  for (; e.length; ) {
    const s = e.pop();
    Array.isArray(s) ? e.push(...s) : n.push(s);
  }
  return n.reverse();
}
function Ic(t, e = {}) {
  return a({
    id: t,
    task_name: "history",
    form_data: e,
    method: "get",
    callback: (n) => _r(
      Object.keys(n).map(
        (s) => n[s].map((i) => Ie(i))
      )
    ),
    path: fe
  });
}
function Uc(t, e) {
  return h({
    id: t,
    query_params: { name: e },
    fn: (n) => Ie(n[e]),
    path: fe
  });
}
function Ec(t, e, n = "put") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: Ie,
    path: fe
  });
}
function Oc(t) {
  return A({ form_data: t, query_params: {}, fn: Ie, path: fe });
}
function Mc(t, e) {
  return k({ id: t, query_params: e, path: fe });
}
function Cc(t, e) {
  const n = `${u()}${fe}/${encodeURIComponent(t)}/name`;
  return te(n, e).then((s) => Ie(s));
}
function wc(t, e) {
  return a({
    id: t,
    task_name: "children",
    form_data: e,
    method: "get",
    callback: (n) => n.map(
      (s) => new fr({
        ...s,
        keys: Object.keys(s.metadata)
      })
    ),
    path: fe
  });
}
function Nc(t, e) {
  const n = g(e), s = `${u()}/${fe}/${encodeURIComponent(t)}/bulk${n ? "?" + n : ""}`;
  return _(s).then(
    (i) => Object.keys(i || {}).reduce(
      (r, o) => ({ ...r, [o]: Ie(i[o]) }),
      {}
    )
  );
}
class ws extends N {
  /** ID of the organisation that owns this row; empty when unowned */
  organisation_id;
  /** Tuple of user settings of differring encryption levels for the system */
  settings = [null, null, null, null];
  /** Display name of the system */
  display_name;
  /** Description of the system */
  description;
  /** Email address associated with the system */
  email;
  /** Email address associated with the system */
  code;
  /** Capacity of the space associated with the system */
  capacity;
  /** Features associated with the system */
  features;
  /** Whether system is bookable by end users */
  bookable;
  /** Whether system is public accessible */
  public;
  /** Count of UI devices attached to the system */
  installed_ui_devices;
  /** Support URL for the system */
  support_url;
  /** URL for the timetable UI linked to the system */
  timetable_url;
  /** URLs for requesting snapshots of the assosiated camera */
  camera_snapshot_url;
  /** URLs for requesting snapshots of the assosiated camera */
  camera_snapshot_urls;
  /** URL for managing the attached camera */
  camera_url;
  /** External booking URL for the system */
  room_booking_url;
  /** ID on the SVG Map associated with this system */
  map_id;
  /** List of module IDs that belong to the system */
  modules;
  /** List of images associated with the system */
  images;
  /** List of the zone IDs that the system belongs */
  zones;
  /** Timezone of the associated real world space */
  timezone;
  /**
   * List of modules associated with the system.
   * Only available from the show method with the `complete` query parameter
   */
  module_list = [];
  /** Whether the system has signage capabilities */
  signage;
  /** List of playlist IDs associated with the system */
  playlists;
  /** List of security groups with access to the system */
  security_groups;
  /** Unix timestamp of the last ping from the signage player UI */
  signage_last_seen;
  approval;
  /** Orientation of the signage system */
  orientation;
  constructor(e = {}) {
    super(e), this.organisation_id = e.organisation_id || "", this.display_name = e.display_name || "", this.description = e.description || "", this.email = e.email || "", this.code = e.code || "", this.capacity = e.capacity || 0, this.features = e.features || [], this.bookable = e.bookable || !1, this.public = e.public ?? !1, this.installed_ui_devices = e.installed_ui_devices || 0, this.support_url = e.support_url || "", this.camera_snapshot_url = e.camera_snapshot_url || "", this.camera_snapshot_urls = e.camera_snapshot_urls || [], this.camera_url = e.camera_url || "", this.timetable_url = e.timetable_url || "", this.room_booking_url = e.room_booking_url || "", this.map_id = e.map_id || "", this.modules = e.modules || [], this.images = e.images || [], this.zones = e.zones || [], this.settings = e.settings || [null, null, null, null], this.timezone = e.timezone || "", this.signage = e.signage || !1, this.playlists = e.playlists || [], this.security_groups = e.security_groups || [], this.orientation = e.orientation || "unspecified", this.approval = e.approval || !1, this.signage_last_seen = e.signage_last_seen || In(Date.now()), typeof this.settings != "object" && (this.settings = [null, null, null, null]);
    for (const n in Ge)
      !isNaN(Number(n)) && !this.settings[n] && (this.settings[n] = new Te({
        parent_id: this.id,
        encryption_level: +n
      }));
    e.module_data && e.module_data instanceof Array && (this.module_list = e.module_data.map(
      (n) => new Ns(n)
    ));
  }
}
class Ns extends N {
  /** ID of the organisation that owns this row; empty when unowned */
  organisation_id;
  /** Whether the associated hardware is connected */
  connected;
  /** Whether the module driver is running */
  running;
  /** Timestamp of last update in ms since UTC epoch */
  updated_at;
  /** ID of the edge associated with the module */
  edge_id;
  /** ID of the driver associated with the module */
  driver_id;
  /** Driver/dependancy associated with the module */
  driver;
  /** ID of the system associated with the module */
  control_system_id;
  /** System associated with the module */
  system;
  /** IP address of the hardware associated with the module */
  ip;
  /** Whether the hardware connection requires TLS */
  tls;
  /** Whether the hardware connection is over UDP */
  udp;
  /** Port number connections to the hardware are made on */
  port;
  /**  */
  makebreak;
  /** URI associated with the module */
  uri;
  /** Custom name of the module */
  custom_name;
  /** Type of module */
  role;
  /** Notes associated with the module */
  notes;
  /** Ignore connection issues */
  ignore_connected;
  /** Tuple of user settings of differring encryption levels for the module */
  settings = [null, null, null, null];
  /** Whether the module has a runtime error */
  has_runtime_error;
  /** Timestamp of the last runtime error in ms since UTC epoch */
  error_timestamp;
  /**  */
  alert_level;
  /** ID of the system associated with the module */
  get system_id() {
    return this.control_system_id;
  }
  constructor(e = {}) {
    super(e), this.organisation_id = e.organisation_id || "", this.driver_id = e.driver_id || e.dependency_id || "", this.control_system_id = e.control_system_id || "", this.edge_id = e.edge_id || "", this.ip = e.ip || "", this.tls = e.tls || !1, this.udp = e.udp || !1, this.port = e.port || 1, this.makebreak = e.makebreak || !1, this.uri = e.uri || "", this.custom_name = e.custom_name || "", this.role = e.role ?? zt.Logic, this.notes = e.notes || "", this.ignore_connected = e.ignore_connected || !1, this.connected = e.connected, this.running = e.running || !1, this.updated_at = e.updated_at || 0, this.system = new ws(
      e.control_system || e.system
    ), this.has_runtime_error = e.has_runtime_error || !1, this.error_timestamp = e.error_timestamp || 0, this.driver = new Us(e.dependency || e.driver), this.settings = e.settings || [null, null, null, null], this.alert_level = e.alert_level || "medium", typeof this.settings != "object" && (this.settings = [null, null, null, null]);
    for (const n in Ge)
      !isNaN(Number(n)) && !this.settings[n] && (this.settings[n] = new Te({
        parent_id: this.id,
        encryption_level: +n
      }));
  }
  /**
   * Convert object into plain object
   */
  toJSON(e = !1) {
    const n = super.toJSON();
    return (n.role !== zt.Logic && !e || !n.control_system_id) && delete n.control_system_id, delete n.driver, delete n.system, delete n.error_timestamp, delete n.has_runtime_error, n;
  }
}
const Y = "modules";
function cn(t) {
  return new Ns(t);
}
function Dc(t = {}) {
  return y({ query_params: t, fn: cn, path: Y });
}
function Hc(t, e = {}) {
  return h({ id: t, query_params: e, fn: cn, path: Y });
}
function zc(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: cn,
    path: Y
  });
}
function Fc(t, e = {}) {
  return A({ form_data: t, query_params: e, fn: cn, path: Y });
}
function Lc(t) {
  return k({ id: t, query_params: {}, path: Y });
}
function jc(t) {
  return a({ id: t, task_name: "start", path: Y });
}
function Gc(t) {
  return a({ id: t, task_name: "stop", path: Y });
}
function Bc(t) {
  return a({ id: t, task_name: "state", method: "get", path: Y });
}
function Wc(t, e) {
  return a({ id: t, task_name: `state/${e}`, method: "get", path: Y });
}
function Qc(t) {
  return a({ id: t, task_name: "load", method: "post", path: Y });
}
function Zc(t) {
  return a({
    id: t,
    task_name: "settings",
    method: "get",
    callback: (e) => e.map((n) => new Te(n)),
    path: Y
  });
}
function Kc(t) {
  return a({
    id: t,
    task_name: "error",
    method: "get",
    path: Y
  });
}
function Jc(t, e, n = []) {
  return a({
    id: t,
    task_name: `exec/${encodeURIComponent(e)}`,
    form_data: n,
    path: Y
  });
}
class mr extends N {
  /** Type of auth source */
  type = "oauth";
  /** ID of the authority associted with the auth method */
  authority_id;
  /** Application ID from the SSO provider providing the OAuth services */
  client_id;
  /** Application secret from the SSO provider providing the OAuth services */
  client_secret;
  /** Mapping of engine values to SSO provider values */
  info_mappings;
  /** HTTP URL of the SSO provider */
  site;
  /** URL from the SSO provider for authorisation */
  authorize_url;
  /** HTTP Method used to generating tokens */
  token_method;
  /** URL for generating user tokens */
  token_url;
  /** Scheme used to authenticate the user */
  auth_scheme;
  /** Space seperated access scopes for the user */
  scope;
  /** URL to grab user's profile details with a valid token */
  raw_info_url;
  /** Additional params to be sent as part of the authorization reqest */
  authorize_params;
  /** Security checks to be made on the returned data */
  ensure_matching;
  constructor(e = {}) {
    super(e), this.authority_id = e.authority_id || "", this.client_id = e.client_id || "", this.client_secret = e.client_secret || "", this.info_mappings = e.info_mappings || {}, this.authorize_params = e.authorize_params || {}, this.ensure_matching = e.ensure_matching || {}, this.site = e.site || "", this.authorize_url = e.authorize_url || "oauth/authorize", this.token_method = e.token_method || "post", this.token_url = e.token_url || "oauth/token", this.auth_scheme = e.auth_scheme || "request_body", this.scope = e.scope || "", this.raw_info_url = e.raw_info_url || "", this.authorize_params = e.authorize_params || {}, this.ensure_matching = e.ensure_matching || {};
  }
}
const pt = "oauth_auths";
function an(t) {
  return new mr(t);
}
function Vc(t = {}) {
  return y({ query_params: t, fn: an, path: pt });
}
function Yc(t) {
  return h({ id: t, query_params: {}, fn: an, path: pt });
}
function Xc(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: an,
    path: pt
  });
}
function ea(t) {
  return A({ form_data: t, query_params: {}, fn: an, path: pt });
}
function ta(t) {
  return k({ id: t, query_params: {}, path: pt });
}
const Ds = "mqtt";
function na() {
  return v(`${u()}/${Ds}/user`, {}).then(() => {
  });
}
function sa(t) {
  const e = g(t);
  return v(`${u()}/${Ds}/access${e ? "?" + e : ""}`, {}).then(
    () => {
    }
  );
}
const Kn = "public_events";
function ia(t, e) {
  const n = `${u()}/${Kn}/guest_token/${encodeURIComponent(t)}`;
  return v(n, e, { skip_auth: !0 });
}
function ra(t, e = {}) {
  const n = g(e), s = `${u()}/${Kn}/${encodeURIComponent(t)}/events${n ? "?" + n : ""}`;
  return _(s, { skip_auth_flow: !0 }).then(
    (i) => i || []
  );
}
function oa(t, e) {
  const n = `${u()}/${Kn}/${encodeURIComponent(t)}/register`;
  return v(n, e, { skip_auth_flow: !0 });
}
const Hs = "notifications";
function ua(t = {}) {
  return v(`${u()}/${Hs}/google`, t).then(() => {
  });
}
function ca(t) {
  return v(`${u()}/${Hs}/office365`, t).then(
    () => {
    }
  );
}
var zs = /* @__PURE__ */ ((t) => (t.Driver = "driver", t.Interface = "interface", t))(zs || {});
class gr extends N {
  /** Name of the folder on the server to pull the repository */
  folder_name;
  /** Description of the contents of the repository */
  description;
  /** URI that the repository can be pulled from */
  uri;
  /** Working branch for the repository */
  branch;
  /** Hash of the commit at the head of the repository */
  commit_hash;
  /** Repository type */
  repo_type;
  /** Username to connect to repository with */
  username;
  /** Password to connect to repository with */
  password;
  /** Root path of the repository to serve at the `folder_name` path */
  root_path;
  /** Repository type */
  get type() {
    return this.repo_type;
  }
  constructor(e = {}) {
    super(e), this.folder_name = e.folder_name || "", this.description = e.description || "", this.uri = e.uri || "", this.branch = e.branch || "", this.commit_hash = e.commit_hash || "", this.repo_type = e.repo_type || zs.Driver, this.username = e.username || "", this.password = e.password || "", this.root_path = e.root_path || "";
  }
}
const G = "repositories";
function hn(t) {
  return new gr(t);
}
function aa(t = {}) {
  return y({ query_params: t, fn: hn, path: G });
}
function ha(t) {
  return h({ id: t, query_params: {}, fn: hn, path: G });
}
function la(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: hn,
    path: G
  });
}
function pa(t) {
  return A({ form_data: t, query_params: {}, fn: hn, path: G });
}
function da(t) {
  return k({ id: t, query_params: {}, path: G });
}
function fa() {
  return h({
    id: "interfaces",
    query_params: {},
    path: G
  });
}
function _a(t) {
  return h({
    id: "remote_default_branch",
    query_params: t,
    path: G
  });
}
function ma(t) {
  return h({
    id: "remote_branches",
    query_params: t,
    path: G
  });
}
function ga(t) {
  return h({
    id: "remote_commits",
    query_params: t,
    path: G
  });
}
function ya(t, e) {
  return a({
    id: t,
    task_name: "drivers",
    form_data: e,
    method: "get",
    path: G
  });
}
function $a(t, e) {
  return a({
    id: t,
    task_name: "commits",
    form_data: e,
    method: "get",
    path: G
  });
}
function ba(t) {
  return a({
    id: t,
    task_name: "branches",
    method: "get",
    path: G
  });
}
function va(t) {
  return a({
    id: t,
    task_name: "default_branch",
    method: "get",
    path: G
  });
}
function ka(t, e) {
  return a({
    id: t,
    task_name: "details",
    form_data: e,
    method: "get",
    path: G
  });
}
function Sa(t, e) {
  return a({
    id: t,
    task_name: "pull",
    form_data: e,
    method: "post",
    path: G
  });
}
function Aa(t, e) {
  return a({
    id: t,
    task_name: "folders",
    form_data: e,
    method: "get",
    path: G
  });
}
function xa(t, e) {
  return a({
    id: t,
    task_name: "files",
    form_data: e,
    method: "get",
    path: G
  });
}
function qa() {
  return _(u()).then(() => {
  });
}
function Pa() {
  return _(`${u()}/platform`);
}
function Ta() {
  return _(`${u()}/version`);
}
function Ra() {
  return _(`${u()}/cluster/versions`);
}
function Ia() {
  return _(`${u()}/scopes`);
}
function Ua(t, e = {}) {
  const n = g({ channel: t });
  return v(`${u()}/signal?${n}`, e).then(() => {
  });
}
function Ea(t = {}) {
  const e = g(t);
  return v(`${u()}/reindex${e ? "?" + e : ""}`, {}).then(
    () => {
    }
  );
}
function Oa() {
  return v(`${u()}/backfill`, {}).then(() => {
  });
}
class yr extends N {
  /** Type of auth source */
  type = "saml";
  /** ID of the authority associted with the auth method */
  authority_id;
  /** Name of the application requesting auth */
  issuer;
  /**
   * Mapping of request params that exist during the request
   * phase of OmniAuth that should to be sent to the IdP
   */
  idp_sso_target_url_runtime_params;
  /** Describes the format of the username required by this application */
  name_identifier_format;
  /** Attribute that uniquely identifies the user */
  uid_attribute;
  /** URL at which the SAML assertion should be received (SSO Service => Place URL) */
  assertion_consumer_service_url;
  /** URL to which the authentication request should be sent (Place => SSO Service) */
  idp_sso_target_url;
  /** Identity provider's certificate in PEM format (this or fingerprint is required) */
  idp_cert;
  /** SHA1 fingerprint of the certificate */
  idp_cert_fingerprint;
  /** Name for the attribute service */
  attribute_service_name;
  /** Mapping of Attribute Names in a SAMLResponse to entries in the OmniAuth info hash */
  attribute_statements;
  /** Mapping of Attribute Names in a SAMLResponse to entries in the OmniAuth info hash */
  request_attributes;
  /** URL to which the single logout request and response should be sent */
  idp_slo_target_url;
  /** Value to use as default RelayState for single log outs */
  slo_default_relay_state;
  constructor(e = {}) {
    super(e), this.authority_id = e.authority_id || "", this.issuer = e.issuer || "", this.idp_sso_target_url_runtime_params = e.idp_sso_target_url_runtime_params || {}, this.name_identifier_format = e.name_identifier_format || "", this.uid_attribute = e.uid_attribute || "", this.assertion_consumer_service_url = e.assertion_consumer_service_url || "", this.idp_sso_target_url = e.idp_sso_target_url || "", this.idp_cert = e.idp_cert || "", this.idp_cert_fingerprint = e.idp_cert_fingerprint || "", this.attribute_service_name = e.attribute_service_name || "", this.attribute_statements = e.attribute_statements || {}, this.request_attributes = e.request_attributes || [], this.idp_slo_target_url = e.idp_slo_target_url || "", this.slo_default_relay_state = e.slo_default_relay_state || "";
  }
}
const dt = "saml_auths";
function ln(t) {
  return new yr(t);
}
function Ma(t = {}) {
  return y({ query_params: t, fn: ln, path: dt });
}
function Ca(t) {
  return h({ id: t, query_params: {}, fn: ln, path: dt });
}
function wa(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: ln,
    path: dt
  });
}
function Na(t) {
  return A({ form_data: t, query_params: {}, fn: ln, path: dt });
}
function Da(t) {
  return k({ id: t, query_params: {}, path: dt });
}
const Be = "settings";
function ft(t) {
  return new Te(t);
}
function Ha(t = {}) {
  return y({ query_params: t, fn: ft, path: Be });
}
function za(t) {
  return h({ id: t, query_params: {}, fn: ft, path: Be });
}
function Fa(t, e, n = {}, s = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: n,
    method: s,
    fn: ft,
    path: Be
  });
}
function La(t, e = {}) {
  return A({ form_data: t, query_params: e, fn: ft, path: Be });
}
function ja(t) {
  return k({ id: t, query_params: {}, path: Be });
}
function Ga(t, e = {}) {
  return a({
    id: t,
    task_name: "history",
    form_data: e,
    method: "get",
    callback: (n) => n.map((s) => ft(s)),
    path: Be
  });
}
const O = "systems";
function Ue(t) {
  return new ws(t);
}
function Ba(t = {}) {
  return y({ query_params: t, fn: Ue, path: O });
}
function Wa(t) {
  return y({ query_params: t, fn: Ue, path: `${O}/with_emails` });
}
function Qa(t, e = {}) {
  return h({ id: t, query_params: e, fn: Ue, path: O });
}
function Za(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: Ue,
    path: O
  });
}
function Ka(t) {
  return A({ form_data: t, query_params: {}, fn: Ue, path: O });
}
function Ja(t) {
  return k({ id: t, query_params: {}, path: O });
}
function Va(t, e, n = {}) {
  return a({
    id: t,
    task_name: `module/${e}`,
    form_data: n,
    method: "put",
    callback: (s) => Ue(s),
    path: O
  });
}
function Ya(t, e) {
  return a({
    id: t,
    task_name: `module/${e}`,
    form_data: {},
    method: "del",
    callback: (n) => Ue(n),
    path: O
  });
}
function Xa(t, e = {}) {
  return a({
    id: t,
    task_name: "start",
    form_data: e,
    path: O
  });
}
function eh(t, e = {}) {
  return a({
    id: t,
    task_name: "stop",
    form_data: e,
    path: O
  });
}
function th(t, e, n, s = 1, i = []) {
  return a({
    id: t,
    task_name: `${n}_${s}/${encodeURIComponent(e)}`,
    form_data: i,
    path: O
  });
}
function nh(t, e, n = 1) {
  return a({
    id: t,
    task_name: `${e}_${n}`,
    method: "get",
    path: O
  });
}
function sh(t, e, n = 1, s) {
  return a({
    id: t,
    task_name: `${e}_${n}/${s}`,
    method: "get",
    path: O
  });
}
function ih(t, e, n = 1) {
  return a({
    id: t,
    task_name: `functions/${e}_${n}`,
    method: "get",
    path: O
  });
}
function rh(t) {
  return a({ id: t, task_name: "types", method: "get", path: O });
}
function oh(t) {
  return y({
    query_params: {},
    fn: (e) => new rn(e),
    path: `${O}/${t}/zones`
  });
}
function uh(t, e = {}) {
  return y({
    query_params: e,
    fn: (n) => new de(n),
    path: `${O}/${t}/triggers`
  });
}
function ch(t, e) {
  return a({
    id: t,
    task_name: "triggers",
    form_data: e,
    method: "post",
    callback: (n) => new de(n),
    path: O
  });
}
function ah(t, e) {
  return a({
    id: t,
    task_name: `triggers/${e}`,
    method: "del",
    path: O
  });
}
function hh(t) {
  return a({
    id: t,
    task_name: "settings",
    method: "get",
    callback: (e) => e.map((n) => new Te(n)),
    path: O
  });
}
function lh(t = {}) {
  const e = u(), n = e.startsWith("https") ? "wss:" : "ws:", s = e.startsWith("https") ? "https:" : "http:";
  let i = `${e.replace(s, n).replace(/\/$/, "")}/${O}/control`;
  return t.fixed_device && (i += `?fixed_device=${encodeURIComponent(String(t.fixed_device))}`), i;
}
function ph(t, e = {}) {
  return a({
    id: t,
    task_name: "metadata",
    form_data: e,
    method: "get",
    path: O
  });
}
function dh(t, e, n = {}) {
  return a({
    id: t,
    task_name: `triggers/${encodeURIComponent(e)}`,
    form_data: n,
    method: "get",
    callback: (s) => new de(s),
    path: O
  });
}
function fh(t, e, n, s = "patch") {
  return a({
    id: t,
    task_name: `triggers/${encodeURIComponent(e)}`,
    form_data: n,
    method: s,
    callback: (i) => new de(i),
    path: O
  });
}
const We = "triggers";
function pn(t) {
  return new de(t);
}
function _h(t = {}) {
  return y({ query_params: t, fn: pn, path: We });
}
function mh(t, e = {}) {
  return h({ id: t, query_params: e, fn: pn, path: We });
}
function gh(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: pn,
    path: We
  });
}
function yh(t) {
  return A({ form_data: t, query_params: {}, fn: pn, path: We });
}
function $h(t) {
  return k({ id: t, query_params: {}, path: We });
}
function bh(t) {
  return a({
    id: t,
    task_name: "instances",
    form_data: {},
    method: "get",
    callback: (e) => e.map((n) => new de(n)),
    path: We
  });
}
var $r = /* @__PURE__ */ ((t) => (t.EQ = "equal", t.NEQ = "not_equal", t.GT = "greater_than", t.GTE = "greater_than_or_equal", t.LT = "less_than", t.LTE = "less_than_or_equal", t.AND = "and", t.OR = "or", t.XOR = "exclusive_or", t))($r || {}), br = /* @__PURE__ */ ((t) => (t.AT = "at", t.CRON = "cron", t))(br || {}), vr = /* @__PURE__ */ ((t) => (t[t.ExecuteBefore = 0] = "ExecuteBefore", t[t.ExecuteAfter = 1] = "ExecuteAfter", t[t.PayloadOnly = 2] = "PayloadOnly", t[t.IgnorePayload = 3] = "IgnorePayload", t))(vr || {});
const kr = "webhook";
function vh(t, e = {}) {
  const n = g(e), s = `${u()}/${kr}/${encodeURIComponent(t)}${n ? "?" + n : ""}`;
  return _(s).then((i) => new de(i));
}
const X = "users";
function Ee(t) {
  return new Fn(t);
}
function kh(t = {}) {
  return y({ query_params: t, fn: Ee, path: X });
}
function Sh(t, e = {}) {
  return h({ id: t, query_params: e, fn: Ee, path: X });
}
function Ah(t = {}) {
  return h({ id: "current", query_params: t, fn: Ee, path: X });
}
function xh(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: Ee,
    path: X
  });
}
function qh(t) {
  return A({ form_data: t, query_params: {}, fn: Ee, path: X });
}
function Ph(t, e = {}) {
  return k({ id: t, query_params: e, path: X });
}
function Th(t) {
  const e = g(t), n = `${u()}${X}/groups${e ? "?" + e : ""}`;
  return _(n).then((s) => s);
}
function Rh(t) {
  const e = g(t), n = `${u()}${X}/metadata/search${e ? "?" + e : ""}`;
  return _(n).then(
    (s) => (s || []).map((i) => Ee(i))
  );
}
function Ih() {
  const t = `${u()}${X}/resource_token`;
  return v(t, {}).then(
    (e) => e
  );
}
function Uh(t, e = {}) {
  return a({
    id: t,
    task_name: "metadata",
    form_data: e,
    method: "get",
    path: X
  });
}
function Eh(t) {
  const e = `${u()}${X}/${encodeURIComponent(t)}/resource_token`;
  return V(e, { response_type: "void" });
}
function Oh(t) {
  const e = `${u()}${X}/${encodeURIComponent(t)}/resource_token`;
  return v(e, {}).then(
    (n) => n
  );
}
function Mh(t) {
  return a({
    id: t,
    task_name: "revive",
    form_data: {},
    method: "post",
    callback: (e) => Ee(e),
    path: X
  });
}
const _e = "zones";
function dn(t) {
  return new rn(t);
}
function Ch(t = {}) {
  return y({ query_params: t, fn: dn, path: _e });
}
function wh(t = {}) {
  return h({
    id: "tags",
    query_params: t,
    fn: (e) => e,
    path: _e
  });
}
function Nh(t, e = {}) {
  return h({ id: t, query_params: e, fn: dn, path: _e });
}
function Dh(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: dn,
    path: _e
  });
}
function Hh(t, e = {}) {
  return A({ form_data: t, query_params: e, fn: dn, path: _e });
}
function zh(t) {
  return k({ id: t, query_params: {}, path: _e });
}
function Fh(t, e = {}) {
  return y({
    query_params: e,
    fn: (n) => new de(n),
    path: `${_e}/${t}/triggers`
  });
}
function Lh(t, e, n, s = 1, i = []) {
  return a({
    id: t,
    task_name: `exec/${encodeURIComponent(
      n + "_" + s
    )}/${encodeURIComponent(e)}`,
    form_data: i,
    path: _e
  });
}
function jh(t, e = {}) {
  return a({
    id: t,
    task_name: "metadata",
    form_data: e,
    method: "get",
    path: _e
  });
}
function Gh(t, e = {}) {
  const n = g({ url: t });
  return _(`${u()}/proxy?${n}`, {
    ...e,
    response_type: "blob",
    skip_auth: !0
  });
}
const _t = "signage/ai", Jn = "signage/ai/jobs", Qe = "signage/ai/providers";
function Bh() {
  return h({
    id: "capabilities",
    query_params: {},
    fn: (t) => t,
    path: _t
  });
}
function Wh(t) {
  return v(`${u()}/${_t}/generate`, t).then(
    (e) => e
  );
}
function Qh(t) {
  return v(`${u()}/${_t}/edit`, t).then(
    (e) => e
  );
}
function Zh(t, e = {}, n) {
  return h({
    id: t,
    query_params: e,
    fn: (s) => s,
    path: Jn,
    options: n
  });
}
function Kh(t = {}) {
  return h({
    id: "jobs",
    query_params: t,
    fn: (e) => e,
    path: _t
  });
}
function Jh(t) {
  return a({
    id: t,
    task_name: "cancel",
    method: "post",
    path: Jn,
    callback: (e) => e
  });
}
function Vh(t, e) {
  return a({
    id: t,
    task_name: "claim",
    form_data: e,
    method: "post",
    path: Jn,
    callback: (n) => n
  });
}
function Yh(t = {}) {
  return h({
    id: "usage",
    query_params: t,
    fn: (e) => e,
    path: _t
  });
}
function Fs(t) {
  return t;
}
function Xh(t = {}) {
  return y({
    query_params: t,
    fn: Fs,
    path: Qe
  });
}
function el(t) {
  return h({
    id: t,
    query_params: {},
    fn: Fs,
    path: Qe
  });
}
function tl(t) {
  return v(`${u()}/${Qe}`, t).then(
    (e) => e
  );
}
function nl(t, e, n = "patch") {
  return (n === "put" ? ce : te)(
    `${u()}/${Qe}/${t}`,
    e
  ).then((s) => s);
}
function sl(t) {
  return k({ id: t, query_params: {}, path: Qe });
}
function il(t) {
  return a({
    id: t,
    task_name: "test",
    method: "post",
    path: Qe,
    callback: (e) => e
  });
}
var Ls = /* @__PURE__ */ ((t) => (t.Default = "default", t.Cut = "cut", t.CrossFade = "cross_fade", t.SlideTop = "slide_top", t.SlideLeft = "slide_left", t.SlideRight = "slide_right", t.SlideBottom = "slide_bottom", t))(Ls || {});
class js {
  id;
  created_at;
  updated_at;
  name;
  description;
  authority_id;
  start_time;
  play_time;
  video_length;
  animation;
  media_type;
  orientation;
  media_uri;
  media_id;
  thumbnail_id;
  plugin_id;
  plugin_params;
  play_count;
  valid_from;
  valid_until;
  tags;
  /** User groups that the media item is shared with. Only set on the show requests result not the query */
  shared_with;
  /** Playlists that the media item is included within. Only set on the show requests result not the query */
  playlists;
  get media_url() {
    return this.media_id ? `/api/engine/v2/uploads/${this.media_id}/url` : this.media_uri;
  }
  get thumbnail_url() {
    return `/api/engine/v2/uploads/${this.thumbnail_id}/url`;
  }
  constructor(e) {
    this.id = e.id || "", this.created_at = e.created_at || In(Date.now()), this.updated_at = e.updated_at || In(Date.now()), this.name = e.name || "", this.description = e.description || "", this.authority_id = e.authority_id || "", this.start_time = e.start_time || 0, this.play_time = e.play_time || 0, this.video_length = e.video_length || 0, this.animation = e.animation, this.media_type = e.media_type || "unknown", this.orientation = e.orientation || "unspecified", this.media_uri = e.media_uri || "", this.media_id = e.media_id || "", this.thumbnail_id = e.thumbnail_id || "", this.plugin_id = e.plugin_id || "", this.plugin_params = e.plugin_params || {}, this.play_count = e.play_count || 0, this.valid_from = e.valid_from, this.valid_until = e.valid_until, this.tags = e.tags || [], this.shared_with = e.shared_with || [], this.playlists = e.playlists || [];
  }
}
class Sr {
  id;
  playlist_id;
  items;
  media;
  schedules;
  created_at;
  updated_at;
  user_id;
  user_name;
  user_email;
  approved;
  approval_requested;
  requested_by_id;
  approved_by_id;
  approved_by_email;
  approved_by_name;
  shared_with;
  constructor(e = {}) {
    this.id = e.id || "", this.playlist_id = e.playlist_id || "", this.created_at = e.created_at || 0, this.updated_at = e.updated_at || 0, this.items = e.items || [], this.media = e.media || [], this.schedules = e.schedules || [], this.approved = !!e.approved, this.approval_requested = !!e.approval_requested, this.requested_by_id = e.requested_by_id || "", this.approved_by_id = e.approved_by_id || "", this.approved_by_email = e.approved_by_email || "", this.approved_by_name = e.approved_by_name || "", this.user_id = e.user_id || "", this.user_name = e.user_name || "", this.user_email = e.user_email || "", this.shared_with = e.shared_with || [];
  }
}
class Ar {
  id;
  playlist_id;
  item_id;
  schedules;
  created_at;
  updated_at;
  media;
  constructor(e = {}) {
    this.id = e.id || "", this.playlist_id = e.playlist_id || "", this.item_id = e.item_id || "", this.schedules = e.schedules || [], this.created_at = e.created_at || 0, this.updated_at = e.updated_at || 0, this.media = e.media || new js({});
  }
}
class xr {
  id;
  created_at;
  updated_at;
  name;
  description;
  authority_id;
  orientation;
  play_count;
  play_through_count;
  default_animation;
  random;
  enabled;
  distribution;
  default_duration;
  schedules;
  valid_from;
  valid_until;
  shared_with;
  constructor(e) {
    this.id = e.id || "", this.created_at = e.created_at || 0, this.updated_at = e.updated_at || 0, this.name = e.name || "", this.description = e.description || "", this.authority_id = e.authority_id || "", this.orientation = e.orientation || "", this.play_count = e.play_count || 0, this.play_through_count = e.play_through_count || 0, this.default_animation = e.default_animation || Ls.Cut, this.random = e.random || !1, this.enabled = e.enabled ?? !0, this.distribution = e.distribution || !1, this.default_duration = e.default_duration ?? 15 * 1e3, this.valid_from = e.valid_from, this.valid_until = e.valid_until, this.schedules = e.schedules || [], this.shared_with = e.shared_with || [];
  }
}
class qr {
  id;
  created_at;
  updated_at;
  name;
  description;
  uri;
  playback_type;
  plugin_type;
  authority_id;
  enabled;
  params;
  defaults;
  constructor(e = {}) {
    this.id = e.id || "", this.created_at = e.created_at || 0, this.updated_at = e.updated_at || 0, this.name = e.name || "", this.description = e.description || "", this.uri = e.uri || "", this.playback_type = e.playback_type || "static", this.plugin_type = e.plugin_type || "plugin", this.authority_id = e.authority_id || "", this.enabled = e.enabled ?? !0, this.params = e.params || {}, this.defaults = e.defaults || {};
  }
}
class Pr {
  created_at;
  updated_at;
  id;
  name;
  description;
  tags;
  authority_id;
  background_item_id;
  layouts;
  full_screen_takeover;
  merge;
  approval_requested;
  requested_by_id;
  approved;
  approved_by_id;
  approved_by_name;
  approved_by_email;
  live_template_id;
  shared_with;
  constructor(e = {}) {
    this.created_at = e.created_at || "", this.updated_at = e.updated_at || "", this.id = e.id || "", this.name = e.name || "", this.description = e.description || "", this.tags = e.tags || [], this.authority_id = e.authority_id || "", this.background_item_id = e.background_item_id || "", this.layouts = e.layouts || [], this.full_screen_takeover = e.full_screen_takeover || !1, this.merge = e.merge ?? !1, this.approval_requested = e.approval_requested || !1, this.requested_by_id = e.requested_by_id || "", this.approved = e.approved || !1, this.approved_by_id = e.approved_by_id || "", this.approved_by_name = e.approved_by_name || "", this.approved_by_email = e.approved_by_email || "", this.live_template_id = e.live_template_id || "", this.shared_with = e.shared_with || [];
  }
}
class Tr {
  created_at;
  updated_at;
  id;
  control_system_id;
  zone_id;
  template_id;
  schedule;
  constructor(e = {}) {
    this.created_at = e.created_at || "", this.updated_at = e.updated_at || "", this.id = e.id || "", this.control_system_id = e.control_system_id || "", this.zone_id = e.zone_id || "", this.template_id = e.template_id || "", this.schedule = e.schedule || null;
  }
}
const Gs = "signage";
function rl(t, e = {}, n) {
  return h({ id: t, query_params: e, fn: (s) => s, path: `${Gs}`, options: n });
}
function ol(t, e) {
  return a({
    id: t,
    task_name: "metrics",
    form_data: e,
    method: "post",
    path: Gs
  });
}
const ie = "signage/media";
function fn(t) {
  return new js(t);
}
function ul(t = {}) {
  return y({ query_params: t, fn, path: ie });
}
function cl(t = {}) {
  return h({
    id: "tags",
    query_params: t,
    fn: (e) => e,
    path: ie
  });
}
function al(t = {}) {
  return h({
    id: "tag_counts",
    query_params: t,
    fn: (e) => e,
    path: ie
  });
}
function hl(t) {
  const e = g(t);
  return te(
    `${u()}/${ie}/tags?${e}`,
    {},
    {
      response_type: "void"
    }
  );
}
function ll(t) {
  const e = g(t);
  return V(`${u()}/${ie}/tags?${e}`, {
    response_type: "void"
  });
}
function pl(t, e = {}) {
  return h({ id: t, query_params: e, fn, path: ie });
}
function dl(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn,
    path: ie
  });
}
function fl(t, e = {}) {
  return A({
    form_data: t,
    query_params: e,
    fn,
    path: ie
  });
}
function _l(t, e = {}) {
  return k({ id: t, query_params: e, path: ie });
}
function ml(t) {
  return `${u()}/${ie}/${t}/thumbnail`;
}
function gl(t) {
  const e = g(t);
  return v(
    `${u()}/${ie}/share${e ? "?" + e : ""}`,
    {}
  ).then((n) => n);
}
const K = "signage/playlists";
function _n(t) {
  return new xr(t);
}
function mn(t) {
  return new Sr(t);
}
function Rr(t) {
  return new Ar(t);
}
function yl(t = {}) {
  return y({ query_params: t, fn: _n, path: K });
}
function $l(t, e = {}) {
  return h({
    id: t,
    query_params: e,
    fn: _n,
    path: K
  });
}
function bl(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: _n,
    path: K
  });
}
function vl(t, e = {}) {
  return A({
    form_data: t,
    query_params: e,
    fn: _n,
    path: K
  });
}
function kl(t, e = {}) {
  return k({ id: t, query_params: e, path: K });
}
function Sl(t) {
  return a({
    id: t,
    task_name: "media",
    form_data: {},
    method: "get",
    callback: mn,
    path: K
  });
}
function Al(t, e = {}) {
  return a({
    id: t,
    task_name: "media/revisions",
    form_data: e,
    method: "get",
    callback: (n) => n.map(mn),
    path: K
  });
}
function xl(t) {
  return a({
    id: t,
    task_name: "media/approve",
    method: "post",
    path: K
  });
}
function ql(t, e, n = "", s = "") {
  const i = g({ group_id: e, approver_id: s });
  return a({
    id: t,
    task_name: `media/request_approval${i ? "?" + i : ""}`,
    method: "post",
    path: K,
    form_data: { message: n }
  });
}
function Pl(t) {
  return h({
    id: "approvers",
    query_params: { group_id: t },
    fn: (e) => e,
    path: K
  });
}
function Tl(t, e) {
  return a({
    id: t,
    task_name: "media",
    form_data: e,
    method: "post",
    path: K,
    callback: mn
  });
}
function Rl(t, e) {
  return a({
    id: t,
    task_name: "media/schedule",
    form_data: e,
    method: "post",
    path: K,
    callback: mn
  });
}
function Il(t, e, n) {
  return te(
    `${u()}/${K}/${t}/media/schedule/${e}`,
    n
  ).then(Rr);
}
function Ul(t) {
  const e = g(t);
  return v(
    `${u()}/${K}/share${e ? "?" + e : ""}`,
    {}
  ).then((n) => n);
}
const mt = "signage/plugins";
function gn(t) {
  return new qr(t);
}
function El(t = {}) {
  return y({ query_params: t, fn: gn, path: mt });
}
function Ol(t, e = {}) {
  return h({
    id: t,
    query_params: e,
    fn: gn,
    path: mt
  });
}
function Ml(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: gn,
    path: mt
  });
}
function Cl(t) {
  return A({
    form_data: t,
    query_params: {},
    fn: gn,
    path: mt
  });
}
function wl(t, e = {}) {
  return k({ id: t, query_params: e, path: mt });
}
const ae = "signage/templates";
function gt(t) {
  return new Pr(t);
}
function Nl(t = {}) {
  return y({ query_params: t, fn: gt, path: ae });
}
function Dl(t, e = {}) {
  return h({
    id: t,
    query_params: e,
    fn: gt,
    path: ae
  });
}
function Hl(t, e = {}) {
  return A({
    form_data: t,
    query_params: e,
    fn: gt,
    path: ae
  });
}
function zl(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: gt,
    path: ae
  });
}
function Fl(t, e = {}) {
  return k({ id: t, query_params: e, path: ae });
}
function Ll(t) {
  return a({
    id: t,
    task_name: "draft",
    method: "del",
    path: ae
  });
}
function jl(t) {
  const e = g(t);
  return v(
    `${u()}/${ae}/share${e ? "?" + e : ""}`,
    {}
  ).then((n) => n);
}
function Gl(t) {
  return a({
    id: t,
    task_name: "approve",
    method: "post",
    path: ae,
    callback: gt
  });
}
function Bl(t) {
  return h({
    id: "approvers",
    query_params: { group_id: t },
    fn: (e) => e,
    path: ae
  });
}
function Wl(t, e, n = "", s) {
  const i = g({ group_id: e, approver_id: s });
  return a({
    id: t,
    task_name: `request_approval${i ? "?" + i : ""}`,
    method: "post",
    path: ae,
    form_data: { message: n }
  });
}
const yt = "signage/template_mappings";
function yn(t) {
  return new Tr(t);
}
function Ql(t = {}) {
  return y({
    query_params: t,
    fn: yn,
    path: yt
  });
}
function Zl(t) {
  return h({
    id: t,
    query_params: {},
    fn: yn,
    path: yt
  });
}
function Kl(t) {
  return A({
    form_data: t,
    query_params: {},
    fn: yn,
    path: yt
  });
}
function Jl(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: yn,
    path: yt
  });
}
function Vl(t) {
  return k({ id: t, query_params: {}, path: yt });
}
class Bs {
  id;
  question_id;
  survey_id;
  type;
  answer_json;
  constructor(e) {
    this.id = e.id || 0, this.question_id = e.question_id || 0, this.survey_id = e.survey_id || 0, this.type = e.type || "", this.answer_json = e.answer_json || {};
  }
}
const Ws = "/api/staff/v1/surveys/answers";
function Yl(t = {}) {
  const e = g(t);
  return _(`${Ws}${e ? "?" + e : ""}`).then(
    (n) => n.map((s) => new Bs(s))
  );
}
function Xl(t) {
  return v(`${Ws}`, t).then(
    (e) => e.map((n) => new Bs(n))
  );
}
class $n {
  id;
  survey_id;
  token;
  email;
  sent;
  constructor(e) {
    this.id = e.id || 0, this.survey_id = e.survey_id || 0, this.token = e.token || "", this.email = e.email || "", this.sent = e.sent ?? !1;
  }
}
const $t = "/api/staff/v1/surveys/invitations";
function ep(t = {}) {
  const e = g(t);
  return _(`${$t}${e ? "?" + e : ""}`).then(
    (n) => n.map((s) => new $n(s))
  );
}
function tp(t, e = {}) {
  const n = g(e);
  return _(`${$t}/${t}${n ? "?" + n : ""}`).then(
    (s) => new $n(s)
  );
}
function np(t, e, n = "patch") {
  return (n === "put" ? ce : te)(`${$t}/${t}`, e).then(
    (s) => new $n(s)
  );
}
function sp(t) {
  return v(`${$t}`, t).then((e) => new $n(e));
}
function ip(t, e = {}) {
  const n = g(e);
  return V(`${$t}/${t}${n ? "?" + n : ""}`);
}
class bn {
  id;
  title;
  description;
  type;
  options;
  required;
  max_rating;
  choices;
  tags;
  deleted;
  constructor(e) {
    this.id = e.id || 0, this.title = e.title || "", this.description = e.description || "", this.type = e.type || "", this.options = e.options || {}, this.required = e.required || !1, this.max_rating = e.max_rating || 0, this.choices = e.choices || [], this.tags = e.tags || [], this.deleted = e.deleted || !1;
  }
}
const bt = "/api/staff/v1/surveys/questions";
function rp(t = {}) {
  const e = g(t);
  return _(`${bt}${e ? "?" + e : ""}`).then(
    (n) => n.map((s) => new bn(s))
  );
}
function op(t, e = {}) {
  const n = g(e);
  return _(`${bt}/${t}${n ? "?" + n : ""}`).then(
    (s) => new bn(s)
  );
}
function up(t) {
  return v(`${bt}`, t).then((e) => new bn(e));
}
function cp(t, e, n = "patch") {
  return (n === "put" ? ce : te)(`${bt}/${t}`, e).then(
    (s) => new bn(s)
  );
}
function ap(t, e = {}) {
  const n = g(e);
  return V(`${bt}/${t}${n ? "?" + n : ""}`);
}
class vn {
  id;
  title;
  description;
  trigger;
  building_id;
  zone_id;
  pages;
  constructor(e) {
    this.id = e.id || 0, this.title = e.title || "", this.description = e.description || "", this.building_id = e.building_id || "", this.zone_id = e.zone_id || "", this.pages = e.pages || [], this.trigger = e.trigger || "NONE";
  }
}
const vt = "/api/staff/v1/surveys";
function hp(t = {}) {
  const e = g(t);
  return _(`${vt}${e ? "?" + e : ""}`).then(
    (n) => n.map((s) => new vn(s))
  );
}
function lp(t, e = {}) {
  const n = g(e);
  return _(`${vt}/${t}${n ? "?" + n : ""}`).then(
    (s) => new vn(s)
  );
}
function pp(t, e, n = "patch") {
  return (n === "put" ? ce : te)(`${vt}/${t}`, e).then(
    (s) => new vn(s)
  );
}
function dp(t) {
  return v(`${vt}`, t).then((e) => new vn(e));
}
function fp(t, e = {}) {
  const n = g(e);
  return V(`${vt}/${t}${n ? "?" + n : ""}`);
}
class Ir {
  id;
  parent_category_id;
  name;
  description;
  hidden;
  created_at;
  updated_at;
  constructor(e) {
    this.id = e.id || "", this.parent_category_id = e.parent_category_id || "", this.name = e.name || "", this.description = e.description || "", this.hidden = e.hidden || !1, this.created_at = e.created_at || 0, this.updated_at = e.updated_at || 0;
  }
}
class Ur {
  id;
  purchase_order_number;
  invoice_number;
  supplier_details;
  purchase_date;
  unit_price;
  expected_service_start_date;
  expected_service_end_date;
  created_at;
  updated_at;
  constructor(e) {
    this.id = e.id || "", this.purchase_order_number = e.purchase_order_number || "", this.invoice_number = e.invoice_number || "", this.supplier_details = e.supplier_details || {}, this.purchase_date = e.purchase_date || 0, this.unit_price = e.unit_price || 0, this.expected_service_start_date = e.expected_service_start_date || 0, this.expected_service_end_date = e.expected_service_end_date || 0, this.created_at = e.created_at || 0, this.updated_at = e.updated_at || 0;
  }
}
class Er {
  id;
  category_id;
  name;
  brand;
  description;
  model_number;
  images;
  created_at;
  updated_at;
  constructor(e) {
    this.id = e.id || "", this.category_id = e.category_id || "", this.name = e.name || "", this.brand = e.brand || "", this.description = e.description || "", this.model_number = e.model_number || "", this.images = e.images || [], this.created_at = e.created_at || 0, this.updated_at = e.updated_at || 0;
  }
}
class Or {
  id;
  parent_id;
  asset_type_id;
  purchase_order_id;
  zone_id;
  identifier;
  serial_number;
  other_data;
  barcode;
  name;
  client_ids;
  map_id;
  bookable;
  accessible;
  zones;
  place_groups;
  assigned_to;
  assigned_name;
  features;
  images;
  notes;
  security_system_groups;
  created_at;
  updated_at;
  constructor(e) {
    this.id = e.id || "", this.parent_id = e.parent_id || "", this.asset_type_id = e.asset_type_id || "", this.purchase_order_id = e.purchase_order_id || "", this.zone_id = e.zone_id || "", this.identifier = e.identifier || "", this.serial_number = e.serial_number || "", this.other_data = e.other_data || {}, this.barcode = e.barcode || "", this.name = e.name || "", this.client_ids = e.client_ids || {}, this.map_id = e.map_id || "", this.bookable = e.bookable || !1, this.accessible = e.accessible || !1, this.zones = e.zones || [], this.place_groups = e.place_groups || [], this.assigned_to = e.assigned_to || "", this.assigned_name = e.assigned_name || "", this.features = e.features || [], this.images = e.images || [], this.notes = e.notes || "", this.security_system_groups = e.security_system_groups || [], this.created_at = e.created_at || 0, this.updated_at = e.updated_at || 0;
  }
}
const ke = "assets";
function Oe(t) {
  return new Or(t);
}
function _p(t = {}) {
  return y({
    query_params: t,
    fn: Oe,
    path: ke
  });
}
function mp(t, e = {}) {
  return h({
    id: t,
    query_params: e,
    fn: Oe,
    path: ke
  });
}
function gp(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: Oe,
    path: ke
  });
}
function yp(t) {
  return A({
    form_data: t,
    query_params: {},
    fn: Oe,
    path: ke
  });
}
function $p(t, e = {}) {
  return k({ id: t, query_params: e, path: ke });
}
function bp(t) {
  return v(
    `${u()}${ke}/bulk`,
    JSON.stringify(t),
    {}
  ).then((e) => e.map((n) => Oe(n)));
}
function vp(t, e = "patch") {
  return (e === "put" ? ce : te)(
    `${u()}${ke}/bulk`,
    JSON.stringify(t),
    {}
  ).then((s) => s.map((i) => Oe(i)));
}
function kp(t, e = {}) {
  const n = g(e);
  return V(`${u()}${ke}/bulk${n ? "?" + n : ""}`, {
    body: JSON.stringify(t)
  }).then((s) => s.map((i) => Oe(i)));
}
const kt = "asset_types";
function kn(t) {
  return new Er(t);
}
function Sp(t = {}) {
  return y({
    query_params: t,
    fn: kn,
    path: kt
  });
}
function Ap(t, e = {}) {
  return h({
    id: t,
    query_params: e,
    fn: kn,
    path: kt
  });
}
function xp(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: kn,
    path: kt
  });
}
function qp(t) {
  return A({
    form_data: t,
    query_params: {},
    fn: kn,
    path: kt
  });
}
function Pp(t, e = {}) {
  return k({ id: t, query_params: e, path: kt });
}
const St = "asset_categories";
function Sn(t) {
  return new Ir(t);
}
function Tp(t = {}) {
  return y({
    query_params: t,
    fn: Sn,
    path: St
  });
}
function Rp(t, e = {}) {
  return h({
    id: t,
    query_params: e,
    fn: Sn,
    path: St
  });
}
function Ip(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: Sn,
    path: St
  });
}
function Up(t) {
  return A({
    form_data: t,
    query_params: {},
    fn: Sn,
    path: St
  });
}
function Ep(t, e = {}) {
  return k({ id: t, query_params: e, path: St });
}
const At = "asset_purchase_orders";
function An(t) {
  return new Ur(t);
}
function Op(t = {}) {
  return y({
    query_params: t,
    fn: An,
    path: At
  });
}
function Mp(t, e = {}) {
  return h({
    id: t,
    query_params: e,
    fn: An,
    path: At
  });
}
function Cp(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: An,
    path: At
  });
}
function wp(t) {
  return A({
    form_data: t,
    query_params: {},
    fn: An,
    path: At
  });
}
function Np(t, e = {}) {
  return k({ id: t, query_params: e, path: At });
}
class Mr {
  id;
  name;
  uri;
  description;
  user_id;
  user_email;
  user_name;
  redirect_count;
  enabled;
  valid_from;
  valid_until;
  authority_id;
  created_at;
  updated_at;
  constructor(e) {
    this.id = e.id || "", this.name = e.name || "", this.uri = e.uri || "", this.description = e.description || "", this.user_id = e.user_id || "", this.user_email = e.user_email || "", this.user_name = e.user_name || "", this.redirect_count = e.redirect_count || 0, this.enabled = e.enabled ?? !0, this.valid_from = e.valid_from || "", this.valid_until = e.valid_until || "", this.authority_id = e.authority_id || "", this.created_at = e.created_at || 0, this.updated_at = e.updated_at || 0;
  }
}
const he = "short_url";
function xn(t) {
  return new Mr(t);
}
function Dp(t = {}) {
  return y({
    query_params: t,
    fn: xn,
    path: he
  });
}
function Hp(t, e = {}) {
  return h({
    id: t,
    query_params: e,
    fn: xn,
    path: he
  });
}
function zp(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: xn,
    path: he
  });
}
function Fp(t) {
  return A({
    form_data: t,
    query_params: {},
    fn: xn,
    path: he
  });
}
function Lp(t, e = {}) {
  return k({ id: t, query_params: e, path: he });
}
function jp(t) {
  return `${u()}${he}/${encodeURIComponent(t)}/redirect`;
}
function Gp(t) {
  return _(
    `${u()}${he}/${encodeURIComponent(t)}/qr_code.svg`,
    { response_type: "text" }
  );
}
function Bp(t, e = {}) {
  const n = g(e);
  return `${u()}${he}/${encodeURIComponent(t)}/qr_code.png${n ? "?" + n : ""}`;
}
function Wp(t) {
  const { format: e = "svg", ...n } = t, s = { ...n, format: e }, i = g(s);
  return `${u()}${he}/qr_code${i ? "?" + i : ""}`;
}
function Qp(t) {
  const e = { ...t, format: "svg" }, n = g(e);
  return _(`${u()}${he}/qr_code${n ? "?" + n : ""}`, {
    response_type: "text"
  });
}
class Cr {
  id;
  storage_type;
  bucket_name;
  region;
  access_key;
  access_secret;
  authority_id;
  endpoint;
  is_default;
  ext_filter;
  mime_filter;
  created_at;
  updated_at;
  constructor(e) {
    this.id = e.id || "", this.storage_type = e.storage_type || null, this.bucket_name = e.bucket_name || "", this.region = e.region || "", this.access_key = e.access_key || "", this.access_secret = e.access_secret || "", this.authority_id = e.authority_id || "", this.endpoint = e.endpoint || "", this.is_default = e.is_default ?? !1, this.ext_filter = e.ext_filter || [], this.mime_filter = e.mime_filter || [], this.created_at = e.created_at || 0, this.updated_at = e.updated_at || 0;
  }
}
const xt = "storages";
function qn(t) {
  return new Cr(t);
}
function Zp(t = {}) {
  return y({
    query_params: t,
    fn: qn,
    path: xt
  });
}
function Kp(t, e = {}) {
  return h({
    id: t,
    query_params: e,
    fn: qn,
    path: xt
  });
}
function Jp(t, e, n = "patch") {
  return q({
    id: t,
    form_data: e,
    query_params: {},
    method: n,
    fn: qn,
    path: xt
  });
}
function Vp(t) {
  return A({
    form_data: t,
    query_params: {},
    fn: qn,
    path: xt
  });
}
function Yp(t, e = {}) {
  return k({ id: t, query_params: e, path: xt });
}
const Se = "webrtc";
function Xp(t = {}) {
  const e = g(t), n = `${u()}${Se}/rooms${e ? "?" + e : ""}`;
  return _(n).then((s) => s);
}
function ed(t) {
  const e = `${u()}${Se}/room/${encodeURIComponent(t)}`;
  return _(e).then((n) => n);
}
function td(t) {
  const e = `${u()}${Se}/members/${encodeURIComponent(t)}`;
  return _(e).then((n) => n);
}
function nd(t, e) {
  const n = `${u()}${Se}/guest_entry/${encodeURIComponent(t)}`;
  return v(n, e).then(() => {
  });
}
function sd() {
  const t = `${u()}${Se}/guest/exit`;
  return v(t, {}).then(() => {
  });
}
function id(t, e, n) {
  const s = `${u()}${Se}/kick/${encodeURIComponent(t)}/${encodeURIComponent(e)}`;
  return v(s, n).then(() => {
  });
}
function rd(t, e, n) {
  const s = `${u()}${Se}/transfer/${encodeURIComponent(t)}/${encodeURIComponent(e)}`;
  return v(s, n || {}).then(() => {
  });
}
function od() {
  const t = u(), e = t.startsWith("https") ? "wss:" : "ws:", n = t.startsWith("https") ? "https:" : "http:";
  return t.replace(n, e) + `${Se}/signaller`;
}
class Qs {
  _listeners = /* @__PURE__ */ new Set();
  _error_listeners = /* @__PURE__ */ new Set();
  _complete_listeners = /* @__PURE__ */ new Set();
  _closed = !1;
  next(e) {
    if (!this._closed)
      for (const n of [...this._listeners]) n(e);
  }
  error(e) {
    if (!this._closed) {
      for (const n of [...this._error_listeners]) n(e);
      this._closed = !0, this._clear();
    }
  }
  complete() {
    if (!this._closed) {
      for (const e of [...this._complete_listeners]) e();
      this._closed = !0, this._clear();
    }
  }
  subscribe(e, n, s) {
    return this._closed ? (s?.(), () => null) : (this._listeners.add(e), n && this._error_listeners.add(n), s && this._complete_listeners.add(s), () => {
      this._listeners.delete(e), n && this._error_listeners.delete(n), s && this._complete_listeners.delete(s);
    });
  }
  _clear() {
    this._listeners.clear(), this._error_listeners.clear(), this._complete_listeners.clear();
  }
}
class wr extends Qs {
  constructor(e) {
    super(), this._config = e, this._socket = new WebSocket(e.url), this._socket.onopen = () => {
      const n = [...this._queue];
      this._queue = [];
      for (const s of n) this.next(s);
    }, this._socket.onmessage = (n) => {
      super.next(this._deserialize(n));
    }, this._socket.onerror = (n) => this.error(n), this._socket.onclose = () => super.complete();
  }
  _socket;
  _queue = [];
  next(e) {
    this._socket.readyState === WebSocket.OPEN ? this._socket.send(
      this._serialize(e)
    ) : this._queue.push(e);
  }
  complete() {
    this._socket.close(), super.complete();
  }
  _serialize(e) {
    return this._config.serializer ? this._config.serializer(e) : `${e}`;
  }
  _deserialize(e) {
    return this._config.deserializer ? this._config.deserializer(e) : e.data;
  }
}
function Nr(t) {
  return new wr(
    typeof t == "string" ? { url: t } : t
  );
}
var ne = /* @__PURE__ */ ((t) => (t[t.PARSE_ERROR = 0] = "PARSE_ERROR", t[t.BAD_REQUEST = 1] = "BAD_REQUEST", t[t.ACCESS_DENIED = 2] = "ACCESS_DENIED", t[t.REQUEST_FAILED = 3] = "REQUEST_FAILED", t[t.UNKNOWN_CMD = 4] = "UNKNOWN_CMD", t[t.SYS_NOT_FOUND = 5] = "SYS_NOT_FOUND", t[t.MOD_NOT_FOUND = 6] = "MOD_NOT_FOUND", t[t.UNEXPECTED_FAILURE = 7] = "UNEXPECTED_FAILURE", t))(ne || {}), Zs = /* @__PURE__ */ ((t) => (t.Info = "info", t.Debug = "debug", t.Warning = "warn", t.Error = "error", t.Fatal = "fatal", t.Trace = "trace", t))(Zs || {});
class Dr {
  constructor(e, n) {
    this._system = e;
    const s = Object.getOwnPropertyNames(
      Object.getPrototypeOf(n)
    ).filter((i) => i.startsWith("$"));
    for (const i in n)
      n.hasOwnProperty(i) && n[i] !== void 0 && (n[i] instanceof Function ? this.addMethod(i, n[i]) : this.addProperty(i, n[i]));
    for (const i of s)
      n[i] instanceof Function && this.addMethod(i, n[i]);
  }
  /**
   * Call method on the module
   * @param command Name of the method to call on the module
   * @param args Array of arguments to pass to the method being called
   */
  call(e, n = []) {
    return this[`$${e}`] instanceof Function ? this[`$${e}`](...n) : null;
  }
  /**
   * Subscribe to value changes on the given property
   * @param prop_name Name of the property
   * @param next Callback for changes to the property
   */
  listen(e) {
    return !this[`_${e}`] && !this[e] && this.addProperty(e, null), this[`_${e}`].asReadonly();
  }
  /**
   * Add method to module
   * @param prop_name Name of the method
   * @param fn Method logic
   */
  addMethod(e, n) {
    e[0] !== "$" && (e = `$${e}`), this[e] = n;
  }
  /**
   * Add signal property to module
   * @param prop_name Name of the property
   * @param value Initial value of the property
   */
  addProperty(e, n) {
    e[0] === "$" && (e = e.replace("$", "")), this[`_${e}`] = se(n), Object.defineProperty(this, e, {
      get: () => this[`_${e}`].value,
      set: (s) => this[`_${e}`].set(s)
    });
  }
}
class Hr {
  constructor(e) {
    for (const n in e)
      e.hasOwnProperty(n) && e[n] && e[n] instanceof Array && e[n].forEach((s) => {
        this.addModule(n, s);
      });
  }
  /**
   * Add new module to the system
   * @param mod_name Module class
   * @param properties Properties of the new module
   */
  addModule(e, n) {
    this[e] || (this[e] = []), this[e].push(new Dr(this, n));
  }
}
const Ft = {};
function ud(t, e) {
  return Ft[t] = new Hr(e), Ft[t];
}
function zr(t) {
  return Ft[t];
}
function cd(t) {
  delete Ft[t];
}
const M = Gt("WS"), Ks = 15;
let qt = 0, ee, Js = 0;
const B = {}, Vn = {}, Fr = {}, Ae = se(!1), Vs = se([0, 0]);
let Ys = Date.now(), we, Lt = 0, me = null, Ut, Yn = 0;
const Pt = 10 * 1e3, Lr = se(null);
function Pn() {
  return u().indexOf("/control/") >= 0 ? "/control/websocket" : `${ys()}/systems/control`;
}
function Xs() {
  return Ae.value;
}
function jr() {
  return Ae.asReadonly();
}
function ad() {
  return Vs.asReadonly();
}
function Gr(t, e = Vn) {
  const n = `${t.sys}|${t.mod}_${t.index}|${t.name}`;
  return e[n] || (e[n] = se(void 0)), e[n].asReadonly();
}
function Br(t, e = Vn) {
  const n = `${t.sys}|${t.mod}_${t.index}|${t.name}`;
  if (e[n])
    return e[n].value;
}
function os(t, e = 0, n = Ze) {
  const s = {
    id: ++qt,
    cmd: "bind",
    ...t
  };
  return n(s, e);
}
function Wr(t, e = 0, n = Ze) {
  const s = {
    id: ++qt,
    cmd: "unbind",
    ...t
  };
  return n(s, e);
}
function Qr(t, e = Pt, n = Ze) {
  const s = {
    id: ++qt,
    cmd: "exec",
    ...t
  };
  return n(s, e);
}
function hd(t, e = Pt, n = Ze) {
  const s = {
    id: ++qt,
    cmd: "debug",
    ...t
  };
  return n(s, e);
}
function ld(t, e = Pt, n = Ze) {
  const s = {
    id: ++qt,
    cmd: "ignore",
    ...t
  };
  return n(s, e);
}
function Ze(t, e = Pt, n = 0) {
  const s = `${t.cmd}|${t.sys}|${t.mod}${t.index}|${t.name}|${t.args}|${mi()}`;
  if (B[s])
    M("Request already in progress. Waiting...", t);
  else {
    const i = { ...t, key: s };
    i.promise = new Promise((r, o) => {
      const l = () => {
        delete B[s], B[s] = null, Ze(t, e, n).then(
          (b) => r(b),
          (b) => o(b)
        );
      };
      if (ee && Xs()) {
        Mn() && eo(t, ee, Fr), i.resolve = r, i.reject = o;
        const b = `${t.sys}, ${t.mod}_${t.index}, ${t.name}`;
        M(
          `[${t.cmd.toUpperCase()}](${t.id}) ${b}`,
          t.args
        ), ee.next(t), e > 0 && ue(
          `${s}`,
          () => {
            o("Request timed out."), delete B[s], B[s] = null;
          },
          e
        );
      } else me ? setTimeout(() => l(), 1e3) : Xn().then(() => l());
    }), B[s] = i;
  }
  return B[s].promise;
}
function ei(t) {
  if (t !== "pong" && t instanceof Object) {
    if (t.type === "notify" && t.meta)
      Jr(t.meta, t.value);
    else if (t.type === "success")
      Zr(t);
    else if (t.type === "debug") {
      M(`[DEBUG] ${t.mod}${t.klass || ""} →`, t.msg);
      const e = t.meta || { mod: "", index: "" };
      Lr.set({
        mod_id: t.mod || "<empty>",
        module: `${e.mod}_${e.index}`,
        class_name: t.klass || "<empty>",
        message: t.msg || "<empty>",
        level: t.level || Zs.Debug,
        time: Math.floor((/* @__PURE__ */ new Date()).getTime() / 1e3)
      });
    } else t.type === "error" ? Kr(t) : t.cmd || M.error("Invalid websocket message", t);
    $e(`${t.id}`);
  } else t === "pong" && (Yn = Date.now(), M("Pong!"));
}
function Zr(t) {
  const e = Object.keys(B).map((n) => B[n]).find((n) => n?.id === t.id);
  M(`[SUCCESS](${t.id})`), e && e.resolve && (e.resolve(t.value), delete B[e.key]);
}
function Kr(t) {
  let e = "UNEXPECTED FAILURE";
  switch (t.code) {
    case ne.ACCESS_DENIED:
      e = "ACCESS DENIED";
      break;
    case ne.BAD_REQUEST:
      e = "BAD REQUEST";
      break;
    case ne.MOD_NOT_FOUND:
      e = "MODULE NOT FOUND";
      break;
    case ne.SYS_NOT_FOUND:
      e = "SYSTEM NOT FOUND";
      break;
    case ne.PARSE_ERROR:
      e = "PARSE ERROR";
      break;
    case ne.REQUEST_FAILED:
      e = "REQUEST FAILED";
      break;
    case ne.UNKNOWN_CMD:
      e = "UNKNOWN COMMAND";
      break;
  }
  M.error(`[ERROR] ${e}(${t.id}): ${t.msg}`);
  const n = Object.keys(B).map((s) => B[s]).filter((s) => s).find((s) => s.id === t.id);
  n && n.reject && (n.reject(t), $e(`${n.key}`), delete B[n.key]);
}
function Jr(t, e, n = Vn) {
  const s = `${t.sys}|${t.mod}_${t.index}|${t.name}`;
  n[s] || (n[s] = se(null));
  const i = `${t.sys}, ${t.mod}_${t.index}, ${t.name}`;
  M(`[NOTIFY] ${i} changed`, [
    n[s].value,
    "→",
    e
  ]), n[s].set(e);
}
function Xn(t = 0) {
  return me == null && (me = new Promise((e) => {
    if (t > 40)
      return location.reload();
    Lt++, Ys = Date.now(), ee = Mn() ? Xr() : Vr(), ee ? (M.debug("Authority:", wt()), M("Connecting to websocket..."), ee.subscribe(
      (n) => {
        Ae.value || (M("Connection established."), e()), Ae.set(!0), Lt = 0, Tn(), ei(n);
      },
      (n) => {
        ee = void 0, me = null, as(), Tn(), Yr(n);
      },
      () => {
        ee = void 0, me = null, as(), M("Connection closed by browser."), Ae.set(!1), jt();
      }
    ), we && clearInterval(we), Yn = Date.now(), us(), we = setInterval(
      () => us(),
      Ks * 1e3
    ), Tn(), Js += 1, Ut = setTimeout(() => {
      M("Unhealthy connection. Reconnecting..."), Ae.set(!1), me = null, jt();
    }, 30 * 1e3)) : (ee ? M(
      `Waiting on auth(${t}). Retrying in ${1e3 * Math.min(10, t + 1)}ms...`,
      [!!J(), !!wt()],
      "info"
    ) : M.error(
      `Failed to create websocket(${t}). Retrying in ${1e3 * Math.min(10, t + 1)}ms...`
    ), setTimeout(
      () => {
        me = null, Xn(t).then((n) => e(n));
      },
      1e3 * Math.min(10, ++t)
    ));
  })), me;
}
function Vr() {
  if (!wt() || !J()) return null;
  const t = Pi() || location.protocol.indexOf("https") >= 0;
  let e = `ws${t ? "s" : ""}://${Un()}${Pn()}${$s() ? "?fixed_device=true" : ""}`;
  const n = J();
  let s = n === "x-api-key" ? `api-key=${nt()}` : `bearer_token=${n}`;
  return !Si() && !fi() ? (M("Authenticating through cookie..."), s += `;max-age=120;path=${Pn()};`, s += `${t ? "secure;" : ""}samesite=strict`, document.cookie = s, M("Cookies:", [document.cookie, s])) : (M("Authenticating through URL query parameter..."), e += `${e.indexOf("?") >= 0 ? "&" : "?"}${s}`), M(
    `Creating websocket connection to ws${t ? "s" : ""}://${Un()}${Pn()}`
  ), Nr({
    url: e,
    serializer: (i) => typeof i == "object" ? JSON.stringify(i) : i,
    deserializer: (i) => {
      let r = i.data;
      if (r === "pong") return r;
      try {
        return JSON.parse(i.data);
      } catch {
        return r;
      }
    }
  });
}
function jt() {
  Vs.set([Js, Date.now() - Ys]), ee && Xs() && (ee.complete(), we && (clearInterval(we), we = void 0)), M(
    `Reconnecting in ${Math.min(
      5e3,
      Lt * 300 || 1e3
    )}ms...`
  ), ue(
    "reconnect",
    () => Xn(),
    Math.min(5e3, (Lt + 1) * 300 || 1e3)
  );
}
function us() {
  if (Date.now() - Yn > 4 * Ks * 1e3)
    return jt();
  ee?.next("ping");
}
function Yr(t) {
  Ae.set(!1), M.error("Websocket error:", t), t.status === 401 && Nn(), wn(), jt();
}
function Tn() {
  Ut && (clearTimeout(Ut), Ut = void 0);
}
function Xr() {
  const t = new Qs();
  return t.subscribe(
    (e) => ei(e)
  ), t;
}
function cs(t, e) {
  const n = typeof e == "string" ? e : e?.message || e?.msg || "Mock realtime callback failed";
  return {
    id: t.id,
    type: "error",
    code: e?.code || ne.UNEXPECTED_FAILURE,
    msg: n
  };
}
function eo(t, e, n) {
  const s = `${t.sys}|${t.mod}_${t.index}|${t.name}`, i = zr(t.sys), r = i && i[t.mod] ? i[t.mod][t.index - 1 || 0] : null;
  if (r) {
    try {
      switch (t.cmd) {
        case "bind":
          n[s] = r.listen(t.name).subscribe((o) => {
            setTimeout(
              () => {
                e.next({
                  type: "notify",
                  value: o,
                  meta: t
                });
              },
              Math.floor(Math.random() * 100 + 50)
              // Add natural delay before response
            );
          });
          break;
        case "unbind":
          n[s] && (n[s](), delete n[s], $e(`${s}`));
          break;
      }
    } catch (o) {
      M.error(`[MOCK ERROR](${t.id}) request failed`, o), ue(
        `${t.id}-error`,
        () => e.next(cs(t, o)),
        10
      );
      return;
    }
    ue(
      `${t.id}-response`,
      () => {
        try {
          const o = {
            id: t.id,
            type: "success",
            value: t.cmd === "exec" ? r.call(t.name, t.args) : null
          };
          e.next(o);
        } catch (o) {
          M.error(
            `[MOCK ERROR](${t.id}) execute failed`,
            o
          ), e.next(cs(t, o));
        }
      },
      10
    );
  } else
    ue(
      `${t.id}-error`,
      () => e.next({
        id: t.id,
        type: "error",
        code: i ? ne.SYS_NOT_FOUND : ne.MOD_NOT_FOUND
      }),
      10
    );
}
function as() {
  for (const t in B)
    B[t] && delete B[t];
}
class hs {
  constructor(e, n) {
    this._module = e, this.name = n, jr().subscribe((s, i) => {
      s !== i && (s && (this._stale_bindings || this._pending === 1) ? (Ot("VAR", "Re-binding to status variable", this.binding()), this.rebind()) : s || ($e(`rebind:${JSON.stringify(this.binding())}`), Ot(
        "VAR",
        "Binding dropped due to disconnection, re-binding when possible.",
        this.binding()
      ), this._stale_bindings = this._binding_count || this._stale_bindings, this._binding_count = 0));
    });
  }
  /** Status variable name */
  name;
  /** Active pending state of the variable binding */
  _pending = 0;
  /** Number of active bindings to this variable */
  _binding_count = 0;
  /** Number of bindings to restore on reconnection */
  _stale_bindings = 0;
  /** Number of bindings to this status variable */
  get count() {
    return this._binding_count;
  }
  /** Current value of the binding */
  get value() {
    return Br(this.binding());
  }
  /**
   * Get a signal that emits the current value of the binding
   */
  listen() {
    return Gr(this.binding());
  }
  /**
   * Subscribe to changes of the variable's binding value.
   * Note: Initial value emitted may be `undefined`
   * @param next Callback for changes to the bindings value
   */
  subscribe(e) {
    return this.listen().subscribe(e);
  }
  bindThenSubscribe(e) {
    const n = this.bind(), s = this.listen().subscribe((i) => {
      try {
        e(i);
      } catch (r) {
        console.error(r);
      }
    });
    return () => {
      try {
        s();
      } finally {
        try {
          n();
        } catch {
        }
      }
    };
  }
  /**
   * Bind to the status variable's value
   */
  bind() {
    return (this._binding_count <= 0 && this._stale_bindings <= 0 || this._pending === 2) && (this._pending = 1, os(this.binding()).then(() => {
      this._binding_count++, this._pending = 0;
    }).catch(() => null)), () => this.unbind();
  }
  /**
   * Unbind from status variable
   */
  unbind() {
    this._binding_count === 1 && this._pending === 0 ? (this._pending = 2, Wr(this.binding()).then(() => {
      this._pending === 2 && (this._pending = 0), this._binding_count--;
    })) : this._binding_count = Math.max(this._binding_count - 1, 0);
  }
  /**
   * Rebind to the status variable
   */
  async rebind() {
    !this._stale_bindings && this._pending !== 1 || ue(
      `rebind:${JSON.stringify(this.binding())}`,
      async () => {
        await os(this.binding()), this._binding_count = this._stale_bindings || 1, this._stale_bindings = 0;
      },
      100
    );
  }
  /**
   * Generate binding details for the status variable
   */
  binding() {
    return {
      sys: this._module.system.id,
      mod: this._module.name,
      index: this._module.index,
      name: this.name
    };
  }
}
class to {
  constructor(e, n) {
    this._system = e, this._id = n;
  }
  /** Mapping of module bindings */
  _bindings = {};
  get id() {
    return `${this.name}_${this.index}`;
  }
  /** Parent system of the module */
  get system() {
    return this._system;
  }
  /** Module index */
  get index() {
    const n = this._id.split("_").pop();
    return parseInt(n || "", 10) || 1;
  }
  /** Module name */
  get name() {
    const e = this._id.split("_");
    return e.pop(), e.join("_");
  }
  /**
   * Get binding with the given name
   * @param name Name of the binding
   * @deprecated Use `variable` instead
   */
  binding(e) {
    return this._bindings[e] || (this._bindings[e] = new hs(this, e)), this._bindings[e];
  }
  /**
   * Get binding with the given name
   * @param name Name of the binding
   */
  variable(e) {
    return this._bindings[e] || (this._bindings[e] = new hs(this, e)), this._bindings[e];
  }
  /**
   * Execute method on the engine module
   * @param method Name of the method
   * @param args Array of arguments to pass to the method
   */
  execute(e, n, s = Pt) {
    return Qr(
      {
        sys: this._system.id,
        mod: this.name,
        index: this.index,
        name: e,
        args: n
      },
      s
    );
  }
}
class no {
  /** Unique idetifier of the system */
  id;
  /** Mapping of engine modules within the system */
  _module_list = {};
  constructor(e) {
    this.id = e;
  }
  /**
   * Get binding interface for the given module
   * @param module_id ID of the module
   * @param index Index of the module within the system
   */
  module(e, n = 1) {
    if (!e)
      throw new Error("Invalid module ID");
    const s = e.split("_");
    s.length > 1 && Number.isInteger(+s[s.length - 1]) && (n = +s[s.length - 1], s.pop()), n < 1 && (n = 1);
    const i = s.join("_");
    for (this._module_list[i] || (this._module_list[i] = []); this._module_list[i].length < n; )
      this._module_list[i].push(
        new to(
          this,
          `${i}_${this._module_list[i].length + 1}`
        )
      );
    return this._module_list[i][n - 1];
  }
}
const Rn = {};
function so(t) {
  return Rn[t] || (Rn[t] = new no(t)), Rn[t];
}
function pd(t, e, n = 1) {
  return so(t).module(e, n);
}
export {
  nr as AuthType,
  Ge as EncryptionLevel,
  Ls as MediaAnimation,
  Dr as MockPlaceWebsocketModule,
  Hr as MockPlaceWebsocketSystem,
  Ji as PlaceAlert,
  Vi as PlaceAlertDashboard,
  tr as PlaceApiKey,
  Yi as PlaceApplication,
  Or as PlaceAsset,
  Ir as PlaceAssetCategory,
  Ur as PlaceAssetPurchaseOrder,
  Er as PlaceAssetType,
  ir as PlaceCluster,
  or as PlaceDomain,
  Us as PlaceDriver,
  zt as PlaceDriverRole,
  ar as PlaceEdge,
  ne as PlaceErrorCodes,
  ur as PlaceGrant,
  jn as PlaceGroup,
  hr as PlaceGroupHistory,
  lr as PlaceGroupInvitation,
  Es as PlaceGroupUser,
  pr as PlaceGroupZone,
  dr as PlaceLDAPSource,
  Zs as PlaceLogLevel,
  sr as PlaceMQTTBroker,
  Cs as PlaceMetadata,
  Ns as PlaceModule,
  to as PlaceModuleBinding,
  mr as PlaceOAuthSource,
  cr as PlaceOrganisation,
  Is as PlacePartner,
  rr as PlaceProcess,
  gr as PlaceRepository,
  zs as PlaceRepositoryType,
  N as PlaceResource,
  yr as PlaceSAMLSource,
  Te as PlaceSettings,
  Mr as PlaceShortUrl,
  Cr as PlaceStorage,
  ws as PlaceSystem,
  no as PlaceSystemBinding,
  de as PlaceTrigger,
  Fn as PlaceUser,
  hs as PlaceVariableBinding,
  rn as PlaceZone,
  fr as PlaceZoneMetadata,
  js as SignageMedia,
  xr as SignagePlaylist,
  Ar as SignagePlaylistItemSchedule,
  Sr as SignagePlaylistMedia,
  qr as SignagePlugin,
  Pr as SignageTemplate,
  Tr as SignageTemplateMapping,
  vn as Survey,
  Bs as SurveyAnswer,
  $n as SurveyInvitation,
  bn as SurveyQuestion,
  $r as TriggerConditionOperator,
  br as TriggerTimeConditionType,
  vr as TriggerWebhookType,
  dc as acceptGroupInvitation,
  To as addAlert,
  ko as addAlertDashboard,
  Xl as addAnswer,
  Ho as addApiKey,
  Co as addApplication,
  yp as addAsset,
  Up as addAssetCategory,
  wp as addAssetPurchaseOrder,
  qp as addAssetType,
  bp as addAssets,
  Wo as addBroker,
  ru as addDomain,
  Pu as addDriver,
  wu as addEdge,
  hu as addGrant,
  ic as addGroup,
  lc as addGroupInvitation,
  mc as addGroupUser,
  vc as addGroupZone,
  sp as addInvitation,
  Pc as addLDAPSource,
  Oc as addMetadata,
  Fc as addModule,
  ea as addOAuthSource,
  _u as addOrganisation,
  ku as addPartner,
  up as addQuestion,
  pa as addRepository,
  Na as addSAMLSource,
  La as addSettings,
  Fp as addShortUrl,
  tl as addSignageAIProvider,
  fl as addSignageMedia,
  vl as addSignagePlaylist,
  Cl as addSignagePlugin,
  Hl as addSignageTemplate,
  Kl as addSignageTemplateMapping,
  Vp as addStorage,
  dp as addSurvey,
  Ka as addSystem,
  Va as addSystemModule,
  ch as addSystemTrigger,
  yh as addTrigger,
  qh as addUser,
  Hh as addZone,
  u as apiEndpoint,
  nt as apiKey,
  Ia as apiScopes,
  xl as approveSignagePlaylist,
  Gl as approveSignageTemplate,
  Bt as authorise,
  wt as authority,
  Oa as backfill,
  os as bind,
  Zo as buildMonitor,
  Nc as bulkMetadata,
  Ko as cancelBuildJob,
  Jh as cancelSignageAIJob,
  Vh as claimSignageAIImage,
  yu as claimZonesForOrganisation,
  di as cleanObject,
  _o as cleanupAuth,
  Ku as cleanupEdgeMonitoring,
  Ai as clientId,
  eu as clusterRebalance,
  tu as clusterVersions,
  io as computedSignal,
  ad as connectionState,
  ss as consoleHasColours,
  Ce as convertPairStringToMap,
  Ra as coreVersions,
  A as create,
  se as createSignal,
  nc as currentGroups,
  gu as currentReach,
  Ah as currentUser,
  Ih as currentUserResourceToken,
  hd as debug,
  Lr as debug_events,
  V as del,
  zi as deregisterMockEndpoint,
  cd as deregisterSystem,
  Eu as driverReadme,
  Bu as edgeConnections,
  Wu as edgeConnectionsFor,
  Hu as edgeControlUrl,
  zu as edgeErrors,
  Fu as edgeErrorsFor,
  Vu as edgeErrorsStreamUrl,
  Yu as edgeErrorsStreamUrlFor,
  ju as edgeHealth,
  Gu as edgeHealthFor,
  Qu as edgeModuleFailures,
  Lu as edgeModuleStatus,
  Xu as edgeModulesStreamUrl,
  Ju as edgeMonitoringSummary,
  Zu as edgeStatistics,
  Qh as editSignageImage,
  Di as exchangeEntraToken,
  Qr as execute,
  Jc as executeOnModule,
  th as executeOnSystem,
  Lh as executeOnZone,
  ih as functionList,
  _s as generateNonce,
  Qp as generateQrCode,
  Wh as generateSignageImage,
  _ as get,
  fs as getFragments,
  pd as getModule,
  Gp as getShortUrlQrCodeSvg,
  so as getSystem,
  ua as googleNotification,
  po as handleAuthRedirect,
  co as hasToken,
  qa as healthCheck,
  Un as host,
  ys as httpRoute,
  Mt as humanReadableByteCount,
  ld as ignore,
  Lo as inspectApiKey,
  Nn as invalidateToken,
  Uu as isDriverCompiled,
  $s as isFixedDevice,
  fi as isMobileSafari,
  Mn as isMock,
  _i as isNestedFrame,
  ao as isOnline,
  Pi as isSecure,
  Cn as isTrusted,
  Xs as is_connected,
  Uo as lastRequestTotal,
  wc as listChildMetadata,
  Ao as listDashboardAlerts,
  fa as listInterfaceRepositories,
  Rc as listMetadata,
  Ic as listMetadataHistory,
  ra as listPublicEvents,
  ma as listRemoteRepositoryBranches,
  ga as listRemoteRepositoryCommits,
  _a as listRemoteRepositoryDefaultBranch,
  ba as listRepositoryBranches,
  $a as listRepositoryCommits,
  va as listRepositoryDefaultBranch,
  ka as listRepositoryDriverDetails,
  ya as listRepositoryDrivers,
  xa as listRepositoryFiles,
  Aa as listRepositoryFolders,
  al as listSignageMediaTagCounts,
  cl as listSignageMediaTags,
  Pl as listSignagePlaylistApprovers,
  Sl as listSignagePlaylistMedia,
  Al as listSignagePlaylistMediaRevisions,
  Bl as listSignageTemplateApprovers,
  uh as listSystemTriggers,
  oh as listSystemZones,
  bh as listTriggerInstances,
  wh as listZoneTags,
  Fh as listZoneTriggers,
  Gr as listen,
  qi as listenForToken,
  Qc as loadModule,
  Ot as log,
  mo as logout,
  uu as lookupDomainByEmail,
  Wc as lookupModuleState,
  sh as lookupSystemModuleState,
  ml as mediaThumbnail,
  zr as mockSystem,
  Kc as moduleRuntimeError,
  Zc as moduleSettings,
  Bc as moduleState,
  sa as mqttAccess,
  na as mqttUser,
  ca as office365Notification,
  ho as onlineState,
  pi as parseLinkHeader,
  te as patch,
  Pa as platformInfo,
  v as post,
  Gh as proxyUrl,
  ia as publicEventGuestToken,
  Sa as pullRepositoryChanges,
  ce as put,
  Wp as qrCodeUrl,
  y as query,
  $o as queryAlertDashboards,
  xo as queryAlerts,
  Yl as queryAnswers,
  No as queryApiKeys,
  Eo as queryApplications,
  Tp as queryAssetCategories,
  Op as queryAssetPurchaseOrders,
  Sp as queryAssetTypes,
  _p as queryAssets,
  jo as queryBrokers,
  Jo as queryClusters,
  nu as queryDomains,
  Au as queryDrivers,
  Ou as queryEdges,
  cu as queryGrants,
  uc as queryGroupHistory,
  ac as queryGroupInvitations,
  fc as queryGroupUsers,
  $c as queryGroupZones,
  ec as queryGroups,
  ep as queryInvitations,
  Ac as queryLDAPSources,
  Dc as queryModules,
  Vc as queryOAuthSources,
  pu as queryOrganisations,
  $u as queryPartners,
  Yo as queryProcesses,
  rp as queryQuestions,
  aa as queryRepositories,
  Ma as querySAMLSources,
  Ha as querySettings,
  Dp as queryShortUrls,
  Kh as querySignageAIJobs,
  Xh as querySignageAIProviders,
  ul as querySignageMedia,
  yl as querySignagePlaylists,
  El as querySignagePlugins,
  Ql as querySignageTemplateMappings,
  Nl as querySignageTemplates,
  Zp as queryStorages,
  hp as querySurveys,
  Ba as querySystems,
  Wa as querySystemsWithEmails,
  _h as queryTriggers,
  Th as queryUserGroups,
  kh as queryUsers,
  Xp as queryWebrtcRooms,
  Ch as queryZones,
  Ru as recompileDriver,
  oo as redirectUri,
  wn as refreshAuthority,
  Ct as refreshToken,
  yo as registerMockEndpoint,
  oa as registerPublicEvent,
  ud as registerSystem,
  Ea as reindex,
  Iu as reloadDriver,
  k as remove,
  Ro as removeAlert,
  So as removeAlertDashboard,
  Fo as removeApiKey,
  wo as removeApplication,
  $p as removeAsset,
  Ep as removeAssetCategory,
  Np as removeAssetPurchaseOrder,
  Pp as removeAssetType,
  kp as removeAssets,
  Qo as removeBroker,
  ou as removeDomain,
  Tu as removeDriver,
  Nu as removeEdge,
  oe as removeFragment,
  lu as removeGrant,
  oc as removeGroup,
  pc as removeGroupInvitation,
  yc as removeGroupUser,
  Sc as removeGroupZone,
  ip as removeInvitation,
  Tc as removeLDAPSource,
  Mc as removeMetadata,
  Lc as removeModule,
  ta as removeOAuthSource,
  mu as removeOrganisation,
  Su as removePartner,
  ap as removeQuestion,
  da as removeRepository,
  Da as removeSAMLSource,
  ja as removeSettings,
  Lp as removeShortUrl,
  sl as removeSignageAIProvider,
  _l as removeSignageMedia,
  ll as removeSignageMediaTag,
  kl as removeSignagePlaylist,
  wl as removeSignagePlugin,
  Fl as removeSignageTemplate,
  Ll as removeSignageTemplateDraft,
  Vl as removeSignageTemplateMapping,
  Yp as removeStorage,
  fp as removeSurvey,
  Ja as removeSystem,
  Ya as removeSystemModule,
  ah as removeSystemTrigger,
  $h as removeTrigger,
  Ph as removeUser,
  Eh as removeUserResourceToken,
  zh as removeZone,
  Cc as renameMetadata,
  hl as renameSignageMediaTag,
  ql as requestApprovalSignagePlaylist,
  Wl as requestApprovalSignageTemplate,
  Io as requestTotal,
  Zi as responseHeaders,
  Du as retrieveEdgeToken,
  Mh as reviveUser,
  Rl as scheduleSignagePlaylistMedia,
  Gt as scoped_log,
  Rh as searchUserMetadata,
  Ta as serviceVersion,
  uo as setAPI_Key,
  go as setMockNotFoundHandler,
  fo as setStorage,
  xi as setToken,
  Ga as settingsHistory,
  lo as setup,
  gl as shareSignageMedia,
  Ul as shareSignagePlaylists,
  jl as shareSignageTemplates,
  Bp as shortUrlQrCodePngUrl,
  jp as shortUrlRedirectUrl,
  h as show,
  qo as showAlert,
  bo as showAlertDashboard,
  Do as showApiKey,
  Oo as showApplication,
  mp as showAsset,
  Rp as showAssetCategory,
  Mp as showAssetPurchaseOrder,
  Ap as showAssetType,
  Go as showBroker,
  Vo as showCluster,
  su as showDomain,
  xu as showDriver,
  Mu as showEdge,
  au as showGrant,
  tc as showGroup,
  sc as showGroupFeatures,
  cc as showGroupHistory,
  hc as showGroupInvitation,
  _c as showGroupUser,
  bc as showGroupZone,
  tp as showInvitation,
  xc as showLDAPSource,
  Uc as showMetadata,
  Hc as showModule,
  Yc as showOAuthSource,
  du as showOrganisation,
  bu as showPartner,
  op as showQuestion,
  ha as showRepository,
  Ca as showSAMLSource,
  za as showSettings,
  Hp as showShortUrl,
  rl as showSignage,
  Zh as showSignageAIJob,
  el as showSignageAIProvider,
  pl as showSignageMedia,
  $l as showSignagePlaylist,
  Ol as showSignagePlugin,
  Dl as showSignageTemplate,
  Zl as showSignageTemplateMapping,
  Kp as showStorage,
  lp as showSurvey,
  Qa as showSystem,
  dh as showSystemTrigger,
  mh as showTrigger,
  Sh as showUser,
  vh as showWebhook,
  ed as showWebrtcRoom,
  Nh as showZone,
  Bh as signageAICapabilities,
  Yh as signageAIUsage,
  Ua as signal,
  mi as simplifiedTime,
  vi as sleep,
  jc as startModule,
  Xa as startSystem,
  jr as status,
  Gc as stopModule,
  eh as stopSystem,
  lh as systemControlUrl,
  ph as systemMetadata,
  nh as systemModuleState,
  rh as systemModuleTypes,
  hh as systemSettings,
  Xo as terminateProcess,
  il as testSignageAIProvider,
  J as token,
  Wr as unbind,
  q as update,
  Po as updateAlert,
  vo as updateAlertDashboard,
  zo as updateApiKey,
  Mo as updateApplication,
  gp as updateAsset,
  Ip as updateAssetCategory,
  Cp as updateAssetPurchaseOrder,
  xp as updateAssetType,
  vp as updateAssets,
  Bo as updateBroker,
  iu as updateDomain,
  qu as updateDriver,
  Cu as updateEdge,
  rc as updateGroup,
  gc as updateGroupUser,
  kc as updateGroupZone,
  np as updateInvitation,
  qc as updateLDAPSource,
  Ec as updateMetadata,
  zc as updateModule,
  Xc as updateOAuthSource,
  fu as updateOrganisation,
  vu as updatePartner,
  cp as updateQuestion,
  la as updateRepository,
  wa as updateSAMLSource,
  Fa as updateSettings,
  zp as updateShortUrl,
  nl as updateSignageAIProvider,
  dl as updateSignageMedia,
  ol as updateSignageMetrics,
  bl as updateSignagePlaylist,
  Tl as updateSignagePlaylistMedia,
  Il as updateSignagePlaylistMediaSchedule,
  Ml as updateSignagePlugin,
  zl as updateSignageTemplate,
  Jl as updateSignageTemplateMapping,
  Jp as updateStorage,
  pp as updateSurvey,
  Za as updateSystem,
  fh as updateSystemTrigger,
  gh as updateTrigger,
  xh as updateUser,
  Dh as updateZone,
  Uh as userMetadata,
  Oh as userResourceToken,
  Br as value,
  ro as waitForSignal,
  nd as webrtcGuestEntry,
  sd as webrtcGuestExit,
  id as webrtcKickUser,
  td as webrtcSessionMembers,
  od as webrtcSignallerUrl,
  rd as webrtcTransferUser,
  Pn as websocketRoute,
  jh as zoneMetadata
};
//# sourceMappingURL=index.es.js.map
