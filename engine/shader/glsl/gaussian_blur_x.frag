#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(set = 0, binding = 0) uniform sampler2D scene_sampler;

layout(location = 0) in highp vec2 in_texcoord;

layout(location = 0) out highp vec4 out_color;


void main()
{

    highp float weight[5];
	weight[0] = 0.227027;
	weight[1] = 0.1945946;
	weight[2] = 0.1216216;
	weight[3] = 0.054054;
	weight[4] = 0.016216;

    // highp vec2 inUV = vec2(in_texcoord.x * 0.5, in_texcoord.y * 0.5 + 0.5);
    highp vec2 inUV = in_texcoord * 0.5;
    highp float intensity = 1.0;
    highp float range = 1.0;

    highp float tox = 1.0 / float(textureSize(scene_sampler, 0).x) * range;
    highp float toy = 1.0 / float(textureSize(scene_sampler, 0).y) * range;

    highp vec2 tex_offset = vec2(tox, toy); // gets size of single texel
    highp vec4 sampled_color = texture(scene_sampler, inUV).rgba;
    
	highp vec3 result = texture(scene_sampler, inUV).rgb * weight[0]; // current fragment's contribution

	for(int i = 1; i < 5; ++i)
	{
        result += texture(scene_sampler, inUV + vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i] * intensity;
        result += texture(scene_sampler, inUV - vec2(tex_offset.x * float(i), 0.0)).rgb * weight[i] * intensity;
	}
	out_color = vec4(result, 1.0);
    // out_color = vec4(0.0, 0.0, 0.0, 1.0);
}