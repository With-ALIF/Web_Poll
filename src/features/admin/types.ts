export interface AdminUser {
  id: string;
  uid: string;
  email: string;
  displayName: string;
  role: string;
  permissions: string[];
  photoURL?: string;
  createdAt?: { seconds: number };
}

export interface PageDefinition {
  id: string;
  name: string;
  path: string;
  icon?: any;
}
