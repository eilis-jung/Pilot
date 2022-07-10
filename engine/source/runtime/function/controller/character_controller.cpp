#include "runtime/function/controller/character_controller.h"

#include "runtime/core/base/macro.h"

#include "runtime/function/framework/component/motor/motor_component.h"
#include "runtime/function/framework/world/world_manager.h"
#include "runtime/function/global/global_context.h"
#include "runtime/function/physics/physics_scene.h"

namespace Pilot
{
    CharacterController::CharacterController(const Capsule& capsule) : m_capsule(capsule)
    {
        m_rigidbody_shape                                    = RigidBodyShape();
        m_rigidbody_shape.m_geometry                         = PILOT_REFLECTION_NEW(Capsule);
        *static_cast<Capsule*>(m_rigidbody_shape.m_geometry) = m_capsule;

        m_rigidbody_shape.m_type = RigidBodyShapeType::capsule;

        Quaternion orientation;
        orientation.fromAngleAxis(Radian(Degree(90.f)), Vector3::UNIT_X);

        m_rigidbody_shape.m_local_transform =
            Transform(Vector3(0, 0, capsule.m_half_height + capsule.m_radius), orientation, Vector3::UNIT_SCALE);
    }

    Vector3 CharacterController::move(const Vector3& current_position, const Vector3& displacement)
    {
        std::shared_ptr<PhysicsScene> physics_scene =
            g_runtime_global_context.m_world_manager->getCurrentActivePhysicsScene().lock();
        ASSERT(physics_scene);

        std::vector<PhysicsHitInfo> hits;

        Transform world_transform =
            Transform(current_position + 0.1f * Vector3::UNIT_Z, Quaternion::IDENTITY, Vector3::UNIT_SCALE);

        Vector3 vertical_displacement   = displacement.z * Vector3::UNIT_Z;
        Vector3 horizontal_displacement = Vector3(displacement.x, displacement.y, 0.f);

        Vector3 vertical_direction   = vertical_displacement.normalisedCopy();
        Vector3 horizontal_direction = horizontal_displacement.normalisedCopy();

        Vector3 final_position = current_position;

        m_is_touch_ground = physics_scene->sweep(
            m_rigidbody_shape, world_transform.getMatrix(), Vector3::NEGATIVE_UNIT_Z, 0.105f, hits);

        hits.clear();

        world_transform.m_position -= 0.1f * Vector3::UNIT_Z;

        // vertical pass
        if (physics_scene->sweep(m_rigidbody_shape,
                                 world_transform.getMatrix(),
                                 vertical_direction,
                                 vertical_displacement.length(),
                                 hits))
        {
            final_position += hits[0].hit_distance * vertical_direction;
        }
        else
        {
            final_position += vertical_displacement;
        }

        hits.clear();

        // side pass
        if (physics_scene->sweep(m_rigidbody_shape,
                                 world_transform.getMatrix(),
                                 horizontal_direction,
                                 horizontal_displacement.length(),
                                 hits))
        {
            // Move to opposite direction if hit
            // Hit normal is in the same direction as horizontal_direction
            Vector3 opposite_direction = Vector3();
            Vector3 hit_position       = Vector3(0, 0, -1);
            for (auto& hit : hits)
            {
                opposite_direction += hit.hit_normal;
                hit_position = (hit.hit_position.z > hit_position.z) ? hit.hit_position : hit_position;
            }

            float hit_diff = hit_position.z - world_transform.m_position.z;
            if (hit_diff < 0.3 && hit_diff > 0 && m_is_touch_ground == true)
            {
                // Walking up a stair
                m_is_touch_ground             = true;
                float hit_distance = final_position.distance(hit_position);
                if (hit_distance > horizontal_displacement.length())
                {
                    // Chara touches the stairs, but the body is not there yet.
                    Vector3 real_movement = hit_position - world_transform.m_position;
                    final_position += horizontal_direction * horizontal_displacement.length();
                    // Real z should be proportional to real movement
                    final_position.z = world_transform.m_position.z +
                                       real_movement.length() / hit_distance *
                                                                          horizontal_displacement.length();
                }
                else
                {
                    // When the chara is in air when going up stairs
                    final_position = hit_position;
                }
            }
            else
            {
                // Hitting a wall, or jumping into a wall then falling off
                opposite_direction.z = 0;
                opposite_direction.normalise();
                horizontal_direction -= opposite_direction;

                // No need to normalize horizontal_direction, since it will hugely increase displacement
                final_position += horizontal_displacement.length() * horizontal_direction;
            }
        }
        else
        {
            final_position += horizontal_displacement;
        }
        return final_position;
    }
} // namespace Pilot