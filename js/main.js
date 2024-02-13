function create_transform () {
  return {
    translation:         create_identity_matrix(new Float32Array(16)),
    inverse_translation: create_identity_matrix(new Float32Array(16)),
    rotation:            create_identity_matrix(new Float32Array(16)),
    inverse_rotation:    create_identity_matrix(new Float32Array(16)),
    model_world_matrix:  create_identity_matrix(new Float32Array(16)),
    world_model_matrix:  create_identity_matrix(new Float32Array(16)),
    world_model_transpose_matrix: create_identity_matrix(new Float32Array(16)),
    model_view_matrix:   create_identity_matrix(new Float32Array(16)),
  }
}



// daryosh
const daryosh_transform = create_transform()
daryosh_transform.translation
let daryosh_rotation_theta = 0



/****************************
 * Lights
 ***************************/



const shadow_lights = []
shadow_lights[0] = {}
shadow_lights[0].position = new Float32Array([-10, 15.0, -20])
shadow_lights[0].rotation = create_lookat_rotation_matrix(new Float32Array(16), shadow_lights[0].position, [-20,-5,30])
/*
shadow_lights[1] = {}
shadow_lights[1].position = new Float32Array([-42, 9, 5])
shadow_lights[1].rotation = shadow_lights[0].rotation
*/
for (let i=0; i<shadow_lights.length; i++) {
  shadow_lights[i].inverse_translation = create_translation_matrix(new Float32Array(16), -shadow_lights[i].position[0], -shadow_lights[i].position[1], -shadow_lights[i].position[2])
  shadow_lights[i].inverse_rotation = matrix_transpose_4(new Float32Array(16), shadow_lights[i].rotation)
  shadow_lights[i].world_light_matrix = matrix_mult_4(new Float32Array(16), shadow_lights[i].inverse_rotation, shadow_lights[i].inverse_translation)
  shadow_lights[i].perspective = new Float32Array(16)

  shadow_lights[i].shadow_depth_texture_id = gen_next_texture_id()
  shadow_lights[i].shadow_color_texture_id = gen_next_texture_id()
  shadow_lights[i].shadow_depth_texture = null
  shadow_lights[i].shadow_color_texture = null
  shadow_lights[i].shadow_framebuffer = null
  shadow_lights[i].shadow_resolution = 2048*2

  const r = 20
  const l = -20
  const t = 20
  const b = -20
  const f = 130
  const n = 1

  shadow_lights[i].perspective[0] = 2 / (r - l); 
  shadow_lights[i].perspective[5] = 2 / (t - b); 
  shadow_lights[i].perspective[10] = -2 / (f - n); 
  shadow_lights[i].perspective[12] = -(r + l) / (r - l); 
  shadow_lights[i].perspective[13] = -(t + b) / (t - b); 
  shadow_lights[i].perspective[14] = -(f + n) / (f - n); 
  shadow_lights[i].perspective[15] = 1; 
}




/****************************
 * Shaders
 ***************************/

// Shadow Shader

let shadow_shader_program = null
let shadow_a_pos = null
let shadow_u_model_world_matrix = null
let shadow_u_world_light_matrix = null
let shadow_u_perspective = null
function compile_shadow_shader () {
  shadow_shader_program = create_shader_program(gl, assets.shadow_vertex, assets.shadow_fragment)
  gl.useProgram(shadow_shader_program)
  shadow_a_pos = gl.getAttribLocation(shadow_shader_program, 'a_pos')
  shadow_u_model_world_matrix = gl.getUniformLocation(shadow_shader_program, 'u_model_world_matrix')
  shadow_u_world_light_matrix = gl.getUniformLocation(shadow_shader_program, 'u_world_light_matrix')
  shadow_u_perspective = gl.getUniformLocation(shadow_shader_program, 'u_perspective')
}


// Basic Shader

let basic_shader_program = null
let basic_a_pos = null
let basic_a_normal = null
let basic_a_uv = null
let basic_u_sampler = null
let basic_u_model_world_matrix = null
let basic_u_world_view_matrix = null
let basic_u_perspective_matrix = null
let basic_u_world_model_transpose_matrix = null
let basic_u_shadow_lights = []
for (let i=0; i<shadow_lights.length; i++) {
  basic_u_shadow_lights[i] = {
    world_light_matrix: null,
    shadow_map: null,
    rotation: null,
    perspective: null,
  }
}
function compile_basic_shader () {
  basic_shader_program = create_shader_program(gl, assets.basic_vertex, assets.basic_fragment)
  gl.useProgram(basic_shader_program)
  basic_a_pos = gl.getAttribLocation(basic_shader_program, 'a_pos')
  basic_a_normal = gl.getAttribLocation(basic_shader_program, 'a_normal')
  basic_a_uv = gl.getAttribLocation(basic_shader_program, 'a_uv')
  basic_u_sampler = gl.getUniformLocation(basic_shader_program, 'u_sampler')
  basic_u_model_world_matrix = gl.getUniformLocation(basic_shader_program, 'u_model_world_matrix')
  basic_u_world_view_matrix = gl.getUniformLocation(basic_shader_program, 'u_world_view_matrix')
  basic_u_perspective_matrix = gl.getUniformLocation(basic_shader_program, 'u_perspective_matrix')
  basic_u_world_model_transpose_matrix = gl.getUniformLocation(basic_shader_program, 'u_world_model_transpose_matrix')
  for (let i=0; i<shadow_lights.length; i++) {
    basic_u_shadow_lights[i].world_light_matrix = gl.getUniformLocation(basic_shader_program, 'u_shadow_lights_'+i+'_world_light_matrix')
    basic_u_shadow_lights[i].shadow_map = gl.getUniformLocation(basic_shader_program, 'u_shadow_lights_'+i+'_shadow_map')
    basic_u_shadow_lights[i].rotation = gl.getUniformLocation(basic_shader_program, 'u_shadow_lights_'+i+'_rotation')
    basic_u_shadow_lights[i].perspective = gl.getUniformLocation(basic_shader_program, 'u_shadow_lights_'+i+'_perspective')
  }
  gl.uniformMatrix4fv(basic_u_perspective_matrix, false, camera_perspective_matrix)
}



/****************************
 * Update
 ***************************/

function update () {
  if (has_resized) { handle_resize() }
  update_camera()
  update_daryosh()

  has_mousedowned = false
  has_mouseupped = false
  has_clicked = false
  has_resized = false
}

function handle_resize () {
  let w = 0
  let h = 0
  h = Math.floor(window.innerHeight)
  w = Math.floor(window.innerWidth)
  canvas.style.width = w+"px"
  canvas.style.height = h+"px"
  canvas.width = canvas_scale*w
  canvas.height = canvas_scale*h

  gl.viewport(0, 0, canvas.width, canvas.height)

  // Since the aspect isn't changing, all this should be able to be done once
  camera_update_perspective()

  gl.useProgram(basic_shader_program)
  gl.uniformMatrix4fv(basic_u_perspective_matrix, false, camera_perspective_matrix)
}


function do_translate (x, y) {
  pan_x = pan_x + x;
  pan_y = pan_y + y;
}


const FRICTION = 0.86;
function update_daryosh () {
  do_translate(vx, vy);

  vx = vx + 0.1*(-vx * (1-FRICTION))*dt;
  vy = vy + 0.1*(-vy * (1-FRICTION))*dt;

  if (!(Math.abs(vx) >= 0.001 || Math.abs(vy) >= 0.001)) {
    vx = 0;
    vy = 0;
  }

  daryosh_rotation_theta = pan_x*0.01;
  daryosh_rotation_theta = daryosh_rotation_theta - dt*0.0001;
  create_y_rotation_matrix(daryosh_transform.rotation, daryosh_rotation_theta)
  matrix_mult_4(daryosh_transform.model_world_matrix, daryosh_transform.translation, daryosh_transform.rotation)
  matrix_transpose_4(daryosh_transform.inverse_rotation, daryosh_transform.rotation)
  matrix_mult_4(daryosh_transform.world_model_matrix, daryosh_transform.inverse_rotation, daryosh_transform.inverse_translation)
  matrix_transpose_4(daryosh_transform.world_model_transpose_matrix, daryosh_transform.world_model_matrix)
}




function update_camera () {
  if (right_pressed) {
    camera_ry_target = camera_ry_target - dt*0.0015
  }
  if (left_pressed) {
    camera_ry_target = camera_ry_target + dt*0.0015
  }
  if (up_pressed) {
    const n = create_translation_matrix(new Float32Array(16), -dt*0.015 * Math.sin(camera_ry), 0, -dt*0.015 * Math.cos(camera_ry))
    const v = matrix_operate_4(new Float32Array(4), n, [camera_tx_target, camera_ty_target, camera_tz_target, 1])
    camera_tx_target = v[0]
    camera_ty_target = v[1]
    camera_tz_target = v[2]
  }
  if (down_pressed) {
    const n = create_translation_matrix(new Float32Array(16), dt*0.015 * Math.sin(camera_ry), 0, dt*0.015 * Math.cos(camera_ry))
    const v = matrix_operate_4(new Float32Array(4), n, [camera_tx_target, camera_ty_target, camera_tz_target, 1])
    camera_tx_target = v[0]
    camera_ty_target = v[1]
    camera_tz_target = v[2]
  }


  if (camera_animation_tween < 1) {
    camera_animation_tween += dt*0.0045
  }
  else {
    camera_animation_tween = 1
  }

  let camera_eased = -(Math.cos(Math.PI * camera_animation_tween) - 1) / 2;


  camera_ry = camera_eased * (camera_ry_target) + (1-camera_eased) * camera_prev_ry

  camera_position[0] = camera_eased * (camera_tx_target) + (1-camera_eased) * camera_prev_position[0]
  camera_position[1] = camera_eased * (camera_ty_target) + (1-camera_eased) * camera_prev_position[1]
  camera_position[2] = camera_eased * (camera_tz_target) + (1-camera_eased) * camera_prev_position[2]

  camera_rotation[0] = Math.cos(camera_ry)
  camera_rotation[2] = -Math.sin(camera_ry)
  camera_rotation[8] = Math.sin(camera_ry)
  camera_rotation[10] = Math.cos(camera_ry)

  camera_translation[12] = camera_position[0]
  camera_translation[13] = camera_position[1]
  camera_translation[14] = camera_position[2]

  camera_inverse_translation[12] = -camera_position[0]
  camera_inverse_translation[13] = -camera_position[1]
  camera_inverse_translation[14] = -camera_position[2]

  matrix_transpose_4(camera_inverse_rotation, camera_rotation)


  matrix_mult_4(camera_world_view_matrix, camera_inverse_rotation, camera_inverse_translation)
  matrix_mult_4(camera_view_world_matrix, camera_rotation, camera_translation)
}

function update_transform (t) {
  matrix_transpose_4(t.world_model_transpose_matrix, t.world_model_matrix)
}


/****************************
 * Main
 ***************************/

const asset_urls = {
  daryosh_obj: '/obj/daryosh.obj',
  shadow_vertex: '/shaders/shadow.vert',
  shadow_fragment: '/shaders/shadow.frag',
  basic_vertex: '/shaders/basic.vert',
  basic_fragment: '/shaders/basic.frag',
}

const image_urls = {
  daryosh_png: '/images/d_dif.png',
}

const model_buffers = {}
const assets = {}
const images = {}

function generate_texture (modelbuffer, image) {
  modelbuffer.texture_id = gen_next_texture_id()
  modelbuffer.texture = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0 + modelbuffer.texture_id)
  gl.bindTexture(gl.TEXTURE_2D, modelbuffer.texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.generateMipmap(gl.TEXTURE_2D)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
}

function main () {
  loading_el.innerHTML = ''
  init_canvas()

  camera_update_perspective()

  camera_ry_target = Math.PI/2
  camera_tx_target = 15.267
  camera_ty_target = 0.043
  camera_tz_target = -0.039

  gl.getExtension('WEBGL_depth_texture')

  for (let i=0; i<shadow_lights.length; i++) {
    shadow_lights[i].shadow_depth_texture = gl.createTexture()
    shadow_lights[i].shadow_color_texture = gl.createTexture()
    shadow_lights[i].shadow_framebuffer = gl.createFramebuffer()
    create_shadow_map(
      shadow_lights[i].shadow_depth_texture,
      shadow_lights[i].shadow_depth_texture_id,
      shadow_lights[i].shadow_color_texture,
      shadow_lights[i].shadow_color_texture_id,
      shadow_lights[i].shadow_framebuffer,
      shadow_lights[i].shadow_resolution
    )
  }

  model_buffers.daryosh = load_obj(gl, assets.daryosh_obj)
  generate_texture(model_buffers.daryosh, images.daryosh_png)


  compile_shadow_shader()
  compile_basic_shader()

  window.requestAnimationFrame(main_loop)
}

load_assets(asset_urls, assets, () => { load_images(image_urls, images, main) })
