## Task 3

### Adding SubRenderPass

To add a subpass of a fragment shader into Pilot `PMainCameraPass`, the following steps are taken:

1. In `engine/source/runtime/function/render/include/render/vulkan_manager/vulkan_passes.h`, add a class for a subpass inherited from `PRenderPassBase`. The subpass class needs following methods:
   ```Cpp
    class PBloomFilterPass : public PRenderPassBase
    {
    public:
        void initialize(VkRenderPass render_pass, VkImageView input_attachment);
        void draw();

        void updateAfterFramebufferRecreate(VkImageView input_attachment);

    private:
        void setupDescriptorSetLayout();
        void setupPipelines();
        void setupDescriptorSet();
    };
    ```
2. In the same file, below line 102, add a const enum for subpass. E.g. `_main_camera_subpass_bloom_filter`

   In the same file, class `PMainCameraPass`->`void draw(...)` (~line 155) and `PMainCameraPass`->`void drawForward(...)` (~line 163), add a subpass instance reference as argument.

4. In `engine/source/runtime/function/render/include/render/vulkan_manager/vulkan_manager.h`, class `PVulkanManager`, add a subpass instance as private property (~line 120)

5. In `engine/source/runtime/function/render/source/vulkan_manager/passes/`, create a new file for the subpass code, implementing declarations in 1.

   Note: remember to change the header file included!

6. In `engine/source/runtime/function/render/source/vulkan_manager/passes/main_camera.cpp`, in `PMainCameraPass::setupAttachments()`, add extra attachments if needed.

   In the same file, in `PMainCameraPass::setupRenderPass()`, ~line 250, add: `VkAttachmentReference`, `VkSubpassDescription`. Note that if using `backup_xxx_color_attachment_description`, every color attachment usage afterwards need to be reversed.

   In `VkSubpassDependency dependencies[8] = {};`, increase array capacity for a new dependency, then initialize the dependency after it. Remember to adapt `srcSubpass`, `dstSubpass`, `srcStageMask`, `dstStageMask`, `srcAccessMask`, `dstAccessMask` to its previous/next subpass, and vice versa. Also, the index of following dependencies need to be increased.

   In `PMainCameraPass::draw(...)`, add a new argument according to declaration, then insert the command transition around [here](https://github.com/eilis-jung/Pilot/blob/ca5c1ade250e952b409c25900e42294a24ecf67c/engine/source/runtime/function/render/source/vulkan_manager/passes/main_camera.cpp#L2182).

   Also, in `PMainCameraPass::drawForward(...)`, add a new argument according to declaration, then insert the command transitionaround [here](https://github.com/eilis-jung/Pilot/blob/ca5c1ade250e952b409c25900e42294a24ecf67c/engine/source/runtime/function/render/source/vulkan_manager/passes/main_camera.cpp#L2278).

8. In `engine/source/runtime/function/render/source/vulkan_manager/passes/render_passes.cpp`, [here](https://github.com/eilis-jung/Pilot/blob/ca5c1ade250e952b409c25900e42294a24ecf67c/engine/source/runtime/function/render/source/vulkan_manager/passes/render_passes.cpp#L36), initialize the subpass. Remember to change the even/odd attachment reference here and onwards.

9. In `engine/source/runtime/function/render/source/vulkan_manager/vulkan_manager.cpp`, [line 135](https://github.com/eilis-jung/Pilot/blob/ca5c1ade250e952b409c25900e42294a24ecf67c/engine/source/runtime/function/render/source/vulkan_manager/vulkan_manager.cpp#L135) and [line 267](https://github.com/eilis-jung/Pilot/blob/ca5c1ade250e952b409c25900e42294a24ecf67c/engine/source/runtime/function/render/source/vulkan_manager/vulkan_manager.cpp#L267), add subpass as argument.

10. In `engine/shader/glsl/`, add glsl code.

11. In `engine/source/runtime/function/render/source/vulkan_manager/misc/descriptor_pool.cpp`, based on num of descriptors used, increase the pool size.


To add an attachment:


1. In `engine/source/runtime/function/render/include/render/vulkan_manager/vulkan_passes.h`, [~line 125](https://github.com/BoomingTech/Pilot/blob/381c55486ccec3c50e1adca6cdeb08405fc2d816/engine/source/runtime/function/render/include/render/vulkan_manager/vulkan_passes.h#L81), add another enum before `_main_camera_pass_depth`. Since it's a custom attachment, remember to increase `_main_camera_pass_custom_attachment_count` by 1, and `_main_camera_pass_attachment_count` also by 1.

2. In `engine/source/runtime/function/render/source/vulkan_manager/passes/main_camera.cpp`, [here](https://github.com/BoomingTech/Pilot/blob/381c55486ccec3c50e1adca6cdeb08405fc2d816/engine/source/runtime/function/render/source/vulkan_manager/passes/main_camera.cpp#L49), [here](https://github.com/BoomingTech/Pilot/blob/381c55486ccec3c50e1adca6cdeb08405fc2d816/engine/source/runtime/function/render/source/vulkan_manager/passes/main_camera.cpp#L117), [here](https://github.com/BoomingTech/Pilot/blob/381c55486ccec3c50e1adca6cdeb08405fc2d816/engine/source/runtime/function/render/source/vulkan_manager/passes/main_camera.cpp#L2042), [here](https://github.com/BoomingTech/Pilot/blob/381c55486ccec3c50e1adca6cdeb08405fc2d816/engine/source/runtime/function/render/source/vulkan_manager/passes/main_camera.cpp#L2107), [here](https://github.com/BoomingTech/Pilot/blob/381c55486ccec3c50e1adca6cdeb08405fc2d816/engine/source/runtime/function/render/source/vulkan_manager/passes/main_camera.cpp#L2224), add initialization & clearing.

3. In `engine/source/runtime/function/render/source/vulkan_manager/misc/descriptor_pool.cpp`, based on num of descriptors used, increase the pool size.

4. In subpass cpp file, add new VkDescriptorSetLayoutBinding. In `updateAfterFramebufferRecreate(...)`, add `VkDescriptorImageInfo`, `VkWriteDescriptorSet` and increase corresponding `.dstBinding`.
