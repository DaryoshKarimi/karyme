/****************************
 * Vector
 ***************************/

const temp0 = new Float32Array(3)

function cross3 (v,a,b) { 
  const ax = a[0]
  const ay = a[1]
  const az = a[2]
  const bx = b[0]
  const by = b[1]
  const bz = b[2]
  v[0] = ay*bz-az*by
  v[1] = az*bx-ax*bz
  v[2] = ax*by-ay*bx
  return v
}
function sub3 (v,a,b) { v[0] = a[0]-b[0]; v[1] = a[1]-b[1]; v[2] = a[2]-b[2]; return v; }
function sum3 (v,a,b) { v[0] = a[0]+b[0]; v[1] = a[1]+b[1]; v[2] = a[2]+b[2]; return v; }
function scl3 (v,c,a) { v[0] = c*a[0];    v[1] = c*a[1];    v[2] = c*a[2];    return v; }
function dot3 (a,b) { return a[0]*b[0] + a[1]*b[1] + a[2]*b[2] }
function norm3 (v, a) {
  const n = Math.sqrt(a[0]*a[0] + a[1]*a[1] + a[2]*a[2])
  v[0] = a[0]/n
  v[1] = a[1]/n
  v[2] = a[2]/n
  return v
}
function mag3 (v) { return Math.sqrt(v[0]*v[0]+v[1]*v[1]+v[2]*v[2]) }



/****************************
 * Matrix
 ***************************/


const ROTATION_Y_HALF_PI = new Float32Array([
  0, 0, 1, 0,
  0, 1, 0, 0,
 -1, 0, 0, 0,
  0, 0, 0, 1
])

const ROTATION_X_PI = new Float32Array([
  1, 0, 0, 0,
  0,-1, 0, 0,
  0, 0,-1, 0,
  0, 0, 0, 1
])

function matrix_transpose_4 (m, a) {
  for (let i=0; i<4; i++) {
    for (let j=0; j<4; j++) {
      let t = a[i*4 + j]
      m[i*4 + j] = a[j*4 + i]
      m[j*4 + i] = t
    }
  }
  return m
}

function matrix_mult_4 (m, a, b) {
  const t = new Float32Array(16)
  for (let i=0; i<4; i++) {
    for (let j=0; j<4; j++) {
      for (let k=0; k<4; k++) {
        t[i*4 + j] += a[j + k*4] * b[i*4 + k]
      }
    }
  }
  for (let i=0; i<16; i++) {
    m[i] = t[i]
  }
  return m
}

function matrix_operate_4 (w, m, v) {
  let t = new Float32Array(4)
  t[0] = v[0]
  t[1] = v[1]
  t[2] = v[2]
  t[3] = v[3]
  for (let j=0; j<4; j++) {
    w[j] = 0
    for (let k=0; k<4; k++) {
      w[j] += m[j + k*4] * t[k]
    }
  }
  return w
}

function create_identity_matrix (m) {
  m[0]  = 1; m[1]  = 0; m[2]  = 0; m[3]  = 0;
  m[4]  = 0; m[5]  = 1; m[6]  = 0; m[7]  = 0;
  m[8]  = 0; m[9]  = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m
}

function create_x_rotation_matrix (m, t) {
  const c = Math.cos(t)
  const s = Math.sin(t)
  m[0]  = 1; m[1]  = 0; m[2]  = 0; m[3]  = 0;
  m[4]  = 0; m[5]  = c; m[6]  = s; m[7]  = 0;
  m[8]  = 0; m[9]  =-s; m[10] = c; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m
}

function create_y_rotation_matrix (m, t) {
  const c = Math.cos(t)
  const s = Math.sin(t)
  m[0]  = c; m[1]  = 0; m[2]  =-s; m[3]  = 0;
  m[4]  = 0; m[5]  = 1; m[6]  = 0; m[7]  = 0;
  m[8]  = s; m[9]  = 0; m[10] = c; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m

}

function create_z_rotation_matrix (m, t) {
  const c = Math.cos(t)
  const s = Math.sin(t)
  m[0]  = c; m[1]  = s; m[2]  = 0; m[3]  = 0;
  m[4]  =-s; m[5]  = c; m[6]  = 0; m[7]  = 0;
  m[8]  = 0; m[9]  = 0; m[10] = 1; m[11] = 0;
  m[12] = 0; m[13] = 0; m[14] = 0; m[15] = 1;
  return m
}

function create_translation_matrix (m, x,y,z) {
  m[0]  = 1; m[1]  = 0; m[2]  = 0; m[3]  = 0;
  m[4]  = 0; m[5]  = 1; m[6]  = 0; m[7]  = 0;
  m[8]  = 0; m[9]  = 0; m[10] = 1; m[11] = 0;
  m[12] = x; m[13] = y; m[14] = z; m[15] = 1;
  return m
}

function create_inverse_translation_matrix (m, n) {
  m[0]  = 1;      m[1]  = 0;      m[2]  = 0;      m[3]  = 0;
  m[4]  = 0;      m[5]  = 1;      m[6]  = 0;      m[7]  = 0;
  m[8]  = 0;      m[9]  = 0;      m[10] = 1;      m[11] = 0;
  m[12] = -n[12]; m[13] = -n[13]; m[14] = -n[14]; m[15] = 1;
  return m
}

function create_lookat_rotation_matrix (m, from, to) {
  const f = new Float32Array(3)
  const r = new Float32Array(3)
  const u = new Float32Array([0,1,0])
  sub3(f, from, to)
  norm3(f, f)
  cross3(r, u, f)
  norm3(r, r)
  cross3(u, f, r)
  m[0]  = r[0];    m[1]  = r[1];    m[2]  = r[2];    m[3]  = 0;
  m[4]  = u[0];    m[5]  = u[1];    m[6]  = u[2];    m[7]  = 0;
  m[8]  = f[0];    m[9]  = f[1];    m[10] = f[2];    m[11] = 0;
  m[12] = 0;      m[13] = 0;      m[14] = 0;      m[15] = 1;
  return m
}


/****************************
 * Loaders
 ***************************/


function load_texture(gl, image, id) {
  const texture = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0+id)
  gl.bindTexture(gl.TEXTURE_2D, texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  return texture
}


function load_texture_cube_no_mip (gl, img_pos_x, img_neg_x, img_pos_y, img_neg_y, img_pos_z, img_neg_z, id) {
  const texture = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0+id)
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img_pos_x)
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img_neg_x)
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img_pos_y)
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img_neg_y)
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img_pos_z)
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img_neg_z)
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  return texture
}


function load_texture_cube (gl, img_pos_x, img_neg_x, img_pos_y, img_neg_y, img_pos_z, img_neg_z, id) {
  const texture = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0+id)
  gl.bindTexture(gl.TEXTURE_CUBE_MAP, texture)
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img_pos_x)
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_X, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img_neg_x)
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img_pos_y)
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Y, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img_neg_y)
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_POSITIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img_pos_z)
  gl.texImage2D(gl.TEXTURE_CUBE_MAP_NEGATIVE_Z, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img_neg_z)
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.generateMipmap(gl.TEXTURE_CUBE_MAP)
  gl.texParameteri(gl.TEXTURE_CUBE_MAP, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);
  return texture
}


function load_obj (gl, obj) {
  const model = {
    vertices: [],
    indices: [],
    normals: [],
    uvs: [],
  }


  let offset = 0
  let line = ''
  let i = offset
  while (!(line[0] == 'v' && line[1] == ' ')) {
    while (obj[i] !== '\n') {
      i = i + 1
      if (obj[i] === undefined) { throw ("OBJ missing vertex data") }
    }
    line = obj.substring(offset, i)
    i = i + 1
    offset = i
  }
  while (line[0] == 'v' && line[1] == ' ') {
    const split = line.split(' ')
    model.vertices.push(parseFloat(split[1]), parseFloat(split[2]), parseFloat(split[3]))
    while (obj[i] !== '\n') {
      i++
      if (obj[i] === undefined) { throw ("OBJ data corrupted (expected end of line in vertex data)") }
    }
    line = obj.substring(offset, i)
    i++
    offset = i
  }


  offset = 0
  line = ''
  i = offset
  let uvs = []
  while (!(line[0] == 'v' && line[1] == 't')) {
    while (obj[i] !== '\n') {
      i = i + 1
      if (obj[i] === undefined) { throw ("OBJ missing vertex UV data") }
    }
    line = obj.substring(offset, i)
    i = i + 1
    offset = i
  }
  while (line[0] == 'v' && line[1] == 't') {
    const split = line.split(' ')
    uvs.push([parseFloat(split[1]), parseFloat(split[2])])
    while (obj[i] !== '\n') {
      i++
      if (obj[i] === undefined) { throw ("OBJ data corrupted (expected end of line in UV data)") }
    }
    line = obj.substring(offset, i)
    i++
    offset = i
  }


  offset = 0
  line = ''
  i = offset
  let normals = []
  while (!(line[0] == 'v' && line[1] == 'n')) {
    while (obj[i] !== '\n') {
      i = i + 1
      if (obj[i] === undefined) { throw ("OBJ missing vertex normal data") }
    }
    line = obj.substring(offset, i)
    i = i + 1
    offset = i
  }
  while (line[0] == 'v' && line[1] == 'n') {
    const split = line.split(' ')
    normals.push([parseFloat(split[1]), parseFloat(split[2]), parseFloat(split[3])])
    while (obj[i] !== '\n') {
      i++
      if (obj[i] === undefined) { throw ("OBJ data corrupted (expected end of line in vertex normal data)") }
    }
    line = obj.substring(offset, i)
    i++
    offset = i
  }

  let indices = []
  while (!(line[0] == 'f' && line[1] == ' ')) {
    while (obj[i] !== '\n') {
      i = i + 1
      if (obj[i] === undefined) { throw ("OBJ missing face data") }
    }
    line = obj.substring(offset, i)
    i = i + 1
    offset = i
  }
  while (line[0] == 'f' && line[1] == ' ') {
    const split = line.split(' ')
    for (let j=1; j<split.length; j++) {
      split[j] = split[j].split('/')
    }

    model.indices.push(parseInt(split[1][0])-1, parseInt(split[2][0])-1, parseInt(split[3][0])-1)


    model.uvs[2*(parseInt(split[1][0])-1)+0] = uvs[parseInt(split[1][1])-1][0]
    model.uvs[2*(parseInt(split[1][0])-1)+1] = uvs[parseInt(split[1][1])-1][1]

    model.uvs[2*(parseInt(split[2][0])-1)+0] = uvs[parseInt(split[2][1])-1][0]
    model.uvs[2*(parseInt(split[2][0])-1)+1] = uvs[parseInt(split[2][1])-1][1]

    model.uvs[2*(parseInt(split[3][0])-1)+0] = uvs[parseInt(split[3][1])-1][0]
    model.uvs[2*(parseInt(split[3][0])-1)+1] = uvs[parseInt(split[3][1])-1][1]

    model.normals[3*(parseInt(split[1][0])-1)+0] = normals[parseInt(split[1][2])-1][0]
    model.normals[3*(parseInt(split[1][0])-1)+1] = normals[parseInt(split[1][2])-1][1]
    model.normals[3*(parseInt(split[1][0])-1)+2] = normals[parseInt(split[1][2])-1][2]

    model.normals[3*(parseInt(split[2][0])-1)+0] = normals[parseInt(split[2][2])-1][0]
    model.normals[3*(parseInt(split[2][0])-1)+1] = normals[parseInt(split[2][2])-1][1]
    model.normals[3*(parseInt(split[2][0])-1)+2] = normals[parseInt(split[2][2])-1][2]

    model.normals[3*(parseInt(split[3][0])-1)+0] = normals[parseInt(split[3][2])-1][0]
    model.normals[3*(parseInt(split[3][0])-1)+1] = normals[parseInt(split[3][2])-1][1]
    model.normals[3*(parseInt(split[3][0])-1)+2] = normals[parseInt(split[3][2])-1][2]
    while (obj[i] !== '\n') {
      i++
      if (obj[i] === undefined) { break }
    }
    line = obj.substring(offset, i)
    i++
    offset = i
  }

  model.vertices = new Float32Array(model.vertices)
  model.indices = new Uint16Array(model.indices)
  model.uvs = new Float32Array(model.uvs)
  model.normals = new Float32Array(model.normals)

  const buffers = {
    vertices: gl.createBuffer(),
    indices: gl.createBuffer(),
    uvs: gl.createBuffer(),
    normals: gl.createBuffer(),
    num_indices: model.indices.length,
  }

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.vertices)
  gl.bufferData(gl.ARRAY_BUFFER, model.vertices, gl.STATIC_DRAW)

  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, buffers.indices)
  gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, model.indices, gl.STATIC_DRAW)

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.uvs)
  gl.bufferData(gl.ARRAY_BUFFER, model.uvs, gl.STATIC_DRAW)

  gl.bindBuffer(gl.ARRAY_BUFFER, buffers.normals)
  gl.bufferData(gl.ARRAY_BUFFER, model.normals, gl.STATIC_DRAW)

  return buffers
}

const loading_el = document.createElement('div')
loading_el.style.display = 'none';
document.body.appendChild(loading_el)

function load_images (image_urls, images, cb) {
  loading_el.innerHTML = 'loading images'
  for (let k in image_urls) {
    const img = new Image()
    img.src = image_urls[k]
    img.onload = ((k) => () => {
      images[k] = img
      loading_el.innerHTML = 'loading images '+Object.keys(images).length+'/'+Object.keys(image_urls).length
      if (Object.keys(images).length == Object.keys(image_urls).length) {
        cb()
      }
    })(k)
  }
}


function load_assets (asset_urls, assets, cb) {
  loading_el.innerHTML = 'loading assets'
  for (let k in asset_urls) {
    fetch(asset_urls[k]).then(res => res.text())
    .then((k => data => {
      assets[k] = data
      loading_el.innerHTML = 'loading assets '+Object.keys(assets).length+'/'+Object.keys(asset_urls).length
      if (Object.keys(assets).length == Object.keys(asset_urls).length) {
        cb()
      }
    })(k))
  }
}


/****************************
 * Create Shader Program
 ***************************/

function create_shader_program (gl, vert_source, frag_source) {
  const vert_shader = gl.createShader(gl.VERTEX_SHADER)
  const frag_shader = gl.createShader(gl.FRAGMENT_SHADER)
  gl.shaderSource(vert_shader, vert_source)
  gl.shaderSource(frag_shader, frag_source)
  gl.compileShader(vert_shader)
  const info_log_vert = gl.getShaderInfoLog(vert_shader)
  if (info_log_vert) {
    console.log(vert_source)
    console.log(info_log_vert)
  }
  gl.compileShader(frag_shader)
  const info_log_frag = gl.getShaderInfoLog(frag_shader)
  if (info_log_frag) {
    console.log(frag_source)
    console.log(info_log_frag)
  }
  const program = gl.createProgram()
  gl.attachShader(program, vert_shader)
  gl.attachShader(program, frag_shader)
  gl.linkProgram(program)
  const info_log_link = gl.getProgramInfoLog(program)
  if (info_log_link) { console.log(info_log_link) }
  return program
}


/**********************
 * Create Shadow Map
 **********************/

function create_shadow_map (depth_texture, depth_texture_id, color_texture, color_texture_id, framebuffer, resolution) {
  gl.activeTexture(gl.TEXTURE0 + depth_texture_id)
  gl.bindTexture(gl.TEXTURE_2D, depth_texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.DEPTH_COMPONENT, resolution, resolution, 0, gl.DEPTH_COMPONENT, gl.UNSIGNED_INT, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.TEXTURE_2D, depth_texture, 0)
  color_texture = gl.createTexture()
  gl.activeTexture(gl.TEXTURE0 + color_texture_id)
  gl.bindTexture(gl.TEXTURE_2D, color_texture)
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, resolution, resolution, 0, gl.RGBA, gl.UNSIGNED_BYTE, null)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, color_texture, 0)
  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
}
