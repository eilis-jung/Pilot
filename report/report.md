# Homework 2 - Jung

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


