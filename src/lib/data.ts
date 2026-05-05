import type { UAVConfiguration, UAVType, ControlAlgorithm } from './types';

export const uavTypes: { id: UAVType; name: string; description: string }[] = [
  { id: 'MT', name: 'Мультироторный (МТ)', description: 'Универсален для зависания и маневренности.' },
  { id: 'ST', name: 'Самолетный (СТ)', description: 'Эффективен для дальнего наблюдения.' },
  { id: 'SVVP', name: 'СВВП (VTOL)', description: 'Сочетает зависание и дальний полет.' },
];

export const availablePayloads = [
  { id: 'livox_mid_360', name: 'Лидар: Livox Mid-360' },
  { id: 'livox_avia', name: 'Лидар: Livox Avia' },
  { id: 'course_camera', name: 'Курсовая камера' },
  { id: 'nadir_camera', name: 'Надирная камера' },
];

export const controlAlgorithms: Record<UAVType, ControlAlgorithm[]> = {
  MT: [
    { id: 'pid_classic', name: 'Классический PID', category: 'classical', description: 'Базовая стабилизация по всем осям.' },
    { id: 'robust_hinf', name: 'Robust H-infinity', category: 'classical', description: 'Устойчивость к порывам ветра до 15 м/с.' },
    { id: 'rl_fault_tolerant', name: 'RL Fault-Tolerant', category: 'neural', description: 'ИИ-управление при отказе одного из роторов.' },
    { id: 'deep_ppo', name: 'Deep PPO Navigator', category: 'neural', description: 'Нейросетевое планирование в плотной застройке.' },
  ],
  ST: [
    { id: 'lqr_optimal', name: 'LQR Оптимальный', category: 'classical', description: 'Минимизация расхода энергии на больших дистанциях.' },
    { id: 'mpc_cruise', name: 'MPC Cruise', category: 'classical', description: 'Прогнозное управление траекторией.' },
    { id: 'neuro_fuzzy', name: 'Neuro-Fuzzy Adaptive', category: 'neural', description: 'Адаптация к изменению центра масс.' },
  ],
  SVVP: [
    { id: 'hybrid_transition', name: 'Hybrid Transition', category: 'classical', description: 'Плавный переход из режима висения в горизонтальный полет.' },
    { id: 'smc_vtol', name: 'Sliding Mode Control', category: 'classical', description: 'Повышенная точность при вертикальной посадке.' },
    { id: 'rl_transition_ai', name: 'Transition AI', category: 'neural', description: 'Нейросетевая оптимизация переходных режимов при турбулентности.' },
  ],
};

export const initialUavConfigurations: UAVConfiguration[] = [
    {
        id: 'config-1',
        name: 'Recon Drone Alpha',
        type: 'MT',
        mass: 2.5,
        dimensions: '550x550x300мм',
        motorParams: '2212 920KV',
        payloads: ['livox_mid_360', 'course_camera'],
        algorithmId: 'pid_classic'
    },
    {
        id: 'config-2',
        name: 'Survey Wing Bravo',
        type: 'ST',
        mass: 4.1,
        dimensions: 'Размах 1600мм',
        motorParams: '3536 850KV',
        payloads: ['nadir_camera'],
        algorithmId: 'lqr_optimal'
    },
];
