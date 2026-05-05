# SkyPilot AI

This is a Next.js integrated suite for designing, simulating, and refining autonomous UAV control systems.

## Local Assets Setup

To enable the Virtual Flight Simulator and Mission Planner, you need to place your simulation assets in the `public` directory at the root of the project.

### Asset Paths
The application expects the following file structure:

- `public/map.tiff` - High-resolution mission map.
- `public/videos_simulations/Map_view.webm` - Overhead moving drone view.
- `public/videos_simulations/Depth_map.webm` - Depth map sensor visualization.
- `public/videos_simulations/Sensors.webm` - Integrated sensor cluster data.
- `public/videos_simulations/Lidar.webm` - Lidar point cloud visualization.
- `public/videos_simulations/rgb_view.mp4` - Main RGB camera feed.

## Getting Started

1.  **UAV Editor**: Define your drone models and sensor payloads.
2.  **Mission Planner**: Plot waypoints on the mission map.
3.  **Simulator**: Run real-time simulations with synchronized sensor feeds.
4.  **Re-training**: Use AI to analyze performance and suggest NN improvements.
