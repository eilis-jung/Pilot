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

    // Size of LUT in one dimension
    highp float size = 16.0;

    // 
    highp vec3 rgbs[8];
    highp vec4 colors[8];

    // Get interpolation weights. Actual weight starting from base_color is (1 - weight_next_x)
    highp float weight_next_r = fract(color.r * (size - 1.0));
    highp float weight_next_g = fract(color.g * (size - 1.0));
    highp float weight_next_b = fract(color.b * (size - 1.0));

    highp vec3 base_color = vec3(
        floor(color.r * (size - 1.0)) / size,
        floor(color.g * (size - 1.0)) / size,
        floor(color.b * (size - 1.0)) / size
    );
    highp vec3 next_color = vec3(0, 0, 0);
    if(color.r < 1.0) {
        next_color.r = base_color.r + (1.0 / size);
    } else {
        next_color.r = base_color.r;
    }
    if(color.g < 1.0) {
        next_color.g = base_color.g + (1.0 / size);
    } else {
        next_color.g = base_color.g;
    }
    if(color.b < 1.0) {
        next_color.b = base_color.b + (1.0 / size);
    } else {
        next_color.b = base_color.b;
    }

    // Sample 8 neighboring grid values from LUT
    rgbs[0] = vec3(base_color.r, base_color.g, base_color.b);
    rgbs[1] = vec3(next_color.r, base_color.g, base_color.b);
    rgbs[2] = vec3(base_color.r, next_color.g, base_color.b);
    rgbs[3] = vec3(base_color.r, base_color.g, next_color.b);
    rgbs[4] = vec3(next_color.r, next_color.g, base_color.b);
    rgbs[5] = vec3(next_color.r, base_color.g, next_color.b);
    rgbs[6] = vec3(base_color.r, next_color.g, next_color.b);
    rgbs[7] = vec3(next_color.r, next_color.g, next_color.b);
    
    for (int i = 0; i < 8; i++)
    {
        highp float v = rgbs[i].g;
        highp float u = rgbs[i].r / size + rgbs[i].b;
        colors[i] = texture(color_grading_lut_texture_sampler, vec2(u, v));
    }

    // Trilinear interpolation, note that mix in OpenGL: mix(x, y, a): x * (1 - a) + y * a
    // First interpolate over r, then g, then b.
    highp vec4 color_res = mix(mix(colors[0], colors[1], weight_next_r), mix(colors[2], colors[4], weight_next_r), weight_next_g);
    highp vec4 color_res2 = mix(mix(colors[3], colors[5], weight_next_r), mix(colors[6], colors[7], weight_next_r), weight_next_g);
    highp vec4 result = mix(color_res, color_res2, weight_next_b);
    out_color = result;
}