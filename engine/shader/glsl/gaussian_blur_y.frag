#version 310 es

#extension GL_GOOGLE_include_directive : enable

#include "constants.h"

// layout(input_attachment_index = 0, set = 0, binding = 2) uniform highp subpassInput in_color;

layout(set = 0, binding = 0) uniform sampler2D scene_sampler;

layout(location = 0) in highp vec2 in_texcoord;

layout(location = 0) out highp vec4 out_color;

struct DirectionalLight
{
    highp vec3 direction;
    lowp float _padding_direction;
    highp vec3 color;
    lowp float _padding_color;
};

struct PointLight
{
    highp vec3  position;
    highp float radius;
    highp vec3  intensity;
    lowp float  _padding_intensity;
};

layout(set = 0, binding = 1) readonly buffer _mesh_per_frame
{
    highp mat4       proj_view_matrix;
    highp vec3       camera_position;
    lowp float       _padding_camera_position;
    highp vec3       ambient_light;
    lowp float       _padding_ambient_light;
    highp uint       point_light_num;
    uint             _padding_point_light_num_1;
    uint             _padding_point_light_num_2;
    uint             _padding_point_light_num_3;
    PointLight       scene_point_lights[m_max_point_light_count];
    DirectionalLight scene_directional_light;
    highp mat4       directional_light_proj_view;

    highp vec4       screen_resolution;
    highp vec4       editor_screen_resolution;
};

highp vec2 get_viewport_uv(highp vec2 full_screen_uv);

void main()
{
    highp float weight[5];
	weight[0] = 0.227027;
	weight[1] = 0.1945946;
	weight[2] = 0.1216216;
	weight[3] = 0.054054;
	weight[4] = 0.016216;

    highp vec2 sample_uv = get_viewport_uv(in_texcoord.xy);

    highp float intensity = 1.5;
    highp float range = 1.0;

    highp float tox = 1.0 / float(textureSize(scene_sampler, 0).x) * range;
    highp float toy = 1.0 / float(textureSize(scene_sampler, 0).y) * range;

    highp vec2 tex_offset = vec2(tox, toy);
    highp vec4 sampled_color = texture(scene_sampler, sample_uv).rgba;

    highp vec3 result = texture(scene_sampler, sample_uv).rgb * weight[0];
    for(int i = 1; i < 5; ++i)
    {
        result += texture(scene_sampler, sample_uv + vec2(0.0, tex_offset.x * float(i))).rgb * weight[i] * intensity;
        result += texture(scene_sampler, sample_uv - vec2(0.0, tex_offset.x * float(i))).rgb * weight[i] * intensity;
    }
    out_color = vec4(result, 1.0);

}

highp vec2 get_viewport_uv(highp vec2 full_screen_uv)
{
    highp vec2 editor_ratio = editor_screen_resolution.zw / screen_resolution.xy;
    highp vec2 offset = editor_screen_resolution.xy / screen_resolution.xy;
    highp vec2 viewport_uv = full_screen_uv.xy * editor_ratio + offset.xy;
    
    return viewport_uv;
}
