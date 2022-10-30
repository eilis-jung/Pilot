#include "runtime/function/controller/character_controller.h"

#include "runtime/core/base/macro.h"

#include "runtime/function/framework/object/object.h"
#include "runtime\function\framework\component\rigidbody\rigidbody_component.h"
#include "runtime/function/framework/component/motor/motor_component.h"
#include "runtime/function/framework/component/rigidbody/rigidbody_component.h"
#include "runtime/function/framework/component/transform/transform_component.h"
#include "runtime/function/framework/world/world_manager.h"
#include "runtime/function/global/global_context.h"
#include "runtime/function/physics/physics_scene.h"
#include "runtime/function/framework/level/level.h"
#include "runtime/function/framework/object/object.h"

namespace Piccolo
{
    CharacterController::CharacterController(const Capsule& capsule) : m_capsule(capsule)
    {
        m_rigidbody_shape                                    = RigidBodyShape();
        m_rigidbody_shape.m_geometry                         = PICCOLO_REFLECTION_NEW(Capsule);
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

        //Vector3 final_position = current_position + displacement;

        //Transform final_transform = Transform(final_position, Quaternion::IDENTITY, Vector3::UNIT_SCALE);

        //if (physics_scene->isOverlap(m_rigidbody_shape, final_transform.getMatrix()))
        //{
        //    final_position = current_position;
        //}

        //return final_position;



        std::vector<PhysicsHitInfo> hits;

        Transform world_transform =
            Transform(current_position + 0.1f * Vector3::UNIT_Z, Quaternion::IDENTITY, Vector3::UNIT_SCALE);

        Vector3 vertical_displacement   = displacement.z * Vector3::UNIT_Z;
        Vector3 horizontal_displacement = Vector3(displacement.x, displacement.y, 0.f);

        Vector3 vertical_direction   = vertical_displacement.normalisedCopy();
        Vector3 horizontal_direction = horizontal_displacement.normalisedCopy();

        Vector3 final_position = current_position;

        bool m_is_touch_ground = physics_scene->sweep(
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

        std::shared_ptr<Level> level = g_runtime_global_context.m_world_manager->getCurrentActiveLevel().lock();
        if (level == nullptr)
            return final_position;

        auto& gomap = level->getAllGObjects();

        // side pass
        if (physics_scene->sweep(m_rigidbody_shape,
                                 world_transform.getMatrix(),
                                 horizontal_direction,
                                 horizontal_displacement.length(),
                                 hits))
        {
            // Move to opposite direction if hit
            Vector3 opposite_direction = Vector3(0, 0, 0);

            
            std::vector<std::shared_ptr<GObject>> bodies;

            for (auto hit : hits)
            {
                for (auto go : gomap)
                {
                    RigidBodyComponent* rgc = go.second->tryGetComponent<RigidBodyComponent>("RigidBodyComponent");
                    if (rgc != nullptr && rgc->getRigidBodyID() == hit.body_id)
                    {
                        bodies.push_back(go.second);
                    }
                }
                opposite_direction += hit.hit_normal;
            }
            opposite_direction.normalise();
            horizontal_direction -= opposite_direction;
            final_position += horizontal_displacement.length() * horizontal_direction;

            for (auto body : bodies)
            {
                TransformComponent* tfc = body->tryGetComponent<TransformComponent>("TransformComponent");
                Vector3           curr_pos = tfc->getPosition();
                Vector3 final_horizontal_displacement = horizontal_displacement.length() * horizontal_direction;
                tfc->setPosition(curr_pos + final_horizontal_displacement);
            }
        }
        else
        {
            final_position += horizontal_displacement;
        }

        return final_position;
    }
} // namespace Piccolo
