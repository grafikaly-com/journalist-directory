export class UpdateJournalistsDto {
  ids: Array<string>;
  publicationMediatypes: Array<string>;
  publicationTiers: Array<string>;
  publicationIds: Array<number>;
  formatTypeIds: Array<number>;
  newsTypeIds: Array<number>;
  roleTypeIds: Array<number>;
  regionIds: Array<number>;
  selectAll: boolean;
  validEmail: boolean;
  enabled: boolean;
  sort: string;
  name: string;
}
