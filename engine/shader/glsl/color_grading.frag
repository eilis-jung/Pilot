#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(set = 0, binding = 1) uniform sampler2D color_grading_lut_texture_sampler;

layout(location = 0) out highp vec4 out_color;

void main()
{
    highp ivec2 lut_tex_size = textureSize(color_grading_lut_texture_sampler, 0);
    highp float _COLORS      = float(lut_tex_size.y);
    highp vec4 color       = subpassLoad(in_color).rgba;
    
    highp float size = 16.0;

    // Base unit to move colors
    highp vec3 pos_base = vec3(1.0/float(lut_tex_size.x),  1.0/float(lut_tex_size.y), size - 1.0f);

    // Get the position of 2 colors
    highp float currpos = floor(color.b * pos_base.z);
    highp float currpos_distance = (color.b * pos_base.z) - currpos;
    highp float x = color.r * pos_base.x * pos_base.z + pos_base.y * currpos;
    highp float y = color.g * pos_base.y * pos_base.z;

    // Sample 2 colors to interpolate
    highp vec2 uv1 = vec2(x + pos_base.x * 0.5, y + pos_base.y * 0.5);
    highp vec2 uv2 = vec2(x + pos_base.x * 0.5 + pos_base.y, y + pos_base.y * 0.5);
    highp vec3 color1 = texture(color_grading_lut_texture_sampler, uv1).rgb;
    highp vec3 color2 = texture(color_grading_lut_texture_sampler, uv2).rgb;

    // Interpolation, note that mix in OpenGL: mix(x, y, a): x * (1 - a) + y * a
    highp vec3 color_res = mix(color1, color2, currpos_distance);

    out_color.rgb = color_res;
}