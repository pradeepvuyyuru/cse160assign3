"use strict";

const VSHADER_SOURCE = `
attribute vec4 a_Position;
attribute vec2 a_UV;
uniform mat4 u_ModelMatrix;
uniform mat4 u_ViewMatrix;
uniform mat4 u_ProjectionMatrix;
varying vec2 v_UV;
void main() {
  gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_ModelMatrix * a_Position;
  v_UV = a_UV;
}
`;

const FSHADER_SOURCE = `
precision mediump float;
varying vec2 v_UV;
uniform vec4 u_FragColor;
uniform float u_TexColorWeight;
uniform int u_TextureIndex;
uniform sampler2D u_Sampler0;
uniform sampler2D u_Sampler1;
uniform sampler2D u_Sampler2;
uniform sampler2D u_Sampler3;
uniform sampler2D u_Sampler4;
uniform sampler2D u_Sampler5;
uniform sampler2D u_Sampler6;
uniform sampler2D u_Sampler7;
void main() {
  vec4 texColor;
  if (u_TextureIndex == 0) {
    texColor = texture2D(u_Sampler0, v_UV);
  } else if (u_TextureIndex == 1) {
    texColor = texture2D(u_Sampler1, v_UV);
  } else if (u_TextureIndex == 2) {
    texColor = texture2D(u_Sampler2, v_UV);
  } else if (u_TextureIndex == 3) {
    texColor = texture2D(u_Sampler3, v_UV);
  } else if (u_TextureIndex == 4) {
    texColor = texture2D(u_Sampler4, v_UV);
  } else if (u_TextureIndex == 5) {
    texColor = texture2D(u_Sampler5, v_UV);
  } else if (u_TextureIndex == 6) {
    texColor = texture2D(u_Sampler6, v_UV);
  } else {
    texColor = texture2D(u_Sampler7, v_UV);
  }
  gl_FragColor = mix(u_FragColor, texColor, u_TexColorWeight);
}
`;

const WORLD_SIZE = 48;
const HALF_WORLD = WORLD_SIZE / 2;
const MAX_HEIGHT = 4;
const CAR_HOME = { x: 7, z: 36 };

const TEXTURES = [
  { name: "wall", url: "textures/wall.png" },
  { name: "road", url: "textures/road.png" },
  { name: "grass", url: "textures/grass.png" },
  { name: "crate", url: "textures/crate.png" },
  { name: "metal", url: "textures/metal.png" },
  { name: "fuel", url: "textures/fuel.png" },
  { name: "sand", url: "textures/sand.png" },
  { name: "water", url: "textures/water.png" }
];

const BASE_HEIGHT_ROWS = [
  "444444444444444444444444444444444444444444444444",
  "430330330330330330330330330330330330330330330334",
  "400000000000000000000000000000000000000000000004",
  "430000000000000030303030303030303000000000000034",
  "430000000000000030303030303030303000000000000034",
  "400000000000000000000000000000000000000000000004",
  "430000000000000000000000000000000000000000000034",
  "430000000000000000000000000000000000000000000034",
  "400000111000000000000000000000000000000111000004",
  "430000000000000000000000000000000000000000000034",
  "430000000000000000000000000000000000000000000034",
  "400000000000000000000000000000000000000000000004",
  "430000000000000000000000000000000000000000000034",
  "430000000000000000000000000000000000000000000034",
  "400000000000000000000000000000000000000000000004",
  "430000000000000000000000000000120000000000000034",
  "430000000000000000000000000000000000000000000034",
  "402220000000000000000000000000000000000000000004",
  "430000000000000000120000000000000000000000022234",
  "432220000000000000000000000000000000000000000034",
  "400000000000000000000000000000000000000000022204",
  "432220000000000000000000000000100000000000000034",
  "430000000000000000000000000000100000000000022234",
  "402220000000000000000000000000100000000000000004",
  "430000000000000000000010000000000000000000022234",
  "432220000000000000000010000000000012000000000034",
  "400000000000000000000000000000000000000000022204",
  "432220000000000000000000000000000000000000000034",
  "430000000000000000000000000000000000000000022234",
  "402220000000000002100000000000000000000000000004",
  "430000000000000000000000000000000000000000022234",
  "430000000000000000000000000000000000000000000034",
  "400000000000000000000000000000000000000000000004",
  "430000000000000000000000000000000000000000000034",
  "430222222222200000000000000000000000000000000034",
  "400000000000000000000000000000000000000000000004",
  "430000000000000000000000000000000000000000000034",
  "430000000000000000000000000000000000000000000034",
  "400000000000000000000000000000000000000111000004",
  "430000000000000000000000000000000000000000000034",
  "430000000000000000000000000000000000000000000034",
  "400000000000000000000000000000000000000000000004",
  "430000000000000000000000000000000000000000000034",
  "430000000000000000000000000000000000000000000034",
  "400222222222222000000000000000000000000000000004",
  "430000000000000000000000000000000000000000000034",
  "430330330330330330330330330330330330330330330334",
  "444444444444444444444444444444444444444444444444"
];

const TERRAIN_MAP = [
  "ssssssssggggggggggggggggggggggggggggggggssssssss",
  "ssssssssggggggggggggggggggggggggggggggggssssssss",
  "ssssssssggggggggggggggggggggggggggggggggssssssss",
  "ssssssssggggggggggggggggggggggggggggggggssssssss",
  "ssssssssggggggggggggggggggggggggggggggggssssssss",
  "ssssssssggggggggggggggggggggggggggggggggssssssss",
  "ssssssssggggggggggggggggggggggggggggggggssssssss",
  "ssssssssggggggggggggggggggggggggggggggggssssssss",
  "sssssssscbcbcbcbcbcbcbcbcbcbcbcbcbcbcbcbssssssss",
  "ssssssssrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrssssssss",
  "ssssssssrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrbgggggg",
  "ssssssssrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrcgggggg",
  "ssssssssrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrbgggggg",
  "ssssssssrrrrbcbcbcbcbcbcbcbcbcbcbcbcrrrrrcgggggg",
  "ggggggcrrrrrcggggggggggggggggggggggbrrrrrbgggggg",
  "ggggggbrrrrrbggggggggggggggggggggggcrrrrrcgggggg",
  "ggggggcrrrrrcggggggggggggggggggggggbrrrrrbgggggg",
  "ggggggbrrrrrbggggggggggggggggggggggcrrrrrcgggggg",
  "ggggggcrrrrrcggggggggggggggggggggggbrrrrrbgggggg",
  "ggggggbrrrrrbggggggggggggggggggggggcrrrrrcgggggg",
  "ggggggcrrrrrcggggggggggggggggggggggbrrrrrbgggggg",
  "ggggggbrrrrrbggggggggggwwwwwwwgggggcrrrrrcgggggg",
  "ggggggcrrrrrcggggggggggwwwwwwwgggggbrrrrrbgggggg",
  "ggggggbrrrrrbggggggggggwwwwwwwgggggcrrrrrcgggggg",
  "ggggggcrrrrrcggggggggggwwwwwwwgggggbrrrrrbgggggg",
  "ggggggbrrrrrbggggggggggwwwwwwwgggggcrrrrrcgggggg",
  "ggggggcrrrrrcggggggggggwwwwwwwgggggbrrrrrbgggggg",
  "ggggggbrrrrrbggggggggggggggggggggggcrrrrrcgggggg",
  "ggggggcrrrrrcggggggggggggggggggggggbrrrrrbgggggg",
  "ggggggbrrrrrbggggggggggggggggggggggcrrrrrcgggggg",
  "ggggggcrrrrrcggggggggggggggggggggggbrrrrrbgggggg",
  "ggggggbrrrrrbggggggggggggggggggggggcrrrrrcgggggg",
  "ggggggcrrrrrcbcbcbcbcbcbcbcbcbcbcbcbrrrrrbgggggg",
  "ggggggbrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrcgggggg",
  "gggbcbcrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrrbgggggg",
  "gggcmmmmmmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrcgggggg",
  "gggbmmmmmmmmmmmrrrrrrrrrrrrrrrrrrrrrrrrrrbgggggg",
  "gggcmmmmmmmmmmmrrrrrrrrrrrrrrrrrrrrrrsssssssssss",
  "gggbmmmmmmmmmmmbcbcbcbcbcbcbcbcbcbcbcsssssssssss",
  "gggcmmmmmmmmmmmggggggggggggggggggggggsssssssssss",
  "ssssmmmmmmmmmmmggggggggggggggggggggggsssssssssss",
  "ssssmmmmmmmmmmmggggggggggggggggggggggsssssssssss",
  "ssssmmmmmmmmmmmggggggggggggggggggggggsssssssssss",
  "ssssmmmmmmmmmmmggggggggggggggggggggggsssssssssss",
  "ssssmmmmmmmmmmmggggggggggggggggggggggsssssssssss",
  "ssssssssssssssgggggggggggggggggggggggsssssssssss",
  "ssssssssssssssgggggggggggggggggggggggsssssssssss",
  "ssssssssssssssgggggggggggggggggggggggsssssssssss"
];

const GAS_CANS = [
  { x: 9, z: 16, found: false },
  { x: 20, z: 8, found: false },
  { x: 39, z: 14, found: false },
  { x: 38, z: 31, found: false },
  { x: 28, z: 37, found: false },
  { x: 14, z: 34, found: false }
];

const TRACK_PATH = [
  [7, 36],
  [7, 10],
  [39, 10],
  [39, 36],
  [7, 36]
];

const BASE_MAP = BASE_HEIGHT_ROWS.map((row) => row.split("").map(Number));
const TRACK_SEGMENTS = buildTrackSegments();

let canvas;
let gl;
let camera;
let a_Position;
let a_UV;
let u_ModelMatrix;
let u_ViewMatrix;
let u_ProjectionMatrix;
let u_FragColor;
let u_TexColorWeight;
let u_TextureIndex;
let cubeBuffer;
let cubeVertexCount = 0;
let worldMap = [];
let keys = {};
let lastFrame = performance.now();
let smoothedFps = 0;
let draggingMouse = false;
let lastMouseX = 0;
let lastMouseY = 0;
let gameStarted = false;
let gameWon = false;
let startTime = 0;
let finishTime = 0;
let lastGasTime = null;
let speedBoostUntil = 0;
let speedBoostMultiplier = 1;
let carLapStart = 0;
let appMode = "menu";
let skyMatrix;
let staticItems = [];
let blockItems = [];

function main() {
  canvas = document.getElementById("webgl");
  gl = canvas.getContext("webgl", { antialias: true });
  if (!gl) {
    setMessage("WebGL is not available in this browser.");
    return;
  }

  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    setMessage("Shader setup failed. Check the JavaScript console.");
    return;
  }

  connectVariablesToGLSL();
  initCubeBuffer();
  worldMap = BASE_MAP.map((row) => row.slice());
  camera = new Camera(canvas);
  buildStaticScene();
  rebuildBlockItems();
  initControls();
  initMenus();

  gl.enable(gl.DEPTH_TEST);
  gl.enable(gl.CULL_FACE);
  gl.cullFace(gl.BACK);
  gl.clearColor(0.62, 0.78, 0.93, 1);

  loadTextures().then(() => {
    requestAnimationFrame(tick);
  });
}

function connectVariablesToGLSL() {
  a_Position = gl.getAttribLocation(gl.program, "a_Position");
  a_UV = gl.getAttribLocation(gl.program, "a_UV");
  u_ModelMatrix = gl.getUniformLocation(gl.program, "u_ModelMatrix");
  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  u_FragColor = gl.getUniformLocation(gl.program, "u_FragColor");
  u_TexColorWeight = gl.getUniformLocation(gl.program, "u_TexColorWeight");
  u_TextureIndex = gl.getUniformLocation(gl.program, "u_TextureIndex");
}

function initCubeBuffer() {
  const data = new Float32Array([
    -0.5,-0.5, 0.5, 0,0,   0.5,-0.5, 0.5, 1,0,   0.5, 0.5, 0.5, 1,1,
    -0.5,-0.5, 0.5, 0,0,   0.5, 0.5, 0.5, 1,1,  -0.5, 0.5, 0.5, 0,1,
     0.5,-0.5, 0.5, 0,0,   0.5,-0.5,-0.5, 1,0,   0.5, 0.5,-0.5, 1,1,
     0.5,-0.5, 0.5, 0,0,   0.5, 0.5,-0.5, 1,1,   0.5, 0.5, 0.5, 0,1,
     0.5,-0.5,-0.5, 0,0,  -0.5,-0.5,-0.5, 1,0,  -0.5, 0.5,-0.5, 1,1,
     0.5,-0.5,-0.5, 0,0,  -0.5, 0.5,-0.5, 1,1,   0.5, 0.5,-0.5, 0,1,
    -0.5,-0.5,-0.5, 0,0,  -0.5,-0.5, 0.5, 1,0,  -0.5, 0.5, 0.5, 1,1,
    -0.5,-0.5,-0.5, 0,0,  -0.5, 0.5, 0.5, 1,1,  -0.5, 0.5,-0.5, 0,1,
    -0.5, 0.5, 0.5, 0,0,   0.5, 0.5, 0.5, 1,0,   0.5, 0.5,-0.5, 1,1,
    -0.5, 0.5, 0.5, 0,0,   0.5, 0.5,-0.5, 1,1,  -0.5, 0.5,-0.5, 0,1,
    -0.5,-0.5,-0.5, 0,0,   0.5,-0.5,-0.5, 1,0,   0.5,-0.5, 0.5, 1,1,
    -0.5,-0.5,-0.5, 0,0,   0.5,-0.5, 0.5, 1,1,  -0.5,-0.5, 0.5, 0,1
  ]);

  cubeBuffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, cubeBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
  gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 20, 0);
  gl.enableVertexAttribArray(a_Position);
  gl.vertexAttribPointer(a_UV, 2, gl.FLOAT, false, 20, 12);
  gl.enableVertexAttribArray(a_UV);
  cubeVertexCount = data.length / 5;
}

function initControls() {
  window.addEventListener("keydown", (event) => {
    if (!controlsEnabled()) {
      return;
    }
    const key = event.key.toLowerCase();
    keys[key] = true;
    const seconds = performance.now() / 1000;

    if (["w", "a", "s", "d"].includes(key)) {
      startGameIfNeeded(seconds);
    }
    if (key === "w") tryCameraMove(() => camera.moveForward());
    if (key === "s") tryCameraMove(() => camera.moveBackwards());
    if (key === "a") tryCameraMove(() => camera.moveLeft());
    if (key === "d") tryCameraMove(() => camera.moveRight());
    if (key === "q") camera.panLeft();
    if (key === "e") camera.panRight();
    if (key === "f") removeBlockAhead();
    if (key === "r") addBlockAhead();
  });

  window.addEventListener("keyup", (event) => {
    keys[event.key.toLowerCase()] = false;
  });

  canvas.addEventListener("click", () => {
    if (!controlsEnabled()) {
      return;
    }
    if (canvas.requestPointerLock) {
      try {
        const lockRequest = canvas.requestPointerLock();
        if (lockRequest && lockRequest.catch) {
          lockRequest.catch(() => {});
        }
      } catch (error) {
        draggingMouse = true;
      }
    }
  });

  canvas.addEventListener("mousedown", (event) => {
    if (!controlsEnabled()) {
      return;
    }
    draggingMouse = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  });

  window.addEventListener("mouseup", () => {
    draggingMouse = false;
  });

  window.addEventListener("mousemove", (event) => {
    if (!controlsEnabled()) {
      return;
    }
    if (document.pointerLockElement === canvas) {
      camera.mouseLook(event.movementX, event.movementY);
      return;
    }
    if (draggingMouse) {
      camera.mouseLook(event.clientX - lastMouseX, event.clientY - lastMouseY);
      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    }
  });

  window.addEventListener("resize", resizeCanvasToDisplaySize);
}

function initMenus() {
  const overlay = document.getElementById("modeOverlay");
  const mainMenu = document.getElementById("mainMenu");
  const instructionsMenu = document.getElementById("instructionsMenu");

  document.getElementById("freeRoamBtn").addEventListener("click", () => {
    appMode = "free";
    resetRunState();
    overlay.classList.add("hidden");
    setMessage("Free Roam mode. Explore the track world without timer or gas-can objectives.");
  });

  document.getElementById("gameModeBtn").addEventListener("click", () => {
    appMode = "instructions";
    mainMenu.classList.add("hidden");
    instructionsMenu.classList.remove("hidden");
  });

  document.getElementById("backMenuBtn").addEventListener("click", () => {
    appMode = "menu";
    instructionsMenu.classList.add("hidden");
    mainMenu.classList.remove("hidden");
  });

  document.getElementById("startGameBtn").addEventListener("click", () => {
    appMode = "game";
    resetRunState();
    overlay.classList.add("hidden");
    setMessage("Game armed. Move to start the timer, collect all six red gas cans, then return to the car.");
  });
}

function controlsEnabled() {
  return appMode === "free" || appMode === "game";
}

function resetRunState() {
  keys = {};
  gameStarted = false;
  gameWon = false;
  startTime = 0;
  finishTime = 0;
  lastGasTime = null;
  speedBoostUntil = 0;
  speedBoostMultiplier = 1;
  carLapStart = 0;
  GAS_CANS.forEach((can) => {
    can.found = false;
  });
}

function loadTextures() {
  const promises = TEXTURES.map((texture, index) => new Promise((resolve) => {
    const image = new Image();
    image.onload = () => {
      const glTexture = gl.createTexture();
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.activeTexture(gl.TEXTURE0 + index);
      gl.bindTexture(gl.TEXTURE_2D, glTexture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
      gl.generateMipmap(gl.TEXTURE_2D);
      gl.uniform1i(gl.getUniformLocation(gl.program, `u_Sampler${index}`), index);
      resolve();
    };
    image.onerror = () => {
      setMessage(`Could not load ${texture.url}. Start from a local web server.`);
      resolve();
    };
    image.src = texture.url;
  }));

  return Promise.all(promises);
}

function tick(now) {
  resizeCanvasToDisplaySize();
  const seconds = now / 1000;
  const delta = Math.min(0.05, (now - lastFrame) / 1000);
  lastFrame = now;
  update(delta, seconds);
  renderScene(seconds);
  updateHud(delta, seconds);
  requestAnimationFrame(tick);
}

function update(delta, seconds) {
  if (!controlsEnabled()) {
    return;
  }
  const moveScale = Math.max(0.75, delta * 60);
  const oldSpeed = camera.speed;
  camera.speed = oldSpeed * moveScale * currentBoost(seconds);

  if (appMode === "game" && (keys.w || keys.a || keys.s || keys.d)) {
    startGameIfNeeded(seconds);
  }
  if (keys.w) tryCameraMove(() => camera.moveForward());
  if (keys.s) tryCameraMove(() => camera.moveBackwards());
  if (keys.a) tryCameraMove(() => camera.moveLeft());
  if (keys.d) tryCameraMove(() => camera.moveRight());
  if (keys.q) camera.panLeft();
  if (keys.e) camera.panRight();

  camera.speed = oldSpeed;
  if (appMode === "game") {
    collectNearbyGas(seconds);
  }
}

function startGameIfNeeded(seconds) {
  if (appMode === "game" && !gameStarted && !gameWon) {
    gameStarted = true;
    startTime = seconds;
    setMessage("Timer started. Grab the six red gas cans and get back to the car.");
  }
}

function currentBoost(seconds) {
  return seconds < speedBoostUntil ? speedBoostMultiplier : 1;
}

function tryCameraMove(action) {
  const oldEye = camera.eye.clone();
  const oldAt = camera.at.clone();
  action();
  if (isBlocked(camera.eye.elements[0], camera.eye.elements[2])) {
    camera.eye.set(oldEye);
    camera.at.set(oldAt);
    camera.updateView();
  }
}

function renderScene(seconds) {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);

  drawSky();
  drawItems(staticItems);
  drawItems(blockItems);
  if (appMode === "game") {
    drawGasCans(seconds);
  }
  drawRallyCar(seconds);
}

function drawSky() {
  gl.disable(gl.CULL_FACE);
  drawCube(skyMatrix, [0.58, 0.76, 0.96, 1], 0, 0);
  gl.enable(gl.CULL_FACE);
}

function buildStaticScene() {
  staticItems = [];
  skyMatrix = new Matrix4().translate(0, 0, 0).scale(500, 500, 500);
  pushItem(staticItems, new Matrix4().translate(0, -0.08, 0).scale(WORLD_SIZE, 0.12, WORLD_SIZE), [0.75, 0.78, 0.62, 1], 2, 1);
  buildTerrainRuns();
  buildTrackDecor();
}

function buildTerrainRuns() {
  for (let z = 0; z < WORLD_SIZE; z += 1) {
    let x = 0;
    while (x < WORLD_SIZE) {
      const code = TERRAIN_MAP[z][x];
      let end = x + 1;
      while (end < WORLD_SIZE && TERRAIN_MAP[z][end] === code) {
        end += 1;
      }
      const terrain = terrainStyle(code);
      const width = end - x;
      const centerX = gridToWorld(x) + (width - 1) / 2;
      const centerZ = gridToWorld(z);
      const bump = terrain.bump ? fixedTerrainBump(x, z) : 0;
      const model = new Matrix4()
        .translate(centerX, 0.006 + bump, centerZ)
        .scale(width * 0.98, 0.035 + Math.abs(bump), 0.98);
      pushItem(staticItems, model, terrain.color, terrain.texture, terrain.weight);
      x = end;
    }
  }
}

function fixedTerrainBump(x, z) {
  return 0.012 * Math.sin(x * 1.7 + z * 0.9);
}

function buildTrackDecor() {
  buildPitBuilding();
  buildStartFinishLine();
  buildGrandstands();
  pushItem(staticItems, new Matrix4().translate(gridToWorld(26), 0.04, gridToWorld(24)).scale(6.8, 0.04, 6.8), [0.18, 0.56, 0.86, 1], 7, 0.9);
}

function pushItem(list, matrix, color, textureIndex, texWeight) {
  list.push({ matrix, color, textureIndex, texWeight });
}

function drawItems(items) {
  for (let i = 0; i < items.length; i += 1) {
    const item = items[i];
    drawCube(item.matrix, item.color, item.textureIndex, item.texWeight);
  }
}

function terrainStyle(code) {
  if (code === "r") return { texture: 1, color: [0.16, 0.17, 0.18, 1], weight: 1, bump: false };
  if (code === "c") return { texture: 0, color: [0.92, 0.04, 0.03, 1], weight: 0, bump: false };
  if (code === "b") return { texture: 0, color: [0.96, 0.96, 0.9, 1], weight: 0, bump: false };
  if (code === "s") return { texture: 6, color: [0.86, 0.75, 0.5, 1], weight: 1, bump: true };
  if (code === "w") return { texture: 7, color: [0.18, 0.54, 0.86, 1], weight: 0.9, bump: true };
  if (code === "m") return { texture: 4, color: [0.38, 0.42, 0.44, 1], weight: 0.9, bump: false };
  return { texture: 2, color: [0.48, 0.72, 0.35, 1], weight: 1, bump: true };
}

function rebuildBlockItems() {
  blockItems = [];
  for (let z = 0; z < WORLD_SIZE; z += 1) {
    for (let x = 0; x < WORLD_SIZE; x += 1) {
      const height = worldMap[z][x];
      for (let y = 0; y < height; y += 1) {
        const texture = y === height - 1 && height < 4 ? 3 : 0;
        const color = height >= 4 ? [0.52, 0.49, 0.45, 1] : [0.74, 0.68, 0.58, 1];
        const model = new Matrix4()
          .translate(gridToWorld(x), y + 0.5, gridToWorld(z))
          .scale(1, 1, 1);
        pushItem(blockItems, model, color, texture, 1);
      }
    }
  }
}

function buildPitBuilding() {
  const base = new Matrix4().translate(gridToWorld(7), 0, gridToWorld(39));
  pushItem(staticItems, base.clone().translate(-4.2, 0.8, 0).scale(0.28, 1.6, 7.5), [0.12, 0.16, 0.18, 1], 4, 0.8);
  pushItem(staticItems, base.clone().translate(4.2, 0.8, 0).scale(0.28, 1.6, 7.5), [0.12, 0.16, 0.18, 1], 4, 0.8);
  pushItem(staticItems, base.clone().translate(0, 1.75, -3.6).scale(8.8, 0.28, 0.32), [0.8, 0.04, 0.03, 1], 5, 0.28);
  pushItem(staticItems, base.clone().translate(0, 1.75, 3.6).scale(8.8, 0.28, 0.32), [0.8, 0.04, 0.03, 1], 5, 0.28);
}

function buildStartFinishLine() {
  const x0 = gridToWorld(7);
  const z0 = gridToWorld(36);
  for (let i = -2; i <= 2; i += 1) {
    const color = i % 2 === 0 ? [0.02, 0.02, 0.02, 1] : [0.96, 0.96, 0.9, 1];
    pushItem(staticItems, new Matrix4().translate(x0 + i * 0.45, 0.08, z0).scale(0.42, 0.05, 2.2), color, 0, 0);
  }
}

function buildGrandstands() {
  const stands = [
    [22, 2, 0, 10],
    [2, 22, 90, 10],
    [41, 4, 0, 8]
  ];
  stands.forEach(([x, z, angle, seats]) => {
    const root = new Matrix4().translate(gridToWorld(x), 0, gridToWorld(z)).rotate(angle, 0, 1, 0);
    for (let i = 0; i < seats; i += 1) {
      const row = Math.floor(i / 5);
      const col = i % 5;
      pushItem(staticItems, root.clone().translate(col * 0.7 - 1.4, 0.25 + row * 0.35, row * 0.55).scale(0.58, 0.18, 0.45), [0.85, 0.08, 0.08, 1], 5, 0.15);
    }
  });
}

function drawGasCans(seconds) {
  GAS_CANS.forEach((can, i) => {
    if (can.found) return;
    const bob = Math.sin(seconds * 3.2 + i) * 0.18;
    const root = new Matrix4()
      .translate(gridToWorld(can.x), 1.0 + bob, gridToWorld(can.z))
      .rotate(seconds * 70, 0, 1, 0);

    drawCube(root.clone().scale(0.68, 0.98, 0.42), [1, 0.2, 0.08, 1], 5, 0.05);
    drawCube(root.clone().scale(0.46, 0.72, 0.28), [1, 0.02, 0.02, 1], 5, 0.2);
    drawCube(root.clone().translate(0, 0.44, 0).scale(0.22, 0.14, 0.22), [0.08, 0.08, 0.08, 1], 0, 0);
    drawCube(root.clone().translate(0, 0.05, -0.151).scale(0.28, 0.22, 0.025), [1, 1, 1, 1], 0, 0);
    drawCube(root.clone().translate(0.23, 0.22, 0).scale(0.05, 0.25, 0.16), [0.12, 0.12, 0.12, 1], 0, 0);
  });
}

function drawRallyCar(seconds) {
  let car = carTransform(seconds);
  drawCube(car.clone().scale(1.55, 0.34, 0.82), [0.02, 0.18, 0.75, 1], 4, 0.45);
  drawCube(car.clone().translate(0.1, 0.34, 0).scale(0.78, 0.32, 0.58), [0.04, 0.28, 0.9, 1], 4, 0.35);
  drawCube(car.clone().translate(0.46, 0.38, 0).scale(0.26, 0.18, 0.5), [0.75, 0.93, 1, 1], 0, 0);
  drawCube(car.clone().translate(-0.72, 0.04, 0).scale(0.18, 0.16, 0.74), [0.9, 0.03, 0.02, 1], 5, 0.2);
  drawWheel(car.clone().translate(0.48, -0.12, 0.46).rotate(seconds * 180, 0, 0, 1));
  drawWheel(car.clone().translate(-0.48, -0.12, 0.46).rotate(seconds * 180, 0, 0, 1));
  drawWheel(car.clone().translate(0.48, -0.12, -0.46).rotate(seconds * 180, 0, 0, 1));
  drawWheel(car.clone().translate(-0.48, -0.12, -0.46).rotate(seconds * 180, 0, 0, 1));
}

function carTransform(seconds) {
  if (!gameWon) {
    return new Matrix4().translate(gridToWorld(CAR_HOME.x), 0.18, gridToWorld(CAR_HOME.z)).rotate(180, 0, 1, 0);
  }

  const lapTime = 15;
  const t = ((seconds - carLapStart) % lapTime) / lapTime;
  const sample = sampleTrack(t);
  return new Matrix4()
    .translate(sample.x, 0.18, sample.z)
    .rotate(sample.angle, 0, 1, 0);
}

function sampleTrack(t) {
  let target = t * TRACK_SEGMENTS.total;
  for (let i = 0; i < TRACK_SEGMENTS.segments.length; i += 1) {
    const segment = TRACK_SEGMENTS.segments[i];
    if (target <= segment.length) {
      const local = target / segment.length;
      return {
        x: segment.ax + (segment.bx - segment.ax) * local,
        z: segment.az + (segment.bz - segment.az) * local,
        angle: segment.angle
      };
    }
    target -= segment.length;
  }
  const first = TRACK_SEGMENTS.segments[0];
  return { x: first.ax, z: first.az, angle: first.angle };
}

function buildTrackSegments() {
  const segments = [];
  let total = 0;
  for (let i = 0; i < TRACK_PATH.length - 1; i += 1) {
    const ax = gridToWorld(TRACK_PATH[i][0]);
    const az = gridToWorld(TRACK_PATH[i][1]);
    const bx = gridToWorld(TRACK_PATH[i + 1][0]);
    const bz = gridToWorld(TRACK_PATH[i + 1][1]);
    const length = Math.hypot(bx - ax, bz - az);
    const angle = Math.atan2(bx - ax, bz - az) * 180 / Math.PI;
    segments.push({ ax, az, bx, bz, length, angle });
    total += length;
  }
  return { segments, total };
}

function drawWheel(model) {
  drawCube(model.scale(0.24, 0.24, 0.12), [0.02, 0.02, 0.02, 1], 0, 0);
}

function drawCube(matrix, color, textureIndex, texWeight) {
  gl.uniformMatrix4fv(u_ModelMatrix, false, matrix.elements);
  gl.uniform4f(u_FragColor, color[0], color[1], color[2], color[3]);
  gl.uniform1f(u_TexColorWeight, texWeight);
  gl.uniform1i(u_TextureIndex, textureIndex);
  gl.drawArrays(gl.TRIANGLES, 0, cubeVertexCount);
}

function addBlockAhead() {
  const target = targetCellAhead();
  if (!target || reservedCell(target.x, target.z)) {
    setMessage("That racing line or gas can area is reserved.");
    return;
  }
  if (worldMap[target.z][target.x] < MAX_HEIGHT) {
    worldMap[target.z][target.x] += 1;
    rebuildBlockItems();
    setMessage("Added a block ahead.");
  }
}

function removeBlockAhead() {
  const target = targetCellAhead();
  if (!target || reservedCell(target.x, target.z)) {
    setMessage("That racing line or gas can area stays open.");
    return;
  }
  if (worldMap[target.z][target.x] > 0) {
    worldMap[target.z][target.x] -= 1;
    rebuildBlockItems();
    setMessage("Deleted a block ahead.");
  }
}

function targetCellAhead() {
  const dir = camera.forwardVector(true);
  const e = camera.eye.elements;
  const x = worldToGrid(e[0] + dir.elements[0] * 1.4);
  const z = worldToGrid(e[2] + dir.elements[2] * 1.4);
  if (x < 1 || x >= WORLD_SIZE - 1 || z < 1 || z >= WORLD_SIZE - 1) {
    return null;
  }
  return { x, z };
}

function collectNearbyGas(seconds) {
  let collected = false;
  let boostText = "";
  GAS_CANS.forEach((can) => {
    if (can.found) return;
    const dx = camera.eye.elements[0] - gridToWorld(can.x);
    const dz = camera.eye.elements[2] - gridToWorld(can.z);
    if (Math.hypot(dx, dz) < 1.25) {
      can.found = true;
      collected = true;
      boostText = applyGasBoost(seconds);
    }
  });

  if (collected) {
    const count = GAS_CANS.filter((can) => can.found).length;
    if (count === GAS_CANS.length) {
      setMessage("All gas collected. Sprint back to the blue car in the pit lane.");
    } else if (boostText) {
      setMessage(`${boostText} Gas can collected. ${count}/6 found.`);
    } else {
      setMessage(`Gas can collected. ${count}/6 found.`);
    }
  }

  const allFound = GAS_CANS.every((can) => can.found);
  const nearCar = Math.hypot(camera.eye.elements[0] - gridToWorld(CAR_HOME.x), camera.eye.elements[2] - gridToWorld(CAR_HOME.z)) < 2.2;
  if (allFound && nearCar && !gameWon) {
    gameWon = true;
    finishTime = seconds;
    carLapStart = seconds;
    const finalTime = (finishTime - startTime).toFixed(2);
    setMessage(`Finished in ${finalTime}s. The car is fueled and taking a victory lap.`);
  }
}

function applyGasBoost(seconds) {
  let boostText = "";
  if (lastGasTime != null) {
    const gap = seconds - lastGasTime;
    if (gap <= 5) {
      speedBoostMultiplier = 1.6;
      speedBoostUntil = seconds + 4;
      boostText = "Fast pickup: 1.6x boost for 4 seconds.";
    } else if (gap <= 8) {
      speedBoostMultiplier = 1.3;
      speedBoostUntil = seconds + 4;
      boostText = "Combo pickup: 1.3x boost for 4 seconds.";
    }
  }
  lastGasTime = seconds;
  return boostText;
}

function reservedCell(x, z) {
  if (Math.hypot(x - CAR_HOME.x, z - CAR_HOME.z) < 3) return true;
  if (TERRAIN_MAP[z][x] === "r" || TERRAIN_MAP[z][x] === "c") return true;
  return GAS_CANS.some((can) => Math.hypot(x - can.x, z - can.z) < 2);
}

function isBlocked(worldX, worldZ) {
  const x = worldToGrid(worldX);
  const z = worldToGrid(worldZ);
  if (x < 1 || x >= WORLD_SIZE - 1 || z < 1 || z >= WORLD_SIZE - 1) {
    return true;
  }
  return worldMap[z][x] > 0;
}

function gridToWorld(n) {
  return n - HALF_WORLD + 0.5;
}

function worldToGrid(n) {
  return Math.floor(n + HALF_WORLD);
}

function resizeCanvasToDisplaySize() {
  const width = Math.floor(canvas.clientWidth);
  const height = Math.floor(canvas.clientHeight);
  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = Math.max(320, width);
    canvas.height = Math.max(240, height);
    gl.viewport(0, 0, canvas.width, canvas.height);
    camera.updateProjection();
  }
}

function updateHud(delta, seconds) {
  const fps = 1 / Math.max(delta, 0.0001);
  const elapsed = gameWon ? finishTime - startTime : gameStarted ? seconds - startTime : 0;
  const boost = currentBoost(seconds);
  smoothedFps = smoothedFps === 0 ? fps : smoothedFps * 0.9 + fps * 0.1;
  document.getElementById("fps").textContent = `FPS: ${smoothedFps.toFixed(1)}`;
  if (appMode === "game") {
    document.getElementById("gasCount").textContent = `Gas: ${GAS_CANS.filter((can) => can.found).length}/6`;
    document.getElementById("timer").textContent = `Time: ${elapsed.toFixed(2)}s`;
    document.getElementById("boost").textContent = `Boost: ${boost.toFixed(1)}x`;
  } else {
    document.getElementById("gasCount").textContent = "Gas: Off";
    document.getElementById("timer").textContent = "Time: Off";
    document.getElementById("boost").textContent = "Boost: Off";
  }
}

function setMessage(text) {
  document.getElementById("message").textContent = text;
}

function initShaders(glContext, vertexSource, fragmentSource) {
  const vertexShader = loadShader(glContext, glContext.VERTEX_SHADER, vertexSource);
  const fragmentShader = loadShader(glContext, glContext.FRAGMENT_SHADER, fragmentSource);
  if (!vertexShader || !fragmentShader) {
    return false;
  }

  const program = glContext.createProgram();
  glContext.attachShader(program, vertexShader);
  glContext.attachShader(program, fragmentShader);
  glContext.linkProgram(program);

  if (!glContext.getProgramParameter(program, glContext.LINK_STATUS)) {
    console.error("Program failed to link:", glContext.getProgramInfoLog(program));
    return false;
  }

  glContext.useProgram(program);
  glContext.program = program;
  return true;
}

function loadShader(glContext, type, source) {
  const shader = glContext.createShader(type);
  glContext.shaderSource(shader, source);
  glContext.compileShader(shader);
  if (!glContext.getShaderParameter(shader, glContext.COMPILE_STATUS)) {
    console.error("Shader compile error:", glContext.getShaderInfoLog(shader));
    glContext.deleteShader(shader);
    return null;
  }
  return shader;
}

main();
