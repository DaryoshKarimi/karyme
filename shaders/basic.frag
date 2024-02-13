precision mediump float;

uniform sampler2D u_sampler;

uniform sampler2D u_shadow_lights_0_shadow_map;
uniform mat4 u_shadow_lights_0_rotation;

varying vec4 light_space_pos_0;
varying vec3 normal;
varying vec2 uv;


float get_light (sampler2D shadow_map, mat4 rotation, vec4 light_space_pos) {
  vec3 light_direction = (rotation * vec4(0.0, 0.0, -1.0, 1.0)).xyz;
  float shadow_bias = max(0.0005 * (1.0 - dot(normal, light_direction)), 0.0001);

  vec3 scaled_light_space_pos = light_space_pos.xyz / light_space_pos.w;
  scaled_light_space_pos.x += 1.0;
  scaled_light_space_pos.x /= 2.0;
  scaled_light_space_pos.y += 1.0;
  scaled_light_space_pos.y /= 2.0;
  scaled_light_space_pos.z += 1.0;
  scaled_light_space_pos.z /= 2.0;

  float shadow_depth = scaled_light_space_pos.z;

  float shadow = 0.0;
  vec2 texel_size = vec2(1.0 / 1024.0, 1.0 / 1024.0);
  for(int x = -3; x <= 3; x++) {
    for(int y = -3; y <= 3; y++) {
      float pcf_depth = texture2D(shadow_map, scaled_light_space_pos.xy + vec2(x, y) * texel_size).r; 
      shadow += shadow_depth - shadow_bias > pcf_depth ? 1.0 : 0.0;        
    }
  }
  //shadow /= 9.0;
  shadow /= 49.0;


  bool in_range = scaled_light_space_pos.x >= 0.0 && scaled_light_space_pos.x <= 1.0 && scaled_light_space_pos.y >= 0.0 && scaled_light_space_pos.y <= 1.0;
 

  if (!in_range || scaled_light_space_pos.z < 0.0) {
    shadow = 0.0;
  }

  float light = clamp((-dot(light_direction, normal)), 0.0, 1.0);
  float c = (1.0-shadow) * light;
  //return 0.00001 * c + (1.0 - shadow);
  return c;
}


void main () {
  vec3 key_color  = 1.00 * vec3(1.0,0.49,0.7);
  vec3 fill_color = 0.20 * vec3(1.0,1.00,1.0);
  vec3 back_color = 1.00 * vec3(1.0,0.84,0.0);

  vec4 tex_color = texture2D(u_sampler, vec2(uv.x, 1.0-uv.y));

  float key_light = get_light(u_shadow_lights_0_shadow_map, u_shadow_lights_0_rotation, light_space_pos_0);
  float fill_light = clamp(dot(vec3(0.0, 0.0, 1.0), normal), 0.0, 1.0);
  float back_light = clamp(dot(vec3(0.0, 1.0, -1.0), normal), 0.0, 1.0);

  vec3 light_color = key_light * key_color + back_light * back_color + fill_light * fill_color;

  gl_FragColor = vec4(tex_color.rgb * light_color, tex_color.a);
}
