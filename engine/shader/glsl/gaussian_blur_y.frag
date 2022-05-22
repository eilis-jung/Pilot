#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(set = 0, binding = 2) uniform sampler2D scene_sampler;

layout(input_attachment_index = 1, set = 0, binding = 1) uniform highp subpassInput in_brightness;

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

    highp float intensity = 1.0;
    highp vec4 color = subpassLoad(in_color).rgba;
    highp vec4 brightness_color = subpassLoad(in_brightness).rgba;

    highp float tox = 1.0 / float(textureSize(scene_sampler, 0).x) * float(5.0);
    highp float toy = 1.0 / float(textureSize(scene_sampler, 0).y) * float(5.0);

    highp vec2 tex_offset = vec2(tox, toy); // gets size of single texel
	highp vec3 result = texture(scene_sampler, in_texcoord).rgb * weight[0]; // current fragment's contribution

	for(int i = 1; i < 5; ++i)
	{
        result += texture(scene_sampler, in_texcoord + vec2(0.0, tex_offset.x * float(i))).rgb * weight[i] * intensity;
        result += texture(scene_sampler, in_texcoord - vec2(0.0, tex_offset.x * float(i))).rgb * weight[i] * intensity;

	}
	out_color = vec4(result, 1.0);

    // highp vec4 color = subpassLoad(in_color).rgba;
    // highp vec4 brightness_color = subpassLoad(in_brightness).rgba;
    // out_color = color;
    
}