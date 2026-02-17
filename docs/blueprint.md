# **App Name**: SkyPilot AI

## Core Features:

- UAV Model & Payload Editor: Allow users to select from predefined UAV types (multi-rotor, fixed-wing, VTOL), configure their physical and operational parameters (mass, dimensions, motor parameters), and define the attached sensor payloads (Lidar types, course camera, nadir camera). This feature also enables saving and managing custom UAV configurations.
- AI Mission Planner Tool: Facilitate flight mission planning on an aerial map where users can place waypoints. An integrated AI tool identifies and visualizes safe and restricted zones based on segmented map data. This tool then generates and displays an optimal, safe flight path and a 'safe corridor' for the UAV, accounting for obstacle avoidance and emergency fallback scenarios.
- Virtual Flight Simulator: Provide a real-time virtual simulation environment to execute planned missions. The simulator displays a 3D visualization of the UAV's movement in space, real-time sensor data feeds, its position on the map, and dynamic flight statistics. This allows for visual demonstration and testing of the control algorithms.
- Neural Network Re-training Console: An interface for initiating and monitoring the re-training process of the UAV's neural network control algorithms. This feature supports adapting the AI to new UAV parameters or mission specifics, providing real-time graphical feedback on training progress and performance metrics.

## Style Guidelines:

- Primary accent color: Vibrant sky blue (#00B3FF), conveying technological precision and the open sky.
- Background color: A very dark, subtle blue-gray (#15181A) to provide a sophisticated, technical feel suitable for data-heavy applications, making the primary and accent colors pop.
- Secondary accent color: A light, futuristic lavender (#C2B3FF) to complement the primary blue and highlight interactive elements or important data points.
- Headline font: 'Space Grotesk' (sans-serif) for its computerized, scientific feel, fitting the high-tech nature of UAV control.
- Body font: 'Inter' (sans-serif) paired with 'Space Grotesk' to provide a clear, neutral, and readable style for detailed data, reports, and longer text passages.
- Utilize minimalist, modern line-art icons that clearly represent technical concepts, UAV components, sensor types, and map controls, ensuring clarity and avoiding clutter.
- Implement a modular dashboard-style layout, enabling users to easily navigate between UAV configuration, mission planning, and simulation. Panels should be clearly delineated, promoting focus on current tasks and efficient access to data.
- Incorporate subtle and functional animations, such as smooth transitions for map panning/zooming, UAV movement in simulation, and real-time updates for training graphs, to enhance user experience and visual feedback without distracting from core information.