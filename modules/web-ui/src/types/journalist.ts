interface TypeProps {
  id: string;
  name: string;
}

export interface FormatTypeProps extends TypeProps {}
export interface NewsTypeProps extends TypeProps {}
export interface RoleTypeProps extends TypeProps {}
export interface PublicationProps extends TypeProps {
  mediatypes?: Array<string>;
  tiers?: Array<string>;
  feed?: Array<PublicationFeedProps>;
}
export interface PublicationMediaTypeProps {
  mediatype: string;
}
export interface PublicationTierProps extends TypeProps {}
export interface PublicationFeedProps extends TypeProps {
  broken_url: string;
}
export interface RegionProps extends TypeProps {}
export interface RoleToFeedMapProps {
  [key: string]: string | null;
}

export interface JournalistProps {
  id?: string;
  uuid?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  valid_email?: boolean;
  user_approved?: boolean;
  phone?: string;
  ddi?: string;
  mobile?: string;
  linkedin?: string;
  twitter?: string;
  datasource?: string;
  format_types?: Array<FormatTypeProps>;
  news_types?: Array<NewsTypeProps>;
  role_types?: Array<RoleTypeProps>;
  roleToFeedMap?: RoleToFeedMapProps;
  publications?: Array<PublicationProps>;
  regions?: Array<RegionProps>;
}

export interface JournalistSearchProps {
  uuid: string;
  name: string;
  search: string;
  journalists: string;
  inputValue?: string;
}
