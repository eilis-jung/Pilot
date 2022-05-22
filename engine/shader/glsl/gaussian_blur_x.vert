#version 310 es

layout (location = 0) out highp vec2 outUV;

// out gl_PerVertex
// {
// 	highp vec4 gl_Position;
// };

void main() 
{
	outUV = vec2((gl_VertexIndex << 1) & 2, gl_VertexIndex & 2);
	// gl_Position = vec4(outUV * 2.0f - 1.0f, 0.0f, 1.0f);
}
