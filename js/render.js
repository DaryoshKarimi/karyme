function render () {
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

  render_shadow()
  render_daryosh_basic()
}

function render_shadow_layer (model_buffer, model_world_matrix) {
  gl.bindBuffer(gl.ARRAY_BUFFER, model_buffer.vertices)
  gl.enableVertexAttribArray(shadow_a_pos)
  gl.vertexAttribPointer(shadow_a_pos, 3, gl.FLOAT, false, 0, 0)
  gl.uniformMatrix4fv(shadow_u_model_world_matrix, false, model_world_matrix)
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model_buffer.indices)
  gl.drawElements(gl.TRIANGLES, model_buffer.num_indices, gl.UNSIGNED_SHORT, 0)
}


function render_shadow () {
  gl.useProgram(shadow_shader_program)
  for (let i=0; i<shadow_lights.length; i++) {
    gl.bindFramebuffer(gl.FRAMEBUFFER, shadow_lights[i].shadow_framebuffer)
    gl.viewport(0, 0, shadow_lights[i].shadow_resolution, shadow_lights[i].shadow_resolution)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)

    gl.uniformMatrix4fv(shadow_u_world_light_matrix, false, shadow_lights[i].world_light_matrix)
    gl.uniformMatrix4fv(shadow_u_perspective, false, shadow_lights[i].perspective)

    render_shadow_layer(model_buffers.daryosh, daryosh_transform.model_world_matrix)
  }

  gl.bindFramebuffer(gl.FRAMEBUFFER, null)
  gl.viewport(0, 0, canvas.width, canvas.height)
}


function render_daryosh_basic () {
  gl.useProgram(basic_shader_program)

  gl.bindBuffer(gl.ARRAY_BUFFER, model_buffers.daryosh.vertices)
  gl.enableVertexAttribArray(basic_a_pos)
  gl.vertexAttribPointer(basic_a_pos, 3, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, model_buffers.daryosh.normals)
  gl.enableVertexAttribArray(basic_a_normal)
  gl.vertexAttribPointer(basic_a_normal, 3, gl.FLOAT, false, 0, 0)

  gl.bindBuffer(gl.ARRAY_BUFFER, model_buffers.daryosh.uvs)
  gl.vertexAttribPointer(basic_a_uv, 2, gl.FLOAT, false, 0, 0)
  gl.enableVertexAttribArray(basic_a_uv)

  model_buffers.daryosh.texture_id = 0
  gl.activeTexture(gl.TEXTURE0 + model_buffers.daryosh.texture_id)
  gl.bindTexture(gl.TEXTURE_2D, model_buffers.daryosh.texture)
  gl.uniform1i(basic_u_sampler, model_buffers.daryosh.texture_id)

  gl.uniformMatrix4fv(basic_u_model_world_matrix, false, daryosh_transform.model_world_matrix)
  gl.uniformMatrix4fv(basic_u_world_view_matrix, false, camera_world_view_matrix)
  gl.uniformMatrix4fv(basic_u_world_model_transpose_matrix, false, daryosh_transform.world_model_transpose_matrix)


  for (let i=0; i<shadow_lights.length; i++) {
    gl.uniformMatrix4fv(basic_u_shadow_lights[i].world_light_matrix, false, shadow_lights[i].world_light_matrix)
    shadow_lights[i].shadow_depth_texture_id = 1+i
    gl.activeTexture(gl.TEXTURE0 + shadow_lights[i].shadow_depth_texture_id)
    gl.bindTexture(gl.TEXTURE_2D, shadow_lights[i].shadow_depth_texture)
    gl.uniform1i(basic_u_shadow_lights[i].shadow_map, shadow_lights[i].shadow_depth_texture_id)
    gl.uniformMatrix4fv(basic_u_shadow_lights[i].rotation, false, shadow_lights[i].rotation)
    gl.uniformMatrix4fv(basic_u_shadow_lights[i].perspective, false, shadow_lights[i].perspective)
  }


  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, model_buffers.daryosh.indices)
  gl.drawElements(gl.TRIANGLES, model_buffers.daryosh.num_indices, gl.UNSIGNED_SHORT, 0)
}
