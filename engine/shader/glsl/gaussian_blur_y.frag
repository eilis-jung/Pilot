#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(input_attachment_index = 1, set = 0, binding = 1) uniform highp subpassInput in_brightness;

layout(location = 0) out highp vec4 out_color;


void main()
{
    highp vec4 color = subpassLoad(in_color).rgba;
    highp vec4 brightness_color = subpassLoad(in_brightness).rgba;
    out_color = brightness_color;
    
}