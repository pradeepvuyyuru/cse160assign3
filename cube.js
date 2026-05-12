"use strict";

class Cube {
  constructor(color, textureIndex, texWeight) {
    this.matrix = new Matrix4();
    this.color = color || [1, 1, 1, 1];
    this.textureIndex = textureIndex || 0;
    this.texWeight = texWeight == null ? 1 : texWeight;
  }

  draw() {
    drawCube(this.matrix, this.color, this.textureIndex, this.texWeight);
  }
}
