# Assignment 3 - F1 Fuel Rush

This is a self-contained WebGL first-person F1 fuel-collection game built from textured cubes.

## Run

Start a local server in this folder, then open the page in a browser:

```sh
python3 -m http.server 8000
```

Then visit:

```text
http://localhost:8000/
```

## Controls

- `W`, `A`, `S`, `D`: move the human player
- `Q`, `E`: rotate left and right
- Mouse drag or pointer lock: rotate the camera
- `F`: remove a marker block in front of the player
- `R`: add a marker block in front of the player

## Modes

- Free Roam: explore the world without gas cans, timer, boost, or objectives.
- Game Mode: read the instructions, click start, then move to begin the timed gas-can run.

## Features Included

- 48x48 hardcoded JavaScript voxel height map
- Hardcoded terrain map for grass, sand, water, F1 track, curbs, and paddock surfaces
- Start menu with Free Roam and Game Mode
- Separate Game Mode instructions screen before play starts
- Six bright red floating gas cans
- Timer starts on first movement and stops when all gas is returned to the car
- Combo speed boost for quick gas-can pickups
- Automatic car victory-lap animation after refueling
- Slower walking-speed first-person camera
- Perspective camera with view and projection matrices
- Textured walls, grass, sand, water, track, crates, metal, and gas cans
- Solid-color sky cube and textured flattened cube ground
- Add/delete blocks in front of the camera
- F1 car/pit area, visible track, gas-can objective, and timed game loop
- Cached static terrain/block/decor draw lists for steadier FPS
- Live FPS indicator
# cse160assign3
