@echo off

cmake -S . -B build -DENABLE_PHYSICS_DEBUG_RENDERER=OFF
cmake --build build --config Release