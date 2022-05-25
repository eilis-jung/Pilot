#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

layout(input_attachment_index = 0, set = 0, binding = 0) uniform highp subpassInput in_color;

layout(location = 0) out highp vec4 out_color;


void main()
{
    highp vec4 color       = subpassLoad(in_color).rgba;

    highp float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));
    if(brightness > 0.9) {
        out_color = vec4(color.rgb, 1.0);
    } else {
        out_color = vec4(0.0, 0.0, 0.0, 1.0);
    }
}