export class CreateJournalistDto {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  ddi: string;
  mobile: string;
  linkedin: string;
  twitter: string;
  datasource: string;
  publicationIds: Array<number>;
  formatTypeIds: Array<number>;
  newsTypeIds: Array<number>;
  roleTypeIds: Array<number>;
  roleToFeedMap?: Map<number, number>;
  regionIds: Array<number>;
}
