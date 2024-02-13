precision mediump float;

attribute vec3 a_pos;
attribute vec3 a_normal;
attribute vec2 a_uv;
uniform mat4 u_perspective_matrix;
uniform mat4 u_model_world_matrix;
uniform mat4 u_world_view_matrix;
uniform mat4 u_world_model_transpose_matrix;

uniform mat4 u_shadow_lights_0_world_light_matrix;
uniform mat4 u_shadow_lights_0_perspective;

varying vec4 light_space_pos_0;
varying vec3 normal;
varying vec2 uv;


void main () {
  vec4 world_pos = u_model_world_matrix * vec4(a_pos, 1.0);

  gl_Position = u_perspective_matrix * u_world_view_matrix * world_pos;
  light_space_pos_0 = u_shadow_lights_0_perspective * u_shadow_lights_0_world_light_matrix * world_pos;
  uv = a_uv;
  normal = vec3(u_world_model_transpose_matrix * vec4(a_normal, 1.0));
}
