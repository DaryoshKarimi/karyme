/****************************
 * Camera
 ***************************/

const camera_position = new Float32Array([0,0,0,1])
const camera_prev_position = new Float32Array([0,0,0,1])
const camera_world_view_matrix = new Float32Array(16)
const camera_view_world_matrix = new Float32Array(16)
const camera_translation = new Float32Array([
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
])
const camera_rotation = new Float32Array([
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
])
const camera_inverse_translation = new Float32Array([
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
])
const camera_inverse_rotation = new Float32Array([
  1, 0, 0, 0,
  0, 1, 0, 0,
  0, 0, 1, 0,
  0, 0, 0, 1,
])
const camera_perspective_matrix = new Float32Array(16)
const camera_inverse_perspective_matrix = new Float32Array(16)
let camera_ry_target = 0
let camera_tx_target = 0
let camera_ty_target = 0
let camera_tz_target = -3
let camera_ry = camera_ry_target
let camera_tx = camera_tx_target
let camera_ty = camera_ty_target
let camera_tz = camera_tz_target
let camera_prev_ry = 0
let camera_animation_tween = 1

function camera_update_perspective () {
  const aspect = canvas.width/canvas.height
  const fov = Math.PI/4.5
  const near = 0.5
  const far = 120
  const pa = 1/Math.tan(fov/2)/aspect
  const pb = 1/Math.tan(fov/2)
  const pc = (near + far)/(near - far)
  const pd = -1
  const pe = 2*near*far/(near - far)

  camera_perspective_matrix[0] = pa
  camera_perspective_matrix[5] = pb
  camera_perspective_matrix[10] = pc
  camera_perspective_matrix[11] = pd
  camera_perspective_matrix[14] = pe

  camera_inverse_perspective_matrix[0] = 1/pa
  camera_inverse_perspective_matrix[5] = 1/pb
  camera_inverse_perspective_matrix[11] = 1/pe
  camera_inverse_perspective_matrix[14] = 1/pd
  camera_inverse_perspective_matrix[15] = -pc/(pd*pe)
}



/****************************
 * Texture IDs
 ***************************/

let texture_id_counter = 0
function gen_next_texture_id () {
  const id = texture_id_counter
  texture_id_counter++
  return id
}


/****************************
 * Canvas
 ***************************/

const canvas_scale = 2
let canvas = document.createElement('canvas')
let gl = canvas.getContext('webgl')
if (!gl || !(gl instanceof WebGLRenderingContext)) {
  window.location = "https://blasefrog.netlify.com"
}

let has_resized = true



let scale = 1;
let pan_x = 0;
let pan_y = 0;
const SCALE_FACTOR = 0.003;


let is_dragging = false;
let is_gesturing = false;

let vx = 0;
let vy = 0;

let mouse_x = -1;
let mouse_y = -1;

let gesture_center_x = 0;
let gesture_center_y = 0;



function handle_mousedown (e) {
  if (!e.button == 0) return;

  if (e.touches && e.touches.length == 2) {
    is_dragging = false;
    is_gesturing = true;
    const dx = e.touches[1].clientX - e.touches[0].clientX;
    const dy = e.touches[1].clientY - e.touches[0].clientY;

    gesture_center_x = (e.touches[0].clientX + e.touches[1].clientX) / 2;
    gesture_center_y = (e.touches[0].clientY + e.touches[1].clientY) / 2;
    mouse_x = gesture_center_x;
    mouse_y = gesture_center_y;


    return;
  }

  is_dragging = true;
  mouse_x = e.touches ? e.touches[0].clientX : e.clientX;
  mouse_y = e.touches ? e.touches[0].clientY : e.clientY;
}

function handle_mousemove (e) {
  if (e.touches) {
    e.preventDefault();

    if (is_gesturing && last_gesture_scale) {
      const dx = e.touches[1].clientX - e.touches[0].clientX;
      const dy = e.touches[1].clientY - e.touches[0].clientY;

      gesture_center_x = (e.touches[0].clientX + e.touches[1].clientX) / 2;
      gesture_center_y = (e.touches[0].clientY + e.touches[1].clientY) / 2;

      vx = (gesture_center_x - mouse_x);
      vy = (gesture_center_y - mouse_y);

      mouse_x = gesture_center_x;
      mouse_y = gesture_center_y;

      return;
    }

  }
  if (is_dragging && !is_gesturing) {
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    vx = clientX - mouse_x;
    vy = clientY - mouse_y;
    mouse_x = clientX;
    mouse_y = clientY;
  }
}

function handle_mouseup (e) {
  is_dragging = false;
  is_gesturing = false;
}


function init_canvas () {
  document.body.appendChild(canvas)

  gl.clearColor(0,0,0,1)
  gl.enable(gl.DEPTH_TEST)
  gl.enable(gl.CULL_FACE)
  gl.cullFace(gl.BACK)

  gl.enable(gl.BLEND)
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
  

  window.addEventListener('resize', function (e) { has_resized = true })

  canvas.addEventListener('mousedown', handle_mousedown);
  canvas.addEventListener('mousemove', handle_mousemove);
  window.addEventListener('mouseup', handle_mouseup);
  window.addEventListener('mouseleave', handle_mouseup);
  canvas.addEventListener('touchstart', handle_mousedown);
  window.addEventListener('touchmove', handle_mousemove, {passive: false});
  window.addEventListener('touchend', handle_mouseup);
  window.addEventListener('touchcancel', handle_mouseup);
}


/****************************
 * Key events
 ***************************/

document.addEventListener('keydown', handle_keydown, false)
document.addEventListener('keyup', handle_keyup, false)

var right_pressed = false
var left_pressed = false
var up_pressed = false
var down_pressed = false

function handle_keydown (event) {
  if (event.keyCode == 37) { left_pressed = true }
  else if (event.keyCode == 38) { up_pressed = true }
  else if (event.keyCode == 39) { right_pressed = true }
  else if (event.keyCode == 40) { down_pressed = true }
}

function handle_keyup (event) {
  if (event.keyCode == 37) { left_pressed = false; }
  else if (event.keyCode == 38) { up_pressed = false; }
  else if (event.keyCode == 39) { right_pressed = false; }
  else if (event.keyCode == 40) { down_pressed = false; }
}


/****************************
 * Main Loop
 ***************************/

let prev_timestamp = null
const TARGET_FRAME_TIME = 1000/60
let dt = 0
let total_time = 0
const limit_fps = false
let limited_prev_timestamp = null
let limited_dt = 0

function main_loop (timestamp) {
  if (!limit_fps) {
    if (prev_timestamp == null) {
      prev_timestamp = timestamp
    }
    dt = Math.min(32, timestamp - prev_timestamp)
    prev_timestamp = timestamp
    update()
    render()
    window.requestAnimationFrame(main_loop)
  } else {
    limited_dt = Math.min(32, timestamp - limited_prev_timestamp)
    limited_prev_timestamp = timestamp
    total_time += limited_dt
    if (total_time > TARGET_FRAME_TIME*3) {
      total_time = TARGET_FRAME_TIME
    }
    while (total_time >= TARGET_FRAME_TIME) {
      dt = total_time
      update()
      render()
      total_time -= TARGET_FRAME_TIME
      prev_timestamp = prev_timestamp + TARGET_FRAME_TIME
    }
    window.requestAnimationFrame(main_loop)
  }
}

