attribute vec3 a_pos;
uniform mat4 u_perspective;
uniform mat4 u_model_world_matrix;
uniform mat4 u_world_light_matrix;

void main () {
  gl_Position = u_perspective * u_world_light_matrix * u_model_world_matrix * vec4(a_pos, 1.0);
}
