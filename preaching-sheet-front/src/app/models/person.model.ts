export interface Person {
  id: number;
  full_name: string;
  role: string;
  active: boolean;
  created_at: string;
  update_timestamp: string;
  preaching_count: number;
}

export enum MinistryRole {
  AUXILIARY_PIONEER = 'AUXILIARY_PIONEER',
  REGULAR_PIONEER = 'REGULAR_PIONEER',
  PUBLISHER = 'PUBLISHER',
  MINISTERIAL_SERVANT = 'MINISTERIAL_SERVANT',
  ELDER = 'ELDER'
}

export const MinistryRoleLabels: Record<MinistryRole, string> = {
  [MinistryRole.AUXILIARY_PIONEER]: 'Precursor Auxiliar',
  [MinistryRole.REGULAR_PIONEER]: 'Precursor Regular',
  [MinistryRole.PUBLISHER]: 'Publicador',
  [MinistryRole.MINISTERIAL_SERVANT]: 'Siervo Ministerial',
  [MinistryRole.ELDER]: 'Anciano de congregación'
};
