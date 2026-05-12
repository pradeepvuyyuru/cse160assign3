"use strict";

class Camera {
  constructor(canvas) {
    this.canvas = canvas;
    this.fov = 60;
    this.eye = new Vector3([-16.5, 1.55, 15.0]);
    this.at = new Vector3([-16.5, 1.55, 14.0]);
    this.up = new Vector3([0, 1, 0]);
    this.yaw = -90;
    this.pitch = 0;
    this.speed = 0.12;
    this.turnSpeed = 5;
    this.viewMatrix = new Matrix4();
    this.projectionMatrix = new Matrix4();
    this.updateProjection();
    this.updateView();
  }

  updateProjection() {
    this.projectionMatrix.setPerspective(this.fov, this.canvas.width / this.canvas.height, 0.1, 1000);
  }

  updateView() {
    this.updateAtFromAngles();
    const e = this.eye.elements;
    const a = this.at.elements;
    const u = this.up.elements;
    this.viewMatrix.setLookAt(e[0], e[1], e[2], a[0], a[1], a[2], u[0], u[1], u[2]);
  }

  updateAtFromAngles() {
    const yaw = this.yaw * Math.PI / 180;
    const pitch = this.pitch * Math.PI / 180;
    const dir = new Vector3([
      Math.cos(yaw) * Math.cos(pitch),
      Math.sin(pitch),
      Math.sin(yaw) * Math.cos(pitch)
    ]).normalize();
    this.at.set(this.eye.clone().add(dir));
  }

  forwardVector(flatten) {
    const f = this.at.clone().sub(this.eye);
    if (flatten) {
      f.elements[1] = 0;
    }
    return f.normalize();
  }

  moveForward() {
    const f = this.forwardVector(true).mul(this.speed);
    this.eye.add(f);
    this.at.add(f);
    this.updateView();
  }

  moveBackwards() {
    const b = this.eye.clone().sub(this.at);
    b.elements[1] = 0;
    b.normalize().mul(this.speed);
    this.eye.add(b);
    this.at.add(b);
    this.updateView();
  }

  moveLeft() {
    const f = this.forwardVector(true);
    const s = Vector3.cross(this.up, f).normalize().mul(this.speed);
    this.eye.add(s);
    this.at.add(s);
    this.updateView();
  }

  moveRight() {
    const f = this.forwardVector(true);
    const s = Vector3.cross(f, this.up).normalize().mul(this.speed);
    this.eye.add(s);
    this.at.add(s);
    this.updateView();
  }

  panLeft() {
    this.yaw -= this.turnSpeed;
    this.updateView();
  }

  panRight() {
    this.yaw += this.turnSpeed;
    this.updateView();
  }

  mouseLook(dx, dy) {
    this.yaw += dx * 0.15;
    this.pitch -= dy * 0.12;
    this.pitch = Math.max(-82, Math.min(82, this.pitch));
    this.updateView();
  }
}
