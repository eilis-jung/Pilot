# Homework 2 - Jung

For full code, see the end of this report.

## Task 1

### Implementation

Given the task description and hints in lecture ("using linear interpolation"), the general idea of my implementation is to,

1. Get 8 color samples from 8 neighboring grid points in 3D LUT
2. Interpolate to the real value, given its neighbors
3. Return the interpolated sample as output.

**Step 1**

Corresponding code : `color_grading.frag`, line 22-69.

With given LUT examples in Pilot, it is obvious that, a LUT in Pilot should be a (16x16)x16 png, with its y-axis being Green value, and x-axis being a combination of Red and Blue values. Each color component is split into 15 grid cells, and has 16 grid values. A sRGB color with its 3 components in range [0, 1) can be mapped to LUT grid cells, and its 8 neighboring grid values can consequentially be found.

An exceptional case would be when a color component has the value of 1.0. In this case it would be mapped to the border of LUT, and has less than 8 neighboring grid points. To prevent the color from mapping out of LUT grid, certain clamping is needed.

During implementation I struggled a bit about branching. To deal with boundary conditions, some `if-else` statements are needed. As generally known, branching in GPU can significantly lower the performance, but I couldn't avoid them.

Another concern was about declaring 2 arrays (`rgbs[8]` and `colors[8]`) to store the grid values and their samples. I could have merged them into one array, but I was not sure how much performance optimization it would bring.


**Step 2**

Corresponding code : `color_grading.frag`, line 71-75.

At first I misunderstood the interpolation. I thought it was simply a weighted average of all the 8 neighbors, and the weights were given by their distances to real value. The result had artifacts and when I looked back, a trilinear interpolation is different from weighted average. Obviously triliner interpolation works better for this task.


**Step 3**

Corresponding code : `color_grading.frag`, line 76.



### Task 1 - Result

Without color-grading:

![Without color-grading](report/../before.png "Without color-grading")

With color-grading (color_grading_lut_05.png):

![Without color-grading (color_grading_lut_05.png)](report/../after_lut_05.png "With color-grading(color_grading_lut_05.png)")

## Task 2

### Implementation

I found a free LUT (in .cube) online and adjusted it a bit to make the coloring stronger. It gives strong saturation in blue and orange, producing an "early-morning" vibe. Then I exported a 256x16 png with it.

### Task 2 - Result

With customized color-grading (color_grading_lut_05.png):

![Without color-grading (customized_lut.png)](report/../after_customized_lut.png "With color-grading(customized_lut.png)")


**Full Code of color_grading.frag**

```Cpp
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

    // sRGB values of 8 neighboring grid points
    highp vec3 rgbs[8];
    // And their corresponding color samples
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
```
