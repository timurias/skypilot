export type UAVType = 'MT' | 'ST' | 'SVVP';

export type Payload = 'livox_mid_360' | 'livox_avia' | 'course_camera' | 'nadir_camera';

export type UAVConfiguration = {
  id: string;
  name: string;
  type: UAVType;
  mass: number;
  dimensions: string;
  motorParams: string;
  payloads: Payload[];
};
