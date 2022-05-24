#version 310 es
#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout (location = 0) out highp vec2 outUV;

// out gl_PerVertex
// {
// 	highp vec4 gl_Position;
// };

void main() 
{
	// vec3 fullscreen_triangle_positions[3] = vec3[3](vec3(3.0, 1.0, 0.5), vec3(-1.0, 1.0, 0.5), vec3(-1.0, -3.0, 0.5));
	// vec2 fullscreen_triangle_uvs[3] = vec2[3](vec2(2.0, 1.0), vec2(0.0, 1.0), vec2(0.0, -1.0));
	// outUV = fullscreen_triangle_uvs[gl_VertexIndex];
	// gl_Position  = vec4(fullscreen_triangle_positions[gl_VertexIndex], 1.0);


	// (0,0), (2,0),(0,2)
	vec2 fullscreen_triangle_uvs[3] = vec2[3](vec2(0.0, 0.0), vec2(2.0, 0.0), vec2(0.0, 2.0));
	outUV = fullscreen_triangle_uvs[gl_VertexIndex];
	// outUV = vec2((gl_VertexIndex << 1) & 2, gl_VertexIndex & 2);
	gl_Position = vec4(outUV * 2.0f - 1.0f, 0.0f, 1.0f);
}
