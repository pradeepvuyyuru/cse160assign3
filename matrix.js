"use strict";

class Vector3 {
  constructor(elements) {
    this.elements = new Float32Array(elements || [0, 0, 0]);
  }

  set(v) {
    const src = v.elements || v;
    this.elements[0] = src[0];
    this.elements[1] = src[1];
    this.elements[2] = src[2];
    return this;
  }

  clone() {
    return new Vector3(this.elements);
  }

  add(v) {
    const b = v.elements || v;
    this.elements[0] += b[0];
    this.elements[1] += b[1];
    this.elements[2] += b[2];
    return this;
  }

  sub(v) {
    const b = v.elements || v;
    this.elements[0] -= b[0];
    this.elements[1] -= b[1];
    this.elements[2] -= b[2];
    return this;
  }

  mul(s) {
    this.elements[0] *= s;
    this.elements[1] *= s;
    this.elements[2] *= s;
    return this;
  }

  normalize() {
    const e = this.elements;
    const len = Math.hypot(e[0], e[1], e[2]);
    if (len > 0.00001) {
      e[0] /= len;
      e[1] /= len;
      e[2] /= len;
    }
    return this;
  }

  static cross(a, b) {
    const x = a.elements || a;
    const y = b.elements || b;
    return new Vector3([
      x[1] * y[2] - x[2] * y[1],
      x[2] * y[0] - x[0] * y[2],
      x[0] * y[1] - x[1] * y[0]
    ]);
  }
}

class Matrix4 {
  constructor(src) {
    this.elements = new Float32Array(16);
    if (src && src.elements) {
      this.elements.set(src.elements);
    } else {
      this.setIdentity();
    }
  }

  clone() {
    return new Matrix4(this);
  }

  setIdentity() {
    const e = this.elements;
    e[0] = 1; e[1] = 0; e[2] = 0; e[3] = 0;
    e[4] = 0; e[5] = 1; e[6] = 0; e[7] = 0;
    e[8] = 0; e[9] = 0; e[10] = 1; e[11] = 0;
    e[12] = 0; e[13] = 0; e[14] = 0; e[15] = 1;
    return this;
  }

  multiply(other) {
    const a = this.elements;
    const b = other.elements;
    const e = new Float32Array(16);

    for (let i = 0; i < 4; i += 1) {
      for (let j = 0; j < 4; j += 1) {
        e[i + j * 4] =
          a[i] * b[j * 4] +
          a[i + 4] * b[j * 4 + 1] +
          a[i + 8] * b[j * 4 + 2] +
          a[i + 12] * b[j * 4 + 3];
      }
    }

    this.elements = e;
    return this;
  }

  translate(x, y, z) {
    const t = new Matrix4();
    t.elements[12] = x;
    t.elements[13] = y;
    t.elements[14] = z;
    return this.multiply(t);
  }

  scale(x, y, z) {
    const s = new Matrix4();
    s.elements[0] = x;
    s.elements[5] = y;
    s.elements[10] = z;
    return this.multiply(s);
  }

  rotate(angle, x, y, z) {
    let len = Math.hypot(x, y, z);
    if (len === 0) {
      return this;
    }

    x /= len;
    y /= len;
    z /= len;
    const rad = angle * Math.PI / 180;
    const s = Math.sin(rad);
    const c = Math.cos(rad);
    const nc = 1 - c;
    const r = new Matrix4();
    const e = r.elements;

    e[0] = x * x * nc + c;
    e[1] = y * x * nc + z * s;
    e[2] = z * x * nc - y * s;
    e[4] = x * y * nc - z * s;
    e[5] = y * y * nc + c;
    e[6] = z * y * nc + x * s;
    e[8] = x * z * nc + y * s;
    e[9] = y * z * nc - x * s;
    e[10] = z * z * nc + c;
    return this.multiply(r);
  }

  setPerspective(fov, aspect, near, far) {
    const e = this.elements;
    const f = 1 / Math.tan((fov * Math.PI / 180) / 2);
    this.setIdentity();
    e[0] = f / aspect;
    e[5] = f;
    e[10] = (far + near) / (near - far);
    e[11] = -1;
    e[14] = (2 * far * near) / (near - far);
    e[15] = 0;
    return this;
  }

  setLookAt(ex, ey, ez, ax, ay, az, ux, uy, uz) {
    const eye = new Vector3([ex, ey, ez]);
    const center = new Vector3([ax, ay, az]);
    const up = new Vector3([ux, uy, uz]).normalize();
    const f = center.clone().sub(eye).normalize();
    const s = Vector3.cross(f, up).normalize();
    const u = Vector3.cross(s, f).normalize();
    const e = this.elements;

    e[0] = s.elements[0];
    e[1] = u.elements[0];
    e[2] = -f.elements[0];
    e[3] = 0;
    e[4] = s.elements[1];
    e[5] = u.elements[1];
    e[6] = -f.elements[1];
    e[7] = 0;
    e[8] = s.elements[2];
    e[9] = u.elements[2];
    e[10] = -f.elements[2];
    e[11] = 0;
    e[12] = 0;
    e[13] = 0;
    e[14] = 0;
    e[15] = 1;
    this.translate(-ex, -ey, -ez);
    return this;
  }

  multiplyVector3(v) {
    const e = this.elements;
    const p = v.elements || v;
    return new Vector3([
      e[0] * p[0] + e[4] * p[1] + e[8] * p[2],
      e[1] * p[0] + e[5] * p[1] + e[9] * p[2],
      e[2] * p[0] + e[6] * p[1] + e[10] * p[2]
    ]);
  }
}
