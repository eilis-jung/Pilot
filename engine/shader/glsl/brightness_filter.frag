#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(location = 0) out highp vec4 out_color;


void main()
{
    highp vec4 color       = subpassLoad(in_color).rgba;
    highp float luminance = sqrt( 0.299*color.r*color.r + 0.587*color.g*color.g+ 0.114*color.b*color.b );
    if(luminance > 0.9) {
        out_color = vec4(0.9, 0.9, 0.9, 1.0);
    } else {
        out_color = vec4(0.0, 0.0, 0.0, 1.0);
    }
}