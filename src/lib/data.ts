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

export const controlAlgorithmsHierarchy = {
  lowLevel: {
    name: 'База алгоритмов низкоуровневого управления',
    classical: {
      name: 'База классических алгоритмов низкоуровневого управления',
      items: [
        { id: 'classic_low_stab', name: 'Алгоритм внутреннего контура стабилизации углового положения БВС', description: 'Обеспечивает базовую стабилизацию по всем осям.' },
        { id: 'classic_low_fail_id', name: 'Алгоритм идентификации отказов в контуре угловой стабилизации БВС', description: 'Обнаружение аномалий в работе датчиков и приводов.' },
        { id: 'classic_low_reconfig', name: 'Алгоритм реконфигурации системы управления БВС в случаях отказа', description: 'Изменение параметров управления при повреждениях или потере эффективности.' },
        { id: 'classic_low_adapt', name: 'Алгоритм адаптации САУ БВС при изменении стандартных условий применения', description: 'Подстройка под изменение внешней среды (ветер, давление).' },
      ]
    },
    neural: {
      name: 'Нейросетевые алгоритмы низкоуровневого управления БВС',
      items: [
        { id: 'neural_low_ctrl', name: 'Нейросетевой алгоритм низкоуровневого управления БВС', description: 'Использование обученных нейросетей для прямой стабилизации и управления.' },
      ]
    }
  },
  highLevel: {
    name: 'База алгоритмов высокоуровневого управления',
    items: [
      { id: 'high_sensor_fusion', name: 'Алгоритм комплексирования результатов анализа видеоинформации и БНС', description: 'Слияние данных компьютерного зрения и инерциальной навигации.' },
      { id: 'high_obstacle_avoidance', name: 'Алгоритм идентификации и облета препятствий с ИИ', description: 'Автоматическое распознавание и динамическое уклонение от препятствий.' },
      { id: 'high_path_planning', name: 'Алгоритм автоматического планирования маршрута полета с учетом безопасности', description: 'Обеспечение безопасности третьих лиц и инфраструктуры при отказах.' },
      { id: 'high_auto_landing', name: 'Алгоритм автоматической посадки на подвижную платформу', description: 'Прецизионная посадка на движущиеся объекты.' },
    ]
  }
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
        algorithmIds: ['classic_low_stab', 'high_sensor_fusion']
    },
    {
        id: 'config-2',
        name: 'Survey Wing Bravo',
        type: 'ST',
        mass: 4.1,
        dimensions: 'Размах 1600мм',
        motorParams: '3536 850KV',
        payloads: ['nadir_camera'],
        algorithmIds: ['classic_low_stab', 'high_path_planning']
    },
];
