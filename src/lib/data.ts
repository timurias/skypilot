import type { UAVConfiguration, UAVType } from './types';

export const uavTypes: { id: UAVType; name: string; description: string }[] = [
  { id: 'MT', name: 'Мультироторный (МТ)', description: 'Универсален для зависания и маневренности.' },
  { id: 'ST', name: 'Самолетный (СТ)', description: 'Эффективен для дальнего наблюдения.' },
  { id: 'SVVP', name: 'СВВП (СВВП)', description: 'Сочетает зависание и дальний полет.' },
];

export const availablePayloads = [
  { id: 'livox_mid_360', name: 'Лидар: Livox Mid-360' },
  { id: 'livox_avia', name: 'Лидар: Livox Avia' },
  { id: 'course_camera', name: 'Курсовая камера' },
  { id: 'nadir_camera', name: 'Надирная камера' },
];

export const initialUavConfigurations: UAVConfiguration[] = [
    {
        id: 'config-1',
        name: 'Recon Drone Alpha',
        type: 'MT',
        mass: 2.5,
        dimensions: '550x550x300мм',
        motorParams: '2212 920KV',
        payloads: ['livox_mid_360', 'course_camera']
    },
    {
        id: 'config-2',
        name: 'Survey Wing Bravo',
        type: 'ST',
        mass: 4.1,
        dimensions: 'Размах 1600мм',
        motorParams: '3536 850KV',
        payloads: ['nadir_camera']
    },
];
