export type UAVType = 'MT' | 'ST' | 'SVVP';

export type Payload = 'livox_mid_360' | 'livox_avia' | 'course_camera' | 'nadir_camera';

export type ControlAlgorithm = {
  id: string;
  name: string;
  description: string;
};

export type UAVConfiguration = {
  id: string;
  name: string;
  type: UAVType;
  mass: number;
  dimensions: string;
  motorParams: string;
  payloads: Payload[];
  algorithmIds: string[];
};

export type Waypoint = { x: number; y: number };

export type RestrictedZone = {
  id: string;
  points: Waypoint[];
  color: string;
  name?: string;
};

export type MissionData = {
  waypoints: Waypoint[];
  restrictedZones: RestrictedZone[];
  flightPath: Waypoint[] | null;
  safeCorridor: Waypoint[] | null;
};
