import type { UAVConfiguration, UAVType } from './types';

export const uavTypes: { id: UAVType; name: string; description: string }[] = [
  { id: 'MT', name: 'Multi-rotor (МТ)', description: 'Versatile for hover and maneuverability.' },
  { id: 'ST', name: 'Fixed-wing (СТ)', description: 'Efficient for long-range surveillance.' },
  { id: 'SVVP', name: 'VTOL (СВВП)', description: 'Combines hover and long-range flight.' },
];

export const availablePayloads = [
  { id: 'livox_mid_360', name: 'Lidar: Livox Mid-360' },
  { id: 'livox_avia', name: 'Lidar: Livox Avia' },
  { id: 'course_camera', name: 'Course Camera' },
  { id: 'nadir_camera', name: 'Nadir Camera' },
];

export const initialUavConfigurations: UAVConfiguration[] = [
    {
        id: 'config-1',
        name: 'Recon Drone Alpha',
        type: 'MT',
        mass: 2.5,
        dimensions: '550x550x300mm',
        motorParams: '2212 920KV',
        payloads: ['livox_mid_360', 'course_camera']
    },
    {
        id: 'config-2',
        name: 'Survey Wing Bravo',
        type: 'ST',
        mass: 4.1,
        dimensions: '1600mm wingspan',
        motorParams: '3536 850KV',
        payloads: ['nadir_camera']
    },
];
